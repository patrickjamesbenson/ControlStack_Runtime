@echo off
title ControlStack Selector and Engine Lane
set "CONTROLSTACK_RUNTIME_ROOT=C:\ControlStack_Worktrees\selector-engine"
set "CONTROLSTACK_DONOR_REFERENCE_ROOT=C:\ControlStack"
set "CONTROLSTACK_RUNTIMEDATA_ROOT=C:\ControlStack_RuntimeData"
set "CONTROLSTACK_MCP_TRANSPORT=streamable-http"
set "CONTROLSTACK_MCP_HOST=127.0.0.1"
set "CONTROLSTACK_MCP_PORT=8000"
set "CONTROLSTACK_MCP_PATH=/mcp"
set "CONTROLSTACK_MCP_SERVER_NAME=ControlStack Selector and Engine Lane"
set "CONTROLSTACK_WEBHOOK_BASE_URL=http://127.0.0.1:8788"
set "CONTROLSTACK_LANE_NAME=selector-engine"
set "CONTROLSTACK_REQUIRED_BRANCH=lane/selector-engine"
set "CONTROLSTACK_ALLOWED_GATES=selector-engine"
set "CONTROLSTACK_GATE_RUNNER=C:\ControlStack_Worktrees\controlstack-tooling-v2\scripts\controlstack_lane_gate.py"
set "CONTROLSTACK_ALLOWED_WRITE_GLOBS=apps/**;packages/workspace-kernel/**;packages/runtime-web/**;server.js;tests/selector*.test.js;tests/engine*.test.js;tests/runtime*.test.js;tests/runTable*.test.js;docs/selector/**;docs/engine/**;package.json;package-lock.json"
set "CONTROLSTACK_IGNORED_DIRTY_GLOBS="
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
