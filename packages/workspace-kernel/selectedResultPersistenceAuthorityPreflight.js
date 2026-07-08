import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_SCHEMA_ID =
  "controlstack.runtime.selected-result-persistence-authority-preflight.v1";
export const SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES = Object.freeze({
  readyForPersistenceAuthority: "ready_for_persistence_authority",
  notReady: "not_ready_for_persistence_authority",
  blockedFailClosed: "persistence_authority_preflight_blocked_fail_closed",
});

const PERSISTENCE_BOUNDARY_CONTRACT_READY_STATE = "selected_result_persistence_boundary_contract_ready";
const ACCEPTED_SELECTED_RESULT_AUTHORITY_STATE = "accepted_selected_result_authority";

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,560}$|^[0-9a-f]{32,128}$/i;

const UNSAFE_TRUE_KEYS = Object.freeze([
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "selectedResultPersistenceImplementationAllowed",
  "selectedResultPersistenceWriteHookAdded",
  "selectedResultStorageEnabled",
  "projectWriteEnabled",
  "projectWritesEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "runtimeDataMutationAuthority",
  "boardDataMutationEnabled",
  "donorMutationEnabled",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "runTableGenerated",
  "productionRunTableGenerated",
  "productionRunTableGenerationEnabled",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "outputGenerationEnabled",
  "drawingGenerationEnabled",
  "photometryGenerationEnabled",
  "routesAdded",
  "publicRoutesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
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
  "rawIesExposed",
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
  "selectedResultPayload",
  "rawSelectedPayload",
  "selectedPayload",
  "enginePayload",
  "rawEnginePayload",
  "raw_engine_payload",
  "engineResult",
  "rawEngineResult",
  "raw_engine_result",
  "selectorPayload",
  "rawSelectorPayload",
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawProductRows",
  "rawBoardRows",
  "rawDriverRows",
  "rawAccessoryRows",
  "sourceRows",
  "rawSourceRows",
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
  "credentials",
  "secrets",
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

function safeText(value, fallback = "", maxLength = 360) {
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

function canonicalFingerprint(value) {
  const fingerprint = safeFingerprint(value);
  return fingerprint ? fingerprint.toLowerCase().replace(/[-_:]+/g, ":") : null;
}

function fingerprintsDiffer(left, right) {
  const leftCanonical = canonicalFingerprint(left);
  const rightCanonical = canonicalFingerprint(right);
  return Boolean(leftCanonical && rightCanonical && leftCanonical !== rightCanonical);
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
    "selectedResultPersistenceAuthorityPreflightFingerprint",
    "selectedResultPersistenceBoundaryContractFingerprint",
    "selectedResultOutputReadinessPreflightFingerprint",
    "acceptedSelectedResultAuthorityGateFingerprint",
    "selectedResultAuthorityGuardFingerprint",
    "selectedResultProjectionFingerprint",
    "safeSelectedResultSourceObjectFingerprint",
    "selectedResultHandoffScaffoldFingerprint",
    "sourceInputFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]) ?? firstPresent(value.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"]));
}

function explicitFingerprint(source, keyAliases) {
  return safeFingerprint(firstPresent(source, keyAliases)
    ?? firstPresent(source.fingerprints || {}, keyAliases));
}

function fingerprintsFrom({ source = {}, gate = {}, output = {}, boundary = {}, guard = {}, projection = {}, sourceObject = {}, handoff = {} } = {}) {
  return {
    policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])
      ?? explicitFingerprint(boundary, ["policyFingerprint", "safePolicyFingerprint"])
      ?? explicitFingerprint(output, ["policyFingerprint", "safePolicyFingerprint"])
      ?? explicitFingerprint(gate, ["policyFingerprint", "safePolicyFingerprint"])
      ?? explicitFingerprint(handoff, ["policyFingerprint", "safePolicyFingerprint"])
      ?? explicitFingerprint(projection, ["policyFingerprint", "safePolicyFingerprint"])
      ?? explicitFingerprint(sourceObject, ["policyFingerprint", "safePolicyFingerprint"])),
    sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])
      ?? explicitFingerprint(boundary, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? explicitFingerprint(output, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? explicitFingerprint(gate, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? explicitFingerprint(handoff, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? explicitFingerprint(projection, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? explicitFingerprint(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"])),
    sourceInputFingerprint: safeFingerprint(firstPresent(source, ["sourceInputFingerprint", "currentSourceInputFingerprint"])
      ?? explicitFingerprint(boundary, ["sourceInputFingerprint"])
      ?? explicitFingerprint(output, ["sourceInputFingerprint"])
      ?? explicitFingerprint(gate, ["sourceInputFingerprint"])
      ?? firstPresent(projection, ["sourceInputFingerprint", "source_input_fingerprint"])
      ?? firstPresent(projection.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"])),
    sourceVersionFingerprint: safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? explicitFingerprint(boundary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? explicitFingerprint(output, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? explicitFingerprint(gate, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(projection, ["boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(projection.boardDataSourceVersionMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceVersionMarker", "boardDataSourceVersion"])),
  };
}

function acceptedAuthorityReady(gate) {
  return isPlainObject(gate)
    && gate.state === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATE
    && gate.acceptedSelectedResultAuthorityReady === true
    && gate.acceptedSelectedResultAuthority === true
    && gate.acceptedForReadOnlyRuntimeAuthority === true
    && gate.failClosed === false
    && gate.readOnly === true
    && gate.safeSummaryOnly === true
    && gate.acceptedSelectedResultAuthorityEnabled !== true
    && gate.selectedResultPersisted !== true
    && gate.selectedResultPersistenceEnabled !== true
    && gate.selectedResultPersistenceAttempted !== true
    && gate.runTableGenerationEnabled !== true
    && gate.runTableGenerated !== true
    && gate.iesGenerationEnabled !== true
    && gate.iesGenerated !== true
    && gate.outputGenerationEnabled !== true
    && gate.runtimeDataMutationEnabled !== true
    && gate.routesAdded !== true
    && gate.postEndpointsAdded !== true;
}

function boundaryContractReady(boundary) {
  return isPlainObject(boundary)
    && boundary.state === PERSISTENCE_BOUNDARY_CONTRACT_READY_STATE
    && boundary.selectedResultPersistenceContractReady === true
    && boundary.selectedResultPersistenceRedactionBoundaryReady === true
    && boundary.selectedResultPersistenceMutationGateReady === true
    && boundary.selectedResultPersistenceSafeTargetDefined === true
    && boundary.safeWriteTargetDefined === true
    && boundary.eligiblePersistedSummaryShapeDefined === true
    && boundary.redactionBoundaryDefined === true
    && boundary.mutationGateDefinedAndDisabled === true
    && boundary.failClosed === false
    && boundary.readOnly === true
    && boundary.contractOnly === true
    && boundary.diagnosticOnly === true
    && boundary.safeSummaryOnly === true
    && boundary.selectedResultPersisted !== true
    && boundary.selectedResultPersistenceEnabled !== true
    && boundary.selectedResultPersistenceAttempted !== true
    && boundary.selectedResultPersistenceImplementationAllowed !== true
    && boundary.selectedResultPersistenceWriteHookAdded !== true
    && boundary.runtimeDataMutationEnabled !== true
    && boundary.runTableGenerationEnabled !== true
    && boundary.runTableGenerated !== true
    && boundary.iesGenerationEnabled !== true
    && boundary.iesGenerated !== true
    && boundary.outputGenerationEnabled !== true
    && boundary.routesAdded !== true
    && boundary.postEndpointsAdded !== true;
}

function outputPreflightPersistencePathReady(output) {
  return isPlainObject(output)
    && output.acceptedSelectedResultAuthorityReady === true
    && output.readyForSelectedResultPersistence === true
    && output.readOnly === true
    && output.diagnosticOnly === true
    && output.preflightOnly === true
    && output.safeSummaryOnly === true
    && output.selectedResultPersisted !== true
    && output.selectedResultPersistenceEnabled !== true
    && output.selectedResultPersistenceAttempted !== true
    && output.runTableGenerationEnabled !== true
    && output.runTableGenerated !== true
    && output.iesGenerationEnabled !== true
    && output.iesGenerated !== true
    && output.outputGenerationEnabled !== true
    && output.runtimeDataMutationEnabled !== true
    && output.routesAdded !== true
    && output.postEndpointsAdded !== true;
}

function guardClean(guard, gate) {
  if (isPlainObject(gate.checks) && gate.checks.staleComparisonClean === true) return true;
  return isPlainObject(guard)
    && guard.state === "engine_verified_selected_result_ready"
    && guard.selectedResultAuthorityGuardReady === true
    && guard.failClosed === false
    && guard.stale !== true
    && guard.authorityReady === true
    && guard.comparisonAttempted === true
    && guard.readOnly === true
    && guard.selectedResultPersisted !== true
    && guard.selectedResultPersistenceEnabled !== true;
}

function projectionReady(projection) {
  return isPlainObject(projection)
    && projection.sourceAvailable === true
    && projection.selectedResultAvailable === true
    && projection.accepted === true
    && projection.acceptedSelectedResultAvailable === true
    && projection.engineVerified === true
    && projection.stale !== true
    && projection.readOnly !== false
    && projection.displayOnly !== false
    && projection.selectedResultPersistenceEnabled !== true
    && projection.runTableGenerationEnabled !== true
    && projection.iesGenerationEnabled !== true
    && projection.outputGenerationEnabled !== true;
}

function sourceObjectReady(sourceObject) {
  return isPlainObject(sourceObject)
    && (sourceObject.ok === true || sourceObject.selectedResultSourceObjectAvailable === true)
    && sourceObject.engineVerified === true
    && sourceObject.readOnly !== false
    && sourceObject.selectedResultPersisted !== true
    && sourceObject.selectedResultPersistenceEnabled !== true
    && sourceObject.runTableGenerationEnabled !== true
    && sourceObject.iesGenerationEnabled !== true
    && sourceObject.outputGenerationEnabled !== true;
}

function handoffReady(handoff) {
  return isPlainObject(handoff)
    && handoff.ok === true
    && handoff.selectedResultHandoffScaffoldReady === true
    && handoff.diagnosticOnly === true
    && handoff.safeSummaryOnly === true
    && handoff.selectedResultPersisted !== true
    && handoff.selectedResultPersistenceEnabled !== true
    && handoff.runTableGenerated !== true
    && handoff.iesGenerated !== true;
}

function safeTargetReady(boundary) {
  const target = isPlainObject(boundary.safeWriteTarget)
    ? boundary.safeWriteTarget
    : isPlainObject(boundary.selectedResultPersistenceTargetSummary)
      ? boundary.selectedResultPersistenceTargetSummary
      : {};
  return target.owner === "shell"
    && target.targetKind === "project-envelope-summary-slot"
    && target.moduleId === "cs_selector"
    && target.runtimeDataTarget !== true
    && target.boardDataTarget !== true
    && target.donorDataTarget !== true
    && target.runTableTarget !== true
    && target.iesTarget !== true;
}

function eligibleShapeReady(boundary) {
  const shape = isPlainObject(boundary.eligiblePersistedSummaryShape)
    ? boundary.eligiblePersistedSummaryShape
    : {};
  return boundary.eligiblePersistedSummaryShapeDefined === true
    && shape.summaryOnly === true
    && shape.redacted === true
    && Array.isArray(shape.allowedFields)
    && shape.allowedFields.includes("policyFingerprint")
    && shape.allowedFields.includes("persistenceBoundaryContractFingerprint")
    && Array.isArray(shape.requiredFalseFlags)
    && shape.requiredFalseFlags.includes("selectedResultPersisted")
    && Array.isArray(shape.blockedRawFieldClasses)
    && shape.blockedRawFieldClasses.length > 0;
}

function fingerprintValue(summaryObject, directAliases, nestedAliases = directAliases) {
  return safeFingerprint(firstPresent(summaryObject, directAliases)
    ?? firstPresent(summaryObject.fingerprints || {}, nestedAliases));
}

function fingerprintAlignmentMismatch({ fingerprints = {}, gate = {}, output = {}, boundary = {}, projection = {}, sourceObject = {}, handoff = {} } = {}) {
  const checks = [
    ["gate policy", fingerprintValue(gate, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["gate source", fingerprintValue(gate, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["gate source input", fingerprintValue(gate, ["sourceInputFingerprint"]), fingerprints.sourceInputFingerprint],
    ["gate source version", fingerprintValue(gate, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]), fingerprints.sourceVersionFingerprint],
    ["output-preflight policy", fingerprintValue(output, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["output-preflight source", fingerprintValue(output, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["output-preflight source input", fingerprintValue(output, ["sourceInputFingerprint"]), fingerprints.sourceInputFingerprint],
    ["output-preflight source version", fingerprintValue(output, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]), fingerprints.sourceVersionFingerprint],
    ["persistence-boundary policy", fingerprintValue(boundary, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["persistence-boundary source", fingerprintValue(boundary, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["persistence-boundary source input", fingerprintValue(boundary, ["sourceInputFingerprint"]), fingerprints.sourceInputFingerprint],
    ["persistence-boundary source version", fingerprintValue(boundary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]), fingerprints.sourceVersionFingerprint],
    ["projection policy", fingerprintValue(projection, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["projection source", fingerprintValue(projection, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["projection source input", fingerprintValue(projection, ["sourceInputFingerprint", "source_input_fingerprint"]), fingerprints.sourceInputFingerprint],
    ["projection source version", fingerprintValue(projection, ["boardDataSourceVersion", "sourceVersionMarker"]), fingerprints.sourceVersionFingerprint],
    ["source-object policy", fingerprintValue(sourceObject, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["source-object source", fingerprintValue(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["source-object source input", fingerprintValue(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"]), fingerprints.sourceInputFingerprint],
    ["source-object source version", fingerprintValue(sourceObject, ["sourceVersionMarker", "boardDataSourceVersion"]), fingerprints.sourceVersionFingerprint],
    ["handoff policy", fingerprintValue(handoff, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["handoff source", fingerprintValue(handoff, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
  ];

  for (const [label, actual, expected] of checks) {
    if (fingerprintsDiffer(actual, expected)) return `${label} fingerprint mismatch`;
  }
  return null;
}

function addRequirement(requirements, missingRequirements, key, ready) {
  requirements[key] = ready === true;
  if (ready !== true) missingRequirements.push(key);
}

function buildReadiness({ gate, output, boundary, guard, projection, sourceObject, handoff, fingerprints, unsafe }) {
  const requirements = {};
  const missingRequirements = [];

  addRequirement(requirements, missingRequirements, "no-unsafe-raw-or-write-markers", !unsafe);
  addRequirement(requirements, missingRequirements, "accepted-selected-result-authority-ready", acceptedAuthorityReady(gate));
  addRequirement(requirements, missingRequirements, "selected-result-persistence-boundary-contract-ready", boundaryContractReady(boundary));
  addRequirement(requirements, missingRequirements, "selected-result-output-readiness-preflight-ready-for-persistence", outputPreflightPersistencePathReady(output));
  addRequirement(requirements, missingRequirements, "selected-result-authority-guard-clean", guardClean(guard, gate));
  addRequirement(requirements, missingRequirements, "selected-result-projection-summary-safe", projectionReady(projection));
  addRequirement(requirements, missingRequirements, "safe-selected-result-source-object-summary-safe", sourceObjectReady(sourceObject));
  addRequirement(requirements, missingRequirements, "selected-result-handoff-scaffold-ready", handoffReady(handoff));
  addRequirement(requirements, missingRequirements, "persistence-safe-shell-envelope-target-ready", safeTargetReady(boundary));
  addRequirement(requirements, missingRequirements, "eligible-redacted-persisted-summary-shape-ready", eligibleShapeReady(boundary));
  addRequirement(requirements, missingRequirements, "policy-fingerprint-present", Boolean(fingerprints.policyFingerprint));
  addRequirement(requirements, missingRequirements, "source-fingerprint-present", Boolean(fingerprints.sourceFingerprint));
  addRequirement(requirements, missingRequirements, "source-input-fingerprint-present", Boolean(fingerprints.sourceInputFingerprint));
  addRequirement(requirements, missingRequirements, "source-version-fingerprint-present", Boolean(fingerprints.sourceVersionFingerprint));

  return {
    requirements,
    missingRequirements: [...new Set(missingRequirements)],
    readyForPersistenceAuthority: Object.values(requirements).every((ready) => ready === true),
  };
}

function disabledSafetyFlags(readyForPersistenceAuthority) {
  return {
    readOnly: true,
    diagnosticOnly: true,
    preflightOnly: true,
    safeSummaryOnly: true,
    persistenceAuthorityPreflightOnly: true,
    readyForPersistenceAuthority,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersistenceAttempted: false,
    selectedResultPersistenceImplementationAllowed: false,
    selectedResultPersistenceWriteHookAdded: false,
    projectWriteEnabled: false,
    runtimeDataMutationEnabled: false,
    runtimeDataMutated: false,
    boardDataMutationEnabled: false,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    productionRunTableGenerated: false,
    iesGenerated: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    drawingGenerationEnabled: false,
    photometryGenerationEnabled: false,
    routesAdded: false,
    publicRouteAdded: false,
    postEndpointsAdded: false,
    postEndpointAdded: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawSelectedPayloadReturned: false,
    rawRunTableRowsReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
  };
}

function rows({ state, readiness, reason }) {
  return [
    ["persistence authority preflight state", state],
    ["ready for persistence-authority step", readiness.readyForPersistenceAuthority ? "true" : "false"],
    ["selected result persisted", "false"],
    ["selected-result persistence enabled", "false"],
    ["selected-result persistence attempted", "false"],
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
  const readiness = extra.readiness || { requirements: {}, missingRequirements: [], readyForPersistenceAuthority: false };
  const readyForPersistenceAuthority = state === SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.readyForPersistenceAuthority;
  const summaryFingerprints = clonePlain(extra.summaryFingerprints || {});
  const fingerprints = clonePlain(extra.fingerprints || {});
  const fingerprint = stableFingerprint("safe-selected-result-persistence-authority-preflight", {
    state,
    reason,
    missingRequirements: readiness.missingRequirements || [],
    fingerprints,
    summaryFingerprints,
  });

  return Object.freeze({
    schemaId: SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_SCHEMA_VERSION,
    state,
    persistenceAuthorityPreflightState: state,
    readyForPersistenceAuthority: readyForPersistenceAuthority && readiness.readyForPersistenceAuthority === true,
    acceptedSelectedResultAuthorityState: extra.acceptedAuthorityState || null,
    selectedResultOutputReadinessPreflightState: extra.outputPreflightState || null,
    selectedResultPersistenceBoundaryState: extra.persistenceBoundaryState || null,
    acceptedSelectedResultAuthorityReady: extra.acceptedSelectedResultAuthorityReady === true,
    selectedResultPersistenceBoundaryContractReady: extra.persistenceBoundaryContractReady === true,
    selectedResultOutputReadinessPreflightReadyForPersistence: extra.outputPreflightReadyForPersistence === true,
    missingRequirements: Array.isArray(readiness.missingRequirements) ? [...readiness.missingRequirements] : [],
    requirements: clonePlain(readiness.requirements || {}),
    failClosed: !readyForPersistenceAuthority,
    blocker: readyForPersistenceAuthority ? null : safeToken(readiness.missingRequirements?.[0], state, 180),
    reason: safeText(reason, state, 380),
    diagnosticOnly: true,
    readOnly: true,
    preflightOnly: true,
    safeSummaryOnly: true,
    persistenceAuthorityPreflightOnly: true,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersistenceAttempted: false,
    selectedResultPersistenceImplementationAllowed: false,
    selectedResultPersistenceWriteHookAdded: false,
    projectWriteEnabled: false,
    runtimeDataMutationEnabled: false,
    runtimeDataMutated: false,
    boardDataMutationEnabled: false,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    productionRunTableGenerated: false,
    iesGenerated: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    drawingGenerationEnabled: false,
    photometryGenerationEnabled: false,
    routesAdded: false,
    publicRouteAdded: false,
    postEndpointsAdded: false,
    postEndpointAdded: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawSelectedPayloadReturned: false,
    rawRunTableRowsReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    fingerprints,
    summaryFingerprints,
    safetyFlags: disabledSafetyFlags(readyForPersistenceAuthority && readiness.readyForPersistenceAuthority === true),
    rows: rows({ state, readiness, reason: safeText(reason, state, 380) }),
    selectedResultPersistenceAuthorityPreflightFingerprint: fingerprint,
  });
}

export function buildSelectedResultPersistenceAuthorityPreflight(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const gate = summary(source, ["acceptedSelectedResultAuthorityGateSummary", "acceptedAuthorityGateSummary"]);
  const output = summary(source, ["selectedResultOutputReadinessPreflightSummary", "outputReadinessPreflightSummary"]);
  const boundary = summary(source, ["selectedResultPersistenceBoundaryContractSummary", "persistenceBoundaryContractSummary"]);
  const guard = summary(source, ["selectedResultAuthorityGuardSummary", "authorityGuardSummary"]);
  const projection = summary(source, ["selectedResultProjectionSummary", "selectedResultProjection"]);
  const sourceObject = summary(source, ["safeSelectedResultSourceObjectSummary", "safeSelectedResultSourceObject"]);
  const handoff = summary(source, ["selectedResultHandoffScaffoldSummary", "selectedResultHandoffSummary"]);

  const unsafe = hasUnsafeInput({
    ...source,
    acceptedSelectedResultAuthorityGateSummary: undefined,
    acceptedAuthorityGateSummary: undefined,
    selectedResultOutputReadinessPreflightSummary: undefined,
    outputReadinessPreflightSummary: undefined,
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
  }) || hasUnsafeInput(gate) || hasUnsafeInput(output) || hasUnsafeInput(boundary) || hasUnsafeInput(guard) || hasUnsafeInput(projection) || hasUnsafeInput(sourceObject) || hasUnsafeInput(handoff);

  const fingerprints = fingerprintsFrom({ source, gate, output, boundary, guard, projection, sourceObject, handoff });
  const summaryFingerprints = {
    acceptedSelectedResultAuthorityGate: fingerprintFromSummary(gate, ["acceptedSelectedResultAuthorityGateFingerprint"]),
    selectedResultOutputReadinessPreflight: fingerprintFromSummary(output, ["selectedResultOutputReadinessPreflightFingerprint"]),
    selectedResultPersistenceBoundaryContract: fingerprintFromSummary(boundary, ["selectedResultPersistenceBoundaryContractFingerprint"]),
    selectedResultAuthorityGuard: fingerprintFromSummary(guard, ["selectedResultAuthorityGuardFingerprint"]),
    selectedResultProjection: fingerprintFromSummary(projection, ["selectedResultProjectionFingerprint"]),
    safeSelectedResultSourceObject: fingerprintFromSummary(sourceObject, ["safeSelectedResultSourceObjectFingerprint"]),
    selectedResultHandoffScaffold: fingerprintFromSummary(handoff, ["selectedResultHandoffScaffoldFingerprint"]),
  };

  const alignmentMismatch = fingerprintAlignmentMismatch({ fingerprints, gate, output, boundary, projection, sourceObject, handoff });
  const readiness = buildReadiness({
    gate,
    output,
    boundary,
    guard,
    projection,
    sourceObject,
    handoff,
    fingerprints,
    unsafe: unsafe || alignmentMismatch,
  });

  const common = {
    readiness,
    fingerprints,
    summaryFingerprints,
    acceptedAuthorityState: safeToken(gate.state || gate.selectedResultAuthorityState, "not_compared_fail_closed"),
    outputPreflightState: safeToken(output.state || output.preflightState, "unknown"),
    persistenceBoundaryState: safeToken(boundary.state || boundary.persistenceBoundaryState, "unknown"),
    acceptedSelectedResultAuthorityReady: acceptedAuthorityReady(gate),
    persistenceBoundaryContractReady: boundaryContractReady(boundary),
    outputPreflightReadyForPersistence: outputPreflightPersistencePathReady(output),
  };

  if (unsafe || alignmentMismatch) {
    const blocker = unsafe || alignmentMismatch;
    readiness.missingRequirements = [...new Set([
      `unsafe-input-rejected-${safeToken(blocker, "unsafe")}`,
      ...readiness.missingRequirements,
    ])];
    readiness.requirements["no-unsafe-raw-or-write-markers"] = false;
    readiness.readyForPersistenceAuthority = false;
    return result(
      SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.blockedFailClosed,
      `unsafe or mismatched input rejected: ${blocker}`,
      common,
    );
  }

  if (readiness.readyForPersistenceAuthority !== true) {
    return result(
      SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.notReady,
      "accepted selected-result authority is not yet eligible for the future persistence-authority step; accepted authority, boundary contract, output-readiness persistence path, clean fingerprints, and safe summaries are required",
      common,
    );
  }

  return result(
    SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.readyForPersistenceAuthority,
    "accepted selected-result authority is eligible to move toward a future persistence-authority step only; real persistence, RunTable, IES, outputs, routes, POST endpoints, RuntimeData mutation, and raw exposure remain disabled",
    common,
  );
}

export const buildRuntimeSelectedResultPersistenceAuthorityPreflight = buildSelectedResultPersistenceAuthorityPreflight;
