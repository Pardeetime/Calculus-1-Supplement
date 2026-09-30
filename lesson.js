// Lesson framework: page chrome, math-input parser, answer checking, hint ladders,
// plots, worked examples and concept checks. Shared by every lesson page.
(function () {
  'use strict';

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const typeset = el => { if (window.katex) Calc.renderMath(el); };

  // =========================================================================
  // Math input parser: turns what a student types ("(3x-1)/2", "5pi/6",
  // "sqrt(3)/2", "ln 7 / 2") into a tree we can evaluate and display.
  // =========================================================================
  const FUNCS = {
    sin: Math.sin, cos: Math.cos, tan: Math.tan,
    sec: x => 1 / Math.cos(x), csc: x => 1 / Math.sin(x), cot: x => 1 / Math.tan(x),
    arcsin: Math.asin, arccos: Math.acos, arctan: Math.atan, asin: Math.asin, acos: Math.acos, atan: Math.atan,
    ln: Math.log, log: Math.log10, sqrt: Math.sqrt, abs: Math.abs, exp: Math.exp
  };
  const FN_NAMES = Object.keys(FUNCS).sort((a, b) => b.length - a.length);

  class InputError extends Error {}

  function normalize(src) {
    return String(src)
      .replace(/[−–—]/g, '-').replace(/[×·∙]/g, '*').replace(/÷/g, '/')
      .replace(/π/g, 'pi').replace(/√/g, 'sqrt').replace(/²/g, '^2').replace(/³/g, '^3')
      .replace(/∞/g, 'inf').replace(/infinity/gi, 'inf').replace(/\*\*/g, '^')
      .toLowerCase();
  }

  function tokenize(src) {
    const s = normalize(src);
    const toks = [];
    let i = 0;
    while (i < s.length) {
      const c = s[i];
      if (/\s/.test(c)) { i++; continue; }
      if (/[0-9.]/.test(c)) {
        const m = s.slice(i).match(/^(\d+\.?\d*|\.\d+)/);
        if (!m) throw new InputError('A decimal point needs a digit next to it.');
        toks.push({ t: 'num', v: parseFloat(m[0]) }); i += m[0].length; continue;
      }
      if (/[a-z]/.test(c)) {
        const rest = s.slice(i);
        const fn = FN_NAMES.find(n => rest.startsWith(n));
        if (fn) { toks.push({ t: 'fn', v: fn }); i += fn.length; continue; }
        if (rest.startsWith('pi')) { toks.push({ t: 'const', v: 'pi' }); i += 2; continue; }
        if (rest.startsWith('inf')) { toks.push({ t: 'const', v: 'inf' }); i += 3; continue; }
        if (c === 'e') { toks.push({ t: 'const', v: 'e' }); i++; continue; }
        toks.push({ t: 'var', v: c }); i++; continue;
      }
      if ('+-*/^(),'.includes(c)) { toks.push({ t: c }); i++; continue; }
      if (c === '[' || c === '{') { toks.push({ t: '(' }); i++; continue; }
      if (c === ']' || c === '}') { toks.push({ t: ')' }); i++; continue; }
      if (c === '|') throw new InputError('For absolute value, type abs( ), like abs(x-2).');
      if (c === '=') throw new InputError('Just enter the value or expression. There’s no need for an equals sign.');
      throw new InputError(`I don’t recognize the symbol “${c}”.`);
    }
    return toks;
  }

  function parse(src) {
    const toks = tokenize(src);
    if (!toks.length) throw new InputError('Type an answer first.');
    let i = 0;
    const peek = () => toks[i];
    const next = () => toks[i++];
    const starts = t => t && (t.t === 'num' || t.t === 'var' || t.t === 'const' || t.t === 'fn' || t.t === '(');

    function expr() {
      let n = term();
      while (peek() && (peek().t === '+' || peek().t === '-')) { const op = next().t; n = { k: 'bin', op, a: n, b: term() }; }
      return n;
    }
    function term() {
      let n = unary();
      for (;;) {
        const t = peek();
        if (t && (t.t === '*' || t.t === '/')) { next(); n = { k: 'bin', op: t.t, a: n, b: unary() }; }
        else if (starts(t)) n = { k: 'bin', op: '*', a: n, b: power(), imp: true };
        else break;
      }
      return n;
    }
    function unary() {
      const t = peek();
      if (t && t.t === '-') { next(); return { k: 'neg', a: unary() }; }
      if (t && t.t === '+') { next(); return unary(); }
      return power();
    }
    function power() {
      const base = primary();
      if (peek() && peek().t === '^') { next(); return { k: 'bin', op: '^', a: base, b: unary() }; }
      return base;
    }
    function primary() {
      const t = next();
      if (!t) throw new InputError('Your answer seems to stop early. Is something missing at the end?');
      if (t.t === 'num') return { k: 'num', v: t.v };
      if (t.t === 'const') return { k: 'const', v: t.v };
      if (t.t === 'var') return { k: 'var', v: t.v };
      if (t.t === '(') {
        const n = expr();
        if (!peek() || peek().t !== ')') throw new InputError('Check your parentheses. One of them isn’t closed.');
        next();
        return { k: 'group', a: n };
      }
      if (t.t === 'fn') {
        let pow = null;
        if (peek() && peek().t === '^') { next(); pow = primary(); }
        if (!peek()) throw new InputError(`${t.v} needs something to act on, like ${t.v}(x).`);
        const arg = peek().t === '(' ? primary() : power();
        const node = { k: 'fn', f: t.v, a: arg };
        return pow ? { k: 'bin', op: '^', a: node, b: pow } : node;
      }
      if (t.t === ')') throw new InputError('There’s an extra closing parenthesis.');
      if (t.t === ',') throw new InputError('This answer is a single value, so there’s no need for commas.');
      throw new InputError(`Something is missing before “${t.t}”.`);
    }
    const n = expr();
    if (i < toks.length) {
      const t = toks[i];
      throw new InputError(t.t === ')' ? 'There’s an extra closing parenthesis.' : t.t === ',' ? 'This answer is a single value, so there’s no need for commas.' : `I couldn’t read the part starting at “${t.t}”.`);
    }
    return n;
  }

  function evaluate(n, env) {
    switch (n.k) {
      case 'num': return n.v;
      case 'const': return n.v === 'pi' ? Math.PI : n.v === 'e' ? Math.E : Infinity;
      case 'var':
        if (!(n.v in env)) throw new InputError(`Your answer uses the variable “${n.v}”, which doesn’t belong here.`);
        return env[n.v];
      case 'group': return evaluate(n.a, env);
      case 'neg': return -evaluate(n.a, env);
      case 'fn': return FUNCS[n.f](evaluate(n.a, env));
      case 'bin': {
        const a = evaluate(n.a, env), b = evaluate(n.b, env);
        if (n.op === '+') return a + b;
        if (n.op === '-') return a - b;
        if (n.op === '*') return a * b;
        if (n.op === '/') return a / b;
        // Real powers of negatives with rational exponent p/q, q odd: (-8)^(1/3) = -2, (-8)^(2/3) = 4.
        if (a < 0 && !Number.isInteger(b)) {
          for (let q = 3; q <= 15; q += 2) {
            const p = Math.round(b * q);
            if (Math.abs(b * q - p) < 1e-9) return (p % 2 ? -1 : 1) * Math.pow(-a, b);
          }
        }
        return Math.pow(a, b);
      }
    }
    return NaN;
  }

  function varsIn(n, out = new Set()) {
    if (n.k === 'var') out.add(n.v);
    if (n.a) varsIn(n.a, out);
    if (n.b) varsIn(n.b, out);
    return out;
  }

  // Display what we understood the student to type.
  const strip = n => (n.k === 'group' ? n.a : n);
  const leftmost = n => (n.k === 'bin' ? leftmost(n.a) : n.k === 'group' ? n : n);
  const FN_TEX = { arcsin: '\\arcsin', arccos: '\\arccos', arctan: '\\arctan', asin: '\\sin^{-1}', acos: '\\cos^{-1}', atan: '\\tan^{-1}' };
  function toTex(n) {
    switch (n.k) {
      case 'num': return String(+n.v.toPrecision(12));
      case 'const': return n.v === 'pi' ? '\\pi' : n.v === 'e' ? 'e' : '\\infty';
      case 'var': return n.v;
      case 'group': return `\\left(${toTex(n.a)}\\right)`;
      case 'neg': return '-' + (n.a.k === 'bin' && (n.a.op === '+' || n.a.op === '-') ? `\\left(${toTex(n.a)}\\right)` : toTex(n.a));
      case 'fn': {
        const a = toTex(strip(n.a));
        if (n.f === 'sqrt') return `\\sqrt{${a}}`;
        if (n.f === 'abs') return `\\left|${a}\\right|`;
        if (n.f === 'exp') return `e^{${a}}`;
        return `${FN_TEX[n.f] || '\\' + n.f}\\left(${a}\\right)`;
      }
      case 'bin': {
        if (n.op === '/') return `\\frac{${toTex(strip(n.a))}}{${toTex(strip(n.b))}}`;
        if (n.op === '^') {
          const wrap = n.a.k === 'bin' || n.a.k === 'neg' || (n.a.k === 'fn' && n.a.f !== 'sqrt' && n.a.f !== 'abs');
          const base = wrap ? `\\left(${toTex(n.a)}\\right)` : toTex(n.a);
          return `${base}^{${toTex(strip(n.b))}}`;
        }
        if (n.op === '*') {
          const l = leftmost(n.b);
          const dot = !n.imp || l.k === 'num' || l.k === 'neg';
          return toTex(n.a) + (dot ? ' \\cdot ' : ' ') + toTex(n.b);
        }
        return `${toTex(n.a)} ${n.op} ${toTex(n.b)}`;
      }
    }
    return '';
  }

  // =========================================================================
  // Answer checkers. Each returns { state: 'correct' | 'approx' | 'near' | 'wrong', msg? }.
  // They never produce the answer itself, only a verdict.
  // =========================================================================
  const close = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol * Math.max(1, Math.abs(b));
  const hasDecimal = raw => /\d\.\d/.test(raw);

  function numberVerdict(v, raw, target, acceptDecimal, tol) {
    if (!Number.isFinite(v)) return { state: 'wrong' };
    if (close(v, target)) return { state: 'correct' };
    const nearEnough = Math.abs(v - target) <= (tol ?? Math.max(0.006, 0.003 * Math.abs(target)));
    if (nearEnough && hasDecimal(raw)) return { state: acceptDecimal ? 'correct' : 'approx' };
    return { state: 'wrong' };
  }

  function checkNumber(raw, spec) {
    const v = evaluate(parse(raw), {});
    return numberVerdict(v, raw, spec.value, spec.acceptDecimal, spec.tol);
  }

  function checkExpr(raw, spec) {
    const ast = parse(raw);
    const allowed = spec.vars || ['x'];
    const used = [...varsIn(ast)];
    const bad = used.find(v => !allowed.includes(v));
    if (bad) throw new InputError(`Write your answer using ${allowed.join(' and ')}. I see “${bad}” in it.`);
    if (!used.length && allowed.length && !spec.constOk) return { state: 'wrong', msg: `Your answer should depend on ${allowed[0]}.` };
    const [lo, hi] = spec.domain || [-3, 3];
    let valid = 0;
    for (let k = 0; k < 40 && valid < 10; k++) {
      const env = {};
      allowed.forEach((name, j) => { env[name] = lo + (hi - lo) * ((k * 0.6180339887 + j * 0.37 + 0.13) % 1); });
      const t = spec.fn(...allowed.map(v => env[v]));
      if (!Number.isFinite(t)) continue;
      const s = evaluate(ast, env);
      if (!Number.isFinite(s) || !close(s, t, 1e-7)) return { state: 'wrong' };
      valid++;
    }
    return { state: valid >= 4 ? 'correct' : 'wrong' };
  }

  function splitList(raw) {
    return normalize(raw).split(/[,;]|\band\b|\bor\b/).map(s => s.trim()).filter(Boolean);
  }

  function checkSet(raw, spec) {
    const items = splitList(raw);
    if (!items.length) throw new InputError('Type your answers separated by commas.');
    const vals = items.map(s => ({ v: evaluate(parse(s), {}), raw: s }));
    const left = spec.values.slice();
    let good = 0, approx = 0, extra = 0;
    for (const it of vals) {
      const j = left.findIndex(t => numberVerdict(it.v, it.raw, t, spec.acceptDecimal).state !== 'wrong');
      if (j < 0) { extra++; continue; }
      const st = numberVerdict(it.v, it.raw, left[j], spec.acceptDecimal).state;
      st === 'correct' ? good++ : approx++;
      left.splice(j, 1);
    }
    if (!extra && !left.length) return approx ? { state: 'approx' } : { state: 'correct' };
    if (!extra && left.length) return { state: 'near', msg: `Everything you listed works, but ${left.length === 1 ? 'there’s one more' : 'there are more'}. Check the whole interval again.` };
    if (extra && !left.length) return { state: 'near', msg: 'All of the answers are there, but something in your list doesn’t actually work. Test each one.' };
    return { state: 'wrong' };
  }

  function parseIntervals(raw) {
    const s = normalize(raw).replace(/\s+/g, '');
    if (/^(allrealnumbers|allreals|r|ℝ|\(-inf,inf\)|\(-inf,\+inf\))$/.test(s)) return [[-Infinity, Infinity, false, false]];
    const pieces = s.split(/∪|u/);
    return pieces.map(p => {
      const m = p.match(/^([\[(])(.+),(.+)([\])])$/);
      if (!m) throw new InputError('Use interval notation, like [2, 5) or (-inf, 3] U (4, inf).');
      const lo = evaluate(parse(m[2]), {}), hi = evaluate(parse(m[3]), {});
      if ((!Number.isFinite(lo) && m[1] === '[') || (!Number.isFinite(hi) && m[4] === ']'))
        throw new InputError('Infinity is never an included endpoint, so ∞ always gets a parenthesis, not a bracket.');
      if (!(lo < hi)) throw new InputError('In each interval, the left endpoint should be smaller than the right one.');
      return [lo, hi, m[1] === '[', m[4] === ']'];
    }).sort((a, b) => a[0] - b[0]);
  }

  function checkInterval(raw, spec) {
    const got = parseIntervals(raw), want = parseIntervals(spec.value);
    const eq = (a, b) => (a === b) || (Number.isFinite(a) && Number.isFinite(b) && close(a, b));
    const ends = got.length === want.length && got.every((g, i) => eq(g[0], want[i][0]) && eq(g[1], want[i][1]));
    if (!ends) return { state: 'wrong' };
    const brackets = got.every((g, i) => g[2] === want[i][2] && g[3] === want[i][3]);
    return brackets ? { state: 'correct' } : { state: 'near', msg: 'Your endpoints are right. Now check which endpoints are actually included: [ ] means included, ( ) means left out.' };
  }

  // Antiderivatives: correct up to an additive constant. Expects "+ C" for an indefinite answer
  // unless spec.noC is set (then the student may omit it).
  function checkAntideriv(raw, spec) {
    const ast = parse(raw);
    const used = [...varsIn(ast)];
    const bad = used.find(v => v !== 'x' && v !== 'c');
    if (bad) throw new InputError(`Use x for the variable and C for the constant. I see “${bad}”.`);
    const hasC = used.includes('c');
    const [lo, hi] = spec.domain || [-2, 2];
    let diff = null, valid = 0;
    for (let k = 0; k < 40 && valid < 8; k++) {
      const x = lo + (hi - lo) * ((k * 0.6180339887 + 0.13) % 1);
      const t = spec.fn(x); if (!Number.isFinite(t)) continue;
      const sv = evaluate(ast, { x, c: 0 }); if (!Number.isFinite(sv)) return { state: 'wrong' };
      const dv = sv - t;
      if (diff === null) diff = dv; else if (Math.abs(dv - diff) > 1e-6 * Math.max(1, Math.abs(t))) return { state: 'wrong' };
      valid++;
    }
    if (valid < 4) return { state: 'wrong' };
    if (hasC) {
      const x = (lo + hi) / 2, a = evaluate(ast, { x, c: 0 }), b = evaluate(ast, { x, c: 1 });
      if (!(Math.abs(b - a) > 1e-9)) return { state: 'near', msg: 'Your C doesn’t act as an added constant. Write it as “+ C” at the end.' };
    } else if (!spec.noC) return { state: 'near', msg: 'That’s one antiderivative. The question asks for the <b>most general</b> one, so add “+ C”.' };
    return { state: 'correct' };
  }

  // Limits: a number, inf / -inf, or DNE. "Undefined" is treated as a concept slip, not an answer.
  const DNE_RE = /^(dne|doesnotexist|doesntexist|nolimit|none)$/;
  function checkLimit(raw, spec) {
    const s = normalize(raw).replace(/[\s'’.]/g, '');
    if (/^(undefined|undef)$/.test(s)) throw new InputError('“Undefined” describes a function’s value at a point, not a limit. Decide whether the limit is a number, ∞, −∞, or does not exist (type DNE).');
    if (s === '0/0') throw new InputError('0/0 is the <i>form</i> you get from substituting, which is a signal to do more work, not the value of the limit.');
    const isDne = DNE_RE.test(s);
    if (spec.value === 'dne') return { state: isDne ? 'correct' : 'wrong' };
    if (isDne) return { state: 'wrong' };
    const v = evaluate(parse(raw), {});
    if (!Number.isFinite(spec.value)) return { state: v === spec.value ? 'correct' : 'wrong' };
    if (!Number.isFinite(v)) return { state: 'wrong' };
    return numberVerdict(v, raw, spec.value, spec.acceptDecimal, spec.tol);
  }

  const CHECKERS = { number: checkNumber, expr: checkExpr, set: checkSet, interval: checkInterval, limit: checkLimit, antideriv: checkAntideriv };
  const FORMATS = {
    number: 'Exact values are welcome: 7/2, sqrt(3), 5pi/6, ln(2), e^3.',
    expr: 'Type an expression, e.g. (x+1)^2/3 or sqrt(x-4). Use * if in doubt.',
    set: 'List every answer, separated by commas.',
    interval: 'Interval notation, e.g. [2, 5) U (5, inf). Type U for union and inf for ∞.',
    limit: 'A number (exact is best), inf or -inf, or DNE if the limit does not exist.',
    antideriv: 'An expression in x, ending with + C, e.g. x^3/3 + 2x + C.'
  };

  function previewTex(raw, type) {
    if (!raw.trim()) return '';
    try {
      if (type === 'interval') return '';
      if (type === 'limit' && DNE_RE.test(normalize(raw).replace(/[\s'’.]/g, ''))) return '\\text{does not exist}';
      if (type === 'set') return splitList(raw).map(s => toTex(parse(s))).join(',\\ ');
      return toTex(parse(raw));
    } catch (e) { return null; }
  }

  // =========================================================================
  // Practice problem with a hint ladder. No "show answer", ever.
  // cfg: { id, prompt, rungs: [[label, html], ...], answer: {type, ...},
  //        mistakes: [{ ...same shape as answer, msg }], success, label }
  // =========================================================================
  let problemCount = 0;
  function practice(host, cfg) {
    const n = cfg.n ?? ++problemCount;
    const type = cfg.answer.type;
    const rungs = cfg.rungs || [];
    const el = document.createElement('article');
    el.className = 'card practice';
    el.id = 'p-' + cfg.id;
    el.innerHTML = `
      <div class="p-head"><span class="p-num">Problem ${n}${cfg.tag ? ' · ' + esc(cfg.tag) : ''}</span><span class="p-solved" hidden>✓ Solved</span></div>
      <div class="p-prompt">${cfg.prompt}</div>
      <div class="rungs"></div>
      <div class="hint-list" aria-live="polite"></div>
      <form class="answer-row" autocomplete="off">
        <label for="in-${cfg.id}">${esc(cfg.label || 'Your answer')}:</label>
        <input id="in-${cfg.id}" type="text" spellcheck="false" autocapitalize="off" placeholder="${esc(cfg.placeholder || '')}">
        <button class="btn primary" type="submit">Check</button>
      </form>
      <div class="p-format">${esc(cfg.format || FORMATS[type])}</div>
      <div class="p-preview" aria-live="off"></div>
      <div class="feedback" aria-live="polite"></div>`;
    host.appendChild(el);

    const $ = s => el.querySelector(s);
    const input = $('input'), fb = $('.feedback'), preview = $('.p-preview');
    let opened = 0, attempts = 0;

    function paintRungs() {
      $('.rungs').innerHTML = rungs.map((r, i) =>
        `<button type="button" class="btn rung" data-i="${i}" aria-expanded="${i < opened}" ${i > opened ? 'disabled' : ''}>${i < opened ? '✓ ' : ''}${esc(r[0])}</button>`).join('');
      const list = $('.hint-list');
      list.innerHTML = rungs.slice(0, opened).map(r => `<div class="hint"><b>${esc(r[0])}</b>${r[1]}</div>`).join('');
      typeset(list);
    }
    $('.rungs').addEventListener('click', e => {
      const b = e.target.closest('button[data-i]');
      if (b && +b.dataset.i === opened) { opened++; paintRungs(); }
    });

    input.addEventListener('input', () => {
      const tex = previewTex(input.value, type);
      if (!tex) { preview.textContent = ''; return; }
      preview.innerHTML = 'Reads as: <span></span>';
      try { katex.render(tex, preview.querySelector('span'), { throwOnError: false }); } catch (e) { preview.textContent = ''; }
    });

    function say(kind, html) { fb.className = 'feedback ' + kind; fb.innerHTML = html; typeset(fb); }
    function nextRung() { return opened < rungs.length ? ` Try the <b>${esc(rungs[opened][0])}</b> button.` : ''; }
    function markSolved() { $('.p-solved').hidden = false; if (cfg.id) Calc.Solved.add(cfg.id); }

    if (cfg.id && Calc.Solved.has(cfg.id)) $('.p-solved').hidden = false;

    $('form').addEventListener('submit', e => {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;
      let res;
      try { res = CHECKERS[type](raw, cfg.answer); }
      catch (err) { say('try', err instanceof InputError ? err.message : 'I couldn’t read that. Check the format note below the box.'); return; }
      attempts++;
      if (res.state === 'correct' && cfg.form && !cfg.form(raw)) {
        say('near', cfg.formMsg || 'That’s equivalent, but not in the form the question asks for.');
        return;
      }
      if (res.state === 'correct') {
        say('good', `<b class="tag-good">Correct.</b> ${cfg.success || ''}`);
        markSolved();
        return;
      }
      if (res.state === 'approx') {
        say('near', 'That’s a good decimal approximation. Calculus usually expects the <b>exact</b> value, so can you write it with fractions, roots, π, e or ln instead?');
        return;
      }
      for (const m of cfg.mistakes || []) {
        let hit = false;
        try { hit = CHECKERS[type](raw, Object.assign({}, cfg.answer, m)).state === 'correct'; } catch (e2) { /* ignore */ }
        if (hit) { say('try', `<b class="tag-try">Not quite.</b> ${m.msg}${nextRung()}`); return; }
      }
      if (res.state === 'near') { say('near', res.msg); return; }
      if (res.msg) { say('try', `<b class="tag-try">Not quite.</b> ${res.msg}${nextRung()}`); return; }
      if (attempts >= 3 && opened >= rungs.length) {
        say('try', '<b class="tag-try">Still not matching.</b> Re-read the <a href="#build">Build it</a> section, then rework the problem on paper from the start. A dropped sign or a missed square is the usual culprit.');
      } else {
        say('try', `<b class="tag-try">Not quite.</b> Check your work step by step.${nextRung() || ' Go back through the hints and compare them with each line of your work.'}`);
      }
    });

    paintRungs();
    return el;
  }

  // =========================================================================
  // Drill: endless generated problems, each answer checked, never shown.
  // cfg: { title, intro, label, vars, make: () => ({ q, d, domain, hints: [...], mistakes: [{ fn, msg }] }) }
  // =========================================================================
  function drill(host, cfg) {
    const vars = cfg.vars || ['x'];
    const el = document.createElement('div');
    el.className = 'card widget';
    el.style.maxWidth = '48em';
    el.innerHTML = `
      <div class="p-head"><span class="p-num">Drill · ${esc(cfg.title)}</span><span class="chip">Streak <b class="d-streak">0</b> · Best <b class="d-best">0</b></span></div>
      <p class="prompt">${cfg.intro || 'Unlimited fresh problems. Each answer is checked, and none are ever shown.'}</p>
      <div class="display d-q" style="font-size:20px"></div>
      <form class="answer-row" autocomplete="off">
        <label>${esc(cfg.label || 'Derivative')}:</label>
        <input type="text" spellcheck="false" autocapitalize="off" aria-label="${esc(cfg.label || 'Derivative')}">
        <button class="btn primary" type="submit">Check</button>
        <button class="btn d-hint" type="button">Hint</button>
        <button class="btn d-new" type="button">New one</button>
      </form>
      <div class="p-format">${esc(cfg.format || (cfg.antideriv ? FORMATS.antideriv : FORMATS.expr))}</div>
      <div class="p-preview"></div>
      <div class="feedback" aria-live="polite"></div>`;
    host.appendChild(el);
    const $ = s => el.querySelector(s), input = $('input'), fb = $('.feedback'), preview = $('.p-preview');
    let cur, hintAt = 0, streak = 0, best = 0, missed = false, timer;
    const say = (k, h) => { fb.className = 'feedback ' + k; fb.innerHTML = h; typeset(fb); };
    function next() {
      clearTimeout(timer);
      let n; do { n = cfg.make(); } while (cur && n.q === cur.q);
      cur = n; hintAt = 0; missed = false;
      const q = $('.d-q'); q.innerHTML = `\\[ ${cur.q} \\]`; typeset(q);
      input.value = ''; preview.textContent = ''; fb.className = 'feedback'; fb.innerHTML = '';
    }
    input.addEventListener('input', () => {
      const tex = previewTex(input.value, 'expr');
      if (!tex) { preview.textContent = ''; return; }
      preview.innerHTML = 'Reads as: <span></span>';
      try { katex.render(tex, preview.querySelector('span'), { throwOnError: false }); } catch (e) { preview.textContent = ''; }
    });
    $('form').addEventListener('submit', e => {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;
      const spec = { vars, fn: cur.d, domain: cur.domain || [-2, 2], constOk: true };
      const chk = cfg.antideriv ? checkAntideriv : checkExpr;
      let res;
      try { res = chk(raw, spec); } catch (err) { say('try', err instanceof InputError ? err.message : 'I couldn’t read that.'); return; }
      if (res.state === 'near') { say('near', res.msg); return; }
      if (res.state === 'correct') {
        streak = missed ? 0 : streak + 1; best = Math.max(best, streak);
        $('.d-streak').textContent = streak; $('.d-best').textContent = best;
        say('good', `<b class="tag-good">Correct.</b> ${missed ? 'Streaks count first-try answers, so this one starts you over. ' : ''}Next one coming…`);
        timer = setTimeout(next, 1300);
        return;
      }
      missed = true;
      for (const m of cur.mistakes || []) {
        let hit = false;
        try { hit = chk(raw, Object.assign({}, spec, { fn: m.fn, noC: true })).state === 'correct'; } catch (e2) { /* ignore */ }
        if (hit) { say('try', `<b class="tag-try">Not quite.</b> ${m.msg}`); return; }
      }
      say('try', `<b class="tag-try">Not quite.</b> ${hintAt < (cur.hints || []).length ? 'Try the Hint button.' : 'Recheck each piece of your work.'}`);
    });
    $('.d-hint').addEventListener('click', () => {
      const hs = cur.hints || [];
      if (!hs.length) return;
      missed = true;
      say('near', `<b>Hint ${Math.min(hintAt + 1, hs.length)} of ${hs.length}.</b> ${hs[Math.min(hintAt, hs.length - 1)]}`);
      hintAt++;
    });
    $('.d-new').addEventListener('click', () => { streak = 0; $('.d-streak').textContent = 0; next(); });
    next();
    el.current = () => cur; // for automated checks of generated derivatives
    return el;
  }

  // =========================================================================
  // Worked example: reveal one step at a time, predicting each step first.
  // cfg: { problem, steps: [{ show, why }] }
  // =========================================================================
  function worked(host, cfg) {
    const el = document.createElement('div');
    el.className = 'card worked';
    el.innerHTML = `
      <div class="eyebrow">Worked example</div>
      <div class="wx-problem">${cfg.problem}</div>
      <ol class="wx-steps"></ol>
      <div class="wx-foot"><button class="btn primary" type="button">Show step 1</button><span class="wx-note">Before each click, decide what <i>you</i> would do next.</span></div>`;
    host.appendChild(el);
    const list = el.querySelector('.wx-steps'), btn = el.querySelector('button'), note = el.querySelector('.wx-note');
    let shown = 0;
    btn.addEventListener('click', () => {
      const s = cfg.steps[shown++];
      const li = document.createElement('li');
      li.innerHTML = `<div><div>${s.show}</div>${s.why ? `<div class="why">${s.why}</div>` : ''}</div>`;
      list.appendChild(li);
      typeset(li);
      if (shown >= cfg.steps.length) { btn.hidden = true; note.textContent = cfg.done || 'That’s the complete solution. Try the next one yourself.'; }
      else btn.textContent = `Show step ${shown + 1}`;
    });
    return el;
  }

  // =========================================================================
  // Concept checks (multiple choice) and true/false sorters.
  // =========================================================================
  function quiz(host, items) {
    items.forEach((it, qi) => {
      const el = document.createElement('div');
      el.className = 'card q-card';
      el.innerHTML = `<div class="q">${it.q}</div><div class="choices">${it.choices.map((c, i) =>
        `<button type="button" class="choice" data-i="${i}">${c.t}</button>`).join('')}</div><div class="q-why" aria-live="polite"></div>`;
      host.appendChild(el);
      const why = el.querySelector('.q-why');
      el.querySelector('.choices').addEventListener('click', e => {
        const b = e.target.closest('.choice');
        if (!b || b.classList.contains('right')) return;
        const c = it.choices[+b.dataset.i];
        b.classList.add(c.ok ? 'right' : 'wrong');
        why.innerHTML = (c.ok ? '<b style="color:var(--good)">Yes.</b> ' : '<b style="color:var(--warn)">Not this one.</b> ') + (c.why || '');
        if (c.ok) el.querySelectorAll('.choice').forEach(x => { x.disabled = true; });
        typeset(why);
      });
    });
  }

  function trueFalse(host, items) {
    items.forEach(it => {
      const el = document.createElement('div');
      el.className = 'card tf-row';
      el.innerHTML = `<div class="stmt">${it.s}</div><div class="seg" role="group" aria-label="True or false"><button type="button" data-v="1">True</button><button type="button" data-v="0">False</button></div><div class="why" aria-live="polite"></div>`;
      host.appendChild(el);
      el.querySelector('.seg').addEventListener('click', e => {
        const b = e.target.closest('button');
        if (!b) return;
        const right = (b.dataset.v === '1') === it.ok;
        el.querySelectorAll('.seg button').forEach(x => x.setAttribute('aria-pressed', String(x === b)));
        el.classList.toggle('ok', right); el.classList.toggle('no', !right);
        el.querySelector('.why').innerHTML = right ? `<b style="color:var(--good)">Right.</b> ${it.why}` : '<b style="color:var(--warn)">Look again.</b> Test it with actual numbers before deciding.';
        typeset(el.querySelector('.why'));
      });
    });
  }

  // =========================================================================
  // SVG plotting helper.
  // =========================================================================
  let plotSeq = 0;
  function niceStep(range) {
    const raw = range / 10, p = Math.pow(10, Math.floor(Math.log10(raw))), m = raw / p;
    return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p;
  }
  function Plot(svg, o) {
    const W = o.w || 520, H = o.h || 340, id = 'clip' + (++plotSeq);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.classList.add('plot');
    let [x0, x1] = o.x, [y0, y1] = o.y;
    const f2 = v => v.toFixed(1);
    const p = {
      W, H,
      sx: x => (x - x0) / (x1 - x0) * W,
      sy: y => H - (y - y0) / (y1 - y0) * H,
      ix: px => x0 + px / W * (x1 - x0),
      iy: py => y0 + (H - py) / H * (y1 - y0),
      range(x, y) { [x0, x1] = x; [y0, y1] = y; },
      get x() { return [x0, x1]; }, get y() { return [y0, y1]; },
      grid() {
        const xs = o.xstep || niceStep(x1 - x0), ys = o.ystep || niceStep(y1 - y0);
        let g = '';
        for (let x = Math.ceil(x0 / xs) * xs; x <= x1 + 1e-9; x += xs) g += `<line class="grid" x1="${f2(p.sx(x))}" y1="0" x2="${f2(p.sx(x))}" y2="${H}"/>`;
        for (let y = Math.ceil(y0 / ys) * ys; y <= y1 + 1e-9; y += ys) g += `<line class="grid" x1="0" y1="${f2(p.sy(y))}" x2="${W}" y2="${f2(p.sy(y))}"/>`;
        const ay = Math.min(H - 2, Math.max(2, p.sy(0))), ax = Math.min(W - 2, Math.max(2, p.sx(0)));
        g += `<line class="axis" x1="0" y1="${f2(ay)}" x2="${W}" y2="${f2(ay)}"/><line class="axis" x1="${f2(ax)}" y1="0" x2="${f2(ax)}" y2="${H}"/>`;
        if (o.ticks !== false) {
          const xl = o.xticks || [], yl = o.yticks || [];
          const xt = xl.length ? xl : [];
          // Thin out automatic labels so they never crowd (about 36px apart across, 20px up).
          const kx = Math.max(1, Math.ceil(36 / Math.abs(p.sx(xs) - p.sx(0)))), ky = Math.max(1, Math.ceil(20 / Math.abs(p.sy(0) - p.sy(ys))));
          if (!xl.length) for (let x = Math.ceil(x0 / xs) * xs; x <= x1 + 1e-9; x += xs) if (Math.abs(x) > 1e-9 && Math.round(x / xs) % kx === 0) xt.push({ v: x, l: +x.toFixed(6) });
          const yt = yl.length ? yl : [];
          if (!yl.length) for (let y = Math.ceil(y0 / ys) * ys; y <= y1 + 1e-9; y += ys) if (Math.abs(y) > 1e-9 && Math.round(y / ys) % ky === 0) yt.push({ v: y, l: +y.toFixed(6) });
          const ty = ay > H - 20 ? ay - 6 : ay + 15, tx = ax < 30 ? ax + 5 : ax - 5, anchor = ax < 30 ? 'start' : 'end';
          xt.forEach(t => { const px = p.sx(t.v); if (px > 8 && px < W - 8) g += `<text class="tick" x="${f2(px)}" y="${f2(ty)}" text-anchor="middle">${t.l}</text>`; });
          yt.forEach(t => { const py = p.sy(t.v); if (py > 8 && py < H - 8) g += `<text class="tick" x="${f2(tx)}" y="${f2(py + 4)}" text-anchor="${anchor}">${t.l}</text>`; });
        }
        return g;
      },
      // Function graph; breaks the path at gaps, asymptotes and undefined points.
      fn(f, cls = 'c1', opt = {}) {
        const a = opt.from ?? x0, b = opt.to ?? x1, n = opt.n || 400, span = y1 - y0;
        let d = '', pen = false, prev = null;
        for (let i = 0; i <= n; i++) {
          const x = a + (b - a) * i / n, y = f(x);
          if (!Number.isFinite(y) || y > y1 + 4 * span || y < y0 - 4 * span || (prev !== null && Math.abs(y - prev) > 2 * span)) { pen = false; prev = Number.isFinite(y) ? y : null; continue; }
          d += (pen ? 'L' : 'M') + f2(p.sx(x)) + ' ' + f2(p.sy(y));
          pen = true; prev = y;
        }
        return `<path class="${cls}" d="${d}"${opt.attr || ''}/>`;
      },
      param(fx, fy, t0, t1, cls = 'c1', n = 300) {
        let d = '';
        for (let i = 0; i <= n; i++) { const t = t0 + (t1 - t0) * i / n; d += (i ? 'L' : 'M') + f2(p.sx(fx(t))) + ' ' + f2(p.sy(fy(t))); }
        return `<path class="${cls}" d="${d}"/>`;
      },
      seg: (xa, ya, xb, yb, cls = 'ghost') => `<line class="${cls}" x1="${f2(p.sx(xa))}" y1="${f2(p.sy(ya))}" x2="${f2(p.sx(xb))}" y2="${f2(p.sy(yb))}"/>`,
      dot: (x, y, cls = 'c1', r = 6, attr = '') => `<circle class="dot ${cls}" cx="${f2(p.sx(x))}" cy="${f2(p.sy(y))}" r="${r}"${attr}/>`,
      text: (x, y, s, cls = 'lbl', dx = 0, dy = 0, anchor = 'start') => `<text class="${cls}" x="${f2(p.sx(x) + dx)}" y="${f2(p.sy(y) + dy)}" text-anchor="${anchor}">${s}</text>`,
      poly: (pts, cls) => `<path class="${cls}" d="${pts.map((q, i) => (i ? 'L' : 'M') + f2(p.sx(q[0])) + ' ' + f2(p.sy(q[1]))).join('')}Z"/>`,
      draw(content, after = '') {
        svg.innerHTML = `<defs><clipPath id="${id}"><rect width="${W}" height="${H}"/></clipPath></defs><g clip-path="url(#${id})">${p.grid()}${content}</g>${after}`;
      },
      fromEvent(e) {
        const r = svg.getBoundingClientRect();
        return { x: p.ix((e.clientX - r.left) / r.width * W), y: p.iy((e.clientY - r.top) / r.height * H) };
      },
      // Drag any element with data-handle="name"; onMove(name, {x, y}).
      onDrag(onMove, opts = {}) {
        let active = null;
        svg.addEventListener('pointerdown', e => {
          let h = e.target.closest('[data-handle]');
          if (!h) {
            // Forgiving hit area (fingers are wide): grab the nearest handle within 28 CSS px.
            let best = 28;
            svg.querySelectorAll('[data-handle]').forEach(el => {
              const r = el.getBoundingClientRect();
              const dist = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
              if (r.width < 60 && dist < best) { best = dist; h = el; }
            });
          }
          if (h) active = h.dataset.handle;
          else if (opts.anywhere) active = opts.anywhere;
          if (!active) return;
          svg.setPointerCapture(e.pointerId);
          onMove(active, p.fromEvent(e));
          e.preventDefault();
        });
        svg.addEventListener('pointermove', e => { if (active) onMove(active, p.fromEvent(e)); });
        const stop = () => { active = null; };
        svg.addEventListener('pointerup', stop);
        svg.addEventListener('pointercancel', stop);
      }
    };
    return p;
  }

  // =========================================================================
  // Page chrome: header, hero, step bar, confidence rating, prev/next.
  // =========================================================================
  const STEP_NAMES = { see: 'See it', build: 'Build it', try: 'Try it', check: 'Check yourself' };
  const CONF = [
    [1, 'Shaky', 'That’s useful to know. Revisit Build it, and come back to the problems in a day or two. Spacing out practice helps it stick.'],
    [2, 'Getting there', 'Good. One more pass through the problems tomorrow, without the hints, will lock it in.'],
    [3, 'Got it', 'Great. This will come back constantly, so it pays to know it cold.']
  ];

  function initPage() {
    const topicId = document.body.dataset.topic;
    const flat = [];
    UNITS.forEach(u => u.topics.forEach((t, i) => flat.push({ u, t, i })));
    const idx = flat.findIndex(x => x.t.id === topicId);
    if (idx < 0) return;
    const { u, t, i } = flat[idx];
    document.body.style.setProperty('--uc', u.color);

    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `<div class="wrap">
      <a class="brand" href="index.html" aria-label="Dashboard"><span class="brand-mark">∫</span></a>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Dashboard</a><span class="sep">/</span><a href="index.html#${u.id}">Unit ${u.num} · ${esc(u.title)}</a><span class="sep last">/</span><span class="here">${esc(t.title)}</span></nav>
      <span class="header-spacer"></span>
      <button class="icon-btn" id="themeBtn" type="button" aria-label="Toggle theme"></button></div>`;
    document.body.prepend(header);

    const main = document.querySelector('main');
    const steps = [...main.querySelectorAll('section.step')];
    const hero = document.createElement('div');
    hero.className = 'wrap';
    hero.innerHTML = `<section class="lesson-hero">
      <div class="eyebrow">Unit ${u.num} · Topic ${u.num}.${i + 1}</div>
      <h1>${esc(t.title)}</h1>
      <p class="big-q">${esc(t.q)}</p>
      <div class="chips">${t.mins ? `<span class="chip">About ${t.mins} min</span>` : ''}<span class="chip">${steps.length} steps</span><span class="chip">Hints available</span></div>
    </section>`;
    header.after(hero);

    const bar = document.createElement('nav');
    bar.className = 'stepbar';
    bar.setAttribute('aria-label', 'Lesson steps');
    bar.innerHTML = `<ol>${steps.map((s, k) => `<li><a href="#${s.id}"><span>${k + 1}</span>${STEP_NAMES[s.id] || s.id}</a></li>`).join('')}</ol>`;
    hero.after(bar);

    steps.forEach((s, k) => {
      const head = document.createElement('div');
      head.className = 'step-head';
      head.innerHTML = `<span class="sn">Step ${k + 1} · ${STEP_NAMES[s.id] || ''}</span><h2>${s.dataset.title || ''}</h2>`;
      s.prepend(head);
    });

    // Confidence rating (shared with the dashboard) + pager.
    const check = document.getElementById('check') || main;
    const wrap = document.createElement('div');
    wrap.className = 'card wrapup';
    wrap.innerHTML = `<h3>How confident do you feel?</h3><p class="muted" style="margin:0">Be honest, since this only feeds your own study plan on the dashboard.</p>
      <div class="conf" role="group" aria-label="Confidence">${CONF.map(c => `<button type="button" data-level="${c[0]}" aria-pressed="false">${c[1]}</button>`).join('')}</div>
      <div class="conf-msg" aria-live="polite"></div>`;
    check.appendChild(wrap);
    const paintConf = () => {
      const lvl = Calc.Progress.get(t.id);
      wrap.querySelectorAll('.conf button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.level === lvl)));
      wrap.querySelector('.conf-msg').textContent = lvl ? CONF[lvl - 1][2] : '';
    };
    wrap.querySelector('.conf').addEventListener('click', e => {
      const b = e.target.closest('button');
      if (!b) return;
      const lvl = +b.dataset.level;
      Calc.Progress.set(t.id, Calc.Progress.get(t.id) === lvl ? 0 : lvl);
      paintConf();
    });
    paintConf();

    const prev = flat[idx - 1], next = flat[idx + 1];
    const link = (x, cls, label) => x.t.href
      ? `<a class="card ${cls}" href="${x.t.href}"><small>${label} · ${x.u.num}.${x.i + 1}</small>${esc(x.t.title)}</a>`
      : `<a class="card ${cls}" href="index.html#${x.u.id}"><small>${label} · Unit ${x.u.num} (coming soon)</small>${esc(x.u.title)}</a>`;
    const pager = document.createElement('nav');
    pager.className = 'pager';
    pager.setAttribute('aria-label', 'Lesson navigation');
    pager.innerHTML = (prev ? link(prev, 'prev', '← Previous') : '') + (next ? link(next, 'next', 'Next →') : '');
    check.appendChild(pager);

    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = '<div class="wrap"><p>An independent study guide for Calculus I, not affiliated with any college or university. Your instructor’s syllabus and course materials always come first.</p><p>Your progress is saved only in this browser.</p></div>';
    document.body.appendChild(footer);

    // Highlight the current step in the bar.
    const links = [...bar.querySelectorAll('a')];
    const spy = () => {
      let cur = steps[0];
      steps.forEach(s => { if (s.getBoundingClientRect().top < 160) cur = s; });
      links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur.id));
    };
    addEventListener('scroll', spy, { passive: true });
    spy();
  }

  // Study-tool pages: <body data-tool="Name" data-sub="One-line description">
  function initTool() {
    const name = document.body.dataset.tool;
    if (!name) return;
    document.body.style.setProperty('--uc', 'var(--accent)');
    const header = document.createElement('header');
    header.className = 'site-header';
    header.innerHTML = `<div class="wrap">
      <a class="brand" href="index.html" aria-label="Dashboard"><span class="brand-mark">∫</span></a>
      <nav class="crumbs" aria-label="Breadcrumb"><a href="index.html">Dashboard</a><span class="sep">/</span><a href="index.html#tools">Study tools</a><span class="sep last">/</span><span class="here">${esc(name)}</span></nav>
      <span class="header-spacer"></span>
      <button class="icon-btn" id="themeBtn" type="button" aria-label="Toggle theme"></button></div>`;
    document.body.prepend(header);
    const hero = document.createElement('div');
    hero.className = 'wrap';
    hero.innerHTML = `<section class="lesson-hero"><div class="eyebrow">Study tool</div><h1>${esc(name)}</h1><p class="big-q">${esc(document.body.dataset.sub || '')}</p></section>`;
    header.after(hero);
    const footer = document.createElement('footer');
    footer.className = 'site-footer';
    footer.innerHTML = '<div class="wrap"><p>An independent study guide for Calculus I, not affiliated with any college or university. Your instructor’s syllabus and course materials always come first.</p><p>Your progress is saved only in this browser.</p></div>';
    document.body.appendChild(footer);
  }

  initPage();
  initTool();

  const readyFns = [];
  document.addEventListener('DOMContentLoaded', () => {
    readyFns.forEach(fn => fn());
    Calc.renderMath();
  });

  window.Lesson = {
    parse, evaluate, toTex, InputError, check: CHECKERS,
    practice, worked, quiz, trueFalse, drill, Plot, esc, typeset,
    ready(fn) { readyFns.push(fn); },
    // Mount a list of practice problems into a host element.
    practiceList(host, list) { list.forEach(cfg => practice(host, cfg)); },
    // Table of f(x) as x approaches a from the left and the right.
    approachTable(f, a, opt = {}) {
      const hs = opt.hs || [0.1, 0.01, 0.001, 0.0001], d = opt.digits ?? 6;
      const fmt = v => Number.isFinite(v) ? (Math.abs(v) >= 1e6 ? v.toExponential(3) : (+v.toFixed(d)).toString()) : (v === Infinity || v === -Infinity ? 'huge' : 'undefined');
      const xs = v => +v.toFixed(8);
      const rows = hs.map(h => `<tr><td class="mono">${xs(a - h)}</td><td class="mono">${fmt(f(a - h))}</td><td class="mono">${xs(a + h)}</td><td class="mono">${fmt(f(a + h))}</td></tr>`).join('');
      return `<div class="table-wrap"><table class="ref"><tr><th>x (from left)</th><th>f(x)</th><th>x (from right)</th><th>f(x)</th></tr>${rows}</table></div>`;
    }
  };
})();
