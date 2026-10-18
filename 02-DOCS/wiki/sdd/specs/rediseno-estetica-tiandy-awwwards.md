---
type: spec
title: Rediseño Estético y Experiencia de Usuario Tiandy Tech (Awwwards-Tier)
description: Especificación funcional y de experiencia de usuario para elevar la estética visual, densidad técnica, interacción fluida y fidelidad de marca Tiandy para instaladores, integradores y subdistribuidores.
tags: [sdd, spec, design, ui, tiandy]
timestamp: 2026-10-17T00:05:00Z
topic: sdd
slug: rediseno-estetica-tiandy-awwwards
status: draft
---

# Spec — Rediseño Estético y Experiencia de Usuario Tiandy Tech (Awwwards-Tier)

> Slug: `rediseno-estetica-tiandy-awwwards` · Status: draft · Created: 2026-10-17
> Inherits: [constitution](../constitution.md)

## Problem & why
El catálogo técnico actual de Tiandy Tech funciona y tiene una arquitectura de datos sólida, pero visualmente presenta la apariencia genérica de un dashboard SaaS estándar (Inter por defecto, fondos blancos planos, bordes uniformes de baja intención y animaciones básicas). Los instaladores, técnicos, integradores y subdistribuidores necesitan una herramienta de alta densidad técnica, que proyecte autoridad de ingeniería de seguridad electrónica, con la paleta identitaria de Tiandy (azul institucional cobalto `#00529B`/`#0066CC`, acentos de visión nocturna ColorMaker, terminaciones de hardware premium y modo oscuro de sala de monitoreo CCTV), manteniendo neutralidad de marca blanca.

## Cost of not building it
La herramienta seguirá percibiéndose como una maqueta o plantilla genérica de IA en lugar de una plataforma oficial de especificación de hardware CCTV. Esto disminuye la confianza de subdistribuidores e instaladores al compartirla en vivo frente a clientes finales o arquitectos de proyectos.

## The cheapest alternative
Mantener el CSS actual con ligeros retoques de color hexadecimal. Es insuficiente porque no resuelve los anti-patrones detectados por `impeccable` y `emil-design-eng`: falta de jerarquía de lectura a 10 pasos, sombras duras sin tinte, transiciones sin física natural y ausencia de la identidad industrial que distingue a Tiandy.

## Goals
- **Identidad de Hardware CCTV Premium:** Interfaz inspirada en instrumental técnico y monitoreo profesional, con paleta Tiandy (azul cobalto profundo, cian técnico, grises con tinte frío) y acentos ColorMaker / Super Starlight.
- **Micro-interacciones y Física Natural (Emil Kowalski standards):** Transiciones fluidas en modales, drawer de filtros, tabs y tarjetas usando exclusivamente propiedades compuestas (`transform`, `opacity`), eliminando `transition: all` y rebotes exagerados.
- **Densidad de Información sin Ruido (Anti-Slop Impeccable standards):** Jerarquía visual contundente (modelo principal en tamaño legible con contraste nítido, especificaciones clave agrupadas, badges con tratamiento de sello industrial y modo tabla tipo consola de ingeniería).
- **Modo Oscuro "Security Operations Center" (SOC):** Modo oscuro profundo con fondos tintados (`slate-950` enriquecido con azul cobalto muy sutil), evitando negros puros `#000000` y contrastes de grises lavados.
- **Respeto a la Marca Blanca y Performance:** Cero mención a importadores, bundle de assets optimizado y renderizado 60/120fps fluido en laptops y móviles de técnicos en campo.

## Non-goals / out of scope
- Modificar el backend Express o la estructura de la base de datos SQLite `tiandy.db`.
- Alterar la lógica comercial ni agregar pasarelas de pago (sigue siendo cotizador y catálogo técnico sin transacción monetaria).
- Agregar librerías pesadas externas de 3D o WebGL que rompan el presupuesto de bundle < 200 KB gzipped o penalicen el Lighthouse score.

## Users & context
- **Instaladores y Técnicos en Campo:** Acceden desde laptops o teléfonos móviles. Necesitan escanear ópticas (2.8mm vs 4mm), apertura de lente (F1.0 ColorMaker), distancia IR/LED y PoE rápidamente sin fricción visual.
- **Integradores y Proyectistas:** Utilizan el Comparador Técnico y la vista de Tabla para validar matrices de DORI y compatibilidad antes de licitar.
- **Subdistribuidores:** Navegan la plataforma frente a clientes o comparten la pantalla; la estética debe transmitir vanguardia y confiabilidad absoluta de marca internacional.

## Behaviour
- **Navbar y Cabecera:** Cabecera con efecto de cristal esmerilado translúcido (`backdrop-blur-md` calibrado), insignia Tiandy Tech con tratamiento vectorial de precisión, buscador rápido responsivo y toggle de tema suave sin salto de layout.
- **Selector de Categorías (Tabs):** Pestañas de navegación con indicador activo con resorte suave (spring visual), conteo técnico de ítems y tipografía técnica nítida.
- **Fichas de Producto (Grid View):**
  - Contenedor con borde sutílmente tintado y elevación en reposo con sombra multicapa difuminada.
  - Al hacer hover, elevación suave sin reacomodar elementos adyacentes (`transform: translateY(-2px)` y sombra enriquecida).
  - Fotografía sobre fondo limpio con badges industriales situados estratégicamente sin ocluir detalles de lentes o conectores.
  - Especificaciones críticas (Sensor, Iluminación, Lente, WDR, Códec, Carcasa) organizadas en cuadrícula de datos de alta legibilidad.
- **Vista de Tabla (Spreadsheet Mode):** Tipografía monoespaciada para códigos y números, cabeceras congeladas, contraste nítido en filas alternas y ordenamiento sin parpadeo.
- **Modales y Diálogos (Ficha Detalle y Comparador):** Entrada con escalado natural suave (`scale(0.98)` a `scale(1)` con curva ease-out natural), fondos atenuados con desenfoque ligero (`backdrop-blur-sm`), sin saltos de scroll.

## Acceptance criteria
- Given la vista en Modo Claro u Oscuro, When se inspeccionan las superficies de tarjetas y fondos, Then los colores de fondo y bordes utilizan paleta tintada coherente con Tiandy (`tiandy-*` y `slate-*` tintados) sin negros puros ni tarjetas sobre tarjetas innecesarias.
- Given el catálogo con más de 20 productos, When el usuario hace scroll, hover o interactúa con tarjetas y filtros, Then las animaciones se ejecutan a 60fps constantes sin caídas de cuadros en GPU.
- Given cualquier tarjeta de producto, When se visualiza en móvil o escritorio, Then el código de modelo base y las especificaciones principales se distinguen con jerarquía clara y sin saltos de línea rotos.
- Given el comando de verificación técnica `npm run build`, When se compila el proyecto completo, Then no existen errores de TypeScript (`tsc --noEmit`) y el empaquetado de producción finaliza con código de salida 0.

## Points to clarify
- **suposición tomada** — Mantener Tailwind CSS con extensión de tokens en `tailwind.config.js` e `index.css` para centralizar variables de diseño en lugar de instalar librerías UI de terceros. *Base:* Preserva cero dependencias extras y ligereza de bundle. *Riesgo:* Requiere diseño y maquetación artesanal de cada componente (beneficio: control total Awwwards sin atarse a plantillas).
- **decisión diferida** — Integración con modelos 3D interactivos de cámaras IP (se difiere para una fase posterior para mantener la carga ultrarrápida en redes móviles).
