# FTD: Clasificación de Series en NVRs y Actualización de Menús

## Intención
Actualizar la clasificación y orden de filtrado de las Series de NVRs en el catálogo público e incorporar las nuevas series (`Light AI` y `AI`) en las fichas de edición de productos del backoffice para permitir reasignar equipos a sus series correspondientes.

## Alcance
1. **Filtro Lateral (`src/client/components/FilterSidebar.tsx`)**:
   - Para la sección de NVRs, se actualizaron los items y el orden estricto solicitado:
     1. `AK`
     2. `SK`
     3. `Light AI`
     4. `LK`
     5. `AI`
2. **Lógica de Filtrado Reactivo (`src/client/App.tsx`)**:
   - Soporte para `AK`, `SK`, `LIGHT_AI`, `LK`, `AI`.
   - Blindaje de discriminación para `AI` evitando falsos positivos con `Light AI`.
   - Compatibilidad retroactiva con sufijos comerciales (`AK Series`, `SK Series`, `LK Series`, etc.).
3. **Ficha de Edición de Producto (`src/client/admin/components/ProductEditForm.tsx`)**:
   - Ampliación de opciones de serie para NVRs en el selector desplegable con las nuevas series (`AK`, `SK`, `Light AI`, `LK`, `AI` y variantes con sufijo `Series`).
   - Actualización de la validación al alternar el tipo de dispositivo hacia NVR.
4. **Verificación y Compilación**:
   - Pruebas unitarias de coincidencia de series y discriminación de `AI` vs `Light AI`.
   - Compilación completa del proyecto con `npm run build` (0 errores).

## Checklist
- [x] Actualizar lista y orden de series de NVR en `src/client/components/FilterSidebar.tsx`.
- [x] Actualizar evaluación de coincidencia de series en `src/client/App.tsx`.
- [x] Actualizar `seriesOptions` y validación de NVR en `src/client/admin/components/ProductEditForm.tsx`.
- [x] Compilar con `npm run build` (0 errores).
- [x] Probar y verificar reactividad del filtro de NVRs con suite de tests.

## Evidencia
1. **Compilación de Producción (`npm run build`)**:
   - `tsc -p tsconfig.json --noEmit`: 0 errores.
   - `vite build`: bundle generado con éxito (`dist/client/assets/index-KwlH_bcm.js`).
   - `tsc -p tsconfig.server.json`: 0 errores.
2. **Suite de Pruebas de Filtrado (`test_nvr_series.js`)**:
   ```
   AK match count: 2 (IDs 1, 2)
   SK match count: 2 (IDs 3, 4)
   LIGHT_AI match count: 2 (IDs 5, 6)
   LK match count: 2 (IDs 7, 8)
   AI match count: 2 (IDs 9, 10 - sin falsos positivos de Light AI)
   LIGHT_AI + AI match count: 4 (IDs 5, 6, 9, 10)
   ALL NVR SERIES TESTS PASSED PERFECTLY!
   ```

## Siguiente Paso
Informar al usuario de los cambios listos para que pueda realizar la reasignación de los NVRs a sus nuevas series desde el panel.
