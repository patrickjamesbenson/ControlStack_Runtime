import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { buildSelectorRunIntakePreview } from "../packages/modules/cs-selector/selectorRunIntakePreview.js";

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
      candidateSummary: { state: "default preview" },
      fields: [],
      workflowSections: [],
      manualConstraints: [],
      autoConsequences: [],
      blockedItems: [],
      pathToSpecReady: [],
    },
  };
}

function createModel(selectorState = createSelectorState()) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(),
  });
}

function previewForRuns(runs) {
  const selectorState = createSelectorState();
  selectorState.setRunIntakeRows(runs);
  const model = createModel(selectorState);
  return model.selectorSurface.runIntakePreview;
}

function assertDownstreamBlocked(preview) {
  assert.equal(preview.enginePayloadReady, false);
  assert.equal(preview.engineVerifyReady, false);
  assert.equal(preview.runTableReady, false);
  assert.equal(preview.iesReady, false);
  assert.equal(preview.rawEnginePayloadExposed, false);
  assert.equal(preview.donorEngineInvoked, false);
  assert.equal(preview.runtimeDataMutated, false);
  assert.equal(preview.selectedResultPersisted, false);
  assert.equal(preview.runTableGenerated, false);
  assert.equal(preview.iesGenerated, false);
  assert.equal(preview.routesAdded, false);
  assert.equal(preview.postEndpointsAdded, false);
  assert.equal(preview.writes, false);
  assert.equal(preview.generation, false);
  assert.equal(preview.proof, false);
  assert.deepEqual(preview.failClosedDiagnostics, [
    "engine-verify-not-approved",
    "runtable-generation-not-approved",
    "ies-generation-not-approved",
  ]);
}

test("valid run intake appears in safe preview without Engine payload exposure", () => {
  const preview = previewForRuns([
    { id: "run-a", runNumber: 1, label: "Boardroom", quantity: 2, runLengthMm: "3500"},
  ]);

  assert.equal(preview.runIntakePreviewReady, true);
  assert.equal(preview.runCount, 1);
  assert.equal(preview.totalQuantity, 2);
  assert.equal(preview.completedRunCount, 1);
  assert.equal(preview.incompleteRunCount, 0);
  assert.equal(preview.safeRunIntentSummaries.length, 1);
  assert.deepEqual(preview.safeRunIntentSummaries[0], {
    id: "run-a",
    runNumber: 1,
    label: "Boardroom",
    quantity: 2,
    runLengthMm: 3500,
    status: "complete-safe-preview-intent",
    safePreviewOnly: true,
    enginePayloadIncluded: false,
    runTableIncluded: false,
    iesIncluded: false,
    writes: false,
    diagnostics: [],
  });
  assertDownstreamBlocked(preview);
});

test("missing length blocks completion", () => {
  const preview = buildSelectorRunIntakePreview([
    { id: "run-a", label: "Boardroom", quantity: 1, runLengthMm: ""},
  ]);

  assert.equal(preview.runIntakePreviewReady, false);
  assert.equal(preview.completedRunCount, 0);
  assert.equal(preview.incompleteRunCount, 1);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /missing-run-length/);
  assertDownstreamBlocked(preview);
});

test("missing quantity blocks completion", () => {
  const preview = buildSelectorRunIntakePreview([
    { id: "run-a", label: "Boardroom", quantity: "", runLengthMm: "3500"},
  ]);

  assert.equal(preview.runIntakePreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /missing-run-quantity/);
  assertDownstreamBlocked(preview);
});

test("invalid quantity blocks completion", () => {
  const preview = buildSelectorRunIntakePreview([
    { id: "run-a", label: "Boardroom", quantity: "two", runLengthMm: "3500"},
  ]);

  assert.equal(preview.runIntakePreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /invalid-run-quantity/);
  assertDownstreamBlocked(preview);
});

test("legacy mode-shaped inputs are ignored while positive quantity and physical length remain complete", () => {
  const preview = buildSelectorRunIntakePreview([
    { id: "run-a", label: "Boardroom", quantity: 1, runLengthMm: "3500", legacyMode: "engine_decides" },
  ]);
  assert.equal(preview.runIntakePreviewReady, true);
  assert.equal(preview.safeRunIntentSummaries[0].quantity, 1);
  assert.equal(preview.safeRunIntentSummaries[0].runLengthMm, 3500);
  assert.equal(Object.hasOwn(preview.safeRunIntentSummaries[0], "legacyMode"), false);
  assertDownstreamBlocked(preview);
});

test("missing run label fails closed", () => {
  const preview = buildSelectorRunIntakePreview([
    { id: "run-a", label: "", quantity: 1, runLengthMm: "3500"},
  ]);

  assert.equal(preview.runIntakePreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /missing-run-label/);
  assertDownstreamBlocked(preview);
});

test("multiple quantity preserves quantity and physical length without shared-length interpretation", () => {
  const preview = buildSelectorRunIntakePreview([
    { id: "run-a", label: "Typical classroom", quantity: 4, runLengthMm: "2800" },
  ]);
  const [intent] = preview.safeRunIntentSummaries;
  assert.equal(preview.runIntakePreviewReady, true);
  assert.equal(preview.totalQuantity, 4);
  assert.equal(intent.quantity, 4);
  assert.equal(intent.runLengthMm, 2800);
  assert.equal(intent.enginePayloadIncluded, false);
  assert.equal(intent.runTableIncluded, false);
  assert.equal(intent.iesIncluded, false);
  assertDownstreamBlocked(preview);
});

test("run intake state is local and does not persist selected result", () => {
  const selectorState = createSelectorState();
  selectorState.setRunIntakeRows([
    { id: "run-a", label: "Boardroom", quantity: 1, runLengthMm: "3500"},
  ]);
  const snapshot = selectorState.getSnapshot();
  const model = createModel(selectorState);

  assert.equal(snapshot.runIntake.previewOnly, true);
  assert.equal(snapshot.runIntake.writes, false);
  assert.equal(model.selectorSurface.selectedEngineResultHandoff.selectedResultPersistenceEnabled, false);
  assert.equal(model.selectorSurface.runIntakePreview.selectedResultPersisted, false);
  assert.equal(model.selectorSurface.runIntakePreview.runtimeDataMutated, false);
});

test("run intake view-model summary exposes readiness flags without raw payloads", () => {
  const preview = previewForRuns([
    { id: "run-a", label: "Boardroom", quantity: 2, runLengthMm: "3500"},
    { id: "run-b", label: "Corridor", quantity: 1, runLengthMm: "4200"},
  ]);
  const summary = Object.fromEntries(preview.summaryRows);

  assert.equal(summary.runIntakePreviewReady, "true");
  assert.equal(summary.runCount, "2");
  assert.equal(summary.totalQuantity, "3");
  assert.equal(summary.completedRunCount, "2");
  assert.equal(summary.incompleteRunCount, "0");
  assert.equal(summary.enginePayloadReady, "false");
  assert.equal(summary.engineVerifyReady, "false");
  assert.equal(summary.runTableReady, "false");
  assert.equal(summary.iesReady, "false");
  assertDownstreamBlocked(preview);
});

test("runtime Selector files do not add Engine invocation, routes, or POST endpoints", () => {
  const files = [
    "packages/modules/cs-selector/selectorRunIntakePreview.js",
    "packages/modules/cs-selector/selectorState.js",
    "packages/modules/cs-selector/selectorViewModel.js",
    "packages/modules/cs-selector/selectorView.js",
  ];
  const combined = files.map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8")).join("\n");

  assert.equal(/runSelectorEngine\s*\(/.test(combined), false);
  assert.equal(/fetch\s*\(/.test(combined), false);
  assert.equal(/method\s*:\s*["']POST["']/.test(combined), false);
  assert.equal(/app\.(post|route)\s*\(/.test(combined), false);
  assert.equal(/router\.(post|route)\s*\(/.test(combined), false);
});