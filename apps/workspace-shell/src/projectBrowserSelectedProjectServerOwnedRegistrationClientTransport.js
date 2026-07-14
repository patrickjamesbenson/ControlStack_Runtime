import {
  PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES,
  validateProjectBrowserSelectedProjectServerOwnedReadinessSummaryProjection,
} from "../../../packages/workspace-kernel/projectBrowserSelectedProjectServerOwnedRegistrationBoundary.js";

export const SHELL_PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_CLIENT_TRANSPORT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SERVER-OWNED-RUNTIME-SAVED-SELECTED-PROJECT-REGISTRATION-CLIENT-TRANSPORT-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-server-owned-registration-client.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES =
  Object.freeze({
    registered:
      "shell_project_browser_selected_project_server_owned_registration_client_registered",
    unavailable:
      "shell_project_browser_selected_project_server_owned_registration_client_unavailable",
    blockedFailClosed:
      "shell_project_browser_selected_project_server_owned_registration_client_blocked_fail_closed",
  });

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_REQUEST_FIELD_ORDER =
  Object.freeze([
    "localSave",
    "registrationSessionId",
    "clientSaveOrdinal",
    "localRevisionId",
  ]);

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER =
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
    "projectId",
    "localEnvelopeId",
    "localSavedAt",
    "localRevisionId",
    "serverEnvelopeId",
    "serverRevisionId",
    "supersededServerRevisionId",
    "requestValidated",
    "requestDispatched",
    "responseReceived",
    "responseValidated",
    "httpStatus",
    "serverRequestAccepted",
    "serverOwned",
    "envelopeConstructedServerSide",
    "envelopeValidated",
    "retainedInProcessMemory",
    "activeRevision",
    "sameOrigin",
    "scalarAcknowledgementOnly",
    "projectEnvelopeSent",
    "projectEnvelopeReturned",
    "enginePayloadSent",
    "enginePayloadReturned",
    "privateCandidateSent",
    "privateCandidateReturned",
    "databasePathSent",
    "databasePathReturned",
    "filePathSent",
    "filePathReturned",
    "sourcePathSent",
    "sourcePathReturned",
    "engineOptionsSent",
    "engineOptionsReturned",
    "filesystemPersistenceEnabled",
  ]);

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:@+-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const FORBIDDEN_SOURCE_KEY_PATTERN =
  /^(?:projectEnvelope|completedEnvelope|enginePayload|rawEnginePayload|rawEngineResult|privateCandidate|candidatePayload|database|databasePath|dbPath|filePath|sourcePath|privatePath|runtimeData|engineOptions|options)$/i;
const REQUIRED_SERVER_TRUE_FLAGS = Object.freeze([
  "requestAccepted",
  "serverOwned",
  "envelopeConstructedServerSide",
  "envelopeValidated",
  "retainedInProcessMemory",
  "activeRevision",
]);
const REQUIRED_SERVER_FALSE_FLAGS = Object.freeze([
  "filesystemPersistenceEnabled",
  "projectEnvelopeReturned",
  "enginePayloadReturned",
  "privateCandidateReturned",
  "databasePathReturned",
  "filePathReturned",
  "sourcePathReturned",
  "engineOptionsReturned",
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
  if (!value || value !== value.trim() || !SAFE_TOKEN_PATTERN.test(value)) return fallback;
  return value;
}

function isSafeScalar(value) {
  return value === null
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isSafeInteger(value))
    || (typeof value === "string"
      && value.length <= 1000
      && !PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value));
}

function orderedObject(order, fields) {
  return Object.fromEntries(order.map((key) => [key, fields[key]]));
}

function clonePlain(value, depth = 0) {
  if (depth > 40) throw new Error("selected-project-registration-client-source-depth-invalid");
  if (value === null || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((item) => clonePlain(item, depth + 1));
  if (!isPlainObject(value)) {
    throw new Error("selected-project-registration-client-source-non-plain");
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, clonePlain(nested, depth + 1)]),
  );
}

function inspectSourceValue(value, depth = 0, seen = new Set()) {
  if (depth > 40) return "selected-project-registration-client-source-depth-invalid";
  if (typeof value === "string") {
    if (value.length > 8000) return "selected-project-registration-client-source-string-too-long";
    return PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value)
      ? "selected-project-registration-client-source-private-or-output-value-refused"
      : null;
  }
  if (value === null || typeof value === "boolean") return null;
  if (typeof value === "number") return Number.isFinite(value)
    ? null
    : "selected-project-registration-client-source-number-invalid";
  if (typeof value !== "object") return "selected-project-registration-client-source-type-invalid";
  if (seen.has(value)) return "selected-project-registration-client-source-cycle-refused";
  seen.add(value);
  if (Array.isArray(value)) {
    for (const nested of value) {
      const blocker = inspectSourceValue(nested, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return "selected-project-registration-client-source-non-plain";
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_SOURCE_KEY_PATTERN.test(key)) {
      return `selected-project-registration-client-source-forbidden-key-${key}`;
    }
    const blocker = inspectSourceValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function projectProjection(envelope) {
  const project = isPlainObject(envelope?.project) ? envelope.project : {};
  const metadata = isPlainObject(project.metadata) ? project.metadata : {};
  const currentProject = isPlainObject(project.currentProject) ? project.currentProject : {};
  const selection = isPlainObject(project.selection) ? project.selection : {};
  return orderedObject(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_FIELD_ORDER,
    {
      metadata: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PROJECT_METADATA_FIELD_ORDER,
        {
          projectId: metadata.projectId ?? envelope?.projectId ?? null,
          title: metadata.title ?? envelope?.title ?? "Untitled project",
          readiness: metadata.readiness ?? "not-ready",
          source: metadata.source ?? "unknown",
          browserReady: metadata.browserReady === true,
          browserStatus: metadata.browserStatus ?? "unknown",
          restoredFromEnvelope: metadata.restoredFromEnvelope === true,
          restoredAt: metadata.restoredAt ?? null,
          restoredEnvelopeId: metadata.restoredEnvelopeId ?? null,
        },
      ),
      currentProject: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CURRENT_PROJECT_FIELD_ORDER,
        {
          projectId: currentProject.projectId ?? envelope?.projectId ?? null,
          title: currentProject.title ?? envelope?.title ?? "Untitled project",
          client: currentProject.client ?? envelope?.client ?? "No client loaded",
          site: currentProject.site ?? envelope?.site ?? "No site loaded",
          readiness: currentProject.readiness ?? "not-ready",
          source: currentProject.source ?? "unknown",
        },
      ),
      selection: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTION_FIELD_ORDER,
        {
          owner: selection.owner ?? "shell",
          selectedProjectId: selection.selectedProjectId ?? envelope?.projectId ?? null,
          selectedAt: selection.selectedAt ?? null,
          source: selection.source ?? "unknown",
          restoredEnvelopeId: selection.restoredEnvelopeId ?? null,
        },
      ),
    },
  );
}

function savedByProjection(envelope) {
  const savedBy = isPlainObject(envelope?.savedBy) ? envelope.savedBy : {};
  return orderedObject(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SAVED_BY_FIELD_ORDER,
    {
      identityState: savedBy.identityState ?? "external_anonymous",
      classification: savedBy.classification ?? "anonymous",
      actualRole: savedBy.actualRole ?? "external_user",
      derivedActualRole: savedBy.derivedActualRole ?? savedBy.actualRole ?? "external_user",
      actualRoleSource: savedBy.actualRoleSource ?? "unknown",
      displayRole: savedBy.displayRole ?? "external_user",
      displayRoleClamped: savedBy.displayRoleClamped === true,
      name: savedBy.name ?? "Workspace User",
      email: savedBy.email ?? null,
    },
  );
}

function resolveStage3Inputs(envelope) {
  const selectorModule = envelope?.modules?.cs_selector;
  const state = isPlainObject(selectorModule?.state) ? selectorModule.state : {};
  const downstreamContext = isPlainObject(selectorModule?.downstreamContext)
    ? selectorModule.downstreamContext
    : {};
  const candidates = [
    state.engineRunActionSource,
    downstreamContext.engineRunActionSource,
    state,
    downstreamContext,
  ];
  for (const candidate of candidates) {
    if (!isPlainObject(candidate)) continue;
    if (isPlainObject(candidate.factoryApprovedInputsSummary)
      && Array.isArray(candidate.committedSelectorConstraints)
      && isPlainObject(candidate.lmTemperatureReadinessPreview)) {
      return {
        factoryApprovedInputsSummary: clonePlain(candidate.factoryApprovedInputsSummary),
        committedSelectorConstraints: clonePlain(candidate.committedSelectorConstraints),
        lmTemperatureReadinessPreview: clonePlain(candidate.lmTemperatureReadinessPreview),
      };
    }
  }
  return null;
}

function resolveReadinessSummaries(envelope) {
  const downstreamContext = envelope?.modules?.cs_selector?.downstreamContext;
  const projection = {
    selectedResultSummary: isPlainObject(downstreamContext?.selectedResultSummary)
      ? clonePlain(downstreamContext.selectedResultSummary)
      : null,
    runTableFirstNarrowOutputSummary:
      isPlainObject(downstreamContext?.runTableFirstNarrowOutputSummary)
        ? clonePlain(downstreamContext.runTableFirstNarrowOutputSummary)
        : null,
  };
  const blocker =
    validateProjectBrowserSelectedProjectServerOwnedReadinessSummaryProjection(projection);
  return {
    blocker: blocker
      ? blocker.replace(
        /^selected-project-registration-/,
        "selected-project-registration-client-",
      )
      : null,
    projection: blocker ? null : projection,
  };
}

function buildSourceProjection(envelope) {
  const stage3Inputs = resolveStage3Inputs(envelope);
  if (!stage3Inputs) return {
    blocker: "selected-project-registration-client-stage3-inputs-missing",
    sourceProjection: null,
  };
  const readinessSummaries = resolveReadinessSummaries(envelope);
  if (readinessSummaries.blocker) return {
    blocker: readinessSummaries.blocker,
    sourceProjection: null,
  };
  const sourceProjection = orderedObject(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SOURCE_FIELD_ORDER,
    {
      project: projectProjection(envelope),
      savedBy: savedByProjection(envelope),
      contractVersion: envelope?.shell?.contractVersion ?? "not-declared",
      selectorModule: orderedObject(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SELECTOR_MODULE_FIELD_ORDER,
        {
          status: envelope?.modules?.cs_selector?.status ?? "ready",
          ...stage3Inputs,
          ...readinessSummaries.projection,
        },
      ),
    },
  );
  const blocker = inspectSourceValue(sourceProjection);
  return { blocker, sourceProjection: blocker ? null : sourceProjection };
}

function orderedResult(fields) {
  return Object.freeze(Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_RESULT_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function clientResult({
  state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
    .blockedFailClosed,
  blocker = "selected-project-registration-client-blocked",
  projectId = null,
  localEnvelopeId = null,
  localSavedAt = null,
  localRevisionId = null,
  serverEnvelopeId = null,
  serverRevisionId = null,
  supersededServerRevisionId = null,
  requestValidated = false,
  requestDispatched = false,
  responseReceived = false,
  responseValidated = false,
  httpStatus = null,
  serverRequestAccepted = false,
  envelopeConstructedServerSide = false,
  envelopeValidated = false,
  activeRevision = false,
} = {}) {
  const registered = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES.registered;
  return orderedResult({
    schemaId:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_ID,
    schemaVersion:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_SCHEMA_VERSION,
    contractId:
      SHELL_PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_CLIENT_TRANSPORT_ID,
    owner: "shell-browser-client",
    state,
    readiness: registered
      ? "registered"
      : state
          === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .unavailable
        ? "unavailable"
        : "blocked_fail_closed",
    ok: registered,
    failClosed: !registered,
    blocker: registered ? null : safeToken(blocker, "selected-project-registration-client-blocked"),
    projectId: safeToken(projectId),
    localEnvelopeId: safeToken(localEnvelopeId),
    localSavedAt: typeof localSavedAt === "string" ? localSavedAt : null,
    localRevisionId: safeToken(localRevisionId),
    serverEnvelopeId: safeToken(serverEnvelopeId),
    serverRevisionId: safeToken(serverRevisionId),
    supersededServerRevisionId: safeToken(supersededServerRevisionId),
    requestValidated,
    requestDispatched,
    responseReceived,
    responseValidated,
    httpStatus: Number.isSafeInteger(httpStatus) ? httpStatus : null,
    serverRequestAccepted,
    serverOwned: registered,
    envelopeConstructedServerSide,
    envelopeValidated,
    retainedInProcessMemory: registered,
    activeRevision,
    sameOrigin: true,
    scalarAcknowledgementOnly: true,
    projectEnvelopeSent: false,
    projectEnvelopeReturned: false,
    enginePayloadSent: false,
    enginePayloadReturned: false,
    privateCandidateSent: false,
    privateCandidateReturned: false,
    databasePathSent: false,
    databasePathReturned: false,
    filePathSent: false,
    filePathReturned: false,
    sourcePathSent: false,
    sourcePathReturned: false,
    engineOptionsSent: false,
    engineOptionsReturned: false,
    filesystemPersistenceEnabled: false,
  });
}

function validateClientRequest(request) {
  if (!hasExactKeys(
    request,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_REQUEST_FIELD_ORDER,
  )) return "selected-project-registration-client-request-shape-invalid";
  if (!isPlainObject(request.localSave)
    || !isPlainObject(request.localSave.envelope)
    || request.localSave.accepted !== true) {
    return "selected-project-registration-client-local-save-invalid";
  }
  const envelope = request.localSave.envelope;
  if (safeToken(envelope.projectId) !== envelope.projectId
    || safeToken(envelope.envelopeId) !== envelope.envelopeId
    || typeof envelope.savedAt !== "string"
    || envelope.source !== "p2-shell-save-envelope"
    || envelope.readOnly === true
    || envelope.browserOnly === true) {
    return "selected-project-registration-client-local-envelope-invalid";
  }
  if (safeToken(request.registrationSessionId) !== request.registrationSessionId
    || !Number.isSafeInteger(request.clientSaveOrdinal)
    || request.clientSaveOrdinal < 1
    || safeToken(request.localRevisionId) !== request.localRevisionId) {
    return "selected-project-registration-client-revision-identity-invalid";
  }
  return null;
}

function buildTransportRequest(request, sourceProjection) {
  const envelope = request.localSave.envelope;
  const fields = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID,
    schemaVersion:
      PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION,
    contractId:
      PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID,
    requestKind: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_KIND,
    registrationSessionId: request.registrationSessionId,
    clientSaveOrdinal: request.clientSaveOrdinal,
    localRevisionId: request.localRevisionId,
    localProjectId: envelope.projectId,
    localEnvelopeId: envelope.envelopeId,
    localSavedAt: envelope.savedAt,
    sourceProjection,
  };
  return Object.freeze(Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_REQUEST_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function validateResponseBody(body, request) {
  if (!hasExactKeys(
    body,
    PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_RESPONSE_FIELD_ORDER,
  ) || !Object.values(body).every(isSafeScalar)) {
    return "selected-project-registration-client-response-shape-invalid";
  }
  if (body.schemaId !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_ID
    || body.schemaVersion
      !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_SCHEMA_VERSION
    || body.contractId
      !== PROJECT_BROWSER_FIRST_SERVER_OWNED_RUNTIME_SAVED_SELECTED_PROJECT_REGISTRATION_ID) {
    return "selected-project-registration-client-response-schema-mismatch";
  }
  const envelope = request.localSave.envelope;
  if (body.projectId !== envelope.projectId
    || body.localEnvelopeId !== envelope.envelopeId
    || body.localSavedAt !== envelope.savedAt
    || body.localRevisionId !== request.localRevisionId) {
    return "selected-project-registration-client-response-local-revision-mismatch";
  }
  const registered = body.state
    === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered;
  const unavailable = body.state
    === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.unavailable;
  if (!registered && !unavailable && body.state
      !== PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.blockedFailClosed) {
    return "selected-project-registration-client-response-state-invalid";
  }
  if (registered) {
    for (const key of REQUIRED_SERVER_TRUE_FLAGS) {
      if (body[key] !== true) {
        return `selected-project-registration-client-response-required-flag-not-true-${key}`;
      }
    }
    for (const key of REQUIRED_SERVER_FALSE_FLAGS) {
      if (body[key] !== false) {
        return `selected-project-registration-client-response-required-flag-not-false-${key}`;
      }
    }
    if (body.readiness !== "registered"
      || body.ok !== true
      || body.failClosed !== false
      || body.blocker !== null
      || safeToken(body.serverEnvelopeId) === null
      || safeToken(body.serverRevisionId) === null) {
      return "selected-project-registration-client-response-registered-contract-invalid";
    }
    return null;
  }
  if (body.ok !== false
    || body.failClosed !== true
    || safeToken(body.blocker) === null
    || body.activeRevision !== false) {
    return "selected-project-registration-client-response-fail-closed-contract-invalid";
  }
  return null;
}

export function createShellProjectBrowserSelectedProjectServerOwnedRegistrationClientTransport({
  fetchImpl = null,
} = {}) {
  return async function registerRuntimeSavedSelectedProject(request = null) {
    const requestBlocker = validateClientRequest(request);
    const envelope = request?.localSave?.envelope;
    if (requestBlocker) {
      return clientResult({
        blocker: requestBlocker,
        projectId: envelope?.projectId,
        localEnvelopeId: envelope?.envelopeId,
        localSavedAt: envelope?.savedAt,
        localRevisionId: request?.localRevisionId,
      });
    }

    const projection = buildSourceProjection(envelope);
    if (projection.blocker) {
      return clientResult({
        blocker: projection.blocker,
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
      });
    }

    const browserFetch = typeof fetchImpl === "function" ? fetchImpl : globalThis.fetch;
    if (typeof browserFetch !== "function") {
      return clientResult({
        state:
          SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .unavailable,
        blocker: "selected-project-registration-client-fetch-unavailable",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
      });
    }

    const transportRequest = buildTransportRequest(request, projection.sourceProjection);
    let httpResponse;
    try {
      httpResponse = await browserFetch(
        PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_PATH,
        {
          method: PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_METHOD,
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
        blocker: "selected-project-registration-client-request-failed",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
      });
    }

    const httpStatus = Number.isSafeInteger(httpResponse?.status)
      ? httpResponse.status
      : null;
    const contentType = typeof httpResponse?.headers?.get === "function"
      ? httpResponse.headers.get("content-type")
      : null;
    if (httpResponse?.redirected === true
      || typeof httpResponse?.json !== "function"
      || typeof contentType !== "string"
      || !/^application\/json(?:;|$)/i.test(contentType.trim())) {
      return clientResult({
        blocker: "selected-project-registration-client-http-response-invalid",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    let body;
    try {
      body = await httpResponse.json();
    } catch {
      return clientResult({
        blocker: "selected-project-registration-client-response-json-invalid",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    const responseBlocker = validateResponseBody(body, request);
    if (responseBlocker) {
      return clientResult({
        blocker: responseBlocker,
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    const registered = body.state
      === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.registered;
    const expectedStatus = registered ? 200 : 422;
    if (httpStatus !== expectedStatus) {
      return clientResult({
        blocker: "selected-project-registration-client-http-status-mismatch",
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId: request.localRevisionId,
        requestValidated: true,
        requestDispatched: true,
        responseReceived: true,
        httpStatus,
      });
    }

    return clientResult({
      state: registered
        ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
          .registered
        : body.state
            === PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_STATES.unavailable
          ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .unavailable
          : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_SERVER_OWNED_REGISTRATION_CLIENT_STATES
            .blockedFailClosed,
      blocker: body.blocker,
      projectId: body.projectId,
      localEnvelopeId: body.localEnvelopeId,
      localSavedAt: body.localSavedAt,
      localRevisionId: body.localRevisionId,
      serverEnvelopeId: body.serverEnvelopeId,
      serverRevisionId: body.serverRevisionId,
      supersededServerRevisionId: body.supersededServerRevisionId,
      requestValidated: true,
      requestDispatched: true,
      responseReceived: true,
      responseValidated: true,
      httpStatus,
      serverRequestAccepted: body.requestAccepted,
      envelopeConstructedServerSide: body.envelopeConstructedServerSide,
      envelopeValidated: body.envelopeValidated,
      activeRevision: body.activeRevision,
    });
  };
}
