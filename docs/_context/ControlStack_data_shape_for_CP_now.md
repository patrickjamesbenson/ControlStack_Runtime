# Data shape — what CP needs to know now

Distilled from our audit of the real BOARDS table, the selector, and the 1mm/IES contracts. These are shape decisions being baked into the engine/output plumbing right now — cheap to honour now, expensive to retrofit. Through-line: **values change; labels, keys, order and pairings do not.**

## 1. Board capacity ≠ selector intent; real lumen is a derated curve
- Runtime already separates `board_capacity_lm_per_m` (source) from `target_lm_per_m` (intent). Keep it.
- **Watch:** the true board lumen is the per-current/temperature **derated curve**, not `c1_lumen_imax_25c` (the 25 °C max-current headline). That curve subsystem (donor `board_lumen_util.py` prewarm + `get_board_lm_per_m`) is **not ported**. Leave a seam in RunTable/IES output so output is not silently built on the 25 °C headline.

## 2. CCT and CRI — two lookups joined into one selection
- In NVB they are **two separate fields** (`c1_cct`, `c1_cri_min`; also `c2_…`) — two lookups.
- They are **joined into a single paired selection** (`cctCri`) so it's one click for two items, because a physical board carries a specific CCT+CRI together.
- **Already correct in the live path:** `cctCriValues()` reads the two columns and joins them into a `cctCri` option (and also exposes standalone `cct`). Keep it. Downstream/output shape should **preserve the join**, not re-split into free-mix dropdowns.
- The only place CCT/CRI is wrongly separate is the selector module's **hardcoded preview** values — already covered by the stand-in vocabulary fix. Not a live-path gap.

## 3. Reuse canonical data field names; never invent
- Provenance spine = `key + label + source table`.
- Canonical data fields to reuse: `target_lm_per_m`, `cct`, `cri`, `optic`, `control_type`; board: `novon_family`, `board_uid`, `board_capacity_lm_per_m` / `c1_lumen_imax_25c`, `pitch_mm`, `length_mm`, `curve_source`.
- Internal contract names (schema ids, manifest keys) may be coined freely; **data** field names must not be renamed.

## 4. 1mm JSON is the photometric authority; IES is a stripped derivative
- The golden **1mm JSON** holds full fidelity + provenance/mutation history/approval state (matches your `oneMmPolicy` / `labProof` contract).
- The outgoing Project IES is length/temp/candela/power-multiplied, **stripped of proprietary fields**, and **back-references** the job's 1mm JSON.
- IES metadata handoff/manifest should treat the 1mm JSON as an **opaque source-of-truth reference + job backref**, and never assume the IES carries full fidelity. (Raw-IES redaction already correct — keep it.)

## 5. Option lists: order, delimiters, vocabulary
- Preserve **source order** and **first-is-default** (runtime currently alphabetises — that drops author order).
- Option cells are delimited on `;` `,` `|` (matches donor; real BOARDS `control_type_options` is comma-delimited).
- Use **real** source vocabulary, not invented preview tokens.

## Already correct (keep doing)
- Capacity/intent separation. Raw-IES/candela/photometry redaction. Fail-closed gating. Fingerprints.
