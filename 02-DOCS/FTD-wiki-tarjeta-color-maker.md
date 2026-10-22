# FTD: Reposicionamiento a la Izquierda y Reescalado de Iconos en Wiki Técnica

## 1. Intención (Intent)
1. Reubicar los logotipos tecnológicos de **Color Maker** y **Polar Day** a la izquierda de sus respectivos títulos para mejorar la jerarquía de lectura visual.
2. Incrementar el tamaño del icono de Color Maker en un 40% adicional respecto a Polar Day, adaptándolo a su relación de aspecto apaisada.

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - En la sección `#colormaker`:
    - Posicionar la imagen a la izquierda del `<h2>Color Maker</h2>`.
    - Ajustar la escala a `h-11 sm:h-12 w-auto` (+40% de tamaño óptico).
  - En la sección `#polar-day`:
    - Posicionar la imagen a la izquierda del `<h2>Polar Day</h2>`.
    - Ajustar tamaño a `h-8 sm:h-9 w-auto` en flujo natural alineado verticalmente.

## 3. Lista de Tareas (Checklist)
- [x] Ubicar el icono de Color Maker a la izquierda del título en `#colormaker` con altura `h-11 sm:h-12`.
- [x] Ubicar el icono de Polar Day a la izquierda del título en `#polar-day` con altura `h-8 sm:h-9`.
- [x] Ejecutar `npm run build` y comprobar compilación sin errores.

## 4. Evidencia (Evidence)
- Compilación `npm run build` finalizada con código de salida 0.
- Ambos iconos ahora preceden al título en orden `[Icono] [Título]`.
- El icono de Color Maker se renderiza a `h-11 sm:h-12` (+40% de tamaño óptico respecto al icono de Polar Day que se muestra a `h-8 sm:h-9`).

## 5. Siguiente Paso (Next Step)
- Presentar el resultado al usuario.
