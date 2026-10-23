# FTD: Renovación de Tarjeta e Índice de Early Warning (EW) en Wiki Técnica

## 1. Intención (Intent)
Actualizar el contenido y la presentación de la tarjeta tecnológica de **Early Warning (EW)** en la Wiki Técnica, homologándola a la estética editorial, limpia y sobria de las tarjetas anteriores (DORI, SMD, Color Maker y Polar Day), actualizando su entrada en el índice lateral e incorporando las 3 ventajas técnicas y el recuadro de implementación ideal.

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - En `WIKI_TOPICS`: renombrar a `"Early Warning (EW)"`, descripción concisa y `badge: ''`.
  - En la sección `#early-warning`:
    - Cabecera limpia con título `Early Warning (EW)` (altura de línea estándar de 28px).
    - Párrafo introductorio oficial de disuasión activa en tiempo real.
    - Bloque de **Ventajas** en cuadrícula de 3 columnas (`Prevención en el momento`, `Impacto visual y sonoro inmediato`, `Integración total con sistemas existentes`) con tarjetas en tonos neutros.
    - Recuadro inferior destacado para **Ideal para implementar en:** con los escenarios perimetrales recomendados.

## 3. Lista de Tareas (Checklist)
- [x] Actualizar `WIKI_TOPICS` en `WikiPage.tsx` para reflejar el título `"Early Warning (EW)"` y `badge: ''`.
- [x] Renovar la sección `#early-warning` en `WikiPage.tsx` con el nuevo texto introductorio, 3 ventajas y recuadro de aplicación.
- [x] Ejecutar `npm run build` y comprobar compilación sin errores.

## 4. Evidencia (Evidence)
- Compilación `npm run build` finalizada con éxito (código de salida 0).
- La entrada del índice lateral ahora muestra `"Early Warning (EW)"` con descripción limpia sin etiquetas de colores.
- La tarjeta de Early Warning (EW) cuenta con cabecera de altura estándar uniforme con las demás tarjetas, texto introductorio oficial, 3 bloques de ventajas en cuadrícula y recuadro destacado de aplicación ideal.

## 5. Siguiente Paso (Next Step)
- Presentar el cambio al usuario para su revisión.
