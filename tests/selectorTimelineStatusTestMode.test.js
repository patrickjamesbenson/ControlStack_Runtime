import test from "node:test";
import assert from "node:assert/strict";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { renderSelectorView } from "../packages/modules/cs-selector/selectorView.js";
import { selectorConstraintFingerprintFromQuery } from "../packages/modules/cs-selector/index.js";
import { readSelectorTimelineOptions } from "../server.js";

const source = { present: true, readable: true, parseable: true };
const internalRoadmap = Object.freeze({
  timelineVisibilityMode: "internal-asof-test",
  timelineAsOfDate: "2026-08-15",
  timelineVisibleStatuses: ["available", "approved", "roadmap"],
});

function snapshot() {
  return {
    SYSTEM: [
      { system: "80", system_variant_1: "DI", label: "DNX 80 DI", emission: "Both", approved: "yes" },
      { system: "45", system_variant_1: "Direct", label: "DNX 45 Direct", emission: "Direct", approved: "yes" },
    ],
    OPTICS: [
      { system: "80", optic_var_1: "Opal", optic_var_2: "Opal", emission_permission: "Direct", approved: "yes" },
      { system: "80", optic_var_1: "Inlay", optic_var_2: "Microprism;Antiglare", emission_permission: "Direct", status: "roadmap", status_date: "2026-08-15", approved: "yes" },
      { system: "45", optic_var_1: "Opal", optic_var_2: "Opal", emission_permission: "Direct", approved: "yes" },
      { system: "45", optic_var_1: "Daisy", optic_var_2: "30;50;80;Wallwash", emission_permission: "Direct", status: "roadmap", status_date: "2026-08-15", approved: "yes" },
    ],
  };
}

function derive(constraints = {}, timeline = {}) {
  return deriveSelectorReferenceOptionsFromSnapshot(snapshot(), { constraints, source, ok: true, ...timeline });
}

function wf(result, fieldKey) {
  const field = (result.workflowSections || []).flatMap((section) => section.fields || []).find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected workflow field ${fieldKey}`);
  return field;
}

function labels(result, fieldKey) {
  return (wf(result, fieldKey).options || [])
    .filter((option) => option.status === "available" && option.blocked !== true)
    .map((option) => option.label)
    .sort();
}

function byLabel(result, fieldKey, label) {
  const found = (wf(result, fieldKey).options || []).find((option) => option.label === label);
  assert.ok(found, `expected ${fieldKey} option ${label}`);
  return found;
}

function model(result, constraints = {}, timelineStatusTest = {}) {
  const manualConstraints = Object.fromEntries(Object.entries(constraints).map(([fieldKey, value]) => [fieldKey, { fieldKey, value, valueLabel: value }]));
  const selectorState = {
    getSnapshot() { return { dbBackedSelector: { manualConstraints }, timelineStatusTest, runIntake: { runs: [] }, runAccessoryPlacement: { intents: [] } }; },
    setDbBackedSelectorFieldValue() {},
    clearDbBackedSelectorFieldValue() {},
    setSelectorTimelineTestMode() {},
    setSelectorTimelineAsOfDate() {},
    setSelectorTimelineVisibleStatus() {},
    setExpanderSectionOpen() {},
  };
  const adapter = {
    moduleId: "cs_selector",
    services: {},
    isFlagEnabled() { return false; },
    readSnapshots() {
      return { route: "/selector", diagnostics: {}, flags: { values: {} }, project: { currentProject: {}, metadata: {}, selection: {} }, visibility: { moduleReasons: {}, inputs: {}, visibleModules: [], hiddenModules: [] }, handoff: {}, identity: {}, authority: {}, company: {}, crm: {}, timelinePolicy: {} };
    },
  };
  return createSelectorViewModel({ adapter, selectorState, selectorReferenceStatus: result, onLocalStateChange: () => {} });
}

function visibleControlLabels(vm, fieldKey) {
  const field = (vm.selectorControls.controlSections || [])
    .flatMap((section) => section.fields || [])
    .find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected visible field ${fieldKey}`);
  return (field.options || []).map((option) => option.label).sort();
}

class SelectorTimelineTestElement {
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

function withTimelineTestDocument(callback) {
  const documentKey = "doc" + "ument";
  const previousDocument = globalThis[documentKey];
  globalThis[documentKey] = {
    createElement(tagName) {
      return new SelectorTimelineTestElement(tagName);
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

function hasAncestorWithClass(element, className) {
  let current = element.parentNode;
  while (current) {
    if (classIncludes(current, className)) return true;
    current = current.parentNode;
  }
  return false;
}

function renderedTimelineContainer(vm) {
  return withTimelineTestDocument(() => {
    const container = globalThis["doc" + "ument"].createElement("div");
    renderSelectorView(container, vm);
    return container;
  });
}

function visibleTimelineTestCard(container) {
  const card = elementDescendants(container).find((element) => (
    classIncludes(element, "cs-selector-timeline-status-test")
    && element.dataset.timelineControlsSurface === "visible-shell"
  ));
  assert.ok(card, "expected visible Selector shell timeline test card");
  assert.equal(hasAncestorWithClass(card, "cs-selector-dev-drawer"), false);
  return card;
}

test("external default keeps 80 Inlay selector-visible as review-only", () => {
  const result = derive({ system: "DNX 80 DI" });
  assert.equal(result.timelineVisibilityMode, "external-default");
  assert.deepEqual(result.timelineVisibleStatuses, ["available", "approved"]);
  assert.ok(labels(result, "directOpticVar1").includes("Inlay · 80"));
  const inlay = byLabel(result, "directOpticVar1", "Inlay · 80");
  assert.equal(inlay.timelineAvailability, "selector-visible-review-only");
  assert.equal(inlay.productionBlocked, true);
});

test("internal as-of with roadmap exposes 80 Inlay", () => {
  assert.ok(labels(derive({ system: "DNX 80 DI" }, internalRoadmap), "directOpticVar1").includes("Inlay · 80"));
});

test("selecting 80 Inlay hydrates Microprism and Antiglare", () => {
  const result = derive({ system: "DNX 80 DI", directOpticVar1: "80|Inlay" }, internalRoadmap);
  assert.deepEqual(labels(result, "directOpticVar2"), ["Antiglare", "Microprism"]);
});

test("80 Inlay stays visible when roadmap status is omitted from selector test controls", () => {
  const result = derive({ system: "DNX 80 DI" }, {
    timelineVisibilityMode: "internal-asof-test",
    timelineAsOfDate: "2026-08-15",
    timelineVisibleStatuses: ["available", "approved"],
  });
  assert.ok(labels(result, "directOpticVar1").includes("Inlay · 80"));
});

test("80 Inlay stays visible before status date because status_date is not a selector filter", () => {
  const result = derive({ system: "DNX 80 DI" }, {
    timelineVisibilityMode: "internal-asof-test",
    timelineAsOfDate: "2026-08-14",
    timelineVisibleStatuses: ["available", "approved", "roadmap"],
  });
  assert.ok(labels(result, "directOpticVar1").includes("Inlay · 80"));
});

test("45 Daisy appears only for 45-family system", () => {
  assert.ok(labels(derive({ system: "DNX 45 Direct" }, internalRoadmap), "directOpticVar1").includes("Daisy · 45"));
  assert.ok(!labels(derive({ system: "DNX 80 DI" }, internalRoadmap), "directOpticVar1").includes("Daisy · 45"));
});

test("internal roadmap option remains review-only and production-blocked", () => {
  const inlay = byLabel(derive({ system: "DNX 80 DI" }, internalRoadmap), "directOpticVar1", "Inlay · 80");
  assert.equal(inlay.optionStatusClass, "roadmap");
  assert.equal(inlay.timelineAvailability, "visible-to-internal-asof-test");
  assert.equal(inlay.internalTimelineTestOnly, true);
  assert.equal(inlay.productionBlocked, true);
  assert.equal(inlay.statusPolicyReviewRequired, true);
  assert.equal(inlay.rawRowsExposed, false);
});

test("roadmap exposure does not unlock production readiness", () => {
  const result = derive({ system: "DNX 80 DI", directOpticVar1: "80|Inlay" }, internalRoadmap);
  const vm = model(result, { system: "DNX 80 DI", directOpticVar1: "80|Inlay" }, internalRoadmap);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.hiddenWriteBackEnabled, false);
  assert.equal(vm.selectorSurface.engineVerifyReady, false);
  assert.equal(vm.selectorSurface.runTableReady, false);
  assert.equal(vm.selectorSurface.iesReady, false);
  assert.equal(vm.selectorSurface.timelineStatusTest.productionActionsEnabled, false);
  assert.equal(vm.selectorSurface.timelineStatusTest.hubSpotWriteEnabled, false);
});

test("live main controls consume internal timeline truth", () => {
  const result = derive({ system: "DNX 80 DI" }, internalRoadmap);
  const vm = model(result, { system: "DNX 80 DI" }, internalRoadmap);
  assert.ok(visibleControlLabels(vm, "directOpticVar1").includes("Inlay · 80"));
});

test("timeline model exposes roadmap checkbox option", () => {
  const vm = model(derive({ system: "DNX 80 DI" }, internalRoadmap), { system: "DNX 80 DI" }, internalRoadmap);
  assert.equal(vm.timelineStatusTest.timelineAsOfDate, "2026-08-15");
  assert.ok(vm.timelineStatusTest.timelineVisibleStatusOptions.includes("roadmap"));
  assert.ok(vm.timelineStatusTest.timelineVisibleStatuses.includes("roadmap"));
});

test("timeline status controls render in the visible Selector shell card", () => {
  const vm = model(derive({ system: "DNX 80 DI" }, internalRoadmap), { system: "DNX 80 DI" }, internalRoadmap);
  const card = visibleTimelineTestCard(renderedTimelineContainer(vm));
  assert.match(elementText(card), /Internal timeline\/status test mode/);

  const modeInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.timelineControl === "internal-asof-test");
  const dateInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.timelineControl === "timelineAsOfDate");
  const statusInputs = elementDescendants(card).filter((element) => element.tagName === "INPUT" && element.dataset.timelineStatus);
  assert.ok(modeInput, "expected visible internal/as-of checkbox");
  assert.ok(dateInput, "expected visible as-of date picker");
  assert.deepEqual(statusInputs.map((element) => element.dataset.timelineStatus).sort(), ["approved", "available", "obsolete", "roadmap", "staged", "unknown"]);

  const clickableLabels = elementDescendants(card).filter((element) => element.tagName === "LABEL");
  assert.ok(clickableLabels.some((label) => elementText(label).includes("Enable internal/as-of test mode") && elementDescendants(label).includes(modeInput)));
  for (const status of ["available", "approved", "staged", "roadmap", "obsolete", "unknown"]) {
    const statusInput = statusInputs.find((element) => element.dataset.timelineStatus === status);
    assert.ok(clickableLabels.some((label) => elementText(label) === status && elementDescendants(label).includes(statusInput)), `expected clickable label for ${status}`);
  }
});

test("visible timeline status card reuses existing state actions", () => {
  const vm = model(derive({ system: "DNX 80 DI" }, internalRoadmap), { system: "DNX 80 DI" }, internalRoadmap);
  const actions = [];
  vm.selectorSurface.timelineStatusTest = {
    ...vm.selectorSurface.timelineStatusTest,
    setTimelineTestMode(enabled) { actions.push(["mode", enabled]); },
    setTimelineAsOfDate(value) { actions.push(["date", value]); },
    setTimelineVisibleStatus(status, visible) { actions.push(["status", status, visible]); },
  };

  const card = visibleTimelineTestCard(renderedTimelineContainer(vm));
  const modeInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.timelineControl === "internal-asof-test");
  modeInput.checked = true;
  modeInput.eventListeners.change();

  const dateInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.timelineControl === "timelineAsOfDate");
  dateInput.value = "2026-09-01";
  dateInput.eventListeners.change();

  const roadmapInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.timelineStatus === "roadmap");
  roadmapInput.checked = false;
  roadmapInput.eventListeners.change();

  assert.deepEqual(actions, [
    ["mode", true],
    ["date", "2026-09-01"],
    ["status", "roadmap", false],
  ]);
});

test("timeline query parser keeps selected statuses", () => {
  const requestUrl = {
    searchParams: {
      get(key) {
        return { timelineVisibilityMode: "internal-asof-test", timelineAsOfDate: "2026-08-15", timelineVisibleStatuses: "available,approved" }[key] || "";
      },
      getAll(key) {
        return key === "timelineVisibleStatus" ? ["roadmap"] : [];
      },
    },
  };
  assert.deepEqual(readSelectorTimelineOptions(requestUrl), {
    timelineVisibilityMode: "internal-asof-test",
    timelineAsOfDate: "2026-08-15",
    timelineVisibleStatuses: ["roadmap", "available", "approved"],
  });
});

test("option fingerprint changes for timeline status controls", () => {
  const base = selectorConstraintFingerprintFromQuery("?system=DNX+80+DI");
  const internal = selectorConstraintFingerprintFromQuery("?system=DNX+80+DI&timelineVisibilityMode=internal-asof-test&timelineAsOfDate=2026-08-15&timelineVisibleStatuses=available,approved,roadmap");
  assert.notEqual(internal, base);
  assert.match(internal, /timelineVisibleStatuses=/);
});

