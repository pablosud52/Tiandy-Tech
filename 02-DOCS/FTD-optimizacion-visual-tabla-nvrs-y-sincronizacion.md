# FTD — Optimización Visual de Tabla, Ficha NVR, Saneamiento y Sincronización en Tiempo Real

## 1. Intención
Implementar las 8 modificaciones aprobadas por el usuario: saneamiento técnico de NVRs (purga de datos residuales de cámara en TC-R3880 y adición de capacidad por disco en formulario), sincronización en tiempo real entre panel y web pública sin requerir Ctrl+F5, eliminación de redundancias de canales en ficha NVR, precios protagónicos con texto "Consultar" en gris y sin IVA, botones de acción con texto apilados en tabla, ampliación de la caja de tabla con fotos más grandes y columnas compactas, tablas especializadas según tipo de equipo (Cámaras vs NVRs), y actualización del pie de página con las leyendas legales requeridas.

---

## 2. Alcance (Scope)
1. **Saneamiento NVR & Formulario Técnico:**
   - Limpieza en base de datos de `TC-R3880` (remover bloque `camara` residual; configurar 8 SATA hasta 24TB, 2x HDMI 4K, 2x VGA, 16 In / 4 Out Alarma, 400 Mbps).
   - En `ProductEditForm.tsx`: agregar input *"Capacidad Máx por Disco (TB)"* y saneamiento automático al guardar (borrado de bloques de otros dispositivos).
   - En `helpers.ts`: aislar estrictamente `getProductSpecs` para que NVRs nunca lean propiedades de cámaras.
2. **Sincronización en Tiempo Real (Anti Ctrl+F5):**
   - En `App.tsx`: refresco automático de productos, secciones y etiquetas globales al pasar a `activeView === 'catalog'`.
   - Canal `BroadcastChannel('tiandy_sync')` para actualizar instantáneamente todas las pestañas abiertas al guardar en el panel de control.
3. **Ficha NVR (Redundancia de Canales eliminada):**
   - En `ProductCard.tsx`: para NVRs, `formatoLabel` renderiza `NVR` o `GRABADOR NVR`.
   - Canales renderizados una sola vez sin el chip verde duplicado.
4. **Precios y Textos en Catálogo:**
   - Texto `Consultar` en gris neutro (`text-slate-400 dark:text-slate-500 font-semibold`) en Ficha, Tabla y Modal.
   - Eliminación del texto `Neto oficial s/IVA` en Ficha, Tabla y Modal de detalle.
   - Incremento del tamaño de números de precio en Ficha y Tabla.
5. **Botones de Acción en Tabla:**
   - Botones apilados verticalmente con texto descriptivo: `[⇄ Comparar]` y `[🧮 + Cotizar]`, idénticos al estilo de la Ficha.
6. **Optimización de Espacios y Dimensiones de Tabla:**
   - `max-h` de tabla ampliado a `880px` (~2 filas adicionales visibles).
   - Recuadro de foto ampliado (`w-[116px] h-[116px]`) reduciendo el padding vertical de celda a la mitad (`py-2`).
   - Reducción de espacios muertos entre Modelo, Formato y Resolución.
7. **Estructura de Columnas Especializada (Cámaras vs NVRs):**
   - Solapa Cámaras: `FOTO | MODELO, SERIE & RED | FORMATO TIPO | RESOLUCIÓN | ÓPTICA & SENSOR | TECNOLOGÍAS | AUDIO & E/S | DISPONIBILIDAD | PRECIO | ACCIONES`.
   - Solapa NVRs (sin Formato Tipo): `FOTO | MODELO | RESOLUCIÓN / CANALES | CAPACIDAD | SALIDA VIDEO | TECNOLOGÍAS | AUDIO & E/S | DISPONIBILIDAD | PRECIO | ACCIONES`.
   - Columna Salida Video sin prefijo "Salidas:" y con cantidades de cada salida.
   - Columna Audio & E/S con cantidad de entradas/salidas de alarma y audio (o vacío si no tiene).
8. **Pie de Página:**
   - Actualización de textos oficiales con las 3 leyendas solicitadas.

---

## 3. Checklist de Implementación
- [x] **Paso 1:** Saneamiento de `TC-R3880` en `data/tiandy.db` y blindaje en `src/shared/helpers.ts`.
- [x] **Paso 2:** `ProductEditForm.tsx`: agregar campo *Capacidad Máx por Disco (TB)* y limpieza automática de bloques ajenos al tipo de dispositivo.
- [x] **Paso 3:** Sincronización en tiempo real en `App.tsx` y módulos de administración (`BroadcastChannel('tiandy_sync')` y revalidación en cambio de vista).
- [x] **Paso 4:** `ProductCard.tsx`: corrección de chip de canales NVR, precio más grande, Consultar en gris y eliminación de "Neto oficial s/IVA".
- [x] **Paso 5:** `ProductDetailModal.tsx`: Consultar en gris y eliminación de "Neto oficial s/IVA".
- [x] **Paso 6:** `ProductTable.tsx`:
  - [x] Altura de contenedor ampliada (`max-h-[880px]`).
  - [x] Contenedor de foto ampliado con padding vertical reducido (`py-2`).
  - [x] Compactación de espacios entre columnas.
  - [x] Columnas especializadas dinámicas para Cámaras vs NVRs.
  - [x] Formateo de Salida Video (sin "Salidas:" y con cantidades) y Audio & E/S (cantidades o vacío).
  - [x] Botones de acción apilados con texto.
  - [x] Precios más grandes, Consultar en gris y sin "Neto oficial s/IVA".
- [x] **Paso 7:** `App.tsx`: pasar `activeTab` a `ProductTable` y actualizar textos del Footer.
- [x] **Paso 8:** Compilación TypeScript + Vite (`npm run build`) y verificación integral con código de salida 0.

---

## 4. Evidencia
- **Compilación de Producción:** `npm run build` ejecutado exitosamente con código `0` (`tsc -p tsconfig.json --noEmit && vite build && tsc -p tsconfig.server.json`).
- **Saneamiento de Base de Datos:** Base de datos SQLite depurada: `TC-R3880` limpiado de propiedades residuales de cámara, capacidad corregida a 8 SATA hasta 24TB, salidas de video normalizadas a `2x HDMI (4K), 2x VGA`, 16 In / 4 Out Alarma, y 400 Mbps.
- **Sincronización:** Implementado `BroadcastChannel('tiandy_sync')` e invalidación automática en cambio de vista de `App.tsx` para refresco instantáneo sin Ctrl+F5.
