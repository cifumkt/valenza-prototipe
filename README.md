# VALENZA® — Primer prototipo navegable

Prototipo **independiente y estático** de la nueva Valenza.es (fase de validación UX). No modifica el dominio público, no envía leads ni realiza ninguna operación real. Es la base para validar diseño y datos antes de implementar la arquitectura Next.js prevista.

## Ver la prueba localmente

1. Descomprimir el ZIP.
2. Abrir una terminal en la carpeta `valenza-web`.
3. Ejecutar `python3 -m http.server 8000` (o `npx http-server -p 8000`).
4. Abrir `http://localhost:8000`.

No requiere `npm install` ni servicios externos para ejecutar la interfaz. **Sí requiere conexión a Internet para cargar las fotos originales alojadas en Inventario Pro y las fuentes de Google.**

## Incluido

- Portada responsive premium.
- Catálogo de 168 vehículos marcados «En venta», con filtros de marca, combustible, ubicación, carrocería, cambio, precio y ordenación.
- Fichas de los 183 registros del archivo (aunque únicamente los 168 «En venta» aparecen en catálogo), con fotografía principal, galería, especificaciones y equipamiento.
- Favoritos locales y comparación de tres coches mediante `localStorage`.
- Vista de tasación demostrativa, sin datos enviados ni almacenados.
- Simulador financiero con TIN hipotético visible, sin oferta vinculante.
- Modelo de contacto por WhatsApp en modo prueba (solo copia texto; no abre conversaciones reales).
- Logotipos originales proporcionados y JSON filtrado de campos internos.

## Fuente del inventario

`data/vehicles.json` es una copia **reducida para web** de `coches_20261117.json`, exportado desde Inventario Pro el 17/11/2026: 183 registros, 168 en venta, 11 reservados, 4 vendidos, 3.969 URLs de fotografías. Se han omitido campos como matrícula, bastidor, sociedad e información interna. **Nunca publicar el JSON original.**

El estado y precio son una instantánea: no son datos en tiempo real. El prototipo no debe publicarse como tienda abierta al público sin actualización y revisión de condiciones comerciales.

## Próximo paso técnico

Migrar estos componentes validados a **Next.js + TypeScript**, generar páginas SEO por vehículo, diseñar importador reproducible para sucesivos JSON y definir tratamiento de desapariciones/estados, comprobaciones de stock, CRM y contactos reales. El frontend debe permanecer separado del adaptador de Inventario Pro.

## Repositorio GitHub sugerido

`valenza-web`. Subir los archivos de este proyecto, pero no subir archivos fuente con matrículas/VIN ni credenciales. La versión pública debe operar con el JSON saneado o un servidor con filtrado de campos.


## Actualización V2 — 18/11/2026
- Mayor espaciado vertical y separación entre campos del buscador de portada.
- Filtros de carrocería y transmisión en portada, conectados a los filtros ya existentes del catálogo.
- Nueva sección «Coche a la carta» en la portada y ruta `#/coche-a-la-carta`.
- Formulario de solicitud ilustrativo: no almacena ni envía información.
- Las categorías de carrocería del filtro reflejan los valores literales exportados por Inventario Pro; solo aparecen opciones presentes en el stock.
