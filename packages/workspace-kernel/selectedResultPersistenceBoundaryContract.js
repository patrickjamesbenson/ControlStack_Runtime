import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTED_RESULT_PERSISTENCE_BOUNDARY_CONTRACT_SCHEMA_ID =
  "controlstack.runtime.selected-result-persistence-boundary-contract.v1";
export const SELECTED_RESULT_PERSISTENCE_BOUNDARY_CONTRACT_SCHEMA_VERSION = 1;

export const PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.persisted-selected-result-summary.v1";
export const PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES = Object.freeze({
  contractReady: "selected_result_persistence_boundary_contract_ready",
  blockedFailClosed: "selected_result_persistence_boundary_blocked_fail_closed",
});

export const SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET = Object.freeze({
  owner: "shell",
  targetKind: "project-envelope-summary-slot",
  envelopeOwner: "shell",
  moduleId: "cs_selector",
  slot: "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary",
  summaryOnly: true,
  redacted: true,
  runtimeDataTarget: false,
  boardDataTarget: false,
  donorDataTarget: false,
  runTableTarget: false,
  iesTarget: false,
});

export const SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES = Object.freeze([
  "raw-engine-payload",
  "raw-engine-result",
  "raw-selector-payload",
  "raw-selected-result-body-or-object",
  "raw-selected-payload",
  "raw-runtable-rows",
  "raw-ies-content",
  "raw-photometry-or-candela-arrays",
  "raw-source-db-rows",
  "exact-electrical-values",
  "private-local-paths",
  "credentials-or-secrets",
  "base64-artifacts",
  "donor-data-or-donor-engine-result",
  "runtime-data-mutation-targets",
  "board-data-mutation-targets",
  "routes-or-post-endpoints",
]);

export const SELECTED_RESULT_PERSISTENCE_ELIGIBLE_SUMMARY_FIELD_SET = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "targetKind",
  "moduleId",
  "state",
  "summaryOnly",
  "redacted",
  "acceptedSelectedResultAuthorityState",
  "selectedResultProjectionState",
  "safeSelectedResultSourceState",
  "selectedResultAuthorityGuardState",
  "selectedResultHandoffScaffoldState",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "acceptedSelectedResultAuthorityGateFingerprint",
  "selectedResultAuthorityGuardFingerprint",
  "selectedResultProjectionFingerprint",
  "safeSelectedResultSourceObjectFingerprint",
  "selectedResultHandoffScaffoldFingerprint",
  "persistenceBoundaryContractFingerprint",
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "iesGenerated",
  "iesGenerationEnabled",
  "outputGenerationEnabled",
  "runtimeDataMutationEnabled",
  "routesAdded",
  "postEndpointsAdded",
]);

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,560}$|^[0-9a-f]{32,128}$/i;

const UNSAFE_TRUE_KEYS = Object.freeze([
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "selectedResultStorageEnabled",
  "saveLoadActive",
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
  "donorEngineInvoked",
  "donorEngineInvocationEnabled",
  "donorEnginePayloadAssemblyEnabled",
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

function safeText(value, fallback = "", maxLength = 320) {
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
    "acceptedSelectedResultAuthorityGateFingerprint",
    "selectedResultAuthorityReadinessPreflightFingerprint",
    "selectedResultAuthorityGuardFingerprint",
    "selectedResultProjectionFingerprint",
    "safeSelectedResultSourceObjectFingerprint",
    "selectedResultHandoffScaffoldFingerprint",
    "sourceInputFingerprint",
    "source_input_fingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]) ?? firstPresent(value.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"]));
}

function fingerprintsFrom({ source = {}, gate = {}, guard = {}, projection = {}, sourceObject = {}, handoff = {} } = {}) {
  return {
    policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])
      ?? firstPresent(gate.fingerprints || {}, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(handoff, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(projection, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(sourceObject, ["policyFingerprint", "safePolicyFingerprint"])),
    sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])
      ?? firstPresent(gate.fingerprints || {}, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(handoff, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(projection, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"])),
    sourceInputFingerprint: safeFingerprint(firstPresent(source, ["sourceInputFingerprint", "currentSourceInputFingerprint"])
      ?? firstPresent(gate.fingerprints || {}, ["sourceInputFingerprint"])
      ?? firstPresent(projection, ["sourceInputFingerprint", "source_input_fingerprint"])
      ?? firstPresent(projection.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"])),
    sourceVersionFingerprint: safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(gate.fingerprints || {}, ["sourceVersionFingerprint"])
      ?? firstPresent(projection, ["boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(projection.boardDataSourceVersionMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceVersionMarker", "boardDataSourceVersion"])),
  };
}

function acceptedAuthorityReady(gate) {
  return isPlainObject(gate)
    && gate.state === "accepted_selected_result_authority"
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

function fingerprintAlignmentMismatch({ fingerprints = {}, projection = {}, sourceObject = {}, handoff = {} } = {}) {
  const checks = [
    ["projection policy", firstPresent(projection, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["projection source", firstPresent(projection, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["source-object policy", firstPresent(sourceObject, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["source-object source", firstPresent(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["handoff policy", firstPresent(handoff, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["handoff source", firstPresent(handoff, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
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

function buildReadiness({ gate, guard, projection, sourceObject, handoff, fingerprints, unsafe }) {
  const requirements = {};
  const missingRequirements = [];

  addRequirement(requirements, missingRequirements, "no-unsafe-raw-or-write-markers", !unsafe);
  addRequirement(requirements, missingRequirements, "accepted-selected-result-authority-established", acceptedAuthorityReady(gate));
  addRequirement(requirements, missingRequirements, "stale-and-fingerprint-comparison-clean", guardClean(guard, gate));
  addRequirement(requirements, missingRequirements, "selected-result-projection-summary-safe", projectionReady(projection));
  addRequirement(requirements, missingRequirements, "safe-selected-result-source-object-summary-safe", sourceObjectReady(sourceObject));
  addRequirement(requirements, missingRequirements, "selected-result-handoff-scaffold-ready", handoffReady(handoff));
  addRequirement(requirements, missingRequirements, "policy-fingerprint-present", Boolean(fingerprints.policyFingerprint));
  addRequirement(requirements, missingRequirements, "source-fingerprint-present", Boolean(fingerprints.sourceFingerprint));
  addRequirement(requirements, missingRequirements, "source-input-fingerprint-present", Boolean(fingerprints.sourceInputFingerprint));
  addRequirement(requirements, missingRequirements, "source-version-fingerprint-present", Boolean(fingerprints.sourceVersionFingerprint));
  addRequirement(requirements, missingRequirements, "safe-project-envelope-summary-slot-defined", true);
  addRequirement(requirements, missingRequirements, "eligible-redacted-persisted-summary-shape-defined", true);
  addRequirement(requirements, missingRequirements, "raw-field-redaction-boundary-defined", true);
  addRequirement(requirements, missingRequirements, "mutation-gate-defined-and-disabled", true);

  return {
    requirements,
    missingRequirements: [...new Set(missingRequirements)],
    contractReady: Object.values(requirements).every((ready) => ready === true),
  };
}

function eligiblePersistedSummaryShape() {
  return {
    schemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    targetKind: "project-envelope-summary-slot",
    moduleId: "cs_selector",
    summaryOnly: true,
    redacted: true,
    rawFieldsExcluded: true,
    allowedFields: [...SELECTED_RESULT_PERSISTENCE_ELIGIBLE_SUMMARY_FIELD_SET],
    requiredFields: [
      "schemaId",
      "schemaVersion",
      "owner",
      "targetKind",
      "moduleId",
      "summaryOnly",
      "redacted",
      "acceptedSelectedResultAuthorityState",
      "policyFingerprint",
      "sourceFingerprint",
      "sourceInputFingerprint",
      "sourceVersionFingerprint",
      "persistenceBoundaryContractFingerprint",
    ],
    requiredFalseFlags: [
      "selectedResultPersisted",
      "selectedResultPersistenceEnabled",
      "selectedResultPersistenceAttempted",
      "runTableGenerated",
      "runTableGenerationEnabled",
      "iesGenerated",
      "iesGenerationEnabled",
      "outputGenerationEnabled",
      "runtimeDataMutationEnabled",
      "routesAdded",
      "postEndpointsAdded",
    ],
    blockedRawFieldClasses: [...SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES],
  };
}

function disabledSafetyFlags(contractReady) {
  return {
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    persistenceBoundaryOnly: true,
    selectedResultPersistenceContractReady: contractReady,
    selectedResultPersistenceRedactionBoundaryReady: contractReady,
    selectedResultPersistenceMutationGateReady: contractReady,
    selectedResultPersistenceSafeTargetDefined: contractReady,
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
    ["persistence boundary state", state],
    ["selected-result persistence contract ready", readiness.contractReady ? "true" : "false"],
    ["safe future write target", "shell project-envelope summary slot"],
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
  const contractReady = state === SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.contractReady;
  const readiness = extra.readiness || { requirements: {}, missingRequirements: [], contractReady };
  const summaryFingerprints = clonePlain(extra.summaryFingerprints || {});
  const fingerprints = clonePlain(extra.fingerprints || {});
  const eligibleShape = eligiblePersistedSummaryShape();
  const fingerprint = stableFingerprint("safe-selected-result-persistence-boundary-contract", {
    state,
    reason,
    fingerprints,
    summaryFingerprints,
    safeWriteTarget: SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET,
    eligibleShape,
    missingRequirements: readiness.missingRequirements || [],
  });

  return Object.freeze({
    schemaId: SELECTED_RESULT_PERSISTENCE_BOUNDARY_CONTRACT_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_PERSISTENCE_BOUNDARY_CONTRACT_SCHEMA_VERSION,
    state,
    persistenceBoundaryState: state,
    selectedResultPersistenceContractReady: contractReady,
    selectedResultPersistenceRedactionBoundaryReady: contractReady,
    selectedResultPersistenceMutationGateReady: contractReady,
    selectedResultPersistenceSafeTargetDefined: contractReady,
    safeWriteTargetDefined: true,
    eligiblePersistedSummaryShapeDefined: true,
    redactionBoundaryDefined: true,
    mutationGateDefinedAndDisabled: true,
    failClosed: !contractReady,
    blocker: contractReady ? null : safeToken(readiness.missingRequirements?.[0], state),
    reason: safeText(reason, state, 360),
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    persistenceBoundaryOnly: true,
    safeWriteTarget: clonePlain(SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET),
    selectedResultPersistenceTargetSummary: {
      safeWriteTargetDefined: true,
      owner: "shell",
      targetKind: "project-envelope-summary-slot",
      moduleId: "cs_selector",
      runtimeDataTarget: false,
      boardDataTarget: false,
      donorDataTarget: false,
      runTableTarget: false,
      iesTarget: false,
    },
    eligiblePersistedSummaryShape: eligibleShape,
    blockedRawFieldClasses: [...SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES],
    requirements: clonePlain(readiness.requirements || {}),
    missingRequirements: Array.isArray(readiness.missingRequirements) ? [...readiness.missingRequirements] : [],
    acceptedSelectedResultAuthorityState: extra.acceptedAuthorityState || null,
    selectedResultAuthorityGuardState: extra.guardState || null,
    selectedResultProjectionState: extra.projectionState || null,
    safeSelectedResultSourceState: extra.safeSourceState || null,
    selectedResultHandoffScaffoldState: extra.handoffState || null,
    fingerprints,
    summaryFingerprints,
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
    safetyFlags: disabledSafetyFlags(contractReady),
    rows: rows({ state, readiness, reason: safeText(reason, state, 360) }),
    selectedResultPersistenceBoundaryContractFingerprint: fingerprint,
  });
}

export function buildSelectedResultPersistenceBoundaryContract(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const gate = summary(source, ["acceptedSelectedResultAuthorityGateSummary", "acceptedAuthorityGateSummary"]);
  const guard = summary(source, ["selectedResultAuthorityGuardSummary", "authorityGuardSummary"]);
  const projection = summary(source, ["selectedResultProjectionSummary", "selectedResultProjection"]);
  const sourceObject = summary(source, ["safeSelectedResultSourceObjectSummary", "safeSelectedResultSourceObject"]);
  const handoff = summary(source, ["selectedResultHandoffScaffoldSummary", "selectedResultHandoffSummary"]);

  const unsafe = hasUnsafeInput({
    ...source,
    acceptedSelectedResultAuthorityGateSummary: undefined,
    acceptedAuthorityGateSummary: undefined,
    selectedResultAuthorityGuardSummary: undefined,
    authorityGuardSummary: undefined,
    selectedResultProjectionSummary: undefined,
    selectedResultProjection: undefined,
    safeSelectedResultSourceObjectSummary: undefined,
    safeSelectedResultSourceObject: undefined,
    selectedResultHandoffScaffoldSummary: undefined,
    selectedResultHandoffSummary: undefined,
  }) || hasUnsafeInput(gate) || hasUnsafeInput(guard) || hasUnsafeInput(projection) || hasUnsafeInput(sourceObject) || hasUnsafeInput(handoff);

  const fingerprints = fingerprintsFrom({ source, gate, guard, projection, sourceObject, handoff });
  const summaryFingerprints = {
    acceptedSelectedResultAuthorityGate: fingerprintFromSummary(gate, ["acceptedSelectedResultAuthorityGateFingerprint"]),
    selectedResultAuthorityGuard: fingerprintFromSummary(guard, ["selectedResultAuthorityGuardFingerprint"]),
    selectedResultProjection: fingerprintFromSummary(projection, ["selectedResultProjectionFingerprint"]),
    safeSelectedResultSourceObject: fingerprintFromSummary(sourceObject, ["safeSelectedResultSourceObjectFingerprint"]),
    selectedResultHandoffScaffold: fingerprintFromSummary(handoff, ["selectedResultHandoffScaffoldFingerprint"]),
  };

  const alignmentMismatch = fingerprintAlignmentMismatch({ fingerprints, projection, sourceObject, handoff });
  const readiness = buildReadiness({ gate, guard, projection, sourceObject, handoff, fingerprints, unsafe: unsafe || alignmentMismatch });
  if (unsafe || alignmentMismatch) {
    const blocker = unsafe || alignmentMismatch;
    readiness.missingRequirements = [...new Set([
      `unsafe-input-rejected-${safeToken(blocker, "unsafe")}`,
      ...readiness.missingRequirements,
    ])];
    readiness.requirements["no-unsafe-raw-or-write-markers"] = false;
    readiness.contractReady = false;
    return result(
      SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.blockedFailClosed,
      `unsafe or mismatched input rejected: ${blocker}`,
      {
        readiness,
        fingerprints,
        summaryFingerprints,
        acceptedAuthorityState: safeToken(gate.state || gate.selectedResultAuthorityState, "not_compared_fail_closed"),
        guardState: safeToken(guard.state || guard.selectedResultAuthorityState, "not_compared_fail_closed"),
        projectionState: safeToken(projection.state || projection.resultState, "unknown"),
        safeSourceState: safeToken(sourceObject.state || (sourceObject.ok === true ? "safe-source-object-summary-ready" : "unknown"), "unknown"),
        handoffState: safeToken(handoff.state || (handoff.ok === true ? "selected-result-handoff-scaffold-ready" : "unknown"), "unknown"),
      },
    );
  }

  const state = readiness.contractReady
    ? SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.contractReady
    : SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.blockedFailClosed;
  const reason = readiness.contractReady
    ? "selected-result persistence boundary contract is frozen for a future shell-owned project-envelope summary slot only; real persistence, routes, outputs, RunTable, IES, RuntimeData mutation, and raw exposure remain disabled"
    : "selected-result persistence boundary contract is not ready; accepted authority, clean fingerprints/stale comparison, safe projection/source summaries, and handoff scaffold are required";

  return result(state, reason, {
    readiness,
    fingerprints,
    summaryFingerprints,
    acceptedAuthorityState: safeToken(gate.state || gate.selectedResultAuthorityState, "not_compared_fail_closed"),
    guardState: safeToken(guard.state || guard.selectedResultAuthorityState, "not_compared_fail_closed"),
    projectionState: safeToken(projection.state || projection.resultState, "unknown"),
    safeSourceState: safeToken(sourceObject.state || (sourceObject.ok === true ? "safe-source-object-summary-ready" : "unknown"), "unknown"),
    handoffState: safeToken(handoff.state || (handoff.ok === true ? "selected-result-handoff-scaffold-ready" : "unknown"), "unknown"),
  });
}

export const buildRuntimeSelectedResultPersistenceBoundaryContract = buildSelectedResultPersistenceBoundaryContract;
