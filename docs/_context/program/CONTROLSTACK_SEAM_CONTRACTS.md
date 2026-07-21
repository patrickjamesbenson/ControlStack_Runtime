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

## 2026-07-21 accepted Lab receipt and admitted thermal completion parcels

### Lab producer receipt accepted

Program accepts the completed corrected Lab thermal batch as the producer-side evidence contract for the next cross-lane work.

Accepted evidence:

- LAB-038 through LAB-042 are committed and pushed on the Lab lane;
- the resolver, component catalogue and Lab working projection are all version 2;
- the Lab projection publishes the selected optic identity, measured `referenceRoomTaC`, absolute `referenceInternalTaC`, measured `opticThermalRiseTaC`, opaque `evidenceRef` and `authorityState: null`;
- exact measured-triplet consistency is enforced;
- varied-optic coverage changes the legacy uplift source value;
- contradictory triplets fail closed;
- no Lab module calculates a user-specific derived temperature, lookup temperature, clamp or verified lm/m;
- the final Lab gate passed 262/262;
- the final Lab state preserves only its expected live marker and three protected untracked paths.

This acceptance confirms producer shape and semantics only. It does not convert `authorityState: null` into thermal authority and does not authorise Engine use without the Program validation adapter below.

### Parcel THERM-P1 — Program thermal-evidence validation adapter

**Status:** ADMITTED BUT SEQUENCE-BLOCKED UNTIL SEL-018 IS ACCEPTED.

**Producing lane:** Selector & Engine lane under the Program-owned seam contract.  
**Exact files:**

- `packages/workspace-kernel/labThermalEvidenceProgramAdapter.js`
- `tests/labThermalEvidenceProgramAdapter.test.js`

The adapter accepts exactly:

1. an accepted Selector candidate containing the unchanged `selectedRoomTaC` and its source-backed selected optic key;
2. one Program-validated optic binding containing the selected optic key, canonical optic BOM identity, source revision and `sourceBacked: true`;
3. one exact `controlstack.lab.nvb-lab-projection.v2` object.

It must fail closed unless:

- Selector and validated binding optic keys agree;
- the validated optic BOM identity equals both Lab `selection.opticBomId` and `thermalEvidence.opticBomId`;
- Lab path is `optic`, the projection is read-only and unresolved identity/evidence blockers are absent;
- `evidenceRef` is bounded non-empty opaque text;
- Lab `authorityState` remains exactly `null`;
- the measured triplet is finite and satisfies exact decimal `referenceRoomTaC + opticThermalRiseTaC = referenceInternalTaC`;
- the input contains no caller-supplied `derivedInternalTaC`, `curveLookupTaC`, board temperature or verified lm/m.

On success it emits a deeply immutable `controlstack.program.thermal-evidence-bundle.v1` containing only the selected room value, validated optic identity/source revision, measured triplet, opaque evidence reference, `labAuthorityState: null`, `programValidationState: "accepted_for_engine_thermal_lookup"`, no derived result, and `readOnly: true`.

The adapter performs no curve lookup, no temperature addition, no clamp, no persistence, no route and no authority write. It must not alter the existing photometry handoff adapter.

### Parcel THERM-E1 — Engine thermal lumen execution

**Status:** ADMITTED BUT BLOCKED UNTIL THERM-P1 IS ACCEPTED.

**Producing lane:** Selector & Engine lane, Engine boundary.  
**Exact files:**

- `packages/workspace-kernel/runtimeThermalLumenExecution.js`
- `tests/runtimeThermalLumenExecution.test.js`

The Engine parcel consumes only an accepted `controlstack.program.thermal-evidence-bundle.v1`, verified safe curve metadata and the requested drive current. It must reject direct Lab projections and any caller-supplied `derivedInternalTaC`, `curveLookupTaC`, board temperature or verified lm/m.

Engine alone calculates exactly once:

```text
derivedInternalTaC = selectedRoomTaC + opticThermalRiseTaC
curveLookupTaC = derivedInternalTaC
```

It must then delegate unchanged to the committed runtime lumen-curve parse/interpolation contract using `curveLookupTaC` as `temp_c`. It returns the unclamped derived value, actual lookup value, temperature clamp/interpolation mode, current mode, verified lm/m, selected optic identity, evidence reference and Program validation state in a deeply immutable version-1 result.

Mandatory acceptance includes:

- 25 + 10 -> lookup 35;
- 35 + 10 -> lookup 45;
- a second optic bundle with a different rise changes both lookup temperature and verified lm/m against the same current and curve;
- the varied-optic test must fail for a hardcoded rise or lookup constant;
- the rise is applied exactly once;
- low/high curve clamps preserve the unclamped derived value and report clamp state;
- missing, malformed, contradictory, unaccepted or identity-unbound evidence fails closed;
- no route, persistence, RuntimeData mutation, donor invocation, IES generation or raw curve rows are added.

Any file-scope expansion, board-temperature transform, alternate lookup owner, direct Lab consumption or change to the existing curve parser requires a new Program decision.

## 2026-07-21 approved cross-lane seam — outside governance / inside Engine version 1

**Status:** BINDING AND SUPERSEDING FOR ENGINE ELIGIBILITY.

### Contract split

```text
outsideGovernanceEnvelope   optional traceability and menu-shaping context
selectionSet                sole caller-required Engine request
internalTechnicalSources    server-side product, policy, Lab evidence and curve data
engineResult                candidates, scoring, validation and verified output
```

### Outside governance envelope

The outside layer owns human identity, company/customer, project/deal/quote, ownership, timeline, entitlement, handoff, save/persistence and result association. It may shape which menu options are visible and may wrap or store a selection set and result.

The envelope is not an Engine prerequisite. It may be absent, incomplete or unavailable without preventing a technically valid selection set from being calculated.

### Selection-set interface

The only caller-required interface into the Engine is the selected/requested engineering set. It may include product/system/optic, lighting target, room/environment, control/compliance, Runs/lengths/quantities, accessory requests and build preferences.

The interface must not contain or require:

- human/customer/company/owner identity;
- project/deal/quote/envelope/revision/timeline identity;
- handoff, entitlement or assignment history;
- save, registration, active-revision or persistence state;
- caller-authoritative Tier;
- caller-supplied candidate, score, derived temperature, lookup temperature or verified output.

A product, component or optic key is part of the engineering selection set and is not governance identity.

### Inside-kitchen resolution

Authoritative RuntimeData rows, policy, measured Lab evidence, curve data, candidate generation, scoring, derivation and verification are resolved server-side from the selection set. Their technical availability and consistency may block a result. A governance approval state cannot substitute for missing technical evidence and cannot be required merely to permit calculation.

The internal THERM-P1 adapter is classified as technical source/evidence resolution inside the kitchen boundary. It may bind the selected optic to the measured triplet, but no outside caller supplies user/project/registration identity or a permission flag to Engine. THERM-E1 then performs the one-time thermal addition and curve lookup.

### Outer metadata compatibility

The original canonical Run Payload permitted `customer`, `job`, `project` and `metadata` for traceability. Compatibility wrappers may continue to carry those fields, but they must strip or quarantine them before the computational kernel and prove that changing or omitting them leaves Engine eligibility and output unchanged for an identical selection set.

### Tier compatibility

Caller Tier is prohibited. Internal candidate policy and surfaced result profiles are derived. Any legacy adapter or donor path that defaults, requires or scores a client Tier must be removed from the accepted boundary or confined behind an internal derivation that does not alter the selection contract.

### Acceptance lock

Cross-lane acceptance must prove:

1. identical selection sets produce identical Engine eligibility and calculation regardless of absent or varied user/project/owner/timeline/registration metadata;
2. a valid selection set runs without saved-project, registration or active-revision state;
3. missing governance metadata never becomes an Engine blocker;
4. missing or invalid required engineering selections still fail closed;
5. caller Tier is rejected or ignored as non-authoritative while internal result profiles remain derived;
6. no governance field appears in the kernel's required-field or scoring list;
7. the thermal varied-optic proof still moves both lookup temperature and verified lm/m;
8. two executions with identical engineering selections and different user/project/owner/timeline/registration envelopes have identical Engine eligibility and deterministic engineering output, excluding only declared nondeterministic transport identifiers;
9. the gate-reconciliation receipt names every former governance prerequisite and proves deletion or bypass from Engine eligibility, with a negative search showing no renamed equivalent remains.

Any future use of governance metadata to choose, alter, score or block an Engine result is a breaking seam change requiring an explicit new Program decision.

### Version-1 acceptance receipt

The outside-governance / inside-Engine version-1 seam is accepted across lanes.

- `selectionSet` remains the sole caller-required computational request.
- `outsideGovernanceEnvelope` may vary or be absent without changing Engine eligibility or deterministic output.
- THERM-E1 quarantines the optional traceability envelope and passes only engineering data to the computational path.
- The changed-optic proof changes both lookup temperature and verified lm/m.
- The envelope-independence proof changes user, project, owner, timeline, registration, active revision and a renamed eligibility field while preserving an identical complete Engine response.
- The computational dependency path contains only the accepted Program evidence adapter and existing curve parser.
- Project registration, active revision and selected-project eligibility are bypassed from computation rather than renamed.

All nine acceptance-lock conditions are satisfied. Future governance influence over warnings, defaults, candidate exclusion, scoring, validation or output is a breaking version change.

## 2026-07-21 — Engine selected-result version-1 pre-stability contract

**Status:** SUPERSEDED BEFORE IMPLEMENTATION BY PROGRAM ACCEPTANCE OF SEL-007.

The existing safe source object and selected-result projection remain diagnostic inputs. They are not themselves the stable downstream contract because they are summary-only, non-persistent, not accepted as a detailed selected result, and explicitly report projection/IES readiness as false.

### Version-1 producer envelope

The new producer contract uses schema identity `controlstack.engine.selected-result.v1`, schema version `1`, and an exact immutable top-level shape containing:

- `schemaId`, `schemaVersion`, `state`, `readOnly`;
- opaque `sourceInputFingerprint` and bounded `sourceVersionMarker`;
- derived `selectedProfile` or null;
- one accepted thermal verification summary or null;
- deterministic `runCount`, safe per-run display rows, sanitised warnings and canonical blockers;
- immutable safety flags proving no raw payload, source row, private path, governance envelope, write, generation or persistence capability is exposed.

`state` is exactly `accepted` or `blocked`. An accepted envelope requires one accepted thermal result, one successful safe selected-result source object, identity agreement, at least one safe run row and no blockers. A blocked envelope requires at least one canonical blocker and returns no accepted runs or verified output.

The thermal summary carries only the accepted result fields needed for audit and downstream display: selected room, selected optic identity, measured optic rise, derived/lookup temperature, requested current, verified lm/m, clamp/interpolation modes, evidence reference and source revision. It must not accept caller-supplied derived or verified values.

Per-run rows use the existing safe selected-result display vocabulary. Raw RunTable rows, raw Engine payload, raw source data, exact private electrical internals, IES content, PDFs, artefacts and local paths remain prohibited.

### Compatibility and rollback

Version 1 is exact-shape and exact-version. Consumers fail closed on unknown schema identity, unknown version, additional authority fields, contradictory identities or unsafe data. Any breaking field, ownership or blocked-state change requires a new Program decision and schema version.

The initial producer parcel is read-only and non-persistent. Rollback is removal or non-use of the new adapter while retaining the current diagnostic-only source and projection; no data migration, route reversal or stored-record repair is required.

### Ordered acceptance

1. **ENG-STAB-P1:** implement and seal the producer envelope with accepted and blocked fixtures.
2. **ENG-STAB-C1:** separately prove one consumer compatibility adapter without activating IES generation or downstream writes.
3. **ENG-STAB-A1:** Program reviews all five Seam B stability conditions and either declares version 1 stable or records the remaining blocker.

Seam G remains reserved and inactive until ENG-STAB-A1 is accepted.

## 2026-07-21 — Accepted Engine output candidate boundary

The active candidate uses three exact version-1 schemas:

- `controlstack.engine.selection-set.v1` for the selections-only request;
- `controlstack.engine.output.v1` for complete or fail-closed output;
- `controlstack.engine.runtable-row.v1` for one unambiguous non-persistent row shape.

The accepted thermal execution result is one bounded output component, not the whole Engine response. The current RunTable domain output remains diagnostic-only, and the persistence-coupled first-narrow row path is outside Engine eligibility. The incompatible legacy row identifiers are not eligible for stability.

The concurrently completed `controlstack.engine.selected-result.v1` producer is accepted only as an internal non-stable component. ENG-OUT-P1 may validate and embed it, but it must not expose that schema as the public boundary.

ENG-OUT-P1 implements the three public contracts in one read-only runtime module with deterministic complete, blocked, zero-valued and replay-identical fixtures. It must not activate persistence, routes, IES handoff, downstream consumers, RuntimeData, donor code or main.

Consumer compatibility and Program stability acceptance remain later parcels. Seam G remains inactive.

### ENG-OUT-P1 producer acceptance

The three public version-1 contracts are now implemented and accepted as producer evidence. The final producer derives evidence fingerprints from accepted internal technical provenance rather than caller input, validates the exact versioned selection-set draft, rejects caller Tier and caller-derived/verified output, preserves valid zero values and keeps governance envelopes output-inert. Focused evidence passed 116/116 and the normal lane closeout passed 107/107.

### ENG-STAB-C1 Lab compatibility seam

The consumer proof is owned by Lab & IES and uses one new adapter plus one focused test. The adapter receives a plain JSON `controlstack.engine.output.v1` fixture and must not import Selector or Workspace implementation modules.

Its compatibility output is read-only and non-authoritative. It may retain only:

- public Engine schema/version and complete-or-blocked state;
- result, request, source, policy and evidence fingerprints;
- safe selected-result technical provenance and thermal values;
- exact `controlstack.engine.runtable-row.v1` rows;
- canonical blockers and warnings;
- explicit no-write/no-generation/no-authority safety flags.

The adapter must preserve valid zero values and fail closed on unknown schema/version, extra authority fields, unsafe/raw/private content, contradictory identities or malformed rows. Human/project/owner/timeline/registration fields may not influence or appear in its output.

Compatibility does not mean IES readiness. The adapter adds no IES generation, Lab approval, authority state, reference write, persistence, route, downstream write or activation. A separate Program decision is required after the Lab gate and sealed-fixture receipt before Seam B can be declared stable.

The current Lab protected dirty inventory remains outside this seam and must be preserved during queue reconciliation.

### Seam B version-1 stability acceptance

Program accepts the completed consumer proof and declares the three public version-1 contracts stable as a read-only, non-persistent boundary.

The Lab adapter remains implementation-independent and consumes public JSON only. Its accepted evidence covers complete, blocked and valid-zero outputs; exact rows; server-derived single evidence identity; both thermal equations; accepted clamp and interpolation modes; governance independence; and fail-closed rejection of unknown, extra, unsafe/private, contradictory and legacy-row input.

Version 1 compatibility is exact-shape and exact-version. A breaking field, ownership, identity or blocked-state change requires a new schema and Program decision. Unknown versions fail closed. Rollback is removal or non-use of the producer or compatibility adapter; because neither persists or writes, no data migration, record repair, route reversal, reference rollback or authority repair is required.

This stability declaration does not activate IES readiness or Seam G. The diagnostic RunTable domain output remains diagnostic-only, and the persistence-coupled first-narrow row path and colliding legacy schema remain outside the stable boundary. Downstream generation, writes, routes, persistence and main require a separately commissioned parcel.

## 2026-07-21 approved Seam G candidate — read-only IES artifact request version 1

**Status:** PRODUCER COMMISSIONED; SEAM G INACTIVE.

### Contract split

```text
stableEngineOutputV1
+ exactIesArtifactIntentV1
+ optionalQuarantinedTraceability
-> iesArtifactRequestV1
-> futureImportFreeLabCompatibility
-> futureProgramActivationReview
```

### Producer request boundary

`controlstack.downstream.ies-artifact-request.v1` is a deterministic request/proof envelope, not an IES file, generator command, download, email or route payload.

The exact caller input keys are `engineOutput`, `artifactIntent` and optional `traceabilityEnvelope`. `artifactIntent` has exact schema/version and the sole version-1 kind `ies_lm63_reference_build`. No filename, destination, recipient, user, project, owner, timeline, registration, authority approval, path or write instruction is accepted.

A complete request may preserve only:

- stable Engine output schema/version/state and result/request/source/policy/evidence identities;
- safe selected-result technical provenance and thermal values already present in the stable public output;
- exact stable public RunTable rows;
- deterministic request ID, replay key and audit projection;
- canonical blockers/warnings;
- explicit safety state proving read-only, non-persistent, no route, no generator, no raw IES/photometry/candela/file content and no downstream activation.

Blocked Engine output remains blocked. It cannot produce an artifact-ready request, selected result, rows or generated content.

### Replay and audit

The request ID and replay key derive only from exact stable technical inputs and artifact intent. Repeating identical inputs must return byte-equivalent plain JSON. Changing only an outer traceability envelope must not change or appear in the request. Changing a stable technical identity must change request identity.

The audit projection is deterministic and contains no wall-clock time, random ID, user/project identity or persistence acknowledgement. It records request validation state and all prohibited side effects as false.

### Failure isolation and rollback

Malformed, unknown-version, over-rich, unsafe/private, contradictory, added-authority or legacy-row input fails closed with canonical blockers and no partial artifact-ready projection. Producer failure cannot invoke or mutate Engine, Lab, RuntimeData, routes, files or references.

Rollback is removal or non-use of the new producer module. It writes and persists nothing, so no data migration, artifact deletion, authority repair or route reversal is required.

### Ordered parcels

1. SEAM-G-P1: Selector producer module and focused test only.
2. SEAM-G-C1: separate Lab import-free compatibility adapter after Program producer acceptance.
3. SEAM-G-A1: Program may activate only the read-only request tunnel after all Seam G conditions pass.

Actual IES generation, reference allocation/approval/sealing, file/download/email output, routes, persistence and main remain outside this candidate.

### SEAM-G-P1 producer acceptance and SEAM-G-C1 consumer commission

The producer request contract is accepted after 115/115 focused coverage and 107/107 normal Selector closeout. Its complete, blocked, valid-zero, replay/idempotency, governance-independence, technical-identity movement and failure-isolation cases are accepted. The implementation contains no route, persistence, file/email/export, generator, authority, reference mutation or downstream activation.

The consumer parcel is now exact:

```text
public iesArtifactRequestV1 JSON
-> import-free Lab compatibility validator/projection
-> no IES body, generation, authority or write
```

The Lab adapter may retain only public request/intent/Engine schema and identities, deterministic request/replay/audit identity, safe selected-result provenance/thermal values, exact public rows, canonical blockers/warnings and no-write safety state. It may not import producer implementation or inspect outside traceability.

Acceptance must prove ready and blocked compatibility, valid zeros, deterministic replay identity and governance absence. Unknown versions, extra authority, private/raw content, contradictory request/audit/Engine/thermal/row identity, unsafe flags, blocked promotion and legacy rows fail closed.

The consumer adds no IES generation, authority allocation/approval/sealing, evidence acceptance, reference mutation, route, persistence, network/file/email write or readiness activation. SEAM-G-A1 remains blocked until Program accepts the consumer receipt.