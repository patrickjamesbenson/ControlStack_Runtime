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
- Recorded branch HEAD: `971597afd8f3d425d09dd7963ddf249456ae78aa`
- Tree at reconciliation: clean and synchronized with origin

## Boundary (fixed by Program's Boundary Ruling)
This lane is the OUTSIDE layer: identity, project, permissions, retrieval, deferral
visibility. It shapes menus; it never blocks the kitchen. The Engine's contract is a
set of selections and nothing else — this lane never adds to it.

## Queue state
See `WORK_QUEUE.md`. GOV-001 and GOV-002 are complete. No later parcel is ready.
GOV-003 remains blocked pending its Program seam decision. GOV-004 remains blocked
behind the queue unless Program issues an explicit written reorder.

## Evidence
- Canonical lane records were already committed at the recorded branch HEAD.
- The fixed `governance-shell` gate passed on 2026-07-21.
- Bootstrap closeout changed lane-memory files only; no retrieval gateway, route,
  download action, producer or consumer was added.
- GOV-002 added one versioned static deferred-decision registry and read-only developer
  panel. The fixed lane gate passed; the two OPEN decisions remain unresolved and no
  live integration or action was introduced.
