const OPTIC_FIELD_ALIASES = Object.freeze([
  "optic",
  "optic_key",
  "optic_name",
  "optic_var_1",
  "optic var 1",
  "directOpticVar1",
  "diffuser",
  "diffuser_var_1",
  "diffuser var 1",
  "diffuserVar1",
  "lens",
  "lens_type",
  "optical_code",
  "optic_bom_id",
  "baseline_slug",
  "pure_ref_id",
  "spec_code",
  "name",
  "label",
]);

const SYSTEM_FIELD_ALIASES = Object.freeze([
  "system",
  "series",
  "system_name",
  "system_key",
  "profile_family",
  "prepend_d",
  "family",
  "profile",
]);

const OPTIC_EFFICIENCY_FIELD_ALIASES = Object.freeze([
  "eff_optical",
  "optical_eff",
  "optical_efficiency",
  "efficiency_optical",
  "f_optical",
  "F optical",
  "optic_eff",
  "eff",
  "bclt",
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function safeText(value) {
  return String(value ?? "").trim();
}

function normalizedToken(value) {
  return safeText(value).toLowerCase().replace(/[^0-9a-z]+/g, "");
}

function firstPresent(row, aliases) {
  if (!isPlainObject(row)) return null;
  for (const alias of aliases) {
    if (!Object.prototype.hasOwnProperty.call(row, alias)) continue;
    const value = row[alias];
    if (value !== null && value !== undefined && safeText(value)) return value;
  }
  return null;
}

function positiveEfficiency(value) {
  if (typeof value === "string" && value.includes("%")) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 && parsed <= 1 ? parsed : null;
}

function efficiencyFromRow(row) {
  const explicit = firstPresent(row, OPTIC_EFFICIENCY_FIELD_ALIASES);
  const explicitValue = positiveEfficiency(explicit);
  if (explicitValue !== null) return explicitValue;

  for (const [key, value] of Object.entries(isPlainObject(row) ? row : {})) {
    const normalizedKey = normalizedToken(key);
    if (!normalizedKey.includes("opt") || !normalizedKey.includes("eff")) continue;
    const parsed = positiveEfficiency(value);
    if (parsed !== null) return parsed;
  }
  return null;
}

function candidateOptic(selectorPayload) {
  const lighting = isPlainObject(selectorPayload?.lighting) ? selectorPayload.lighting : {};
  const optic = isPlainObject(selectorPayload?.optic) ? selectorPayload.optic : {};
  return safeText(optic.key || optic.label || lighting.optic_key || lighting.selected_optic_key);
}

function candidateSystem(selectorPayload) {
  if (isPlainObject(selectorPayload?.system)) {
    return safeText(
      selectorPayload.system.key
      || selectorPayload.system.system
      || selectorPayload.system.label,
    );
  }
  return safeText(selectorPayload?.system);
}

function rowMatchesCandidate(row, optic, systemHint) {
  const wantedOptic = normalizedToken(optic);
  if (!wantedOptic) return false;
  const rowOptic = normalizedToken(firstPresent(row, OPTIC_FIELD_ALIASES));
  const rowSystem = normalizedToken(firstPresent(row, SYSTEM_FIELD_ALIASES));
  if (rowOptic === wantedOptic) {
    return !systemHint || !rowSystem || rowSystem === normalizedToken(systemHint);
  }

  const compositeParts = safeText(optic)
    .replaceAll("/", "|")
    .split("|")
    .map(normalizedToken)
    .filter(Boolean);
  return compositeParts.length >= 2
    && rowSystem === compositeParts[0]
    && rowOptic === compositeParts[1];
}

function opticsRows(snapshot) {
  if (Array.isArray(snapshot?.OPTICS)) return snapshot.OPTICS;
  if (Array.isArray(snapshot?.optics)) return snapshot.optics;
  if (Array.isArray(snapshot?.tables?.OPTICS)) return snapshot.tables.OPTICS;
  return [];
}

function cloneJson(value) {
  return JSON.parse(JSON.stringify(value));
}

export function resolveSelectedProjectSourceBackedOpticEfficiency({
  selectorPayload = {},
  snapshot = {},
} = {}) {
  const optic = candidateOptic(selectorPayload);
  const systemHint = candidateSystem(selectorPayload);
  if (!optic) {
    return Object.freeze({
      ok: false,
      state: "source_backed_optic_efficiency_unavailable",
      blocker: "selected-project-source-backed-optic-missing",
      efficiency: null,
      matchedRowCount: 0,
      conflictingValues: false,
      rawRowsReturned: false,
      rawValuesReturned: false,
      fallbackUsed: false,
    });
  }

  const matchedValues = opticsRows(snapshot)
    .filter((row) => rowMatchesCandidate(row, optic, systemHint))
    .map(efficiencyFromRow)
    .filter((value) => value !== null);
  const uniqueValues = [...new Set(matchedValues.map((value) => Number(value.toFixed(8))))];
  const ready = uniqueValues.length === 1;

  return Object.freeze({
    ok: ready,
    state: ready
      ? "source_backed_optic_efficiency_ready"
      : "source_backed_optic_efficiency_unavailable",
    blocker: ready
      ? null
      : uniqueValues.length > 1
        ? "selected-project-source-backed-optic-efficiency-conflict"
        : "selected-project-source-backed-optic-efficiency-unavailable",
    efficiency: ready ? uniqueValues[0] : null,
    matchedRowCount: matchedValues.length,
    conflictingValues: uniqueValues.length > 1,
    rawRowsReturned: false,
    rawValuesReturned: false,
    fallbackUsed: false,
  });
}

export function enrichSelectedProjectReadonlyEngineBridgeRequest({
  bridgeRequest = {},
  snapshot = {},
} = {}) {
  const selectorPayload = isPlainObject(bridgeRequest?.selectorPayload)
    ? bridgeRequest.selectorPayload
    : {};
  const lighting = isPlainObject(selectorPayload.lighting) ? selectorPayload.lighting : {};
  const electrical = isPlainObject(selectorPayload.electrical) ? selectorPayload.electrical : {};
  const existingEfficiency = positiveEfficiency(
    lighting.eff_optical ?? lighting.optical_eff ?? lighting.optical_efficiency,
  );
  const existingCurrent = Number(electrical.current_ma ?? electrical.currentMa);
  if (existingEfficiency !== null || (Number.isFinite(existingCurrent) && existingCurrent > 0)) {
    return Object.freeze({
      ok: true,
      enriched: false,
      state: "selected_project_engine_candidate_electrical_basis_already_present",
      blocker: null,
      bridgeRequest,
      sourceResolution: null,
      rawRowsReturned: false,
      rawValuesReturned: false,
      fallbackUsed: false,
    });
  }

  const sourceResolution = resolveSelectedProjectSourceBackedOpticEfficiency({
    selectorPayload,
    snapshot,
  });
  if (!sourceResolution.ok) {
    return Object.freeze({
      ok: false,
      enriched: false,
      state: "selected_project_engine_candidate_source_enrichment_blocked",
      blocker: sourceResolution.blocker,
      bridgeRequest,
      sourceResolution,
      rawRowsReturned: false,
      rawValuesReturned: false,
      fallbackUsed: false,
    });
  }

  const enrichedRequest = cloneJson(bridgeRequest);
  const enrichedLighting = isPlainObject(enrichedRequest.selectorPayload?.lighting)
    ? enrichedRequest.selectorPayload.lighting
    : {};
  enrichedRequest.selectorPayload.lighting = {
    ...enrichedLighting,
    eff_optical: sourceResolution.efficiency,
    optical_eff: sourceResolution.efficiency,
    optical_efficiency: sourceResolution.efficiency,
  };

  return Object.freeze({
    ok: true,
    enriched: true,
    state: "selected_project_engine_candidate_source_enriched",
    blocker: null,
    bridgeRequest: enrichedRequest,
    sourceResolution,
    rawRowsReturned: false,
    rawValuesReturned: false,
    fallbackUsed: false,
  });
}
