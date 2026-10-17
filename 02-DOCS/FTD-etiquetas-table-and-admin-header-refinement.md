# FTD: Refinamiento Integral de Etiquetas, Vista Tabla y Unificación de Cabecera Admin

## 1. Intent & Scope
Este documento formaliza el rediseño y refinamiento solicitado para Tiandy Tech:
1. **Sistema Unificado de Etiquetas (ex-Badges)**:
   - Eliminar la rigidez de imágenes obligatorias predefinidas.
   - Modelo conceptual idéntico a *Dual Light* / *Parlante incorporado*: cada etiqueta es un distintivo técnico textual y, **si se desea**, se le asocia una imagen personalizada.
   - Soporte total para subida de imágenes PNG/JPG/WebP/SVG (corrigiendo la discrepancia `data.url` vs `data.imageUrl` en `/api/upload-image`).
   - Selector de anclaje de escala: `esquina` (mantiene la imagen pegada al borde/esquina sin invadir el producto) vs `centro` (escala concéntrica).
   - Renombrar en toda la plataforma: "Gestor de Etiquetas" y "Etiquetas".
2. **Rediseño de Vista Tabla Pública (`ProductTable.tsx`)**:
   - Eliminar la columna dedicada "Red & Interfaz" y trasladar esa información debajo del modelo con tipografía gris técnica (`text-slate-500 dark:text-slate-400`).
   - Eliminar el chip anaranjado redundante "Nuevo" del texto del modelo.
   - Encapsular la tabla en un contenedor con altura máxima (`max-h-[660px]`) y desplazamiento vertical interno con cabecera `<thead>` sticky (`top-0 z-20`).
   - Aumentar el tamaño de las filas al doble del original (contenedor de imagen `w-28 h-28` / 112px con padding `py-4`) para máxima visibilidad de fotos y etiquetas.
3. **Unificación y Limpieza de Cabecera del Panel de Control**:
   - Eliminar la doble cabecera (Navbar público + Header de AdminPage) que provocaba solapamientos y desbordes al hacer scroll.
   - Crear una única cabecera sticky, angosta (52px), elegante y cohesionada para el backoffice.
   - Eliminar botones redundantes ("Ver Catálogo") y funciones duplicadas.
   - Pulir la paleta cromática del panel: reemplazar la sobrecarga de colores estridentes por una estética minimalista, armónica y profesional basada en tonos slate neutros y verde Tiandy de acento.

---

## 2. Checklist de Tareas

- [x] **Backend & Assets**:
  - [x] Garantizar que `/api/upload-image` retorne tanto `url` como `imageUrl` para compatibilidad absoluta.
  - [x] Registrar las 3 imágenes subidas por el usuario (`colormaker.png`, `nuevo-modelo.png`, `polarday.png`) en `data/badges/`.
  - [x] Soportar en `types.ts` el campo opcional `anclaje?: 'esquina' | 'centro'` en `BadgeGlobalConfig` y `SelloGraficoConfig`.
  - [x] Renombrar semánticamente conceptos de Badge a Etiqueta.
- [x] **Componente Badges / Etiquetas (`Badges.tsx`)**:
  - [x] Soportar renderizado de Etiquetas: si tiene `imagen_url` muestra el sello gráfico; si no tiene imagen, se muestra como pastilla de texto o distintivo.
  - [x] Implementar `transformOrigin`: si `anclaje === 'esquina'` aplica `top left`, `top right`, `bottom left`, etc., según la posición; si es `centro`, aplica `center`.
- [x] **Módulo Gestor de Etiquetas (`AdminBadgesModule.tsx`)**:
  - [x] Renombrar a "Gestor de Etiquetas".
  - [x] Corregir la subida de PNG/JPG usando `data.url || data.imageUrl`.
  - [x] Agregar selector de anclaje: `Borde/Esquina` vs `Centrado`.
  - [x] Permitir quitar la imagen de una etiqueta para que funcione puramente como pastilla de texto, y añadir imagen a cualquier etiqueta.
- [x] **Cabecera y Estética del Admin (`AdminPage.tsx` y `App.tsx`)**:
  - [x] En `App.tsx`, evitar renderizar la cabecera pública de navegación (`Navbar`) cuando `activeView === 'admin'`.
  - [x] En `AdminPage.tsx`, rediseñar la cabecera en una sola barra angosta (56px), limpia y sin subcabeceras superpuestas.
  - [x] Integrar el toggle de modo oscuro, datos del usuario y salida limpia ("Ver Web" / "Salir").
  - [x] Unificar la paleta de colores del sidebar y módulos: diseño sofisticado, minimalista y funcional.
- [x] **Vista Tabla Pública (`ProductTable.tsx`)**:
  - [x] Retirar columna "Red & Interfaz".
  - [x] Mostrar datos de red/conectividad debajo del modelo y variante en texto gris tenue.
  - [x] Retirar chip anaranjado "Nuevo" de la columna de texto.
  - [x] Contenedor con `max-h-[660px] overflow-y-auto` y `thead sticky top-0`.
  - [x] Fila 2x más amplia con contenedor `w-28 h-28` (112px).
- [x] **Ajustes Críticos de Sellos y UX (Feedback Usuario)**:
  - [x] Eliminar el parpadeo de carga: persistencia instantánea de `globalBadges` en `localStorage` en [`App.tsx`](file:///g:/Mi%20unidad/GitHub/Tiandy%20Tech/src/client/App.tsx) y eliminación de la inyección de sellos sintéticos obsoletos en [`Badges.tsx`](file:///g:/Mi%20unidad/GitHub/Tiandy%20Tech/src/client/components/Badges.tsx).
  - [x] Transparencia real: procesar `nuevo-modelo.png` a PNG 32bpp con canal alfa real (eliminando el fondo negro) y proteger las imágenes de etiquetas en [`storage-cleaner.ts`](file:///g:/Mi%20unidad/GitHub/Tiandy%20Tech/src/server/services/storage-cleaner.ts).
  - [x] Rango de tamaño ampliado hasta el 200%: slider extendido a `max="200"`, presets de 70% a 200% y campo numérico directo en [`AdminBadgesModule.tsx`](file:///g:/Mi%20unidad/GitHub/Tiandy%20Tech/src/client/admin/modules/AdminBadgesModule.tsx).
- [x] **Verificación y Auditoría**:
  - [x] `npm run build` sin errores (0 errores de compilación, 1934 módulos transformados).
  - [x] Auditoría adversarial independiente de UI/UX y arquitectura.

---

## 3. Evidence & Verification Plan
- Inspección de subida de imágenes PNG/JPG en el Gestor de Etiquetas.
- Validación del anclaje de esquina en el escalado de etiquetas.
- Comprobación del scroll independiente de la tabla sin alargar la página.
- Comprobación de que la cabecera del admin sea única, angosta y no tenga solapamientos en scroll.
