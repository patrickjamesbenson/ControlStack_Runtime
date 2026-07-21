import {
  ENGINE_SELECTION_SET_SCHEMA_ID,
  ENGINE_SELECTION_SET_SCHEMA_VERSION,
  ENGINE_OUTPUT_SCHEMA_ID,
  ENGINE_OUTPUT_SCHEMA_VERSION,
  ENGINE_OUTPUT_STATES,
  ENGINE_RUNTABLE_ROW_SCHEMA_ID,
  ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
} from "./runtimeEngineOutputContractV1.js";
import {
  IES_ARTIFACT_INTENT_SCHEMA_ID,
  IES_ARTIFACT_INTENT_SCHEMA_VERSION,
  IES_ARTIFACT_KIND,
  IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID,
  IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION,
  IES_ARTIFACT_REQUEST_SCHEMA_ID,
  IES_ARTIFACT_REQUEST_SCHEMA_VERSION,
  IES_ARTIFACT_REQUEST_STATES,
} from "./runtimeIesArtifactRequestContractV1.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const IES_GENERATION_INPUT_SCHEMA_ID =
  "controlstack.downstream.ies-generation-input.v1";
export const IES_GENERATION_INPUT_SCHEMA_VERSION = 1;
export const IES_GENERATION_INPUT_AUDIT_SCHEMA_ID =
  "controlstack.downstream.ies-generation-input-audit.v1";
export const IES_GENERATION_INPUT_AUDIT_SCHEMA_VERSION = 1;

export const IES_GENERATION_INPUT_STATES = Object.freeze({
  readyReadOnly: "ready_read_only",
  blockedFailClosed: "blocked_fail_closed",
});

const INPUT_REQUIRED_KEYS = Object.freeze(["artifactRequest", "selectionRequest"]);
const INPUT_OPTIONAL_KEYS = Object.freeze(["traceabilityEnvelope"]);
const SELECTION_REQUEST_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "selectionSet",
  "requestFingerprint",
]);
const SELECTION_SET_KEYS = Object.freeze(["product", "lighting", "runs", "control"]);
const PRODUCT_KEYS = Object.freeze(["system", "optic"]);
const LIGHTING_KEYS = Object.freeze(["targetLmPerM", "roomAmbientTaC"]);
const RUN_KEYS = Object.freeze(["qty", "lengthMm"]);
const CONTROL_KEYS = Object.freeze(["protocol"]);

const ARTIFACT_REQUEST_KEYS = Object.freeze([
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
const REQUEST_AUDIT_KEYS = Object.freeze([
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
const REQUEST_SAFETY_KEYS = Object.freeze([
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

const SOURCE_REQUEST_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "requestId",
  "replayKey",
]);
const NORMALIZED_SELECTION_KEYS = Object.freeze([
  "system",
  "optic",
  "targetLmPerM",
  "roomAmbientTaC",
  "protocol",
]);
const NORMALIZED_RUN_KEYS = Object.freeze(["runIndex", "quantity", "lengthMm"]);
const GENERATION_AUDIT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "attemptFingerprint",
  "state",
  "accepted",
  "generationInputId",
  "replayKey",
  "deterministic",
  "traceabilityInspected",
  "artifactRequestValidated",
  "selectionRequestValidated",
  "referenceBound",
  "sealedReferenceLoaded",
  "generatorInvoked",
  "routeInvoked",
  "persistenceAttempted",
  "artifactWriteAttempted",
  "emailAttempted",
]);
const GENERATION_SAFETY_KEYS = Object.freeze([
  "readOnly",
  "nonPersistent",
  "traceabilityEnvelopeIgnored",
  "artifactRequestConsumed",
  "selectionRequestConsumed",
  "referenceBound",
  "sealedReferenceLoaded",
  "authorityInspected",
  "authorityMutated",
  "referenceMutated",
  "engineInvoked",
  "donorEngineInvoked",
  "labConsumerInvoked",
  "iesGeneratorInvoked",
  "iesGenerated",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaReturned",
  "artifactWritten",
  "fileWritten",
  "networkWritten",
  "emailSent",
  "downloadCreated",
  "routeAdded",
  "postEndpointAdded",
  "persistenceAttempted",
  "runtimeDataMutated",
  "downstreamActivated",
]);

const FINGERPRINT_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{7,255}$/;
const REQUEST_ID_PATTERN = /^ies-artifact-request-v1:[0-9a-f]{40}$/;
const REQUEST_REPLAY_PATTERN = /^ies-artifact-replay-v1:[0-9a-f]{40}$/;
const GENERATION_ID_PATTERN = /^ies-generation-input-v1:[0-9a-f]{40}$/;
const GENERATION_REPLAY_PATTERN = /^ies-generation-input-replay-v1:[0-9a-f]{40}$/;
const BLOCKER_PATTERN = /^[a-z][a-z0-9_-]{0,127}$/;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/])/i;
const RAW_CONTENT_PATTERN = /(?:^\s*IESNA:|\bTILT=|data:[^\s]+;base64|\bbase64\b)/i;
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

function validInputKeys(value) {
  if (!isPlainObject(value)) return false;
  const allowed = new Set([...INPUT_REQUIRED_KEYS, ...INPUT_OPTIONAL_KEYS]);
  const keys = Object.keys(value);
  return INPUT_REQUIRED_KEYS.every((key) => keys.includes(key))
    && keys.every((key) => allowed.has(key));
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
    || PRIVATE_PATH_PATTERN.test(value)
    || RAW_CONTENT_PATTERN.test(value)
  ) return null;
  return value;
}

function fingerprint(value) {
  return typeof value === "string"
    && FINGERPRINT_PATTERN.test(value)
    && !PRIVATE_PATH_PATTERN.test(value)
    && !RAW_CONTENT_PATTERN.test(value)
    ? value
    : null;
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? (Object.is(value, -0) ? 0 : value)
    : null;
}

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function canonicalStrings(value, { minimum = 0, maximum = 64, blockers = false } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
  const output = [];
  const seen = new Set();
  for (const entry of value) {
    const text = blockers
      ? (typeof entry === "string" && BLOCKER_PATTERN.test(entry) ? entry : null)
      : boundedText(entry);
    if (!text || seen.has(text)) return null;
    seen.add(text);
    output.push(text);
  }
  return output;
}

function fingerprintArray(value, { minimum = 1, maximum = 1 } = {}) {
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

function validateSelectionRequest(value) {
  if (!exactKeys(value, SELECTION_REQUEST_KEYS)) {
    return { ok: false, blocker: "selection-request-invalid-shape" };
  }
  if (
    value.schemaId !== ENGINE_SELECTION_SET_SCHEMA_ID
    || value.schemaVersion !== ENGINE_SELECTION_SET_SCHEMA_VERSION
  ) return { ok: false, blocker: "selection-request-schema-unsupported" };
  if (!exactKeys(value.selectionSet, SELECTION_SET_KEYS)) {
    return { ok: false, blocker: "selection-set-invalid-shape" };
  }
  const { product, lighting, runs, control } = value.selectionSet;
  if (!exactKeys(product, PRODUCT_KEYS)) return { ok: false, blocker: "selection-product-invalid-shape" };
  if (!exactKeys(lighting, LIGHTING_KEYS)) return { ok: false, blocker: "selection-lighting-invalid-shape" };
  if (!Array.isArray(runs) || runs.length !== 1) return { ok: false, blocker: "selection-single-run-required" };
  if (!exactKeys(runs[0], RUN_KEYS)) return { ok: false, blocker: "selection-run-invalid-shape" };
  if (!exactKeys(control, CONTROL_KEYS)) return { ok: false, blocker: "selection-control-invalid-shape" };

  const system = boundedText(product.system);
  const optic = boundedText(product.optic);
  const targetLmPerM = finiteNumber(lighting.targetLmPerM);
  const roomAmbientTaC = finiteNumber(lighting.roomAmbientTaC);
  const protocol = boundedText(control.protocol);
  const quantity = positiveInteger(runs[0].qty);
  const lengthMm = positiveInteger(runs[0].lengthMm);
  if (!system || !optic || targetLmPerM === null || roomAmbientTaC === null || !protocol) {
    return { ok: false, blocker: "selection-values-invalid" };
  }
  if (targetLmPerM < 0) return { ok: false, blocker: "selection-target-lm-per-m-negative" };
  if (quantity === null || lengthMm === null) return { ok: false, blocker: "selection-run-values-invalid" };

  const normalizedSet = {
    product: { system, optic },
    lighting: { targetLmPerM, roomAmbientTaC },
    runs: [{ qty: quantity, lengthMm }],
    control: { protocol },
  };
  const expectedFingerprint = stableFingerprint("engine-selection-set-v1", normalizedSet);
  if (value.requestFingerprint !== expectedFingerprint) {
    return { ok: false, blocker: "selection-request-fingerprint-mismatch" };
  }
  return {
    ok: true,
    value: {
      schemaId: value.schemaId,
      schemaVersion: value.schemaVersion,
      requestFingerprint: value.requestFingerprint,
      selectionSet: normalizedSet,
      selection: { system, optic, targetLmPerM, roomAmbientTaC, protocol },
      run: { runIndex: 0, quantity, lengthMm },
    },
  };
}

function validateIntent(value) {
  if (!exactKeys(value, INTENT_KEYS)) return { ok: false, blocker: "artifact-intent-invalid-shape" };
  if (
    value.schemaId !== IES_ARTIFACT_INTENT_SCHEMA_ID
    || value.schemaVersion !== IES_ARTIFACT_INTENT_SCHEMA_VERSION
    || value.artifactKind !== IES_ARTIFACT_KIND
  ) return { ok: false, blocker: "artifact-intent-schema-unsupported" };
  return { ok: true, value: clonePlain(value) };
}

function validateEngineContract(value) {
  if (!exactKeys(value, ENGINE_CONTRACT_KEYS)) return { ok: false, blocker: "artifact-engine-contract-invalid-shape" };
  if (
    value.outputSchemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.outputSchemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
    || value.outputState !== ENGINE_OUTPUT_STATES.complete
  ) return { ok: false, blocker: "artifact-engine-contract-not-complete" };
  const resultId = fingerprint(value.resultId);
  const requestFingerprint = fingerprint(value.requestFingerprint);
  const sourceVersionFingerprint = fingerprint(value.sourceVersionFingerprint);
  const policyFingerprint = fingerprint(value.policyFingerprint);
  const evidenceFingerprints = fingerprintArray(value.evidenceFingerprints);
  if (!resultId || !requestFingerprint || !sourceVersionFingerprint || !policyFingerprint || !evidenceFingerprints) {
    return { ok: false, blocker: "artifact-engine-contract-identity-invalid" };
  }
  return {
    ok: true,
    value: {
      outputSchemaId: value.outputSchemaId,
      outputSchemaVersion: value.outputSchemaVersion,
      outputState: value.outputState,
      resultId,
      requestFingerprint,
      sourceVersionFingerprint,
      policyFingerprint,
      evidenceFingerprints,
    },
  };
}

function validateThermalSafety(value) {
  if (!exactKeys(value, THERMAL_SAFETY_KEYS)) return false;
  return THERMAL_SAFETY_KEYS.every((key) => value[key] === false);
}

function validateProvenance(value) {
  if (!exactKeys(value, PROVENANCE_KEYS)) return { ok: false, blocker: "artifact-provenance-invalid-shape" };
  const output = {};
  for (const key of PROVENANCE_KEYS) {
    output[key] = boundedText(value[key]);
    if (!output[key]) return { ok: false, blocker: "artifact-provenance-value-invalid" };
  }
  return { ok: true, value: output };
}

function validateThermal(value, provenance, sourceVersionMarker) {
  if (!exactKeys(value, THERMAL_KEYS)) return { ok: false, blocker: "artifact-thermal-invalid-shape" };
  const textKeys = [
    "schemaId",
    "selectedOpticKey",
    "opticBomId",
    "sourceRevision",
    "evidenceRef",
    "programValidationState",
    "temperatureMode",
    "currentMode",
    "curveFilename",
  ];
  const output = { schemaVersion: value.schemaVersion };
  for (const key of textKeys) {
    output[key] = boundedText(value[key]);
    if (!output[key]) return { ok: false, blocker: "artifact-thermal-text-invalid" };
  }
  const numericKeys = [
    "selectedRoomTaC",
    "referenceRoomTaC",
    "referenceInternalTaC",
    "opticThermalRiseTaC",
    "derivedInternalTaC",
    "curveLookupTaC",
    "effectiveCurveTaC",
    "requestedCurrentMa",
    "verifiedLmPerM",
  ];
  for (const key of numericKeys) {
    output[key] = finiteNumber(value[key]);
    if (output[key] === null) return { ok: false, blocker: "artifact-thermal-number-invalid" };
  }
  if (!TEMPERATURE_MODES.has(output.temperatureMode) || !CURRENT_MODES.has(output.currentMode)) {
    return { ok: false, blocker: "artifact-thermal-mode-invalid" };
  }
  if (
    value.curveChecksumVerified !== true
    || value.opticRiseAppliedCount !== 1
    || value.readOnly !== true
    || !validateThermalSafety(value.safetyFlags)
  ) return { ok: false, blocker: "artifact-thermal-safety-invalid" };
  if (
    output.selectedOpticKey !== provenance.selectedOpticKey
    || output.opticBomId !== provenance.opticBomId
    || output.evidenceRef !== provenance.evidenceRef
    || output.programValidationState !== provenance.programValidationState
    || output.sourceRevision !== sourceVersionMarker
  ) return { ok: false, blocker: "artifact-thermal-identity-mismatch" };
  if (
    output.referenceRoomTaC + output.opticThermalRiseTaC !== output.referenceInternalTaC
    || output.selectedRoomTaC + output.opticThermalRiseTaC !== output.derivedInternalTaC
    || output.curveLookupTaC !== output.derivedInternalTaC
  ) return { ok: false, blocker: "artifact-thermal-equation-mismatch" };
  if (
    output.requestedCurrentMa < 0
    || output.verifiedLmPerM < 0
    || output.opticThermalRiseTaC < 0
  ) {
    return { ok: false, blocker: "artifact-thermal-non-negative-required" };
  }
  if (/[/\\]/.test(output.curveFilename)) {
    return { ok: false, blocker: "artifact-thermal-private-path-rejected" };
  }
  if (
    (output.temperatureMode === "clamped-low" && output.effectiveCurveTaC !== 25)
    || (output.temperatureMode === "clamped-high" && output.effectiveCurveTaC !== 65)
    || (output.temperatureMode === "interpolated" && output.effectiveCurveTaC !== output.curveLookupTaC)
  ) {
    return { ok: false, blocker: "artifact-thermal-effective-temperature-mismatch" };
  }
  return {
    ok: true,
    value: {
      ...output,
      curveChecksumVerified: true,
      opticRiseAppliedCount: 1,
      readOnly: true,
      safetyFlags: clonePlain(value.safetyFlags),
    },
  };
}

function validateSelectedResult(value, engine) {
  if (!exactKeys(value, SELECTED_RESULT_KEYS)) return { ok: false, blocker: "artifact-selected-result-invalid-shape" };
  const resultId = fingerprint(value.resultId);
  const selectedProfile = boundedText(value.selectedProfile);
  const sourceKind = boundedText(value.sourceKind);
  const sourceInputFingerprint = fingerprint(value.sourceInputFingerprint);
  const sourceVersionMarker = boundedText(value.sourceVersionMarker);
  const internalComponentResultId = fingerprint(value.internalComponentResultId);
  if (
    !resultId
    || resultId !== engine.resultId
    || value.accepted !== true
    || value.engineVerified !== true
    || !selectedProfile
    || !sourceKind
    || !sourceInputFingerprint
    || !sourceVersionMarker
    || !internalComponentResultId
    || value.runCount !== 1
    || value.readOnly !== true
  ) return { ok: false, blocker: "artifact-selected-result-identity-invalid" };
  const provenance = validateProvenance(value.technicalProvenance);
  if (!provenance.ok) return provenance;
  if (provenance.value.selectedTierOrProfile !== selectedProfile) {
    return { ok: false, blocker: "artifact-selected-result-profile-mismatch" };
  }
  const thermal = validateThermal(value.thermal, provenance.value, sourceVersionMarker);
  if (!thermal.ok) return thermal;
  return {
    ok: true,
    value: {
      resultId,
      accepted: true,
      engineVerified: true,
      selectedProfile,
      sourceKind,
      sourceInputFingerprint,
      sourceVersionMarker,
      internalComponentResultId,
      technicalProvenance: provenance.value,
      thermal: thermal.value,
      runCount: 1,
      readOnly: true,
    },
  };
}

function validateRow(value, engine, selectionFingerprint) {
  if (!exactKeys(value, ROW_KEYS)) return { ok: false, blocker: "artifact-row-invalid-shape" };
  if (
    value.schemaId !== ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.schemaVersion !== ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
    || !fingerprint(value.rowKey)
    || !boundedText(value.runKey, 180)
    || value.runIndex !== 0
    || value.rowOrdinal !== 1
    || value.rowKind !== "run_summary"
    || value.state !== ENGINE_OUTPUT_STATES.complete
    || value.accepted !== true
    || value.engineVerified !== true
    || value.readOnly !== true
    || value.rawPayloadReturned !== false
    || value.requestFingerprint !== selectionFingerprint
    || value.requestFingerprint !== engine.requestFingerprint
    || value.sourceVersionFingerprint !== engine.sourceVersionFingerprint
    || value.policyFingerprint !== engine.policyFingerprint
    || value.resultId !== engine.resultId
  ) return { ok: false, blocker: "artifact-row-identity-mismatch" };
  for (const key of ["rowKey", "runKey", "rowKind", "state"]) {
    if (!boundedText(value[key])) return { ok: false, blocker: "artifact-row-text-invalid" };
  }
  if (typeof value.hasBodyRequested !== "boolean") return { ok: false, blocker: "artifact-row-body-flag-invalid" };
  for (const key of [
    "boardCount",
    "segmentCount",
    "zoneCount",
    "clipPointsCount",
    "suspensionPointsCount",
    "gearTrayPlanCount",
    "reservedRangesCount",
  ]) {
    if (nonNegativeInteger(value[key]) === null) return { ok: false, blocker: "artifact-row-count-invalid" };
  }
  return { ok: true, value: clonePlain(value) };
}

function validateRunTable(value, engine, selectionFingerprint) {
  if (!exactKeys(value, RUN_TABLE_KEYS)) return { ok: false, blocker: "artifact-runtable-invalid-shape" };
  if (
    value.rowSchemaId !== ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.rowSchemaVersion !== ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
    || value.rowCount !== 1
    || !Array.isArray(value.rows)
    || value.rows.length !== 1
    || value.nonPersistent !== true
    || value.readOnly !== true
  ) return { ok: false, blocker: "artifact-runtable-invalid" };
  const row = validateRow(value.rows[0], engine, selectionFingerprint);
  if (!row.ok) return row;
  return {
    ok: true,
    value: {
      rowSchemaId: value.rowSchemaId,
      rowSchemaVersion: value.rowSchemaVersion,
      rowCount: 1,
      rows: [row.value],
      nonPersistent: true,
      readOnly: true,
    },
  };
}

function validateRequestAudit(value, requestId, replayKey, attemptFingerprint) {
  if (!exactKeys(value, REQUEST_AUDIT_KEYS)) return { ok: false, blocker: "artifact-audit-invalid-shape" };
  if (
    value.schemaId !== IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID
    || value.schemaVersion !== IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION
    || value.attemptFingerprint !== attemptFingerprint
    || !fingerprint(value.attemptFingerprint)
    || value.state !== "accepted_read_only"
    || value.accepted !== true
    || value.requestId !== requestId
    || value.replayKey !== replayKey
    || value.deterministic !== true
    || value.traceabilityInspected !== false
    || value.engineInvoked !== false
    || value.labConsumerInvoked !== false
    || value.generatorInvoked !== false
    || value.routeInvoked !== false
    || value.persistenceAttempted !== false
    || value.artifactWriteAttempted !== false
    || value.emailAttempted !== false
  ) return { ok: false, blocker: "artifact-audit-invalid" };
  return { ok: true, value: clonePlain(value) };
}

function validateRequestSafety(value) {
  if (!exactKeys(value, REQUEST_SAFETY_KEYS)) return false;
  if (
    value.readOnly !== true
    || value.nonPersistent !== true
    || value.traceabilityEnvelopeIgnored !== true
  ) return false;
  return REQUEST_SAFETY_KEYS
    .filter((key) => !["readOnly", "nonPersistent", "traceabilityEnvelopeIgnored"].includes(key))
    .every((key) => value[key] === false);
}

function expectedArtifactIdentity(intent, engine) {
  const payload = {
    schemaId: IES_ARTIFACT_REQUEST_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_REQUEST_SCHEMA_VERSION,
    artifactIntent: intent,
    engineContract: engine,
    blocker: null,
  };
  const attemptFingerprint = stableFingerprint("ies-artifact-request-attempt-v1", payload);
  const requestId = stableFingerprint("ies-artifact-request-v1", payload);
  const engineReplay = {
    requestFingerprint: engine.requestFingerprint,
    sourceVersionFingerprint: engine.sourceVersionFingerprint,
    policyFingerprint: engine.policyFingerprint,
    evidenceFingerprints: [...engine.evidenceFingerprints],
    outputSchemaId: ENGINE_OUTPUT_SCHEMA_ID,
    outputSchemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
  };
  const replayKey = stableFingerprint("ies-artifact-replay-v1", {
    requestId,
    engineReplay,
  });
  return { attemptFingerprint, requestId, replayKey };
}

function validateArtifactRequest(value, selectionFingerprint) {
  if (!exactKeys(value, ARTIFACT_REQUEST_KEYS)) return { ok: false, blocker: "artifact-request-invalid-shape" };
  if (
    value.schemaId !== IES_ARTIFACT_REQUEST_SCHEMA_ID
    || value.schemaVersion !== IES_ARTIFACT_REQUEST_SCHEMA_VERSION
  ) return { ok: false, blocker: "artifact-request-schema-unsupported" };
  if (value.state !== IES_ARTIFACT_REQUEST_STATES.readyReadOnly) {
    return { ok: false, blocker: "artifact-request-not-ready" };
  }
  if (!REQUEST_ID_PATTERN.test(value.requestId) || !REQUEST_REPLAY_PATTERN.test(value.replayKey)) {
    return { ok: false, blocker: "artifact-request-identity-invalid" };
  }
  const intent = validateIntent(value.artifactIntent);
  if (!intent.ok) return intent;
  const engine = validateEngineContract(value.engineContract);
  if (!engine.ok) return engine;
  if (engine.value.requestFingerprint !== selectionFingerprint) {
    return { ok: false, blocker: "artifact-selection-fingerprint-mismatch" };
  }
  const expectedIdentity = expectedArtifactIdentity(intent.value, engine.value);
  if (
    value.requestId !== expectedIdentity.requestId
    || value.replayKey !== expectedIdentity.replayKey
  ) return { ok: false, blocker: "artifact-request-deterministic-identity-mismatch" };
  const blockers = canonicalStrings(value.blockers, { maximum: 0, blockers: true });
  const warnings = canonicalStrings(value.warnings);
  if (!blockers || !warnings) return { ok: false, blocker: "artifact-diagnostics-invalid" };
  const selectedResult = validateSelectedResult(value.selectedResult, engine.value);
  if (!selectedResult.ok) return selectedResult;
  const runTable = validateRunTable(value.runTable, engine.value, selectionFingerprint);
  if (!runTable.ok) return runTable;
  const audit = validateRequestAudit(
    value.audit,
    value.requestId,
    value.replayKey,
    expectedIdentity.attemptFingerprint,
  );
  if (!audit.ok) return audit;
  if (!validateRequestSafety(value.safetyFlags)) return { ok: false, blocker: "artifact-request-safety-invalid" };
  return {
    ok: true,
    value: {
      schemaId: value.schemaId,
      schemaVersion: value.schemaVersion,
      requestId: value.requestId,
      replayKey: value.replayKey,
      artifactIntent: intent.value,
      engineContract: engine.value,
      selectedResult: selectedResult.value,
      runTable: runTable.value,
      blockers,
      warnings,
    },
  };
}

function generationSafety({ artifactRequestConsumed = false, selectionRequestConsumed = false } = {}) {
  const output = {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    artifactRequestConsumed,
    selectionRequestConsumed,
    referenceBound: false,
    sealedReferenceLoaded: false,
    authorityInspected: false,
    authorityMutated: false,
    referenceMutated: false,
    engineInvoked: false,
    donorEngineInvoked: false,
    labConsumerInvoked: false,
    iesGeneratorInvoked: false,
    iesGenerated: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaReturned: false,
    artifactWritten: false,
    fileWritten: false,
    networkWritten: false,
    emailSent: false,
    downloadCreated: false,
    routeAdded: false,
    postEndpointAdded: false,
    persistenceAttempted: false,
    runtimeDataMutated: false,
    downstreamActivated: false,
  };
  if (!exactKeys(output, GENERATION_SAFETY_KEYS)) throw new Error("internal generation safety shape mismatch");
  return output;
}

function sourceRequestProjection(request) {
  const output = {
    schemaId: request.schemaId,
    schemaVersion: request.schemaVersion,
    requestId: request.requestId,
    replayKey: request.replayKey,
  };
  if (!exactKeys(output, SOURCE_REQUEST_KEYS)) throw new Error("internal source request shape mismatch");
  return output;
}

function deterministicIdentity(artifact, selection, blocker = null) {
  const payload = {
    schemaId: IES_GENERATION_INPUT_SCHEMA_ID,
    schemaVersion: IES_GENERATION_INPUT_SCHEMA_VERSION,
    sourceRequest: artifact
      ? sourceRequestProjection(artifact)
      : null,
    artifactIntent: artifact?.artifactIntent ?? null,
    engineContract: artifact?.engineContract ?? null,
    selectionRequestFingerprint: selection?.requestFingerprint ?? null,
    selection: selection?.selection ?? null,
    run: selection?.run ?? null,
    technicalProvenance: artifact?.selectedResult?.technicalProvenance ?? null,
    thermal: artifact?.selectedResult?.thermal ?? null,
    blocker,
  };
  const attemptFingerprint = stableFingerprint("ies-generation-input-attempt-v1", payload);
  if (!artifact || !selection || blocker) {
    return { attemptFingerprint, generationInputId: null, replayKey: null };
  }
  const generationInputId = stableFingerprint("ies-generation-input-v1", payload);
  const replayKey = stableFingerprint("ies-generation-input-replay-v1", {
    generationInputId,
    artifactReplayKey: artifact.replayKey,
    selectionRequestFingerprint: selection.requestFingerprint,
  });
  return { attemptFingerprint, generationInputId, replayKey };
}

function generationAudit(identity, accepted) {
  const output = {
    schemaId: IES_GENERATION_INPUT_AUDIT_SCHEMA_ID,
    schemaVersion: IES_GENERATION_INPUT_AUDIT_SCHEMA_VERSION,
    attemptFingerprint: identity.attemptFingerprint,
    state: accepted ? "accepted_read_only" : "blocked_fail_closed",
    accepted,
    generationInputId: identity.generationInputId,
    replayKey: identity.replayKey,
    deterministic: true,
    traceabilityInspected: false,
    artifactRequestValidated: accepted,
    selectionRequestValidated: accepted,
    referenceBound: false,
    sealedReferenceLoaded: false,
    generatorInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
  if (!exactKeys(output, GENERATION_AUDIT_KEYS)) throw new Error("internal generation audit shape mismatch");
  return output;
}

function blockedOutput(blocker) {
  const safeBlocker = typeof blocker === "string" && BLOCKER_PATTERN.test(blocker)
    ? blocker
    : "ies-generation-input-blocked";
  const identity = deterministicIdentity(null, null, safeBlocker);
  return deepFreeze({
    schemaId: IES_GENERATION_INPUT_SCHEMA_ID,
    schemaVersion: IES_GENERATION_INPUT_SCHEMA_VERSION,
    state: IES_GENERATION_INPUT_STATES.blockedFailClosed,
    generationInputId: null,
    replayKey: null,
    sourceRequest: null,
    artifactIntent: null,
    engineContract: null,
    selection: null,
    run: null,
    technicalProvenance: null,
    thermal: null,
    blockers: [safeBlocker],
    warnings: [],
    audit: generationAudit(identity, false),
    safetyFlags: generationSafety(),
  });
}

export function buildRuntimeIesGenerationInputContractV1(input = {}) {
  if (!validInputKeys(input)) return blockedOutput("ies-generation-input-invalid-shape");
  if (
    Object.prototype.hasOwnProperty.call(input, "traceabilityEnvelope")
    && !isPlainObject(input.traceabilityEnvelope)
  ) return blockedOutput("traceability-envelope-plain-object-required");

  const selection = validateSelectionRequest(input.selectionRequest);
  if (!selection.ok) return blockedOutput(selection.blocker);
  const artifact = validateArtifactRequest(input.artifactRequest, selection.value.requestFingerprint);
  if (!artifact.ok) return blockedOutput(artifact.blocker);
  if (selection.value.selection.optic !== artifact.value.selectedResult.technicalProvenance.selectedOpticKey) {
    return blockedOutput("selection-optic-technical-provenance-mismatch");
  }
  if (selection.value.selection.roomAmbientTaC !== artifact.value.selectedResult.thermal.selectedRoomTaC) {
    return blockedOutput("selection-room-ambient-thermal-mismatch");
  }

  const identity = deterministicIdentity(artifact.value, selection.value);
  if (!GENERATION_ID_PATTERN.test(identity.generationInputId) || !GENERATION_REPLAY_PATTERN.test(identity.replayKey)) {
    return blockedOutput("ies-generation-input-identity-invalid");
  }
  const output = {
    schemaId: IES_GENERATION_INPUT_SCHEMA_ID,
    schemaVersion: IES_GENERATION_INPUT_SCHEMA_VERSION,
    state: IES_GENERATION_INPUT_STATES.readyReadOnly,
    generationInputId: identity.generationInputId,
    replayKey: identity.replayKey,
    sourceRequest: sourceRequestProjection(artifact.value),
    artifactIntent: clonePlain(artifact.value.artifactIntent),
    engineContract: clonePlain(artifact.value.engineContract),
    selection: clonePlain(selection.value.selection),
    run: clonePlain(selection.value.run),
    technicalProvenance: clonePlain(artifact.value.selectedResult.technicalProvenance),
    thermal: clonePlain(artifact.value.selectedResult.thermal),
    blockers: [],
    warnings: [...artifact.value.warnings],
    audit: generationAudit(identity, true),
    safetyFlags: generationSafety({
      artifactRequestConsumed: true,
      selectionRequestConsumed: true,
    }),
  };
  if (!exactKeys(output.selection, NORMALIZED_SELECTION_KEYS)) {
    return blockedOutput("ies-generation-input-selection-shape-internal");
  }
  if (!exactKeys(output.run, NORMALIZED_RUN_KEYS)) {
    return blockedOutput("ies-generation-input-run-shape-internal");
  }
  return deepFreeze(output);
}
