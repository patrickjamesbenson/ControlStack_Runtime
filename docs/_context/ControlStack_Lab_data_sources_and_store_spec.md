# ControlStack — provenance data sources, store convention & port plan

*The provenance HTML is now the orchestrator: it shows the finished record, and a **Data-source checklist** toggle overlays where every value must come from. This doc is the same thing in prose — for alignment first, then CP's blessing before any code.*

---

## 1. The problem this fixes

Wiring twelve data blocks to their real sources gets messy fast if each is decided ad hoc. So the record itself declares the contract: one fixed store layout, one naming convention, one resolver. Toggle the overlay on and every block reads its own source path + status (wired / computed / loader-pending). That overlay **is** the build backlog.

---

## 2. Reference store — fixed layout & naming (proposed)

```
lab/
  references/
    <REFID>/                         REFID = NVB-REF-<KIND>-<serial>   KIND ∈ { OPT, GT }
      record.1mm.json                sealed 1mm reference (photometry + meta + provenance)
      origin.ies                     exact origin IES, immutable (source of polar + UGR + lab detail)
      adjudication.json              claim vs measured + tolerances + verdict
      evidence/
        evidence.json                index: type → file + attestation + src(ext|int) + pseudo
        LM-80__<hash>.pdf  TM-21__<hash>.pdf  LM-79__<hash>.pdf  ...
      mutations.log.json             ordered mutation chain (origin fp → … → sealed fp)
  components/
    chip/<UID>.json   board/<UID>.json   driver/<UID>.json
  equipment/
    register.json                    gonio / sensor / spectrometer, keyed by serial + calib date
nvb/
  systems/<SYSID>.json               each lists the optic ids it uses (bidirectional link)
```

**Naming:** `REFID = NVB-REF-OPT-000123` (optic), `NVB-REF-GT-000045` (gear tray). Fingerprints `safe-<hex>`. The IES `[_SERIALNUMBER]` = `https://prov.novon.systems/r/<REFID>`; the internal resolver maps that URL → `lab/references/<REFID>/`.

**Auto-load flow (R4):** page opened as `…/provenance.html?ref=<REFID>` → load `record.1mm.json` → it points at `origin.ies` → polar (`polarLive`) + UGR (`computeUgr190Table`) computed from `origin.ies`; lab detail read from its header keywords. No file drop needed once the loader exists — the drop stays as the manual/dev path.

---

## 3. Data-source checklist (mirrors the overlay)

| Block | Source | Path | Status |
|---|---|---|---|
| Provenance serial | reference id + resolver | `record.1mm.json → id` · `prov.novon.systems/r/<REFID>` | id known · resolver **pending** |
| Carried gear-tray detail | record carry block | `record.1mm.json → carried{}` | loader **pending** |
| Optic ratio (efficiency/link) | record optic block | `record.1mm.json → optic{} + gearTrayId` | loader **pending** |
| Polar | origin IES candela | `origin.ies → polarLive()` | **wired** live on drop · auto-load pending |
| UGR table | origin IES via CIE 190 | `origin.ies → computeUgr190Table()` | **computed** on drop · auto-load pending |
| Laboratory (owner/product/test/date) | IES header keywords | `origin.ies [TESTLAB]/[TEST]/[LUMINAIRE]/[LUMCAT]/[MANUFAC]/[ISSUEDATE]` | **wired** live on drop |
| Lab equipment (gonio/sensor/spectrometer) | equipment register | `lab/equipment/register.json → by sensor serial` | loader **pending** |
| Associated systems | NVB, bidirectional | `nvb/systems/<SYSID>.json` filtered by optic id | loader **pending** |
| Battery (cold/hot) | battery evidence docs | `evidence.json → BATTERY-COLD / BATTERY-HOT` | loader **pending** |
| Capabilities | derived from evidence ∩ matrix | `evidence.json ∩ CAPABILITY_MATRIX` | **computed** · evidence loader pending |
| Component stack | component records | `components/{chip|board|driver}/<UID>.json` | loader **pending** |
| Adjudication | claim vs measured | `adjudication.json` | loader **pending** |
| Evidence register | attached documents | `evidence.json + evidence/*.pdf` | loader **pending** |
| Provenance chain | mutation log | `mutations.log.json` | loader **pending** |

Three states: **wired** (real data flows now), **computed** (derived from a wired source), **pending** (path defined, loader not built). Everything pending is a CP task with its path already fixed.

---

## 4. Porting polar + UGR to the runtime

The lab lane built and proved five browser-safe, dependency-free modules: `iesParse`, `iesMetrics`, `iesUgr`, `iesUgrCie190`, and the polar renderer. The selector, the runtime provenance view, and IES scaling all need them. Two ways to share, one rule:

- **Recommended — promote a sealed copy as a shared kernel.** Prove in the lab (isolated), then promote the exact, fingerprinted module set into the runtime as a read-only `photometry-kernel`. The runtime imports it; it never reaches back into the lab. This keeps the governance rule intact (**lab lane never touches runtime; runtime never mutates lab**) while giving the runtime the verified maths. Version + fingerprint the promotion so a runtime result is traceable to the exact lab module that produced it.
- Alternative — duplicate/fork into the runtime. Rejected: two copies drift, and the CIE 190 verification would have to be re-proved per copy.

**Go-forward rule to ratify:** *photometry logic is authored and verified only in the lab lane; the runtime consumes it only as a promoted, fingerprinted, read-only kernel.*

---

## 5. For CP's blessing — decisions to ratify

1. Store layout + `NVB-REF-<KIND>-<serial>` naming + `prov.novon.systems/r/<REFID>` resolver (§2).
2. `record.1mm.json` carries a pointer to `origin.ies`; polar/UGR always recompute from `origin.ies` (not stored images).
3. Promotion (not fork) as the way polar/UGR reach the runtime, under the go-forward rule (§4).
4. Loader build order (suggest): serial resolver → origin.ies auto-load (unlocks polar/UGR/lab live) → evidence.json (unlocks capabilities + docs) → adjudication → components → NVB systems → equipment register.

Once these four are blessed, each overlay "pending" becomes a discrete, path-fixed ticket.
