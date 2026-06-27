import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";

const moduleSourceUrl = new URL("../packages/modules/cs-selector/index.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function cascadeSnapshot() {
  return {
    SYSTEM: [
      {
        system: "60",
        system_variant_1: "Beam DI",
        label: "DNX 60 Beam DI",
        emission: "Both",
        mount_style: "Suspended",
        system_and_variant_finish: "White",
        flex_colour: "White Flex",
        approved: "yes",
      },
      {
        system: "80",
        system_variant_1: "Blade DI",
        label: "LNX 80 D/I",
        emission: "Both",
        mount_style: "Suspended",
        system_and_variant_finish: "Black",
        flex_colour: "Black Flex",
        approved: "yes",
      },
    ],
    OPTICS: [
      {
        system: "60",
        optic_var_1: "Opal",
        optic_var_2: "Soft;Sharp",
        emission_permission: "Direct, Indirect",
        ip_option_1: "IP20;IP44",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Comfort",
        optic_var_2: "Low glare",
        emission_permission: "Direct",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Asymmetric",
        optic_var_2: "Wallwash",
        emission_permission: "Direct",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Batwing",
        optic_var_2: "Wide",
        emission_permission: "Indirect",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Blade",
        optic_var_2: "Wallwash",
        emission_permission: "Direct, Indirect",
        ip_option_1: "IP65;IP66",
        ik_option_2: "IK10",
        cct: "4000K",
        approved: "yes",
      },
    ],
    BOARDS: [
      {
        system: "60",
        optic_var_1: "Opal",
        c1_cct: "3000",
        c1_cri_min: "80",
        board_lm_per_m: "1200",
        control_type_labels: "DALI-2;Non-dim",
        approved: "yes",
      },
      {
        system: "80",
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

function selectorViewModelFor(result, constraints = {}) {
  const manualConstraints = Object.fromEntries(Object.entries(constraints).map(([fieldKey, value]) => [
    fieldKey,
    { fieldKey, label: fieldKey, value, valueLabel: value },
  ]));
  const selectorState = {
    getSnapshot() {
      return { dbBackedSelector: { manualConstraints } };
    },
    setDbBackedSelectorFieldValue() {},
    clearDbBackedSelectorFieldValue() {},
    setExpanderSectionOpen() {},
  };
  const adapter = {
    moduleId: "cs_selector",
    services: {},
    isFlagEnabled() { return false; },
    readSnapshots() {
      return {
        route: "/selector",
        diagnostics: {},
        flags: { owner: "test", values: {} },
        project: { currentProject: {}, metadata: {}, selection: {} },
        visibility: { moduleReasons: {}, inputs: {}, visibleModules: [], hiddenModules: [] },
        handoff: {},
        identity: { currentUser: {} },
        authority: {},
        company: {},
        crm: {},
        timelinePolicy: {},
      };
    },
  };
  return createSelectorViewModel({ adapter, selectorState, selectorReferenceStatus: result, onLocalStateChange: () => {} });
}

function viewModelField(result, fieldKey, constraints = {}) {
  const model = selectorViewModelFor(result, constraints);
  for (const section of model.selectorSurface.workflowSections || []) {
    const field = (section.fields || []).find((item) => item.fieldKey === fieldKey);
    if (field) return field;
  }
  assert.fail(`expected view-model field ${fieldKey}`);
}

function compatibleCount(field) {
  return (field.options || []).filter((item) => item.blocked !== true && item.status !== "blocked").length;
}

function compatibleLabels(field) {
  return (field.options || []).filter((item) => item.blocked !== true && item.status !== "blocked").map((item) => item.label).sort();
}

function primaryOpticVar1Controls(result, constraints = {}) {
  return ["diffuserVar1", "directOpticVar1", "indirectOpticVar1"]
    .map((fieldKey) => viewModelField(result, fieldKey, constraints))
    .filter((field) => field.displayMode === "choice" || field.displayMode === "auto-chip")
    .map((field) => field.fieldKey);
}

test("full system label resolves to size-keyed direct/down and indirect/up optic sets", () => {
  const constraints = { system: "DNX 60 Beam DI" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });

  const direct = workflowField(result, "directOpticVar1");
  const indirect = workflowField(result, "indirectOpticVar1");
  assert.deepEqual(compatibleLabels(direct), ["Asymmetric · 60", "Comfort · 60", "Opal · 60"].sort());
  assert.deepEqual(compatibleLabels(indirect), ["Batwing · 60", "Opal · 60"].sort());
  assert.equal(option(result, "directOpticVar1", "60|Opal").status, "available");
  assert.equal(option(result, "indirectOpticVar1", "60|Opal").status, "available");
  assert.equal(option(result, "directOpticVar1", "80|Blade").status, "blocked");
  assert.equal(viewModelField(result, "directOpticVar1", constraints).compatibleOptionCount, 3);
  assert.equal(viewModelField(result, "indirectOpticVar1", constraints).compatibleOptionCount, 2);
  const legacy = viewModelField(result, "diffuserVar1", constraints);
  assert.equal(legacy.primaryControl, false);
  assert.equal(legacy.displayMode, "hidden-diagnostic");
  assert.deepEqual(primaryOpticVar1Controls(result, constraints), ["directOpticVar1", "indirectOpticVar1"]);
});

test("direct-only system suppresses indirect/up picker against size-keyed optics", () => {
  const snapshot = {
    ...cascadeSnapshot(),
    SYSTEM: [
      {
        system: "30",
        system_variant_1: "Beam",
        label: "DNX 30 Beam",
        emission: "Direct",
        mount_style: "Surface",
        system_and_variant_finish: "White",
        approved: "yes",
      },
    ],
    OPTICS: [
      {
        system: "30",
        optic_var_1: "Opal",
        spec_code_var2: "Antiglare",
        emission_permission: "Direct",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "30",
        optic_var_1: "Comfort",
        optic_var_2: "Low glare",
        emission_permission: "Direct",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "30",
        optic_var_1: "Batwing",
        optic_var_2: "Wide",
        emission_permission: "Indirect",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
    ],
  };
  const constraints = { system: "DNX 30 Beam" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints,
  });

  const direct = viewModelField(result, "directOpticVar1", constraints);
  assert.equal(direct.displayMode, "choice");
  assert.equal(direct.primaryControl, true);
  assert.equal(direct.compatibleOptionCount, compatibleCount(direct));
  assert.equal(direct.compatibleOptionCount, 2);

  const indirect = viewModelField(result, "indirectOpticVar1", constraints);
  assert.equal(indirect.displayMode, "hidden-diagnostic");
  assert.equal(indirect.primaryControl, false);
  assert.equal(indirect.effectiveValue, "");
  assert.equal(indirect.compatibleOptionCount, 0);
  const legacy = viewModelField(result, "diffuserVar1", constraints);
  assert.equal(legacy.primaryControl, false);
  assert.equal(legacy.displayMode, "hidden-diagnostic");
  assert.deepEqual(primaryOpticVar1Controls(result, constraints), ["directOpticVar1"]);
});

test("full display label DNX 80 DI resolves to size-80 optics and auto-fills the single indirect Rope", () => {
  const snapshot = {
    ...cascadeSnapshot(),
    SYSTEM: [
      {
        system: "80",
        system_variant_1: "DI",
        label: "DNX 80 DI",
        emission: "Both",
        mount_style: "Suspended",
        system_and_variant_finish: "Black",
        approved: "yes",
      },
    ],
    OPTICS: [
      {
        system: "60",
        optic_var_1: "Comfort",
        optic_var_2: "Low glare",
        emission_permission: "Direct",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Batwing",
        optic_var_2: "Wide",
        emission_permission: "Indirect",
        ip_option_1: "IP20",
        ik_option_2: "IK07",
        cct: "3000K",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Opal",
        spec_code_var2: "Antiglare",
        emission_permission: "Direct",
        ip_option_1: "IP65",
        ik_option_2: "IK10",
        cct: "4000K",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Comfort",
        optic_var_2: "Antiglare;Low glare",
        emission_permission: "Direct",
        ip_option_1: "IP65",
        ik_option_2: "IK10",
        cct: "4000K",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Rope",
        optic_var_2: "Rope",
        emission_permission: "Indirect",
        ip_option_1: "IP65",
        ik_option_2: "IK10",
        cct: "4000K",
        approved: "yes",
      },
    ],
  };
  const constraints = { system: "DNX 80 DI", directOpticVar1: "80|Opal" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints,
  });

  const direct = viewModelField(result, "directOpticVar1", constraints);
  const indirect = viewModelField(result, "indirectOpticVar1", constraints);
  assert.deepEqual(compatibleLabels(workflowField(result, "directOpticVar1")), ["Comfort · 80", "Opal · 80"].sort());
  assert.deepEqual(compatibleLabels(workflowField(result, "indirectOpticVar1")), ["Rope · 80"]);
  assert.equal(direct.displayMode, "choice");
  assert.equal(direct.primaryControl, true);
  assert.equal(direct.compatibleOptionCount, 2);
  assert.equal(indirect.displayMode, "auto-chip");
  assert.equal(indirect.effectiveValue, "80|Rope");
  assert.equal(indirect.compatibleOptionCount, 1);
  assert.equal(workflowField(result, "directOpticVar2").options.length, 0);
  const opalVar2 = viewModelField(result, "directOpticVar2", constraints);
  assert.equal(opalVar2.displayMode, "hidden-diagnostic");
  assert.equal(opalVar2.compatibleOptionCount, 0);
  assert.deepEqual(primaryOpticVar1Controls(result, constraints), ["directOpticVar1", "indirectOpticVar1"]);

  const noDirectSelection = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints: { system: "DNX 80 DI" },
  });
  assert.equal(workflowField(noDirectSelection, "directOpticVar2").options.length, 0);

  const subBearingSelection = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints: { system: "DNX 80 DI", directOpticVar1: "80|Comfort" },
  });
  const directVar2 = workflowField(subBearingSelection, "directOpticVar2");
  assert.deepEqual(compatibleLabels(directVar2), ["Antiglare", "Low glare"].sort());
  const directVar2View = viewModelField(subBearingSelection, "directOpticVar2", { system: "DNX 80 DI", directOpticVar1: "80|Comfort" });
  assert.equal(directVar2View.displayMode, "choice");
  assert.equal(directVar2View.primaryControl, true);
  assert.equal(directVar2View.compatibleOptionCount, 2);
});

test("both-emission system keeps direct/down and indirect/up options as classifier choices", () => {
  const constraints = { system: "DNX 60 Beam DI" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });

  const direct = viewModelField(result, "directOpticVar1", constraints);
  assert.equal(direct.displayMode, "choice");
  assert.equal(direct.primaryControl, true);
  assert.equal(direct.compatibleOptionCount, compatibleCount(direct));
  assert.equal(direct.compatibleOptionCount, 3);

  const indirect = viewModelField(result, "indirectOpticVar1", constraints);
  assert.equal(indirect.displayMode, "choice");
  assert.equal(indirect.primaryControl, true);
  assert.equal(indirect.compatibleOptionCount, compatibleCount(indirect));
  assert.equal(indirect.compatibleOptionCount, 2);
});

test("both-emission system exposes single indirect optic as auto-chip while direct remains a choice", () => {
  const snapshot = cascadeSnapshot();
  snapshot.OPTICS = [
    ...snapshot.OPTICS,
    {
      system: "80",
      optic_var_1: "Linear",
      optic_var_2: "General",
      emission_permission: "Direct",
      ip_option_1: "IP65",
      ik_option_2: "IK10",
      cct: "4000K",
      approved: "yes",
    },
  ];
  const constraints = { system: "LNX 80 D/I" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints,
  });

  const direct = viewModelField(result, "directOpticVar1", constraints);
  assert.equal(direct.displayMode, "choice");
  assert.equal(direct.primaryControl, true);
  assert.equal(direct.compatibleOptionCount, compatibleCount(direct));
  assert.equal(direct.compatibleOptionCount, 2);

  const indirect = viewModelField(result, "indirectOpticVar1", constraints);
  assert.equal(indirect.displayMode, "auto-chip");
  assert.equal(indirect.effectiveValue, "80|Blade");
  assert.equal(indirect.compatibleOptionCount, compatibleCount(indirect));
  assert.equal(indirect.compatibleOptionCount, 1);

  const legacy = viewModelField(result, "diffuserVar1", constraints);
  assert.equal(legacy.primaryControl, false);
  assert.equal(legacy.displayMode, "hidden-diagnostic");
  assert.deepEqual(primaryOpticVar1Controls(result, constraints), ["directOpticVar1", "indirectOpticVar1"]);
});

test("multiple compatible direct and indirect optics remain choices with real compatible counts", () => {
  const snapshot = cascadeSnapshot();
  snapshot.OPTICS = [
    ...snapshot.OPTICS,
    {
      system: "80",
      optic_var_1: "Prism",
      optic_var_2: "Wide",
      emission_permission: "Both",
      ip_option_1: "IP65",
      ik_option_2: "IK10",
      cct: "4000K",
      approved: "yes",
    },
  ];
  const constraints = { system: "LNX 80 D/I" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints,
  });

  const direct = viewModelField(result, "directOpticVar1", constraints);
  const indirect = viewModelField(result, "indirectOpticVar1", constraints);
  assert.equal(direct.displayMode, "choice");
  assert.equal(direct.primaryControl, true);
  assert.equal(direct.compatibleOptionCount, compatibleCount(direct));
  assert.equal(direct.compatibleOptionCount, 2);
  assert.equal(indirect.displayMode, "choice");
  assert.equal(indirect.primaryControl, true);
  assert.equal(indirect.compatibleOptionCount, compatibleCount(indirect));
  assert.equal(indirect.compatibleOptionCount, 2);
});

test("direct and indirect composite-key suffixes are stripped before optic compatibility comparison", () => {
  const constraints = { system: "DNX 60 Beam DI", directOpticVar1: "60|Opal|Direct" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const directOption = workflowField(result, "directOpticVar1").options.find((item) => item.value === "60|Opal");

  assert.ok(directOption, "expected unsuffixed direct optic option to remain present");
  assert.equal(directOption.selected, true);
  assert.equal(directOption.status, "available");
  assert.equal(directOption.blocked, false);
  assert.equal(workflowField(result, "directOpticVar1").options.some((item) => item.value === "60|Opal|Direct"), false);

  const field = viewModelField(result, "directOpticVar1", constraints);
  assert.equal(field.selectedLabel, "Opal · 60");
  assert.equal(field.selectedOptionBlocked, false);
  assert.equal(field.compatibleOptionCount, compatibleCount(field));
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
    constraints: { system: "DNX 60 Beam DI", optic: "80|Blade" },
  });
  const selected = option(result, "optic", "80|Blade");

  assert.equal(selected.selected, true);
  assert.equal(selected.status, "blocked");
  assert.equal(selected.preservesManualConstraint, true);
  assert.ok(selected.blockedBy.some((item) => item.fieldKey === "system"));
});

test("compatible selections are not cleared", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX 60 Beam DI", optic: "60|Opal", cctCri: "3000K / CRI80" },
  });

  assert.equal(result.selectedConstraints.system, "DNX 60 Beam DI");
  assert.equal(result.selectedConstraints.optic, "60|Opal");
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
