import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
} from "./selectedResultPersistenceBoundaryContract.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET,
} from "./selectedResultPersistedSummarySlotContract.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID =
  "controlstack.runtime.selected-result-persisted-summary-readback-status.v1";
export const SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES = Object.freeze({
  ready: "selected_result_persisted_summary_readback_ready",
  missing: "selected_result_persisted_summary_readback_missing",
  blockedFailClosed: "selected_result_persisted_summary_readback_blocked_fail_closed",
});

const READY_SUMMARY_STATE = "redacted_selected_result_summary_persisted";
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,700}$|^[0-9a-f]{32,128}$/i;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;

const RAW_OR_PRIVATE_KEYS = Object.freeze([
  "body",
  "resultBody",
  "selectedResultBody",
  "selected_result_body",
  "selectedResultObject",
  "selected_result_object",
  "selectedResultPayload",
  "rawSelectedPayload",
  "selectedPayload",
  "enginePayload",
  "rawEnginePayload",
  "raw_engine_payload",
  "engineResult",
  "rawEngineResult",
  "raw_engine_result",
  "selectorPayload",
  "rawSelectorPayload",
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawProductRows",
  "rawBoardRows",
  "rawDriverRows",
  "rawAccessoryRows",
  "sourceRows",
  "rawSourceRows",
  "ies",
  "iesText",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "candela",
  "candelaGrid",
  "rawCandelaGrid",
  "base64",
  "base64Artifacts",
  "artifactBase64",
  "credentials",
  "secrets",
  "filename",
  "fileName",
  "privatePath",
  "localPath",
  "downstreamContext",
  "moduleState",
  "envelopeBody",
  "projectEnvelope",
]);

const UNSAFE_TRUE_KEYS = Object.freeze([
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "selectedResultPersistenceImplementationAllowed",
  "selectedResultPersistenceWriteHookAdded",
  "selectedResultStorageEnabled",
  "saveLoadActive",
  "projectWriteEnabled",
  "projectWritesEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "runtimeDataMutationAuthority",
  "boardDataMutationEnabled",
  "boardDataMutated",
  "donorMutationEnabled",
  "donorEngineInvoked",
  "donorEngineInvocationEnabled",
  "donorEnginePayloadAssemblyEnabled",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "runTableGenerated",
  "productionRunTableGenerated",
  "productionRunTableGenerationEnabled",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "outputGenerationEnabled",
  "drawingGenerationEnabled",
  "photometryGenerationEnabled",
  "routesAdded",
  "publicRoutesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawEngineResultReturned",
  "rawEngineResultExposed",
  "rawSelectorPayloadReturned",
  "rawSelectorPayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawRowsReturned",
  "rawRowsExposed",
  "rawIesContentReturned",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "exactElectricalValuesExposed",
  "privatePathsReturned",
  "privatePathsExposed",
  "filenamesReturned",
  "filenamesExposed",
  "credentialsReturned",
  "credentialsExposed",
]);

const SAFE_STATE_FIELDS = Object.freeze([
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "selectedResultAuthorityGuardState",
  "selectedResultProjectionState",
  "safeSelectedResultSourceState",
  "selectedResultHandoffScaffoldState",
]);

const SAFE_FINGERPRINT_FIELDS = Object.freeze([
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "acceptedSelectedResultAuthorityGateFingerprint",
  "selectedResultPersistenceAuthorityPreflightFingerprint",
  "selectedResultPersistenceBoundaryContractFingerprint",
  "selectedResultOutputReadinessPreflightFingerprint",
  "selectedResultAuthorityGuardFingerprint",
  "selectedResultProjectionFingerprint",
  "safeSelectedResultSourceObjectFingerprint",
  "selectedResultHandoffScaffoldFingerprint",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function safeToken(value, fallback = "", maxLength = 220) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_VALUE_PATTERN.test(raw)) return fallback;
  const token = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return token || fallback;
}

function safeText(value, fallback = "", maxLength = 420) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_VALUE_PATTERN.test(raw)) return fallback;
  const text = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return text || fallback;
}

function safeFingerprint(value) {
  const token = safeToken(value, "", 760);
  if (!token) return null;
  return SAFE_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function selectedResultSummaryFromEnvelope(envelope) {
  return isPlainObject(envelope?.modules?.cs_selector?.downstreamContext?.selectedResultSummary)
    ? envelope.modules.cs_selector.downstreamContext.selectedResultSummary
    : null;
}

function findUnsafeReadbackInput(value, depth = 0, seen = new Set()) {
  if (depth > 8) return null;
  if (typeof value === "string") {
    return PRIVATE_VALUE_PATTERN.test(value) ? "private-path-or-filename-not-approved" : null;
  }
  if (Array.isArray(value)) {
    return value.length > 0 ? "array-body-not-approved" : null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_OR_PRIVATE_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) {
      return `blocked-raw-field-${safeToken(key, "unsafe")}`;
    }
    if (UNSAFE_TRUE_KEYS.includes(key) && nested === true) {
      return `unsafe-true-flag-${safeToken(key, "flag")}`;
    }
    const child = findUnsafeReadbackInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function buildSafeProjection(summary) {
  const projection = {
    summaryPresent: isPlainObject(summary),
    summarySchemaId: isPlainObject(summary) ? safeToken(summary.schemaId, null) : null,
    summarySchemaVersion: isPlainObject(summary) && !isBlank(summary.schemaVersion) ? Number(summary.schemaVersion) : null,
    summaryState: isPlainObject(summary) ? safeToken(summary.state, null) : null,
  };

  if (isPlainObject(summary)) {
    for (const key of SAFE_STATE_FIELDS) projection[key] = safeToken(summary[key], null);
    for (const key of SAFE_FINGERPRINT_FIELDS) projection[key] = safeFingerprint(summary[key]);
  } else {
    for (const key of SAFE_STATE_FIELDS) projection[key] = null;
    for (const key of SAFE_FINGERPRINT_FIELDS) projection[key] = null;
  }

  return projection;
}

function result(state, reason, { blocker = null, summary = null } = {}) {
  const projection = buildSafeProjection(summary);
  const readbackReady = state === SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready;
  const readiness = readbackReady ? "ready"
    : state === SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing ? "missing"
      : "blocked_fail_closed";
  const base = {
    schemaId: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
    state,
    readiness,
    ready: readbackReady,
    failClosed: !readbackReady,
    blocker: blocker ? safeToken(blocker, "selected-result-persisted-summary-readback-blocked") : null,
    reason: safeText(reason, state),
    owner: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.owner,
    slotOwner: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.slotOwner,
    envelopeOwner: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.envelopeOwner,
    moduleId: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.moduleId,
    targetLocation: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetLocation,
    ...projection,
  };

  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    base[key] = false;
  }

  base.selectedResultPersistedSummaryReadbackFingerprint = stableFingerprint(
    "safe-selected-result-persisted-summary-readback-status",
    base,
  );
  return Object.freeze(base);
}

function validateSummary(summary) {
  const allowed = new Set(SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET);
  for (const key of Object.keys(summary)) {
    if (!allowed.has(key)) {
      return RAW_OR_PRIVATE_KEYS.includes(key) ? "summary-field-not-allow-listed-raw-field" : `summary-field-not-allow-listed-${safeToken(key, "field")}`;
    }
  }

  const unsafe = findUnsafeReadbackInput(summary);
  if (unsafe) return unsafe;

  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS) {
    if (isBlank(summary[key])) return `required-summary-field-missing-${safeToken(key, "field")}`;
  }

  if (summary.schemaId !== PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID
    || Number(summary.schemaVersion) !== PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION) {
    return "persisted-summary-schema-mismatch";
  }

  if (summary.owner !== "shell" || summary.slotOwner !== "shell" || summary.moduleId !== "cs_selector") {
    return "persisted-summary-owner-slot-or-module-mismatch";
  }

  if (summary.summaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) {
    return "persisted-summary-redaction-markers-not-ready";
  }

  if (summary.state !== READY_SUMMARY_STATE) {
    return "persisted-summary-state-not-ready";
  }

  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return `required-false-summary-flag-not-false-${safeToken(key, "flag")}`;
  }

  for (const key of [
    "policyFingerprint",
    "sourceFingerprint",
    "sourceInputFingerprint",
    "sourceVersionFingerprint",
    "selectedResultPersistenceAuthorityPreflightFingerprint",
    "selectedResultPersistenceBoundaryContractFingerprint",
  ]) {
    if (!safeFingerprint(summary[key])) return `safe-fingerprint-missing-${safeToken(key, "fingerprint")}`;
  }

  return null;
}

export function buildSelectedResultPersistedSummaryReadbackStatus(envelope = {}) {
  if (!isPlainObject(envelope) || Object.keys(envelope).length === 0) {
    return result(
      SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing,
      "selected-result persisted summary readback is missing because no project envelope was found",
      { blocker: "selected-result-persisted-summary-envelope-missing" },
    );
  }

  if (!isPlainObject(envelope.modules?.cs_selector)) {
    return result(
      SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing,
      "selected-result persisted summary readback is missing because the cs_selector envelope module slot is absent",
      { blocker: "selected-result-persisted-summary-module-missing" },
    );
  }

  const summary = selectedResultSummaryFromEnvelope(envelope);
  if (!isPlainObject(summary)) {
    return result(
      SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing,
      "selected-result persisted summary readback is missing because the selectedResultSummary slot is empty",
      { blocker: "selected-result-persisted-summary-slot-empty" },
    );
  }

  const blocker = validateSummary(summary);
  if (blocker) {
    return result(
      SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed,
      "selected-result persisted summary readback blocked fail-closed before surfacing an unsafe or malformed summary slot",
      { blocker, summary },
    );
  }

  return result(
    SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready,
    "selected-result persisted summary readback is ready from the shell-owned redacted selectedResultSummary envelope slot only",
    { summary },
  );
}

export const buildRuntimeSelectedResultPersistedSummaryReadbackStatus = buildSelectedResultPersistedSummaryReadbackStatus;
