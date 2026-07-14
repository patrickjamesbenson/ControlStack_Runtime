import {
  createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES,
} from "./engineRunTableSelectedProjectReadonlyInvokeCapability.js";
import {
  resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary,
} from "./projectBrowserSelectedProjectEngineRunActionSourceBoundary.js";
import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
} from "./projectBrowserService.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID =
  "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-SHELL-INVOKE-TRANSPORT-BOUNDARY-1";
export const RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_LIVE_READONLY_INVOKE_LIFECYCLE_AND_NO_WRITE_LOCK_ID =
  "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-LIVE-READONLY-INVOKE-LIFECYCLE-AND-NO-WRITE-LOCK-1";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.selected-project-shell-invoke-transport-boundary.v1";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION = 1;
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND =
  "selected-project-readonly-engine-invoke";

export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES =
  Object.freeze({
    completed: "runtime_engine_runtable_selected_project_shell_invoke_transport_completed",
    unavailable: "runtime_engine_runtable_selected_project_shell_invoke_transport_unavailable",
    blockedFailClosed:
      "runtime_engine_runtable_selected_project_shell_invoke_transport_blocked_fail_closed",
  });

export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "requestKind",
    "selectedProjectId",
    "readOnly",
    "selectedProjectOnly",
  ]);

export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "state",
    "readiness",
    "ok",
    "failClosed",
    "blocker",
    "selectedProjectId",
    "requestAccepted",
    "serverOwned",
    "sourceBoundaryReconstructedServerSide",
    "sourceBoundaryReady",
    "capabilityInvoked",
    "capabilityCompleted",
    "readOnly",
    "selectedProjectOnly",
    "redactedOutcomeOnly",
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
    "routesAdded",
    "postEndpointsAdded",
  ]);

export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER =
  Object.freeze([
    ...RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER.slice(0, 11),
    "serverOwnedRevisionChecked",
    "inFlightInvocationBlocked",
    "invocationConsumed",
    "replayBlocked",
    "staleServerRevisionBlocked",
    "secondServerOwnedEnvelopeRevisionCheckPassed",
    ...RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER.slice(11, 15),
    "activeRuntimeDataLoadedReadOnly",
    "activeRuntimeDataPassedInMemoryOnly",
    "donorRunEngineAttempted",
    "donorBridgeUsed",
    "filesystemWriteGuardActive",
    "filesystemWriteAttempted",
    "auditJsonlWriteAttempted",
    "runtimeDataMutated",
    "selectedResultPersisted",
    "runTableGenerated",
    "iesGenerated",
    "outputGenerated",
    ...RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_RESPONSE_FIELD_ORDER.slice(15),
  ]);

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:@+-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const PRIVATE_ENVELOPE_FINGERPRINT_PREFIX =
  "private-selected-project-server-owned-engine-invoke-envelope";
const IN_FLIGHT_SERVER_REVISION_IDS = new Set();
const CONSUMED_SERVER_REVISION_IDS = new Set();

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
    || PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(token)
    || !SAFE_TOKEN_PATTERN.test(token)) return fallback;
  return token;
}

function clonePlain(value, depth = 0) {
  if (depth > 40) {
    throw new Error("selected-project-shell-invoke-transport-private-envelope-depth-invalid");
  }
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((item) => clonePlain(item, depth + 1));
  if (!isPlainObject(value)) {
    throw new Error("selected-project-shell-invoke-transport-private-envelope-non-plain");
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, clonePlain(nested, depth + 1)]),
  );
}

function validateRequest(request) {
  if (!hasExactKeys(
    request,
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_FIELD_ORDER,
  )) {
    return "selected-project-shell-invoke-transport-request-shape-invalid";
  }
  if (request.schemaId
      !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID
    || request.schemaVersion
      !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION
    || request.contractId
      !== RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID
    || request.requestKind
      !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_REQUEST_KIND) {
    return "selected-project-shell-invoke-transport-request-schema-mismatch";
  }
  if (!safeToken(request.selectedProjectId)) {
    return "selected-project-shell-invoke-transport-selected-project-id-invalid";
  }
  if (request.readOnly !== true || request.selectedProjectOnly !== true) {
    return "selected-project-shell-invoke-transport-request-safety-flags-invalid";
  }
  return null;
}

function validateActiveRevision(revision, selectedProjectId) {
  if (!isPlainObject(revision)
    || revision.active !== true
    || !safeToken(revision.projectId)
    || !safeToken(revision.localEnvelopeId)
    || !safeToken(revision.serverEnvelopeId)
    || !safeToken(revision.serverRevisionId)
    || !safeToken(revision.localRevisionId)) {
    return "selected-project-shell-invoke-transport-active-server-revision-invalid";
  }
  if (![revision.projectId, revision.localEnvelopeId, revision.serverEnvelopeId]
    .includes(selectedProjectId)) {
    return "selected-project-shell-invoke-transport-stale-server-owned-revision-blocked";
  }
  return null;
}

function privateEnvelopeFingerprint(envelope) {
  return stableFingerprint(PRIVATE_ENVELOPE_FINGERPRINT_PREFIX, envelope);
}

function orderedResponse(fields) {
  return Object.freeze(Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_LIVE_READONLY_INVOKE_RESPONSE_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function buildResponse({
  request = null,
  state = RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES
    .blockedFailClosed,
  blocker = null,
  requestAccepted = false,
  serverOwnedRevisionChecked = false,
  inFlightInvocationBlocked = false,
  invocationConsumed = false,
  replayBlocked = false,
  staleServerRevisionBlocked = false,
  secondServerOwnedEnvelopeRevisionCheckPassed = false,
  sourceBoundaryReconstructedServerSide = false,
  sourceBoundaryReady = false,
  capabilityInvoked = false,
  capabilityCompleted = false,
  safety = null,
  hostTransportMounted = false,
} = {}) {
  const completed = state
    === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed
    && capabilityCompleted;
  return orderedResponse({
    schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_ID,
    schemaVersion:
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_SCHEMA_VERSION,
    contractId:
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_BOUNDARY_ID,
    state,
    readiness: completed ? "completed" : state
      === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable
      ? "unavailable"
      : "blocked_fail_closed",
    ok: completed,
    failClosed: !completed,
    blocker: completed
      ? null
      : safeToken(blocker, "selected-project-shell-invoke-transport-blocked"),
    selectedProjectId: safeToken(request?.selectedProjectId),
    requestAccepted,
    serverOwned: true,
    serverOwnedRevisionChecked,
    inFlightInvocationBlocked,
    invocationConsumed,
    replayBlocked,
    staleServerRevisionBlocked,
    secondServerOwnedEnvelopeRevisionCheckPassed,
    sourceBoundaryReconstructedServerSide,
    sourceBoundaryReady,
    capabilityInvoked,
    capabilityCompleted,
    activeRuntimeDataLoadedReadOnly: safety?.activeRuntimeDataLoadedReadOnly === true,
    activeRuntimeDataPassedInMemoryOnly:
      safety?.activeRuntimeDataPassedInMemoryOnly === true,
    donorRunEngineAttempted: safety?.donorRunEngineAttempted === true,
    donorBridgeUsed: safety?.donorBridgeUsed === true,
    filesystemWriteGuardActive: safety?.filesystemWriteGuardActive === true,
    filesystemWriteAttempted: safety?.filesystemWriteAttempted === true,
    auditJsonlWriteAttempted: safety?.auditJsonlWriteAttempted === true,
    runtimeDataMutated: safety?.runtimeDataMutated === true,
    selectedResultPersisted: safety?.selectedResultPersisted === true,
    runTableGenerated: safety?.runTableGenerated === true,
    iesGenerated: safety?.iesGenerated === true,
    outputGenerated: safety?.outputGenerated === true,
    readOnly: true,
    selectedProjectOnly: true,
    redactedOutcomeOnly: true,
    candidatePayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    runRowsReturned: false,
    exactElectricalValuesReturned: false,
    fingerprintsReturned: false,
    projectEnvelopeReturned: false,
    runtimeDataDetailsReturned: false,
    internalSeamExposed: false,
    mcpExposed: false,
    shellDirectInternalCallAllowed: false,
    shellMounted: false,
    routesAdded: hostTransportMounted === true,
    postEndpointsAdded: hostTransportMounted === true,
  });
}

function createServerOwnedRevisionGuardedAdapter({
  adapter,
  verifyCurrentEnvelopeRevision,
} = {}) {
  if (!isPlainObject(adapter)) return adapter;
  let secondCheckPassed = false;
  return Object.freeze({
    ...adapter,
    serverOwnedRevisionGuarded: true,
    secondServerOwnedEnvelopeRevisionCheckPassed() {
      return secondCheckPassed;
    },
    async invoke(request) {
      const blocker = await verifyCurrentEnvelopeRevision();
      if (blocker) throw new Error(blocker);
      secondCheckPassed = true;
      return adapter.invoke(request);
    },
  });
}

export function createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary({
  savedProjects = null,
  hostLocalReadonlySeamAdapter = null,
  hostTransportMounted = false,
} = {}) {
  const respond = (options = {}) => buildResponse({
    ...options,
    hostTransportMounted: hostTransportMounted === true,
  });

  return async function invokeSelectedProjectFromShellTransport(request = null) {
    const requestBlocker = validateRequest(request);
    if (requestBlocker) return respond({ request, blocker: requestBlocker });

    const selectedProjectId = request.selectedProjectId;
    const getProjectEnvelope = savedProjects?.getProjectEnvelope;
    const getActiveRevision = savedProjects?.getActiveRevision;
    if (typeof getProjectEnvelope !== "function" || typeof getActiveRevision !== "function") {
      return respond({
        request,
        state:
          RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable,
        blocker: "selected-project-shell-invoke-transport-server-revision-service-unavailable",
        requestAccepted: true,
      });
    }

    let activeRevision;
    try {
      activeRevision = clonePlain(
        await getActiveRevision.call(savedProjects, selectedProjectId),
      );
    } catch {
      return respond({
        request,
        blocker: "selected-project-shell-invoke-transport-active-server-revision-read-failed",
        requestAccepted: true,
      });
    }
    const revisionBlocker = validateActiveRevision(activeRevision, selectedProjectId);
    if (revisionBlocker) {
      return respond({
        request,
        blocker: revisionBlocker,
        requestAccepted: true,
        serverOwnedRevisionChecked: true,
        staleServerRevisionBlocked: revisionBlocker
          === "selected-project-shell-invoke-transport-stale-server-owned-revision-blocked",
      });
    }

    const serverRevisionId = activeRevision.serverRevisionId;
    if (IN_FLIGHT_SERVER_REVISION_IDS.has(serverRevisionId)) {
      return respond({
        request,
        blocker: "selected-project-shell-invoke-transport-concurrent-invocation-blocked",
        requestAccepted: true,
        serverOwnedRevisionChecked: true,
        inFlightInvocationBlocked: true,
      });
    }
    if (CONSUMED_SERVER_REVISION_IDS.has(serverRevisionId)) {
      return respond({
        request,
        blocker: "selected-project-shell-invoke-transport-replay-blocked",
        requestAccepted: true,
        serverOwnedRevisionChecked: true,
        invocationConsumed: true,
        replayBlocked: true,
      });
    }

    IN_FLIGHT_SERVER_REVISION_IDS.add(serverRevisionId);
    try {
      let privateEnvelope;
      try {
        privateEnvelope = clonePlain(
          await getProjectEnvelope.call(savedProjects, selectedProjectId),
        );
      } catch {
        return respond({
          request,
          blocker: "selected-project-shell-invoke-transport-selected-envelope-read-failed",
          requestAccepted: true,
          serverOwnedRevisionChecked: true,
        });
      }
      if (!isPlainObject(privateEnvelope)) {
        return respond({
          request,
          blocker: "selected-project-shell-invoke-transport-selected-envelope-missing",
          requestAccepted: true,
          serverOwnedRevisionChecked: true,
        });
      }
      const initialEnvelopeFingerprint = privateEnvelopeFingerprint(privateEnvelope);

      let readinessSummary;
      try {
        readinessSummary = buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
          privateEnvelope,
          selectedProjectId,
        );
      } catch {
        return respond({
          request,
          blocker: "selected-project-shell-invoke-transport-readiness-reconstruction-failed",
          requestAccepted: true,
          serverOwnedRevisionChecked: true,
        });
      }

      let sourceBoundary;
      try {
        sourceBoundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
          context: {
            projectBrowser: {
              selectedProjectId,
              selectedProjectEngineRunReadinessReadbackSummary: readinessSummary,
            },
          },
          services: {
            savedProjects: {
              getProjectEnvelope(requestedProjectId) {
                if (requestedProjectId !== selectedProjectId) return null;
                return clonePlain(privateEnvelope);
              },
            },
          },
        });
      } catch {
        return respond({
          request,
          blocker: "selected-project-shell-invoke-transport-source-boundary-reconstruction-failed",
          requestAccepted: true,
          serverOwnedRevisionChecked: true,
        });
      }

      if (sourceBoundary?.ready !== true) {
        return respond({
          request,
          blocker: safeToken(
            sourceBoundary?.blocker,
            "selected-project-shell-invoke-transport-source-boundary-not-ready",
          ),
          requestAccepted: true,
          serverOwnedRevisionChecked: true,
          sourceBoundaryReconstructedServerSide: true,
        });
      }

      const verifyCurrentEnvelopeRevision = async () => {
        try {
          const currentRevision = clonePlain(
            await getActiveRevision.call(savedProjects, selectedProjectId),
          );
          const currentRevisionBlocker = validateActiveRevision(
            currentRevision,
            selectedProjectId,
          );
          if (currentRevisionBlocker
            || currentRevision.serverRevisionId !== activeRevision.serverRevisionId
            || currentRevision.serverEnvelopeId !== activeRevision.serverEnvelopeId
            || currentRevision.localRevisionId !== activeRevision.localRevisionId) {
            return "selected-project-readonly-invoke-stale-server-owned-revision-blocked";
          }
          const currentEnvelope = clonePlain(
            await getProjectEnvelope.call(savedProjects, selectedProjectId),
          );
          if (!isPlainObject(currentEnvelope)
            || privateEnvelopeFingerprint(currentEnvelope) !== initialEnvelopeFingerprint) {
            return "selected-project-readonly-invoke-stale-server-owned-revision-blocked";
          }
          return null;
        } catch {
          return "selected-project-readonly-invoke-stale-server-owned-revision-blocked";
        }
      };

      const guardedAdapter = createServerOwnedRevisionGuardedAdapter({
        adapter: hostLocalReadonlySeamAdapter,
        verifyCurrentEnvelopeRevision,
      });
      const invokeReadonlyCapability =
        createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
          hostLocalReadonlySeamAdapter: guardedAdapter,
        });

      let capabilityResult;
      try {
        capabilityResult = await invokeReadonlyCapability(sourceBoundary);
      } catch {
        return respond({
          request,
          blocker: "selected-project-shell-invoke-transport-capability-threw",
          requestAccepted: true,
          serverOwnedRevisionChecked: true,
          sourceBoundaryReconstructedServerSide: true,
          sourceBoundaryReady: true,
        });
      }

      const outcome = capabilityResult?.outcomeDescriptor;
      if (outcome?.invocationConsumed === true) {
        CONSUMED_SERVER_REVISION_IDS.add(serverRevisionId);
      }
      const capabilityInvoked = outcome?.adapterInvoked === true;
      const capabilityCompleted = outcome?.state
          === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed
        && outcome?.ok === true;
      const state = capabilityCompleted
        ? RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.completed
        : outcome?.state
            === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.unavailable
          ? RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES.unavailable
          : RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_TRANSPORT_STATES
            .blockedFailClosed;

      return respond({
        request,
        state,
        blocker: capabilityCompleted
          ? null
          : safeToken(
            outcome?.blocker,
            "selected-project-shell-invoke-transport-capability-blocked",
          ),
        requestAccepted: true,
        serverOwnedRevisionChecked: true,
        invocationConsumed: outcome?.invocationConsumed === true,
        replayBlocked: outcome?.replayBlocked === true,
        staleServerRevisionBlocked: outcome?.staleServerRevisionBlocked === true,
        secondServerOwnedEnvelopeRevisionCheckPassed:
          outcome?.secondServerOwnedEnvelopeRevisionCheckPassed === true,
        sourceBoundaryReconstructedServerSide: true,
        sourceBoundaryReady: true,
        capabilityInvoked,
        capabilityCompleted,
        safety: outcome,
      });
    } finally {
      IN_FLIGHT_SERVER_REVISION_IDS.delete(serverRevisionId);
    }
  };
}
