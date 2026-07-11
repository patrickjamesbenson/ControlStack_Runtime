import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput,
  IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_CONTRACT_ID,
  IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_FIELD_ORDER,
  IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_ID,
  IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_VERSION,
  IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES,
  resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary,
} from "../packages/modules/ies-builder/iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js";
import {
  buildProjectBrowserProjectIesExportResultReadbackSummary,
  buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const READBACK_FINGERPRINT_PREFIX =
  "safe-ies-first-narrow-project-ies-export-result-readback-status";
const DETAIL_FINGERPRINT_PREFIX =
  "safe-project-browser-selected-project-ies-export-result-readback-detail-summary";

function readyReadbackStatus(overrides = {}, { freeze = true, recomputeFingerprint = true } = {}) {
  const base = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
    state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    reason: "ready selected-project result readback fixture",
    owner: "shell",
    slotOwner: "shell",
    envelopeOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultSummary",
    summaryPresent: true,
    summarySchemaId: "controlstack.runtime.ies-first-narrow-project-ies-export-result-summary.v1",
    summarySchemaVersion: 1,
    summaryContractId: "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-RESULT-SUMMARY-1",
    summaryState: "redacted_ies_first_narrow_project_ies_export_result_summary_persisted",
    summaryFingerprint: `safe-ies-first-narrow-project-ies-export-result-summary:${"a".repeat(40)}`,
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
    sourceKind: "project-ies-export-result-summary",
    futureOutputKind: "project-ies-lm63",
    opaqueBundleBoundaryRef: `safe-ies-first-narrow-candidate-output-bundle-boundary:${"b".repeat(40)}`,
    opaqueProjectIesExportBoundaryRef: `safe-ies-first-narrow-project-ies-export-boundary:${"c".repeat(40)}`,
    builderOutputKind: "project-ies-lm63",
    policyFingerprint: "safe-policy:selected-project-download-source-fixture",
    sourceFingerprint: "safe-source:selected-project-download-source-fixture",
    sourceInputFingerprint: "safe-source-input:selected-project-download-source-fixture",
    boardDataSourceVersion: "safe-board-data-source-version:selected-project-download-source-fixture",
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint: `safe-ies-first-narrow-project-ies-export-boundary-job:${"d".repeat(40)}`,
    builderOutputReductionFingerprint:
      `safe-ies-first-narrow-project-ies-export-builder-output-reduction:${"e".repeat(40)}`,
    candidateOutputBundleBoundarySummaryFingerprint:
      `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"f".repeat(40)}`,
    projectIesExportBoundaryReadbackStatusSchemaId:
      "controlstack.runtime.ies-first-narrow-project-ies-export-boundary-readback-status.v1",
    projectIesExportBoundaryReadbackState: "ies_first_narrow_project_ies_export_boundary_readback_ready",
    projectIesExportBoundaryReadiness: "ready",
    projectIesExportBoundaryReadbackFingerprint:
      `safe-ies-first-narrow-project-ies-export-boundary-readback-status:${"1".repeat(40)}`,
    projectIesExportBoundaryContractId:
      "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-BOUNDARY-1",
    projectIesExportBoundarySummarySchemaId:
      "controlstack.runtime.ies-first-narrow-project-ies-export-boundary-summary.v1",
    projectIesExportBoundarySummaryState:
      "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    projectIesExportBoundarySummaryFingerprint:
      `safe-ies-first-narrow-project-ies-export-boundary-summary:${"2".repeat(40)}`,
    runLengthMm: 1200,
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 2,
    builderOutputRedactedPayloadMarkerCount: 3,
    projectIesExportBoundaryReadbackStatusSchemaVersion: 1,
    projectIesExportBoundarySummarySchemaVersion: 1,
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
    ...overrides,
  };
  delete base.iesFirstNarrowProjectIesExportResultReadbackFingerprint;
  if (recomputeFingerprint) {
    base.iesFirstNarrowProjectIesExportResultReadbackFingerprint = stableFingerprint(
      READBACK_FINGERPRINT_PREFIX,
      base,
    );
  } else if (overrides.iesFirstNarrowProjectIesExportResultReadbackFingerprint) {
    base.iesFirstNarrowProjectIesExportResultReadbackFingerprint =
      overrides.iesFirstNarrowProjectIesExportResultReadbackFingerprint;
  }
  return freeze ? Object.freeze(base) : base;
}

function selectedProjectDetail(status, {
  projectId = "selected-project",
  envelopeId = "env-selected-project",
  selectedProjectId = envelopeId,
} = {}) {
  const project = {
    projectId,
    envelopeId,
    iesFirstNarrowProjectIesExportResultReadbackStatus: status,
  };
  const summary = buildProjectBrowserProjectIesExportResultReadbackSummary([project]);
  return buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
    summary,
    selectedProjectId,
  );
}

function reviseDetail(detail, overrides = {}) {
  const base = { ...detail, ...overrides };
  delete base.projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint;
  return Object.freeze({
    ...base,
    projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint: stableFingerprint(
      DETAIL_FINGERPRINT_PREFIX,
      base,
    ),
  });
}

function assertScalarSafeBoundary(boundary) {
  assert.deepEqual(
    Object.keys(boundary),
    IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_FIELD_ORDER,
  );
  assert.equal(Object.isFrozen(boundary), true);
  assert.equal(boundary.schemaId, IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_ID);
  assert.equal(boundary.schemaVersion, IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_VERSION);
  assert.equal(boundary.contractId, IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_CONTRACT_ID);
  for (const [key, value] of Object.entries(boundary)) {
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      `${key} must remain scalar-safe`,
    );
  }
  for (const key of [
    "iesFirstNarrowProjectIesExportResultReadbackStatus",
    "readbackStatus",
    "projectEnvelope",
    "rawIes",
    "rawIesText",
    "candela",
    "candelaGrid",
    "governance",
    "filename",
    "fileName",
    "filePath",
    "base64",
    "blob",
    "downloadMetadata",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(boundary, key), false, key);
  }
}

test("resolver joins the landed selected-project detail to one exact saved-project readback getter call using envelopeId first", async () => {
  const status = readyReadbackStatus();
  const detail = selectedProjectDetail(status);
  const calls = [];
  const services = {
    savedProjects: {
      getIesFirstNarrowProjectIesExportResultReadbackStatus(projectIdOrEnvelopeId) {
        calls.push(projectIdOrEnvelopeId);
        return status;
      },
      getProjectEnvelope() {
        throw new Error("source boundary must never open a project envelope");
      },
    },
  };

  const boundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectIesExportResultReadbackDetailSummary: detail,
      },
    },
    services,
  });

  assertScalarSafeBoundary(boundary);
  assert.equal(boundary.state, IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.ready);
  assert.equal(boundary.readiness, "ready");
  assert.equal(boundary.ready, true);
  assert.equal(boundary.failClosed, false);
  assert.equal(boundary.blocker, null);
  assert.equal(boundary.selectedProjectId, "env-selected-project");
  assert.equal(boundary.projectId, "selected-project");
  assert.equal(boundary.envelopeId, "env-selected-project");
  assert.equal(boundary.lookupId, "env-selected-project");
  assert.equal(boundary.lookupIdKind, "envelopeId");
  assert.equal(boundary.sourceReadbackFingerprint, status.iesFirstNarrowProjectIesExportResultReadbackFingerprint);
  assert.equal(boundary.exactReadbackStatusRetainedInternally, true);
  assert.equal(boundary.savedProjectGetterCallCount, 1);
  assert.equal(boundary.projectEnvelopeGetterCalled, false);
  assert.equal(boundary.browserTriggerInvoked, false);
  assert.equal(boundary.routesAdded, false);
  assert.equal(boundary.postEndpointsAdded, false);
  assert.equal(boundary.runtimeDataMutated, false);
  assert.equal(boundary.filesystemWriteAttempted, false);
  assert.deepEqual(calls, ["env-selected-project"]);
  assert.equal(
    getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(boundary),
    status,
  );
  assert.equal(JSON.stringify(boundary).includes(status.summaryFingerprint), false);
});

test("resolver falls back to selectedProjectId only when envelopeId is unavailable", async () => {
  const status = readyReadbackStatus();
  const detail = reviseDetail(selectedProjectDetail(status), {
    selectedProjectId: "selected-project",
    envelopeId: null,
  });
  const calls = [];

  const boundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectIesExportResultReadbackDetailSummary: detail,
      },
    },
    services: {
      savedProjects: {
        getIesFirstNarrowProjectIesExportResultReadbackStatus(value) {
          calls.push(value);
          return status;
        },
      },
    },
  });

  assertScalarSafeBoundary(boundary);
  assert.equal(boundary.ready, true);
  assert.equal(boundary.lookupId, "selected-project");
  assert.equal(boundary.lookupIdKind, "selectedProjectId");
  assert.deepEqual(calls, ["selected-project"]);
});

test("resolver rejects missing or non-ready selected-project detail before calling saved projects", async () => {
  const status = readyReadbackStatus();
  const readyDetail = selectedProjectDetail(status);
  const notReadyDetail = reviseDetail(readyDetail, {
    state: "project_browser_selected_project_ies_export_result_readback_missing",
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: "project-browser-selected-project-not-selected",
    resultReadbackReady: false,
    resultReadbackFailClosed: true,
  });
  let calls = 0;
  const services = {
    savedProjects: {
      getIesFirstNarrowProjectIesExportResultReadbackStatus() {
        calls += 1;
        return status;
      },
    },
  };

  const missing = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({ services });
  const notReady = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectIesExportResultReadbackDetailSummary: notReadyDetail,
      },
    },
    services,
  });

  assertScalarSafeBoundary(missing);
  assert.equal(missing.state, IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.missing);
  assert.equal(missing.blocker, "selected-project-ies-export-result-detail-summary-missing");
  assert.equal(missing.savedProjectGetterCallCount, 0);

  assertScalarSafeBoundary(notReady);
  assert.equal(notReady.state, IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.missing);
  assert.equal(notReady.blocker, "selected-project-ies-export-result-detail-not-ready");
  assert.equal(notReady.savedProjectGetterCallCount, 0);
  assert.equal(calls, 0);
});

test("resolver calls the getter once then blocks mismatched readback fingerprints without retaining internal input", async () => {
  const sourceStatus = readyReadbackStatus();
  const detail = selectedProjectDetail(sourceStatus);
  const mismatchedStatus = readyReadbackStatus({
    reason: "different but otherwise safe readback",
  });
  let calls = 0;

  const boundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectIesExportResultReadbackDetailSummary: detail,
      },
    },
    services: {
      savedProjects: {
        getIesFirstNarrowProjectIesExportResultReadbackStatus() {
          calls += 1;
          return mismatchedStatus;
        },
      },
    },
  });

  assertScalarSafeBoundary(boundary);
  assert.equal(boundary.state, IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.blockedFailClosed);
  assert.equal(boundary.readiness, "blocked_fail_closed");
  assert.equal(boundary.ready, false);
  assert.equal(boundary.failClosed, true);
  assert.equal(boundary.blocker, "selected-project-ies-export-result-readback-fingerprint-mismatch");
  assert.equal(boundary.savedProjectGetterCallCount, 1);
  assert.equal(boundary.exactReadbackStatusRetainedInternally, false);
  assert.equal(calls, 1);
  assert.equal(
    getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(boundary),
    null,
  );
});

test("source-boundary wiring adds no envelope read, materialisation, browser trigger, route, persistence, or filesystem path", async () => {
  const [boundarySource, indexSource, viewModelSource] = await Promise.all([
    readFile(new URL(
      "../packages/modules/ies-builder/iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js",
      import.meta.url,
    ), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/index.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/iesBuilderViewModel.js", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(boundarySource, /getProjectEnvelope\s*\(/);
  assert.doesNotMatch(boundarySource, /materialiseRuntimeIes|materialiseProjectIesDownload|triggerIesFirstNarrowProjectIesExportBrowserDownload/);
  assert.doesNotMatch(boundarySource, /fetch\(|XMLHttpRequest|\/api\/|POST|node:fs|writeFile|RuntimeData|localStorage|sessionStorage/);
  assert.match(
    boundarySource,
    /services\?\.savedProjects\?\.getIesFirstNarrowProjectIesExportResultReadbackStatus/,
  );
  assert.match(indexSource, /resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary/);
  assert.doesNotMatch(indexSource, /materialiseProjectIesDownload|materialiseRuntimeIes|triggerIesBuilderProjectIesExportDownloadAction/);
  assert.match(viewModelSource, /project-ies-download-materialiser-capability-not-wired/);
});
