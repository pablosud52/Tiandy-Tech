# FTD: Refinamiento de la Wiki, Badges SMD y Detección de Ambiente (Interior/Exterior)

## Intent
Mejorar visualmente el encabezado y las tarjetas de la Wiki Técnica, aplicar una prueba comparativa de estilos cromáticos a los badges de SMD (1.0 vs 2.0/3.0) sin iconos ni subtítulos, e incorporar el indicador de ambiente (Interior / Exterior) en las vistas de Ficha y Tabla con capacidad de gestión y sobreescritura manual desde el panel de edición de etiquetas.

## Scope
1. **Wiki (`WikiPage.tsx`):**
   - Simplificación del encabezado: únicamente icono `BookOpen` (`h-8 w-8 text-tiandy-500`) y título "Wiki Técnica Tiandy".
   - Título de la tarjeta SMD: acortar el guión largo em-dash a un guión normal con espaciado uniforme.
   - Chips de subsecciones en las tarjetas: aplicar Opción 1 con fondo pizarra neutro, borde verde Tiandy (`border-tiandy-500/50`) y micropunto verde corporativo (`•`).
   - Dinamismo en listas técnicas (*Prestaciones clave*, *Ideal para*, etc.) con viñetas sutilmente estilizadas.
2. **Badges SMD (`smd-1.svg`, `smd-2.svg`, `smd-3.svg`):**
   - Eliminar iconos y textos secundarios inferiores.
   - `SMD 1.0`: Opción 1 (Fondo verde Tiandy `#00A859`, borde blanco `#ffffff`, texto "SMD 1.0" completamente blanco puro).
   - `SMD 2.0` y `SMD 3.0`: Opción 2 (Fondo pizarra oscuro `#0f172a`, borde verde Tiandy `#00A859`, texto "SMD" blanco y versión en verde neón `#00e676`).
   - Sincronización en `data/badges/` y cache-busting `?v=20261025` en `Badges.tsx`.
   - Visualización de badges SMD en la columna RESOLUCIÓN en Modo Tabla.
3. **Ambiente de Instalación (Interior / Exterior):**
   - Actualización de tipos y helpers (`types.ts`, `helpers.ts`): propiedad `ambiente` con fallback exacto (`TC-C320N` = `INTERIOR`, resto = `EXTERIOR`).
   - Modo Ficha (`ProductCard.tsx`): chip centrado en la fila superior entre el chip de Serie y el precio.
   - Modo Tabla (`ProductTable.tsx`): chip ubicado debajo del badge de formato.
   - Panel de Administración (`ProductEditForm.tsx`): selector en la pestaña 3 "Etiquetas y Sellos" para forzar `EXTERIOR` o `INTERIOR` con persistencia en `productos.json`.
4. **Verificación:**
   - Compilación limpia con `npm run build`.

## Checklist
- [x] Crear documento FTD en `02-DOCS/`.
- [x] Actualizar encabezado, separación SMD, chips y viñetas en `src/client/pages/WikiPage.tsx`.
- [x] Rediseñar los SVGs de `public/data/badges/smd-1.svg`, `smd-2.svg` y `smd-3.svg` con contenedor grafito y tipografía blanca unificada.
- [x] Añadir campo `ambiente` y lógica en `src/shared/helpers.ts` y `src/shared/types.ts`.
- [x] Implementar chip en `src/client/components/ProductCard.tsx` (alineado junto a la serie con estilo gris estándar).
- [x] Implementar chip en `src/client/components/ProductTable.tsx` (bajo formato con estilo gris estándar).
- [x] Implementar badge de ambiente en la cabecera y tabla técnica de `src/client/components/ProductDetailModal.tsx` (50% más grande y con estilo gris estándar).
- [x] Incorporar selector de ambiente en `src/client/admin/components/ProductEditForm.tsx`.
- [x] Actualizar `public/data/productos.json` con `ambiente_instalacion` para los modelos correspondientes.
- [x] Ejecutar `npm run build` y validar sin errores.
- [x] Publicar en Cloudflare Pages y sincronizar con GitHub.

## Evidence
- `npm run build` compiló limpiamente sin errores de TypeScript ni de bundler.
- `productos.json` verificado: 2 cámaras con ambiente `INTERIOR` (`TC-C320N 1ANB-28` y `TC-C320N 1CNB-28`) y 36 con ambiente `EXTERIOR`.
- SVGs de SMD (`SMD 1.0`, `SMD 2.0`, `SMD 3.0`) unificados con contenedor grafito oscuro (`#0f172a`), contorno verde Tiandy (`#00A859`) y texto completamente blanco (`#ffffff`).
- Chips de ambiente (INTERIOR / EXTERIOR) homogeneizados a la paleta neutra común (`bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700`).
- Vista Ficha: el chip se ubica ahora inmediatamente junto al chip de serie `[AK SERIES]`.
- Modal de producto: el chip en la zona de título incrementó su escala en un 50% (`text-sm sm:text-base px-3.5 py-1`).
- Publicación a Cloudflare Pages ejecutada exitosamente (`deploymentUrl: https://6bc23955.tiandy-tech.pages.dev`).
