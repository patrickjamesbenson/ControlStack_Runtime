import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "./iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowProjectIesExportBoundarySummary.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID =
  "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-RESULT-SUMMARY-WRITE-1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.ies-first-narrow-project-ies-export-result-summary.v1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultSummary";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS = Object.freeze([
  ...new Set([
    ...RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
    "projectIesExportResultBodyReturned",
    "projectIesExportResultTextReturned",
    "projectIesExportResultPayloadReturned",
    "projectIesExportResultArrayReturned",
    "projectIesExportResultFilenameReturned",
    "projectIesExportResultPathReturned",
    "projectIesExportResultBase64Returned",
    "projectIesExportResultFileOutputEnabled",
    "projectIesExportResultFileOutputAttempted",
    "projectIesExportResultFileOutputWritten",
    "projectIesExportResultMaterialisationEnabled",
    "projectIesExportResultMaterialisationAttempted",
    "projectIesExportResultMaterialised",
    "projectIesExportResultDownloadEnabled",
    "projectIesExportResultDownloadAvailable",
    "outputGenerationEnabled",
    "outputGenerationAttempted",
    "outputGenerated",
    "fileMaterialisationEnabled",
    "fileMaterialisationAttempted",
    "fileMaterialised",
    "downloadEnabled",
    "downloadAvailable",
  ]),
]);

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "consumerModuleId",
  "state",
  "blocker",
  "sourceKind",
  "futureOutputKind",
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
  "opaqueBundleBoundaryRef",
  "opaqueProjectIesExportBoundaryRef",
  "runLengthMm",
  "builderOutputKind",
  "builderOutputRecordCount",
  "builderOutputEntryCount",
  "builderOutputSafeScalarCount",
  "builderOutputRedactedPayloadMarkerCount",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "jobKind",
  "jobFingerprint",
  "builderOutputReductionFingerprint",
  "candidateOutputBundleBoundarySummaryFingerprint",
  "projectIesExportBoundaryReadbackStatusSchemaId",
  "projectIesExportBoundaryReadbackStatusSchemaVersion",
  "projectIesExportBoundaryReadbackState",
  "projectIesExportBoundaryReadiness",
  "projectIesExportBoundaryReadbackFingerprint",
  "projectIesExportBoundaryContractId",
  "projectIesExportBoundarySummarySchemaId",
  "projectIesExportBoundarySummarySchemaVersion",
  "projectIesExportBoundarySummaryState",
  "projectIesExportBoundarySummaryFingerprint",
  ...RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  "iesFirstNarrowProjectIesExportResultSummaryFingerprint",
]);

const READY_STATE = "redacted_ies_first_narrow_project_ies_export_result_summary_persisted";
const BLOCKED_STATE = "ies_first_narrow_project_ies_export_result_summary_blocked_fail_closed";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT\s*=|\bLM-63\b)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s"']*base64|\bbase64\s*[,=:]/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json|zip)(?:$|[\s?#])/i;
const OPAQUE_BUNDLE_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary:[0-9a-f]{40}$/;
const OPAQUE_PROJECT_IES_EXPORT_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary:[0-9a-f]{40}$/;
const BOUNDARY_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-summary:[0-9a-f]{40}$/;
const BOUNDARY_READBACK_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-readback-status:[0-9a-f]{40}$/;
const BUNDLE_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary-summary:[0-9a-f]{40}$/;
const BUILDER_REDUCTION_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-builder-output-reduction:[0-9a-f]{40}$/;
const JOB_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-job:[0-9a-f]{40}$/;

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
  "resultBody",
  "resultPayload",
  "rawResult",
]);

const UNSAFE_TRUE_FLAGS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  "fileOutputEnabled",
  "fileOutputAttempted",
  "fileOutputWritten",
  "outputFileWritten",
  "materialisationEnabled",
  "materialisationAttempted",
  "materialised",
  "donorInvocationEnabled",
  "donorInvocationAttempted",
  "routeAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
  "runtimeDataMutation",
]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeToken(value, fallback = null) {
  if (value === null || value === undefined) return fallback;
  const token = String(value).trim();
  if (!token
    || PRIVATE_VALUE_PATTERN.test(token)
    || RAW_IES_TEXT_PATTERN.test(token)
    || DATA_BASE64_PATTERN.test(token)
    || FILE_EXTENSION_VALUE_PATTERN.test(token)) return fallback;
  return SAFE_TOKEN_PATTERN.test(token) ? token : fallback;
}

function safeInteger(value) {
  const number = Number(value);
  return Number.isSafeInteger(number) && number >= 0 ? number : null;
}

function positiveInteger(value) {
  const number = safeInteger(value);
  return number !== null && number > 0 ? number : null;
}

function falseFlags() {
  return Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
  );
}

function orderedSummary(fields) {
  return Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER.map((key) => [key, fields[key]]),
  );
}

export function findUnsafeIesFirstNarrowProjectIesExportResultSummaryInput(value, depth = 0, seen = new Set()) {
  if (depth > 12) return "project-ies-export-result-summary-depth-limit-exceeded";
  if (typeof value === "string") {
    return safeToken(value, null) === null ? "project-ies-export-result-summary-unsafe-string" : null;
  }
  if (Array.isArray(value)) return "project-ies-export-result-summary-array-not-approved";
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_OR_PRIVATE_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return "blocked-unsafe-raw-input";
    }
    if (UNSAFE_TRUE_FLAGS.includes(key) && nested === true) return "blocked-unsafe-enabled-flag";
    const child = findUnsafeIesFirstNarrowProjectIesExportResultSummaryInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function blockedSummary(reason) {
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: BLOCKED_STATE,
    blocker: safeToken(reason, "project-ies-export-result-summary-blocked"),
    sourceKind: "safe-project-ies-export-boundary-readback-status",
    futureOutputKind: "ies-first-narrow-project-ies-export-result-summary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    resultSummaryOnly: true,
    exportBoundaryReadbackOnly: true,
    productionProof: false,
    labProofAuthority: false,
    projectIesExportBoundaryReadbackReady: false,
    projectIesExportResultSummaryReady: false,
    sourceBacked: false,
    sourceAnchorOnly: false,
    opaqueReferenceOnly: false,
    opaqueBundleBoundaryRef: null,
    opaqueProjectIesExportBoundaryRef: null,
    runLengthMm: null,
    builderOutputKind: null,
    builderOutputRecordCount: 0,
    builderOutputEntryCount: 0,
    builderOutputSafeScalarCount: 0,
    builderOutputRedactedPayloadMarkerCount: 0,
    policyFingerprint: null,
    sourceFingerprint: null,
    sourceInputFingerprint: null,
    boardDataSourceVersion: null,
    jobKind: null,
    jobFingerprint: null,
    builderOutputReductionFingerprint: null,
    candidateOutputBundleBoundarySummaryFingerprint: null,
    projectIesExportBoundaryReadbackStatusSchemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
    projectIesExportBoundaryReadbackStatusSchemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
    projectIesExportBoundaryReadbackState: null,
    projectIesExportBoundaryReadiness: "blocked_fail_closed",
    projectIesExportBoundaryReadbackFingerprint: null,
    projectIesExportBoundaryContractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    projectIesExportBoundarySummarySchemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    projectIesExportBoundarySummarySchemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    projectIesExportBoundarySummaryState: null,
    projectIesExportBoundarySummaryFingerprint: null,
    ...falseFlags(),
    iesFirstNarrowProjectIesExportResultSummaryFingerprint: null,
  };
  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowProjectIesExportResultSummaryFingerprint;
  fields.iesFirstNarrowProjectIesExportResultSummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-result-summary",
    withoutFingerprint,
  );
  return Object.freeze(orderedSummary(fields));
}

function validateReadyReadbackStatus(status) {
  if (!isPlainObject(status)) return "project-ies-export-boundary-readback-status-missing";
  const unsafe = findUnsafeIesFirstNarrowProjectIesExportResultSummaryInput(status);
  if (unsafe) return unsafe;
  if (status.schemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID
    || Number(status.schemaVersion) !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION) {
    return "project-ies-export-boundary-readback-schema-mismatch";
  }
  if (status.state !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready
    || status.readiness !== "ready"
    || status.ready !== true
    || status.failClosed !== false
    || status.blocker !== null) {
    return "project-ies-export-boundary-readback-not-ready";
  }
  if (status.summaryPresent !== true
    || status.summarySchemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID
    || Number(status.summarySchemaVersion) !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION
    || status.summaryContractId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID
    || status.summaryState !== "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready") {
    return "project-ies-export-boundary-readback-summary-identity-mismatch";
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
    if (status[key] !== true) return `project-ies-export-boundary-readback-required-flag-not-true-${key}`;
  }
  if (status.productionProof !== false || status.labProofAuthority !== false) {
    return "project-ies-export-boundary-readback-attempted-proof-authority";
  }
  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS) {
    if (status[key] !== false) return `project-ies-export-boundary-readback-required-flag-not-false-${key}`;
  }
  if (!OPAQUE_BUNDLE_BOUNDARY_REF_PATTERN.test(String(status.opaqueBundleBoundaryRef || ""))) return "project-ies-export-boundary-readback-bundle-ref-invalid";
  if (!OPAQUE_PROJECT_IES_EXPORT_BOUNDARY_REF_PATTERN.test(String(status.opaqueProjectIesExportBoundaryRef || ""))) return "project-ies-export-boundary-readback-ref-invalid";
  if (!BOUNDARY_SUMMARY_FINGERPRINT_PATTERN.test(String(status.summaryFingerprint || ""))) return "project-ies-export-boundary-readback-summary-fingerprint-invalid";
  if (!BOUNDARY_READBACK_FINGERPRINT_PATTERN.test(String(status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint || ""))) return "project-ies-export-boundary-readback-fingerprint-invalid";
  if (!BUNDLE_SUMMARY_FINGERPRINT_PATTERN.test(String(status.candidateOutputBundleBoundarySummaryFingerprint || ""))) return "project-ies-export-boundary-readback-bundle-summary-fingerprint-invalid";
  if (!BUILDER_REDUCTION_FINGERPRINT_PATTERN.test(String(status.builderOutputReductionFingerprint || ""))) return "project-ies-export-boundary-readback-builder-reduction-fingerprint-invalid";
  if (!JOB_FINGERPRINT_PATTERN.test(String(status.jobFingerprint || ""))) return "project-ies-export-boundary-readback-job-fingerprint-invalid";
  if (positiveInteger(status.runLengthMm) === null
    || positiveInteger(status.builderOutputRecordCount) === null
    || positiveInteger(status.builderOutputEntryCount) === null
    || positiveInteger(status.builderOutputSafeScalarCount) === null
    || positiveInteger(status.builderOutputRedactedPayloadMarkerCount) === null) {
    return "project-ies-export-boundary-readback-counts-invalid";
  }
  for (const key of [
    "builderOutputKind",
    "policyFingerprint",
    "sourceFingerprint",
    "sourceInputFingerprint",
    "boardDataSourceVersion",
    "jobKind",
  ]) {
    if (!safeToken(status[key])) return `project-ies-export-boundary-readback-token-missing-${key}`;
  }
  const fingerprintSource = { ...status };
  delete fingerprintSource.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint;
  const expectedFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
    fingerprintSource,
  );
  if (status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint !== expectedFingerprint) {
    return "project-ies-export-boundary-readback-fingerprint-mismatch";
  }
  return null;
}

export function buildRuntimeIesFirstNarrowProjectIesExportResultSummary(input = {}) {
  const status = isPlainObject(input?.iesFirstNarrowProjectIesExportBoundaryReadbackStatus)
    ? input.iesFirstNarrowProjectIesExportBoundaryReadbackStatus
    : isPlainObject(input) && input.schemaId === RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID
      ? input
      : null;
  const blocker = validateReadyReadbackStatus(status);
  if (blocker) return blockedSummary(blocker);

  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: READY_STATE,
    blocker: null,
    sourceKind: "safe-project-ies-export-boundary-readback-status",
    futureOutputKind: "ies-first-narrow-project-ies-export-result-summary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    resultSummaryOnly: true,
    exportBoundaryReadbackOnly: true,
    productionProof: false,
    labProofAuthority: false,
    projectIesExportBoundaryReadbackReady: true,
    projectIesExportResultSummaryReady: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    opaqueBundleBoundaryRef: safeToken(status.opaqueBundleBoundaryRef),
    opaqueProjectIesExportBoundaryRef: safeToken(status.opaqueProjectIesExportBoundaryRef),
    runLengthMm: positiveInteger(status.runLengthMm),
    builderOutputKind: safeToken(status.builderOutputKind),
    builderOutputRecordCount: positiveInteger(status.builderOutputRecordCount),
    builderOutputEntryCount: positiveInteger(status.builderOutputEntryCount),
    builderOutputSafeScalarCount: positiveInteger(status.builderOutputSafeScalarCount),
    builderOutputRedactedPayloadMarkerCount: positiveInteger(status.builderOutputRedactedPayloadMarkerCount),
    policyFingerprint: safeToken(status.policyFingerprint),
    sourceFingerprint: safeToken(status.sourceFingerprint),
    sourceInputFingerprint: safeToken(status.sourceInputFingerprint),
    boardDataSourceVersion: safeToken(status.boardDataSourceVersion),
    jobKind: safeToken(status.jobKind),
    jobFingerprint: safeToken(status.jobFingerprint),
    builderOutputReductionFingerprint: safeToken(status.builderOutputReductionFingerprint),
    candidateOutputBundleBoundarySummaryFingerprint: safeToken(status.candidateOutputBundleBoundarySummaryFingerprint),
    projectIesExportBoundaryReadbackStatusSchemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
    projectIesExportBoundaryReadbackStatusSchemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
    projectIesExportBoundaryReadbackState: safeToken(status.state),
    projectIesExportBoundaryReadiness: "ready",
    projectIesExportBoundaryReadbackFingerprint: safeToken(status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint),
    projectIesExportBoundaryContractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    projectIesExportBoundarySummarySchemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    projectIesExportBoundarySummarySchemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    projectIesExportBoundarySummaryState: safeToken(status.summaryState),
    projectIesExportBoundarySummaryFingerprint: safeToken(status.summaryFingerprint),
    ...falseFlags(),
    iesFirstNarrowProjectIesExportResultSummaryFingerprint: null,
  };
  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowProjectIesExportResultSummaryFingerprint;
  fields.iesFirstNarrowProjectIesExportResultSummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-result-summary",
    withoutFingerprint,
  );
  return Object.freeze(orderedSummary(fields));
}

export const buildIesFirstNarrowProjectIesExportResultSummary =
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary;
