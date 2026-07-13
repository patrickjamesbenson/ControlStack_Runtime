import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputManifestSummary.js";
import {
  buildShellProjectBrowserSelectedProjectExportManifestPreview,
  getShellProjectBrowserSelectedProjectExportAction,
  getShellProjectBrowserSelectedProjectExportManifestPreview,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_MANIFEST_PREVIEW_CONTRACT_LOCK_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const PROJECT_ID = "manifest-preview-contract-project";
const ENVELOPE_ID = "env-manifest-preview-contract-project";

const PREVIEW_REQUIRED_FALSE_FIELDS = Object.freeze([
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

function readyManifestSummary(overrides = {}) {
  return {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
    state: "redacted_ies_first_narrow_candidate_output_manifest_summary_persisted",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    readyForManifestBoundary: true,
    readyForFutureOutput: true,
    manifestJoined: true,
    runTableFirstNarrowRowsReady: true,
    iesFirstNarrowMetadataHandoffReady: true,
    iesFirstNarrowCandidateOutputSummaryReady: true,
    sourceRunTableRowCount: 1,
    candidateOutputRecordCount: 1,
    manifestRecordCount: 1,
    manifestEntryCount: 1,
    firstCandidateOutputKind: "ies_first_narrow_candidate_output",
    policyFingerprint: "safe-policy:manifest-preview-contract",
    sourceFingerprint: "safe-source:manifest-preview-contract",
    sourceInputFingerprint: "safe-source-input:manifest-preview-contract",
    iesFirstNarrowMetadataHandoffSummaryFingerprint:
      "safe-ies-first-narrow-metadata-handoff-summary:manifest-preview-contract",
    iesFirstNarrowCandidateOutputSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-summary:manifest-preview-contract",
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-manifest-summary:manifest-preview-contract",
    ...Object.fromEntries(
      RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS
        .map((key) => [key, false]),
    ),
    ...overrides,
  };
}

function selectedEnvelope() {
  return {
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowCandidateOutputManifestSummary: readyManifestSummary(),
        },
      },
    },
  };
}

function readyReadbackSummary() {
  return buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
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
        title: "Manifest preview contract project",
      }],
      selectedProjectCandidateOutputManifestReadbackSummary: readbackSummary,
    },
  };
}

function assertSafePreviewShape(preview) {
  assert.equal(Object.isFrozen(preview), true);
  assert.deepEqual(
    Object.keys(preview),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_FIELD_ORDER,
  );
  assert.equal(
    preview.schemaId,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_ID,
  );
  assert.equal(
    preview.schemaVersion,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SCHEMA_VERSION,
  );
  assert.equal(
    preview.contractId,
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_SURFACE_CONTRACT_ID,
  );
  assert.equal(preview.selectedProjectOnly, true);
  assert.equal(preview.previewOnly, true);
  assert.equal(preview.diagnosticOnly, true);
  assert.equal(preview.readOnly, true);
  assert.equal(preview.redacted, true);
  assert.equal(preview.machineValueSafe, true);
  assert.equal(preview.nonDownloadable, true);
  for (const field of PREVIEW_REQUIRED_FALSE_FIELDS) assert.equal(preview[field], false, field);

  const text = JSON.stringify(preview);
  for (const prohibited of [
    "IESNA:LM-63",
    "TILT=NONE",
    "candidate-output.ies",
    "manifest-output.json",
    "C:\\ControlStack_RuntimeData",
    "data:application/octet-stream;base64",
  ]) {
    assert.equal(text.includes(prohibited), false, prohibited);
  }
}

test("manifest preview contract lock preserves a summary-backed, selected-project-only preview", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_MANIFEST_PREVIEW_CONTRACT_LOCK_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-EXPORTS-WORKFLOW-MANIFEST-PREVIEW-CONTRACT-LOCK-1",
  );

  const readback = readyReadbackSummary();
  assert.equal(
    readback.schemaId,
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID,
  );
  const preview = buildShellProjectBrowserSelectedProjectExportManifestPreview(
    readback,
    ENVELOPE_ID,
  );

  assertSafePreviewShape(preview);
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
  assert.equal(preview.sourceSummaryPresent, true);
  assert.equal(preview.manifestSummaryPresent, true);
  assert.equal(preview.manifestBoundaryReady, true);
  assert.equal(preview.runTableRowCount, readback.runTableRowCount);
  assert.equal(preview.candidateOutputRecordCount, readback.candidateOutputRecordCount);
  assert.equal(preview.manifestRecordCount, readback.manifestRecordCount);
  assert.equal(preview.manifestEntryCount, readback.manifestEntryCount);
  assert.equal(preview.firstCandidateOutputKind, readback.firstCandidateOutputKind);
});

test("expanded workflow keeps project-ies as the sole downloadable output and the manifest outside action routing", async () => {
  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: selectedProjectContext(),
    services: {},
  });
  const preview = getShellProjectBrowserSelectedProjectExportManifestPreview(workflow);

  assert.equal(Object.isFrozen(workflow), true);
  assert.equal(Object.isFrozen(workflow.outputs), true);
  assert.equal(workflow.exportItemCount, 1);
  assert.equal(workflow.outputs.length, 1);
  assert.deepEqual(workflow.outputs.map((output) => output.exportId), ["project-ies"]);
  assert.equal(Object.hasOwn(workflow, "manifestPreview"), false);
  assertSafePreviewShape(preview);
  assert.equal(preview.ready, true);
  assert.equal(
    getShellProjectBrowserSelectedProjectExportAction(workflow, "candidate-output-manifest"),
    null,
  );
  assert.equal(
    workflow.outputs.some((output) => output.exportId === "candidate-output-manifest"),
    false,
  );
});

test("manifest preview fails closed for cross-project, unsafe, or missing summaries", () => {
  const readback = readyReadbackSummary();
  const mismatch = buildShellProjectBrowserSelectedProjectExportManifestPreview(
    readback,
    "env-different-selected-project",
  );
  const unsafe = buildShellProjectBrowserSelectedProjectExportManifestPreview(
    { ...readback, downloadAvailable: true },
    ENVELOPE_ID,
  );
  const missing = buildShellProjectBrowserSelectedProjectExportManifestPreview(null, ENVELOPE_ID);

  for (const preview of [mismatch, unsafe, missing]) {
    assertSafePreviewShape(preview);
    assert.equal(preview.ready, false);
    assert.equal(preview.failClosed, true);
    assert.equal(preview.manifestEntryCount, 0);
    assert.equal(preview.firstCandidateOutputKind, null);
  }
  assert.equal(
    mismatch.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.blockedFailClosed,
  );
  assert.equal(
    mismatch.blocker,
    "selected-project-export-manifest-preview-selection-mismatch",
  );
  assert.equal(
    unsafe.blocker,
    "selected-project-export-manifest-preview-source-blocked",
  );
  assert.equal(
    missing.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORT_MANIFEST_PREVIEW_STATES.missing,
  );
  assert.equal(
    missing.blocker,
    "selected-project-export-manifest-preview-summary-missing",
  );
});

test("shell renders the manifest as text-only preview with no manifest action control", async () => {
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

  assert.match(workflowSource, /const PRIVATE_MANIFEST_PREVIEWS = new WeakMap\(\);/);
  assert.match(
    workflowSource,
    /buildShellProjectBrowserSelectedProjectExportManifestPreview\(\s*context\?\.projectBrowser\?\.selectedProjectCandidateOutputManifestReadbackSummary,\s*selected\.selectedProjectId,\s*\)/s,
  );
  assert.match(
    shellSource,
    /getShellProjectBrowserSelectedProjectExportManifestPreview\(workflowDescriptor\)/,
  );
  const renderStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectExportManifestPreview(preview)",
  );
  const renderEnd = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectExportsWorkflow(workflowDescriptor)",
    renderStart,
  );
  assert.notEqual(renderStart, -1);
  assert.notEqual(renderEnd, -1);
  const renderer = shellSource.slice(renderStart, renderEnd);
  assert.doesNotMatch(renderer, /createElement\("button"\)|data-shell-export-id|preparedAction/);
  assert.match(renderer, /Preview only, redacted, selected-project-only, diagnostic, and non-downloadable/);
  assert.match(styleSource, /\.cs-shell__project-browser-export-manifest-preview\s*\{/);
  assert.match(styleSource, /\.cs-shell__project-browser-export-manifest-preview-fields\s*\{/);
});
