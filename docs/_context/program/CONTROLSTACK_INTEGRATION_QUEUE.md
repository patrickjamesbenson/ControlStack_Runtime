# ControlStack Integration Queue

**Authority:** Program-owned queue for parcels that cross lanes or require Program acceptance.  
**State date:** 2026-07-17, Australia/Sydney.  
**Rule:** Queue position is not permission to implement. Each item requires a bounded worker commission.

## Status vocabulary

- `READY FOR EVIDENCE CHECK` — bounded parcel exists, but Program must verify it.
- `BLOCKED` — a named dependency or evidence gap prevents commissioning or acceptance.
- `HELD` — deliberately deferred; workers must not start it.
- `UNKNOWN` — current lane evidence has not been supplied.
- `COMPLETE` — accepted through Program with exact commit and gate receipt recorded.

## Priority 0 — Establish durable program memory

**Status:** DOCUMENTATION AND GATE COMPLETE; commit/push receipt is established by the containing commit and connected-app completion result. **VERIFIED gate: 18 passed, 0 failed.**  
**Owner:** Program & Integrate.  
**Paths:** the seven files under `docs/_context/program/`.

### Acceptance criteria

- Identity and capabilities verified.
- No equivalent authoritative documents duplicated.
- Exactly seven named documentation files created or updated.
- No feature-code changes.
- Only those seven paths staged.
- `program-integrate` gate green.
- Gated commit message: `docs(program): establish durable orchestration memory`.
- Current Program branch pushed through the gated path.

### Evidence required

Final status, exact file list, gate count, commit hash, push result, and clean/known final Git state.

## Priority 1 — Obtain fresh lane memory parcels

**Status:** BLOCKED pending lane-generated handoffs. **REPORTED need / UNKNOWN current lane evidence.**

### 1A. Selector & Engine lane memory

Required from `lane/selector-engine`:

- current `repo_info`, `repo_git_status`, and `repo_git_recent` evidence;
- six canonical lane context documents under `docs/_context/lanes/selector-engine/`, unless an existing canonical location is found;
- exact HEAD and base relationship;
- current feature defects and live runtime status;
- current gate receipt;
- exact working-tree inventory;
- seam impact against Engine output and Lab handoff.

**Acceptance:** Program verifies identity, document scope, green `selector-engine` gate, exact commit, and clean or completely classified tree.

### 1B. Lab & IES lane memory

Required from `lane/code-pilot-lab`:

- current `repo_info`, `repo_git_status`, and `repo_git_recent` evidence;
- six canonical lane context documents under `docs/_context/lanes/lab-ies/`, unless an existing canonical location is found;
- exact intentional modified/untracked IES inventory;
- exact paths of the two removed Selector leaks and proof they remain absent;
- donor-readonly confirmation;
- current specification/demo status;
- current green `lab-ies` gate receipt;
- exact commit containing only lane-memory documents.

**Acceptance:** Program confirms no feature dirt was staged, reset, cleaned, or swept into the memory commit.

## Priority 2 — Reconcile accepted bases and current lane heads

**Status:** BLOCKED by Priority 1.  
**Owner:** Program & Integrate.

### Work

- Compare fresh Selector and Lab heads with Program HEAD.
- Identify commits present in one lane and absent in another.
- Classify each difference as accepted, pending, superseded, experimental, or unexplained.
- Record a safe integration order without mutating feature lanes.

### Acceptance criteria

- No unexplained commit is integrated.
- Every accepted parcel has source-lane gate evidence.
- Seam dependencies determine order.
- Program integration gate is green after each bounded acceptance parcel.

## Priority 3 — Stabilise the Engine output contract

**Status:** BLOCKED / UNKNOWN.  
**Dependency:** Fresh Selector handoff and explicit schema evidence.

### Required deliverables

- Versioned Engine selected-result/run-table output contract.
- Deterministic blocked/error semantics.
- Producer schema/fixture tests.
- Runtime readback compatibility tests.
- Lab/IES consumer compatibility evidence.
- Decision-log approval declaring the contract stable.

### Acceptance criteria

- Producer and consumer gates green.
- No hidden UI-state dependency.
- Replay/readback identity is explicit.
- Downstream artifact activation criteria can be evaluated.

## Priority 4 — Validate Selector direct Control / Protocol live authority

**Status:** UNKNOWN current defect state.  
**Dependency:** Fresh Selector live evidence.

### Context

Recent commits visible in the shared history address direct-only control/protocol applicability, live authority intersection, reference snapshot caching, and wildcard system applicability. **VERIFIED commit subjects.** A prior live report stated that `controlType` was blocked with zero options while `system` and `cctCri` were available. **REPORTED historical defect.** Whether HEAD `08df070…` resolves the live payload is **UNKNOWN** here.

### Acceptance criteria

- Direct inspection of `/api/selector-reference/options` at the current Selector runtime.
- `controlType` availability is explained by source evidence, not UI fallback.
- Tests and live payload agree.
- Exact failing or repaired boundary is recorded.
- `selector-engine` gate green.

## Priority 5 — Activate downstream-artifacts tunnel

**Status:** HELD.  
**Dependency:** Priority 3 complete and Program decision approval.

No implementation or activation is authorised until the Engine output contract is stable and all activation conditions in `CONTROLSTACK_SEAM_CONTRACTS.md` are met.

## Priority 6 — Secure tunnel restart automation

**Status:** IMPLEMENTED IN REPOSITORY; WINDOWS INSTALLATION AND POST-REBOOT ACCEPTANCE PENDING.  
**Dependency:** One fresh OpenAI runtime key copied to the Windows clipboard, additive installation, one Windows restart, and an eight-service verification receipt.

### Acceptance criteria

- Restarts are bounded and observable.
- Health checks are truthful.
- Backoff and failure surfacing are defined.
- No feature behaviour changes.
- Program-approved operational gate and handoff exist.

## Priority 7 — Define Program-to-main promotion procedure

**Status:** BLOCKED / UNKNOWN.  
**Dependency:** Explicit authorised tool path and branch policy.

### Required decision

- promotion branch/target;
- merge or fast-forward policy;
- required release gate;
- approver;
- rollback procedure;
- evidence retention.

The current connected app does not itself establish permission to mutate main. No worker may infer that permission.

## Queue admission template

Every new queue item must state:

1. business objective;
2. producing lane;
3. consuming lane or surface;
4. exact bounded task;
5. files in scope;
6. files explicitly out of scope;
7. dependencies and seam version;
8. acceptance criteria;
9. required focused tests and named gate;
10. expected handoff and Git state;
11. evidence classification;
12. Program approval status.

Chat requests that lack this envelope remain coordination input, not an accepted integration parcel.

## 2026-07-18 accepted-head reconciliation and safe queue order

### Priority 1 closeout

- Selector lane memory: **COMPLETE** at `678cf83c9f97bfcdc397b574c4eab08b306656ee`, gate 100/100, pushed, clean.
- Lab lane memory: **COMPLETE** at `1b154c482978a9c77a9ea5325cd103bfe40b14ed`, gate 147/147, pushed; 10 modified and 66 untracked IES paths remain protected outside the accepted commit.
- Secure tunnel/service restart acceptance: **COMPLETE**; all eight services READY / MANAGED.

### Priority 2 — reconcile accepted bases and lane heads

**Status:** COMPLETE AS AN EVIDENCE/ORDERING PARCEL. No feature commit was merged or activated.

| Lane head | Classification | Queue treatment |
|---|---|---|
| Selector `678cf83c9f97bfcdc397b574c4eab08b306656ee` | accepted lane-memory anchor | retain as the evidence baseline for the next Selector parcel; do not merge merely to import lane-local docs |
| Lab `1b154c482978a9c77a9ea5325cd103bfe40b14ed` | accepted lane-memory anchor | retain as the evidence baseline; preserved dirty IES paths are pending lane-local bounded checkpoints, not accepted integration content |
| Program `eaa6d93f73163150028b361c16a2f194b687b68a` | accepted Program history at reconciliation start | owns this dependency and ordering record |

Exact cross-branch ancestry is **UNKNOWN** through the Program app. Integration will use explicit future base/head ranges and changed-path evidence rather than inferred cherry-pick ranges.

### Safe integration queue

1. **NEXT — Selector producer closeout:** the Selector lane completes its committed single-slice E2E closeout and supplies the exact Seam A/B contract, changed paths, focused tests, `selector-engine` result, and base/head range.
2. **THEN — Program producer acceptance:** Program reviews and accepts that immutable Selector parcel alone, runs `program-integrate`, and records the accepted Engine schema/version and blocked/error semantics.
3. **LANE-LOCAL / NON-BLOCKING:** Lab may checkpoint independent IES work in bounded slices while preserving unrelated dirt. Such checkpoints do not become Engine-consumer integration parcels unless they declare a Seam C impact.
4. **HELD FOR PRODUCER ACCEPTANCE — Lab consumer compatibility:** after step 2, Lab validates or adapts the safe handoff against the exact accepted Engine contract and supplies Seam D evidence with `lab-ies` green.
5. **THEN — Program consumer acceptance:** Program accepts the Lab consumer parcel separately and runs `program-integrate` again.
6. **DECISION GATE:** only after steps 2 and 5 may Program consider Priority 3 complete and declare the Engine output contract stable.
7. **HELD:** Priority 5 downstream-artifacts activation and Priority 7 main promotion remain unauthorised.

### Dependency rationale

The producer/consumer chain is `Selector authority -> selected-result persistence -> RunTable output contract -> Lab safe handoff -> Lab evidence -> Program acceptance`. Current repository contracts are diagnostic/read-only/fail-closed and keep production RunTable/IES output disabled, so consumer widening before producer acceptance would freeze an unapproved shape.

## Immediate operational blocker — shared path-confined commit capability

**Status:** BLOCKED pending repair in `lane/controlstack-tooling-v2`.

### Accepted evidence

- Lab P2 Checkpoint 1 is staged as exactly four authorised files.
- Focused tests are green 5/5 and `lab-ies` is green 147/147.
- The live `repo_green_commit_push` rejected the parcel solely because unrelated protected modified and untracked paths remain unstaged.
- No commit or push occurred; the staged parcel and protected dirty inventory remain intact.

### Required tooling parcel

**Producing lane:** dedicated shared tooling worktree `C:\ControlStack_Worktrees\controlstack-tooling-v2`, branch `lane/controlstack-tooling-v2`.

The repair must:

1. retain exact `expected_staged_paths` equality;
2. retain fresh named-gate and required-branch checks;
3. allow unrelated modified and untracked paths to remain unstaged;
4. refuse any staged path with additional unstaged changes;
5. refuse deleted paths and staged-set mismatches;
6. commit only the Git index and preserve all unrelated working-tree state;
7. include regression tests covering successful preserved-dirt commit and all refusal cases;
8. commit and push only the tooling lane;
9. restart the Lab MCP service and verify its identity before retrying Lab.

### Recovery order

1. Repair and activate the shared tooling service.
2. Resume the existing Lab staged parcel; do not recreate or restage other work.
3. Rerun `lab-ies`, commit with `lab: checkpoint canonical keyword foundation`, push `lane/code-pilot-lab`, and update the durable Lab handoff.
4. Only after that closeout may Program authorise the two-file `iesWorkingRecord` checkpoint.

No further Lab feature slice is authorised while this blocker remains open.

## 2026-07-19 — Tooling repair closeout and first Lab promotion intake

**Status:** SHARED-TOOLING BLOCKER SUPERSEDED; LAB PROMOTION AWAITING EXECUTABLE PROGRAM CONNECTION.

### Reported lane evidence

- Shared-tooling guard repair is committed and pushed at `2e4d880` on `lane/controlstack-tooling-v2`.
- Lab accepted and pushed checkpoints awaiting promotion: `bda7d61` reference-driven IES generation, `a2142952` project IES generation, `8749bbe1` documentation closeout, and `d0577a9d` queue refill.
- Selector context migration is reported pushed at `832684b4`, gate 103/103.

These lane hashes are current coordination input but cannot be independently resolved through the present Program connection.

### Program capability finding

The verified CS Integrate app is confined to `C:\ControlStack_Worktrees\program-integrate` on `lane/program-integrate`. It exposes no read access to the pushed Lab branch or target `main`, no pull-request create/update/merge operation, no dedicated integration worktree, and no guarded push-to-`main` capability. Therefore the active main-promotion policy is not executable from this connection.

### Blocker and owner

- **Blocker:** missing Program promotion capability, not a Lab parcel defect.
- **Owner:** Program & Integrate tooling/connection authority.
- **Required next action:** provide a promotion-capable Program surface with source-lane and `main` read access, candidate diff/ancestry, PR create/update/merge or dedicated integration-worktree operations, integrated-state gates, and guarded main push. Program must then assess the exact Lab commits before merging; no file-copy or `lane/program-integrate` substitute is authorised.

## 2026-07-19 — LAB-017 seam approval intake

**Status:** HELD PENDING EXACT LAB ENVELOPE.

### Current evidence

- LAB-016 offline fixture snapshot is reported complete and pushed.
- Focused, full, feature-commit, and documentation checks are reported green at 159/159.
- Final Lab state is reported as zero staged, zero modified, 33 protected untracked, and zero deleted paths.
- No Lab queue item is currently ready, and no LAB-017 implementation has begun.

### Program decision

LAB-017 is not admitted for implementation because Program memory does not contain its exact seam contract or acceptance envelope. The Lab lane must record the item’s objective, producer/consumer boundary, old/new contract, exact in-scope and prohibited files, LAB-016 dependency, compatibility/rollback rule, tests, `lab-ies` gate, dirty-tree protections, and expected immutable handoff evidence.

### Owner and next state

- **Owner of missing evidence:** Lab orchestrator.
- **Owner of approval decision:** Program & Integrate.
- **Current action:** none for Patrick; LAB-017 remains stopped until the lane-generated envelope is available for Program review.

## 2026-07-19 — Selector Tier authority seam parcel

**Status:** APPROVED WITH CONDITIONS; READY FOR SELECTOR IMPLEMENTATION.

### Approved scope

- Remove manually committed Tier from Selector registration eligibility.
- Remove Tier as a required or authoritative field in Selector candidate construction.
- Derive and bind Tier only at the existing server-owned Engine/Lex execution boundary.
- Replace the generic eligibility refusal with a specific diagnostic for the actual unsatisfied condition.

### Mandatory constraints

- Preserve every other required Selector input and source-authority check.
- Preserve read-only/no-write behaviour and the prohibition on automatic Control selection.
- Do not invent, default, cache, guess, or accept caller-supplied Tier as authority.
- Fail closed with a specific Tier-derivation blocker when the Engine/Lex boundary cannot derive Tier uniquely.
- Preserve the downstream Tier result field name, meaning, and authority; output-shape changes require separate approval.

### Acceptance evidence

The Selector lane must return exact base/head commits and changed paths, old/new contract fixtures, focused tests covering absent and injected Tier plus successful/ambiguous/unavailable derivation, live or sealed registration and Engine invocation evidence, `selector-engine` green, final Git state, push receipt, and updated lane memory.

### Consumer treatment

No Lab implementation is authorised. Lab & IES is a potential compatibility consumer only if it reads the derived Tier result; any discovered incompatibility becomes a separate bounded Lab parcel after the Selector producer parcel is accepted.

## 2026-07-19 — LAB-017 version-1 implementation admission

**Status:** APPROVED; READY FOR LAB IMPLEMENTATION.

### Admission basis

The committed version-1 Lab seam envelope is approved unchanged on the reported evidence: exact public interface and data shapes, exact two-file implementation scope, complete current-consumer compatibility break, safe rollback sequence, complete success/rejection/immutability/leak-prevention/boundary tests, no implementation started, no other seam included, and `lab-ies` 159/159.

### Authorised work

- Move LAB-017 from `blocked` to `ready`.
- Commission one bounded Lab worker against the immutable version-1 envelope.
- Change only the two implementation files named by that envelope, plus the required Lab context closeout files.
- Preserve all protected dirty paths outside the staged and committed set.

### Program-owned exclusions

Production serial allocation, resolver hosting, route-to-storage mapping, persistence, authentication, deployment, and endpoint ownership remain outside LAB-017 and remain Program-owned.

### Acceptance return

Lab must return the exact envelope and implementation commits, complete changed-path inventory, focused test receipt for every envelope test class, full `lab-ies` receipt, exact staged-set proof, final Git inventory, push receipt, and updated lane handoff. Any interface, shape, consumer, ownership, rollback, test, file-scope, or seam expansion requires new Program approval.

## 2026-07-19 — LAB-017 completion intake and LAB-018 hold

**Status:** LAB-017 COMPLETE AS REPORTED; ACCEPTANCE RECEIPT INCOMPLETE. LAB-018 BLOCKED.

### Reported LAB-017 result

- Version-1 implementation is reported complete without seam drift.
- Only the reference/resolver helper and its dedicated test were committed.
- Focused, full, feature-commit, and documentation-closeout validation passed 169/169.
- Feature and documentation checkpoints were pushed only to the Lab lane.
- Final state is zero staged, one expected HEAD-marker edit, 32 protected untracked, and zero deleted paths.

### Acceptance intake still required

Program acceptance remains open until the Lab handoff carries the exact envelope, feature, and documentation commit identities; exact implementation path names; exact staged-set proof; and final classified Git receipt. This does not authorise rework and does not invalidate the reported green result.

### LAB-018

This historical LAB-018 hold is superseded by the consolidated seven-seam approval below. LAB-018 no longer requires a separate envelope decision; readiness is governed by the one-parcel-at-a-time sequencing rule.

## 2026-07-20 — LAB-017 final acceptance closeout

**Status:** ACCEPTED; AWAITING SEPARATE MAIN-PROMOTION CAPABILITY.

### Acceptance closure

The Lab handoff is reported to contain the complete immutable LAB-017 receipt: exact envelope, feature and documentation commits, exact two implementation paths, exact staged-set proof, final classified Git inventory, push evidence, and `lab-ies` 169/169. Program therefore closes the LAB-017 acceptance intake with no amendments and no rework.

### Queue consequence

- LAB-017 is complete and accepted as a lane parcel.
- LAB-017 is not yet promoted to `main`; that remains a separate integration action.
- The earlier LAB-018 envelope hold is superseded by the consolidated decision below; readiness remains sequence-controlled.
- No action from Patrick.

## 2026-07-20 — Consolidated seven-seam admission

**Status:** ALL SEVEN SEAM-APPROVED; ONE PARCEL AT A TIME.

### Admission decision

- The six non-kernel seams named in the immutable consolidated Lab envelope are approved unchanged.
- The governed reference-composition kernel is approved only with exactly two unique non-merged parents, order-significant provenance, exact matching photometric grids with no interpolation or resampling, and all allocation, authority, approval, and sealing outside the kernel.
- The kernel must reject duplicate parents, already-composed parents, provenance loss or reordering, grid mismatch, and governance-boundary expansion.

### Queue operation

Only the next eligible Lab parcel may move to `ready`. Every later approved parcel remains sequence-blocked until the active parcel is completed, pushed, closed out, and its final state is safe. Parallel workers or combined implementation parcels are not authorised.

### Acceptance return

Each parcel must cite the immutable consolidated-envelope commit and this Program approval, preserve its exact approved file and consumer boundary, pass its focused checks and full `lab-ies` gate, commit and push only the Lab lane, and return an exact immutable receipt. Any drift requires a new Program decision. No action from Patrick.

## 2026-07-20 — LAB-029 provenance publication admission

**Status:** SEAM APPROVED UNCHANGED; READY WHEN NEXT ELIGIBLE.

### Admission basis

- Immutable Lab envelope checkpoint: `7b74ca49665007311f6dbb8cfdccc47be5472353`.
- Queue item: `LAB-029-provenance-publication-surfaces`.
- Reported validation: `lab-ies` 255/255 with no failures, cancellations, skips, or todo tests.
- Reported state: documentation-only checkpoint, LAB-029 still blocked, and no implementation started.

### Exact authorised implementation scope

- `packages/lab-kernel/ies-toolkit/provenance.html`
- `packages/lab-kernel/ies-toolkit/provenance_explorer.html`
- `packages/lab-kernel/ies-toolkit/luminaire_provenance.html`

### Queue operation

LAB-029 may move from `blocked` to `ready` unchanged when the Lab lane confirms it is the next eligible parcel and no other parcel is active. No parallel or combined implementation is authorised.

The parcel is confined to presentation of safe identity, host-free resolver availability, and evidence-capability projections. Governed mode uses Program-supplied projections; offline mode uses committed safe fixtures and must display `OFFLINE DEMO — UNAPPROVED`. Emergency and EWIS verification remain `null`.

### Acceptance return

Lab must return the immutable feature and documentation receipts, exact three-file implementation scope, focused governed/offline/null/leak-prevention evidence, full `lab-ies` green, exact staged-set proof, protected-dirt exclusion, final Git inventory, push evidence, and updated handoff. Any view-model, ownership, resolver, publication-state, capability, or scope drift returns LAB-029 to blocked for a new decision.

## 2026-07-20 — Canonical-keyword migration guard corrective admission

**Status:** APPROVED AS THE SOLE READY LAB PARCEL; LAB-033 TEMPORARILY PAUSED.

### Exact scope

- `tests/lab-kernel/iesKeywordMigration.test.js`

### Required queue order

1. The one-file migration-guard correction is the sole ready item.
2. After full `lab-ies` green, commit that test-only parcel separately.
3. Commit its Lab documentation closeout separately.
4. Restore LAB-033 as the sole ready item and rerun its full gate without weakening the bench.
5. Preserve the later final keyword-guard parcel for post-LAB-033 cross-cutting coverage.

### Contract retained

The correction removes stale requirements for editable `sysTa` ambient and literal `canonicalKeywordRows(...)` implementation text, while retaining the exact ordered 16-keyword profile, rejection of `_AMBIENT_TA_C`, supplementary keywords and aliases, committed-contract consumption by Main Bench, sealed/non-editable `_INTERNAL_AMBIENT_TA_C`, and all generator/merge/summary/project-builder vocabulary checks.

LAB-033 remains incomplete, unstaged, and unpushed until this corrective parcel and its documentation closeout are durable. No production file is authorised.

## 2026-07-20 — LAB-033/LAB-034 completion and LAB-035 admission

**Status:** LAB-033 DONE; LAB-034 DONE; LAB-035 APPROVED AS SOLE READY ITEM.

### Accepted completion

- LAB-033 Main Lab Bench is accepted as non-authoritative and module-driven.
- LAB-034 legacy Lab Bench is accepted as a read-only compatibility inspector.
- Verified full `lab-ies`: 255/255.
- Verified final protected inventory: zero staged, one expected HEAD-marker edit, seven protected untracked items, zero deleted.

### LAB-035 immutable envelope

- Checkpoint: `1c422dec0cb4efb0777d61bebcf6cf4ee9a33a5f`.
- Queue item: `LAB-035-selector-contract-stub`.
- Exact feature scope: `packages/lab-kernel/ies-toolkit/selector_stub.html` only.

### Queue operation

LAB-035 may move from `blocked` to `ready` as the sole active Lab parcel. LAB-036 and later work remain sequence-blocked.

The page may validate and display only the approved reference identity, safe runtime handoff and bounded Selector readiness presentation projection. Governed mode performs no lookup. Offline mode must display `OFFLINE CONTRACT DEMO — NOT SELECTOR ACCEPTANCE`.

### Acceptance return

Lab must return the exact one-file feature commit, separate documentation closeout, full `lab-ies` green, proof that upload/scaling/selection/defaulting/generation/execution/persistence/routes are absent, final protected inventory and push evidence. Any additional file or contract drift returns LAB-035 to blocked.

## 2026-07-20 — Cross-lane thermal-chain ruling

**Status:** BINDING; SEL-018 BLOCKED PENDING AMENDMENT.

### Ownership

- Selector passes only user-selected room ambient, unchanged.
- Lab publishes the selected optic's measured thermal triplet and evidence binding: `referenceRoomTaC` from legacy `room_ta_c`, `referenceInternalTaC` from misleading legacy `optic_internal_delta_ta_c`, and actual `opticThermalRiseTaC` from legacy `optic_uplift_ta_c`.
- Engine alone calculates `derivedInternalTaC = selectedRoomTaC + opticThermalRiseTaC`, uses that value as `curveLookupTaC`, applies the supported curve clamp/interpolation and returns verified lm/m.
- Program owns adapter validation and cross-lane acceptance.

The sealed `_INTERNAL_AMBIENT_TA_C` remains the Lab authority-test internal measurement. It is not overwritten by the Engine's runtime-derived operating temperature.

### Required queue changes

- Amend SEL-018 before it becomes ready: room ambient must not be passed as lookup temperature.
- Any Lab parcel touching ambient/internal/rise must publish raw measured evidence and must not derive a user-specific internal temperature.
- Any Engine parcel touching curve lookup must consume the Program-validated room value plus the optic-bound Lab rise and must reject caller-supplied derived/lookup temperature.

### Binding acceptance

Tests must prove 25 + 10 = 35 and 35 + 10 = 45; map legacy `optic_internal_delta_ta_c = 35` to absolute reference internal temperature and legacy `optic_uplift_ta_c = 10` to rise; vary one optic fixture's `optic_uplift_ta_c` so both lookup temperature and lm/m change; prove the rise is applied once; reject missing, contradictory or identity-unbound evidence; and audit Runtime against the approved data model rather than donor code.

The ambiguous cross-lane field name `opticInternalDeltaTaC` is prohibited. Program adapters must expose `referenceInternalTaC` and `opticThermalRiseTaC`. A separate data-model correction should rename the legacy source fields to `optic_reference_internal_ta_c` and `optic_thermal_rise_ta_c`.

## 2026-07-21 — SEL-018 amended and admitted

**Status:** SEL-018 READY AS THE SOLE SELECTOR ITEM; THERMAL ENGINE WORK REMAINS BLOCKED.

### Exact Selector scope

- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `tests/selectorReadonlyEngineCandidateMapper.test.js`

### Required result

The mapper must require the committed, source-backed Ambient choice and emit only `selectedRoomTaC` as the user's unchanged Celsius room value. It must not emit or calculate Lab reference values, optic rise, derived internal temperature, lookup temperature, board temperature or verified lm/m.

Missing, malformed, duplicate, non-committed or non-source-backed Ambient blocks the amended handoff. Selector does not clamp the room value. Existing non-thermal candidate fields remain unchanged.

### Sequence

1. SEL-018 is the sole ready Selector parcel.
2. LAB-035 remains the sole ready Lab parcel independently.
3. The corrected Lab thermal-publication parcel remains blocked until separately admitted.
4. Engine thermal derivation remains blocked until accepted SEL-018 and Lab evidence receipts exist.
5. Final cross-lane acceptance must use a varied legacy `optic_uplift_ta_c` fixture and prove the rise is applied once.

No broad Selector module permission, route, persistence path, Engine invocation change or Lab lookup is authorised.

## 2026-07-21 — Corrected Lab thermal semantics batch admitted

**Status:** LAB-038 READY AS THE SOLE LAB ITEM; LAB-039 THROUGH LAB-042 APPROVED BUT SEQUENCE-BLOCKED.

Program approved `LAB-038_042_THERMAL_SEMANTICS_SEAM_ENVELOPE.md`, version 1, unchanged after reviewing the pushed Lab proposal and its 255/255 gate.

### Ordered parcels

1. LAB-038 corrects NVB resolution thermal semantics and advances that schema to version 2.
2. LAB-039 corrects component optic projection semantics and advances that schema to version 2.
3. LAB-040 corrects the Lab working projection, advances that schema to version 2 and keeps thermal authority explicitly unresolved.
4. LAB-041 corrects the read-only component-library labels.
5. LAB-042 adds the final test-only thermal semantics guard.

Only LAB-038 is ready. Each later parcel remains blocked until the prior dependency is complete and closed out.

### Binding boundary

The Lab batch maps legacy 25/35/10 source evidence to measured reference room 25, absolute reference internal 35 and rise 10. It validates the measured triplet exactly, varies legacy `optic_uplift_ta_c` for the per-optic proof, emits no legacy semantic aliases and performs no Engine calculation. Source fixtures, source-model names, Program adapters, Selector files and Engine files are outside this batch.

The batch does not establish accepted cross-lane thermal evidence. Program evidence validation and Engine thermal derivation remain blocked pending a later separately approved provenance/adapter parcel and accepted Selector receipt.

### LAB-038 atomic transition amendment

The mandatory full Lab gate proved that the resolver-only version bump cannot be checkpointed because the Lab adapter imports the resolver schema constants directly. LAB-038 is therefore amended to include the resolver module/test and the adapter module/test in one atomic four-file checkpoint.

The adapter change is transition-only: accept corrected resolution version 2 and corrected optic input names, retain adapter projection version 1, preserve its current non-thermal output and publish no thermal evidence or authority. LAB-040 remains responsible for adapter projection version 2 and the unresolved thermal-evidence object. LAB-038 remains sole ready; later parcels remain blocked.

### LAB-042 gate-included test-file amendment

LAB-038 through LAB-041 are complete and green. The previously approved new LAB-042 test file is not executed by the fixed Lab gate, so it cannot provide valid self-testing acceptance evidence.

LAB-042 is amended to exactly `tests/lab-kernel/iesKeywordMigration.test.js`, which is already included in every full Lab gate. The new test file must not be created. Acceptance, feature subject and test-only boundary remain unchanged. LAB-042 is the sole ready Lab item; no production source, fixture or gate configuration may change.

## 2026-07-21 — Thermal chain completion queue

### Lab receipt

**Status:** COMPLETE / ACCEPTED.

LAB-038 through LAB-042 are complete and pushed. The final Lab gate passed 262/262. The accepted producer contract is `controlstack.lab.nvb-lab-projection.v2` with corrected measured thermal semantics and unresolved Lab authority.

### SEL-018

**Status:** READY — sole active Selector parcel.

Exact files remain:

- `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`
- `tests/selectorReadonlyEngineCandidateMapper.test.js`

Acceptance requires `selectedRoomTaC` only, no thermal calculation, fail-closed Ambient authority and preservation of existing non-thermal candidate fields.

The isolated Selector worktree is now correctly connected on `lane/selector-engine` and is clean. The mapper still has no `selectedRoomTaC`, so no SEL-018 implementation receipt is accepted. The live service allowlist permits the exact two feature/test paths but still omits the lane-document scope already present in the current Program manifest; SEL-018 remains ready in Program but must not start until that installed configuration is refreshed and the Selector queue is reconciled. No main file may be changed.

### THERM-P1 — Program thermal-evidence validation adapter

**Status:** APPROVED / BLOCKED BY SEL-018 ACCEPTANCE.

Exact files:

- `packages/workspace-kernel/labThermalEvidenceProgramAdapter.js`
- `tests/labThermalEvidenceProgramAdapter.test.js`

The parcel validates Selector room/optic intent, Program source binding and the exact Lab v2 measured evidence. It emits only the accepted Program thermal bundle and performs no Engine calculation.

### THERM-E1 — Engine thermal lumen execution

**Status:** APPROVED / BLOCKED BY THERM-P1 ACCEPTANCE.

Exact files:

- `packages/workspace-kernel/runtimeThermalLumenExecution.js`
- `tests/runtimeThermalLumenExecution.test.js`

The parcel applies the accepted optic rise exactly once, delegates to the committed curve parse/interpolation contract and returns the safe thermal/output result. Direct Lab input and caller-supplied derived or lookup temperatures are rejected.

### Required order

1. complete and accept SEL-018;
2. complete and accept THERM-P1;
3. complete and accept THERM-E1 with the mandatory varied-optic rise/output proof;
4. run final Program cross-lane acceptance;
5. only then reconsider Engine-contract stability, downstream artifacts and main promotion.

The unfinished runtime-port work in main is outside this queue and must remain untouched.

## 2026-07-21 — Selections-only Engine boundary queue supersession

**Status:** BINDING; GOVERNANCE PREREQUISITES ARE REMOVED FROM ENGINE ELIGIBILITY.

### Active boundary

The outside governance layer may shape which options are offered and may attach identity/project/timeline/ownership metadata to an outer envelope. The Engine boundary receives the selected engineering values only. Outer metadata is optional traceability and cannot block calculation.

### Queue effects

- **SEL-018:** remains ready in its exact two-file scope. It carries `selectedRoomTaC` only and does not add registration, project, owner, active-revision, Tier or Engine eligibility logic.
- **SEL-019:** superseded as an Engine prerequisite. Its save/register/active-revision sequence is removed from the thermal and Engine acceptance path. Any later persistence proof is a separate outside-governance parcel.
- **SEL-002:** no longer blocks Engine execution; retain only as historical project-persistence acceptance.
- **SEL-003:** no longer depends on project registration; any bounded Engine proof must invoke from a valid selection set rather than a selected-project eligibility state.
- **THERM-P1:** remains approved after SEL-018, but is strictly an internal technical evidence resolver/validator keyed by selected optic. It must not require human/project identity, registration or a caller-supplied governance approval.
- **THERM-E1:** remains approved after THERM-P1 and unchanged in thermal arithmetic and varied-optic proof.

### Deletion rule

Known user/project/owner/timeline/registration/active-revision/client-Tier checks at or before the Engine computational boundary are invalid. When their implementation paths are commissioned, the gate is deleted or bypassed from Engine eligibility; it is not repaired, renamed or replaced.

Technical selection completeness, authoritative source availability, evidence consistency and physical/electrical/thermal/compliance validation remain valid blockers.

### Order

1. reconcile the Selector lane queue to this ruling;
2. complete SEL-018 as selections-only room-temperature transport;
3. complete THERM-P1 as internal technical evidence binding;
4. complete THERM-E1 with the mandatory changed-rise / changed-lookup / changed-output proof;
5. run the boundary regression twice with identical engineering selections and different user/project/owner/timeline/registration envelopes, requiring identical deterministic Engine output;
6. produce a reconciliation receipt proving each former governance gate was deleted or bypassed and that no renamed equivalent remains;
7. leave outside-system persistence and main promotion separate.

No feature implementation is included in this queue ruling.

## 2026-07-21 — Selections-only thermal chain final acceptance

**Status:** COMPLETE / ACCEPTED.

The Selector lane reconciled its queue to the binding boundary, preserved the already accepted SEL-018 and THERM-P1 receipts, completed THERM-E1, pushed separate feature and lane-memory closeouts, and ended clean.

### Completed order

1. Selector queue reconciliation — complete;
2. SEL-018 selected-room transport — complete;
3. THERM-P1 internal evidence binding — complete;
4. THERM-E1 one-time rise and curve execution — complete;
5. changed-optic regression — complete;
6. different-envelope / identical-output regression — complete;
7. governance-gate deletion-or-bypass receipt — complete.

### Acceptance evidence

- focused Engine execution coverage: 120/120;
- normal Selector closeout gate: 107/107;
- identical engineering inputs with different user/project/owner/timeline/registration/active-revision envelopes produced identical complete Engine output;
- changed optic rise changed both lookup temperature and verified lm/m;
- THERM-E1 imports only the Program evidence adapter and existing curve parser;
- no renamed project-registration, active-revision or selected-project eligibility gate exists in the computational module.

### Remaining queue boundary

There is no outstanding Selector or Engine implementation item in this thermal sequence. Optional persistence/traceability work remains outside governance and cannot become an Engine prerequisite. Main promotion, downstream artifacts and the unfinished main runtime-port work remain separately held.

## 2026-07-21 — Engine selected-result stability sequence

**Status:** SEAM B VERSION 1 STABLE; QUEUE EMPTY; SEAM G AND MAIN HELD.

### ENG-STAB-P1 — Seal the version-1 selected-result producer envelope

- **Owner:** Selector & Engine.
- **Status:** implemented and accepted as an internal non-stable component after concurrent supersession.
- **Public-contract status:** superseded by the accepted SEL-007 three-schema candidate and ENG-OUT-P1; the pushed component may be consumed internally but is not a public boundary or stability receipt.
- **Exact feature files:** new `packages/workspace-kernel/runtimeEngineSelectedResultContractV1.js` and new `tests/runtimeEngineSelectedResultContractV1.test.js`.
- **Gate:** `selector-engine`.
- **Objective:** validate the accepted thermal execution result and the existing safe selected-result source object, then emit the exact deeply immutable `controlstack.engine.selected-result.v1` accepted-or-blocked envelope.
- **Accepted proof:** exact schema/version and key set; source identity and revision agreement; deterministic accepted and blocked fixtures; at least one safe per-run row; thermal values preserved without recalculation; governance-envelope independence; no raw payload, source row, path, exact private electrical internal, IES, PDF or artefact exposure.
- **Blocked proof:** malformed, unaccepted, contradictory, identity-unbound, unsafe or over-rich input fails closed with canonical blockers and no accepted runs or verified output.
- **Prohibitions:** no Engine invocation, curve-parser change, route, persistence, RuntimeData mutation, donor use, IES handoff, downstream readiness activation, existing scaffold rewrite or main change.
- **Commit message:** `feat(runtime): seal selected result contract v1`.

### ENG-OUT-P1 — Implement the accepted version-1 request, output and row contracts

- **Owner:** Selector & Engine.
- **Status:** done and Program-accepted.
- **Depends on:** accepted SEL-007 candidate and Program review.
- **Exact feature files:** new `packages/workspace-kernel/runtimeEngineOutputContractV1.js` and new `tests/runtimeEngineOutputContractV1.test.js`.
- **Gate:** `selector-engine`.
- **Objective:** implement exact non-persistent validators/builders for `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`.
- **Acceptance:** deterministic complete, fail-closed blocked, valid zero-valued and replay-identical fixtures; one exact row field set; result identity from request/source/policy/evidence fingerprints; governance-envelope independence; unknown versions and unsafe or contradictory inputs fail closed.
- **Prohibitions:** no actual Engine invocation, persistence, route, IES handoff, downstream activation, RuntimeData mutation, donor use, legacy row-schema reuse, existing scaffold rewrite or main change.
- **Commit message:** `feat(runtime): implement Engine output contract v1`.
- **Accepted receipt:** exact public producer and focused test pushed; final focused coverage 116/116; normal closeout 107/107; exact draft validation, server-derived evidence identity, caller-Tier rejection, complete/blocked/zero/replay fixtures, envelope independence, technical identity movement and legacy-row non-reuse verified; ending tree clean.

### ENG-STAB-C1 — Prove one consumer compatibility adapter

- **Status:** done and Program-accepted.
- **Owner:** Lab & IES.
- **Exact feature files:** new `packages/lab-kernel/ies-toolkit/engineOutputV1CompatibilityAdapter.js` and new `tests/lab-kernel/engineOutputV1CompatibilityAdapter.test.js`.
- **Gate:** `lab-ies`.
- **Boundary:** read-only compatibility only; consumes plain public JSON fixtures; imports no Selector/Workspace/Runtime implementation; activates no IES generation, authority decision, downstream write, persistence or route.
- **Accepted receipt:** initial exact two-file checkpoint plus one same-scope thermal tightening; each passed 269/269. Complete, blocked, zero-valued, governance-independent, exact-row, thermal-equation, clamp/mode, unknown-version, over-rich, unsafe/private, contradictory, extra-evidence and legacy-row cases verified.
- **Protected-state result:** all protected Lab local inventory remained untouched and unstaged; Lab queue ended empty.

### ENG-STAB-A1 — Final Seam B stability decision

- **Status:** done; Seam B Engine output contract version 1 stable.
- **Owner:** Program & Integrate.
- **Acceptance:** all five conditions verified: exact schema/version, green producer gate, green consumer compatibility gate, deterministic sealed complete/blocked/zero/replay/thermal fixtures, and exact-version fail-closed rollback with no data migration.
- **Boundary:** stability covers only the public contract and read-only compatibility projection. It does not activate the diagnostic RunTable scaffold, legacy persistence-coupled rows, IES generation, downstream writes/readiness, routes, persistence or main.

Seam G and main promotion remain held. No implementation item is ready; a new exact Program parcel is required for any downstream work.

## 2026-07-21 — Seam G read-only IES request sequence

**Status:** SEAM-G-P1 SOLE READY ITEM; SEAM G STILL INACTIVE.

### SEAM-G-P1 — Produce deterministic IES artifact request envelope

- **Owner:** Selector & Engine.
- **Status:** done and Program-accepted.
- **Depends on:** stable Seam B version-1 Engine output contract.
- **Exact feature files:** new `packages/workspace-kernel/runtimeIesArtifactRequestContractV1.js` and new `tests/runtimeIesArtifactRequestContractV1.test.js`.
- **Gate:** `selector-engine`.
- **Input:** exact public `controlstack.engine.output.v1` JSON, exact IES artifact intent, and optional quarantined traceability envelope.
- **Output:** exact immutable `controlstack.downstream.ies-artifact-request.v1` complete-or-blocked request with deterministic request/replay/audit identity, stable Engine identities, safe technical provenance/thermal values, exact public rows, canonical blockers/warnings and explicit no-write/no-generation safety state.
- **Acceptance:** exact schema/version/key sets; complete, blocked and valid-zero fixtures; identical inputs replay identically; different governance envelopes produce identical output and do not appear; changed Engine technical identity changes request identity; unknown, over-rich, unsafe/private, contradictory or legacy-row input fails closed; blocked Engine output cannot become artifact-ready; no raw IES, photometry, candela, file, path, route, write, persistence, email, Engine invocation or generator capability.
- **Commit message:** `feat(runtime): add IES artifact request contract v1`.
- **Accepted receipt:** exact two-file producer passed 115/115; normal Selector closeout passed 107/107; harness removed; tree clean. Complete, blocked, zero, replay, governance-independence, technical identity and fail-closed security cases verified.
- **Next:** SEAM-G-C1 is the sole ready Lab parcel.

### SEAM-G-C1 — Prove Lab read-only request compatibility

- **Owner:** Lab & IES.
- **Status:** done and Program-accepted.
- **Exact feature files:** new `packages/lab-kernel/ies-toolkit/iesArtifactRequestV1CompatibilityAdapter.js` and new `tests/lab-kernel/iesArtifactRequestV1CompatibilityAdapter.test.js`.
- **Gate:** `lab-ies`.
- **Boundary:** plain public request JSON only; import-free; no IES generation, authority, evidence acceptance, reference mutation, route, persistence, network/file/email write or readiness activation.
- **Acceptance:** exact ready and blocked request schema/version/key sets; immutable compatibility projection; valid zeros; deterministic request/replay/audit identity; stable Engine identities, safe thermal/provenance and exact public rows only; traceability values neither influence nor appear; unknown/extra/private/raw/unsafe/contradictory/legacy input fails closed; blocked request cannot become compatible-ready.
- **Accepted receipt:** exact import-free two-file Lab parcel passed 276/276 and lane closeout ended with only the expected marker plus three protected untracked items.
- **Protected-state result:** the expected Lab branch marker and three protected untracked items remained untouched and outside feature staging.
- **Next:** SEAM-G-A1 is complete under the activation decision below; no generation item becomes ready automatically.

### SEAM-G-A1 — Activate read-only tunnel

- **Owner:** Program & Integrate.
- **Status:** done; Seam G version-1 read-only contract tunnel active.
- **Acceptance:** all six conditions verified: exact schema/version, green producer and consumer gates, security/write boundary, deterministic replay/idempotency, failure isolation/audit and no-migration rollback.
- **Boundary:** activation is contract/validation only. No live network route, generator invocation, IES body, authority, persistence, file/email delivery or downstream readiness is active.

The Program queue is empty. Main, routes, persistence, email/export, actual IES generation and unfinished runtime-port work remain excluded. A new exact Program parcel is required before any generation or delivery work.

## 2026-07-21 — Seam G generation binding sequence

**Status:** READ-ONLY GENERATION-BINDING TUNNEL ACTIVE; QUEUE EMPTY; LM-63 GENERATION BLOCKED.

### SEAM-G-P2 — Produce deterministic single-run generation input

- **Owner:** Selector & Engine.
- **Status:** done and Program-accepted.
- **Depends on:** active Seam G version-1 read-only artifact-request tunnel.
- **Exact feature files:** new `packages/workspace-kernel/runtimeIesGenerationInputContractV1.js` and new `tests/runtimeIesGenerationInputContractV1.test.js`.
- **Gate:** `selector-engine`.
- **Input:** exact ready public artifact request version 1, exact matching Engine selection-set request version 1 and optional quarantined traceability.
- **Output:** immutable `controlstack.downstream.ies-generation-input.v1` ready-or-blocked envelope with deterministic identity/audit, exact request and Engine identities, one normalised single run, one bounded product/light/control selection and safe technical provenance/thermal values.
- **Acceptance:** recompute and match selection request fingerprint; exact one-run shape; positive integer quantity and length; valid zero target/ambient values; request/replay/result/source/policy/evidence identities agree; identical technical input replays identically; traceability is inert and absent; changed selection, request or technical identity moves generation-input identity; unknown, blocked, extra, multi-run, governance, unsafe/private/raw, fingerprint-mismatched or contradictory input fails closed.
- **Boundary:** no reference identity, sealed DTO, authority body, generator invocation, LM-63 text, route, persistence, file/network/email write or readiness activation.
- **Commit message:** `feat(runtime): add IES generation input contract v1`.
- **Accepted receipt:** feature and tightening checkpoints passed 115/115; normal Selector closeout passed 107/107; harness removed; tree clean. Selection, deterministic artifact identity/audit, row/profile and thermal-mode/private-path boundaries verified.
- **Next:** SEAM-G-C2 is the sole ready Lab parcel.

### SEAM-G-C2 — Bind generation input to sealed optic reference identity

- **Owner:** Lab & IES.
- **Status:** done and Program-accepted.
- **Exact feature files:** new `packages/lab-kernel/ies-toolkit/iesGenerationInputV1ReferenceBindingAdapter.js` and new `tests/lab-kernel/iesGenerationInputV1ReferenceBindingAdapter.test.js`.
- **Gate:** `lab-ies`.
- **Input:** plain public generation-input version 1 JSON and exact public NVB Lab projection version 2 JSON.
- **Output:** immutable `controlstack.lab.ies-generation-reference-binding.v1` ready-or-blocked projection with deterministic binding identity, source generation identity, exact optic/evidence/thermal binding and one read-only OPT reference identity.
- **Acceptance:** exact schemas/key sets; path `optic`; no unresolved blockers; selected optic key equals optic variant; optic BOM agrees across generation provenance, Lab selection and thermal evidence; evidence ref and measured thermal triplet agree; exact OPT reference identity fields and canonical resolver path; valid zero thermal values; replay-identical and outer traceability absent; unknown/extra/private/raw/unsafe/unresolved/non-optic/missing/wrong-kind/contradictory input fails closed.
- **Boundary:** import-free; no storage resolution, sealed DTO load, authority inspection/mutation, evidence acceptance, generator invocation, LM-63 text, route, persistence, network/file/email write or readiness activation.
- **Protected-state rule:** preserve the expected Lab marker and three protected untracked items.
- **Commit message:** `lab: checkpoint IES generation reference binding v1`.
- **Accepted receipt:** exact feature plus same-scope identity tightening; final Lab gate 285/285; exact selection/artifact/generation/reference identity, canonical decimal triplets, replay, valid-zero and fail-closed security verified; protected Lab inventory preserved.
- **Next:** SEAM-G-A2 is complete; generation remains blocked.

### SEAM-G-A2 — Activate generation-binding tunnel

- **Owner:** Program & Integrate.
- **Status:** done; read-only generation-binding tunnel active.
- **Acceptance:** exact schemas, green producer and consumer gates, independently reconstructed selection/artifact/generation/reference identity, deterministic replay, fail-closed isolation, no-write safety and removal/non-use rollback verified.
- **Boundary:** activation covers only the read-only generation-input/reference-binding contract. Storage resolution, sealed DTO loading, authority/evidence mutation, LM-63 generation, delivery, routes, persistence and main remain separately held.

No implementation item is ready. A new exact Program parcel is required before any generator invocation or delivery work.

## 2026-07-21 — Sealed-reference generation inspection

**Status:** SEAM-G-C4 SOLE READY ITEM; GENERATOR INACTIVE.

### SEAM-G-C3 — Inspect sealed reference for generation readiness

- **Owner:** Lab & IES.
- **Status:** done and Program-accepted.
- **Exact feature files:** modify `packages/lab-kernel/ies-toolkit/iesFromReference.js`; add `tests/lab-kernel/iesFromReferenceInspection.test.js`.
- **Gate:** `lab-ies`.
- **Input:** one exact sealed one-millimetre reference DTO.
- **Output:** immutable `controlstack.lab.ies-reference-generation-inspection.v1` ready-or-blocked projection with public reference identity, keyword profile ID, safe baseline values, derived baseline lm/m and watts/m, exact missing generator keyword override names, deterministic inspection/audit identity and no-generation/no-raw/no-write safety state.
- **Acceptance:** reuse the exact generator validator; full schema/identity/timestamp/approval/keyword/geometry/angle/candela/one-mm/baseline/hash-field checks; valid zero optional baseline values preserved; exact missing override list for lumcat/luminaire/lamp/cri/cct/driver/driverSetting; repeatable immutable output; malformed/unapproved/non-one-mm/baseline-mismatched/private-path or incomplete input fails closed; no metadata, angle, candela, keyword-value, provenance-path or sealed-body exposure.
- **Boundary:** no multiplier derivation, project/customer metadata, resolver/storage access, generator/materialise call, LM-63 text, route, persistence, file/network/email write or readiness activation.
- **Commit message:** `lab: checkpoint sealed reference generation inspection v1`.
- **Accepted receipt:** exact two-file inspection passed 295/295; generator validator reuse, seven-field override reporting, baseline fallback/zeros, privacy, failure and generator-regression cases verified.
- **Next:** SEAM-G-C4 is the sole ready item.

### SEAM-G-C4 — Build deterministic no-generation materialisation job plan

- **Owner:** Lab & IES.
- **Status:** complete and Program-accepted.
- **Exact feature files:** new `packages/lab-kernel/ies-toolkit/iesMaterialisationJobPlanV1.js` and new `tests/lab-kernel/iesMaterialisationJobPlanV1.test.js`.
- **Gate:** `lab-ies`.
- **Inputs:** exact public generation-input v1, generation-reference-binding v1 and sealed-reference inspection v1 JSON.
- **Output:** immutable `controlstack.lab.ies-materialisation-job-plan.v1` ready-or-blocked projection with deterministic plan/replay/audit identity, exact generator job shape, multiplier basis and no-generation/no-write state.
- **Multiplier authority:** `verifiedLmPerM / baselineLmPerM`; target lm/m is intent only. Both values and the resulting ratio must be finite and strictly positive.
- **Ready conditions:** generation ID/replay and selection/run match binding; binding reference identity exactly matches inspection; inspection is ready, reference-validated, has zero missing overrides and permits materialisation without overrides; exact job is `{ runLengthMm, outputMultiplier, selections: {} }`.
- **Fail closed:** unknown/extra/private/raw/unsafe input, identity mismatch, missing overrides, non-positive verified/baseline/ratio, contradictory inspection or any caller keyword override.
- **Boundary:** import-free; no sealed DTO, resolver/storage, generator/materialise call, LM-63 text, project/customer metadata, route, persistence, file/network/email write or readiness activation.
- **Commit message:** `lab: checkpoint IES materialisation job plan v1`.
- **Accepted receipt:** exact two-file feature plus bounded fixture corrections passed 305/305; deterministic identity/replay, exact positive multiplier basis, empty selections job, privacy and all fail-closed cases verified without production widening.
- **Next:** Lab queue empty; actual generator invocation requires a separate Program seam decision and remains blocked.

## 2026-07-21 — Program work-shape admission

**Status:** GOVERNANCE LANE ACTIVE; SELECTOR STREAM READY; LAB C4 ACCEPTED AND IDLE.

### PWS-L0 — Provision Governance & Shell lane

- **Owner:** Program & Integrate infrastructure.
- **Status:** complete; isolated lane, founding checkpoint, fixed gate and scoped MCP service active.
- **Lane:** Governance & Shell.
- **Required isolation:** dedicated worktree, `lane/governance-shell`, separate MCP service identity on its own local port, exact write globs, required branch and dedicated gate.
- **Prepared infrastructure:** Deployment v2 topology, scoped MCP service, fixed Governance gate and idempotent one-command provisioner.
- **Founding checkpoint:** copies exactly the six drafted canonical lane records, refuses divergent overwrite, gates, commits and pushes them on the new branch.
- **Activation boundary:** the provisioner creates the sibling worktree and reloads the Windows service manager; lane feature tools cannot perform that host-level Git operation directly.
- **Initial owned items:** work-shape items 3, 4, 6 and 9.
- **CRM item 7:** folded into this lane as blocked; no separate CRM lane yet.
- **Boundary:** no Selector/Engine, Lab authority or main write scope.

### PWS-001 — Retire CRM gate language and emit readiness state-entry intent

- **Owner:** Selector & Engine.
- **Status:** done; normal and guarded gates passed 107/107.
- **Result:** truthful Spec Ready and Build Ready remain; named CRM/business gate language is retired; genuine false-to-true entry emits one deterministic immutable provider-inert intent without render/hydrate duplication.
- **Provider boundary:** no HubSpot or CRM mutation; Governance owns any later outside-layer association or action.

### PWS-002 — Add Factory Ready

- **Owner:** Selector & Engine.
- **Status:** done; focused coverage passed 128/128 and normal/guarded gates passed 107/107.
- **Authority:** derived only from truthful Spec Ready, Build Ready and unchanged source-backed Factory Approved Inputs evidence.
- **Boundary:** no default, inference, external push, factory authority or Engine change.

### PWS-005 — Correct live save/restore copy

- **Owner:** Selector & Engine.
- **Status:** done; focused coverage passed 112/112 and normal/guarded gates passed 107/107.
- **Result:** Selector, Emergence, Scene Builder and the workspace contract now truthfully classify save, restore and hydrate as shell-owned and live through Project Browser.
- **Boundary:** copy and contract classification only; no lifecycle, project-store or persistence behavior changed.
- **Closeout:** Selector queue empty, worktree clean and temporary module write permissions retracted.

### PWS-010 — Single data-retrieval gateway

- **Owner:** Governance & Shell.
- **Status:** binding architectural constraint now; implementation blocked until lane provisioning.
- **Rule:** every module export/download/artifact retrieval path terminates through one gateway; no module-owned retrieval route or helper.
- **Separate checks:** readiness and identity remain distinct.
- **Seam G effect:** internal generation contracts may continue, but direct Selector/Lab delivery is prohibited.

### PWS-L1 — Expose Governance MCP through its dedicated secure tunnel

- **Owner:** Program & Integrate infrastructure plus ChatGPT registration.
- **Status:** done.
- **Evidence:** Governance MCP, dedicated secure tunnel and private ChatGPT app are active; the Governance tool executed and pushed GOV-001.
- **Boundary:** no other lane tunnel was reused; no secret or remote endpoint entered Git.

### GOV-001 — Inert single data-retrieval gateway contract and shell state

- **Owner:** Governance & Shell.
- **Status:** done; Program accepted after 152/152.
- **Result:** one immutable versioned Governance gateway with separate readiness, project-context and identity checks; four deterministic states; static discovery descriptions; no live cross-module read.
- **Delivery boundary:** ready-for-future-retrieval is not permission. Download, delivery, route, file body, URL, blob, persistence, email, CRM, Engine invocation and readiness mutation remain disabled.
- **Ownership:** the former shell-owned IES browser action is inactive; read-only manifest/detail previews remain.
- **Input boundary:** unknown, extra, nested, private, raw, path, URL, blob, traceability-envelope and provider-shaped input is rejected.

### GOV-003 — Restore project persistence

- **Owner:** Governance & Shell.
- **Status:** done; fixed Governance gate passed 175/175.
- **Result:** canonical `workspace_saved_project.v2`, server-authoritative one-file-per-project JSON, atomic replacement, bounded save/read routes, server-first browser cache, explicit migration and rollback.
- **Identity:** route/request/file/record project IDs agree; fixtures excluded; malformed and unsafe records fail closed.
- **Passive CRM fields:** `hubspotDealId`, `hubspotContactId`, `hubspotCompanyId`, nullable and provider-free.
- **Boundary:** no identity lookup, retrieval activation, delivery, CRM call, price, handoff, email or Engine coupling was added.

### GOV-005 — Restore user identity and permissions

- **Owner:** Governance & Shell.
- **Status:** done; fixed Governance gate passed 181/181.
- **Result:** one Governance-owned NVB-first identity resolver, optional HubSpot presence-only follow-up, canonical four-role authority and immutable permission lifecycle.
- **Override:** internal override is restricted, reasoned, flagged and logged.
- **Boundary:** no provider write, hard email verification, two-factor authentication, CRM mutation, Engine eligibility or technical-readiness change was added.

### Governance follow-on order

1. **GOV-001, GOV-002, GOV-003, GOV-004 and GOV-005:** complete in the Governance lane's canonical order and accepted evidence chain.
2. **GOV-006 / CRM:** held on the sole substantive CRM precondition: exact writer-scope definition. Patrick's portal-scope prerequisite is satisfied and the CRM ownership/lifecycle rules are closed. A separate Program admission remains required before implementation.
3. **Read-only credential state:** `ControlsStack (Read Only)` exists with contacts, companies and deals read scopes only; its token is held in the local secrets store and `writePolicy` remains disabled. The legacy OAuth public app remains in service.
4. **Binding business scope:** HubSpot owns contacts, companies, deals and price; ControlStack owns build detail. One deal exists per envelope through `controlstack_project_key` plus `controlstack_job_ref`; provider intent is emitted on genuine readiness-state entry; leads use a separate deals pipeline; engineering storage is local-first and CRM reads are cached.
5. **Decision-registry state — REPORTED:** Patrick reports that the project-shell decision registry already records the RULED CRM business boundary and the PARKED Service Keys migration. Service Keys remain deferred until cutover as a token swap with no expected ControlStack code change.
6. **No Governance parcel is ready.** No live CRM write, writer token, OAuth retirement or Service Keys cutover is authorised.

### SEAM-G-C5 — Sealed-reference load preflight

- **Owner:** Lab & IES.
- **Status:** accepted complete. The technical implementation, lane-memory closeout and two-file seed-memory formatting correction are pushed; the fixed Lab gate passes 314/314. No Lab parcel is ready. C6 remains blocked and is not released.
- **Input:** exact ready materialisation-job-plan version 1, exact matching generation-reference-binding version 1, exact matching reference-generation-inspection version 1, and one injected Lab-owned read-only resolver capability.
- **Operation:** derive the reference identity only from the matched contracts; call the resolver at most once; reject caller paths, URLs and provider-shaped resolver input; validate the loaded DTO through the existing generation-inspection path; require exact reference identity, keyword profile, baseline, missing overrides and no-override readiness equality.
- **Output:** deterministic immutable ready-or-blocked redacted load receipt. The loaded DTO is ephemeral and discarded after validation.
- **Exact feature scope:** one sealed-reference loader module and one focused test.
- **Blocked:** generator/materialise invocation, LM-63 text, raw reference body, metadata, keywords, angles, candela, provenance paths, routes, persistence, file/network/email write, delivery and readiness activation.
- **Acceptance:** exact-shape/version checks; single resolver call; no caller location authority; identity and inspection equality; deterministic replay; changed reference identity moves receipt identity; missing, malformed, extra, private, raw, URL/path, resolver failure, wrong DTO and inspection mismatch fail closed; protected Lab items remain untouched; fixed Lab gate green.
- **Next after acceptance:** SEAM-G-C6 one-shot in-memory generator invocation may be considered. C7 Seam G artifact handoff and Governance retrieval activation remain blocked.

### Generation and delivery sequence

1. **C5:** sealed-reference load preflight — accepted complete at 314/314.
2. **C6:** one-shot in-memory generator invocation — blocked by SEED-LIB-001 sequencing and separate Program admission; not released.
3. **C7:** validate LM-63 and hand one opaque generated-artifact identity plus safe summary through Seam G — blocked until C6 accepted.
4. **Governance retrieval activation:** store and serve the artifact body only through the single gateway after separate useful-output readiness and identity/project capture — blocked until C7 accepted.

### Standing test lock

Every affected parcel and gate plan must retain: envelope independence including no-envelope Engine execution; changed-optic movement; varied-row proof for identical placeholder lookup values; and ownership-wide tests instead of named-instance assertions.

### SEED-LIB-001 — canonical production-chain seed library

- **Status:** ruled and queued; real execution blocked by current lane sequences.
- **Selector authority:** Patrick reports both cases are saved as Selector test cases. Saved selections are the only run-intake authority. Build 1 is 9560 mm × 1; Build 2 quantity and length come from its saved case and must not be inferred or retyped.
- **Build 1:** DNX 60 Square; Opal 60; 3000K/CRI80; DALI-2 DT6; 1000 lm/m; Spitfire D25 emergency; PIR 5 m; Suspended; Top Side; White (Textured).
- **Build 2:** DNX 80 DI (`Square_DI`); direct Inlay 80 + Microprism; indirect Rope 80; direct 1500 lm/m; indirect 500 lm/m; 5000K/CRI90; Fixed (On/Off) both lanes; Surface Mount; Back Wall side; Black (Textured); EM DC Mains emergency; Microwave sensor.
- **Required real chain:** saved Selector selections/run intake → accepted Engine/public envelopes → genuine Lab measured evidence → real authority approval and sealer → real inspection → C5 resolver/load → C6 in-memory generation → C7 opaque artifact handoff → separately admitted Governance retrieval.
- **Prohibited acceptance shortcuts:** no hand-made sealed DTO, hand-made inspection, synthetic production artifact, substitute optic, substitute board, inherited measurement, nearest match, placeholder evidence or manually entered run intake.
- **Fail closed:** report the exact selected element lacking measured evidence, sealable authority or identity agreement. Do not substitute.
- **Canonical role:** both builds are mandatory for C5-C7 and downstream acceptance, including changed-optic movement and varied-row placeholder proof. Later library additions require no schema, ownership or contract-version change.
- **Sequence:** Selector seed execution is blocked behind WALK-007 acceptance. Lab seed sealing/execution is blocked behind later Program admissions for C6 and C7. Governance retrieval remains blocked behind C7.

PWS-001, PWS-002 and PWS-005 are complete. C5 and the Lab seed-memory correction are accepted complete; no Lab parcel is ready. WALK-001, WALK-001V and WALK-001VA are accepted complete. WALK-002 remains open after a clean protected scope stop; WALK-002R complete owner deletion is the sole ready Selector parcel. One Selector writer only.

### Selector consolidated walkthrough batch

- **WALK-001 — authority refresh:** accepted complete. The corrected source passed every guard, was materialised, the prior active authority was archived before promotion, and the promoted authority is independently verified readable, complete and redacted.
- **WALK-001I — locked service dependency installation:** complete operationally. The declared locked dependency set was installed, only `selector-runtime` was restarted through the existing manager, and the reader now loads without a tracked repository or credential change.
- **WALK-001R — Google reader recovery and WALK-001 resume:** accepted complete through the final WALK-001 closeout. Earlier fail-closed source evidence is superseded by the corrected-source acceptance.
- **WALK-001V — bounded Ambient validation visibility:** accepted complete. Exact two-file feature scope is pushed; the fixed Selector gate passes 108/108; disclosure and dry-run no-write boundaries are verified.
- **WALK-001VA — managed activation and current-source evidence:** accepted complete at 108/108. The clean live receipt proves one unapproved Ambient row with no recognised tier columns and a canonical Driver column containing only Boolean markers; every write remained blocked.
- **WALK-001S — guarded completion after source correction:** accepted complete within WALK-001. The corrected source passed, materialisation succeeded, archive preceded promotion, and the final lane gate passed 108/108.
- **WALK-002 — Length Mode removal:** open; protected scope stop accepted. The first five-file boundary could not remove registration, saved-project validation, candidate defaults/fingerprints, accessory interpretation or downstream preview emissions. No production changed and the lane is clean at 108/108.
- **WALK-002R — complete Length Mode owner deletion:** ready; sole Selector parcel under the amended twelve-owner scope. The second clean protected stop found the safe selected-result source projection still allowlisting `requested_length_basis`; add only that production owner to the prior eleven. Remove every current `runLengthMode`, `lengthMode`, `requested_length_basis` and `requestedLengthBasis` production occurrence, preserve quantity and physical length only, discard legacy mode data, remove all defaults/sentinels/proxies, keep Board candidate breadth equal or broader for Lex scoring, and preserve every no-Engine/no-generation/no-persistence boundary. In the same parcel, delete or rewrite every test assertion and fixture expectation that encoded the deleted assumption; report baseline, deleted, rewritten, affected-file and residual counts, with residual zero.
- **WALK-003 — duplicate scaffold removal:** blocked behind WALK-002. Unmount the fabricated parallel Selector and remove its default current-selection ownership.
- **WALK-004 — legacy TIERS readiness deletion:** blocked behind WALK-003. Delete the `TIERS`-expecting payload/readiness owner; the live source-status bridge is the sole source-readiness owner and Tier remains server/Engine-derived from `SYSTEM_POLICY`.
- **WALK-005 — internal test-mode deletion:** blocked behind WALK-004. Governance owns identity, principal/role, timeline policy and visibility; Selector deletes internal timeline and special-parts principal test controls and consumes bounded shell outcomes only.
- **WALK-005A — donor auto-fill defaults:** blocked behind WALK-005 and before WALK-006/WALK-007. Every dropdown auto-fills the first real NVB lookup option in exact source comma-separated order. Presentation rows such as `No manual constraint…` are skipped and can never become defaults. Auto-filled values are visibly flagged as looked-up choices made on the user's behalf and remain distinct from manual constraints. One `Accept all defaults` action acknowledges every flagged default, including inherited cover/end/flex finishes. Unacknowledged defaults do not satisfy readiness. The looked-up value is LOOKED UP; the acknowledgement event is GIVEN. Future default changes are data-only source reorder, never code branching.
- **WALK-006 — truthful counters:** blocked behind WALK-005A. Missing and blocked totals include only visible actionable prerequisites; diagnostic, future, consequence and disabled rows contribute zero. Unacknowledged auto-filled defaults count as genuine pending acknowledgements without masquerading as missing source data.
- **WALK-007 — selections-only action and thermal acceptance:** blocked behind WALK-001 through WALK-006. Remove server revision acknowledgement and governance/project envelope as Engine authority while preserving source-backed selections and no-write transport safety; execute one bounded selected-room plus measured-rise proof with varied-rise movement.
- **WALK-008 — finishes default acceptance ruling:** done; Patrick ruled that inherited and auto-filled finishes do not satisfy Build Ready until one explicit `Accept all defaults` action acknowledges all flagged defaults. Per-field acknowledgement is not required. Implementation is owned by WALK-005A.

- **Deletion-test coupling:** every WALK deletion parcel removes or rewrites in the same parcel the tests that encoded the deleted assumption and reports baseline, deleted, rewritten, affected-file and residual assertion counts. Residual must be zero unless Program explicitly approves a historical non-runtime fixture.
- **TEST-AUDIT-001 — runtime test-assumption audit:** blocked behind WALK-007; one bounded read-only mechanical audit for deleted-input assertions, governance preconditions on Engine execution, future/diagnostic prerequisites and identical-row fixture placeholder traps. Output is a counted kill-list only; Program separately approves all resulting deletion work.
- **Order:** WALK-001 → WALK-002 → WALK-003 → WALK-004 → WALK-005 → WALK-005A → WALK-006 → WALK-007 → TEST-AUDIT-001. WALK-008 is ruled and closed. Seed execution remains separately blocked and is not released by this queue entry.
- **Prohibitions:** no second Selector writer, CRM/provider mutation, persistence, IES generation, delivery, module-owned retrieval, main or unrelated runtime work.
