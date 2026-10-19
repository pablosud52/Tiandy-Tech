---
author: pablosud52
branch: master
status: in-progress
---
# Publicación en Cloudflare Pages y Botón en Panel de Control

## Intent
Permitir la publicación directa del catálogo web en Cloudflare Pages desde el panel de control del Backoffice mediante un botón "PUBLICAR" con confirmación interactiva, garantizando que el build público sea 100% independiente, sin el botón "Panel AD" ni ningún componente o ruta del panel administrativo.

## Scope
- [x] Documento FTD y definición técnica.
- [x] Soporte de compilación pública (`VITE_PUBLIC_BUILD=true`):
  - Exclusión total del botón "Panel AD" en `Navbar.tsx`.
  - Exclusión y code-splitting / tree-shaking del código de `AdminPage`, `AdminLogin` y módulos de administración en `App.tsx`.
  - Reglas de redirección SPA `_redirects` para Cloudflare Pages (`/* /index.html 200`).
  - Snapshot estático de datos (`productos.json`, `badges.json`, `sections.json`) y assets para alta disponibilidad en el CDN.
- [x] Endpoint backend `/api/admin/publish` y `/api/admin/publish/status`:
  - Generación de snapshot de datos desde SQLite (`data/tiandy.db`).
  - Compilación automática del frontend público (`dist/public`).
  - Integración con Direct Upload de Cloudflare Pages (`wrangler` / API) y fallback informativo de credenciales.
- [x] Interfaz de usuario en el Panel de Control (`AdminPage.tsx` y `PublishModal.tsx`):
  - Botón prominente "PUBLICAR" en cabecera del panel.
  - Modal de confirmación con texto explicativo, botones Aceptar / Cancelar, indicador de progreso y reporte de estado.
- [x] Guía clara para el usuario con los datos necesarios de su cuenta de Cloudflare.

## Checklist
- [x] Build público no contiene referencias ni código de `AdminPage` ni botón `Panel AD` en el bundle generado (verificado con búsqueda de texto en `dist/public/assets/*.js`: 0 coincidencias).
- [x] Archivo `_redirects` creado correctamente para Cloudflare Pages (`/* /index.html 200`).
- [x] Endpoint `/api/admin/publish` implementado y conectado en `routes.ts` con `publisher.ts`.
- [x] Modal de confirmación en `AdminPage.tsx` funciona con confirmación, cancelación y spinner.
- [x] Verificación de compilación sin errores con `npm run build:public` (44s, código 0).
- [x] Verificación de compilación de producción completa con `npm run build` (56s, código 0).

## Evidence
- `npm run build:public`: Exited with code 0. Generó `dist/public/index.html`, `dist/public/assets/index-DAUp1K4m.css`, `dist/public/assets/index-C3b7pZvT.js`.
- Verificación de exclusión: `Select-String -Path dist/public/assets/*.js -Pattern "Panel AD"` -> 0 coincidencias.
- Verificación de exclusión: `Select-String -Path dist/public/assets/*.js -Pattern "Control de Usuarios"` -> 0 coincidencias.
- `npm run build`: Exited with code 0. TypeScript cliente (`tsc`), Vite (`vite build`) y TypeScript servidor (`tsc.server`) verificados sin errores.

## Next
Presentar al usuario la arquitectura implementada, la demostración del botón/modal y los datos necesarios de su cuenta de Cloudflare.

