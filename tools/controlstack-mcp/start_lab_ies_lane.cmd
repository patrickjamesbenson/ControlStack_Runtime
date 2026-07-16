@echo off
title ControlStack Lab and IES Authority Lane
set "CONTROLSTACK_RUNTIME_ROOT=C:\ControlStack_Worktrees\code-pilot-lab"
set "CONTROLSTACK_DONOR_REFERENCE_ROOT=C:\ControlStack_Lab"
set "CONTROLSTACK_RUNTIMEDATA_ROOT=C:\ControlStack_RuntimeData"
set "CONTROLSTACK_MCP_TRANSPORT=streamable-http"
set "CONTROLSTACK_MCP_HOST=127.0.0.1"
set "CONTROLSTACK_MCP_PORT=8021"
set "CONTROLSTACK_MCP_PATH=/mcp"
set "CONTROLSTACK_MCP_SERVER_NAME=ControlStack Lab and IES Authority Lane"
set "CONTROLSTACK_WEBHOOK_BASE_URL=http://127.0.0.1:9"
set "CONTROLSTACK_LANE_NAME=lab-ies"
set "CONTROLSTACK_REQUIRED_BRANCH=lane/code-pilot-lab"
set "CONTROLSTACK_ALLOWED_GATES=lab-ies"
set "CONTROLSTACK_GATE_RUNNER=C:\ControlStack_Worktrees\controlstack-tooling-v2\scripts\controlstack_lane_gate.py"
set "CONTROLSTACK_ALLOWED_WRITE_GLOBS=packages/lab-kernel/**;tests/lab-kernel/**;docs/lab/**;docs/_context/**;serve.mjs;scripts/clear_chaff.ps1"
set "CONTROLSTACK_IGNORED_DIRTY_GLOBS=README.zip"
set "CONTROLSTACK_ENABLE_WRITE=1"
set "CONTROLSTACK_ENABLE_GIT_STAGE=1"
set "CONTROLSTACK_ENABLE_GIT_COMMIT=1"
set "CONTROLSTACK_ENABLE_GIT_PUSH=1"
set "CONTROLSTACK_ENABLE_DESTRUCTIVE=0"
set "CONTROLSTACK_ENABLE_CROSS_ROOT_COPY=0"
set "PYTHONDONTWRITEBYTECODE=1"
cd /d C:\ControlStack_Worktrees\controlstack-tooling-v2
python tools\controlstack-mcp\controlstack_mcp.py
pause
