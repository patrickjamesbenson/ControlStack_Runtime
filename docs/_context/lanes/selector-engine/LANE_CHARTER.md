# Selector & Engine Lane Charter

**Authority:** Canonical lane charter for Selector & Engine.
**State date:** 2026-07-19, Australia/Sydney.

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
- One bounded task per worker.
- Stage only commissioned paths.
- Run the named gate before commit.
- Commit and push only through the gated lane tools.
- Never push to `main`.
- Never clean or reset unexplained state.
- Chat is coordination; these repository documents are the durable memory.

## Canonical lane memory

The canonical Selector & Engine context path is `docs/_context/lanes/selector-engine/`. Every worker reads all six canonical files before selecting work. File movement is disabled; workers must stop rather than attempting any move required by a queue item.

## Four-status operating model

Every worker response begins with exactly one status line:

- `AUTO` — gate passed, parcel committed to `lane/selector-engine`, and lane work may continue without Patrick action;
- `SEND TO INTEGRATE` — the parcel is ready for Program & Integrate consideration;
- `NEEDS YOU` — one concrete Patrick action is required;
- `STOPPED` — a genuine boundary requires an orchestrator decision.

`AUTO` never means `main`. A clean `STOPPED` at a genuine boundary is a successful worker outcome.

## Queue governance

The orchestrator writes and orders SEL queue items. Workers execute only the top item with status `ready` whose dependencies are satisfied. No qualifying item produces `STOPPED - queue empty`. A seam change without recorded Integrate approval produces `STOPPED - seam approval required`. Workers never execute a later item opportunistically and never invent project truth or fixtures to manufacture a green result.
