import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const viewModelSourceUrl = new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url);
const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const stylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function cascadeSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "direct", mount_style: "Surface", system_and_variant_finish: "White", flex_colour: "White Flex", approved: "yes" },
      { system: "LNX", system_variant_1: "80 DI", label: "LNX 80 D/I", emission: "direct/indirect", mount_style: "Suspended", system_and_variant_finish: "Black", flex_colour: "Black Flex", approved: "yes" },
    ],
    OPTICS: [
      { system: "DNX", optic_var_1: "Opal", optic_var_2: "Soft;Sharp", emission_permission: "direct", ip_option_1: "IP20;IP44", ik_option_2: "IK07", cct: "3000K", approved: "yes" },
      { system: "LNX", optic_var_1: "Blade", optic_var_2: "Wallwash", emission_permission: "direct/indirect", ip_option_1: "IP65;IP66", ik_option_2: "IK10", cct: "4000K", approved: "yes" },
    ],
    BOARDS: [
      { system: "DNX", optic_var_1: "Opal", c1_cct: "3000", c1_cri_min: "80", board_lm_per_m: "1200", control_type_labels: "DALI-2;Non-dim", approved: "yes" },
      { system: "LNX", optic_var_1: "Blade", c1_cct: "4000", c1_cri_min: "90", board_lm_per_m: "2200", control_type_labels: "DALI-2 DT8", approved: "yes" },
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
    ],
    SYSTEM_POLICY: [
      { category: "ambient temp", item: "25;35", approved: "yes" },
      { category: "wiring", item: "5-core DALI;3-core switched", approved: "yes" },
      { category: "finish colour", item: "White;Black", approved: "yes" },
    ],
    USERS: [{ email_login: "private@example.com", token: "must not leak token", approved: "yes" }],
    PURE_REF_STATE: [{ raw_lab_evidence: "must not leak lab evidence" }],
  };
}

function constraintsToLocal(constraints = {}) {
  return {
    dbBackedSelector: {
      manualConstraints: Object.fromEntries(Object.entries(constraints).map(([fieldKey, value]) => [
        fieldKey,
        { value, valueLabel: String(value), label: fieldKey },
      ])),
    },
  };
}

function selectorState(constraints = {}) {
  return {
    getSnapshot: () => constraintsToLocal(constraints),
    setDbBackedSelectorFieldValue() {},
    clearDbBackedSelectorFieldValue() {},
  };
}

function adapter() {
  return {
    moduleId: "cs_selector",
    services: { downstream: {} },
    isFlagEnabled: () => false,
    readSnapshots: () => ({
      flags: { values: {} },
      diagnostics: {},
      route: {},
      project: { metadata: {}, currentProject: {} },
      handoff: {},
      identity: { currentUser: {} },
      authority: {},
      company: {},
      crm: {},
      visibility: { moduleReasons: { cs_selector: { visible: true, reason: "test" } }, inputs: {}, visibleModules: ["cs_selector"], hiddenModules: [] },
      timelinePolicy: {},
    }),
  };
}

function surfaceFor(constraints = {}, selectorOptions = deriveSelectorReferenceOptionsFromSnapshot(cascadeSnapshot(), { source: sourceReady(), constraints })) {
  return createSelectorViewModel({
    adapter: adapter(),
    selectorState: selectorState(constraints),
    selectorReferenceStatus: selectorOptions,
  }).selectorSurface;
}

function workflowField(surface, fieldKey) {
  for (const section of surface.workflowSections || []) {
    const field = (section.fields || []).find((item) => item.fieldKey === fieldKey);
    if (field) return field;
  }
  assert.fail(`expected workflow field ${fieldKey}`);
}

test("Selector adds runtime presentation classification without claiming DB truth", async () => {
  const source = await readFile(viewModelSourceUrl, "utf-8");
  const surface = surfaceFor();

  assert.match(source, /RUNTIME_PRESENTATION_CLASSIFICATION_NAME/);
  assert.match(source, /not Board Data truth/);
  assert.match(surface.presentationClassification.name, /runtime presentation classification/);
  assert.match(surface.presentationClassification.sourceTruth, /DB\/reference-backed option payload remains source/);
  assert.equal(surface.presentationClassification.writes, false);
  assert.equal(surface.presentationClassification.rawRowsExposed, false);
});

test("one compatible options become chips and fields without computable counts do not fake auto-resolution", () => {
  const driverSurface = surfaceFor({ controlType: "DALI-2" });
  const driver = workflowField(driverSurface, "driver");

  assert.equal(driver.compatibleOptionCount, 1);
  assert.equal(driver.displayMode, "auto-chip");
  assert.equal(driver.primaryDecision, false);
  assert.equal(driver.rawRowsExposed, false);
  assert.equal(driver.writes, false);

  const unavailable = surfaceFor({}, {
    ok: true,
    sourceReady: true,
    workflowSections: [{ sectionKey: "test", title: "Test", fields: [{ fieldKey: "driver", label: "Driver", role: "auto-consequence" }] }],
    fields: [],
  });
  const unresolvedDriver = workflowField(unavailable, "driver");
  assert.equal(unresolvedDriver.compatibleOptionCount, null);
  assert.notEqual(unresolvedDriver.displayMode, "auto-chip");
  assert.equal(unresolvedDriver.effectiveValue, "");
  assert.equal(unresolvedDriver.classificationReason.includes("no auto-resolution"), true);

  const zeroCompatible = surfaceFor({}, {
    ok: true,
    sourceReady: true,
    workflowSections: [{
      sectionKey: "test",
      title: "Test",
      fields: [{
        fieldKey: "driver",
        label: "Driver",
        role: "auto-consequence",
        options: [{ value: "blocked-driver", label: "Blocked Driver", status: "blocked", blocked: true }],
      }],
    }],
    fields: [],
  });
  const zeroCompatibleDriver = workflowField(zeroCompatible, "driver");
  assert.equal(zeroCompatibleDriver.compatibleOptionCount, 0);
  assert.equal(zeroCompatibleDriver.displayMode, "hidden-diagnostic");
  assert.equal(zeroCompatibleDriver.effectiveValue, "");
  assert.match(zeroCompatibleDriver.classificationReason, /no compatible DB-backed option/);
});

test("diffuser var 2 is a chip for one compatible option and a choice for multiple compatible options", () => {
  const oneVar2 = workflowField(surfaceFor({ system: "LNX|80 DI", diffuserVar1: "LNX|Blade" }), "diffuserVar2");
  assert.equal(oneVar2.compatibleOptionCount, 1);
  assert.equal(oneVar2.displayMode, "auto-chip");
  assert.equal(oneVar2.primaryDecision, false);

  const multipleVar2 = workflowField(surfaceFor({ system: "DNX|60", diffuserVar1: "DNX|Opal" }), "diffuserVar2");
  assert.equal(multipleVar2.compatibleOptionCount, 2);
  assert.equal(multipleVar2.displayMode, "choice");
  assert.equal(multipleVar2.primaryDecision, true);
});

test("variant, direct/indirect capability, driver, and inherited finishes are not primary dropdowns", () => {
  const surface = surfaceFor({ system: "DNX|60", bodyFinish: "White", controlType: "DALI-2" });

  for (const key of ["variantKey", "directCapability", "indirectCapability", "driver"]) {
    const field = workflowField(surface, key);
    assert.notEqual(field.displayMode, "choice", `${key} should not be a primary choice`);
    assert.equal(field.primaryDecision, false);
  }

  for (const key of ["finishCover", "finishEnd", "finishFlex"]) {
    const field = workflowField(surface, key);
    assert.equal(field.displayMode, "inherited-chip", `${key} should render as inherited chip`);
    assert.equal(field.provenance, "inherited");
  }
});

test("metadata and diagnostic fields are downgraded while incompatible manual selections remain visible", () => {
  const surface = surfaceFor({ system: "DNX|60", diffuserVar1: "DNX|Opal", diffuserVar2: "LNX|Blade|Wallwash" });

  assert.equal(workflowField(surface, "diffuserMaterial").displayMode, "metadata-chip");
  assert.equal(workflowField(surface, "diffuserSpecCodePreview").displayMode, "metadata-chip");
  assert.equal(workflowField(surface, "diffuserImageReadiness").displayMode, "metadata-chip");
  assert.equal(workflowField(surface, "optic").displayMode, "hidden-diagnostic");
  assert.equal(workflowField(surface, "directOpticVar1").displayMode, "hidden-diagnostic");
  assert.equal(workflowField(surface, "specialPartsEntitlement").displayMode, "hidden-diagnostic");

  const blocked = workflowField(surface, "diffuserVar2");
  assert.equal(blocked.displayMode, "warning-chip");
  assert.equal(blocked.selectedOptionBlocked, true);
  assert.equal(blocked.provenance, "manual");
});

test("donor-shape selected tiles render from safe view model data", () => {
  const surface = surfaceFor({ system: "DNX|60", diffuserVar1: "DNX|Opal", diffuserVar2: "DNX|Opal|Soft" });
  const tiles = surface.donorShapeSelectedTiles;

  assert.equal(Array.isArray(tiles), true);
  assert.equal(tiles.length, 5);
  assert.deepEqual(tiles.map((tile) => tile.tileKey), [
    "system",
    "directOpticVar1",
    "directOpticVar2",
    "indirectOpticVar1",
    "indirectOpticVar2",
  ]);
  assert.match(tiles.find((tile) => tile.tileKey === "system").valueLabel, /DNX 60|DNX\|60/);
  assert.match(tiles.find((tile) => tile.tileKey === "directOpticVar1").valueLabel, /Opal/);
  assert.match(tiles.find((tile) => tile.tileKey === "directOpticVar2").valueLabel, /Soft/);
  for (const tile of tiles) {
    assert.equal(tile.safeLabelOnly, true);
    assert.equal(tile.imageRendered, false);
    assert.equal(tile.writes, false);
    assert.equal(tile.rawRowsExposed, false);
  }
});

test("donor-shape dropdown split keeps selected blocked values visible and separates unselected incompatible options", () => {
  const systemConstrainedSurface = surfaceFor({ system: "DNX|60" });
  const directVar1 = workflowField(systemConstrainedSurface, "directOpticVar1");

  assert.equal(directVar1.dropdownOptions.some((option) => option.blocked === true || option.status === "blocked"), false);
  assert.equal(directVar1.incompatibleOptions.some((option) => /Blade/.test(option.label)), true);
  assert.equal(directVar1.incompatibleOptions.every((option) => option.rawRowsExposed === false), true);

  const blockedSelectedSurface = surfaceFor({ system: "DNX|60", diffuserVar1: "DNX|Opal", diffuserVar2: "LNX|Blade|Wallwash" });
  const blockedSelected = workflowField(blockedSelectedSurface, "diffuserVar2");

  assert.equal(blockedSelected.selectedOptionBlocked, true);
  assert.equal(blockedSelected.selectedBlockedOptionVisible, true);
  assert.equal(blockedSelected.dropdownOptions.some((option) => option.selected === true && (option.blocked === true || option.status === "blocked")), true);
  assert.equal(blockedSelected.incompatibleOptions.some((option) => option.selected === true), false);
});

test("view adds donor shape strip, incompatible details, and light-control row grid without enabling outputs", async () => {
  const view = await readFile(viewSourceUrl, "utf-8");
  const styles = await readFile(stylesUrl, "utf-8");

  assert.match(view, /appendDonorShapeSelectedTileStrip/);
  assert.match(view, /fieldDropdownOptions/);
  assert.match(view, /appendIncompatibleOptionDetails/);
  assert.match(view, /appendLightControlRowGrid/);
  assert.match(view, /selectorDonorShapeStrip/);
  assert.match(styles, /cs-selector-donor-shape-strip/);
  assert.match(styles, /cs-selector-product__incompatible-options/);
  assert.match(styles, /cs-selector-product__light-control-grid/);
  assert.equal(view.includes("createElement(\"img\")"), false);
});

test("view renders chips/collapsed overrides and keeps generation/proof/write/image paths disabled", async () => {
  const view = await readFile(viewSourceUrl, "utf-8");
  const styles = await readFile(stylesUrl, "utf-8");
  const viewModel = await readFile(viewModelSourceUrl, "utf-8");

  assert.match(view, /\["choice", "warning-chip"\]\.includes\(field\.displayMode\)/);
  assert.match(view, /appendWorkflowChipStrip/);
  assert.match(view, /appendCollapsedOverrideDetails/);
  assert.match(view, /hiddenDiagnosticCount/);
  assert.match(styles, /cs-selector-product__workflow-chip-strip/);
  assert.match(styles, /cs-selector-product__collapsed-overrides/);
  assert.equal(view.includes("createElement(\"img\")"), false);
  assert.match(viewModel, /specGenerationEnabled: false/);
  assert.match(viewModel, /slugGenerationEnabled: false/);
  assert.match(viewModel, /iesGenerationEnabled: false/);
  assert.match(viewModel, /payloadGenerationEnabled: false/);
  assert.match(viewModel, /runTableGenerationEnabled: false/);
  assert.match(viewModel, /labProofAuthority: false/);
  assert.match(viewModel, /rawRowsExposed: false/);
});
