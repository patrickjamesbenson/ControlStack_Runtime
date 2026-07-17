@echo off
setlocal
cd /d "%~dp0"

:menu
cls
echo ==============================================
echo       ControlStack Service Manager v2
echo ==============================================
echo.
echo  1. Start all ControlStack lanes
echo  2. Stop all managed ControlStack lanes
echo  3. Restart all managed ControlStack lanes
echo  4. Show lane status
echo  5. Verify all eight lane services
echo  6. Exit
echo.
choice /C 123456 /N /M "Choose 1-6: "

if errorlevel 6 exit /b 0
if errorlevel 5 set "ACTION=verify"& goto run
if errorlevel 4 set "ACTION=status"& goto run
if errorlevel 3 set "ACTION=restart"& goto run
if errorlevel 2 set "ACTION=stop"& goto run
if errorlevel 1 set "ACTION=start"& goto run

:run
"C:\Program Files\nodejs\node.exe" "%~dp0deployment-v2\controlstack_lane_manager.mjs" %ACTION%
echo.
pause
goto menu
