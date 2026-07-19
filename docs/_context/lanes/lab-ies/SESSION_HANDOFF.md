# Lab/IES Session Handoff

## Session purpose

This handoff records completion of standing-worker queue item `LAB-011-project-ies-generation`.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Starting HEAD: `4a5b10171ba19b1262d416f58d67caf11e2c9b45`
- Completed feature checkpoint: `a21429528fd6bf50ef4b7b8fcbf0abe54d682b46`
- Feature subject: `lab: checkpoint project IES generation`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`

## Completed queue item

`LAB-011-project-ies-generation` is complete.

Exactly these implementation/test files were committed:

```text
packages/lab-kernel/ies-toolkit/iesProjectIes.js
tests/lab-kernel/iesProjectIes.test.js
```

The project builder now:

- preserves the existing `buildProjectIes(reference, runLengthMm, project)` entry point;
- consumes only the committed sealed reference DTO through `buildIesFromReference`;
- validates a bounded project envelope and rejects unsupported values;
- requires a project identity;
- delegates LM-63 materialisation, canonical keywords, length, candela, lumen and owned-watt scaling to the committed generator;
- replaces only generator provenance with deterministic project provenance bound to project identity, reference identity, reference kind and `referenceSha256`;
- does not mutate input;
- exposes no persistence, private rich-authority, merge or cross-lane implementation seam.

No committed non-Lab caller was affected. The only additional caller found was the protected untracked `labbench.html` prototype, which was not changed.

## Test and gate evidence

The connected app exposes the fixed `lab-ies` gate rather than a standalone arbitrary focused-test runner.

- Initial changed-file execution: 159 tests, 158 passed, 1 failed.
- The failure was the existing canonical migration guard requiring the active project generator source to use `CANONICAL_KEYWORDS`.
- The authorised adapter was corrected; the prohibited migration test was not changed.
- Focused `iesProjectIes.test.js` coverage: 5 tests, all passed within the changed-file execution.
- Corrected changed-file execution: 159/159 passed.
- Full `lab-ies` gate: 159/159 passed.
- Gated commit execution: 159/159 passed.

## Git and protected worktree state

The feature parcel was staged as exactly the two authorised files, committed and pushed.

Feature-checkpoint post-push state was:

- staged: 0;
- modified: 2;
- untracked: 37;
- deleted: 0.

The two modified paths were the pre-existing lane handoff and `packages/lab-kernel/ies-toolkit/summary.html`. This handoff is intentionally replaced by the required lane-memory closeout. After that closeout is committed, the protected dirty state is expected to remain:

```text
 M packages/lab-kernel/ies-toolkit/summary.html
```

plus the same 37 protected untracked paths. No protected implementation, prototype or support path was cleaned, reset, restored, deleted, moved, staged or absorbed.

The Selector-owned paths remained absent from the dirty inventory and were not touched:

```text
packages/workspace-kernel/selectorReferenceOptionsService.js
tests/selectorCascadeCorrectness.test.js
```

## Queue state and next action

`WORK_QUEUE.md` marks both `LAB-010` and `LAB-011` done. No subsequent queue item is present, so no item can be set ready.

The exact next safe action is:

```text
STOPPED - queue empty. Orchestrator decision needed.
```

The orchestrator must add and authorise a new queue item before another standing worker acts.

## Prohibited actions retained

- no work outside a future queue item's authorised files;
- no merge, normalisation, generator, UI, provenance-publication or cross-lane widening without explicit queue authority;
- no reset, restore, clean, deletion or movement of protected dirty paths;
- no execution of `scripts/clear_chaff.ps1`;
- no donor write;
- no main or other-lane write;
- no Selector changes.
