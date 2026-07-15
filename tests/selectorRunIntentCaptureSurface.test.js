import test from "node:test";
import assert from "node:assert/strict";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { renderSelectorView } from "../packages/modules/cs-selector/selectorView.js";

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
        authority: { owner: "shell", status: "fallback", source: "shell-safe-fallback" },
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

function selectorReferenceStatus() {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: { present: true, readable: true, parseable: true },
    selectorOptions: {
      status: "loaded",
      sourceReady: true,
      candidateSummary: { state: "default preview" },
      fields: [],
      workflowSections: [
        { sectionKey: "system", title: "System", fields: [] },
        { sectionKey: "runsPreview", title: "Runs & Disabled Outputs", fields: [] },
      ],
      manualConstraints: [],
      autoConsequences: [],
      blockedItems: [],
      pathToSpecReady: [],
    },
    sourceReadiness: {
      completeEnoughForPreview: true,
      referenceOptionSourceCoverage: {
        sourceBackedFieldCount: 0,
        futureMappedFieldCount: 0,
      },
    },
  };
}

function createModel(selectorState) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(),
  });
}

class SelectorRunIntentElement {
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
    this.open = false;
    this.disabled = false;
    this.min = "";
    this.step = "";
    this.inputMode = "";
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
      return new SelectorRunIntentElement(tagName);
    },
  };
  try {
    return callback();
  } finally {
    globalThis[documentKey] = previousDocument;
  }
}

function descendants(element) {
  return [element, ...(element.children || []).flatMap(descendants)];
}

function renderModel(model) {
  return withTestDocument(() => {
    const container = globalThis["doc" + "ument"].createElement("div");
    renderSelectorView(container, model);
    return container;
  });
}

function runIntentControl(container, fieldKey) {
  return descendants(container).find((element) => element.dataset.fieldKey === fieldKey) || null;
}

function descendantText(container) {
  return descendants(container).map((element) => element.textContent).filter(Boolean).join("\n");
}

test("blank real UI state derives one incomplete safe Run 1 row and renders dedicated controls", () => {
  const selectorState = createSelectorState();
  const model = createModel(selectorState);
  const capture = model.singleRunIntentCapture;
  const preview = model.runIntakePreview;
  const container = renderModel(model);
  const runsPreviewSection = descendants(container).find((element) => element.dataset.workflowSection === "runsPreview");

  assert.ok(runsPreviewSection);
  assert.ok(descendants(runsPreviewSection).some((element) => element.dataset.singleRunIntentCapture === "module-local"));
  assert.equal(runIntentControl(runsPreviewSection, "runQty")?.type, "number");
  assert.equal(runIntentControl(runsPreviewSection, "runLength")?.type, "number");
  assert.equal(runIntentControl(runsPreviewSection, "runLengthMode")?.tagName, "SELECT");
  assert.equal(runIntentControl(runsPreviewSection, "runCount"), null);
  assert.match(descendantText(runsPreviewSection), /Single-run intent capture active · Production outputs remain disabled\./);
  assert.match(descendantText(runsPreviewSection), /Run 1/);
  assert.doesNotMatch(descendantText(runsPreviewSection), /No active controls in this section yet/);

  assert.equal(capture.fixedLabel, "Run 1");
  assert.equal(capture.runCountDerived, true);
  assert.equal(capture.multiRunEditingEnabled, false);
  assert.equal(capture.compatibilityFallbackUsed, false);
  assert.equal(preview.runCount, 1);
  assert.equal(preview.completedRunCount, 0);
  assert.equal(preview.incompleteRunCount, 1);
  assert.equal(preview.runIntakePreviewReady, false);
  assert.equal(capture.completionCopy, "0/1 complete");
  assert.match(capture.missingFieldExplanation, /quantity is required/);
  assert.match(capture.missingFieldExplanation, /run length is required/);
  assert.match(capture.missingFieldExplanation, /length mode is required/);
  assert.deepEqual(preview.runs[0], {
    id: "run-1",
    runNumber: 1,
    label: "Run 1",
    quantity: "",
    runLengthMm: "",
    lengthMode: "",
    complete: false,
    diagnostics: ["missing-run-quantity", "missing-run-length", "missing-length-mode"],
  });
});

test("visible controls commit the three existing DB-backed constraints and produce one complete safe run", () => {
  const selectorState = createSelectorState();
  const initialModel = createModel(selectorState);
  const container = renderModel(initialModel);

  const quantity = runIntentControl(container, "runQty");
  const length = runIntentControl(container, "runLength");
  const mode = runIntentControl(container, "runLengthMode");
  quantity.value = "2";
  quantity.eventListeners.input();
  length.value = "3500";
  length.eventListeners.input();
  mode.value = "cut_to_length";
  mode.eventListeners.change();

  const model = createModel(selectorState);
  const capture = model.singleRunIntentCapture;
  const preview = model.runIntakePreview;
  const localConstraints = model.local.dbBackedSelector.manualConstraints;

  assert.equal(localConstraints.runQty.value, "2");
  assert.equal(localConstraints.runLength.value, "3500");
  assert.equal(localConstraints.runLengthMode.value, "cut_to_length");
  assert.equal(capture.committedConstraintsAuthoritative, true);
  assert.equal(capture.compatibilityFallbackUsed, false);
  assert.equal(capture.completionCopy, "1/1 complete");
  assert.equal(capture.missingFieldExplanation, "Run 1 is complete as safe intent. Production outputs remain disabled.");
  assert.equal(preview.runCount, 1);
  assert.equal(preview.completedRunCount, 1);
  assert.equal(preview.incompleteRunCount, 0);
  assert.equal(preview.runIntakePreviewReady, true);
  assert.deepEqual(preview.safeRunIntentSummaries[0], {
    id: "run-1",
    runNumber: 1,
    label: "Run 1",
    quantity: 2,
    runLengthMm: 3500,
    lengthMode: "cut_to_length",
    sameLengthQuantityIntent: false,
    status: "complete-safe-preview-intent",
    safePreviewOnly: true,
    enginePayloadIncluded: false,
    runTableIncluded: false,
    iesIncluded: false,
    writes: false,
    diagnostics: [],
  });
  assert.equal(model.selectorSurface.runAccessoryPlacementPreview.runAccessoryPlacementPreviewReady, true);
  assert.equal(model.selectorSurface.runAccessoryPlacementPreview.accessoryIntentCount, 0);
  assert.equal(capture.accessoryPlacementControlsEnabled, false);
  assert.equal(capture.engineInvocationEnabled, false);
  assert.equal(capture.runTableGenerationEnabled, false);
  assert.equal(capture.payloadGenerationEnabled, false);
  assert.equal(capture.iesGenerationEnabled, false);
  assert.equal(capture.drawingGenerationEnabled, false);
  assert.equal(capture.proofGenerationEnabled, false);
  assert.equal(capture.persistenceEnabled, false);
  assert.equal(model.selectorSurface.enginePayloadReady, false);
  assert.equal(model.selectorSurface.runTableReady, false);
  assert.equal(model.selectorSurface.iesReady, false);

  const eligibility = model.selectorSurface.preEngineReadonlyActionEligibilityProjection;
  assert.equal(Object.isFrozen(eligibility), true);
  assert.equal(eligibility.runIntakePreviewReady, true);
  assert.equal(eligibility.factoryApprovedInputsReady, false);
  assert.equal(eligibility.candidateMapperReady, false);
  assert.equal(eligibility.ready, false);
  assert.equal(eligibility.readiness, "blocked_fail_closed");
  assert.equal(
    JSON.stringify(eligibility).includes("safeRunIntentSummaries"),
    false,
  );
  assert.equal(JSON.stringify(eligibility).includes('"rawRows":'), false);
});

test("partial input and clearing any required committed field fail closed immediately", () => {
  const selectorState = createSelectorState();
  let model = createModel(selectorState);

  model.singleRunIntentCapture.setFieldValue("runQty", "3");
  model = createModel(selectorState);
  assert.equal(model.runIntakePreview.runIntakePreviewReady, false);
  assert.equal(model.singleRunIntentCapture.completionCopy, "0/1 complete");
  assert.deepEqual(model.runIntakePreview.runs[0].diagnostics, ["missing-run-length", "missing-length-mode"]);

  model.singleRunIntentCapture.setFieldValue("runLength", "4200");
  model.singleRunIntentCapture.setFieldValue("runLengthMode", "overall");
  model = createModel(selectorState);
  assert.equal(model.runIntakePreview.runIntakePreviewReady, true);

  model.singleRunIntentCapture.clearFieldValue("runLength");
  model = createModel(selectorState);
  assert.equal(model.runIntakePreview.runIntakePreviewReady, false);
  assert.equal(model.runIntakePreview.completedRunCount, 0);
  assert.equal(model.runIntakePreview.incompleteRunCount, 1);
  assert.deepEqual(model.runIntakePreview.runs[0].diagnostics, ["missing-run-length"]);
  assert.match(model.singleRunIntentCapture.missingFieldExplanation, /run length is required/);
});

test("committed run constraints override the programmatic local run-intake compatibility fallback", () => {
  const selectorState = createSelectorState();
  selectorState.setRunIntakeRows([
    { id: "legacy-run", runNumber: 1, label: "Legacy", quantity: 9, runLengthMm: 9000, lengthMode: "fixed" },
  ]);

  let model = createModel(selectorState);
  assert.equal(model.singleRunIntentCapture.compatibilityFallbackUsed, true);
  assert.equal(model.runIntakePreview.runIntakePreviewReady, true);
  assert.equal(model.runIntakePreview.runs[0].id, "legacy-run");

  model.singleRunIntentCapture.setFieldValue("runQty", "1");
  model = createModel(selectorState);
  assert.equal(model.singleRunIntentCapture.committedConstraintsAuthoritative, true);
  assert.equal(model.singleRunIntentCapture.compatibilityFallbackUsed, false);
  assert.equal(model.runIntakePreview.runIntakePreviewReady, false);
  assert.equal(model.runIntakePreview.runCount, 1);
  assert.equal(model.runIntakePreview.runs[0].id, "run-1");
  assert.equal(model.runIntakePreview.runs[0].label, "Run 1");
  assert.equal(model.runIntakePreview.runs[0].quantity, "1");
  assert.deepEqual(model.runIntakePreview.runs[0].diagnostics, ["missing-run-length", "missing-length-mode"]);
});
