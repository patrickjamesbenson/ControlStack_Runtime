import test from "node:test";
import assert from "node:assert/strict";

import {
  buildShellProjectBrowserSelectedProjectEngineActionEligibility,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionEligibility.js";
import {
  buildShellProjectBrowserSelectedProjectEngineActionLane,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation,
  SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeActivation.js";
import {
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary.js";
import {
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_STATES,
} from "../packages/workspace-kernel/projectBrowserService.js";

const PROJECT_ID = "activation-project";
const ENVELOPE_ID = "env-activation-project";
const PROJECTION_FINGERPRINT =
  "safe-selector-pre-engine-readonly-action-eligibility:1111111111111111111111111111111111111111";

function preEngineSummary(overrides = {}) {
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
      "safe-project-browser-selected-project-pre-engine-action-eligibility:2222222222222222222222222222222222222222",
    ...overrides,
  });
}

function acknowledgement(overrides = {}) {
  return Object.freeze({
    ok: true,
    activeRevision: true,
    projectId: PROJECT_ID,
    localEnvelopeId: ENVELOPE_ID,
    localSavedAt: "2026-07-15T02:00:00.000Z",
    localRevisionId: "local-revision-activation-1",
    serverEnvelopeId: "server-envelope-activation-1",
    serverRevisionId: "server-revision-activation-1",
    preEngineActionSourceReady: true,
    candidateReconstructionPreflightEligible: true,
    preEngineEligibilityProjectionFingerprint: PROJECTION_FINGERPRINT,
    serverOwned: true,
    retainedInProcessMemory: true,
    filesystemPersistenceEnabled: false,
    ...overrides,
  });
}

function activationContext(registration = acknowledgement(), selectedProjectId = ENVELOPE_ID) {
  return {
    projectBrowser: {
      selectedProjectId,
      selectedProjectServerOwnedRegistration: registration,
    },
  };
}

function eligibility({
  summary = preEngineSummary(),
  registration = acknowledgement(),
  selectedProjectId = ENVELOPE_ID,
} = {}) {
  return buildShellProjectBrowserSelectedProjectEngineActionEligibility(
    summary,
    registration,
    selectedProjectId,
  );
}

function clientResult({
  selectedProjectId = ENVELOPE_ID,
  state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
    .completed,
  blocker = null,
} = {}) {
  const completed = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
      .completed;
  const unavailable = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
      .unavailable;
  const fields = {
    schemaId:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION,
    contractId:
      SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID,
    owner: "shell-browser-client",
    state,
    readiness: completed ? "completed" : unavailable ? "unavailable" : "blocked_fail_closed",
    ok: completed,
    failClosed: !completed,
    blocker: completed ? null : blocker || "safe-client-blocker",
    selectedProjectId,
    requestValidated: true,
    requestDispatched: true,
    responseReceived: true,
    responseValidated: true,
    httpStatus: completed ? 200 : 422,
    serverState: completed
      ? "runtime_engine_runtable_selected_project_shell_invoke_transport_completed"
      : "runtime_engine_runtable_selected_project_shell_invoke_transport_blocked_fail_closed",
    serverReadiness: completed ? "completed" : unavailable ? "unavailable" : "blocked_fail_closed",
    serverRequestAccepted: true,
    sourceBoundaryReconstructedServerSide: true,
    sourceBoundaryReady: true,
    capabilityInvoked: completed,
    capabilityCompleted: completed,
    readOnly: true,
    selectedProjectOnly: true,
    scalarSafe: true,
    redactedOutcomeOnly: true,
    renderingMounted: false,
    engineActionAvailable: false,
    engineActionEnabled: false,
    userGestureListenerAdded: false,
    preparedActionRetained: false,
    automaticInvocationEnabled: false,
    candidatePayloadAccepted: false,
    candidatePayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    runRowsReturned: false,
    exactElectricalValuesReturned: false,
    projectEnvelopeReturned: false,
    privateCandidateReturned: false,
    fingerprintsReturned: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    outputGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
  return Object.freeze(Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function deferred() {
  let resolve;
  const promise = new Promise((settle) => {
    resolve = settle;
  });
  return { promise, resolve };
}

function assertSafeSnapshot(snapshot) {
  assert.equal(Object.isFrozen(snapshot), true);
  assert.deepEqual(
    Object.keys(snapshot),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_FIELD_ORDER,
  );
  assert.equal(Object.values(snapshot).every((value) => (
    value === null
      || typeof value === "string"
      || typeof value === "boolean"
      || Number.isSafeInteger(value)
  )), true);
  assert.equal(snapshot.readOnly, true);
  assert.equal(snapshot.selectedProjectOnly, true);
  assert.equal(snapshot.scalarSafe, true);
  assert.equal(snapshot.userGestureRequired, true);
  assert.equal(snapshot.automaticInvocationEnabled, false);
  for (const key of [
    "callerPayloadAccepted",
    "candidatePayloadSent",
    "candidatePayloadReturned",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "runRowsReturned",
    "exactElectricalValuesReturned",
    "placementCoordinatesReturned",
    "projectEnvelopeReturned",
    "privateCandidateReturned",
    "fingerprintsReturned",
    "runtimeDataMutated",
    "selectedResultPersisted",
    "runTableGenerated",
    "iesGenerated",
    "outputGenerated",
    "filesystemWriteAttempted",
  ]) assert.equal(snapshot[key], false, key);
}

test("activation enables only after pre-Engine eligibility, server preflight, transport mount, and delegated gesture listener all align", () => {
  let calls = 0;
  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport() {
      calls += 1;
      return clientResult();
    },
  });
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID,
    "SHELL-PROJECT-BROWSER-FIRST-ENABLED-SELECTED-PROJECT-READONLY-ENGINE-RUN-1",
  );
  const engineActionEligibility = eligibility();
  let snapshot = controller.refresh({
    context: activationContext(),
    engineActionEligibility,
  });
  assertSafeSnapshot(snapshot);
  assert.equal(snapshot.ready, false);
  assert.equal(snapshot.actionEnabled, false);
  assert.equal(
    snapshot.blocker,
    "selected-project-engine-readonly-invoke-user-gesture-listener-not-mounted",
  );
  assert.equal(snapshot.selectedProjectAndRevisionMatch, true);
  assert.equal(snapshot.stage3ActionSourceReady, true);
  assert.equal(snapshot.candidateReconstructionPreflightEligible, true);
  assert.equal(calls, 0);

  snapshot = controller.setDelegatedListenerMounted(true);
  assertSafeSnapshot(snapshot);
  assert.equal(
    snapshot.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.ready,
  );
  assert.equal(snapshot.ready, true);
  assert.equal(snapshot.actionEnabled, true);
  const lane = buildShellProjectBrowserSelectedProjectEngineActionLane(
    null,
    snapshot,
    engineActionEligibility,
  );
  assert.equal(lane.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.ready);
  assert.equal(lane.actions[0].enabled, true);
  assert.equal(calls, 0);
});

test("1/1 run completion alone, missing server preflight, stale selection, and revision mismatch remain fail closed", () => {
  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport() {
      throw new Error("blocked activation must not invoke");
    },
  });
  controller.setDelegatedListenerMounted(true);

  const runOnlySummary = preEngineSummary({
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
  const cases = [
    {
      context: activationContext(),
      eligibility: eligibility({ summary: runOnlySummary }),
    },
    {
      context: activationContext(acknowledgement({
        candidateReconstructionPreflightEligible: false,
      })),
      eligibility: eligibility({
        registration: acknowledgement({
          candidateReconstructionPreflightEligible: false,
        }),
      }),
    },
    {
      context: activationContext(acknowledgement(), "other-selection"),
      eligibility: eligibility({ selectedProjectId: "other-selection" }),
    },
    {
      context: activationContext(acknowledgement({
        preEngineEligibilityProjectionFingerprint:
          "safe-selector-pre-engine-readonly-action-eligibility:3333333333333333333333333333333333333333",
      })),
      eligibility: eligibility({
        registration: acknowledgement({
          preEngineEligibilityProjectionFingerprint:
            "safe-selector-pre-engine-readonly-action-eligibility:3333333333333333333333333333333333333333",
        }),
      }),
    },
  ];

  for (const item of cases) {
    const snapshot = controller.refresh({
      context: item.context,
      engineActionEligibility: item.eligibility,
    });
    assertSafeSnapshot(snapshot);
    assert.equal(snapshot.actionEnabled, false);
    assert.equal(snapshot.failClosed, true);
  }
});

test("activation preserves one-shot consumption, concurrent invocation protection, and stale-response rejection", async () => {
  const pending = deferred();
  let calls = 0;
  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport() {
      calls += 1;
      return pending.promise;
    },
  });
  const engineActionEligibility = eligibility();
  controller.setDelegatedListenerMounted(true);
  controller.refresh({ context: activationContext(), engineActionEligibility });

  const firstPromise = controller.activate();
  const concurrent = await controller.activate();
  assert.equal(calls, 1);
  assert.equal(concurrent.actionEnabled, false);
  assert.equal(concurrent.browserConcurrentActivationBlocked, true);

  pending.resolve(clientResult());
  const completed = await firstPromise;
  assertSafeSnapshot(completed);
  assert.equal(
    completed.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.completed,
  );
  assert.equal(completed.responseAccepted, true);
  assert.equal(completed.revisionConsumed, true);

  const replay = await controller.activate();
  assert.equal(replay.browserReplayBlocked, true);
  assert.equal(calls, 1);

  const nextRegistration = acknowledgement({
    localRevisionId: "local-revision-activation-2",
    serverRevisionId: "server-revision-activation-2",
  });
  const nextEligibility = eligibility({ registration: nextRegistration });
  const next = controller.refresh({
    context: activationContext(nextRegistration),
    engineActionEligibility: nextEligibility,
  });
  assert.equal(next.actionEnabled, true);
});
