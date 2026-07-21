# Selector & Engine Decision Log

This log is append-oriented. Do not silently rewrite historical decisions.

## 2026-07-18 — Repository memory replaces chat memory

**Decision:** Repository lane memory is authoritative; chat history is supporting context only.

**Rationale:** The initial implementation used a Selector-local documentation directory because the canonical lane path was not yet available through the lane guard.

**Consequence:** Fresh orchestrators read the six durable context files first. The original location decision is superseded by the canonical-path decision recorded on 2026-07-19.

## 2026-07-18 — Accepted base is 08df070

**Decision:** Use `08df070890300058353cc621c1383f16492063f1` as the lane's verified pre-memory base.

**Rationale:** Current root, branch, HEAD, recent history, and clean Git state were observed through the correct v2 lane app.

**Consequence:** Historical instructions targeting `C:\ControlStack_Runtime`, `main`, or runtime port 8787 are superseded for Selector feature work.

## 2026-07-18 — Closed repairs stay closed

**Decision:** Direct Control/Protocol applicability, live authority intersection, cold-boot arbitration, and snapshot caching are treated as completed parcels in the current history.

**Rationale:** Specific commits are present in the verified base. Reopening them from stale reports would duplicate work.

**Consequence:** A worker may reopen one only with a current reproducible failure and an exact boundary.

## 2026-07-18 — Prove one slice before widening

**Decision:** The next milestone is a bounded closeout of one real Selector-to-Engine slice.

**Rationale:** It provides evidence about architecture reuse and widening cost. Broad parallel feature changes before this proof would obscure the first failing seam.

**Consequence:** Widening and downstream consumers remain held until the closeout and Engine contract candidate.

## 2026-07-18 — One writer and gated Git

**Decision:** One writer operates in this worktree; staging is explicit; commit and push use gated lane tools.

**Rationale:** Human line-by-line code approval is not a reliable safety control for this project. Machine-enforced scope, tests, branch guards, and durable receipts are the control layer.

**Consequence:** Patrick approves objectives and outcomes, not individual code lines. Feature lanes never write `main`.

## 2026-07-18 — Seam changes require Program acceptance

**Decision:** Any change to the Selector-to-Engine or Engine-output contract is proposed to Program & Integrate with producer and consumer evidence.

**Consequence:** This lane cannot activate Lab or downstream-artifact work unilaterally.

## 2026-07-18 — Tier is derived after run

**Decision:** Tier is not a user-selectable Selector prerequisite. It is a consequence computed by the Engine/Lex path after run intent and source-backed candidate inputs are available.

**Rationale:** The user confirmed the product rule, and the current live Selector correctly does not expose a Tier choice.

**Consequence:** Workers must not add, fake, or require a Tier dropdown merely to satisfy Engine payload shape. Any bridge needing Tier must derive or bind it at the correct post-run boundary.

## 2026-07-18 — Browser save and server registration are separate evidence

**Decision:** A saved browser-session envelope proves local shell save state only. Server-owned registration requires its own acknowledgement or active-revision receipt.

**Rationale:** The current user dump shows a real `project-alpha` runtime-session envelope but does not show server-registration acknowledgement.

**Consequence:** Runtime acceptance must report browser save and active server revision separately and must not infer one from the other.

## 2026-07-18 — Reopen only the live Control options boundary

**Decision:** Direct Control/Protocol options are reopened for read-only diagnosis because new current live evidence shows Control blocked while nearby source-backed fields remain available.

**Rationale:** This satisfies the earlier closed-repair rule: there is now a current reproducible live failure. Historical repair commits do not override current payload truth.

**Consequence:** The next worker diagnoses the exact options-derivation boundary without patching. Rendering, cold boot, caching, optic-efficiency enrichment, and length feasibility remain closed unless the diagnosis directly implicates them.

## 2026-07-18 — Control repair requires proven genuine authority

**Decision:** The accepted diagnosis locates live Control loss at the BOARDS × DRIVERS protocol-authority intersection. A repair may map only a proven genuine active-source authority column or canonical value form.

**Rationale:** Descriptive aliases are intentionally non-authoritative. Broadening them, unioning BOARDS and DRIVERS labels, or defaulting DALI-2 would create unsupported product authority.

**Consequence:** `CS-SELECTOR-LIVE-CONTROL-AUTHORITY-INTERSECTION-REPAIR-01` must first distinguish mapping/canonicalisation mismatch from missing upstream DRIVERS authority. It patches only the former; for the latter it stops without code changes and identifies the upstream data owner.

## 2026-07-18 — Duplicate-normalised DRIVERS protocol field is authoritative when populated

**Decision:** In the current active-source shape, populated `native_control_type__2` is treated as the genuine DRIVERS protocol authority ahead of the boolean marker in `native_control_type`; existing native and legacy fallbacks remain unchanged when the duplicate-normalised field is absent.

**Rationale:** Approved read-only active-source comparison proved that duplicate header normalisation preserved the genuine protocol values in `native_control_type__2`, while `native_control_type` now contains boolean markers. Treating the marker as protocol authority creates non-matching `true`/`false` descriptors and empties the truthful BOARDS × DRIVERS Control intersection.

**Consequence:** The Selector may map only this proven duplicate-normalised authority boundary. Descriptive aliases remain non-authoritative; no source union, fallback Control, DALI default, automatic selection, RuntimeData mutation, or broader schema reinterpretation is authorised. Runtime activation remains a separate operational acceptance step.

## 2026-07-19 — Canonical context path adopted

**Decision:** `docs/_context/lanes/selector-engine/` is the canonical Selector & Engine lane-memory path.

**Rationale:** One standing worker model must serve all lanes through a consistent context shape. The six-file migration was already staged as renames and required content correction only; movement was not reattempted.

**Consequence:** All workers read the six canonical files first, all durable updates remain within that directory, and no tracked reference to the former path may remain.

## 2026-07-19 — Four-status operating model adopted

**Decision:** Worker responses use exactly one leading status: `AUTO`, `SEND TO INTEGRATE`, `NEEDS YOU`, or `STOPPED`.

**Rationale:** The status line makes lane autonomy, integration readiness, human action, and genuine boundaries explicit.

**Consequence:** `AUTO` is lane-branch work only and never means main; `SEND TO INTEGRATE` identifies a parcel ready for Program & Integrate; `NEEDS YOU` names one concrete Patrick action; `STOPPED` records a genuine boundary and is a successful outcome.

## 2026-07-19 — Orchestrator owns queue order; workers execute only the top qualifying item

**Decision:** The orchestrator writes and orders SEL queue items. A worker executes only the first item marked `ready` whose dependencies are satisfied.

**Rationale:** Queue ownership and execution authority must remain separate to prevent workers widening scope or selecting convenient work.

**Consequence:** No qualifying item means `STOPPED - queue empty`; a seam item without recorded Integrate approval means `STOPPED - seam approval required`.

## 2026-07-19 — Server registration is the next Engine gate

**Decision:** SEL-002 is the only next ready item after SEL-001. It must use the genuine existing `project-alpha` browser-session envelope to establish an active server-owned revision.

**Rationale:** `project-alpha` has a browser-session envelope but no active server-owned revision; selected-project Engine invocation currently returns HTTP 422 `active-server-revision-invalid`.

**Consequence:** Server-side registration is the gate on running the Engine. SEL-002 must not invoke Engine or fabricate, reconstruct, or substitute project truth. SEL-003 and later work remain unexecuted.

## 2026-07-19 — Diagnose pre-Engine eligibility before retrying registration

**Decision:** `SEL-011` is the new top ready read-only item. `SEL-002` is blocked until the two genuine `project-alpha` refusals at `selected-project-registration-client-pre-engine-eligibility-invalid` are diagnosed condition by condition.

**Rationale:** Both browser-session saves succeeded, but the client transport rejected the declared pre-Engine eligibility projection before producing a dispatchable source projection. The generic blocker does not reveal which internal readiness condition failed and does not by itself prove server-route unavailability.

**Consequence:** The diagnosis must distinguish a UI-suppliable missing input from an incomplete or unavailable served registration path, and must classify durable-persistence unavailability separately. It may recommend but not implement a repair or UI action. No Engine invocation or registration POST is authorised in SEL-011.

## 2026-07-19 — Tier authority moves to the server-owned Engine/Lex boundary

**Decision:** Program & Integrate approval is reported as recorded and pushed. `SEL-012` may remove Tier from Selector registration eligibility and candidate authority, reject client Tier, and derive/bind Tier only at the existing server-owned Engine/Lex execution boundary.

**Rationale:** SEL-011 proved the current registration and candidate contracts require a manually committed Tier that the Selector must never own. This makes successful registration impossible through truthful UI input. The donor Engine contract already treats Tier as an execution strategy/result concern, while the downstream selected Tier result field is established and must remain stable.

**Consequence:** Tier is not a Selector control, committed constraint, default, cache, or client authority. The repair must preserve all other inputs, explicit Control selection, read-only/no-write behaviour, and the existing Tier result field meaning and shape. Unique source-backed derivation may bind Tier at the server execution boundary; zero or multiple valid derivations must stop with specific blockers. Any Lab/IES incompatibility or Tier output-contract change requires separate Program approval.

## 2026-07-19 — Source-backed Tier binding is implemented only at host execution

**Decision:** SEL-012 implements the approved ownership by removing Tier from Selector registration and candidate authority, stripping all browser Tier forms, and resolving exactly one valid Tier from `SYSTEM_POLICY` immediately before the existing protected host execution seam.

**Rationale:** The active execution contract requires a single Tier-shaped input, but truthful Selector state cannot provide Tier. The smallest contract-preserving repair is to derive the Tier from approved Engine policy authority at the server boundary and then present the donor-compatible single-Tier shape internally.

**Consequence:** One valid source Tier is bound only for host execution. Zero valid Tiers fail as unavailable; multiple valid Tiers fail as ambiguous. No default, guess, cache, union, browser authority, automatic Control selection, project fabrication, or downstream Tier-result schema change is permitted. Registration repairs only the Tier-only readiness defect and continues to expose the actual safe blocker for every other failed input.

## 2026-07-19 — Diagnose the new non-Tier readiness condition before registration retry

**Decision:** `SEL-013` is the sole top ready item. `SEL-002` is blocked until the exact condition behind the current saved projection's `ready: false` state is proven from genuine evidence.

**Rationale:** Runtime activation of the Tier repair is proven, and the genuine save `env-project-alpha-1784455602109` reached the repaired client. The client still stopped before rebuilding or dispatch because the declared projection was not ready for a non-Tier reason. The emitted `selected-project-registration-client-pre-engine-eligibility-not-ready` value is a fallback, not proof of the underlying failed condition.

**Consequence:** The next worker is read-only and must distinguish run intake, remaining source-backed input, candidate-mapper, projection-blocker, and served-path defects. It may return an exact UI remedy or recommend the smallest repair, but it must not save again, dispatch registration, invoke Engine, patch code, or fabricate browser/project truth.

## 2026-07-20 — Registration eligibility follows the dedicated readonly candidate, not the full spec/build gate

**Decision:** `SEL-014` is a bounded non-seam repair. Registration preflight must rebuild and validate the dedicated Tier-neutral readonly candidate before rejecting a structurally valid saved projection merely because the broader local Stage-2/spec-build gate is incomplete.

**Rationale:** Genuine browser evidence proves run intake ready, the readonly candidate mapper ready, all first-slice lighting inputs and explicit source-backed Control committed, and no incompatible selections. The full spec/build gate remains incomplete only for Ambient plus Mounting/Finishes. Ambient is unavailable from current source, while Mounting/Finishes are broader product/build inputs. None belongs to the already-approved first readonly registration candidate. The live source bridge reports every expected table present, so authority refresh is not a registration prerequisite. Tier remains server-owned and non-authoritative in Selector.

**Consequence:** The registration client may revalidate the first-slice candidate from safe committed constraints, run intake, and light/Control intent while preserving fail-closed handling for every actual required candidate input, malformed state, unsafe flags, accessories, unsupported emission, and blocked constraints. The full spec/build gate, output contracts, Tier ownership, Control authority, source data, and downstream consumers remain unchanged. SEL-002 stays blocked until this repair is activated and proven with a new genuine save.

## 2026-07-20 — Use a temporary gate harness when the focused suite is omitted from the fixed runner

**Decision:** SEL-014 may temporarily import its authorised registration transport suite from the already gate-included `tests/engineRunTableDomain.test.js`, solely to execute the omitted focused tests through the fixed approved lane runner.

**Rationale:** The connected app exposes no arbitrary or focused test command, while the normal fixed gate omits the exact authorised test file. The same temporary-import method was already used and accepted for SEL-012. It provides executable evidence without committing a harness change or weakening the lane gate.

**Consequence:** The temporary import must run all eight registration transport tests, then be removed. The harness file must be byte-identical to HEAD, absent from the final diff, unstaged, and uncommitted. The final feature commit remains limited to the two original SEL-014 feature/test files, followed by the normal baseline gate and durable reconciliation.

## 2026-07-20 — Workers run guarded batches of up to five parcels

**Decision:** After completing a parcel and its durable documentation closeout, a worker immediately takes the next top ready item and repeats, up to five consecutive completed parcels in one run. The orchestrator reviews at batch boundaries and seams rather than after every parcel.

**Rationale:** Per-parcel orchestrator pauses have not produced the genuine catches. Effective safeguards have come from worker self-stops at explicit boundaries and from Patrick's live observation. Batching removes unnecessary handoffs without weakening the controls that have proven useful.

**Consequence:** Every parcel still receives its own scope enforcement, focused evidence, full gate, exact staged-file equality, gated feature/read-only result, durable closeout, second full gate, and HEAD reconciliation. A worker stops the batch immediately and successfully on seam approval required, stale lane state, failed required test or gate, out-of-scope behaviour inside an authorised file, queue empty, or acceptance that genuinely requires live application observation, a browser action, human eyes, or real-world judgement unavailable from repository evidence. Human-observation items remain incomplete and return `NEEDS YOU` with exact click-by-click steps; repository evidence must never be substituted for required observed behaviour.

## 2026-07-20 — Stable charter owns both standing role prompts

**Decision:** `LANE_CHARTER.md` is the sole canonical home for both the standing worker prompt and the standing orchestrator prompt. `SESSION_HANDOFF.md` retains only bootstrap pointers, the permanent Communication rule, and changing session evidence.

**Rationale:** The handoff is intentionally rewritten after parcels and has previously lost the worker prompt. A fresh orchestrator also had no repository-owned standing prompt. The charter is stable lane policy and does not churn with parcel closeouts.

**Consequence:** Either role can start from one line directing it to read `LANE_CHARTER.md` and act per the recorded standing role prompt. Both prompts then require reading all six canonical files before action. Parcel closeouts must not duplicate, rewrite, or remove the canonical prompts from the charter; historical handoff references must point to the charter instead of the top of the handoff.

## 2026-07-20 — Candidate-specific registration rebuild is the authoritative preflight

**Decision:** SEL-014 is accepted. For the first readonly registration slice, the client validates the safe declared shape, strips client Tier, rejects unsupported accessory or indirect intent, then rebuilds and validates the dedicated candidate before considering the broader Stage-2/spec-build readiness state.

**Rationale:** Ambient, Mounting, Finishes, the Tier summary, and legacy TIERS diagnostics belong to the broader build preview and are not inputs to the already-approved direct readonly candidate. Rejecting on that outer state before candidate reconstruction made a truthful first-slice registration impossible.

**Consequence:** Broad preview blockers cannot override a complete direct candidate. Missing run, optic, target, CCT, CRI, or explicit source-backed Control; malformed or path-bearing state; blocked constraints; unsafe execution flags; accessories; and indirect emission remain fail closed before dispatch. Registration payload shape, Tier ownership and result meaning, Control authority, no-write flags, the full spec/build gate, and downstream seams remain unchanged. The next proof requires a genuine browser save and visible server-registration acknowledgement.

## 2026-07-20 — Exact SYSTEM capability outranks broad OPTICS applicability

**Decision:** The selected product's direct/indirect capability is determined by the exact selected SYSTEM option. A broad OPTICS system key may describe compatible optic direction but cannot make indirect capability available for another System variant sharing that broad key.

**Rationale:** Current source truth distinguishes direct-only DNX 60 (`60|Square`) from DNX 60 Beam DI (`60|Beam`). Existing lane suppression already reads the exact SYSTEM row and correctly hides indirect lanes for the direct-only product. Broad OPTICS expansion across both `60` variants created only a false auto-consequence.

**Consequence:** `SEL-015` may gate `indirectCapability` through the existing exact selected-System support state. It must preserve the two System variants, legitimate indirect OPTICS data for Beam DI, source authority, direct capability, and every unrelated cascade. No source edit or seam change is authorised.

## 2026-07-20 — Diagnostic presentation text is never selected intent

**Decision:** Hidden, blocked, unavailable, warning, and diagnostic labels cannot satisfy light-output readiness intent. Readiness may capture only an actual selected source-valid option, an explicit manual value, or a valid inherited value on a supported lane.

**Rationale:** `fieldDisplayValue()` currently falls through to diagnostic `effectiveLabel` text. For hidden indirect fields, wording such as `not required or supported` can therefore become a non-empty value and incorrectly set readiness true. Registration then correctly rejects what appears to be indirect intent, even though no user intent exists.

**Consequence:** `SEL-016` must remove diagnostic fallback text from intent capture while preserving truthful direct intent, valid supported indirect intent, and registration's existing refusal of genuine indirect emission. It must not manufacture values or weaken any first-slice safety rule.

## 2026-07-20 — Indirect capability follows exact selected SYSTEM support

**Decision:** `indirectCapability` is subject to the same exact selected-SYSTEM indirect-support state as indirect optic and Light/Control lanes.

**Rationale:** Broad OPTICS relationships describe size-level optic compatibility and may span distinct product variants. They cannot override the exact selected SYSTEM row's product capability.

**Consequence:** Direct-only DNX 60 blocks the `Indirect supported` auto-consequence while DNX 60 Beam D/I retains it. Direct capability, legitimate OPTICS rows, System variant separation, Control, Tier, registration, and downstream contracts remain unchanged.

## 2026-07-20 — Readiness intent uses presentation-aware field truth

**Decision:** When duplicate field keys exist, the light-output readiness preview uses the runtime workflow field carrying display mode, provenance, and inheritance classification. Intent is accepted only from a non-blocked selected option, an explicit supported manual value, or a supported inherited match-direct value.

**Rationale:** Flat field copies can omit current inheritance metadata, while presentation labels can contain diagnostic or unavailable wording. Using the classified workflow field and requiring an underlying selected/manual/inherited value separates real intent from explanatory copy.

**Consequence:** Direct-only hidden indirect fields remain not selected. Genuine direct intent and supported D/I inherited CCT/CRI and Control remain available. The existing manual target BOARDS-backing rule and registration's genuine indirect-emission refusal remain unchanged.

## 2026-07-20 — Live page evidence overrides a simplified green fixture

**Decision:** SEL-015 is reopened through a new bounded parcel because the live page still creates Indirect supported for exact direct-only DNX 60. The new repair must use the live-shaped 60|Square and 60|Beam System identities through the full service-to-view-model path.

**Rationale:** The previous regression proved a simplified direct-only identity but did not cover the exact active-source variant pair. Repository tests cannot close a page-level acceptance when current live evidence contradicts them.

**Consequence:** SEL-017 must locate the first divergence between exact SYSTEM support and the rendered automatic consequence, then patch only that boundary. Test-case recall differences for Emergency, EWIS, Sensor, and Run are explicitly excluded. Registration remains blocked and no further browser action occurs until the repair is complete.

## 2026-07-20 — Absence is valid for a non-authoritative duplicate capability record

**Decision:** A duplicate flat `indirectCapability` record is not required for acceptance. When no such duplicate is emitted, the no-false-capability contract is satisfied; tests must not create or require one merely to assert a blocked status.

**Rationale:** The first live-shaped SEL-017 run passed every existing check and stopped only because the new regression expected a duplicate record that the service did not produce. Manufacturing that record would add surface area without improving page truth.

**Consequence:** The preserved regression must accept absence on both the direct-only and direct-indirect variants, continue through the page-level assertions, and retain only the minimum implementation change proven necessary. Any genuinely emitted capability option must still follow exact selected-SYSTEM support; no duplicate record may be manufactured for either variant.

## 2026-07-20 — Ambient is a required real Engine input, not an optional preview field

**Decision:** Ambient temperature is now a blocking Selector-to-Engine seam issue. The lane must not register or invoke Engine under a contract that omits Ambient while the intended temperature/lumen lookup requires a finite temperature.

**Rationale:** The live UI provides no Ambient selector. Repository truth shows Ambient is defined as a SYSTEM_POLICY-backed workflow field, but the current first-readonly candidate explicitly declares Ambient not required and omits it. The runtime lumen interpolation contract requires finite `temp_c`; a guessed fixture value would be fabricated project truth.

**Consequence:** SEL-018 requires Program & Integrate approval before implementation. That decision must identify source authority, decide whether Ambient gates registration or Engine only, approve the candidate field and unit, and require fail-closed behaviour with no invented 25°C or 35°C default. SEL-002 and all Engine activity remain blocked until the seam is approved and implemented.

## 2026-07-20 — Program & Integrate approves the Ambient temperature seam

**Decision:** The authoritative selectable Ambient values are only the explicit finite Celsius choices exposed from the active read-only `SYSTEM_POLICY` authority through the existing source-backed Selector option service. Ambient rows may use the already-supported Ambient/temperature policy shapes, but fixtures, product type, System identity, Tier, application, IP rating, optics, lab data, or historical examples are never authority. When the active source provides no valid finite Celsius choice, the Ambient field remains unavailable and the upstream source owner must correct the authority; the Selector must not manufacture a list.

**Registration policy:** A browser-session save may retain incomplete project state, but server-owned registration remains an Engine-readiness certification and therefore requires Ambient. Missing or invalid Ambient blocks registration and consequently blocks Engine invocation. Registration must not establish an active server-owned revision whose reconstructed readonly candidate cannot supply the required temperature input.

**Field contract:** The exact Selector-to-Engine candidate field is `lighting.ambient_temp_c`. Its value is a JSON number representing degrees Celsius. The protected Engine bridge must pass that same finite numeric value to the temperature/lumen interpolation request as `temp_c`; no alternate field, display label, policy fallback, or donor default becomes authority.

**Fail-closed contract:** Ambient is absent unless one committed source-backed Selector choice resolves to exactly one finite numeric Celsius value. Missing, blank, ambiguous, non-numeric, non-finite, malformed, or non-source-backed values must stop candidate readiness, registration, and invocation before donor Engine execution. Existing donor-side or fixture defaults such as 25°C or 35°C must be bypassed by the protected boundary and must not rescue an invalid request.

**Implementation approval:** After SEL-017 closes, SEL-018 is approved as one bounded Selector/registration/readonly-Engine seam parcel. It may expose the source-backed Ambient selector, retain the committed selection in genuine project state, require and carry `lighting.ambient_temp_c`, and add a final server-side finite-number guard before the host adapter. Focused tests and the full lane gate must prove positive and negative cases. Live proof must show active-source options, a genuine selected value surviving save and registration, the exact numeric candidate value reaching the interpolation lookup, and absent/non-numeric values refusing safely. No Engine execution is authorised during implementation; the first bounded execution proof is authorised only after all source, candidate, registration, and server guards are green and the registered revision contains the approved Ambient value.

## 2026-07-20 — Page-level indirect consequence is governed at the exact SYSTEM boundary

**Decision:** SEL-017 is accepted with the exact selected-SYSTEM support check in the option service as the first divergent boundary. No view-model implementation change is required.

**Rationale:** The live-shaped `60|Square` and `60|Beam` service-to-view-model regression now passes end to end. Direct-only output contains no indirect-support page truth, while Beam D/I retains legitimate indirect capability. Optional duplicate flat capability records may be absent on either variant.

**Consequence:** SEL-017 is done. The option service and its cascade regression are the complete feature scope. Registration and Engine work remain blocked at SEL-018 until Program & Integrate approves the Ambient seam.

## 2026-07-20 — Ambient implementation and live acceptance are separate parcels

**Decision:** The approved Ambient seam is split into a repository-only implementation parcel followed by a distinct live-acceptance parcel.

**Rationale:** Focused tests, the complete gate, exact staged files, feature commit/push, and durable repository closeout can prove implementation correctness without pretending to prove browser-held state. Genuine Ambient selection, browser save, visible persistence, server registration, active revision attribution, numeric `temp_c` receipt, and live negative refusal require the running application and human observation. Mixing those evidence classes in one parcel would either block a finished repository implementation or invite tests to substitute for required live truth.

**Consequence:** SEL-018 ends after the approved Ambient implementation is focused-tested, fully gated, committed, pushed, durably reconciled, gated again, and clean. It must not perform or claim browser save, registration, active revision, or Engine execution. SEL-019 begins only after runtime 8788 serves that accepted implementation. It preserves the sole `SYSTEM_POLICY` authority, exact `lighting.ambient_temp_c` field, finite numeric Celsius unit, registration requirement, and all fail-closed rules. Its order is mandatory: prove live source-backed options; make one genuine positive selection and save; register that exact envelope; prove the identical numeric value reaches `temp_c`; prove a separate Ambient-absent refusal before donor execution without displacing the positive revision; only then run one bounded read-only Engine proof. SEL-002 and SEL-003 are held as acceptance checkpoints and may be closed from SEL-019 evidence only, never by duplicate registration or invocation.

## 2026-07-20 — Ambient implementation receives one exact lane-write exception

**Decision:** The Selector lane write guard must add only `packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js` for SEL-018. No directory-wide `packages/modules/**` permission is approved.

**Rationale:** The approved Ambient implementation must change the factory-approved input summary from Ambient-optional to Ambient-required at registration readiness. The queue already authorises that exact module, but the connected secure app currently excludes its directory. The worker restored its trial edit and stopped cleanly, proving a tooling-scope mismatch rather than an implementation failure.

**Consequence:** SEL-018 remains blocked until the connected app reports the exact file as writable. All Ambient authority, field, Celsius, registration, fail-closed, parcel-split, and live-proof decisions remain unchanged. Once the narrow guard is active, the orchestrator may mark SEL-018 ready and commission a fresh standing worker.

## 2026-07-21 — Corrected thermal ownership supersedes the direct lookup Ambient seam

**Decision:** Program & Integrate has accepted the completed Lab version-2 thermal producer receipt and superseded the earlier direct `lighting.ambient_temp_c` to `temp_c` implementation plan. SEL-018 now passes only the selected room temperature as `selectedRoomTaC` and calculates nothing.

**Rationale:** Lab evidence distinguishes the absolute reference room temperature, absolute reference internal temperature and measured optic rise. Only Engine may combine the selected room with the optic rise. Passing room Ambient directly as lookup temperature would omit the optic effect; allowing Selector to derive the lookup would duplicate Engine ownership.

**Consequence:** SEL-018 is reduced to exactly the candidate mapper and its focused test. It must accept one committed source-backed Ambient value, emit only `selectedRoomTaC`, preserve the existing non-thermal candidate, and reject missing, malformed, duplicate, uncommitted or non-source-backed Ambient. It must emit no rise, reference-internal, derived, lookup, board-temperature or verified-output field.

## 2026-07-21 — Program validation and Engine execution remain separate parcels

**Decision:** The corrected thermal chain is implemented in three ordered parcels: SEL-018 room-only handoff, THERM-P1 Program evidence validation, then THERM-E1 Engine thermal lumen execution.

**Rationale:** Cross-lane identity and evidence acceptance is a Program responsibility, while temperature addition, curve clamp/interpolation and verified lm/m are Engine responsibilities. Keeping those parcels separate prevents unresolved Lab evidence from becoming Engine authority and prevents the Selector from performing thermal math.

**Consequence:** THERM-P1 may bind the accepted Selector candidate, Program-validated source-backed optic identity and exact Lab v2 projection into an immutable accepted Program bundle, but performs no addition or lookup. THERM-E1 consumes only that accepted bundle, applies `opticThermalRiseTaC` exactly once, and delegates to the existing curve parser. Direct Lab input and caller-supplied derived or lookup temperatures fail closed.

## 2026-07-21 — Varied-optic movement is mandatory acceptance evidence

**Decision:** THERM-E1 acceptance must vary one optic-bound measured rise while keeping selected room, drive current and curve data fixed, and prove that both lookup temperature and verified lm/m change.

**Rationale:** Current database thermal values are placeholders and identical across rows. Baseline examples alone cannot distinguish a genuine per-optic evidence lookup from a hardcoded constant.

**Consequence:** A green implementation must fail if it hardcodes 35°C, hardcodes a 10°C rise, reads the absolute reference-internal value as the rise, or applies the rise twice. The existing curve parser remains unchanged.

## 2026-07-21 — SEL-018 focused mapper suite uses the established temporary harness

**Decision:** Because the fixed `selector-engine` gate omits `tests/selectorReadonlyEngineCandidateMapper.test.js`, SEL-018 may temporarily add exactly one side-effect import of that suite to the already gate-included `tests/engineRunTableDomain.test.js`.

**Rationale:** The approved lane exposes no arbitrary or focused test command. The same temporary-import method was previously accepted for omitted registration coverage and provides executable evidence without widening the committed parcel.

**Consequence:** The harness import must visibly execute the mapper suite, then be removed. The harness file must be byte-identical to HEAD, absent from the final diff, unstaged and uncommitted. The feature commit remains exactly the mapper and focused mapper test, followed by the normal baseline gate and five-file durable closeout.

## 2026-07-21 — SEL-018 accepted; THERM-P1 becomes ready

**Decision:** Accept the pushed selected-room handoff and advance the Program thermal-evidence adapter as the sole ready parcel.

**Rationale:** Focused mapper coverage executed at 125/125 through the temporary harness, the normal and commit gates passed 107/107, the harness was removed, and the final feature commit contains exactly the mapper and its test. The candidate carries only `selectedRoomTaC` and all invalid Ambient forms fail closed.

**Consequence:** THERM-P1 may now implement its exact new adapter and focused test. THERM-E1 remains blocked. Because both new thermal test files are omitted from the fixed gate, each may use the same one-import temporary harness discipline without changing its final exact two-file scope.

## 2026-07-21 — THERM-P1 accepted; runtime-prefixed test path is the guarded equivalent

**Decision:** Accept the Program thermal-evidence adapter and advance THERM-E1. Record `tests/runtimeLabThermalEvidenceProgramAdapter.test.js` as the exact guarded test path replacing the refused broad-Lab-prefixed filename.

**Rationale:** The secure lane permits runtime tests but correctly refuses broad Lab test paths. The filename change is test-only and non-semantic; the adapter contract, assertions and two-file scope are unchanged. Focused coverage passed 119/119, the harness was removed, and normal/commit gates passed 107/107.

**Consequence:** No write permission is broadened. THERM-E1 is the sole ready parcel and continues to use its already-approved runtime-prefixed test path.

## 2026-07-21 — Selections-only boundary reconciles the active Selector queue

**Decision:** Accept the Program outside-governance / inside-Engine ruling and its envelope-independence regression as controlling. SEL-018 and THERM-P1 remain accepted. THERM-E1 remains the sole ready implementation parcel. SEL-019 is superseded as an Engine prerequisite, and SEL-002/SEL-003 remain historical governance records only.

**Rationale:** The earlier registration, active-revision and selected-project sequence belongs to the outside governance layer. It may persist results and provide traceability, but it cannot make the computational kitchen eligible. The existing selected-project registration modules remain available for governance use; THERM-E1 bypasses them entirely and imports only the accepted Program bundle contract and the existing curve parser.

**Regression rule:** Execute THERM-E1 twice with identical engineering selections and different user, project, owner, timeline and registration traceability envelopes. After excluding only declared nondeterministic request identifiers, eligibility and deterministic engineering output must be identical. The test must fail if envelope data affects a warning, default, candidate, score, validation state or output.

**Rename guard:** The closeout must name the former gates—project registration, active revision and selected-project eligibility—and prove they are absent from the THERM-E1 dependency path. Replacing them with differently named equivalents is prohibited; behavioral envelope independence is the class-level proof.

## 2026-07-21 — THERM-E1 accepted in the lane

**Decision:** Accept the pushed Engine thermal execution parcel and return it to Program for final cross-lane acceptance.

**Rationale:** Focused coverage passed 120/120. Engine applies the optic rise exactly once, changed optic evidence changes both lookup temperature and verified lm/m, and low/high curve behavior remains delegated to the unchanged parser. Invalid, direct-Lab, contradictory and caller-derived inputs fail closed.

**Boundary evidence:** Two calls with identical engineering inputs and different user, project, owner, timeline, registration, active-revision and renamed eligibility fields returned identical complete results. The module dependency map contains only the Program evidence adapter and curve parser, and negative searches found no registration, active-revision, project-browser or selected-project eligibility reference.

**Consequence:** The governance gates are bypassed at the computational boundary, not renamed. THERM-E1 is done. No live registration parcel is required for Engine acceptance; optional persistence remains outside governance. The lane now awaits Program acceptance only.

## 2026-07-21 — SEL-007 admitted as a contract-candidate parcel

**Decision:** Record final Program acceptance of the thermal chain, close THERM-A1, and admit SEL-007 as the sole ready item in an exact documentation-and-regression scope.

**Rationale:** The prior SEL-007 dependency on a selected-project invocation is superseded by the selections-only boundary and the accepted THERM-E1 envelope-independence proof. A contract candidate can now be written without registration, project identity or persistence becoming Engine prerequisites.

**Existing-contract classification:** `runtimeThermalLumenExecution` is an accepted versioned computational result for the thermal slice. `engineRunTableRuntimeRunTableDomainOutputScaffold` is versioned but explicitly diagnostic-only and blocks production RunTable generation. `runTableFirstNarrowRows` and its row-shape path require a persisted selected-result summary, so they are outside-consumer compatibility machinery and cannot define kernel eligibility under the selections-only ruling.

**Scope:** Create only `docs/engine/ENGINE_OUTPUT_CONTRACT_CANDIDATE_V1.md` and `tests/engineOutputContractCandidate.test.js`; use the established temporary gate harness and remove it before final staging. The candidate must define selected engineering inputs, deterministic complete/blocked semantics, technical identity/provenance, non-persistent run-table rows, replay/readback and compatibility rules while recording all evidence still missing before stability.

**Consequence:** Downstream artifacts remain held. SEL-008 and SEL-009 remain blocked pending Program review of the candidate, and SEL-010 remains held pending a separate stability declaration.

## 2026-07-21 — SEL-007 candidate accepted in the lane

**Decision:** Accept the pushed Engine output contract candidate and return it to Program & Integrate for review without declaring stability.

**Rationale:** The focused static regression executed through the temporary harness and the full gate passed 114/114. The candidate pins the accepted thermal result schema, proves the current RunTable domain scaffold is diagnostic-only, detects the incompatible field sets sharing `controlstack.runtime.runtable-first-narrow-row.v1`, and proves the first-narrow path is persistence-coupled.

**Candidate result:** The proposed selections-only request, output and RunTable row schemas are documented with complete/blocked semantics, technical provenance, deterministic replay/readback, compatibility and rollback rules. Nine explicit stability conditions remain unsatisfied, including implementation of the non-persistent envelope and unambiguous row producer, complete producer tests, Lab consumer evidence, full-output sealed/live proof and rollback/readback evidence.

**Consequence:** SEL-007 is done. The Engine output contract remains `candidate_not_stable`. No widening, Lab consumer change or downstream artifact is eligible until Program reviews the candidate and commissions a new exact parcel.

## 2026-07-21 — Program admits ENG-STAB-P1 selected-result producer contract

**Decision:** Record Program review of the candidate and admit ENG-STAB-P1 as the sole ready item in an exact two-file feature scope.

**Rationale:** Program correctly withheld stability because the complete non-persistent output envelope, unambiguous row producer, consumer compatibility, full-output fixture and rollback evidence are not yet accepted. The first bounded repair is a new producer contract over already accepted safe source and thermal results; it does not rewrite the persistence-coupled legacy row path.

**Contract:** The new module emits only `controlstack.engine.selected-result.v1` accepted or blocked envelopes. It validates exact accepted upstream schemas, source revision/identity agreement and safe run summaries, preserves thermal outputs without recalculation, creates deterministic non-persistent row summaries and quarantines optional traceability.

**Consequence:** ENG-STAB-P1 is the sole ready parcel. No route, persistence, Lab consumer, IES handoff, downstream activation, existing scaffold rewrite, donor, RuntimeData or main change is authorised. Stability remains withheld after this producer parcel pending separate consumer and final acceptance work.

## 2026-07-21 — Program accepts SEL-007 three-schema candidate

**Decision:** Supersede ENG-STAB-P1 as the public contract and admit ENG-OUT-P1 as the sole ready parcel. A concurrent worker completed ENG-STAB-P1 after this ruling; Program later accepted that bounded receipt as an internal non-stable component.

**Rationale:** The newer Program review accepts the candidate's separate selections-only request, complete-or-blocked output and unambiguous RunTable-row schemas. This is more complete than the provisional single selected-result envelope and preserves the candidate's recorded legacy row-schema collision and persistence exclusion.

**Consequence:** ENG-OUT-P1 may create only the new runtime contract module and focused runtime test. Consumer compatibility, stability declaration, downstream activation and main promotion remain held.

## 2026-07-21 — ENG-OUT-P1 public contract accepted in the lane

**Decision:** Accept the pushed version-1 request, output and RunTable-row producer contracts and return them to Program for consumer review without declaring stability.

**Evidence:** The exact public module and focused regression were pushed, then one corrective two-file parcel resolved the concurrent post-commit race. Final focused coverage passed 116/116. The temporary harness was removed and the normal gate file returned unchanged.

**Contract result:** `controlstack.engine.selection-set.v1` validates one exact selections-only draft and rejects governance fields, caller Tier and caller-derived/verified output. `controlstack.engine.output.v1` produces deterministic complete or fail-closed blocked results, preserves valid zero values, ignores optional traceability and derives result identity only from technical request, source, policy and internally derived evidence fingerprints. `controlstack.engine.runtable-row.v1` has one exact field set and does not reuse the colliding legacy row schema.

**Consequence:** ENG-OUT-P1 is done. The producer boundary remains non-persistent and contract-only. Program must review consumer compatibility before any Lab/IES adapter or stability declaration. SEL-008, SEL-009, SEL-010, routes, persistence, downstream activation and main remain held.

## 2026-07-21 — Program commissions SEAM-G-P1 read-only IES request producer

**Decision:** Record Program's stable Seam B declaration and admit SEAM-G-P1 as the sole ready Selector parcel in an exact two-file scope. Seam G itself remains inactive.

**Rationale:** The original output-actions decision retired direct Selector-side IES generation and kept Photometry/Lab as the downstream owner. The first downstream step must therefore be a deterministic request contract, not a button, route, export, email, file write or generator.

**Contract:** `controlstack.downstream.ies-artifact-request.v1` consumes exact stable public Engine output JSON and exact `ies_lm63_reference_build` intent. Optional traceability is quarantined. The output is complete or fail-closed blocked, deeply immutable, replay-identical and non-persistent, with deterministic request/replay/audit identity and safe technical content only.

**Acceptance lock:** Different governance envelopes cannot alter or appear in output. Changed technical identity must move request identity. Blocked Engine output cannot become artifact-ready. Unknown, over-rich, unsafe/private, contradictory, added-authority or legacy-row input fails closed. No raw IES/photometry/candela/file/path, route, persistence, email, download, generation, authority, reference mutation, Engine/donor invocation or downstream activation is permitted.

**Consequence:** SEAM-G-P1 is the sole ready item. SEAM-G-C1 and Program tunnel activation remain blocked. Existing IES handoff scaffolds are not rewritten, and generic downstream artifact work remains held.

## 2026-07-21 — SEAM-G-P1 accepted in the Selector lane

**Decision:** Accept the pushed read-only IES artifact request producer and return its receipt to Program without activating Seam G.

**Evidence:** The exact two-file feature parcel passed 115/115. The temporary gate harness was removed and its host test returned byte-identical to HEAD. The lane tree returned clean.

**Contract result:** `controlstack.downstream.ies-artifact-request.v1` accepts exact stable public Engine output plus exact `ies_lm63_reference_build` intent and emits deterministic complete-or-blocked request, replay and audit identities. Complete, blocked and valid-zero fixtures passed. Different user, project, owner, timeline, registration and renamed eligibility envelope values produced identical output and remained absent. Technical policy or evidence identity changes moved the request identity.

**Failure and security result:** Unknown versions, extra fields, nested governance, private paths, raw artifact content, legacy rows, row identity tamper, added caller evidence, thermal contradiction, unsafe producer flags, blocked-to-ready promotion and over-rich intent all fail closed. Blocked Engine output has no selected result, rows, request ID, replay key or artifact-ready state.

**Consequence:** SEAM-G-P1 is done. No Selector button, existing IES-handoff scaffold, route, persistence, email/export/download, file, raw photometry/candela, generator, authority, reference mutation, Engine/donor invocation, RuntimeData, Lab, main or runtime-port file changed. SEAM-G-C1 remains blocked pending Program producer acceptance; actual generation remains held.

## 2026-07-21 — Program commissions SEAM-G-P2 generation input producer

**Decision:** Admit SEAM-G-P2 as the sole ready Selector parcel in an exact two-file scope. The stable artifact-request version 1 contract remains unchanged.

**Rationale:** The active artifact request intentionally carries technical identity but not the exact selection-set body required to derive one run length and bounded generation selections. The next safe step is a deterministic input contract, not a reference resolver or generator.

**Contract:** `controlstack.downstream.ies-generation-input.v1` consumes one exact ready artifact request and the exact matching public Engine selection request. It recomputes the selection fingerprint, supports exactly one run, preserves safe request/result/source/policy/evidence and thermal identity, and quarantines optional traceability.

**Acceptance lock:** Exact product, lighting, runs and control shapes only; positive integer quantity/length; valid zero target and ambient values; deterministic replay and audit; technical changes move identity; unknown, blocked, extra, multi-run, governance, private/raw, unsafe, fingerprint-mismatched or contradictory input fails closed.

**Consequence:** SEAM-G-P2 is the sole ready item. No Lab import, reference identity, sealed DTO, authority, generator invocation, LM-63 text, route, persistence, write, RuntimeData, main or runtime-port change is authorised. SEAM-G-C2 remains blocked.

## 2026-07-21 — SEAM-G-P2 accepted in the Selector lane

**Decision:** Accept the pushed generation-input producer and return its receipt to Program without binding a reference or invoking the LM-63 generator.

**Evidence:** The feature and tightening checkpoints passed 115/115. The temporary gate harness was removed and the tree returned clean before closeout.

**Contract result:** `controlstack.downstream.ies-generation-input.v1` recomputes and matches the Engine selection fingerprint, validates deterministic artifact request identity/audit, supports exactly one bounded run and preserves safe technical provenance/thermal values. Ready, zero, replay/governance, identity movement, blocked request and fail-closed cases passed.

**Tightening result:** The producer validates exported Engine state, selected profile agreement, exact row kind/state and row identities, deterministic artifact request/replay/audit identity, non-negative thermal rise, safe curve filename and accepted effective-temperature modes.

**Consequence:** SEAM-G-P2 is done. No stable request-contract edit, Lab import, reference binding, sealed DTO load, authority, generator invocation, LM-63 text, route, persistence, write, RuntimeData, main or runtime-port change occurred. Program producer review is next; SEAM-G-C2 remains blocked.

## 2026-07-21 — Prepare Program work-shape items but hold execution

**Decision:** Record three bounded Selector queue items for Program work-shape items 1, 2 and 5, in that exact order, while leaving every item blocked until Program & Integrate records admission.

**Readiness naming:** Spec Ready and Build Ready remain truthful states, but Gate 1, Gate 2 and any CRM/HubSpot readiness construct named as a gate are retired from the proposed live language. The first parcel creates a deterministic push-on-state-entry intent/event by default. It must not enable external CRM/HubSpot mutation unless Program separately records the exact server-owned writer, target state, idempotency identity, retry policy and rollback behaviour.

**Factory state:** `factoryReady` will be derived only from existing Spec Ready, Build Ready and Factory Approved Inputs evidence. It cannot create new factory authority, infer missing values, auto-approve, or replace `factoryApprovedInputsReady` diagnostics.

**Lifecycle copy:** The final parcel corrects copy and contract diagnostics only. Save, restore and hydrate are already shell-owned and live through Project Browser; module-local mutation remains prohibited. Handoff/share and CRM/provider writes stay separately classified and cannot become live by implication.

**Consequence:** No worker is commissioned. After Program admission, only the first queue item may be made ready; the second and third remain blocked until their predecessor and durable closeout complete. No feature, test, browser, CRM/provider, Engine, Lab/IES, route, persistence, RuntimeData, main or runtime-process action occurred in this decision parcel.

## 2026-07-21 — Program admits PWS items and binds the retrieval gateway

**Decision:** Accept Program's Governance & Shell lane ruling and make PWS-001 the sole ready Selector item. PWS-002 and PWS-005 remain admitted in strict order behind their predecessor closeouts.

**Ownership:** Selector owns readiness derivation and immutable state-entry intent only. Governance & Shell owns human/project identity, persistence, retrieval policy, CRM/provider association, idempotency, retry and external mutation. PWS-001 must not call HubSpot or any CRM provider.

**Retrieval constraint:** No Selector, Engine or Seam G module may add a module-owned download, export, file-delivery, artifact-retrieval route or browser helper. Internal technical contracts may continue, but outward retrieval terminates through the single Governance & Shell gateway. Readiness and identity are separate and neither can become an Engine prerequisite.

**Standing tests:** The lane retains envelope-independence with different envelopes and no envelope, changed-optic thermal movement, varied-row proof for identical placeholder lookup values, and ownership-wide assertions across every governed system/row.

**Consequence:** PWS-001 may start in its exact approved scope. PWS-002 and PWS-005 remain blocked. Lab SEAM-G-C4 may proceed in parallel in its separate worktree. No second Selector writer, direct provider mutation, direct delivery seam, main or runtime-port work is authorised.

## 2026-07-21 — Preserve authorised PWS-001 drafts after guarded stop

**Decision:** Accept exactly two untracked files as preserved, authorised PWS-001 worker work: the readiness state-entry intent contract and its focused regression. No other dirty path is admitted.

**Rationale:** Both files are explicitly inside the first parcel's authorised scope. The draft contract is immutable and provider-inert, and its test covers the approved transition, duplicate-suppression, envelope-independence and event-bus boundaries. The worker correctly stopped because durable memory had not yet named them.

**Consequence:** The orchestrator does not alter or stage either draft. Lane memory now permits the standing worker to resume from those exact dirty paths and finish PWS-001. PWS-002 and PWS-005 remain blocked; no provider, persistence, browser, Engine, Lab/IES, route, RuntimeData, main or runtime-port action is authorised.

## 2026-07-21 — PWS-001 accepted; readiness transitions are intents, not gates

**Decision:** Accept PWS-001 and advance PWS-002 as the sole ready parcel. Spec Ready and Build Ready remain truthful state booleans. Named business/readiness gates are retired from live Selector presentation, and false-to-true state entry emits only an immutable technical intent through the shell event bus.

**Transition rule:** Initial render establishes the baseline. Re-render, repeated evaluation, repeated true state and save/restore hydration do not create a duplicate. A genuine leave and re-entry may create one new deterministic identity. Build Ready is clamped behind Spec Ready.

**Safety and ownership:** Selector owns only the readiness state and technical transition intent. URL/path-bearing context is quarantined, traceability envelopes are ignored, and no CRM/provider writer, identity lookup, persistence, retry, network, storage or filesystem operation is introduced. Governance & Shell remains the sole owner of any later external association or mutation.

**Evidence:** The temporary focused harness passed 114/114 and was removed. The normal and guarded feature gates passed 107/107. The authorised feature/assertion set was committed and pushed, and the tree ended clean.

**Consequence:** PWS-001 is done. PWS-002 may derive `factoryReady` only from existing Spec Ready, Build Ready and Factory Approved Inputs evidence. PWS-005 remains blocked. No readiness predicate, source authority, Engine eligibility, retrieval ownership or downstream seam changed.

## 2026-07-21 — PWS-002 accepted; Factory Ready is derived, not authority

**Decision:** Accept PWS-002 and advance PWS-005 as the sole ready parcel. `factoryReady` is a distinct Stage 3 state derived only after Spec Ready, Build Ready and the unchanged Factory Approved Inputs evidence are all truthful and complete.

**Fail-closed rule:** Missing, malformed, duplicate, uncommitted, blocked, non-source-backed, contradictory or incompatible evidence keeps Factory Ready false. Display or diagnostic wording cannot create readiness. The existing Factory Approved Inputs summary, candidate mapper, locked pre-Engine projection, Engine/Lex ownership and no-write flags remain unchanged.

**Evidence:** The temporary focused harness passed 128/128 and was removed. The normal and guarded feature gates passed 107/107. The exact four Selector surfaces and focused runtime regression were committed and pushed, and the feature tree ended clean.

**Consequence:** PWS-002 is done. PWS-005 may correct stale lifecycle copy only. No provider push, factory approval, output generation, route, persistence, Engine, Lab/IES, RuntimeData, retrieval or runtime-process work is authorised.

## 2026-07-21 — PWS-005 accepted; shell lifecycle copy matches live ownership

**Decision:** Accept PWS-005. Save, restore and hydrate are classified as shell-owned and live through Project Browser across Selector, Emergence, Scene Builder and the workspace contract. Module-local project mutation remains prohibited.

**Separate deferred work:** Handoff/share and CRM/provider writes remain separately shell-owned and deferred. The correction does not promote either capability, add persistence or alter project storage.

**Evidence:** The temporary focused harness passed 112/112 and was removed. The normal and guarded feature gates passed 107/107. Static and behavior assertions prove Project Browser still owns save/restore, the shell dispatches hydrate, the modules add no implementation and the stale save/restore-deferred phrases are absent.

**Consequence:** PWS-005 is done. All three admitted PWS parcels are closed.

## 2026-07-22 — Consolidated Selector walkthrough batch admitted

**Decision:** Accept Patrick's nine live walkthrough findings as one ordered Selector batch. Do not recommission PWS-001, PWS-002 or PWS-005 because all three are already complete, gated and pushed.

**Immediate authority action:** WALK-001 is the sole ready parcel. Run the repaired materialiser dry-run, require a redacted current-source proof of the tier-gated `SYSTEM_POLICY.ambient_temp` row and all required tables, then use the existing live materialise/archive/promote path. Failed validation, missing Ambient, unsafe disclosure or archive/promotion blocker stops before write.

**Deletion order:** after refresh, diagnose and delete Length Mode as Selector authority; unmount the fabricated duplicate scaffold; delete the legacy `TIERS`-expecting readiness path; then delete Selector's internal timeline and special-parts principal test modes. These are deletions under the one-owner rule, not reassignments or defaults.

**Seam ruling:** Governance owns human identity, principal/role, timeline policy and visibility. Selector consumes bounded shell outcomes only. The current internal test-mode behaviour is regression specification, not continuing ownership.

**Auto-fill addendum:** after the deletion and ownership parcels, WALK-005A restores donor auto-fill defaults. Every dropdown preserves exact NVB comma-separated order and selects the first real option; presentation-only `No manual constraint…` rows are skipped. Auto-filled values are visibly LOOKED UP and distinct from manual constraints. One `Accept all defaults` action creates the GIVEN acknowledgement for all flagged defaults, including inherited finishes. Unacknowledged defaults do not satisfy readiness; per-field acknowledgement and code-ranked defaults are prohibited.

**Truthfulness:** readiness totals count only visible actionable prerequisites and genuine pending acknowledgements. Donor-parity/future/consequence/disabled rows and special-parts diagnostic placeholders cannot increase user-facing missing or blocked totals, and unacknowledged defaults cannot masquerade as missing source data.

**Run boundary:** no live run before the deletion, auto-fill and counter parcels close. The final batch parcel reconciles Run Engine to the selections-only boundary: server revision acknowledgement and governance/project envelopes are not Engine authority. Preserve source-backed selections and no-write transport safety, then run one bounded thermal acceptance proving selected room plus measured optic rise exactly once and varied-rise movement.

**Finishes ruling:** Patrick ruled that inherited and auto-filled cover/end/flex finishes do not satisfy Build Ready until one explicit `Accept all defaults` action acknowledges every flagged default. Governance records the decision as RULED; WALK-005A implements it.

**Consequence:** WALK-001 ready; WALK-002 through WALK-007 blocked in strict order with WALK-005A inserted before WALK-006; WALK-008 ruled and closed. No second writer, CRM/provider mutation, persistence, IES generation, delivery, module-owned retrieval, main or unrelated runtime work is authorised.


## 2026-07-22 — Bind WALK-001 to review stop and Program admission

**Decision:** Reconcile the lane to the actual documentation HEAD and accept the authoritative Program walkthrough handoff as the current commission. WALK-001 alone is ready. PWS-001, PWS-002 and PWS-005 remain closed and cannot be reopened.

**Guard:** every existing dry-run source-shape, validation, identity and disclosure check and one finite, genuinely tier-gated `SYSTEM_POLICY.ambient_temp` row must pass before write. The guarded live order is materialise, archive current authority, promote new authority. Archive failure blocks promotion; promotion failure or uncertainty stops without success.

**Review boundary:** the worker returns the complete dry-run, Ambient, archive, promotion, test, gate, exact staged-set, commit/push and final-Git receipt, then stops. The orchestrator closes WALK-001 in lane memory and stops for Program admission before WALK-002 is released. No later walkthrough work or live Engine run is implied.


## 2026-07-22 — Accept WALK-001 protected stop; do not close or advance

**Decision:** Accept the standing worker's validation-failure stop as correct guarded behaviour. Do not close WALK-001 and do not release WALK-002.

**Evidence:** lane identity, memory and Git checks passed; Google configuration and credential readability passed with safe redaction; the old active authority remained readable and unchanged. The dry-run could not load the declared Google Sheets reader dependency, returned no current-source shape and could not prove the finite tier-gated Ambient row.

**Consequence:** no materialisation, archive or promotion was attempted. No feature, test, gate, stage, commit, Engine, project, provider, persistence, IES or later walkthrough action occurred. WALK-001 is blocked pending Program admission of a bounded dependency repair or proven retry path.


## 2026-07-22 — Admit WALK-001R bounded recovery

**Decision:** Accept Program's recovery admission and make WALK-001R the sole ready Selector parcel. WALK-001 remains incomplete behind its protected reader-load stop, and no later walkthrough parcel is released.

**Repair boundary:** reproduce only the redacted failure and inspect only the running Selector service's existing dependency, module-resolution, working-directory and configuration boundary. Repair only through Selector-owned files or existing managed-service controls. Credentials, protected secrets, broad environment work, arbitrary shell workarounds, another worktree and cross-lane writes are prohibited.

**Execution:** if the repair stays within that boundary, restart only selector-runtime through the existing manager and execute the complete original WALK-001 guarded dry-run and archive-before-promotion workflow. If Program-owned deployment/service-host or secret work is required, stop with a redacted diagnosis for a separate Program parcel.

**Review boundary:** successful recovery closes WALK-001R and WALK-001, then stops for Program review. WALK-002 is not automatically released.


## 2026-07-22 — Return WALK-001R to Program for service-host recovery

**Decision:** Accept the standing worker's protected cross-lane stop. The declared dependency is present in repository authority but unavailable to the running Selector service because its runtime root has no installed dependency tree, and this lane exposes no approved installation or service-manager restart control.

**Consequence:** WALK-001R and WALK-001 remain incomplete. Program must commission a separate deployment/service-host parcel. No credential or secret change is authorised, and no later Selector parcel is released.

## 2026-07-22 — Accept WALK-001I completion and resume guarded WALK-001R

**Decision:** Accept Patrick's report that Program's bounded locked-dependency installation completed in the serving Selector worktree and that only the Selector runtime was restarted through the existing manager, returning Healthy and Managed. Independently verify the connected runtime is live and ready and Git is clean. Reopen WALK-001R as the sole ready Selector parcel.

**Guard:** the complete original dry-run, including every source-shape, validation, identity and disclosure check and a finite, genuinely tier-gated `SYSTEM_POLICY.ambient_temp` row, remains mandatory before any write. Materialisation may occur only after that full pass; archive of the current promoted authority must succeed before promotion of the new authority.

**Boundary:** stop after the source refresh for Program review. Do not release WALK-002, begin later Selector work or invoke Engine.


## 2026-07-22 — Accept WALK-001R guarded source-identity stop

**Decision:** Accept the standing worker's fail-closed source-validation stop. The reader dependency now loads and the dry-run reaches the current Google source, but the required primary Driver identity supplies only Boolean-like markers while the duplicate field supplies protocol values. The populated Board protocol authority therefore has no intersection with required primary Driver protocol authority. A finite, genuinely tier-gated `SYSTEM_POLICY.ambient_temp` row is also unproven.

**Consequence:** no materialisation, archive or promotion was authorised or attempted. The active authority remains unchanged. WALK-001R and WALK-001 stay incomplete, WALK-002 and later work stay blocked, and Program must decide the exact source-authority repair or retry path.


## 2026-07-22 — Admit WALK-001V bounded Ambient validation visibility

**Decision:** Accept Program's latest handoff without reopening or recommissioning the already accepted guarded source-stop receipt. WALK-001V alone is ready; WALK-001 and WALK-001R remain incomplete and WALK-002 through WALK-007 remain blocked.

**Scope:** only the materialiser service, its gate-included Selector reference-options test, and canonical Selector lane-memory closeout. Extend only the successful Google-read `currentSourceShape` before every write with allowlisted, value-free SYSTEM_POLICY/Ambient counts.

**Proof:** the summary must distinguish tier-specific finite evidence from generic-only and non-numeric non-proof, keep duplicate exact Ambient rows visible through safe counts, preserve redaction and prove dry-run no-write behaviour. No values, raw rows, unrestricted headers, users, credentials, Sheet identity, provider content, complete source JSON or private locations may be returned.

**Unchanged boundary:** Driver authority and validation outcomes, Google reading and data, Selector options, materialisation, archive, promotion, deployment and Engine remain unchanged.

**Consequence:** gate and push WALK-001V, reconcile lane memory, then stop for Program activation and exact source-owner repair review. Do not edit the Google Sheet or begin WALK-002.


## 2026-07-22 — Ambient visibility is count-only evidence, not source authority

**Decision:** The successful-reader `currentSourceShape` may expose only allowlisted SYSTEM_POLICY/Ambient counts. Approved exact `ambient_temp` rows with at least one finite recognised economy/business/first/charter value are distinguishable from generic-only, non-numeric and unapproved non-proof.

**Rationale:** The guarded source stop proved SYSTEM_POLICY presence but could not safely determine whether current Ambient data was finite and genuinely tier-specific without returning source values or rows.

**Consequence:** Duplicate exact rows, recognised tier-column population, finite/non-finite tokens, multi-tier finite rows and generic-only rows remain visible through counts only. This summary does not change Driver authority, source validation, Google reading/data, Selector options or any materialisation/promotion decision; Program must activate it and use the safe counts to decide the exact source repair.

## 2026-07-22 — Ingest SEED-LIB-001 without duplicating WALK-001V

**Decision:** Record the two Patrick-nominated saved Selector test cases as the canonical production-chain seed library. Their exact saved selections are the sole future run-intake authority. Build 1 retains its stored 9560 mm × 1 intake; Build 2 quantity and length are read only from its saved case.

**Sequence:** SEED-LIB-001 remains blocked until Program accepts WALK-001 through WALK-007 in order. No seed execution, Engine invocation, saved-case mutation, intake reconstruction or evidence substitution is authorised.

**Reconciliation:** Program's handoff described WALK-001V as ready, but the live lane contains the newer complete, gated, pushed and clean closeout. Preserve that result and do not commission a duplicate worker. WALK-001V waits at Program activation/source-repair review; no Selector parcel is ready.

**Consequence:** one writer and all current exclusions remain intact. Hand-made sealed references, hand-made inspection results, synthetic production artifacts and substituted evidence cannot satisfy future canonical acceptance.
