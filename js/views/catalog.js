import { h, raw, fmt, $, $$, debounce } from '../util.js';
import { icon } from '../icons.js';
import { forSale } from '../store.js';
import { card } from '../components.js';
import { initReveal } from '../reveal.js';
import { SORTS, BODY_GROUPS, FUELS, PRICES, KMS, YEARS, bodyGroup, fuelGroup, facet, parse, stringify, run, activeCount, emptyFilters, KEYS, LABELS } from '../filters.js';

const PAGE = 24;
const withCurrent = (arr, cur) => (cur && !arr.includes(cur) ? [...arr, cur].sort((a, b) => a - b) : arr);

export default function catalog(ctx) {
  const all = forSale();
  const f0 = parse(ctx.query);
  const makes = facet(all, (v) => v.make), cities = facet(all, (v) => v.city), trans = facet(all, (v) => v.transmission);
  const count = (fn, val) => all.filter((v) => fn(v) === val).length;
  const sel = (name, label, opts, cur) => h`<label class="f"><span>${label}</span><select name="${name}"><option value="">Todos</option>${opts.map(([v, t]) => h`<option value="${v}" ${String(cur) === String(v) ? raw('selected') : ''}>${t}</option>`)}</select></label>`;

  const html = h`
  <div class="page-head"><div class="wrap"><p class="eyebrow">Stock Valenza</p><h1>Encuentra tu próximo coche</h1></div></div>
  <div class="wrap catalog">
    <div class="toolbar" id="toolbar">
      <label class="search">${icon('search')}<span class="sr">Buscar</span><input type="search" name="q" form="filterForm" value="${f0.q}" placeholder="Marca o modelo…" enterkeyhint="search" autocomplete="off" maxlength="60"></label>
      <button type="button" class="btn btn-ghost filter-btn" data-cat="filters" aria-expanded="false" aria-controls="filters">${icon('filter')} Filtros <b id="fcount" hidden></b></button>
      <label class="sort"><span class="sr">Ordenar por</span><select name="sort" form="filterForm">${Object.entries(SORTS).map(([k, t]) => h`<option value="${k}" ${f0.sort === k ? raw('selected') : ''}>${t}</option>`)}</select></label>
    </div>
    <div class="catalog-body">
      <div class="scrim" data-cat="close-filters" hidden></div>
      <aside class="filters" id="filters" aria-label="Filtros">
        <div class="filters-head"><h2>Filtros</h2><button type="button" class="icon-btn light" data-cat="close-filters" aria-label="Cerrar filtros">${icon('close')}</button></div>
        <form id="filterForm" novalidate>
          ${sel('make', 'Marca', makes.map(([m, n]) => [m, `${m} (${n})`]), f0.make)}
          ${sel('body', 'Tipo de coche', BODY_GROUPS.map((g) => [g, `${g} (${count((v) => bodyGroup(v.body), g)})`]), f0.body)}
          ${sel('fuel', 'Combustible', FUELS.map((g) => [g, `${g} (${count((v) => fuelGroup(v.fuel), g)})`]), f0.fuel)}
          ${sel('transmission', 'Cambio', trans.map(([m, n]) => [m, `${m} (${n})`]), f0.transmission)}
          ${sel('maxPrice', 'Precio máximo', withCurrent(PRICES, f0.maxPrice).map((p) => [p, `${fmt(p)} €`]), f0.maxPrice)}
          ${sel('maxKm', 'Kilómetros máximos', withCurrent(KMS, f0.maxKm).map((p) => [p, `${fmt(p)} km`]), f0.maxKm)}
          ${sel('minYear', 'Año desde', [...new Set([...YEARS, f0.minYear].filter(Boolean))].sort((a, b) => b - a).map((p) => [p, `${p}`]), f0.minYear)}
          ${sel('city', 'Sede', cities.map(([m, n]) => [m, `${m} (${n})`]), f0.city)}
        </form>
        <div class="filters-foot"><button type="button" class="btn btn-ghost" data-cat="reset">Limpiar</button><button type="button" class="btn btn-red" data-cat="close-filters" id="showBtn">Ver coches</button></div>
      </aside>
      <section class="results" aria-live="polite">
        <div class="results-bar"><strong id="count"></strong><div class="chips" id="activeChips"></div></div>
        <div class="grid" id="grid"></div>
        <div class="loadmore" id="more"><button type="button" class="btn btn-ghost" data-cat="more" hidden>Mostrar más coches</button></div>
        <div class="empty" id="empty" hidden><h3>Ningún coche con esos filtros</h3><p>Prueba a ampliar el presupuesto o quitar algún filtro.</p><button type="button" class="btn btn-red" data-cat="reset">Limpiar filtros</button></div>
      </section>
    </div>
  </div>`;

  return {
    title: 'Coches de ocasión, seminuevos y KM0 · Valenza',
    desc: 'Catálogo de coches de ocasión, seminuevos y KM0. Filtra por marca, precio, combustible, cambio y más.',
    html,
    mount(root) {
      const form = $('#filterForm', root), grid = $('#grid', root), more = $('#more button', root), moreBox = $('#more', root);
      const filters = $('#filters', root), scrim = $('.scrim', root), fbtn = $('.filter-btn', root);
      let results = [], shown = 0, f = f0;
      const offs = [];
      const on = (t, ev, fn) => { t.addEventListener(ev, fn); offs.push(() => t.removeEventListener(ev, fn)); };

      const readForm = () => {
        const nf = emptyFilters();
        new FormData(form).forEach((v, k) => { nf[k] = v; });
        for (const k of ['q', 'sort']) { const el = root.querySelector(`[name="${k}"]`); nf[k] = el.value; }
        for (const k of ['maxPrice', 'maxKm', 'minYear']) nf[k] = nf[k] ? Number(nf[k]) : '';
        return parse(stringify(nf));
      };
      const append = (n) => {
        const slice = results.slice(shown, shown + n);
        grid.insertAdjacentHTML('beforeend', slice.map((v) => card(v).s).join(''));
        shown += slice.length;
        initReveal(grid);
        more.hidden = shown >= results.length;
        if (!more.hidden) more.textContent = `Mostrar más coches (${results.length - shown})`;
      };
      const chips = () => {
        const out = KEYS.filter((k) => f[k] !== '' && f[k] != null).map((k) => h`<button type="button" class="chip on" data-clear="${k}">${LABELS[k](f[k])} ${icon('close')}<span class="sr"> Quitar filtro</span></button>`);
        $('#activeChips', root).innerHTML = out.map((x) => x.s).join('');
        const n = activeCount(f), fc = $('#fcount', root);
        fc.hidden = !n; fc.textContent = n;
      };
      const apply = (keepShown) => {
        results = run(all, f);
        grid.innerHTML = ''; shown = 0;
        const want = keepShown || PAGE;
        append(want);
        const n = results.length;
        $('#count', root).textContent = `${fmt(n)} ${n === 1 ? 'coche' : 'coches'}`;
        $('#showBtn', root).textContent = `Ver ${fmt(n)} ${n === 1 ? 'coche' : 'coches'}`;
        $('#empty', root).hidden = n > 0;
        chips();
      };
      const sync = () => {
        f = readForm();
        const qs = stringify(f);
        history.replaceState({ ...(history.state || {}), shown: PAGE, y: undefined }, '', '#/catalogo' + (qs ? '?' + qs : ''));
        apply();
      };

      // restaurar tras «atrás»: mismos coches mostrados
      apply(Math.max(PAGE, history.state?.shown || 0));

      const onInput = debounce((e) => { if (e.target.tagName === 'SELECT') return; if (e.target.form === form || e.target.getAttribute('form') === 'filterForm') sync(); }, 140);
      on(root, 'input', onInput);
      on(root, 'change', (e) => { if (e.target.tagName === 'SELECT' && (e.target.form === form || e.target.getAttribute('form') === 'filterForm')) sync(); });
      on(form, 'submit', (e) => e.preventDefault());

      const setOpen = (open) => {
        filters.classList.toggle('open', open); scrim.hidden = !open;
        document.body.classList.toggle('no-scroll', open && matchMedia('(max-width:959px)').matches);
        fbtn.setAttribute('aria-expanded', open);
      };
      const reset = () => {
        $$('select', form).forEach((s) => { s.value = ''; });
        $('[name="q"]', root).value = ''; $('[name="sort"]', root).value = 'recent';
        sync();
      };
      const onClick = (e) => {
        const c = e.target.closest('[data-cat]');
        if (c) {
          const a = c.dataset.cat;
          if (a === 'filters') setOpen(!filters.classList.contains('open'));
          else if (a === 'close-filters') setOpen(false);
          else if (a === 'reset') reset();
          else if (a === 'more') { append(PAGE); history.replaceState({ ...(history.state || {}), shown }, ''); }
          return;
        }
        const k = e.target.closest('[data-clear]')?.dataset.clear;
        if (k) { const el = root.querySelector(`[name="${k}"]`); if (el) el.value = ''; sync(); }
      };
      const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
      on(root, 'click', onClick);
      on(document, 'keydown', onKey);

      // scroll infinito
      const io = new IntersectionObserver((en) => { if (en[0].isIntersecting && shown < results.length) { append(PAGE); history.replaceState({ ...(history.state || {}), shown }, ''); } }, { rootMargin: '700px 0px' });
      io.observe(moreBox);

      return () => { io.disconnect(); offs.forEach((o) => o()); document.body.classList.remove('no-scroll'); };
    },
  };
}
