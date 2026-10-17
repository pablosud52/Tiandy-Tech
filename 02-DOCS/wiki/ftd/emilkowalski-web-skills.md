---
author: pablosud52
branch: master
status: in-progress
---
# Instalación de skills web de emilkowalski/skills

## Intent
Instalar localmente en el proyecto las 13 skills orientadas a desarrollo web del repositorio `emilkowalski/skills` para asistir en diseño de UI, animaciones y pruebas de interfaz, sin interferir con las rutas gobernadas por `rsc`.

## Scope
- **Incluido:** Instalación en `.agents/skills/` de las 13 skills web (`emil-design-eng`, `animate`, `review-animations`, `improve-animations`, `find-animation-opportunities`, `animation-performance`, `animation-vocabulary`, `apple-design`, `pick-ui-library`, `prototype`, `mobile-native`, `break-ui`, `ask-sonner`).
- **Excluido:** Skills de desarrollo nativo móvil (`animate-expo`, `write-swift`), instalación global en la máquina del usuario y modificación de rutas gobernadas por `.rsc.json` (`.rsc/skills/` y `.gemini/rsc/`).

## Checklist
- [x] Clonar temporalmente `https://github.com/emilkowalski/skills.git` y copiar las 13 skills web en `.agents/skills/` (prueba: listado de las 13 carpetas con su `SKILL.md` válido).
- [x] Eliminar el directorio temporal de clonado (prueba: verificación de que no quedan archivos temporales).
- [x] Verificar que `rsc` no reporta conflictos en rutas gobernadas (prueba: comprobación de estado de `.agents/skills/` independiente de `.rsc.json`).

## Evidence
- **Skills instaladas en `.agents/skills/` (`HasSkillMd = True` en las 13):**
  `animate`, `animation-performance`, `animation-vocabulary`, `apple-design`, `ask-sonner`, `break-ui`, `emil-design-eng`, `find-animation-opportunities`, `improve-animations`, `mobile-native`, `pick-ui-library`, `prototype`, `review-animations`.
- **Excluidas según alcance web:** `animate-expo`, `write-swift`.
- **Aislamiento respecto a `rsc`:** Instaladas en `.agents/skills/`, fuera de `governedPaths` de `.rsc.json` (`.rsc/skills/*` y `.gemini/rsc/*`).

## Next
Abrir una sesión nueva o recargar el entorno para que el índice de skills descubra automáticamente `.agents/skills/`.
