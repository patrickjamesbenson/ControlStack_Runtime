import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import { buildRuntimeApprovedLabReferenceSummary } from "../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputBundleBoundarySummary.js";

const POLICY_FINGERPRINT = "safe-policy:project-ies-export-boundary-write-fixture";
const SOURCE_FINGERPRINT = "safe-source:project-ies-export-boundary-write-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:project-ies-export-boundary-write-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:project-ies-export-boundary-write-fixture";
const LAB_REFERENCE_FINGERPRINT = "safe-lab-reference:project-ies-export-boundary-write-fixture";
const ONE_MM_FINGERPRINT = "safe-one-mm-lab-record:project-ies-export-boundary-write-fixture";
const REFERENCE_IES_FINGERPRINT = "safe-reference-ies:project-ies-export-boundary-write-fixture";
const PROVENANCE_FINGERPRINT = "safe-provenance:project-ies-export-boundary-write-fixture";
const EMERGENCY_FINGERPRINT = "safe-emergency-evidence:project-ies-export-boundary-write-fixture";
const BUNDLE_REF = "safe-ies-first-narrow-candidate-output-bundle-boundary:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
const BUNDLE_FINGERPRINT = "safe-ies-first-narrow-candidate-output-bundle-boundary-summary:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb";

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
  "governance",
  "governancePayload",
  "rawGovernance",
  "rawGovernancePayload",
  "referenceIes",
  "rawReferenceIes",
  "photometry",
  "rawPhotometry",
  "base64",
  "base64Artifacts",
  "outputFiles",
  "files",
  "filename",
  "fileName",
  "localPath",
  "privatePath",
  "filePath",
  "targetPath",
  "writeTarget",
  "selectedResultBody",
  "rawSelectedPayload",
  "runtimeData",
  "webhook",
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
  "selectedResultBody",
  "rawSelectedPayload",
]);

function context(projectId = "ies-first-narrow-project-ies-export-boundary-write-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "IES first narrow project IES export boundary write project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "IES first narrow project IES export boundary write project",
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
    contractVersion: "ies-first-narrow-project-ies-export-boundary-write-test",
  };
}

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

function readyProjectIesExportBoundarySummary({ onBuilderCall = () => {}, overrides = {} } = {}) {
  const summary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
    approvedLabReferenceSummary: approvedLabReferenceSummary(),
    iesFirstNarrowCandidateOutputBundleBoundarySummary: candidateOutputBundleBoundarySummary(),
    resolvedRunLengthMm: 1200,
    job: job(),
    buildProjectIes: (reference, resolvedRunLengthMm, safeJob) => {
      onBuilderCall(reference, resolvedRunLengthMm, safeJob);
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
    },
  });
  return {
    ...summary,
    ...overrides,
  };
}

function writeContribution(summary, options = {}) {
  const { directWrite = {}, downstream = {} } = options;
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        iesFirstNarrowProjectIesExportBoundarySummaryWrite: {
          writeRequested: true,
          ...directWrite,
        },
        iesFirstNarrowProjectIesExportBoundarySummaryCandidate: summary,
        ...downstream,
      },
    },
  };
}

function assertNoForbiddenKeys(value, path = "summary") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    assert.equal(REQUIRED_ABSENT_KEYS.includes(key), false, `${path}.${key} must stay absent`);
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function assertNoUnsafeText(summary) {
  const text = JSON.stringify(summary);
  for (const marker of FORBIDDEN_TEXT) {
    assert.equal(text.includes(marker), false, marker);
  }
}

function assertSummaryShape(summary) {
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
  assertNoForbiddenKeys(summary);
  assertNoUnsafeText(summary);
}

test("writes an already-built project IES export boundary summary only to the shell-owned downstream slot", () => {
  let builderCallCount = 0;
  const built = readyProjectIesExportBoundarySummary({
    onBuilderCall: () => {
      builderCallCount += 1;
    },
  });
  assert.equal(builderCallCount, 1);

  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("ies-project-export-boundary-slot-project"),
    writeContribution(built),
  );

  assert.equal(result.accepted, true, result.reason);
  assert.equal(builderCallCount, 1);
  assert.equal(result.iesFirstNarrowProjectIesExportBoundarySummaryWritten, true);
  assert.equal(result.iesFirstNarrowProjectIesExportBoundarySummaryTarget, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_TARGET);

  const downstream = result.envelope.modules.cs_selector.downstreamContext;
  assert.deepEqual(Object.keys(downstream), ["iesFirstNarrowProjectIesExportBoundarySummary"]);
  assertSummaryShape(downstream.iesFirstNarrowProjectIesExportBoundarySummary);
});

test("reduces benign non-contract fields from the project IES export boundary summary candidate before writing", () => {
  const built = readyProjectIesExportBoundarySummary();
  const candidate = {
    benignSafeNote: "safe-note:not-persisted",
    ...built,
    anotherSafeDiagnostic: "safe-diagnostic:not-persisted",
  };

  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("ies-project-export-boundary-reduced-project"),
    writeContribution(candidate),
  );

  assert.equal(result.accepted, true, result.reason);
  const summary = result.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary;
  assertSummaryShape(summary);
  assert.equal(summary.benignSafeNote, undefined);
  assert.equal(summary.anotherSafeDiagnostic, undefined);
  assert.deepEqual(Object.keys(summary), RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_FIELD_ORDER);
});

test("fails closed on raw project IES, candela, governance, file path, and selected-result payload inputs", () => {
  const cases = [
    ["rawProjectIesText", { rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE" }],
    ["candelaGrid", { candelaGrid: [[1, 2, 3]] }],
    ["rawGovernancePayload", { rawGovernancePayload: "private-lab-rule" }],
    ["outputFiles", { outputFiles: ["candidate.ies"] }],
    ["localPath", { localPath: "C:\\ControlStack_RuntimeData\\private\\candidate.ies" }],
    ["selectedResultBody", { selectedResultBody: { unsafe: true } }],
  ];

  for (const [label, payload] of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-project-export-boundary-unsafe-${label}`),
      writeContribution({
        ...readyProjectIesExportBoundarySummary(),
        ...payload,
      }),
    );
    assert.equal(result.accepted, false, label);
    assert.match(result.reason, /blocked-unsafe-raw-input|unsafe-string|file-output-not-approved/, label);
    assert.equal(store.getProjectEnvelope(`ies-project-export-boundary-unsafe-${label}`), null, label);
  }
});

test("fails closed when the project IES export boundary summary tries to enable output", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("ies-project-export-boundary-invalid-file-output-enabled"),
    writeContribution(readyProjectIesExportBoundarySummary({
      overrides: { projectIesFileOutputEnabled: true },
    })),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /blocked-unsafe-enabled-flag|required false/);
  assert.equal(store.getProjectEnvelope("ies-project-export-boundary-invalid-file-output-enabled"), null);
});

test("rolls back an existing project update on project IES export boundary summary write failure", () => {
  const store = createSavedProjectStore();
  const first = store.saveCurrentProjectEnvelope(
    context("ies-project-export-boundary-rollback-project"),
    writeContribution(readyProjectIesExportBoundarySummary()),
  );
  assert.equal(first.accepted, true, first.reason);
  const before = first.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary;

  const failed = store.saveCurrentProjectEnvelope(
    context("ies-project-export-boundary-rollback-project"),
    writeContribution({
      ...readyProjectIesExportBoundarySummary(),
      rawProjectIesText: "IESNA:LM-63-2019\nTILT=NONE",
    }),
  );

  assert.equal(failed.accepted, false);
  const afterEnvelope = store.getProjectEnvelope("ies-project-export-boundary-rollback-project");
  assert.deepEqual(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary, before);
  assert.equal(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
});
