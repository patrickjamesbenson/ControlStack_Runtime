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
    ] : [],
    SYSTEM_POLICY: includePolicy ? [
      { category: "finish colour", item: "Policy Silver", approved: "yes" },
    ] : [],
  };
}

function selectorReferenceStatus(snapshot = finishesSnapshot()) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady() }),
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

test("body finish fills from real SYSTEM, ACCESSORIES, and SYSTEM_POLICY options", () => {
  const model = createModel();
  const values = optionValues(model, "bodyFinish");

  assert.ok(values.includes("White (Textured)"));
  assert.ok(values.includes("Black (Textured)"));
  assert.ok(values.includes("Accessory Pearl"));
  assert.ok(values.includes("Policy Silver"));
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
