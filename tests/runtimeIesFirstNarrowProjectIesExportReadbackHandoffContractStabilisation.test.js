import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput,
  IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES,
  resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary,
} from "../packages/modules/ies-builder/iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js";
import {
  buildProjectBrowserProjectIesExportResultReadbackSummary,
  buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const RESULT_READBACK_FINGERPRINT_PREFIX =
  "safe-ies-first-narrow-project-ies-export-result-readback-status";

function readyBoundaryReadbackStatus() {
  const status = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
    state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    reason: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    summaryPresent: true,
    summarySchemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    summarySchemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    summaryContractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    summaryState: "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    summaryFingerprint: `safe-ies-first-narrow-project-ies-export-boundary-summary:${"a".repeat(40)}`,
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    exportBoundaryOnly: true,
    projectIesExportBoundaryOnly: true,
    bundleBoundaryOnly: true,
    builderCallBoundaryOnly: true,
    productionProof: false,
    labProofAuthority: false,
    approvedReferenceGatePassed: true,
    resolvedRunLengthGatePassed: true,
    fingerprintAlignmentGatePassed: true,
    builderBoundaryCallAllowed: true,
    builderBoundaryCallAttempted: true,
    builderBoundaryCallSucceeded: true,
    builderOutputReduced: true,
    approvedReferenceReady: true,
    projectIesExportApproved: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    bundleBoundaryReady: true,
    opaqueBundleBoundaryRef:
      `safe-ies-first-narrow-candidate-output-bundle-boundary:${"b".repeat(40)}`,
    opaqueProjectIesExportBoundaryRef:
      `safe-ies-first-narrow-project-ies-export-boundary:${"c".repeat(40)}`,
    runLengthMm: 1200,
    builderOutputKind: "project-ies-lm63",
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 2,
    builderOutputRedactedPayloadMarkerCount: 3,
    policyFingerprint: "safe-policy:readback-handoff-contract-stabilisation",
    sourceFingerprint: "safe-source:readback-handoff-contract-stabilisation",
    sourceInputFingerprint: "safe-source-input:readback-handoff-contract-stabilisation",
    boardDataSourceVersion: "safe-board-data-source-version:readback-handoff-contract-stabilisation",
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint: `safe-ies-first-narrow-project-ies-export-boundary-job:${"d".repeat(40)}`,
    builderOutputReductionFingerprint:
      `safe-ies-first-narrow-project-ies-export-builder-output-reduction:${"e".repeat(40)}`,
    candidateOutputBundleBoundarySummaryFingerprint:
      `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"f".repeat(40)}`,
    ...Object.fromEntries(
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS
        .map((key) => [key, false]),
    ),
  };
  status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
    status,
  );
  return status;
}

function readyResultReadbackStatus() {
  const summary = buildRuntimeIesFirstNarrowProjectIesExportResultSummary({
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: readyBoundaryReadbackStatus(),
  });
  return buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummary: summary,
        },
      },
    },
  });
}

function selectedProjectDetail(status) {
  const summary = buildProjectBrowserProjectIesExportResultReadbackSummary([{
    projectId: "contract-lock-project",
    envelopeId: "contract-lock-envelope",
    iesFirstNarrowProjectIesExportResultReadbackStatus: status,
  }]);
  return buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
    summary,
    "contract-lock-envelope",
  );
}

function reorderedFrozenObject(value, movedKey) {
  const entries = Object.entries(value);
  const moved = entries.find(([key]) => key === movedKey);
  assert.ok(moved);
  return Object.freeze(Object.fromEntries([
    ...entries.filter(([key]) => key !== movedKey),
    moved,
  ]));
}

function assertNoPublicPayloadLeak(value, path = "value") {
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    assert.equal([
      "projectIesText",
      "rawIes",
      "rawIesText",
      "candela",
      "candelaGrid",
      "governance",
      "governancePayload",
      "filename",
      "fileName",
      "filePath",
      "base64",
      "blob",
      "objectUrl",
    ].includes(key), false, `${path}.${key}`);
    assertNoPublicPayloadLeak(nested, `${path}.${key}`);
  }
  const text = JSON.stringify(value);
  for (const marker of ["IESNA:", "TILT=", "LM-63", "data:"]) {
    assert.equal(text.includes(marker), false, marker);
  }
}

test("exports frozen exact field-order contracts for ready, missing, and blocked result readback handoff shapes", () => {
  const readyStatus = readyResultReadbackStatus();
  const missingStatus = buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({});
  const blockedStatus = buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummary: { schemaId: "unsafe-shape" },
        },
      },
    },
  });

  assert.equal(
    Object.isFrozen(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER),
    true,
  );
  for (const status of [readyStatus, missingStatus, blockedStatus]) {
    assert.equal(Object.isFrozen(status), true);
    assert.deepEqual(
      Object.keys(status),
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER,
    );
    const fingerprintSource = { ...status };
    delete fingerprintSource.iesFirstNarrowProjectIesExportResultReadbackFingerprint;
    assert.equal(
      status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
      stableFingerprint(RESULT_READBACK_FINGERPRINT_PREFIX, fingerprintSource),
    );
    assertNoPublicPayloadLeak(status);
  }

  const readyDetail = selectedProjectDetail(readyStatus);
  const missingDetail = buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary({}, null);
  const blockedDetail = buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary({
    projectStatuses: [],
    rawIes: "IESNA:LM-63-2019",
  }, "contract-lock-envelope");

  assert.equal(
    Object.isFrozen(
      PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER,
    ),
    true,
  );
  for (const detail of [readyDetail, missingDetail, blockedDetail]) {
    assert.equal(Object.isFrozen(detail), true);
    assert.deepEqual(
      Object.keys(detail),
      PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER,
    );
    assertNoPublicPayloadLeak(detail);
  }
});

test("selected-project source boundary accepts only the canonical exact retained readback status shape", async () => {
  const status = readyResultReadbackStatus();
  const detail = selectedProjectDetail(status);
  const variants = [
    Object.freeze(Object.fromEntries(
      Object.entries(status).filter(([key]) => key !== "summaryPresent"),
    )),
    Object.freeze({ ...status, unexpectedContractField: false }),
    reorderedFrozenObject(status, "summaryPresent"),
  ];

  for (const driftedStatus of variants) {
    const boundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
      context: {
        projectBrowser: {
          selectedProjectIesExportResultReadbackDetailSummary: detail,
        },
      },
      services: {
        savedProjects: {
          getIesFirstNarrowProjectIesExportResultReadbackStatus() {
            return driftedStatus;
          },
        },
      },
    });

    assert.equal(
      boundary.state,
      IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.blockedFailClosed,
    );
    assert.equal(
      boundary.blocker,
      "selected-project-ies-export-result-readback-status-shape-invalid",
    );
    assert.equal(boundary.ready, false);
    assert.equal(boundary.failClosed, true);
    assert.equal(boundary.savedProjectGetterCallCount, 1);
    assert.equal(boundary.filesystemWriteAttempted, false);
    assert.equal(boundary.runtimeDataMutated, false);
    assert.equal(
      getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(boundary),
      null,
    );
    assertNoPublicPayloadLeak(boundary);
  }
});

test("canonical handoff remains shape-compatible and fingerprint-compatible without invoking materialisation", async () => {
  const status = readyResultReadbackStatus();
  const detail = selectedProjectDetail(status);
  const boundary = await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectIesExportResultReadbackDetailSummary: detail,
      },
    },
    services: {
      savedProjects: {
        getIesFirstNarrowProjectIesExportResultReadbackStatus() {
          return status;
        },
      },
    },
  });

  assert.equal(
    boundary.state,
    IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.ready,
  );
  assert.equal(boundary.ready, true);
  assert.equal(
    boundary.sourceDetailFingerprint,
    detail.projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint,
  );
  assert.equal(
    boundary.sourceReadbackFingerprint,
    status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
  );
  assert.equal(
    getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(boundary),
    status,
  );
  assert.equal(boundary.projectEnvelopeGetterCalled, false);
  assert.equal(boundary.browserTriggerInvoked, false);
  assert.equal(boundary.filesystemWriteAttempted, false);
  assert.equal(boundary.runtimeDataMutated, false);
  assertNoPublicPayloadLeak(boundary);
});

test("source boundary consumes exported contracts and no longer owns duplicated detail field-order knowledge", async () => {
  const source = await readFile(
    new URL(
      "../packages/modules/ies-builder/iesBuilderSelectedProjectIesExportDownloadSourceBoundary.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.equal(source.includes("const SELECTED_PROJECT_DETAIL_FIELD_ORDER"), false);
  assert.equal(
    source.includes(
      "PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER",
    ),
    true,
  );
  assert.equal(
    source.includes(
      "RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER",
    ),
    true,
  );
});
