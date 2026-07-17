# ControlStack Deployment v2 Decision

Status: ACCEPTED ARCHITECTURE — PER-USER STARTUP SUPERVISION  
Owner: Program & Integrate  
Decision date: 2026-07-17  
Revised: 2026-07-18

## Outcome

The monolithic `CONTROLSTACK_ENVIRONMENT_REPAIR.ps1` path remains retired.

Deployment v2 uses one per-user Windows Startup launcher to invoke Service Manager v2. Service Manager v2 directly owns eight lane supervisors. Windows Scheduled Tasks were rejected after the host proved that task registration introduced an unnecessary administrator boundary.

This is an engineering decision owned by Program & Integrate. Patrick is not expected to review or approve implementation details.

## Managed lane entries

| Entry | Lane | Port | Role |
|---|---|---:|---|
| Selector MCP | Selector & Engine | 8000 | Lane-scoped MCP |
| Selector runtime | Selector & Engine | 8788 | Runtime/webhook |
| Selector tunnel | Selector & Engine | 8082 | OpenAI tunnel health |
| Lab MCP | Lab & IES | 8021 | Lane-scoped MCP |
| Lab specification | Lab & IES | 8899 | Browser specification/demo |
| Lab tunnel | Lab & IES | 8081 | OpenAI tunnel health |
| Program MCP | Program & Integrate | 8022 | Lane-scoped MCP |
| Program tunnel | Program & Integrate | 8080 | OpenAI tunnel health |

The downstream-artifacts tunnel remains reserved and inactive until the Engine output contract is stable.

## Locked safety rules

- Deployment does not modify feature code or Git state.
- Unknown, logo and asset services remain outside this manager and are preserved.
- Installation leaves all currently running lane processes unchanged.
- One protected runtime API key is shared by the three active OpenAI tunnel processes.
- Each managed entry is independently startable, stoppable, restartable and observable.
- Stop operations require recorded PID, executable, port and supervisor identity matches.
- Post-reboot verification requires both health and Deployment v2 ownership.
- Startup supervision runs only in Patrick's logged-in Windows session and needs no administrator rights.
- Removal of ngrok, legacy managers, old keys or `CS_tunnel_runtime` remains a later evidenced cleanup parcel.

## Delivery sequence

1. Inventory the live host without mutation.
2. Derive and test the exact eight-entry manifest.
3. Install the manager, encrypted credential and one per-user Startup launcher additively.
4. Restart Windows once and verify all eight entries are healthy and managed.
5. Perform legacy cleanup only after that green verification.
