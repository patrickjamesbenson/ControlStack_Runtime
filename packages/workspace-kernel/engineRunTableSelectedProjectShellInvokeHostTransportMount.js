import {
  RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
} from "./engineRunTableSelectedProjectReadonlyInvokeCapability.js";
import {
  createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary,
} from "./engineRunTableSelectedProjectShellInvokeTransportBoundary.js";

export const RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_MOUNT_ID =
  "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-SHELL-INVOKE-HOST-TRANSPORT-MOUNT-1";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH =
  "/api/workspace-shell/selected-project-engine-readonly-invoke";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD =
  "POST";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.selected-project-host-seam-bridge.v1";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_VERSION = 1;

const HOST_LOCAL_READONLY_SEAM = "engine-runtable-internal-readonly-invoke";
const HOST_LOCAL_READONLY_SEAM_VERSION = "engine_runtable_internal_readonly_invoke.v1";
const HOST_ADAPTER_REQUEST_FIELD_ORDER = Object.freeze([
  "seam",
  "selectorPayload",
  "execute",
  "candidatePayloadReturned",
  "callerSuppliedDbAllowed",
  "publicRouteAdded",
  "postEndpointAdded",
  "filesystemWriteGuardRequired",
  "bytecodeWritingDisabled",
]);
const HOST_SEAM_BRIDGE_REQUEST_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "selectorPayload",
  "execute",
  "filesystemWriteGuardRequired",
  "bytecodeWritingDisabled",
]);
const FORBIDDEN_CALLER_KEY_PATTERN =
  /^(?:db|database|databasePath|dbPath|filePath|sourcePath|privatePath|runtimeData|projectEnvelope|engineOptions|options)$/i;
const PRIVATE_PATH_VALUE_PATTERN =
  /(?:^[A-Za-z]:[\\/]|^\\\\|^[\\/]Users[\\/]|^[\\/]home[\\/]|^[\\/]mnt[\\/]|^file:)/i;

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

function clonePlain(value, depth = 0) {
  if (depth > 30) throw new Error("selected-project-host-transport-value-depth-invalid");
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((item) => clonePlain(item, depth + 1));
  if (!isPlainObject(value)) {
    throw new Error("selected-project-host-transport-value-non-plain");
  }
  return Object.fromEntries(
    Object.entries(value).map(([key, nested]) => [key, clonePlain(nested, depth + 1)]),
  );
}

function deepFreeze(value, seen = new Set()) {
  if (value === null || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const nested of Object.values(value)) deepFreeze(nested, seen);
  return Object.freeze(value);
}

function findForbiddenCallerValue(value, depth = 0, seen = new Set()) {
  if (depth > 30) return "selected-project-host-transport-candidate-depth-invalid";
  if (typeof value === "string") {
    return PRIVATE_PATH_VALUE_PATTERN.test(value)
      ? "selected-project-host-transport-private-path-refused"
      : null;
  }
  if (value === null || value === undefined || typeof value !== "object") return null;
  if (seen.has(value)) return "selected-project-host-transport-cyclic-value-refused";
  seen.add(value);
  if (Array.isArray(value)) {
    for (const nested of value) {
      const blocker = findForbiddenCallerValue(nested, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return "selected-project-host-transport-non-plain-value-refused";
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_CALLER_KEY_PATTERN.test(key)) {
      return `selected-project-host-transport-forbidden-key-${key}`;
    }
    const blocker = findForbiddenCallerValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function validateHostAdapterRequest(request) {
  if (!Object.isFrozen(request)
    || !hasExactKeys(request, HOST_ADAPTER_REQUEST_FIELD_ORDER)) {
    return "selected-project-host-transport-adapter-request-shape-invalid";
  }
  if (request.seam !== HOST_LOCAL_READONLY_SEAM
    || request.execute !== true
    || request.candidatePayloadReturned !== false
    || request.callerSuppliedDbAllowed !== false
    || request.publicRouteAdded !== false
    || request.postEndpointAdded !== false
    || request.filesystemWriteGuardRequired !== true
    || request.bytecodeWritingDisabled !== true
    || !isPlainObject(request.selectorPayload)) {
    return "selected-project-host-transport-adapter-request-contract-invalid";
  }
  return findForbiddenCallerValue(request.selectorPayload);
}

function buildHostBridgeRequest(selectorPayload) {
  return deepFreeze(Object.fromEntries(
    HOST_SEAM_BRIDGE_REQUEST_FIELD_ORDER.map((key) => [key, {
      schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_ID,
      schemaVersion: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_HOST_SEAM_BRIDGE_SCHEMA_VERSION,
      selectorPayload: clonePlain(selectorPayload),
      execute: true,
      filesystemWriteGuardRequired: true,
      bytecodeWritingDisabled: true,
    }[key]]),
  ));
}

export function createRuntimeEngineRunTableSelectedProjectHostLocalReadonlySeamAdapter({
  invokeHostLocalReadonlySeam = null,
} = {}) {
  return Object.freeze({
    contractId: RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
    seam: HOST_LOCAL_READONLY_SEAM,
    seamVersion: HOST_LOCAL_READONLY_SEAM_VERSION,
    hostLocal: true,
    readOnly: true,
    realHostLocalSeam: true,
    fixtureAdapter: false,
    filesystemWriteGuardRequired: true,
    bytecodeWritingDisabled: true,
    async invoke(request) {
      const blocker = validateHostAdapterRequest(request);
      if (blocker) throw new Error(blocker);
      if (typeof invokeHostLocalReadonlySeam !== "function") {
        throw new Error("selected-project-host-transport-host-seam-unavailable");
      }
      return invokeHostLocalReadonlySeam(buildHostBridgeRequest(request.selectorPayload));
    },
  });
}

export function createRuntimeEngineRunTableSelectedProjectShellInvokeHostTransportMount({
  savedProjects = null,
  invokeHostLocalReadonlySeam = null,
} = {}) {
  const hostLocalReadonlySeamAdapter =
    createRuntimeEngineRunTableSelectedProjectHostLocalReadonlySeamAdapter({
      invokeHostLocalReadonlySeam,
    });
  const invokeTransport =
    createRuntimeEngineRunTableSelectedProjectShellInvokeTransportBoundary({
      savedProjects,
      hostLocalReadonlySeamAdapter,
      hostTransportMounted: true,
    });

  return Object.freeze({
    contractId:
      RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_MOUNT_ID,
    path: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_PATH,
    method: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_SHELL_INVOKE_HOST_TRANSPORT_METHOD,
    serverSide: true,
    hostLocal: true,
    readOnly: true,
    selectedProjectOnly: true,
    redactedOutcomeOnly: true,
    filesystemWriteGuardRequired: true,
    bytecodeWritingDisabled: true,
    shellMounted: false,
    routesAdded: true,
    postEndpointsAdded: true,
    candidatePayloadAcceptedFromCaller: false,
    filePathAcceptedFromCaller: false,
    databaseAcceptedFromCaller: false,
    sourcePathAcceptedFromCaller: false,
    projectEnvelopeAcceptedFromCaller: false,
    engineOptionsAcceptedFromCaller: false,
    invoke(request) {
      return invokeTransport(request);
    },
  });
}
