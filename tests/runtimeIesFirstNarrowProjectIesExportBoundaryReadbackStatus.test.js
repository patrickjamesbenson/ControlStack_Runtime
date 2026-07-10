import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildIesFirstNarrowProjectIesExportBoundaryReadbackStatus,
  buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputBundleBoundarySummary.js";
import {
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
} from "../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const POLICY_FINGERPRINT = "safe-policy:project-ies-export-boundary-readback-fixture";
const SOURCE_FINGERPRINT = "safe-source:project-ies-export-boundary-readback-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:project-ies-export-boundary-readback-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:project-ies-export-boundary-readback-fixture";
const OPAQUE_BUNDLE_REF = "safe-ies-first-narrow-candidate-output-bundle-boundary:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const OPAQUE_PROJECT_REF = "safe-ies-first-narrow-project-ies-export-boundary:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";
const BUNDLE_SUMMARY_FINGERPRINT = "safe-ies-first-narrow-candidate-output-bundle-boundary-summary:cccccccccccccccccccccccccccccccccccccccc";
const JOB_FINGERPRINT = "safe-ies-first-narrow-project-ies-export-boundary-job:dddddddddddddddddddddddddddddddddddddddd";
const REDUCTION_FINGERPRINT = "safe-ies-first-narrow-project-ies-export-builder-output-reduction:eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee";

const FORBIDDEN_TEXT = Object.freeze([
  "IESNA:",
  "TILT=",
  "candelaGrid",
  "rawGovernancePayload",
  "private-lab-rule",
  "C:\\ControlStack",
  "candidate.ies",
  "base64,",
  "selectedResultBody",
  "rawSelectedPayload",
]);

function context(projectId = "ies-first-narrow-project-ies-export-boundary-readback-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "IES first narrow project IES export boundary readback project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "IES first narrow project IES export boundary readback project",
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
    contractVersion: "ies-first-narrow-project-ies-export-boundary-readback-status-test",
  };
}

function readySummary(overrides = {}, { recomputeFingerprint = true } = {}) {
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    blocker: null,
    sourceKind: "safe-project-ies-export-boundary-summary",
    futureOutputKind: "ies-first-narrow-project-ies-export-boundary",
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
    opaqueBundleBoundaryRef: OPAQUE_BUNDLE_REF,
    opaqueProjectIesExportBoundaryRef: OPAQUE_PROJECT_REF,
    approvedLabReferenceSchemaId: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
    approvedLabReferenceSchemaVersion: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
    approvedLabReferenceState: RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_STATE,
    approvedLabReferenceFingerprint: "safe-approved-lab-reference:readback-fixture",
    referenceIesFingerprint: "safe-reference-ies:readback-fixture",
    oneMmLabRecordFingerprint: "safe-one-mm-lab-record:readback-fixture",
    provenanceFingerprint: "safe-provenance:readback-fixture",
    emergencyEvidenceFingerprint: "safe-emergency-evidence:readback-fixture",
    runLengthMm: 1200,
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint: JOB_FINGERPRINT,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    candidateOutputBundleBoundaryContractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
    candidateOutputBundleBoundarySchemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
    candidateOutputBundleBoundarySchemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    candidateOutputBundleBoundaryState: "redacted_ies_first_narrow_candidate_output_bundle_boundary_summary_persisted",
    candidateOutputBundleBoundarySummaryFingerprint: BUNDLE_SUMMARY_FINGERPRINT,
    bundleBoundaryReady: true,
    bundleBoundaryRecordCount: 1,
    bundleBoundaryEntryCount: 1,
    builderOutputKind: "project-ies-lm63",
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 1,
    builderOutputRedactedPayloadMarkerCount: 3,
    builderOutputReductionFingerprint: REDUCTION_FINGERPRINT,
    ...Object.fromEntries(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS.map((key) => [key, false])),
    iesFirstNarrowProjectIesExportBoundarySummaryFingerprint: null,
    ...overrides,
  };

  const ordered = Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER.map((key) => [key, fields[key]]),
  );
  if (recomputeFingerprint) {
    const withoutFingerprint = { ...ordered };
    delete withoutFingerprint.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint;
    ordered.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint = stableFingerprint(
      "safe-ies-first-narrow-project-ies-export-boundary-summary",
      withoutFingerprint,
    );
  }
  return ordered;
}

function writeContribution(summary, downstream = {}) {
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        iesFirstNarrowProjectIesExportBoundarySummaryWrite: {
          writeRequested: true,
        },
        iesFirstNarrowProjectIesExportBoundarySummaryCandidate: summary,
        ...downstream,
      },
    },
  };
}

function savedEnvelope(projectId = "ies-first-narrow-project-ies-export-boundary-readback-project") {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context(projectId), writeContribution(readySummary()));
  assert.equal(result.accepted, true, result.reason);
  return { store, result, envelope: result.envelope };
}

function assertReadbackSafety(status) {
  assert.equal(status.schemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID);
  assert.equal(status.schemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(status.owner, "shell");
  assert.equal(status.slotOwner, "shell");
  assert.equal(status.envelopeOwner, "shell");
  assert.equal(status.targetKind, "project-envelope-module-downstream-context-summary-slot");
  assert.equal(status.moduleId, "cs_selector");
  assert.equal(status.consumerModuleId, "ies_builder");
  assert.equal(status.targetLocation, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_TARGET);
  for (const key of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS) {
    assert.equal(status[key], false, key);
  }
  const text = JSON.stringify(status);
  for (const marker of FORBIDDEN_TEXT) assert.equal(text.includes(marker), false, marker);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "downstreamContext"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "envelope"), false);
  assert.match(status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint, /^safe-ies-first-narrow-project-ies-export-boundary-readback-status:[0-9a-f]{40}$/);
}

test("builds a missing project IES export boundary readback status without surfacing an envelope body", () => {
  const status = buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus({});

  assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing);
  assert.equal(status.readiness, "missing");
  assert.equal(status.ready, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.summaryPresent, false);
  assert.equal(status.summarySchemaId, null);
  assert.equal(status.summaryState, null);
  assert.equal(status.blocker, "project-ies-export-boundary-envelope-missing");
  assertReadbackSafety(status);
});

test("save result includes a safe ready project IES export boundary readback status", () => {
  const { result, envelope } = savedEnvelope("project-ies-export-boundary-readback-save-result");
  const summary = envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary;
  const status = result.iesFirstNarrowProjectIesExportBoundaryReadbackStatus;

  assert.equal(result.iesFirstNarrowProjectIesExportBoundarySummaryWritten, true);
  assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready);
  assert.equal(status.readiness, "ready");
  assert.equal(status.ready, true);
  assert.equal(status.failClosed, false);
  assert.equal(status.blocker, null);
  assert.equal(status.summaryPresent, true);
  assert.equal(status.summarySchemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID);
  assert.equal(status.summarySchemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION);
  assert.equal(status.summaryContractId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID);
  assert.equal(status.summaryState, "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready");
  assert.equal(status.summaryFingerprint, summary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint);
  assert.equal(status.projectIesExportApproved, true);
  assert.equal(status.builderBoundaryCallSucceeded, true);
  assert.equal(status.builderOutputReduced, true);
  assert.equal(status.opaqueProjectIesExportBoundaryRef, OPAQUE_PROJECT_REF);
  assert.equal(status.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(status.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(status.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(status.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.equal(status.runLengthMm, 1200);
  assertReadbackSafety(status);
});

test("store helper returns the same safe readback status by project id and envelope id", () => {
  const { store, result } = savedEnvelope("project-ies-export-boundary-readback-helper");
  const byProjectId = store.getIesFirstNarrowProjectIesExportBoundaryReadbackStatus(result.projectId);
  const byEnvelopeId = store.getIesFirstNarrowProjectIesExportBoundaryReadbackStatus(result.envelopeId);

  assert.equal(byProjectId.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready);
  assert.equal(byEnvelopeId.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready);
  assert.deepEqual(byProjectId, byEnvelopeId);
  assertReadbackSafety(byProjectId);
});

test("runtime and short aliases build the same project IES export boundary readback status", () => {
  const { envelope } = savedEnvelope("project-ies-export-boundary-readback-alias");

  assert.deepEqual(
    buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus(envelope),
    buildIesFirstNarrowProjectIesExportBoundaryReadbackStatus(envelope),
  );
});

test("blocks raw project IES and governance fields fail-closed without surfacing their values", () => {
  const { envelope } = savedEnvelope("project-ies-export-boundary-readback-blocked-raw");
  envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary = {
    ...envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary,
    rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE\nprivate body must not surface",
    rawGovernancePayload: "private-lab-rule",
  };

  const status = buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus(envelope);

  assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.ready, false);
  assert.equal(status.summaryPresent, true);
  assert.equal(status.blocker, "summary-field-not-allow-listed-raw-field");
  assert.equal(JSON.stringify(status).includes("private body must not surface"), false);
  assertReadbackSafety(status);
});

test("blocks enabled output, route, webhook, and mutation flags before readback is ready", () => {
  const { envelope } = savedEnvelope("project-ies-export-boundary-readback-blocked-flag");
  envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary.projectIesFileOutputEnabled = true;

  const status = buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus(envelope);

  assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.ready, false);
  assert.match(status.blocker, /blocked-unsafe-enabled-flag|unsafe-true-flag|required-false-summary-flag-not-false/);
  assert.equal(status.projectIesFileOutputEnabled, false);
  assertReadbackSafety(status);
});

test("blocks a safe-looking summary whose persisted summary fingerprint no longer matches", () => {
  const { envelope } = savedEnvelope("project-ies-export-boundary-readback-fingerprint-mismatch");
  envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary.runLengthMm = 1300;

  const status = buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus(envelope);

  assert.equal(status.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.ready, false);
  assert.equal(status.blocker, "persisted-summary-fingerprint-mismatch");
  assertReadbackSafety(status);
});

test("save failure returns a safe missing project IES export boundary readback status and writes no envelope", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("project-ies-export-boundary-readback-save-failure"),
    writeContribution({
      ...readySummary(),
      rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE",
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /blocked-unsafe-raw-input|unsafe-string|file-output-not-approved/);
  assert.equal(store.getProjectEnvelope("project-ies-export-boundary-readback-save-failure"), null);
  assert.equal(
    result.iesFirstNarrowProjectIesExportBoundaryReadbackStatus.state,
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing,
  );
  assertReadbackSafety(result.iesFirstNarrowProjectIesExportBoundaryReadbackStatus);
});

test("fixture and unknown project readback remain missing and do not widen into a consumer surface", () => {
  const store = createSavedProjectStore();
  const fixture = store.getIesFirstNarrowProjectIesExportBoundaryReadbackStatus("saved-alpha");
  const unknown = store.getIesFirstNarrowProjectIesExportBoundaryReadbackStatus("not-a-project");

  assert.equal(fixture.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing);
  assert.equal(fixture.summaryPresent, false);
  assert.equal(unknown.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.missing);
  assert.equal(unknown.summaryPresent, false);
  assertReadbackSafety(fixture);
  assertReadbackSafety(unknown);
});
