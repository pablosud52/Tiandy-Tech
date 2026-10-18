---
type: plan
title: Plan — Rediseño Estético y Experiencia de Usuario Tiandy Tech (Awwwards-Tier)
description: Blueprint técnico de arquitectura visual, tokens, micro-interacciones y componentes para la renovación estética de Tiandy Tech.
tags: [sdd, plan, design, ui]
timestamp: 2026-10-17T00:05:30Z
topic: sdd
slug: rediseno-estetica-tiandy-awwwards
status: draft
---

# Plan — Rediseño Estético y Experiencia de Usuario Tiandy Tech (Awwwards-Tier)

> Spec: [../specs/rediseno-estetica-tiandy-awwwards.md](../specs/rediseno-estetica-tiandy-awwwards.md) · Constitution: [../constitution.md](../constitution.md) · Status: draft
> Last updated: 2026-10-17

## 0. Global Constraints
- **Color Palette Canon:** Azul corporativo Tiandy (`#00529B`, `#0066CC`, acentos `#0EA5E9`), neutros tintados fríos (`slate-50` a `slate-950`), sin grises planos sin tinte ni negros puros `#000000`.
- **Motion Canon (Emil Kowalski standards):** Transiciones restringidas a `transform` y `opacity`. Prohibido `transition: all`. Duraciones snappy (150ms a 300ms) con curva `cubic-bezier(0.16, 1, 0.3, 1)`.
- **Anti-Slop Visual Canon (Impeccable standards):** Prohibido anidar tarjetas dentro de tarjetas; jerarquía tipográfica con máximo 3 tamaños por vista; badges con terminación de sello de hardware sin colores sobresaturados genéricos.
- **Brand Rules:** Neutralidad absoluta de marca blanca (cero datos de importadores).
- **Bundle & Performance:** Bundle inicial < 200 KB gzipped, cero dependencias pesadas de 3D, TypeScript estricto sin errores en `npm run build`.

## 1. Context & constraints
- Alineado con spec `rediseno-estetica-tiandy-awwwards.md` §Goals y §Acceptance Criteria.
- Stack tecnológico: React 18, Vite 6, Tailwind CSS 3, Lucide React.
- Mantiene compatibilidad total con el modo oscuro y modo claro del sistema.

## 2. Architecture

```text
[ tailwind.config.js / index.css ] (Design Tokens, Glassmorphism, Elevaciones)
                │
                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UI LAYER (COMPONENTS)                             │
│                                                                             │
│  [ Navbar ] ──────────────► [ TabsNav ] ──────────────► [ FilterSidebar ]   │
│       │                          │                             │            │
│       ▼                          ▼                             ▼            │
│  [ ProductCard ] (Grid Mode) ───► [ Badges & Sellos ]                       │
│  [ ProductTable ] (Table Mode) ─► [ Monospace Specs & Dense Rows ]          │
│  [ Modals & Overlays ] ─────────► [ Smooth Scale & Backdrop-blur ]          │
└─────────────────────────────────────────────────────────────────────────────┘
```

- **Tokens & CSS System (Internal):** Centraliza elevaciones multicapa difusas, efectos de cristal esmerilado con tintes y paleta Tiandy extendida en Tailwind.
- **Navbar & Navigation (Internal):** Cabecera flotante translúcida fija con indicador de conectividad de catálogo, buscador técnico integrado y toggles sin brinco de layout.
- **Product Card & Grid (Internal):** Tarjetas de hardware con tratamiento visual de chasis técnico, contraste tipográfico y micro-animación en elevación.
- **Table View (Spreadsheet) (Internal):** Modo consola de datos densos para integradores con scroll horizontal optimizado y encabezados fijos.
- **Modals & Compare View (Internal):** Diálogos animados con física fluida, fondo translúcido y lectura técnica sin oclusión.

**Top architectural decision:** Extender Tailwind CSS con utilidades de elevación multicapa y estilos CSS personalizados para animaciones fluidas por GPU en lugar de agregar librerías pesadas de animación o CSS-in-JS. Esto garantiza 60fps reales en laptops y celulares de instaladores y cero impacto negativo en el tamaño del bundle.

## 3. Interfaces & contracts

### Interface: `DesignTokens`
- `tiandy.primary`: `#0066cc` (botón de acción, estados activos).
- `tiandy.navy`: `#002952` y `#001a35` (fondos oscuros SOC con tinte azulado).
- `surface.light`: `#f8fafc` con bordes `#e2e8f0` enriquecidos con tinte cobalto.
- `surface.dark`: `#0b1120` con bordes `#1e293b`.
- `shadow.card`: sombra difusa con tinte azul noche para efecto de hardware sobre mesa de trabajo.

### Interface: `AnimationGuidelines`
- Modal Enter: `opacity: 0 -> 1`, `transform: scale(0.97) -> scale(1)` en 200ms `ease-out`.
- Modal Exit: `opacity: 1 -> 0`, `transform: scale(1) -> scale(0.98)` en 150ms `ease-in`.
- Hover Card: `transform: translateY(-2px)`, sombra suave ampliada sin mover elementos vecinos.

## 4. Data model & flow
No se modifica el modelo de datos `Producto` ni las tablas SQLite; los componentes reciben las mismas estructuras (`Producto`, `datos_tecnicos`, `ItemCotizacion`) consumiendo los helpers existentes con mejor presentación visual.

## 5. Testing strategy

| Acceptance criterion | Level | Asserts | Fakes / mocks |
| --- | --- | --- | --- |
| spec §Acceptance #1 (Paleta y contrastes) | Component | Clases CSS aplican tokens `tiandy-*` y `slate-*` tintados | Ninguno |
| spec §Acceptance #2 (Rendimiento 60fps) | Performance | Animaciones usan `transform`/`opacity` sin `transition: all` | Ninguno |
| spec §Acceptance #3 (Jerarquía de modelos) | Integration | El modelo base y subtipo se leen con contraste superior | Datos de prueba locales |
| spec §Acceptance #4 (Compilación limpia) | Build Gate | `npm run build` finaliza con código 0 sin errores de tipos | Ninguno |

## 6. Sequencing & dependencies
1. **Fase 1 (Design Tokens & Base Styles):** Actualizar `tailwind.config.js` e `index.css` con la paleta Tiandy extendida, sombras multicapa y clases de animación. (Serial, Base)
2. **Fase 2 (Navbar & Header Polish):** Rediseñar `src/client/components/Navbar.tsx` y `TabsNav.tsx` con estética Awwwards (cristal esmerilado, logo de precisión, barra de búsqueda técnica e insignias limpias).
3. **Fase 3 (ProductCard & Badges Overhaul):** Rediseñar `src/client/components/ProductCard.tsx` y `Badges.tsx` dotándolos de jerarquía de hardware, especificaciones limpias y micro-interacciones de hover fluidas.
4. **Fase 4 (ProductTable & Spreadsheet Polish):** Perfeccionar `src/client/components/ProductTable.tsx` para un aspecto de consola de ingeniería de alta precisión.
5. **Fase 5 (Modals & Compare Polish):** Refinar `ProductDetailModal.tsx` y `CompareView.tsx` con entradas y transiciones suaves, métricas visuales y tipografía clara.
6. **Fase 6 (Auditoría Adversarial & Verification):** Ejecutar árbitro adversarial con reglas de `impeccable` y `emil-design-eng`, compilar con `npm run build` y validar el resultado final.

## 7. Risks & open decisions

| Risk | Trigger | Impact | Mitigation / spike to retire it |
| --- | --- | --- | --- |
| Contraste insuficiente en Modo Oscuro | Fondos demasiado oscuros o textos con bajo contraste | Dificultad de lectura para técnicos | Pruebas de contraste con ratios WCAG AA (>4.5:1) en todos los textos |
| Regresión en tamaño de bundle | Importar iconos o paquetes innecesarios | Carga lenta en conexiones móviles | Usar solo Lucide React ya instalado y utilidades puras de Tailwind |
