# FTD: Centralización Global de Badges, Visibilidad Web Independiente, Header Compacto y Modo Tabla

## 1. Intent
Centralizar la configuración global de Badges (sellos gráficos y tecnologías) en un módulo administrativo exclusivo que defina de manera uniforme imagen, posición, tamaño y capa. En la ficha de producto solo se activa/desactiva cada badge.
Independizar el control de visibilidad de las secciones de la web pública (Cámaras, NVRs, Switches, Accesorios, Wiki y Herramientas con calculadoras) en una sección dedicada del menú lateral.
Compactar la cabecera del panel de catálogo en una sola línea angosta que evite solapamientos al hacer scroll.
Mejorar la vista de tabla del catálogo público con filas más amplias (1.5x), fotos con sellos gráficos superpuestos, eliminación de redundancia del modelo, reemplazo de DORI por características ópticas completas y cabeceras de red/interfaz más apropiadas.

---

## 2. Scope
1. **Biblioteca Global de Badges**:
   - Nuevos badges: `SMD 1.0`, `SMD 2.0`, `SMD 3.0` y `VCA`.
   - Activos SVG en `data/badges/`: `smd-1.svg`, `smd-2.svg`, `smd-3.svg`, `vca.svg`.
   - Endpoints `/api/configuracion/badges` (GET/POST).
   - Módulo administrativo `AdminBadgesModule.tsx` con selector de imagen, posición (6 presets), tamaño regulable (escala %), capa (delante/detrás) y previsualización en vivo.
2. **Formulario de Producto (`ProductEditForm.tsx`)**:
   - Simplificación total de la Sección 3: solo switches On/Off por badge. Cero redundancia.
3. **Módulo Independiente de Visibilidad (`AdminSectionsModule.tsx`)**:
   - Cámaras IP, NVRs, Switches PoE, Accesorios, Botón Wiki y Sección Herramientas (UPS y Almacenamiento).
4. **Header de Catálogo (`AdminCatalogModule.tsx`)**:
   - Fusión compacta en una sola línea de herramientas y filtros.
5. **Modo Tabla Pública (`ProductTable.tsx`)**:
   - Altura de fila 1.5x con foto `w-20 h-20` y `SellosGraficosOverlay`.
   - Retiro de texto redundante de modelo.
   - Retiro de DORI y adición de Sensor, Min. Ilum, Visión Nocturna y SMD/VCA.
   - Renombrado de columna "Conectividad" a "Red & Interfaz".

---

## 3. Checklist
- [ ] Crear vectores SVG oficiales: `smd-1.svg`, `smd-2.svg`, `smd-3.svg`, `vca.svg`.
- [ ] Actualizar tipos compartidos en `src/shared/types.ts`.
- [ ] Extender endpoints de configuración en `src/server/api/routes.ts`.
- [ ] Desarrollar `AdminBadgesModule.tsx` con control global unificado.
- [ ] Desarrollar `AdminSectionsModule.tsx` y enlazar en `AdminPage.tsx`.
- [ ] Simplificar `ProductEditForm.tsx` (solo On/Off por badge).
- [ ] Rediseñar y compactar cabecera de `AdminCatalogModule.tsx`.
- [ ] Rediseñar `ProductTable.tsx` (filas 1.5x, foto con sellos, sin DORI, specs completas).
- [ ] Actualizar `TabsNav.tsx` y `App.tsx` para secciones Wiki y Herramientas.
- [ ] Validar compilación (`npm run build`).
