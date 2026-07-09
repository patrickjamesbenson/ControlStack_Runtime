import {
  buildRuntimeIesFirstNarrowCandidateOutputArtifactRefSummary,
  findUnsafeIesFirstNarrowCandidateOutputArtifactRefInput,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowCandidateOutputArtifactRefSummary.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID = "RUNTIME-IES-FIRST-NARROW-CANDIDATE-OUTPUT-ARTIFACT-MATERIALISATION-BOUNDARY-WRITE-1";
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID = "controlstack.runtime.ies-first-narrow-candidate-output-artifact-materialisation-summary.v1";
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary";

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS = Object.freeze([
  ...new Set([
    ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_REQUIRED_FALSE_FLAGS,
    "artifactMaterialisationBoundaryEnabled",
    "artifactMaterialisationBoundaryAttempted",
    "artifactMaterialisationBoundaryWritten",
    "artifactMaterialisationFileOutputEnabled",
    "artifactMaterialisationFileOutputWritten",
    "artifactBodyReturned",
  ]),
]);

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_FIELD_ORDER = Object.freeze([
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
  "runTableFirstNarrowRowsReady",
  "iesFirstNarrowMetadataHandoffReady",
  "iesFirstNarrowCandidateOutputSummaryReady",
  "iesFirstNarrowCandidateOutputManifestSummaryReady",
  "iesFirstNarrowCandidateOutputDetailSummaryReady",
  "iesFirstNarrowCandidateOutputArtifactPlanSummaryReady",
  "iesFirstNarrowCandidateOutputArtifactRefSummaryReady",
  "readyForArtifactRefBoundary",
  "readyForMaterialisationBoundary",
  "readyForFutureOutput",
  "artifactRefJoined",
  "artifactMaterialisationBoundaryJoined",
  "sourceRowsIncluded",
  "candidateOutputDetailsIncluded",
  "manifestListIncluded",
  "detailListIncluded",
  "artifactListIncluded",
  "artifactPlanListIncluded",
  "rawArtifactIncluded",
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
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS,
  "iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint",
]);

const READY_STATE = "redacted_ies_first_narrow_candidate_output_artifact_materialisation_summary_persisted";
const ARTIFACT_REF_READY_STATE = "redacted_ies_first_narrow_candidate_output_artifact_ref_summary_persisted";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,700}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const RAW_IES_TEXT_PATTERN = /IESNA:|TILT=/i;
const DATA_BASE64_PATTERN = /data:[^\s"']*base64|base64,/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json)(?:$|[\s?#])/i;

const UNSAFE_MATERIALISATION_RAW_KEYS = Object.freeze([
  "artifactMaterialisation",
  "rawArtifactMaterialisation",
  "artifactMaterialisationPayload",
  "rawArtifactMaterialisationPayload",
  "materialisedArtifact",
  "materialisedArtifacts",
  "artifactBody",
  "rawArtifactBody",
  "artifactOutput",
  "rawArtifactOutput",
  "materialisedFiles",
]);

const UNSAFE_MATERIALISATION_TRUE_FLAGS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS,
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

export function findUnsafeIesFirstNarrowCandidateOutputArtifactMaterialisationInput(value, depth = 0, seen = new Set()) {
  const artifactRefUnsafe = findUnsafeIesFirstNarrowCandidateOutputArtifactRefInput(value);
  if (artifactRefUnsafe) return artifactRefUnsafe;
  if (depth > 10) return null;
  if (typeof value === "string") {
    if (PRIVATE_VALUE_PATTERN.test(value) || RAW_IES_TEXT_PATTERN.test(value) || DATA_BASE64_PATTERN.test(value) || FILE_EXTENSION_VALUE_PATTERN.test(value)) {
      return "ies-first-narrow-candidate-output-artifact-materialisation-unsafe-string";
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = findUnsafeIesFirstNarrowCandidateOutputArtifactMaterialisationInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isRecord(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_MATERIALISATION_RAW_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return "blocked-unsafe-raw-input";
    }
    if (UNSAFE_MATERIALISATION_TRUE_FLAGS.includes(key) && nested === true) {
      return "blocked-unsafe-enabled-flag";
    }
    const child = findUnsafeIesFirstNarrowCandidateOutputArtifactMaterialisationInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function orderedSummary(fields) {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_FIELD_ORDER.map((key) => [key, fields[key]]));
}

function disabledFalseFlags() {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));
}

function blockedSummary(reason) {
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: "ies_first_narrow_candidate_output_artifact_materialisation_blocked_fail_closed",
    sourceKind: "safe-candidate-output-artifact-materialisation-boundary-summary",
    futureOutputKind: "ies-first-narrow-candidate-output-artifact-materialisation-boundary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
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
    runTableFirstNarrowRowsReady: false,
    iesFirstNarrowMetadataHandoffReady: false,
    iesFirstNarrowCandidateOutputSummaryReady: false,
    iesFirstNarrowCandidateOutputManifestSummaryReady: false,
    iesFirstNarrowCandidateOutputDetailSummaryReady: false,
    iesFirstNarrowCandidateOutputArtifactPlanSummaryReady: false,
    iesFirstNarrowCandidateOutputArtifactRefSummaryReady: false,
    readyForArtifactRefBoundary: false,
    readyForMaterialisationBoundary: false,
    readyForFutureOutput: false,
    artifactRefJoined: false,
    artifactMaterialisationBoundaryJoined: false,
    sourceRowsIncluded: false,
    candidateOutputDetailsIncluded: false,
    manifestListIncluded: false,
    detailListIncluded: false,
    artifactListIncluded: false,
    artifactPlanListIncluded: false,
    rawArtifactIncluded: false,
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
    ...disabledFalseFlags(),
    iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint;
  fields.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-artifact-materialisation-summary",
    withoutFingerprint,
  );
  return Object.freeze(orderedSummary(fields));
}

function validateArtifactRefSummary(summary, expectedArtifactRefSummary) {
  if (!isRecord(summary)) return false;
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_SUMMARY_SCHEMA_ID) return false;
  if (summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_SUMMARY_SCHEMA_VERSION) return false;
  if (summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_CONTRACT_ID) return false;
  if (summary.state !== ARTIFACT_REF_READY_STATE) return false;
  if (summary.runTableFirstNarrowRowsReady !== true
    || summary.iesFirstNarrowMetadataHandoffReady !== true
    || summary.iesFirstNarrowCandidateOutputSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputManifestSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputDetailSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputArtifactPlanSummaryReady !== true
    || summary.readyForArtifactRefBoundary !== true
    || summary.readyForFutureOutput !== true
    || summary.artifactRefJoined !== true) return false;
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
    || nonNegativeInteger(summary.artifactRefEntryCount) !== 1) return false;
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return false;
  }
  if (!safeToken(summary.opaqueArtifactRef) || !safeToken(summary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint)) return false;
  if (summary.opaqueArtifactRef !== expectedArtifactRefSummary.opaqueArtifactRef) return false;
  if (summary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint !== expectedArtifactRefSummary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint) return false;
  return true;
}

export function buildRuntimeIesFirstNarrowCandidateOutputArtifactMaterialisationSummary(input = {}) {
  const runTableFirstNarrowRows = sourceFromInput(input, "runTableFirstNarrowRows");
  const metadataHandoffSummary = sourceFromInput(input, "iesFirstNarrowMetadataHandoffSummary");
  const candidateOutputSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputSummary");
  const manifestSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputManifestSummary");
  const detailSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputDetailSummary");
  const artifactPlanSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputArtifactPlanSummary");
  const artifactRefSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputArtifactRefSummary");

  const unsafe = findUnsafeIesFirstNarrowCandidateOutputArtifactMaterialisationInput({
    runTableFirstNarrowRows,
    metadataHandoffSummary,
    candidateOutputSummary,
    manifestSummary,
    detailSummary,
    artifactPlanSummary,
    artifactRefSummary,
  });
  if (unsafe) return blockedSummary(unsafe);

  const expectedArtifactRefSummary = buildRuntimeIesFirstNarrowCandidateOutputArtifactRefSummary({
    runTableFirstNarrowRows,
    iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary,
    iesFirstNarrowCandidateOutputSummary: candidateOutputSummary,
    iesFirstNarrowCandidateOutputManifestSummary: manifestSummary,
    iesFirstNarrowCandidateOutputDetailSummary: detailSummary,
    iesFirstNarrowCandidateOutputArtifactPlanSummary: artifactPlanSummary,
  });

  if (expectedArtifactRefSummary.state !== ARTIFACT_REF_READY_STATE) return blockedSummary("ies-first-narrow-candidate-output-artifact-ref-dependencies-not-ready");
  if (!validateArtifactRefSummary(artifactRefSummary, expectedArtifactRefSummary)) return blockedSummary("ies-first-narrow-candidate-output-artifact-ref-summary-not-ready");

  const dependencyFingerprintPayload = {
    artifactRef: safeToken(artifactRefSummary.opaqueArtifactRef),
    artifactRefFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint),
    artifactPlanFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint),
    detailFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint),
    manifestFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint),
    candidateOutputFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputSummaryFingerprint),
    metadataFingerprint: safeToken(artifactRefSummary.iesFirstNarrowMetadataHandoffSummaryFingerprint),
    firstRowKey: safeToken(artifactRefSummary.firstRowKey),
  };
  const opaqueMaterialisationBoundaryRef = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-artifact-materialisation-boundary",
    dependencyFingerprintPayload,
  );

  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: READY_STATE,
    sourceKind: "safe-candidate-output-artifact-materialisation-boundary-summary",
    futureOutputKind: "ies-first-narrow-candidate-output-artifact-materialisation-boundary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    materialisationBoundaryOnly: true,
    artifactRefOnly: true,
    artifactPlanOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    opaqueArtifactRef: safeToken(artifactRefSummary.opaqueArtifactRef),
    opaqueMaterialisationBoundaryRef,
    runTableFirstNarrowRowsReady: true,
    iesFirstNarrowMetadataHandoffReady: true,
    iesFirstNarrowCandidateOutputSummaryReady: true,
    iesFirstNarrowCandidateOutputManifestSummaryReady: true,
    iesFirstNarrowCandidateOutputDetailSummaryReady: true,
    iesFirstNarrowCandidateOutputArtifactPlanSummaryReady: true,
    iesFirstNarrowCandidateOutputArtifactRefSummaryReady: true,
    readyForArtifactRefBoundary: true,
    readyForMaterialisationBoundary: true,
    readyForFutureOutput: true,
    artifactRefJoined: true,
    artifactMaterialisationBoundaryJoined: true,
    sourceRowsIncluded: false,
    candidateOutputDetailsIncluded: false,
    manifestListIncluded: false,
    detailListIncluded: false,
    artifactListIncluded: false,
    artifactPlanListIncluded: false,
    rawArtifactIncluded: false,
    sourceRunTableRowCount: nonNegativeInteger(artifactRefSummary.sourceRunTableRowCount),
    candidateOutputRecordCount: nonNegativeInteger(artifactRefSummary.candidateOutputRecordCount),
    manifestRecordCount: nonNegativeInteger(artifactRefSummary.manifestRecordCount),
    detailRecordCount: nonNegativeInteger(artifactRefSummary.detailRecordCount),
    artifactPlanRecordCount: nonNegativeInteger(artifactRefSummary.artifactPlanRecordCount),
    artifactPlanEntryCount: nonNegativeInteger(artifactRefSummary.artifactPlanEntryCount),
    artifactRefRecordCount: nonNegativeInteger(artifactRefSummary.artifactRefRecordCount),
    artifactRefEntryCount: nonNegativeInteger(artifactRefSummary.artifactRefEntryCount),
    artifactMaterialisationRecordCount: 1,
    artifactMaterialisationEntryCount: 1,
    firstArtifactMaterialisationEntryKind: "ies_first_narrow_candidate_output_artifact_ref_summary_ref",
    firstArtifactRefEntryKind: safeToken(artifactRefSummary.firstArtifactRefEntryKind),
    firstArtifactPlanEntryKind: safeToken(artifactRefSummary.firstArtifactPlanEntryKind),
    firstDetailEntryKind: safeToken(artifactRefSummary.firstDetailEntryKind),
    firstCandidateOutputKind: safeToken(artifactRefSummary.firstCandidateOutputKind),
    firstManifestEntryKind: safeToken(artifactRefSummary.firstManifestEntryKind),
    firstRowKey: safeToken(artifactRefSummary.firstRowKey),
    firstRowKind: safeToken(artifactRefSummary.firstRowKind),
    firstRunKey: safeToken(artifactRefSummary.firstRunKey),
    firstRunIndex: nonNegativeInteger(artifactRefSummary.firstRunIndex),
    firstRowAccepted: safeBoolean(artifactRefSummary.firstRowAccepted),
    firstRowEngineVerified: safeBoolean(artifactRefSummary.firstRowEngineVerified),
    firstRowBoardCount: nonNegativeInteger(artifactRefSummary.firstRowBoardCount),
    firstRowSegmentCount: nonNegativeInteger(artifactRefSummary.firstRowSegmentCount),
    firstRowZoneCount: nonNegativeInteger(artifactRefSummary.firstRowZoneCount),
    firstRowClipPointsCount: nonNegativeInteger(artifactRefSummary.firstRowClipPointsCount),
    firstRowSuspensionPointsCount: nonNegativeInteger(artifactRefSummary.firstRowSuspensionPointsCount),
    firstRowGearTrayPlanCount: nonNegativeInteger(artifactRefSummary.firstRowGearTrayPlanCount),
    firstRowReservedRangesCount: nonNegativeInteger(artifactRefSummary.firstRowReservedRangesCount),
    policyFingerprint: safeToken(artifactRefSummary.policyFingerprint),
    sourceFingerprint: safeToken(artifactRefSummary.sourceFingerprint),
    sourceInputFingerprint: safeToken(artifactRefSummary.sourceInputFingerprint),
    boardDataSourceVersion: safeToken(artifactRefSummary.boardDataSourceVersion),
    runTableFirstNarrowRowsSchemaId: safeToken(artifactRefSummary.runTableFirstNarrowRowsSchemaId),
    runTableFirstNarrowRowsSchemaVersion: nonNegativeInteger(artifactRefSummary.runTableFirstNarrowRowsSchemaVersion),
    runTableFirstNarrowRowsState: safeToken(artifactRefSummary.runTableFirstNarrowRowsState),
    iesFirstNarrowMetadataHandoffContractId: safeToken(artifactRefSummary.iesFirstNarrowMetadataHandoffContractId),
    iesFirstNarrowMetadataHandoffSchemaId: safeToken(artifactRefSummary.iesFirstNarrowMetadataHandoffSchemaId),
    iesFirstNarrowMetadataHandoffSchemaVersion: nonNegativeInteger(artifactRefSummary.iesFirstNarrowMetadataHandoffSchemaVersion),
    iesFirstNarrowMetadataHandoffState: safeToken(artifactRefSummary.iesFirstNarrowMetadataHandoffState),
    iesFirstNarrowMetadataHandoffSummaryFingerprint: safeToken(artifactRefSummary.iesFirstNarrowMetadataHandoffSummaryFingerprint),
    iesFirstNarrowCandidateOutputContractId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputContractId),
    iesFirstNarrowCandidateOutputSchemaId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputSchemaId),
    iesFirstNarrowCandidateOutputSchemaVersion: nonNegativeInteger(artifactRefSummary.iesFirstNarrowCandidateOutputSchemaVersion),
    iesFirstNarrowCandidateOutputState: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputState),
    iesFirstNarrowCandidateOutputSummaryFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputSummaryFingerprint),
    iesFirstNarrowCandidateOutputManifestContractId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputManifestContractId),
    iesFirstNarrowCandidateOutputManifestSchemaId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputManifestSchemaId),
    iesFirstNarrowCandidateOutputManifestSchemaVersion: nonNegativeInteger(artifactRefSummary.iesFirstNarrowCandidateOutputManifestSchemaVersion),
    iesFirstNarrowCandidateOutputManifestState: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputManifestState),
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint),
    iesFirstNarrowCandidateOutputDetailContractId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputDetailContractId),
    iesFirstNarrowCandidateOutputDetailSchemaId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputDetailSchemaId),
    iesFirstNarrowCandidateOutputDetailSchemaVersion: nonNegativeInteger(artifactRefSummary.iesFirstNarrowCandidateOutputDetailSchemaVersion),
    iesFirstNarrowCandidateOutputDetailState: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputDetailState),
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint),
    iesFirstNarrowCandidateOutputArtifactPlanContractId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactPlanContractId),
    iesFirstNarrowCandidateOutputArtifactPlanSchemaId: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactPlanSchemaId),
    iesFirstNarrowCandidateOutputArtifactPlanSchemaVersion: nonNegativeInteger(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactPlanSchemaVersion),
    iesFirstNarrowCandidateOutputArtifactPlanState: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactPlanState),
    iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint),
    iesFirstNarrowCandidateOutputArtifactRefContractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_CONTRACT_ID,
    iesFirstNarrowCandidateOutputArtifactRefSchemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_SUMMARY_SCHEMA_ID,
    iesFirstNarrowCandidateOutputArtifactRefSchemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_REF_SUMMARY_SCHEMA_VERSION,
    iesFirstNarrowCandidateOutputArtifactRefState: safeToken(artifactRefSummary.state),
    iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint: safeToken(artifactRefSummary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint),
    ...disabledFalseFlags(),
    iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint;
  fields.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-artifact-materialisation-summary",
    withoutFingerprint,
  );

  return Object.freeze(orderedSummary(fields));
}

export const buildIesFirstNarrowCandidateOutputArtifactMaterialisationSummary = buildRuntimeIesFirstNarrowCandidateOutputArtifactMaterialisationSummary;
