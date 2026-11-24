import { h, $, $$ } from './util.js';
import { icon } from './icons.js';
import { CONFIG } from './config.js';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * ÚNICO punto de envío de formularios. En modo DEMO no sale nada del navegador.
 * Para producción: DEMO=false + LEADS_ENDPOINT (backend/CRM con validación en servidor,
 * antibot y límite de peticiones). Nunca pongas tokens de CRM en el cliente.
 */
export async function submitLead(type, data) {
  if (CONFIG.DEMO || !CONFIG.LEADS_ENDPOINT) { await sleep(600); return { demo: true }; }
  const r = await fetch(CONFIG.LEADS_ENDPOINT, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, ...data, page: location.hash, ts: Date.now() }),
  });
  if (!r.ok) throw new Error('Error al enviar');
  return { ok: true };
}

export function field({ label, name, type = 'text', required = false, placeholder = '', options, full = false, auto = '', inputmode = '', min, max, rows = 4, value = '' }) {
  const attrs = h`name="${name}" id="f-${name}" ${required ? 'required' : ''} ${auto ? h`autocomplete="${auto}"` : ''} ${inputmode ? h`inputmode="${inputmode}"` : ''}`;
  let control;
  if (options) control = h`<select ${attrs}>${options.map((o) => h`<option ${o === value ? 'selected' : ''}>${o}</option>`)}</select>`;
  else if (type === 'textarea') control = h`<textarea ${attrs} rows="${rows}" placeholder="${placeholder}" maxlength="1500">${value}</textarea>`;
  else control = h`<input ${attrs} type="${type}" placeholder="${placeholder}" value="${value}" ${min != null ? h`min="${min}"` : ''} ${max != null ? h`max="${max}"` : ''} maxlength="120">`;
  return h`<div class="field ${full ? 'full' : ''}"><label for="f-${name}">${label}${required ? h`<i aria-hidden="true"> *</i>` : ''}</label>${control}</div>`;
}

/** Bloque estándar: contacto + consentimiento + honeypot + botón. */
export const formEnd = (cta) => h`
  <div class="field full hp" aria-hidden="true"><label for="f-website">No rellenar</label><input id="f-website" name="website" tabindex="-1" autocomplete="off"></div>
  <label class="consent full"><input type="checkbox" name="consent" required> <span>He leído y acepto la <a href="#/legal">política de privacidad</a> y que Valenza use mis datos para atender esta solicitud.</span></label>
  <div class="full form-actions"><button class="btn btn-red btn-lg" type="submit">${cta} ${icon('arrow')}</button>${CONFIG.DEMO ? h`<p class="fine">Modo demostración: esta solicitud no se envía.</p>` : ''}</div>`;

export function bindForm(form, type) {
  const submit = $('button[type="submit"]', form);
  const label = submit.innerHTML;
  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = Object.fromEntries(new FormData(form));
    if (data.website) { done(); return; } // honeypot: bots
    delete data.website;
    submit.disabled = true; submit.textContent = 'Enviando…';
    $('.form-error', form)?.remove();
    try { const r = await submitLead(type, data); done(r.demo); }
    catch {
      submit.disabled = false; submit.innerHTML = label;
      submit.insertAdjacentHTML('afterend', '<p class="form-error" role="alert">No hemos podido enviar la solicitud. Inténtalo de nuevo o contáctanos directamente.</p>');
    }
  };
  const done = (demo) => {
    form.innerHTML = h`<div class="success" role="status"><span class="ico">${icon('check')}</span><h3>${demo ? 'Demostración completada' : '¡Recibido!'}</h3><p>${demo ? 'Esta es una versión de pruebas: no se ha enviado ni guardado ningún dato.' : 'Hemos recibido tu solicitud. Te contactaremos lo antes posible.'}</p><a class="btn btn-ghost" href="#/catalogo">Seguir viendo coches</a></div>`.s;
    $('.success', form)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };
  form.addEventListener('submit', onSubmit);
  return () => form.removeEventListener('submit', onSubmit);
}
