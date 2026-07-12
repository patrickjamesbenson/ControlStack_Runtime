import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISER_CAPABILITY_ID =
  "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-DOWNLOAD-MATERIALISER-CAPABILITY-1";

const SOURCE_KEY_FINGERPRINT_PREFIX =
  "safe-ies-first-narrow-project-ies-export-download-materialiser-source-key";
const SOURCE_CONTENT_FINGERPRINT_PREFIX =
  "safe-ies-first-narrow-project-ies-export-download-materialiser-source-content";
const READY_BOUNDARY_STATE =
  "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready";
const BOUNDARY_SCHEMA_ID =
  "controlstack.runtime.ies-first-narrow-project-ies-export-boundary-summary.v1";
const BOUNDARY_CONTRACT_ID =
  "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-BOUNDARY-1";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s"']*base64|\bbase64\s*[,=:]/i;
const FILE_PATH_PATTERN = /(?:^|[\s"'])[^\s"']+[\\/][^\s"']+(?:$|[\s"'])/i;
const BUNDLE_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary:[0-9a-f]{40}$/;
const PROJECT_BOUNDARY_REF_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary:[0-9a-f]{40}$/;
const BOUNDARY_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-summary:[0-9a-f]{40}$/;
const BOUNDARY_READBACK_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-readback-status:[0-9a-f]{40}$/;
const RESULT_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-result-summary:[0-9a-f]{40}$/;
const RESULT_READBACK_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-result-readback-status:[0-9a-f]{40}$/;
const BUNDLE_SUMMARY_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-candidate-output-bundle-boundary-summary:[0-9a-f]{40}$/;
const BUILDER_REDUCTION_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-builder-output-reduction:[0-9a-f]{40}$/;
const JOB_FINGERPRINT_PATTERN = /^safe-ies-first-narrow-project-ies-export-boundary-job:[0-9a-f]{40}$/;
const MAX_LM63_BYTES = 2_000_000;
const MAX_LM63_LINE_LENGTH = 4096;
const MAX_VERTICAL_ANGLE_COUNT = 1001;
const MAX_HORIZONTAL_ANGLE_COUNT = 361;
const MAX_CANDELA_VALUE_COUNT = 361_361;

const CAPABILITY_INPUT_FIELDS = Object.freeze([
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

const REGISTERED_IDENTITY_FIELDS = Object.freeze([
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
  "projectIesExportBoundarySummaryFingerprint",
]);

const registeredSourcesByProjectBoundaryRef = new Map();
const collidedProjectBoundaryRefs = new Set();

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

function nonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
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
  if (typeof text !== "string") return "project-ies-download-materialiser-registration-not-text";
  if (!text || text.charCodeAt(0) === 0xfeff) {
    return "project-ies-download-materialiser-registration-empty-or-bom-prefixed";
  }
  if (/\r(?!\n)/.test(text)) return "project-ies-download-materialiser-registration-lone-carriage-return";
  if (/[^\x09\x0A\x0D\x20-\x7E]/.test(text)) {
    return "project-ies-download-materialiser-registration-non-ascii";
  }
  if (PRIVATE_VALUE_PATTERN.test(text) || DATA_BASE64_PATTERN.test(text)) {
    return "project-ies-download-materialiser-registration-private-or-base64-content";
  }

  const byteLength = new TextEncoder().encode(text).byteLength;
  if (byteLength <= 0 || byteLength > MAX_LM63_BYTES) {
    return "project-ies-download-materialiser-registration-size-invalid";
  }

  const lines = text.split(/\r?\n/);
  if (lines.some((line) => line.length > MAX_LM63_LINE_LENGTH)) {
    return "project-ies-download-materialiser-registration-line-too-long";
  }
  const firstLine = lines[0].trim();
  if (!["IESNA:LM-63-1995", "IESNA:LM-63-2002", "IES:LM-63-2019"].includes(firstLine)) {
    return "project-ies-download-materialiser-registration-header-invalid";
  }

  const tiltIndexes = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (/^\s*TILT\s*=/.test(lines[index])) tiltIndexes.push(index);
  }
  if (tiltIndexes.length !== 1 || lines[tiltIndexes[0]].trim() !== "TILT=NONE") {
    return "project-ies-download-materialiser-registration-tilt-not-none";
  }

  const numericText = lines.slice(tiltIndexes[0] + 1).join(" ").trim();
  if (!numericText) return "project-ies-download-materialiser-registration-numeric-payload-missing";
  const tokens = numericText.split(/\s+/);
  const numbers = tokens.map(parseFiniteNumber);
  if (numbers.some((value) => value === null)) {
    return "project-ies-download-materialiser-registration-numeric-payload-invalid";
  }
  if (numbers.length < 17) {
    return "project-ies-download-materialiser-registration-numeric-payload-too-short";
  }

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
    return "project-ies-download-materialiser-registration-header-values-invalid";
  }

  const candelaValueCount = verticalAngleCount * horizontalAngleCount;
  if (candelaValueCount > MAX_CANDELA_VALUE_COUNT) {
    return "project-ies-download-materialiser-registration-candela-count-too-large";
  }
  const expectedNumberCount = 13 + verticalAngleCount + horizontalAngleCount + candelaValueCount;
  if (numbers.length !== expectedNumberCount) {
    return "project-ies-download-materialiser-registration-numeric-count-mismatch";
  }

  const verticalAngles = numbers.slice(13, 13 + verticalAngleCount);
  const horizontalAngles = numbers.slice(13 + verticalAngleCount, 13 + verticalAngleCount + horizontalAngleCount);
  const candelaValues = numbers.slice(13 + verticalAngleCount + horizontalAngleCount);
  if (!strictlyNonDecreasing(verticalAngles)
    || verticalAngles.some((value) => value < 0 || value > 180)
    || !strictlyNonDecreasing(horizontalAngles)
    || horizontalAngles.some((value) => value < 0 || value > 360)
    || candelaValues.some((value) => value < 0)) {
    return "project-ies-download-materialiser-registration-angle-or-candela-values-invalid";
  }
  return null;
}

function extractProjectBoundaryRef(value) {
  const token = safeToken(value);
  return token && PROJECT_BOUNDARY_REF_PATTERN.test(token) ? token : null;
}

function identityFromBoundarySummary(boundarySummary) {
  if (!isPlainObject(boundarySummary)
    || boundarySummary.schemaId !== BOUNDARY_SCHEMA_ID
    || boundarySummary.schemaVersion !== 1
    || boundarySummary.contractId !== BOUNDARY_CONTRACT_ID
    || boundarySummary.state !== READY_BOUNDARY_STATE
    || boundarySummary.blocker !== null
    || boundarySummary.sourceBacked !== true
    || boundarySummary.sourceAnchorOnly !== true
    || boundarySummary.opaqueReferenceOnly !== true) return null;

  const identity = {
    opaqueBundleBoundaryRef: safeToken(boundarySummary.opaqueBundleBoundaryRef),
    opaqueProjectIesExportBoundaryRef: safeToken(boundarySummary.opaqueProjectIesExportBoundaryRef),
    runLengthMm: positiveInteger(boundarySummary.runLengthMm),
    builderOutputKind: safeToken(boundarySummary.builderOutputKind),
    builderOutputRecordCount: nonNegativeInteger(boundarySummary.builderOutputRecordCount),
    builderOutputEntryCount: nonNegativeInteger(boundarySummary.builderOutputEntryCount),
    builderOutputSafeScalarCount: nonNegativeInteger(boundarySummary.builderOutputSafeScalarCount),
    builderOutputRedactedPayloadMarkerCount: nonNegativeInteger(boundarySummary.builderOutputRedactedPayloadMarkerCount),
    policyFingerprint: safeToken(boundarySummary.policyFingerprint),
    sourceFingerprint: safeToken(boundarySummary.sourceFingerprint),
    sourceInputFingerprint: safeToken(boundarySummary.sourceInputFingerprint),
    boardDataSourceVersion: safeToken(boundarySummary.boardDataSourceVersion),
    jobKind: safeToken(boundarySummary.jobKind),
    jobFingerprint: safeToken(boundarySummary.jobFingerprint),
    builderOutputReductionFingerprint: safeToken(boundarySummary.builderOutputReductionFingerprint),
    candidateOutputBundleBoundarySummaryFingerprint:
      safeToken(boundarySummary.candidateOutputBundleBoundarySummaryFingerprint),
    projectIesExportBoundarySummaryFingerprint:
      safeToken(boundarySummary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint),
  };

  if (!BUNDLE_BOUNDARY_REF_PATTERN.test(String(identity.opaqueBundleBoundaryRef || ""))
    || !PROJECT_BOUNDARY_REF_PATTERN.test(String(identity.opaqueProjectIesExportBoundaryRef || ""))
    || !BUNDLE_SUMMARY_FINGERPRINT_PATTERN.test(String(identity.candidateOutputBundleBoundarySummaryFingerprint || ""))
    || !BUILDER_REDUCTION_FINGERPRINT_PATTERN.test(String(identity.builderOutputReductionFingerprint || ""))
    || !JOB_FINGERPRINT_PATTERN.test(String(identity.jobFingerprint || ""))
    || !BOUNDARY_SUMMARY_FINGERPRINT_PATTERN.test(String(identity.projectIesExportBoundarySummaryFingerprint || ""))
    || Object.values(identity).some((value) => value === null)) return null;

  return Object.freeze(Object.fromEntries(
    REGISTERED_IDENTITY_FIELDS.map((key) => [key, identity[key]]),
  ));
}

function validateCapabilityInput(input) {
  if (!isPlainObject(input)) return null;
  const keys = Object.keys(input);
  if (keys.length !== CAPABILITY_INPUT_FIELDS.length
    || CAPABILITY_INPUT_FIELDS.some((key) => !Object.prototype.hasOwnProperty.call(input, key))
    || keys.some((key) => !CAPABILITY_INPUT_FIELDS.includes(key))) return null;
  if (input.sourceKind !== "ready-project-ies-export-result-readback-status-only") return null;

  const identity = {
    opaqueBundleBoundaryRef: safeToken(input.opaqueBundleBoundaryRef),
    opaqueProjectIesExportBoundaryRef: safeToken(input.opaqueProjectIesExportBoundaryRef),
    runLengthMm: positiveInteger(input.runLengthMm),
    builderOutputKind: safeToken(input.builderOutputKind),
    builderOutputRecordCount: nonNegativeInteger(input.builderOutputRecordCount),
    builderOutputEntryCount: nonNegativeInteger(input.builderOutputEntryCount),
    builderOutputSafeScalarCount: nonNegativeInteger(input.builderOutputSafeScalarCount),
    builderOutputRedactedPayloadMarkerCount: nonNegativeInteger(input.builderOutputRedactedPayloadMarkerCount),
    policyFingerprint: safeToken(input.policyFingerprint),
    sourceFingerprint: safeToken(input.sourceFingerprint),
    sourceInputFingerprint: safeToken(input.sourceInputFingerprint),
    boardDataSourceVersion: safeToken(input.boardDataSourceVersion),
    jobKind: safeToken(input.jobKind),
    jobFingerprint: safeToken(input.jobFingerprint),
    builderOutputReductionFingerprint: safeToken(input.builderOutputReductionFingerprint),
    candidateOutputBundleBoundarySummaryFingerprint:
      safeToken(input.candidateOutputBundleBoundarySummaryFingerprint),
    projectIesExportBoundarySummaryFingerprint:
      safeToken(input.projectIesExportBoundarySummaryFingerprint),
  };

  if (!BUNDLE_BOUNDARY_REF_PATTERN.test(String(identity.opaqueBundleBoundaryRef || ""))
    || !PROJECT_BOUNDARY_REF_PATTERN.test(String(identity.opaqueProjectIesExportBoundaryRef || ""))
    || !BUNDLE_SUMMARY_FINGERPRINT_PATTERN.test(String(identity.candidateOutputBundleBoundarySummaryFingerprint || ""))
    || !BUILDER_REDUCTION_FINGERPRINT_PATTERN.test(String(identity.builderOutputReductionFingerprint || ""))
    || !JOB_FINGERPRINT_PATTERN.test(String(identity.jobFingerprint || ""))
    || !BOUNDARY_SUMMARY_FINGERPRINT_PATTERN.test(String(identity.projectIesExportBoundarySummaryFingerprint || ""))
    || !BOUNDARY_READBACK_FINGERPRINT_PATTERN.test(String(input.projectIesExportBoundaryReadbackFingerprint || ""))
    || !RESULT_SUMMARY_FINGERPRINT_PATTERN.test(String(input.projectIesExportResultSummaryFingerprint || ""))
    || !RESULT_READBACK_FINGERPRINT_PATTERN.test(String(input.iesFirstNarrowProjectIesExportResultReadbackFingerprint || ""))
    || Object.values(identity).some((value) => value === null)) return null;

  return Object.freeze(Object.fromEntries(
    REGISTERED_IDENTITY_FIELDS.map((key) => [key, identity[key]]),
  ));
}

function identityKey(identity) {
  return stableFingerprint(SOURCE_KEY_FINGERPRINT_PREFIX, identity);
}

function invalidateProjectBoundaryRef(projectBoundaryRef) {
  if (!projectBoundaryRef) return;
  registeredSourcesByProjectBoundaryRef.delete(projectBoundaryRef);
}

export function registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource({
  projectIesText,
  boundarySummary,
} = {}) {
  const fallbackProjectBoundaryRef = extractProjectBoundaryRef(
    boundarySummary?.opaqueProjectIesExportBoundaryRef,
  );
  const identity = identityFromBoundarySummary(boundarySummary);
  const projectBoundaryRef = identity?.opaqueProjectIesExportBoundaryRef
    || fallbackProjectBoundaryRef;

  if (!identity) {
    invalidateProjectBoundaryRef(projectBoundaryRef);
    return false;
  }

  const textBlocker = validateLm63Text(projectIesText);
  if (textBlocker) {
    invalidateProjectBoundaryRef(projectBoundaryRef);
    return false;
  }
  if (collidedProjectBoundaryRefs.has(projectBoundaryRef)) return false;

  const key = identityKey(identity);
  const contentFingerprint = stableFingerprint(
    SOURCE_CONTENT_FINGERPRINT_PREFIX,
    projectIesText,
  );
  const existing = registeredSourcesByProjectBoundaryRef.get(projectBoundaryRef);
  if (existing) {
    if (existing.key !== key || existing.contentFingerprint !== contentFingerprint) {
      registeredSourcesByProjectBoundaryRef.delete(projectBoundaryRef);
      collidedProjectBoundaryRefs.add(projectBoundaryRef);
      return false;
    }
    return true;
  }

  registeredSourcesByProjectBoundaryRef.set(projectBoundaryRef, Object.freeze({
    key,
    contentFingerprint,
    projectIesText,
  }));
  return true;
}

export function materialiseRuntimeIesFirstNarrowProjectIesDownload(input = {}) {
  const identity = validateCapabilityInput(input);
  if (!identity) {
    throw new Error("project-ies-download-materialiser-capability-input-invalid");
  }

  const projectBoundaryRef = identity.opaqueProjectIesExportBoundaryRef;
  if (collidedProjectBoundaryRefs.has(projectBoundaryRef)) {
    throw new Error("project-ies-download-materialiser-registration-collision");
  }

  const registered = registeredSourcesByProjectBoundaryRef.get(projectBoundaryRef);
  if (!registered) {
    throw new Error("project-ies-download-materialiser-registration-missing");
  }
  if (registered.key !== identityKey(identity)) {
    throw new Error("project-ies-download-materialiser-scalar-identity-mismatch");
  }
  if (validateLm63Text(registered.projectIesText)) {
    registeredSourcesByProjectBoundaryRef.delete(projectBoundaryRef);
    throw new Error("project-ies-download-materialiser-registration-malformed");
  }
  return registered.projectIesText;
}

export const materialiseProjectIesDownload =
  materialiseRuntimeIesFirstNarrowProjectIesDownload;
export const registerIesFirstNarrowProjectIesExportDownloadMaterialiserSource =
  registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource;
