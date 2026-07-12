# ControlStack — Finish-line map for the core spine

**The spine:** Selector → Run lengths → Accessories (factory approved) → Engine run → output (RunTable + payload + IES). This is the chain "everything else downstream" waits on.

**How to read status:** ✅ done · 🟡 in progress now · ⬜ switched off / not started (deliberately, until the stage before it is proven).

**Last updated:** 12 July 2026 (refreshed by Claude against live code in all three roots — repo / runtime / lab. Git history was locked/timing out, so marks are grounded in live file state + tests present, not commit messages). Prior 9 Jul snapshot is preserved in the status log below.

## Current state snapshot (12 Jul — LATEST)

Three workstreams, all moved since 9 Jul:

**1. Runtime spine (CP's lane) — selector → run → engine → output**
Selector ✅ · run lengths ✅ · accessories / Stage 3B 🟡 (CP still hardening) · engine output / Stage 4 ⬜ generation still off by design, BUT the **project-IES export + browser-download path is now built and wired** (export boundary → result summary/readback → download materialiser → mounted control → browser download trigger; newest tests dated 12 Jul 02:09). First genuinely output-*like* movement. Shape+order contract now **fully implemented** (Fix 5 landed).

**2. Lab IES toolkit (our lane) — ✅ COMPLETE + EXTENDED, isolated on `lab-ies-toolkit`**
Now **17 `ies*.js` tools** (was 14) + 4 HTML harnesses. Added since 9 Jul: `iesSymmetrize.js` (plane-imbalance normalise), `iesUgr.js` + `iesUgrCie190.js` + `ugr.html` (UGR tool — was only scoped on 9 Jul, now built), `provenance.html` + `emergency.html` (worked 12 Jul). Pipeline intact: read → check → merge/rotate/symmetrize → 1mm record → provenance → approval gate → safe handoff → downloadable project IES → UGR. None of it touches CP's runtime.

**3. Bridge (lab → runtime) — ✅ ADAPTER LANDED (was 🟡 STARTING)**
`labIesSafeHandoffAdapter.js` + `labIesSafeHandoffAdapter.test.js` are in the runtime (9 Jul). Read-only, consumes only the safe handoff, fills board-owned null slots, fails closed on any raw field. Next boundary — project-IES export — has now also grown a full runtime test cluster (see workstream 1).

**Shape+order contract — ✅ FULLY IMPLEMENTED (verified in live code 12 Jul).** All Fix 1–4/6/7 items were done on 9 Jul. **Fix 5 (source-version/stale binding) — the one real remaining gap — has now LANDED:** `createSourceVersionBinding`, `sourceInputFingerprint` + `boardDataSourceVersion`, `bindingStatus: source-version-bound/unbound`, `staleRevalidationEnabled: true`, `staleValuesBecomeDiagnosticUnmapped: true`, backed by `tests/selectorSourceVersionBinding.test.js`. Only the cosmetic `default-preview` stand-in vocab in `selectorState.js` remains.

**Open TODOs (refreshed 12 Jul):** cosmetic `default-preview` vocab swap (minor) → board lumen-curve prewarm (still a Stage-4 blind-spot, donor `board_lumen_util.py` not ported) → IES scaling DESIGN (`ies_scale.py` donor stub) → continue Stage 3B enforcement (joins/packing/electrical) → keep these context docs committed here so they can't be lost between chats.

---

## Status log

- **12 Jul (Claude, live-code re-verify across all 3 roots)** — Fix 5 CONFIRMED landed in `packages/workspace-kernel/selectorReferenceOptionsService.js` (`createSourceVersionBinding` + stale-revalidation flags) with test `selectorSourceVersionBinding.test.js` → shape+order contract now fully implemented. Bridge adapter `labIesSafeHandoffAdapter.js` CONFIRMED in runtime. Stage-4 output path advanced hard: a project-IES export + browser-download test cluster now exists, newest dated 12 Jul 02:09 (`...ProjectIesExportDownloadMaterialiserCapability`, `...RegistryLifecycle`, `...MountedControlIntegration`, `...BrowserDownloadTrigger`). Lab lane extended to 17 tools: `iesSymmetrize`, `iesUgr` + `iesUgrCie190` + `ugr.html` (UGR now BUILT), plus `provenance.html`/`emergency.html` edited 12 Jul. Note: git tools timed out (repo lock — CP likely live), so this is grounded in file state + present tests, not commit logs.
- **12 Jul (finding)** — The durable context docs (this map, gap register, CP handoff, etc.) were only in the uploaded `BASE_LAB_FORM_v2.zip` with no committed home. Now written here to `docs/_context/` in the lab worktree so context survives a chat dying.

### — history below this line is the prior 9 Jul snapshot —

- **9 Jul** — Shell down at boot: `iesFirstNarrowMetadataHandoffSummary.js` imports Node-only `node:crypto`, which the browser can't load. Breaks shell.js → services.js → savedProjectStore.js, so the whole shell is blank. Fix: swap to browser-safe `stableSha1` from `stableFingerprint.js`. Node `--test` runs miss it because tests run in Node, not a browser.
- **9 Jul** — Early Stage 4 output plumbing: the "candidate-output summary" write path is green; the "manifest" write path failed 5 tests on a save-path routing bug (a prerequisite input mis-read as a write request), not real logic. Generation still off.
- **9 Jul** — Rotate tool built (iesRotate): rotation = azimuth SHIFT (distinct from mirror_vertical up/down-flip and horizontal reflection h→360−h). rotate(X) shifts features by −X. Guarded: requires full 0–360 (fail-closed), standardises first. Verified rotate(90): feature 0→270.
- **9 Jul** — SEQUENCING GUARD LAYER built (iesGuards): precondition guards (isFullAzimuth, gridMatches, assertMergeable — fail-closed) + named recipes encoding the safe sequence. mergeOptics = standardise → mask dark hemisphere → assert → merge. RULE for CP: runtime/UI must call guarded RECIPES, never raw transforms.
- **9 Jul** — Output path + full transform family done. iesProjectIes scales an approved 1mm reference to a run length, refreshes keywords, STRIPS governance/secret fields, records provenance derivedFrom the reference fingerprint. Verified: 100cd@1m → 456.8cd@4568mm, secret/BCLT never in the download. iesTransforms: mirror, scale, hemisphere detect/mask, flip, merge (sum), resample/standardise, BCLT dims (G7/G8/G9), header flags (G2/G5/G6). Insight: 1mm reduce and run-length scale are ONE tool.
- **9 Jul** — Data-mutation transforms started (iesTransforms) + governed applyEdit wrapper (logs mutation via provenance, re-opens approval on any edit). Verified: editing a stamped reference knocks it back to pending_review.
- **9 Jul** — Lab safe runtime handoff built + verified (iesHandoff): exposes only opaque refs + fingerprints + readiness; leak test proves no candela/keywords/mutationLog/proprietary values escape.
- **9 Jul** — Lab governance layer built + verified: record-maker (BASE_LAB_FORM merge, kind-aware), provenance (browser-safe content fingerprint + mutation log, resets approval on edit), approval gate. E2E: draft blocked → fill lab fields + ratify checks → stamp reference → any edit re-opens pending_review.
- **9 Jul** — Lab tools #2 (iesMetrics: flux/peak/beam/lm-per-w/lm-per-m) + #3 (iesInspect viewer). Flux computed-vs-stated matches on the real DNX file (2489 vs 2490). Beam-angle FWHM bug caught by test + fixed.
- **9 Jul** — Lab tool #1 (iesShared/iesParse/iesWrite + round-trip golden test). Ports donor parse_ies/build_ies_text, browser-safe. 2/2 golden pass.
- **9 Jul** — CP BLESSED the lab lane. Branch lab-ies-toolkit, package packages/lab-kernel/ies-toolkit/, file allowlist, one-tool-per-commit, golden-test bar. Full 1mm authority schema (controlstack.lab.one-mm-ies-record.v1), mutationLog shape, gating, safe-handoff fields. Setup = git worktree/branch + allowlist.
- **9 Jul** — IES Builder found intact in donor lib/photometry. Corrected earlier "IES scaling undesigned" — scale op EXISTS (apply_ies_multiplier_once); ies_scale.py was only an unfinished wrapper.
- **9 Jul** — Phase 1 output-spine verified: RunTable (run_engine.py) and IES representation (ies.py + golden test) are donor-IMPLEMENTED = cheap ports. IES scaling (ies_scale.py) is a DONOR STUB = real design work. Rule: sort every gap into PORT vs DESIGN.
- **9 Jul** — Board lumen-curve prewarm is a DONOR capability NOT ported to runtime (novon_family grouping + curve-index manifest + get_board_lm_per_m). Runtime uses only the 25 °C headline. Stage 4 dependency.
- **9 Jul** — Shape+order contract written for CoPilot: preserve source order + explicit defaults; stand-in vocab must equal real; CCT/CRI paired; flag unknown values. Canonical: target_lm_per_m (intent) vs board_capacity_lm_per_m / c1_lumen_imax_25c @25C (source).
- **9 Jul** — Selector inputs shape/provenance check: 9 of 17 fields live; 8 hardcoded stand-ins. Three holes: alphabetical re-sort loses source order & first-is-default; stand-in vocab mismatches real; CCT/CRI separate but BOARDS pairs them.
- **9 Jul** — IES manifest write path reported landed by CoPilot; "landed" = tests pass against the contract. No visible rendered output yet — verifiable only once Stage 4 generation turns on.

---

## The four stages, plain English

### 1. Selector — "Spec ready"  ✅
A specifier nominates the product — system, optic, and maybe light + control. Done = pick a product and its options and get a committed selection. **Status:** working; selector confirmed done. (Live: 9 of 17 fields pull real canonical values, 8 are future-mapped stubs.)

### 2. Run lengths — "Buildable / proof of concept"  ✅ (inputs)
Add the run lengths, no accessories. Done = run lengths captured as committed input the engine can use. **Status:** input side in place. Actually *generating* the IES that proves the design lives in Stage 4 (off), so "buildable" is captured as data, not yet provable as output.

### 3. Accessories — "Factory approved"  🟡  ← you are here
Every item filled in, including accessories, so the thing is genuinely makeable. Done = the system safely works out how accessories sit on boards and across segment joins, and fails closed on anything it can't prove. **Status:** in progress; where all recent effort is going.

### 4. Engine run → output — "RunTable + payload + IES"  ⬜ generation off · 🟡 plumbing advanced
Run the engine to produce the RunTable, payload, and IES — the thing every downstream stakeholder consumes. Done = a selected result produced, verified, handed downstream. **Status:** generation still off (fail-closed) until Stage 3 is trustworthy. But the safe export/download plumbing has advanced from summaries to a wired project-IES export + browser-download path (12 Jul).

---

## Inside Stage 3 (the front line) — what's actually landed

CoPilot splits Stage 3 into 3A (basic) and 3B (accessory reservation across segments).

- ✅ **3A — basic factory-approved inputs**: passing.
- 🟡 **3B — narrow accessory cases**: single-segment, non-join-sensitive only; anything trickier fails closed.
- ✅ **Board packing / segment split (scoped)**: passing for exact-fill, pitch-aligned cases; unsupported combos fail closed.
- ✅ **"Do-not-bridge" rule (subset)**: enforced for the requested subset.
- 🟡 **Join rules (board / diffuser / secondary across a join)**: *represented* (named/carried) but not yet *enforced* (physically applied). Join-sensitive cases fail closed.
- ⬜ **Electrical cross-segment rule**: designed by CoPilot but not applied — his repo connection dropped mid-change. Still needs to land + be tested.

**CoPilot's own "next safe move":** a sealed segment/placement bridge — board placement → reserved ranges → frozen physical segments → join authority. Plain terms: teach the system to physically lay boards out and honour the joins, not just name the rules. That's the bridge from Stage 3 to switching Stage 4 on.

---

## What has to be true before Stage 4 (output) can switch on

All off today, by design:
- RunTable actually generated (not just row contracts)
- Engine payload produced
- IES files generated
- One selected result persisted and handed to downstream modules

None should turn on until Stage 3's join/placement rules are *enforced*, not just represented — otherwise output would overclaim what's been proven.

---

## Why it feels slow (and why that's okay)

Recent chats have been Stage 3B hardening — invisible, fussy rule work that makes the accessory layer trustworthy before output switches on. Little visible change on screen, which is exactly why it *feels* like drifting. It isn't — it's the last stretch of foundation. Honest one-liner: **inputs are done; the accessory/factory-approved layer is being made trustworthy; the output engine is intentionally still off (with export/download plumbing now wired ahead of it).**

---

## Glossary — CoPilot's recurring words

- **Represented vs enforced** — represented = the rule's name/value is known but not applied; enforced = actually computed on real geometry.
- **Fail-closed** — when unsure, refuse rather than guess. Why things are gated.
- **Sealed summary** — a safe, read-only summary that doesn't leak raw data downstream.
- **Join-sensitive** — cases where a part crosses the joint between two board segments. The hard cases.
- **Stage 3A / 3B** — 3A = basic factory-approved inputs; 3B = accessories reserved across segments.
- **Stage 4** — the output stage: engine run, RunTable, IES, persisted result. Currently off.

---

## How to use this with me (Claude)

When CoPilot gives you a status, paste it to me. I'll tell you which box on this map it actually moved — done, in progress, or still off — and update this file. That turns "are we closer?" into something you can point at.
