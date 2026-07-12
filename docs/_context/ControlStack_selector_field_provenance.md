# ControlStack — selector field provenance map (9 July 2026)

The stable spine: **field key → label → source table**. Values change with each resync; this triple should not. Read-only, no mutation.

## Three behaviours to know

- **Resync (live fields):** read from the NVB snapshot at request time; comma/semicolon/pipe cells are split into options (`split(/[;,|]/)`). Edit source + resync = options change. Same idea as the donor.
- **Order:** the runtime **re-sorts options alphabetically by label** (`localeCompare`). Source-list order is **not** preserved. Defaults come from an explicit "default-preview" marker, **not** from list position. This is a deviation from the donor — flag if order/first-is-default matters.
- **Aliases / fallback:** table-name aliases (`BOARDS/BOARD/boards/board`), case-insensitive column matching, per-field alias column lists, missing-header fallback (`column_N`), regex CCT extraction. Plus: a selected value not found in source is shown as its own option (can mask a mismatch).

## The 17 fields

Live = options built from real NVB data now. Future-mapped = declared, not yet wired; a hardcoded stand-in is used meanwhile.

| Field (label) | key | Live now? | Real source table(s) | Live example (from your data) | Hardcoded stand-in in use | Shape/vocab flag |
|---|---|---|---|---|---|---|
| System | system | ✅ live | SYSTEM | DNX 45 (`45\|Square`), DNX 60 (`60\|Square`), DNX 60 Beam DI (`60\|Beam`) — 8 | — | value carries `ref\|variant` |
| Application / environment | application | ⬜ future | SYSTEM_POLICY | — | (none seen) | — |
| Interior / exterior | interiorExterior | ⬜ future | SYSTEM_POLICY, OPTICS | — | (none seen) | — |
| CCT | cct | ⬜ future | BOARDS, OPTICS, SYSTEM_POLICY | — | `3000K / 4000K(default) / tunable-white` | real BOARDS pairs CCT+CRI (`cctCri`) |
| CRI | cri | ⬜ future | BOARDS | — | `CRI80(default) / CRI90` | paired with CCT in real data |
| Target lm/m | targetLumensPerMetre | ⬜ future | BOARDS | — | `800 / 1200(default) / 1800` | real value comes from actual boards, not fixed buckets |
| Optic | optic | ✅ live | OPTICS | Asymmetric·60, Comfort·45, Comfort·60 — 10 | `opal / microprism / linear-lens` | **vocab mismatch**: stand-in names ≠ live names |
| Control type | controlType | ⬜ future | DRIVERS, SYSTEM_POLICY | — | (list present) | — |
| Driver (consequence) | driver | ⬜ future (auto) | DRIVERS | — | rule: lm/m=1800 → high-output-driver | consequence, not a pick |
| IP | ipRating | ✅ live | OPTICS, SYSTEM_POLICY | IP20, IP40, IP44, IP65 — 4 | (static list) | — |
| IK | ikRating | ✅ live | OPTICS, SYSTEM_POLICY | IK10, Non — 2 | `IK07(default) / IK08 / IK10` | **mismatch**: stand-in IK07/08 not in live set |
| Mounting | mountStyle | ✅ live | SYSTEM, ACCESSORIES, SYSTEM_POLICY | Recessed, Surface Mount, Suspended, T-Bar Modular — 5 | — | — |
| Finish | bodyFinish | ✅ live | SYSTEM(/ACCESSORIES), SYSTEM_POLICY | Black (Textured), Silver Kinetic, Custom, TBD — 5 | — | — |
| Emergency | emergency | ⬜ future | ACCESSORIES | — | (none seen) | — |
| Egress light | egressLight | ✅ live | ACCESSORIES | EM — Maintained, Non-Maintained, Sustained, DC Mains — 5 | — | — |
| EWIS / sound | egressSound | ✅ live | ACCESSORIES | EWIS Cartridge — 1 | — | — |
| Sensor | sensor | ✅ live | ACCESSORIES | PIR 5m, PIR 8m, Microwave, Blank Cover — 4 | — | — |
| Accessories | accessories | ⬜ future | ACCESSORIES | — | (none seen) | — |
| Special parts (consequence) | specialParts | ⬜ future (auto) | ACCESSORIES, SYSTEM_COMPONENTS | — | — | entitlement-gated |

(Server-side field map also defines a fuller "Light & Control" section with direct + indirect variants — `targetLmPerM`, `cctCri`, `controlType`, and indirect twins — all sourced from BOARDS/DRIVERS. These are the real live-path fields the stand-ins above will resolve into.)

## What to lock as the provenance contract

1. **Keys + labels + source tables** — already stable. Keep them canonical; this is your trail.
2. **Order** — currently NOT stable (alphabetised). If you want programmer-chosen order and first-is-default, that must be added explicitly (e.g., an order/priority column or preserve source row order) — otherwise every resync re-alphabetises.
3. **Stand-in vocab must match real vocab** — optic (`opal` vs `Asymmetric`), IK (`IK07/08` vs `IK10/Non`), and CCT/CRI (separate vs paired) don't match today. Shape the stand-ins to the real data now so livening is a swap, not a rebuild.

## Honesty notes
- Live examples pulled from the running read-only endpoint; hardcoded stand-ins read from the selector module's state file; ordering/alias behaviour read from the options-service code. I inferred the real BOARDS row shape from the code that reads it (paired `cctCri`, column aliases), not from a raw board row — the browser froze before I could pull one. Worth confirming against one real board record.
