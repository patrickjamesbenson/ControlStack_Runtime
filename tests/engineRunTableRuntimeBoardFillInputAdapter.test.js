import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeAccessoryReservationFootholdSummary,
} from "../packages/workspace-kernel/engineRunTableRuntimeAccessoryReservationFootholdKernel.js";
import {
  buildRuntimeBoardFillInputSummary,
  buildRuntimeNativeBoardFillInputSummary,
  buildEngineRunTableRuntimeBoardFillInputAdapterStatus,
  ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeBoardFillInputAdapter.js";

const POLICY_FINGERPRINT = "safe-policy:runtime-board-fill-input-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtime-board-fill-input-fixture";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function endPlatePolicyFixture(overrides = {}) {
  return {
    startDeductionMm: 0,
    endDeductionMm: 0,
    mode: "sealed-end-plate-gap-summary",
    ...overrides,
  };
}

function boardFamilyFixture(overrides = {}) {
  return {
    boardLengthMm: 1400,
    boardPitchMm: 70,
    boardFamilyLengthsSortedDesc: [1400],
    ...overrides,
  };
}

function accessoryPolicyFixture(overrides = {}) {
  return {
    supportedAccessoryTypes: ["sensor", "pir", "power-entry"],
    reservationUnit: "board-module",
    reservationModules: 1,
    policyFingerprint: POLICY_FINGERPRINT,
    rawAccessoryRowsReturned: false,
    ...overrides,
  };
}

function noAccessoryReservationInput(overrides = {}) {
  return {
    runLengthMm: 5600,
    selectedTierOrProfile: "Business",
    productFamilyToken: "safe-linear-family",
    boardLengthMm: 1400,
    boardPitchMm: 70,
    boardFamilyLengthsSummary: boardFamilyFixture(),
    endPlatePolicySummary: endPlatePolicyFixture(),
    accessoryRequestsSummary: { requests: [], sourceFingerprint: SOURCE_FINGERPRINT },
    lengthAdjustmentPreference: "none",
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    ...overrides,
  };
}

function oneSensorReservationInput(overrides = {}) {
  return noAccessoryReservationInput({
    accessoryRequestsSummary: {
      requests: [
        { accessoryType: "sensor", quantity: 1, placementIntent: "middle" },
      ],
      sourceFingerprint: SOURCE_FINGERPRINT,
    },
    accessoryPolicySummary: accessoryPolicyFixture(),
    lengthAdjustmentPreference: "cut-back",
    ...overrides,
  });
}

function adapterInput(accessoryReservationSummary, overrides = {}) {
  return {
    accessoryReservationSummary,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    selectedTierOrProfile: "Business",
    boardFamilyToken: "safe-linear-family",
    ...overrides,
  };
}

test("no-accessory reservation summary produces sealed boardFillInputSummary", () => {
  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryReservationInput());
  const result = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary));

  assert.equal(accessoryReservationSummary.ok, true);
  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.originalRunLengthMm, 5600);
  assert.equal(result.bodyLengthBeforeReservationMm, 5600);
  assert.equal(result.effectiveBoardFillLengthMm, 5600);
  assert.equal(result.effectiveBoardFillLengthBand, "4000-7999mm");
  assert.equal(result.reservationStatus, "none");
  assert.equal(result.reservationCount, 0);
  assert.equal(result.reservationLengthBand, "0mm");
  assert.equal(result.accessoryReservationFingerprint, accessoryReservationSummary.accessoryReservationFingerprint);
  assert.equal(result.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(result.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.match(result.boardFillInputFingerprint, /^safe-board-fill-input:[0-9a-f]{40}$/);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawReservationGridReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
});

test("accessory reservation summary produces shorter effectiveBoardFillLengthMm", () => {
  const withoutAccessory = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryReservationInput());
  const withAccessory = buildRuntimeAccessoryReservationFootholdSummary(oneSensorReservationInput());
  const withoutInput = buildRuntimeBoardFillInputSummary(adapterInput(withoutAccessory));
  const withInput = buildRuntimeBoardFillInputSummary(adapterInput(withAccessory));

  assert.equal(withoutAccessory.ok, true);
  assert.equal(withAccessory.ok, true);
  assert.equal(withoutInput.ok, true);
  assert.equal(withInput.ok, true);
  assert.equal(withAccessory.boardFillInputLengthMm, 4200);
  assert.equal(withInput.effectiveBoardFillLengthMm, 4200);
  assert.equal(withInput.reservationStatus, "reserved");
  assert.equal(withInput.reservationCount, 1);
  assert.equal(withInput.reservationLengthBand, "1000-1999mm");
  assert.equal(withInput.effectiveBoardFillLengthMm, withoutInput.effectiveBoardFillLengthMm - 1400);
  assert.notEqual(withInput.boardFillInputFingerprint, withoutInput.boardFillInputFingerprint);
});

test("unresolved accessory reservation fails closed before board-fill input adaptation", () => {
  const unresolvedReservation = buildRuntimeAccessoryReservationFootholdSummary(oneSensorReservationInput({
    lengthAdjustmentPreference: "unresolved",
  }));
  const result = buildRuntimeBoardFillInputSummary(adapterInput(unresolvedReservation));

  assert.equal(unresolvedReservation.ok, false);
  assert.equal(result.ok, false);
  assert.equal(result.blocker, "accessory-reservation-not-ready");
  assert.equal(result.reservationStatus, "blocked");
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
});

test("fingerprint mismatch fails closed", () => {
  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryReservationInput());
  const policyMismatch = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary, {
    policyFingerprint: "safe-policy:another-fixture",
  }));
  const sourceMismatch = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary, {
    sourceFingerprint: "safe-source:another-fixture",
  }));

  assert.equal(policyMismatch.ok, false);
  assert.equal(policyMismatch.blocker, "fingerprint-mismatch");
  assert.equal(sourceMismatch.ok, false);
  assert.equal(sourceMismatch.blocker, "fingerprint-mismatch");
});

test("missing and invalid effective board-fill length fail closed", () => {
  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryReservationInput());
  const missingLengthSummary = clone(accessoryReservationSummary);
  delete missingLengthSummary.boardFillInputLengthMm;
  const invalidLengthSummary = clone(accessoryReservationSummary);
  invalidLengthSummary.boardFillInputLengthMm = "not-a-length";
  const nonPositiveLengthSummary = clone(accessoryReservationSummary);
  nonPositiveLengthSummary.boardFillInputLengthMm = 0;

  const missing = buildRuntimeBoardFillInputSummary(adapterInput(missingLengthSummary));
  const invalid = buildRuntimeBoardFillInputSummary(adapterInput(invalidLengthSummary));
  const nonPositive = buildRuntimeBoardFillInputSummary(adapterInput(nonPositiveLengthSummary));

  assert.equal(missing.ok, false);
  assert.equal(missing.blocker, "missing-effective-board-fill-length");
  assert.equal(invalid.ok, false);
  assert.equal(invalid.blocker, "invalid-effective-board-fill-length");
  assert.equal(nonPositive.ok, false);
  assert.equal(nonPositive.blocker, "board-fill-input-not-positive");
});

test("missing safe policy/source fingerprints and missing accessory summary fail closed", () => {
  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryReservationInput());

  const missingPolicy = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary, {
    policyFingerprint: "",
  }));
  const missingSource = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary, {
    sourceFingerprint: "",
  }));
  const missingSummary = buildRuntimeBoardFillInputSummary({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
  });

  assert.equal(missingPolicy.ok, false);
  assert.equal(missingPolicy.blocker, "missing-policy-fingerprint");
  assert.equal(missingSource.ok, false);
  assert.equal(missingSource.blocker, "missing-source-fingerprint");
  assert.equal(missingSummary.ok, false);
  assert.equal(missingSummary.blocker, "missing-accessory-reservation-summary");
});

test("raw reservation grid and raw engine payload inputs fail closed", () => {
  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryReservationInput());
  const withRawGrid = clone(accessoryReservationSummary);
  withRawGrid.rawReservationGrid = [{ positionMm: 1400, sku: "RAW-GRID-CELL" }];
  const withRawPayload = clone(accessoryReservationSummary);
  withRawPayload.rawEnginePayload = { run_length_mm: 5600, secret: "RAW-PAYLOAD" };
  const withRawGridFlag = clone(accessoryReservationSummary);
  withRawGridFlag.rawReservationGridReturned = true;
  const withDonorEngineFlag = clone(accessoryReservationSummary);
  withDonorEngineFlag.donorEngineInvoked = true;
  const withMutationFlag = clone(accessoryReservationSummary);
  withMutationFlag.runtimeDataMutated = true;
  const withRunTableFlag = clone(accessoryReservationSummary);
  withRunTableFlag.runTableGenerated = true;
  const withIesFlag = clone(accessoryReservationSummary);
  withIesFlag.iesGenerated = true;

  const rawGrid = buildRuntimeBoardFillInputSummary(adapterInput(withRawGrid));
  const rawPayload = buildRuntimeBoardFillInputSummary(adapterInput(withRawPayload));
  const rawGridFlag = buildRuntimeBoardFillInputSummary(adapterInput(withRawGridFlag));
  const donorEngine = buildRuntimeBoardFillInputSummary(adapterInput(withDonorEngineFlag));
  const runtimeMutation = buildRuntimeBoardFillInputSummary(adapterInput(withMutationFlag));
  const runTable = buildRuntimeBoardFillInputSummary(adapterInput(withRunTableFlag));
  const ies = buildRuntimeBoardFillInputSummary(adapterInput(withIesFlag));

  assert.equal(rawGrid.ok, false);
  assert.equal(rawGrid.blocker, "raw-reservation-grid-input-not-approved");
  assert.equal(rawPayload.ok, false);
  assert.equal(rawPayload.blocker, "raw-engine-payload-input-not-approved");
  assert.equal(rawGridFlag.ok, false);
  assert.equal(rawGridFlag.blocker, "raw-reservation-grid-input-not-approved");
  assert.equal(donorEngine.ok, false);
  assert.equal(donorEngine.blocker, "donor-engine-invocation-not-approved");
  assert.equal(runtimeMutation.ok, false);
  assert.equal(runtimeMutation.blocker, "runtime-data-mutation-not-approved");
  assert.equal(runTable.ok, false);
  assert.equal(runTable.blocker, "runtable-generation-not-approved");
  assert.equal(ies.ok, false);
  assert.equal(ies.blocker, "ies-generation-not-approved");
});

test("board-fill input adapter output has no raw rows, raw reservation grid, or raw payload", () => {
  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(oneSensorReservationInput());
  const result = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary));
  const serialised = JSON.stringify(result);

  assert.equal(result.ok, true);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawReservationGridReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.safetyFlags.rawRowsReturned, false);
  assert.equal(result.safetyFlags.rawProductRowsReturned, false);
  assert.equal(result.safetyFlags.rawBoardRowsReturned, false);
  assert.equal(result.safetyFlags.rawAccessoryRowsReturned, false);
  assert.equal(result.safetyFlags.rawReservationGridReturned, false);
  assert.equal(result.safetyFlags.rawEnginePayloadReturned, false);
  assert.equal(serialised.includes("RAW-GRID-CELL"), false);
  assert.equal(serialised.includes("RAW-PAYLOAD"), false);
  assert.equal(serialised.includes("PRODUCTS"), false);
  assert.equal(serialised.includes("BOARDS"), false);
  assert.equal(serialised.includes("ACCESSORIES"), false);
  assert.equal(serialised.includes("C:\\"), false);
  assert.equal(serialised.includes("enginePayload"), false);
});

test("aliases expose the same runtime-native board-fill input adapter", () => {
  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(oneSensorReservationInput());
  const canonical = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary));
  const alias = buildRuntimeNativeBoardFillInputSummary(adapterInput(accessoryReservationSummary));
  const status = buildEngineRunTableRuntimeBoardFillInputAdapterStatus(adapterInput(accessoryReservationSummary));

  assert.deepEqual(alias, canonical);
  assert.deepEqual(status, canonical);
});

test("board-fill input adapter does not invoke donor Engine, mutate RuntimeData, persist selected results, generate RunTable or IES, or add routes/POST endpoints", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/engineRunTableRuntimeBoardFillInputAdapter.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(/from\s+["'][^"']*run_engine/.test(sourceText), false);
  assert.equal(/run_engine\s*\(/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*BoardDataMaker/.test(sourceText), false);
  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serverText.includes("engineRunTableRuntimeBoardFillInputAdapter"), false);
  assert.equal(serverText.includes("runtime-board-fill-input"), false);
  assert.equal(serverText.includes("app.post"), false);

  const accessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary(oneSensorReservationInput());
  const result = buildRuntimeBoardFillInputSummary(adapterInput(accessoryReservationSummary));
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.donorMutated, false);
  assert.equal(result.boardDataMakerImported, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});
