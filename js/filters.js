import { norm } from './util.js';

export const SORTS = {
  recent: 'Más recientes', priceAsc: 'Precio: menor a mayor', priceDesc: 'Precio: mayor a menor',
  kmAsc: 'Menos kilómetros', yearDesc: 'Más nuevos',
};
export const BODY_GROUPS = ['SUV / Todoterreno', 'Berlina', 'Compacto / Urbano', 'Familiar', 'Monovolumen', 'Furgoneta / Industrial'];
export const FUELS = ['Gasolina', 'Diésel', 'Híbrido', 'Híbrido enchufable', 'Eléctrico'];
export const PRICES = [10000, 15000, 20000, 25000, 30000, 40000, 50000, 75000];
export const KMS = [10000, 25000, 50000, 75000, 100000, 150000];
export const YEARS = [2024, 2022, 2020, 2018, 2016];

export const bodyGroup = (b) => ({
  Todoterreno: 'SUV / Todoterreno', Sedan: 'Berlina', Berlina: 'Berlina', Utilitario: 'Compacto / Urbano',
  Familiar: 'Familiar', Monovolumen: 'Monovolumen', Furgoneta: 'Furgoneta / Industrial', 'Vehículo Industrial': 'Furgoneta / Industrial',
}[b] || 'Otros');
export const fuelGroup = (f) => (/^Híbrido \(/.test(f || '') ? 'Híbrido' : f || 'Otro');

const STR = ['q', 'make', 'fuel', 'body', 'transmission', 'city'];
const NUM = ['maxPrice', 'maxKm', 'minYear'];
export const KEYS = [...STR, ...NUM];
export const emptyFilters = () => ({ q: '', make: '', fuel: '', body: '', transmission: '', city: '', maxPrice: '', maxKm: '', minYear: '', sort: 'recent' });

/** Query string → filtros saneados. */
export function parse(query = '') {
  const p = new URLSearchParams(query), f = emptyFilters();
  for (const k of STR) f[k] = (p.get(k) || '').slice(0, 60);
  for (const k of NUM) { const n = Number(p.get(k)); f[k] = Number.isFinite(n) && n > 0 ? n : ''; }
  f.sort = p.get('sort') in SORTS ? p.get('sort') : 'recent';
  return f;
}
export function stringify(f) {
  const p = new URLSearchParams();
  for (const k of KEYS) if (f[k] !== '' && f[k] != null) p.set(k, f[k]);
  if (f.sort && f.sort !== 'recent') p.set('sort', f.sort);
  return p.toString();
}
export const activeCount = (f) => KEYS.filter((k) => f[k] !== '' && f[k] != null).length;

export function matches(v, f) {
  if (f.q) { const t = norm(f.q).split(/\s+/).filter(Boolean); if (!t.every((w) => v._s.includes(w))) return false; }
  if (f.make && v.make !== f.make) return false;
  if (f.fuel && fuelGroup(v.fuel) !== f.fuel) return false;
  if (f.body && bodyGroup(v.body) !== f.body) return false;
  if (f.transmission && v.transmission !== f.transmission) return false;
  if (f.city && v.city !== f.city) return false;
  if (f.maxPrice && !(v.price <= f.maxPrice)) return false;
  if (f.maxKm && !(v.km <= f.maxKm)) return false;
  if (f.minYear && !(v.year >= f.minYear)) return false;
  return true;
}
const sorters = {
  recent: (a, b) => (b.created || '').localeCompare(a.created || ''),
  priceAsc: (a, b) => a.price - b.price, priceDesc: (a, b) => b.price - a.price,
  kmAsc: (a, b) => a.km - b.km, yearDesc: (a, b) => b.year - a.year || a.km - b.km,
};
export const run = (list, f) => list.filter((v) => matches(v, f)).sort(sorters[f.sort] || sorters.recent);

/** Opciones con recuento para un campo, sobre el stock en venta. */
export function facet(list, fn) {
  const m = new Map();
  for (const v of list) { const k = fn(v); if (k) m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].sort((a, b) => a[0].localeCompare(b[0], 'es'));
}

export const LABELS = {
  q: (v) => `“${v}”`, make: (v) => v, fuel: (v) => v, body: (v) => v, transmission: (v) => v, city: (v) => v,
  maxPrice: (v) => `Hasta ${new Intl.NumberFormat('es-ES').format(v)} €`,
  maxKm: (v) => `Hasta ${new Intl.NumberFormat('es-ES').format(v)} km`, minYear: (v) => `Desde ${v}`,
};
