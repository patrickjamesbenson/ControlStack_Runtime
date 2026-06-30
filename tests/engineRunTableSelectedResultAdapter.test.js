import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_RUN_REQUIRED_FIELDS,
  ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE,
  adaptEngineRunTableSelectedResultToProjection,
  buildFailClosedEngineRunTableSelectedResultAdapterProjection,
} from "../packages/workspace-kernel/engineRunTableSelectedResultAdapter.js";
import { createSelectedResultPerRunDisplayRowShape } from "../packages/workspace-kernel/selectedResultProjectionService.js";

const adapterSourceUrl = new URL("../packages/workspace-kernel/engineRunTableSelectedResultAdapter.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function completeAcceptedInput(overrides = {}) {
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
        segments: [
          { startMm: 0, endMm: 560, marker: "segment-one-do-not-emit" },
          { startMm: 560, endMm: 1140, marker: "segment-two-do-not-emit" },
        ],
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
    upstreamRawMarker: "top-level-do-not-emit",
    weightedAlternatives: [{ marker: "weighted-option-do-not-emit" }],
    candidateComparisons: [{ marker: "candidate-option-do-not-emit" }],
    sourceTables: [{ marker: "source-table-do-not-emit" }],
    usersRows: [{ marker: "users-row-do-not-emit" }],
    privateFilePath: "private-location-do-not-emit.pdf",
    evidenceMarker: "evidence-do-not-emit",
    photometricGridMarker: "grid-do-not-emit",
    artefactMarker: "encoded-artefact-do-not-emit",
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

function assertGenerationProofWriteDisabled(projection) {
  assert.equal(projection.writes, false);
  assert.equal(projection.generation, false);
  assert.equal(projection.proof, false);
  assert.equal(projection.routesAdded, false);
  assert.equal(projection.postEndpointsAdded, false);
  assert.equal(projection.engineExecutionAttempted, false);
  assert.equal(projection.runTableGenerationAttempted, false);
  assert.equal(projection.selectedResultPersistenceAttempted, false);
  assert.equal(projection.safetyFlags.engineExecutionEnabled, false);
  assert.equal(projection.safetyFlags.engineVerificationEnabled, false);
  assert.equal(projection.safetyFlags.selectedResultIngestionEnabled, false);
  assert.equal(projection.safetyFlags.selectedResultPersistenceEnabled, false);
  assert.equal(projection.safetyFlags.staleResultComparisonEnabled, false);
  assert.equal(projection.safetyFlags.runTableGenerationEnabled, false);
  assert.equal(projection.safetyFlags.payloadGenerationEnabled, false);
  assert.equal(projection.safetyFlags.iesGenerationEnabled, false);
  assert.equal(projection.safetyFlags.drawingGenerationEnabled, false);
  assert.equal(projection.safetyFlags.labProofAuthority, false);
  assert.equal(projection.safetyFlags.complianceProofAuthority, false);
  assert.equal(projection.safetyFlags.controlledRecordsWriteEnabled, false);
  assert.equal(projection.safetyFlags.rregApprovalEnabled, false);
  assert.equal(projection.safetyFlags.rregCustodyTransferEnabled, false);
  assert.equal(projection.safetyFlags.hubSpotCrmWriteBackEnabled, false);
  assert.equal(projection.safetyFlags.boardDataMutationEnabled, false);
  assert.equal(projection.safetyFlags.hiddenWriteBackEnabled, false);
}

function assertRawExposureDisabled(projection) {
  assert.equal(projection.safetyFlags.rawSelectedPayloadExposed, false);
  assert.equal(projection.safetyFlags.rawEngineDebugPayloadExposed, false);
  assert.equal(projection.safetyFlags.rawCandidateAlternativesExposedAsFinalOutputs, false);
  assert.equal(projection.safetyFlags.rawBoardDataRowsExposed, false);
  assert.equal(projection.safetyFlags.rawBoardDataHeadersExposed, false);
  assert.equal(projection.safetyFlags.rawUsersExposed, false);
  assert.equal(projection.safetyFlags.credentialsExposed, false);
  assert.equal(projection.safetyFlags.privatePathsExposed, false);
  assert.equal(projection.safetyFlags.rawLabEvidenceExposed, false);
  assert.equal(projection.safetyFlags.rawIesExposed, false);
  assert.equal(projection.safetyFlags.rawArtefactsExposed, false);
  assert.equal(projection.safetyFlags.rawPdfsExposed, false);
}

test("missing input fails closed into selected-result projection shape", () => {
  const projection = adaptEngineRunTableSelectedResultToProjection();

  assert.equal(projection.source, ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_SOURCE);
  assert.equal(projection.sourceAvailable, false);
  assert.equal(projection.selectedResultAvailable, false);
  assert.equal(projection.state, "no_selected_result");
  assert.equal(projection.resultState, "no_selected_result");
  assert.equal(projection.resultStateLabel, "Estimated preview");
  assert.equal(projection.accepted, false);
  assert.equal(projection.engineVerified, false);
  assert.equal(projection.perRunLookupNormalised, false);
  assert.deepEqual(projection.runs, []);
  assert.deepEqual(projection.runsByKey, {});
  assertGenerationProofWriteDisabled(projection);
  assertRawExposureDisabled(projection);
});

test("explicit fail-closed helper remains safe and projection-compatible", () => {
  const projection = buildFailClosedEngineRunTableSelectedResultAdapterProjection("manual test fail closed");
  const rows = Object.fromEntries(projection.rows);

  assert.equal(projection.selectedResultAvailable, false);
  assert.equal(projection.selectedResultUnavailableReason, "manual test fail closed");
  assert.equal(rows["adapter state"], "adapter_fail_closed");
  assert.equal(rows["routes added"], "false");
  assert.equal(rows["post endpoints added"], "false");
  assertGenerationProofWriteDisabled(projection);
  assertRawExposureDisabled(projection);
});

test("incomplete input, multiple accepted results, accepted false, engineVerified false, and stale true fail closed", () => {
  const incomplete = adaptEngineRunTableSelectedResultToProjection({ oneSuccessfulAcceptedResult: true });
  assert.equal(incomplete.selectedResultAvailable, false);

  const multiple = adaptEngineRunTableSelectedResultToProjection({
    acceptedResults: [completeAcceptedInput(), completeAcceptedInput({ selectedTierOrProfile: "first" })],
  });
  assert.equal(multiple.selectedResultAvailable, false);
  assert.equal(multiple.selectedResultUnavailableReason, "expected exactly one accepted selected result");

  const acceptedFalse = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput({ accepted: false }));
  assert.equal(acceptedFalse.selectedResultAvailable, false);
  assert.equal(acceptedFalse.accepted, false);

  const notVerified = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput({ engineVerified: false }));
  assert.equal(notVerified.selectedResultAvailable, false);
  assert.equal(notVerified.engineVerified, false);

  const stale = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput({ stale: true }));
  assert.equal(stale.selectedResultAvailable, false);
  assert.equal(stale.state, "stale");
  assert.equal(stale.resultStateLabel, "Run table changed — verify again");
  assert.equal(stale.stale, true);
  assert.equal(stale.staleResultComparisonAttempted, false);
});

test("required selected-result metadata fields are enforced", () => {
  for (const field of ["selectedFamilySubsetLock", "sourceInputFingerprint", "boardDataSourceVersion", "perRunLookupByRunIdOrNumber"]) {
    const input = completeAcceptedInput({ [field]: null });
    const projection = adaptEngineRunTableSelectedResultToProjection(input);
    assert.equal(projection.selectedResultAvailable, false, `${field} should fail closed`);
  }
});

test("missing required per-run fields fail closed", () => {
  const [baseRun] = completeAcceptedInput().runs;
  const removals = [
    "runLengthMm",
    "bodyMmRequested",
    "segments",
    "reservedRanges",
    "boardRun",
    "boardCount",
    "boardFamily",
    "sanitisedWarnings",
  ];

  assert.ok(ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_RUN_REQUIRED_FIELDS.includes("runLengthMm"));
  assert.ok(ENGINE_RUNTABLE_SELECTED_RESULT_ADAPTER_RUN_REQUIRED_FIELDS.includes("boardFamily"));

  for (const field of removals) {
    const run = { ...baseRun };
    delete run[field];
    const projection = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput({ runs: [run] }));
    assert.equal(projection.selectedResultAvailable, false, `${field} should fail closed`);
  }
});

test("complete sanitised accepted fixture maps to selected-result projection shape", () => {
  const projection = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput());
  const rows = Object.fromEntries(projection.rows);

  assert.equal(projection.sourceAvailable, true);
  assert.equal(projection.sourceState, "adapter_selected_result_available");
  assert.equal(projection.selectedResultAvailable, true);
  assert.equal(projection.selectedResultUnavailableReason, null);
  assert.equal(projection.state, "selected_accepted");
  assert.equal(projection.resultState, "selected_accepted");
  assert.equal(projection.resultStateLabel, "Engine verified");
  assert.equal(projection.estimatedPreviewOnly, false);
  assert.equal(projection.accepted, true);
  assert.equal(projection.engineVerified, true);
  assert.equal(projection.stale, false);
  assert.equal(projection.selectedProfileTier, "business");
  assert.equal(projection.selectedTierOrProfile, "business");
  assert.equal(projection.selectedReason.includes("Best compliant balance"), true);
  assert.deepEqual(Object.keys(projection.runs[0]).sort(), Object.keys(createSelectedResultPerRunDisplayRowShape()).sort());
  assert.equal(projection.runs[0].runKey, "safe-run-key");
  assert.equal(projection.runs[0].runLengthMm, 1200);
  assert.equal(projection.runs[0].bodyMmRequested, 1140);
  assert.equal(projection.runs[0].segmentsSummary.segmentCount, 2);
  assert.equal(projection.runs[0].reservedRangesSummary.count, 0);
  assert.equal(projection.runs[0].boardRunSummary.boardCount, 2);
  assert.equal(projection.runs[0].boardCount, 2);
  assert.equal(projection.runs[0].boardFamily, "Linear 560 280 140");
  assert.deepEqual(projection.runs[0].sanitisedWarnings, ["safe warning"]);
  assert.equal(projection.runsByKey["safe-run-key"].runNumber, 1);
  assert.equal(rows["selected result available"], "true");
  assert.equal(rows["per-run lookup"], "normalised");
  assert.equal(rows["raw per-run lookup exposed"], "false");
  assertGenerationProofWriteDisabled(projection);
  assertRawExposureDisabled(projection);
});

test("per-run lookup is normalised by run id, run number, and run key without exposing raw lookup structures", () => {
  const projection = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput());

  assert.equal(projection.perRunLookupNormalised, true);
  assert.equal(projection.perRunLookupSummary.available, true);
  assert.deepEqual(projection.perRunLookupSummary.normalisedBy, {
    runId: true,
    runNumber: true,
    runKey: true,
  });
  assert.equal(projection.perRunLookupSummary.rawLookupExposed, false);

  const text = JSON.stringify(projection);
  assert.equal(text.includes("lookup-id-do-not-emit"), false);
  assert.equal(text.includes("lookup-number-do-not-emit"), false);
  assert.equal(text.includes("lookup-key-do-not-emit"), false);
});

test("optional future summaries may remain null and unsafe optional content is not emitted", () => {
  const [baseRun] = completeAcceptedInput().runs;
  const projection = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput({
    runs: [{
      ...baseRun,
      zoneCount: undefined,
      zonePlanSummary: undefined,
      zoneTargetSummary: { state: "private-location-do-not-emit.pdf" },
      mechanicalSummary: undefined,
      suspensionSummary: undefined,
      clipSummary: undefined,
      gearTraySummary: undefined,
    }],
  }));

  const row = projection.runs[0];
  assert.equal(row.zoneCount, null);
  assert.equal(row.zonePlanSummary, null);
  assert.equal(row.mechanicalSummary, null);
  assert.equal(row.suspensionSummary, null);
  assert.equal(row.clipSummary, null);
  assert.equal(row.gearTraySummary, null);
  assert.deepEqual(row.zoneTargetSummary, {
    state: "summary_available",
    generationEnabled: false,
    rawSourceExposed: false,
  });
  assert.equal(JSON.stringify(projection).includes("private-location-do-not-emit.pdf"), false);
});

test("raw upstream markers and final-output alternatives are not emitted", () => {
  const projection = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput());
  const text = JSON.stringify(projection);

  for (const marker of [
    "top-level-do-not-emit",
    "weighted-option-do-not-emit",
    "candidate-option-do-not-emit",
    "source-table-do-not-emit",
    "users-row-do-not-emit",
    "private-location-do-not-emit.pdf",
    "evidence-do-not-emit",
    "grid-do-not-emit",
    "encoded-artefact-do-not-emit",
    "segment-one-do-not-emit",
    "board-row-do-not-emit",
  ]) {
    assert.equal(text.includes(marker), false, `${marker} should be redacted`);
  }
  assert.equal(projection.weightedAlternatives, undefined);
  assert.equal(projection.candidateComparisons, undefined);
  assert.equal(projection.sourceTables, undefined);
  assert.equal(projection.usersRows, undefined);
  assert.equal(projection.privateFilePath, undefined);
  assert.equal(projection.evidenceMarker, undefined);
  assert.equal(projection.photometricGridMarker, undefined);
});

test("adapter source adds no Engine route, Selector run route, endpoint, Engine execution, persistence, or stale comparison", async () => {
  const adapterText = await readFile(adapterSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const projection = adaptEngineRunTableSelectedResultToProjection(completeAcceptedInput());

  assert.equal(adapterText.includes("node:fs"), false);
  assert.equal(adapterText.includes("node:path"), false);
  assert.equal(adapterText.includes("run_engine.py"), false);
  assert.equal(adapterText.includes("/api/engine/run"), false);
  assert.equal(adapterText.includes("/api/selector/run"), false);
  assert.equal(adapterText.includes("fetch("), false);
  assert.equal(adapterText.includes("rough_electrical_payload"), false);
  assert.equal(adapterText.includes("variants_table"), false);
  assert.equal(adapterText.includes("policy_sources"), false);
  assert.equal(adapterText.includes("timings_ms"), false);
  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
  assert.equal(serverText.includes("SELECTOR_POST"), false);
  assert.equal(projection.staleComparisonMetadataOnly, true);
  assert.equal(projection.staleResultComparisonAttempted, false);
  assertGenerationProofWriteDisabled(projection);
  assertRawExposureDisabled(projection);
});
