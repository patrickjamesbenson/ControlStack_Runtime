import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_ID =
  "controlstack.runtime.selector-to-readonly-engine-candidate-mapper.v1";
export const SELECTOR_READONLY_ENGINE_CANDIDATE_MAPPER_SCHEMA_VERSION = 1;
export const SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.selector-readonly-engine-step1-safe-summary.v1";
export const SELECTOR_READONLY_ENGINE_STEP1_SAFE_SUMMARY_SCHEMA_VERSION = 1;

const REQUIRED_CANDIDATE_FIELDS = Object.freeze([
  "tier",
  "runs",
  "lighting",
  "target_lm_per_m",
  "cct",
  "cri",
  "optic",
  "control_type",
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
    controlTypeReady: directControl.ready === true && Boolean(safeString(directControl.valueLabel)),
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
    tier: candidate.tier,
    runCount: runs.length,
    runs: runs.map((run) => ({ qty: run.qty, runLengthMm: run.run_length_mm, lengthMode: run.lengthMode })),
    lighting: {
      target_lm_per_m: lighting.target_lm_per_m,
      cct: lighting.cct,
      cri: lighting.cri,
      optic_key: lighting.optic_key,
      control_type: lighting.control_type,
    },
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
      tierPresent: Boolean(candidate.tier),
      runCount: runs.length,
      totalQuantity: runs.reduce((total, run) => total + (positiveInteger(run.qty) || 0), 0),
      runLengthBand: runs.length ? `${runs[0].run_length_mm}mm` : "none",
      lightingFieldCount: Object.keys(lighting).length,
      targetLmPerMPresent: Boolean(lighting.target_lm_per_m),
      cctPresent: Boolean(lighting.cct),
      criPresent: Boolean(lighting.cri),
      opticPresent: Boolean(candidate.optic?.key || lighting.optic_key),
      controlTypePresent: Boolean(candidate.control_type || lighting.control_type),
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
  if (!isPlainObject(factoryApprovedInputsSummary) || factoryApprovedInputsSummary.factoryApprovedInputsReady !== true) {
    const summary = failSummary(factoryApprovedInputsSummary?.blocker || "stage3-factory-approved-inputs-not-ready");
    return { ok: false, candidate: null, summary };
  }

  const map = constraintMap(committedSelectorConstraints);
  const runSummary = factoryApprovedInputsSummary.committedRunIntakeSummary || {};
  const tier = constraintValue(map, ["tier", "selectedTier", "tierToken"]);
  const runQuantity = positiveInteger(runSummary.runQuantity);
  const runLengthMm = positiveInteger(runSummary.runLengthMm);
  const lengthMode = safeToken(runSummary.lengthMode, "cut_to_length");
  const optic = finalPipeToken(constraintValue(map, ["directOpticVar1", "optic", "opticVar1", "diffuserVar1"]));
  const light = directLightIntent(lmTemperatureReadinessPreview);
  const targetLmPerM = light.targetLmPerM ?? positiveInteger(constraintValue(map, ["targetLmPerM", "lightTarget"]));
  const committedCctCri = parseCctCri(constraintValue(map, ["cctCri", "cct"]));
  const cct = light.cct || committedCctCri.cct;
  const cri = light.cri || committedCctCri.cri;
  const controlType = light.controlType || constraintValue(map, ["controlType"]);

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
    tier,
    tier_strategy: {
      mode: "manual",
      selected_tier: tier,
      candidate_tiers: tier ? [tier] : [],
      optimisation_intent: "locked_manual",
    },
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
      lengthMode,
      requested_length_basis: lengthMode,
      length_policy_source: "selector-stage3-supported-subset",
      accessory_length_policy_source: "selector-stage3-supported-subset",
      reserved_ranges: [],
      ancillary_requests: [],
      readonly_selector_stage3_candidate: true,
    }] : [],
    lighting,
    optic: optic ? { key: optic } : {},
    control_type: controlType,
    electrical: {},
    selector_stage3_supported_subset: true,
    host_local_readonly_engine_candidate: true,
  };

  const fieldStatusRows = [
    fieldStatus("tier", Boolean(tier), "committed-selector-state-required", sourceLabelForConstraint(map, ["tier", "selectedTier", "tierToken"])),
    fieldStatus("runs", Boolean(runQuantity && runLengthMm), "stage3-committed-run-intake-required", runSummary.sourceAuthority || "committed selector run intake"),
    fieldStatus("lighting", Object.keys(lighting).length > 0, "selector-light-intent-required", "selector lm-temperature readiness preview"),
    fieldStatus("target_lm_per_m", Boolean(lighting.target_lm_per_m), "selector-controlled-intent-required", "selector targetLmPerM committed intent"),
    fieldStatus("cct", Boolean(lighting.cct), "selector-source-backed-light-intent-required", "selector cctCri committed intent"),
    fieldStatus("cri", Boolean(lighting.cri), "selector-source-backed-light-intent-required", "selector cctCri committed intent"),
    fieldStatus("optic", Boolean(optic), "committed-selector-state-required", sourceLabelForConstraint(map, ["directOpticVar1", "optic", "opticVar1", "diffuserVar1"])),
    fieldStatus("control_type", Boolean(controlType), "selector-control-intent-required", "selector controlType committed intent"),
  ];
  const missing = fieldStatusRows.filter((row) => REQUIRED_CANDIDATE_FIELDS.includes(row.field) && row.present !== true);
  if (missing.length > 0) {
    const blocker = `missing-candidate-field-${missing[0].field}`;
    const summary = failSummary(blocker, missing.map((row) => `missing ${row.field}`), { fieldStatus: fieldStatusRows });
    return { ok: false, candidate: null, summary };
  }

  const summary = candidateSummary(candidate, fieldStatusRows, {
    stage3Mode: factoryApprovedInputsSummary.stage3Mode,
    factoryApprovedInputsReady: factoryApprovedInputsSummary.factoryApprovedInputsReady,
    factoryApprovedBlocker: factoryApprovedInputsSummary.blocker || null,
    lmTemperatureFingerprint: lmTemperatureReadinessPreview.fingerprint || null,
  });
  return { ok: true, candidate, summary };
}

function sanitizeSafeEngineSummary(safeEngineSummary = {}) {
  if (!isPlainObject(safeEngineSummary)) return null;
  return {
    success: safeEngineSummary.success === true,
    runCount: positiveInteger(safeEngineSummary.run_count ?? safeEngineSummary.runCount) || 0,
    errorCount: Number.isFinite(Number(safeEngineSummary.error_count ?? safeEngineSummary.errorCount)) ? Number(safeEngineSummary.error_count ?? safeEngineSummary.errorCount) : 0,
    warningCount: Number.isFinite(Number(safeEngineSummary.warning_count ?? safeEngineSummary.warningCount)) ? Number(safeEngineSummary.warning_count ?? safeEngineSummary.warningCount) : 0,
    firstError: safeString(safeEngineSummary.first_error ?? safeEngineSummary.firstError).slice(0, 240),
    firstWarning: safeString(safeEngineSummary.first_warning ?? safeEngineSummary.firstWarning).slice(0, 240),
    selectedTier: safeString(safeEngineSummary.selected_tier ?? safeEngineSummary.selectedTier).slice(0, 80),
    outputContractReady: safeEngineSummary.output_contract_ready === true || safeEngineSummary.outputContractReady === true,
    safeRunSummaryCount: Array.isArray(safeEngineSummary.runs) ? safeEngineSummary.runs.length : 0,
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
    return {
      ok: false,
      readonlyEngineStep1Ready: false,
      mapperSummary: mapperResult.summary,
      readonlyEngineStep1SafeSummary,
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
  return {
    ok: readonlyEngineStep1SafeSummary.ok === true,
    readonlyEngineStep1Ready: readonlyEngineStep1SafeSummary.readonlyEngineStep1Ready === true,
    mapperSummary: mapperResult.summary,
    readonlyEngineStep1SafeSummary,
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
    blocker: ready ? null : "readonly-engine-seam-did-not-produce-success",
    mapperReady: true,
    hostLocalReadonlyEngineSeamInvoked: seamResult.engine_execution_attempted === true,
    hostLocalReadonlyEngineResultProduced: seamResult.engine_result_produced === true,
    seam: safeString(seamResult.seam, "engine-runtable-internal-readonly-invoke"),
    seamVersion: safeString(seamResult.seam_version, "engine_runtable_internal_readonly_invoke.v1"),
    safeEngineSummary,
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

export const buildSelectorToReadonlyEngineCandidateMapperSummary = buildSelectorReadonlyEngineCandidateForInternalSeam;
export const buildSelectorRuntimeReadonlyEngineStep1SafeSummary = buildSelectorReadonlyEngineStep1SafeSummary;
