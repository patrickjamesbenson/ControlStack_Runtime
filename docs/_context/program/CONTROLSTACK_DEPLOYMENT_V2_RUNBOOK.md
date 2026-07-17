# ControlStack Deployment v2 Runbook

Status: IMPLEMENTED — PER-USER STARTUP INSTALLATION READY

## Accepted topology

Deployment v2 manages exactly eight processes through one per-user Windows Startup launcher:

| Managed entry | Port |
|---|---:|
| Selector MCP | 8000 |
| Selector runtime | 8788 |
| Selector OpenAI tunnel | 8082 |
| Lab MCP | 8021 |
| Lab specification | 8899 |
| Lab OpenAI tunnel | 8081 |
| Program MCP | 8022 |
| Program OpenAI tunnel | 8080 |

The Startup launcher invokes Service Manager v2 at Patrick's Windows logon. Service Manager v2 starts one small Node supervisor for each entry. Each entry remains independently startable, stoppable, restartable and observable. Logs and ownership state live under `C:\ControlStack_Service_Manager\deployment-v2`.

Windows Scheduled Tasks are not used. Installation and normal operation do not require administrator privileges.

## Credential boundary

The three active OpenAI tunnels share one runtime API key through `CONTROL_PLANE_API_KEY`. The key is encrypted with Windows PowerShell SecureString/DPAPI `CurrentUser`; plaintext is absent from repository files, startup arguments, receipts and logs.

A valid encrypted key left by an interrupted installation is reused automatically. Patrick is not asked to create or copy another key.

## Installation behavior

The installer:

1. validates the exact host, Windows user, worktree branches, executable paths and all eight current listeners;
2. validates and reuses the existing protected deployment key;
3. backs up the entire existing `C:\ControlStack_Service_Manager` directory;
4. installs the pinned manifest, service host and lane manager;
5. writes one verified per-user Startup entry;
6. replaces only `CONTROLSTACK MANAGER.bat`;
7. verifies that all eight currently running listener PIDs remained unchanged;
8. writes a secret-free receipt under `C:\ControlStack_Receipts`.

It does not stop or restart existing processes during installation. It does not change Git state. It does not remove ngrok, old router processes, unknown/logo services, tunnel profiles, connectors or `CS_tunnel_runtime`.

## Mechanical installation

Run exactly:

```powershell
node C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs --install
```

The installer should report that it is reusing the already protected deployment key. No API-key page, clipboard action, PowerShell elevation or code approval is required.

After it reports `CONTROLSTACK DEPLOYMENT V2 INSTALLED`, restart Windows once. Then open the existing **ControlStack Service Manager** desktop shortcut and choose **5 — Verify all eight lane services**. Verification accepts only healthy services owned by Deployment v2.

## Rollback and cleanup boundaries

The original manager backup path is recorded in the installation receipt. Legacy cleanup remains separate. No ngrok/router connector, old tunnel key, old manager or `CS_tunnel_runtime` is deleted until the post-reboot verification is green.

The downstream-artifacts tunnel remains reserved and inactive.


## Tunnel recovery

The first post-reboot start exposed a Windows PowerShell 5.1 argument-boundary defect in the tunnel credential decoder. MCP, runtime and specification services were healthy; only the three tunnel supervisors failed before log creation.

The corrected decoder receives the DPAPI ciphertext through standard input, matching the already-validated installer path. Recovery copies only the corrected deployment host/manager/manifest, replaces only tunnel listeners whose executable and profile identity match, starts the three managed tunnels, and verifies all eight managed services:

```powershell
node C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs --repair-tunnels
```

No new key, reboot, elevation or restart of the five healthy non-tunnel services is required.


## Lab lane-memory checkpoint

The Lab worktree intentionally contains an unstaged IES feature parcel. The normal MCP commit guard correctly refuses any commit while that unexplained dirty state exists, even when only the six lane-memory documents are staged.

The bounded checkpoint utility `scripts/CONTROLSTACK_LAB_MEMORY_CHECKPOINT.mjs` handles this one known parcel without weakening the permanent app guard. It:

- requires the exact Lab root, branch, and base commit;
- requires the exact six staged documentation paths;
- fingerprints the exact 10 modified, 66 untracked, and zero deleted protected paths;
- runs the `lab-ies` gate;
- creates a commit containing only the six documentation files;
- verifies the protected inventory is unchanged after the commit;
- pushes only `lane/code-pilot-lab`;
- writes a secret-free receipt under `C:\ControlStack_Receipts`.

It contains no reset, clean, restore, checkout, deletion, movement, or feature-staging operation. A changed inventory fails closed.

Mechanical execution:

```powershell
node C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_LAB_MEMORY_CHECKPOINT.mjs
```


### First checkpoint execution

The first execution on 2026-07-18 passed `lab-ies` 147/147 and created the correct six-file commit `1b154c482978a9c77a9ea5325cd103bfe40b14ed`. It then stopped before push because trimming porcelain output removed the leading status space from the first protected modified path. Repository verification confirmed zero staged paths and the exact original 10 modified plus 66 untracked IES paths remained. The parser now preserves leading porcelain status characters; rerunning the same command verifies the existing checkpoint and completes only the branch push and receipt.
