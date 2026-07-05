import test from "node:test";
import assert from "node:assert/strict";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { renderSelectorView } from "../packages/modules/cs-selector/selectorView.js";
import { selectorConstraintFingerprintFromQuery } from "../packages/modules/cs-selector/index.js";
import { readSelectorSpecialPartsUserTestOptions } from "../server.js";

const source = { present: true, readable: true, parseable: true };
const ALLAN_EMAIL = "allan" + "@" + "zencontrol.com";
const UNKNOWN_EMAIL = "unknown" + "@" + "example.test";
const MISSING_EMAIL = "missing" + "@" + "example.test";
const ALLAN_COMPONENT_ID = "assy-internal-mount-bracket-dnx-generic";
const ALLAN_LABEL = `Allan Organ <${ALLAN_EMAIL}>`;
const UNKNOWN_LABEL = `Unknown / unentitled <${UNKNOWN_EMAIL}>`;

function snapshot() {
  return {
    USERS: [
      {
        display_name: "Allan Organ",
        first_name: "Allan",
        last_name: "Organ",
        company: "Zencontrol",
        email_login: ALLAN_EMAIL,
        system_component_ids: "assy-internal-mount-bracket-dnx-generic",
      },
      {
        display_name: "Unentitled User",
        first_name: "Unentitled",
        last_name: "User",
        company: "No Parts Co",
        email_login: UNKNOWN_EMAIL,
        system_component_ids: "",
      },
    ],
    SYSTEM_COMPONENTS: [
      {
        id: "assy-internal-mount-bracket-dnx-generic",
        status: "available",
        system: "",
        variants_all: "",
        ip_class: "",
        caveats: "MOQ 500 plus, AUD 20ea plus gst, 6wks from sign off.",
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

function assertSafeIdentityOnly(summary, expected) {
  assert.deepEqual(Object.keys(summary.safeIdentitySummary).sort(), [
    "company",
    "entitlementFound",
    "firstName",
    "lastName",
    "specialPartsVisible",
  ].sort());
  assert.deepEqual(summary.safeIdentitySummary, expected);
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
  assertSafeIdentityOnly(result.specialPartsUserTestSummary, {
    firstName: "",
    lastName: "",
    company: "",
    entitlementFound: false,
    specialPartsVisible: false,
  });
  assertNoRawExposure(result.specialPartsUserTestSummary);
});

test("Allan email test principal exposes entitlement-backed special parts when source summary supports it", () => {
  const result = derive({ specialPartsTestPrincipal: ALLAN_EMAIL, showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: ALLAN_EMAIL, showEntitlementBackedSpecialParts: true });

  assert.equal(result.specialPartsUserTestSummary.authority, "email-first");
  assert.equal(result.specialPartsUserTestSummary.activeTestPrincipal, ALLAN_EMAIL);
  assert.equal(result.specialPartsUserTestSummary.activeTestPrincipalEmail, ALLAN_EMAIL);
  assert.equal(result.specialPartsUserTestSummary.activeTestPrincipalLabel, ALLAN_LABEL);
  assert.equal(result.specialPartsUserTestSummary.entitlementFound, true);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, true);
  assert.equal(result.specialPartsUserTestSummary.redactedCandidates.length, 1);
  assert.equal(result.specialPartsUserTestSummary.redactedCandidates[0].safeComponentId, ALLAN_COMPONENT_ID);
  assert.match(result.specialPartsUserTestSummary.redactedCandidates[0].safeCaveats, /MOQ 500 plus/);
  assertSafeIdentityOnly(result.specialPartsUserTestSummary, {
    firstName: "Allan",
    lastName: "Organ",
    company: "Zencontrol",
    entitlementFound: true,
    specialPartsVisible: true,
  });
  assert.equal(vm.specialPartsUserTest.activeTestPrincipal, ALLAN_EMAIL);
  assert.equal(vm.specialPartsUserTest.activeTestPrincipalLabel, ALLAN_LABEL);
  assert.deepEqual(vm.specialPartsUserTest.safeIdentitySummary, {
    firstName: "Allan",
    lastName: "Organ",
    company: "Zencontrol",
    entitlementFound: true,
    specialPartsVisible: true,
  });
  assert.equal(vm.specialPartsUserTest.entitlementFound, true);
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, true);
  assert.notEqual(vm.specialPartsEntitlementPreview.entitlementStatus, "none");
  assert.ok(["candidate", "matched-redacted", "blocked", "review-required"].includes(vm.specialPartsEntitlementPreview.entitlementStatus));
  assertNoRawExposure(result.specialPartsUserTestSummary);
});

test("Allan component resolves through source-backed compatibility without false blockers", () => {
  const sourceSnapshot = {
    USERS: [
      { display_name: "Allan Organ", first_name: "Allan", last_name: "Organ", company: "Zencontrol", email_login: ALLAN_EMAIL, system_component_ids: ALLAN_COMPONENT_ID },
    ],
    SYSTEM: [
      { system: "DNX", system_variant_1: "Square_DI", label: "DNX 80 D/I", emission: "Both", mount_style: "Suspended (No Flange)", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mount", display_choice: "Suspended (No Flange)", mount_selections: "Wire", mount_particulars: "1500mm drop", approved: "yes" },
    ],
    SYSTEM_COMPONENTS: [
      {
        id: ALLAN_COMPONENT_ID,
        status: "available",
        system: "DNX",
        variants_all: "Square DI",
        ip_class: "Class I",
        status_date: "validate",
        caveats: "MOQ 500 plus, AUD 20ea plus gst, 6wks from sign off.",
        description: "Safe source-backed component projection",
      },
    ],
  };
  const result = deriveSelectorReferenceOptionsFromSnapshot(sourceSnapshot, {
    source,
    ok: true,
    constraints: { system: "DNX|Square_DI", variantKey: "Square_DI", mountStyle: "Suspended" },
    specialPartsTestPrincipal: ALLAN_EMAIL,
    showSpecialParts: "1",
  });
  const vm = model(result, { testPrincipal: ALLAN_EMAIL, showEntitlementBackedSpecialParts: true });
  const row = vm.specialPartsEntitlementPreview.candidateRows.find((item) => item.safeComponentId === ALLAN_COMPONENT_ID);
  const safeCompatibilityText = JSON.stringify(vm.specialPartsEntitlementPreview.safeCompatibilityResults);

  assert.ok(row, "expected Allan source-backed component row");
  assert.equal(row.status, "compatible");
  assert.doesNotMatch(row.reason, /selected-system-missing-for-constrained-special-part|part-variant-does-not-include-selected-variant|part-ip-class-invalid|special-part-expiry-date-invalid/);
  assert.doesNotMatch(safeCompatibilityText, /selected-system-missing-for-constrained-special-part|part-variant-does-not-include-selected-variant|part-ip-class-invalid|special-part-expiry-date-invalid/);
  assert.equal(vm.specialPartsEntitlementPreview.rawComponentRowsReturned, false);
  assertNoRawExposure(result.specialPartsUserTestSummary);
});

test("Allan Organ display label alone does not grant special-parts entitlement", () => {
  const result = derive({ specialPartsTestPrincipal: "Allan Organ", showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: "Allan Organ", showEntitlementBackedSpecialParts: true });

  assert.notEqual(result.specialPartsUserTestSummary.activeTestPrincipal, ALLAN_EMAIL);
  assert.equal(result.specialPartsUserTestSummary.activeTestPrincipal, UNKNOWN_EMAIL);
  assert.equal(result.specialPartsUserTestSummary.entitlementFound, false);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, false);
  assert.equal(result.specialPartsUserTestSummary.redactedCandidates.length, 0);
  assert.equal(vm.specialPartsUserTest.activeTestPrincipal, UNKNOWN_EMAIL);
  assert.equal(vm.specialPartsUserTest.entitlementFound, false);
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, false);
  assert.equal(vm.specialPartsEntitlementPreview.entitlementStatus, "none");
});

test("unknown email fails closed", () => {
  const result = derive({ specialPartsTestPrincipal: MISSING_EMAIL, showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: MISSING_EMAIL, showEntitlementBackedSpecialParts: true });

  assert.equal(result.specialPartsUserTestSummary.activeTestPrincipal, MISSING_EMAIL);
  assert.equal(result.specialPartsUserTestSummary.entitlementFound, false);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, false);
  assert.equal(vm.specialPartsUserTest.entitlementFound, false);
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, false);
  assert.equal(vm.specialPartsEntitlementPreview.entitlementStatus, "none");
});

test("show-special-parts toggle without entitlement does not expose parts", () => {
  const result = derive({ specialPartsTestPrincipal: UNKNOWN_EMAIL, showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: UNKNOWN_EMAIL, showEntitlementBackedSpecialParts: true });

  assert.equal(result.specialPartsUserTestSummary.showEntitlementBackedSpecialParts, true);
  assert.equal(result.specialPartsUserTestSummary.entitlementFound, false);
  assert.equal(result.specialPartsUserTestSummary.specialPartsVisible, false);
  assert.equal(result.specialPartsUserTestSummary.redactedCandidates.length, 0);
  assert.equal(vm.specialPartsUserTest.specialPartsVisible, false);
  assert.equal(vm.specialPartsEntitlementPreview.redactedEntitlementCount, 0);
});

test("entitlement-visible special parts remain production-blocked", () => {
  const result = derive({ specialPartsTestPrincipal: ALLAN_EMAIL, showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: ALLAN_EMAIL, showEntitlementBackedSpecialParts: true });

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
  const result = derive({ specialPartsTestPrincipal: ALLAN_EMAIL, showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: ALLAN_EMAIL, showEntitlementBackedSpecialParts: true });
  const container = renderedContainer(vm);
  const card = visibleSpecialPartsCard(container);

  assert.match(elementText(card), /Internal special-parts user\/principal test mode/);
  assert.match(elementText(card), /Test user \/ principal/);
  assert.match(elementText(card), /Allan Organ/);
  assert.match(elementText(card), /first name Allan/);
  assert.match(elementText(card), /last name Organ/);
  assert.match(elementText(card), /company Zencontrol/);
  assert.match(elementText(card), /entitlement found yes/);
  assert.match(elementText(card), /special parts visible yes/);
  assert.match(elementText(card), /production outputs blocked/);

  const principalSelect = elementDescendants(card).find((element) => element.tagName === "SELECT" && element.dataset.specialPartsUserTestControl === "testPrincipal");
  const toggleInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.specialPartsUserTestControl === "showSpecialParts");
  assert.ok(principalSelect, "expected principal select control");
  assert.ok(toggleInput, "expected show-special-parts toggle");
  assert.ok(principalSelect.options.some((option) => option.value === ALLAN_EMAIL && option.textContent === ALLAN_LABEL));
  assert.ok(principalSelect.options.some((option) => option.value === UNKNOWN_EMAIL && option.textContent === UNKNOWN_LABEL));

  const timelineCard = elementDescendants(container).find((element) => (
    classIncludes(element, "cs-selector-timeline-status-test")
    && element.dataset.timelineControlsSurface === "visible-shell"
  ));
  assert.ok(timelineCard, "existing timeline/status controls should still render in visible shell");
});

test("special-parts user controls call existing state actions with email key", () => {
  const result = derive({ specialPartsTestPrincipal: UNKNOWN_EMAIL, showSpecialParts: "1" });
  const vm = model(result, { testPrincipal: UNKNOWN_EMAIL, showEntitlementBackedSpecialParts: true });
  const actions = [];
  vm.selectorSurface.specialPartsUserTest = {
    ...vm.selectorSurface.specialPartsUserTest,
    setTestPrincipal(value) { actions.push(["principal", value]); },
    setShowEntitlementBackedSpecialParts(enabled) { actions.push(["show", enabled]); },
  };

  const card = visibleSpecialPartsCard(renderedContainer(vm));
  const principalSelect = elementDescendants(card).find((element) => element.tagName === "SELECT" && element.dataset.specialPartsUserTestControl === "testPrincipal");
  assert.equal(principalSelect.value, UNKNOWN_EMAIL);
  principalSelect.value = ALLAN_EMAIL;
  principalSelect.eventListeners.change();

  const toggleInput = elementDescendants(card).find((element) => element.tagName === "INPUT" && element.dataset.specialPartsUserTestControl === "showSpecialParts");
  toggleInput.checked = false;
  toggleInput.eventListeners.change();

  assert.deepEqual(actions, [
    ["principal", ALLAN_EMAIL],
    ["show", false],
  ]);
});

test("special-parts user query parser and fingerprint include safe diagnostic email params", () => {
  const requestUrl = {
    searchParams: {
      get(key) {
        return { specialPartsTestPrincipal: ALLAN_EMAIL, showSpecialParts: "1" }[key] || "";
      },
      getAll() { return []; },
    },
  };
  assert.deepEqual(readSelectorSpecialPartsUserTestOptions(requestUrl), {
    specialPartsTestPrincipal: ALLAN_EMAIL,
    showSpecialParts: "1",
  });

  const base = selectorConstraintFingerprintFromQuery("?system=DNX+80+DI");
  const special = selectorConstraintFingerprintFromQuery(`?system=DNX+80+DI&specialPartsTestPrincipal=${encodeURIComponent(ALLAN_EMAIL)}&showSpecialParts=1`);
  assert.notEqual(special, base);
  assert.match(special, /specialPartsTestPrincipal=allan%40zencontrol\.com/);
  assert.match(special, /showSpecialParts=1/);
});
