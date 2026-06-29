import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  RUNTABLE_SELECTED_RESULT_FUTURE_SOURCE_REQUIRED_FIELDS,
  RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS,
  RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL,
  RUNTABLE_SELECTED_RESULT_SOURCE_STATE,
  RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP,
  adaptRunTableSelectedResultSourceContractToSelectedResultProjection,
  buildRunTableSelectedResultSourceContract,
} from "../packages/workspace-kernel/runTableSelectedResultSourceContract.js";

const serverSourceUrl = new URL("../server.js", import.meta.url);

function assertGenerationProofWriteDisabled(flags) {
  assert.equal(flags.engineExecutionEnabled, false);
  assert.equal(flags.engineVerificationEnabled, false);
  assert.equal(flags.selectedResultIngestionEnabled, false);
  assert.equal(flags.selectedResultPersistenceEnabled, false);
  assert.equal(flags.staleResultComparisonEnabled, false);
  assert.equal(flags.runTableGenerationEnabled, false);
  assert.equal(flags.payloadGenerationEnabled, false);
  assert.equal(flags.iesGenerationEnabled, false);
  assert.equal(flags.drawingGenerationEnabled, false);
  assert.equal(flags.labProofAuthority, false);
  assert.equal(flags.controlledRecordsWriteEnabled, false);
  assert.equal(flags.rregApprovalEnabled, false);
  assert.equal(flags.rregCustodyTransferEnabled, false);
  assert.equal(flags.hubSpotCrmWriteBackEnabled, false);
  assert.equal(flags.boardDataMutationEnabled, false);
  assert.equal(flags.hiddenWriteBackEnabled, false);
}

function assertRawExposureDisabled(flags) {
  assert.equal(flags.rawSelectedPayloadExposed, false);
  assert.equal(flags.rawEngineDebugPayloadExposed, false);
  assert.equal(flags.rawCandidateAlternativesExposedAsFinalOutputs, false);
  assert.equal(flags.rawAlternativesAsFinalOutputs, false);
}

test("RunTable selected-result source contract returns source unavailable by default", () => {
  const contract = buildRunTableSelectedResultSourceContract();
  const rows = Object.fromEntries(contract.rows);

  assert.equal(contract.ok, true);
  assert.equal(contract.sourceOwnerLabel, RUNTABLE_SELECTED_RESULT_SOURCE_OWNER_LABEL);
  assert.equal(contract.sourceOwnerLabel, "future RunTable / Engine Result source");
  assert.equal(contract.sourceState, RUNTABLE_SELECTED_RESULT_SOURCE_STATE);
  assert.equal(contract.sourceState, "source_unavailable");
  assert.equal(contract.sourceAvailable, false);
  assert.equal(contract.selectedResultAvailable, false);
  assert.equal(contract.selectedResultUnavailableReason, "future RunTable / Engine Result source is not connected");
  assert.equal(rows["source available"], "false");
  assert.equal(rows["selected result available"], "false");
});

test("RunTable selected-result source contract is read-only, display-only, and fail-closed", () => {
  const contract = buildRunTableSelectedResultSourceContract();

  assert.equal(contract.readOnly, true);
  assert.equal(contract.displayOnly, true);
  assert.equal(contract.contractOnly, true);
  assert.equal(contract.failClosed, true);
  assert.equal(contract.writes, false);
  assert.equal(contract.generation, false);
  assert.equal(contract.proof, false);
  assert.equal(contract.routesAdded, false);
  assert.equal(contract.postEndpointsAdded, false);
  assert.equal(contract.safetyFlags.readOnly, true);
  assert.equal(contract.safetyFlags.displayOnly, true);
  assert.equal(contract.safetyFlags.contractOnly, true);
  assert.equal(contract.safetyFlags.failClosed, true);
});

test("RunTable selected-result source contract has no selected result, verification, acceptance, stale state, or lock by default", () => {
  const contract = buildRunTableSelectedResultSourceContract();
  const rows = Object.fromEntries(contract.rows);

  assert.equal(contract.engineVerified, false);
  assert.equal(contract.accepted, false);
  assert.equal(contract.stale, false);
  assert.equal(contract.selectedFamilySubsetLock, null);
  assert.equal(contract.perRunLookupNormalised, false);
  assert.equal(contract.perRunLookupKey, "run id / run number");
  assert.equal(rows["engine verified"], "false");
  assert.equal(rows.accepted, "false");
  assert.equal(rows.stale, "false");
  assert.equal(rows["selected family/subset lock"], "none");
  assert.equal(rows["per-run lookup"], "not normalised");
});

test("RunTable selected-result source safety flags do not execute, generate, persist, compare, prove, or expose raw output", () => {
  const contract = buildRunTableSelectedResultSourceContract();

  assert.equal(RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS.sourceAvailable, false);
  assert.equal(RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS.selectedResultAvailable, false);
  assertGenerationProofWriteDisabled(RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS);
  assertGenerationProofWriteDisabled(contract.safetyFlags);
  assertRawExposureDisabled(RUNTABLE_SELECTED_RESULT_SAFETY_FLAGS);
  assertRawExposureDisabled(contract.safetyFlags);
  assert.equal(contract.engineExecutionAttempted, false);
  assert.equal(contract.runTableGenerationAttempted, false);
  assert.equal(contract.selectedResultIngestionAttempted, false);
  assert.equal(contract.selectedResultPersistenceAttempted, false);
  assert.equal(contract.staleResultComparisonAttempted, false);
});

test("RunTable selected-result source contract documents future source-required fields without values", () => {
  const contract = buildRunTableSelectedResultSourceContract();

  for (const field of [
    "oneSuccessfulAcceptedResult",
    "tierEvaluationSummary",
    "perRunLookupByRunIdOrNumber",
    "runLengthMm",
    "bodyMmRequested",
    "segments",
    "reservedRanges",
    "boardRun",
    "zonePlan",
    "mechanical",
    "boards",
    "diagnosticBoardFamily",
    "diagnosticZoneCount",
    "diagnosticZoneTargetsMm",
    "suspensionPointsMm",
    "clipPointsMm",
    "gearTrayPlan",
    "sanitisedWarnings",
    "selectedFamilySubsetLock",
    "sourceInputFingerprint",
    "boardDataSourceVersion",
  ]) {
    assert.ok(RUNTABLE_SELECTED_RESULT_FUTURE_SOURCE_REQUIRED_FIELDS.includes(field), `missing ${field}`);
    assert.ok(contract.futureSourceRequiredFields.includes(field), `contract missing ${field}`);
  }
  assert.equal(contract.futureSourceRequiredFields.length, RUNTABLE_SELECTED_RESULT_FUTURE_SOURCE_REQUIRED_FIELDS.length);
  assert.equal(contract.selectedResultAvailable, false);
});

test("RunTable selected-result source contract documents stale-sensitive input ownership without implementing comparison", () => {
  const contract = buildRunTableSelectedResultSourceContract();
  const ownershipText = contract.staleSensitiveInputOwnership.join("\n");

  for (const key of [
    "tierStrategy",
    "system",
    "optic",
    "environment",
    "finishes",
    "controlType",
    "lightTarget",
    "cct",
    "cri",
    "runLength",
    "runQty",
    "runAccessories",
    "emergencyPlacementIntent",
    "selectedBoardFamily",
    "selectedPitchFamily",
    "opticCurrentAssumptions",
    "zoneSplitStrategy",
    "driverFamily",
    "selectorPayloadFingerprint",
    "boardDataSourceVersion",
  ]) {
    assert.ok(ownershipText.includes(key), `missing stale ownership for ${key}`);
  }
  assert.deepEqual(contract.staleSensitiveInputOwnership, RUNTABLE_SELECTED_RESULT_STALE_INPUT_OWNERSHIP);
  assert.equal(contract.safetyFlags.staleResultComparisonEnabled, false);
  assert.equal(contract.staleResultComparisonAttempted, false);
});

test("RunTable selected-result source contract adapts into selected-result projection fail-closed", () => {
  const contract = buildRunTableSelectedResultSourceContract();
  const projection = adaptRunTableSelectedResultSourceContractToSelectedResultProjection(contract);
  const rows = Object.fromEntries(projection.rows);

  assert.equal(projection.sourceContractConsumed, true);
  assert.equal(projection.sourceOwnerLabel, "future RunTable / Engine Result source");
  assert.equal(projection.sourceAvailable, false);
  assert.equal(projection.sourceState, "source_unavailable");
  assert.equal(projection.selectedResultAvailable, false);
  assert.equal(projection.selectedResultUnavailableReason, "future RunTable / Engine Result source is not connected");
  assert.equal(projection.resultStateLabel, "Estimated preview");
  assert.equal(projection.engineVerified, false);
  assert.equal(projection.accepted, false);
  assert.equal(projection.stale, false);
  assert.equal(projection.selectedFamilySubsetLock, null);
  assert.equal(projection.perRunLookupNormalised, false);
  assert.equal(projection.futureRunTableSelectedResultSourceContract.sourceAvailable, false);
  assert.equal(projection.futureRunTableSelectedResultSourceContract.selectedResultAvailable, false);
  assert.equal(rows["source owner contract"], "future RunTable / Engine Result source");
  assert.equal(rows["routes added"], "false");
  assert.equal(rows["post endpoints added"], "false");
  assertGenerationProofWriteDisabled(projection.safetyFlags);
  assertRawExposureDisabled(projection.safetyFlags);
});

test("RunTable selected-result source stub adds no Engine, Selector, or POST route", async () => {
  const serverText = await readFile(serverSourceUrl, "utf-8");

  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
  assert.equal(serverText.includes("SELECTOR_POST"), false);
  assert.equal(serverText.includes("selected-result"), false);
});
