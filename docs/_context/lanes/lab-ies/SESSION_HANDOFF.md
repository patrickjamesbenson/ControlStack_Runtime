# Lab/IES Session Handoff

## Session purpose

This handoff records completed LAB-029 provenance publication surfaces, preserves the permanent charter authority for both standing prompts, and orders LAB-030 as the single next ready parcel.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Standing prompt authority: `docs/_context/lanes/lab-ies/LANE_CHARTER.md` contains both worker and orchestrator prompts
- Starting HEAD for LAB-029: `79d9327d9c93a6d3558787c98bce30080296d4f2`
- Completed feature checkpoint: `f41c22ca69ce24b5d2bc8bed20c334396d070a29`
- Feature subject: `lab: checkpoint provenance publication surfaces`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`
- Seam change: yes; Program & Integrate approved version 1 unchanged before implementation
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`

## Branch-HEAD guard

Before the first parcel and before every later parcel in the same worker run, the worker compares `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops parcel execution, produces the exact stale-state reply, and permits only memory reconciliation plus the full gate. The worker must not execute any queue item after discovering the mismatch in that run.

After every documentation push, only the `Recorded branch HEAD` field is refreshed in the working tree to the new actual HEAD and left unstaged. This deliberate marker avoids the impossible requirement for a commit to contain its own final hash and provides the next parcel boundary check inside the same batch.

## Completed queue item

`LAB-029-provenance-publication-surfaces` is complete.

Exactly these three feature files were committed:

```text
packages/lab-kernel/ies-toolkit/provenance.html
packages/lab-kernel/ies-toolkit/provenance_explorer.html
packages/lab-kernel/ies-toolkit/luminaire_provenance.html
```

The replacement pages implement the approved version-1 read-only publication view over committed safe identity, canonical host-free resolver paths and evidence-category coverage. Governed mode accepts only the bounded safe projection; offline mode reads only fixed committed fixture projections and remains visibly `OFFLINE DEMO — UNAPPROVED`.

The pages display no raw origin, evidence, source or report body, probe no host, expose no storage location, generate no ID or timestamp, reconstruct no private authority, and make no emergency or EWIS assembly-verification claim. The deliberately incomplete fixture fails closed rather than being strengthened.

## Validation evidence

- Focused changed-file `lab-ies` execution for the three LAB-029 publication files: 255/255 passed.
- Independent full `lab-ies` gate: 255/255 passed.
- Gated feature commit execution: 255/255 passed.
- Failed, cancelled, skipped and todo counts were zero.

## Git and protected worktree state

The feature parcel was staged as exactly the three authorised publication files, committed and pushed.

The protected working-tree state after documentation closeout must remain:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in `LANE_STATE.md`;
- untracked: 13;
- deleted: 0.

The 13 protected untracked paths remain exactly those recorded in `LANE_STATE.md`. In particular, these explicitly non-queued paths remain untouched:

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
- `LAB-030-emergency-surface`: `ready`.
- Ready items: exactly one — LAB-030.

Program reported gate 45/45 passed, the approval decision committed and pushed, and its tree clean. No parallel or combined implementation is authorised.

LAB-022 remains governed by its ratified binary-composition policy: exactly two unique non-MERGED parents, immutable order-significant provenance, exactly matching photometric grids with no interpolation/resampling, and allocation/authority/approval/sealing outside the kernel. Duplicate or pre-composed parents, reordered or missing provenance, grid mismatch and governance-boundary crossings fail closed.

LAB-023 remains governed by the exact version-1 immutable Lab projection contract. It consumes only the committed LAB-018 resolution and LAB-017 safe identity projections; unresolved values remain explicit, no ID or timestamp is generated, and assembly verification remains null.

LAB-024 remains a bounded offline fixture corpus only. Every file is explicit demo/development evidence, contains no unsafe local path, secret or fabricated verified authority digest, and resolves only through committed safe development projections.

LAB-025 remains a Lab-only surface over committed immutable projections and in-memory document-register state. Patrick reported a 100% PASS against its browser checklist; no production authority or persistence claim was introduced.

LAB-026 remains a bounded Lab-only support workflow. Patrick's observed legacy `404` artefact link was removed; unresolved evidence is now non-clickable and all state remains entered/demo, unverified and non-persistent.

LAB-027 remains the approved additive handoff implementation. It preserves earlier fields without rekeying, keeps unresolved values explicit, passes only canonical artefact references and creates no persistent or sealed browser authority.

LAB-028 remains a bounded Lab-only reference-draft and evidence-curation workflow. Patrick's observed 404 catalogue loads and browser-fabricated GT/OPT identities were retired; the completed surfaces now stop at explicit non-authoritative drafts with identity and evidence verification unresolved.

LAB-029 version 1 is complete under the unchanged approval. The three read-only publication pages consume only the committed safe identity, canonical host-free resolver and evidence-capability contracts. Offline fixture mode remains visibly `OFFLINE DEMO — UNAPPROVED`; governed mode relies on Program-supplied safe projections; emergency and EWIS verification remain null. Resolver hosting, route-to-storage mapping, persistence, evidence acceptance, sealing, allocation, authentication, deployment and endpoints remain Program-owned.

LAB-017 remains governed by its approved version-1 envelope. Program retains all production allocation, live source reading, hosting, routing, persistence, authentication, CRM integration, deployment and endpoint ownership.

The next safe action is to continue the current standing-worker batch with LAB-030. No seam approval or human observation is required before implementation of its exact one-file parcel.

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
