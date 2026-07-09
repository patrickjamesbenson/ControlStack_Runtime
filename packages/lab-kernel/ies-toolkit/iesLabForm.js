// Lab IES toolkit — metadata merge against BASE_LAB_FORM (kind-aware) + alias map, and the 1mm record builder.
// kind: ies (fill from file) | lab (human/thermal-test fills) | check (ratification, starts "pending").
// gates_reference (y/n): must be filled/ratified before the record can be stamped a reference.
// Template passed IN (caller reads BASE_LAB_FORM from novondb). Pure, browser-safe.
import { toOneMm } from "./iesOneMm.js";

function bareKey(k){ return String(k || "").trim().replace(/^\[|\]$/g, "").toUpperCase(); }
function fileValueMap(model){
  const map = {};
  for (const r of (model.meta?.keywords_order || [])){ const b = bareKey(r.key); if (b && !(b in map)) map[b] = String(r.value || "").trim(); }
  return map;
}
function cell(raw, ...names){
  const by = {}; for (const [k, v] of Object.entries(raw)) by[String(k).trim().toLowerCase()] = v;
  for (const n of names){ const v = by[n.toLowerCase()]; if (v != null) return String(v || "").trim(); }
  return "";
}

export function buildLabForm(model, baseLabForm = [], aliasMap = {}){
  const values = fileValueMap(model);
  const geom = model.photometry?.geometry || {};
  const alias = {}; for (const [k, v] of Object.entries(aliasMap || {})) alias[bareKey(k)] = bareKey(v);
  const rows = []; const used = new Set();
  for (const raw of baseLabForm){
    const field = cell(raw, "field", "keyword", "key");
    const bare = bareKey(field);
    if (!bare) continue;
    const kind = (cell(raw, "kind") || "ies").toLowerCase();
    const gatesReference = /^y(es)?$/i.test(cell(raw, "gates_reference", "gatesreference"));
    const inputsText = cell(raw, "inputs");
    const options = inputsText.includes(",") ? inputsText.split(",").map((s) => s.trim()).filter(Boolean) : [];
    const order = Number(cell(raw, "ies_order", "order")) || rows.length + 1;
    let value = "", source = "needs-lab-input";
    if (kind === "check"){ value = options[0] || inputsText || "pending"; source = "check-pending"; }
    else if (bare in values){ value = values[bare]; source = "from-file"; }
    else {
      const aliasKey = Object.keys(alias).find((k) => alias[k] === bare && (k in values));
      if (aliasKey){ value = values[aliasKey]; source = "from-file-aliased (" + aliasKey + ")"; }
      else if (bare === "INPUT_WATTS" && Number(geom.G12) > 0){ value = String(Number(geom.G12)); source = "computed (from G12)"; }
    }
    used.add(bare);
    rows.push({ field: "[" + bare + "]", bareField: bare, order, value, source, options, kind, gatesReference });
  }
  for (const [b, val] of Object.entries(values)){
    if (used.has(b)) continue;
    rows.push({ field: "[" + b + "]", bareField: b, order: rows.length + 1, value: val, source: "file-extra", options: [], kind: "ies", gatesReference: false });
  }
  rows.sort((a, b) => a.order - b.order);
  return rows;
}

export function buildOneMmRecord(model, opts = {}){
  const { baseLabForm = [], aliasMap = {}, originName = null } = opts;
  const labForm = buildLabForm(model, baseLabForm, aliasMap);
  const oneMm = toOneMm(model);
  const get = (f) => { const r = labForm.find((x) => x.bareField === f); return r ? r.value : null; };
  return {
    schemaId: "controlstack.lab.one-mm-ies-record.v1", schemaVersion: 1,
    oneMmNormalised: true, baseLengthM: 0.001, photometryMode: "normalise_1mm_candidate",
    recordType: get("_TEST_TYPE") || null, referenceEngineId: get("_ENGINE_ID") || null,
    labForm, photometry: oneMm.photometry,
    origin: { statedName: originName, asReceived: true, fingerprint: null },
    sourceFingerprint: null, recordFingerprint: null,
    provenance: { fingerprintsSealed: false, mutationLog: [] },
    approvalState: "draft",
    unresolvedFields: labForm.filter((r) => r.source === "needs-lab-input").map((r) => r.bareField),
  };
}
