import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary,
  buildIesFirstNarrowProjectIesExportBoundarySummary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import { buildRuntimeApprovedLabReferenceSummary } from "../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputBundleBoundarySummary.js";

const POLICY_FINGERPRINT = "safe-policy:project-ies-export-boundary-fixture";
const SOURCE_FINGERPRINT = "safe-source:project-ies-export-boundary-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:project-ies-export-boundary-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:project-ies-export-boundary-fixture";
const LAB_REFERENCE_FINGERPRINT = "safe-lab-reference:project-ies-export-boundary-fixture";
const ONE_MM_FINGERPRINT = "safe-one-mm-lab-record:project-ies-export-boundary-fixture";
const REFERENCE_IES_FINGERPRINT = "safe-reference-ies:project-ies-export-boundary-fixture";
const PROVENANCE_FINGERPRINT = "safe-provenance:project-ies-export-boundary-fixture";
const EMERGENCY_FINGERPRINT = "safe-emergency-evidence:project-ies-export-boundary-fixture";
const BUNDLE_REF = "safe-ies-first-narrow-candidate-output-bundle-boundary:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const BUNDLE_FINGERPRINT = "safe-ies-first-narrow-candidate-output-bundle-boundary-summary:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

const FORBIDDEN_OUTPUT_TEXT = Object.freeze([
  "IESNA:",
  "TILT=",
  "LM-63",
  "candelaGrid",
  "rawGovernancePayload",
  "private-lab-rule",
  "C:\\ControlStack",
  "candidate.ies",
  "base64,",
  "selectedResultBody",
  "rawSelectedPayload",
]);

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

function approvedLabReferenceSummary(overrides = {}) {
  return {
    ...buildRuntimeApprovedLabReferenceSummary({
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
      approvedLabReferenceSummary: {
        ok: true,
        approved: true,
        labApproved: true,
        approvalState: "approved",
        labAuthority: "lab-owned-approved-photometry-reference",
        labReferenceFingerprint: LAB_REFERENCE_FINGERPRINT,
        oneMmLabRecordFingerprint: ONE_MM_FINGERPRINT,
        referenceIesFingerprint: REFERENCE_IES_FINGERPRINT,
        provenanceFingerprint: PROVENANCE_FINGERPRINT,
        emergencyEvidenceFingerprint: EMERGENCY_FINGERPRINT,
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
      oneMmLabRecordSummary: approvedChild(ONE_MM_FINGERPRINT, {
        kind: "one-mm-json-lab-record-summary",
        oneMmLabRecordFingerprint: ONE_MM_FINGERPRINT,
      }),
      referenceIesSummary: approvedChild(REFERENCE_IES_FINGERPRINT, {
        kind: "reference-ies-summary",
        referenceIesFingerprint: REFERENCE_IES_FINGERPRINT,
      }),
      provenanceSummary: approvedChild(PROVENANCE_FINGERPRINT, {
        kind: "provenance-custody-summary",
        provenanceFingerprint: PROVENANCE_FINGERPRINT,
      }),
      emergencyEvidenceSummary: approvedChild(EMERGENCY_FINGERPRINT, {
        kind: "emergency-evidence-summary",
        emergencyEvidenceFingerprint: EMERGENCY_FINGERPRINT,
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
    }),
    ...overrides,
  };
}

function candidateOutputBundleBoundarySummary(overrides = {}) {
  return {
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
    opaqueBundleBoundaryRef: BUNDLE_REF,
    outputBundleRecordCount: 1,
    outputBundleEntryCount: 1,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint: BUNDLE_FINGERPRINT,
    ...overrides,
  };
}

function job(overrides = {}) {
  return {
    kind: "project-ies-export-boundary-job",
    resolvedRunLengthMm: 1200,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    ...overrides,
  };
}

function assertNoForbiddenText(summary) {
  const text = JSON.stringify(summary);
  for (const marker of FORBIDDEN_OUTPUT_TEXT) {
    assert.equal(text.includes(marker), false, marker);
  }
}

function assertReadyShape(summary) {
  assert.deepEqual(Object.keys(summary), RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER);
  assert.equal(summary.schemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.contractId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.targetKind, "project-envelope-module-downstream-context-summary-slot");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.consumerModuleId, "ies_builder");
  assert.equal(summary.state, "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready");
  assert.equal(summary.blocker, null);
  assert.equal(summary.sourceKind, "safe-project-ies-export-boundary-summary");
  assert.equal(summary.futureOutputKind, "ies-first-narrow-project-ies-export-boundary");
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.deterministicOnly, true);
  assert.equal(summary.exportBoundaryOnly, true);
  assert.equal(summary.projectIesExportBoundaryOnly, true);
  assert.equal(summary.bundleBoundaryOnly, true);
  assert.equal(summary.builderCallBoundaryOnly, true);
  assert.equal(summary.productionProof, false);
  assert.equal(summary.labProofAuthority, false);
  assert.equal(summary.approvedReferenceGatePassed, true);
  assert.equal(summary.resolvedRunLengthGatePassed, true);
  assert.equal(summary.fingerprintAlignmentGatePassed, true);
  assert.equal(summary.builderBoundaryCallAllowed, true);
  assert.equal(summary.builderBoundaryCallAttempted, true);
  assert.equal(summary.builderBoundaryCallSucceeded, true);
  assert.equal(summary.builderOutputReduced, true);
  assert.equal(summary.approvedReferenceReady, true);
  assert.equal(summary.projectIesExportApproved, true);
  assert.equal(summary.sourceBacked, true);
  assert.equal(summary.sourceAnchorOnly, true);
  assert.equal(summary.opaqueReferenceOnly, true);
  assert.equal(summary.opaqueBundleBoundaryRef, BUNDLE_REF);
  assert.match(summary.opaqueProjectIesExportBoundaryRef, /^safe-ies-first-narrow-project-ies-export-boundary:[0-9a-f]{40}$/);
  assert.equal(summary.approvedLabReferenceFingerprint.startsWith("safe-approved-lab-reference-summary:"), true);
  assert.equal(summary.referenceIesFingerprint, REFERENCE_IES_FINGERPRINT);
  assert.equal(summary.oneMmLabRecordFingerprint, ONE_MM_FINGERPRINT);
  assert.equal(summary.provenanceFingerprint, PROVENANCE_FINGERPRINT);
  assert.equal(summary.emergencyEvidenceFingerprint, EMERGENCY_FINGERPRINT);
  assert.equal(summary.runLengthMm, 1200);
  assert.equal(summary.jobKind, "project-ies-export-boundary-job");
  assert.match(summary.jobFingerprint, /^safe-ies-first-narrow-project-ies-export-boundary-job:[0-9a-f]{40}$/);
  assert.equal(summary.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(summary.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(summary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(summary.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.equal(summary.candidateOutputBundleBoundaryContractId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID);
  assert.equal(summary.candidateOutputBundleBoundarySchemaId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID);
  assert.equal(summary.candidateOutputBundleBoundarySchemaVersion, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.candidateOutputBundleBoundaryState, "redacted_ies_first_narrow_candidate_output_bundle_boundary_summary_persisted");
  assert.equal(summary.candidateOutputBundleBoundarySummaryFingerprint, BUNDLE_FINGERPRINT);
  assert.equal(summary.bundleBoundaryReady, true);
  assert.equal(summary.bundleBoundaryRecordCount, 1);
  assert.equal(summary.bundleBoundaryEntryCount, 1);
  assert.equal(summary.builderOutputKind, "project-ies-lm63");
  assert.equal(summary.builderOutputRecordCount >= 1, true);
  assert.equal(summary.builderOutputEntryCount >= 1, true);
  assert.equal(summary.builderOutputSafeScalarCount >= 1, true);
  assert.equal(summary.builderOutputRedactedPayloadMarkerCount >= 3, true);
  assert.match(summary.builderOutputReductionFingerprint, /^safe-ies-first-narrow-project-ies-export-builder-output-reduction:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowProjectIesExportBoundarySummaryFingerprint, /^safe-ies-first-narrow-project-ies-export-boundary-summary:[0-9a-f]{40}$/);

  for (const flag of RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[flag], false, flag);
  }
  assertNoForbiddenText(summary);
}

test("calls buildProjectIes with approved reference, resolved run length, and aligned safe job, then redacts builder output", () => {
  let callCount = 0;
  let observedReference = null;
  let observedRunLengthMm = null;
  let observedJob = null;
  let observedReferenceFrozen = false;
  let observedJobFrozen = false;
  const buildProjectIes = (reference, resolvedRunLengthMm, safeJob) => {
    callCount += 1;
    observedReferenceFrozen = Object.isFrozen(reference);
    observedJobFrozen = Object.isFrozen(safeJob);
    observedReference = JSON.parse(JSON.stringify(reference));
    observedRunLengthMm = resolvedRunLengthMm;
    observedJob = JSON.parse(JSON.stringify(safeJob));
    return {
      kind: "project-ies-lm63",
      projectIesText: "IESNA:LM-63-2019\nTILT=NONE\nprivate body must not leak",
      candelaGrid: [[1, 2, 3]],
      governance: {
        rawGovernancePayload: "private-lab-rule",
      },
      safeRecord: {
        status: "ok",
        count: 1,
      },
    };
  };

  const first = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
    approvedLabReferenceSummary: approvedLabReferenceSummary(),
    iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
    resolvedRunLengthMm: 1200,
    job: job(),
    buildProjectIes,
  });
  const second = buildIesFirstNarrowProjectIesExportBoundarySummary({
    approvedLabReferenceSummary: approvedLabReferenceSummary(),
    iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
    resolvedRunLengthMm: 1200,
    job: job(),
    buildProjectIes,
  });

  assert.equal(callCount, 2);
  assert.equal(observedReferenceFrozen, true);
  assert.equal(observedJobFrozen, true);
  assert.equal(observedRunLengthMm, 1200);
  assert.equal(observedReference.kind, "approved-lab-reference-project-ies-export-boundary-ref");
  assert.equal(observedReference.projectIesExportApproved, true);
  assert.equal(observedReference.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(observedReference.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.equal(observedReference.rawReferenceIesReturned, false);
  assert.equal(observedReference.rawProjectIesReturned, false);
  assert.equal(observedJob.kind, "project-ies-export-boundary-job");
  assert.equal(observedJob.resolvedRunLengthMm, 1200);
  assert.equal(observedJob.opaqueBundleBoundaryRef, BUNDLE_REF);
  assert.equal(observedJob.candidateOutputBundleBoundarySummaryFingerprint, BUNDLE_FINGERPRINT);
  assert.equal(JSON.stringify(observedReference).includes("IESNA:"), false);
  assert.equal(JSON.stringify(observedJob).includes("selectedResultBody"), false);
  assertReadyShape(first);
  assertReadyShape(second);
  assert.deepEqual(first, second);
});

test("fails closed before builder call when approved reference is missing or not project-IES export approved", () => {
  let called = false;
  const buildProjectIes = () => {
    called = true;
    return { kind: "project-ies-lm63" };
  };

  const missing = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
    iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
    resolvedRunLengthMm: 1200,
    job: job(),
    buildProjectIes,
  });
  assert.equal(missing.state, "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed");
  assert.equal(missing.blocker, "approved-reference-summary-missing");
  assert.equal(missing.builderBoundaryCallAttempted, false);

  const notApproved = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
    approvedLabReferenceSummary: approvedLabReferenceSummary({ projectIesExportEligible: false }),
    iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
    resolvedRunLengthMm: 1200,
    job: job(),
    buildProjectIes,
  });
  assert.equal(notApproved.state, "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed");
  assert.equal(notApproved.blocker, "project-ies-export-not-approved");
  assert.equal(notApproved.builderBoundaryCallAttempted, false);
  assert.equal(called, false);
  assertNoForbiddenText(notApproved);
});

test("fails closed before builder call when resolved run length is missing, invalid, or mismatched", () => {
  const cases = [
    ["missing", {}, "resolved-run-length-missing"],
    ["zero", { resolvedRunLengthMm: 0 }, "resolved-run-length-missing"],
    ["mismatch", { resolvedRunLengthMm: 1200, job: job({ resolvedRunLengthMm: 1300 }) }, "resolved-run-length-mismatch"],
  ];

  for (const [label, overrides, blocker] of cases) {
    let called = false;
    const summary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
      approvedLabReferenceSummary: approvedLabReferenceSummary(),
      iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
      job: job({ resolvedRunLengthMm: undefined }),
      buildProjectIes: () => {
        called = true;
        return { kind: "project-ies-lm63" };
      },
      ...overrides,
    });
    assert.equal(summary.state, "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed", label);
    assert.equal(summary.blocker, blocker, label);
    assert.equal(summary.approvedReferenceGatePassed, true, label);
    assert.equal(summary.builderBoundaryCallAttempted, false, label);
    assert.equal(called, false, label);
  }
});

test("fails closed before builder call when source-input fingerprint or board data source version does not align", () => {
  const cases = [
    ["source-input", job({ sourceInputFingerprint: "safe-source-input:other-fixture" }), "source-input-fingerprint-mismatch"],
    ["board-version", job({ boardDataSourceVersion: "safe-board-data-source-version:other-fixture" }), "board-data-source-version-mismatch"],
    ["missing", { kind: "project-ies-export-boundary-job", resolvedRunLengthMm: 1200 }, "job-source-fingerprint-missing"],
  ];

  for (const [label, safeJob, blocker] of cases) {
    let called = false;
    const summary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
      approvedLabReferenceSummary: approvedLabReferenceSummary(),
      iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
      resolvedRunLengthMm: 1200,
      job: safeJob,
      buildProjectIes: () => {
        called = true;
        return { kind: "project-ies-lm63" };
      },
    });
    assert.equal(summary.state, "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed", label);
    assert.equal(summary.blocker, blocker, label);
    assert.equal(summary.approvedReferenceGatePassed, true, label);
    assert.equal(summary.resolvedRunLengthGatePassed, true, label);
    assert.equal(summary.builderBoundaryCallAttempted, false, label);
    assert.equal(called, false, label);
    assertNoForbiddenText(summary);
  }
});

test("fails closed when unsafe raw inputs or output/file/mutation flags are supplied before builder call", () => {
  const cases = [
    ["rawProjectIesText", { rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE" }, /blocked-unsafe-raw-input|unsafe-string/],
    ["candelaGrid", { candelaGrid: [[1, 2, 3]] }, /blocked-unsafe-raw-input/],
    ["fileOutput", { projectIesFileOutputWritten: true }, /blocked-unsafe-enabled-flag/],
    ["route", { routesAdded: true }, /blocked-unsafe-enabled-flag/],
    ["mutation", { runtimeDataMutationEnabled: true }, /blocked-unsafe-enabled-flag/],
  ];

  for (const [label, payload, blockerPattern] of cases) {
    let called = false;
    const summary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
      approvedLabReferenceSummary: approvedLabReferenceSummary(),
      iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
      resolvedRunLengthMm: 1200,
      job: job(),
      projectIesExportBoundaryCandidate: payload,
      buildProjectIes: () => {
        called = true;
        return { kind: "project-ies-lm63" };
      },
    });
    assert.equal(summary.state, "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed", label);
    assert.match(summary.blocker, blockerPattern, label);
    assert.equal(summary.builderBoundaryCallAttempted, false, label);
    assert.equal(called, false, label);
    assertNoForbiddenText(summary);
  }
});

test("fails closed after builder call if builder output reports file output, routes, POST, or mutation", () => {
  const cases = [
    ["file-path", { kind: "project-ies-lm63", filePath: "candidate.ies" }, "builder-output-file-output-not-approved"],
    ["local-path", { kind: "project-ies-lm63", localPath: "C:\\ControlStack_RuntimeData\\candidate.ies" }, "builder-output-file-output-not-approved"],
    ["routes", { kind: "project-ies-lm63", routesAdded: true }, "builder-output-unsafe-enabled-flag"],
    ["post", { kind: "project-ies-lm63", postEndpointsAdded: true }, "builder-output-unsafe-enabled-flag"],
    ["mutation", { kind: "project-ies-lm63", runtimeDataMutationEnabled: true }, "builder-output-unsafe-enabled-flag"],
  ];

  for (const [label, output, blocker] of cases) {
    let called = false;
    const summary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
      approvedLabReferenceSummary: approvedLabReferenceSummary(),
      iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
      resolvedRunLengthMm: 1200,
      job: job(),
      buildProjectIes: () => {
        called = true;
        return output;
      },
    });
    assert.equal(called, true, label);
    assert.equal(summary.state, "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed", label);
    assert.equal(summary.blocker, blocker, label);
    assert.equal(summary.builderBoundaryCallAttempted, true, label);
    assert.equal(summary.builderBoundaryCallSucceeded, false, label);
    assertNoForbiddenText(summary);
  }
});

test("fails closed if the buildProjectIes dependency is missing", () => {
  const summary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
    approvedLabReferenceSummary: approvedLabReferenceSummary(),
    iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
    resolvedRunLengthMm: 1200,
    job: job(),
  });

  assert.equal(summary.state, "ies_first_narrow_project_ies_export_boundary_blocked_fail_closed");
  assert.equal(summary.blocker, "build-project-ies-builder-missing");
  assert.equal(summary.approvedReferenceGatePassed, true);
  assert.equal(summary.resolvedRunLengthGatePassed, true);
  assert.equal(summary.fingerprintAlignmentGatePassed, true);
  assert.equal(summary.builderBoundaryCallAttempted, false);
  assertNoForbiddenText(summary);
});
