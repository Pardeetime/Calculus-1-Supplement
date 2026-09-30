// Shared helpers: theme toggle, saved progress, math rendering.
(function () {
  const THEME_KEY = 'calc1-theme';
  const PROGRESS_KEY = 'calc1-progress';

  function safeGet(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch (e) { /* storage blocked */ } }

  // Apply the saved theme before first paint.
  const saved = safeGet(THEME_KEY);
  if (saved === 'light' || saved === 'dark') document.documentElement.dataset.theme = saved;

  function currentTheme() {
    const set = document.documentElement.dataset.theme;
    if (set) return set;
    return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  const SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"/></svg>';

  function paintThemeBtn(btn) {
    const dark = currentTheme() === 'dark';
    btn.innerHTML = dark ? SUN : MOON;
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  // Progress: { [topicId]: 0 | 1 | 2 | 3 } self-rated confidence.
  const Progress = {
    all() { try { return JSON.parse(safeGet(PROGRESS_KEY)) || {}; } catch (e) { return {}; } },
    get(id) { return this.all()[id] || 0; },
    set(id, level) { const p = this.all(); if (level) p[id] = level; else delete p[id]; safeSet(PROGRESS_KEY, JSON.stringify(p)); },
    reset() { safeSet(PROGRESS_KEY, '{}'); }
  };

  // Render every [data-tex] element with KaTeX (falls back to plain text if KaTeX failed to load).
  function renderMath(root) {
    (root || document).querySelectorAll('[data-tex]').forEach(el => {
      const tex = el.getAttribute('data-tex');
      if (window.katex) {
        try { katex.render(tex, el, { throwOnError: false, displayMode: el.hasAttribute('data-display') }); return; } catch (e) { /* fall through */ }
      }
      el.textContent = tex;
    });
    // Inline \( ... \) and display \[ ... \] math in prose (needs KaTeX auto-render).
    if (window.renderMathInElement) {
      renderMathInElement(root || document.body, {
        delimiters: [{ left: '\\[', right: '\\]', display: true }, { left: '\\(', right: '\\)', display: false }],
        throwOnError: false
      });
    }
  }

  // Practice problems the student has solved: { [problemId]: true }.
  const SOLVED_KEY = 'calc1-solved';
  const Solved = {
    all() { try { return JSON.parse(safeGet(SOLVED_KEY)) || {}; } catch (e) { return {}; } },
    has(id) { return !!this.all()[id]; },
    add(id) { const s = this.all(); s[id] = true; safeSet(SOLVED_KEY, JSON.stringify(s)); }
  };

  window.Calc = { Progress, Solved, renderMath, currentTheme };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('themeBtn');
    if (!btn) return;
    paintThemeBtn(btn);
    btn.addEventListener('click', () => {
      const next = currentTheme() === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      safeSet(THEME_KEY, next);
      paintThemeBtn(btn);
      document.dispatchEvent(new CustomEvent('themechange'));
    });
  });
})();
