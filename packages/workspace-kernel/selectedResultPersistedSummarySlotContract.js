import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
  SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET,
} from "./selectedResultPersistenceBoundaryContract.js";
import { SAVED_PROJECT_SCHEMA } from "./projectEnvelope.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_CONTRACT_SCHEMA_ID =
  "controlstack.runtime.selected-result-persisted-summary-slot-contract.v1";
export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_CONTRACT_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID =
  "controlstack.runtime.selected-result-persisted-summary-slot.v1";
export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES = Object.freeze({
  contractReady: "selected_result_persisted_summary_slot_contract_ready",
  blockedFailClosed: "selected_result_persisted_summary_slot_contract_blocked_fail_closed",
});

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET = Object.freeze({
  owner: "shell",
  slotOwner: "shell",
  envelopeOwner: "shell",
  envelopeSchema: SAVED_PROJECT_SCHEMA,
  moduleId: "cs_selector",
  targetKind: "project-envelope-module-downstream-context-summary-slot",
  targetLocation: "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary",
  envelopePath: "modules.cs_selector.downstreamContext.selectedResultSummary",
  parentEnvelopePath: "modules.cs_selector.downstreamContext",
  statusPath: "modules.cs_selector.status",
  statePath: "modules.cs_selector.state",
  summaryOnly: true,
  redacted: true,
  machineValueSafe: true,
  runtimeDataTarget: false,
  boardDataTarget: false,
  donorDataTarget: false,
  runTableTarget: false,
  iesTarget: false,
  outputTarget: false,
  routeTarget: false,
  postEndpointTarget: false,
});

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET = Object.freeze([
  "schemaId",
  "schemaVersion",
  "slotSchemaId",
  "slotSchemaVersion",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "state",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "selectedResultAuthorityGuardState",
  "selectedResultProjectionState",
  "safeSelectedResultSourceState",
  "selectedResultHandoffScaffoldState",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "acceptedSelectedResultAuthorityGateFingerprint",
  "selectedResultPersistenceAuthorityPreflightFingerprint",
  "selectedResultPersistenceBoundaryContractFingerprint",
  "selectedResultOutputReadinessPreflightFingerprint",
  "selectedResultAuthorityGuardFingerprint",
  "selectedResultProjectionFingerprint",
  "safeSelectedResultSourceObjectFingerprint",
  "selectedResultHandoffScaffoldFingerprint",
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "selectedResultPersistenceWriteHookAdded",
  "projectWriteEnabled",
  "runtimeDataMutationEnabled",
  "boardDataMutationEnabled",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "iesGenerated",
  "iesGenerationEnabled",
  "outputGenerationEnabled",
  "routesAdded",
  "postEndpointsAdded",
]);

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "slotSchemaId",
  "slotSchemaVersion",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "selectedResultPersistenceAuthorityPreflightFingerprint",
  "selectedResultPersistenceBoundaryContractFingerprint",
]);

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS = Object.freeze([
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "selectedResultPersistenceWriteHookAdded",
  "projectWriteEnabled",
  "runtimeDataMutationEnabled",
  "boardDataMutationEnabled",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "iesGenerated",
  "iesGenerationEnabled",
  "outputGenerationEnabled",
  "routesAdded",
  "postEndpointsAdded",
]);

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_AUTHORITY_PREREQUISITES = Object.freeze([
  "accepted-selected-result-authority-ready",
  "selected-result-persistence-authority-preflight-ready",
  "selected-result-persistence-boundary-contract-ready",
  "selected-result-output-readiness-preflight-ready-for-persistence",
  "shell-project-envelope-slot-target-defined",
]);

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_FINGERPRINT_PREREQUISITES = Object.freeze([
  "policy-fingerprint-present",
  "source-fingerprint-present",
  "source-input-fingerprint-present",
  "source-version-fingerprint-present",
  "persistence-authority-preflight-fingerprint-present",
  "persistence-boundary-contract-fingerprint-present",
  "persistence-authority-and-boundary-fingerprints-aligned",
]);

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STALE_CLEAN_PREREQUISITES = Object.freeze([
  "selected-result-authority-guard-clean",
  "stale-comparison-clean",
  "no-fingerprint-mismatch",
]);

export const SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ROLLBACK_POLICY = Object.freeze({
  owner: "shell",
  rollbackRequired: true,
  failClosedBeforeWrite: true,
  noPartialSlotWrite: true,
  preservePreviousEnvelopeOnFailure: true,
  preservePreviousSlotOnFailure: true,
  transactionRequiredForFutureWrite: true,
  futureWriteFailureState: "selected_result_persisted_summary_slot_write_rolled_back_fail_closed",
  futureWriteFailurePersistenceAttempted: true,
  currentContractPersistenceAttempted: false,
  currentContractWriteEnabled: false,
  reason: "Future shell envelope persistence must validate the redacted summary, write atomically to the selectedResultSummary slot, and roll back to the previous envelope/slot on failure. This contract step performs no write.",
});

const READY_PERSISTENCE_AUTHORITY_STATE = "ready_for_persistence_authority";
const READY_BOUNDARY_STATE = "selected_result_persistence_boundary_contract_ready";
const ACCEPTED_AUTHORITY_STATE = "accepted_selected_result_authority";
const OUTPUT_PREFLIGHT_READY_STATE = "selected_result_output_readiness_ready_for_persistence";

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,600}$|^[0-9a-f]{32,128}$/i;

const UNSAFE_TRUE_KEYS = Object.freeze([
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "selectedResultPersistenceImplementationAllowed",
  "selectedResultPersistenceWriteHookAdded",
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

function safeText(value, fallback = "", maxLength = 380) {
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
  const token = safeToken(value, "", 640);
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

function fingerprintValue(summaryObject, directAliases, nestedAliases = directAliases) {
  return safeFingerprint(firstPresent(summaryObject, directAliases)
    ?? firstPresent(summaryObject.fingerprints || {}, nestedAliases));
}

function fingerprintFromSummary(summaryObject, directAliases) {
  return fingerprintValue(summaryObject, [
    ...directAliases,
    "selectedResultPersistenceAuthorityPreflightFingerprint",
    "selectedResultPersistenceBoundaryContractFingerprint",
    "selectedResultOutputReadinessPreflightFingerprint",
    "acceptedSelectedResultAuthorityGateFingerprint",
    "selectedResultAuthorityGuardFingerprint",
    "selectedResultProjectionFingerprint",
    "safeSelectedResultSourceObjectFingerprint",
    "selectedResultHandoffScaffoldFingerprint",
    "fingerprint",
  ]);
}

function fingerprintsFrom({ source = {}, authority = {}, boundary = {} } = {}) {
  return {
    policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])
      ?? fingerprintValue(authority, ["policyFingerprint", "safePolicyFingerprint"])
      ?? fingerprintValue(boundary, ["policyFingerprint", "safePolicyFingerprint"])),
    sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])
      ?? fingerprintValue(authority, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? fingerprintValue(boundary, ["sourceFingerprint", "safeSourceFingerprint"])),
    sourceInputFingerprint: safeFingerprint(firstPresent(source, ["sourceInputFingerprint", "currentSourceInputFingerprint"])
      ?? fingerprintValue(authority, ["sourceInputFingerprint"])
      ?? fingerprintValue(boundary, ["sourceInputFingerprint"])),
    sourceVersionFingerprint: safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? fingerprintValue(authority, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? fingerprintValue(boundary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])),
  };
}

function authorityPreflightReady(authority) {
  return isPlainObject(authority)
    && authority.state === READY_PERSISTENCE_AUTHORITY_STATE
    && authority.persistenceAuthorityPreflightState === READY_PERSISTENCE_AUTHORITY_STATE
    && authority.readyForPersistenceAuthority === true
    && authority.acceptedSelectedResultAuthorityState === ACCEPTED_AUTHORITY_STATE
    && authority.acceptedSelectedResultAuthorityReady === true
    && authority.selectedResultPersistenceBoundaryContractReady === true
    && authority.selectedResultOutputReadinessPreflightReadyForPersistence === true
    && authority.failClosed === false
    && authority.readOnly === true
    && authority.preflightOnly === true
    && authority.safeSummaryOnly === true
    && authority.selectedResultPersisted !== true
    && authority.selectedResultPersistenceEnabled !== true
    && authority.selectedResultPersistenceAttempted !== true
    && authority.selectedResultPersistenceImplementationAllowed !== true
    && authority.selectedResultPersistenceWriteHookAdded !== true
    && authority.projectWriteEnabled !== true
    && authority.runtimeDataMutationEnabled !== true
    && authority.runTableGenerationEnabled !== true
    && authority.runTableGenerated !== true
    && authority.iesGenerationEnabled !== true
    && authority.iesGenerated !== true
    && authority.outputGenerationEnabled !== true
    && authority.routesAdded !== true
    && authority.postEndpointsAdded !== true;
}

function boundaryContractReady(boundary) {
  const target = isPlainObject(boundary.safeWriteTarget)
    ? boundary.safeWriteTarget
    : isPlainObject(boundary.selectedResultPersistenceTargetSummary)
      ? boundary.selectedResultPersistenceTargetSummary
      : {};
  const shape = isPlainObject(boundary.eligiblePersistedSummaryShape) ? boundary.eligiblePersistedSummaryShape : {};
  return isPlainObject(boundary)
    && boundary.state === READY_BOUNDARY_STATE
    && boundary.selectedResultPersistenceContractReady === true
    && boundary.selectedResultPersistenceRedactionBoundaryReady === true
    && boundary.selectedResultPersistenceMutationGateReady === true
    && boundary.selectedResultPersistenceSafeTargetDefined === true
    && boundary.safeWriteTargetDefined === true
    && boundary.failClosed === false
    && boundary.readOnly === true
    && boundary.contractOnly === true
    && boundary.safeSummaryOnly === true
    && target.owner === SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET.owner
    && target.targetKind === SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET.targetKind
    && target.moduleId === SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET.moduleId
    && target.runtimeDataTarget !== true
    && target.boardDataTarget !== true
    && target.donorDataTarget !== true
    && target.runTableTarget !== true
    && target.iesTarget !== true
    && shape.schemaId === PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID
    && shape.schemaVersion === PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION
    && shape.summaryOnly === true
    && shape.redacted === true
    && Array.isArray(shape.blockedRawFieldClasses)
    && shape.blockedRawFieldClasses.length > 0
    && boundary.selectedResultPersisted !== true
    && boundary.selectedResultPersistenceEnabled !== true
    && boundary.selectedResultPersistenceAttempted !== true
    && boundary.selectedResultPersistenceWriteHookAdded !== true
    && boundary.projectWriteEnabled !== true
    && boundary.runtimeDataMutationEnabled !== true
    && boundary.runTableGenerationEnabled !== true
    && boundary.runTableGenerated !== true
    && boundary.iesGenerationEnabled !== true
    && boundary.iesGenerated !== true
    && boundary.outputGenerationEnabled !== true
    && boundary.routesAdded !== true
    && boundary.postEndpointsAdded !== true;
}

function outputPreflightStateReady(authority) {
  const state = safeToken(
    authority.selectedResultOutputReadinessPreflightState
      || authority.outputPreflightState
      || authority.summaryFingerprints?.selectedResultOutputReadinessPreflight,
    "unknown",
  );
  return authority.selectedResultOutputReadinessPreflightReadyForPersistence === true
    && state !== "not_ready"
    && state !== "blocked_fail_closed"
    && state !== "unknown";
}

function staleClean(authority) {
  const requirements = isPlainObject(authority.requirements) ? authority.requirements : {};
  return requirements["selected-result-authority-guard-clean"] === true
    && (requirements["selected-result-output-readiness-preflight-ready-for-persistence"] === true
      || authority.selectedResultOutputReadinessPreflightReadyForPersistence === true)
    && !authority.missingRequirements?.includes?.("selected-result-authority-guard-clean");
}

function slotTargetMatchesBoundary() {
  return SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.owner === SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET.owner
    && SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.moduleId === SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET.moduleId
    && SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetLocation === SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET.slot
    && SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.runtimeDataTarget === false
    && SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.boardDataTarget === false
    && SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.donorDataTarget === false;
}

function fingerprintAlignmentMismatch({ fingerprints = {}, authority = {}, boundary = {} } = {}) {
  const checks = [
    ["persistence-authority policy", fingerprintValue(authority, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["persistence-authority source", fingerprintValue(authority, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["persistence-authority source input", fingerprintValue(authority, ["sourceInputFingerprint"]), fingerprints.sourceInputFingerprint],
    ["persistence-authority source version", fingerprintValue(authority, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]), fingerprints.sourceVersionFingerprint],
    ["persistence-boundary policy", fingerprintValue(boundary, ["policyFingerprint", "safePolicyFingerprint"]), fingerprints.policyFingerprint],
    ["persistence-boundary source", fingerprintValue(boundary, ["sourceFingerprint", "safeSourceFingerprint"]), fingerprints.sourceFingerprint],
    ["persistence-boundary source input", fingerprintValue(boundary, ["sourceInputFingerprint"]), fingerprints.sourceInputFingerprint],
    ["persistence-boundary source version", fingerprintValue(boundary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]), fingerprints.sourceVersionFingerprint],
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

function buildReadiness({ authority, boundary, fingerprints, summaryFingerprints, unsafe }) {
  const requirements = {};
  const missingRequirements = [];

  addRequirement(requirements, missingRequirements, "no-unsafe-raw-or-write-markers", !unsafe);
  addRequirement(requirements, missingRequirements, "accepted-selected-result-authority-ready", authority.acceptedSelectedResultAuthorityReady === true);
  addRequirement(requirements, missingRequirements, "selected-result-persistence-authority-preflight-ready", authorityPreflightReady(authority));
  addRequirement(requirements, missingRequirements, "selected-result-persistence-boundary-contract-ready", boundaryContractReady(boundary));
  addRequirement(requirements, missingRequirements, "selected-result-output-readiness-preflight-ready-for-persistence", outputPreflightStateReady(authority));
  addRequirement(requirements, missingRequirements, "selected-result-authority-guard-clean", staleClean(authority));
  addRequirement(requirements, missingRequirements, "stale-comparison-clean", staleClean(authority));
  addRequirement(requirements, missingRequirements, "no-fingerprint-mismatch", !unsafe);
  addRequirement(requirements, missingRequirements, "shell-project-envelope-slot-target-defined", slotTargetMatchesBoundary());
  addRequirement(requirements, missingRequirements, "eligible-redacted-persisted-summary-slot-shape-defined", true);
  addRequirement(requirements, missingRequirements, "rollback-fail-closed-policy-defined", true);
  addRequirement(requirements, missingRequirements, "write-remains-disabled", true);
  addRequirement(requirements, missingRequirements, "persistence-attempt-remains-false", true);
  addRequirement(requirements, missingRequirements, "policy-fingerprint-present", Boolean(fingerprints.policyFingerprint));
  addRequirement(requirements, missingRequirements, "source-fingerprint-present", Boolean(fingerprints.sourceFingerprint));
  addRequirement(requirements, missingRequirements, "source-input-fingerprint-present", Boolean(fingerprints.sourceInputFingerprint));
  addRequirement(requirements, missingRequirements, "source-version-fingerprint-present", Boolean(fingerprints.sourceVersionFingerprint));
  addRequirement(requirements, missingRequirements, "persistence-authority-preflight-fingerprint-present", Boolean(summaryFingerprints.selectedResultPersistenceAuthorityPreflight));
  addRequirement(requirements, missingRequirements, "persistence-boundary-contract-fingerprint-present", Boolean(summaryFingerprints.selectedResultPersistenceBoundaryContract));
  addRequirement(requirements, missingRequirements, "persistence-authority-and-boundary-fingerprints-aligned", !unsafe);

  return {
    requirements,
    missingRequirements: [...new Set(missingRequirements)],
    contractReady: Object.values(requirements).every((ready) => ready === true),
  };
}

function eligiblePersistedSummarySlotShape() {
  return {
    schemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    slotSchemaId: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
    slotSchemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetKind,
    moduleId: "cs_selector",
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    rawFieldsExcluded: true,
    allowedFields: [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET],
    requiredFields: [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS],
    requiredFalseFlags: [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS],
    blockedRawFieldClasses: [...SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES],
  };
}

function disabledSafetyFlags(contractReady) {
  return {
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    slotContractOnly: true,
    selectedResultPersistedSummarySlotContractReady: contractReady,
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
    ["persisted summary slot contract state", state],
    ["slot contract ready", readiness.contractReady ? "true" : "false"],
    ["future write target", SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetLocation],
    ["slot owner", "shell"],
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
  const contractReady = state === SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.contractReady;
  const readiness = extra.readiness || { requirements: {}, missingRequirements: [], contractReady };
  const fingerprints = clonePlain(extra.fingerprints || {});
  const summaryFingerprints = clonePlain(extra.summaryFingerprints || {});
  const eligibleShape = eligiblePersistedSummarySlotShape();
  const contractFingerprint = stableFingerprint("safe-selected-result-persisted-summary-slot-contract", {
    state,
    reason,
    target: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET,
    eligibleShape,
    fingerprints,
    summaryFingerprints,
    missingRequirements: readiness.missingRequirements || [],
    rollbackPolicy: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ROLLBACK_POLICY,
  });

  return Object.freeze({
    schemaId: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_CONTRACT_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_CONTRACT_SCHEMA_VERSION,
    slotSchemaId: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
    slotSchemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
    persistedSummarySchemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    persistedSummarySchemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    state,
    persistedSummarySlotContractState: state,
    selectedResultPersistedSummarySlotContractReady: contractReady,
    failClosed: !contractReady,
    blocker: contractReady ? null : safeToken(readiness.missingRequirements?.[0], state),
    reason: safeText(reason, state, 420),
    owner: "shell",
    slotOwner: "shell",
    moduleId: "cs_selector",
    targetKind: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetKind,
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    slotContractOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    shellOwned: true,
    runtimeOwned: false,
    runtimeDataTarget: false,
    boardDataTarget: false,
    donorDataTarget: false,
    runTableTarget: false,
    iesTarget: false,
    outputTarget: false,
    routeTarget: false,
    postEndpointTarget: false,
    slotTarget: clonePlain(SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET),
    writeTarget: clonePlain(SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET),
    eligiblePersistedSummaryShape: eligibleShape,
    eligiblePersistedSummaryFieldSet: [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET],
    blockedRawFieldClasses: [...SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES],
    authorityPrerequisites: [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_AUTHORITY_PREREQUISITES],
    fingerprintPrerequisites: [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_FINGERPRINT_PREREQUISITES],
    staleCleanPrerequisites: [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STALE_CLEAN_PREREQUISITES],
    rollbackPolicy: clonePlain(SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ROLLBACK_POLICY),
    requirements: clonePlain(readiness.requirements || {}),
    missingRequirements: Array.isArray(readiness.missingRequirements) ? [...readiness.missingRequirements] : [],
    acceptedSelectedResultAuthorityState: extra.acceptedAuthorityState || null,
    selectedResultPersistenceAuthorityPreflightState: extra.persistenceAuthorityPreflightState || null,
    selectedResultPersistenceBoundaryState: extra.persistenceBoundaryState || null,
    selectedResultOutputReadinessPreflightState: extra.outputPreflightState || null,
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
    rows: rows({ state, readiness, reason: safeText(reason, state, 420) }),
    selectedResultPersistedSummarySlotContractFingerprint: contractFingerprint,
  });
}

export function buildSelectedResultPersistedSummarySlotContract(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const authority = summary(source, [
    "selectedResultPersistenceAuthorityPreflightSummary",
    "persistenceAuthorityPreflightSummary",
  ]);
  const boundary = summary(source, [
    "selectedResultPersistenceBoundaryContractSummary",
    "persistenceBoundaryContractSummary",
  ]);

  const unsafe = hasUnsafeInput({
    ...source,
    selectedResultPersistenceAuthorityPreflightSummary: undefined,
    persistenceAuthorityPreflightSummary: undefined,
    selectedResultPersistenceBoundaryContractSummary: undefined,
    persistenceBoundaryContractSummary: undefined,
  }) || hasUnsafeInput(authority) || hasUnsafeInput(boundary);

  const fingerprints = fingerprintsFrom({ source, authority, boundary });
  const summaryFingerprints = {
    selectedResultPersistenceAuthorityPreflight: fingerprintFromSummary(authority, ["selectedResultPersistenceAuthorityPreflightFingerprint"]),
    selectedResultPersistenceBoundaryContract: fingerprintFromSummary(boundary, ["selectedResultPersistenceBoundaryContractFingerprint"]),
    selectedResultOutputReadinessPreflight: fingerprintFromSummary(authority, ["selectedResultOutputReadinessPreflightFingerprint"]),
    acceptedSelectedResultAuthorityGate: fingerprintFromSummary(authority, ["acceptedSelectedResultAuthorityGateFingerprint"]),
    selectedResultAuthorityGuard: fingerprintFromSummary(authority, ["selectedResultAuthorityGuardFingerprint"]),
    selectedResultProjection: fingerprintFromSummary(authority, ["selectedResultProjectionFingerprint"]),
    safeSelectedResultSourceObject: fingerprintFromSummary(authority, ["safeSelectedResultSourceObjectFingerprint"]),
    selectedResultHandoffScaffold: fingerprintFromSummary(authority, ["selectedResultHandoffScaffoldFingerprint"]),
  };

  const alignmentMismatch = fingerprintAlignmentMismatch({ fingerprints, authority, boundary });
  const unsafeOrMismatch = unsafe || alignmentMismatch;
  const readiness = buildReadiness({
    authority,
    boundary,
    fingerprints,
    summaryFingerprints,
    unsafe: unsafeOrMismatch,
  });

  const common = {
    readiness,
    fingerprints,
    summaryFingerprints,
    acceptedAuthorityState: safeToken(authority.acceptedSelectedResultAuthorityState, "unknown"),
    persistenceAuthorityPreflightState: safeToken(authority.state || authority.persistenceAuthorityPreflightState, "unknown"),
    persistenceBoundaryState: safeToken(boundary.state || boundary.persistenceBoundaryState, "unknown"),
    outputPreflightState: safeToken(authority.selectedResultOutputReadinessPreflightState || OUTPUT_PREFLIGHT_READY_STATE, "unknown"),
  };

  if (unsafeOrMismatch) {
    const blocker = unsafeOrMismatch;
    readiness.missingRequirements = [...new Set([
      `unsafe-input-rejected-${safeToken(blocker, "unsafe")}`,
      ...readiness.missingRequirements,
    ])];
    readiness.requirements["no-unsafe-raw-or-write-markers"] = false;
    readiness.requirements["no-fingerprint-mismatch"] = false;
    readiness.requirements["persistence-authority-and-boundary-fingerprints-aligned"] = false;
    readiness.contractReady = false;
    return result(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed,
      `unsafe or mismatched input rejected before persisted summary slot eligibility: ${blocker}`,
      common,
    );
  }

  if (readiness.contractReady !== true) {
    return result(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed,
      "selected-result persisted-summary slot contract is not ready; persistence authority preflight, boundary contract, clean stale/fingerprint state, shell envelope target, and redacted summary shape are required",
      common,
    );
  }

  return result(
    SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.contractReady,
    "shell-owned persisted selected-result summary slot contract is frozen for a future project-envelope selectedResultSummary write only; this step performs no write and keeps persistence attempts, RuntimeData mutation, RunTable, IES, outputs, routes, and POST endpoints disabled",
    common,
  );
}

export const buildRuntimeSelectedResultPersistedSummarySlotContract = buildSelectedResultPersistedSummarySlotContract;
