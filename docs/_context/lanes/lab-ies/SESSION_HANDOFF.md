# Lab/IES Session Handoff

## Session purpose

This handoff records completion of LAB-042 and the corrected thermal semantics batch, preserves the permanent charter authority for both standing prompts, and closes the ordered Lab / IES queue.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Standing prompt authority: `docs/_context/lanes/lab-ies/LANE_CHARTER.md` contains both worker and orchestrator prompts
- Starting HEAD for LAB-042: `a91ec745180abe6e9c666212e2dd644df35311bd`
- Completed feature checkpoint: `46792ddfe23cd4999aa244f9eb745a94028af3d6`
- Feature subject: `lab: checkpoint thermal semantics guard`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`
- Seam change: no after approved thermal envelope version 3
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`
- LAB-042 feature gate: 262/262 passed
- Program correction consumed: `docs(program): correct thermal source field semantics`; Program gate 46/46 passed and the correction was pushed
- Approved Lab seam: `LAB-038_042_THERMAL_SEMANTICS_SEAM_ENVELOPE.md`, version 3
- Program approvals: initial corrected seam, atomic LAB-038 transition, and `docs(program): amend LAB-042 gate-included test scope`; all Program gates passed 46/46 and were pushed
- Parcel state: LAB-038 through LAB-042 are done; the ordered queue is empty

## Branch-HEAD guard

Before the first parcel and before every later parcel in the same worker run, the worker compares `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops parcel execution, produces the exact stale-state reply, and permits only memory reconciliation plus the full gate. The worker must not execute any queue item after discovering the mismatch in that run.

After every documentation push, only the `Recorded branch HEAD` field is refreshed in the working tree to the new actual HEAD and left unstaged. This deliberate marker avoids the impossible requirement for a commit to contain its own final hash and provides the next parcel boundary check inside the same batch.

## Corrected thermal seam coordination

Program & Integrate corrected and superseded the old thermal interpretation. The source value 35 is the absolute internal reference temperature, the source value 10 is the measured rise, and Engine alone applies that rise once after Program validates the selected optic and evidence.

The corrected resolution, component catalogue and Lab working projection are now committed as version-2 contracts. They preserve the measured reference room, absolute reference internal and optic thermal rise meanings, enforce exact triplet consistency, and keep legacy snake-case names confined to bounded source mapping. The Lab projection carries opaque evidence with authority explicitly null and no Engine-owned result.

The corrected component-library labels and the final gate-included thermal semantics guard are complete.

LAB-038 through LAB-042 are complete. The final guard used the existing gate-included keyword migration test, the superseded new thermal test file was not created, and the ordered queue is empty.

## Completed queue item

`LAB-042-thermal-semantics-guard` is complete.

Exactly this one gate-included test file was committed:

```text
tests/lab-kernel/iesKeywordMigration.test.js
```

The final guard executes the corrected resolver, component catalogue and Lab working projection contracts directly. It pins all three version-2 schemas, proves the measured 25 + 10 = 35 baseline and the varied 15-degree rise case, rejects contradictory rise-only evidence, bounds legacy source names to mapping/test input, rejects deprecated and Engine-owned output vocabulary, confirms corrected presentation labels, and preserves unresolved thermal authority plus the sealed internal-ambient meaning.

No production source, fixture, gate configuration or superseded new thermal test file changed.

## Validation evidence

- Full LAB-042 feature execution before checkpoint: 262/262 passed.
- Gated LAB-042 feature checkpoint execution: 262/262 passed.
- Failed, cancelled, skipped and todo counts were zero.

## Git and protected worktree state

The LAB-042 parcel was staged as exactly the one authorised gate-included test file, committed and pushed separately from lane documentation.

The protected working-tree state after documentation closeout must remain:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in `LANE_STATE.md`;
- untracked: 3;
- deleted: 0.

The 3 protected untracked paths remain exactly those recorded in `LANE_STATE.md`. These explicitly non-queued paths remain untouched:

```text
README.zip
docs/_context/ControlStack_summary_normalise_harness_spec.md
scripts/clear_chaff.ps1
```

No protected implementation, prototype or support path was cleaned, reset, restored, deleted, moved, staged or absorbed. `scripts/clear_chaff.ps1` was not executed. The donor root was not written.

The Selector-owned paths remained absent from the dirty inventory and were not touched:

```text
packages/workspace-kernel/selectorReferenceOptionsService.js
tests/selectorCascadeCorrectness.test.js
```

## Completed LAB-042 final thermal semantics guard

The live branch contains the exact authorised gate-included one-file test checkpoint. It executes the corrected thermal contracts, pins their versioned shapes and rejects any regression to deprecated semantics or Lab-owned Engine calculations.

The feature passed the full 262/262 Lab gate and is confirmed on origin. The corrected thermal batch is complete and the ordered queue is empty.

## Queue state and next action

- `LAB-016-nvb-offline-fixtures`: `done`.
- `LAB-017-reference-resolver-contract`: `done` and finally accepted by Program & Integrate.
- `LAB-018-nvb-resolution-contract`: `done` and confirmed on origin.
- `LAB-019-component-projection-contract`: `done` and confirmed on origin.
- `LAB-020-document-register-contract`: `done` and confirmed on origin.
- `LAB-021-emergency-selection-contract`: `done` and confirmed on origin.
- `LAB-022-reference-composition-kernel`: `done` and confirmed on origin.
- `LAB-023-nvb-lab-adapter`: `done` and confirmed on origin.
- `LAB-024-resolver-fixture-corpus`: `done` and confirmed on origin.
- `LAB-025-component-library-surface`: `done` and confirmed on origin.
- `LAB-026-document-equipment-surfaces`: `done` and confirmed on origin.
- `LAB-027-request-report-workflow`: `done` and confirmed on origin.
- `LAB-028-reference-curation-surfaces`: `done` and confirmed on origin.
- Consolidated envelope: `LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, approved for all seven seams and implemented unchanged for LAB-027.
- `LAB-029-provenance-publication-surfaces`: `done` and confirmed on origin under Program & Integrate approval of `LAB-029_SEAM_ENVELOPE.md`, version 1 unchanged.
- Program approval gate: 45/45 passed; the decision was committed and pushed with no amendment.
- LAB-029 focused, independent and gated executions: 255/255 passed.
- `LAB-030-emergency-surface`: `done` and confirmed on origin.
- `LAB-031-project-builder-surface`: `done` and confirmed on origin.
- `LAB-032-merge-composition-surface`: `done` and confirmed on origin.
- `LAB-032A-canonical-keyword-migration-guard-correction`: `done` and confirmed on origin.
- `LAB-033-main-lab-bench-surface`: `done` and confirmed on origin.
- `LAB-034-legacy-labbench-classification`: `done` and confirmed on origin.
- `LAB-035-selector-contract-stub`: `done` and confirmed on origin under Program & Integrate approval of version 1 unchanged.
- Program approval decision: `docs(program): approve LAB-035 Selector contract seam`; Program gate 46/46 passed and the decision was pushed.
- `LAB-036-lab-shell-server`: `done` and confirmed on origin.
- `LAB-037-keyword-migration-guard`: `done` and confirmed on origin.
- LAB-037 gated execution: 255/255 passed.
- `LAB-038-nvb-resolution-thermal-semantics-v2`: `done` under approved envelope version 2 and confirmed on origin.
- LAB-038 gated execution: 256/256 passed.
- `LAB-039-component-thermal-semantics-v2`: `done` and confirmed on origin.
- LAB-039 gated execution: 257/257 passed.
- `LAB-040-nvb-lab-thermal-projection-v2`: `done` and confirmed on origin.
- LAB-040 gated execution: 259/259 passed.
- `LAB-041-component-library-thermal-labels`: `done` and confirmed on origin.
- LAB-041 gated execution: 259/259 passed.
- `LAB-042-thermal-semantics-guard`: `done` under approved envelope version 3 and confirmed on origin.
- LAB-042 gated execution: 262/262 passed.
- Ready items: none.
- Queue state: empty.

Program reported gate 45/45 passed, the approval decision committed and pushed, and its tree clean. No parallel or combined implementation is authorised.

LAB-022 remains governed by its ratified binary-composition policy: exactly two unique non-MERGED parents, immutable order-significant provenance, exactly matching photometric grids with no interpolation/resampling, and allocation/authority/approval/sealing outside the kernel. Duplicate or pre-composed parents, reordered or missing provenance, grid mismatch and governance-boundary crossings fail closed.

LAB-023 remains governed by the exact version-1 immutable Lab projection contract. It consumes only the committed LAB-018 resolution and LAB-017 safe identity projections; unresolved values remain explicit, no ID or timestamp is generated, and assembly verification remains null.

LAB-024 remains a bounded offline fixture corpus only. Every file is explicit demo/development evidence, contains no unsafe local path, secret or fabricated verified authority digest, and resolves only through committed safe development projections.

LAB-025 remains a Lab-only surface over committed immutable projections and in-memory document-register state. Patrick reported a 100% PASS against its browser checklist; no production authority or persistence claim was introduced.

LAB-026 remains a bounded Lab-only support workflow. Patrick's observed legacy `404` artefact link was removed; unresolved evidence is now non-clickable and all state remains entered/demo, unverified and non-persistent.

LAB-027 remains the approved additive handoff implementation. It preserves earlier fields without rekeying, keeps unresolved values explicit, passes only canonical artefact references and creates no persistent or sealed browser authority.

LAB-028 remains a bounded Lab-only reference-draft and evidence-curation workflow. Patrick's observed 404 catalogue loads and browser-fabricated GT/OPT identities were retired; the completed surfaces now stop at explicit non-authoritative drafts with identity and evidence verification unresolved.

LAB-029 version 1 is complete under the unchanged approval. The three read-only publication pages consume only the committed safe identity, canonical host-free resolver and evidence-capability contracts. Offline fixture mode remains visibly `OFFLINE DEMO — UNAPPROVED`; governed mode relies on Program-supplied safe projections; emergency and EWIS verification remain null. Resolver hosting, route-to-storage mapping, persistence, evidence acceptance, sealing, allocation, authentication, deployment and endpoints remain Program-owned.

LAB-030 is complete as a thin advisory view over the committed emergency-selection contract. It creates no model or battery authority, procurement release, order, persistence or assembly-verification outcome.

LAB-031 is complete as a thin browser consumer of the committed project generator. It accepts only sealed-reference DTO input plus bounded project fields, keeps ambient reference-owned, and creates no alternate generation or persistence path.

LAB-032 is complete as an ordered, non-authoritative composition surface. It creates no allocation, approval, seal or assembly-verification outcome and requires a separate freshly sealed MERGED DTO before project materialisation.

LAB-032A is complete as the approved test-only canonical-keyword migration guard correction. It changed no production behaviour and preserved sealed-reference ownership of internal ambient.

LAB-033 is complete as the bounded Main Lab Bench. It keeps working state non-authoritative, delegates every governed operation to committed modules, exposes no editable internal ambient, and accepts only a separately supplied sealed reference for project generation.

LAB-034 is complete as the read-only legacy compatibility classification. It removes the second authority/project-generation path and directs governed work to the Main Lab Bench.

LAB-017 remains governed by its approved version-1 envelope. Program retains all production allocation, live source reading, hosting, routing, persistence, authentication, CRM integration, deployment and endpoint ownership.

The corrected thermal batch is complete. Program has now admitted LAB-043 as the sole ready Lab parcel.

## 2026-07-21 LAB-043 Engine output compatibility handoff

Create exactly:

```text
packages/lab-kernel/ies-toolkit/engineOutputV1CompatibilityAdapter.js
tests/lab-kernel/engineOutputV1CompatibilityAdapter.test.js
```

Consume plain public JSON fixtures for `controlstack.engine.output.v1` and `controlstack.engine.runtable-row.v1`. Do not import Selector, Workspace or Runtime implementation modules. Emit only a deeply immutable bounded Lab compatibility summary and preserve complete, blocked and valid zero-valued technical semantics.

Reject unknown versions, over-rich keys, contradictory identities, governance-bearing values, private paths, unsafe/raw data and the legacy colliding first-narrow row schema. Do not generate IES, make authority decisions, accept evidence, add routes, persist, write, activate downstream readiness, mutate RuntimeData, use donor code or touch main.

The fixed gate omits the new test. Temporarily import it once from the gate-included keyword migration test, run the full Lab gate with visible focused assertions, then remove the import and prove the harness file is byte-identical to HEAD and absent from final staging. Commit only the two new feature files as `lab: checkpoint Engine output v1 compatibility`.

Preserve the branch-HEAD marker and all three protected local items. After the pushed feature and five-record closeout, return the consumer receipt to Program; do not declare Engine output stable or activate any downstream consumer.

## LAB-017 immutable completion receipt

The fenced block below is the canonical final receipt for Program & Integrate acceptance. It must be consumed verbatim. Any change to its seam, implementation, ownership, compatibility or validation fields invalidates the receipt and requires a new seam decision.

```yaml
receipt_schema: controlstack.lab.parcel-completion-receipt.v1
receipt_status: final
lane: lab-ies
branch: lane/code-pilot-lab
queue_item: LAB-017-reference-resolver-contract
seam:
  version: 1
  envelope_checkpoint: f927ced1ca77c8b11ef8b13b9d6bb3833618844c
  approval_checkpoint: 09ac99cb35b6af45696b4c83e0051a1651bb2f14
  approved_unchanged: true
  interface_authority: docs/_context/lanes/lab-ies/LAB-017_SEAM_ENVELOPE.md
implementation:
  starting_head: 09ac99cb35b6af45696b4c83e0051a1651bb2f14
  feature_checkpoint: 2333c1197abf898e7a680455f99918823cb76e30
  feature_subject: "lab: checkpoint reference resolver contract"
  exact_files:
    - packages/lab-kernel/ies-toolkit/nvbReference.js
    - tests/lab-kernel/nvbReference.test.js
  scope_widened: false
validation:
  focused_lab_gate:
    tests: 169
    passed: 169
    failed: 0
    cancelled: 0
    skipped: 0
    todo: 0
  independent_full_lab_gate:
    tests: 169
    passed: 169
    failed: 0
    cancelled: 0
    skipped: 0
    todo: 0
  gated_feature_commit:
    tests: 169
    passed: 169
    failed: 0
    cancelled: 0
    skipped: 0
    todo: 0
  documentation_closeout_checkpoint: 8053e1b77332d07c4fef201e30400b6776505bed
  documentation_subject: "docs(lab): close LAB-017 reference resolver contract"
publication:
  remote: origin
  branch: lane/code-pilot-lab
  feature_push_confirmed: true
  documentation_push_confirmed: true
contract_result:
  exact_versioned_public_interface: true
  exact_identity_and_data_shapes: true
  canonical_host_free_resolver_paths: true
  fail_closed_rejections: true
  deterministic_deep_immutability: true
  private_authority_leak: false
  emergency_assembly_verification: null
  ewis_assembly_verification: null
ownership:
  program_retains:
    - production allocation
    - resolver hosting
    - routing
    - persistence
    - authentication
    - deployment
    - endpoint ownership
compatibility:
  accepted_break: five named protected legacy Lab prototypes may remain incompatible until their later queue parcels
  protected_consumers_changed: false
rollback:
  data_migration_required: false
  safe_order: revert dependent consumers in reverse order, revert the LAB-017 feature checkpoint, run the full lab-ies gate, then restore LAB-017 to blocked in lane memory
program_reported_preacceptance:
  completion_recorded: true
  program_gate: "45/45"
  program_tree_clean: true
  final_acceptance_pending: this exact immutable receipt
next_boundary:
  queue_item: LAB-018-nvb-resolution-contract
  status: blocked
  blocker: separate seam envelope and Program & Integrate approval
```

## Final Program acceptance acknowledgement

Program & Integrate accepted the immutable receipt above unchanged on 2026-07-20.

Program reported:

- final acceptance closed;
- Program gate passed 45/45;
- the acceptance checkpoint was committed and pushed;
- the Program tree was clean.

The immutable receipt remains byte-for-byte unchanged. Promotion to main is a separate Program & Integrate action and was not performed by the Lab lane. The later consolidated batch approval superseded the former LAB-018 hold; sequence progression is recorded separately in current lane memory.

## 2026-07-21 LAB-043 complete — Program stability review next

LAB-043 is complete and pushed in the exact two-file scope across the initial compatibility checkpoint and one corrective thermal-tightening checkpoint. The final Lab gate passed 269/269 after each accepted checkpoint and the temporary keyword-test harness was removed before final staging.

The new import-free adapter consumes only plain public `controlstack.engine.output.v1` JSON and exact `controlstack.engine.runtable-row.v1` rows. It emits a deeply immutable compatibility projection for complete or blocked output, preserves valid zero values and safe thermal/provenance values, verifies both accepted thermal equations and clamp/mode combinations, and rejects unknown versions, extra fields, governance-bearing content, private paths, contradictory identities, unsafe states, additional caller evidence authority and the legacy colliding row schema.

It creates no IES, authority, evidence acceptance, sealing, reference mutation, route, persistence, network write or downstream-readiness capability. No Selector, Workspace, Runtime, donor, RuntimeData, main or runtime-port implementation changed.

The three protected untracked items remain untouched and unstaged. The ordered Lab queue is empty. Program must review this consumer receipt and make the separate final Seam B stability decision; Lab must not activate downstream work.

## 2026-07-21 SEAM-G-C1 ready — read-only request compatibility

Program accepted the deterministic IES artifact request producer after 115/115 focused and 107/107 normal Selector evidence.

SEAM-G-C1 is the sole ready Lab parcel. Create only the new import-free request compatibility adapter and its focused test. Consume plain public `controlstack.downstream.ies-artifact-request.v1` JSON; do not import Selector, Workspace, Runtime or producer implementation.

The projection must preserve exact ready/blocked request, intent, Engine, replay and audit identities; safe technical provenance/thermal values; exact public rows; valid zeros; canonical blockers/warnings; and no-generation/no-authority/no-write safety state. Different traceability values must neither influence nor appear.

Reject unknown versions, extra/nested authority, private/raw content, contradictory identities, unsafe flags, blocked-to-ready promotion and legacy rows. Add no IES generation, Lab authority, evidence acceptance, sealing, reference mutation, route, persistence, network/file/email write or readiness capability.

The expected branch marker and three protected untracked items must remain untouched and outside staging. Return the consumer receipt to Program; SEAM-G-A1 and actual generation remain blocked.

## 2026-07-21 SEAM-G-C1 complete — Program activation review next

The import-free request compatibility adapter is complete and pushed in the exact two-file scope. The final Lab gate passed 276/276.

The adapter consumes exact ready or blocked public IES request JSON and preserves deterministic request/replay/audit identity, stable Engine identities, safe technical provenance/thermal values, exact public rows, valid zeros and canonical diagnostics. Different outer traceability contexts return identical output and remain absent.

Unknown versions, extra request or intent fields, private paths, raw artifact text, request/audit/Engine/row/thermal contradictions, extra evidence authority, unsafe source flags, blocked promotion/body and legacy rows fail closed.

It creates no IES, authority, evidence acceptance, sealing, reference mutation, route, persistence, network/file/email write or readiness capability. The expected branch marker and three protected untracked items remain untouched.

The Lab queue is empty. Program must perform SEAM-G-A1 review; actual IES generation remains blocked.

## 2026-07-21 SEAM-G-C2 ready — OPT reference identity binding only

Program accepted the deterministic single-run generation-input producer after 115/115 focused and 107/107 normal Selector evidence.

SEAM-G-C2 is the sole ready Lab parcel. Create only the new import-free reference-binding adapter and focused test. Consume plain public generation-input version 1 and exact NVB Lab projection version 2 JSON.

Require optic path with no unresolved blockers; selected optic key equal to Lab optic variant; exact optic BOM and evidence-ref agreement; exact measured reference-room/reference-internal/rise triplet agreement; and one exact read-only OPT reference identity with canonical resolver path.

Emit a deeply immutable ready-or-blocked binding projection only. Do not execute the resolver, access storage, load the sealed DTO, inspect/mutate authority, accept evidence, invoke the generator, emit LM-63 text, add routes, persist or write.

The expected marker and three protected untracked items remain untouched and outside staging. Return the consumer receipt to Program; SEAM-G-A2 and actual generation remain blocked.

## 2026-07-21 SEAM-G-C2 complete — Program binding review next

The import-free generation/reference binding adapter is complete and pushed across the exact feature and identity-tightening checkpoints. The final Lab gate passed 285/285.

It independently recomputes the real selection fingerprint and artifact request identity, revalidates generation identity/audit and no-generation safety, requires optic path with no unresolved blockers, and proves optic key/variant, BOM, evidence, exact-decimal measured thermal triplet and canonical read-only OPT reference timestamp/identity agreement.

Ready, valid-zero, replay/governance and identity-movement fixtures passed. Unknown, extra, private/raw, unsafe, unresolved/non-optic, missing/wrong-kind reference, resolver contradiction and all optic/evidence/thermal mismatches fail closed.

It creates no resolver/storage access, sealed DTO load, authority/evidence mutation, generator invocation, LM-63 text, route, persistence or write capability. The expected marker and three protected untracked items remain untouched.

The Lab queue is empty. Program must perform SEAM-G-A2 review; actual generation remains blocked.

## 2026-07-21 SEAM-G-C3 ready — sealed-reference inspection only

Program activated the read-only generation-binding tunnel and commissioned one exact Lab inspection parcel.

Modify only the existing sealed-reference generator module to export a redacted inspection function, and add one focused test. The inspector must call the exact existing private reference validator and stop before job validation or materialisation.

Return only public reference identity, keyword profile ID, safe per-mm/per-m baseline values, exact missing generator override names and explicit no-generation/no-raw/no-write state. Never expose metadata, angles, candela, keyword values, provenance paths or the sealed DTO body.

Do not derive a multiplier, accept project/customer metadata, resolve storage, invoke the generator, emit LM-63 text, add routes, persist or write. The expected marker and three protected untracked items remain untouched. Return the inspection receipt to Program; multiplier policy and actual generation remain blocked.

## 2026-07-21 SEAM-G-C3 complete — Program inspection review next

The sealed-reference generation inspector is complete and pushed in the exact two-file scope. The final Lab gate passed 295/295.

It reuses the generator's exact private reference validator and returns only public reference identity, keyword profile ID, safe one-millimetre/per-metre baseline values, exact missing override names, deterministic audit and no-generation/no-raw/no-write state.

Complete, all-seven-overrides, baseline-fallback, valid-zero, required-keyword, invalid-schema/approval/one-mm/keyword/candela/baseline/private-provenance, repeatability, privacy and generator-regression cases passed.

No multiplier, job, project/customer metadata, resolver/storage, generator invocation, LM-63 text, route, persistence or write capability was added. The expected marker and protected local items remain untouched. The Lab queue is empty; Program inspection review is next.

## 2026-07-21 SEAM-G-C4 ready — no-generation materialisation job plan

Program accepted the sealed-reference inspection after 295/295 and commissioned one exact import-free job-plan parcel.

Create exactly:

```text
packages/lab-kernel/ies-toolkit/iesMaterialisationJobPlanV1.js
tests/lab-kernel/iesMaterialisationJobPlanV1.test.js
```

Consume only exact public generation-input version 1, generation-reference-binding version 1 and reference-generation-inspection version 1 JSON. Derive output multiplier only as Engine verified lm/m divided by sealed baseline lm/m. Selector target lm/m is intent only.

A ready plan requires exact generation ID/replay and selection/run agreement with the binding, exact binding/inspection reference identity, a ready reference-validated inspection, no missing keyword overrides and materialisation without overrides. Emit the exact job `{ runLengthMm, outputMultiplier, selections: {} }` with deterministic plan/replay/audit identity and explicit no-generation/no-write state.

Reject unknown, extra, private/raw, unsafe, mismatched, contradictory, non-positive/non-finite or caller-override input. Do not load a sealed DTO, resolve storage, invoke the generator or materialise, emit LM-63, accept project/customer metadata, add routes, persist or write.

No human observation is required. Preserve the expected marker and three protected local items. After the feature and five-record closeout, return the plan receipt to Program; actual generator invocation remains blocked.

## 2026-07-21 SEAM-G-C4 complete — Program plan review next

The deterministic no-generation materialisation job plan is complete and pushed in the exact two-file scope. The final Lab gate passed 305/305 after two focused test-fixture ordering corrections; the production contract did not change during correction.

The import-free planner consumes exact public generation-input, generation-reference-binding and reference-inspection version-1 JSON. It independently validates the generation/replay, selection, run and reference chain; derives output multiplier only from Engine verified lm/m divided by sealed baseline lm/m; keeps Selector target as intent; and emits exactly run length, the positive finite multiplier and an empty selections object.

Replay, immutability, identity movement, private/raw rejection, missing/caller override rejection, unsafe-state rejection and non-positive/non-finite failure cases passed. It contains no sealed DTO, resolver/storage, generator/materialise call, LM-63 text, project/customer metadata, route, persistence, file/network/email write or readiness activation.

The expected marker and three protected local items remain untouched. The Lab queue is empty. Program plan receipt review is the next seam; actual generator invocation remains blocked.

## 2026-07-22 SEAM-G-C5 ready — sealed-reference load preflight

Program accepted the deterministic no-generation job plan and commissioned one exact Lab-only read-only sealed-reference load preflight.

Create exactly:

```text
packages/lab-kernel/ies-toolkit/iesSealedReferenceLoadPreflightV1.js
tests/lab-kernel/iesSealedReferenceLoadPreflightV1.test.js
```

Consume exact ready materialisation-job-plan version 1, exact matching generation-reference-binding version 1 and exact matching reference-generation-inspection version 1 values. Accept one Lab-owned read-only resolver only as an injected capability. Derive the reference identity solely from those contracts and call the resolver at most once.

Validate the returned sealed DTO through the existing `inspectIesReferenceForGeneration` path. Require exact identity, keyword profile, baseline, missing override and materialisation-without-overrides equality. Emit only one deterministic immutable redacted ready-or-blocked receipt, then discard the loaded body.

Reject caller paths, URLs, storage/provider objects, malformed/extra/private/raw input, resolver failure, wrong DTO and every inspection mismatch. Do not invoke the generator or materialiser, emit LM-63, add routes, persist, write, deliver or activate readiness.

No human observation is required. Preserve the expected marker and three protected local items. After the feature and four-record closeout, return the receipt to Program; C6 remains blocked.

## 2026-07-22 SEAM-G-C5 complete — Program receipt review next

The Lab-owned sealed-reference load preflight is complete and pushed in the exact two-file scope. The final Lab gate passed 314/314 after three authorised test-fixture corrections; production behavior did not change.

The loader consumes exact ready materialisation-job-plan, matching generation-reference-binding and matching reference-generation-inspection version-1 contracts plus one injected read-only resolver. It derives the reference identity only from those contracts, calls the resolver at most once, validates the returned sealed DTO through the existing inspection path, requires exact identity/keyword-profile/baseline/missing-override/no-override agreement, emits one immutable redacted receipt and discards the body.

Replay, changed-reference movement, no-caller-location authority, private/raw rejection, resolver failure, wrong-DTO rejection and inspection mismatch cases passed. The receipt contains no sealed body, metadata, keywords, angles, candela, provenance paths, LM-63 text, local location or provider material.

No generator/materialise invocation, route, persistence, file/network/email write, delivery or readiness activation was added. The expected marker and three protected local items remain untouched. The Lab queue is empty. Program C5 receipt review is the next seam; C6 remains blocked.

## 2026-07-22 C5 lane-memory closeout complete — Program review only

Program technically accepted C5 and its 314/314 fixed-gate evidence. This memory-only closeout reconciles the live branch position, preserves the exact protected local inventory and records the accepted technical and safety receipt.

C5 remains limited to one exact contract-derived read-only resolver load, validation through the existing inspection path, an immutable redacted receipt and loaded-body discard. No sealed body or private photometric content crosses the boundary. No generator, materialiser, LM-63, route, persistence, write, delivery or readiness activation exists in this closeout.

SEED-LIB-001 is recorded as a blocked future acceptance batch for the exact two saved Selector cases. It requires exact saved intake, genuine measured Lab evidence, the real approval/sealer and inspection path, then separately admitted C5/C6/C7 chain steps. Substitutions and reconstructed evidence fail closed.

C6 was not started. No seed sealing, inspection, resolver execution, generation, artifact handoff, persistence, retrieval or delivery was started. No Lab implementation item is ready. Stop for Program review.

## Prohibited actions retained

- no LAB-017 change outside the recorded version-1 approval without a new seam decision;
- no reverse-authority reconstruction, legacy alternative reference schema, diagnostic authority identity or unsafe governed path;
- no public resolver route, server implementation, HTML, fixture, Selector or Program ownership absorbed into the Lab contract;
- no parallel or combined implementation; only the current top `ready` parcel may run, but the same worker may advance sequentially through up to five successful closeouts;
- no reset, restore, clean, deletion or movement of protected dirty paths;
- no execution of `scripts/clear_chaff.ps1`;
- no donor write;
- no main or other-lane write;
- no Selector changes.

## Standing-role launch instructions

The authoritative standing worker and standing orchestrator prompts are stored in `LANE_CHARTER.md`. This handoff records current session state and points to the stable charter; it is not the prompt authority.

Start a fresh worker with exactly:

```text
Read docs/_context/lanes/lab-ies/LANE_CHARTER.md and act as the standing worker per the prompt recorded there.
```

Start a fresh orchestrator with exactly:

```text
Read docs/_context/lanes/lab-ies/LANE_CHARTER.md and act as the standing orchestrator per the prompt recorded there.
```
