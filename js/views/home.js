import { h, fmt, money, $, $$, esc } from '../util.js';
import { icon } from '../icons.js';
import { CONFIG } from '../config.js';
import { forSale } from '../store.js';
import { card, pic } from '../components.js';
import { BODY_GROUPS, PRICES, bodyGroup, fuelGroup, facet, run, emptyFilters, stringify } from '../filters.js';
import { deliverySection, mountDelivery } from '../map.js';

const BODY_ICON = { 'SUV / Todoterreno': 'suv', Berlina: 'sedan', 'Compacto / Urbano': 'urban', Familiar: 'family', Monovolumen: 'mono', 'Furgoneta / Industrial': 'van' };
const q = (obj) => '#/catalogo?' + new URLSearchParams(obj).toString();

export default function home() {
  const list = forSale();
  const makes = facet(list, (v) => v.make);
  const bodyCount = (g) => list.filter((v) => bodyGroup(v.body) === g).length;
  const fuelCount = (g) => list.filter((v) => fuelGroup(v.fuel) === g).length;
  const latest = [...list].filter((v) => v.photo && v.price > 12000).sort((a, b) => (b.created || '').localeCompare(a.created || '')).slice(0, 8);
  const topMakes = [...makes].sort((a, b) => b[1] - a[1]).slice(0, 14).map(([m]) => m);
  const cities = facet(list, (v) => v.city).length;

  const html = h`
  <section class="hero">
    ${pic('hero', [800, 1600], '100vw', 'Interior del showroom de Valenza con un Mercedes y la pared de marca', 1600, 1200, 'hero-img', false)}
    <div class="hero-shade"></div>
    <div class="wrap hero-inner">
      <p class="eyebrow rise">Valenza Exclusive Autos</p>
      <h1><span class="line"><span class="rise" data-d="1">Tu próximo coche</span></span><span class="line"><span class="rise" data-d="2">está aquí<i>.</i></span></span></h1>
      <p class="lede rise" data-d="3">${fmt(list.length)} coches de ocasión, seminuevos y KM0 con financiación y entrega en toda la península.</p>
      <form class="finder rise" data-d="4" id="finder" novalidate>
        <label class="f"><span>Marca</span><select name="make"><option value="">Todas</option>${makes.map(([m, n]) => h`<option value="${m}">${m} (${n})</option>`)}</select></label>
        <label class="f"><span>Tipo</span><select name="body"><option value="">Todos</option>${BODY_GROUPS.map((g) => h`<option value="${g}">${g} (${bodyCount(g)})</option>`)}</select></label>
        <label class="f"><span>Precio máximo</span><select name="maxPrice"><option value="">Sin límite</option>${PRICES.map((p) => h`<option value="${p}">${fmt(p)} €</option>`)}</select></label>
        <button class="btn btn-red btn-lg" type="submit" id="finderGo">Ver ${fmt(list.length)} coches ${icon('arrow')}</button>
      </form>
      <div class="quick rise" data-d="5" aria-label="Búsquedas rápidas">
        <a class="chip" href="${q({ transmission: 'Automático' })}">Automático</a>
        <a class="chip" href="${q({ fuel: 'Eléctrico' })}">${icon('bolt')}Eléctrico</a>
        <a class="chip" href="${q({ fuel: 'Híbrido' })}">${icon('leaf')}Híbrido</a>
        <a class="chip" href="${q({ body: 'SUV / Todoterreno' })}">SUV</a>
        <a class="chip" href="${q({ maxPrice: 15000 })}">Hasta 15.000 €</a>
        <a class="chip" href="${q({ minYear: 2024 })}">Casi nuevos</a>
      </div>
    </div>
  </section>

  <section class="proof"><div class="wrap proof-grid">
    <div class="proof-item reveal"><span class="ico">${icon('car')}</span><div><strong><b data-count="${list.length}">0</b> coches</strong><small>en stock hoy</small></div></div>
    <div class="proof-item reveal"><span class="ico">${icon('pin')}</span><div><strong><b data-count="${CONFIG.SEDES.length}">0</b> sedes</strong><small>Córdoba, Jaén, Úbeda y Málaga</small></div></div>
    <div class="proof-item reveal"><span class="ico">${icon('credit')}</span><div><strong>Financiación</strong><small>Cuota orientativa en cada coche</small></div></div>
    <div class="proof-item reveal"><span class="ico">${icon('truck')}</span><div><strong>Entrega en España</strong><small>Península, a tu puerta</small></div></div>
  </div></section>

  <div class="marquee" aria-hidden="true"><div class="marquee-track">${[0, 1].map(() => h`<ul>${topMakes.map((m) => h`<li>${m}</li>`)}</ul>`)}</div></div>

  <section class="section"><div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">Recién llegados</p><h2>Últimas incorporaciones</h2></div><a class="more" href="#/catalogo">Ver todos ${icon('arrow')}</a></div>
    <div class="rail">${latest.map(card)}</div>
  </div></section>

  <section class="section tint"><div class="wrap budget reveal">
    <div><p class="eyebrow">Calculadora de cuota</p><h2>¿Cuánto quieres pagar al mes?</h2><p class="lede">Mueve el control y te enseñamos los coches que encajan con esa cuota. Cálculo orientativo con entrada del ${CONFIG.FINANCE_ENTRY_PCT} % y ${CONFIG.FINANCE_MONTHS} meses.</p></div>
    <div class="budget-card">
      <div class="budget-value"><output id="budgetOut">250 €</output><span>/ mes</span></div>
      <input id="budgetRange" type="range" min="100" max="700" step="10" value="250" aria-label="Cuota mensual deseada">
      <p class="budget-result" id="budgetRes"></p>
      <a class="btn btn-red" id="budgetGo" href="#/catalogo">Ver coches ${icon('arrow')}</a>
      <p class="fine">TIN ${CONFIG.TIN.toString().replace('.', ',')} % de ejemplo. No es oferta vinculante; TAE y condiciones pendientes de confirmar.</p>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">Explora</p><h2>Un coche para cada forma de vivir</h2></div></div>
    <div class="tiles">${BODY_GROUPS.map((g) => h`<a class="tile reveal" href="${q({ body: g })}"><span class="ico">${icon(BODY_ICON[g] || 'car')}</span><strong>${g}</strong><small>${bodyCount(g)} coches</small><span class="go">${icon('arrow')}</span></a>`)}</div>
    <div class="energy reveal"><span>Por energía</span>
      <a class="chip" href="${q({ fuel: 'Eléctrico' })}">${icon('bolt')}Eléctrico · ${fuelCount('Eléctrico')}</a>
      <a class="chip" href="${q({ fuel: 'Híbrido enchufable' })}">${icon('leaf')}Híbrido enchufable · ${fuelCount('Híbrido enchufable')}</a>
      <a class="chip" href="${q({ fuel: 'Híbrido' })}">Híbrido · ${fuelCount('Híbrido')}</a>
      <a class="chip" href="${q({ fuel: 'Diésel' })}">Diésel · ${fuelCount('Diésel')}</a>
      <a class="chip" href="${q({ fuel: 'Gasolina' })}">Gasolina · ${fuelCount('Gasolina')}</a>
    </div>
  </div></section>

  <section class="section dark showroom"><div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">Conoce Valenza</p><h2>Pasión por cada detalle</h2></div><a class="more" href="#/contacto">Visítanos ${icon('arrow')}</a></div>
    <div class="bento">
      <figure class="reveal b1">${pic('santafe', [600, 1000], '(min-width:900px) 34vw, 90vw', 'Vehículos expuestos en Valenza', 1000, 1333)}<figcaption>Selección</figcaption></figure>
      <figure class="reveal b2">${pic('gama', [800, 1400], '(min-width:900px) 40vw, 90vw', 'Gama de coches en el concesionario', 1400, 1050)}<figcaption>Instalaciones</figcaption></figure>
      <figure class="reveal b3">${pic('abarth', [600, 1000], '(min-width:900px) 24vw, 45vw', 'Detalle de un Abarth azul', 1000, 1333)}<figcaption>Detalles</figcaption></figure>
      <figure class="reveal b4">${pic('exposicion', [600, 1000], '(min-width:900px) 24vw, 45vw', 'Exposición con la identidad de Valenza', 1000, 1333)}<figcaption>Exposición</figcaption></figure>
    </div>
  </div></section>

  <section class="section"><div class="wrap">
    <div class="section-head reveal"><div><p class="eyebrow">Servicios</p><h2>Más que un catálogo</h2></div></div>
    <div class="services">
      <a class="service reveal" href="#/tasacion"><span class="ico">${icon('key')}</span><h3>Vende tu coche</h3><p>Dinos qué coche tienes y te orientamos en la tasación.</p><span class="go">${icon('arrow')}</span></a>
      <a class="service reveal" href="#/coche-a-la-carta"><span class="ico">${icon('search')}</span><h3>Coche a la carta</h3><p>Tú imaginas el coche, nosotros lo buscamos, de cualquier marca.</p><span class="go">${icon('arrow')}</span></a>
      <a class="service reveal" href="#/financiacion"><span class="ico">${icon('credit')}</span><h3>Financiación</h3><p>Simula tu cuota según entrada y plazo antes de decidir.</p><span class="go">${icon('arrow')}</span></a>
    </div>
  </div></section>

  ${deliverySection()}

  <section class="cta"><div class="wrap cta-inner reveal"><h2>¿Hablamos?</h2><p>Cuéntanos qué buscas y te ayudamos a encontrarlo.</p><a class="btn btn-red btn-lg" href="#/contacto">Contactar ${icon('arrow')}</a></div></section>`;

  return {
    title: 'Valenza Exclusive Autos · Coches de ocasión, seminuevos y KM0',
    desc: 'Coches de ocasión, seminuevos y KM0 con financiación y entrega en toda la península. Córdoba, Jaén, Úbeda y Málaga.',
    html,
    mount(root) {
      const form = $('#finder', root), go = $('#finderGo', root);
      const filters = () => { const f = emptyFilters(); new FormData(form).forEach((v, k) => { f[k] = k === 'maxPrice' && v ? Number(v) : v; }); return f; };
      const upd = () => { go.firstChild.textContent = `Ver ${fmt(run(list, filters()).length)} coches `; };
      form.addEventListener('change', upd);
      form.addEventListener('submit', (e) => { e.preventDefault(); location.hash = '#/catalogo?' + stringify(filters()); });

      // Calculadora inversa: cuota → precio máximo
      const range = $('#budgetRange', root), out = $('#budgetOut', root), res = $('#budgetRes', root), link = $('#budgetGo', root);
      const r = CONFIG.TIN / 1200, n = CONFIG.FINANCE_MONTHS;
      const maxPrice = (fee) => Math.floor(((fee * (1 - Math.pow(1 + r, -n))) / r) / (1 - CONFIG.FINANCE_ENTRY_PCT / 100) / 500) * 500;
      const calc = () => {
        const fee = Number(range.value), mp = maxPrice(fee), c = run(list, { ...emptyFilters(), maxPrice: mp }).length;
        out.textContent = `${fmt(fee)} €`;
        res.innerHTML = `Coches de hasta <strong>${esc(fmt(mp))} €</strong>: <strong>${esc(c)}</strong> disponibles`;
        link.href = '#/catalogo?' + stringify({ ...emptyFilters(), maxPrice: mp });
        const pct = ((fee - range.min) / (range.max - range.min)) * 100;
        range.style.setProperty('--p', pct + '%');
      };
      range.addEventListener('input', calc); calc();
      const off = mountDelivery(root);
      return () => off();
    },
  };
}
