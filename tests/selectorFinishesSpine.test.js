import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const testSourceUrl = new URL("./selectorFinishesSpine.test.js", import.meta.url);

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

function finishesSnapshot({ includeFlex = true, includePolicy = true, includeAccessory = true } = {}) {
  return {
    SYSTEM: [
      {
        system: "DNX",
        system_variant_1: "80",
        label: "DNX 80",
        emission: "Direct",
        system_and_variant_finish: "White (Textured);Black (Textured)",
        colour: "White Flex;Black Flex;Grey Flex",
        color: "Secondary White Flex;Secondary Black Flex",
        flex_map: includeFlex ? "White Flex;Black Flex" : "",
        approved: "yes",
      },
      {
        system: "ALT",
        system_variant_1: "40",
        label: "ALT 40",
        emission: "Direct",
        system_and_variant_finish: "ALT Black",
        flex_map: includeFlex ? "ALT Flex" : "",
        approved: "yes",
      },
    ],
    ACCESSORIES: includeAccessory ? [
      { accessory_type: "finish", display_choice: "Accessory Pearl", approved: "yes" },
      { accessory_type: "flex_colour", accessory_id: "Accessory Grey Flex", display_choice: "Accessory Grey Flex", approved: "yes" },
    ] : [],
    SYSTEM_POLICY: includePolicy ? [
      { category: "finish colour", item: "Policy Silver", approved: "yes" },
      { category: "flex colour", item: "Policy Grey Flex", approved: "yes" },
    ] : [],
  };
}

function liveFinishRegressionSnapshot() {
  return {
    SYSTEM: [
      {
        system: "DNX 80 DI",
        label: "DNX 80 DI",
        emission: "Direct;Indirect",
        mount_style: "Suspended",
        system_and_variant_finish: "White (Textured);Black (Textured);Silver Kinetic;Bronze;Graphite",
        flex_map: "White Flex;Black Flex;Grey Flex",
        approved: "yes",
      },
    ],
    OPTICS: [
      {
        system: "DNX 80 DI",
        optic_var_1: "Inlay",
        optic_var_2: "Antiglare",
        emission_permission: "Direct",
        ip_option_1: "IP65",
        ik_option_2: "IK10",
        approved: "yes",
      },
    ],
    SYSTEM_POLICY: [
      { category: "electrical class", item: "Non SELV with Earth", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mount", display_choice: "Suspended", mount_style: "Suspended", mount_selections: "Rod", mount_particulars: "2m Drop", approved: "yes" },
      { accessory_type: "power_penetration", display_choice: "End Plate", approved: "yes" },
      { accessory_type: "power_location", display_choice: "End", approved: "yes" },
      { accessory_type: "flex_length", display_choice: "3.0m", approved: "yes" },
      { accessory_type: "egress_light", accessory_id: "Maintained", display_choice: "Maintained", approved: "yes" },
      { accessory_type: "sensor", accessory_id: "PIR Sensor", display_choice: "PIR Sensor", approved: "yes" },
    ],
  };
}

function selectorReferenceStatus(snapshot = finishesSnapshot(), constraints = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints }),
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = finishesSnapshot() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot),
  });
}

function selectAndReload(selectorState, fieldKey, value, snapshot = finishesSnapshot()) {
  let model = createModel({ selectorState, snapshot });
  model.selectorSurface.setFieldValue(fieldKey, value);
  return createModel({ selectorState, snapshot });
}

function finishesSection(spine) {
  const section = spine.sections.find((item) => item.sectionKey === "finishes");
  assert.ok(section, "expected Finishes spine section");
  return section;
}

function finishesRow(spine, rowKey) {
  const row = finishesSection(spine).rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected Finishes spine row ${rowKey}`);
  return row;
}

function workflowField(model, fieldKey) {
  const field = model.selectorSurface.workflowSections
    .flatMap((section) => section.fields || [])
    .find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected workflow field ${fieldKey}`);
  return field;
}

function selectorOptionsWorkflowField(result, fieldKey) {
  const field = result.workflowSections
    .flatMap((section) => section.fields || [])
    .find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected selector options workflow field ${fieldKey}`);
  return field;
}

function availableSelectorOptionValues(result, fieldKey) {
  return (selectorOptionsWorkflowField(result, fieldKey).options || [])
    .filter((item) => item.blocked !== true && item.status !== "blocked")
    .map((item) => item.value);
}

function workflowOption(model, fieldKey, value) {
  const option = (workflowField(model, fieldKey).options || []).find((item) => item.value === value || item.label === value);
  assert.ok(option, `expected option ${value} for ${fieldKey}`);
  return option;
}

function optionValues(model, fieldKey) {
  return (workflowField(model, fieldKey).options || []).map((item) => item.value);
}

test("empty Finishes spine rows render as em dash", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.equal(finishesRow(spine, "bodyFinish").displayValue, "—");
  assert.equal(finishesRow(spine, "cover").displayValue, "—");
  assert.equal(finishesRow(spine, "endPlates").displayValue, "—");
  assert.equal(finishesRow(spine, "flexColour").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.finishes.bodyFinish, null);
  assert.equal(model.selectorSurface.payloadPreview.finishes.cover, null);
  assert.equal(model.selectorSurface.payloadPreview.finishes.endPlates, null);
  assert.equal(model.selectorSurface.payloadPreview.finishes.flexColour, null);
});

test("body finish fills from paint options only and excludes secondary flex colours", () => {
  const model = createModel();
  const values = optionValues(model, "bodyFinish");

  assert.ok(values.includes("White (Textured)"));
  assert.ok(values.includes("Black (Textured)"));
  assert.ok(values.includes("Accessory Pearl"));
  assert.ok(values.includes("Policy Silver"));
  assert.equal(values.includes("White Flex"), false);
  assert.equal(values.includes("Black Flex"), false);
  assert.equal(values.includes("Grey Flex"), false);
  assert.equal(values.includes("Secondary White Flex"), false);
  assert.equal(values.includes("Secondary Black Flex"), false);
  assert.equal(values.includes("Accessory Grey Flex"), false);
  assert.equal(values.includes("Policy Grey Flex"), false);
});

test("cover, end plate, and flex dropdowns keep donor paint/flex buckets separated", () => {
  const model = createModel();
  const coverField = workflowField(model, "finishCover");
  const coverValues = optionValues(model, "finishCover");
  const endValues = optionValues(model, "finishEnd");
  const flexValues = optionValues(model, "finishFlex");

  assert.equal(coverField.futureMapped, false);
  assert.equal(coverValues.includes("White (Textured)"), true);
  assert.equal(coverValues.includes("Black (Textured)"), true);
  assert.equal(endValues.includes("White (Textured)"), true);
  assert.equal(endValues.includes("Black (Textured)"), true);
  for (const flexValue of ["White Flex", "Black Flex", "Grey Flex", "Secondary White Flex", "Secondary Black Flex", "Accessory Grey Flex", "Policy Grey Flex"]) {
    assert.equal(coverValues.includes(flexValue), false, `${flexValue} must not leak into cover paint choices`);
    assert.equal(endValues.includes(flexValue), false, `${flexValue} must not leak into end plate paint choices`);
  }
  assert.equal(flexValues.includes("White Flex"), true);
  assert.equal(flexValues.includes("Black Flex"), true);
  for (const paintValue of ["White (Textured)", "Black (Textured)", "Accessory Pearl", "Policy Silver"]) {
    assert.equal(flexValues.includes(paintValue), false, `${paintValue} must not appear as a raw flex choice`);
  }
  assert.equal(flexValues.includes("Accessory Grey Flex"), false);
  assert.equal(flexValues.includes("Policy Grey Flex"), false);
});

test("paint finish choices stay visible under DNX 80 DI live-style constraints", () => {
  const constraints = {
    system: "DNX 80 DI",
    directOpticVar1: "DNX 80 DI|Inlay",
    directOpticVar2: "DNX 80 DI|Inlay|Antiglare",
    ipRating: "IP65",
    ikRating: "IK10",
    electricalClass: "Non SELV with Earth",
    mountStyle: "Suspended / Rod / 2m Drop",
    mountSelection: "Rod",
    mountParticulars: "2m Drop",
    powerPenetration: "End Plate",
    powerLocation: "End",
    flexLength: "3.0m",
    egressLight: "Maintained",
    sensor: "PIR Sensor",
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(liveFinishRegressionSnapshot(), { source: sourceReady(), constraints });
  const paintValues = ["White (Textured)", "Black (Textured)", "Silver Kinetic", "Bronze", "Graphite"];
  const flexValues = ["White Flex", "Black Flex", "Grey Flex"];

  for (const fieldKey of ["bodyFinish", "finishCover", "finishEnd"]) {
    const field = selectorOptionsWorkflowField(result, fieldKey);
    const availableValues = availableSelectorOptionValues(result, fieldKey);
    assert.ok(availableValues.length >= paintValues.length, `${fieldKey} should keep visible paint choices`);
    for (const paintValue of paintValues) assert.equal(availableValues.includes(paintValue), true, `${fieldKey} should include ${paintValue}`);
    for (const flexValue of flexValues) assert.equal(availableValues.includes(flexValue), false, `${fieldKey} must not include ${flexValue}`);
    assert.notEqual(field.status, "blocked", `${fieldKey} should not be fully blocked`);
  }

  const availableFlexValues = availableSelectorOptionValues(result, "finishFlex");
  for (const flexValue of flexValues) assert.equal(availableFlexValues.includes(flexValue), true, `finishFlex should include ${flexValue}`);
  for (const paintValue of paintValues) assert.equal(availableFlexValues.includes(paintValue), false, `finishFlex must not include ${paintValue}`);

  const mappedFlex = deriveSelectorReferenceOptionsFromSnapshot(liveFinishRegressionSnapshot(), {
    source: sourceReady(),
    constraints: { ...constraints, bodyFinish: "Silver Kinetic" },
  });
  const inheritedFlex = selectorOptionsWorkflowField(mappedFlex, "finishFlex").options.find((item) => item.inheritedSelected === true);
  assert.equal(inheritedFlex?.value, "Grey Flex");
});

test("cover, end plate, and flex inherit body finish where source supports inheritance", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "bodyFinish", "Black (Textured)");

  assert.equal(finishesRow(model.selectorSurface.productSpine, "bodyFinish").displayValue, "Black (Textured)");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "cover").displayValue, "Black (Textured)");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "cover").status, "inherited-consequence");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "endPlates").displayValue, "Black (Textured)");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "endPlates").status, "inherited-consequence");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "flexColour").displayValue, "Black Flex");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "flexColour").status, "inherited-consequence");
  assert.equal(model.selectorSurface.payloadPreview.finishes.cover, "Black (Textured)");
  assert.equal(model.selectorSurface.payloadPreview.finishes.endPlates, "Black (Textured)");
  assert.equal(model.selectorSurface.payloadPreview.finishes.flexColour, "Black Flex");
});

test("flex finish fills only where real source data supports it", () => {
  const selectorState = createSelectorState();
  const snapshotWithoutFlex = finishesSnapshot({ includeFlex: false, includePolicy: false, includeAccessory: false });
  let model = selectAndReload(selectorState, "system", "DNX|80", snapshotWithoutFlex);
  model = selectAndReload(selectorState, "bodyFinish", "White (Textured)", snapshotWithoutFlex);

  assert.equal(finishesRow(model.selectorSurface.productSpine, "flexColour").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.finishes.flexColour, null);
});

test("manual cover, end, and flex overrides remain manual constraints", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "bodyFinish", "White (Textured)");
  model = selectAndReload(selectorState, "finishCover", "Black (Textured)");
  model = selectAndReload(selectorState, "finishEnd", "Black (Textured)");
  model = selectAndReload(selectorState, "finishFlex", "Black Flex");

  assert.equal(finishesRow(model.selectorSurface.productSpine, "cover").displayValue, "Black (Textured)");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "cover").status, "manual-constraint");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "endPlates").displayValue, "Black (Textured)");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "endPlates").status, "manual-constraint");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "flexColour").displayValue, "Black Flex");
  assert.equal(finishesRow(model.selectorSurface.productSpine, "flexColour").status, "manual-constraint");
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.finishCover.value, "Black (Textured)");
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.finishEnd.value, "Black (Textured)");
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.finishFlex.value, "Black Flex");
});

test("incompatible Finishes selections are preserved and blocked", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "bodyFinish", "ALT Black");

  const row = finishesRow(model.selectorSurface.productSpine, "bodyFinish");
  assert.equal(row.displayValue, "—");
  assert.equal(row.status, "blocked");
  assert.equal(row.blocked, true);
  assert.equal(workflowOption(model, "bodyFinish", "ALT Black").status, "blocked");
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.bodyFinish.value, "ALT Black");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "bodyFinish"));
  assert.equal(model.selectorSurface.payloadPreview.finishes.bodyFinish, null);
});

test("Finishes payload preview keeps safety flags disabled and exposes no raw source data", async () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "bodyFinish", "Black (Textured)");
  model = selectAndReload(selectorState, "finishCover", "White (Textured)");
  model = selectAndReload(selectorState, "finishEnd", "Black (Textured)");
  model = selectAndReload(selectorState, "finishFlex", "White Flex");

  const payload = model.selectorSurface.payloadPreview;
  assert.equal(payload.previewOnly, true);
  assert.equal(payload.productionPayload, false);
  assert.equal(payload.finishes.bodyFinish, "Black (Textured)");
  assert.equal(payload.finishes.cover, "White (Textured)");
  assert.equal(payload.finishes.endPlates, "Black (Textured)");
  assert.equal(payload.finishes.flexColour, "White Flex");
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
