export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_SURFACE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-SURFACE-1";
export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_OUTPUT_COLLECTION_ROUTING_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-OUTPUT-COLLECTION-ROUTING-1";
export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_MANIFEST_PREVIEW_CONTRACT_LOCK_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-MANIFEST-PREVIEW-CONTRACT-LOCK-1";
export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_DETAIL_PREVIEW_CONTRACT_LOCK_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-DETAIL-PREVIEW-CONTRACT-LOCK-1";
export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SURFACE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORT-MANIFEST-PREVIEW-SURFACE-1";
export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SURFACE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORT-DETAIL-PREVIEW-SURFACE-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-exports-workflow.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.project-ies-export-item.v1";
export const SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-PROJECT-IES-EXPORT-DOWNLOAD-OUTCOME-STATE-1";
export const SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.first-project-ies-export-download-outcome-state.v1";
export const SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-export-manifest-preview.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-export-detail-preview.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_export_manifest_preview_ready",
  missing: "shell_project_browser_selected_project_export_manifest_preview_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_export_manifest_preview_blocked_fail_closed",
});

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_export_detail_preview_ready",
  missing: "shell_project_browser_selected_project_export_detail_preview_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_export_detail_preview_blocked_fail_closed",
});

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "label",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "selectedProjectOnly",
  "sourceSummaryPresent",
  "manifestSummaryPresent",
  "manifestBoundaryReady",
  "runTableRowCount",
  "candidateOutputRecordCount",
  "manifestRecordCount",
  "manifestEntryCount",
  "firstCandidateOutputKind",
  "previewOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "nonDownloadable",
  "manifestFileExists",
  "manifestDownloadable",
  "manifestFileOutputEnabled",
  "manifestFileOutputWritten",
  "downloadEnabled",
  "downloadAvailable",
  "rawManifestExposed",
  "candidateOutputDetailsExposed",
  "artifactListExposed",
  "rawIesExposed",
  "candelaExposed",
  "photometryExposed",
  "governanceExposed",
  "mutationLogExposed",
  "privatePathExposed",
  "base64Exposed",
  "filenameExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "label",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "selectedProjectOnly",
  "sourceSummaryPresent",
  "detailSummaryPresent",
  "detailBoundaryReady",
  "runTableRowCount",
  "candidateOutputRecordCount",
  "manifestRecordCount",
  "detailRecordCount",
  "detailEntryCount",
  "firstDetailEntryKind",
  "firstCandidateOutputKind",
  "firstManifestEntryKind",
  "firstRowKind",
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
  "previewOnly",
  "diagnosticOnly",
  "detailOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "nonDownloadable",
  "detailFileExists",
  "detailDownloadable",
  "detailFileOutputEnabled",
  "detailFileOutputWritten",
  "downloadEnabled",
  "downloadAvailable",
  "sourceRowsExposed",
  "candidateOutputDetailsExposed",
  "artifactListExposed",
  "rawDetailExposed",
  "rawManifestExposed",
  "rawCandidateOutputExposed",
  "rawIesExposed",
  "candelaExposed",
  "photometryExposed",
  "governanceExposed",
  "mutationLogExposed",
  "privatePathExposed",
  "blobExposed",
  "urlExposed",
  "base64Exposed",
  "filenameExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
  "outputGenerationEnabled",
]);

export const SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES = Object.freeze({
  idle: "shell_project_browser_project_ies_export_download_idle",
  started: "shell_project_browser_project_ies_export_download_started",
  blocked: "shell_project_browser_project_ies_export_download_blocked",
});

export const SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER = Object.freeze([
  "state",
  "filename",
  "mediaType",
  "extension",
  "byteLength",
  "blocker",
]);

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_exports_workflow_ready",
  missing: "shell_project_browser_selected_project_exports_workflow_missing",
  blockedFailClosed: "shell_project_browser_selected_project_exports_workflow_blocked_fail_closed",
});

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "label",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectTitle",
  "selectedProjectFound",
  "selectedProjectOnly",
  "exportItemCount",
  "readyExportItemCount",
  "blockedExportItemCount",
  "outputs",
  "readOnly",
  "browserOnly",
  "userGestureRequired",
  "redacted",
  "preparedActionRetainedPrivately",
  "rawIesExposed",
  "blobExposed",
  "objectUrlExposed",
  "filenameExposed",
  "candelaExposed",
  "photometryExposed",
  "governanceExposed",
  "mutationLogExposed",
  "privatePathExposed",
  "base64Exposed",
  "projectEnvelopeExposed",
  "fullReadbackStatusExposed",
  "sourceBoundaryExposed",
  "materialisationBoundaryExposed",
  "preparedActionExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

export const SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "exportId",
  "label",
  "format",
  "extension",
  "actionLabel",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
]);

const PRIVATE_MANIFEST_PREVIEWS = new WeakMap();
const PRIVATE_DETAIL_PREVIEWS = new WeakMap();
const SAFE_ID_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|data:[^\s]*base64|\bbase64\s*[,=:])/i;
const PROJECT_IES_EXPORT_DOWNLOAD_FILENAME_PATTERN =
  /^controlstack-project-ies-[1-9][0-9]*mm-[0-9a-f]{12}\.ies$/;
const PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE = "application/octet-stream";
const PROJECT_IES_EXPORT_DOWNLOAD_BLOCKER_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PROJECT_BROWSER_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-candidate-output-manifest-readback-summary.v1";
const PROJECT_BROWSER_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_VERSION = 1;
const PROJECT_BROWSER_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-candidate-output-detail-readback-summary.v1";
const PROJECT_BROWSER_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION = 1;
const REQUIRED_FALSE_MANIFEST_PREVIEW_SOURCE_FLAGS = Object.freeze([
  "manifestFileExists",
  "manifestDownloadable",
  "manifestFileOutputEnabled",
  "manifestFileOutputWritten",
  "downloadEnabled",
  "downloadAvailable",
  "sourceRowsReturned",
  "candidateOutputDetailsReturned",
  "artifactListReturned",
  "rawManifestReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "privatePathsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
]);
const REQUIRED_FALSE_DETAIL_PREVIEW_SOURCE_FLAGS = Object.freeze([
  "detailFileExists",
  "detailDownloadable",
  "detailFileOutputEnabled",
  "detailFileOutputWritten",
  "downloadEnabled",
  "downloadAvailable",
  "sourceRowsReturned",
  "candidateOutputDetailsReturned",
  "artifactListReturned",
  "rawDetailReturned",
  "rawManifestReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "mutationDataReturned",
  "base64ArtifactsReturned",
  "blobsReturned",
  "urlsReturned",
  "filenamesReturned",
  "privatePathsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "outputGenerationEnabled",
]);

function safeId(value) {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (!token || PRIVATE_VALUE_PATTERN.test(token) || !SAFE_ID_PATTERN.test(token)) return null;
  return token;
}

function safeDisplayText(value, fallback) {
  if (typeof value !== "string") return fallback;
  const text = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim().slice(0, 200);
  return text && !PRIVATE_VALUE_PATTERN.test(text) ? text : fallback;
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function safeOptionalNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function manifestPreviewSourceIsSafe(summary) {
  return summary.schemaId === PROJECT_BROWSER_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID
    && summary.schemaVersion === PROJECT_BROWSER_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_VERSION
    && summary.selectedProjectOnly === true
    && summary.summaryOnly === true
    && summary.diagnosticOnly === true
    && summary.readOnly === true
    && summary.redacted === true
    && summary.machineValueSafe === true
    && REQUIRED_FALSE_MANIFEST_PREVIEW_SOURCE_FLAGS.every((key) => summary[key] === false);
}

function detailPreviewSourceIsSafe(summary) {
  return summary.schemaId === PROJECT_BROWSER_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID
    && summary.schemaVersion === PROJECT_BROWSER_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION
    && summary.selectedProjectOnly === true
    && summary.summaryOnly === true
    && summary.diagnosticOnly === true
    && summary.detailOnly === true
    && summary.readOnly === true
    && summary.redacted === true
    && summary.machineValueSafe === true
    && REQUIRED_FALSE_DETAIL_PREVIEW_SOURCE_FLAGS.every((key) => summary[key] === false);
}

export function buildShellProjectBrowserSelectedProjectExportManifestPreview(
  sourceSummary = null,
  expectedSelectedProjectId = null,
) {
  const sourceSummaryPresent = isPlainObject(sourceSummary);
  const sourceSelectedProjectId = sourceSummaryPresent ? safeId(sourceSummary.selectedProjectId) : null;
  const expectedSelection = safeId(expectedSelectedProjectId);
  const selectedProjectMatches = !expectedSelection || sourceSelectedProjectId === expectedSelection;
  const sourceSafe = sourceSummaryPresent
    && selectedProjectMatches
    && manifestPreviewSourceIsSafe(sourceSummary);
  const sourceReady = sourceSafe
    && sourceSummary.ready === true
    && sourceSummary.failClosed === false
    && sourceSummary.readiness === "ready"
    && sourceSummary.manifestSummaryPresent === true
    && sourceSummary.manifestBoundaryReady === true;
  const sourceMissing = sourceSafe && sourceSummary.readiness === "missing";
  const state = sourceReady
    ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.ready
    : !sourceSummaryPresent || sourceMissing
      ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.missing
      : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.blockedFailClosed;
  const readiness = sourceReady
    ? "ready"
    : state === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.missing
      ? "missing"
      : "blocked_fail_closed";
  const blocker = sourceReady
    ? null
    : !sourceSummaryPresent
      ? "selected-project-export-manifest-preview-summary-missing"
      : !selectedProjectMatches
        ? "selected-project-export-manifest-preview-selection-mismatch"
        : sourceSafe
          ? safeId(sourceSummary.blocker)
            || "selected-project-export-manifest-preview-not-ready"
          : "selected-project-export-manifest-preview-source-blocked";
  const selectedProjectId = sourceSelectedProjectId;
  const firstCandidateOutputKind = sourceReady
    ? safeId(sourceSummary.firstCandidateOutputKind)
    : null;

  return Object.freeze(orderedObject(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_FIELD_ORDER,
    {
      schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_ID,
      schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_VERSION,
      contractId:
        SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SURFACE_CONTRACT_ID,
      owner: "shell",
      surfaceId: "selected-project-export-manifest-preview",
      label: "Export contents",
      state,
      readiness,
      ready: sourceReady,
      failClosed: !sourceReady,
      blocker,
      selectedProjectId,
      selectedProjectFound: sourceSummaryPresent && sourceSummary.selectedProjectFound === true,
      selectedProjectOnly: true,
      sourceSummaryPresent,
      manifestSummaryPresent: sourceReady,
      manifestBoundaryReady: sourceReady,
      runTableRowCount: sourceReady ? safeNonNegativeInteger(sourceSummary.runTableRowCount) : 0,
      candidateOutputRecordCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.candidateOutputRecordCount)
        : 0,
      manifestRecordCount: sourceReady ? safeNonNegativeInteger(sourceSummary.manifestRecordCount) : 0,
      manifestEntryCount: sourceReady ? safeNonNegativeInteger(sourceSummary.manifestEntryCount) : 0,
      firstCandidateOutputKind,
      previewOnly: true,
      diagnosticOnly: true,
      readOnly: true,
      redacted: true,
      machineValueSafe: true,
      nonDownloadable: true,
      manifestFileExists: false,
      manifestDownloadable: false,
      manifestFileOutputEnabled: false,
      manifestFileOutputWritten: false,
      downloadEnabled: false,
      downloadAvailable: false,
      rawManifestExposed: false,
      candidateOutputDetailsExposed: false,
      artifactListExposed: false,
      rawIesExposed: false,
      candelaExposed: false,
      photometryExposed: false,
      governanceExposed: false,
      mutationLogExposed: false,
      privatePathExposed: false,
      base64Exposed: false,
      filenameExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
      persistenceMutated: false,
      runtimeDataMutated: false,
      filesystemWriteAttempted: false,
    },
  ));
}

export function buildShellProjectBrowserSelectedProjectExportDetailPreview(
  sourceSummary = null,
  expectedSelectedProjectId = null,
) {
  const sourceSummaryPresent = isPlainObject(sourceSummary);
  const sourceSelectedProjectId = sourceSummaryPresent ? safeId(sourceSummary.selectedProjectId) : null;
  const expectedSelection = safeId(expectedSelectedProjectId);
  const selectedProjectMatches = !expectedSelection || sourceSelectedProjectId === expectedSelection;
  const sourceSafe = sourceSummaryPresent
    && selectedProjectMatches
    && detailPreviewSourceIsSafe(sourceSummary);
  const sourceReady = sourceSafe
    && sourceSummary.ready === true
    && sourceSummary.failClosed === false
    && sourceSummary.readiness === "ready"
    && sourceSummary.detailSummaryPresent === true
    && sourceSummary.detailBoundaryReady === true;
  const sourceMissing = sourceSafe && sourceSummary.readiness === "missing";
  const state = sourceReady
    ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.ready
    : !sourceSummaryPresent || sourceMissing
      ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.missing
      : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.blockedFailClosed;
  const readiness = sourceReady
    ? "ready"
    : state === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.missing
      ? "missing"
      : "blocked_fail_closed";
  const blocker = sourceReady
    ? null
    : !sourceSummaryPresent
      ? "selected-project-export-detail-preview-summary-missing"
      : !selectedProjectMatches
        ? "selected-project-export-detail-preview-selection-mismatch"
        : sourceSafe
          ? safeId(sourceSummary.blocker)
            || "selected-project-export-detail-preview-not-ready"
          : "selected-project-export-detail-preview-source-blocked";

  return Object.freeze(orderedObject(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_FIELD_ORDER,
    {
      schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID,
      schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_VERSION,
      contractId:
        SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SURFACE_CONTRACT_ID,
      owner: "shell",
      surfaceId: "selected-project-export-detail-preview",
      label: "Export details",
      state,
      readiness,
      ready: sourceReady,
      failClosed: !sourceReady,
      blocker,
      selectedProjectId: sourceSelectedProjectId,
      selectedProjectFound: sourceSummaryPresent && sourceSummary.selectedProjectFound === true,
      selectedProjectOnly: true,
      sourceSummaryPresent,
      detailSummaryPresent: sourceReady,
      detailBoundaryReady: sourceReady,
      runTableRowCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.sourceRunTableRowCount)
        : 0,
      candidateOutputRecordCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.candidateOutputRecordCount)
        : 0,
      manifestRecordCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.manifestRecordCount)
        : 0,
      detailRecordCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.detailRecordCount)
        : 0,
      detailEntryCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.detailEntryCount)
        : 0,
      firstDetailEntryKind: sourceReady ? safeId(sourceSummary.firstDetailEntryKind) : null,
      firstCandidateOutputKind: sourceReady ? safeId(sourceSummary.firstCandidateOutputKind) : null,
      firstManifestEntryKind: sourceReady ? safeId(sourceSummary.firstManifestEntryKind) : null,
      firstRowKind: sourceReady ? safeId(sourceSummary.firstRowKind) : null,
      firstRunIndex: sourceReady
        ? safeOptionalNonNegativeInteger(sourceSummary.firstRunIndex)
        : null,
      firstRowAccepted: sourceReady && sourceSummary.firstRowAccepted === true,
      firstRowEngineVerified: sourceReady && sourceSummary.firstRowEngineVerified === true,
      firstRowBoardCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.firstRowBoardCount)
        : 0,
      firstRowSegmentCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.firstRowSegmentCount)
        : 0,
      firstRowZoneCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.firstRowZoneCount)
        : 0,
      firstRowClipPointsCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.firstRowClipPointsCount)
        : 0,
      firstRowSuspensionPointsCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.firstRowSuspensionPointsCount)
        : 0,
      firstRowGearTrayPlanCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.firstRowGearTrayPlanCount)
        : 0,
      firstRowReservedRangesCount: sourceReady
        ? safeNonNegativeInteger(sourceSummary.firstRowReservedRangesCount)
        : 0,
      previewOnly: true,
      diagnosticOnly: true,
      detailOnly: true,
      readOnly: true,
      redacted: true,
      machineValueSafe: true,
      nonDownloadable: true,
      detailFileExists: false,
      detailDownloadable: false,
      detailFileOutputEnabled: false,
      detailFileOutputWritten: false,
      downloadEnabled: false,
      downloadAvailable: false,
      sourceRowsExposed: false,
      candidateOutputDetailsExposed: false,
      artifactListExposed: false,
      rawDetailExposed: false,
      rawManifestExposed: false,
      rawCandidateOutputExposed: false,
      rawIesExposed: false,
      candelaExposed: false,
      photometryExposed: false,
      governanceExposed: false,
      mutationLogExposed: false,
      privatePathExposed: false,
      blobExposed: false,
      urlExposed: false,
      base64Exposed: false,
      filenameExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
      persistenceMutated: false,
      runtimeDataMutated: false,
      filesystemWriteAttempted: false,
      outputGenerationEnabled: false,
    },
  ));
}

function selectedProjectSummary(context) {
  const browser = context?.projectBrowser || {};
  const selectedProjectId = safeId(browser.selectedProjectId)
    || safeId(browser.selectedProjectIesExportResultReadbackDetailSummary?.selectedProjectId);
  const selected = (browser.projects || []).find((project) => (
    project?.envelopeId === selectedProjectId || project?.projectId === selectedProjectId
  ));
  return {
    selectedProjectId,
    selectedProjectTitle: safeDisplayText(
      selected?.title,
      selectedProjectId ? "Selected project" : "Select a saved project",
    ),
    selectedProjectFound: Boolean(selectedProjectId && selected),
  };
}

function orderedObject(fieldOrder, fields) {
  return Object.fromEntries(fieldOrder.map((key) => [key, fields[key]]));
}

function createShellProjectBrowserProjectIesExportDownloadOutcomeSnapshot({
  state = SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.idle,
  filename = null,
  mediaType = null,
  extension = null,
  byteLength = null,
  blocker = null,
} = {}) {
  return Object.freeze(orderedObject(
    SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
    {
      state,
      filename,
      mediaType,
      extension,
      byteLength,
      blocker,
    },
  ));
}

function safeProjectIesExportDownloadOutcomeBlocker(
  blocker,
  fallback = "project-ies-export-download-action-blocked",
) {
  return typeof blocker === "string"
    && PROJECT_IES_EXPORT_DOWNLOAD_BLOCKER_PATTERN.test(blocker)
    ? blocker
    : fallback;
}

function safeProjectIesExportDownloadOutcomeMetadata(receipt) {
  const metadata = receipt?.downloadMetadata;
  if (receipt?.downloadTriggered !== true
    || receipt?.failClosed === true
    || !metadata
    || !PROJECT_IES_EXPORT_DOWNLOAD_FILENAME_PATTERN.test(String(metadata.filename || ""))
    || metadata.mediaType !== PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE
    || metadata.extension !== ".ies"
    || !Number.isSafeInteger(metadata.byteLength)
    || metadata.byteLength <= 0) {
    return null;
  }

  return {
    filename: metadata.filename,
    mediaType: metadata.mediaType,
    extension: metadata.extension,
    byteLength: metadata.byteLength,
  };
}

export function createShellProjectBrowserProjectIesExportDownloadOutcomeState() {
  let snapshot = createShellProjectBrowserProjectIesExportDownloadOutcomeSnapshot();

  return Object.freeze({
    getSnapshot() {
      return snapshot;
    },

    reset() {
      snapshot = createShellProjectBrowserProjectIesExportDownloadOutcomeSnapshot();
      return snapshot;
    },

    recordReceipt(receipt = {}) {
      const metadata = safeProjectIesExportDownloadOutcomeMetadata(receipt);
      if (metadata) {
        snapshot = createShellProjectBrowserProjectIesExportDownloadOutcomeSnapshot({
          state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started,
          ...metadata,
        });
        return snapshot;
      }

      snapshot = createShellProjectBrowserProjectIesExportDownloadOutcomeSnapshot({
        state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
        blocker: safeProjectIesExportDownloadOutcomeBlocker(receipt?.blocker),
      });
      return snapshot;
    },

    recordBlocked(blocker = "project-ies-export-download-action-failed") {
      snapshot = createShellProjectBrowserProjectIesExportDownloadOutcomeSnapshot({
        state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
        blocker: safeProjectIesExportDownloadOutcomeBlocker(
          blocker,
          "project-ies-export-download-action-failed",
        ),
      });
      return snapshot;
    },
  });
}

// Compatibility source anchor for the landed outcome-state audit: function buildExportItem
function buildProjectIesExportItem({ ready, blocker }) {
  return Object.freeze(orderedObject(
    SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_FIELD_ORDER,
    {
      schemaId: SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID,
      schemaVersion: SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_VERSION,
      exportId: "project-ies",
      label: "Project IES",
      format: "LM-63",
      extension: ".ies",
      actionLabel: "Open data retrieval",
      state: ready ? "ready" : "blocked",
      readiness: ready ? "ready" : "blocked_fail_closed",
      ready,
      failClosed: !ready,
      blocker: ready ? null : blocker,
    },
  ));
}

function buildWorkflowDescriptor({ context, ready, blocker }) {
  const selected = selectedProjectSummary(context);
  const hasSelection = Boolean(selected.selectedProjectId);
  const state = ready
    ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.ready
    : hasSelection
      ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.blockedFailClosed
      : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.missing;
  const safeBlocker = ready
    ? null
    : safeId(blocker) || (hasSelection
      ? "project-ies-export-download-action-unavailable"
      : "selected-project-missing");
  const output = buildProjectIesExportItem({ ready, blocker: safeBlocker });
  const descriptor = orderedObject(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_FIELD_ORDER,
    {
      schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID,
      schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_VERSION,
      contractId: SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_SURFACE_CONTRACT_ID,
      owner: "shell",
      surfaceId: "selected-project-exports",
      label: "Project exports",
      state,
      readiness: ready ? "ready" : hasSelection ? "blocked_fail_closed" : "missing",
      ready,
      failClosed: !ready,
      blocker: safeBlocker,
      selectedProjectId: selected.selectedProjectId,
      selectedProjectTitle: selected.selectedProjectTitle,
      selectedProjectFound: selected.selectedProjectFound,
      selectedProjectOnly: true,
      exportItemCount: 1,
      readyExportItemCount: ready ? 1 : 0,
      blockedExportItemCount: ready ? 0 : 1,
      outputs: Object.freeze([output]),
      readOnly: true,
      browserOnly: true,
      userGestureRequired: true,
      redacted: true,
      preparedActionRetainedPrivately: false,
      rawIesExposed: false,
      blobExposed: false,
      objectUrlExposed: false,
      filenameExposed: false,
      candelaExposed: false,
      photometryExposed: false,
      governanceExposed: false,
      mutationLogExposed: false,
      privatePathExposed: false,
      base64Exposed: false,
      projectEnvelopeExposed: false,
      fullReadbackStatusExposed: false,
      sourceBoundaryExposed: false,
      materialisationBoundaryExposed: false,
      preparedActionExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
      persistenceMutated: false,
      runtimeDataMutated: false,
      filesystemWriteAttempted: false,
    },
  );
  const frozenDescriptor = Object.freeze(descriptor);
  PRIVATE_MANIFEST_PREVIEWS.set(
    frozenDescriptor,
    buildShellProjectBrowserSelectedProjectExportManifestPreview(
      context?.projectBrowser?.selectedProjectCandidateOutputManifestReadbackSummary,
      selected.selectedProjectId,
    ),
  );
  PRIVATE_DETAIL_PREVIEWS.set(
    frozenDescriptor,
    buildShellProjectBrowserSelectedProjectExportDetailPreview(
      context?.projectBrowser?.selectedProjectCandidateOutputDetailReadbackSummary,
      selected.selectedProjectId,
    ),
  );
  return frozenDescriptor;
}

export async function prepareShellProjectBrowserSelectedProjectExportsWorkflow({
  context = {},
} = {}) {
  return buildWorkflowDescriptor({
    context,
    ready: false,
    blocker: "governance-data-retrieval-gateway-required",
  });
}

export function getShellProjectBrowserSelectedProjectExportAction() {
  return null;
}

export function getShellProjectBrowserSelectedProjectExportManifestPreview(workflowDescriptor) {
  return PRIVATE_MANIFEST_PREVIEWS.get(workflowDescriptor) || null;
}

export function getShellProjectBrowserSelectedProjectExportDetailPreview(workflowDescriptor) {
  return PRIVATE_DETAIL_PREVIEWS.get(workflowDescriptor) || null;
}
