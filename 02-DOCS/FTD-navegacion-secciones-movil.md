# FTD: Cinta Desplazable Horizontal de Secciones y Herramientas Móvil

## 1. Intención (Intent)
En dispositivos móviles, las secciones y botones de navegación estaban cortados o fuera del alcance del usuario. Se transforma la barra móvil en una **cinta desplazable interactiva fluida** (*carousel/tape navigation*) con flechas guía de desplazamiento, soporte de arrastre con mouse y dedo (*touch swipe & drag-to-scroll*), auto-centrado del botón seleccionado y acceso unificado a todas las secciones y utilidades técnicas.

## 2. Alcance (Scope)
- **`src/client/components/Navbar.tsx`**:
  - Cinta horizontal deslizable con flechas chevrons circulares `<` y `>` que aparecen dinámicamente cuando hay contenido fuera de pantalla.
  - Gradientes laterales para dar retroalimentación visual de contenido disponible a la derecha/izquierda.
  - Integración de Secciones principales (`Cámaras`, `NVRs`, `Switches`, `Accesorios`) junto a utilidades clave (`Wiki`, `Comparativa`, `Cotizador`, `Calculadoras`).
  - Auto-centrado suave (*smooth scrollIntoView*) de la sección o vista seleccionada.
  - Soporte de arrastre directo con mouse (`onMouseDown`, `onMouseMove`, `onMouseUp`) y deslizamiento táctil nativo.
- **`src/client/index.css`**: Utilidad `.no-scrollbar` para evitar barras de desplazamiento invasivas.

## 3. Lista de Tareas (Checklist)
- [x] Incorporar utilidad `.no-scrollbar` en `src/client/index.css`.
- [x] Desarrollar cinta interactiva con detección de límites (`canScrollLeft`, `canScrollRight`).
- [x] Incorporar botones de flecha chevrons con animaciones e indicadores de gradiente.
- [x] Integrar arrastre horizontal con mouse y deslizamiento táctil.
- [x] Implementar auto-centrado del elemento activo.
- [x] Incluir accesos directos a Wiki, Comparador, Cotizador y Calculadoras en la cinta móvil.
- [x] Ejecutar `npm run build` con código de salida 0.

## 4. Evidencia (Evidence)
- Compilación `npm run build` verificada exitosamente (0 errores, código de salida 0).
- Todos los botones quedan ahora al alcance del usuario mediante un toque en las flechas `<` / `>` o mediante deslizamiento lateral con el dedo o arrastre con mouse.

## 5. Siguiente Paso (Next Step)
Presentar al usuario la cinta desplazable lista para validación en su dispositivo móvil o vista reducida.
