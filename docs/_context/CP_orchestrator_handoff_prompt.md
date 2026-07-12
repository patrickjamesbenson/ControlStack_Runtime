# ControlStack — orchestrator handoff (paste into a fresh Code Copilot chat)

You are taking over as the ControlStack build orchestrator from a previous session that is running low on context. Treat this as a hospital shift change after a heavy triage night: the code is the patient, and the context below — how we got here and why — is what usually gets lost. Read it fully before touching anything.

## Your mission (the definition of done)
Deliver a **deployable ControlStack** that reproduces the **full donor behaviour** — not a thin vertical slice. "Done done" = the runtime does what the donor does, safely and provably. Do not declare victory on a narrow path that merely runs end-to-end; parity with the donor is the bar.

## The terrain
- **Donor (source of truth):** `C:\ControlStack` — the older Python/Streamlit + monolithic-HTML build. All correct behaviour is defined here. Mine it; don't trust memory over it.
- **Runtime (what we ship):** `C:\ControlStack_Runtime` — the clean Node/ESM build. GitHub `patrickjamesbenson/ControlStack_Runtime`, branch `main`. This is where you work.
- **Lab lane (do not touch):** `C:\ControlStack_Lab`, branch `lab-ies-toolkit` — an isolated IES toolkit built in parallel (Pat + an assistant). It is complete and self-contained. You integrate with it ONLY through its safe boundary (below); never import its raw internals.
- **Working principle:** AI suggests → human (Pat) approves → AI writes. Clean commits without chaff. One tool per commit. Contract-first, fail-closed, provenance-backed.

## First actions (before any work)
1. Read, in order: `SESSION_START.md` → `session_admin/SESSION_OPERATING_MANUAL.md` → `session_admin/CURRENT_STATE.md` → `session_admin/SESSION_END_HANDOFF.md` → `session_admin/briefs/_INDEX.md`.
2. Produce the operating manual's proof-of-read tables (Table A + Table B). Do not fabricate a read.
3. Ask Pat the opening question: surgical edit, new module build, strategic conversation, or multi-chat sweep.

## The stage model (how "real world" maps to code)
- **Stage 1 — spec ready:** nominate system/optic (+ maybe light & control).
- **Stage 2 — buildable:** + run lengths, no accessories (proves the design; needs IES).
- **Stage 3 — factory approved:** + all accessories/items filled in.
- **Stage 4 — output:** engine run → RunTable + payload + IES. **Deliberately OFF (fail-closed) until Stage 3 is trustworthy.**

## Current state (what the last session left)
- **Selector:** done. **Run intake:** done. **Stage 3B (accessory/factory-approved):** actively hardening — join rules, board packing/split, do-not-bridge, electrical topology; mostly "represented, not physically enforced" with join-sensitive cases fail-closed. **Stage 4:** off; the safe narrow output-summary handoff chain (selected-result → RunTable narrow rows → IES metadata → manifest) is being wired as summaries only, generation disabled.
- **Shell:** was dead at boot from a `node:crypto` import in the browser path; fixed.
- **Selector shape+order contract:** ~implemented and verified in `packages/workspace-kernel/selectorReferenceOptionsService.js` — source order preserved (no more `localeCompare`), explicit default marker (`is_default`), `canonicalCctCriToken` paired CCT/CRI, `source_valid`/`diagnostic_unmapped` statuses, no fake values emitted, empty fields fail closed. **Remaining: Fix 5 — source-version/stale binding** (bind emitted options + selected values to a source fingerprint; on resync, removed values flip to `diagnostic_unmapped` stale). Plus a cosmetic swap of `default-preview` stand-in vocab in `selectorState.js`.

## The lab lane boundary (critical — this is where the two lanes meet)
The lab lane emits a **safe handoff** and a **project IES export**; the runtime consumes ONLY those. The runtime must **never** import raw lab transforms.
- Runtime may call only: `buildSafeHandoff(record)`, `buildProjectIes(reference, runLengthMm, job)`, and guarded recipes (`mergeOptics`, `rotate`).
- **`safe-runtime-handoff.v1`** carries opaque refs + fingerprints + readiness only (`handoffState: "ready"|"blocked"`, `oneMmNormalised`, `baseLengthM: 0.001`, `sourcePhotometryRef`, `photometryReferenceFingerprint`, `sourceInputFingerprint`, `recordFingerprint`, `derivedFromFingerprint` (null on a reference), `oneMmPolicyLabel`, `safeSummaryOnly: true`, `readOnly: true`, plus board/runtime-owned null slots `lumenCurveReferenceToken`/`driverUtilCurveReferenceToken`/`boardDataSourceVersion`/`selectedFamilySubsetLock` which the RUNTIME fills from board data). No candela, keywords, mutation log, or proprietary data ever cross the boundary.
- **In flight:** the first runtime adapter — `packages/workspace-kernel/labIesSafeHandoffAdapter.js` + wiring into `iesBuilderStatusService.js` — read-only, consumes the safe handoff, fills the board null slots, fails closed on any raw field or non-ready/non-readonly/non-summary handoff. Match forbidden fields by EXACT name, not substring (the required field names contain "photometry").

## Open work, prioritised
1. **Runtime safe-handoff adapter** (in flight) — finish/verify it read-only; no generation.
2. **Project IES export boundary** — later; call `buildProjectIes(...)` only after approved reference + resolved run length + aligned fingerprints.
3. **Fix 5** — selector source-version/stale binding (contract close-out).
4. **Board lumen-curve prewarm** — DONOR capability (`lib/planning/board_lumen_util.py`: family grouping + curve-index manifest + `get_board_lm_per_m(current, temp)`) NOT ported to runtime; runtime uses only the 25 °C headline. Blind spot in prior audits. Stage 4 dependency for trustworthy output.
5. **IES scaling / engine output** — Stage 4; note `lib/payloads/ies_scale.py` is a donor STUB (design work, not a port).
6. Continue Stage 3B enforcement (joins, packing, electrical) toward real donor parity.
7. **Downstream modules (scene builder, compliance matters, coordinated surfaces, emergency/EGRES): mounted but data-starved.** All four already mount in the shell as read-only diagnostic panels consuming the `downstream` context (a placeholder) — do NOT mistake a mounted diagnostic for a finished module. Each needs two independent tracks: **data-unlock** (the Stage 4 output projection: selected-result → RunTable → payload) and **donor-port** (`lib/scenes`, `lib/compliance`, DXF/coordination, `lib/emergency`). The single unlock for all four is defining the selector/engine output shape; they then light up in dependency order (scene builder first, EGRES last). See `ControlStack_gap_register.md` section D.

## Method & guardrails (hold these)
- Fail-closed everywhere; represented ≠ enforced; keep join-sensitive/broad cases blocked until proven.
- Canonical field names only (`target_lm_per_m`, `cct`, `cri`, `optic`, `control_type`, `cctCri`; board `board_capacity_lm_per_m`, `c1_lumen_imax_25c`, `novon_family`, `board_uid`). Never invent alternates.
- Keep text (keywords) separate from data (candela/geometry) edits.
- One tool per commit; golden/parity tests as the bar; no chaff in commits.
- After every change, tell Pat plainly: what you touched, one thing he can click/run to confirm, and what he should see.

## Before you act
Confirm your understanding back to Pat in the proof-of-read tables, state the one current front-line task, and wait for his go. Do not open new lanes or touch the lab lane, `server.js`, or shell startup without explicit approval.

---

## Appendix — what changed in the parallel lab lane this session (NOT in the previous orchestrator's durable docs)

This work happened in a separate lane (Pat + an assistant), so the prior session's `CURRENT_STATE.md`/`SESSION_END_HANDOFF.md` will not describe it. It is real, committed, and it is what the runtime now integrates with.

### The lab IES toolkit is COMPLETE and isolated
- Location: `C:\ControlStack_Lab`, branch `lab-ies-toolkit` (a git worktree of the runtime repo). Package root `packages/lab-kernel/ies-toolkit/`. Never imported by `shell.js`/`services.js`/selector/runtime kernel.
- 14 tool files, all golden-tested and browser-safe (no `node:` imports): `iesParse`, `iesWrite`, `iesShared`, `iesMetrics` (flux/peak/beam/lm-per-w/m), `iesInspect` (+ `inspect.mjs` viewer), `iesOneMm` (1mm scale), `iesLabForm` (record-maker: BASE_LAB_FORM merge, kind-aware + alias), `iesProvenance` (content fingerprint + mutation log), `iesApproval` (reference gate), `iesHandoff` (safe handoff), `iesTransforms` (mirror/scale/mask/flip/merge/resample/dims/flags + governed `applyEdit`), `iesGuards` (preconditions + `mergeOptics` recipe), `iesProjectIes` (downloadable output), `iesRotate` (guarded azimuth shift).
- Pipeline: messy IES → check → merge onto template → 1mm record → provenance → approval gate → safe handoff → downloadable project IES scaled to run length (traceable to the golden reference).

### Infra change
- `mcp/controlstack_mcp.py` gained a THIRD root: `lab` → `C:\ControlStack_Lab` (additive; `repo`/`runtime` behaviour unchanged). This is how the assistant writes to the lab worktree.

### Cross-lane contracts agreed (these bind the runtime you now build)
- **Recipes-only rule:** the runtime calls only `buildSafeHandoff`, `buildProjectIes`, `mergeOptics`, `rotate` — never raw transforms.
- **`safe-runtime-handoff.v1`** field set (see main body) — the lab emits it; the runtime adapter fills the board-owned null slots and fails closed on any raw field. `rawExposed` was removed from the handoff to avoid colliding with the adapter's forbidden-field check; match forbidden fields by EXACT name.
- **`BASE_LAB_FORM` (novondb) gained two columns:** `kind` (`ies`|`lab`|`check`) and `gates_reference` (`y`/`n`). Everything gates except `[SEARCH]`. Three `check` rows added: `_BCLT_APPLIED`, `_FLAGS_CHECKED`, `_POWER_APPROVED`. Tools tolerate the columns being absent. (A record can't be stamped `reference` until all `gates_reference` fields are filled and all checks ratified.)
- **1mm JSON is the lab authority object;** the outgoing project IES is stripped of governance/proprietary fields and back-references the reference fingerprint.

### Verification findings from this session (carry these)
- **Shape+order contract: ~implemented** in the runtime and verified (source order, default marker, `canonicalCctCriToken`, `source_valid`/`diagnostic_unmapped`, no-fakes, empty-fail-closed). Remaining: **Fix 5 source-version/stale binding**, and cosmetic `default-preview` vocab in `selectorState.js`.
- **Board lumen-curve prewarm** is a donor capability (`lib/planning/board_lumen_util.py`) NOT ported to the runtime — a blind spot in prior audits, and a Stage 4 dependency.
- **`lib/payloads/ies_scale.py` is a donor STUB** — IES scaling is design work, not a port.

### Where the durable context lives on our side (read if useful)
`ControlStack_finish_line_map.md` (running scoreboard + status log), `ControlStack_gap_register.md` (donor→runtime parity register), `ControlStack_shape_contract_status.md`, `ControlStack_lab_toolkit_handoff_for_CP.md`, `runtime_adapter_brief_addendum.md`, `BASE_LAB_FORM_v2.csv`.
