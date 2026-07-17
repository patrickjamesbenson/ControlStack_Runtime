# ControlStack Seam Contracts

**Authority:** Program-level rules for work crossing ControlStack lane boundaries.  
**State date:** 2026-07-17, Australia/Sydney.  
**Principle:** A seam is an explicit producer/consumer contract, not permission for one lane to edit another lane.

## Evidence classes

- `VERIFIED`: directly observed in this Program worktree or connected app.
- `REPORTED`: accepted coordination input that this app has not independently rechecked in the producing lane.
- `INFERRED`: reasoned contract needed to make the accepted lane model safe.
- `UNKNOWN`: unresolved and prohibited from being treated as settled.

## Global seam rules

1. Each seam has one producing lane and one or more consuming lanes.
2. The producer changes only producer-owned files in its own worktree.
3. The consumer changes only consumer-owned files in its own worktree.
4. Cross-lane filesystem copy, movement, deletion, and arbitrary shell work are not an integration mechanism.
5. A seam change requires a versioned contract or an explicitly documented backwards-compatible addition.
6. Program approval is required before a breaking seam change is commissioned or accepted.
7. A lane parcel is accepted by commit identity and evidence, never by copying uncommitted working-tree content.
8. `VERIFIED`, `REPORTED`, `INFERRED`, and `UNKNOWN` must remain visible in handoffs when evidence is mixed.
9. Unknown consumer impact blocks acceptance of a breaking change.
10. Runtime and live validation must be performed by the lane that owns the runnable surface unless Program has an expressly permitted integration probe.

## Seam A — Selector intent to Engine input

**Producer:** Selector & Engine lane, Selector surface. **REPORTED lane allocation / INFERRED internal producer boundary.**  
**Consumer:** Selector & Engine lane, Engine invocation boundary; later Program-integrated runtime surfaces. **INFERRED.**

### Contract

The Selector must produce a deterministic, source-backed candidate or selector payload whose field names, value domains, null/blocking semantics, and authority metadata are explicit. The Engine must not infer missing required selector fields from ambient UI state or stale caches.

### Required evidence for change

- Payload schema or fixture showing old and new shape.
- Tests for required fields, optional fields, blocked states, wildcard/applicability rules, and source authority.
- Proof that UI presentation does not manufacture availability absent from the payload.
- Named Selector gate result and exact commit.

### Current state

- Recent Program-branch history contains fixes concerning cold-boot source arbitration, direct control/protocol authority intersection, reference snapshot caching, and wildcard selector system applicability. **VERIFIED from commit subjects, but detailed behaviour is not revalidated in this documentation task.**
- Accepted Selector base is reported as `08df070890300058353cc621c1383f16492063f1`. **REPORTED.**
- Current live Selector payload and runtime availability are **UNKNOWN** to this Program session.

## Seam B — Engine selected result and run-table output

**Producer:** Selector & Engine lane, Engine. **REPORTED/INFERRED.**  
**Consumers:** Runtime project surfaces, Lab & IES handoff, future downstream artifacts. **INFERRED from repository tests and accepted program language.**

### Contract

The Engine output must be a stable, versioned, serialisable result with:

- input identity and source version;
- selected-result authority and readiness status;
- deterministic run-table rows or a deterministic blocked outcome;
- explicit validation/errors rather than silent fallback;
- sufficient identifiers for readback and audit;
- no hidden dependency on mutable in-memory UI state.

The repository contains numerous Engine run-table, selected-result, readonly invoke, persistence, and readback tests. **VERIFIED by file inventory.** Their exact collective acceptance status is **UNKNOWN** until the named lane gate runs in the owning lane or integration lane.

### Stability gate

The Engine output contract is not considered stable merely because one happy-path test passes. Program must record:

1. schema/version declaration;
2. producer gate evidence;
3. consumer compatibility evidence;
4. live or sealed-fixture receipt;
5. rollback/compatibility rule.

Until all five are accepted, the `downstream-artifacts` tunnel remains reserved and inactive. **REPORTED global rule adopted as contract.**

## Seam C — Engine output to Lab & IES

**Producer:** Selector & Engine lane.  
**Consumer:** Lab & IES lane.

### Contract

- Lab consumes only a documented Engine output artifact or safe handoff adapter.
- Lab must not scrape Selector UI state, import private Selector implementation details, or restore removed Selector leak paths.
- Selector/Engine must not write Lab files or the Lab donor root.
- Lab may preserve intentional dirty IES work while independently accepting a seam parcel; Program must ensure unrelated IES paths are not staged.
- A zero/blocked/missing result must remain distinguishable from a valid zero-valued photometric or engineering result.

### Current state

- Repository test names indicate existing Lab/IES safe handoff, IES handoff readiness, and source-photometry reference seams. **VERIFIED existence only.**
- Lab's bounded gate is reported green and Selector leaks are reported removed. **REPORTED.**
- Exact Lab commit, leak-path names, and current dirty inventory are **UNKNOWN** to Program and must be supplied by a fresh lane handoff.

## Seam D — Lab evidence to Program acceptance

**Producer:** Lab & IES lane.  
**Consumer:** Program & Integrate.

### Contract

A Lab parcel must provide:

- exact branch and commit;
- before/after Git inventory;
- list of included paths;
- list of deliberately excluded dirty paths;
- `lab-ies` gate receipt;
- specification/demo validation where applicable;
- donor-reference provenance without donor mutation;
- explicit confirmation that removed Selector leak paths remain absent.

Program must reject a parcel if the staged or committed set contains unrelated pre-existing IES work, unexplained generated output, or cross-lane files.

## Seam E — Lane parcel to Program integration

**Producer:** Selector & Engine or Lab & IES lane.  
**Consumer:** Program & Integrate.

### Contract

A parcel is an immutable commit or bounded commit range plus evidence. It is not a patch pasted from chat and not a working-tree snapshot.

Minimum acceptance envelope:

1. lane identity verified;
2. exact base and head commits;
3. bounded task and acceptance criteria;
4. complete changed-path list;
5. clean tree, or fully classified intentional dirt;
6. named lane gate green;
7. focused tests green;
8. seam impact statement;
9. no unauthorised paths;
10. replacement-orchestrator handoff updated.

Program then independently checks scope, dependency/seam impact, integration gate, and final Git state before gated commit/push in the Program lane.

## Seam F — Program integration to main/promotion

**Producer:** Program & Integrate.  
**Consumer:** Main/release surface.

### Contract status

- Program & Integrate is reported as the sole gated integration path. **REPORTED.**
- The exact main promotion command, branch policy, merge strategy, and release gate are not exposed by the current connected app. **UNKNOWN.**
- Therefore this document does not authorise direct main mutation. A separate explicit promotion procedure and tool capability are required.

## Seam G — Downstream artifacts tunnel

**Producer:** Stable Engine output contract.  
**Consumer:** Downstream artifact services or builders.

### Status

**RESERVED / INACTIVE.** This is a deliberate hold, not a defect.

### Activation conditions

- Engine output contract declared stable in the decision log.
- Producer and consumer schema tests accepted.
- Security and write boundaries documented.
- Replay/idempotency behaviour documented.
- Failure isolation and audit trail demonstrated.
- Program integration gate green.

No worker may activate this tunnel as incidental feature work.

## Seam H — Secure tunnel/service restart automation

**Owner:** Operational hardening owner to be commissioned by Program. **UNKNOWN named lane/worker.**

### Contract

Restart automation must preserve least privilege, avoid feature-semantic changes, provide truthful health reporting, and never mask a failed application by repeatedly restarting it without surfaced evidence.

### Status

Operational hardening work, not feature work. **REPORTED.** Implementation and acceptance evidence are **UNKNOWN**.

## Breaking-change approval

A breaking seam change requires a Program decision entry containing:

- old and new contract;
- affected producers and consumers;
- migration sequence;
- compatibility window;
- rollback path;
- exact commissioned parcels;
- acceptance gates;
- effective commit(s).

Without that entry, workers must preserve the current contract or stop with a blocker.