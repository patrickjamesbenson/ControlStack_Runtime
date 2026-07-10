import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildIesFirstNarrowProjectIesExportResultReadbackStatus,
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
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
const POLICY_FINGERPRINT = "safe-policy:project-ies-export-result-readback-fixture";
const SOURCE_FINGERPRINT = "safe-source:project-ies-export-result-readback-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:project-ies-export-result-readback-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:project-ies-export-result-readback-fixture";

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
  "projectEnvelope",
  "downstreamContext",
  "moduleState",
  "envelopeBody",
]);

const FORBIDDEN_TEXT = Object.freeze([
  "IESNA:",
  "TILT=",
  "LM-63",
  "candelaGrid",
  "rawGovernancePayload",
  "private-lab-rule",
  "C:\\ControlStack",
  "candidate.ies",
  "base64,",
]);

function context(projectId = "ies-first-narrow-project-ies-export-result-readback-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "IES first narrow project IES export result readback project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "IES first narrow project IES export result readback project",
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
    contractVersion: "ies-first-narrow-project-ies-export-result-readback-status-test",
  };
}

function readyBoundaryReadbackStatus(overrides = {}, { recomputeFingerprint = true } = {}) {
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
    ...overrides,
  };
  if (recomputeFingerprint) {
    status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint = stableFingerprint(
      "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
      status,
    );
  }
  return status;
}

function readyResultSummary() {
  return buildRuntimeIesFirstNarrowProjectIesExportResultSummary({
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: readyBoundaryReadbackStatus(),
  });
}

function envelopeWithSummary(summary, extraDownstream = {}) {
  return {
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummary: summary,
          ...extraDownstream,
        },
      },
    },
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

function assertNoForbiddenKeys(value, path = "status") {
  if (Array.isArray(value)) assert.fail(`${path} must not contain an array`);
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    assert.equal(REQUIRED_ABSENT_KEYS.includes(key), false, `${path}.${key} must stay absent`);
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function assertReadbackSafety(status) {
  assert.equal(status.schemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID);
  assert.equal(status.schemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(status.owner, "shell");
  assert.equal(status.slotOwner, "shell");
  assert.equal(status.envelopeOwner, "shell");
  assert.equal(status.targetKind, "project-envelope-module-downstream-context-summary-slot");
  assert.equal(status.moduleId, "cs_selector");
  assert.equal(status.consumerModuleId, "ies_builder");
  assert.equal(status.targetLocation, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_TARGET);
  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_REQUIRED_FALSE_FLAGS) {
    assert.equal(status[key], false, key);
  }
  assertNoForbiddenKeys(status);
  const text = JSON.stringify(status);
  for (const marker of FORBIDDEN_TEXT) assert.equal(text.includes(marker), false, marker);
  assert.match(
    status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    /^safe-ies-first-narrow-project-ies-export-result-readback-status:[0-9a-f]{40}$/,
  );
}

function assertReadyReadback(status, summary = readyResultSummary()) {
  assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.ready);
  assert.equal(status.readiness, "ready");
  assert.equal(status.ready, true);
  assert.equal(status.failClosed, false);
  assert.equal(status.blocker, null);
  assert.equal(status.summaryPresent, true);
  assert.equal(status.summarySchemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(status.summarySchemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(status.summaryContractId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_CONTRACT_ID);
  assert.equal(status.summaryState, "redacted_ies_first_narrow_project_ies_export_result_summary_persisted");
  assert.equal(status.summaryFingerprint, summary.iesFirstNarrowProjectIesExportResultSummaryFingerprint);
  assert.equal(status.summaryOnly, true);
  assert.equal(status.diagnosticOnly, true);
  assert.equal(status.safeSummaryOnly, true);
  assert.equal(status.redacted, true);
  assert.equal(status.machineValueSafe, true);
  assert.equal(status.readOnly, true);
  assert.equal(status.deterministicOnly, true);
  assert.equal(status.resultSummaryOnly, true);
  assert.equal(status.exportBoundaryReadbackOnly, true);
  assert.equal(status.productionProof, false);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.projectIesExportBoundaryReadbackReady, true);
  assert.equal(status.projectIesExportResultSummaryReady, true);
  assert.equal(status.sourceBacked, true);
  assert.equal(status.sourceAnchorOnly, true);
  assert.equal(status.opaqueReferenceOnly, true);
  assert.equal(status.opaqueBundleBoundaryRef, BUNDLE_REF);
  assert.equal(status.opaqueProjectIesExportBoundaryRef, PROJECT_BOUNDARY_REF);
  assert.equal(status.runLengthMm, 1200);
  assert.equal(status.builderOutputKind, "project-ies-lm63");
  assert.equal(status.builderOutputRecordCount, 1);
  assert.equal(status.builderOutputEntryCount, 1);
  assert.equal(status.builderOutputSafeScalarCount, 2);
  assert.equal(status.builderOutputRedactedPayloadMarkerCount, 3);
  assert.equal(status.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(status.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(status.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(status.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.equal(status.projectIesExportBoundaryReadbackStatusSchemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID);
  assert.equal(status.projectIesExportBoundaryReadbackStatusSchemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(status.projectIesExportBoundaryReadbackState, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready);
  assert.equal(status.projectIesExportBoundaryReadiness, "ready");
  assertReadbackSafety(status);
}

test("builds a missing project IES export result readback status without surfacing an envelope body", () => {
  const status = buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({});

  assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing);
  assert.equal(status.readiness, "missing");
  assert.equal(status.ready, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.summaryPresent, false);
  assert.equal(status.summarySchemaId, null);
  assert.equal(status.summaryState, null);
  assert.equal(status.blocker, "project-ies-export-result-envelope-missing");
  assertReadbackSafety(status);
});

test("reads only the persisted result summary slot and does not reopen an unsafe export-boundary body", () => {
  const summary = readyResultSummary();
  const envelope = envelopeWithSummary(summary, {
    iesFirstNarrowProjectIesExportBoundarySummary: {
      rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE\nprivate body must stay unopened",
      rawGovernancePayload: "private-lab-rule",
      candelaGrid: [[1, 2, 3]],
    },
  });

  const status = buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus(envelope);

  assertReadyReadback(status, summary);
  assert.equal(JSON.stringify(status).includes("private body must stay unopened"), false);
});

test("save result includes a safe ready project IES export result readback status", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-result-readback-save-result"),
    writeContribution(readyBoundaryReadbackStatus()),
  );

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.iesFirstNarrowProjectIesExportResultSummaryWritten, true);
  const summary = result.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultSummary;
  assertReadyReadback(result.iesFirstNarrowProjectIesExportResultReadbackStatus, summary);
  assert.deepEqual(Object.keys(result.envelope.modules.cs_selector.downstreamContext), [
    "iesFirstNarrowProjectIesExportResultSummary",
  ]);
  assert.equal(result.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultReadbackStatus, undefined);
});

test("store helper returns the same safe result readback status by project id and envelope id", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-result-readback-helper"),
    writeContribution(readyBoundaryReadbackStatus()),
  );
  assert.equal(result.accepted, true, result.reason);

  const byProjectId = store.getIesFirstNarrowProjectIesExportResultReadbackStatus(result.projectId);
  const byEnvelopeId = store.getIesFirstNarrowProjectIesExportResultReadbackStatus(result.envelopeId);

  assert.deepEqual(byProjectId, byEnvelopeId);
  assertReadyReadback(byProjectId, result.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultSummary);
});

test("runtime and short aliases build the same project IES export result readback status", () => {
  const envelope = envelopeWithSummary(readyResultSummary());

  assert.deepEqual(
    buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus(envelope),
    buildIesFirstNarrowProjectIesExportResultReadbackStatus(envelope),
  );
});

test("fails closed on schema drift, contract drift, field-order drift, fingerprint tampering, arrays, raw fields, and unsafe true flags", () => {
  const base = JSON.parse(JSON.stringify(readyResultSummary()));
  const entries = Object.entries(base);
  const first = entries.shift();
  const fieldOrderDrift = Object.fromEntries([...entries, first]);
  const cases = [
    ["schema", { ...base, schemaId: "controlstack.runtime.drifted-result-summary.v1" }, /schema-or-contract-mismatch/],
    ["contract", { ...base, contractId: "RUNTIME-DRIFTED-CONTRACT" }, /schema-or-contract-mismatch/],
    ["field-order", fieldOrderDrift, /field-order-drifted/],
    ["fingerprint", { ...base, runLengthMm: 1300 }, /fingerprint-mismatch/],
    ["slot-array", [base], /slot-array-not-approved/],
    ["array", { ...base, builderOutputKind: ["project-ies-lm63"] }, /array-body-not-approved|array-not-approved/],
    [
      "fingerprint-array",
      {
        ...base,
        iesFirstNarrowProjectIesExportResultSummaryFingerprint: [
          base.iesFirstNarrowProjectIesExportResultSummaryFingerprint,
        ],
      },
      /array-body-not-approved|array-not-approved/,
    ],
    ["raw", { ...base, rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE\nprivate" }, /field-not-allow-listed-raw-field|blocked-raw-field/],
    ["unsafe-true", { ...base, projectIesExportResultFileOutputEnabled: true }, /unsafe-enabled-flag|required-false-summary-flag-not-false/],
  ];

  for (const [label, summary, blockerPattern] of cases) {
    const status = buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus(envelopeWithSummary(summary));
    assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.blockedFailClosed, label);
    assert.equal(status.readiness, "blocked_fail_closed", label);
    assert.equal(status.ready, false, label);
    assert.equal(status.failClosed, true, label);
    assert.match(status.blocker, blockerPattern, label);
    assertReadbackSafety(status);
  }
});

test("save failure returns a safe missing result readback status and writes no envelope", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-result-readback-save-failure"),
    writeContribution(readyBoundaryReadbackStatus(), {
      rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE",
    }),
  );

  assert.equal(result.accepted, false);
  assert.equal(store.getProjectEnvelope("project-ies-export-result-readback-save-failure"), null);
  assert.equal(
    result.iesFirstNarrowProjectIesExportResultReadbackStatus.state,
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing,
  );
  assertReadbackSafety(result.iesFirstNarrowProjectIesExportResultReadbackStatus);
});

test("fixture and unknown project result readback remain missing and do not widen into a browser consumer", () => {
  const store = createSavedProjectStore();
  const fixture = store.getIesFirstNarrowProjectIesExportResultReadbackStatus("saved-alpha");
  const unknown = store.getIesFirstNarrowProjectIesExportResultReadbackStatus("not-a-project");

  assert.equal(fixture.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing);
  assert.equal(fixture.summaryPresent, false);
  assert.equal(unknown.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.missing);
  assert.equal(unknown.summaryPresent, false);
  assertReadbackSafety(fixture);
  assertReadbackSafety(unknown);
});

test("ready result summary fixture preserves the exact persisted field order used by readback validation", () => {
  assert.deepEqual(Object.keys(readyResultSummary()), RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_SUMMARY_FIELD_ORDER);
});
