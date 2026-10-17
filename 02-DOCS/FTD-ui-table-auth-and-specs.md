---
author: Pablo
branch: master
status: done
---
# Mejoras UI Catálogo, Iconografía CCTV, Autenticación y Extracción Fiel de Alimentación / Micrófono

## Intent
Mejorar la experiencia de usuario y precisión técnica del catálogo Tiandy Tech:
1. Unificar la estética de la barra de búsqueda por código con la del buscador general (quitar color naranja).
2. Renombrar el placeholder de búsqueda general a "Buscador global".
3. Corregir persistencia de sesión de administrador usando `sessionStorage` y tiempo de expiración para requerir reingreso de credenciales al cerrar sesión o navegador.
4. Rediseñar la vista en modo Tabla en la interfaz pública: miniatura a la izquierda, botones Comparar y Cotizar agrupados a la derecha, eliminación del botón "Ficha" y apertura al hacer clic en imagen o título.
5. Cambiar el icono de cámara genérica de fotos por `Cctv` de Lucide en todas las pantallas.
6. Cambiar el icono de cotizador (carrito) por calculadora (`Calculator`) en todas las pantallas.
7. Implementar icono representativo de comparación (`ArrowLeftRight`).
8. Garantizar que todas las cámaras tengan marcada por defecto la casilla de micrófono incorporado (separada de altavoz/sirena).
9. Eliminar valores inventados de alimentación en cámaras ("PoE / 12VDC"), extraer la información fiel desde el PDF ("Power Supply") y habilitar campos editables en el formulario del backoffice.

## Scope
- Frontend: `Navbar.tsx`, `ProductTable.tsx`, `ProductCard.tsx`, `ProductDetailModal.tsx`, `QuotationModal.tsx`, `CompareModal.tsx`, `TabsNav.tsx`.
- Autenticación: `App.tsx`, `AdminLogin.tsx`, `AdminPage.tsx`, `src/server/db/index.ts`.
- Formulario y Módulos Admin: `ProductEditForm.tsx`, `AdminCatalogModule.tsx`, `AdminExtractorModule.tsx`, `AdminBatchModule.tsx`, `AdminDashboardModule.tsx`.
- Backend & Helpers: `src/server/services/pdf-extractor.ts`, `src/shared/helpers.ts`, `src/shared/types.ts`.

## Checklist
- [x] FTD document creado y registrado en `02-DOCS/wiki/ftd/ui-table-auth-and-specs.md`.
- [x] Estética de barra de códigos unificada en `Navbar.tsx` (gris pizarra / slate en vez de naranja/amber) y placeholder general "Buscador global".
- [x] Autenticación ajustada: token y usuario en `sessionStorage` + expiración backend reducida de 7 días a 4 horas + limpieza de `localStorage` legado.
- [x] Modo Tabla actualizado: columna de imagen en la izquierda, botón Comparar junto a Cotizar en columna derecha de acciones, botón de ojo eliminado, apertura al hacer clic en imagen o modelo.
- [x] Icono de cámara actualizado a `Cctv` de CCTV moderno en todas las vistas.
- [x] Icono de cotizador actualizado a `Calculator` en toda la aplicación.
- [x] Icono de comparación actualizado a `ArrowLeftRight` en tarjetas, tabla y modales.
- [x] Micrófono incorporado activado por defecto para todas las cámaras Tiandy en creación manual, extracción PDF y formulario, separado de altavoz/sirena.
- [x] Extracción y edición de alimentación: parser de `Power Supply` en `pdf-extractor.ts`, campos en `ProductEditForm.tsx`, y eliminación de fallbacks inventados en `helpers.ts`.
- [x] Verificación de compilación TypeScript y pruebas en ejecución (`npm run build` completado exitosamente).

## Evidence
- `Navbar.tsx`: placeholder `"Buscador global"`, estilos `Barcode` con slate/tiandy, icono de cotizador `Calculator`.
- `ProductTable.tsx`: miniatura en la primera columna `Imagen`, título y thumbnail interactivos que invocan `onSelect(prod)`, botón `Ficha` con ojo eliminado, columna derecha `Acciones` con botón Comparar (`ArrowLeftRight`) y Cotizar (`Calculator`).
- `ProductCard.tsx`: Comparar con `ArrowLeftRight`, Cotizador con `Calculator`.
- `ProductDetailModal.tsx`: Comparar con `ArrowLeftRight`, Cotizador con `Calculator`.
- `QuotationModal.tsx`: `Calculator` en cabecera y estado vacío, `Cctv` en miniatura vacía de cámaras.
- `TabsNav.tsx`, `AdminDashboardModule.tsx`, `AdminCatalogModule.tsx`, `AdminBatchModule.tsx`, `ProductEditForm.tsx`: icono de cámara reemplazado por `Cctv`.
- `AdminLogin.tsx` y `App.tsx`: migración a `sessionStorage`, expiración reducida a 4h en `db/index.ts`, eliminación preventiva de claves persistentes de `localStorage`.
- `pdf-extractor.ts`: `camara.microfono_incorporado = true` para todas las cámaras Tiandy, `altavoz_incorporado` detectado por presencia de parlante/sirena/two-way, extracción fiel de `Power Supply` distinguiendo PoE, 12V DC, PoE+, y consumo en Watts.
- `ProductEditForm.tsx`: campos editables "Alimentación" y "Consumo Máximo (Watts)" para cámaras y NVRs, casilla de micrófono marcada por defecto.
- `helpers.ts`: eliminación del fallback artificial `'PoE (802.3af) / 12VDC'` y `'6W Max'`.
- Compilación `npm run build`: 1932 módulos transformados sin errores en TypeScript ni Vite.

## Next
- Entregar al usuario la síntesis de mejoras realizadas.
