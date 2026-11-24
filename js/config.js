// ─────────────────────────────────────────────────────────────
//  Configuración editable de Valenza. Rellena aquí los datos reales.
// ─────────────────────────────────────────────────────────────
export const CONFIG = {
  // true = los formularios NO se envían (solo muestran confirmación).
  // Para activarlos: pon DEMO:false y una URL en LEADS_ENDPOINT (y añádela a
  // `connect-src` de la CSP en index.html, _headers y vercel.json).
  DEMO: true,
  LEADS_ENDPOINT: '',

  // Texto de la barra superior. Déjalo vacío ('') para ocultarla.
  BANNER: 'Versión de pruebas · Las solicitudes aún no se envían',

  // Contacto global. Solo dígitos con prefijo país para WhatsApp (ej. '34600111222').
  PHONE: '',
  WHATSAPP: '',
  EMAIL: '',

  // Financiación orientativa (NO es oferta). Revisar con la financiera y la asesoría legal (TAE).
  TIN: 6.49,
  FINANCE_MONTHS: 60,
  FINANCE_ENTRY_PCT: 10,

  // Sedes. Completa address/phone/whatsapp/maps y aparecerán solas en Contacto.
  SEDES: [
    { id: 'Córdoba', address: '', phone: '', whatsapp: '', maps: '' },
    { id: 'Jaén', address: '', phone: '', whatsapp: '', maps: '' },
    { id: 'Úbeda', address: '', phone: '', whatsapp: '', maps: '' },
    { id: 'Málaga', address: '', phone: '', whatsapp: '', maps: '' },
  ],
};

const digits = (s) => String(s || '').replace(/\D/g, '');
export const waLink = (text, number = CONFIG.WHATSAPP) =>
  digits(number) ? `https://wa.me/${digits(number)}?text=${encodeURIComponent(text || '')}` : '';
export const telLink = (number = CONFIG.PHONE) => (digits(number) ? `tel:+${digits(number)}` : '');
