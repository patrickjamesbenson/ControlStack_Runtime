import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { createSafeRailSelectionSourceBucketRows, renderSelectorView } from "../packages/modules/cs-selector/selectorView.js";

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

function productSpineRow(surface = {}, sectionKey, rowKey) {
  const section = (surface.productSpine?.sections || []).find((item) => item.sectionKey === sectionKey);
  assert.ok(section, `expected product spine section ${sectionKey}`);
  const row = (section.rows || []).find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected product spine row ${rowKey}`);
  return row;
}

function truthItemsForField(summary = {}, fieldKey, truthKind = "manual-constraint") {
  return (Array.isArray(summary.groups) ? summary.groups : [])
    .flatMap((group) => Array.isArray(group.items) ? group.items : [])
    .filter((item) => item.fieldKey === fieldKey && item.truthKind === truthKind);
}

function visibleControlField(model = {}, fieldKey) {
  const fields = (model.expanderShell?.manualConstraintBehaviour?.controlSections || [])
    .flatMap((section) => Array.isArray(section.fields) ? section.fields : []);
  const field = fields.find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected visible/main control field ${fieldKey}`);
  return field;
}

function optionalVisibleControlField(model = {}, fieldKey) {
  return (model.expanderShell?.manualConstraintBehaviour?.controlSections || [])
    .flatMap((section) => Array.isArray(section.fields) ? section.fields : [])
    .find((item) => item.fieldKey === fieldKey) || null;
}

function controlOptionLabels(field = {}) {
  return (Array.isArray(field.options) ? field.options : []).map((option) => option.label || option.value).sort();
}

class SelectorTestElement {
  constructor(tagName = "div") {
    this.tagName = String(tagName || "div").toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.eventListeners = {};
    this.className = "";
    this.textContent = "";
    this.value = "";
    this.id = "";
    this.htmlFor = "";
    this.type = "";
    this.open = false;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  get options() {
    return this.children.filter((child) => child.tagName === "OPTION");
  }

  addEventListener(type, handler) {
    this.eventListeners[type] = handler;
  }
}

function withSelectorTestDocument(callback) {
  const documentKey = "doc" + "ument";
  const previousDocument = globalThis[documentKey];
  globalThis[documentKey] = {
    createElement(tagName) {
      return new SelectorTestElement(tagName);
    },
  };
  try {
    return callback();
  } finally {
    globalThis[documentKey] = previousDocument;
  }
}

function elementDescendants(element) {
  return [element, ...(element.children || []).flatMap(elementDescendants)];
}

function renderedSelectorContainer(model) {
  return withSelectorTestDocument(() => {
    const container = globalThis["doc" + "ument"].createElement("div");
    renderSelectorView(container, model);
    return container;
  });
}

function renderedSelectsForField(container, fieldKey) {
  return elementDescendants(container).filter((element) => element.tagName === "SELECT" && element.dataset.fieldKey === fieldKey);
}

function renderedSelectOptionLabels(select) {
  return select.options.map((option) => option.textContent || option.value).filter(Boolean).sort();
}

function identityCascadeSnapshot() {
  return {
    SYSTEM: [
      { system: "60", system_variant_1: "Direct", label: "DNX 60 Direct", emission: "Direct", approved: "yes" },
      { system: "60", system_variant_1: "Beam_DI", label: "DNX 60 Beam D/I", emission: "Both", approved: "yes" },
      { system: "80", system_variant_1: "Square", label: "DNX 80 Direct", emission: "Direct", approved: "yes" },
      { system: "80", system_variant_1: "Square_DI", label: "DNX 80 DI", emission: "Both", approved: "yes" },
    ],
    OPTICS: [
      { system: "60", optic_var_1: "Opal", optic_var_2: "Soft", emission_permission: "Direct", approved: "yes" },
      { system: "60", optic_var_1: "Rope", optic_var_2: "Rope", emission_permission: "Indirect", approved: "yes" },
      { system: "80", optic_var_1: "Inlay", optic_var_2: "Var1;Var2", spec_code: "IN", spec_code_var2: "V1;V2", emission_permission: "Direct", approved: "yes" },
      { system: "80", optic_var_1: "Rope", optic_var_2: "Rope", emission_permission: "Indirect", approved: "yes" },
    ],
    BOARDS: [
      { system: "60", optic_var_1: "Opal", c1_cct: "3000", c1_cri_min: "80", board_lm_per_m: "900", control_type_labels: "Non-dim", approved: "yes" },
      { system: "80", optic_var_1: "Inlay", c1_cct: "4000", c1_cri_min: "90", board_lm_per_m: "1500", control_type_labels: "DALI-2", approved: "yes" },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", native_control_type: "DALI-2", wiring_type: "5-core DALI", approved: "yes" },
      { driver_id: "Standard Driver", native_control_type: "Non-dim", wiring_type: "3-core switched", approved: "yes" },
    ],
  };
}

test("DNX60 direct-only suppresses indirect optics while DNX60 Beam D/I keeps both paths", () => {
  const snapshot = identityCascadeSnapshot();
  const directOnlyConstraints = { system: "DNX 60 Direct" };
  const directOnly = deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints: directOnlyConstraints });

  assert.equal(option(directOnly, "directOpticVar1", "60|Opal").status, "available");
  assert.equal(option(directOnly, "indirectOpticVar1", "60|Rope").status, "blocked");
  const directOnlyIndirect = viewModelField(directOnly, "indirectOpticVar1", directOnlyConstraints);
  assert.equal(directOnlyIndirect.displayMode, "hidden-diagnostic");
  assert.equal(directOnlyIndirect.compatibleOptionCount, 0);
  assert.deepEqual(primaryOpticVar1Controls(directOnly, directOnlyConstraints), ["directOpticVar1"]);

  const beamDiConstraints = { system: "DNX 60 Beam D/I" };
  const beamDi = deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints: beamDiConstraints });
  assert.equal(option(beamDi, "directOpticVar1", "60|Opal").status, "available");
  assert.equal(option(beamDi, "indirectOpticVar1", "60|Rope").status, "available");
  assert.deepEqual(primaryOpticVar1Controls(beamDi, beamDiConstraints), ["directOpticVar1", "indirectOpticVar1"]);
});

test("DNX80 direct-only and DNX80 DI remain distinct while DI exposes source-backed direct Var1/Var2 and single indirect Rope", () => {
  const snapshot = identityCascadeSnapshot();
  const directOnlyConstraints = { system: "DNX 80 Direct" };
  const directOnly = deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints: directOnlyConstraints });

  assert.equal(option(directOnly, "directOpticVar1", "80|Inlay").status, "available");
  assert.equal(option(directOnly, "indirectOpticVar1", "80|Rope").status, "blocked");
  assert.equal(viewModelField(directOnly, "indirectOpticVar1", directOnlyConstraints).compatibleOptionCount, 0);
  assert.deepEqual(primaryOpticVar1Controls(directOnly, directOnlyConstraints), ["directOpticVar1"]);

  const diConstraints = { system: "DNX 80 DI" };
  const di = deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints: diConstraints });
  assert.deepEqual(compatibleLabels(workflowField(di, "directOpticVar1")), ["Inlay · 80"]);
  assert.deepEqual(compatibleLabels(workflowField(di, "indirectOpticVar1")), ["Rope · 80"]);
  const indirect = viewModelField(di, "indirectOpticVar1", diConstraints);
  assert.equal(indirect.displayMode, "auto-chip");
  assert.equal(indirect.effectiveValue, "80|Rope");

  const diWithDirect = deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints: { ...diConstraints, directOpticVar1: "80|Inlay" } });
  assert.deepEqual(compatibleLabels(workflowField(diWithDirect, "directOpticVar2")), ["Var1", "Var2"]);
});

test("indirect lm/m is independent and topology consequence rows render as read-only metadata", () => {
  const constraints = { system: "DNX 80 DI", controlType: "DALI-2" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(identityCascadeSnapshot(), { source: sourceReady(), constraints });
  const model = selectorViewModelFor(result, constraints);
  const indirectLm = viewModelField(result, "targetLmPerMIndirect", constraints);

  assert.equal(indirectLm.displayMode, "choice");
  assert.equal(indirectLm.primaryControl, true);
  assert.notEqual(indirectLm.provenance, "inherited");

  const lightRows = model.selectorSurface.productSpine.sections.find((section) => section.sectionKey === "lightControl").rows;
  const topology = lightRows.find((row) => row.rowKey === "topologyConsequence");
  const cores = lightRows.find((row) => row.rowKey === "coresConsequence");
  const notes = lightRows.find((row) => row.rowKey === "topologyNotes");
  assert.ok(topology, "expected Topology consequence row");
  assert.ok(cores, "expected Cores consequence row");
  assert.ok(notes, "expected Notes consequence row");
  assert.notEqual(topology.displayValue, "—");
  assert.equal(topology.status, "metadata-only");
  assert.match(topology.displayValue, /topology/i);
  assert.notEqual(cores.displayValue, "—");
  assert.equal(cores.status, "metadata-only");
  assert.match(cores.displayValue, /core/i);
  assert.match(notes.displayValue, /not proof/i);
  assert.equal(topology.rawRowsExposed, false);
  assert.equal(cores.rawRowsExposed, false);
  assert.equal(notes.rawRowsExposed, false);
});

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
  assert.deepEqual(compatibleLabels(workflowField(result, "directOpticVar2")), ["Antiglare"]);
  const opalVar2 = viewModelField(result, "directOpticVar2", constraints);
  assert.equal(opalVar2.displayMode, "auto-chip");
  assert.equal(opalVar2.effectiveValue, "80|Opal|Antiglare");
  assert.equal(opalVar2.compatibleOptionCount, 1);
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

  assert.ok(workflowField(result, "egressLight").options.some((item) => item.value === "Maintained" && item.label === "EM — Maintained"));
  assert.ok(workflowField(result, "egressSound").options.some((item) => item.value === "EWIS" && item.label === "EWIS"));
  assert.ok(workflowField(result, "sensor").options.some((item) => item.value === "PIR Sensor" && item.label === "PIR Sensor"));
  assert.equal(workflowField(result, "accessories").options.some((item) => item.value === "Maintained"), false);
  assert.equal(workflowField(result, "accessories").options.some((item) => item.value === "EWIS"), false);
  assert.equal(workflowField(result, "accessories").options.some((item) => item.value === "PIR Sensor"), false);
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

test("system changes reconcile stale direct and indirect optics out of selected truth, summary rail, and payload preview", () => {
  const staleConstraints = {
    system: "DNX 60 Direct",
    directOpticVar1: "80|Inlay",
    directOpticVar2: "80|Inlay|Var1",
    indirectOpticVar1: "80|Rope",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(identityCascadeSnapshot(), {
    source: sourceReady(),
    constraints: staleConstraints,
  });
  const model = selectorViewModelFor(result, staleConstraints);

  assert.equal(option(result, "directOpticVar1", "80|Inlay").status, "blocked");
  assert.equal(option(result, "directOpticVar2", "80|Inlay|Var1").status, "blocked");
  assert.equal(option(result, "indirectOpticVar1", "80|Rope").status, "blocked");

  const surface = model.selectorSurface;
  assert.equal(surface.payloadPreview.optics.direct.opticVar1, null);
  assert.equal(surface.payloadPreview.optics.direct.opticVar2, null);
  assert.equal(surface.payloadPreview.optics.indirect.opticVar1, null);
  assert.equal(surface.payloadPreview.optics.indirect.opticVar2, null);

  const directTile = surface.donorShapeSelectedTiles.find((item) => item.tileKey === "directOpticVar1");
  const indirectTile = surface.donorShapeSelectedTiles.find((item) => item.tileKey === "indirectOpticVar1");
  assert.equal(directTile.blocked, true);
  assert.equal(directTile.value, "");
  assert.equal(directTile.valueLabel, "Not selected");
  assert.equal(indirectTile.blocked, true);
  assert.equal(indirectTile.value, "");

  const productSection = surface.productSpine.sections.find((section) => section.sectionKey === "system");
  const directRow = productSection.rows.find((row) => row.rowKey === "opticDirect");
  const indirectRow = productSection.rows.find((row) => row.rowKey === "opticIndirect");
  assert.equal(directRow.status, "blocked");
  assert.equal(directRow.displayValue, "—");
  assert.equal(indirectRow, undefined, "direct-only system should suppress the indirect product-spine row");

  const blockers = surface.selectionTruthSummary.blockers.map((item) => item.fieldKey).sort();
  assert.ok(blockers.includes("directOpticVar1"));
  assert.ok(blockers.includes("directOpticVar2"));
  assert.ok(blockers.includes("indirectOpticVar1"));

  const railText = compactBlockedRailText(surface.selectionTruthSummary);
  assert.match(railText, /review required/);
  assert.match(railText, /blocked/);
  assert.doesNotMatch(railText, /Inlay|Rope|Var1/);
  assert.match(detailedBlockedValueText(surface.selectionTruthSummary), /Inlay|Rope|Var1/);
});

test("direct-only system keeps stale indirect optic out of compact blocked rail value text", () => {
  const constraints = {
    system: "DNX 60 Direct",
    indirectOpticVar1: "60|Rope",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(identityCascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);

  assert.equal(option(result, "indirectOpticVar1", "60|Rope").status, "blocked");
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, null);
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "indirectOpticVar1"));

  const railText = compactBlockedRailText(model.selectorSurface.selectionTruthSummary);
  assert.match(railText, /review required/);
  assert.match(railText, /blocked/);
  assert.doesNotMatch(railText, /Rope/);
  assert.match(detailedBlockedValueText(model.selectorSurface.selectionTruthSummary), /Rope/);
});

test("direct optic var-1 changes reconcile stale var-2 from payload and keep valid child options", () => {
  const constraints = {
    system: "DNX 60 Beam DI",
    directOpticVar1: "60|Comfort",
    directOpticVar2: "60|Opal|Soft",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);
  const directVar2 = workflowField(result, "directOpticVar2");

  assert.deepEqual(compatibleLabels(directVar2), ["Low glare"]);
  assert.equal(option(result, "directOpticVar2", "60|Opal|Soft").status, "blocked");
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar1, "Comfort · 60");
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar2, null);

  const viewField = viewModelField(result, "directOpticVar2", constraints);
  assert.equal(viewField.displayMode, "warning-chip");
  assert.equal(viewField.effectiveValue, "");
  assert.equal(viewField.selectedOptionBlocked, true);
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "directOpticVar2"));
  const railText = compactBlockedRailText(model.selectorSurface.selectionTruthSummary);
  assert.match(railText, /review required/);
  assert.doesNotMatch(railText, /Soft/);
  assert.match(detailedBlockedValueText(model.selectorSurface.selectionTruthSummary), /Soft/);
});

test("compatible downstream optic survives parent changes as selected truth", () => {
  const constraints = { system: "DNX 80 DI", directOpticVar1: "80|Inlay" };
  const result = deriveSelectorReferenceOptionsFromSnapshot(identityCascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);

  assert.equal(option(result, "directOpticVar1", "80|Inlay").status, "available");
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar1, "Inlay · 80");
  const directTile = model.selectorSurface.donorShapeSelectedTiles.find((item) => item.tileKey === "directOpticVar1");
  assert.equal(directTile.blocked, false);
  assert.equal(directTile.value, "80|Inlay");
  assert.equal(directTile.valueLabel, "Inlay · 80");
});

test("system changes reconcile stale IP and IK out of selected truth, summary rail, and payload preview", () => {
  const constraints = {
    system: "DNX 60 Beam DI",
    ipRating: "IP65",
    ikRating: "IK10",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);
  const surface = model.selectorSurface;

  assert.deepEqual(compatibleLabels(workflowField(result, "ipRating")), ["IP20", "IP44"]);
  assert.deepEqual(compatibleLabels(workflowField(result, "ikRating")), ["IK07"]);
  assert.equal(option(result, "ipRating", "IP65").selected, true);
  assert.equal(option(result, "ipRating", "IP65").status, "blocked");
  assert.equal(option(result, "ikRating", "IK10").selected, true);
  assert.equal(option(result, "ikRating", "IK10").status, "blocked");

  assert.equal(surface.payloadPreview.environment.ip, null);
  assert.equal(surface.payloadPreview.environment.ik, null);
  const ipIkRow = productSpineRow(surface, "environment", "ipIk");
  assert.equal(ipIkRow.status, "blocked");
  assert.equal(ipIkRow.displayValue, "—");
  assert.equal(truthItemsForField(surface.selectionTruthSummary, "ipRating", "manual-constraint").length, 0);
  assert.equal(truthItemsForField(surface.selectionTruthSummary, "ikRating", "manual-constraint").length, 0);
  assert.ok(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ipRating"));
  assert.ok(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ikRating"));

  const railText = compactBlockedRailText(surface.selectionTruthSummary);
  assert.match(railText, /review required/);
  assert.doesNotMatch(railText, /IP65|IK10/);
  assert.match(detailedBlockedValueText(surface.selectionTruthSummary), /IP65|IK10/);
});

test("direct optic changes reconcile stale IP and IK while exposing new valid Environment candidates", () => {
  const constraints = {
    system: "DNX 60 Beam DI",
    directOpticVar1: "60|Comfort",
    ipRating: "IP44",
    ikRating: "IK10",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);
  const surface = model.selectorSurface;

  assert.deepEqual(compatibleLabels(workflowField(result, "ipRating")), ["IP20"]);
  assert.deepEqual(compatibleLabels(workflowField(result, "ikRating")), ["IK07"]);
  assert.equal(option(result, "ipRating", "IP44").selected, true);
  assert.equal(option(result, "ipRating", "IP44").status, "blocked");
  assert.equal(option(result, "ikRating", "IK10").selected, true);
  assert.equal(option(result, "ikRating", "IK10").status, "blocked");
  assert.equal(surface.payloadPreview.optics.direct.opticVar1, "Comfort · 60");
  assert.equal(surface.payloadPreview.environment.ip, null);
  assert.equal(surface.payloadPreview.environment.ik, null);
  assert.equal(productSpineRow(surface, "environment", "ipIk").displayValue, "—");
  assert.equal(truthItemsForField(surface.selectionTruthSummary, "ipRating", "manual-constraint").length, 0);
  assert.equal(truthItemsForField(surface.selectionTruthSummary, "ikRating", "manual-constraint").length, 0);
  assert.ok(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ipRating"));
  assert.ok(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ikRating"));

  const railText = compactBlockedRailText(surface.selectionTruthSummary);
  assert.match(railText, /review required/);
  assert.doesNotMatch(railText, /IP44|IK10/);
  assert.match(detailedBlockedValueText(surface.selectionTruthSummary), /IP44|IK10/);
});

test("compatible IP and IK survive System and optic constraints as selected truth", () => {
  const constraints = {
    system: "DNX 60 Beam DI",
    directOpticVar1: "60|Opal",
    ipRating: "IP44",
    ikRating: "IK07",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);
  const surface = model.selectorSurface;

  assert.equal(option(result, "ipRating", "IP44").status, "available");
  assert.equal(option(result, "ikRating", "IK07").status, "available");
  assert.equal(surface.payloadPreview.environment.ip, "IP44");
  assert.equal(surface.payloadPreview.environment.ik, "IK07");
  const ipIkRow = productSpineRow(surface, "environment", "ipIk");
  assert.equal(ipIkRow.status, "manual-constraint");
  assert.equal(ipIkRow.displayValue, "IP44 / IK07");
  assert.equal(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ipRating"), false);
  assert.equal(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ikRating"), false);
});

test("stale optic children and indirect optics do not block IP/IK parent candidate calculation", () => {
  const constraints = {
    system: "DNX 60 Beam DI",
    directOpticVar1: "60|Comfort",
    directOpticVar2: "60|Opal|Soft",
    indirectOpticVar1: "80|Blade",
    ipRating: "IP20",
    ikRating: "IK07",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);
  const surface = model.selectorSurface;

  assert.deepEqual(compatibleLabels(workflowField(result, "ipRating")), ["IP20"]);
  assert.deepEqual(compatibleLabels(workflowField(result, "ikRating")), ["IK07"]);
  assert.equal(option(result, "ipRating", "IP20").status, "available");
  assert.equal(option(result, "ikRating", "IK07").status, "available");
  assert.equal(surface.payloadPreview.environment.ip, "IP20");
  assert.equal(surface.payloadPreview.environment.ik, "IK07");
  assert.equal(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ipRating"), false);
  assert.equal(surface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ikRating"), false);
});

test("live main Direct Optic Var1 dropdown clears stale blocked optic while developer detail retains it", () => {
  const constraints = {
    system: "LNX 80 D/I",
    directOpticVar1: "60|Comfort",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), {
    source: sourceReady(),
    constraints,
  });
  const model = selectorViewModelFor(result, constraints);
  const surface = model.selectorSurface;
  const mainDirectField = viewModelField(result, "directOpticVar1", constraints);
  const liveControlField = visibleControlField(model, "directOpticVar1");
  const renderedContainer = renderedSelectorContainer(model);
  const renderedDirectSelects = renderedSelectsForField(renderedContainer, "directOpticVar1");

  assert.equal(option(result, "directOpticVar1", "60|Comfort").status, "blocked");
  assert.equal(mainDirectField.displayMode, "warning-chip");
  assert.equal(mainDirectField.selectedOptionBlocked, true);
  assert.equal(mainDirectField.effectiveValue, "");
  assert.equal(mainDirectField.selectedBlockedOptionVisible, false);
  assert.equal(mainDirectField.dropdownOptions.some((item) => item.value === "60|Comfort" || /Comfort/.test(item.label)), false);
  const diagnostic = mainDirectField.incompatibleOptions.find((item) => item.value === "60|Comfort");
  assert.ok(diagnostic, "stale direct optic should remain available for diagnostic review");
  assert.equal(diagnostic.selected, true);
  assert.equal(diagnostic.selectedBlockedDiagnostic, true);

  assert.equal(liveControlField.source, "selectorSurface.workflowSections");
  assert.equal(liveControlField.value, "");
  assert.equal(liveControlField.valueLabel, "Not selected");
  assert.equal(liveControlField.selectedOptionBlocked, true);
  assert.equal(liveControlField.options.some((item) => item.value === "60|Comfort" || /Comfort/.test(item.label)), false);
  assert.ok(liveControlField.incompatibleOptions.some((item) => item.value === "60|Comfort" && item.selectedBlockedDiagnostic === true));
  assert.ok(renderedDirectSelects.length >= 1, "expected direct optic select in actual rendered main/control path");
  for (const select of renderedDirectSelects) {
    assert.equal(select.value, "");
    assert.equal(renderedSelectOptionLabels(select).some((label) => /Comfort/.test(label)), false);
  }

  const directTile = surface.donorShapeSelectedTiles.find((item) => item.tileKey === "directOpticVar1");
  assert.equal(directTile.value, "");
  assert.equal(directTile.valueLabel, "Not selected");
  assert.equal(surface.payloadPreview.optics.direct.opticVar1, null);
  assert.equal(productSpineRow(surface, "system", "opticDirect").displayValue, "—");
  assert.equal(truthItemsForField(surface.selectionTruthSummary, "directOpticVar1", "manual-constraint").length, 0);
  const railText = compactBlockedRailText(surface.selectionTruthSummary);
  assert.doesNotMatch(railText, /Comfort/);
  assert.match(detailedBlockedValueText(surface.selectionTruthSummary), /Comfort/);
});

test("donor-backed Var1 parents remain selectable and Var2 choices hang from the selected parent", () => {
  const snapshot = identityCascadeSnapshot();
  snapshot.OPTICS = [
    ...snapshot.OPTICS,
    { system: "80", optic_var_1: "Daisy", optic_var_2: "Micro;Wide", emission_permission: "Direct", approved: "yes" },
  ];
  const baseConstraints = { system: "DNX 80 DI" };
  const base = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints: baseConstraints,
  });

  assert.deepEqual(compatibleLabels(workflowField(base, "directOpticVar1")), ["Daisy · 80", "Inlay · 80"].sort());
  assert.equal(workflowField(base, "directOpticVar2").options.length, 0);
  const baseModel = selectorViewModelFor(base, baseConstraints);
  assert.deepEqual(controlOptionLabels(visibleControlField(baseModel, "directOpticVar1")), ["Daisy · 80", "Inlay · 80"].sort());
  assert.equal(optionalVisibleControlField(baseModel, "directOpticVar2"), null);

  const daisyConstraints = { ...baseConstraints, directOpticVar1: "80|Daisy" };
  const daisy = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints: daisyConstraints,
  });
  assert.deepEqual(compatibleLabels(workflowField(daisy, "directOpticVar2")), ["Micro", "Wide"].sort());
  assert.equal(viewModelField(daisy, "directOpticVar2", daisyConstraints).displayMode, "choice");
  assert.deepEqual(controlOptionLabels(visibleControlField(selectorViewModelFor(daisy, daisyConstraints), "directOpticVar2")), ["Micro", "Wide"].sort());

  const inlayConstraints = { ...baseConstraints, directOpticVar1: "80|Inlay" };
  const inlay = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints: inlayConstraints,
  });
  assert.deepEqual(compatibleLabels(workflowField(inlay, "directOpticVar2")), ["Var1", "Var2"].sort());
  assert.deepEqual(controlOptionLabels(visibleControlField(selectorViewModelFor(inlay, inlayConstraints), "directOpticVar2")), ["Var1", "Var2"].sort());
});

test("IP and IK candidates are limited by the real source-backed System plus selected direct optic", () => {
  const snapshot = identityCascadeSnapshot();
  snapshot.OPTICS = [
    ...snapshot.OPTICS.filter((row) => row.system !== "80" || row.optic_var_1 !== "Inlay"),
    { system: "80", optic_var_1: "Inlay", optic_var_2: "Var1;Var2", emission_permission: "Direct", ip_option_1: "IP65", ik_option_2: "IK10", approved: "yes" },
    { system: "80", optic_var_1: "Daisy", optic_var_2: "Micro;Wide", emission_permission: "Direct", ip_option_1: "IP20", ik_option_2: "IK07", approved: "yes" },
  ];

  const daisyConstraints = { system: "DNX 80 DI", directOpticVar1: "80|Daisy" };
  const daisy = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints: daisyConstraints,
  });
  assert.deepEqual(compatibleLabels(workflowField(daisy, "ipRating")), ["IP20"]);
  assert.deepEqual(compatibleLabels(workflowField(daisy, "ikRating")), ["IK07"]);
  const daisyModel = selectorViewModelFor(daisy, daisyConstraints);
  assert.deepEqual(controlOptionLabels(visibleControlField(daisyModel, "ipRating")), ["IP20"]);
  assert.deepEqual(controlOptionLabels(visibleControlField(daisyModel, "ikRating")), ["IK07"]);

  const inlayConstraints = { system: "DNX 80 DI", directOpticVar1: "80|Inlay" };
  const inlay = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints: inlayConstraints,
  });
  assert.deepEqual(compatibleLabels(workflowField(inlay, "ipRating")), ["IP65"]);
  assert.deepEqual(compatibleLabels(workflowField(inlay, "ikRating")), ["IK10"]);
  const inlayModel = selectorViewModelFor(inlay, inlayConstraints);
  assert.deepEqual(controlOptionLabels(visibleControlField(inlayModel, "ipRating")), ["IP65"]);
  assert.deepEqual(controlOptionLabels(visibleControlField(inlayModel, "ikRating")), ["IK10"]);
});

test("Electrical Class exposes all source-backed values and is not poisoned by stale IP or IK", () => {
  const snapshot = {
    SYSTEM: [
      { system: "80", system_variant_1: "DI", label: "DNX 80 DI", emission: "Both", approved: "yes" },
    ],
    OPTICS: [
      { system: "80", optic_var_1: "Inlay", optic_var_2: "Var1", emission_permission: "Direct", ip_option_1: "IP65", ik_option_2: "IK10", approved: "yes" },
      { system: "80", optic_var_1: "Rope", optic_var_2: "Rope", emission_permission: "Indirect", ip_option_1: "IP65", ik_option_2: "IK10", approved: "yes" },
    ],
    TIERS: [
      { tier: "Business", electrical: "Class I;Class II", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "elect_class", accessory_id: "SELV Isolated", approved: "yes" },
    ],
    SYSTEM_POLICY: [
      { category: "electrical class", item: "SELV Remote;Non SELV with Earth", approved: "yes" },
    ],
  };
  const constraints = {
    system: "DNX 80 DI",
    directOpticVar1: "80|Inlay",
    ipRating: "IP20",
    ikRating: "IK07",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
    source: sourceReady(),
    constraints,
  });

  assert.equal(option(result, "ipRating", "IP20").status, "blocked");
  assert.equal(option(result, "ikRating", "IK07").status, "blocked");
  const labels = compatibleLabels(workflowField(result, "electricalClass"));
  assert.deepEqual(labels, ["Class I", "Class II", "Non SELV with Earth", "SELV Isolated", "SELV Remote"].sort());
  assert.equal(labels.includes("SELV with Earth"), false, "do not invent donor fallback electrical classes not present in source");
  assert.deepEqual(
    controlOptionLabels(visibleControlField(selectorViewModelFor(result, constraints), "electricalClass")),
    ["Class I", "Class II", "Non SELV with Earth", "SELV Isolated", "SELV Remote"].sort(),
  );
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
