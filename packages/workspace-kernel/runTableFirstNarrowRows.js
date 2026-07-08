import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "./runTableFirstNarrowOutputHandoffContract.js";
import {
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES,
} from "./runTableFirstNarrowRowShapeContract.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID = "controlstack.runtime.runtable-first-narrow-rows.v1";
export const RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION = 1;

export const RUNTABLE_FIRST_NARROW_ROWS_STATES = Object.freeze({
  ready: "runtable_first_narrow_rows_ready",
  blockedFailClosed: "runtable_first_narrow_rows_blocked_fail_closed",
});

export const RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET = Object.freeze([
  "rowSchemaId",
  "rowSchemaVersion",
  "rowKey",
  "runKey",
  "runIndex",
  "rowOrdinal",
  "rowKind",
  "sourceKind",
  "accepted",
  "engineVerified",
  "safeSummaryOnly",
  "redacted",
  "machineValueSafe",
  "hasBodyRequested",
  "boardCount",
  "segmentCount",
  "zoneCount",
  "clipPointsCount",
  "suspensionPointsCount",
  "gearTrayPlanCount",
  "reservedRangesCount",
  "rawRunReturned",
  "rawRunTableRowsReturned",
  "rawSourceRowsReturned",
  "rawValuesReturned",
]);

export const RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS = Object.freeze([
  ...new Set([
    ...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  ]),
]);

const FORBIDDEN_RESULT_AND_INPUT_KEYS = Object.freeze([
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawRun",
  "rawEnginePayload",
  "rawEngineResult",
  "enginePayload",
  "engineResult",
  "rawSelectedPayload",
  "selectedResultPayload",
  "selectorPayload",
  "rawSelectorPayload",
  "segments",
  "boards",
  "boardRun",
  "zonePlan",
  "mechanical",
  "suspensionPointsMm",
  "clipPointsMm",
  "gearTrayPlan",
  "driverRows",
  "accessoryRows",
  "SYSTEM_POLICY",
  "SYSTEM_COMPONENTS",
  "PRODUCTS",
  "BOARDS",
  "DRIVERS",
  "ACCESSORIES",
  "exactElectricalValues",
  "voltage",
  "current",
  "watts",
  "vf",
  "ies",
  "iesText",
  "rawIesContent",
  "photometry",
  "candela",
  "candelaGrid",
  "base64Artifacts",
  "pdf",
  "privatePath",
  "localPath",
  "filePath",
  "credentials",
  "targetPath",
  "writeTarget",
  "runtimeDataTarget",
  "boardDataTarget",
  "donorDataTarget",
  "routeTarget",
  "postEndpointTarget",
]);

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeText(value, fallback = "", maxLength = 420) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function safeToken(value, fallback = "", maxLength = 220) {
  const text = safeText(value, fallback, maxLength);
  if (!text) return fallback;
  return text
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength) || fallback;
}

function hasOwn(source, key) {
  return isPlainObject(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (hasOwn(source, key) && source[key] !== null && source[key] !== undefined && String(source[key]).trim() !== "") return source[key];
  }
  return undefined;
}

function nonNegativeInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.trunc(number);
}

function scanForbidden(value, depth = 0, seen = new Set()) {
  if (depth > 9) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "private-path" : null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 120)) {
      const nested = scanForbidden(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_RESULT_AND_INPUT_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) {
      return `blocked-raw-field-${safeToken(key, "raw-field")}`;
    }
    if (RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS.includes(key) && nested === true) {
      return `blocked-true-flag-${safeToken(key, "flag")}`;
    }
    const child = scanForbidden(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function disabledFalseFlags() {
  return Object.fromEntries(RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));
}

function safetyFlags() {
  return {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    ...disabledFalseFlags(),
  };
}

function blockedResult(blocker) {
  const safeBlocker = safeToken(blocker, "blocked");
  return Object.freeze({
    schemaId: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    state: RUNTABLE_FIRST_NARROW_ROWS_STATES.blockedFailClosed,
    runTableFirstNarrowRowsReady: false,
    failClosed: true,
    blocker: safeBlocker,
    sourceKind: "safe-selected-result-source-object-summary",
    rowShapeContractReady: false,
    outputHandoffSummaryPresent: false,
    rowsIncluded: false,
    rowCount: 0,
    safeRowsReturned: false,
    firstNarrowRowsReturned: false,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    safetyFlags: safetyFlags(),
    rows: [],
    ...disabledFalseFlags(),
  });
}

function validateRowShapeContract(contract) {
  if (!isPlainObject(contract)) return "row-shape-contract-missing";
  if (contract.schemaId !== RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID) return "row-shape-contract-schema-invalid";
  if (contract.schemaVersion !== RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION) return "row-shape-contract-version-invalid";
  if (contract.rowSchemaId !== RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID) return "row-schema-invalid";
  if (contract.rowSchemaVersion !== RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION) return "row-schema-version-invalid";
  if (contract.state !== RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.contractReady) return "row-shape-contract-not-ready";
  if (contract.runTableFirstNarrowRowShapeContractReady !== true) return "row-shape-contract-not-ready";
  if (contract.failClosed === true) return "row-shape-contract-fail-closed";
  return null;
}

function validateOutputSummary(summary) {
  if (!isPlainObject(summary)) return "runtable-output-handoff-summary-missing";
  if (summary.schemaId !== RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID) return "runtable-output-handoff-summary-schema-invalid";
  if (summary.schemaVersion !== RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION) return "runtable-output-handoff-summary-version-invalid";
  if (summary.state !== "redacted_runtable_first_narrow_output_summary_persisted") return "runtable-output-handoff-summary-not-persisted";
  if (summary.runTableFirstNarrowOutputHandoffContractReady !== true) return "runtable-output-handoff-summary-contract-not-ready";
  if (summary.summaryOnly !== true && summary.safeSummaryOnly !== true) return "runtable-output-handoff-summary-not-summary-only";
  if (summary.redacted !== true) return "runtable-output-handoff-summary-not-redacted";
  if (summary.machineValueSafe !== true) return "runtable-output-handoff-summary-not-machine-value-safe";
  if (summary.rowsIncluded !== false || summary.rowCount !== 0) return "runtable-output-handoff-summary-rows-present";
  return null;
}

function redactionFlagsAreClosed(source) {
  if (!isPlainObject(source.redactionFlags)) return false;
  return Object.values(source.redactionFlags).every((value) => value === false);
}

function validateSafeSource(source) {
  if (!isPlainObject(source)) return "safe-selected-result-source-object-missing";
  if (!Array.isArray(source.runs)) return "safe-selected-result-source-runs-missing";
  if (!isPlainObject(source.runs[0])) return "safe-selected-result-source-first-run-missing";
  const firstRun = source.runs[0];
  if (firstRun.accepted !== true) return "first-run-not-accepted";
  if (firstRun.engineVerified !== true) return "first-run-not-engine-verified";
  if (firstRun.safeSummaryOnly !== true && source.safeSummaryOnly !== true && source.diagnosticOnly !== true) return "first-run-not-safe-summary-only";
  if (firstRun.redacted !== true && source.redacted !== true && !redactionFlagsAreClosed(source)) return "first-run-not-redacted";
  if (firstRun.machineValueSafe !== true && source.machineValueSafe !== true && source.sourceKind !== "host_local_real_engine_safe_summary") return "first-run-not-machine-value-safe";
  if (firstRun.rawRunReturned === true || firstRun.rawRunTableRowsReturned === true || firstRun.rawSourceRowsReturned === true || firstRun.rawValuesReturned === true) return "first-run-raw-values-returned";
  return null;
}

function buildFirstRow(firstRun, source) {
  const runIndex = nonNegativeInteger(firstPresent(firstRun, ["runIndex", "index"]) ?? 0);
  const runKey = safeToken(firstPresent(firstRun, ["runKey", "key", "id", "runId"]), `run-${runIndex}`);
  const rowKey = safeToken(
    firstPresent(firstRun, ["rowKey"]),
    stableFingerprint("safe-runtable-first-narrow-row", {
      sourceKind: "safe-selected-result-source-object-summary",
      runKey,
      runIndex,
      sourceFingerprint: firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]),
    }),
  );

  return Object.freeze({
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    rowKey,
    runKey,
    runIndex,
    rowOrdinal: 1,
    rowKind: "first_accepted_safe_run_summary",
    sourceKind: "safe-selected-result-source-object-summary",
    accepted: true,
    engineVerified: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    hasBodyRequested: firstRun.hasBodyRequested === true,
    boardCount: nonNegativeInteger(firstPresent(firstRun, ["boardCount", "boardsCount", "boardSummaryCount"]) ?? firstRun.counts?.boardCount),
    segmentCount: nonNegativeInteger(firstPresent(firstRun, ["segmentCount", "segmentsCount", "segmentSummaryCount"]) ?? firstRun.counts?.segmentCount),
    zoneCount: nonNegativeInteger(firstPresent(firstRun, ["zoneCount", "zonesCount", "zoneSummaryCount"]) ?? firstRun.counts?.zoneCount),
    clipPointsCount: nonNegativeInteger(firstPresent(firstRun, ["clipPointsCount", "clipPointCount"]) ?? firstRun.counts?.clipPointsCount),
    suspensionPointsCount: nonNegativeInteger(firstPresent(firstRun, ["suspensionPointsCount", "suspensionPointCount"]) ?? firstRun.counts?.suspensionPointsCount),
    gearTrayPlanCount: nonNegativeInteger(firstPresent(firstRun, ["gearTrayPlanCount", "gearTrayCount"]) ?? firstRun.counts?.gearTrayPlanCount),
    reservedRangesCount: nonNegativeInteger(firstPresent(firstRun, ["reservedRangesCount", "reservedRangeCount"]) ?? firstRun.counts?.reservedRangesCount),
    rawRunReturned: false,
    rawRunTableRowsReturned: false,
    rawSourceRowsReturned: false,
    rawValuesReturned: false,
  });
}

export function buildRunTableFirstNarrowRows(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const rowShapeContract = source.runTableFirstNarrowRowShapeContract;
  const outputSummary = source.runTableFirstNarrowOutputSummary;
  const safeSelectedResultSourceObject = source.safeSelectedResultSourceObject;

  const rawBlocker = scanForbidden({ rowShapeContract, outputSummary, safeSelectedResultSourceObject });
  if (rawBlocker) return blockedResult(rawBlocker);

  const rowShapeBlocker = validateRowShapeContract(rowShapeContract);
  if (rowShapeBlocker) return blockedResult(rowShapeBlocker);

  const outputBlocker = validateOutputSummary(outputSummary);
  if (outputBlocker) {
    const blocked = blockedResult(outputBlocker);
    return Object.freeze({ ...blocked, rowShapeContractReady: true });
  }

  const sourceBlocker = validateSafeSource(safeSelectedResultSourceObject);
  if (sourceBlocker) {
    const blocked = blockedResult(sourceBlocker);
    return Object.freeze({ ...blocked, rowShapeContractReady: true, outputHandoffSummaryPresent: true });
  }

  const firstRow = buildFirstRow(safeSelectedResultSourceObject.runs[0], safeSelectedResultSourceObject);

  return Object.freeze({
    schemaId: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    state: RUNTABLE_FIRST_NARROW_ROWS_STATES.ready,
    runTableFirstNarrowRowsReady: true,
    failClosed: false,
    sourceKind: "safe-selected-result-source-object-summary",
    rowShapeContractReady: true,
    outputHandoffSummaryPresent: true,
    rowsIncluded: true,
    rowCount: 1,
    safeRowsReturned: true,
    firstNarrowRowsReturned: true,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    safetyFlags: safetyFlags(),
    rows: [firstRow],
    ...disabledFalseFlags(),
  });
}

export const buildRuntimeRunTableFirstNarrowRows = buildRunTableFirstNarrowRows;
