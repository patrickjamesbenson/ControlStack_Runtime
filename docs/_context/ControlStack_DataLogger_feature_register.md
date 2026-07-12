# ControlStack — DataLogger framework: feature register (for CP)

*Features surfaced while building the lab provenance record. These belong in the **shared DataLogger framework** (fingerprint + seal + mutation log) because multiple modules will reuse them — not one-off lab code. Recorded here for CP to implement; lab HTML is the working spec that exercises each one.*

**Substrate already in place** (`packages/lab-kernel/ies-toolkit/iesProvenance.js`): content `fingerprint` (cyrb53, "safe-" prefix), `sealOrigin` (immutable seal), append-only `mutationLog` with input→output fingerprints and approval reset. New features should extend this, not replace it.

---

## F1 — External source register + freshness check  *(status: recorded · scope-out soon)*

**Problem it solves.** References cite external documents (datasheets, LM-80/TM-21 reports, converter specs, standards). Vendor URLs rot and PDFs get silently replaced. We need to prove *what we relied on* and *know when the world moved*.

**Principle: snapshot AND record the URL — both.**
- **Snapshot** the document on intake, fingerprint it with the existing `fingerprint()`, store the sealed copy in `lab/sources/`. This is the truth we relied on (URLs are not durable). Same principle as sealing `origin.ies`.
- **Record source metadata** so it can be re-checked later.

**Record shape (one per external document):**
```
source {
  id, kind,                       // e.g. "datasheet", "lm80", "standard"
  url, publisher, publisherVersion,   // "zencontrol", "S1 v1.2 2023-08-30"
  fetchedAtUtc,
  snapshotPath,                   // lab/sources/<HASH>__<publisherVersion>.<ext>
  snapshotFingerprint,            // reuse fingerprint()
  status,                         // fresh | changed | gone | unchecked
  lastCheckedUtc,
  checkLog: [ ... ]               // append-only, like mutationLog
}
```

**Freshness job (scheduled, e.g. weekly).** Re-fetch each registered URL; decide by HTTP status + ETag/Last-Modified, falling back to re-hash vs `snapshotFingerprint`. Three outcomes:
- **unchanged** → log, done.
- **changed** → new version available; do NOT auto-trust. Flag every reference that cites this source as *"source drifted — re-verify"* (fail-closed). Surfaces in the data-source overlay as a stale pill.
- **gone (404)** → flag source obsolete; references built on it flagged for review.

**Scope boundary (agreed).** Keep it to *watching known sources* for change/rot + a targeted diff on a known product/download page for new SKUs. **Not** open-ended web discovery of new components — that's a deeper, noisier job that, if built another day, likely lives **outside** this framework and merely *feeds in* once a candidate is surfaced.

**Open question for CP/Pat.** Is "changed → re-verify" a **person's job** (queue for a human) or an **automated re-run** where possible? Recommendation: automated *detection* always; human *sign-off* on any reference whose source changed (matches the promotion gate — evidence changes reopen approval).

**Reuse map.** `fingerprint()` → snapshot hashing + change detection · `mutationLog` pattern → `checkLog` · promotion/approval reset → the "source drifted" reopen · data-source overlay (provenance HTML) → per-source freshness pill.

**Modules that will use it.** Lab references (datasheets/evidence), selector (converter + component sources), any module citing an external standard or vendor doc.

---

## Store additions this implies
```
lab/sources/
  register.json                       # the source records above
  <HASH>__<publisherVersion>.pdf      # sealed snapshots
```
(Extends the reference store in `ControlStack_Lab_data_sources_and_store_spec.md`.)

---

## F2 — AI-assisted intake classifier  *(status: recorded · demonstrable now)*

**Problem it solves.** The lab ingests mixed objects (optic IES files, converter datasheets, LM-80/TM-21 reports, thermal/power records). The *route* is a fixed contract, but a human shouldn't have to hand-classify every upload and hand-wire every connection.

**Principle: AI proposes, the contract disposes.** On upload, a classifier reads the object and returns a *suggestion*, never a decision:
```
intake {
  fileName, receivedAtUtc,
  proposedType,            // "optic" | "emergency-converter" | "lm80" | "tm21" | "thermal" | "power" | "component" | "unknown"
  confidence,              // 0..1
  evidenceForGuess,        // e.g. "IESNA:LM-63 header + [LUMCAT] DNX-80…"
  extractedFields,         // parsed identity (manufacturer, lumcat, drive current, CCT/CRI, converter model…)
  proposedDestination,     // store path (lab/references/<REFID>/… or lab/sources/…)
  proposedConnections,     // base engine id, capability, module family, existing refs
  humanConfirmed: false    // gate: nothing loads/seals until true
}
```
The human confirms or corrects; only then does the existing deterministic load + `sealOrigin` run. Fail-closed preserved: low confidence or `unknown` → forced human classification; AI never writes a reference or satisfies a gate on its own.

**Worked example (real uploads, 12 Jul 2026).**
- `DNX-80-D-940-P21.ies` → type **optic** (high). Extracted: NOVON Dynamix DNX-80, CRI90/4000K, 21 W/m, 2490 lm, LEDLab 18/08/2025, `[BALLASTCAT] … 825 mA`. Proposed: new optic reference; connect to DNX-80 base engine; operating current 825 mA.
- `zc-em-smart_converter_Leaflet_Datasheet_w.pdf` → type **emergency-converter** (high). Proposed: attach as `EMERGENCY-CONVERTER` evidence; link to `zencontrolEmergency.js` (zc-em-smart family); source URL https://zencontrol.com/wp-content/uploads/products/datasheets/zc-em-smart_converter_Leaflet_Datasheet_w.pdf (feeds F1 source register).

**Boundary.** Classifier is a suggestion + confidence + reasons. It pre-fills the intake form; the contract validates and gates. Keep the "why" visible so a human can judge the guess.

**UI note (answers the UI-vs-contract worry).** Building from the UI is fine — the intake screen is the human face of the same contracts. The route stays the route; AI just makes the first pass so the human confirms instead of types.

---

*Next features to add here as they surface: (placeholder).*
