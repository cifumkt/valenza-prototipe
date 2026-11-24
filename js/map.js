import { h, raw, $, $$ } from './util.js';
import { icon } from './icons.js';
import { GEO } from './map-data.js';

export function deliverySection() {
  const { W, H, peninsula, points, origin } = GEO;
  const routes = points.map((p) => {
    const mx = (origin.x + p.x) / 2, my = (origin.y + p.y) / 2, dx = p.x - origin.x, dy = p.y - origin.y;
    const qx = (mx - dy * 0.11).toFixed(1), qy = (my + dx * 0.11).toFixed(1);
    return h`<path class="route" pathLength="1" data-city="${p.n}" d="M${origin.x},${origin.y} Q${qx},${qy} ${p.x},${p.y}"/>`;
  });
  return h`<section class="section dark delivery" id="envios"><div class="wrap delivery-grid">
    <div class="delivery-copy reveal">
      <p class="eyebrow">Entrega peninsular</p>
      <h2>Te llevamos el coche a casa.</h2>
      <p class="lede">Desde Córdoba entregamos en toda la España peninsular. Toca una ciudad para ver la conexión y consulta condiciones con nuestro equipo.</p>
      <div class="dest-list" role="group" aria-label="Destinos">${points.map((p) => h`<button class="dest" data-dest="${p.n}" aria-pressed="false">${p.n}</button>`)}</div>
      <p class="fine">Mapa ilustrativo: no indica itinerarios ni plazos. Servicio sujeto a confirmación.</p>
    </div>
    <div class="map reveal" id="deliveryMap">
      <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Mapa de España con conexiones desde Córdoba a varias ciudades">
        <path class="map-shape" d="${raw(peninsula)}"/>
        ${routes}
        ${points.map((p) => h`<circle class="map-dot" data-city="${p.n}" cx="${p.x}" cy="${p.y}" r="3.6"/>`)}
        <circle class="origin-halo" cx="${origin.x}" cy="${origin.y}" r="13"/>
        <circle class="origin-dot" cx="${origin.x}" cy="${origin.y}" r="6"/>
        <text class="origin-label" x="${origin.x + 12}" y="${origin.y - 11}">CÓRDOBA</text>
      </svg>
      <p class="map-info" id="mapInfo" aria-live="polite">Conexiones desde Córdoba</p>
    </div></div></section>`;
}

export function mountDelivery(root) {
  const map = $('#deliveryMap', root);
  if (!map) return () => {};
  $$('.route', map).forEach((r, i) => r.style.setProperty('--d', `${i * 0.07}s`));
  const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { map.classList.add('is-in'); io.disconnect(); } }, { threshold: 0.25 });
  io.observe(map);
  const info = $('#mapInfo', root);
  let current = '';
  const select = (city) => {
    current = current === city ? '' : city;
    map.classList.toggle('has-active', !!current);
    $$('.route,.map-dot', map).forEach((el) => el.classList.toggle('active', el.dataset.city === current));
    $$('.dest', root).forEach((b) => { const on = b.dataset.dest === current; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    info.textContent = current ? `Córdoba → ${current}` : 'Conexiones desde Córdoba';
  };
  const onClick = (e) => {
    const b = e.target.closest('[data-dest]'); if (b) return select(b.dataset.dest);
    const d = e.target.closest('.map-dot'); if (d) select(d.dataset.city);
  };
  root.addEventListener('click', onClick);
  return () => { io.disconnect(); root.removeEventListener('click', onClick); };
}
