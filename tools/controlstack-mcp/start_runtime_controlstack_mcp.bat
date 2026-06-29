@echo off
setlocal

REM Runtime-owned ControlStack MCP - ChatGPT HTTP mode
REM This launcher does not depend on C:\ControlStack.

set "CONTROLSTACK_MCP_TRANSPORT=streamable-http"
set "CONTROLSTACK_MCP_HOST=127.0.0.1"
set "CONTROLSTACK_MCP_PORT=8000"
set "CONTROLSTACK_MCP_PATH=/mcp"

REM Runtime root is authoritative for runtime work.
set "CONTROLSTACK_RUNTIME_ROOT=C:\ControlStack_Runtime"

REM Optional read-only donor reference. Runtime work must not depend on this existing.
set "CONTROLSTACK_DONOR_REFERENCE_ROOT=C:\ControlStack"

REM Enable fixed runtime write tools. No arbitrary shell execution is exposed.
set "CONTROLSTACK_ENABLE_WRITE=1"

set "MCP_SCRIPT=C:\ControlStack_Runtime\tools\controlstack-mcp\controlstack_mcp.py"
set "RUNTIME_PY=C:\ControlStack_Runtime\.venv\Scripts\python.exe"

echo ========================================
echo ControlStack Runtime-owned MCP
echo ========================================
echo Runtime Root        : %CONTROLSTACK_RUNTIME_ROOT%
echo Donor Reference Root: %CONTROLSTACK_DONOR_REFERENCE_ROOT%
echo Transport           : %CONTROLSTACK_MCP_TRANSPORT%
echo Host                : %CONTROLSTACK_MCP_HOST%
echo Port                : %CONTROLSTACK_MCP_PORT%
echo MCP Path            : %CONTROLSTACK_MCP_PATH%
echo Endpoint            : http://127.0.0.1:%CONTROLSTACK_MCP_PORT%%CONTROLSTACK_MCP_PATH%
echo.

if exist "%RUNTIME_PY%" (
  "%RUNTIME_PY%" "%MCP_SCRIPT%"
) else (
  python "%MCP_SCRIPT%"
)

echo.
echo Runtime-owned MCP server stopped.
pause
