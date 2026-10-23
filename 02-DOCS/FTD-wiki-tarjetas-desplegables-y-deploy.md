# FTD: Tarjetas Desplegables en Wiki Técnica y Despliegue Público en Cloudflare Pages

## 1. Intención (Intent)
1. Hacer que cada una de las 9 tarjetas de la Wiki Técnica sea desplegable/colapsable individualmente:
   - Encabezado con título/logo siempre visible en estado colapsado y expandido.
   - Indicador visual tipo flecha/chevron que rota suavemente al desplegar/colapsar.
   - Apertura automática de la tarjeta cuando el usuario hace clic en el tema correspondiente desde el índice lateral flotante.
   - Opción para expandir o colapsar todas las tarjetas desde el índice.
2. Compilar y verificar el proyecto.
3. Subir los cambios a GitHub (`origin/master`).
4. Ejecutar la publicación pública hacia Cloudflare Pages (utilizando el servicio oficial `executePublish`).

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - Estado `openSections` para controlar el despliegue de cada tarjeta.
  - Función `toggleSection(id)`.
  - Funciones `expandAll()` y `collapseAll()`.
  - Actualización de `scrollToTopic(id)` para expandir automáticamente la tarjeta seleccionada antes del desplazamiento suave.
  - Cabeceras interactivas en las 9 secciones con indicador `ChevronDown`.
- **Despliegue Cloudflare**:
  - Invocar `executePublish()` de `src/server/services/publisher.ts` para compilar el snapshot público y desplegar en Cloudflare Pages con Wrangler.

## 3. Lista de Tareas (Checklist)
- [x] Incorporar estado `openSections`, `toggleSection`, `expandAll`, `collapseAll` y `ChevronDown` en `WikiPage.tsx`.
- [x] Actualizar `scrollToTopic` para asegurar la apertura automática de la sección clickeada.
- [x] Convertir las 9 secciones (`#gamas-camaras`, `#gamas-nvr`, `#smd`, `#colormaker`, `#polar-day`, `#codec-s265`, `#early-warning`, `#dori`, `#vca`) al formato colapsable.
- [x] Ejecutar `npm run build` y comprobar compilación exitosa (código 0).
- [ ] Commitear y pushear cambios a GitHub (`origin/master`).
- [ ] Ejecutar la publicación pública a Cloudflare Pages mediante `executePublish()`.

## 4. Evidencia (Evidence)
- Compilación `npm run build` completada con exit code 0.
- 9 tarjetas configuradas con cabecera interactiva, rotación fluida de chevron e integración directa con el índice lateral.

## 5. Siguiente Paso (Next Step)
- Commitear y hacer push a GitHub, y luego ejecutar el despliegue a Cloudflare Pages.
