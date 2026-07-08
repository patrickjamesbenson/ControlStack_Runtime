import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "./runTableFirstNarrowOutputHandoffContract.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID =
  "controlstack.runtime.runtable-first-narrow-row-shape-contract.v1";
export const RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION = 1;

export const RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID = "controlstack.runtime.runtable-first-narrow-row.v1";
export const RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION = 1;

export const RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES = Object.freeze({
  contractReady: "runtable_first_narrow_row_shape_contract_ready",
  blockedFailClosed: "runtable_first_narrow_row_shape_contract_blocked_fail_closed",
});

export const RUNTABLE_FIRST_NARROW_ROW_FIELD_SET = Object.freeze([
  "rowSchemaId",
  "rowSchemaVersion",
  "rowOrdinal",
  "rowKind",
  "sourceKind",
  "systemToken",
  "systemVariantToken",
  "opticToken",
  "lightControlToken",
  "runInputToken",
  "accessoryToken",
  "policyTokenSet",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
  "runTableFirstNarrowRowShapeContractFingerprint",
]);

export const RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS = Object.freeze([
  ...new Set([
    ...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
    "rowsIncluded",
    "rowShapeRowsIncluded",
    "rowShapeGenerated",
    "rowShapeGenerationEnabled",
    "rowShapeGenerationAttempted",
    "rowShapeRowsGenerated",
    "rowShapeRowsReturned",
    "runTableFirstNarrowRowsGenerated",
    "runTableFirstNarrowRowGenerationEnabled",
    "runTableFirstNarrowRowGenerationAttempted",
    "runTableFirstNarrowRowsReturned",
    "runTableFirstNarrowRowsPersisted",
    "runTableRowShapePersisted",
    "runTableRowShapePersistenceEnabled",
    "generated",
    "generationEnabled",
    "persisted",
    "routeAdded",
    "postEndpointAdded",
  ]),
]);

export const RUNTABLE_FIRST_NARROW_ROW_SHAPE_GATING_PREREQUISITES = Object.freeze([
  "persisted-runtable-first-narrow-output-summary-present",
  "persisted-runtable-first-narrow-output-summary-schema-valid",
  "persisted-runtable-first-narrow-output-summary-redacted",
  "persisted-runtable-first-narrow-output-summary-machine-value-safe",
  "persisted-runtable-first-narrow-output-summary-summary-only",
  "persisted-runtable-first-narrow-output-handoff-contract-ready",
  "rows-not-present",
  "rows-included-false",
  "row-count-zero",
  "raw-runtable-rows-absent",
  "raw-engine-result-payload-absent",
  "run-table-generation-remains-disabled",
  "ies-generation-remains-disabled",
  "output-generation-remains-disabled",
  "routes-remain-disabled",
  "post-endpoints-remain-disabled",
  "mutation-remains-disabled",
  "policy-fingerprint-present",
  "source-fingerprint-present",
  "source-input-fingerprint-present",
  "source-version-fingerprint-present",
  "persisted-selected-result-summary-fingerprint-present",
  "runtable-output-handoff-contract-fingerprint-present",
  "fingerprints-aligned",
]);

const BLOCKED_RAW_FIELD_CLASSES = Object.freeze([
  "raw-runtable-first-narrow-rows",
  "raw-runtable-rows",
  "raw-engine-payload",
  "raw-result-payload",
  "raw-selector-payload",
  "raw-ies-content",
  "raw-photometry",
  "candela-arrays",
  "base64-artifacts",
  "exact-electrical-values",
  "private-paths",
  "credentials",
  "production-runtable-generation",
]);

const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,700}$|^[0-9a-f]{32,128}$/i;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const ROW_KEYS = Object.freeze([
  "rows",
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawProductRows",
  "rawBoardRows",
  "rawDriverRows",
  "rawAccessoryRows",
  "firstNarrowRows",
  "runTableFirstNarrowRows",
]);
const RAW_RUNTABLE_ROW_KEYS = Object.freeze([
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawProductRows",
  "rawBoardRows",
  "rawDriverRows",
  "rawAccessoryRows",
  "firstNarrowRows",
  "runTableFirstNarrowRows",
]);
const RAW_PAYLOAD_KEYS = Object.freeze([
  "enginePayload",
  "rawEnginePayload",
  "raw_engine_payload",
  "engineResult",
  "rawEngineResult",
  "raw_engine_result",
  "resultPayload",
  "rawResultPayload",
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

function safeText(value, fallback = "", maxLength = 520) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function safeToken(value, fallback = "", maxLength = 240) {
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

function getPersistedRunTableSummary(source) {
  for (const candidate of [
    source.persistedRunTableFirstNarrowOutputSummary,
    source.runTableFirstNarrowOutputSummary,
    source.runtableFirstNarrowOutputSummary,
    source.persistedRunTableOutputSummary,
    source.projectEnvelope?.modules?.cs_selector?.downstreamContext?.runTableFirstNarrowOutputSummary,
    source.envelope?.modules?.cs_selector?.downstreamContext?.runTableFirstNarrowOutputSummary,
  ]) {
    if (isPlainObject(candidate)) return candidate;
  }
  return {};
}

function scanRowPresence(value, depth = 0, seen = new Set()) {
  if (depth > 8) return null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = scanRowPresence(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (ROW_KEYS.includes(key)) return `rows-already-present-${safeToken(key, "rows")}`;
    const child = scanRowPresence(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function scanRawRunTableRows(value, depth = 0, seen = new Set()) {
  if (depth > 8) return null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = scanRawRunTableRows(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    if (RAW_RUNTABLE_ROW_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) return `raw-runtable-rows-${safeToken(key, "rows")}`;
    const child = scanRawRunTableRows(nested, depth + 1, seen);
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
    if (RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS.includes(key) && nested === true) return `unsafe-true-flag-${safeToken(key, "flag")}`;
    const child = scanUnsafeFlags(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function fingerprintValues(source, persistedSummary) {
  const nested = isPlainObject(source.fingerprints) ? source.fingerprints : {};
  return {
    policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]) ?? firstPresent(nested, ["policyFingerprint", "safePolicyFingerprint"]) ?? firstPresent(persistedSummary, ["policyFingerprint", "safePolicyFingerprint"])),
    sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]) ?? firstPresent(nested, ["sourceFingerprint", "safeSourceFingerprint"]) ?? firstPresent(persistedSummary, ["sourceFingerprint", "safeSourceFingerprint"])),
    sourceInputFingerprint: safeFingerprint(firstPresent(source, ["sourceInputFingerprint"]) ?? firstPresent(nested, ["sourceInputFingerprint"]) ?? firstPresent(persistedSummary, ["sourceInputFingerprint"])),
    sourceVersionFingerprint: safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]) ?? firstPresent(nested, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]) ?? firstPresent(persistedSummary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])),
    persistedSelectedResultSummaryFingerprint: safeFingerprint(firstPresent(source, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint"]) ?? firstPresent(nested, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint"]) ?? firstPresent(persistedSummary, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint"])),
    runTableFirstNarrowOutputHandoffContractFingerprint: safeFingerprint(firstPresent(source, ["runTableFirstNarrowOutputHandoffContractFingerprint"]) ?? firstPresent(nested, ["runTableFirstNarrowOutputHandoffContractFingerprint"]) ?? firstPresent(persistedSummary, ["runTableFirstNarrowOutputHandoffContractFingerprint"])),
  };
}

function fingerprintMismatch(source, persistedSummary, fingerprints) {
  const checks = [
    ["policy", firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]), persistedSummary.policyFingerprint],
    ["source", firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]), persistedSummary.sourceFingerprint],
    ["source input", firstPresent(source, ["sourceInputFingerprint"]), persistedSummary.sourceInputFingerprint],
    ["source version", firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"]), firstPresent(persistedSummary, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])],
    ["persisted selected result summary", firstPresent(source, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint"]), persistedSummary.persistedSelectedResultSummaryFingerprint],
    ["RunTable first narrow output handoff contract", firstPresent(source, ["runTableFirstNarrowOutputHandoffContractFingerprint"]), fingerprints.runTableFirstNarrowOutputHandoffContractFingerprint],
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
  const rowPresenceBlocker = scanRowPresence({ persistedSummary });
  const rawRowsBlocker = scanRawRunTableRows({ source, persistedSummary });
  const rawPayloadBlocker = scanRawPayload({ source, persistedSummary });
  const flagsBlocker = scanUnsafeFlags({ source, persistedSummary });
  const mismatch = fingerprintMismatch(source, persistedSummary, fingerprints);
  const routeGate = source.routesAdded !== true && source.publicRouteAdded !== true && source.postEndpointsAdded !== true && source.postEndpointAdded !== true
    && persistedSummary.routesAdded !== true && persistedSummary.publicRouteAdded !== true && persistedSummary.postEndpointsAdded !== true && persistedSummary.postEndpointAdded !== true
    && persistedSummary.routeAdded !== true && persistedSummary.postEndpointAdded !== true;
  const mutationGate = source.projectWriteEnabled !== true && source.runtimeDataMutationEnabled !== true && source.runtimeDataMutated !== true && source.boardDataMutationEnabled !== true && source.donorDataMutationEnabled !== true
    && persistedSummary.projectWriteEnabled !== true && persistedSummary.runtimeDataMutationEnabled !== true && persistedSummary.runtimeDataMutated !== true && persistedSummary.boardDataMutationEnabled !== true && persistedSummary.donorDataMutationEnabled !== true;

  addRequirement(requirements, missingRequirements, "persisted-runtable-first-narrow-output-summary-present", present);
  addRequirement(requirements, missingRequirements, "persisted-runtable-first-narrow-output-summary-schema-valid", present && persistedSummary.schemaId === RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID && persistedSummary.schemaVersion === RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION);
  addRequirement(requirements, missingRequirements, "persisted-runtable-first-narrow-output-summary-redacted", persistedSummary.redacted === true);
  addRequirement(requirements, missingRequirements, "persisted-runtable-first-narrow-output-summary-machine-value-safe", persistedSummary.machineValueSafe === true);
  addRequirement(requirements, missingRequirements, "persisted-runtable-first-narrow-output-summary-summary-only", persistedSummary.summaryOnly === true || persistedSummary.safeSummaryOnly === true);
  addRequirement(requirements, missingRequirements, "persisted-runtable-first-narrow-output-handoff-contract-ready", persistedSummary.runTableFirstNarrowOutputHandoffContractReady === true);
  addRequirement(requirements, missingRequirements, "rows-not-present", !rowPresenceBlocker);
  addRequirement(requirements, missingRequirements, "rows-included-false", persistedSummary.rowsIncluded === false);
  addRequirement(requirements, missingRequirements, "row-count-zero", persistedSummary.rowCount === 0);
  addRequirement(requirements, missingRequirements, "raw-runtable-rows-absent", !rawRowsBlocker);
  addRequirement(requirements, missingRequirements, "raw-engine-result-payload-absent", !rawPayloadBlocker);
  addRequirement(requirements, missingRequirements, "run-table-generation-remains-disabled", !flagsBlocker && persistedSummary.generated === false && persistedSummary.generationEnabled === false);
  addRequirement(requirements, missingRequirements, "ies-generation-remains-disabled", !flagsBlocker);
  addRequirement(requirements, missingRequirements, "output-generation-remains-disabled", !flagsBlocker);
  addRequirement(requirements, missingRequirements, "routes-remain-disabled", routeGate);
  addRequirement(requirements, missingRequirements, "post-endpoints-remain-disabled", routeGate);
  addRequirement(requirements, missingRequirements, "mutation-remains-disabled", mutationGate);
  addRequirement(requirements, missingRequirements, "policy-fingerprint-present", Boolean(fingerprints.policyFingerprint));
  addRequirement(requirements, missingRequirements, "source-fingerprint-present", Boolean(fingerprints.sourceFingerprint));
  addRequirement(requirements, missingRequirements, "source-input-fingerprint-present", Boolean(fingerprints.sourceInputFingerprint));
  addRequirement(requirements, missingRequirements, "source-version-fingerprint-present", Boolean(fingerprints.sourceVersionFingerprint));
  addRequirement(requirements, missingRequirements, "persisted-selected-result-summary-fingerprint-present", Boolean(fingerprints.persistedSelectedResultSummaryFingerprint));
  addRequirement(requirements, missingRequirements, "runtable-output-handoff-contract-fingerprint-present", Boolean(fingerprints.runTableFirstNarrowOutputHandoffContractFingerprint));
  addRequirement(requirements, missingRequirements, "fingerprints-aligned", !mismatch);

  const blocker = rowPresenceBlocker || rawRowsBlocker || rawPayloadBlocker || flagsBlocker || mismatch;
  if (blocker) missingRequirements.unshift(`unsafe-input-rejected-${safeToken(blocker, "unsafe")}`);
  return {
    requirements,
    missingRequirements: [...new Set(missingRequirements)],
    contractReady: RUNTABLE_FIRST_NARROW_ROW_SHAPE_GATING_PREREQUISITES.every((key) => requirements[key] === true),
  };
}

function disabledSafetyFlags() {
  const flags = {
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    summaryOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
  };
  for (const key of RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS) flags[key] = false;
  return flags;
}

function eligibleFirstNarrowRowShape(contractFingerprint) {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    fieldSet: [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET],
    firstFields: [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET.slice(0, 12)],
    blockedRawFieldClasses: [...BLOCKED_RAW_FIELD_CLASSES],
    requiredFalseFlags: [...RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS],
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    rowsIncluded: false,
    rowCount: 0,
    generated: false,
    generationEnabled: false,
    persisted: false,
    routeAdded: false,
    postEndpointAdded: false,
    rowShapeContractFingerprint: contractFingerprint,
  };
}

export function buildRunTableFirstNarrowRowShapeContract(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const persistedSummary = getPersistedRunTableSummary(source);
  const fingerprints = fingerprintValues(source, persistedSummary);
  const readiness = buildRequirements(source, persistedSummary, fingerprints);
  const contractReady = readiness.contractReady === true;
  const state = contractReady
    ? RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.contractReady
    : RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.blockedFailClosed;
  const reason = contractReady
    ? "runtime-owned RunTable first narrow row-shape contract is ready from the persisted RunTable first narrow output handoff summary; no rows, output generation, IES generation, routes, POST endpoints, or mutation are produced"
    : `runtime-owned RunTable first narrow row-shape contract blocked fail-closed before any row generation: ${safeToken(readiness.missingRequirements?.[0], "missing-requirement")}`;
  const contractFingerprint = stableFingerprint("safe-runtable-first-narrow-row-shape-contract", {
    state,
    fingerprints,
    requirements: readiness.requirements,
    missingRequirements: readiness.missingRequirements,
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    fieldSet: RUNTABLE_FIRST_NARROW_ROW_FIELD_SET,
    requiredFalseFlags: RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS,
  });
  const falseFlags = Object.fromEntries(RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS.map((key) => [key, false]));

  return Object.freeze({
    schemaId: RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION,
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    state,
    runTableFirstNarrowRowShapeContractState: state,
    runTableFirstNarrowRowShapeContractReady: contractReady,
    failClosed: !contractReady,
    blocker: contractReady ? null : safeToken(readiness.missingRequirements?.[0], state),
    reason: safeText(reason, state),
    owner: "runtime",
    handoffOwner: "runtime",
    consumerOwner: "runtime",
    sourceKind: "runtable-first-narrow-output-handoff-summary",
    targetKind: "diagnostic-first-narrow-row-shape-contract",
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    summaryOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    persistedRunTableFirstNarrowOutputSummaryRequired: true,
    persistedRunTableFirstNarrowOutputSummaryPresent: isPlainObject(persistedSummary) && Object.keys(persistedSummary).length > 0,
    persistedRunTableFirstNarrowOutputSummarySchemaId: persistedSummary.schemaId || null,
    persistedRunTableFirstNarrowOutputSummarySchemaVersion: persistedSummary.schemaVersion ?? null,
    persistedRunTableFirstNarrowOutputSummaryRowsIncluded: persistedSummary.rowsIncluded ?? null,
    persistedRunTableFirstNarrowOutputSummaryRowCount: persistedSummary.rowCount ?? null,
    runTableFirstNarrowOutputHandoffContractState: safeToken(persistedSummary.runTableFirstNarrowOutputHandoffContractState, "unknown"),
    runTableFirstNarrowOutputHandoffContractReady: persistedSummary.runTableFirstNarrowOutputHandoffContractReady === true,
    policyFingerprint: fingerprints.policyFingerprint,
    sourceFingerprint: fingerprints.sourceFingerprint,
    sourceInputFingerprint: fingerprints.sourceInputFingerprint,
    sourceVersionFingerprint: fingerprints.sourceVersionFingerprint,
    persistedSelectedResultSummaryFingerprint: fingerprints.persistedSelectedResultSummaryFingerprint,
    runTableFirstNarrowOutputHandoffContractFingerprint: fingerprints.runTableFirstNarrowOutputHandoffContractFingerprint,
    runTableFirstNarrowRowShapeContractFingerprint: contractFingerprint,
    fingerprints: { ...clonePlain(fingerprints), runTableFirstNarrowRowShapeContractFingerprint: contractFingerprint },
    requirements: clonePlain(readiness.requirements),
    missingRequirements: [...readiness.missingRequirements],
    gatingPrerequisites: [...RUNTABLE_FIRST_NARROW_ROW_SHAPE_GATING_PREREQUISITES],
    blockedRawFieldClasses: [...BLOCKED_RAW_FIELD_CLASSES],
    rowFieldSet: [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET],
    firstNarrowRowFieldSet: [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET],
    requiredFalseFlags: [...RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS],
    eligibleFirstNarrowRowShape: eligibleFirstNarrowRowShape(contractFingerprint),
    safetyFlags: disabledSafetyFlags(),
    rows: [],
    rowsIncluded: false,
    rowCount: 0,
    generated: false,
    generationEnabled: false,
    persisted: false,
    routeAdded: false,
    postEndpointAdded: false,
    ...falseFlags,
  });
}

export const buildRuntimeRunTableFirstNarrowRowShapeContract = buildRunTableFirstNarrowRowShapeContract;
