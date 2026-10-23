# FTD: Clasificación de Series en NVRs y Sincronización Cloudflare Pages

## Intención
1. Revertir y actualizar la clasificación de series en la sección de NVRs con la nomenclatura exacta solicitada (`AK Series`, `SK Series`, `Light AI`, `LK Series`, `AI NVR`) y reasignar las 13 fichas técnicas a sus series correspondientes en la base de datos SQLite y snapshots.
2. Resolver la discrepancia de visibilidad en Cloudflare Pages, donde la sección Wiki figuraba desactivada y Accesorios activada debido a snapshots estáticos no sincronizados en `public/data/sections.json` y la interceptación HTML del router SPA.

## Alcance
1. **Reasignación de Fichas en Base de Datos (`data/tiandy.db`)**:
   - **AK Series**: `TC-R3104 I/B/P4/C/Eu/L/S/V2.0`, `TC-R3108 I/B/P8/C/Eu/L/S/V2.0`.
   - **SK Series**: `TC-R3105 I/B/L/S`, `TC-R3110 I/B/L/Eu/V1.1`, `TC-R3116 I/B/L/Eu/V1.1`, `TC-R3120 2MC`, `TC-R3232 I/B/K/V3.1`.
   - **Light AI**: `TC-R3110 4HA`, `TC-R3120 4HA`, `TC-R3232 4HA`.
   - **LK Series**: `TC-R3210 I/F`.
   - **AI NVR**: `TC-R3240 4HB`, `TC-R3880 4HB`.
2. **Filtro Lateral (`src/client/components/FilterSidebar.tsx`)**:
   - Opciones visibles en el orden estricto:
     1. `AK Series`
     2. `SK Series`
     3. `Light AI`
     4. `LK Series`
     5. `AI NVR`
3. **Filtro Reactivo (`src/client/App.tsx`)**:
   - Coincidencia exacta para `AK`, `SK`, `LIGHT_AI`, `LK`, `AI_NVR`.
   - Carga directa de snapshots estáticos en modo público (`isPublicBuild`) sin llamadas API fallidas que retornen `index.html`.
4. **Ficha de Edición (`src/client/admin/components/ProductEditForm.tsx`)**:
   - Selector de series para NVRs con las 5 opciones oficiales y validación en cambio de tipo de dispositivo.
5. **Sincronización Automática de Snapshot (`src/server/api/routes.ts`)**:
   - En `POST /api/configuracion/secciones`, actualización inmediata y persistente de `public/data/sections.json` y `dist/public/data/sections.json`.

## Checklist
- [x] Actualizar las 13 fichas de NVRs en SQLite (`data/tiandy.db`).
- [x] Regenerar `public/data/productos.json` y `public/data/sections.json` con `WIKI: true` y `ACCESORIO: false`.
- [x] Añadir sincronización de archivos estáticos en `routes.ts`.
- [x] Optimizar `App.tsx` para Cloudflare Pages (`isPublicBuild`).
- [x] Actualizar `FilterSidebar.tsx` y `ProductEditForm.tsx`.
- [x] Compilar con `npm run build` y `npm run build:public` (0 errores).
- [x] Verificar coincidencia de filtros sobre los 13 NVRs reales.

## Evidencia
1. **Verificación de 13 NVRs (`verify_real_nvrs.js`)**:
   - AK Series: 2 equipos coincidentes.
   - SK Series: 5 equipos coincidentes.
   - Light AI: 3 equipos coincidentes.
   - LK Series: 1 equipo coincidente.
   - AI NVR: 2 equipos coincidentes (sin falsos positivos con Light AI).
   - Total: 13 / 13 (100% exactitud).
2. **Snapshot de Visibilidad (`public/data/sections.json`)**:
   ```json
   {
     "success": true,
     "secciones": {
       "CAMARA": true,
       "NVR": true,
       "SWITCH": true,
       "ACCESORIO": false,
       "WIKI": true,
       "COMPARADOR": true,
       "COTIZADOR": true,
       "HERRAMIENTAS": true,
       "HERRAMIENTAS_UPS": false,
       "HERRAMIENTAS_ALMACENAMIENTO": false
     }
   }
   ```
3. **Compilaciones**:
   - `npm run build`: Exited 0.
   - `npm run build:public`: Exited 0.
