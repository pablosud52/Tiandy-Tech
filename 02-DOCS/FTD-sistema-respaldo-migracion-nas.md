# FTD: Sistema Integral de Respaldo y Migración NAS (Exportar / Importar ZIP)

## Intención
Implementar un sistema nativo, seguro y de un solo clic para exportar e importar la totalidad de los datos del proyecto (base de datos SQLite íntegra, PDFs de datasheets, imágenes de productos, distintivos/sellos y configuraciones de visibilidad y usuarios) en un archivo `.zip` comprimido y auto-contenido, permitiendo migrar o restaurar la plataforma en un nuevo contenedor NAS sin pérdidas ni intervenciones manuales en el sistema de archivos.

## Alcance
1. **Eliminación y Reemplazo de "Exportar JSON"**:
   - En el Hero Banner de `AdminDashboardModule.tsx`, remover el botón redundante "Exportar JSON".
   - En su lugar, colocar un botón de acceso directo "Respaldos (.ZIP)" que navega al módulo de Respaldos.
2. **Nuevo Módulo Administrativo: "Respaldos y Migración" (`AdminBackupModule.tsx`)**:
   - Acceso dedicado en el panel lateral (`AdminPage.tsx`) con ID `backup` e icono de base de datos/archivo.
   - Vista detallada del estado del almacenamiento (peso y conteo de SQLite, PDFs en `docs/`, imágenes en `images/`, distintivos en `badges/` y total en MB).
   - Botón interactivo "Descargar Respaldo Completo (.ZIP)" con información en tiempo real.
   - Zona Drag & Drop / selector de archivos para "Restaurar Respaldo (.ZIP)" con confirmación de seguridad y barra de progreso.
3. **Servicio Backend de Respaldo (`src/server/services/backup-service.ts`)**:
   - `createBackupZip()`:
     - Ejecuta `PRAGMA wal_checkpoint(TRUNCATE)` para consolidar SQLite en `data/tiandy.db`.
     - Empaqueta `tiandy.db`, `docs/`, `images/`, `img/`, `badges/` y genera un `manifest.json` con metadatos y sumas de verificación.
   - `restoreBackupZip(buffer)`:
     - Realiza una copia de seguridad preventiva (`data/.safety-backup`).
     - Valida la integridad del archivo `.zip` y la presencia de la base de datos `tiandy.db`.
     - Cierra temporalmente la conexión SQLite mediante `closeDatabase()`.
     - Extrae y reemplaza de forma atómica los archivos en `data/`.
     - Reabre la base de datos con `reopenDatabase()`.
     - Notifica la actualización en tiempo real a todas las pestañas vía `BroadcastChannel`.
4. **Endpoints de API (`src/server/api/routes.ts`)**:
   - `GET /api/admin/backup/status`: métricas de almacenamiento y conteo de archivos.
   - `GET /api/admin/backup/export`: descarga del archivo `tiandy-respaldo-completo-YYYY-MM-DD.zip`.
   - `POST /api/admin/backup/restore`: carga de archivo zip vía `multer` y restauración completa con reporte.
5. **Verificación y Despliegue**:
   - Pruebas unitarias de empaquetado y descompresión.
   - Compilación exitosa con `npm run build` y `npm run build:public`.
   - Sincronización y commit a GitHub.

## Checklist
- [ ] Implementar `checkpointDatabase`, `closeDatabase`, `reopenDatabase` en `src/server/db/index.ts`.
- [ ] Implementar `src/server/services/backup-service.ts` con `adm-zip`.
- [ ] Conectar endpoints `/api/admin/backup/status`, `/api/admin/backup/export` y `/api/admin/backup/restore` en `src/server/api/routes.ts`.
- [ ] Crear componente `src/client/admin/modules/AdminBackupModule.tsx`.
- [ ] Integrar módulo `backup` en `src/client/admin/AdminPage.tsx`.
- [ ] Remover "Exportar JSON" y colocar botón "Respaldos (.ZIP)" en `src/client/admin/modules/AdminDashboardModule.tsx`.
- [ ] Probar flujo completo de exportación e importación con archivo zip real.
- [ ] Compilar con `npm run build` (0 errores).
- [ ] Sincronizar cambios a GitHub (`git push origin master`).

## Evidencia
*(Pendiente tras la ejecución)*

## Siguiente Paso
Proceder con la implementación de helpers en base de datos y el servicio de respaldo.
