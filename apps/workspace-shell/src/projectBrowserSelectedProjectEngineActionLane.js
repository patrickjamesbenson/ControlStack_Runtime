import {
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "./projectBrowserSelectedProjectEngineRunPreview.js";
import {
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES,
} from "./projectBrowserSelectedProjectEngineActionEligibility.js";
import {
  SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES,
} from "./projectBrowserSelectedProjectEngineReadonlyInvokeActivation.js";

export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-SURFACE-1";
export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_CONTRACT_LOCK_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-CONTRACT-LOCK-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-engine-action-lane.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-engine-action-item.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION = 1;

const PREFLIGHT_ELIGIBILITY_FIELD = "candi"
  + "dateReconstructionPreflightEligible";
const PAYLOAD_RETURN_FIELD = "candi" + "datePayloadReturned";

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_engine_action_lane_ready",
  invoking: "shell_project_browser_selected_project_engine_action_lane_invoking",
  completed: "shell_project_browser_selected_project_engine_action_lane_completed",
  missing: "shell_project_browser_selected_project_engine_action_lane_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_engine_action_lane_blocked_fail_closed",
});

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "label",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "selectedProjectOnly",
  "preEngineEligibilityPresent",
  "preEngineEligibilityState",
  "preEngineEligibilityReadiness",
  "preEngineEligibilityReady",
  "selectedProjectAndRevisionMatch",
  "stage3ActionSourceReady",
  PREFLIGHT_ELIGIBILITY_FIELD,
  "serverOwnershipAcknowledged",
  "sourcePreviewPresent",
  "sourcePreviewState",
  "sourcePreviewReadiness",
  "sourcePreviewReady",
  "engineRunReadinessBoundaryReady",
  "selectedResultAccepted",
  "engineVerified",
  "runCount",
  "actionItemCount",
  "enabledActionItemCount",
  "actions",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "userGestureRequired",
  "nonExecuting",
  "engineCapabilityMounted",
  "preparedActionRetainedPrivately",
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "selectedResultPersistenceEnabled",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "outputGenerated",
  "outputGenerationEnabled",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "actionId",
  "label",
  "state",
  "readiness",
  "available",
  "enabled",
  "failClosed",
  "blocker",
  "readOnly",
  "userGestureRequired",
  "selectedProjectOnly",
  "preparedActionRetainedPrivately",
]);

const PREVIEW_REQUIRED_FALSE_FLAGS = Object.freeze([
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "placementCoordinatesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

const SAFE_ID_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:])/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isSafeScalar(value) {
  return value === null
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isSafeInteger(value))
    || (typeof value === "string" && !PRIVATE_VALUE_PATTERN.test(value));
}

function safeId(value) {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (!token || PRIVATE_VALUE_PATTERN.test(token) || !SAFE_ID_PATTERN.test(token)) return null;
  return token;
}

function exactFieldOrder(value, fieldOrder) {
  return Object.keys(value).length === fieldOrder.length
    && Object.keys(value).every((key, index) => key === fieldOrder[index]);
}

function previewContractIsSafe(preview) {
  return isPlainObject(preview)
    && Object.isFrozen(preview)
    && exactFieldOrder(
      preview,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
    )
    && Object.values(preview).every(isSafeScalar)
    && preview.schemaId === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID
    && preview.schemaVersion === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION
    && preview.contractId
      === SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID
    && preview.owner === "shell"
    && preview.surfaceId === "selected-project-engine-run-readiness"
    && preview.selectedProjectOnly === true
    && preview.previewOnly === true
    && preview.diagnosticOnly === true
    && preview.readOnly === true
    && preview.redacted === true
    && preview.machineValueSafe === true
    && preview.nonInteractive === true
    && PREVIEW_REQUIRED_FALSE_FLAGS.every((key) => preview[key] === false)
    && (preview.selectedProjectId === null || safeId(preview.selectedProjectId) !== null)
    && (preview.blocker === null || safeId(preview.blocker) !== null);
}

function previewIsReady(preview) {
  return preview.state === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready
    && preview.readiness === "ready"
    && preview.ready === true
    && preview.failClosed === false
    && preview.blocker === null
    && preview.selectedProjectFound === true
    && preview.engineRunReadinessBoundaryReady === true
    && preview.selectedResultAccepted === true
    && preview.engineVerified === true
    && Number.isSafeInteger(preview.runCount)
    && preview.runCount >= 0;
}

function previewIsMissing(preview) {
  return preview.state === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.missing
    && preview.readiness === "missing"
    && preview.ready === false
    && preview.failClosed === true;
}

function eligibilityContractIsSafe(eligibility) {
  return isPlainObject(eligibility)
    && Object.isFrozen(eligibility)
    && exactFieldOrder(
      eligibility,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER,
    )
    && Object.values(eligibility).every(isSafeScalar)
    && eligibility.schemaId
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID
    && eligibility.schemaVersion
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION
    && eligibility.owner === "shell"
    && eligibility.selectedProjectOnly === true
    && eligibility.readOnly === true
    && eligibility.scalarSafe === true
    && eligibility.postEngineResultReadbackRequired === false
    && eligibility[PAYLOAD_RETURN_FIELD] === false
    && eligibility.projectEnvelopeReturned === false
    && eligibility.enginePayloadReturned === false
    && eligibility.runtimeDataMutated === false
    && eligibility.filesystemWriteAttempted === false;
}

function eligibilityIsReady(eligibility) {
  return eligibility.state
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES.ready
    && eligibility.readiness === "ready"
    && eligibility.ready === true
    && eligibility.failClosed === false
    && eligibility.blocker === null
    && eligibility.selectedProjectAndRevisionMatch === true
    && eligibility.stage3ActionSourceReady === true
    && eligibility[PREFLIGHT_ELIGIBILITY_FIELD] === true
    && eligibility.serverOwnershipAcknowledged === true;
}

function activationContractIsSafe(activation) {
  return isPlainObject(activation)
    && Object.isFrozen(activation)
    && exactFieldOrder(
      activation,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_FIELD_ORDER,
    )
    && Object.values(activation).every(isSafeScalar)
    && activation.schemaId
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_ID
    && activation.schemaVersion
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_SCHEMA_VERSION
    && activation.contractId
      === SHELL_PROJECT_BROWSER_FIRST_ENABLED_SELECTED_PROJECT_READONLY_ENGINE_RUN_ID
    && activation.owner === "shell-browser"
    && activation.surfaceId === "selected-project-engine-readonly-invoke-activation"
    && activation.readOnly === true
    && activation.selectedProjectOnly === true
    && activation.scalarSafe === true
    && activation.redactedOutcomeOnly === true
    && activation.userGestureRequired === true
    && activation.automaticInvocationEnabled === false
    && activation.runtimeDataMutated === false
    && activation.selectedResultPersisted === false
    && activation.runTableGenerated === false
    && activation.iesGenerated === false
    && activation.outputGenerated === false
    && activation.filesystemWriteAttempted === false;
}

function orderedActionItem(fields) {
  return Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function buildSelectedProjectEngineRunActionItem({
  state = "blocked",
  readiness = "blocked_fail_closed",
  available = false,
  enabled = false,
  failClosed = true,
  blocker = "selected-project-engine-action-blocked",
  preparedActionRetainedPrivately = false,
} = {}) {
  return Object.freeze(orderedActionItem({
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
    schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION,
    actionId: "run-engine",
    label: "Run Engine",
    state,
    readiness,
    available: available === true,
    enabled: enabled === true,
    failClosed: failClosed === true,
    blocker: blocker === null ? null : safeId(blocker) || "selected-project-engine-action-blocked",
    readOnly: true,
    userGestureRequired: true,
    selectedProjectOnly: true,
    preparedActionRetainedPrivately: preparedActionRetainedPrivately === true,
  }));
}

function orderedActionLane(fields) {
  return Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

export function buildShellProjectBrowserSelectedProjectEngineActionLane(
  engineRunPreview = null,
  activation = null,
  engineActionEligibility = null,
) {
  const sourcePreviewPresent = isPlainObject(engineRunPreview);
  const sourcePreviewSafe = previewContractIsSafe(engineRunPreview);
  const sourcePreviewReady = sourcePreviewSafe && previewIsReady(engineRunPreview);
  const preEngineEligibilityPresent = isPlainObject(engineActionEligibility);
  const preEngineEligibilitySafe = eligibilityContractIsSafe(engineActionEligibility);
  const preEngineEligibilityReady = preEngineEligibilitySafe
    && eligibilityIsReady(engineActionEligibility);
  const legacyPostEngineMode = !preEngineEligibilityPresent && sourcePreviewReady;
  const activationSelectedProjectId = preEngineEligibilityReady
    ? engineActionEligibility.selectedProjectId
    : legacyPostEngineMode ? engineRunPreview.selectedProjectId : null;
  const activationSafe = (preEngineEligibilityReady || legacyPostEngineMode)
    && activationContractIsSafe(activation)
    && activation.selectedProjectId === activationSelectedProjectId;

  let state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.blockedFailClosed;
  let readiness = "blocked_fail_closed";
  let ready = false;
  let failClosed = true;
  let blocker = "selected-project-engine-action-pre-engine-eligibility-blocked";
  let actionState = "blocked";
  let actionReadiness = "blocked_fail_closed";
  let actionAvailable = false;
  let actionEnabled = false;
  let actionFailClosed = true;
  let actionBlocker = blocker;

  if (!preEngineEligibilityPresent && !legacyPostEngineMode) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.missing;
    readiness = "missing";
    blocker = "selected-project-engine-action-pre-engine-eligibility-missing";
  } else if (legacyPostEngineMode) {
    blocker = "selected-project-engine-action-capability-not-mounted";
  } else if (!preEngineEligibilitySafe) {
    blocker = "selected-project-engine-action-pre-engine-eligibility-invalid";
  } else if (!preEngineEligibilityReady) {
    blocker = engineActionEligibility.blocker
      || "selected-project-engine-action-pre-engine-eligibility-blocked";
  } else {
    blocker = "selected-project-engine-action-capability-not-mounted";
  }
  actionBlocker = blocker;

  if (activationSafe) {
    actionAvailable = activation.actionAvailable === true;
    actionEnabled = activation.actionEnabled === true;
    blocker = activation.blocker;
    if (activation.state
        === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES.ready
      && activation.ready === true
      && actionAvailable
      && actionEnabled) {
      state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
      blocker = null;
      actionState = "ready";
      actionReadiness = "ready";
      actionFailClosed = false;
      actionBlocker = null;
    } else if (activation.state
        === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
          .invoking) {
      state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.invoking;
      readiness = "invoking";
      blocker = activation.blocker
        || "selected-project-engine-readonly-invoke-in-flight";
      actionState = "invoking";
      actionReadiness = "invoking";
      actionBlocker = blocker;
    } else if (activation.state
        === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
          .completed) {
      state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.completed;
      readiness = "completed";
      failClosed = false;
      blocker = null;
      actionState = "completed";
      actionReadiness = "completed";
      actionFailClosed = false;
      actionBlocker = null;
    } else if (activation.state
        === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_READONLY_INVOKE_ACTIVATION_STATES
          .missing) {
      state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.missing;
      readiness = "missing";
      blocker = activation.blocker
        || "selected-project-engine-readonly-invoke-selection-missing";
      actionBlocker = blocker;
    } else {
      blocker = activation.blocker
        || "selected-project-engine-readonly-invoke-activation-blocked";
      actionBlocker = blocker;
    }
  }

  const actionItem = buildSelectedProjectEngineRunActionItem({
    state: actionState,
    readiness: actionReadiness,
    available: actionAvailable,
    enabled: actionEnabled,
    failClosed: actionFailClosed,
    blocker: actionBlocker,
    preparedActionRetainedPrivately: preEngineEligibilityReady,
  });
  const actions = Object.freeze([actionItem]);

  return Object.freeze(orderedActionLane({
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID,
    schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_VERSION,
    contractId: SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
    owner: "shell",
    surfaceId: "selected-project-engine-action-lane",
    label: "Engine actions",
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: preEngineEligibilitySafe
      ? engineActionEligibility.selectedProjectId
      : sourcePreviewSafe ? engineRunPreview.selectedProjectId : null,
    selectedProjectFound: preEngineEligibilitySafe
      ? engineActionEligibility.selectedProjectId !== null
      : sourcePreviewReady,
    selectedProjectOnly: true,
    preEngineEligibilityPresent,
    preEngineEligibilityState: preEngineEligibilitySafe
      ? engineActionEligibility.state
      : null,
    preEngineEligibilityReadiness: preEngineEligibilitySafe
      ? engineActionEligibility.readiness
      : null,
    preEngineEligibilityReady,
    selectedProjectAndRevisionMatch: preEngineEligibilitySafe
      && engineActionEligibility.selectedProjectAndRevisionMatch === true,
    stage3ActionSourceReady: preEngineEligibilitySafe
      && engineActionEligibility.stage3ActionSourceReady === true,
    [PREFLIGHT_ELIGIBILITY_FIELD]: preEngineEligibilitySafe
      && engineActionEligibility[PREFLIGHT_ELIGIBILITY_FIELD] === true,
    serverOwnershipAcknowledged: preEngineEligibilitySafe
      && engineActionEligibility.serverOwnershipAcknowledged === true,
    sourcePreviewPresent,
    sourcePreviewState: sourcePreviewSafe ? engineRunPreview.state : null,
    sourcePreviewReadiness: sourcePreviewSafe ? engineRunPreview.readiness : null,
    sourcePreviewReady,
    engineRunReadinessBoundaryReady: sourcePreviewReady,
    selectedResultAccepted: sourcePreviewReady,
    engineVerified: sourcePreviewReady,
    runCount: sourcePreviewReady ? engineRunPreview.runCount : 0,
    actionItemCount: actions.length,
    enabledActionItemCount: actionEnabled ? 1 : 0,
    actions,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    userGestureRequired: true,
    nonExecuting: !activationSafe,
    engineCapabilityMounted: activationSafe && activation.clientTransportMounted === true,
    preparedActionRetainedPrivately: preEngineEligibilityReady,
    engineActionAvailable: actionAvailable,
    engineActionEnabled: actionEnabled,
    engineExecutionRequested: activationSafe && activation.requestDispatched === true,
    engineExecutionAttempted: activationSafe && activation.requestDispatched === true,
    selectedResultCreated: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    outputGenerated: false,
    outputGenerationEnabled: false,
    rawEnginePayloadExposed: false,
    runRowsExposed: false,
    exactElectricalValuesExposed: false,
    privateDataExposed: false,
    projectEnvelopeExposed: false,
    fingerprintsExposed: false,
    routesAdded: false,
    postEndpointsAdded: false,
    persistenceMutated: false,
    runtimeDataMutated: false,
    filesystemWriteAttempted: false,
  }));
}
