# ControlStack Deployment v2 Decision

Status: ACCEPTED ARCHITECTURE — HOST INVENTORY REQUIRED BEFORE INSTALLATION  
Owner: Program & Integrate  
Decision date: 2026-07-17

## Outcome

The monolithic `CONTROLSTACK_ENVIRONMENT_REPAIR.ps1` deployment path is retired. It must not be patched or executed again.

ControlStack Deployment v2 will use native Windows Scheduled Tasks as the process supervisor and the existing Service Manager v2 as a dashboard and control surface. The service manager will not be replaced, and unknown/logo/asset services will not be removed.

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

- Deployment does not modify feature code.
- Deployment does not repair Selector documentation scope or commit Lab work.
- Deployment does not merge, reset, clean, restore or delete Git state.
- Existing Service Manager v2 data is preserved and extended additively.
- Unknown, logo and asset services are preserved.
- Existing live processes remain load-bearing until a replacement is independently healthy.
- Credentials are handled as a separate bounded operation and never written to repository files, receipts, task arguments or command logs.
- Each lane process is independently startable, stoppable, restartable and observable.
- Scheduled Tasks run in Patrick's user session at logon; they are not pre-login machine services.
- Every task has a bounded restart-on-failure policy and a lane-specific log/receipt.
- Removal of ngrok, legacy managers or `CS_tunnel_runtime` is a later cleanup parcel requiring positive evidence that nothing references them.

## Delivery sequence

1. Generate a read-only, secret-free host inventory.
2. Derive an exact deployment manifest from that inventory.
3. Validate the manifest without process mutation.
4. Install Scheduled Tasks additively and connect them to Service Manager v2.
5. Verify all eight entries, then verify restart durability.
6. Perform legacy cleanup only as a separate, evidenced parcel.

No step is allowed to guess a launcher, process identity, service-manager schema or credential source.
