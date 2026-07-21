// ControlStack Lab — import-free, read-only compatibility projection for the public IES artifact request v1 contract.
// This module validates plain public JSON only. It does not generate IES, create authority, persist, route, or write.

export const IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_ID =
  "controlstack.lab.ies-artifact-request-compatibility.v1";
export const IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_VERSION = 1;
export const IES_ARTIFACT_REQUEST_SCHEMA_ID =
  "controlstack.downstream.ies-artifact-request.v1";
export const IES_ARTIFACT_REQUEST_SCHEMA_VERSION = 1;
export const IES_ARTIFACT_INTENT_SCHEMA_ID =
  "controlstack.downstream.ies-artifact-intent.v1";
export const IES_ARTIFACT_INTENT_SCHEMA_VERSION = 1;
export const IES_ARTIFACT_KIND = "ies_lm63_reference_build";
export const IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID =
  "controlstack.downstream.ies-artifact-request-audit.v1";
export const IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION = 1;
export const ENGINE_OUTPUT_SCHEMA_ID = "controlstack.engine.output.v1";
export const ENGINE_OUTPUT_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_ROW_SCHEMA_ID = "controlstack.engine.runtable-row.v1";
export const ENGINE_RUNTABLE_ROW_SCHEMA_VERSION = 1;

export const IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES = Object.freeze({
  compatibleReady: "compatible_ready",
  compatibleBlocked: "compatible_blocked",
  blockedFailClosed: "blocked_fail_closed",
});

const SOURCE_REQUEST_STATES = Object.freeze({
  readyReadOnly: "ready_read_only",
  blockedFailClosed: "blocked_fail_closed",
});

const REQUEST_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "requestId",
  "replayKey",
  "artifactIntent",
  "engineContract",
  "selectedResult",
  "runTable",
  "blockers",
  "warnings",
  "audit",
  "safetyFlags",
]);
const INTENT_KEYS = Object.freeze(["schemaId", "schemaVersion", "artifactKind"]);
const ENGINE_CONTRACT_KEYS = Object.freeze([
  "outputSchemaId",
  "outputSchemaVersion",
  "outputState",
  "resultId",
  "requestFingerprint",
  "sourceVersionFingerprint",
  "policyFingerprint",
  "evidenceFingerprints",
]);
const SELECTED_RESULT_KEYS = Object.freeze([
  "resultId",
  "accepted",
  "engineVerified",
  "selectedProfile",
  "sourceKind",
  "sourceInputFingerprint",
  "sourceVersionMarker",
  "internalComponentResultId",
  "technicalProvenance",
  "thermal",
  "runCount",
  "readOnly",
]);
const PROVENANCE_KEYS = Object.freeze([
  "selectedOpticKey",
  "opticBomId",
  "evidenceRef",
  "programValidationState",
  "selectedTierOrProfile",
]);
const THERMAL_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "selectedOpticKey",
  "opticBomId",
  "sourceRevision",
  "evidenceRef",
  "programValidationState",
  "selectedRoomTaC",
  "referenceRoomTaC",
  "referenceInternalTaC",
  "opticThermalRiseTaC",
  "derivedInternalTaC",
  "curveLookupTaC",
  "effectiveCurveTaC",
  "temperatureMode",
  "requestedCurrentMa",
  "currentMode",
  "verifiedLmPerM",
  "curveFilename",
  "curveChecksumVerified",
  "opticRiseAppliedCount",
  "readOnly",
  "safetyFlags",
]);
const THERMAL_SAFETY_KEYS = Object.freeze([
  "donorEngineInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "runTableGenerated",
  "iesGenerated",
  "outputGenerated",
  "rawCurveRowsReturned",
  "rawCurvePayloadReturned",
  "publicRouteAdded",
  "postEndpointAdded",
]);
const RUN_TABLE_KEYS = Object.freeze([
  "rowSchemaId",
  "rowSchemaVersion",
  "rowCount",
  "rows",
  "nonPersistent",
  "readOnly",
]);
const ROW_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "rowKey",
  "runKey",
  "runIndex",
  "rowOrdinal",
  "rowKind",
  "state",
  "accepted",
  "engineVerified",
  "hasBodyRequested",
  "boardCount",
  "segmentCount",
  "zoneCount",
  "clipPointsCount",
  "suspensionPointsCount",
  "gearTrayPlanCount",
  "reservedRangesCount",
  "requestFingerprint",
  "sourceVersionFingerprint",
  "policyFingerprint",
  "resultId",
  "readOnly",
  "rawPayloadReturned",
]);
const AUDIT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "attemptFingerprint",
  "state",
  "accepted",
  "requestId",
  "replayKey",
  "deterministic",
  "traceabilityInspected",
  "engineInvoked",
  "labConsumerInvoked",
  "generatorInvoked",
  "routeInvoked",
  "persistenceAttempted",
  "artifactWriteAttempted",
  "emailAttempted",
]);
const SOURCE_SAFETY_KEYS = Object.freeze([
  "readOnly",
  "nonPersistent",
  "traceabilityEnvelopeIgnored",
  "engineInvoked",
  "donorEngineInvoked",
  "labConsumerInvoked",
  "iesGeneratorInvoked",
  "iesGenerated",
  "photometryGenerated",
  "artifactWritten",
  "fileWritten",
  "emailSent",
  "downloadCreated",
  "routeAdded",
  "postEndpointAdded",
  "runtimeDataMutated",
  "authorityMutated",
  "referenceMutated",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaReturned",
  "privatePathsReturned",
  "downstreamActivated",
]);
const COMPATIBILITY_SAFETY_KEYS = Object.freeze([
  "readOnly",
  "nonPersistent",
  "compatibilityOnly",
  "outerTraceabilityIgnored",
  "sourceRequestMutated",
  "producerImplementationImported",
  "engineInvoked",
  "iesGeneratorInvoked",
  "iesGenerated",
  "authorityCreated",
  "evidenceAccepted",
  "referenceMutated",
  "routeAdded",
  "persistenceAttempted",
  "networkWritten",
  "fileWritten",
  "emailSent",
  "readinessActivated",
  "rawRequestReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaReturned",
  "privatePathsReturned",
]);
const SOURCE_REQUEST_PROJECTION_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "requestId",
  "replayKey",
]);

const REQUEST_ID_PATTERN = /^ies-artifact-request-v1:[0-9a-f]{40}$/;
const REPLAY_KEY_PATTERN = /^ies-artifact-replay-v1:[0-9a-f]{40}$/;
const ATTEMPT_PATTERN = /^ies-artifact-request-attempt-v1:[0-9a-f]{40}$/;
const FINGERPRINT_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{7,255}$/;
const BLOCKER_PATTERN = /^[a-z][a-z0-9_-]{0,127}$/;
const PRIVATE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|password|credential|secret|bearer\s+|api[_-]?key)/i;
const RAW_PATTERN = /(?:^\s*IESNA:|\bTILT=|data:[^\s]+;base64|\bbase64\b)/i;
const TEMPERATURE_MODES = Object.freeze(new Set(["clamped-low", "clamped-high", "interpolated"]));
const CURRENT_MODES = Object.freeze(new Set(["clamped-low", "clamped-high", "exact", "interpolated"]));

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function boundedText(value, maximum = 256) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > maximum
    || /[\u0000-\u001f\u007f]/.test(value)
    || PRIVATE_PATTERN.test(value)
    || RAW_PATTERN.test(value)
  ) return null;
  return value;
}

function fingerprint(value) {
  return typeof value === "string"
    && FINGERPRINT_PATTERN.test(value)
    && !PRIVATE_PATTERN.test(value)
    && !RAW_PATTERN.test(value)
    ? value
    : null;
}

function finiteNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Object.is(value, -0) ? 0 : value;
}

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function exactAdd(leftValue, rightValue) {
  const left = finiteNumber(leftValue);
  const right = finiteNumber(rightValue);
  if (left === null || right === null) return null;
  const total = left + right;
  return Number.isFinite(total) ? (Object.is(total, -0) ? 0 : total) : null;
}

function canonicalStrings(value, { minimum = 0, maximum = 64, blockers = false } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
  const output = [];
  const seen = new Set();
  for (const entry of value) {
    const text = boundedText(entry);
    if (!text || (blockers && !BLOCKER_PATTERN.test(text)) || seen.has(text)) return null;
    seen.add(text);
    output.push(text);
  }
  return output;
}

function fingerprintArray(value, { minimum = 0, maximum = 1 } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
  const output = [];
  const seen = new Set();
  for (const entry of value) {
    const token = fingerprint(entry);
    if (!token || seen.has(token)) return null;
    seen.add(token);
    output.push(token);
  }
  return output;
}

function unsafeValue(value, depth = 0, seen = new Set()) {
  if (depth > 12) return "request_depth_unsupported";
  if (typeof value === "string") {
    if (PRIVATE_PATTERN.test(value)) return "private_path_not_approved";
    if (RAW_PATTERN.test(value)) return "raw_artifact_content_not_approved";
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeValue(entry, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;
  if (seen.has(value)) return "cyclic_input_not_approved";
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (/^(?:rawIes|rawIES|iesText|iesContent|photometry|candela|base64|filePath|localPath|absolutePath)$/i.test(key)) {
      if (nested !== null && nested !== false && nested !== undefined) {
        return "raw_artifact_content_not_approved";
      }
    }
    const blocker = unsafeValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function validateIntent(value) {
  if (!exactKeys(value, INTENT_KEYS)) return { ok: false, blocker: "artifact_intent_invalid_shape" };
  if (
    value.schemaId !== IES_ARTIFACT_INTENT_SCHEMA_ID
    || value.schemaVersion !== IES_ARTIFACT_INTENT_SCHEMA_VERSION
  ) return { ok: false, blocker: "artifact_intent_schema_unsupported" };
  if (value.artifactKind !== IES_ARTIFACT_KIND) {
    return { ok: false, blocker: "artifact_kind_unsupported" };
  }
  return { ok: true, value: clonePlain(value) };
}

function validateSourceSafety(value) {
  if (!exactKeys(value, SOURCE_SAFETY_KEYS)) return { ok: false, blocker: "request_safety_invalid_shape" };
  if (
    value.readOnly !== true
    || value.nonPersistent !== true
    || value.traceabilityEnvelopeIgnored !== true
  ) return { ok: false, blocker: "request_safety_not_accepted" };
  for (const key of SOURCE_SAFETY_KEYS.filter((key) => ![
    "readOnly",
    "nonPersistent",
    "traceabilityEnvelopeIgnored",
  ].includes(key))) {
    if (value[key] !== false) return { ok: false, blocker: "request_safety_not_accepted" };
  }
  return { ok: true };
}

function validateThermalSafety(value) {
  return exactKeys(value, THERMAL_SAFETY_KEYS)
    && THERMAL_SAFETY_KEYS.every((key) => value[key] === false);
}

function validateEngineContract(value, ready) {
  if (!exactKeys(value, ENGINE_CONTRACT_KEYS)) {
    return { ok: false, blocker: "engine_contract_invalid_shape" };
  }
  if (
    value.outputSchemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.outputSchemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
  ) return { ok: false, blocker: "engine_contract_schema_unsupported" };
  if (ready && value.outputState !== "complete") {
    return { ok: false, blocker: "engine_contract_state_mismatch" };
  }
  if (!ready && value.outputState !== "blocked_fail_closed") {
    return { ok: false, blocker: "engine_contract_state_mismatch" };
  }
  const evidence = fingerprintArray(value.evidenceFingerprints, ready
    ? { minimum: 1, maximum: 1 }
    : { minimum: 0, maximum: 0 });
  if (!evidence) return { ok: false, blocker: "engine_contract_evidence_invalid" };
  const projected = {
    outputSchemaId: value.outputSchemaId,
    outputSchemaVersion: value.outputSchemaVersion,
    outputState: value.outputState,
    resultId: value.resultId === null ? null : fingerprint(value.resultId),
    requestFingerprint: value.requestFingerprint === null ? null : fingerprint(value.requestFingerprint),
    sourceVersionFingerprint: value.sourceVersionFingerprint === null
      ? null
      : fingerprint(value.sourceVersionFingerprint),
    policyFingerprint: value.policyFingerprint === null ? null : fingerprint(value.policyFingerprint),
    evidenceFingerprints: evidence,
  };
  if (ready && [
    projected.resultId,
    projected.requestFingerprint,
    projected.sourceVersionFingerprint,
    projected.policyFingerprint,
  ].some((entry) => !entry)) return { ok: false, blocker: "engine_contract_identity_invalid" };
  if (!ready && projected.resultId !== null) {
    return { ok: false, blocker: "engine_contract_blocked_result_present" };
  }
  return { ok: true, value: projected };
}

function validateProvenance(value) {
  if (!exactKeys(value, PROVENANCE_KEYS)) return { ok: false, blocker: "provenance_invalid_shape" };
  const output = {
    selectedOpticKey: boundedText(value.selectedOpticKey),
    opticBomId: boundedText(value.opticBomId),
    evidenceRef: boundedText(value.evidenceRef),
    programValidationState: boundedText(value.programValidationState),
    selectedTierOrProfile: boundedText(value.selectedTierOrProfile),
  };
  if (Object.values(output).some((entry) => !entry)) {
    return { ok: false, blocker: "provenance_invalid" };
  }
  return { ok: true, value: output };
}

function validateThermal(value, provenance, sourceVersionMarker) {
  if (!exactKeys(value, THERMAL_KEYS)) return { ok: false, blocker: "thermal_invalid_shape" };
  const output = {
    schemaId: boundedText(value.schemaId),
    schemaVersion: value.schemaVersion,
    selectedOpticKey: boundedText(value.selectedOpticKey),
    opticBomId: boundedText(value.opticBomId),
    sourceRevision: boundedText(value.sourceRevision),
    evidenceRef: boundedText(value.evidenceRef),
    programValidationState: boundedText(value.programValidationState),
    selectedRoomTaC: finiteNumber(value.selectedRoomTaC),
    referenceRoomTaC: finiteNumber(value.referenceRoomTaC),
    referenceInternalTaC: finiteNumber(value.referenceInternalTaC),
    opticThermalRiseTaC: finiteNumber(value.opticThermalRiseTaC),
    derivedInternalTaC: finiteNumber(value.derivedInternalTaC),
    curveLookupTaC: finiteNumber(value.curveLookupTaC),
    effectiveCurveTaC: finiteNumber(value.effectiveCurveTaC),
    temperatureMode: boundedText(value.temperatureMode),
    requestedCurrentMa: finiteNumber(value.requestedCurrentMa),
    currentMode: boundedText(value.currentMode),
    verifiedLmPerM: finiteNumber(value.verifiedLmPerM),
    curveFilename: boundedText(value.curveFilename),
    curveChecksumVerified: value.curveChecksumVerified,
    opticRiseAppliedCount: value.opticRiseAppliedCount,
    readOnly: value.readOnly,
    safetyFlags: clonePlain(value.safetyFlags),
  };
  for (const key of [
    "schemaId",
    "selectedOpticKey",
    "opticBomId",
    "sourceRevision",
    "evidenceRef",
    "programValidationState",
    "selectedRoomTaC",
    "referenceRoomTaC",
    "referenceInternalTaC",
    "opticThermalRiseTaC",
    "derivedInternalTaC",
    "curveLookupTaC",
    "effectiveCurveTaC",
    "temperatureMode",
    "requestedCurrentMa",
    "currentMode",
    "verifiedLmPerM",
    "curveFilename",
  ]) {
    if (output[key] === null) return { ok: false, blocker: "thermal_invalid" };
  }
  if (!Number.isSafeInteger(output.schemaVersion) || output.schemaVersion < 1) {
    return { ok: false, blocker: "thermal_schema_invalid" };
  }
  if (
    output.requestedCurrentMa < 0
    || output.verifiedLmPerM < 0
    || output.opticThermalRiseTaC < 0
  ) return { ok: false, blocker: "thermal_non_negative_required" };
  if (
    output.selectedOpticKey !== provenance.selectedOpticKey
    || output.opticBomId !== provenance.opticBomId
    || output.evidenceRef !== provenance.evidenceRef
    || output.programValidationState !== provenance.programValidationState
    || output.sourceRevision !== sourceVersionMarker
  ) return { ok: false, blocker: "thermal_provenance_mismatch" };
  if (
    exactAdd(output.referenceRoomTaC, output.opticThermalRiseTaC) !== output.referenceInternalTaC
    || exactAdd(output.selectedRoomTaC, output.opticThermalRiseTaC) !== output.derivedInternalTaC
    || output.curveLookupTaC !== output.derivedInternalTaC
  ) return { ok: false, blocker: "thermal_identity_mismatch" };
  if (!TEMPERATURE_MODES.has(output.temperatureMode) || !CURRENT_MODES.has(output.currentMode)) {
    return { ok: false, blocker: "thermal_mode_unsupported" };
  }
  if (
    (output.temperatureMode === "clamped-low" && output.effectiveCurveTaC !== 25)
    || (output.temperatureMode === "clamped-high" && output.effectiveCurveTaC !== 65)
    || (output.temperatureMode === "interpolated" && output.effectiveCurveTaC !== output.curveLookupTaC)
  ) return { ok: false, blocker: "thermal_effective_temperature_mismatch" };
  if (
    output.curveChecksumVerified !== true
    || output.opticRiseAppliedCount !== 1
    || output.readOnly !== true
    || !validateThermalSafety(output.safetyFlags)
  ) return { ok: false, blocker: "thermal_safety_not_accepted" };
  return { ok: true, value: output };
}

function validateSelectedResult(value, engine) {
  if (!exactKeys(value, SELECTED_RESULT_KEYS)) return { ok: false, blocker: "selected_result_invalid_shape" };
  const text = {
    resultId: fingerprint(value.resultId),
    selectedProfile: boundedText(value.selectedProfile),
    sourceKind: boundedText(value.sourceKind),
    sourceInputFingerprint: fingerprint(value.sourceInputFingerprint),
    sourceVersionMarker: boundedText(value.sourceVersionMarker),
    internalComponentResultId: fingerprint(value.internalComponentResultId),
  };
  if (Object.values(text).some((entry) => !entry)) {
    return { ok: false, blocker: "selected_result_invalid" };
  }
  if (
    text.resultId !== engine.resultId
    || value.accepted !== true
    || value.engineVerified !== true
    || value.readOnly !== true
    || nonNegativeInteger(value.runCount) === null
  ) return { ok: false, blocker: "selected_result_not_accepted" };
  const provenance = validateProvenance(value.technicalProvenance);
  if (!provenance.ok) return provenance;
  if (provenance.value.selectedTierOrProfile !== text.selectedProfile) {
    return { ok: false, blocker: "selected_profile_mismatch" };
  }
  const thermal = validateThermal(value.thermal, provenance.value, text.sourceVersionMarker);
  if (!thermal.ok) return thermal;
  return {
    ok: true,
    value: {
      resultId: text.resultId,
      accepted: true,
      engineVerified: true,
      selectedProfile: text.selectedProfile,
      sourceKind: text.sourceKind,
      sourceInputFingerprint: text.sourceInputFingerprint,
      sourceVersionMarker: text.sourceVersionMarker,
      internalComponentResultId: text.internalComponentResultId,
      technicalProvenance: provenance.value,
      thermal: thermal.value,
      runCount: value.runCount,
      readOnly: true,
    },
  };
}

function validateRow(value, index, engine) {
  if (!exactKeys(value, ROW_KEYS)) return { ok: false, blocker: "row_invalid_shape" };
  if (
    value.schemaId !== ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.schemaVersion !== ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
  ) return { ok: false, blocker: "row_schema_unsupported" };
  if (["rowKey", "runKey", "rowKind", "state"].some((key) => !boundedText(value[key]))) {
    return { ok: false, blocker: "row_text_invalid" };
  }
  for (const key of [
    "runIndex",
    "rowOrdinal",
    "boardCount",
    "segmentCount",
    "zoneCount",
    "clipPointsCount",
    "suspensionPointsCount",
    "gearTrayPlanCount",
    "reservedRangesCount",
  ]) {
    if (nonNegativeInteger(value[key]) === null) return { ok: false, blocker: "row_count_invalid" };
  }
  if (
    value.rowOrdinal !== index + 1
    || value.rowKind !== "run_summary"
    || value.state !== "complete"
    || value.accepted !== true
    || value.engineVerified !== true
    || typeof value.hasBodyRequested !== "boolean"
    || value.requestFingerprint !== engine.requestFingerprint
    || value.sourceVersionFingerprint !== engine.sourceVersionFingerprint
    || value.policyFingerprint !== engine.policyFingerprint
    || value.resultId !== engine.resultId
    || value.readOnly !== true
    || value.rawPayloadReturned !== false
  ) return { ok: false, blocker: "row_identity_mismatch" };
  return { ok: true, value: clonePlain(value) };
}

function validateRunTable(value, engine, runCount) {
  if (!exactKeys(value, RUN_TABLE_KEYS)) return { ok: false, blocker: "runtable_invalid_shape" };
  if (
    value.rowSchemaId !== ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.rowSchemaVersion !== ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
  ) return { ok: false, blocker: "runtable_schema_unsupported" };
  if (
    nonNegativeInteger(value.rowCount) === null
    || !Array.isArray(value.rows)
    || value.rows.length !== value.rowCount
    || value.rowCount !== runCount
    || value.nonPersistent !== true
    || value.readOnly !== true
  ) return { ok: false, blocker: "runtable_invalid" };
  const rows = [];
  const rowKeys = new Set();
  const runKeys = new Set();
  for (let index = 0; index < value.rows.length; index += 1) {
    const row = validateRow(value.rows[index], index, engine);
    if (!row.ok) return row;
    if (rowKeys.has(row.value.rowKey) || runKeys.has(row.value.runKey)) {
      return { ok: false, blocker: "runtable_key_duplicate" };
    }
    rowKeys.add(row.value.rowKey);
    runKeys.add(row.value.runKey);
    rows.push(row.value);
  }
  return {
    ok: true,
    value: {
      rowSchemaId: value.rowSchemaId,
      rowSchemaVersion: value.rowSchemaVersion,
      rowCount: value.rowCount,
      rows,
      nonPersistent: true,
      readOnly: true,
    },
  };
}

function validateAudit(value, ready, requestId, replayKey) {
  if (!exactKeys(value, AUDIT_KEYS)) return { ok: false, blocker: "audit_invalid_shape" };
  if (
    value.schemaId !== IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID
    || value.schemaVersion !== IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION
    || !ATTEMPT_PATTERN.test(value.attemptFingerprint)
    || value.deterministic !== true
    || value.traceabilityInspected !== false
    || value.engineInvoked !== false
    || value.labConsumerInvoked !== false
    || value.generatorInvoked !== false
    || value.routeInvoked !== false
    || value.persistenceAttempted !== false
    || value.artifactWriteAttempted !== false
    || value.emailAttempted !== false
  ) return { ok: false, blocker: "audit_not_accepted" };
  if (ready) {
    if (
      value.state !== "accepted_read_only"
      || value.accepted !== true
      || value.requestId !== requestId
      || value.replayKey !== replayKey
    ) return { ok: false, blocker: "audit_identity_mismatch" };
  } else if (
    value.state !== "blocked_fail_closed"
    || value.accepted !== false
    || value.requestId !== null
    || value.replayKey !== null
  ) return { ok: false, blocker: "audit_identity_mismatch" };
  return { ok: true, value: clonePlain(value) };
}

function compatibilitySafety() {
  const value = {
    readOnly: true,
    nonPersistent: true,
    compatibilityOnly: true,
    outerTraceabilityIgnored: true,
    sourceRequestMutated: false,
    producerImplementationImported: false,
    engineInvoked: false,
    iesGeneratorInvoked: false,
    iesGenerated: false,
    authorityCreated: false,
    evidenceAccepted: false,
    referenceMutated: false,
    routeAdded: false,
    persistenceAttempted: false,
    networkWritten: false,
    fileWritten: false,
    emailSent: false,
    readinessActivated: false,
    rawRequestReturned: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaReturned: false,
    privatePathsReturned: false,
  };
  if (!exactKeys(value, COMPATIBILITY_SAFETY_KEYS)) throw new Error("internal compatibility safety mismatch");
  return value;
}

function sourceRequestProjection(request) {
  const projection = {
    schemaId: request.schemaId,
    schemaVersion: request.schemaVersion,
    state: request.state,
    requestId: request.requestId,
    replayKey: request.replayKey,
  };
  if (!exactKeys(projection, SOURCE_REQUEST_PROJECTION_KEYS)) {
    throw new Error("internal source request projection mismatch");
  }
  return projection;
}

function blockedCompatibility(blocker) {
  return deepFreeze({
    schemaId: IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_VERSION,
    state: IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES.blockedFailClosed,
    sourceRequest: null,
    artifactIntent: null,
    engineContract: null,
    selectedResult: null,
    runTable: null,
    blockers: [BLOCKER_PATTERN.test(blocker) ? blocker : "request_compatibility_blocked"],
    warnings: [],
    audit: null,
    safetyFlags: compatibilitySafety(),
  });
}

function validateReady(request) {
  if (!REQUEST_ID_PATTERN.test(request.requestId) || !REPLAY_KEY_PATTERN.test(request.replayKey)) {
    return { ok: false, blocker: "request_identity_invalid" };
  }
  const intent = validateIntent(request.artifactIntent);
  if (!intent.ok) return intent;
  const engine = validateEngineContract(request.engineContract, true);
  if (!engine.ok) return engine;
  const blockers = canonicalStrings(request.blockers, { maximum: 0, blockers: true });
  const warnings = canonicalStrings(request.warnings);
  if (!blockers || !warnings) return { ok: false, blocker: "request_diagnostics_invalid" };
  const selectedResult = validateSelectedResult(request.selectedResult, engine.value);
  if (!selectedResult.ok) return selectedResult;
  const runTable = validateRunTable(request.runTable, engine.value, selectedResult.value.runCount);
  if (!runTable.ok) return runTable;
  const audit = validateAudit(request.audit, true, request.requestId, request.replayKey);
  if (!audit.ok) return audit;
  const safety = validateSourceSafety(request.safetyFlags);
  if (!safety.ok) return safety;
  return {
    ok: true,
    ready: true,
    value: {
      sourceRequest: sourceRequestProjection(request),
      artifactIntent: intent.value,
      engineContract: engine.value,
      selectedResult: selectedResult.value,
      runTable: runTable.value,
      blockers,
      warnings,
      audit: audit.value,
    },
  };
}

function validateBlocked(request) {
  if (request.requestId !== null || request.replayKey !== null) {
    return { ok: false, blocker: "blocked_request_identity_present" };
  }
  if (request.selectedResult !== null || request.runTable !== null) {
    return { ok: false, blocker: "blocked_request_body_present" };
  }
  const intent = validateIntent(request.artifactIntent);
  if (!intent.ok) return intent;
  const engine = validateEngineContract(request.engineContract, false);
  if (!engine.ok) return engine;
  const blockers = canonicalStrings(request.blockers, { minimum: 1, blockers: true });
  const warnings = canonicalStrings(request.warnings);
  if (!blockers || !warnings) return { ok: false, blocker: "blocked_request_diagnostics_invalid" };
  const audit = validateAudit(request.audit, false, null, null);
  if (!audit.ok) return audit;
  const safety = validateSourceSafety(request.safetyFlags);
  if (!safety.ok) return safety;
  return {
    ok: true,
    ready: false,
    value: {
      sourceRequest: sourceRequestProjection(request),
      artifactIntent: intent.value,
      engineContract: engine.value,
      selectedResult: null,
      runTable: null,
      blockers,
      warnings,
      audit: audit.value,
    },
  };
}

export function adaptIesArtifactRequestV1Compatibility(request, ignoredOuterTraceability = null) {
  void ignoredOuterTraceability;
  const unsafe = unsafeValue(request);
  if (unsafe) return blockedCompatibility(unsafe);
  if (!exactKeys(request, REQUEST_KEYS)) return blockedCompatibility("request_invalid_shape");
  if (
    request.schemaId !== IES_ARTIFACT_REQUEST_SCHEMA_ID
    || request.schemaVersion !== IES_ARTIFACT_REQUEST_SCHEMA_VERSION
  ) return blockedCompatibility("request_schema_unsupported");

  let validated;
  if (request.state === SOURCE_REQUEST_STATES.readyReadOnly) {
    validated = validateReady(request);
  } else if (request.state === SOURCE_REQUEST_STATES.blockedFailClosed) {
    validated = validateBlocked(request);
  } else {
    return blockedCompatibility("request_state_unsupported");
  }
  if (!validated.ok) return blockedCompatibility(validated.blocker);

  return deepFreeze({
    schemaId: IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_REQUEST_COMPATIBILITY_SCHEMA_VERSION,
    state: validated.ready
      ? IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES.compatibleReady
      : IES_ARTIFACT_REQUEST_COMPATIBILITY_STATES.compatibleBlocked,
    sourceRequest: validated.value.sourceRequest,
    artifactIntent: validated.value.artifactIntent,
    engineContract: validated.value.engineContract,
    selectedResult: validated.value.selectedResult,
    runTable: validated.value.runTable,
    blockers: validated.value.blockers,
    warnings: validated.value.warnings,
    audit: validated.value.audit,
    safetyFlags: compatibilitySafety(),
  });
}
