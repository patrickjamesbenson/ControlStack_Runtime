import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary,
  createProjectBrowserService,
  findUnsafeCandidateOutputDetailReadbackField,
  orderedSelectedProjectCandidateOutputDetailReadbackSummary,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SOURCE,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION,
  validateCandidateOutputDetailReadbackSource,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputDetailSummary.js";

const PROJECT_ID = "candidate-output-detail-project";
const ENVELOPE_ID = "env-candidate-output-detail-project";

const REQUIRED_FALSE_PROJECTION_FLAGS = Object.freeze([
  "detailFileExists",
  "detailDownloadable",
  "detailFileOutputEnabled",
  "detailFileOutputWritten",
  "downloadEnabled",
  "downloadAvailable",
  "sourceRowsReturned",
  "candidateOutputDetailsReturned",
  "artifactListReturned",
  "rawDetailReturned",
  "rawManifestReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "mutationDataReturned",
  "base64ArtifactsReturned",
  "blobsReturned",
  "urlsReturned",
  "filenamesReturned",
  "privatePathsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "outputGenerationEnabled",
]);

function readyDetailSummary(overrides = {}) {
  return {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: "redacted_ies_first_narrow_candidate_output_detail_summary_persisted",
    sourceKind: "safe-candidate-output-detail-summary",
    futureOutputKind: "ies-first-narrow-candidate-output-detail",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    detailOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    runTableFirstNarrowRowsReady: true,
    iesFirstNarrowMetadataHandoffReady: true,
    iesFirstNarrowCandidateOutputSummaryReady: true,
    iesFirstNarrowCandidateOutputManifestSummaryReady: true,
    readyForDetailBoundary: true,
    readyForFutureOutput: true,
    detailsJoined: true,
    sourceRowsIncluded: false,
    candidateOutputDetailsIncluded: true,
    artifactListIncluded: false,
    sourceRunTableRowCount: 1,
    candidateOutputRecordCount: 1,
    manifestRecordCount: 1,
    detailRecordCount: 1,
    detailEntryCount: 1,
    firstDetailEntryKind: "ies_first_narrow_candidate_output_detail_summary_ref",
    firstCandidateOutputKind: "ies_first_narrow_candidate_output",
    firstManifestEntryKind: "ies_first_narrow_candidate_output_manifest_summary_ref",
    firstRowKey: "candidate-output-detail-safe-row-0",
    firstRowKind: "first_accepted_safe_run_summary",
    firstRunKey: "candidate-output-detail-safe-run-0",
    firstRunIndex: 0,
    firstRowAccepted: true,
    firstRowEngineVerified: true,
    firstRowBoardCount: 2,
    firstRowSegmentCount: 3,
    firstRowZoneCount: 1,
    firstRowClipPointsCount: 4,
    firstRowSuspensionPointsCount: 5,
    firstRowGearTrayPlanCount: 1,
    firstRowReservedRangesCount: 2,
    policyFingerprint: "safe-policy:candidate-output-detail-readback",
    sourceFingerprint: "safe-source:candidate-output-detail-readback",
    sourceInputFingerprint: "safe-source-input:candidate-output-detail-readback",
    boardDataSourceVersion: "safe-board-data-source-version:candidate-output-detail-readback",
    iesFirstNarrowMetadataHandoffSummaryFingerprint:
      "safe-ies-first-narrow-metadata-handoff-summary:candidate-output-detail-readback",
    iesFirstNarrowCandidateOutputSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-summary:candidate-output-detail-readback",
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-manifest-summary:candidate-output-detail-readback",
    ...Object.fromEntries(
      RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
    iesFirstNarrowCandidateOutputDetailSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-detail-summary:candidate-output-detail-readback",
    ...overrides,
  };
}

function envelope(detailSummary = readyDetailSummary(), overrides = {}) {
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    modules: {
      cs_selector: {
        downstreamContext: {
          ...(detailSummary ? { iesFirstNarrowCandidateOutputDetailSummary: detailSummary } : {}),
        },
      },
    },
    ...overrides,
  };
}

function projectSummary() {
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    restoreEligible: true,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    title: "Candidate output detail project",
  };
}

function assertProjectionShape(summary) {
  assert.deepEqual(
    Object.keys(summary),
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_FIELD_ORDER,
  );
  assert.equal(
    summary.schemaId,
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_ID,
  );
  assert.equal(
    summary.schemaVersion,
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SUMMARY_SCHEMA_VERSION,
  );
  assert.equal(summary.owner, "shell");
  assert.equal(summary.source, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_SOURCE);
  assert.equal(summary.targetLocation, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET);
  assert.equal(summary.selectedProjectOnly, true);
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.detailOnly, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  for (const flag of REQUIRED_FALSE_PROJECTION_FLAGS) assert.equal(summary[flag], false, flag);
  assert.ok(
    summary.projectBrowserSelectedProjectCandidateOutputDetailReadbackSummaryFingerprint.startsWith(
      "safe-project-browser-selected-project-candidate-output-detail-readback-summary:",
    ),
  );
}

function assertNoUnsafeSurface(summary) {
  const text = JSON.stringify(summary);
  for (const token of [
    "IESNA:LM-63",
    "TILT=NONE",
    "candela-secret",
    "governance-secret",
    "mutation-secret",
    "detail-output.json",
    "candidate-output.ies",
    "base64-secret",
    "blob:secret",
    "https://example.invalid/detail",
    "C:\\ControlStack_RuntimeData",
  ]) {
    assert.equal(text.includes(token), false, token);
  }
  for (const key of [
    "ies",
    "iesText",
    "rawIes",
    "photometry",
    "candela",
    "candelaGrid",
    "governance",
    "governancePayload",
    "mutationLog",
    "detail",
    "rawDetail",
    "detailPayload",
    "candidateOutputDetail",
    "manifest",
    "artifactManifest",
    "artifactList",
    "outputFiles",
    "files",
    "filename",
    "fileName",
    "filePath",
    "privatePath",
    "base64",
    "blob",
    "url",
    "sourceRows",
    "candidateOutputDetails",
    "projectEnvelope",
    "envelopeBody",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, key), false, key);
  }
}

test("selected-project candidate-output detail readback projects only safe scalar detail and fingerprints", () => {
  const sourceEnvelope = envelope();
  const summary = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );

  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.ready);
  assert.equal(summary.readiness, "ready");
  assert.equal(summary.ready, true);
  assert.equal(summary.failClosed, false);
  assert.equal(summary.blocker, null);
  assert.equal(summary.selectedProjectId, ENVELOPE_ID);
  assert.equal(summary.selectedProjectFound, true);
  assert.equal(summary.projectId, PROJECT_ID);
  assert.equal(summary.envelopeId, ENVELOPE_ID);
  assert.equal(summary.detailSummaryPresent, true);
  assert.equal(summary.detailBoundaryReady, true);
  assert.equal(summary.sourceRunTableRowCount, 1);
  assert.equal(summary.candidateOutputRecordCount, 1);
  assert.equal(summary.manifestRecordCount, 1);
  assert.equal(summary.detailRecordCount, 1);
  assert.equal(summary.detailEntryCount, 1);
  assert.equal(summary.firstRowKey, "candidate-output-detail-safe-row-0");
  assert.equal(summary.firstRowKind, "first_accepted_safe_run_summary");
  assert.equal(summary.firstRunKey, "candidate-output-detail-safe-run-0");
  assert.equal(summary.firstRunIndex, 0);
  assert.equal(summary.firstRowAccepted, true);
  assert.equal(summary.firstRowEngineVerified, true);
  assert.equal(summary.firstRowBoardCount, 2);
  assert.equal(summary.firstRowSegmentCount, 3);
  assert.equal(summary.firstRowZoneCount, 1);
  assert.equal(summary.firstRowClipPointsCount, 4);
  assert.equal(summary.firstRowSuspensionPointsCount, 5);
  assert.equal(summary.firstRowGearTrayPlanCount, 1);
  assert.equal(summary.firstRowReservedRangesCount, 2);
  assert.equal(
    summary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint,
    "safe-ies-first-narrow-candidate-output-detail-summary:candidate-output-detail-readback",
  );
  assertNoUnsafeSurface(summary);
});

test("selected-project candidate-output detail readback distinguishes missing selection, invalid id, not found, and missing summary", () => {
  const notSelected = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary();
  const invalid = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    envelope(),
    "C:\\private\\project",
  );
  const notFound = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    null,
    ENVELOPE_ID,
  );
  const missingSummary = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    envelope(null),
    ENVELOPE_ID,
  );

  assertProjectionShape(notSelected);
  assert.equal(notSelected.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.missing);
  assert.equal(notSelected.blocker, "project-browser-selected-project-not-selected");
  assert.equal(notSelected.selectedProjectId, null);
  assert.equal(notSelected.detailBoundaryReady, false);

  assertProjectionShape(invalid);
  assert.equal(invalid.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.blockedFailClosed);
  assert.equal(invalid.readiness, "blocked_fail_closed");
  assert.equal(invalid.blocker, "project-browser-selected-project-id-invalid");
  assert.equal(invalid.selectedProjectId, null);

  assertProjectionShape(notFound);
  assert.equal(notFound.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.missing);
  assert.equal(notFound.blocker, "project-browser-selected-project-not-found");
  assert.equal(notFound.selectedProjectFound, false);

  assertProjectionShape(missingSummary);
  assert.equal(missingSummary.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.missing);
  assert.equal(
    missingSummary.blocker,
    "project-browser-selected-project-candidate-output-detail-summary-missing",
  );
  assert.equal(missingSummary.detailSummaryPresent, false);
  assert.equal(missingSummary.detailEntryCount, 0);
  assert.equal(missingSummary.firstRunIndex, null);

  for (const summary of [notSelected, invalid, notFound, missingSummary]) assertNoUnsafeSurface(summary);
});

test("selected-project candidate-output detail readback blocks raw detail, file, URL, blob, and download claims", () => {
  const unsafeSource = readyDetailSummary({
    detailFileOutputEnabled: true,
    detail: {
      filename: "detail-output.json",
      url: "https://example.invalid/detail",
      blob: "blob:secret",
    },
    iesText: "IESNA:LM-63 TILT=NONE",
    candelaGrid: "candela-secret",
    governancePayload: "governance-secret",
    mutationLog: "mutation-secret",
    privatePath: "C:\\ControlStack_RuntimeData\\detail-output.json",
    base64: "base64-secret",
  });
  const summary = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    envelope(unsafeSource),
    ENVELOPE_ID,
  );

  assert.equal(
    findUnsafeCandidateOutputDetailReadbackField(unsafeSource),
    "blocked-unsafe-true-flag-detailFileOutputEnabled",
  );
  assert.equal(
    validateCandidateOutputDetailReadbackSource(unsafeSource),
    "blocked-unsafe-true-flag-detailFileOutputEnabled",
  );
  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.blockedFailClosed);
  assert.equal(summary.readiness, "blocked_fail_closed");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.blocker, "blocked-unsafe-true-flag-detailFileOutputEnabled");
  assert.equal(summary.detailSummaryPresent, true);
  assert.equal(summary.detailBoundaryReady, false);
  assert.equal(summary.detailEntryCount, 0);
  assert.equal(summary.firstRowKey, null);
  assert.equal(summary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint, null);
  assertNoUnsafeSurface(summary);
});

test("project-browser snapshot exposes selected-project candidate-output detail readback without a second download", () => {
  const selectedEnvelope = envelope();
  const calls = [];
  const store = {
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "candidate-output-detail-readback-test-store",
        projects: [projectSummary()],
        count: 1,
        savedCount: 1,
        fixtureCount: 0,
        safeEmpty: false,
        save: {},
        restore: {},
        hydrate: {},
        handoffShare: {},
      };
    },
    getProjectEnvelope(projectIdOrEnvelopeId) {
      calls.push(projectIdOrEnvelopeId);
      return projectIdOrEnvelopeId === PROJECT_ID || projectIdOrEnvelopeId === ENVELOPE_ID
        ? structuredClone(selectedEnvelope)
        : null;
    },
    saveCurrentProjectEnvelope() {
      throw new Error("readback must not save project state");
    },
    restoreProjectEnvelope() {
      throw new Error("readback must not restore project state");
    },
    prepareHandoffSharePackage() {
      throw new Error("readback must not prepare output packages");
    },
  };
  const service = createProjectBrowserService({ savedProjectStore: store });

  const inspected = service.inspectProject(ENVELOPE_ID, {
    projectEnvelope: {
      detail: { filename: "detail-output.json" },
      iesText: "IESNA:LM-63 candidate-output.ies",
      privatePath: "C:\\ControlStack_RuntimeData\\candidate-output.ies",
    },
  });
  const summary = inspected.browser.selectedProjectCandidateOutputDetailReadbackSummary;

  assert.equal(inspected.accepted, true);
  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_DETAIL_READBACK_STATES.ready);
  assert.equal(summary.selectedProjectId, ENVELOPE_ID);
  assert.equal(summary.detailEntryCount, 1);
  assert.equal(summary.detailFileExists, false);
  assert.equal(summary.detailDownloadable, false);
  assert.equal(summary.downloadAvailable, false);
  assert.equal(summary.outputGenerationEnabled, false);
  assert.deepEqual(calls, [ENVELOPE_ID, ENVELOPE_ID]);
  assertNoUnsafeSurface(summary);
});

test("selected-project candidate-output detail readback is ordered, deterministic, and does not mutate its source", () => {
  const sourceEnvelope = envelope();
  const before = JSON.stringify(sourceEnvelope);

  const first = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );
  const second = buildProjectBrowserSelectedProjectCandidateOutputDetailReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );
  const reordered = orderedSelectedProjectCandidateOutputDetailReadbackSummary({ ...first });

  assertProjectionShape(first);
  assert.deepEqual(first, second);
  assert.deepEqual(reordered, first);
  assert.equal(validateCandidateOutputDetailReadbackSource(readyDetailSummary()), null);
  assert.equal(JSON.stringify(sourceEnvelope), before);
  assertNoUnsafeSurface(first);
});
