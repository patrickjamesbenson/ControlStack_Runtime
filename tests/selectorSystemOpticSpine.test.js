import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const testSourceUrl = new URL("./selectorSystemOpticSpine.test.js", import.meta.url);

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
        authority: { owner: "shell", status: "fallback", source: "shell-safe-fallback" },
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

function systemOpticReferenceSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "Direct", approved: "yes" },
      { system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct, Indirect", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "60",
        optic_var_1: "Opal",
        optic_var_2: "",
        spec_code: "OPL",
        emission_permission: "Direct",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Inlay",
        optic_var_2: "Microprism, Antiglare",
        spec_code: "INL",
        spec_code_var2: "MPR, AGL",
        emission_permission: "Direct",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Rope",
        optic_var_2: "",
        spec_code: "RPE",
        emission_permission: "Indirect",
        diffuser_material: "PMMA",
        approved: "yes",
      },
    ],
  };
}

function bothEmissionIndirectVar2ReferenceSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "80", label: "DNX 80 D/I", emission: "Both", approved: "yes" },
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "Direct", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "80",
        optic_var_1: "Inlay",
        optic_var_2: "Microprism, Antiglare",
        spec_code: "INL",
        spec_code_var2: "MPR, AGL",
        emission_permission: "Direct",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Rope",
        optic_var_2: "Soft, Asymmetric",
        spec_code: "RPE",
        spec_code_var2: "SFT, ASY",
        emission_permission: "Indirect",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Opal",
        optic_var_2: "",
        spec_code: "OPL",
        emission_permission: "Direct",
        diffuser_material: "PMMA",
        approved: "yes",
      },
    ],
  };
}

function multiIndirectChoiceReferenceSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60 Beam", label: "DNX 60 Beam DI", emission: "Both", approved: "yes" },
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "Direct", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "60 Beam",
        optic_var_1: "Inlay",
        optic_var_2: "Microprism, Antiglare",
        spec_code: "INL",
        spec_code_var2: "MPR, AGL",
        emission_permission: "Direct",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "60 Beam",
        optic_var_1: "Batwing",
        optic_var_2: "Wide, Narrow",
        spec_code: "BWG",
        spec_code_var2: "WDE, NRW",
        emission_permission: "Indirect",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "60 Beam",
        optic_var_1: "Glow",
        optic_var_2: "Soft",
        spec_code: "GLW",
        spec_code_var2: "SFT",
        emission_permission: "Indirect",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Opal",
        optic_var_2: "",
        spec_code: "OPL",
        emission_permission: "Direct",
        diffuser_material: "PMMA",
        approved: "yes",
      },
    ],
  };
}

function beamDirectionalIsolationReferenceSnapshot() {
  return {
    SYSTEM: [
      { system: "60", system_variant_1: "Beam", label: "DNX 60 Beam DI", emission: "Both", approved: "yes" },
      { system: "60", system_variant_1: "Square", label: "DNX 60", emission: "Direct", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "60",
        optic_var_1: "Comfort",
        optic_var_2: "Medium",
        spec_code: "CFT",
        spec_code_var2: "MED",
        emission_permission: "Direct",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Batwing",
        optic_var_2: "Wide, Narrow",
        spec_code: "BWG",
        spec_code_var2: "WDE, NRW",
        emission_permission: "Indirect",
        diffuser_material: "PMMA",
        approved: "yes",
      },
      {
        system: "60",
        optic_var_1: "Glow",
        optic_var_2: "Soft",
        spec_code: "GLW",
        spec_code_var2: "SFT",
        emission_permission: "Indirect",
        diffuser_material: "PMMA",
        approved: "yes",
      },
    ],
  };
}

function currentDbConstraints(selectorState = createSelectorState()) {
  const constraints = selectorState.getSnapshot?.().dbBackedSelector?.manualConstraints || {};
  return Object.fromEntries(Object.entries(constraints).map(([fieldKey, record]) => [fieldKey, String(record?.value || "").trim()]).filter(([, value]) => value));
}

function selectorReferenceStatus(snapshot = systemOpticReferenceSnapshot(), constraints = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints }),
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = systemOpticReferenceSnapshot() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot, currentDbConstraints(selectorState)),
  });
}

function selectAndReload(selectorState, fieldKey, value, snapshot = systemOpticReferenceSnapshot()) {
  let model = createModel({ selectorState, snapshot });
  model.selectorSurface.setFieldValue(fieldKey, value);
  return createModel({ selectorState, snapshot });
}

function spineSection(spine, sectionKey) {
  const section = spine.sections.find((item) => item.sectionKey === sectionKey);
  assert.ok(section, `expected spine section ${sectionKey}`);
  return section;
}

function spineRow(spine, rowKey) {
  const row = spineSection(spine, "system").rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected system spine row ${rowKey}`);
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

test("empty system and direct optic spine rows render as em dash", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.equal(spineRow(spine, "profileSystem").displayValue, "—");
  assert.equal(spineRow(spine, "opticDirect").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.system.system, null);
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar1, null);
});

test("selecting a system fills the profile row and payload system field", () => {
  const selectorState = createSelectorState();
  const model = selectAndReload(selectorState, "system", "DNX|80");

  assert.equal(spineRow(model.selectorSurface.productSpine, "profileSystem").displayValue, "DNX 80");
  assert.equal(spineRow(model.selectorSurface.productSpine, "profileSystem").status, "manual-constraint");
  assert.equal(model.selectorSurface.payloadPreview.system.system, "DNX 80");
  assert.equal(model.selectorSurface.payloadPreview.system.profile, "DNX 80");
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.system.value, "DNX|80");
});

test("direct optic var 1 fills from reference options after manual selection", () => {
  const selectorState = createSelectorState();
  selectAndReload(selectorState, "system", "DNX|80");
  const model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  const directRow = spineRow(model.selectorSurface.productSpine, "opticDirect");

  assert.match(directRow.displayValue, /Inlay/);
  assert.equal(directRow.status, "manual-constraint");
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar1, "Inlay · 80");
});

test("direct optic var 2 is hydrated only after its parent var 1 is selected", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");

  assert.deepEqual(optionValues(model, "directOpticVar2"), []);
  assert.doesNotMatch(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Antiglare|Microprism/);

  model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  assert.ok(optionValues(model, "directOpticVar2").includes("80|Inlay|Antiglare"));
  assert.doesNotMatch(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Antiglare/);

  model = selectAndReload(selectorState, "directOpticVar2", "80|Inlay|Antiglare");
  assert.match(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Inlay/);
  assert.match(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Antiglare/);
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar2, "Antiglare");
});

test("indirect optic var 1 passes through without inventing an optic var 2", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");

  assert.ok(optionValues(model, "indirectOpticVar1").includes("80|Rope"));
  assert.deepEqual(optionValues(model, "indirectOpticVar2"), []);

  model = selectAndReload(selectorState, "indirectOpticVar1", "80|Rope");
  assert.match(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, /Rope/);
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, "Rope · 80");
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar2, null);
});

test("Both emission promotes the single indirect optic var 1 consequence into the indirect var 2 parent", () => {
  const selectorState = createSelectorState();
  const snapshot = bothEmissionIndirectVar2ReferenceSnapshot();
  let model = selectAndReload(selectorState, "system", "DNX|80", snapshot);
  model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay", snapshot);
  model = selectAndReload(selectorState, "directOpticVar2", "80|Inlay|Antiglare", snapshot);

  const indirectVar1 = workflowField(model, "indirectOpticVar1");
  assert.equal(indirectVar1.effectiveValue, "80|Rope");
  assert.equal(indirectVar1.effectiveLabel, "Rope · 80");
  assert.equal(indirectVar1.displayMode, "auto-chip");
  assert.match(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, /Rope/);
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, "Rope · 80");

  const indirectVar2 = workflowField(model, "indirectOpticVar2");
  assert.ok(optionValues(model, "indirectOpticVar2").includes("80|Rope|Asymmetric"));
  assert.doesNotMatch(indirectVar2.unavailableReason || "", /Select indirectOpticVar1/);

  const indirectTile = model.selectorSurface.donorShapeSelectedTiles.find((tile) => tile.tileKey === "indirectOpticVar1");
  assert.equal(indirectTile.valueLabel, "Rope · 80");
  assert.notEqual(indirectTile.valueLabel, "Not selected");
  const indirectVar2Tile = model.selectorSurface.donorShapeSelectedTiles.find((tile) => tile.tileKey === "indirectOpticVar2");
  assert.doesNotMatch(indirectVar2Tile.reason || "", /Select indirectOpticVar1/);
});

test("DNX 60 Beam D/I isolates direct var 2 from multi-option indirect var 1 choices", () => {
  const selectorState = createSelectorState();
  const snapshot = beamDirectionalIsolationReferenceSnapshot();
  let model = selectAndReload(selectorState, "system", "60|Beam", snapshot);

  assert.equal(workflowField(model, "emission").effectiveLabel, "Both");
  assert.equal(workflowField(model, "directCapability").effectiveLabel, "Direct supported");
  assert.equal(workflowField(model, "indirectCapability").effectiveLabel, "Indirect supported");

  model = selectAndReload(selectorState, "directOpticVar1", "60|Comfort", snapshot);
  const directVar2 = workflowField(model, "directOpticVar2");
  assert.equal(directVar2.displayMode, "choice");
  assert.equal(directVar2.primaryControl, true);
  assert.equal(directVar2.compatibleDropdownOptionCount, 1);
  assert.deepEqual(optionValues(model, "directOpticVar2"), ["60|Comfort|Medium"]);

  const indirectVar1 = workflowField(model, "indirectOpticVar1");
  assert.equal(indirectVar1.displayMode, "choice");
  assert.equal(indirectVar1.primaryControl, true);
  assert.equal(indirectVar1.effectiveValue, "");
  assert.equal(indirectVar1.compatibleDropdownOptionCount, 2);
  assert.deepEqual(optionValues(model, "indirectOpticVar1").sort(), ["60|Batwing", "60|Glow"].sort());

  assert.match(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Comfort/);
  assert.doesNotMatch(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Batwing|Glow/);
  assert.equal(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar1, "Comfort · 60");
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar2, null);
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, null);

  const indirectTile = model.selectorSurface.donorShapeSelectedTiles.find((tile) => tile.tileKey === "indirectOpticVar1");
  assert.equal(indirectTile.valueLabel, "Not selected");
  assert.notEqual(indirectTile.valueLabel, "Batwing · 60");
});

test("DNX 60 Beam D/I selected indirect var 1 derives indirect var 2 without overwriting direct cascade", () => {
  const selectorState = createSelectorState();
  const snapshot = beamDirectionalIsolationReferenceSnapshot();
  let model = selectAndReload(selectorState, "system", "60|Beam", snapshot);
  model = selectAndReload(selectorState, "directOpticVar1", "60|Comfort", snapshot);
  model = selectAndReload(selectorState, "directOpticVar2", "60|Comfort|Medium", snapshot);
  model = selectAndReload(selectorState, "indirectOpticVar1", "60|Glow", snapshot);

  assert.deepEqual(optionValues(model, "directOpticVar2"), ["60|Comfort|Medium"]);
  assert.ok(!optionValues(model, "directOpticVar2").includes("60|Glow|Soft"));
  assert.ok(optionValues(model, "indirectOpticVar2").includes("60|Glow|Soft"));
  assert.ok(!optionValues(model, "indirectOpticVar2").includes("60|Batwing|Wide"));

  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar1, "Comfort · 60");
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar2, "Medium");
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, "Glow · 60");
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar2, null);
  assert.match(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Comfort/);
  assert.match(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Medium/);
  assert.doesNotMatch(spineRow(model.selectorSurface.productSpine, "opticDirect").displayValue, /Glow|Batwing/);
  assert.match(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, /Glow/);

  model = selectAndReload(selectorState, "indirectOpticVar2", "60|Glow|Soft", snapshot);
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar2, "Soft");
  assert.match(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, /Soft/);
});

test("60 Beam D/I with multiple indirect var 1 options renders indirect var 1 as selectable", () => {
  const selectorState = createSelectorState();
  const snapshot = multiIndirectChoiceReferenceSnapshot();
  let model = selectAndReload(selectorState, "system", "DNX|60 Beam", snapshot);

  let indirectVar1 = workflowField(model, "indirectOpticVar1");
  assert.equal(indirectVar1.displayMode, "choice");
  assert.equal(indirectVar1.primaryControl, true);
  assert.equal(indirectVar1.effectiveValue, "");
  assert.equal(indirectVar1.compatibleDropdownOptionCount, 2);
  assert.deepEqual(optionValues(model, "indirectOpticVar1").sort(), ["60 Beam|Batwing", "60 Beam|Glow"].sort());
  assert.equal(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, null);

  model = selectAndReload(selectorState, "directOpticVar1", "60 Beam|Inlay", snapshot);
  model = selectAndReload(selectorState, "directOpticVar2", "60 Beam|Inlay|Microprism", snapshot);
  indirectVar1 = workflowField(model, "indirectOpticVar1");
  assert.equal(indirectVar1.displayMode, "choice");
  assert.equal(indirectVar1.primaryControl, true);
  assert.equal(indirectVar1.effectiveValue, "");
  assert.equal(indirectVar1.compatibleDropdownOptionCount, 2);
  assert.deepEqual(optionValues(model, "indirectOpticVar1").sort(), ["60 Beam|Batwing", "60 Beam|Glow"].sort());
  assert.equal(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, null);
});

test("60 Beam D/I selected indirect var 1 derives indirect var 2 children", () => {
  const selectorState = createSelectorState();
  const snapshot = multiIndirectChoiceReferenceSnapshot();
  selectAndReload(selectorState, "system", "DNX|60 Beam", snapshot);
  selectAndReload(selectorState, "directOpticVar1", "60 Beam|Inlay", snapshot);
  let model = selectAndReload(selectorState, "indirectOpticVar1", "60 Beam|Batwing", snapshot);

  const indirectVar1 = workflowField(model, "indirectOpticVar1");
  assert.equal(indirectVar1.displayMode, "choice");
  assert.equal(indirectVar1.selectedValue, "60 Beam|Batwing");
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, "Batwing · 60 Beam");
  assert.match(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, /Batwing/);
  assert.ok(optionValues(model, "indirectOpticVar2").includes("60 Beam|Batwing|Wide"));
  assert.ok(optionValues(model, "indirectOpticVar2").includes("60 Beam|Batwing|Narrow"));
  assert.ok(!optionValues(model, "indirectOpticVar2").includes("60 Beam|Glow|Soft"));

  model = selectAndReload(selectorState, "indirectOpticVar2", "60 Beam|Batwing|Wide", snapshot);
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar2, "Wide");
  assert.match(spineRow(model.selectorSurface.productSpine, "opticIndirect").displayValue, /Wide/);
});

test("direct-only system path suppresses the indirect optic row", () => {
  const selectorState = createSelectorState();
  const model = selectAndReload(selectorState, "system", "DNX|60");

  assert.equal(spineSection(model.selectorSurface.productSpine, "system").rows.some((row) => row.rowKey === "opticIndirect"), false);
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar1, null);
  assert.equal(model.selectorSurface.payloadPreview.optics.indirect.opticVar2, null);
});

test("incompatible direct optic selections are preserved and blocked", () => {
  const selectorState = createSelectorState();
  selectAndReload(selectorState, "system", "DNX|60");
  const model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  const row = spineRow(model.selectorSurface.productSpine, "opticDirect");

  assert.equal(row.displayValue, "—");
  assert.equal(row.status, "blocked");
  assert.equal(row.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.directOpticVar1.value, "80|Inlay");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "directOpticVar1"));
  assert.equal(model.selectorSurface.payloadPreview.optics.direct.opticVar1, null);
});

test("payload preview mirrors system, direct, and indirect optic state with safety flags disabled", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  model = selectAndReload(selectorState, "directOpticVar2", "80|Inlay|Microprism");
  model = selectAndReload(selectorState, "indirectOpticVar1", "80|Rope");

  const payload = model.selectorSurface.payloadPreview;
  assert.equal(payload.system.system, "DNX 80");
  assert.equal(payload.optics.direct.opticVar1, "Inlay · 80");
  assert.equal(payload.optics.direct.opticVar2, "Microprism");
  assert.equal(payload.optics.indirect.opticVar1, "Rope · 80");
  assert.equal(payload.optics.indirect.opticVar2, null);
  assert.equal(payload.safetyFlags.readOnly, true);
  assert.equal(payload.safetyFlags.writes, false);
  assert.equal(payload.safetyFlags.generation, false);
  assert.equal(payload.safetyFlags.labProofAuthority, false);
  assert.equal(payload.safetyFlags.rawRowsExposed, false);
});

test("the system optic spine test introduces no named user or authority fixture", async () => {
  const source = await readFile(testSourceUrl, "utf-8");
  const forbiddenName = String.fromCharCode(65, 108, 108, 97, 110, 32, 79, 114, 103, 97, 110);
  const atSignLiteral = String.fromCharCode(64);
  const usersTableLiteral = ["US", "ERS:"].join("");

  assert.equal(source.includes(forbiddenName), false);
  assert.equal(source.includes(atSignLiteral), false);
  assert.equal(source.includes(usersTableLiteral), false);
});
