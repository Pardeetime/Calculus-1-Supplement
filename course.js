// Course outline shared by the dashboard and every lesson page.
// A topic goes live by giving it an href (the lesson's .html file) and mins (estimated minutes).
window.UNITS = [
  { id: 'u0', num: 0, color: 'var(--u0)', title: 'Foundations',
    blurb: 'The precalculus toolkit: functions, graphs, exponentials, logs and trig.',
    key: String.raw`f(x) = e^{x},\quad \ln x,\quad \sin x`,
    topics: [
      { id: 'functions', href: 'functions.html', mins: 25, title: 'Functions and their graphs', q: 'What makes something a function, and how do you read one off a graph?', tex: String.raw`f:\ x \mapsto y` },
      { id: 'transform', href: 'transformations.html', mins: 30, title: 'Transformations and combining functions', q: 'How does changing a formula move, stretch or flip its graph?', tex: String.raw`y = a\,f\big(b(x-h)\big)+k` },
      { id: 'explog', href: 'exp-log.html', mins: 30, title: 'Exponential and logarithmic functions', q: 'Why is e the “natural” base, and how do logs undo exponentials?', tex: String.raw`y = e^{x} \iff x = \ln y` },
      { id: 'inverse', href: 'inverse.html', mins: 25, title: 'Inverse functions', q: 'When can a function be undone, and what does that look like on a graph?', tex: String.raw`f^{-1}\big(f(x)\big) = x` },
      { id: 'trig', href: 'trig.html', mins: 35, title: 'Trigonometry review', q: 'How does the unit circle generate sine and cosine?', tex: String.raw`\sin^2\theta + \cos^2\theta = 1` }
    ] },
  { id: 'u1', num: 1, color: 'var(--u1)', title: 'Limits and Continuity',
    blurb: 'What a function approaches, which is the idea every other unit is built on.',
    key: String.raw`\lim_{x\to a} f(x) = L`,
    topics: [
      { id: 'tangent-velocity', href: 'tangent-velocity.html', mins: 25, title: 'The tangent and velocity problems', q: 'How can you find a speed at a single instant when speed needs two moments?', tex: String.raw`v_{\text{avg}} = \frac{\Delta s}{\Delta t}` },
      { id: 'limit-idea', href: 'limit-intro.html', mins: 30, title: 'The limit of a function', q: 'What does it mean for outputs to “approach” a value?', tex: String.raw`\lim_{x\to a} f(x) = L` },
      { id: 'one-sided', href: 'one-sided.html', mins: 30, title: 'One-sided and infinite limits', q: 'What if the left and right sides disagree, or the function blows up?', tex: String.raw`\lim_{x\to a^-} f(x) \ \text{vs.}\ \lim_{x\to a^+} f(x)` },
      { id: 'limit-laws', href: 'limit-laws.html', mins: 35, title: 'Limit laws and algebraic techniques', q: 'What do you do when direct substitution gives 0/0?', tex: String.raw`\lim (f+g) = \lim f + \lim g` },
      { id: 'squeeze', href: 'squeeze.html', mins: 25, title: 'The Squeeze Theorem', q: 'How can you trap a limit you can’t compute directly?', tex: String.raw`g \le f \le h \implies \lim f = L` },
      { id: 'epsilon-delta', href: 'epsilon-delta.html', mins: 35, title: 'The precise definition of a limit', q: 'How do mathematicians make “close” exact?', tex: String.raw`|x-a|<\delta \implies |f(x)-L|<\varepsilon` },
      { id: 'continuity', href: 'continuity.html', mins: 35, title: 'Continuity and the Intermediate Value Theorem', q: 'What does it mean to draw a graph without lifting your pencil?', tex: String.raw`\lim_{x\to a} f(x) = f(a)` },
      { id: 'limits-infinity', href: 'limits-infinity.html', mins: 35, title: 'Limits at infinity and horizontal asymptotes', q: 'Where does a function end up in the long run?', tex: String.raw`\lim_{x\to\infty} \frac{1}{x} = 0` }
    ] },
  { id: 'u2', num: 2, color: 'var(--u2)', title: 'The Derivative',
    blurb: 'Instantaneous rate of change as a limit, as a slope and as a new function.',
    key: String.raw`f'(x) = \lim_{h\to 0}\frac{f(x+h)-f(x)}{h}`,
    topics: [
      { id: 'deriv-point', href: 'derivative-point.html', mins: 35, title: 'Derivatives and rates of change', q: 'How does a secant line become a tangent line?', tex: String.raw`f'(a) = \lim_{h\to 0}\frac{f(a+h)-f(a)}{h}` },
      { id: 'deriv-function', href: 'derivative-function.html', mins: 35, title: 'The derivative as a function', q: 'If every point has a slope, what does the slope graph look like?', tex: String.raw`x \mapsto f'(x)` },
      { id: 'differentiability', href: 'differentiability.html', mins: 30, title: 'Differentiability', q: 'Why do corners, cusps and jumps break the derivative?', tex: String.raw`\text{differentiable} \implies \text{continuous}` },
      { id: 'reading-fprime', href: 'reading-fprime.html', mins: 35, title: 'Reading f from f′ (and back)', q: 'What does the sign of f′ tell you about the shape of f?', tex: String.raw`f' > 0 \implies f \nearrow` }
    ] },
  { id: 'u3', num: 3, color: 'var(--u3)', title: 'Differentiation Rules',
    blurb: 'Shortcuts that replace the limit definition, and why each one works.',
    key: String.raw`\frac{d}{dx} f\big(g(x)\big) = f'\big(g(x)\big)\,g'(x)`,
    topics: [
      { id: 'power-rule', href: 'power-rule.html', mins: 30, title: 'Power, constant multiple and sum rules', q: 'Why does the exponent come down and drop by one?', tex: String.raw`\frac{d}{dx}x^n = n x^{n-1}` },
      { id: 'exp-deriv', href: 'exp-deriv.html', mins: 25, title: 'Derivatives of exponential functions', q: 'Which function is its own derivative?', tex: String.raw`\frac{d}{dx}e^{x} = e^{x}` },
      { id: 'product-quotient', href: 'product-quotient.html', mins: 30, title: 'Product and quotient rules', q: 'Why isn’t the derivative of a product just the product of derivatives?', tex: String.raw`(fg)' = f'g + fg'` },
      { id: 'trig-deriv', href: 'trig-deriv.html', mins: 30, title: 'Derivatives of trigonometric functions', q: 'Where does sin x / x → 1 come from, and why does it matter?', tex: String.raw`\frac{d}{dx}\sin x = \cos x` },
      { id: 'chain-rule', href: 'chain-rule.html', mins: 40, title: 'The Chain Rule', q: 'How do rates multiply when one change causes another?', tex: String.raw`\frac{dy}{dx} = \frac{dy}{du}\cdot\frac{du}{dx}` },
      { id: 'implicit', href: 'implicit.html', mins: 35, title: 'Implicit differentiation', q: 'How do you find a slope when you can’t solve for y?', tex: String.raw`x^2 + y^2 = 25 \;\Rightarrow\; \frac{dy}{dx} = ?` },
      { id: 'log-deriv', href: 'log-deriv.html', mins: 35, title: 'Logarithms and logarithmic differentiation', q: 'How can logs turn a messy product into a manageable sum?', tex: String.raw`\frac{d}{dx}\ln x = \frac{1}{x}` },
      { id: 'inv-trig', href: 'inv-trig.html', mins: 30, title: 'Derivatives of inverse trig functions', q: 'How do you differentiate a function by undoing another?', tex: String.raw`\frac{d}{dx}\arctan x = \frac{1}{1+x^2}` },
      { id: 'related-rates', href: 'related-rates.html', mins: 45, title: 'Related rates', q: 'If a balloon’s volume grows at a steady rate, how fast is its radius growing?', tex: String.raw`\frac{dV}{dt} \leftrightarrow \frac{dr}{dt}` },
      { id: 'linearization', href: 'linearization.html', mins: 30, title: 'Linear approximation and differentials', q: 'Why does zooming in make every smooth curve look straight?', tex: String.raw`L(x) = f(a) + f'(a)(x-a)` }
    ] },
  { id: 'u4', num: 4, color: 'var(--u4)', title: 'Applications of Derivatives',
    blurb: 'Use derivatives to find extremes, sketch graphs and make optimal choices.',
    key: String.raw`f'(c) = 0 \;\text{ or undefined}`,
    topics: [
      { id: 'extrema', href: 'extrema.html', mins: 35, title: 'Maximum and minimum values', q: 'Where can a function reach its highest and lowest points?', tex: String.raw`\text{critical number: } f'(c)=0 \text{ or DNE}` },
      { id: 'mvt', href: 'mvt.html', mins: 30, title: 'The Mean Value Theorem', q: 'If your average speed was 60 mph, were you ever going exactly 60?', tex: String.raw`f'(c) = \frac{f(b)-f(a)}{b-a}` },
      { id: 'shape', href: 'shape.html', mins: 35, title: 'How derivatives shape a graph', q: 'What do f′ and f″ reveal about rising, falling and bending?', tex: String.raw`f'' > 0 \implies \text{concave up}` },
      { id: 'lhopital', href: 'lhopital.html', mins: 35, title: 'Indeterminate forms and L’Hôpital’s Rule', q: 'When one part goes to 0 and another goes to ∞, which one wins?', tex: String.raw`\lim \frac{f}{g} = \lim \frac{f'}{g'}` },
      { id: 'curve-sketch', href: 'curve-sketch.html', mins: 40, title: 'Curve sketching', q: 'Can you draw a graph accurately using only calculus?', tex: String.raw`f,\ f',\ f'' \to \text{shape}` },
      { id: 'optimization', href: 'optimization.html', mins: 45, title: 'Optimization problems', q: 'What dimensions make a box that holds the most for the least material?', tex: String.raw`\text{maximize } A(x) \text{ subject to a constraint}` },
      { id: 'newton', href: 'newton.html', mins: 25, title: 'Newton’s Method', q: 'How can tangent lines hunt down a root?', tex: String.raw`x_{n+1} = x_n - \frac{f(x_n)}{f'(x_n)}` },
      { id: 'antiderivatives', href: 'antiderivatives.html', mins: 35, title: 'Antiderivatives', q: 'If you know the velocity, how do you recover the position?', tex: String.raw`F' = f` }
    ] },
  { id: 'u5', num: 5, color: 'var(--u5)', title: 'Integrals',
    blurb: 'Accumulation: from adding up rectangles to the Fundamental Theorem.',
    key: String.raw`\int_a^b f(x)\,dx = F(b) - F(a)`,
    topics: [
      { id: 'area-distance', href: 'area-distance.html', mins: 35, title: 'Areas and distances', q: 'How can rectangles approximate the area under a curve?', tex: String.raw`A \approx \sum_{i=1}^{n} f(x_i)\,\Delta x` },
      { id: 'definite-integral', href: 'definite-integral.html', mins: 35, title: 'The definite integral', q: 'What happens to a Riemann sum as the rectangles get infinitely thin?', tex: String.raw`\int_a^b f(x)\,dx = \lim_{n\to\infty}\sum f(x_i^*)\,\Delta x` },
      { id: 'ftc', href: 'ftc.html', mins: 40, title: 'The Fundamental Theorem of Calculus', q: 'Why are slopes and areas two sides of the same coin?', tex: String.raw`\frac{d}{dx}\int_a^x f(t)\,dt = f(x)` },
      { id: 'indefinite', href: 'indefinite.html', mins: 35, title: 'Indefinite integrals and net change', q: 'What does the “+ C” really mean?', tex: String.raw`\int f(x)\,dx = F(x) + C` },
      { id: 'substitution', href: 'substitution.html', mins: 40, title: 'The Substitution Rule', q: 'How do you run the Chain Rule in reverse?', tex: String.raw`\int f\big(g(x)\big)g'(x)\,dx = \int f(u)\,du` }
    ] },
  { id: 'u6', num: 6, color: 'var(--u6)', title: 'Applications of Integration', optional: true,
    blurb: 'Using integrals to measure regions and averages.',
    key: String.raw`\int_a^b \big[f(x) - g(x)\big]\,dx`,
    topics: [
      { id: 'area-between', href: 'area-between.html', mins: 35, title: 'Area between curves', q: 'How do you find the area of a region bounded by two graphs?', tex: String.raw`A = \int_a^b (\text{top} - \text{bottom})\,dx` },
      { id: 'average-value', href: 'average-value.html', mins: 30, title: 'Average value of a function', q: 'What is the “average height” of a curve?', tex: String.raw`f_{\text{avg}} = \frac{1}{b-a}\int_a^b f(x)\,dx` }
    ] }
];
