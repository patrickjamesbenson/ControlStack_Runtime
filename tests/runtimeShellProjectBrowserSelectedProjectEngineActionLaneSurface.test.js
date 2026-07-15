import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectEngineActionEligibility,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionEligibility.js";
import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeActivation.js";
import {
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_STATES,
} from "../packages/workspace-kernel/projectBrowserService.js";

const PROJECT_ID = "action-lane-project";
const ENVELOPE_ID = "env-action-lane-project";
const PROJECTION_FINGERPRINT =
  "safe-selector-pre-engine-readonly-action-eligibility:4444444444444444444444444444444444444444";

function summary(overrides = {}) {
  return Object.freeze({
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
    schemaVersion:
      PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
    owner: "shell",
    source: "selected-project-selector-pre-engine-action-eligibility-projection",
    state: PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedProjectId: ENVELOPE_ID,
    selectedProjectFound: true,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    projectionPresent: true,
    projectionSchemaId: "controlstack.selector.pre-engine-readonly-action-eligibility.v1",
    projectionSchemaVersion: 1,
    projectionState: "selector_pre_engine_readonly_action_eligibility_ready",
    projectionReadiness: "ready",
    projectionFingerprint: PROJECTION_FINGERPRINT,
    runIntakePreviewReady: true,
    factoryApprovedInputsReady: true,
    candidateMapperReady: true,
    runCount: 1,
    totalQuantity: 2,
    accessoryIntentCount: 0,
    selectedProjectOnly: true,
    summaryOnly: true,
    readOnly: true,
    scalarSafe: true,
    candidatePayloadReturned: false,
    projectEnvelopeReturned: false,
    selectedResultRequired: false,
    runTableSummaryRequired: false,
    engineExecutionEnabled: false,
    runtimeDataMutated: false,
    filesystemWriteAttempted: false,
    projectBrowserSelectedProjectPreEngineActionEligibilityFingerprint:
      "safe-project-browser-selected-project-pre-engine-action-eligibility:5555555555555555555555555555555555555555",
    ...overrides,
  });
}

function registration(overrides = {}) {
  return Object.freeze({
    ok: true,
    activeRevision: true,
    projectId: PROJECT_ID,
    localEnvelopeId: ENVELOPE_ID,
    localSavedAt: "2026-07-15T02:30:00.000Z",
    localRevisionId: "local-revision-action-lane-1",
    serverEnvelopeId: "server-envelope-action-lane-1",
    serverRevisionId: "server-revision-action-lane-1",
    preEngineActionSourceReady: true,
    candidateReconstructionPreflightEligible: true,
    preEngineEligibilityProjectionFingerprint: PROJECTION_FINGERPRINT,
    serverOwned: true,
    retainedInProcessMemory: true,
    filesystemPersistenceEnabled: false,
    ...overrides,
  });
}

function eligibility(options = {}) {
  const sourceSummary = options.summary || summary();
  const sourceRegistration = options.registration || registration();
  return buildShellProjectBrowserSelectedProjectEngineActionEligibility(
    sourceSummary,
    sourceRegistration,
    options.selectedProjectId || ENVELOPE_ID,
  );
}

function activationFor(engineActionEligibility) {
  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport() {
      throw new Error("surface construction must not invoke");
    },
  });
  controller.setDelegatedListenerMounted(true);
  return controller.refresh({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        selectedProjectServerOwnedRegistration: registration(),
      },
    },
    engineActionEligibility,
  });
}

function assertScalarLane(lane) {
  assert.equal(Object.isFrozen(lane), true);
  assert.deepEqual(
    Object.keys(lane),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER,
  );
  assert.equal(Object.values(lane).every((value) => (
    value === null
      || typeof value === "string"
      || typeof value === "boolean"
      || Number.isSafeInteger(value)
      || (Array.isArray(value) && Object.isFrozen(value))
  )), true);
  assert.equal(lane.actions.length, 1);
  assert.equal(Object.isFrozen(lane.actions[0]), true);
  const serialised = JSON.stringify(lane);
  for (const forbidden of [
    '"factoryApprovedInputsSummary":',
    '"committedSelectorConstraints":',
    '"lmTemperatureReadinessPreview":',
    '"candidatePayload":',
    '"projectEnvelope":',
    '"run_length_mm":',
    '"target_lm_per_m":',
    '"rawRows":',
  ]) assert.equal(serialised.includes(forbidden), false, forbidden);
}

test("action lane is shell-owned and enables from pre-Engine eligibility even when post-Engine preview is absent", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-SURFACE-1",
  );
  const engineActionEligibility = eligibility();
  const activation = activationFor(engineActionEligibility);
  const lane = buildShellProjectBrowserSelectedProjectEngineActionLane(
    null,
    activation,
    engineActionEligibility,
  );

  assertScalarLane(lane);
  assert.equal(
    lane.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.ready,
  );
  assert.equal(lane.readiness, "ready");
  assert.equal(lane.ready, true);
  assert.equal(lane.failClosed, false);
  assert.equal(lane.preEngineEligibilityPresent, true);
  assert.equal(lane.preEngineEligibilityReady, true);
  assert.equal(lane.selectedProjectAndRevisionMatch, true);
  assert.equal(lane.stage3ActionSourceReady, true);
  assert.equal(lane.candidateReconstructionPreflightEligible, true);
  assert.equal(lane.serverOwnershipAcknowledged, true);
  assert.equal(lane.sourcePreviewPresent, false);
  assert.equal(lane.sourcePreviewReady, false);
  assert.equal(lane.engineRunReadinessBoundaryReady, false);
  assert.equal(lane.selectedResultAccepted, false);
  assert.equal(lane.engineVerified, false);
  assert.equal(lane.actions[0].label, "Run Engine");
  assert.equal(lane.actions[0].enabled, true);
  assert.equal(lane.actions[0].readOnly, true);
  assert.equal(lane.actions[0].selectedProjectOnly, true);
  assert.equal(lane.actions[0].preparedActionRetainedPrivately, true);
  assert.equal(lane.engineExecutionRequested, false);
  assert.equal(lane.engineExecutionAttempted, false);
});

test("run completion alone and every missing shell prerequisite remain visibly blocked", () => {
  const runOnlySummary = summary({
    state: PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_STATES
      .blockedFailClosed,
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "selector-pre-engine-stage3-eligibility-incomplete",
    runIntakePreviewReady: true,
    factoryApprovedInputsReady: false,
    candidateMapperReady: false,
  });
  const runOnlyEligibility = eligibility({ summary: runOnlySummary });
  const runOnlyLane = buildShellProjectBrowserSelectedProjectEngineActionLane(
    null,
    activationFor(runOnlyEligibility),
    runOnlyEligibility,
  );
  assertScalarLane(runOnlyLane);
  assert.equal(runOnlyLane.ready, false);
  assert.equal(runOnlyLane.actions[0].enabled, false);
  assert.equal(runOnlyLane.preEngineEligibilityReady, false);
  assert.equal(runOnlyLane.stage3ActionSourceReady, false);

  for (const sourceRegistration of [
    registration({ preEngineActionSourceReady: false }),
    registration({ candidateReconstructionPreflightEligible: false }),
    registration({ activeRevision: false }),
    registration({ serverOwned: false }),
  ]) {
    const blockedEligibility = eligibility({ registration: sourceRegistration });
    const lane = buildShellProjectBrowserSelectedProjectEngineActionLane(
      null,
      activationFor(blockedEligibility),
      blockedEligibility,
    );
    assertScalarLane(lane);
    assert.equal(lane.ready, false);
    assert.equal(lane.failClosed, true);
    assert.equal(lane.actions[0].enabled, false);
  }
});

test("action lane renderer remains passive and the Selector donor diagnostic buttons stay permanently disabled", async () => {
  const [laneSource, shellSource, selectorViewSource] = await Promise.all([
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
      import.meta.url,
    ), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8"),
  ]);
  assert.match(laneSource, /preEngineEligibilityReady/);
  assert.match(laneSource, /PREFLIGHT_ELIGIBILITY_FIELD/);
  assert.match(shellSource, /buildShellProjectBrowserSelectedProjectEngineActionEligibility/);
  assert.match(shellSource, /data-shell-restored-cs-selector-engine-action-lane/);
  assert.match(shellSource, /button\.disabled = actionItem\?\.enabled !== true/);
  assert.match(selectorViewSource, /appendWorkflowDisabledActions/);
  assert.match(selectorViewSource, /button\.disabled = true/);
  assert.match(selectorViewSource, /donor-engine-invocation-not-approved/);
  assert.doesNotMatch(laneSource, /addEventListener|onclick|fetch\s*\(|services?\./);
});
