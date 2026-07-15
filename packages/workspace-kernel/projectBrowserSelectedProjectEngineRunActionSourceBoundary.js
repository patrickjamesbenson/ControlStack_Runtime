import {
  CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
  CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
  SAVED_PROJECT_SCHEMA,
  validateCsSelectorPreEngineActionEligibilityProjection,
} from "./projectEnvelope.js";
import { buildSelectorReadonlyEngineCandidateForInternalSeam } from "./selectorReadonlyEngineCandidateMapper.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID =
  "PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-RUN-ACTION-SOURCE-BOUNDARY-1";
export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-engine-run-action-source-boundary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES = Object.freeze({
  ready: "project_browser_selected_project_engine_run_action_source_ready",
  missing: "project_browser_selected_project_engine_run_action_source_missing",
  blockedFailClosed: "project_browser_selected_project_engine_run_action_source_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "sourceKind",
  "selectedProjectId",
  "projectId",
  "envelopeId",
  "readinessSummarySchemaId",
  "readinessSummarySchemaVersion",
  "readinessSummaryState",
  "readinessSummaryReadiness",
  "readinessSummaryFingerprint",
  "selectedEnvelopeSchema",
  "selectedEnvelopeSource",
  "stage3InputSourceLocation",
  "factoryApprovedInputsSummaryPresent",
  "committedSelectorConstraintsPresent",
  "lmTemperatureReadinessPreviewPresent",
  "candidateMapperState",
  "candidateMapperReady",
  "candidateMapperBlocker",
  "candidateRunCount",
  "candidateTotalQuantity",
  "candidateLightingFieldCount",
  "candidateFingerprint",
  "selectedProjectOnly",
  "runtimeSavedEnvelopeOnly",
  "exactSelectedProjectIdentity",
  "readOnly",
  "scalarSafe",
  "selectedEnvelopeReadCount",
  "candidateRetainedInternally",
  "candidatePayloadReturned",
  "projectEnvelopeReturned",
  "currentProjectFallbackUsed",
  "otherEnvelopeFallbackUsed",
  "fixtureFallbackUsed",
  "selectedResultPayloadUsed",
  "engineInvocationEnabled",
  "engineExecutionAttempted",
  "persistenceMutated",
  "runtimeDataMutated",
  "routesAdded",
  "postEndpointsAdded",
  "filesystemWriteAttempted",
  "sourceBoundaryFingerprint",
]);

export const PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS = Object.freeze([
  "projectEnvelope.modules.cs_selector.downstreamContext.preEngineActionEligibilityProjection",
]);

const SOURCE_BOUNDARY_FINGERPRINT_PREFIX =
  "safe-project-browser-selected-project-engine-run-action-source-boundary";
const RUNTIME_SAVED_PROJECT_SOURCE = "p2-shell-save-envelope";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:@+-]{1,760}$/;
const CANDIDATE_FINGERPRINT_PATTERN =
  /^safe-selector-readonly-engine-candidate:[0-9a-f]{40}$/;
const INTERNAL_ENGINE_CANDIDATES = new WeakMap();

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

function orderedBoundary(fields) {
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function finaliseBoundary(fields) {
  const fingerprintSource = Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER
      .filter((key) => key !== "sourceBoundaryFingerprint")
      .map((key) => [key, fields[key]]),
  );
  return Object.freeze(orderedBoundary({
    ...fields,
    sourceBoundaryFingerprint: stableFingerprint(
      SOURCE_BOUNDARY_FINGERPRINT_PREFIX,
      fingerprintSource,
    ),
  }));
}

function boundaryFields({
  state = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES
    .blockedFailClosed,
  blocker = "selected-project-engine-run-action-source-blocked",
  selectedProjectId = null,
  envelope = null,
  authoritySummary = null,
  sourceInputs = null,
  sourceLocation = null,
  mapperSummary = null,
  selectedEnvelopeReadCount = 0,
} = {}) {
  const ready = state
    === PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready;
  const candidateShape = isPlainObject(mapperSummary?.candidateShapeSummary)
    ? mapperSummary.candidateShapeSummary
    : {};
  return {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID,
    schemaVersion:
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION,
    contractId:
      PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
    state,
    readiness: ready
      ? "ready"
      : state === PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.missing
        ? "missing"
        : "blocked_fail_closed",
    ready,
    failClosed: !ready,
    blocker: ready ? null : safeToken(
      blocker,
      "selected-project-engine-run-action-source-blocked",
    ),
    sourceKind: sourceLocation
      === PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[0]
      ? "selected-project-pre-engine-stage3-action-source"
      : "selected-project-legacy-stage3-action-source-compatibility",
    selectedProjectId: safeToken(selectedProjectId),
    projectId: safeToken(envelope?.projectId),
    envelopeId: safeToken(envelope?.envelopeId || envelope?.projectId),
    readinessSummarySchemaId: authoritySummary?.schemaId || null,
    readinessSummarySchemaVersion: Number.isSafeInteger(authoritySummary?.schemaVersion)
      ? authoritySummary.schemaVersion
      : null,
    readinessSummaryState: authoritySummary?.state || null,
    readinessSummaryReadiness: authoritySummary?.readiness || null,
    readinessSummaryFingerprint:
      authoritySummary?.projectionFingerprint
      || authoritySummary?.projectBrowserSelectedProjectEngineRunReadinessReadbackFingerprint
      || null,
    selectedEnvelopeSchema: envelope?.schema || null,
    selectedEnvelopeSource: envelope?.source || null,
    stage3InputSourceLocation: sourceLocation,
    factoryApprovedInputsSummaryPresent:
      isPlainObject(sourceInputs?.factoryApprovedInputsSummary),
    committedSelectorConstraintsPresent:
      Array.isArray(sourceInputs?.committedSelectorConstraints),
    lmTemperatureReadinessPreviewPresent:
      isPlainObject(sourceInputs?.lmTemperatureReadinessPreview),
    candidateMapperState: mapperSummary?.state || null,
    candidateMapperReady: ready && mapperSummary?.readonlyEngineCandidateMapperReady === true,
    candidateMapperBlocker: ready ? null : mapperSummary?.blocker || null,
    candidateRunCount: ready && Number.isSafeInteger(candidateShape.runCount)
      ? candidateShape.runCount
      : 0,
    candidateTotalQuantity: ready && Number.isSafeInteger(candidateShape.totalQuantity)
      ? candidateShape.totalQuantity
      : 0,
    candidateLightingFieldCount: ready && Number.isSafeInteger(candidateShape.lightingFieldCount)
      ? candidateShape.lightingFieldCount
      : 0,
    candidateFingerprint: ready ? candidateShape.readonlyEngineCandidateFingerprint : null,
    selectedProjectOnly: true,
    runtimeSavedEnvelopeOnly: true,
    exactSelectedProjectIdentity: ready,
    readOnly: true,
    scalarSafe: true,
    selectedEnvelopeReadCount,
    candidateRetainedInternally: ready,
    candidatePayloadReturned: false,
    projectEnvelopeReturned: false,
    currentProjectFallbackUsed: false,
    otherEnvelopeFallbackUsed: false,
    fixtureFallbackUsed: false,
    selectedResultPayloadUsed: false,
    engineInvocationEnabled: false,
    engineExecutionAttempted: false,
    persistenceMutated: false,
    runtimeDataMutated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    filesystemWriteAttempted: false,
  };
}

function blockedBoundary(blocker, options = {}) {
  const missingBlockers = new Set([
    "selected-project-engine-run-action-selection-missing",
    "selected-project-engine-run-action-envelope-missing",
    "selected-project-engine-run-action-pre-engine-projection-missing",
  ]);
  return finaliseBoundary(boundaryFields({
    ...options,
    state: missingBlockers.has(blocker)
      ? PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.missing
      : PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES
        .blockedFailClosed,
    blocker,
  }));
}

const LEGACY_STAGE3_INPUT_TARGETS = Object.freeze([
  "projectEnvelope.modules.cs_selector.state.engineRunActionSource",
  "projectEnvelope.modules.cs_selector.downstreamContext.engineRunActionSource",
  "projectEnvelope.modules.cs_selector.state",
  "projectEnvelope.modules.cs_selector.downstreamContext",
]);

function legacyStage3InputSource(envelope) {
  const selectorModule = envelope?.modules?.cs_selector;
  const candidates = [
    [selectorModule?.state?.engineRunActionSource, LEGACY_STAGE3_INPUT_TARGETS[0]],
    [selectorModule?.downstreamContext?.engineRunActionSource, LEGACY_STAGE3_INPUT_TARGETS[1]],
    [selectorModule?.state, LEGACY_STAGE3_INPUT_TARGETS[2]],
    [selectorModule?.downstreamContext, LEGACY_STAGE3_INPUT_TARGETS[3]],
  ];
  for (const [candidate, sourceLocation] of candidates) {
    if (isPlainObject(candidate)
      && isPlainObject(candidate.factoryApprovedInputsSummary)
      && Array.isArray(candidate.committedSelectorConstraints)
      && isPlainObject(candidate.lmTemperatureReadinessPreview)) {
      return { sourceInputs: candidate, sourceLocation };
    }
  }
  return null;
}

function selectedEnvelopeBlocker(envelope, selectedProjectId) {
  if (!isPlainObject(envelope)) {
    return "selected-project-engine-run-action-envelope-missing";
  }
  if (envelope.schema !== SAVED_PROJECT_SCHEMA
    || envelope.source !== RUNTIME_SAVED_PROJECT_SOURCE
    || envelope.readOnly === true
    || envelope.browserOnly === true) {
    return "selected-project-engine-run-action-runtime-saved-envelope-required";
  }
  const envelopeId = safeToken(envelope.envelopeId || envelope.projectId);
  const projectId = safeToken(envelope.projectId);
  if (!envelopeId || !projectId
    || (selectedProjectId !== envelopeId && selectedProjectId !== projectId)) {
    return "selected-project-engine-run-action-envelope-identity-mismatch";
  }
  return null;
}

export async function resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
  context = {},
  services = {},
} = {}) {
  const browser = isPlainObject(context?.projectBrowser) ? context.projectBrowser : {};
  const selectedProjectId = safeToken(browser.selectedProjectId);
  if (!selectedProjectId) {
    return blockedBoundary("selected-project-engine-run-action-selection-missing");
  }

  const getProjectEnvelope = services?.savedProjects?.getProjectEnvelope;
  if (typeof getProjectEnvelope !== "function") {
    return blockedBoundary(
      "selected-project-engine-run-action-saved-project-envelope-getter-unavailable",
      { selectedProjectId },
    );
  }

  let envelope;
  try {
    envelope = await getProjectEnvelope.call(services.savedProjects, selectedProjectId);
  } catch {
    return blockedBoundary(
      "selected-project-engine-run-action-saved-project-envelope-getter-failed",
      { selectedProjectId, selectedEnvelopeReadCount: 1 },
    );
  }

  const envelopeBlocker = selectedEnvelopeBlocker(envelope, selectedProjectId);
  if (envelopeBlocker) {
    return blockedBoundary(envelopeBlocker, {
      selectedProjectId,
      envelope,
      selectedEnvelopeReadCount: 1,
    });
  }

  const projection = envelope?.modules?.cs_selector?.downstreamContext
    ?.preEngineActionEligibilityProjection;
  let sourceInputs = null;
  let sourceLocation = null;
  let authoritySummary = null;
  let projectionBacked = false;
  if (isPlainObject(projection)) {
    const projectionValidation = validateCsSelectorPreEngineActionEligibilityProjection(
      projection,
      { requireReady: true },
    );
    if (projectionValidation.valid !== true) {
      return blockedBoundary(
        "selected-project-engine-run-action-pre-engine-projection-invalid",
        {
          selectedProjectId,
          envelope,
          authoritySummary: projection,
          sourceInputs: projection,
          sourceLocation:
            PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[0],
          selectedEnvelopeReadCount: 1,
        },
      );
    }
    if (projection.schemaId !== CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID
      || projection.schemaVersion !== CS_SELECTOR_PRE_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION) {
      return blockedBoundary(
        "selected-project-engine-run-action-pre-engine-projection-schema-mismatch",
        {
          selectedProjectId,
          envelope,
          authoritySummary: projection,
          sourceInputs: projection,
          sourceLocation:
            PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[0],
          selectedEnvelopeReadCount: 1,
        },
      );
    }
    sourceInputs = projection;
    sourceLocation = PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[0];
    authoritySummary = projection;
    projectionBacked = true;
  } else {
    const legacySource = legacyStage3InputSource(envelope);
    if (!legacySource) {
      return blockedBoundary(
        "selected-project-engine-run-action-pre-engine-projection-missing",
        { selectedProjectId, envelope, selectedEnvelopeReadCount: 1 },
      );
    }
    sourceInputs = legacySource.sourceInputs;
    sourceLocation = legacySource.sourceLocation;
    authoritySummary = isPlainObject(
      browser.selectedProjectEngineRunReadinessReadbackSummary,
    )
      ? browser.selectedProjectEngineRunReadinessReadbackSummary
      : null;
  }

  let mapperResult;
  try {
    mapperResult = buildSelectorReadonlyEngineCandidateForInternalSeam({
      factoryApprovedInputsSummary: sourceInputs.factoryApprovedInputsSummary,
      committedSelectorConstraints: sourceInputs.committedSelectorConstraints,
      lmTemperatureReadinessPreview: sourceInputs.lmTemperatureReadinessPreview,
    });
  } catch {
    return blockedBoundary(
      "selected-project-engine-run-action-candidate-mapper-threw",
      {
        selectedProjectId,
        envelope,
        authoritySummary,
        sourceInputs,
        sourceLocation,
        selectedEnvelopeReadCount: 1,
      },
    );
  }

  const mapperSummary = mapperResult?.summary;
  const candidateShape = mapperSummary?.candidateShapeSummary;
  const candidateFingerprint = candidateShape?.readonlyEngineCandidateFingerprint;
  if (mapperResult?.ok !== true
    || !isPlainObject(mapperResult.candidate)
    || !isPlainObject(mapperSummary)
    || mapperSummary.ready !== true
    || mapperSummary.readonlyEngineCandidateMapperReady !== true
    || mapperSummary.candidateReadyForHostLocalReadonlySeam !== true
    || mapperSummary.candidatePayloadReturned !== false
    || !CANDIDATE_FINGERPRINT_PATTERN.test(String(candidateFingerprint || ""))
    || (projectionBacked && candidateFingerprint !== projection.candidateFingerprint)
    || (projectionBacked && candidateShape.runCount !== projection.runCount)
    || (projectionBacked && candidateShape.totalQuantity !== projection.totalQuantity)) {
    return blockedBoundary(
      "selected-project-engine-run-action-candidate-reconstruction-preflight-ineligible",
      {
        selectedProjectId,
        envelope,
        authoritySummary,
        sourceInputs,
        sourceLocation,
        mapperSummary,
        selectedEnvelopeReadCount: 1,
      },
    );
  }

  const boundary = finaliseBoundary(boundaryFields({
    state: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready,
    blocker: null,
    selectedProjectId,
    envelope,
    authoritySummary,
    sourceInputs,
    sourceLocation,
    mapperSummary,
    selectedEnvelopeReadCount: 1,
  }));
  INTERNAL_ENGINE_CANDIDATES.set(boundary, mapperResult.candidate);
  return boundary;
}

export function getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary) {
  return INTERNAL_ENGINE_CANDIDATES.get(boundary) || null;
}
