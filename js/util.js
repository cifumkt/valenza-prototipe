// Utilidades comunes. `h` es una plantilla que ESCAPA automáticamente todo valor
// interpolado (salvo el HTML que ya viene de otra plantilla `h` o de `raw`),
// de modo que un dato malicioso nunca puede inyectar HTML.
export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '`': '&#96;' };
export const esc = (s) => String(s ?? '').replace(/[&<>"'`]/g, (c) => ESC[c]);

class Raw { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Raw(s);
const val = (v) => (v == null || v === false ? '' : v instanceof Raw ? v.s : Array.isArray(v) ? v.map(val).join('') : esc(v));
export const h = (strings, ...vals) => new Raw(strings.reduce((a, s, i) => a + s + (i < vals.length ? val(vals[i]) : ''), ''));

const nf = new Intl.NumberFormat('es-ES');
export const fmt = (n) => nf.format(n || 0);
export const money = (n) => (n ? `${fmt(Math.round(n))} €` : 'Consultar');
export const moneyExact = (n) => new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(n);

/** Cuota mensual (amortización francesa). tin en %, sin comisiones ni seguros. */
export function payment(principal, months, tin) {
  const r = tin / 100 / 12;
  return r ? (principal * r) / (1 - Math.pow(1 + r, -months)) : principal / months;
}

/** Solo acepta URLs https para imágenes remotas. */
export const safeUrl = (u) => (typeof u === 'string' && /^https:\/\//i.test(u) ? u : '');

export const norm = (s) => String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const debounce = (fn, ms = 160) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
