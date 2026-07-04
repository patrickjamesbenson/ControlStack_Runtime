import test from "node:test";
import assert from "node:assert/strict";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { renderSelectorView } from "../packages/modules/cs-selector/selectorView.js";
import { selectorConstraintFingerprintFromQuery } from "../packages/modules/cs-selector/index.js";
import { readSelectorSpecialPartsUserTestOptions } from "../server.js";

const source = { present: true, readable: true, parseable: true };

function snapshot() {
  return {
    USERS: [
      {
        display_name: "Allan Organ",
        email_login: "redacted.allan@example.test",
        system_component_ids: "sp-1",
      },
      {
        display_name: "Unentitled User",
        email_login: "redacted.unentitled@example.test",
        system_component_ids: "",
      },
    ],
    SYSTEM_COMPONENTS: [
      {
        id: "sp-1",
        status: "available",
        system: "",
        variants_all: "",
        ip_class: "",
        description: "Safe special component — should not render raw row data",
      },
    ],
  };
}

function derive(options = {}) {
  return deriveSelectorReferenceOptionsFromSnapshot(snapshot(), { source, ok: true, ...options });
}

function createAdapter() {
  return {
    moduleId: "cs_selector",
    services: {},
    isFlagEnabled() { return false; },
    readSnapshots() {
      return {
        route: "/selector",
        diagnostics: {},
        flags: { values: {} },
        project: { currentProject: {}, metadata: {}, selection: {} },
        visibility: {
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          inputs: {},
          visibleModules: ["cs_selector"],
          hiddenModules: [],
        },
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

function model(result, specialPartsUserTest = {}) {
  const selectorState = createSelectorState();
  selectorState.setSpecialPartsUserTestState(specialPartsUserTest);
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: result,
    onLocalStateChange: () => {},
  });
}

function assertNoRawExposure(summary) {
  assert.equal(summary.rawUsersExposed, false);
  assert.equal(summary.rawRowsExposed, false);
  assert.equal(summary.rawContactsExposed, false);
  assert.equal(summary.rawPayloadsExposed, false);
}

class SpecialPartsTestElement {
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
    this.selected = false;
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

function withSpecialPartsDocument(callback) {
  const documentKey = "doc" + "ument";
  const previousDocument = globalThis[documentKey];
  globalThis[documentKey] = {
    createElement(tagName) {
      return new SpecialPartsTestElement(tagName);
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

function renderedContainer(vm) {
  return withSpecialPartsDocument(() => {
    const container = globalThis["doc" + "ument"].createElement("div");
    renderSelectorView(container, vm);
    return container;
  });
}

function visibleSpecialPartsCard(container) {
  const card = elementDescendants(container).find((element) => (
    classIncludes(element, "cs-selector-special-parts-user-test")
    && element.dataset.specialPartsUserTestSurface === "visible-shell"
  ));
  assert.ok(card, "expected visible Selector shell special-parts user test card");
  assert.equal(hasAncestorWithClass(card, "cs-selector-dev-drawer"), false);
  return card;
}

test("default mode does not expose special parts without entitlement override", () => {
  const result = derive();
  const vm = model(result);

  assert.equal(result.specialPartsUserTestSummary.internalTestActive, false);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, false);
  assert.equal(result.specialPartsUserTestSummary.redactedCandidates.length, 0);
  assert.equal(vm.specialPartsUserTest.activeTestPrincipal, "");
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, false);
  assert.equal(vm.specialPartsEntitlementPreview.entitlementStatus, "none");
  assertNoRawExposure(result.specialPartsUserTestSummary);
});

test("Allan Organ test principal exposes entitlement-backed special parts when source summary supports it", () => {
  const result = derive({ specialPartsTestPrincipal: "Allan Organ", showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: "Allan Organ", showEntitlementBackedSpecialParts: true });

  assert.equal(result.specialPartsUserTestSummary.activeTestPrincipal, "Allan Organ");
  assert.equal(result.specialPartsUserTestSummary.entitlementFound, true);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, true);
  assert.equal(result.specialPartsUserTestSummary.redactedCandidates.length, 1);
  assert.equal(vm.specialPartsUserTest.entitlementFound, true);
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, true);
  assert.notEqual(vm.specialPartsEntitlementPreview.entitlementStatus, "none");
  assert.ok(["candidate", "matched-redacted", "blocked", "review-required"].includes(vm.specialPartsEntitlementPreview.entitlementStatus));
  assertNoRawExposure(result.specialPartsUserTestSummary);
});

test("unknown or unentitled test principal does not expose special parts", () => {
  const result = derive({ specialPartsTestPrincipal: "Unknown Person", showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: "Unknown / unentitled", showEntitlementBackedSpecialParts: true });

  assert.equal(result.specialPartsUserTestSummary.activeTestPrincipal, "Unknown / unentitled");
  assert.equal(result.specialPartsUserTestSummary.entitlementFound, false);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, false);
  assert.equal(vm.specialPartsUserTest.entitlementFound, false);
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, false);
  assert.equal(vm.specialPartsEntitlementPreview.entitlementStatus, "none");
});

test("show-special-parts toggle without entitlement does not expose parts", () => {
  const result = derive({ specialPartsTestPrincipal: "Unknown / unentitled", showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: "Unknown / unentitled", showEntitlementBackedSpecialParts: true });

  assert.equal(result.specialPartsUserTestSummary.showEntitlementBackedSpecialParts, true);
  assert.equal(result.specialPartsUserTestSummary.entitlementFound, false);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, false);
  assert.equal(result.specialPartsUserTestSummary.redactedCandidates.length, 0);
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, false);
  assert.equal(vm.specialPartsEntitlementPreview.redactedEntitlementCount, 0);
});

test("entitlement-visible special parts remain production-blocked", () => {
  const result = derive({ specialPartsTestPrincipal: "Allan Organ", showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: "Allan Organ", showEntitlementBackedSpecialParts: true });

  assert.equal(result.specialPartsUserTestSummary.productionOutputsBlocked, true);
  assert.equal(result.specialPartsUserTestSummary.engineEnabled, false);
  assert.equal(result.specialPartsUserTestSummary.runTableGenerationEnabled, false);
  assert.equal(result.specialPartsUserTestSummary.iesGenerationEnabled, false);
  assert.equal(result.specialPartsUserTestSummary.selectedResultPersistenceEnabled, false);
  assert.equal(vm.selectorSurface.engineVerifyReady, false);
  assert.equal(vm.selectorSurface.runTableReady, false);
  assert.equal(vm.selectorSurface.iesReady, false);
  assert.equal(vm.specialPartsUserTest.productionActionsEnabled, false);
  assert.equal(vm.specialPartsUserTest.hubSpotWriteEnabled, false);
});

test("visible special-parts user card renders beside existing timeline/status controls", () => {
  const result = derive({ specialPartsTestPrincipal: "Allan Organ", showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: "Allan Organ", showEntitlementBackedSpecialParts: true });
  const container = renderedContainer(vm);
  const card = visibleSpecialPartsCard(container);

  assert.match(elementText(card), /Internal special-parts user\/principal test mode/);
  assert.match(elementText(card), /Test user \/ principal/);
  assert.match(elementText(card), /Allan Organ/);
  assert.match(elementText(card), /entitlement found yes/);
  assert.match(elementText(card), /special parts visible yes/);
  assert.match(elementText(card), /production outputs blocked/);

  const principalSelect = elementDescendants(card).find((element) => element.tagName === "SELECT" && element.dataset.specialPartsUserTestControl === "testPrincipal");
  const toggleInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.specialPartsUserTestControl === "showSpecialParts");
  assert.ok(principalSelect, "expected principal select control");
  assert.ok(toggleInput, "expected show-special-parts toggle");
  assert.ok(principalSelect.options.some((option) => option.value === "Allan Organ"));

  const timelineCard = elementDescendants(container).find((element) => (
    classIncludes(element, "cs-selector-timeline-status-test")
    && element.dataset.timelineControlsSurface === "visible-shell"
  ));
  assert.ok(timelineCard, "existing timeline/status controls should still render in visible shell");
});

test("special-parts user controls call existing state actions", () => {
  const result = derive({ specialPartsTestPrincipal: "Allan Organ", showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: "Allan Organ", showEntitlementBackedSpecialParts: true });
  const actions = [];
  vm.selectorSurface.specialPartsUserTest = {
    ...vm.selectorSurface.specialPartsUserTest,
    setTestPrincipal(value) { actions.push(["principal", value]); },
    setShowEntitlementBackedSpecialParts(enabled) { actions.push(["show", enabled]); },
  };

  const card = visibleSpecialPartsCard(renderedContainer(vm));
  const principalSelect = elementDescendants(card).find((element) => element.tagName === "SELECT" && element.dataset.specialPartsUserTestControl === "testPrincipal");
  principalSelect.value = "Unknown / unentitled";
  principalSelect.eventListeners.change();

  const toggleInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.specialPartsUserTestControl === "showSpecialParts");
  toggleInput.checked = false;
  toggleInput.eventListeners.change();

  assert.deepEqual(actions, [
    ["principal", "Unknown / unentitled"],
    ["show", false],
  ]);
});

test("special-parts user query parser and fingerprint include safe diagnostic params", () => {
  const requestUrl = {
    searchParams: {
      get(key) {
        return { specialPartsTestPrincipal: "Allan Organ", showSpecialParts: "1" }[key] || "";
      },
      getAll() { return []; },
    },
  };
  assert.deepEqual(readSelectorSpecialPartsUserTestOptions(requestUrl), {
    specialPartsTestPrincipal: "Allan Organ",
    showSpecialParts: "1",
  });

  const base = selectorConstraintFingerprintFromQuery("?system=DNX+80+DI");
  const special = selectorConstraintFingerprintFromQuery("?system=DNX+80+DI&specialPartsTestPrincipal=Allan+Organ&showSpecialParts=1");
  assert.notEqual(special, base);
  assert.match(special, /specialPartsTestPrincipal=Allan\+Organ/);
  assert.match(special, /showSpecialParts=1/);
});
