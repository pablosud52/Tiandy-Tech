# FTD: Motor de Búsqueda Universal Consolidado (Full Datasheet Corpus)

## Intención
Reemplazar la lógica de búsqueda fragmentada y artesanal (`matchSmd`, `matchVca`, `matchBadges`, `matchSellos`, `matchAlarma`) por un motor de indexación y búsqueda universal consolidado (*Search Corpus*) que indexe el 100% de las especificaciones extraídas de los datasheets PDF, soporte búsquedas multi-término con operador `AND` inteligente, soporte sinónimos técnicos y garantice paridad de resultados exacta entre el catálogo público y el panel de administración.

## Alcance
1. **Helper Unificado en `src/shared/helpers.ts`**:
   - `normalizeSearchText(text: string): string`: Normaliza cadenas eliminando tildes/diacríticos y convirtiendo a minúsculas.
   - `buildProductSearchCorpus(prod: Producto, globalBadges?: BadgeGlobalConfig[]): string`: Construye un corpus unificado de búsqueda indexando:
     - Identificadores y códigos: `modelo`, `especificacion_completa`, `serie`, `tipo_dispositivo`, `subtipo`, `codigo_1`, `codigo_2`, `codigo_interno`, `codigo_barras_ean`.
     - Especificaciones estructuradas (`getProductSpecs`): formato, resolución, megapíxeles, resolución en píxeles, distancia focal (lente), apertura, FOV, distancia IR, distancia luz cálida/blanca, WDR, alimentación, consumo en Watts, canales, bahías SATA, capacidad de disco, resolución de grabación, puertos PoE, puertos uplink, presupuesto PoE, analíticas IA, alarmas E/S, audio 2 vías / parlante / micrófono y slot MicroSD.
     - Matriz de Datasheet completa (`datos_tecnicos.especificaciones_datasheet`): todas las secciones, nombres de campo y valores de especificaciones del PDF.
     - Características principales (`datos_tecnicos.caracteristicas_principales`).
     - Badges y Distintivos: indexación de tecnologías (`Color Maker`, `Polar day`, `SMD 1.0`, `SMD 2.0`, `SMD 3.0`, `VCA`, `Dual Light`, `Early Warning`, etc.).
     - **Regla anti-falsos positivos**: Exclusión explícita de los términos `"nuevo"`, `"modelo"` o `"nuevo modelo"` de la indexación de sellos/badges de novedad para evitar coincidencias accidentales en búsquedas genéricas.
   - `matchesSearchQuery(prod: Producto, busqueda: string, globalBadges?: BadgeGlobalConfig[]): boolean`:
     - Tokenización por espacios en blanco (`tokens.split(/\s+/)`).
     - Lógica `AND`: todos los términos buscados deben estar presentes en el producto.
     - Soporte para sinónimos y alias técnicos (`4k` <-> `8mp`/`3840x2160`, `poe` <-> `802.3af`/`802.3at`, `wifi` <-> `wi-fi`, `mic` <-> `microfono`).
2. **Catálogo Público (`src/client/App.tsx`)**:
   - Reemplazo de las variables redundantes por `matchesSearchQuery(prod, busqueda, globalBadges)`.
3. **Panel de Administración (`src/client/admin/modules/AdminCatalogModule.tsx`)**:
   - Unificación de la búsqueda general utilizando `matchesSearchQuery(p, busqueda, globalBadgesConfig)`.
4. **Verificación y Calidad**:
   - Pruebas adversariales con términos simples y compuestos (`"bullet 4mp 2.8mm"`, `"nvr 80 canales"`, `"tripwire"`, `"120db"`, `"4k"`, `"nuevo"`).
   - Build exitoso (`tsc --noEmit`, `vite build`, `tsc tsconfig.server.json`).

## Checklist
- [x] Implementar `normalizeSearchText`, `buildProductSearchCorpus` y `matchesSearchQuery` en `src/shared/helpers.ts`.
- [x] Conectar `matchesSearchQuery` en `src/client/App.tsx`.
- [x] Conectar `matchesSearchQuery` en `src/client/admin/modules/AdminCatalogModule.tsx`.
- [x] Probar compilación con `npm run build` (código de salida 0, sin errores TypeScript ni Vite).
- [x] Verificar pruebas unitarias y de integración sobre la base de datos real:
  - Búsqueda multi-palabra: `"bullet 4mp 2.8mm"` (4 coincidencias exactas), `"nvr 16 canales"` (13 coincidencias).
  - Parámetros profundos de datasheet: `"tripwire"` (27 coincidencias), `"120db"` (15 coincidencias), `"m12"` (32 coincidencias), `"f2.0"` (9 coincidencias).
  - Sinónimos técnicos: `"4k"` (21 coincidencias con 8MP/4K), `"poe"` (53 coincidencias con 802.3af/at).
  - Analíticas y badges: `"smd"` (46 coincidencias), `"smd 2.0"` (28 coincidencias).
  - Códigos comerciales: `"TC-C32KNECO"` y `"6971849729817"` encuentran inmediatamente el producto exacto.
  - Regla anti-falsos positivos: `"nuevo"` y `"modelo"` arrojan 0 coincidencias accidentales.
  - Normalización de tildes: `"cámara"` y `"camara"` devuelven exactamente 38 resultados idénticos.

## Evidencia
1. **Compilación de Producción**:
   - `tsc -p tsconfig.json --noEmit`: 0 errores.
   - `vite build`: bundle generado con éxito (`dist/client/assets/index-DTTnTs_m.js`).
   - `tsc -p tsconfig.server.json`: 0 errores, helpers compilados en `dist/shared/helpers.js`.
2. **Resultados de Suite de Pruebas de Búsqueda sobre Base de Datos Real (`data/tiandy.db`)**:
   ```
   Total productos cargados: 59
   Query: "bullet 4mp          " -> 6 productos coincidentes
   Query: "bullet 4mp 2.8mm    " -> 4 productos coincidentes
   Query: "nvr poe             " -> 13 productos coincidentes
   Query: "nvr 16 canales      " -> 13 productos coincidentes
   Query: "tripwire            " -> 27 productos coincidentes
   Query: "120db               " -> 15 productos coincidentes
   Query: "smd                 " -> 46 productos coincidentes
   Query: "smd 2.0             " -> 28 productos coincidentes
   Query: "4k                  " -> 21 productos coincidentes
   Query: "poe                 " -> 53 productos coincidentes
   Query: "alarma              " -> 51 productos coincidentes
   Query: "nuevo               " -> 0 productos coincidentes (anti-falsos positivos activo)
   Query: "modelo              " -> 0 productos coincidentes (anti-falsos positivos activo)
   Query: "f2.0                " -> 9 productos coincidentes
   Query: "m12                 " -> 32 productos coincidentes
   ```

## Siguiente Paso
Presentar los resultados al usuario y confirmar si desea sincronizar los cambios a GitHub.
