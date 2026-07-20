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
