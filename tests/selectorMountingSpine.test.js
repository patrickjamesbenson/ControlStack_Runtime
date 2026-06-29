import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const testSourceUrl = new URL("./selectorMountingSpine.test.js", import.meta.url);

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

function selectorReferenceStatus(snapshot = mountingSnapshot()) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady() }),
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = mountingSnapshot() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot),
  });
}

function selectAndReload(selectorState, fieldKey, value, snapshot = mountingSnapshot()) {
  let model = createModel({ selectorState, snapshot });
  model.selectorSurface.setFieldValue(fieldKey, value);
  return createModel({ selectorState, snapshot });
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

test("power penetration, power location, and flex length fill from ACCESSORIES options", () => {
  const selectorState = createSelectorState();
  let model = createModel({ selectorState });

  assert.ok(optionValues(model, "powerPenetration").includes("Top"));
  assert.ok(optionValues(model, "powerLocation").includes("Start"));
  assert.ok(optionValues(model, "powerLocation").includes("TBD"));
  assert.ok(optionValues(model, "flexLength").includes("1500mm"));

  model = selectAndReload(selectorState, "powerPenetration", "Top");
  model = selectAndReload(selectorState, "powerLocation", "Start");
  model = selectAndReload(selectorState, "flexLength", "1500mm");

  assert.equal(mountingRow(model.selectorSurface.productSpine, "powerPenetration").displayValue, "Top");
  assert.equal(mountingRow(model.selectorSurface.productSpine, "powerLocation").displayValue, "Start");
  assert.equal(mountingRow(model.selectorSurface.productSpine, "flexLength").displayValue, "1500mm");
  assert.equal(model.selectorSurface.payloadPreview.mounting.powerPenetration, "Top");
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
  assert.equal(styleRow.displayValue, "Surface Mount");
  assert.equal(styleRow.status, "blocked");
  assert.equal(styleRow.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.mountStyle.value, "Surface Mount");

  model = selectAndReload(selectorState, "mountStyle", "Suspended");
  model = selectAndReload(selectorState, "mountSelection", "Bracket");

  const selectionRow = mountingRow(model.selectorSurface.productSpine, "mountSelection");
  assert.equal(selectionRow.displayValue, "Bracket");
  assert.equal(selectionRow.status, "blocked");
  assert.equal(selectionRow.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.mountSelection.value, "Bracket");
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountSelection, "Bracket");
});

test("Mounting payload preview keeps safety flags disabled and exposes no raw source data", async () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "mountStyle", "Suspended");
  model = selectAndReload(selectorState, "mountSelection", "Wire");
  model = selectAndReload(selectorState, "mountParticulars", "1500mm drop");
  model = selectAndReload(selectorState, "powerPenetration", "Top");
  model = selectAndReload(selectorState, "powerLocation", "Start");
  model = selectAndReload(selectorState, "flexLength", "1500mm");

  const payload = model.selectorSurface.payloadPreview;
  assert.equal(payload.previewOnly, true);
  assert.equal(payload.productionPayload, false);
  assert.equal(payload.mounting.mountStyle, "Suspended");
  assert.equal(payload.mounting.mountSelection, "Wire");
  assert.equal(payload.mounting.mountParticulars, "1500mm drop");
  assert.equal(payload.mounting.powerPenetration, "Top");
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
