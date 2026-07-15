import { createSavedProjectStore } from "./savedProjectStore.js";
import {
  validateCsSelectorPreEngineActionEligibilityProjection,
  validateSavedProjectEnvelope,
} from "./projectEnvelope.js";
import { validateSelectedProjectEngineRunReadinessReadbackSources } from "./projectBrowserService.js";
import { buildSelectorReadonlyEngineCandidateForInternalSeam } from "./selectorReadonlyEngineCandidateMapper.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID =
  "PROJECT-BROWSER-FIRST-SERVER-OWNED-RUNTIME-SAVED-SELECTED-PROJECT-REGISTRATION-1";
export const PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_ENGINE_READINESS_SUMMARY_REGISTRATION_ID =
  "PROJECT-BROWSER-FIRST-SERVER-OWNED-RUNTIME-SAVED-SELECTED-PROJECT-ENGINE-READINESS-SUMMARY-REGISTRATION-1";
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-server-owned-registration.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION = 1;
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND =
  "selected-project-runtime-save-registration";
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH =
  "/api/workspace-shell/selected-project-runtime-save-registration";
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD = "POST";

export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES =
  Object.freeze({
    registered: "project_browser_selected_project_server_owned_registration_registered",
    unavailable: "project_browser_selected_project_server_owned_registration_unavailable",
    blockedFailClosed:
      "project_browser_selected_project_server_owned_registration_blocked_fail_closed",
  });

export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "requestKind",
    "registrationSessionId",
    "clientSaveOrdinal",
    "localRevisionId",
    "localProjectId",
    "localEnvelopeId",
    "localSavedAt",
    "sourceProjection",
  ]);

export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER =
  Object.freeze(["project", "savedBy", "contractVersion", "selectorModule"]);
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER =
  Object.freeze(["metadata", "currentProject", "selection"]);
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER =
  Object.freeze([
    "projectId",
    "title",
    "readiness",
    "source",
    "browserReady",
    "browserStatus",
    "restoredFromEnvelope",
    "restoredAt",
    "restoredEnvelopeId",
  ]);
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER =
  Object.freeze(["projectId", "title", "client", "site", "readiness", "source"]);
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER =
  Object.freeze([
    "owner",
    "selectedProjectId",
    "selectedAt",
    "source",
    "restoredEnvelopeId",
  ]);
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER =
  Object.freeze([
    "identityState",
    "classification",
    "actualRole",
    "derivedActualRole",
    "actualRoleSource",
    "displayRole",
    "displayRoleClamped",
    "name",
    "email",
  ]);
export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER =
  Object.freeze([
    "status",
    "preEngineActionEligibilityProjection",
    "selectedResultSummary",
    "runTableFirstNarrowOutputSummary",
  ]);

export const PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "state",
    "readiness",
    "ok",
    "failClosed",
    "blocker",
    "requestAccepted",
    "projectId",
    "localEnvelopeId",
    "localSavedAt",
    "localRevisionId",
    "serverEnvelopeId",
    "serverRevisionId",
    "supersededServerRevisionId",
    "preEngineActionSourceReady",
    "candidateReconstructionPreflightEligible",
    "preEngineEligibilityProjectionFingerprint",
    "serverOwned",
    "envelopeConstructedServerSide",
    "envelopeValidated",
    "retainedInProcessMemory",
    "activeRevision",
    "filesystemPersistenceEnabled",
    "projectEnvelopeReturned",
    "enginePayloadReturned",
    "privateCandidateReturned",
    "databasePathReturned",
    "filePathReturned",
    "sourcePathReturned",
    "engineOptionsReturned",
  ]);

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:@+-]{1,760}$/;
const ISO_TIMESTAMP_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const FORBIDDEN_SOURCE_KEY_PATTERN =
  /^(?:projectEnvelope|completedEnvelope|enginePayload|rawEnginePayload|rawEngineResult|privateCandidate|candidatePayload|database|databasePath|dbPath|filePath|sourcePath|privatePath|runtimeData|engineOptions|options)$/i;
const CANDIDATE_FINGERPRINT_PATTERN =
  /^safe-selector-readonly-engine-candidate:[0-9a-f]{40}$/;

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
  if (!value || value !== value.trim() || !SAFE_TOKEN_PATTERN.test(value)) return fallback;
  return value;
}

function safeText(value, { nullable = false, maxLength = 1000 } = {}) {
  if (value === null && nullable) return true;
  return typeof value === "string"
    && value.length <= maxLength
    && !PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value);
}

function clonePlain(value, depth = 0) {
  if (depth > 40) throw new Error("selected-project-registration-source-depth-invalid");
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => clonePlain(item, depth + 1));
  if (!isPlainObject(value)) {
    throw new Error("selected-project-registration-source-non-plain");
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, clonePlain(nested, depth + 1)]),
  );
}

function inspectSourceValue(value, depth = 0, seen = new Set()) {
  if (depth > 40) return "selected-project-registration-source-depth-invalid";
  if (typeof value === "string") {
    if (value.length > 8000) return "selected-project-registration-source-string-too-long";
    return PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value)
      ? "selected-project-registration-source-private-or-output-value-refused"
      : null;
  }
  if (value === null || typeof value === "boolean") return null;
  if (typeof value === "number") {
    return Number.isFinite(value)
      ? null
      : "selected-project-registration-source-number-invalid";
  }
  if (typeof value !== "object") {
    return "selected-project-registration-source-value-type-invalid";
  }
  if (seen.has(value)) return "selected-project-registration-source-cycle-refused";
  seen.add(value);
  if (Array.isArray(value)) {
    if (value.length > 10000) return "selected-project-registration-source-array-too-large";
    for (const nested of value) {
      const blocker = inspectSourceValue(nested, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return "selected-project-registration-source-non-plain";
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_SOURCE_KEY_PATTERN.test(key)) {
      return `selected-project-registration-source-forbidden-key-${key}`;
    }
    const blocker = inspectSourceValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

export function validateProjectBrowserSelectedProjectServerOwnedReadinessSummaryProjection(
  projection,
) {
  const selected = projection?.selectedResultSummary;
  const runTable = projection?.runTableFirstNarrowOutputSummary;
  const bothAbsent = selected === null && runTable === null;
  if (bothAbsent) return null;
  if (!isPlainObject(selected) || !isPlainObject(runTable)) {
    return "selected-project-registration-post-engine-summary-pair-incomplete";
  }
  if (Object.keys(selected).length === 0 && Object.keys(runTable).length === 0) return null;
  const blocker = validateSelectedProjectEngineRunReadinessReadbackSources(selected, runTable);
  return blocker ? `selected-project-registration-readiness-summary-${blocker}` : null;
}

function validateProjectProjection(project, projectId) {
  if (!hasExactKeys(
    project,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
  )) return "selected-project-registration-project-shape-invalid";
  if (!hasExactKeys(
    project.metadata,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
  )) return "selected-project-registration-project-metadata-shape-invalid";
  if (!hasExactKeys(
    project.currentProject,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
  )) return "selected-project-registration-current-project-shape-invalid";
  if (!hasExactKeys(
    project.selection,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
  )) return "selected-project-registration-project-selection-shape-invalid";
  if (safeToken(project.metadata.projectId) !== projectId
    || safeToken(project.currentProject.projectId) !== projectId
    || safeToken(project.selection.selectedProjectId) !== projectId) {
    return "selected-project-registration-project-identity-mismatch";
  }
  for (const value of [
    project.metadata.title,
    project.metadata.readiness,
    project.metadata.source,
    project.metadata.browserStatus,
    project.currentProject.title,
    project.currentProject.client,
    project.currentProject.site,
    project.currentProject.readiness,
    project.currentProject.source,
    project.selection.owner,
    project.selection.source,
  ]) {
    if (!safeText(value)) return "selected-project-registration-project-text-invalid";
  }
  if (typeof project.metadata.browserReady !== "boolean"
    || typeof project.metadata.restoredFromEnvelope !== "boolean"
    || !safeText(project.metadata.restoredAt, { nullable: true })
    || !safeText(project.metadata.restoredEnvelopeId, { nullable: true })
    || !safeText(project.selection.selectedAt, { nullable: true })
    || !safeText(project.selection.restoredEnvelopeId, { nullable: true })) {
    return "selected-project-registration-project-scalar-invalid";
  }
  return null;
}

function validateSourceProjection(sourceProjection, projectId) {
  if (!hasExactKeys(
    sourceProjection,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
  )) return "selected-project-registration-source-projection-shape-invalid";
  const projectBlocker = validateProjectProjection(sourceProjection.project, projectId);
  if (projectBlocker) return projectBlocker;
  if (!hasExactKeys(
    sourceProjection.savedBy,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
  )) return "selected-project-registration-saved-by-shape-invalid";
  if (!hasExactKeys(
    sourceProjection.selectorModule,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
  )) return "selected-project-registration-selector-module-shape-invalid";
  for (const value of [
    sourceProjection.savedBy.identityState,
    sourceProjection.savedBy.classification,
    sourceProjection.savedBy.actualRole,
    sourceProjection.savedBy.derivedActualRole,
    sourceProjection.savedBy.actualRoleSource,
    sourceProjection.savedBy.displayRole,
    sourceProjection.savedBy.name,
    sourceProjection.selectorModule.status,
    sourceProjection.contractVersion,
  ]) {
    if (!safeText(value)) return "selected-project-registration-source-scalar-invalid";
  }
  if (typeof sourceProjection.savedBy.displayRoleClamped !== "boolean"
    || !safeText(sourceProjection.savedBy.email, { nullable: true })) {
    return "selected-project-registration-saved-by-scalar-invalid";
  }
  const eligibilityValidation = validateCsSelectorPreEngineActionEligibilityProjection(
    sourceProjection.selectorModule.preEngineActionEligibilityProjection,
    { requireReady: true },
  );
  if (eligibilityValidation.valid !== true) {
    return "selected-project-registration-pre-engine-eligibility-invalid";
  }
  const postEngineBlocker =
    validateProjectBrowserSelectedProjectServerOwnedReadinessSummaryProjection(
      sourceProjection.selectorModule,
    );
  if (postEngineBlocker) return postEngineBlocker;
  return inspectSourceValue(sourceProjection);
}

function candidatePreflight(projection) {
  let mapperResult;
  try {
    mapperResult = buildSelectorReadonlyEngineCandidateForInternalSeam({
      factoryApprovedInputsSummary: projection.factoryApprovedInputsSummary,
      committedSelectorConstraints: projection.committedSelectorConstraints,
      lmTemperatureReadinessPreview: projection.lmTemperatureReadinessPreview,
    });
  } catch {
    return {
      eligible: false,
      blocker: "selected-project-registration-candidate-preflight-threw",
    };
  }
  const summary = mapperResult?.summary;
  const shape = summary?.candidateShapeSummary;
  const eligible = mapperResult?.ok === true
    && isPlainObject(mapperResult.candidate)
    && summary?.ready === true
    && summary?.readonlyEngineCandidateMapperReady === true
    && summary?.candidateReadyForHostLocalReadonlySeam === true
    && summary?.candidatePayloadReturned === false
    && CANDIDATE_FINGERPRINT_PATTERN.test(
      String(shape?.readonlyEngineCandidateFingerprint || ""),
    )
    && shape.readonlyEngineCandidateFingerprint === projection.candidateFingerprint
    && shape.runCount === projection.runCount
    && shape.totalQuantity === projection.totalQuantity;
  return {
    eligible,
    blocker: eligible
      ? null
      : "selected-project-registration-candidate-reconstruction-preflight-ineligible",
  };
}

function validateRequest(request) {
  if (!hasExactKeys(
    request,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
  )) return "selected-project-registration-request-shape-invalid";
  if (request.schemaId
      !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID
    || request.schemaVersion
      !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION
    || request.contractId
      !== PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID
    || request.requestKind
      !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND) {
    return "selected-project-registration-request-schema-mismatch";
  }
  if (safeToken(request.registrationSessionId) !== request.registrationSessionId
    || !Number.isSafeInteger(request.clientSaveOrdinal)
    || request.clientSaveOrdinal < 1
    || safeToken(request.localRevisionId) !== request.localRevisionId
    || safeToken(request.localProjectId) !== request.localProjectId
    || safeToken(request.localEnvelopeId) !== request.localEnvelopeId
    || typeof request.localSavedAt !== "string"
    || !ISO_TIMESTAMP_PATTERN.test(request.localSavedAt)
    || Number.isNaN(Date.parse(request.localSavedAt))) {
    return "selected-project-registration-request-identity-invalid";
  }
  return validateSourceProjection(request.sourceProjection, request.localProjectId);
}

function orderedResponse(fields) {
  return Object.freeze(Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function response({
  request = null,
  state = PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES
    .blockedFailClosed,
  blocker = "selected-project-registration-blocked",
  requestAccepted = false,
  projectId = null,
  localEnvelopeId = null,
  localSavedAt = null,
  localRevisionId = null,
  serverEnvelopeId = null,
  serverRevisionId = null,
  supersededServerRevisionId = null,
  preEngineActionSourceReady = false,
  candidateReconstructionPreflightEligible = false,
  preEngineEligibilityProjectionFingerprint = null,
  envelopeConstructedServerSide = false,
  envelopeValidated = false,
  activeRevision = false,
} = {}) {
  const registered = state
    === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered
    && activeRevision
    && preEngineActionSourceReady
    && candidateReconstructionPreflightEligible;
  return orderedResponse({
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
    contractId:
      PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
    state,
    readiness: registered
      ? "registered"
      : state === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.unavailable
        ? "unavailable"
        : "blocked_fail_closed",
    ok: registered,
    failClosed: !registered,
    blocker: registered ? null : safeToken(blocker, "selected-project-registration-blocked"),
    requestAccepted,
    projectId: safeToken(projectId || request?.localProjectId),
    localEnvelopeId: safeToken(localEnvelopeId || request?.localEnvelopeId),
    localSavedAt: typeof (localSavedAt || request?.localSavedAt) === "string"
      ? (localSavedAt || request?.localSavedAt)
      : null,
    localRevisionId: safeToken(localRevisionId || request?.localRevisionId),
    serverEnvelopeId: safeToken(serverEnvelopeId),
    serverRevisionId: safeToken(serverRevisionId),
    supersededServerRevisionId: safeToken(supersededServerRevisionId),
    preEngineActionSourceReady: registered,
    candidateReconstructionPreflightEligible: registered,
    preEngineEligibilityProjectionFingerprint: registered
      ? safeToken(preEngineEligibilityProjectionFingerprint)
      : null,
    serverOwned: true,
    envelopeConstructedServerSide,
    envelopeValidated,
    retainedInProcessMemory: true,
    activeRevision,
    filesystemPersistenceEnabled: false,
    projectEnvelopeReturned: false,
    enginePayloadReturned: false,
    privateCandidateReturned: false,
    databasePathReturned: false,
    filePathReturned: false,
    sourcePathReturned: false,
    engineOptionsReturned: false,
  });
}

function buildSaveInputs(sourceProjection) {
  const selectorModule = sourceProjection.selectorModule;
  return {
    context: {
      project: clonePlain(sourceProjection.project),
      identity: {
        identityState: sourceProjection.savedBy.identityState,
        classification: sourceProjection.savedBy.classification,
        actualRole: sourceProjection.savedBy.actualRole,
        derivedActualRole: sourceProjection.savedBy.derivedActualRole,
        actualRoleSource: sourceProjection.savedBy.actualRoleSource,
        displayRole: sourceProjection.savedBy.displayRole,
        displayRoleClamped: sourceProjection.savedBy.displayRoleClamped,
        currentUser: {
          name: sourceProjection.savedBy.name,
          email: sourceProjection.savedBy.email,
        },
      },
      visibility: {},
      flags: {},
      downstream: {},
      contractVersion: sourceProjection.contractVersion,
    },
    moduleContributions: {
      cs_selector: {
        moduleId: "cs_selector",
        status: "pre-engine-action-source-ready",
        state: {},
        preEngineActionEligibilityProjection: Object.freeze(clonePlain(
          selectorModule.preEngineActionEligibilityProjection,
        )),
        selectedResultSummary: {},
        runTableFirstNarrowOutputSummary: {},
      },
    },
  };
}

function aliasEnvelopeForLookup(envelope, activeRecord, lookupId) {
  const cloned = clonePlain(envelope);
  if (lookupId === activeRecord.localEnvelopeId) cloned.envelopeId = activeRecord.localEnvelopeId;
  return cloned;
}

export function createProjectBrowserSelectedProjectServerOwnedRuntimeSavedRegistry({
  savedProjects = null,
} = {}) {
  const runtimeSavedProjects = savedProjects || createSavedProjectStore();
  const activeByProjectId = new Map();
  const activeProjectIdByLookupId = new Map();
  const revisionsById = new Map();
  let revisionSequence = 0;

  async function register(request = null) {
    const requestBlocker = validateRequest(request);
    if (requestBlocker) return response({ request, blocker: requestBlocker });
    const projection = request.sourceProjection.selectorModule
      .preEngineActionEligibilityProjection;
    const preflight = candidatePreflight(projection);
    if (!preflight.eligible) {
      return response({
        request,
        blocker: preflight.blocker,
        requestAccepted: true,
      });
    }
    const registrationFingerprint = stableFingerprint(
      "selected-project-server-owned-pre-engine-registration",
      {
        projection,
        selectedResultSummary:
          request.sourceProjection.selectorModule.selectedResultSummary,
        runTableFirstNarrowOutputSummary:
          request.sourceProjection.selectorModule.runTableFirstNarrowOutputSummary,
      },
    );
    const existing = activeByProjectId.get(request.localProjectId) || null;
    if (existing
      && existing.registrationSessionId === request.registrationSessionId
      && request.clientSaveOrdinal < existing.clientSaveOrdinal) {
      return response({
        request,
        blocker: "selected-project-registration-stale-client-save-refused",
        requestAccepted: true,
        serverEnvelopeId: existing.serverEnvelopeId,
        serverRevisionId: existing.serverRevisionId,
      });
    }
    if (existing
      && existing.registrationSessionId === request.registrationSessionId
      && request.clientSaveOrdinal === existing.clientSaveOrdinal) {
      if (request.localRevisionId !== existing.localRevisionId
        || request.localEnvelopeId !== existing.localEnvelopeId
        || request.localSavedAt !== existing.localSavedAt
        || registrationFingerprint !== existing.registrationFingerprint) {
        return response({
          request,
          blocker: "selected-project-registration-client-save-ordinal-conflict",
          requestAccepted: true,
          serverEnvelopeId: existing.serverEnvelopeId,
          serverRevisionId: existing.serverRevisionId,
        });
      }
      return response({
        request,
        state: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered,
        requestAccepted: true,
        projectId: existing.projectId,
        localEnvelopeId: existing.localEnvelopeId,
        localSavedAt: existing.localSavedAt,
        localRevisionId: existing.localRevisionId,
        serverEnvelopeId: existing.serverEnvelopeId,
        serverRevisionId: existing.serverRevisionId,
        preEngineActionSourceReady: true,
        candidateReconstructionPreflightEligible: true,
        preEngineEligibilityProjectionFingerprint:
          existing.preEngineEligibilityProjectionFingerprint,
        envelopeConstructedServerSide: true,
        envelopeValidated: true,
        activeRevision: true,
      });
    }
    if (typeof runtimeSavedProjects?.saveCurrentProjectEnvelope !== "function"
      || typeof runtimeSavedProjects?.getProjectEnvelope !== "function") {
      return response({
        request,
        state: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.unavailable,
        blocker: "selected-project-registration-saved-project-store-unavailable",
        requestAccepted: true,
      });
    }

    let saveResult;
    try {
      const { context, moduleContributions } = buildSaveInputs(request.sourceProjection);
      saveResult = await runtimeSavedProjects.saveCurrentProjectEnvelope(
        context,
        moduleContributions,
      );
    } catch {
      return response({
        request,
        blocker: "selected-project-registration-envelope-construction-threw",
        requestAccepted: true,
      });
    }
    if (saveResult?.accepted !== true || !isPlainObject(saveResult.envelope)) {
      return response({
        request,
        blocker: "selected-project-registration-envelope-construction-rejected",
        requestAccepted: true,
        envelopeConstructedServerSide: true,
      });
    }
    const validation = validateSavedProjectEnvelope(saveResult.envelope);
    const retainedProjection = saveResult.envelope?.modules?.cs_selector?.downstreamContext
      ?.preEngineActionEligibilityProjection;
    const retainedProjectionValidation =
      validateCsSelectorPreEngineActionEligibilityProjection(retainedProjection, {
        requireReady: true,
      });
    if (validation.valid !== true
      || retainedProjectionValidation.valid !== true
      || saveResult.envelope.projectId !== request.localProjectId
      || saveResult.envelope.source !== "p2-shell-save-envelope"
      || saveResult.envelope.readOnly === true
      || saveResult.envelope.browserOnly === true) {
      return response({
        request,
        blocker: "selected-project-registration-envelope-validation-failed",
        requestAccepted: true,
        envelopeConstructedServerSide: true,
      });
    }

    revisionSequence += 1;
    const serverRevisionId = `server-revision-${request.localProjectId}-${revisionSequence}`;
    const record = Object.freeze({
      projectId: request.localProjectId,
      registrationSessionId: request.registrationSessionId,
      clientSaveOrdinal: request.clientSaveOrdinal,
      localRevisionId: request.localRevisionId,
      localEnvelopeId: request.localEnvelopeId,
      localSavedAt: request.localSavedAt,
      serverEnvelopeId: saveResult.envelope.envelopeId,
      serverRevisionId,
      supersededServerRevisionId: existing?.serverRevisionId || null,
      registrationFingerprint,
      preEngineEligibilityProjectionFingerprint: projection.projectionFingerprint,
      preEngineActionSourceReady: true,
      candidateReconstructionPreflightEligible: true,
      active: true,
    });
    if (existing) {
      revisionsById.set(existing.serverRevisionId, Object.freeze({
        ...existing,
        active: false,
        supersededByServerRevisionId: serverRevisionId,
      }));
      activeProjectIdByLookupId.delete(existing.localEnvelopeId);
      activeProjectIdByLookupId.delete(existing.serverEnvelopeId);
    }
    activeByProjectId.set(record.projectId, record);
    activeProjectIdByLookupId.set(record.projectId, record.projectId);
    activeProjectIdByLookupId.set(record.localEnvelopeId, record.projectId);
    activeProjectIdByLookupId.set(record.serverEnvelopeId, record.projectId);
    revisionsById.set(record.serverRevisionId, record);

    return response({
      request,
      state: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered,
      requestAccepted: true,
      projectId: record.projectId,
      localEnvelopeId: record.localEnvelopeId,
      localSavedAt: record.localSavedAt,
      localRevisionId: record.localRevisionId,
      serverEnvelopeId: record.serverEnvelopeId,
      serverRevisionId: record.serverRevisionId,
      supersededServerRevisionId: record.supersededServerRevisionId,
      preEngineActionSourceReady: true,
      candidateReconstructionPreflightEligible: true,
      preEngineEligibilityProjectionFingerprint:
        record.preEngineEligibilityProjectionFingerprint,
      envelopeConstructedServerSide: true,
      envelopeValidated: true,
      activeRevision: true,
    });
  }

  return Object.freeze({
    contractId:
      PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
    path: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
    method: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
    serverOwned: true,
    inProcessMemoryOnly: true,
    filesystemPersistenceEnabled: false,
    register,
    getProjectEnvelope(projectIdOrEnvelopeId) {
      const lookupId = safeToken(projectIdOrEnvelopeId);
      const projectId = activeProjectIdByLookupId.get(lookupId) || lookupId;
      const activeRecord = activeByProjectId.get(projectId);
      if (!activeRecord) return null;
      const envelope = runtimeSavedProjects.getProjectEnvelope(activeRecord.serverEnvelopeId);
      if (!envelope) return null;
      return aliasEnvelopeForLookup(envelope, activeRecord, lookupId);
    },
    getActiveRevision(projectIdOrEnvelopeId) {
      const lookupId = safeToken(projectIdOrEnvelopeId);
      const projectId = activeProjectIdByLookupId.get(lookupId) || lookupId;
      const activeRecord = activeByProjectId.get(projectId);
      return activeRecord ? { ...activeRecord } : null;
    },
  });
}
