# Feature Technical Document (FTD): Biblioteca Global de Sellos Gráficos y Optimización UX del Panel

## 1. Intent (Intención)
Implementar un sistema no destructivo de sellos gráficos (overlays sobre la imagen del producto) para "Nuevo Modelo", "Color Maker" y "Polar day" con biblioteca global, selector contextual de posición y capa (delante/detrás), junto con una modernización integral de la usabilidad del modal de producto (sticky header con visibilidad y guardado inmediato, eliminación de redundancias y purga de badges obsoletos).

## 2. Scope (Alcance)
- **Tipos (`src/shared/types.ts`)**:
  - Definición de `PosicionSello`, `CapaSello` y `SelloGraficoConfig`.
  - Integración en `DatosTecnicos.sellos_graficos`.
- **Assets Gráficos Oficiales (`data/badges/`)**:
  - SVG vectoriales nítidos y transparentes para:
    - `nuevo-modelo.svg` (sello circular dentado rojo con texto blanco).
    - `colormaker.svg` (logo color maker policromático).
    - `polarday.svg` (logotipo verde polar day).
- **Modal de Producto (`ProductEditForm.tsx`)**:
  - Header fijo (*sticky*): título, switch `Visible en Catálogo Web`, botones `Cancelar` y `Guardar` arriba siempre accesibles.
  - Eliminación de cajas redundantes del modelo base/variante.
  - Retiro de "Marcar con Badge Nuevo Ingreso" de la Sección 1.
  - Reestructuración de la Sección 3:
    - Sellos Gráficos (`Nuevo Modelo`, `Color Maker`, `Polar day`) con selector de posición, capa delante/detrás, reemplazo de imagen y previsualización en vivo sobre la foto.
    - Distintivos independientes (`Dual Light`, `Parlante Incorporado`, `Early Warning`).
    - Eliminación definitiva de `Super Starlight`, `Micrófono Incorporado`, `PoE Integrado`, `Smart IR`.
- **Catálogo Público (`ProductCard.tsx` y `ProductDetailModal.tsx`)**:
  - Renderizado flotante CSS no destructivo de los sellos gráficos en tiempo real según capa y coordenadas.
- **Auditoría Adversarial**:
  - Pruebas y loop de revisión con árbitro adversarial hasta aprobación definitiva.

## 3. Checklist de Tareas
- [x] Definir interfaces de sellos gráficos en `types.ts` (`PosicionSello`, `CapaSello`, `SelloGraficoConfig`).
- [x] Crear archivos SVG vectoriales oficiales en `data/badges/` (`nuevo-modelo.svg`, `colormaker.svg`, `polarday.svg`).
- [x] Rediseñar cabecera sticky de `ProductEditForm.tsx` (switch de visibilidad en web, botones Cancelar y Guardar Ficha Técnica siempre accesibles).
- [x] Limpiar redundancias visuales en `ProductEditForm.tsx` (eliminada caja gris repetitiva del modelo; "Nuevo Ingreso" migrado a Sección 3).
- [x] Implementar la Sección 3 con sellos gráficos independientes, selector de posición (6 presets), capas (`front`/`back`), reemplazo de imagen con fallback oficial y previsualización en vivo.
- [x] Purgar definitivamente distintivos obsoletos (`Super Starlight`, `Micrófono Incorporado`, `PoE Integrado`, `Smart IR`) y desacoplar `Dual Light` y `Parlante Incorporado`.
- [x] Renderizar sellos gráficos flotantes y distintivos en `ProductCard.tsx` y `ProductDetailModal.tsx` con soporte retroactivo.
- [x] Subsanar observaciones del árbitro adversarial (prevención de recursión infinita en `onError`, elevación de z-index de badges funcionales a z-20, null-safety en overlays y normalización bidireccional en el filtro de badges de `App.tsx`).
- [x] Ejecutar `npm run build` y verificar 0 errores de compilación TypeScript y bundling Vite.
- [x] Obtener aprobación formal del árbitro adversarial.

## 4. Evidence (Evidencia)
- Compilación impecable verificada vía `npm run build`:
  - `tsc -p tsconfig.json --noEmit` completó con código 0 (0 errores de tipos).
  - Bundling de producción Vite completó en 45.11s generando artefactos listos para NAS/Docker en `dist/client`.
  - `tsc -p tsconfig.server.json` completó con código 0.
- Auditoría adversarial destructiva superada:
  - Manejo de fallback de imágenes blindado con `img.onerror = null`.
  - Filtrado en catálogo público normalizado contra variaciones de casing y sincronizado con `sellos_graficos`.
  - Jerarquía CSS validada: Sellos traseros (`z-0`) < Imagen de producto (`z-10`) < Sellos frontales y Badges funcionales (`z-20`) < Badge de Stock (`z-30`).
  - Total compatibilidad retroactiva garantizada para registros preexistentes en SQLite.

## 5. Next Step (Próximo Paso)
Implementación y auditoría completadas con excelencia. Listo para despliegue y puesta en marcha en producción.
