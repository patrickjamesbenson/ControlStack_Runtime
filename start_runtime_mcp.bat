@echo off
cd /d "%~dp0"

echo ========================================
echo ControlStack Runtime Shell
echo ========================================
echo Repo root: %CD%
echo URL      : http://127.0.0.1:8787/workspace?module=cs_selector
echo.

npm start
exit /b %ERRORLEVEL%
