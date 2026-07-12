# UGR verification status — lab IES toolkit (`iesUgr.js`)

**Date:** 10 Jul 2026. **Scope:** CIE 117-1995 / CIE 190:2010 comprehensive UGR table, computed in the isolated lab lane.
**Bottom line: CLOSED.** Full CIE 190:2010 procedure implemented (`iesUgrCie190.js`) from the standard's preset Tables 2–5 and the zonal-flux worksheet, and **verified against the standard's own worked example**: 2H×4H, 70/50/20 → crosswise **11.0**, endwise **13.1**; EWID **27.37 lx**; zonal fluxes 338.5/534.4/621.3/650.1 — all reproduced to the decimal (golden test `iesUgrCie190.test.js`). Q1 (background/interreflection) and Q2 (finite half-spacing array + Table 2 `n/a` glare-source mask + C+90 endwise rule) are resolved directly from CIE 190. The earlier heuristic is retired from the UGR page.

> **Historical note (below):** the Q1/Q2 diagnosis that led here — DNX isolating the background magnitude, the grazer proving the array/field rule was material — is retained for the record. Both are now answered by the standard.

---

## Verified / implemented

| Item | Status | Evidence |
|---|---|---|
| UGR aggregation `UGR = 8·log10(0.25·G/Lb)`, `G = Σ Lᵢ²ωᵢ/pᵢ²` | ✅ correct structure | matches CIE 117 basic equation |
| Two-angle Luckiesh–Guth position index `p(α,β)` | ✅ **golden-tested** | all 8 CIE reference vectors pass (`tests/lab-kernel/iesUgr.test.js`); `p(0,90)=116.6526`, `p(90,90)=9.8142`, etc. |
| `Lb = E_ind/π` | ✅ correct form + tested | `backgroundLuminanceFromIndirect(100)=31.831` |
| External authoritative `Lb` / `E_ind` input | ✅ implemented, provenance-tagged | `backgroundLuminanceMethod` ∈ {`external_specific_room`, `external_cie190_standard_room`, `experimental_heuristic`}; kept separate from heuristic |
| Per-cell diagnostics (`G`, `Lb`) | ✅ exposed | enables the implied-Lb / implied-G back-out |
| Table shell (layout) | ✅ matches Viso | white bg; reflectance header, 19 room shapes, crosswise/endwise, S-footer |

## The two-luminaire diagnostic (why Q1 and Q2 are separate + material)

Method: G is reflectance- and Lb-independent, so we compute G from the file and back out the reference-implied Lb per cell: `Lb_implied = 0.25·G / 10^(UGR/8)`.

**DNX-80 (symmetric downlight) → isolates Q1.**
Glare sum G agrees with the reference (crosswise ≈ endwise, ratio matches the UGRs). Implied Lb is **~5–7× our heuristic** (Viso implies ~340–420 cd/m²; heuristic gives 49–85). The whole DNX error is background-luminance **magnitude**.

**GRAZER 8°×45° (asymmetric) → independently proves Q2.**
Controlled 2H×2H **square** room (walls identical both directions, so Lb must be direction-consistent — confirmed by the DNX: 340 vs 321). There, our **endwise glare sum is ~6.5× too low** (needed G_end ≈ 160,000 for Lb≈400; computed 24,600), while crosswise matches. Direction of the error rules out real Lb orientation-dependence (the grazer's wide throw would *raise* endwise Lb, but the implied value is *lower*). So this is a glare-sum/array effect ≈ **6.5 UGR points**, invisible in the symmetric case.

## Open — requires CIE 190 (normative)

**Q1 — Background/interreflection.** The exact procedure for `E_ind` (flux-transfer / zonal-cavity / preset coefficients?), or the intermediate `E_ind`/`Lb` values from the worked 2H×4H example. *Empirical lead:* implied Lb is strongly wall-reflectance-dominated (~30% swing on ρ_wall vs ~6% on ρ_ceiling) and rises with room size → consistent with a wall-cavity transfer `Lb ≈ M_wall/π`, not a whole-room average.

**Q2 — Preset array + source qualification.** Wall-to-first-row/column offsets; centred vs boundary-generated array; finite forward/lateral extent; observer location; viewing-direction convention; field-of-view / angular limits; any apparent-area/solid-angle/visibility qualification before a luminaire enters G; partial-inclusion handling. `S/H = 1.0` is confirmed.

## Practical paths to a verified table now
1. **Acquire CIE 190** → implement both procedures, validate against the worked 2H×4H example + the two vendor tables.
2. **External override** → feed per-configuration authoritative `Lb`/`E_ind` from Viso/Dialux (exact, provenance-tagged) for specific-room results.
3. **Keep the labelled heuristic table** (current default) — clearly marked NOT CIE 190 compliant.

## Note for CP (runtime)
Per the reference's own analysis, the inspected donor runtime (`utils/ugr_table_cie_v2.py`, `assets/lab/lab.js`) still has the two flaws the reference names — a **one-dimensional** Guth lookup and a **proxy** background-luminance calc — unless a newer file has superseded them. The lab toolkit no longer has either (two-angle Guth golden-tested; heuristic isolated + labelled).
