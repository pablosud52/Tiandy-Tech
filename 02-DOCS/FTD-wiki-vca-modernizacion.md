# FTD: Modernización de la Sección VCA (Video Content Analytics) en Wiki Técnica

## 1. Intención (Intent)
Actualizar la sección `#vca` en la Wiki Técnica de Tiandy con la nueva jerarquía de títulos bilingüe (`VCA — Video Content Analytics (Analíticas de Video)`) y estructurar de manera exhaustiva sus 8 categorías funcionales y 24 analíticas bajo la Opción A (cuadrícula modular limpia de 2 columnas).

## 2. Alcance (Scope)
- **`src/client/pages/WikiPage.tsx`**:
  - `WIKI_TOPICS`:
    - Actualizar `title` a `'VCA - Video Content Analytics (Analíticas de Video)'` y descripción breve.
  - `<section id="vca">`:
    - Reemplazar el contenido actual por la definición general enriquecida.
    - Desarrollar los 8 bloques temáticos numerados (`01` a `08`):
      1. Seguridad Perimetral y Control de Intrusión (3 analíticas)
      2. Comportamiento y Orden Público (4 analíticas)
      3. Vigilancia de Objetos y Protección del Dispositivo (4 analíticas)
      4. Inteligencia Comercial y Métricas de Negocio (2 analíticas)
      5. Seguridad Ocupacional (EHS) y Supervisión Laboral (4 analíticas)
      6. Reconocimiento Biométrico y Estructuración de Objetos (3 analíticas)
      7. Tránsito y Analíticas Vehiculares (LPR / ANPR) (2 analíticas)
      8. Detección Térmica y Protección contra Incendios (2 analíticas)
    - Cada analítica con:
      - Nombre en inglés destacado + traducción en español.
      - Qué hace: Explicación concisa y técnica.
      - Implementación: Escenarios recomendados de aplicación.

## 3. Lista de Tareas (Checklist)
- [x] Actualizar entrada en `WIKI_TOPICS` en `WikiPage.tsx`.
- [x] Implementar la estructura modular de las 8 categorías en `<section id="vca">`.
- [x] Ejecutar `npm run build` para validar que no haya errores de tipado o JSX (exit code 0).
- [x] Probar y verificar consistencia visual.

## 4. Evidencia (Evidence)
- Compilación `npm run build` completada con éxito (`tsc --noEmit`, Vite build y `tsc server` finalizados con exit code 0).
- Las 8 categorías temáticas y sus 24 analíticas se renderizan en una cuadrícula modular limpia de 2 columnas, con títulos bilingües, explicación funcional y casos de implementación recomendados.

## 5. Siguiente Paso (Next Step)
- Notificar al usuario para su revisión en la interfaz.
