# Lab/IES Session Handoff

## Session purpose

This handoff records completion of standing-worker queue item `LAB-015-ugr-surface` and the exact next safe action.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Starting HEAD: `8c4f7f94ce6eb642ee4a079247e737e914e82194`
- Completed feature checkpoint: `56c8921d92d324701605d03aa7368646e4d4e063`
- Feature subject: `lab: checkpoint UGR surface`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`

## Completed queue item

`LAB-015-ugr-surface` is complete.

Exactly this feature file was committed:

```text
packages/lab-kernel/ies-toolkit/ugr.html
```

The surface now provides a deterministic Lab-only presentation over the committed UGR modules. It delegates parsing, CIE 190 table calculation and result rendering; contains no calculation implementation; reads uploaded IES content in memory only; reports invalid input visibly; and explicitly states that rendered output is not an approved or sealed reference.

Verification wording is limited to the committed CIE 190 worked-example regression evidence. No production UGR module, authority contract, project-generation path, persistence route, network route or cross-lane implementation was changed.

## Validation evidence

- Focused changed-file `lab-ies` execution: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated feature commit execution: 159/159 passed.
- Failed, cancelled, skipped and todo counts were zero.

## Git and protected worktree state

The feature parcel was staged as exactly the sole authorised file, committed and pushed.

The final protected working-tree state after documentation closeout must remain:

- staged: 0;
- modified: 0;
- untracked: 34;
- deleted: 0.

The 34 protected untracked paths remain exactly those recorded in `LANE_STATE.md`. In particular, these explicitly non-queued paths remain untouched:

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

- `LAB-015-ugr-surface`: `done`.
- Declared `on success next`: `LAB-016-nvb-offline-fixtures`.
- `LAB-016-nvb-offline-fixtures`: `ready`, because it has no dependencies and requires no owner or Program & Integrate seam approval.

The exact next safe action is to run a new standing worker against only `LAB-016-nvb-offline-fixtures` and these authorised files:

```text
packages/lab-kernel/ies-toolkit/nvb/board_platforms.json
packages/lab-kernel/ies-toolkit/nvb/derived_resolution.json
packages/lab-kernel/ies-toolkit/nvb/drivers_unique.json
packages/lab-kernel/ies-toolkit/nvb/lab_form.json
packages/lab-kernel/ies-toolkit/nvb/optics.json
packages/lab-kernel/ies-toolkit/nvb/spec_codes.json
packages/lab-kernel/ies-toolkit/nvb/systems.json
```

No subsequent item was executed in this session.

## Prohibited actions retained

- no work outside the next queue item's authorised files;
- no claim that offline fixtures are the live RuntimeData authority source;
- no production database path, credential, JavaScript, HTML or resolver change during LAB-016;
- no replacement of the locked 16-field Lab form;
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

3. Read `WORK_QUEUE.md` and take only the TOP item with:

   - `status: ready`; and
   - every listed dependency marked `done`.

   If no item qualifies, reply:

   `STOPPED - queue empty. Orchestrator decision needed.`

   If the selected item has `seam change: yes` and the required Program & Integrate approval is not recorded in the queue or decision log, reply:

   `STOPPED - seam approval required. Orchestrator decision needed.`

4. Execute ONLY the selected item's authorised files and honour every prohibition and acceptance condition. Do not widen the parcel. If an authorised file contains unrelated or unexplained behaviour that cannot be safely confined within the stated parcel, stop and report it rather than rewriting or absorbing it.

5. Preserve the intentionally dirty worktree:

   - do not clean, reset, restore, delete or move unrelated modified or untracked paths;
   - do not stage or commit anything outside the selected item's authorised files;
   - do not execute `scripts/clear_chaff.ps1`;
   - do not write to the donor root;
   - do not write to main, another lane or Selector-owned paths;
   - preserve every protected path recorded in `LANE_STATE.md` and `SESSION_HANDOFF.md`.

6. Run focused validation for the selected parcel where the connected app exposes it, then run the full `lab-ies` gate. The full gate must pass before any feature commit.

7. Stage EXACTLY the selected item's authorised files. Confirm the staged set equals those files and nothing else.

8. Use the gated commit-and-push path with the exact commit subject recorded in the selected queue item's acceptance text. Push only `lane/code-pilot-lab`.

9. After the feature commit is pushed, update only these lane-memory files:

   - `docs/_context/lanes/lab-ies/LANE_STATE.md`
   - `docs/_context/lanes/lab-ies/EVIDENCE_INDEX.md`
   - `docs/_context/lanes/lab-ies/SESSION_HANDOFF.md`
   - `docs/_context/lanes/lab-ies/WORK_QUEUE.md`

   Mark the completed item `done`, record its feature commit evidence, and set exactly one next eligible item to `ready`. Do not set a seam-change item to `ready` without its required recorded approval. Preserve this entire standing-worker prompt verbatim in `SESSION_HANDOFF.md`; never replace it with a bespoke parcel prompt.

10. Run the full `lab-ies` gate again, stage exactly the changed lane-memory files, then use the gated commit-and-push path for the documentation closeout. Push only `lane/code-pilot-lab`.

11. Every final reply begins with exactly one of:

   - `AUTO - gate passed, parcel committed to lane/code-pilot-lab. Continuing. No action from Patrick.`
   - `SEND TO INTEGRATE - parcel ready for main. Patrick pastes this to Program & Integrate.`
   - `NEEDS YOU - <one-line action for Patrick>`
   - `STOPPED - <boundary>. Orchestrator decision needed.`

   Use `NEEDS YOU` only when Patrick must physically do something. Progress notes must be one plain line without the `NEEDS YOU` label. `AUTO` is lane-only and never means main. A genuine `STOPPED` is a successful boundary result.

12. The final report must state:

   - the live starting HEAD;
   - the selected queue item;
   - the exact feature files committed;
   - focused and full gate results;
   - the feature and documentation checkpoint subjects;
   - confirmation that both pushes went only to `lane/code-pilot-lab`;
   - final staged, modified, untracked and deleted counts;
   - the next queue item and whether any seam approval is required.
````
