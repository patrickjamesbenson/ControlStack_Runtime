import {
  SAFE_SELECTED_RESULT_SOURCE_KIND,
  SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID,
  SAFE_SELECTED_RESULT_SOURCE_SCHEMA_VERSION,
} from "./engineRunTableSafeSelectedResultSourceObject.js";
import {
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
} from "./runtimeThermalLumenExecution.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const ENGINE_SELECTED_RESULT_SCHEMA_ID =
  "controlstack.engine.selected-result.v1";
export const ENGINE_SELECTED_RESULT_SCHEMA_VERSION = 1;
export const ENGINE_SELECTED_RESULT_RUN_SCHEMA_ID =
  "controlstack.engine.selected-result.run.v1";
export const ENGINE_SELECTED_RESULT_RUN_SCHEMA_VERSION = 1;

export const ENGINE_SELECTED_RESULT_STATES = Object.freeze({
  accepted: "engine_selected_result_accepted",
  blockedFailClosed: "engine_selected_result_blocked_fail_closed",
});

const INPUT_REQUIRED_KEYS = Object.freeze([
  "safeSelectedResultSourceObject",
  "thermalExecution",
]);
const INPUT_OPTIONAL_KEYS = Object.freeze(["traceabilityEnvelope"]);

const SOURCE_KEYS = Object.freeze([
  "ok",
  "schemaId",
  "schemaVersion",
  "sourceKind",
  "readOnly",
  "nonPersistent",
  "diagnosticOnly",
  "accepted",
  "engineVerified",
  "selectedTierOrProfile",
  "resultStateLabel",
  "runCount",
  "runs",
  "boardCount",
  "segmentCount",
  "zoneCount",
  "clipPointsCount",
  "suspensionPointsCount",
  "gearTrayPlanCount",
  "controlledIntentMarkers",
  "sourceBackedDataMarkers",
  "sourceInputFingerprint",
  "sourceVersionMarker",
  "persistenceStatus",
  "downstreamReadinessFlags",
  "redactionFlags",
  "safetyFlags",
  "excludedUnsafeFieldClasses",
  "requiredFields",
  "blockers",
]);

const SOURCE_RUN_KEYS = Object.freeze([
  "runKey",
  "runIndex",
  "accepted",
  "engineVerified",
  "safeSummaryOnly",
  "hasBodyRequested",
  "boardCount",
  "segmentCount",
  "zoneCount",
  "clipPointsCount",
  "suspensionPointsCount",
  "gearTrayPlanCount",
  "reservedRangesCount",
  "rawRunReturned",
]);

const THERMAL_EXECUTION_KEYS = Object.freeze(["ok", "result", "summary"]);
const THERMAL_RESULT_KEYS = Object.freeze([
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
const THERMAL_SUMMARY_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "blocker",
  "selectedOpticKey",
  "opticBomId",
  "curveLookupTaC",
  "effectiveCurveTaC",
  "temperatureMode",
  "currentMode",
  "verifiedLmPerM",
  "opticRiseAppliedCount",
  "curveParserInvoked",
  "readOnly",
  "donorEngineInvoked",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "runTableGenerated",
  "iesGenerated",
  "outputGenerated",
  "rawCurveRowsReturned",
  "rawCurvePayloadReturned",
]);

const OUTPUT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "accepted",
  "failClosed",
  "resultId",
  "sourceIdentity",
  "technicalProvenance",
  "selectedResult",
  "runs",
  "runCount",
  "blockers",
  "warnings",
  "readOnly",
  "nonPersistent",
  "stabilityState",
  "safetyFlags",
]);

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|file:|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/])/i;
const UNSAFE_KEY_PATTERN = /(?:raw.*(?:payload|rows?|source|result|ies|pdf)|(?:private|local|file|absolute).*path|credentials?|password|secret|base64|iesText|candelaGrid)/i;
const UNSAFE_TRUE_KEY_PATTERN = /(?:persist|write|mutat|generated|generationEnabled|routeAdded|routesAdded|postEndpoint|donorEngineInvoked|raw.*(?:Returned|Exposed))/i;

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
  const keys = Object.keys(value);
  if (!INPUT_REQUIRED_KEYS.every((key) => keys.includes(key))) return false;
  const allowed = new Set([...INPUT_REQUIRED_KEYS, ...INPUT_OPTIONAL_KEYS]);
  return keys.every((key) => allowed.has(key));
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value)
    ? (Object.is(value, -0) ? 0 : value)
    : null;
}

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function boundedText(value, maximum = 256) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > maximum
    || /[\u0000-\u001f\u007f]/.test(value)
    || PRIVATE_PATH_PATTERN.test(value)
  ) return null;
  return value;
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function scanUnsafe(value, path = "input", seen = new Set()) {
  if (typeof value === "string") {
    return PRIVATE_PATH_PATTERN.test(value) ? `unsafe-private-path-${path}` : null;
  }
  if (!value || typeof value !== "object") return null;
  if (seen.has(value)) return `cyclic-input-${path}`;
  seen.add(value);
  const entries = Array.isArray(value)
    ? value.map((item, index) => [String(index), item])
    : Object.entries(value);
  for (const [key, child] of entries) {
    if (UNSAFE_KEY_PATTERN.test(key) && child !== false && child !== null && child !== undefined) {
      return `unsafe-field-${key}`;
    }
    if (UNSAFE_TRUE_KEY_PATTERN.test(key) && child === true && key !== "nonPersistent") {
      return `unsafe-true-flag-${key}`;
    }
    const nested = scanUnsafe(child, `${path}.${key}`, seen);
    if (nested) return nested;
  }
  seen.delete(value);
  return null;
}

function decimalInteger(value) {
  const numeric = finiteNumber(value);
  if (numeric === null) return null;
  const match = /^([+-]?)(\d+)(?:\.(\d*))?(?:e([+-]?\d+))?$/i.exec(String(numeric));
  if (!match) return null;
  const sign = match[1] === "-" ? -1n : 1n;
  const fraction = match[3] || "";
  const exponent = Number(match[4] || 0);
  const shift = exponent - fraction.length;
  if (!Number.isSafeInteger(shift) || Math.abs(shift) > 1000) return null;
  const digits = `${match[2]}${fraction}`.replace(/^0+(?=\d)/, "");
  const magnitude = BigInt(digits || "0");
  return shift >= 0
    ? { integer: sign * magnitude * (10n ** BigInt(shift)), scale: 0 }
    : { integer: sign * magnitude, scale: -shift };
}

function decimalSumMatches(leftValue, rightValue, expectedValue) {
  const left = decimalInteger(leftValue);
  const right = decimalInteger(rightValue);
  const expected = decimalInteger(expectedValue);
  if (!left || !right || !expected) return false;
  const scale = Math.max(left.scale, right.scale, expected.scale);
  const align = ({ integer, scale: itemScale }) => integer * (10n ** BigInt(scale - itemScale));
  return align(left) + align(right) === align(expected);
}

function safetyFlags() {
  return {
    readOnly: true,
    nonPersistent: true,
    safeSummaryOnly: true,
    donorEngineInvoked: false,
    curveParserInvoked: false,
    thermalRecalculated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
    runTablePersisted: false,
    iesGenerated: false,
    outputArtifactGenerated: false,
    publicRouteAdded: false,
    postEndpointAdded: false,
    rawPayloadReturned: false,
    rawSourceRowsReturned: false,
    privatePathsReturned: false,
  };
}

function blocked(blocker) {
  return deepFreeze(Object.fromEntries(OUTPUT_KEYS.map((key) => [key, ({
    schemaId: ENGINE_SELECTED_RESULT_SCHEMA_ID,
    schemaVersion: ENGINE_SELECTED_RESULT_SCHEMA_VERSION,
    state: ENGINE_SELECTED_RESULT_STATES.blockedFailClosed,
    accepted: false,
    failClosed: true,
    resultId: null,
    sourceIdentity: null,
    technicalProvenance: null,
    selectedResult: null,
    runs: [],
    runCount: 0,
    blockers: [boundedText(blocker, 180) || "engine-selected-result-blocked"],
    warnings: [],
    readOnly: true,
    nonPersistent: true,
    stabilityState: "producer_contract_only_not_stable",
    safetyFlags: safetyFlags(),
  })[key]])));
}

function validateSource(source) {
  if (!exactKeys(source, SOURCE_KEYS)) return { ok: false, blocker: "safe-source-invalid-shape" };
  if (
    source.schemaId !== SAFE_SELECTED_RESULT_SOURCE_SCHEMA_ID
    || source.schemaVersion !== SAFE_SELECTED_RESULT_SOURCE_SCHEMA_VERSION
    || source.sourceKind !== SAFE_SELECTED_RESULT_SOURCE_KIND
  ) return { ok: false, blocker: "safe-source-schema-unsupported" };
  if (
    source.ok !== true
    || source.accepted !== true
    || source.engineVerified !== true
    || source.readOnly !== true
    || source.nonPersistent !== true
    || source.diagnosticOnly !== true
    || !Array.isArray(source.blockers)
    || source.blockers.length !== 0
  ) return { ok: false, blocker: "safe-source-not-accepted" };
  const sourceInputFingerprint = boundedText(source.sourceInputFingerprint, 220);
  const sourceVersionMarker = boundedText(source.sourceVersionMarker, 220);
  const selectedTierOrProfile = boundedText(source.selectedTierOrProfile, 120);
  const runCount = nonNegativeInteger(source.runCount);
  if (!sourceInputFingerprint || !sourceVersionMarker || !selectedTierOrProfile || runCount === null || runCount < 1) {
    return { ok: false, blocker: "safe-source-identity-invalid" };
  }
  if (!Array.isArray(source.runs) || source.runs.length !== runCount) {
    return { ok: false, blocker: "safe-source-runs-invalid" };
  }
  const runs = [];
  for (let index = 0; index < source.runs.length; index += 1) {
    const run = source.runs[index];
    if (!exactKeys(run, SOURCE_RUN_KEYS)) return { ok: false, blocker: "safe-source-run-invalid-shape" };
    const runKey = boundedText(run.runKey, 180);
    const runIndex = nonNegativeInteger(run.runIndex);
    if (
      !runKey
      || runIndex === null
      || run.accepted !== true
      || run.engineVerified !== true
      || run.safeSummaryOnly !== true
      || run.rawRunReturned !== false
    ) return { ok: false, blocker: "safe-source-run-not-accepted" };
    const countKeys = [
      "boardCount",
      "segmentCount",
      "zoneCount",
      "clipPointsCount",
      "suspensionPointsCount",
      "gearTrayPlanCount",
      "reservedRangesCount",
    ];
    if (countKeys.some((key) => nonNegativeInteger(run[key]) === null)) {
      return { ok: false, blocker: "safe-source-run-count-invalid" };
    }
    runs.push({ ...run, runKey, runIndex });
  }
  if (
    source.persistenceStatus?.selectedResultPersisted !== false
    || source.persistenceStatus?.selectedResultPersistenceEnabled !== false
    || source.persistenceStatus?.selectedResultPersistenceAttempted !== false
  ) return { ok: false, blocker: "safe-source-persistence-state-invalid" };
  const unsafe = scanUnsafe(source);
  if (unsafe) return { ok: false, blocker: unsafe };
  return {
    ok: true,
    sourceInputFingerprint,
    sourceVersionMarker,
    selectedTierOrProfile,
    runs,
  };
}

function validateThermal(execution) {
  if (!exactKeys(execution, THERMAL_EXECUTION_KEYS)) return { ok: false, blocker: "thermal-execution-invalid-shape" };
  if (execution.ok !== true) return { ok: false, blocker: "thermal-execution-not-accepted" };
  if (!exactKeys(execution.result, THERMAL_RESULT_KEYS)) return { ok: false, blocker: "thermal-result-invalid-shape" };
  if (!exactKeys(execution.summary, THERMAL_SUMMARY_KEYS)) return { ok: false, blocker: "thermal-summary-invalid-shape" };
  const result = execution.result;
  const summary = execution.summary;
  if (
    result.schemaId !== RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID
    || result.schemaVersion !== RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION
    || summary.schemaId !== RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID
    || summary.schemaVersion !== RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION
    || summary.state !== "runtime_thermal_lumen_execution_complete"
    || summary.blocker !== null
    || result.readOnly !== true
    || result.curveChecksumVerified !== true
    || result.opticRiseAppliedCount !== 1
    || summary.opticRiseAppliedCount !== 1
    || summary.curveParserInvoked !== true
  ) return { ok: false, blocker: "thermal-result-not-accepted" };
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
  if (textKeys.some((key) => !boundedText(result[key], 256))) {
    return { ok: false, blocker: "thermal-result-identity-invalid" };
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
  if (numericKeys.some((key) => finiteNumber(result[key]) === null)) {
    return { ok: false, blocker: "thermal-result-value-invalid" };
  }
  if (
    !decimalSumMatches(result.referenceRoomTaC, result.opticThermalRiseTaC, result.referenceInternalTaC)
    || !decimalSumMatches(result.selectedRoomTaC, result.opticThermalRiseTaC, result.derivedInternalTaC)
    || result.curveLookupTaC !== result.derivedInternalTaC
    || summary.selectedOpticKey !== result.selectedOpticKey
    || summary.opticBomId !== result.opticBomId
    || summary.curveLookupTaC !== result.curveLookupTaC
    || summary.effectiveCurveTaC !== result.effectiveCurveTaC
    || summary.temperatureMode !== result.temperatureMode
    || summary.currentMode !== result.currentMode
    || summary.verifiedLmPerM !== result.verifiedLmPerM
  ) return { ok: false, blocker: "thermal-result-contradictory" };
  for (const flag of [
    summary.donorEngineInvoked,
    summary.runtimeDataMutated,
    summary.selectedResultPersisted,
    summary.runTableGenerated,
    summary.iesGenerated,
    summary.outputGenerated,
    summary.rawCurveRowsReturned,
    summary.rawCurvePayloadReturned,
  ]) {
    if (flag !== false) return { ok: false, blocker: "thermal-result-unsafe" };
  }
  const unsafe = scanUnsafe(execution);
  if (unsafe) return { ok: false, blocker: unsafe };
  return { ok: true, result: clonePlain(result) };
}

function buildRuns(sourceRuns, identity) {
  return sourceRuns.map((run, index) => deepFreeze({
    schemaId: ENGINE_SELECTED_RESULT_RUN_SCHEMA_ID,
    schemaVersion: ENGINE_SELECTED_RESULT_RUN_SCHEMA_VERSION,
    rowKey: stableFingerprint("engine-selected-result-run", {
      resultSourceFingerprint: identity.sourceInputFingerprint,
      sourceVersionMarker: identity.sourceVersionMarker,
      runKey: run.runKey,
      runIndex: run.runIndex,
    }),
    runKey: run.runKey,
    runIndex: run.runIndex,
    rowOrdinal: index + 1,
    accepted: true,
    engineVerified: true,
    safeSummaryOnly: true,
    hasBodyRequested: run.hasBodyRequested === true,
    boardCount: run.boardCount,
    segmentCount: run.segmentCount,
    zoneCount: run.zoneCount,
    clipPointsCount: run.clipPointsCount,
    suspensionPointsCount: run.suspensionPointsCount,
    gearTrayPlanCount: run.gearTrayPlanCount,
    reservedRangesCount: run.reservedRangesCount,
    rawRunReturned: false,
  }));
}

export function buildRuntimeEngineSelectedResultContractV1(input = {}) {
  if (!validInputKeys(input)) return blocked("invalid-input-shape");

  const technicalInput = {
    safeSelectedResultSourceObject: input.safeSelectedResultSourceObject,
    thermalExecution: input.thermalExecution,
  };
  const unsafe = scanUnsafe(technicalInput);
  if (unsafe) return blocked(unsafe);

  const source = validateSource(technicalInput.safeSelectedResultSourceObject);
  if (!source.ok) return blocked(source.blocker);
  const thermal = validateThermal(technicalInput.thermalExecution);
  if (!thermal.ok) return blocked(thermal.blocker);
  if (source.sourceVersionMarker !== thermal.result.sourceRevision) {
    return blocked("source-revision-mismatch");
  }

  const sourceIdentity = {
    sourceKind: SAFE_SELECTED_RESULT_SOURCE_KIND,
    sourceInputFingerprint: source.sourceInputFingerprint,
    sourceVersionMarker: source.sourceVersionMarker,
  };
  const technicalProvenance = {
    selectedOpticKey: thermal.result.selectedOpticKey,
    opticBomId: thermal.result.opticBomId,
    evidenceRef: thermal.result.evidenceRef,
    programValidationState: thermal.result.programValidationState,
    selectedTierOrProfile: source.selectedTierOrProfile,
  };
  const runs = buildRuns(source.runs, sourceIdentity);
  const selectedResult = deepFreeze(clonePlain(thermal.result));
  const resultId = stableFingerprint("engine-selected-result-v1", {
    schemaId: ENGINE_SELECTED_RESULT_SCHEMA_ID,
    schemaVersion: ENGINE_SELECTED_RESULT_SCHEMA_VERSION,
    sourceIdentity,
    technicalProvenance,
    selectedResult,
    runs,
  });

  const output = {
    schemaId: ENGINE_SELECTED_RESULT_SCHEMA_ID,
    schemaVersion: ENGINE_SELECTED_RESULT_SCHEMA_VERSION,
    state: ENGINE_SELECTED_RESULT_STATES.accepted,
    accepted: true,
    failClosed: false,
    resultId,
    sourceIdentity,
    technicalProvenance,
    selectedResult,
    runs,
    runCount: runs.length,
    blockers: [],
    warnings: [],
    readOnly: true,
    nonPersistent: true,
    stabilityState: "producer_contract_only_not_stable",
    safetyFlags: safetyFlags(),
  };
  return deepFreeze(Object.fromEntries(OUTPUT_KEYS.map((key) => [key, output[key]])));
}

export const buildEngineSelectedResultContractV1 =
  buildRuntimeEngineSelectedResultContractV1;
