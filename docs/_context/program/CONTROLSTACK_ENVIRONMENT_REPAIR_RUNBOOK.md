# ControlStack Environment Repair Runbook

Run the safety audit first from a normal Windows PowerShell session under the Windows user that owns the ControlStack lane services:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_ENVIRONMENT_REPAIR.ps1" -AuditOnly
```

`-AuditOnly` performs discovery and validation only. It does not request an API key and does not change files, processes, services, Git state, registry state, Startup entries or credentials. Its only write is a structured, secret-free audit receipt under `C:\ControlStack_Receipts`, named `CONTROLSTACK_ENVIRONMENT_REPAIR_AUDIT_<timestamp>.json`.

## Audit evidence

The first AuditOnly attempt failed during PowerShell parsing at the expandable string containing `$Phase:`. Parsing failed before the script body executed, so that attempt caused no file, process, service, Git, registry, Startup, clipboard or credential change and produced no script receipt.

The second AuditOnly attempt entered preflight, wrote `CONTROLSTACK_ENVIRONMENT_REPAIR_AUDIT_20260717-153804.json`, and then reported `UNCLASSIFIED_FAILURE`. AuditOnly had not entered any mutation path, so that attempt changed nothing except writing its structured audit receipt. The follow-up repair removed the obsolete requirement for one uniquely dominant legacy service-manager directory: the additive lane manager is independent, existing managers remain untouched, and all discovered legacy manager files are retained only as preservation evidence. Audit failures now record and display a safe phase, script line and exception type instead of collapsing to `UNCLASSIFIED_FAILURE`.

The third AuditOnly attempt wrote `CONTROLSTACK_ENVIRONMENT_REPAIR_AUDIT_20260717-155710.json` and failed in phase `LAB_GIT_STATE` at the native-command wrapper with exception type `RemoteException`. Windows PowerShell 5.1 converts native stderr redirected with `2>&1` into PowerShell error records; the script-wide `Stop` preference therefore terminated on Git stderr before the wrapper could inspect Git's exit code. The wrapper now captures native stderr under a local `Continue` preference, restores the original preference immediately afterwards, and continues to decide success strictly from the native exit code. This AuditOnly attempt also caused no environmental mutation beyond writing its structured receipt.

The fourth AuditOnly attempt wrote `CONTROLSTACK_ENVIRONMENT_REPAIR_AUDIT_20260717-160409.json` and failed with `LAB_PROTECTED_COUNT_MISMATCH`. The failure came from obsolete historical assumptions that the Lab worktree must contain exactly 10 modified and 66 untracked paths. Those counts are not a durable safety boundary because legitimate Lab work can change them. The repair now snapshots the current modified and untracked path sets with per-file hashes, records their current counts as receipt evidence, requires the complete fingerprint to remain unchanged through every repair boundary, and still refuses to stage any protected path. This AuditOnly attempt also caused no environmental mutation beyond writing its structured receipt.

The fifth AuditOnly attempt wrote `CONTROLSTACK_ENVIRONMENT_REPAIR_AUDIT_20260717-161413.json` and failed in phase `SERVICE_IDENTITIES` at the command-line marker assertion. The shared phase did not identify which of the five services failed. Command-line substrings are not authoritative for MCP lane identity because launchers may bind roots and lane configuration through environment variables or working directory. The repair now gives each service a distinct audit phase. For Selector, Lab and Program MCP listeners, it performs a read-only MCP initialization and calls `repo_info`, then requires the returned runtime root, lane, required branch, HTTP port, transport and `/mcp` path to match exactly while still recording and checking the listener PID and executable. Selector runtime retains process-and-ancestry validation. This AuditOnly attempt also caused no environmental mutation beyond writing its structured receipt.

The sixth AuditOnly attempt wrote `CONTROLSTACK_ENVIRONMENT_REPAIR_AUDIT_20260717-165738.json` and failed in phase `SERVICE_LAB_SPECIFICATION` at the remaining command-line marker assertion. The listener and allowed process type were present, but its ancestry did not expose the guessed Lab, `streamlit`, `specification` or `demo` strings. The Lab specification service is now identified by exclusive ownership of port 8899 by an allowed Python or Node process plus a successful Streamlit `/_stcore/health` response whose trimmed body is exactly `ok`. The additive manager registry records that health path and expected body, and the generated manager uses the same health identity instead of command-line markers for specification status, start and stop guards. This AuditOnly attempt also caused no environmental mutation beyond writing its structured receipt.

**Do not run the full repair unless the latest AuditOnly receipt has status `audit-passed`.**

After AuditOnly passes, run the full repair:

```powershell
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_ENVIRONMENT_REPAIR.ps1"
```

The full repair completes all preflight checks before pausing. At the prompt, create a fresh dedicated service API key, copy it to the Windows clipboard, return to PowerShell and press Enter. Do not paste the key into the console.

Full execution writes a structured, secret-free receipt named `CONTROLSTACK_ENVIRONMENT_REPAIR_EXECUTE_<timestamp>.json`. Existing configuration files changed by the repair are backed up under the matching timestamped backup directory in `C:\ControlStack_Receipts`.
