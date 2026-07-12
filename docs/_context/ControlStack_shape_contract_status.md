# Selector shape+order contract — implementation status (verified 9 Jul)

> NOTE (12 Jul): Fix 5 has since LANDED in the live runtime (see the finish-line map). This file is the 9 Jul snapshot, kept for the record.

Checked against the live runtime `packages/workspace-kernel/selectorReferenceOptionsService.js` (main). CP has implemented almost the whole contract. One real item remains, plus one cosmetic.

## ✅ Done (verified in code)

| Item | Evidence |
|---|---|
| **Value vs label** — match on machine `value`, not label | selected value tagged `source_valid` / `diagnostic_unmapped` on the value |
| **Fix 1 — source order preserved** | `optionsFor()` returns `Array.from(bucket[fieldKey].values())` — insertion/source order, no `localeCompare` (the alphabetise is gone) |
| **Fix 1 — explicit default marker** | `sourceDefaultMarkerValues()` reads `is_default`; options carry `isDefault` / `explicitDefault` / `defaultSource: "source-marker"` (not first-is-default) |
| **Fix 2 — no invented values (live path)** | `createUnavailableField(… no fake values emitted)`; a field with no source stays `future-mapped`, never filled with placeholders |
| **Fix 3 — CCT/CRI authoritative paired token** | `canonicalCctCriToken({cctToken, criToken})`, `cctCri` field with `pairAuthority`, display helpers |
| **Fix 4 — no silent promotion of unknowns** | `diagnosticUnmappedSelectedValue(… not inserted into source-valid options)` |
| **Fix 6 — empty field fails closed** | unavailable/`future-mapped` with reason; blocked options "shown as blocked rather than removed" |
| **Fix 7 — delimited cells → ordered option values** | `splitOptions()` on `; , |`, order preserved by insertion |
| **Acceptance (a)** — every emitted option value exists in source | enforced by "no fake values emitted" + options built only from source |
| **Acceptance (b)** — every selected value is `source_valid` or `diagnostic_unmapped` | implemented as the value-status pair |

## ⬜ Remaining

1. **Fix 5 — source-version binding + stale re-validation.** Not found in the option path (no `sourceInputFingerprint` / `boardDataSourceVersion` / stale check tied to emitted options). This is the one real gap. Needed: stamp each emitted option set and each selected value with the source fingerprint/version it validated against; on resync, re-validate; a value no longer in the new source flips to `diagnostic_unmapped` (stale), never silently retained. This is what makes the "edit list + resync" loop safe.

2. **Fix 2 residual (cosmetic).** The selector *module* (`packages/modules/cs-selector/selectorState.js`) still ships `default-preview` stand-in values (`opal`, `IK07`, etc.). The live options service already emits no fake values, so this is preview-only — but the stand-ins should either be swapped for real sample values or clearly kept as `default-preview` and never treated as source-valid.

## Suggested close-out for CP
> The shape+order contract is verified as ~implemented — source order, explicit default marker, cct_cri paired token, source_valid/diagnostic_unmapped, no-fake-values, and empty-fail-closed are all in. Two items left: (1) **Fix 5 — source-version/stale binding** (the real one): bind emitted options + selected values to a source fingerprint and re-validate on resync, flipping removed values to `diagnostic_unmapped` (stale). (2) the module `default-preview` stand-in vocab is cosmetic — swap for real sample values or keep clearly preview-only. Everything else on the contract is done.
