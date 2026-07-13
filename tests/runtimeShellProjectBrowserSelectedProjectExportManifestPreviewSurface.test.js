import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectExportManifestPreview,
  getShellProjectBrowserSelectedProjectExportAction,
  getShellProjectBrowserSelectedProjectExportManifestPreview,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const SOURCE_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-candidate-output-manifest-readback-summary.v1";
const PROJECT_ID = "manifest-preview-project";
const ENVELOPE_ID = "env-manifest-preview-project";

const REQUIRED_FALSE_SOURCE_FLAGS = Object.freeze([
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

const REQUIRED_FALSE_PREVIEW_FLAGS = Object.freeze([
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

function readyReadbackSummary(overrides = {}) {
  return Object.freeze({
    schemaId: SOURCE_SCHEMA_ID,
    schemaVersion: 1,
    owner: "shell",
    source: "project-browser-selected-project-candidate-output-manifest-readback",
    state: "project_browser_selected_project_candidate_output_manifest_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedProjectId: ENVELOPE_ID,
    selectedProjectFound: true,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    manifestSummaryPresent: true,
    manifestBoundaryReady: true,
    runTableRowCount: 3,
    candidateOutputRecordCount: 1,
    manifestRecordCount: 1,
    manifestEntryCount: 1,
    firstCandidateOutputKind: "ies_first_narrow_candidate_output",
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
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
    "manifest-output.json",
    "candidate-output.ies",
    "C:\\ControlStack_RuntimeData",
    "data:text/plain;base64",
  ]) {
    assert.equal(serialised.includes(marker), false, marker);
  }
}

test("selected-project export manifest preview projects only redacted diagnostic counts and output kind", () => {
  const preview = buildShellProjectBrowserSelectedProjectExportManifestPreview(
    readyReadbackSummary({
      iesText: "IESNA:LM-63 TILT=NONE",
      candela: "candela-secret",
      governance: "governance-secret",
      mutationLog: "mutation-log-secret",
      filename: "manifest-output.json",
      privatePath: "C:\\ControlStack_RuntimeData\\manifest-output.json",
      base64: "data:text/plain;base64,c2VjcmV0",
    }),
  );

  assert.equal(Object.isFrozen(preview), true);
  assert.deepEqual(
    Object.keys(preview),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_FIELD_ORDER,
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORT-MANIFEST-PREVIEW-SURFACE-1",
  );
  assert.equal(
    preview.schemaId,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_ID,
  );
  assert.equal(
    preview.schemaVersion,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_VERSION,
  );
  assert.equal(preview.label, "Export contents");
  assert.equal(
    preview.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.ready,
  );
  assert.equal(preview.readiness, "ready");
  assert.equal(preview.ready, true);
  assert.equal(preview.failClosed, false);
  assert.equal(preview.blocker, null);
  assert.equal(preview.selectedProjectId, ENVELOPE_ID);
  assert.equal(preview.selectedProjectFound, true);
  assert.equal(preview.selectedProjectOnly, true);
  assert.equal(preview.sourceSummaryPresent, true);
  assert.equal(preview.manifestSummaryPresent, true);
  assert.equal(preview.manifestBoundaryReady, true);
  assert.equal(preview.runTableRowCount, 3);
  assert.equal(preview.candidateOutputRecordCount, 1);
  assert.equal(preview.manifestRecordCount, 1);
  assert.equal(preview.manifestEntryCount, 1);
  assert.equal(preview.firstCandidateOutputKind, "ies_first_narrow_candidate_output");
  assert.equal(preview.previewOnly, true);
  assert.equal(preview.diagnosticOnly, true);
  assert.equal(preview.readOnly, true);
  assert.equal(preview.redacted, true);
  assert.equal(preview.machineValueSafe, true);
  assert.equal(preview.nonDownloadable, true);
  for (const key of REQUIRED_FALSE_PREVIEW_FLAGS) assert.equal(preview[key], false, key);
  assertNoPrivatePayload(preview);
});

test("manifest preview stays missing or blocked fail-closed and never projects unsafe source values", () => {
  const missing = buildShellProjectBrowserSelectedProjectExportManifestPreview();
  const blocked = buildShellProjectBrowserSelectedProjectExportManifestPreview(
    readyReadbackSummary({
      manifestFileOutputEnabled: true,
      rawIesReturned: true,
      iesText: "IESNA:LM-63 TILT=NONE candidate-output.ies",
      privatePath: "C:\\ControlStack_RuntimeData\\candidate-output.ies",
    }),
  );

  assert.equal(
    missing.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.missing,
  );
  assert.equal(missing.readiness, "missing");
  assert.equal(missing.ready, false);
  assert.equal(missing.failClosed, true);
  assert.equal(missing.sourceSummaryPresent, false);
  assert.equal(missing.manifestEntryCount, 0);

  assert.equal(
    blocked.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.blockedFailClosed,
  );
  assert.equal(blocked.readiness, "blocked_fail_closed");
  assert.equal(blocked.ready, false);
  assert.equal(blocked.failClosed, true);
  assert.equal(blocked.blocker, "selected-project-export-manifest-preview-source-blocked");
  assert.equal(blocked.manifestSummaryPresent, false);
  assert.equal(blocked.manifestBoundaryReady, false);
  assert.equal(blocked.manifestEntryCount, 0);
  assert.equal(blocked.firstCandidateOutputKind, null);
  for (const key of REQUIRED_FALSE_PREVIEW_FLAGS) assert.equal(blocked[key], false, key);
  assertNoPrivatePayload(missing);
  assertNoPrivatePayload(blocked);
});

test("workflow retains the preview separately while project-ies remains the only export action", async () => {
  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        projects: [{
          projectId: PROJECT_ID,
          envelopeId: ENVELOPE_ID,
          title: "Manifest preview project",
        }],
        selectedProjectCandidateOutputManifestReadbackSummary: readyReadbackSummary(),
      },
    },
    services: {},
  });
  const preview = getShellProjectBrowserSelectedProjectExportManifestPreview(workflow);

  assert.equal(Object.hasOwn(workflow, "manifestPreview"), false);
  assert.equal(workflow.exportItemCount, 1);
  assert.deepEqual(workflow.outputs.map((output) => output.exportId), ["project-ies"]);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "project-ies"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "manifest"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "export-all"), null);
  assert.equal(preview.ready, true);
  assert.equal(preview.manifestEntryCount, 1);
  assert.equal(
    getShellProjectBrowserSelectedProjectExportManifestPreview({}),
    null,
  );
  assertNoPrivatePayload(workflow);
  assertNoPrivatePayload(preview);
});

test("shell renders a non-interactive Export contents preview with no manifest or placeholder action", async () => {
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
    /context\?\.projectBrowser\?\.selectedProjectCandidateOutputManifestReadbackSummary/,
  );
  assert.match(
    workflowSource,
    /getShellProjectBrowserSelectedProjectExportManifestPreview\(workflowDescriptor\)/,
  );
  assert.equal(workflowSource.includes("packages/workspace-kernel"), false);

  for (const symbol of [
    "Export contents",
    "projectBrowserSelectedProjectExportManifestPreview",
    "renderProjectBrowserSelectedProjectExportManifestPreview(preview)",
    "getShellProjectBrowserSelectedProjectExportManifestPreview(workflowDescriptor)",
    "Run-table rows",
    "Candidate outputs",
    "Manifest records",
    "Manifest entries",
    "First output kind",
  ]) {
    assert.equal(shellSource.includes(symbol), true, symbol);
  }

  const previewRendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectExportManifestPreview(preview)",
  );
  const previewRendererEnd = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectExportsWorkflow(workflowDescriptor)",
    previewRendererStart,
  );
  const previewRenderer = shellSource.slice(previewRendererStart, previewRendererEnd);
  assert.doesNotMatch(previewRenderer, /createElement\("button"\)/);
  assert.doesNotMatch(previewRenderer, /dataset\.shellExportId/);
  assert.doesNotMatch(previewRenderer, /preparedAction|objectURL|Blob/);

  assert.match(styleSource, /\.cs-shell__project-browser-export-manifest-preview\s*\{/);
  assert.match(styleSource, /\.cs-shell__project-browser-export-manifest-preview-fields\s*\{/);

  for (const prohibited of [
    "Download manifest",
    "Manifest download",
    "Download PDF",
    "Download CSV",
    "Download JSON",
    "Download ZIP",
    "Evidence bundle",
    "Batch export",
    "Export all",
    "Handoff export package",
  ]) {
    assert.equal(shellSource.includes(prohibited), false, prohibited);
    assert.equal(workflowSource.includes(prohibited), false, prohibited);
  }
});
