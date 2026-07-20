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

## 2026-07-18 accepted-head seam reconciliation

### Evidence anchors

- Selector lane memory: `678cf83c9f97bfcdc397b574c4eab08b306656ee`, `selector-engine` 100/100, clean. **VERIFIED accepted receipt.**
- Lab lane memory: `1b154c482978a9c77a9ea5325cd103bfe40b14ed`, `lab-ies` 147/147, with 10 modified and 66 untracked IES paths preserved outside the memory commit. **VERIFIED accepted receipt.**
- Program reconciliation start: `eaa6d93f73163150028b361c16a2f194b687b68a`, clean. **VERIFIED.**
- Exact Git ancestry between the two lane heads and Program HEAD is **UNKNOWN** through this connected app and is not a basis for integration ordering.

### Dependency map now in force

`Seam A -> Seam B -> Seam C -> Seam D -> Seam E`

- Seam A establishes deterministic Selector authority and candidate identity.
- Seam B owns selected-result persistence, schema/version identity, deterministic RunTable output, and blocked/error semantics.
- Seam C may consume only an exact Program-accepted Seam B contract through a safe, read-only handoff boundary.
- Seam D proves consumer compatibility, Lab gate status, and exclusion of unrelated preserved IES work.
- Seam E accepts producer first and consumer second as separate immutable parcels.

The current selected-result and IES handoff tests remain scaffold/contract-first and fail closed: production RunTable generation, IES generation, raw payload return, and write paths are disabled in the accepted Program history. **VERIFIED.** This is safe pre-activation evidence, not a stability declaration.

### Integration constraints

1. Lane-memory heads remain lane-local evidence anchors; Program does not merge them merely to copy their handoff documents.
2. A Selector producer parcel changing Seam A or B must be accepted before any dependent Lab consumer parcel.
3. Independent Lab work that does not consume a changed Engine contract may proceed lane-locally, but it does not bypass the producer-first Program order.
4. A Lab consumer parcel must name the exact accepted producer schema/version and base/head commit range.
5. Program runs a bounded gate after each accepted parcel; producer and consumer are not combined into one unexplained integration batch.
6. Seam F remains unauthorised and Seam G remains reserved/inactive.

## 2026-07-19 approved Seam A/B amendment — Tier is an Engine/Lex consequence

**Status:** APPROVED WITH CONDITIONS.

### Contract amendment

- Selector registration eligibility must not require a manually committed Tier.
- Selector candidate construction must omit Tier as a required or authoritative input.
- The existing server-owned Engine/Lex execution boundary is the sole authority that may derive and bind Tier.
- The derived Tier remains part of the downstream Engine result contract; it is not Selector input or user-entered project truth.
- Failure to derive Tier uniquely must remain distinguishable from ordinary eligibility failure and from a valid derived Tier.

### Preserved boundaries

- All non-Tier required candidate fields and source-authority checks remain mandatory.
- Read-only/no-write behaviour remains mandatory.
- Control selection remains explicit; no automatic Control choice is authorised.
- No default, fallback, guessed, cached, or UI-manufactured Tier is authorised.
- Client-supplied Tier cannot override Engine/Lex authority.

### Producer evidence required

The Selector parcel must provide old/new fixtures, explicit contract identity, tests for missing and injected Tier, deterministic derivation, derivation-unavailable and derivation-ambiguous outcomes, preservation of other required inputs, specific refusal text, live or sealed execution evidence, exact commit, and `selector-engine` green.

### Consumer impact

The approved change alters the Selector-to-Engine input contract but does not approve a change to the downstream Tier field name, meaning, or authority. Lab & IES is a potential downstream consumer and needs compatibility evidence only if it reads Tier; no Lab code change is authorised by this amendment. Any downstream output-shape change requires another Program decision.

## 2026-07-19 approved Lab seam amendment — LAB-017 version 1

**Status:** APPROVED UNCHANGED; IMPLEMENTATION MAY PROCEED.

### Approved contract

The immutable LAB-017 version-1 envelope is the complete authority for this parcel. Approval covers only its exact public interface and data shapes, exact two-file Lab implementation boundary, named current consumers and accepted compatibility break, safe rollback sequence, and success/rejection/immutability/leak-prevention/boundary tests.

### Program-owned boundary

The seam does not transfer production serial allocation, resolver hosting, route-to-storage mapping, persistence, authentication, deployment, or endpoint ownership to Lab. Those remain Program-owned. LAB-017 must remain a bounded Lab-side interface implementation and must not introduce production services or storage authority.

### Compatibility rule

The compatibility break is accepted only for consumers explicitly named by the version-1 envelope. Unlisted or newly discovered consumers are outside this approval. Any altered interface, data shape, consumer set, ownership split, rollback, test contract, implementation file list, or additional seam requires a new Program decision before work continues.

### Evidence and completion

The Lab lane must bind the exact envelope commit to this Program approval before commissioning work. Acceptance requires the exact implementation commit, the two-file scope proof, focused evidence for all envelope test classes, full `lab-ies` green, protected-dirt exclusion, final Git inventory, push receipt, and updated lane handoff.

## 2026-07-20 approved consolidated Lab seams — seven-parcel envelope

**Status:** APPROVED AT SEAM LEVEL; IMPLEMENTATION SEQUENTIAL.

### Six non-kernel seams

The six non-kernel seams named by the immutable consolidated Lab envelope are approved unchanged. Their recorded interfaces, data shapes, implementation boundaries, consumers, compatibility terms, rollback sequences, ownership limits, rejection rules, and tests are the complete authority for those parcels.

### Governed reference-composition kernel

The kernel contract is approved only when all of the following remain true:

- exactly two parent references are supplied;
- the parents are unique and neither is already merged or composed;
- first-parent and second-parent order is significant provenance and is preserved immutably;
- both parents expose exactly matching photometric grids, including angles, dimensions, and sample positions;
- interpolation, resampling, tolerance alignment, grid repair, and silent normalisation are prohibited;
- production allocation, authority, approval, and sealing remain outside the kernel.

The kernel is a pure, fail-closed validation and composition boundary. It must reject duplicate parents, pre-composed parents, missing or reordered provenance, non-identical grids, and attempts to allocate, authorise, approve, seal, persist, host, route, authenticate, deploy, or own an endpoint.

### Sequencing rule

This consolidated approval does not combine implementation parcels. Only one Lab parcel may be active. The next eligible parcel may move to `ready`; all later approved parcels remain sequence-blocked until the active parcel is completed and closed out. Every parcel requires an independent immutable receipt and Program acceptance. Any contract drift or additional seam requires a new decision.

## 2026-07-20 approved Lab seam — LAB-029 provenance publication version 1

**Status:** APPROVED UNCHANGED; IMPLEMENTATION MAY PROCEED WHEN SEQUENTIALLY ELIGIBLE.

**Immutable envelope:** `7b74ca49665007311f6dbb8cfdccc47be5472353` (`LAB-029-provenance-publication-surfaces`).

### Approved presentation contract

LAB-029 is presentation-only. Its exact implementation boundary is:

- `packages/lab-kernel/ies-toolkit/provenance.html`
- `packages/lab-kernel/ies-toolkit/provenance_explorer.html`
- `packages/lab-kernel/ies-toolkit/luminaire_provenance.html`

The view may reuse only the approved safe sealed-reference identity projection, canonical host-free resolver paths, and evidence-capability summary. Emergency and EWIS assembly verification remain `null`.

### Publication-state contract

- Governed mode consumes only Program-supplied safe identity and resolver-availability projections.
- Offline fixture mode consumes only committed safe fixture projections and is visibly labelled `OFFLINE DEMO — UNAPPROVED`.

### Ownership exclusions

Lab does not gain serial allocation, sealing, resolver origin/hosting/endpoint ownership, route-to-storage mapping, persistence, authentication, deployment, evidence acceptance, raw evidence publication, origin IES/source-body publication, private authority reconstruction, or emergency/EWIS assembly verification authority.

### Retired behaviour

The approved implementation must not restore hard-coded hosts, direct raw-body fetch traversal, local-path exposure, diagnostic fingerprint authority claims, fabricated seal chains, generated dates, or positive authority wording for fixture data.

### Change rule

Any change to the view model, ownership boundary, resolver semantics, publication states, null-capability treatment, or exact file scope invalidates this approval and requires a new Program decision. Existing one-parcel-at-a-time Lab sequencing remains mandatory and is not an amendment to version 1.

## 2026-07-20 approved Lab seam — LAB-035 Selector contract stub version 1

**Status:** APPROVED UNCHANGED; SOLE READY LAB PARCEL.

**Immutable envelope:** `1c422dec0cb4efb0777d61bebcf6cf4ee9a33a5f`.

**Exact file:** `packages/lab-kernel/ies-toolkit/selector_stub.html`.

LAB-035 is a read-only contract viewer, not a Selector. It may display only the approved safe reference identity, safe runtime handoff, bounded Selector readiness projection, binding state, unresolved fields and false safety flags.

Governed mode uses a supplied safe bundle and performs no lookup. Offline mode uses the embedded fixture and must display `OFFLINE CONTRACT DEMO — NOT SELECTOR ACCEPTANCE`.

Lab must remove upload, arbitrary JSON intake, run-length or orientation controls, scaling, recipe construction, option/default logic, generation, Engine invocation, persistence, routes and acceptance claims.

Selector retains all source, state, vocabulary, defaults, option generation, readiness and Engine-applicability authority. Program retains integration, routing, deployment and adapter ownership. Any added file, live integration, computation or contract drift requires a new Program decision.

## 2026-07-20 approved cross-lane seam — room-to-internal thermal chain version 1

**Status:** BINDING; EXISTING CONFLICTING PARCELS MUST BE AMENDED.

**Correction and supersession:** Any earlier seam text that interpreted legacy `optic_internal_delta_ta_c` as a delta is void. It is the absolute internal reference temperature. Legacy `optic_uplift_ta_c` is the actual thermal rise.

### Contract

```text
selectedRoomTaC                 — Selector-owned user choice
referenceRoomTaC                — Lab-measured reference test condition
                                  sourced from legacy room_ta_c
referenceInternalTaC            — Lab-measured absolute internal test condition
                                  sourced from misleading legacy optic_internal_delta_ta_c
opticThermalRiseTaC             — Lab-owned measured rise
                                  sourced from legacy optic_uplift_ta_c
                                  = referenceInternalTaC - referenceRoomTaC
derivedInternalTaC              — Engine-owned runtime derivation
                                  = selectedRoomTaC + opticThermalRiseTaC
curveLookupTaC                  — Engine-owned lookup input
                                  = derivedInternalTaC in version 1
verifiedLmPerM                  — Engine-owned curve result
```

### Ownership exclusions

- Selector does not derive, clamp, look up or verify temperature-adjusted output.
- Lab does not combine a user's room choice with the measured rise.
- Engine does not invent or hardcode the optic rise and does not reinterpret the sealed Lab test internal temperature. Legacy `optic_internal_delta_ta_c = 35` is absolute internal temperature at the reference room condition; legacy `optic_uplift_ta_c = 10` is the rise.
- Program validates the cross-lane bundle but does not own the scientific measurement or curve result.

`_INTERNAL_AMBIENT_TA_C` remains the Lab authority-test internal measurement. Runtime-derived operating temperature uses separate Engine-owned fields.

The name `opticInternalDeltaTaC` is prohibited in new seam DTOs because the source field it resembles is not a delta. Until source migration, Program adapters must map:

- legacy `optic_internal_delta_ta_c` -> `referenceInternalTaC`;
- legacy `optic_uplift_ta_c` -> `opticThermalRiseTaC`.

The recommended source-model rename is `optic_reference_internal_ta_c` and `optic_thermal_rise_ta_c`.

### Acceptance

The chain is accepted only when tests prove:

- 25 + 10 produces lookup 35;
- 35 + 10 produces lookup 45;
- a second optic fixture with a different legacy `optic_uplift_ta_c` changes lookup temperature and lm/m;
- `room_ta_c = 25`, `optic_internal_delta_ta_c = 35`, and `optic_uplift_ta_c = 10` resolve to a 10°C rise and a 35°C lookup, never a 35°C rise and a 60°C lookup;
- a fixed 35, fixed 10, or literal reading of the misleading legacy field cannot satisfy the tests;
- the rise is applied exactly once;
- identity/evidence mismatch, missing fields or contradictory measured triplets fail closed;
- Engine alone applies the supported 25–65°C clamp and reports unclamped, lookup and clamp state safely;
- parity is assessed against the approved data model, not donor code.

Any board-temperature transform beyond `curveLookupTaC === derivedInternalTaC`, any alternative owner, or any combined Lab/runtime field requires a new Program decision.

## 2026-07-21 approved Lab seam — corrected thermal semantics batch version 1

**Status:** APPROVED UNCHANGED; FIVE SEPARATE PARCELS; LAB-038 SOLE READY ITEM.

The approved Lab envelope advances three affected contracts to version 2 and then updates one presentation surface plus one final guard.

### Corrected Lab publication shapes

Resolution and component projections expose only:

```text
referenceRoomTaC
referenceInternalTaC
opticThermalRiseTaC
```

The Lab working projection may additionally expose the selected optic identity, opaque evidence reference and `authorityState: null`. It must preserve unresolved evidence/identity binding rather than claiming accepted thermal authority.

The triplet is exact after canonical decimal normalisation. Legacy `optic_internal_delta_ta_c` maps to absolute internal temperature; legacy `optic_uplift_ta_c` maps to rise. New output contracts must not expose `opticInternalDeltaTaC`, `roomTaC` or `opticUpliftTaC`.

### Ownership exclusions

- no user-selected room value enters the Lab measurements;
- no Lab module derives, clamps, looks up or verifies a user-specific operating result;
- no source fixture or source-model rename is included;
- no Program adapter, Selector, Engine, route, persistence or authority promotion is included;
- no version-1 compatibility alias is approved.

### Parcel sequence

LAB-038 resolution v2, LAB-039 component v2, LAB-040 Lab projection v2, LAB-041 corrected labels and LAB-042 final guard remain separate. Only the first is ready. Exact files, tests, subjects, rollback and failure proofs are those recorded in the approved Lab envelope. Any deviation requires renewed Program approval.

### LAB-038 atomic consumer-transition amendment

Because the Lab adapter imports the resolver schema constants, the mandatory full gate cannot accept a resolver-only version bump. LAB-038 therefore atomically changes exactly the resolver module/test and adapter module/test.

During LAB-038 the adapter remains `controlstack.lab.nvb-lab-projection.v1`. It accepts only corrected resolution version 2 and the corrected optic input names, but emits no thermal triplet or evidence authority. Its existing non-thermal public shape remains fixed. LAB-040 later performs the separately approved adapter projection version-2 change and adds explicit unresolved thermal evidence. This transition is not a compatibility alias and does not permit simultaneous version-1 and version-2 resolver inputs.

### LAB-042 gate-included final guard amendment

The final corrected thermal guard is confined to the already gate-included `tests/lab-kernel/iesKeywordMigration.test.js`. The previously named new test file is superseded and must not be created because the fixed Lab gate would not execute it. All semantic, schema, mapping, contradiction, bounded-source-name and sealed-keyword assertions remain required. No production source, fixture or gate configuration is included.