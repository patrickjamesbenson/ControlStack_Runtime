import {
  getProjectBrowserSelectedProjectEngineRunActionInternalCandidate,
  PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES,
} from "./projectBrowserSelectedProjectEngineRunActionSourceBoundary.js";
import {
  buildSelectorReadonlyEngineStep1SafeSummary,
  buildSelectorReadonlyEngineStep2SelectedResultProjection,
  buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard,
} from "./selectorReadonlyEngineCandidateMapper.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID =
  "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-READONLY-INVOKE-CAPABILITY-1";
export const RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_LIFECYCLE_LOCK_ID =
  "RUNTIME-ENGINE-RUNTABLE-FIRST-SELECTED-PROJECT-READONLY-INVOKE-LIFECYCLE-LOCK-1";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.selected-project-readonly-invoke-capability.v1";
export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_VERSION = 1;
export const RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID =
  "controlstack.runtime.engine-runtable.host-local-readonly-seam-adapter.v1";

export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES = Object.freeze({
  completed: "runtime_engine_runtable_selected_project_readonly_invoke_completed",
  unavailable: "runtime_engine_runtable_selected_project_readonly_invoke_unavailable",
  blockedFailClosed: "runtime_engine_runtable_selected_project_readonly_invoke_blocked_fail_closed",
});

export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER =
  Object.freeze([
    "readonlyEngineStep1SafeSummary",
    "readonlyEngineStep2SelectedResultProjection",
    "readonlyEngineStep3AuthorityResult",
    "outcomeDescriptor",
  ]);

export const RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER =
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
    "projectId",
    "envelopeId",
    "sourceBoundaryContractId",
    "sourceBoundaryFingerprint",
    "candidateFingerprint",
    "adapterContractId",
    "adapterMounted",
    "adapterInvoked",
    "invocationConsumed",
    "concurrentInvocationBlocked",
    "replayBlocked",
    "step1Ready",
    "step2ProjectionReady",
    "step3AuthorityResultAvailable",
    "step3AuthorityReady",
    "readOnly",
    "selectedProjectOnly",
    "privateCandidateConsumed",
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
    "outcomeFingerprint",
  ]);

const SOURCE_BOUNDARY_FINGERPRINT_PREFIX =
  "safe-project-browser-selected-project-engine-run-action-source-boundary";
const OUTCOME_FINGERPRINT_PREFIX =
  "safe-runtime-engine-runtable-selected-project-readonly-invoke-outcome";
const HOST_LOCAL_READONLY_SEAM = "engine-runtable-internal-readonly-invoke";
const HOST_LOCAL_READONLY_SEAM_VERSION = "engine_runtable_internal_readonly_invoke.v1";
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const SOURCE_BOUNDARY_FINGERPRINT_PATTERN =
  /^safe-project-browser-selected-project-engine-run-action-source-boundary:[0-9a-f]{40}$/;
const CANDIDATE_FINGERPRINT_PATTERN =
  /^safe-selector-readonly-engine-candidate:[0-9a-f]{40}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|blob:|https?:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bIESNA:LM-63\b|\.ies(?:$|[\s?#]))/i;

const REQUIRED_SEAM_FALSE_FLAGS = Object.freeze([
  "public_route_added",
  "post_endpoint_added",
  "caller_supplied_file_path_allowed",
  "caller_supplied_db_allowed",
  "donor_bridge_used",
  "donor_bridge_audit_jsonl_write_enabled",
  "audit_jsonl_write_attempted",
  "write_attempted",
  "runtime_data_mutation_enabled",
  "donor_data_mutation_enabled",
  "selected_result_persistence_enabled",
  "selected_result_created",
  "synthetic_success_fixture_created",
  "product_data_invented",
  "raw_rows_exposed",
  "raw_headers_exposed",
  "raw_users_exposed",
  "raw_snapshot_returned",
  "raw_snapshot_serialized",
  "raw_engine_payload_exposed",
  "raw_engine_debug_payload_exposed",
  "raw_rough_electrical_payload_exposed",
  "raw_ies_exposed",
  "raw_candela_exposed",
  "raw_lab_evidence_exposed",
  "raw_pdfs_exposed",
  "base64_artifacts_exposed",
  "credentials_exposed",
  "provider_ids_exposed",
  "private_paths_exposed",
  "source_path_returned",
]);

const UNSAFE_TRUE_KEY_PATTERN = /(?:write|written|mutation|mutated|persist|generated|generation_enabled|generation_attempted|output_created|output_returned|raw_.+(?:returned|exposed)|private_.+(?:returned|exposed)|credentials?_.+(?:returned|exposed)|routes?_added|post_endpoints?_added|fixture_(?:used|fallback)|synthetic_success)/i;
const FORBIDDEN_CANDIDATE_KEY_PATTERN = /^(?:db|database|selectedResultSummary|runTableFirstNarrowOutputSummary|readinessSummary|projectEnvelope|fixture|fixturePayload|runtimeData|filePath|sourcePath|privatePath)$/i;

const IN_FLIGHT_BOUNDARIES = new WeakSet();
const CONSUMED_BOUNDARIES = new WeakSet();

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

function positiveInteger(value) {
  return Number.isSafeInteger(value) && value > 0 ? value : null;
}

function clonePlain(value, depth = 0) {
  if (depth > 30) throw new Error("selected-project-readonly-invoke-candidate-depth-invalid");
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return value;
  if (Array.isArray(value)) return value.map((item) => clonePlain(item, depth + 1));
  if (!isPlainObject(value)) {
    throw new Error("selected-project-readonly-invoke-candidate-non-plain-value");
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

function unsafeNestedValue(value, depth = 0, seen = new Set()) {
  if (depth > 30) return "nested-value-depth-invalid";
  if (typeof value === "string") {
    return PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value) ? "private-or-output-value-returned" : null;
  }
  if (value === null || value === undefined || typeof value !== "object") return null;
  if (seen.has(value)) return "cyclic-value-returned";
  seen.add(value);
  if (Array.isArray(value)) {
    for (const nested of value) {
      const blocker = unsafeNestedValue(nested, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return "non-plain-value-returned";
  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_TRUE_KEY_PATTERN.test(key) && nested === true) {
      return `unsafe-seam-result-flag-${safeToken(key, "unknown")}`;
    }
    const blocker = unsafeNestedValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function boundaryFingerprintSource(boundary) {
  return Object.fromEntries(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER
      .filter((key) => key !== "sourceBoundaryFingerprint")
      .map((key) => [key, boundary[key]]),
  );
}

function validateSourceBoundary(boundary) {
  if (!isPlainObject(boundary)
    || !Object.isFrozen(boundary)
    || !hasExactKeys(
      boundary,
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER,
    )) {
    return "selected-project-readonly-invoke-source-boundary-invalid";
  }
  if (boundary.schemaId
      !== PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID
    || boundary.schemaVersion
      !== PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION
    || boundary.contractId
      !== PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID) {
    return "selected-project-readonly-invoke-source-boundary-schema-mismatch";
  }
  if (boundary.state
      !== PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready
    || boundary.readiness !== "ready"
    || boundary.ready !== true
    || boundary.failClosed !== false
    || boundary.blocker !== null
    || boundary.candidateRetainedInternally !== true
    || boundary.candidatePayloadReturned !== false
    || boundary.projectEnvelopeReturned !== false
    || boundary.selectedProjectOnly !== true
    || boundary.runtimeSavedEnvelopeOnly !== true
    || boundary.exactSelectedProjectIdentity !== true
    || boundary.readOnly !== true
    || boundary.fixtureFallbackUsed !== false
    || boundary.selectedResultPayloadUsed !== false
    || boundary.engineInvocationEnabled !== false
    || boundary.engineExecutionAttempted !== false
    || boundary.persistenceMutated !== false
    || boundary.runtimeDataMutated !== false
    || boundary.routesAdded !== false
    || boundary.postEndpointsAdded !== false
    || boundary.filesystemWriteAttempted !== false) {
    return "selected-project-readonly-invoke-source-boundary-not-ready";
  }
  if (!safeToken(boundary.selectedProjectId)
    || !safeToken(boundary.projectId)
    || !safeToken(boundary.envelopeId)
    || !CANDIDATE_FINGERPRINT_PATTERN.test(String(boundary.candidateFingerprint || ""))) {
    return "selected-project-readonly-invoke-source-boundary-identity-invalid";
  }
  const fingerprint = boundary.sourceBoundaryFingerprint;
  if (!SOURCE_BOUNDARY_FINGERPRINT_PATTERN.test(String(fingerprint || ""))
    || fingerprint !== stableFingerprint(
      SOURCE_BOUNDARY_FINGERPRINT_PREFIX,
      boundaryFingerprintSource(boundary),
    )) {
    return "selected-project-readonly-invoke-source-boundary-fingerprint-mismatch";
  }
  return null;
}

function forbiddenCandidateValue(value, depth = 0, seen = new Set()) {
  if (depth > 30) return "selected-project-readonly-invoke-candidate-depth-invalid";
  if (typeof value === "string") {
    return PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(value)
      ? "selected-project-readonly-invoke-candidate-private-value"
      : null;
  }
  if (value === null || value === undefined || typeof value !== "object") return null;
  if (seen.has(value)) return "selected-project-readonly-invoke-candidate-cyclic";
  seen.add(value);
  if (Array.isArray(value)) {
    for (const nested of value) {
      const blocker = forbiddenCandidateValue(nested, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return "selected-project-readonly-invoke-candidate-non-plain";
  for (const [key, nested] of Object.entries(value)) {
    if (FORBIDDEN_CANDIDATE_KEY_PATTERN.test(key)) {
      return `selected-project-readonly-invoke-candidate-forbidden-key-${safeToken(key, "unknown")}`;
    }
    const blocker = forbiddenCandidateValue(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function validatePrivateCandidate(candidate, boundary) {
  if (!isPlainObject(candidate)) return "selected-project-readonly-invoke-private-candidate-missing";
  const forbidden = forbiddenCandidateValue(candidate);
  if (forbidden) return forbidden;
  if (candidate.host_local_readonly_engine_candidate !== true
    || candidate.selector_stage3_supported_subset !== true
    || !safeToken(candidate.tier)
    || !Array.isArray(candidate.runs)
    || candidate.runs.length !== boundary.candidateRunCount
    || !isPlainObject(candidate.lighting)
    || Object.keys(candidate.lighting).length !== boundary.candidateLightingFieldCount) {
    return "selected-project-readonly-invoke-private-candidate-shape-mismatch";
  }
  let totalQuantity = 0;
  for (const run of candidate.runs) {
    if (!isPlainObject(run)) return "selected-project-readonly-invoke-private-candidate-run-invalid";
    const quantity = positiveInteger(run.qty);
    const runLengthMm = positiveInteger(run.run_length_mm);
    if (!quantity || !runLengthMm) {
      return "selected-project-readonly-invoke-private-candidate-run-invalid";
    }
    totalQuantity += quantity;
  }
  if (totalQuantity !== boundary.candidateTotalQuantity) {
    return "selected-project-readonly-invoke-private-candidate-quantity-mismatch";
  }
  return null;
}

function validateAdapter(adapter) {
  if (!isPlainObject(adapter)) return "selected-project-readonly-invoke-host-local-adapter-unavailable";
  if (adapter.contractId !== RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID
    || adapter.seam !== HOST_LOCAL_READONLY_SEAM
    || adapter.seamVersion !== HOST_LOCAL_READONLY_SEAM_VERSION
    || adapter.hostLocal !== true
    || adapter.readOnly !== true
    || adapter.realHostLocalSeam !== true
    || adapter.fixtureAdapter !== false
    || typeof adapter.invoke !== "function") {
    return "selected-project-readonly-invoke-host-local-adapter-invalid";
  }
  return null;
}

function validateSeamResult(seamResult) {
  if (!isPlainObject(seamResult)) return "selected-project-readonly-invoke-seam-result-invalid";
  if (seamResult.seam !== HOST_LOCAL_READONLY_SEAM
    || seamResult.seam_version !== HOST_LOCAL_READONLY_SEAM_VERSION) {
    return "selected-project-readonly-invoke-seam-result-schema-mismatch";
  }
  for (const key of REQUIRED_SEAM_FALSE_FLAGS) {
    if (seamResult[key] !== false) {
      return `selected-project-readonly-invoke-seam-safety-flag-not-false-${key}`;
    }
  }
  const unsafe = unsafeNestedValue(seamResult);
  if (unsafe) return unsafe;
  if (seamResult.internal_mcp_diagnostic_only !== true
    || seamResult.server_side_only !== true
    || typeof seamResult.ok !== "boolean"
    || typeof seamResult.engine_execution_attempted !== "boolean"
    || typeof seamResult.engine_result_produced !== "boolean") {
    return "selected-project-readonly-invoke-seam-result-contract-invalid";
  }
  if (seamResult.ok === true
    && (seamResult.engine_execution_attempted !== true
      || seamResult.engine_result_produced !== true
      || !isPlainObject(seamResult.safe_engine_summary)
      || seamResult.safe_engine_summary.success !== true)) {
    return "selected-project-readonly-invoke-seam-success-inconsistent";
  }
  return null;
}

function mapperSummaryFromBoundary(boundary, candidate = null) {
  const firstRun = isPlainObject(candidate?.runs?.[0]) ? candidate.runs[0] : null;
  return {
    readonlyEngineCandidateMapperReady: true,
    ready: true,
    blocker: null,
    candidateShapeSummary: {
      runCount: boundary?.candidateRunCount || 0,
      totalQuantity: boundary?.candidateTotalQuantity || 0,
      runLengthBand: firstRun ? `${firstRun.run_length_mm}mm` : "stage3-supported-run-length",
      lightingFieldCount: boundary?.candidateLightingFieldCount || 0,
      readonlyEngineCandidateFingerprint: boundary?.candidateFingerprint || null,
      rawCandidateReturned: false,
      rawSelectorPayloadReturned: false,
      rawEnginePayloadReturned: false,
    },
    fieldStatus: [],
  };
}

function buildResultSummaries({ boundary = null, candidate = null, seamResult = null, blocker = null } = {}) {
  const mapperResult = blocker
    ? {
      summary: {
        readonlyEngineCandidateMapperReady: false,
        ready: false,
        blocker,
      },
    }
    : { summary: mapperSummaryFromBoundary(boundary, candidate) };
  const step1 = buildSelectorReadonlyEngineStep1SafeSummary({ mapperResult, seamResult });
  const step2 = buildSelectorReadonlyEngineStep2SelectedResultProjection({
    readonlyEngineStep1SafeSummary: step1,
  });
  const step3 = buildSelectorReadonlyEngineStep3SelectedResultAuthorityGuard({
    readonlyEngineStep2SelectedResultSummary: step2,
  });
  return {
    step1,
    step2Projection: step2.selectedResultProjection,
    step3AuthorityResult: step3.authorityGuardSummary,
    step2Ready: step2.readonlyEngineStep2Ready === true,
    step3Ready: step3.readonlyEngineStep3Ready === true,
  };
}

function outcomeFields({
  boundary = null,
  state,
  blocker = null,
  adapterMounted = false,
  adapterInvoked = false,
  invocationConsumed = false,
  concurrentInvocationBlocked = false,
  replayBlocked = false,
  privateCandidateConsumed = false,
  summaries,
} = {}) {
  const step1Ready = summaries?.step1?.readonlyEngineStep1Ready === true;
  const step2ProjectionReady = summaries?.step2Ready === true;
  const step3AuthorityResultAvailable = isPlainObject(summaries?.step3AuthorityResult);
  const step3AuthorityReady = summaries?.step3Ready === true;
  const completed = state
    === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed;
  return {
    schemaId: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_ID,
    schemaVersion: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_SCHEMA_VERSION,
    contractId: RUNTIME_ENGINE_RUNTABLE_FIRST_SELECTED_PROJECT_READONLY_INVOKE_CAPABILITY_ID,
    state,
    readiness: completed ? "completed" : state
      === RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.unavailable
      ? "unavailable"
      : "blocked_fail_closed",
    ok: completed && step1Ready && step2ProjectionReady,
    failClosed: !(completed && step1Ready && step2ProjectionReady),
    blocker: completed && step1Ready && step2ProjectionReady
      ? null
      : safeToken(blocker || summaries?.step1?.blocker, "selected-project-readonly-invoke-blocked"),
    selectedProjectId: safeToken(boundary?.selectedProjectId),
    projectId: safeToken(boundary?.projectId),
    envelopeId: safeToken(boundary?.envelopeId),
    sourceBoundaryContractId: safeToken(boundary?.contractId),
    sourceBoundaryFingerprint: safeToken(boundary?.sourceBoundaryFingerprint),
    candidateFingerprint: safeToken(boundary?.candidateFingerprint),
    adapterContractId: adapterMounted
      ? RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID
      : null,
    adapterMounted,
    adapterInvoked,
    invocationConsumed,
    concurrentInvocationBlocked,
    replayBlocked,
    step1Ready,
    step2ProjectionReady,
    step3AuthorityResultAvailable,
    step3AuthorityReady,
    readOnly: true,
    selectedProjectOnly: true,
    privateCandidateConsumed,
    candidatePayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    selectedResultPersisted: false,
    runTableWritten: false,
    runTableGenerated: false,
    outputGenerated: false,
    iesGenerated: false,
    runtimeDataMutated: false,
    filesystemWriteAttempted: false,
    routesAdded: false,
    postEndpointsAdded: false,
    fixtureFallbackUsed: false,
  };
}

function finaliseOutcome(fields) {
  const fingerprintSource = Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER
      .filter((key) => key !== "outcomeFingerprint")
      .map((key) => [key, fields[key]]),
  );
  return Object.freeze(Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER
      .map((key) => [
        key,
        key === "outcomeFingerprint"
          ? stableFingerprint(OUTCOME_FINGERPRINT_PREFIX, fingerprintSource)
          : fields[key],
      ]),
  ));
}

function finaliseCapabilityResult(summaries, outcomeOptions) {
  const outcomeDescriptor = finaliseOutcome(outcomeFields({
    ...outcomeOptions,
    summaries,
  }));
  return deepFreeze(Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER
      .map((key) => [key, {
        readonlyEngineStep1SafeSummary: summaries.step1,
        readonlyEngineStep2SelectedResultProjection: summaries.step2Projection,
        readonlyEngineStep3AuthorityResult: summaries.step3AuthorityResult,
        outcomeDescriptor,
      }[key]]),
  ));
}

function blockedResult({
  boundary = null,
  state = RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.blockedFailClosed,
  blocker,
  adapterMounted = false,
  adapterInvoked = false,
  invocationConsumed = false,
  concurrentInvocationBlocked = false,
  replayBlocked = false,
  privateCandidateConsumed = false,
  preserveMapperReady = false,
} = {}) {
  const summaries = preserveMapperReady
    ? buildResultSummaries({ boundary, seamResult: null })
    : buildResultSummaries({ blocker });
  return finaliseCapabilityResult(summaries, {
    boundary,
    state,
    blocker,
    adapterMounted,
    adapterInvoked,
    invocationConsumed,
    concurrentInvocationBlocked,
    replayBlocked,
    privateCandidateConsumed,
  });
}

export function createRuntimeEngineRunTableSelectedProjectReadonlyInvokeCapability({
  hostLocalReadonlySeamAdapter = null,
} = {}) {
  const adapterBlocker = validateAdapter(hostLocalReadonlySeamAdapter);
  const adapterMounted = adapterBlocker === null;

  return async function invokeSelectedProjectReadonly(sourceBoundary = null) {
    const boundaryBlocker = validateSourceBoundary(sourceBoundary);
    if (boundaryBlocker) {
      return blockedResult({
        boundary: sourceBoundary,
        blocker: boundaryBlocker,
        adapterMounted,
      });
    }

    if (!adapterMounted) {
      return blockedResult({
        boundary: sourceBoundary,
        state: RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.unavailable,
        blocker: adapterBlocker,
        adapterMounted: false,
        preserveMapperReady: true,
      });
    }

    if (IN_FLIGHT_BOUNDARIES.has(sourceBoundary)) {
      return blockedResult({
        boundary: sourceBoundary,
        blocker: "selected-project-readonly-invoke-concurrent-invocation-blocked",
        adapterMounted: true,
        concurrentInvocationBlocked: true,
      });
    }
    if (CONSUMED_BOUNDARIES.has(sourceBoundary)) {
      return blockedResult({
        boundary: sourceBoundary,
        blocker: "selected-project-readonly-invoke-replay-blocked",
        adapterMounted: true,
        replayBlocked: true,
      });
    }

    const candidate = getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(sourceBoundary);
    const candidateBlocker = validatePrivateCandidate(candidate, sourceBoundary);
    if (candidateBlocker) {
      return blockedResult({
        boundary: sourceBoundary,
        blocker: candidateBlocker,
        adapterMounted: true,
      });
    }

    let privateCandidate;
    try {
      privateCandidate = deepFreeze(clonePlain(candidate));
    } catch {
      return blockedResult({
        boundary: sourceBoundary,
        blocker: "selected-project-readonly-invoke-private-candidate-clone-failed",
        adapterMounted: true,
      });
    }

    IN_FLIGHT_BOUNDARIES.add(sourceBoundary);
    CONSUMED_BOUNDARIES.add(sourceBoundary);
    let seamResult;
    try {
      seamResult = await hostLocalReadonlySeamAdapter.invoke(deepFreeze({
        seam: HOST_LOCAL_READONLY_SEAM,
        selectorPayload: privateCandidate,
        execute: true,
        candidatePayloadReturned: false,
        callerSuppliedDbAllowed: false,
        publicRouteAdded: false,
        postEndpointAdded: false,
      }));
    } catch {
      return blockedResult({
        boundary: sourceBoundary,
        blocker: "selected-project-readonly-invoke-host-local-adapter-threw",
        adapterMounted: true,
        adapterInvoked: true,
        invocationConsumed: true,
        privateCandidateConsumed: true,
      });
    } finally {
      IN_FLIGHT_BOUNDARIES.delete(sourceBoundary);
    }

    const seamBlocker = validateSeamResult(seamResult);
    if (seamBlocker) {
      return blockedResult({
        boundary: sourceBoundary,
        blocker: seamBlocker,
        adapterMounted: true,
        adapterInvoked: true,
        invocationConsumed: true,
        privateCandidateConsumed: true,
      });
    }

    const summaries = buildResultSummaries({
      boundary: sourceBoundary,
      candidate: privateCandidate,
      seamResult,
    });
    const completed = summaries.step1.readonlyEngineStep1Ready === true
      && summaries.step2Ready === true;
    return finaliseCapabilityResult(summaries, {
      boundary: sourceBoundary,
      state: completed
        ? RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.completed
        : RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_STATES.blockedFailClosed,
      blocker: completed ? null : summaries.step1.blocker,
      adapterMounted: true,
      adapterInvoked: true,
      invocationConsumed: true,
      privateCandidateConsumed: true,
    });
  };
}
