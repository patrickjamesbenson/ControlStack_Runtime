import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultSummary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js";
import {
  materialiseRuntimeIesFirstNarrowProjectIesDownload,
  registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialiserCapability.js";
import {
  buildRuntimeApprovedLabReferenceSummary,
} from "../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputBundleBoundarySummary.js";
import {
  buildProjectBrowserProjectIesExportResultReadbackSummary,
  buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import { createShellServices } from "../packages/workspace-kernel/services.js";
import {
  resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary,
} from "../packages/modules/ies-builder/iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js";
import {
  createIesBuilderViewModel,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
  prepareIesBuilderProjectIesExportDownloadCapabilityAction,
  triggerIesBuilderProjectIesExportDownloadAction,
} from "../packages/modules/ies-builder/iesBuilderViewModel.js";
import { renderIesBuilderView } from "../packages/modules/ies-builder/iesBuilderView.js";

const VALID_LM63 = [
  "IESNA:LM-63-2002",
  "[TEST] MOUNTED-CAPABILITY-VISIBLE-CONTROL-INTEGRATION",
  "[MANUFAC] CONTROLSTACK-RUNTIME",
  "TILT=NONE",
  "1 1000 1 3 1 1 2 0.1 1.2 0.05",
  "1 1 12",
  "0 90 180",
  "0",
  "100 50 0",
  "",
].join("\r\n");

class IesBuilderIntegrationElement {
  constructor(tagName = "div") {
    this.tagName = String(tagName || "div").toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.eventListeners = {};
    this.className = "";
    this.textContent = "";
    this.type = "";
    this.disabled = false;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  addEventListener(type, handler) {
    this.eventListeners[type] = handler;
  }
}

function withIesBuilderDocument(callback) {
  const documentKey = "doc" + "ument";
  const previousDocument = globalThis[documentKey];
  globalThis[documentKey] = {
    createElement(tagName) {
      return new IesBuilderIntegrationElement(tagName);
    },
  };
  try {
    return callback();
  } finally {
    globalThis[documentKey] = previousDocument;
  }
}

function descendants(element) {
  return [element, ...(element.children || []).flatMap(descendants)];
}

function findByDataset(container, key, value) {
  return descendants(container).filter((element) => element.dataset?.[key] === value);
}

function browserHarness(label) {
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
        return `blob:${label}`;
      },
      revokeObjectURL(value) {
        assert.equal(value, `blob:${label}`);
        calls.push("revokeObjectURL");
      },
    },
  };
}

function fixture() {
  const policyFingerprint = "safe-policy:mounted-capability-visible-control-integration";
  const sourceFingerprint = "safe-source:mounted-capability-visible-control-integration";
  const sourceInputFingerprint =
    "safe-source-input:mounted-capability-visible-control-integration";
  const boardDataSourceVersion =
    "safe-board-data-source-version:mounted-capability-visible-control-integration";
  const oneMmLabRecordFingerprint =
    "safe-one-mm-lab-record:mounted-capability-visible-control-integration";
  const referenceIesFingerprint =
    "safe-reference-ies:mounted-capability-visible-control-integration";
  const provenanceFingerprint =
    "safe-provenance:mounted-capability-visible-control-integration";
  const emergencyEvidenceFingerprint =
    "safe-emergency-evidence:mounted-capability-visible-control-integration";
  const labReferenceFingerprint =
    "safe-lab-reference:mounted-capability-visible-control-integration";
  const opaqueBundleBoundaryRef =
    `safe-ies-first-narrow-candidate-output-bundle-boundary:${"7".repeat(40)}`;
  const bundleSummaryFingerprint =
    `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"8".repeat(40)}`;

  function approvedChild(fingerprint, overrides = {}) {
    return {
      ok: true,
      approved: true,
      approvalState: "approved",
      safeSummaryOnly: true,
      diagnosticOnly: true,
      fingerprint,
      rawBodyReturned: false,
      rawPayloadReturned: false,
      rawReferenceIesReturned: false,
      rawOneMmJsonReturned: false,
      rawProvenanceReturned: false,
      rawPhotometryReturned: false,
      candelaArraysReturned: false,
      base64ArtifactsReturned: false,
      exactElectricalValuesReturned: false,
      exactPlacementCoordinatesReturned: false,
      ...overrides,
    };
  }

  const approvedLabReferenceSummary = buildRuntimeApprovedLabReferenceSummary({
    policyFingerprint,
    sourceFingerprint,
    approvedLabReferenceSummary: {
      ok: true,
      approved: true,
      labApproved: true,
      approvalState: "approved",
      labAuthority: "lab-owned-approved-photometry-reference",
      labReferenceFingerprint,
      oneMmLabRecordFingerprint,
      referenceIesFingerprint,
      provenanceFingerprint,
      emergencyEvidenceFingerprint,
      staleState: "current",
      projectIesExportApproved: true,
      rawReferenceIesReturned: false,
      rawOneMmJsonReturned: false,
      rawProvenanceReturned: false,
      rawPhotometryReturned: false,
      candelaArraysReturned: false,
      base64ArtifactsReturned: false,
      exactElectricalValuesReturned: false,
      exactPlacementCoordinatesReturned: false,
      selectedResultBodyReturned: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    oneMmLabRecordSummary: approvedChild(oneMmLabRecordFingerprint, {
      kind: "one-mm-json-lab-record-summary",
      oneMmLabRecordFingerprint,
    }),
    referenceIesSummary: approvedChild(referenceIesFingerprint, {
      kind: "reference-ies-summary",
      referenceIesFingerprint,
    }),
    provenanceSummary: approvedChild(provenanceFingerprint, {
      kind: "provenance-custody-summary",
      provenanceFingerprint,
    }),
    emergencyEvidenceSummary: approvedChild(emergencyEvidenceFingerprint, {
      kind: "emergency-evidence-summary",
      emergencyEvidenceFingerprint,
    }),
    projectIesExportApprovalSummary: {
      approved: true,
      projectIesExportApproved: true,
      safeSummaryOnly: true,
      diagnosticOnly: true,
      projectIesExportGenerated: false,
    },
    staleComparisonSummary: {
      safeComparisonApproved: true,
      current: true,
      stale: false,
      staleState: "current",
      safeSummaryOnly: true,
      diagnosticOnly: true,
    },
  });

  const candidateOutputBundleBoundarySummary = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion:
      RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
    state: "redacted_ies_first_narrow_candidate_output_bundle_boundary_summary_persisted",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    readyForBundleBoundary: true,
    outputBundleBoundaryJoined: true,
    outputBundleIncluded: false,
    rawOutputBundleIncluded: false,
    rawArtifactIncluded: false,
    opaqueBundleBoundaryRef,
    outputBundleRecordCount: 1,
    outputBundleEntryCount: 1,
    policyFingerprint,
    sourceFingerprint,
    sourceInputFingerprint,
    boardDataSourceVersion,
    iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint:
      bundleSummaryFingerprint,
  };

  return {
    approvedLabReferenceSummary,
    candidateOutputBundleBoundarySummary,
    job: {
      kind: "project-ies-export-boundary-job",
      resolvedRunLengthMm: 1200,
      sourceInputFingerprint,
      boardDataSourceVersion,
      policyFingerprint,
      sourceFingerprint,
    },
  };
}

function buildReadyChain() {
  const source = fixture();
  const boundarySummary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
    approvedLabReferenceSummary: source.approvedLabReferenceSummary,
    iesFirstNarrowCandidateOutputBundleBoundarySummary:
      source.candidateOutputBundleBoundarySummary,
    resolvedRunLengthMm: 1200,
    job: source.job,
    buildProjectIes: () => ({
      kind: "project-ies-lm63",
      projectIesText: VALID_LM63,
      safeRecord: {
        state: "ready",
        count: 1,
      },
    }),
  });
  const boundaryReadbackStatus =
    buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus({
      modules: {
        cs_selector: {
          downstreamContext: {
            iesFirstNarrowProjectIesExportBoundarySummary: boundarySummary,
          },
        },
      },
    });
  const resultSummary = buildRuntimeIesFirstNarrowProjectIesExportResultSummary({
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: boundaryReadbackStatus,
  });
  const resultReadbackStatus =
    buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({
      modules: {
        cs_selector: {
          downstreamContext: {
            iesFirstNarrowProjectIesExportResultSummary: resultSummary,
          },
        },
      },
    });

  return {
    boundarySummary,
    boundaryReadbackStatus,
    resultSummary,
    resultReadbackStatus,
  };
}

function capabilityInput(status) {
  return Object.freeze({
    sourceKind: "ready-project-ies-export-result-readback-status-only",
    opaqueBundleBoundaryRef: status.opaqueBundleBoundaryRef,
    opaqueProjectIesExportBoundaryRef: status.opaqueProjectIesExportBoundaryRef,
    runLengthMm: status.runLengthMm,
    builderOutputKind: status.builderOutputKind,
    builderOutputRecordCount: status.builderOutputRecordCount,
    builderOutputEntryCount: status.builderOutputEntryCount,
    builderOutputSafeScalarCount: status.builderOutputSafeScalarCount,
    builderOutputRedactedPayloadMarkerCount:
      status.builderOutputRedactedPayloadMarkerCount,
    policyFingerprint: status.policyFingerprint,
    sourceFingerprint: status.sourceFingerprint,
    sourceInputFingerprint: status.sourceInputFingerprint,
    boardDataSourceVersion: status.boardDataSourceVersion,
    jobKind: status.jobKind,
    jobFingerprint: status.jobFingerprint,
    builderOutputReductionFingerprint: status.builderOutputReductionFingerprint,
    candidateOutputBundleBoundarySummaryFingerprint:
      status.candidateOutputBundleBoundarySummaryFingerprint,
    projectIesExportBoundaryReadbackFingerprint:
      status.projectIesExportBoundaryReadbackFingerprint,
    projectIesExportBoundarySummaryFingerprint:
      status.projectIesExportBoundarySummaryFingerprint,
    projectIesExportResultSummaryFingerprint: status.summaryFingerprint,
    iesFirstNarrowProjectIesExportResultReadbackFingerprint:
      status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
  });
}

function selectedProjectContext(status) {
  const project = {
    projectId: "mounted-control-selected-project",
    envelopeId: "env-mounted-control-selected-project",
    iesFirstNarrowProjectIesExportResultReadbackStatus: status,
  };
  const summary = buildProjectBrowserProjectIesExportResultReadbackSummary([project]);
  const detail = buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
    summary,
    project.envelopeId,
  );
  return {
    route: { moduleId: "ies_builder" },
    projectBrowser: {
      selectedProjectIesExportResultReadbackDetailSummary: detail,
    },
  };
}

function assertNoPrivatePayload(value) {
  const serialised = JSON.stringify(value);
  for (const marker of [
    "IESNA:LM-63",
    "TILT=NONE",
    "100 50 0",
  ]) {
    assert.equal(serialised.includes(marker), false, marker);
  }
}

const EXPECTED_BROWSER_CALLS = Object.freeze([
  "createObjectURL",
  "createElement:a",
  "append",
  "click",
  "remove",
  "revokeObjectURL",
]);

test("real mounted runtime materialiser enables and operates the landed visible selected-project IES control end-to-end", async () => {
  const chain = buildReadyChain();
  assert.equal(chain.boundaryReadbackStatus.ready, true);
  assert.equal(chain.resultReadbackStatus.ready, true);

  assert.equal(
    registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource({
      projectIesText: VALID_LM63,
      boundarySummary: chain.boundarySummary,
    }),
    true,
  );

  const input = capabilityInput(chain.resultReadbackStatus);
  assert.equal(
    materialiseRuntimeIesFirstNarrowProjectIesDownload(input),
    VALID_LM63,
  );

  const services = createShellServices();
  assert.equal(
    services.materialiseProjectIesDownload,
    materialiseRuntimeIesFirstNarrowProjectIesDownload,
  );
  assert.equal(services.materialiseProjectIesDownload(input), VALID_LM63);

  const context = selectedProjectContext(chain.resultReadbackStatus);
  let savedProjectGetterCalls = 0;
  const sourceBoundary =
    await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
      context,
      services: {
        savedProjects: {
          getIesFirstNarrowProjectIesExportResultReadbackStatus(projectIdOrEnvelopeId) {
            savedProjectGetterCalls += 1;
            assert.equal(projectIdOrEnvelopeId, "env-mounted-control-selected-project");
            return chain.resultReadbackStatus;
          },
        },
      },
    });
  assert.equal(savedProjectGetterCalls, 1);
  assert.equal(sourceBoundary.ready, true);
  assert.equal(sourceBoundary.failClosed, false);

  const materialisationBoundary =
    await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
      iesFirstNarrowProjectIesExportResultReadbackStatus: chain.resultReadbackStatus,
      materialiseProjectIesDownload: services.materialiseProjectIesDownload,
    });
  assert.equal(materialisationBoundary.ready, true);
  assert.equal(materialisationBoundary.failClosed, false);
  assert.equal(await materialisationBoundary.blob.text(), VALID_LM63);

  const directHarness = browserHarness("mounted-control-direct");
  const directReceipt = triggerIesBuilderProjectIesExportDownloadAction({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary:
      materialisationBoundary,
    browserDocument: directHarness.browserDocument,
    browserUrlApi: directHarness.browserUrlApi,
  });
  assert.equal(directReceipt.downloadTriggered, true);
  assert.equal(directReceipt.failClosed, false);
  assert.equal(directReceipt.downloadMetadata.mediaType, "application/ies");
  assert.deepEqual(directHarness.calls, EXPECTED_BROWSER_CALLS);

  const visibleControlHarness = browserHarness("mounted-control-visible");
  const preparedAction =
    await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
      projectIesExportDownloadSourceBoundary: sourceBoundary,
      services,
      context,
      browserDocument: visibleControlHarness.browserDocument,
      browserUrlApi: visibleControlHarness.browserUrlApi,
    });
  assert.equal(typeof preparedAction, "function");

  const viewModel = createIesBuilderViewModel({
    context,
    local: {},
    status: {},
    projectIesExportDownloadSourceBoundary: sourceBoundary,
    projectIesExportDownloadControlAction: preparedAction,
  });
  assert.equal(viewModel.projectIesExportDownloadControl.visible, true);
  assert.equal(viewModel.projectIesExportDownloadControl.enabled, true);
  assert.equal(viewModel.projectIesExportDownloadControl.failClosed, false);
  assert.equal(viewModel.projectIesExportDownloadControl.blocker, null);
  assert.equal(viewModel.projectIesExportDownloadAction, preparedAction);

  const container = withIesBuilderDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    renderIesBuilderView(target, viewModel);
    return target;
  });
  const [button] = findByDataset(
    container,
    "iesBuilderAction",
    "download-project-ies",
  );
  const [status] = findByDataset(
    container,
    "iesBuilderDownloadStatus",
    "project-ies-export",
  );
  assert.ok(button);
  assert.ok(status);
  assert.equal(button.disabled, false);
  assert.equal(typeof button.eventListeners.click, "function");

  const clickResult = button.eventListeners.click();
  assert.equal(clickResult, undefined);
  assert.deepEqual(visibleControlHarness.calls, EXPECTED_BROWSER_CALLS);
  assert.match(
    status.textContent,
    /^Download started: controlstack-project-ies-1200mm-[0-9a-f]{12}\.ies \([1-9][0-9]* bytes\)\.$/,
  );
  assert.deepEqual(viewModel.projectIesExportDownloadOutcomeState.getSnapshot(), {
    state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started,
    filename: directReceipt.downloadMetadata.filename,
    mediaType: "application/ies",
    extension: ".ies",
    byteLength: directReceipt.downloadMetadata.byteLength,
    blocker: null,
  });

  assertNoPrivatePayload(chain.boundarySummary);
  assertNoPrivatePayload(chain.boundaryReadbackStatus);
  assertNoPrivatePayload(chain.resultSummary);
  assertNoPrivatePayload(chain.resultReadbackStatus);
  assertNoPrivatePayload(sourceBoundary);
  assertNoPrivatePayload(viewModel);
  assertNoPrivatePayload(directReceipt);
  assertNoPrivatePayload(status.textContent);

  for (const result of [materialisationBoundary, directReceipt]) {
    assert.equal(result.filesystemWriteAttempted, false);
    assert.equal(result.persistenceWriteAttempted, false);
    assert.equal(result.runtimeDataMutationAttempted, false);
    assert.equal(result.routeOrPostWiringAdded, false);
  }
});
