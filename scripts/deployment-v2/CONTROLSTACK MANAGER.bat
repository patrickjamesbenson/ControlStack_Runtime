@echo off
setlocal
cd /d "%~dp0"

:menu
cls
echo =====================================================
echo   ControlStack Service Manager Deployment v2
echo =====================================================
echo.
echo  1. Open local control UI
echo  2. Start all ControlStack services
echo  3. Stop all managed ControlStack services
echo  4. Restart all managed ControlStack services
echo  5. Show service status
echo  6. Verify all nine managed services
echo  7. Exit
echo.
choice /C 1234567 /N /M "Choose 1-7: "

if errorlevel 7 exit /b 0
if errorlevel 6 set "ACTION=verify"& goto run
if errorlevel 5 set "ACTION=status"& goto run
if errorlevel 4 set "ACTION=restart"& goto run
if errorlevel 3 set "ACTION=stop"& goto run
if errorlevel 2 set "ACTION=start"& goto run
if errorlevel 1 start "" "http://127.0.0.1:8790/"& goto menu

:run
"C:\Program Files\nodejs\node.exe" "%~dp0deployment-v2\controlstack_lane_manager.mjs" %ACTION%
echo.
pause
goto menu
