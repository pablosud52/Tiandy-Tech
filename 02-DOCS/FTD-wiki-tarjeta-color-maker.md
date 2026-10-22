# FTD: Ajuste de Icono Color Maker y Renovación de Tarjeta Polar Day en Wiki Técnica

## 1. Intención (Intent)
1. Aumentar el tamaño visual del icono de Color Maker en un +75% sin expandir el alto ni el ancho reservado de la línea del título (manteniendo la misma altura de línea compacta).
2. Homologar la tarjeta y la entrada de índice de **Polar Day** con la misma estética limpia y editorial de DORI, SMD y Color Maker:
   - Renombrar el tema en el índice y cabecera a **"Polar Day"**.
   - Integrar el logotipo oficial de Polar Day en el título con el mismo tamaño escalado (+75%) y sin expandir la línea.
   - Reemplazar el contenido con el texto oficial: introducción técnica, 3 tarjetas de Ventajas y recuadro de implementación ideal.

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - En `WIKI_TOPICS`:
    - `polar-day`: Renombrar a `"Polar Day"`, descripción concisa y `badge: ''`.
  - En `#colormaker`:
    - Envolver el logo en un contenedor `h-7 flex items-center shrink-0` y aplicar `scale-[1.75] origin-left ml-2 mr-6` para crecer un 75% visualmente sin alterar la altura de la línea ni la separación del contenedor.
  - En `#polar-day`:
    - Cabecera con título `Polar Day` e icono de Polar Day (`Polar_day_v3-1792190135325-112865.png` con fallback `polarday.png`), aplicando el mismo escalado `scale-[1.75] origin-left ml-2 mr-6` en contenedor `h-7`.
    - Texto introductorio oficial de Polar Day.
    - Bloque de **Ventajas** en cuadrícula de 3 columnas (`Color sin contaminación lumínica`, `Vigilancia 100% discreta`, `Rendimiento ultra sensible`) con tarjetas neutras.
    - Recuadro inferior destacado para **Ideal para implementar en:** con los entornos recomendados.
- **`public/data/images/`**:
  - `Polar_day_v3-1792190135325-112865.png` disponible en `public/data/images/` con fallback en `public/data/badges/polarday.png`.

## 3. Lista de Tareas (Checklist)
- [x] Escalar el logo de Color Maker en un +75% preservando la línea del título.
- [x] Actualizar el índice lateral para `polar-day` con título `"Polar Day"` y `badge: ''`.
- [x] Renovar la tarjeta `#polar-day` con el logo escalado, texto introductorio, 3 ventajas y recuadro de aplicación.
- [x] Ejecutar `npm run build` y comprobar compilación sin errores.

## 4. Evidencia (Evidence)
- Compilación `npm run build` exitosa con código de salida 0.
- El logo de Color Maker ahora escala un +75% (`scale-[1.75] origin-left ml-2 mr-6`) en un contenedor `h-7`, manteniendo intacta la altura de la línea del título sin ensancharla.
- En el índice lateral se muestra `"Polar Day"` alineado al diseño limpio sin badges.
- La tarjeta de Polar Day cuenta con su cabecera homologada con el logo escalado al mismo tamaño, texto introductorio, 3 tarjetas de ventajas y recuadro de implementación ideal.

## 5. Siguiente Paso (Next Step)
- Presentar el resultado al usuario.
