# Governance & Shell Lane State
*Live canonical state, verified 2026-07-21.*

## Identity — VERIFIED
- Lane: `governance-shell`
- Root: `C:\ControlStack_Worktrees\governance-shell`
- Branch: `lane/governance-shell`
- Gate: `governance-shell`
- MCP: shared `controlstack_mcp.py`, scoped by env vars (same pattern as other lanes)
- Write scope: this worktree only; context writes limited to
  `docs/_context/lanes/governance-shell/`
- Recorded retrieval feature checkpoint: `408eaeced381dfb5ab49b5420b41a4b957698375`
- Recorded persistence feature checkpoint: `a8de2049cfda57f1413ec3bb193fe42e235e7be6`
- Recorded identity feature checkpoint: `87bf61db802bf6f31fc62eb0a75105b6efaabc48`
- Tree after identity feature push: clean

## Boundary (fixed by Program's Boundary Ruling)
This lane is the OUTSIDE layer: identity, project, permissions, retrieval, deferral
visibility. It shapes menus; it never blocks the kitchen. The Engine's contract is a
set of selections and nothing else — this lane never adds to it.

## Queue state
See `WORK_QUEUE.md`. Bootstrap, deferred decisions, inert retrieval, project
persistence and user identity/permissions are complete. No parcel is ready. CRM
mutation remains held and two-factor authentication remains deferred.

## Evidence
- Bootstrap and deferred-decisions closeouts remain intact.
- Program explicitly reordered the inert retrieval gateway ahead of persistence.
- The versioned immutable gateway separates readiness, project context and identity and
  returns four deterministic states without enabling retrieval or delivery.
- The prior shell-owned browser download action is inactive: no source resolution,
  materialisation, object URL or callable action remains on the shell path.
- The fixed `governance-shell` gate passed 152/152 for the retrieval feature.
- Project persistence now uses canonical versioned records, server-authoritative JSON,
  atomic replacement, bounded routes, server-first browser caching and explicit
  migration/rollback without fixture truth, provider calls or Engine coupling.
- The fixed `governance-shell` gate passed 175/175 after persistence implementation.
- User identity now resolves through injected NVB-first lookup followed by optional
  HubSpot presence-only lookup, with canonical four-role authority and immutable
  permissions. Internal override is flagged and logged; no-match handling stays
  deferred to CRM; no provider write, hard verification, two-factor or Engine seam was added.
- The fixed `governance-shell` gate passed 181/181 after identity implementation.
