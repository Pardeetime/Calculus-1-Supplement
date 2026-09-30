// Dashboard: course outline, secant explorer, hint-ladder demo, confidence tracking.


const TOOLS = [
  { title: 'Formula reference', href: 'formulas.html', desc: 'Every rule in one place, each linked to the lesson that explains why it works.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h12a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4z"/><path d="M8 9h8M8 13h5"/></svg>' },
  { title: 'Graph explorer', href: 'graph-explorer.html', desc: 'Plot a function with its first and second derivatives and see how they relate.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M6 16c3-9 6-9 8-4s4 3 6-4"/></svg>' },
  { title: 'Common mistakes', href: 'mistakes.html', desc: 'Spot the error in worked solutions, like the classic (x + h)² = x² + h².',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4M11 8v3M11 14h.01"/></svg>' },
  { title: 'Exam review', href: 'exam-review.html', desc: 'A review list built from your confidence ratings, plus mixed practice for each exam.',
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4h6l1 2h3v15H5V6h3z"/><path d="m9 13 2 2 4-4"/></svg>' }
];

const CONF_LABELS = ['', 'Shaky', 'Getting there', 'Got it'];
const CLOSE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
const ALL_TOPICS = UNITS.flatMap(u => u.topics);

function esc(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }

function unitScore(unit) {
  const total = unit.topics.reduce((s, t) => s + Calc.Progress.get(t.id), 0);
  return total / (unit.topics.length * 3);
}

// ---------------------------------------------------------------------------
// Standing summary, roadmap, unit grid
// ---------------------------------------------------------------------------
function renderStanding() {
  const levels = ALL_TOPICS.map(t => Calc.Progress.get(t.id));
  const rated = levels.filter(Boolean).length;
  const pct = Math.round(100 * levels.reduce((a, b) => a + b, 0) / (ALL_TOPICS.length * 3));
  const C = 2 * Math.PI * 27;
  document.getElementById('ringFill').setAttribute('stroke-dasharray', `${(pct / 100) * C} ${C}`);
  document.getElementById('ringText').textContent = pct + '%';
  document.getElementById('resetBtn').hidden = rated === 0;

  const text = document.getElementById('standingText');
  if (!rated) { text.textContent = `Rate your confidence on each of the ${ALL_TOPICS.length} topics to build your study plan.`; return; }
  const shaky = ALL_TOPICS.filter(t => Calc.Progress.get(t.id) === 1);
  let msg = `You’ve rated ${rated} of ${ALL_TOPICS.length} topics.`;
  if (shaky.length) msg += ` Review first: ${shaky.slice(0, 2).map(t => t.title).join('; ')}${shaky.length > 2 ? ` (+${shaky.length - 2} more)` : ''}.`;
  else if (rated === ALL_TOPICS.length) msg += ' Nothing marked shaky. Nice work.';
  text.textContent = msg;
}

function renderRoadmap() {
  document.getElementById('roadmap').innerHTML = UNITS.map(u => `
    <button type="button" style="--uc:${u.color}" data-unit="${u.id}">
      <span class="rn">Unit ${u.num}</span>
      <span class="rt">${esc(u.title)}</span>
      <span class="rb"><i style="width:${Math.round(unitScore(u) * 100)}%"></i></span>
    </button>`).join('');
}

function matches(unit, q) {
  if (!q) return { show: true, hits: [] };
  const hits = unit.topics.filter(t => (t.title + ' ' + t.q).toLowerCase().includes(q));
  const self = (unit.title + ' ' + unit.blurb).toLowerCase().includes(q);
  return { show: self || hits.length > 0, hits };
}

function renderUnits() {
  const q = document.getElementById('search').value.trim().toLowerCase();
  const grid = document.getElementById('unitGrid');
  const cards = UNITS.map(u => {
    const m = matches(u, q);
    if (!m.show) return '';
    const live = u.topics.filter(t => t.href).length;
    const pct = Math.round(unitScore(u) * 100);
    const peek = m.hits.length
      ? `<b>Matches:</b> ${m.hits.map(t => esc(t.title)).join(' · ')}`
      : u.topics.slice(0, 4).map(t => esc(t.title)).join(' · ') + (u.topics.length > 4 ? ' · …' : '');
    return `
      <button type="button" class="card unit" style="--uc:${u.color}" data-unit="${u.id}" aria-label="Open Unit ${u.num}: ${esc(u.title)}">
        <span class="num">UNIT ${u.num} · ${u.topics.length} topics</span>
        <h3>${esc(u.title)}</h3>
        <span class="blurb">${esc(u.blurb)}</span>
        <span class="keytex" data-display data-tex="${esc(u.key)}"></span>
        <span class="topics-peek">${peek}</span>
        <span class="meta">
          ${u.optional ? '<span class="tag opt">Check syllabus</span>' : live ? `<span class="tag live">${live} live</span>` : '<span class="tag">Coming soon</span>'}
          <span class="bar" title="Your confidence: ${pct}%"><i style="width:${pct}%"></i></span>
          <span>${pct}%</span>
        </span>
      </button>`;
  }).join('');
  grid.innerHTML = cards || `<div class="card empty">No topics match “${esc(q)}”. Try a shorter word like “rule” or “limit”.</div>`;
  Calc.renderMath(grid);
}

// ---------------------------------------------------------------------------
// Unit sheet
// ---------------------------------------------------------------------------
const sheet = document.getElementById('sheet');

function openUnit(id) {
  const u = UNITS.find(x => x.id === id);
  if (!u) return;
  const q = document.getElementById('search').value.trim().toLowerCase();
  sheet.style.setProperty('--uc', u.color);
  sheet.innerHTML = `
    <div class="sheet-head">
      <div>
        <div class="eyebrow" style="color:${u.color}">Unit ${u.num}</div>
        <h2 id="sheetTitle">${esc(u.title)}</h2>
        <p>${esc(u.blurb)}</p>
      </div>
      <button class="icon-btn" type="button" data-close aria-label="Close">${CLOSE_ICON}</button>
    </div>
    <div class="sheet-body">
      ${u.optional ? '<p class="sheet-note">Some sections end the semester before this unit. Check your syllabus.</p>' : ''}
      <p class="sheet-note">${u.topics.every(t => t.href)
        ? 'Rate how you feel about each topic. Each lesson also ends with this rating.'
        : 'Lessons are being built. Rate how you feel about each topic now, and a link will appear here when its lesson goes live.'}</p>
      ${u.topics.map((t, i) => {
        const lvl = Calc.Progress.get(t.id);
        const hit = q && (t.title + ' ' + t.q).toLowerCase().includes(q);
        return `
        <article class="topic"${hit ? ' style="background:var(--gold-soft);margin:0 -20px;padding-left:20px;padding-right:20px"' : ''}>
          <span class="tn">${u.num}.${i + 1}</span>
          <div>
            <h3>${esc(t.title)}</h3>
            <p class="big-q">${esc(t.q)}</p>
            <div class="tex" data-display data-tex="${esc(t.tex)}"></div>
            <div class="topic-foot">
              ${t.href ? `<a class="btn primary" href="${esc(t.href)}">Open lesson →</a>` : '<span class="tag">Coming soon</span>'}
              <span class="conf" role="group" aria-label="Confidence for ${esc(t.title)}">
                ${[1, 2, 3].map(l => `<button type="button" data-topic="${t.id}" data-level="${l}" aria-pressed="${lvl === l}">${CONF_LABELS[l]}</button>`).join('')}
              </span>
            </div>
          </div>
        </article>`;
      }).join('')}
    </div>`;
  Calc.renderMath(sheet);
  if (!sheet.open) sheet.showModal();
  sheet.scrollTop = 0;
}

sheet.addEventListener('click', e => {
  if (e.target === sheet || e.target.closest('[data-close]')) { sheet.close(); return; }
  const b = e.target.closest('button[data-topic]');
  if (!b) return;
  const level = +b.dataset.level;
  const next = Calc.Progress.get(b.dataset.topic) === level ? 0 : level;
  Calc.Progress.set(b.dataset.topic, next);
  b.parentElement.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.level === next)));
  refresh();
});

function refresh() { renderStanding(); renderRoadmap(); renderUnits(); }

// ---------------------------------------------------------------------------
// Secant → tangent explorer
// ---------------------------------------------------------------------------
const Explorer = (() => {
  const W = 520, H = 330, X0 = -4, X1 = 4, Y0 = -4.5, Y1 = 6.5;
  const f = x => 0.12 * x ** 3 - 0.8 * x + 1.5;
  const fp = x => 0.36 * x ** 2 - 0.8;
  const sx = x => (x - X0) / (X1 - X0) * W;
  const sy = y => H - (y - Y0) / (Y1 - Y0) * H;
  const svg = document.getElementById('graph');
  const hSlider = document.getElementById('hSlider');
  const aSlider = document.getElementById('aSlider');
  let side = 1, showTan = false;

  const curvePath = (() => {
    let d = '';
    for (let i = 0; i <= 200; i++) { const x = X0 + (X1 - X0) * i / 200; d += (i ? 'L' : 'M') + sx(x).toFixed(1) + ' ' + sy(f(x)).toFixed(1); }
    return d;
  })();

  function lineThrough(x, y, m) {
    return `x1="${sx(X0)}" y1="${sy(y + m * (X0 - x))}" x2="${sx(X1)}" y2="${sy(y + m * (X1 - x))}"`;
  }

  function h() { const t = hSlider.value / 1000; return side * (2 * (1 - t) ** 3 + 0.0005); }
  function a() { return aSlider.value / 100; }

  function draw() {
    const A = a(), dh = h(), B = A + dh;
    const fa = f(A), fb = f(B), m = (fb - fa) / dh;
    let grid = '';
    for (let x = X0; x <= X1; x++) grid += `<line class="grid" x1="${sx(x)}" y1="0" x2="${sx(x)}" y2="${H}"/>`;
    for (let y = Math.ceil(Y0); y <= Y1; y++) grid += `<line class="grid" x1="0" y1="${sy(y)}" x2="${W}" y2="${sy(y)}"/>`;
    svg.innerHTML = `
      <defs><clipPath id="clip"><rect width="${W}" height="${H}"/></clipPath></defs>
      <g clip-path="url(#clip)">
        ${grid}
        <line class="axis" x1="0" y1="${sy(0)}" x2="${W}" y2="${sy(0)}"/>
        <line class="axis" x1="${sx(0)}" y1="0" x2="${sx(0)}" y2="${H}"/>
        <path class="curve" d="${curvePath}"/>
        ${showTan ? `<line class="tangent" ${lineThrough(A, fa, fp(A))}/>` : ''}
        <line class="secant" ${lineThrough(A, fa, m)}/>
        <polyline class="rise" fill="none" points="${sx(A)},${sy(fa)} ${sx(B)},${sy(fa)} ${sx(B)},${sy(fb)}"/>
        <circle class="pt b" cx="${sx(B)}" cy="${sy(fb)}" r="6"/>
        <circle class="pt a" cx="${sx(A)}" cy="${sy(fa)}" r="8"/>
        <text x="${sx(A) + 10}" y="${sy(fa) + 20}">a</text>
        <text x="${sx(B) + (side > 0 ? 10 : -34)}" y="${sy(fb) - 10}">a+h</text>
        <text x="${W - 16}" y="${sy(0) - 6}">x</text>
        <text x="${sx(0) + 6}" y="14">y</text>
      </g>`;
    document.getElementById('hOut').textContent = dh.toFixed(4);
    document.getElementById('aOut').textContent = A.toFixed(2);
    document.getElementById('mOut').textContent = m.toFixed(4);
    const note = document.getElementById('explorerNote');
    note.innerHTML = showTan
      ? `Tangent slope <b>f′(${A.toFixed(2)}) = ${fp(A).toFixed(4)}</b>. Compare it with the secant slope as h shrinks.`
      : 'That settling value is the <b>derivative</b>. Limits (Unit 1) make “settling” precise.';
  }

  // Drag the point a along the curve.
  let dragging = false;
  function toA(e) {
    const r = svg.getBoundingClientRect();
    const x = X0 + (e.clientX - r.left) / r.width * (X1 - X0);
    aSlider.value = Math.round(Math.max(-3, Math.min(3, x)) * 100);
    draw();
  }
  svg.addEventListener('pointerdown', e => { if (e.target.classList.contains('a')) { dragging = true; svg.setPointerCapture(e.pointerId); } });
  svg.addEventListener('pointermove', e => { if (dragging) toA(e); });
  svg.addEventListener('pointerup', () => { dragging = false; });

  hSlider.addEventListener('input', draw);
  aSlider.addEventListener('input', draw);
  const sideR = document.getElementById('sideR'), sideL = document.getElementById('sideL');
  function setSide(s) { side = s; sideR.setAttribute('aria-pressed', s > 0); sideL.setAttribute('aria-pressed', s < 0); draw(); }
  sideR.addEventListener('click', () => setSide(1));
  sideL.addEventListener('click', () => setSide(-1));
  const tanBtn = document.getElementById('tangentBtn');
  tanBtn.addEventListener('click', () => {
    showTan = !showTan;
    tanBtn.setAttribute('aria-pressed', showTan);
    tanBtn.textContent = showTan ? 'Hide tangent line' : 'Show tangent line';
    draw();
  });
  return { draw };
})();

// ---------------------------------------------------------------------------
// Hint-ladder demo: lim x→3 (x²−9)/(x−3). Hints guide; the answer is never shown.
// ---------------------------------------------------------------------------
const Ladder = (() => {
  const RUNGS = [
    { label: 'Nudge', text: 'Try substituting x = 3 directly. What form do you get, and what might that be telling you?' },
    { label: 'Hint', text: 'The form 0/0 usually means the top and bottom share a factor. Can you factor the numerator?' },
    { label: 'Strategy', text: 'Factor, cancel the common factor (allowed because x only gets close to 3, it never equals 3), then substitute into what’s left.' }
  ];
  let opened = 0, attempts = 0;
  const rungs = document.getElementById('rungs');
  const list = document.getElementById('hintList');
  const fb = document.getElementById('feedback');

  function render() {
    rungs.innerHTML = RUNGS.map((r, i) => `
      <button type="button" class="btn rung" data-i="${i}" aria-expanded="${i < opened}" ${i > opened ? 'disabled' : ''}>
        ${i < opened ? '✓ ' : ''}${r.label}
      </button>`).join('');
    list.innerHTML = RUNGS.slice(0, opened).map(r => `<div class="hint"><b>${r.label}</b>${r.text}</div>`).join('');
  }
  rungs.addEventListener('click', e => {
    const b = e.target.closest('button[data-i]');
    if (b && +b.dataset.i === opened) { opened++; render(); }
  });

  function parse(s) {
    const t = s.replace(/\s+/g, '');
    const frac = t.match(/^(-?\d*\.?\d+)\/(-?\d*\.?\d+)$/);
    if (frac) return +frac[1] / +frac[2];
    return t === '' ? NaN : Number(t);
  }

  function say(kind, html) { fb.className = 'feedback ' + kind; fb.innerHTML = html; }

  document.getElementById('answerForm').addEventListener('submit', e => {
    e.preventDefault();
    const raw = document.getElementById('answerIn').value.trim().toLowerCase();
    if (!raw) return;
    attempts++;
    const norm = raw.replace(/\s+/g, '');
    const v = parse(norm);
    const next = opened < RUNGS.length ? ` The <b>${RUNGS[opened].label}</b> button might help.` : '';
    if (Math.abs(v - 6) < 1e-9) {
      say('good', `<b>Yes${attempts > 1 ? ', you got there' : ''}.</b> Here’s the idea underneath: away from x = 3 this function behaves exactly like a simpler one, so the limit reports the height the graph is <i>heading toward</i>, even though there’s a hole at x = 3.`);
    } else if (norm === '0/0') {
      say('try', `0/0 is the <i>form</i> you get from substituting, not a value. It’s a signal that more work is needed.${next}`);
    } else if (/^(dne|undefined|doesnotexist|none|nosolution|undef)$/.test(norm)) {
      say('try', `The function is undefined <i>at</i> x = 3, but a limit only asks what happens <i>near</i> 3. Those are different questions.${next}`);
    } else if (Number.isNaN(v)) {
      say('try', 'Enter a number (like 4, -2.5 or 7/2).');
    } else if (v === 0) {
      say('try', `The numerator does go to 0, but so does the denominator. When both shrink together, their ratio can settle on any value.${next}`);
    } else if (v === 3) {
      say('try', `3 is where <i>x</i> is heading. The limit asks where the <i>output</i> is heading.${next}`);
    } else {
      say('try', `Not quite. Check your algebra after factoring, then try again.${next}`);
    }
  });

  render();
})();

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------
document.getElementById('tools').innerHTML = TOOLS.map(t => `
  <a class="card tool" href="${t.href}" style="text-decoration:none;color:inherit;display:block">${t.icon}<h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p><span class="tag live">Open →</span></a>`).join('');

document.getElementById('search').addEventListener('input', renderUnits);
document.addEventListener('click', e => {
  const b = e.target.closest('#unitGrid [data-unit], #roadmap [data-unit]');
  if (b) openUnit(b.dataset.unit);
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all of your confidence ratings?')) { Calc.Progress.reset(); refresh(); }
});

// KaTeX loads with `defer`, so it's ready by DOMContentLoaded.
document.addEventListener('DOMContentLoaded', () => {
  Calc.renderMath(); refresh(); Explorer.draw();
  const hashUnit = location.hash.slice(1);
  if (UNITS.some(u => u.id === hashUnit)) openUnit(hashUnit);
});
