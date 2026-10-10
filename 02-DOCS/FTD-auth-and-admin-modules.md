# FTD: Control de Acceso y Modularización del Backoffice Administrador

## 1. Intención (Intent)
Proteger el panel de administración backoffice mediante un sistema robusto de autenticación con control de usuarios administradores (Scrypt + tokens de sesión), y reestructurar todas las opciones operativas en módulos independientes, limpios y visuales para una experiencia ágil y amigable.

---

## 2. Alcance (Scope)
- **Autenticación y Seguridad:**
  - Esquema SQLite para `usuarios_admin` y `sesiones_admin`.
  - Hashing seguro con Scrypt y comparación con `crypto.timingSafeEqual`.
  - Endpoints REST `/api/auth/login`, `/api/auth/me`, `/api/auth/logout`, `/api/auth/users`.
  - Componente `AdminLogin.tsx` con soporte de credenciales iniciales (`admin` / `admin`).
- **Arquitectura Modular del Backoffice:**
  - `AdminPage.tsx`: Contenedor principal con barra lateral responsiva, breadcrumb y estado de usuario.
  - `AdminDashboardModule.tsx`: Resumen ejecutivo, estado de stock, métricas por dispositivo y exportación JSON.
  - `AdminCatalogModule.tsx`: Catálogo completo con buscador, filtros por tipo/serie, toggle de visibilidad pública, modal de edición y eliminación.
  - `AdminBatchModule.tsx`: Editor masivo rápido en lote con contador de pendientes y guardado directo.
  - `AdminExtractorModule.tsx`: Ingesta Drag & Drop de PDFs con extracción inteligente y preview técnico.
  - `AdminBadgesModule.tsx`: Clasificación visual de diferenciales Tiandy (ColorMaker, Polar Day, Early Warning, etc.).
  - `AdminUsersModule.tsx`: Creación de operadores, roles (`SUPERADMIN`, `ADMIN`) y cambio de contraseñas.

- **Módulo de Cotización y Catálogo Público:**
  - Carrito interactivo de cotización (`QuotationModal.tsx`) con cantidades, precio unitario y subtotales en `U$S`.
  - Botón tipo pastilla para ordenar catálogo (`Defecto`, `Precio: Menor`, `Precio: Mayor`, `Modelo A-Z`).
  - Filtros limpios: removida categoría disponibilidad, eliminado "Eyeball", título simplificado a "FORMATO".
  - Moneda global unificada a `U$S` con 2 decimales en toda la web y backoffice.
- **Mejoras Backoffice y Extractor PDF:**
  - Pestañas independientes por categoría (`Todas`, `Cámaras IP`, `Grabadores NVR`, `Switches PoE`) en Catálogo y Editor Rápido.
  - Tablas contenidas con scrollbar interna y encabezados pegajosos (`sticky thead`).
  - Visualización de modelo base y variante debajo sin el texto "Spec".
  - Icono de visibilidad activo en color azul.
  - Detección de duplicados en creación manual y extracción PDF (`GET /api/productos/check-model`).
  - Extractor PDF con formulario estructurado `ProductEditForm` en lugar de JSON, con subida de imagen local (`POST /api/upload-image`).
  - Motor SQLite migrado a `node:sqlite` nativo sin compilaciones externas de bindings.

---

## 3. Checklist de Verificación
- [x] Corrección del error de parseo en `App.tsx`.
- [x] Migración y tablas SQLite creadas con seed de `admin` / `admin`.
- [x] Guardián de autenticación en frontend (`AdminLogin` para no autenticados, `AdminPage` para sesiones válidas).
- [x] Los 6 módulos del panel implementados y operativos.
- [x] Modal de Cotización interactivo montado en Navbar, Cards, Tabla y Detalle.
- [x] Pastillas de ordenamiento funcional en catálogo público.
- [x] Categorías separadas (Cámaras, NVRs, Switches) en Catálogo y Editor Rápido.
- [x] Precios en `U$S` con 2 decimales (ej. `40.10`).
- [x] Tablas con scrollbar contenida y encabezado fijo.
- [x] Modelo y variante técnica debajo sin la palabra "Spec".
- [x] Icono del ojo activo en color azul.
- [x] Extractor PDF presenta formulario estructurado con carga de imágenes y detección de modelo existente.
- [x] Compilación TypeScript limpia (`npx tsc --noEmit` y `npx tsc -p tsconfig.server.json` exitosos con código 0).
- [x] Bundle de producción (`npm run build`) probado y generado al 100%.
- [x] Servidor activo escuchando en puerto 8090 en modo desarrollo local.
- [x] Restricción de Git respetada: **Sin push a GitHub**.

---

## 4. Evidencia Observada
- `npx tsc --noEmit`: Salida limpia, código 0.
- `npx tsc -p tsconfig.server.json`: Salida limpia, código 0.
- `npm run build`: Vite transformó 1931 módulos y generó `dist/client` y `dist/server` exitosamente.
- `GET http://localhost:8090/`: HTTP 200 (HTML Servido).
- `GET http://localhost:8090/api/productos`: 47 modelos disponibles.
- `GET http://localhost:8090/api/productos/check-model?modelo=TC-C321N`: Retorna `{ exists: true }`.
- `POST http://localhost:8090/api/upload-image`: Sube imágenes con URL `/data/images/...`.
- `POST http://localhost:8090/api/extract-pdf`: Analiza datasheets PDF en memoria sin errores de bloqueo.
