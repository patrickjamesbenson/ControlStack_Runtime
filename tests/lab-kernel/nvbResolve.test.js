import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/nvbResolve.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function systemsFixture() {
  return [
    {
      family: 80,
      system: 80,
      label: "DNX 80",
      system_variant_1: "Square",
      Thermal_metal_volume_mm2: 360,
      thermal_air_volume_mm2: 7200,
      thermal_family_nominated_worst_case: false,
    },
    {
      family: 80,
      system: 80,
      label: "DNX 80 DI ",
      system_variant_1: "Square_DI",
      Thermal_metal_volume_mm2: 360,
      thermal_air_volume_mm2: 7200,
      thermal_family_nominated_worst_case: true,
    },
    {
      family: 60,
      system: 60,
      label: "DNX 60",
      system_variant_1: "Square",
      Thermal_metal_volume_mm2: 270,
      thermal_air_volume_mm2: 5400,
      thermal_family_nominated_worst_case: true,
    },
  ];
}

function opticsFixture() {
  return [
    {
      family: 80,
      system: 80,
      optic_bom_id: "80_Opal",
      optic_var_1: "Opal",
      spec_code: "OPL",
      emission_permission: "Direct",
      hot_test_battery_applies: "80_Square_Opal",
      eff_optical: 0.7,
      optic_internal_delta_ta_c: 35,
      room_ta_c: 25,
      optic_uplift_ta_c: 10,
    },
    {
      family: 80,
      system: 80,
      optic_bom_id: "80_Rope",
      optic_var_1: "Rope",
      spec_code: "ROP",
      emission_permission: "Indirect",
      hot_test_battery_applies: false,
      eff_optical: 0.7,
      optic_internal_delta_ta_c: 35,
      room_ta_c: 25,
      optic_uplift_ta_c: 10,
    },
    {
      family: 80,
      system: 80,
      optic_bom_id: "80_Comfort",
      optic_var_1: "Comfort",
      spec_code: "CMF",
      emission_permission: "Direct",
      hot_test_battery_applies: "80_Square_Opal",
      eff_optical: 0.7,
      optic_internal_delta_ta_c: 35,
      room_ta_c: 25,
      optic_uplift_ta_c: 10,
    },
  ];
}

function labFormFixture() {
  return [
    { kind: "ies", field: "[TEST]", order: 1 },
    { kind: "check", field: "thermal", order: 2 },
    { kind: "ies", field: "[LUMCAT]", order: 3 },
  ];
}

function selectionInput(overrides = {}) {
  return {
    testType: "Base Engine & Optic",
    selection: { family: "DNX 80", opticBomId: "80_Opal" },
    systems: systemsFixture(),
    optics: opticsFixture(),
    labForm: labFormFixture(),
    ...overrides,
  };
}

const exactExports = [
  "NVB_RESOLUTION_SCHEMA_ID",
  "NVB_RESOLUTION_SCHEMA_VERSION",
  "NVB_TEST_PATHS",
  "NvbResolutionContractError",
  "classifyNvbTestPath",
  "listNvbOpticsForFamily",
  "normaliseNvbFamily",
  "resolveNvbSelection",
  "splitNvbLabForm",
];

test("exports only the approved version-1 resolver interface and frozen constants", () => {
  assert.deepEqual(Object.keys(contract).sort(), exactExports.sort());
  assert.equal(contract.NVB_RESOLUTION_SCHEMA_ID, "controlstack.lab.nvb-resolution.v1");
  assert.equal(contract.NVB_RESOLUTION_SCHEMA_VERSION, 1);
  assert.deepEqual(contract.NVB_TEST_PATHS, ["gear_tray", "optic", "no_base"]);
  assert.equal(Object.isFrozen(contract.NVB_TEST_PATHS), true);
});

test("normalises bounded family values and classifies the three exact test paths", () => {
  assert.equal(contract.normaliseNvbFamily(80), 80);
  assert.equal(contract.normaliseNvbFamily("80.0"), 80);
  assert.equal(contract.normaliseNvbFamily("DNX 45"), 45);
  assert.equal(contract.normaliseNvbFamily("dnx-60"), 60);
  for (const value of [0, -1, 80.5, "80.5", "DNX", "family 80", null]) {
    assert.equal(contract.normaliseNvbFamily(value), null);
  }

  assert.equal(contract.classifyNvbTestPath("Base Engine"), "gear_tray");
  assert.equal(contract.classifyNvbTestPath("Base Engine & Optic"), "optic");
  assert.equal(contract.classifyNvbTestPath("No Base Luminiare"), "no_base");
  assert.equal(contract.classifyNvbTestPath("base engine"), null);
  assert.equal(contract.classifyNvbTestPath("No Base Luminaire"), null);
});

test("splits Lab-form rows in source order and fails closed on unknown kinds", () => {
  const rows = labFormFixture();
  const before = deepClone(rows);
  const output = contract.splitNvbLabForm(rows);
  assert.deepEqual(output.iesFields.map((row) => row.field), ["[TEST]", "[LUMCAT]"]);
  assert.deepEqual(output.checkFields.map((row) => row.field), ["thermal"]);
  assert.deepEqual(rows, before);
  assertDeepFrozen(output);
  assert.throws(
    () => contract.splitNvbLabForm([...rows, { kind: "other", field: "unsafe" }]),
    contract.NvbResolutionContractError,
  );
});

test("lists immutable family optics in stable order with exact direct filtering", () => {
  const optics = opticsFixture();
  const before = deepClone(optics);
  const all = contract.listNvbOpticsForFamily(optics, 80);
  assert.deepEqual(all.map((row) => row.optic_bom_id), ["80_Comfort", "80_Opal", "80_Rope"]);
  const direct = contract.listNvbOpticsForFamily(optics, "DNX 80", { directOnly: true });
  assert.deepEqual(direct.map((row) => row.optic_bom_id), ["80_Comfort", "80_Opal"]);
  assert.deepEqual(optics, before);
  assertDeepFrozen(all);
  assertDeepFrozen(direct);
});

test("resolves the exact optic ID, governing thermals and Lab-form profile", () => {
  const input = selectionInput();
  const before = deepClone(input);
  const output = contract.resolveNvbSelection(input);

  assert.deepEqual(output, {
    schemaId: "controlstack.lab.nvb-resolution.v1",
    schemaVersion: 1,
    path: "optic",
    family: 80,
    status: "resolved",
    optic: {
      opticBomId: "80_Opal",
      opticVariant: "Opal",
      specCode: "OPL",
      emissionPermission: "Direct",
      hotTestEvidenceRef: "80_Square_Opal",
      opticalEfficiency: 0.7,
      opticInternalDeltaTaC: 35,
      roomTaC: 25,
      opticUpliftTaC: 10,
    },
    governingThermals: {
      systemLabel: "DNX 80 DI",
      systemVariant: "Square_DI",
      metalAreaMm2: 360,
      airAreaMm2: 7200,
    },
    labForm: {
      iesFields: [
        { kind: "ies", field: "[TEST]", order: 1 },
        { kind: "ies", field: "[LUMCAT]", order: 3 },
      ],
      checkFields: [{ kind: "check", field: "thermal", order: 2 }],
    },
    blockers: [],
    readOnly: true,
  });
  assert.deepEqual(input, before);
  assertDeepFrozen(output);
  assert.equal("emergency_capable" in output.optic, false);
  assert.equal("emergency" in output.optic, false);
});

test("uses exact family-plus-variant fallback only when no optic ID is supplied", () => {
  const input = selectionInput({
    selection: { family: 80, opticVariant: "Comfort" },
  });
  const output = contract.resolveNvbSelection(input);
  assert.equal(output.status, "resolved");
  assert.equal(output.optic.opticBomId, "80_Comfort");
  assert.equal(output.optic.opticVariant, "Comfort");

  const wrongId = contract.resolveNvbSelection(selectionInput({
    selection: { family: 80, opticBomId: "missing", opticVariant: "Comfort" },
  }));
  assert.equal(wrongId.status, "unresolved");
  assert.deepEqual(wrongId.blockers, ["optic_match_missing"]);
});

test("resolves gear-tray and no-base paths without inventing an optic", () => {
  for (const [testType, path] of [
    ["Base Engine", "gear_tray"],
    ["No Base Luminiare", "no_base"],
  ]) {
    const output = contract.resolveNvbSelection(selectionInput({
      testType,
      selection: { family: 80 },
    }));
    assert.equal(output.status, "resolved");
    assert.equal(output.path, path);
    assert.equal(output.optic, null);
    assert.equal(output.governingThermals.systemLabel, "DNX 80 DI");
  }
});

test("returns deterministic blockers for missing or duplicate governing rows", () => {
  const missing = contract.resolveNvbSelection(selectionInput({
    systems: systemsFixture().filter((row) => row.family !== 80 || row.thermal_family_nominated_worst_case !== true),
  }));
  assert.equal(missing.status, "unresolved");
  assert.equal(missing.governingThermals, null);
  assert.deepEqual(missing.blockers, ["governing_thermal_row_missing"]);

  const duplicateSystems = systemsFixture();
  duplicateSystems[0].thermal_family_nominated_worst_case = true;
  const duplicate = contract.resolveNvbSelection(selectionInput({ systems: duplicateSystems }));
  assert.equal(duplicate.status, "unresolved");
  assert.equal(duplicate.governingThermals, null);
  assert.deepEqual(duplicate.blockers, ["governing_thermal_row_duplicate"]);
});

test("fails closed on missing or duplicate optic matches and unknown Lab-form kinds", () => {
  const missingSelection = contract.resolveNvbSelection(selectionInput({
    selection: { family: 80 },
  }));
  assert.equal(missingSelection.status, "unresolved");
  assert.deepEqual(missingSelection.blockers, ["optic_selection_missing"]);

  const duplicateOptics = opticsFixture();
  duplicateOptics.push({ ...deepClone(duplicateOptics[0]) });
  const duplicate = contract.resolveNvbSelection(selectionInput({ optics: duplicateOptics }));
  assert.equal(duplicate.status, "unresolved");
  assert.deepEqual(duplicate.blockers, ["optic_match_duplicate"]);

  const unknownKind = contract.resolveNvbSelection(selectionInput({
    labForm: [...labFormFixture(), { kind: "other", field: "unsupported" }],
  }));
  assert.equal(unknownKind.status, "unresolved");
  assert.deepEqual(unknownKind.blockers, ["unknown_lab_form_kind"]);
});

test("rejects malformed top-level shapes and blocks non-finite selected source values", () => {
  assert.throws(
    () => contract.resolveNvbSelection({ ...selectionInput(), extra: true }),
    contract.NvbResolutionContractError,
  );
  assert.throws(
    () => contract.resolveNvbSelection({ ...selectionInput(), systems: {} }),
    contract.NvbResolutionContractError,
  );

  const optics = opticsFixture();
  optics[0].eff_optical = Number.NaN;
  const output = contract.resolveNvbSelection(selectionInput({ optics }));
  assert.equal(output.status, "unresolved");
  assert.deepEqual(output.blockers, ["invalid_optic_row"]);
  assert.equal(output.optic, null);
});

test("offline fixture rows and equivalent injected rows produce identical fail-closed output", () => {
  const systems = JSON.parse(readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvb/systems.json", import.meta.url),
    "utf8",
  ));
  const optics = JSON.parse(readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvb/optics.json", import.meta.url),
    "utf8",
  ));
  const labForm = JSON.parse(readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvb/lab_form.json", import.meta.url),
    "utf8",
  ));
  const input = {
    testType: "Base Engine & Optic",
    selection: { family: 80, opticBomId: "80_Opal" },
    systems,
    optics,
    labForm,
  };
  const fromFixture = contract.resolveNvbSelection(input);
  const fromInjectedEquivalent = contract.resolveNvbSelection(deepClone(input));
  assert.deepEqual(fromInjectedEquivalent, fromFixture);
  assert.equal(fromFixture.status, "unresolved");
  assert.equal(fromFixture.blockers.includes("unknown_lab_form_kind"), true);
  assert.equal(fromFixture.optic.hotTestEvidenceRef, "80_Square_Opal");
  assert.equal("emergency" in fromFixture.optic, false);
});

test("production module contains no loader, runtime, mutation, clock, or emergency-derivation seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvbResolve.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "node:fs", "node:http", "fetch(", "XMLHttpRequest", "localStorage", "sessionStorage", "indexedDB",
    "document.", "window.", "Date.now", "Math.random", "process.env", "http://", "https://", "file:",
    "ControlStack_RuntimeData", "novondb.json", "emergency_capable", "slug_family_mismatch",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
  for (const retired of [
    "loadNvb", "toFamily", "familyWorstCase", "testTypeToPath", "resolveOptic", "labFormSplit", "opticsForFamily",
  ]) {
    assert.equal(new RegExp(`export\\s+(?:async\\s+)?(?:const|function|class)\\s+${retired}\\b`).test(source), false);
  }
  assert.equal(source.includes("hotTestEvidenceRef"), true);
  assert.equal(source.includes("parseInt"), false);
});
