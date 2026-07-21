// ControlStack Lab — read-only compatibility projection for public Engine output v1.
// Pure, deterministic, browser-safe, non-authoritative, and intentionally import-free.

export const ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_ID =
  "controlstack.lab.engine-output-compatibility.v1";
export const ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_VERSION = 1;

export const ENGINE_OUTPUT_V1_COMPATIBILITY_STATES = Object.freeze({
  compatibleComplete: "compatible_complete",
  compatibleBlocked: "compatible_blocked",
  blockedFailClosed: "blocked_fail_closed",
});

export const PUBLIC_ENGINE_OUTPUT_SCHEMA_ID = "controlstack.engine.output.v1";
export const PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION = 1;
export const PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID = "controlstack.engine.runtable-row.v1";
export const PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_VERSION = 1;

export const PUBLIC_ENGINE_RUNTABLE_ROW_FIELD_SET = Object.freeze([
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

const PUBLIC_ENGINE_STATES = Object.freeze({
  complete: "complete",
  blockedFailClosed: "blocked_fail_closed",
});

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

const TECHNICAL_PROVENANCE_KEYS = Object.freeze([
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

const COMPATIBILITY_OUTPUT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "engineOutputSchemaId",
  "engineOutputSchemaVersion",
  "engineState",
  "resultId",
  "requestFingerprint",
  "sourceVersionFingerprint",
  "policyFingerprint",
  "evidenceFingerprints",
  "selectedResult",
  "runTable",
  "blockers",
  "warnings",
  "safetyFlags",
]);

const FINGERPRINT_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{7,255}$/;
const SHA1_FINGERPRINT_PATTERN = /^[a-z0-9_.-]+:[0-9a-f]{40}$/;
const BLOCKER_PATTERN = /^[a-z][a-z0-9_-]{0,127}$/;
const TEMPERATURE_MODES = Object.freeze(new Set(["clamped-low", "clamped-high", "interpolated"]));
const CURRENT_MODES = Object.freeze(new Set(["clamped-low", "clamped-high", "exact", "interpolated"]));
const PRIVATE_TEXT_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|password|credential|secret|bearer\s+|api[_-]?key)/i;

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
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((entry) => clonePlain(entry));
  const output = {};
  for (const [key, child] of Object.entries(value)) output[key] = clonePlain(child);
  return output;
}

function boundedText(value, maximum = 256) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > maximum
    || /[\u0000-\u001f\u007f]/.test(value)
    || PRIVATE_TEXT_PATTERN.test(value)
  ) return null;
  return value;
}

function fingerprint(value) {
  return typeof value === "string"
    && FINGERPRINT_PATTERN.test(value)
    && !PRIVATE_TEXT_PATTERN.test(value)
    ? value
    : null;
}

function sha1Fingerprint(value, prefix) {
  return typeof value === "string"
    && value.startsWith(`${prefix}:`)
    && SHA1_FINGERPRINT_PATTERN.test(value)
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

function canonicalBlocker(value) {
  return typeof value === "string" && BLOCKER_PATTERN.test(value)
    ? value
    : "engine_output_compatibility_blocked";
}

function canonicalStringArray(value, { minimum = 0, maximum = 64, blockerCodes = false } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
  const output = [];
  for (const entry of value) {
    if (blockerCodes) {
      if (typeof entry !== "string" || !BLOCKER_PATTERN.test(entry)) return null;
      output.push(entry);
      continue;
    }
    const text = boundedText(entry, 512);
    if (!text) return null;
    output.push(text);
  }
  return output;
}

function fingerprintArray(value, { minimum = 0, maximum = 8 } = {}) {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) return null;
  const output = [];
  const seen = new Set();
  for (const entry of value) {
    const token = sha1Fingerprint(entry, "engine-evidence-v1");
    if (!token || seen.has(token)) return null;
    seen.add(token);
    output.push(token);
  }
  return output;
}

function scanPrivateText(value, seen = new Set()) {
  if (typeof value === "string") return PRIVATE_TEXT_PATTERN.test(value);
  if (!value || typeof value !== "object") return false;
  if (seen.has(value)) return true;
  seen.add(value);
  const children = Array.isArray(value) ? value : Object.values(value);
  for (const child of children) {
    if (scanPrivateText(child, seen)) return true;
  }
  seen.delete(value);
  return false;
}

function compatibilitySafetyFlags(projected) {
  return {
    readOnly: true,
    nonPersistent: true,
    compatibilityOnly: true,
    publicJsonOnly: true,
    governanceEnvelopeIgnored: true,
    projectionBuilt: projected,
    engineOutputMutated: false,
    iesGenerated: false,
    authorityAllocated: false,
    authorityApproved: false,
    evidenceAccepted: false,
    referenceMutated: false,
    routeAdded: false,
    persistenceUsed: false,
    networkUsed: false,
    downstreamActivated: false,
    rawPayloadReturned: false,
    privatePathsReturned: false,
    governanceDataReturned: false,
  };
}

function blockedProjection(blocker, input = null) {
  const schemaId = isPlainObject(input) && boundedText(input.schemaId, 128)
    ? input.schemaId
    : null;
  const schemaVersion = isPlainObject(input) && nonNegativeInteger(input.schemaVersion) !== null
    ? input.schemaVersion
    : null;
  return deepFreeze({
    schemaId: ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_ID,
    schemaVersion: ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_VERSION,
    state: ENGINE_OUTPUT_V1_COMPATIBILITY_STATES.blockedFailClosed,
    engineOutputSchemaId: schemaId,
    engineOutputSchemaVersion: schemaVersion,
    engineState: null,
    resultId: null,
    requestFingerprint: null,
    sourceVersionFingerprint: null,
    policyFingerprint: null,
    evidenceFingerprints: [],
    selectedResult: null,
    runTable: null,
    blockers: [canonicalBlocker(blocker)],
    warnings: [],
    safetyFlags: compatibilitySafetyFlags(false),
  });
}

function validateEngineSafetyFlags(value, contractRowsBuilt) {
  if (!exactKeys(value, ENGINE_SAFETY_KEYS)) return false;
  if (
    value.readOnly !== true
    || value.nonPersistent !== true
    || value.governanceEnvelopeIgnored !== true
    || value.contractRowsBuilt !== contractRowsBuilt
  ) return false;
  for (const key of ENGINE_SAFETY_KEYS.filter((key) => ![
    "readOnly",
    "nonPersistent",
    "governanceEnvelopeIgnored",
    "contractRowsBuilt",
  ].includes(key))) {
    if (value[key] !== false) return false;
  }
  return true;
}

function validateThermalSafetyFlags(value) {
  return exactKeys(value, THERMAL_SAFETY_KEYS)
    && THERMAL_SAFETY_KEYS.every((key) => value[key] === false);
}

function validateTechnicalProvenance(value) {
  if (!exactKeys(value, TECHNICAL_PROVENANCE_KEYS)) return null;
  const output = {};
  for (const key of TECHNICAL_PROVENANCE_KEYS) {
    const text = boundedText(value[key], 256);
    if (!text) return null;
    output[key] = text;
  }
  return output;
}

function validateThermal(value, provenance, sourceVersionMarker) {
  if (!exactKeys(value, THERMAL_KEYS)) return { ok: false, blocker: "thermal_invalid_shape" };
  if (
    value.schemaId !== "controlstack.runtime.thermal-lumen-execution.v1"
    || value.schemaVersion !== 1
  ) return { ok: false, blocker: "thermal_schema_unsupported" };
  if (
    value.readOnly !== true
    || value.curveChecksumVerified !== true
    || value.opticRiseAppliedCount !== 1
    || !validateThermalSafetyFlags(value.safetyFlags)
  ) return { ok: false, blocker: "thermal_not_read_only" };

  const textKeys = [
    "selectedOpticKey",
    "opticBomId",
    "sourceRevision",
    "evidenceRef",
    "programValidationState",
    "temperatureMode",
    "currentMode",
    "curveFilename",
  ];
  const output = {};
  for (const key of textKeys) {
    const text = boundedText(value[key], key === "curveFilename" ? 180 : 256);
    if (!text) return { ok: false, blocker: "thermal_text_invalid" };
    if (key === "curveFilename" && /[\\/]/.test(text)) {
      return { ok: false, blocker: "thermal_private_path_rejected" };
    }
    output[key] = text;
  }

  for (const key of [
    "selectedRoomTaC",
    "referenceRoomTaC",
    "referenceInternalTaC",
    "opticThermalRiseTaC",
    "derivedInternalTaC",
    "curveLookupTaC",
    "effectiveCurveTaC",
    "requestedCurrentMa",
    "verifiedLmPerM",
  ]) {
    const numeric = finiteNumber(value[key]);
    if (numeric === null) return { ok: false, blocker: "thermal_number_invalid" };
    output[key] = numeric;
  }

  if (output.requestedCurrentMa < 0 || output.verifiedLmPerM < 0) {
    return { ok: false, blocker: "thermal_non_negative_value_required" };
  }
  if (output.curveLookupTaC !== output.derivedInternalTaC) {
    return { ok: false, blocker: "thermal_lookup_identity_mismatch" };
  }
  if (
    output.selectedOpticKey !== provenance.selectedOpticKey
    || output.opticBomId !== provenance.opticBomId
    || output.evidenceRef !== provenance.evidenceRef
    || output.programValidationState !== provenance.programValidationState
    || output.sourceRevision !== sourceVersionMarker
  ) return { ok: false, blocker: "thermal_provenance_mismatch" };

  return { ok: true, value: clonePlain(value) };
}

function validateSelectedResult(value, identity) {
  if (!exactKeys(value, SELECTED_RESULT_KEYS)) {
    return { ok: false, blocker: "selected_result_invalid_shape" };
  }
  if (
    value.accepted !== true
    || value.engineVerified !== true
    || value.readOnly !== true
    || value.resultId !== identity.resultId
    || !sha1Fingerprint(value.resultId, "engine-output-v1")
  ) return { ok: false, blocker: "selected_result_not_accepted" };

  const selectedProfile = boundedText(value.selectedProfile, 128);
  const sourceKind = boundedText(value.sourceKind, 180);
  const sourceInputFingerprint = fingerprint(value.sourceInputFingerprint);
  const sourceVersionMarker = boundedText(value.sourceVersionMarker, 256);
  const internalComponentResultId = sha1Fingerprint(
    value.internalComponentResultId,
    "engine-selected-result-v1",
  );
  const runCount = nonNegativeInteger(value.runCount);
  if (
    !selectedProfile
    || !sourceKind
    || !sourceInputFingerprint
    || !sourceVersionMarker
    || !internalComponentResultId
    || runCount === null
    || runCount < 1
  ) return { ok: false, blocker: "selected_result_identity_invalid" };

  const technicalProvenance = validateTechnicalProvenance(value.technicalProvenance);
  if (!technicalProvenance) return { ok: false, blocker: "selected_result_provenance_invalid" };
  if (technicalProvenance.selectedTierOrProfile !== selectedProfile) {
    return { ok: false, blocker: "selected_result_profile_mismatch" };
  }
  const thermal = validateThermal(value.thermal, technicalProvenance, sourceVersionMarker);
  if (!thermal.ok) return thermal;

  return {
    ok: true,
    value: {
      resultId: value.resultId,
      accepted: true,
      engineVerified: true,
      selectedProfile,
      sourceKind,
      sourceInputFingerprint,
      sourceVersionMarker,
      internalComponentResultId,
      technicalProvenance,
      thermal: thermal.value,
      runCount,
      readOnly: true,
    },
  };
}

function validateRow(value, index, identity) {
  if (!exactKeys(value, PUBLIC_ENGINE_RUNTABLE_ROW_FIELD_SET)) {
    return { ok: false, blocker: "runtable_row_invalid_shape" };
  }
  if (value.schemaId === "controlstack.runtime.runtable-first-narrow-row.v1") {
    return { ok: false, blocker: "legacy_runtable_row_schema_rejected" };
  }
  if (
    value.schemaId !== PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.schemaVersion !== PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
  ) return { ok: false, blocker: "runtable_row_schema_unsupported" };
  if (
    !sha1Fingerprint(value.rowKey, "engine-runtable-row-v1")
    || !boundedText(value.runKey, 180)
    || nonNegativeInteger(value.runIndex) === null
    || value.rowOrdinal !== index + 1
    || value.rowKind !== "run_summary"
    || value.state !== PUBLIC_ENGINE_STATES.complete
    || value.accepted !== true
    || value.engineVerified !== true
    || typeof value.hasBodyRequested !== "boolean"
    || value.readOnly !== true
    || value.rawPayloadReturned !== false
  ) return { ok: false, blocker: "runtable_row_not_accepted" };

  for (const key of [
    "boardCount",
    "segmentCount",
    "zoneCount",
    "clipPointsCount",
    "suspensionPointsCount",
    "gearTrayPlanCount",
    "reservedRangesCount",
  ]) {
    if (nonNegativeInteger(value[key]) === null) {
      return { ok: false, blocker: "runtable_row_count_invalid" };
    }
  }

  if (
    value.requestFingerprint !== identity.requestFingerprint
    || value.sourceVersionFingerprint !== identity.sourceVersionFingerprint
    || value.policyFingerprint !== identity.policyFingerprint
    || value.resultId !== identity.resultId
  ) return { ok: false, blocker: "runtable_row_identity_mismatch" };

  return { ok: true, value: clonePlain(value) };
}

function validateRunTable(value, identity, selectedRunCount) {
  if (!exactKeys(value, RUN_TABLE_KEYS)) return { ok: false, blocker: "runtable_invalid_shape" };
  if (
    value.rowSchemaId !== PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID
    || value.rowSchemaVersion !== PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_VERSION
    || value.nonPersistent !== true
    || value.readOnly !== true
  ) return { ok: false, blocker: "runtable_schema_unsupported" };
  const rowCount = nonNegativeInteger(value.rowCount);
  if (
    rowCount === null
    || rowCount < 1
    || rowCount !== selectedRunCount
    || !Array.isArray(value.rows)
    || value.rows.length !== rowCount
  ) return { ok: false, blocker: "runtable_count_mismatch" };

  const rows = [];
  for (let index = 0; index < value.rows.length; index += 1) {
    const row = validateRow(value.rows[index], index, identity);
    if (!row.ok) return row;
    rows.push(row.value);
  }
  if (
    new Set(rows.map((row) => row.rowKey)).size !== rows.length
    || new Set(rows.map((row) => row.runKey)).size !== rows.length
  ) return { ok: false, blocker: "runtable_duplicate_identity" };

  return {
    ok: true,
    value: {
      rowSchemaId: PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_ID,
      rowSchemaVersion: PUBLIC_ENGINE_RUNTABLE_ROW_SCHEMA_VERSION,
      rowCount,
      rows,
      nonPersistent: true,
      readOnly: true,
    },
  };
}

function validateReplay(value, identity, evidenceFingerprints) {
  if (!exactKeys(value, REPLAY_KEYS)) return false;
  return value.requestFingerprint === identity.requestFingerprint
    && value.sourceVersionFingerprint === identity.sourceVersionFingerprint
    && value.policyFingerprint === identity.policyFingerprint
    && Array.isArray(value.evidenceFingerprints)
    && value.evidenceFingerprints.length === evidenceFingerprints.length
    && value.evidenceFingerprints.every((entry, index) => entry === evidenceFingerprints[index])
    && value.outputSchemaId === PUBLIC_ENGINE_OUTPUT_SCHEMA_ID
    && value.outputSchemaVersion === PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION;
}

function validateCompleteOutput(value) {
  const identity = {
    resultId: sha1Fingerprint(value.resultId, "engine-output-v1"),
    requestFingerprint: sha1Fingerprint(value.requestFingerprint, "engine-selection-set-v1"),
    sourceVersionFingerprint: sha1Fingerprint(
      value.sourceVersionFingerprint,
      "engine-source-version-v1",
    ),
    policyFingerprint: fingerprint(value.policyFingerprint),
  };
  if (Object.values(identity).some((entry) => !entry)) {
    return { ok: false, blocker: "engine_output_identity_invalid" };
  }
  const evidenceFingerprints = fingerprintArray(value.evidenceFingerprints, { minimum: 1, maximum: 1 });
  if (!evidenceFingerprints) return { ok: false, blocker: "engine_output_evidence_invalid" };
  const blockers = canonicalStringArray(value.blockers, { blockerCodes: true });
  const warnings = canonicalStringArray(value.warnings);
  if (!blockers || blockers.length !== 0 || !warnings) {
    return { ok: false, blocker: "engine_output_status_arrays_invalid" };
  }
  if (!validateEngineSafetyFlags(value.safetyFlags, true)) {
    return { ok: false, blocker: "engine_output_safety_invalid" };
  }
  const selectedResult = validateSelectedResult(value.selectedResult, identity);
  if (!selectedResult.ok) return selectedResult;
  const runTable = validateRunTable(value.runTable, identity, selectedResult.value.runCount);
  if (!runTable.ok) return runTable;
  if (!validateReplay(value.replay, identity, evidenceFingerprints)) {
    return { ok: false, blocker: "engine_output_replay_mismatch" };
  }

  return {
    ok: true,
    value: {
      identity,
      evidenceFingerprints,
      selectedResult: selectedResult.value,
      runTable: runTable.value,
      blockers,
      warnings,
    },
  };
}

function validateBlockedOutput(value) {
  if (
    value.resultId !== null
    || value.sourceVersionFingerprint !== null
    || value.selectedResult !== null
    || value.runTable !== null
  ) return { ok: false, blocker: "blocked_output_contains_result" };

  const requestFingerprint = value.requestFingerprint === null
    ? null
    : sha1Fingerprint(value.requestFingerprint, "engine-selection-set-v1");
  const policyFingerprint = value.policyFingerprint === null
    ? null
    : fingerprint(value.policyFingerprint);
  if (
    (value.requestFingerprint !== null && !requestFingerprint)
    || (value.policyFingerprint !== null && !policyFingerprint)
  ) return { ok: false, blocker: "blocked_output_identity_invalid" };

  const evidenceFingerprints = fingerprintArray(value.evidenceFingerprints);
  const blockers = canonicalStringArray(value.blockers, { minimum: 1, blockerCodes: true });
  const warnings = canonicalStringArray(value.warnings);
  if (!evidenceFingerprints || evidenceFingerprints.length !== 0 || !blockers || !warnings) {
    return { ok: false, blocker: "blocked_output_status_arrays_invalid" };
  }
  if (!validateEngineSafetyFlags(value.safetyFlags, false)) {
    return { ok: false, blocker: "blocked_output_safety_invalid" };
  }
  const identity = {
    requestFingerprint,
    sourceVersionFingerprint: null,
    policyFingerprint,
  };
  if (!validateReplay(value.replay, identity, evidenceFingerprints)) {
    return { ok: false, blocker: "blocked_output_replay_mismatch" };
  }

  return {
    ok: true,
    value: {
      requestFingerprint,
      policyFingerprint,
      blockers,
      warnings,
    },
  };
}

export function adaptEngineOutputV1Compatibility(engineOutput) {
  if (!isPlainObject(engineOutput)) return blockedProjection("engine_output_plain_object_required");
  if (scanPrivateText(engineOutput)) return blockedProjection("private_text_rejected", engineOutput);
  if (!exactKeys(engineOutput, ENGINE_OUTPUT_KEYS)) {
    return blockedProjection("engine_output_invalid_shape", engineOutput);
  }
  if (
    engineOutput.schemaId !== PUBLIC_ENGINE_OUTPUT_SCHEMA_ID
    || engineOutput.schemaVersion !== PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION
  ) return blockedProjection("engine_output_schema_unsupported", engineOutput);

  if (engineOutput.state === PUBLIC_ENGINE_STATES.complete) {
    const validated = validateCompleteOutput(engineOutput);
    if (!validated.ok) return blockedProjection(validated.blocker, engineOutput);
    return deepFreeze({
      schemaId: ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_ID,
      schemaVersion: ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_VERSION,
      state: ENGINE_OUTPUT_V1_COMPATIBILITY_STATES.compatibleComplete,
      engineOutputSchemaId: PUBLIC_ENGINE_OUTPUT_SCHEMA_ID,
      engineOutputSchemaVersion: PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION,
      engineState: PUBLIC_ENGINE_STATES.complete,
      resultId: validated.value.identity.resultId,
      requestFingerprint: validated.value.identity.requestFingerprint,
      sourceVersionFingerprint: validated.value.identity.sourceVersionFingerprint,
      policyFingerprint: validated.value.identity.policyFingerprint,
      evidenceFingerprints: [...validated.value.evidenceFingerprints],
      selectedResult: clonePlain(validated.value.selectedResult),
      runTable: clonePlain(validated.value.runTable),
      blockers: [],
      warnings: [...validated.value.warnings],
      safetyFlags: compatibilitySafetyFlags(true),
    });
  }

  if (engineOutput.state === PUBLIC_ENGINE_STATES.blockedFailClosed) {
    const validated = validateBlockedOutput(engineOutput);
    if (!validated.ok) return blockedProjection(validated.blocker, engineOutput);
    return deepFreeze({
      schemaId: ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_ID,
      schemaVersion: ENGINE_OUTPUT_V1_COMPATIBILITY_SCHEMA_VERSION,
      state: ENGINE_OUTPUT_V1_COMPATIBILITY_STATES.compatibleBlocked,
      engineOutputSchemaId: PUBLIC_ENGINE_OUTPUT_SCHEMA_ID,
      engineOutputSchemaVersion: PUBLIC_ENGINE_OUTPUT_SCHEMA_VERSION,
      engineState: PUBLIC_ENGINE_STATES.blockedFailClosed,
      resultId: null,
      requestFingerprint: validated.value.requestFingerprint,
      sourceVersionFingerprint: null,
      policyFingerprint: validated.value.policyFingerprint,
      evidenceFingerprints: [],
      selectedResult: null,
      runTable: null,
      blockers: [...validated.value.blockers],
      warnings: [...validated.value.warnings],
      safetyFlags: compatibilitySafetyFlags(true),
    });
  }

  return blockedProjection("engine_output_state_unsupported", engineOutput);
}

export function engineOutputV1CompatibilityFieldSet() {
  return [...COMPATIBILITY_OUTPUT_KEYS];
}
