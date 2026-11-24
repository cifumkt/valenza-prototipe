import { $$, reduceMotion } from './util.js';

let io;
/** Animación de entrada al hacer scroll (.reveal y .card). Respeta prefers-reduced-motion. */
export function initReveal(root = document) {
  const els = $$('.reveal:not(.is-in), .card:not(.is-in)', root);
  if (!els.length) return;
  if (reduceMotion() || !('IntersectionObserver' in window)) { els.forEach((e) => e.classList.add('is-in')); return; }
  io ??= new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
  }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });
  els.forEach((el, i) => {
    el.classList.add('pre');
    el.style.setProperty('--rd', `${Math.min(i % 4, 3) * 70}ms`);
    io.observe(el);
  });
}

/** Contadores animados: <b data-count="168">0</b> */
export function initCounters(root = document) {
  $$('[data-count]', root).forEach((el) => {
    const to = Number(el.dataset.count) || 0;
    if (reduceMotion()) { el.textContent = to; return; }
    const io2 = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      io2.disconnect();
      const t0 = performance.now(), dur = 1100;
      const tick = (t) => { const p = Math.min(1, (t - t0) / dur); el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: 0.6 });
    io2.observe(el);
  });
}
