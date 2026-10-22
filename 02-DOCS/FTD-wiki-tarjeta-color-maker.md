# FTD: Actualización de Tarjeta e Índice de Color Maker en Wiki Técnica

## 1. Intención (Intent)
Actualizar el contenido y la presentación de la tarjeta tecnológica de **Color Maker** en la Wiki Técnica de la plataforma, homologando su estética al diseño editorial, limpio y sobrio de las dos primeras tarjetas (DORI y SMD), actualizando su título en la tarjeta y en el índice lateral, e incorporando de manera discreta el logotipo oficial de Color Maker en la cabecera del tema.

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - En `WIKI_TOPICS`: renombrar el tema a `"Color Maker"`, con descripción concisa y etiqueta vacía `badge: ''` al igual que DORI y SMD.
  - En la sección `#colormaker`:
    - Cabecera con título `Color Maker` y logotipo oficial de Color Maker integrado con proporciones discretas (`h-6 sm:h-7`) y fallback automático.
    - Párrafo introductorio oficial: "Tecnología de Tiandy que graba en color real las 24 horas, sin pasar nunca a blanco y negro. Combina un lente de apertura ultra amplia, un sensor que exprime la poca luz ambiental y luz LED cálida para responder en oscuridad total."
    - Bloque de **Ventajas** en cuadrícula de 3 columnas (Identificación exacta, Cero deslumbramientos, Disuasión activa) con tarjetas limpias en tono neutro (`rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 p-4`).
    - Recuadro inferior destacado para **Ideal para implementar en:** con resumen de escenarios recomendados (Entradas de comercios, accesos residenciales, fachadas y estacionamientos).
- **`public/data/images/`**:
  - Garantizar disponibilidad local y pública del archivo `color_maker_v3-1792460706851-51818.png` con respaldo en `public/data/badges/colormaker.png`.

## 3. Lista de Tareas (Checklist)
- [x] Actualizar `WIKI_TOPICS` en `WikiPage.tsx` para reflejar el título exacto `"Color Maker"`.
- [x] Renovar la sección `#colormaker` en `WikiPage.tsx` con el título, logo discreto, texto introductorio, tarjetas de ventajas y recuadro de aplicación.
- [x] Asegurar coherencia visual y de espaciado con DORI y SMD.
- [x] Ejecutar `npm run build` y comprobar compilación sin errores.

## 4. Evidencia (Evidence)
- Compilación `npm run build` ejecutada exitosamente con código de salida 0.
- El índice lateral muestra `"Color Maker"` sin badges estridentes.
- La tarjeta de Color Maker cuenta con el logo oficial discretamente integrado en la cabecera, tipografía limpia, 3 tarjetas de ventajas en tonos neutros y caja inferior para los escenarios ideales de implementación.

## 5. Siguiente Paso (Next Step)
- Presentar el cambio al usuario para validación.
