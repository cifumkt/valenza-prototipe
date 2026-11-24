import { h, fmt, money, moneyExact, payment, $, $$ } from '../util.js';
import { icon } from '../icons.js';
import { CONFIG, waLink, telLink } from '../config.js';
import { byId, getStock, favs, compare, forSale } from '../store.js';
import { card, pic } from '../components.js';
import { field, formEnd, bindForm } from '../leads.js';

const pageHead = (eyebrow, title, lede, extra = '') => h`<section class="page-hero"><div class="wrap"><p class="eyebrow">${eyebrow}</p><h1>${title}</h1>${lede ? h`<p class="lede">${lede}</p>` : ''}${extra}</div></section>`;
const FUELS = ['Gasolina', 'Diésel', 'Híbrido', 'Eléctrico', 'Otro'];

export function notFound() {
  return { title: 'Página no encontrada · Valenza', desc: '', html: h`<section class="page-hero"><div class="wrap"><p class="eyebrow">Error 404</p><h1>No encontramos esa página</h1><p class="lede">El enlace puede haber cambiado o el coche ya no está disponible.</p><a class="btn btn-red btn-lg" href="#/catalogo">Ver todos los coches ${icon('arrow')}</a></div></section>` };
}

// ── Financiación ──
export function finance(ctx) {
  const v = byId(new URLSearchParams(ctx.query).get('vehiculo'));
  const price = v?.price || 25000;
  const html = h`${pageHead('Financiación', 'Calcula tu cuota', 'Explora cómo cambia la cuota según el importe, la entrada y el plazo. Herramienta orientativa, no una oferta.')}
  <section class="section"><div class="wrap narrow">
    ${v ? h`<a class="car-strip" href="#/coche/${v.id}"><span>Simulando para</span><strong>${v.title}</strong>${icon('arrow')}</a>` : ''}
    <div class="panel calc-page" id="finForm">
      <div class="form-grid">
        <div class="field"><label for="finPrice">Precio del coche (€)</label><input id="finPrice" type="number" inputmode="numeric" min="1000" step="100" value="${price}"></div>
        <div class="field"><label for="finEntry">Entrada (€)</label><input id="finEntry" type="number" inputmode="numeric" min="0" step="100" value="${Math.round(price * CONFIG.FINANCE_ENTRY_PCT / 100 / 100) * 100}"></div>
        <div class="field"><label for="finMonths">Plazo</label><select id="finMonths">${[36, 48, 60, 72, 84].map((m) => h`<option value="${m}" ${m === CONFIG.FINANCE_MONTHS ? 'selected' : ''}>${m} meses</option>`)}</select></div>
        <div class="field"><label for="finRate">TIN ilustrativo (%)</label><input id="finRate" type="number" inputmode="decimal" min="0" step="0.01" value="${CONFIG.TIN}"></div>
      </div>
      <div class="calc-out big"><small>Cuota mensual estimada</small><strong id="finOut">—</strong><span id="finSub"></span></div>
      <p class="fine">Amortización francesa sin comisiones, seguros ni otros gastos. TIN de ejemplo pendiente de validación comercial; no constituye oferta vinculante ni incluye TAE.</p>
    </div>
  </div></section>`;
  return {
    title: 'Simulador de financiación · Valenza', desc: 'Simula la cuota de tu próximo coche según entrada y plazo.', html,
    mount(root) {
      const g = (id) => $('#' + id, root);
      const calc = () => {
        const p = +g('finPrice').value || 0, e = Math.min(+g('finEntry').value || 0, p), n = +g('finMonths').value, t = +g('finRate').value || 0;
        const loan = Math.max(0, p - e), q = payment(loan, n, t);
        g('finOut').textContent = p ? `${moneyExact(q)} / mes` : '—';
        g('finSub').textContent = `A financiar ${money(loan)} · Total cuotas ${money(q * n)} · Intereses ${money(Math.max(0, q * n - loan))}`;
      };
      const el = $('#finForm', root); el.addEventListener('input', calc); calc();
      return () => el.removeEventListener('input', calc);
    },
  };
}

// ── Favoritos ──
export function favourites() {
  const render = () => {
    const list = getStock().filter((v) => favs().includes(v.id));
    return list.length
      ? h`<div class="grid">${list.map(card)}</div><p class="more-row"><a class="btn btn-ghost" href="#/comparar">${icon('swap')} Ir al comparador</a></p>`
      : h`<div class="empty"><h3>Aún no tienes favoritos</h3><p>Toca el corazón de un coche para guardarlo aquí. Se guardan en este navegador.</p><a class="btn btn-red" href="#/catalogo">Explorar coches</a></div>`;
  };
  return {
    title: 'Mis favoritos · Valenza', desc: '',
    html: h`${pageHead('Guardados', 'Mis favoritos', 'Los coches que guardas se mantienen en este navegador.')}<section class="section"><div class="wrap" id="favBox">${render()}</div></section>`,
    mount(root) {
      const box = $('#favBox', root);
      const on = () => { box.innerHTML = render().s; };
      document.addEventListener('valenza:store', on);
      return () => document.removeEventListener('valenza:store', on);
    },
  };
}

// ── Comparador ──
export function comparePage() {
  const render = () => {
    const list = compare().map((id) => byId(id)).filter(Boolean);
    if (!list.length) return h`<div class="empty"><h3>El comparador está vacío</h3><p>Añade hasta tres coches desde su ficha o desde el catálogo.</p><a class="btn btn-red" href="#/catalogo">Explorar coches</a></div>`;
    const rows = [['Precio', (v) => money(v.price)], ['Año', (v) => v.year || '—'], ['Kilómetros', (v) => `${fmt(v.km)} km`], ['Combustible', (v) => v.fuel || '—'], ['Cambio', (v) => v.transmission || '—'], ['Potencia', (v) => (v.power ? `${v.power} CV` : '—')], ['Etiqueta DGT', (v) => v.badge || '—'], ['Carrocería', (v) => v.body || '—']];
    return h`<div class="cmp-scroll"><table class="cmp"><thead><tr><th><span class="sr">Característica</span></th>${list.map((v) => h`<th scope="col"><a href="#/coche/${v.id}">${v.photo ? h`<img src="${v.photo}" alt="" width="320" height="240" loading="lazy" referrerpolicy="no-referrer">` : ''}<strong>${v.title}</strong></a><button type="button" class="link" data-action="compare" data-id="${v.id}">Quitar</button></th>`)}</tr></thead>
      <tbody>${rows.map(([k, fn]) => h`<tr><th scope="row">${k}</th>${list.map((v) => h`<td>${fn(v)}</td>`)}</tr>`)}</tbody></table></div>
      ${list.length < 3 ? h`<p class="more-row"><a class="btn btn-red" href="#/catalogo">Añadir más coches</a></p>` : ''}`;
  };
  return {
    title: 'Comparador · Valenza', desc: '',
    html: h`${pageHead('Comparador', 'Compara tus opciones', 'Hasta tres coches, uno al lado del otro.')}<section class="section"><div class="wrap" id="cmpBox">${render()}</div></section>`,
    mount(root) {
      const box = $('#cmpBox', root);
      const on = () => { box.innerHTML = render().s; };
      document.addEventListener('valenza:store', on);
      return () => document.removeEventListener('valenza:store', on);
    },
  };
}

// ── Vende tu coche ──
export function valuation() {
  return {
    title: 'Vende tu coche · Valenza', desc: 'Cuéntanos los datos de tu coche y te orientamos en la tasación.',
    html: h`${pageHead('Vende tu coche', 'Tu próximo coche empieza con el que ya tienes', 'Cuéntanos los datos básicos y nuestro equipo te contactará con una valoración orientativa.')}
    <section class="section"><div class="wrap split">
      <ol class="steps"><li><b>1</b><div><strong>Cuéntanos tu coche</strong><span>Marca, modelo, año y kilómetros.</span></div></li><li><b>2</b><div><strong>Te llamamos</strong><span>Un asesor revisa los datos contigo.</span></div></li><li><b>3</b><div><strong>Tasación y oferta</strong><span>Sin compromiso, tras revisar el vehículo.</span></div></li></ol>
      <form class="panel form-grid" id="vForm" novalidate>
        ${field({ label: 'Marca', name: 'marca', required: true, placeholder: 'Ej. Hyundai', auto: 'off' })}
        ${field({ label: 'Modelo', name: 'modelo', required: true, placeholder: 'Ej. Tucson' })}
        ${field({ label: 'Año', name: 'anio', type: 'number', required: true, min: 1990, max: new Date().getFullYear() + 1, placeholder: '2021', inputmode: 'numeric' })}
        ${field({ label: 'Kilómetros', name: 'km', type: 'number', required: true, min: 0, placeholder: '75000', inputmode: 'numeric' })}
        ${field({ label: 'Combustible', name: 'combustible', options: FUELS })}
        ${field({ label: 'Estado general', name: 'estado', options: ['Muy bueno', 'Bueno', 'A revisar'] })}
        ${field({ label: 'Tu nombre', name: 'nombre', required: true, auto: 'name' })}
        ${field({ label: 'Teléfono', name: 'telefono', type: 'tel', required: true, auto: 'tel', inputmode: 'tel' })}
        ${field({ label: 'Observaciones', name: 'observaciones', type: 'textarea', full: true, rows: 3, placeholder: 'Equipamiento, historial, golpes…' })}
        ${formEnd('Solicitar tasación')}
      </form>
    </div></section>`,
    mount(root) { return bindForm($('#vForm', root), 'tasacion'); },
  };
}

// ── Coche a la carta ──
export function bespoke() {
  return {
    title: 'Coche a la carta · Valenza', desc: 'Tú imaginas el coche, nosotros lo buscamos entre todas las marcas.',
    html: h`${pageHead('Servicio personalizado', 'Tu coche, a la carta', 'Tú imaginas el coche; nosotros lo buscamos, de cualquier marca y al mejor precio posible, con el acompañamiento de nuestros expertos.')}
    <section class="section"><div class="wrap split">
      <ol class="steps"><li><b>1</b><div><strong>Cuéntanos qué buscas</strong><span>Marca, modelo, presupuesto o simplemente el tipo de coche.</span></div></li><li><b>2</b><div><strong>Buscamos por ti</strong><span>Estudiamos las opciones y te asesoramos.</span></div></li><li><b>3</b><div><strong>Elige con confianza</strong><span>Te ayudamos a valorar y decidir.</span></div></li></ol>
      <form class="panel form-grid" id="bForm" novalidate>
        ${field({ label: 'Marca deseada', name: 'marca', placeholder: 'Ej. BMW, Audi…' })}
        ${field({ label: 'Modelo deseado', name: 'modelo', placeholder: 'Ej. X1, Q3…' })}
        ${field({ label: 'Presupuesto máximo (€)', name: 'presupuesto', type: 'number', min: 1000, placeholder: '25000', inputmode: 'numeric' })}
        ${field({ label: 'Tipo de coche', name: 'tipo', options: ['Sin preferencia', 'SUV', 'Berlina', 'Compacto', 'Familiar', 'Monovolumen', 'Otro'] })}
        ${field({ label: 'Cambio', name: 'cambio', options: ['Indiferente', 'Automático', 'Manual'] })}
        ${field({ label: 'Combustible', name: 'combustible', options: ['Indiferente', ...FUELS.slice(0, 4)] })}
        ${field({ label: 'Tu nombre', name: 'nombre', required: true, auto: 'name' })}
        ${field({ label: 'Teléfono', name: 'telefono', type: 'tel', required: true, auto: 'tel', inputmode: 'tel' })}
        ${field({ label: '¿Qué es importante para ti?', name: 'detalles', type: 'textarea', full: true, rows: 3, placeholder: 'Equipamiento, kilometraje, color…' })}
        ${formEnd('Pedir mi coche')}
      </form>
    </div></section>`,
    mount(root) { return bindForm($('#bForm', root), 'a-la-carta'); },
  };
}

// ── Contacto ──
export function contact(ctx) {
  const v = byId(new URLSearchParams(ctx.query).get('coche'));
  const msg = v ? `Hola, estoy interesado en el ${v.title} (ref. ${v.id}) anunciado por ${money(v.price)}. ¿Podéis darme más información?` : '';
  const wa = waLink(msg), tel = telLink();
  const sedes = CONFIG.SEDES.map((s) => {
    const t = telLink(s.phone), w = waLink(msg, s.whatsapp);
    return h`<article class="sede"><span class="ico">${icon('pin')}</span><h3>${s.id}</h3>${s.address ? h`<p>${s.address}</p>` : ''}<div class="sede-links">
      <a href="#/catalogo?city=${encodeURIComponent(s.id)}">Ver coches ${icon('arrow')}</a>
      ${t ? h`<a href="${t}">${icon('phone')} Llamar</a>` : ''}${w ? h`<a href="${w}" target="_blank" rel="noopener noreferrer">${icon('chat')} WhatsApp</a>` : ''}${s.maps ? h`<a href="${s.maps}" target="_blank" rel="noopener noreferrer">${icon('pin')} Cómo llegar</a>` : ''}</div></article>`;
  });
  return {
    title: 'Contacto · Valenza', desc: 'Contacta con Valenza Exclusive Autos: Córdoba, Jaén, Úbeda y Málaga.',
    html: h`${pageHead('Contacto', 'Estamos para ayudarte', '¿Buscas un coche, necesitas asesoramiento o quieres visitarnos? Cuéntanos y te orientamos.', (wa || tel) ? h`<div class="hero-actions">${wa ? h`<a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener noreferrer">${icon('chat')} WhatsApp</a>` : ''}${tel ? h`<a class="btn btn-ghost-light" href="${tel}">${icon('phone')} Llamar</a>` : ''}</div>` : '')}
    <section class="section"><div class="wrap">
      <div class="sedes">${sedes}</div>
      <form class="panel form-grid contact-form" id="cForm" novalidate>
        ${v ? h`<p class="car-strip full"><span>Consulta sobre</span><strong>${v.title}</strong></p>` : ''}
        ${field({ label: 'Nombre', name: 'nombre', required: true, auto: 'name' })}
        ${field({ label: 'Teléfono', name: 'telefono', type: 'tel', auto: 'tel', inputmode: 'tel' })}
        ${field({ label: 'Correo electrónico', name: 'email', type: 'email', required: true, auto: 'email', inputmode: 'email' })}
        ${field({ label: 'Sede', name: 'sede', options: [...CONFIG.SEDES.map((s) => s.id), 'Indiferente'] })}
        ${field({ label: 'Motivo', name: 'motivo', options: ['Información sobre un coche', 'Coche a la carta', 'Tasación', 'Financiación', 'Otras consultas'] })}
        ${field({ label: 'Mensaje', name: 'mensaje', type: 'textarea', required: true, full: true, rows: 5, value: msg, placeholder: 'Cuéntanos qué necesitas' })}
        ${formEnd('Enviar mensaje')}
      </form>
    </div></section>`,
    mount(root) { return bindForm($('#cForm', root), 'contacto'); },
  };
}

// ── Legal (plantilla pendiente de redacción) ──
export function legal() {
  return {
    title: 'Información legal · Valenza', desc: '',
    html: h`${pageHead('Legal', 'Información legal', 'Esta sección debe completarla la asesoría legal antes de publicar la web.')}
    <section class="section"><div class="wrap narrow prose">
      <h2>Aviso legal</h2><p>Pendiente: identidad del titular (razón social, CIF, domicilio, inscripción registral y datos de contacto), conforme a la LSSI-CE.</p>
      <h2>Política de privacidad</h2><p>Pendiente: responsable del tratamiento, finalidades, base jurídica, destinatarios (CRM, financieras), plazos de conservación y ejercicio de derechos RGPD.</p>
      <h2>Política de cookies</h2><p>Esta versión no usa cookies de seguimiento. Si se añade analítica o publicidad, será necesario un banner de consentimiento.</p>
      <h2>Financiación</h2><p>Las cuotas mostradas son orientativas. Cualquier publicidad de financiación debe incluir TAE y las condiciones exigidas por la normativa vigente.</p>
    </div></section>`,
  };
}
