# ControlStack Environment Repair Runbook

Run this once from a normal Windows PowerShell session under the Windows user that owns the ControlStack lane tunnels:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_ENVIRONMENT_REPAIR.ps1"
```

The script completes all preflight checks before it pauses. At the prompt, create a fresh dedicated service API key, copy it to the Windows clipboard, return to the PowerShell window, and press Enter. Do not paste the key into the console.

The timestamped execution receipt and configuration backups are written under `C:\ControlStack_Receipts`.
