import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_SCHEMA_ID =
  "controlstack.runtime.selected-result-output-readiness-preflight.v1";
export const SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES = Object.freeze({
  acceptedSelectedResultAuthority: "accepted_selected_result_authority",
  persistenceNotReady: "persistence_not_ready",
  runTableNotReady: "runtable_not_ready",
  iesNotReady: "ies_not_ready",
  outputGenerationNotReady: "output_generation_not_ready",
  outputGenerationReadyInPrinciple: "output_generation_ready_in_principle",
  preflightBlockedFailClosed: "preflight_blocked_fail_closed",
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,560}$|^[0-9a-f]{32,128}$/i;

const UNSAFE_TRUE_KEYS = Object.freeze([
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "runTableGenerated",
  "productionRunTableGenerated",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "outputGenerationEnabled",
  "drawingGenerationEnabled",
  "photometryGenerationEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
  "donorEngineInvoked",
  "donorEngineInvocationEnabled",
  "realDonorPayloadAssembled",
  "routesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawEngineResultReturned",
  "rawEngineResultExposed",
  "rawSelectorPayloadReturned",
  "rawSelectorPayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawRowsReturned",
  "rawRowsExposed",
  "rawIesContentReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "exactElectricalValuesExposed",
  "privatePathsReturned",
  "privatePathsExposed",
  "credentialsReturned",
  "credentialsExposed",
]);

const RAW_BODY_KEYS = Object.freeze([
  "body",
  "resultBody",
  "selectedResultBody",
  "selected_result_body",
  "selectedResultObject",
  "selected_result_object",
  "rawEnginePayload",
  "raw_engine_payload",
  "enginePayload",
  "rawEngineResult",
  "raw_engine_result",
  "engineResult",
  "selectorPayload",
  "rawSelectorPayload",
  "runTableRows",
  "rawRunTableRows",
  "rawSelectedPayload",
  "selectedPayload",
  "ies",
  "iesText",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "candela",
  "candelaGrid",
  "rawCandelaGrid",
  "base64",
  "base64Artifacts",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function safeText(value, fallback = "", maxLength = 280) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function safeToken(value, fallback = "", maxLength = 180) {
  const text = safeText(value, fallback, maxLength);
  if (!text) return fallback;
  const token = text
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return token || fallback;
}

function safeFingerprint(value) {
  const token = safeToken(value, "", 600);
  if (!token) return null;
  return SAFE_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function hasUnsafeInput(value, depth = 0, seen = new Set()) {
  if (depth > 9) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "private-path-not-approved" : null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = hasUnsafeInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_BODY_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) {
      return `raw-body-key-${safeToken(key, "unsafe")}`;
    }
    if (UNSAFE_TRUE_KEYS.includes(key) && nested === true) {
      return `unsafe-true-flag-${safeToken(key, "flag")}`;
    }
    const child = hasUnsafeInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function summary(source, keys) {
  for (const key of keys) {
    if (isPlainObject(source[key])) return source[key];
  }
  return {};
}

function fingerprintFromSummary(value, keys = []) {
  return safeFingerprint(firstPresent(value, [
    ...keys,
    "selectedResultOutputReadinessPreflightFingerprint",
    "acceptedSelectedResultAuthorityGateFingerprint",
    "selectedResultAuthorityReadinessPreflightFingerprint",
    "selectedResultAuthorityGuardFingerprint",
    "selectedResultHandoffScaffoldFingerprint",
    "runTableDomainOutputScaffoldFingerprint",
    "iesHandoffReadinessScaffoldFingerprint",
    "selectedResultProjectionFingerprint",
    "safeSelectedResultSourceObjectFingerprint",
    "sourceInputFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]) ?? firstPresent(value.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"]));
}

function fingerprintsFrom({ source = {}, gate = {}, preflight = {}, persistenceBoundary = {}, guard = {}, projection = {}, sourceObject = {}, handoff = {}, runTable = {}, ies = {} } = {}) {
  return {
    policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])
      ?? firstPresent(gate.fingerprints || {}, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(preflight.fingerprints || {}, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(persistenceBoundary.fingerprints || {}, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(persistenceBoundary, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(handoff, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(runTable, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(ies, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(projection, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(sourceObject, ["policyFingerprint", "safePolicyFingerprint"])),
    sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])
      ?? firstPresent(gate.fingerprints || {}, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(preflight.fingerprints || {}, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(persistenceBoundary.fingerprints || {}, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(persistenceBoundary, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(handoff, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(runTable, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(ies, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(projection, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"])),
    sourceInputFingerprint: safeFingerprint(firstPresent(source, ["sourceInputFingerprint", "currentSourceInputFingerprint"])
      ?? firstPresent(gate.fingerprints || {}, ["sourceInputFingerprint"])
      ?? firstPresent(preflight.fingerprints || {}, ["sourceInputFingerprint"])
      ?? firstPresent(persistenceBoundary.fingerprints || {}, ["sourceInputFingerprint"])
      ?? firstPresent(persistenceBoundary, ["sourceInputFingerprint"])
      ?? firstPresent(projection, ["sourceInputFingerprint", "source_input_fingerprint"])
      ?? firstPresent(projection.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"])),
    sourceVersionFingerprint: safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(gate.fingerprints || {}, ["sourceVersionFingerprint"])
      ?? firstPresent(preflight.fingerprints || {}, ["sourceVersionFingerprint"])
      ?? firstPresent(persistenceBoundary.fingerprints || {}, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(persistenceBoundary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(projection, ["boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(projection.boardDataSourceVersionMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceVersionMarker", "boardDataSourceVersion"])),
  };
}

function acceptedAuthorityReady(gate) {
  return isPlainObject(gate)
    && gate.state === SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.acceptedSelectedResultAuthority
    && gate.acceptedSelectedResultAuthorityReady === true
    && gate.acceptedSelectedResultAuthority === true
    && gate.failClosed === false
    && gate.readOnly === true
    && gate.acceptedSelectedResultAuthorityEnabled !== true
    && gate.selectedResultPersisted !== true
    && gate.selectedResultPersistenceEnabled !== true
    && gate.runTableGenerationEnabled !== true
    && gate.runTableGenerated !== true
    && gate.iesGenerationEnabled !== true
    && gate.iesGenerated !== true
    && gate.outputGenerationEnabled !== true
    && gate.runtimeDataMutationEnabled !== true
    && gate.routesAdded !== true
    && gate.postEndpointsAdded !== true;
}

function projectionReady(projection) {
  return isPlainObject(projection)
    && projection.sourceAvailable === true
    && projection.selectedResultAvailable === true
    && projection.accepted === true
    && projection.acceptedSelectedResultAvailable === true
    && projection.engineVerified === true
    && projection.stale !== true
    && projection.selectedResultPersistenceEnabled !== true
    && projection.runTableGenerationEnabled !== true
    && projection.iesGenerationEnabled !== true
    && projection.outputGenerationEnabled !== true;
}

function sourceObjectReady(sourceObject) {
  return isPlainObject(sourceObject)
    && (sourceObject.ok === true || sourceObject.selectedResultSourceObjectAvailable === true)
    && sourceObject.engineVerified === true
    && sourceObject.selectedResultPersisted !== true
    && sourceObject.selectedResultPersistenceEnabled !== true
    && sourceObject.runTableGenerationEnabled !== true
    && sourceObject.iesGenerationEnabled !== true
    && sourceObject.outputGenerationEnabled !== true;
}

function guardClean(guard, gate) {
  if (isPlainObject(gate.checks) && gate.checks.staleComparisonClean === true) return true;
  return isPlainObject(guard)
    && guard.state === "engine_verified_selected_result_ready"
    && guard.failClosed === false
    && guard.stale !== true
    && guard.authorityReady === true
    && guard.comparisonAttempted === true;
}

function handoffReady(handoff) {
  return isPlainObject(handoff)
    && handoff.ok === true
    && handoff.selectedResultHandoffScaffoldReady === true
    && handoff.selectedResultPersisted !== true
    && handoff.runTableGenerated !== true
    && handoff.iesGenerated !== true;
}

function runTableDomainReady(runTable) {
  return isPlainObject(runTable)
    && runTable.ok === true
    && runTable.runTableDomainOutputScaffoldReady === true
    && runTable.runTableGenerated !== true
    && runTable.productionRunTableGenerated !== true
    && runTable.iesGenerated !== true;
}

function iesHandoffReady(ies) {
  return isPlainObject(ies)
    && ies.ok === true
    && ies.iesHandoffReadinessScaffoldReady === true
    && ies.iesGenerated !== true
    && ies.rawIesContentReturned !== true
    && ies.rawPhotometryReturned !== true
    && ies.candelaArraysReturned !== true;
}

function readinessFlag(source, key) {
  return source[key] === true;
}

function addRequirement(requirements, missingRequirements, key, ready, reason) {
  requirements[key] = ready === true;
  if (ready !== true) missingRequirements.push(key);
  return ready === true ? null : reason || key;
}

function buildReadiness(source, summaries) {
  const {
    gate,
    preflight,
    persistenceBoundary,
    guard,
    projection,
    sourceObject,
    handoff,
    runTable,
    ies,
  } = summaries;
  const requirements = {};
  const missingRequirements = [];

  const acceptedAuthority = acceptedAuthorityReady(gate);
  addRequirement(requirements, missingRequirements, "accepted-selected-result-authority-ready", acceptedAuthority);
  addRequirement(requirements, missingRequirements, "accepted-authority-readiness-preflight-ready", preflight.acceptedAuthorityReadinessPreflightReady === true || preflight.engineVerifiedSelectedResultReady === true);
  addRequirement(requirements, missingRequirements, "selected-result-authority-guard-clean", guardClean(guard, gate));
  addRequirement(requirements, missingRequirements, "selected-result-projection-ready", projectionReady(projection));
  addRequirement(requirements, missingRequirements, "safe-selected-result-source-object-ready", sourceObjectReady(sourceObject));
  addRequirement(requirements, missingRequirements, "selected-result-handoff-scaffold-ready", handoffReady(handoff));

  addRequirement(requirements, missingRequirements, "selected-result-persistence-contract-ready", readinessFlag(source, "selectedResultPersistenceContractReady") || persistenceBoundary.selectedResultPersistenceContractReady === true || handoff.handoffReadinessSummary?.selectedResultPersistenceReady === true);
  addRequirement(requirements, missingRequirements, "selected-result-persistence-redaction-boundary-ready", readinessFlag(source, "selectedResultPersistenceRedactionBoundaryReady") || persistenceBoundary.selectedResultPersistenceRedactionBoundaryReady === true);
  addRequirement(requirements, missingRequirements, "selected-result-persistence-mutation-gate-ready", readinessFlag(source, "selectedResultPersistenceMutationGateReady") || persistenceBoundary.selectedResultPersistenceMutationGateReady === true);
  addRequirement(requirements, missingRequirements, "selected-result-persistence-safe-target-defined", readinessFlag(source, "selectedResultPersistenceSafeTargetDefined") || persistenceBoundary.selectedResultPersistenceSafeTargetDefined === true || source.selectedResultPersistenceTargetSummary?.safeWriteTargetDefined === true || persistenceBoundary.selectedResultPersistenceTargetSummary?.safeWriteTargetDefined === true);

  const readyForSelectedResultPersistence = [
    "accepted-selected-result-authority-ready",
    "accepted-authority-readiness-preflight-ready",
    "selected-result-authority-guard-clean",
    "selected-result-projection-ready",
    "safe-selected-result-source-object-ready",
    "selected-result-handoff-scaffold-ready",
    "selected-result-persistence-contract-ready",
    "selected-result-persistence-redaction-boundary-ready",
    "selected-result-persistence-mutation-gate-ready",
    "selected-result-persistence-safe-target-defined",
  ].every((key) => requirements[key] === true);

  addRequirement(requirements, missingRequirements, "runtable-domain-output-scaffold-ready", runTableDomainReady(runTable));
  addRequirement(requirements, missingRequirements, "runtable-generation-contract-ready", readinessFlag(source, "runTableGenerationContractReady") || runTable.runTableDomainReadinessSummary?.productionRunTableReady === true);
  addRequirement(requirements, missingRequirements, "runtable-output-redaction-boundary-ready", readinessFlag(source, "runTableOutputRedactionBoundaryReady"));
  addRequirement(requirements, missingRequirements, "runtable-mutation-gate-ready", readinessFlag(source, "runTableMutationGateReady"));

  const readyForRunTableGeneration = readyForSelectedResultPersistence && [
    "runtable-domain-output-scaffold-ready",
    "runtable-generation-contract-ready",
    "runtable-output-redaction-boundary-ready",
    "runtable-mutation-gate-ready",
  ].every((key) => requirements[key] === true);

  addRequirement(requirements, missingRequirements, "ies-handoff-readiness-scaffold-ready", iesHandoffReady(ies));
  addRequirement(requirements, missingRequirements, "ies-generation-contract-ready", readinessFlag(source, "iesGenerationContractReady") || ies.iesReadinessSummary?.iesGenerationReady === true);
  addRequirement(requirements, missingRequirements, "ies-reference-photometry-boundary-ready", readinessFlag(source, "iesReferencePhotometryBoundaryReady"));
  addRequirement(requirements, missingRequirements, "ies-raw-content-redaction-boundary-ready", readinessFlag(source, "iesRawContentRedactionBoundaryReady"));
  addRequirement(requirements, missingRequirements, "ies-artifact-mutation-gate-ready", readinessFlag(source, "iesArtifactMutationGateReady"));

  const readyForIesGeneration = readyForRunTableGeneration && [
    "ies-handoff-readiness-scaffold-ready",
    "ies-generation-contract-ready",
    "ies-reference-photometry-boundary-ready",
    "ies-raw-content-redaction-boundary-ready",
    "ies-artifact-mutation-gate-ready",
  ].every((key) => requirements[key] === true);

  addRequirement(requirements, missingRequirements, "output-generation-authority-contract-ready", readinessFlag(source, "outputGenerationAuthorityContractReady"));
  addRequirement(requirements, missingRequirements, "output-route-contract-ready", readinessFlag(source, "outputRouteContractReady"));
  addRequirement(requirements, missingRequirements, "output-redaction-boundary-ready", readinessFlag(source, "outputRedactionBoundaryReady"));
  addRequirement(requirements, missingRequirements, "output-mutation-gate-ready", readinessFlag(source, "outputMutationGateReady"));

  const readyForOutputGeneration = readyForIesGeneration && [
    "output-generation-authority-contract-ready",
    "output-route-contract-ready",
    "output-redaction-boundary-ready",
    "output-mutation-gate-ready",
  ].every((key) => requirements[key] === true);

  return {
    requirements,
    missingRequirements: [...new Set(missingRequirements)],
    acceptedAuthority,
    readyForSelectedResultPersistence,
    readyForRunTableGeneration,
    readyForIesGeneration,
    readyForOutputGeneration,
  };
}

function stateFor(readiness) {
  if (readiness.acceptedAuthority !== true) return SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.preflightBlockedFailClosed;
  if (readiness.readyForSelectedResultPersistence !== true) return SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.persistenceNotReady;
  if (readiness.readyForRunTableGeneration !== true) return SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.runTableNotReady;
  if (readiness.readyForIesGeneration !== true) return SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.iesNotReady;
  if (readiness.readyForOutputGeneration !== true) return SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationNotReady;
  return SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationReadyInPrinciple;
}

function reasonFor(state) {
  switch (state) {
    case SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.preflightBlockedFailClosed:
      return "accepted selected-result authority is not established; persistence and outputs remain fail-closed";
    case SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.persistenceNotReady:
      return "accepted selected-result authority is established, but selected-result persistence prerequisites are not ready";
    case SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.runTableNotReady:
      return "selected-result persistence is ready in principle, but RunTable generation prerequisites are not ready";
    case SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.iesNotReady:
      return "RunTable generation is ready in principle, but IES generation prerequisites are not ready";
    case SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationNotReady:
      return "IES generation is ready in principle, but downstream output-generation authority prerequisites are not ready";
    case SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationReadyInPrinciple:
      return "all output-readiness prerequisites are ready in principle; real persistence, generation, routes, endpoints, mutation, and raw outputs remain disabled";
    default:
      return "output-readiness preflight state is fail-closed";
  }
}

function buildRows({ state, authorityState, readiness, reason }) {
  return [
    ["preflight state", state],
    ["accepted authority state", authorityState || "not_compared_fail_closed"],
    ["accepted authority ready", readiness.acceptedAuthority ? "true" : "false"],
    ["ready for selected-result persistence", readiness.readyForSelectedResultPersistence ? "true" : "false"],
    ["ready for RunTable generation", readiness.readyForRunTableGeneration ? "true" : "false"],
    ["ready for IES generation", readiness.readyForIesGeneration ? "true" : "false"],
    ["ready for output generation", readiness.readyForOutputGeneration ? "true" : "false"],
    ["selected result persisted", "false"],
    ["RunTable generated", "false"],
    ["IES generated", "false"],
    ["outputs generated", "false"],
    ["routes added", "false"],
    ["POST endpoints added", "false"],
    ["RuntimeData mutation", "false"],
    ["reason", reason],
  ];
}

function result(state, reason, extra = {}) {
  const readiness = extra.readiness || {};
  const fingerprint = stableFingerprint("safe-selected-result-output-readiness-preflight", {
    state,
    reason,
    authorityState: extra.authorityState || null,
    missingRequirements: readiness.missingRequirements || [],
    fingerprints: extra.fingerprints || {},
  });
  return Object.freeze({
    schemaId: SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_SCHEMA_VERSION,
    state,
    preflightState: state,
    authorityState: extra.authorityState || null,
    selectedResultAuthorityState: extra.authorityState || null,
    acceptedSelectedResultAuthorityState: extra.authorityState || null,
    acceptedSelectedResultAuthorityReady: readiness.acceptedAuthority === true,
    readyForSelectedResultPersistence: readiness.readyForSelectedResultPersistence === true,
    readyForRunTableGeneration: readiness.readyForRunTableGeneration === true,
    readyForIesGeneration: readiness.readyForIesGeneration === true,
    readyForOutputGeneration: readiness.readyForOutputGeneration === true,
    missingRequirements: Array.isArray(readiness.missingRequirements) ? [...readiness.missingRequirements] : [],
    requirements: clonePlain(readiness.requirements || {}),
    failClosed: state !== SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationReadyInPrinciple,
    blocker: state === SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationReadyInPrinciple
      ? null
      : safeToken(readiness.missingRequirements?.[0], state, 180),
    reason: safeText(reason, state, 320),
    diagnosticOnly: true,
    readOnly: true,
    preflightOnly: true,
    safeSummaryOnly: true,
    outputReadinessPreflightOnly: true,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersistenceAttempted: false,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    runTableGenerationAttempted: false,
    productionRunTableGenerated: false,
    iesGenerated: false,
    iesGenerationEnabled: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
    drawingGenerationEnabled: false,
    photometryGenerationEnabled: false,
    runtimeDataMutationEnabled: false,
    runtimeDataMutated: false,
    routesAdded: false,
    publicRouteAdded: false,
    postEndpointsAdded: false,
    postEndpointAdded: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawRunTableRowsReturned: false,
    rawSelectedPayloadReturned: false,
    rawRowsReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    fingerprints: clonePlain(extra.fingerprints || {}),
    summaryFingerprints: clonePlain(extra.summaryFingerprints || {}),
    rows: buildRows({ state, authorityState: extra.authorityState, readiness, reason: safeText(reason, state, 320) }),
    safetyFlags: {
      readOnly: true,
      diagnosticOnly: true,
      preflightOnly: true,
      safeSummaryOnly: true,
      outputReadinessPreflightOnly: true,
      selectedResultPersistenceEnabled: false,
      selectedResultPersisted: false,
      runTableGenerationEnabled: false,
      runTableGenerated: false,
      productionRunTableGenerated: false,
      iesGenerationEnabled: false,
      iesGenerated: false,
      outputGenerationEnabled: false,
      drawingGenerationEnabled: false,
      photometryGenerationEnabled: false,
      runtimeDataMutationEnabled: false,
      runtimeDataMutated: false,
      routesAdded: false,
      postEndpointsAdded: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      rawSelectorPayloadReturned: false,
      rawRunTableRowsReturned: false,
      rawSelectedPayloadReturned: false,
      rawRowsReturned: false,
      rawIesContentReturned: false,
      rawPhotometryReturned: false,
      candelaArraysReturned: false,
      base64ArtifactsReturned: false,
      exactElectricalValuesReturned: false,
      privatePathsReturned: false,
    },
    selectedResultOutputReadinessPreflightFingerprint: fingerprint,
  });
}

export function buildSelectedResultOutputReadinessPreflight(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const gate = summary(source, ["acceptedSelectedResultAuthorityGateSummary", "acceptedAuthorityGateSummary"]);
  const preflight = summary(source, ["selectedResultAuthorityReadinessPreflightSummary", "acceptedAuthorityReadinessPreflightSummary"]);
  const persistenceBoundary = summary(source, ["selectedResultPersistenceBoundaryContractSummary", "persistenceBoundaryContractSummary"]);
  const guard = summary(source, ["selectedResultAuthorityGuardSummary", "authorityGuardSummary"]);
  const projection = summary(source, ["selectedResultProjectionSummary", "selectedResultProjection"]);
  const sourceObject = summary(source, ["safeSelectedResultSourceObjectSummary", "safeSelectedResultSourceObject"]);
  const handoff = summary(source, ["selectedResultHandoffScaffoldSummary", "selectedResultHandoffSummary"]);
  const runTable = summary(source, ["runTableDomainOutputScaffoldSummary", "runTableDomainSummary"]);
  const ies = summary(source, ["iesHandoffReadinessScaffoldSummary", "iesHandoffSummary"]);

  const unsafe = hasUnsafeInput({
    ...source,
    acceptedSelectedResultAuthorityGateSummary: undefined,
    acceptedAuthorityGateSummary: undefined,
    selectedResultAuthorityReadinessPreflightSummary: undefined,
    acceptedAuthorityReadinessPreflightSummary: undefined,
    selectedResultPersistenceBoundaryContractSummary: undefined,
    persistenceBoundaryContractSummary: undefined,
    selectedResultAuthorityGuardSummary: undefined,
    authorityGuardSummary: undefined,
    selectedResultProjectionSummary: undefined,
    selectedResultProjection: undefined,
    safeSelectedResultSourceObjectSummary: undefined,
    safeSelectedResultSourceObject: undefined,
    selectedResultHandoffScaffoldSummary: undefined,
    selectedResultHandoffSummary: undefined,
    runTableDomainOutputScaffoldSummary: undefined,
    runTableDomainSummary: undefined,
    iesHandoffReadinessScaffoldSummary: undefined,
    iesHandoffSummary: undefined,
  }) || hasUnsafeInput(gate) || hasUnsafeInput(preflight) || hasUnsafeInput(persistenceBoundary) || hasUnsafeInput(guard) || hasUnsafeInput(projection) || hasUnsafeInput(sourceObject) || hasUnsafeInput(handoff) || hasUnsafeInput(runTable) || hasUnsafeInput(ies);

  const fingerprints = fingerprintsFrom({ source, gate, preflight, persistenceBoundary, guard, projection, sourceObject, handoff, runTable, ies });
  const summaryFingerprints = {
    acceptedSelectedResultAuthorityGate: fingerprintFromSummary(gate, ["acceptedSelectedResultAuthorityGateFingerprint"]),
    selectedResultAuthorityReadinessPreflight: fingerprintFromSummary(preflight, ["selectedResultAuthorityReadinessPreflightFingerprint"]),
    selectedResultPersistenceBoundaryContract: fingerprintFromSummary(persistenceBoundary, ["selectedResultPersistenceBoundaryContractFingerprint"]),
    selectedResultAuthorityGuard: fingerprintFromSummary(guard, ["selectedResultAuthorityGuardFingerprint"]),
    selectedResultProjection: fingerprintFromSummary(projection, ["selectedResultProjectionFingerprint"]),
    safeSelectedResultSourceObject: fingerprintFromSummary(sourceObject, ["safeSelectedResultSourceObjectFingerprint"]),
    selectedResultHandoffScaffold: fingerprintFromSummary(handoff, ["selectedResultHandoffScaffoldFingerprint"]),
    runTableDomainOutputScaffold: fingerprintFromSummary(runTable, ["runTableDomainOutputScaffoldFingerprint"]),
    iesHandoffReadinessScaffold: fingerprintFromSummary(ies, ["iesHandoffReadinessScaffoldFingerprint"]),
  };

  if (unsafe) {
    const readiness = {
      acceptedAuthority: false,
      readyForSelectedResultPersistence: false,
      readyForRunTableGeneration: false,
      readyForIesGeneration: false,
      readyForOutputGeneration: false,
      missingRequirements: [`unsafe-input-rejected-${safeToken(unsafe, "unsafe")}`],
      requirements: {},
    };
    return result(
      SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.preflightBlockedFailClosed,
      `unsafe input rejected: ${unsafe}`,
      {
        readiness,
        authorityState: safeToken(gate.state || gate.selectedResultAuthorityState, "not_compared_fail_closed"),
        fingerprints,
        summaryFingerprints,
      },
    );
  }

  const readiness = buildReadiness(source, { gate, preflight, persistenceBoundary, guard, projection, sourceObject, handoff, runTable, ies });
  const state = stateFor(readiness);
  const reason = reasonFor(state);
  return result(state, reason, {
    readiness,
    authorityState: safeToken(gate.state || gate.selectedResultAuthorityState, "not_compared_fail_closed"),
    fingerprints,
    summaryFingerprints,
  });
}

export const buildRuntimeSelectedResultOutputReadinessPreflight = buildSelectedResultOutputReadinessPreflight;
