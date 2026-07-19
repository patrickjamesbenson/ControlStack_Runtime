# Lab/IES Session Handoff

## Session purpose

This handoff records completed LAB-019 component projection, preserves the approved consolidated seam sequence, and authorises only LAB-020 as the single next runnable parcel.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Reusable prompt checkpoint: `1df62fccd91ac66509b02960ad988f6ef90c0b52`
- Starting HEAD for LAB-019: `9a8cce7f3963b999e8d495e5ff5b0f0c9bf224d8`
- Completed feature checkpoint: `6c835a01811d6cb5ddf6558ed7cd65782403687b`
- Feature subject: `lab: checkpoint component projection contract`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`
- Consolidated seam envelope: `docs/_context/lanes/lab-ies/LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, approved unchanged for LAB-019 and LAB-020
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`

## Branch-HEAD guard

Before queue selection, the worker compares `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops implementation, produces the exact stale-state reply, and requires memory-only reconciliation plus the full gate. The worker must not execute a queue item in the same run that discovered the mismatch.

After every documentation push, only the `Recorded branch HEAD` field is refreshed in the working tree to the new actual HEAD and left unstaged. This deliberate marker avoids the impossible requirement for a commit to contain its own final hash and detects a worker ending between feature and documentation commits.

## Completed queue item

`LAB-019-component-projection-contract` is complete.

Exactly these two feature files were committed:

```text
packages/lab-kernel/ies-toolkit/nvbComponents.js
tests/lab-kernel/nvbComponents.test.js
```

The module now exposes only the approved version-1 component-catalogue projection contract. Board rows group by exact family, LED-chip and vendor identity; CCT values are canonicalised and sorted numeric-first; tunable state follows only the approved second-CCT or multi-channel rules; and platform scalar conflicts fail closed rather than using first-row wins.

Drivers deduplicate only by exact model, optics require unique exact BOM IDs, outputs are deeply immutable and source rows remain unchanged. No loader, embedded catalogue, RuntimeData/database reader, copied Program reader, persistence, browser storage, clock, random, HTML, fixture, document-register, Program, Runtime, Engine or Selector implementation was changed.

## Validation evidence

- Focused changed-file `lab-ies` execution: 191/191 passed.
- Independent full `lab-ies` gate: 191/191 passed.
- Gated feature commit execution: 191/191 passed.
- Feature checkpoint push: confirmed on origin `lane/code-pilot-lab`.
- Failed, cancelled, skipped and todo counts were zero.

## Git and protected worktree state

The feature parcel was staged as exactly the two approved implementation files, committed and pushed.

The protected working-tree state after documentation closeout must remain:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in `LANE_STATE.md`;
- untracked: 30;
- deleted: 0.

The 30 protected untracked paths remain exactly those recorded in `LANE_STATE.md`. In particular, these explicitly non-queued paths remain untouched:

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
- Consolidated envelope: `LAB-018_023_027_BATCH_SEAM_ENVELOPE.md`, version 1, approved for all seven seams.
- `LAB-020-document-register-contract`: `ready` and the only active parcel.
- LAB-021, LAB-022, LAB-023 and LAB-027: approved but sequence-blocked.
- Ready items: exactly one — LAB-020.

Program reported gate 45/45 passed, the approval decision committed and pushed, and its tree clean. No parallel or combined implementation is authorised.

LAB-022 is approved only under its ratified binary-composition policy: exactly two unique non-MERGED parents, immutable order-significant provenance, exactly matching photometric grids with no interpolation/resampling, and allocation/authority/approval/sealing outside the kernel. Duplicate or pre-composed parents, reordered or missing provenance, grid mismatch and governance-boundary crossings must fail closed.

LAB-017 remains governed by its approved version-1 envelope. Program retains all production allocation, live source reading, hosting, routing, persistence, authentication, CRM integration, deployment and endpoint ownership.

The next safe action is one bounded worker execution of LAB-020 only. Later approved parcels remain held until the active parcel is completed and closed out.

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
- no implementation other than the single active LAB-020 parcel; LAB-021, LAB-022, LAB-023 and LAB-027 remain sequence-blocked until active-parcel closeout;
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

1. Verify identity before changing anything:

   - Root: `C:\ControlStack_Worktrees\code-pilot-lab`
   - Branch: `lane/code-pilot-lab`
   - Gate: `lab-ies`

   Read the current HEAD from the repository. Do not trust a HEAD quoted in an older prompt or chat message. Stop if the root, branch or gate identity does not match.

2. Read every file under:

   `docs/_context/lanes/lab-ies/`

   Current repository evidence overrides stale historical statements.

3. Before taking any queue item, compare the `Recorded branch HEAD` value in `LANE_STATE.md` with the actual current HEAD of `lane/code-pilot-lab`.

   If they do not match, do not start implementation. Reply exactly:

   `STOPPED - lane state is stale. Recorded HEAD <x>, actual HEAD <y>.`

   Then reconcile lane memory to the actual repository state before anything else. Classify whether the unmatched commit is a completed feature checkpoint, a documentation checkpoint, or an unexplained change; update the lane-memory evidence and queue truth accordingly; run the full `lab-ies` gate; and commit/push only the reconciled lane-memory files through the gated path. Do not execute a queue item in the same worker run that discovered the mismatch.

   Because a Git commit cannot contain its own final hash, `LANE_STATE.md` uses one deliberate live synchronisation marker: immediately after every successful documentation commit and push, update `Recorded branch HEAD` in the working tree to that new actual HEAD and leave only that marker edit unstaged. This single unstaged lane-state marker is expected and must never be absorbed into a feature commit. A future mismatch therefore means the lane advanced without its marker being refreshed or the committed lane memory is otherwise stale.

4. Read `WORK_QUEUE.md` and take only the TOP item with:

   - `status: ready`; and
   - every listed dependency marked `done`.

   If no item qualifies, reply:

   `STOPPED - queue empty. Orchestrator decision needed.`

   If the selected item has `seam change: yes` and the required Program & Integrate approval is not recorded in the queue or decision log, reply:

   `STOPPED - seam approval required. Orchestrator decision needed.`

5. Execute ONLY the selected item's authorised files and honour every prohibition and acceptance condition. Do not widen the parcel. If an authorised file contains unrelated or unexplained behaviour that cannot be safely confined within the stated parcel, stop and report it rather than rewriting or absorbing it.

6. Preserve the intentionally dirty worktree:

   - do not clean, reset, restore, delete or move unrelated modified or untracked paths;
   - do not stage or commit anything outside the selected item's authorised files;
   - do not execute `scripts/clear_chaff.ps1`;
   - do not write to the donor root;
   - do not write to main, another lane or Selector-owned paths;
   - preserve every protected path recorded in `LANE_STATE.md` and `SESSION_HANDOFF.md`.

7. Run focused validation for the selected parcel where the connected app exposes it, then run the full `lab-ies` gate. The full gate must pass before any feature commit.

8. Stage EXACTLY the selected item's authorised files. Confirm the staged set equals those files and nothing else.

9. Use the gated commit-and-push path with the exact commit subject recorded in the selected queue item's acceptance text. Push only `lane/code-pilot-lab`.

10. After the feature commit is pushed, update only these lane-memory files:

   - `docs/_context/lanes/lab-ies/LANE_STATE.md`
   - `docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md`
   - `docs/_context/lanes/lab-ies/SESSION_HANDOFF.md`
   - `docs/_context/lanes/lab-ies/WORK_QUEUE.md`

   Mark the completed item `done`, record its feature commit evidence, and set exactly one next eligible item to `ready`. Do not set a seam-change item to `ready` without its required recorded approval. Preserve this entire standing-worker prompt verbatim in `SESSION_HANDOFF.md`; never replace it with a bespoke parcel prompt.

11. Run the full `lab-ies` gate again, stage exactly the changed lane-memory files, then use the gated commit-and-push path for the documentation closeout. Push only `lane/code-pilot-lab`. After the push succeeds, read the new actual HEAD, update only the `Recorded branch HEAD` marker in the working-tree copy of `LANE_STATE.md` to that exact value, and leave that one marker edit unstaged for the next worker's preflight comparison.

12. Every final reply begins with exactly one of:

   - `AUTO - gate passed, parcel committed to lane/code-pilot-lab. Continuing. No action from Patrick.`
   - `SEND TO INTEGRATE - parcel ready for main. Patrick pastes this to Program & Integrate.`
   - `NEEDS YOU - <one-line action for Patrick>`
   - `STOPPED - <boundary>. Orchestrator decision needed.`

   Use `NEEDS YOU` only when Patrick must physically do something. Progress notes must be one plain line without the `NEEDS YOU` label. `AUTO` is lane-only and never means main. A genuine `STOPPED` is a successful boundary result.

13. The final report must state:

   - the live starting HEAD;
   - the selected queue item;
   - the exact feature files committed;
   - focused and full gate results;
   - the feature and documentation checkpoint subjects;
   - confirmation that both pushes went only to `lane/code-pilot-lab`;
   - final staged, modified, untracked and deleted counts;
   - the next queue item and whether any seam approval is required.
````
