# Selector & Engine Work Queue

**State date:** 2026-07-18, Australia/Sydney.
**Rule:** Queue order does not authorise implementation. The orchestrator commissions one bounded worker at a time.

## Priority 0 — Durable lane memory

**Status:** IN PROGRESS.

Create, gate, commit, and push exactly the six files under `docs/selector/_context/`. No feature files belong to this parcel.

Acceptance:

- `selector-engine` gate green;
- exact six documentation paths staged;
- gated commit `docs(selector): establish durable lane memory`;
- push only `lane/selector-engine`;
- final tree clean.

## Priority 1 — Single-slice E2E closeout

**Status:** READY AFTER Priority 0.

**Worker name:** `CS-SELECTOR-E2E-SINGLE-SLICE-CLOSEOUT-01`

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

- Control/Protocol authority repairs.
- Cold-boot source arbitration.
- Reference snapshot caching.
- Browser rendering as an assumed cause.
- Indirect-control changes merely to unblock direct control.
- Whole-repository test runs when the named bounded gate is available.
