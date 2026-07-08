import {
  buildRunTableFirstNarrowRows,
  RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET,
  RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROWS_STATES,
} from "./runTableFirstNarrowRows.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTABLE_FIRST_NARROW_ROWS_SLOT_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowRows";
export const RUNTABLE_FIRST_NARROW_ROWS_SLOT_STATE = "redacted_runtable_first_narrow_rows_slot_persisted";

const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;

const RAW_OR_EXACT_KEYS = Object.freeze([
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawRun",
  "rawSourceRows",
  "rawProductRows",
  "rawBoardRows",
  "rawDriverRows",
  "rawAccessoryRows",
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
  "base64",
  "base64Artifacts",
  "pdf",
  "privatePath",
  "localPath",
  "filePath",
  "filename",
  "fileName",
  "credentials",
  "secrets",
  "targetPath",
  "writeTarget",
  "runtimeDataTarget",
  "boardDataTarget",
  "donorDataTarget",
  "routeTarget",
  "postEndpointTarget",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyPlainObject(value) {
  return isPlainObject(value) && Object.keys(value).length > 0;
}

function safeToken(value, fallback = "blocked", maxLength = 240) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_VALUE_PATTERN.test(raw)) return fallback;
  return raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength) || fallback;
}

function disabledFalseFlags() {
  return Object.fromEntries(RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));
}

function hasSafeRowsShape(value) {
  return isPlainObject(value)
    && value.schemaId === RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID
    && Number(value.schemaVersion) === RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION
    && value.state === RUNTABLE_FIRST_NARROW_ROWS_STATES.ready
    && value.runTableFirstNarrowRowsReady === true
    && value.failClosed === false
    && value.rowsIncluded === true
    && Number(value.rowCount) === 1
    && value.safeRowsReturned === true
    && value.firstNarrowRowsReturned === true
    && value.safeSummaryOnly === true
    && value.redacted === true
    && value.machineValueSafe === true
    && Array.isArray(value.rows)
    && value.rows.length === 1
    && isPlainObject(value.rows[0]);
}

export function findUnsafeRunTableFirstNarrowRowsSlotInput(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") return PRIVATE_VALUE_PATTERN.test(value) ? "private-path-or-filename-not-approved" : null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 120)) {
      const nested = findUnsafeRunTableFirstNarrowRowsSlotInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  if (hasSafeRowsShape(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_OR_EXACT_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return `blocked-raw-field-${safeToken(key, "raw-field")}`;
    }
    if (RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS.includes(key) && nested === true) {
      return `blocked-true-flag-${safeToken(key, "flag")}`;
    }
    const child = findUnsafeRunTableFirstNarrowRowsSlotInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

export function validateRunTableFirstNarrowRowsSlotSummary(summary) {
  if (!hasSafeRowsShape(summary)) {
    return { valid: false, reason: "runtable-first-narrow-rows-not-ready" };
  }

  for (const key of RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return { valid: false, reason: `required-false-summary-flag-not-false-${safeToken(key, "flag")}` };
    if (isPlainObject(summary.safetyFlags) && summary.safetyFlags[key] !== false) {
      return { valid: false, reason: `required-false-safety-flag-not-false-${safeToken(key, "flag")}` };
    }
  }

  const row = summary.rows[0];
  const rowKeys = Object.keys(row);
  if (rowKeys.join("|") !== RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET.join("|")) {
    return { valid: false, reason: "first-row-field-set-drifted" };
  }
  for (const key of RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET) {
    if (!Object.prototype.hasOwnProperty.call(row, key)) return { valid: false, reason: `required-row-field-missing-${safeToken(key, "row-field")}` };
  }
  if (row.accepted !== true || row.engineVerified !== true || row.safeSummaryOnly !== true || row.redacted !== true || row.machineValueSafe !== true) {
    return { valid: false, reason: "first-row-is-not-safe-redacted-engine-verified" };
  }
  if (row.rawRunReturned !== false || row.rawRunTableRowsReturned !== false || row.rawSourceRowsReturned !== false || row.rawValuesReturned !== false) {
    return { valid: false, reason: "first-row-raw-values-returned" };
  }

  const unsafe = findUnsafeRunTableFirstNarrowRowsSlotInput({ safeRows: summary });
  if (unsafe) return { valid: false, reason: unsafe };

  return { valid: true, reason: "runTable first narrow rows slot summary is safe" };
}

function createSlotSummary(sourceRows) {
  const row = clonePlain(sourceRows.rows[0]);
  const falseFlags = disabledFalseFlags();
  const fingerprint = stableFingerprint("safe-runtable-first-narrow-rows-slot-summary", {
    schemaId: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
    state: RUNTABLE_FIRST_NARROW_ROWS_STATES.ready,
    target: RUNTABLE_FIRST_NARROW_ROWS_SLOT_TARGET,
    row,
    rowCount: 1,
    requiredFalseFlags: RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS,
  });

  return Object.freeze({
    schemaId: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
    rowSchemaId: sourceRows.rowSchemaId,
    rowSchemaVersion: sourceRows.rowSchemaVersion,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    targetLocation: RUNTABLE_FIRST_NARROW_ROWS_SLOT_TARGET,
    slotState: RUNTABLE_FIRST_NARROW_ROWS_SLOT_STATE,
    slotPersisted: true,
    state: RUNTABLE_FIRST_NARROW_ROWS_STATES.ready,
    runTableFirstNarrowRowsReady: true,
    failClosed: false,
    sourceKind: sourceRows.sourceKind || "safe-selected-result-source-object-summary",
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
    safetyFlags: {
      readOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      redacted: true,
      machineValueSafe: true,
      ...falseFlags,
    },
    rows: [row],
    runTableFirstNarrowRowsSlotSummaryFingerprint: fingerprint,
    ...falseFlags,
  });
}

export function buildRunTableFirstNarrowRowsSlotSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const explicitRows = isNonEmptyPlainObject(source.runTableFirstNarrowRows)
    ? source.runTableFirstNarrowRows
    : isNonEmptyPlainObject(source.runTableFirstNarrowRowsCandidate)
      ? source.runTableFirstNarrowRowsCandidate
      : null;
  const unsafeInput = findUnsafeRunTableFirstNarrowRowsSlotInput({
    runTableFirstNarrowRowsCandidate: explicitRows,
    runTableFirstNarrowRowShapeContract: source.runTableFirstNarrowRowShapeContract,
    runTableFirstNarrowOutputSummary: source.runTableFirstNarrowOutputSummary,
    safeSelectedResultSourceObject: source.safeSelectedResultSourceObject,
  });
  if (unsafeInput) throw new Error(`RunTable first narrow rows slot summary rejected: ${unsafeInput}`);

  const sourceRows = explicitRows || buildRunTableFirstNarrowRows({
    runTableFirstNarrowRowShapeContract: source.runTableFirstNarrowRowShapeContract,
    runTableFirstNarrowOutputSummary: source.runTableFirstNarrowOutputSummary,
    safeSelectedResultSourceObject: source.safeSelectedResultSourceObject,
  });
  const validation = validateRunTableFirstNarrowRowsSlotSummary(sourceRows);
  if (!validation.valid) {
    throw new Error(`RunTable first narrow rows slot summary rejected: ${validation.reason}`);
  }

  const summary = createSlotSummary(sourceRows);
  const summaryValidation = validateRunTableFirstNarrowRowsSlotSummary(summary);
  if (!summaryValidation.valid) {
    throw new Error(`RunTable first narrow rows slot summary rejected: ${summaryValidation.reason}`);
  }
  return summary;
}

export const buildRuntimeRunTableFirstNarrowRowsSlotSummary = buildRunTableFirstNarrowRowsSlotSummary;
