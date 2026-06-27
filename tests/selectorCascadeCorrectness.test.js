import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const moduleSourceUrl = new URL("../packages/modules/cs-selector/index.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function cascadeSnapshot() {
  return {
    SYSTEM: [
      {
        system: "DNX",
        system_variant_1: "60",
        label: "DNX 60",
        emission: "direct",
        mount_style: "Surface",
        system_and_variant_finish: "White",
        flex_colour: "White Flex",
        approved: "yes",
      },
      {
        system: "LNX",
        system_variant_1: "80 DI",
        label: "LNX 80 D/I",
        emission: "direct/indirect",
        mount_style: "Suspended",
        system_and_variant_finish: "Black",
        flex_colour: "Black Flex",
        approved: "yes",
      },
    ],
    OPTICS: [
      {
        system: "DNX",
        optic_var_1: "Opal",
        optic_var_2: "Soft;Sharp",
        emission_permission: "direct",
        ip_option_1: "IP20;IP44",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "LNX",
        optic_var_1: "Blade",
        optic_var_2: "Wallwash",
        emission_permission: "direct/indirect",
        ip_option_1: "IP65;IP66",
        ik_option_2: "IK10",
        cct: "4000K",
        approved: "yes",
      },
    ],
    BOARDS: [
      {
        system: "DNX",
        optic_var_1: "Opal",
        c1_cct: "3000",
        c1_cri_min: "80",
        board_lm_per_m: "1200",
        control_type_labels: "DALI-2;Non-dim",
        approved: "yes",
      },
      {
        system: "LNX",
        optic_var_1: "Blade",
        c1_cct: "4000",
        c1_cri_min: "90",
        board_lm_per_m: "2200",
        control_type_labels: "DALI-2 DT8",
        approved: "yes",
      },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", native_control_type: "DALI-2", wiring_type: "5-core DALI", approved: "yes" },
      { driver_id: "Non-dim Driver", native_control_type: "Non-dim", wiring_type: "3-core switched", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mount", display_choice: "Surface", mount_selections: "Surface clip", mount_particulars: "Flush screw", approved: "yes" },
      { accessory_type: "mount", display_choice: "Suspended", mount_selections: "Wire;Rod", mount_particulars: "1500mm drop;Custom drop", approved: "yes" },
      { accessory_type: "power_penetration", accessory_id: "Top", approved: "yes" },
      { accessory_type: "power_location", accessory_id: "Start", approved: "yes" },
      { accessory_type: "flex_length", accessory_id: "1500mm", approved: "yes" },
      { accessory_type: "egress_light", accessory_id: "Maintained", approved: "yes" },
      { accessory_type: "egress_sound", accessory_id: "EWIS", approved: "yes" },
      { accessory_type: "pir", accessory_id: "PIR Sensor", approved: "yes" },
      { accessory_type: "accessory", accessory_id: "Generic suspension kit", approved: "yes" },
    ],
    SYSTEM_POLICY: [
      { category: "ambient temp", item: "25;35", approved: "yes" },
      { category: "wiring", item: "5-core DALI;3-core switched", approved: "yes" },
      { category: "finish colour", item: "White;Black", approved: "yes" },
    ],
    SYSTEM_COMPONENTS: [
      { id: "SP1", description: "must not leak special description", status: "business_case", system: "DNX", approved: "yes" },
    ],
    USERS: [
      { email_login: "private@example.com", system_component_ids: "SP1", token: "must not leak token", approved: "yes" },
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

function option(result, fieldKey, value) {
  const field = workflowField(result, fieldKey);
  const found = (field.options || []).find((item) => item.value === value || item.label === value);
  assert.ok(found, `expected ${fieldKey} option ${value}`);
  return found;
}

test("selecting system filters optics and derives direct/indirect capability", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX|60" },
  });

  assert.equal(option(result, "optic", "DNX|Opal").status, "available");
  assert.equal(option(result, "optic", "LNX|Blade").status, "blocked");
  assert.equal(option(result, "indirectCapability", "indirect-supported").status, "blocked");
  assert.ok(option(result, "indirectCapability", "indirect-supported").blockedBy.some((item) => item.fieldKey === "system"));
});

test("selecting optic filters IP, IK, optic sub-option, and CCT/CRI pairs", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX|60", optic: "DNX|Opal" },
  });

  assert.equal(option(result, "opticSub", "Opal|Soft").status, "available");
  assert.equal(option(result, "opticSub", "Blade|Wallwash").status, "blocked");
  assert.equal(option(result, "ipRating", "IP20").status, "available");
  assert.equal(option(result, "ipRating", "IP66").status, "blocked");
  assert.equal(option(result, "ikRating", "IK07").status, "available");
  assert.equal(option(result, "ikRating", "IK10").status, "blocked");
  assert.equal(option(result, "cctCri", "3000K / CRI80").status, "available");
  assert.equal(option(result, "cctCri", "4000K / CRI90").status, "blocked");
});

test("CCT and CRI stay paired when source data allows", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), { source: sourceReady() });
  const labels = workflowField(result, "cctCri").options.map((item) => item.label);

  assert.ok(labels.includes("3000K / CRI80"));
  assert.ok(labels.includes("4000K / CRI90"));
  assert.equal(labels.some((item) => item === "3000K"), false);
  assert.equal(labels.some((item) => item === "CRI80"), false);
});

test("selecting controlType changes driver auto consequence", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { controlType: "DALI-2" },
  });

  assert.equal(option(result, "driver", "DALI Driver").status, "auto-consequence");
  assert.equal(option(result, "driver", "Non-dim Driver").status, "blocked");
  assert.ok(result.autoConsequences.some((item) => item.fieldKey === "driver" && /DALI Driver/.test(item.valueLabel)));
});

test("selecting mountStyle cascades mountSelection and mountParticulars", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { mountStyle: "Surface" },
  });

  assert.equal(option(result, "mountSelection", "Surface clip").status, "available");
  assert.equal(option(result, "mountSelection", "Wire").status, "blocked");
  assert.equal(option(result, "mountParticulars", "Flush screw").status, "available");
  assert.equal(option(result, "mountParticulars", "1500mm drop").status, "blocked");
});

test("finish inheritance is visible and manual finish overrides remain constraints", () => {
  const inherited = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { bodyFinish: "White" },
  });

  assert.equal(option(inherited, "finishCover", "White").status, "inherited");
  assert.equal(option(inherited, "finishEnd", "White").status, "inherited");
  assert.ok(inherited.autoConsequences.some((item) => item.fieldKey === "finishCover" && item.kind === "inherited-consequence"));

  const manualOverride = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { bodyFinish: "White", finishCover: "Black" },
  });
  assert.equal(manualOverride.selectedConstraints.finishCover, "Black");
  assert.equal(workflowField(manualOverride, "finishCover").selectedValue, "Black");
});

test("egress light, EWIS sound, and sensor remain separate cascades", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { egressLight: "Maintained", egressSound: "EWIS", sensor: "PIR Sensor" },
  });

  assert.ok(workflowField(result, "egressLight").options.some((item) => item.label === "Maintained"));
  assert.ok(workflowField(result, "egressSound").options.some((item) => item.label === "EWIS"));
  assert.ok(workflowField(result, "sensor").options.some((item) => item.label === "PIR Sensor"));
});

test("specialParts remains entitlement-gated and not generic accessory", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), { source: sourceReady() });
  const entitlement = workflowField(result, "specialPartsEntitlement");

  assert.equal(entitlement.sourceStatus, "entitlement-gated-redacted");
  assert.equal(entitlement.options.some((item) => /Generic suspension kit/.test(item.label)), false);
  assert.equal(result.specialPartsEntitlementSummary.rawUsersExposed, false);
  assert.equal(result.rawUsersExposed, false);
});

test("runs and disabled workflows stay disabled and cannot generate RunTable", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), { source: sourceReady() });

  assert.equal(workflowField(result, "runCount").disabled, true);
  assert.equal(workflowField(result, "engineVerify").disabled, true);
  assert.equal(workflowField(result, "payloadRunTableGeneration").disabled, true);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.payloadGenerationEnabled, false);
});

test("incompatible selected options are preserved and marked blocked", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX|60", optic: "LNX|Blade" },
  });
  const selected = option(result, "optic", "LNX|Blade");

  assert.equal(selected.selected, true);
  assert.equal(selected.status, "blocked");
  assert.equal(selected.preservesManualConstraint, true);
  assert.ok(selected.blockedBy.some((item) => item.fieldKey === "system"));
});

test("compatible selections are not cleared", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX|60", optic: "DNX|Opal", cctCri: "3000K / CRI80" },
  });

  assert.equal(result.selectedConstraints.system, "DNX|60");
  assert.equal(result.selectedConstraints.optic, "DNX|Opal");
  assert.equal(result.selectedConstraints.cctCri, "3000K / CRI80");
  assert.equal(workflowField(result, "cctCri").selectedValue, "3000K / CRI80");
});

test("UI reloads GET options endpoint after manual constraint changes", async () => {
  const source = await readFile(moduleSourceUrl, "utf-8");

  assert.match(source, /SELECTOR_REFERENCE_OPTIONS_ENDPOINT = "\/api\/selector-reference\/options"/);
  assert.match(source, /method: "GET"/);
  assert.match(source, /handleSelectorLocalStateChange/);
  assert.match(source, /loadSelectorReferenceOptions\(\)/);
  assert.match(source, /selectorOptionConstraintQuery/);
  for (const key of ["system", "tier", "variantKey", "emission", "optic", "opticSub", "opticIndirect", "cctCri", "controlType", "mountStyle", "mountSelection", "finishCover", "egressLight", "egressSound", "specialPartsOptIn"]) {
    assert.match(source, new RegExp(`"${key}"`));
  }
});

test("endpoint remains read-only and sensitive data stays redacted", async () => {
  const server = await readFile(serverSourceUrl, "utf-8");
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), { source: sourceReady() });
  const serialised = JSON.stringify(result);

  assert.match(server, /sendSelectorReferenceOptions/);
  assert.match(server, /method: "GET"|request\.method === "GET"|GET/);
  assert.equal(result.readOnly, true);
  assert.equal(result.optionFilteringReadOnly, true);
  assert.equal(result.rawRowsExposed, false);
  assert.equal(result.rawUsersExposed, false);
  assert.equal(result.rawLabEvidenceExposed, false);
  assert.equal(result.credentialsExposed, false);
  assert.equal(result.privatePathsExposed, false);
  assert.equal(serialised.includes("private@example.com"), false);
  assert.equal(serialised.includes("must not leak"), false);
});
