import { $, $$, h, reduceMotion } from './util.js';
import { sprite } from './icons.js';
import { shell, toast, openSheet, closeSheet, contactSheet } from './components.js';
import { loadStock, byId, favs, compare, toggleFav, toggleCompare } from './store.js';
import { initReveal, initCounters } from './reveal.js';
import home from './views/home.js';
import catalog from './views/catalog.js';
import detail from './views/detail.js';
import { finance, favourites, comparePage, valuation, bespoke, contact, legal, notFound } from './views/pages.js';

const ROUTES = {
  '': home, catalogo: catalog, coche: detail, favoritos: favourites, comparar: comparePage,
  tasacion: valuation, 'vende-tu-coche': valuation, 'coche-a-la-carta': bespoke, financiacion: finance, contacto: contact, legal,
};
const SITE = 'Valenza';
let main, token = 0, cleanup = null, first = true;

const parseHash = () => {
  const [path, query = ''] = location.hash.replace(/^#\/?/, '').split('?');
  const clean = path.replace(/\/+$/, '');
  return { path: clean, query, parts: clean.split('/') };
};

// ── Navegación ──
async function go() {
  const my = ++token, ctx = parseHash();
  let res;
  try {
    const view = ROUTES[ctx.parts[0]];
    res = view ? await view(ctx) : notFound();
  } catch (err) {
    console.error(err);
    res = { title: `Error · ${SITE}`, desc: '', html: h`<section class="page-hero"><div class="wrap"><p class="eyebrow">Ups</p><h1>No hemos podido cargar esta página</h1><p class="lede">Comprueba tu conexión e inténtalo de nuevo.</p><a class="btn btn-red btn-lg" href="#/">Ir al inicio</a></div></section>` };
  }
  if (my !== token) return;

  const apply = () => {
    cleanup?.(); cleanup = null;
    closeMenu(); closeSheet();
    main.innerHTML = res.html.toString();
    document.title = res.title || SITE;
    $('meta[name="description"]')?.setAttribute('content', res.desc || '');
    document.body.dataset.route = ctx.parts[0] || 'home';
    $$('.nav-links a, .menu-links a').forEach((a) => {
      const on = a.getAttribute('href') === '#/' + ctx.parts[0] || (ctx.parts[0] === '' && a.getAttribute('href') === '#/');
      on ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current');
    });
    cleanup = res.mount?.(main, ctx) || null;
    initReveal(main); initCounters(main);
    syncButtons();
    const y = history.state?.y;
    scrollTo({ top: typeof y === 'number' ? y : 0, behavior: 'instant' });
    document.body.classList.remove('header-hidden');
    if (!first) main.focus({ preventScroll: true });
    first = false;
  };
  if (document.startViewTransition && !reduceMotion() && !first) document.startViewTransition(apply);
  else apply();
}

// ── Menú móvil ──
const menu = () => $('#menu');
function closeMenu() {
  const m = menu(); if (!m || m.hidden) return;
  m.hidden = true; document.body.classList.remove('menu-open', 'no-scroll');
  const b = $('.burger'); b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-label', 'Abrir menú');
}
function toggleMenu() {
  const m = menu(), open = m.hidden;
  if (!open) return closeMenu();
  m.hidden = false; document.body.classList.add('menu-open', 'no-scroll', 'header-pinned');
  const b = $('.burger'); b.setAttribute('aria-expanded', 'true'); b.setAttribute('aria-label', 'Cerrar menú');
}

// ── Favoritos / comparador: estado en botones y contadores ──
function syncButtons() {
  const f = favs(), c = compare();
  for (const [id, el, n] of [['favCount', 'fav', f.length], ['cmpCount', 'cmp', c.length]]) { const e = $('#' + id); if (e) { e.hidden = !n; e.textContent = n; } }
  $$('[data-action="fav"]').forEach((b) => {
    const on = f.includes(+b.dataset.id);
    b.setAttribute('aria-pressed', on); b.classList.toggle('on', on);
    const t = $('span', b); if (t && b.classList.contains('mini')) t.textContent = on ? 'Guardado' : 'Guardar';
    if (!b.classList.contains('mini')) b.setAttribute('aria-label', (on ? 'Quitar de favoritos' : 'Guardar en favoritos') + ': ' + (byId(b.dataset.id)?.title || ''));
  });
  $$('[data-action="compare"].mini').forEach((b) => {
    const on = c.includes(+b.dataset.id);
    b.setAttribute('aria-pressed', on); b.classList.toggle('on', on);
    const t = $('span', b); if (t) t.textContent = on ? 'En comparador' : 'Comparar';
  });
}

// ── Eventos globales (delegación; no hay manejadores en línea) ──
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (a?.hasAttribute('data-skip')) { e.preventDefault(); main.focus(); return; }
  if (a && a.getAttribute('href').startsWith('#/')) {
    // guarda el scroll de la página actual para restaurarlo al volver
    history.replaceState({ ...(history.state || {}), y: scrollY }, '');
    if (a.matches('[data-card-link]') && !reduceMotion()) a.closest('.card')?.querySelector('img')?.style.setProperty('view-transition-name', 'car-photo');
  }
  const el = e.target.closest('[data-action]');
  if (el) {
    const id = Number(el.dataset.id);
    switch (el.dataset.action) {
      case 'menu': toggleMenu(); break;
      case 'fav': {
        const on = toggleFav(id); el.classList.add('pop'); setTimeout(() => el.classList.remove('pop'), 400);
        toast(on ? 'Guardado en favoritos' : 'Quitado de favoritos'); break;
      }
      case 'compare': {
        const r = toggleCompare(id);
        toast(r === 'full' ? 'Puedes comparar hasta 3 coches' : r === 'added' ? 'Añadido al comparador' : 'Quitado del comparador'); break;
      }
      case 'contact': openSheet(contactSheet(byId(id))); break;
      case 'close-sheet': closeSheet(); break;
      case 'copy': navigator.clipboard?.writeText(el.dataset.text || '').then(() => toast('Mensaje copiado'), () => toast('Copia el mensaje manualmente')); break;
    }
    return;
  }
  const sheet = $('#sheet');
  if (e.target === sheet) closeSheet(); // clic en el fondo
  if (a && menu() && !menu().hidden) closeMenu();
});
document.addEventListener('valenza:store', syncButtons);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
addEventListener('hashchange', go);

// Cabecera: cristal al hacer scroll y se oculta al bajar
let lastY = 0, ticking = false;
addEventListener('scroll', () => {
  if (ticking) return; ticking = true;
  requestAnimationFrame(() => {
    const y = scrollY, hd = $('#header');
    hd?.classList.toggle('scrolled', y > 8);
    document.body.classList.toggle('fab-on', y > 420);
    const hide = y > lastY + 4 && y > 360 && menu()?.hidden !== false;
    if (hide !== document.body.classList.contains('header-hidden') && Math.abs(y - lastY) > 4) document.body.classList.toggle('header-hidden', hide);
    lastY = y; ticking = false;
  });
}, { passive: true });

// ── Arranque ──
history.scrollRestoration = 'manual';
document.body.insertAdjacentHTML('afterbegin', sprite());
$('#app').innerHTML = shell().toString();
main = $('#main');
main.innerHTML = '<div class="loader" role="status">Cargando Valenza…</div>';
loadStock().then(go).catch((err) => {
  console.error(err);
  main.innerHTML = '<section class="page-hero"><div class="wrap"><p class="eyebrow">Sin conexión</p><h1>No se pudo cargar el catálogo</h1><p class="lede">Si estás probando en local, abre la web con un servidor (<code>npx serve</code> o <code>python3 -m http.server</code>) en lugar de hacer doble clic en index.html.</p></div></section>';
});
syncButtons();
