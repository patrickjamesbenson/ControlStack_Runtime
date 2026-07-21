import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildProjectBrowserProjectIesExportResultReadbackSummary,
  buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultSummary.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";
import {
  getShellProjectBrowserSelectedProjectExportAction,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const VALID_LM63 = [
  "IESNA:LM-63-2002",
  "[TEST] SHELL-PROJECT-BROWSER-SELECTED-PROJECT-EXPORTS-WORKFLOW",
  "TILT=NONE",
  "1 1000 1 3 1 1 2 0.1 1.2 0.05",
  "1 1 12",
  "0 90 180",
  "0",
  "100 50 0",
  "",
].join("\r\n");

function ordered(fieldOrder, fields) {
  return Object.fromEntries(fieldOrder.map((key) => [key, fields[key]]));
}

function buildReadyResultSummary() {
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: "redacted_ies_first_narrow_project_ies_export_result_summary_persisted",
    blocker: null,
    sourceKind: "safe-project-ies-export-boundary-readback-status",
    futureOutputKind: "ies-first-narrow-project-ies-export-result-summary",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    resultSummaryOnly: true,
    exportBoundaryReadbackOnly: true,
    productionProof: false,
    labProofAuthority: false,
    projectIesExportBoundaryReadbackReady: true,
    projectIesExportResultSummaryReady: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    opaqueBundleBoundaryRef:
      `safe-ies-first-narrow-candidate-output-bundle-boundary:${"1".repeat(40)}`,
    opaqueProjectIesExportBoundaryRef:
      `safe-ies-first-narrow-project-ies-export-boundary:${"2".repeat(40)}`,
    runLengthMm: 1200,
    builderOutputKind: "project-ies-lm63",
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 1,
    builderOutputRedactedPayloadMarkerCount: 1,
    policyFingerprint: "safe-policy:shell-project-browser-exports",
    sourceFingerprint: "safe-source:shell-project-browser-exports",
    sourceInputFingerprint: "safe-source-input:shell-project-browser-exports",
    boardDataSourceVersion: "safe-board-data-source-version:shell-project-browser-exports",
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint:
      `safe-ies-first-narrow-project-ies-export-boundary-job:${"3".repeat(40)}`,
    builderOutputReductionFingerprint:
      `safe-ies-first-narrow-project-ies-export-builder-output-reduction:${"4".repeat(40)}`,
    candidateOutputBundleBoundarySummaryFingerprint:
      `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"5".repeat(40)}`,
    projectIesExportBoundaryReadbackStatusSchemaId:
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
    projectIesExportBoundaryReadbackStatusSchemaVersion:
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
    projectIesExportBoundaryReadbackState:
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    projectIesExportBoundaryReadiness: "ready",
    projectIesExportBoundaryReadbackFingerprint:
      `safe-ies-first-narrow-project-ies-export-boundary-readback-status:${"6".repeat(40)}`,
    projectIesExportBoundaryContractId:
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    projectIesExportBoundarySummarySchemaId:
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    projectIesExportBoundarySummarySchemaVersion:
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    projectIesExportBoundarySummaryState:
      "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    projectIesExportBoundarySummaryFingerprint:
      `safe-ies-first-narrow-project-ies-export-boundary-summary:${"7".repeat(40)}`,
  };
  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS) {
    fields[key] = false;
  }
  const fingerprintSource = ordered(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER
      .filter((key) => key !== "iesFirstNarrowProjectIesExportResultSummaryFingerprint"),
    fields,
  );
  fields.iesFirstNarrowProjectIesExportResultSummaryFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-result-summary",
    fingerprintSource,
  );
  return Object.freeze(ordered(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER,
    fields,
  ));
}

function buildReadyReadbackStatus() {
  return buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummary: buildReadyResultSummary(),
        },
      },
    },
  });
}

function selectedProjectContext(status) {
  const project = {
    projectId: "shell-selected-project",
    envelopeId: "env-shell-selected-project",
    title: "Selected shell project",
    client: "ControlStack",
    site: "Project Browser",
    iesFirstNarrowProjectIesExportResultReadbackStatus: status,
  };
  const summary = buildProjectBrowserProjectIesExportResultReadbackSummary([project]);
  const detail = buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
    summary,
    project.envelopeId,
  );
  return {
    projectBrowser: {
      selectedProjectId: project.envelopeId,
      projects: [project],
      selectedProjectIesExportResultReadbackDetailSummary: detail,
    },
  };
}

function browserHarness() {
  const calls = [];
  const anchor = {
    click() {
      calls.push("click");
    },
    remove() {
      calls.push("remove");
    },
  };
  return {
    calls,
    browserDocument: {
      createElement(tagName) {
        calls.push(`createElement:${tagName}`);
        return anchor;
      },
      body: {
        appendChild(received) {
          assert.equal(received, anchor);
          calls.push("append");
        },
      },
    },
    browserUrlApi: {
      createObjectURL(blob) {
        assert.equal(blob instanceof Blob, true);
        calls.push("createObjectURL");
        return "blob:shell-project-browser-export";
      },
      revokeObjectURL(value) {
        assert.equal(value, "blob:shell-project-browser-export");
        calls.push("revokeObjectURL");
      },
    },
  };
}

function assertNoPrivatePayload(value) {
  const serialised = JSON.stringify(value);
  for (const marker of [
    "IESNA:LM-63",
    "TILT=NONE",
    "100 50 0",
    "blob:shell-project-browser-export",
    "controlstack-project-ies-",
  ]) {
    assert.equal(serialised.includes(marker), false, marker);
  }
}

test("selected-project exports facade remains frozen and fail-closed behind the Governance retrieval gateway", async () => {
  const status = buildReadyReadbackStatus();
  assert.equal(status.ready, true);
  const context = selectedProjectContext(status);
  let getterCalls = 0;
  let materialiserCalls = 0;
  const services = {
    savedProjects: {
      getIesFirstNarrowProjectIesExportResultReadbackStatus() {
        getterCalls += 1;
        return status;
      },
    },
    materialiseProjectIesDownload() {
      materialiserCalls += 1;
      return VALID_LM63;
    },
  };

  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context,
    services,
  });

  assert.equal(getterCalls, 0);
  assert.equal(materialiserCalls, 0);
  assert.equal(Object.isFrozen(workflow), true);
  assert.deepEqual(Object.keys(workflow), SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_FIELD_ORDER);
  assert.equal(workflow.schemaId, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_ID);
  assert.equal(workflow.schemaVersion, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_SCHEMA_VERSION);
  assert.equal(workflow.contractId, SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_EXPORTS_WORKFLOW_SURFACE_CONTRACT_ID);
  assert.equal(workflow.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.blockedFailClosed);
  assert.equal(workflow.blocker, "governance-data-retrieval-gateway-required");
  assert.equal(workflow.label, "Project exports");
  assert.equal(workflow.selectedProjectTitle, "Selected shell project");
  assert.equal(workflow.exportItemCount, 1);
  assert.equal(workflow.readyExportItemCount, 0);
  assert.equal(workflow.blockedExportItemCount, 1);
  assert.equal(Object.isFrozen(workflow.outputs), true);
  assert.equal(workflow.outputs.length, 1);

  const [output] = workflow.outputs;
  assert.equal(Object.isFrozen(output), true);
  assert.deepEqual(Object.keys(output), SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_FIELD_ORDER);
  assert.deepEqual(output, {
    schemaId: SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_ID,
    schemaVersion: SHELL_PROJECT_BROWSER_PROJECT_IES_EXPORT_ITEM_SCHEMA_VERSION,
    exportId: "project-ies",
    label: "Project IES",
    format: "LM-63",
    extension: ".ies",
    actionLabel: "Open data retrieval",
    state: "blocked",
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "governance-data-retrieval-gateway-required",
  });

  for (const key of [
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
  ]) {
    assert.equal(workflow[key], false, key);
  }
  assertNoPrivatePayload(workflow);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow), null);
});

test("selected-project exports facade stays fail-closed with exactly one blocked IES item when no project is selected", async () => {
  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: { projectBrowser: { selectedProjectId: null, projects: [] } },
    services: {},
  });

  assert.equal(workflow.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_EXPORTS_WORKFLOW_STATES.missing);
  assert.equal(workflow.readiness, "missing");
  assert.equal(workflow.ready, false);
  assert.equal(workflow.failClosed, true);
  assert.equal(workflow.selectedProjectTitle, "Select a saved project");
  assert.equal(workflow.exportItemCount, 1);
  assert.equal(workflow.readyExportItemCount, 0);
  assert.equal(workflow.blockedExportItemCount, 1);
  assert.equal(workflow.outputs[0].exportId, "project-ies");
  assert.equal(workflow.outputs[0].ready, false);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow), null);
  assertNoPrivatePayload(workflow);
});

test("shell renders and handles the facade without duplicating materialisation or browser-trigger implementation", async () => {
  const shellSource = await readFile(
    new URL("../apps/workspace-shell/src/shell.js", import.meta.url),
    "utf8",
  );
  const styleSource = await readFile(
    new URL("../apps/workspace-shell/src/styles.css", import.meta.url),
    "utf8",
  );
  const facadeSource = await readFile(
    new URL("../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js", import.meta.url),
    "utf8",
  );

  for (const symbol of [
    "renderProjectBrowserSelectedProjectExportsWorkflow",
    "refreshProjectBrowserSelectedProjectExportsWorkflow",
    "handleProjectBrowserSelectedProjectRetrievalRequest",
    "Open data retrieval",
    "LM-63 · .ies",
    "governance-data-retrieval-gateway-not-activated",
  ]) {
    assert.equal(shellSource.includes(symbol), true, symbol);
  }
  for (const prohibited of [
    "handleProjectBrowserProjectIesExportDownload",
    "getShellProjectBrowserSelectedProjectExportAction",
    "triggerIesBuilderProjectIesExportDownloadAction",
    "buildRuntimeIesFirstNarrowProjectIesExportDownloadMaterialisationBoundary",
    "materialiseRuntimeIesFirstNarrowProjectIesDownload",
    "preparedAction()",
  ]) {
    assert.equal(shellSource.includes(prohibited), false, prohibited);
  }

  assert.match(styleSource, /\.cs-shell__project-browser-exports\s*\{/);
  assert.match(styleSource, /\.cs-shell__project-browser-export-download/);

  assert.equal(
    facadeSource.includes("resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary"),
    false,
  );
  assert.equal(
    facadeSource.includes("prepareIesBuilderProjectIesExportDownloadCapabilityAction"),
    false,
  );
  assert.match(
    facadeSource,
    /export function getShellProjectBrowserSelectedProjectExportAction\(\)\s*\{\s*return null;\s*\}/,
  );
  for (const placeholder of [
    "Download PDF",
    "Download CSV",
    "Download JSON",
    "Download ZIP",
    "Evidence bundle",
    "Batch export",
    "Export all",
  ]) {
    assert.equal(shellSource.includes(placeholder), false, placeholder);
    assert.equal(facadeSource.includes(placeholder), false, placeholder);
  }
});
