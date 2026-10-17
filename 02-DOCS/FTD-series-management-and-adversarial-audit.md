# Feature Technical Document (FTD): Gestión de Series Comerciales y Auditoría Adversarial

## 1. Intent (Intención)
Permitir la asignación manual y categorización flexible de Series comerciales para los productos del catálogo (Cámaras, NVRs, Switches, Accesorios), evitando clasificaciones automáticas erróneas desde datasheets PDF y facilitando la rápida identificación y filtrado de productos sin serie comercial asignada en el panel de control.

## 2. Scope (Alcance)
- **Extracción PDF (`pdf-extractor.ts`)**: Desactivar asignación automática de series; fijar valor inicial vacío `serie = ''`.
- **Formulario de Producto (`ProductEditForm.tsx`)**: Reemplazar campo libre por `<select>` desplegable contextual según `tipo_dispositivo`, con opción `-- Sin Serie Asignada --` opcional, alerta reactiva ámbar si está pendiente, y reseteo automático al mutar el tipo de dispositivo.
- **Catálogo Panel (`AdminCatalogModule.tsx`)**:
  - Resaltado con borde lateral ámbar (`border-l-4 border-l-amber-500`) y fondo diferenciado en filas sin serie (`isSinSerie`).
  - Badge de advertencia `⚠️ Sin Serie` en la columna Serie.
  - Filtro desplegable con opción reactiva `⚠️ Solo Sin Serie (X pendientes)` y auto-reset para evitar bloqueo de interfaz.
- **Web Pública y Componentes Compartidos (`ProductCard`, `ProductDetailModal`, `ProductTable`, `CompareModal`, `QuotationModal`)**:
  - Erradicación del texto residual "General Series" en vistas públicas.
  - Supresión de píldoras vacías o separadores huérfanos cuando un producto no posee serie comercial.
- **Base de Datos y Backend (`db/index.ts`, `routes.ts`)**:
  - Blindaje contra valores `undefined` en `node:sqlite`.
  - Preservación de series manuales y datos existentes durante reprocesamiento de datasheets en `/api/reprocess-all`.

## 3. Checklist de Verificación y Pruebas
- [x] Ingesta PDF no asigna series automáticamente (`serie = ''`).
- [x] Selector contextual en formulario con series oficiales (`AK Series`, `SK Series`, `LK Series`, `WIFI / 4G Solar`, `PTZ` para cámaras; `AK Series`, `SK Series`, `LK Series` para NVRs).
- [x] Alerta ámbar en renglón y badge `⚠️ Sin Serie` en tabla de Catálogo & Modelos.
- [x] Filtro `⚠️ Solo Sin Serie` con conteo dinámico de pendientes.
- [x] Reseteo automático del filtro cuando los pendientes llegan a 0.
- [x] Corrección de crash en `AdminBatchModule.tsx` por serie nula.
- [x] Corrección de vinculación en SQLite para evitar excepciones en `DatabaseSync`.
- [x] Erradicación de "General Series" y badges vacíos en la web pública.
- [x] Preservación de series asignadas en `/api/reprocess-all`.
- [x] Auditoría Adversarial formal ejecutada y APROBADA con distinción.
- [x] Compilación de producción `npm run build` exitosa con código 0.

## 4. Evidence (Evidencia)
- Compilación `tsc -p tsconfig.json --noEmit && vite build && tsc -p tsconfig.server.json` exitosa (0 errores).
- Dictamen de auditoría adversarial: `APROBADO CON DISTINCIÓN` tras subsanar los 10 puntos críticos detectados.

## 5. Next Step (Próximo Paso)
El administrador puede acceder al panel, filtrar por `⚠️ Solo Sin Serie` y clasificar en pocos clics las cámaras y NVRs pendientes en sus series comerciales oficiales.
