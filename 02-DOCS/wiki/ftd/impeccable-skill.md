---
author: pablosud52
branch: master
status: in-progress
---
# Instalación y ajuste complementario de la skill Impeccable

## Intent
Instalar la skill `impeccable` desde el repositorio `pbakaus/impeccable` dentro de `.agents/skills/impeccable/` para sumar capacidades de diseño visual, tipografía, paletas de color, auditoría estética y reducción de clichés de IA (anti-slop), ajustando su descripción y directivas para complementar a las 13 skills web de `emilkowalski` sin sobreescribir ni tocar `.gemini/` ni crear archivos en la raíz.

## Scope
- **Incluido:**
  - Copia de `.agents/skills/impeccable/` desde el repositorio fuente a `.agents/skills/impeccable/`.
  - Edición preventiva del `SKILL.md` de Impeccable para centrar su trigger en diseño visual estático (jerarquía, tipografía, paletas con tinte, contrastes, maquetación y auditoría) y delegar expresamente animaciones y rendimiento de frames a las skills de Emil Kowalski.
  - Asegurar que no se creen archivos `PRODUCT.md` o `DESIGN.md` en la raíz del proyecto.
- **Excluido:**
  - Ejecutar el instalador interactivo `npx impeccable install`.
  - Tocar archivos dentro de `.gemini/`, `.rsc/` o la raíz del proyecto.

## Checklist
- [x] Clonar temporalmente `pbakaus/impeccable` y copiar `.agents/skills/impeccable` a `.agents/skills/impeccable` (prueba: verificación de que existe `SKILL.md` y sus subcarpetas).
- [x] Limpiar el directorio temporal (prueba: verificación de eliminación del directorio temporal).
- [x] Ajustar la cabecera YAML de `.agents/skills/impeccable/SKILL.md` delimitando su alcance para convivir armoniosamente con las skills de Emil Kowalski (prueba: lectura de la descripción en el archivo).
- [x] Confirmar que no se crearon archivos en la raíz ni en `.gemini/` (prueba: `git status --short`).

## Evidence
- **Carpeta de skill instalada:** `.agents/skills/impeccable/` (contiene `SKILL.md`, `reference/`, `scripts/`, `agents/`).
- **Ajustes en `SKILL.md`:**
  - Trigger acotado a: tipografía, jerarquía visual, espaciado/layout, paletas de color con tinte, reducción de anti-patrones y auditorías a11y.
  - Delegación explícita de animaciones a `animate`, `emil-design-eng` y `animation-performance`.
  - Restricción añadida: prohibición de escribir `PRODUCT.md` / `DESIGN.md` en la raíz (contexto derivado de `02-DOCS/`).
- **Verificación de aislamiento:** `git status` confirma que no hay archivos nuevos en la raíz ni modificaciones en `.gemini/` ni en `.rsc/`.

## Next
Reiniciar o abrir una sesión nueva cuando se desee refrescar el catálogo activo de skills en memoria del agente.
