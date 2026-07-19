import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/zencontrolEmergency.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function candidate(overrides = {}) {
  return {
    stringVoltageV: 25,
    powerW: 2.5,
    durationHours: 2,
    designLifeYears: 10,
    ...overrides,
  };
}

const exactExports = [
  "EMERGENCY_BATTERY_MATRIX",
  "EMERGENCY_MODELS",
  "EMERGENCY_SELECTION_SCHEMA_ID",
  "EMERGENCY_SELECTION_SCHEMA_VERSION",
  "EmergencySelectionContractError",
  "selectEmergencyCandidate",
];

const unconfirmedBlockers = [
  "battery_capacity_unconfirmed",
  "battery_energy_unconfirmed",
  "battery_cell_arrangement_unconfirmed",
  "battery_connector_unconfirmed",
  "battery_lead_unconfirmed",
  "battery_pack_temperature_unconfirmed",
  "output_current_tolerance_unconfirmed",
  "converter_efficiency_unconfirmed",
  "temperature_derating_unconfirmed",
];

test("exports only the approved version-1 emergency-selection interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), exactExports.sort());
  assert.equal(contract.EMERGENCY_SELECTION_SCHEMA_ID, "controlstack.lab.emergency-selection.v1");
  assert.equal(contract.EMERGENCY_SELECTION_SCHEMA_VERSION, 1);
  assertDeepFrozen(contract.EMERGENCY_MODELS);
  assertDeepFrozen(contract.EMERGENCY_BATTERY_MATRIX);
});

test("projects the exact immutable advisory candidate shape", () => {
  const input = candidate();
  const before = deepClone(input);
  const result = contract.selectEmergencyCandidate(input);

  assert.deepEqual(result, {
    schemaId: "controlstack.lab.emergency-selection.v1",
    schemaVersion: 1,
    state: "candidate",
    modelId: "zc-em-smart-50",
    isolation: "SELV",
    outputVoltageRangeV: [10, 50],
    selectedPowerW: 2.5,
    nominalDriveCurrentmA: 100,
    nominalCurrentStatus: "derived_exact",
    durationHours: 2,
    designLifeYears: 10,
    batteryPackCode: "zc-batt-1B2-ADA",
    procurementRelease: false,
    procurementBlockers: unconfirmedBlockers,
    engineeringWarnings: ["nominal_current_is_arithmetic_only"],
    assemblyVerification: {
      emergency: null,
      ewisCartridge: null,
    },
    readOnly: true,
  });
  assert.deepEqual(input, before);
  assertDeepFrozen(result);
});

test("keeps published, derived, and unconfirmed facts distinct", () => {
  const low = contract.EMERGENCY_MODELS["zc-em-smart-50"];
  const high = contract.EMERGENCY_MODELS["zc-em-smart-250"];
  assert.deepEqual(low, {
    modelId: "zc-em-smart-50",
    isolation: "SELV",
    outputVoltageRangeV: [10, 50],
    publishedPowerW: [1.5, 2.5, 3.5],
    evidenceStatus: "published",
  });
  assert.deepEqual(high, {
    modelId: "zc-em-smart-250",
    isolation: "non-SELV",
    outputVoltageRangeV: [50, 250],
    publishedPowerW: [2.5, 3.5, 4.5],
    evidenceStatus: "published",
  });

  const result = contract.selectEmergencyCandidate(candidate({ stringVoltageV: 100, powerW: 3.5 }));
  assert.equal(result.nominalDriveCurrentmA, 35);
  assert.equal(result.nominalCurrentStatus, "derived_exact");
  assert.deepEqual(result.procurementBlockers, unconfirmedBlockers);
  assert.equal(result.procurementRelease, false);
  assert.deepEqual(result.assemblyVerification, { emergency: null, ewisCartridge: null });
});

test("covers every published model, power, duration, and design-life battery row", () => {
  const representativeVoltage = {
    "zc-em-smart-50": 25,
    "zc-em-smart-250": 100,
  };
  let publishedRows = 0;
  let conflictingRows = 0;

  for (const [modelId, powers] of Object.entries(contract.EMERGENCY_BATTERY_MATRIX)) {
    for (const [powerW, durations] of Object.entries(powers)) {
      for (const [durationHours, designLives] of Object.entries(durations)) {
        for (const [designLifeYears, entry] of Object.entries(designLives)) {
          const result = contract.selectEmergencyCandidate({
            stringVoltageV: representativeVoltage[modelId],
            powerW: Number(powerW),
            durationHours: Number(durationHours),
            designLifeYears: Number(designLifeYears),
          });
          if (entry.evidenceStatus === "published") {
            publishedRows += 1;
            assert.equal(result.state, "candidate");
            assert.equal(result.modelId, modelId);
            assert.equal(result.batteryPackCode, entry.packCode);
            assert.equal(result.procurementRelease, false);
          } else {
            conflictingRows += 1;
            assert.equal(result.state, "blocked");
            assert.equal(result.batteryPackCode, null);
            assert.equal(result.procurementBlockers[0], "battery_pack_code_conflict");
          }
        }
      }
    }
  }
  assert.equal(publishedRows, 35);
  assert.equal(conflictingRows, 1);
});

test("selects only by published voltage windows and blocks the shared 50 V boundary", () => {
  const low = contract.selectEmergencyCandidate(candidate({ stringVoltageV: 10, powerW: 1.5 }));
  assert.equal(low.state, "candidate");
  assert.equal(low.modelId, "zc-em-smart-50");

  const justBelow = contract.selectEmergencyCandidate(candidate({ stringVoltageV: 49.999, powerW: 1.5 }));
  assert.equal(justBelow.modelId, "zc-em-smart-50");

  const boundary = contract.selectEmergencyCandidate(candidate({ stringVoltageV: 50 }));
  assert.deepEqual(boundary, {
    schemaId: "controlstack.lab.emergency-selection.v1",
    schemaVersion: 1,
    state: "blocked",
    modelId: null,
    isolation: null,
    outputVoltageRangeV: null,
    selectedPowerW: null,
    nominalDriveCurrentmA: null,
    nominalCurrentStatus: null,
    durationHours: null,
    designLifeYears: null,
    batteryPackCode: null,
    procurementRelease: false,
    procurementBlockers: ["voltage_boundary_requires_engineering_review"],
    engineeringWarnings: [],
    assemblyVerification: { emergency: null, ewisCartridge: null },
    readOnly: true,
  });

  const justAbove = contract.selectEmergencyCandidate(candidate({ stringVoltageV: 50.001, powerW: 2.5 }));
  assert.equal(justAbove.modelId, "zc-em-smart-250");

  const high = contract.selectEmergencyCandidate(candidate({ stringVoltageV: 250, powerW: 2.5 }));
  assert.equal(high.state, "candidate");
  assert.equal(high.modelId, "zc-em-smart-250");
});

test("blocks voltages outside published windows without inventing a model", () => {
  for (const [stringVoltageV, blocker] of [
    [9.999, "voltage_below_published_range"],
    [250.001, "voltage_above_published_range"],
  ]) {
    const result = contract.selectEmergencyCandidate(candidate({ stringVoltageV }));
    assert.equal(result.state, "blocked");
    assert.equal(result.modelId, null);
    assert.equal(result.isolation, null);
    assert.equal(result.outputVoltageRangeV, null);
    assert.deepEqual(result.procurementBlockers, [blocker]);
    assert.equal(result.procurementRelease, false);
    assert.deepEqual(result.assemblyVerification, { emergency: null, ewisCartridge: null });
  }
});

test("blocks unsupported published power, duration, and design life fail-closed", () => {
  const unsupportedPower = contract.selectEmergencyCandidate(candidate({ powerW: 4.5 }));
  assert.equal(unsupportedPower.state, "blocked");
  assert.equal(unsupportedPower.modelId, "zc-em-smart-50");
  assert.equal(unsupportedPower.selectedPowerW, null);
  assert.equal(unsupportedPower.nominalDriveCurrentmA, null);
  assert.deepEqual(unsupportedPower.procurementBlockers, ["unsupported_published_power"]);

  const unsupportedDuration = contract.selectEmergencyCandidate(candidate({ durationHours: 4 }));
  assert.equal(unsupportedDuration.state, "blocked");
  assert.equal(unsupportedDuration.durationHours, null);
  assert.deepEqual(unsupportedDuration.procurementBlockers, ["unsupported_published_duration"]);

  const unsupportedLife = contract.selectEmergencyCandidate(candidate({ designLifeYears: 7 }));
  assert.equal(unsupportedLife.state, "blocked");
  assert.equal(unsupportedLife.designLifeYears, null);
  assert.deepEqual(unsupportedLife.procurementBlockers, ["unsupported_published_design_life"]);

  const combined = contract.selectEmergencyCandidate(candidate({ powerW: 4.5, durationHours: 4, designLifeYears: 7 }));
  assert.deepEqual(combined.procurementBlockers, [
    "unsupported_published_power",
    "unsupported_published_duration",
    "unsupported_published_design_life",
  ]);
});

test("blocks the known conflicting battery publication without selecting either code", () => {
  const result = contract.selectEmergencyCandidate({
    stringVoltageV: 100,
    powerW: 4.5,
    durationHours: 3,
    designLifeYears: 10,
  });
  assert.equal(result.state, "blocked");
  assert.equal(result.modelId, "zc-em-smart-250");
  assert.equal(result.batteryPackCode, null);
  assert.deepEqual(result.procurementBlockers, ["battery_pack_code_conflict", ...unconfirmedBlockers]);
  assert.equal(result.procurementRelease, false);
  assert.deepEqual(result.assemblyVerification, { emergency: null, ewisCartridge: null });
});

test("uses exact nominal arithmetic without tolerance or efficiency claims", () => {
  const cases = [
    [1.5, 25, 60],
    [2.5, 100, 25],
    [3.5, 70, 50],
    [4.5, 225, 20],
  ];
  for (const [powerW, stringVoltageV, expectedCurrent] of cases) {
    const result = contract.selectEmergencyCandidate(candidate({
      powerW,
      stringVoltageV,
      durationHours: 1,
      designLifeYears: 5,
    }));
    assert.equal(result.nominalDriveCurrentmA, expectedCurrent);
    assert.equal(result.nominalCurrentStatus, "derived_exact");
    assert.deepEqual(result.engineeringWarnings, ["nominal_current_is_arithmetic_only"]);
  }
});

test("rejects malformed shape, non-numeric, non-finite, and non-positive inputs", () => {
  const invalid = [
    null,
    [],
    {},
    { ...candidate(), extra: true },
    { ...candidate(), stringVoltageV: "25" },
    { ...candidate(), powerW: Number.NaN },
    { ...candidate(), durationHours: Number.POSITIVE_INFINITY },
    { ...candidate(), designLifeYears: "10" },
    { ...candidate(), stringVoltageV: 0 },
    { ...candidate(), stringVoltageV: -1 },
    { ...candidate(), powerW: 0 },
    { ...candidate(), powerW: -1 },
  ];
  for (const input of invalid) {
    assert.throws(
      () => contract.selectEmergencyCandidate(input),
      (error) => error instanceof contract.EmergencySelectionContractError,
    );
  }
});

test("is deterministic and never mutates caller input or exported evidence tables", () => {
  const input = candidate({ stringVoltageV: 37.5, powerW: 3.5, durationHours: 3, designLifeYears: 10 });
  const beforeInput = deepClone(input);
  const beforeModels = deepClone(contract.EMERGENCY_MODELS);
  const beforeMatrix = deepClone(contract.EMERGENCY_BATTERY_MATRIX);
  const first = contract.selectEmergencyCandidate(input);
  const second = contract.selectEmergencyCandidate(input);

  assert.deepEqual(first, second);
  assert.notEqual(first, second);
  assert.deepEqual(input, beforeInput);
  assert.deepEqual(contract.EMERGENCY_MODELS, beforeModels);
  assert.deepEqual(contract.EMERGENCY_BATTERY_MATRIX, beforeMatrix);
  assertDeepFrozen(first);
});

test("production module contains no ordering, source URL, persistence, route, or retired selector seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/zencontrolEmergency.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "fetch(", "XMLHttpRequest", "node:fs", "node:path", "localStorage", "sessionStorage", "indexedDB",
    "Date.now", "Math.random", "process.env", "http://", "https://", "FileReader", "FormData",
    "purchaseOrder", "releaseOrder", "_EMERGENCY_VERIFIED", "_EWIS_CARTRIDGE_VERIFIED",
    "batteryCapacity", "batteryWh", "cellSeries", "cellParallel", "efficiencyPercent", "currentTolerance",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
  for (const retired of [
    "EM_SOURCES", "EM_MODELS", "EM_COMMON", "EM_DATASHEETS", "EM_BATTERY", "EM_CONFLICTS", "EM_UNCONFIRMED",
    "pickModel", "emergencyCurrentmA", "currentEnvelope", "selectEmergency",
  ]) {
    assert.equal(new RegExp(`export\\s+(?:const|function|class)\\s+${retired}\\b`).test(source), false);
  }
});
