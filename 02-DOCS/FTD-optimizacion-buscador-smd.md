# FTD: Optimización del Motor de Búsqueda y Resolución de Clasificación SMD

## 1. Intent (Intención)
Corregir el motor de búsqueda universal de catálogo (`matchesSearchQuery` y `buildProductSearchCorpus`) para que reconozca con precisión los modelos con tecnología SMD (Smart Motion Detection 1.0, 2.0 y 3.0), eliminando falsos positivos producidos por colisiones con aperturas de diafragma (F1.0 / F2.0) y fuga de claves con valores nulos, preservando la búsqueda abierta de todas las especificaciones y características de hardware.

## 2. Scope (Alcance)
- `src/shared/helpers.ts`:
  - **Limpieza de claves nulas:** En `buildProductSearchCorpus`, no indexar nombres de claves (`k`) cuando su valor asociado `v` sea `null`, `undefined`, `''` o `false` (ej: `{ smd: null }`).
  - **Identificación atómica de SMD:** Inyectar tokens contextualizados (`__smd_v1__`, `__smd_v2__`, `__smd_v3__`, y el genérico `smd`) exclusivamente en cámaras que efectivamente dispongan de dicha versión activa.
  - **Tokenización compuesta de consulta:** En `matchesSearchQuery`, detectar frases compuestas (`SMD 1.0`, `SMD 2.0`, `SMD 1`, `SMD 2`, etc.) como entidades unificadas antes de dividir por espacios, previniendo que números como "1.0" o "2.0" colisionen con valores ópticos (`F1.0`, `F2.0`), voltajes o ángulos.
  - **Búsqueda genérica `SMD`:** Permitir que escribir `SMD` liste todas las cámaras que cuentan con analítica SMD (1.0, 2.0 o 3.0).
- Preservar la búsqueda completa en tiempo real de cualquier característica, código, chip o campo técnico existente en la base de datos y matriz datasheet PDF.

## 3. Checklist de Implementación
- [x] Documentar FTD y validar alcance.
- [x] Modificar `buildProductSearchCorpus` en `src/shared/helpers.ts` para sanitizar claves nulas y enriquecer tokens atómicos de SMD.
- [x] Modificar `matchesSearchQuery` y `matchSingleToken` en `src/shared/helpers.ts` para tokenizar entidades compuestas y soportar búsqueda de `smd`.
- [x] Ejecutar suite de pruebas unitarias sobre los 59 productos del catálogo verificando:
  - Búsqueda "SMD" -> devuelve exactamente las cámaras con SMD (19 modelos, sin incluir modelos básicos).
  - Búsqueda "SMD 1.0" -> devuelve exclusivamente cámaras con SMD 1.0 (9 modelos, sin incluir SMD 2.0 con lente F1.0).
  - Búsqueda "SMD 2.0" -> devuelve exclusivamente cámaras con SMD 2.0 (10 modelos, sin incluir cámaras básicas con lente F2.0).
  - Intersección entre SMD 1.0 y SMD 2.0 -> exactamente 0 cámaras (cero colisiones).
  - Búsquedas por características generales (ej: "4k", "turret", "2.8mm", "poe", "cruce de linea") operando al 100%.
- [x] Comprobar compilación TypeScript y Vite (`npm run build` con código 0).

## 4. Evidence (Evidencia)
- Compilación de producción exitosa: `npm run build` completado con código 0 (bundle Vite cliente y TypeScript server).
- Resultados verificados sobre los 59 productos del catálogo en `dist/shared/helpers.js`:
  - **"SMD"**: 19 cámaras (todas las que tienen Smart Motion Detection activo o en datasheet).
  - **"SMD 1.0"**: 9 cámaras (`TC-C32QN 2ENA-28`, `TC-C32QV 2FNA-28`, `TC-C32XN 2ENA-28`, `TC-C345N 2ANA-28`, `TC-C34QN 2ENA-28`, `TC-C34XN 2ENA-28`, `TC-C36QN 2ENA-28`, `TC-C38RN 2ANA-28`, `TC-H343K 9DA-4`).
  - **"SMD 2.0"**: 10 cámaras (`TC-C32WN 3ERA-28`, `TC-C32XN 3ERA-28`, `TC-C32XS I3W/E/Y/S/2.8mm/V5.0`, `TC-C34UV 3FRB-4`, `TC-C34UV W/E/Y/M/S/4mm`, `TC-C35US 3LRA-28`, `TC-C35WP 3FRA-28`, `TC-C35WQ I5W/E/Y/4mm/V4.2`, `TC-C35WS 3ERA-28`, `TC-C382V W/E/Y/S/H/2.8mm`).
  - **Intersección SMD 1.0 / SMD 2.0**: 0 modelos en común (eliminada la fuga de lentes F1.0 / F2.0).
  - **"cruce de linea"**: 18 cámaras con Tripwire.
  - **"4k"**: 4 cámaras con resolución 4K UHD.
  - **"turret"**: 6 cámaras con formato Turret.
  - **"poe"**: 32 dispositivos con soporte PoE.

## 5. Next Step
Informar al usuario de la finalización de la implementación con evidencia de las pruebas.
