import {
  ENGINE_OUTPUT_SCHEMA_ID,
  ENGINE_OUTPUT_SCHEMA_VERSION,
  ENGINE_OUTPUT_STATES,
  ENGINE_RUNTABLE_ROW_FIELD_SET,
  ENGINE_RUNTABLE_ROW_SCHEMA_ID,
  ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
} from "./runtimeEngineOutputContractV1.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const IES_ARTIFACT_INTENT_SCHEMA_ID =
  "controlstack.downstream.ies-artifact-intent.v1";
export const IES_ARTIFACT_INTENT_SCHEMA_VERSION = 1;
export const IES_ARTIFACT_KIND = "ies_lm63_reference_build";

export const IES_ARTIFACT_REQUEST_SCHEMA_ID =
  "controlstack.downstream.ies-artifact-request.v1";
export const IES_ARTIFACT_REQUEST_SCHEMA_VERSION = 1;
export const IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID =
  "controlstack.downstream.ies-artifact-request-audit.v1";
export const IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION = 1;

export const IES_ARTIFACT_REQUEST_STATES = Object.freeze({
  readyReadOnly: "ready_read_only",
  blockedFailClosed: "blocked_fail_closed",
});

const INPUT_KEYS = Object.freeze(["engineOutput", "artifactIntent"]);
const INPUT_OPTIONAL_KEYS = Object.freeze(["traceabilityEnvelope"]);
const INTENT_KEYS = Object.freeze(["schemaId", "schemaVersion", "artifactKind"]);
const ENGINE_OUTPUT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "resultId",
  "requestFingerprint",
  "sourceVersionFingerprint",
  "policyFingerprint",
  "evidenceFingerprints",
  "selectedResult",
  "runTable",
  "blockers",
  "warnings",
  "replay",
  "safetyFlags",
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
const REPLAY_KEYS = Object.freeze([
  "requestFingerprint",
  "sourceVersionFingerprint",
  "policyFingerprint",
  "evidenceFingerprints",
  "outputSchemaId",
  "outputSchemaVersion",
]);
const ENGINE_SAFETY_KEYS = Object.freeze([
  "readOnly",
  "nonPersistent",
  "governanceEnvelopeIgnored",
  "contractRowsBuilt",
  "engineInvoked",
  "donorEngineInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "productionRunTableGenerated",
  "iesGenerated",
  "downstreamActivated",
  "publicRouteAdded",
  "postEndpointAdded",
  "rawEnginePayloadReturned",
  "rawSourceRowsReturned",
  "privatePathsReturned",
  "exactPrivateElectricalValuesReturned",
]);
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

const FINGERPRINT_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{7,255}$/;
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
  const allowed = new Set([...INPUT_KEYS, ...INPUT_OPTIONAL_KEYS]);
  const keys = Object.keys(value);
  return INPUT_KEYS.every((key) => Object.prototype.hasOwnProperty.call(value, key))
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
  return typeof value === "string" && FINGERPRINT_PATTERN.test(value)
    && !PRIVATE_PATH_PATTERN.test(value)
    && !RAW_CONTENT_PATTERN.test(value)
    ? value
    : null;
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

function canonicalStrings(value, { minimum = 0, maximum = 64, blockers = false } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
  const output = [];
  const seen = new Set();
  for (const entry of value) {
    const text = boundedText(entry, 256);
    if (!text || (blockers && !BLOCKER_PATTERN.test(text)) || seen.has(text)) return null;
    seen.add(text);
    output.push(text);
  }
  return output;
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

function unsafeValue(value, depth = 0, seen = new Set()) {
  if (depth > 12) return "engine-output-depth-unsupported";
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "private-path-not-approved";
    if (RAW_CONTENT_PATTERN.test(value)) return "raw-artifact-content-not-approved";
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeValue(entry, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (/^(?:rawIes|rawIES|iesText|iesContent|photometry|candela|base64|filePath|localPath|absolutePath)$/i.test(key)) {
      if (nested !== null && nested !== false && nested !== undefined) return "raw-artifact-content-not-approved";
    }
    const blocker = unsafeValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function validateIntent(value) {
  if (!exactKeys(value, INTENT_KEYS)) return { ok: false, blocker: "ies-artifact-intent-invalid-shape" };
  if (
    value.schemaId !== IES_ARTIFACT_INTENT_SCHEMA_ID
    || value.schemaVersion !== IES_ARTIFACT_INTENT_SCHEMA_VERSION
  ) return { ok: false, blocker: "ies-artifact-intent-schema-unsupported" };
  if (value.artifactKind !== IES_ARTIFACT_KIND) {
    return { ok: false, blocker: "ies-artifact-kind-unsupported" };
  }
  return { ok: true, value: clonePlain(value) };
}

function validateEngineSafety(value, complete) {
  if (!exactKeys(value, ENGINE_SAFETY_KEYS)) return { ok: false, blocker: "engine-output-safety-invalid-shape" };
  if (
    value.readOnly !== true
    || value.nonPersistent !== true
    || value.governanceEnvelopeIgnored !== true
    || value.contractRowsBuilt !== complete
  ) return { ok: false, blocker: "engine-output-safety-not-accepted" };
  for (const key of ENGINE_SAFETY_KEYS.filter((key) => ![
    "readOnly",
    "nonPersistent",
    "governanceEnvelopeIgnored",
    "contractRowsBuilt",
  ].includes(key))) {
    if (value[key] !== false) return { ok: false, blocker: "engine-output-safety-not-accepted" };
  }
  return { ok: true };
}

function validateThermalSafety(value) {
  if (!exactKeys(value, THERMAL_SAFETY_KEYS)) return false;
  return THERMAL_SAFETY_KEYS.every((key) => value[key] === false);
}

function validateProvenance(value) {
  if (!exactKeys(value, PROVENANCE_KEYS)) return { ok: false, blocker: "engine-output-provenance-invalid-shape" };
  const output = {
    selectedOpticKey: boundedText(value.selectedOpticKey),
    opticBomId: boundedText(value.opticBomId),
    evidenceRef: boundedText(value.evidenceRef),
    programValidationState: boundedText(value.programValidationState),
    selectedTierOrProfile: boundedText(value.selectedTierOrProfile),
  };
  if (Object.values(output).some((entry) => !entry)) {
    return { ok: false, blocker: "engine-output-provenance-invalid" };
  }
  return { ok: true, value: output };
}

function validateThermal(value, provenance, sourceVersionMarker) {
  if (!exactKeys(value, THERMAL_KEYS)) return { ok: false, blocker: "engine-output-thermal-invalid-shape" };
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
  if (
    Object.entries(output).some(([key, entry]) => [
      "schemaVersion",
      "curveChecksumVerified",
      "opticRiseAppliedCount",
      "readOnly",
      "safetyFlags",
    ].includes(key) ? false : entry === null)
  ) return { ok: false, blocker: "engine-output-thermal-invalid" };
  if (!Number.isSafeInteger(output.schemaVersion) || output.schemaVersion < 1) {
    return { ok: false, blocker: "engine-output-thermal-schema-invalid" };
  }
  if (
    output.requestedCurrentMa < 0
    || output.verifiedLmPerM < 0
    || output.opticThermalRiseTaC < 0
  ) return { ok: false, blocker: "engine-output-thermal-non-negative-required" };
  if (
    output.selectedOpticKey !== provenance.selectedOpticKey
    || output.opticBomId !== provenance.opticBomId
    || output.evidenceRef !== provenance.evidenceRef
    || output.programValidationState !== provenance.programValidationState
    || output.sourceRevision !== sourceVersionMarker
  ) return { ok: false, blocker: "engine-output-thermal-provenance-mismatch" };
  if (
    exactAdd(output.referenceRoomTaC, output.opticThermalRiseTaC) !== output.referenceInternalTaC
    || exactAdd(output.selectedRoomTaC, output.opticThermalRiseTaC) !== output.derivedInternalTaC
    || output.curveLookupTaC !== output.derivedInternalTaC
  ) return { ok: false, blocker: "engine-output-thermal-identity-mismatch" };
  if (!TEMPERATURE_MODES.has(output.temperatureMode) || !CURRENT_MODES.has(output.currentMode)) {
    return { ok: false, blocker: "engine-output-thermal-mode-unsupported" };
  }
  if (
    (output.temperatureMode === "clamped-low" && output.effectiveCurveTaC !== 25)
    || (output.temperatureMode === "clamped-high" && output.effectiveCurveTaC !== 65)
    || (output.temperatureMode === "interpolated" && output.effectiveCurveTaC !== output.curveLookupTaC)
  ) return { ok: false, blocker: "engine-output-effective-temperature-mismatch" };
  if (
    output.curveChecksumVerified !== true
    || output.opticRiseAppliedCount !== 1
    || output.readOnly !== true
    || !validateThermalSafety(output.safetyFlags)
  ) return { ok: false, blocker: "engine-output-thermal-safety-not-accepted" };
  return { ok: true, value: output };
}

function validateRow(value, index, identity) {
  if (!exactKeys(value, ENGINE_RUNTABLE_ROW_FIELD_SET)) {
    return { ok: false, blocker: "engine-output-row-invalid-shape" };
  }
  if (
    value.schemaId !== ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.schemaVersion !== ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
  ) return { ok: false, blocker: "engine-output-row-schema-unsupported" };
  const textFields = ["rowKey", "runKey", "rowKind", "state"];
  if (textFields.some((key) => !boundedText(value[key]))) {
    return { ok: false, blocker: "engine-output-row-text-invalid" };
  }
  const integerFields = [
    "runIndex",
    "rowOrdinal",
    "boardCount",
    "segmentCount",
    "zoneCount",
    "clipPointsCount",
    "suspensionPointsCount",
    "gearTrayPlanCount",
    "reservedRangesCount",
  ];
  if (integerFields.some((key) => nonNegativeInteger(value[key]) === null)) {
    return { ok: false, blocker: "engine-output-row-count-invalid" };
  }
  if (
    value.rowOrdinal !== index + 1
    || value.rowKind !== "run_summary"
    || value.state !== ENGINE_OUTPUT_STATES.complete
    || value.accepted !== true
    || value.engineVerified !== true
    || typeof value.hasBodyRequested !== "boolean"
    || value.requestFingerprint !== identity.requestFingerprint
    || value.sourceVersionFingerprint !== identity.sourceVersionFingerprint
    || value.policyFingerprint !== identity.policyFingerprint
    || value.resultId !== identity.resultId
    || value.readOnly !== true
    || value.rawPayloadReturned !== false
  ) return { ok: false, blocker: "engine-output-row-identity-mismatch" };
  return { ok: true, value: clonePlain(value) };
}

function validateSelectedResult(value, identity) {
  if (!exactKeys(value, SELECTED_RESULT_KEYS)) {
    return { ok: false, blocker: "engine-output-selected-result-invalid-shape" };
  }
  const text = {
    resultId: fingerprint(value.resultId),
    selectedProfile: boundedText(value.selectedProfile),
    sourceKind: boundedText(value.sourceKind),
    sourceInputFingerprint: fingerprint(value.sourceInputFingerprint),
    sourceVersionMarker: boundedText(value.sourceVersionMarker),
    internalComponentResultId: fingerprint(value.internalComponentResultId),
  };
  if (Object.values(text).some((entry) => !entry)) {
    return { ok: false, blocker: "engine-output-selected-result-invalid" };
  }
  if (
    value.resultId !== identity.resultId
    || value.accepted !== true
    || value.engineVerified !== true
    || value.readOnly !== true
    || nonNegativeInteger(value.runCount) === null
  ) return { ok: false, blocker: "engine-output-selected-result-not-accepted" };
  const provenance = validateProvenance(value.technicalProvenance);
  if (!provenance.ok) return provenance;
  if (provenance.value.selectedTierOrProfile !== text.selectedProfile) {
    return { ok: false, blocker: "engine-output-profile-provenance-mismatch" };
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

function validateRunTable(value, identity, expectedRunCount) {
  if (!exactKeys(value, RUN_TABLE_KEYS)) return { ok: false, blocker: "engine-output-runtable-invalid-shape" };
  if (
    value.rowSchemaId !== ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.rowSchemaVersion !== ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
  ) return { ok: false, blocker: "engine-output-runtable-schema-unsupported" };
  if (
    nonNegativeInteger(value.rowCount) === null
    || !Array.isArray(value.rows)
    || value.rows.length !== value.rowCount
    || value.rowCount !== expectedRunCount
    || value.nonPersistent !== true
    || value.readOnly !== true
  ) return { ok: false, blocker: "engine-output-runtable-invalid" };
  const rows = [];
  const rowKeys = new Set();
  const runKeys = new Set();
  for (let index = 0; index < value.rows.length; index += 1) {
    const row = validateRow(value.rows[index], index, identity);
    if (!row.ok) return row;
    if (rowKeys.has(row.value.rowKey) || runKeys.has(row.value.runKey)) {
      return { ok: false, blocker: "engine-output-runtable-key-duplicate" };
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

function validateReplay(value, identity, evidenceFingerprints) {
  if (!exactKeys(value, REPLAY_KEYS)) return { ok: false, blocker: "engine-output-replay-invalid-shape" };
  const evidence = fingerprintArray(value.evidenceFingerprints, {
    minimum: evidenceFingerprints.length,
    maximum: evidenceFingerprints.length,
  });
  if (
    value.requestFingerprint !== identity.requestFingerprint
    || value.sourceVersionFingerprint !== identity.sourceVersionFingerprint
    || value.policyFingerprint !== identity.policyFingerprint
    || value.outputSchemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.outputSchemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
    || !evidence
    || JSON.stringify(evidence) !== JSON.stringify(evidenceFingerprints)
  ) return { ok: false, blocker: "engine-output-replay-identity-mismatch" };
  return { ok: true, value: clonePlain(value) };
}

function validateCompleteEngineOutput(value) {
  const unsafe = unsafeValue(value);
  if (unsafe) return { ok: false, blocker: unsafe };
  if (!exactKeys(value, ENGINE_OUTPUT_KEYS)) return { ok: false, blocker: "engine-output-invalid-shape" };
  if (
    value.schemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.schemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
  ) return { ok: false, blocker: "engine-output-schema-unsupported" };
  if (value.state !== ENGINE_OUTPUT_STATES.complete) {
    return { ok: false, blocker: "engine-output-state-not-complete" };
  }
  const identity = {
    resultId: fingerprint(value.resultId),
    requestFingerprint: fingerprint(value.requestFingerprint),
    sourceVersionFingerprint: fingerprint(value.sourceVersionFingerprint),
    policyFingerprint: fingerprint(value.policyFingerprint),
  };
  if (Object.values(identity).some((entry) => !entry)) {
    return { ok: false, blocker: "engine-output-identity-invalid" };
  }
  const evidenceFingerprints = fingerprintArray(value.evidenceFingerprints, { minimum: 1, maximum: 1 });
  if (!evidenceFingerprints) return { ok: false, blocker: "engine-output-evidence-invalid" };
  const blockers = canonicalStrings(value.blockers, { maximum: 0, blockers: true });
  const warnings = canonicalStrings(value.warnings);
  if (!blockers || !warnings) return { ok: false, blocker: "engine-output-diagnostics-invalid" };
  const safety = validateEngineSafety(value.safetyFlags, true);
  if (!safety.ok) return safety;
  const selectedResult = validateSelectedResult(value.selectedResult, identity);
  if (!selectedResult.ok) return selectedResult;
  const runTable = validateRunTable(value.runTable, identity, selectedResult.value.runCount);
  if (!runTable.ok) return runTable;
  const replay = validateReplay(value.replay, identity, evidenceFingerprints);
  if (!replay.ok) return replay;
  const expectedEvidence = stableFingerprint("engine-evidence-v1", {
    selectedOpticKey: selectedResult.value.technicalProvenance.selectedOpticKey,
    opticBomId: selectedResult.value.technicalProvenance.opticBomId,
    evidenceRef: selectedResult.value.technicalProvenance.evidenceRef,
    programValidationState: selectedResult.value.technicalProvenance.programValidationState,
  });
  if (evidenceFingerprints[0] !== expectedEvidence) {
    return { ok: false, blocker: "engine-output-evidence-provenance-mismatch" };
  }
  const expectedSourceVersionFingerprint = stableFingerprint("engine-source-version-v1", {
    sourceKind: selectedResult.value.sourceKind,
    sourceVersionMarker: selectedResult.value.sourceVersionMarker,
    selectedOpticKey: selectedResult.value.technicalProvenance.selectedOpticKey,
    opticBomId: selectedResult.value.technicalProvenance.opticBomId,
  });
  if (identity.sourceVersionFingerprint !== expectedSourceVersionFingerprint) {
    return { ok: false, blocker: "engine-output-source-version-mismatch" };
  }
  return {
    ok: true,
    complete: true,
    value: {
      complete: true,
      schemaId: value.schemaId,
      schemaVersion: value.schemaVersion,
      state: value.state,
      ...identity,
      evidenceFingerprints,
      selectedResult: selectedResult.value,
      runTable: runTable.value,
      blockers,
      warnings,
      replay: replay.value,
    },
  };
}

function validateBlockedEngineOutput(value) {
  const unsafe = unsafeValue(value);
  if (unsafe) return { ok: false, blocker: unsafe };
  if (!exactKeys(value, ENGINE_OUTPUT_KEYS)) return { ok: false, blocker: "engine-output-invalid-shape" };
  if (
    value.schemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.schemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
  ) return { ok: false, blocker: "engine-output-schema-unsupported" };
  if (value.state !== ENGINE_OUTPUT_STATES.blockedFailClosed) {
    return { ok: false, blocker: "engine-output-state-unsupported" };
  }
  if (value.resultId !== null || value.selectedResult !== null || value.runTable !== null) {
    return { ok: false, blocker: "engine-output-blocked-body-not-empty" };
  }
  const requestFingerprint = value.requestFingerprint === null ? null : fingerprint(value.requestFingerprint);
  const sourceVersionFingerprint = value.sourceVersionFingerprint === null ? null : fingerprint(value.sourceVersionFingerprint);
  const policyFingerprint = value.policyFingerprint === null ? null : fingerprint(value.policyFingerprint);
  if (
    (value.requestFingerprint !== null && !requestFingerprint)
    || (value.sourceVersionFingerprint !== null && !sourceVersionFingerprint)
    || (value.policyFingerprint !== null && !policyFingerprint)
  ) return { ok: false, blocker: "engine-output-blocked-identity-invalid" };
  const evidenceFingerprints = fingerprintArray(value.evidenceFingerprints, { minimum: 0, maximum: 0 });
  const blockers = canonicalStrings(value.blockers, { minimum: 1, blockers: true });
  const warnings = canonicalStrings(value.warnings);
  if (!evidenceFingerprints || !blockers || !warnings) {
    return { ok: false, blocker: "engine-output-blocked-diagnostics-invalid" };
  }
  const safety = validateEngineSafety(value.safetyFlags, false);
  if (!safety.ok) return safety;
  const identity = {
    resultId: null,
    requestFingerprint,
    sourceVersionFingerprint,
    policyFingerprint,
  };
  const replay = validateReplay(value.replay, identity, evidenceFingerprints);
  if (!replay.ok) return replay;
  return {
    ok: true,
    complete: false,
    value: {
      complete: false,
      schemaId: value.schemaId,
      schemaVersion: value.schemaVersion,
      state: value.state,
      ...identity,
      evidenceFingerprints,
      selectedResult: null,
      runTable: null,
      blockers,
      warnings,
      replay: replay.value,
    },
  };
}

function validateEngineOutput(value) {
  if (!isPlainObject(value)) return { ok: false, blocker: "engine-output-plain-object-required" };
  if (value.state === ENGINE_OUTPUT_STATES.complete) return validateCompleteEngineOutput(value);
  if (value.state === ENGINE_OUTPUT_STATES.blockedFailClosed) return validateBlockedEngineOutput(value);
  if (
    value.schemaId !== ENGINE_OUTPUT_SCHEMA_ID
    || value.schemaVersion !== ENGINE_OUTPUT_SCHEMA_VERSION
  ) return { ok: false, blocker: "engine-output-schema-unsupported" };
  return { ok: false, blocker: "engine-output-state-unsupported" };
}

function requestSafetyFlags() {
  return {
    readOnly: true,
    nonPersistent: true,
    traceabilityEnvelopeIgnored: true,
    engineInvoked: false,
    donorEngineInvoked: false,
    labConsumerInvoked: false,
    iesGeneratorInvoked: false,
    iesGenerated: false,
    photometryGenerated: false,
    artifactWritten: false,
    fileWritten: false,
    emailSent: false,
    downloadCreated: false,
    routeAdded: false,
    postEndpointAdded: false,
    runtimeDataMutated: false,
    authorityMutated: false,
    referenceMutated: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaReturned: false,
    privatePathsReturned: false,
    downstreamActivated: false,
  };
}

function engineContractProjection(engine) {
  return {
    outputSchemaId: engine.schemaId,
    outputSchemaVersion: engine.schemaVersion,
    outputState: engine.state,
    resultId: engine.resultId,
    requestFingerprint: engine.requestFingerprint,
    sourceVersionFingerprint: engine.sourceVersionFingerprint,
    policyFingerprint: engine.policyFingerprint,
    evidenceFingerprints: [...engine.evidenceFingerprints],
  };
}

function deterministicIdentity(intent, engine, blocker = null) {
  const payload = {
    schemaId: IES_ARTIFACT_REQUEST_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_REQUEST_SCHEMA_VERSION,
    artifactIntent: intent,
    engineContract: engineContractProjection(engine),
    blocker,
  };
  const attemptFingerprint = stableFingerprint("ies-artifact-request-attempt-v1", payload);
  if (!engine.complete) {
    return { attemptFingerprint, requestId: null, replayKey: null };
  }
  const requestId = stableFingerprint("ies-artifact-request-v1", payload);
  const replayKey = stableFingerprint("ies-artifact-replay-v1", {
    requestId,
    engineReplay: engine.replay,
  });
  return { attemptFingerprint, requestId, replayKey };
}

function auditProjection(identity, accepted) {
  const audit = {
    schemaId: IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_REQUEST_AUDIT_SCHEMA_VERSION,
    attemptFingerprint: identity.attemptFingerprint,
    state: accepted ? "accepted_read_only" : "blocked_fail_closed",
    accepted,
    requestId: identity.requestId,
    replayKey: identity.replayKey,
    deterministic: true,
    traceabilityInspected: false,
    engineInvoked: false,
    labConsumerInvoked: false,
    generatorInvoked: false,
    routeInvoked: false,
    persistenceAttempted: false,
    artifactWriteAttempted: false,
    emailAttempted: false,
  };
  if (!exactKeys(audit, AUDIT_KEYS)) throw new Error("internal audit shape mismatch");
  return audit;
}

function blockedRequest(blocker, intent = null, engine = null) {
  const safeIntent = intent ? clonePlain(intent) : null;
  const safeEngine = engine || {
    complete: false,
    schemaId: ENGINE_OUTPUT_SCHEMA_ID,
    schemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    state: ENGINE_OUTPUT_STATES.blockedFailClosed,
    resultId: null,
    requestFingerprint: null,
    sourceVersionFingerprint: null,
    policyFingerprint: null,
    evidenceFingerprints: [],
    replay: {
      requestFingerprint: null,
      sourceVersionFingerprint: null,
      policyFingerprint: null,
      evidenceFingerprints: [],
      outputSchemaId: ENGINE_OUTPUT_SCHEMA_ID,
      outputSchemaVersion: ENGINE_OUTPUT_SCHEMA_VERSION,
    },
  };
  const identity = deterministicIdentity(safeIntent, safeEngine, blocker);
  return deepFreeze({
    schemaId: IES_ARTIFACT_REQUEST_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_REQUEST_SCHEMA_VERSION,
    state: IES_ARTIFACT_REQUEST_STATES.blockedFailClosed,
    requestId: null,
    replayKey: null,
    artifactIntent: clonePlain(safeIntent),
    engineContract: engineContractProjection(safeEngine),
    selectedResult: null,
    runTable: null,
    blockers: [BLOCKER_PATTERN.test(blocker) ? blocker : "ies-artifact-request-blocked"],
    warnings: [],
    audit: auditProjection(identity, false),
    safetyFlags: requestSafetyFlags(),
  });
}

export function createIesArtifactIntentV1() {
  return deepFreeze({
    schemaId: IES_ARTIFACT_INTENT_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_INTENT_SCHEMA_VERSION,
    artifactKind: IES_ARTIFACT_KIND,
  });
}

export function validateIesArtifactIntentV1(value) {
  const result = validateIntent(value);
  return result.ok
    ? deepFreeze({ ok: true, intent: deepFreeze(result.value), blocker: null })
    : deepFreeze({ ok: false, intent: null, blocker: result.blocker });
}

export function buildRuntimeIesArtifactRequestContractV1(input = {}) {
  if (!validInputKeys(input)) return blockedRequest("ies-artifact-request-input-invalid-shape");
  if (
    Object.prototype.hasOwnProperty.call(input, "traceabilityEnvelope")
    && !isPlainObject(input.traceabilityEnvelope)
  ) return blockedRequest("traceability-envelope-plain-object-required");

  const intent = validateIntent(input.artifactIntent);
  if (!intent.ok) return blockedRequest(intent.blocker);

  const engine = validateEngineOutput(input.engineOutput);
  if (!engine.ok) return blockedRequest(engine.blocker, intent.value);
  if (!engine.complete) {
    const blocker = engine.value.blockers[0] || "engine-output-blocked";
    return blockedRequest(blocker, intent.value, engine.value);
  }

  const identity = deterministicIdentity(intent.value, engine.value);
  const output = {
    schemaId: IES_ARTIFACT_REQUEST_SCHEMA_ID,
    schemaVersion: IES_ARTIFACT_REQUEST_SCHEMA_VERSION,
    state: IES_ARTIFACT_REQUEST_STATES.readyReadOnly,
    requestId: identity.requestId,
    replayKey: identity.replayKey,
    artifactIntent: clonePlain(intent.value),
    engineContract: engineContractProjection(engine.value),
    selectedResult: clonePlain(engine.value.selectedResult),
    runTable: clonePlain(engine.value.runTable),
    blockers: [],
    warnings: [...engine.value.warnings],
    audit: auditProjection(identity, true),
    safetyFlags: requestSafetyFlags(),
  };
  if (!exactKeys(output.engineContract, ENGINE_CONTRACT_KEYS)) {
    return blockedRequest("ies-artifact-request-internal-contract-shape", intent.value, engine.value);
  }
  if (!exactKeys(output.safetyFlags, REQUEST_SAFETY_KEYS)) {
    return blockedRequest("ies-artifact-request-internal-safety-shape", intent.value, engine.value);
  }
  return deepFreeze(output);
}
