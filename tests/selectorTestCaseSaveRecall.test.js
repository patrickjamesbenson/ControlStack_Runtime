import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  SELECTOR_TEST_CASE_STORAGE_KEY,
  buildSelectorTestCaseFromSnapshot,
  createSelectorState,
  sanitiseSelectorTestCase,
} from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { renderSelectorView } from "../packages/modules/cs-selector/selectorView.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const serverSourceUrl = new URL("../server.js", import.meta.url);
const indexSourceUrl = new URL("../packages/modules/cs-selector/index.js", import.meta.url);

const source = { present: true, readable: true, parseable: true };
const internalRoadmap = Object.freeze({
  timelineVisibilityMode: "internal-asof-test",
  timelineAsOfDate: "2026-08-15",
  timelineVisibleStatuses: ["available", "approved", "roadmap"],
});

function selectorSnapshot() {
  return {
    SYSTEM: [
      { system: "80", system_variant_1: "DI", label: "DNX 80 DI", emission: "Both", approved: "yes" },
      { system: "45", system_variant_1: "Direct", label: "DNX 45 Direct", emission: "Direct", approved: "yes" },
    ],
    OPTICS: [
      { system: "80", optic_var_1: "Inlay", optic_var_2: "Microprism;Antiglare", emission_permission: "Direct", status: "roadmap", status_date: "2026-08-15", approved: "yes" },
      { system: "80", optic_var_1: "Opal", optic_var_2: "Opal", emission_permission: "Direct", approved: "yes" },
      { system: "45", optic_var_1: "Daisy", optic_var_2: "30;50;80;Wallwash", emission_permission: "Direct", approved: "yes" },
    ],
  };
}

function createAdapter() {
  return {
    moduleId: "cs_selector",
    services: {},
    isFlagEnabled() {
      return false;
    },
    readSnapshots() {
      return {
        route: { moduleId: "cs_selector" },
        diagnostics: {},
        flags: { values: {} },
        project: { owner: "shell", currentProject: {}, metadata: {}, selection: {} },
        visibility: { moduleReasons: {}, inputs: {}, visibleModules: [], hiddenModules: [] },
        handoff: {},
        identity: {},
        authority: {},
        company: {},
        crm: {},
        timelinePolicy: {},
      };
    },
  };
}

function constraintValues(selectorState) {
  const constraints = selectorState.getSnapshot().dbBackedSelector.manualConstraints;
  return Object.fromEntries(Object.entries(constraints).map(([fieldKey, record]) => [fieldKey, record.value]));
}

function derive(constraints = {}, timeline = {}) {
  return deriveSelectorReferenceOptionsFromSnapshot(selectorSnapshot(), { constraints, source, ok: true, ...timeline });
}

function selectorReferenceStatusFor(selectorState, { deriveWithLocalConstraints = true } = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source,
    selectorOptions: derive(deriveWithLocalConstraints ? constraintValues(selectorState) : {}, selectorState.getSnapshot().timelineStatusTest),
  };
}

function model(selectorState, options = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatusFor(selectorState, options),
    onLocalStateChange: () => {},
    selectorTestCaseActions: options.selectorTestCaseActions || {},
  });
}

class SelectorTestCaseElement {
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
    this.checked = false;
    this.open = false;
    this.disabled = false;
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

function withTestDocument(callback) {
  const documentKey = "doc" + "ument";
  const previousDocument = globalThis[documentKey];
  globalThis[documentKey] = {
    createElement(tagName) {
      return new SelectorTestCaseElement(tagName);
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

function elementText(element) {
  return [element.textContent || "", ...(element.children || []).map(elementText)].join(" ").replace(/\s+/g, " ").trim();
}

function classIncludes(element, className) {
  return String(element.className || "").split(/\s+/).includes(className);
}

function renderedContainer(viewModel) {
  return withTestDocument(() => {
    const container = globalThis["doc" + "ument"].createElement("div");
    renderSelectorView(container, viewModel);
    return container;
  });
}

test("Selector test-case save captures safe local Selector state only", () => {
  const selectorState = createSelectorState();
  selectorState.setDbBackedSelectorFieldValue("system", "DNX 80 DI", "DNX 80 DI");
  selectorState.setDbBackedSelectorFieldValue("directOpticVar1", "80|Inlay", "Inlay · 80");
  selectorState.setDbBackedSelectorFieldValue("directOpticVar2", "80|Inlay|Microprism", "Microprism");
  selectorState.setDbBackedSelectorFieldValue("bodyFinish", "Silver Kinetic", "Silver Kinetic");
  selectorState.setDbBackedSelectorFieldValue("finishFlex", "grey-flex", "Grey flex");
  selectorState.setDbBackedSelectorFieldValue("egressLight", "egress-left", "Egress left");
  selectorState.setDbBackedSelectorFieldValue("currentMa", "350", "350 mA");
  selectorState.setDbBackedSelectorFieldValue("rawRows", "C:\\ControlStack\\RuntimeData\\novondb.json", "raw path");
  selectorState.setSelectorTimelineTestMode(true);
  selectorState.setSelectorTimelineAsOfDate("2026-08-15");
  selectorState.setSelectorTimelineVisibleStatus("roadmap", true);
  selectorState.setSpecialPartsTestPrincipal("Allan Organ");
  selectorState.setShowEntitlementBackedSpecialParts(true);

  const saved = selectorState.captureSelectorTestCase();

  assert.equal(saved.kind, "selector-local-test-case");
  assert.equal(saved.storageKind, "browser-local-storage");
  assert.equal(saved.manualConstraints.system.value, "DNX 80 DI");
  assert.equal(saved.manualConstraints.directOpticVar1.value, "80|Inlay");
  assert.equal(saved.manualConstraints.directOpticVar2.value, "80|Inlay|Microprism");
  assert.equal(saved.manualConstraints.bodyFinish.value, "Silver Kinetic");
  assert.equal(saved.manualConstraints.finishFlex.value, "grey-flex");
  assert.equal(saved.manualConstraints.egressLight.value, "egress-left");
  assert.equal(Object.hasOwn(saved.manualConstraints, "currentMa"), false);
  assert.equal(Object.hasOwn(saved.manualConstraints, "rawRows"), false);
  assert.equal(saved.timelineStatusTest.timelineVisibilityMode, "internal-asof-test");
  assert.equal(saved.timelineStatusTest.timelineAsOfDate, "2026-08-15");
  assert.ok(saved.timelineStatusTest.timelineVisibleStatuses.includes("roadmap"));
  assert.equal(saved.specialPartsUserTest.testPrincipal, "Allan Organ");
  assert.equal(saved.specialPartsUserTest.showEntitlementBackedSpecialParts, true);
  assert.equal(saved.safety.localStorageOnly, true);
  assert.equal(saved.safety.productionProjectSave, false);
  assert.equal(saved.safety.runtimeDataMutationEnabled, false);
  assert.equal(saved.safety.serverPersistenceEnabled, false);
  assert.equal(saved.safety.postEndpointsEnabled, false);
  assert.equal(saved.safety.selectedResultPersistenceEnabled, false);
  assert.equal(saved.safety.engineReadinessEnabled, false);
  assert.equal(saved.safety.runTableGenerationEnabled, false);
  assert.equal(saved.safety.iesGenerationEnabled, false);
  assert.equal(saved.safety.projectExportEnabled, false);
  assert.equal(saved.safety.hubSpotWriteEnabled, false);

  const savedConstraintText = JSON.stringify(saved.manualConstraints);
  assert.equal(/raw_rows|rawPayload|engineResult|C:\\|novondb|credential|secret/.test(savedConstraintText), false);
  assert.equal(Object.hasOwn(saved, "selectedResult"), false);
  assert.equal(Object.hasOwn(saved, "rawPayload"), false);
});

test("Selector test-case recall restores manual constraints, timeline controls, and special-parts user test controls", () => {
  const saved = sanitiseSelectorTestCase({
    manualConstraints: {
      system: { value: "DNX 80 DI", valueLabel: "DNX 80 DI" },
      directOpticVar1: { value: "80|Inlay", valueLabel: "Inlay · 80" },
      directOpticVar2: { value: "80|Inlay|Antiglare", valueLabel: "Antiglare" },
      mountStyle: { value: "Suspended", valueLabel: "Suspended" },
      powerPenetration: { value: "Top", valueLabel: "Top" },
      finishCover: { value: "Silver Kinetic", valueLabel: "Silver Kinetic" },
      finishFlex: { value: "grey-flex", valueLabel: "Grey flex" },
      egressSound: { value: "ewis", valueLabel: "EWIS" },
      accessories: { value: "PIR", valueLabel: "PIR" },
    },
    timelineStatusTest: internalRoadmap,
    specialPartsUserTest: { testPrincipal: "Allan Organ", showEntitlementBackedSpecialParts: true },
  });
  const selectorState = createSelectorState();

  selectorState.recallSelectorTestCase(saved);
  const snapshot = selectorState.getSnapshot();

  assert.equal(snapshot.dbBackedSelector.manualConstraints.system.value, "DNX 80 DI");
  assert.equal(snapshot.dbBackedSelector.manualConstraints.directOpticVar1.value, "80|Inlay");
  assert.equal(snapshot.dbBackedSelector.manualConstraints.directOpticVar2.value, "80|Inlay|Antiglare");
  assert.equal(snapshot.dbBackedSelector.manualConstraints.mountStyle.value, "Suspended");
  assert.equal(snapshot.dbBackedSelector.manualConstraints.finishCover.value, "Silver Kinetic");
  assert.equal(snapshot.dbBackedSelector.manualConstraints.finishFlex.value, "grey-flex");
  assert.equal(snapshot.timelineStatusTest.timelineVisibilityMode, "internal-asof-test");
  assert.equal(snapshot.timelineStatusTest.timelineAsOfDate, "2026-08-15");
  assert.ok(snapshot.timelineStatusTest.timelineVisibleStatuses.includes("roadmap"));
  assert.equal(snapshot.specialPartsUserTest.testPrincipal, "Allan Organ");
  assert.equal(snapshot.specialPartsUserTest.showEntitlementBackedSpecialParts, true);
  assert.equal(snapshot.selectorTestCase.savedTestCasePresent, true);
  assert.equal(snapshot.selectorTestCase.productionProjectSave, false);
  assert.equal(snapshot.selectorTestCase.selectedResultPersistenceEnabled, false);
});

test("Selector test-case recall preserves incompatible recalled values as blocked instead of faking validity", () => {
  const selectorState = createSelectorState();
  selectorState.recallSelectorTestCase({
    manualConstraints: {
      system: { value: "DNX 80 DI", valueLabel: "DNX 80 DI" },
      directOpticVar1: { value: "45|Daisy", valueLabel: "Daisy · 45" },
    },
    timelineStatusTest: internalRoadmap,
  });

  const vm = model(selectorState, { deriveWithLocalConstraints: false });
  const blocked = vm.selectorSurface.manualConstraints.find((constraint) => constraint.fieldKey === "directOpticVar1");

  assert.ok(blocked, "expected recalled direct optic manual constraint");
  assert.equal(blocked.value, "45|Daisy");
  assert.equal(blocked.blocked, true);
  assert.equal(blocked.status, "blocked");
  assert.match(blocked.reason, /preserved|blocked|incompatible|unavailable/i);
  assert.ok(vm.selectorSurface.blockedItems.some((item) => item.fieldKey === "directOpticVar1"));
});

test("Selector cascade reset still works after a test-case recall when the user changes a parent", () => {
  const selectorState = createSelectorState();
  selectorState.recallSelectorTestCase({
    manualConstraints: {
      system: { value: "DNX 80 DI", valueLabel: "DNX 80 DI" },
      directOpticVar1: { value: "80|Inlay", valueLabel: "Inlay · 80" },
      directOpticVar2: { value: "80|Inlay|Microprism", valueLabel: "Microprism" },
      ipRating: { value: "IP65", valueLabel: "IP65" },
      ikRating: { value: "IK10", valueLabel: "IK10" },
      mountStyle: { value: "Suspended", valueLabel: "Suspended" },
      mountSelection: { value: "Suspension wire", valueLabel: "Suspension wire" },
      powerPenetration: { value: "Top", valueLabel: "Top" },
    },
  });

  selectorState.setDbBackedSelectorFieldValue("system", "DNX 45 Direct", "DNX 45 Direct");
  const constraints = selectorState.getSnapshot().dbBackedSelector.manualConstraints;

  assert.deepEqual(Object.keys(constraints), ["system"]);
  assert.equal(constraints.system.value, "DNX 45 Direct");
  assert.match(selectorState.getSnapshot().dbBackedSelector.lastAction, /cascade-cleared/);
});

test("Selector test-case recall keeps production outputs blocked", () => {
  const selectorState = createSelectorState();
  selectorState.recallSelectorTestCase({
    manualConstraints: {
      system: { value: "DNX 80 DI", valueLabel: "DNX 80 DI" },
      directOpticVar1: { value: "80|Inlay", valueLabel: "Inlay · 80" },
    },
    timelineStatusTest: internalRoadmap,
    specialPartsUserTest: { testPrincipal: "Allan Organ", showEntitlementBackedSpecialParts: true },
  });
  const surface = model(selectorState).selectorSurface;

  assert.equal(surface.engineVerifyReady, false);
  assert.equal(surface.runTableReady, false);
  assert.equal(surface.iesReady, false);
  assert.equal(surface.payloadPreview.disabledOutputs.runTableGeneration, false);
  assert.equal(surface.payloadPreview.disabledOutputs.iesGeneration, false);
  assert.equal(surface.payloadPreview.disabledOutputs.hubSpotCrmWriteBack, false);
  assert.equal(surface.selectedEngineResultHandoff.selectedResultPersistenceEnabled, false);
  assert.equal(surface.selectedEngineResultHandoff.safetyFlags.engineExecutionEnabled, false);
  assert.equal(surface.selectorTestCase.productionProjectSave, false);
  assert.equal(surface.selectorTestCase.runtimeDataMutationEnabled, false);
  assert.equal(surface.selectorTestCase.serverPersistenceEnabled, false);
  assert.equal(surface.selectorTestCase.postEndpointsEnabled, false);
  assert.equal(surface.selectorTestCase.projectExportEnabled, false);
});

test("Selector test-case controls render visibly and invoke provided browser-local actions", () => {
  const selectorState = createSelectorState();
  selectorState.recordSelectorTestCaseSave(buildSelectorTestCaseFromSnapshot(selectorState.getSnapshot()));
  const actions = [];
  const vm = model(selectorState, {
    selectorTestCaseActions: {
      saveCurrentTestCase() { actions.push("save"); },
      recallSavedTestCase() { actions.push("recall"); },
      clearSavedTestCase() { actions.push("clear"); },
    },
  });
  const container = renderedContainer(vm);
  const card = elementDescendants(container).find((element) => classIncludes(element, "cs-selector-test-case"));

  assert.ok(card, "expected visible Selector test-case shell card");
  assert.equal(card.dataset.selectorTestCaseControls, "visible-shell");
  assert.match(elementText(card), /Local Selector test case only — not a production Project save\./);
  assert.match(elementText(card), /Saved test case summary/);

  const saveButton = elementDescendants(card).find((element) => element.dataset.selectorTestCaseAction === "save");
  const recallButton = elementDescendants(card).find((element) => element.dataset.selectorTestCaseAction === "recall");
  const clearButton = elementDescendants(card).find((element) => element.dataset.selectorTestCaseAction === "clear");
  assert.ok(saveButton, "expected save button");
  assert.ok(recallButton, "expected recall button");
  assert.ok(clearButton, "expected clear button");
  assert.equal(recallButton.disabled, false);
  assert.equal(clearButton.disabled, false);

  saveButton.eventListeners.click();
  recallButton.eventListeners.click();
  clearButton.eventListeners.click();
  assert.deepEqual(actions, ["save", "recall", "clear"]);
});

test("Selector test-case implementation does not add POST endpoints or server persistence", async () => {
  const [serverSource, indexSource] = await Promise.all([
    readFile(serverSourceUrl, "utf-8"),
    readFile(indexSourceUrl, "utf-8"),
  ]);

  assert.equal(SELECTOR_TEST_CASE_STORAGE_KEY, "controlstack.cs-selector.local-test-case.v1");
  assert.equal(serverSource.includes("selector-test-case"), false);
  assert.equal(serverSource.includes("SELECTOR_TEST_CASE"), false);
  assert.equal(indexSource.includes("method: \"POST\""), false);
  assert.equal(indexSource.includes("method: 'POST'"), false);
  assert.equal(indexSource.includes("fetch(SELECTOR_TEST_CASE"), false);
});
