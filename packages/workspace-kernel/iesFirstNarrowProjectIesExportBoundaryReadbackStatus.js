import {
  findUnsafeIesFirstNarrowProjectIesExportBoundaryInput,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_TARGET,
} from "./iesFirstNarrowProjectIesExportBoundarySummary.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID =
  "controlstack.runtime.ies-first-narrow-project-ies-export-boundary-readback-status.v1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION = 1;

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES = Object.freeze({
  ready: "ies_first_narrow_project_ies_export_boundary_readback_ready",
  missing: "ies_first_narrow_project_ies_export_boundary_readback_missing",
  blockedFailClosed: "ies_first_narrow_project_ies_export_boundary_readback_blocked_fail_closed",
});

const READY_SUMMARY_STATE = "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready";
const READY_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-summary:[0-9a-f]{40}$/;
const OPAQUE_BUNDLE_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary:[0-9a-f]{40}$/;
const OPAQUE_PROJECT_IES_EXPORT_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary:[0-9a-f]{40}$/;
const BUNDLE_BOUNDARY_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary-summary:[0-9a-f]{40}$/;
const BUILDER_OUTPUT_REDUCTION_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-builder-output-reduction:[0-9a-f]{40}$/;
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
  "exportBoundaryOnly",
  "projectIesExportBoundaryOnly",
  "bundleBoundaryOnly",
  "builderCallBoundaryOnly",
  "productionProof",
  "labProofAuthority",
  "approvedReferenceGatePassed",
  "resolvedRunLengthGatePassed",
  "fingerprintAlignmentGatePassed",
  "builderBoundaryCallAllowed",
  "builderBoundaryCallAttempted",
  "builderBoundaryCallSucceeded",
  "builderOutputReduced",
  "approvedReferenceReady",
  "projectIesExportApproved",
  "sourceBacked",
  "sourceAnchorOnly",
  "opaqueReferenceOnly",
  "bundleBoundaryReady",
]);

const SAFE_TOKEN_FIELDS = Object.freeze([
  "sourceKind",
  "futureOutputKind",
  "opaqueBundleBoundaryRef",
  "opaqueProjectIesExportBoundaryRef",
  "approvedLabReferenceSchemaId",
  "approvedLabReferenceState",
  "approvedLabReferenceFingerprint",
  "referenceIesFingerprint",
  "oneMmLabRecordFingerprint",
  "provenanceFingerprint",
  "emergencyEvidenceFingerprint",
  "jobKind",
  "jobFingerprint",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "candidateOutputBundleBoundaryContractId",
  "candidateOutputBundleBoundarySchemaId",
  "candidateOutputBundleBoundaryState",
  "candidateOutputBundleBoundarySummaryFingerprint",
  "builderOutputKind",
  "builderOutputReductionFingerprint",
]);

const SAFE_INTEGER_FIELDS = Object.freeze([
  "approvedLabReferenceSchemaVersion",
  "runLengthMm",
  "candidateOutputBundleBoundarySchemaVersion",
  "bundleBoundaryRecordCount",
  "bundleBoundaryEntryCount",
  "builderOutputRecordCount",
  "builderOutputEntryCount",
  "builderOutputSafeScalarCount",
  "builderOutputRedactedPayloadMarkerCount",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeToken(value, fallback = null, maxLength = 760) {
  if (value === null || value === undefined) return fallback;
  const raw = String(value).trim();
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
  const token = safeToken(value, null, maxLength);
  return token || fallback;
}

function safeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function summaryFromEnvelope(envelope) {
  return isPlainObject(envelope?.modules?.cs_selector?.downstreamContext?.iesFirstNarrowProjectIesExportBoundarySummary)
    ? envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary
    : null;
}

function findUnsafeReadbackInput(value, depth = 0, seen = new Set()) {
  if (depth > 12) return "readback-depth-limit-exceeded";
  if (typeof value === "string") {
    return safeToken(value, null) === null ? "unsafe-string" : null;
  }
  if (Array.isArray(value)) return value.length > 0 ? "array-body-not-approved" : null;
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
      && READY_SUMMARY_FINGERPRINT_PATTERN.test(String(summary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint || ""))
      ? summary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint
      : null,
  };

  for (const key of SAFE_BOOLEAN_FIELDS) projection[key] = isPlainObject(summary) ? summary[key] === true : false;
  for (const key of SAFE_TOKEN_FIELDS) projection[key] = isPlainObject(summary) ? safeToken(summary[key]) : null;
  for (const key of SAFE_INTEGER_FIELDS) projection[key] = isPlainObject(summary) ? safeInteger(summary[key]) : null;
  return projection;
}

function result(state, reason, { blocker = null, summary = null } = {}) {
  const ready = state === RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready;
  const readiness = ready ? "ready"
    : state === RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing ? "missing"
      : "blocked_fail_closed";
  const base = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
    state,
    readiness,
    ready,
    failClosed: !ready,
    blocker: blocker ? safeText(blocker, "ies-first-narrow-project-ies-export-boundary-readback-blocked") : null,
    reason: safeText(reason, state),
    owner: "shell",
    slotOwner: "shell",
    envelopeOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_TARGET,
    ...buildSafeProjection(summary),
  };

  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS) {
    base[key] = false;
  }

  base.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
    base,
  );
  return Object.freeze(base);
}

function validateSummary(summary) {
  const allowed = new Set(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER);
  for (const key of Object.keys(summary)) {
    if (!allowed.has(key)) {
      return RAW_OR_PRIVATE_KEYS.includes(key)
        ? "summary-field-not-allow-listed-raw-field"
        : `summary-field-not-allow-listed-${safeText(key, "field")}`;
    }
  }

  const unsafe = findUnsafeReadbackInput(summary) || findUnsafeIesFirstNarrowProjectIesExportBoundaryInput(summary);
  if (unsafe) return unsafe;

  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(summary, key)) return `required-summary-field-missing-${safeText(key, "field")}`;
  }
  if (Object.keys(summary).join("|") !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER.join("|")) {
    return "summary-field-order-drifted";
  }

  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID
    || Number(summary.schemaVersion) !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION
    || summary.contractId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID) {
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
  if (summary.sourceKind !== "safe-project-ies-export-boundary-summary"
    || summary.futureOutputKind !== "ies-first-narrow-project-ies-export-boundary") {
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
    "exportBoundaryOnly",
    "projectIesExportBoundaryOnly",
    "bundleBoundaryOnly",
    "builderCallBoundaryOnly",
    "approvedReferenceGatePassed",
    "resolvedRunLengthGatePassed",
    "fingerprintAlignmentGatePassed",
    "builderBoundaryCallAllowed",
    "builderBoundaryCallAttempted",
    "builderBoundaryCallSucceeded",
    "builderOutputReduced",
    "approvedReferenceReady",
    "projectIesExportApproved",
    "sourceBacked",
    "sourceAnchorOnly",
    "opaqueReferenceOnly",
    "bundleBoundaryReady",
  ]) {
    if (summary[key] !== true) return `required-ready-summary-flag-not-true-${safeText(key, "flag")}`;
  }
  if (summary.productionProof !== false || summary.labProofAuthority !== false) return "persisted-summary-attempted-proof-authority";

  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return `required-false-summary-flag-not-false-${safeText(key, "flag")}`;
  }

  if (!OPAQUE_BUNDLE_BOUNDARY_REF_PATTERN.test(String(summary.opaqueBundleBoundaryRef || ""))) return "opaque-bundle-boundary-ref-invalid";
  if (!OPAQUE_PROJECT_IES_EXPORT_BOUNDARY_REF_PATTERN.test(String(summary.opaqueProjectIesExportBoundaryRef || ""))) return "opaque-project-ies-export-boundary-ref-invalid";
  if (!BUNDLE_BOUNDARY_SUMMARY_FINGERPRINT_PATTERN.test(String(summary.candidateOutputBundleBoundarySummaryFingerprint || ""))) return "bundle-boundary-summary-fingerprint-invalid";
  if (!BUILDER_OUTPUT_REDUCTION_FINGERPRINT_PATTERN.test(String(summary.builderOutputReductionFingerprint || ""))) return "builder-output-reduction-fingerprint-invalid";
  if (!JOB_FINGERPRINT_PATTERN.test(String(summary.jobFingerprint || ""))) return "project-ies-export-boundary-job-fingerprint-invalid";
  if (!READY_SUMMARY_FINGERPRINT_PATTERN.test(String(summary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint || ""))) return "persisted-summary-fingerprint-invalid";

  for (const key of [
    "approvedLabReferenceSchemaId",
    "approvedLabReferenceState",
    "approvedLabReferenceFingerprint",
    "referenceIesFingerprint",
    "oneMmLabRecordFingerprint",
    "provenanceFingerprint",
    "emergencyEvidenceFingerprint",
    "jobKind",
    "policyFingerprint",
    "sourceFingerprint",
    "sourceInputFingerprint",
    "boardDataSourceVersion",
    "candidateOutputBundleBoundaryContractId",
    "candidateOutputBundleBoundarySchemaId",
    "candidateOutputBundleBoundaryState",
    "builderOutputKind",
  ]) {
    if (!safeToken(summary[key])) return `required-safe-summary-token-missing-${safeText(key, "field")}`;
  }

  for (const key of [
    "approvedLabReferenceSchemaVersion",
    "candidateOutputBundleBoundarySchemaVersion",
    "runLengthMm",
    "bundleBoundaryRecordCount",
    "bundleBoundaryEntryCount",
    "builderOutputRecordCount",
    "builderOutputEntryCount",
    "builderOutputSafeScalarCount",
    "builderOutputRedactedPayloadMarkerCount",
  ]) {
    const value = safeInteger(summary[key]);
    if (value === null || value < 1) return `required-positive-summary-count-missing-${safeText(key, "field")}`;
  }

  const withoutFingerprint = Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER
      .filter((key) => key !== "iesFirstNarrowProjectIesExportBoundarySummaryFingerprint")
      .map((key) => [key, summary[key]]),
  );
  const expectedFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-summary",
    withoutFingerprint,
  );
  if (summary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint !== expectedFingerprint) {
    return "persisted-summary-fingerprint-mismatch";
  }

  return null;
}

export function buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus(envelope = {}) {
  if (!isPlainObject(envelope) || Object.keys(envelope).length === 0) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing,
      "project IES export boundary readback is missing because no project envelope was found",
      { blocker: "project-ies-export-boundary-envelope-missing" },
    );
  }

  if (!isPlainObject(envelope.modules?.cs_selector)) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing,
      "project IES export boundary readback is missing because the cs_selector envelope module slot is absent",
      { blocker: "project-ies-export-boundary-module-missing" },
    );
  }

  const summary = summaryFromEnvelope(envelope);
  if (!isPlainObject(summary)) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing,
      "project IES export boundary readback is missing because the persisted summary slot is empty",
      { blocker: "project-ies-export-boundary-summary-slot-empty" },
    );
  }

  const blocker = validateSummary(summary);
  if (blocker) {
    return result(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.blockedFailClosed,
      "project IES export boundary readback blocked fail-closed before surfacing an unsafe or malformed persisted summary slot",
      { blocker, summary },
    );
  }

  return result(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    "project IES export boundary readback is ready from the shell-owned redacted project envelope summary slot only",
    { summary },
  );
}

export const buildIesFirstNarrowProjectIesExportBoundaryReadbackStatus =
  buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus;
