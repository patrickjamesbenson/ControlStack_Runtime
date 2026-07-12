import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary,
  createProjectBrowserService,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SOURCE,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputManifestSummary.js";

const PROJECT_ID = "candidate-output-manifest-project";
const ENVELOPE_ID = "env-candidate-output-manifest-project";

const REQUIRED_FALSE_PROJECTION_FLAGS = Object.freeze([
  "manifestFileExists",
  "manifestDownloadable",
  "manifestFileOutputEnabled",
  "manifestFileOutputWritten",
  "downloadEnabled",
  "downloadAvailable",
  "sourceRowsReturned",
  "candidateOutputDetailsReturned",
  "artifactListReturned",
  "rawManifestReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "privatePathsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
]);

function readyManifestSummary(overrides = {}) {
  return {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
    state: "redacted_ies_first_narrow_candidate_output_manifest_summary_persisted",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    readyForManifestBoundary: true,
    readyForFutureOutput: true,
    manifestJoined: true,
    runTableFirstNarrowRowsReady: true,
    iesFirstNarrowMetadataHandoffReady: true,
    iesFirstNarrowCandidateOutputSummaryReady: true,
    sourceRunTableRowCount: 1,
    candidateOutputRecordCount: 1,
    manifestRecordCount: 1,
    manifestEntryCount: 1,
    firstCandidateOutputKind: "ies_first_narrow_candidate_output",
    policyFingerprint: "safe-policy:candidate-output-manifest-readback",
    sourceFingerprint: "safe-source:candidate-output-manifest-readback",
    sourceInputFingerprint: "safe-source-input:candidate-output-manifest-readback",
    iesFirstNarrowMetadataHandoffSummaryFingerprint:
      "safe-ies-first-narrow-metadata-handoff-summary:candidate-output-manifest-readback",
    iesFirstNarrowCandidateOutputSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-summary:candidate-output-manifest-readback",
    iesFirstNarrowCandidateOutputManifestSummaryFingerprint:
      "safe-ies-first-narrow-candidate-output-manifest-summary:candidate-output-manifest-readback",
    ...Object.fromEntries(
      RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
    ...overrides,
  };
}

function envelope(manifestSummary = readyManifestSummary(), overrides = {}) {
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
          ...(manifestSummary ? { iesFirstNarrowCandidateOutputManifestSummary: manifestSummary } : {}),
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
    title: "Candidate output manifest project",
  };
}

function assertProjectionShape(summary) {
  assert.deepEqual(
    Object.keys(summary),
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_FIELD_ORDER,
  );
  assert.equal(
    summary.schemaId,
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_ID,
  );
  assert.equal(
    summary.schemaVersion,
    PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SUMMARY_SCHEMA_VERSION,
  );
  assert.equal(summary.owner, "shell");
  assert.equal(summary.source, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_SOURCE);
  assert.equal(summary.targetLocation, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_TARGET);
  assert.equal(summary.selectedProjectOnly, true);
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  for (const flag of REQUIRED_FALSE_PROJECTION_FLAGS) assert.equal(summary[flag], false, flag);
  assert.ok(
    summary.projectBrowserSelectedProjectCandidateOutputManifestReadbackSummaryFingerprint.startsWith(
      "safe-project-browser-selected-project-candidate-output-manifest-readback-summary:",
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
    "manifest-output.json",
    "candidate-output.ies",
    "base64-secret",
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
    "sourceRows",
    "candidateOutputDetails",
    "projectEnvelope",
    "envelopeBody",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, key), false, key);
  }
}

test("selected-project candidate-output manifest readback projects only readiness, counts, first output kind, and fingerprints", () => {
  const sourceEnvelope = envelope();
  const summary = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );

  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.ready);
  assert.equal(summary.readiness, "ready");
  assert.equal(summary.ready, true);
  assert.equal(summary.failClosed, false);
  assert.equal(summary.blocker, null);
  assert.equal(summary.selectedProjectId, ENVELOPE_ID);
  assert.equal(summary.selectedProjectFound, true);
  assert.equal(summary.projectId, PROJECT_ID);
  assert.equal(summary.envelopeId, ENVELOPE_ID);
  assert.equal(summary.manifestSummaryPresent, true);
  assert.equal(summary.manifestBoundaryReady, true);
  assert.equal(summary.runTableRowCount, 1);
  assert.equal(summary.candidateOutputRecordCount, 1);
  assert.equal(summary.manifestRecordCount, 1);
  assert.equal(summary.manifestEntryCount, 1);
  assert.equal(summary.firstCandidateOutputKind, "ies_first_narrow_candidate_output");
  assert.equal(summary.policyFingerprint, "safe-policy:candidate-output-manifest-readback");
  assert.equal(summary.sourceFingerprint, "safe-source:candidate-output-manifest-readback");
  assert.equal(summary.sourceInputFingerprint, "safe-source-input:candidate-output-manifest-readback");
  assert.equal(
    summary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint,
    "safe-ies-first-narrow-candidate-output-manifest-summary:candidate-output-manifest-readback",
  );
  assertNoUnsafeSurface(summary);
});

test("selected-project candidate-output manifest readback distinguishes missing selection, invalid id, not found, and missing summary", () => {
  const notSelected = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary();
  const invalid = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
    envelope(),
    "C:\\private\\project",
  );
  const notFound = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
    null,
    ENVELOPE_ID,
  );
  const missingSummary = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
    envelope(null),
    ENVELOPE_ID,
  );

  assertProjectionShape(notSelected);
  assert.equal(notSelected.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.missing);
  assert.equal(notSelected.blocker, "project-browser-selected-project-not-selected");
  assert.equal(notSelected.selectedProjectId, null);
  assert.equal(notSelected.manifestBoundaryReady, false);

  assertProjectionShape(invalid);
  assert.equal(invalid.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.blockedFailClosed);
  assert.equal(invalid.readiness, "blocked_fail_closed");
  assert.equal(invalid.blocker, "project-browser-selected-project-id-invalid");
  assert.equal(invalid.selectedProjectId, null);

  assertProjectionShape(notFound);
  assert.equal(notFound.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.missing);
  assert.equal(notFound.blocker, "project-browser-selected-project-not-found");
  assert.equal(notFound.selectedProjectFound, false);

  assertProjectionShape(missingSummary);
  assert.equal(missingSummary.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.missing);
  assert.equal(
    missingSummary.blocker,
    "project-browser-selected-project-candidate-output-manifest-summary-missing",
  );
  assert.equal(missingSummary.manifestSummaryPresent, false);
  assert.equal(missingSummary.manifestEntryCount, 0);

  for (const summary of [notSelected, invalid, notFound, missingSummary]) assertNoUnsafeSurface(summary);
});

test("selected-project candidate-output manifest readback blocks unsafe or file-claiming source summaries", () => {
  const unsafe = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
    envelope(readyManifestSummary({
      manifest: {
        filename: "manifest-output.json",
        files: ["candidate-output.ies"],
      },
      iesText: "IESNA:LM-63 TILT=NONE",
      candelaGrid: "candela-secret",
      governancePayload: "governance-secret",
      privatePath: "C:\\ControlStack_RuntimeData\\manifest-output.json",
      base64: "base64-secret",
      manifestFileOutputEnabled: true,
    })),
    ENVELOPE_ID,
  );

  assertProjectionShape(unsafe);
  assert.equal(unsafe.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.blockedFailClosed);
  assert.equal(unsafe.readiness, "blocked_fail_closed");
  assert.equal(unsafe.ready, false);
  assert.equal(unsafe.failClosed, true);
  assert.equal(unsafe.blocker, "blocked-unsafe-true-flag-manifestFileOutputEnabled");
  assert.equal(unsafe.manifestSummaryPresent, true);
  assert.equal(unsafe.manifestBoundaryReady, false);
  assert.equal(unsafe.manifestEntryCount, 0);
  assert.equal(unsafe.firstCandidateOutputKind, null);
  assert.equal(unsafe.iesFirstNarrowCandidateOutputManifestSummaryFingerprint, null);
  assertNoUnsafeSurface(unsafe);
});

test("project-browser snapshot exposes the selected-project candidate-output manifest readback without file or download claims", () => {
  const selectedEnvelope = envelope();
  const calls = [];
  const store = {
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "candidate-output-manifest-readback-test-store",
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
      iesText: "IESNA:LM-63 candidate-output.ies",
      privatePath: "C:\\ControlStack_RuntimeData\\candidate-output.ies",
    },
  });
  const summary = inspected.browser.selectedProjectCandidateOutputManifestReadbackSummary;

  assert.equal(inspected.accepted, true);
  assertProjectionShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_CANDIDATE_OUTPUT_MANIFEST_READBACK_STATES.ready);
  assert.equal(summary.selectedProjectId, ENVELOPE_ID);
  assert.equal(summary.manifestEntryCount, 1);
  assert.equal(summary.manifestFileExists, false);
  assert.equal(summary.manifestDownloadable, false);
  assert.equal(summary.downloadAvailable, false);
  assert.deepEqual(calls, [ENVELOPE_ID, ENVELOPE_ID]);
  assertNoUnsafeSurface(summary);
});

test("selected-project candidate-output manifest readback is deterministic and does not mutate its source", () => {
  const sourceEnvelope = envelope();
  const before = JSON.stringify(sourceEnvelope);

  const first = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );
  const second = buildProjectBrowserSelectedProjectCandidateOutputManifestReadbackSummary(
    sourceEnvelope,
    ENVELOPE_ID,
  );

  assertProjectionShape(first);
  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(sourceEnvelope), before);
  assertNoUnsafeSurface(first);
});
