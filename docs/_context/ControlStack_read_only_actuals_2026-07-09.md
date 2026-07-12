# ControlStack — read-only actuals (9 July 2026)

**How this was made:** pulled live from the running runtime's read-only (GET) endpoints and its source code. No mutation — the runtime's own status confirms every write/generate flag is off (`selectorMutationEnabled: false`, `iesGenerationEnabled: false`, `runtimeDataMutationEnabled: false`, etc.). This is the actual state, not a narrative about it.

---

## A. Selector — what it actually offers right now

Pulled from `/api/selector-reference/options`, reading your real product data.

- **Source:** `runtime-authority-reference-active-snapshot` — your live NVB snapshot, 985 KB, last modified **8 Jul 2026**. Source is present, readable, parseable.
- **Overall status:** `preview-with-blockers` (works as a read-only preview; resolving/committing is still gated off).
- **17 fields total. 9 are live with real options; 8 are placeholders ("future-mapped") not yet wired.**

This is a concrete, visible gauge of how complete the "spec ready" input layer actually is.

### Live fields (real options, from canonical source tables)

| Field | Options | Example values | Source table(s) |
|---|---|---|---|
| System | 8 | DNX 45 (`45\|Square`), DNX 60 (`60\|Square`), DNX 60 Beam DI (`60\|Beam`) | SYSTEM |
| Optic | 10 | Asymmetric · 60, Comfort · 45, Comfort · 60 | OPTICS |
| IP | 4 | IP20, IP40, IP44, IP65 | OPTICS, SYSTEM_POLICY |
| IK | 2 | IK10, Non | OPTICS, SYSTEM_POLICY |
| Mounting | 5 | Recessed, Surface Mount, Suspended, T-Bar Modular | SYSTEM, ACCESSORIES, SYSTEM_POLICY |
| Finish | 5 | Black (Textured), Silver Kinetic, Custom, TBD | ACCESSORIES, SYSTEM_POLICY |
| Egress light | 5 | EM — Maintained, Non-Maintained, Sustained, DC Mains | ACCESSORIES |
| EWIS / sound | 1 | EWIS Cartridge | ACCESSORIES |
| Sensor | 4 | PIR 5m, PIR 8m, Microwave, Blank Cover | ACCESSORIES |

### Placeholder fields (declared, no options yet — "future-mapped")

Application / environment · Interior / exterior · CCT · Control type · Driver (auto-consequence) · Emergency · Accessories · Special parts (auto-consequence)

**Honest read:** the spine's first stage isn't a single on/off — you can see it's ~half wired. The core physical choices (system, optic, IP/IK, mounting, finish, egress, sensor) pull real canonical values. The environment/CCT/control/driver/emergency/accessory consequences are still stubs. That's a real, countable gauge you can watch fill in.

### On your canonical-names worry
Good news here: the selector's option **values** are canonical — they're `db-reference-backed` straight from SYSTEM / OPTICS / ACCESSORIES, not invented. Where invented names are more likely to creep in is the **output** layer (manifest field names, slugs, IES record keys). When generation switches on, that's where I'll audit names against your canonical NVB tables and flag drift early — before anything downstream hard-codes a wrong one.

---

## B. The IES manifest CoPilot just landed — what it actually is

From `iesFirstNarrowCandidateOutputManifestSummary.js`.

**What it is:** a **manifest / record** — think of it as the index card or cover sheet for a future IES output. It ties together the three pieces of an output and stamps them so they can be trusted and traced:

1. the RunTable narrow rows (what was built),
2. the IES metadata handoff (the photometry reference),
3. the IES candidate output summary,

plus **counts** (boards, segments, zones, reserved ranges, clip/suspension points per row), **fingerprints** (policy, source, input, board-data version), and a wall of **safety flags** (all the "this is a summary only, redacted, read-only, not production proof, no file written" guardrails).

Where it's written: `projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputManifestSummary`.

**What it is NOT (important):** it is **not the IES photometric file itself**. It deliberately blocks raw IES text, candela grids, photometry payloads, filenames, and base64 — those are explicitly listed as unsafe and excluded. So your instinct that "this sets the base structure for future IES building" is right *in spirit* — but it's the base structure for the **record that wraps and describes** an IES output, not the light-distribution data format. The actual IES file format is a separate future piece.

**Its structure, grouped (from the defined field order):**

- **Identity:** schemaId, schemaVersion, contractId, owner, slotOwner, target kind, module/consumer module.
- **State:** currently an empty/"waiting" shape — generation is off, so it's the template, not a filled result.
- **Readiness flags:** runTableFirstNarrowRowsReady, iesFirstNarrowMetadataHandoffReady, iesFirstNarrowCandidateOutputSummaryReady, readyForManifestBoundary, readyForFutureOutput.
- **Counts:** source RunTable rows, candidate-output records, manifest entries, and per-first-row: boards, segments, zones, clip points, suspension points, gear-tray plan, reserved ranges.
- **Traceability fingerprints:** policyFingerprint, sourceFingerprint, sourceInputFingerprint, boardDataSourceVersion + the sub-schema ids/versions/states it links to.
- **Guardrails (all false):** manifestFileOutputEnabled/Written, productionProof, labProofAuthority, plus raw-exposure blocks.

So: it's a solid, well-guarded **template for the output record**. It's real and it's there — this is you seeing it.

---

## How to use this going forward
Any time you want to see the actual rather than trust the description, ask me to "show the actual X" and I'll pull the read-only view — selector options, a written manifest, a status summary, whatever exists — and render it plainly. When generation turns on, this same method becomes the donor-vs-runtime comparison.
