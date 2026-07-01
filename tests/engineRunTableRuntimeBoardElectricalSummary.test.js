import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeBoardElectricalSummary,
  ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeBoardElectricalSummary.js";

function safeBoardFillSummary(overrides = {}) {
  return {
    schemaId: "controlstack.runtime.engine-runtable.board-fill-summary",
    schemaVersion: 1,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: true,
    selectedBoardFamily: "Runtime Safe Linear Board Family",
    boardCount: 4,
    boardLengthMm: 1400,
    boardUsedLengthMm: 5600,
    slackMm: 0,
    policyFingerprint: "safe-policy:runtime-board-fill-fixture-5600",
    sourceFingerprint: "safe-board-fill:runtime-board-fill-fixture-5600",
    rawRowsReturned: false,
    rawCurveRowsReturned: false,
    rawUsersReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    iesGenerated: false,
    runTableGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function safeElectricalFixture(overrides = {}) {
  return {
    selectedBoardFamily: "Runtime Safe Linear Board Family",
    selectedCurrentMa: 350,
    vfAtCurrentV: 22.4,
    wattAtCurrentW: 11.2,
    sourceFingerprint: "safe-board-electrical:runtime-fixture-5600",
    policyFingerprint: "safe-policy:runtime-board-electrical-fixture-5600",
    rawRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawCurveRowsReturned: false,
    ...overrides,
  };
}

function validInput(overrides = {}) {
  return {
    boardFillSummary: safeBoardFillSummary(),
    sourceBackedBoardElectricalSummary: safeElectricalFixture(),
    selectedCurrentMa: 350,
    policyFingerprint: "safe-policy:runtime-board-electrical-input-5600",
    sourceFingerprint: "safe-source:runtime-board-electrical-input-5600",
    ...overrides,
  };
}

test("runtime board electrical summary produces a safe diagnostic summary for fixture input", () => {
  const result = buildRuntimeBoardElectricalSummary(validInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_BOARD_ELECTRICAL_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.selectedBoardFamily, "Runtime Safe Linear Board Family");
  assert.equal(result.boardCount, 4);
  assert.equal(result.boardLengthMm, 1400);
  assert.equal(result.boardUsedLengthMm, 5600);
  assert.equal(result.selectedCurrentMa, 350);
  assert.equal(result.boardVoltageClass, "safe-band:board-vf-0-24v");
  assert.equal(result.boardVoltageStatus, "banded-only-exact-values-suppressed");
  assert.equal(result.boardPowerClass, "safe-band:board-power-5-20w");
  assert.equal(result.boardPowerStatus, "banded-only-exact-values-suppressed");
  assert.equal(result.electricalSummaryReady, true);
  assert.equal(result.driverSizerReady, false);
  assert.match(result.policyFingerprint, /^safe-policy:/);
  assert.match(result.sourceFingerprint, /^safe-source:/);
  assert.match(result.summaryFingerprint, /^safe-board-electrical:[0-9a-f]{40}$/);
  assert.equal(result.exactElectricalValuesExposed, false);
  assert.deepEqual(result.failClosedDiagnostics, []);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.iesGenerated, false);
});

test("runtime board electrical summary fails closed when current is missing", () => {
  const result = buildRuntimeBoardElectricalSummary(validInput({
    selectedCurrentMa: undefined,
    sourceBackedBoardElectricalSummary: safeElectricalFixture({ selectedCurrentMa: undefined }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-current");
  assert.equal(result.electricalSummaryReady, false);
  assert.equal(result.driverSizerReady, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.donorEngineInvoked, false);
});

test("runtime board electrical summary fails closed when board electrical fields are missing", () => {
  const missingVoltage = buildRuntimeBoardElectricalSummary(validInput({
    sourceBackedBoardElectricalSummary: safeElectricalFixture({ vfAtCurrentV: undefined }),
  }));
  assert.equal(missingVoltage.ok, false);
  assert.equal(missingVoltage.blocker, "missing-board-electrical-fields");

  const missingPower = buildRuntimeBoardElectricalSummary(validInput({
    sourceBackedBoardElectricalSummary: safeElectricalFixture({ wattAtCurrentW: undefined }),
  }));
  assert.equal(missingPower.ok, false);
  assert.equal(missingPower.blocker, "missing-board-electrical-fields");
  assert.equal(missingPower.rawBoardRowsReturned, false);
  assert.equal(missingPower.rawDriverRowsReturned, false);
  assert.equal(missingPower.rawCurveRowsReturned, false);
});

test("runtime board electrical summary fails closed for zero or negative values", () => {
  const zeroCurrent = buildRuntimeBoardElectricalSummary(validInput({ selectedCurrentMa: 0 }));
  assert.equal(zeroCurrent.ok, false);
  assert.equal(zeroCurrent.blocker, "missing-current");

  const negativeVoltage = buildRuntimeBoardElectricalSummary(validInput({
    sourceBackedBoardElectricalSummary: safeElectricalFixture({ vfAtCurrentV: -1 }),
  }));
  assert.equal(negativeVoltage.ok, false);
  assert.equal(negativeVoltage.blocker, "missing-board-electrical-fields");

  const zeroPower = buildRuntimeBoardElectricalSummary(validInput({
    sourceBackedBoardElectricalSummary: safeElectricalFixture({ wattAtCurrentW: 0 }),
  }));
  assert.equal(zeroPower.ok, false);
  assert.equal(zeroPower.blocker, "missing-board-electrical-fields");
});

test("runtime board electrical summary fails closed for missing or unsafe board-fill input", () => {
  const missing = buildRuntimeBoardElectricalSummary({
    sourceBackedBoardElectricalSummary: safeElectricalFixture(),
    selectedCurrentMa: 350,
    policyFingerprint: "safe-policy:fixture",
    sourceFingerprint: "safe-source:fixture",
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.blocker, "missing-board-fill-summary");

  const unsafe = buildRuntimeBoardElectricalSummary(validInput({
    boardFillSummary: safeBoardFillSummary({ diagnosticOnly: false }),
  }));
  assert.equal(unsafe.ok, false);
  assert.equal(unsafe.blocker, "unsafe-board-fill-summary");

  const missingDimensions = buildRuntimeBoardElectricalSummary(validInput({
    boardFillSummary: safeBoardFillSummary({ boardCount: undefined }),
  }));
  assert.equal(missingDimensions.ok, false);
  assert.equal(missingDimensions.blocker, "missing-board-fill-dimensions");
});

test("runtime board electrical summary fails closed when source or policy fingerprint is missing", () => {
  const missingPolicy = buildRuntimeBoardElectricalSummary({
    boardFillSummary: safeBoardFillSummary({ policyFingerprint: "" }),
    sourceBackedBoardElectricalSummary: safeElectricalFixture({ policyFingerprint: "" }),
    selectedCurrentMa: 350,
    sourceFingerprint: "safe-source:fixture",
  });
  assert.equal(missingPolicy.ok, false);
  assert.equal(missingPolicy.blocker, "missing-policy-fingerprint");

  const missingSource = buildRuntimeBoardElectricalSummary({
    boardFillSummary: safeBoardFillSummary({ sourceFingerprint: "" }),
    sourceBackedBoardElectricalSummary: safeElectricalFixture({ sourceFingerprint: "" }),
    selectedCurrentMa: 350,
    policyFingerprint: "safe-policy:fixture",
  });
  assert.equal(missingSource.ok, false);
  assert.equal(missingSource.blocker, "missing-source-fingerprint");
});

test("runtime board electrical summary fails closed for unsafe raw row-like input", () => {
  const result = buildRuntimeBoardElectricalSummary(validInput({
    sourceBackedBoardElectricalSummary: {
      ...safeElectricalFixture(),
      BOARDS: [{ part_number: "RAW-BOARD-1", c1_vmax_v: 22.4 }],
      sourcePath: "C:\\ControlStack_RuntimeData\\novondb.json",
    },
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unsafe-raw-board-electrical-input");
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.donorEngineInvoked, false);
});

test("runtime board electrical summary rejects exact electrical exposure requests", () => {
  const result = buildRuntimeBoardElectricalSummary(validInput({
    requestExactElectricalValues: true,
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "unsupported-exact-electrical-exposure");
  assert.equal(result.exactElectricalValuesExposed, false);
  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
});

test("runtime board electrical summary output does not expose raw rows or exact electrical values", () => {
  const result = buildRuntimeBoardElectricalSummary(validInput());
  const serialised = JSON.stringify(result);

  assert.equal(result.rawBoardRowsReturned, false);
  assert.equal(result.rawDriverRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.rawUsersReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.safetyFlags.rawBoardRowsReturned, false);
  assert.equal(result.safetyFlags.rawDriverRowsReturned, false);
  assert.equal(result.safetyFlags.rawCurveRowsReturned, false);
  assert.equal(result.safetyFlags.rawUsersReturned, false);
  assert.equal(result.exactElectricalValuesExposed, false);
  assert.equal(serialised.includes("22.4"), false);
  assert.equal(serialised.includes("11.2"), false);
  assert.equal(serialised.includes("vfAtCurrentV"), false);
  assert.equal(serialised.includes("wattAtCurrentW"), false);
  assert.equal(serialised.includes("RAW-BOARD"), false);
  assert.equal(serialised.includes("BOARDS"), false);
  assert.equal(serialised.includes("DRIVERS"), false);
  assert.equal(serialised.includes("USERS"), false);
  assert.equal(serialised.includes("C:\\"), false);
});

test("runtime board electrical summary does not invoke donor Engine, mutate RuntimeData, generate IES, persist results, or add routes", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/engineRunTableRuntimeBoardElectricalSummary.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(/from\s+["'][^"']*run_engine/.test(sourceText), false);
  assert.equal(/run_engine\s*\(/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*electrical_sizer/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*BoardDataMaker/.test(sourceText), false);
  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serverText.includes("engineRunTableRuntimeBoardElectricalSummary"), false);
  assert.equal(serverText.includes("runtime-board-electrical"), false);
  assert.equal(serverText.includes("app.post"), false);

  const result = buildRuntimeBoardElectricalSummary(validInput());
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});
