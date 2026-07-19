# Lab/IES Session Handoff

## Session purpose

This handoff records completed LAB-020 document registration, preserves the approved consolidated seam sequence, and adopts the permanent five-parcel standing-worker model beginning with LAB-021 as the single next runnable parcel.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Reusable prompt model: five-parcel standing worker with human-observation stop boundary, adopted 2026-07-20
- Starting HEAD for LAB-020: `02479150d55cf8f26b8da74d621f0671e428755d`
- Completed feature checkpoint: `636d3d7c2023bf16e49def1d75f9d46d66b26482`
- Feature subject: `lab: checkpoint document register contract`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`
- Consolidated seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, approved unchanged for LAB-020 and LAB-021
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`

## Branch-HEAD guard

Before the first parcel and before every later parcel in the same worker run, the worker compares `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops parcel execution, produces the exact stale-state reply, and permits only memory reconciliation plus the full gate. The worker must not execute any queue item after discovering the mismatch in that run.

After every documentation push, only the `Recorded branch HEAD` field is refreshed in the working tree to the new actual HEAD and left unstaged. This deliberate marker avoids the impossible requirement for a commit to contain its own final hash and provides the next parcel boundary check inside the same batch.

## Completed queue item

`LAB-020-document-register-contract` is complete.

Exactly these two feature files were committed:

```text
packages/lab-kernel/ies-toolkit/docRegister.js
tests/lab-kernel/docRegister.test.js
```

The module now exposes only the approved version-1 immutable document-register contract. Callers supply document and entity IDs; canonical source references and owner-supplied raw SHA-256 values are the only dedupe authorities; conflicts fail closed; and titles, filenames or diagnostic values never become authority.

Many-to-many links are deterministic and idempotent, unlinking removes only one association, queries are stable and deeply immutable, and prior state remains unchanged. No counter, upload, file read, hashing, RuntimeData/database reader, persistence, browser storage, clock, random, HTML, fixture, Program, Runtime, Engine or Selector implementation was changed.

## Validation evidence

- Corrected focused changed-file `lab-ies` execution: 203/203 passed.
- Independent full `lab-ies` gate: 203/203 passed.
- Gated feature commit execution: 203/203 passed.
- Feature checkpoint push: confirmed on origin `lane/code-pilot-lab`.
- Failed, cancelled, skipped and todo counts were zero.

## Git and protected worktree state

The feature parcel was staged as exactly the two approved implementation files, committed and pushed.

The protected working-tree state after documentation closeout must remain:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in `LANE_STATE.md`;
- untracked: 29;
- deleted: 0.

The 29 protected untracked paths remain exactly those recorded in `LANE_STATE.md`. In particular, these explicitly non-queued paths remain untouched:

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
- Consolidated envelope: `LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, approved for all seven seams.
- `LAB-021-emergency-selection-contract`: `ready` and the only active parcel.
- LAB-022, LAB-023 and LAB-027: approved but sequence-blocked.
- Ready items: exactly one — LAB-021.

Program reported gate 45/45 passed, the approval decision committed and pushed, and its tree clean. No parallel or combined implementation is authorised.

LAB-022 is approved only under its ratified binary-composition policy: exactly two unique non-MERGED parents, immutable order-significant provenance, exactly matching photometric grids with no interpolation/resampling, and allocation/authority/approval/sealing outside the kernel. Duplicate or pre-composed parents, reordered or missing provenance, grid mismatch and governance-boundary crossings must fail closed.

LAB-017 remains governed by its approved version-1 envelope. Program retains all production allocation, live source reading, hosting, routing, persistence, authentication, CRM integration, deployment and endpoint ownership.

The next safe action is a standing-worker batch beginning with LAB-021. After each successful documentation closeout, that same worker immediately advances the next single eligible item and may complete up to five parcels total. It stops at the first seam, stale-state, gate, scope, empty-queue or human-observation boundary.

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

## Single reusable Lab standing-worker prompt

The following prompt is the single reusable Lab worker prompt. It must be retained verbatim in future replacements of this handoff. Do not create bespoke per-parcel worker prompts.

````text
STANDING WORKER — Lab & IES

Use only the connected CS Lab & IES v2 app. You are a worker, not the orchestrator.

You may complete up to FIVE consecutive parcels in one run. Parcels remain separate and sequential: one ready item, one feature checkpoint and one documentation closeout at a time. After a successful closeout, continue immediately to the next eligible parcel without waiting for Patrick.

1. Verify identity before changing anything:

   - Root: `C:\ControlStack_Worktrees\code-pilot-lab`
   - Branch: `lane/code-pilot-lab`
   - Gate: `lab-ies`

   Read the current HEAD from the repository. Do not trust a HEAD quoted in an older prompt or chat message. Stop if the root, branch or gate identity does not match.

2. Read every file under:

   `docs/_context/lanes/lab-ies/`

   Current repository evidence overrides stale historical statements.

3. Before the first queue item and again before every later item in the same run, compare the `Recorded branch HEAD` value in `LANE_STATE.md` with the actual current HEAD of `lane/code-pilot-lab`.

   If they do not match, stop parcel execution immediately. Reply exactly:

   `STOPPED - lane state is stale. Recorded HEAD <x>, actual HEAD <y>.`

   Then reconcile lane memory to the actual repository state before anything else. Classify whether the unmatched commit is a completed feature checkpoint, a documentation checkpoint, or an unexplained change; update the lane-memory evidence and queue truth accordingly; run the full `lab-ies` gate; and commit/push only the reconciled lane-memory files through the gated path. End the batch after reconciliation. Do not execute any queue item in the same worker run that discovered the mismatch.

   Because a Git commit cannot contain its own final hash, `LANE_STATE.md` uses one deliberate live synchronisation marker: immediately after every successful documentation commit and push, update `Recorded branch HEAD` in the working tree to that new actual HEAD and leave only that marker edit unstaged. This single unstaged lane-state marker is expected and must never be absorbed into a feature commit. Recheck it before the next parcel in the same batch.

4. Read `WORK_QUEUE.md` and take only the TOP item with:

   - `status: ready`; and
   - every listed dependency marked `done`.

   If no item qualifies, stop the batch and reply:

   `STOPPED - queue empty. Orchestrator decision needed.`

   If the selected item has `seam change: yes` and the required Program & Integrate approval is not recorded in the queue or decision log, stop the batch and reply:

   `STOPPED - seam approval required. Orchestrator decision needed.`

   Before changing any file, inspect the item's acceptance conditions and decide whether completion genuinely requires:

   - observation of the running application;
   - a browser action; or
   - judgement about real-world correctness that repository evidence alone cannot prove.

   If any of those is required, do not implement, stage, commit or mark the item `done`. Stop with exactly this shape and provide no more than three click-by-click steps:

   `NEEDS YOU`

   `What: <one plain sentence, no jargon.>`

   `Do:`

   `1. <exact click-by-click step>`

   `2. <exact click-by-click step>`

   `3. <exact click-by-click step, only if needed>`

   `Why: <one short line on what this unblocks.>`

   `Recommend: <what you would do if it were your call.>`

   Do not guess and do not treat repository evidence as a substitute for observed behaviour.

5. Execute ONLY the selected item's authorised files and honour every prohibition and acceptance condition. Do not widen the parcel. If an authorised file contains unrelated or unexplained behaviour that cannot be safely confined within the stated parcel, stop the batch immediately and report:

   `STOPPED - authorised file contains out-of-scope behaviour. Orchestrator decision needed.`

   Do not rewrite, absorb or stage the out-of-scope behaviour. This is a successful boundary outcome.

6. Preserve the intentionally dirty worktree:

   - do not clean, reset, restore, delete or move unrelated modified or untracked paths;
   - do not stage or commit anything outside the selected item's authorised files;
   - do not execute `scripts/clear_chaff.ps1`;
   - do not write to the donor root;
   - do not write to main, another lane or Selector-owned paths;
   - preserve every protected path recorded in `LANE_STATE.md` and `SESSION_HANDOFF.md`.

7. Run focused validation for the selected parcel where the connected app exposes it, then run the full `lab-ies` gate. If any focused, full or gated commit gate fails, stop the batch immediately. Do not continue to another parcel and do not mark the current item `done`. Report:

   `STOPPED - gate failed. Orchestrator decision needed.`

   Include the failed validation stage and preserve the exact working-tree and staged state. Do not bypass, weaken or reinterpret the gate.

8. Stage EXACTLY the selected item's authorised files. Confirm the staged set equals those files and nothing else.

9. Use the gated commit-and-push path with the exact commit subject recorded in the selected queue item's acceptance text. Push only `lane/code-pilot-lab`.

10. After the feature commit is pushed, update only these lane-memory files:

   - `docs/_context/lanes/lab-ies/LANE_STATE.md`
   - `docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md`
   - `docs/_context/lanes/lab-ies/SESSION_HANDOFF.md`
   - `docs/_context/lanes/lab-ies/WORK_QUEUE.md`

   Mark the completed item `done`, record its feature commit evidence, and set exactly one next eligible item to `ready`. Do not set a seam-change item to `ready` without its required recorded approval. Preserve this entire standing-worker prompt verbatim in `SESSION_HANDOFF.md`; never replace it with a bespoke parcel prompt.

11. Run the full `lab-ies` gate again, stage exactly the changed lane-memory files, then use the gated commit-and-push path for the documentation closeout. Push only `lane/code-pilot-lab`. If this gate or gated documentation commit fails, stop the batch under the gate-failure boundary and do not advance the queue. After a successful push, read the new actual HEAD, update only the `Recorded branch HEAD` marker in the working-tree copy of `LANE_STATE.md` to that exact value, and leave that one marker edit unstaged for the next parcel's preflight comparison.

12. Count the parcel as completed only after both the feature checkpoint and documentation closeout are pushed successfully.

   - If five parcels have completed in this run, stop and give one batch summary.
   - If fewer than five have completed, do not send a final reply and do not wait for Patrick. Return immediately to step 3, recheck the live HEAD marker, and take the next single eligible item.
   - Stop immediately at the first seam, stale-state, gate, scope, queue-empty or human-observation boundary, even if fewer than five parcels have completed.

13. Every final reply begins with exactly one of:

   - `AUTO - five-parcel batch completed on lane/code-pilot-lab. No action from Patrick.`
   - `SEND TO INTEGRATE - parcel ready for main. Patrick pastes this to Program & Integrate.`
   - `NEEDS YOU`
   - `STOPPED - <boundary>. Orchestrator decision needed.`

   Use `AUTO` when the five-parcel limit is reached without a boundary requiring Patrick or Integrate. Use `NEEDS YOU` only for the human-observation boundary and follow the exact `What / Do / Why / Recommend` shape in step 4. Use `STOPPED` for seam approval, stale state, gate failure, out-of-scope behaviour or queue empty. These are successful boundary outcomes. `AUTO` is lane-only and never means main.

14. The final batch report must state:

   - the live starting HEAD for the batch;
   - every queue item attempted, completed or stopped;
   - the exact feature files committed for each completed parcel;
   - focused and full gate results for each completed parcel;
   - every feature and documentation checkpoint subject;
   - confirmation that all pushes went only to `lane/code-pilot-lab`;
   - the exact stop reason or confirmation that the five-parcel limit was reached;
   - final staged, modified, untracked and deleted counts;
   - the next queue item and whether seam approval or human observation is required.
````
