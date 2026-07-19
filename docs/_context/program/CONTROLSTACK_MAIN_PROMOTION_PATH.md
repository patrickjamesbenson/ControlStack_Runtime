# ControlStack Main Promotion Path

Status: ACTIVE PROGRAM POLICY  
Owner: Program & Integrate  
Applies to: every `lane/*` feature branch

## 1. Promotion mechanism and authority

A feature lane reaches `main` through a pull request from its pushed `lane/*` branch into `main`.

The owning lane prepares, tests, commits and pushes its bounded parcel. Program & Integrate then verifies the supplied evidence, creates or updates the pull request when tooling permits, and executes the final merge into `main`.

Published lane branches are not rebased as the normal promotion method. Program may refresh a promotion candidate by merging current `main` into the lane or by using a temporary integration branch when conflict isolation is required. Force-push is not part of the accepted path.

No feature lane writes, commits, pushes or merges directly to `main`. Only Program & Integrate performs the final main-branch promotion.

## 2. Required evidence before merge

Program & Integrate requires all of the following for the exact candidate commit:

- repository root, lane branch and candidate commit hash;
- exact committed file set and confirmation that no unrelated path was staged or absorbed;
- the required lane gate passing at the candidate commit;
- relevant focused tests passing, with counts or command receipts;
- whitespace and conflict-marker checks passing where applicable;
- confirmation that the lane branch was pushed successfully;
- a current lane handoff describing completed work, residual dirty work and known blockers;
- any affected contract, migration, runtime or seam evidence required by the parcel;
- a reviewable diff whose scope matches the commissioned parcel.

A deliberately dirty lane worktree is acceptable when the candidate commit contains the exact declared staged set and all unrelated modified or untracked paths remain untouched and unstaged.

## 3. Cadence

Promotion is checkpoint-driven, not continuous and not automatic.

Program reviews candidates after each accepted bounded checkpoint and normally groups compatible promotions into the next available Program integration window. A lane may continue producing later checkpoints on its own branch, but no checkpoint is considered present on `main` until Program records and executes its promotion.

Urgent promotion outside the normal integration window requires an explicit Program decision and the same evidence standard; urgency does not waive gates or scope controls.

## 4. Refusal criteria

Program & Integrate refuses or defers promotion when any of the following applies:

- the candidate branch, root or commit identity is missing or does not match the supplied evidence;
- the lane gate or relevant focused tests are not green at the candidate commit;
- the committed file set contains unrelated, unexplained, donor, cross-lane or generated-noise changes;
- the expected parcel is not pushed or the remote candidate cannot be resolved;
- required handoff, contract, migration or runtime evidence is absent;
- the diff changes an unstable seam without explicit acceptance from the owning lanes;
- the pull request contains unresolved conflicts or has become stale against `main`;
- promotion would require direct feature-lane writes to `main`, force-push, cleaning protected work or bypassing a repository guard;
- the candidate depends on an unmerged prerequisite or would place `main` in a knowingly incomplete state.

The refusal record must identify the blocker and its owner: the feature lane for parcel defects, Program & Integrate for integration tooling or ordering defects, and the relevant seam owners for cross-lane contract decisions.

## 5. Conflict handling

Program does not resolve semantic feature conflicts by guesswork.

When a conflict exists, Program first classifies it as mechanical or semantic:

- Mechanical conflicts may be resolved by Program in a temporary integration branch or through an authorised merge of current `main` into the feature lane, preserving both intended changes.
- Semantic conflicts are returned to the owning lane or seam owners with the conflicting files and required decision. The repaired candidate must be recommitted, pushed and fully regated before promotion resumes.

After any conflict resolution, Program reruns the affected main/integration gates and verifies the final diff before merging. No conflict is resolved by deleting protected work, resetting another worktree, staging unrelated files or force-pushing a shared lane branch.

## 6. Execution capability required

The Program connection executing a promotion must expose all of the following without weakening lane isolation:

- read access to the pushed source lane and exact candidate commit;
- read access to the target `main` state and candidate diff;
- a supported pull-request create/update and merge operation, or an authorised dedicated integration worktree with fetch, merge and push-to-`main` capability;
- the ability to run the required integrated-state gates before finalising the promotion;
- branch protections that permit `main` writes only from the Program promotion authority.

A connection confined to `lane/program-integrate` with only current-worktree stage, commit and push operations cannot execute this policy. It may assess durable evidence available inside its root, but it cannot independently resolve the source candidate, create or merge the pull request, or write `main`. Program must stop rather than imitate promotion by copying files, committing feature content onto `lane/program-integrate`, or weakening root and branch guards.

## 7. Completion record

A promotion is complete only when Program & Integrate records:

- the source lane and promoted commit;
- the resulting `main` commit or merged pull request;
- the final gates run against the integrated state;
- any follow-on activation or runtime verification still required;
- any residual blocker and its owner.
