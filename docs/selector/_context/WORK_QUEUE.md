# Selector & Engine Work Queue

**State date:** 2026-07-18, Australia/Sydney.
**Rule:** Queue order does not authorise implementation. The orchestrator commissions one bounded worker at a time.

## Priority 0 — Durable lane memory

**Status:** COMPLETE.

The six files under `docs/selector/_context/` were created, gated, committed, and pushed in commit `678cf83c9f97bfcdc397b574c4eab08b306656ee`. Later workers have continued to maintain the durable handoff.

## Priority 1 — Single-slice E2E closeout

**Status:** IN PROGRESS — the Control authority mapping repair is committed and pushed; runtime 8788 activation/receipt and server-registration acknowledgement remain unproven.

**Next worker name:** `CS-SELECTOR-RUNTIME-8788-CONTROL-ACTIVATION-VALIDATION-01`

**Objective:** complete and prove one real, source-backed selection through the existing read-only Engine path to a useful result/run-table output on the current runtime.

**Required method:**

1. Read this directory and current repository evidence.
2. Start from the current committed pipeline; do not redesign it.
3. Run the current bounded Selector/Engine tests and inspect the live 8788 slice.
4. Identify exactly one first failing boundary, if any.
5. Commission a separate bounded writer only when a reproducible failure requires code.
6. Preserve no-write Engine semantics and source authority.
7. Finish with focused tests, `selector-engine` green, live evidence, exact commit, and updated handoff.

**Acceptance:**

- a selected, saved project produces an intentional Engine request;
- registration and invocation are server-owned and deterministic;
- success, blocked, and error states are truthful;
- one useful result/run-table payload is visible and attributable;
- no hidden browser-only source of truth;
- no unrelated feature widening;
- exact before/after Git evidence.

**Closed boundary evidence:** commit `6e5e6cee398e1dd1e82d331c81a719625e0d076b` binds one unambiguous selected-optic efficiency from active `OPTICS` authority inside the server-owned bridge. `selector-engine` passed 102/102, and live internal-seam execution returned one useful run with no write or mutation side effect.

**Remaining acceptance:** activate/reload runtime 8788 from accepted feature commit `5ae1cf8e9f4e488ec4921632ef730a35db44d1fc` and obtain a bounded live receipt showing at least one genuine direct Control option with empty `selectedValue`. After that, prove server-owned registration for the existing browser-session save and continue the selected-project read-only invocation route. Tier must not be introduced as a manual prerequisite; it is computed after run.

**Next bounded worker:** `CS-SELECTOR-RUNTIME-8788-CONTROL-ACTIVATION-VALIDATION-01` — perform only the operational activation/reload and live options validation. Do not widen into registration, Engine invocation, rendering, RuntimeData changes, or further Control semantics.

### 2026-07-18 acceptance precondition result

**Status:** BLOCKED by live saved-project precondition; no code defect was established.

Runtime 8788 was reachable, but read-only active-revision checks for all supported current workspace project identities (`project-alpha`, `project-bravo`, and `project-charlie`) returned `selected-project-shell-invoke-transport-active-server-revision-invalid`. No source boundary or Engine capability was invoked, and every persistence, mutation, RunTable, IES, and output flag remained false.

The registration route can only be called truthfully with the exact accepted local save envelope produced by a real browser-session save. At the time of Acceptance 01, no such envelope existed and none was constructed from fixtures or test data.

The user subsequently completed the correct **Save browser session envelope** action. Current user-supplied live evidence shows `project-alpha` with selected runtime envelope `env-project-alpha-1784332898092`, runtime saved count `1`, save source `p2-shell-save-envelope`, and no save error. This proves the browser-session save exists, but the dump contains no server-registration acknowledgement or active server revision.

The same live evidence reopens direct Control/Protocol as a current defect candidate: Control is not selected and blocked, direct control protocol is reported unavailable from current source, and Control type is blocked while system, optic, lm/m, and CCT/CRI are available. Run intake remains incomplete because quantity, length, and length mode are empty. Tier is correctly not selectable and must remain an Engine/Lex consequence.

### 2026-07-18 Control authority diagnosis result

`CS-SELECTOR-LIVE-CONTROL-OPTIONS-DIAGNOSIS-01` proved that the live blocked field originates before cascade, projection, caching presentation, or rendering. `compatibleBoardDriverControlOptions()` emits no matching genuine BOARDS × DRIVERS protocol pair, so no `controlType` option or relationship record exists and the field fails closed. System and CCT/CRI remain available because they use independent SYSTEM and BOARDS-only paths. The lane gate passed 102/102 and the tree remained clean.

**Recommended next bounded worker:** `CS-SELECTOR-LIVE-CONTROL-AUTHORITY-INTERSECTION-REPAIR-01`. Acceptance 02 remains held until genuine active-source protocol authority is mapped correctly or an upstream DRIVERS authority-data defect is confirmed and corrected.

Evidence commit `0ad8bee0995c29bb15c227e6f885038ecd105001` was gated and pushed. Post-gate live checks at that time reproduced the missing-active-revision boundary for all three supported current project identities, with no writes, mutations, or outputs.

## Priority 2 — Declare Engine output contract candidate

**Status:** BLOCKED by Priority 1.

Produce a versioned candidate contract covering selected inputs, result identity, run-table rows, status/error semantics, provenance, and replay/readback. Submit it to Program with producer tests. No downstream consumer activation yet.

## Priority 3 — First widening pass

**Status:** HELD.

Choose one adjacent Selector dimension only after Priority 1 proves the path and Priority 2 constrains the seam. The pass must reuse the existing projection, applicability, intent, invocation, and output contracts. Acceptance includes evidence that widening is additive rather than a second bespoke pipeline.

## Priority 4 — Lab/IES consumer compatibility

**Status:** HELD pending Program approval of the Engine contract candidate.

Coordinate through Program. Do not write the Lab lane from this worktree.

## Priority 5 — Downstream artifacts

**Status:** HELD.

DXF resizing, quotation, reports, and other post-payload artifacts remain outside this lane and inactive until Program marks the Engine output contract stable.

## Must remain closed without new evidence

- Control/Protocol work beyond the exact current live options-derivation boundary.
- Cold-boot source arbitration.
- Reference snapshot caching.
- Browser rendering as an assumed cause.
- Indirect-control changes merely to unblock direct control.
- Whole-repository test runs when the named bounded gate is available.

## 2026-07-18 Control authority repair result

**Status:** CODE REPAIR COMPLETE; LIVE ACTIVATION RECEIPT HELD.

Read-only source inspection proved that the active DRIVERS materialisation has a boolean marker at `native_control_type` and the genuine duplicate-normalised authority at `native_control_type__2`. Commit `5ae1cf8e9f4e488ec4921632ef730a35db44d1fc` now prefers the genuine field while preserving native/legacy fallback and all authority-intersection safeguards. The exact-shape regression and complete `selector-engine` gate passed 103/103; push to `origin/lane/selector-engine` succeeded.

RuntimeData remained unchanged and redacted. Runtime 8788 answered the post-commit GET, but no restart/reload action or bounded Control-only receipt is available in this app, so live availability is not overstated. `project-alpha` remains separately blocked by `selected-project-shell-invoke-transport-active-server-revision-invalid`, with no invocation or write/generation side effect.
