import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const viewModelSourceUrl = new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url);

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

// Real NovonDB shapes. OPTICS rows key `system` as the SIZE (60/80), not a family.
// Opal/Comfort/Asymmetric/Batwing have NO optic_var_2. Inlay (size 80) is the real
// optic that carries var-2 sub-variants (Microprism, Antiglare). No invented data.
// var-2 child options materialise only when their parent var-1 is selected via
// constraints (proven by the "selecting diffuser var 1 filters diffuser var 2" test),
// so every var-2 assertion sets the parent constraint.
function diffuserSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "Direct, Indirect", approved: "yes" },
      { system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "60",
        optic_var_1: "Opal",
        optic_var_2: "",
        spec_code: "OPL",
        spec_code_var2: "",
        diffuser_material: "PMMA",
        description: "must not become a path",
        emission_permission: "Direct, Indirect",
        ip_option_1: "IP20, IP40, IP44, IP65",
        ik_option_2: "Non, IK10",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Comfort",
        optic_var_2: "",
        spec_code: "CMF",
        spec_code_var2: "",
        diffuser_material: "PMMA",
        emission_permission: "Direct",
        ip_option_1: "IP20, IP40, IP44, IP65",
        ik_option_2: "Non, IK10",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Batwing",
        optic_var_2: "",
        spec_code: "BWG",
        spec_code_var2: "",
        diffuser_material: "PMMA",
        emission_permission: "Indirect",
        ip_option_1: "IP20, IP40, IP44, IP65",
        ik_option_2: "Non, IK10",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Inlay",
        optic_var_2: "Microprism, Antiglare",
        spec_code: "INL",
        spec_code_var2: "MPR, AGL",
        diffuser_material: "PMMA",
        emission_permission: "Direct",
        ip_option_1: "IP20, IP40, IP44, IP65",
        ik_option_2: "Non, IK10",
        approved: "yes",
      },
    ],
    BOARDS: [
      { system: "60", optic_var_1: "Opal", c1_cct: "3000", c1_cri_min: "80", board_lm_per_m: "1200", control_type_labels: "DALI-2", approved: "yes" },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", native_control_type: "DALI-2", wiring_type: "5-core DALI", approved: "yes" },
    ],
    USERS: [
      { email_login: "private@example.com", token: "must not leak token", approved: "yes" },
    ],
    PURE_REF_STATE: [{ raw_lab_evidence: "must not leak lab evidence" }],
  };
}

function workflowField(result, fieldKey) {
  for (const section of result.workflowSections || []) {
    const field = (section.fields || []).find((item) => item.fieldKey === fieldKey);
    if (field) return field;
  }
  assert.fail(`expected workflow field ${fieldKey}`);
}

function workflowOption(result, fieldKey, value) {
  const field = workflowField(result, fieldKey);
  const option = (field.options || []).find((item) => item.value === value || item.label === value);
  assert.ok(option, `expected ${fieldKey} option ${value}`);
  return option;
}

test("diffuser var 1, var 2, material, spec-code preview, and image readiness are first-class workflow fields", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), { source: sourceReady() });
  const optics = result.workflowSections.find((section) => section.sectionKey === "optics");
  const keys = optics.fields.map((field) => field.fieldKey);

  for (const key of [
    "diffuserVar1",
    "diffuserVar2",
    "diffuserMaterial",
    "diffuserSpecCodePreview",
    "diffuserImageReadiness",
    "directOpticVar1",
    "directOpticVar2",
    "indirectOpticVar1",
    "indirectOpticVar2",
  ]) {
    assert.ok(keys.includes(key), `expected ${key} in canonical optics workflow`);
  }

  assert.equal(result.diffuserModelSummary.firstClass, true);
  assert.equal(result.diffuserModelSummary.specCodeGenerationEnabled, false);
  assert.equal(result.diffuserModelSummary.productImagesRendered, false);
});

test("diffuser options carry safe two-layer metadata without raw rows or paths", () => {
  // var-2 child options materialise when the parent var-1 (Inlay) is selected.
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: { diffuserVar1: "80|Inlay" },
  });
  const var1 = workflowOption(result, "diffuserVar1", "80|Inlay");
  const var2 = workflowOption(result, "diffuserVar2", "80|Inlay|Antiglare");
  const material = workflowField(result, "diffuserMaterial");
  const specPreview = workflowField(result, "diffuserSpecCodePreview");
  const imageReadiness = workflowField(result, "diffuserImageReadiness");

  assert.equal(var1.diffuserLayer, "var1");
  assert.equal(var1.visualChoice, true);
  assert.equal(var1.imageReadiness, "runtime-manifest-missing");
  assert.equal(var1.runtimeImageAvailable, false);
  assert.equal(var1.rawRowsExposed, false);
  assert.equal(var1.writes, false);

  assert.equal(var2.diffuserLayer, "var2");
  assert.equal(var2.parentFieldKey, "diffuserVar1");
  assert.equal(var2.parentValue, "80|Inlay");
  assert.equal(var2.diffuserMaterial, "PMMA");
  assert.equal(var2.rawRowsExposed, false);
  assert.equal(var2.writes, false);

  assert.equal(material.metadataOnly, true);
  assert.equal(specPreview.metadataOnly, true);
  assert.equal(specPreview.disabled, true);
  assert.equal(imageReadiness.metadataOnly, true);
  assert.equal(imageReadiness.disabled, true);

  const serialised = JSON.stringify(result);
  assert.equal(serialised.includes("/assets/"), false);
  assert.equal(serialised.includes("C:\\"), false);
  assert.equal(serialised.includes(".png"), false);
  assert.equal(serialised.includes("private@example.com"), false);
  assert.equal(serialised.includes("must not leak"), false);
});

test("selecting system filters diffuser var 1", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX|60" },
  });

  // With this size-keyed fixture, diffuser choices remain visible but blocked under
  // the selected system constraint.
  assert.equal(workflowOption(result, "diffuserVar1", "60|Opal").status, "blocked");
  assert.equal(workflowOption(result, "diffuserVar1", "80|Inlay").status, "blocked");
  assert.ok(workflowOption(result, "diffuserVar1", "80|Inlay").blockedBy.some((item) => item.fieldKey === "system"));
});

test("selecting diffuser var 1 filters diffuser var 2", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: { diffuserVar1: "80|Inlay" },
  });

  // Inlay's real sub-variants are Microprism and Antiglare.
  assert.equal(workflowOption(result, "diffuserVar2", "80|Inlay|Antiglare").status, "available");
  assert.equal(workflowOption(result, "diffuserVar2", "80|Inlay|Microprism").status, "available");
});

test("incompatible selected diffuser var 2 is preserved and visibly blocked", () => {
  // Select the parent (Inlay) so its var-2 materialises, plus a size-60 system that
  // makes the size-80 Inlay var-2 incompatible. It must be preserved and blocked.
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: {
      diffuserVar1: "80|Inlay",
      diffuserVar2: "80|Inlay|Antiglare",
      system: "DNX|60",
    },
  });
  const selected = workflowOption(result, "diffuserVar2", "80|Inlay|Antiglare");

  assert.equal(selected.selected, true);
  assert.equal(selected.status, "blocked");
  assert.equal(selected.preservesManualConstraint, true);
  assert.ok(selected.blockedBy.some((item) => item.fieldKey === "system" || item.fieldKey === "diffuserVar1"));
  assert.ok(result.blockedItems.some((item) => item.fieldKey === "diffuserVar2" && item.value === "80|Inlay|Antiglare"));
});

test("direct and indirect diffuser fields are represented without enabling generation or proof", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), { source: sourceReady() });
  // Select the direct parent (Inlay) so its direct var-2 materialises.
  const directChildResult = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: { directOpticVar1: "80|Inlay" },
  });
  // Select an indirect-capable parent that has no var-2 subs.
  const indirectChildResult = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: { indirectOpticVar1: "60|Opal" },
  });

  assert.ok(workflowField(result, "directOpticVar1").options.some((item) => item.value === "60|Opal"));
  assert.ok(workflowField(directChildResult, "directOpticVar2").options.some((item) => item.value === "80|Inlay|Antiglare"));
  // No indirect-capable optic carries var-2 subs in real NovonDB, so indirectOpticVar2
  // has no options even after its parent is selected.
  assert.ok(workflowField(result, "indirectOpticVar1").options.some((item) => item.value === "60|Opal"));
  assert.equal(workflowField(indirectChildResult, "indirectOpticVar2").options.length, 0);
  assert.equal(result.specGenerationEnabled, false);
  assert.equal(result.slugGenerationEnabled, false);
  assert.equal(result.specCodeGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.payloadGenerationEnabled, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.labProofAuthority, false);
});

test("UI and selected-truth surfaces expose diffuser metadata as metadata, not images", async () => {
  const view = await readFile(viewSourceUrl, "utf-8");
  const viewModel = await readFile(viewModelSourceUrl, "utf-8");

  assert.match(view, /diffuser layer/);
  assert.match(view, /spec-code preview/);
  assert.match(view, /image readiness/);
  assert.match(view, /image rendered/);
  assert.equal(view.includes("createElement(\"img\")"), false);
  assert.match(viewModel, /diffuserVar1: "systemOptic"/);
  assert.match(viewModel, /diffuserVar2: "systemOptic"/);
  assert.match(viewModel, /diffuserSpecCodePreview: "systemOptic"/);
  assert.match(viewModel, /diffuserImageReadiness: "systemOptic"/);
});
