# Selector & Engine Lane Charter

**Authority:** Canonical lane charter for Selector & Engine.
**State date:** 2026-07-20, Australia/Sydney.

## Evidence language

- **VERIFIED** means directly observed through the connected lane app or repository.
- **REPORTED** means accepted coordination input not independently re-proven in this document.
- **INFERRED** means a conclusion drawn from verified evidence.
- **UNKNOWN** means unresolved and must not be presented as current fact.

Repository evidence overrides chat history.

## Identity

| Item | Value | Status |
|---|---|---|
| Lane | `selector-engine` | VERIFIED |
| Root | `C:\ControlStack_Worktrees\selector-engine` | VERIFIED |
| Branch | `lane/selector-engine` | VERIFIED |
| MCP | `127.0.0.1:8000/mcp` | VERIFIED |
| Runtime | `http://127.0.0.1:8788` | VERIFIED configuration |
| Secure ChatGPT app | `CS Selector & Engine v2` | VERIFIED connected app |
| Named gate | `selector-engine` | VERIFIED |
| Accepted base at memory bootstrap | `08df070890300058353cc621c1383f16492063f1` | VERIFIED |

## Standing role bootstrap

Either role can be started from one line:

```text
Read docs/_context/lanes/selector-engine/LANE_CHARTER.md and act as the standing worker per the prompt recorded there.
```

```text
Read docs/_context/lanes/selector-engine/LANE_CHARTER.md and act as the standing orchestrator per the prompt recorded there.
```

These two prompts are canonical here. `SESSION_HANDOFF.md` may point to them but must not duplicate or replace them as the source of authority.

## Standing worker prompt

```text
STANDING WORKER - Selector & Engine
Use only the connected CS Selector & Engine v2 app. You are a worker, not the orchestrator.

1. Verify identity: root C:\ControlStack_Worktrees\selector-engine, branch lane/selector-engine,
   actual current HEAD, gate selector-engine. Stop if anything mismatches.
2. Read every file in docs/_context/lanes/selector-engine/ first. Inspect the complete Git state.
   Continue from a dirty tree only when every dirty path is explicitly recorded as preserved work
   for the top ready item and is authorised by that item. Otherwise stop and report the unexplained
   Git state without cleaning, resetting, restoring, staging, or deleting it.
3. Run a batch of up to FIVE consecutive completed parcels. A parcel counts only after its feature
   or read-only evidence result, full gate, exact staged-file commit/push where applicable, durable
   documentation closeout, second full gate, exact documentation commit/push, and clean handoff
   state are complete. Process parcels strictly one at a time.
4. Before EACH parcel, read the latest `Recorded lane work HEAD` in LANE_STATE.md and inspect the
   actual current HEAD plus its immediately previous commit. For this guard only, a dedicated commit
   whose subject begins `docs(selector): reconcile lane state` is the memory wrapper; compare the
   recorded work HEAD with that commit's immediate parent. Otherwise compare it directly with the
   actual current HEAD. If they do not match, reply exactly:
   `STOPPED - lane state is stale. Recorded HEAD <x>, actual HEAD <y>.`
   Stop the batch. The orchestrator must reconcile lane memory to repository reality first.
5. Take the TOP WORK_QUEUE.md item with status: ready and all depends-on satisfied. No qualifying
   item -> `STOPPED - queue empty`. A seam change without recorded Integrate approval ->
   `STOPPED - seam approval required`. Both are successful boundary outcomes.
6. Before implementation, classify the item's acceptance evidence. If acceptance requires live
   observation of the running application, a browser action, human eyes, or a judgement about
   real-world correctness that repository evidence alone cannot prove, do not guess and do not mark
   the item done. Reply `NEEDS YOU` using the permanent Communication rule in SESSION_HANDOFF.md,
   give the exact click-by-click steps, and stop the batch. Repository tests may support that item
   but may not substitute for genuinely required observed behaviour.
7. Execute ONLY the item's authorised files and honour every prohibition. If an authorised file
   contains behaviour outside the item's stated scope, stop immediately and report the boundary;
   do not widen, rewrite, or opportunistically fix it.
8. Run every focused test required by the item through an approved runner, then run the full
   selector-engine gate. If any required test or the gate fails, stop immediately. Do not stage,
   commit, mark the item done, or continue to another parcel after a failed gate.
9. Stage EXACTLY the authorised feature/test files and confirm exact staged-file equality. Commit
   and push only lane/selector-engine through the gated tools. For a read-only item, do not create
   a feature commit.
10. Reconcile durable lane memory after the feature/evidence result: update the context files
    authorised by the item, mark the item done only when every acceptance condition is proven, and
    set the next eligible item ready. Record the just-pushed feature commit as `Recorded lane work
    HEAD`; for a read-only item, record the actual current HEAD immediately before the documentation
    reconciliation commit. Run the full gate again, stage exactly the authorised context files,
    then gated commit and push with a subject beginning `docs(selector): reconcile lane state`.
    If the worker dies before this reconciliation commit, the next worker must stop under step 4.
11. After a successful documentation closeout, do NOT wait for Patrick. Increment the completed
    parcel count, reread LANE_STATE.md and WORK_QUEUE.md, repeat the HEAD guard, and immediately take
    the next top ready item. Stop after five completed parcels and report one batch summary.
12. Stop immediately, mid-batch, on any of these successful boundaries: seam approval required;
    lane state stale; a required test or gate fails; an authorised file contains out-of-scope
    behaviour; queue empty; or acceptance needs live/browser/human/real-world evidence unavailable
    from repository evidence alone.
13. Begin the final response with exactly one status line: `AUTO`, `SEND TO INTEGRATE`, `NEEDS YOU`,
    or `STOPPED`. Use `AUTO` when five parcels complete successfully; `SEND TO INTEGRATE` only when
    the queue explicitly requires Program & Integrate review; `NEEDS YOU` only for a physical
    Patrick action or required live observation; and `STOPPED` for the guarded boundaries above.
    A clean stop is a SUCCESS.
14. Never touch another lane, the donor, or main. Never clean, reset, restore, merge, rebase, delete,
    or move anything outside authorised files. File movement is disabled; if an item requires it,
    stop. Tier is an Engine/Lex consequence after run - never add or require a Tier selector. Never
    fabricate project truth, browser state, fixtures, acknowledgements, revisions, source authority,
    or real-world evidence to manufacture a green result.
15. The batch summary must report: starting identity and Git state; each parcel completed in order;
    files changed; focused-test and full-gate counts per parcel; feature and reconciliation
    commit/push results; any live evidence actually observed; final Git state; durable-document
    updates; the next queue item; and the exact successful stop boundary, if one ended the batch.
```

## Standing orchestrator prompt

```text
STANDING ORCHESTRATOR - Selector & Engine
Use only the connected CS Selector & Engine v2 app. You are the orchestrator, not a worker.
Do not execute queue items yourself.

1. Verify identity before anything else: root C:\ControlStack_Worktrees\selector-engine, branch
   lane/selector-engine, actual current HEAD, gate selector-engine, runtime 127.0.0.1:8788, and
   MCP 127.0.0.1:8000/mcp. Stop if root, branch, or gate does not match.
2. Read every file in docs/_context/lanes/selector-engine/ before deciding or writing anything.
   Then inspect repo identity, complete Git state, and recent commits. Repository evidence overrides
   chat history and historical claims inside older handoff sections.
3. Preserve all existing work. Continue from a dirty tree only when every dirty path is explicitly
   recorded in lane memory and authorised by the current top ready item. Never clean, reset, restore,
   stage, delete, move, or rewrite unexplained work.
4. Verify the branch-HEAD memory guard before commissioning a worker or changing queue state. Read
   the latest `Recorded lane work HEAD` in LANE_STATE.md. When actual HEAD is a dedicated commit whose
   subject begins `docs(selector): reconcile lane state`, compare the recorded work HEAD with that
   commit's immediate parent; otherwise compare it directly with actual HEAD. If stale, reconcile
   durable lane memory first, run the full gate, stage exactly the authorised context files, gated
   commit and push the reconciliation wrapper, then recheck. Do not commission work from stale state.
5. Own queue order, dependencies, status, parcel scope, and seam classification. Review at worker
   batch boundaries and seams, not after every parcel. Commission workers with the canonical standing
   worker prompt recorded above; do not invent parcel-specific replacement prompts when the standing
   prompt and WORK_QUEUE.md already provide complete authority.
6. Never implement a queue item as orchestrator. Orchestrator actions are limited to repository
   inspection, accepting or rejecting worker evidence, sequencing the queue, recording decisions and
   approvals, reconciling lane memory, commissioning the next worker batch, and giving exact human
   steps when live evidence is required.
7. A seam change requires recorded Program & Integrate approval before a worker may execute it.
   Missing approval -> `STOPPED - seam approval required`. Never infer approval from code, chat tone,
   or a related decision.
8. When an item's acceptance genuinely requires the running application, a browser action, human
   eyes, or real-world correctness judgement that repository evidence cannot prove, keep the item
   incomplete. Reply `NEEDS YOU` using the permanent Communication rule in SESSION_HANDOFF.md, give
   exact click-by-click steps, and stop. Never substitute tests or inference for required observation.
9. At each batch boundary, verify each completed parcel separately: authorised scope, focused tests,
   full gate, exact staged-file equality, feature or read-only result, documentation closeout,
   reconciliation wrapper, final Git state, live evidence actually observed, and next queue state.
   A worker's clean stop at a protected boundary is a successful outcome.
10. After an orchestrator documentation change, run the full selector-engine gate, stage exactly the
    authorised context files, and gated commit/push only lane/selector-engine. Preserve recorded
    feature work and never include it in an orchestrator documentation commit.
11. Never touch another lane, the donor, or main. Never merge, rebase, clean, reset, restore, delete,
    or move outside explicit authority. File movement is disabled. Tier remains an Engine/Lex
    consequence after run and must never become a Selector prerequisite. Never fabricate project
    truth, browser state, source authority, approvals, acknowledgements, revisions, or live evidence.
12. Begin every final response with exactly one status line: `AUTO`, `SEND TO INTEGRATE`, `NEEDS YOU`,
    or `STOPPED`. Follow the permanent Communication rule in SESSION_HANDOFF.md. Report the batch or
    seam decision in plain language and do not make Patrick read hashes, paths, item IDs, or errors.
```

## Purpose

Own the user-facing Selector workflow and the bounded Engine execution path that turns a source-backed selection into a deterministic, read-only selected-project run result. The business objective is a trustworthy single-slice end-to-end run first, followed by widening passes that reuse the same contracts rather than rebuilding the path for every option.

## Owned surfaces

The lane app permits scoped work under:

- `apps/**`;
- `packages/workspace-kernel/**`;
- `packages/runtime-web/**`;
- `server.js`;
- Selector, Engine, runtime, and run-table test globs;
- `docs/selector/**` and `docs/engine/**`;
- package manifests and lockfile.

Ownership does not mean every permitted path belongs in every parcel. Each worker receives an exact bounded path set.

## Responsibilities

- Source-backed Selector options and applicability.
- Selector session, project, and selected-truth behaviour.
- Selector-to-Engine intent and transport contracts.
- Read-only Engine invocation, lifecycle, and run-table/result presentation.
- Runtime behaviour on port 8788 for this lane.
- Focused regressions and the `selector-engine` gate.
- Detailed lane state, evidence, decisions, queue, and session handoff.

## Explicit exclusions

- Lab/IES implementation and the donor at `C:\ControlStack_Lab`.
- Program integration and promotion to `main`.
- Downstream artifacts such as DXF resizing, quotation, and report generation until the Engine output contract is stable.
- Arbitrary shell execution, deletion, movement, and cross-root copy.
- Writing another lane's worktree.

## Seams

1. Selector state produces a versioned Engine input.
2. Engine produces a deterministic selected-result/run-table output.
3. Lab/IES and later downstream artifacts consume only an approved output contract.
4. Program & Integrate accepts lane parcels and owns cross-lane decisions.
5. Any seam change requires Program approval and producer/consumer evidence.

## Git and worker rules

- One writer at a time in this worktree.
- One worker run may complete up to five consecutive parcels, strictly one parcel at a time.
- Every parcel keeps its own scope, focused evidence, full gate, exact staged-file equality, feature or read-only result, and durable documentation closeout before the next parcel begins.
- Stage only commissioned paths.
- Run the named full gate for every parcel and again for its documentation closeout.
- Commit and push only through the gated lane tools.
- Never push to `main`.
- Never clean or reset unexplained state.
- Chat is coordination; these repository documents are the durable memory.

## Canonical lane memory

The canonical Selector & Engine context path is `docs/_context/lanes/selector-engine/`. Every worker and orchestrator reads all six canonical files before acting. The standing worker and standing orchestrator prompts are stored only in this stable charter; `SESSION_HANDOFF.md` carries a pointer and changing session state. File movement is disabled; workers must stop rather than attempting any move required by a queue item.

## Four-status operating model

Every worker response begins with exactly one status line:

- `AUTO` — five parcels completed successfully in one batch with every parcel committed and reconciled on `lane/selector-engine`;
- `SEND TO INTEGRATE` — the queue explicitly requires Program & Integrate consideration;
- `NEEDS YOU` — one concrete Patrick action or live observation is required;
- `STOPPED` — a protected boundary ended the batch.

`AUTO` never means `main`. `STOPPED` and `NEEDS YOU` at genuine boundaries are successful worker outcomes, not implementation failures.

## Queue governance

The orchestrator writes and orders SEL queue items. A worker executes only the top item with status `ready` whose dependencies are satisfied, completes its full documentation closeout, then immediately repeats from the new top ready item until five parcels are complete or a protected boundary stops the batch. No qualifying item produces `STOPPED - queue empty`. A seam change without recorded Integrate approval produces `STOPPED - seam approval required`. A parcel requiring live application observation, a browser action, human eyes, or real-world judgement that repository evidence cannot prove produces `NEEDS YOU` with exact click-by-click steps and remains incomplete. Workers never execute a later item opportunistically, never substitute tests for required observed behaviour, and never invent project truth or fixtures to manufacture a green result. The orchestrator reviews at batch boundaries and seams rather than after every parcel.
