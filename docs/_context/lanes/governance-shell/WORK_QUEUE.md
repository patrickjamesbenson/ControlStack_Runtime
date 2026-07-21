# Governance & Shell — Work Queue
*Drafted 2026-07-20, pre-approval. The orchestrator owns this file once the lane is live.*
**Status model:** `ready`, `blocked`, `held`, `done`. One `ready` item at a time.

### GOV-001 Lane bootstrap and canonical context
* status: done (2026-07-21)
* objective: commit the canonical context files (charter, queue, state, handoff) at
  `docs/_context/lanes/governance-shell/`; verify identity, branch, gate and write
  scope; run the lane gate once green; record the standing prompts as authoritative.
* acceptance: canonical files committed and pushed on `lane/governance-shell`; gate
  green; LANE_STATE records identity and HEAD.
* closeout: identity, branch, registered gate, write scope, clean tree and recorded
  branch HEAD verified; fixed lane gate green; canonical lane memory committed and
  pushed.

### GOV-002 Deferred-decisions panel (Work Shape item 9)
* status: done (2026-07-21)
* objective: a visible dev-view list of every consciously parked decision and why.
  Promote the mockup's decision registry mechanism to product shape. First entries:
  HubSpot two-connector deferral · private-app scope pre-check (PARKED, Patrick) ·
  two-factor auth · identity-first question (OPEN) · state→deal-floor mapping (OPEN).
* note: small, high leverage — deliberately first real parcel.
* closeout: versioned static registry and read-only developer panel landed with six
  canonical entries, named ownership, reasons and citations. The identity-first and
  state-to-deal-floor questions remain OPEN. Patrick later ruled finishes default
  acceptance: inherited and auto-filled defaults require one explicit `Accept all defaults`
  acknowledgement before Build Ready; per-field acknowledgement is not required. No action,
  persistence, CRM, retrieval or Engine behaviour was added.

### GOV-003 Project persistence restoration (Work Shape item 4)
* status: done (2026-07-22; Program seam approved)
* objective: execute `BRIEF_PROJECT_RESTORATION.md` — durable persistence (donor
  pattern: one JSON file per envelope, atomic writes, load on boot), real project
  identity replacing PROJECT_FIXTURES, nullable HubSpot link fields restored.
* closeout: canonical `workspace_saved_project.v2` records, server-authoritative
  one-file-per-project storage, atomic replacement, bounded save/read routes,
  browser cache after server success, explicit migration and rollback landed. Fixture
  truth is absent; passive CRM identifiers round-trip without provider activity;
  malformed records and unsafe identities fail closed. Fixed lane gate passed 175/175.

### GOV-004 / Program GOV-001 — Inert single data retrieval point (Work Shape items 3 + 10)
* status: done (2026-07-21; explicit Program reorder)
* objective: one canonical Governance-owned retrieval view-state with readiness and
  identity as separately named conditions, static discovery descriptions and no live
  cross-module read.
* closeout: versioned immutable contract returns no-useful-output, project-required,
  identity-required and ready-for-future-retrieval states. Ready is not permission:
  download, delivery, routes, filesystem, persistence, email, CRM and Engine invocation
  remain false. The prior shell-owned browser download action is now permanently inert;
  preview surfaces remain read-only. Fixed lane gate passed 152/152.
* constraint (item 10, applies to everyone now): no module grows its own outward
  download path; all future retrieval terminates through Governance.

### GOV-005 User module (Work Shape item 6)
* status: done (2026-07-22)
* objective: restore the donor identity/permissions shape (roles external_user /
  internal_user / internal_engineer / developer; permissions block). Lookup order is
  NVB FIRST, then HubSpot — never reversed. NVB decides view and access; HubSpot
  decides CRM presence (no match → leads pipeline, which is CRM lane scope).
* closeout: one versioned Governance identity/permissions contract and one existing
  identity-service integration now enforce NVB-first lookup, HubSpot presence-only
  follow-up, canonical four-role authority, immutable permission lifecycle, flagged and
  logged internal override, and no-match leads deferral. No provider write, hard email
  verification, two-factor, Engine eligibility or technical-readiness change was added.
  Fixed lane gate passed 181/181.

### GOV-006 CRM & Integration scope
* status: held
* note: deal lifecycle, leads pipeline, sync and the private-app cutover are either a
  separate CRM lane or a later phase of this one — Program's call at the lane-split
  ruling. Blocked on Patrick's portal scope pre-check regardless. Do not start here.

### Cross-cutting, never a separate parcel
AI slots are added as each surface is built (named five-part slots, per the charter).
The six slots for this lane's surfaces are already specified in the mockup.
