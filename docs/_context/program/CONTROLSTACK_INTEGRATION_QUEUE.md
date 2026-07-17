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

**Status:** HELD AS OPERATIONAL HARDENING.  
**Dependency:** Named owner, current service inventory, health contract, and explicit commission.

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