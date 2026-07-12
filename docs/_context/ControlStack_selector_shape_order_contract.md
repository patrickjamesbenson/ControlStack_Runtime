# Selector shape + order contract — v2 (final, CP tighten-ups folded in)

**Purpose:** lock the selector's label-level provenance so livening the hardcoded stand-ins is a *swap*, not a rebuild. Grounded in the runtime's own code. Read-only audit; no changes made.

**Through-line:** values change; the machine `value` identity, its source order, and its pairings do not. Labels are display only.

---

## Canonical names — do not invent alternates
- Engine required candidate fields: `tier`, `runs`, `lighting`, `target_lm_per_m`, `cct`, `cri`, `optic`, `control_type`.
- Board capacity (source): `board_capacity_lm_per_m` (aliases `lumens_per_m`), `c1_lumen_imax_25c` (lumen at max current, 25 °C).
- CCT/CRI source: `c1_cct`, `c1_cri_min` (per channel; also `c2_…`). Selector intent `target_lm_per_m` is `controlled-selector-intent`, distinct from board capacity.

## Value vs label (backbone)
- The contract is about the option **`value`** (canonical machine identity). Source order and all matching/validation apply to `value`.
- **Labels are display only** — never used for identity, matching, or provenance.

## Fix 1 — Preserve source order; one explicit default
- Options render in **source order** (stop `localeCompare` alphabetising). Order applies to `value` as emitted.
- Default comes from **one** rule: an **explicit default marker in source**. Order and default are independent concepts. (Do not also use "first item = default".)

## Fix 2 — Stand-in vocabulary must equal real vocabulary
- Every hardcoded preview `value` must be a real value valid against its canonical source table. No invented tokens (`opal`, `IK07`, …). Seed previews from actual source values only.

## Fix 3 — CCT/CRI is an authoritative paired token
- The authoritative option is a **single `cct_cri` pair token**, sourced from the real board `c1_cct` + `c1_cri_min` (per channel).
- **Token format:** one agreed canonical form, e.g. `"<cct>|<cri>"` (from `c1_cct`/`c1_cri_min`), emitted and matched identically by every path.
- The selector **may display** separate CCT and CRI rows for UX, but they are non-authoritative — only real, co-occurring `cct_cri` pairs are selectable. No two-independent-dropdowns "cross-check later".

## Fix 4 — No silent promotion of unknowns
- An unknown selected value may appear **only** as a `diagnostic_unmapped` state.
- It must **never** be promoted into the normal (source-valid) option list as if it were source-backed.

## Fix 5 (new) — Source-version binding + stale re-validation
- Each emitted option set and each selected value carries the **source fingerprint/version** it was validated against (`sourceInputFingerprint` / `boardDataSourceVersion`).
- On resync, re-validate: a value no longer present in the new source becomes `diagnostic_unmapped` (stale) — never silently retained. This makes the "edit list + resync" loop safe.

## Fix 6 (new) — Empty field fails closed
- A field with no source-valid option `value`s renders **unavailable/blocked**, not an empty-looking selectable dropdown and not a stand-in fallback.

## Fix 7 (new) — Delimited cells define order
- Each token in a `;` `,` `|` source cell becomes one option `value`; in-cell order **is** source order.

## Acceptance (visible + machine checks)
1. Reorder a source list, resync → options appear in that order (not alphabetised).
2. **Machine check:** for every emitted option, `value` exists in the canonical source set for that field.
3. **Machine check:** every selected value has status `source_valid` or `diagnostic_unmapped` — never silently accepted.
4. CCT/CRI options are real `cct_cri` pairs; `target_lm_per_m` intent stays distinct from board capacity.
5. On resync that removes a value, any selection using it flips to `diagnostic_unmapped` (stale).
6. A field with zero source-valid values shows as unavailable, not empty-selectable.

## Note on verification
Grounded in the engine's canonical required-field list, the board-capacity alias definitions, and the source options service. Raw BOARDS rows are intentionally not exposed by any endpoint.
