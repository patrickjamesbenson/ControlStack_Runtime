# Lab/IES Session Handoff

## Session purpose

This handoff records the stale-head reconciliation of completed LAB-021 emergency selection, preserves the permanent charter authority for both standing prompts, and identifies LAB-022 as the single next runnable parcel.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Standing prompt authority: `docs/_context/lanes/lab-ies/LANE_CHARTER.md` contains both worker and orchestrator prompts
- Starting HEAD for LAB-021: `5ac6b8bc80237de00ebe72f686aa740eeffa1522`
- Completed feature checkpoint: `066fcc658491a65b85108b83e64f31341ba5e1bb`
- Feature subject: `lab: checkpoint emergency selection contract`
- Feature checkpoint present in current branch history and included in the next lane-only push
- Consolidated seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, approved unchanged for LAB-021 and expressly ratified for LAB-022
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`

## Branch-HEAD guard

Before the first parcel and before every later parcel in the same worker run, the worker compares `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops parcel execution, produces the exact stale-state reply, and permits only memory reconciliation plus the full gate. The worker must not execute any queue item after discovering the mismatch in that run.

After every documentation push, only the `Recorded branch HEAD` field is refreshed in the working tree to the new actual HEAD and left unstaged. This deliberate marker avoids the impossible requirement for a commit to contain its own final hash and provides the next parcel boundary check inside the same batch.

## Completed queue item

`LAB-021-emergency-selection-contract` is complete.

Exactly these two feature files were committed:

```text
packages/lab-kernel/ies-toolkit/zencontrolEmergency.js
tests/lab-kernel/zencontrolEmergency.test.js
```

The module now exposes only the approved version-1 advisory emergency-selection contract. Candidate selection uses published voltage windows, blocks the shared 50 V boundary, preserves published/derived/unconfirmed distinctions and permits only published power, duration and design-life combinations.

Unsupported inputs and the known battery-publication conflict fail closed. Nominal current is advisory arithmetic only; procurement release stays false; procurement blockers remain explicit; emergency and EWIS assembly verification remain null. No ordering, persistence, route, network, filesystem, browser-storage, HTML, Program, Runtime, Engine or Selector implementation was added.

The feature checkpoint landed while this documentation task was in progress. The branch-HEAD guard therefore required memory-only reconciliation and prohibited execution of LAB-022 in this run.

## Validation evidence

- Independent changed-file/full `lab-ies` execution including the dedicated LAB-021 test: 215/215 passed.
- Feature checkpoint subject and authorised file pair match current repository history.
- Failed, cancelled, skipped and todo counts were zero.
- Documentation reconciliation gate: 215/215 passed with zero failed, cancelled, skipped or todo.

## Git and protected worktree state

The feature parcel was staged as exactly the two approved implementation files, committed and pushed.

The protected working-tree state after documentation closeout must remain:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in `LANE_STATE.md`;
- untracked: 28;
- deleted: 0.

The 28 protected untracked paths remain exactly those recorded in `LANE_STATE.md`. In particular, these explicitly non-queued paths remain untouched:

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
- `LAB-021-emergency-selection-contract`: `done` and present in current branch history.
- Consolidated envelope: `LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, approved for all seven seams.
- `LAB-022-reference-composition-kernel`: `ready` and the only active parcel under its ratified owner policy.
- LAB-023 and LAB-027: approved but sequence-blocked.
- Ready items: exactly one — LAB-022.

Program reported gate 45/45 passed, the approval decision committed and pushed, and its tree clean. No parallel or combined implementation is authorised.

LAB-022 is approved only under its ratified binary-composition policy: exactly two unique non-MERGED parents, immutable order-significant provenance, exactly matching photometric grids with no interpolation/resampling, and allocation/authority/approval/sealing outside the kernel. Duplicate or pre-composed parents, reordered or missing provenance, grid mismatch and governance-boundary crossings must fail closed.

LAB-017 remains governed by its approved version-1 envelope. Program retains all production allocation, live source reading, hosting, routing, persistence, authentication, CRM integration, deployment and endpoint ownership.

This reconciliation run stops after the documentation closeout and does not execute LAB-022. The next safe action is a fresh standing-worker batch beginning with LAB-022. After each successful documentation closeout, that worker may continue sequentially under the five-parcel charter until the first recorded boundary.

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
