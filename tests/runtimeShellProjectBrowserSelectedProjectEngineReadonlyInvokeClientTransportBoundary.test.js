import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_REQUEST_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary.js";
import {
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js";
import {
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js";

const PROJECT_ID = "client-transport-boundary-project";

const EXPECTED_CLIENT_STATES = Object.freeze({
  completed:
    "shell_project_browser_selected_project_readonly_engine_invoke_client_transport_completed",
  unavailable:
    "shell_project_browser_selected_project_readonly_engine_invoke_client_transport_unavailable",
  blockedFailClosed:
    "shell_project_browser_selected_project_readonly_engine_invoke_client_transport_blocked_fail_closed",
});

const EXPECTED_CLIENT_RESULT_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "state",
  "readiness",
  "ok",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "requestValidated",
  "requestDispatched",
  "responseReceived",
  "responseValidated",
  "httpStatus",
  "serverState",
  "serverReadiness",
  "serverRequestAccepted",
  "sourceBoundaryReconstructedServerSide",
  "sourceBoundaryReady",
  "capabilityInvoked",
  "capabilityCompleted",
  "readOnly",
  "selectedProjectOnly",
  "scalarSafe",
  "redactedOutcomeOnly",
  "renderingMounted",
  "engineActionAvailable",
  "engineActionEnabled",
  "userGestureListenerAdded",
  "preparedActionRetained",
  "automaticInvocationEnabled",
  "candidatePayloadAccepted",
  "candidatePayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "runRowsReturned",
  "exactElectricalValuesReturned",
  "projectEnvelopeReturned",
  "privateCandidateReturned",
  "fingerprintsReturned",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "outputGenerated",
  "routesAdded",
  "postEndpointsAdded",
]);

const REQUIRED_FALSE_CLIENT_FLAGS = Object.freeze([
  "renderingMounted",
  "engineActionAvailable",
  "engineActionEnabled",
  "userGestureListenerAdded",
  "preparedActionRetained",
  "automaticInvocationEnabled",
  "candidatePayloadAccepted",
  "candidatePayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "runRowsReturned",
  "exactElectricalValuesReturned",
  "projectEnvelopeReturned",
  "privateCandidateReturned",
  "fingerprintsReturned",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "outputGenerated",
  "routesAdded",
  "postEndpointsAdded",
]);

function orderedServerResponse(fields) {
  return Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function serverResponse({
  selectedProjectId = PROJECT_ID,
  state = RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed,
  overrides = {},
} = {}) {
  const completed = state
    === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed;
  const unavailable = state
    === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable;
  return orderedServerResponse({
    schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
    contractId:
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
    state,
    readiness: completed ? "completed" : unavailable ? "unavailable" : "blocked_fail_closed",
    ok: completed,
    failClosed: !completed,
    blocker: completed ? null : "selected-project-shell-invoke-transport-safe-blocker",
    selectedProjectId,
    requestAccepted: true,
    serverOwned: true,
    sourceBoundaryReconstructedServerSide: completed,
    sourceBoundaryReady: completed,
    capabilityInvoked: completed,
    capabilityCompleted: completed,
    readOnly: true,
    selectedProjectOnly: true,
    redactedOutcomeOnly: true,
    candidatePayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    runRowsReturned: false,
    exactElectricalValuesReturned: false,
    fingerprintsReturned: false,
    projectEnvelopeReturned: false,
    runtimeDataDetailsReturned: false,
    internalSeamExposed: false,
    mcpExposed: false,
    shellDirectInternalCallAllowed: false,
    shellMounted: false,
    routesAdded: true,
    postEndpointsAdded: true,
    ...overrides,
  });
}

function liveServerResponse() {
  const baseline = serverResponse();
  const fields = {
    ...baseline,
    serverOwnedRevisionChecked: true,
    inFlightInvocationBlocked: false,
    invocationConsumed: true,
    replayBlocked: false,
    staleServerRevisionBlocked: false,
    secondServerOwnedEnvelopeRevisionCheckPassed: true,
    activeRuntimeDataLoadedReadOnly: true,
    activeRuntimeDataPassedInMemoryOnly: true,
    donorRunEngineAttempted: true,
    donorBridgeUsed: false,
    filesystemWriteGuardActive: true,
    filesystemWriteAttempted: false,
    auditJsonlWriteAttempted: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerated: false,
  };
  return Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function jsonResponse(body, status, {
  contentType = "application/json; charset=utf-8",
  redirected = false,
  jsonError = null,
} = {}) {
  return {
    status,
    redirected,
    headers: {
      get(name) {
        return String(name).toLowerCase() === "content-type" ? contentType : null;
      },
    },
    async json() {
      if (jsonError) throw jsonError;
      return body;
    },
  };
}

function assertSafeClientResult(result) {
  assert.equal(Object.isFrozen(result), true);
  assert.deepEqual(Object.keys(result), EXPECTED_CLIENT_RESULT_FIELD_ORDER);
  assert.equal(result.schemaId,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID);
  assert.equal(result.schemaVersion,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION);
  assert.equal(result.contractId,
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID);
  assert.equal(result.owner, "shell-browser-client");
  assert.equal(result.readOnly, true);
  assert.equal(result.selectedProjectOnly, true);
  assert.equal(result.scalarSafe, true);
  assert.equal(result.redactedOutcomeOnly, true);
  for (const key of REQUIRED_FALSE_CLIENT_FLAGS) assert.equal(result[key], false, key);
  for (const [key, value] of Object.entries(result)) {
    assert.equal(value === null || ["string", "number", "boolean"].includes(typeof value), true, key);
  }
  assert.doesNotMatch(JSON.stringify(result), /[A-Za-z]:[\\/]|\\\\|\.ies\b|IESNA:LM-63|TILT\s*=/i);
}

test("client boundary fixes identifiers, states, field order, and performs no automatic invocation", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-READONLY-ENGINE-INVOKE-CLIENT-TRANSPORT-BOUNDARY-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-readonly-engine-invoke-client-transport-boundary.v1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION,
    1,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES,
    EXPECTED_CLIENT_STATES,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_REQUEST_FIELD_ORDER,
    ["selectedProjectId"],
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER,
    EXPECTED_CLIENT_RESULT_FIELD_ORDER,
  );

  let calls = 0;
  const invoke = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
    fetchImpl() {
      calls += 1;
      throw new Error("must not run during construction");
    },
  });
  assert.equal(typeof invoke, "function");
  assert.equal(calls, 0);
});

test("client accepts only one exact selected-project identity and does not dispatch widened or unsafe input", async () => {
  let calls = 0;
  const invoke = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
    fetchImpl() {
      calls += 1;
      throw new Error("invalid requests must not dispatch");
    },
  });

  const invalidRequests = [
    null,
    {},
    { selectedProjectId: "" },
    { selectedProjectId: ` ${PROJECT_ID}` },
    { selectedProjectId: "C:\\private\\project" },
    { selectedProjectId: PROJECT_ID, candidate: { tier: "Business" } },
    { selectedProjectId: PROJECT_ID, projectEnvelope: {} },
    { selectedProjectId: PROJECT_ID, engineOptions: {} },
  ];

  for (const request of invalidRequests) {
    const result = await invoke(request);
    assertSafeClientResult(result);
    assert.equal(result.state, EXPECTED_CLIENT_STATES.blockedFailClosed);
    assert.equal(result.ok, false);
    assert.equal(result.failClosed, true);
    assert.equal(result.requestValidated, false);
    assert.equal(result.requestDispatched, false);
    assert.equal(result.responseReceived, false);
    assert.equal(result.responseValidated, false);
  }
  assert.equal(calls, 0);
});

test("client posts the exact selected-project-only request and projects one validated completed response", async () => {
  let capturedUrl = null;
  let capturedOptions = null;
  const invoke = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
    fetchImpl(url, options) {
      capturedUrl = url;
      capturedOptions = options;
      return jsonResponse(serverResponse(), 200);
    },
  });

  const result = await invoke({ selectedProjectId: PROJECT_ID });

  assert.equal(
    capturedUrl,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
  );
  assert.equal(
    capturedOptions.method,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
  );
  assert.deepEqual(capturedOptions.headers, {
    Accept: "application/json",
    "Content-Type": "application/json",
  });
  assert.equal(Object.isFrozen(capturedOptions.headers), true);
  assert.equal(capturedOptions.credentials, "same-origin");
  assert.equal(capturedOptions.cache, "no-store");
  assert.equal(capturedOptions.redirect, "error");

  const requestBody = JSON.parse(capturedOptions.body);
  assert.deepEqual(Object.keys(requestBody),
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER);
  assert.deepEqual(requestBody, {
    schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
    contractId:
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
    requestKind: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
    selectedProjectId: PROJECT_ID,
    readOnly: true,
    selectedProjectOnly: true,
  });
  for (const forbidden of [
    "candidate",
    "privateCandidate",
    "selectorPayload",
    "projectEnvelope",
    "database",
    "filePath",
    "engineOptions",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(requestBody, forbidden), false, forbidden);
  }

  assertSafeClientResult(result);
  assert.equal(result.state, EXPECTED_CLIENT_STATES.completed);
  assert.equal(result.readiness, "completed");
  assert.equal(result.ok, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.blocker, null);
  assert.equal(result.selectedProjectId, PROJECT_ID);
  assert.equal(result.requestValidated, true);
  assert.equal(result.requestDispatched, true);
  assert.equal(result.responseReceived, true);
  assert.equal(result.responseValidated, true);
  assert.equal(result.httpStatus, 200);
  assert.equal(result.serverRequestAccepted, true);
  assert.equal(result.sourceBoundaryReconstructedServerSide, true);
  assert.equal(result.sourceBoundaryReady, true);
  assert.equal(result.capabilityInvoked, true);
  assert.equal(result.capabilityCompleted, true);
});

test("client accepts the live revision lifecycle and no-write response shape", async () => {
  const invoke = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
    fetchImpl() {
      return jsonResponse(liveServerResponse(), 200);
    },
  });

  const result = await invoke({ selectedProjectId: PROJECT_ID });
  assertSafeClientResult(result);
  assert.equal(result.state, EXPECTED_CLIENT_STATES.completed);
  assert.equal(result.ok, true);
  assert.equal(result.responseValidated, true);
  assert.equal(result.capabilityCompleted, true);
});

test("client validates accepted fail-closed HTTP 422 responses without treating them as raw transport failures", async () => {
  const blockedBody = serverResponse({
    state:
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES
        .blockedFailClosed,
  });
  const unavailableBody = serverResponse({
    state: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable,
    overrides: {
      sourceBoundaryReconstructedServerSide: true,
      sourceBoundaryReady: true,
    },
  });
  const responses = [
    [blockedBody, EXPECTED_CLIENT_STATES.blockedFailClosed, "blocked_fail_closed"],
    [unavailableBody, EXPECTED_CLIENT_STATES.unavailable, "unavailable"],
  ];

  for (const [body, expectedState, expectedReadiness] of responses) {
    const invoke = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
      fetchImpl() {
        return jsonResponse(body, 422);
      },
    });
    const result = await invoke({ selectedProjectId: PROJECT_ID });
    assertSafeClientResult(result);
    assert.equal(result.state, expectedState);
    assert.equal(result.readiness, expectedReadiness);
    assert.equal(result.ok, false);
    assert.equal(result.failClosed, true);
    assert.equal(result.blocker, body.blocker);
    assert.equal(result.responseValidated, true);
    assert.equal(result.httpStatus, 422);
    assert.equal(result.serverState, body.state);
    assert.equal(result.serverReadiness, body.readiness);
  }
});

test("client fails closed on malformed, widened, unsafe, cross-project, lifecycle, and HTTP response drift", async () => {
  const completed = serverResponse();
  const widened = { ...completed, rawEngineResult: { rows: [1] } };
  const reordered = Object.fromEntries(Object.entries(completed).reverse());
  const cases = [
    [widened, 200, {}, "response-shape-invalid"],
    [reordered, 200, {}, "response-shape-invalid"],
    [serverResponse({ selectedProjectId: "another-project" }), 200, {}, "cross-project-refused"],
    [serverResponse({ overrides: { rawEngineResultReturned: true } }), 200, {}, "required-flag-not-false"],
    [serverResponse({ overrides: { serverOwned: false } }), 200, {}, "required-flag-not-true"],
    [serverResponse({ overrides: { blocker: "C:\\private\\candidate.ies" } }), 200, {}, "response-shape-invalid"],
    [serverResponse({ overrides: { capabilityInvoked: true, sourceBoundaryReady: false } }), 200, {}, "capability-lifecycle-invalid"],
    [serverResponse({ overrides: { schemaVersion: 99 } }), 200, {}, "schema-mismatch"],
    [completed, 422, {}, "http-status-mismatch"],
    [completed, 200, { contentType: "text/html" }, "http-response-invalid"],
    [completed, 200, { redirected: true }, "http-response-invalid"],
    [completed, 200, { jsonError: new Error("invalid json") }, "response-json-invalid"],
  ];

  for (const [body, status, responseOptions, blockerFragment] of cases) {
    const invoke = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
      fetchImpl() {
        return jsonResponse(body, status, responseOptions);
      },
    });
    const result = await invoke({ selectedProjectId: PROJECT_ID });
    assertSafeClientResult(result);
    assert.equal(result.state, EXPECTED_CLIENT_STATES.blockedFailClosed);
    assert.equal(result.ok, false);
    assert.equal(result.failClosed, true);
    assert.match(result.blocker, new RegExp(blockerFragment));
    assert.equal(result.selectedProjectId, PROJECT_ID);
    assert.equal(result.requestValidated, true);
    assert.equal(result.requestDispatched, true);
    assert.equal(result.responseReceived, true);
    assert.equal(result.responseValidated, false);
    assert.equal(result.serverState, null);
    assert.equal(result.serverReadiness, null);
    assert.equal(result.serverRequestAccepted, false);
  }
});

test("client fails closed on missing fetch and thrown request without retaining a prepared action", async () => {
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = undefined;
    const unavailableInvoke =
      createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport();
    const unavailable = await unavailableInvoke({ selectedProjectId: PROJECT_ID });
    assertSafeClientResult(unavailable);
    assert.equal(unavailable.state, EXPECTED_CLIENT_STATES.unavailable);
    assert.equal(unavailable.requestValidated, true);
    assert.equal(unavailable.requestDispatched, false);
    assert.equal(unavailable.responseReceived, false);

    const failedInvoke =
      createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
        fetchImpl() {
          throw new Error("network failure with private detail C:\\private\\candidate.ies");
        },
      });
    const failed = await failedInvoke({ selectedProjectId: PROJECT_ID });
    assertSafeClientResult(failed);
    assert.equal(failed.state, EXPECTED_CLIENT_STATES.blockedFailClosed);
    assert.equal(failed.requestValidated, true);
    assert.equal(failed.requestDispatched, true);
    assert.equal(failed.responseReceived, false);
    assert.equal(failed.blocker, "selected-project-readonly-engine-client-request-failed");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("client source remains separate from rendering, the disabled Run Engine button, prepared actions, persistence, output, and direct internal seams", async () => {
  const [clientSource, shellSource, actionLaneSource, mountSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  const clientModuleName =
    "projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary";
  assert.match(shellSource, new RegExp(clientModuleName));
  assert.doesNotMatch(actionLaneSource, new RegExp(clientModuleName));
  assert.doesNotMatch(mountSource, new RegExp(clientModuleName));

  assert.doesNotMatch(
    clientSource,
    /document\.|HTMLElement|querySelector|createElement|appendChild|innerHTML|addEventListener|onclick\s*=|onClick\s*:/,
  );
  assert.doesNotMatch(
    clientSource,
    /stableFingerprint|sourceBoundaryFingerprint|candidateFingerprint|outcomeFingerprint/,
  );
  assert.doesNotMatch(
    clientSource,
    /localStorage|sessionStorage|indexedDB|writeFile|appendFile|setProjectEnvelope|persistSelectedResult|generateRunTable|generateIes|engine_runtable_internal_readonly_invoke|directMcp/,
  );
  assert.doesNotMatch(
    clientSource,
    /candidatePayload\s*:|selectorPayload\s*:|projectEnvelope\s*:|engineOptions\s*:|databasePath\s*:|filePath\s*:/,
  );
  assert.match(clientSource, /engineActionEnabled: false/);
  assert.match(clientSource, /userGestureListenerAdded: false/);
  assert.match(clientSource, /preparedActionRetained: false/);
  assert.match(clientSource, /automaticInvocationEnabled: false/);
  assert.match(clientSource, /runtimeDataMutated: false/);
  assert.match(clientSource, /outputGenerated: false/);
});
