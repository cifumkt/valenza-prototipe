import { norm } from './util.js';

let stock = null;
const carCache = new Map();

export async function loadStock() {
  if (stock) return stock;
  const r = await fetch('./data/stock.json');
  if (!r.ok) throw new Error('No se pudo cargar el stock');
  stock = await r.json();
  for (const v of stock) v._s = norm(`${v.make} ${v.model} ${v.title} ${v.year}`);
  return stock;
}
export const getStock = () => stock || [];
export const forSale = () => getStock().filter((v) => v.status === 'En venta');
export const byId = (id) => getStock().find((v) => v.id === Number(id));

export async function loadCar(id) {
  id = Number(id);
  if (!Number.isInteger(id)) throw new Error('id');
  if (carCache.has(id)) return carCache.get(id);
  const r = await fetch(`./data/cars/${id}.json`);
  if (!r.ok) throw new Error('ficha');
  const d = await r.json();
  carCache.set(id, d);
  return d;
}

// ── Favoritos y comparador (localStorage, tolerante a fallos) ──
const read = (k) => {
  try {
    const a = JSON.parse(localStorage.getItem('valenza-' + k) || '[]');
    return Array.isArray(a) ? a.filter(Number.isInteger) : [];
  } catch { return []; }
};
const write = (k, v) => { try { localStorage.setItem('valenza-' + k, JSON.stringify(v)); } catch { /* modo privado / cuota */ } };
const changed = () => document.dispatchEvent(new CustomEvent('valenza:store'));

export const favs = () => read('favs');
export const compare = () => read('compare');
export function toggleFav(id) {
  const a = favs();
  const on = !a.includes(id);
  write('favs', on ? [...a, id] : a.filter((x) => x !== id));
  changed();
  return on;
}
export function toggleCompare(id) {
  const a = compare();
  if (a.includes(id)) { write('compare', a.filter((x) => x !== id)); changed(); return 'removed'; }
  if (a.length >= 3) return 'full';
  write('compare', [...a, id]); changed();
  return 'added';
}
