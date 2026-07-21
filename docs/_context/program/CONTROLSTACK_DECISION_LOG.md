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
