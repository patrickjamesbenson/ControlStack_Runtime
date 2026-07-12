# ControlStack Lab — provenance & quality system (map)

*A single picture of how an IES file becomes a controlled, reproducible reference, and where you execute things. Reverse-described from your intent — correct anything that's wrong.*

---

## 1. Three surfaces (where things happen)

| Surface | What it's for | What lives here |
|---|---|---|
| **Engineering Kernel Tools** | *Prove* each function does what it should, in isolation | The leaf tools (parse, symmetrize, scale, beam, polar, UGR…) + one HTML smoke-test page per tool |
| **The Lab** | *Record & control* — the quality system | IES intake → summary → attach documents → ratify → promote to **pure reference**; the reference library; all provenance |
| **The Selector / Project** | *Consume & reproduce* | Picks pure references; applies project mutations (run length…); the project log that lets you regenerate any output |

Tools **compute**. The Lab **certifies and remembers**. The Selector **uses**. Nothing gets certified by a tool alone.

---

## 2. The universal "result card" (your "easy to see when I apply a function")

Every tool's HTML harness shows the **same** result panel, so any function reads the same way:

- **Input** fingerprint (what went in) → **Output** fingerprint (what came out)
- **Before → After** (the visual: polar, or the numbers)
- **Diagnostic table** — the 2–5 numbers that matter for *that* tool (symmetrize → imbalance %; scale → lm/m before/after; beam → C0×C90; UGR → a validated cell)
- **Pass / fail** vs an expected value or a golden

Build it once as a shared component; every harness drops it in. That's the universal display, and it doubles as the smoke test.

---

## 3. The object lifecycle (how you stay in control of an IES)

```
raw IES ──▶ parse ──▶ SUMMARY (read-only)         ← origin sealed here
   │                                               (content fingerprint, immutable)
   ├─ copy-across: IES metadata auto-filled + ticked
   ├─ add lab fields (engine id, board Tc, optic…)
   ├─ attach DOCUMENTS (typed, attested)           ← the evidence
   ├─ ratify checks (BCLT / flags / power)
   ▼
  GATE ──▶ PURE REFERENCE (stamped, fail-closed)   ← can't stamp without required docs + checks
```

- **Every alteration is a logged mutation** with input→output fingerprints, chaining back to the sealed origin. So "how did this differ from the original?" is always answerable, and it always traces to source.
- **Fail-closed:** a record can *never* be stamped a reference unless every gate field is filled and every required document is attached and attested. You can't accidentally tick your way to a reference.
- Any change *after* stamping re-opens approval automatically (the stamp is only valid for the exact content it was applied to).

*(Most of this already exists: `sealOrigin`, `appendMutation` / mutation log, `referenceReadiness` / `promoteToReference`, `BASE_LAB_FORM` with `gates_reference` + `check` rows.)*

---

## 4. Documents = evidence, and they gate capabilities

The key insight you reached: **a tick is not a checkbox — it's an attestation bound to a specific loaded document.**

- A **document** is loaded into the lab, given a **type**, and **attested**: *"this document is the official thermal record for pure-reference gear tray X; it tested the ECG Ta point and the board-family Tc point."*
- A **capability matrix** maps *capability → required document types*:

| Capability | Requires |
|---|---|
| General optical use + IES scaling | optical/photometric test doc |
| **+ Emergency use** | + thermal-battery / emergency-duration doc |
| (future tiers) | + whatever their standard demands |

- A reference's **capabilities = the set unlocked by its attested documents.** No document → no capability. This is the misuse guard: capability is *earned by evidence*, never asserted.

---

## 5. The base engine (gear tray) IS an optic; every optic is a measured ratio to it

The gear tray is not "the thermal/power half." It is a **full photometric reference in its own right** — the *base engine*, measured bare.

- **Pure reference GEAR TRAY (base engine)** — measured **bare**: light **output + distribution** (photometry) **and** **thermal** (board-family Tc points) **and** **power** (ECG Ta, wall/circuit). This is the 100% optical baseline *and* the electrical/thermal reference. Its power↔raw-lumen curves give **raw lumens** at any drive current and temperature.
- **Pure reference OPTIC** — never an independent photometric object. It is characterised **relative to a base engine**: measure base-engine-**with-optic**, then

  > **optic efficiency = with-optic output ÷ bare base-engine output**

  That multiplier is written into the reference. The optic reference carries: the **with-optic distribution** + the **efficiency multiplier** + the optical test doc.
- **Delivered optical output** for any run = gear-tray power/lumen curve (**raw lumens**) **× optic efficiency** (after-loss lumens), **shaped by** the with-optic distribution. This is what feeds the selector and IES scaling.
- This is the **Base Engine / Base Engine & Optic / No Base Luminaire** test-type distinction already in `BASE_LAB_FORM`.
- **The comparison is the engineering signal:** directly comparing bare vs with-optic — output, efficiency, distribution, against thermal and power — is what tells you whether an optic is good as-is or worth improving.

A **usable selector reference = base engine (gear tray) + optic**, where the optic's efficiency and distribution are always defined against *that* base engine. Capabilities = the **intersection** of the evidence on both (an emergency-capable pair needs the emergency evidence on the gear-tray side *and* a qualifying optic).

---

## 6. Pseudo documents (so you can build a 100% working system now)

- Add a **`pseudo` document type**, clearly flagged.
- A reference built with any pseudo document is permanently marked a **TEST reference** — it exercises the entire flow end-to-end, but can *never* be confused with, or promoted to, a production reference.
- This lets you assemble a working pure-reference gear tray and optic today, drive the selector, and prove the pipeline — without waiting for real test reports, and without any risk of a fake slipping into production.

---

## 7. Project record + reproduction (store the recipe, not the artifact)

- A **project** stores: the **reference fingerprints** it used + the **mutations** it applied (run length, etc.) + project detail.
- Any client IES you ever sent is **reproducible** from `reference fingerprint + mutation list + project detail` — so you keep the **recipe**, not a copy of every generated IES.
- Provenance is stored in two places, on purpose:
  1. the **pure-reference state as used** (frozen at the moment it entered the selector), and
  2. the **project mutations** (what the system did for this job).
- The project log / lookup shows: which references, which mutations, which run lengths → "regenerate" at any time.

---

## 8. The path (order of execution)

1. **Prove every tool** — give each a HTML harness with the shared result card (this is what you're already enjoying with UGR + polar).
2. **Document register + capability matrix** — typed, attested documents; `pseudo` support; the capability→docs table.
3. **Lab intake flow** — drop IES → summary → attach docs → tick capability gates → promote → reference library (gear tray / optic).
4. **Surface references to the selector** — the finished 1 mm JSON optics + gear trays appear, tagged with their capabilities.
5. **Project record + reproduce** — mutation log + regenerate-from-recipe.

Steps 1–3 are the "get the quality system rigid" phase; 4–5 make it produce and reproduce.

---

## Resolved (your answers, 12 Jul 2026)

- **Not two objects — a stack.** `chip → board → driver → gear tray → optic → systems`. Each level has its own provenance and proving documents, and proves the level below. Swappable at any level (down to chip), so **chip provenance** is required. The gear tray marries chip+board+driver; the optic sits on the gear tray and carries only limited gear-tray detail (CCT, CRI, lm, temp, powers) with a **click-through** to the full gear tray.
- **Two documents:**
  - **Pure-reference GEAR TRAY = internal adjudication record** ("secret herbs"). Full component stack + **manufacturer claim vs measured, with variance**. *Not for general customer.*
  - **Pure-reference OPTIC = outward record.** Limited carried detail + click-through to gear tray, optic efficiency, **polar + UGR**, and **associated systems** (links to NVB), highlighting the **smallest system** for emergency, plus **battery cold-hold**.
- **Capability set:** small fixed list (general/scaling · rated-life · reference-efficiency · emergency).
- **Pseudo-tainted references:** *usable* in the selector's test mode (not blocked) — permanently flagged TEST.
- **UI division:** **Engineering does selections and supplies the external documents** (manufacturer: chip LM-80/datasheet, board, driver). **The Lab does the tests, supplies the internal documents** (LM-79, thermal, power, battery) **and marries** external claim with internal measurement into the pure reference (the adjudication = the variance table).

## Battery envelope (resolved 12 Jul 2026 — worst-case pair, not a single cold-hold)

- **Cold test = bare gear tray in free air.** Coldest the battery can operate — no luminaire housing to retain heat. Pill **"used for cold battery test"** sits on the **pure-state gear tray**.
- **Hot test = smallest system in the family.** Least thermal mass / lowest conductive volume → worst-case hottest. Pill **"used for hot battery test"** sits on the **smallest system**.
- Emergency capability gate now requires both `BATTERY-COLD` and `BATTERY-HOT` evidence.

## Serial-as-URL (provenance handle embedded in every produced IES)

- The **provenance record number IS a URL**. Every ControlStack-produced IES writes it into the `[_SERIALNUMBER]` header field (the same slot Viso already uses — the uploaded VT180502-008887.ies carries `http://www.visosystems.com/tracking/?id=…`).
- Ours points at an **internal-only resolver** (`https://prov.novon.systems/r/<record>`): opening it *inside* ControlStack pulls up this exact record; on the public internet it is **inert and discloses nothing**. So the handle travels with the file but the record only opens in-system.
- The artefact shows both our written serial and, when a file is dropped, the **origin serial found in that file** — demonstrating the mechanism end to end.

## NVB linking (resolved 12 Jul 2026)

- **Bidirectional.** Every system points to the optic, and every optic points back to every system. The artefact's Associated Systems rows now show the two-way link.

## Recorded functionality requirements (scaffold → wire)

- **R1** — every document reference (component stack, evidence register, battery docs) is **click-to-open** → opens the source test report. Stubbed in the artefact.
- **R2** — polar + UGR **render from the toolkit**. ✅ DONE: dropping a real IES on the artefact renders the actual Viso-style polar + verified CIE 190 UGR table via `iesParse` / `iesMetrics` / `iesUgr` / `iesUgrCie190`.
- **R3** — variance table carries a **per-parameter tolerance** that computes PASS/FAIL and a promotion verdict. ✅ DONE (pseudo tolerances: flux ±3%, efficacy ±3%, power ±5%, CCT ±2%; Tc/CRI as limit rows). Still to set: the real tolerance numbers.

## Laboratory & equipment provenance (confirmed 12 Jul 2026)

- **The log already keeps it.** `parseIes` stores every `[...]` header keyword in `meta.keywords_order` and surfaces `[TEST]`, `[TESTLAB]`, `[ISSUEDATE]`, `[MANUFAC]`. The lab, test, sensor/serial and `[_SERIALNUMBER]` lines survive intact — we just weren't showing them.
- Added a **Laboratory & equipment** card to the artefact (owner/location, goniospectrometer + type, sensor + calib date + serial, spectrometer + model; tested product / item no. / manufacturer). Owner/product/item/test/date read **live from the dropped IES header**; gonio/sensor/spectrometer come from a **lab equipment register** (not carried in the IES itself).

### On "normative thresholds" (plain terms)
"Normative" just means *the officially defined pass line* — the number a standard or our own spec says a result must meet to count as passing. For the variance table it's the tolerance (e.g. flux may deviate ≤3%); for the battery it's how long it must hold at what temperature. The artefact now has tolerance numbers per field (pseudo) and computes PASS/FAIL + a promotion verdict; the remaining job is to replace the pseudo tolerances with the real spec numbers.

## Emergency converter (zencontrol) — encoded 12 Jul 2026

- New toolkit module **`zencontrolEmergency.js`** (canonical data + selector) and harness **`emergency.html`**. Order codes `zc-em-smart-50` (SELV, 10–50 V, 1.5/2.5/3.5 W) and `zc-em-smart-250` (Non-SELV, 50–250 V, 2.5/3.5/4.5 W) are canonical; `zc-smart-em-*` kept as marketing aliases.
- **watts→mA is constant-power:** `driveCurrent_mA = 1000·W / stringVoltage_V`. So the module's LED-string voltage (from the base engine) picks both the model (SELV split at 50 V) and the emergency drive current → the IES to offer. No global watts→mA constant exists.
- Battery matrix (model × power × duration × 5/10 yr → ADA/BDA pack) is encoded from datasheet S1. Capacities/Wh/cell config, output tolerances, ELOF, DT51 schema and the `1B5-BDA`/`1B5-ADB` code clash are all held as **confirm-with-zencontrol** gates — never hardened. The selector surfaces every gate; procurement is blocked on unconfirmed pack data.
- **Done:** `selectEmergency()` is now wired into the provenance Emergency section — a Converter (zencontrol) card (model, isolation, drive current from string voltage, battery pack, datasheet link, capacity gated), plus an `EMERGENCY-CONVERTER` evidence row and its own data-source overlay entries.

## DataLogger framework features → CP (`ControlStack_DataLogger_feature_register.md`)

- **F1 — External source register + freshness check.** Snapshot AND record URL: seal a hashed copy of every external doc (`lab/sources/`) + record `{url, publisherVersion, fetchedAt, snapshotFingerprint, status}` in a `register.json`; a weekly job re-fetches and flags unchanged / changed (→ re-verify) / gone (→ obsolete). Reuses the existing `fingerprint()` + `mutationLog`. Scope: watch known sources + targeted page-diff for new SKUs; open-ended component discovery is out (feeds in later). Open q: automated re-run vs human sign-off on "changed" (rec: auto-detect, human sign-off). Status: recorded for CP, scope-out soon.
- This is the pattern the whole exercise is producing: the lab HTML, filled with real/pseudo data at real store paths, surfaces framework features; each gets recorded here with its store location for CP to implement.

## Still open
- Battery: the **normative duration/temperature thresholds** for cold and hot to *pass* the emergency gate (artefact currently shows illustrative −5 °C / +55 °C, 3 h).
- zencontrol confirmations listed in `EM_UNCONFIRMED` (pack capacities, tolerances, ELOF, DT51 map, 1B5 code clash).
