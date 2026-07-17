# ControlStack Environment Repair Runbook

Status: **RETIRED — DO NOT EXECUTE**

`scripts/CONTROLSTACK_ENVIRONMENT_REPAIR.ps1` is permanently retired. It combined too many responsibilities and produced repeated failures during audit-only execution. Its Git history remains available as evidence, but it is no longer a deployment entry point.

## Replacement

Deployment v2 separates discovery, manifest generation, installation, verification and cleanup.

The first step is read-only and creates one secret-free receipt:

```powershell
node "C:\ControlStack_Worktrees\program-integrate\scripts\controlstack_deployment_inventory.mjs"
```

The inventory:

- reads listeners on ports 8000, 8021, 8022, 8080, 8081, 8082, 8788 and 8899;
- records relevant process identities, Scheduled Tasks, Windows services and Startup entries;
- records configuration file paths, sizes, timestamps and hashes without copying their contents;
- records the four known worktree branches, HEADs and Git status;
- records only whether known credential environment variables are present, never their values;
- redacts key/token/password-shaped command-line material;
- changes no process, task, service, Git, Startup or credential state;
- writes only `C:\ControlStack_Receipts\CONTROLSTACK_DEPLOYMENT_V2_INVENTORY_<timestamp>.json`.

The resulting receipt is the sole input to the Deployment v2 manifest. No full deployment is authorised before that manifest is derived and validated.
