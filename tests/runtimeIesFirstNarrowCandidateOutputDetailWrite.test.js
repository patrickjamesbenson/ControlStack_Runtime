import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildIesFirstNarrowCandidateOutputDetailSummary,
  buildRuntimeIesFirstNarrowCandidateOutputDetailSummary,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputDetailSummary.js";
import {
  buildRuntimeIesFirstNarrowCandidateOutputManifestSummary,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputManifestSummary.js";
import {
  buildRuntimeIesFirstNarrowCandidateOutputSummary,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputSummary.js";
import {
  buildRuntimeIesFirstNarrowMetadataHandoffSummary,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowMetadataHandoffSummary.js";
import {
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROWS_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowRows.js";
import {
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runTableFirstNarrowRowShapeContract.js";

const POLICY_FINGERPRINT = "safe-policy:ies-first-narrow-candidate-output-detail-fixture";
const SOURCE_FINGERPRINT = "safe-source:ies-first-narrow-candidate-output-detail-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:ies-first-narrow-candidate-output-detail-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:ies-first-narrow-candidate-output-detail-fixture";
const SOURCE_PHOTOMETRY_REF = `safe-source-photometry-ref:${"d".repeat(40)}`;

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

function context(projectId = "ies-first-narrow-candidate-output-detail-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "IES first narrow candidate output detail project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "IES first narrow candidate output detail project",
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
    contractVersion: "ies-first-narrow-candidate-output-detail-test",
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
    photometryReferenceFingerprint: "safe-reference:ies-first-narrow-candidate-output-detail-fixture",
    oneMmPolicyLabel: "one-mm-length-policy-summary-only",
    iesPhotometryReferenceToken: "safe-ies-reference:ies-first-narrow-candidate-output-detail-fixture",
    lumenCurveReferenceToken: "safe-lumen-curve-reference:ies-first-narrow-candidate-output-detail-fixture",
    driverUtilCurveReferenceToken: "safe-driver-util-curve-reference:ies-first-narrow-candidate-output-detail-fixture",
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
        rowKey: "candidate-output-detail-safe-row-0",
        runKey: "candidate-output-detail-safe-run-0",
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

function writeContribution(options = {}) {
  const {
    downstream = {},
    directWrite = {},
    rows = runTableFirstNarrowRows(),
    metadata = metadataHandoffSummary(),
    candidateOutput = candidateOutputSummary(),
    manifest = manifestSummary(),
  } = options;
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        runTableFirstNarrowRows: rows,
        iesFirstNarrowMetadataHandoffSummary: metadata,
        iesFirstNarrowCandidateOutputSummary: candidateOutput,
        iesFirstNarrowCandidateOutputManifestSummary: manifest,
        iesFirstNarrowCandidateOutputDetailSummaryWrite: {
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
  ]) {
    assert.equal(text.includes(marker), false, marker);
  }
}

function assertSummaryShape(summary) {
  assert.deepEqual(Object.keys(summary), RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_FIELD_ORDER);
  assert.equal(summary.schemaId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.contractId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_CONTRACT_ID);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.targetKind, "project-envelope-module-downstream-context-summary-slot");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.consumerModuleId, "ies_builder");
  assert.equal(summary.state, "redacted_ies_first_narrow_candidate_output_detail_summary_persisted");
  assert.equal(summary.sourceKind, "safe-candidate-output-detail-summary");
  assert.equal(summary.futureOutputKind, "ies-first-narrow-candidate-output-detail");
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.deterministicOnly, true);
  assert.equal(summary.detailOnly, true);
  assert.equal(summary.candidateOutputOnly, true);
  assert.equal(summary.productionProof, false);
  assert.equal(summary.labProofAuthority, false);
  assert.equal(summary.sourceBacked, true);
  assert.equal(summary.sourceAnchorOnly, true);
  assert.equal(summary.opaqueReferenceOnly, true);
  assert.equal(summary.runTableFirstNarrowRowsReady, true);
  assert.equal(summary.iesFirstNarrowMetadataHandoffReady, true);
  assert.equal(summary.iesFirstNarrowCandidateOutputSummaryReady, true);
  assert.equal(summary.iesFirstNarrowCandidateOutputManifestSummaryReady, true);
  assert.equal(summary.readyForDetailBoundary, true);
  assert.equal(summary.readyForFutureOutput, true);
  assert.equal(summary.detailsJoined, true);
  assert.equal(summary.sourceRowsIncluded, false);
  assert.equal(summary.candidateOutputDetailsIncluded, true);
  assert.equal(summary.artifactListIncluded, false);
  assert.equal(summary.sourceRunTableRowCount, 1);
  assert.equal(summary.candidateOutputRecordCount, 1);
  assert.equal(summary.manifestRecordCount, 1);
  assert.equal(summary.detailRecordCount, 1);
  assert.equal(summary.detailEntryCount, 1);
  assert.equal(summary.firstDetailEntryKind, "ies_first_narrow_candidate_output_detail_summary_ref");
  assert.equal(summary.firstCandidateOutputKind, "ies-first-narrow-candidate-output");
  assert.equal(summary.firstManifestEntryKind, "ies_first_narrow_candidate_output_summary_ref");
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
  assert.equal(summary.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(summary.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(summary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(summary.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.equal(summary.runTableFirstNarrowRowsSchemaId, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID);
  assert.equal(summary.runTableFirstNarrowRowsSchemaVersion, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION);
  assert.equal(summary.runTableFirstNarrowRowsState, RUNTABLE_FIRST_NARROW_ROWS_STATES.ready);
  assert.equal(summary.iesFirstNarrowMetadataHandoffContractId, RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID);
  assert.equal(summary.iesFirstNarrowMetadataHandoffSchemaId, RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID);
  assert.equal(summary.iesFirstNarrowMetadataHandoffSchemaVersion, RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.iesFirstNarrowMetadataHandoffState, "redacted_ies_first_narrow_metadata_handoff_summary_persisted");
  assert.match(summary.iesFirstNarrowMetadataHandoffSummaryFingerprint, /^safe-ies-first-narrow-metadata-handoff-summary:[0-9a-f]{40}$/);
  assert.equal(summary.iesFirstNarrowCandidateOutputContractId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_CONTRACT_ID);
  assert.equal(summary.iesFirstNarrowCandidateOutputSchemaId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_ID);
  assert.equal(summary.iesFirstNarrowCandidateOutputSchemaVersion, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.iesFirstNarrowCandidateOutputState, "redacted_ies_first_narrow_candidate_output_summary_persisted");
  assert.match(summary.iesFirstNarrowCandidateOutputSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-summary:[0-9a-f]{40}$/);
  assert.equal(summary.iesFirstNarrowCandidateOutputManifestContractId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_CONTRACT_ID);
  assert.equal(summary.iesFirstNarrowCandidateOutputManifestSchemaId, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_ID);
  assert.equal(summary.iesFirstNarrowCandidateOutputManifestSchemaVersion, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_MANIFEST_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.iesFirstNarrowCandidateOutputManifestState, "redacted_ies_first_narrow_candidate_output_manifest_summary_persisted");
  assert.match(summary.iesFirstNarrowCandidateOutputManifestSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-manifest-summary:[0-9a-f]{40}$/);
  assert.match(summary.iesFirstNarrowCandidateOutputDetailSummaryFingerprint, /^safe-ies-first-narrow-candidate-output-detail-summary:[0-9a-f]{40}$/);

  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
  }
  assertNoForbiddenKeys(summary);
  assertNoUnsafeText(summary);
}

test("builder joins rows, metadata, candidate-output summary, and manifest into a detail summary", () => {
  const first = buildRuntimeIesFirstNarrowCandidateOutputDetailSummary({
    runTableFirstNarrowRows: runTableFirstNarrowRows(),
    iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
    iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
    iesFirstNarrowCandidateOutputManifestSummary: manifestSummary(),
  });
  const second = buildIesFirstNarrowCandidateOutputDetailSummary({
    runTableFirstNarrowRows: runTableFirstNarrowRows(),
    iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary(),
    iesFirstNarrowCandidateOutputSummary: candidateOutputSummary(),
    iesFirstNarrowCandidateOutputManifestSummary: manifestSummary(),
  });

  assertSummaryShape(first);
  assert.deepEqual(first, second);
});

test("writes candidate-output detail summary only to the shell-owned downstream slot", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context("ies-candidate-output-detail-slot-project"), writeContribution());

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.selectedResultPersistedSummaryWritten, false);
  assert.equal(result.runTableFirstNarrowOutputSummaryWritten, false);
  assert.equal(result.runTableFirstNarrowRowsWritten, false);
  assert.equal(result.iesFirstNarrowMetadataHandoffSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputManifestSummaryWritten, false);
  assert.equal(result.iesFirstNarrowCandidateOutputDetailSummaryWritten, true);
  assert.equal(result.iesFirstNarrowCandidateOutputDetailSummaryTarget, RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_DETAIL_TARGET);

  const envelope = result.envelope;
  const downstream = envelope.modules.cs_selector.downstreamContext;
  assert.deepEqual(Object.keys(downstream), ["iesFirstNarrowCandidateOutputDetailSummary"]);
  assert.equal(envelope.iesFirstNarrowCandidateOutputDetailSummary, undefined);
  assert.equal(envelope.project.iesFirstNarrowCandidateOutputDetailSummary, undefined);
  assert.equal(envelope.project.metadata.iesFirstNarrowCandidateOutputDetailSummary, undefined);
  assert.equal(envelope.project.currentProject.iesFirstNarrowCandidateOutputDetailSummary, undefined);
  assert.equal(envelope.project.selection.iesFirstNarrowCandidateOutputDetailSummary, undefined);
  assert.equal(envelope.shell.downstream.selector.iesFirstNarrowCandidateOutputDetailSummary, undefined);
  assert.equal(envelope.modules.cs_selector.state.iesFirstNarrowCandidateOutputDetailSummary, undefined);
  assertSummaryShape(downstream.iesFirstNarrowCandidateOutputDetailSummary);
});

test("can consume the just-written candidate-output manifest path in the same envelope save", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("ies-candidate-output-detail-same-save-project"),
    writeContribution({
      manifest: null,
      downstream: {
        iesFirstNarrowCandidateOutputManifestSummaryWrite: { writeRequested: true },
      },
    }),
  );

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.iesFirstNarrowCandidateOutputManifestSummaryWritten, true);
  assert.equal(result.iesFirstNarrowCandidateOutputDetailSummaryWritten, true);
  assert.deepEqual(Object.keys(result.envelope.modules.cs_selector.downstreamContext), [
    "iesFirstNarrowCandidateOutputManifestSummary",
    "iesFirstNarrowCandidateOutputDetailSummary",
  ]);
  assertSummaryShape(result.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputDetailSummary);
});

test("fails closed when rows, metadata handoff, candidate-output summary, or manifest are missing or not ready", () => {
  const cases = [
    ["missing-rows", { rows: null }, /rows|source references|did not join|not ready/],
    ["not-ready-metadata", { metadata: metadataHandoffSummary({ readyForFutureCandidateOutput: false }) }, /metadata|source references|did not join|not ready/],
    ["missing-candidate-output", { candidateOutput: null }, /candidate output summary|source references|did not join|not ready/],
    ["missing-manifest", { manifest: null }, /manifest summary|source references|did not join|not ready/],
  ];

  for (const [label, options, reasonPattern] of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-candidate-output-detail-${label}-project`),
      writeContribution(options),
    );
    assert.equal(result.accepted, false, label);
    assert.match(result.reason, reasonPattern, label);
    assert.equal(store.getProjectEnvelope(`ies-candidate-output-detail-${label}-project`), null, label);
  }
});

test("fails closed on raw IES, detail, manifest, photometry, candela, base64, filename, path, and selected-result payload inputs", () => {
  const cases = [
    ["rawIesText", { rawIesText: "IESNA:LM-63-2002\nTILT=NONE" }],
    ["rawDetail", { rawDetail: { output: true } }],
    ["detailPayload", { detailPayload: { output: true } }],
    ["rawManifest", { rawManifest: { output: true } }],
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
      context(`ies-candidate-output-detail-unsafe-${label}`),
      writeContribution({
        downstream: {
          iesFirstNarrowCandidateOutputDetailSummaryCandidate: payload,
        },
      }),
    );
    assert.equal(result.accepted, false, label);
    assert.match(result.reason, /blocked-unsafe-raw-input|unsafe-string|not-approved/, label);
    assert.equal(result.reason.includes(label), false, label);
  }
});

test("fails closed on real generation, donor invocation, detail file output, routes, POST, and mutation flags", () => {
  const cases = [
    "slugGenerationEnabled",
    "iesGenerationEnabled",
    "donorInvocationEnabled",
    "outputGenerationEnabled",
    "fileOutputEnabled",
    "manifestFileOutputEnabled",
    "detailFileOutputEnabled",
    "routesAdded",
    "postEndpointsAdded",
    "runtimeDataMutationEnabled",
  ];

  for (const flag of cases) {
    const store = createSavedProjectStore();
    const result = store.saveCurrentProjectEnvelope(
      context(`ies-candidate-output-detail-unsafe-flag-${flag}`),
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

test("rolls back an existing project update on candidate-output detail summary write failure", () => {
  const store = createSavedProjectStore();
  const first = store.saveCurrentProjectEnvelope(context("ies-candidate-output-detail-rollback-project"), writeContribution());
  assert.equal(first.accepted, true, first.reason);
  const before = first.envelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputDetailSummary;

  const failed = store.saveCurrentProjectEnvelope(
    context("ies-candidate-output-detail-rollback-project"),
    writeContribution({
      downstream: {
        iesFirstNarrowCandidateOutputDetailSummaryCandidate: {
          rawDetail: { unsafe: true },
        },
      },
    }),
  );

  assert.equal(failed.accepted, false);
  const afterEnvelope = store.getProjectEnvelope("ies-candidate-output-detail-rollback-project");
  assert.deepEqual(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputDetailSummary, before);
  assert.equal(afterEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputDetailSummary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
});
