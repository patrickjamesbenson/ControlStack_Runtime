import test from "node:test";
import assert from "node:assert/strict";

import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultSummary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js";
import {
  materialiseRuntimeIesFirstNarrowProjectIesDownload,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialiserCapability.js";
import {
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
} from "../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputBundleBoundarySummary.js";
import {
  buildProjectBrowserProjectIesExportBoundaryReadbackSummary,
  buildProjectBrowserProjectIesExportResultReadbackSummary,
  buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary,
  buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";
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
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES,
  triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload,
} from "../packages/modules/ies-builder/iesFirstNarrowProjectIesExportBrowserDownloadTrigger.js";
import {
  createIesBuilderProjectIesExportDownloadControl,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_CONTRACT_ID,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_FIELD_ORDER,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_ID,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_VERSION,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES,
  prepareIesBuilderProjectIesExportDownloadCapabilityAction,
} from "../packages/modules/ies-builder/iesBuilderViewModel.js";

const PROJECT_ID = "cross-layer-contract-lock-project";
const ENVELOPE_ID = "cross-layer-contract-lock-envelope";
const VALID_LM63 = [
  "IESNA:LM-63-2002",
  "[TEST] CROSS-LAYER-CONTRACT-LOCK",
  "[MANUFAC] CONTROLSTACK-RUNTIME",
  "TILT=NONE",
  "1 1000 1 3 1 1 2 0.1 1.2 0.05",
  "1 1 12",
  "0 90 180",
  "0",
  "100 50 0",
  "",
].join("\r\n");

const FIELD_ORDER_FINGERPRINTS = Object.freeze({
  boundarySummary: "field-order:596d96be16a2c4d706fa78ddfece335cc8b170a1",
  boundaryReadback: "field-order:1ec50aa33a87f003af7baf392a71aab22800d6fe",
  resultSummary: "field-order:6a4454c24d11e8718257d9b4db513ed128ab724f",
  resultReadback: "field-order:421156e6de0fafa6c379cf17dc22f915e0dfe793",
  boundaryBrowserAggregate: "field-order:33482959f3c09829a7eb1c02c785b24d44c8cfa6",
  boundaryBrowserDetail: "field-order:ff5ceb0e5698998f2180740a1b19a69be5298112",
  resultBrowserAggregate: "field-order:2e6f9248d5a7072488cf4108ede5b273131b99bc",
  resultBrowserDetail: "field-order:b9a732b19cbd39711cfce256ceedbbe283c424ed",
  sourceBoundary: "field-order:3feff2f1f9a3d7e85ffe938674a9f606dd64af03",
  materialisationBoundary: "field-order:0d53758594d6e0254dd450d45d70fabd7af8dfc5",
  browserTrigger: "field-order:0eb1d0b9d497793bbff6780aa5123b8e4332b96a",
  visibleControl: "field-order:df31971a9f61e2594062ae2596f60deff8cf7ee0",
});

const FALSE_FLAG_FINGERPRINTS = Object.freeze({
  boundary: "false-flags:82360ed46a2703df2da3eedf6e833d130a8447be",
  result: "false-flags:f93b80d57f871748da55c37dafdb3f8074372367",
});

const PROHIBITED_WIDENING_FLAGS = Object.freeze([
  "filesystemWriteAttempted",
  "persistenceWriteAttempted",
  "runtimeDataMutationAttempted",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "routeOrPostWiringAdded",
  "routesAdded",
  "postEndpointsAdded",
  "governancePayloadReturned",
  "governanceReturned",
  "mutationLogReturned",
  "productionProof",
  "labProofAuthority",
  "directLabTransformCalled",
  "webhookEnabled",
  "webhookPosted",
  "shellUiMutated",
  "projectIesFileOutputEnabled",
  "projectIesFileOutputAttempted",
  "projectIesFileOutputWritten",
  "projectIesExportResultFileOutputEnabled",
  "projectIesExportResultFileOutputAttempted",
  "projectIesExportResultFileOutputWritten",
]);

function approvedLabReferenceSummary() {
  return Object.freeze({
    schemaId: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
    state: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
    ok: true,
    approvedLabReferenceSummaryReady: true,
    projectIesExportEligible: true,
    approvedLabReferenceFingerprint: "safe-lab-reference:cross-layer-contract-lock",
    referenceIesFingerprint: "safe-reference-ies:cross-layer-contract-lock",
    oneMmLabRecordFingerprint: "safe-one-mm-record:cross-layer-contract-lock",
    provenanceFingerprint: "safe-provenance:cross-layer-contract-lock",
    emergencyEvidenceFingerprint: "safe-emergency-evidence:cross-layer-contract-lock",
    policyFingerprint: "safe-policy:cross-layer-contract-lock",
    sourceFingerprint: "safe-source:cross-layer-contract-lock",
    projectIesExportSummary: Object.freeze({
      projectIesExportApproved: true,
      projectIesExportGenerated: false,
      rawProjectIesReturned: false,
    }),
  });
}

function candidateOutputBundleBoundarySummary() {
  return Object.freeze({
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
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
    opaqueBundleBoundaryRef:
      `safe-ies-first-narrow-candidate-output-bundle-boundary:${"4".repeat(40)}`,
    outputBundleRecordCount: 1,
    outputBundleEntryCount: 1,
    policyFingerprint: "safe-policy:cross-layer-contract-lock",
    sourceFingerprint: "safe-source:cross-layer-contract-lock",
    sourceInputFingerprint: "safe-source-input:cross-layer-contract-lock",
    boardDataSourceVersion: "safe-board-data-source-version:cross-layer-contract-lock",
    iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint:
      `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"5".repeat(40)}`,
  });
}

function boundaryInput() {
  return {
    approvedLabReferenceSummary: approvedLabReferenceSummary(),
    iesFirstNarrowCandidateOutputBundleBoundarySummary:
      candidateOutputBundleBoundarySummary(),
    resolvedRunLengthMm: 1200,
    job: Object.freeze({
      kind: "project-ies-export-boundary-job",
      resolvedRunLengthMm: 1200,
      sourceInputFingerprint: "safe-source-input:cross-layer-contract-lock",
      boardDataSourceVersion: "safe-board-data-source-version:cross-layer-contract-lock",
      policyFingerprint: "safe-policy:cross-layer-contract-lock",
      sourceFingerprint: "safe-source:cross-layer-contract-lock",
    }),
    buildProjectIes() {
      return {
        kind: "project-ies-lm63",
        projectIesText: VALID_LM63,
        safeRecord: {
          state: "ready",
          count: 1,
        },
      };
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
        return "blob:cross-layer-contract-lock";
      },
      revokeObjectURL(value) {
        assert.equal(value, "blob:cross-layer-contract-lock");
        calls.push("revokeObjectURL");
      },
    },
  };
}

function reorderFrozen(value, movedKey) {
  const entries = Object.entries(value);
  const moved = entries.find(([key]) => key === movedKey);
  assert.ok(moved, movedKey);
  return Object.freeze(Object.fromEntries([
    ...entries.filter(([key]) => key !== movedKey),
    moved,
  ]));
}

function replaceFrozen(value, replacements) {
  return Object.freeze({ ...value, ...replacements });
}

function assertFieldOrder(value, expectedFingerprint, label) {
  assert.equal(
    stableFingerprint("field-order", Object.keys(value)),
    expectedFingerprint,
    label,
  );
}

function assertOrderedFingerprint(value, field, prefix, fieldOrder = Object.keys(value)) {
  const fingerprintSource = Object.fromEntries(
    fieldOrder
      .filter((key) => key !== field)
      .map((key) => [key, value[key]]),
  );
  assert.equal(value[field], stableFingerprint(prefix, fingerprintSource), field);
}

function assertScalarTree(value, path = "surface") {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return;
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertScalarTree(entry, `${path}[${index}]`));
    return;
  }
  assert.equal(
    value !== null && typeof value === "object" && !(value instanceof Blob),
    true,
    path,
  );
  for (const [key, nested] of Object.entries(value)) {
    assertScalarTree(nested, `${path}.${key}`);
  }
}

function assertNoRawLm63(value, path = "surface") {
  const serialised = JSON.stringify(value);
  for (const marker of ["IESNA:LM-63", "IES:LM-63", "TILT=NONE", "100 50 0"]) {
    assert.equal(serialised.includes(marker), false, `${path}:${marker}`);
  }
}

function assertNoWidening(value, path = "surface", seen = new Set()) {
  if (value === null || typeof value !== "object" || seen.has(value)) return;
  seen.add(value);
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertNoWidening(entry, `${path}[${index}]`, seen));
    return;
  }
  for (const [key, nested] of Object.entries(value)) {
    if (PROHIBITED_WIDENING_FLAGS.includes(key)) {
      assert.equal(nested, false, `${path}.${key}`);
    }
    assertNoWidening(nested, `${path}.${key}`, seen);
  }
}

async function buildReadyChain() {
  const boundarySummary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary(
    boundaryInput(),
  );
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
  const project = Object.freeze({
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: boundaryReadbackStatus,
    iesFirstNarrowProjectIesExportResultReadbackStatus: resultReadbackStatus,
  });
  const boundaryBrowserAggregate =
    buildProjectBrowserProjectIesExportBoundaryReadbackSummary([project]);
  const boundaryBrowserDetail =
    buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
      boundaryBrowserAggregate,
      ENVELOPE_ID,
    );
  const resultBrowserAggregate =
    buildProjectBrowserProjectIesExportResultReadbackSummary([project]);
  const resultBrowserDetail =
    buildProjectBrowserSelectedProjectIesExportResultReadbackDetailSummary(
      resultBrowserAggregate,
      ENVELOPE_ID,
    );
  const sourceBoundary =
    await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
      context: {
        projectBrowser: {
          selectedProjectIesExportResultReadbackDetailSummary: resultBrowserDetail,
        },
      },
      services: {
        savedProjects: {
          getIesFirstNarrowProjectIesExportResultReadbackStatus(lookupId) {
            assert.equal(lookupId, ENVELOPE_ID);
            return resultReadbackStatus;
          },
        },
      },
    });
  const materialisationBoundary =
    await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
      iesFirstNarrowProjectIesExportResultReadbackStatus: resultReadbackStatus,
      materialiseProjectIesDownload:
        materialiseRuntimeIesFirstNarrowProjectIesDownload,
    });
  const directHarness = browserHarness();
  const triggerReceipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary:
      materialisationBoundary,
    browserDocument: directHarness.browserDocument,
    browserUrlApi: directHarness.browserUrlApi,
  });
  const preparedHarness = browserHarness();
  const preparedAction =
    await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
      projectIesExportDownloadSourceBoundary: sourceBoundary,
      services: {
        materialiseProjectIesDownload:
          materialiseRuntimeIesFirstNarrowProjectIesDownload,
      },
      browserDocument: preparedHarness.browserDocument,
      browserUrlApi: preparedHarness.browserUrlApi,
    });
  const visibleControl = createIesBuilderProjectIesExportDownloadControl(preparedAction);
  const preparedReceipt = preparedAction();

  return {
    boundarySummary,
    boundaryReadbackStatus,
    resultSummary,
    resultReadbackStatus,
    boundaryBrowserAggregate,
    boundaryBrowserDetail,
    resultBrowserAggregate,
    resultBrowserDetail,
    sourceBoundary,
    materialisationBoundary,
    triggerReceipt,
    preparedReceipt,
    visibleControl,
    directHarness,
    preparedHarness,
  };
}

test("project IES export cross-layer contracts compose without drift and fail closed on tampering", async (t) => {
  const chain = await buildReadyChain();

  await t.test("locks exact identities, field orders, and deterministic fingerprints", async () => {
    assert.deepEqual({
      schemaId: chain.boundarySummary.schemaId,
      schemaVersion: chain.boundarySummary.schemaVersion,
      contractId: chain.boundarySummary.contractId,
      state: chain.boundarySummary.state,
    }, {
      schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
      schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
      contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
      state: "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    });
    assert.deepEqual({
      schemaId: chain.boundaryReadbackStatus.schemaId,
      schemaVersion: chain.boundaryReadbackStatus.schemaVersion,
      state: chain.boundaryReadbackStatus.state,
    }, {
      schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
      schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
      state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    });
    assert.deepEqual({
      schemaId: chain.resultSummary.schemaId,
      schemaVersion: chain.resultSummary.schemaVersion,
      contractId: chain.resultSummary.contractId,
      state: chain.resultSummary.state,
    }, {
      schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
      schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
      contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
      state: "redacted_ies_first_narrow_project_ies_export_result_summary_persisted",
    });
    assert.deepEqual({
      schemaId: chain.resultReadbackStatus.schemaId,
      schemaVersion: chain.resultReadbackStatus.schemaVersion,
      state: chain.resultReadbackStatus.state,
    }, {
      schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
      schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
      state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.ready,
    });
    assert.deepEqual({
      boundaryAggregate: [
        chain.boundaryBrowserAggregate.schemaId,
        chain.boundaryBrowserAggregate.schemaVersion,
        chain.boundaryBrowserAggregate.state,
      ],
      boundaryDetail: [
        chain.boundaryBrowserDetail.schemaId,
        chain.boundaryBrowserDetail.schemaVersion,
        chain.boundaryBrowserDetail.state,
      ],
      resultAggregate: [
        chain.resultBrowserAggregate.schemaId,
        chain.resultBrowserAggregate.schemaVersion,
        chain.resultBrowserAggregate.state,
      ],
      resultDetail: [
        chain.resultBrowserDetail.schemaId,
        chain.resultBrowserDetail.schemaVersion,
        chain.resultBrowserDetail.state,
      ],
    }, {
      boundaryAggregate: [
        PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID,
        PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION,
        PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready,
      ],
      boundaryDetail: [
        PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
        PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
        PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.ready,
      ],
      resultAggregate: [
        PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID,
        PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION,
        PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready,
      ],
      resultDetail: [
        PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
        PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
        PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.ready,
      ],
    });
    assert.deepEqual({
      sourceBoundary: [
        chain.sourceBoundary.schemaId,
        chain.sourceBoundary.schemaVersion,
        chain.sourceBoundary.contractId,
        chain.sourceBoundary.state,
      ],
      materialisationBoundary: [
        chain.materialisationBoundary.schemaId,
        chain.materialisationBoundary.schemaVersion,
        chain.materialisationBoundary.contractId,
        chain.materialisationBoundary.state,
      ],
      triggerReceipt: [
        chain.triggerReceipt.schemaId,
        chain.triggerReceipt.schemaVersion,
        chain.triggerReceipt.contractId,
        chain.triggerReceipt.state,
      ],
      visibleControl: [
        chain.visibleControl.schemaId,
        chain.visibleControl.schemaVersion,
        chain.visibleControl.contractId,
        chain.visibleControl.state,
      ],
    }, {
      sourceBoundary: [
        IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_ID,
        IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_VERSION,
        IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_CONTRACT_ID,
        IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.ready,
      ],
      materialisationBoundary: [
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES.ready,
      ],
      triggerReceipt: [
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_ID,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_VERSION,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_CONTRACT_ID,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.triggered,
      ],
      visibleControl: [
        IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_ID,
        IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_VERSION,
        IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_CONTRACT_ID,
        IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES.actionAvailable,
      ],
    });

    assert.equal(
      stableFingerprint("field-order", RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.boundarySummary,
    );
    assert.equal(
      stableFingerprint("field-order", RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.resultSummary,
    );
    assert.equal(
      stableFingerprint("field-order", RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.resultReadback,
    );
    assert.equal(
      stableFingerprint("field-order", PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.resultBrowserDetail,
    );
    assert.equal(
      stableFingerprint("field-order", IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.sourceBoundary,
    );
    assert.equal(
      stableFingerprint("field-order", RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.materialisationBoundary,
    );
    assert.equal(
      stableFingerprint("field-order", RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.browserTrigger,
    );
    assert.equal(
      stableFingerprint("field-order", IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_FIELD_ORDER),
      FIELD_ORDER_FINGERPRINTS.visibleControl,
    );
    assert.equal(
      stableFingerprint("false-flags", RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS),
      FALSE_FLAG_FINGERPRINTS.boundary,
    );
    assert.equal(
      stableFingerprint("false-flags", RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS),
      FALSE_FLAG_FINGERPRINTS.result,
    );

    assertFieldOrder(chain.boundarySummary, FIELD_ORDER_FINGERPRINTS.boundarySummary, "boundary summary");
    assertFieldOrder(chain.boundaryReadbackStatus, FIELD_ORDER_FINGERPRINTS.boundaryReadback, "boundary readback");
    assertFieldOrder(chain.resultSummary, FIELD_ORDER_FINGERPRINTS.resultSummary, "result summary");
    assertFieldOrder(chain.resultReadbackStatus, FIELD_ORDER_FINGERPRINTS.resultReadback, "result readback");
    assertFieldOrder(chain.boundaryBrowserAggregate, FIELD_ORDER_FINGERPRINTS.boundaryBrowserAggregate, "boundary browser aggregate");
    assertFieldOrder(chain.boundaryBrowserDetail, FIELD_ORDER_FINGERPRINTS.boundaryBrowserDetail, "boundary browser detail");
    assertFieldOrder(chain.resultBrowserAggregate, FIELD_ORDER_FINGERPRINTS.resultBrowserAggregate, "result browser aggregate");
    assertFieldOrder(chain.resultBrowserDetail, FIELD_ORDER_FINGERPRINTS.resultBrowserDetail, "result browser detail");
    assertFieldOrder(chain.sourceBoundary, FIELD_ORDER_FINGERPRINTS.sourceBoundary, "source boundary");
    assertFieldOrder(chain.materialisationBoundary, FIELD_ORDER_FINGERPRINTS.materialisationBoundary, "materialisation boundary");
    assertFieldOrder(chain.triggerReceipt, FIELD_ORDER_FINGERPRINTS.browserTrigger, "trigger receipt");
    assertFieldOrder(chain.visibleControl, FIELD_ORDER_FINGERPRINTS.visibleControl, "visible control");

    assertOrderedFingerprint(
      chain.boundarySummary,
      "iesFirstNarrowProjectIesExportBoundarySummaryFingerprint",
      "safe-ies-first-narrow-project-ies-export-boundary-summary",
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER,
    );
    assertOrderedFingerprint(
      chain.boundaryReadbackStatus,
      "iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint",
      "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
    );
    assertOrderedFingerprint(
      chain.resultSummary,
      "iesFirstNarrowProjectIesExportResultSummaryFingerprint",
      "safe-ies-first-narrow-project-ies-export-result-summary",
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER,
    );
    assertOrderedFingerprint(
      chain.resultReadbackStatus,
      "iesFirstNarrowProjectIesExportResultReadbackFingerprint",
      "safe-ies-first-narrow-project-ies-export-result-readback-status",
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_FIELD_ORDER,
    );
    assertOrderedFingerprint(
      chain.boundaryBrowserAggregate,
      "projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint",
      "safe-project-browser-project-ies-export-boundary-readback-summary",
    );
    assertOrderedFingerprint(
      chain.boundaryBrowserDetail,
      "projectBrowserSelectedProjectIesExportBoundaryReadbackDetailFingerprint",
      "safe-project-browser-selected-project-ies-export-boundary-readback-detail-summary",
    );
    assertOrderedFingerprint(
      chain.resultBrowserAggregate,
      "projectBrowserProjectIesExportResultReadbackSummaryFingerprint",
      "safe-project-browser-project-ies-export-result-readback-summary",
    );
    assertOrderedFingerprint(
      chain.resultBrowserDetail,
      "projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint",
      "safe-project-browser-selected-project-ies-export-result-readback-detail-summary",
      PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_FIELD_ORDER,
    );
    assertOrderedFingerprint(
      chain.sourceBoundary,
      "sourceBoundaryFingerprint",
      "safe-ies-builder-selected-project-ies-export-download-source-boundary",
      IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_FIELD_ORDER,
    );
    assertOrderedFingerprint(
      chain.triggerReceipt,
      "triggerFingerprint",
      "safe-ies-first-narrow-project-ies-export-browser-download-trigger",
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER,
    );

    const boundaryOpaqueFingerprint = stableFingerprint(
      "safe-ies-first-narrow-project-ies-export-boundary",
      {
        approvedLabReferenceFingerprint:
          chain.boundarySummary.approvedLabReferenceFingerprint,
        candidateOutputBundleBoundarySummaryFingerprint:
          chain.boundarySummary.candidateOutputBundleBoundarySummaryFingerprint,
        runLengthMm: chain.boundarySummary.runLengthMm,
        jobFingerprint: chain.boundarySummary.jobFingerprint,
        builderOutputReductionFingerprint:
          chain.boundarySummary.builderOutputReductionFingerprint,
      },
    );
    assert.equal(
      chain.boundarySummary.opaqueProjectIesExportBoundaryRef,
      boundaryOpaqueFingerprint,
    );
    assert.equal(
      chain.boundarySummary.builderOutputReductionFingerprint,
      stableFingerprint(
        "safe-ies-first-narrow-project-ies-export-builder-output-reduction",
        {
          builderOutputKind: chain.boundarySummary.builderOutputKind,
          builderOutputRecordCount: chain.boundarySummary.builderOutputRecordCount,
          builderOutputEntryCount: chain.boundarySummary.builderOutputEntryCount,
          builderOutputSafeScalarCount:
            chain.boundarySummary.builderOutputSafeScalarCount,
          builderOutputRedactedPayloadMarkerCount:
            chain.boundarySummary.builderOutputRedactedPayloadMarkerCount,
        },
      ),
    );

    assert.equal(
      chain.boundaryReadbackStatus.summaryFingerprint,
      chain.boundarySummary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint,
    );
    assert.equal(
      chain.resultSummary.projectIesExportBoundaryReadbackFingerprint,
      chain.boundaryReadbackStatus.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint,
    );
    assert.equal(
      chain.resultSummary.projectIesExportBoundarySummaryFingerprint,
      chain.boundarySummary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint,
    );
    assert.equal(
      chain.resultReadbackStatus.summaryFingerprint,
      chain.resultSummary.iesFirstNarrowProjectIesExportResultSummaryFingerprint,
    );
    assert.equal(
      chain.resultBrowserAggregate.projectStatuses[0].sourceReadbackFingerprint,
      chain.resultReadbackStatus.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    );
    assert.equal(
      chain.resultBrowserDetail.sourceReadbackFingerprint,
      chain.resultReadbackStatus.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    );
    assert.equal(
      chain.sourceBoundary.sourceDetailFingerprint,
      chain.resultBrowserDetail.projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint,
    );
    assert.equal(
      chain.sourceBoundary.sourceReadbackFingerprint,
      chain.resultReadbackStatus.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    );
    assert.equal(
      chain.materialisationBoundary.downloadMetadata.sourceResultReadbackFingerprint,
      chain.resultReadbackStatus.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    );
    assert.equal(
      chain.materialisationBoundary.downloadMetadata.contentFingerprint,
      stableFingerprint(
        "safe-ies-first-narrow-project-ies-export-download-content",
        VALID_LM63,
      ),
    );
    assert.equal(
      chain.materialisationBoundary.downloadMetadata.materialisationFingerprint,
      stableFingerprint(
        "safe-ies-first-narrow-project-ies-export-download-materialisation",
        {
          filename: chain.materialisationBoundary.downloadMetadata.filename,
          mediaType: chain.materialisationBoundary.downloadMetadata.mediaType,
          extension: chain.materialisationBoundary.downloadMetadata.extension,
          byteLength: chain.materialisationBoundary.downloadMetadata.byteLength,
          contentFingerprint:
            chain.materialisationBoundary.downloadMetadata.contentFingerprint,
          sourceResultReadbackFingerprint:
            chain.materialisationBoundary.downloadMetadata.sourceResultReadbackFingerprint,
        },
      ),
    );
    assert.deepEqual(
      chain.triggerReceipt.downloadMetadata,
      chain.materialisationBoundary.downloadMetadata,
    );
    assert.deepEqual(chain.preparedReceipt, chain.triggerReceipt);

    const repeated = await buildReadyChain();
    for (const [first, second] of [
      [chain.boundarySummary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint, repeated.boundarySummary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint],
      [chain.boundaryReadbackStatus.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint, repeated.boundaryReadbackStatus.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint],
      [chain.resultSummary.iesFirstNarrowProjectIesExportResultSummaryFingerprint, repeated.resultSummary.iesFirstNarrowProjectIesExportResultSummaryFingerprint],
      [chain.resultReadbackStatus.iesFirstNarrowProjectIesExportResultReadbackFingerprint, repeated.resultReadbackStatus.iesFirstNarrowProjectIesExportResultReadbackFingerprint],
      [chain.boundaryBrowserAggregate.projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint, repeated.boundaryBrowserAggregate.projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint],
      [chain.boundaryBrowserDetail.projectBrowserSelectedProjectIesExportBoundaryReadbackDetailFingerprint, repeated.boundaryBrowserDetail.projectBrowserSelectedProjectIesExportBoundaryReadbackDetailFingerprint],
      [chain.resultBrowserAggregate.projectBrowserProjectIesExportResultReadbackSummaryFingerprint, repeated.resultBrowserAggregate.projectBrowserProjectIesExportResultReadbackSummaryFingerprint],
      [chain.resultBrowserDetail.projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint, repeated.resultBrowserDetail.projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint],
      [chain.sourceBoundary.sourceBoundaryFingerprint, repeated.sourceBoundary.sourceBoundaryFingerprint],
      [chain.materialisationBoundary.downloadMetadata.materialisationFingerprint, repeated.materialisationBoundary.downloadMetadata.materialisationFingerprint],
      [chain.triggerReceipt.triggerFingerprint, repeated.triggerReceipt.triggerFingerprint],
    ]) {
      assert.equal(first, second);
    }
  });

  await t.test("keeps result browser readiness primary and boundary browser coverage frozen legacy diagnostics", () => {
    assert.equal(Object.isFrozen(PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION), true);
    assert.deepEqual(PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION, {
      schemaId: "controlstack.runtime.project-browser.project-ies-export-readback-surface-classification.v1",
      schemaVersion: 1,
      solePrimaryBrowserReadinessPair: [
        "projectIesExportResultReadbackSummary",
        "selectedProjectIesExportResultReadbackDetailSummary",
      ],
      frozenLegacyButKeptCompatibilityDiagnostics: [
        "projectIesExportBoundaryReadbackSummary",
        "selectedProjectIesExportBoundaryReadbackDetailSummary",
      ],
      deletionProhibitedUntilSeparateStagedRemovalPlanExists: true,
      readOnly: true,
      summaryOnly: true,
      redacted: true,
      deterministic: true,
    });
    assert.equal(chain.resultBrowserAggregate.ready, true);
    assert.equal(chain.resultBrowserDetail.ready, true);
    assert.equal(chain.boundaryBrowserAggregate.ready, true);
    assert.equal(chain.boundaryBrowserDetail.ready, true);
  });

  await t.test("keeps scalar-safe public surfaces and confines raw LM-63 to the private registry handoff and ephemeral blob", async () => {
    const scalarSurfaces = {
      boundarySummary: chain.boundarySummary,
      boundaryReadbackStatus: chain.boundaryReadbackStatus,
      resultSummary: chain.resultSummary,
      resultReadbackStatus: chain.resultReadbackStatus,
      boundaryBrowserAggregate: chain.boundaryBrowserAggregate,
      boundaryBrowserDetail: chain.boundaryBrowserDetail,
      resultBrowserAggregate: chain.resultBrowserAggregate,
      resultBrowserDetail: chain.resultBrowserDetail,
      sourceBoundary: chain.sourceBoundary,
      visibleControl: chain.visibleControl,
      classification: PROJECT_BROWSER_PROJECT_IES_EXPORT_READBACK_SURFACE_CLASSIFICATION,
    };
    for (const [name, surface] of Object.entries(scalarSurfaces)) {
      assertScalarTree(surface, name);
      assertNoRawLm63(surface, name);
      assertNoWidening(surface, name);
    }

    assert.strictEqual(
      getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(
        chain.sourceBoundary,
      ),
      chain.resultReadbackStatus,
    );
    assert.equal(await chain.materialisationBoundary.blob.text(), VALID_LM63);
    assertNoRawLm63(chain.materialisationBoundary.downloadMetadata, "downloadMetadata");
    assertNoRawLm63(chain.triggerReceipt, "triggerReceipt");
    assertNoRawLm63(chain.preparedReceipt, "preparedReceipt");
    assertNoWidening(chain.materialisationBoundary, "materialisationBoundary");
    assertNoWidening(chain.triggerReceipt, "triggerReceipt");
    assertNoWidening(chain.preparedReceipt, "preparedReceipt");

    assert.equal(chain.materialisationBoundary.ephemeral, true);
    assert.equal(chain.materialisationBoundary.inMemoryOnly, true);
    assert.equal(chain.materialisationBoundary.immutableBlob, true);
    assert.equal(chain.materialisationBoundary.sourceTextDiscarded, true);
    assert.equal(chain.materialisationBoundary.filesystemWriteAttempted, false);
    assert.equal(chain.materialisationBoundary.persistenceWriteAttempted, false);
    assert.equal(chain.materialisationBoundary.runtimeDataMutationAttempted, false);
    assert.equal(chain.materialisationBoundary.routeOrPostWiringAdded, false);
    assert.equal(chain.triggerReceipt.blobReturned, false);
    assert.equal(chain.triggerReceipt.objectUrlReturned, false);
    assert.equal(chain.triggerReceipt.rawIesTextReturned, false);
    assert.equal(chain.triggerReceipt.objectUrlRevoked, true);
    assert.deepEqual(chain.directHarness.calls, [
      "createObjectURL",
      "createElement:a",
      "append",
      "click",
      "remove",
      "revokeObjectURL",
    ]);
    assert.deepEqual(chain.preparedHarness.calls, chain.directHarness.calls);
  });

  await t.test("fails closed when schema, field order, fingerprint, identity, or readiness is tampered", async () => {
    const boundarySummaryTamperers = [
      (value) => replaceFrozen(value, { schemaId: "tampered-boundary-schema" }),
      (value) => reorderFrozen(value, "schemaVersion"),
      (value) => replaceFrozen(value, {
        iesFirstNarrowProjectIesExportBoundarySummaryFingerprint:
          `safe-ies-first-narrow-project-ies-export-boundary-summary:${"0".repeat(40)}`,
      }),
      (value) => replaceFrozen(value, {
        sourceInputFingerprint: "safe-source-input:tampered",
      }),
      (value) => replaceFrozen(value, { sourceBacked: false }),
    ];
    for (const tamper of boundarySummaryTamperers) {
      const status = buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus({
        modules: {
          cs_selector: {
            downstreamContext: {
              iesFirstNarrowProjectIesExportBoundarySummary:
                tamper(chain.boundarySummary),
            },
          },
        },
      });
      assert.equal(
        status.state,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.blockedFailClosed,
      );
      assert.equal(status.ready, false);
      assert.equal(status.failClosed, true);
    }

    const resultSummaryTamperers = [
      (value) => replaceFrozen(value, { schemaId: "tampered-result-schema" }),
      (value) => reorderFrozen(value, "schemaVersion"),
      (value) => replaceFrozen(value, {
        iesFirstNarrowProjectIesExportResultSummaryFingerprint:
          `safe-ies-first-narrow-project-ies-export-result-summary:${"0".repeat(40)}`,
      }),
      (value) => replaceFrozen(value, {
        boardDataSourceVersion: "safe-board-data-source-version:tampered",
      }),
      (value) => replaceFrozen(value, { projectIesExportResultSummaryReady: false }),
    ];
    for (const tamper of resultSummaryTamperers) {
      const status = buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({
        modules: {
          cs_selector: {
            downstreamContext: {
              iesFirstNarrowProjectIesExportResultSummary:
                tamper(chain.resultSummary),
            },
          },
        },
      });
      assert.equal(
        status.state,
        RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.blockedFailClosed,
      );
      assert.equal(status.ready, false);
      assert.equal(status.failClosed, true);
    }

    const resultReadbackTamperers = [
      (value) => replaceFrozen(value, { schemaId: "tampered-readback-schema" }),
      (value) => reorderFrozen(value, "summaryPresent"),
      (value) => replaceFrozen(value, {
        iesFirstNarrowProjectIesExportResultReadbackFingerprint:
          `safe-ies-first-narrow-project-ies-export-result-readback-status:${"0".repeat(40)}`,
      }),
      (value) => replaceFrozen(value, {
        sourceInputFingerprint: "safe-source-input:tampered",
      }),
      (value) => replaceFrozen(value, { ready: false }),
    ];
    for (const tamper of resultReadbackTamperers) {
      const sourceBoundary =
        await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
          context: {
            projectBrowser: {
              selectedProjectIesExportResultReadbackDetailSummary:
                chain.resultBrowserDetail,
            },
          },
          services: {
            savedProjects: {
              getIesFirstNarrowProjectIesExportResultReadbackStatus() {
                return tamper(chain.resultReadbackStatus);
              },
            },
          },
        });
      assert.equal(
        sourceBoundary.state,
        IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.blockedFailClosed,
      );
      assert.equal(sourceBoundary.ready, false);
      assert.equal(sourceBoundary.failClosed, true);
      assert.equal(
        getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(
          sourceBoundary,
        ),
        null,
      );
    }

    const tamperedDetail = replaceFrozen(chain.resultBrowserDetail, { ready: false });
    const detailBlockedBoundary =
      await resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
        context: {
          projectBrowser: {
            selectedProjectIesExportResultReadbackDetailSummary: tamperedDetail,
          },
        },
        services: {
          savedProjects: {
            getIesFirstNarrowProjectIesExportResultReadbackStatus() {
              return chain.resultReadbackStatus;
            },
          },
        },
      });
    assert.equal(detailBlockedBoundary.ready, false);
    assert.equal(detailBlockedBoundary.failClosed, true);

    const tamperedMetadata = Object.freeze({
      ...chain.materialisationBoundary.downloadMetadata,
      materialisationFingerprint:
        `safe-ies-first-narrow-project-ies-export-download-materialisation:${"0".repeat(40)}`,
    });
    const tamperedMaterialisation = Object.freeze({
      ...chain.materialisationBoundary,
      downloadMetadata: tamperedMetadata,
    });
    const blockedReceipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
      iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary:
        tamperedMaterialisation,
      browserDocument: browserHarness().browserDocument,
      browserUrlApi: browserHarness().browserUrlApi,
    });
    assert.equal(
      blockedReceipt.state,
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.blockedFailClosed,
    );
    assert.equal(blockedReceipt.ready, false);
    assert.equal(blockedReceipt.failClosed, true);

    const clonedSourceBoundary = Object.freeze({ ...chain.sourceBoundary });
    assert.equal(
      await prepareIesBuilderProjectIesExportDownloadCapabilityAction({
        projectIesExportDownloadSourceBoundary: clonedSourceBoundary,
        services: {
          materialiseProjectIesDownload:
            materialiseRuntimeIesFirstNarrowProjectIesDownload,
        },
      }),
      null,
    );
    const blockedControl = createIesBuilderProjectIesExportDownloadControl(null);
    assert.equal(blockedControl.visible, true);
    assert.equal(blockedControl.enabled, false);
    assert.equal(blockedControl.failClosed, true);
    assert.equal(
      blockedControl.state,
      IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES.blockedFailClosed,
    );
  });
});
