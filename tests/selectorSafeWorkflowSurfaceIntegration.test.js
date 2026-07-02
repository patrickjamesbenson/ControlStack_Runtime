import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";

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
      fields: [
        { fieldKey: "system", label: "System", options: [{ value: "source-backed-system", label: "Source backed system" }] },
        { fieldKey: "bodyFinish", label: "Body finish", options: [{ value: "white", label: "White" }] },
      ],
      workflowSections: [
        { sectionKey: "system", title: "System", fields: [] },
        { sectionKey: "runs", title: "Runs", fields: [] },
      ],
      manualConstraints: [],
      autoConsequences: [],
      blockedItems: [],
      pathToSpecReady: [],
    },
    sourceReadiness: {
      completeEnoughForPreview: true,
      referenceOptionSourceCoverage: {
        sourceBackedFieldCount: 2,
        futureMappedFieldCount: 0,
      },
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

function createRunReadyState() {
  const selectorState = createSelectorState();
  selectorState.setRunIntakeRows([
    { id: "run-a", runNumber: 1, label: "Boardroom", quantity: 2, runLengthMm: "3500", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    {
      intentId: "intent-a",
      runReference: "run-a",
      accessoryTypeToken: "sensor",
      quantityReceivingAccessory: 1,
      placementPreference: "mid",
      status: "confirmed",
      notes: "safe display note",
    },
  ]);
  return selectorState;
}

function stageMap(workflow) {
  return new Map(workflow.selectorWorkflowStageSummaries.map((stage) => [stage.id, stage]));
}

function actionMap(workflow) {
  return new Map(workflow.disabledProductionActions.map((action) => [action.id, action]));
}

function findTrueBlockedFlags(value, path = []) {
  if (value === null || value === undefined) return [];
  if (Array.isArray(value)) return value.flatMap((entry, index) => findTrueBlockedFlags(entry, [...path, String(index)]));
  if (typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, nested]) => {
    const nextPath = [...path, key];
    const blocked = /(?:raw.*(?:Returned|Exposed)|donorEngineInvoked|runtimeDataMutated|selectedResultPersisted|runTableGenerated|iesGenerated|routesAdded|postEndpointsAdded|hubSpotWriteEnabled|projectWriteEnabled|exactElectricalValuesReturned|base64ArtifactsReturned|candelaArraysReturned|rawRowsPayloadsPrivateDataExposed)$/i.test(key)
      && nested === true;
    return blocked ? [nextPath.join(".")] : findTrueBlockedFlags(nested, nextPath);
  });
}

test("Selector view-model exposes a safe workflow preview and downstream readiness aliases", () => {
  const model = createModel(createRunReadyState());
  const workflow = model.selectorWorkflowPreview;

  assert.ok(workflow, "workflow preview should exist at view-model top level");
  assert.strictEqual(workflow, model.selectorSurface.selectorWorkflowPreview);
  assert.strictEqual(model.selectorWorkflowPreviewReady, false);
  assert.strictEqual(model.selectorWorkflowStageSummaries, workflow.selectorWorkflowStageSummaries);
  assert.strictEqual(model.selectorWorkflowBlockedSummary, workflow.selectorWorkflowBlockedSummary);
  assert.strictEqual(model.selectorDownstreamReadinessSummary, workflow.selectorDownstreamReadinessSummary);
  assert.equal(workflow.title, "Selector workflow readiness — preview only");
  assert.equal(workflow.previewOnly, true);
  assert.equal(workflow.diagnosticOnly, true);
  assert.equal(workflow.safeSummaryOnly, true);
});

test("all safe Selector workflow stages appear with ready, blocked, or review-required labels", () => {
  const workflow = createModel(createRunReadyState()).selectorWorkflowPreview;
  const stages = stageMap(workflow);

  for (const id of [
    "selected-reference-values",
    "mount-uplight-compatibility",
    "finish-cascade",
    "timeline-status-gate",
    "run-intake-preview",
    "accessory-placement-intent-preview",
    "special-parts-entitlement-preview",
    "safe-draft-project-envelope-preview",
    "safe-hydrate-validation-preview",
  ]) {
    assert.ok(stages.has(id), `${id} should be surfaced`);
    assert.match(stages.get(id).status, /^(ready|blocked|review-required)$/);
    assert.equal(stages.get(id).previewOnly, true);
    assert.equal(stages.get(id).diagnosticOnly, true);
  }

  assert.equal(stages.get("run-intake-preview").ready, true);
  assert.equal(stages.get("accessory-placement-intent-preview").ready, true);
  assert.equal(stages.get("safe-draft-project-envelope-preview").blocked, true);
  assert.equal(stages.get("safe-hydrate-validation-preview").blocked, true);
});

test("downstream readiness is displayed but production actions remain disabled", () => {
  const workflow = createModel(createRunReadyState()).selectorWorkflowPreview;
  const downstream = workflow.selectorDownstreamReadinessSummary;
  const downstreamIds = downstream.stages.map((stage) => stage.id);
  const actions = actionMap(workflow);
  const evidence = downstream.controlledRealSourceEvidenceStatus;

  assert.deepEqual(downstreamIds, [
    "sealed-candidate-assembly",
    "runtable-domain",
    "selected-result-handoff",
    "ies-handoff",
    "controlled-real-source-evidence",
  ]);
  assert.equal(downstream.runEngineEnabled, false);
  assert.equal(downstream.runTableGenerationEnabled, false);
  assert.equal(downstream.iesGenerationEnabled, false);
  assert.equal(downstream.selectedResultPersistenceEnabled, false);
  assert.equal(downstream.hubSpotProjectWritesEnabled, false);
  assert.equal(actions.get("runEngine").label, "Run Engine disabled");
  assert.equal(actions.get("runTableGeneration").label, "RunTable generation disabled");
  assert.equal(actions.get("iesGeneration").label, "IES generation disabled");
  assert.equal(actions.get("selectedResultPersistence").label, "selected-result persistence disabled");
  assert.equal(actions.get("hubSpotProjectWrites").label, "HubSpot/project writes disabled");
  assert.equal(actions.get("runEngine").enabled, false);
  assert.equal(evidence.status, "diagnostic-only-available-not-invoked");
  assert.equal(evidence.helperAvailable, true);
  assert.equal(evidence.runtimeDataRead, false);
  assert.equal(evidence.runtimeDataMutated, false);
  assert.equal(evidence.donorEngineInvoked, false);
  assert.equal(evidence.rawRowsReturned, false);
  assert.equal(evidence.rawPayloadsReturned, false);
});

test("workflow preview exposes no raw rows, payloads, USERS, CRM, private data, generation, routes, or POST endpoint flags", () => {
  const workflow = createModel(createRunReadyState()).selectorWorkflowPreview;
  const unsafe = workflow.unsafeOutputsBlocked;

  assert.equal(unsafe.rawRowsPayloadsPrivateDataExposed, false);
  assert.equal(unsafe.rawProductRowsReturned, false);
  assert.equal(unsafe.rawSelectorPayloadReturned, false);
  assert.equal(unsafe.rawEnginePayloadReturned, false);
  assert.equal(unsafe.rawEngineResultReturned, false);
  assert.equal(unsafe.rawUsersReturned, false);
  assert.equal(unsafe.rawCrmReturned, false);
  assert.equal(unsafe.rawContactsReturned, false);
  assert.equal(unsafe.privatePathsReturned, false);
  assert.equal(unsafe.credentialsReturned, false);
  assert.equal(unsafe.exactElectricalValuesReturned, false);
  assert.equal(unsafe.rawIesContentReturned, false);
  assert.equal(unsafe.rawPhotometryReturned, false);
  assert.equal(unsafe.candelaArraysReturned, false);
  assert.equal(unsafe.base64ArtifactsReturned, false);
  assert.equal(unsafe.donorEngineInvoked, false);
  assert.equal(unsafe.runtimeDataMutated, false);
  assert.equal(unsafe.selectedResultPersisted, false);
  assert.equal(unsafe.runTableGenerated, false);
  assert.equal(unsafe.iesGenerated, false);
  assert.equal(unsafe.routesAdded, false);
  assert.equal(unsafe.postEndpointsAdded, false);
  assert.deepEqual(findTrueBlockedFlags(workflow), []);
});

test("Selector view source renders the workflow panel and does not add routes or POST endpoints", () => {
  const files = [
    "packages/modules/cs-selector/selectorViewModel.js",
    "packages/modules/cs-selector/selectorView.js",
  ];
  const combined = files.map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8")).join("\n");
  const view = readFileSync(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8");

  assert.match(view, /appendSelectorWorkflowPreview\(section, surface\.selectorWorkflowPreview/);
  assert.match(view, /Selector workflow/);
  assert.match(view, /Selector workflow readiness — preview only/);
  assert.match(view, /cs-selector-workflow-preview__stage-card/);
  assert.match(view, /cs-selector-workflow-preview__action-card/);
  assert.match(view, /dataset\.controlledRealSourceEvidence = "status-only"/);
  assert.match(view, /dataset\.evidenceInvokedByUi = "false"/);
  assert.match(view, /Controlled real-source evidence is status-only and not invoked by the UI/);
  assert.match(view, /button\.disabled = true/);
  assert.match(view, /Run Engine disabled/);
  assert.match(view, /RunTable generation disabled/);
  assert.match(view, /IES generation disabled/);
  assert.match(view, /selected-result persistence disabled/);
  assert.match(view, /HubSpot\/project writes disabled/);
  assert.equal(/fetch\s*\(/.test(combined), false);
  assert.equal(/method\s*:\s*["']POST["']/.test(combined), false);
  assert.equal(/app\.(post|route)\s*\(/.test(combined), false);
  assert.equal(/router\.(post|route)\s*\(/.test(combined), false);
});
