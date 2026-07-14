import test from "node:test";
import assert from "node:assert/strict";

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
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";

const PROJECT_ID = "activation-project";
const ENVELOPE_ID = "env-activation-project";
const SOURCE_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-engine-run-readiness-readback-summary.v1";

const REQUIRED_FALSE_SOURCE_FLAGS = Object.freeze([
  "runTableRowsIncluded",
  "engineExecutionEnabled",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "outputGenerated",
  "outputGenerationEnabled",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawSelectedPayloadReturned",
  "runTableRowsReturned",
  "rawRunTableRowsReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "privatePathsReturned",
]);

function readySourceSummary(selectedProjectId = ENVELOPE_ID) {
  return Object.freeze({
    schemaId: SOURCE_SCHEMA_ID,
    schemaVersion: 1,
    owner: "shell",
    source: "project-browser-selected-project-engine-run-readiness-readback",
    state: "project_browser_selected_project_engine_run_readiness_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedProjectId,
    selectedProjectFound: true,
    projectId: PROJECT_ID,
    envelopeId: selectedProjectId,
    selectedResultSummaryPresent: true,
    runTableFirstNarrowOutputSummaryPresent: true,
    selectedResultReadbackState: "selected_result_persisted_summary_readback_ready",
    selectedResultReadbackReadiness: "ready",
    selectedResultReadbackReady: true,
    selectedResultReadbackFailClosed: false,
    selectedResultReadbackBlocker: null,
    runTableFirstNarrowOutputHandoffContractReady: true,
    acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
    authorityStatesAligned: true,
    fingerprintsAligned: true,
    engineRunReadinessReadbackReady: true,
    runTableRowCount: 2,
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    policyFingerprint: "safe-policy:activation",
    sourceFingerprint: "safe-source:activation",
    projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint:
      `safe-readiness:${selectedProjectId}`,
    ...Object.fromEntries(REQUIRED_FALSE_SOURCE_FLAGS.map((key) => [key, false])),
  });
}

function preview(selectedProjectId = ENVELOPE_ID) {
  return buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary(selectedProjectId),
    selectedProjectId,
  );
}

function acknowledgement({
  selectedProjectId = ENVELOPE_ID,
  localRevisionId = "local-revision-activation-1",
  serverRevisionId = "server-revision-activation-1",
} = {}) {
  return Object.freeze({
    ok: true,
    activeRevision: true,
    projectId: PROJECT_ID,
    localEnvelopeId: selectedProjectId,
    localSavedAt: "2026-07-14T03:00:00.000Z",
    localRevisionId,
    serverEnvelopeId: `server-${selectedProjectId}`,
    serverRevisionId,
    serverOwned: true,
    retainedInProcessMemory: true,
    filesystemPersistenceEnabled: false,
  });
}

function activationContext(options = {}) {
  const selectedProjectId = options.selectedProjectId || ENVELOPE_ID;
  return {
    projectBrowser: {
      selectedProjectId,
      selectedProjectServerOwnedRegistration: acknowledgement({
        selectedProjectId,
        localRevisionId: options.localRevisionId,
        serverRevisionId: options.serverRevisionId,
      }),
    },
  };
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
    serverState: completed ? "runtime_engine_runtable_selected_project_shell_invoke_transport_completed" : "runtime_engine_runtable_selected_project_shell_invoke_transport_blocked_fail_closed",
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
  for (const [key, value] of Object.entries(snapshot)) {
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      key,
    );
  }
  assert.equal(snapshot.readOnly, true);
  assert.equal(snapshot.selectedProjectOnly, true);
  assert.equal(snapshot.scalarSafe, true);
  assert.equal(snapshot.redactedOutcomeOnly, true);
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
  assert.doesNotMatch(
    JSON.stringify(snapshot),
    /selectorPayload\":\{|projectEnvelope\":\{|run_length_mm|target_lm_per_m|RuntimeData\":\{|[A-Za-z]:[\\/]|IESNA:LM-63|TILT=/i,
  );
}

test("activation is inert until the delegated listener is mounted and every readiness input matches", () => {
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
  let snapshot = controller.refresh({
    context: activationContext(),
    engineRunPreview: preview(),
  });
  assertSafeSnapshot(snapshot);
  assert.equal(snapshot.ready, false);
  assert.equal(snapshot.actionEnabled, false);
  assert.equal(snapshot.blocker,
    "selected-project-engine-readonly-invoke-user-gesture-listener-not-mounted");
  assert.equal(calls, 0);

  snapshot = controller.setDelegatedListenerMounted(true);
  assertSafeSnapshot(snapshot);
  assert.equal(snapshot.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.ready);
  assert.equal(snapshot.ready, true);
  assert.equal(snapshot.actionAvailable, true);
  assert.equal(snapshot.actionEnabled, true);
  assert.equal(calls, 0);

  const lane = buildShellProjectBrowserSelectedProjectEngineActionLane(preview(), snapshot);
  assert.equal(lane.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.ready);
  assert.equal(lane.ready, true);
  assert.equal(lane.failClosed, false);
  assert.equal(lane.engineCapabilityMounted, true);
  assert.equal(lane.engineActionAvailable, true);
  assert.equal(lane.engineActionEnabled, true);
  assert.equal(lane.actions[0].enabled, true);
});

test("one user gesture consumes before dispatch, disables immediately, blocks concurrency, completes once, and blocks replay", async () => {
  const pending = deferred();
  let calls = 0;
  let request = null;
  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport(nextRequest) {
      calls += 1;
      request = nextRequest;
      return pending.promise;
    },
  });
  controller.setDelegatedListenerMounted(true);
  controller.refresh({ context: activationContext(), engineRunPreview: preview() });

  const firstPromise = controller.activate();
  let snapshot = controller.getSnapshot();
  assertSafeSnapshot(snapshot);
  assert.equal(snapshot.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.invoking);
  assert.equal(snapshot.invocationInFlight, true);
  assert.equal(snapshot.revisionConsumed, true);
  assert.equal(snapshot.actionEnabled, false);
  assert.equal(snapshot.requestDispatched, true);
  assert.equal(calls, 1);
  assert.deepEqual(request, { selectedProjectId: ENVELOPE_ID });
  assert.equal(Object.isFrozen(request), true);

  const concurrent = await controller.activate();
  assertSafeSnapshot(concurrent);
  assert.equal(concurrent.browserConcurrentActivationBlocked, true);
  assert.equal(calls, 1);

  pending.resolve(clientResult());
  const completed = await firstPromise;
  assertSafeSnapshot(completed);
  assert.equal(completed.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.completed);
  assert.equal(completed.readiness, "completed");
  assert.equal(completed.ok, true);
  assert.equal(completed.failClosed, false);
  assert.equal(completed.responseAccepted, true);
  assert.equal(completed.outcomeState,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES.completed);
  assert.equal(completed.actionEnabled, false);
  assert.equal(calls, 1);

  const replay = await controller.activate();
  assertSafeSnapshot(replay);
  assert.equal(replay.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.completed);
  assert.equal(replay.browserReplayBlocked, true);
  assert.equal(calls, 1);
});

test("rerenders never invoke and an old response is discarded after selection or revision changes", async () => {
  const pending = deferred();
  let calls = 0;
  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport() {
      calls += 1;
      return pending.promise;
    },
  });
  controller.setDelegatedListenerMounted(true);
  for (let index = 0; index < 5; index += 1) {
    const snapshot = controller.refresh({
      context: activationContext(),
      engineRunPreview: preview(),
    });
    assert.equal(snapshot.actionEnabled, true);
  }
  assert.equal(calls, 0);

  const oldPromise = controller.activate();
  assert.equal(calls, 1);
  const nextEnvelopeId = "env-activation-project-next";
  controller.refresh({
    context: activationContext({
      selectedProjectId: nextEnvelopeId,
      localRevisionId: "local-revision-activation-2",
      serverRevisionId: "server-revision-activation-2",
    }),
    engineRunPreview: preview(nextEnvelopeId),
  });
  pending.resolve(clientResult({ selectedProjectId: ENVELOPE_ID }));
  const discarded = await oldPromise;
  assertSafeSnapshot(discarded);
  assert.equal(discarded.responseDiscarded, true);
  assert.equal(discarded.responseAccepted, false);
  assert.equal(discarded.outcomeState, "stale_response_discarded");

  const current = controller.getSnapshot();
  assertSafeSnapshot(current);
  assert.equal(current.selectedProjectId, nextEnvelopeId);
  assert.equal(current.state,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.ready);
  assert.equal(current.actionEnabled, true);
  assert.equal(current.responseReceived, false);
  assert.equal(calls, 1);
});

test("missing acknowledgement, mismatched acknowledgement, blocked preview, and absent transport remain fail-closed", () => {
  const noTransport = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation();
  noTransport.setDelegatedListenerMounted(true);
  const transportBlocked = noTransport.refresh({
    context: activationContext(),
    engineRunPreview: preview(),
  });
  assertSafeSnapshot(transportBlocked);
  assert.equal(transportBlocked.actionEnabled, false);
  assert.equal(transportBlocked.blocker,
    "selected-project-engine-readonly-invoke-client-transport-not-mounted");

  const controller = createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
    invokeSelectedProjectReadonlyEngineClientTransport() {
      throw new Error("must remain unreachable");
    },
  });
  controller.setDelegatedListenerMounted(true);
  const missingAck = controller.refresh({
    context: { projectBrowser: { selectedProjectId: ENVELOPE_ID } },
    engineRunPreview: preview(),
  });
  assertSafeSnapshot(missingAck);
  assert.equal(missingAck.serverOwnershipAcknowledged, false);
  assert.equal(missingAck.actionEnabled, false);

  const mismatchedAck = controller.refresh({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        selectedProjectServerOwnedRegistration: acknowledgement({
          selectedProjectId: "env-other-project",
        }),
      },
    },
    engineRunPreview: preview(),
  });
  assertSafeSnapshot(mismatchedAck);
  assert.equal(mismatchedAck.serverOwnershipAcknowledged, false);
  assert.equal(mismatchedAck.actionEnabled, false);

  const blockedPreview = Object.freeze({ ...preview(), ready: false, failClosed: true });
  const blocked = controller.refresh({
    context: activationContext(),
    engineRunPreview: blockedPreview,
  });
  assertSafeSnapshot(blocked);
  assert.equal(blocked.previewReady, false);
  assert.equal(blocked.actionEnabled, false);
});
