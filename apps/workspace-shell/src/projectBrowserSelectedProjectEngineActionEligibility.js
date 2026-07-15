import {
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_STATES,
} from "../../../packages/workspace-kernel/projectBrowserService.js";
import { stableFingerprint } from "../../../packages/workspace-kernel/stableFingerprint.js";

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_CONTRACT_ID =
  "SHELL-CS-SELECTOR-FIRST-PRE-ENGINE-READONLY-ACTION-ELIGIBILITY-BRIDGE-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-engine-action-eligibility.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION = 1;
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES =
  Object.freeze({
    ready: "shell_project_browser_selected_project_engine_action_eligibility_ready",
    missing: "shell_project_browser_selected_project_engine_action_eligibility_missing",
    blockedFailClosed:
      "shell_project_browser_selected_project_engine_action_eligibility_blocked_fail_closed",
  });

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "owner",
    "state",
    "readiness",
    "ready",
    "failClosed",
    "blocker",
    "selectedProjectId",
    "projectId",
    "envelopeId",
    "serverRevisionId",
    "projectionFingerprint",
    "selectedProjectAndRevisionMatch",
    "stage3ActionSourceReady",
    "candidateReconstructionPreflightEligible",
    "serverOwnershipAcknowledged",
    "runIntakePreviewReady",
    "factoryApprovedInputsReady",
    "candidateMapperReady",
    "selectedProjectOnly",
    "readOnly",
    "scalarSafe",
    "postEngineResultReadbackRequired",
    "candidatePayloadReturned",
    "projectEnvelopeReturned",
    "enginePayloadReturned",
    "runtimeDataMutated",
    "filesystemWriteAttempted",
    "shellProjectEngineActionEligibilityFingerprint",
  ]);

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:@+-]{1,760}$/;

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function safeToken(value, fallback = null) {
  if (typeof value !== "string") return fallback;
  const token = value.trim();
  return token && token === value && SAFE_TOKEN_PATTERN.test(token) ? token : fallback;
}

function orderedEligibility(fields) {
  return Object.freeze(Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

export function buildShellProjectBrowserSelectedProjectEngineActionEligibility(
  preEngineEligibilitySummary = null,
  serverOwnedRegistration = null,
  selectedProjectId = null,
) {
  const summary = isPlainObject(preEngineEligibilitySummary)
    ? preEngineEligibilitySummary
    : {};
  const registration = isPlainObject(serverOwnedRegistration)
    ? serverOwnedRegistration
    : {};
  const selectedProjectToken = safeToken(selectedProjectId);
  const summarySchemaValid = summary.schemaId
      === PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID
    && summary.schemaVersion
      === PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION;
  const summaryReady = summarySchemaValid
    && summary.state
      === PROJECT_BROWSER_SELECTED_PROJECT_PRE_ENGINE_ACTION_ELIGIBILITY_STATES.ready
    && summary.readiness === "ready"
    && summary.ready === true
    && summary.failClosed === false
    && summary.blocker === null
    && summary.runIntakePreviewReady === true
    && summary.factoryApprovedInputsReady === true
    && summary.candidateMapperReady === true;
  const summaryIdentityMatches = Boolean(selectedProjectToken)
    && (selectedProjectToken === safeToken(summary.envelopeId)
      || selectedProjectToken === safeToken(summary.projectId));
  const registrationAcknowledged = registration.ok === true
    && registration.activeRevision === true
    && registration.serverOwned === true
    && registration.preEngineActionSourceReady === true
    && registration.candidateReconstructionPreflightEligible === true
    && safeToken(registration.serverRevisionId) !== null;
  const registrationIdentityMatches = registrationAcknowledged
    && safeToken(registration.projectId) === safeToken(summary.projectId)
    && safeToken(registration.localEnvelopeId) === safeToken(summary.envelopeId)
    && safeToken(registration.preEngineEligibilityProjectionFingerprint)
      === safeToken(summary.projectionFingerprint);
  const selectedProjectAndRevisionMatch = summaryIdentityMatches
    && registrationIdentityMatches;
  const stage3ActionSourceReady = summaryReady
    && registration.preEngineActionSourceReady === true;
  const candidateReconstructionPreflightEligible = registrationAcknowledged
    && registration.candidateReconstructionPreflightEligible === true;
  const serverOwnershipAcknowledged = registrationAcknowledged;
  const ready = selectedProjectAndRevisionMatch
    && stage3ActionSourceReady
    && candidateReconstructionPreflightEligible
    && serverOwnershipAcknowledged;

  let state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES
    .blockedFailClosed;
  let readiness = "blocked_fail_closed";
  let blocker = null;
  if (!selectedProjectToken) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES.missing;
    readiness = "missing";
    blocker = "selected-project-engine-action-eligibility-selection-missing";
  } else if (!summarySchemaValid) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES.missing;
    readiness = "missing";
    blocker = "selected-project-engine-action-eligibility-summary-missing";
  } else if (!summaryReady) {
    blocker = summary.blocker
      || "selected-project-engine-action-eligibility-stage3-source-not-ready";
  } else if (!summaryIdentityMatches) {
    blocker = "selected-project-engine-action-eligibility-selection-mismatch";
  } else if (!registrationAcknowledged) {
    blocker = "selected-project-engine-action-eligibility-server-ownership-not-acknowledged";
  } else if (!registrationIdentityMatches) {
    blocker = "selected-project-engine-action-eligibility-revision-mismatch";
  } else if (!candidateReconstructionPreflightEligible) {
    blocker = "selected-project-engine-action-eligibility-candidate-preflight-ineligible";
  } else {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES.ready;
    readiness = "ready";
  }

  const base = {
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
    schemaVersion:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
    contractId:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_CONTRACT_ID,
    owner: "shell",
    state,
    readiness,
    ready,
    failClosed: !ready,
    blocker: ready ? null : safeToken(
      blocker,
      "selected-project-engine-action-eligibility-blocked",
    ),
    selectedProjectId: selectedProjectToken,
    projectId: safeToken(summary.projectId),
    envelopeId: safeToken(summary.envelopeId),
    serverRevisionId: ready ? safeToken(registration.serverRevisionId) : null,
    projectionFingerprint: safeToken(summary.projectionFingerprint),
    selectedProjectAndRevisionMatch,
    stage3ActionSourceReady,
    candidateReconstructionPreflightEligible,
    serverOwnershipAcknowledged,
    runIntakePreviewReady: summaryReady && summary.runIntakePreviewReady === true,
    factoryApprovedInputsReady:
      summaryReady && summary.factoryApprovedInputsReady === true,
    candidateMapperReady: summaryReady && summary.candidateMapperReady === true,
    selectedProjectOnly: true,
    readOnly: true,
    scalarSafe: true,
    postEngineResultReadbackRequired: false,
    candidatePayloadReturned: false,
    projectEnvelopeReturned: false,
    enginePayloadReturned: false,
    runtimeDataMutated: false,
    filesystemWriteAttempted: false,
  };
  return orderedEligibility({
    ...base,
    shellProjectEngineActionEligibilityFingerprint: stableFingerprint(
      "safe-shell-selected-project-engine-action-eligibility",
      base,
    ),
  });
}

export function validateShellProjectBrowserSelectedProjectEngineActionEligibility(
  eligibility,
) {
  if (!isPlainObject(eligibility)
    || !Object.isFrozen(eligibility)
    || Object.keys(eligibility).length
      !== SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER.length
    || !SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER.every(
      (key, index) => Object.keys(eligibility)[index] === key,
    )) {
    return "selected-project-engine-action-eligibility-contract-invalid";
  }
  if (eligibility.schemaId
      !== SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID
    || eligibility.schemaVersion
      !== SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION
    || eligibility.contractId
      !== SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_CONTRACT_ID) {
    return "selected-project-engine-action-eligibility-schema-mismatch";
  }
  if (eligibility.ready !== true
    || eligibility.state
      !== SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_STATES.ready
    || eligibility.readiness !== "ready"
    || eligibility.failClosed !== false
    || eligibility.blocker !== null
    || eligibility.selectedProjectAndRevisionMatch !== true
    || eligibility.stage3ActionSourceReady !== true
    || eligibility.candidateReconstructionPreflightEligible !== true
    || eligibility.serverOwnershipAcknowledged !== true
    || eligibility.runIntakePreviewReady !== true
    || eligibility.factoryApprovedInputsReady !== true
    || eligibility.candidateMapperReady !== true
    || eligibility.selectedProjectOnly !== true
    || eligibility.readOnly !== true
    || eligibility.scalarSafe !== true
    || eligibility.postEngineResultReadbackRequired !== false
    || eligibility.candidatePayloadReturned !== false
    || eligibility.projectEnvelopeReturned !== false
    || eligibility.enginePayloadReturned !== false
    || eligibility.runtimeDataMutated !== false
    || eligibility.filesystemWriteAttempted !== false
    || !safeToken(eligibility.selectedProjectId)
    || !safeToken(eligibility.projectId)
    || !safeToken(eligibility.envelopeId)
    || !safeToken(eligibility.serverRevisionId)
    || !safeToken(eligibility.projectionFingerprint)) {
    return "selected-project-engine-action-eligibility-not-ready";
  }
  const fingerprintSource = Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER
      .filter((key) => key !== "shellProjectEngineActionEligibilityFingerprint")
      .map((key) => [key, eligibility[key]]),
  );
  if (eligibility.shellProjectEngineActionEligibilityFingerprint !== stableFingerprint(
    "safe-shell-selected-project-engine-action-eligibility",
    fingerprintSource,
  )) {
    return "selected-project-engine-action-eligibility-fingerprint-mismatch";
  }
  return null;
}
