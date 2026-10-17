---
author: Pablo
branch: master
status: done
---
# Ajustes en Panel de Control y Web Público

## Intent
1. **Sector de Visibilidad de Secciones en Panel de Control**:
   - Permitir activar u ocultar de forma independiente cualquiera de las secciones en el catálogo público (`Cámaras IP`, `Grabadores NVR`, `Switches PoE`, `Accesorios`).
   - Persistir la configuración en base de datos SQLite y sincronizarla en tiempo real con la web pública.
2. **Unificar Editor Rápido Precios con Catálogo & Modelos**:
   - Incorporar un botón "Modificar Precios" en la barra superior junto al botón de nuevo producto.
   - Al activarlo, habilitar la edición rápida de precio (2 decimales, guardado inmediato en `onBlur`/`Enter`) y selectores interactivos de stock directamente en la tabla.
   - Retirar la pestaña separada de "Editor Rápido Precios" del menú lateral del admin para consolidar la gestión en un único módulo.
3. **Integrar Ingesta PDF en el Modal de Nuevo Producto**:
   - Renombrar el botón "Nuevo Producto Manual" a "Nuevo Producto".
   - Integrar dentro del modal de producto la zona dropzone y botón de subida "Cargar PDF", extrayendo automáticamente las especificaciones con IA y autocompletando la ficha.
4. **Corrección de Carga y Previsualización Inmediata de Imágenes**:
   - Arreglar el bug donde la imagen cargada no se previsualizaba en el cuadro de la ficha ni en la tabla tras guardar (requería recarga F5).
   - Permitir arrastrar y soltar (drag & drop) imágenes directamente sobre el modal de creación y edición.
   - Usar `URL.createObjectURL(blob)` para visualización local inmediata y `key={`${prod.id}-${prod.imagen_principal}`}` para reconstrucción reactiva en la tabla.
5. **Mejoras en Editor Rápido de Precios**:
   - Botón `X` en la barra de búsqueda para limpiar el texto y restablecer el catálogo instantáneamente.
   - Selector de STOCK con color dinámico idéntico a la opción seleccionada (`ENTREGA_INMEDIATA`, `POCAS_UNIDADES`, `ULTIMA_UNIDAD`, `PROXIMO_ARRIBO`, `AGOTADO`, `CONSULTAR`).
6. **Nueva Sección Accesorios en Web Público**:
   - Incorporar la sección `Accesorios` (`ACCESORIO`) en el sistema de navegación por pestañas (`TabsNav`), estadísticas y filtros.
7. **Búsqueda por Código Exclusiva para Panel**:
   - Retirar el input de búsqueda por código de la barra de navegación del sitio público (conservado en panel de control).
8. **Modo Visual Claro por Defecto**:
   - Establecer el tema claro como predeterminado (`darkMode: false`) al acceder a la web.
9. **Filtros de Series por Categoría en Barra Lateral**:
   - Cámaras: `AK Series`, `SK Series`, `LK Series`, `WIFI / 4G Solar`, `PTZ`.
   - NVR: `AK Series`, `SK Series`, `LK Series`.
   - Switches: Ocultar bloque de Series Tiandy y retirar la opción de "Modo Extendido" del filtro de puertos.

## Scope
- Base de datos y API:
  - `src/server/db/index.ts` (tabla `configuracion`, helpers `getConfiguracion`, `setConfiguracion`).
  - `src/server/api/routes.ts` (endpoints `/api/configuracion/secciones`, soporte de `accesorios` en `/api/stats`).
  - `src/shared/types.ts` (`TipoDispositivo` con `'ACCESORIO'`).
- Panel de Control (Backoffice):
  - `src/client/admin/AdminPage.tsx` (sidebar simplificado sin módulos duplicados).
  - `src/client/admin/modules/AdminCatalogModule.tsx` (panel de visibilidad de secciones, toggle "Modificar Precios", selectores coloreados de stock, botón `X` de búsqueda, miniatura reactiva).
  - `src/client/admin/modules/AdminBatchModule.tsx` (botón `X` y selectores coloreados).
  - `src/client/admin/modules/AdminDashboardModule.tsx` (navegación apuntando al catálogo unificado).
  - `src/client/admin/components/ProductEditForm.tsx` (zona dropzone y botón "Cargar PDF", drag & drop de imágenes, preview inmediato con blob local).
- Web Público:
  - `src/client/App.tsx` (modo claro por defecto, consumo de `seccionesVisibles`, filtrado de series semánticas, retiro de buscador por código).
  - `src/client/components/Navbar.tsx` (retiro de input de código).
  - `src/client/components/TabsNav.tsx` (pestaña Accesorios con icono Wrench y prop `seccionesVisibles`).
  - `src/client/components/FilterSidebar.tsx` (series categorizadas por tipo, exclusión de switches, retiro de modo extendido).

## Checklist
- [x] Documento FTD creado.
- [x] Tabla `configuracion` y endpoints de secciones creados en el backend.
- [x] Tipo `ACCESORIO` integrado en el tipado compartido y endpoints de estadísticas.
- [x] Pestaña `Accesorios` agregada a `TabsNav.tsx` y responsive drawer.
- [x] Visibilidad de secciones conectada en tiempo real entre admin y catálogo público.
- [x] Filtros laterales de series configurados estrictamente según solicitud (AK, SK, LK, WIFI / 4G Solar, PTZ para cámaras; AK, SK, LK para NVR; oculto en switches).
- [x] Checkbox "Modo Extendido" retirado de los filtros de switches.
- [x] Buscador por código removido de la interfaz pública y preservado en el backoffice.
- [x] Modo claro establecido como predeterminado en `App.tsx`.
- [x] Dropzone y botón "Cargar PDF" implementados en el modal de producto.
- [x] Botón "Nuevo Producto Manual" renombrado a "Nuevo Producto".
- [x] Drag & Drop para imágenes en el modal y resolución del bug de previsualización sin recargar.
- [x] Botón toggle "Modificar Precios" integrado en `AdminCatalogModule.tsx`.
- [x] Selectores de stock con estilo de color dinámico según la opción activa.
- [x] Botones `X` para restablecer búsquedas en catálogo y editor de precios.
- [x] Menú lateral de `AdminPage.tsx` unificado (retirados `batch` y `extractor`).
- [x] Compilación y empaquetado de producción exitoso con `npm run build`.

## Evidence
- `src/server/db/index.ts`: tabla `configuracion` creada con clave primaria, permitiendo persistir `secciones_visibles` en formato JSON.
- `src/server/api/routes.ts`: `GET /api/configuracion/secciones` y `POST /api/configuracion/secciones` operativos con invalidación de caché.
- `src/client/admin/modules/AdminCatalogModule.tsx`:
  - Panel superior interactivo con conteos y switches de visibilidad para `CAMARA`, `NVR`, `SWITCH`, `ACCESORIO`.
  - Botón toggle `Modificar Precios`: activa edición inmediata de precios (2 decimales con commit al desenfocar o Enter) y selects de stock.
  - Helper `getStockStyle`: asigna dinámicamente bordes y fondos de color (verde esmeralda, ámbar, cielo, rosa, violeta) a cada estado de stock.
  - Miniatura con `key={`${prod.id}-${prod.imagen_principal}`}` que actualiza inmediatamente la imagen en la tabla tras guardar.
- `src/client/admin/components/ProductEditForm.tsx`:
  - Dropzone de PDF conectada a `/api/extract-pdf` que llena automáticamente los campos del formulario.
  - Dropzone de imágenes con preview inmediato vía `URL.createObjectURL(blob)`.
- `src/client/App.tsx`:
  - `darkMode: false` por defecto.
  - `seccionesVisibles` sincronizado con el backend; pestañas y tarjetas ocultadas si la sección está deshabilitada.
- Verificación: `npm run build` ejecutado con éxito (código de salida 0).
