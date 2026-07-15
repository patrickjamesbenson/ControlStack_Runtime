import {
  validateShellProjectBrowserSelectedProjectEngineActionEligibility,
} from "./projectBrowserSelectedProjectEngineActionEligibility.js";
import {
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "./projectBrowserSelectedProjectEngineRunPreview.js";
import {
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES,
} from "./projectBrowserSelectedProjectEngineReadonlyInvokeClientTransportBoundary.js";

export const SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID =
  "SHELL-PROJECT-BROWSER-FIRST-ENABLED-SELECTED-PROJECT-READONLY-ENGINE-RUN-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-engine-readonly-invoke-activation.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES =
  Object.freeze({
    ready: "shell_project_browser_selected_project_engine_readonly_invoke_activation_ready",
    invoking: "shell_project_browser_selected_project_engine_readonly_invoke_activation_invoking",
    completed: "shell_project_browser_selected_project_engine_readonly_invoke_activation_completed",
    missing: "shell_project_browser_selected_project_engine_readonly_invoke_activation_missing",
    blockedFailClosed:
      "shell_project_browser_selected_project_engine_readonly_invoke_activation_blocked_fail_closed",
  });

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "owner",
    "surfaceId",
    "state",
    "readiness",
    "ready",
    "ok",
    "failClosed",
    "blocker",
    "selectedProjectId",
    "previewReady",
    "selectedProjectAndRevisionMatch",
    "stage3ActionSourceReady",
    "candidateReconstructionPreflightEligible",
    "serverOwnershipAcknowledged",
    "clientTransportMounted",
    "delegatedListenerMounted",
    "invocationInFlight",
    "revisionConsumed",
    "actionAvailable",
    "actionEnabled",
    "requestDispatched",
    "responseReceived",
    "responseAccepted",
    "responseDiscarded",
    "outcomeState",
    "outcomeReadiness",
    "outcomeOk",
    "outcomeBlocker",
    "browserConcurrentActivationBlocked",
    "browserReplayBlocked",
    "readOnly",
    "selectedProjectOnly",
    "scalarSafe",
    "redactedOutcomeOnly",
    "userGestureRequired",
    "automaticInvocationEnabled",
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
  ]);

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:@+-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const REQUIRED_CLIENT_FALSE_FLAGS = Object.freeze([
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
  const token = value.trim();
  if (!token
    || token !== value
    || PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(token)
    || !SAFE_TOKEN_PATTERN.test(token)) return fallback;
  return token;
}

function isSafeScalar(value) {
  return value === null
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isSafeInteger(value))
    || (typeof value === "string"
      && value.length <= 760
      && !PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value));
}

function eligibilityReadyForSelection(eligibility, selectedProjectId) {
  return validateShellProjectBrowserSelectedProjectEngineActionEligibility(eligibility) === null
    && eligibility.selectedProjectId === selectedProjectId;
}

function legacyPostEnginePreviewReadyForSelection(preview, selectedProjectId) {
  return isPlainObject(preview)
    && Object.isFrozen(preview)
    && hasExactKeys(
      preview,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
    )
    && Object.values(preview).every(isSafeScalar)
    && preview.schemaId === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID
    && preview.schemaVersion
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION
    && preview.state === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready
    && preview.readiness === "ready"
    && preview.ready === true
    && preview.failClosed === false
    && preview.blocker === null
    && preview.selectedProjectId === selectedProjectId
    && preview.selectedProjectFound === true
    && preview.engineRunReadinessBoundaryReady === true
    && preview.selectedResultAccepted === true
    && preview.engineVerified === true
    && preview.readOnly === true
    && preview.redacted === true
    && preview.machineValueSafe === true
    && preview.nonInteractive === true;
}

function matchingServerOwnershipAcknowledgement(
  browser,
  selectedProjectId,
  { requirePreEngineAuthority = true } = {},
) {
  const acknowledgement = browser?.selectedProjectServerOwnedRegistration;
  if (!isPlainObject(acknowledgement)
    || acknowledgement.ok !== true
    || acknowledgement.activeRevision !== true
    || acknowledgement.serverOwned !== true
    || (requirePreEngineAuthority
      && acknowledgement.preEngineActionSourceReady !== true)
    || (requirePreEngineAuthority
      && acknowledgement.candidateReconstructionPreflightEligible !== true)
    || (requirePreEngineAuthority
      && safeToken(acknowledgement.preEngineEligibilityProjectionFingerprint) === null)
    || acknowledgement.retainedInProcessMemory !== true
    || acknowledgement.filesystemPersistenceEnabled !== false
    || safeToken(acknowledgement.projectId) === null
    || safeToken(acknowledgement.localRevisionId) === null
    || safeToken(acknowledgement.serverEnvelopeId) === null
    || safeToken(acknowledgement.serverRevisionId) === null
    || safeToken(acknowledgement.localEnvelopeId) !== selectedProjectId) {
    return null;
  }
  return acknowledgement;
}

function revisionKey(selectedProjectId, acknowledgement) {
  if (!selectedProjectId || !acknowledgement) return null;
  return [
    selectedProjectId,
    acknowledgement.localRevisionId,
    acknowledgement.serverRevisionId,
  ].join("|");
}

function orderedSnapshot(fields) {
  return Object.freeze(Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function activationSnapshot({
  state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
    .blockedFailClosed,
  readiness = "blocked_fail_closed",
  blocker = "selected-project-engine-readonly-invoke-activation-blocked",
  selectedProjectId = null,
  previewReady = false,
  selectedProjectAndRevisionMatch = false,
  stage3ActionSourceReady = false,
  candidateReconstructionPreflightEligible = false,
  serverOwnershipAcknowledged = false,
  clientTransportMounted = false,
  delegatedListenerMounted = false,
  invocationInFlight = false,
  revisionConsumed = false,
  actionAvailable = false,
  actionEnabled = false,
  requestDispatched = false,
  responseReceived = false,
  responseAccepted = false,
  responseDiscarded = false,
  outcomeState = null,
  outcomeReadiness = null,
  outcomeOk = false,
  outcomeBlocker = null,
  browserConcurrentActivationBlocked = false,
  browserReplayBlocked = false,
} = {}) {
  const completed = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
      .completed;
  const ready = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.ready;
  return orderedSnapshot({
    schemaId:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_ID,
    schemaVersion:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_VERSION,
    contractId: SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID,
    owner: "shell-browser",
    surfaceId: "selected-project-engine-readonly-invoke-activation",
    state,
    readiness,
    ready,
    ok: completed,
    failClosed: !(ready || completed),
    blocker: ready || completed
      ? null
      : safeToken(blocker, "selected-project-engine-readonly-invoke-activation-blocked"),
    selectedProjectId: safeToken(selectedProjectId),
    previewReady: previewReady === true,
    selectedProjectAndRevisionMatch: selectedProjectAndRevisionMatch === true,
    stage3ActionSourceReady: stage3ActionSourceReady === true,
    candidateReconstructionPreflightEligible:
      candidateReconstructionPreflightEligible === true,
    serverOwnershipAcknowledged: serverOwnershipAcknowledged === true,
    clientTransportMounted: clientTransportMounted === true,
    delegatedListenerMounted: delegatedListenerMounted === true,
    invocationInFlight: invocationInFlight === true,
    revisionConsumed: revisionConsumed === true,
    actionAvailable: actionAvailable === true,
    actionEnabled: actionEnabled === true,
    requestDispatched: requestDispatched === true,
    responseReceived: responseReceived === true,
    responseAccepted: responseAccepted === true,
    responseDiscarded: responseDiscarded === true,
    outcomeState: safeToken(outcomeState),
    outcomeReadiness: safeToken(outcomeReadiness),
    outcomeOk: outcomeOk === true,
    outcomeBlocker: safeToken(outcomeBlocker),
    browserConcurrentActivationBlocked: browserConcurrentActivationBlocked === true,
    browserReplayBlocked: browserReplayBlocked === true,
    readOnly: true,
    selectedProjectOnly: true,
    scalarSafe: true,
    redactedOutcomeOnly: true,
    userGestureRequired: true,
    automaticInvocationEnabled: false,
    callerPayloadAccepted: false,
    candidatePayloadSent: false,
    candidatePayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    runRowsReturned: false,
    exactElectricalValuesReturned: false,
    placementCoordinatesReturned: false,
    projectEnvelopeReturned: false,
    privateCandidateReturned: false,
    fingerprintsReturned: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerated: false,
    filesystemWriteAttempted: false,
  });
}

function validateClientResult(result, selectedProjectId) {
  if (!isPlainObject(result)
    || !Object.isFrozen(result)
    || !hasExactKeys(
      result,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_RESULT_FIELD_ORDER,
    )
    || !Object.values(result).every(isSafeScalar)
    || result.schemaId
      !== SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_ID
    || result.schemaVersion
      !== SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_SCHEMA_VERSION
    || result.contractId
      !== SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_BOUNDARY_ID
    || result.selectedProjectId !== selectedProjectId
    || result.readOnly !== true
    || result.selectedProjectOnly !== true
    || result.scalarSafe !== true
    || result.redactedOutcomeOnly !== true) {
    return "selected-project-engine-readonly-invoke-client-result-invalid";
  }
  for (const key of REQUIRED_CLIENT_FALSE_FLAGS) {
    if (result[key] !== false) {
      return `selected-project-engine-readonly-invoke-client-result-unsafe-${key}`;
    }
  }
  return null;
}

function projectClientOutcome(result) {
  const completed = result.state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_CLIENT_TRANSPORT_STATES
      .completed
    && result.ok === true
    && result.responseValidated === true;
  return Object.freeze({
    completed,
    state: result.state,
    readiness: result.readiness,
    ok: result.ok === true,
    blocker: completed
      ? null
      : safeToken(result.blocker, "selected-project-engine-readonly-invoke-client-blocked"),
    requestDispatched: result.requestDispatched === true,
    responseReceived: result.responseReceived === true,
    responseAccepted: result.responseValidated === true,
  });
}

export function createShellProjectBrowserSelectedProjectEngineReadonlyInvokeActivation({
  invokeSelectedProjectReadonlyEngineClientTransport = null,
  onChange = null,
} = {}) {
  const clientTransportMounted =
    typeof invokeSelectedProjectReadonlyEngineClientTransport === "function";
  const consumedRevisionKeys = new Set();
  const outcomesByRevisionKey = new Map();
  let delegatedListenerMounted = false;
  let activeInvocation = null;
  let current = Object.freeze({
    context: {},
    eligibility: null,
    selectedProjectId: null,
    acknowledgement: null,
    revisionKey: null,
    previewReady: false,
    selectedProjectAndRevisionMatch: false,
    stage3ActionSourceReady: false,
    candidateReconstructionPreflightEligible: false,
  });
  let snapshot = activationSnapshot({ clientTransportMounted });

  function publish(nextSnapshot) {
    snapshot = nextSnapshot;
    if (typeof onChange === "function") onChange(snapshot);
    return snapshot;
  }

  function deriveCurrent({
    context = {},
    engineActionEligibility = null,
    engineRunPreview = null,
  } = {}) {
    const browser = isPlainObject(context?.projectBrowser) ? context.projectBrowser : {};
    const selectedProjectId = safeToken(browser.selectedProjectId);
    const preEngineEligibilityReady = eligibilityReadyForSelection(
      engineActionEligibility,
      selectedProjectId,
    );
    const legacyPostEngineReady = engineActionEligibility === null
      && legacyPostEnginePreviewReadyForSelection(engineRunPreview, selectedProjectId);
    const acknowledgement = matchingServerOwnershipAcknowledgement(
      browser,
      selectedProjectId,
      { requirePreEngineAuthority: !legacyPostEngineReady },
    );
    return Object.freeze({
      context,
      eligibility: engineActionEligibility,
      selectedProjectId,
      acknowledgement,
      revisionKey: revisionKey(selectedProjectId, acknowledgement),
      previewReady: preEngineEligibilityReady || legacyPostEngineReady,
      selectedProjectAndRevisionMatch: preEngineEligibilityReady
        && engineActionEligibility.selectedProjectAndRevisionMatch === true,
      stage3ActionSourceReady: preEngineEligibilityReady
        && engineActionEligibility.stage3ActionSourceReady === true,
      candidateReconstructionPreflightEligible: preEngineEligibilityReady
        && engineActionEligibility.candidateReconstructionPreflightEligible === true,
    });
  }

  function snapshotForCurrent(overrides = {}) {
    const {
      selectedProjectId,
      acknowledgement,
      revisionKey: selectedRevisionKey,
      previewReady,
      selectedProjectAndRevisionMatch,
      stage3ActionSourceReady,
      candidateReconstructionPreflightEligible,
    } = current;
    const serverOwnershipAcknowledged = acknowledgement !== null;
    const revisionConsumed = selectedRevisionKey !== null
      && consumedRevisionKeys.has(selectedRevisionKey);
    const outcome = selectedRevisionKey === null
      ? null
      : outcomesByRevisionKey.get(selectedRevisionKey) || null;
    const invocationInFlight = activeInvocation !== null;

    const common = {
      selectedProjectId,
      previewReady,
      selectedProjectAndRevisionMatch,
      stage3ActionSourceReady,
      candidateReconstructionPreflightEligible,
      serverOwnershipAcknowledged,
      clientTransportMounted,
      delegatedListenerMounted,
      invocationInFlight,
      revisionConsumed,
      ...overrides,
    };

    if (outcome) {
      return activationSnapshot({
        ...common,
        state: outcome.completed
          ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
            .completed
          : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
            .blockedFailClosed,
        readiness: outcome.completed ? "completed" : "blocked_fail_closed",
        blocker: outcome.blocker,
        requestDispatched: outcome.requestDispatched,
        responseReceived: outcome.responseReceived,
        responseAccepted: outcome.responseAccepted,
        outcomeState: outcome.state,
        outcomeReadiness: outcome.readiness,
        outcomeOk: outcome.ok,
        outcomeBlocker: outcome.blocker,
      });
    }
    if (!selectedProjectId) {
      return activationSnapshot({
        ...common,
        state:
          SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
            .missing,
        readiness: "missing",
        blocker: "selected-project-engine-readonly-invoke-selection-missing",
      });
    }
    if (!previewReady) {
      return activationSnapshot({
        ...common,
        blocker: "selected-project-engine-readonly-invoke-action-eligibility-blocked",
      });
    }
    if (!serverOwnershipAcknowledged || !selectedRevisionKey) {
      return activationSnapshot({
        ...common,
        blocker: "selected-project-engine-readonly-invoke-server-ownership-not-acknowledged",
      });
    }
    if (!clientTransportMounted) {
      return activationSnapshot({
        ...common,
        blocker: "selected-project-engine-readonly-invoke-client-transport-not-mounted",
      });
    }
    if (!delegatedListenerMounted) {
      return activationSnapshot({
        ...common,
        blocker: "selected-project-engine-readonly-invoke-user-gesture-listener-not-mounted",
      });
    }
    if (invocationInFlight) {
      return activationSnapshot({
        ...common,
        state:
          SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
            .invoking,
        readiness: "invoking",
        blocker: "selected-project-engine-readonly-invoke-in-flight",
        requestDispatched: activeInvocation?.requestDispatched === true,
      });
    }
    if (revisionConsumed) {
      return activationSnapshot({
        ...common,
        blocker: "selected-project-engine-readonly-invoke-browser-replay-blocked",
        browserReplayBlocked: true,
      });
    }
    return activationSnapshot({
      ...common,
      state:
        SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.ready,
      readiness: "ready",
      blocker: null,
      actionAvailable: true,
      actionEnabled: true,
    });
  }

  function refresh(inputs = {}) {
    current = deriveCurrent(inputs);
    return publish(snapshotForCurrent());
  }

  function setDelegatedListenerMounted(mounted = true) {
    delegatedListenerMounted = mounted === true;
    return publish(snapshotForCurrent());
  }

  async function activate() {
    const gestureSnapshot = snapshotForCurrent();
    if (activeInvocation !== null) {
      return publish(snapshotForCurrent({
        browserConcurrentActivationBlocked: true,
      }));
    }
    if (gestureSnapshot.ready !== true || current.revisionKey === null) {
      if (gestureSnapshot.revisionConsumed === true) {
        return publish(snapshotForCurrent({ browserReplayBlocked: true }));
      }
      return publish(gestureSnapshot);
    }

    const capturedSelectedProjectId = current.selectedProjectId;
    const capturedRevisionKey = current.revisionKey;
    consumedRevisionKeys.add(capturedRevisionKey);
    activeInvocation = {
      selectedProjectId: capturedSelectedProjectId,
      revisionKey: capturedRevisionKey,
      requestDispatched: false,
    };
    publish(snapshotForCurrent());

    let result;
    try {
      activeInvocation.requestDispatched = true;
      publish(snapshotForCurrent());
      result = await invokeSelectedProjectReadonlyEngineClientTransport(Object.freeze({
        selectedProjectId: capturedSelectedProjectId,
      }));
    } catch {
      result = null;
    }

    activeInvocation = null;
    const responseIsStale = current.selectedProjectId !== capturedSelectedProjectId
      || current.revisionKey !== capturedRevisionKey;
    if (responseIsStale) {
      const discarded = activationSnapshot({
        state:
          SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
            .blockedFailClosed,
        readiness: "blocked_fail_closed",
        blocker: "selected-project-engine-readonly-invoke-stale-response-discarded",
        selectedProjectId: capturedSelectedProjectId,
        previewReady: true,
        selectedProjectAndRevisionMatch: true,
        stage3ActionSourceReady: true,
        candidateReconstructionPreflightEligible: true,
        serverOwnershipAcknowledged: true,
        clientTransportMounted,
        delegatedListenerMounted,
        revisionConsumed: true,
        requestDispatched: true,
        responseReceived: result !== null,
        responseAccepted: false,
        responseDiscarded: true,
        outcomeState: "stale_response_discarded",
        outcomeReadiness: "blocked_fail_closed",
        outcomeOk: false,
        outcomeBlocker: "selected-project-engine-readonly-invoke-stale-response-discarded",
      });
      publish(snapshotForCurrent());
      return discarded;
    }

    const resultBlocker = validateClientResult(result, capturedSelectedProjectId);
    const outcome = resultBlocker
      ? Object.freeze({
        completed: false,
        state: "client_result_invalid",
        readiness: "blocked_fail_closed",
        ok: false,
        blocker: resultBlocker,
        requestDispatched: true,
        responseReceived: result !== null,
        responseAccepted: false,
      })
      : projectClientOutcome(result);
    outcomesByRevisionKey.set(capturedRevisionKey, outcome);
    return publish(snapshotForCurrent());
  }

  return Object.freeze({
    getSnapshot() {
      return snapshot;
    },
    refresh,
    setDelegatedListenerMounted,
    activate,
  });
}
