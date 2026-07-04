import test from "node:test";
import assert from "node:assert/strict";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
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
  const field = (vm.expanderShell.manualConstraintBehaviour.controlSections || [])
    .flatMap((section) => section.fields || [])
    .find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected visible field ${fieldKey}`);
  return (field.options || []).map((option) => option.label).sort();
}

test("external default hides 80 Inlay", () => {
  const result = derive({ system: "DNX 80 DI" });
  assert.equal(result.timelineVisibilityMode, "external-default");
  assert.deepEqual(result.timelineVisibleStatuses, ["available", "approved"]);
  assert.ok(!labels(result, "directOpticVar1").includes("Inlay · 80"));
});

test("internal as-of with roadmap exposes 80 Inlay", () => {
  assert.ok(labels(derive({ system: "DNX 80 DI" }, internalRoadmap), "directOpticVar1").includes("Inlay · 80"));
});

test("selecting 80 Inlay hydrates Microprism and Antiglare", () => {
  const result = derive({ system: "DNX 80 DI", directOpticVar1: "80|Inlay" }, internalRoadmap);
  assert.deepEqual(labels(result, "directOpticVar2"), ["Antiglare", "Microprism"]);
});

test("80 Inlay stays hidden when roadmap is omitted", () => {
  const result = derive({ system: "DNX 80 DI" }, {
    timelineVisibilityMode: "internal-asof-test",
    timelineAsOfDate: "2026-08-15",
    timelineVisibleStatuses: ["available", "approved"],
  });
  assert.ok(!labels(result, "directOpticVar1").includes("Inlay · 80"));
});

test("80 Inlay stays hidden before status date", () => {
  const result = derive({ system: "DNX 80 DI" }, {
    timelineVisibilityMode: "internal-asof-test",
    timelineAsOfDate: "2026-08-14",
    timelineVisibleStatuses: ["available", "approved", "roadmap"],
  });
  assert.ok(!labels(result, "directOpticVar1").includes("Inlay · 80"));
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
  assert.equal(vm.expanderShell.timelineStatusTest.timelineAsOfDate, "2026-08-15");
  assert.ok(vm.expanderShell.timelineStatusTest.timelineVisibleStatusOptions.includes("roadmap"));
  assert.ok(vm.expanderShell.timelineStatusTest.timelineVisibleStatuses.includes("roadmap"));
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

