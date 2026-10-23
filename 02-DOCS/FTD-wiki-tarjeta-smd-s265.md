# FTD: Icono en Tarjeta SMD y Renovación de Tarjeta S+265 (Smart H.265) en Wiki Técnica

## 1. Intención (Intent)
1. Integrar el logotipo recortado de **SMD** a la izquierda del título en la tarjeta `#smd`, manteniendo la altura de línea homogénea con `h-6 sm:h-7`.
2. Actualizar la tarjeta y el índice de **S+265 (Smart H.265)** homologando su estructura editorial: título conciso en índice, introducción técnica sobre compresión ROI, 3 tarjetas de ventajas y recuadro de aplicación ideal.

## 2. Alcance (Scope)
- **`public/data/images/` y `data/images/`**:
  - `smd-tight.png` (664x276) disponible para la cabecera de SMD.
- **`src/client/pages/WikiPage.tsx`**:
  - `#smd`: Incorporar `smd-tight.png` a la izquierda del título con `h-6 sm:h-7 w-auto`.
  - `WIKI_TOPICS`: Actualizar `codec-s265` con título `"S+265 (Smart H.265)"` y `badge: ''`.
  - `#codec-s265`: Actualizar cabecera, párrafo introductorio de compresión adaptativa ROI, 3 tarjetas de ventajas (`Ahorro masivo de almacenamiento`, `Bajo consumo de ancho de banda`, `Calidad donde importa`) y recuadro destacado de aplicación ideal.

## 3. Lista de Tareas (Checklist)
- [x] Copiar `smd-tight.png` a las carpetas estáticas.
- [x] Integrar el icono de SMD en la cabecera de la tarjeta `#smd`.
- [x] Actualizar el índice lateral para `codec-s265`.
- [x] Renovar la tarjeta `#codec-s265` con su nuevo contenido estructurado.
- [x] Ejecutar `npm run build` y comprobar compilación sin errores.

## 4. Evidencia (Evidence)
- Compilación `npm run build` completada con éxito (código de salida 0).
- La tarjeta de SMD incluye a la izquierda de su título el nuevo logotipo `smd-tight.png` (`h-6 sm:h-7`) sin estirar la altura de la cabecera.
- La entrada del índice de Códec S+265 ahora figura como `"S+265 (Smart H.265)"` con formato sobrio.
- La tarjeta `#codec-s265` cuenta con cabecera homogénea, introducción sobre compresión adaptativa ROI, 3 tarjetas de ventajas (`Ahorro masivo de almacenamiento`, `Bajo consumo de ancho de banda`, `Calidad donde importa`) y recuadro de aplicación ideal.

## 5. Siguiente Paso (Next Step)
- Presentar el resultado al usuario.
