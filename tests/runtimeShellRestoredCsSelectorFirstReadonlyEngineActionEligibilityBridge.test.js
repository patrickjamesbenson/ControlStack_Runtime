import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildSelectorPreEngineReadonlyActionEligibilityProjection,
} from "../packages/modules/cs-selector/selectorViewModel.js";
import {
  buildSelectorReadonlyEngineCandidateForInternalSeam,
} from "../packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js";
import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
  buildProjectBrowserSelectedProjectPreEngineActionEligibilitySummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry,
  PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
} from "../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js";
import {
  buildShellProjectBrowserSelectedProjectEngineActionEligibility,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionEligibility.js";
import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeActivation.js";

const CONTRACT_ID =
  "SHELL-CS-SELECTOR-FIRST-PRE-ENGINE-READONLY-ACTION-ELIGIBILITY-BRIDGE-1";
const PROJECT_ID = "restored-selector-first-readonly-project";
const LOCAL_ENVELOPE_ID = "local-envelope-restored-selector-first-readonly";
const SAVED_AT = "2026-07-15T03:00:00.000Z";

function ordered(order, fields) {
  return Object.fromEntries(order.map((key) => [key, fields[key]]));
}

function readyProjection() {
  const committedSelectorConstraints = [
    { fieldKey: "tier", value: "Business", valueLabel: "Business", committedSelectorState: true, blocked: false, authoritySource: "acceptedDefaults" },
    { fieldKey: "directOpticVar1", value: "80|Inlay", valueLabel: "Inlay", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "targetLmPerM", value: "1200", valueLabel: "1200", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "cctCri", value: "4000K / CRI90", valueLabel: "4000K / CRI90", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "controlType", value: "DALI-2", valueLabel: "DALI-2", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
  ];
  const factoryApprovedInputsSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    factoryApprovedInputsReady: true,
    ready: true,
    stage3Mode: "simple-run-stage3a-zero-accessory",
    blocker: null,
    stage2Ready: true,
    committedSelectorConstraintCount: committedSelectorConstraints.length,
    committedRunIntakeSummary: {
      ready: true,
      committedRunIntakeReady: true,
      sourceAuthority: "committed-selector-state",
      runQuantity: 1,
      runLengthMm: 3500,
      lengthMode: "cut_to_length",
    },
    runIntakePreviewSummary: {
      runIntakePreviewReady: true,
      runCount: 1,
      totalQuantity: 1,
    },
    accessoryPlacementIntentSummary: { accessoryIntentCount: 0 },
    accessoryReservationRequired: false,
    engineExecuted: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
  };
  const lmTemperatureReadinessPreview = {
    targetIntent: { direct: { ready: true, valueLabel: "1200" } },
    cctCriPairing: { direct: { ready: true, valueLabel: "4000K / CRI90" } },
    controlIntent: { direct: { ready: true, valueLabel: "DALI-2" } },
    fingerprint: "safe-selector-lm-temperature:restored-first-readonly",
    rawRowsReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
  };
  const mapper = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary,
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
  });
  assert.equal(mapper.ok, true);
  return buildSelectorPreEngineReadonlyActionEligibilityProjection({
    specBuildReadinessPreview: {
      factoryApprovedInputsReady: true,
      factoryApprovedInputsSummary,
      readonlyEngineCandidateReady: true,
      readonlyEngineCandidateMapperSummary: mapper.summary,
    },
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
    sourceInputFingerprint: "safe-source-input:restored-first-readonly",
    boardDataSourceVersion: "safe-board-version:restored-first-readonly",
  });
}

function registrationRequest(projection) {
  const sourceProjection = ordered(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
    {
      project: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
        {
          metadata: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
            {
              projectId: PROJECT_ID,
              title: "Restored Selector First Readonly",
              readiness: "ready",
              source: "bridge-test",
              browserReady: true,
              browserStatus: "ready",
              restoredFromEnvelope: true,
              restoredAt: SAVED_AT,
              restoredEnvelopeId: LOCAL_ENVELOPE_ID,
            },
          ),
          currentProject: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
            {
              projectId: PROJECT_ID,
              title: "Restored Selector First Readonly",
              client: "Client",
              site: "Sydney",
              readiness: "ready",
              source: "bridge-test",
            },
          ),
          selection: ordered(
            PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
            {
              owner: "shell",
              selectedProjectId: PROJECT_ID,
              selectedAt: SAVED_AT,
              source: "bridge-test",
              restoredEnvelopeId: LOCAL_ENVELOPE_ID,
            },
          ),
        },
      ),
      savedBy: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
        {
          identityState: "internal_authenticated",
          classification: "internal",
          actualRole: "developer",
          derivedActualRole: "developer",
          actualRoleSource: "test",
          displayRole: "developer",
          displayRoleClamped: false,
          name: "Runtime Test",
          email: "runtime@example.test",
        },
      ),
      contractVersion: CONTRACT_ID,
      selectorModule: ordered(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
        {
          status: "saved-ui-state",
          preEngineActionEligibilityProjection: projection,
          selectedResultSummary: null,
          runTableFirstNarrowOutputSummary: null,
        },
      ),
    },
  );
  return ordered(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
    {
      schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
      schemaVersion:
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
      contractId:
        PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
      requestKind: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
      registrationSessionId: "restored-selector-first-readonly-session",
      clientSaveOrdinal: 1,
      localRevisionId: "local-revision-restored-selector-first-readonly-1",
      localProjectId: PROJECT_ID,
      localEnvelopeId: LOCAL_ENVELOPE_ID,
      localSavedAt: SAVED_AT,
      sourceProjection,
    },
  );
}

test("restored Selector first-run bridge enables the shell-owned readonly action without post-Engine result authority", async () => {
  const projection = readyProjection();
  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const registration = await registry.register(registrationRequest(projection));
  assert.equal(registration.ok, true, registration.blocker);
  assert.equal(registration.preEngineActionSourceReady, true);
  assert.equal(registration.candidateReconstructionPreflightEligible, true);

  const serverEnvelope = registry.getProjectEnvelope(LOCAL_ENVELOPE_ID);
  const preEngineSummary = buildProjectBrowserSelectedProjectPreEngineActionEligibilitySummary(
    serverEnvelope,
    LOCAL_ENVELOPE_ID,
  );
  assert.equal(preEngineSummary.ready, true);
  assert.equal(preEngineSummary.runIntakePreviewReady, true);
  assert.equal(preEngineSummary.factoryApprovedInputsReady, true);
  assert.equal(preEngineSummary.candidateMapperReady, true);
  assert.equal(preEngineSummary.accessoryIntentCount, 0);

  const postEngineSummary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
    serverEnvelope,
    LOCAL_ENVELOPE_ID,
  );
  assert.equal(postEngineSummary.ready, false);
  assert.equal(postEngineSummary.engineRunReadinessReadbackReady, false);

  const engineActionEligibility =
    buildShellProjectBrowserSelectedProjectEngineActionEligibility(
      preEngineSummary,
      registration,
      LOCAL_ENVELOPE_ID,
    );
  assert.equal(engineActionEligibility.ready, true);
  assert.equal(engineActionEligibility.postEngineResultReadbackRequired, false);
  assert.equal(engineActionEligibility.selectedProjectAndRevisionMatch, true);

  let invocationCalls = 0;
  const activationController =
    createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
      invokeSelectedProjectReadonlyEngineClientTransport() {
        invocationCalls += 1;
        throw new Error("render and eligibility must not auto-invoke");
      },
    });
  activationController.setDelegatedListenerMounted(true);
  const activation = activationController.refresh({
    context: {
      projectBrowser: {
        selectedProjectId: LOCAL_ENVELOPE_ID,
        selectedProjectServerOwnedRegistration: registration,
      },
    },
    engineActionEligibility,
  });
  assert.equal(
    activation.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.ready,
  );
  assert.equal(activation.actionEnabled, true);
  assert.equal(activation.revisionConsumed, false);

  const lane = buildShellProjectBrowserSelectedProjectEngineActionLane(
    null,
    activation,
    engineActionEligibility,
  );
  assert.equal(
    lane.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.ready,
  );
  assert.equal(lane.actions[0].label, "Run Engine");
  assert.equal(lane.actions[0].enabled, true);
  assert.equal(lane.sourcePreviewPresent, false);
  assert.equal(lane.selectedResultAccepted, false);
  assert.equal(lane.engineVerified, false);
  assert.equal(invocationCalls, 0);
});

test("restored Selector bridge stays fail closed when run intake is complete but Stage-3 or server authority is incomplete", async () => {
  const projection = readyProjection();
  const runOnlyProjection = structuredClone(projection);
  runOnlyProjection.factoryApprovedInputsReady = false;
  runOnlyProjection.candidateMapperReady = false;
  runOnlyProjection.ready = false;
  runOnlyProjection.state =
    "selector_pre_engine_readonly_action_eligibility_blocked_fail_closed";
  runOnlyProjection.readiness = "blocked_fail_closed";
  runOnlyProjection.blocker = "selector-pre-engine-stage3-eligibility-incomplete";

  const registry = createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry();
  const rejected = await registry.register(registrationRequest(runOnlyProjection));
  assert.equal(rejected.ok, false);
  assert.equal(rejected.preEngineActionSourceReady, false);
  assert.equal(rejected.candidateReconstructionPreflightEligible, false);
  assert.equal(rejected.activeRevision, false);
});

test("restored Selector exposes only the shell action lane and leaves donor diagnostic production actions disabled", async () => {
  const [shellSource, selectorViewSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8"),
  ]);
  assert.match(shellSource, /ensureRestoredCsSelectorEngineActionLaneSurface/);
  assert.match(shellSource, /Shell-owned readonly action lane/);
  assert.match(shellSource, /data-shell-restored-cs-selector-engine-action-lane/);
  assert.match(shellSource, /moduleHost\?\.addEventListener/);
  assert.match(selectorViewSource, /appendWorkflowDisabledActions/);
  assert.match(selectorViewSource, /button\.disabled = true/);
  assert.match(selectorViewSource, /donor-engine-invocation-not-approved/);
  assert.doesNotMatch(selectorViewSource, /button\.disabled = false/);
});
