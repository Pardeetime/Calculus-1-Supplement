// TLDR panel on the dashboard: unit summaries, glossary, and a symbols/variables guide.
(function () {
  'use strict';

  // One entry per unit: the big idea, a one-line recap of each lesson (same order as course.js),
  // why the skill matters, and where it shows up in real life.
  const SUMMARY = {
    u0: {
      big: 'Calculus is about how quantities change. Before measuring change, you need a solid toolkit of the functions that describe it.',
      topics: [
        'A function assigns each input exactly one output. Domain = allowed inputs, range = resulting outputs.',
        'Changes outside a function (a·f(x) + k) move the graph vertically; changes inside (f(b(x − h))) move it horizontally, and feel backwards.',
        'Exponentials (bˣ) model repeated multiplication; logarithms undo them. The natural base e ≈ 2.718 makes calculus cleanest.',
        'An inverse function runs a function backwards. It exists only if the function is one-to-one (passes the horizontal line test).',
        'Sine and cosine are coordinates on the unit circle. Calculus measures angles in radians (arc length).'
      ],
      why: 'Every later unit takes these functions apart and puts them back together. Weak algebra and trig are the #1 reason students struggle in Calculus I.',
      life: ['Exponentials: compound interest, population growth, radioactive decay, how medicine clears your body.', 'Logarithms: the Richter scale, decibels, pH, and solving “how long until…?” questions.', 'Trig: sound waves, tides, seasons, alternating current, anything that repeats.']
    },
    u1: {
      big: 'A limit describes where a function is heading as the input approaches a value, even if the function never gets there or isn’t defined there.',
      topics: [
        'Average speed is easy (distance ÷ time). Speed at one instant needs a new idea: the limit of average speeds over shrinking intervals.',
        'lim f(x) = L means f(x) can be made as close to L as you like by taking x close enough to a. The value at a doesn’t matter.',
        'Approaching from the left and right can give different results; a limit exists only if both sides agree. Blow-ups give ±∞ and vertical asymptotes.',
        'Try substitution first. If you get 0/0, do algebra: factor and cancel, use a conjugate, or combine fractions.',
        'If a function is trapped between two others that meet, it’s forced to the same limit. This proves sin θ / θ → 1.',
        'The ε–δ definition makes “close enough” exact: for every output tolerance ε, some input tolerance δ works.',
        'Continuous means no breaks: the limit equals the value. The Intermediate Value Theorem guarantees a continuous function hits every value in between.',
        'Limits at ±∞ describe long-run behavior and horizontal asymptotes. Compare the highest powers.'
      ],
      why: 'Limits are the foundation: the derivative and the integral are both defined as limits. They let us talk precisely about “instantaneous” and “infinitely many tiny pieces.”',
      life: ['Long-run behavior: a drug’s concentration levelling off, a cooling cup of coffee approaching room temperature.', 'Continuity and the IVT: proving an equation has a solution (engineers and computer algorithms rely on this).', 'Tolerances (ε–δ): manufacturing specs like “how precise must the input be to keep the output within spec?”']
    },
    u2: {
      big: 'The derivative measures instantaneous rate of change: the slope of the tangent line at a point.',
      topics: [
        'f′(a) is the limit of secant slopes as the second point slides into the first. It’s both a slope and a rate, with units of output per input.',
        'Doing this at every x gives a new function f′(x). Its second derivative f″ measures how the slope itself changes (acceleration).',
        'A function is differentiable where its graph is smooth. Corners, cusps, vertical tangents and breaks have no derivative. Differentiable implies continuous.',
        'The sign of f′ tells you where f rises (+) or falls (−). Where f′ changes sign, f has a hilltop or a valley.'
      ],
      why: 'Almost every quantity in science and business changes over time. The derivative is the precise language for “how fast, right now.”',
      life: ['Speedometers show a derivative (rate of change of position).', 'Marginal cost and revenue in economics: the cost of producing one more item.', 'Medicine: how fast a tumor grows or a drug level drops at a given moment.']
    },
    u3: {
      big: 'Shortcut rules let you find derivatives without computing a limit every time. Nearly every function is built from pieces these rules handle.',
      topics: [
        'Power rule: bring the exponent down, subtract one. Sums and constant multiples work term by term.',
        'eˣ is its own derivative; bˣ gives bˣ·ln b.',
        'Product rule: f′g + fg′. Quotient rule: (f′g − fg′)/g². A product’s derivative is never just f′g′.',
        'sin → cos → −sin → −cos, repeating every four derivatives (radians only).',
        'Chain rule: derivative of the outside (leave the inside alone) times the derivative of the inside. Rates multiply.',
        'Implicit differentiation finds slopes on curves like circles by differentiating both sides and attaching dy/dx to every y term.',
        'd/dx ln x = 1/x. Taking ln first (log differentiation) handles messy products and variable exponents like xˣ.',
        'Inverse functions have reciprocal slopes. arctan′ = 1/(1+x²), arcsin′ = 1/√(1−x²).',
        'Related rates: connect quantities with an equation, differentiate with respect to time, then substitute.',
        'Near a point, a curve is almost its tangent line: f(x) ≈ f(a) + f′(a)(x − a). Great for estimates and error bounds.'
      ],
      why: 'These rules make derivatives fast and reliable, so you can spend your effort on setting problems up and interpreting answers.',
      life: ['Related rates: how fast a spill spreads, how quickly a ladder or satellite’s distance changes, air-traffic control.', 'Chain rule: every neural network in AI is trained with it (it’s called backpropagation).', 'Linear approximation: how calculators, GPS and engineers estimate values and measurement error.']
    },
    u4: {
      big: 'Derivatives answer practical questions: where is the maximum? What does the graph look like? What’s the best design?',
      topics: [
        'Absolute extremes on a closed interval happen at endpoints or critical numbers (f′ = 0 or undefined). Check them all and compare.',
        'Mean Value Theorem: somewhere, the instantaneous rate equals the average rate. It explains why functions with equal derivatives differ by a constant.',
        'f′ decides rising/falling and local max/min; f″ decides concave up/down and inflection points.',
        'L’Hôpital’s Rule: for 0/0 or ∞/∞, replace f/g with f′/g′. Other indeterminate forms get rewritten into those first.',
        'Curve sketching combines domain, intercepts, asymptotes, f′ and f″ into an accurate graph without plotting points.',
        'Optimization: write the quantity to maximize/minimize, use a constraint to get one variable, find critical numbers, check the domain.',
        'Newton’s Method solves equations by repeatedly following tangent lines to the x-axis. Correct digits roughly double each step.',
        'An antiderivative reverses differentiation. There’s a whole family, F(x) + C, and one known value pins down C.'
      ],
      why: 'These skills apply derivatives to practical questions: finding maximums and minimums, and predicting the shape of a graph.',
      life: ['Optimization: minimizing material in packaging, maximizing profit, fastest delivery routes, dosing medicine.', 'Newton’s Method: how computers and calculators compute square roots and solve equations.', 'Antiderivatives: recovering position from velocity (how phones and rockets track movement).']
    },
    u5: {
      big: 'The integral adds up infinitely many tiny pieces. The Fundamental Theorem reveals it’s the reverse of the derivative.',
      topics: [
        'Approximate area with rectangles (left, right, midpoint). More rectangles means a better estimate. Area under a velocity graph is distance.',
        'The definite integral is the limit of those sums: net signed area, where area below the axis counts as negative.',
        'FTC: the rate at which area accumulates equals the height of the function, so ∫ₐᵇ f = F(b) − F(a) for any antiderivative F.',
        'Indefinite integrals (∫ f dx = F + C) are antiderivative families. Integrating a rate gives the net change in the quantity.',
        'Substitution reverses the chain rule: choose u so that du is already in the integral.'
      ],
      why: 'Whenever you know a rate and want a total, you integrate. Integrals turn “how fast” back into “how much.”',
      life: ['Total distance from a speed record; total water from a flow rate; total energy from power usage on your electric bill.', 'Medicine: total drug exposure (area under the concentration curve).', 'Economics and statistics: total revenue, probabilities from bell curves.']
    },
    u6: {
      big: 'Integrals measure more than area under one curve: area between curves and average values over an interval.',
      topics: [
        'Area between curves = ∫(top − bottom) dx. Split wherever the curves cross, or use horizontal strips ∫(right − left) dy.',
        'Average value = (1/(b − a))∫ f dx: the height of the rectangle with the same area. A continuous function reaches its average somewhere.'
      ],
      why: 'These are the first of many integral applications: volumes, work, centers of mass and probability follow in later courses.',
      life: ['Area between curves: profit as the gap between revenue and cost; consumer surplus in economics.', 'Average value: average temperature over a day, average speed on a trip, average blood-sugar level.']
    }
  };

  const GLOSSARY = [
    ['Absolute (global) maximum/minimum', 'The largest/smallest value a function reaches on its entire domain or interval.', 'extrema.html'],
    ['Antiderivative', 'A function F whose derivative is f. The most general one is F(x) + C.', 'antiderivatives.html'],
    ['Asymptote (horizontal)', 'A line y = L that the graph approaches as x → ±∞.', 'limits-infinity.html'],
    ['Asymptote (vertical)', 'A line x = a where the function blows up to ±∞.', 'one-sided.html'],
    ['Average rate of change', 'Change in output ÷ change in input between two points; the slope of a secant line.', 'tangent-velocity.html'],
    ['Average value', 'The constant height with the same area as f over [a, b]: (1/(b − a))∫ₐᵇ f dx.', 'average-value.html'],
    ['Chain rule', 'Derivative of a composition: f′(g(x))·g′(x).', 'chain-rule.html'],
    ['Composition', 'Feeding one function into another: f(g(x)).', 'transformations.html'],
    ['Concave up / down', 'Bending upward like ∪ (f″ > 0) or downward like ∩ (f″ < 0).', 'shape.html'],
    ['Continuous', 'No breaks: lim f(x) as x → a equals f(a).', 'continuity.html'],
    ['Critical number', 'An x in the domain where f′(x) = 0 or f′(x) doesn’t exist. Candidates for extrema.', 'extrema.html'],
    ['Definite integral', 'A number: the limit of Riemann sums, the net signed area from a to b.', 'definite-integral.html'],
    ['Derivative', 'The instantaneous rate of change; the slope of the tangent line. The limit of the difference quotient.', 'derivative-point.html'],
    ['Difference quotient', '[f(a + h) − f(a)]/h: the slope of a secant line.', 'derivative-point.html'],
    ['Differentiable', 'Having a derivative at a point: the graph is smooth there (no corner, cusp or break).', 'differentiability.html'],
    ['Differential', 'dy = f′(x) dx: the tangent line’s estimate of a change in y.', 'linearization.html'],
    ['Discontinuity', 'A break in the graph: removable (hole), jump, or infinite.', 'continuity.html'],
    ['Domain', 'All inputs a function accepts.', 'functions.html'],
    ['e', 'The natural base ≈ 2.71828, the only base where bˣ is its own derivative.', 'exp-log.html'],
    ['Even / odd function', 'Even: f(−x) = f(x), symmetric across the y-axis. Odd: f(−x) = −f(x), symmetric through the origin.', 'curve-sketch.html'],
    ['Extreme Value Theorem', 'A continuous function on a closed interval [a, b] has an absolute max and min there.', 'extrema.html'],
    ['Fundamental Theorem of Calculus', 'Differentiation and integration undo each other: d/dx ∫ₐˣ f = f(x), and ∫ₐᵇ f = F(b) − F(a).', 'ftc.html'],
    ['Implicit differentiation', 'Differentiating both sides of an equation in x and y, treating y as a function of x.', 'implicit.html'],
    ['Indefinite integral', 'The family of all antiderivatives: ∫ f(x) dx = F(x) + C.', 'indefinite.html'],
    ['Indeterminate form', 'A form like 0/0, ∞/∞, 0·∞, ∞ − ∞, 1^∞ that doesn’t determine the limit by itself.', 'lhopital.html'],
    ['Inflection point', 'A point on the graph where concavity changes.', 'shape.html'],
    ['Instantaneous rate of change', 'The rate at a single moment: the derivative.', 'tangent-velocity.html'],
    ['Intermediate Value Theorem', 'A continuous function on [a, b] takes every value between f(a) and f(b).', 'continuity.html'],
    ['Inverse function', 'f⁻¹ reverses f: if f(a) = b then f⁻¹(b) = a. Not the same as 1/f.', 'inverse.html'],
    ['L’Hôpital’s Rule', 'For 0/0 or ∞/∞ limits, lim f/g = lim f′/g′.', 'lhopital.html'],
    ['Limit', 'The value f(x) approaches as x approaches a (the value at a is irrelevant).', 'limit-intro.html'],
    ['Linearization', 'The tangent line used as an approximation: L(x) = f(a) + f′(a)(x − a).', 'linearization.html'],
    ['Local (relative) max/min', 'A hilltop/valley: highest/lowest compared with nearby points.', 'extrema.html'],
    ['Logarithm', 'log_b x is the exponent you put on b to get x. ln x = logₑ x.', 'exp-log.html'],
    ['Mean Value Theorem', 'For a smooth function on [a, b], some c has f′(c) equal to the average slope.', 'mvt.html'],
    ['Net change', 'The integral of a rate gives the total change: ∫ₐᵇ F′ = F(b) − F(a).', 'indefinite.html'],
    ['One-to-one', 'Different inputs always give different outputs; passes the horizontal line test.', 'inverse.html'],
    ['Optimization', 'Finding the largest or smallest value of a quantity, subject to constraints.', 'optimization.html'],
    ['Radian', 'Angle measured by arc length on the unit circle; a full turn is 2π.', 'trig.html'],
    ['Range', 'All outputs a function actually produces.', 'functions.html'],
    ['Related rates', 'Finding one rate of change from others, using an equation linking the quantities.', 'related-rates.html'],
    ['Riemann sum', 'A sum of rectangle areas, Σ f(xᵢ*) Δx, that approximates an integral.', 'area-distance.html'],
    ['Secant line', 'A line through two points on a curve; its slope is an average rate.', 'tangent-velocity.html'],
    ['Squeeze Theorem', 'If g ≤ f ≤ h and g, h approach the same limit, f does too.', 'squeeze.html'],
    ['Substitution (u-sub)', 'Reversing the chain rule: let u = inside function, du = u′ dx.', 'substitution.html'],
    ['Tangent line', 'The line that matches a curve’s direction at one point; slope = the derivative.', 'derivative-point.html']
  ];

  // [symbol (TeX), read as, meaning, example of use (TeX)]
  const SYMBOLS = [
    ['x', '“x”', 'The input (independent variable).', 'f(x) = x^2'],
    ['y,\\ f(x)', '“y”, “f of x”', 'The output (dependent variable). f(x) means “apply f to x,” not multiplication.', 'f(3) = 9'],
    ['a', '“a”', 'A specific, fixed input you’re focusing on.', '\\lim_{x\\to a} f(x),\\ f\'(a)'],
    ['h', '“h”', 'A small change in the input, which shrinks to 0 in a derivative.', '\\frac{f(a+h) - f(a)}{h}'],
    ['\\Delta x', '“delta x”', 'A (finite) change in x. Δ means “change in.”', '\\frac{\\Delta y}{\\Delta x} = \\text{average rate}'],
    ['dx,\\ dy', '“dee x”, “dee y”', 'Infinitely small changes. In an integral, dx says “x is the variable” and marks thin strips of width dx.', '\\int f(x)\\,dx,\\ dy = f\'(x)\\,dx'],
    ['\\lim_{x\\to a}', '“the limit as x approaches a”', 'What the expression approaches as x gets close to a.', '\\lim_{x\\to 0}\\frac{\\sin x}{x} = 1'],
    ['a^-,\\ a^+', '“from the left / right”', 'Approach a from values below / above it (not negative numbers).', '\\lim_{x\\to 2^-} f(x)'],
    ['\\infty', '“infinity”', 'Grows without bound. Not a number you can plug in.', '\\lim_{x\\to\\infty}\\frac1x = 0'],
    ['\\varepsilon,\\ \\delta', '“epsilon”, “delta”', 'Tiny positive tolerances: ε for outputs, δ for inputs.', '|x - a| \\lt \\delta \\Rightarrow |f(x) - L| \\lt \\varepsilon'],
    ["f'(x),\\ \\frac{dy}{dx}", '“f prime of x”, “dee y dee x”', 'The derivative: slope / rate of change of f at x.', "\\frac{d}{dx}x^2 = 2x"],
    ["f''(x),\\ \\frac{d^2y}{dx^2}", '“f double prime”', 'The second derivative: rate of change of the slope (concavity, acceleration).', "f''(x) \\gt 0 \\Rightarrow \\cup"],
    ['\\frac{d}{dx}', '“the derivative of”', 'An instruction: differentiate what follows with respect to x.', '\\frac{d}{dx}\\sin x = \\cos x'],
    ['c', '“c”', 'A specific point promised by a theorem (MVT, IVT), or a critical number.', "f'(c) = \\frac{f(b) - f(a)}{b - a}"],
    ['C', '“plus C”', 'An arbitrary constant: every antiderivative has one.', '\\int 2x\\,dx = x^2 + C'],
    ['e', '“e”', 'The constant 2.71828…', '\\frac{d}{dx}e^x = e^x'],
    ['\\pi', '“pi”', 'The constant 3.14159…, half a turn in radians.', '\\sin\\pi = 0'],
    ['\\theta', '“theta”', 'An angle, in radians for calculus.', '\\sin^2\\theta + \\cos^2\\theta = 1'],
    ['\\ln x', '“natural log of x”', 'The logarithm base e, the inverse of eˣ.', '\\frac{d}{dx}\\ln x = \\frac1x'],
    ['f^{-1}', '“f inverse”', 'The inverse function (not 1/f).', 'f^{-1}(f(x)) = x'],
    ['F(x)', '“capital F”', 'An antiderivative of f, meaning F′ = f.', '\\int_a^b f\\,dx = F(b) - F(a)'],
    ['\\int_a^b', '“the integral from a to b”', 'Definite integral: a number (net signed area). a = lower limit, b = upper limit.', '\\int_0^2 x^2\\,dx = \\frac83'],
    ['\\int', '“the integral of”', 'Indefinite integral: the family of antiderivatives.', '\\int \\cos x\\,dx = \\sin x + C'],
    ['\\Sigma', '“sigma, the sum of”', 'Add up terms as i runs from 1 to n.', '\\sum_{i=1}^{n} f(x_i)\\,\\Delta x'],
    ['n,\\ i', '“n”, “i”', 'n = number of rectangles/pieces; i = which piece you’re on.', '\\Delta x = \\frac{b-a}{n}'],
    ['x_i^*', '“x i star”', 'The sample point chosen in the i-th piece (left, right or middle).', 'f(x_i^*)\\,\\Delta x'],
    ['u,\\ du', '“u”, “dee u”', 'In substitution: u = the inside function, du = its derivative times dx.', 'u = x^2,\\ du = 2x\\,dx'],
    ['t', '“t”', 'Time, the usual input for motion and rates.', '\\frac{dV}{dt}'],
    ['s(t),\\ v(t),\\ a(t)', '“position, velocity, acceleration”', 'v = s′ and a = v′ = s″. Integrating goes the other way.', 'v(t) = s\'(t)'],
    ['L(x)', '“L of x”', 'The linearization (tangent-line approximation).', "L(x) = f(a) + f'(a)(x - a)"],
    ['x_n,\\ x_{n+1}', '“x sub n”', 'The current and next guesses in Newton’s Method.', "x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}"],
    ['f_{\\text{avg}}', '“f average”', 'The average value of f on an interval.', 'f_{\\text{avg}} = \\frac{1}{b-a}\\int_a^b f\\,dx']
  ];

  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const dlg = document.getElementById('tldr');
  let tab = 'units';

  function unitsHTML() {
    return UNITS.map(u => {
      const S = SUMMARY[u.id];
      return `<section class="tl-unit" style="--uc:${u.color}">
        <h3><small>UNIT ${u.num}</small>${esc(u.title)}</h3>
        <p class="tl-big">${esc(S.big)}</p>
        <ul class="tl-topics">${u.topics.map((t, i) => `<li><a href="${t.href}">${u.num}.${i + 1} ${esc(t.title)}</a> ${esc(S.topics[i] || '')}</li>`).join('')}</ul>
        <div class="tl-why"><div><b>Why learn it</b><p>${esc(S.why)}</p></div><div><b>In real life</b><ul>${S.life.map(l => `<li>${esc(l)}</li>`).join('')}</ul></div></div>
      </section>`;
    }).join('');
  }
  function glossaryItems(q) {
    const items = GLOSSARY.filter(g => !q || (g[0] + ' ' + g[1]).toLowerCase().includes(q)).sort((a, b) => a[0].localeCompare(b[0]));
    return items.map(g => `<div><dt>${esc(g[0])} <a href="${g[2]}">lesson →</a></dt><dd>${esc(g[1])}</dd></div>`).join('') || '<p class="muted">No matching terms.</p>';
  }
  function glossaryHTML() {
    return `<input type="search" class="tl-search" id="tlSearch" placeholder="Search ${GLOSSARY.length} terms, e.g. concave" aria-label="Search glossary">
      <dl class="tl-gloss" id="tlGloss">${glossaryItems('')}</dl>`;
  }
  function symbolsHTML() {
    return `<p class="muted" style="margin:0 0 12px">Letters change meaning with context, so here is how each is used in <i>this</i> course.</p>
      <div class="table-wrap"><table class="tl-sym"><tr><th>Symbol</th><th>Read as</th><th>Meaning</th><th>Example</th></tr>
      ${SYMBOLS.map(s => `<tr><td data-tex="${esc(s[0])}"></td><td>${esc(s[1])}</td><td>${esc(s[2])}</td><td data-tex="${esc(s[3])}"></td></tr>`).join('')}</table></div>`;
  }
  function render() {
    const body = dlg.querySelector('.tl-body');
    body.innerHTML = tab === 'units' ? unitsHTML() : tab === 'glossary' ? glossaryHTML() : symbolsHTML();
    dlg.querySelectorAll('.tl-tabs button').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.t === tab)));
    if (tab === 'glossary') {
      const inp = body.querySelector('#tlSearch');
      inp.addEventListener('input', () => { body.querySelector('#tlGloss').innerHTML = glossaryItems(inp.value.trim().toLowerCase()); });
    }
    Calc.renderMath(body);
    body.scrollTop = 0;
  }

  dlg.innerHTML = `
    <div class="tl-head">
      <div><div class="eyebrow">TLDR</div><h2 id="tlTitle">Course summary</h2></div>
      <button class="icon-btn" type="button" data-close aria-label="Close"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
    </div>
    <div class="tl-tabs seg" role="group" aria-label="TLDR sections">
      <button type="button" data-t="units">Unit summaries</button><button type="button" data-t="glossary">Glossary</button><button type="button" data-t="symbols">Symbols &amp; variables</button>
    </div>
    <div class="tl-body"></div>`;
  dlg.addEventListener('click', e => {
    if (e.target === dlg || e.target.closest('[data-close]')) { dlg.close(); return; }
    const t = e.target.closest('.tl-tabs button');
    if (t) { tab = t.dataset.t; render(); }
  });
  function open(which) { tab = which || tab; render(); if (!dlg.open) dlg.showModal(); }
  document.querySelectorAll('[data-tldr]').forEach(b => b.addEventListener('click', () => open(b.dataset.tldr || 'units')));
  document.addEventListener('DOMContentLoaded', () => { if (location.hash === '#tldr') open('units'); });
  window.TLDR = { open, SUMMARY, GLOSSARY, SYMBOLS };
})();
