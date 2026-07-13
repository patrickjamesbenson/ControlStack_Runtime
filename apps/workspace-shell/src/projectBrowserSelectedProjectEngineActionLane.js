import {
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "./projectBrowserSelectedProjectEngineRunPreview.js";

export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-SURFACE-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-engine-action-lane.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-engine-action-item.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_engine_action_lane_ready",
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

function orderedActionItem(fields) {
  return Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function buildSelectedProjectEngineRunActionItem({ blocker }) {
  return Object.freeze(orderedActionItem({
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
    schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION,
    actionId: "run-engine",
    label: "Run Engine",
    state: "blocked",
    readiness: "blocked_fail_closed",
    available: false,
    enabled: false,
    failClosed: true,
    blocker,
    userGestureRequired: true,
    selectedProjectOnly: true,
    preparedActionRetainedPrivately: false,
  }));
}

function orderedActionLane(fields) {
  return Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

export function buildShellProjectBrowserSelectedProjectEngineActionLane(engineRunPreview = null) {
  const sourcePreviewPresent = isPlainObject(engineRunPreview);
  const sourcePreviewSafe = previewContractIsSafe(engineRunPreview);
  const sourcePreviewReady = sourcePreviewSafe && previewIsReady(engineRunPreview);
  const sourcePreviewMissing = sourcePreviewSafe && previewIsMissing(engineRunPreview);

  let state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.blockedFailClosed;
  let readiness = "blocked_fail_closed";
  let blocker = "selected-project-engine-action-readiness-preview-blocked";

  if (!sourcePreviewPresent || sourcePreviewMissing) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES.missing;
    readiness = "missing";
    blocker = "selected-project-engine-action-readiness-preview-missing";
  } else if (sourcePreviewReady) {
    blocker = "selected-project-engine-action-capability-not-mounted";
  }

  const actionItem = buildSelectedProjectEngineRunActionItem({ blocker });
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
    ready: false,
    failClosed: true,
    blocker,
    selectedProjectId: sourcePreviewSafe ? engineRunPreview.selectedProjectId : null,
    selectedProjectFound: sourcePreviewReady,
    selectedProjectOnly: true,
    sourcePreviewPresent,
    sourcePreviewState: sourcePreviewSafe ? engineRunPreview.state : null,
    sourcePreviewReadiness: sourcePreviewSafe ? engineRunPreview.readiness : null,
    sourcePreviewReady,
    engineRunReadinessBoundaryReady: sourcePreviewReady,
    selectedResultAccepted: sourcePreviewReady,
    engineVerified: sourcePreviewReady,
    runCount: sourcePreviewReady ? engineRunPreview.runCount : 0,
    actionItemCount: actions.length,
    enabledActionItemCount: 0,
    actions,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    userGestureRequired: true,
    nonExecuting: true,
    engineCapabilityMounted: false,
    preparedActionRetainedPrivately: false,
    engineActionAvailable: false,
    engineActionEnabled: false,
    engineExecutionRequested: false,
    engineExecutionAttempted: false,
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
