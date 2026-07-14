import { stableFingerprint } from "./stableFingerprint.js";
import { buildSelectedResultPersistedSummaryReadbackProjectSummary } from "./savedProjectStore.js";
import { buildSelectedResultPersistedSummaryReadbackStatus } from "./selectedResultPersistedSummaryReadbackStatus.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
} from "./selectedResultPersistenceBoundaryContract.js";
import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "./runTableFirstNarrowOutputHandoffContract.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_TARGET,
} from "./iesFirstNarrowCandidateOutputManifestSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET,
} from "./iesFirstNarrowCandidateOutputDetailSummary.js";

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-result-persisted-summary-readback-summary.v1";
export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-result-persisted-summary-readback-detail-summary.v1";
export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-selected-result-persisted-summary-readback-status.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-selected-result-persisted-summary-readback-detail-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.project-ies-export-boundary-readback-summary.v1";
export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-ies-export-boundary-readback-detail-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.project-ies-export-result-readback-summary.v1";
export const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-ies-export-result-readback-detail-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-candidate-output-manifest-readback-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "manifestSummaryPresent",
  "manifestBoundaryReady",
  "runTableRowCount",
  "candidateOutputRecordCount",
  "manifestRecordCount",
  "manifestEntryCount",
  "firstCandidateOutputKind",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "iesFirstNarrowMetadataHandoffSummaryFingerprint",
  "iesFirstNarrowCandidateOutputSummaryFingerprint",
  "iesFirstNarrowCandidateOutputManifestSummaryFingerprint",
  "targetLocation",
  "selectedProjectOnly",
  "summaryOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
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
  "projectBrowserSelectedProjectCandidateOutputManifestReadbackSummaryFingerprint",
]);

export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-candidate-output-detail-readback-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "detailSummaryPresent",
  "detailBoundaryReady",
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
  "iesFirstNarrowMetadataHandoffSummaryFingerprint",
  "iesFirstNarrowCandidateOutputSummaryFingerprint",
  "iesFirstNarrowCandidateOutputManifestSummaryFingerprint",
  "iesFirstNarrowCandidateOutputDetailSummaryFingerprint",
  "targetLocation",
  "selectedProjectOnly",
  "summaryOnly",
  "diagnosticOnly",
  "detailOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
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
  "projectBrowserSelectedProjectCandidateOutputDetailReadbackSummaryFingerprint",
]);

export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-engine-run-readiness-readback-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "selectedResultSummaryPresent",
  "runTableFirstNarrowOutputSummaryPresent",
  "selectedResultReadbackState",
  "selectedResultReadbackReadiness",
  "selectedResultReadbackReady",
  "selectedResultReadbackFailClosed",
  "selectedResultReadbackBlocker",
  "selectedResultSummarySchemaId",
  "selectedResultSummarySchemaVersion",
  "selectedResultSummaryState",
  "runTableFirstNarrowOutputSummarySchemaId",
  "runTableFirstNarrowOutputSummarySchemaVersion",
  "runTableFirstNarrowOutputSummaryState",
  "runTableFirstNarrowOutputHandoffContractState",
  "runTableFirstNarrowOutputHandoffContractReady",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "authorityStatesAligned",
  "fingerprintsAligned",
  "engineRunReadinessReadbackReady",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "selectedResultPersistedSummarySlotContractFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
  "selectedResultPersistedSummaryReadbackFingerprint",
  "selectedResultTargetLocation",
  "runTableFirstNarrowOutputTargetLocation",
  "selectedProjectOnly",
  "summaryOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "runTableRowsIncluded",
  "runTableRowCount",
  "engineExecutionEnabled",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "outputGenerated",
  "outputGenerationEnabled",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawSelectedPayloadReturned",
  "runTableRowsReturned",
  "rawRunTableRowsReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "privatePathsReturned",
  "projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint",
]);

export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "sourceSummarySchemaId",
  "sourceSummarySchemaVersion",
  "sourceSummaryState",
  "sourceSummaryReadiness",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "resultReadbackState",
  "resultReadbackReadiness",
  "resultReadbackReady",
  "resultReadbackFailClosed",
  "resultReadbackBlocker",
  "moduleId",
  "consumerModuleId",
  "targetLocation",
  "safeReadbackStatusOnly",
  "readOnly",
  "selectedProjectOnly",
  "detailOnly",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceReadbackFingerprint",
  "sourceProjectBrowserProjectIesExportResultReadbackSummaryFingerprint",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
  "projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint",
]);

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION = Object.freeze({
  schemaId: "controlstack.runtime.project-browser.project-ies-export-readback-surface-classification.v1",
  schemaVersion: 1,
  solePrimaryBrowserReadinessPair: Object.freeze([
    "projectIesExportResultReadbackSummary",
    "selectedProjectIesExportResultReadbackDetailSummary",
  ]),
  frozenLegacyButKeptCompatibilityDiagnostics: Object.freeze([
    "projectIesExportBoundaryReadbackSummary",
    "selectedProjectIesExportBoundaryReadbackDetailSummary",
  ]),
  deletionProhibitedUntilSeparateStagedRemovalPlanExists: true,
  readOnly: true,
  summaryOnly: true,
  redacted: true,
  deterministic: true,
});

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STAGED_REMOVAL_PLAN = Object.freeze({
  schemaId: "controlstack.runtime.project-browser.project-ies-export-boundary-readback-staged-removal-plan.v1",
  schemaVersion: 1,
  currentStage: "freeze-and-retain",
  frozenBoundaryReadbackPair: Object.freeze([
    "projectIesExportBoundaryReadbackSummary",
    "selectedProjectIesExportBoundaryReadbackDetailSummary",
  ]),
  soleReplacementResultReadbackPair: Object.freeze([
    "projectIesExportResultReadbackSummary",
    "selectedProjectIesExportResultReadbackDetailSummary",
  ]),
  newFeatureWorkProhibited: true,
  newConsumerAdoptionProhibited: true,
  compatibilityPresenceMandatory: true,
  compatibilityShapeMandatory: true,
  explicitConsumerInventoryRequiredBeforeRemoval: true,
  explicitConsumerMigrationEvidenceRequiredBeforeRemoval: true,
  removalAuthorised: false,
  readOnly: true,
  declarative: true,
  deterministic: true,
});

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_CONSUMER_INVENTORY = Object.freeze({
  schemaId: "controlstack.runtime.project-browser.project-ies-export-boundary-readback-consumer-inventory.v1",
  schemaVersion: 1,
  inventoryScope: "tracked-runtime-source-and-contract-tests",
  inventoryState: "repository_consumers_inventoried_removal_not_authorised",
  inventoriedBoundaryReadbackPair: Object.freeze([
    "projectIesExportBoundaryReadbackSummary",
    "selectedProjectIesExportBoundaryReadbackDetailSummary",
  ]),
  replacementResultReadbackPair: Object.freeze([
    "projectIesExportResultReadbackSummary",
    "selectedProjectIesExportResultReadbackDetailSummary",
  ]),
  directFieldSpecificRuntimeConsumers: Object.freeze([
    Object.freeze({
      consumerId: "selected-project-boundary-readback-detail-derivation",
      sourceFile: "packages/workspace-kernel/projectBrowserService.js",
      sourceSurface: "projectIesExportBoundaryReadbackSummary",
      consumerFunction: "buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary",
      outputSurface: "selectedProjectIesExportBoundaryReadbackDetailSummary",
      replacementSourceSurface: "projectIesExportResultReadbackSummary",
      replacementConsumerFunction: "buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary",
      replacementOutputSurface: "selectedProjectIesExportResultReadbackDetailSummary",
      compatibilityOnly: true,
      featureConsumer: false,
      replacementPresent: true,
      migratedToReplacement: false,
    }),
  ]),
  wholeSnapshotCarriers: Object.freeze([
    Object.freeze({
      carrierId: "shell-context-project-browser-snapshot",
      sourceFile: "packages/workspace-kernel/context.js",
      functionName: "createShellContext",
      fieldSpecificRead: false,
    }),
    Object.freeze({
      carrierId: "diagnostics-project-browser-snapshot",
      sourceFile: "packages/plugins/diagnostics/diagnosticsViewModel.js",
      functionName: "readProjectBrowser",
      fieldSpecificRead: false,
    }),
  ]),
  knownFeatureConsumers: Object.freeze([]),
  compatibilityContractTests: Object.freeze([
    "tests/runtimeProjectBrowserProjectIesExportBoundaryReadbackConsumer.test.js",
    "tests/runtimeProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailConsumer.test.js",
    "tests/runtimeProjectBrowserProjectIesExportReadbackSurfaceClassification.test.js",
    "tests/runtimeProjectBrowserProjectIesExportBoundaryReadbackStagedRemovalPlan.test.js",
    "tests/runtimeIesFirstNarrowProjectIesExportCrossLayerContractLock.test.js",
  ]),
  trackedRepositoryInventoryComplete: true,
  consumerFree: false,
  externalConsumerAbsenceProven: false,
  migrationEvidenceComplete: false,
  removalAuthorised: false,
  readOnly: true,
  declarative: true,
  deterministic: true,
});

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES = Object.freeze({
  ready: "project_browser_selected_result_persisted_summary_readback_ready",
  missing: "project_browser_selected_result_persisted_summary_readback_missing",
  blockedFailClosed: "project_browser_selected_result_persisted_summary_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES = Object.freeze({
  ready: "project_browser_selected_result_persisted_summary_readback_detail_ready",
  missing: "project_browser_selected_result_persisted_summary_readback_detail_missing",
  blockedFailClosed: "project_browser_selected_result_persisted_summary_readback_detail_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES = Object.freeze({
  ready: "project_browser_selected_project_selected_result_persisted_summary_readback_ready",
  missing: "project_browser_selected_project_selected_result_persisted_summary_readback_missing",
  blockedFailClosed: "project_browser_selected_project_selected_result_persisted_summary_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES = Object.freeze({
  ready: "project_browser_selected_project_selected_result_persisted_summary_readback_detail_ready",
  missing: "project_browser_selected_project_selected_result_persisted_summary_readback_detail_missing",
  blockedFailClosed: "project_browser_selected_project_selected_result_persisted_summary_readback_detail_blocked_fail_closed",
});

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES = Object.freeze({
  ready: "project_browser_project_ies_export_boundary_readback_ready",
  missing: "project_browser_project_ies_export_boundary_readback_missing",
  blockedFailClosed: "project_browser_project_ies_export_boundary_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES = Object.freeze({
  ready: "project_browser_selected_project_ies_export_boundary_readback_detail_ready",
  missing: "project_browser_selected_project_ies_export_boundary_readback_detail_missing",
  blockedFailClosed: "project_browser_selected_project_ies_export_boundary_readback_detail_blocked_fail_closed",
});

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES = Object.freeze({
  ready: "project_browser_project_ies_export_result_readback_ready",
  missing: "project_browser_project_ies_export_result_readback_missing",
  blockedFailClosed: "project_browser_project_ies_export_result_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES = Object.freeze({
  ready: "project_browser_selected_project_ies_export_result_readback_detail_ready",
  missing: "project_browser_selected_project_ies_export_result_readback_detail_missing",
  blockedFailClosed: "project_browser_selected_project_ies_export_result_readback_detail_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES = Object.freeze({
  ready: "project_browser_selected_project_candidate_output_manifest_readback_ready",
  missing: "project_browser_selected_project_candidate_output_manifest_readback_missing",
  blockedFailClosed: "project_browser_selected_project_candidate_output_manifest_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES = Object.freeze({
  ready: "project_browser_selected_project_candidate_output_detail_readback_ready",
  missing: "project_browser_selected_project_candidate_output_detail_readback_missing",
  blockedFailClosed: "project_browser_selected_project_candidate_output_detail_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES = Object.freeze({
  ready: "project_browser_selected_project_engine_run_readiness_readback_ready",
  missing: "project_browser_selected_project_engine_run_readiness_readback_missing",
  blockedFailClosed: "project_browser_selected_project_engine_run_readiness_readback_blocked_fail_closed",
});

const PROJECT_BROWSER_SELECTED_RESULT_READBACK_SOURCE =
  "project-browser-project-summary-selected-result-readback-consumer";
const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_STATUS_SOURCE =
  "project-browser-selected-project-project-summary-selected-result-readback-status-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_DETAIL_SOURCE =
  "project-browser-selected-project-project-summary-selected-result-readback-detail-consumer";
const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SOURCE =
  "project-browser-saved-project-project-ies-export-boundary-readback-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SOURCE =
  "project-browser-selected-project-project-ies-export-boundary-readback-detail-consumer";
const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SOURCE =
  "project-browser-saved-project-project-ies-export-result-readback-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SOURCE =
  "project-browser-selected-project-project-ies-export-result-readback-detail-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SOURCE =
  "project-browser-selected-project-candidate-output-manifest-readback-summary-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SOURCE =
  "project-browser-selected-project-candidate-output-detail-readback-summary-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE =
  "project-browser-selected-project-engine-run-readiness-readback-summary-consumer";
const SELECTED_RESULT_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";
const RUNTABLE_FIRST_NARROW_OUTPUT_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary";
const PROJECT_IES_EXPORT_BOUNDARY_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary";
const PROJECT_IES_EXPORT_RESULT_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultSummary";

const CANDIDATE_OUTPUT_MANIFEST_RAW_OR_PRIVATE_KEYS = Object.freeze([
  "ies",
  "iesText",
  "rawIes",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "candela",
  "candelaGrid",
  "candelaArray",
  "candelaArrays",
  "governance",
  "governancePayload",
  "mutationLog",
  "rawManifest",
  "manifest",
  "artifactManifest",
  "outputManifest",
  "artifactList",
  "outputFiles",
  "files",
  "filename",
  "fileName",
  "filePath",
  "localPath",
  "privatePath",
  "absolutePath",
  "targetPath",
  "writeTarget",
  "base64",
  "base64Artifacts",
  "artifactBase64",
  "sourceRows",
  "runTableRows",
  "rawRunTableRows",
  "candidateOutputDetails",
  "rawCandidateOutput",
  "projectEnvelope",
  "envelopeBody",
  "resultBody",
]);

const CANDIDATE_OUTPUT_MANIFEST_UNSAFE_TRUE_KEYS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS,
  "artifactManifestGenerated",
  "artifactManifestWritten",
  "rawManifestReturned",
  "rawCandidateOutputReturned",
  "manifestFileExists",
  "manifestDownloadable",
  "downloadEnabled",
  "downloadAvailable",
]);

const CANDIDATE_OUTPUT_DETAIL_RAW_OR_PRIVATE_KEYS = Object.freeze([
  ...CANDIDATE_OUTPUT_MANIFEST_RAW_OR_PRIVATE_KEYS,
  "detail",
  "rawDetail",
  "detailPayload",
  "rawDetailPayload",
  "candidateOutputDetail",
  "candidateOutputDetailObject",
  "rawCandidateOutputDetails",
  "url",
  "uri",
  "downloadUrl",
  "downloadUri",
  "blob",
  "blobs",
]);

const CANDIDATE_OUTPUT_DETAIL_UNSAFE_TRUE_KEYS = Object.freeze([
  ...RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
  "detailGenerated",
  "detailGenerationEnabled",
  "detailGenerationAttempted",
  "rawDetailReturned",
  "detailFileExists",
  "detailDownloadable",
  "downloadEnabled",
  "downloadAvailable",
]);

const CANDIDATE_OUTPUT_MANIFEST_READY_STATE =
  "redacted_ies_first_narrow_candidate_output_manifest_summary_persisted";
const CANDIDATE_OUTPUT_DETAIL_READY_STATE =
  "redacted_ies_first_narrow_candidate_output_detail_summary_persisted";
const RAW_IES_TEXT_PATTERN = /IESNA:|TILT=/i;
const DATA_BASE64_PATTERN = /data:[^\s"']*base64|base64,/i;
const OUTPUT_FILE_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json)(?:$|[\s?#])/i;
const URL_OR_BLOB_VALUE_PATTERN = /(?:https?:\/\/|file:|blob:)/i;

const READBACK_RAW_OR_PRIVATE_KEYS = Object.freeze([
  "body",
  "resultBody",
  "selectedResultBody",
  "selected_result_body",
  "selectedResultObject",
  "selected_result_object",
  "selectedResultPayload",
  "rawSelectedPayload",
  "selectedPayload",
  "enginePayload",
  "rawEnginePayload",
  "raw_engine_payload",
  "engineResult",
  "rawEngineResult",
  "raw_engine_result",
  "selectorPayload",
  "rawSelectorPayload",
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawProductRows",
  "rawBoardRows",
  "rawDriverRows",
  "rawAccessoryRows",
  "sourceRows",
  "rawSourceRows",
  "ies",
  "iesText",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "candela",
  "candelaGrid",
  "rawCandelaGrid",
  "base64",
  "base64Artifacts",
  "artifactBase64",
  "credentials",
  "secrets",
  "filename",
  "fileName",
  "privatePath",
  "localPath",
  "downstreamContext",
  "moduleState",
  "envelopeBody",
  "projectEnvelope",
]);

const READBACK_UNSAFE_TRUE_KEYS = Object.freeze([
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "credentialsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "selectedResultPersistenceAttempted",
  "runTableGenerationAttempted",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
]);

const ENGINE_RUN_READINESS_RAW_OR_PRIVATE_KEYS = Object.freeze([
  ...new Set([
    ...READBACK_RAW_OR_PRIVATE_KEYS,
    ...CANDIDATE_OUTPUT_DETAIL_RAW_OR_PRIVATE_KEYS,
    "rows",
    "candidateOutput",
    "candidateOutputs",
    "candidateOutputBody",
    "candidateOutputPayload",
    "manifestBody",
    "detailBody",
    "artifactBody",
    "outputBody",
    "outputPayload",
  ]),
]);

const ENGINE_RUN_READINESS_UNSAFE_TRUE_KEYS = Object.freeze([
  ...new Set([
    ...READBACK_UNSAFE_TRUE_KEYS,
    ...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
    "engineExecutionEnabled",
    "engineExecutionAttempted",
    "engineInvoked",
    "runEngineInvoked",
    "selectedResultCreated",
    "outputAvailable",
    "candidateOutputAvailable",
  ]),
]);

const ENGINE_RUN_READINESS_RUNTABLE_ALLOWED_FIELDS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "state",
  "summaryOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceKind",
  "futureOutputKind",
  "rowsIncluded",
  "rowCount",
  "generated",
  "generationEnabled",
  "persisted",
  "routeAdded",
  "postEndpointAdded",
  "runTableFirstNarrowOutputHandoffContractState",
  "runTableFirstNarrowOutputHandoffContractReady",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "selectedResultPersistedSummarySlotContractFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
  ...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
]);

const ENGINE_RUN_READINESS_AUTHORITY_STATE_FIELDS = Object.freeze([
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
]);

const ENGINE_RUN_READINESS_ALIGNED_FINGERPRINT_FIELDS = Object.freeze([
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
]);

const SAFE_READBACK_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,700}$|^[0-9a-f]{32,128}$/i;

const PROJECT_IES_EXPORT_BOUNDARY_RAW_OR_PRIVATE_KEYS = Object.freeze([
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
  "candela",
  "candelaGrid",
  "candelaArray",
  "candelaArrays",
  "photometry",
  "rawPhotometry",
  "governance",
  "rawGovernance",
  "governancePayload",
  "rawGovernancePayload",
  "outputFiles",
  "files",
  "filename",
  "fileName",
  "filePath",
  "localPath",
  "privatePath",
  "targetPath",
  "writeTarget",
  "base64",
  "base64Artifacts",
  "projectEnvelope",
  "envelopeBody",
]);

const PROJECT_IES_EXPORT_BOUNDARY_UNSAFE_TRUE_KEYS = Object.freeze([
  "rawIesReturned",
  "rawIesExposed",
  "rawProjectIesReturned",
  "rawProjectIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
]);

const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function orderedSelectedProjectIesExportResultReadbackDetailSummary(fields) {
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function orderedSelectedProjectCandidateOutputManifestReadbackSummary(fields) {
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

export function orderedSelectedProjectCandidateOutputDetailReadbackSummary(fields) {
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

export function orderedSelectedProjectEngineRunReadinessReadbackSummary(fields) {
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function safeToken(value, fallback = null, maxLength = 220) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_VALUE_PATTERN.test(raw)) return fallback;
  const token = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return token || fallback;
}

function safeBoolean(value) {
  return value === true;
}

function safeSchemaVersion(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const version = Number(value);
  return Number.isFinite(version) ? version : null;
}

function safeNonNegativeInteger(value, fallback = 0) {
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : fallback;
}

function safeReadbackFingerprint(value) {
  const token = safeToken(value, null, 760);
  return token && SAFE_READBACK_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function hasNonNullBlocker(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function readProject(project = {}) {
  return {
    projectId: project.metadata?.projectId || project.currentProject?.projectId || null,
    title: project.metadata?.title || project.currentProject?.title || "No project loaded",
    client: project.currentProject?.client || project.metadata?.client || "No client loaded",
    site: project.currentProject?.site || project.metadata?.site || "No site loaded",
    readiness: project.metadata?.readiness || project.currentProject?.readiness || "not-ready",
    source: project.selection?.source || project.metadata?.source || "unknown",
    restoredEnvelopeId: project.metadata?.restoredEnvelopeId || project.selection?.restoredEnvelopeId || null,
    restoredAt: project.metadata?.restoredAt || null,
    handoffPackageId: project.handoff?.lastPreparedPackageId || null,
    handoffPreparedAt: project.handoff?.lastPreparedAt || null,
  };
}

function projectSummaryId(project = {}) {
  return safeToken(project.projectId || project.envelopeId || null, null);
}

function projectSummaryEnvelopeId(project = {}) {
  return safeToken(project.envelopeId || null, null);
}

function readReadbackStatus(project = {}) {
  return isPlainObject(project?.selectedResultPersistedSummaryReadbackStatus)
    ? project.selectedResultPersistedSummaryReadbackStatus
    : null;
}

function findUnsafeReadbackSummaryField(status) {
  if (!isPlainObject(status)) return null;
  for (const key of Object.keys(status)) {
    if (READBACK_RAW_OR_PRIVATE_KEYS.includes(key)) return `blocked-raw-field-${safeToken(key, "unknown")}`;
    if (READBACK_UNSAFE_TRUE_KEYS.includes(key) && status[key] === true) return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
  }
  for (const value of Object.values(status)) {
    if (typeof value === "string" && PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
  }
  return null;
}

function classifyProjectReadback(project = {}) {
  const status = readReadbackStatus(project);
  if (!status) {
    return {
      readiness: "missing",
      ready: false,
      failClosed: true,
      blocker: "selected-result-persisted-summary-readback-status-missing",
      readbackFingerprint: null,
    };
  }

  const unsafeBlocker = findUnsafeReadbackSummaryField(status);
  if (unsafeBlocker) {
    return {
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: unsafeBlocker,
      readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
    };
  }

  const readiness = safeToken(status.readiness, "missing") || "missing";
  const blocker = safeToken(status.blocker, null);
  const blockedByState = readiness === "blocked_fail_closed"
    || status.state === "selected_result_persisted_summary_readback_blocked_fail_closed";
  const blockedByFailClosed = safeBoolean(status.failClosed)
    && hasNonNullBlocker(status.blocker)
    && readiness !== "missing";

  if (blockedByState || blockedByFailClosed) {
    return {
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: blocker || "project-summary-readback-blocked-fail-closed",
      readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
    };
  }

  if (readiness === "ready" && safeBoolean(status.ready) && status.failClosed !== true) {
    return {
      readiness: "ready",
      ready: true,
      failClosed: false,
      blocker: null,
      readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
    };
  }

  return {
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker,
    readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
  };
}

function readProjectIesExportBoundaryReadbackStatus(project = {}, getReadbackStatus = null) {
  if (isPlainObject(project?.iesFirstNarrowProjectIesExportBoundaryReadbackStatus)) {
    return project.iesFirstNarrowProjectIesExportBoundaryReadbackStatus;
  }
  if (typeof getReadbackStatus !== "function") return null;
  const projectIdOrEnvelopeId = projectSummaryEnvelopeId(project) || projectSummaryId(project);
  if (!projectIdOrEnvelopeId) return null;
  try {
    return getReadbackStatus(projectIdOrEnvelopeId);
  } catch {
    return {
      state: "ies_first_narrow_project_ies_export_boundary_readback_blocked_fail_closed",
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-boundary-readback-accessor-failed",
    };
  }
}

function findUnsafeProjectIesExportBoundaryReadbackField(status) {
  if (!isPlainObject(status)) return null;
  for (const [key, value] of Object.entries(status)) {
    if (PROJECT_IES_EXPORT_BOUNDARY_RAW_OR_PRIVATE_KEYS.includes(key)
      && value !== false
      && value !== null
      && value !== undefined
      && value !== "") {
      return `blocked-raw-field-${safeToken(key, "unknown")}`;
    }
    if (PROJECT_IES_EXPORT_BOUNDARY_UNSAFE_TRUE_KEYS.includes(key) && value === true) {
      return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
    }
    if (typeof value === "string" && PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
  }
  return null;
}

function classifyProjectIesExportBoundaryReadback(status) {
  if (!isPlainObject(status)) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.missing,
      readiness: "missing",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-boundary-readback-status-missing",
      readbackFingerprint: null,
    };
  }

  const readbackFingerprint = safeToken(
    status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint,
    null,
    760,
  );
  const unsafeBlocker = findUnsafeProjectIesExportBoundaryReadbackField(status);
  if (unsafeBlocker) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: unsafeBlocker,
      readbackFingerprint,
    };
  }

  const readiness = safeToken(status.readiness, "missing") || "missing";
  const blocker = safeToken(status.blocker, null);
  const blocked = readiness === "blocked_fail_closed"
    || status.state === "ies_first_narrow_project_ies_export_boundary_readback_blocked_fail_closed"
    || (status.failClosed === true && hasNonNullBlocker(status.blocker) && readiness !== "missing");

  if (blocked) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: blocker || "project-ies-export-boundary-readback-blocked-fail-closed",
      readbackFingerprint,
    };
  }

  if (readiness === "ready" && status.ready === true && status.failClosed !== true) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready,
      readiness: "ready",
      ready: true,
      failClosed: false,
      blocker: null,
      readbackFingerprint,
    };
  }

  return {
    state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.missing,
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: blocker || "project-ies-export-boundary-readback-missing",
    readbackFingerprint,
  };
}

function readProjectIesExportResultReadbackStatus(project = {}, getReadbackStatus = null) {
  if (isPlainObject(project?.iesFirstNarrowProjectIesExportResultReadbackStatus)) {
    return project.iesFirstNarrowProjectIesExportResultReadbackStatus;
  }
  if (typeof getReadbackStatus !== "function") return null;
  const projectIdOrEnvelopeId = projectSummaryEnvelopeId(project) || projectSummaryId(project);
  if (!projectIdOrEnvelopeId) return null;
  try {
    return getReadbackStatus(projectIdOrEnvelopeId);
  } catch {
    return {
      state: "ies_first_narrow_project_ies_export_result_readback_blocked_fail_closed",
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-result-readback-accessor-failed",
    };
  }
}

function findUnsafeProjectIesExportResultReadbackField(status) {
  if (!isPlainObject(status)) return null;
  for (const [key, value] of Object.entries(status)) {
    if ((PROJECT_IES_EXPORT_BOUNDARY_RAW_OR_PRIVATE_KEYS.includes(key)
      || READBACK_RAW_OR_PRIVATE_KEYS.includes(key))
      && value !== false
      && value !== null
      && value !== undefined
      && value !== "") {
      return `blocked-raw-field-${safeToken(key, "unknown")}`;
    }
    if ((PROJECT_IES_EXPORT_BOUNDARY_UNSAFE_TRUE_KEYS.includes(key)
      || READBACK_UNSAFE_TRUE_KEYS.includes(key)) && value === true) {
      return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
    }
    if (typeof value === "string" && PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
  }
  return null;
}

function findUnsafeCandidateOutputManifestReadbackField(value, seen = new Set()) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "blocked-raw-ies-value";
    if (DATA_BASE64_PATTERN.test(value)) return "blocked-base64-value";
    if (OUTPUT_FILE_VALUE_PATTERN.test(value)) return "blocked-output-file-value";
    return null;
  }
  if (typeof value !== "object") return null;
  if (seen.has(value)) return "blocked-cyclic-source";
  seen.add(value);

  const entries = Array.isArray(value) ? value.entries() : Object.entries(value);
  for (const [keyOrIndex, entryValue] of entries) {
    const key = String(keyOrIndex);
    if (!Array.isArray(value)) {
      if (CANDIDATE_OUTPUT_MANIFEST_RAW_OR_PRIVATE_KEYS.includes(key)
        && entryValue !== false
        && entryValue !== null
        && entryValue !== undefined
        && entryValue !== "") {
        return `blocked-raw-field-${safeToken(key, "unknown")}`;
      }
      if (CANDIDATE_OUTPUT_MANIFEST_UNSAFE_TRUE_KEYS.includes(key) && entryValue === true) {
        return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
      }
    }
    const nested = findUnsafeCandidateOutputManifestReadbackField(entryValue, seen);
    if (nested) return nested;
  }
  return null;
}

function validateCandidateOutputManifestReadbackSource(summary) {
  if (!isPlainObject(summary)) return "candidate-output-manifest-summary-missing";
  const unsafe = findUnsafeCandidateOutputManifestReadbackField(summary);
  if (unsafe) return unsafe;
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID
    || summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION
    || summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID) {
    return "candidate-output-manifest-summary-schema-or-contract-mismatch";
  }
  if (summary.state !== CANDIDATE_OUTPUT_MANIFEST_READY_STATE) {
    return "candidate-output-manifest-summary-not-ready";
  }
  if (summary.summaryOnly !== true
    || summary.diagnosticOnly !== true
    || summary.safeSummaryOnly !== true
    || summary.redacted !== true
    || summary.machineValueSafe !== true
    || summary.readOnly !== true) {
    return "candidate-output-manifest-summary-safety-flags-invalid";
  }
  if (summary.readyForManifestBoundary !== true
    || summary.readyForFutureOutput !== true
    || summary.manifestJoined !== true
    || summary.runTableFirstNarrowRowsReady !== true
    || summary.iesFirstNarrowMetadataHandoffReady !== true
    || summary.iesFirstNarrowCandidateOutputSummaryReady !== true) {
    return "candidate-output-manifest-summary-readiness-invalid";
  }
  if (safeNonNegativeInteger(summary.sourceRunTableRowCount, -1) !== 1
    || safeNonNegativeInteger(summary.candidateOutputRecordCount, -1) !== 1
    || safeNonNegativeInteger(summary.manifestRecordCount, -1) !== 1
    || safeNonNegativeInteger(summary.manifestEntryCount, -1) !== 1) {
    return "candidate-output-manifest-summary-counts-invalid";
  }
  if (!safeToken(summary.firstCandidateOutputKind, null, 760)) {
    return "candidate-output-manifest-summary-first-output-kind-missing";
  }
  for (const fingerprintKey of [
    "policyFingerprint",
    "sourceFingerprint",
    "sourceInputFingerprint",
    "iesFirstNarrowMetadataHandoffSummaryFingerprint",
    "iesFirstNarrowCandidateOutputSummaryFingerprint",
    "iesFirstNarrowCandidateOutputManifestSummaryFingerprint",
  ]) {
    if (!safeToken(summary[fingerprintKey], null, 760)) {
      return `candidate-output-manifest-summary-${fingerprintKey}-missing`;
    }
  }
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) {
      return `candidate-output-manifest-summary-required-false-flag-invalid-${safeToken(key, "unknown")}`;
    }
  }
  return null;
}

export function findUnsafeCandidateOutputDetailReadbackField(value, seen = new Set()) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "blocked-raw-ies-value";
    if (DATA_BASE64_PATTERN.test(value)) return "blocked-base64-value";
    if (OUTPUT_FILE_VALUE_PATTERN.test(value)) return "blocked-output-file-value";
    if (URL_OR_BLOB_VALUE_PATTERN.test(value)) return "blocked-url-or-blob-value";
    return null;
  }
  if (typeof value !== "object") return null;
  if (seen.has(value)) return "blocked-cyclic-source";
  seen.add(value);

  const entries = Array.isArray(value) ? value.entries() : Object.entries(value);
  for (const [keyOrIndex, entryValue] of entries) {
    const key = String(keyOrIndex);
    if (!Array.isArray(value)) {
      if (CANDIDATE_OUTPUT_DETAIL_RAW_OR_PRIVATE_KEYS.includes(key)
        && entryValue !== false
        && entryValue !== null
        && entryValue !== undefined
        && entryValue !== "") {
        return `blocked-raw-field-${safeToken(key, "unknown")}`;
      }
      if (CANDIDATE_OUTPUT_DETAIL_UNSAFE_TRUE_KEYS.includes(key) && entryValue === true) {
        return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
      }
    }
    const nested = findUnsafeCandidateOutputDetailReadbackField(entryValue, seen);
    if (nested) return nested;
  }
  return null;
}

export function validateCandidateOutputDetailReadbackSource(summary) {
  if (!isPlainObject(summary)) return "candidate-output-detail-summary-missing";
  const unsafe = findUnsafeCandidateOutputDetailReadbackField(summary);
  if (unsafe) return unsafe;
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID
    || summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION
    || summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID) {
    return "candidate-output-detail-summary-schema-or-contract-mismatch";
  }
  if (summary.state !== CANDIDATE_OUTPUT_DETAIL_READY_STATE) {
    return "candidate-output-detail-summary-not-ready";
  }
  if (summary.summaryOnly !== true
    || summary.diagnosticOnly !== true
    || summary.safeSummaryOnly !== true
    || summary.redacted !== true
    || summary.machineValueSafe !== true
    || summary.readOnly !== true
    || summary.deterministicOnly !== true
    || summary.detailOnly !== true
    || summary.candidateOutputOnly !== true) {
    return "candidate-output-detail-summary-safety-flags-invalid";
  }
  if (summary.sourceBacked !== true
    || summary.sourceAnchorOnly !== true
    || summary.opaqueReferenceOnly !== true
    || summary.runTableFirstNarrowRowsReady !== true
    || summary.iesFirstNarrowMetadataHandoffReady !== true
    || summary.iesFirstNarrowCandidateOutputSummaryReady !== true
    || summary.iesFirstNarrowCandidateOutputManifestSummaryReady !== true
    || summary.readyForDetailBoundary !== true
    || summary.readyForFutureOutput !== true
    || summary.detailsJoined !== true) {
    return "candidate-output-detail-summary-readiness-invalid";
  }
  if (summary.sourceRowsIncluded !== false
    || summary.candidateOutputDetailsIncluded !== true
    || summary.artifactListIncluded !== false) {
    return "candidate-output-detail-summary-inclusion-flags-invalid";
  }
  for (const countKey of [
    "sourceRunTableRowCount",
    "candidateOutputRecordCount",
    "manifestRecordCount",
    "detailRecordCount",
    "detailEntryCount",
  ]) {
    if (!Number.isInteger(summary[countKey]) || summary[countKey] !== 1) {
      return `candidate-output-detail-summary-${countKey}-invalid`;
    }
  }
  if (summary.firstRowAccepted !== true || summary.firstRowEngineVerified !== true) {
    return "candidate-output-detail-summary-first-row-verification-invalid";
  }
  for (const countKey of [
    "firstRunIndex",
    "firstRowBoardCount",
    "firstRowSegmentCount",
    "firstRowZoneCount",
    "firstRowClipPointsCount",
    "firstRowSuspensionPointsCount",
    "firstRowGearTrayPlanCount",
    "firstRowReservedRangesCount",
  ]) {
    if (!Number.isInteger(summary[countKey]) || summary[countKey] < 0) {
      return `candidate-output-detail-summary-${countKey}-invalid`;
    }
  }
  for (const tokenKey of [
    "firstDetailEntryKind",
    "firstCandidateOutputKind",
    "firstManifestEntryKind",
    "firstRowKey",
    "firstRowKind",
    "firstRunKey",
    "boardDataSourceVersion",
  ]) {
    if (!safeToken(summary[tokenKey], null, 760)) {
      return `candidate-output-detail-summary-${tokenKey}-missing`;
    }
  }
  for (const fingerprintKey of [
    "policyFingerprint",
    "sourceFingerprint",
    "sourceInputFingerprint",
    "iesFirstNarrowMetadataHandoffSummaryFingerprint",
    "iesFirstNarrowCandidateOutputSummaryFingerprint",
    "iesFirstNarrowCandidateOutputManifestSummaryFingerprint",
    "iesFirstNarrowCandidateOutputDetailSummaryFingerprint",
  ]) {
    if (!safeToken(summary[fingerprintKey], null, 760)) {
      return `candidate-output-detail-summary-${fingerprintKey}-missing`;
    }
  }
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) {
      return `candidate-output-detail-summary-required-false-flag-invalid-${safeToken(key, "unknown")}`;
    }
  }
  return null;
}

function findUnsafeSelectedProjectEngineRunReadinessReadbackNested(value, seen) {
  if (value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "blocked-raw-ies-value";
    if (DATA_BASE64_PATTERN.test(value)) return "blocked-base64-value";
    if (OUTPUT_FILE_VALUE_PATTERN.test(value)) return "blocked-output-file-value";
    if (URL_OR_BLOB_VALUE_PATTERN.test(value)) return "blocked-url-or-blob-value";
    return null;
  }
  if (typeof value !== "object") return null;
  if (seen.has(value)) return "blocked-cyclic-source";
  seen.add(value);

  if (Array.isArray(value)) {
    if (value.length > 0) return "blocked-array-body";
    return null;
  }

  for (const [key, nested] of Object.entries(value)) {
    if (ENGINE_RUN_READINESS_RAW_OR_PRIVATE_KEYS.includes(key)
      && nested !== false
      && nested !== null
      && nested !== undefined
      && nested !== "") {
      return `blocked-raw-field-${safeToken(key, "unknown")}`;
    }
    if (ENGINE_RUN_READINESS_UNSAFE_TRUE_KEYS.includes(key) && nested === true) {
      return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
    }
    const child = findUnsafeSelectedProjectEngineRunReadinessReadbackNested(nested, seen);
    if (child) return child;
  }
  return null;
}

export function findUnsafeSelectedProjectEngineRunReadinessReadbackField(value) {
  return findUnsafeSelectedProjectEngineRunReadinessReadbackNested(value, new Set());
}

export function validateSelectedProjectEngineRunReadinessReadbackSources(
  selectedResultSummary,
  runTableFirstNarrowOutputSummary,
) {
  if (!isPlainObject(selectedResultSummary)) return "selected-result-summary-missing";
  if (!isPlainObject(runTableFirstNarrowOutputSummary)) return "runtable-first-narrow-output-summary-missing";

  const selectedResultUnsafe = findUnsafeSelectedProjectEngineRunReadinessReadbackField(selectedResultSummary);
  if (selectedResultUnsafe) return selectedResultUnsafe;
  const runTableUnsafe = findUnsafeSelectedProjectEngineRunReadinessReadbackField(
    runTableFirstNarrowOutputSummary,
  );
  if (runTableUnsafe) return runTableUnsafe;

  const selectedResultReadbackStatus = buildSelectedResultPersistedSummaryReadbackStatus({
    modules: {
      cs_selector: {
        downstreamContext: { selectedResultSummary },
      },
    },
  });
  if (selectedResultReadbackStatus.ready !== true || selectedResultReadbackStatus.failClosed === true) {
    return safeToken(
      selectedResultReadbackStatus.blocker,
      "selected-result-summary-readback-not-ready",
      760,
    );
  }
  if (selectedResultSummary.schemaId !== PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID
    || Number(selectedResultSummary.schemaVersion) !== PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION) {
    return "selected-result-summary-schema-mismatch";
  }

  const allowedRunTableFields = new Set(ENGINE_RUN_READINESS_RUNTABLE_ALLOWED_FIELDS);
  for (const key of Object.keys(runTableFirstNarrowOutputSummary)) {
    if (!allowedRunTableFields.has(key)) {
      return `runtable-first-narrow-output-summary-field-not-allow-listed-${safeToken(key, "field")}`;
    }
  }
  if (runTableFirstNarrowOutputSummary.schemaId !== RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID
    || Number(runTableFirstNarrowOutputSummary.schemaVersion)
      !== RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION) {
    return "runtable-first-narrow-output-summary-schema-mismatch";
  }
  if (runTableFirstNarrowOutputSummary.owner !== "shell"
    || runTableFirstNarrowOutputSummary.slotOwner !== "shell"
    || runTableFirstNarrowOutputSummary.moduleId !== "cs_selector") {
    return "runtable-first-narrow-output-summary-owner-slot-or-module-mismatch";
  }
  if (runTableFirstNarrowOutputSummary.state !== "redacted_runtable_first_narrow_output_summary_persisted") {
    return "runtable-first-narrow-output-summary-state-not-ready";
  }
  if (runTableFirstNarrowOutputSummary.summaryOnly !== true
    || runTableFirstNarrowOutputSummary.diagnosticOnly !== true
    || runTableFirstNarrowOutputSummary.safeSummaryOnly !== true
    || runTableFirstNarrowOutputSummary.redacted !== true
    || runTableFirstNarrowOutputSummary.machineValueSafe !== true) {
    return "runtable-first-narrow-output-summary-safety-flags-invalid";
  }
  if (runTableFirstNarrowOutputSummary.sourceKind !== "persisted-selected-result-summary"
    || runTableFirstNarrowOutputSummary.futureOutputKind !== "runtable-first-narrow-output") {
    return "runtable-first-narrow-output-summary-source-or-future-kind-mismatch";
  }
  if (runTableFirstNarrowOutputSummary.rowsIncluded !== false
    || runTableFirstNarrowOutputSummary.rowCount !== 0
    || runTableFirstNarrowOutputSummary.generated !== false
    || runTableFirstNarrowOutputSummary.generationEnabled !== false
    || runTableFirstNarrowOutputSummary.persisted !== false
    || runTableFirstNarrowOutputSummary.routeAdded !== false
    || runTableFirstNarrowOutputSummary.postEndpointAdded !== false) {
    return "runtable-first-narrow-output-summary-generation-or-exposure-flags-invalid";
  }
  if (runTableFirstNarrowOutputSummary.runTableFirstNarrowOutputHandoffContractState
      !== "runtable_first_narrow_output_handoff_contract_ready"
    || runTableFirstNarrowOutputSummary.runTableFirstNarrowOutputHandoffContractReady !== true) {
    return "runtable-first-narrow-output-handoff-contract-not-ready";
  }
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS) {
    if (runTableFirstNarrowOutputSummary[key] !== false) {
      return `runtable-first-narrow-output-summary-required-false-flag-invalid-${safeToken(key, "flag")}`;
    }
  }

  for (const key of ENGINE_RUN_READINESS_AUTHORITY_STATE_FIELDS) {
    const selectedValue = safeToken(selectedResultSummary[key], null, 760);
    const runTableValue = safeToken(runTableFirstNarrowOutputSummary[key], null, 760);
    if (!selectedValue || !runTableValue) {
      return `engine-run-readiness-authority-state-missing-${safeToken(key, "state")}`;
    }
    if (selectedValue !== runTableValue) {
      return `engine-run-readiness-authority-state-mismatch-${safeToken(key, "state")}`;
    }
  }

  for (const key of ENGINE_RUN_READINESS_ALIGNED_FINGERPRINT_FIELDS) {
    const selectedValue = safeReadbackFingerprint(selectedResultSummary[key]);
    const runTableValue = safeReadbackFingerprint(runTableFirstNarrowOutputSummary[key]);
    if (!selectedValue || !runTableValue) {
      return `engine-run-readiness-fingerprint-missing-${safeToken(key, "fingerprint")}`;
    }
    if (selectedValue !== runTableValue) {
      return `engine-run-readiness-fingerprint-mismatch-${safeToken(key, "fingerprint")}`;
    }
  }

  const expectedPersistedSelectedResultSummaryFingerprint = stableFingerprint(
    "safe-persisted-selected-result-summary",
    selectedResultSummary,
  );
  if (safeReadbackFingerprint(runTableFirstNarrowOutputSummary.persistedSelectedResultSummaryFingerprint)
    !== expectedPersistedSelectedResultSummaryFingerprint) {
    return "engine-run-readiness-persisted-selected-result-summary-fingerprint-mismatch";
  }
  for (const key of [
    "selectedResultPersistedSummarySlotContractFingerprint",
    "runTableFirstNarrowOutputHandoffContractFingerprint",
  ]) {
    if (!safeReadbackFingerprint(runTableFirstNarrowOutputSummary[key])) {
      return `engine-run-readiness-fingerprint-missing-${safeToken(key, "fingerprint")}`;
    }
  }
  return null;
}

function classifyProjectIesExportResultReadback(status) {
  if (!isPlainObject(status)) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.missing,
      readiness: "missing",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-result-readback-status-missing",
      readbackFingerprint: null,
    };
  }

  const readbackFingerprint = safeToken(
    status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    null,
    760,
  );
  const unsafeBlocker = findUnsafeProjectIesExportResultReadbackField(status);
  if (unsafeBlocker) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: unsafeBlocker,
      readbackFingerprint,
    };
  }

  const readiness = safeToken(status.readiness, "missing") || "missing";
  const blocker = safeToken(status.blocker, null);
  const blocked = readiness === "blocked_fail_closed"
    || status.state === "ies_first_narrow_project_ies_export_result_readback_blocked_fail_closed"
    || (status.failClosed === true && hasNonNullBlocker(status.blocker) && readiness !== "missing");

  if (blocked) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: blocker || "project-ies-export-result-readback-blocked-fail-closed",
      readbackFingerprint,
    };
  }

  if (readiness === "ready" && status.ready === true && status.failClosed !== true) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready,
      readiness: "ready",
      ready: true,
      failClosed: false,
      blocker: null,
      readbackFingerprint,
    };
  }

  return {
    state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.missing,
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: blocker || "project-ies-export-result-readback-missing",
    readbackFingerprint,
  };
}

function isSavedProjectSummary(project = {}) {
  if (project.source === "p2-shell-save-envelope") return true;
  return project.readOnly !== true && project.browserOnly !== true;
}

function findSelectedProjectSummary(projects, selectedProjectId) {
  const selectedId = safeToken(selectedProjectId, null);
  if (!selectedId) return null;
  return projects.find((project) => projectSummaryId(project) === selectedId || projectSummaryEnvelopeId(project) === selectedId) || null;
}

export function buildProjectBrowserSelectedResultPersistedSummaryReadbackSummary(projects = [], selectedProjectId = null) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const classifiedProjects = projectSummaries.map((project) => classifyProjectReadback(project));
  const blockedFailClosedProjectCount = classifiedProjects.filter((project) => project.readiness === "blocked_fail_closed").length;
  const readyProjectCount = classifiedProjects.filter((project) => project.ready === true).length;
  const missingProjectCount = classifiedProjects.filter((project) => project.readiness === "missing").length;
  const savedProjectCount = projectSummaries.filter((project) => isSavedProjectSummary(project)).length;
  const fixtureProjectCount = projectSummaries.length - savedProjectCount;
  const state = blockedFailClosedProjectCount > 0
    ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.blockedFailClosed
    : readyProjectCount > 0
      ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready
      : PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.missing;
  const selectedProject = findSelectedProjectSummary(projectSummaries, selectedProjectId);
  const selectedProjectReadback = selectedProject ? classifyProjectReadback(selectedProject) : null;

  const summary = {
    schemaId: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_RESULT_READBACK_SOURCE,
    state,
    readiness: state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready
      ? "ready"
      : state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.blockedFailClosed
        ? "blocked_fail_closed"
        : "missing",
    ready: state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready,
    failClosed: state !== PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready,
    projectCount: projectSummaries.length,
    savedProjectCount,
    fixtureProjectCount,
    readyProjectCount,
    missingProjectCount,
    blockedFailClosedProjectCount,
    selectedProjectId: safeToken(selectedProjectId, null),
    selectedProjectReadiness: selectedProjectReadback?.readiness || null,
    selectedProjectReady: selectedProjectReadback?.ready === true,
    selectedProjectFailClosed: selectedProjectReadback?.failClosed === true,
    selectedProjectBlocker: selectedProjectReadback?.blocker || null,
    selectedProjectReadbackFingerprint: selectedProjectReadback?.readbackFingerprint || null,
    moduleId: "cs_selector",
    targetLocation: SELECTED_RESULT_READBACK_TARGET,
    rawSelectedPayloadReturned: false,
    rawSelectedPayloadExposed: false,
    rawEnginePayloadReturned: false,
    rawEnginePayloadExposed: false,
    rawRunTableRowsReturned: false,
    rawRunTableRowsExposed: false,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    credentialsReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    selectedResultPersistenceAttempted: false,
    runTableGenerationAttempted: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...summary,
    projectBrowserSelectedResultPersistedSummaryReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-selected-result-persisted-summary-readback-summary",
      summary,
    ),
  });
}

export function buildProjectBrowserProjectIesExportBoundaryReadbackSummary(
  projects = [],
  getReadbackStatus = null,
) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const projectStatuses = projectSummaries.map((project) => {
    const classified = classifyProjectIesExportBoundaryReadback(
      readProjectIesExportBoundaryReadbackStatus(project, getReadbackStatus),
    );
    return Object.freeze({
      projectId: projectSummaryId(project),
      envelopeId: projectSummaryEnvelopeId(project),
      state: classified.state,
      readiness: classified.readiness,
      ready: classified.ready,
      failClosed: classified.failClosed,
      blocker: classified.blocker,
      sourceReadbackFingerprint: classified.readbackFingerprint,
    });
  });

  const readyProjectCount = projectStatuses.filter((project) => project.readiness === "ready").length;
  const missingProjectCount = projectStatuses.filter((project) => project.readiness === "missing").length;
  const blockedFailClosedProjectCount = projectStatuses.filter(
    (project) => project.readiness === "blocked_fail_closed",
  ).length;
  const state = blockedFailClosedProjectCount > 0
    ? PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed
    : projectStatuses.length > 0 && readyProjectCount === projectStatuses.length
      ? PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready
      : PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.missing;
  const readiness = state === PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready
    ? "ready"
    : state === PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed
      ? "blocked_fail_closed"
      : "missing";

  const summary = {
    schemaId: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SOURCE,
    state,
    readiness,
    ready: readiness === "ready",
    failClosed: readiness !== "ready",
    projectCount: projectStatuses.length,
    readyProjectCount,
    missingProjectCount,
    blockedFailClosedProjectCount,
    projectStatuses,
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: PROJECT_IES_EXPORT_BOUNDARY_READBACK_TARGET,
    safeReadbackStatusOnly: true,
    summaryOnly: true,
    redacted: true,
    readOnly: true,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...summary,
    projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-project-ies-export-boundary-readback-summary",
      summary,
    ),
  });
}

export function buildProjectBrowserProjectIesExportResultReadbackSummary(
  projects = [],
  getReadbackStatus = null,
) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const projectStatuses = projectSummaries.map((project) => {
    const classified = classifyProjectIesExportResultReadback(
      readProjectIesExportResultReadbackStatus(project, getReadbackStatus),
    );
    return Object.freeze({
      projectId: projectSummaryId(project),
      envelopeId: projectSummaryEnvelopeId(project),
      state: classified.state,
      readiness: classified.readiness,
      ready: classified.ready,
      failClosed: classified.failClosed,
      blocker: classified.blocker,
      sourceReadbackFingerprint: classified.readbackFingerprint,
    });
  });

  const readyProjectCount = projectStatuses.filter((project) => project.readiness === "ready").length;
  const missingProjectCount = projectStatuses.filter((project) => project.readiness === "missing").length;
  const blockedFailClosedProjectCount = projectStatuses.filter(
    (project) => project.readiness === "blocked_fail_closed",
  ).length;
  const state = blockedFailClosedProjectCount > 0
    ? PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed
    : projectStatuses.length > 0 && readyProjectCount === projectStatuses.length
      ? PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready
      : PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.missing;
  const readiness = state === PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready
    ? "ready"
    : state === PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed
      ? "blocked_fail_closed"
      : "missing";

  const summary = {
    schemaId: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SOURCE,
    state,
    readiness,
    ready: readiness === "ready",
    failClosed: readiness !== "ready",
    projectCount: projectStatuses.length,
    readyProjectCount,
    missingProjectCount,
    blockedFailClosedProjectCount,
    projectStatuses,
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: PROJECT_IES_EXPORT_RESULT_READBACK_TARGET,
    safeReadbackStatusOnly: true,
    summaryOnly: true,
    redacted: true,
    readOnly: true,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...summary,
    projectBrowserProjectIesExportResultReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-project-ies-export-result-readback-summary",
      summary,
    ),
  });
}

export function buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
  projectIesExportBoundaryReadbackSummary = {},
  selectedProjectId = null,
) {
  const sourceSummary = isPlainObject(projectIesExportBoundaryReadbackSummary)
    ? projectIesExportBoundaryReadbackSummary
    : {};
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const projectStatuses = Array.isArray(sourceSummary.projectStatuses)
    ? sourceSummary.projectStatuses.filter((status) => isPlainObject(status))
    : [];
  const selectedProjectStatus = selectedProjectToken
    ? projectStatuses.find((status) => (
      safeToken(status.projectId, null) === selectedProjectToken
      || safeToken(status.envelopeId, null) === selectedProjectToken
    )) || null
    : null;
  const sourceUnsafeBlocker = findUnsafeProjectIesExportBoundaryReadbackField(sourceSummary);
  const selectedStatusUnsafeBlocker = findUnsafeProjectIesExportBoundaryReadbackField(selectedProjectStatus);

  let state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (sourceUnsafeBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = sourceUnsafeBlocker;
  } else if (selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProjectToken) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-id-invalid";
  } else if (!Array.isArray(sourceSummary.projectStatuses)) {
    blocker = "project-browser-project-ies-export-boundary-readback-summary-missing";
  } else if (!selectedProjectStatus) {
    blocker = "project-browser-selected-project-not-found";
  } else if (selectedStatusUnsafeBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = selectedStatusUnsafeBlocker;
  } else {
    const selectedReadiness = safeToken(selectedProjectStatus.readiness, "missing") || "missing";
    const selectedBlocker = safeToken(selectedProjectStatus.blocker, null);
    const selectedBlocked = selectedReadiness === "blocked_fail_closed"
      || selectedProjectStatus.state === PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed
      || (selectedProjectStatus.failClosed === true
        && hasNonNullBlocker(selectedProjectStatus.blocker)
        && selectedReadiness !== "missing");
    const selectedReady = selectedReadiness === "ready"
      && selectedProjectStatus.ready === true
      && selectedProjectStatus.failClosed !== true;

    if (selectedReady) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
    } else if (selectedBlocked) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      blocker = selectedBlocker || "project-browser-selected-project-ies-export-boundary-readback-blocked-fail-closed";
    } else {
      blocker = selectedBlocker || "project-browser-selected-project-ies-export-boundary-readback-missing";
    }
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SOURCE,
    sourceSummarySchemaId: safeToken(sourceSummary.schemaId, null),
    sourceSummarySchemaVersion: safeSchemaVersion(sourceSummary.schemaVersion),
    sourceSummaryState: safeToken(sourceSummary.state, null),
    sourceSummaryReadiness: safeToken(sourceSummary.readiness, "missing") || "missing",
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound: selectedProjectStatus !== null,
    projectId: selectedProjectStatus ? safeToken(selectedProjectStatus.projectId, null) : null,
    envelopeId: selectedProjectStatus ? safeToken(selectedProjectStatus.envelopeId, null) : null,
    boundaryReadbackState: selectedProjectStatus ? safeToken(selectedProjectStatus.state, null) : null,
    boundaryReadbackReadiness: selectedProjectStatus
      ? safeToken(selectedProjectStatus.readiness, "missing") || "missing"
      : "missing",
    boundaryReadbackReady: selectedProjectStatus?.ready === true,
    boundaryReadbackFailClosed: selectedProjectStatus?.failClosed !== false,
    boundaryReadbackBlocker: selectedProjectStatus?.blocker
      ? safeToken(selectedProjectStatus.blocker, "project-browser-selected-project-ies-export-boundary-readback-blocked")
      : null,
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: PROJECT_IES_EXPORT_BOUNDARY_READBACK_TARGET,
    safeReadbackStatusOnly: true,
    readOnly: true,
    selectedProjectOnly: true,
    detailOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceReadbackFingerprint: selectedProjectStatus
      ? safeToken(selectedProjectStatus.sourceReadbackFingerprint, null, 760)
      : null,
    sourceProjectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint: safeToken(
      sourceSummary.projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint,
      null,
      760,
    ),
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...base,
    projectBrowserSelectedProjectIesExportBoundaryReadbackDetailFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-ies-export-boundary-readback-detail-summary",
      base,
    ),
  });
}

export function buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
  projectIesExportResultReadbackSummary = {},
  selectedProjectId = null,
) {
  const sourceSummary = isPlainObject(projectIesExportResultReadbackSummary)
    ? projectIesExportResultReadbackSummary
    : {};
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const projectStatuses = Array.isArray(sourceSummary.projectStatuses)
    ? sourceSummary.projectStatuses.filter((status) => isPlainObject(status))
    : [];
  const selectedProjectStatus = selectedProjectToken
    ? projectStatuses.find((status) => (
      safeToken(status.projectId, null) === selectedProjectToken
      || safeToken(status.envelopeId, null) === selectedProjectToken
    )) || null
    : null;
  const sourceUnsafeBlocker = findUnsafeProjectIesExportResultReadbackField(sourceSummary);
  const selectedStatusUnsafeBlocker = findUnsafeProjectIesExportResultReadbackField(selectedProjectStatus);

  let state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (sourceUnsafeBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = sourceUnsafeBlocker;
  } else if (selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProjectToken) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-id-invalid";
  } else if (!Array.isArray(sourceSummary.projectStatuses)) {
    blocker = "project-browser-project-ies-export-result-readback-summary-missing";
  } else if (!selectedProjectStatus) {
    blocker = "project-browser-selected-project-not-found";
  } else if (selectedStatusUnsafeBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = selectedStatusUnsafeBlocker;
  } else {
    const selectedReadiness = safeToken(selectedProjectStatus.readiness, "missing") || "missing";
    const selectedBlocker = safeToken(selectedProjectStatus.blocker, null);
    const selectedBlocked = selectedReadiness === "blocked_fail_closed"
      || selectedProjectStatus.state === PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed
      || (selectedProjectStatus.failClosed === true
        && hasNonNullBlocker(selectedProjectStatus.blocker)
        && selectedReadiness !== "missing");
    const selectedReady = selectedReadiness === "ready"
      && selectedProjectStatus.ready === true
      && selectedProjectStatus.failClosed !== true;

    if (selectedReady) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
    } else if (selectedBlocked) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      blocker = selectedBlocker || "project-browser-selected-project-ies-export-result-readback-blocked-fail-closed";
    } else {
      blocker = selectedBlocker || "project-browser-selected-project-ies-export-result-readback-missing";
    }
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SOURCE,
    sourceSummarySchemaId: safeToken(sourceSummary.schemaId, null),
    sourceSummarySchemaVersion: safeSchemaVersion(sourceSummary.schemaVersion),
    sourceSummaryState: safeToken(sourceSummary.state, null),
    sourceSummaryReadiness: safeToken(sourceSummary.readiness, "missing") || "missing",
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound: selectedProjectStatus !== null,
    projectId: selectedProjectStatus ? safeToken(selectedProjectStatus.projectId, null) : null,
    envelopeId: selectedProjectStatus ? safeToken(selectedProjectStatus.envelopeId, null) : null,
    resultReadbackState: selectedProjectStatus ? safeToken(selectedProjectStatus.state, null) : null,
    resultReadbackReadiness: selectedProjectStatus
      ? safeToken(selectedProjectStatus.readiness, "missing") || "missing"
      : "missing",
    resultReadbackReady: selectedProjectStatus?.ready === true,
    resultReadbackFailClosed: selectedProjectStatus?.failClosed !== false,
    resultReadbackBlocker: selectedProjectStatus?.blocker
      ? safeToken(selectedProjectStatus.blocker, "project-browser-selected-project-ies-export-result-readback-blocked")
      : null,
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: PROJECT_IES_EXPORT_RESULT_READBACK_TARGET,
    safeReadbackStatusOnly: true,
    readOnly: true,
    selectedProjectOnly: true,
    detailOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceReadbackFingerprint: selectedProjectStatus
      ? safeToken(selectedProjectStatus.sourceReadbackFingerprint, null, 760)
      : null,
    sourceProjectBrowserProjectIesExportResultReadbackSummaryFingerprint: safeToken(
      sourceSummary.projectBrowserProjectIesExportResultReadbackSummaryFingerprint,
      null,
      760,
    ),
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze(orderedSelectedProjectIesExportResultReadbackDetailSummary({
    ...base,
    projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-ies-export-result-readback-detail-summary",
      base,
    ),
  }));
}

export function buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
  selectedProjectEnvelope = null,
  selectedProjectId = null,
  sourceAccessBlocker = null,
) {
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const selectedProjectFound = isPlainObject(selectedProjectEnvelope);
  const projectId = selectedProjectFound ? safeToken(selectedProjectEnvelope.projectId, null) : null;
  const envelopeId = selectedProjectFound
    ? safeToken(selectedProjectEnvelope.envelopeId || selectedProjectEnvelope.projectId, null)
    : null;
  const downstreamContext = selectedProjectFound
    && isPlainObject(selectedProjectEnvelope?.modules?.cs_selector?.downstreamContext)
    ? selectedProjectEnvelope.modules.cs_selector.downstreamContext
    : null;
  const sourceSummary = isPlainObject(downstreamContext?.iesFirstNarrowCandidateOutputManifestSummary)
    ? downstreamContext.iesFirstNarrowCandidateOutputManifestSummary
    : null;
  const manifestSummaryPresent = isPlainObject(sourceSummary) && Object.keys(sourceSummary).length > 0;

  let state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProjectToken) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-id-invalid";
  } else if (sourceAccessBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = safeToken(
      sourceAccessBlocker,
      "project-browser-selected-project-candidate-output-manifest-accessor-failed",
    );
  } else if (!selectedProjectFound) {
    blocker = "project-browser-selected-project-not-found";
  } else if (selectedProjectToken !== projectId && selectedProjectToken !== envelopeId) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-envelope-identity-mismatch";
  } else if (!manifestSummaryPresent) {
    blocker = "project-browser-selected-project-candidate-output-manifest-summary-missing";
  } else {
    const validationBlocker = validateCandidateOutputManifestReadbackSource(sourceSummary);
    if (validationBlocker) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      blocker = safeToken(
        validationBlocker,
        "project-browser-selected-project-candidate-output-manifest-summary-blocked",
        760,
      );
    } else {
      state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
    }
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SOURCE,
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound,
    projectId,
    envelopeId,
    manifestSummaryPresent,
    manifestBoundaryReady: ready,
    runTableRowCount: ready ? safeNonNegativeInteger(sourceSummary.sourceRunTableRowCount) : 0,
    candidateOutputRecordCount: ready ? safeNonNegativeInteger(sourceSummary.candidateOutputRecordCount) : 0,
    manifestRecordCount: ready ? safeNonNegativeInteger(sourceSummary.manifestRecordCount) : 0,
    manifestEntryCount: ready ? safeNonNegativeInteger(sourceSummary.manifestEntryCount) : 0,
    firstCandidateOutputKind: ready ? safeToken(sourceSummary.firstCandidateOutputKind, null, 760) : null,
    policyFingerprint: ready ? safeToken(sourceSummary.policyFingerprint, null, 760) : null,
    sourceFingerprint: ready ? safeToken(sourceSummary.sourceFingerprint, null, 760) : null,
    sourceInputFingerprint: ready ? safeToken(sourceSummary.sourceInputFingerprint, null, 760) : null,
    iesFirstNarrowMetadataHandoffSummaryFingerprint: ready
      ? safeToken(sourceSummary.iesFirstNarrowMetadataHandoffSummaryFingerprint, null, 760)
      : null,
    iesFirstNarrowCandidateOutputSummaryFingerprint: ready
      ? safeToken(sourceSummary.iesFirstNarrowCandidateOutputSummaryFingerprint, null, 760)
      : null,
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint: ready
      ? safeToken(sourceSummary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint, null, 760)
      : null,
    targetLocation: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_TARGET,
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    manifestFileExists: false,
    manifestDownloadable: false,
    manifestFileOutputEnabled: false,
    manifestFileOutputWritten: false,
    downloadEnabled: false,
    downloadAvailable: false,
    sourceRowsReturned: false,
    candidateOutputDetailsReturned: false,
    artifactListReturned: false,
    rawManifestReturned: false,
    rawCandidateOutputReturned: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    filenamesReturned: false,
    privatePathsReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
  };

  return Object.freeze(orderedSelectedProjectCandidateOutputManifestReadbackSummary({
    ...base,
    projectBrowserSelectedProjectCandidateOutputManifestReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-candidate-output-manifest-readback-summary",
      base,
    ),
  }));
}

export function buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
  selectedProjectEnvelope = null,
  selectedProjectId = null,
  sourceAccessBlocker = null,
) {
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const selectedProjectFound = isPlainObject(selectedProjectEnvelope);
  const projectId = selectedProjectFound ? safeToken(selectedProjectEnvelope.projectId, null) : null;
  const envelopeId = selectedProjectFound
    ? safeToken(selectedProjectEnvelope.envelopeId || selectedProjectEnvelope.projectId, null)
    : null;
  const downstreamContext = selectedProjectFound
    && isPlainObject(selectedProjectEnvelope?.modules?.cs_selector?.downstreamContext)
    ? selectedProjectEnvelope.modules.cs_selector.downstreamContext
    : null;
  const sourceSummary = isPlainObject(downstreamContext?.iesFirstNarrowCandidateOutputDetailSummary)
    ? downstreamContext.iesFirstNarrowCandidateOutputDetailSummary
    : null;
  const detailSummaryPresent = isPlainObject(sourceSummary) && Object.keys(sourceSummary).length > 0;

  let state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProjectToken) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-id-invalid";
  } else if (sourceAccessBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = safeToken(
      sourceAccessBlocker,
      "project-browser-selected-project-candidate-output-detail-accessor-failed",
    );
  } else if (!selectedProjectFound) {
    blocker = "project-browser-selected-project-not-found";
  } else if (selectedProjectToken !== projectId && selectedProjectToken !== envelopeId) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-envelope-identity-mismatch";
  } else if (!detailSummaryPresent) {
    blocker = "project-browser-selected-project-candidate-output-detail-summary-missing";
  } else {
    const validationBlocker = validateCandidateOutputDetailReadbackSource(sourceSummary);
    if (validationBlocker) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      blocker = safeToken(
        validationBlocker,
        "project-browser-selected-project-candidate-output-detail-summary-blocked",
        760,
      );
    } else {
      state = PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
    }
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SOURCE,
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound,
    projectId,
    envelopeId,
    detailSummaryPresent,
    detailBoundaryReady: ready,
    sourceRunTableRowCount: ready ? safeNonNegativeInteger(sourceSummary.sourceRunTableRowCount) : 0,
    candidateOutputRecordCount: ready ? safeNonNegativeInteger(sourceSummary.candidateOutputRecordCount) : 0,
    manifestRecordCount: ready ? safeNonNegativeInteger(sourceSummary.manifestRecordCount) : 0,
    detailRecordCount: ready ? safeNonNegativeInteger(sourceSummary.detailRecordCount) : 0,
    detailEntryCount: ready ? safeNonNegativeInteger(sourceSummary.detailEntryCount) : 0,
    firstDetailEntryKind: ready ? safeToken(sourceSummary.firstDetailEntryKind, null, 760) : null,
    firstCandidateOutputKind: ready ? safeToken(sourceSummary.firstCandidateOutputKind, null, 760) : null,
    firstManifestEntryKind: ready ? safeToken(sourceSummary.firstManifestEntryKind, null, 760) : null,
    firstRowKey: ready ? safeToken(sourceSummary.firstRowKey, null, 760) : null,
    firstRowKind: ready ? safeToken(sourceSummary.firstRowKind, null, 760) : null,
    firstRunKey: ready ? safeToken(sourceSummary.firstRunKey, null, 760) : null,
    firstRunIndex: ready ? safeNonNegativeInteger(sourceSummary.firstRunIndex) : null,
    firstRowAccepted: ready && sourceSummary.firstRowAccepted === true,
    firstRowEngineVerified: ready && sourceSummary.firstRowEngineVerified === true,
    firstRowBoardCount: ready ? safeNonNegativeInteger(sourceSummary.firstRowBoardCount) : 0,
    firstRowSegmentCount: ready ? safeNonNegativeInteger(sourceSummary.firstRowSegmentCount) : 0,
    firstRowZoneCount: ready ? safeNonNegativeInteger(sourceSummary.firstRowZoneCount) : 0,
    firstRowClipPointsCount: ready ? safeNonNegativeInteger(sourceSummary.firstRowClipPointsCount) : 0,
    firstRowSuspensionPointsCount: ready ? safeNonNegativeInteger(sourceSummary.firstRowSuspensionPointsCount) : 0,
    firstRowGearTrayPlanCount: ready ? safeNonNegativeInteger(sourceSummary.firstRowGearTrayPlanCount) : 0,
    firstRowReservedRangesCount: ready ? safeNonNegativeInteger(sourceSummary.firstRowReservedRangesCount) : 0,
    policyFingerprint: ready ? safeToken(sourceSummary.policyFingerprint, null, 760) : null,
    sourceFingerprint: ready ? safeToken(sourceSummary.sourceFingerprint, null, 760) : null,
    sourceInputFingerprint: ready ? safeToken(sourceSummary.sourceInputFingerprint, null, 760) : null,
    boardDataSourceVersion: ready ? safeToken(sourceSummary.boardDataSourceVersion, null, 760) : null,
    iesFirstNarrowMetadataHandoffSummaryFingerprint: ready
      ? safeToken(sourceSummary.iesFirstNarrowMetadataHandoffSummaryFingerprint, null, 760)
      : null,
    iesFirstNarrowCandidateOutputSummaryFingerprint: ready
      ? safeToken(sourceSummary.iesFirstNarrowCandidateOutputSummaryFingerprint, null, 760)
      : null,
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint: ready
      ? safeToken(sourceSummary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint, null, 760)
      : null,
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint: ready
      ? safeToken(sourceSummary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint, null, 760)
      : null,
    targetLocation: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET,
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
    detailOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    detailFileExists: false,
    detailDownloadable: false,
    detailFileOutputEnabled: false,
    detailFileOutputWritten: false,
    downloadEnabled: false,
    downloadAvailable: false,
    sourceRowsReturned: false,
    candidateOutputDetailsReturned: false,
    artifactListReturned: false,
    rawDetailReturned: false,
    rawManifestReturned: false,
    rawCandidateOutputReturned: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    mutationDataReturned: false,
    base64ArtifactsReturned: false,
    blobsReturned: false,
    urlsReturned: false,
    filenamesReturned: false,
    privatePathsReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze(orderedSelectedProjectCandidateOutputDetailReadbackSummary({
    ...base,
    projectBrowserSelectedProjectCandidateOutputDetailReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-candidate-output-detail-readback-summary",
      base,
    ),
  }));
}

export function buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
  selectedProjectEnvelope = null,
  selectedProjectId = null,
  sourceAccessBlocker = null,
) {
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const selectedProjectFound = isPlainObject(selectedProjectEnvelope);
  const projectId = selectedProjectFound ? safeToken(selectedProjectEnvelope.projectId, null) : null;
  const envelopeId = selectedProjectFound
    ? safeToken(selectedProjectEnvelope.envelopeId || selectedProjectEnvelope.projectId, null)
    : null;
  const downstreamContext = selectedProjectFound
    && isPlainObject(selectedProjectEnvelope?.modules?.cs_selector?.downstreamContext)
    ? selectedProjectEnvelope.modules.cs_selector.downstreamContext
    : null;
  const selectedResultSummary = isPlainObject(downstreamContext?.selectedResultSummary)
    ? downstreamContext.selectedResultSummary
    : null;
  const runTableFirstNarrowOutputSummary = isPlainObject(downstreamContext?.runTableFirstNarrowOutputSummary)
    ? downstreamContext.runTableFirstNarrowOutputSummary
    : null;
  const selectedResultSummaryPresent = isPlainObject(selectedResultSummary)
    && Object.keys(selectedResultSummary).length > 0;
  const runTableFirstNarrowOutputSummaryPresent = isPlainObject(runTableFirstNarrowOutputSummary)
    && Object.keys(runTableFirstNarrowOutputSummary).length > 0;
  const selectedResultReadbackStatus = buildSelectedResultPersistedSummaryReadbackStatus(
    selectedProjectFound ? selectedProjectEnvelope : {},
  );

  let state = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProjectToken) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-id-invalid";
  } else if (sourceAccessBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = safeToken(
      sourceAccessBlocker,
      "project-browser-selected-project-engine-run-readiness-accessor-failed",
      760,
    );
  } else if (!selectedProjectFound) {
    blocker = "project-browser-selected-project-not-found";
  } else if (selectedProjectToken !== projectId && selectedProjectToken !== envelopeId) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-envelope-identity-mismatch";
  } else if (!selectedResultSummaryPresent) {
    blocker = "project-browser-selected-project-selected-result-summary-missing";
  } else if (!runTableFirstNarrowOutputSummaryPresent) {
    blocker = "project-browser-selected-project-runtable-first-narrow-output-summary-missing";
  } else {
    const validationBlocker = validateSelectedProjectEngineRunReadinessReadbackSources(
      selectedResultSummary,
      runTableFirstNarrowOutputSummary,
    );
    if (validationBlocker) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      blocker = safeToken(
        validationBlocker,
        "project-browser-selected-project-engine-run-readiness-readback-blocked",
        760,
      );
    } else {
      state = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
    }
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE,
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound,
    projectId,
    envelopeId,
    selectedResultSummaryPresent,
    runTableFirstNarrowOutputSummaryPresent,
    selectedResultReadbackState: safeToken(selectedResultReadbackStatus.state, null, 760),
    selectedResultReadbackReadiness:
      safeToken(selectedResultReadbackStatus.readiness, "missing", 760) || "missing",
    selectedResultReadbackReady: selectedResultReadbackStatus.ready === true,
    selectedResultReadbackFailClosed: selectedResultReadbackStatus.failClosed !== false,
    selectedResultReadbackBlocker: selectedResultReadbackStatus.blocker
      ? safeToken(
        selectedResultReadbackStatus.blocker,
        "selected-result-summary-readback-blocked",
        760,
      )
      : null,
    selectedResultSummarySchemaId: selectedResultSummaryPresent
      ? safeToken(selectedResultSummary.schemaId, null, 760)
      : null,
    selectedResultSummarySchemaVersion: selectedResultSummaryPresent
      ? safeSchemaVersion(selectedResultSummary.schemaVersion)
      : null,
    selectedResultSummaryState: selectedResultSummaryPresent
      ? safeToken(selectedResultSummary.state, null, 760)
      : null,
    runTableFirstNarrowOutputSummarySchemaId: runTableFirstNarrowOutputSummaryPresent
      ? safeToken(runTableFirstNarrowOutputSummary.schemaId, null, 760)
      : null,
    runTableFirstNarrowOutputSummarySchemaVersion: runTableFirstNarrowOutputSummaryPresent
      ? safeSchemaVersion(runTableFirstNarrowOutputSummary.schemaVersion)
      : null,
    runTableFirstNarrowOutputSummaryState: runTableFirstNarrowOutputSummaryPresent
      ? safeToken(runTableFirstNarrowOutputSummary.state, null, 760)
      : null,
    runTableFirstNarrowOutputHandoffContractState: ready
      ? safeToken(runTableFirstNarrowOutputSummary.runTableFirstNarrowOutputHandoffContractState, null, 760)
      : null,
    runTableFirstNarrowOutputHandoffContractReady:
      ready && runTableFirstNarrowOutputSummary.runTableFirstNarrowOutputHandoffContractReady === true,
    acceptedSelectedResultAuthorityState: ready
      ? safeToken(selectedResultSummary.acceptedSelectedResultAuthorityState, null, 760)
      : null,
    selectedResultPersistenceAuthorityPreflightState: ready
      ? safeToken(selectedResultSummary.selectedResultPersistenceAuthorityPreflightState, null, 760)
      : null,
    selectedResultPersistenceBoundaryState: ready
      ? safeToken(selectedResultSummary.selectedResultPersistenceBoundaryState, null, 760)
      : null,
    selectedResultOutputReadinessPreflightState: ready
      ? safeToken(selectedResultSummary.selectedResultOutputReadinessPreflightState, null, 760)
      : null,
    authorityStatesAligned: ready,
    fingerprintsAligned: ready,
    engineRunReadinessReadbackReady: ready,
    policyFingerprint: ready ? safeReadbackFingerprint(selectedResultSummary.policyFingerprint) : null,
    sourceFingerprint: ready ? safeReadbackFingerprint(selectedResultSummary.sourceFingerprint) : null,
    sourceInputFingerprint: ready ? safeReadbackFingerprint(selectedResultSummary.sourceInputFingerprint) : null,
    sourceVersionFingerprint: ready ? safeReadbackFingerprint(selectedResultSummary.sourceVersionFingerprint) : null,
    persistedSelectedResultSummaryFingerprint: ready
      ? safeReadbackFingerprint(runTableFirstNarrowOutputSummary.persistedSelectedResultSummaryFingerprint)
      : null,
    selectedResultPersistedSummarySlotContractFingerprint: ready
      ? safeReadbackFingerprint(
        runTableFirstNarrowOutputSummary.selectedResultPersistedSummarySlotContractFingerprint,
      )
      : null,
    runTableFirstNarrowOutputHandoffContractFingerprint: ready
      ? safeReadbackFingerprint(
        runTableFirstNarrowOutputSummary.runTableFirstNarrowOutputHandoffContractFingerprint,
      )
      : null,
    selectedResultPersistedSummaryReadbackFingerprint: safeReadbackFingerprint(
      selectedResultReadbackStatus.selectedResultPersistedSummaryReadbackFingerprint,
    ),
    selectedResultTargetLocation: SELECTED_RESULT_READBACK_TARGET,
    runTableFirstNarrowOutputTargetLocation: RUNTABLE_FIRST_NARROW_OUTPUT_READBACK_TARGET,
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    runTableRowsIncluded: false,
    runTableRowCount: 0,
    engineExecutionEnabled: false,
    engineExecutionAttempted: false,
    selectedResultCreated: false,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    runTableGenerationAttempted: false,
    outputGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectedPayloadReturned: false,
    runTableRowsReturned: false,
    rawRunTableRowsReturned: false,
    rawCandidateOutputReturned: false,
    rawIesReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    filenamesReturned: false,
    privatePathsReturned: false,
  };

  return Object.freeze(orderedSelectedProjectEngineRunReadinessReadbackSummary({
    ...base,
    projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-engine-run-readiness-readback-summary",
      base,
    ),
  }));
}

export function buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(projects = [], selectedProjectId = null) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const selectedProject = selectedProjectToken ? findSelectedProjectSummary(projectSummaries, selectedProjectToken) : null;

  let state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let selectedProjectFound = false;
  let selectedProjectReadiness = "missing";
  let selectedProjectReady = false;
  let selectedProjectFailClosed = true;
  let selectedProjectBlocker = null;
  let selectedProjectReadbackFingerprint = null;

  if (selectedProjectId === null) {
    selectedProjectBlocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProject) {
    selectedProjectBlocker = "project-browser-selected-project-not-found";
  } else {
    selectedProjectFound = true;
    const selectedProjectReadback = classifyProjectReadback(selectedProject);
    selectedProjectReadiness = selectedProjectReadback.readiness;
    selectedProjectReady = selectedProjectReadback.ready === true;
    selectedProjectFailClosed = selectedProjectReadback.failClosed === true;
    selectedProjectBlocker = safeToken(selectedProjectReadback.blocker, null);
    selectedProjectReadbackFingerprint = selectedProjectReadback.readbackFingerprint || null;

    if (selectedProjectReadback.readiness === "ready" && selectedProjectReadback.ready === true) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
      selectedProjectBlocker = null;
    } else if (selectedProjectReadback.readiness === "blocked_fail_closed") {
      state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      failClosed = true;
      selectedProjectReady = false;
      selectedProjectFailClosed = true;
      selectedProjectBlocker = selectedProjectBlocker || "project-browser-selected-project-readback-blocked-fail-closed";
    } else {
      selectedProjectBlocker = selectedProjectBlocker || "project-browser-selected-project-readback-missing";
    }
  }

  const status = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_STATUS_SOURCE,
    state,
    readiness,
    ready,
    failClosed,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound,
    selectedProjectReadiness,
    selectedProjectReady,
    selectedProjectFailClosed,
    selectedProjectBlocker,
    selectedProjectReadbackFingerprint,
    moduleId: "cs_selector",
    targetLocation: SELECTED_RESULT_READBACK_TARGET,
    rawSelectedPayloadReturned: false,
    rawSelectedPayloadExposed: false,
    rawEnginePayloadReturned: false,
    rawEnginePayloadExposed: false,
    rawRunTableRowsReturned: false,
    rawRunTableRowsExposed: false,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    credentialsReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    selectedResultPersistenceAttempted: false,
    runTableGenerationAttempted: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...status,
    projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatusFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-selected-result-persisted-summary-readback-status",
      status,
    ),
  });
}

export function buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary(projects = [], selectedProjectId = null) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const sourceStatus = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(
    projectSummaries,
    selectedProjectId,
  );
  const selectedProject = sourceStatus.selectedProjectFound === true
    ? findSelectedProjectSummary(projectSummaries, sourceStatus.selectedProjectId)
    : null;
  const sourceDetail = buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(
    selectedProject?.selectedResultPersistedSummaryReadbackStatus || {},
  );

  const statusReady = sourceStatus.readiness === "ready"
    && sourceStatus.ready === true
    && sourceStatus.failClosed !== true;
  const detailReady = sourceDetail.readiness === "ready"
    && sourceDetail.ready === true
    && sourceDetail.failClosed !== true;
  const statusBlockedFailClosed = sourceStatus.readiness === "blocked_fail_closed"
    || sourceStatus.state === PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed;
  const detailBlockedFailClosed = sourceDetail.readiness === "blocked_fail_closed"
    || sourceDetail.state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed;

  let state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (statusReady && detailReady) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready;
    readiness = "ready";
    ready = true;
    failClosed = false;
  } else if (statusBlockedFailClosed || detailBlockedFailClosed) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = safeToken(
      sourceStatus.selectedProjectBlocker || sourceDetail.blocker,
      "project-browser-selected-project-readback-blocked-fail-closed",
    );
  } else if (sourceStatus.selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (sourceStatus.selectedProjectFound !== true) {
    blocker = "project-browser-selected-project-not-found";
  } else {
    blocker = "project-browser-selected-project-readback-missing";
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_DETAIL_SOURCE,
    sourceStatusSchemaId: safeToken(sourceStatus.schemaId, null),
    sourceStatusSchemaVersion: safeSchemaVersion(sourceStatus.schemaVersion),
    sourceStatusState: safeToken(sourceStatus.state, null),
    sourceStatusReadiness: safeToken(sourceStatus.readiness, "missing") || "missing",
    sourceDetailSchemaId: safeToken(sourceDetail.schemaId, null),
    sourceDetailSchemaVersion: safeSchemaVersion(sourceDetail.schemaVersion),
    sourceDetailState: safeToken(sourceDetail.state, null),
    sourceDetailReadiness: safeToken(sourceDetail.readiness, "missing") || "missing",
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: sourceStatus.selectedProjectId || null,
    selectedProjectFound: sourceStatus.selectedProjectFound === true,
    summaryPresent: sourceDetail.summaryPresent === true,
    summarySchemaId: sourceDetail.summarySchemaId ? safeToken(sourceDetail.summarySchemaId, null) : null,
    summarySchemaVersion: safeSchemaVersion(sourceDetail.summarySchemaVersion),
    summaryState: sourceDetail.summaryState ? safeToken(sourceDetail.summaryState, null) : null,
    slotOwner: safeToken(sourceDetail.slotOwner, "shell"),
    envelopeOwner: safeToken(sourceDetail.envelopeOwner, "shell"),
    moduleId: safeToken(sourceDetail.moduleId, "cs_selector"),
    targetLocation: safeToken(sourceDetail.targetLocation, SELECTED_RESULT_READBACK_TARGET),
    readOnly: true,
    selectedProjectOnly: true,
    detailOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceSelectedProjectReadbackFingerprint: safeToken(sourceStatus.selectedProjectReadbackFingerprint, null, 760),
    sourceSelectedProjectReadbackStatusFingerprint: safeToken(
      sourceStatus.projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatusFingerprint,
      null,
      760,
    ),
    sourceSelectedProjectReadbackDetailFingerprint: safeToken(
      sourceDetail.projectBrowserSelectedResultPersistedSummaryReadbackDetailFingerprint,
      null,
      760,
    ),
  };

  return Object.freeze({
    ...base,
    projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-selected-result-persisted-summary-readback-detail-summary",
      base,
    ),
  });
}

export function buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(envelopeOrProjectSummary = {}) {
  const sourceSummary = buildSelectedResultPersistedSummaryReadbackProjectSummary(envelopeOrProjectSummary || {});
  const sourceReadiness = safeToken(sourceSummary.readiness, "missing") || "missing";
  const ready = sourceSummary.ready === true && sourceSummary.failClosed !== true && sourceReadiness === "ready";
  const blockedFailClosed = !ready && (
    sourceReadiness === "blocked_fail_closed"
    || sourceSummary.state === "selected_result_persisted_summary_readback_blocked_fail_closed"
  );
  const state = ready
    ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready
    : blockedFailClosed
      ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed
      : PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing;
  const readiness = state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready
    ? "ready"
    : state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed
      ? "blocked_fail_closed"
      : "missing";
  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
    sourceSchemaId: safeToken(sourceSummary.schemaId, null),
    sourceSchemaVersion: safeSchemaVersion(sourceSummary.schemaVersion),
    sourceState: safeToken(sourceSummary.state, null),
    sourceReadiness,
    state,
    readiness,
    ready,
    failClosed: !ready,
    blocker: sourceSummary.blocker ? safeToken(sourceSummary.blocker, "project-browser-selected-result-readback-detail-blocked") : null,
    summaryPresent: sourceSummary.summaryPresent === true,
    summarySchemaId: sourceSummary.summarySchemaId ? safeToken(sourceSummary.summarySchemaId, null) : null,
    summarySchemaVersion: safeSchemaVersion(sourceSummary.summarySchemaVersion),
    summaryState: sourceSummary.summaryState ? safeToken(sourceSummary.summaryState, null) : null,
    owner: safeToken(sourceSummary.owner, "shell"),
    slotOwner: safeToken(sourceSummary.slotOwner, "shell"),
    envelopeOwner: safeToken(sourceSummary.envelopeOwner, "shell"),
    moduleId: safeToken(sourceSummary.moduleId, "cs_selector"),
    targetLocation: safeToken(sourceSummary.targetLocation, SELECTED_RESULT_READBACK_TARGET),
    readOnly: true,
    detailOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceSelectedResultPersistedSummaryReadbackFingerprint: safeToken(
      sourceSummary.selectedResultPersistedSummaryReadbackFingerprint,
      null,
      760,
    ),
  };

  return Object.freeze({
    ...base,
    projectBrowserSelectedResultPersistedSummaryReadbackDetailFingerprint: stableFingerprint(
      "safe-project-browser-selected-result-persisted-summary-readback-detail-summary",
      base,
    ),
  });
}

export function createProjectBrowserService({ savedProjectStore, projectService, eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "handoff-share-ready-browser",
    source: "p4-shell-handoff-share",
    selectedProjectId: null,
    filters: {
      search: "",
      scope: "current-user",
    },
  };

  function getProjectBrowserSnapshot(context = {}) {
    const storeSnapshot = savedProjectStore.getStoreSnapshot(context);
    const projectIesExportBoundaryReadbackSummary = buildProjectBrowserProjectIesExportBoundaryReadbackSummary(
      storeSnapshot.projects,
      savedProjectStore.getIesFirstNarrowProjectIesExportBoundaryReadbackStatus?.bind(savedProjectStore),
    );
    const projectIesExportResultReadbackSummary = buildProjectBrowserProjectIesExportResultReadbackSummary(
      storeSnapshot.projects,
      savedProjectStore.getIesFirstNarrowProjectIesExportResultReadbackStatus?.bind(savedProjectStore),
    );
    let selectedProjectEnvelope = null;
    let selectedProjectManifestAccessBlocker = null;
    let selectedProjectDetailAccessBlocker = null;
    let selectedProjectEngineRunReadinessAccessBlocker = null;
    if (state.selectedProjectId !== null) {
      if (typeof savedProjectStore.getProjectEnvelope !== "function") {
        selectedProjectManifestAccessBlocker =
          "project-browser-selected-project-candidate-output-manifest-accessor-unavailable";
        selectedProjectDetailAccessBlocker =
          "project-browser-selected-project-candidate-output-detail-accessor-unavailable";
        selectedProjectEngineRunReadinessAccessBlocker =
          "project-browser-selected-project-engine-run-readiness-accessor-unavailable";
      } else {
        try {
          selectedProjectEnvelope = savedProjectStore.getProjectEnvelope(state.selectedProjectId);
        } catch {
          selectedProjectManifestAccessBlocker =
            "project-browser-selected-project-candidate-output-manifest-accessor-failed";
          selectedProjectDetailAccessBlocker =
            "project-browser-selected-project-candidate-output-detail-accessor-failed";
          selectedProjectEngineRunReadinessAccessBlocker =
            "project-browser-selected-project-engine-run-readiness-accessor-failed";
        }
      }
    }
    const selectedProjectCandidateOutputManifestReadbackSummary =
      buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
        selectedProjectEnvelope,
        state.selectedProjectId,
        selectedProjectManifestAccessBlocker,
      );
    const selectedProjectCandidateOutputDetailReadbackSummary =
      buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
        selectedProjectEnvelope,
        state.selectedProjectId,
        selectedProjectDetailAccessBlocker,
      );
    const selectedProjectEngineRunReadinessReadbackSummary =
      buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
        selectedProjectEnvelope,
        state.selectedProjectId,
        selectedProjectEngineRunReadinessAccessBlocker,
      );
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: true,
      browserOnly: false,
      nonBootCritical: true,
      currentProject: readProject(context.project),
      selectedProjectId: state.selectedProjectId,
      selectedResultPersistedSummaryReadbackSummary: buildProjectBrowserSelectedResultPersistedSummaryReadbackSummary(
        storeSnapshot.projects,
        state.selectedProjectId,
      ),
      selectedProjectSelectedResultPersistedSummaryReadbackStatus: buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(
        storeSnapshot.projects,
        state.selectedProjectId,
      ),
      selectedProjectSelectedResultPersistedSummaryReadbackDetailSummary: buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary(
        storeSnapshot.projects,
        state.selectedProjectId,
      ),
      projectIesExportBoundaryReadbackSummary,
      projectIesExportResultReadbackSummary,
      projectIesExportReadbackSurfaceClassification:
        PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION,
      projectIesExportBoundaryReadbackStagedRemovalPlan:
        PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STAGED_REMOVAL_PLAN,
      projectIesExportBoundaryReadbackConsumerInventory:
        PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_CONSUMER_INVENTORY,
      selectedProjectIesExportBoundaryReadbackDetailSummary: buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
        projectIesExportBoundaryReadbackSummary,
        state.selectedProjectId,
      ),
      selectedProjectIesExportResultReadbackDetailSummary: buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
        projectIesExportResultReadbackSummary,
        state.selectedProjectId,
      ),
      selectedProjectCandidateOutputManifestReadbackSummary,
      selectedProjectCandidateOutputDetailReadbackSummary,
      selectedProjectEngineRunReadinessReadbackSummary,
      filters: { ...state.filters },
      projects: clone(storeSnapshot.projects),
      projectCount: storeSnapshot.count,
      savedCount: storeSnapshot.savedCount || 0,
      fixtureCount: storeSnapshot.fixtureCount || 0,
      safeEmpty: storeSnapshot.safeEmpty,
      emptyStateMessage: storeSnapshot.safeEmpty ? "No saved projects found. Save is ready; handoff/share package can still be prepared from current project state." : "Saved projects available. Runtime saves can be restored; package preparation is live.",
      save: storeSnapshot.save,
      restore: storeSnapshot.restore,
      hydrate: storeSnapshot.hydrate,
      handoffShare: storeSnapshot.handoffShare,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        prepareHandoff: true,
        prepareShare: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
      deferred: {
        externalDelivery: "deferred",
        emailSend: "deferred",
        hubspotWrite: "deferred",
      },
    };
  }

  function inspectProject(projectId, context = {}) {
    const envelope = savedProjectStore.getProjectEnvelope(projectId);
    if (!envelope) {
      return {
        accepted: false,
        reason: `Saved project not found: ${projectId}`,
        selectedResultPersistedSummaryReadbackDetailSummary: buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary({}),
        browser: getProjectBrowserSnapshot(context),
      };
    }
    state.selectedProjectId = envelope.envelopeId || envelope.projectId;
    const result = {
      accepted: true,
      readOnly: true,
      projectId: envelope.projectId,
      envelopeId: envelope.envelopeId,
      restoreEligible: envelope.readOnly !== true && envelope.browserOnly !== true,
      selectedResultPersistedSummaryReadbackDetailSummary: buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(envelope),
      envelope,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:inspect", result);
    return result;
  }

  function saveProject(context = {}, moduleContributions = {}) {
    const result = savedProjectStore.saveCurrentProjectEnvelope(context, moduleContributions);
    if (result.accepted) state.selectedProjectId = result.envelopeId;
    eventBus?.emit("project-browser:save", result);
    return {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
  }

  function restoreProject(projectIdOrEnvelopeId, context = {}) {
    const result = savedProjectStore.restoreProjectEnvelope(projectIdOrEnvelopeId || state.selectedProjectId, context);
    if (!result.accepted) {
      eventBus?.emit("project-browser:restore-rejected", result);
      return {
        ...result,
        browser: getProjectBrowserSnapshot(context),
      };
    }
    state.selectedProjectId = result.envelopeId;
    const projectResult = projectService?.restoreProjectFromEnvelope?.(result.envelope, result);
    const combined = {
      ...result,
      shellProjectUpdated: projectResult?.accepted === true,
      project: projectResult?.project || null,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:restore", combined);
    return combined;
  }

  function recordModuleHydrationResult(envelopeId, moduleId, moduleResult = {}, context = {}) {
    const result = savedProjectStore.recordModuleHydrationResult?.(
      envelopeId,
      moduleId,
      moduleResult,
    ) || {
      accepted: false,
      status: "hydrate-result-recorder-unavailable",
      reason: "Saved Project store does not expose a module hydration result recorder.",
    };
    const combined = {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:module-hydration-result", combined);
    return combined;
  }

  function prepareHandoffShare(context = {}) {
    const result = savedProjectStore.prepareHandoffSharePackage(context);
    if (result.accepted) {
      projectService?.recordHandoffSharePackage?.(result);
    }
    const combined = {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:handoff-share", combined);
    return combined;
  }

  function setSearch(search = "", context = {}) {
    state.filters.search = String(search || "");
    const snapshot = getProjectBrowserSnapshot(context);
    eventBus?.emit("project-browser:filter", { search: state.filters.search, browser: snapshot });
    return snapshot;
  }

  return {
    owner: state.owner,
    status: state.status,
    getProjectBrowserSnapshot,
    inspectProject,
    setSearch,
    saveProject,
    restoreProject,
    recordModuleHydrationResult,
    prepareHandoffShare,
    requestHandoff(context = {}) {
      return prepareHandoffShare(context);
    },
  };
}
