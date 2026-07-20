# Selector & Engine Work Queue

**State date:** 2026-07-20, Australia/Sydney.
**Canonical path:** `docs/_context/lanes/selector-engine/`.
**Standing role prompts:** canonical worker and orchestrator prompts are stored in `LANE_CHARTER.md`; `SESSION_HANDOFF.md` points to them and must not be their only home.
**Queue authority:** The orchestrator writes and orders queue items. Workers execute only the top item whose status is `ready` and whose `depends-on` requirements are satisfied. After a parcel and its documentation closeout are complete, the worker immediately repeats from the new top ready item for up to five parcels per run unless a protected boundary stops the batch. Queue order does not independently authorise work outside each item boundary.
**Status model:** `ready`, `blocked`, `held`, `done`.

### Q-1 Finish context migration and establish canonical queue

* id: SEL-001
* status: done
* depends-on: none
* gate: selector-engine
* authorised files: `docs/_context/lanes/selector-engine/LANE_CHARTER.md`, `docs/_context/lanes/selector-engine/LANE_STATE.md`, `docs/_context/lanes/selector-engine/WORK_QUEUE.md`, `docs/_context/lanes/selector-engine/DECISION_LOG.md`, `docs/_context/lanes/selector-engine/EVIDENCE_INDEX.md`, `docs/_context/lanes/selector-engine/SESSION_HANDOFF.md`
* objective: finish the already-staged context migration, eliminate tracked references to the former path, establish this canonical SEL queue, and record the reusable standing worker prompt.
* acceptance: all six canonical files are committed at the canonical path; no tracked stale-path reference remains; the complete `selector-engine` gate passes; exactly the six authorised paths are committed and pushed to `lane/selector-engine`; SEL-001 is done and SEL-002 is ready.
* prohibitions: no move operation; no feature work; no SEL-002 execution; no writes outside the six authorised files; no clean, reset, restore, merge, rebase, deletion, donor, Lab, Program, or main operation.

### Q-2A Diagnose project-alpha pre-Engine registration eligibility refusal

* id: SEL-011
* status: done
* depends-on: SEL-001
* gate: selector-engine
* authorised files: read-only repository and runtime inspection only; no repository writes, staging, commit, push, project mutation, RuntimeData mutation, or server registration dispatch
* objective: diagnose the two genuine `project-alpha` browser-save registration refusals reporting `selected-project-registration-client-pre-engine-eligibility-invalid` without fabricating or reconstructing browser-held project truth.
* acceptance: COMPLETE by read-only diagnosis reported by Patrick: registration and the candidate mapper both required manually committed Tier; Tier is an Engine/Lex consequence and cannot be supplied truthfully through Selector; the generic blocker masked the specific missing-Tier condition; durable persistence unavailability is expected browser-session behaviour and not causal. Full gate 103/103, no writes, clean tree.
* prohibitions: read-only; do not invoke Engine; do not POST registration; do not fabricate an envelope, acknowledgement, revision, candidate, fixture, or project truth; do not patch code or documentation; do not alter Tier, Control, RuntimeData, Lab, Program, or main; do not treat a generic client blocker as proof of server unavailability without tracing the predicate and dispatch flags.

### Q-2B Repair Tier ownership at the server-owned Engine/Lex boundary

* id: SEL-012
* status: done
* depends-on: SEL-011 and recorded Program & Integrate approval
* seam change: yes — Program & Integrate approval reported by Patrick as recorded and pushed
* gate: selector-engine
* authorised files: `apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js`, `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`, new helper `packages/workspace-kernel/engineRunTableSelectedProjectSourceBackedTier.js`, `server.js`, `tests/engineRunTableDomain.test.js`, `tests/selectorReadonlyEngineCandidateMapper.test.js`, `tests/runtimeShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport.test.js`, and closeout updates to `docs/_context/lanes/selector-engine/LANE_STATE.md`, `docs/_context/lanes/selector-engine/WORK_QUEUE.md`, `docs/_context/lanes/selector-engine/DECISION_LOG.md`, `docs/_context/lanes/selector-engine/EVIDENCE_INDEX.md`, `docs/_context/lanes/selector-engine/SESSION_HANDOFF.md`
* objective: remove manually committed Tier from Selector-side registration eligibility and candidate construction, reject any client-supplied Tier as non-authoritative, and derive/bind Tier only at the existing server-owned Engine/Lex execution boundary while preserving the established downstream Tier result field meaning and shape.
* acceptance: registration eligibility no longer requires a committed Selector Tier; the Selector candidate required-field contract excludes Tier and carries no authoritative top-level Tier, selected Tier, candidate Tier list, manual Tier strategy, cached Tier, or default Tier from browser state; stale or injected client Tier is ignored or refused and never becomes authority; every other required input and source-authority check remains unchanged; Control remains explicitly selected and is never auto-selected; the server-owned boundary derives Tier only from approved source-backed Engine/Lex authority and binds it immediately before the protected host execution seam; zero valid derivations returns a specific Tier-derivation-unavailable blocker; multiple valid derivations returns a specific Tier-derivation-ambiguous blocker; exactly one valid derivation binds that Tier without changing the downstream Tier field meaning or shape; registration returns the actual safe failing condition rather than `selected-project-registration-client-pre-engine-eligibility-invalid`; no project truth, envelope, acknowledgement, revision, RuntimeData, result, or output is fabricated; read-only and no-write flags remain preserved. Tests must visibly cover missing Tier, injected stale Tier, successful unique derivation, ambiguous derivation, unavailable derivation, and every remaining required input. Run the focused affected tests through an approved runner where available, the complete `selector-engine` gate, and bounded execution evidence that does not invoke the live Engine or manufacture project truth. If the existing Tier output contract or a Lab/IES consumer would need to change, STOP and request separate Program approval.
* prohibitions: do not add a Tier Selector control; do not accept browser/client Tier authority; do not default, guess, cache, union, fabricate, or silently choose Tier; do not auto-select Control; do not change the downstream Tier field contract; do not write Lab, Program, donor, RuntimeData, or main; do not invoke the live Engine or execute SEL-002/SEL-003 in this parcel; do not widen to unrelated registration, output, rendering, authority-refresh, or downstream-consumer work.

### Q-2C Diagnose the current non-Tier pre-Engine readiness boundary

* id: SEL-013
* status: done
* depends-on: SEL-012
* gate: selector-engine
* authorised files: read-only inspection of the current repository, runtime 8788 responses, and the genuine browser-session evidence for `env-project-alpha-1784455602109`; no repository or documentation writes, staging, commit, push, project mutation, RuntimeData mutation, registration dispatch, or Engine invocation
* objective: prove the exact non-Tier condition that makes the current saved `project-alpha` pre-Engine eligibility projection report `ready: false` and causes the client fallback `selected-project-registration-client-pre-engine-eligibility-not-ready` before projection rebuilding or registration dispatch.
* acceptance: COMPLETE from genuine browser evidence. Run intake is ready, the direct-only candidate mapper is ready, Control and all first-slice lighting inputs are selected, and there are no incompatible selections in the spec-build readiness card. The full local spec/build gate remains incomplete because Ambient is unavailable from current source and Mounting/Finishes are not selected. The 13 missing and 18 blocked totals include broader future-mapped, consequence, diagnostic, and disabled-output fields; they are not the registration candidate contract. Tier remains a non-authoritative donor-parity summary row and is not the repaired registration blocker. Current-source registration does not require a source refresh: the live reference bridge reports every expected table present, while the separate TIERS warning belongs to the broader legacy preview and Tier is now derived from SYSTEM_POLICY at execution. The exact defect is that registration rejects the declared projection as not-ready before running its own dedicated candidate rebuild, thereby allowing full Stage-2/spec-build state to contaminate the narrower registration decision.
* prohibitions: diagnosis was read-only; no save retry, registration POST, Engine invocation, fabrication, code patch, source mutation, or cross-lane action occurred.

### Q-2D Repair full-spec readiness contamination at registration preflight

* id: SEL-014
* status: done
* depends-on: SEL-013
* seam change: no — this restores the already-approved Tier-neutral, candidate-specific registration contract without changing ownership, data shape, downstream Tier meaning, or the Engine/Lex boundary
* gate: selector-engine
* authorised files: `apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js`, `tests/runtimeShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js` to import the registration transport suite through the fixed lane gate, and closeout updates to `docs/_context/lanes/selector-engine/LANE_STATE.md`, `docs/_context/lanes/selector-engine/WORK_QUEUE.md`, `docs/_context/lanes/selector-engine/DECISION_LOG.md`, `docs/_context/lanes/selector-engine/EVIDENCE_INDEX.md`, `docs/_context/lanes/selector-engine/SESSION_HANDOFF.md`. The temporary harness import must be removed before final diff, staging, feature commit, and push; that harness file must finish byte-identical to HEAD and must never be staged.
* objective: make registration preflight rebuild and validate the dedicated Tier-neutral readonly Engine candidate before rejecting a structurally valid saved projection merely because the broader local spec/build gate is incomplete.
* acceptance: a structurally valid direct-only saved projection with complete run intake, committed System/optic/target/CCT-CRI/explicit source-backed Control, zero accessory intent, and a ready candidate mapper can rebuild to registration-ready even when the broader preview reports Ambient missing, Mounting/Finishes incomplete, `Stage 2 is not ready`, Tier unavailable, or legacy TIERS source warning; the client strips/rejects all client Tier forms and does not require Ambient, Mounting, Finishes, selected-result, proof, or disabled downstream outputs for this first readonly registration slice. Missing run, optic, target, CCT, CRI, or explicit source-backed Control must still fail before dispatch with the actual specific candidate condition. Malformed projections, blocked committed constraints, unsafe flags, non-zero/unresolved accessory intent, and incompatible/unsupported emission must remain fail-closed. Registration payload shape, downstream Tier result shape, server-owned Tier derivation, explicit Control selection, source authority, read-only/no-write flags, and all no-fabrication guarantees remain unchanged. Tests must cover the genuine Stage-2-not-ready/direct-candidate-ready case, Ambient unavailable, Mounting/Finishes absent, stale/injected Tier, each remaining required candidate input, malformed state, unsafe/accessory cases, dispatch/no-dispatch, and the full gate. Focused execution must temporarily add exactly one import of `./runtimeShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport.test.js` to `tests/engineRunTableDomain.test.js`, run the fixed `selector-engine` gate, and visibly execute all eight registration transport tests alongside the normal gate set. Then remove that import, prove `tests/engineRunTableDomain.test.js` is byte-identical to HEAD and absent from the final diff, and rerun the normal full gate at its baseline count before staging. Do not perform the live save, registration, or Engine invocation in this parcel.
* prohibitions: do not weaken the required first-slice candidate fields; do not accept client Tier; do not auto-select Control; do not make Ambient/Mounting/Finishes globally optional for the full spec/build gate; do not change source data, refresh authority, project truth, registration response shape, Engine/Lex ownership, Tier output contract, Lab/IES, Program, donor, RuntimeData, main, or any file outside the authorised set.

### Q-2E Correct indirect capability to follow the exact selected System

* id: SEL-015
* status: done
* depends-on: SEL-014
* seam change: no — this aligns one presentation consequence with the existing exact SYSTEM authority already used by indirect-lane suppression
* gate: selector-engine
* authorised files: `packages/workspace-kernel/selectorReferenceOptionsService.js`, `tests/selectorCascadeCorrectness.test.js`, and closeout updates to `docs/_context/lanes/selector-engine/LANE_STATE.md`, `docs/_context/lanes/selector-engine/WORK_QUEUE.md`, `docs/_context/lanes/selector-engine/DECISION_LOG.md`, `docs/_context/lanes/selector-engine/EVIDENCE_INDEX.md`, `docs/_context/lanes/selector-engine/SESSION_HANDOFF.md`
* objective: prevent broad OPTICS system-key relationships from making `indirectCapability` available when the exact selected SYSTEM option reports that indirect emission is unsupported.
* acceptance: direct-only DNX 60 resolves through its exact selected SYSTEM identity and exposes no available `Indirect supported` auto-consequence; the capability field is blocked or hidden consistently with the already-correct indirect optic and Light/Control lane suppression; DNX 60 Beam DI remains a distinct exact System option and still exposes legitimate indirect capability and indirect optics; a broad OPTICS key such as `60` may describe optic direction compatibility but cannot override exact SYSTEM product capability; direct capability, source order, option authority, variant separation, Control, Tier, registration contracts, and existing direct/indirect lane behaviour remain unchanged; focused regressions visibly cover the direct-only and Beam DI variants and the complete `selector-engine` gate passes.
* prohibitions: do not alter source data; do not merge or rename System variants; do not remove legitimate indirect OPTICS rows; do not broaden or union applicability; do not change readiness-preview logic, registration transport, rendering outside the resulting consequence, Tier, Control, RuntimeData, Lab, Program, donor, or main.

### Q-2F Prevent diagnostic labels from becoming indirect intent

* id: SEL-016
* status: done
* depends-on: SEL-015
* seam change: no — this restores truthful readiness classification without changing the registration first-slice policy
* gate: selector-engine
* authorised files: `packages/workspace-kernel/selectorLmTemperatureReadinessPreview.js`, `tests/selectorLightControlSpine.test.js`, and closeout updates to `docs/_context/lanes/selector-engine/LANE_STATE.md`, `docs/_context/lanes/selector-engine/WORK_QUEUE.md`, `docs/_context/lanes/selector-engine/DECISION_LOG.md`, `docs/_context/lanes/selector-engine/EVIDENCE_INDEX.md`, `docs/_context/lanes/selector-engine/SESSION_HANDOFF.md`
* objective: ensure hidden, blocked, unavailable, and diagnostic field labels never count as selected target, CCT/CRI, or Control intent in the light-output readiness preview.
* acceptance: a direct-only selection whose indirect fields are hidden or blocked with diagnostic wording such as `not required or supported` reports each indirect readiness summary as not selected and `ready: false`; diagnostic `effectiveLabel`, unavailable reason, warning copy, or presentation fallback cannot become intent; only an actual selected source-valid option, explicit manual value, or valid inherited match-direct value on a supported lane may be captured; direct target, direct CCT/CRI, and explicit direct Control readiness remain unchanged; genuine indirect selections on a supported direct-indirect product still report ready; registration's existing rule that rejects genuine indirect intent remains unchanged but is no longer triggered by diagnostic text; focused regressions cover the direct-only false-positive and supported indirect case and the complete `selector-engine` gate passes.
* prohibitions: do not weaken registration's indirect-emission refusal; do not make unsupported indirect fields ready; do not invent selected values; do not change candidate mapping, source authority, System/OPTICS capability logic, Tier, Control, RuntimeData, Lab, Program, donor, or main.

### Q-2G Repair live exact-System indirect auto-consequence

* id: SEL-017
* status: done
* depends-on: SEL-015 and SEL-016
* seam change: no — this corrects a remaining Selector presentation consequence without changing source ownership, registration policy, or downstream contracts
* gate: selector-engine
* authorised files: `packages/workspace-kernel/selectorReferenceOptionsService.js`, `packages/modules/cs-selector/selectorViewModel.js`, `tests/selectorCascadeCorrectness.test.js`, `tests/selectorLightControlSpine.test.js`, and closeout updates to `docs/_context/lanes/selector-engine/LANE_STATE.md`, `docs/_context/lanes/selector-engine/WORK_QUEUE.md`, `docs/_context/lanes/selector-engine/DECISION_LOG.md`, `docs/_context/lanes/selector-engine/EVIDENCE_INDEX.md`, `docs/_context/lanes/selector-engine/SESSION_HANDOFF.md`. Change only the minimum subset proven necessary.
* objective: make the page-level automatic indirect-capability consequence follow the exact live selected System identity for DNX 60 rather than a broad shared OPTICS key.
* acceptance: first reproduce the live-shaped case with exact SYSTEM options `60|Square` direct-only and `60|Beam` direct-indirect plus a broad indirect OPTICS relationship keyed to `60`; trace the full service-to-view-model path and identify the first point where direct-only `60|Square` becomes `Indirect supported`; patch only that first divergent boundary. The direct-only page must expose no effective value, label, auto-chip, selected truth, summary value, or payload value asserting indirect support, while direct capability and direct optics remain available. A duplicate flat `indirectCapability` record is not required: absence is compliant and must not be replaced or fabricated merely so a test can assert that it is blocked; when such a record is genuinely emitted, it must be blocked. The distinct `60|Beam` product must still expose legitimate indirect capability and optics. The already-accepted diagnostic-intent repair, genuine indirect registration refusal, Control, Tier, source order, System variant separation, and all no-write boundaries remain unchanged. The saved-test recall behaviour that restores Emergency, EWIS, and Sensor but omits the Run is explanatory evidence only and must not be changed in this parcel. Focused regressions must execute through gate-included tests, then the complete selector-engine gate must pass. No browser save, registration, or Engine invocation occurs in this parcel.
* recovery state: the halted workers left exactly `packages/workspace-kernel/selectorReferenceOptionsService.js` and `tests/selectorCascadeCorrectness.test.js` modified and unstaged, alongside the five authorised recovery documents. Preserve all seven paths. Both direct-only and direct-indirect sides may legitimately omit the optional duplicate flat `indirectCapability` record. Correct both over-constrained presence assertions, rerun the live-shaped regression, and retain only implementation changes proven necessary by the remaining page-level assertions. Do not manufacture a duplicate record for either System variant to make the test green.
* prohibitions: do not alter source data; do not merge or rename System variants; do not remove legitimate indirect OPTICS rows; do not change test-case recall, Emergency, EWIS, Sensor, Run persistence, registration transport, readiness-preview intent logic, Tier, Control, RuntimeData, Lab, Program, donor, or main; do not widen beyond the first proven automatic-consequence divergence.

### Q-2H Resolve Ambient authority and the temperature/lumen Engine seam

* id: SEL-018
* status: ready
* depends-on: SEL-017
* seam approval: Program & Integrate recorded on 2026-07-20
* seam change: yes — the current first-readonly candidate explicitly excludes Ambient while the actual temperature/lumen lookup requires a finite temperature input
* gate: selector-engine
* authorised files: `packages/workspace-kernel/selectorReferenceOptionsService.js`, `packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js`, `packages/workspace-kernel/selectorLmTemperatureReadinessPreview.js`, `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`, `apps/workspace-shell/src/projectBrowserSelectedProjectServerOwnedRegistrationClientTransport.js`, `packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js`, `packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js`, `server.js`, `tests/selectorReferenceOptionsService.test.js`, `tests/selectorLightControlSpine.test.js`, `tests/selectorReadonlyEngineCandidateMapper.test.js`, `tests/runtimeShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport.test.js`, `tests/runtimeProjectBrowserSelectedProjectServerOwnedRegistrationBoundary.test.js`, `tests/runtimeEngineRunTableSelectedProjectReadonlyInvokeCapability.test.js`, `tests/runtimeLumenCurveParseInterpolationContract.test.js`, and closeout updates to the five mutable lane context files. Change only the minimum subset proven necessary.
* objective: expose one source-backed Ambient temperature selector and carry its committed finite numeric Celsius value through registration as `lighting.ambient_temp_c` to the read-only Engine temperature/lumen lookup as `temp_c`, without a guessed default.
* acceptance: selectable values come only from explicit finite Celsius choices in the active read-only `SYSTEM_POLICY` authority. No valid source choice leaves Ambient unavailable and requires upstream source correction. A browser-session save may retain incomplete state, but server-owned registration requires exactly one committed source-backed Ambient value and must remain blocked when it is absent or invalid. The candidate carries `lighting.ambient_temp_c` as a JSON number in degrees Celsius; the protected bridge passes the identical number to the interpolation request as `temp_c`. Missing, blank, ambiguous, non-numeric, non-finite, malformed, or non-source-backed values fail closed before donor Engine execution. Focused tests and the complete gate prove source extraction, numeric parsing, candidate shape, registration refusal, final server guard, and no fallback. Live proof then shows active-source options, genuine selection persistence, successful registration with the numeric field, the lookup consuming the same value, and negative refusal with the value absent or invalid. The first bounded Engine execution proof is allowed only after every preceding guard is green and the registered revision contains the approved Ambient value.
* evidence: the live UI has no Ambient selector; `selectorFactoryApprovedInputsSummary` currently reports `ambientRequired: false`; `selectorReadonlyEngineCandidateMapper` omits Ambient from the candidate; the active source contains `SYSTEM_POLICY`; the existing Selector option service declares Ambient source-backed from that table; and the runtime lumen-curve interpolation contract rejects requests without finite `temp_c`.
* prohibitions: do not fabricate source values or defaults; do not edit active source data from this lane; do not infer temperature from application, IP, System, Tier, test fixtures, optics, product type, lab data, or donor fallbacks; do not establish registration from an Ambient-incomplete candidate; do not invoke Engine before the implementation, tests, registration guard, and live preconditions are proven.

### Q-2 Register project-alpha active server-owned revision

* id: SEL-002
* status: blocked
* depends-on: SEL-001, SEL-011, SEL-012, SEL-013, SEL-014, SEL-015, SEL-016, SEL-017, and SEL-018
* gate: selector-engine
* authorised files: read-only repository inspection; no repository file writes unless a later orchestrator commission supplies exact bounded paths
* objective: use a new genuine `project-alpha` browser-session save to complete the supported server-side registration contract and establish an active server-owned revision.
* acceptance: registration acknowledgement and an attributable active server-owned revision are proven from one new genuine browser-session save without constructing project truth from fixtures or repository test data. SEL-014, SEL-015, and SEL-016 must be committed, pushed, and served by the running application before the save. Patrick must perform the browser save and registration action and provide the visible acknowledgement because repository evidence cannot prove browser-held envelope truth or human-visible runtime state. Server-side registration remains the gate on running the Engine.
* prohibitions: do not invoke Engine in this item; do not fabricate, reconstruct, or substitute a save envelope; do not change Tier, Control, RuntimeData, Lab, or Program seams.

### Q-3 Execute selected-project Engine invocation

* id: SEL-003
* status: blocked
* depends-on: SEL-002
* gate: selector-engine
* authorised files: read-only
* objective: invoke the existing read-only selected-project Engine path using the registered server-owned revision and prove one attributable useful result/run-table response.
* acceptance: one selected-project request reaches the existing Engine path from the attributable active server-owned revision and returns a useful result/run-table receipt with the established no-write flags preserved.
* prohibitions: preserve no-write semantics; do not widen Selector dimensions or alter the output seam.

### Q-4 Activate bounded Google reader diagnostics and execute focused tests

* id: SEL-004
* status: held
* depends-on: none
* gate: selector-engine
* authorised files: read-only
* objective: after supported runtime activation and an approved focused-test runner are available, execute the three documented authority materialiser test files and confirm runtime 8788 has loaded commit `8d274983aa08669a671e5f5e9ac03aa77bdda8ff`.
* acceptance: the three focused test files execute through an approved runner, runtime 8788 demonstrates the bounded diagnostic schema from `8d274983aa08669a671e5f5e9ac03aa77bdda8ff`, and no prohibited write or promotion occurs.
* prohibitions: no materialisation, archive, promotion, external Google configuration change, Selector projection repair, or Engine invocation.

### Q-5 Repeat guarded authority dry-run

* id: SEL-005
* status: blocked
* depends-on: SEL-004
* gate: selector-engine
* authorised files: read-only
* objective: repeat only the empty-body guarded Google dry-run and classify its safe bounded source-shape result.
* acceptance: the empty-body dry-run returns a bounded, redacted result that can be classified without source writes, promotion, or fabricated authority evidence.
* prohibitions: no live write, archive, promotion, projection repair, or Engine invocation.

### Q-6 Obtain bounded live controlType receipt

* id: SEL-006
* status: held
* depends-on: none
* gate: selector-engine
* authorised files: read-only
* objective: after connected tooling exposes safe bounded JSON-field extraction, repeat the existing canonical read-only Selector options request and prove the live `controlType` receipt.
* acceptance: the bounded receipt proves the live `controlType` status, genuine option attribution, empty selected value, Boolean exclusion, and absence of fabricated or automatic selection without changing route semantics.
* prohibitions: no route-semantic change merely for observability; do not reopen the accepted Control mapping without defect evidence.

### Q-7 Declare Engine output contract candidate

* id: SEL-007
* status: blocked
* depends-on: SEL-003
* gate: selector-engine
* authorised files: read-only until the orchestrator commissions exact contract-document paths
* objective: produce a versioned candidate contract covering selected inputs, result identity, run-table rows, status/error semantics, provenance, and replay/readback.
* acceptance: a bounded versioned candidate and producer evidence are ready for Program & Integrate review, with no downstream activation implied.
* prohibitions: do not activate downstream consumers without Integrate approval.

### Q-8 First contract-preserving widening pass

* id: SEL-008
* status: blocked
* depends-on: SEL-007 and recorded Integrate approval
* gate: selector-engine
* authorised files: read-only until the orchestrator records approval and commissions exact bounded paths
* objective: widen exactly one adjacent Selector dimension through the existing contracts.
* acceptance: one adjacent dimension is added through the existing projection, applicability, intent, invocation, and output contracts with focused and full-gate evidence.
* prohibitions: no bespoke second pipeline and no Tier selector.

### Q-9 Lab/IES consumer compatibility

* id: SEL-009
* status: held
* depends-on: SEL-007 and recorded Integrate seam approval
* gate: selector-engine
* authorised files: read-only
* objective: coordinate the approved Engine contract with the Lab/IES consumer through Program & Integrate.
* acceptance: Program & Integrate records the approved producer/consumer seam and lane responsibilities without cross-lane writes from this worktree.
* prohibitions: never write the Lab lane from this worktree.

### Q-10 Downstream artifacts

* id: SEL-010
* status: held
* depends-on: Integrate declaration that the Engine output contract is stable
* gate: selector-engine
* authorised files: read-only
* objective: later queue DXF, quotation, reporting, and other post-payload consumers.
* acceptance: Integrate has declared the Engine output contract stable and has commissioned a separately bounded downstream item before implementation begins.
* prohibitions: no implementation before the dependency is satisfied.

<!--
Historical pre-SEL queue retained as non-operative migration provenance. It is not an active queue and confers no implementation authority.

# Selector & Engine Work Queue

**State date:** 2026-07-18, Australia/Sydney.
**Rule:** Queue order does not authorise implementation. The orchestrator commissions one bounded worker at a time.

## Priority 0 — Durable lane memory

**Status:** COMPLETE.

The six files under `docs/_context/lanes/selector-engine/` were created, gated, committed, and pushed in commit `678cf83c9f97bfcdc397b574c4eab08b306656ee`. Later workers have continued to maintain the durable handoff.

## Priority 1 — Single-slice E2E closeout

**Status:** IN PROGRESS — authority snapshot refresh is now the first blocking boundary. The explicit Google dry-run reached the guarded reader but returned `google-reader-failed` before required-table validation or safe DRIVERS authority-shape proof. No materialised write, archive, promotion, projection diagnosis, or server registration occurred.

**Next prerequisite:** the runtime/materialiser owner must correct or expose the bounded cause of `google-reader-failed` and make the existing dry-run return a redacted proof of the current `DRIVERS.native_control_type` authority shape, Boolean-marker exclusion, duplicate-column status, and BOARDS/DRIVERS protocol-list intersection/order. Then rerun `CS-SELECTOR-AUTHORITY-SNAPSHOT-REFRESH-ACTIVATION-01` from Phase 1. No Selector projection or shared-tooling worker is commissioned here.

**Objective:** complete and prove one real, source-backed selection through the existing read-only Engine path to a useful result/run-table output on the current runtime.

**Required method:**

1. Read this directory and current repository evidence.
2. Start from the current committed pipeline; do not redesign it.
3. Run the current bounded Selector/Engine tests and inspect the live 8788 slice.
4. Identify exactly one first failing boundary, if any.
5. Commission a separate bounded writer only when a reproducible failure requires code.
6. Preserve no-write Engine semantics and source authority.
7. Finish with focused tests, `selector-engine` green, live evidence, exact commit, and updated handoff.

**Acceptance:**

- a selected, saved project produces an intentional Engine request;
- registration and invocation are server-owned and deterministic;
- success, blocked, and error states are truthful;
- one useful result/run-table payload is visible and attributable;
- no hidden browser-only source of truth;
- no unrelated feature widening;
- exact before/after Git evidence.

**Closed boundary evidence:** commit `6e5e6cee398e1dd1e82d331c81a719625e0d076b` binds one unambiguous selected-optic efficiency from active `OPTICS` authority inside the server-owned bridge. `selector-engine` passed 102/102, and live internal-seam execution returned one useful run with no write or mutation side effect.

**Remaining acceptance:** obtain a bounded live receipt from the already-current runtime showing the exact `controlType` field, genuine BOARDS and DRIVERS attribution, at least one option, empty `selectedValue`, no Boolean value, no fabricated/default/automatic selection, and no descriptive alias without driver authority. After that, prove server-owned registration for the existing browser-session save and continue the selected-project read-only invocation route. Tier must not be introduced as a manual prerequisite; it is computed after run.

**Next action boundary:** no Selector feature worker is authorised. First restore bounded response-field extraction in the connected app/tooling, then repeat only the canonical read-only options request. Do not widen into registration, Engine invocation, rendering, RuntimeData changes, or further Control semantics.

### 2026-07-18 acceptance precondition result

**Status:** BLOCKED by live saved-project precondition; no code defect was established.

Runtime 8788 was reachable, but read-only active-revision checks for all supported current workspace project identities (`project-alpha`, `project-bravo`, and `project-charlie`) returned `selected-project-shell-invoke-transport-active-server-revision-invalid`. No source boundary or Engine capability was invoked, and every persistence, mutation, RunTable, IES, and output flag remained false.

The registration route can only be called truthfully with the exact accepted local save envelope produced by a real browser-session save. At the time of Acceptance 01, no such envelope existed and none was constructed from fixtures or test data.

The user subsequently completed the correct **Save browser session envelope** action. Current user-supplied live evidence shows `project-alpha` with selected runtime envelope `env-project-alpha-1784332898092`, runtime saved count `1`, save source `p2-shell-save-envelope`, and no save error. This proves the browser-session save exists, but the dump contains no server-registration acknowledgement or active server revision.

The same live evidence reopens direct Control/Protocol as a current defect candidate: Control is not selected and blocked, direct control protocol is reported unavailable from current source, and Control type is blocked while system, optic, lm/m, and CCT/CRI are available. Run intake remains incomplete because quantity, length, and length mode are empty. Tier is correctly not selectable and must remain an Engine/Lex consequence.

### 2026-07-18 Control authority diagnosis result

`CS-SELECTOR-LIVE-CONTROL-OPTIONS-DIAGNOSIS-01` proved that the live blocked field originates before cascade, projection, caching presentation, or rendering. `compatibleBoardDriverControlOptions()` emits no matching genuine BOARDS × DRIVERS protocol pair, so no `controlType` option or relationship record exists and the field fails closed. System and CCT/CRI remain available because they use independent SYSTEM and BOARDS-only paths. The lane gate passed 102/102 and the tree remained clean.

**Recommended next bounded worker:** `CS-SELECTOR-LIVE-CONTROL-AUTHORITY-INTERSECTION-REPAIR-01`. Acceptance 02 remains held until genuine active-source protocol authority is mapped correctly or an upstream DRIVERS authority-data defect is confirmed and corrected.

Evidence commit `0ad8bee0995c29bb15c227e6f885038ecd105001` was gated and pushed. Post-gate live checks at that time reproduced the missing-active-revision boundary for all three supported current project identities, with no writes, mutations, or outputs.

## Priority 2 — Declare Engine output contract candidate

**Status:** BLOCKED by Priority 1.

Produce a versioned candidate contract covering selected inputs, result identity, run-table rows, status/error semantics, provenance, and replay/readback. Submit it to Program with producer tests. No downstream consumer activation yet.

## Priority 3 — First widening pass

**Status:** HELD.

Choose one adjacent Selector dimension only after Priority 1 proves the path and Priority 2 constrains the seam. The pass must reuse the existing projection, applicability, intent, invocation, and output contracts. Acceptance includes evidence that widening is additive rather than a second bespoke pipeline.

## Priority 4 — Lab/IES consumer compatibility

**Status:** HELD pending Program approval of the Engine contract candidate.

Coordinate through Program. Do not write the Lab lane from this worktree.

## Priority 5 — Downstream artifacts

**Status:** HELD.

DXF resizing, quotation, reports, and other post-payload artifacts remain outside this lane and inactive until Program marks the Engine output contract stable.

## Must remain closed without new evidence

- Control/Protocol work beyond the exact current live options-derivation boundary.
- Cold-boot source arbitration.
- Reference snapshot caching.
- Browser rendering as an assumed cause.
- Indirect-control changes merely to unblock direct control.
- Whole-repository test runs when the named bounded gate is available.

## 2026-07-18 Control authority repair result

**Status:** CODE REPAIR COMPLETE; LIVE ACTIVATION RECEIPT HELD.

Read-only source inspection proved that the active DRIVERS materialisation has a boolean marker at `native_control_type` and the genuine duplicate-normalised authority at `native_control_type__2`. Commit `5ae1cf8e9f4e488ec4921632ef730a35db44d1fc` now prefers the genuine field while preserving native/legacy fallback and all authority-intersection safeguards. The exact-shape regression and complete `selector-engine` gate passed 103/103; push to `origin/lane/selector-engine` succeeded.

RuntimeData remained unchanged and redacted. Runtime 8788 answered the post-commit GET, but no restart/reload action or bounded Control-only receipt is available in this app, so live availability is not overstated. `project-alpha` remains separately blocked by `selected-project-shell-invoke-transport-active-server-revision-invalid`, with no invocation or write/generation side effect.

## 2026-07-18 runtime activation validation result

**Status:** BLOCKED at outcome C — the connected app has no supported runtime lifecycle authority.

The lane is cleanly repaired and gated at 103/103, but runtime activation cannot be executed through `CS Selector & Engine v2`. The live process identifies as `controlstack-runtime-shell` with route owner `runtime-server` on port 8788. A constrained read-only options GET returned HTTP 200 and echoed the intended DNX 80 / Opal / 1200 lm/m / 3000K CRI80 constraints, but post-activation Control acceptance remains unproven because no activation occurred and no bounded Control-only projection is exposed.

**External prerequisite:** the lifecycle owner of the `controlstack-runtime-shell` / `runtime-server` process must restart or reload port 8788 from the current `lane/selector-engine` checkout. The external supervisor name is not exposed by this app and must not be guessed.

**Next bounded worker after that prerequisite:** repeat `CS-SELECTOR-RUNTIME-8788-CONTROL-ACTIVATION-VALIDATION-01` only. Validate direct `controlType`, nearby fields, source fingerprint, no-write evidence, and code/runtime agreement. Do not reopen the mapping, invoke Engine, address project registration, or widen another field.

## 2026-07-18 post-activation acceptance result

**Status:** OUTCOME O — OBSERVABILITY BOUNDARY.

Runtime 8788 now proves current-code activation through the HEAD-only Logo.dev runtime-status shape. The exact canonical Selector options GET succeeds with HTTP 200, echoes all four constraints, reports source ready, and visibly confirms System available. However, the connected app truncates the large full response inside the first System option list and cannot extract the later `controlType` field. The route itself has no existing bounded field-projection parameter, and no Selector route or response change was made.

Control availability, option authority, empty selection, Boolean exclusion, default/automatic-selection exclusion, alias rejection, driver consequence, and full nearby-field regression remain unproven rather than failed. The source fingerprint remains unchanged and the live operation was read-only and redacted.

**Current prerequisite:** connected-app/tooling must expose safe bounded extraction from the existing GET response. After that, rerun the same four-constraint acceptance. Do not reopen activation, Logo.dev, Control mapping, registration, Engine, Tier, Lab/IES, Program, or another Selector feature.

## 2026-07-19 authority snapshot refresh activation result

**Status:** OUTCOME O — SOURCE-SHAPE OBSERVABILITY BOUNDARY.

The stale active snapshot and materialised target remain unchanged at the 14 July artifact. The explicit guarded Google dry-run attempted the network call only on the refresh route and preserved all credential, Sheet ID, row, full-JSON, user, and path redactions, but the reader returned `google-reader-failed`. Validation did not reach a safe required-table or DRIVERS shape receipt.

No Phase 2 materialised live write and no Phase 3 archive/promotion call was issued. The active fingerprint remains `266de269e3e8f8b7191e4653d45580c251eb46025411574e0d1f2a27daca209d`. BOARDS option/label order, the corrected unsuffixed DRIVERS authority, duplicate-column absence/non-authority, and post-activation projection behaviour remain unproven.

The complete gate passed 103/103. The exact next bounded action is to repair or safely diagnose the existing Google reader boundary and rerun the same authority refresh worker from dry-run Phase 1. Promotion by table counts is prohibited; Selector projection repair and shared-tooling commissioning remain held.

## 2026-07-19 bounded Google reader diagnostics result

**Status:** OUTCOME R — FEATURE REPAIR PUSHED; RUNTIME ACTIVATION AND FOCUSED EXECUTION PENDING.

Feature commit `8d274983aa08669a671e5f5e9ac03aa77bdda8ff` replaces the generic post-preflight catch-all with safe allowlisted Google reader stage codes and adds a redacted in-memory DRIVERS/BOARDS/protocol-agreement summary. It does not return provider messages, stacks, URLs, headers, identities, credential data, Sheet ID, rows, or provider bodies. It does not change Selector authority selection, BOARDS pairing, snapshots, Google configuration, materialisation, archive, or promotion.

The connected app would not permit edits to the two legacy authority test files because they fall outside the lane's enforced write globs. Focused coverage was therefore added in the authorised directly relevant `tests/runtimeAuthorityReferenceMaterialiserDiagnostics.test.js`. The complete fixed `selector-engine` gate passed 103/103, but its command does not execute either legacy authority suite or the new runtime suite, and no separate focused-test runner is exposed. Focused execution is pending and must not be reported as passed.

Runtime 8788 has not loaded the repair: the post-commit empty-body dry-run still returned the old generic `google-reader-failed` response with no `failureCategory` or `currentSourceShape`. The active 14 July snapshot remains unchanged and read-only at fingerprint `266de269e3e8f8b7191e4653d45580c251eb46025411574e0d1f2a27daca209d`, size 983727 bytes, modified `2026-07-14T10:07:13.715322+00:00`.

**Exact next action:** the lifecycle owner must restart or reload runtime 8788 from `8d27498`. Through an approved runner, execute `tests/authorityReferenceGoogleReader.test.js`, `tests/authorityReferenceMaterialiserService.test.js`, and `tests/runtimeAuthorityReferenceMaterialiserDiagnostics.test.js`; then repeat only `POST /api/authority-reference/materialiser/refresh?dryRun=true` with `{}`. Classify the safe live result as A, C, or D. Do not materialise, archive, promote, repair Selector projection, invoke Engine, or change external Google configuration.
-->

