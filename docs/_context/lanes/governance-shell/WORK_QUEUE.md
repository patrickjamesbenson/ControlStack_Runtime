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
* status: blocked (bootstrap review stop; GOV-001 complete)
* objective: a visible dev-view list of every consciously parked decision and why.
  Promote the mockup's decision registry mechanism to product shape. First entries:
  HubSpot two-connector deferral · private-app scope pre-check (PARKED, Patrick) ·
  two-factor auth · identity-first question (OPEN) · state→deal-floor mapping (OPEN).
* note: small, high leverage — deliberately first real parcel.

### GOV-003 Project persistence restoration (Work Shape item 4)
* status: blocked (depends-on: GOV-002 + Program seam decision)
* objective: execute `BRIEF_PROJECT_RESTORATION.md` — durable persistence (donor
  pattern: one JSON file per envelope, atomic writes, load on boot), real project
  identity replacing PROJECT_FIXTURES, nullable HubSpot link fields restored.
* first action: submit the seam decision request to Program (schema
  workspace_saved_project.v2, storage location, identity rules, migration, rollback).
  The brief is the proposed contract; do not implement before the decision.

### GOV-004 Single data retrieval point (Work Shape items 3 + 10)
* status: blocked (depends-on: GOV-001 + GOV-002; only explicit written Program
  reorder may change this)
* objective: one page every module's downloads pass through, opening after the Engine
  has run. Readiness and Identity as two separately named conditions. Loose validation
  by ruling ("bogus is fine, it's a net"). Discovery list of other modules' outputs.
  Internal stakeholder-coverage view. UI truth: the retrieval view in
  `MOCKUP_PROJECT_SHELL.html`.
* constraint (item 10, applies to everyone now): no module grows its own download
  path. Program communicates this to Selector & Engine; this lane builds the gateway.

### GOV-005 User module (Work Shape item 6)
* status: blocked (depends-on: GOV-004)
* objective: restore the donor identity/permissions shape (roles external_user /
  internal_user / internal_engineer / developer; permissions block). Lookup order is
  NVB FIRST, then HubSpot — never reversed. NVB decides view and access; HubSpot
  decides CRM presence (no match → leads pipeline, which is CRM lane scope).
  Permission model as ruled: view read-only · propose co-edit · handoff on accept ·
  locked enforced · signed-off permanent · internal override flagged and logged.
  Two-factor explicitly deferred (entry in GOV-002's panel).

### GOV-006 CRM & Integration scope
* status: held
* note: deal lifecycle, leads pipeline, sync and the private-app cutover are either a
  separate CRM lane or a later phase of this one — Program's call at the lane-split
  ruling. Blocked on Patrick's portal scope pre-check regardless. Do not start here.

### Cross-cutting, never a separate parcel
AI slots are added as each surface is built (named five-part slots, per the charter).
The six slots for this lane's surfaces are already specified in the mockup.
