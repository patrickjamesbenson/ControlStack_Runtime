import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputDetailSummary.js";
import {
  buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  buildShellProjectBrowserSelectedProjectExportDetailPreview,
  getShellProjectBrowserSelectedProjectExportAction,
  getShellProjectBrowserSelectedProjectExportDetailPreview,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_DETAIL_PREVIEW_CONTRACT_LOCK_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const PROJECT_ID = "detail-preview-contract-project";
const ENVELOPE_ID = "env-detail-preview-contract-project";

const EXPECTED_RUNTIME_REQUIRED_FALSE_FLAGS = Object.freeze([
  "slugGenerationEnabled",
  "slugGenerated",
  "productionSlugGenerated",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "donorInvocationEnabled",
  "donorInvoked",
  "donorEngineInvoked",
  "outputGenerationEnabled",
  "outputGenerationAttempted",
  "outputGenerated",
  "artifactGenerationEnabled",
  "artifactGenerated",
  "fileOutputEnabled",
  "fileOutputWritten",
  "routesAdded",
  "routeAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
  "mutationEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
  "boardDataMutated",
  "manifestFileOutputEnabled",
  "manifestFileOutputWritten",
  "detailFileOutputEnabled",
  "detailFileOutputWritten",
]);

const EXPECTED_READBACK_FIELD_ORDER = Object.freeze([
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

const EXPECTED_PREVIEW_FIELD_ORDER = Object.freeze([
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

const EXPECTED_PREVIEW_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_export_detail_preview_ready",
  missing: "shell_project_browser_selected_project_export_detail_preview_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_export_detail_preview_blocked_fail_closed",
});

const READBACK_REQUIRED_FALSE_FIELDS = Object.freeze([
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

const PREVIEW_REQUIRED_FALSE_FIELDS = Object.freeze([
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

function readyDetailSummary(overrides = {}) {
  return {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: "redacted_ies_first_narrow_candidate_output_detail_summary_persisted",
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
    sourceRunTableRowCount: 1,
    candidateOutputRecordCount: 1,
    manifestRecordCount: 1,
    detailRecordCount: 1,
    detailEntryCount: 1,
    firstDetailEntryKind: "ies_first_narrow_candidate_output_detail_summary_ref",
    firstCandidateOutputKind: "ies_first_narrow_candidate_output",
    firstManifestEntryKind: "ies_first_narrow_candidate_output_manifest_summary_ref",
    firstRowKey: "detail-preview-contract-safe-row-0",
    firstRowKind: "first_accepted_safe_run_summary",
    firstRunKey: "detail-preview-contract-safe-run-0",
    firstRunIndex: 0,
    firstRowAccepted: true,
    firstRowEngineVerified: true,
    firstRowBoardCount: 2,
    firstRowSegmentCount: 3,
    firstRowZoneCount: 1,
    firstRowClipPointsCount: 4,
    firstRowSuspensionPointsCount: 5,
    firstRowGearTrayPlanCount: 1,
    firstRowReservedRangesCount: 2,
    policyFingerprint: "safe-policy:detail-preview-contract",
    sourceFingerprint: "safe-source:detail-preview-contract",
    sourceInputFingerprint: "safe-source-input:detail-preview-contract",
    boardDataSourceVersion: "safe-board-data-source-version:detail-preview-contract",
    iesFirstNarrowMetadataHandoffSummaryFingerprint:
      "safe-ies-first-narrow-metadata-handoff-summary:detail-preview-contract",
    iesFirstNarrowCandidateOutputSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-summary:detail-preview-contract",
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-manifest-summary:detail-preview-contract",
    ...Object.fromEntries(
      RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS
        .map((key) => [key, false]),
    ),
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-detail-summary:detail-preview-contract",
    ...overrides,
  };
}

function selectedEnvelope(detailSummary = readyDetailSummary()) {
  return {
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowCandidateOutputDetailSummary: detailSummary,
        },
      },
    },
  };
}

function readyReadbackSummary() {
  return buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    selectedEnvelope(),
    ENVELOPE_ID,
  );
}

function selectedProjectContext(readbackSummary = readyReadbackSummary()) {
  return {
    projectBrowser: {
      selectedProjectId: ENVELOPE_ID,
      projects: [{
        projectId: PROJECT_ID,
        envelopeId: ENVELOPE_ID,
        title: "Detail preview contract project",
      }],
      selectedProjectCandidateOutputDetailReadbackSummary: readbackSummary,
    },
  };
}

function assertNoPrivateDetailPayload(value) {
  const serialised = JSON.stringify(value);
  for (const marker of [
    "IESNA:LM-63",
    "TILT=NONE",
    "candela-secret",
    "photometry-secret",
    "governance-secret",
    "mutation-log-secret",
    "detail-output.json",
    "candidate-output.ies",
    "C:\\ControlStack_RuntimeData",
    "data:application/octet-stream;base64",
    "blob:detail-secret",
    "https://example.invalid/detail",
    "detail-preview-contract-safe-row-0",
    "detail-preview-contract-safe-run-0",
  ]) {
    assert.equal(serialised.includes(marker), false, marker);
  }
}

function assertSafePreviewShape(preview) {
  assert.equal(Object.isFrozen(preview), true);
  assert.deepEqual(Object.keys(preview), EXPECTED_PREVIEW_FIELD_ORDER);
  assert.equal(preview.schemaId, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID);
  assert.equal(
    preview.schemaVersion,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_VERSION,
  );
  assert.equal(
    preview.contractId,
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SURFACE_CONTRACT_ID,
  );
  assert.equal(preview.selectedProjectOnly, true);
  assert.equal(preview.previewOnly, true);
  assert.equal(preview.diagnosticOnly, true);
  assert.equal(preview.detailOnly, true);
  assert.equal(preview.readOnly, true);
  assert.equal(preview.redacted, true);
  assert.equal(preview.machineValueSafe, true);
  assert.equal(preview.nonDownloadable, true);
  for (const field of PREVIEW_REQUIRED_FALSE_FIELDS) assert.equal(preview[field], false, field);
  for (const prohibitedField of [
    "firstRowKey",
    "firstRunKey",
    "detail",
    "artifactList",
    "iesText",
    "candela",
    "photometry",
    "governance",
    "mutationLog",
    "filename",
    "path",
    "blob",
    "url",
    "base64",
  ]) {
    assert.equal(Object.hasOwn(preview, prohibitedField), false, prohibitedField);
  }
  assertNoPrivateDetailPayload(preview);
}

test("detail preview contract lock fixes the existing runtime, readback, and shell schema contracts", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_DETAIL_PREVIEW_CONTRACT_LOCK_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-DETAIL-PREVIEW-CONTRACT-LOCK-1",
  );

  assert.equal(
    RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
    "controlstack.runtime.ies-first-narrow-candidate-output-detail-summary.v1",
  );
  assert.equal(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION, 1);
  assert.deepEqual(
    RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
    EXPECTED_RUNTIME_REQUIRED_FALSE_FLAGS,
  );
  assert.equal(
    RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET,
    "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputDetailSummary",
  );

  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID,
    "controlstack.runtime.project-browser.selected-project-candidate-output-detail-readback-summary.v1",
  );
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION,
    1,
  );
  assert.deepEqual(
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_FIELD_ORDER,
    EXPECTED_READBACK_FIELD_ORDER,
  );

  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-export-detail-preview.v1",
  );
  assert.equal(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_VERSION, 1);
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_FIELD_ORDER,
    EXPECTED_PREVIEW_FIELD_ORDER,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES,
    EXPECTED_PREVIEW_STATES,
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORT-DETAIL-PREVIEW-SURFACE-1",
  );
});

test("detail preview contract lock preserves the selected-project summary-to-preview projection", () => {
  const readback = readyReadbackSummary();
  assert.equal(Object.isFrozen(readback), true);
  assert.deepEqual(Object.keys(readback), EXPECTED_READBACK_FIELD_ORDER);
  assert.equal(
    readback.schemaId,
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID,
  );
  assert.equal(
    readback.schemaVersion,
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION,
  );
  assert.equal(readback.targetLocation, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET);
  assert.equal(readback.ready, true);
  assert.equal(readback.failClosed, false);
  assert.equal(readback.detailSummaryPresent, true);
  assert.equal(readback.detailBoundaryReady, true);
  assert.equal(readback.firstRowKey, "detail-preview-contract-safe-row-0");
  assert.equal(readback.firstRunKey, "detail-preview-contract-safe-run-0");
  for (const field of READBACK_REQUIRED_FALSE_FIELDS) assert.equal(readback[field], false, field);

  const preview = buildShellProjectBrowserSelectedProjectExportDetailPreview(readback, ENVELOPE_ID);
  assertSafePreviewShape(preview);
  assert.equal(preview.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.ready);
  assert.equal(preview.readiness, "ready");
  assert.equal(preview.ready, true);
  assert.equal(preview.failClosed, false);
  assert.equal(preview.blocker, null);
  assert.equal(preview.selectedProjectId, ENVELOPE_ID);
  assert.equal(preview.selectedProjectFound, true);
  assert.equal(preview.sourceSummaryPresent, true);
  assert.equal(preview.detailSummaryPresent, true);
  assert.equal(preview.detailBoundaryReady, true);
  assert.equal(preview.runTableRowCount, readback.sourceRunTableRowCount);
  assert.equal(preview.candidateOutputRecordCount, readback.candidateOutputRecordCount);
  assert.equal(preview.manifestRecordCount, readback.manifestRecordCount);
  assert.equal(preview.detailRecordCount, readback.detailRecordCount);
  assert.equal(preview.detailEntryCount, readback.detailEntryCount);
  assert.equal(preview.firstDetailEntryKind, readback.firstDetailEntryKind);
  assert.equal(preview.firstCandidateOutputKind, readback.firstCandidateOutputKind);
  assert.equal(preview.firstManifestEntryKind, readback.firstManifestEntryKind);
  assert.equal(preview.firstRowKind, readback.firstRowKind);
  assert.equal(preview.firstRunIndex, readback.firstRunIndex);
  assert.equal(preview.firstRowAccepted, readback.firstRowAccepted);
  assert.equal(preview.firstRowEngineVerified, readback.firstRowEngineVerified);
  assert.equal(preview.firstRowBoardCount, readback.firstRowBoardCount);
  assert.equal(preview.firstRowSegmentCount, readback.firstRowSegmentCount);
  assert.equal(preview.firstRowZoneCount, readback.firstRowZoneCount);
  assert.equal(preview.firstRowClipPointsCount, readback.firstRowClipPointsCount);
  assert.equal(preview.firstRowSuspensionPointsCount, readback.firstRowSuspensionPointsCount);
  assert.equal(preview.firstRowGearTrayPlanCount, readback.firstRowGearTrayPlanCount);
  assert.equal(preview.firstRowReservedRangesCount, readback.firstRowReservedRangesCount);
});

test("detail preview remains private while project-ies stays the sole workflow output and action route", async () => {
  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: selectedProjectContext(),
    services: {},
  });
  const preview = getShellProjectBrowserSelectedProjectExportDetailPreview(workflow);

  assert.equal(Object.isFrozen(workflow), true);
  assert.equal(Object.isFrozen(workflow.outputs), true);
  assert.equal(workflow.exportItemCount, 1);
  assert.equal(workflow.outputs.length, 1);
  assert.deepEqual(workflow.outputs.map((output) => output.exportId), ["project-ies"]);
  assert.equal(Object.hasOwn(workflow, "detailPreview"), false);
  assert.equal(Object.hasOwn(workflow, "exportDetailPreview"), false);
  assert.equal(JSON.stringify(workflow).includes(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID), false);
  assertSafePreviewShape(preview);
  assert.equal(preview.ready, true);

  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "project-ies"), null);
  for (const prohibitedActionId of [
    "detail",
    "export-detail",
    "export-details",
    "candidate-output-detail",
    "candidate-output-detail-summary",
    "export-all",
  ]) {
    assert.equal(
      getShellProjectBrowserSelectedProjectExportAction(workflow, prohibitedActionId),
      null,
      prohibitedActionId,
    );
    assert.equal(
      workflow.outputs.some((output) => output.exportId === prohibitedActionId),
      false,
      prohibitedActionId,
    );
  }
  assert.equal(getShellProjectBrowserSelectedProjectExportDetailPreview({}), null);
  assertNoPrivateDetailPayload(workflow);
});

test("detail preview contract fails closed for missing, cross-project, or unsafe detail summaries", () => {
  const readback = readyReadbackSummary();
  const missing = buildShellProjectBrowserSelectedProjectExportDetailPreview(null, ENVELOPE_ID);
  const mismatch = buildShellProjectBrowserSelectedProjectExportDetailPreview(
    readback,
    "env-different-selected-project",
  );
  const unsafeReadback = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    selectedEnvelope(readyDetailSummary({
      detailFileOutputEnabled: true,
      rawDetailReturned: true,
      detail: { filename: "detail-output.json" },
      iesText: "IESNA:LM-63 TILT=NONE candidate-output.ies",
      candela: "candela-secret",
      photometry: "photometry-secret",
      governance: "governance-secret",
      mutationLog: "mutation-log-secret",
      privatePath: "C:\\ControlStack_RuntimeData\\detail-output.json",
      base64: "data:application/octet-stream;base64,c2VjcmV0",
      blob: "blob:detail-secret",
      url: "https://example.invalid/detail",
    })),
    ENVELOPE_ID,
  );
  const unsafe = buildShellProjectBrowserSelectedProjectExportDetailPreview(
    unsafeReadback,
    ENVELOPE_ID,
  );

  for (const preview of [missing, mismatch, unsafe]) {
    assertSafePreviewShape(preview);
    assert.equal(preview.ready, false);
    assert.equal(preview.failClosed, true);
    assert.equal(preview.detailSummaryPresent, false);
    assert.equal(preview.detailBoundaryReady, false);
    assert.equal(preview.detailRecordCount, 0);
    assert.equal(preview.detailEntryCount, 0);
    assert.equal(preview.firstDetailEntryKind, null);
    assert.equal(preview.firstRunIndex, null);
  }
  assert.equal(
    missing.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.missing,
  );
  assert.equal(missing.blocker, "selected-project-export-detail-preview-summary-missing");
  assert.equal(
    mismatch.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.blockedFailClosed,
  );
  assert.equal(mismatch.blocker, "selected-project-export-detail-preview-selection-mismatch");
  assert.equal(unsafe.blocker, "blocked-unsafe-true-flag-detailFileOutputEnabled");
});

test("detail preview contract lock preserves PRIVATE_DETAIL_PREVIEWS as the only storage seam", async () => {
  const workflowSource = await readFile(
    new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(workflowSource, /const PRIVATE_DETAIL_PREVIEWS = new WeakMap\(\);/);
  assert.match(
    workflowSource,
    /PRIVATE_DETAIL_PREVIEWS\.set\(\s*frozenDescriptor,\s*buildShellProjectBrowserSelectedProjectExportDetailPreview\(\s*context\?\.projectBrowser\?\.selectedProjectCandidateOutputDetailReadbackSummary,\s*selected\.selectedProjectId,\s*\),\s*\);/s,
  );
  assert.match(
    workflowSource,
    /export function getShellProjectBrowserSelectedProjectExportDetailPreview\(workflowDescriptor\) \{\s*return PRIVATE_DETAIL_PREVIEWS\.get\(workflowDescriptor\) \|\| null;\s*\}/s,
  );
  assert.match(
    workflowSource,
    /export function getShellProjectBrowserSelectedProjectExportAction\(\)\s*\{\s*return null;\s*\}/,
  );
  assert.match(workflowSource, /outputs: Object\.freeze\(\[output\]\)/);
  assert.doesNotMatch(workflowSource, /PRIVATE_PREPARED_ACTIONS/);
  assert.doesNotMatch(workflowSource, /new Map\(\[\["project-ies", preparedAction\]\]\)/);
  assert.doesNotMatch(workflowSource, /\bpreparedAction\s*=|preparedAction\(\)/);

  for (const prohibited of [
    "Download details",
    "Download detail",
    "detail-output.json",
    "candidate-output-detail.json",
    "data:application/octet-stream;base64",
  ]) {
    assert.equal(workflowSource.includes(prohibited), false, prohibited);
  }
});
