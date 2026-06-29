@echo off
setlocal EnableExtensions

set CONTROLSTACK_RUNTIME_ROOT=C:\ControlStack_Runtime
set CONTROLSTACK_DONOR_REFERENCE_ROOT=C:\ControlStack
set CONTROLSTACK_MCP_TRANSPORT=streamable-http
set CONTROLSTACK_MCP_HOST=0.0.0.0
set CONTROLSTACK_MCP_PORT=8000
set CONTROLSTACK_MCP_PATH=/mcp
set CONTROLSTACK_ENABLE_WRITE=1

cd /d %CONTROLSTACK_RUNTIME_ROOT%
if errorlevel 1 (
  echo Failed to enter runtime root: %CONTROLSTACK_RUNTIME_ROOT%
  pause
  exit /b 1
)

echo Starting runtime-owned ControlStack MCP...
echo Runtime root: %CONTROLSTACK_RUNTIME_ROOT%
echo Donor reference root: %CONTROLSTACK_DONOR_REFERENCE_ROOT%
echo Transport: %CONTROLSTACK_MCP_TRANSPORT%
echo Bind: %CONTROLSTACK_MCP_HOST%:%CONTROLSTACK_MCP_PORT%%CONTROLSTACK_MCP_PATH%
echo.

python tools\controlstack-mcp\controlstack_mcp.py

set CONTROLSTACK_MCP_EXIT=%ERRORLEVEL%
echo.
echo Runtime ControlStack MCP stopped with exit code %CONTROLSTACK_MCP_EXIT%.
echo Review the output above for errors.
pause
exit /b %CONTROLSTACK_MCP_EXIT%