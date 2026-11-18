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


## V3 — cambios del 18/11/2026
- Sustitución de emojis de categorías, buscador, enlaces y confianza por iconos SVG minimalistas.
- Fotografía original facilitada por Valenza en la sección de tasación.
- Calculadora orientativa integrada en cada ficha con 6,49 % **TIN** (no TAE), entrada y plazo configurables. Cálculo francés sin costes adicionales; no es oferta vinculante.
- Página Contacto con formulario demostrativo (no envía ni almacena datos).
- Botón flotante de WhatsApp con el recurso gráfico facilitado y panel informativo: en la prueba no abre consultas reales.
- Bloque «Enviamos a toda la península» en la home, con mapa esquemático SVG interactivo, flechas desde Córdoba y destinos seleccionables. No representa distancias, recorridos reales ni tiempos de entrega.

El stock es una copia de la exportación del 17/11/2026; no está sincronizado en tiempo real.

## Cambios de V4 (18/11/2026)
- Menú principal: enlace **Inicio**.
- Sección de envíos: mapa de España peninsular + Portugal con contornos geográficos de referencia, flechas visibles simultáneamente desde Córdoba hacia diez ciudades y selección opcional para destacar una zona (sin rutas ni plazos de transporte).
- Galería fotográfica real «Pasión por cada detalle» en la portada, con cuatro imágenes proporcionadas por Valenza.
- Conserva las herramientas, el stock y los avisos de entorno de pruebas de V3.

**Limitación:** el mapa es una representación geográfica simplificada, no una cartografía de transportes ni un servicio de navegación. Las flechas muestran cobertura de ejemplo. La web sigue siendo un prototipo estático y no captura leads.


## V5 — Mapa a partir de referencia facilitada por el cliente

El mapa de la sección de entregas utiliza el contorno cartográfico y las coordenadas del componente `MapaEspana.js` de `asg-web 2.zip`, adaptados a la identidad Valenza y a un prototipo estático sin React. Múltiples conexiones curvas salen simultáneamente desde Córdoba. No se muestra un destino fijo al cargar. Se excluyen Canarias y Baleares por tratarse de una sección de envíos peninsulares.

## Novedades V6 (18/11/2026)
- Ubicación eliminada de las fichas de vehículo, tarjetas y mensaje emergente de consulta. Se conserva el dato de sede internamente para el filtro del catálogo y futura asignación de leads.
- Galería ampliable a pantalla completa con teclado (Esc, flechas), contador y miniaturas.
- Sección de vehículos relacionados según marca o carrocería.
- Animación de entrada sutil por desplazamiento y efectos hover en tarjetas, categorías y fotos reales.
- Nueva sección editorial premium con fotografía real de las instalaciones Valenza y etiquetas en la galería del showroom.
- Se respeta la preferencia de movimiento reducido (`prefers-reduced-motion`).
- Siguen en modo prueba las comunicaciones, la tasación y los cálculos de financiación; no se envían datos personales ni hay WhatsApp real.
- Se mantienen los enlaces de imágenes de Inventario Pro. Requieren conexión a Internet.

### Comprobaciones
- `node --check app.js`: correcto.
- Servidor HTTP local: respuesta 200.
- La verificación visual automatizada en Chromium no se completó por fallo del proceso gráfico; pendiente comprobar escritorio y móvil manualmente.
