import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { buildSelectorRunAccessoryPlacementPreview } from "../packages/modules/cs-selector/selectorRunAccessoryPlacementPreview.js";

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

function baseRuns(overrides = {}) {
  return [
    { id: "run-a", runNumber: 1, label: "Boardroom", quantity: 2, runLengthMm: "3500", lengthMode: "cut_to_length", ...overrides },
  ];
}

function baseIntent(overrides = {}) {
  return {
    intentId: "intent-a",
    runReference: "run-a",
    accessoryTypeToken: "sensor",
    quantityReceivingAccessory: 1,
    placementPreference: "mid",
    status: "confirmed",
    notes: "safe display note",
    ...overrides,
  };
}

function previewFor({ runs = baseRuns(), intents = [baseIntent()] } = {}) {
  return buildSelectorRunAccessoryPlacementPreview({ runs, intents });
}

function viewModelPreviewFor({ runs = baseRuns(), intents = [baseIntent()] } = {}) {
  const selectorState = createSelectorState();
  selectorState.setRunIntakeRows(runs);
  selectorState.setRunAccessoryPlacementIntents(intents);
  return createModel(selectorState).selectorSurface.runAccessoryPlacementPreview;
}

function assertDownstreamBlocked(preview) {
  assert.equal(preview.accessoryReservationReady, false);
  assert.equal(preview.accessoryReservationExecuted, false);
  assert.equal(preview.accessoryReservationPayloadExposed, false);
  assert.equal(preview.enginePayloadReady, false);
  assert.equal(preview.engineVerifyReady, false);
  assert.equal(preview.runTableReady, false);
  assert.equal(preview.iesReady, false);
  assert.equal(preview.rawAccessoryRowsExposed, false);
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
    "accessory-reservation-not-approved",
    "engine-verify-not-approved",
    "runtable-generation-not-approved",
    "ies-generation-not-approved",
  ]);
}

test("valid run accessory intent appears in preview", () => {
  const preview = previewFor();
  const [group] = preview.safeRunAccessoryIntentSummaries;
  const [intent] = group.intents;

  assert.equal(preview.runAccessoryPlacementPreviewReady, true);
  assert.equal(preview.accessoryIntentCount, 1);
  assert.equal(preview.runsWithAccessoryIntentCount, 1);
  assert.equal(preview.unresolvedAccessoryIntentCount, 0);
  assert.equal(group.runLabel, "Boardroom");
  assert.equal(intent.accessoryTypeToken, "sensor");
  assert.equal(intent.quantityReceivingAccessory, 1);
  assert.equal(intent.placementPreference, "mid");
  assert.equal(intent.status, "confirmed");
  assert.equal(intent.safePreviewOnly, true);
  assertDownstreamBlocked(preview);
});

test("zero accessory intents are valid for empty primary run proof", () => {
  const preview = previewFor({ intents: [] });
  const summary = Object.fromEntries(preview.summaryRows);

  assert.equal(preview.runAccessoryPlacementPreviewReady, true);
  assert.equal(preview.accessoryIntentCount, 0);
  assert.equal(preview.runsWithAccessoryIntentCount, 0);
  assert.equal(preview.unresolvedAccessoryIntentCount, 0);
  assert.deepEqual(preview.safeRunAccessoryIntentSummaries, []);
  assert.deepEqual(preview.safeAccessoryIntentRows, []);
  assert.deepEqual(preview.missingOrInvalidDiagnostics, []);
  assert.equal(summary.runAccessoryPlacementPreviewReady, "true");
  assert.equal(summary.accessoryIntentCount, "0");
  assertDownstreamBlocked(preview);
});

test("malformed accessory intent source does not count as zero-accessory ready", () => {
  const preview = buildSelectorRunAccessoryPlacementPreview({ runs: baseRuns(), intents: { accessoryTypeToken: "sensor" } });

  assert.equal(preview.runAccessoryPlacementPreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /invalid-accessory-intents-source/);
});

test("accessory quantity cannot exceed run quantity", () => {
  const preview = previewFor({ intents: [baseIntent({ quantityReceivingAccessory: 3 })] });

  assert.equal(preview.runAccessoryPlacementPreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /accessory-quantity-exceeds-run-quantity/);
  assertDownstreamBlocked(preview);
});

test("unknown run reference fails closed", () => {
  const preview = previewFor({ intents: [baseIntent({ runReference: "run-z" })] });

  assert.equal(preview.runAccessoryPlacementPreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /unknown-run-reference/);
  assertDownstreamBlocked(preview);
});

test("missing accessory type fails closed", () => {
  const preview = previewFor({ intents: [baseIntent({ accessoryTypeToken: "" })] });

  assert.equal(preview.runAccessoryPlacementPreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /missing-accessory-type/);
  assertDownstreamBlocked(preview);
});

test("unsupported accessory type fails closed", () => {
  const preview = previewFor({ intents: [baseIntent({ accessoryTypeToken: "raw-donor-accessory-id" })] });

  assert.equal(preview.runAccessoryPlacementPreviewReady, false);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /unsupported-accessory-type/);
  assertDownstreamBlocked(preview);
});

test("specific-mm placement requires valid placementMm", () => {
  const missing = previewFor({ intents: [baseIntent({ placementPreference: "specific-mm", placementMm: "" })] });
  const invalid = previewFor({ intents: [baseIntent({ placementPreference: "specific-mm", placementMm: "centre" })] });
  const valid = previewFor({ intents: [baseIntent({ placementPreference: "specific-mm", placementMm: "1200", reservationWidthMm: "80", reservationIntentBand: "width-only intent band" })] });

  assert.equal(missing.runAccessoryPlacementPreviewReady, false);
  assert.match(missing.missingOrInvalidDiagnostics.join("|"), /missing-placement-mm/);
  assert.equal(invalid.runAccessoryPlacementPreviewReady, false);
  assert.match(invalid.missingOrInvalidDiagnostics.join("|"), /invalid-placement-mm/);
  assert.equal(valid.runAccessoryPlacementPreviewReady, true);
  assert.equal(valid.safeAccessoryIntentRows[0].placementMm, 1200);
  assert.equal(valid.safeAccessoryIntentRows[0].reservationWidthMm, 80);
  assert.equal(valid.safeAccessoryIntentRows[0].reservationIntentBand, "width-only intent band");
  assertDownstreamBlocked(valid);
});

test("unresolved placement blocks readiness", () => {
  const preview = previewFor({ intents: [baseIntent({ placementPreference: "unresolved", status: "unresolved" })] });

  assert.equal(preview.runAccessoryPlacementPreviewReady, false);
  assert.equal(preview.unresolvedAccessoryIntentCount, 1);
  assert.match(preview.missingOrInvalidDiagnostics.join("|"), /placement-unresolved/);
  assertDownstreamBlocked(preview);
});

test("same-length run with only one accessory quantity remains safe intent only", () => {
  const preview = previewFor({
    runs: baseRuns({ quantity: 4, lengthMode: "same-length" }),
    intents: [baseIntent({ quantityReceivingAccessory: 1 })],
  });
  const [intent] = preview.safeAccessoryIntentRows;

  assert.equal(preview.runAccessoryPlacementPreviewReady, true);
  assert.equal(intent.sameLengthRunIntentOnly, true);
  assert.equal(intent.quantityReceivingAccessory, 1);
  assert.equal(intent.accessoryReservationExecuted, false);
  assert.equal(intent.enginePayloadIncluded, false);
  assert.equal(intent.runTableIncluded, false);
  assert.equal(intent.iesIncluded, false);
  assertDownstreamBlocked(preview);
});

test("view-model exposes run accessory placement readiness flags without downstream enablement", () => {
  const preview = viewModelPreviewFor();
  const summary = Object.fromEntries(preview.summaryRows);

  assert.equal(summary.runAccessoryPlacementPreviewReady, "true");
  assert.equal(summary.accessoryIntentCount, "1");
  assert.equal(summary.runsWithAccessoryIntentCount, "1");
  assert.equal(summary.unresolvedAccessoryIntentCount, "0");
  assert.equal(summary.accessoryReservationReady, "false");
  assert.equal(summary.enginePayloadReady, "false");
  assert.equal(summary.engineVerifyReady, "false");
  assert.equal(summary.runTableReady, "false");
  assert.equal(summary.iesReady, "false");
  assertDownstreamBlocked(preview);
});

test("run accessory placement state is local and does not persist selected result", () => {
  const selectorState = createSelectorState();
  selectorState.setRunIntakeRows(baseRuns());
  selectorState.setRunAccessoryPlacementIntents([baseIntent()]);
  const snapshot = selectorState.getSnapshot();
  const model = createModel(selectorState);

  assert.equal(snapshot.runAccessoryPlacement.previewOnly, true);
  assert.equal(snapshot.runAccessoryPlacement.writes, false);
  assert.equal(model.selectorSurface.selectedEngineResultHandoff.selectedResultPersistenceEnabled, false);
  assert.equal(model.selectorSurface.runAccessoryPlacementPreview.selectedResultPersisted, false);
  assert.equal(model.selectorSurface.runAccessoryPlacementPreview.runtimeDataMutated, false);
});

test("runtime Selector accessory placement files do not execute reservation, Engine, routes, POST, RunTable, or IES", () => {
  const files = [
    "packages/modules/cs-selector/selectorRunAccessoryPlacementPreview.js",
    "packages/modules/cs-selector/selectorState.js",
    "packages/modules/cs-selector/selectorViewModel.js",
    "packages/modules/cs-selector/selectorView.js",
  ];
  const combined = files.map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8")).join("\n");

  assert.equal(/runSelectorEngine\s*\(/.test(combined), false);
  assert.equal(/reserveAccessory|accessoryReservationKernel|runAccessoryReservation/.test(combined), false);
  assert.equal(/fetch\s*\(/.test(combined), false);
  assert.equal(/method\s*:\s*["']POST["']/.test(combined), false);
  assert.equal(/app\.(post|route)\s*\(/.test(combined), false);
  assert.equal(/router\.(post|route)\s*\(/.test(combined), false);
  assert.equal(/buildRunTable|generateRunTable/.test(combined), false);
  assert.equal(/generateIes|writeIes|writeIES/.test(combined), false);
});
