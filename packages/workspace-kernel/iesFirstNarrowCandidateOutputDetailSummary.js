import {
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowMetadataHandoffSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowCandidateOutputSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
} from "./iesFirstNarrowCandidateOutputManifestSummary.js";
import {
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROWS_STATES,
} from "./runTableFirstNarrowRows.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID = "RUNTIME-IES-FIRST-NARROW-CANDIDATE-OUTPUT-DETAIL-WRITE-1";
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID = "controlstack.runtime.ies-first-narrow-candidate-output-detail-summary.v1";
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputDetailSummary";

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS,
  "detailFileOutputEnabled",
  "detailFileOutputWritten",
]);

export const RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_FIELD_ORDER = Object.freeze([
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
  "detailOnly",
  "candidateOutputOnly",
  "productionProof",
  "labProofAuthority",
  "sourceBacked",
  "sourceAnchorOnly",
  "opaqueReferenceOnly",
  "runTableFirstNarrowRowsReady",
  "iesFirstNarrowMetadataHandoffReady",
  "iesFirstNarrowCandidateOutputSummaryReady",
  "iesFirstNarrowCandidateOutputManifestSummaryReady",
  "readyForDetailBoundary",
  "readyForFutureOutput",
  "detailsJoined",
  "sourceRowsIncluded",
  "candidateOutputDetailsIncluded",
  "artifactListIncluded",
  "sourceRunTableRowCount",
  "candidateOutputRecordCount",
  "manifestRecordCount",
  "detailRecordCount",
  "detailEntryCount",
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
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
  "iesFirstNarrowCandidateOutputDetailSummaryFingerprint",
]);

const READY_STATE = "redacted_ies_first_narrow_candidate_output_detail_summary_persisted";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,700}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const RAW_IES_TEXT_PATTERN = /IESNA:|TILT=/i;
const DATA_BASE64_PATTERN = /data:[^\s"']*base64|base64,/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json)(?:$|[\s?#])/i;

const UNSAFE_RAW_KEYS = Object.freeze([
  "ies",
  "iesText",
  "rawIes",
  "rawIesText",
  "rawIesContent",
  "rawIesPayload",
  "photometry",
  "rawPhotometry",
  "rawPhotometryPayload",
  "candela",
  "candelaGrid",
  "candelaArray",
  "candelaArrays",
  "rawCandelaGrid",
  "base64",
  "base64Artifacts",
  "artifactBase64",
  "filename",
  "fileName",
  "privatePath",
  "localPath",
  "filePath",
  "absolutePath",
  "targetPath",
  "writeTarget",
  "credentials",
  "secrets",
  "selectedResultBody",
  "resultBody",
  "rawSelectedPayload",
  "selectedResultPayload",
  "rawEnginePayload",
  "rawEngineResult",
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "manifest",
  "rawManifest",
  "artifactManifest",
  "outputManifest",
  "artifactList",
  "outputFiles",
  "files",
  "detail",
  "rawDetail",
  "detailPayload",
  "rawDetailPayload",
  "candidateOutputDetails",
  "rawCandidateOutputDetails",
]);

const UNSAFE_TRUE_FLAGS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
  "photometryGenerationEnabled",
  "photometryGenerationAttempted",
  "rawIesContentReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "privatePathsReturned",
  "localPathsReturned",
  "slugGenerationAttempted",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "artifactManifestGenerated",
  "artifactManifestWritten",
  "rawManifestReturned",
  "rawCandidateOutputReturned",
  "detailGenerated",
  "detailGenerationEnabled",
  "detailGenerationAttempted",
  "rawDetailReturned",
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

export function findUnsafeIesFirstNarrowCandidateOutputDetailInput(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    if (PRIVATE_VALUE_PATTERN.test(value) || RAW_IES_TEXT_PATTERN.test(value) || DATA_BASE64_PATTERN.test(value) || FILE_EXTENSION_VALUE_PATTERN.test(value)) {
      return "ies-first-narrow-candidate-output-detail-unsafe-string";
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = findUnsafeIesFirstNarrowCandidateOutputDetailInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isRecord(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_RAW_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return "blocked-unsafe-raw-input";
    }
    if (UNSAFE_TRUE_FLAGS.includes(key) && nested === true) {
      return "blocked-unsafe-enabled-flag";
    }
    const child = findUnsafeIesFirstNarrowCandidateOutputDetailInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function validateRunTableFirstNarrowRows(summary) {
  if (!isRecord(summary)) return false;
  if (summary.schemaId !== RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID) return false;
  if (summary.schemaVersion !== RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION) return false;
  if (summary.state !== RUNTABLE_FIRST_NARROW_ROWS_STATES.ready) return false;
  if (summary.runTableFirstNarrowRowsReady !== true || summary.failClosed === true) return false;
  if (summary.safeRowsReturned !== true || summary.firstNarrowRowsReturned !== true) return false;
  if (summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) return false;
  if (!Array.isArray(summary.rows) || summary.rows.length !== 1 || nonNegativeInteger(summary.rowCount) !== 1) return false;
  const row = summary.rows[0];
  if (!isRecord(row)) return false;
  if (row.accepted !== true || row.engineVerified !== true) return false;
  if (row.safeSummaryOnly !== true || row.redacted !== true || row.machineValueSafe !== true) return false;
  if (row.rawRunReturned === true || row.rawRunTableRowsReturned === true || row.rawSourceRowsReturned === true || row.rawValuesReturned === true) return false;
  return true;
}

function validateIesFirstNarrowMetadataHandoff(summary) {
  if (!isRecord(summary)) return false;
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID) return false;
  if (summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION) return false;
  if (summary.contractId !== RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID) return false;
  if (summary.state !== "redacted_ies_first_narrow_metadata_handoff_summary_persisted") return false;
  if (summary.readyForFutureCandidateOutput !== true || summary.selectedResultHandoffReady !== true) return false;
  if (summary.sourceBacked !== true || summary.sourceAnchorOnly !== true || summary.opaqueReferenceOnly !== true) return false;
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) return false;
  if (!safeToken(summary.iesFirstNarrowMetadataHandoffSummaryFingerprint)) return false;
  return true;
}

function validateIesFirstNarrowCandidateOutputSummary(summary) {
  if (!isRecord(summary)) return false;
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_ID) return false;
  if (summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_VERSION) return false;
  if (summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_CONTRACT_ID) return false;
  if (summary.state !== "redacted_ies_first_narrow_candidate_output_summary_persisted") return false;
  if (summary.runTableFirstNarrowRowsReady !== true || summary.iesFirstNarrowMetadataHandoffReady !== true) return false;
  if (summary.readyForSafeCandidateBoundary !== true || summary.readyForFutureOutput !== true || summary.rowsJoined !== true) return false;
  if (summary.sourceBacked !== true || summary.sourceAnchorOnly !== true || summary.opaqueReferenceOnly !== true) return false;
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) return false;
  if (summary.sourceRowsIncluded !== false || nonNegativeInteger(summary.sourceRunTableRowCount) !== 1 || nonNegativeInteger(summary.candidateOutputRecordCount) !== 1) return false;
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return false;
  }
  if (!safeToken(summary.iesFirstNarrowCandidateOutputSummaryFingerprint)) return false;
  return true;
}

function validateIesFirstNarrowCandidateOutputManifestSummary(summary) {
  if (!isRecord(summary)) return false;
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID) return false;
  if (summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION) return false;
  if (summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID) return false;
  if (summary.state !== "redacted_ies_first_narrow_candidate_output_manifest_summary_persisted") return false;
  if (summary.runTableFirstNarrowRowsReady !== true || summary.iesFirstNarrowMetadataHandoffReady !== true || summary.iesFirstNarrowCandidateOutputSummaryReady !== true) return false;
  if (summary.readyForManifestBoundary !== true || summary.readyForFutureOutput !== true || summary.manifestJoined !== true) return false;
  if (summary.sourceBacked !== true || summary.sourceAnchorOnly !== true || summary.opaqueReferenceOnly !== true) return false;
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) return false;
  if (summary.sourceRowsIncluded !== false || summary.candidateOutputDetailsIncluded !== false || summary.artifactListIncluded !== false) return false;
  if (nonNegativeInteger(summary.sourceRunTableRowCount) !== 1 || nonNegativeInteger(summary.candidateOutputRecordCount) !== 1 || nonNegativeInteger(summary.manifestRecordCount) !== 1) return false;
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) return false;
  }
  if (!safeToken(summary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint)) return false;
  return true;
}

function orderedSummary(fields) {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_FIELD_ORDER.map((key) => [key, fields[key]]));
}

function disabledFalseFlags() {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));
}

function blockedSummary(reason) {
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: "ies_first_narrow_candidate_output_detail_blocked_fail_closed",
    sourceKind: "safe-candidate-output-detail-summary",
    futureOutputKind: "ies-first-narrow-candidate-output-detail",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    detailOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    sourceBacked: false,
    sourceAnchorOnly: false,
    opaqueReferenceOnly: false,
    runTableFirstNarrowRowsReady: false,
    iesFirstNarrowMetadataHandoffReady: false,
    iesFirstNarrowCandidateOutputSummaryReady: false,
    iesFirstNarrowCandidateOutputManifestSummaryReady: false,
    readyForDetailBoundary: false,
    readyForFutureOutput: false,
    detailsJoined: false,
    sourceRowsIncluded: false,
    candidateOutputDetailsIncluded: false,
    artifactListIncluded: false,
    sourceRunTableRowCount: 0,
    candidateOutputRecordCount: 0,
    manifestRecordCount: 0,
    detailRecordCount: 0,
    detailEntryCount: 0,
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
    ...disabledFalseFlags(),
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowCandidateOutputDetailSummaryFingerprint;
  fields.iesFirstNarrowCandidateOutputDetailSummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-detail-summary",
    withoutFingerprint,
  );
  return Object.freeze(orderedSummary(fields));
}

export function buildRuntimeIesFirstNarrowCandidateOutputDetailSummary(input = {}) {
  const runTableFirstNarrowRows = sourceFromInput(input, "runTableFirstNarrowRows");
  const metadataHandoffSummary = sourceFromInput(input, "iesFirstNarrowMetadataHandoffSummary");
  const candidateOutputSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputSummary");
  const manifestSummary = sourceFromInput(input, "iesFirstNarrowCandidateOutputManifestSummary");

  const unsafe = findUnsafeIesFirstNarrowCandidateOutputDetailInput({
    runTableFirstNarrowRows,
    metadataHandoffSummary,
    candidateOutputSummary,
    manifestSummary,
  });
  if (unsafe) return blockedSummary(unsafe);
  if (!validateRunTableFirstNarrowRows(runTableFirstNarrowRows)) return blockedSummary("runtable-first-narrow-rows-not-ready");
  if (!validateIesFirstNarrowMetadataHandoff(metadataHandoffSummary)) return blockedSummary("ies-first-narrow-metadata-handoff-not-ready");
  if (!validateIesFirstNarrowCandidateOutputSummary(candidateOutputSummary)) return blockedSummary("ies-first-narrow-candidate-output-summary-not-ready");
  if (!validateIesFirstNarrowCandidateOutputManifestSummary(manifestSummary)) return blockedSummary("ies-first-narrow-candidate-output-manifest-summary-not-ready");

  const firstRow = runTableFirstNarrowRows.rows[0];
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: READY_STATE,
    sourceKind: "safe-candidate-output-detail-summary",
    futureOutputKind: "ies-first-narrow-candidate-output-detail",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    detailOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    runTableFirstNarrowRowsReady: true,
    iesFirstNarrowMetadataHandoffReady: true,
    iesFirstNarrowCandidateOutputSummaryReady: true,
    iesFirstNarrowCandidateOutputManifestSummaryReady: true,
    readyForDetailBoundary: true,
    readyForFutureOutput: true,
    detailsJoined: true,
    sourceRowsIncluded: false,
    candidateOutputDetailsIncluded: true,
    artifactListIncluded: false,
    sourceRunTableRowCount: nonNegativeInteger(runTableFirstNarrowRows.rowCount),
    candidateOutputRecordCount: nonNegativeInteger(candidateOutputSummary.candidateOutputRecordCount),
    manifestRecordCount: nonNegativeInteger(manifestSummary.manifestRecordCount),
    detailRecordCount: 1,
    detailEntryCount: 1,
    firstDetailEntryKind: "ies_first_narrow_candidate_output_detail_summary_ref",
    firstCandidateOutputKind: safeToken(candidateOutputSummary.futureOutputKind),
    firstManifestEntryKind: safeToken(manifestSummary.firstManifestEntryKind),
    firstRowKey: safeToken(firstRow.rowKey),
    firstRowKind: safeToken(firstRow.rowKind),
    firstRunKey: safeToken(firstRow.runKey),
    firstRunIndex: nonNegativeInteger(firstRow.runIndex),
    firstRowAccepted: safeBoolean(firstRow.accepted),
    firstRowEngineVerified: safeBoolean(firstRow.engineVerified),
    firstRowBoardCount: nonNegativeInteger(firstRow.boardCount),
    firstRowSegmentCount: nonNegativeInteger(firstRow.segmentCount),
    firstRowZoneCount: nonNegativeInteger(firstRow.zoneCount),
    firstRowClipPointsCount: nonNegativeInteger(firstRow.clipPointsCount),
    firstRowSuspensionPointsCount: nonNegativeInteger(firstRow.suspensionPointsCount),
    firstRowGearTrayPlanCount: nonNegativeInteger(firstRow.gearTrayPlanCount),
    firstRowReservedRangesCount: nonNegativeInteger(firstRow.reservedRangesCount),
    policyFingerprint: safeToken(metadataHandoffSummary.policyFingerprint || candidateOutputSummary.policyFingerprint || manifestSummary.policyFingerprint),
    sourceFingerprint: safeToken(metadataHandoffSummary.sourceFingerprint || candidateOutputSummary.sourceFingerprint || manifestSummary.sourceFingerprint),
    sourceInputFingerprint: safeToken(metadataHandoffSummary.sourceInputFingerprint || candidateOutputSummary.sourceInputFingerprint || manifestSummary.sourceInputFingerprint),
    boardDataSourceVersion: safeToken(metadataHandoffSummary.boardDataSourceVersion || candidateOutputSummary.boardDataSourceVersion || manifestSummary.boardDataSourceVersion),
    runTableFirstNarrowRowsSchemaId: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
    runTableFirstNarrowRowsSchemaVersion: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
    runTableFirstNarrowRowsState: RUNTABLE_FIRST_NARROW_ROWS_STATES.ready,
    iesFirstNarrowMetadataHandoffContractId: RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID,
    iesFirstNarrowMetadataHandoffSchemaId: RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID,
    iesFirstNarrowMetadataHandoffSchemaVersion: RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION,
    iesFirstNarrowMetadataHandoffState: safeToken(metadataHandoffSummary.state),
    iesFirstNarrowMetadataHandoffSummaryFingerprint: safeToken(metadataHandoffSummary.iesFirstNarrowMetadataHandoffSummaryFingerprint),
    iesFirstNarrowCandidateOutputContractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_CONTRACT_ID,
    iesFirstNarrowCandidateOutputSchemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_ID,
    iesFirstNarrowCandidateOutputSchemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_VERSION,
    iesFirstNarrowCandidateOutputState: safeToken(candidateOutputSummary.state),
    iesFirstNarrowCandidateOutputSummaryFingerprint: safeToken(candidateOutputSummary.iesFirstNarrowCandidateOutputSummaryFingerprint),
    iesFirstNarrowCandidateOutputManifestContractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
    iesFirstNarrowCandidateOutputManifestSchemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
    iesFirstNarrowCandidateOutputManifestSchemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
    iesFirstNarrowCandidateOutputManifestState: safeToken(manifestSummary.state),
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint: safeToken(manifestSummary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint),
    ...disabledFalseFlags(),
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowCandidateOutputDetailSummaryFingerprint;
  fields.iesFirstNarrowCandidateOutputDetailSummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-candidate-output-detail-summary",
    withoutFingerprint,
  );

  return Object.freeze(orderedSummary(fields));
}

export const buildIesFirstNarrowCandidateOutputDetailSummary = buildRuntimeIesFirstNarrowCandidateOutputDetailSummary;
