import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { createSafeRailSelectionSourceBucketRows } from "../packages/modules/cs-selector/selectorView.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const testSourceUrl = new URL("./selectorMountingSpine.test.js", import.meta.url);
const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);

function createAdapter() {
  return {
    moduleId: "cs_selector",
    services: {},
    readSnapshots() {
      return {
        route: { moduleId: "cs_selector" },
        flags: { owner: "shell", values: {} },
        project: {
          owner: "shell",
          status: "loaded",
          metadata: { title: "", projectId: "" },
          currentProject: {},
        },
        handoff: { owner: "shell", status: "deferred", available: false },
        identity: {
          owner: "shell",
          status: "anonymous-fallback",
          currentUser: {},
          classification: "anonymous",
          identityState: "external_anonymous",
        },
        company: { owner: "shell", status: "placeholder", companyName: "" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: false },
          rule: "test",
        },
        timelinePolicy: {},
      };
    },
    isFlagEnabled() {
      return false;
    },
  };
}

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function mountingSnapshot({ includeFlex = true } = {}) {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct", mount_style: "Suspended;Recessed", approved: "yes" },
      { system: "ALT", system_variant_1: "40", label: "ALT 40", emission: "Direct", mount_style: "Surface Mount", approved: "yes" },
    ],
    ACCESSORIES: [
      {
        accessory_type: "mount",
        display_choice: "Suspended",
        mount_selections: "Wire;Rod",
        mount_particulars: "1500mm drop;Custom drop",
        approved: "yes",
      },
      {
        accessory_type: "mount",
        display_choice: "Recessed",
        mount_selections: "Spring clip;Frame kit",
        mount_particulars: "Plasterboard;T-bar",
        approved: "yes",
      },
      {
        accessory_type: "mount",
        display_choice: "Surface Mount",
        mount_selections: "Bracket",
        mount_particulars: "Direct fix",
        approved: "yes",
      },
      { accessory_type: "power_penetration", accessory_id: "Top", approved: "yes" },
      { accessory_type: "power_location", accessory_id: "Start", approved: "yes" },
      { accessory_type: "power_location", accessory_id: "mm", approved: "yes" },
      ...(includeFlex ? [{ accessory_type: "flex_length", accessory_id: "1500mm", approved: "yes" }] : []),
    ],
  };
}

function tBarMountingSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "TBarAllowed", label: "DNX T-Bar allowed", emission: "Direct", mount_style: "Suspended;Surface Mount", mount_style_all: "Recessed;Trimless;T-Bar Modular", approved: "yes" },
      { system: "DNX", system_variant_1: "TBarIndirect", label: "DNX T-Bar indirect", emission: "Both", mount_style: "Suspended;Surface Mount", mount_style_all: "Recessed;Trimless;T-Bar Modular", approved: "yes" },
      { system: "DNX", system_variant_1: "Recess_Flange", label: "DNX recessed", emission: "Direct", mount_style: "Recessed", mount_style_all: "Trimless", approved: "yes" },
      { system: "DNX", system_variant_1: "SurfaceOnly", label: "DNX surface only", emission: "Direct", mount_style: "Surface Mount", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mount", display_choice: "Suspended", mount_selections: "Wire;Rod", mount_particulars: "1500mm drop;Custom drop", approved: "yes" },
      { accessory_type: "mount", display_choice: "Surface Mount", mount_selections: "Surface bracket", mount_particulars: "Direct fix", approved: "yes" },
      { accessory_type: "mount", display_choice: "Recessed", mount_selections: "Spring clip", mount_particulars: "Plasterboard", approved: "yes" },
      { accessory_type: "mount", display_choice: "Trimless", mount_selections: "Trimless kit", mount_particulars: "Trimless frame", approved: "yes" },
      { accessory_type: "mount", display_choice: "T-Bar Modular", accessory_id: "T-Bar Modular", spec_code: "TBR", mount_selections: "Other;T-Bar Main Rail;T-Bar Drop In", mount_particulars: "T_Bar Scissor Clip;Other", approved: "yes" },
    ],
  };
}

function donorParityMountingSnapshot() {
  return {
    SYSTEM: [
      {
        system: "DNX",
        system_variant_1: "NoFlange",
        label: "DNX no-flange",
        emission: "Direct",
        mount_style: "Suspended (No Flange);Surface Mount (No Flange);Recessed (No Flange)",
        approved: "yes",
      },
      {
        system: "REC",
        system_variant_1: "SuspOk",
        label: "Recessed suspended allowed",
        emission: "Direct",
        mount_style: "Suspended (No Flange);Recessed (No Flange)",
        approved: "yes",
      },
      {
        system: "SURF",
        system_variant_1: "40",
        label: "Surface bracket only",
        emission: "Direct",
        mount_style: "Surface Mount (No Flange)",
        approved: "yes",
      },
    ],
    ACCESSORIES: [
      {
        accessory_type: "mount",
        display_choice: "Suspended (No Flange)",
        mount_selections: "Wire;Rod",
        mount_particulars: "1000mm drop;Custom drop",
        approved: "yes",
      },
      {
        accessory_type: "mount",
        display_choice: "Recessed (No Flange)",
        mount_selections: "Trimless kit;Recess kit",
        mount_particulars: "Plasterboard;Trimless frame",
        approved: "yes",
      },
      {
        accessory_type: "mount",
        display_choice: "Bracketed",
        mount_style: "Surface Mount (No Flange)",
        mount_selections: "Ceiling bracket;Wall bracket",
        mount_particulars: "Direct fix",
        approved: "yes",
      },
    ],
  };
}

function dnx80DiMountJoinSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "Square", label: "DNX 80 direct sibling", emission: "Direct", mount_style: "Surface Mount (No Flange);Suspended (No Flange)", approved: "yes" },
      { system: "DNX", system_variant_1: "Square_DI", label: "DNX 80 D/I", emission: "Both", mount_style: "Suspended (No Flange)", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mount", display_choice: "Surface Mount (No Flange)", mount_selections: "Surface bracket", mount_particulars: "Ceiling", approved: "yes" },
      { accessory_type: "mount", display_choice: "Suspended (No Flange)", mount_selections: "Wire;Rod", mount_particulars: "1500mm drop;Custom drop", approved: "yes" },
    ],
  };
}

function dnxProductMatrixMountingSnapshot() {
  return {
    SYSTEM: [
      { system: "80", system_variant_1: "Square", label: "DNX 80 direct-only", emission: "Direct", mount_style: "Surface Mount;Suspended", approved: "yes" },
      { system: "80", system_variant_1: "Square_DI", label: "DNX 80 D/I", emission: "Both", mount_style: "Surface Mount;Suspended", approved: "yes" },
      { system: "60", system_variant_1: "Beam", label: "DNX 60 Beam D/I", emission: "Both", mount_style: "Surface Mount", approved: "yes" },
      { system: "60", system_variant_1: "Linear", label: "DNX 60 direct sibling", emission: "Direct", mount_style: "Suspended", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mount", display_choice: "Surface Mount", mount_selections: "Ceiling bracket;Wall bracket", mount_particulars: "Direct fix", approved: "yes" },
      { accessory_type: "mount", display_choice: "Suspended", mount_selections: "Wire;Rod", mount_particulars: "1500mm drop;Custom drop", approved: "yes" },
    ],
  };
}

function mountPolicySnapshot() {
  return {
    SYSTEM: [
      {
        system: "DNX80",
        system_variant_1: "DI",
        label: "DNX80DI direct-indirect",
        emission: "Both",
        mount_style: "Surface Mount;Suspended",
        approved: "yes",
      },
      {
        system: "DNX60",
        system_variant_1: "Direct",
        label: "DNX60 direct-only",
        emission: "Direct",
        mount_style: "Surface Mount;Suspended",
        approved: "yes",
      },
    ],
    OPTICS: [
      {
        system: "DNX80",
        optic_var_1: "Linear Downlight",
        optic_var_2: "Opal",
        emission_permission: "Direct",
        approved: "yes",
      },
      {
        system: "DNX80",
        optic_var_1: "Linear Uplight",
        optic_var_2: "Uplight",
        emission_permission: "Indirect",
        approved: "yes",
      },
      {
        system: "DNX60",
        optic_var_1: "Direct Lens",
        optic_var_2: "Opal",
        emission_permission: "Direct",
        approved: "yes",
      },
    ],
    ACCESSORIES: [
      {
        accessory_type: "mount",
        display_choice: "Surface Mount",
        mount_selections: "Ceiling bracket;Wall bracket;Surface bracket",
        mount_particulars: "Direct fix",
        approved: "yes",
      },
      {
        accessory_type: "mount",
        display_choice: "Suspended",
        mount_selections: "Wire",
        mount_particulars: "1500mm drop",
        approved: "yes",
      },
      { accessory_type: "power_penetration", accessory_id: "Top", approved: "yes" },
      { accessory_type: "power_penetration", accessory_id: "Rear", approved: "yes" },
      { accessory_type: "power_penetration", accessory_id: "Side Wall", approved: "yes" },
      { accessory_type: "power_location", accessory_id: "Start", approved: "yes" },
      { accessory_type: "flex_length", accessory_id: "1500mm", approved: "yes" },
    ],
    CODE_POLICY: [
      {
        rule_id: "SURFACE_MOUNT_DI_BLOCK",
        area: "selector.mounting",
        approved: "yes",
        user_visible_ui: "Surface Mount is unavailable for direct-indirect/uplight systems because the ceiling blocks the indirect light component.",
      },
      {
        rule_id: "WALL_BRACKET_TOP_ENTRY_BLOCK",
        area: "selector.mounting",
        approved: "yes",
        user_visible_ui: "Top entry is unavailable for wall bracket mounting.",
      },
      {
        rule_id: "CEILING_BRACKET_SIDE_ENTRY_BLOCK",
        area: "selector.mounting",
        approved: "yes",
        user_visible_ui: "Side wall entry is unavailable for ceiling bracket mounting.",
      },
    ],
  };
}

function currentDbConstraints(selectorState = createSelectorState()) {
  const constraints = selectorState.getSnapshot?.().dbBackedSelector?.manualConstraints || {};
  return Object.fromEntries(Object.entries(constraints).map(([fieldKey, record]) => [fieldKey, String(record?.value || "").trim()]).filter(([, value]) => value));
}

function selectorReferenceStatus(snapshot = mountingSnapshot(), constraints = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints }),
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = mountingSnapshot() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot, currentDbConstraints(selectorState)),
  });
}

function selectAndReload(selectorState, fieldKey, value, snapshot = mountingSnapshot()) {
  let model = createModel({ selectorState, snapshot });
  model.selectorSurface.setFieldValue(fieldKey, value);
  return createModel({ selectorState, snapshot });
}

function railTruthItems(summary = {}, truthKind = "blocked") {
  return (Array.isArray(summary.groups) ? summary.groups : [])
    .flatMap((group) => Array.isArray(group.items) ? group.items : [])
    .filter((item) => item.truthKind === truthKind);
}

function compactBlockedRailText(summary = {}) {
  const bucket = createSafeRailSelectionSourceBucketRows("Blocked", railTruthItems(summary, "blocked"), { blockedReviewOnly: true });
  return [bucket.label, bucket.valueLabel, ...bucket.rows].join("\n");
}

function detailedBlockedValueText(summary = {}) {
  return (Array.isArray(summary.blockers) ? summary.blockers : []).map((item) => item.valueLabel || item.value || "").join("\n");
}

function mountingSection(spine) {
  const section = spine.sections.find((item) => item.sectionKey === "mounting");
  assert.ok(section, "expected Mounting spine section");
  return section;
}

function mountingRow(spine, rowKey) {
  const row = mountingSection(spine).rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected Mounting spine row ${rowKey}`);
  return row;
}

function workflowField(model, fieldKey) {
  const field = model.selectorSurface.workflowSections
    .flatMap((section) => section.fields || [])
    .find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected workflow field ${fieldKey}`);
  return field;
}

function optionValues(model, fieldKey) {
  return (workflowField(model, fieldKey).options || []).map((item) => item.value);
}

function compatibleOptionValues(model, fieldKey) {
  return (workflowField(model, fieldKey).options || [])
    .filter((item) => item.blocked !== true && item.status !== "blocked")
    .map((item) => item.value)
    .sort();
}

function visibleControlField(model = {}, fieldKey) {
  const field = (model.expanderShell?.manualConstraintBehaviour?.controlSections || [])
    .flatMap((section) => Array.isArray(section.fields) ? section.fields : [])
    .find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected visible/main control field ${fieldKey}`);
  return field;
}

function controlOptionValues(field = {}) {
  return (Array.isArray(field.options) ? field.options : []).map((option) => option.value).sort();
}

function workflowOption(model, fieldKey, value) {
  const option = (workflowField(model, fieldKey).options || []).find((item) => item.value === value || item.label === value);
  assert.ok(option, `expected option ${value} for ${fieldKey}`);
  return option;
}

test("empty Mounting spine rows render as em dash", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.equal(mountingRow(spine, "mountStyle").displayValue, "—");
  assert.equal(mountingRow(spine, "mountSelection").displayValue, "—");
  assert.equal(mountingRow(spine, "mountParticulars").displayValue, "—");
  assert.equal(mountingRow(spine, "powerPenetration").displayValue, "—");
  assert.equal(mountingRow(spine, "powerLocation").displayValue, "—");
  assert.equal(mountingRow(spine, "flexLength").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountStyle, null);
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountSelection, null);
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountParticulars, null);
  assert.equal(model.selectorSurface.payloadPreview.mounting.powerPenetration, null);
  assert.equal(model.selectorSurface.payloadPreview.mounting.powerLocation, null);
  assert.equal(model.selectorSurface.payloadPreview.mounting.flexLength, null);
});

test("mount style fills from real SYSTEM and ACCESSORIES reference options", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");

  assert.ok(optionValues(model, "mountStyle").includes("Suspended"));
  assert.ok(optionValues(model, "mountStyle").includes("Recessed"));

  model = selectAndReload(selectorState, "mountStyle", "Suspended");

  assert.equal(mountingRow(model.selectorSurface.productSpine, "mountStyle").displayValue, "Suspended");
  assert.equal(mountingRow(model.selectorSurface.productSpine, "mountStyle").status, "manual-constraint");
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountStyle, "Suspended");
});

test("System mount capability filters compatible mount styles before selection", () => {
  const recessedState = createSelectorState();
  const recessedModel = selectAndReload(recessedState, "system", "DNX|80");

  assert.deepEqual(compatibleOptionValues(recessedModel, "mountStyle"), ["Recessed", "Suspended"].sort());
  assert.deepEqual(optionValues(recessedModel, "mountStyle").sort(), ["Recessed", "Suspended"].sort());
  assert.deepEqual(controlOptionValues(visibleControlField(recessedModel, "mountStyle")), ["Recessed", "Suspended"].sort());
  assert.equal(visibleControlField(recessedModel, "mountStyle").incompatibleOptions.some((option) => option.value === "Surface Mount"), false);

  const surfaceState = createSelectorState();
  const surfaceModel = selectAndReload(surfaceState, "system", "ALT|40");
  assert.deepEqual(compatibleOptionValues(surfaceModel, "mountStyle"), ["Surface Mount"]);
  assert.deepEqual(optionValues(surfaceModel, "mountStyle"), ["Surface Mount"]);
  assert.deepEqual(controlOptionValues(visibleControlField(surfaceModel, "mountStyle")), ["Surface Mount"]);
  assert.equal(visibleControlField(surfaceModel, "mountStyle").incompatibleOptions.length, 0);
});

test("Mount Style includes donor-allowed T-Bar Modular without broad ACCESSORIES leakage", () => {
  const selectorState = createSelectorState();
  const snapshot = tBarMountingSnapshot();
  let model = selectAndReload(selectorState, "system", "DNX|TBarAllowed", snapshot);
  const values = controlOptionValues(visibleControlField(model, "mountStyle"));

  assert.deepEqual(values, ["Recessed", "Surface Mount", "Suspended", "T-Bar Modular", "Trimless"].sort());
  assert.equal(workflowField(model, "mountStyle").options.length, 5);
  assert.equal(workflowOption(model, "mountStyle", "T-Bar Modular").status, "available");

  model = selectAndReload(selectorState, "mountStyle", "T-Bar Modular", snapshot);
  assert.deepEqual(compatibleOptionValues(model, "mountSelection"), ["Other", "T-Bar Drop In", "T-Bar Main Rail"].sort());
  assert.equal(workflowOption(model, "mountSelection", "Surface bracket").status, "blocked");

  model = selectAndReload(selectorState, "mountSelection", "T-Bar Main Rail", snapshot);
  assert.deepEqual(compatibleOptionValues(model, "mountParticulars"), ["Other", "T_Bar Scissor Clip"].sort());
  assert.equal(workflowOption(model, "mountParticulars", "Direct fix").status, "blocked");

  const indirectState = createSelectorState();
  const indirectModel = selectAndReload(indirectState, "system", "DNX|TBarIndirect", snapshot);
  assert.equal(workflowOption(indirectModel, "mountStyle", "T-Bar Modular").status, "blocked");
  assert.equal(workflowOption(indirectModel, "mountStyle", "Trimless").status, "blocked");
  assert.equal(controlOptionValues(visibleControlField(indirectModel, "mountStyle")).includes("T-Bar Modular"), false);
  assert.equal(controlOptionValues(visibleControlField(indirectModel, "mountStyle")).includes("Trimless"), false);

  const recessedStyleState = createSelectorState();
  const recessedStyleModel = selectAndReload(recessedStyleState, "system", "DNX|Recess_Flange", snapshot);
  assert.equal(workflowOption(recessedStyleModel, "mountStyle", "Recessed").status, "available");
  assert.equal(workflowOption(recessedStyleModel, "mountStyle", "Trimless").status, "blocked");
  assert.equal(controlOptionValues(visibleControlField(recessedStyleModel, "mountStyle")).includes("Trimless"), false);

  const surfaceState = createSelectorState();
  const surfaceModel = selectAndReload(surfaceState, "system", "DNX|SurfaceOnly", snapshot);
  assert.deepEqual(controlOptionValues(visibleControlField(surfaceModel, "mountStyle")), ["Surface Mount"]);
  assert.equal(workflowField(surfaceModel, "mountStyle").options.length, 1);
});

test("mounting donor parity labels hide bracketed and no-flange internals", () => {
  const selectorState = createSelectorState();
  const snapshot = donorParityMountingSnapshot();
  const model = selectAndReload(selectorState, "system", "DNX|NoFlange", snapshot);
  const values = controlOptionValues(visibleControlField(model, "mountStyle"));

  assert.deepEqual(values, ["Recessed", "Surface Mount", "Suspended"].sort());
  assert.equal(values.some((value) => /Bracketed|No Flange/i.test(value)), false);
  assert.equal(workflowOption(model, "mountStyle", "Suspended").status, "available");
  assert.equal(workflowOption(model, "mountStyle", "Recessed").status, "available");
  assert.equal(workflowOption(model, "mountStyle", "Surface Mount").status, "available");
});

test("suspended and recessed visibility follows donor mount compatibility", () => {
  const snapshot = donorParityMountingSnapshot();
  const recessedState = createSelectorState();
  const recessedModel = selectAndReload(recessedState, "system", "REC|SuspOk", snapshot);

  assert.deepEqual(controlOptionValues(visibleControlField(recessedModel, "mountStyle")), ["Recessed", "Suspended"].sort());
  assert.deepEqual(optionValues(recessedModel, "mountStyle").sort(), ["Recessed", "Suspended"].sort());
  assert.equal(workflowOption(recessedModel, "mountStyle", "Suspended").status, "available");
  assert.equal(workflowOption(recessedModel, "mountStyle", "Recessed").status, "available");

  const surfaceState = createSelectorState();
  const surfaceModel = selectAndReload(surfaceState, "system", "SURF|40", snapshot);

  assert.deepEqual(controlOptionValues(visibleControlField(surfaceModel, "mountStyle")), ["Surface Mount"]);
  assert.deepEqual(optionValues(surfaceModel, "mountStyle"), ["Surface Mount"]);
  assert.equal(workflowOption(surfaceModel, "mountStyle", "Surface Mount").status, "available");
});

test("DNX 80 D/I mounting joins resolved SYSTEM mount_style to ACCESSORIES mount rows only", () => {
  const snapshot = dnx80DiMountJoinSnapshot();
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|Square_DI", snapshot);

  const liveMountField = visibleControlField(model, "mountStyle");
  const liveValues = controlOptionValues(liveMountField);
  assert.deepEqual(liveValues, ["Suspended"]);
  assert.deepEqual(optionValues(model, "mountStyle"), ["Suspended"]);
  assert.equal(liveValues.some((value) => /\(|\)|No Flange/i.test(value)), false);
  assert.equal(workflowOption(model, "mountStyle", "Suspended").status, "available");
  assert.equal(liveMountField.incompatibleOptions.some((option) => option.value === "Surface Mount"), false);

  model = selectAndReload(selectorState, "mountStyle", "Suspended", snapshot);
  assert.equal(workflowOption(model, "mountSelection", "Wire").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Surface bracket").status, "blocked");

  model = selectAndReload(selectorState, "mountSelection", "Wire", snapshot);
  assert.equal(workflowOption(model, "mountParticulars", "1500mm drop").status, "available");
  assert.equal(workflowOption(model, "mountParticulars", "Ceiling").status, "blocked");

  const staleState = createSelectorState();
  model = selectAndReload(staleState, "system", "DNX|Square_DI", snapshot);
  model = selectAndReload(staleState, "mountStyle", "Surface Mount", snapshot);
  const staleRow = mountingRow(model.selectorSurface.productSpine, "mountStyle");
  assert.equal(staleRow.displayValue, "—");
  assert.equal(staleRow.status, "blocked");
  assert.equal(workflowField(model, "mountStyle").dropdownOptions.some((option) => option.value === "Surface Mount"), false);
  assert.equal(visibleControlField(model, "mountStyle").incompatibleOptions.some((option) => option.value === "Surface Mount"), true);
});

test("DNX product matrix resolves mounting from exact SYSTEM system plus variant", () => {
  const snapshot = dnxProductMatrixMountingSnapshot();

  let state = createSelectorState();
  let model = selectAndReload(state, "system", "80|Square_DI", snapshot);
  assert.deepEqual(controlOptionValues(visibleControlField(model, "mountStyle")), ["Surface Mount", "Suspended"].sort());
  assert.deepEqual(optionValues(model, "mountStyle").sort(), ["Surface Mount", "Suspended"].sort());
  assert.equal(workflowField(model, "mountStyle").options.length, 2);
  model = selectAndReload(state, "mountStyle", "Surface Mount", snapshot);
  assert.equal(workflowOption(model, "mountSelection", "Wall bracket").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Ceiling bracket").status, "blocked");

  state = createSelectorState();
  model = selectAndReload(state, "system", "60|Beam", snapshot);
  assert.deepEqual(controlOptionValues(visibleControlField(model, "mountStyle")), ["Surface Mount"]);
  assert.deepEqual(optionValues(model, "mountStyle"), ["Surface Mount"]);
  assert.equal(workflowField(model, "mountStyle").options.length, 1);
  model = selectAndReload(state, "mountStyle", "Surface Mount", snapshot);
  assert.equal(workflowOption(model, "mountSelection", "Wall bracket").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Ceiling bracket").status, "blocked");

  state = createSelectorState();
  model = selectAndReload(state, "system", "80|Square", snapshot);
  assert.deepEqual(controlOptionValues(visibleControlField(model, "mountStyle")), ["Surface Mount", "Suspended"].sort());
  assert.deepEqual(optionValues(model, "mountStyle").sort(), ["Surface Mount", "Suspended"].sort());
  assert.equal(workflowField(model, "mountStyle").options.length, 2);
  model = selectAndReload(state, "mountStyle", "Surface Mount", snapshot);
  assert.equal(workflowOption(model, "mountSelection", "Ceiling bracket").status, "available");
});

test("recess-kit and trimless exceptions cascade from donor-compatible no-flange mounting", () => {
  const selectorState = createSelectorState();
  const snapshot = donorParityMountingSnapshot();
  let model = selectAndReload(selectorState, "system", "DNX|NoFlange", snapshot);
  model = selectAndReload(selectorState, "mountStyle", "Recessed", snapshot);

  assert.equal(workflowOption(model, "mountSelection", "Trimless kit").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Recess kit").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Ceiling bracket").status, "blocked");

  model = selectAndReload(selectorState, "mountSelection", "Trimless kit", snapshot);
  assert.equal(workflowOption(model, "mountParticulars", "Trimless frame").status, "available");
  assert.equal(workflowOption(model, "mountParticulars", "Direct fix").status, "blocked");
});

test("raw bracketed mounting selections are preserved as blocked when selected directly", () => {
  const selectorState = createSelectorState();
  const snapshot = donorParityMountingSnapshot();
  let model = selectAndReload(selectorState, "system", "DNX|NoFlange", snapshot);
  model = selectAndReload(selectorState, "mountStyle", "Bracketed", snapshot);

  const row = mountingRow(model.selectorSurface.productSpine, "mountStyle");
  assert.equal(row.displayValue, "—");
  assert.equal(row.status, "blocked");
  assert.equal(row.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.mountStyle.value, "Bracketed");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "mountStyle"));
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountStyle, null);
});

test("selecting mount style cascades compatible mount selection and particulars", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "mountStyle", "Suspended");

  assert.equal(workflowOption(model, "mountSelection", "Wire").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Bracket").status, "blocked");

  model = selectAndReload(selectorState, "mountSelection", "Wire");
  assert.equal(workflowOption(model, "mountParticulars", "1500mm drop").status, "available");
  assert.equal(workflowOption(model, "mountParticulars", "Direct fix").status, "blocked");

  model = selectAndReload(selectorState, "mountParticulars", "1500mm drop");

  assert.equal(mountingRow(model.selectorSurface.productSpine, "mountSelection").displayValue, "Wire");
  assert.equal(mountingRow(model.selectorSurface.productSpine, "mountParticulars").displayValue, "1500mm drop");
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountSelection, "Wire");
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountParticulars, "1500mm drop");
});

test("power penetration fills from SYSTEM lookup with hard-coded fallback while location and flex stay ACCESSORIES-backed", () => {
  const selectorState = createSelectorState();
  let model = createModel({ selectorState });

  assert.deepEqual(optionValues(model, "powerPenetration").sort(), ["Back Wall Side", "Bottom Cover Plate", "End Plate", "Top Side"].sort());
  assert.ok(optionValues(model, "powerLocation").includes("Start"));
  assert.ok(optionValues(model, "powerLocation").includes("TBD"));
  assert.ok(optionValues(model, "flexLength").includes("1500mm"));

  model = selectAndReload(selectorState, "powerPenetration", "Top Side");
  model = selectAndReload(selectorState, "powerLocation", "Start");
  model = selectAndReload(selectorState, "flexLength", "1500mm");

  assert.equal(mountingRow(model.selectorSurface.productSpine, "powerPenetration").displayValue, "Top Side");
  assert.equal(mountingRow(model.selectorSurface.productSpine, "powerLocation").displayValue, "Start");
  assert.equal(mountingRow(model.selectorSurface.productSpine, "flexLength").displayValue, "1500mm");
  assert.equal(model.selectorSurface.payloadPreview.mounting.powerPenetration, "Top Side");
  assert.equal(model.selectorSurface.payloadPreview.mounting.powerLocation, "Start");
  assert.equal(model.selectorSurface.payloadPreview.mounting.flexLength, "1500mm");

  const missingFlexModel = createModel({ snapshot: mountingSnapshot({ includeFlex: false }) });
  assert.equal(mountingRow(missingFlexModel.selectorSurface.productSpine, "flexLength").displayValue, "—");
  assert.equal(missingFlexModel.selectorSurface.payloadPreview.mounting.flexLength, null);
});

test("incompatible Mounting selections are preserved and blocked", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "mountStyle", "Surface Mount");

  const styleRow = mountingRow(model.selectorSurface.productSpine, "mountStyle");
  assert.equal(styleRow.displayValue, "—");
  assert.equal(styleRow.status, "blocked");
  assert.equal(styleRow.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.mountStyle.value, "Surface Mount");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "mountStyle"));
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountStyle, null);

  model = selectAndReload(selectorState, "mountStyle", "Suspended");
  model = selectAndReload(selectorState, "mountSelection", "Bracket");

  const selectionRow = mountingRow(model.selectorSurface.productSpine, "mountSelection");
  assert.equal(selectionRow.displayValue, "—");
  assert.equal(selectionRow.status, "blocked");
  assert.equal(selectionRow.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.mountSelection.value, "Bracket");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "mountSelection"));
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountSelection, null);
});

test("Mounting payload preview keeps safety flags disabled and exposes no raw source data", async () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "mountStyle", "Suspended");
  model = selectAndReload(selectorState, "mountSelection", "Wire");
  model = selectAndReload(selectorState, "mountParticulars", "1500mm drop");
  model = selectAndReload(selectorState, "powerPenetration", "Top Side");
  model = selectAndReload(selectorState, "powerLocation", "Start");
  model = selectAndReload(selectorState, "flexLength", "1500mm");

  const payload = model.selectorSurface.payloadPreview;
  assert.equal(payload.previewOnly, true);
  assert.equal(payload.productionPayload, false);
  assert.equal(payload.mounting.mountStyle, "Suspended");
  assert.equal(payload.mounting.mountSelection, "Wire");
  assert.equal(payload.mounting.mountParticulars, "1500mm drop");
  assert.equal(payload.mounting.powerPenetration, "Top Side");
  assert.equal(payload.mounting.powerLocation, "Start");
  assert.equal(payload.mounting.flexLength, "1500mm");
  assert.equal(payload.safetyFlags.readOnly, true);
  assert.equal(payload.safetyFlags.writes, false);
  assert.equal(payload.safetyFlags.generation, false);
  assert.equal(payload.safetyFlags.labProofAuthority, false);
  assert.equal(payload.safetyFlags.rawRowsExposed, false);
  assert.equal(payload.safetyFlags.rawHeadersExposed, false);
  assert.equal(payload.safetyFlags.rawUsersExposed, false);
  assert.equal(payload.safetyFlags.credentialsExposed, false);
  assert.equal(payload.safetyFlags.privatePathsExposed, false);

  const serialisedSurface = JSON.stringify(model.selectorSurface);
  assert.equal(serialisedSurface.includes("sourcePath"), false);
  assert.equal(serialisedSurface.includes("Lab evidence"), false);

  const source = await readFile(testSourceUrl, "utf-8");
  const atSignLiteral = String.fromCharCode(64);
  const usersTableLiteral = ["US", "ERS:"].join("");
  assert.equal(source.includes(atSignLiteral), false);
  assert.equal(source.includes(usersTableLiteral), false);
});

test("DNX 80 D/I allows donor Surface Mount style but blocks ceiling-bracket selection", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  let model = selectAndReload(selectorState, "system", "DNX80|DI", snapshot);

  assert.equal(workflowOption(model, "mountStyle", "Surface Mount").status, "available");
  assert.equal(workflowOption(model, "mountStyle", "Suspended").status, "available");
  assert.deepEqual(controlOptionValues(visibleControlField(model, "mountStyle")), ["Surface Mount", "Suspended"].sort());

  model = selectAndReload(selectorState, "mountStyle", "Surface Mount", snapshot);
  assert.equal(workflowOption(model, "mountSelection", "Wall bracket").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Surface bracket").status, "available");
  assert.equal(workflowOption(model, "mountSelection", "Ceiling bracket").status, "blocked");
  assert.match(workflowOption(model, "mountSelection", "Ceiling bracket").blockedReason, /ceiling-bracket|direct-indirect|uplight/i);
  assert.equal(visibleControlField(model, "mountSelection").incompatibleOptions.some((option) => option.value === "Ceiling bracket"), true);
  assert.equal(controlOptionValues(visibleControlField(model, "mountSelection")).includes("Ceiling bracket"), false);

  model = selectAndReload(selectorState, "mountSelection", "Ceiling bracket", snapshot);
  const row = mountingRow(model.selectorSurface.productSpine, "mountSelection");
  assert.equal(row.displayValue, "—");
  assert.equal(row.status, "blocked");
  assert.equal(row.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.mountSelection.value, "Ceiling bracket");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "mountSelection"));
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountSelection, null);

  const railText = compactBlockedRailText(model.selectorSurface.selectionTruthSummary);
  assert.match(railText, /review required/);
  assert.doesNotMatch(railText, /Ceiling bracket/);
  assert.match(detailedBlockedValueText(model.selectorSurface.selectionTruthSummary), /Ceiling bracket/);
});

test("power penetration follows donor mount orientation rules and preserves stale top as blocked", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  let model = selectAndReload(selectorState, "system", "DNX80|DI", snapshot);
  model = selectAndReload(selectorState, "mountStyle", "Surface Mount", snapshot);
  model = selectAndReload(selectorState, "mountSelection", "Wall bracket", snapshot);

  assert.equal(workflowOption(model, "powerPenetration", "Top Side").status, "blocked");
  assert.equal(workflowOption(model, "powerPenetration", "End Plate").status, "available");
  assert.equal(workflowOption(model, "powerPenetration", "Back Wall Side").status, "available");
  assert.equal(controlOptionValues(visibleControlField(model, "powerPenetration")).includes("Top Side"), false);

  model = selectAndReload(selectorState, "powerPenetration", "Top Side", snapshot);
  const topRow = mountingRow(model.selectorSurface.productSpine, "powerPenetration");
  assert.equal(topRow.displayValue, "—");
  assert.equal(topRow.status, "blocked");
  assert.equal(topRow.blocked, true);
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "powerPenetration"));
  assert.equal(model.selectorSurface.payloadPreview.mounting.powerPenetration, null);

  const directState = createSelectorState();
  model = selectAndReload(directState, "system", "DNX60|Direct", snapshot);
  model = selectAndReload(directState, "mountStyle", "Surface Mount", snapshot);
  model = selectAndReload(directState, "mountSelection", "Ceiling bracket", snapshot);
  assert.equal(workflowOption(model, "mountSelection", "Ceiling bracket").status, "available");
  assert.equal(workflowOption(model, "powerPenetration", "Top Side").status, "available");
  assert.equal(workflowOption(model, "powerPenetration", "Back Wall Side").status, "blocked");
});

test("mount CODE_POLICY plain reason stays in main flow and technical code stays in developer diagnostics", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");
  const blockedMainIndex = source.indexOf("appendCompactMetadataLine(compactMeta, \"blocked\"");
  const developerDrawerIndex = source.indexOf("const diagnosticsDetails = document.createElement(\"details\")");
  const codePolicyDiagnosticsIndex = source.indexOf("appendSelectorCodePolicyDiagnostics(diagnostics, surface)");

  assert.ok(blockedMainIndex > 0, "plain blocked reason should remain available on the primary field card");
  assert.ok(developerDrawerIndex > blockedMainIndex, "developer drawer should render after the main product flow");
  assert.ok(codePolicyDiagnosticsIndex > developerDrawerIndex, "technical CODE_POLICY details should be appended inside the developer drawer");
  assert.match(source, /CODE_POLICY technical blockers/);
  assert.match(source, /optionTechnicalBlockerSummary/);
});

test("single indirect optic remains an explicit visible choice without mutating state", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  const model = selectAndReload(selectorState, "system", "DNX80|DI", snapshot);

  const indirect = workflowField(model, "indirectOpticVar1");
  assert.equal(indirect.displayMode, "choice");
  assert.equal(indirect.primaryControl, true);
  assert.equal(indirect.effectiveValue, "");
  assert.equal(indirect.compatibleOptionCount, 1);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.indirectOpticVar1, undefined);
});

test("direct-only mounting keeps donor ceiling and surface choices valid", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  let model = selectAndReload(selectorState, "system", "DNX60|Direct", snapshot);

  const surface = workflowOption(model, "mountStyle", "Surface Mount");
  assert.equal(surface.status, "available");
  assert.equal(surface.blocked, false);
  assert.equal(workflowOption(model, "mountStyle", "Suspended").status, "available");

  model = selectAndReload(selectorState, "mountStyle", "Surface Mount", snapshot);
  assert.equal(workflowOption(model, "mountSelection", "Ceiling bracket").status, "available");
});

test("mount policy compatibility keeps runtime safety boundaries closed", async () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(mountPolicySnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX80|DI" },
  });

  assert.equal(result.rawRowsExposed, false);
  assert.equal(result.runtimeDataMutationEnabled, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.payloadGenerationEnabled, false);
  assert.equal(result.hiddenWriteBackEnabled, false);

  const source = await readFile(new URL("../packages/workspace-kernel/selectorReferenceOptionsService.js", import.meta.url), "utf-8");
  assert.equal(/\b(?:app|router)\.post\s*\(/.test(source), false);
  assert.equal(/donorEngine\.run|run_engine|generateRunTable|generateIES/.test(source), false);
});
