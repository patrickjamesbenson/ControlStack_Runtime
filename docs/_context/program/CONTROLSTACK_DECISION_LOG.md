# ControlStack Program Decision Log

**Authority:** Append-oriented record of program-level decisions.  
**Rule:** Historical decisions are not silently rewritten. A correction or reversal requires a new dated entry that references the earlier decision.  
**State date:** 2026-07-17, Australia/Sydney.

## Evidence classes

- **VERIFIED** — observed in current repository or connected-app evidence.
- **REPORTED** — accepted coordination input not independently rechecked in the relevant lane.
- **INFERRED** — reasoned program conclusion.
- **UNKNOWN** — unresolved and not safe to assume.

---

## 2026-07-17 — Repository context is authoritative program memory

**Status:** ACCEPTED.  
**Evidence:** REPORTED global rule; adopted and versioned by this bootstrap.

### Decision

Chat history, worker conversation context, and pasted legacy handoffs are coordination input only. Authoritative current program memory lives in versioned repository documents under `docs/_context/`.

### Rationale

Chat state is incomplete, non-portable, difficult to audit, and can outlive the repository state it describes. A fresh orchestrator must be able to continue from repository evidence without depending on hidden or stale conversation history.

### Rejected alternatives

- Treat the latest chat as canonical state.
- Maintain one unversioned handoff outside the repository.
- Reconstruct state from commit subjects alone.

### Consequences

- Orchestrators and workers update the relevant context and handoff documents before a parcel is complete.
- Repository evidence overrides contradictory historical claims.
- Claims without direct evidence remain labelled `REPORTED`, `INFERRED`, or `UNKNOWN`.

### Seam impact

Applies to all lane-to-Program and Program-to-main handoffs.

---

## 2026-07-17 — One writer per worktree

**Status:** ACCEPTED.  
**Evidence:** REPORTED global rule; consistent with VERIFIED connected-app confinement.

### Decision

Only one active writer may modify a ControlStack worktree at a time. Workers are commissioned for one bounded task and may write only within their assigned lane root.

### Rationale

This prevents conflicting edits, hidden cross-task coupling, accidental staging of another worker's files, and unclear ownership of dirty state.

### Rejected alternatives

- Multiple workers editing the same worktree concurrently.
- Program patching feature lanes directly.
- Coordinating overlapping writes through chat alone.

### Consequences

- Orchestrators sequence workers rather than overlap writers in one lane.
- Dirty paths are assigned to a parcel or classified before another writer starts.
- Cross-lane fixes use separate producer and consumer parcels.

### Seam impact

All seams, especially lane parcel acceptance.

---

## 2026-07-17 — Program & Integrate is the sole gated integration path

**Status:** ACCEPTED.  
**Evidence:** REPORTED global rule. Current Program app gated commit/push and named gate are VERIFIED.

### Decision

Feature lanes may produce and push lane-local parcels, but Program & Integrate alone accepts cross-lane integration parcels. Feature lanes must not write main, Program, or another lane.

### Rationale

One integration authority provides ordering, seam review, reproducible gates, and an auditable acceptance record.

### Rejected alternatives

- Direct feature-lane merges to main.
- Cross-root copying as integration.
- Unreviewed cherry-picking based only on commit subjects.

### Consequences

- Every accepted parcel needs an exact source commit and gate evidence.
- Program independently verifies scope and runs `program-integrate`.
- This decision does not itself define or authorise final promotion to main; that procedure remains UNKNOWN and queued.

### Seam impact

Lane-to-Program and Program-to-main.

---

## 2026-07-17 — Commits and pushes remain gated

**Status:** ACCEPTED.  
**Evidence:** VERIFIED for CS Integrate; REPORTED globally.

### Decision

Staging is explicit and path-bounded. Commit and push occur only through controls that enforce branch identity and a green named gate. No arbitrary shell Git operations are permitted.

### Rationale

The gate must validate the actual staged parcel on the correct branch, and the resulting receipt must be auditable.

### Rejected alternatives

- Commit first and test later.
- Stage all changes with a wildcard.
- Force push or push from an unverified branch.

### Consequences

- Workers report exact staged paths.
- A failed gate leaves the parcel uncommitted.
- Unrelated dirt remains unstaged and preserved.

### Seam impact

All accepted parcels.

---

## 2026-07-17 — No arbitrary shell, deletion, movement, or cross-root copy

**Status:** ACCEPTED.  
**Evidence:** VERIFIED for CS Integrate; REPORTED globally.

### Decision

ControlStack work is performed through bounded app capabilities. Arbitrary shell execution, deletion, movement, and cross-root copy are not normal implementation or integration tools.

### Rationale

Path-constrained operations reduce accidental cross-worktree mutation and preserve evidence.

### Rejected alternatives

- General terminal access for convenience.
- Copying donor or lane files directly into another worktree.
- Cleaning unexplained files to obtain a green status.

### Consequences

- Missing capabilities produce an explicit blocked handoff or relay pack, not a manual workaround.
- Integration is commit/evidence based.
- Donor references remain read-only where configured.

### Seam impact

All filesystem and Git boundaries.

---

## 2026-07-17 — Preserve dirty worktrees; do not clean to simplify coordination

**Status:** ACCEPTED.  
**Evidence:** REPORTED global and Lab-specific protection.

### Decision

Existing modified and untracked work must be preserved and classified. Workers may stage only paths belonging to their bounded parcel. They must not reset, clean, overwrite, or absorb unrelated work.

### Rationale

Dirty state may contain valuable incomplete work. Destructive cleanup loses provenance and can make unrelated changes appear to belong to a new parcel.

### Rejected alternatives

- Require every lane to be clean before documentation work.
- Stage all changes and sort them out in review.
- Temporarily move untracked work outside the lane.

### Consequences

- Handoffs require a complete Git inventory grouped by functional parcel.
- Lab memory work must not stage intentional IES feature changes.
- Program rejects unexplained or unrelated staged paths.

### Seam impact

Lane handoff and acceptance.

---

## 2026-07-17 — Downstream-artifacts tunnel remains reserved and inactive

**Status:** ACCEPTED HOLD.  
**Evidence:** REPORTED global rule.

### Decision

Do not activate or implement the `downstream-artifacts` tunnel until the Engine output contract is explicitly declared stable through Program approval.

### Rationale

Early downstream coupling would freeze an unstable producer contract, spread fallback behaviour, and create expensive migrations.

### Rejected alternatives

- Activate behind a temporary undocumented payload.
- Let consumers infer fields from current runtime objects.
- Treat passing happy-path tests as contract stability.

### Consequences

Activation requires schema versioning, producer/consumer compatibility, idempotency, failure handling, and Program integration evidence.

### Seam impact

Engine output to downstream artifacts.

---

## 2026-07-17 — Secure tunnel restart automation is operational hardening

**Status:** ACCEPTED CLASSIFICATION.  
**Evidence:** REPORTED global rule.

### Decision

Secure tunnel restart automation is operational hardening, not feature implementation. It must be commissioned and accepted separately from product feature parcels.

### Rationale

Restart behaviour affects availability and diagnostics but should not change business semantics or be bundled into unrelated feature work.

### Rejected alternatives

- Treat restart automation as incidental feature work.
- Hide service failures with unlimited restarts.
- Couple restarts to feature-specific code paths.

### Consequences

The work remains held until an owner, health contract, backoff, failure surfacing, and operational acceptance path are defined.

### Seam impact

Service management and secure-tunnel operations.

---

## 2026-07-17 — Program memory bootstrap uses seven canonical files

**Status:** ACCEPTED FOR THIS PARCEL.  
**Evidence:** VERIFIED authorised task and VERIFIED absence of equivalent files.

### Decision

Create the seven canonical program documents under `docs/_context/program/`:

- `CONTROLSTACK_PROGRAM_STATE.md`
- `CONTROLSTACK_LANE_REGISTRY.md`
- `CONTROLSTACK_SEAM_CONTRACTS.md`
- `CONTROLSTACK_INTEGRATION_QUEUE.md`
- `CONTROLSTACK_DECISION_LOG.md`
- `CONTROLSTACK_ORCHESTRATION_CONTRACT.md`
- `CONTROLSTACK_PROGRAM_HANDOFF.md`

### Rationale

These separate current state, stable registry, seam contracts, queued work, historical decisions, operating rules, and replacement-orchestrator briefing without creating competing documents.

### Rejected alternatives

- One oversized handoff containing all concerns.
- Creating Selector or Lab lane-memory files from Program without direct lane verification.
- Reusing unrelated existing docs.

### Consequences

Future changes update the relevant canonical document. Selector and Lab establish their own lane-local context using their correct connected apps.

### Seam impact

Program memory and all later handoffs.

---

## 2026-07-17 — Connected-app evidence controls lane identity

**Status:** ACCEPTED.  
**Evidence:** VERIFIED by Program `repo_info`; reinforced by a contradictory mid-task coordination instruction.

### Decision

A user-supplied lane identity does not override the connected app's verified identity. Work must stop or remain in the verified lane when the requested target is a different worktree or branch.

### Rationale

The app is the enforced capability and root boundary. Treating pasted identity as stronger than tool evidence risks writing the wrong repository.

### Rejected alternatives

- Trust a pasted lane identity without running `repo_info`.
- Use another ControlStack app without an explicit tool cutover.
- Cross-write lane documentation from Program.

### Consequences

The Selector cutover authorisation received during this bootstrap is retained as coordination input but is not executed through CS Integrate. A Selector worker must run it in the verified Selector app.

### Seam impact

Worker commissioning and all lane-memory bootstraps.

## 2026-07-18 — Three-lane memory and managed deployment accepted

**Decision:** Accept the managed eight-service topology and the committed Program, Selector, and Lab memory documents as the authoritative starting point for new orchestrators.

**Evidence:** all eight services READY / MANAGED; Selector memory `678cf83c…` with 100/100; Lab memory `1b154c4…` with 147/147 and protected dirty inventory unchanged; Program tooling `2e72aa8…` with 26/26.

**Consequence:** Patrick is no longer the relay for historical handoff content. Each orchestrator reads its repository handoff. Chat history is non-authoritative. Feature work resumes independently inside the lane boundaries; Program governs only seams and integration.

**Held decision:** downstream-artifacts activation remains deferred until the Engine output contract is stable.

## 2026-07-18 — Shared MCP tooling authority is the dedicated tooling worktree

**Status:** ACCEPTED.

**Evidence:** Deployment v2 service manifest runs Selector, Lab, and Program MCP processes from `C:\ControlStack_Worktrees\controlstack-tooling-v2`. The Program worktree MCP source copy does not expose the lane-aware `repo_info` fields returned by the live service.

### Decision

Repairs to shared MCP behaviour must be implemented and accepted in the dedicated `lane/controlstack-tooling-v2` worktree. A similarly named source copy in Program or a feature lane is not deployment evidence and must not be patched as a substitute.

### Rationale

The Lab P2 Checkpoint 1 parcel proved that live commit behaviour can block a valid exact staged parcel while preserving unrelated dirty work. Repairing a stale copy would produce a misleading green commit without changing the running connector.

### Consequences

- Program records and commissions the tooling repair but does not cross-write the tooling worktree.
- The tooling parcel must preserve exact staged-path, gate, branch, deletion, and same-path unstaged-change guards while allowing unrelated modified/untracked paths to remain unstaged.
- The affected MCP service must be restarted and identity-verified before a blocked lane retries.
- Lab remains paused with its valid staged P2 Checkpoint 1 parcel intact until the live tooling repair is activated.

---

## 2026-07-19 — Program-local MCP canonical filename is a fail-closed tombstone

**Status:** ACCEPTED.

**Evidence:** The deployed MCP source remains `C:\ControlStack_Worktrees\controlstack-tooling-v2\tools\controlstack-mcp\controlstack_mcp.py` on `lane/controlstack-tooling-v2`. Program tests previously inspected and executed a stale-looking file at the same relative canonical filename inside `lane/program-integrate`.

### Decision

Preserve the Program-only MCP seam fixture as `tools/controlstack-mcp/controlstack_mcp_program_contract_snapshot.py`. Replace `tools/controlstack-mcp/controlstack_mcp.py` in the Program worktree with a fail-closed tombstone, and make the snapshot itself refuse direct server startup.

### Rationale

A full server implementation at the canonical filename could be mistaken for the deployed shared-tooling authority, patched incorrectly, or started by a legacy local launcher. An explicit snapshot name preserves Program contract tests while the tombstone makes the wrong maintenance and startup path fail visibly.

### Consequences

- Shared MCP behaviour is changed only in `lane/controlstack-tooling-v2`.
- Program tests and evidence probes may inspect or import the named contract snapshot, but may not deploy it.
- Legacy Program launchers that still target `controlstack_mcp.py` stop at the tombstone instead of starting stale code.
- Any future snapshot refresh requires a source-hash-evidenced sync parcel and the full `program-integrate` gate.

---

## 2026-07-19 — LAB-017 seam approval withheld pending an exact contract envelope

**Status:** HELD; NOT REJECTED.

**Evidence:** Current Lab coordination reports that LAB-016 offline fixture snapshot is complete and pushed, all focused/full/feature/documentation checks passed 159/159, the final Lab tree has zero staged, zero modified, 33 protected untracked, and zero deleted paths, and no Lab queue item is ready. Program memory contains no definition of LAB-017, no old/new seam contract, no producer/consumer impact, and no exact files or acceptance envelope for that item.

### Decision

Do not authorise LAB-017 implementation from its identifier alone. LAB-017 remains held until the Lab lane records and supplies an immutable seam-approval envelope that names the business objective, producer and consumer, old and proposed contract, exact files in and out of scope, dependency on LAB-016, compatibility and rollback rules, focused tests, `lab-ies` gate, dirty-worktree protections, and expected commit/handoff evidence.

### Rationale

Program approval attaches to a defined contract change, not a queue number. Approving an undefined item would bypass the seam rules, make consumer impact unknowable, and prevent Program from distinguishing a backwards-compatible addition from a breaking change.

### Consequences

- LAB-016 is accepted as a completed lane-local checkpoint on the reported evidence; this is not main promotion or cross-lane acceptance.
- The reusable Lab worker prompt is accepted as lane-local orchestration memory and does not itself require seam approval.
- No LAB-017 implementation may begin while the item remains held.
- The Lab orchestrator owns producing the exact approval envelope in lane memory; Program owns the subsequent approve/decline decision.
- Patrick has no manual repository action in this boundary.
