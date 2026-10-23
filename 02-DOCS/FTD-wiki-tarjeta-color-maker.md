# FTD: Integración de Iconos con Marcos Ajustados en Color Maker y Polar Day

## 1. Intención (Intent)
Reemplazar los archivos de los logotipos de **Color Maker** y **Polar Day** por las nuevas versiones con marcos ajustados (sin márgenes transparentes vacíos), asegurando una visibilidad nítida y óptima a la izquierda del título sin alterar ni ensanchar la altura de la línea de cabecera (`pb-4` con `line-height: 28px`), logrando uniformidad dimensional con DORI, SMD y las demás tarjetas de la Wiki Técnica.

## 2. Alcance (Scope)
- **`public/data/images/` y `data/images/`**:
  - Incorporar `colormaker-tight.png` (1024x437) y `polarday-tight.png` (765x529).
- **`src/client/pages/WikiPage.tsx`**:
  - Sección `#colormaker`: imagen `colormaker-tight.png` con `h-6 sm:h-7 w-auto` a la izquierda de `<h2>Color Maker</h2>`.
  - Sección `#polar-day`: imagen `polarday-tight.png` con `h-6 sm:h-7 w-auto` a la izquierda de `<h2>Polar Day</h2>`.
  - Altura de línea idéntica al estándar `text-xl font-bold` (28px) de DORI y SMD.

## 3. Lista de Tareas (Checklist)
- [x] Copiar las nuevas imágenes ajustadas provistas por el usuario a las rutas estáticas.
- [x] Actualizar la cabecera de `#colormaker` con `colormaker-tight.png` y `h-6 sm:h-7`.
- [x] Actualizar la cabecera de `#polar-day` con `polarday-tight.png` y `h-6 sm:h-7`.
- [x] Ejecutar `npm run build` y comprobar compilación sin errores.

## 4. Evidencia (Evidence)
- Compilación `npm run build` completada con código de salida 0.
- Los nuevos archivos `colormaker-tight.png` y `polarday-tight.png` no poseen márgenes transparentes sobrantes.
- En `WikiPage.tsx`, las imágenes se muestran a `h-6 sm:h-7 w-auto` en flujo directo, garantizando que la altura de la línea de título sea estrictamente uniforme con DORI y SMD (`28px` de altura de línea).

## 5. Siguiente Paso (Next Step)
- Presentar el resultado al usuario para validación visual.
