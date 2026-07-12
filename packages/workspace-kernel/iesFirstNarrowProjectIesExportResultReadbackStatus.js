import {
  findUnsafeIesFirstNarrowProjectIesExportResultSummaryInput,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_TARGET,
} from "./iesFirstNarrowProjectIesExportResultSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "./iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowProjectIesExportBoundarySummary.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID =
  "controlstack.runtime.ies-first-narrow-project-ies-export-result-readback-status.v1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION = 1;

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES = Object.freeze({
  ready: "ies_first_narrow_project_ies_export_result_readback_ready",
  missing: "ies_first_narrow_project_ies_export_result_readback_missing",
  blockedFailClosed: "ies_first_narrow_project_ies_export_result_readback_blocked_fail_closed",
});

const READY_SUMMARY_STATE = "redacted_ies_first_narrow_project_ies_export_result_summary_persisted";
const READY_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-result-summary:[0-9a-f]{40}$/;
const RESULT_READBACK_FINGERPRINT_PREFIX = "safe-ies-first-narrow-project-ies-export-result-readback-status";
const OPAQUE_BUNDLE_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary:[0-9a-f]{40}$/;
const OPAQUE_PROJECT_IES_EXPORT_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary:[0-9a-f]{40}$/;
const BOUNDARY_READBACK_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-readback-status:[0-9a-f]{40}$/;
const BOUNDARY_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-summary:[0-9a-f]{40}$/;
const BUNDLE_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary-summary:[0-9a-f]{40}$/;
const BUILDER_REDUCTION_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-builder-output-reduction:[0-9a-f]{40}$/;
const JOB_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-job:[0-9a-f]{40}$/;
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT\s*=|\bLM-63\b)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s"']*base64|\bbase64\s*[,=:]/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json|zip)(?:$|[\s?#])/i;

const RAW_OR_PRIVATE_KEYS = Object.freeze([
  "projectIes",
  "projectIES",
  "projectIesBody",
  "projectIESBody",
  "projectIesText",
  "projectIESText",
  "rawProjectIes",
  "rawProjectIES",
  "rawProjectIesText",
  "rawProjectIESText",
  "ies",
  "iesText",
  "rawIes",
  "rawIES",
  "rawIesText",
  "rawIESText",
  "rawIesContent",
  "candela",
  "candelaGrid",
  "candelaArray",
  "candelaArrays",
  "rawCandela",
  "rawCandelaGrid",
  "photometry",
  "rawPhotometry",
  "rawPhotometryPayload",
  "governance",
  "rawGovernance",
  "governancePayload",
  "rawGovernancePayload",
  "referenceIes",
  "rawReferenceIes",
  "selectedResultBody",
  "selectedResultPayload",
  "rawSelectedPayload",
  "resultBody",
  "resultPayload",
  "rawResult",
  "outputFiles",
  "files",
  "filePath",
  "localPath",
  "privatePath",
  "targetPath",
  "writeTarget",
  "filename",
  "fileName",
  "base64",
  "base64Artifacts",
  "projectEnvelope",
  "downstreamContext",
  "moduleState",
  "envelopeBody",
]);

const SAFE_BOOLEAN_FIELDS = Object.freeze([
  "summaryOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "redacted",
  "machineValueSafe",
  "readOnly",
  "deterministicOnly",
  "resultSummaryOnly",
  "exportBoundaryReadbackOnly",
  "productionProof",
  "labProofAuthority",
  "projectIesExportBoundaryReadbackReady",
  "projectIesExportResultSummaryReady",
  "sourceBacked",
  "sourceAnchorOnly",
  "opaqueReferenceOnly",
]);

const SAFE_TOKEN_FIELDS = Object.freeze([
  "sourceKind",
  "futureOutputKind",
  "opaqueBundleBoundaryRef",
  "opaqueProjectIesExportBoundaryRef",
  "builderOutputKind",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "jobKind",
  "jobFingerprint",
  "builderOutputReductionFingerprint",
  "candidateOutputBundleBoundarySummaryFingerprint",
  "projectIesExportBoundaryReadbackStatusSchemaId",
  "projectIesExportBoundaryReadbackState",
  "projectIesExportBoundaryReadiness",
  "projectIesExportBoundaryReadbackFingerprint",
  "projectIesExportBoundaryContractId",
  "projectIesExportBoundarySummarySchemaId",
  "projectIesExportBoundarySummaryState",
  "projectIesExportBoundarySummaryFingerprint",
]);

const SAFE_INTEGER_FIELDS = Object.freeze([
  "runLengthMm",
  "builderOutputRecordCount",
  "builderOutputEntryCount",
  "builderOutputSafeScalarCount",
  "builderOutputRedactedPayloadMarkerCount",
  "projectIesExportBoundaryReadbackStatusSchemaVersion",
  "projectIesExportBoundarySummarySchemaVersion",
]);

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "reason",
  "owner",
  "slotOwner",
  "envelopeOwner",
  "targetKind",
  "moduleId",
  "consumerModuleId",
  "targetLocation",
  "summaryPresent",
  "summarySchemaId",
  "summarySchemaVersion",
  "summaryContractId",
  "summaryState",
  "summaryFingerprint",
  ...SAFE_BOOLEAN_FIELDS,
  ...SAFE_TOKEN_FIELDS,
  ...SAFE_INTEGER_FIELDS,
  ...RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  "iesFirstNarrowProjectIesExportResultReadbackFingerprint",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeToken(value, fallback = null, maxLength = 760) {
  if (typeof value !== "string") return fallback;
  const raw = value.trim();
  if (!raw
    || PRIVATE_VALUE_PATTERN.test(raw)
    || RAW_IES_TEXT_PATTERN.test(raw)
    || DATA_BASE64_PATTERN.test(raw)
    || FILE_EXTENSION_VALUE_PATTERN.test(raw)) {
    return fallback;
  }
  const token = raw.slice(0, maxLength);
  return SAFE_TOKEN_PATTERN.test(token) ? token : fallback;
}

function safeText(value, fallback = "", maxLength = 420) {
  if (typeof value !== "string") return fallback;
  const raw = value.trim();
  if (!raw
    || PRIVATE_VALUE_PATTERN.test(raw)
    || RAW_IES_TEXT_PATTERN.test(raw)
    || DATA_BASE64_PATTERN.test(raw)
    || FILE_EXTENSION_VALUE_PATTERN.test(raw)) {
    return fallback;
  }
  return raw.slice(0, maxLength).replace(/[^0-9A-Za-z _.,:;()'/-]/g, "") || fallback;
}

function safeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function positiveInteger(value) {
  const number = safeInteger(value);
  return number !== null && number > 0 ? number : null;
}

function summaryFromEnvelope(envelope) {
  return envelope?.modules?.cs_selector?.downstreamContext?.iesFirstNarrowProjectIesExportResultSummary;
}

function findUnsafeReadbackInput(value, depth = 0, seen = new Set()) {
  if (depth > 12) return "result-readback-depth-limit-exceeded";
  if (typeof value === "string") return safeToken(value, null) === null ? "unsafe-string" : null;
  if (Array.isArray(value)) return "array-body-not-approved";
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_OR_PRIVATE_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return `blocked-raw-field-${safeText(key, "unsafe")}`;
    }
    const child = findUnsafeReadbackInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function buildSafeProjection(summary) {
  const projection = {
    summaryPresent: isPlainObject(summary),
    summarySchemaId: isPlainObject(summary) ? safeToken(summary.schemaId) : null,
    summarySchemaVersion: isPlainObject(summary) ? safeInteger(summary.schemaVersion) : null,
    summaryContractId: isPlainObject(summary) ? safeToken(summary.contractId) : null,
    summaryState: isPlainObject(summary) ? safeToken(summary.state) : null,
    summaryFingerprint: isPlainObject(summary)
      && typeof summary.iesFirstNarrowProjectIesExportResultSummaryFingerprint === "string"
      && READY_SUMMARY_FINGERPRINT_PATTERN.test(summary.iesFirstNarrowProjectIesExportResultSummaryFingerprint)
      ? summary.iesFirstNarrowProjectIesExportResultSummaryFingerprint
      : null,
  };

  for (const key of SAFE_BOOLEAN_FIELDS) projection[key] = isPlainObject(summary) ? summary[key] === true : false;
  for (const key of SAFE_TOKEN_FIELDS) projection[key] = isPlainObject(summary) ? safeToken(summary[key]) : null;
  for (const key of SAFE_INTEGER_FIELDS) projection[key] = isPlainObject(summary) ? safeInteger(summary[key]) : null;
  return projection;
}

function orderedReadbackStatus(fields) {
  return Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function result(state, reason, { blocker = null, summary = null } = {}) {
  const ready = state === RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.ready;
  const readiness = ready ? "ready"
    : state === RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing ? "missing"
      : "blocked_fail_closed";
  const base = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
    state,
    readiness,
    ready,
    failClosed: !ready,
    blocker: blocker ? safeText(blocker, "project-ies-export-result-readback-blocked") : null,
    reason: safeText(reason, state),
    owner: "shell",
    slotOwner: "shell",
    envelopeOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_TARGET,
    ...buildSafeProjection(summary),
  };

  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS) {
    base[key] = false;
  }

  base.iesFirstNarrowProjectIesExportResultReadbackFingerprint = stableFingerprint(
    RESULT_READBACK_FINGERPRINT_PREFIX,
    base,
  );
  return Object.freeze(orderedReadbackStatus(base));
}

function validateSummary(summary) {
  const allowed = new Set(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER);
  for (const key of Object.keys(summary)) {
    if (!allowed.has(key)) {
      return RAW_OR_PRIVATE_KEYS.includes(key)
        ? "summary-field-not-allow-listed-raw-field"
        : `summary-field-not-allow-listed-${safeText(key, "field")}`;
    }
  }

  const unsafe = findUnsafeReadbackInput(summary)
    || findUnsafeIesFirstNarrowProjectIesExportResultSummaryInput(summary);
  if (unsafe) return unsafe;

  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(summary, key)) return `required-summary-field-missing-${safeText(key, "field")}`;
  }
  if (Object.keys(summary).join("|") !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER.join("|")) {
    return "summary-field-order-drifted";
  }

  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID
    || summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION
    || summary.contractId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID) {
    return "persisted-summary-schema-or-contract-mismatch";
  }
  if (summary.owner !== "shell"
    || summary.slotOwner !== "shell"
    || summary.targetKind !== "project-envelope-module-downstream-context-summary-slot"
    || summary.moduleId !== "cs_selector"
    || summary.consumerModuleId !== "ies_builder") {
    return "persisted-summary-owner-slot-target-or-module-mismatch";
  }
  if (summary.state !== READY_SUMMARY_STATE || summary.blocker !== null) return "persisted-summary-state-not-ready";
  if (summary.sourceKind !== "safe-project-ies-export-boundary-readback-status"
    || summary.futureOutputKind !== "ies-first-narrow-project-ies-export-result-summary") {
    return "persisted-summary-source-or-output-kind-mismatch";
  }

  for (const key of [
    "summaryOnly",
    "diagnosticOnly",
    "safeSummaryOnly",
    "redacted",
    "machineValueSafe",
    "readOnly",
    "deterministicOnly",
    "resultSummaryOnly",
    "exportBoundaryReadbackOnly",
    "projectIesExportBoundaryReadbackReady",
    "projectIesExportResultSummaryReady",
    "sourceBacked",
    "sourceAnchorOnly",
    "opaqueReferenceOnly",
  ]) {
    if (summary[key] !== true) return `required-ready-summary-flag-not-true-${safeText(key, "flag")}`;
  }
  if (summary.productionProof !== false || summary.labProofAuthority !== false) {
    return "persisted-summary-attempted-proof-authority";
  }

  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return `required-false-summary-flag-not-false-${safeText(key, "flag")}`;
  }

  if (!OPAQUE_BUNDLE_BOUNDARY_REF_PATTERN.test(String(summary.opaqueBundleBoundaryRef || ""))) return "opaque-bundle-boundary-ref-invalid";
  if (!OPAQUE_PROJECT_IES_EXPORT_BOUNDARY_REF_PATTERN.test(String(summary.opaqueProjectIesExportBoundaryRef || ""))) return "opaque-project-ies-export-boundary-ref-invalid";
  if (!BOUNDARY_READBACK_FINGERPRINT_PATTERN.test(String(summary.projectIesExportBoundaryReadbackFingerprint || ""))) return "project-ies-export-boundary-readback-fingerprint-invalid";
  if (!BOUNDARY_SUMMARY_FINGERPRINT_PATTERN.test(String(summary.projectIesExportBoundarySummaryFingerprint || ""))) return "project-ies-export-boundary-summary-fingerprint-invalid";
  if (!BUNDLE_SUMMARY_FINGERPRINT_PATTERN.test(String(summary.candidateOutputBundleBoundarySummaryFingerprint || ""))) return "bundle-boundary-summary-fingerprint-invalid";
  if (!BUILDER_REDUCTION_FINGERPRINT_PATTERN.test(String(summary.builderOutputReductionFingerprint || ""))) return "builder-output-reduction-fingerprint-invalid";
  if (!JOB_FINGERPRINT_PATTERN.test(String(summary.jobFingerprint || ""))) return "project-ies-export-boundary-job-fingerprint-invalid";
  if (!READY_SUMMARY_FINGERPRINT_PATTERN.test(String(summary.iesFirstNarrowProjectIesExportResultSummaryFingerprint || ""))) return "persisted-summary-fingerprint-invalid";

  if (summary.projectIesExportBoundaryReadbackStatusSchemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID
    || summary.projectIesExportBoundaryReadbackStatusSchemaVersion !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION
    || summary.projectIesExportBoundaryReadbackState !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready
    || summary.projectIesExportBoundaryReadiness !== "ready") {
    return "persisted-summary-boundary-readback-identity-mismatch";
  }
  if (summary.projectIesExportBoundaryContractId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID
    || summary.projectIesExportBoundarySummarySchemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID
    || summary.projectIesExportBoundarySummarySchemaVersion !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION
    || summary.projectIesExportBoundarySummaryState !== "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready") {
    return "persisted-summary-boundary-summary-identity-mismatch";
  }

  for (const key of [
    "builderOutputKind",
    "policyFingerprint",
    "sourceFingerprint",
    "sourceInputFingerprint",
    "boardDataSourceVersion",
    "jobKind",
  ]) {
    if (!safeToken(summary[key])) return `required-safe-summary-token-missing-${safeText(key, "field")}`;
  }

  for (const key of [
    "runLengthMm",
    "builderOutputRecordCount",
    "builderOutputEntryCount",
    "builderOutputSafeScalarCount",
    "builderOutputRedactedPayloadMarkerCount",
  ]) {
    if (positiveInteger(summary[key]) === null) return `required-positive-summary-count-missing-${safeText(key, "field")}`;
  }

  const withoutFingerprint = Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER
      .filter((key) => key !== "iesFirstNarrowProjectIesExportResultSummaryFingerprint")
      .map((key) => [key, summary[key]]),
  );
  const expectedFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-result-summary",
    withoutFingerprint,
  );
  if (summary.iesFirstNarrowProjectIesExportResultSummaryFingerprint !== expectedFingerprint) {
    return "persisted-summary-fingerprint-mismatch";
  }

  return null;
}

export function buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus(envelope = {}) {
  if (!isPlainObject(envelope) || Object.keys(envelope).length === 0) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing,
      "project IES export result readback is missing because no project envelope was found",
      { blocker: "project-ies-export-result-envelope-missing" },
    );
  }

  if (!isPlainObject(envelope.modules?.cs_selector)) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing,
      "project IES export result readback is missing because the cs_selector envelope module slot is absent",
      { blocker: "project-ies-export-result-module-missing" },
    );
  }

  const summary = summaryFromEnvelope(envelope);
  if (summary === null || summary === undefined) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing,
      "project IES export result readback is missing because the persisted result summary slot is empty",
      { blocker: "project-ies-export-result-summary-slot-empty" },
    );
  }
  if (!isPlainObject(summary)) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.blockedFailClosed,
      "project IES export result readback blocked fail-closed because the persisted result summary slot is not a plain object",
      {
        blocker: Array.isArray(summary)
          ? "project-ies-export-result-summary-slot-array-not-approved"
          : "project-ies-export-result-summary-slot-not-plain-object",
      },
    );
  }

  const blocker = validateSummary(summary);
  if (blocker) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.blockedFailClosed,
      "project IES export result readback blocked fail-closed before surfacing an unsafe or malformed persisted result summary slot",
      { blocker, summary },
    );
  }

  return result(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.ready,
    "project IES export result readback is ready from the shell-owned redacted project envelope result summary slot only",
    { summary },
  );
}

export const buildIesFirstNarrowProjectIesExportResultReadbackStatus =
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus;
