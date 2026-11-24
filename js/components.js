import { h, raw, fmt, money, payment, safeUrl, $, $$ } from './util.js';
import { icon } from './icons.js';
import { CONFIG, waLink, telLink } from './config.js';
import { favs, compare } from './store.js';

export const NAV = [
  ['#/catalogo', 'Coches'], ['#/tasacion', 'Vende tu coche'], ['#/coche-a-la-carta', 'A la carta'],
  ['#/financiacion', 'Financiación'], ['#/contacto', 'Contacto'],
];

/** <img> responsive con las variantes WebP generadas (nombre-ancho.webp). */
export const pic = (name, widths, sizes, alt, w, hgt, cls = '', lazy = true) => h`<img class="${cls}" src="./assets/img/${name}-${widths[widths.length - 1]}.webp" srcset="${widths.map((x) => `./assets/img/${name}-${x}.webp ${x}w`).join(', ')}" sizes="${sizes}" alt="${alt}" width="${w}" height="${hgt}" ${lazy ? raw('loading="lazy"') : raw('fetchpriority="high"')} decoding="async">`;

export const logo = (cls = '') => h`<img class="logo ${cls}" src="./assets/img/logo-a.webp" width="173" height="36" alt="Valenza Exclusive Autos">`;

export function shell() {
  return h`
  <a class="skip" href="#main" data-skip>Saltar al contenido</a>
  ${CONFIG.BANNER ? h`<div class="banner">${CONFIG.BANNER}</div>` : ''}
  <header class="header" id="header">
    <div class="wrap nav">
      <a class="brand" href="#/" aria-label="Valenza Exclusive Autos, inicio">${logo()}</a>
      <nav class="nav-links" aria-label="Principal">${NAV.map(([href, t]) => h`<a href="${href}">${t}</a>`)}</nav>
      <div class="nav-actions">
        <a class="icon-btn" href="#/favoritos" aria-label="Favoritos">${icon('heart')}<span class="count" id="favCount" hidden>0</span></a>
        <a class="icon-btn" href="#/comparar" aria-label="Comparar">${icon('swap')}<span class="count" id="cmpCount" hidden>0</span></a>
        <button class="icon-btn burger" data-action="menu" aria-label="Abrir menú" aria-expanded="false" aria-controls="menu">${icon('menu')}</button>
      </div>
    </div>
  </header>
  <div class="menu" id="menu" hidden>
    <nav class="menu-links" aria-label="Menú móvil">
      ${[['#/', 'Inicio'], ...NAV, ['#/favoritos', 'Favoritos']].map(([href, t]) => h`<a href="${href}">${t}<span>${icon('arrow')}</span></a>`)}
    </nav>
    <p class="menu-foot">Ocasión, seminuevos y KM0<br>Córdoba · Jaén · Úbeda · Málaga</p>
  </div>
  <main id="main" tabindex="-1"></main>
  ${footer()}
  <button class="fab" data-action="contact" aria-label="Contactar con Valenza">${icon('chat')}</button>
  <dialog id="sheet" class="sheet" aria-label="Contacto"></dialog>
  <div id="toast" class="toast" role="status" aria-live="polite"></div>`;
}

function footer() {
  return h`<footer class="footer"><div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">${logo()}<p>Una forma más clara de encontrar tu próximo coche. Ocasión, seminuevos y KM0 con entrega en toda la península.</p></div>
      <div><h4>Explora</h4><a href="#/catalogo">Todos los coches</a><a href="#/tasacion">Vende tu coche</a><a href="#/coche-a-la-carta">Coche a la carta</a><a href="#/financiacion">Financiación</a><a href="#/comparar">Comparador</a></div>
      <div><h4>Sedes</h4>${CONFIG.SEDES.map((s) => h`<a href="#/catalogo?city=${encodeURIComponent(s.id)}">${s.id}</a>`)}<a href="#/contacto">Contacto</a></div>
      <div><h4>Legal</h4><a href="#/legal">Aviso legal</a><a href="#/legal">Privacidad</a><a href="#/legal">Cookies</a></div>
    </div>
    <div class="footer-bottom"><span>© ${new Date().getFullYear()} Valenza Exclusive Autos</span><span>Precios y disponibilidad sujetos a confirmación. Cuotas orientativas, no vinculantes.</span></div>
  </div></footer>`;
}

const ecoTag = (b) => (b === 'ECO' ? 'ECO' : b === 'Cero emisiones' ? '0 emisiones' : '');

export const fee = (price) => (price ? payment(price * (1 - CONFIG.FINANCE_ENTRY_PCT / 100), CONFIG.FINANCE_MONTHS, CONFIG.TIN) : 0);

export function card(v) {
  const isFav = favs().includes(v.id), eco = ecoTag(v.badge), monthly = fee(v.price);
  return h`<article class="card" data-id="${v.id}">
    <a class="card-media" href="#/coche/${v.id}" tabindex="-1" aria-hidden="true" data-card-link>
      ${v.photo ? h`<img src="${safeUrl(v.photo)}" alt="${v.title}" loading="lazy" decoding="async" width="480" height="360" referrerpolicy="no-referrer">` : h`<span class="noimg">Sin imagen</span>`}
      <span class="tags">
        ${v.status !== 'En venta' ? h`<span class="tag tag-status">${v.status}</span>` : ''}
        ${v.previousPrice > v.price ? h`<span class="tag tag-sale">Rebajado</span>` : ''}
        ${eco ? h`<span class="tag tag-eco">${icon('leaf')}${eco}</span>` : ''}
      </span>
    </a>
    <button class="fav" data-action="fav" data-id="${v.id}" aria-pressed="${isFav}" aria-label="${isFav ? 'Quitar de favoritos' : 'Guardar en favoritos'}: ${v.title}">${icon('heart')}</button>
    <div class="card-body">
      <h3><a href="#/coche/${v.id}" data-card-link>${v.title}</a></h3>
      <p class="card-spec"><span>${v.year || '—'} · ${fmt(v.km)} km</span><span>${[v.fuel, v.transmission].filter(Boolean).join(' · ')}</span></p>
      <div class="card-price"><strong>${money(v.price)}</strong>${monthly ? h`<small>desde ${fmt(Math.round(monthly))} €/mes*</small>` : ''}</div>
    </div>
  </article>`;
}

// ── Avisos y cuadros de diálogo ──
let toastTimer;
export function toast(msg) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

export function openSheet(content) {
  const d = $('#sheet');
  d.innerHTML = content.toString();
  if (!d.open) d.showModal();
}
export const closeSheet = () => { const d = $('#sheet'); if (d?.open) d.close(); };

/** Hoja de contacto: WhatsApp / llamar si están configurados; si no, mensaje preparado + formulario. */
export function contactSheet(v) {
  const msg = v
    ? `Hola, estoy interesado en el ${v.title} (ref. ${v.id}) anunciado por ${money(v.price)}. ¿Podéis darme más información?`
    : 'Hola, me gustaría recibir información sobre vuestros vehículos.';
  const wa = waLink(msg), tel = telLink();
  return h`<div class="sheet-head"><h2>${v ? 'Consultar este coche' : 'Hablemos'}</h2><button class="icon-btn light" data-action="close-sheet" aria-label="Cerrar">${icon('close')}</button></div>
    ${v ? h`<p class="sheet-car"><strong>${v.title}</strong><span>${money(v.price)} · ${fmt(v.km)} km · ${v.year}</span></p>` : ''}
    <label class="sheet-label" for="sheetMsg">Mensaje preparado</label>
    <textarea id="sheetMsg" class="sheet-msg" rows="3" readonly>${msg}</textarea>
    <div class="sheet-actions">
      ${wa ? h`<a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener noreferrer">${icon('chat')} WhatsApp</a>` : ''}
      ${tel ? h`<a class="btn btn-ghost" href="${tel}">${icon('phone')} Llamar</a>` : ''}
      <button class="btn ${wa ? 'btn-ghost' : 'btn-red'}" data-action="copy" data-text="${msg}">${icon('copy')} Copiar mensaje</button>
      <a class="btn btn-ghost" href="#/contacto${v ? `?coche=${v.id}` : ''}" data-action="close-sheet">${icon('arrow')} Enviar consulta</a>
    </div>
    ${!wa && !tel ? h`<p class="sheet-note">WhatsApp y teléfono se activarán al configurar los datos de contacto (js/config.js).</p>` : ''}`;
}
