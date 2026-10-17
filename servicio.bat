@echo off
setlocal enabledelayedexpansion
title Tiandy Tech — Servicio Local (Puerto 8090)

REM Asegurar que estamos en la carpeta del proyecto
cd /d "%~dp0"

cls
echo ================================================================
echo           TIANDY TECH — INICIANDO SERVICIO LOCAL
echo ================================================================
echo.

REM 1. Verificar si ya existe la compilacion; si no, compilar una vez
if not exist "dist\server\index.js" (
    echo [i] Compilacion inicial necesaria. Preparando aplicacion...
    call npm run build
    if !errorlevel! neq 0 (
        echo [ERROR] No se pudo compilar el proyecto. Revise los errores.
        pause
        exit /b 1
    )
    echo.
)

REM 2. Limpieza preventiva: si el puerto 8090 ya estaba ocupado, liberarlo
echo [1/3] Verificando puerto 8090...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8090" ^| findstr "LISTENING"') do (
    taskkill /f /pid %%a >nul 2>&1
)
ping 127.0.0.1 -n 2 > nul

REM 3. Iniciar el servidor en segundo plano
echo [2/3] Levantando servidor local en http://localhost:8090/...
start /b "" node dist/server/index.js > "%TEMP%\tiandy_servicio.log" 2>&1

REM 4. Comprobar que el servicio este activo antes de abrir el navegador
echo [3/3] Esperando confirmacion del servicio...
set "ACTIVO=0"
for /L %%i in (1,1,20) do (
    if !ACTIVO! equ 0 (
        netstat -aon | findstr ":8090" | findstr "LISTENING" >nul 2>&1
        if !errorlevel! equ 0 (
            set "ACTIVO=1"
        ) else (
            <nul set /p=". "
            ping 127.0.0.1 -n 2 > nul
        )
    )
)

echo.
if !ACTIVO! equ 0 (
    echo [ERROR] No se pudo confirmar el inicio del servicio en el puerto 8090.
    echo Registro del error:
    echo ----------------------------------------------------
    if exist "%TEMP%\tiandy_servicio.log" type "%TEMP%\tiandy_servicio.log"
    echo ----------------------------------------------------
    pause
    goto DETENER_Y_SALIR
)

REM 5. Servicio confirmado: abrir automaticamente el navegador
echo [OK] Servicio confirmado y activo en http://localhost:8090/
echo [i] Abriendo navegador predeterminado...
start http://localhost:8090/
ping 127.0.0.1 -n 2 > nul

:PANEL_ACTIVO
cls
REM Obtener el PID actual en escucha
set "PID_ACTIVO="
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8090" ^| findstr "LISTENING"') do (
    set "PID_ACTIVO=%%a"
)

echo ================================================================
echo           TIANDY TECH — SERVICIO EN LINEA (ACTIVO)
echo ================================================================
echo.
echo   Estado : [ EN LINEA ]
echo   Puerto : 8090  (PID: !PID_ACTIVO!)
echo   Web    : http://localhost:8090/
echo   Admin  : http://localhost:8090/admin
echo.
echo   --------------------------------------------------------------
echo   * Esta ventana mantiene el servicio en ejecucion.
echo   * NO la cierre mientras necesite usar el catalogo.
echo   --------------------------------------------------------------
echo.
echo   Acciones disponibles:
echo     [1] Volver a abrir el catalogo en el navegador
echo     [2] Abrir panel de control (/admin) en el navegador
echo     [3] DETENER servicio y Salir
echo.
echo ================================================================

choice /c 123 /n /m "Seleccione una opcion [1, 2 o 3]: "
if errorlevel 3 goto DETENER_Y_SALIR
if errorlevel 2 goto ABRIR_ADMIN
if errorlevel 1 goto ABRIR_WEB
goto PANEL_ACTIVO

:ABRIR_WEB
echo.
echo [i] Abriendo http://localhost:8090/...
start http://localhost:8090/
ping 127.0.0.1 -n 2 > nul
goto PANEL_ACTIVO

:ABRIR_ADMIN
echo.
echo [i] Abriendo http://localhost:8090/admin...
start http://localhost:8090/admin
ping 127.0.0.1 -n 2 > nul
goto PANEL_ACTIVO

:DETENER_Y_SALIR
cls
echo ================================================================
echo   DETENIENDO SERVICIO TIANDY TECH Y LIBERANDO PUERTO 8090
echo ================================================================
echo.
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":8090" ^| findstr "LISTENING"') do (
    echo [i] Finalizando proceso con PID %%a...
    taskkill /f /pid %%a >nul 2>&1
)
ping 127.0.0.1 -n 2 > nul
echo.
echo [OK] El servicio ha sido dado de baja y el puerto 8090 esta libre.
echo Hasta la proxima.
ping 127.0.0.1 -n 2 > nul
exit /b 0
