import {
  buildRuntimeIesFirstNarrowCandidateOutputArtifactMaterialisationSummary,
  findUnsafeIesFirstNarrowCandidateOutputArtifactMaterialisationInput,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowCandidateOutputArtifactMaterialisationSummary.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID = "RUNTIME-IES-FIRST-NARROW-CANDIDATE-OUTPUT-BUNDLE-BOUNDARY-WRITE-1";
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID = "controlstack.runtime.ies-first-narrow-candidate-output-bundle-boundary-summary.v1";
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputBundleBoundarySummary";

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_REQUIRED_FALSE_FLAGS = Object.freeze([
  ...new Set([
    ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS,
    "outputBundleBoundaryEnabled",
    "outputBundleBoundaryAttempted",
    "outputBundleBoundaryWritten",
    "outputBundleGenerationEnabled",
    "outputBundleGenerationAttempted",
    "outputBundleGenerated",
    "outputBundleFileOutputEnabled",
    "outputBundleFileOutputWritten",
    "outputBundleBodyReturned",
    "rawOutputBundleReturned",
  ]),
]);

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "consumerModuleId",
  "state",
  "sourceKind",
  "futureOutputKind",
  "summaryOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "redacted",
  "machineValueSafe",
  "readOnly",
  "deterministicOnly",
  "bundleBoundaryOnly",
  "materialisationBoundaryOnly",
  "artifactRefOnly",
  "artifactPlanOnly",
  "candidateOutputOnly",
  "productionProof",
  "labProofAuthority",
  "sourceBacked",
  "sourceAnchorOnly",
  "opaqueReferenceOnly",
  "opaqueArtifactRef",
  "opaqueMaterialisationBoundaryRef",
  "opaqueBundleBoundaryRef",
  "runTableFirstNarrowRowsReady",
  "iesFirstNarrowMetadataHandoffReady",
  "iesFirstNarrowCandidateOutputSummaryReady",
  "iesFirstNarrowCandidateOutputManifestSummaryReady",
  "iesFirstNarrowCandidateOutputDetailSummaryReady",
  "iesFirstNarrowCandidateOutputArtifactPlanSummaryReady",
  "iesFirstNarrowCandidateOutputArtifactRefSummaryReady",
  "iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryReady",
  "readyForArtifactRefBoundary",
  "readyForMaterialisationBoundary",
  "readyForBundleBoundary",
  "readyForFutureOutput",
  "artifactRefJoined",
  "artifactMaterialisationBoundaryJoined",
  "outputBundleBoundaryJoined",
  "sourceRowsIncluded",
  "candidateOutputDetailsIncluded",
  "manifestListIncluded",
  "detailListIncluded",
  "artifactListIncluded",
  "artifactPlanListIncluded",
  "rawArtifactIncluded",
  "outputBundleIncluded",
  "rawOutputBundleIncluded",
  "sourceRunTableRowCount",
  "candidateOutputRecordCount",
  "manifestRecordCount",
  "detailRecordCount",
  "artifactPlanRecordCount",
  "artifactPlanEntryCount",
  "artifactRefRecordCount",
  "artifactRefEntryCount",
  "artifactMaterialisationRecordCount",
  "artifactMaterialisationEntryCount",
  "outputBundleRecordCount",
  "outputBundleEntryCount",
  "firstBundleBoundaryEntryKind",
  "firstArtifactMaterialisationEntryKind",
  "firstArtifactRefEntryKind",
  "firstArtifactPlanEntryKind",
  "firstDetailEntryKind",
  "firstCandidateOutputKind",
  "firstManifestEntryKind",
  "firstRowKey",
  "firstRowKind",
  "firstRunKey",
  "firstRunIndex",
  "firstRowAccepted",
  "firstRowEngineVerified",
  "firstRowBoardCount",
  "firstRowSegmentCount",
  "firstRowZoneCount",
  "firstRowClipPointsCount",
  "firstRowSuspensionPointsCount",
  "firstRowGearTrayPlanCount",
  "firstRowReservedRangesCount",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "runTableFirstNarrowRowsSchemaId",
  "runTableFirstNarrowRowsSchemaVersion",
  "runTableFirstNarrowRowsState",
  "iesFirstNarrowMetadataHandoffContractId",
  "iesFirstNarrowMetadataHandoffSchemaId",
  "iesFirstNarrowMetadataHandoffSchemaVersion",
  "iesFirstNarrowMetadataHandoffState",
  "iesFirstNarrowMetadataHandoffSummaryFingerprint",
  "iesFirstNarrowCandidateOutputContractId",
  "iesFirstNarrowCandidateOutputSchemaId",
  "iesFirstNarrowCandidateOutputSchemaVersion",
  "iesFirstNarrowCandidateOutputState",
  "iesFirstNarrowCandidateOutputSummaryFingerprint",
  "iesFirstNarrowCandidateOutputManifestContractId",
  "iesFirstNarrowCandidateOutputManifestSchemaId",
  "iesFirstNarrowCandidateOutputManifestSchemaVersion",
  "iesFirstNarrowCandidateOutputManifestState",
  "iesFirstNarrowCandidateOutputManifestSummaryFingerprint",
  "iesFirstNarrowCandidateOutputDetailContractId",
  "iesFirstNarrowCandidateOutputDetailSchemaId",
  "iesFirstNarrowCandidateOutputDetailSchemaVersion",
  "iesFirstNarrowCandidateOutputDetailState",
  "iesFirstNarrowCandidateOutputDetailSummaryFingerprint",
  "iesFirstNarrowCandidateOutputArtifactPlanContractId",
  "iesFirstNarrowCandidateOutputArtifactPlanSchemaId",
  "iesFirstNarrowCandidateOutputArtifactPlanSchemaVersion",
  "iesFirstNarrowCandidateOutputArtifactPlanState",
  "iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint",
  "iesFirstNarrowCandidateOutputArtifactRefContractId",
  "iesFirstNarrowCandidateOutputArtifactRefSchemaId",
  "iesFirstNarrowCandidateOutputArtifactRefSchemaVersion",
  "iesFirstNarrowCandidateOutputArtifactRefState",
  "iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint",
  "iesFirstNarrowCandidateOutputArtifactMaterialisationContractId",
  "iesFirstNarrowCandidateOutputArtifactMaterialisationSchemaId",
  "iesFirstNarrowCandidateOutputArtifactMaterialisationSchemaVersion",
  "iesFirstNarrowCandidateOutputArtifactMaterialisationState",
  "iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint",
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_REQUIRED_FALSE_FLAGS,
  "iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint",
]);

const READY_STATE = "redacted_ies_first_narrow_candidate_output_bundle_boundary_summary_persisted";
const ARTIFACT_MATERIALISATION_READY_STATE = "redacted_ies_first_narrow_candidate_output_artifact_materialisation_summary_persisted";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,700}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const RAW_IES_TEXT_PATTERN = /IESNA:|TILT=/i;
const DATA_BASE64_PATTERN = /data:[^\s"']*base64|base64,/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json|zip)(?:$|[\s?#])/i;

const UNSAFE_BUNDLE_BOUNDARY_RAW_KEYS = Object.freeze([
  "outputBundle",
  "rawOutputBundle",
  "outputBundlePayload",
  "rawOutputBundlePayload",
  "bundleBody",
  "rawBundleBody",
  "bundleFiles",
  "rawBundleFiles",
  "bundleArtifacts",
  "rawBundleArtifacts",
]);

const UNSAFE_BUNDLE_BOUNDARY_TRUE_FLAGS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_REQUIRED_FALSE_FLAGS,
  "donorInvocationEnabled",
  "donorInvocationAttempted",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutationEnabled",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeToken(value) {
  if (value === null || value === undefined) return null;
  const token = String(value).trim();
  if (!token || PRIVATE_VALUE_PATTERN.test(token) || RAW_IES_TEXT_PATTERN.test(token) || DATA_BASE64_PATTERN.test(token) || FILE_EXTENSION_VALUE_PATTERN.test(token)) return null;
  return SAFE_TOKEN_PATTERN.test(token) ? token : null;
}

function safeBoolean(value) {
  return value === true;
}

function nonNegativeInteger(value) {
  const number = Number(value);
  if (!Number.isFinite(number) || number < 0) return 0;
  return Math.trunc(number);
}

function sourceFromInput(input, key) {
  if (!isRecord(input)) return {};
  return isRecord(input[key]) ? input[key] : {};
}

export function findUnsafeIesFirstNarrowCandidateOutputBundleBoundaryInput(value, depth = 0, seen = new Set()) {
  const artifactMaterialisationUnsafe = findUnsafeIesFirstNarrowCandidateOutputArtifactMaterialisationInput(value);
  if (artifactMaterialisationUnsafe) return artifactMaterialisationUnsafe;
  if (depth > 10) return null;
  if (typeof value === "string") {
    if (PRIVATE_VALUE_PATTERN.test(value) || RAW_IES_TEXT_PATTERN.test(value) || DATA_BASE64_PATTERN.test(value) || FILE_EXTENSION_VALUE_PATTERN.test(value)) {
      return "ies-first-narrow-candidate-output-bundle-boundary-unsafe-string";
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = findUnsafeIesFirstNarrowCandidateOutputBundleBoundaryInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isRecord(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_BUNDLE_BOUNDARY_RAW_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return "blocked-unsafe-raw-input";
    }
    if (UNSAFE_BUNDLE_BOUNDARY_TRUE_FLAGS.includes(key) && nested === true) {
      return "blocked-unsafe-enabled-flag";
    }
    const child = findUnsafeIesFirstNarrowCandidateOutputBundleBoundaryInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function orderedSummary(fields) {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_FIELD_ORDER.map((key) => [key, fields[key]]));
}

function disabledFalseFlags() {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));
}

function blockedSummary(reason) {
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: "ies_first_narrow_candidate_output_bundle_boundary_blocked_fail_closed",
    sourceKind: "safe-candidate-output-bundle-boundary-summary",
    futureOutputKind: "ies-first-narrow-candidate-output-bundle-boundary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    bundleBoundaryOnly: true,
    materialisationBoundaryOnly: true,
    artifactRefOnly: true,
    artifactPlanOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    sourceBacked: false,
    sourceAnchorOnly: false,
    opaqueReferenceOnly: false,
    opaqueArtifactRef: null,
    opaqueMaterialisationBoundaryRef: null,
    opaqueBundleBoundaryRef: null,
    runTableFirstNarrowRowsReady: false,
    iesFirstNarrowMetadataHandoffReady: false,
    iesFirstNarrowCandidateOutputSummaryReady: false,
    iesFirstNarrowCandidateOutputManifestSummaryReady: false,
    iesFirstNarrowCandidateOutputDetailSummaryReady: false,
    iesFirstNarrowCandidateOutputArtifactPlanSummaryReady: false,
    iesFirstNarrowCandidateOutputArtifactRefSummaryReady: false,
    iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryReady: false,
    readyForArtifactRefBoundary: false,
    readyForMaterialisationBoundary: false,
    readyForBundleBoundary: false,
    readyForFutureOutput: false,
    artifactRefJoined: false,
    artifactMaterialisationBoundaryJoined: false,
    outputBundleBoundaryJoined: false,
    sourceRowsIncluded: false,
    candidateOutputDetailsIncluded: false,
    manifestListIncluded: false,
    detailListIncluded: false,
    artifactListIncluded: false,
    artifactPlanListIncluded: false,
    rawArtifactIncluded: false,
    outputBundleIncluded: false,
    rawOutputBundleIncluded: false,
    sourceRunTableRowCount: 0,
    candidateOutputRecordCount: 0,
    manifestRecordCount: 0,
    detailRecordCount: 0,
    artifactPlanRecordCount: 0,
    artifactPlanEntryCount: 0,
    artifactRefRecordCount: 0,
    artifactRefEntryCount: 0,
    artifactMaterialisationRecordCount: 0,
    artifactMaterialisationEntryCount: 0,
    outputBundleRecordCount: 0,
    outputBundleEntryCount: 0,
    firstBundleBoundaryEntryKind: null,
    firstArtifactMaterialisationEntryKind: null,
    firstArtifactRefEntryKind: null,
    firstArtifactPlanEntryKind: null,
    firstDetailEntryKind: null,
    firstCandidateOutputKind: null,
    firstManifestEntryKind: null,
    firstRowKey: null,
    firstRowKind: null,
    firstRunKey: null,
    firstRunIndex: null,
    firstRowAccepted: false,
    firstRowEngineVerified: false,
    firstRowBoardCount: 0,
    firstRowSegmentCount: 0,
    firstRowZoneCount: 0,
    firstRowClipPointsCount: 0,
    firstRowSuspensionPointsCount: 0,
    firstRowGearTrayPlanCount: 0,
    firstRowReservedRangesCount: 0,
    policyFingerprint: null,
    sourceFingerprint: null,
    sourceInputFingerprint: null,
    boardDataSourceVersion: null,
    runTableFirstNarrowRowsSchemaId: null,
    runTableFirstNarrowRowsSchemaVersion: null,
    runTableFirstNarrowRowsState: null,
    iesFirstNarrowMetadataHandoffContractId: null,
    iesFirstNarrowMetadataHandoffSchemaId: null,
    iesFirstNarrowMetadataHandoffSchemaVersion: null,
    iesFirstNarrowMetadataHandoffState: safeToken(reason) || "blocked-fail-closed",
    iesFirstNarrowMetadataHandoffSummaryFingerprint: null,
    iesFirstNarrowCandidateOutputContractId: null,
    iesFirstNarrowCandidateOutputSchemaId: null,
    iesFirstNarrowCandidateOutputSchemaVersion: null,
    iesFirstNarrowCandidateOutputState: null,
    iesFirstNarrowCandidateOutputSummaryFingerprint: null,
    iesFirstNarrowCandidateOutputManifestContractId: null,
    iesFirstNarrowCandidateOutputManifestSchemaId: null,
    iesFirstNarrowCandidateOutputManifestSchemaVersion: null,
    iesFirstNarrowCandidateOutputManifestState: null,
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint: null,
    iesFirstNarrowCandidateOutputDetailContractId: null,
    iesFirstNarrowCandidateOutputDetailSchemaId: null,
    iesFirstNarrowCandidateOutputDetailSchemaVersion: null,
    iesFirstNarrowCandidateOutputDetailState: null,
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint: null,
    iesFirstNarrowCandidateOutputArtifactPlanContractId: null,
    iesFirstNarrowCandidateOutputArtifactPlanSchemaId: null,
    iesFirstNarrowCandidateOutputArtifactPlanSchemaVersion: null,
    iesFirstNarrowCandidateOutputArtifactPlanState: null,
    iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint: null,
    iesFirstNarrowCandidateOutputArtifactRefContractId: null,
    iesFirstNarrowCandidateOutputArtifactRefSchemaId: null,
    iesFirstNarrowCandidateOutputArtifactRefSchemaVersion: null,
    iesFirstNarrowCandidateOutputArtifactRefState: null,
    iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint: null,
    iesFirstNarrowCandidateOutputArtifactMaterialisationContractId: null,
    iesFirstNarrowCandidateOutputArtifactMaterialisationSchemaId: null,
    iesFirstNarrowCandidateOutputArtifactMaterialisationSchemaVersion: null,
    iesFirstNarrowCandidateOutputArtifactMaterialisationState: null,
    iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint: null,
    ...disabledFalseFlags(),
    iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint;
  fields.iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-bundle-boundary-summary",
    withoutFingerprint,
  );
  return Object.freeze(orderedSummary(fields));
}

function validateArtifactMaterialisationSummary(summary, expectedArtifactMaterialisationSummary) {
  if (!isRecord(summary)) return false;
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID) return false;
  if (summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION) return false;
  if (summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID) return false;
  if (summary.state !== ARTIFACT_MATERIALISATION_READY_STATE) return false;
  if (summary.runTableFirstNarrowRowsReady !== true
    || summary.iesFirstNarrowMetadataHandoffReady !== true
    || summary.iesFirstNarrowCandidateOutputSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputManifestSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputDetailSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputArtifactPlanSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputArtifactRefSummaryReady !== true
    || summary.readyForArtifactRefBoundary !== true
    || summary.readyForMaterialisationBoundary !== true
    || summary.readyForFutureOutput !== true
    || summary.artifactRefJoined !== true
    || summary.artifactMaterialisationBoundaryJoined !== true) return false;
  if (summary.sourceBacked !== true || summary.sourceAnchorOnly !== true || summary.opaqueReferenceOnly !== true) return false;
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) return false;
  if (summary.sourceRowsIncluded !== false
    || summary.candidateOutputDetailsIncluded !== false
    || summary.manifestListIncluded !== false
    || summary.detailListIncluded !== false
    || summary.artifactListIncluded !== false
    || summary.artifactPlanListIncluded !== false
    || summary.rawArtifactIncluded !== false) return false;
  if (nonNegativeInteger(summary.sourceRunTableRowCount) !== 1
    || nonNegativeInteger(summary.candidateOutputRecordCount) !== 1
    || nonNegativeInteger(summary.manifestRecordCount) !== 1
    || nonNegativeInteger(summary.detailRecordCount) !== 1
    || nonNegativeInteger(summary.artifactPlanRecordCount) !== 1
    || nonNegativeInteger(summary.artifactPlanEntryCount) !== 1
    || nonNegativeInteger(summary.artifactRefRecordCount) !== 1
    || nonNegativeInteger(summary.artifactRefEntryCount) !== 1
    || nonNegativeInteger(summary.artifactMaterialisationRecordCount) !== 1
    || nonNegativeInteger(summary.artifactMaterialisationEntryCount) !== 1) return false;
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return false;
  }
  if (!safeToken(summary.opaqueArtifactRef)
    || !safeToken(summary.opaqueMaterialisationBoundaryRef)
    || !safeToken(summary.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint)) return false;
  if (summary.opaqueArtifactRef !== expectedArtifactMaterialisationSummary.opaqueArtifactRef) return false;
  if (summary.opaqueMaterialisationBoundaryRef !== expectedArtifactMaterialisationSummary.opaqueMaterialisationBoundaryRef) return false;
  if (summary.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint !== expectedArtifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint) return false;
  return true;
}

export function buildRuntimeIesFirstNarrowCandidateOutputBundleBoundarySummary(input = {}) {
  const runTableFirstNarrowRows = sourceFromInput(input, "runTableFirstNarrowRows");
  const metadataHandoffSummary = sourceFromInput(input, "iesFirstNarrowMetadataHandoffSummary");
  const candidateOutputSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputSummary");
  const manifestSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputManifestSummary");
  const detailSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputDetailSummary");
  const artifactPlanSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputArtifactPlanSummary");
  const artifactRefSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputArtifactRefSummary");
  const artifactMaterialisationSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputArtifactMaterialisationSummary");

  const unsafe = findUnsafeIesFirstNarrowCandidateOutputBundleBoundaryInput({
    runTableFirstNarrowRows,
    metadataHandoffSummary,
    candidateOutputSummary,
    manifestSummary,
    detailSummary,
    artifactPlanSummary,
    artifactRefSummary,
    artifactMaterialisationSummary,
  });
  if (unsafe) return blockedSummary(unsafe);

  const expectedArtifactMaterialisationSummary = buildRuntimeIesFirstNarrowCandidateOutputArtifactMaterialisationSummary({
    runTableFirstNarrowRows,
    iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary,
    iesFirstNarrowCandidateOutputSummary: candidateOutputSummary,
    iesFirstNarrowCandidateOutputManifestSummary: manifestSummary,
    iesFirstNarrowCandidateOutputDetailSummary: detailSummary,
    iesFirstNarrowCandidateOutputArtifactPlanSummary: artifactPlanSummary,
    iesFirstNarrowCandidateOutputArtifactRefSummary: artifactRefSummary,
  });

  if (expectedArtifactMaterialisationSummary.state !== ARTIFACT_MATERIALISATION_READY_STATE) return blockedSummary("ies-first-narrow-candidate-output-artifact-materialisation-dependencies-not-ready");
  if (!validateArtifactMaterialisationSummary(artifactMaterialisationSummary, expectedArtifactMaterialisationSummary)) return blockedSummary("ies-first-narrow-candidate-output-artifact-materialisation-summary-not-ready");

  const dependencyFingerprintPayload = {
    artifactMaterialisationBoundaryRef: safeToken(artifactMaterialisationSummary.opaqueMaterialisationBoundaryRef),
    artifactMaterialisationFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint),
    artifactRefFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint),
    artifactPlanFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint),
    detailFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint),
    manifestFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint),
    candidateOutputFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputSummaryFingerprint),
    metadataFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowMetadataHandoffSummaryFingerprint),
    firstRowKey: safeToken(artifactMaterialisationSummary.firstRowKey),
  };
  const opaqueBundleBoundaryRef = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-bundle-boundary",
    dependencyFingerprintPayload,
  );

  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: READY_STATE,
    sourceKind: "safe-candidate-output-bundle-boundary-summary",
    futureOutputKind: "ies-first-narrow-candidate-output-bundle-boundary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    bundleBoundaryOnly: true,
    materialisationBoundaryOnly: true,
    artifactRefOnly: true,
    artifactPlanOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    opaqueArtifactRef: safeToken(artifactMaterialisationSummary.opaqueArtifactRef),
    opaqueMaterialisationBoundaryRef: safeToken(artifactMaterialisationSummary.opaqueMaterialisationBoundaryRef),
    opaqueBundleBoundaryRef,
    runTableFirstNarrowRowsReady: true,
    iesFirstNarrowMetadataHandoffReady: true,
    iesFirstNarrowCandidateOutputSummaryReady: true,
    iesFirstNarrowCandidateOutputManifestSummaryReady: true,
    iesFirstNarrowCandidateOutputDetailSummaryReady: true,
    iesFirstNarrowCandidateOutputArtifactPlanSummaryReady: true,
    iesFirstNarrowCandidateOutputArtifactRefSummaryReady: true,
    iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryReady: true,
    readyForArtifactRefBoundary: true,
    readyForMaterialisationBoundary: true,
    readyForBundleBoundary: true,
    readyForFutureOutput: true,
    artifactRefJoined: true,
    artifactMaterialisationBoundaryJoined: true,
    outputBundleBoundaryJoined: true,
    sourceRowsIncluded: false,
    candidateOutputDetailsIncluded: false,
    manifestListIncluded: false,
    detailListIncluded: false,
    artifactListIncluded: false,
    artifactPlanListIncluded: false,
    rawArtifactIncluded: false,
    outputBundleIncluded: false,
    rawOutputBundleIncluded: false,
    sourceRunTableRowCount: nonNegativeInteger(artifactMaterialisationSummary.sourceRunTableRowCount),
    candidateOutputRecordCount: nonNegativeInteger(artifactMaterialisationSummary.candidateOutputRecordCount),
    manifestRecordCount: nonNegativeInteger(artifactMaterialisationSummary.manifestRecordCount),
    detailRecordCount: nonNegativeInteger(artifactMaterialisationSummary.detailRecordCount),
    artifactPlanRecordCount: nonNegativeInteger(artifactMaterialisationSummary.artifactPlanRecordCount),
    artifactPlanEntryCount: nonNegativeInteger(artifactMaterialisationSummary.artifactPlanEntryCount),
    artifactRefRecordCount: nonNegativeInteger(artifactMaterialisationSummary.artifactRefRecordCount),
    artifactRefEntryCount: nonNegativeInteger(artifactMaterialisationSummary.artifactRefEntryCount),
    artifactMaterialisationRecordCount: nonNegativeInteger(artifactMaterialisationSummary.artifactMaterialisationRecordCount),
    artifactMaterialisationEntryCount: nonNegativeInteger(artifactMaterialisationSummary.artifactMaterialisationEntryCount),
    outputBundleRecordCount: 1,
    outputBundleEntryCount: 1,
    firstBundleBoundaryEntryKind: "ies_first_narrow_candidate_output_artifact_materialisation_summary_ref",
    firstArtifactMaterialisationEntryKind: safeToken(artifactMaterialisationSummary.firstArtifactMaterialisationEntryKind),
    firstArtifactRefEntryKind: safeToken(artifactMaterialisationSummary.firstArtifactRefEntryKind),
    firstArtifactPlanEntryKind: safeToken(artifactMaterialisationSummary.firstArtifactPlanEntryKind),
    firstDetailEntryKind: safeToken(artifactMaterialisationSummary.firstDetailEntryKind),
    firstCandidateOutputKind: safeToken(artifactMaterialisationSummary.firstCandidateOutputKind),
    firstManifestEntryKind: safeToken(artifactMaterialisationSummary.firstManifestEntryKind),
    firstRowKey: safeToken(artifactMaterialisationSummary.firstRowKey),
    firstRowKind: safeToken(artifactMaterialisationSummary.firstRowKind),
    firstRunKey: safeToken(artifactMaterialisationSummary.firstRunKey),
    firstRunIndex: nonNegativeInteger(artifactMaterialisationSummary.firstRunIndex),
    firstRowAccepted: safeBoolean(artifactMaterialisationSummary.firstRowAccepted),
    firstRowEngineVerified: safeBoolean(artifactMaterialisationSummary.firstRowEngineVerified),
    firstRowBoardCount: nonNegativeInteger(artifactMaterialisationSummary.firstRowBoardCount),
    firstRowSegmentCount: nonNegativeInteger(artifactMaterialisationSummary.firstRowSegmentCount),
    firstRowZoneCount: nonNegativeInteger(artifactMaterialisationSummary.firstRowZoneCount),
    firstRowClipPointsCount: nonNegativeInteger(artifactMaterialisationSummary.firstRowClipPointsCount),
    firstRowSuspensionPointsCount: nonNegativeInteger(artifactMaterialisationSummary.firstRowSuspensionPointsCount),
    firstRowGearTrayPlanCount: nonNegativeInteger(artifactMaterialisationSummary.firstRowGearTrayPlanCount),
    firstRowReservedRangesCount: nonNegativeInteger(artifactMaterialisationSummary.firstRowReservedRangesCount),
    policyFingerprint: safeToken(artifactMaterialisationSummary.policyFingerprint),
    sourceFingerprint: safeToken(artifactMaterialisationSummary.sourceFingerprint),
    sourceInputFingerprint: safeToken(artifactMaterialisationSummary.sourceInputFingerprint),
    boardDataSourceVersion: safeToken(artifactMaterialisationSummary.boardDataSourceVersion),
    runTableFirstNarrowRowsSchemaId: safeToken(artifactMaterialisationSummary.runTableFirstNarrowRowsSchemaId),
    runTableFirstNarrowRowsSchemaVersion: nonNegativeInteger(artifactMaterialisationSummary.runTableFirstNarrowRowsSchemaVersion),
    runTableFirstNarrowRowsState: safeToken(artifactMaterialisationSummary.runTableFirstNarrowRowsState),
    iesFirstNarrowMetadataHandoffContractId: safeToken(artifactMaterialisationSummary.iesFirstNarrowMetadataHandoffContractId),
    iesFirstNarrowMetadataHandoffSchemaId: safeToken(artifactMaterialisationSummary.iesFirstNarrowMetadataHandoffSchemaId),
    iesFirstNarrowMetadataHandoffSchemaVersion: nonNegativeInteger(artifactMaterialisationSummary.iesFirstNarrowMetadataHandoffSchemaVersion),
    iesFirstNarrowMetadataHandoffState: safeToken(artifactMaterialisationSummary.iesFirstNarrowMetadataHandoffState),
    iesFirstNarrowMetadataHandoffSummaryFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowMetadataHandoffSummaryFingerprint),
    iesFirstNarrowCandidateOutputContractId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputContractId),
    iesFirstNarrowCandidateOutputSchemaId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputSchemaId),
    iesFirstNarrowCandidateOutputSchemaVersion: nonNegativeInteger(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputSchemaVersion),
    iesFirstNarrowCandidateOutputState: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputState),
    iesFirstNarrowCandidateOutputSummaryFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputSummaryFingerprint),
    iesFirstNarrowCandidateOutputManifestContractId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputManifestContractId),
    iesFirstNarrowCandidateOutputManifestSchemaId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputManifestSchemaId),
    iesFirstNarrowCandidateOutputManifestSchemaVersion: nonNegativeInteger(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputManifestSchemaVersion),
    iesFirstNarrowCandidateOutputManifestState: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputManifestState),
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint),
    iesFirstNarrowCandidateOutputDetailContractId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputDetailContractId),
    iesFirstNarrowCandidateOutputDetailSchemaId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputDetailSchemaId),
    iesFirstNarrowCandidateOutputDetailSchemaVersion: nonNegativeInteger(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputDetailSchemaVersion),
    iesFirstNarrowCandidateOutputDetailState: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputDetailState),
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint),
    iesFirstNarrowCandidateOutputArtifactPlanContractId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactPlanContractId),
    iesFirstNarrowCandidateOutputArtifactPlanSchemaId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactPlanSchemaId),
    iesFirstNarrowCandidateOutputArtifactPlanSchemaVersion: nonNegativeInteger(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactPlanSchemaVersion),
    iesFirstNarrowCandidateOutputArtifactPlanState: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactPlanState),
    iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint),
    iesFirstNarrowCandidateOutputArtifactRefContractId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactRefContractId),
    iesFirstNarrowCandidateOutputArtifactRefSchemaId: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactRefSchemaId),
    iesFirstNarrowCandidateOutputArtifactRefSchemaVersion: nonNegativeInteger(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactRefSchemaVersion),
    iesFirstNarrowCandidateOutputArtifactRefState: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactRefState),
    iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint),
    iesFirstNarrowCandidateOutputArtifactMaterialisationContractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID,
    iesFirstNarrowCandidateOutputArtifactMaterialisationSchemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID,
    iesFirstNarrowCandidateOutputArtifactMaterialisationSchemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION,
    iesFirstNarrowCandidateOutputArtifactMaterialisationState: safeToken(artifactMaterialisationSummary.state),
    iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint: safeToken(artifactMaterialisationSummary.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint),
    ...disabledFalseFlags(),
    iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint;
  fields.iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-bundle-boundary-summary",
    withoutFingerprint,
  );

  return Object.freeze(orderedSummary(fields));
}

export const buildIesFirstNarrowCandidateOutputBundleBoundarySummary = buildRuntimeIesFirstNarrowCandidateOutputBundleBoundarySummary;
