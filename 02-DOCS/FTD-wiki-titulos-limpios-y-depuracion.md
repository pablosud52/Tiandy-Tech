# FTD: Titulares Limpios con Wordmarks y Depuración de Secciones en Wiki Técnica

## 1. Intención (Intent)
1. Integrar los logotipos tipográficos (wordmarks) como titulares directos en las tarjetas de **SMD**, **Color Maker** y **Polar Day**, eliminando la duplicación del nombre en texto visible y preservando la accesibilidad web mediante texto semántico para lectores de pantalla (`sr-only`).
2. En **SMD**, sustituir el texto "SMD" por el icono enlazado directamente a la frase explicativa: `[Icono SMD] — Smart Motion Detection...`.
3. En **Color Maker** y **Polar Day**, dejar exclusivamente el logotipo oficial en la cabecera sin texto redundante adyacente.
4. Eliminar por completo las tarjetas y las entradas del índice de las secciones no requeridas: **"Alimentación PoE y Modo CCTV Extend 250m"** y **"Grados de Protección Intemperie e Impacto (IP67 / IK10)"**.

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - `WIKI_TOPICS`:
    - Eliminar entradas `poe-switches` y `grados-ip-ik`.
  - `#smd`:
    - Cabecera con `<span className="sr-only">SMD - </span>` + `<img src="/data/images/smd-tight.png" ... />` + `<span>— Smart Motion Detection (Detección de Movimiento Inteligente)</span>`.
  - `#colormaker`:
    - Cabecera con `<span className="sr-only">Color Maker</span>` + `<img src="/data/images/colormaker-tight.png" ... />` a `h-7 sm:h-8`.
  - `#polar-day`:
    - Cabecera con `<span className="sr-only">Polar Day</span>` + `<img src="/data/images/polarday-tight.png" ... />` a `h-7 sm:h-8`.
  - Contenido principal (`<main>`):
    - Eliminar sección `<section id="poe-switches">...</section>`.
    - Eliminar sección `<section id="grados-ip-ik">...</section>`.

## 3. Lista de Tareas (Checklist)
- [x] Eliminar `poe-switches` y `grados-ip-ik` de `WIKI_TOPICS`.
- [x] Eliminar las secciones `<section id="poe-switches">` y `<section id="grados-ip-ik">` del cuerpo de la Wiki.
- [x] Ajustar la cabecera de `#smd` acoplando el resto del título al icono con guión largo y texto oculto accesible.
- [x] Ajustar la cabecera de `#colormaker` dejando únicamente el logotipo oficial con texto `sr-only`.
- [x] Ajustar la cabecera de `#polar-day` dejando únicamente el logotipo oficial con texto `sr-only`.
- [x] Ejecutar `npm run build` y comprobar compilación sin errores.

## 4. Evidencia (Evidence)
- Compilación `npm run build` finalizada con éxito (código de salida 0).
- La cabecera de SMD sustituye visualmente el texto "SMD" por el icono enlazado a `— Smart Motion Detection...`, con texto accesible `sr-only`.
- Las cabeceras de Color Maker y Polar Day muestran exclusivamente sus respectivos logotipos de marca sin textos redundantes adyacentes.
- Se eliminaron por completo las tarjetas e índices de "Alimentación PoE y Modo CCTV Extend 250m" y "Grados de Protección Intemperie e Impacto (IP67 / IK10)". El índice ahora cuenta con exactamente 7 temas técnicos concisos y relevantes.

## 5. Siguiente Paso (Next Step)
- Presentar el resultado al usuario.
