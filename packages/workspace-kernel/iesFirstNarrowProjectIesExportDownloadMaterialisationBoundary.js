import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES,
} from "./iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowProjectIesExportResultSummary.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID =
  "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-DOWNLOAD-MATERIALISATION-BOUNDARY-1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID =
  "controlstack.runtime.ies-first-narrow-project-ies-export-download-materialisation-boundary.v1";
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION = 1;
export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE = "application/ies";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES = Object.freeze({
  ready: "ies_first_narrow_project_ies_export_download_materialisation_ready",
  blockedFailClosed: "ies_first_narrow_project_ies_export_download_materialisation_blocked_fail_closed",
});

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "sourceKind",
  "outputKind",
  "ephemeral",
  "inMemoryOnly",
  "immutableBlob",
  "sourceTextAccepted",
  "sourceTextDiscarded",
  "materialiserCapabilityInjected",
  "materialiserCapabilityInvoked",
  "materialiserCapabilitySucceeded",
  "filesystemWriteAttempted",
  "persistenceWriteAttempted",
  "runtimeDataMutationAttempted",
  "downloadUrlGenerated",
  "routeOrPostWiringAdded",
  "blob",
  "downloadMetadata",
]);

const READY_RESULT_SUMMARY_STATE = "redacted_ies_first_narrow_project_ies_export_result_summary_persisted";
const DOWNLOAD_FINGERPRINT_PREFIX = "safe-ies-first-narrow-project-ies-export-download-materialisation";
const DOWNLOAD_CONTENT_FINGERPRINT_PREFIX = "safe-ies-first-narrow-project-ies-export-download-content";
const RESULT_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-result-summary:[0-9a-f]{40}$/;
const RESULT_READBACK_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-result-readback-status:[0-9a-f]{40}$/;
const BUNDLE_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary:[0-9a-f]{40}$/;
const PROJECT_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary:[0-9a-f]{40}$/;
const BOUNDARY_READBACK_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-readback-status:[0-9a-f]{40}$/;
const BOUNDARY_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-summary:[0-9a-f]{40}$/;
const BUNDLE_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary-summary:[0-9a-f]{40}$/;
const BUILDER_REDUCTION_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-builder-output-reduction:[0-9a-f]{40}$/;
const JOB_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-job:[0-9a-f]{40}$/;
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s"']*base64|\bbase64\s*[,=:]/i;
const RAW_LM63_PATTERN = /(?:^|\n)\s*(?:IESNA|IES):LM-63|\bTILT\s*=/i;
const FILE_PATH_PATTERN = /(?:^|[\s"'])[^\s"']+[\\/][^\s"']+(?:$|[\s"'])/i;
const MAX_LM63_BYTES = 2_000_000;
const MAX_LM63_LINE_LENGTH = 4096;
const MAX_VERTICAL_ANGLE_COUNT = 1001;
const MAX_HORIZONTAL_ANGLE_COUNT = 361;
const MAX_CANDELA_VALUE_COUNT = 361_361;

const REQUIRED_READY_TRUE_FLAGS = Object.freeze([
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
]);

const SAFE_CAPABILITY_FIELDS = Object.freeze([
  "sourceKind",
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
  "projectIesExportBoundaryReadbackFingerprint",
  "projectIesExportBoundarySummaryFingerprint",
  "projectIesExportResultSummaryFingerprint",
  "iesFirstNarrowProjectIesExportResultReadbackFingerprint",
]);

const SAFE_STATUS_TOKEN_FIELDS = Object.freeze([
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

const SAFE_STATUS_INTEGER_FIELDS = Object.freeze([
  "runLengthMm",
  "builderOutputRecordCount",
  "builderOutputEntryCount",
  "builderOutputSafeScalarCount",
  "builderOutputRedactedPayloadMarkerCount",
  "projectIesExportBoundaryReadbackStatusSchemaVersion",
  "projectIesExportBoundarySummarySchemaVersion",
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function safeToken(value) {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (!token
    || PRIVATE_VALUE_PATTERN.test(token)
    || DATA_BASE64_PATTERN.test(token)
    || FILE_PATH_PATTERN.test(token)) return null;
  return SAFE_TOKEN_PATTERN.test(token) ? token : null;
}

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function orderedResult(fields) {
  return Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function blockedResult(blocker, {
  capabilityInjected = false,
  capabilityInvoked = false,
  sourceTextAccepted = false,
  sourceTextDiscarded = false,
} = {}) {
  return Object.freeze(orderedResult({
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
    state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES.blockedFailClosed,
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: safeToken(blocker) || "project-ies-download-materialisation-blocked",
    sourceKind: "ready-project-ies-export-result-readback-status-only",
    outputKind: "ephemeral-in-memory-lm63-download-blob",
    ephemeral: true,
    inMemoryOnly: true,
    immutableBlob: false,
    sourceTextAccepted,
    sourceTextDiscarded,
    materialiserCapabilityInjected: capabilityInjected,
    materialiserCapabilityInvoked: capabilityInvoked,
    materialiserCapabilitySucceeded: false,
    filesystemWriteAttempted: false,
    persistenceWriteAttempted: false,
    runtimeDataMutationAttempted: false,
    downloadUrlGenerated: false,
    routeOrPostWiringAdded: false,
    blob: null,
    downloadMetadata: null,
  }));
}

function validateReadyResultReadbackStatus(status) {
  if (!isPlainObject(status) || Object.keys(status).length === 0) {
    return "project-ies-export-result-readback-status-missing";
  }
  for (const value of Object.values(status)) {
    if (value !== null && !["string", "number", "boolean"].includes(typeof value)) {
      return "project-ies-export-result-readback-status-non-scalar-field";
    }
    if (typeof value === "string"
      && (PRIVATE_VALUE_PATTERN.test(value)
        || DATA_BASE64_PATTERN.test(value)
        || RAW_LM63_PATTERN.test(value)
        || FILE_PATH_PATTERN.test(value))) {
      return "project-ies-export-result-readback-status-unsafe-string";
    }
  }

  if (status.schemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID
    || status.schemaVersion !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION) {
    return "project-ies-export-result-readback-status-schema-mismatch";
  }
  if (status.state !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.ready
    || status.readiness !== "ready"
    || status.ready !== true
    || status.failClosed !== false
    || status.blocker !== null) {
    return "project-ies-export-result-readback-status-not-ready";
  }
  if (status.summaryPresent !== true
    || status.summarySchemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID
    || status.summarySchemaVersion !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION
    || status.summaryContractId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID
    || status.summaryState !== READY_RESULT_SUMMARY_STATE
    || !RESULT_SUMMARY_FINGERPRINT_PATTERN.test(String(status.summaryFingerprint || ""))) {
    return "project-ies-export-result-readback-summary-identity-mismatch";
  }

  for (const key of REQUIRED_READY_TRUE_FLAGS) {
    if (status[key] !== true) return `project-ies-export-result-readback-required-flag-not-true-${key}`;
  }
  if (status.productionProof !== false || status.labProofAuthority !== false) {
    return "project-ies-export-result-readback-attempted-proof-authority";
  }
  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS) {
    if (status[key] !== false) return `project-ies-export-result-readback-required-flag-not-false-${key}`;
  }
  for (const key of SAFE_STATUS_TOKEN_FIELDS) {
    if (!safeToken(status[key])) return `project-ies-export-result-readback-token-invalid-${key}`;
  }
  for (const key of SAFE_STATUS_INTEGER_FIELDS) {
    if (positiveInteger(status[key]) === null) return `project-ies-export-result-readback-count-invalid-${key}`;
  }

  if (!BUNDLE_BOUNDARY_REF_PATTERN.test(status.opaqueBundleBoundaryRef)) return "project-ies-export-result-readback-bundle-ref-invalid";
  if (!PROJECT_BOUNDARY_REF_PATTERN.test(status.opaqueProjectIesExportBoundaryRef)) return "project-ies-export-result-readback-project-boundary-ref-invalid";
  if (!BOUNDARY_READBACK_FINGERPRINT_PATTERN.test(status.projectIesExportBoundaryReadbackFingerprint)) return "project-ies-export-result-readback-boundary-readback-fingerprint-invalid";
  if (!BOUNDARY_SUMMARY_FINGERPRINT_PATTERN.test(status.projectIesExportBoundarySummaryFingerprint)) return "project-ies-export-result-readback-boundary-summary-fingerprint-invalid";
  if (!BUNDLE_SUMMARY_FINGERPRINT_PATTERN.test(status.candidateOutputBundleBoundarySummaryFingerprint)) return "project-ies-export-result-readback-bundle-summary-fingerprint-invalid";
  if (!BUILDER_REDUCTION_FINGERPRINT_PATTERN.test(status.builderOutputReductionFingerprint)) return "project-ies-export-result-readback-builder-reduction-fingerprint-invalid";
  if (!JOB_FINGERPRINT_PATTERN.test(status.jobFingerprint)) return "project-ies-export-result-readback-job-fingerprint-invalid";
  if (!RESULT_READBACK_FINGERPRINT_PATTERN.test(String(status.iesFirstNarrowProjectIesExportResultReadbackFingerprint || ""))) {
    return "project-ies-export-result-readback-fingerprint-invalid";
  }

  const fingerprintSource = { ...status };
  delete fingerprintSource.iesFirstNarrowProjectIesExportResultReadbackFingerprint;
  const expectedFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-result-readback-status",
    fingerprintSource,
  );
  if (status.iesFirstNarrowProjectIesExportResultReadbackFingerprint !== expectedFingerprint) {
    return "project-ies-export-result-readback-fingerprint-mismatch";
  }
  return null;
}

function buildCapabilityInput(status) {
  const fields = {
    sourceKind: "ready-project-ies-export-result-readback-status-only",
    opaqueBundleBoundaryRef: status.opaqueBundleBoundaryRef,
    opaqueProjectIesExportBoundaryRef: status.opaqueProjectIesExportBoundaryRef,
    runLengthMm: status.runLengthMm,
    builderOutputKind: status.builderOutputKind,
    builderOutputRecordCount: status.builderOutputRecordCount,
    builderOutputEntryCount: status.builderOutputEntryCount,
    builderOutputSafeScalarCount: status.builderOutputSafeScalarCount,
    builderOutputRedactedPayloadMarkerCount: status.builderOutputRedactedPayloadMarkerCount,
    policyFingerprint: status.policyFingerprint,
    sourceFingerprint: status.sourceFingerprint,
    sourceInputFingerprint: status.sourceInputFingerprint,
    boardDataSourceVersion: status.boardDataSourceVersion,
    jobKind: status.jobKind,
    jobFingerprint: status.jobFingerprint,
    builderOutputReductionFingerprint: status.builderOutputReductionFingerprint,
    candidateOutputBundleBoundarySummaryFingerprint: status.candidateOutputBundleBoundarySummaryFingerprint,
    projectIesExportBoundaryReadbackFingerprint: status.projectIesExportBoundaryReadbackFingerprint,
    projectIesExportBoundarySummaryFingerprint: status.projectIesExportBoundarySummaryFingerprint,
    projectIesExportResultSummaryFingerprint: status.summaryFingerprint,
    iesFirstNarrowProjectIesExportResultReadbackFingerprint: status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
  };
  return Object.freeze(Object.fromEntries(SAFE_CAPABILITY_FIELDS.map((key) => [key, fields[key]])));
}

function parseFiniteNumber(token) {
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?$/.test(token)) return null;
  const value = Number(token);
  return Number.isFinite(value) ? value : null;
}

function strictlyNonDecreasing(values) {
  for (let index = 1; index < values.length; index += 1) {
    if (values[index] < values[index - 1]) return false;
  }
  return true;
}

function validateLm63Text(text) {
  if (typeof text !== "string") return "project-ies-download-materialiser-result-not-text";
  if (!text || text.charCodeAt(0) === 0xfeff) return "project-ies-download-materialiser-result-empty-or-bom-prefixed";
  if (/\r(?!\n)/.test(text)) return "project-ies-download-materialiser-result-lone-carriage-return";
  if (/[^\x09\x0A\x0D\x20-\x7E]/.test(text)) return "project-ies-download-materialiser-result-non-ascii";
  if (PRIVATE_VALUE_PATTERN.test(text) || DATA_BASE64_PATTERN.test(text)) {
    return "project-ies-download-materialiser-result-private-or-base64-content";
  }

  const byteLength = new TextEncoder().encode(text).byteLength;
  if (byteLength <= 0 || byteLength > MAX_LM63_BYTES) return "project-ies-download-materialiser-result-size-invalid";

  const lines = text.split(/\r?\n/);
  if (lines.some((line) => line.length > MAX_LM63_LINE_LENGTH)) {
    return "project-ies-download-materialiser-result-line-too-long";
  }
  const firstLine = lines[0].trim();
  if (!["IESNA:LM-63-1995", "IESNA:LM-63-2002", "IES:LM-63-2019"].includes(firstLine)) {
    return "project-ies-download-materialiser-result-header-invalid";
  }

  const tiltIndexes = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s*TILT\s*=/.test(lines[index])) tiltIndexes.push(index);
  }
  if (tiltIndexes.length !== 1 || lines[tiltIndexes[0]].trim() !== "TILT=NONE") {
    return "project-ies-download-materialiser-result-tilt-not-none";
  }

  const numericText = lines.slice(tiltIndexes[0] + 1).join(" ").trim();
  if (!numericText) return "project-ies-download-materialiser-result-numeric-payload-missing";
  const tokens = numericText.split(/\s+/);
  const numbers = tokens.map(parseFiniteNumber);
  if (numbers.some((value) => value === null)) return "project-ies-download-materialiser-result-numeric-payload-invalid";
  if (numbers.length < 17) return "project-ies-download-materialiser-result-numeric-payload-too-short";

  const [
    lampCount,
    lumensPerLamp,
    candelaMultiplier,
    verticalAngleCount,
    horizontalAngleCount,
    photometricType,
    unitsType,
    width,
    length,
    height,
    ballastFactor,
    futureUse,
    inputWatts,
  ] = numbers;

  if (!Number.isInteger(lampCount) || lampCount < 1
    || lumensPerLamp < 0
    || candelaMultiplier <= 0
    || !Number.isInteger(verticalAngleCount) || verticalAngleCount < 1 || verticalAngleCount > MAX_VERTICAL_ANGLE_COUNT
    || !Number.isInteger(horizontalAngleCount) || horizontalAngleCount < 1 || horizontalAngleCount > MAX_HORIZONTAL_ANGLE_COUNT
    || ![1, 2, 3].includes(photometricType)
    || ![1, 2].includes(unitsType)
    || width < 0 || length < 0 || height < 0
    || ballastFactor < 0 || futureUse < 0 || inputWatts < 0) {
    return "project-ies-download-materialiser-result-header-values-invalid";
  }

  const candelaValueCount = verticalAngleCount * horizontalAngleCount;
  if (candelaValueCount > MAX_CANDELA_VALUE_COUNT) {
    return "project-ies-download-materialiser-result-candela-count-too-large";
  }
  const expectedNumberCount = 13 + verticalAngleCount + horizontalAngleCount + candelaValueCount;
  if (numbers.length !== expectedNumberCount) {
    return "project-ies-download-materialiser-result-numeric-count-mismatch";
  }

  const verticalAngles = numbers.slice(13, 13 + verticalAngleCount);
  const horizontalAngles = numbers.slice(13 + verticalAngleCount, 13 + verticalAngleCount + horizontalAngleCount);
  const candelaValues = numbers.slice(13 + verticalAngleCount + horizontalAngleCount);
  if (!strictlyNonDecreasing(verticalAngles)
    || verticalAngles.some((value) => value < 0 || value > 180)
    || !strictlyNonDecreasing(horizontalAngles)
    || horizontalAngles.some((value) => value < 0 || value > 360)
    || candelaValues.some((value) => value < 0)) {
    return "project-ies-download-materialiser-result-angle-or-candela-values-invalid";
  }
  return null;
}

function buildDownloadMetadata(status, blob, contentFingerprint) {
  const suffix = contentFingerprint.slice(-12);
  const filename = `controlstack-project-ies-${status.runLengthMm}mm-${suffix}.ies`;
  const fingerprintSource = {
    filename,
    mediaType: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
    extension: ".ies",
    byteLength: blob.size,
    contentFingerprint,
    sourceResultReadbackFingerprint: status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
  };
  return Object.freeze({
    ...fingerprintSource,
    materialisationFingerprint: stableFingerprint(DOWNLOAD_FINGERPRINT_PREFIX, fingerprintSource),
  });
}

export async function materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary(input = {}) {
  const status = input?.iesFirstNarrowProjectIesExportResultReadbackStatus;
  const capability = input?.materialiseProjectIesDownload;
  const statusBlocker = validateReadyResultReadbackStatus(status);
  if (statusBlocker) return blockedResult(statusBlocker);
  if (typeof capability !== "function") {
    return blockedResult("project-ies-download-materialiser-capability-missing");
  }

  const capabilityInput = buildCapabilityInput(status);
  let sourceText = null;
  try {
    sourceText = await capability(capabilityInput);
  } catch {
    sourceText = null;
    return blockedResult("project-ies-download-materialiser-capability-failed", {
      capabilityInjected: true,
      capabilityInvoked: true,
    });
  }

  const textBlocker = validateLm63Text(sourceText);
  if (textBlocker) {
    sourceText = null;
    return blockedResult(textBlocker, {
      capabilityInjected: true,
      capabilityInvoked: true,
      sourceTextAccepted: false,
      sourceTextDiscarded: true,
    });
  }

  const contentFingerprint = stableFingerprint(DOWNLOAD_CONTENT_FINGERPRINT_PREFIX, sourceText);
  const blob = Object.freeze(new Blob([sourceText], {
    type: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
  }));
  const downloadMetadata = buildDownloadMetadata(status, blob, contentFingerprint);
  sourceText = null;

  return Object.freeze(orderedResult({
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
    state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    sourceKind: "ready-project-ies-export-result-readback-status-only",
    outputKind: "ephemeral-in-memory-lm63-download-blob",
    ephemeral: true,
    inMemoryOnly: true,
    immutableBlob: true,
    sourceTextAccepted: true,
    sourceTextDiscarded: true,
    materialiserCapabilityInjected: true,
    materialiserCapabilityInvoked: true,
    materialiserCapabilitySucceeded: true,
    filesystemWriteAttempted: false,
    persistenceWriteAttempted: false,
    runtimeDataMutationAttempted: false,
    downloadUrlGenerated: false,
    routeOrPostWiringAdded: false,
    blob,
    downloadMetadata,
  }));
}

export const buildRuntimeIesFirstNarrowProjectIesExportDownloadMaterialisationBoundary =
  materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary;
export const materialiseIesFirstNarrowProjectIesExportDownloadBoundary =
  materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary;
