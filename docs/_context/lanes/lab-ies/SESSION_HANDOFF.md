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
