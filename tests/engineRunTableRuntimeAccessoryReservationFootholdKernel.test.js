import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeAccessoryReservationFootholdSummary,
  buildRuntimeNativeAccessoryReservationSummary,
  buildEngineRunTableRuntimeAccessoryReservationFootholdKernelStatus,
  ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeAccessoryReservationFootholdKernel.js";

const POLICY_FINGERPRINT = "safe-policy:runtime-accessory-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtime-accessory-fixture";

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

function noAccessoryInput(overrides = {}) {
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

function assertFootholdNoSideEffects(result = {}) {
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  for (const key of [
    "runtimeDataMutationEnabled",
    "donorMutationEnabled",
    "boardDataMakerImported",
    "donorEngineInvoked",
    "productionEngineExecutionEnabled",
    "fullDonorAncillaryParityEnabled",
    "physicalCoordinatePlacementEnabled",
    "emergencyZonePickerEnabled",
    "mechanicalDetailingEnabled",
    "segmentSplitEnabled",
    "gateDValidationEnabled",
    "runTableGenerationEnabled",
    "iesGenerationEnabled",
    "selectedResultPersistenceEnabled",
    "publicRoutesAdded",
    "postEndpointsAdded",
    "rawProductRowsReturned",
    "rawBoardRowsReturned",
    "rawAccessoryRowsReturned",
    "rawEnginePayloadReturned",
  ]) {
    assert.equal(result.safetyFlags?.[key], false);
  }
}

function oneSensorInput(overrides = {}) {
  return noAccessoryInput({
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

test("runtime accessory reservation foothold returns no reservation and board-fill input ready when no accessory is requested", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.accessoryReservationReady, true);
  assert.equal(result.originalRunLengthMm, 5600);
  assert.equal(result.bodyLengthBeforeReservationMm, 5600);
  assert.equal(result.boardFillInputLengthMm, 5600);
  assert.equal(result.boardFillInputReady, true);
  assert.equal(result.reservationCount, 0);
  assert.equal(result.reservationLengthMm, 0);
  assert.equal(result.lengthAdjustmentMode, "none");
  assert.match(result.accessoryReservationFingerprint, /^safe-reservation:[0-9a-f]{40}$/);
  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assertFootholdNoSideEffects(result);
});

test("one sealed sensor request reserves one board/module space before board fill", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput());

  assert.equal(result.ok, true);
  assert.equal(result.accessoryReservationReady, true);
  assert.equal(result.reservationCount, 1);
  assert.equal(result.reservationLengthMm, 1400);
  assert.equal(result.bodyLengthBeforeReservationMm, 5600);
  assert.equal(result.boardFillInputLengthMm, 4200);
  assert.equal(result.effectiveLitLengthBand, "4000-7999mm");
  assert.equal(result.accessoryPlacementIntentSummary.requestedAccessoryTypeBuckets.sensor, 1);
  assert.equal(result.accessoryPlacementIntentSummary.placementIntentBuckets.middle, 1);
  assert.equal(result.accessoryPlacementIntentSummary.physicalPlacementReturned, false);
  assert.equal(result.accessoryPlacementIntentSummary.rawCoordinatesReturned, false);
  assertFootholdNoSideEffects(result);
});

test("end plate deduction affects body length before reservation", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryInput({
    boardLengthMm: 1350,
    boardPitchMm: 50,
    boardFamilyLengthsSummary: boardFamilyFixture({
      boardLengthMm: 1350,
      boardPitchMm: 50,
      boardFamilyLengthsSortedDesc: [1350],
    }),
    endPlatePolicySummary: endPlatePolicyFixture({
      startDeductionMm: 100,
      endDeductionMm: 100,
    }),
  }));

  assert.equal(result.ok, true);
  assert.equal(result.originalRunLengthMm, 5600);
  assert.equal(result.endPlateDeductionBand.totalDeductionBand, "100-499mm");
  assert.equal(result.bodyLengthBeforeLengthAdjustmentMm, 5400);
  assert.equal(result.bodyLengthBeforeReservationMm, 5400);
  assert.equal(result.boardFillInputLengthMm, 5400);
});

test("reservation changes effective lit and board-fill input length", () => {
  const withoutAccessory = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryInput());
  const withAccessory = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput());

  assert.equal(withoutAccessory.ok, true);
  assert.equal(withAccessory.ok, true);
  assert.equal(withoutAccessory.boardFillInputLengthMm, 5600);
  assert.equal(withAccessory.boardFillInputLengthMm, 4200);
  assert.equal(withAccessory.boardFillInputLengthMm, withoutAccessory.boardFillInputLengthMm - withAccessory.reservationLengthMm);
  assert.notEqual(withAccessory.accessoryReservationFingerprint, withoutAccessory.accessoryReservationFingerprint);
});

test("cut-back mode is classified for sealed accessory reservation", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    lengthAdjustmentPreference: "cut-back",
  }));

  assert.equal(result.ok, true);
  assert.equal(result.lengthAdjustmentMode, "cut-back");
  assert.equal(result.lengthAdjustmentDeltaMm, 0);
  assert.equal(result.boardFillInputLengthMm, 4200);
});

test("extend-to-min-accessory-length mode is classified and extends the diagnostic body length before reservation", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    runLengthMm: 1500,
    endPlatePolicySummary: endPlatePolicyFixture(),
    accessoryPolicySummary: accessoryPolicyFixture({ minAccessoryBodyLengthMm: 2800 }),
    lengthAdjustmentPreference: "extend-to-min-accessory-length",
  }));

  assert.equal(result.ok, true);
  assert.equal(result.lengthAdjustmentMode, "extend-to-min-accessory-length");
  assert.equal(result.bodyLengthBeforeLengthAdjustmentMm, 1500);
  assert.equal(result.bodyLengthBeforeReservationMm, 2800);
  assert.equal(result.lengthAdjustmentDeltaMm, 1300);
  assert.equal(result.reservationLengthMm, 1400);
  assert.equal(result.boardFillInputLengthMm, 1400);
});

test("unresolved length adjustment fails closed", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    lengthAdjustmentPreference: "unresolved",
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "length-adjustment-unresolved");
  assert.equal(result.accessoryReservationReady, false);
  assert.equal(result.boardFillInputReady, false);
  assert.equal(result.donorEngineInvoked, false);
  assertFootholdNoSideEffects(result);
});

test("reservation exceeding body length fails closed", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    runLengthMm: 1000,
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "reservation-exceeds-body-length");
  assert.equal(result.reservationLengthMm, 1400);
  assert.equal(result.boardFillInputReady, false);
});

test("unsafe raw product, board, accessory, and engine payload inputs fail closed", () => {
  const rawProduct = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryInput({ rawProductRows: [{ sku: "RAW" }] }));
  const rawBoard = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryInput({ rawBoardRows: [{ board: "RAW" }] }));
  const rawAccessory = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryInput({ rawAccessoryRows: [{ accessory_id: "RAW" }] }));
  const rawEngine = buildRuntimeAccessoryReservationFootholdSummary(noAccessoryInput({ rawEnginePayload: { run_length_mm: 5600 } }));

  assert.equal(rawProduct.ok, false);
  assert.equal(rawProduct.blocker, "raw-product-row-input-not-approved");
  assert.equal(rawBoard.ok, false);
  assert.equal(rawBoard.blocker, "raw-board-row-input-not-approved");
  assert.equal(rawAccessory.ok, false);
  assert.equal(rawAccessory.blocker, "raw-accessory-row-input-not-approved");
  assert.equal(rawEngine.ok, false);
  assert.equal(rawEngine.blocker, "raw-engine-payload-input-not-approved");
});

test("unsafe raw rows are not exposed in safe summaries", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput());
  const serialised = JSON.stringify(result);

  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawAccessoryRowsReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.safetyFlags.rawProductRowsReturned, false);
  assert.equal(result.safetyFlags.rawBoardRowsReturned, false);
  assert.equal(result.safetyFlags.rawAccessoryRowsReturned, false);
  assert.equal(result.safetyFlags.rawEnginePayloadReturned, false);
  assert.equal(serialised.includes("RAW-ACCESSORY"), false);
  assert.equal(serialised.includes("ACCESSORIES"), false);
  assert.equal(serialised.includes("PRODUCTS"), false);
  assert.equal(serialised.includes("BOARDS"), false);
  assert.equal(serialised.includes("C:\\"), false);
  assert.equal(serialised.includes("enginePayload"), false);
});

test("missing and invalid policy/source/end-plate/board prerequisites fail closed", () => {
  const missingPolicyFingerprint = buildRuntimeAccessoryReservationFootholdSummary({
    ...noAccessoryInput(),
    policyFingerprint: "",
  });
  assert.equal(missingPolicyFingerprint.ok, false);
  assert.equal(missingPolicyFingerprint.blocker, "missing-policy-fingerprint");

  const missingSourceFingerprint = buildRuntimeAccessoryReservationFootholdSummary({
    ...noAccessoryInput(),
    sourceFingerprint: "",
  });
  assert.equal(missingSourceFingerprint.ok, false);
  assert.equal(missingSourceFingerprint.blocker, "missing-source-fingerprint");

  const missingEndPlate = buildRuntimeAccessoryReservationFootholdSummary({
    ...noAccessoryInput(),
    endPlatePolicySummary: undefined,
  });
  assert.equal(missingEndPlate.ok, false);
  assert.equal(missingEndPlate.blocker, "missing-end-plate-policy");

  const missingBoardLength = buildRuntimeAccessoryReservationFootholdSummary({
    ...noAccessoryInput(),
    boardLengthMm: "",
    boardFamilyLengthsSummary: {},
  });
  assert.equal(missingBoardLength.ok, false);
  assert.equal(missingBoardLength.blocker, "missing-board-length");

  const missingBoardPitch = buildRuntimeAccessoryReservationFootholdSummary({
    ...noAccessoryInput(),
    boardPitchMm: "",
    boardFamilyLengthsSummary: { boardLengthMm: 1400 },
  });
  assert.equal(missingBoardPitch.ok, false);
  assert.equal(missingBoardPitch.blocker, "missing-board-pitch");
});

test("unsupported accessory type and missing accessory policy fail closed", () => {
  const unsupported = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    accessoryRequestsSummary: {
      requests: [{ accessoryType: "camera", quantity: 1 }],
      sourceFingerprint: SOURCE_FINGERPRINT,
    },
    accessoryPolicySummary: accessoryPolicyFixture({ supportedAccessoryTypes: ["sensor"] }),
  }));
  assert.equal(unsupported.ok, false);
  assert.equal(unsupported.blocker, "unsupported-accessory-type");

  const missingPolicy = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    accessoryPolicySummary: undefined,
  }));
  assert.equal(missingPolicy.ok, false);
  assert.equal(missingPolicy.blocker, "missing-accessory-policy");
});

test("reservation grid unavailable fails closed when reservation does not align to board pitch", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    accessoryPolicySummary: accessoryPolicyFixture({
      reservationUnit: "sealed-length-mm",
      reservationLengthMm: 1455,
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "reservation-grid-unavailable");
});

test("reserved span that bisects a board module fails closed", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    accessoryPolicySummary: accessoryPolicyFixture({
      reservationUnit: "sealed-length-mm",
      reservationLengthMm: 700,
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "reserved-span-bisects-board");
});

test("board-fill input that is not positive fails closed", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    runLengthMm: 1400,
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "board-fill-input-not-positive");
});

test("no valid board reservation fails closed when effective length cannot be filled by sealed board lengths", () => {
  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    boardLengthMm: 1300,
    boardPitchMm: 100,
    boardFamilyLengthsSummary: boardFamilyFixture({
      boardLengthMm: 1300,
      boardPitchMm: 100,
      boardFamilyLengthsSortedDesc: [1300],
    }),
    accessoryPolicySummary: accessoryPolicyFixture({
      reservationUnit: "sealed-length-mm",
      reservationLengthMm: 1300,
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "no-valid-board-reservation");
});

test("fingerprint mismatch and unsupported adjustment mode fail closed", () => {
  const mismatch = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    accessoryPolicySummary: accessoryPolicyFixture({ policyFingerprint: "safe-policy:other-fixture" }),
  }));
  assert.equal(mismatch.ok, false);
  assert.equal(mismatch.blocker, "fingerprint-mismatch");

  const unsupportedMode = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput({
    lengthAdjustmentPreference: "stretch-randomly",
  }));
  assert.equal(unsupportedMode.ok, false);
  assert.equal(unsupportedMode.blocker, "unsupported-length-adjustment-mode");
});

test("aliases expose the same runtime-native accessory reservation foothold", () => {
  const canonical = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput());
  const alias = buildRuntimeNativeAccessoryReservationSummary(oneSensorInput());
  const status = buildEngineRunTableRuntimeAccessoryReservationFootholdKernelStatus(oneSensorInput());

  assert.deepEqual(alias, canonical);
  assert.deepEqual(status, canonical);
});

test("foothold does not invoke donor Engine, mutate RuntimeData, persist selected results, generate RunTable or IES, or add routes/POST endpoints", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/engineRunTableRuntimeAccessoryReservationFootholdKernel.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(/from\s+["'][^"']*run_engine/.test(sourceText), false);
  assert.equal(/run_engine\s*\(/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*ancillaries/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*BoardDataMaker/.test(sourceText), false);
  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serverText.includes("engineRunTableRuntimeAccessoryReservationFootholdKernel"), false);
  assert.equal(serverText.includes("runtime-accessory-reservation"), false);
  assert.equal(serverText.includes("app.post"), false);

  const result = buildRuntimeAccessoryReservationFootholdSummary(oneSensorInput());
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});
