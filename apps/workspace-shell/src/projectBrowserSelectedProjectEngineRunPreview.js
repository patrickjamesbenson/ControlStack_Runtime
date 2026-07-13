export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-RUN-PREVIEW-SURFACE-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-engine-run-preview.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES = Object.freeze({
  ready: "shell_project_browser_selected_project_engine_run_preview_ready",
  missing: "shell_project_browser_selected_project_engine_run_preview_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_engine_run_preview_blocked_fail_closed",
});

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER = Object.freeze([
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
  "sourceSummaryPresent",
  "engineRunReadinessSummaryPresent",
  "engineRunReadinessBoundaryReady",
  "selectedResultAvailable",
  "selectedResultAccepted",
  "engineVerified",
  "runCount",
  "acceptedRunCount",
  "engineVerifiedRunCount",
  "previewOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "nonInteractive",
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

const PROJECT_BROWSER_ENGINE_RUN_READINESS_SOURCE_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-engine-run-readiness-readback-summary.v1";
const PROJECT_BROWSER_ENGINE_RUN_READINESS_SOURCE_SCHEMA_VERSION = 1;
const SAFE_SOURCE_KEYS = new Set([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "selectedResultSummaryPresent",
  "runTableFirstNarrowOutputSummaryPresent",
  "selectedResultReadbackState",
  "selectedResultReadbackReadiness",
  "selectedResultReadbackReady",
  "selectedResultReadbackFailClosed",
  "selectedResultReadbackBlocker",
  "selectedResultSummarySchemaId",
  "selectedResultSummarySchemaVersion",
  "selectedResultSummaryState",
  "runTableFirstNarrowOutputSummarySchemaId",
  "runTableFirstNarrowOutputSummarySchemaVersion",
  "runTableFirstNarrowOutputSummaryState",
  "runTableFirstNarrowOutputHandoffContractState",
  "runTableFirstNarrowOutputHandoffContractReady",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "authorityStatesAligned",
  "fingerprintsAligned",
  "engineRunReadinessReadbackReady",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "selectedResultPersistedSummarySlotContractFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
  "selectedResultPersistedSummaryReadbackFingerprint",
  "selectedResultTargetLocation",
  "runTableFirstNarrowOutputTargetLocation",
  "selectedProjectOnly",
  "summaryOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "runTableRowsIncluded",
  "runTableRowCount",
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
  "projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint",
]);
const SAFE_ID_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:])/i;
const PROHIBITED_SOURCE_KEYS = Object.freeze([
  "enginePayload",
  "selectorPayload",
  "runs",
  "runRows",
  "sourceRows",
  "runKey",
  "rowKey",
  "boards",
  "board",
  "segments",
  "segment",
  "zones",
  "zone",
  "drivers",
  "driver",
  "gearTrays",
  "gearTray",
  "reservations",
  "reservation",
  "clipPoints",
  "clipPoint",
  "suspensionPoints",
  "suspensionPoint",
  "electricalValues",
  "placementCoordinates",
  "engineVerificationEvidence",
  "projectEnvelope",
  "downstreamContext",
  "governance",
  "governancePayload",
  "mutationLog",
  "privatePath",
  "filename",
  "fileName",
  "url",
  "blob",
  "base64",
  "body",
]);
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

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeId(value) {
  if (typeof value !== "string") return null;
  const token = value.trim();
  if (!token || PRIVATE_VALUE_PATTERN.test(token) || !SAFE_ID_PATTERN.test(token)) return null;
  return token;
}

function safeBlocker(value, fallback) {
  return safeId(value) || fallback;
}

function safeNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function sourceContainsUnsafeData(summary) {
  for (const key of Object.keys(summary)) {
    if (!SAFE_SOURCE_KEYS.has(key)) return true;
  }
  for (const key of PROHIBITED_SOURCE_KEYS) {
    if (Object.prototype.hasOwnProperty.call(summary, key)) return true;
  }
  for (const value of Object.values(summary)) {
    if (Array.isArray(value) || isPlainObject(value)) return true;
    if (typeof value === "string" && PRIVATE_VALUE_PATTERN.test(value)) return true;
  }
  return false;
}

function sourceContractIsSafe(summary) {
  return summary.schemaId === PROJECT_BROWSER_ENGINE_RUN_READINESS_SOURCE_SCHEMA_ID
    && summary.schemaVersion === PROJECT_BROWSER_ENGINE_RUN_READINESS_SOURCE_SCHEMA_VERSION
    && summary.selectedProjectOnly === true
    && summary.summaryOnly === true
    && summary.diagnosticOnly === true
    && summary.readOnly === true
    && summary.redacted === true
    && summary.machineValueSafe === true
    && REQUIRED_FALSE_SOURCE_FLAGS.every((key) => summary[key] === false)
    && !sourceContainsUnsafeData(summary);
}

function sourceIsReady(summary) {
  return summary.readiness === "ready"
    && summary.ready === true
    && summary.failClosed === false
    && summary.blocker === null
    && summary.selectedProjectFound === true
    && summary.selectedResultSummaryPresent === true
    && summary.runTableFirstNarrowOutputSummaryPresent === true
    && summary.selectedResultReadbackReadiness === "ready"
    && summary.selectedResultReadbackReady === true
    && summary.selectedResultReadbackFailClosed === false
    && summary.runTableFirstNarrowOutputHandoffContractReady === true
    && summary.acceptedSelectedResultAuthorityState === "accepted_selected_result_authority"
    && summary.authorityStatesAligned === true
    && summary.fingerprintsAligned === true
    && summary.engineRunReadinessReadbackReady === true;
}

function sourceIsMissing(summary) {
  return summary.readiness === "missing"
    && summary.ready === false
    && summary.failClosed === true;
}

function orderedPreview(fields) {
  return Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

export function buildShellProjectBrowserSelectedProjectEngineRunPreview(
  sourceSummary = null,
  expectedSelectedProjectId = null,
) {
  const sourceSummaryPresent = isPlainObject(sourceSummary);
  const expectedSelection = safeId(expectedSelectedProjectId);
  const sourceSelection = sourceSummaryPresent ? safeId(sourceSummary.selectedProjectId) : null;
  const engineRunReadinessSummaryPresent = sourceSummaryPresent
    && sourceSummary.schemaId === PROJECT_BROWSER_ENGINE_RUN_READINESS_SOURCE_SCHEMA_ID
    && sourceSummary.schemaVersion === PROJECT_BROWSER_ENGINE_RUN_READINESS_SOURCE_SCHEMA_VERSION;
  const sourceSafe = sourceSummaryPresent && sourceContractIsSafe(sourceSummary);
  const selectedProjectMatches = Boolean(
    expectedSelection
      && sourceSelection
      && expectedSelection === sourceSelection,
  );

  let state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = "selected-project-engine-run-preview-source-missing";

  if (!sourceSummaryPresent) {
    blocker = expectedSelection
      ? "selected-project-engine-run-preview-source-missing"
      : "selected-project-engine-run-preview-selection-missing";
  } else if (!expectedSelection) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "selected-project-engine-run-preview-selection-invalid";
  } else if (!sourceSafe) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "selected-project-engine-run-preview-source-blocked";
  } else if (!selectedProjectMatches) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "selected-project-engine-run-preview-project-mismatch";
  } else if (sourceIsReady(sourceSummary)) {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready;
    readiness = "ready";
    ready = true;
    failClosed = false;
    blocker = null;
  } else if (sourceIsMissing(sourceSummary)) {
    blocker = safeBlocker(
      sourceSummary.blocker,
      "selected-project-engine-run-preview-source-missing",
    );
  } else {
    state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = safeBlocker(
      sourceSummary.blocker,
      "selected-project-engine-run-preview-source-blocked",
    );
  }

  const runCount = ready ? safeNonNegativeInteger(sourceSummary.runTableRowCount) : 0;
  const selectedResultAvailable = ready && sourceSummary.selectedResultSummaryPresent === true;
  const selectedResultAccepted = ready
    && sourceSummary.acceptedSelectedResultAuthorityState === "accepted_selected_result_authority"
    && sourceSummary.selectedResultReadbackReady === true;
  const engineVerified = ready && sourceSummary.engineRunReadinessReadbackReady === true;

  return Object.freeze(orderedPreview({
    schemaId: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
    schemaVersion: SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
    contractId: SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
    owner: "shell",
    surfaceId: "selected-project-engine-run-readiness",
    label: "Engine run readiness",
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: expectedSelection,
    selectedProjectFound: sourceSafe
      && selectedProjectMatches
      && sourceSummary.selectedProjectFound === true,
    selectedProjectOnly: true,
    sourceSummaryPresent,
    engineRunReadinessSummaryPresent,
    engineRunReadinessBoundaryReady: ready
      && sourceSummary.engineRunReadinessReadbackReady === true,
    selectedResultAvailable,
    selectedResultAccepted,
    engineVerified,
    runCount,
    acceptedRunCount: selectedResultAccepted ? runCount : 0,
    engineVerifiedRunCount: engineVerified ? runCount : 0,
    previewOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    nonInteractive: true,
    engineActionAvailable: false,
    engineActionEnabled: false,
    engineExecutionRequested: false,
    engineExecutionAttempted: false,
    rawEnginePayloadExposed: false,
    runRowsExposed: false,
    exactElectricalValuesExposed: false,
    placementCoordinatesExposed: false,
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
