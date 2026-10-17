# FTD — Unificación de Datos, Etiquetas, Filtros NVR/E/S y Matriz Datasheet

## 1. Intención
Unificar y conectar de forma bidireccional la extracción de PDFs con la ficha técnica y la base de datos, corregir inconsistencias visuales en badges y precios, independizar los filtros de NVRs (Puertos PoE) y agregar Interfaces E/S (Alarmas y Audio), resolver la persistencia del campo alimentación e incorporar una 4ª pestaña de edición para la matriz técnica completa del datasheet.

---

## 2. Alcance (Scope)
1. **Deduplicación & Sincronización de Etiquetas (Pestaña 3 <-> PDF):**
   - Extractor activa automáticamente sellos gráficos detectados.
   - Tabla pública deduplica chips de la columna *Analítica & Etiquetas* (máximo 1 ocurrencia por etiqueta).
2. **Estilo visual uniforme para etiquetas sin imagen:**
   - Fondo pizarra oscuro (`bg-slate-800`), borde sutil y tipografía blanca negrita (`text-white font-extrabold uppercase`) para todos los distintivos (incluyendo Early Warning, sin excepciones de color rojo).
3. **Disponibilidad de stock:**
   - Aumento del 50% de tamaño aplicado exclusivamente en la tarjeta Ficha (`ProductCard.tsx`). Tabla mantiene su tamaño actual.
4. **Cabecera de Ficha:**
   - Insignia de Serie reubicada al centro de la fila superior con `mt-1.5`.
   - Precio destacado a la derecha con `U$S` estándar y dígitos numéricos grandes (`text-2xl sm:text-3xl font-black font-mono`).
5. **Búsqueda optimizada:**
   - Indexar analíticas (`SMD`, `VCA`) y distintivos activos en `App.tsx`.
   - Excluir del matching de etiquetas las palabras genéricas `"NUEVO"`, `"MODELO"` y `"NUEVO MODELO"`.
   - Respetar los subtítulos existentes sin alteración.
6. **NVRs y Puertos PoE:**
   - Filtro independiente de Bahías HDD en `FilterSidebar.tsx` con opciones `4 Puertos PoE` y `8 Puertos PoE`.
   - Sincronización bidireccional entre `nvr.puertos_poe_integrados` y `nvr.canales_poe` en `ProductEditForm.tsx`, `helpers.ts` y extractor.
7. **Filtro Interfaces E/S (Cámaras y NVRs):**
   - Extracción de Alarm I/O y Audio I/O en `pdf-extractor.ts`.
   - Filtros en `FilterSidebar.tsx` y `App.tsx`: *Entrada Alarma*, *Salida Alarma*, *Salida Audio*.
8. **Persistencia de Alimentación:**
   - Fallback de lectura en `ProductEditForm.tsx` hacia `caracteristicas_principales.alimentacion`.
   - Asignación normalizada en `pdf-extractor.ts` a `camara.alimentacion` y `camara.alimentacion_tipo`.
9. **Matriz Datasheet (Opción C):**
   - Normalización de sinónimos en backend `pdf-extractor.ts`.
   - Pestaña 4 en `ProductEditForm.tsx`: "Matriz Datasheet" con acordeones colapsables por categoría técnica para ver y editar cualquier campo del PDF.

---

## 3. Checklist de Implementación
- [x] **Paso 1:** Extractor de PDFs: normalización de sinónimos, Alarm/Audio I/O, NVR PoE regex y sincronización de `camara.alimentacion` y `sellos_graficos`.
- [x] **Paso 2:** `src/shared/helpers.ts` y `src/shared/types.ts`: soporte para `canales_poe`, `entrada_alarma`, `salida_alarma` y `audio_io`.
- [x] **Paso 3:** `ProductEditForm.tsx`:
  - [x] Fallback y sincronización de campo Alimentación (Cámaras y NVRs).
  - [x] Sincronización de `puertos_poe_integrados` y `canales_poe` en NVRs (`||` operator).
  - [x] Toggles de E/S de Alarma para Cámaras y NVRs.
  - [x] Pestaña 4 "Matriz Datasheet" con acordeón editable de `especificaciones_datasheet`.
- [x] **Paso 4:** `Badges.tsx`: uniformar pastillas de `BadgeOverlay` a fondo oscuro `bg-slate-800` y texto blanco (todos iguales, sin rojo).
- [x] **Paso 5:** `ProductCard.tsx`:
  - [x] Aumento de 50% de tamaño en disponibilidad de stock.
  - [x] Insignia de Serie al centro (`mt-1.5`).
  - [x] Precio a la derecha con `U$S` estándar y dígitos numéricos grandes en negrita (formateo condicional seguro sin "U$S Consultar").
  - [x] Chips técnicos con estilo uniforme.
- [x] **Paso 6:** `ProductTable.tsx`:
  - [x] Deduplicación estricta de chips en columna *Analítica & Etiquetas*.
  - [x] Estilo uniforme de chips con fondo oscuro y texto blanco.
- [x] **Paso 7:** `FilterSidebar.tsx` & `App.tsx`:
  - [x] Filtro independiente "Puertos PoE" para NVRs con `4 Puertos PoE` y `8 Puertos PoE`.
  - [x] Filtro "Interfaces E/S" (*Entrada Alarma*, *Salida Alarma*, *Salida Audio*).
  - [x] Búsqueda indexando analíticas (`SMD`, `VCA`), excluyendo `"NUEVO"` y `"MODELO"`.
- [x] **Paso 8:** Compilación TypeScript + Vite y verificación adversarial con código de salida 0.

---

## 4. Evidencia
- **Compilación TypeScript & Vite:** `npm run build` completado exitosamente con código `0` (`tsc -p tsconfig.json --noEmit && vite build && tsc -p tsconfig.server.json`).
- **Auditoría Adversarial:** Se identificaron y corrigieron 4 puntos de borde: renderizado de precios con valor 0 o nulo, colapso de puertos PoE con operador `||`, soporte de fallbacks de interfaces para productos antiguos y sincronización completa en NVRs dentro de `ProductEditForm.tsx`.
