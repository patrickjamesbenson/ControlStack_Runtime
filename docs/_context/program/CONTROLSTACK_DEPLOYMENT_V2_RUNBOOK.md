# ControlStack Deployment v2 Runbook

Status: IMPLEMENTED — INSTALLATION REQUIRES ONE FRESH RUNTIME KEY AND ONE REBOOT

## Accepted topology

Deployment v2 manages exactly eight processes through Windows Scheduled Tasks:

| Service | Port | Task |
|---|---:|---|
| Selector MCP | 8000 | ControlStack-Selector-MCP |
| Selector runtime | 8788 | ControlStack-Selector-Runtime |
| Selector OpenAI tunnel | 8082 | ControlStack-Selector-Tunnel |
| Lab MCP | 8021 | ControlStack-Lab-MCP |
| Lab specification | 8899 | ControlStack-Lab-Specification |
| Lab OpenAI tunnel | 8081 | ControlStack-Lab-Tunnel |
| Program MCP | 8022 | ControlStack-Program-MCP |
| Program OpenAI tunnel | 8080 | ControlStack-Program-Tunnel |

The tasks run at Patrick's Windows logon. A small Node host supervises one child process per task and writes lane-specific logs and identity state under `C:\ControlStack_Service_Manager\deployment-v2`.

## Credential boundary

OpenAI documents that `tunnel-client` uses `CONTROL_PLANE_API_KEY`. The installer reads one fresh runtime API key from the Windows clipboard, immediately encrypts it with Windows DPAPI `CurrentUser`, clears the clipboard and stores only the encrypted result. The plaintext is absent from repository files, task arguments, receipts and logs.

The encrypted key can be decrypted only in Patrick's Windows account on the same Windows installation.

## Installation behavior

The installer:

1. validates the exact host, Windows user, worktree branches, paths and current eight listeners;
2. refuses to overwrite an existing Deployment v2 task;
3. backs up the entire existing `C:\ControlStack_Service_Manager` directory;
4. installs the pinned manifest, service host and lane manager;
5. creates eight logon tasks without starting them;
6. replaces only `CONTROLSTACK MANAGER.bat`, preserving the existing manager files and backup;
7. verifies that all eight pre-existing listener PIDs remained unchanged;
8. writes a secret-free receipt under `C:\ControlStack_Receipts`.

It does not stop, restart or delete any existing process. It does not change Git state. It does not remove ngrok, the old router, unknown/logo processes, old manager files, tunnel profiles, connectors or `CS_tunnel_runtime`.

## Mechanical installation

1. Run:

```powershell
node "C:\ControlStack_Worktrees\program-integrate\scripts\CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs" --install
```

2. Leave the installer waiting at its key-copy prompt.
3. Create one fresh OpenAI runtime API key with **Tunnels Read + Use**, click the site's **Copy** button, return to PowerShell and press **Enter**. Do not paste the key.
4. Restart Windows once after the installer reports success.
5. Open the existing **ControlStack Service Manager** desktop shortcut and choose **5 — Verify all eight lane services**.

## Rollback and cleanup boundaries

The original manager backup path is recorded in the installation receipt. Legacy cleanup is deliberately separate. No ngrok/router connector, tunnel, key, old manager or `CS_tunnel_runtime` is safe to delete merely because Deployment v2 has been installed. Cleanup requires a green post-reboot verification receipt first.

The downstream-artifacts tunnel remains reserved and inactive.
