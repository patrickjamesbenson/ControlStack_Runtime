import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  IES_BUILDER_STATUS_PATH,
  IES_BUILDER_HANDOFF_STATES,
  buildIesBuilderSelectedResultHandoffContract,
  buildIesBuilderStatus,
} from "../packages/workspace-kernel/iesBuilderStatusService.js";
import { adaptEngineRunTableSelectedResultToProjection } from "../packages/workspace-kernel/engineRunTableSelectedResultAdapter.js";
import { createIesBuilderViewModel } from "../packages/modules/ies-builder/iesBuilderViewModel.js";

const REQUIRED_BOUNDARY_WARNINGS = Object.freeze([
  "IES Builder is read-only and diagnostic in this slice.",
  "IES Builder is candidate-output-only and does not provide production proof.",
  "IES Builder must wait for a selected Engine/RunTable result before real candidate generation.",
  "IES Builder does not own actual build geometry; Engine/RunTable owns run length, segments, board runs, zones, driver/control topology, and accepted family/subset locks.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
  "Raw IES text, raw candela grids, raw photometry payloads, raw Engine payloads, raw Board Data rows, Lab evidence, PDFs, artefacts, and base64 polar plots stay hidden.",
]);

const REQUIRED_CANDIDATE_BOUNDARY_COPY = Object.freeze([
  "IES Builder candidate readiness is diagnostic only in this slice.",
  "No IES file is generated, parsed, uploaded, previewed, or exported here.",
  "An IES candidate is not Lab Proof.",
  "Photometric candidate output must not be treated as production proof.",
  "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
  "IES Builder is candidate-output-only in this slice.",
  "IES Builder does not own actual build geometry.",
  "Engine/RunTable owns run length, segments, board runs, zones, driver/control topology, and selected family/subset locks.",
  "The main readiness blocker is the missing selected Engine/RunTable result.",
  "1mm policy is metadata only: oneMmNormalised true, baseLengthM 0.001, and photometryMode normalise_1mm_candidate.",
  "Lab Proof proves later; IES Builder does not claim proof authority.",
  "Raw artefacts are hidden and only opaque future refs may be displayed.",
]);

const REQUIRED_CONTRACT_BOUNDARY_COPY = Object.freeze([
  "IES Builder is candidate-output-only in this slice.",
  "IES Builder does not own actual build geometry.",
  "Engine/RunTable owns run length, segments, board runs, zones, driver/control topology, and selected family/subset locks.",
  "The main readiness blocker is the missing selected Engine/RunTable result.",
  "1mm policy is metadata only: oneMmNormalised true, baseLengthM 0.001, and photometryMode normalise_1mm_candidate.",
  "Lab Proof proves later; IES Builder does not claim proof authority.",
  "Raw artefacts are hidden and only opaque future refs may be displayed.",
]);

const REQUIRED_CANDIDATE_READINESS_REQUIREMENTS = Object.freeze([
  "Selector candidate state present",
  "selected Engine/RunTable result present",
  "selected family/subset lock available",
  "product/body intent resolved",
  "run summary shape available",
  "board run and zone summary available",
  "driver/control topology resolved",
  "photometric template/source identified as opaque ref",
  "Board Data reference present as opaque metadata ref",
  "1mm normalisation policy identified",
  "beam direction / mirror / regrid / scale policies labelled only",
  "Lab Proof boundary clearly separated",
  "human review warning surfaced",
]);

const REQUIRED_CANDIDATE_STATES = Object.freeze([
  "waiting_for_selected_engine_runtable_result",
  "not ready",
  "missing selector candidate",
  "missing selected Engine/RunTable result",
  "missing selected family/subset lock",
  "missing board data reference",
  "missing photometric source",
  "candidate input ready",
  "candidate-only output possible later",
  "requires review",
  "requires Lab Proof before production claim",
]);

const REQUIRED_CANDIDATE_FLAG_ROWS = Object.freeze([
  ["readOnly", "true"],
  ["diagnosticOnly", "true"],
  ["candidateReadinessExplanationOnly", "true"],
  ["candidateOutputOnly", "true"],
  ["productionProof", "false"],
  ["labProofAuthority", "false"],
  ["selectedResultRequired", "true"],
  ["selectedResultAvailable", "false"],
  ["iesGenerationEnabled", "false"],
  ["iesUploadEnabled", "false"],
  ["iesParseEnabled", "false"],
  ["iesExportEnabled", "false"],
  ["polarPreviewEnabled", "false"],
  ["selectorMutationEnabled", "false"],
  ["boardDataWriteEnabled", "false"],
  ["engineExecutionEnabled", "false"],
  ["runTableGenerationEnabled", "false"],
  ["payloadGenerationEnabled", "false"],
  ["drawingGenerationEnabled", "false"],
  ["hiddenWriteBackEnabled", "false"],
]);

const SAFE_SOURCE_PHOTOMETRY_REF = `safe-source-photometry-ref:${"a".repeat(40)}`;

function safePhotometryReferenceSummary(overrides = {}) {
  return {
    ok: true,
    photometryReferenceSummaryReady: true,
    sourcePhotometryStatus: "opaque_reference_summary_ready",
    sourcePhotometryRef: SAFE_SOURCE_PHOTOMETRY_REF,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    opaqueReferenceOnly: true,
    sourceAnchorOnly: true,
    sourceBacked: true,
    sourceFingerprint: "safe-source:ies-builder-status-fixture",
    policyFingerprint: "safe-policy:ies-builder-status-fixture",
    sourceInputFingerprint: "safe-source-input:ies-builder-status-fixture",
    boardDataSourceVersion: "safe-board-data-source-version:ies-builder-status-fixture",
    photometryReferenceFingerprint: "safe-photometry-reference:ies-builder-status-fixture",
    oneMmPolicyLabel: "one-mm-length-policy-summary-only",
    iesPhotometryReferenceToken: "safe-ies-photometry-reference:ies-builder-status-fixture",
    lumenCurveReferenceSummary: {
      curveReferenceToken: "safe-lumen-curve-reference:ies-builder-status-fixture",
    },
    driverUtilCurveReferenceSummary: {
      curveReferenceToken: "safe-driver-util-curve-reference:ies-builder-status-fixture",
    },
    ...overrides,
  };
}

function completeAcceptedSelectedResultInput(overrides = {}) {
  const base = {
    oneSuccessfulAcceptedResult: true,
    accepted: true,
    engineVerified: true,
    resultStateLabel: "Engine verified",
    selectedTierOrProfile: "business",
    selectedReason: "Best compliant balance of target output, thermal margin, efficiency and manufacturing simplicity.",
    selectedFamilySubsetLock: {
      boardFamily: "Linear 560 280 140",
      pitchFamily: "Pitch 35",
      opticCurrentAssumptions: "3000K 80CRI 350mA",
      zoneSplitStrategy: "balanced zones",
      driverFamily: "DALI driver family",
    },
    sourceInputFingerprint: "sha256-safe-selector-fingerprint",
    boardDataSourceVersion: "board-data-v1",
    perRunLookupByRunIdOrNumber: {
      "run-1": { marker: "lookup-id-do-not-emit" },
      "1": { marker: "lookup-number-do-not-emit" },
      "safe-run-key": { marker: "lookup-key-do-not-emit" },
    },
    runs: [
      {
        id: "run-1",
        runKey: "safe-run-key",
        runNumber: 1,
        runLabel: "Run 1",
        runLengthMm: 1200,
        bodyMmRequested: 1140,
        segments: [{ marker: "segment-do-not-emit" }],
        reservedRanges: [],
        boardRun: {
          strategy: "selected donor summary",
          usedLengthMm: 1120,
          remainderMm: 20,
          slackMm: 20,
          exactFill: false,
          boards: [{ marker: "board-row-do-not-emit" }],
        },
        boardCount: 2,
        boardFamily: "Linear 560 280 140",
        sanitisedWarnings: ["safe warning"],
        zonePlanSummary: { state: "future zone summary" },
        mechanicalSummary: { state: "future mechanical summary" },
      },
    ],
    rough_electrical_payload: { marker: "rough-electrical-payload-do-not-emit" },
    rawEnginePayload: { marker: "raw-engine-payload-do-not-emit" },
    rawIesText: "TILT=NONE raw-ies-do-not-emit",
    rawCandelaGrid: [["candela-grid-do-not-emit"]],
    rawPhotometryPayload: { marker: "photometry-payload-do-not-emit" },
    rawLabEvidence: { marker: "lab-evidence-do-not-emit" },
    pdfRef: "private-proof-do-not-emit.pdf",
    base64PolarPlot: "data:image/png;base64,polar-do-not-emit",
    privateFilePath: "C:\\ControlStack\\private\\do-not-emit.ies",
    usersRows: [{ marker: "users-row-do-not-emit" }],
    providerId: "provider-id-do-not-emit",
  };

  return {
    ...base,
    ...overrides,
    selectedFamilySubsetLock: overrides.selectedFamilySubsetLock === undefined
      ? base.selectedFamilySubsetLock
      : overrides.selectedFamilySubsetLock,
    perRunLookupByRunIdOrNumber: overrides.perRunLookupByRunIdOrNumber === undefined
      ? base.perRunLookupByRunIdOrNumber
      : overrides.perRunLookupByRunIdOrNumber,
    runs: overrides.runs === undefined ? base.runs : overrides.runs,
  };
}

function acceptedSelectedResultProjection(overrides = {}, projectionOverrides = {}) {
  return {
    ...adaptEngineRunTableSelectedResultToProjection(completeAcceptedSelectedResultInput(overrides)),
    sourcePhotometryRef: projectionOverrides.sourcePhotometryRef === undefined
      ? "opaque-photometry-ref-do-not-emit.ies"
      : projectionOverrides.sourcePhotometryRef,
    ...projectionOverrides,
  };
}

function blockerCodes(contract) {
  return contract.blockers.map((entry) => entry.code);
}

function assertHandoffSafety(contract) {
  assert.equal(contract.readOnly, true);
  assert.equal(contract.candidateOutputOnly, true);
  assert.equal(contract.productionProof, false);
  assert.equal(contract.labProofAuthority, false);
  assert.equal(contract.safetyFlags.iesUploadEnabled, false);
  assert.equal(contract.safetyFlags.iesParseEnabled, false);
  assert.equal(contract.safetyFlags.iesExportEnabled, false);
  assert.equal(contract.safetyFlags.iesGenerationEnabled, false);
  assert.equal(contract.safetyFlags.polarPreviewEnabled, false);
  assert.equal(contract.safetyFlags.engineExecutionEnabled, false);
  assert.equal(contract.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(contract.safetyFlags.payloadGenerationEnabled, false);
  assert.equal(contract.safetyFlags.selectorMutationEnabled, false);
  assert.equal(contract.safetyFlags.boardDataMutationEnabled, false);
  assert.equal(contract.safetyFlags.labProofMutationEnabled, false);
  assert.equal(contract.safetyFlags.complianceApprovalEnabled, false);
  assert.equal(contract.safetyFlags.rawExposureEnabled, false);
  assert.equal(contract.safetyFlags.routesAdded, false);
  assert.equal(contract.safetyFlags.postEndpointsAdded, false);
  assert.equal(contract.redactionFlags.rawIesExposed, false);
  assert.equal(contract.redactionFlags.rawCandelaGridExposed, false);
  assert.equal(contract.redactionFlags.rawPhotometryPayloadExposed, false);
  assert.equal(contract.redactionFlags.rawEnginePayloadExposed, false);
  assert.equal(contract.redactionFlags.rawSelectedEnginePayloadExposed, false);
  assert.equal(contract.redactionFlags.rawRoughElectricalPayloadExposed, false);
  assert.equal(contract.redactionFlags.rawLabEvidenceExposed, false);
  assert.equal(contract.redactionFlags.rawArtefactsExposed, false);
  assert.equal(contract.redactionFlags.rawPdfsExposed, false);
  assert.equal(contract.redactionFlags.base64PolarPlotsExposed, false);
  assert.equal(contract.redactionFlags.localPathsExposed, false);
  assert.equal(contract.redactionFlags.filenamesExposed, false);
  assert.equal(contract.candidateArtefactRefs.opaqueRefsOnly, true);
  assert.equal(contract.candidateArtefactRefs.iesCandidateRef, null);
  assert.equal(contract.candidateArtefactRefs.polarPreviewRef, null);
  assert.equal(contract.candidateArtefactRefs.pdfRef, null);
}

function assertSafeBoundaryFlags(status) {
  assert.equal(status.readOnly, true);
  assert.equal(status.diagnosticOnly, true);
  assert.equal(status.candidateOutputOnly, true);
  assert.equal(status.productionProof, false);
  assert.equal(status.productionProofAuthority, false);
  assert.equal(status.labApprovalRequired, true);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.selectedResultRequired, true);
  assert.equal(status.selectedResultAvailable, false);
  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.boardDataWritesEnabled, false);
  assert.equal(status.boardDataMutationEnabled, false);
  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.uploadEnabled, false);
  assert.equal(status.parseEnabled, false);
  assert.equal(status.parseUploadEnabled, false);
  assert.equal(status.exportEnabled, false);
  assert.equal(status.polarPreviewEnabled, false);
  assert.equal(status.engineExecutionEnabled, false);
  assert.equal(status.runTableGenerationEnabled, false);
  assert.equal(status.payloadGenerationEnabled, false);
  assert.equal(status.proofClaimsEmitted, false);
  assert.equal(status.rawIesExposed, false);
  assert.equal(status.rawCandelaGridExposed, false);
  assert.equal(status.rawPhotometryPayloadExposed, false);
  assert.equal(status.rawEnginePayloadExposed, false);
  assert.equal(status.rawSelectedEnginePayloadExposed, false);
  assert.equal(status.rawBoardDataRowsExposed, false);
  assert.equal(status.rawLabEvidenceExposed, false);
  assert.equal(status.rawArtefactsExposed, false);
  assert.equal(status.rawPdfsExposed, false);
  assert.equal(status.base64PolarPlotsExposed, false);
  assert.equal(status.localPathsExposed, false);
  assert.equal(status.repoPathsExposed, false);
  assert.equal(status.filenamesExposed, false);
  assert.equal(status.credentialsExposed, false);
  assert.equal(status.usersExposed, false);
  assert.equal(status.providerDetailsExposed, false);
  assert.equal(status.donorPythonMounted, false);
  assert.equal(status.donorCodeMounted, false);
  assert.equal(status.largeDependenciesAdded, false);
  assert.equal(status.googleSyncEnabled, false);
  assert.equal(status.activeSnapshotWriteEnabled, false);
  assert.equal(status.materialisedSnapshotWriteEnabled, false);
  assert.equal(status.noWritesAttempted, true);
  assert.equal(status.postEndpointsEnabled, false);
  assert.equal(status.proofStatus, "not_proof_authority");
}

test("/api/ies-builder/status service shape is safe", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.ok, true);
  assert.equal(status.endpoint, IES_BUILDER_STATUS_PATH);
  assert.equal(status.owner, "runtime-server");
  assert.equal(status.moduleId, "ies_builder");
  assert.equal(status.label, "IES Builder / Photometry");
  assertSafeBoundaryFlags(status);
  assert.deepEqual(status.warnings, REQUIRED_BOUNDARY_WARNINGS);
});

test("required IES Builder boundary flags are present and locked", () => {
  const status = buildIesBuilderStatus();

  assertSafeBoundaryFlags(status);
});

test("IES candidate-output contract/status model renders safe metadata only", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.schema.schemaId, "controlstack.ies_builder.candidate_output_contract.v1");
  assert.equal(status.schema.surface, "read_only_candidate_output_status");
  assert.ok(status.schema.fields.includes("schema"));
  assert.ok(status.schema.fields.includes("candidateState"));
  assert.ok(status.schema.fields.includes("sourceRefs"));
  assert.ok(status.schema.fields.includes("runSummaryShape"));
  assert.ok(status.schema.fields.includes("photometryMetadataShape"));
  assert.ok(status.schema.fields.includes("candidateArtefactRefs"));
  assert.ok(status.schema.fields.includes("redactionFlags"));
  assert.equal(status.contractOnly, true);
  assert.equal(status.candidateState.state, "waiting_for_selected_engine_runtable_result");
  assert.equal(status.candidateState.ready, false);
  assert.equal(status.candidateState.selectedResultRequired, true);
  assert.equal(status.candidateState.selectedResultAvailable, false);
  assert.equal(status.mainReadinessBlocker, "selected-engine-runtable-result-required");
  assert.deepEqual(status.contractBoundaryCopy, REQUIRED_CONTRACT_BOUNDARY_COPY);
});

test("main blocker says selected Engine/RunTable result is required", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.readinessBlockers.length, 1);
  assert.equal(status.readinessBlockers[0].code, "selected-engine-runtable-result-required");
  assert.equal(status.readinessBlockers[0].severity, "blocking");
  assert.match(status.readinessBlockers[0].reason, /selected Engine\/RunTable result/);
  assert.equal(status.readinessBlockers[0].owner, "Engine/RunTable selected-result source");
});

test("1mm policy is metadata-only and exposes no raw candela or IES content", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.geometryPolicy.owner, "Engine/RunTable selected result");
  assert.equal(status.geometryPolicy.iesBuilderOwnsActualBuildGeometry, false);
  assert.ok(status.geometryPolicy.engineRunTableOwns.includes("run length"));
  assert.ok(status.geometryPolicy.engineRunTableOwns.includes("segments"));
  assert.ok(status.geometryPolicy.engineRunTableOwns.includes("board runs"));
  assert.ok(status.geometryPolicy.engineRunTableOwns.includes("zones"));
  assert.ok(status.geometryPolicy.engineRunTableOwns.includes("driver/control topology"));
  assert.equal(status.geometryPolicy.oneMmNormalised, true);
  assert.equal(status.geometryPolicy.baseLengthM, 0.001);
  assert.equal(status.geometryPolicy.photometryMode, "normalise_1mm_candidate");
  assert.equal(status.geometryPolicy.beamDirection, "placeholder_pending_selected_result");
  assert.equal(status.geometryPolicy.mirrorPolicy, "policy_label_only_pending_selected_result");
  assert.equal(status.geometryPolicy.regridPolicy, "policy_label_only_pending_selected_result");
  assert.equal(status.geometryPolicy.scalePolicy, "scale_to_1mm_metadata_only_no_raw_grid");
  assert.equal(status.geometryPolicy.rawCandelaGridExposed, false);
  assert.equal(status.geometryPolicy.rawIesContentExposed, false);
  assert.equal(status.photometryMetadataShape.oneMmNormalised, true);
  assert.equal(status.photometryMetadataShape.baseLengthM, 0.001);
  assert.equal(status.photometryMetadataShape.rawCandelaGridExposed, false);
  assert.equal(status.photometryMetadataShape.rawPhotometryPayloadExposed, false);
});

test("candidate source refs and artefact refs are opaque placeholders only", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.sourceRefs.refsAreOpaque, true);
  assert.equal(status.sourceRefs.rawRefsExposed, false);
  assert.equal(status.selectedFamilySubsetLockPlaceholder.status, "not_locked_until_selected_result");
  assert.equal(status.selectedFamilySubsetLockPlaceholder.sourceRequired, "selected Engine/RunTable result");
  assert.equal(status.selectedFamilySubsetLockPlaceholder.boardFamily, null);
  assert.equal(status.runSummaryShape.runLengthMm, null);
  assert.equal(status.runSummaryShape.boardRunSummary, null);
  assert.equal(status.runSummaryShape.zonePlanSummary, null);
  assert.equal(status.runSummaryShape.driverControlTopologySummary, null);
  assert.equal(status.candidateArtefactRefs.opaqueRefsOnly, true);
  assert.equal(status.candidateArtefactRefs.iesCandidateRef, null);
  assert.equal(status.candidateArtefactRefs.rawIesTextExposed, false);
  assert.equal(status.candidateArtefactRefs.rawArtefactPayloadExposed, false);
  assert.equal(status.candidateArtefactRefs.base64PolarPlotsExposed, false);
});

test("redaction flags block raw IES, candela, photometry, Engine payload, Board Data rows, Lab evidence, and private details", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.redactionFlags.rawIesExposed, false);
  assert.equal(status.redactionFlags.rawCandelaGridExposed, false);
  assert.equal(status.redactionFlags.rawPhotometryPayloadExposed, false);
  assert.equal(status.redactionFlags.rawEnginePayloadExposed, false);
  assert.equal(status.redactionFlags.rawSelectedEnginePayloadExposed, false);
  assert.equal(status.redactionFlags.rawBoardDataRowsExposed, false);
  assert.equal(status.redactionFlags.rawBoardDataHeadersExposed, false);
  assert.equal(status.redactionFlags.rawLabEvidenceExposed, false);
  assert.equal(status.redactionFlags.rawArtefactsExposed, false);
  assert.equal(status.redactionFlags.rawPdfsExposed, false);
  assert.equal(status.redactionFlags.base64PolarPlotsExposed, false);
  assert.equal(status.redactionFlags.localPathsExposed, false);
  assert.equal(status.redactionFlags.repoPathsExposed, false);
  assert.equal(status.redactionFlags.filenamesExposed, false);
  assert.equal(status.redactionFlags.credentialsExposed, false);
  assert.equal(status.redactionFlags.usersExposed, false);
  assert.equal(status.redactionFlags.providerDetailsExposed, false);
});

test("no selected result keeps IES Builder handoff blocked", () => {
  const status = buildIesBuilderStatus();
  const contract = status.handoffContract;

  assert.equal(status.handoffState, "waiting_for_selected_engine_runtable_result");
  assert.equal(contract.schemaId, "controlstack.ies_builder.selected_result_handoff_contract.v1");
  assert.equal(contract.handoffState, "waiting_for_selected_engine_runtable_result");
  assert.equal(contract.ready, false);
  assert.ok(IES_BUILDER_HANDOFF_STATES.includes(contract.handoffState));
  assert.deepEqual(blockerCodes(contract), ["waiting-for-selected-engine-runtable-result"]);
  assert.equal(contract.selectedResultStateSummary.selectedResultAvailable, false);
  assertHandoffSafety(contract);
});

test("accepted selected-result fixture makes metadata ready for future candidate output only", () => {
  const projection = acceptedSelectedResultProjection();
  const status = buildIesBuilderStatus({ selectedResultProjection: projection });
  const contract = buildIesBuilderSelectedResultHandoffContract(projection);

  assert.equal(status.handoffState, "metadata_ready_for_future_candidate_output");
  assert.equal(status.selectedResultAvailable, true);
  assert.equal(contract.handoffState, "metadata_ready_for_future_candidate_output");
  assert.equal(contract.ready, true);
  assert.deepEqual(contract.blockers, []);
  assert.equal(contract.selectedResultStateSummary.selectedResultAvailable, true);
  assert.equal(contract.selectedResultStateSummary.accepted, true);
  assert.equal(contract.selectedResultStateSummary.engineVerified, true);
  assert.equal(contract.selectedResultStateSummary.stale, false);
  assert.equal(contract.selectedResultStateSummary.runCount, 1);
  assert.equal(contract.selectedFamilySubsetLockReadiness.ready, true);
  assert.equal(contract.perRunLookupReadiness.ready, true);
  assert.equal(contract.boardDataSourceVersionReadiness.ready, true);
  assert.equal(contract.sourceInputFingerprintReadiness.ready, true);
  assert.equal(contract.sourcePhotometryRefReadiness.ready, true);
  assert.equal(contract.sourcePhotometryRefReadiness.sourcePhotometryRef, "opaque-source-photometry-ref-present");
  assert.equal(contract.productionProof, false);
  assert.equal(contract.labProofAuthority, false);
  assertHandoffSafety(contract);
});

test("stale selected result blocks IES handoff", () => {
  const projection = acceptedSelectedResultProjection({ stale: true });
  const contract = buildIesBuilderSelectedResultHandoffContract(projection);

  assert.equal(contract.handoffState, "blocked_selected_result_stale");
  assert.equal(contract.ready, false);
  assert.ok(blockerCodes(contract).includes("selected-result-stale"));
  assert.equal(contract.sourceInputFingerprintReadiness.staleComparisonImplemented, false);
  assert.equal(contract.sourceInputFingerprintReadiness.staleResultComparisonAttempted, false);
  assertHandoffSafety(contract);
});

test("missing selectedFamilySubsetLock blocks IES handoff", () => {
  const projection = acceptedSelectedResultProjection({}, { selectedFamilySubsetLock: null });
  const contract = buildIesBuilderSelectedResultHandoffContract(projection);

  assert.equal(contract.handoffState, "blocked_missing_family_subset_lock");
  assert.equal(contract.selectedFamilySubsetLockReadiness.ready, false);
  assert.ok(blockerCodes(contract).includes("missing-selected-family-subset-lock"));
  assertHandoffSafety(contract);
});

test("missing perRunLookupNormalised blocks IES handoff", () => {
  const projection = acceptedSelectedResultProjection({}, { perRunLookupNormalised: false });
  const contract = buildIesBuilderSelectedResultHandoffContract(projection);

  assert.equal(contract.handoffState, "blocked_selected_result_unavailable");
  assert.equal(contract.perRunLookupReadiness.ready, false);
  assert.ok(blockerCodes(contract).includes("missing-per-run-lookup-normalised"));
  assertHandoffSafety(contract);
});

test("missing boardDataSourceVersion blocks IES handoff", () => {
  const projection = acceptedSelectedResultProjection({ boardDataSourceVersion: null });
  const contract = buildIesBuilderSelectedResultHandoffContract(projection);

  assert.equal(contract.handoffState, "blocked_selected_result_unavailable");
  assert.equal(contract.boardDataSourceVersionReadiness.ready, false);
  assert.ok(blockerCodes(contract).includes("missing-board-data-source-version"));
  assertHandoffSafety(contract);
});

test("missing sourceInputFingerprint blocks IES handoff", () => {
  const projection = acceptedSelectedResultProjection({ sourceInputFingerprint: null });
  const contract = buildIesBuilderSelectedResultHandoffContract(projection);

  assert.equal(contract.handoffState, "blocked_selected_result_unavailable");
  assert.equal(contract.sourceInputFingerprintReadiness.ready, false);
  assert.ok(blockerCodes(contract).includes("missing-source-input-fingerprint"));
  assertHandoffSafety(contract);
});

test("missing sourcePhotometryRef remains blocked and opaque-placeholder only when present", () => {
  const missing = buildIesBuilderSelectedResultHandoffContract(acceptedSelectedResultProjection({}, { sourcePhotometryRef: null }));
  const present = buildIesBuilderSelectedResultHandoffContract(acceptedSelectedResultProjection({}, { sourcePhotometryRef: "C:\\ControlStack\\photometry\\private-source.ies" }));

  assert.equal(missing.handoffState, "blocked_missing_source_photometry_ref");
  assert.equal(missing.sourcePhotometryRefReadiness.ready, false);
  assert.ok(blockerCodes(missing).includes("missing-source-photometry-ref"));
  assert.equal(present.sourcePhotometryRefReadiness.ready, true);
  assert.equal(present.sourcePhotometryRefReadiness.sourcePhotometryRef, "opaque-source-photometry-ref-present");
  assert.equal(JSON.stringify(present).includes("private-source.ies"), false);
  assertHandoffSafety(missing);
  assertHandoffSafety(present);
});

test("status upgrades placeholder source photometry metadata to real opaque source ref when safe anchor is supplied", () => {
  const status = buildIesBuilderStatus({
    selectedResultProjection: acceptedSelectedResultProjection(),
    safePhotometryReferenceSummary: safePhotometryReferenceSummary(),
  });

  assert.equal(status.sourcePhotometryRefHandoffSummary.ok, true);
  assert.equal(status.sourcePhotometryRefHandoffSummary.handoffReady, true);
  assert.equal(status.sourcePhotometryRefHandoffSummary.sourcePhotometryStatus, "real_source_ref_ready");
  assert.match(status.sourcePhotometryRefHandoffSummary.sourcePhotometryRef, /^safe-source-photometry-ref:[0-9a-f]{40}$/);
  assert.equal(status.photometryMetadataShape.sourcePhotometryStatus, "real_source_ref_ready");
  assert.match(status.photometryMetadataShape.sourcePhotometryRef, /^safe-source-photometry-ref:[0-9a-f]{40}$/);
  assert.equal(status.photometryMetadataShape.sourceBacked, true);
  assert.equal(status.photometryMetadataShape.sourceAnchorOnly, true);
  assert.equal(status.photometryMetadataShape.opaqueReferenceOnly, true);
  assert.equal(status.photometryMetadataShape.safeSummaryOnly, true);
  assert.equal(JSON.stringify(status).includes("opaque-photometry-ref-do-not-emit.ies"), false);
});

test("status keeps placeholder/null source photometry metadata when safe anchor is absent", () => {
  const status = buildIesBuilderStatus({ selectedResultProjection: acceptedSelectedResultProjection() });

  assert.equal(status.sourcePhotometryRefHandoffSummary.ok, false);
  assert.equal(status.sourcePhotometryRefHandoffSummary.blocker, "missing-safe-photometry-reference-summary");
  assert.equal(status.photometryMetadataShape.sourcePhotometryRef, null);
  assert.equal(status.photometryMetadataShape.sourcePhotometryStatus, "opaque_ref_required_later");
  assert.equal(status.sourcePhotometryRefReadiness.ready, true);
  assert.equal(status.sourcePhotometryRefReadiness.sourcePhotometryRef, "opaque-source-photometry-ref-present");
});

test("1mm policy remains metadata-only and candidate artefact refs remain opaque/null", () => {
  const contract = buildIesBuilderSelectedResultHandoffContract(acceptedSelectedResultProjection());

  assert.equal(contract.oneMmPolicy.oneMmNormalised, true);
  assert.equal(contract.oneMmPolicy.baseLengthM, 0.001);
  assert.equal(contract.oneMmPolicy.photometryMode, "normalise_1mm_candidate");
  assert.equal(contract.oneMmPolicy.scalePolicy, "scale_to_1mm_metadata_only");
  assert.equal(contract.oneMmPolicy.rawCandelaGridExposed, false);
  assert.equal(contract.oneMmPolicy.rawIesContentExposed, false);
  assert.equal(contract.oneMmPolicy.rawPhotometryPayloadExposed, false);
  assert.equal(contract.candidateArtefactRefs.opaqueRefsOnly, true);
  assert.equal(contract.candidateArtefactRefs.iesCandidateRef, null);
  assert.equal(contract.candidateArtefactRefs.photometryMetadataRef, null);
  assert.equal(contract.candidateArtefactRefs.candidateManifestRef, null);
  assert.equal(contract.candidateArtefactRefs.polarPreviewRef, null);
  assert.equal(contract.candidateArtefactRefs.pdfRef, null);
  assertHandoffSafety(contract);
});

test("raw IES candela photometry Engine Lab PDF artefact base64 and private data never appear in handoff", () => {
  const contract = buildIesBuilderSelectedResultHandoffContract(acceptedSelectedResultProjection());
  const text = JSON.stringify(contract);

  for (const marker of [
    "rough-electrical-payload-do-not-emit",
    "raw-engine-payload-do-not-emit",
    "raw-ies-do-not-emit",
    "candela-grid-do-not-emit",
    "photometry-payload-do-not-emit",
    "lab-evidence-do-not-emit",
    "private-proof-do-not-emit.pdf",
    "polar-do-not-emit",
    "do-not-emit.ies",
    "users-row-do-not-emit",
    "provider-id-do-not-emit",
    "lookup-id-do-not-emit",
    "board-row-do-not-emit",
    "segment-do-not-emit",
    "TILT=NONE",
  ]) {
    assert.equal(text.includes(marker), false, `${marker} should not appear`);
  }
  assertHandoffSafety(contract);
});

test("IES Builder view model emits selected-result handoff rows", () => {
  const status = buildIesBuilderStatus({ selectedResultProjection: acceptedSelectedResultProjection() });
  const viewModel = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: { status: "ready" },
    status,
  });

  assert.ok(viewModel.handoffContractRows.some(([label, value]) => label === "handoffState" && value === "metadata_ready_for_future_candidate_output"));
  assert.ok(viewModel.selectedResultStateSummaryRows.some(([label, value]) => label === "selectedResultAvailable" && value === "true"));
  assert.ok(viewModel.sourcePhotometryRefReadinessRows.some(([label, value]) => label === "sourcePhotometryRef" && value === "opaque-source-photometry-ref-present"));
  assert.ok(viewModel.handoffOneMmPolicyRows.some(([label, value]) => label === "baseLengthM" && value === "0.001"));
});

test("fixture/parser diagnostics use safe runtime summaries only", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.currentStatusSummary, "Read-only IES candidate-output contract/status metadata is available; real generation waits for a selected Engine/RunTable result.");
  assert.equal(status.parserCapabilityStatus, "safe_summary_only_no_raw_ies");
  assert.equal(status.fixtureSampleReadinessStatus, "metadata_only_no_upload_enabled");
  assert.equal(status.candidateBoundary, "candidate_output_only_not_approved_proof");
  assert.equal(status.proofBoundarySummary, "Lab Proof remains the boundary for proof authority.");
  assert.ok(Array.isArray(status.blockedActions));
  assert.ok(status.blockedActions.includes("IES upload"));
  assert.ok(status.blockedActions.includes("upload parsing"));
  assert.ok(status.blockedActions.includes("IES export"));
  assert.ok(status.blockedActions.includes("IES generation"));
  assert.ok(status.blockedActions.includes("polar preview"));
  assert.ok(status.blockedActions.includes("raw candela display"));
  assert.ok(status.blockedActions.includes("raw photometry payload display"));
  assert.ok(status.blockedActions.includes("raw Engine payload display"));
  assert.ok(status.blockedActions.includes("Selector mutation"));
  assert.ok(status.blockedActions.includes("Board Data mutation"));
  assert.ok(status.blockedActions.includes("Lab proof claim"));
  assert.ok(status.blockedActions.includes("raw IES exposure"));
  assert.ok(status.blockedActions.includes("raw Lab evidence exposure"));
  assert.ok(status.blockedActions.includes("PDF or artefact exposure"));
  assert.ok(status.blockedActions.includes("donor Python mounting"));
  assert.ok(status.blockedActions.includes("donor code mounting"));
});

test("required UI boundary wording is emitted by the status service", () => {
  const status = buildIesBuilderStatus();

  for (const warning of REQUIRED_BOUNDARY_WARNINGS) {
    assert.ok(status.warnings.includes(warning));
  }
});

test("IES Builder status emits no proof authority or proof claim", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.productionProof, false);
  assert.equal(status.productionProofAuthority, false);
  assert.equal(status.labApprovalRequired, true);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.proofClaimsEmitted, false);
  assert.equal(status.proofStatus, "not_proof_authority");
  assert.equal(status.candidateOutputOnly, true);
});

test("generation, upload, parse, export, and polar preview are disabled", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.uploadEnabled, false);
  assert.equal(status.parseEnabled, false);
  assert.equal(status.parseUploadEnabled, false);
  assert.equal(status.exportEnabled, false);
  assert.equal(status.polarPreviewEnabled, false);
});

test("Selector mutation and Board Data writes are disabled", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.boardDataWritesEnabled, false);
  assert.equal(status.boardDataMutationEnabled, false);
  assert.equal(status.activeSnapshotWriteEnabled, false);
  assert.equal(status.materialisedSnapshotWriteEnabled, false);
});

test("raw IES, candela, photometry payload, Engine payload, Lab evidence, artefacts, and PDFs are not exposed", () => {
  const status = buildIesBuilderStatus();
  const text = JSON.stringify(status);

  assert.equal(status.rawIesExposed, false);
  assert.equal(status.rawCandelaGridExposed, false);
  assert.equal(status.rawPhotometryPayloadExposed, false);
  assert.equal(status.rawEnginePayloadExposed, false);
  assert.equal(status.rawSelectedEnginePayloadExposed, false);
  assert.equal(status.rawBoardDataRowsExposed, false);
  assert.equal(status.rawLabEvidenceExposed, false);
  assert.equal(status.rawArtefactsExposed, false);
  assert.equal(status.rawPdfsExposed, false);
  assert.equal(status.base64PolarPlotsExposed, false);
  assert.equal(status.localPathsExposed, false);
  assert.equal(status.repoPathsExposed, false);
  assert.equal(status.filenamesExposed, false);
  assert.equal(status.credentialsExposed, false);
  assert.equal(status.usersExposed, false);
  assert.equal(status.providerDetailsExposed, false);
  assert.equal(text.includes("TILT="), false);
  assert.equal(text.includes("[_DATA]"), false);
  assert.equal(text.includes("LAB_RAW"), false);
});

test("donor Python, donor code, and large dependency hooks are not mounted", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.donorPythonMounted, false);
  assert.equal(status.donorCodeMounted, false);
  assert.equal(status.largeDependenciesAdded, false);
  assert.equal(status.googleSyncEnabled, false);
});

test("no write attempt is made", async () => {
  const writes = [];
  const fakeFs = {
    writeFile: async (...args) => {
      writes.push(args);
      throw new Error("write should not be called by IES Builder status service");
    },
  };

  const status = buildIesBuilderStatus({ fsApi: fakeFs });

  assert.equal(status.ok, true);
  assert.equal(status.noWritesAttempted, true);
  assert.equal(writes.length, 0);
});

test("IES Builder view model emits candidate output contract diagnostics", () => {
  const viewModel = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: { status: "ready" },
    status: {},
  });

  assert.deepEqual(viewModel.boundaryStatements, REQUIRED_CANDIDATE_BOUNDARY_COPY);
  assert.deepEqual(viewModel.contractBoundaryCopy, REQUIRED_CONTRACT_BOUNDARY_COPY);
  assert.deepEqual(viewModel.candidateReadinessRequirements, REQUIRED_CANDIDATE_READINESS_REQUIREMENTS);
  assert.deepEqual(viewModel.candidateStates, REQUIRED_CANDIDATE_STATES);
  assert.deepEqual(viewModel.candidateReadinessFlagRows, REQUIRED_CANDIDATE_FLAG_ROWS);
  assert.deepEqual(viewModel.relationshipRows, [
    ["Selector", "selection/candidate source"],
    ["Engine/RunTable", "selected result source and actual build geometry owner"],
    ["Board Data", "metadata source"],
    ["IES Builder", "future candidate artefact generator; not proof authority"],
    ["Lab Proof", "production proof authority later"],
    ["Controlled Records", "future provenance/review trail"],
  ]);
  assert.ok(viewModel.candidateContractRows.some(([label, value]) => label === "schemaId" && value === "controlstack.ies_builder.candidate_output_contract.v1"));
  assert.ok(viewModel.candidateStateRows.some(([label, value]) => label === "state" && value === "waiting_for_selected_engine_runtable_result"));
  assert.ok(viewModel.readinessBlockerRows.some(([label, value]) => label === "selected-engine-runtable-result-required" && value.includes("selected Engine/RunTable result")));
  assert.ok(viewModel.oneMmPolicyRows.some(([label, value]) => label === "baseLengthM" && value === "0.001"));
  assert.ok(viewModel.oneMmPolicyRows.some(([label, value]) => label === "photometryMode" && value === "normalise_1mm_candidate"));
  assert.ok(viewModel.geometryPolicyRows.some(([label, value]) => label === "iesBuilderOwnsActualBuildGeometry" && value === "false"));
  assert.ok(viewModel.runSummaryShapeRows.some(([label, value]) => label === "driverControlTopologySummary" && value === "none"));
  assert.ok(viewModel.candidateArtefactRefRows.some(([label, value]) => label === "opaqueRefsOnly" && value === "true"));
  assert.ok(viewModel.redactionFlagRows.some(([label, value]) => label === "rawCandelaGridExposed" && value === "false"));
});

test("IES Builder view source renders contract sections without adding active artefact controls", async () => {
  const viewText = await readFile(new URL("../packages/modules/ies-builder/iesBuilderView.js", import.meta.url), "utf-8");
  const indexText = await readFile(new URL("../packages/modules/ies-builder/index.js", import.meta.url), "utf-8");
  const combined = `${viewText}\n${indexText}`;

  assert.ok(viewText.includes("IES candidate-output contract schema"));
  assert.ok(viewText.includes("IES candidate readiness blockers"));
  assert.ok(viewText.includes("Actual build geometry ownership policy"));
  assert.ok(viewText.includes("1mm candidate photometry policy metadata"));
  assert.ok(viewText.includes("Opaque candidate artefact refs"));
  assert.ok(viewText.includes("IES candidate redaction flags"));
  assert.equal(/createElement\(["']button["']\)/.test(combined), false);
  assert.equal(/method:\s*["']POST["']/.test(combined), false);
  assert.equal(/upload/i.test(combined) && /addEventListener\(["']change["']/.test(combined), false);
  assert.equal(/download/i.test(combined) && /createObjectURL/.test(combined), false);
});

test("no POST IES Builder endpoint is added", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(serverText.includes("IES_BUILDER_POST"), false);
  assert.equal(/POST[\s\S]{0,160}IES_BUILDER_STATUS_PATH/.test(serverText), false);
  assert.equal(/AUTH_REF_POST_PATHS[\s\S]{0,700}IES_BUILDER_STATUS_PATH/.test(serverText), false);
});

import { test as labRuntimeStatusTest } from "node:test";
import * as labRuntimeStatusAssert from "node:assert/strict";
import { buildIesBuilderStatus as buildIesBuilderStatusWithLabRuntimeHandoff } from "../packages/workspace-kernel/iesBuilderStatusService.js";

function labRuntimeStatusSafeHandoff(overrides = {}) {
  return {
    schemaId: "safe-runtime-handoff.v1",
    schemaVersion: 1,
    handoffState: "ready",
    approvalState: "approved_for_runtime_reference",
    oneMmNormalised: true,
    baseLengthM: 0.001,
    sourcePhotometryRef: "opaque-source-photometry-ref:status",
    sourcePhotometryStatus: "reference-ready",
    iesPhotometryReferenceToken: "ies-ref-token:status",
    lumenCurveReferenceToken: "lumen-token:status",
    driverUtilCurveReferenceToken: "driver-token:status",
    photometryReferenceFingerprint: "photometry-fp-status",
    sourceInputFingerprint: "source-input-fp-status",
    boardDataSourceVersion: "board-version-status",
    selectedFamilySubsetLock: {
      family: "status-family",
      subset: "status-subset",
    },
    oneMmPolicyLabel: "one-mm-normalised-reference",
    recordFingerprint: "record-fp-status",
    derivedFromFingerprint: null,
    safeSummaryOnly: true,
    readOnly: true,
    ...overrides,
  };
}

labRuntimeStatusTest("IES Builder status consumes safe runtime handoff through lab adapter", () => {
  const status = buildIesBuilderStatusWithLabRuntimeHandoff({
    safeRuntimeHandoff: labRuntimeStatusSafeHandoff(),
  });

  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.ok, true);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.state, "runtime_lab_ies_safe_handoff_ready");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.sourcePhotometryRef, "opaque-source-photometry-ref:status");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.sourcePhotometryStatus, "reference-ready");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.iesPhotometryReferenceToken, "ies-ref-token:status");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.photometryReferenceFingerprint, "photometry-fp-status");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.sourceInputFingerprint, "source-input-fp-status");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.boardDataSourceVersion, "board-version-status");
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.sourcePhotometryRef, "opaque-source-photometry-ref:status");
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.sourceInputFingerprint, "source-input-fp-status");
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.boardDataSourceVersion, "board-version-status");
  labRuntimeStatusAssert.equal(status.rawIesExposed, false);
  labRuntimeStatusAssert.equal(status.rawCandelaGridExposed, false);
  labRuntimeStatusAssert.equal(status.rawPhotometryPayloadExposed, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.rawIesContentReturned, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.rawPhotometryReturned, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.candelaArraysReturned, false);
});

labRuntimeStatusTest("IES Builder status fills board-owned runtime null slots from board data", () => {
  const status = buildIesBuilderStatusWithLabRuntimeHandoff({
    safeRuntimeHandoff: labRuntimeStatusSafeHandoff({
      lumenCurveReferenceToken: null,
      driverUtilCurveReferenceToken: null,
      boardDataSourceVersion: null,
      selectedFamilySubsetLock: null,
    }),
    boardData: {
      lumenCurveReferenceToken: "board-lumen-fill",
      driverUtilCurveReferenceToken: "board-driver-fill",
      boardDataSourceVersion: "board-version-fill",
      selectedFamilySubsetLock: {
        family: "board-family-fill",
        subset: "board-subset-fill",
      },
    },
  });

  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.ok, true);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.lumenCurveReferenceToken, "board-lumen-fill");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.driverUtilCurveReferenceToken, "board-driver-fill");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.boardDataSourceVersion, "board-version-fill");
  labRuntimeStatusAssert.deepEqual(status.sourcePhotometryRefHandoffSummary.selectedFamilySubsetLock, {
    family: "board-family-fill",
    subset: "board-subset-fill",
  });
  labRuntimeStatusAssert.deepEqual(status.sourcePhotometryRefHandoffSummary.boardOwnedRuntimeFillApplied, [
    "lumenCurveReferenceToken",
    "driverUtilCurveReferenceToken",
    "boardDataSourceVersion",
    "selectedFamilySubsetLock",
  ]);
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.lumenCurveReferenceToken, "board-lumen-fill");
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.driverUtilCurveReferenceToken, "board-driver-fill");
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.boardDataSourceVersion, "board-version-fill");
});

labRuntimeStatusTest("IES Builder status remains blocked when safe runtime handoff is blocked", () => {
  const status = buildIesBuilderStatusWithLabRuntimeHandoff({
    safeRuntimeHandoff: labRuntimeStatusSafeHandoff({
      handoffState: "blocked",
    }),
  });

  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.ok, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.state, "runtime_lab_ies_safe_handoff_blocked_fail_closed");
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.blocker, "safe-runtime-handoff-not-ready");
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.sourcePhotometryRef, null);
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.rawCandelaGridExposed, false);
  labRuntimeStatusAssert.equal(status.photometryMetadataShape.rawPhotometryPayloadExposed, false);
});

labRuntimeStatusTest("IES Builder status keeps raw generation file route post and mutation flags false with safe runtime handoff", () => {
  const status = buildIesBuilderStatusWithLabRuntimeHandoff({
    safeRuntimeHandoff: labRuntimeStatusSafeHandoff(),
  });

  labRuntimeStatusAssert.equal(status.iesGenerationEnabled, false);
  labRuntimeStatusAssert.equal(status.uploadEnabled, false);
  labRuntimeStatusAssert.equal(status.exportEnabled, false);
  labRuntimeStatusAssert.equal(status.postEndpointsEnabled, false);
  labRuntimeStatusAssert.equal(status.selectorMutationEnabled, false);
  labRuntimeStatusAssert.equal(status.boardDataMutationEnabled, false);
  labRuntimeStatusAssert.equal(status.activeSnapshotWriteEnabled, false);
  labRuntimeStatusAssert.equal(status.materialisedSnapshotWriteEnabled, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.routesAdded, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.postEndpointsAdded, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.runtimeDataMutationEnabled, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.runtimeDataMutated, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.iesGenerationEnabled, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.iesGenerated, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.fileOutputEnabled, false);
  labRuntimeStatusAssert.equal(status.sourcePhotometryRefHandoffSummary.fileOutputWritten, false);
});
