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
        { fieldKey: "ambient", label: "Ambient temperature", sourceTables: ["SYSTEM_POLICY"], options: [{ value: "25C", label: "25°C ambient", sourceTables: ["SYSTEM_POLICY"] }] },
        { fieldKey: "targetLmPerM", label: "Direct lm/m", sourceTables: ["BOARDS"], options: [{ value: "1200", label: "1200 lm/m", sourceTables: ["BOARDS"] }] },
        { fieldKey: "targetLmPerMIndirect", label: "Indirect lm/m", sourceTables: ["BOARDS"], options: [{ value: "800", label: "800 lm/m", sourceTables: ["BOARDS"] }] },
        { fieldKey: "cctCri", label: "Direct paired CCT/CRI", sourceTables: ["BOARDS"], options: [{ value: "4000K-CRI90", label: "4000K / CRI90", sourceTables: ["BOARDS"] }] },
        { fieldKey: "cctCriIndirect", label: "Indirect paired CCT/CRI", sourceTables: ["BOARDS"], options: [{ value: "3000K-CRI90", label: "3000K / CRI90", sourceTables: ["BOARDS"] }] },
        { fieldKey: "controlType", label: "Direct control protocol", sourceTables: ["BOARDS"], options: [{ value: "dali-2", label: "DALI-2", sourceTables: ["BOARDS"] }] },
        { fieldKey: "controlTypeIndirect", label: "Indirect control protocol", sourceTables: ["BOARDS"], options: [{ value: "dali-2", label: "DALI-2", sourceTables: ["BOARDS"] }] },
        { fieldKey: "indirectMatchDirect", label: "Indirect match-direct", sourceTables: ["SYSTEM", "OPTICS"], options: [{ value: "match-direct", label: "Match direct", sourceTables: ["SYSTEM", "OPTICS"] }] },
      ],
      workflowSections: [
        { sectionKey: "system", title: "System", fields: [] },
        {
          sectionKey: "lightControl",
          title: "Light & Control",
          fields: [
            { fieldKey: "targetLmPerM", label: "Direct lm/m", sourceTables: ["BOARDS"], options: [{ value: "1200", label: "1200 lm/m", sourceTables: ["BOARDS"] }] },
            { fieldKey: "targetLmPerMIndirect", label: "Indirect lm/m", sourceTables: ["BOARDS"], options: [{ value: "800", label: "800 lm/m", sourceTables: ["BOARDS"] }] },
            { fieldKey: "cctCri", label: "Direct paired CCT/CRI", sourceTables: ["BOARDS"], options: [{ value: "4000K-CRI90", label: "4000K / CRI90", sourceTables: ["BOARDS"] }] },
            { fieldKey: "cctCriIndirect", label: "Indirect paired CCT/CRI", sourceTables: ["BOARDS"], options: [{ value: "3000K-CRI90", label: "3000K / CRI90", sourceTables: ["BOARDS"] }] },
            { fieldKey: "controlType", label: "Direct control protocol", sourceTables: ["BOARDS"], options: [{ value: "dali-2", label: "DALI-2", sourceTables: ["BOARDS"] }] },
            { fieldKey: "controlTypeIndirect", label: "Indirect control protocol", sourceTables: ["BOARDS"], options: [{ value: "dali-2", label: "DALI-2", sourceTables: ["BOARDS"] }] },
            { fieldKey: "indirectMatchDirect", label: "Indirect match-direct", sourceTables: ["SYSTEM", "OPTICS"], options: [{ value: "match-direct", label: "Match direct", sourceTables: ["SYSTEM", "OPTICS"] }] },
          ],
        },
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

function createLmTemperatureReadyIntentState() {
  const selectorState = createRunReadyState();
  selectorState.setDbBackedSelectorFieldValue("targetLmPerM", "1200", "1200 lm/m");
  selectorState.setDbBackedSelectorFieldValue("targetLmPerMIndirect", "800", "800 lm/m");
  selectorState.setDbBackedSelectorFieldValue("cctCri", "4000K-CRI90", "4000K / CRI90");
  selectorState.setDbBackedSelectorFieldValue("cctCriIndirect", "3000K-CRI90", "3000K / CRI90");
  selectorState.setDbBackedSelectorFieldValue("controlType", "dali-2", "DALI-2");
  selectorState.setDbBackedSelectorFieldValue("controlTypeIndirect", "dali-2", "DALI-2");
  selectorState.setDbBackedSelectorFieldValue("indirectMatchDirect", "match-direct", "Match direct");
  selectorState.setDbBackedSelectorFieldValue("ambient", "25C", "25°C ambient");
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
    const blocked = /(?:raw.*(?:Returned|Exposed)|donorEngineInvoked|runtimeDataMutated|selectedResultPersisted|runTableGenerated|iesGenerated|routesAdded|postEndpointsAdded|hubSpotWriteEnabled|projectWriteEnabled|exactElectricalValuesReturned|base64ArtifactsReturned|candelaArraysReturned|rawRowsPayloadsPrivateDataExposed|realDonorPayloadAssembled|exactPlacementCoordinatesReturned)$/i.test(key)
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
    "lm-temperature-output-readiness",
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
  const bridge = downstream.controlledDonorEngineVerifyBridgeSummary;

  assert.deepEqual(downstreamIds, [
    "sealed-candidate-assembly",
    "runtable-domain",
    "controlled-donor-engine-verify-bridge",
    "selected-result-handoff",
    "selected-result-authority-preflight",
    "accepted-selected-result-authority",
    "ies-handoff",
    "selected-result-output-readiness-preflight",
    "controlled-real-source-evidence",
  ]);
  assert.equal(downstream.selectedResultOutputReadinessPreflightSummary.readOnly, true);
  assert.equal(downstream.selectedResultOutputReadinessPreflightSummary.diagnosticOnly, true);
  assert.equal(downstream.selectedResultOutputReadinessPreflightSummary.preflightOnly, true);
  assert.equal(downstream.selectedResultOutputReadinessPreflightSummary.selectedResultPersistenceEnabled, false);
  assert.equal(downstream.selectedResultOutputReadinessPreflightSummary.runTableGenerationEnabled, false);
  assert.equal(downstream.selectedResultOutputReadinessPreflightSummary.iesGenerationEnabled, false);
  assert.equal(downstream.selectedResultOutputReadinessPreflightSummary.outputGenerationEnabled, false);
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
  assert.equal(bridge.ok, false);
  assert.equal(bridge.bridgeReady, false);
  assert.equal(bridge.blocker, "donor-engine-invocation-not-approved");
  assert.equal(bridge.privateBridgeOnly, true);
  assert.equal(bridge.diagnosticOnly, true);
  assert.equal(bridge.safeSummaryOnly, true);
  assert.equal(bridge.safetyFlags.donorEngineInvoked, false);
  assert.equal(bridge.safetyFlags.realDonorPayloadAssembled, false);
  assert.equal(bridge.safetyFlags.selectedResultPersisted, false);
  assert.equal(bridge.safetyFlags.runTableGenerated, false);
  assert.equal(bridge.safetyFlags.iesGenerated, false);
  assert.equal(evidence.status, "diagnostic-only-available-not-invoked");
  assert.equal(evidence.helperAvailable, true);
  assert.equal(evidence.runtimeDataRead, false);
  assert.equal(evidence.runtimeDataMutated, false);
  assert.equal(evidence.donorEngineInvoked, false);
  assert.equal(evidence.rawRowsReturned, false);
  assert.equal(evidence.rawPayloadsReturned, false);
});

test("Selector lm/m temperature readiness preview is intent-only and keeps Verify disabled", () => {
  const model = createModel(createLmTemperatureReadyIntentState());
  const preview = model.lmTemperatureReadinessPreview;
  const workflow = model.selectorWorkflowPreview;
  const stages = stageMap(workflow);

  assert.equal(preview.title, "Lm/m temperature-output readiness — preview only");
  assert.equal(preview.visibleCopy, "Light output is captured as target intent only. Temperature-adjusted output requires future Engine verification.");
  assert.equal(preview.targetIntent.direct.valueLabel, "1200 lm/m");
  assert.equal(preview.targetIntent.direct.intentOnly, true);
  assert.equal(preview.targetIntent.direct.verifiedOutput, false);
  assert.equal(preview.targetIntent.indirect.valueLabel, "800 lm/m");
  assert.equal(preview.targetIntent.indirect.inheritedFromDirect, false);
  assert.equal(preview.targetIntent.indirect.matchDirectIgnoredForLmPerM, true);
  assert.equal(preview.targetIntent.verifiedDeliveredLmPerM, false);
  assert.equal(preview.targetIntent.temperatureAdjustedOutputCalculated, false);
  assert.equal(preview.cctCriPairing.direct.valueLabel, "4000K / CRI90");
  assert.equal(preview.cctCriPairing.indirect.valueLabel, "3000K / CRI90");
  assert.equal(preview.cctCriPairing.paired, true);
  assert.equal(preview.cctCriPairing.boardBacked, true);
  assert.equal(preview.cctCriPairing.remainsPairedAndBoardBacked, true);
  assert.deepEqual(preview.indirectMatchDirectScope.appliesTo, ["cctCriIndirect", "controlTypeIndirect"]);
  assert.deepEqual(preview.indirectMatchDirectScope.excludedFrom, ["targetLmPerMIndirect"]);
  assert.equal(preview.indirectMatchDirectScope.lmPerMInherited, false);
  assert.equal(preview.indirectMatchDirectScope.indirectLmPerMIndependent, true);
  assert.equal(preview.engineVerification.verifyEnabled, false);
  assert.equal(preview.engineVerification.verifyOpened, false);
  assert.equal(preview.engineVerification.donorEngineInvoked, false);
  assert.equal(preview.safetyFlags.lmPerMAtTempBridgeCalled, false);
  assert.equal(preview.safetyFlags.donorLmPerMAtTempCalled, false);
  assert.equal(preview.safetyFlags.exactElectricalValuesReturned, false);
  assert.equal(preview.safetyFlags.driveCurrentReturned, false);
  assert.equal(preview.safetyFlags.runtimeDataMutated, false);
  assert.equal(preview.safetyFlags.runTableGenerated, false);
  assert.equal(preview.safetyFlags.iesGenerated, false);
  assert.equal(preview.safetyFlags.selectedResultPersisted, false);
  assert.equal(preview.safetyFlags.routesAdded, false);
  assert.equal(preview.safetyFlags.postEndpointsAdded, false);
  assert.equal(stages.get("lm-temperature-output-readiness").blocked, true);
  assert.equal(stages.get("lm-temperature-output-readiness").reason, preview.visibleCopy);
  assert.equal(workflow.lmTemperatureReadinessPreview, preview);
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
  assert.equal(unsafe.exactPlacementCoordinatesReturned, false);
  assert.equal(unsafe.realDonorPayloadAssembled, false);
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

test("Selector view source keeps workflow diagnostics behind closed developer drawer and does not add routes or POST endpoints", () => {
  const files = [
    "packages/modules/cs-selector/selectorViewModel.js",
    "packages/modules/cs-selector/selectorView.js",
    "packages/workspace-kernel/selectorLmTemperatureReadinessPreview.js",
  ];
  const combined = files.map((file) => readFileSync(new URL(`../${file}`, import.meta.url), "utf8")).join("\n");
  const view = readFileSync(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8");

  assert.match(view, /cs-selector-summary-rail/);
  assert.match(view, /dataset\.selectorSummaryRail = "persistent"/);
  assert.match(view, /cs-selector-product__main-flow/);
  assert.match(view, /dataset\.defaultProductFlow = "product-first"/);
  assert.match(view, /dataset\.defaultReadiness = "plain-english"/);
  assert.match(view, /Runs incomplete — add quantity and length before Engine readiness can be reviewed/);
  assert.match(view, /cs-selector-dev-drawer/);
  assert.match(view, /dataset\.selectorDeveloperDrawer = "closed-default"/);
  assert.match(view, /diagnosticsDetails\.open = false/);
  assert.match(view, /appendText\(diagnosticsSummary, "span", "d", "cs-selector-dev-drawer__key"\)/);
  assert.match(view, /appendSelectorWorkflowPreview\(diagnostics, surface\.selectorWorkflowPreview/);
  assert.doesNotMatch(view, /appendSelectorWorkflowPreview\(section, surface\.selectorWorkflowPreview/);
  assert.match(view, /appendPayloadPreviewObject\(diagnostics, surface\.payloadPreview/);
  assert.match(view, /appendSelectedEngineResultHandoff\(diagnostics, surface\.selectedEngineResultHandoff/);
  assert.match(view, /Selector workflow readiness — preview only/);
  assert.match(view, /cs-selector-workflow-preview__stage-card/);
  assert.match(view, /cs-selector-workflow-preview__action-card/);
  assert.match(view, /dataset\.controlledRealSourceEvidence = "status-only"/);
  assert.match(view, /dataset\.evidenceInvokedByUi = "false"/);
  assert.match(view, /Controlled real-source evidence is status-only and not invoked by the UI/);
  assert.match(view, /dataset\.controlledDonorEngineVerifyBridge = "status-only"/);
  assert.match(view, /Controlled donor Engine verify bridge/);
  assert.match(view, /safe verification summary status is surfaced/);
  assert.match(view, /real readonly summary when available/);
  assert.match(view, /button\.disabled = true/);
  assert.match(view, /Run Engine disabled/);
  assert.match(view, /Light output readiness/);
  assert.match(view, /Light output is captured as target intent only\. Temperature-adjusted output requires future Engine verification\./);
  assert.match(view, /dataset\.lmTemperatureReadinessPreview = "intent-only"/);
  assert.match(view, /Lm\/m temperature readiness preview/);
  assert.match(view, /target lm\/m labelled intent/);
  assert.match(view, /lm_per_m_at_temp bridge called/);
  assert.match(view, /indirect lm\/m inherits direct/);
  assert.match(view, /RunTable generation disabled/);
  assert.match(view, /IES generation disabled/);
  assert.match(view, /selected-result persistence disabled/);
  assert.match(view, /HubSpot\/project writes disabled/);
  assert.equal(/from\s+["']node:(?:crypto|fs|path|os|url)["']/.test(combined), false);
  assert.equal(/import\s+[^(][^\n]*["']node:(?:crypto|fs|path|os|url)["']/.test(combined), false);
  assert.equal(/fetch\s*\(/.test(combined), false);
  assert.equal(/method\s*:\s*["']POST["']/.test(combined), false);
  assert.equal(/app\.(post|route)\s*\(/.test(combined), false);
  assert.equal(/router\.(post|route)\s*\(/.test(combined), false);
});
