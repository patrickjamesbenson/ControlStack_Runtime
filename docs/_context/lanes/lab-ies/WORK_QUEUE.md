# Lab/IES Work Queue

## Operating model

- This file controls worker parcel selection. Bespoke parcel prompts are retired.
- The orchestrator writes and orders items, reviews `STOPPED` reports, obtains Integrate approval for seam changes, and decides when work is ready for main.
- A worker takes only the top `ready` item whose dependency is `done`.
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- The worktree is intentionally dirty. Preserve all unrelated modified and untracked paths.
- Use `repo_green_commit_push` only after proving the staged set exactly equals the item's authorised files. Shared-tooling repair: `2e4d880`. Direct `repo_git_commit` remains guarded.
- Push only `lane/code-pilot-lab`; never write to main, another lane, or the read-only donor `C:\ControlStack_Lab`.
- The Selector leak paths must remain absent:
  - `packages/workspace-kernel/selectorReferenceOptionsService.js`
  - `tests/selectorCascadeCorrectness.test.js`

## Reply status

Every orchestrator and worker reply begins with one of:

- `AUTO - gate passed, parcel committed to lane/code-pilot-lab. Continuing. No action from Patrick.`
- `SEND TO INTEGRATE - parcel ready for main. Patrick pastes this to Program & Integrate.`
- `NEEDS YOU - <one-line action for Patrick>`
- `STOPPED - <boundary>. Orchestrator decision needed.`

`AUTO` is lane-only, never main. A genuine `STOPPED` is a successful boundary result.

## Queue

### Q-0 Reference-driven IES generation
- id: LAB-010-reference-driven-generation
- objective: Materialise deterministic LM-63 output from the committed sealed one-millimetre reference DTO.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/iesFromReference.js`
  - `tests/lab-kernel/iesFromReference.test.js`
- prohibitions:
  - no project workflow;
  - no `iesMerge.js`;
  - no UI/HTML/CSS;
  - no keyword migration test;
  - no persistence seam.
- acceptance: Fixed sealed-reference validation, fail-closed deterministic generation, immutable inputs, canonical keywords and full gate are proven; exact files are committed and pushed.
- gate: lab-ies
- depends on: none
- on success next: LAB-011-project-ies-generation
- seam change: no
- status: done

Evidence: `bda7d61aaa037ea6a828f40d94ead77949ae7439`, confirmed on origin.

### Q-1 Project IES generation
- id: LAB-011-project-ies-generation
- objective: Replace the legacy rich-authority project builder with a deterministic project adapter over the committed sealed-reference generator.
- authorised files:
  - `packages/lab-kernel/ies-toolkit/iesProjectIes.js`
  - `tests/lab-kernel/iesProjectIes.test.js`
- prohibitions:
  - no changes to `iesFromReference.js` or any completed dependency;
  - no `iesMerge.js`;
  - no UI/HTML/CSS;
  - no `tests/lab-kernel/iesKeywordMigration.test.js`;
  - no rich private authority input, raw working bytes or diagnostic fingerprints;
  - no filesystem, network or browser-storage persistence;
  - no new or changed cross-lane API, runtime route or Selector integration;
  - no unrelated export, merge, normalisation, provenance-publication or generator work.
- acceptance: The module consumes the committed sealed reference DTO, delegates core materialisation to the committed reference-driven generator, does not mutate inputs, fails closed on malformed or unsupported project input, emits deterministic project provenance bound to reference identity and `referenceSha256`, preserves canonical keywords, scales length/candela/owned watts consistently, has focused success/rejection/determinism/no-persistence coverage, and has no committed non-Lab caller affected; otherwise STOP as a seam boundary. Full `lab-ies` passes and exactly the two authorised files are committed as `lab: checkpoint project IES generation` and pushed only to the lane branch.
- gate: lab-ies
- depends on: LAB-010-reference-driven-generation
- on success next: none
- seam change: no
- status: done

Evidence: `a21429528fd6bf50ef4b7b8fcbf0abe54d682b46`, confirmed on origin. No subsequent queue item is present.
