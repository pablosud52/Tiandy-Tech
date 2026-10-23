# FTD: Incorporación de Gamas de Cámaras y NVRs y Reordenamiento de Tarjetas en Wiki Técnica

## 1. Intención (Intent)
1. Integrar dos nuevas tarjetas al inicio de la Wiki Técnica: **Gamas de Cámaras IP (Network Cameras)** y **Gamas de Grabadores de Red (NVR)**, estructurando sus 5 series respectivas en tarjetas modulares uniformes con sus prestaciones clave e ideales de aplicación.
2. Reordenar el catálogo completo de la Wiki según la secuencia aprobada:
   1. Gamas de Cámaras IP (`gamas-camaras`)
   2. Gamas de Grabadores NVR (`gamas-nvr`)
   3. SMD (`smd`)
   4. Color Maker (`colormaker`)
   5. Polar Day (`polar-day`)
   6. S+265 (`codec-s265`)
   7. Early Warning (`early-warning`)
   8. DORI (`dori`)
   9. VCA (`vca`)

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - `WIKI_TOPICS`:
    - Incorporar `gamas-camaras` y `gamas-nvr` al inicio.
    - Reordenar la lista según el orden especificado.
    - Establecer `'gamas-camaras'` como sección activa predeterminada.
  - `<main>` (cuerpo de la página):
    - Sección `#gamas-camaras`: Cabecera estándar, párrafo introductorio y cuadrícula con las 5 gamas (AK IPC, SK IPC, LK IPC, Tian, Sunflower).
    - Sección `#gamas-nvr`: Cabecera estándar, párrafo introductorio y cuadrícula con las 5 gamas (AK NVR, SK NVR, Light AI NVR, LK NVR, AI NVR).
    - Reorganizar el orden de las secciones en el JSX: `#smd`, `#colormaker`, `#polar-day`, `#codec-s265`, `#early-warning`, `#dori`, `#vca`.

## 3. Lista de Tareas (Checklist)
- [x] Configurar el arreglo `WIKI_TOPICS` con los 9 temas ordenados.
- [x] Construir la tarjeta `#gamas-camaras` con diseño modular para las 5 gamas.
- [x] Construir la tarjeta `#gamas-nvr` con diseño modular para las 5 gamas.
- [x] Reordenar los bloques `<section>` en el JSX del cuerpo principal (`#gamas-camaras`, `#gamas-nvr`, `#smd`, `#colormaker`, `#polar-day`, `#codec-s265`, `#early-warning`, `#dori`, `#vca`).
- [x] Ejecutar `npm run build` y comprobar compilación sin errores (exit code 0).

## 4. Evidencia (Evidence)
- Compilación `npm run build` exitosa (`tsc --noEmit`, Vite build y `tsc server` completados sin errores).
- Verificación de renderizado en `WikiPage.tsx` con las 9 secciones sincronizadas tanto en la barra lateral interactiva (`WIKI_TOPICS` y ScrollSpy) como en el flujo principal de tarjetas.

## 5. Siguiente Paso (Next Step)
- Confirmar con el usuario la visualización en la interfaz.
