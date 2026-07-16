@echo off
title ControlStack Selector Runtime Lane
set "CONTROLSTACK_RUNTIME_HOST=127.0.0.1"
set "CONTROLSTACK_RUNTIME_PORT=8788"
set "CONTROLSTACK_AUTHORITY_REFERENCE_SNAPSHOT_PATH=C:\ControlStack_RuntimeData\authority-reference\novondb.json"
set "PYTHONDONTWRITEBYTECODE=1"
cd /d C:\ControlStack_Worktrees\selector-engine
node server.js
pause
