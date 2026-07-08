import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
} from "./selectedResultPersistenceBoundaryContract.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_ID =
  "controlstack.runtime.runtable-first-narrow-output-handoff-contract.v1";
export const RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_VERSION = 1;

export const RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.runtable-first-narrow-output-handoff-summary.v1";
export const RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION = 1;

export const RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES = Object.freeze({
  contractReady: "runtable_first_narrow_output_handoff_contract_ready",
  blockedFailClosed: "runtable_first_narrow_output_handoff_contract_blocked_fail_closed",
});

export const RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES = Object.freeze([
  "selected-result-persisted-summary-present",
  "selected-result-persisted-summary-schema-valid",
  "selected-result-persisted-summary-slot-contract-ready",
  "selected-result-persistence-write-complete",
  "persisted-summary-is-redacted",
  "persisted-summary-is-machine-value-safe",
  "persisted-summary-is-summary-only",
  "persisted-summary-has-no-raw-run-table-rows",
  "persisted-summary-has-no-raw-engine-payload",
  "policy-fingerprint-present",
  "source-fingerprint-present",
  "source-input-fingerprint-present",
  "source-version-fingerprint-present",
  "persisted-selected-result-summary-fingerprint-present",
  "fingerprints-aligned",
  "run-table-generation-remains-disabled",
  "output-generation-remains-disabled",
  "routes-remain-disabled",
  "post-endpoints-remain-disabled",
  "mutation-remains-disabled",
]);

export const RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS = Object.freeze([
  "runTableGenerated",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "productionRunTableGenerated",
  "productionRunTableGenerationEnabled",
  "runTableRowsReturned",
  "rawRunTableRowsReturned",
  "runTableRowsPersisted",
  "runTableOutputPersisted",
  "runTableOutputHandoffWritten",
  "runTableOutputHandoffWriteEnabled",
  "runTableOutputHandoffAttempted",
  "iesGenerated",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "outputGenerated",
  "outputGenerationEnabled",
  "drawingGenerationEnabled",
  "photometryGenerationEnabled",
  "routesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "projectWriteEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
  "donorDataMutationEnabled",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawSelectorPayloadReturned",
  "rawSelectedPayloadReturned",
  "rawRunTableRowsReturned",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "privatePathsReturned",
  "credentialsReturned",
]);

const BLOCKED_RAW_FIELD_CLASSES = Object.freeze([
  ...SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
  "raw-runtable-output-handoff-rows",
  "production-runtable-generation",
  "output-generation-flags",
]);

const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,700}$|^[0-9a-f]{32,128}$/i;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const RAW_ROW_KEYS = Object.freeze(["rows", "runTableRows", "rawRunTableRows", "rawRows", "rawProductRows", "rawBoardRows", "rawDriverRows", "rawAccessoryRows"]);
const RAW_PAYLOAD_KEYS = Object.freeze([
  "enginePayload",
  "rawEnginePayload",
  "raw_engine_payload",
  "engineResult",
  "rawEngineResult",
  "raw_engine_result",
  "resultBody",
  "selectedResultBody",
  "selected_result_body",
  "selectedResultObject",
  "selectedResultPayload",
  "rawSelectedPayload",
  "selectorPayload",
  "rawSelectorPayload",
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

function safeText(value, fallback = "", maxLength = 420) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function safeToken(value, fallback = "", maxLength = 220) {
  const text = safeText(value, fallback, maxLength);
  if (!text) return fallback;
  return text
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength) || fallback;
}

function safeFingerprint(value) {
  const token = safeToken(value, "", 760);
  return token && SAFE_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function canonicalFingerprint(value) {
  const fingerprint = safeFingerprint(value);
  return fingerprint ? fingerprint.toLowerCase().replace(/[-_:]+/g, ":") : null;
}

function fingerprintsDiffer(left, right) {
  const a = canonicalFingerprint(left);
  const b = canonicalFingerprint(right);
  return Boolean(a && b && a !== b);
}

function getPersistedSummary(source) {
  for (const candidate of [
    source.persistedSelectedResultSummary,
    source.selectedResultPersistedSummary,
    source.selectedResultSummary,
    source.projectEnvelope?.modules?.cs_selector?.downstreamContext?.selectedResultSummary,
    source.envelope?.modules?.cs_selector?.downstreamContext?.selectedResultSummary,
  ]) {
    if (isPlainObject(candidate)) return candidate;
  }
  return {};
}

function scanRawRows(value, depth = 0, seen = new Set()) {
  if (depth > 8) return null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = scanRawRows(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (RAW_ROW_KEYS.includes(key) && Array.isArray(nested) && nested.length > 0) return `raw-runtable-rows-${safeToken(key, "rows")}`;
    const child = scanRawRows(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function scanRawPayload(value, depth = 0, seen = new Set()) {
  if (depth > 8) return null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = scanRawPayload(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (RAW_PAYLOAD_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) return `raw-payload-${safeToken(key, "payload")}`;
    const child = scanRawPayload(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function scanUnsafeFlags(value, depth = 0, seen = new Set()) {
  if (depth > 8) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "private-path-not-approved" : null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = scanUnsafeFlags(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.includes(key) && nested === true) return `unsafe-true-flag-${safeToken(key, "flag")}`;
    const child = scanUnsafeFlags(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function fingerprintValues(source, persistedSummary) {
  const nested = isPlainObject(source.fingerprints) ? source.fingerprints : {};
  const summaryFingerprints = isPlainObject(source.summaryFingerprints) ? source.summaryFingerprints : {};
  return {
    policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]) ?? firstPresent(nested, ["policyFingerprint", "safePolicyFingerprint"]) ?? firstPresent(persistedSummary, ["policyFingerprint", "safePolicyFingerprint"])),
    sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]) ?? firstPresent(nested, ["sourceFingerprint", "safeSourceFingerprint"]) ?? firstPresent(persistedSummary, ["sourceFingerprint", "safeSourceFingerprint"])),
    sourceInputFingerprint: safeFingerprint(firstPresent(source, ["sourceInputFingerprint"]) ?? firstPresent(nested, ["sourceInputFingerprint"]) ?? firstPresent(persistedSummary, ["sourceInputFingerprint"])),
    sourceVersionFingerprint: safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]) ?? firstPresent(nested, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]) ?? firstPresent(persistedSummary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])),
    persistedSelectedResultSummaryFingerprint: safeFingerprint(firstPresent(source, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint"]) ?? firstPresent(persistedSummary, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint", "summaryFingerprint", "fingerprint"])) || stableFingerprint("safe-persisted-selected-result-summary", persistedSummary),
    selectedResultPersistedSummarySlotContractFingerprint: safeFingerprint(firstPresent(source, ["selectedResultPersistedSummarySlotContractFingerprint", "persistedSummarySlotContractFingerprint"]) ?? firstPresent(summaryFingerprints, ["selectedResultPersistedSummarySlotContract", "selectedResultPersistedSummarySlotContractFingerprint"]) ?? firstPresent(persistedSummary, ["selectedResultPersistedSummarySlotContractFingerprint", "persistedSummarySlotContractFingerprint"])),
  };
}

function fingerprintMismatch(source, persistedSummary, fingerprints) {
  const checks = [
    ["policy", firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]), persistedSummary.policyFingerprint],
    ["source", firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]), persistedSummary.sourceFingerprint],
    ["source input", firstPresent(source, ["sourceInputFingerprint"]), persistedSummary.sourceInputFingerprint],
    ["source version", firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]), firstPresent(persistedSummary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])],
    ["persisted summary", firstPresent(source, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint"]), fingerprints.persistedSelectedResultSummaryFingerprint],
  ];
  for (const [label, left, right] of checks) {
    if (fingerprintsDiffer(left, right)) return `${label} fingerprint mismatch`;
  }
  return null;
}

function addRequirement(requirements, missingRequirements, key, ready) {
  requirements[key] = ready === true;
  if (ready !== true) missingRequirements.push(key);
}

function buildRequirements(source, persistedSummary, fingerprints) {
  const requirements = {};
  const missingRequirements = [];
  const present = isPlainObject(persistedSummary) && Object.keys(persistedSummary).length > 0;
  const routeGate = source.routesAdded !== true && source.publicRouteAdded !== true && source.postEndpointsAdded !== true && source.postEndpointAdded !== true && persistedSummary.routesAdded !== true && persistedSummary.publicRouteAdded !== true && persistedSummary.postEndpointsAdded !== true && persistedSummary.postEndpointAdded !== true;
  const mutationGate = source.projectWriteEnabled !== true && source.runtimeDataMutationEnabled !== true && source.runtimeDataMutated !== true && source.boardDataMutationEnabled !== true && source.donorDataMutationEnabled !== true && persistedSummary.projectWriteEnabled !== true && persistedSummary.runtimeDataMutationEnabled !== true && persistedSummary.runtimeDataMutated !== true && persistedSummary.boardDataMutationEnabled !== true && persistedSummary.donorDataMutationEnabled !== true;
  const flagsBlocker = scanUnsafeFlags({ source, persistedSummary });
  const rawRowsBlocker = scanRawRows(persistedSummary);
  const rawPayloadBlocker = scanRawPayload(persistedSummary);
  const mismatch = fingerprintMismatch(source, persistedSummary, fingerprints);

  addRequirement(requirements, missingRequirements, "selected-result-persisted-summary-present", present);
  addRequirement(requirements, missingRequirements, "selected-result-persisted-summary-schema-valid", present && persistedSummary.schemaId === PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID && persistedSummary.schemaVersion === PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION);
  addRequirement(requirements, missingRequirements, "selected-result-persisted-summary-slot-contract-ready", source.selectedResultPersistedSummarySlotContractReady === true || persistedSummary.selectedResultPersistedSummarySlotContractReady === true || source.slotContractReady === true);
  addRequirement(requirements, missingRequirements, "selected-result-persistence-write-complete", source.selectedResultPersisted === true || source.selectedResultPersistedSummaryWritten === true || source.selectedResultPersistenceWriteComplete === true || persistedSummary.selectedResultPersisted === true);
  addRequirement(requirements, missingRequirements, "persisted-summary-is-redacted", persistedSummary.redacted === true);
  addRequirement(requirements, missingRequirements, "persisted-summary-is-machine-value-safe", persistedSummary.machineValueSafe === true);
  addRequirement(requirements, missingRequirements, "persisted-summary-is-summary-only", persistedSummary.summaryOnly === true || persistedSummary.safeSummaryOnly === true);
  addRequirement(requirements, missingRequirements, "persisted-summary-has-no-raw-run-table-rows", !rawRowsBlocker);
  addRequirement(requirements, missingRequirements, "persisted-summary-has-no-raw-engine-payload", !rawPayloadBlocker);
  addRequirement(requirements, missingRequirements, "policy-fingerprint-present", Boolean(fingerprints.policyFingerprint));
  addRequirement(requirements, missingRequirements, "source-fingerprint-present", Boolean(fingerprints.sourceFingerprint));
  addRequirement(requirements, missingRequirements, "source-input-fingerprint-present", Boolean(fingerprints.sourceInputFingerprint));
  addRequirement(requirements, missingRequirements, "source-version-fingerprint-present", Boolean(fingerprints.sourceVersionFingerprint));
  addRequirement(requirements, missingRequirements, "persisted-selected-result-summary-fingerprint-present", Boolean(fingerprints.persistedSelectedResultSummaryFingerprint));
  addRequirement(requirements, missingRequirements, "fingerprints-aligned", !mismatch);
  addRequirement(requirements, missingRequirements, "run-table-generation-remains-disabled", !flagsBlocker);
  addRequirement(requirements, missingRequirements, "output-generation-remains-disabled", !flagsBlocker);
  addRequirement(requirements, missingRequirements, "routes-remain-disabled", routeGate);
  addRequirement(requirements, missingRequirements, "post-endpoints-remain-disabled", routeGate);
  addRequirement(requirements, missingRequirements, "mutation-remains-disabled", mutationGate);

  const blocker = rawRowsBlocker || rawPayloadBlocker || flagsBlocker || mismatch;
  if (blocker) missingRequirements.unshift(`unsafe-input-rejected-${safeToken(blocker, "unsafe")}`);
  return {
    requirements,
    missingRequirements: [...new Set(missingRequirements)],
    contractReady: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES.every((key) => requirements[key] === true),
  };
}

function eligibleHandoffSummaryShape() {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceKind: "persisted-selected-result-summary",
    futureOutputKind: "runtable-first-narrow-output",
    rowsIncluded: false,
    rowCount: 0,
    generated: false,
    generationEnabled: false,
    persisted: false,
    routeAdded: false,
    postEndpointAdded: false,
  };
}

function disabledSafetyFlags() {
  const flags = { readOnly: true, contractOnly: true, diagnosticOnly: true, summaryOnly: true, safeSummaryOnly: true, redacted: true, machineValueSafe: true };
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS) flags[key] = false;
  return flags;
}

function stateEchoes(persistedSummary) {
  return {
    acceptedSelectedResultAuthorityState: safeToken(persistedSummary.acceptedSelectedResultAuthorityState, "unknown"),
    selectedResultPersistenceAuthorityPreflightState: safeToken(persistedSummary.selectedResultPersistenceAuthorityPreflightState, "unknown"),
    selectedResultPersistenceBoundaryState: safeToken(persistedSummary.selectedResultPersistenceBoundaryState, "unknown"),
    selectedResultOutputReadinessPreflightState: safeToken(persistedSummary.selectedResultOutputReadinessPreflightState, "unknown"),
  };
}

export function buildRunTableFirstNarrowOutputHandoffContract(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const persistedSummary = getPersistedSummary(source);
  const fingerprints = fingerprintValues(source, persistedSummary);
  const readiness = buildRequirements(source, persistedSummary, fingerprints);
  const contractReady = readiness.contractReady === true;
  const state = contractReady ? RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady : RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.blockedFailClosed;
  const reason = contractReady
    ? "runtime-owned read-only diagnostic RunTable first narrow output handoff contract is ready from the persisted selected-result summary; no rows, generation, output persistence, routes, POST endpoints, RuntimeData mutation, raw payloads, or artifacts are produced"
    : `runtime-owned RunTable first narrow output handoff contract blocked fail-closed before any rows or output handoff: ${safeToken(readiness.missingRequirements?.[0], "missing-requirement")}`;
  const eligibleShape = eligibleHandoffSummaryShape();
  const contractFingerprint = stableFingerprint("safe-runtable-first-narrow-output-handoff-contract", {
    state,
    reason,
    fingerprints,
    requirements: readiness.requirements,
    missingRequirements: readiness.missingRequirements,
    eligibleShape,
    requiredFalseFlags: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  });
  const falseFlags = Object.fromEntries(RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));

  return Object.freeze({
    schemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_VERSION,
    summarySchemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    summarySchemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    state,
    runTableFirstNarrowOutputHandoffContractState: state,
    runTableFirstNarrowOutputHandoffContractReady: contractReady,
    failClosed: !contractReady,
    blocker: contractReady ? null : safeToken(readiness.missingRequirements?.[0], state),
    reason: safeText(reason, state),
    owner: "runtime",
    handoffOwner: "runtime",
    consumerOwner: "shell",
    sourceKind: "persisted-selected-result-summary",
    targetKind: "diagnostic-first-narrow-output-handoff-contract",
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    summaryOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    persistedSelectedResultSummaryRequired: true,
    persistedSelectedResultSummaryPresent: isPlainObject(persistedSummary) && Object.keys(persistedSummary).length > 0,
    persistedSelectedResultSummarySchemaId: persistedSummary.schemaId || null,
    persistedSelectedResultSummarySchemaVersion: persistedSummary.schemaVersion ?? null,
    selectedResultPersisted: contractReady,
    selectedResultPersistedSummarySlotContractReady: contractReady,
    ...stateEchoes(persistedSummary),
    policyFingerprint: fingerprints.policyFingerprint,
    sourceFingerprint: fingerprints.sourceFingerprint,
    sourceInputFingerprint: fingerprints.sourceInputFingerprint,
    sourceVersionFingerprint: fingerprints.sourceVersionFingerprint,
    persistedSelectedResultSummaryFingerprint: fingerprints.persistedSelectedResultSummaryFingerprint,
    selectedResultPersistedSummarySlotContractFingerprint: fingerprints.selectedResultPersistedSummarySlotContractFingerprint,
    runTableFirstNarrowOutputHandoffContractFingerprint: contractFingerprint,
    fingerprints: { ...clonePlain(fingerprints), runTableFirstNarrowOutputHandoffContractFingerprint: contractFingerprint },
    requirements: clonePlain(readiness.requirements),
    missingRequirements: [...readiness.missingRequirements],
    gatingPrerequisites: [...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES],
    blockedRawFieldClasses: [...BLOCKED_RAW_FIELD_CLASSES],
    eligibleHandoffSummaryShape: eligibleShape,
    requiredFalseFlags: [...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS],
    safetyFlags: disabledSafetyFlags(),
    rows: [],
    ...falseFlags,
  });
}

export const buildRuntimeRunTableFirstNarrowOutputHandoffContract = buildRunTableFirstNarrowOutputHandoffContract;
