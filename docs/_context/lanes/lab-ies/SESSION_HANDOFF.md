# Lab/IES Session Handoff

## Session purpose

This handoff records Program approval of the LAB-042 gate-included test-file amendment, preserves the permanent charter authority for both standing prompts, and admits LAB-042 as the sole ready item.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Standing prompt authority: `docs/_context/lanes/lab-ies/LANE_CHARTER.md` contains both worker and orchestrator prompts
- Starting HEAD for LAB-041: `4dfaa2d3cc95211378d7141aed7b3140432d1267`
- Completed feature checkpoint: `1a85beba662333561fd2338f67e5146b45935f94`
- Feature subject: `lab: checkpoint corrected thermal labels`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`
- Seam change: no after approved thermal envelope
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`
- LAB-041 feature gate: 259/259 passed
- Program correction consumed: `docs(program): correct thermal source field semantics`; Program gate 46/46 passed and the correction was pushed
- Approved Lab seam: `LAB-038_042_THERMAL_SEMANTICS_SEAM_ENVELOPE.md`, version 3
- Program approvals: initial corrected seam, atomic LAB-038 transition, and `docs(program): amend LAB-042 gate-included test scope`; all Program gates passed 46/46 and were pushed
- Parcel state: LAB-038 through LAB-041 are done; LAB-042 is the sole ready item

## Branch-HEAD guard

Before the first parcel and before every later parcel in the same worker run, the worker compares `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops parcel execution, produces the exact stale-state reply, and permits only memory reconciliation plus the full gate. The worker must not execute any queue item after discovering the mismatch in that run.

After every documentation push, only the `Recorded branch HEAD` field is refreshed in the working tree to the new actual HEAD and left unstaged. This deliberate marker avoids the impossible requirement for a commit to contain its own final hash and provides the next parcel boundary check inside the same batch.

## Corrected thermal seam coordination

Program & Integrate corrected and superseded the old thermal interpretation. The source value 35 is the absolute internal reference temperature, the source value 10 is the measured rise, and Engine alone applies that rise once after Program validates the selected optic and evidence.

The corrected resolution, component catalogue and Lab working projection are now committed as version-2 contracts. They preserve the measured reference room, absolute reference internal and optic thermal rise meanings, enforce exact triplet consistency, and keep legacy snake-case names confined to bounded source mapping. The Lab projection carries opaque evidence with authority explicitly null and no Engine-owned result.

The corrected component-library labels are also complete. The remaining work is the final thermal semantics guard.

LAB-038 through LAB-041 are complete. Program approved use of the existing gate-included keyword migration test for LAB-042; the superseded new thermal test file must not be created. LAB-042 is the sole ready parcel.

## Previous completed queue item

`LAB-037-keyword-migration-guard` is complete.

Exactly this one test file was committed:

```text
tests/lab-kernel/iesKeywordMigration.test.js
```

The final regression guard independently pins the exact versioned 16-keyword order and owner map, the sealed-reference internal-ambient policy, the active Lab-form order and bracketed fields, and rejection of stale aliases or supplementary keywords. It checks every active formatter, generator, merge, project adapter, builder and working preview for retired output vocabulary without testing unrelated presentation layout.

No production source or fixture changed.

## Validation evidence

- Full LAB-037 feature execution before checkpoint: 255/255 passed.
- Gated LAB-037 feature checkpoint execution: 255/255 passed.
- Corrected thermal seam coordination documentation: 255/255 passed.
- Failed, cancelled, skipped and todo counts were zero.

## Git and protected worktree state

The LAB-037 parcel was staged as exactly the one authorised test file, committed and pushed separately from lane documentation.

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

## Completed LAB-037 final regression guard

The live branch contains the exact authorised one-file test checkpoint. It fixes the canonical outgoing keyword contract independently from production implementation and guards every active generation, merge and preview path against retired vocabulary.

The feature passed the full 255/255 Lab gate and is confirmed on origin. Its closeout left the queue empty before the corrected thermal ruling admitted the new blocked proposal.

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
- `LAB-042-thermal-semantics-guard`: `ready` under approved envelope version 3.
- Ready items: LAB-042 only.
- Queue state: ready.

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

LAB-042 is the sole ready item. The standing worker may implement the final guard in the existing gate-included test file and then close the corrected thermal batch.

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
