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
        mount_selections: "Surface bracket",
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
    ],
    CODE_POLICY: [
      {
        rule_id: "SURFACE_MOUNT_DI_BLOCK",
        area: "selector.mounting",
        approved: "yes",
        user_visible_ui: "Surface Mount is unavailable for direct-indirect/uplight systems because the ceiling blocks the indirect light component.",
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
  assert.equal(workflowOption(recessedModel, "mountStyle", "Surface Mount").status, "blocked");
  assert.equal(workflowOption(recessedModel, "mountStyle", "Surface Mount").blocked, true);

  const surfaceState = createSelectorState();
  const surfaceModel = selectAndReload(surfaceState, "system", "ALT|40");
  assert.deepEqual(compatibleOptionValues(surfaceModel, "mountStyle"), ["Surface Mount"]);
  assert.equal(workflowOption(surfaceModel, "mountStyle", "Recessed").status, "blocked");
  assert.equal(workflowOption(surfaceModel, "mountStyle", "Suspended").status, "blocked");
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

test("SURFACE_MOUNT_DI_BLOCK blocks Surface Mount for direct-indirect/uplight systems and keeps Suspended", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  const model = selectAndReload(selectorState, "system", "DNX80|DI", snapshot);

  const mountField = workflowField(model, "mountStyle");
  const surface = workflowOption(model, "mountStyle", "Surface Mount");
  assert.equal(surface.status, "blocked");
  assert.equal(surface.blocked, true);
  assert.match(surface.blockedReason, /Surface Mount.*direct-indirect|ceiling blocks.*indirect/i);
  assert.equal(surface.relationshipStatus, "blocked-by-code-policy");
  assert.deepEqual(surface.codePolicyIds, ["SURFACE_MOUNT_DI_BLOCK"]);
  assert.equal(surface.blockedBy.some((item) => item.fieldKey === "CODE_POLICY" && item.selectedValue === "SURFACE_MOUNT_DI_BLOCK"), true);
  assert.equal(mountField.dropdownOptions.some((option) => option.value === "Surface Mount"), false);
  assert.equal(mountField.incompatibleOptions.some((option) => option.value === "Surface Mount"), true);
  assert.equal(mountField.selectedBlockedOptionVisible, false);
  assert.equal(workflowOption(model, "mountStyle", "Suspended").status, "available");
});

test("selected incompatible Surface Mount is preserved as blocked by donor policy", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  let model = selectAndReload(selectorState, "system", "DNX80|DI", snapshot);
  model = selectAndReload(selectorState, "mountStyle", "Surface Mount", snapshot);

  const row = mountingRow(model.selectorSurface.productSpine, "mountStyle");
  const mountField = workflowField(model, "mountStyle");
  const selectedDropdown = mountField.dropdownOptions.find((option) => option.value === "Surface Mount");
  const diagnosticOption = mountField.incompatibleOptions.find((option) => option.value === "Surface Mount");
  assert.equal(row.displayValue, "—");
  assert.equal(row.status, "blocked");
  assert.equal(row.blocked, true);
  assert.match(diagnosticOption?.blockedReason || row.reason, /ceiling blocks.*indirect|direct-indirect|blocked/i);
  assert.equal(mountField.selectedBlockedOptionVisible, false);
  assert.equal(selectedDropdown, undefined);
  assert.ok(diagnosticOption, "blocked Surface Mount should remain only in developer/detail diagnostics");
  assert.equal(diagnosticOption.selected, true);
  assert.equal(diagnosticOption.selectedBlockedDiagnostic, true);
  assert.equal(diagnosticOption.blockedBy.some((item) => item.fieldKey === "CODE_POLICY"), true);
  assert.equal(model.selectorSurface.autoConsequences.some((item) => item.fieldKey === "mountStyle"), false);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.mountStyle.value, "Surface Mount");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "mountStyle"));
  assert.equal(model.selectorSurface.payloadPreview.mounting.mountStyle, null);

  const railText = compactBlockedRailText(model.selectorSurface.selectionTruthSummary);
  assert.match(railText, /review required/);
  assert.match(railText, /blocked/);
  assert.doesNotMatch(railText, /Surface Mount/);
  assert.match(detailedBlockedValueText(model.selectorSurface.selectionTruthSummary), /Surface Mount/);
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

test("indirect optic remains visible as accepted implicit consequence without mutating state", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  const model = selectAndReload(selectorState, "system", "DNX80|DI", snapshot);

  const indirect = workflowField(model, "indirectOpticVar1");
  assert.equal(indirect.displayMode, "auto-chip");
  assert.equal(indirect.effectiveValue, "DNX80|Linear Uplight");
  assert.equal(indirect.effectiveLabel, "Linear Uplight · DNX80");
  assert.equal(indirect.compatibleOptionCount, 1);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.indirectOpticVar1, undefined);
});

test("direct-only product does not trigger SURFACE_MOUNT_DI_BLOCK", () => {
  const selectorState = createSelectorState();
  const snapshot = mountPolicySnapshot();
  const model = selectAndReload(selectorState, "system", "DNX60|Direct", snapshot);

  const surface = workflowOption(model, "mountStyle", "Surface Mount");
  assert.equal(surface.status, "available");
  assert.equal(surface.blocked, false);
  assert.equal(workflowOption(model, "mountStyle", "Suspended").status, "available");
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
