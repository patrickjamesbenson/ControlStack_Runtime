import test from "node:test";
import assert from "node:assert/strict";

import {
  csSelectorModule,
  selectorConstraintFingerprintFromQuery,
} from "../packages/modules/cs-selector/index.js";
import {
  SELECTOR_TEST_CASE_STORAGE_KEY,
  sanitiseSelectorTestCase,
} from "../packages/modules/cs-selector/selectorState.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((resolvePromise, rejectPromise) => {
    resolve = resolvePromise;
    reject = rejectPromise;
  });
  return { promise, resolve, reject };
}

function jsonResponse(payload, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    async json() {
      return payload;
    },
  };
}

async function flushAsyncWork() {
  for (let index = 0; index < 5; index += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
}

class SelectorColdBootElement {
  constructor(tagName = "div") {
    this.tagName = String(tagName || "div").toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.attributes = new Map();
    this.eventListeners = {};
    this.style = {};
    this.className = "";
    this.textContent = "";
    this.value = "";
    this.id = "";
    this.htmlFor = "";
    this.type = "";
    this.checked = false;
    this.open = false;
    this.disabled = false;
    this.hidden = false;
    this.scrollTop = 0;
    this.scrollLeft = 0;
  }

  appendChild(child) {
    if (child === null || child === undefined) return child;
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  append(...children) {
    for (const child of children) this.appendChild(child);
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

  setAttribute(name, value) {
    this.attributes.set(String(name), String(value));
  }

  getAttribute(name) {
    return this.attributes.get(String(name)) ?? null;
  }

  contains(candidate) {
    if (candidate === this) return true;
    return this.children.some((child) => child.contains?.(candidate));
  }

  closest(selector) {
    if (matchesSimpleSelector(this, selector)) return this;
    return this.parentNode?.closest?.(selector) || null;
  }

  querySelector(selector) {
    return elementDescendants(this).find((element) => element !== this && matchesSimpleSelector(element, selector)) || null;
  }

  querySelectorAll(selector) {
    return elementDescendants(this).filter((element) => element !== this && matchesSimpleSelector(element, selector));
  }

  focus() {}
}

function matchesSimpleSelector(element, selector = "") {
  const value = String(selector || "").trim();
  if (!value) return false;
  if (value.startsWith("#")) return element.id === value.slice(1);
  if (value.startsWith(".")) {
    const className = value.slice(1).split(/[\s[:]/, 1)[0];
    return String(element.className || "").split(/\s+/).includes(className);
  }
  const dataFieldMatch = value.match(/^\[data-field-key="([^"]+)"\]$/);
  if (dataFieldMatch) return element.dataset.fieldKey === dataFieldMatch[1];
  return element.tagName === value.toUpperCase();
}

function elementDescendants(element) {
  return [element, ...(element.children || []).flatMap(elementDescendants)];
}

function elementText(element) {
  return [element.textContent || "", ...(element.children || []).map(elementText)]
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function definitionValues(container, label) {
  const normalisedLabel = String(label).trim().toLowerCase();
  const values = [];
  for (const term of elementDescendants(container)) {
    if (term.tagName !== "DT" || String(term.textContent || "").trim().toLowerCase() !== normalisedLabel) continue;
    const siblings = term.parentNode?.children || [];
    const index = siblings.indexOf(term);
    const value = siblings[index + 1];
    if (value?.tagName === "DD") values.push(String(value.textContent || "").trim());
  }
  return values;
}

function fieldSelect(container, fieldKey) {
  return elementDescendants(container).find((element) => (
    element.tagName === "SELECT" && element.dataset.fieldKey === fieldKey
  )) || null;
}

function sourceSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", approved: "yes" },
      { system: "LNX", system_variant_1: "80", label: "LNX 80", approved: "yes" },
    ],
    OPTICS: [
      { system: "DNX", optic_var_1: "Opal", emission_permission: "Direct", approved: "yes" },
      { system: "LNX", optic_var_1: "Microprism", emission_permission: "Direct", approved: "yes" },
    ],
    SYSTEM_POLICY: [
      { category: "finish colour", item: "White;Black", approved: "yes" },
      { category: "application environment", item: "Office;Education", approved: "yes" },
    ],
  };
}

function sourceBoundOptions(constraints = {}, snapshot = sourceSnapshot()) {
  const source = { present: true, readable: true, parseable: true };
  return {
    ...deriveSelectorReferenceOptionsFromSnapshot(snapshot, {
      ok: true,
      source,
      constraints,
    }),
    sourceReady: true,
    source,
    sourceInputFingerprint: "selector-source-input-v1",
    boardDataSourceVersion: "selector-board-data-v1",
    sourceVersionBinding: {
      sourceInputFingerprint: "selector-source-input-v1",
      boardDataSourceVersion: "selector-board-data-v1",
      bindingStatus: "source-version-bound",
      optionSetsBound: true,
      selectedValuesBound: true,
      staleRevalidationEnabled: true,
      staleValuesBecomeDiagnosticUnmapped: true,
      staleValuesInsertedIntoOptions: false,
      readOnly: true,
      diagnosticOnly: true,
      writes: false,
      rawRowsExposed: false,
    },
  };
}

function selectorContext() {
  return {
    route: { moduleId: "cs_selector" },
    auth: { owner: "shell", status: "anonymous" },
    identity: { owner: "shell", status: "anonymous-fallback", currentUser: null },
    authority: { owner: "shell", status: "safe-fallback" },
    project: {
      owner: "shell",
      status: "loaded",
      metadata: { title: "Cold Boot Selector Project", projectId: "SEL-COLD-BOOT" },
      currentProject: { title: "Cold Boot Selector Project", projectId: "SEL-COLD-BOOT" },
      selection: {},
    },
    company: { owner: "shell", status: "placeholder" },
    crm: { owner: "shell", status: "placeholder", writePolicy: { enabled: false } },
    handoff: { owner: "shell", status: "deferred", available: false },
    visibility: {
      owner: "shell",
      status: "resolved",
      moduleReasons: { cs_selector: { visible: true, reason: "test" } },
      visibleModules: ["cs_selector"],
      hiddenModules: [],
      inputs: { projectMode: "auto", projectPresent: true },
    },
    timelinePolicy: {},
    flags: { owner: "shell", values: {} },
    lifecycle: {},
    diagnostics: {},
  };
}

test("cold mount retains status-backed options through pending constrained Recall and rejects stale responses", async () => {
  const previousGlobals = {
    document: globalThis.document,
    HTMLElement: globalThis.HTMLElement,
    localStorage: globalThis.localStorage,
    fetch: globalThis.fetch,
    requestAnimationFrame: globalThis.requestAnimationFrame,
  };
  const statusRequest = deferred();
  const initialOptionsRequest = deferred();
  const recalledOptionsRequest = deferred();
  const optionRequests = [initialOptionsRequest, recalledOptionsRequest];
  const fetchCalls = [];
  const storage = new Map();
  let storageWrites = 0;
  let optionRequestIndex = 0;

  const recalledTestCase = sanitiseSelectorTestCase({
    manualConstraints: {
      system: { value: "DNX|60", valueLabel: "DNX 60" },
      bodyFinish: { value: "Unavailable Bronze", valueLabel: "Unavailable Bronze" },
    },
  });
  storage.set(SELECTOR_TEST_CASE_STORAGE_KEY, JSON.stringify(recalledTestCase));

  const documentElement = new SelectorColdBootElement("html");
  const scrollingElement = new SelectorColdBootElement("main");
  const container = new SelectorColdBootElement("div");

  globalThis.HTMLElement = SelectorColdBootElement;
  globalThis.document = {
    activeElement: null,
    documentElement,
    scrollingElement,
    createElement(tagName) {
      return new SelectorColdBootElement(tagName);
    },
    querySelector() {
      return null;
    },
  };
  globalThis.requestAnimationFrame = () => 0;
  globalThis.localStorage = {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storageWrites += 1;
      storage.set(key, String(value));
    },
    removeItem(key) {
      storageWrites += 1;
      storage.delete(key);
    },
  };
  globalThis.fetch = (url, init = {}) => {
    const request = { url: String(url), method: String(init.method || "GET").toUpperCase() };
    fetchCalls.push(request);
    if (request.url === "/api/selector-reference/status") return statusRequest.promise;
    if (request.url.startsWith("/api/selector-reference/options")) {
      const pending = optionRequests[optionRequestIndex];
      optionRequestIndex += 1;
      assert.ok(pending, `unexpected Selector options request ${request.url}`);
      return pending.promise;
    }
    throw new Error(`unexpected fetch ${request.url}`);
  };

  const emittedEvents = [];
  const services = {
    eventBus: { emit(name, payload) { emittedEvents.push({ name, payload }); } },
    visibility: { canShowModule() { return true; } },
    flags: { isEnabled() { return false; } },
    identity: { hasCapability() { return false; } },
  };

  try {
    csSelectorModule.mount({ container, services, context: selectorContext() });
    assert.equal(fetchCalls.length, 2);
    assert.equal(fetchCalls[0].url, "/api/selector-reference/status");
    assert.equal(fetchCalls[1].url, "/api/selector-reference/options");

    const statusOptions = sourceBoundOptions();
    statusRequest.resolve(jsonResponse({
      ok: true,
      readOnly: true,
      diagnosticOnly: true,
      source: statusOptions.source,
      selectorOptions: statusOptions,
    }));
    await flushAsyncWork();

    const coldBootSystem = fieldSelect(container, "system");
    assert.ok(coldBootSystem, "expected populated source-backed System control while options GET is pending");
    assert.ok(coldBootSystem.options.some((option) => option.value === "DNX|60"));
    assert.match(elementText(container), /source ready/i);
    assert.ok(definitionValues(container, "candidate state").includes("loading"));
    assert.equal(definitionValues(container, "candidate state").includes("not requested"), false);

    const recallButton = elementDescendants(container).find((element) => element.dataset.selectorTestCaseAction === "recall");
    assert.ok(recallButton, "expected visible Recall action");
    assert.equal(recallButton.disabled, false);
    recallButton.eventListeners.click();

    assert.equal(fetchCalls.length, 3);
    assert.match(fetchCalls[2].url, /^\/api\/selector-reference\/options\?/);
    assert.match(fetchCalls[2].url, /system=DNX%7C60/);
    assert.match(fetchCalls[2].url, /bodyFinish=Unavailable\+Bronze/);

    const recalledSystemWhileLoading = fieldSelect(container, "system");
    assert.ok(recalledSystemWhileLoading);
    assert.equal(recalledSystemWhileLoading.value, "DNX|60");
    assert.match(elementText(container), /Unavailable Bronze/);
    assert.ok(definitionValues(container, "candidate state").includes("loading"));
    assert.equal(definitionValues(container, "candidate state").includes("not requested"), false);

    const constrainedOptions = sourceBoundOptions({
      system: "DNX|60",
      bodyFinish: "Unavailable Bronze",
    });
    recalledOptionsRequest.resolve(jsonResponse(constrainedOptions));
    await flushAsyncWork();

    const reconciledSystem = fieldSelect(container, "system");
    const reconciledFinish = fieldSelect(container, "bodyFinish");
    assert.equal(reconciledSystem.value, "DNX|60");
    assert.ok(reconciledFinish, "expected source-backed finish field after reconciliation");
    assert.equal(reconciledFinish.options.some((option) => option.value === "Unavailable Bronze"), false);
    assert.match(elementText(container), /Unavailable Bronze/);
    assert.match(elementText(container), /blocked|unavailable|incompatible/i);

    const staleOptions = sourceBoundOptions({}, {
      SYSTEM: [{ system: "STALE", system_variant_1: "SYSTEM", label: "STALE SYSTEM", approved: "yes" }],
    });
    staleOptions.constraintFingerprint = selectorConstraintFingerprintFromQuery("");
    initialOptionsRequest.resolve(jsonResponse(staleOptions));
    await flushAsyncWork();

    const afterStaleSystem = fieldSelect(container, "system");
    assert.equal(afterStaleSystem.value, "DNX|60");
    assert.equal(afterStaleSystem.options.some((option) => option.value === "STALE|SYSTEM"), false);
    assert.doesNotMatch(elementText(container), /STALE SYSTEM/);

    assert.equal(storageWrites, 0, "Recall must remain browser-local read-only and must not write storage");
    assert.ok(fetchCalls.every((call) => call.method === "GET"));
    const productionActions = elementDescendants(container).filter((element) => element.dataset.productionAction);
    assert.ok(productionActions.length > 0, "expected visible locked production action diagnostics");
    assert.ok(productionActions.every((element) => element.dataset.enabled === "false"));
    assert.ok(productionActions.every((element) => element.children.some((child) => child.tagName === "BUTTON" && child.disabled === true)));
    assert.match(elementText(container), /writes disabled/i);
    assert.ok(emittedEvents.some((event) => event.name === "selector:mounted"));
  } finally {
    csSelectorModule.unmount();
    globalThis.document = previousGlobals.document;
    globalThis.HTMLElement = previousGlobals.HTMLElement;
    globalThis.localStorage = previousGlobals.localStorage;
    globalThis.fetch = previousGlobals.fetch;
    globalThis.requestAnimationFrame = previousGlobals.requestAnimationFrame;
  }
});
