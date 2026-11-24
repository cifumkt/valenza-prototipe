# VALENZA® — Web v7

Web estática de Valenza Exclusive Autos: JavaScript moderno (módulos ES), sin dependencias ni paso de compilación.

## Ver en local
```bash
npm run dev          # o: python3 -m http.server 8000
```
Abre http://localhost:8000 (no sirve abrir `index.html` con doble clic: usa módulos y `fetch`).

## Publicar en GitHub Pages
1. Crea el repositorio `valenza-web` y sube todo el contenido de esta carpeta (rama `main`).
2. En **Settings → Pages**, elige **Source: GitHub Actions**. El workflow `.github/workflows/pages.yml` publica en cada push.

> Para cabeceras de seguridad reales (CSP, HSTS…) usa Cloudflare Pages/Netlify (`_headers`) o Vercel (`vercel.json`). GitHub Pages solo admite la CSP de la etiqueta `<meta>` de `index.html`.

## Estructura
```
index.html            CSP, noindex, precarga de fuentes/portada/datos
css/styles.css        diseño completo (sin estilos en línea)
js/main.js            router, transiciones entre páginas, eventos globales
js/config.js          ⭐ teléfonos, WhatsApp, sedes, financiación, modo demo
js/views/             home, catalog, detail, pages (financiación, contacto…)
js/leads.js           único punto de envío de formularios
data-src/vehicles.json  exportación SANEADA de Inventario Pro
data/                 stock.json (ligero) + cars/<id>.json (generados)
assets/               fotos WebP optimizadas, logos, fuentes propias
scripts/build-data.mjs  regenera data/ desde data-src/
```

## Actualizar el stock
Sustituye `data-src/vehicles.json` por la nueva exportación **ya saneada** (sin matrícula, bastidor ni sociedad) y ejecuta `npm run data`. El script aborta si detecta campos prohibidos. El workflow también lo regenera.

## Antes de publicar de verdad (checklist)
- [ ] `js/config.js`: rellenar `PHONE`, `WHATSAPP`, direcciones/teléfonos de sedes y `BANNER:''`.
- [ ] Quitar `<meta name="robots" content="noindex">` de `index.html` y cambiar `robots.txt`.
- [ ] Formularios reales: backend/CRM con validación en servidor y antibot (Turnstile/hCaptcha) y límite de peticiones; `DEMO:false`, `LEADS_ENDPOINT`, y añadir su URL a `connect-src` (index.html, `_headers`, `vercel.json`).
- [ ] Textos legales (aviso legal, privacidad, cookies) redactados por la asesoría (`#/legal` es una plantilla).
- [ ] Financiación: validar TIN y mostrar **TAE** según normativa antes de publicar cuotas.
- [ ] Fotos: hoy se enlazan desde `fotos.inventario.pro`. Lo ideal es copiarlas a tu propio CDN.
- [ ] SEO: la ruta por hash (`#/coche/123`) no se indexa por coche. Para SEO real, migrar a Next.js/Astro con una página por vehículo (los componentes y datos ya están separados para ello).

## Seguridad incluida
Sin manejadores `onclick` ni estilos en línea (CSP estricta `script-src 'self'; style-src 'self'`), plantilla `h` que escapa todo dato interpolado, URLs de imagen solo `https`, `referrerpolicy="no-referrer"` en fotos externas, fuentes autoalojadas (sin Google Fonts), honeypot en formularios, `localStorage` tolerante a fallos y JSON sin datos internos.
