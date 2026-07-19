# Lab/IES Session Handoff

## Session purpose

This handoff records completion of LAB-017 under the approved version-1 seam envelope, the permanent branch-HEAD guard, and the next blocked queue boundary.

## Identity

- App: `ControlStack Lab and IES Authority Lane`
- Lane: `lab-ies`
- Root: `C:\ControlStack_Worktrees\code-pilot-lab`
- Branch: `lane/code-pilot-lab`
- Gate: `lab-ies`
- Reusable prompt checkpoint: `1df62fccd91ac66509b02960ad988f6ef90c0b52`
- Starting HEAD for LAB-017: `09ac99cb35b6af45696b4c83e0051a1651bb2f14`
- Completed feature checkpoint: `2333c1197abf898e7a680455f99918823cb76e30`
- Feature subject: `lab: checkpoint reference resolver contract`
- Feature checkpoint confirmed on origin `lane/code-pilot-lab`
- LAB-017 seam-envelope checkpoint: `f927ced1ca77c8b11ef8b13b9d6bb3833618844c`
- LAB-017 approval checkpoint: `09ac99cb35b6af45696b4c83e0051a1651bb2f14`
- Seam envelope: `docs/_context/lanes/lab-ies/LAB-017_SEAM_ENVELOPE.md`, version 1, approved unchanged
- Branch-HEAD guard checkpoint: `6d34e500d407d5335e5eebb317636a67a5e98618`

## Branch-HEAD guard

Before queue selection, the worker compares `LANE_STATE.md`'s `Recorded branch HEAD` with the actual branch HEAD. A mismatch stops implementation, produces the exact stale-state reply, and requires memory-only reconciliation plus the full gate. The worker must not execute a queue item in the same run that discovered the mismatch.

After every documentation push, only the `Recorded branch HEAD` field is refreshed in the working tree to the new actual HEAD and left unstaged. This deliberate marker avoids the impossible requirement for a commit to contain its own final hash and detects a worker ending between feature and documentation commits.

## Completed queue item

`LAB-017-reference-resolver-contract` is complete.

Exactly these two feature files were committed:

```text
packages/lab-kernel/ies-toolkit/nvbReference.js
tests/lab-kernel/nvbReference.test.js
```

The module now exposes only the approved version-1 identity, resolver-path and evidence-readiness contract. Outputs are deterministic and deeply immutable; malformed identities, unsafe paths, unsupported route kinds and conflicting evidence fail closed. Emergency and EWIS assembly verification remain `null` and independent.

No host, route, storage, allocation, persistence, authentication, deployment, endpoint, HTML, fixture, Program, Runtime, Engine or Selector implementation was changed. The named legacy Lab prototypes remain protected and may be temporarily incompatible until their later queue parcels.

## Validation evidence

- Focused changed-file `lab-ies` execution: 169/169 passed.
- Independent full `lab-ies` gate: 169/169 passed.
- Gated feature commit execution: 169/169 passed.
- Feature checkpoint push: confirmed on origin `lane/code-pilot-lab`.
- Failed, cancelled, skipped and todo counts were zero.

## Git and protected worktree state

The feature parcel was staged as exactly the two approved implementation files, committed and pushed.

The protected working-tree state after documentation closeout must remain:

- staged: 0;
- modified: 1 — only the unstaged `Recorded branch HEAD` synchronisation marker in `LANE_STATE.md`;
- untracked: 32;
- deleted: 0.

The 32 protected untracked paths remain exactly those recorded in `LANE_STATE.md`. In particular, these explicitly non-queued paths remain untouched:

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
- `LAB-017-reference-resolver-contract`: `done`.
- Next ordered item: `LAB-018-nvb-resolution-contract`.
- LAB-018 status: `blocked` pending its separate Program & Integrate seam approval.
- Ready items: none.

LAB-017 remains governed by the approved version-1 envelope. Program retains production allocation, resolver hosting, routing, persistence, authentication, deployment and endpoint ownership. Any change to that envelope requires a new seam decision.

The next safe action is Program & Integrate review of LAB-018's own seam envelope before any worker starts it.

## Prohibited actions retained

- no LAB-017 change outside the recorded version-1 approval without a new seam decision;
- no reverse-authority reconstruction, legacy alternative reference schema, diagnostic authority identity or unsafe governed path;
- no public resolver route, server implementation, HTML, fixture, Selector or Program ownership absorbed into the Lab contract;
- no LAB-018 implementation before its separate seam approval is recorded;
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
