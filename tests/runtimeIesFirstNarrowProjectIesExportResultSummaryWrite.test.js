import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_TARGET,
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

const BUNDLE_REF = `safe-ies-first-narrow-candidate-output-bundle-boundary:${"a".repeat(40)}`;
const PROJECT_BOUNDARY_REF = `safe-ies-first-narrow-project-ies-export-boundary:${"b".repeat(40)}`;
const BOUNDARY_SUMMARY_FINGERPRINT = `safe-ies-first-narrow-project-ies-export-boundary-summary:${"c".repeat(40)}`;
const BUNDLE_SUMMARY_FINGERPRINT = `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"d".repeat(40)}`;
const BUILDER_REDUCTION_FINGERPRINT = `safe-ies-first-narrow-project-ies-export-builder-output-reduction:${"e".repeat(40)}`;
const JOB_FINGERPRINT = `safe-ies-first-narrow-project-ies-export-boundary-job:${"f".repeat(40)}`;
const POLICY_FINGERPRINT = "safe-policy:project-ies-export-result-summary-fixture";
const SOURCE_FINGERPRINT = "safe-source:project-ies-export-result-summary-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:project-ies-export-result-summary-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:project-ies-export-result-summary-fixture";

const REQUIRED_ABSENT_KEYS = Object.freeze([
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
  "rawIesText",
  "rawIesContent",
  "candela",
  "candelaGrid",
  "candelaArray",
  "candelaArrays",
  "rawCandela",
  "governance",
  "governancePayload",
  "rawGovernance",
  "rawGovernancePayload",
  "referenceIes",
  "rawReferenceIes",
  "photometry",
  "rawPhotometry",
  "selectedResultBody",
  "selectedResultPayload",
  "rawSelectedPayload",
  "resultBody",
  "resultPayload",
  "rawResult",
  "outputFiles",
  "files",
  "filename",
  "fileName",
  "localPath",
  "privatePath",
  "filePath",
  "targetPath",
  "writeTarget",
  "base64",
  "base64Artifacts",
]);

const FORBIDDEN_TEXT = Object.freeze([
  "IESNA:",
  "TILT=",
  "LM-63",
  "candelaGrid",
  "rawGovernancePayload",
  "C:\\ControlStack",
  "candidate.ies",
  "base64,",
]);

function context(projectId = "ies-first-narrow-project-ies-export-result-summary-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "IES first narrow project IES export result summary project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "IES first narrow project IES export result summary project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      selection: {},
    },
    identity: {
      identityState: "internal_identified",
      classification: "internal",
      actualRole: "internal_user",
      currentUser: {
        name: "Runtime User",
        email: "runtime@controlstack.local",
      },
    },
    downstream: {
      selector: {},
    },
    contractVersion: "ies-first-narrow-project-ies-export-result-summary-test",
  };
}

function readyReadbackStatus(overrides = {}) {
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
    summaryFingerprint: BOUNDARY_SUMMARY_FINGERPRINT,
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
    opaqueBundleBoundaryRef: BUNDLE_REF,
    opaqueProjectIesExportBoundaryRef: PROJECT_BOUNDARY_REF,
    runLengthMm: 1200,
    builderOutputKind: "project-ies-lm63",
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 2,
    builderOutputRedactedPayloadMarkerCount: 3,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint: JOB_FINGERPRINT,
    builderOutputReductionFingerprint: BUILDER_REDUCTION_FINGERPRINT,
    candidateOutputBundleBoundarySummaryFingerprint: BUNDLE_SUMMARY_FINGERPRINT,
    ...Object.fromEntries(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS.map((key) => [key, false])),
  };
  status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
    status,
  );
  return {
    ...status,
    ...overrides,
  };
}

function writeContribution(status, directWrite = {}) {
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        iesFirstNarrowProjectIesExportResultSummaryWrite: {
          writeRequested: true,
          iesFirstNarrowProjectIesExportBoundaryReadbackStatus: status,
          ...directWrite,
        },
      },
    },
  };
}

function assertNoForbiddenKeys(value, path = "summary") {
  if (Array.isArray(value)) {
    assert.fail(`${path} must not contain an array`);
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    assert.equal(REQUIRED_ABSENT_KEYS.includes(key), false, `${path}.${key} must stay absent`);
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function assertNoUnsafeText(summary) {
  const text = JSON.stringify(summary);
  for (const marker of FORBIDDEN_TEXT) assert.equal(text.includes(marker), false, marker);
}

function assertReadySummary(summary) {
  assert.deepEqual(Object.keys(summary), RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER);
  assert.equal(summary.schemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.contractId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.consumerModuleId, "ies_builder");
  assert.equal(summary.state, "redacted_ies_first_narrow_project_ies_export_result_summary_persisted");
  assert.equal(summary.blocker, null);
  assert.equal(summary.sourceKind, "safe-project-ies-export-boundary-readback-status");
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.deterministicOnly, true);
  assert.equal(summary.resultSummaryOnly, true);
  assert.equal(summary.exportBoundaryReadbackOnly, true);
  assert.equal(summary.productionProof, false);
  assert.equal(summary.labProofAuthority, false);
  assert.equal(summary.projectIesExportBoundaryReadbackReady, true);
  assert.equal(summary.projectIesExportResultSummaryReady, true);
  assert.equal(summary.sourceBacked, true);
  assert.equal(summary.sourceAnchorOnly, true);
  assert.equal(summary.opaqueReferenceOnly, true);
  assert.equal(summary.opaqueBundleBoundaryRef, BUNDLE_REF);
  assert.equal(summary.opaqueProjectIesExportBoundaryRef, PROJECT_BOUNDARY_REF);
  assert.equal(summary.runLengthMm, 1200);
  assert.equal(summary.builderOutputKind, "project-ies-lm63");
  assert.equal(summary.builderOutputRecordCount, 1);
  assert.equal(summary.builderOutputEntryCount, 1);
  assert.equal(summary.builderOutputSafeScalarCount, 2);
  assert.equal(summary.builderOutputRedactedPayloadMarkerCount, 3);
  assert.equal(summary.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(summary.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(summary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(summary.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.equal(summary.jobKind, "project-ies-export-boundary-job");
  assert.equal(summary.jobFingerprint, JOB_FINGERPRINT);
  assert.equal(summary.builderOutputReductionFingerprint, BUILDER_REDUCTION_FINGERPRINT);
  assert.equal(summary.candidateOutputBundleBoundarySummaryFingerprint, BUNDLE_SUMMARY_FINGERPRINT);
  assert.equal(summary.projectIesExportBoundaryReadbackStatusSchemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID);
  assert.equal(summary.projectIesExportBoundaryReadbackStatusSchemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(summary.projectIesExportBoundaryReadbackState, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready);
  assert.equal(summary.projectIesExportBoundaryReadiness, "ready");
  assert.match(summary.projectIesExportBoundaryReadbackFingerprint, /^safe-ies-first-narrow-project-ies-export-boundary-readback-status:[0-9a-f]{40}$/);
  assert.equal(summary.projectIesExportBoundaryContractId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID);
  assert.equal(summary.projectIesExportBoundarySummarySchemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID);
  assert.equal(summary.projectIesExportBoundarySummarySchemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.projectIesExportBoundarySummaryState, "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready");
  assert.equal(summary.projectIesExportBoundarySummaryFingerprint, BOUNDARY_SUMMARY_FINGERPRINT);
  assert.match(summary.iesFirstNarrowProjectIesExportResultSummaryFingerprint, /^safe-ies-first-narrow-project-ies-export-result-summary:[0-9a-f]{40}$/);
  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
  }
  assertNoForbiddenKeys(summary);
  assertNoUnsafeText(summary);
}

test("builds a redacted project IES export result summary from the safe boundary readback status only", () => {
  const summary = buildRuntimeIesFirstNarrowProjectIesExportResultSummary({
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: readyReadbackStatus(),
  });
  assertReadySummary(summary);
});

test("writes the readback-derived result summary only to the shell-owned downstream slot", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-result-summary-slot-project"),
    writeContribution(readyReadbackStatus()),
  );

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.iesFirstNarrowProjectIesExportResultSummaryWritten, true);
  assert.equal(result.iesFirstNarrowProjectIesExportResultSummaryTarget, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_TARGET);
  const downstream = result.envelope.modules.cs_selector.downstreamContext;
  assert.deepEqual(Object.keys(downstream), ["iesFirstNarrowProjectIesExportResultSummary"]);
  assertReadySummary(downstream.iesFirstNarrowProjectIesExportResultSummary);
  assert.equal(downstream.iesFirstNarrowProjectIesExportBoundaryReadbackStatus, undefined);
  assert.equal(downstream.iesFirstNarrowProjectIesExportResultSummaryWrite, undefined);
});

test("fails closed on raw text, arrays, filenames, paths, base64, and unsafe output flags", () => {
  const cases = [
    ["raw-text", { rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE" }],
    ["array", { resultItems: ["safe-token"] }],
    ["filename", { filename: "candidate.ies" }],
    ["path", { localPath: "C:\\ControlStack_RuntimeData\\private\\candidate.ies" }],
    ["base64", { base64: "data:application/octet-stream;base64,AAAA" }],
    ["output-flag", { outputGenerationEnabled: true }],
  ];

  for (const [label, unsafe] of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`project-ies-export-result-summary-${label}`),
      writeContribution(readyReadbackStatus(), unsafe),
    );
    assert.equal(result.accepted, false, label);
    assert.match(result.reason, /array-not-approved|blocked-unsafe-raw-input|blocked-unsafe-enabled-flag|unsafe-string/, label);
    assert.equal(store.getProjectEnvelope(`project-ies-export-result-summary-${label}`), null, label);
  }
});

test("fails closed on a tampered ready readback status instead of reopening another source", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-result-summary-tampered-readback"),
    writeContribution(readyReadbackStatus({ builderOutputRecordCount: 2 })),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /fingerprint-mismatch|blocked_fail_closed|not a ready redacted/);
  assert.equal(store.getProjectEnvelope("project-ies-export-result-summary-tampered-readback"), null);
});

test("rejects a prebuilt result summary candidate because the writer consumes readback status only", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-result-summary-prebuilt-candidate"),
    {
      cs_selector: {
        status: "ready",
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummaryWrite: { writeRequested: true },
          iesFirstNarrowProjectIesExportBoundaryReadbackStatus: readyReadbackStatus(),
          iesFirstNarrowProjectIesExportResultSummaryCandidate: {
            state: "prebuilt-result-not-approved",
          },
        },
      },
    },
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /prebuilt project IES export result summary candidate is not approved/);
  assert.equal(store.getProjectEnvelope("project-ies-export-result-summary-prebuilt-candidate"), null);
});

test("fails closed when the result summary target drifts from the shell-owned slot", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-result-summary-target-drift"),
    writeContribution(readyReadbackStatus(), {
      targetPath: "projectEnvelope.modules.ies_builder.privateResult",
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /target drifted from shell slot/);
  assert.equal(store.getProjectEnvelope("project-ies-export-result-summary-target-drift"), null);
});
