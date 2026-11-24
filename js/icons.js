import { raw } from './util.js';

const P = {
  arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
  'arrow-left': '<path d="M19 12H5m6-6-6 6 6 6"/>',
  'arrow-up-right': '<path d="M7 17 17 7M8 7h9v9"/>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
  swap: '<path d="M4 7h14l-3.5-3.5M4 7l3.5 3.5M20 17H6l3.5 3.5M20 17l-3.5-3.5"/>',
  menu: '<path d="M4 8h16M4 16h16"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  car: '<path d="M5 16 6.5 10a2 2 0 0 1 1.9-1.5h7.2A2 2 0 0 1 17.5 10L19 16"/><path d="M3 16h18v3H3zM7 19v1.5M17 19v1.5"/><circle cx="7.5" cy="13" r=".6"/><circle cx="16.5" cy="13" r=".6"/>',
  suv: '<path d="M3 16v-4.5l2.2-4a1.5 1.5 0 0 1 1.3-.8h8.2a2 2 0 0 1 1.6.8L19.5 11l1.5 1v4h-2"/><path d="M3 16h2m5 0h4"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/><path d="M5 11h14"/>',
  sedan: '<path d="M2.5 16v-3l3-1.5L8 8h8l2.5 3.5 3 1.5v3h-2"/><path d="M2.5 16h2m5 0h5"/><circle cx="7" cy="16.5" r="2"/><circle cx="17" cy="16.5" r="2"/>',
  urban: '<path d="M4 16v-4l1.8-4.2A1.5 1.5 0 0 1 7.2 7h9.6a1.5 1.5 0 0 1 1.4.8L20 12v4h-1.5"/><path d="M4 16h1.5m5 0h3"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
  family: '<path d="M3 16v-5l2-3.2A1.5 1.5 0 0 1 6.3 7H17a2 2 0 0 1 1.6.8L21 11v5h-1.5"/><path d="M3 16h1.5m6 0h4"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="17.5" cy="16.5" r="2"/><path d="M9 7v4m5-4v4"/>',
  van: '<path d="M2.5 16V8a1.5 1.5 0 0 1 1.5-1.5h9V16m0-7h4l3.5 3.5V16h-1.5"/><path d="M2.5 16h2m5 0h3"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="17.5" cy="16.5" r="2"/>',
  mono: '<path d="M3 16v-5.5l2.4-3A1.5 1.5 0 0 1 6.6 7H16a2 2 0 0 1 1.7 1l2.3 3.5V16h-1.5"/><path d="M3 16h1.5m6 0h4"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
  truck: '<path d="M3 6.5h11V16H3zM14 9.5h4l3 3.5v3h-3"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/>',
  shield: '<path d="M12 21s7.5-3.6 7.5-9.5V5.5L12 3 4.5 5.5v6C4.5 17.4 12 21 12 21Z"/><path d="m9 12 2.2 2.2L15.5 10"/>',
  credit: '<rect x="3" y="5.5" width="18" height="13" rx="2.5"/><path d="M3 10h18M7 15h3"/>',
  pin: '<path d="M12 21s6.5-5.6 6.5-11A6.5 6.5 0 0 0 5.5 10c0 5.4 6.5 11 6.5 11Z"/><circle cx="12" cy="10" r="2.3"/>',
  phone: '<path d="M5 4h3.5l1.7 4.2-2.1 1.4a11 11 0 0 0 5.3 5.3l1.4-2.1L19 14.5V18a2 2 0 0 1-2 2A13 13 0 0 1 3 6a2 2 0 0 1 2-2Z"/>',
  chat: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 4v-4A2.5 2.5 0 0 1 4 13.5Z"/>',
  fuel: '<path d="M5 20V5.5A1.5 1.5 0 0 1 6.5 4h6A1.5 1.5 0 0 1 14 5.5V20M4 20h11M14 9h2.5a1.5 1.5 0 0 1 1.5 1.5v6a1.5 1.5 0 0 0 3 0V8l-3-3"/><path d="M7.5 8h4"/>',
  gauge: '<path d="M4.5 17a8.5 8.5 0 1 1 15 0"/><path d="m12 13 3.5-4.5"/><circle cx="12" cy="13.5" r="1"/>',
  calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3m0 12v3m9-9h-3M6 12H3m15.4-6.4-2.1 2.1M7.7 16.3l-2.1 2.1m0-12.8 2.1 2.1m8.6 8.6 2.1 2.1"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6Z"/>',
  leaf: '<path d="M5 19c0-8 4-13 14-14 0 9-4 14-12 14"/><path d="M5 19c2-4 5-7 9-9"/>',
  expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5m11-5v5h-5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  'chevron-right': '<path d="m9 6 6 6-6 6"/>',
  tag: '<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.2"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8m-3 3 2.5 2.5M14 9l2 2"/>',
  spark: '<path d="M12 3v4m0 10v4M3 12h4m10 0h4M6 6l2.5 2.5m7 7L18 18M18 6l-2.5 2.5m-7 7L6 18"/>',
  copy: '<rect x="8.5" y="8.5" width="11" height="11" rx="2"/><path d="M15.5 8.5v-2a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2"/>',
  share: '<path d="M12 15V3m0 0L8 7m4-4 4 4M5 12v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>',
  star: '<path d="m12 3.5 2.7 5.6 6.1.8-4.5 4.2 1.1 6-5.4-3-5.4 3 1.1-6-4.5-4.2 6.1-.8Z"/>',
};

/** Hoja de símbolos (se inserta una sola vez en el DOM). */
export const sprite = () =>
  `<svg class="sprite" width="0" height="0" aria-hidden="true" focusable="false"><defs>${Object.entries(P)
    .map(([k, d]) => `<symbol id="i-${k}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${d}</symbol>`)
    .join('')}</defs></svg>`;

export const icon = (name, cls = '') => raw(`<svg class="i ${cls}" aria-hidden="true" focusable="false"><use href="#i-${name}"/></svg>`);
