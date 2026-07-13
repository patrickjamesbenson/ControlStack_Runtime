import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectExportDetailPreview,
  getShellProjectBrowserSelectedProjectExportAction,
  getShellProjectBrowserSelectedProjectExportDetailPreview,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const SOURCE_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-candidate-output-detail-readback-summary.v1";
const PROJECT_ID = "detail-preview-project";
const ENVELOPE_ID = "env-detail-preview-project";

const REQUIRED_FALSE_SOURCE_FLAGS = Object.freeze([
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

const REQUIRED_FALSE_PREVIEW_FLAGS = Object.freeze([
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

function readyReadbackSummary(overrides = {}) {
  return Object.freeze({
    schemaId: SOURCE_SCHEMA_ID,
    schemaVersion: 1,
    owner: "shell",
    source: "project-browser-selected-project-candidate-output-detail-readback",
    state: "project_browser_selected_project_candidate_output_detail_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedProjectId: ENVELOPE_ID,
    selectedProjectFound: true,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    detailSummaryPresent: true,
    detailBoundaryReady: true,
    sourceRunTableRowCount: 1,
    candidateOutputRecordCount: 1,
    manifestRecordCount: 1,
    detailRecordCount: 1,
    detailEntryCount: 1,
    firstDetailEntryKind: "ies_first_narrow_candidate_output_detail_summary_ref",
    firstCandidateOutputKind: "ies_first_narrow_candidate_output",
    firstManifestEntryKind: "ies_first_narrow_candidate_output_manifest_summary_ref",
    firstRowKey: "private-row-key-not-for-preview",
    firstRowKind: "first_accepted_safe_run_summary",
    firstRunKey: "private-run-key-not-for-preview",
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
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
    detailOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    ...Object.fromEntries(REQUIRED_FALSE_SOURCE_FLAGS.map((key) => [key, false])),
    ...overrides,
  });
}

function assertNoPrivatePayload(value) {
  const serialised = JSON.stringify(value);
  for (const marker of [
    "IESNA:LM-63",
    "TILT=NONE",
    "candela-secret",
    "governance-secret",
    "mutation-log-secret",
    "detail-output.json",
    "candidate-output.ies",
    "C:\\ControlStack_RuntimeData",
    "data:application/octet-stream;base64",
    "blob:detail-secret",
    "https://example.invalid/detail",
    "private-row-key-not-for-preview",
    "private-run-key-not-for-preview",
  ]) {
    assert.equal(serialised.includes(marker), false, marker);
  }
}

function assertSafePreviewShape(preview) {
  assert.equal(Object.isFrozen(preview), true);
  assert.deepEqual(
    Object.keys(preview),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_FIELD_ORDER,
  );
  assert.equal(
    preview.schemaId,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SCHEMA_ID,
  );
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
  for (const field of REQUIRED_FALSE_PREVIEW_FLAGS) assert.equal(preview[field], false, field);
  assert.equal(Object.hasOwn(preview, "firstRowKey"), false);
  assert.equal(Object.hasOwn(preview, "firstRunKey"), false);
  assert.equal(Object.hasOwn(preview, "filename"), false);
  assert.equal(Object.hasOwn(preview, "url"), false);
  assert.equal(Object.hasOwn(preview, "blob"), false);
  assertNoPrivatePayload(preview);
}

test("selected-project export detail preview projects only approved redacted counts, kinds, and booleans", () => {
  const preview = buildShellProjectBrowserSelectedProjectExportDetailPreview(
    readyReadbackSummary({
      detail: { filename: "detail-output.json" },
      iesText: "IESNA:LM-63 TILT=NONE",
      candela: "candela-secret",
      governance: "governance-secret",
      mutationLog: "mutation-log-secret",
      privatePath: "C:\\ControlStack_RuntimeData\\detail-output.json",
      base64: "data:application/octet-stream;base64,c2VjcmV0",
      blob: "blob:detail-secret",
      url: "https://example.invalid/detail",
    }),
    ENVELOPE_ID,
  );

  assertSafePreviewShape(preview);
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORT-DETAIL-PREVIEW-SURFACE-1",
  );
  assert.equal(preview.label, "Export details");
  assert.equal(
    preview.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_DETAIL_PREVIEW_STATES.ready,
  );
  assert.equal(preview.readiness, "ready");
  assert.equal(preview.ready, true);
  assert.equal(preview.failClosed, false);
  assert.equal(preview.blocker, null);
  assert.equal(preview.selectedProjectId, ENVELOPE_ID);
  assert.equal(preview.selectedProjectFound, true);
  assert.equal(preview.sourceSummaryPresent, true);
  assert.equal(preview.detailSummaryPresent, true);
  assert.equal(preview.detailBoundaryReady, true);
  assert.equal(preview.runTableRowCount, 1);
  assert.equal(preview.candidateOutputRecordCount, 1);
  assert.equal(preview.manifestRecordCount, 1);
  assert.equal(preview.detailRecordCount, 1);
  assert.equal(preview.detailEntryCount, 1);
  assert.equal(preview.firstDetailEntryKind, "ies_first_narrow_candidate_output_detail_summary_ref");
  assert.equal(preview.firstCandidateOutputKind, "ies_first_narrow_candidate_output");
  assert.equal(preview.firstManifestEntryKind, "ies_first_narrow_candidate_output_manifest_summary_ref");
  assert.equal(preview.firstRowKind, "first_accepted_safe_run_summary");
  assert.equal(preview.firstRunIndex, 0);
  assert.equal(preview.firstRowAccepted, true);
  assert.equal(preview.firstRowEngineVerified, true);
  assert.equal(preview.firstRowBoardCount, 2);
  assert.equal(preview.firstRowSegmentCount, 3);
  assert.equal(preview.firstRowZoneCount, 1);
  assert.equal(preview.firstRowClipPointsCount, 4);
  assert.equal(preview.firstRowSuspensionPointsCount, 5);
  assert.equal(preview.firstRowGearTrayPlanCount, 1);
  assert.equal(preview.firstRowReservedRangesCount, 2);
});

test("detail preview stays missing or blocked fail-closed for missing, cross-project, or unsafe summaries", () => {
  const missing = buildShellProjectBrowserSelectedProjectExportDetailPreview(null, ENVELOPE_ID);
  const mismatch = buildShellProjectBrowserSelectedProjectExportDetailPreview(
    readyReadbackSummary(),
    "env-different-selected-project",
  );
  const unsafe = buildShellProjectBrowserSelectedProjectExportDetailPreview(
    readyReadbackSummary({
      detailFileOutputEnabled: true,
      rawDetailReturned: true,
      detail: { filename: "detail-output.json" },
      iesText: "IESNA:LM-63 TILT=NONE candidate-output.ies",
    }),
    ENVELOPE_ID,
  );

  for (const preview of [missing, mismatch, unsafe]) {
    assertSafePreviewShape(preview);
    assert.equal(preview.ready, false);
    assert.equal(preview.failClosed, true);
    assert.equal(preview.detailSummaryPresent, false);
    assert.equal(preview.detailBoundaryReady, false);
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
  assert.equal(unsafe.blocker, "selected-project-export-detail-preview-source-blocked");
});

test("workflow retains detail preview separately while project-ies remains the only output and action id", async () => {
  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        projects: [{
          projectId: PROJECT_ID,
          envelopeId: ENVELOPE_ID,
          title: "Detail preview project",
        }],
        selectedProjectCandidateOutputDetailReadbackSummary: readyReadbackSummary(),
      },
    },
    services: {},
  });
  const preview = getShellProjectBrowserSelectedProjectExportDetailPreview(workflow);

  assert.equal(Object.hasOwn(workflow, "detailPreview"), false);
  assert.equal(workflow.exportItemCount, 1);
  assert.deepEqual(workflow.outputs.map((output) => output.exportId), ["project-ies"]);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "project-ies"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "detail"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "export-details"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "export-all"), null);
  assertSafePreviewShape(preview);
  assert.equal(preview.ready, true);
  assert.equal(preview.detailEntryCount, 1);
  assert.equal(getShellProjectBrowserSelectedProjectExportDetailPreview({}), null);
  assertNoPrivatePayload(workflow);
});

test("shell renders Export details beneath the manifest as a non-interactive preview", async () => {
  const [workflowSource, shellSource, styleSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/styles.css", import.meta.url), "utf8"),
  ]);

  assert.match(
    workflowSource,
    /context\?\.projectBrowser\?\.selectedProjectCandidateOutputDetailReadbackSummary/,
  );
  assert.match(workflowSource, /const PRIVATE_DETAIL_PREVIEWS = new WeakMap\(\);/);
  assert.match(
    workflowSource,
    /getShellProjectBrowserSelectedProjectExportDetailPreview\(workflowDescriptor\)/,
  );
  assert.equal(workflowSource.includes("packages/workspace-kernel"), false);

  for (const symbol of [
    "Export details",
    "projectBrowserSelectedProjectExportDetailPreview",
    "renderProjectBrowserSelectedProjectExportDetailPreview(preview)",
    "getShellProjectBrowserSelectedProjectExportDetailPreview(workflowDescriptor)",
    "Detail records",
    "Detail entries",
    "First detail kind",
    "First row accepted",
    "First row engine verified",
    "Gear tray plans",
    "Reserved ranges",
  ]) {
    assert.equal(shellSource.includes(symbol), true, symbol);
  }

  const manifestSection = shellSource.indexOf("const exportManifestPreviewSection");
  const detailSection = shellSource.indexOf("const exportDetailPreviewSection");
  assert.ok(manifestSection >= 0);
  assert.ok(detailSection > manifestSection);

  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectExportDetailPreview(preview)",
  );
  const rendererEnd = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectExportsWorkflow(workflowDescriptor)",
    rendererStart,
  );
  assert.notEqual(rendererStart, -1);
  assert.notEqual(rendererEnd, -1);
  const renderer = shellSource.slice(rendererStart, rendererEnd);
  assert.doesNotMatch(renderer, /createElement\("button"\)/);
  assert.doesNotMatch(renderer, /dataset\.shellExportId/);
  assert.doesNotMatch(renderer, /preparedAction|objectURL|Blob/);
  assert.doesNotMatch(renderer, /firstRowKey|firstRunKey|Fingerprint/);
  assert.match(
    renderer,
    /Preview only, redacted, selected-project-only, diagnostic, detail-only, and non-downloadable/,
  );

  assert.match(styleSource, /\.cs-shell__project-browser-export-detail-preview\s*\{/);
  assert.match(styleSource, /\.cs-shell__project-browser-export-detail-preview-fields\s*\{/);

  for (const prohibited of [
    "Download details",
    "Download detail",
    "Download PDF",
    "Download CSV",
    "Download JSON",
    "Download ZIP",
    "Batch export",
    "Export all",
  ]) {
    assert.equal(shellSource.includes(prohibited), false, prohibited);
    assert.equal(workflowSource.includes(prohibited), false, prohibited);
  }
});
