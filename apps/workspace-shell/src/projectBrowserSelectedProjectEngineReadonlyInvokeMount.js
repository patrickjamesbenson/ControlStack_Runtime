import {
  createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability,
  RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID,
  RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_VERSION,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES,
} from "../../../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js";
import {
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES,
  resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary,
} from "../../../packages/workspace-kernel/projectBrowserSelectedProjectEngineRunActionSourceBoundary.js";
import { stableFingerprint } from "../../../packages/workspace-kernel/stableFingerprint.js";

export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-READONLY-ENGINE-INVOKE-MOUNT-1";
export const SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_CONTRACT_LOCK_ID =
  "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-READONLY-ENGINE-INVOKE-MOUNT-CONTRACT-LOCK-1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_ID =
  "controlstack.runtime.shell.project-browser.selected-project-readonly-engine-invoke-mount.v1";
export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_VERSION = 1;

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES =
  Object.freeze({
    completed:
      "shell_project_browser_selected_project_readonly_engine_invoke_mount_completed",
    unavailable:
      "shell_project_browser_selected_project_readonly_engine_invoke_mount_unavailable",
    missing:
      "shell_project_browser_selected_project_readonly_engine_invoke_mount_missing",
    blockedFailClosed:
      "shell_project_browser_selected_project_readonly_engine_invoke_mount_blocked_fail_closed",
  });

export const SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_FIELD_ORDER =
  Object.freeze([
    "schemaId",
    "schemaVersion",
    "contractId",
    "owner",
    "surfaceId",
    "state",
    "readiness",
    "ok",
    "failClosed",
    "blocker",
    "selectedProjectId",
    "projectId",
    "envelopeId",
    "mounted",
    "serviceMounted",
    "sourceBoundaryResolved",
    "sourceBoundaryReady",
    "runtimeResultReceived",
    "runtimeOutcomeState",
    "runtimeOutcomeReadiness",
    "adapterMounted",
    "adapterInvoked",
    "invocationConsumed",
    "step1Ready",
    "step2ProjectionReady",
    "step3AuthorityResultAvailable",
    "step3AuthorityReady",
    "readOnly",
    "selectedProjectOnly",
    "scalarSafe",
    "redactedOutcomeOnly",
    "engineActionAvailable",
    "engineActionEnabled",
    "userGestureListenerAdded",
    "preparedActionRetained",
    "candidatePayloadReturned",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "projectEnvelopeReturned",
    "runRowsReturned",
    "exactElectricalValuesReturned",
    "fingerprintsReturned",
    "selectedResultPersisted",
    "runTableGenerated",
    "outputGenerated",
    "iesGenerated",
    "runtimeDataMutated",
    "routesAdded",
    "postEndpointsAdded",
    "fetchUsed",
    "directMcpCallUsed",
    "filesystemWriteAttempted",
  ]);

const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;
const RUNTIME_OUTCOME_FINGERPRINT_PREFIX =
  "safe-runtime-engine-runtable-selected-project-readonly-invoke-outcome";

const REQUIRED_OUTCOME_FALSE_FLAGS = Object.freeze([
  "candidatePayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "selectedResultPersisted",
  "runTableWritten",
  "runTableGenerated",
  "outputGenerated",
  "iesGenerated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
  "routesAdded",
  "postEndpointsAdded",
  "fixtureFallbackUsed",
]);

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function isSafeScalar(value) {
  return value === null
    || typeof value === "boolean"
    || (typeof value === "number" && Number.isSafeInteger(value))
    || (typeof value === "string" && !PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value));
}

function safeToken(value, fallback = null) {
  if (typeof value !== "string") return fallback;
  const token = value.trim();
  if (!token
    || PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(token)
    || !SAFE_TOKEN_PATTERN.test(token)) return fallback;
  return token;
}

function hasExactKeys(value, expectedKeys) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length === expectedKeys.length
    && expectedKeys.every((key, index) => keys[index] === key);
}

function orderedMountStatus(fields) {
  return Object.freeze(Object.fromEntries(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  ));
}

function mountStatus({
  state = SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
    .unavailable,
  blocker = "selected-project-readonly-engine-mount-host-local-adapter-unavailable",
  selectedProjectId = null,
  projectId = null,
  envelopeId = null,
  serviceMounted = true,
  sourceBoundaryResolved = false,
  sourceBoundaryReady = false,
  runtimeResultReceived = false,
  runtimeOutcomeState = null,
  runtimeOutcomeReadiness = null,
  adapterMounted = false,
  adapterInvoked = false,
  invocationConsumed = false,
  step1Ready = false,
  step2ProjectionReady = false,
  step3AuthorityResultAvailable = false,
  step3AuthorityReady = false,
} = {}) {
  const completed = state
    === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.completed;
  const readiness = completed
    ? "completed"
    : state
      === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
        .unavailable
      ? "unavailable"
      : state
        === SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
          .missing
        ? "missing"
        : "blocked_fail_closed";

  return orderedMountStatus({
    schemaId:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_ID,
    schemaVersion:
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_VERSION,
    contractId: SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_ID,
    owner: "shell",
    surfaceId: "selected-project-readonly-engine-invoke-mount",
    state,
    readiness,
    ok: completed,
    failClosed: !completed,
    blocker: completed
      ? null
      : safeToken(blocker, "selected-project-readonly-engine-mount-blocked"),
    selectedProjectId: safeToken(selectedProjectId),
    projectId: safeToken(projectId),
    envelopeId: safeToken(envelopeId),
    mounted: true,
    serviceMounted: serviceMounted === true,
    sourceBoundaryResolved: sourceBoundaryResolved === true,
    sourceBoundaryReady: sourceBoundaryReady === true,
    runtimeResultReceived: runtimeResultReceived === true,
    runtimeOutcomeState: safeToken(runtimeOutcomeState),
    runtimeOutcomeReadiness: safeToken(runtimeOutcomeReadiness),
    adapterMounted: adapterMounted === true,
    adapterInvoked: adapterInvoked === true,
    invocationConsumed: invocationConsumed === true,
    step1Ready: step1Ready === true,
    step2ProjectionReady: step2ProjectionReady === true,
    step3AuthorityResultAvailable: step3AuthorityResultAvailable === true,
    step3AuthorityReady: step3AuthorityReady === true,
    readOnly: true,
    selectedProjectOnly: true,
    scalarSafe: true,
    redactedOutcomeOnly: true,
    engineActionAvailable: false,
    engineActionEnabled: false,
    userGestureListenerAdded: false,
    preparedActionRetained: false,
    candidatePayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    projectEnvelopeReturned: false,
    runRowsReturned: false,
    exactElectricalValuesReturned: false,
    fingerprintsReturned: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    outputGenerated: false,
    iesGenerated: false,
    runtimeDataMutated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    fetchUsed: false,
    directMcpCallUsed: false,
    filesystemWriteAttempted: false,
  });
}

function validateRuntimeResult(runtimeResult, sourceBoundary) {
  if (!isPlainObject(runtimeResult)
    || !Object.isFrozen(runtimeResult)
    || !hasExactKeys(
      runtimeResult,
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER,
    )) {
    return "selected-project-readonly-engine-mount-runtime-result-invalid";
  }

  const outcome = runtimeResult.outcomeDescriptor;
  if (!isPlainObject(outcome)
    || !Object.isFrozen(outcome)
    || !hasExactKeys(
      outcome,
      RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER,
    )
    || !Object.values(outcome).every(isSafeScalar)) {
    return "selected-project-readonly-engine-mount-runtime-outcome-invalid";
  }
  if (outcome.schemaId !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_ID
    || outcome.schemaVersion
      !== RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_VERSION
    || outcome.contractId
      !== RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID) {
    return "selected-project-readonly-engine-mount-runtime-outcome-schema-mismatch";
  }
  if (outcome.readOnly !== true || outcome.selectedProjectOnly !== true) {
    return "selected-project-readonly-engine-mount-runtime-safety-flags-invalid";
  }
  for (const key of REQUIRED_OUTCOME_FALSE_FLAGS) {
    if (outcome[key] !== false) {
      return `selected-project-readonly-engine-mount-runtime-required-flag-not-false-${key}`;
    }
  }

  const allowedStates = Object.values(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES,
  );
  if (!allowedStates.includes(outcome.state)) {
    return "selected-project-readonly-engine-mount-runtime-state-invalid";
  }
  if (safeToken(outcome.selectedProjectId) !== safeToken(sourceBoundary?.selectedProjectId)
    || safeToken(outcome.projectId) !== safeToken(sourceBoundary?.projectId)
    || safeToken(outcome.envelopeId) !== safeToken(sourceBoundary?.envelopeId)) {
    return "selected-project-readonly-engine-mount-runtime-identity-mismatch";
  }
  if (safeToken(outcome.sourceBoundaryContractId)
      !== safeToken(sourceBoundary?.contractId)
    || safeToken(outcome.sourceBoundaryFingerprint)
      !== safeToken(sourceBoundary?.sourceBoundaryFingerprint)
    || safeToken(outcome.candidateFingerprint)
      !== safeToken(sourceBoundary?.candidateFingerprint)) {
    return "selected-project-readonly-engine-mount-runtime-source-boundary-mismatch";
  }
  if (outcome.adapterMounted === true
    ? outcome.adapterContractId
      !== RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID
    : outcome.adapterContractId !== null) {
    return "selected-project-readonly-engine-mount-runtime-adapter-contract-invalid";
  }
  if ((outcome.adapterInvoked === true && outcome.adapterMounted !== true)
    || (outcome.invocationConsumed === true && outcome.adapterInvoked !== true)
    || (outcome.privateCandidateConsumed === true && outcome.invocationConsumed !== true)
    || (outcome.step2ProjectionReady === true && outcome.step1Ready !== true)) {
    return "selected-project-readonly-engine-mount-runtime-lifecycle-invalid";
  }

  const outcomeFingerprintSource = Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER
      .filter((key) => key !== "outcomeFingerprint")
      .map((key) => [key, outcome[key]]),
  );
  if (outcome.outcomeFingerprint !== stableFingerprint(
    RUNTIME_OUTCOME_FINGERPRINT_PREFIX,
    outcomeFingerprintSource,
  )) {
    return "selected-project-readonly-engine-mount-runtime-outcome-fingerprint-mismatch";
  }

  const completed = outcome.state
    === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed;
  const unavailable = outcome.state
    === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.unavailable;
  const expectedReadiness = completed
    ? "completed"
    : unavailable
      ? "unavailable"
      : "blocked_fail_closed";
  if (outcome.readiness !== expectedReadiness) {
    return "selected-project-readonly-engine-mount-runtime-readiness-invalid";
  }
  if (completed && (outcome.ok !== true
    || outcome.failClosed !== false
    || outcome.blocker !== null
    || outcome.adapterMounted !== true
    || outcome.adapterInvoked !== true
    || outcome.invocationConsumed !== true
    || outcome.privateCandidateConsumed !== true
    || outcome.concurrentInvocationBlocked !== false
    || outcome.replayBlocked !== false
    || outcome.step1Ready !== true
    || outcome.step2ProjectionReady !== true)) {
    return "selected-project-readonly-engine-mount-runtime-completed-contract-invalid";
  }
  if (!completed && (outcome.ok !== false
    || outcome.failClosed !== true
    || safeToken(outcome.blocker) === null)) {
    return "selected-project-readonly-engine-mount-runtime-blocked-contract-invalid";
  }
  if (unavailable && (outcome.adapterMounted !== false
    || outcome.adapterInvoked !== false
    || outcome.invocationConsumed !== false
    || outcome.privateCandidateConsumed !== false
    || outcome.concurrentInvocationBlocked !== false
    || outcome.replayBlocked !== false)) {
    return "selected-project-readonly-engine-mount-runtime-unavailable-contract-invalid";
  }
  return null;
}

function projectRuntimeOutcome(runtimeResult, sourceBoundary) {
  const outcome = runtimeResult.outcomeDescriptor;
  const state = outcome.state
    === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed
    ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.completed
    : outcome.state
      === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.unavailable
      ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.unavailable
      : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
        .blockedFailClosed;

  return mountStatus({
    state,
    blocker: outcome.blocker,
    selectedProjectId: sourceBoundary.selectedProjectId,
    projectId: sourceBoundary.projectId,
    envelopeId: sourceBoundary.envelopeId,
    serviceMounted: true,
    sourceBoundaryResolved: true,
    sourceBoundaryReady: true,
    runtimeResultReceived: true,
    runtimeOutcomeState: outcome.state,
    runtimeOutcomeReadiness: outcome.readiness,
    adapterMounted: outcome.adapterMounted,
    adapterInvoked: outcome.adapterInvoked,
    invocationConsumed: outcome.invocationConsumed,
    step1Ready: outcome.step1Ready,
    step2ProjectionReady: outcome.step2ProjectionReady,
    step3AuthorityResultAvailable: outcome.step3AuthorityResultAvailable,
    step3AuthorityReady: outcome.step3AuthorityReady,
  });
}

export function createShellProjectBrowserSelectedProjectReadonlyEngineInvokeService({
  hostLocalReadonlySeamAdapter = null,
} = {}) {
  return createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
    hostLocalReadonlySeamAdapter,
  });
}

export async function prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount({
  context = {},
  services = {},
} = {}) {
  const serviceMounted = typeof services?.invokeSelectedProjectReadonlyEngine === "function";
  if (!serviceMounted) {
    return mountStatus({
      state:
        SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.unavailable,
      blocker: "selected-project-readonly-engine-mount-service-unavailable",
      selectedProjectId: context?.projectBrowser?.selectedProjectId,
      serviceMounted: false,
    });
  }

  let sourceBoundary;
  try {
    sourceBoundary =
      await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
        context,
        services,
      });
  } catch {
    return mountStatus({
      state:
        SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
          .blockedFailClosed,
      blocker: "selected-project-readonly-engine-mount-source-boundary-threw",
      selectedProjectId: context?.projectBrowser?.selectedProjectId,
      serviceMounted: true,
    });
  }

  if (sourceBoundary?.ready !== true) {
    return mountStatus({
      state: sourceBoundary?.state
          === PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.missing
        ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.missing
        : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
          .blockedFailClosed,
      blocker: sourceBoundary?.blocker
        || "selected-project-readonly-engine-mount-source-boundary-not-ready",
      selectedProjectId: sourceBoundary?.selectedProjectId
        || context?.projectBrowser?.selectedProjectId,
      projectId: sourceBoundary?.projectId,
      envelopeId: sourceBoundary?.envelopeId,
      serviceMounted: true,
      sourceBoundaryResolved: true,
      sourceBoundaryReady: false,
    });
  }

  let runtimeResult;
  try {
    runtimeResult = await services.invokeSelectedProjectReadonlyEngine(sourceBoundary);
  } catch {
    return mountStatus({
      state:
        SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
          .blockedFailClosed,
      blocker: "selected-project-readonly-engine-mount-service-threw",
      selectedProjectId: sourceBoundary.selectedProjectId,
      projectId: sourceBoundary.projectId,
      envelopeId: sourceBoundary.envelopeId,
      serviceMounted: true,
      sourceBoundaryResolved: true,
      sourceBoundaryReady: true,
    });
  }

  const runtimeBlocker = validateRuntimeResult(runtimeResult, sourceBoundary);
  if (runtimeBlocker) {
    return mountStatus({
      state:
        SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
          .blockedFailClosed,
      blocker: runtimeBlocker,
      selectedProjectId: sourceBoundary.selectedProjectId,
      projectId: sourceBoundary.projectId,
      envelopeId: sourceBoundary.envelopeId,
      serviceMounted: true,
      sourceBoundaryResolved: true,
      sourceBoundaryReady: true,
    });
  }

  return projectRuntimeOutcome(runtimeResult, sourceBoundary);
}

export const mountShellProjectBrowserSelectedProjectReadonlyEngineInvoke =
  prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount;

export function createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount({
  invokeSelectedProjectReadonlyEngineClientTransport = null,
} = {}) {
  const clientTransportMounted =
    typeof invokeSelectedProjectReadonlyEngineClientTransport === "function";
  const snapshot = mountStatus({
    state: clientTransportMounted
      ? SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES
        .blockedFailClosed
      : SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES.unavailable,
    blocker: clientTransportMounted
      ? "selected-project-readonly-engine-mount-awaiting-user-gesture"
      : "selected-project-readonly-engine-mount-client-transport-unavailable",
    serviceMounted: clientTransportMounted,
  });

  return Object.freeze({
    clientTransportMounted,
    invokeSelectedProjectReadonlyEngine: clientTransportMounted
      ? invokeSelectedProjectReadonlyEngineClientTransport
      : null,
    getSnapshot() {
      return snapshot;
    },
  });
}

function mountSelectionKey(context) {
  const browser = isPlainObject(context?.projectBrowser) ? context.projectBrowser : {};
  const summary = isPlainObject(browser.selectedProjectEngineRunReadinessReadbackSummary)
    ? browser.selectedProjectEngineRunReadinessReadbackSummary
    : {};
  return [
    safeToken(browser.selectedProjectId, "none"),
    safeToken(
      summary.projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint,
      "none",
    ),
    safeToken(summary.state, "none"),
  ].join("|");
}

export function createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount({
  hostLocalReadonlySeamAdapter = null,
  invokeSelectedProjectReadonlyEngine = null,
} = {}) {
  const invokeService = typeof invokeSelectedProjectReadonlyEngine === "function"
    ? invokeSelectedProjectReadonlyEngine
    : createShellProjectBrowserSelectedProjectReadonlyEngineInvokeService({
      hostLocalReadonlySeamAdapter,
    });
  let snapshot = mountStatus();
  let activeKey = null;
  let activeService = null;
  let activePromise = null;
  let generation = 0;

  return Object.freeze({
    invokeSelectedProjectReadonlyEngine: invokeService,
    getSnapshot() {
      return snapshot;
    },
    mount({ context = {}, services = {} } = {}) {
      const nextKey = mountSelectionKey(context);
      const nextService = services?.invokeSelectedProjectReadonlyEngine;
      if (nextKey === activeKey && nextService === activeService) {
        return activePromise || Promise.resolve(snapshot);
      }

      activeKey = nextKey;
      activeService = nextService;
      generation += 1;
      const requestGeneration = generation;
      const request = prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount({
        context,
        services,
      });
      activePromise = request.then((nextSnapshot) => {
        if (requestGeneration === generation) snapshot = nextSnapshot;
        return nextSnapshot;
      }).finally(() => {
        if (requestGeneration === generation) activePromise = null;
      });
      return activePromise;
    },
  });
}
