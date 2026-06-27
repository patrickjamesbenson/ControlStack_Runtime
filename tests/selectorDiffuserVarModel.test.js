import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const viewModelSourceUrl = new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url);

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function diffuserSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "direct", approved: "yes" },
      { system: "LNX", system_variant_1: "80 DI", label: "LNX 80 D/I", emission: "direct/indirect", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "DNX",
        optic_var_1: "Opal",
        optic_var_2: "Soft;Sharp",
        spec_code: "OP",
        spec_code_var2: "SF;SH",
        diffuser_material: "PMMA",
        description: "must not become a path",
        emission_permission: "direct",
        ip_option_1: "IP20;IP44",
        ik_option_2: "IK07",
        approved: "yes",
      },
      {
        system: "LNX",
        optic_var_1: "Inlay",
        optic_var_2: "Antiglare;Rope",
        spec_code: "IN",
        spec_code_var2: "AG;RP",
        material: "Polycarbonate",
        emission_permission: "direct/indirect",
        ip_option_1: "IP65",
        ik_option_2: "IK10",
        approved: "yes",
      },
    ],
    BOARDS: [
      { system: "DNX", optic_var_1: "Opal", c1_cct: "3000", c1_cri_min: "80", board_lm_per_m: "1200", control_type_labels: "DALI-2", approved: "yes" },
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
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), { source: sourceReady() });
  const var1 = workflowOption(result, "diffuserVar1", "DNX|Opal");
  const var2 = workflowOption(result, "diffuserVar2", "DNX|Opal|Soft");
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
  assert.equal(var2.parentValue, "DNX|Opal");
  assert.equal(var2.specCodePreview, "OPSF");
  assert.equal(var2.specCodeVar2Preview, "SF");
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

  assert.equal(workflowOption(result, "diffuserVar1", "DNX|Opal").status, "available");
  assert.equal(workflowOption(result, "diffuserVar1", "LNX|Inlay").status, "blocked");
  assert.ok(workflowOption(result, "diffuserVar1", "LNX|Inlay").blockedBy.some((item) => item.fieldKey === "system"));
});

test("selecting diffuser var 1 filters diffuser var 2", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: { diffuserVar1: "DNX|Opal" },
  });

  assert.equal(workflowOption(result, "diffuserVar2", "DNX|Opal|Soft").status, "available");
  assert.equal(workflowOption(result, "diffuserVar2", "LNX|Inlay|Rope").status, "blocked");
  assert.ok(workflowOption(result, "diffuserVar2", "LNX|Inlay|Rope").blockedBy.some((item) => item.fieldKey === "diffuserVar1"));
});

test("incompatible selected diffuser var 2 is preserved and visibly blocked", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), {
    source: sourceReady(),
    constraints: {
      system: "DNX|60",
      diffuserVar1: "DNX|Opal",
      diffuserVar2: "LNX|Inlay|Rope",
    },
  });
  const selected = workflowOption(result, "diffuserVar2", "LNX|Inlay|Rope");

  assert.equal(selected.selected, true);
  assert.equal(selected.status, "blocked");
  assert.equal(selected.preservesManualConstraint, true);
  assert.ok(selected.blockedBy.some((item) => item.fieldKey === "system" || item.fieldKey === "diffuserVar1"));
  assert.ok(result.blockedItems.some((item) => item.fieldKey === "diffuserVar2" && item.value === "LNX|Inlay|Rope"));
});

test("direct and indirect diffuser fields are represented without enabling generation or proof", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(diffuserSnapshot(), { source: sourceReady() });

  assert.ok(workflowField(result, "directOpticVar1").options.some((item) => item.value === "DNX|Opal"));
  assert.ok(workflowField(result, "directOpticVar2").options.some((item) => item.value === "DNX|Opal|Soft"));
  assert.ok(workflowField(result, "indirectOpticVar1").options.some((item) => item.value === "LNX|Inlay"));
  assert.ok(workflowField(result, "indirectOpticVar2").options.some((item) => item.value === "LNX|Inlay|Rope"));
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
