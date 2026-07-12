import {
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
} from "./runtimeApprovedLabReferenceSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowCandidateOutputBundleBoundarySummary.js";
import { stableFingerprint } from "./stableFingerprint.js";
import {
  registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource,
} from "./iesFirstNarrowProjectIesExportDownloadMaterialiserCapability.js";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID = "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-BOUNDARY-1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID = "controlstack.runtime.ies-first-narrow-project-ies-export-boundary-summary.v1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS = Object.freeze([
  "projectIesFileOutputEnabled",
  "projectIesFileOutputAttempted",
  "projectIesFileOutputWritten",
  "projectIesBodyReturned",
  "projectIesTextReturned",
  "rawProjectIesReturned",
  "rawProjectIesTextReturned",
  "rawIesReturned",
  "rawIesTextReturned",
  "candelaArraysReturned",
  "rawCandelaReturned",
  "governancePayloadReturned",
  "rawGovernanceReturned",
  "referenceIesReturned",
  "rawReferenceIesReturned",
  "photometryReturned",
  "rawPhotometryReturned",
  "base64ArtifactsReturned",
  "outputFilesReturned",
  "localPathReturned",
  "privatePathReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutationEnabled",
  "runtimeDataMutationAttempted",
  "runtimeDataMutated",
  "webhookEnabled",
  "webhookPosted",
  "shellUiMutated",
]);

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER = Object.freeze([
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
  "opaqueBundleBoundaryRef",
  "opaqueProjectIesExportBoundaryRef",
  "approvedLabReferenceSchemaId",
  "approvedLabReferenceSchemaVersion",
  "approvedLabReferenceState",
  "approvedLabReferenceFingerprint",
  "referenceIesFingerprint",
  "oneMmLabRecordFingerprint",
  "provenanceFingerprint",
  "emergencyEvidenceFingerprint",
  "runLengthMm",
  "jobKind",
  "jobFingerprint",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "candidateOutputBundleBoundaryContractId",
  "candidateOutputBundleBoundarySchemaId",
  "candidateOutputBundleBoundarySchemaVersion",
  "candidateOutputBundleBoundaryState",
  "candidateOutputBundleBoundarySummaryFingerprint",
  "bundleBoundaryReady",
  "bundleBoundaryRecordCount",
  "bundleBoundaryEntryCount",
  "builderOutputKind",
  "builderOutputRecordCount",
  "builderOutputEntryCount",
  "builderOutputSafeScalarCount",
  "builderOutputRedactedPayloadMarkerCount",
  "builderOutputReductionFingerprint",
  ...RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  "iesFirstNarrowProjectIesExportBoundarySummaryFingerprint",
]);

const READY_STATE = "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready";
const BLOCKED_STATE = "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT\s*=|\bLM-63\b)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s"']*base64|\bbase64\s*[,=:]/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json|zip)(?:$|[\s?#])/i;

const RAW_INPUT_KEYS = Object.freeze([
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
]);

const UNSAFE_TRUE_FLAGS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  "fileOutputEnabled",
  "fileOutputAttempted",
  "fileOutputWritten",
  "outputFileWritten",
  "donorInvocationEnabled",
  "donorInvocationAttempted",
  "routeAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
  "runtimeDataMutation",
  "runtimeDataMutationWritten",
]);

const BUILDER_OUTPUT_FILE_KEYS = Object.freeze([
  "outputFiles",
  "files",
  "file",
  "filename",
  "fileName",
  "filePath",
  "localPath",
  "privatePath",
  "targetPath",
  "writeTarget",
  "savedPath",
  "materialisedPath",
]);

const BUILDER_OUTPUT_RAW_KEYS = Object.freeze([
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
  "governance",
  "rawGovernance",
  "governancePayload",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function deepFreeze(value, seen = new Set()) {
  if (!isRecord(value) && !Array.isArray(value)) return value;
  if (seen.has(value)) return value;
  seen.add(value);
  Object.freeze(value);
  for (const nested of Object.values(value)) deepFreeze(nested, seen);
  return value;
}

function safeToken(value) {
  if (value === null || value === undefined) return null;
  const token = String(value).trim();
  if (!token || PRIVATE_VALUE_PATTERN.test(token) || RAW_IES_TEXT_PATTERN.test(token) || DATA_BASE64_PATTERN.test(token) || FILE_EXTENSION_VALUE_PATTERN.test(token)) return null;
  return SAFE_TOKEN_PATTERN.test(token) ? token : null;
}

function safeKind(value, fallback = "redacted-project-ies-builder-output") {
  const token = safeToken(value);
  return token ? token.slice(0, 180) : fallback;
}

function firstPresent(source, keys) {
  if (!isRecord(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && source[key] !== null && source[key] !== undefined && source[key] !== "") return source[key];
  }
  return undefined;
}

function nonNegativeInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.trunc(number);
}

function positiveInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number <= 0) return null;
  return Math.trunc(number);
}

function falseFlags() {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));
}

function orderedSummary(fields) {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER.map((key) => [key, fields[key]]));
}

function blockedSummary(reason, partial = {}) {
  const blocker = safeKind(reason, "blocked-fail-closed");
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: BLOCKED_STATE,
    blocker,
    sourceKind: "safe-project-ies-export-boundary-summary",
    futureOutputKind: "ies-first-narrow-project-ies-export-boundary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    exportBoundaryOnly: true,
    projectIesExportBoundaryOnly: true,
    bundleBoundaryOnly: true,
    builderCallBoundaryOnly: true,
    productionProof: false,
    labProofAuthority: false,
    approvedReferenceGatePassed: partial.approvedReferenceGatePassed === true,
    resolvedRunLengthGatePassed: partial.resolvedRunLengthGatePassed === true,
    fingerprintAlignmentGatePassed: partial.fingerprintAlignmentGatePassed === true,
    builderBoundaryCallAllowed: false,
    builderBoundaryCallAttempted: partial.builderBoundaryCallAttempted === true,
    builderBoundaryCallSucceeded: false,
    builderOutputReduced: false,
    approvedReferenceReady: partial.approvedReferenceReady === true,
    projectIesExportApproved: partial.projectIesExportApproved === true,
    sourceBacked: false,
    sourceAnchorOnly: false,
    opaqueReferenceOnly: true,
    opaqueBundleBoundaryRef: null,
    opaqueProjectIesExportBoundaryRef: null,
    approvedLabReferenceSchemaId: null,
    approvedLabReferenceSchemaVersion: null,
    approvedLabReferenceState: null,
    approvedLabReferenceFingerprint: null,
    referenceIesFingerprint: null,
    oneMmLabRecordFingerprint: null,
    provenanceFingerprint: null,
    emergencyEvidenceFingerprint: null,
    runLengthMm: partial.runLengthMm || null,
    jobKind: null,
    jobFingerprint: null,
    policyFingerprint: null,
    sourceFingerprint: null,
    sourceInputFingerprint: null,
    boardDataSourceVersion: null,
    candidateOutputBundleBoundaryContractId: null,
    candidateOutputBundleBoundarySchemaId: null,
    candidateOutputBundleBoundarySchemaVersion: null,
    candidateOutputBundleBoundaryState: null,
    candidateOutputBundleBoundarySummaryFingerprint: null,
    bundleBoundaryReady: false,
    bundleBoundaryRecordCount: 0,
    bundleBoundaryEntryCount: 0,
    builderOutputKind: null,
    builderOutputRecordCount: 0,
    builderOutputEntryCount: 0,
    builderOutputSafeScalarCount: 0,
    builderOutputRedactedPayloadMarkerCount: 0,
    builderOutputReductionFingerprint: null,
    ...falseFlags(),
    iesFirstNarrowProjectIesExportBoundarySummaryFingerprint: null,
    ...partial.safeFields,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint;
  fields.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-summary",
    withoutFingerprint,
  );
  return Object.freeze(orderedSummary(fields));
}

export function findUnsafeIesFirstNarrowProjectIesExportBoundaryInput(value, depth = 0, seen = new Set()) {
  if (depth > 12 || value === null || value === undefined) return null;
  if (typeof value === "function") return null;
  if (typeof value === "string") {
    if (PRIVATE_VALUE_PATTERN.test(value) || RAW_IES_TEXT_PATTERN.test(value) || DATA_BASE64_PATTERN.test(value) || FILE_EXTENSION_VALUE_PATTERN.test(value)) {
      return "ies-first-narrow-project-ies-export-boundary-unsafe-string";
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 100)) {
      const nested = findUnsafeIesFirstNarrowProjectIesExportBoundaryInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isRecord(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (key === "buildProjectIes") continue;
    if (RAW_INPUT_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return "blocked-unsafe-raw-input";
    }
    if (UNSAFE_TRUE_FLAGS.includes(key) && nested === true) {
      return "blocked-unsafe-enabled-flag";
    }
    const child = findUnsafeIesFirstNarrowProjectIesExportBoundaryInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function validateApprovedReference(summary) {
  if (!isRecord(summary)) return { ok: false, blocker: "approved-reference-summary-missing" };
  if (summary.schemaId !== RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID) return { ok: false, blocker: "approved-reference-schema-mismatch" };
  if (summary.schemaVersion !== RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION) return { ok: false, blocker: "approved-reference-schema-mismatch" };
  if (summary.state !== RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE) return { ok: false, blocker: "approved-reference-state-not-ready" };
  if (summary.ok !== true || summary.approvedLabReferenceSummaryReady !== true) return { ok: false, blocker: "approved-reference-not-ready" };
  if (summary.projectIesExportEligible !== true) return { ok: false, blocker: "project-ies-export-not-approved" };
  const exportSummary = isRecord(summary.projectIesExportSummary) ? summary.projectIesExportSummary : {};
  if (exportSummary.projectIesExportApproved !== true) return { ok: false, blocker: "project-ies-export-not-approved" };
  if (exportSummary.projectIesExportGenerated === true || exportSummary.rawProjectIesReturned === true) return { ok: false, blocker: "approved-reference-output-already-generated" };
  const approvedLabReferenceFingerprint = safeToken(summary.approvedLabReferenceFingerprint);
  if (!approvedLabReferenceFingerprint) return { ok: false, blocker: "approved-reference-fingerprint-missing" };
  return {
    ok: true,
    approvedLabReferenceFingerprint,
    referenceIesFingerprint: safeToken(summary.referenceIesFingerprint),
    oneMmLabRecordFingerprint: safeToken(summary.oneMmLabRecordFingerprint),
    provenanceFingerprint: safeToken(summary.provenanceFingerprint),
    emergencyEvidenceFingerprint: safeToken(summary.emergencyEvidenceFingerprint),
    policyFingerprint: safeToken(summary.policyFingerprint),
    sourceFingerprint: safeToken(summary.sourceFingerprint),
  };
}

function validateBundleBoundary(summary) {
  if (!isRecord(summary)) return { ok: false, blocker: "bundle-boundary-summary-missing" };
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID) return { ok: false, blocker: "bundle-boundary-schema-mismatch" };
  if (summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION) return { ok: false, blocker: "bundle-boundary-schema-mismatch" };
  if (summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID) return { ok: false, blocker: "bundle-boundary-contract-mismatch" };
  if (summary.state !== "redacted_ies_first_narrow_candidate_output_bundle_boundary_summary_persisted") return { ok: false, blocker: "bundle-boundary-not-ready" };
  if (summary.readyForBundleBoundary !== true || summary.outputBundleBoundaryJoined !== true) return { ok: false, blocker: "bundle-boundary-not-ready" };
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) return { ok: false, blocker: "bundle-boundary-not-redacted" };
  if (summary.outputBundleIncluded !== false || summary.rawOutputBundleIncluded !== false || summary.rawArtifactIncluded !== false) return { ok: false, blocker: "bundle-boundary-raw-output-not-redacted" };
  const sourceInputFingerprint = safeToken(summary.sourceInputFingerprint);
  const boardDataSourceVersion = safeToken(summary.boardDataSourceVersion);
  const opaqueBundleBoundaryRef = safeToken(summary.opaqueBundleBoundaryRef);
  const candidateOutputBundleBoundarySummaryFingerprint = safeToken(summary.iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint);
  if (!sourceInputFingerprint || !boardDataSourceVersion || !opaqueBundleBoundaryRef || !candidateOutputBundleBoundarySummaryFingerprint) return { ok: false, blocker: "bundle-boundary-fingerprint-missing" };
  return {
    ok: true,
    sourceInputFingerprint,
    boardDataSourceVersion,
    opaqueBundleBoundaryRef,
    candidateOutputBundleBoundarySummaryFingerprint,
    policyFingerprint: safeToken(summary.policyFingerprint),
    sourceFingerprint: safeToken(summary.sourceFingerprint),
    bundleBoundaryRecordCount: nonNegativeInteger(summary.outputBundleRecordCount),
    bundleBoundaryEntryCount: nonNegativeInteger(summary.outputBundleEntryCount),
  };
}

function validateResolvedRunLength(input, job) {
  const value = firstPresent(input, ["resolvedRunLengthMm", "runLengthMm"])
    ?? firstPresent(job, ["resolvedRunLengthMm", "runLengthMm"]);
  const runLengthMm = positiveInteger(value);
  if (!runLengthMm) return { ok: false, blocker: "resolved-run-length-missing" };
  const jobValue = firstPresent(job, ["resolvedRunLengthMm", "runLengthMm"]);
  if (jobValue !== undefined && positiveInteger(jobValue) !== runLengthMm) return { ok: false, blocker: "resolved-run-length-mismatch" };
  return { ok: true, runLengthMm };
}

function validateFingerprintAlignment(approved, bundle, job) {
  const jobSourceInputFingerprint = safeToken(firstPresent(job, ["sourceInputFingerprint", "currentSourceInputFingerprint"]));
  const jobBoardDataSourceVersion = safeToken(firstPresent(job, ["boardDataSourceVersion", "sourceVersionFingerprint", "sourceVersionMarker"]));
  if (!jobSourceInputFingerprint || !jobBoardDataSourceVersion) return { ok: false, blocker: "job-source-fingerprint-missing" };
  if (jobSourceInputFingerprint !== bundle.sourceInputFingerprint) return { ok: false, blocker: "source-input-fingerprint-mismatch" };
  if (jobBoardDataSourceVersion !== bundle.boardDataSourceVersion) return { ok: false, blocker: "board-data-source-version-mismatch" };
  const jobPolicyFingerprint = safeToken(job.policyFingerprint);
  const jobSourceFingerprint = safeToken(job.sourceFingerprint);
  if (jobPolicyFingerprint && bundle.policyFingerprint && jobPolicyFingerprint !== bundle.policyFingerprint) return { ok: false, blocker: "policy-fingerprint-mismatch" };
  if (jobSourceFingerprint && bundle.sourceFingerprint && jobSourceFingerprint !== bundle.sourceFingerprint) return { ok: false, blocker: "source-fingerprint-mismatch" };
  if (approved.policyFingerprint && bundle.policyFingerprint && approved.policyFingerprint !== bundle.policyFingerprint) return { ok: false, blocker: "approved-reference-policy-fingerprint-mismatch" };
  if (approved.sourceFingerprint && bundle.sourceFingerprint && approved.sourceFingerprint !== bundle.sourceFingerprint) return { ok: false, blocker: "approved-reference-source-fingerprint-mismatch" };
  return { ok: true };
}

function safeReferenceForBuilder(approved, bundle) {
  return deepFreeze({
    kind: "approved-lab-reference-project-ies-export-boundary-ref",
    safeSummaryOnly: true,
    diagnosticOnly: true,
    approvedReferenceOnly: true,
    projectIesExportApproved: true,
    approvedLabReferenceFingerprint: approved.approvedLabReferenceFingerprint,
    referenceIesFingerprint: approved.referenceIesFingerprint,
    oneMmLabRecordFingerprint: approved.oneMmLabRecordFingerprint,
    provenanceFingerprint: approved.provenanceFingerprint,
    emergencyEvidenceFingerprint: approved.emergencyEvidenceFingerprint,
    policyFingerprint: approved.policyFingerprint || bundle.policyFingerprint,
    sourceFingerprint: approved.sourceFingerprint || bundle.sourceFingerprint,
    sourceInputFingerprint: bundle.sourceInputFingerprint,
    boardDataSourceVersion: bundle.boardDataSourceVersion,
    rawReferenceIesReturned: false,
    rawProjectIesReturned: false,
  });
}

function safeJobForBuilder(job, bundle, runLengthMm) {
  const jobKind = safeKind(firstPresent(job, ["jobKind", "kind", "type"]), "project-ies-export-boundary-job");
  const base = {
    kind: jobKind,
    safeSummaryOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    resolvedRunLengthMm: runLengthMm,
    sourceInputFingerprint: bundle.sourceInputFingerprint,
    boardDataSourceVersion: bundle.boardDataSourceVersion,
    policyFingerprint: safeToken(job.policyFingerprint) || bundle.policyFingerprint,
    sourceFingerprint: safeToken(job.sourceFingerprint) || bundle.sourceFingerprint,
    opaqueBundleBoundaryRef: bundle.opaqueBundleBoundaryRef,
    candidateOutputBundleBoundarySummaryFingerprint: bundle.candidateOutputBundleBoundarySummaryFingerprint,
    rawSelectedPayloadReturned: false,
    rawRunTableRowsReturned: false,
    fileOutputWritten: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutationEnabled: false,
  };
  return deepFreeze(base);
}

function reduceBuilderOutput(value, depth = 0, seen = new Set(), state = null) {
  const summary = state || {
    blocker: null,
    records: 0,
    entries: 0,
    safeScalars: 0,
    redactedPayloadMarkers: 0,
    firstKind: null,
  };
  if (depth > 12 || value === undefined) return summary;
  if (value === null) return summary;
  if (typeof value === "function") return summary;
  if (typeof value === "string") {
    summary.safeScalars += safeToken(value) ? 1 : 0;
    if (RAW_IES_TEXT_PATTERN.test(value) || DATA_BASE64_PATTERN.test(value) || PRIVATE_VALUE_PATTERN.test(value) || FILE_EXTENSION_VALUE_PATTERN.test(value)) summary.redactedPayloadMarkers += 1;
    return summary;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    summary.safeScalars += 1;
    return summary;
  }
  if (Array.isArray(value)) {
    summary.entries += value.length;
    for (const item of value.slice(0, 100)) reduceBuilderOutput(item, depth + 1, seen, summary);
    return summary;
  }
  if (!isRecord(value) || seen.has(value)) return summary;
  seen.add(value);
  summary.records += 1;
  summary.entries += Object.keys(value).length;

  if (!summary.firstKind) {
    summary.firstKind = safeToken(firstPresent(value, ["kind", "type", "outputKind", "schemaId"]));
  }

  for (const [key, nested] of Object.entries(value)) {
    if (BUILDER_OUTPUT_FILE_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      summary.blocker = "builder-output-file-output-not-approved";
      return summary;
    }
    if (UNSAFE_TRUE_FLAGS.includes(key) && nested === true) {
      summary.blocker = "builder-output-unsafe-enabled-flag";
      return summary;
    }
    if (BUILDER_OUTPUT_RAW_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      summary.redactedPayloadMarkers += 1;
      continue;
    }
    reduceBuilderOutput(nested, depth + 1, seen, summary);
    if (summary.blocker) return summary;
  }
  return summary;
}

function builderReductionFrom(output) {
  const reduced = reduceBuilderOutput(output);
  if (reduced.blocker) return { ok: false, blocker: reduced.blocker };
  const safeReduction = {
    builderOutputKind: safeKind(reduced.firstKind, "redacted-project-ies-builder-output"),
    builderOutputRecordCount: nonNegativeInteger(reduced.records),
    builderOutputEntryCount: nonNegativeInteger(reduced.entries),
    builderOutputSafeScalarCount: nonNegativeInteger(reduced.safeScalars),
    builderOutputRedactedPayloadMarkerCount: nonNegativeInteger(reduced.redactedPayloadMarkers),
  };
  return {
    ok: true,
    ...safeReduction,
    builderOutputReductionFingerprint: stableFingerprint("safe-ies-first-narrow-project-ies-export-builder-output-reduction", safeReduction),
  };
}

export function buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary(input = {}) {
  const source = isRecord(input) ? input : {};
  const approvedLabReferenceSummary = isRecord(source.approvedLabReferenceSummary) ? source.approvedLabReferenceSummary : null;
  const candidateOutputBundleBoundarySummary = isRecord(source.iesFirstNarrowCandidateOutputBundleBoundarySummary)
    ? source.iesFirstNarrowCandidateOutputBundleBoundarySummary
    : (isRecord(source.candidateOutputBundleBoundarySummary) ? source.candidateOutputBundleBoundarySummary : null);
  const job = isRecord(source.job) ? source.job : {};

  const unsafe = findUnsafeIesFirstNarrowProjectIesExportBoundaryInput({
    ...source,
    buildProjectIes: undefined,
  });
  if (unsafe) return blockedSummary(unsafe);

  const approved = validateApprovedReference(approvedLabReferenceSummary);
  if (!approved.ok) return blockedSummary(approved.blocker);

  const bundle = validateBundleBoundary(candidateOutputBundleBoundarySummary);
  if (!bundle.ok) {
    return blockedSummary(bundle.blocker, {
      approvedReferenceGatePassed: true,
      approvedReferenceReady: true,
      projectIesExportApproved: true,
    });
  }

  const runLength = validateResolvedRunLength(source, job);
  if (!runLength.ok) {
    return blockedSummary(runLength.blocker, {
      approvedReferenceGatePassed: true,
      approvedReferenceReady: true,
      projectIesExportApproved: true,
      safeFields: {
        sourceInputFingerprint: bundle.sourceInputFingerprint,
        boardDataSourceVersion: bundle.boardDataSourceVersion,
      },
    });
  }

  const alignment = validateFingerprintAlignment(approved, bundle, job);
  if (!alignment.ok) {
    return blockedSummary(alignment.blocker, {
      approvedReferenceGatePassed: true,
      approvedReferenceReady: true,
      projectIesExportApproved: true,
      resolvedRunLengthGatePassed: true,
      runLengthMm: runLength.runLengthMm,
      safeFields: {
        sourceInputFingerprint: bundle.sourceInputFingerprint,
        boardDataSourceVersion: bundle.boardDataSourceVersion,
      },
    });
  }

  if (typeof source.buildProjectIes !== "function") {
    return blockedSummary("build-project-ies-builder-missing", {
      approvedReferenceGatePassed: true,
      approvedReferenceReady: true,
      projectIesExportApproved: true,
      resolvedRunLengthGatePassed: true,
      fingerprintAlignmentGatePassed: true,
      runLengthMm: runLength.runLengthMm,
      safeFields: {
        sourceInputFingerprint: bundle.sourceInputFingerprint,
        boardDataSourceVersion: bundle.boardDataSourceVersion,
      },
    });
  }

  const safeReference = safeReferenceForBuilder(approved, bundle);
  const safeJob = safeJobForBuilder(job, bundle, runLength.runLengthMm);
  const jobFingerprint = stableFingerprint("safe-ies-first-narrow-project-ies-export-boundary-job", safeJob);

  let builderOutput;
  try {
    builderOutput = source.buildProjectIes(safeReference, runLength.runLengthMm, safeJob);
  } catch {
    return blockedSummary("build-project-ies-builder-call-failed", {
      approvedReferenceGatePassed: true,
      approvedReferenceReady: true,
      projectIesExportApproved: true,
      resolvedRunLengthGatePassed: true,
      fingerprintAlignmentGatePassed: true,
      builderBoundaryCallAttempted: true,
      runLengthMm: runLength.runLengthMm,
      safeFields: {
        sourceInputFingerprint: bundle.sourceInputFingerprint,
        boardDataSourceVersion: bundle.boardDataSourceVersion,
        jobFingerprint,
      },
    });
  }

  if (builderOutput && typeof builderOutput.then === "function") {
    return blockedSummary("build-project-ies-builder-async-output-not-supported", {
      approvedReferenceGatePassed: true,
      approvedReferenceReady: true,
      projectIesExportApproved: true,
      resolvedRunLengthGatePassed: true,
      fingerprintAlignmentGatePassed: true,
      builderBoundaryCallAttempted: true,
      runLengthMm: runLength.runLengthMm,
      safeFields: {
        sourceInputFingerprint: bundle.sourceInputFingerprint,
        boardDataSourceVersion: bundle.boardDataSourceVersion,
        jobFingerprint,
      },
    });
  }

  const reduction = builderReductionFrom(builderOutput);
  if (!reduction.ok) {
    return blockedSummary(reduction.blocker, {
      approvedReferenceGatePassed: true,
      approvedReferenceReady: true,
      projectIesExportApproved: true,
      resolvedRunLengthGatePassed: true,
      fingerprintAlignmentGatePassed: true,
      builderBoundaryCallAttempted: true,
      runLengthMm: runLength.runLengthMm,
      safeFields: {
        sourceInputFingerprint: bundle.sourceInputFingerprint,
        boardDataSourceVersion: bundle.boardDataSourceVersion,
        jobFingerprint,
      },
    });
  }

  const opaqueProjectIesExportBoundaryRef = stableFingerprint("safe-ies-first-narrow-project-ies-export-boundary", {
    approvedLabReferenceFingerprint: approved.approvedLabReferenceFingerprint,
    candidateOutputBundleBoundarySummaryFingerprint: bundle.candidateOutputBundleBoundarySummaryFingerprint,
    runLengthMm: runLength.runLengthMm,
    jobFingerprint,
    builderOutputReductionFingerprint: reduction.builderOutputReductionFingerprint,
  });

  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: READY_STATE,
    blocker: null,
    sourceKind: "safe-project-ies-export-boundary-summary",
    futureOutputKind: "ies-first-narrow-project-ies-export-boundary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    exportBoundaryOnly: true,
    projectIesExportBoundaryOnly: true,
    bundleBoundaryOnly: true,
    builderCallBoundaryOnly: true,
    productionProof: false,
    labProofAuthority: false,
    approvedReferenceGatePassed: true,
    resolvedRunLengthGatePassed: true,
    fingerprintAlignmentGatePassed: true,
    builderBoundaryCallAllowed: true,
    builderBoundaryCallAttempted: true,
    builderBoundaryCallSucceeded: true,
    builderOutputReduced: true,
    approvedReferenceReady: true,
    projectIesExportApproved: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    opaqueBundleBoundaryRef: bundle.opaqueBundleBoundaryRef,
    opaqueProjectIesExportBoundaryRef,
    approvedLabReferenceSchemaId: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
    approvedLabReferenceSchemaVersion: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
    approvedLabReferenceState: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
    approvedLabReferenceFingerprint: approved.approvedLabReferenceFingerprint,
    referenceIesFingerprint: approved.referenceIesFingerprint,
    oneMmLabRecordFingerprint: approved.oneMmLabRecordFingerprint,
    provenanceFingerprint: approved.provenanceFingerprint,
    emergencyEvidenceFingerprint: approved.emergencyEvidenceFingerprint,
    runLengthMm: runLength.runLengthMm,
    jobKind: safeKind(firstPresent(safeJob, ["kind"]), "project-ies-export-boundary-job"),
    jobFingerprint,
    policyFingerprint: approved.policyFingerprint || bundle.policyFingerprint || safeToken(job.policyFingerprint),
    sourceFingerprint: approved.sourceFingerprint || bundle.sourceFingerprint || safeToken(job.sourceFingerprint),
    sourceInputFingerprint: bundle.sourceInputFingerprint,
    boardDataSourceVersion: bundle.boardDataSourceVersion,
    candidateOutputBundleBoundaryContractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
    candidateOutputBundleBoundarySchemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
    candidateOutputBundleBoundarySchemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    candidateOutputBundleBoundaryState: "redacted_ies_first_narrow_candidate_output_bundle_boundary_summary_persisted",
    candidateOutputBundleBoundarySummaryFingerprint: bundle.candidateOutputBundleBoundarySummaryFingerprint,
    bundleBoundaryReady: true,
    bundleBoundaryRecordCount: bundle.bundleBoundaryRecordCount,
    bundleBoundaryEntryCount: bundle.bundleBoundaryEntryCount,
    builderOutputKind: reduction.builderOutputKind,
    builderOutputRecordCount: reduction.builderOutputRecordCount,
    builderOutputEntryCount: reduction.builderOutputEntryCount,
    builderOutputSafeScalarCount: reduction.builderOutputSafeScalarCount,
    builderOutputRedactedPayloadMarkerCount: reduction.builderOutputRedactedPayloadMarkerCount,
    builderOutputReductionFingerprint: reduction.builderOutputReductionFingerprint,
    ...falseFlags(),
    iesFirstNarrowProjectIesExportBoundarySummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint;
  fields.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-summary",
    withoutFingerprint,
  );

  const summary = Object.freeze(orderedSummary(fields));
  let projectIesText;
  try {
    projectIesText = isRecord(builderOutput)
      && Object.prototype.hasOwnProperty.call(builderOutput, "projectIesText")
      ? builderOutput.projectIesText
      : undefined;
  } catch {
    projectIesText = undefined;
  }
  registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource({
    projectIesText,
    boundarySummary: summary,
  });
  builderOutput = null;
  projectIesText = null;

  return summary;
}

export const buildIesFirstNarrowProjectIesExportBoundarySummary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary;
