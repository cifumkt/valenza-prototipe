// Genera data/stock.json (listado ligero) y data/cars/<id>.json (ficha completa)
// a partir de data-src/vehicles.json (exportación SANEADA de Inventario Pro).
// Uso:  node scripts/build-data.mjs
// NUNCA metas aquí el JSON original con matrículas/bastidores.
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';

const src = JSON.parse(readFileSync(new URL('../data-src/vehicles.json', import.meta.url)));
const FORBIDDEN = ['plate', 'matricula', 'vin', 'bastidor', 'company', 'sociedad'];
const out = new URL('../data/', import.meta.url);
rmSync(new URL('cars/', out), { recursive: true, force: true });
mkdirSync(new URL('cars/', out), { recursive: true });

const clean = (s) => (typeof s === 'string' ? s.replace(/[\u0000-\u001f<>]/g, ' ').trim() : s);
const stock = [];
for (const v of src) {
  for (const k of Object.keys(v)) if (FORBIDDEN.includes(k.toLowerCase())) throw new Error(`Campo prohibido: ${k}`);
  const id = Number(v.id);
  stock.push({
    id, title: clean(v.title), make: clean(v.make), model: clean(v.model), body: clean(v.body),
    status: v.status, created: v.created, year: v.year, km: v.km, fuel: v.fuel, transmission: v.transmission,
    power: v.power, badge: v.badge, city: v.city, price: v.price, financePrice: v.financePrice,
    previousPrice: v.previousPrice, photo: v.photos?.[0] || null, n: v.photos?.length || 0,
  });
  writeFileSync(new URL(`cars/${id}.json`, out), JSON.stringify({
    id, version: clean(v.version), color: clean(v.color), doors: v.doors, seats: v.seats, registered: v.registered,
    warrantyMonths: v.warrantyMonths, photos: v.photos || [], equipment: (v.equipment || []).map(clean),
  }));
}
writeFileSync(new URL('stock.json', out), JSON.stringify(stock));
console.log(`OK · ${stock.length} vehículos · stock.json ${(JSON.stringify(stock).length / 1024).toFixed(0)} KB`);
