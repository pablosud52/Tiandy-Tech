# FTD: Actualización de Color del Icono Wiki a Verde Tiandy en Navbar

## 1. Intención (Intent)
Reemplazar el color lila (`purple-500/400`) del icono de la Wiki en la barra de navegación por el verde corporativo de Tiandy (`tiandy-500/400`), tanto en la vista de escritorio como en móvil.

## 2. Alcance (Scope)
- **`src/client/components/Navbar.tsx`**:
  - Línea ~284 (botón Wiki escritorio): cambiar `text-purple-500 dark:text-purple-400` por `text-tiandy-500 dark:text-tiandy-400`.
  - Línea ~543 (botón Wiki móvil): cambiar `text-purple-500 dark:text-purple-400` por `text-tiandy-500 dark:text-tiandy-400`.

## 3. Lista de Tareas (Checklist)
- [x] Aplicar el cambio de color en `Navbar.tsx` (escritorio y móvil).
- [x] Compilar el proyecto con `npm run build` (exit code 0).
- [x] Confirmar git diff y commitear.
- [x] Subir los cambios a GitHub (`git push origin master`).

## 4. Evidencia (Evidence)
- Compilación `npm run build` exitosa sin errores de tipado o empaquetado.
- Icono `BookOpen` en `Navbar.tsx` actualizado de `text-purple-500 dark:text-purple-400` a `text-tiandy-500 dark:text-tiandy-400`.
- Cambios commiteados y subidos a `origin/master`.

## 5. Siguiente Paso (Next Step)
- Notificar al usuario con el resumen del despliegue.
