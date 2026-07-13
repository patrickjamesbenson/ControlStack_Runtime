import {
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION,
} from "./projectBrowserService.js";
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
  "projectEnvelope.modules.cs_selector.state.engineRunActionSource",
  "projectEnvelope.modules.cs_selector.downstreamContext.engineRunActionSource",
  "projectEnvelope.modules.cs_selector.state",
  "projectEnvelope.modules.cs_selector.downstreamContext",
]);

const READINESS_FINGERPRINT_PREFIX =
  "safe-project-browser-selected-project-engine-run-readiness-readback-summary";
const SOURCE_BOUNDARY_FINGERPRINT_PREFIX =
  "safe-project-browser-selected-project-engine-run-action-source-boundary";
const SAVED_PROJECT_SCHEMA = "workspace_saved_project.v2-runtime";
const RUNTIME_SAVED_PROJECT_SOURCE = "p2-shell-save-envelope";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const READINESS_FINGERPRINT_PATTERN =
  /^safe-project-browser-selected-project-engine-run-readiness-readback-summary:[0-9a-f]{40}$/;
const CANDIDATE_FINGERPRINT_PATTERN =
  /^safe-selector-readonly-engine-candidate:[0-9a-f]{40}$/;

const READINESS_REQUIRED_TRUE_FLAGS = Object.freeze([
  "selectedProjectFound",
  "selectedResultSummaryPresent",
  "runTableFirstNarrowOutputSummaryPresent",
  "selectedResultReadbackReady",
  "runTableFirstNarrowOutputHandoffContractReady",
  "authorityStatesAligned",
  "fingerprintsAligned",
  "engineRunReadinessReadbackReady",
  "selectedProjectOnly",
  "summaryOnly",
  "diagnosticOnly",
  "readOnly",
  "redacted",
  "machineValueSafe",
]);

const READINESS_REQUIRED_FALSE_FLAGS = Object.freeze([
  "failClosed",
  "selectedResultReadbackFailClosed",
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

const STAGE3_INPUT_KEYS = Object.freeze([
  "factoryApprovedInputsSummary",
  "committedSelectorConstraints",
  "lmTemperatureReadinessPreview",
]);

const INTERNAL_ENGINE_CANDIDATES = new WeakMap();

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

function scalarSafeObject(value) {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every((item) => (
    item === null || ["string", "number", "boolean"].includes(typeof item)
  ));
}

function safeToken(value, fallback = null) {
  if (typeof value !== "string") return fallback;
  const token = value.trim();
  if (!token || PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(token) || !SAFE_TOKEN_PATTERN.test(token)) {
    return fallback;
  }
  return token;
}

function safeNonNegativeInteger(value) {
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function readinessFingerprintSource(summary) {
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER
      .filter((key) => key !== "projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint")
      .map((key) => [key, summary[key]]),
  );
}

function validateReadinessSummary(summary, selectedProjectId) {
  if (!isPlainObject(summary) || Object.keys(summary).length === 0) {
    return "selected-project-engine-run-action-readiness-summary-missing";
  }
  if (!Object.isFrozen(summary)
    || !hasExactKeys(
      summary,
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_FIELD_ORDER,
    )
    || !scalarSafeObject(summary)) {
    return "selected-project-engine-run-action-readiness-summary-shape-invalid";
  }
  if (summary.schemaId !== PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_ID
    || summary.schemaVersion
      !== PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SUMMARY_SCHEMA_VERSION
    || summary.owner !== "shell"
    || summary.source !== PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_SOURCE) {
    return "selected-project-engine-run-action-readiness-summary-schema-mismatch";
  }

  const summaryFingerprint = summary
    .projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint;
  if (!READINESS_FINGERPRINT_PATTERN.test(String(summaryFingerprint || ""))
    || summaryFingerprint !== stableFingerprint(
      READINESS_FINGERPRINT_PREFIX,
      readinessFingerprintSource(summary),
    )) {
    return "selected-project-engine-run-action-readiness-summary-fingerprint-mismatch";
  }

  const expectedSelectedProjectId = safeToken(selectedProjectId);
  const summarySelectedProjectId = safeToken(summary.selectedProjectId);
  const projectId = safeToken(summary.projectId);
  const envelopeId = safeToken(summary.envelopeId);
  if (!expectedSelectedProjectId) {
    return "selected-project-engine-run-action-selection-missing";
  }
  if (!summarySelectedProjectId
    || !projectId
    || !envelopeId
    || expectedSelectedProjectId !== summarySelectedProjectId
    || (summarySelectedProjectId !== projectId && summarySelectedProjectId !== envelopeId)) {
    return "selected-project-engine-run-action-selected-project-identity-mismatch";
  }

  if (summary.state !== PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_READINESS_READBACK_STATES.ready
    || summary.readiness !== "ready"
    || summary.ready !== true
    || summary.blocker !== null
    || summary.selectedResultReadbackReadiness !== "ready"
    || summary.selectedResultReadbackBlocker !== null
    || summary.acceptedSelectedResultAuthorityState !== "accepted_selected_result_authority"
    || summary.selectedResultPersistenceAuthorityPreflightState !== "ready_for_persistence_authority"
    || summary.selectedResultPersistenceBoundaryState
      !== "selected_result_persistence_boundary_contract_ready"
    || summary.selectedResultOutputReadinessPreflightState
      !== "selected_result_output_readiness_ready_for_persistence"
    || summary.runTableRowCount !== 0) {
    return "selected-project-engine-run-action-readiness-summary-not-ready";
  }
  for (const key of READINESS_REQUIRED_TRUE_FLAGS) {
    if (summary[key] !== true) {
      return `selected-project-engine-run-action-readiness-required-flag-not-true-${key}`;
    }
  }
  for (const key of READINESS_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) {
      return `selected-project-engine-run-action-readiness-required-flag-not-false-${key}`;
    }
  }
  return null;
}

function validateSelectedEnvelope(envelope, summary, selectedProjectId) {
  if (!isPlainObject(envelope)) {
    return "selected-project-engine-run-action-selected-envelope-not-found";
  }
  if (envelope.schema !== SAVED_PROJECT_SCHEMA || envelope.owner !== "shell") {
    return "selected-project-engine-run-action-selected-envelope-schema-mismatch";
  }
  if (envelope.source !== RUNTIME_SAVED_PROJECT_SOURCE
    || envelope.readOnly === true
    || envelope.browserOnly === true) {
    return "selected-project-engine-run-action-selected-envelope-fixture-or-read-only";
  }

  const lookupId = safeToken(selectedProjectId);
  const projectId = safeToken(envelope.projectId);
  const envelopeId = safeToken(envelope.envelopeId);
  if (!lookupId
    || !projectId
    || !envelopeId
    || projectId !== safeToken(summary.projectId)
    || envelopeId !== safeToken(summary.envelopeId)
    || (lookupId !== projectId && lookupId !== envelopeId)) {
    return "selected-project-engine-run-action-selected-envelope-identity-mismatch";
  }
  if (!isPlainObject(envelope.modules?.cs_selector)) {
    return "selected-project-engine-run-action-selector-module-missing";
  }
  return null;
}

function sourceCandidate(location, value, explicit = false) {
  return { location, value, explicit };
}

function resolvePersistedStage3Inputs(envelope) {
  const selectorModule = envelope.modules.cs_selector;
  const state = isPlainObject(selectorModule.state) ? selectorModule.state : null;
  const downstreamContext = isPlainObject(selectorModule.downstreamContext)
    ? selectorModule.downstreamContext
    : null;
  const candidates = [
    sourceCandidate(
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[0],
      state?.engineRunActionSource,
      Object.prototype.hasOwnProperty.call(state || {}, "engineRunActionSource"),
    ),
    sourceCandidate(
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[1],
      downstreamContext?.engineRunActionSource,
      Object.prototype.hasOwnProperty.call(downstreamContext || {}, "engineRunActionSource"),
    ),
    sourceCandidate(
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[2],
      state,
    ),
    sourceCandidate(
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[3],
      downstreamContext,
    ),
  ];

  for (const candidate of candidates) {
    if (!isPlainObject(candidate.value)) {
      if (candidate.explicit) {
        return {
          blocker: "selected-project-engine-run-action-persisted-stage3-input-source-invalid",
          location: candidate.location,
        };
      }
      continue;
    }
    const presentKeys = STAGE3_INPUT_KEYS.filter((key) => (
      Object.prototype.hasOwnProperty.call(candidate.value, key)
    ));
    if (presentKeys.length === 0) {
      if (candidate.explicit) {
        return {
          blocker: "selected-project-engine-run-action-persisted-stage3-inputs-incomplete",
          location: candidate.location,
        };
      }
      continue;
    }
    if (presentKeys.length !== STAGE3_INPUT_KEYS.length) {
      return {
        blocker: "selected-project-engine-run-action-persisted-stage3-inputs-incomplete",
        location: candidate.location,
      };
    }
    const factoryApprovedInputsSummary = candidate.value.factoryApprovedInputsSummary;
    const committedSelectorConstraints = candidate.value.committedSelectorConstraints;
    const lmTemperatureReadinessPreview = candidate.value.lmTemperatureReadinessPreview;
    if (!isPlainObject(factoryApprovedInputsSummary)
      || !Array.isArray(committedSelectorConstraints)
      || !isPlainObject(lmTemperatureReadinessPreview)) {
      return {
        blocker: "selected-project-engine-run-action-persisted-stage3-inputs-invalid",
        location: candidate.location,
      };
    }
    return {
      blocker: null,
      location: candidate.location,
      factoryApprovedInputsSummary,
      committedSelectorConstraints,
      lmTemperatureReadinessPreview,
    };
  }

  return {
    blocker: "selected-project-engine-run-action-persisted-stage3-inputs-missing",
    location: null,
  };
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
  state,
  blocker = null,
  summary = null,
  envelope = null,
  stage3Inputs = null,
  mapperSummary = null,
  selectedEnvelopeReadCount = 0,
} = {}) {
  const ready = state
    === PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready;
  const missing = state
    === PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.missing;
  const candidateShapeSummary = isPlainObject(mapperSummary?.candidateShapeSummary)
    ? mapperSummary.candidateShapeSummary
    : null;
  return {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION,
    contractId: PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
    state,
    readiness: ready ? "ready" : missing ? "missing" : "blocked_fail_closed",
    ready,
    failClosed: !ready,
    blocker: ready ? null : safeToken(
      blocker,
      "selected-project-engine-run-action-source-blocked",
    ),
    sourceKind: "selected-runtime-saved-project-stage3-inputs",
    selectedProjectId: safeToken(summary?.selectedProjectId),
    projectId: safeToken(summary?.projectId),
    envelopeId: safeToken(summary?.envelopeId),
    readinessSummarySchemaId: safeToken(summary?.schemaId),
    readinessSummarySchemaVersion: Number.isSafeInteger(summary?.schemaVersion)
      ? summary.schemaVersion
      : null,
    readinessSummaryState: safeToken(summary?.state),
    readinessSummaryReadiness: safeToken(summary?.readiness),
    readinessSummaryFingerprint: safeToken(
      summary?.projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint,
    ),
    selectedEnvelopeSchema: safeToken(envelope?.schema),
    selectedEnvelopeSource: safeToken(envelope?.source),
    stage3InputSourceLocation: safeToken(stage3Inputs?.location),
    factoryApprovedInputsSummaryPresent:
      isPlainObject(stage3Inputs?.factoryApprovedInputsSummary),
    committedSelectorConstraintsPresent:
      Array.isArray(stage3Inputs?.committedSelectorConstraints),
    lmTemperatureReadinessPreviewPresent:
      isPlainObject(stage3Inputs?.lmTemperatureReadinessPreview),
    candidateMapperState: safeToken(mapperSummary?.state),
    candidateMapperReady: ready,
    candidateMapperBlocker: ready ? null : safeToken(mapperSummary?.blocker),
    candidateRunCount: ready
      ? safeNonNegativeInteger(candidateShapeSummary?.runCount)
      : 0,
    candidateTotalQuantity: ready
      ? safeNonNegativeInteger(candidateShapeSummary?.totalQuantity)
      : 0,
    candidateLightingFieldCount: ready
      ? safeNonNegativeInteger(candidateShapeSummary?.lightingFieldCount)
      : 0,
    candidateFingerprint: ready
      ? safeToken(candidateShapeSummary?.readonlyEngineCandidateFingerprint)
      : null,
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
    "selected-project-engine-run-action-readiness-summary-missing",
    "selected-project-engine-run-action-selection-missing",
    "selected-project-engine-run-action-selected-envelope-not-found",
    "selected-project-engine-run-action-persisted-stage3-inputs-missing",
  ]);
  return finaliseBoundary(boundaryFields({
    ...options,
    state: missingBlockers.has(blocker)
      ? PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.missing
      : PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.blockedFailClosed,
    blocker,
  }));
}

export async function resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
  context = {},
  services = {},
} = {}) {
  const browser = isPlainObject(context?.projectBrowser) ? context.projectBrowser : {};
  const summary = browser.selectedProjectEngineRunReadinessReadbackSummary;
  const selectedProjectId = browser.selectedProjectId;
  const readinessBlocker = validateReadinessSummary(summary, selectedProjectId);
  if (readinessBlocker) {
    return blockedBoundary(readinessBlocker, { summary });
  }

  const getProjectEnvelope = services?.savedProjects?.getProjectEnvelope;
  if (typeof getProjectEnvelope !== "function") {
    return blockedBoundary(
      "selected-project-engine-run-action-saved-project-envelope-getter-unavailable",
      { summary },
    );
  }

  let envelope;
  try {
    envelope = await getProjectEnvelope.call(services.savedProjects, selectedProjectId);
  } catch {
    return blockedBoundary(
      "selected-project-engine-run-action-saved-project-envelope-getter-failed",
      { summary, selectedEnvelopeReadCount: 1 },
    );
  }

  const envelopeBlocker = validateSelectedEnvelope(envelope, summary, selectedProjectId);
  if (envelopeBlocker) {
    return blockedBoundary(envelopeBlocker, {
      summary,
      envelope,
      selectedEnvelopeReadCount: 1,
    });
  }

  const stage3Inputs = resolvePersistedStage3Inputs(envelope);
  if (stage3Inputs.blocker) {
    return blockedBoundary(stage3Inputs.blocker, {
      summary,
      envelope,
      stage3Inputs,
      selectedEnvelopeReadCount: 1,
    });
  }

  let mapperResult;
  try {
    mapperResult = buildSelectorReadonlyEngineCandidateForInternalSeam({
      factoryApprovedInputsSummary: stage3Inputs.factoryApprovedInputsSummary,
      committedSelectorConstraints: stage3Inputs.committedSelectorConstraints,
      lmTemperatureReadinessPreview: stage3Inputs.lmTemperatureReadinessPreview,
    });
  } catch {
    return blockedBoundary(
      "selected-project-engine-run-action-candidate-mapper-threw",
      {
        summary,
        envelope,
        stage3Inputs,
        selectedEnvelopeReadCount: 1,
      },
    );
  }

  const mapperSummary = mapperResult?.summary;
  const candidateFingerprint = mapperSummary?.candidateShapeSummary
    ?.readonlyEngineCandidateFingerprint;
  if (mapperResult?.ok !== true
    || !isPlainObject(mapperResult.candidate)
    || !isPlainObject(mapperSummary)
    || mapperSummary.ready !== true
    || mapperSummary.readonlyEngineCandidateMapperReady !== true
    || mapperSummary.candidateReadyForHostLocalReadonlySeam !== true
    || mapperSummary.candidatePayloadReturned !== false
    || !CANDIDATE_FINGERPRINT_PATTERN.test(String(candidateFingerprint || ""))) {
    return blockedBoundary(
      safeToken(
        mapperSummary?.blocker,
        "selected-project-engine-run-action-candidate-mapper-not-ready",
      ),
      {
        summary,
        envelope,
        stage3Inputs,
        mapperSummary,
        selectedEnvelopeReadCount: 1,
      },
    );
  }

  const boundary = finaliseBoundary(boundaryFields({
    state: PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready,
    summary,
    envelope,
    stage3Inputs,
    mapperSummary,
    selectedEnvelopeReadCount: 1,
  }));
  INTERNAL_ENGINE_CANDIDATES.set(boundary, mapperResult.candidate);
  return boundary;
}

export function getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary) {
  return INTERNAL_ENGINE_CANDIDATES.get(boundary) || null;
}
