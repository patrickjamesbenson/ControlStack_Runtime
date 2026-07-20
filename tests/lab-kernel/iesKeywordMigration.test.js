import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CANONICAL_KEYWORD_DEFINITIONS,
  CANONICAL_KEYWORDS,
  INTERNAL_AMBIENT_POLICY,
  KEYWORD_PROFILE_ID,
  validateKeywordVocabulary,
} from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";
import {
  NVB_RESOLUTION_SCHEMA_ID,
  NVB_RESOLUTION_SCHEMA_VERSION,
  resolveNvbSelection,
} from "../../packages/lab-kernel/ies-toolkit/nvbResolve.js";
import {
  COMPONENT_CATALOGUE_SCHEMA_ID,
  COMPONENT_CATALOGUE_SCHEMA_VERSION,
  projectOptics,
} from "../../packages/lab-kernel/ies-toolkit/nvbComponents.js";
import {
  NVB_LAB_ADAPTER_SCHEMA_ID,
  NVB_LAB_ADAPTER_SCHEMA_VERSION,
  adaptNvbResolution,
} from "../../packages/lab-kernel/ies-toolkit/nvbLabAdapter.js";

const read = (relativePath) => readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");

const EXPECTED_KEYWORDS = Object.freeze([
  "TEST",
  "TESTLAB",
  "ISSUEDATE",
  "MANUFAC",
  "LUMCAT",
  "LUMINAIRE",
  "LAMP",
  "_CRI",
  "_COLORTEMP",
  "_INTERNAL_AMBIENT_TA_C",
  "_DRIVER",
  "_DRIVER_SETTING",
  "_GEAR_TRAY_REF_ID",
  "_OPTIC_REF_ID",
  "_EMERGENCY_VERIFIED",
  "_EWIS_CARTRIDGE_VERIFIED",
]);

const EXPECTED_OWNERS = Object.freeze([
  "lab-provenance",
  "lab-constant",
  "lab-provenance",
  "lab-constant",
  "project-assembly",
  "project-assembly",
  "project-assembly",
  "project-selection",
  "project-selection",
  "sealed-reference",
  "run-engine",
  "run-engine",
  "lab-provenance",
  "lab-provenance",
  "lab-assembly-approval",
  "lab-assembly-approval",
]);

test("active lab form is the exact canonical 16-field profile with sealed-reference internal ambient ownership", () => {
  const form = JSON.parse(read("packages/lab-kernel/ies-toolkit/nvb/lab_form.json"));
  const validation = validateKeywordVocabulary(form);

  assert.equal(KEYWORD_PROFILE_ID, "controlstack.lab.ies-keywords.v1");
  assert.deepEqual(CANONICAL_KEYWORDS, EXPECTED_KEYWORDS);
  assert.deepEqual(
    CANONICAL_KEYWORD_DEFINITIONS.map(({ order, key, owner }) => ({ order, key, owner })),
    EXPECTED_KEYWORDS.map((key, index) => ({ order: index + 1, key, owner: EXPECTED_OWNERS[index] })),
  );
  assert.deepEqual(INTERNAL_AMBIENT_POLICY, {
    key: "_INTERNAL_AMBIENT_TA_C",
    semantic: "measured internal assembly ambient during the authority test",
    excludes: "rated operating ambient",
  });

  assert.equal(form.length, 16);
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  assert.deepEqual(validation.actualKeywords, EXPECTED_KEYWORDS);
  assert.deepEqual(form.map((row) => row.IES_ORDER), EXPECTED_KEYWORDS.map((_key, index) => index + 1));
  assert.deepEqual(form.map((row) => row.FIELD), EXPECTED_KEYWORDS.map((key) => `[${key}]`));
  assert.equal(form[9].FIELD, "[_INTERNAL_AMBIENT_TA_C]");
  assert.match(form[9].SOURCE, /sealed reference/i);
  assert.doesNotMatch(form[9].SOURCE, /selector/i);
  assert.match(form[9].note, /measured internal assembly ambient during the authority test/i);
  assert.match(form[9].note, /not rated operating ambient/i);

  const staleAmbient = form.map((row, index) => index === 9 ? { ...row, FIELD: "[_AMBIENT_TA_C]" } : row);
  const staleValidation = validateKeywordVocabulary(staleAmbient);
  assert.equal(staleValidation.ok, false);
  assert.match(staleValidation.errors.join("\n"), /_AMBIENT_TA_C is stale/i);

  const supplementary = [...form, { FIELD: "[_SUPPLEMENTARY_FIELD]" }];
  const supplementaryValidation = validateKeywordVocabulary(supplementary);
  assert.equal(supplementaryValidation.ok, false);
  assert.match(supplementaryValidation.errors.join("\n"), /supplementary or unknown keyword/i);

  const alias = form.map((row, index) => index === 14 ? { ...row, FIELD: "[_EMERGENCY_CAPABLE]" } : row);
  const aliasValidation = validateKeywordVocabulary(alias);
  assert.equal(aliasValidation.ok, false);
  assert.match(aliasValidation.errors.join("\n"), /_EMERGENCY_CAPABLE is not part of the canonical profile/i);
});

test("active generators and UI surfaces consume the canonical contract without editable Main Bench ambient", () => {
  const formatter = read("packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js");
  const fromReference = read("packages/lab-kernel/ies-toolkit/iesFromReference.js");
  const project = read("packages/lab-kernel/ies-toolkit/iesProjectIes.js");
  const builder = read("packages/lab-kernel/ies-toolkit/ies_builder.html");
  const bench = read("packages/lab-kernel/ies-toolkit/bench.html");
  const summary = read("packages/lab-kernel/ies-toolkit/summary.html");

  for (const source of [formatter, fromReference, project, bench, summary]) {
    assert.match(source, /CANONICAL_KEYWORDS/);
  }

  assert.doesNotMatch(fromReference, /case\s+"_AMBIENT_TA_C"/);
  assert.doesNotMatch(fromReference, /sel\.ambient/);
  assert.doesNotMatch(builder, /id="jAmb"|ambient:\$\("jAmb"\)/);

  assert.match(bench, /\.\/iesKeywordContract\.js/);
  assert.match(bench, /CANONICAL_KEYWORDS\s*\.filter/);
  assert.match(bench, /delete next\.meta\.keywords/);
  assert.match(bench, /Internal ambient remains sealed-reference-owned/i);
  assert.doesNotMatch(bench, /id="sysTa"|id="jAmb"/);
  assert.doesNotMatch(bench, /optionalField\(project,\s*"ambient"/);
  assert.doesNotMatch(bench, /upsertKw\([^\n]*_INTERNAL_AMBIENT_TA_C/);
  assert.doesNotMatch(bench, /(^|[^A-Z0-9_])_AMBIENT_TA_C/m);
  assert.doesNotMatch(bench, /\[_SERIALNUMBER\].*reference endpoint/);

  assert.match(summary, /CANONICAL_KEYWORDS\.filter/);
  assert.match(summary, /upsertKw\(meta,"_INTERNAL_AMBIENT_TA_C",\$\("sysTa"\)\.value\)/);
  assert.doesNotMatch(summary, /upsertKw\(meta,"_AMBIENT_TA_C"/);
});

test("merge, project adapter, builder and previews retain canonical ambient vocabulary", () => {
  const formatter = read("packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js");
  const fromReference = read("packages/lab-kernel/ies-toolkit/iesFromReference.js");
  const merge = read("packages/lab-kernel/ies-toolkit/iesMerge.js");
  const project = read("packages/lab-kernel/ies-toolkit/iesProjectIes.js");
  const builder = read("packages/lab-kernel/ies-toolkit/ies_builder.html");
  const bench = read("packages/lab-kernel/ies-toolkit/bench.html");
  const summary = read("packages/lab-kernel/ies-toolkit/summary.html");

  for (const source of [formatter, fromReference, merge, project, builder, bench, summary]) {
    assert.doesNotMatch(source, /(^|[^A-Z0-9_])_AMBIENT_TA_C/m);
    assert.doesNotMatch(source, /(^|[^A-Z0-9_])_EMERGENCY_CAPABLE/m);
  }

  assert.match(merge, /_INTERNAL_AMBIENT_TA_C:\s*null/);
  assert.doesNotMatch(merge, /(^|[^A-Z0-9_])_AMBIENT_TA_C:\s*null/m);

  assert.match(project, /requireCanonicalGeneratedKeywords/);
  assert.match(project, /CANONICAL_KEYWORDS\.length/);
  assert.doesNotMatch(builder, /id="jAmb"|ambient:\$\("jAmb"\)/);

  for (const preview of [bench, summary]) {
    assert.match(preview, /CANONICAL_KEYWORDS/);
    assert.doesNotMatch(preview, /(^|[^A-Z0-9_])_AMBIENT_TA_C/m);
  }
});

function thermalSystem() {
  return {
    family: 80,
    system: 80,
    label: "DNX 80",
    system_variant_1: "Square",
    Thermal_metal_volume_mm2: 360,
    thermal_air_volume_mm2: 7200,
    thermal_family_nominated_worst_case: true,
  };
}

function thermalOptic(overrides = {}) {
  return {
    family: 80,
    system: 80,
    optic_bom_id: "80_Opal",
    optic_var_1: "Opal",
    spec_code: "OPL",
    emission_permission: "Direct",
    hot_test_battery_applies: "80_Square_Opal",
    eff_optical: 0.7,
    room_ta_c: 25,
    optic_internal_delta_ta_c: 35,
    optic_uplift_ta_c: 10,
    ...overrides,
  };
}

function thermalResolution(opticOverrides = {}) {
  return resolveNvbSelection({
    testType: "Base Engine & Optic",
    selection: { family: "DNX 80", opticBomId: "80_Opal" },
    systems: [thermalSystem()],
    optics: [thermalOptic(opticOverrides)],
    labForm: [
      { kind: "ies", field: "[TEST]", order: 1 },
      { kind: "check", field: "thermal", order: 2 },
    ],
  });
}

test("corrected thermal contracts pin the three version-2 schemas and measured 25 + 10 = 35 mapping", () => {
  assert.equal(NVB_RESOLUTION_SCHEMA_ID, "controlstack.lab.nvb-resolution.v2");
  assert.equal(NVB_RESOLUTION_SCHEMA_VERSION, 2);
  assert.equal(COMPONENT_CATALOGUE_SCHEMA_ID, "controlstack.lab.component-catalogue.v2");
  assert.equal(COMPONENT_CATALOGUE_SCHEMA_VERSION, 2);
  assert.equal(NVB_LAB_ADAPTER_SCHEMA_ID, "controlstack.lab.nvb-lab-projection.v2");
  assert.equal(NVB_LAB_ADAPTER_SCHEMA_VERSION, 2);

  const resolution = thermalResolution();
  assert.equal(resolution.status, "resolved");
  assert.deepEqual(
    {
      referenceRoomTaC: resolution.optic.referenceRoomTaC,
      referenceInternalTaC: resolution.optic.referenceInternalTaC,
      opticThermalRiseTaC: resolution.optic.opticThermalRiseTaC,
    },
    { referenceRoomTaC: 25, referenceInternalTaC: 35, opticThermalRiseTaC: 10 },
  );

  const component = projectOptics([thermalOptic()])[0];
  assert.deepEqual(
    {
      referenceRoomTaC: component.referenceRoomTaC,
      referenceInternalTaC: component.referenceInternalTaC,
      opticThermalRiseTaC: component.opticThermalRiseTaC,
    },
    { referenceRoomTaC: 25, referenceInternalTaC: 35, opticThermalRiseTaC: 10 },
  );

  const projection = adaptNvbResolution({
    resolution,
    references: { gearTray: null, optic: null },
  });
  assert.deepEqual(projection.thermalEvidence, {
    opticBomId: "80_Opal",
    referenceRoomTaC: 25,
    referenceInternalTaC: 35,
    opticThermalRiseTaC: 10,
    evidenceRef: "80_Square_Opal",
    authorityState: null,
  });
  assert.deepEqual(projection.unresolved, ["thermal_evidence_reference_unbound"]);
});

test("varied optic changes legacy uplift and contradictory rise-only evidence fails closed", () => {
  const variedResolution = thermalResolution({
    optic_internal_delta_ta_c: 40,
    optic_uplift_ta_c: 15,
  });
  assert.equal(variedResolution.status, "resolved");
  assert.equal(variedResolution.optic.referenceRoomTaC, 25);
  assert.equal(variedResolution.optic.referenceInternalTaC, 40);
  assert.equal(variedResolution.optic.opticThermalRiseTaC, 15);

  const variedComponent = projectOptics([thermalOptic({
    optic_internal_delta_ta_c: 40,
    optic_uplift_ta_c: 15,
  })])[0];
  assert.equal(variedComponent.referenceInternalTaC, 40);
  assert.equal(variedComponent.opticThermalRiseTaC, 15);

  const contradictoryResolution = thermalResolution({ optic_uplift_ta_c: 15 });
  assert.equal(contradictoryResolution.status, "unresolved");
  assert.equal(contradictoryResolution.optic, null);
  assert.deepEqual(contradictoryResolution.blockers, ["thermal_triplet_mismatch"]);

  assert.throws(
    () => projectOptics([thermalOptic({ optic_uplift_ta_c: 15 })]),
    (error) => error?.code === "thermal_triplet_mismatch",
  );
});

test("active Lab thermal outputs contain no deprecated semantics or Engine-owned calculation", () => {
  const resolver = read("packages/lab-kernel/ies-toolkit/nvbResolve.js");
  const components = read("packages/lab-kernel/ies-toolkit/nvbComponents.js");
  const adapter = read("packages/lab-kernel/ies-toolkit/nvbLabAdapter.js");
  const surface = read("packages/lab-kernel/ies-toolkit/component_library.html");
  const activeSources = [resolver, components, adapter, surface];

  for (const source of activeSources) {
    for (const forbidden of [
      /(^|[^A-Za-z0-9_])opticInternalDeltaTaC([^A-Za-z0-9_]|$)/,
      /(^|[^A-Za-z0-9_])roomTaC([^A-Za-z0-9_]|$)/,
      /(^|[^A-Za-z0-9_])opticUpliftTaC([^A-Za-z0-9_]|$)/,
      /derivedInternalTaC/,
      /curveLookupTaC/,
      /boardTaC/,
      /verifiedLumensPerMetre/,
      /verifiedLmPerM/,
      /\bclamp\b/i,
    ]) {
      assert.doesNotMatch(source, forbidden);
    }
  }

  for (const legacySourceName of ["room_ta_c", "optic_internal_delta_ta_c", "optic_uplift_ta_c"]) {
    assert.match(resolver, new RegExp(legacySourceName));
    assert.match(components, new RegExp(legacySourceName));
    assert.doesNotMatch(adapter, new RegExp(legacySourceName));
    assert.doesNotMatch(surface, new RegExp(legacySourceName));
  }

  assert.match(surface, /Reference room Ta °C/);
  assert.match(surface, /Reference internal Ta °C/);
  assert.match(surface, /Optic thermal rise °C/);
  assert.match(surface, /source evidence reference — unverified/);
  assert.doesNotMatch(surface, /Internal delta|Uplift Ta|derived operating|verified lm\/m/i);

  assert.deepEqual(INTERNAL_AMBIENT_POLICY, {
    key: "_INTERNAL_AMBIENT_TA_C",
    semantic: "measured internal assembly ambient during the authority test",
    excludes: "rated operating ambient",
  });
});
