---
author: Pablo
branch: master
status: done
---
# Correcciones en Precios (Tiempo Real y 2 Decimales) y Rediseño de Fichas de Cámaras

## Intent
1. Asegurar actualización de precios en el momento: invalidación de caché HTTP en la API, propagación en tiempo real al catálogo público, sincronización al volver del backoffice, y guardado automático inmediato en el editor rápido de precios al perder foco o presionar Enter.
2. Expresar siempre los precios con 2 dígitos decimales tanto en la visualización como en los paneles de carga (Editor Rápido y Formulario de Edición de Producto).
3. Rediseñar la presentación de las fichas de cámaras (ProductCard) según los requerimientos solicitados:
   - Botón Comparar reubicado abajo junto al botón Cotizar.
   - Botón de ver especificaciones completas (ojo) eliminado.
   - Serie (ej. AK SERIES) a la derecha en reemplazo del texto CAMARA (el cual se elimina).
   - Modelo de la cámara a la izquierda donde estaba la serie, con la spec variante debajo.
   - Eliminar texto redundante de modelo/spec y en su lugar mostrar el FORMATO (Turret, Bullet, etc.).
   - Eliminar sección ALCANCE DORI (METROS).
   - Eliminar el texto "PRECIO NETO".
   - Precio con mayor protagonismo (más grande: `text-lg font-black font-mono`), ubicado a la derecha debajo de la serie.
   - Incorporar chips técnicos de Sensor, Min. Iluminación y Visión Nocturna junto a Resolución, Distancia Focal y Apertura.
4. Ajustes en fichas rápidas o iniciales:
   - Chip condicional para SMD (con su versión) o VCA si posee analíticas. Oculto si no tiene ninguna.
   - Estado de stock reubicado abajo a la izquierda en el sector de la imagen.
   - Indicador de formato en la misma línea que las especificaciones técnicas para reducir altura.
   - Botón Cotizar con estilo neutro idéntico al de Comparar (sin fondo verde de acento).
5. Ajustes en cabecera, navegación y ordenamiento:
   - Botones de ordenamiento a la izquierda donde estaba el contador de modelos.
   - Botón "Defecto" eliminado; opción predeterminada y activa es "Modelo A-Z".
   - Contador "Mostrando X de Y modelos" movido a la derecha.
   - Leyenda "Precios expresados en U$S neto oficial sin IVA" eliminada.
   - Selector de categorías ("Cámaras IP", "NVRs", "Switches") permanentemente visible en cabecera sticky unificada.
   - Botones de Comparativa y Wiki Técnica ubicados sobre la derecha.

## Scope
- Backend: `src/server/api/routes.ts` (cabeceras Cache-Control no-store y redondeo a 2 decimales en batch update).
- Frontend Catálogo: `src/client/App.tsx`, `src/client/components/Navbar.tsx`, `src/client/components/TabsNav.tsx`, `src/client/components/ProductCard.tsx`.
- Frontend Admin: `src/client/admin/AdminPage.tsx`, `src/client/admin/modules/AdminBatchModule.tsx`, `src/client/admin/modules/AdminCatalogModule.tsx`, `src/client/admin/components/ProductEditForm.tsx`.

## Checklist
- [x] Documento FTD registrado.
- [x] Middleware no-store y anti-caché en `src/server/api/routes.ts` (`no-store, no-cache, must-revalidate`).
- [x] Propagación de refresco en tiempo real en `App.tsx` y `AdminPage.tsx` al volver del panel y al recuperar foco.
- [x] Formateo estricto a 2 decimales y guardado inmediato en `AdminBatchModule.tsx` con badges de estado.
- [x] Formateo estricto a 2 decimales en `ProductEditForm.tsx` (input y normalización en submit).
- [x] Rediseño completo de la cabecera, chips, eliminación de DORI y botones en `ProductCard.tsx`.
- [x] Chip condicional para SMD / VCA implementado en `ProductCard.tsx`.
- [x] Badge de stock reubicado abajo a la izquierda sobre la imagen en `ProductCard.tsx`.
- [x] Formato integrado en la línea de chips y botón Cotizar neutro en `ProductCard.tsx`.
- [x] Cabecera unificada sticky (`header sticky top-0`) con `Navbar` y `TabsNav` en `App.tsx`.
- [x] Pestañas de Comparativa y Wiki Técnica alineadas a la derecha en `TabsNav.tsx`.
- [x] Botones de ordenamiento a la izquierda (`Modelo A-Z` por defecto, sin `Defecto`) en `App.tsx`.
- [x] Contador de modelos a la derecha y leyenda de IVA eliminada en `App.tsx`.
- [x] Verificación de compilación TypeScript (`tsc --noEmit`) y build completo de producción.

## Evidence
- `routes.ts`: Middleware `Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate`, `Pragma: no-cache`, `Expires: 0`. Redondeo estricto de precios en `batch-update`.
- `App.tsx`: `fetchProductos` con query param timestamp anti-caché (`_t=Date.now()`), recarga inmediata al cambiar vista a catálogo y al recuperar el foco de la ventana (`window.addEventListener('focus')`), callback `onRefreshCatalog` propagado a `AdminPage`.
- `AdminBatchModule.tsx`: Input con `inputMode="decimal"`, formateo continuo a 2 decimales (`toFixed(2)`), auto-guardado en el momento al salir del campo (`onBlur`) o al presionar Enter, feedback visual de guardado (`Guardando...` / `Guardado ✔`).
- `ProductEditForm.tsx`: Estado dedicado `precioInput` formateado a 2 decimales con normalización automática al salir y guardar.
- `ProductCard.tsx`:
  - Botón flotante Comparar removido del contenedor de imagen y colocado en el pie junto al botón Cotizar.
  - Botón de especificaciones completas (ojo) eliminado.
  - Texto `CAMARA` eliminado; en su lugar (derecha) se muestra la Serie (`AK SERIES`).
  - Modelo de la cámara a la izquierda con la spec variante debajo.
  - Texto "PRECIO NETO" eliminado; precio reubicado a la derecha debajo de la serie con mayor tamaño y peso (`text-lg font-black font-mono`).
  - Redundancia de modelo/spec reemplazada por el formato (`Turret`, `Bullet`, etc.).
  - Sección `ALCANCE DORI (METROS)` eliminada de la tarjeta.
  - Chips técnicos ampliados con `Sensor`, `Min. Iluminación` y `Visión Nocturna` preservando Resolución, Distancia Focal y Apertura.
  - Chip condicional para `SMD` (prioritario con versión, ej. "SMD 2.0") o `VCA` (con tooltip de analíticas). Oculto si no posee ninguna.
  - Badge de stock reubicado a la esquina inferior izquierda del contenedor de imagen (`absolute bottom-2 left-2 z-10`).
  - Chip de formato integrado al inicio de la misma línea de especificaciones técnicas (`formatoLabel`).
  - Botón Cotizar estilizado con clases neutras (`bg-slate-100 dark:bg-slate-800 ...`) idéntico a Comparar.
- `TabsNav.tsx`:
  - Categorías (`Cámaras IP`, `NVRs`, `Switches`) agrupadas a la izquierda.
  - Herramientas (`Comparativa` con contador y `Wiki Técnica`) alineadas a la derecha con `ml-auto`.
- `App.tsx` (Cabecera y Catálogo):
  - Cabecera unificada sticky (`header sticky top-0 z-40`) con `Navbar` y `TabsNav` fijos durante el scroll.
  - Botones de ordenamiento a la izquierda (`Modelo A-Z` por defecto, `Precio: Menor`, `Precio: Mayor`). Botón `Defecto` eliminado.
  - Contador `Mostrando X de Y modelos` ubicado a la derecha. Leyenda de IVA eliminada.

## Next
Presentar al usuario el resumen completo de las modificaciones y el bloque-brújula de orientación.
