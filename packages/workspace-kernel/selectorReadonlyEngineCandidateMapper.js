import { buildSafeEngineRunTableSelectedResultSourceObject } from "./engineRunTableSafeSelectedResultSourceObject.js";
import { adaptSafeSelectedResultSourceObjectToSummaryProjection } from "./engineRunTableSelectedResultAdapter.js";
import { buildSelectedResultAuthorityGuardSummary } from "./selectedResultAuthorityGuard.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_ID =
  "controlstack.runtime.selector-to-readonly-engine-candidate-mapper.v1";
export const SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_VERSION = 1;
export const SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.selector-readonly-engine-step1-safe-summary.v1";
export const SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_VERSION = 1;
export const SELECTOR_READONLY_ENGINE_STEP2_SELECTED_RESULT_SCHEMA_ID =
  "controlstack.runtime.selector-readonly-engine-step2-selected-result-projection.v1";
export const SELECTOR_READONLY_ENGINE_STEP2_SELECTED_RESULT_SCHEMA_VERSION = 1;
export const SELECTOR_READONLY_ENGINE_STEP3_AUTHORITY_GUARD_SCHEMA_ID =
  "controlstack.runtime.selector-readonly-engine-step3-selected-result-authority-guard.v1";
export const SELECTOR_READONLY_ENGINE_STEP3_AUTHORITY_GUARD_SCHEMA_VERSION = 1;

const REQUIRED_CANDIDATE_FIELDS = Object.freeze([
  "runs",
  "lighting",
  "target_lm_per_m",
  "cct",
  "cri",
  "optic",
  "control_type",
  "selectedRoomTaC",
]);

const SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  selectorStage3SourceOnly: true,
  hostLocalReadonlySeamOnly: true,
  publicRouteAdded: false,
  postEndpointAdded: false,
  uiInvocationEnabled: false,
  runtimeDataMutationEnabled: false,
  selectedResultPersistenceEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  outputGenerationEnabled: false,
  donorRawPayloadReturned: false,
  rawSelectorPayloadReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  rawRowsReturned: false,
  rawUsersReturned: false,
  rawCrmReturned: false,
  rawContactsReturned: false,
  privatePathsReturned: false,
  credentialsReturned: false,
});

const UNSAFE_TRUE_FIELDS = Object.freeze([
  "publicRouteAdded",
  "postEndpointAdded",
  "routesAdded",
  "postEndpointsAdded",
  "uiInvocationEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "selectedResultPersistenceEnabled",
  "selectedResultPersisted",
  "runTableGenerationEnabled",
  "runTableGenerated",
  "iesGenerationEnabled",
  "iesGenerated",
  "outputGenerationEnabled",
  "donorRawPayloadReturned",
  "rawSelectorPayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawRowsReturned",
  "rawRowsExposed",
  "rawUsersReturned",
  "rawCrmReturned",
  "rawContactsReturned",
  "privatePathsReturned",
  "credentialsReturned",
]);

const SAFE_SEAM_FAILURE_BLOCKER_CODES = Object.freeze([
  "direct-run-engine-no-success",
  "selected-project-source-backed-tier-derivation-unavailable",
  "selected-project-source-backed-tier-derivation-ambiguous",
]);

const CLIENT_TIER_CONSTRAINT_KEYS = Object.freeze(new Set([
  "tier",
  "selectedtier",
  "tiertoken",
]));

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeString(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text) return fallback;
  return text
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 180)
    .trim() || fallback;
}

function safeToken(value, fallback = "") {
  const token = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
  return token || fallback;
}

function recognizedSeamFailureBlocker(seamResult = {}) {
  const blockers = Array.isArray(seamResult?.blockers) ? seamResult.blockers : [];
  for (const blocker of blockers) {
    if (!isPlainObject(blocker)) continue;
    const code = safeToken(blocker.code);
    if (SAFE_SEAM_FAILURE_BLOCKER_CODES.includes(code)) return code;
  }
  return null;
}

function positiveInteger(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return rounded > 0 ? rounded : null;
  }
  const match = safeString(value).match(/\d+/);
  if (!match) return null;
  const parsed = Number(match[0]);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function constraintMap(committedSelectorConstraints = []) {
  const map = new Map();
  for (const constraint of Array.isArray(committedSelectorConstraints) ? committedSelectorConstraints : []) {
    if (!isPlainObject(constraint) || constraint.committedSelectorState !== true || constraint.blocked === true) continue;
    const fieldKey = safeString(constraint.fieldKey);
    const value = safeString(constraint.value || constraint.valueLabel);
    if (!fieldKey || !value) continue;
    if (CLIENT_TIER_CONSTRAINT_KEYS.has(safeToken(fieldKey).replace(/[^0-9a-z]/g, ""))) continue;
    if (!map.has(fieldKey)) map.set(fieldKey, constraint);
  }
  return map;
}

function constraintValue(map, keys = []) {
  for (const key of keys) {
    const item = map.get(key);
    const value = safeString(item?.value || item?.valueLabel);
    if (value) return value;
  }
  return "";
}

function sourceLabelForConstraint(map, keys = [], fallback = "committed-selector-state") {
  for (const key of keys) {
    const item = map.get(key);
    if (item) return safeString(item.authoritySource || item.provenance || fallback, fallback);
  }
  return fallback;
}

function finalPipeToken(value) {
  const text = safeString(value);
  if (!text) return "";
  const parts = text.split("|").map((part) => safeString(part)).filter(Boolean);
  return parts.length ? parts[parts.length - 1] : text;
}

function parseCctCri(value) {
  const text = safeString(value);
  const cctMatch = text.match(/(?:TW[_\s-]*)?(\d{3,5})(?:\s*K)?(?:\s*[_\-/]\s*\d{3,5}\s*K?)?/i);
  const criMatch = text.match(/CRI\s*(\d{2,3})/i) || text.match(/\bRa\s*(\d{2,3})\b/i);
  return {
    cct: cctMatch ? cctMatch[1] : "",
    cri: criMatch ? criMatch[1] : "",
  };
}

function parseFiniteCelsius(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  const text = safeString(value);
  if (!text) return null;
  const match = text.match(
    /^(?:ambient(?:\s+temperature)?\s*[:=-]?\s*)?([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*(?:°\s*c|deg(?:ree)?s?\s*c|c)?(?:\s+ambient)?$/i,
  );
  if (!match) return null;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
}

function selectedRoomIntent(committedSelectorConstraints = [], lmTemperatureReadinessPreview = {}) {
  const ambientRows = (Array.isArray(committedSelectorConstraints) ? committedSelectorConstraints : [])
    .filter((constraint) => isPlainObject(constraint) && safeToken(constraint.fieldKey) === "ambient");
  if (ambientRows.length === 0) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-missing", source: "unavailable" };
  }
  if (ambientRows.length !== 1) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-duplicate", source: "unavailable" };
  }

  const constraint = ambientRows[0];
  if (constraint.committedSelectorState !== true) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-not-committed", source: "unavailable" };
  }
  if (constraint.blocked === true) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-blocked", source: "unavailable" };
  }

  const preview = isPlainObject(lmTemperatureReadinessPreview?.ambientIntent)
    ? lmTemperatureReadinessPreview.ambientIntent
    : {};
  if (preview.ready !== true) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-not-ready", source: "unavailable" };
  }
  if (preview.sourceBacked !== true) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-not-source-backed", source: "unavailable" };
  }

  const constraintValues = [constraint.value, constraint.valueLabel]
    .map((entry) => safeString(entry))
    .filter(Boolean)
    .map(parseFiniteCelsius);
  if (constraintValues.length === 0 || constraintValues.some((entry) => entry === null)) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-malformed", source: "unavailable" };
  }
  if (new Set(constraintValues).size !== 1) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-conflict", source: "unavailable" };
  }

  const previewValue = parseFiniteCelsius(preview.valueLabel);
  if (previewValue === null) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-malformed", source: "unavailable" };
  }
  if (previewValue !== constraintValues[0]) {
    return { selectedRoomTaC: null, blocker: "ambient-selection-conflict", source: "unavailable" };
  }

  return {
    selectedRoomTaC: previewValue,
    blocker: null,
    source: safeString(constraint.authoritySource || constraint.provenance, "committed source-backed Ambient selection"),
  };
}

function directLightIntent(lmTemperatureReadinessPreview = {}) {
  const directLm = lmTemperatureReadinessPreview?.targetIntent?.direct || {};
  const directCctCri = lmTemperatureReadinessPreview?.cctCriPairing?.direct || {};
  const directControl = lmTemperatureReadinessPreview?.controlIntent?.direct || {};
  const targetLmPerM = positiveInteger(directLm.valueLabel);
  const { cct, cri } = parseCctCri(directCctCri.valueLabel);
  return {
    targetLmPerM,
    targetLmPerMLabel: safeString(directLm.valueLabel),
    targetLmPerMReady: directLm.ready === true && targetLmPerM !== null,
    cct,
    cri,
    cctCriLabel: safeString(directCctCri.valueLabel),
    cctCriReady: directCctCri.ready === true && Boolean(cct) && Boolean(cri),
    controlType: safeString(directControl.valueLabel),
    controlTypeSourceBacked: directControl.sourceBacked === true,
    controlTypeReady: directControl.ready === true
      && directControl.sourceBacked === true
      && Boolean(safeString(directControl.valueLabel)),
  };
}

function unsafeTrueFlag(value = {}, seen = new Set()) {
  if (value === null || value === undefined || typeof value !== "object") return null;
  if (seen.has(value)) return null;
  seen.add(value);
  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = unsafeTrueFlag(item, seen);
      if (nested) return nested;
    }
    return null;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_TRUE_FIELDS.includes(key) && nested === true) return key;
    const child = unsafeTrueFlag(nested, seen);
    if (child) return child;
  }
  return null;
}

function fieldStatus(field, present, classification, source, reason = "") {
  return {
    field,
    present: present === true,
    classification,
    source: safeString(source, "unavailable"),
    reason: safeString(reason),
    rawValueReturned: false,
  };
}

function failSummary(blocker, diagnostics = [], extra = {}) {
  return {
    schemaId: SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_ID,
    schemaVersion: SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_VERSION,
    state: "selector_to_readonly_engine_candidate_mapper_fail_closed",
    ok: false,
    ready: false,
    readonlyEngineCandidateMapperReady: false,
    candidateReadyForHostLocalReadonlySeam: false,
    blocker: safeString(blocker, "selector-readonly-engine-candidate-not-ready"),
    diagnostics: [safeString(blocker, "selector-readonly-engine-candidate-not-ready"), ...diagnostics.map((item) => safeString(item)).filter(Boolean)],
    fieldStatus: Array.isArray(extra.fieldStatus) ? extra.fieldStatus : [],
    candidateShapeSummary: extra.candidateShapeSummary || null,
    requiredFields: [...REQUIRED_CANDIDATE_FIELDS],
    sourceAuthority: "Stage 3 supported selector/runtime subset only; no product-spine/display-row fallback",
    hostLocalReadonlyEngineSeam: {
      seam: "engine-runtable-internal-readonly-invoke",
      invocationMode: "host-local-readonly-only",
      executeFlagRequired: true,
      candidatePayloadReturned: false,
      callerSuppliedDbAllowed: false,
      publicRouteAdded: false,
      postEndpointAdded: false,
    },
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawRowsReturned: false,
    runtimeDataMutationEnabled: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

function candidateSummary(candidate, fieldStatusRows, sourceFingerprintInput) {
  const lighting = isPlainObject(candidate.lighting) ? candidate.lighting : {};
  const runs = Array.isArray(candidate.runs) ? candidate.runs : [];
  const fingerprint = stableFingerprint("safe-selector-readonly-engine-candidate", {
    runCount: runs.length,
    lighting: {
      target_lm_per_m: lighting.target_lm_per_m,
      cct: lighting.cct,
      cri: lighting.cri,
      optic_key: lighting.optic_key,
      control_type: lighting.control_type,
    },
    selectedRoomTaC: candidate.selectedRoomTaC,
    sourceFingerprintInput,
  });

  return {
    schemaId: SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_ID,
    schemaVersion: SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_VERSION,
    state: "selector_to_readonly_engine_candidate_mapped",
    ok: true,
    ready: true,
    readonlyEngineCandidateMapperReady: true,
    candidateReadyForHostLocalReadonlySeam: true,
    blocker: null,
    diagnostics: [],
    sourceAuthority: "Stage 3 supported selector/runtime subset only; committed selector state plus safe Stage 3 summaries",
    fieldStatus: fieldStatusRows,
    requiredFields: [...REQUIRED_CANDIDATE_FIELDS],
    candidateShapeSummary: {
      clientTierPresent: false,
      tierBindingOwner: "server-owned-engine-lex-boundary",
      runCount: runs.length,
      totalQuantity: runs.reduce((total, run) => total + (positiveInteger(run.qty) || 0), 0),
      runLengthBand: runs.length ? `${runs[0].run_length_mm}mm` : "none",
      lightingFieldCount: Object.keys(lighting).length,
      targetLmPerMPresent: Boolean(lighting.target_lm_per_m),
      cctPresent: Boolean(lighting.cct),
      criPresent: Boolean(lighting.cri),
      opticPresent: Boolean(candidate.optic?.key || lighting.optic_key),
      controlTypePresent: Boolean(candidate.control_type || lighting.control_type),
      selectedRoomTaCPresent: Number.isFinite(candidate.selectedRoomTaC),
      readonlyEngineCandidateFingerprint: fingerprint,
      rawCandidateReturned: false,
      rawSelectorPayloadReturned: false,
      rawEnginePayloadReturned: false,
    },
    hostLocalReadonlyEngineSeam: {
      seam: "engine-runtable-internal-readonly-invoke",
      seamCandidateShape: "selector_payload",
      invocationMode: "host-local-readonly-only",
      executeFlagRequired: true,
      candidatePayloadReturned: false,
      callerSuppliedDbAllowed: false,
      publicRouteAdded: false,
      postEndpointAdded: false,
    },
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawRowsReturned: false,
    runtimeDataMutationEnabled: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

export function buildSelectorReadonlyEngineCandidateForInternalSeam({
  factoryApprovedInputsSummary = {},
  committedSelectorConstraints = [],
  lmTemperatureReadinessPreview = {},
} = {}) {
  const unsafe = unsafeTrueFlag(factoryApprovedInputsSummary) || unsafeTrueFlag(lmTemperatureReadinessPreview);
  if (unsafe) {
    const summary = failSummary("unsafe-stage3-or-selector-summary", [`unsafe true flag detected: ${unsafe}`]);
    return { ok: false, candidate: null, summary };
  }
  const hasDedicatedCandidateReadiness = isPlainObject(factoryApprovedInputsSummary)
    && Object.prototype.hasOwnProperty.call(factoryApprovedInputsSummary, "readonlyEngineCandidateInputsReady");
  const tierOnlyCandidateReadinessBlocker = safeToken(
    factoryApprovedInputsSummary?.readonlyEngineCandidateInputsBlocker,
  ) === "missing-readonly-engine-candidate-input-tier";
  const legacyFactoryApprovedCompatibility = !hasDedicatedCandidateReadiness
    && factoryApprovedInputsSummary?.factoryApprovedInputsReady === true
    && factoryApprovedInputsSummary?.stage2Ready === true;
  const readonlyEngineCandidateInputsReady = hasDedicatedCandidateReadiness
    ? factoryApprovedInputsSummary.readonlyEngineCandidateInputsReady === true
      || tierOnlyCandidateReadinessBlocker
    : legacyFactoryApprovedCompatibility;
  if (!isPlainObject(factoryApprovedInputsSummary) || readonlyEngineCandidateInputsReady !== true) {
    const summary = failSummary(
      factoryApprovedInputsSummary?.readonlyEngineCandidateInputsBlocker
        || "readonly-engine-candidate-inputs-not-ready",
    );
    return { ok: false, candidate: null, summary };
  }

  const map = constraintMap(committedSelectorConstraints);
  const room = selectedRoomIntent(committedSelectorConstraints, lmTemperatureReadinessPreview);
  const runSummary = factoryApprovedInputsSummary.committedRunIntakeSummary || {};
  const runQuantity = positiveInteger(runSummary.runQuantity);
  const runLengthMm = positiveInteger(runSummary.runLengthMm);
  const optic = finalPipeToken(constraintValue(map, ["directOpticVar1", "optic", "opticVar1", "diffuserVar1"]));
  const light = directLightIntent(lmTemperatureReadinessPreview);
  const targetLmPerM = light.targetLmPerM ?? positiveInteger(constraintValue(map, ["targetLmPerM", "lightTarget"]));
  const committedCctCri = parseCctCri(constraintValue(map, ["cctCri", "cct"]));
  const cct = light.cct || committedCctCri.cct;
  const cri = light.cri || committedCctCri.cri;
  const committedControlType = constraintValue(map, ["controlType"]);
  const legacyCommittedControlAuthority = legacyFactoryApprovedCompatibility
    && lmTemperatureReadinessPreview?.controlIntent?.direct?.sourceBacked !== false
    && Boolean(light.controlType)
    && Boolean(committedControlType)
    && safeToken(light.controlType) === safeToken(committedControlType);
  const controlType = light.controlTypeReady
    ? light.controlType
    : legacyCommittedControlAuthority
      ? committedControlType
      : "";

  const lighting = {};
  if (targetLmPerM !== null) {
    lighting.target_lm_per_m = String(targetLmPerM);
    lighting.lm_per_m = String(targetLmPerM);
  }
  if (cct) lighting.cct = cct;
  if (cri) lighting.cri = cri;
  if (optic) {
    lighting.optic_key = optic;
    lighting.selected_optic_key = optic;
  }
  if (controlType) lighting.control_type = controlType;

  const candidate = {
    runs: runQuantity && runLengthMm ? [{
      Run: "selector-readonly-engine-run-1",
      run: "selector-readonly-engine-run-1",
      label: "selector-readonly-engine-run-1",
      Qty: runQuantity,
      qty: runQuantity,
      run_length_mm: runLengthMm,
      "Run Length (mm)": runLengthMm,
      "Required length (mm)": runLengthMm,
      length_mm: runLengthMm,
      lengthMm: String(runLengthMm),
      length_policy_source: "selector-stage3-supported-subset",
      accessory_length_policy_source: "selector-stage3-supported-subset",
      reserved_ranges: [],
      ancillary_requests: [],
      readonly_selector_stage3_candidate: true,
    }] : [],
    lighting,
    ...(room.selectedRoomTaC !== null ? { selectedRoomTaC: room.selectedRoomTaC } : {}),
    optic: optic ? { key: optic } : {},
    control_type: controlType,
    electrical: {},
    selector_stage3_supported_subset: true,
    host_local_readonly_engine_candidate: true,
  };

  const fieldStatusRows = [
    fieldStatus("runs", Boolean(runQuantity && runLengthMm), "stage3-committed-run-intake-required", runSummary.sourceAuthority || "committed selector run intake"),
    fieldStatus("lighting", Object.keys(lighting).length > 0, "selector-light-intent-required", "selector lm-temperature readiness preview"),
    fieldStatus("target_lm_per_m", Boolean(lighting.target_lm_per_m), "selector-controlled-intent-required", "selector targetLmPerM committed intent"),
    fieldStatus("cct", Boolean(lighting.cct), "selector-source-backed-light-intent-required", "selector cctCri committed intent"),
    fieldStatus("cri", Boolean(lighting.cri), "selector-source-backed-light-intent-required", "selector cctCri committed intent"),
    fieldStatus("optic", Boolean(optic), "committed-selector-state-required", sourceLabelForConstraint(map, ["directOpticVar1", "optic", "opticVar1", "diffuserVar1"])),
    fieldStatus("control_type", Boolean(controlType), "selector-control-intent-required", "selector controlType committed intent"),
    fieldStatus(
      "selectedRoomTaC",
      room.selectedRoomTaC !== null,
      "selector-source-backed-room-intent-required",
      room.source,
      room.blocker || "",
    ),
  ];
  const missing = fieldStatusRows.filter((row) => REQUIRED_CANDIDATE_FIELDS.includes(row.field) && row.present !== true);
  if (missing.length > 0) {
    const blocker = `missing-candidate-field-${missing[0].field}`;
    const summary = failSummary(blocker, missing.map((row) => row.reason || `missing ${row.field}`), { fieldStatus: fieldStatusRows });
    return { ok: false, candidate: null, summary };
  }

  const summary = candidateSummary(candidate, fieldStatusRows, {
    stage3Mode: factoryApprovedInputsSummary.stage3Mode,
    readonlyEngineCandidateInputsReady,
    readonlyEngineCandidateInputsBlocker:
      factoryApprovedInputsSummary.readonlyEngineCandidateInputsBlocker || null,
    lmTemperatureFingerprint: lmTemperatureReadinessPreview.fingerprint || null,
  });
  return { ok: true, candidate, summary };
}

function nonNegativeInteger(value, fallback = null) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return rounded >= 0 ? rounded : fallback;
  }
  const text = safeString(value);
  if (!text) return fallback;
  const parsed = Number(text.match(/\d+/)?.[0]);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : fallback;
}

function sanitizedSafeRunSummary(run = {}, index = 0) {
  const source = isPlainObject(run) ? run : {};
  return {
    runIndex: nonNegativeInteger(source.index ?? source.runIndex ?? source.run_index, index),
    hasBodyRequested: source.has_body_requested === true || source.hasBodyRequested === true,
    boardCount: nonNegativeInteger(source.boards_count ?? source.boardCount ?? source.board_count, null),
    segmentCount: nonNegativeInteger(source.segments_count ?? source.segmentCount ?? source.segment_count, null),
    zoneCount: nonNegativeInteger(source.zone_count ?? source.zoneCount, null),
    clipPointsCount: nonNegativeInteger(source.clip_points_count ?? source.clipPointsCount ?? source.clip_count, null),
    suspensionPointsCount: nonNegativeInteger(source.suspension_points_count ?? source.suspensionPointsCount ?? source.suspension_count, null),
    gearTrayPlanCount: nonNegativeInteger(source.gear_tray_plan_count ?? source.gearTrayPlanCount ?? source.gear_tray_count, null),
    reservedRangesCount: nonNegativeInteger(source.reserved_ranges_count ?? source.reservedRangesCount ?? source.reserved_range_count, 0),
    rawRunReturned: false,
  };
}

function sanitizeSafeEngineSummary(safeEngineSummary = {}) {
  if (!isPlainObject(safeEngineSummary)) return null;
  const safeRunSummaries = Array.isArray(safeEngineSummary.runs)
    ? safeEngineSummary.runs.slice(0, 50).map(sanitizedSafeRunSummary)
    : [];
  return {
    success: safeEngineSummary.success === true,
    runCount: positiveInteger(safeEngineSummary.run_count ?? safeEngineSummary.runCount) || 0,
    errorCount: Number.isFinite(Number(safeEngineSummary.error_count ?? safeEngineSummary.errorCount)) ? Number(safeEngineSummary.error_count ?? safeEngineSummary.errorCount) : 0,
    warningCount: Number.isFinite(Number(safeEngineSummary.warning_count ?? safeEngineSummary.warningCount)) ? Number(safeEngineSummary.warning_count ?? safeEngineSummary.warningCount) : 0,
    firstError: safeString(safeEngineSummary.first_error ?? safeEngineSummary.firstError).slice(0, 240),
    firstWarning: safeString(safeEngineSummary.first_warning ?? safeEngineSummary.firstWarning).slice(0, 240),
    selectedTier: safeString(safeEngineSummary.selected_tier ?? safeEngineSummary.selectedTier).slice(0, 80),
    outputContractReady: safeEngineSummary.output_contract_ready === true || safeEngineSummary.outputContractReady === true,
    safeRunSummaryCount: safeRunSummaries.length,
    safeRunSummaries,
    rawResultReturned: false,
    rawDebugReturned: false,
    rawRoughElectricalPayloadReturned: false,
  };
}

export async function invokeSelectorReadonlyEngineStep1WithHostLocalReadonlySeam({
  factoryApprovedInputsSummary = {},
  committedSelectorConstraints = [],
  lmTemperatureReadinessPreview = {},
  invokeReadonlyEngineSeam = null,
} = {}) {
  const mapperResult = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary,
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
  });
  if (mapperResult.ok !== true || typeof invokeReadonlyEngineSeam !== "function") {
    const readonlyEngineStep1SafeSummary = buildSelectorReadonlyEngineStep1SafeSummary({
      mapperResult,
      seamResult: null,
    });
    const readonlyEngineStep2SelectedResultSummary = buildSelectorReadonlyEngineStep2SelectedResultProjection({
      readonlyEngineStep1SafeSummary,
    });
    const readonlyEngineStep3AuthorityGuardSummary = buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard({
      readonlyEngineStep2SelectedResultSummary,
    });
    return {
      ok: false,
      readonlyEngineStep1Ready: false,
      readonlyEngineStep2Ready: false,
      readonlyEngineStep3Ready: false,
      mapperSummary: mapperResult.summary,
      readonlyEngineStep1SafeSummary,
      readonlyEngineStep2SelectedResultSummary,
      readonlyEngineStep3AuthorityGuardSummary,
      candidatePayloadReturned: false,
      rawSelectorPayloadReturned: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
      safetyFlags: { ...SAFETY_FLAGS },
    };
  }

  const seamResult = await invokeReadonlyEngineSeam({
    seam: "engine-runtable-internal-readonly-invoke",
    selectorPayload: mapperResult.candidate,
    execute: true,
    candidatePayloadReturned: false,
    callerSuppliedDbAllowed: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
  });
  const readonlyEngineStep1SafeSummary = buildSelectorReadonlyEngineStep1SafeSummary({
    mapperResult,
    seamResult,
  });
  const readonlyEngineStep2SelectedResultSummary = buildSelectorReadonlyEngineStep2SelectedResultProjection({
    readonlyEngineStep1SafeSummary,
  });
  const readonlyEngineStep3AuthorityGuardSummary = buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard({
    readonlyEngineStep2SelectedResultSummary,
  });
  return {
    ok: readonlyEngineStep1SafeSummary.ok === true,
    readonlyEngineStep1Ready: readonlyEngineStep1SafeSummary.readonlyEngineStep1Ready === true,
    readonlyEngineStep2Ready: readonlyEngineStep2SelectedResultSummary.readonlyEngineStep2Ready === true,
    readonlyEngineStep3Ready: readonlyEngineStep3AuthorityGuardSummary.readonlyEngineStep3Ready === true,
    mapperSummary: mapperResult.summary,
    readonlyEngineStep1SafeSummary,
    readonlyEngineStep2SelectedResultSummary,
    readonlyEngineStep3AuthorityGuardSummary,
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

export function buildSelectorReadonlyEngineStep1SafeSummary({ mapperResult = {}, seamResult = null } = {}) {
  const mapperSummary = mapperResult?.summary || mapperResult;
  if (!isPlainObject(mapperSummary) || mapperSummary.readonlyEngineCandidateMapperReady !== true) {
    return {
      schemaId: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_ID,
      schemaVersion: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_VERSION,
      state: "selector_readonly_engine_step1_fail_closed",
      ok: false,
      readonlyEngineStep1Ready: false,
      blocker: mapperSummary?.blocker || "readonly-engine-candidate-mapper-not-ready",
      mapperReady: false,
      hostLocalReadonlyEngineSeamInvoked: false,
      safeEngineSummary: null,
      candidatePayloadReturned: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
      safetyFlags: { ...SAFETY_FLAGS },
    };
  }

  if (!isPlainObject(seamResult)) {
    return {
      schemaId: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_ID,
      schemaVersion: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_VERSION,
      state: "selector_readonly_engine_step1_mapper_ready_seam_not_invoked",
      ok: false,
      readonlyEngineStep1Ready: false,
      blocker: "host-local-readonly-engine-seam-not-invoked",
      mapperReady: true,
      hostLocalReadonlyEngineSeamInvoked: false,
      seam: "engine-runtable-internal-readonly-invoke",
      safeEngineSummary: null,
      candidatePayloadReturned: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
      safetyFlags: { ...SAFETY_FLAGS },
    };
  }

  const unsafe = unsafeTrueFlag({
    publicRouteAdded: seamResult.public_route_added,
    postEndpointAdded: seamResult.post_endpoint_added,
    runtimeDataMutationEnabled: seamResult.runtime_data_mutation_enabled,
    selectedResultPersistenceEnabled: seamResult.selected_result_persistence_enabled,
    rawRowsReturned: seamResult.raw_rows_exposed,
    rawEnginePayloadReturned: seamResult.raw_engine_payload_exposed,
    rawEngineResultReturned: seamResult.raw_engine_result_returned,
    privatePathsReturned: seamResult.private_paths_exposed,
    credentialsReturned: seamResult.credentials_exposed,
  });
  if (unsafe) {
    return {
      schemaId: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_ID,
      schemaVersion: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_VERSION,
      state: "selector_readonly_engine_step1_fail_closed",
      ok: false,
      readonlyEngineStep1Ready: false,
      blocker: `unsafe-seam-result-${safeToken(unsafe, "flag")}`,
      mapperReady: true,
      hostLocalReadonlyEngineSeamInvoked: seamResult.engine_execution_attempted === true,
      safeEngineSummary: null,
      candidatePayloadReturned: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
      safetyFlags: { ...SAFETY_FLAGS },
    };
  }

  const safeEngineSummary = sanitizeSafeEngineSummary(seamResult.safe_engine_summary);
  const ready = seamResult.ok === true
    && seamResult.engine_execution_attempted === true
    && seamResult.engine_result_produced === true
    && safeEngineSummary?.success === true;
  const fingerprint = stableFingerprint("safe-selector-readonly-engine-step1", {
    mapperFingerprint: mapperSummary.candidateShapeSummary?.readonlyEngineCandidateFingerprint || null,
    safeEngineSummary,
    ready,
  });

  return {
    schemaId: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_ID,
    schemaVersion: SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_VERSION,
    state: ready ? "selector_readonly_engine_step1_safe_summary_ready" : "selector_readonly_engine_step1_engine_not_successful",
    ok: ready,
    readonlyEngineStep1Ready: ready,
    blocker: ready
      ? null
      : recognizedSeamFailureBlocker(seamResult)
        || "readonly-engine-seam-did-not-produce-success",
    mapperReady: true,
    hostLocalReadonlyEngineSeamInvoked: seamResult.engine_execution_attempted === true,
    hostLocalReadonlyEngineResultProduced: seamResult.engine_result_produced === true,
    seam: safeString(seamResult.seam, "engine-runtable-internal-readonly-invoke"),
    seamVersion: safeString(seamResult.seam_version, "engine_runtable_internal_readonly_invoke.v1"),
    safeEngineSummary,
    safeCandidateDerivation: {
      candidateFingerprint: mapperSummary.candidateShapeSummary?.readonlyEngineCandidateFingerprint || null,
      candidateShapeSummary: mapperSummary.candidateShapeSummary || null,
      fieldSourceMap: Array.isArray(mapperSummary.fieldStatus)
        ? mapperSummary.fieldStatus.map((row) => ({
          field: safeToken(row.field, "unknown"),
          present: row.present === true,
          classification: safeString(row.classification, "unclassified"),
          source: safeString(row.source, "unavailable"),
          rawRowReturned: false,
          rawValueReturned: false,
        }))
        : [],
      rawCandidateReturned: false,
      rawSelectorPayloadReturned: false,
      rawEnginePayloadReturned: false,
    },
    readonlyEngineStep1Fingerprint: fingerprint,
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawRowsReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    runtimeDataMutationEnabled: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

function step2FailProjection(blocker) {
  const reason = safeString(blocker, "readonly-engine-step2-selected-result-not-ready");
  return {
    source: "read-only Engine/RunTable selected-result adapter",
    sourceAvailable: false,
    sourceState: "adapter_fail_closed",
    readOnly: true,
    displayOnly: true,
    contractOnly: true,
    failClosed: true,
    state: "no_selected_result",
    resultState: "no_selected_result",
    resultStateLabel: "Estimated preview",
    selectedResultAvailable: false,
    selectedResultUnavailableReason: reason,
    estimatedPreviewOnly: true,
    accepted: false,
    acceptedSelectedResultAvailable: false,
    engineVerified: false,
    stale: false,
    summaryProjectionOnly: true,
    perRunLookupNormalised: false,
    runCount: 0,
    runs: [],
    runsByKey: {},
    redactionRules: [],
    safetyFlags: { ...SAFETY_FLAGS },
    rows: [
      ["source state", "adapter_fail_closed"],
      ["state", "no_selected_result"],
      ["result state label", "Estimated preview"],
      ["selected result available", "false"],
      ["summary projection only", "true"],
      ["accepted", "false"],
      ["engine verified", "false"],
      ["routes added", "false"],
      ["post endpoints added", "false"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}

function step2FailSummary(blocker, extra = {}) {
  const projection = step2FailProjection(blocker);
  return {
    schemaId: SELECTOR_READONLY_ENGINE_STEP2_SELECTED_RESULT_SCHEMA_ID,
    schemaVersion: SELECTOR_READONLY_ENGINE_STEP2_SELECTED_RESULT_SCHEMA_VERSION,
    state: "selector_readonly_engine_step2_fail_closed",
    ok: false,
    readonlyEngineStep2Ready: false,
    selectedResultSourceObjectReady: false,
    selectedResultProjectionReady: false,
    blocker: safeString(blocker, "readonly-engine-step2-selected-result-not-ready"),
    diagnostics: [safeString(blocker, "readonly-engine-step2-selected-result-not-ready")],
    readonlyEngineStep1Ready: extra.readonlyEngineStep1Ready === true,
    safeSelectedResultSourceObject: extra.safeSelectedResultSourceObject || null,
    selectedResultProjection: projection,
    selectedResultProjectionState: projection.state || "no_selected_result",
    selectedResultAvailable: false,
    accepted: false,
    engineVerified: false,
    summaryProjectionOnly: true,
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawRunTableRowsReturned: false,
    rawSelectedPayloadReturned: false,
    runtimeDataMutationEnabled: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

function redactedStep2MetadataFromStep1(readonlyEngineStep1SafeSummary = {}) {
  const derivation = isPlainObject(readonlyEngineStep1SafeSummary.safeCandidateDerivation)
    ? readonlyEngineStep1SafeSummary.safeCandidateDerivation
    : {};
  const shape = isPlainObject(derivation.candidateShapeSummary) ? derivation.candidateShapeSummary : {};
  const fieldSourceMap = Array.isArray(derivation.fieldSourceMap) ? derivation.fieldSourceMap : [];
  return {
    controlled_geometry: {
      classification: "controlled-selector-stage3-geometry-summary",
      length_class: safeToken(shape.runLengthBand, "stage3-supported-run-length"),
      qty: positiveInteger(shape.totalQuantity) || 1,
      length_policy_source: "selector-stage3-supported-subset",
      accessory_length_policy_source: "selector-stage3-supported-subset",
      not_product_data: true,
      not_source_backed_board_data: true,
      raw_payload_returned: false,
    },
    tier_strategy: {
      classification: "source-backed-tier-resolution-shape",
      tier_strategy_mode: "server-owned-source-backed-binding",
      top_level_tier_passed: false,
      tier_strategy_selected_tier_passed: false,
      tier_strategy_candidate_tiers_passed: false,
      raw_payload_returned: false,
    },
    field_source_map: fieldSourceMap.map((entry) => ({
      field: safeToken(entry.field, "unknown"),
      present: entry.present === true,
      classification: safeString(entry.classification, "unclassified"),
      source: safeString(entry.source, "unavailable"),
      raw_row_returned: false,
      raw_value_returned: false,
    })),
    raw_payload_returned: false,
  };
}

export function buildSelectorReadonlyEngineStep2SelectedResultProjection({
  readonlyEngineStep1SafeSummary = {},
} = {}) {
  if (!isPlainObject(readonlyEngineStep1SafeSummary) || readonlyEngineStep1SafeSummary.readonlyEngineStep1Ready !== true) {
    return step2FailSummary(readonlyEngineStep1SafeSummary?.blocker || "readonly-engine-step1-safe-summary-not-ready", {
      readonlyEngineStep1Ready: false,
    });
  }

  const unsafe = unsafeTrueFlag(readonlyEngineStep1SafeSummary);
  if (unsafe) {
    return step2FailSummary(`unsafe-readonly-engine-step1-summary-${safeToken(unsafe, "flag")}`, {
      readonlyEngineStep1Ready: true,
    });
  }

  const safeEngineSummary = isPlainObject(readonlyEngineStep1SafeSummary.safeEngineSummary)
    ? readonlyEngineStep1SafeSummary.safeEngineSummary
    : null;
  if (!safeEngineSummary || safeEngineSummary.success !== true) {
    return step2FailSummary("readonly-engine-step1-safe-engine-summary-not-successful", {
      readonlyEngineStep1Ready: true,
    });
  }

  const sourceInputFingerprint = safeToken(
    readonlyEngineStep1SafeSummary.readonlyEngineStep1Fingerprint
      || readonlyEngineStep1SafeSummary.safeCandidateDerivation?.candidateFingerprint,
    null,
    160,
  );
  if (!sourceInputFingerprint) {
    return step2FailSummary("readonly-engine-step1-fingerprint-missing", {
      readonlyEngineStep1Ready: true,
    });
  }

  const selectedTier = safeEngineSummary.selectedTier || safeEngineSummary.selected_tier;
  const safeRunSummaries = Array.isArray(safeEngineSummary.safeRunSummaries)
    ? safeEngineSummary.safeRunSummaries
    : [];
  const sourceObject = buildSafeEngineRunTableSelectedResultSourceObject({
    safe_engine_summary: {
      success: true,
      selected_tier: selectedTier,
      run_count: safeEngineSummary.runCount,
      safeRunSummaries,
    },
    sourceInputFingerprint,
    source_summary: {
      ok: true,
      active_source_db_loaded_read_only: false,
      source_fingerprint_available: true,
      present_tables: [],
      missing_tables: [],
      source: {
        label: "selector-readonly-engine-step1-safe-summary",
        source_fingerprint: sourceInputFingerprint,
        path_returned: false,
        local_path_exposure_enabled: false,
      },
      raw_rows_exposed: false,
      raw_headers_exposed: false,
      raw_users_exposed: false,
      raw_snapshot_returned: false,
    },
    redacted_metadata: redactedStep2MetadataFromStep1(readonlyEngineStep1SafeSummary),
    sourceVersionMarker: `readonly-engine-step1:${sourceInputFingerprint.slice(0, 24)}`,
  });

  if (sourceObject.ok !== true) {
    return step2FailSummary(sourceObject.blockers?.[0]?.reason || "safe-selected-result-source-object-not-ready", {
      readonlyEngineStep1Ready: true,
      safeSelectedResultSourceObject: sourceObject,
    });
  }

  const projection = adaptSafeSelectedResultSourceObjectToSummaryProjection(sourceObject);
  if (projection.selectedResultAvailable !== true || projection.summaryProjectionOnly !== true) {
    return step2FailSummary(projection.selectedResultUnavailableReason || "selected-result-summary-projection-not-ready", {
      readonlyEngineStep1Ready: true,
      safeSelectedResultSourceObject: sourceObject,
    });
  }

  const fingerprint = stableFingerprint("safe-selector-readonly-engine-step2-selected-result-projection", {
    readonlyEngineStep1Fingerprint: sourceInputFingerprint,
    sourceObjectFingerprint: sourceObject.sourceInputFingerprint,
    projectionState: projection.state,
    runCount: projection.runCount,
    summaryCounts: projection.summaryCounts,
  });

  return {
    schemaId: SELECTOR_READONLY_ENGINE_STEP2_SELECTED_RESULT_SCHEMA_ID,
    schemaVersion: SELECTOR_READONLY_ENGINE_STEP2_SELECTED_RESULT_SCHEMA_VERSION,
    state: "selector_readonly_engine_step2_selected_result_summary_ready",
    ok: true,
    readonlyEngineStep2Ready: true,
    selectedResultSourceObjectReady: true,
    selectedResultProjectionReady: true,
    blocker: null,
    diagnostics: [],
    readonlyEngineStep1Ready: true,
    readonlyEngineStep2Fingerprint: fingerprint,
    safeSelectedResultSourceObject: sourceObject,
    selectedResultProjection: projection,
    selectedResultProjectionState: projection.state,
    selectedResultAvailable: projection.selectedResultAvailable === true,
    accepted: projection.accepted === true,
    engineVerified: projection.engineVerified === true,
    summaryProjectionOnly: projection.summaryProjectionOnly === true,
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawRunTableRowsReturned: false,
    rawSelectedPayloadReturned: false,
    runtimeDataMutationEnabled: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

function step3FailSummary(blocker, extra = {}) {
  const authorityGuardSummary = buildSelectedResultAuthorityGuardSummary({
    selectedResultProjectionSummary: extra.selectedResultProjection || null,
    safeSelectedResultSourceObjectSummary: extra.safeSelectedResultSourceObject || null,
  });
  const state = authorityGuardSummary.state || "not_compared_fail_closed";
  return {
    schemaId: SELECTOR_READONLY_ENGINE_STEP3_AUTHORITY_GUARD_SCHEMA_ID,
    schemaVersion: SELECTOR_READONLY_ENGINE_STEP3_AUTHORITY_GUARD_SCHEMA_VERSION,
    state: "selector_readonly_engine_step3_fail_closed",
    ok: false,
    readonlyEngineStep3Ready: false,
    selectedResultAuthorityGuardReady: true,
    selectedResultAuthorityState: state,
    stale: authorityGuardSummary.stale === true,
    failClosed: true,
    blocker: safeString(blocker, "readonly-engine-step3-authority-guard-not-ready"),
    diagnostics: [safeString(blocker, "readonly-engine-step3-authority-guard-not-ready")],
    readonlyEngineStep2Ready: extra.readonlyEngineStep2Ready === true,
    selectedResultProjectionReady: extra.selectedResultProjectionReady === true,
    selectedResultSourceObjectReady: extra.selectedResultSourceObjectReady === true,
    authorityGuardSummary,
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawRunTableRowsReturned: false,
    rawSelectedPayloadReturned: false,
    runtimeDataMutationEnabled: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

export function buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard({
  readonlyEngineStep2SelectedResultSummary = {},
  policyFingerprint = null,
  sourceFingerprint = null,
  currentSelectorStateFingerprint = null,
  currentReferenceOptionsFingerprint = null,
  currentSourceInputFingerprint = null,
  currentSealedCandidateAssemblyPreviewFingerprint = null,
  currentSelectedResultHandoffScaffoldFingerprint = null,
} = {}) {
  if (!isPlainObject(readonlyEngineStep2SelectedResultSummary)
    || readonlyEngineStep2SelectedResultSummary.readonlyEngineStep2Ready !== true) {
    return step3FailSummary(readonlyEngineStep2SelectedResultSummary?.blocker || "readonly-engine-step2-selected-result-not-ready", {
      readonlyEngineStep2Ready: false,
      selectedResultProjection: readonlyEngineStep2SelectedResultSummary?.selectedResultProjection || null,
      safeSelectedResultSourceObject: readonlyEngineStep2SelectedResultSummary?.safeSelectedResultSourceObject || null,
    });
  }

  const unsafe = unsafeTrueFlag(readonlyEngineStep2SelectedResultSummary);
  if (unsafe) {
    return step3FailSummary(`unsafe-readonly-engine-step2-summary-${safeToken(unsafe, "flag")}`, {
      readonlyEngineStep2Ready: true,
      selectedResultProjectionReady: readonlyEngineStep2SelectedResultSummary.selectedResultProjectionReady === true,
      selectedResultSourceObjectReady: readonlyEngineStep2SelectedResultSummary.selectedResultSourceObjectReady === true,
      selectedResultProjection: readonlyEngineStep2SelectedResultSummary.selectedResultProjection || null,
      safeSelectedResultSourceObject: readonlyEngineStep2SelectedResultSummary.safeSelectedResultSourceObject || null,
    });
  }

  const selectedResultProjection = readonlyEngineStep2SelectedResultSummary.selectedResultProjection || null;
  const safeSelectedResultSourceObject = readonlyEngineStep2SelectedResultSummary.safeSelectedResultSourceObject || null;
  const authorityGuardSummary = buildSelectedResultAuthorityGuardSummary({
    selectedResultProjectionSummary: selectedResultProjection,
    safeSelectedResultSourceObjectSummary: safeSelectedResultSourceObject,
    selectedResultProjectionSourceInputFingerprint: selectedResultProjection?.sourceInputFingerprint || null,
    selectedSourceInputFingerprint: safeSelectedResultSourceObject?.sourceInputFingerprint || null,
    policyFingerprint,
    sourceFingerprint,
    currentSelectorStateFingerprint,
    currentReferenceOptionsFingerprint,
    currentSourceInputFingerprint,
    currentSealedCandidateAssemblyPreviewFingerprint,
    currentSelectedResultHandoffScaffoldFingerprint,
  });
  const authorityState = authorityGuardSummary.state || "not_compared_fail_closed";
  const ready = authorityState === "engine_verified_selected_result_ready";
  const fingerprint = stableFingerprint("safe-selector-readonly-engine-step3-authority-guard", {
    readonlyEngineStep2Fingerprint: readonlyEngineStep2SelectedResultSummary.readonlyEngineStep2Fingerprint || null,
    authorityGuardFingerprint: authorityGuardSummary.selectedResultAuthorityGuardFingerprint || null,
    authorityState,
    stale: authorityGuardSummary.stale === true,
  });

  return {
    schemaId: SELECTOR_READONLY_ENGINE_STEP3_AUTHORITY_GUARD_SCHEMA_ID,
    schemaVersion: SELECTOR_READONLY_ENGINE_STEP3_AUTHORITY_GUARD_SCHEMA_VERSION,
    state: ready
      ? "selector_readonly_engine_step3_engine_verified_selected_result_ready"
      : "selector_readonly_engine_step3_summary_or_fail_closed",
    ok: true,
    readonlyEngineStep3Ready: ready,
    selectedResultAuthorityGuardReady: true,
    selectedResultAuthorityState: authorityState,
    stale: authorityGuardSummary.stale === true,
    failClosed: authorityGuardSummary.failClosed !== false,
    blocker: ready ? null : authorityState,
    diagnostics: ready ? [] : [authorityState, authorityGuardSummary.reason].filter(Boolean),
    readonlyEngineStep2Ready: true,
    selectedResultProjectionReady: readonlyEngineStep2SelectedResultSummary.selectedResultProjectionReady === true,
    selectedResultSourceObjectReady: readonlyEngineStep2SelectedResultSummary.selectedResultSourceObjectReady === true,
    authorityGuardSummary,
    readonlyEngineStep3Fingerprint: fingerprint,
    candidatePayloadReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawRunTableRowsReturned: false,
    rawSelectedPayloadReturned: false,
    runtimeDataMutationEnabled: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...SAFETY_FLAGS },
  };
}

export const buildSelectorToReadonlyEngineCandidateMapperSummary = buildSelectorReadonlyEngineCandidateForInternalSeam;
export const buildSelectorRuntimeReadonlyEngineStep1SafeSummary = buildSelectorReadonlyEngineStep1SafeSummary;
export const buildSelectorRuntimeReadonlyEngineStep2SelectedResultProjection = buildSelectorReadonlyEngineStep2SelectedResultProjection;
export const buildSelectorRuntimeReadonlyEngineStep3SelectedResultAuthorityGuard = buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard;