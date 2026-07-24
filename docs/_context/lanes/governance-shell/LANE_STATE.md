# Governance & Shell Lane State
*Live canonical state, verified 2026-07-22.*

## Identity — VERIFIED
- Lane: `governance-shell`
- Root: `C:\ControlStack_Worktrees\governance-shell`
- Branch: `lane/governance-shell`
- Gate: `governance-shell`
- MCP: shared `controlstack_mcp.py`, scoped by env vars (same pattern as other lanes)
- Write scope: this worktree only; context writes limited to
  `docs/_context/lanes/governance-shell/`
- Recorded branch HEAD: `0fdcba270a9b296219c91560aa055dc70aae8644`
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
persistence and user identity/permissions are complete. Deferred-decision registry
version 1.2.0 now records Patrick's finishes default-acceptance ruling as RULED: inherited and auto-filled defaults require one explicit `Accept all defaults` acknowledgement before Build Ready; per-field acknowledgement is not required.
No implementation parcel is ready. SS-1 is registered but blocked pending SS-1G managed write-guard activation. CRM mutation remains held and two-factor authentication remains deferred.

## Sales Signals programme registration — pending activation
- Programme: SALES SIGNALS (MODULE 06), brief SALES_SIGNALS r0.4 plus accepted owner response.
- Governance owns external CRM orchestration under the existing Boundary Ruling.
- Planned writer scope: `packages/modules/sales-signals/**`, `tests/salesSignals*.test.js`, `docs/sales-signals/**`, and lane context.
- SS-1 deliverables: opportunity-signal schema document; deterministic keyword-classification harness; correction corpus over manually supplied alerts.
- SS-1 excludes mailbox automation, EstimateOne API, live HubSpot writes, Selector surface and shell registration.
- Mailbox read-only extraction, Lusha/credits, and HubSpot Research-pipeline/Leads checks are separately gated infrastructure actions.
- Module 06 shell registration remains deferred behind Selector seam work; Selector receives schema-document boundary only.
- Separate CRM lane remains deferred until load evidence exists.
- Current blocker: Advisor activation and Program acceptance of the live Governance MCP guard.

## Evidence
- Bootstrap and deferred-decisions closeouts remain intact.
- Patrick's finishes default-acceptance ruling is visible and settled: looked-up defaults remain distinct from manual constraints, and one explicit `Accept all defaults` action acknowledges every flagged default before Build Ready.
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
