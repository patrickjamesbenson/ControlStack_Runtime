# Lab IES toolkit — handoff for CP (runtime hooks + the safety rule)

The `lab-ies-toolkit` lane is built, isolated, and golden-tested. This tells you what it delivers and — critically — **how the runtime must call it**. Nothing here touches your runtime files; it's a library your selector/engine call.

## The one safety rule (read first)
The toolkit is **three layers: tools + governance + guards/recipes**. The transforms are sharp tools — safe individually, dangerous out of order (e.g. merging two files that aren't standardised to matching 0–360 grids silently produces wrong photometry).

> **The runtime and UI must ONLY call the guarded recipes and top-level functions below — NEVER a raw transform (`mergePhotometry`, `standardize`, `maskHemisphere`, `scaleByFactor`, `flip`, …) directly. Raw transforms are internal building blocks. Every new transform ships with its guard/recipe before it is exposed.**

## What the lab lane produces
A golden **1mm reference record** (`controlstack.lab.one-mm-ies-record.v1`): parsed photometry normalised to 1mm, merged onto the `BASE_LAB_FORM` template (kind-aware), provenance (fingerprint + mutation log), and an approval gate. A record is only `approvalState: "reference"` once every `gates_reference` field is filled and every check (BCLT/flags/power) is ratified. Any edit re-opens `pending_review`.

## Functions the runtime SHOULD call

1. **Consume the safe handoff** — `buildSafeHandoff(record)` → the ONLY thing the runtime sees of a lab record. Opaque refs + fingerprints + readiness (`handoffState: "ready" | "blocked"`). Never contains candela, keywords, mutation log, or proprietary data (leak-tested). The runtime uses this to know a reference exists and is usable.

2. **Build a downloadable project IES** — `buildProjectIes(reference, runLengthMm, job)` →
   `{ ok, iesText, provenance }`. Scales the 1mm reference to the selector's run length (same scale tool, reversed: candela + power + length together), refreshes keywords, **strips governance/secret fields**, and stamps `provenance.derivedFromFingerprint` so every download traces to its reference. **Refuses** unless the source is an approved reference. This is what the selector calls at the run length it lands on.

3. **Merge two optics** — `mergeOptics(base, addon, opts)` (recipe): standardise → mask the dark hemisphere → assert full-azimuth + matching grid → merge. Do NOT call `mergePhotometry` directly.

4. **Rotate** — `rotate(phot, degrees)`: guarded azimuth shift (requires full 0–360; `rotate(X)` shifts features by −X, i.e. 10° reads from 350°).

## Template contract (novondb)
`BASE_LAB_FORM` now carries two extra columns the record-maker reads: **`kind`** (`ies` | `lab` | `check`) and **`gates_reference`** (`y`/`n`). See `BASE_LAB_FORM_v2.csv`. The tools tolerate the columns being absent (fall back to today's behaviour), so this can land before/after the runtime wiring.

## Lane boundary
The lab owns the photometry math (scale, transforms, recipes) and the reference authority. The **runtime orchestrates the selection** and calls the functions above. It never reaches into raw lab records or raw transforms.

## What we'd like from you
1. Wire the selector/engine to consume `buildSafeHandoff` output as the reference source (opaque refs + readiness only).
2. Call `buildProjectIes(reference, runLengthMm, job)` to produce the customer's IES at the resolved run length.
3. Enforce the recipes-only rule at the runtime boundary.
4. Confirm the `safe-runtime-handoff.v1` field set matches what your IES manifest / selected-result projection expects (it was built to your blessed list).

## File inventory (lab-ies-toolkit branch, all golden-tested, browser-safe)
`iesParse`, `iesWrite`, `iesShared`, `iesMetrics`, `iesInspect` (viewer), `iesOneMm`, `iesLabForm` (record-maker), `iesProvenance`, `iesApproval` (gate), `iesHandoff` (safe handoff), `iesTransforms` (mirror/scale/mask/flip/merge/resample/dims/flags + governed applyEdit), `iesGuards` (preconditions + `mergeOptics`), `iesProjectIes` (downloadable output), `iesRotate`.
