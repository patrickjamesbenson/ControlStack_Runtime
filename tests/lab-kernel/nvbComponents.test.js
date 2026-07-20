import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/nvbComponents.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function board(overrides = {}) {
  return {
    novon_family: "Smart Pro",
    led_chip: "LM301H",
    vendor: "Samsung",
    c1_cct: 4000,
    c2_cct: null,
    channels: 1,
    c1_cri_min: 80,
    tc_c: 85,
    life_hours_at_tc: 80000,
    max_ambient_ta: 55,
    warranty_10y_failpct: 0.05,
    datasheet_url: "source-LM301H",
    source_note: "ignored source metadata",
    ...overrides,
  };
}

function driver(overrides = {}) {
  return {
    model: "DRV-B",
    vendor: "Vendor B",
    series: "Series B",
    iout_max_mA: 1050,
    pout_max_w: 55,
    eff_driver: 0.94,
    tc_C_max: 85,
    ta_C_max: 55,
    life_hours: "100000 hrs",
    pf: 0.98,
    ip: "IP20",
    datasheet_url: "source-driver-b",
    source_note: "ignored source metadata",
    ...overrides,
  };
}

function optic(overrides = {}) {
  return {
    optic_bom_id: "80_Opal",
    family: 80,
    system: 80,
    optic_var_1: "Opal",
    spec_code: "OPL",
    emission_permission: "Direct",
    hot_test_battery_applies: "80_Square_Opal",
    eff_optical: 0.7,
    optic_internal_delta_ta_c: 35,
    room_ta_c: 25,
    optic_uplift_ta_c: 10,
    baseline_slug: "must-not-be-projected",
    ...overrides,
  };
}

const exactExports = [
  "COMPONENT_CATALOGUE_SCHEMA_ID",
  "COMPONENT_CATALOGUE_SCHEMA_VERSION",
  "ComponentProjectionContractError",
  "projectBoardPlatforms",
  "projectComponentCatalogue",
  "projectDrivers",
  "projectOptics",
];

test("exports only the approved version-2 component projection interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), exactExports.sort());
  assert.equal(contract.COMPONENT_CATALOGUE_SCHEMA_ID, "controlstack.lab.component-catalogue.v2");
  assert.equal(contract.COMPONENT_CATALOGUE_SCHEMA_VERSION, 2);
});

test("groups board platforms deterministically with numeric-first CCT ordering and exact tunable rules", () => {
  const rows = [
    board({ c1_cct: "4000.0" }),
    board({ c1_cct: "3000", c2_cct: "6500.0", channels: 1 }),
    board({ novon_family: "Alpha", led_chip: "Chip A", vendor: "Vendor A", c1_cct: "Amber", channels: 2 }),
    board({ novon_family: "Alpha", led_chip: "Chip A", vendor: "Vendor A", c1_cct: "2700", channels: 1 }),
  ];
  const before = deepClone(rows);
  const output = contract.projectBoardPlatforms(rows);

  assert.deepEqual(output, [
    {
      platformId: "Alpha__Chip A__Vendor A",
      novonFamily: "Alpha",
      ledChip: "Chip A",
      vendor: "Vendor A",
      ccts: ["2700", "Amber"],
      tunable: true,
      criMin: 80,
      tcMaxC: 85,
      lifeHoursAtTc: 80000,
      maxInternalAmbientTaC: 55,
      warranty10yFailPct: 0.05,
      datasheetRef: "source-LM301H",
      variants: 2,
      readOnly: true,
    },
    {
      platformId: "Smart Pro__LM301H__Samsung",
      novonFamily: "Smart Pro",
      ledChip: "LM301H",
      vendor: "Samsung",
      ccts: ["3000", "4000", "6500"],
      tunable: true,
      criMin: 80,
      tcMaxC: 85,
      lifeHoursAtTc: 80000,
      maxInternalAmbientTaC: 55,
      warranty10yFailPct: 0.05,
      datasheetRef: "source-LM301H",
      variants: 2,
      readOnly: true,
    },
  ]);
  assert.deepEqual(rows, before);
  assertDeepFrozen(output);

  const reversed = contract.projectBoardPlatforms([...rows].reverse());
  assert.deepEqual(reversed, output);
});

test("does not infer tunable from multiple first-channel CCT variants", () => {
  const output = contract.projectBoardPlatforms([
    board({ c1_cct: 3000 }),
    board({ c1_cct: 4000 }),
  ]);
  assert.equal(output[0].tunable, false);
  assert.deepEqual(output[0].ccts, ["3000", "4000"]);
});

test("fails closed on conflicting board platform scalars rather than using first-row wins", () => {
  for (const conflicting of [
    { c1_cri_min: 90 },
    { tc_c: 90 },
    { life_hours_at_tc: 60000 },
    { max_ambient_ta: 45 },
    { warranty_10y_failpct: 0.1 },
    { datasheet_url: "source-other" },
  ]) {
    assert.throws(
      () => contract.projectBoardPlatforms([board(), board(conflicting)]),
      (error) => error instanceof contract.ComponentProjectionContractError
        && error.code === "board_platform_scalar_conflict"
        && error.details.blockers.length === 1,
    );
  }
});

test("projects drivers in stable model order and deduplicates only exact identical models", () => {
  const rows = [driver(), driver({ model: "DRV-A", vendor: "Vendor A", series: "Series A" }), driver()];
  const before = deepClone(rows);
  const output = contract.projectDrivers(rows);

  assert.deepEqual(output.map((row) => row.model), ["DRV-A", "DRV-B"]);
  assert.deepEqual(output[1], {
    model: "DRV-B",
    vendor: "Vendor B",
    series: "Series B",
    outputCurrentMaxmA: 1050,
    outputPowerMaxW: 55,
    efficiency: 0.94,
    tcMaxC: 85,
    taMaxC: 55,
    lifeHours: "100000 hrs",
    powerFactor: 0.98,
    ingressProtection: "IP20",
    datasheetRef: "source-driver-b",
    readOnly: true,
  });
  assert.deepEqual(rows, before);
  assertDeepFrozen(output);

  assert.throws(
    () => contract.projectDrivers([driver(), driver({ pout_max_w: 60 })]),
    (error) => error instanceof contract.ComponentProjectionContractError
      && error.code === "driver_model_conflict",
  );
});

test("projects optics in stable exact BOM-ID order and keeps hot-test evidence opaque", () => {
  const rows = [optic(), optic({ optic_bom_id: "45_Daisy", family: 45, system: 45, optic_var_1: "Daisy", hot_test_battery_applies: "45_Square_Daisy_Narrow" })];
  const before = deepClone(rows);
  const output = contract.projectOptics(rows);

  assert.deepEqual(output.map((row) => row.opticBomId), ["45_Daisy", "80_Opal"]);
  assert.deepEqual(output[1], {
    opticBomId: "80_Opal",
    family: 80,
    opticVariant: "Opal",
    specCode: "OPL",
    emissionPermission: "Direct",
    hotTestEvidenceRef: "80_Square_Opal",
    opticalEfficiency: 0.7,
    referenceRoomTaC: 25,
    referenceInternalTaC: 35,
    opticThermalRiseTaC: 10,
    readOnly: true,
  });
  assert.equal("emergencyCapable" in output[1], false);
  assert.equal("baselineSlug" in output[1], false);
  assert.deepEqual(rows, before);
  assertDeepFrozen(output);

  assert.throws(
    () => contract.projectOptics([optic(), optic()]),
    (error) => error instanceof contract.ComponentProjectionContractError
      && error.code === "duplicate_optic_bom_id",
  );
});

test("maps corrected thermal triplets and fails closed on missing or contradictory optic evidence", () => {
  const varied = contract.projectOptics([
    optic({
      optic_bom_id: "80_Comfort",
      optic_var_1: "Comfort",
      optic_internal_delta_ta_c: 40,
      optic_uplift_ta_c: 15,
    }),
  ]);
  assert.deepEqual(
    {
      referenceRoomTaC: varied[0].referenceRoomTaC,
      referenceInternalTaC: varied[0].referenceInternalTaC,
      opticThermalRiseTaC: varied[0].opticThermalRiseTaC,
    },
    { referenceRoomTaC: 25, referenceInternalTaC: 40, opticThermalRiseTaC: 15 },
  );
  for (const legacyName of ["opticInternalDeltaTaC", "roomTaC", "opticUpliftTaC"]) {
    assert.equal(legacyName in varied[0], false);
  }

  assert.throws(
    () => contract.projectOptics([optic({ optic_uplift_ta_c: 15 })]),
    (error) => error instanceof contract.ComponentProjectionContractError
      && error.code === "thermal_triplet_mismatch",
  );

  assert.throws(
    () => contract.projectOptics([optic({ optic_uplift_ta_c: undefined })]),
    (error) => error instanceof contract.ComponentProjectionContractError
      && error.code === "thermal_triplet_missing",
  );

  const decimal = contract.projectOptics([optic({
    room_ta_c: 0.1,
    optic_uplift_ta_c: 0.2,
    optic_internal_delta_ta_c: 0.3,
  })]);
  assert.deepEqual(
    [decimal[0].referenceRoomTaC, decimal[0].opticThermalRiseTaC, decimal[0].referenceInternalTaC],
    [0.1, 0.2, 0.3],
  );
});

test("builds the exact immutable catalogue envelope from caller-supplied rows", () => {
  const input = {
    sourceRevision: "fixture-2026-07-19",
    boards: [board()],
    drivers: [driver()],
    optics: [optic()],
  };
  const before = deepClone(input);
  const output = contract.projectComponentCatalogue(input);

  assert.deepEqual(Object.keys(output), ["schemaId", "schemaVersion", "sourceRevision", "platforms", "drivers", "optics", "readOnly"]);
  assert.equal(output.schemaId, "controlstack.lab.component-catalogue.v2");
  assert.equal(output.schemaVersion, 2);
  assert.equal(output.sourceRevision, "fixture-2026-07-19");
  assert.equal(output.platforms.length, 1);
  assert.equal(output.drivers.length, 1);
  assert.equal(output.optics.length, 1);
  assert.equal(output.readOnly, true);
  assert.deepEqual(input, before);
  assertDeepFrozen(output);

  const equivalentAdapterRows = deepClone(input);
  assert.deepEqual(contract.projectComponentCatalogue(equivalentAdapterRows), output);
});

test("projects committed offline driver and optic fixture rows without embedding them", () => {
  const drivers = JSON.parse(readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvb/drivers_unique.json", import.meta.url),
    "utf8",
  ));
  const optics = JSON.parse(readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvb/optics.json", import.meta.url),
    "utf8",
  ));

  const driverProjection = contract.projectDrivers(drivers);
  const opticProjection = contract.projectOptics(optics);
  assert.equal(driverProjection.length, drivers.length);
  assert.equal(opticProjection.length, optics.length);
  assert.deepEqual(driverProjection.map((row) => row.model), [...driverProjection.map((row) => row.model)].sort());
  assert.deepEqual(opticProjection.map((row) => row.opticBomId), [...opticProjection.map((row) => row.opticBomId)].sort());
});

test("fails closed on malformed source revisions, rows, identifiers, and non-finite values", () => {
  const invalidInputs = [
    null,
    { sourceRevision: "fixture", boards: [], drivers: [], optics: [], extra: true },
    { sourceRevision: "", boards: [], drivers: [], optics: [] },
    { sourceRevision: "../fixture", boards: [], drivers: [], optics: [] },
    { sourceRevision: "fixture", boards: {}, drivers: [], optics: [] },
    { sourceRevision: "fixture", boards: [new Date()], drivers: [], optics: [] },
    { sourceRevision: "fixture", boards: [board({ novon_family: "" })], drivers: [], optics: [] },
    { sourceRevision: "fixture", boards: [board({ c1_cct: Number.NaN })], drivers: [], optics: [] },
    { sourceRevision: "fixture", boards: [board({ channels: 1.5 })], drivers: [], optics: [] },
    { sourceRevision: "fixture", boards: [], drivers: [driver({ model: "" })], optics: [] },
    { sourceRevision: "fixture", boards: [], drivers: [driver({ eff_driver: Number.POSITIVE_INFINITY })], optics: [] },
    { sourceRevision: "fixture", boards: [], drivers: [], optics: [optic({ optic_bom_id: "" })] },
    { sourceRevision: "fixture", boards: [], drivers: [], optics: [optic({ family: null, system: null })] },
  ];
  for (const input of invalidInputs) {
    assert.throws(() => contract.projectComponentCatalogue(input), contract.ComponentProjectionContractError);
  }
});

test("production module contains no loader, persistence, clock, embedded catalogue, or Selector seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvbComponents.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "fetch(", "XMLHttpRequest", "node:fs", "node:path", "localStorage", "sessionStorage", "indexedDB",
    "Date.now", "Math.random", "process.env", "loadComponents", "boards.json", "drivers.json", "optics.json",
    "selectorReference", "option generation", "http://", "https://",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
  for (const retired of ["groupBoardPlatforms", "uniqueDrivers", "loadComponents"]) {
    assert.equal(new RegExp(`export\\s+(?:const|function|class)\\s+${retired}\\b`).test(source), false);
  }
  for (const forbiddenSemantic of [
    "opticInternalDeltaTaC", "roomTaC", "opticUpliftTaC", "derivedInternalTaC", "curveLookupTaC",
    "verifiedLumensPerMetre", "verifiedLmPerM", "boardTaC",
  ]) {
    assert.equal(source.includes(forbiddenSemantic), false, `${forbiddenSemantic} must remain absent`);
  }
  for (const corrected of ["referenceRoomTaC", "referenceInternalTaC", "opticThermalRiseTaC"]) {
    assert.equal(source.includes(corrected), true, `${corrected} must be projected`);
  }
  assert.equal(source.includes("optic_internal_delta_ta_c"), true);
  assert.equal(source.includes("optic_uplift_ta_c"), true);
});
