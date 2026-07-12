# Human-facing TODO — port board lumen-curve prewarm to runtime

**Status:** DEFERRED / not yet in the runtime. Identified by audit, 9 July 2026. This is a Stage 4 (engine/output) dependency — the engine cannot compute accurate operating-condition lumens without it.

## What the real data holds

Each BOARDS row (in `data/novondb.json`) carries **headline** capability inline: `c1_lumen_imax_25c` (lumen at max current at 25 °C), `c1_imax_ma`, `c1_pmax_w`, `c1_vmax_v`, plus `family` / `novon_family` / `board_uid`, `pitch_mm`, `length_mm`, and `curve_source` (`real` vs `synthetic`). The **full lumen-vs-current-vs-temperature curve** lives in separate files, indexed by a manifest and resolved per board.

## What the donor does (and the runtime does not)

Donor, in `lib/planning/`:
- `pitch_resolver.py` — groups boards by `novon_family`, filtering CCT/CRI first.
- `board_lumen_util.py` — `prewarm_lumen_curve_cache()` loads a **curve index manifest**, resolves each board's curve **file path** (by `part_number` + `length_mm`), and warms caches so later lookups are cheap; `get_board_lm_per_m(board, current_ma, temp_c)` returns the real derated lumen at a specific current and temperature.
- `lm_per_m_at_temp.py`, `electrical_validator.py`, `run_engine.py` consume family + CCT/CRI + curve data.

Runtime, in `packages/`:
- No prewarm, no curve manifest, no per-current/temp curve lookup, no board-family grouping.
- Uses a hardcoded single board length (`STAGE3B_SELECTOR_BOARD_FAMILY_LENGTHS`, pitch 70) and only the inline 25 °C headline as a diagnostic against a controlled static target (`CONTROLLED_TARGET_LM_PER_M = 1000`).
- "family" in the runtime today = control-protocol family (dali/dmx/wireless), **not** board family.

## Why it matters

The engine's job is to produce real lumen output at the board's **actual operating current and temperature** (derated), not the 25 °C max headline. Without the ported curve subsystem, the runtime can only reason about the headline number — good enough to prove the mechanics, not to produce trustworthy photometric output. This must land before Stage 4 output can be believed.

## The TODO (for a human to schedule)

1. Port the curve-index **manifest** + curve **files** into the runtime data location, with a path per board (or a derivation from `board_uid`/`part_number`/`length_mm`).
2. Port **family grouping** by `novon_family` (with `family`/`board_family` fallback) and CCT/CRI filtering.
3. Port **prewarm** (resolve + cache curve files once a family set is known) and the **`get_board_lm_per_m(current, temp)`** lookup.
4. Wire these into the runtime engine path so `target_lm_per_m` (intent) reconciles against real derated capacity, not the 25 °C headline.
5. Honour `curve_source` (`real` vs `synthetic`) so synthetic curves are flagged, not silently trusted.

## Acceptance (visible)
- A chosen board family resolves to a real curve file (path shown), and lm/m at a given current + temperature returns a derated value that differs from the 25 °C headline.
- Prewarm stats (curves loaded, manifest entries) are inspectable.
- Boards with `curve_source: synthetic` are flagged in output.
