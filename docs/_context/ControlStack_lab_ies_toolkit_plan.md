# Lab IES toolkit — port plan

**Goal:** bring the donor's IES Builder into the runtime as a set of **Lab kernel tools** — one shared, centralised toolkit used both by (a) the selector's automated IES scaling sequence and (b) interactive normalisation of IES files coming from the lab or emergency-lighting vendors. One toolkit, one source of truth, many callers.

## The tools already exist (donor `lib/photometry/`)

Each is a discrete, mostly-pure function — ideal kernel-tool candidates:

| Tool | Donor function | File | Job |
|---|---|---|---|
| Parse | `parse_ies` | ies.py | IES text → JSON model |
| Write | `build_ies_text` | ies.py | JSON model → IES text |
| Scale | `apply_ies_multiplier_once` | interp.py | scale intensities by a multiplier |
| Mirror | `mirror_vertical_inplace` | ies.py | mirror vertical plane |
| Hemisphere detect/mask | `_hemisphere`, `_apply_hemisphere_mask` | interp.py | classify + mask a hemisphere |
| Merge files | `merge_ies_files` | ies.py | merge primary + secondary |
| Merge hemispheres | `merge_hemispheres` | metrics.py | combine hemispheres |
| Interpolate | (interp.py) | interp.py | angle grid interpolation |
| Metrics | `metrics.py` | metrics.py | photometric metrics |
| Schema / export | `schema.py`, `export.py` | — | validate + export |

Internal model: a JSON dict (`parse_ies → JSONDict`, `build_ies_text(JSONDict)`), so files round-trip cleanly and each tool is "load → mutate → return".

## Why it hasn't come in — and how to fix that

Bringing tools in ad-hoc "buggers the MCP / dirty trees" and risks breakage (the shell just died from a single `node:crypto` import in the wrong place). The fix is to make the port a **bounded, isolated, gated** package — which is exactly CP's methodical, fail-closed, contract-first style. Do it this way and it won't touch the live tree until it's proven.

### The clean method (fits CP)
1. **New isolated package**: `packages/lab-kernel/ies-toolkit/` — NOT imported by `shell.js`/`services.js` until proven. (Isolation is what stops a half-ported tool taking down the shell.)
2. **Each tool = one pure function**, browser-safe (no Node-only imports like `node:crypto` — this is the exact trap that broke the shell). Load → transform → return. No file writes, no mutation of shared state.
3. **Writes/exports gated off** by default (fail-closed), matching every other runtime contract.
4. **One tool per clean commit**, each with its own **golden test** using the donor's `tests/test_photometry_golden_ies.py` fixtures — so each landing is provable, not asserted.
5. Only after the toolkit is green do you wire the two consumers.

### Port order (round-trip first)
1. **parse** + **write** — land together so you can prove a file survives parse→write unchanged against the golden IES.
2. **metrics** — read-only, lets you compare numbers to donor.
3. **scale** — the selector's core need.
4. **mirror**, **hemisphere mask**, **merge / merge-hemispheres**, **interpolate** — the richer ops.
5. **schema / export** — validation + safe output (still gated).

### Then wire the two consumers (separate, later)
- **Selector auto-sequence:** the base-IES selection + which tools run in what order for a given selection. (This is the one genuinely *design* piece — the tools are ported, the recipe is new.)
- **Lab / vendor intake:** the same tools exposed interactively to normalise incoming IES from lab or emergency vendors.

## What to hand CP
A single scoped brief: "Port donor `lib/photometry/` into an isolated `packages/lab-kernel/ies-toolkit/`, one pure browser-safe tool per commit, writes gated, each verified against the golden IES test, starting with parse+write round-trip." That's one methodical lane he can run alongside the engine slice without dirtying it.

## Register status
IES toolkit = **PORT** (donor implemented, modular). Base-IES selection + selector tool-sequence = **DESIGN**. Verification anchor: golden IES test.
