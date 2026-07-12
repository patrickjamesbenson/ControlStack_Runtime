# Output-spine contract & verification — RunTable → lumen → IES

Covers the Stage 4 output chain. Each item is tagged **PORT** (donor implemented it — transcription) or **DESIGN** (donor also missing it — real work). Grounded in donor + runtime code, verified 9 Jul 2026. Read-only audit; nothing changed.

## The chain, in order
selector intent → **RunTable** (physical build per run) → **real lumen** per board at operating current/temp → **IES** (scaled photometry) → downstream.

---

## 1. RunTable generation — PORT
- **Donor:** `lib/planning/run_engine.py` `run_engine(selector_payload)` (~4,100 lines) — implemented.
- **Runtime:** off; only narrow row scaffolds (`runTableFirstNarrowRows.js`).
- **Contract:** port the donor's RunTable output shape faithfully. Keep the runtime's narrow-rows contract as the target shape and widen it to the donor's real columns. Do not invent new column names — reuse donor field names (this feeds the label-level provenance trail).
- **Done (visible):** a real run produces RunTable rows whose columns match the donor's, for the same input.

## 2. Board lumen at operating current/temperature — PORT
- **Donor:** `lib/planning/board_lumen_util.py` (`prewarm_lumen_curve_cache`, `get_board_lm_per_m(current, temp)`) + `pitch_resolver.py` family grouping. (See ControlStack_TODO_board_lumen_prewarm.md.)
- **Runtime:** absent; uses 25 °C headline only.
- **Contract:** port the curve-index manifest, per-family prewarm, and `get_board_lm_per_m`. `target_lm_per_m` (intent) must reconcile against real **derated** capacity, not `c1_lumen_imax_25c`. Honour `curve_source` (real vs synthetic).
- **Done (visible):** lm/m at a chosen current+temp differs from the 25 °C headline; synthetic curves are flagged.

## 3. IES representation / parse — PORT (with golden check)
- **Donor:** `lib/photometry/ies.py` + `utils/ies_lm63_textparser.py` — implemented. Reference: `tests/test_photometry_golden_ies.py` (golden IES output).
- **Runtime:** off.
- **Contract:** port the IES (LM-63) representation. Verify every ported step against the golden IES test — a runtime IES for the golden input must match the donor's golden output.
- **Done (visible):** runtime reproduces the golden IES byte-for-byte (or within defined tolerance).

## 4. IES scaling / base-IES selection — DESIGN (donor is a stub)
- **Donor:** `lib/payloads/ies_scale.py` is an explicit **placeholder** — inputs are captured (`product_slug`, `base_ies_key`, `target_lm_per_m`, `cct`, `cri`) but it "intentionally does NOT produce a scaled IES." So neither donor nor runtime has this.
- **This is real design, not a port.** It must define:
  1. **base-IES selection** — given the selected optic + system + family, which base photometric file is the reference?
  2. **scale computation** — how the base IES is scaled to the selected `target_lm_per_m` using the real derated board lumen (item 2), at the selected `cct`/`cri`.
  3. **guardrails** — no arbitrary/nearest-looking photometry; only approved base references (the selector already warns about this: "No arbitrary IES, generic optic file, nearest-looking photometry… may be used").
- **Done:** a documented scaling method + its own golden test, before any runtime IES-scaling code is trusted.

---

## Sequencing
Items 1–3 are **port** and can proceed in parallel with CP's thin slice; item 4 is **design** and should be specified (by a human, with the donor stub as the starting brief) before it's built. Item 3's golden test and a new item-4 golden test are the verification anchors — build the comparison harness early.

## What this changes in the plan
- Hand CP the **port** items (1–3) as faithful-port contracts once you're verifying, each with its donor source and (for IES) the golden test.
- Flag item 4 as **design-required** — do not let it be quietly implemented as if it were a port, because there's no donor truth to copy and it's where photometric error would hide.
