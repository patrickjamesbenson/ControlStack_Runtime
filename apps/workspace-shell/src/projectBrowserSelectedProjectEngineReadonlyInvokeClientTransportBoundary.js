import {
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
} from "../../../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeHostTransportMount.js";
import {
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES,
} from "../../../packages/workspace-kernel/engineRunTableSelectedProjectShellInvokeTransportBoundary.js";

export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-READONLY-ENGINE-INVOKE-CLIENT-TRANSPORT-BOUNDARY-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-readonly-engine-invoke-client-transport-boundary.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES =
  Object.freeze({
    completed:
      "shell_project_browser_selected_project_readonly_engine_invoke_client_transport_completed",
    unavailable:
      "shell_project_browser_selected_project_readonly_engine_invoke_client_transport_unavailable",
    blockedFailClosed:
      "shell_project_browser_selected_project_readonly_engine_invoke_client_transport_blocked_fail_closed",
  });

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_REQUEST_FIELD_ORDER =
  Object.freeze(["selectedProjectId"]);

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER =
  Object.freeze([
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

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const REQUIRED_SERVER_TRUE_FLAGS = Object.freeze([
  "requestAccepted",
  "serverOwned",
  "readOnly",
  "selectedProjectOnly",
  "redactedOutcomeOnly",
  "routesAdded",
  "postEndpointsAdded",
]);
const REQUIRED_SERVER_FALSE_FLAGS = Object.freeze([
  "candidatePayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "runRowsReturned",
  "exactElectricalValuesReturned",
  "fingerprintsReturned",
  "projectEnvelopeReturned",
  "runtimeDataDetailsReturned",
  "internalSeamExposed",
  "mcpExposed",
  "shellDirectInternalCallAllowed",
  "shellMounted",
]);
const REQUIRED_LIVE_SERVER_FALSE_FLAGS = Object.freeze([
  "filesystemWriteAttempted",
  "auditJsonlWriteAttempted",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "runTableGenerated",
  "iesGenerated",
  "outputGenerated",
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function hasExactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length === expectedKeys.length
    && expectedKeys.every((key, index) => keys[index] === key);
}

function safeToken(value, fallback = null) {
  if (typeof value !== "string") return fallback;
  if (!value
    || value !== value.trim()
    || PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value)
    || !SAFE_TOKEN_PATTERN.test(value)) return fallback;
  return value;
}

function isSafeScalar(value) {
  return value === null
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isSafeInteger(value))
    || (typeof value === "string"
      && !PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value)
      && value.length <= 760);
}

function orderedResult(fields) {
  return Object.freeze(Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function clientResult({
  state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
    .blockedFailClosed,
  blocker = "selected-project-readonly-engine-client-transport-blocked",
  selectedProjectId = null,
  requestValidated = false,
  requestDispatched = false,
  responseReceived = false,
  responseValidated = false,
  httpStatus = null,
  serverState = null,
  serverReadiness = null,
  serverRequestAccepted = false,
  sourceBoundaryReconstructedServerSide = false,
  sourceBoundaryReady = false,
  capabilityInvoked = false,
  capabilityCompleted = false,
} = {}) {
  const completed = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
      .completed;
  const readiness = completed
    ? "completed"
    : state
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
        .unavailable
      ? "unavailable"
      : "blocked_fail_closed";

  return orderedResult({
    schemaId:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION,
    contractId:
      SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID,
    owner: "shell-browser-client",
    state,
    readiness,
    ok: completed,
    failClosed: !completed,
    blocker: completed
      ? null
      : safeToken(blocker, "selected-project-readonly-engine-client-transport-blocked"),
    selectedProjectId: safeToken(selectedProjectId),
    requestValidated: requestValidated === true,
    requestDispatched: requestDispatched === true,
    responseReceived: responseReceived === true,
    responseValidated: responseValidated === true,
    httpStatus: Number.isSafeInteger(httpStatus) ? httpStatus : null,
    serverState: safeToken(serverState),
    serverReadiness: safeToken(serverReadiness),
    serverRequestAccepted: serverRequestAccepted === true,
    sourceBoundaryReconstructedServerSide:
      sourceBoundaryReconstructedServerSide === true,
    sourceBoundaryReady: sourceBoundaryReady === true,
    capabilityInvoked: capabilityInvoked === true,
    capabilityCompleted: capabilityCompleted === true,
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
  });
}

function validateClientRequest(request) {
  if (!hasExactKeys(
    request,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_REQUEST_FIELD_ORDER,
  )) {
    return "selected-project-readonly-engine-client-request-shape-invalid";
  }
  if (safeToken(request.selectedProjectId) !== request.selectedProjectId) {
    return "selected-project-readonly-engine-client-selected-project-id-invalid";
  }
  return null;
}

function buildTransportRequest(selectedProjectId) {
  const fields = {
    schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
    contractId:
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
    requestKind: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND,
    selectedProjectId,
    readOnly: true,
    selectedProjectOnly: true,
  };
  return Object.freeze(Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function validateResponseBody(body, selectedProjectId) {
  const liveResponse = hasExactKeys(
    body,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER,
  );
  const baselineResponse = hasExactKeys(
    body,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER,
  );
  if ((!liveResponse && !baselineResponse) || !Object.values(body).every(isSafeScalar)) {
    return "selected-project-readonly-engine-client-response-shape-invalid";
  }
  if (body.schemaId
      !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID
    || body.schemaVersion
      !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION
    || body.contractId
      !== RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID) {
    return "selected-project-readonly-engine-client-response-schema-mismatch";
  }
  if (body.selectedProjectId !== selectedProjectId) {
    return "selected-project-readonly-engine-client-response-cross-project-refused";
  }
  for (const key of REQUIRED_SERVER_TRUE_FLAGS) {
    if (body[key] !== true) {
      return `selected-project-readonly-engine-client-response-required-flag-not-true-${key}`;
    }
  }
  for (const key of REQUIRED_SERVER_FALSE_FLAGS) {
    if (body[key] !== false) {
      return `selected-project-readonly-engine-client-response-required-flag-not-false-${key}`;
    }
  }
  if (liveResponse) {
    for (const key of REQUIRED_LIVE_SERVER_FALSE_FLAGS) {
      if (body[key] !== false) {
        return `selected-project-readonly-engine-client-response-live-required-flag-not-false-${key}`;
      }
    }
    if (body.serverOwnedRevisionChecked !== true) {
      return "selected-project-readonly-engine-client-response-live-server-revision-not-checked";
    }
    if (body.inFlightInvocationBlocked === true
      && (body.capabilityInvoked === true || body.invocationConsumed === true)) {
      return "selected-project-readonly-engine-client-response-live-concurrent-lifecycle-invalid";
    }
    if (body.replayBlocked === true && body.invocationConsumed !== true) {
      return "selected-project-readonly-engine-client-response-live-replay-lifecycle-invalid";
    }
    if (body.capabilityCompleted === true
      && (body.invocationConsumed !== true
        || body.secondServerOwnedEnvelopeRevisionCheckPassed !== true
        || body.filesystemWriteGuardActive !== true)) {
      return "selected-project-readonly-engine-client-response-live-completed-lifecycle-invalid";
    }
  }
  if (body.sourceBoundaryReady === true
    && body.sourceBoundaryReconstructedServerSide !== true) {
    return "selected-project-readonly-engine-client-response-source-lifecycle-invalid";
  }
  if (body.capabilityInvoked === true && body.sourceBoundaryReady !== true) {
    return "selected-project-readonly-engine-client-response-capability-lifecycle-invalid";
  }
  if (body.capabilityCompleted === true && body.capabilityInvoked !== true) {
    return "selected-project-readonly-engine-client-response-completion-lifecycle-invalid";
  }

  const completedState =
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed;
  const unavailableState =
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable;
  const blockedState =
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES
      .blockedFailClosed;
  if (![completedState, unavailableState, blockedState].includes(body.state)) {
    return "selected-project-readonly-engine-client-response-state-invalid";
  }

  if (body.state === completedState) {
    if (body.readiness !== "completed"
      || body.ok !== true
      || body.failClosed !== false
      || body.blocker !== null
      || body.sourceBoundaryReconstructedServerSide !== true
      || body.sourceBoundaryReady !== true
      || body.capabilityInvoked !== true
      || body.capabilityCompleted !== true) {
      return "selected-project-readonly-engine-client-response-completed-contract-invalid";
    }
    return null;
  }

  const expectedReadiness = body.state === unavailableState
    ? "unavailable"
    : "blocked_fail_closed";
  if (body.readiness !== expectedReadiness
    || body.ok !== false
    || body.failClosed !== true
    || safeToken(body.blocker) === null
    || body.capabilityCompleted !== false) {
    return "selected-project-readonly-engine-client-response-fail-closed-contract-invalid";
  }
  return null;
}

function expectedHttpStatus(body) {
  return body.state
      === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed
    ? 200
    : 422;
}

function projectValidatedResponse(body, httpStatus) {
  const state = body.state
      === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed
    ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
      .completed
    : body.state
        === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable
      ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
        .unavailable
      : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
        .blockedFailClosed;

  return clientResult({
    state,
    blocker: body.blocker,
    selectedProjectId: body.selectedProjectId,
    requestValidated: true,
    requestDispatched: true,
    responseReceived: true,
    responseValidated: true,
    httpStatus,
    serverState: body.state,
    serverReadiness: body.readiness,
    serverRequestAccepted: body.requestAccepted,
    sourceBoundaryReconstructedServerSide:
      body.sourceBoundaryReconstructedServerSide,
    sourceBoundaryReady: body.sourceBoundaryReady,
    capabilityInvoked: body.capabilityInvoked,
    capabilityCompleted: body.capabilityCompleted,
  });
}

export function createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientTransport({
  fetchImpl = null,
} = {}) {
  return async function invokeSelectedProjectReadonlyEngineFromBrowser(request = null) {
    const requestBlocker = validateClientRequest(request);
    const selectedProjectId = safeToken(request?.selectedProjectId);
    if (requestBlocker) {
      return clientResult({
        blocker: requestBlocker,
        selectedProjectId,
      });
    }

    const browserFetch = typeof fetchImpl === "function" ? fetchImpl : globalThis.fetch;
    if (typeof browserFetch !== "function") {
      return clientResult({
        state:
          SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
            .unavailable,
        blocker: "selected-project-readonly-engine-client-fetch-unavailable",
        selectedProjectId,
        requestValidated: true,
      });
    }

    const transportRequest = buildTransportRequest(selectedProjectId);
    let response;
    try {
      response = await browserFetch(
        RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
        {
          method:
            RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
          headers: Object.freeze({
            Accept: "application/json",
            "Content-Type": "application/json",
          }),
          credentials: "same-origin",
          cache: "no-store",
          redirect: "error",
          body: JSON.stringify(transportRequest),
        },
      );
    } catch {
      return clientResult({
        blocker: "selected-project-readonly-engine-client-request-failed",
        selectedProjectId,
        requestValidated: true,
        requestDispatched: true,
      });
    }

    const httpStatus = Number.isSafeInteger(response?.status) ? response.status : null;
    const contentType = typeof response?.headers?.get === "function"
      ? response.headers.get("content-type")
      : null;
    if (response?.redirected === true
      || typeof response?.json !== "function"
      || typeof contentType !== "string"
      || !/^application\/json(?:;|$)/i.test(contentType.trim())) {
      return clientResult({
        blocker: "selected-project-readonly-engine-client-http-response-invalid",
        selectedProjectId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    let body;
    try {
      body = await response.json();
    } catch {
      return clientResult({
        blocker: "selected-project-readonly-engine-client-response-json-invalid",
        selectedProjectId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    const responseBlocker = validateResponseBody(body, selectedProjectId);
    if (responseBlocker) {
      return clientResult({
        blocker: responseBlocker,
        selectedProjectId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }
    if (httpStatus !== expectedHttpStatus(body)) {
      return clientResult({
        blocker: "selected-project-readonly-engine-client-http-status-mismatch",
        selectedProjectId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    return projectValidatedResponse(body, httpStatus);
  };
}
