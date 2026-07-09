import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildIesFirstNarrowCandidateOutputArtifactMaterialisationSummary,
  buildRuntimeIesFirstNarrowCandidateOutputArtifactMaterialisationSummary,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputArtifactMaterialisationSummary.js";
import { buildRuntimeIesFirstNarrowCandidateOutputArtifactRefSummary } from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputArtifactRefSummary.js";
import { buildRuntimeIesFirstNarrowCandidateOutputArtifactPlanSummary } from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputArtifactPlanSummary.js";
import { buildRuntimeIesFirstNarrowCandidateOutputDetailSummary } from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputDetailSummary.js";
import { buildRuntimeIesFirstNarrowCandidateOutputManifestSummary } from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputManifestSummary.js";
import { buildRuntimeIesFirstNarrowCandidateOutputSummary } from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputSummary.js";
import { buildRuntimeIesFirstNarrowMetadataHandoffSummary } from "../packages/workspace-kernel/iesFirstNarrowMetadataHandoffSummary.js";
import {
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROWS_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowRows.js";
import {
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runTableFirstNarrowRowShapeContract.js";

const POLICY_FINGERPRINT = "safe-policy:ies-first-narrow-candidate-output-artifact-materialisation-fixture";
const SOURCE_FINGERPRINT = "safe-source:ies-first-narrow-candidate-output-artifact-materialisation-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:ies-first-narrow-candidate-output-artifact-materialisation-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:ies-first-narrow-candidate-output-artifact-materialisation-fixture";
const SOURCE_PHOTOMETRY_REF = `safe-source-photometry-ref:${"c".repeat(40)}`;

const REQUIRED_ABSENT_KEYS = Object.freeze([
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawRun",
  "rawEnginePayload",
  "rawEngineResult",
  "selectedResultBody",
  "rawSelectedPayload",
  "selectedResultPayload",
  "iesFirstNarrowCandidateOutputSummary",
  "iesFirstNarrowCandidateOutputManifestSummary",
  "iesFirstNarrowCandidateOutputDetailSummary",
  "iesFirstNarrowCandidateOutputArtifactPlanSummary",
  "iesFirstNarrowCandidateOutputArtifactRefSummary",
  "ies",
  "iesText",
  "rawIes",
  "rawIesText",
  "rawIesContent",
  "sourcePhotometryRef",
  "photometry",
  "rawPhotometry",
  "rawPhotometryPayload",
  "candela",
  "candelaGrid",
  "base64",
  "base64Artifacts",
  "filename",
  "fileName",
  "privatePath",
  "localPath",
  "filePath",
  "targetPath",
  "writeTarget",
  "manifest",
  "rawManifest",
  "artifactManifest",
  "outputManifest",
  "artifactList",
  "artifactPlan",
  "rawArtifactPlan",
  "artifactPlanPayload",
  "artifactPlanList",
  "artifact",
  "rawArtifact",
  "artifactPayload",
  "artifactFile",
  "artifactFiles",
  "artifactMaterialisation",
  "rawArtifactMaterialisation",
  "artifactMaterialisationPayload",
  "materialisedArtifact",
  "materialisedFiles",
  "artifactBody",
  "rawArtifactBody",
  "outputFiles",
  "files",
  "detail",
  "rawDetail",
  "detailPayload",
  "rawDetailPayload",
  "candidateOutputDetails",
  "rawCandidateOutputDetails",
  "credentials",
]);

function context(projectId = "ies-first-narrow-candidate-output-artifact-materialisation-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "IES first narrow candidate output artifact materialisation project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "IES first narrow candidate output artifact materialisation project",
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
    contractVersion: "ies-first-narrow-candidate-output-artifact-materialisation-test",
  };
}

function sourcePhotometryRefHandoffSummary() {
  return {
    contractId: "RUNTIME-IES-SOURCE-PHOTOMETRY-REF-HANDOFF-1",
    schemaId: "controlstack.runtime.ies-source-photometry-ref-handoff-summary",
    schemaVersion: 1,
    state: "runtime_ies_source_photometry_ref_handoff_diagnostic_only",
    ok: true,
    blocker: null,
    handoffReady: true,
    sourcePhotometryStatus: "real_source_ref_ready",
    sourcePhotometryRef: SOURCE_PHOTOMETRY_REF,
    readOnly: true,
    deterministicOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    opaqueReferenceOnly: true,
    sourceAnchorOnly: true,
    sourceBacked: true,
    sourceFingerprint: SOURCE_FINGERPRINT,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    photometryReferenceFingerprint: "safe-reference:ies-first-narrow-candidate-output-artifact-materialisation-fixture",
    oneMmPolicyLabel: "one-mm-length-policy-summary-only",
    iesPhotometryReferenceToken: "safe-ies-reference:ies-first-narrow-candidate-output-artifact-materialisation-fixture",
    lumenCurveReferenceToken: "safe-lumen-curve-reference:ies-first-narrow-candidate-output-artifact-materialisation-fixture",
    driverUtilCurveReferenceToken: "safe-driver-util-curve-reference:ies-first-narrow-candidate-output-artifact-materialisation-fixture",
    selectedResultHandoffState: "metadata_ready_for_future_candidate_output",
    selectedResultHandoffReady: true,
    readyForFutureCandidateOutput: true,
    slugGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutationEnabled: false,
  };
}

function metadataHandoffSummary(overrides = {}) {
  return {
    ...buildRuntimeIesFirstNarrowMetadataHandoffSummary({
      sourcePhotometryRefHandoffSummary: sourcePhotometryRefHandoffSummary(),
    }),
    ...overrides,
  };
}

function runTableFirstNarrowRows(overrides = {}) {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    state: RUNTABLE_FIRST_NARROW_ROWS_STATES.ready,
    runTableFirstNarrowRowsReady: true,
    failClosed: false,
    sourceKind: "safe-selected-result-source-object-summary",
    rowShapeContractReady: true,
    outputHandoffSummaryPresent: true,
    rowsIncluded: true,
    rowCount: 1,
    safeRowsReturned: true,
    firstNarrowRowsReturned: true,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    safetyFlags: {},
    rows: [
      {
        rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
        rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
        rowKey: "candidate-output-artifact-materialisation-safe-row-0",
        runKey: "candidate-output-artifact-materialisation-safe-run-0",
        runIndex: 0,
        rowOrdinal: 1,
        rowKind: "first_accepted_safe_run_summary",
        sourceKind: "safe-selected-result-source-object-summary",
        accepted: true,
        engineVerified: true,
        safeSummaryOnly: true,
        redacted: true,
        machineValueSafe: true,
        hasBodyRequested: true,
        boardCount: 2,
        segmentCount: 3,
        zoneCount: 1,
        clipPointsCount: 4,
        suspensionPointsCount: 5,
        gearTrayPlanCount: 1,
        reservedRangesCount: 2,
        rawRunReturned: false,
        rawRunTableRowsReturned: false,
        rawSourceRowsReturned: false,
        rawValuesReturned: false,
      },
    ],
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    runTableGenerationAttempted: false,
    iesGenerated: false,
    iesGenerationEnabled: false,
    outputGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutationEnabled: false,
    ...overrides,
  };
}

function candidateOutputSummary(overrides = {}) {
  return {
    ...buildRuntimeIesFirstNarrowCandidateOutputSummary({
      runTableFirstNarrowRows: runTableFirstNarrowRows(),
      iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
    }),
    ...overrides,
  };
}

function manifestSummary(overrides = {}) {
  return {
    ...buildRuntimeIesFirstNarrowCandidateOutputManifestSummary({
      runTableFirstNarrowRows: runTableFirstNarrowRows(),
      iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
      iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
    }),
    ...overrides,
  };
}

function detailSummary(overrides = {}) {
  return {
    ...buildRuntimeIesFirstNarrowCandidateOutputDetailSummary({
      runTableFirstNarrowRows: runTableFirstNarrowRows(),
      iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
      iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
      iesFirstNarrowCandidateOutputManifestSummary: manifestSummary(),
    }),
    ...overrides,
  };
}

function artifactPlanSummary(overrides = {}) {
  return {
    ...buildRuntimeIesFirstNarrowCandidateOutputArtifactPlanSummary({
      runTableFirstNarrowRows: runTableFirstNarrowRows(),
      iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
      iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
      iesFirstNarrowCandidateOutputManifestSummary: manifestSummary(),
      iesFirstNarrowCandidateOutputDetailSummary: detailSummary(),
    }),
    ...overrides,
  };
}

function artifactRefSummary(overrides = {}) {
  return {
    ...buildRuntimeIesFirstNarrowCandidateOutputArtifactRefSummary({
      runTableFirstNarrowRows: runTableFirstNarrowRows(),
      iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
      iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
      iesFirstNarrowCandidateOutputManifestSummary: manifestSummary(),
      iesFirstNarrowCandidateOutputDetailSummary: detailSummary(),
      iesFirstNarrowCandidateOutputArtifactPlanSummary: artifactPlanSummary(),
    }),
    ...overrides,
  };
}

function writeContribution(options = {}) {
  const {
    downstream = {},
    directWrite = {},
    rows = runTableFirstNarrowRows(),
    metadata = metadataHandoffSummary(),
    candidateOutput = candidateOutputSummary(),
    manifest = manifestSummary(),
    detail = detailSummary(),
    artifactPlan = artifactPlanSummary(),
    artifactRef = artifactRefSummary(),
  } = options;
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        runTableFirstNarrowRows: rows,
        iesFirstNarrowMetadataHandoffSummary: metadata,
        iesFirstNarrowCandidateOutputSummary: candidateOutput,
        iesFirstNarrowCandidateOutputManifestSummary: manifest,
        iesFirstNarrowCandidateOutputDetailSummary: detail,
        iesFirstNarrowCandidateOutputArtifactPlanSummary: artifactPlan,
        iesFirstNarrowCandidateOutputArtifactRefSummary: artifactRef,
        iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryWrite: {
          writeRequested: true,
          ...directWrite,
        },
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

function assertNoUnsafeText(value) {
  const text = JSON.stringify(value);
  for (const marker of [
    "IESNA:",
    "TILT=",
    "rawIesText",
    "rawIesContent",
    "sourcePhotometryRef",
    "rawPhotometry",
    "candelaGrid",
    "base64",
    "candidate.ies",
    "C:\\ControlStack",
    "selectedResultBody",
    "outputFiles",
    "rawDetail",
    "rawArtifactPlanPayload",
    "artifactPayload",
    "rawArtifactMaterialisationPayload",
    "materialisedFiles",
  ]) {
    assert.equal(text.includes(marker), false, marker);
  }
}

function assertSummaryShape(summary) {
  assert.deepEqual(Object.keys(summary), RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_FIELD_ORDER);
  assert.equal(summary.schemaId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.contractId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_CONTRACT_ID);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.targetKind, "project-envelope-module-downstream-context-summary-slot");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.consumerModuleId, "ies_builder");
  assert.equal(summary.state, "redacted_ies_first_narrow_candidate_output_artifact_materialisation_summary_persisted");
  assert.equal(summary.sourceKind, "safe-candidate-output-artifact-materialisation-boundary-summary");
  assert.equal(summary.futureOutputKind, "ies-first-narrow-candidate-output-artifact-materialisation-boundary");
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.deterministicOnly, true);
  assert.equal(summary.materialisationBoundaryOnly, true);
  assert.equal(summary.artifactRefOnly, true);
  assert.equal(summary.artifactPlanOnly, true);
  assert.equal(summary.candidateOutputOnly, true);
  assert.equal(summary.productionProof, false);
  assert.equal(summary.labProofAuthority, false);
  assert.equal(summary.sourceBacked, true);
  assert.equal(summary.sourceAnchorOnly, true);
  assert.equal(summary.opaqueReferenceOnly, true);
  assert.match(summary.opaqueArtifactRef, /^safe-ies-first-narrow-candidate-output-artifact-ref:[0-9a-f]{40}$/);
  assert.match(summary.opaqueMaterialisationBoundaryRef, /^safe-ies-first-narrow-candidate-output-artifact-materialisation-boundary:[0-9a-f]{40}$/);
  assert.equal(summary.runTableFirstNarrowRowsReady, true);
  assert.equal(summary.iesFirstNarrowMetadataHandoffReady, true);
  assert.equal(summary.iesFirstNarrowCandidateOutputSummaryReady, true);
  assert.equal(summary.iesFirstNarrowCandidateOutputManifestSummaryReady, true);
  assert.equal(summary.iesFirstNarrowCandidateOutputDetailSummaryReady, true);
  assert.equal(summary.iesFirstNarrowCandidateOutputArtifactPlanSummaryReady, true);
  assert.equal(summary.iesFirstNarrowCandidateOutputArtifactRefSummaryReady, true);
  assert.equal(summary.readyForArtifactRefBoundary, true);
  assert.equal(summary.readyForMaterialisationBoundary, true);
  assert.equal(summary.readyForFutureOutput, true);
  assert.equal(summary.artifactRefJoined, true);
  assert.equal(summary.artifactMaterialisationBoundaryJoined, true);
  assert.equal(summary.sourceRowsIncluded, false);
  assert.equal(summary.candidateOutputDetailsIncluded, false);
  assert.equal(summary.manifestListIncluded, false);
  assert.equal(summary.detailListIncluded, false);
  assert.equal(summary.artifactListIncluded, false);
  assert.equal(summary.artifactPlanListIncluded, false);
  assert.equal(summary.rawArtifactIncluded, false);
  assert.equal(summary.sourceRunTableRowCount, 1);
  assert.equal(summary.candidateOutputRecordCount, 1);
  assert.equal(summary.manifestRecordCount, 1);
  assert.equal(summary.detailRecordCount, 1);
  assert.equal(summary.artifactPlanRecordCount, 1);
  assert.equal(summary.artifactPlanEntryCount, 1);
  assert.equal(summary.artifactRefRecordCount, 1);
  assert.equal(summary.artifactRefEntryCount, 1);
  assert.equal(summary.artifactMaterialisationRecordCount, 1);
  assert.equal(summary.artifactMaterialisationEntryCount, 1);
  assert.equal(summary.firstArtifactMaterialisationEntryKind, "ies_first_narrow_candidate_output_artifact_ref_summary_ref");
  assert.equal(summary.firstArtifactRefEntryKind, "ies_first_narrow_candidate_output_artifact_plan_summary_ref");
  assert.equal(summary.firstArtifactPlanEntryKind, "ies_first_narrow_candidate_output_detail_summary_ref");
  assert.equal(summary.firstDetailEntryKind, "ies_first_narrow_candidate_output_detail_summary_ref");
  assert.equal(summary.firstCandidateOutputKind, "ies-first-narrow-candidate-output");
  assert.equal(summary.firstManifestEntryKind, "ies_first_narrow_candidate_output_summary_ref");
  assert.equal(summary.firstRowKey, "candidate-output-artifact-materialisation-safe-row-0");
  assert.equal(summary.firstRowKind, "first_accepted_safe_run_summary");
  assert.equal(summary.firstRunKey, "candidate-output-artifact-materialisation-safe-run-0");
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
  assert.equal(summary.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(summary.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(summary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(summary.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.match(summary.iesFirstNarrowMetadataHandoffSummaryFingerprint, /^safe-ies-first-narrow-metadata-handoff-summary:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowCandidateOutputSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-summary:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-manifest-summary:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-detail-summary:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowCandidateOutputArtifactPlanSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-artifact-plan-summary:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowCandidateOutputArtifactRefSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-artifact-ref-summary:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-artifact-materialisation-summary:[0-9a-f]{40}$/);

  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
  }
  assertNoForbiddenKeys(summary);
  assertNoUnsafeText(summary);
}

test("builder joins rows, metadata, candidate-output summary, manifest, detail, artifact-plan, and artifact-ref into a materialisation-boundary summary", () => {
  const first = buildRuntimeIesFirstNarrowCandidateOutputArtifactMaterialisationSummary({
    runTableFirstNarrowRows: runTableFirstNarrowRows(),
    iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
    iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
    iesFirstNarrowCandidateOutputManifestSummary: manifestSummary(),
    iesFirstNarrowCandidateOutputDetailSummary: detailSummary(),
    iesFirstNarrowCandidateOutputArtifactPlanSummary: artifactPlanSummary(),
    iesFirstNarrowCandidateOutputArtifactRefSummary: artifactRefSummary(),
  });
  const second = buildIesFirstNarrowCandidateOutputArtifactMaterialisationSummary({
    runTableFirstNarrowRows: runTableFirstNarrowRows(),
    iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
    iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
    iesFirstNarrowCandidateOutputManifestSummary: manifestSummary(),
    iesFirstNarrowCandidateOutputDetailSummary: detailSummary(),
    iesFirstNarrowCandidateOutputArtifactPlanSummary: artifactPlanSummary(),
    iesFirstNarrowCandidateOutputArtifactRefSummary: artifactRefSummary(),
  });

  assertSummaryShape(first);
  assert.deepEqual(first, second);
});

test("writes candidate-output artifact-materialisation summary only to the shell-owned downstream slot", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context("ies-candidate-output-artifact-materialisation-slot-project"), writeContribution());

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.selectedResultPersistedSummaryWritten, false);
  assert.equal(result.runTableFirstNarrowOutputSummaryWritten, false);
  assert.equal(result.runTableFirstNarrowRowsWritten, false);
  assert.equal(result.iesFirstNarrowMetadataHandoffSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputManifestSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputDetailSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputArtifactPlanSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputArtifactRefSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryWritten, true);
  assert.equal(result.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryTarget, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_ARTIFACT_MATERIALISATION_TARGET);

  const envelope = result.envelope;
  const downstream = envelope.modules.cs_selector.downstreamContext;
  assert.deepEqual(Object.keys(downstream), ["iesFirstNarrowCandidateOutputArtifactMaterialisationSummary"]);
  assert.equal(envelope.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, undefined);
  assert.equal(envelope.project.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, undefined);
  assert.equal(envelope.project.metadata.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, undefined);
  assert.equal(envelope.project.currentProject.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, undefined);
  assert.equal(envelope.project.selection.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, undefined);
  assert.equal(envelope.shell.downstream.selector.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, undefined);
  assert.equal(envelope.modules.cs_selector.state.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, undefined);
  assertSummaryShape(downstream.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary);
});

test("can consume the just-written candidate-output artifact-ref path in the same envelope save", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("ies-candidate-output-artifact-materialisation-same-save-project"),
    writeContribution({
      artifactRef: null,
      downstream: {
        iesFirstNarrowCandidateOutputArtifactRefSummaryWrite: { writeRequested: true },
      },
    }),
  );

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.iesFirstNarrowCandidateOutputArtifactRefSummaryWritten, true);
  assert.equal(result.iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryWritten, true);
  assert.deepEqual(Object.keys(result.envelope.modules.cs_selector.downstreamContext), [
    "iesFirstNarrowCandidateOutputArtifactRefSummary",
    "iesFirstNarrowCandidateOutputArtifactMaterialisationSummary",
  ]);
  assertSummaryShape(result.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary);
});

test("fails closed when rows, metadata handoff, candidate-output summary, manifest, detail, artifact-plan, or artifact-ref are missing or not ready", () => {
  const cases = [
    ["missing-rows", { rows: null }, /dependencies|rows|not ready|did not join|source references/],
    ["not-ready-metadata", { metadata: metadataHandoffSummary({ readyForFutureCandidateOutput: false }) }, /dependencies|metadata|not ready|did not join|source references/],
    ["missing-candidate-output", { candidateOutput: null }, /dependencies|candidate output|not ready|did not join|source references/],
    ["missing-manifest", { manifest: null }, /dependencies|manifest|not ready|did not join|source references/],
    ["missing-detail", { detail: null }, /dependencies|detail|not ready|did not join|source references/],
    ["missing-artifact-plan", { artifactPlan: null }, /dependencies|artifact-plan|not ready|did not join|source references/],
    ["missing-artifact-ref", { artifactRef: null }, /artifact-ref summary|not ready|did not join|source references/],
  ];

  for (const [label, options, reasonPattern] of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-candidate-output-artifact-materialisation-${label}-project`),
      writeContribution(options),
    );
    assert.equal(result.accepted, false, label);
    assert.match(result.reason, reasonPattern, label);
    assert.equal(store.getProjectEnvelope(`ies-candidate-output-artifact-materialisation-${label}-project`), null, label);
  }
});

test("fails closed on raw IES, detail, manifest, artifact plan, artifact, materialisation, photometry, candela, base64, filename, path, and selected-result payload inputs", () => {
  const cases = [
    ["rawIesText", { rawIesText: "IESNA:LM-63-2002\nTILT=NONE" }],
    ["rawDetail", { rawDetail: { output: true } }],
    ["rawManifest", { rawManifest: { output: true } }],
    ["rawArtifactPlan", { rawArtifactPlan: { output: true } }],
    ["artifactPlanPayload", { artifactPlanPayload: { output: true } }],
    ["rawArtifact", { rawArtifact: { output: true } }],
    ["artifactPayload", { artifactPayload: { output: true } }],
    ["rawArtifactMaterialisation", { rawArtifactMaterialisation: { output: true } }],
    ["materialisedFiles", { materialisedFiles: ["candidate.ies"] }],
    ["artifactBody", { artifactBody: "not allowed" }],
    ["outputFiles", { outputFiles: ["candidate.ies"] }],
    ["rawPhotometry", { rawPhotometry: { payload: true } }],
    ["candelaGrid", { candelaGrid: [[1, 2, 3]] }],
    ["base64", { base64: "data:application/pdf;base64,AAAA" }],
    ["filename", { filename: "candidate.ies" }],
    ["localPath", { localPath: "C:\\ControlStack_RuntimeData\\private\\candidate.ies" }],
    ["selectedResultBody", { selectedResultBody: { unsafe: true } }],
  ];

  for (const [label, payload] of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-candidate-output-artifact-materialisation-unsafe-${label}`),
      writeContribution({
        downstream: {
          iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryCandidate: payload,
        },
      }),
    );
    assert.equal(result.accepted, false, label);
    assert.match(result.reason, /blocked-unsafe-raw-input|unsafe-string|not-approved/, label);
    assert.equal(result.reason.includes(label), false, label);
  }
});

test("fails closed on real generation, donor invocation, materialisation, file output, routes, POST, and mutation flags", () => {
  const cases = [
    "slugGenerationEnabled",
    "iesGenerationEnabled",
    "donorInvocationEnabled",
    "outputGenerationEnabled",
    "fileOutputEnabled",
    "manifestFileOutputEnabled",
    "detailFileOutputEnabled",
    "artifactPlanGenerationEnabled",
    "artifactPlanFileOutputEnabled",
    "artifactRefGenerationEnabled",
    "artifactRefFileOutputEnabled",
    "artifactMaterialisationEnabled",
    "artifactMaterialisationBoundaryEnabled",
    "artifactMaterialisationFileOutputEnabled",
    "artifactBodyReturned",
    "rawArtifactReturned",
    "routesAdded",
    "postEndpointsAdded",
    "runtimeDataMutationEnabled",
  ];

  for (const flag of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-candidate-output-artifact-materialisation-unsafe-flag-${flag}`),
      writeContribution({
        directWrite: {
          [flag]: true,
        },
      }),
    );
    assert.equal(result.accepted, false, flag);
    assert.match(result.reason, /blocked-unsafe-enabled-flag/);
    assert.equal(result.reason.includes(flag), false, flag);
  }
});

test("rolls back an existing project update on candidate-output artifact-materialisation summary write failure", () => {
  const store = createSavedProjectStore();
  const first = store.saveCurrentProjectEnvelope(context("ies-candidate-output-artifact-materialisation-rollback-project"), writeContribution());
  assert.equal(first.accepted, true, first.reason);
  const before = first.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary;

  const failed = store.saveCurrentProjectEnvelope(
    context("ies-candidate-output-artifact-materialisation-rollback-project"),
    writeContribution({
      downstream: {
        iesFirstNarrowCandidateOutputArtifactMaterialisationSummaryCandidate: {
          rawArtifactMaterialisation: { unsafe: true },
        },
      },
    }),
  );

  assert.equal(failed.accepted, false);
  const afterEnvelope = store.getProjectEnvelope("ies-candidate-output-artifact-materialisation-rollback-project");
  assert.deepEqual(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary, before);
  assert.equal(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputArtifactMaterialisationSummary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
});
