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

### Q-2H Emit the selected room temperature without thermal calculation

* id: SEL-018
* status: done
* depends-on: SEL-017 and recorded Program acceptance of the corrected Lab thermal receipt
* seam approval: Program & Integrate corrected thermal ruling and exact SEL-018 amendment recorded on 2026-07-21
* seam change: yes — Selector owns only the committed source-backed room selection and no thermal arithmetic
* gate: selector-engine
* authorised files: `packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js`, `tests/selectorReadonlyEngineCandidateMapper.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The temporary harness may add exactly one side-effect import of `./selectorReadonlyEngineCandidateMapper.test.js` through the fixed lane gate; it must be removed before the final diff, remain byte-identical to HEAD, and never be staged or committed.
* objective: read the single committed, source-backed Ambient selection, canonicalise only its finite Celsius number, and emit exactly one candidate field: `selectedRoomTaC`.
* acceptance: `25°C` emits `selectedRoomTaC: 25`; `35°C` emits `selectedRoomTaC: 35`; missing, malformed, duplicate, uncommitted, blocked, or non-source-backed Ambient fails closed; existing run, target lm/m, CCT/CRI, optic, Control and Tier-neutral mapping remains unchanged; the candidate contains no `referenceRoomTaC`, `referenceInternalTaC`, `opticThermalRiseTaC`, `opticInternalDeltaTaC`, `derivedInternalTaC`, `curveLookupTaC`, board temperature, verified lm/m, clamp or interpolation result. Focused mapper tests and the complete `selector-engine` gate pass, followed by exact two-file feature commit/push and a separate five-file lane-memory closeout.
* evidence: the current mapper omits `selectedRoomTaC`; the readiness preview already carries the committed Ambient intent; Program has accepted the completed Lab version-2 producer receipt and explicitly assigned all addition, lookup and output calculation to later Program and Engine parcels.
* prohibitions: Selector must not add, subtract, clamp, interpolate, default, substitute or look up any temperature or light output; do not change the option service, readiness producer, registration transport, server, curve parser, Lab, Program, donor, RuntimeData or main; do not perform browser acceptance, registration or Engine execution in this parcel.

### Q-2J Validate and bind Lab thermal evidence in Program

* id: THERM-P1
* status: done
* depends-on: accepted SEL-018 feature and lane-memory closeout
* seam approval: Program & Integrate parcel admitted on 2026-07-21
* seam change: yes — Program owns cross-lane identity and evidence validation, not thermal arithmetic
* gate: selector-engine
* authorised files: new `packages/workspace-kernel/labThermalEvidenceProgramAdapter.js`, new `tests/runtimeLabThermalEvidenceProgramAdapter.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeLabThermalEvidenceProgramAdapter.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: bind the accepted Selector candidate and one Program-validated source-backed optic identity to one exact `controlstack.lab.nvb-lab-projection.v2` object, then emit a deeply immutable accepted Program thermal-evidence bundle.
* acceptance: Selector optic, validated optic key, canonical optic BOM identity, Lab selection identity and Lab thermal-evidence identity all agree; Lab projection is read-only, path `optic`, blockers empty, evidence reference bounded, and `authorityState` exactly `null`; the measured triplet is finite and exactly satisfies `referenceRoomTaC + opticThermalRiseTaC = referenceInternalTaC`; success emits only selected room, validated optic identity/source revision, measured triplet, opaque evidence reference, `labAuthorityState: null`, `programValidationState: accepted_for_engine_thermal_lookup`, and read-only/version metadata. Missing, malformed, contradictory, unsafe, unresolved or identity-unbound input fails closed.
* prohibitions: no addition of selected room and rise, no curve lookup, clamp, interpolation, board temperature, verified lm/m, route, persistence, authority write, direct Lab mutation, existing photometry-adapter change, donor, RuntimeData or main change.

### Q-2K Execute the thermal lumen lookup in Engine

* id: THERM-E1
* status: done
* depends-on: accepted THERM-P1 feature and lane-memory closeout
* seam approval: Program & Integrate parcel admitted on 2026-07-21
* seam change: yes — Engine is the sole owner of applying the accepted optic rise and resolving verified lm/m
* gate: selector-engine
* authorised files: new `packages/workspace-kernel/runtimeThermalLumenExecution.js`, new `tests/runtimeThermalLumenExecution.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeThermalLumenExecution.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: consume only an accepted Program thermal-evidence bundle, apply the optic rise exactly once, and delegate the resulting lookup temperature to the existing runtime lumen-curve parse/interpolation contract.
* acceptance: Engine computes `derivedInternalTaC = selectedRoomTaC + opticThermalRiseTaC` and uses that same value as `curveLookupTaC`; 25 + 10 produces lookup 35 and 35 + 10 produces lookup 45; a second optic-bound bundle with a different measured rise, but the same room, current and curve, changes both lookup temperature and verified lm/m; the test must fail for hardcoded 35°C, hardcoded 10°C, use of the absolute reference-internal value as rise, or double application; low/high clamping preserves the unclamped derived value and reports clamp/interpolation/current modes; missing, malformed, contradictory, unaccepted or identity-unbound evidence fails closed. Boundary regression is mandatory: execute twice with identical engineering inputs and different user, project, owner, timeline and registration traceability envelopes, and require identical deterministic Engine output after excluding only declared request identifiers. The implementation and dependency receipt must prove the old project-registration, active-revision and selected-project eligibility path is bypassed rather than renamed.
* prohibitions: reject direct Lab projections and caller-supplied `derivedInternalTaC`, `curveLookupTaC`, board temperature or verified lm/m; do not change the existing curve parser, add routes or persistence, mutate RuntimeData, invoke donor execution, generate IES or outputs, or touch main.
* completion: feature and focused test pushed; focused harness gate passed 120/120; normal feature gate passed through guarded commit; traceability-envelope regression returned byte-for-byte equivalent deterministic results; dependency map contains only the Program evidence adapter and existing curve parser; project registration, active revision and selected-project eligibility are bypassed, not renamed.

### Q-2L Final Program acceptance of the corrected thermal chain

* id: THERM-A1
* status: done
* depends-on: THERM-E1
* seam review: final Program & Integrate cross-lane acceptance required
* seam change: no new implementation — this accepts the already-pushed Selector, Program-evidence and Engine parcels against the corrected data model
* gate: selector-engine evidence already complete; Program may require its own acceptance gate
* authorised files: read-only review only in the Selector lane; no feature, test, route, source, browser, registration, persistence, RuntimeData, donor, Lab, main or output write is authorised
* objective: obtain Program & Integrate acceptance of the complete chain from source-backed selected room temperature, through the immutable Program-bound Lab thermal evidence, to the Engine-only derived internal lookup and verified lm/m result.
* acceptance: Program confirms that `selectedRoomTaC` remains room temperature; the Program bundle binds one source-backed optic to exact Lab version-2 reference room, reference internal and measured optic rise evidence; Engine alone computes `derivedInternalTaC = selectedRoomTaC + opticThermalRiseTaC` exactly once and passes that value to the unchanged curve parser; varied optic-bound rise changes both lookup temperature and verified lm/m; missing, malformed, contradictory, unresolved or identity-unbound evidence fails closed; user, project, owner, timeline, registration and active-revision envelopes do not affect eligibility or deterministic output; and the planned lm/m parity audit compares runtime output with the approved data model and thermal calculation rather than donor-code parity.
* evidence: SEL-018, THERM-P1 and THERM-E1 are pushed and closed; focused thermal gates passed 125/125, 119/119 and 120/120 respectively; normal lane gates remained 107/107; THERM-E1 imports only the Program evidence adapter and existing curve parser; no registration, active-revision or selected-project eligibility dependency exists.
* prohibitions: no new Selector worker; no browser save, registration or live Engine proof; no donor-code parity accepted as data-model parity; no hardcoded room, rise, internal or lookup temperature; no main promotion or downstream activation before Program records acceptance.

### Q-2I Live-accept the completed thermal chain

* id: SEL-019
* status: superseded-as-engine-prerequisite
* superseded-by: the binding outside-governance / selections-only Engine boundary
* depends-on: none for Engine calculation
* seam approval: Program & Integrate boundary ruling accepted on 2026-07-21
* seam change: no — optional live persistence or traceability acceptance belongs to the outside governance layer
* gate: none for Engine eligibility
* authorised files: read-only unless a later outside-governance parcel is separately commissioned.
* objective: retain historical traceability of the former live registration workflow without blocking or influencing Engine calculation.
* acceptance: no Engine acceptance depends on browser save, registration, active revision, owner, project or timeline evidence. Any later governance proof must remain observational and must not alter Engine inputs or output.
* live-observation rule: no browser or runtime action is required for THERM-E1 or final computational acceptance.
* prohibitions: do not rename or recreate the former registration/active-revision gate; do not route governance envelope fields into Engine warnings, defaults, scoring, candidate exclusion, validation or output.

### Q-2 Register project-alpha active server-owned revision

* id: SEL-002
* status: historical-governance-only
* superseded-by: the binding selections-only Engine boundary
* depends-on: none for Engine calculation
* gate: none for Engine eligibility
* authorised files: read-only
* objective: retain the historical project-registration checkpoint only as outside-governance documentation.
* acceptance: no registration or active revision is required before Engine calculation. A later governance parcel may test persistence separately without changing Engine eligibility or output.
* prohibitions: do not rename, proxy or reintroduce this checkpoint as an Engine prerequisite; no duplicate save or registration run is authorised.

### Q-3 Execute selected-project Engine invocation

* id: SEL-003
* status: historical-governance-coupled-invocation
* superseded-by: THERM-E1 plus the selections-only boundary regression
* depends-on: none for Engine eligibility
* gate: none as a selected-project prerequisite
* authorised files: read-only
* objective: retain the historical selected-project invocation checkpoint without coupling Engine calculation to project registration.
* acceptance: THERM-E1 and final cross-lane acceptance prove the computational path directly from engineering selections, including envelope independence and no-write semantics.
* prohibitions: do not rename or recreate selected-project, active-revision or registration eligibility as a condition for Engine execution.

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
* status: done
* depends-on: accepted THERM-A1 final Program acceptance; the historical SEL-003 project-coupled gate is superseded
* gate: selector-engine
* authorised files: new `docs/engine/ENGINE_OUTPUT_CONTRACT_CANDIDATE_V1.md`, new `tests/engineOutputContractCandidate.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./engineOutputContractCandidate.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: produce a versioned candidate contract covering selected engineering inputs, result identity, thermal result composition, run-table rows, status/error semantics, technical provenance, replay/readback and compatibility without restoring any governance prerequisite.
* acceptance: the candidate is documentation-only and pins existing versioned producer artifacts where they comply; it explicitly classifies the persistence-coupled first-narrow row path as an outer consumer rather than an Engine prerequisite; it defines a non-persistent selections-only computational envelope, fail-closed status semantics, technical fingerprints, compatibility/rollback rules and the evidence still required before Program may declare stability. The focused static regression and complete gate pass; exactly the contract document and its focused test are committed and pushed. No downstream activation is implied.
* prohibitions: no feature, route, persistence, selected-project, registration, active-revision, RuntimeData, Lab, donor, main or downstream implementation; do not declare the contract stable; do not treat diagnostic scaffolds or persistence-coupled row builders as production-ready merely because their schemas are versioned.
* completion: the candidate document and focused regression were committed and pushed after 114/114 focused gate coverage. The document records `candidate_not_stable`, identifies the incompatible first-narrow row schema collision and persistence dependency, classifies the current RunTable scaffold as diagnostic-only, and defines the exact nine-part stability gate. Program review is now required; SEL-008, SEL-009 and SEL-010 remain blocked or held.

### Q-7A Seal the version-1 selected-result producer envelope

* id: ENG-STAB-P1
* status: implemented-and-accepted-internal-component
* public-contract status: superseded by ENG-OUT-P1 after Program accepted the three-schema SEL-007 candidate
* seam approval: Program reconciled the concurrent pushed receipt; the component may be imported internally but is not the public output boundary or a stability receipt
* gate: selector-engine
* authorised files: new `packages/workspace-kernel/runtimeEngineSelectedResultContractV1.js`, new `tests/runtimeEngineSelectedResultContractV1.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeEngineSelectedResultContractV1.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: validate one accepted safe selected-result source object and one accepted thermal execution result, then emit a deeply immutable `controlstack.engine.selected-result.v1` accepted-or-blocked non-persistent envelope.
* acceptance: exact schema/version/key sets; source identity and revision agreement; deterministic accepted and blocked fixtures; at least one safe per-run row; thermal values preserved without recalculation; outside traceability-envelope independence; malformed, unaccepted, contradictory, identity-unbound, unsafe or over-rich input fails closed with canonical blockers; no accepted runs or verified output on failure; no raw payload, source row, private path, exact private electrical internal, IES, PDF or artefact exposure. Focused coverage and the full gate pass, followed by exact two-file feature commit/push and a separate five-file lane-memory closeout.
* prohibitions: no Engine or donor invocation, no thermal recalculation, no curve-parser or existing scaffold rewrite, no route, persistence, RuntimeData mutation, IES handoff, downstream readiness activation, Lab, main or runtime-port change; do not declare the output contract stable.
* completion: exact module and focused test pushed after 114/114 coverage; deterministic accepted/blocked output, safe rows, source-revision binding, thermal preservation and governance-envelope independence proved. Program accepts it only as an internal non-stable selected-result component.

### Q-7B Implement the accepted version-1 request, output and row contracts

* id: ENG-OUT-P1
* status: done
* depends-on: SEL-007 and recorded Program acceptance of the three-schema candidate
* seam approval: Program & Integrate accepted `controlstack.engine.selection-set.v1`, `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`; stability remains withheld
* gate: selector-engine
* authorised files: new `packages/workspace-kernel/runtimeEngineOutputContractV1.js`, new `tests/runtimeEngineOutputContractV1.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeEngineOutputContractV1.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: implement exact non-persistent validators/builders for the selections-only request, complete-or-blocked output and one unambiguous RunTable row schema.
* acceptance: exact schema/version/key sets; deterministic complete, fail-closed blocked, valid zero-valued and replay-identical fixtures; one exact row field set; result identity derived only from request/source/policy/evidence fingerprints; governance-envelope independence; unknown versions, unsafe data, contradictory identities and caller-supplied derived or verified output fail closed; no legacy colliding row schema is reused.
* prohibitions: no actual Engine or donor invocation, no thermal recalculation, no curve-parser or existing scaffold rewrite, no route, persistence, RuntimeData mutation, IES handoff, downstream activation, Lab, main or runtime-port change; do not declare the output contract stable.
* commit message: `feat(runtime): implement Engine output contract v1`.
* completion: exact public contract module and focused test pushed, followed by a corrective two-file parcel that derives evidence identity server-side, validates the exact versioned draft, classifies caller Tier as derived/non-authoritative and preserves one exact row field set. Focused coverage passed 116/116; the harness was removed; no consumer or stability activation occurred.

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
* status: superseded by SEAM-G-P1 narrow IES request sequence
* depends-on: stable Seam B version-1 Engine output contract
* gate: selector-engine
* authorised files: read-only except the exact SEAM-G-P1 parcel below
* objective: downstream work is commissioned one artifact family at a time; generic DXF, quotation, reporting and other consumers remain held.
* acceptance: Program has declared Seam B stable and separately commissioned the exact read-only IES artifact request producer before any downstream work.
* prohibitions: no generic artifact implementation and no generation/write activation.

### Q-10A Deterministic IES artifact request contract

* id: SEAM-G-P1
* status: done
* depends-on: Program declaration that Seam B version 1 is stable and Program commission `docs(program): commission Seam G IES request producer`
* gate: selector-engine
* authorised files: new `packages/workspace-kernel/runtimeIesArtifactRequestContractV1.js`, new `tests/runtimeIesArtifactRequestContractV1.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeIesArtifactRequestContractV1.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: transform exact stable public Engine output JSON plus exact `ies_lm63_reference_build` intent into one deeply immutable `controlstack.downstream.ies-artifact-request.v1` complete-or-blocked read-only request envelope.
* acceptance: exact schema/version/key sets; deterministic complete, blocked and valid-zero fixtures; identical inputs produce identical request ID, replay key, audit projection and output; different user/project/owner/timeline/registration traceability envelopes produce identical output and do not appear; changed technical Engine identity changes request identity; unknown version, extra authority, raw/private/unsafe content, contradictory identity, blocked-to-ready promotion and legacy-row input fail closed; no raw IES, photometry, candela, file/path, route, persistence, email/export/download, Engine/donor invocation, generator, authority or reference mutation capability.
* prohibitions: no Selector UI/button change, no route or endpoint, no existing IES-handoff scaffold rewrite, no Lab import/write, no RuntimeData, donor, main or runtime-port change; do not activate Seam G or actual IES generation.
* commit message: `feat(runtime): add IES artifact request contract v1`.
* on success next: Program producer receipt review; SEAM-G-C1 remains blocked.
* completion: exact two-file producer pushed after 115/115. Complete, blocked, zero, replay, envelope-independence, technical-identity movement and fail-closed security fixtures passed. The temporary harness was removed and the tree returned clean. No generation, route, write or activation occurred.

### Q-10B Deterministic single-run IES generation input contract

* id: SEAM-G-P2
* status: done
* depends-on: active Seam G version-1 read-only request tunnel and Program commission `docs(program): commission IES generation binding sequence`
* gate: selector-engine
* authorised files: new `packages/workspace-kernel/runtimeIesGenerationInputContractV1.js`, new `tests/runtimeIesGenerationInputContractV1.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeIesGenerationInputContractV1.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: bind one exact ready artifact request version 1 to its exact matching Engine selection-set request and emit one immutable `controlstack.downstream.ies-generation-input.v1` ready-or-blocked single-run envelope.
* acceptance: exact schema/version/key sets; recomputed selection fingerprint matches the artifact request Engine contract and all row identities; exact product/light/run/control shape with one run; positive integer quantity and length; valid zero target lm/m and room ambient; deterministic identity/audit; replay-identical and traceability-inert output; changed selection, request or technical identity moves generation-input identity; unknown, blocked, extra, multi-run, governance, unsafe/private/raw, fingerprint-mismatched or contradictory input fails closed.
* prohibitions: no stable request-contract edit, Lab import/write, reference identity, sealed DTO, authority body, Engine/donor invocation, LM-63 generation/text, route, persistence, file/network/email write, RuntimeData, main or runtime-port change.
* commit message: `feat(runtime): add IES generation input contract v1`.
* on success next: Program producer review; SEAM-G-C2 remains blocked.
* completion: exact two-file producer plus one exact two-file tightening checkpoint pushed after 115/115. Selection fingerprint, artifact identity/audit, profile, row, thermal-mode/effective-temperature, private-path and no-generation boundaries passed. The temporary harness was removed and the tree returned clean. No reference binding or LM-63 generation occurred.

### Q-11A Retire named readiness gates and emit state-entry push intent

* id: PWS-001
* status: done
* depends-on: Program & Integrate admission recorded and satisfied on 2026-07-21
* seam change: yes — readiness transitions become state-entry push events and CRM-facing language must stop treating state as a gate
* gate: selector-engine
* execution order: first of three; PWS-002 and PWS-005 must not start before this item is fully closed
* authorised files: minimum proven subset of `packages/modules/cs-selector/selectorViewModel.js`, `packages/modules/cs-selector/selectorView.js`, `packages/modules/cs-selector/index.js`, new `packages/workspace-kernel/selectorReadinessStateEntryPush.js`, new `tests/runtimeSelectorReadinessStateEntryPush.test.js`, existing focused readiness tests only when an assertion genuinely changes, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeSelectorReadinessStateEntryPush.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: retire Gate 1 and Gate 2 as named business/readiness gates, retain `specReady` and `buildReady` as truthful fail-closed states, and emit one deterministic safe push intent only when each state is entered.
* acceptance: user-facing and CRM-facing live contracts no longer name Gate 1, Gate 2, spec gate, build gate, CRM gate or HubSpot gate; state names remain Spec Ready and Build Ready. A false-to-true transition emits exactly one immutable state-entry push intent; rerender, repeated snapshot evaluation, save/restore hydration and repeated true state do not duplicate it; leaving and genuinely re-entering a state may emit one new intent with a new deterministic transition identity. Build Ready cannot push before Spec Ready. Payload contains only bounded state, technical/project-safe identifiers and fingerprints approved by Program, never raw CRM/contact/company payloads, credentials, private paths or authority rows. Different traceability envelopes cannot alter the engineering state decision. Repository-wide focused search proves no CRM/HubSpot readiness construct remains named a gate.
* provider boundary: this parcel creates the state-entry push contract/event only. It must not enable an external HubSpot/CRM mutation unless the recorded Program admission explicitly names the existing server-owned writer, exact target state, idempotency key, retry rule and rollback behaviour.
* completion: exact readiness intent, Selector integration, presentation and genuinely changed readiness assertion files were committed and pushed after 114/114 focused harness coverage and 107/107 normal and guarded commit gates. The harness was removed and absent from the final diff. Spec Ready and Build Ready predicates are unchanged; state-entry intent is deterministic, immutable, hydration-safe, provider-inert, traceability-independent and path/URL quarantined. The feature tree ended clean.
* prohibitions: no change to readiness predicates, source authority, Selector choices, Tier, Engine eligibility, Lab/IES, persistence, routes, direct browser networking, hidden provider mutation, duplicate push on render/hydrate, main or runtime-port work.

### Q-11B Add factoryReady on the existing readiness pattern

* id: PWS-002
* status: done
* depends-on: PWS-001 done; Program & Integrate admission recorded and satisfied on 2026-07-21
* seam change: no unless Program changes the existing Factory Approved Inputs authority; this parcel exposes a truthful derived state only
* gate: selector-engine
* execution order: second of three
* authorised files: minimum proven subset of `packages/modules/cs-selector/selectorState.js`, `packages/modules/cs-selector/selectorViewModel.js`, `packages/modules/cs-selector/selectorView.js`, `packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js`, new `tests/runtimeSelectorFactoryReadyState.test.js`, existing `tests/selectorSpecBuildReadinessPreview.test.js` and `tests/selectorSpinePayloadSkeleton.test.js` only where assertions genuinely change, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeSelectorFactoryReadyState.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: add `factoryReady` as the Stage 3 readiness state following the existing `specReady` and `buildReady` pattern without replacing or weakening `factoryApprovedInputsReady` evidence.
* acceptance: `factoryReady` is false by default and becomes true only when Spec Ready and Build Ready are true, the existing Factory Approved Inputs summary is ready, every required committed source-backed input is present, and no blocker, ambiguity, invalid value or incompatible selection remains. It is carried consistently through state, view-model, payload/readiness preview, stage indicators and diagnostics; no diagnostic/display fallback can make it true. A false-to-true entry is observable for the later state-entry push sequence, but this parcel performs no CRM push itself. Missing, malformed, duplicate, uncommitted, non-source-backed or contradictory factory evidence fails closed. Existing `factoryApprovedInputsReady`, candidate mapping, Engine/Lex ownership, valid-zero handling and no-write flags remain unchanged.
* prohibitions: no new factory authority, default, inference, automatic approval, output generation, provider write, Engine invocation, Lab/IES change, route, persistence, RuntimeData mutation, main or runtime-port work.
* completion: `factoryReady` is now a separate fail-closed Stage 3 state derived only from Spec Ready, Build Ready, committed Selector evidence and the unchanged Factory Approved Inputs summary. Missing, malformed, duplicate, uncommitted, blocked, non-source-backed, contradictory or incompatible evidence remains false. Focused harness coverage passed 128/128, the harness was removed, and normal plus guarded feature gates passed 107/107. Exactly the four authorised Selector surfaces and one focused runtime test were committed and pushed; the feature tree ended clean.

### Q-11C Correct stale shell save/restore lifecycle copy

* id: PWS-005
* status: done
* depends-on: PWS-002 done; Program & Integrate admission recorded and satisfied on 2026-07-21
* seam change: no — copy and diagnostics must describe the already-live shell-owned lifecycle truth without changing behaviour
* gate: selector-engine
* execution order: third of three
* authorised files: exactly `packages/modules/cs-selector/selectorViewModel.js`, `packages/modules/emergence/emergenceViewModel.js`, `packages/modules/scene-builder/sceneBuilderViewModel.js`, `packages/workspace-kernel/contracts.js`, new `tests/runtimeWorkspaceSaveRestoreLifecycleCopy.test.js`, temporary harness-only use of `tests/engineRunTableDomain.test.js`, and closeout updates to the five mutable lane context files. The harness may add exactly one side-effect import of `./runtimeWorkspaceSaveRestoreLifecycleCopy.test.js`; it must be removed, byte-identical to HEAD and absent from final staging/commit.
* objective: remove stale statements that Save/Restore is shell-owned and deferred, and make all three view models plus the workspace contract describe the current shell-owned live save, restore and hydrate behaviour truthfully.
* acceptance: Selector, Emergence and Scene Builder no longer claim save or restore is deferred; they state that save/restore/hydrate is shell-owned and live through Project Browser while module-local mutation remains prohibited. `contracts.js` no longer classifies save/restore as a deferred real implementation and exposes a current lifecycle classification consistent with `projectService` and Project Browser capabilities. Handoff/share and CRM/provider writes are described separately and are not accidentally promoted. Focused static and behaviour assertions prove the four files agree and no stale save/restore-deferred phrase remains in live view-model or contract output.
* prohibitions: copy/contract truth only; no save, restore, hydrate, handoff/share, CRM, provider, project-store or route implementation change; no browser action, persistence migration, Engine, Lab/IES, RuntimeData, main or runtime-port work.
* completion: Selector, Emergence, Scene Builder and the workspace contract now agree that save, restore and hydrate are shell-owned and live through Project Browser while module-local project mutation remains prohibited. Handoff/share and CRM/provider writes remain separately deferred. Focused harness coverage passed 112/112, the harness was removed, and normal plus guarded feature gates passed 107/107. Exactly the four authorised copy/contract surfaces and focused runtime test were committed and pushed; the feature tree ended clean.

### Program admission and active architectural constraints for PWS work

Program & Integrate admitted all three items on 2026-07-21. PWS-001, PWS-002 and PWS-005 are done. No PWS item remains ready; no second writer may use this worktree.

Selector owns the derived readiness state and immutable state-entry intent only. It must not invoke HubSpot, CRM, project persistence or identity logic. Governance & Shell owns provider policy, project/identity association, idempotency, retry and best-effort external push.

**PWS-010 applies immediately:** Selector and every downstream module must not create a module-owned download, export, file-delivery, artifact-retrieval route or browser helper. Internal Seam G request/generation contracts may continue, but outward retrieval must terminate through the single future Governance & Shell gateway. Readiness and identity are separate checks and neither may become an Engine prerequisite.

**Standing tests are binding across all three parcels and later Seam G work:**

1. identical engineering selections with different traceability envelopes produce identical output;
2. the same engineering selections run deterministically with no envelope at all;
3. changing one optic's measured rise changes both lookup temperature and verified output;
4. wherever lookup values are identical placeholder rows, vary one row and prove the output moves;
5. assert ownership across every governed system/row rather than one named product instance.

No parcel may narrow, remove or omit these tests from effective acceptance without a new Program decision.

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

