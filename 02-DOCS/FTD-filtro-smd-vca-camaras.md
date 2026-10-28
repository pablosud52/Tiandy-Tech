# FTD: Filtro Lateral de Analíticas VCA para Cámaras

## 1. Intent (Intención)
Permitir a instaladores, integradores y clientes filtrar cámaras IP de Tiandy según sus funciones y analíticas de video inteligente VCA (Cruce de línea, Intrusión perimetral, Merodeo, Conteo de personas, Casco de seguridad, etc.), con terminología clara en español y referencia técnica en inglés.

## 2. Scope (Alcance)
- Extender el tipo `FiltrosBusqueda` en `src/shared/types.ts` con `smd_vca?: string[]`.
- Taxonomía estandarizada en `src/shared/helpers.ts` (`CATALOGO_ANALITICAS_VCA`) con 20 analíticas de video clasificadas en 6 categorías:
  - Seguridad Perimetral
  - Comportamiento y Orden
  - Objetos y Dispositivo
  - Inteligencia Comercial
  - Seguridad Laboral (EHS)
  - Biometría y Tránsito
- Motor de detección de capacidades en `getProductAnalytics` cruzando datasheets, especificaciones técnicas y configuraciones manuales.
- Componente lateral `FilterSidebar.tsx`:
  - Bloque colapsable titulado **Analíticas VCA**.
  - Opciones a 2 renglones:
    - **Renglón 1:** Traducción y función en español en **negrita** (`font-semibold`) + contador de modelos compatibles.
    - **Renglón 2:** Nombre técnico en inglés en color gris (`text-slate-500 font-mono`).
- Lógica en `App.tsx`:
  - Conteo dinámico y reactivo `conteoPorAnalitica`.
  - Filtrado con coincidencia estricta AND (`every`) para hallar modelos con todas las analíticas seleccionadas.

## 3. Checklist de Implementación
- [x] Taxonomía y tipado en `types.ts` y `helpers.ts`.
- [x] Función `getProductAnalytics` con cruce de datasheets PDF y atributos.
- [x] Título de sección "Analíticas VCA" en `FilterSidebar.tsx`.
- [x] Jerarquía visual de 2 renglones (Español arriba en negrita, Inglés abajo en gris mono).
- [x] Conteo reactivo por analítica en `App.tsx`.
- [x] Lógica de filtrado AND en `filteredProducts`.
- [x] Verificación de compilación (`npm run build` code 0).

## 4. Evidence (Evidencia)
- Compilación de TypeScript y bundle de producción con Vite finalizados con código 0.
- Distribución de analíticas disponibles en el catálogo:
  - Cruce de línea / Tripwire: 18 modelos
  - Intrusión perimetral / Perimeter Intrusion: 18 modelos
  - Doble cruce de línea / Double Tripwire: 2 modelos
  - Merodeo / Loitering: 2 modelos
  - Carrera / Running: 2 modelos
  - Estacionamiento indebido / Parking: 2 modelos
  - Detección de aglomeraciones / Crowd: 2 modelos
  - Objeto abandonado / Object Abandoned: 2 modelos
  - Objeto desaparecido / Object Lost: 2 modelos
  - Alteración de video / Video Abnormal: 5 modelos
  - Detección de audio anómalo / Audio Abnormal: 5 modelos
  - Conteo de personas / People Counting: 2 modelos
  - Mapa de calor / Heat Map: 3 modelos
  - Detección de uso de casco / Safety Helmet: 2 modelos
  - Abandono de puesto / On-Duty: 2 modelos
  - Captura y atributos faciales / Face Detection: 3 modelos
