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

### Authoritative chain

For one selected optic:

1. Selector supplies only the user-selected room ambient, `selectedRoomTaC`.
2. Lab supplies the measured optic thermal evidence:
   - `referenceRoomTaC` — ambient measured during the Lab thermal test;
   - `referenceInternalTaC` — internal assembly temperature measured during that same test;
   - `opticInternalDeltaTaC` — the measured rise, exactly `referenceInternalTaC - referenceRoomTaC`.
3. Engine alone calculates `derivedInternalTaC = selectedRoomTaC + opticInternalDeltaTaC`.
4. Engine uses `derivedInternalTaC` as the temperature input to the board lumen/temperature curve lookup.
5. Engine returns the verified temperature-adjusted lm/m result and the safe derivation summary.

Example binding behaviour:

- Lab evidence: room 25°C, internal 35°C, rise 10°C.
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
- `opticInternalDeltaTaC`;
- measurement/evidence reference and authority state.

The triplet must satisfy `referenceInternalTaC - referenceRoomTaC === opticInternalDeltaTaC` exactly after canonical decimal normalisation. Otherwise it fails closed. Lab may display all three values but must not publish a user-specific `derivedInternalTaC`.

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
3. Per-optic lookup: one fixture optic must use a deliberately different rise value; with identical room ambient and curve data, the derived lookup temperature and lm/m output must change.
4. No constant: the test must fail if the implementation hardcodes the current placeholder value 35 or a fixed rise.
5. No double count: the rise is applied exactly once.
6. Provenance: the rise must be bound to the selected optic identity and the accepted Lab evidence/reference.
7. Fail closed: missing, malformed, contradictory or unbound thermal evidence blocks verification.
8. Clamping: only Engine may clamp the final derived lookup temperature to the supported 25–65°C curve range, while preserving both the unclamped derived value and clamp state in the safe summary.

### Parity audit rule

The planned lm/m parity audit must compare Runtime behaviour against the approved data model and these equations. Donor code is not an acceptance oracle because it contains the same inherited omission. Donor comparison may be recorded only as historical evidence, never as proof of correctness.

No Selector, Lab or Engine feature implementation is authorised by this ruling. Each affected parcel must cite this decision and return for scope approval if its existing seam conflicts with it.
