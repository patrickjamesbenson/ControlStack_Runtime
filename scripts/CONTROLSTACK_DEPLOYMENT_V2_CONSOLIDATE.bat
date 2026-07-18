@echo off
setlocal
title ControlStack Deployment v2 Consolidation

echo ControlStack Deployment v2 Consolidation
echo ==========================================
echo.

node "%~dp0CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs" --consolidate
set "EXIT_CODE=%ERRORLEVEL%"

echo.
if "%EXIT_CODE%"=="0" (
  echo CONTROLSTACK DEPLOYMENT V2 COMPLETED SUCCESSFULLY
) else (
  echo CONTROLSTACK DEPLOYMENT V2 FAILED WITH EXIT CODE %EXIT_CODE%
)
echo.
echo This window will remain open so the complete result can be reviewed.
pause
exit /b %EXIT_CODE%
