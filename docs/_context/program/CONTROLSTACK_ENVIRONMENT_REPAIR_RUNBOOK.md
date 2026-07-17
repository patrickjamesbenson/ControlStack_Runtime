# ControlStack Environment Repair Runbook

Run the safety audit first from a normal Windows PowerShell session under the Windows user that owns the ControlStack lane services:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_ENVIRONMENT_REPAIR.ps1" -AuditOnly
```

`-AuditOnly` performs discovery and validation only. It does not request an API key and does not change files, processes, services, Git state, registry state, Startup entries or credentials. Its only write is a structured, secret-free audit receipt under `C:\ControlStack_Receipts`, named `CONTROLSTACK_ENVIRONMENT_REPAIR_AUDIT_<timestamp>.json`.

**Do not run the full repair unless the latest AuditOnly receipt has status `audit-passed`.**

After AuditOnly passes, run the full repair:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_ENVIRONMENT_REPAIR.ps1"
```

The full repair completes all preflight checks before pausing. At the prompt, create a fresh dedicated service API key, copy it to the Windows clipboard, return to PowerShell and press Enter. Do not paste the key into the console.

Full execution writes a structured, secret-free receipt named `CONTROLSTACK_ENVIRONMENT_REPAIR_EXECUTE_<timestamp>.json`. Existing configuration files changed by the repair are backed up under the matching timestamped backup directory in `C:\ControlStack_Receipts`.
