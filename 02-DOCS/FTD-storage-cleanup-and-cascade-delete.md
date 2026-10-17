---
author: Pablo
branch: master
status: done
---
# Gestión de Almacenamiento, Limpieza de Huérfanos y Borrado en Cascada

## Intent
1. **Eliminar archivos huérfanos acumulados**:
   - Detectar y purgar de forma segura los 25 PDFs de productos discontinuados en `data/docs` (48.59 MB).
   - Detectar y purgar las 16 imágenes reemplazadas u obsoletas en `data/images` (0.28 MB).
   - Eliminar el archivo residual en `data/uploads` (2.74 MB).
2. **Borrado en Cascada Inteligente**:
   - Al eliminar un producto desde el catálogo (`DELETE /api/productos/:id`), comprobar si su datasheet PDF o su imagen principal están compartidos con otro modelo.
   - Si no están compartidos, eliminar automáticamente los archivos físicos del disco (`data/docs/` y `data/images/`), evitando que queden huérfanos.
3. **Reemplazo Limpio de Imágenes**:
   - Al actualizar una ficha técnica con una nueva imagen, eliminar la versión anterior del disco para evitar acumulación de duplicados temporales.
4. **Herramienta de Auditoría y Limpieza en el Backoffice**:
   - Endpoints `/api/storage/status` y `/api/storage/clean`.
   - Panel de control en `AdminDashboardModule` con métricas en tiempo real de espacio ocupado, archivos huérfanos y botón de purga con confirmación.
   - Botón de acceso rápido en `AdminCatalogModule` para limpiar huérfanos directamente durante la gestión del catálogo.

## Scope
- Servicio de Almacenamiento:
  - `src/server/services/storage-cleaner.ts` (auditoría `getStorageAudit`, limpieza `cleanOrphanedFiles`, eliminación en cascada `cleanupProductFilesOnDelete` y reemplazo de imagen `cleanupReplacedImage`).
- API Backend:
  - `src/server/api/routes.ts` (integración en `DELETE /api/productos/:id`, `POST /api/productos`, y nuevas rutas `/api/storage/status` y `/api/storage/clean`).
- Frontend Backoffice:
  - `src/client/admin/modules/AdminDashboardModule.tsx` (sección visual de métricas de almacenamiento y botón de limpieza con toast).
  - `src/client/admin/modules/AdminCatalogModule.tsx` (botón dinámico para purga rápida de huérfanos en la cabecera del catálogo).

## Checklist
- [x] Documento FTD registrado.
- [x] Servicio `storage-cleaner.ts` creado con tipado robusto y auditoría precisa.
- [x] Endpoints `/api/storage/status` y `/api/storage/clean` integrados en el router de Express.
- [x] Borrado en cascada condicional en `DELETE /api/productos/:id`.
- [x] Purga de imagen previa al actualizar en `POST /api/productos`.
- [x] Panel de mantenimiento de almacenamiento integrado en `AdminDashboardModule.tsx`.
- [x] Botón rápido de limpieza integrado en `AdminCatalogModule.tsx`.
- [x] Ejecución de limpieza inicial: 42 archivos huérfanos eliminados y 51.61 MB liberados.
- [x] Verificación de compilación TypeScript (`tsc --noEmit`) y build de producción exitoso.
- [x] Servicio local reiniciado y validado en `http://localhost:8090/`.

## Evidence
- `storage-cleaner.ts`: Compara los nombres base de `datasheet_pdf`, `imagen_principal` y `galeria` de SQLite contra los archivos del sistema operativo, respetando archivos `.gitkeep`.
- Ejecución de prueba:
  - Antes: 25 PDFs huérfanos (48.59 MB), 16 imágenes huérfanas (0.28 MB), 1 upload (2.74 MB). Total: 42 huérfanos (51.61 MB).
  - Después: 0 huérfanos restantes, 61 PDFs activos en `data/docs` (uno por producto de la base de datos) y 4 imágenes activas en `data/images`.
- Validación de API: `GET /api/storage/status` devuelve `success: true` con `totalOrphanedCount: 0`.
