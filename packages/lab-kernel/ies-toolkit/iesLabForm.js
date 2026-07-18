// Lab IES toolkit — metadata merge against BASE_LAB_FORM and rich 1 mm authority-record builder.
// Template passed IN by the caller. Pure and browser-safe.
import { toOneMm } from "./iesOneMm.js";
import {
  assertAuthorityRecord,
  createAuthorityRecord,
  deriveRecordKind,
} from "./iesAuthorityRecord.js";
import { refreshSafeRuntimeHandoff } from "./iesHandoff.js";

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
  const { baseLabForm = [], aliasMap = {} } = opts;
  const labForm = buildLabForm(model, baseLabForm, aliasMap);
  const oneMm = toOneMm(model);
  const get = (field) => labForm.find((row) => row.bareField === field)?.value || null;
  const testType = get("_TEST_TYPE");
  const referenceEngineId = get("_ENGINE_ID");
  const recordKind = deriveRecordKind(opts.recordKind) || deriveRecordKind(testType);
  const derivationReferences = Array.isArray(opts.derivationReferences)
    ? opts.derivationReferences.map((entry) => ({ ...entry }))
    : [];
  if (referenceEngineId && !derivationReferences.some((entry) => entry?.referenceId === referenceEngineId)) {
    derivationReferences.push({ relation: "reference_engine", referenceId: referenceEngineId });
  }

  const origin = opts.origin || {
    artifactRef: opts.originArtifactRef ?? null,
    byteLength: opts.originByteLength ?? null,
    mediaType: opts.originMediaType ?? null,
    fingerprint: null,
  };

  const record = createAuthorityRecord({
    recordId: opts.recordId ?? null,
    recordKind,
    origin,
    labForm,
    photometry: oneMm.photometry,
    recipe: opts.recipe || {
      operation: "normalise_1mm_candidate",
      paramsSummary: { oneMmNormalised: true, baseLengthM: 0.001 },
    },
    originReferences: opts.originReferences || [],
    evidenceReferences: opts.evidenceReferences || [],
    derivationReferences,
    parentLineage: opts.parentLineage || [],
  });

  refreshSafeRuntimeHandoff(record);
  assertAuthorityRecord(record);
  return record;
}
