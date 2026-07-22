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

---

## 2026-07-19 — Selector Tier authority relocation approved with conditions

**Status:** APPROVED WITH CONDITIONS.

**Evidence:** The Selector & Engine lane reports read-only diagnosis proving that project registration and candidate construction currently require a manually committed Tier before Engine execution. The lane further reports that Tier is an Engine/Lex consequence derived only after execution, making the existing requirement unsatisfiable and blocking all Engine work. Program has not independently inspected the Selector worktree through this connection; the diagnosis is accepted as the producing lane's current evidence and must be re-proved by the implementation parcel.

### Old contract

Selector-side registration eligibility and candidate mapping require Tier as manually committed Selector input before the server-owned Engine/Lex execution boundary.

### Approved contract

Selector-side registration eligibility and candidate construction must not require or treat Tier as Selector input. Tier authority moves to the existing server-owned Engine/Lex execution boundary, where Tier is derived deterministically from source-backed candidate inputs and versioned Engine/Lex policy. Tier remains an execution consequence and downstream result, not user-entered or Selector-fabricated project truth.

### Conditions

1. No default, fallback, guessed, cached, UI-manufactured, or automatically selected Tier is permitted.
2. Caller-supplied or stale client Tier must not become authoritative or override the derived result; the parcel must prove this fail-closed behaviour.
3. When Tier cannot be derived uniquely from valid source-backed inputs, execution must stop with a specific Tier-derivation blocker rather than a generic eligibility refusal.
4. All other required Selector inputs, source authority, read-only/no-write behaviour, and the prohibition on automatic Control selection remain unchanged.
5. The Selector candidate schema/fixture and blocked/error semantics must be versioned or explicitly documented, with tests for Tier absence, stale Tier injection, successful derivation, ambiguous/unavailable derivation, and preservation of every other required field.
6. The downstream Tier result field name, meaning, and authority must remain compatible. Any change to its output shape or semantics requires a separate Program seam decision.
7. Completion evidence must include exact changed paths, focused tests, live or sealed registration/invocation proof, `selector-engine` green, immutable commit and push, final Git state, and updated Selector handoff.

### Affected lanes

- Selector & Engine owns this implementation across Seam A and the server-owned Engine/Lex boundary in Seam B.
- Program memory does not identify a current Lab dependency on Tier by name. Lab & IES must nevertheless be treated as a potential downstream consumer of the derived Tier result. No Lab implementation is authorised by this decision; if Lab reads Tier, it must provide separate compatibility evidence before Program declares the producer contract stable.

### Rollback

Rollback restores the prior implementation only as a diagnostic baseline; it must not be reactivated as an accepted contract because manual pre-Engine Tier remains logically unsatisfiable. A failed implementation must instead remain blocked while preserving the approved authority model.

---

## 2026-07-19 — LAB-017 version-1 seam envelope approved unchanged

**Status:** APPROVED; LAB-017 MAY MOVE FROM BLOCKED TO READY.

**Supersedes:** The earlier LAB-017 hold remains historical evidence but is no longer the current decision.

**Evidence classification:** The Lab lane reports that the immutable version-1 seam envelope is committed, no implementation has started, no other seam is included, and the full `lab-ies` gate passes 159/159. The present Program app cannot independently inspect the Lab branch, so the envelope contents and gate receipt remain `REPORTED` until the implementation parcel is submitted for acceptance.

### Approved envelope

Program approves the committed LAB-017 version-1 envelope unchanged, limited to:

- the exact public interface and data shapes recorded in that envelope;
- the exact two-file implementation boundary recorded in that envelope;
- the complete current-consumer list and the compatibility break expressly accepted by that envelope;
- the recorded safe rollback sequence; and
- the recorded success, rejection, immutability, leak-prevention, and boundary tests.

### Authority boundary preserved

Program retains production serial allocation, resolver hosting, route-to-storage mapping, persistence, authentication, deployment, and endpoint ownership. LAB-017 may define and implement only the bounded Lab-side seam described by the approved envelope. It may not introduce production allocation, host a resolver, add or change routes, select storage, persist production state, authenticate callers, change deployment, or own an endpoint.

### Execution constraints

1. The Lab orchestrator may change LAB-017 from `blocked` to `ready` and commission exactly one worker under the committed envelope.
2. Before implementation starts, Lab lane memory must cite both the exact immutable envelope commit and this Program approval commit.
3. The worker may change only the two authorised implementation files and the required Lab context closeout files; all protected dirty paths remain excluded.
4. The public interface, data shapes, consumer break, rollback, tests, and ownership split must not drift from version 1. Any drift or extra seam returns LAB-017 to blocked and requires a new Program decision.
5. Completion evidence must include focused tests for every envelope test class, full `lab-ies` green, exact staged-set proof, immutable commit and push, final Git inventory, and updated Lab handoff.

### Consumer and rollback treatment

The compatibility break is accepted only for the current consumers explicitly named in the version-1 envelope. Unlisted or newly discovered consumers are not silently included. Rollback must follow the envelope sequence and restore the pre-LAB-017 Lab behaviour without altering Program-owned production services or data.

### Decision

No amendments are required. LAB-017 is authorised to move to `ready` unchanged.

---

## 2026-07-19 — LAB-017 implementation completion received; Program acceptance pending immutable receipt

**Status:** LAB IMPLEMENTATION COMPLETE AS REPORTED; PROGRAM ACCEPTANCE NOT YET CLOSED.

**Reported evidence:** The Lab lane reports that LAB-017 was implemented under the approved version-1 envelope; only the reference/resolver helper and its dedicated test were committed; focused validation, full validation, feature commit, and documentation closeout all passed 169/169; the feature and documentation checkpoints were pushed only to `lane/code-pilot-lab`; and final state is zero staged, one expected HEAD-marker edit, 32 protected untracked, and zero deleted paths. At that time LAB-018 remained blocked, no queue item was ready, and no LAB-018 implementation had started.

### Decision

Accept this as a lane-completion notification, not yet as the immutable Program acceptance return required by the approved envelope. Program acceptance of LAB-017 remains pending the exact envelope commit, feature commit, documentation closeout commit, exact two implementation path names, exact staged-set proof, and final classified Git receipt. The current Program connection cannot independently resolve the Lab branch, so those identifiers must be carried in the Lab handoff before acceptance can close.

### LAB-018

At that point LAB-018 remained blocked because Program memory contained no LAB-018 seam envelope. That historical hold is superseded by the consolidated seven-seam decision recorded below.

### Consequences

- No LAB-017 rework is commissioned from this receipt.
- The reported 169/169 result and protected dirty-tree state are preserved as coordination evidence.
- LAB-018 may not move to `ready` until its separate seam envelope is approved.
- Patrick has no manual action.

---

## 2026-07-20 — LAB-017 final Program acceptance

**Status:** ACCEPTED AS AN IMMUTABLE LAB PARCEL; PROMOTION REMAINS SEPARATE.

**Evidence classification:** The Lab lane reports that its handoff now records the exact immutable LAB-017 envelope, feature, and documentation closeout receipts, exact implementation paths, exact staged-set proof, final classified Git state, push evidence, and a green 169/169 `lab-ies` gate. The current Program app cannot independently resolve the Lab branch, so the receipt remains `REPORTED` evidence bound to the immutable Lab handoff.

### Decision

Program closes final LAB-017 acceptance. The implementation is accepted as conforming to the approved version-1 seam envelope, its exact two-file implementation boundary, named compatibility break, rollback sequence, ownership split, and required test classes. No rework or further seam approval is required for LAB-017.

### Boundaries and next state

- This acceptance does not promote the parcel to `main`; promotion remains subject to the separate Program promotion path and tooling capability.
- Program retains production serial allocation, resolver hosting, route-to-storage mapping, persistence, authentication, deployment, and endpoint ownership.
- At that point LAB-018 still required its own immutable seam envelope; this is superseded by the consolidated approval below.
- Patrick has no manual action.

---

## 2026-07-20 — Consolidated approval for seven blocked Lab seams

**Status:** ALL SEVEN SEAMS APPROVED; IMPLEMENTATION REMAINS STRICTLY SEQUENTIAL.

**Evidence classification:** The Lab lane reports that one immutable consolidated envelope now defines all seven blocked seams and that the full `lab-ies` gate passes 169/169. The current Program app cannot independently resolve the Lab branch, so the envelope and gate receipt remain `REPORTED` evidence until each immutable implementation parcel is returned for acceptance.

### Six ordinary seams

Program approves unchanged the six non-kernel seams exactly as recorded in the consolidated envelope. Their approved public interfaces, data shapes, file boundaries, consumers, compatibility rules, rollback sequences, ownership splits, prohibitions, and test obligations may not drift without a new Program decision.

### Governed reference-composition kernel

Program approves the governed reference-composition kernel only under all of these mandatory conditions:

1. Each composition has exactly two unique parent references. The same parent cannot occupy both positions, and neither parent may already be a merged or composed reference.
2. Parent order is provenance-significant. The first and second parent identities, roles, and order must be preserved exactly and must remain observable in the immutable result metadata.
3. Both parents must have exactly matching photometric grids. Angle sets, dimensions, and sample positions must match exactly; interpolation, resampling, grid repair, tolerance-based alignment, or silent normalisation is prohibited.
4. Allocation, authority, approval, and sealing remain entirely outside the kernel. The kernel may validate and compose only; it may not allocate production identities, claim authority, approve a result, seal an artifact, persist production state, host a resolver, own an endpoint, authenticate callers, or control deployment.

The kernel must fail closed with specific rejection outcomes for duplicate parents, pre-merged parents, missing or reordered provenance, non-identical grids, and any request that attempts to cross the external governance boundary.

### Sequencing and acceptance

- This decision seam-approves all seven parcels but does not authorise parallel implementation.
- The Lab orchestrator may move only the next queue parcel to `ready`; the remaining approved parcels stay sequence-blocked until the current parcel is committed, pushed, closed out, and the lane is safe to advance.
- Each parcel must cite the exact consolidated-envelope commit and this Program approval commit before implementation begins.
- Each parcel remains independently bounded and must return its own exact paths, focused tests, full `lab-ies` receipt, staged-set proof, immutable commit and push, final Git inventory, and updated handoff.
- Any additional seam, widened file scope, altered consumer set, interface drift, or weakened kernel condition requires a new Program decision.

### Decision

No amendments are required. The six ordinary seams are approved unchanged, and the governed reference-composition kernel is approved with the four conditions above. The prior LAB-018 hold is superseded by this consolidated approval, but one-parcel-at-a-time sequencing remains mandatory. Patrick has no manual action.

---

## 2026-07-20 — LAB-029 provenance publication seam envelope approved unchanged

**Status:** APPROVED; LAB-029 MAY MOVE FROM BLOCKED TO READY UNDER THE EXISTING SEQUENTIAL QUEUE RULE.

**Envelope checkpoint:** `7b74ca49665007311f6dbb8cfdccc47be5472353`.

**Queue item:** `LAB-029-provenance-publication-surfaces`.

**Evidence classification:** The Lab lane reports that the immutable version-1 seam envelope is committed, only Lab documentation was checkpointed, no implementation has started, and `lab-ies` passes 255/255 with no failed, cancelled, skipped, or todo tests. The present Program app cannot independently resolve the Lab branch, so the checkpoint and gate receipt remain `REPORTED` evidence until the implementation parcel returns.

### Approved implementation boundary

Program approves version 1 unchanged for exactly these presentation files:

- `packages/lab-kernel/ies-toolkit/provenance.html`
- `packages/lab-kernel/ies-toolkit/provenance_explorer.html`
- `packages/lab-kernel/ies-toolkit/luminaire_provenance.html`

The implementation may consume only the existing approved safe sealed-reference identity projection, canonical host-free resolver paths, and the evidence-capability summary. Emergency and EWIS assembly verification must remain `null` unless a future separately approved evidence seam changes that contract.

### Publication states

1. Governed mode consumes only Program-supplied safe identity and resolver-availability projections.
2. Offline fixture mode consumes only committed safe fixture projections and remains visibly labelled `OFFLINE DEMO — UNAPPROVED`.

### Preserved ownership and publication boundaries

LAB-029 does not own or implement serial allocation or sealing; resolver origin, hosting, endpoints, or route-to-storage mapping; persistence, authentication, or deployment; evidence acceptance; raw evidence, origin IES, or source-body publication; private authority reconstruction; or emergency/EWIS assembly verification.

The implementation must not restore a hard-coded host, direct raw-body fetch traversal, local-path exposure, diagnostic fingerprint authority claims, fabricated seal chains, generated dates, or positive authority wording over fixture data.

### Execution and acceptance

No amendment is required. The Lab orchestrator may move LAB-029 to `ready` only when it is the next eligible parcel and no other Lab parcel is active. Implementation must remain within the exact three-file boundary, with required lane-context closeout recorded separately. Completion must return focused publication-state, leak-prevention, null-capability, and boundary evidence; full `lab-ies` green; exact staged-set proof; immutable feature and documentation receipts; final classified Git state; and updated Lab handoff. Any view-model, ownership, resolver-semantic, publication-state, or file-scope drift requires a new Program decision.

---

## 2026-07-20 — Lab canonical-keyword migration guard correction approved before LAB-033

**Status:** APPROVED; THE TEST-ONLY CORRECTIVE PARCEL BECOMES THE SOLE READY LAB ITEM BEFORE LAB-033 RESUMES.

**Evidence classification:** The Lab lane reports that the full gate passes 253/255 and that the two failures come from stale migration-guard assertions requiring retired Main Bench presentation details: an editable internal-ambient write and literal `canonicalKeywordRows(...)` helper text. The current Program app cannot inspect the Lab branch, so the failure diagnosis remains `REPORTED` until the corrective parcel returns.

### Exact authorised scope

- `tests/lab-kernel/iesKeywordMigration.test.js`

No production module, bench implementation, authority contract, sealed-reference schema, Selector, Runtime, Engine, or Program implementation file is authorised.

### Approved correction

The test may remove requirements for the retired editable `sysTa` ambient write and literal dependence on the retired `canonicalKeywordRows(...)` helper shape. It must continue to:

- enforce the exact ordered 16-keyword profile;
- reject `_AMBIENT_TA_C`, supplementary keywords, and aliases;
- require the Main Bench to consume the committed canonical keyword contract;
- require `_INTERNAL_AMBIENT_TA_C` to remain sealed-reference-owned and non-editable; and
- retain generator, merge, summary, and project-builder canonical-vocabulary checks.

### Preserved authority rule

This approval corrects stale test coupling only. It does not permit Main Bench creation or editing of authority-owned ambient, does not weaken the safe non-authoritative LAB-033 bench, and does not replace contract-behaviour assertions with presentation-text assertions.

### Mandatory sequence

1. Make this one-file corrective parcel the sole ready item.
2. Run the full `lab-ies` gate and commit the test correction separately.
3. Close the corrective parcel's lane documentation in a separate commit.
4. Return LAB-033 as the sole ready item and rerun its full gate.
5. Keep the later final keyword-guard parcel reserved for final cross-cutting coverage after LAB-033 is committed.

LAB-033 remains incomplete, unstaged, unpushed, and paused during the correction. Any production-file change, wider test scope, ambient-authority change, canonical-profile change, or sequencing drift requires a new Program decision.

---

## 2026-07-20 — LAB-033 and LAB-034 accepted; LAB-035 Selector-contract seam approved unchanged

**Status:** LAB-033 AND LAB-034 ACCEPTED COMPLETE; LAB-035 VERSION 1 APPROVED AS THE NEXT SOLE READY LAB PARCEL.

**Verified Lab evidence:**

- canonical-keyword correction feature and closeout are pushed;
- LAB-033 Main Lab Bench feature and closeout are pushed;
- LAB-034 legacy Lab Bench classification feature and closeout are pushed;
- full `lab-ies` passes 255/255;
- final protected inventory remains zero staged, one expected HEAD-marker edit, seven protected untracked items, and zero deleted paths;
- immutable LAB-035 seam envelope checkpoint: `1c422dec0cb4efb0777d61bebcf6cf4ee9a33a5f`.

### Completion acceptance

LAB-033 is accepted as a non-authoritative, module-driven Main Lab Bench. LAB-034 is accepted as a read-only compatibility inspector with duplicate approval, sealing, reference-building, symmetrisation and project-generation behaviour removed. Neither parcel moved production authority, persistence, routing, Selector, Runtime or Engine ownership into Lab.

### LAB-035 exact authorised scope

- `packages/lab-kernel/ies-toolkit/selector_stub.html`

The page is a read-only contract viewer only. It may validate and display the exact version-1 `controlstack.lab.selector-contract-view.v1` projection defined by the immutable envelope. It must not compute, default, select, scale, rotate, generate, persist, resolve, invoke Engine or claim Selector acceptance.

### Approved inputs and states

The view may display only:

- the approved `controlstack.lab.reference-identity.v1` safe identity projection;
- the approved `controlstack.lab.safe-runtime-handoff.v1` safe summary;
- the bounded `controlstack.runtime.selector.factory-approved-inputs.presentation.v1` display projection;
- exact reference-id and authority-hash binding state;
- unresolved fields and false safety flags.

Governed mode consumes a caller-supplied safe bundle only and performs no lookup. Offline mode uses only the committed embedded fixture and must display `OFFLINE CONTRACT DEMO — NOT SELECTOR ACCEPTANCE` persistently.

### Fail-closed and ownership rules

Malformed schemas, unsupported fields, stale identity/hash binding, contradictory readiness/blocker states, non-false safety flags and over-rich inputs fail closed. Lab may not import or execute Selector source, copy Selector vocabulary/defaulting logic, accept raw authority/candela/IES/RuntimeData rows, add routes or persist state. Selector retains all state, option generation, readiness and Engine applicability authority; Program retains integration, routing, deployment and adapter ownership; Lab retains reference authority and safe-handoff construction.

### Execution and acceptance

LAB-035 may move from `blocked` to `ready` as the sole active Lab parcel. Exactly the authorised HTML file may be committed as `lab: checkpoint Selector contract stub`, followed by a separate lane-documentation closeout. Full `lab-ies` must remain green and the protected inventory must be preserved. Any extra file, live integration, computation, Selector logic, acceptance claim or contract-shape drift requires a new Program decision.

---

## 2026-07-20 — Binding thermal-chain ownership ruling

**Status:** APPROVED AS THE SINGLE CROSS-LANE THERMAL CONTRACT; SEL-018 MUST BE AMENDED BEFORE IMPLEMENTATION.

**Correction and supersession:** Any earlier Program text or receipt that treated legacy `optic_internal_delta_ta_c` or semantic `opticInternalDeltaTaC` as the rise is void. The legacy field is absolute internal temperature; legacy `optic_uplift_ta_c` is the rise. This corrected section is the sole active thermal ruling.

### Authoritative chain

For one selected optic:

1. Selector supplies only the user-selected room ambient, `selectedRoomTaC`.
2. Lab supplies the measured optic thermal evidence through unambiguous semantic fields:
   - `referenceRoomTaC` — ambient measured during the Lab thermal test, sourced from legacy `room_ta_c`;
   - `referenceInternalTaC` — absolute internal assembly temperature measured during that same test, sourced from the misleadingly named legacy `optic_internal_delta_ta_c`;
   - `opticThermalRiseTaC` — the actual measured rise, sourced from legacy `optic_uplift_ta_c` and exactly equal to `referenceInternalTaC - referenceRoomTaC`.
3. Engine alone calculates `derivedInternalTaC = selectedRoomTaC + opticThermalRiseTaC`.
4. Engine uses `derivedInternalTaC` as the temperature input to the board lumen/temperature curve lookup.
5. Engine returns the verified temperature-adjusted lm/m result and the safe derivation summary.

Example binding behaviour:

- Lab evidence: room 25°C, internal 35°C, rise 10°C.
- Legacy `optic_internal_delta_ta_c = 35` means the absolute internal temperature at the 25°C reference room condition; it is not a delta and must never be added to room ambient.
- Legacy `optic_uplift_ta_c = 10` is the actual rise used by Engine after evidence and optic identity are validated.
- Because the current thermal values are identical across optic rows, they do not prove a per-optic lookup path; acceptance must vary one fixture row's `optic_uplift_ta_c`.
- User room selection 25°C -> Engine derives 35°C -> curve lookup at 35°C.
- User room selection 35°C -> Engine derives 45°C -> curve lookup at 45°C.

### Single owner per step

- **Selector owns:** capture, validation and unchanged transmission of room ambient only.
- **Lab owns:** measured thermal evidence and the per-optic rise datum. Lab does not calculate a user-specific operating internal temperature.
- **Engine owns:** the one-time addition, the resulting lookup temperature, curve lookup, clamping/interpolation and verified lm/m output. Under this version-1 ruling, `curveLookupTaC` equals `derivedInternalTaC`; any later board-to-internal temperature transform requires a new seam decision.
- **Program owns:** the cross-lane adapter contract, provenance checks and acceptance gate.

No other lane may apply the rise or substitute a combined temperature.

### Lab publication rule

Lab publishes the measured triplet and provenance, not only an already-combined number:

- optic identity/reference binding;
- `referenceRoomTaC`;
- `referenceInternalTaC`;
- `opticThermalRiseTaC`;
- measurement/evidence reference and authority state.

The triplet must satisfy `referenceRoomTaC + opticThermalRiseTaC === referenceInternalTaC` exactly after canonical decimal normalisation. Otherwise it fails closed. Lab may display all three values but must not publish a user-specific `derivedInternalTaC`.

The ambiguous semantic name `opticInternalDeltaTaC` is prohibited in new cross-lane contracts. Until the source model is migrated, Program adapters must map legacy `optic_internal_delta_ta_c` to `referenceInternalTaC` and legacy `optic_uplift_ta_c` to `opticThermalRiseTaC`. The recommended source-model rename is `optic_reference_internal_ta_c` and `optic_thermal_rise_ta_c`.

The sealed-reference `_INTERNAL_AMBIENT_TA_C` keyword remains the Lab authority-test internal measurement, not the runtime-derived operating temperature. Runtime derivation must use a separate Engine-owned field and must never overwrite or reinterpret the sealed test value.

### Selector contract amendment

SEL-018 as currently described is blocked. It must not send room ambient as the curve lookup temperature. The amended Selector output contains room ambient only and must not contain:

- `derivedInternalTaC`;
- `curveLookupTaC`;
- a client-supplied optic rise;
- board temperature;
- verified lm/m.

Any supplied derived or lookup temperature fails closed at the Program/Engine boundary.

### Binding tests

Acceptance must prove all of the following:

1. Baseline: Lab 25°C room plus 10°C rise produces a 35°C Engine lookup.
2. User variation: selected room 35°C with the same optic produces a 45°C Engine lookup.
3. Per-optic lookup: one fixture optic must use a deliberately different legacy `optic_uplift_ta_c` value; with identical room ambient and curve data, the derived lookup temperature and lm/m output must change.
4. Legacy-name guard: a fixture containing `room_ta_c = 25`, `optic_internal_delta_ta_c = 35` and `optic_uplift_ta_c = 10` must resolve to a 10°C rise, never a 35°C rise.
5. No constant: the test must fail if the implementation hardcodes 35, hardcodes 10, or reads the legacy internal-temperature field as the rise.
6. No double count: the rise is applied exactly once.
7. Provenance: the rise must be bound to the selected optic identity and the accepted Lab evidence/reference.
8. Fail closed: missing, malformed, contradictory or unbound thermal evidence blocks verification.
9. Clamping: only Engine may clamp the final derived lookup temperature to the supported 25–65°C curve range, while preserving both the unclamped derived value and clamp state in the safe summary.

### Parity audit rule

The planned lm/m parity audit must compare Runtime behaviour against the approved data model and these equations. Donor code is not an acceptance oracle because it contains the same inherited omission. Donor comparison may be recorded only as historical evidence, never as proof of correctness.

No Selector, Lab or Engine feature implementation is authorised by this ruling. Each affected parcel must cite this decision and return for scope approval if its existing seam conflicts with it.

---

## 2026-07-21 — SEL-018 corrected room-ambient amendment approved

**Status:** APPROVED AS THE SOLE READY SELECTOR PARCEL; ENGINE THERMAL DERIVATION AND LAB THERMAL PUBLICATION REMAIN BLOCKED.

### Repository finding

The current Selector readiness preview already captures the selected ambient as intent, but the read-only Engine candidate mapper omits it and an existing regression explicitly permits mapping without Ambient. That is the exact stale seam corrected by this parcel.

### Exact authorised scope

- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `tests/selectorReadonlyEngineCandidateMapper.test.js`

No `packages/modules/cs-selector/**` wildcard or additional Selector module file is authorised. The existing narrow Selector write guard remains unchanged.

### Corrected contract

SEL-018 must read the committed, source-backed ambient choice, canonicalise only its Celsius numeric representation and emit exactly one semantic field: `selectedRoomTaC`.

The value remains the user's room ambient. Selector must not add, subtract, clamp, interpolate, default or substitute any thermal value. The candidate must not contain `referenceRoomTaC`, `referenceInternalTaC`, `opticThermalRiseTaC`, `opticInternalDeltaTaC`, `derivedInternalTaC`, `curveLookupTaC`, board temperature or verified lm/m.

A missing, malformed, duplicate, non-committed or non-source-backed ambient choice fails closed for the amended thermal handoff. A valid selected room value is preserved without applying the Engine's 25–65°C curve clamp.

### Acceptance

Focused Selector tests must prove:

1. `25°C` emits `selectedRoomTaC: 25`.
2. A second selected value such as `35°C` emits `selectedRoomTaC: 35` without any thermal calculation.
3. Missing or malformed ambient blocks the candidate.
4. No derived, lookup, rise, reference-internal, board-temperature or verified-output field is emitted.
5. Existing tier, run, target lm/m, CCT/CRI, optic and control mapping remains unchanged.
6. No route, write, persistence, Engine execution, Lab lookup or RuntimeData mutation is added.

The varied-optic `optic_uplift_ta_c` proof belongs to the later Lab/Engine acceptance parcel and is not implemented or simulated here.

### Queue effect

SEL-018 is amended from blocked to ready as the sole active Selector parcel. LAB-035 remains the sole active Lab parcel independently. No Engine thermal parcel is ready until SEL-018 and the corrected Lab evidence publication both return accepted receipts.

---

## 2026-07-21 — LAB-038 to LAB-042 corrected thermal semantics envelope approved unchanged

**Status:** APPROVED UNCHANGED; LAB-038 IS THE SOLE READY LAB PARCEL AND LAB-039 THROUGH LAB-042 REMAIN SEQUENCE-BLOCKED.

### Verified proposal

Program reviewed the pushed Lab coordination checkpoint `docs(lab): propose corrected thermal semantics seam`, including `LAB-038_042_THERMAL_SEMANTICS_SEAM_ENVELOPE.md`, version 1, and the full 255/255 Lab gate receipt.

The proposal correctly applies the binding thermal ruling:

- legacy `room_ta_c` maps only to `referenceRoomTaC`;
- misleading legacy `optic_internal_delta_ta_c` maps only to absolute `referenceInternalTaC`;
- legacy `optic_uplift_ta_c` maps only to `opticThermalRiseTaC`;
- exact canonical-decimal triplet consistency is mandatory;
- varied-optic proof changes legacy `optic_uplift_ta_c`;
- Lab emits no user-specific derived temperature, lookup temperature, clamp, board temperature or verified lm/m;
- `_INTERNAL_AMBIENT_TA_C` remains the authority-test internal measurement;
- no version-1 semantic output alias is approved.

### Exact approved parcels

1. LAB-038: resolution schema version 2 in exactly the resolution module and its focused test.
2. LAB-039: component catalogue schema version 2 in exactly the component projection module and its focused test.
3. LAB-040: Lab working projection schema version 2 in exactly the Lab adapter and its focused test.
4. LAB-041: corrected read-only component-library labels in exactly the component-library surface.
5. LAB-042: final test-only thermal semantics guard in exactly the new focused guard file.

The five parcels remain separate and sequential. Only LAB-038 may move to `ready`. No combined implementation, source-fixture rename, Program adapter, Selector change, Engine calculation, route, persistence or authority promotion is authorised.

LAB-040 must keep thermal authority state unresolved and must not misrepresent a sealed optic identity as accepted thermal evidence. Final Program evidence validation and Engine readiness remain blocked after these Lab corrections until a separately approved cross-lane evidence-publication/adapter parcel supplies accepted provenance.

### Acceptance return

Each parcel must return its exact feature scope, separate Lab documentation closeout, full `lab-ies` green, preserved protected inventory and lane-only push. Any schema, semantic, field, authority-state, source-model or file-scope drift requires a new Program decision.

---

## 2026-07-21 — LAB-038 atomic resolver-consumer transition amendment

**Status:** APPROVED AS A NARROW SUPERSESSION OF THE LAB-038 FILE SCOPE ONLY.

### Gate evidence

The attempted resolver-only version-2 transition passed all focused resolver tests but failed the mandatory full Lab gate because the existing Lab adapter imports the resolver schema constants directly. Eight adapter tests failed with the exact unsupported-resolution-schema boundary. Therefore a resolver-only version bump cannot form a green checkpoint, and the previously approved two-file LAB-038 scope is infeasible.

### Amended exact scope

LAB-038 is amended to exactly four files:

- the NVB resolver module and its focused test;
- the NVB Lab adapter module and its focused test.

The adapter change in LAB-038 is transition-only:

- it consumes only the corrected resolution version 2 and corrected optic input names;
- it keeps its own public projection schema at version 1;
- it does not publish the measured thermal triplet, accepted evidence, authority state, runtime derivation or Engine result;
- it removes acceptance of the deprecated resolver input names;
- its existing non-thermal output shape remains unchanged.

LAB-040 remains separately required to advance the adapter's public projection to version 2 and add the explicit unresolved `thermalEvidence` object. No LAB-040 behaviour is pulled into LAB-038.

### Queue effect

LAB-038 remains the sole ready Lab parcel under this amended four-file atomic scope. LAB-039 through LAB-042 remain sequence-blocked. The feature subject remains `lab: checkpoint NVB thermal semantics v2`. Any extra adapter output, schema-version change, thermal authority claim or file requires a new Program decision.

---

## 2026-07-21 — LAB-042 gate-included test-file amendment

**Status:** APPROVED AS A TEST-ONLY FILE-SCOPE SUPERSESSION; LAB-042 IS READY.

### Gate evidence

LAB-038 through LAB-041 are complete and green. The approved LAB-042 path `tests/lab-kernel/nvbThermalSemantics.test.js` is not named by the fixed `lab-ies` gate command. A checkpoint confined to that new file would therefore pass the mandatory gate without executing its own assertions and cannot provide valid acceptance evidence.

### Amended exact scope

LAB-042 must use exactly the existing gate-included file:

```text
tests/lab-kernel/iesKeywordMigration.test.js
```

The previously approved new test file is removed from scope and must not be created.

All LAB-042 acceptance criteria remain unchanged:

- independently pin the corrected legacy-source mappings;
- prove exact 25 + 10 = 35 measured consistency;
- prove a varied optic through legacy `optic_uplift_ta_c` with matching absolute internal temperature;
- reject a contradictory rise-only change;
- pin all three version-2 schema identities;
- prohibit deprecated semantic output names and Lab-owned Engine calculations;
- permit legacy snake-case names only at bounded source-mapping and test-input locations;
- preserve the sealed-reference `_INTERNAL_AMBIENT_TA_C` meaning.

No production source, fixture, gate configuration, route, persistence or cross-lane implementation is authorised. The feature subject remains `lab: checkpoint thermal semantics guard`. LAB-042 is the sole ready Lab item and may close the corrected thermal batch after a full green gate and separate documentation checkpoint.

---

## 2026-07-21 — Corrected Lab thermal receipt accepted; Program adapter and Engine execution admitted

**Status:** LAB PRODUCER RECEIPT ACCEPTED; SEL-018 REMAINS READY; THERM-P1 AND THERM-E1 ARE APPROVED BUT SEQUENCE-BLOCKED.

### Accepted Lab receipt

Program accepts the completed LAB-038 through LAB-042 batch from the Lab lane. The accepted receipt records version-2 resolver, component and Lab working projections, corrected labels, the gate-included final guard, final 262/262 `lab-ies`, no Lab-owned Engine calculation, explicit `authorityState: null`, and preservation of the three protected local paths.

The accepted Lab shape is the exact `controlstack.lab.nvb-lab-projection.v2` projection containing selected optic identity plus measured `referenceRoomTaC`, absolute `referenceInternalTaC`, measured `opticThermalRiseTaC`, opaque `evidenceRef` and unresolved Lab authority.

### SEL-018 verification

The current readable Runtime base still contains no `selectedRoomTaC` in the read-only candidate mapper or its tests. Therefore SEL-018 is not accepted as implemented and remains the sole ready Selector parcel under its previously approved exact two-file scope.

The restarted Selector tool now resolves to the isolated Selector worktree on `lane/selector-engine`, with commit and push enabled and a clean repository. The feature paths approved for SEL-018 are writable. The live allowlist still omits `docs/_context/lanes/selector-engine/**` even though the current Program Deployment v2 manifest contains that exact lane-document permission; therefore feature implementation must not begin until the installed service configuration is refreshed and the lane queue can be reconciled. The unfinished main runtime-port work remains excluded and untouched.

### THERM-P1 admission

Program approves the separate Program-owned validation adapter parcel defined in `CONTROLSTACK_SEAM_CONTRACTS.md`:

- `packages/workspace-kernel/labThermalEvidenceProgramAdapter.js`
- `tests/labThermalEvidenceProgramAdapter.test.js`

THERM-P1 remains blocked until an accepted SEL-018 receipt exists. It may validate and bind Selector room/optic intent to Lab v2 evidence, but it performs no addition, lookup, clamp or verified-output calculation.

### THERM-E1 admission

Program approves the separate Engine execution parcel defined in `CONTROLSTACK_SEAM_CONTRACTS.md`:

- `packages/workspace-kernel/runtimeThermalLumenExecution.js`
- `tests/runtimeThermalLumenExecution.test.js`

THERM-E1 remains blocked until THERM-P1 is accepted. It alone applies the optic rise exactly once and delegates to the existing runtime lumen-curve parse/interpolation contract. It must reject caller-supplied derived or lookup temperature.

### Mandatory varied-optic proof

Final acceptance must use two optic-bound Program bundles with different measured rises against the same selected room, drive current and curve. Both `curveLookupTaC` and verified lm/m must change. This proof is mandatory because the current source rows carry identical placeholder thermal values and ordinary baseline tests cannot distinguish per-optic evidence from a hardcoded constant.

No main runtime-port file, route, persistence path, source fixture, donor implementation or existing curve parser is included in either parcel.

---

## 2026-07-21 — Binding outside-governance / inside-Engine boundary ruling

**Status:** APPROVED; THIS RULING SUPERSEDES EVERY PROGRAM OR LANE ACCEPTANCE RULE THAT MAKES HUMAN/PROJECT GOVERNANCE A PREREQUISITE FOR ENGINE COMPUTATION.

### One-sentence ruling

**The Engine's caller-required and execution-eligibility contract is a set of selected product/build/engineering values only; human identity, project identity, ownership, timeline, registration and client-supplied Tier may exist only in an optional outer governance/traceability envelope and must never be required, interpreted, scored or used to block Engine execution.**

### Original-brief check

The original briefs support the computational ruling but contradict the literal claim that the entire transport object can contain nothing else:

- the Platform Spine assigns live identity, active project context and handoff to Workspace, while assigning product/configuration/manufacturing work to Selector/Engine;
- the canonical Selector-to-Engine flow includes `customer`, `job`, `project` and `metadata` in the outer Run Payload for traceability, but states explicitly that this context does not make engineering decisions;
- the same flow defines the calculative input groups as product, lighting, environment/control/compliance, Runs, accessory requests and build preferences;
- the canonical candidate/scoring flow states that Budget/Balanced/Long-life outcomes are derived and are not a user-selected Tier;
- the original bridge calls `run_engine(selector_payload)` and defines no registration-eligibility step;
- the donor Engine entrypoint reads no customer, project, owner or registration field.

Therefore the binding distinction is **outer envelope versus computational kernel**. Traceability metadata may accompany, store or receive an Engine result, but it is not an Engine input and cannot affect whether the kitchen runs.

### Selection-set definition

The outside-to-inside selection set may contain only the selected or requested engineering values needed to describe the desired build, including product/system/optic choices, lighting targets, room/environment and control/compliance choices, Runs/lengths/quantities, accessory requests and build preferences.

A selected component key or selected optic key is engineering selection identity, not human/project governance identity. Authoritative source data, measured Lab evidence, policy, candidate generation, derivation, scoring and verification are resolved inside the technical system from those selections; callers do not supply governance approval as a substitute for technical evidence.

### Prohibited Engine prerequisites

The Engine and its invocation boundary must not require or inspect:

- user, company, customer or owner identity;
- project, deal, quote, envelope, revision or timeline identity;
- handoff, assignment or entitlement history;
- save state, registration eligibility, active-revision state or persistence acknowledgement;
- a manually selected or client-authoritative Tier;
- any governance approval flag presented as permission to calculate.

These fields may shape the menu before the selection set is created and may associate the result after calculation. They do not enter the kitchen.

### Valid Engine blockers

Engine execution may still fail closed for technical reasons inside the selection contract: a missing or malformed required selection, unavailable authoritative product/source data, contradictory technical evidence, an unsupported combination, or a physical/electrical/thermal/compliance impossibility. These are kitchen constraints, not governance gates.

### Tier ruling

Tier is not a caller-required selection and not a registration gate. Any internal policy family, candidate weighting or surfaced Budget/Balanced/Long-life result is derived server-side. Legacy donor code that defaults or requires a caller Tier is implementation drift against the canonical Engine Flow and is not acceptance authority.

### Immediate parcel consequences

- **SEL-018:** remains the sole ready Selector parcel, but only to carry the selected room temperature as a selection. It performs no registration, project, identity, Tier or thermal calculation work.
- **SEL-019:** the former requirement to save/register an attributable project revision before one Engine proof is superseded. Persistence and traceability may be tested later as an outside-system parcel, but they cannot gate Engine acceptance.
- **SEL-002 / SEL-003:** may not remain blocking prerequisites for Engine execution. Their project-registration and selected-project invocation wording becomes historical governance acceptance only.
- **THERM-P1:** remains a technical, server-side evidence-integrity adapter. It may resolve the selected optic to authoritative measured evidence, but it must not require user/project/registration identity or expose a caller-supplied governance approval as an Engine input.
- **THERM-E1:** remains the inside-kitchen thermal execution parcel and applies the authoritative rise exactly once.

Every existing gate of the form `cannot run until governance X is present` is invalid under this ruling. Affected implementation must **delete or bypass the gate at the Engine boundary**, not repair it, rename it or replace it with another governance prerequisite. Optional outer-envelope persistence and audit remain separate and non-blocking.

No feature code is changed by this ruling. The unfinished runtime-port work in main remains excluded.

### Binding boundary regression test

Final Engine acceptance must execute the Engine twice with identical engineering selections and different outer traceability envelopes. The envelopes must vary user, project, owner, timeline and registration state. Engine eligibility and the complete deterministic engineering result must be identical after excluding only explicitly nondeterministic transport fields such as request timestamps or request IDs.

This is a class-level guard. It must fail if any governance field is renamed, moved or read for a warning, default, score, candidate exclusion, validation state or output field. The reconciliation receipt must identify each former governance gate and prove it was deleted or bypassed from Engine eligibility rather than renamed.

---

## 2026-07-21 — Selections-only thermal chain accepted across lanes

**Status:** FINAL CROSS-LANE ACCEPTANCE COMPLETE.

### Accepted sequence

Program accepts the completed Selector queue reconciliation and the three ordered parcels:

1. **SEL-018** — the Selector emits the committed source-backed `selectedRoomTaC` only and performs no registration, project, Tier or thermal calculation work;
2. **THERM-P1** — the internal Program adapter binds selected optic identity to exact Lab version-2 evidence and performs no thermal arithmetic;
3. **THERM-E1** — Engine applies the measured optic rise exactly once and delegates unchanged to the existing lumen-curve parser.

### Accepted execution evidence

The focused THERM-E1 suite passed 120/120 and the normal Selector closeout gate passed 107/107. The required examples passed: 25 + 10 produces lookup 35, 35 + 10 produces lookup 45, and changing only the optic-bound measured rise while holding room, current and curve fixed changes both lookup temperature and verified lm/m.

### Boundary regression accepted

Two executions used identical engineering selections with different outer envelopes covering user, company, project, quote, owner, timeline, registration state, active revision and a differently named eligibility field. The complete deterministic Engine responses were identical. Traceability values did not appear in output, and a derived-looking value placed inside the outer envelope did not affect eligibility, warnings, validation or calculation.

### Governance-gate receipt

The former project-registration, active-revision and selected-project eligibility chain is **bypassed from the computational path, not renamed**. The THERM-E1 dependency map contains only the accepted Program thermal-evidence adapter and the existing curve parser. Negative source checks found no project-browser registration, selected-project, active-revision, registration-boundary, registration-eligibility or pre-Engine eligibility reference in THERM-E1.

The existing governance services may remain for optional persistence, attribution and traceability outside the kitchen. They do not gate, alter or score Engine execution.

### Preserved exclusions

No route, persistence path, RuntimeData mutation, donor invocation, IES generation, downstream output generation, existing curve-parser change or main/runtime-port change was included. Outside-governance persistence and main promotion remain separate decisions.

---

## 2026-07-21 — Engine selected-result stability review blocks downstream activation

**Status:** ENGINE OUTPUT CONTRACT NOT YET STABLE; FIRST PRODUCER-CONTRACT PARCEL ADMITTED.

Program reviewed Seam B against its five mandatory stability conditions after final thermal acceptance.

1. **Schema/version declaration — partial only.** A versioned safe selected-result source object exists, but it is explicitly diagnostic-only and non-persistent. The broader projection remains summary-only, not accepted, and has no normalised per-run lookup.
2. **Producer gate evidence — insufficient for the full contract.** The accepted thermal execution and existing domain gates prove thermal calculation and safe summaries, not one complete accepted selected-result/run-table envelope.
3. **Consumer compatibility evidence — missing.** The source object explicitly reports selected-result projection and IES handoff as not ready.
4. **Live or sealed-fixture receipt — missing.** No Program-accepted sealed fixture proves one complete accepted result and one deterministic blocked result through the intended consumer boundary.
5. **Rollback/compatibility rule — missing for downstream use.** Existing diagnostic scaffolds are safely reversible, but no accepted compatibility rule exists for a downstream consumer.

Therefore Program does not declare Seam B stable. Seam G remains reserved and inactive, and main promotion remains separately held.

Program approves a first bounded Selector & Engine parcel, **ENG-STAB-P1**, to create a new immutable version-1 selected-result producer contract from the already accepted safe source summary and thermal execution result. It is schema/validation work only: no route, persistence, IES handoff, downstream activation, RuntimeData mutation, donor invocation or main change. Consumer compatibility and final stability acceptance remain separate later parcels.

## 2026-07-21 — SEL-007 candidate accepted

Program accepts the clean, pushed Selector contract candidate and its 114/114 focused receipt. Engine output is still not stable.

The accepted candidate uses `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`. It preserves the thermal result as one bounded component, keeps the current RunTable scaffold diagnostic-only, excludes persistence-coupled rows from Engine eligibility and records the incompatible legacy row-schema collision.

This superseded the earlier provisional `controlstack.engine.selected-result.v1` design as the public contract. A concurrent Selector worker completed that already-authorised bounded producer after this decision was recorded; Program reconciles that receipt below. ENG-OUT-P1 remains the sole ready parcel: one new runtime contract module and one focused runtime test for the request validator, complete-or-blocked output envelope and one exact row schema.

## 2026-07-21 — Concurrent ENG-STAB-P1 receipt reconciled

**Status:** ACCEPTED AS AN INTERNAL NON-STABLE COMPONENT; NOT THE PUBLIC OUTPUT CONTRACT.

The isolated Selector lane completed the previously authorised selected-result producer during the Program candidate supersession. Its exact two-file parcel passed 114/114, is non-persistent, adds no route or consumer activation, preserves thermal values without recalculation, emits deterministic safe run summaries and proves governance-envelope independence.

Program does not roll back this safe bounded artifact. `controlstack.engine.selected-result.v1` is classified as an internal selected-result component that ENG-OUT-P1 may validate and embed. It does not replace the accepted public schemas `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`, and it does not satisfy consumer compatibility or stability.

ENG-OUT-P1 remains the sole ready item in its existing two-file scope. It may import the internal component but must expose only the accepted three-schema public boundary. Persistence, routes, Lab/IES compatibility, downstream activation and main remain held.

## 2026-07-21 — ENG-OUT-P1 producer accepted; Lab compatibility parcel admitted

**Status:** PRODUCER ACCEPTED; OUTPUT CONTRACT STILL NOT STABLE.

Program accepts the isolated Selector lane receipt for the public version-1 producer. The exact module and focused test were pushed, followed by a bounded corrective parcel that made evidence fingerprints server-derived, added the exact versioned draft validator, classified caller Tier as derived/non-authoritative and retained one exact public row field set. Final focused coverage passed 116/116, the normal lane closeout passed 107/107, and the Selector tree ended clean.

The accepted public boundary is:

- `controlstack.engine.selection-set.v1` — engineering selections only;
- `controlstack.engine.output.v1` — deterministic complete or fail-closed blocked output;
- `controlstack.engine.runtable-row.v1` — one exact non-persistent row shape.

Program records that caller-supplied evidence fingerprints are not part of the request. The producer derives evidence identity from accepted technical provenance. Different governance envelopes remain output-inert. Valid zero values remain complete. The colliding legacy row schema is not reused.

Program admits **ENG-STAB-C1** as the next bounded consumer parcel, owned by Lab & IES, with exact new files:

- `packages/lab-kernel/ies-toolkit/engineOutputV1CompatibilityAdapter.js`;
- `tests/lab-kernel/engineOutputV1CompatibilityAdapter.test.js`.

The adapter consumes plain public JSON fixtures only and must not import Selector or Workspace implementation modules. It emits one deeply immutable read-only compatibility projection for complete or blocked Engine output. It may preserve only public schema/version, result/request/source/policy/evidence fingerprints, safe selected-result thermal/provenance values, exact public RunTable rows, blockers, warnings and no-write safety state. It must preserve valid zero values, fail closed on unknown/over-rich/unsafe/contradictory input, and prove governance fields cannot affect or appear in the projection.

ENG-STAB-C1 adds no IES generation, authority decision, reference mutation, route, persistence, downstream write or readiness activation. The current Lab lane contains protected unrelated dirty work and no ready item, so Program admits the parcel but does not start it or alter Lab files in this decision. The Lab orchestrator must reconcile it as the sole ready item without cleaning or absorbing the protected inventory.

Stability, Seam G, downstream activation and main promotion remain held after ENG-STAB-C1 pending a separate Program acceptance decision.

## 2026-07-21 — Seam B Engine output version 1 declared stable

**Status:** STABLE CONTRACT BOUNDARY; NO DOWNSTREAM ACTIVATION.

Program accepts the completed Lab consumer receipt. The import-free compatibility adapter and its focused test were pushed in the exact two-file Lab scope, followed by one same-scope thermal-tightening checkpoint. Each accepted checkpoint passed 269/269. The final adapter consumes only plain public JSON, preserves complete, blocked and valid-zero outputs, verifies the accepted reference and selected-room thermal equations plus clamp/mode combinations, rejects extra evidence authority, governance-bearing/private/unsafe/contradictory input and the colliding legacy row schema, and adds no IES, authority, persistence, route, network or downstream capability.

Program verifies the five mandatory Seam B conditions:

1. **Schema/version declaration — satisfied.** The public boundary is exactly `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`, each version 1 with exact shapes and fail-closed unknown-version handling.
2. **Producer gate evidence — satisfied.** Selector producer evidence passed 116/116 focused coverage and 107/107 normal closeout, with a clean ending tree.
3. **Consumer compatibility evidence — satisfied.** The Lab compatibility projection passed 269/269, imports no producer implementation and accepts only public JSON.
4. **Live or sealed-fixture receipt — satisfied by sealed deterministic fixtures.** Complete, blocked, valid-zero, replay/governance-independent, thermal-identity, unsafe and legacy-row fixtures were executed through both producer and consumer boundaries.
5. **Rollback/compatibility rule — satisfied.** Version 1 is exact-shape and exact-version; unknown or breaking changes fail closed and require a new schema decision. Both producer and consumer are read-only and non-persistent, so rollback is removal or non-use with no data migration, stored-record repair, route reversal or authority rollback.

Program therefore declares **Seam B Engine output contract version 1 stable**. This declaration covers the contract and read-only compatibility boundary only. It does not declare the old diagnostic RunTable scaffold production-ready, does not rehabilitate the persistence-coupled legacy row path and does not permit the colliding legacy row schema.

Seam G remains reserved and inactive. IES generation, downstream artifacts, writes/readiness, routes, persistence and main promotion require a new separately bounded Program parcel. No implementation parcel is admitted by this stability decision.

## 2026-07-21 — Seam G version-1 read-only IES request sequence commissioned

**Status:** PRODUCER PARCEL APPROVED; TUNNEL AND GENERATION REMAIN INACTIVE.

The original Selector output-actions brief retired direct `generateIES()` ownership from Selector and retained navigation to the Photometry/Lab domain. Program therefore commissions no Selector button, route, export, email, download or file-writing work.

The first Seam G sequence is a contract proof only:

1. **SEAM-G-P1 — Selector & Engine producer.** Create one immutable `controlstack.downstream.ies-artifact-request.v1` envelope from an exact stable `controlstack.engine.output.v1` complete-or-blocked public JSON value. The request is deterministic, replay-identical and non-persistent. It may expose only stable Engine identities, safe selected-result technical provenance/thermal values, exact public RunTable rows, canonical blockers/warnings, deterministic replay/audit identity and explicit no-write/no-generation safety flags.
2. **SEAM-G-C1 — Lab & IES consumer.** After Program accepts the producer receipt, prove one import-free read-only compatibility projection from plain public request JSON. It may confirm compatibility only; it may not generate IES, allocate/approve/seal authority, accept evidence, mutate references or write anything.
3. **SEAM-G-A1 — Program activation review.** Verify schema/version, producer and consumer gates, deterministic replay/idempotency, security/write boundary, failure isolation/audit and rollback. Program may then activate only the read-only request tunnel. Actual generation remains a separate future parcel.

SEAM-G-P1 exact files are new `packages/workspace-kernel/runtimeIesArtifactRequestContractV1.js` and new `tests/runtimeIesArtifactRequestContractV1.test.js`. It may import public Engine contract constants and stable fingerprint support only. It must not invoke Engine, donor, curve parser or Lab code; must not add or call routes; and must not persist, generate, return raw IES/photometry/candela/file content, expose private paths or inspect governance metadata.

The request accepts an optional outer traceability envelope only to prove quarantine: changing user, project, owner, timeline or registration values must not change the request or appear in it. Identical stable Engine output and artifact intent must produce an identical request ID, replay key, audit projection and complete output. Blocked Engine output must remain blocked with no artifact-ready state or generated body.

This decision admits SEAM-G-P1 only. SEAM-G-C1 and SEAM-G-A1 remain sequence-blocked. Main and unfinished runtime-port work remain excluded.

## 2026-07-21 — SEAM-G-P1 producer accepted; Lab request compatibility admitted

**Status:** PRODUCER ACCEPTED; READ-ONLY CONSUMER PARCEL ADMITTED; SEAM G STILL INACTIVE.

Program accepts the isolated Selector receipt. The exact producer module and focused test were pushed after 115/115, followed by normal lane closeout at 107/107 with a clean ending tree. The temporary harness was removed.

The accepted producer emits deterministic complete-or-blocked `controlstack.downstream.ies-artifact-request.v1` JSON from exact stable Engine output and exact `ies_lm63_reference_build` intent. Complete, blocked, valid-zero, replay-identical, governance-independent and technical-identity-moving cases passed. Unknown, over-rich, private/raw, contradictory, added-authority, unsafe, blocked-promotion and legacy-row cases fail closed. No route, persistence, file, email/export/download, generator, authority, reference mutation, Engine/donor invocation or downstream activation exists.

Program admits **SEAM-G-C1** to Lab & IES with exact new files:

- `packages/lab-kernel/ies-toolkit/iesArtifactRequestV1CompatibilityAdapter.js`;
- `tests/lab-kernel/iesArtifactRequestV1CompatibilityAdapter.test.js`.

The adapter must be import-free and consume plain public `controlstack.downstream.ies-artifact-request.v1` JSON only. It emits one deeply immutable read-only compatibility projection for ready or blocked requests, preserving only public schema/version/state, request/replay/audit identity, exact artifact intent, stable Engine identities, safe technical provenance/thermal values, exact public rows, canonical blockers/warnings and no-write/no-generation safety state.

It must preserve valid zeros, prove different traceability envelopes cannot influence or appear, and fail closed on unknown version, extra fields/authority, private/raw content, contradictory request/audit/Engine/row/thermal identity, unsafe flags, blocked-to-ready promotion or legacy rows. It adds no IES generation, Lab authority, evidence acceptance, reference mutation, route, persistence, network write, file, download, email or readiness activation.

The Lab orchestrator must preserve the existing expected branch marker and three protected untracked local items. Program does not touch Lab files in this decision. SEAM-G-A1 and actual generation remain blocked pending the consumer receipt.

## 2026-07-21 — Seam G read-only IES request tunnel version 1 activated

**Status:** READ-ONLY CONTRACT TUNNEL ACTIVE; ACTUAL IES GENERATION REMAINS BLOCKED.

Program accepts the completed Lab consumer receipt. The exact import-free adapter and focused test were pushed after 276/276, followed by a clean lane closeout. The protected Lab marker and three untracked local items remained untouched.

Program verifies the six mandatory Seam G conditions:

1. **Schema/version — satisfied.** The tunnel uses exact `controlstack.downstream.ies-artifact-intent.v1`, `controlstack.downstream.ies-artifact-request.v1` and `controlstack.downstream.ies-artifact-request-audit.v1` version-1 identities with unknown versions failing closed.
2. **Producer gate — satisfied.** Selector producer coverage passed 115/115 and normal closeout 107/107 with a clean ending tree.
3. **Consumer compatibility — satisfied.** The independent import-free Lab adapter passed 276/276 and consumes plain public JSON only.
4. **Security/write boundary — satisfied.** No route, endpoint, persistence, file, email/export/download, network write, IES body, photometry/candela, generator, authority, evidence acceptance, sealing, reference mutation or readiness side effect exists.
5. **Replay and failure isolation — satisfied.** Identical technical input is replay-identical; outer traceability is inert and absent; technical identity changes move request identity; invalid or blocked input fails closed with deterministic audit state and no partial ready body.
6. **Rollback — satisfied.** Producer and consumer are read-only and non-persistent. Rollback is removal or non-use with no data migration, artifact deletion, route reversal, authority repair or record repair.

Program therefore activates **Seam G version 1 only as a read-only contract tunnel** between the stable Engine output and the Lab compatibility boundary. This is a contract/validation activation, not a live network route and not an IES generator invocation.

Actual LM-63 generation, Lab authority allocation/approval/sealing, evidence acceptance, reference mutation, artifact storage, file/download/email delivery, routes, persistence, downstream readiness and main promotion remain separately blocked. No implementation parcel is admitted by this activation decision.

## 2026-07-21 — Seam G generation-input and sealed-reference binding sequence commissioned

**Status:** P2 PRODUCER APPROVED; GENERATION REMAINS BLOCKED.

Repository review proves that the active version-1 artifact request carries safe Engine identities and thermal provenance but deliberately omits the exact selection-set body and sealed-reference binding required by the existing deterministic LM-63 generator. Program therefore commissions a second read-only sequence before any generator invocation.

1. **SEAM-G-P2 — Selector generation input.** Produce one immutable `controlstack.downstream.ies-generation-input.v1` envelope from an exact ready artifact request version 1 and its exact matching Engine selection-set request version 1. The first slice is single-run only and normalises exactly one system, optic, target lm/m, room ambient, control protocol, quantity and run length. It must recompute and match the selection fingerprint, preserve request/replay and technical identity, quarantine outer traceability and expose no reference authority or generation capability.
2. **SEAM-G-C2 — Lab sealed-reference binding.** After Program accepts P2, consume plain public generation-input JSON plus exact `controlstack.lab.nvb-lab-projection.v2` JSON. Bind the selected optic BOM, optic variant, evidence reference and measured thermal triplet to one exact read-only OPT reference identity. Emit a deterministic ready-or-blocked binding projection only; do not resolve storage or load the sealed DTO.
3. **SEAM-G-A2 — Program binding activation review.** Verify exact schemas, producer and consumer gates, request/selection/reference identity agreement, replay/idempotency, failure isolation, no-write security and removal/non-use rollback. Program may activate only the read-only generation-binding tunnel.

SEAM-G-P2 exact files are new `packages/workspace-kernel/runtimeIesGenerationInputContractV1.js` and new `tests/runtimeIesGenerationInputContractV1.test.js`. It may import only public Engine/artifact-request constants and stable fingerprint support. It must not alter the stable version-1 request contract, invoke Engine or Lab, generate IES, inspect authority bodies, add routes, persist or write.

Unknown, over-rich, multi-run, unsafe, governance-bearing, fingerprint-mismatched, blocked-request or technically contradictory input fails closed. Identical technical inputs must return identical generation-input identity and audit state; changed selection, artifact request or technical identity must move identity.

This decision admits SEAM-G-P2 only. SEAM-G-C2 and SEAM-G-A2 remain sequence-blocked. Actual generator invocation, LM-63 text, files, delivery, persistence, authority and main remain blocked.

## 2026-07-21 — SEAM-G-P2 accepted; Lab reference binding admitted

**Status:** GENERATION INPUT ACCEPTED; READ-ONLY REFERENCE BINDING ADMITTED; GENERATOR INACTIVE.

Program accepts the Selector producer receipt. The exact generation-input module and focused test plus one exact tightening checkpoint passed 115/115, followed by normal Selector closeout at 107/107 with a clean ending tree.

The producer recomputes the Engine selection fingerprint, validates deterministic artifact request/replay/audit identity, supports exactly one bounded run, preserves valid zeros and safe technical/thermal identity, and keeps traceability inert. Its tightening verifies selected profile, row identity/state, non-negative thermal rise, safe curve filename and accepted effective-temperature modes. It contains no reference, authority, generator, route, persistence or write capability.

Program admits **SEAM-G-C2** to Lab & IES with exact new files:

- `packages/lab-kernel/ies-toolkit/iesGenerationInputV1ReferenceBindingAdapter.js`;
- `tests/lab-kernel/iesGenerationInputV1ReferenceBindingAdapter.test.js`.

The adapter must be import-free and consume plain public `controlstack.downstream.ies-generation-input.v1` JSON plus exact public `controlstack.lab.nvb-lab-projection.v2` JSON only. It emits one deeply immutable ready-or-blocked `controlstack.lab.ies-generation-reference-binding.v1` projection.

Ready binding requires path `optic`, no unresolved blockers, exact selected optic key to optic variant agreement, exact optic BOM agreement across generation provenance, Lab selection and thermal evidence, exact evidence-ref agreement, exact measured reference-room/reference-internal/rise triplet agreement, and one exact read-only OPT reference identity. It may preserve the reference identity projection but may not resolve its path or load the sealed DTO.

Unknown versions, extra fields/authority, non-optic path, unresolved state, missing/wrong-kind reference, reference identity contradiction, optic/evidence/thermal mismatch, private/raw content or unsafe generation flags fail closed. The adapter adds no generator invocation, LM-63 text, authority, evidence acceptance, sealing, reference mutation, route, persistence, storage, network/file/email write or readiness activation.

The Lab expected marker and three protected untracked items remain outside the parcel. SEAM-G-A2 and actual generation remain blocked pending the consumer receipt.

## 2026-07-21 — SEAM-G-A2 read-only generation-binding tunnel activated

**Status:** READ-ONLY BINDING TUNNEL ACTIVE; LM-63 GENERATOR INACTIVE.

Program accepts the completed Lab consumer receipt. The exact import-free adapter and focused test plus one same-scope identity tightening passed the final Lab gate at 285/285. The Lab closeout is pushed; only the expected branch marker and three protected local items remain.

Program verifies the six activation conditions:

1. **Schemas and ownership:** exact version-1 generation-input and reference-binding contracts consume only public JSON; the Lab input remains exact NVB projection version 2 and exact read-only OPT identity version 1.
2. **Producer gate:** Selector passed 115/115 focused and 107/107 normal closeout with a clean ending tree.
3. **Consumer gate:** the import-free Lab binding and identity tightening passed 285/285; the protected local items remained outside the parcel.
4. **Identity agreement:** the consumer independently reconstructs the Engine selection fingerprint, artifact request identity, generation identity/audit and reference binding, then requires optic key/variant, BOM, evidence, exact-decimal measured thermal-triplet and canonical OPT identity agreement.
5. **Replay and failure isolation:** identical technical inputs replay identically; changed generation or reference identity moves binding identity; unknown, extra, unresolved, private/raw, unsafe or contradictory input fails closed.
6. **No-write security and rollback:** both boundaries are read-only and non-persistent. Rollback is removal or non-use only; no data migration, stored-record repair, route reversal, authority repair or reference rollback is required.

Program therefore activates **only the read-only Seam G generation-binding tunnel**. This permits the accepted generation-input envelope to be validated and bound to one public OPT reference identity projection. It does not resolve storage, load the sealed reference DTO, inspect or mutate authority, accept evidence, invoke the IES generator, emit LM-63 text, create a file/download/email, add a route, persist state or activate delivery.

Actual generation, delivery, main promotion and unfinished runtime-port work remain blocked. No implementation parcel is admitted by this activation decision; a new exact Program parcel is required before any generator invocation.

## 2026-07-21 — Sealed-reference generation inspection commissioned

**Status:** READ-ONLY INSPECTION APPROVED; GENERATOR REMAINS INACTIVE.

The existing LM-63 generator already performs the authoritative fixed-shape validation of a sealed one-millimetre reference DTO before materialisation. Program commissions a narrow inspection export over that exact validator so later work can prove baseline and keyword readiness without duplicating validation or invoking generation.

**SEAM-G-C3** is a Lab-owned two-file parcel:

- modify `packages/lab-kernel/ies-toolkit/iesFromReference.js` only to export one read-only inspection function;
- add `tests/lab-kernel/iesFromReferenceInspection.test.js`.

The inspector consumes one sealed reference DTO and returns a deeply immutable `controlstack.lab.ies-reference-generation-inspection.v1` ready-or-blocked projection. Ready output may include only public reference identity, keyword profile identity, baseline CCT/CRI/internal ambient, flux/wall-watts/circuit-watts per millimetre, derived baseline lm/m and watts/m, exact missing generator keyword override names, and explicit no-generation/no-raw/no-write safety state.

It must reuse the existing private `validateReference` path that the generator uses, including schema, identity, timestamp, approval, canonical keywords, geometry, angles, candela shape/value, one-millimetre basis, baseline binding and hash-field validation. It must not expose metadata, angles, candela, keyword values, provenance paths or the sealed DTO body.

The parcel may classify whether materialisation can proceed with no keyword overrides, but it must not derive an output multiplier, bind project/customer metadata, invoke `materialise`, call `buildIesFromReference`, emit LM-63 text, write, route, persist or load from storage.

This inspection is the sole ready item. Multiplier policy, generation job construction, generator invocation, delivery and main remain separately blocked.

## 2026-07-21 — SEAM-G-C3 accepted; materialisation job planning admitted

**Status:** SEALED REFERENCE INSPECTION ACCEPTED; NO-GENERATION JOB PLAN ADMITTED.

Program accepts the exact Lab inspection receipt after 295/295. The inspector reuses the generator's private reference validator, reports only redacted baseline and keyword readiness, preserves valid zeros, rejects invalid/private sealed input and leaves the existing generator deterministic. It contains no job, multiplier, materialisation, LM-63, route, persistence or write capability.

Repository authority now supports one exact multiplier policy: the sealed reference is a one-millimetre photometric baseline and Engine `verifiedLmPerM` is the accepted selected output. The materialisation multiplier is therefore:

`outputMultiplier = verifiedLmPerM / baselineLmPerM`

The generator requires a positive multiplier. A zero or non-positive verified output, a zero or non-positive baseline, a non-finite ratio or a missing keyword override therefore blocks the job plan. Selector target lm/m remains intent only and must not replace Engine-verified lm/m in this calculation.

Program admits **SEAM-G-C4** to Lab & IES with exact new files:

- `packages/lab-kernel/ies-toolkit/iesMaterialisationJobPlanV1.js`;
- `tests/lab-kernel/iesMaterialisationJobPlanV1.test.js`.

The planner must be import-free and consume plain public generation-input version 1, generation-reference-binding version 1 and sealed-reference inspection version 1 JSON only. It emits one deeply immutable ready-or-blocked `controlstack.lab.ies-materialisation-job-plan.v1` projection.

Ready planning requires exact generation/binding source identity, exact selection/run agreement, exact binding/inspection reference identity, ready inspection with no missing keyword overrides, positive Engine-verified lm/m, positive sealed baseline lm/m and a finite positive ratio. The exact generator job is `{ runLengthMm, outputMultiplier, selections: {} }`; no caller override values are accepted and sealed keyword authority cannot be replaced.

Unknown/extra/private/raw/unsafe input, identity mismatch, missing overrides, non-positive ratio inputs or contradictory inspection state fail closed. The plan adds no sealed DTO, resolver/storage access, generator/materialise invocation, LM-63 text, route, persistence, file/network/email write or delivery readiness.

SEAM-G-C4 is the sole ready item. Actual generator invocation remains a separate future Program decision.

## 2026-07-21 — Program work-shape lane and gateway ruling

**Status:** GOVERNANCE & SHELL LANE APPROVED; SELECTOR ITEMS 1, 2 AND 5 ADMITTED; SINGLE RETRIEVAL GATEWAY BINDING.

Program accepts `PROGRAM_WORK_SHAPE.md` as the source proposal and makes the following binding rulings.

### Lane split

A new **Governance & Shell** lane is approved as a separate writer from Selector & Engine. The Boundary Ruling makes this separation real: Selector & Engine owns engineering selections, readiness derivation, candidate creation, scoring and verified output; Governance & Shell owns human/project identity, permissions, timeline, ownership, handoff, persistence, data retrieval and external CRM orchestration.

The new lane will use its own worktree, branch `lane/governance-shell`, MCP service identity, exact write globs, required branch and lane gate. Program & Integrate owns provisioning and scope approval. An advisory session does not create or widen a writable lane.

A separate CRM & Integration lane is **not created now**. CRM item 7 remains a blocked substream of Governance & Shell until the private-app portal-scope pre-check is resolved and an actual connector writer requires separate isolation. At that point Program may split it without changing the outside/inside boundary.

### Immediate Selector admission

The corrected thermal chain is closed and Seam G continuation is currently Lab-owned. Program therefore admits work-shape items 1, 2 and 5 to Selector & Engine in this order:

1. **PWS-001 ready now:** retire Gate 1 and Gate 2 as named business/CRM gates and emit deterministic state-entry push intents.
2. **PWS-002 admitted, blocked behind PWS-001:** add the derived `factoryReady` state from existing source-backed Factory Approved Inputs evidence.
3. **PWS-005 admitted, blocked behind PWS-002:** correct stale save/restore/hydrate lifecycle copy only.

One writer remains permitted in the Selector worktree. The parcels are not run concurrently because they overlap the same readiness/view-model surfaces.

Selector owns readiness facts and transition intent only. It must not call HubSpot or any CRM provider. Governance & Shell later consumes the immutable state-entry intent, applies project/identity/idempotency/retry policy and performs best-effort external push. A CRM outage cannot block Selector or Engine.

### Single retrieval gateway

Every module's export, download, artifact retrieval or take-away action must pass through one Governance & Shell gateway. No module may add its own download route, file-delivery button, browser download helper, export transport or provider-specific retrieval path.

The gateway keeps two conditions separate:

- **readiness:** ControlStack decides whether a useful artifact exists and which readiness state produced it;
- **identity:** Governance establishes email and project context for retrieval capture.

Identity does not enter Engine eligibility or output. Readiness does not manufacture identity. The Engine remains runnable with no traceability envelope.

Current Seam G work may build deterministic internal request, binding, inspection and materialisation contracts, but actual LM-63 retrieval or delivery must terminate at the single gateway. A direct Lab or Selector download path is a seam violation even if its output is technically correct.

### Standing acceptance lock

The following tests survive every lane split and reshuffle:

1. identical engineering selections with different traceability envelopes produce identical Engine output, and the same selections also run with no envelope;
2. changing one optic's measured thermal rise changes both lookup temperature and verified output;
3. wherever lookup fixture values are identical across rows, acceptance varies one row and proves output movement;
4. ownership tests quantify behavior across every governed row or system, rather than asserting one named product instance.

No parcel may remove, weaken, replace with a narrower example or exclude these tests from its effective gate without a new explicit Program decision.

## 2026-07-21 — Governance & Shell lane infrastructure implemented

**Status:** REPOSITORY IMPLEMENTATION GREEN; HOST ACTIVATION PENDING FIXED PROVISIONER.

Program implements the approved fifth worktree identity and a ninth managed service: one local Governance & Shell MCP on its own port. The service is bound to `lane/governance-shell`, the dedicated Governance gate and a conservative write scope covering shell surfaces, exact project persistence and identity files, a new governance workspace-kernel area, governance-owned tests and the lane context only. Selector modules, Lab authority, runtime-web and broad package globs remain excluded.

A fixed Governance lane gate discovers only reviewed governance/shell test families, verifies the exact root and branch and permits no arbitrary command. A fixed idempotent provisioner creates or verifies the sibling worktree, copies exactly the six drafted founding records into the canonical lane context, refuses to overwrite differing records, runs the gate, commits and pushes the founding checkpoint, installs Deployment v2 and requires the Governance MCP to report healthy and managed.

Deployment v2 is upgraded from four worktrees/eight services to five worktrees/nine services without adding another tunnel. The installer permits a newly declared service to be absent before the upgrade while still requiring every previously installed service to be live; after manager reload every configured service must be running. Selector-only activation remains Selector-only, and Selector, Lab and Governance worktrees are protected against deployment mutation.

Repository tests passed 48/48. No sibling worktree or Windows service was created by the lane tool because host-level Git worktree creation is outside its action set. One execution of the fixed provisioner is the remaining activation step; no design choice remains.

## 2026-07-21 — Governance lane active; first parcel admitted

**Status:** GOVERNANCE & SHELL ACTIVE; GOV-001 READY.

Program accepts the completed Governance lane activation and admits one bounded first parcel: an inert, versioned single data-retrieval gateway contract and shell view-state.

The parcel establishes one owner and one entry point before any real retrieval is activated. It keeps readiness and identity as separate named conditions. Readiness may recognise useful outputs at Spec Ready, Build Ready and Factory Ready; identity may recognise project and loose email capture. Neither condition becomes an Engine input, eligibility requirement or output influence.

GOV-001 may expose safe scalar discovery descriptions and fail-closed gateway states only. It may not download, generate, deliver, persist, email, open a route, invoke Engine, mutate readiness, verify email, inspect traceability envelopes or call HubSpot. Unknown, extra, private, raw, path-bearing, URL, blob and provider-shaped input must fail closed.

Project persistence restoration follows after the gateway contract closes. User identity and permissions follow project persistence. The deferred-decisions panel remains an independent small parcel that may be interleaved where file ownership does not overlap. CRM remains blocked and no provider mutation is authorised.

The standing acceptance lock remains cross-lane and unchanged.

## 2026-07-21 — SEAM-G-C4 materialisation job plan accepted

**Status:** COMPLETE; LAB QUEUE EMPTY; GENERATOR INVOCATION BLOCKED.

Program accepts the Lab & IES materialisation job-plan receipt after the final fixed gate passed 305/305. The exact feature remains the approved two-file parcel. Two test-fixture ordering issues were corrected without changing production behaviour or widening the seam.

The import-free planner validates the exact generation, binding and sealed-reference inspection identities; derives `outputMultiplier` only from Engine verified lm/m divided by sealed baseline lm/m; preserves Selector target lm/m as intent only; and emits the exact generator job `{ runLengthMm, outputMultiplier, selections: {} }` only when all ready conditions hold.

Deterministic replay, identity movement, immutability, missing and caller override rejection, private/raw rejection, unsafe-state rejection and non-positive/non-finite failure cases passed. No sealed DTO loading, resolver/storage access, generator or materialise invocation, LM-63 output, project/customer metadata, route, persistence, file/network/email write, delivery or readiness activation was added.

Lab returns to idle with its expected branch marker and three protected local items untouched. Actual generator invocation requires a separate Program seam decision and remains blocked.

## 2026-07-21 — Governance connector exposure requires a dedicated secure tunnel

**Status:** LOCAL LANE HEALTHY; CHATGPT EXPOSURE REPAIR APPROVED.

Program corrects the infrastructure interpretation: a local MCP service is not sufficient to expose a lane in ChatGPT. Selector, Lab and Program each have a dedicated OpenAI tunnel as well as an MCP service; Governance was provisioned with the MCP only. The Governance worker therefore truthfully stopped because no Governance connector namespace was available.

Deployment v2 is expanded to ten managed services and four tunnel services. The new service is fixed to the Governance MCP only, uses its own profile and health port, and reuses the existing encrypted runtime key. It may not share another lane's tunnel or widen the Governance MCP write scope.

A fixed tunnel provisioner reads a newly copied tunnel reference from the Windows clipboard, decrypts the existing key only in process memory, initialises or validates the exact Governance profile and local MCP target, runs the managed deployment installer, clears the key and clipboard, and requires both Governance MCP and tunnel to report healthy and managed. No tunnel reference, runtime key or remote endpoint is stored in the repository.

The remaining external step is to create the tunnel object and register/enable the corresponding custom ChatGPT app. GOV-001 remains the sole ready Governance feature parcel but cannot execute until that connector exposure is complete.

## 2026-07-21 — Governance inert retrieval gateway accepted

**Status:** COMPLETE; GOVERNANCE GATE 152/152; PROJECT PERSISTENCE NEXT.

Program accepts the Governance receipt. The versioned immutable gateway exposes only safe scalar module/output descriptions, one approved readiness label, project-context presence, identity-capture presence and static discovery text. Readiness, project context and identity remain separate named conditions.

The four deterministic states are no useful output, project required, identity required and ready for future retrieval. Ready for future retrieval is not permission to retrieve, download or deliver. Route, file body, URL, blob, filesystem write, persistence, email, CRM, Engine invocation, readiness mutation and live cross-module read remain disabled.

The former shell-owned browser download path is inactive: the shell no longer resolves the module download source, prepares a module action, materialises IES, creates an object URL or retains a callable action. Existing manifest/detail previews remain read-only. Unknown, extra, nested, private, raw, path, URL, blob, traceability-envelope and provider-shaped inputs are rejected. The exact feature and documentation closeout were gated, committed and pushed. The unrelated local persistence-seam report was not touched.

## 2026-07-21 — GOV-003 project persistence seam ruling

**Status:** APPROVED FOR IMPLEMENTATION; RESTORATION ONLY.

Program admits one bounded Governance parcel to restore project persistence. The ruling is:

1. **Canonical schema:** persisted server and browser-cache records use `workspace_saved_project.v2`. The runtime-only `workspace_saved_project.v2-runtime` shape is an adapter input/output only and must never be silently treated as the persisted schema.
2. **Authority:** server-owned JSON is the system of record. Browser `localStorage` is a cache/recovery mirror updated only after a successful server save/read; it is not an independent writer.
3. **Storage:** one UTF-8 JSON file per stable `projectId` under `data/session_projects`, overridable by `CS_SESSION_PROJECT_DIR`. Temporary sibling write plus atomic replacement is mandatory. Resolved paths must stay inside the configured directory.
4. **Project identity:** persisted `projectId` is required and must match the route/request identity and the stored record. Use a bounded lowercase safe token; do not invent fallback project truth. `envelopeId` may identify the current saved revision but cannot select a second project file. Missing, unsafe or conflicting identity fails closed. Alpha/Bravo/Charlie fixtures are excluded.
5. **CRM fields:** the only passive linkage fields are `hubspotDealId`, `hubspotContactId` and `hubspotCompanyId`; each is nullable. No lookup, provider call, writeback, price or CRM readiness rule is authorised.
6. **Routes:** add only bounded `POST /api/session/save` and `POST /api/session/read`. Read supports exact one-project mode or validated all-project boot/list mode. No share, handoff, email, token, cleanup, CRM or delivery route is included.
7. **Migration:** accept safe canonical v2 server records, explicit browser v2 imports, donor v1 records through a versioned normaliser and one explicit live-memory flush. Migration is idempotent. Original browser keys/backups and legacy files remain untouched; fixtures are never migrated.
8. **Rollback:** existing `projectPersistenceLive` is the sole rollback flag. `false` selects the current memory adapter; `true` selects server JSON authority. Rollback does not delete, rewrite or downgrade persisted files.
9. **Failure isolation:** malformed records are reported and skipped; shell boot and Engine execution continue. Persistence failure cannot alter Engine eligibility or deterministic technical output.

Acceptance must prove restart persistence in a temporary directory, atomic-write failure preservation, traversal rejection, malformed-record isolation, fixture removal, passive CRM round-trip with zero provider calls, idempotent migration with backup retention, server-before-cache ordering, exact route ownership, and Engine independence including no-project execution.

No identity lookup, retrieval activation, delivery, CRM activity, handoff, email or unrelated schema change is authorised in GOV-003.

## 2026-07-21 — Selector PWS sequence accepted and guard retracted

**Status:** PWS-001, PWS-002 AND PWS-005 COMPLETE; SELECTOR QUEUE EMPTY.

Program accepts the Selector lane receipts. The parcels executed in their approved order with one writer: readiness state-entry intent, fail-closed Factory Ready, then lifecycle-copy correction. The normal and guarded gates passed 107/107 for each parcel; focused coverage passed 114/114, 128/128 and 112/112.

PWS-001 changed no readiness predicate or Engine eligibility and added no provider mutation. PWS-002 derived Factory Ready only from truthful Spec Ready, Build Ready and unchanged source-backed Factory Approved Inputs evidence. PWS-005 corrected copy and contract classification only; it added no save, restore, hydrate, project-store, route or persistence behaviour.

The Selector worktree is clean and no queue item remains ready. Temporary module write permissions required by the completed parcels are retracted. The exact post-parcel Selector write guard is restored; no broad `packages/modules` permission remains. Governance continues to own identity, project persistence, retrieval and any later provider action.

## 2026-07-22 — Lab and Governance queue reconciliation

**Status:** LAB PARKED; GOVERNANCE PARKED; NO REORDER ISSUED.

Program records all ten managed services healthy, including the Program secure tunnel.

The Lab materialisation job-plan receipt remains accepted after 305/305. At that checkpoint, sealed-reference loading, generator or materialise invocation, LM-63 output, routes, persistence and delivery remained blocked pending a separate Program seam.

The report that Governance is only proceeding GOV-001 to GOV-002 is superseded by the canonical Governance branch. GOV-001 through GOV-005 are complete, the final fixed Governance gate passed 181/181, and the Governance queue is empty. GOV-004 was already expedited by an earlier explicit Program reorder and is complete, so no new reorder is issued. CRM remains held pending the portal-scope pre-check and a separate Program admission.

## 2026-07-22 — Generation-chain opening and parked-lane ruling

**Status:** SELECTOR COMPLETE; SEAM-G-C5 READY; PATRICK ACTION LIMITED TO CRM.

Program verifies that Selector work-shape items PWS-001, PWS-002 and PWS-005 were already admitted, executed in strict order, gated, pushed and closed. The Selector queue is empty. No recommission or second writer is authorised.

Program now opens the generation chain with one bounded Lab-only parcel: **SEAM-G-C5 sealed-reference load preflight**. It consumes exact ready materialisation-job-plan version 1, generation-reference-binding version 1 and reference-generation-inspection version 1 values plus one injected Lab-owned read-only resolver capability. It derives the reference identity only from those matched contracts, invokes the resolver at most once, rejects caller paths and URLs, validates the loaded sealed DTO through the existing generation-inspection path, and requires exact identity, keyword-profile, baseline and missing-override equality with the accepted inspection and plan.

The loaded DTO is ephemeral and discarded after validation. The public result is one deterministic immutable ready-or-blocked redacted load receipt only. It contains no sealed body, metadata, keywords, angles, candela, provenance paths or LM-63 text. It adds no generator/materialise invocation, route, persistence, file/network/email write, delivery or readiness activation. Exact feature scope is one loader module and one focused test; the fixed Lab gate and protected-local-item rules remain binding.

After C5 acceptance, the remaining chain is sequential: C6 one-shot in-memory generator invocation; C7 validated LM-63 generated-artifact handoff through Seam G using opaque identity and safe summary; then a Governance retrieval activation that stores/serves the body only through the single gateway after separate useful-output readiness and identity/project capture. No module-owned download path is permitted.

Patrick is not required for Selector, Lab C5, generation, persistence or retrieval-contract work. The only Patrick-held prerequisites are the HubSpot private-app portal-scope pre-check and the business CRM scope/lifecycle decision. Those do not block C5.

## 2026-07-22 — Consolidated Selector walkthrough batch commissioned

**Status:** SOURCE REFRESH READY; CLEANUP SEQUENCED; LIVE RUN HELD.

Program accepts Patrick's nine live Selector walkthrough findings as one ordered batch. Work-shape items PWS-001, PWS-002 and PWS-005 are already complete, gated and pushed; they are not reopened or recommissioned.

The sole ready Selector parcel is WALK-001 authority refresh. The lane must run the repaired guarded materialiser dry-run, prove the current Google source includes a finite tier-gated `SYSTEM_POLICY.ambient_temp` row and all required source-shape checks, then use the existing archive-before-promotion live workflow. Any validation failure, missing Ambient row, identity contradiction, unsafe disclosure or promotion blocker stops before a write.

After refresh, one Selector writer proceeds in strict order: diagnose and delete Length Mode as a Selector narrowing authority; unmount the fabricated duplicate scaffold; delete the legacy `TIERS`-expecting payload/readiness owner; delete Selector's internal timeline and special-parts principal test modes; then correct readiness totals so only genuine actionable prerequisites count. These are deletions under the one-owner rule, not reassignment or hidden defaulting.

Program rules that Governance owns human identity, principal/role, timeline policy and visibility. Selector may consume bounded shell outcomes but may not retain parallel test authority. The existing internal test-mode behaviour is the regression specification for the deletion.

No live Engine run may occur before the cleanup sequence closes. The final batch parcel reconciles Run Engine with the selections-only boundary: server revision acknowledgement and governance/project envelopes are not Engine authority. Source-backed technical selections and no-write transport safeguards remain mandatory. One bounded thermal acceptance must prove selected room plus one optic-bound measured rise exactly once, attributable lookup temperature and verified lm/m, and varied-rise movement with room, current and curve held fixed.

At initial commission, the finishes default-acceptance question remained unresolved and non-blocking. The addendum below supersedes that temporary state with Patrick's explicit ruling and WALK-005A implementation sequence.

Lab C5 remains independently ready in its separate worktree. No second Selector writer, provider mutation, persistence, IES generation, delivery, module-owned retrieval, main or unrelated runtime work is authorised by this batch.

## 2026-07-22 — Selector walkthrough addendum: default acknowledgement ruled

**Status:** FINISHES QUESTION CLOSED; WALK-005A ADMITTED IN SEQUENCE.

Patrick rules that inherited or auto-filled cover, end and flex finishes do not satisfy Build Ready on their own. The donor behaviour is restored as one explicit action: `Accept all defaults` acknowledges every currently flagged default in one press. Per-field acknowledgement is not required and must not be introduced.

Program inserts WALK-005A after the deletion/ownership steps and before truthful counter cleanup and WALK-007. Every Selector dropdown must preserve the exact NVB comma-separated option order and auto-fill the first real option. Presentation-only entries such as `No manual constraint…` remain visible where required but are never eligible as defaults. Changing a default later is a source-data reorder only; code must not rank or name a preferred option.

Every auto-filled value is visibly marked as a looked-up choice made on the user's behalf and remains distinct from a manual constraint. In provenance terms, the selected default value is LOOKED UP; the single acknowledgement event is GIVEN. Auto-fill must never masquerade as manual input.

Readiness ignores unacknowledged defaults. The one acknowledgement covers every flagged value, including inherited finishes. Truthful counters may count genuine pending acknowledgements but must not classify them as missing source data or combine them with diagnostic/future rows.

Governance registry version 1.2.0 records the finishes item as RULED. The remaining OPEN Governance questions are identity-first and state-to-deal-floor only. WALK-001 remains the sole ready Selector parcel; this addendum changes later sequence and acceptance, not current parallelism or the live-run hold.

## 2026-07-22 — HubSpot read credential executed; CRM lifecycle ruled

**Status:** PORTAL PREREQUISITE SATISFIED; BUSINESS SCOPE CLOSED; WRITES HELD.

Patrick created the HubSpot private app `ControlsStack (Read Only)` with exactly three scopes: `crm.objects.contacts.read`, `crm.objects.companies.read` and `crm.objects.deals.read`. Patrick placed the token in the local secrets store. Program records no token value, secret location detail or credential body. The token must not appear in repository files, chat, logs, tests or receipts.

The portal-scope prerequisite that previously blocked CRM work inside Governance is satisfied. `writePolicy` remains disabled, no writer credential exists in Program authority and no provider mutation is admitted. The existing OAuth public app remains untouched and in service until a separate future cutover parcel explicitly retires it.

Patrick rules the CRM business boundary as follows: HubSpot owns contacts, companies, deals and price; ControlStack owns engineering state and build detail and must not calculate or display price. Each ControlStack envelope maps to one HubSpot deal through the mandatory identity pair `controlstack_project_key` plus `controlstack_job_ref`. CRM push intent is generated only on genuine readiness-state entry. It is not triggered by module open, render/hydrate or Engine execution, and provider availability cannot block local state, Selector or Engine.

Leads are deals in a separate leads pipeline. ControlStack remains local-first for engineering state. CRM reads are cached with visible age; later writes must be best-effort, idempotent and replayable. The only remaining substantive CRM precondition is exact writer-scope definition. A separate Program admission remains the normal release control before any live write parcel. No live write parcel is ready now.

HubSpot's recommendation to use Service Keys for single-account API access is recorded as a deferred cutover decision. The expected migration is a token swap with no ControlStack code change. Program will revisit it only during the future auth cutover and will not retire the working OAuth public app or private app early. Patrick reports that the RULED CRM boundary and PARKED Service Keys migration are already recorded in the project-shell decision registry. Program records that cross-lane state as REPORTED and does not cross-write Governance.

## 2026-07-22 — WALK-001 safe stop accepted; reader recovery admitted

**Status:** WALK-001 OPEN; NO WRITE OCCURRED; WALK-001R READY.

Selector reports that its lane was reconciled and clean, the standing worker was commissioned, and the guarded WALK-001 dry-run stopped before every write because the running service could not load the server-side Google Sheets reader. Program accepts the fail-closed behaviour as correct but does not accept WALK-001 as complete. No current-source validation, finite tier-gated `SYSTEM_POLICY.ambient_temp` proof, materialisation, archive or promotion is established by this receipt.

Program admits one bounded subparcel, **WALK-001R**, within the still-open WALK-001. The worker may reproduce the redacted reader-load failure, inspect the running Selector service's existing dependency, module-resolution, working-directory and configuration boundary, and apply the minimum repair available through Selector-owned files or existing managed-service controls. Credentials must not be displayed, copied, relocated or newly bound. Arbitrary shell workarounds, broad environment repair and cross-lane writes remain prohibited.

If the cause requires a Program-owned deployment manifest or service-host change, a new protected-secret binding, credential relocation, another worktree or any broader operational change, the worker must stop and return a redacted diagnosis for a separate Program parcel. Otherwise it may restart only `selector-runtime` through the existing manager and rerun the original guarded dry-run. The existing materialise/archive/promote authority remains valid only after the entire dry-run and Ambient proof pass. WALK-002 through WALK-007 and all live Engine execution remain blocked.

## 2026-07-22 — Selector service dependency restoration approved

**Status:** PROGRAM OPERATIONAL PARCEL APPROVED; PATRICK EXECUTION REQUIRED; NO CODE CHANGE.

Selector reports that WALK-001R stopped cleanly because the running service installation could not load its declared Google Sheets dependency. The appended advisor diagnosis reports that the live service runs from the Selector worktree, that its package manifest declares `googleapis` and its lockfile already pins the dependency set, but that the serving worktree's installed dependency directory does not contain that locked package set. Program records the cross-lane diagnosis as REPORTED and accepts the classification: this is service-host installation drift, not Selector feature work and not a credential fault.

Program approves one bounded operational parcel, **WALK-001I**, executed by Patrick under advisor guidance. Run `npm ci` in the exact worktree serving port 8788. This installs only the existing locked dependency set and must not edit the package manifest or lockfile. Do not use `npm install`, add or update dependencies, change credentials, copy secrets, modify the deployment manifest or write Selector feature files. If the locked install fails or creates a tracked repository change, stop and return the safe failure.

After the locked install succeeds, use the existing ControlStack Manager panel to restart only `selector-runtime` / `CS Selector Runtime / Workspace Shell (8788)` and require it to return Healthy and Managed. No other service may restart. Selector then verifies clean Git state and resumes WALK-001R by rerunning the complete original guarded dry-run. Materialisation, archive and promotion remain prohibited until every original check and the finite genuinely tier-gated `SYSTEM_POLICY.ambient_temp` proof pass. WALK-002 onward remain blocked.

## 2026-07-22 — WALK-001 current-source stop accepted; Ambient visibility admitted

**Status:** DEPENDENCY RECOVERY COMPLETE; WALK-001 OPEN; WALK-001V READY.

Program verified the pushed Selector receipt and clean ending lane state. The installed Google reader now loads, the guarded dry-run reaches the current Google source and all 15 required tables are present. The dry-run correctly stopped before every write.

The current DRIVERS source identity is contradictory. All 48 rows populate canonical `native_control_type`, but those values are Boolean-like and provide zero protocol authority. The duplicate-normalised `native_control_type__2` field is populated on all 48 rows and carries 51 protocol values. BOARDS protocol authority is populated, but its intersection with required canonical Driver authority is empty. This is a real source-data identity defect; the existing Selector fallback to the duplicate field does not make that source safe to promote.

SYSTEM_POLICY is present with 133 rows, but the current bounded dry-run does not report an Ambient-row summary. Program therefore records finite tier-gated `SYSTEM_POLICY.ambient_temp` as **UNPROVEN**, not absent. The active authority remained unchanged; no materialisation, archive, promotion, Engine invocation, project/provider mutation or later walkthrough work occurred.

Program admits **WALK-001V — bounded Ambient validation visibility** as the sole ready Selector parcel. Exact feature scope is `packages/workspace-kernel/authorityReferenceMaterialiserService.js` and gate-included `tests/selectorReferenceOptionsService.test.js`, plus Selector lane-memory files. Extend only the existing in-memory `currentSourceShape` result after a successful Google read and before every write. Add a redacted SYSTEM_POLICY/Ambient summary containing table and exact-item counts, approved exact-item counts, and allowlisted `economy`, `business`, `first` and `charter` tier-column presence/population plus finite and non-finite numeric-token counts. It may report counts of rows with finite tier values, rows with finite values across multiple tier columns and generic-only rows, but no policy values, raw rows, unrestricted headers, users, credentials, Sheet identity, provider body, full materialised JSON or private paths.

WALK-001V must not alter Google reading, Driver authority rules, source validation outcome, materialisation, archive, promotion, Selector options, Engine, source data or deployment. The gate-included test must prove finite tier-specific evidence, generic-only and non-numeric rejection, duplicate exact-row visibility, redaction and dry-run no-write behaviour. After the exact two-file feature parcel is gated and pushed, stop for Program activation and source-repair review. No Google Sheet edit is admitted yet; Program will issue one exact source-owner correction only after the Ambient evidence is visible.

## 2026-07-22 — Program response routing is mandatory

**Status:** STANDING OPERATING RULE; BINDING ON EVERY FUTURE PROGRAM SESSION.

Every Program response that changes a ruling, authorisation or queue state must end with a section titled `ROUTING`. That section must list every affected lane and use exactly one of these forms for each destination:

- `<lane>: no action`
- `<lane>: PASTE THE FOLLOWING —` followed by the complete ready-to-send message for that lane's chat
- `PATRICK: <one plain-English action>`
- `ADVISOR: <infrastructure action>`

Patrick is the courier between chats. A Program authorisation that is not routed does not move and remains stalled in Program context. Summaries such as “tell the lane to proceed” are prohibited; the routed message must contain the finished words in full. If no destination moves, the response must state `ROUTING: nothing moves` so silence is never ambiguous.

## 2026-07-22 — Canonical two-build production-chain seed library commissioned

**Status:** SEED-LIB-001 RULED AND QUEUED; REAL EXECUTION SEQUENCE-BLOCKED.

Patrick nominates two Selector-saved test cases as the initial canonical production-chain library for C5, C6, C7 and downstream acceptance. Their saved Selector selections are the sole run-intake authority; no test, lane or worker may retype, infer or replace run quantity or length. Build 1 explicitly carries 9560 mm × 1. Build 2 uses the quantity and length contained in its saved test case.

**Build 1 — direct, loaded:** DNX 60 Square; Opal 60; 3000K/CRI80 board; DALI-2 DT6 class; target 1000 lm/m; run 9560 mm × 1; Spitfire D25 emergency; PIR 5 m sensor; Suspended; Top Side; White (Textured).

**Build 2 — direct/indirect, loaded:** DNX 80 DI (`Square_DI`); direct Inlay 80 plus Microprism; indirect Rope 80; direct target 1500 lm/m; indirect target 500 lm/m; 5000K/CRI90 board; Fixed (On/Off) on both lanes; Surface Mount; Back Wall side; Black (Textured); EM DC Mains emergency; Microwave sensor; run quantity and length from the saved selection.

These cases intentionally differ in profile, emission mode, optics, board family, CRI class, control class and thermal characteristics. They are the required canonical pair for changed-optic movement and the varied-row proof where placeholder source values are identical. Additional canonical cases may be appended later without changing any C5-C7 schema, ownership rule or contract version.

The acceptance chain must be real and ordered: exact Selector-saved selections and run intake; accepted Engine/public contracts when the Selector action lane is released; Lab resolution of genuine measured evidence; the existing real authority approval and sealer; the existing real `inspectIesReferenceForGeneration` inspection; C5 resolver/load preflight; C6 one-shot in-memory generation; C7 validated opaque artifact handoff; then separately admitted Governance retrieval. Hand-made sealed DTOs, hand-made inspection outputs, substituted optics, substitute board evidence and synthetic production artifacts cannot satisfy canonical acceptance.

If Lab lacks measured evidence, a sealable authority record or exact identity agreement for any selected element, the chain fails closed and reports the exact missing element. No nearest-match, inherited measurement, default evidence, alternate optic, alternate board, placeholder value or manually constructed artifact is permitted.

Current repository evidence shows the C5 feature implementation is pushed and the fixed Lab gate passes 314/314, but the Lab lane still has an unfinished lane-memory closeout and protected local inventory. Program accepts the technical C5 evidence but does not release C6 until that closeout is cleanly committed and returned. Selector WALK-001V remains the sole ready Selector parcel; the seed chain cannot invoke Engine or consume the saved cases until WALK-001 through WALK-007 close in order. The immediate Lab action is C5 lane-memory closeout only. The seed batch is recorded in both affected lane queues as blocked, not executed.

## 2026-07-22 — WALK-001V and C5 accepted; live Ambient verification admitted

**Status:** WALK-001V ACCEPTED; C5 ACCEPTED; WALK-001VA READY; SEED EXECUTION BLOCKED.

Program directly verified the Selector implementation and clean lane closeout. The bounded `systemPolicyAmbient` summary is attached only to the successful-reader current-source shape before any possible write, returns count-only allowlisted evidence, distinguishes approved finite tier-specific evidence from generic-only, non-numeric and unapproved non-proof, keeps duplicate exact rows count-visible, and exposes no policy values, raw rows, unrestricted headers, users or private source material. The fixed Selector gate passes 108/108. WALK-001V is accepted complete.

Program also verifies the pushed Lab C5 technical and memory closeout. The real read-only resolver preflight remains bounded to exact matched contracts, one resolver call, existing inspection validation, one immutable redacted receipt and immediate loaded-body discard. The fixed Lab gate passes 314/314. C5 is accepted complete. C6 remains blocked by SEED-LIB-001 sequencing and is not released.

Program admits **WALK-001VA — managed activation and current-source evidence run** as the sole ready Selector operational parcel. After an Advisor-managed restart of only the Selector runtime, Selector must verify Healthy/Managed state and run the complete guarded dry-run against the current Google source. The new count-only Ambient summary must be present. Return the exact safe Ambient counts and existing Driver identity counts. Any Driver contradiction, missing approved finite tier evidence, validation failure or missing activation stops before every write. No Google Sheet edit, materialisation, archive, promotion, Engine invocation or later walkthrough work is authorised.

The newly routed seed-library recording is incomplete in both lanes. Selector remains clean but has not recorded SEED-LIB-001 in lane memory. Lab has two unstaged lane-memory files: the intended blocked seed entry is present but contains malformed literal `+-` list markers. Program admits docs-only reconciliation in each lane. Selector records the blocked seed batch while performing WALK-001VA closeout. Lab corrects only the two current lane-memory files, preserves all protected local inventory, gates, commits and pushes, and stops. These documentation corrections do not release C6 or seed execution.

## 2026-07-22 — Lab seed-memory correction accepted

**Status:** LAB CORRECTION COMPLETE; SEED-LIB-001 REMAINS BLOCKED.

Program directly verified the Lab correction receipt. The blocked SEED-LIB-001 queue entry now uses normal Markdown list markers, both canonical builds and every real-chain/fail-closed rule remain unchanged, and the fixed Lab gate passes 314/314.

The Lab tracked tree is clean with nothing staged or deleted. The three protected local items remain unchanged and unstaged. No C6, C7, sealing, inspection, resolver execution, LM-63 generation, persistence, retrieval or delivery occurred.

The Lab seed-memory correction is accepted complete. No Lab implementation parcel is released by this acceptance. C6 and all seed execution remain blocked pending the existing Program sequence and separate admission.

## 2026-07-22 — WALK-001VA accepted and guarded WALK-001 rerun released

**Status:** WALK-001VA ACCEPTED; SOURCE CORRECTION REPORTED COMPLETE; GUARDED WALK-001 RERUN READY.

Program directly verified the clean pushed Selector activation receipt and 108/108 gate. The live read proved the prior Driver identity contradiction and absence of approved finite tier-specific Ambient evidence, and every write remained blocked.

Patrick reports the source owner has now corrected only the identified source defects: the misnamed Driver approval/Boolean column has a non-authority header, leaving `native_control_type` unique and protocol-bearing; the existing exact `ambient_temp` row is approved and populated with finite Economy, Business, First and Charter values. `ENG` is removed and deferred pending a separate ruling.

Selector is authorised to rerun the complete original guarded dry-run. It must require unique protocol-bearing canonical Driver authority, no duplicate-normalised Driver authority, one approved exact Ambient row, all four recognised tier columns present and populated, zero non-finite tier tokens, finite approved multi-tier evidence, non-zero Driver-to-Board agreement and every existing source-shape, validation, identity and disclosure guard.

Only after the complete dry-run passes may the existing guarded materialise/archive/promote sequence continue. Archive must succeed before promotion. Stop after WALK-001 for Program review. WALK-002 through WALK-007, Engine, C6/C7, seed execution, CRM, retrieval and delivery remain blocked.

## 2026-07-22 — WALK-001 accepted; WALK-002 Length Mode deletion released

**Status:** WALK-001 ACCEPTED COMPLETE; WALK-002 SOLE READY SELECTOR PARCEL.

Program directly verified the pushed Selector closeout, clean lane state and fixed 108/108 gate. The corrected dry-run passed every source-shape, validation, identity and disclosure guard. The existing guarded workflow then materialised the corrected authority, created the prior-authority archive before promotion, promoted without blockers, and verified the active and materialised authorities aligned.

Program's independent read-only RuntimeData probe confirms the promoted authority is present, readable and parseable, contains all 15 required tables, has a new active fingerprint, returns no blockers or warnings, exposes no rows, headers, users or paths, and permits no write or mutation. WALK-001 is accepted complete.

Program releases **WALK-002 — Length Mode deletion** as the sole ready Selector parcel. First trace the current `runLengthMode` effect read-only, then delete it as Selector authority from run intake, committed/persisted constraints, readiness, summaries, spine/payload preview, option metadata and rendered UI. Preserve run quantity and physical run length as the only run-intake decisions. Do not create, infer or retain any replacement mode, default, sentinel or hidden constraint.

Removal must not narrow source-backed Board candidates or preselect a manufacturing interpretation. All otherwise eligible NVB candidates remain available for downstream Lex scoring. Existing safe-local-intent and no-Engine/no-generation/no-persistence boundaries remain intact.

Authorised production scope is limited to the current proven owners: `packages/modules/cs-selector/selectorRunIntakePreview.js`, `packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js`, `packages/modules/cs-selector/selectorView.js`, `packages/modules/cs-selector/selectorViewModel.js`, and `packages/workspace-kernel/selectorReferenceOptionsService.js`. Focused tests may change only where needed to prove the deletion, including the run-intake, capture-surface, readiness, spine/payload, safe-workflow and golden-witness tests. Any newly discovered production owner outside this list stops for Program review rather than broadening scope.

WALK-003 through WALK-007, Engine, saved seed cases, C6/C7, CRM/provider mutation, persistence, IES, retrieval and delivery remain blocked. Gate, push the exact WALK-002 parcel, reconcile lane memory and stop for Program review; do not continue automatically into WALK-003.

## 2026-07-22 — WALK-002 protected scope stop accepted; complete owner rescope released

**Status:** WALK-002 REMAINS OPEN; WALK-002R SOLE READY SELECTOR PARCEL.

Program directly verified the Selector protected stop. The lane is clean, the fixed gate passes 108/108, and only lane-memory reconciliation was pushed. No production or test implementation, runtime, Engine, RunTable, persistence, source, seed, CRM/provider, artifact or later walkthrough action changed.

The read-only trace proves the first five-file boundary was incomplete. Required current owners outside that boundary still require Length Mode in server-owned registration and exact saved-project validation, fingerprint and default it in the readonly candidate mapper, derive a hidden same-length accessory interpretation, and emit `unresolved` mode sentinels or mode buckets in sealed-candidate and downstream RunTable previews. The previous parcel correctly stopped rather than leaving hidden authority behind.

Program releases **WALK-002R — complete Length Mode owner deletion** as the sole ready Selector parcel. Production scope is expanded to every current production occurrence found by the accepted trace, exactly these eleven files:

- `packages/modules/cs-selector/selectorRunIntakePreview.js`
- `packages/modules/cs-selector/selectorRunAccessoryPlacementPreview.js`
- `packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js`
- `packages/modules/cs-selector/selectorView.js`
- `packages/modules/cs-selector/selectorViewModel.js`
- `packages/workspace-kernel/selectorReferenceOptionsService.js`
- `packages/workspace-kernel/projectEnvelope.js`
- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `packages/workspace-kernel/engineRunTableSealedCandidateAssemblyPreview.js`
- `packages/workspace-kernel/engineRunTableRuntimeRunTableDomainOutputScaffold.js`
- `packages/workspace-kernel/engineRunTableControlledRealSourceSealedEvidenceProbe.js`

Delete `runLengthMode`, `lengthMode`, supported-mode lists and labels, mode-derived readiness and diagnostics, the candidate default to `cut_to_length`, mode fingerprints, `requested_length_basis`, same-length accessory interpretation, downstream mode fields/buckets and `unresolved` mode sentinels. Do not replace any of them with a new field, constant, fallback, default, inference or manufacturing interpretation.

Current and newly emitted run authority contains quantity and positive physical length only. Legacy stored mode data must be discarded at the bounded projection/hydration boundary and must not become active truth, block current validation or be persisted again. Current exact registration and project-envelope validation must require the mode-free shape.

All otherwise eligible source-backed NVB Board candidates must remain equal or broaden for downstream Lex scoring. Candidate identity may fingerprint quantity and physical length but must not fingerprint or derive a mode. Accessory intent remains quantity-bounded only; it must not infer whether repeated quantities share a length basis. Downstream sealed and RunTable previews may report quantity and safe length bands only, with no mode field, bucket, sentinel or proxy.

Focused test edits are confined to tests that currently contain `runLengthMode` or `lengthMode`, plus tests that directly import one of the eleven authorised production files and must change for the exact mode-free shape. No other production file is authorised. If implementation discovers another production occurrence or owner, stop again with the exact trace rather than broadening scope.

Acceptance requires repository-wide production search across `packages` to return zero `runLengthMode` or `lengthMode` occurrences; UI and copy search to return no Length Mode control or requirement; positive quantity plus positive physical length to satisfy run intake; old stored mode input to be ignored and omitted; registration, saved-project validation, candidate mapping, accessory previews, sealed-candidate previews and downstream domain previews to use the mode-free shape; Board candidate breadth to remain equal or broaden; and all no-Engine/no-generation/no-persistence/no-route/no-mutation safety flags to remain intact.

Run all affected focused tests and the complete fixed Selector gate. Commit and push the exact WALK-002R parcel, reconcile lane memory and stop for Program review. WALK-003 through WALK-007, Engine execution, seed execution, C6/C7, CRM/provider mutation, persistence, IES generation, retrieval and delivery remain blocked.

## 2026-07-22 — deletion-test coupling ruled; TEST-AUDIT-001 queued

**Status:** RULE EFFECTIVE IMMEDIATELY; TEST-AUDIT-001 BLOCKED BEHIND WALK-007.

Every WALK parcel that deletes an input, authority, prerequisite, field, control, fallback, sentinel, proxy or interpretation must delete or rewrite in the same parcel every test assertion, fixture expectation and contract lock that encoded the deleted assumption. Production deletion is not complete while its test class survives. Tests with continuing value are rewritten to prove the new absence or replacement authority; tests whose sole purpose was the deleted assumption are removed. Each parcel receipt must report: baseline encoded-assumption assertion count, assertion count deleted, assertion count rewritten, affected test-file count and residual encoded-assumption count. Residual count must be zero unless the receipt identifies an explicitly retained historical/non-runtime fixture approved by Program.

This rule applies immediately to WALK-002R and to every later WALK deletion parcel. It does not authorise unrelated test cleanup, production broadening or speculative refactoring. The fixed lane gate remains mandatory after the coupled production-and-test change.

Program queues **TEST-AUDIT-001 — runtime test-assumption audit** as a blocked future read-only parcel, sequenced immediately after WALK-007 acceptance. Seed execution remains separately blocked and is not released by this ruling. It performs one bounded mechanical audit of the runtime test suite against four criteria:

1. tests asserting deleted user inputs or deleted input authority, including user-entered Tier and Length Mode;
2. tests requiring governance, project, revision or identity preconditions for Engine execution where selections-only authority has superseded them;
3. tests treating future, diagnostic, consequence or disabled fields as readiness prerequisites;
4. fixtures whose supposedly varied rows use identical values, creating a placeholder trap.

TEST-AUDIT-001 makes no production or test edit. Its sole output is a counted kill-list grouped by criterion, test file and assertion/fixture location, with a safe explanation of the encoded obsolete assumption. Program separately approves any deletion or rewrite parcel arising from that kill-list. No automatic cleanup follows the audit.

## 2026-07-22 — WALK-002R twelfth-owner stop accepted; twelve-owner rescope released

**Status:** WALK-002R REMAINS OPEN; AMENDED TWELVE-OWNER WALK-002R SOLE READY SELECTOR PARCEL.

Program directly verified the second protected stop. The Selector lane is clean, the fixed gate passes 108/108, only lane-memory reconciliation was pushed, and no production or test implementation, runtime, Engine, RunTable, persistence, source, seed, CRM/provider, artifact or later walkthrough action changed.

The accepted trace identifies one exact missing production owner: the safe selected-result source projection still allowlists and can emit `requested_length_basis` from controlled geometry. The only other current production occurrences are already inside the authorised candidate mapper. No `requestedLengthBasis` alias exists. Six current test occurrences encode the field or its fixture contract and fall under the mandatory deletion-test coupling rule.

WALK-002R is amended rather than replaced. Its production boundary now contains the previous eleven owners plus the safe selected-result source projection as the twelfth and final currently known owner. Delete the allowlisted/emitted `requested_length_basis` contract effect there, and remove the field from every coupled fixture, exact-shape expectation and downstream contract test that encoded it. Do not delete `length_policy_source` or `accessory_length_policy_source` merely by association; they remain outside the deleted Length Mode assumption unless the implementation proves they directly encode a mode.

Completion search under `packages` must return zero `runLengthMode`, zero `lengthMode`, zero `requested_length_basis` and zero `requestedLengthBasis` occurrences. The receipt must still report baseline encoded-assumption assertions, deleted assertions, rewritten assertions, affected test files and zero residual encoded-assumption assertions. If any additional production owner or alias appears outside the twelve-owner boundary, stop again before edits outside scope.

All prior WALK-002R acceptance rules remain binding: quantity and positive physical length only; no replacement/default/sentinel/proxy/inferred manufacturing interpretation; legacy mode data discarded; registration and saved-project validation mode-free; candidate breadth equal or broader; no Engine/RunTable/IES execution, persistence, routes, POST actions or RuntimeData mutation. Gate, push the exact coupled parcel, reconcile lane memory and stop before WALK-003.

## 2026-07-22 — WALK-002R write-guard stop accepted; exact guard correction published

**Status:** WALK-002R BLOCKED PENDING MANAGED GUARD ACTIVATION; WALK-002RG SOLE READY INFRASTRUCTURE PREREQUISITE.

Program directly verified the clean Selector stop, 108/108 gate and current managed write guard. The twelve-owner implementation trace contains 46 banned-name production occurrences across exactly the authorised owners and no thirteenth owner. The coupled-test baseline is 71 encoded-assumption occurrence lines across 32 test files. No implementation remains changed; deleted 0, rewritten 0 and residual 71 accurately describe the pre-edit stop.

The blocker is permission-only. The current Selector MCP guard already permits all tests and ten of the twelve production owners, but omits exactly the already-authorised run-intake preview and accessory-placement preview files. Program has amended the managed deployment manifest to add those two exact paths and has updated the deployment contract test. No module wildcard, Selector-module wildcard or unrelated write permission is added.

Program admits **WALK-002RG — exact Selector write-guard activation** as the sole ready infrastructure prerequisite. An Advisor applies the published deployment configuration and restarts only the Selector MCP service through the existing manager. The Advisor then verifies the live write guard contains the two exact added files once each, preserves the existing exact-file list, and still excludes broad module wildcards.

WALK-002R resumes only after managed activation is confirmed. The existing worker, parcel, twelve-owner scope, four banned-name searches, deletion-test coupling counts and every safety prohibition remain unchanged. Do not restart Selector Runtime, edit production, start another worker, begin WALK-003 or execute TEST-AUDIT-001 during guard activation.

## 2026-07-22 — post-WALK audit sequence expanded with POLICY-MAP-001

**Status:** TEST-AUDIT-001 AND POLICY-MAP-001 BLOCKED FUTURE READ-ONLY PARCELS; CURRENT WALK-002RG PRIORITY UNCHANGED.

Program confirms the existing immediate deletion-test coupling rule without duplication: every WALK deletion parcel removes or rewrites in the same parcel every test assertion, fixture expectation and contract lock that encoded the deleted assumption, and reports baseline, deleted, rewritten, affected-file and residual counts. Residual remains zero unless Program explicitly approves a historical non-runtime fixture.

The post-WALK sequence is now: WALK-007 acceptance → TEST-AUDIT-001 → POLICY-MAP-001. Both audits are read-only, one parcel at a time, and neither authorises automatic deletion, implementation, Engine execution, seed execution, persistence, source mutation or delivery.

**TEST-AUDIT-001** remains exactly as ruled: one bounded mechanical runtime-test audit across deleted inputs, governance preconditions on Engine execution, future/diagnostic fields treated as prerequisites and identical-row fixture placeholder traps. Its output is a counted kill-list for separate Program deletion approval.

Program records **POLICY-MAP-001 — SYSTEM_POLICY consumer map** as the second blocked future audit. NVB is the authority and policy data leads code. Patrick reports SYSTEM_POLICY currently contains 133 rows and now includes a consumer-group column. The exact consumer-group header is not yet authority: the pending Selector reader contract must name and lock that header before any code consumes the column or before POLICY-MAP-001 is admitted to run.

After WALK-007, TEST-AUDIT-001 and the accepted reader contract, POLICY-MAP-001 performs one bounded read-only audit of every current SYSTEM_POLICY item. Its primary output is exactly one table with one row per current policy item and these three classifications only:

- `CONSUMED-VERIFIED` — the exact consuming file and function are named and the read matches the current item name and shape;
- `CONSUMED-STALE` — the exact consuming file and function are named and the read uses a superseded name or shape;
- `NO CONSUMER YET` — no current code consumer exists.

The consumer-group column is the table spine. The audit records the current item identity, consumer-group value, classification, exact file/function where applicable and concise evidence. It does not expose policy values unless separately authorised. Any code read that cannot map to one of the current source rows is a blocking orphan-consumer exception in the audit receipt and must not be represented as a synthetic extra policy row.

POLICY-MAP-001 exists to show which policy groups await implementation, feed later widening briefs, expose stale consumers and catch reads for policy identities that no longer exist. Its output creates no implementation authority; Program separately admits every resulting repair or widening parcel. Seed execution remains separately blocked and is not released by either audit.
