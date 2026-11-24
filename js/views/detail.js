import { h, raw, esc, fmt, money, moneyExact, payment, safeUrl, $, $$, reduceMotion } from '../util.js';
import { icon } from '../icons.js';
import { CONFIG, waLink, telLink } from '../config.js';
import { byId, forSale, loadCar, favs, compare } from '../store.js';
import { card, toast } from '../components.js';
import { bodyGroup } from '../filters.js';
import { notFound } from './pages.js';

const monthYear = (s) => { const m = /^(\d{4})-(\d{2})/.exec(s || ''); return m ? `${m[2]}/${m[1]}` : ''; };

export default async function detail(ctx) {
  const v = byId(ctx.parts[1]);
  if (!v) return notFound();
  const d = await loadCar(v.id);
  const photos = d.photos.map(safeUrl).filter(Boolean);
  const sale = v.status === 'En venta';
  const isFav = favs().includes(v.id), inCmp = compare().includes(v.id);
  const wa = waLink(`Hola, estoy interesado en el ${v.title} (ref. ${v.id}). ¿Podéis darme más información?`), tel = telLink();
  const entry0 = Math.round((v.price * CONFIG.FINANCE_ENTRY_PCT) / 100 / 100) * 100;

  const facts = [
    ['calendar', 'Año', v.year || '—'], ['gauge', 'Kilómetros', `${fmt(v.km)} km`], ['fuel', 'Combustible', v.fuel || '—'],
    ['gear', 'Cambio', v.transmission || '—'], ['bolt', 'Potencia', v.power ? `${v.power} CV` : '—'],
  ];
  const specs = [
    ['Marca', v.make], ['Modelo', v.model], ['Versión', d.version], ['Año', v.year], ['Matriculación', monthYear(d.registered)],
    ['Kilómetros', `${fmt(v.km)} km`], ['Combustible', v.fuel], ['Cambio', v.transmission], ['Potencia', v.power ? `${v.power} CV` : ''],
    ['Etiqueta DGT', v.badge], ['Carrocería', v.body], ['Color', d.color], ['Puertas', d.doors], ['Plazas', d.seats],
    ['Garantía', d.warrantyMonths ? `${d.warrantyMonths} meses` : ''],
  ].filter(([, x]) => x !== '' && x != null);
  const eq = d.equipment;
  const related = forSale()
    .filter((x) => x.id !== v.id && x.photo && (x.make === v.make || bodyGroup(x.body) === bodyGroup(v.body)))
    .sort((a, b) => (b.make === v.make) - (a.make === v.make) || Math.abs(a.price - v.price) - Math.abs(b.price - v.price))
    .slice(0, 8);

  const html = h`
  <div class="wrap detail">
    <nav class="crumbs" aria-label="Migas de pan"><a href="#/">Inicio</a><span>/</span><a href="#/catalogo">Coches</a><span>/</span><a href="#/catalogo?make=${encodeURIComponent(v.make)}">${v.make}</a></nav>
    <div class="d-grid">
      <section class="d-gallery" aria-label="Fotografías">
        <div class="gal">
          <div class="gal-track" id="galTrack" tabindex="0" aria-label="Fotos del coche, desliza para ver más">
            ${photos.length ? photos.map((p, i) => h`<button type="button" class="slide" data-i="${i}" aria-label="Ampliar foto ${i + 1} de ${photos.length}"><img src="${p}" alt="${i === 0 ? v.title : `${v.title}, foto ${i + 1}`}" width="1200" height="900" ${i < 2 ? raw('fetchpriority="high"') : raw('loading="lazy"')} decoding="async" referrerpolicy="no-referrer"></button>`) : h`<div class="slide noimg">Sin imágenes</div>`}
          </div>
          ${photos.length > 1 ? h`<button type="button" class="gal-btn prev" data-d="prev" aria-label="Foto anterior">${icon('arrow-left')}</button><button type="button" class="gal-btn next" data-d="next" aria-label="Foto siguiente">${icon('arrow')}</button>` : ''}
          <span class="gal-count" id="galCount" aria-hidden="true">1 / ${photos.length}</span>
          ${photos.length ? h`<button type="button" class="gal-expand" data-d="expand">${icon('expand')}<span>Ampliar</span></button>` : ''}
          <span class="gal-tags">${!sale ? h`<span class="tag tag-status">${v.status}</span>` : ''}${v.badge === 'ECO' || v.badge === 'Cero emisiones' ? h`<span class="tag tag-eco">${icon('leaf')}${v.badge === 'ECO' ? 'ECO' : '0 emisiones'}</span>` : ''}</span>
        </div>
        ${photos.length > 1 ? h`<div class="thumbs" id="thumbs">${photos.map((p, i) => h`<button type="button" class="${i === 0 ? 'on' : ''}" data-t="${i}" aria-label="Ver foto ${i + 1}"><img src="${p}" alt="" width="120" height="90" loading="lazy" decoding="async" referrerpolicy="no-referrer"></button>`)}</div>` : ''}
      </section>

      <aside class="d-side">
        <div class="side-card">
          <p class="eyebrow">${v.make}${sale ? '' : h` · <b class="st">${v.status}</b>`}</p>
          <h1>${v.title}</h1>
          <p class="meta">${v.year || '—'} · ${fmt(v.km)} km · ${v.fuel || ''} · ${v.transmission || ''}</p>
          <div class="price-row"><strong class="price">${money(v.price)}</strong>${v.previousPrice > v.price ? h`<s>${money(v.previousPrice)}</s>` : ''}</div>
          ${v.financePrice && v.financePrice !== v.price ? h`<p class="fin-price">${icon('credit')} Financiado: <strong>${money(v.financePrice)}</strong></p>` : ''}
          <div class="cta-row" id="mainCta">
            <button type="button" class="btn btn-red btn-lg" data-action="contact" data-id="${v.id}">${icon('chat')} ${sale ? 'Consultar este coche' : 'Consultar disponibilidad'}</button>
            ${wa ? h`<a class="btn btn-wa" href="${wa}" target="_blank" rel="noopener noreferrer">${icon('chat')} WhatsApp</a>` : ''}
            ${tel ? h`<a class="btn btn-ghost" href="${tel}">${icon('phone')} Llamar</a>` : ''}
          </div>
          <div class="mini-actions">
            <button type="button" class="mini ${isFav ? 'on' : ''}" data-action="fav" data-id="${v.id}" aria-pressed="${isFav}">${icon('heart')}<span>${isFav ? 'Guardado' : 'Guardar'}</span></button>
            <button type="button" class="mini ${inCmp ? 'on' : ''}" data-action="compare" data-id="${v.id}" aria-pressed="${inCmp}">${icon('swap')}<span>${inCmp ? 'En comparador' : 'Comparar'}</span></button>
            <button type="button" class="mini" data-d="share">${icon('share')}<span>Compartir</span></button>
          </div>
        </div>
        <div class="side-card calc" id="calc">
          <div class="calc-head"><h2>Calcula tu cuota</h2><span class="pill">${CONFIG.TIN.toString().replace('.', ',')} % TIN</span></div>
          <label class="range-l" for="entry">Entrada <output id="entryOut">${money(entry0)}</output></label>
          <input id="entry" type="range" min="0" max="${Math.round((v.price * 0.5) / 100) * 100}" step="100" value="${entry0}">
          <div class="months" role="group" aria-label="Plazo">${[36, 48, 60, 72, 84].map((m) => h`<button type="button" class="chip ${m === CONFIG.FINANCE_MONTHS ? 'on' : ''}" data-m="${m}" aria-pressed="${m === CONFIG.FINANCE_MONTHS}">${m} m</button>`)}</div>
          <div class="calc-out"><small>Cuota orientativa</small><strong id="fee">—</strong><span id="feeSub"></span></div>
          <p class="fine">Cálculo francés sin comisiones, seguros ni otros gastos. No es oferta vinculante; TAE y condiciones pendientes de confirmar.</p>
          <a class="more" href="#/financiacion?vehiculo=${v.id}">Simulador completo ${icon('arrow')}</a>
        </div>
      </aside>

      <section class="d-info">
        <div class="facts">${facts.map(([i, k, x]) => h`<div class="fact"><span class="ico">${icon(i)}</span><small>${k}</small><strong>${x}</strong></div>`)}</div>
        <h2>Ficha técnica</h2>
        <dl class="specs">${specs.map(([k, x]) => h`<div><dt>${k}</dt><dd>${x}</dd></div>`)}</dl>
        ${eq.length ? h`<h2>Equipamiento <small>${eq.length} elementos</small></h2>
          <ul class="equip">${eq.slice(0, 12).map((x) => h`<li>${icon('check')}${x}</li>`)}</ul>
          ${eq.length > 12 ? h`<details class="equip-more"><summary><span class="closed">Ver los ${eq.length - 12} restantes ${icon('chevron')}</span><span class="opened">Ver menos ${icon('chevron')}</span></summary><ul class="equip">${eq.slice(12).map((x) => h`<li>${icon('check')}${x}</li>`)}</ul></details>` : ''}` : ''}
        <p class="fine">Ref. ${v.id}. Precio y disponibilidad según stock del 17/11/2026, sujetos a confirmación. Garantía indicada en origen y sujeta a comprobación.</p>
      </section>
    </div>
    ${related.length ? h`<section class="section related"><div class="section-head"><div><p class="eyebrow">Sigue explorando</p><h2>También te puede interesar</h2></div><a class="more" href="#/catalogo">Ver catálogo ${icon('arrow')}</a></div><div class="rail">${related.map(card)}</div></section>` : ''}
  </div>
  <div class="buybar" id="buybar" aria-hidden="true"><div><small>${v.make} ${v.model}</small><strong>${money(v.price)}</strong></div><button type="button" class="btn btn-red" data-action="contact" data-id="${v.id}" tabindex="-1">${icon('chat')} Consultar</button></div>`;

  return {
    title: `${v.title} · ${money(v.price)} · Valenza`,
    desc: `${v.title}, ${v.year}, ${fmt(v.km)} km, ${v.fuel || ''}, ${v.transmission || ''}. ${money(v.price)}. Valenza Exclusive Autos.`,
    html,
    mount(root) {
      const offs = [];
      const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); offs.push(() => t.removeEventListener(ev, fn, o)); };
      const track = $('#galTrack', root), count = $('#galCount', root), thumbs = $('#thumbs', root);
      const n = photos.length;
      const smooth = reduceMotion() ? 'auto' : 'smooth';

      // Transición compartida con la foto de la tarjeta
      if (!reduceMotion()) $('.slide img', root)?.style.setProperty('view-transition-name', 'car-photo');

      // ── Galería: scroll-snap (swipe nativo) ──
      let idx = 0, raf = 0;
      const setIdx = (i) => {
        if (i === idx) return; idx = i;
        count.textContent = `${i + 1} / ${n}`;
        $$('button', thumbs || document.createElement('div')).forEach((b, k) => b.classList.toggle('on', k === i));
        const t = thumbs?.children[i];
        if (t) thumbs.scrollTo({ left: t.offsetLeft - thumbs.clientWidth / 2 + t.clientWidth / 2, behavior: smooth });
      };
      const goTo = (i) => track.scrollTo({ left: ((i + n) % n) * track.clientWidth, behavior: smooth });
      if (track && n) {
        on(track, 'scroll', () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => setIdx(Math.round(track.scrollLeft / track.clientWidth))); }, { passive: true });
        on(track, 'keydown', (e) => { if (e.key === 'ArrowRight') { e.preventDefault(); goTo(idx + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(idx - 1); } });
      }

      // ── Lightbox (dialog nativo: foco, Esc y modal gratis) ──
      const lb = document.createElement('dialog');
      lb.className = 'lightbox'; lb.setAttribute('aria-label', 'Galería ampliada');
      root.append(lb);
      let lbIdx = 0;
      const lbTrack = () => $('.lb-track', lb);
      const lbGo = (i) => { const t = lbTrack(); t.scrollTo({ left: ((i + n) % n) * t.clientWidth, behavior: smooth }); };
      const openLb = (i) => {
        lb.innerHTML = `<button type="button" class="lb-close" data-lb="close" aria-label="Cerrar">${icon('close').s}</button>
          <div class="lb-track" tabindex="0">${photos.map((p, k) => `<div class="lb-slide"><img src="${esc(p)}" alt="${k + 1} de ${n}" ${Math.abs(k - i) < 2 ? '' : 'loading="lazy"'} decoding="async" referrerpolicy="no-referrer"></div>`).join('')}</div>
          ${n > 1 ? `<button type="button" class="gal-btn prev" data-lb="prev" aria-label="Anterior">${icon('arrow-left').s}</button><button type="button" class="gal-btn next" data-lb="next" aria-label="Siguiente">${icon('arrow').s}</button>` : ''}
          <span class="lb-count" id="lbCount">${i + 1} / ${n}</span>`;
        lb.showModal();
        lbIdx = i;
        const t = lbTrack(); t.scrollTo({ left: i * t.clientWidth, behavior: 'auto' }); t.focus({ preventScroll: true });
        t.addEventListener('scroll', () => { const k = Math.round(t.scrollLeft / t.clientWidth); if (k !== lbIdx) { lbIdx = k; $('#lbCount', lb).textContent = `${k + 1} / ${n}`; } }, { passive: true });
      };
      on(lb, 'click', (e) => {
        const a = e.target.closest('[data-lb]')?.dataset.lb;
        if (a === 'close' || e.target === lb) lb.close();
        else if (a === 'prev') lbGo(lbIdx - 1); else if (a === 'next') lbGo(lbIdx + 1);
      });
      on(lb, 'keydown', (e) => { if (e.key === 'ArrowRight') lbGo(lbIdx + 1); if (e.key === 'ArrowLeft') lbGo(lbIdx - 1); });

      on(root, 'click', (e) => {
        const s = e.target.closest('.slide[data-i]'); if (s) return openLb(Number(s.dataset.i));
        const t = e.target.closest('[data-t]'); if (t) return goTo(Number(t.dataset.t));
        const a = e.target.closest('[data-d]')?.dataset.d;
        if (a === 'prev') goTo(idx - 1); else if (a === 'next') goTo(idx + 1); else if (a === 'expand') openLb(idx);
        else if (a === 'share') {
          const data = { title: v.title, text: `${v.title} · ${money(v.price)}`, url: location.href };
          if (navigator.share) navigator.share(data).catch(() => {});
          else navigator.clipboard?.writeText(location.href).then(() => toast('Enlace copiado'), () => toast('No se pudo copiar el enlace'));
        }
      });

      // ── Calculadora de cuota ──
      const entry = $('#entry', root), out = $('#entryOut', root), fee = $('#fee', root), sub = $('#feeSub', root);
      let months = CONFIG.FINANCE_MONTHS;
      const calc = () => {
        const e = Number(entry.value), loan = Math.max(0, v.price - e);
        out.textContent = money(e) === 'Consultar' ? '0 €' : money(e);
        entry.style.setProperty('--p', (e / entry.max) * 100 + '%');
        if (!v.price) { fee.textContent = '—'; return; }
        const q = payment(loan, months, CONFIG.TIN);
        fee.textContent = `${moneyExact(q)} / mes`;
        sub.textContent = `Financiando ${money(loan)} · Total cuotas ${money(q * months)}`;
      };
      on(entry, 'input', calc);
      on($('.months', root), 'click', (e) => {
        const b = e.target.closest('[data-m]'); if (!b) return;
        months = Number(b.dataset.m);
        $$('.months .chip', root).forEach((c) => { const on2 = c === b; c.classList.toggle('on', on2); c.setAttribute('aria-pressed', on2); });
        calc();
      });
      calc();

      // ── Barra fija inferior (móvil): visible mientras el CTA principal no se ve ──
      const bar = $('#buybar', root);
      const io = new IntersectionObserver(([en]) => {
        const show = !en.isIntersecting && en.boundingClientRect.top > -2000;
        bar.classList.toggle('show', show);
        bar.setAttribute('aria-hidden', !show); $('button', bar).tabIndex = show ? 0 : -1;
        document.body.classList.toggle('has-buybar', show);
      }, { threshold: 0 });
      io.observe($('#mainCta', root));

      return () => { io.disconnect(); offs.forEach((o) => o()); document.body.classList.remove('has-buybar'); };
    },
  };
}
