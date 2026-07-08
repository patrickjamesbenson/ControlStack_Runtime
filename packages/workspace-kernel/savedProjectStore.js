import { createHandoffSharePackage, summariseHandoffSharePackage } from "./handoffSharePackage.js";
import { createHydrationPayloadsFromEnvelope, createHydrationResultsFromEnvelope, createSavedProjectEnvelope, summariseProjectEnvelope, validateSavedProjectEnvelope } from "./projectEnvelope.js";
import {
  buildSelectedResultPersistedSummarySlotContract,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET,
} from "./selectedResultPersistedSummarySlotContract.js";
import {
  buildSelectedResultPersistedSummaryReadbackStatus,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
} from "./selectedResultPersistedSummaryReadbackStatus.js";
import {
  buildRunTableFirstNarrowOutputHandoffContract,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "./runTableFirstNarrowOutputHandoffContract.js";
import {
  buildRuntimeIesFirstNarrowMetadataHandoffSummary,
  findUnsafeIesFirstNarrowMetadataHandoffInput,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_TARGET,
} from "./iesFirstNarrowMetadataHandoffSummary.js";
import {
  buildRuntimeIesFirstNarrowCandidateOutputSummary,
  findUnsafeIesFirstNarrowCandidateOutputInput,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_TARGET,
} from "./iesFirstNarrowCandidateOutputSummary.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

const SELECTED_RESULT_SUMMARY_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";
export const SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.selected-result-persisted-summary-readback-project-summary.v1";
export const SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_VERSION = 1;
const RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary";
const IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_TARGET = RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_TARGET;
const IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_TARGET = RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_TARGET;
const IES_SOURCE_PHOTOMETRY_REF_SAFE_PATTERN = /^safe-source-photometry-ref:[0-9a-f]{40}$/;

const SELECTED_RESULT_SUMMARY_WRITE_SOURCE_KEYS = Object.freeze([
  "selectedResultSummary",
  "selectedResultSummaryCandidate",
  "selectedResultPersistedSummaryCandidate",
  "selectedResultPersistedSummaryWrite",
  "selectedResultSummaryWrite",
  "selectedResultSummaryWriteRequest",
  "selectedResultPersistenceAuthorityPreflightSummary",
  "persistenceAuthorityPreflightSummary",
  "selectedResultPersistenceBoundaryContractSummary",
  "persistenceBoundaryContractSummary",
  "selectedResultPersistedSummarySlotContractSummary",
  "persistedSummarySlotContractSummary",
  "acceptedSelectedResultAuthorityGateSummary",
  "selectedResultAuthorityGuardSummary",
  "selectedResultProjectionSummary",
  "safeSelectedResultSourceObjectSummary",
  "selectedResultHandoffScaffoldSummary",
  "selectedResultOutputReadinessPreflightSummary",
]);

const RUNTABLE_FIRST_NARROW_OUTPUT_WRITE_SOURCE_KEYS = Object.freeze([
  "runTableFirstNarrowOutputSummary",
  "runTableFirstNarrowOutputSummaryCandidate",
  "runTableFirstNarrowOutputSummaryWrite",
  "runTableFirstNarrowOutputSummaryWriteRequest",
  "runTableFirstNarrowOutputWrite",
  "runTableFirstNarrowOutputWriteRequest",
  "runTableFirstNarrowOutputHandoffSummary",
  "runTableFirstNarrowOutputHandoffSummaryCandidate",
  "runTableFirstNarrowOutputHandoffSummaryWrite",
  "runTableFirstNarrowOutputHandoffWrite",
  "runTableFirstNarrowOutputHandoffWriteRequest",
  "runTableFirstNarrowOutputHandoffContractSummary",
  "runtableFirstNarrowOutputHandoffContractSummary",
]);

const IES_FIRST_NARROW_METADATA_HANDOFF_WRITE_REQUEST_KEYS = Object.freeze([
  "iesFirstNarrowMetadataHandoffWrite",
  "iesFirstNarrowMetadataHandoffWriteRequest",
  "iesFirstNarrowMetadataHandoffSummaryWrite",
  "iesFirstNarrowMetadataHandoffSummaryWriteRequest",
]);

const IES_FIRST_NARROW_METADATA_HANDOFF_WRITE_SOURCE_KEYS = Object.freeze([
  "iesFirstNarrowMetadataHandoffSummary",
  "iesFirstNarrowMetadataHandoffSummaryCandidate",
  "sourcePhotometryRefHandoffSummary",
  "iesSourcePhotometryRefHandoffSummary",
]);

const IES_FIRST_NARROW_CANDIDATE_OUTPUT_WRITE_REQUEST_KEYS = Object.freeze([
  "iesFirstNarrowCandidateOutputWrite",
  "iesFirstNarrowCandidateOutputWriteRequest",
  "iesFirstNarrowCandidateOutputSummaryWrite",
  "iesFirstNarrowCandidateOutputSummaryWriteRequest",
]);

const IES_FIRST_NARROW_CANDIDATE_OUTPUT_WRITE_SOURCE_KEYS = Object.freeze([
  "iesFirstNarrowCandidateOutputSummary",
  "iesFirstNarrowCandidateOutputSummaryCandidate",
  "runTableFirstNarrowRows",
  "iesFirstNarrowMetadataHandoffSummary",
]);

const IES_FIRST_NARROW_METADATA_HANDOFF_REQUIRED_FIELD_SET = new Set(RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER);
const IES_FIRST_NARROW_CANDIDATE_OUTPUT_REQUIRED_FIELD_SET = new Set(RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_FIELD_ORDER);

const RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_ELIGIBLE_FIELD_SET = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "state",
  "summaryOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceKind",
  "futureOutputKind",
  "rowsIncluded",
  "rowCount",
  "generated",
  "generationEnabled",
  "persisted",
  "routeAdded",
  "postEndpointAdded",
  "runTableFirstNarrowOutputHandoffContractState",
  "runTableFirstNarrowOutputHandoffContractReady",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "selectedResultPersistedSummarySlotContractFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
  ...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
]);

const RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_REQUIRED_FIELDS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "state",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "selectedResultPersistedSummarySlotContractFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
]);

const SELECTED_RESULT_SUMMARY_RAW_BODY_KEYS = Object.freeze([
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
  "artifactBase64",
  "credentials",
  "secrets",
  "filename",
  "fileName",
  "privatePath",
  "localPath",
]);

const SELECTED_RESULT_SUMMARY_UNSAFE_TRUE_KEYS = Object.freeze([
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
  "boardDataMutated",
  "donorMutationEnabled",
  "donorEngineInvoked",
  "donorEngineInvocationEnabled",
  "donorEnginePayloadAssemblyEnabled",
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
  "filenamesReturned",
  "filenamesExposed",
  "credentialsReturned",
  "credentialsExposed",
]);

const SELECTED_RESULT_SUMMARY_PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SELECTED_RESULT_SUMMARY_SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,640}$|^[0-9a-f]{32,128}$/i;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function cloneMaybe(value) {
  return value === undefined ? undefined : JSON.parse(JSON.stringify(value));
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function selectedSummarySafeToken(value, fallback = "", maxLength = 180) {
  const raw = String(value ?? "").trim();
  if (!raw || SELECTED_RESULT_SUMMARY_PRIVATE_VALUE_PATTERN.test(raw)) return fallback;
  const token = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return token || fallback;
}

const SELECTED_RESULT_SUMMARY_SAFE_BLOCKER_FALLBACK = "selected-result-persisted-summary-readback-blocked";
const SELECTED_RESULT_SUMMARY_BLOCKER_PRIVATE_SUFFIX_PREFIXES = Object.freeze([
  ["blocked-raw-field-", "blocked-raw-field"],
  ["unsafe-true-flag-", "unsafe-true-flag"],
  ["required-false-summary-flag-not-false-", "required-false-summary-flag-not-false"],
  ["required-summary-field-missing-", "required-summary-field-missing"],
  ["safe-fingerprint-missing-", "safe-fingerprint-missing"],
  ["summary-field-not-allow-listed-", "summary-field-not-allow-listed-field"],
]);
const SELECTED_RESULT_SUMMARY_BLOCKER_UNSAFE_FIELD_NAMES = Object.freeze([
  ...SELECTED_RESULT_SUMMARY_RAW_BODY_KEYS,
  ...SELECTED_RESULT_SUMMARY_UNSAFE_TRUE_KEYS,
  "downstreamContext",
  "moduleState",
  "envelopeBody",
  "projectEnvelope",
  "modules",
  "rows",
]);

function selectedSummarySafeFingerprint(value) {
  const token = selectedSummarySafeToken(value, "", 700);
  if (!token) return null;
  return SELECTED_RESULT_SUMMARY_SAFE_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function selectedSummarySafeBlockerToken(value) {
  const token = selectedSummarySafeToken(value, SELECTED_RESULT_SUMMARY_SAFE_BLOCKER_FALLBACK);
  if (!token) return SELECTED_RESULT_SUMMARY_SAFE_BLOCKER_FALLBACK;
  if (token === "summary-field-not-allow-listed-raw-field") return token;
  for (const [prefix, safeBlocker] of SELECTED_RESULT_SUMMARY_BLOCKER_PRIVATE_SUFFIX_PREFIXES) {
    if (token.startsWith(prefix)) return safeBlocker;
  }
  for (const unsafeName of SELECTED_RESULT_SUMMARY_BLOCKER_UNSAFE_FIELD_NAMES) {
    if (unsafeName && token.includes(unsafeName)) return SELECTED_RESULT_SUMMARY_SAFE_BLOCKER_FALLBACK;
  }
  return token;
}

function selectedSummarySchemaVersion(value) {
  if (isBlank(value)) return null;
  const version = Number(value);
  return Number.isFinite(version) ? version : null;
}

function selectedSummarySafeBoolean(value) {
  return value === true;
}

export function buildSelectedResultPersistedSummaryReadbackProjectSummary(envelopeOrStatus = {}) {
  const sourceStatus = isPlainObject(envelopeOrStatus)
    && envelopeOrStatus.schemaId === SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID
    && Number(envelopeOrStatus.schemaVersion) === SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION
    ? envelopeOrStatus
    : buildSelectedResultPersistedSummaryReadbackStatus(envelopeOrStatus || {});
  const ready = sourceStatus.ready === true;
  const failClosed = sourceStatus.failClosed === true || !ready;

  return Object.freeze({
    schemaId: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_VERSION,
    sourceSchemaId: selectedSummarySafeToken(sourceStatus.schemaId, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID),
    sourceSchemaVersion: selectedSummarySchemaVersion(sourceStatus.schemaVersion),
    state: selectedSummarySafeToken(sourceStatus.state, null),
    readiness: selectedSummarySafeToken(sourceStatus.readiness, failClosed ? "blocked_fail_closed" : "ready"),
    ready,
    failClosed,
    blocker: sourceStatus.blocker ? selectedSummarySafeBlockerToken(sourceStatus.blocker) : null,
    summaryPresent: selectedSummarySafeBoolean(sourceStatus.summaryPresent),
    summarySchemaId: sourceStatus.summarySchemaId ? selectedSummarySafeToken(sourceStatus.summarySchemaId, null) : null,
    summarySchemaVersion: selectedSummarySchemaVersion(sourceStatus.summarySchemaVersion),
    summaryState: sourceStatus.summaryState ? selectedSummarySafeToken(sourceStatus.summaryState, null) : null,
    owner: selectedSummarySafeToken(sourceStatus.owner, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.owner),
    slotOwner: selectedSummarySafeToken(sourceStatus.slotOwner, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.slotOwner),
    envelopeOwner: selectedSummarySafeToken(sourceStatus.envelopeOwner, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.envelopeOwner),
    moduleId: selectedSummarySafeToken(sourceStatus.moduleId, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.moduleId),
    targetLocation: selectedSummarySafeToken(sourceStatus.targetLocation, SELECTED_RESULT_SUMMARY_TARGET),
    selectedResultPersistedSummaryReadbackFingerprint: selectedSummarySafeFingerprint(sourceStatus.selectedResultPersistedSummaryReadbackFingerprint),
  });
}

function selectedSummaryFirstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function selectedSummaryFirstPlain(sources, keys) {
  for (const source of sources) {
    if (!isPlainObject(source)) continue;
    for (const key of keys) {
      if (isPlainObject(source[key])) return source[key];
    }
  }
  return {};
}

function selectedSummaryFirstValue(sources, keys) {
  for (const source of sources) {
    const value = selectedSummaryFirstPresent(source, keys);
    if (!isBlank(value)) return value;
  }
  return undefined;
}

function hasOwnPlainKey(source, key) {
  return isPlainObject(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function selectedResultPersistedSummaryWriteFailure(reason) {
  throw new Error(`selected-result persisted summary write rejected: ${reason}`);
}

function findUnsafeSelectedResultSummaryInput(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    return SELECTED_RESULT_SUMMARY_PRIVATE_VALUE_PATTERN.test(value) ? "private-path-or-filename-not-approved" : null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = findUnsafeSelectedResultSummaryInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (SELECTED_RESULT_SUMMARY_RAW_BODY_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) {
      return `blocked-raw-field-${selectedSummarySafeToken(key, "unsafe")}`;
    }
    if (SELECTED_RESULT_SUMMARY_UNSAFE_TRUE_KEYS.includes(key) && nested === true) {
      return `unsafe-true-flag-${selectedSummarySafeToken(key, "flag")}`;
    }
    const child = findUnsafeSelectedResultSummaryInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function removeSelectedResultSummaryWriteSourceKeys(value) {
  if (!isPlainObject(value)) return value;
  const copy = cloneMaybe(value) || {};
  for (const key of SELECTED_RESULT_SUMMARY_WRITE_SOURCE_KEYS) delete copy[key];
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_WRITE_SOURCE_KEYS) delete copy[key];
  for (const key of IES_FIRST_NARROW_METADATA_HANDOFF_WRITE_REQUEST_KEYS) delete copy[key];
  for (const key of IES_FIRST_NARROW_METADATA_HANDOFF_WRITE_SOURCE_KEYS) delete copy[key];
  for (const key of IES_FIRST_NARROW_CANDIDATE_OUTPUT_WRITE_REQUEST_KEYS) delete copy[key];
  for (const key of IES_FIRST_NARROW_CANDIDATE_OUTPUT_WRITE_SOURCE_KEYS) delete copy[key];
  return copy;
}

function sanitiseSelectedResultSummaryContext(context = {}) {
  const safeContext = removeSelectedResultSummaryWriteSourceKeys(cloneMaybe(context) || {});
  for (const key of ["metadata", "currentProject", "selection"]) {
    if (isPlainObject(safeContext.project?.[key])) {
      safeContext.project[key] = removeSelectedResultSummaryWriteSourceKeys(safeContext.project[key]);
    }
  }
  if (isPlainObject(safeContext.downstream?.selector)) {
    safeContext.downstream.selector = removeSelectedResultSummaryWriteSourceKeys(safeContext.downstream.selector);
  }
  return safeContext;
}

function sanitiseSelectedResultSummaryModuleContributions(moduleContributions = {}) {
  const safeContributions = cloneMaybe(moduleContributions) || {};
  if (isPlainObject(safeContributions.cs_selector)) {
    safeContributions.cs_selector = removeSelectedResultSummaryWriteSourceKeys(safeContributions.cs_selector);
  }
  if (isPlainObject(safeContributions.cs_selector?.state)) {
    safeContributions.cs_selector.state = removeSelectedResultSummaryWriteSourceKeys(safeContributions.cs_selector.state);
  }
  if (isPlainObject(safeContributions.cs_selector?.downstreamContext)) {
    safeContributions.cs_selector.downstreamContext = removeSelectedResultSummaryWriteSourceKeys(safeContributions.cs_selector.downstreamContext);
  }
  return safeContributions;
}

function resolveSelectedResultPersistedSummaryWrite(context = {}, moduleContributions = {}) {
  const selectorContribution = isPlainObject(moduleContributions.cs_selector) ? moduleContributions.cs_selector : {};
  const contributionDownstream = isPlainObject(selectorContribution.downstreamContext) ? selectorContribution.downstreamContext : {};
  const contextSelectorDownstream = isPlainObject(context.downstream?.selector) ? context.downstream.selector : {};
  const directWrite = selectedSummaryFirstPlain(
    [selectorContribution, contributionDownstream, contextSelectorDownstream, context],
    ["selectedResultPersistedSummaryWrite", "selectedResultSummaryWrite", "selectedResultSummaryWriteRequest"],
  );
  const sources = [directWrite, selectorContribution, contributionDownstream, contextSelectorDownstream, context];
  const requested = directWrite.writeRequested === true
    || directWrite.enabled === true
    || directWrite.persist === true
    || selectorContribution.selectedResultPersistedSummaryWriteRequested === true
    || contributionDownstream.selectedResultPersistedSummaryWriteRequested === true
    || contextSelectorDownstream.selectedResultPersistedSummaryWriteRequested === true
    || hasOwnPlainKey(contributionDownstream, "selectedResultSummary")
    || hasOwnPlainKey(contextSelectorDownstream, "selectedResultSummary")
    || hasOwnPlainKey(directWrite, "selectedResultSummary")
    || hasOwnPlainKey(directWrite, "selectedResultSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "selectedResultSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "selectedResultSummaryCandidate")
    || hasOwnPlainKey(directWrite, "selectedResultPersistedSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "selectedResultPersistedSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "selectedResultPersistedSummaryCandidate");

  if (!requested) {
    return {
      requested: false,
      context,
      moduleContributions,
    };
  }

  const targetPath = selectedSummaryFirstValue(sources, [
    "targetPath",
    "targetLocation",
    "writeTarget",
    "slot",
    "envelopeSlot",
  ]) || SELECTED_RESULT_SUMMARY_TARGET;

  return {
    requested: true,
    targetPath: selectedSummarySafeToken(targetPath, ""),
    authorityPreflightSummary: selectedSummaryFirstPlain(sources, [
      "selectedResultPersistenceAuthorityPreflightSummary",
      "persistenceAuthorityPreflightSummary",
    ]),
    boundaryContractSummary: selectedSummaryFirstPlain(sources, [
      "selectedResultPersistenceBoundaryContractSummary",
      "persistenceBoundaryContractSummary",
    ]),
    slotContractSummary: selectedSummaryFirstPlain(sources, [
      "selectedResultPersistedSummarySlotContractSummary",
      "persistedSummarySlotContractSummary",
    ]),
    sourceFingerprints: {
      policyFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])),
      sourceFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])),
      sourceInputFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceInputFingerprint", "currentSourceInputFingerprint"])),
      sourceVersionFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceVersionFingerprint", "sourceVersionMarker", "boardDataSourceVersion"])),
    },
    rawInputForSafetyScan: {
      directWrite,
      selectedResultSummary: directWrite.selectedResultSummary || contributionDownstream.selectedResultSummary || contextSelectorDownstream.selectedResultSummary || null,
      selectedResultSummaryCandidate: directWrite.selectedResultSummaryCandidate || contributionDownstream.selectedResultSummaryCandidate || contextSelectorDownstream.selectedResultSummaryCandidate || null,
      selectedResultPersistedSummaryCandidate: directWrite.selectedResultPersistedSummaryCandidate || contributionDownstream.selectedResultPersistedSummaryCandidate || contextSelectorDownstream.selectedResultPersistedSummaryCandidate || null,
    },
    context: sanitiseSelectedResultSummaryContext(context),
    moduleContributions: sanitiseSelectedResultSummaryModuleContributions(moduleContributions),
  };
}

function resolveSelectedResultPersistedSummarySlotContract(writeRequest) {
  if (isPlainObject(writeRequest.slotContractSummary) && Object.keys(writeRequest.slotContractSummary).length > 0) {
    return writeRequest.slotContractSummary;
  }

  return buildSelectedResultPersistedSummarySlotContract({
    policyFingerprint: writeRequest.sourceFingerprints.policyFingerprint,
    sourceFingerprint: writeRequest.sourceFingerprints.sourceFingerprint,
    sourceInputFingerprint: writeRequest.sourceFingerprints.sourceInputFingerprint,
    sourceVersionFingerprint: writeRequest.sourceFingerprints.sourceVersionFingerprint,
    selectedResultPersistenceAuthorityPreflightSummary: writeRequest.authorityPreflightSummary,
    selectedResultPersistenceBoundaryContractSummary: writeRequest.boundaryContractSummary,
  });
}

function validateSelectedResultPersistedSummaryTarget(writeRequest, slotContract) {
  if (writeRequest.targetPath !== SELECTED_RESULT_SUMMARY_TARGET) {
    selectedResultPersistedSummaryWriteFailure(`target path drifted from shell slot: ${writeRequest.targetPath || "missing"}`);
  }
  if (SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetLocation !== SELECTED_RESULT_SUMMARY_TARGET) {
    selectedResultPersistedSummaryWriteFailure("compiled slot target does not match selectedResultSummary shell slot");
  }
  const target = isPlainObject(slotContract.slotTarget) ? slotContract.slotTarget : isPlainObject(slotContract.writeTarget) ? slotContract.writeTarget : {};
  if (target.targetLocation !== SELECTED_RESULT_SUMMARY_TARGET) {
    selectedResultPersistedSummaryWriteFailure("slot contract target does not match selectedResultSummary shell slot");
  }
  if (target.owner !== "shell" || target.slotOwner !== "shell" || target.moduleId !== "cs_selector") {
    selectedResultPersistedSummaryWriteFailure("slot contract target owner/module is not shell-owned cs_selector");
  }
  for (const key of ["runtimeDataTarget", "boardDataTarget", "donorDataTarget", "runTableTarget", "iesTarget", "outputTarget", "routeTarget", "postEndpointTarget"]) {
    if (target[key] === true || slotContract[key] === true) {
      selectedResultPersistedSummaryWriteFailure(`slot contract attempted blocked target ${key}`);
    }
  }
}

function validateSelectedResultPersistedSummaryAuthority(slotContract) {
  if (slotContract.state !== SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.contractReady
    || slotContract.selectedResultPersistedSummarySlotContractReady !== true
    || slotContract.failClosed === true) {
    selectedResultPersistedSummaryWriteFailure(slotContract.blocker || "persisted-summary-slot-contract-not-ready");
  }

  const requirements = isPlainObject(slotContract.requirements) ? slotContract.requirements : {};
  for (const key of [
    "accepted-selected-result-authority-ready",
    "selected-result-persistence-authority-preflight-ready",
    "selected-result-persistence-boundary-contract-ready",
    "selected-result-output-readiness-preflight-ready-for-persistence",
    "selected-result-authority-guard-clean",
    "stale-comparison-clean",
    "no-fingerprint-mismatch",
    "shell-project-envelope-slot-target-defined",
    "policy-fingerprint-present",
    "source-fingerprint-present",
    "source-input-fingerprint-present",
    "source-version-fingerprint-present",
    "persistence-authority-preflight-fingerprint-present",
    "persistence-boundary-contract-fingerprint-present",
    "persistence-authority-and-boundary-fingerprints-aligned",
  ]) {
    if (requirements[key] !== true) selectedResultPersistedSummaryWriteFailure(key);
  }

  if (slotContract.acceptedSelectedResultAuthorityState !== "accepted_selected_result_authority") {
    selectedResultPersistedSummaryWriteFailure("accepted-selected-result-authority-state-not-ready");
  }
  if (slotContract.selectedResultPersistenceAuthorityPreflightState !== "ready_for_persistence_authority") {
    selectedResultPersistedSummaryWriteFailure("persistence-authority-preflight-state-not-ready");
  }
  if (slotContract.selectedResultPersistenceBoundaryState !== "selected_result_persistence_boundary_contract_ready") {
    selectedResultPersistedSummaryWriteFailure("persistence-boundary-contract-state-not-ready");
  }
}

function summaryFingerprint(slotContract, key) {
  return selectedSummarySafeFingerprint(slotContract.summaryFingerprints?.[key])
    || selectedSummarySafeFingerprint(slotContract.fingerprints?.[key])
    || selectedSummarySafeFingerprint(slotContract[key]);
}

function buildRedactedSelectedResultPersistedSummary(slotContract) {
  const fingerprints = isPlainObject(slotContract.fingerprints) ? slotContract.fingerprints : {};
  const summary = {
    schemaId: slotContract.persistedSummarySchemaId,
    schemaVersion: slotContract.persistedSummarySchemaVersion,
    slotSchemaId: slotContract.slotSchemaId,
    slotSchemaVersion: slotContract.slotSchemaVersion,
    owner: "shell",
    slotOwner: "shell",
    targetKind: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET.targetKind,
    moduleId: "cs_selector",
    state: "redacted_selected_result_summary_persisted",
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    acceptedSelectedResultAuthorityState: selectedSummarySafeToken(slotContract.acceptedSelectedResultAuthorityState, "accepted_selected_result_authority"),
    selectedResultPersistenceAuthorityPreflightState: selectedSummarySafeToken(slotContract.selectedResultPersistenceAuthorityPreflightState, "ready_for_persistence_authority"),
    selectedResultPersistenceBoundaryState: selectedSummarySafeToken(slotContract.selectedResultPersistenceBoundaryState, "selected_result_persistence_boundary_contract_ready"),
    selectedResultOutputReadinessPreflightState: selectedSummarySafeToken(slotContract.selectedResultOutputReadinessPreflightState, "selected_result_output_readiness_ready_for_persistence"),
    selectedResultAuthorityGuardState: selectedSummarySafeToken(slotContract.selectedResultAuthorityGuardState, "engine_verified_selected_result_ready"),
    selectedResultProjectionState: selectedSummarySafeToken(slotContract.selectedResultProjectionState, "selected_accepted"),
    safeSelectedResultSourceState: selectedSummarySafeToken(slotContract.safeSelectedResultSourceState, "safe_selected_result_source_ready"),
    selectedResultHandoffScaffoldState: selectedSummarySafeToken(slotContract.selectedResultHandoffScaffoldState, "runtime_selected_result_handoff_scaffold_ready"),
    policyFingerprint: selectedSummarySafeFingerprint(fingerprints.policyFingerprint),
    sourceFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceFingerprint),
    sourceInputFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceInputFingerprint),
    sourceVersionFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceVersionFingerprint),
    acceptedSelectedResultAuthorityGateFingerprint: summaryFingerprint(slotContract, "acceptedSelectedResultAuthorityGate"),
    selectedResultPersistenceAuthorityPreflightFingerprint: summaryFingerprint(slotContract, "selectedResultPersistenceAuthorityPreflight"),
    selectedResultPersistenceBoundaryContractFingerprint: summaryFingerprint(slotContract, "selectedResultPersistenceBoundaryContract"),
    selectedResultOutputReadinessPreflightFingerprint: summaryFingerprint(slotContract, "selectedResultOutputReadinessPreflight"),
    selectedResultAuthorityGuardFingerprint: summaryFingerprint(slotContract, "selectedResultAuthorityGuard"),
    selectedResultProjectionFingerprint: summaryFingerprint(slotContract, "selectedResultProjection"),
    safeSelectedResultSourceObjectFingerprint: summaryFingerprint(slotContract, "safeSelectedResultSourceObject"),
    selectedResultHandoffScaffoldFingerprint: summaryFingerprint(slotContract, "selectedResultHandoffScaffold"),
  };

  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    summary[key] = false;
  }

  const allowed = new Set(SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET);
  return Object.fromEntries(Object.entries(summary).filter(([key]) => allowed.has(key)));
}

function validateRedactedSelectedResultPersistedSummary(summary, slotContract) {
  const allowed = new Set(slotContract.eligiblePersistedSummaryFieldSet || SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET);
  for (const key of Object.keys(summary)) {
    if (!allowed.has(key)) selectedResultPersistedSummaryWriteFailure(`summary field not allow-listed: ${key}`);
  }
  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FIELDS) {
    if (isBlank(summary[key])) selectedResultPersistedSummaryWriteFailure(`required summary field missing: ${key}`);
  }
  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) selectedResultPersistedSummaryWriteFailure(`required false summary flag not false: ${key}`);
  }
  if (summary.owner !== "shell" || summary.slotOwner !== "shell" || summary.moduleId !== "cs_selector") {
    selectedResultPersistedSummaryWriteFailure("summary owner/module is not shell-owned cs_selector");
  }
  if (summary.summaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) {
    selectedResultPersistedSummaryWriteFailure("summary is not marked summary-only, redacted, and machine-value-safe");
  }
  const unsafe = findUnsafeSelectedResultSummaryInput(summary);
  if (unsafe) selectedResultPersistedSummaryWriteFailure(unsafe);
}

function prepareSelectedResultPersistedSummaryWrite(context = {}, moduleContributions = {}) {
  const writeRequest = resolveSelectedResultPersistedSummaryWrite(context, moduleContributions);
  if (!writeRequest.requested) return writeRequest;

  const unsafe = findUnsafeSelectedResultSummaryInput(writeRequest.rawInputForSafetyScan);
  if (unsafe) selectedResultPersistedSummaryWriteFailure(unsafe);

  const slotContract = resolveSelectedResultPersistedSummarySlotContract(writeRequest);
  const contractUnsafe = findUnsafeSelectedResultSummaryInput(slotContract);
  if (contractUnsafe) selectedResultPersistedSummaryWriteFailure(contractUnsafe);
  validateSelectedResultPersistedSummaryTarget(writeRequest, slotContract);
  validateSelectedResultPersistedSummaryAuthority(slotContract);

  const summary = buildRedactedSelectedResultPersistedSummary(slotContract);
  validateRedactedSelectedResultPersistedSummary(summary, slotContract);

  return {
    ...writeRequest,
    slotContract,
    summary,
  };
}

function writeSelectedResultPersistedSummaryToEnvelope(envelope, summary) {
  if (!isPlainObject(envelope?.modules?.cs_selector)) {
    selectedResultPersistedSummaryWriteFailure("candidate envelope missing cs_selector module slot");
  }
  if (!isPlainObject(envelope.modules.cs_selector.downstreamContext)) {
    envelope.modules.cs_selector.downstreamContext = {};
  }
  envelope.modules.cs_selector.downstreamContext.selectedResultSummary = clone(summary);
  return envelope;
}

function runTableFirstNarrowOutputSummaryWriteFailure(reason) {
  throw new Error(`RunTable first narrow output summary write rejected: ${reason}`);
}

function resolveRunTableFirstNarrowOutputSummaryWrite(context = {}, moduleContributions = {}) {
  const selectorContribution = isPlainObject(moduleContributions.cs_selector) ? moduleContributions.cs_selector : {};
  const contributionDownstream = isPlainObject(selectorContribution.downstreamContext) ? selectorContribution.downstreamContext : {};
  const contextSelectorDownstream = isPlainObject(context.downstream?.selector) ? context.downstream.selector : {};
  const directWrite = selectedSummaryFirstPlain(
    [selectorContribution, contributionDownstream, contextSelectorDownstream, context],
    [
      "runTableFirstNarrowOutputSummaryWrite",
      "runTableFirstNarrowOutputSummaryWriteRequest",
      "runTableFirstNarrowOutputWrite",
      "runTableFirstNarrowOutputWriteRequest",
      "runTableFirstNarrowOutputHandoffSummaryWrite",
      "runTableFirstNarrowOutputHandoffWrite",
      "runTableFirstNarrowOutputHandoffWriteRequest",
    ],
  );
  const sources = [directWrite, selectorContribution, contributionDownstream, contextSelectorDownstream, context];
  const requested = directWrite.writeRequested === true
    || directWrite.enabled === true
    || directWrite.persist === true
    || directWrite.write === true
    || selectorContribution.runTableFirstNarrowOutputSummaryWriteRequested === true
    || contributionDownstream.runTableFirstNarrowOutputSummaryWriteRequested === true
    || contextSelectorDownstream.runTableFirstNarrowOutputSummaryWriteRequested === true
    || selectorContribution.runTableFirstNarrowOutputHandoffWriteRequested === true
    || contributionDownstream.runTableFirstNarrowOutputHandoffWriteRequested === true
    || contextSelectorDownstream.runTableFirstNarrowOutputHandoffWriteRequested === true
    || hasOwnPlainKey(directWrite, "runTableFirstNarrowOutputSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "runTableFirstNarrowOutputSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "runTableFirstNarrowOutputSummaryCandidate")
    || hasOwnPlainKey(directWrite, "runTableFirstNarrowOutputHandoffSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "runTableFirstNarrowOutputHandoffSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "runTableFirstNarrowOutputHandoffSummaryCandidate");

  if (!requested) {
    return {
      requested: false,
      context,
      moduleContributions,
    };
  }

  const targetPath = selectedSummaryFirstValue(sources, [
    "targetPath",
    "targetLocation",
    "writeTarget",
    "slot",
    "envelopeSlot",
  ]) || RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_TARGET;

  const persistedSummary = selectedSummaryFirstPlain(sources, [
    "persistedSelectedResultSummary",
    "selectedResultPersistedSummary",
    "selectedResultSummary",
  ]);
  const slotContractSummary = selectedSummaryFirstPlain(sources, [
    "selectedResultPersistedSummarySlotContractSummary",
    "persistedSummarySlotContractSummary",
  ]);
  const handoffContractSummary = selectedSummaryFirstPlain(sources, [
    "runTableFirstNarrowOutputHandoffContractSummary",
    "runtableFirstNarrowOutputHandoffContractSummary",
    "runTableFirstNarrowOutputHandoffContract",
    "runTableFirstNarrowOutputContractSummary",
  ]);

  return {
    requested: true,
    targetPath: selectedSummarySafeToken(targetPath, ""),
    persistedSummary,
    slotContractSummary,
    handoffContractSummary,
    sourceFingerprints: {
      policyFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])),
      sourceFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])),
      sourceInputFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceInputFingerprint", "currentSourceInputFingerprint"])),
      sourceVersionFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["sourceVersionFingerprint", "sourceVersionMarker", "boardDataSourceVersion"])),
      persistedSelectedResultSummaryFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["persistedSelectedResultSummaryFingerprint", "selectedResultPersistedSummaryFingerprint"])),
      selectedResultPersistedSummarySlotContractFingerprint: selectedSummarySafeFingerprint(selectedSummaryFirstValue(sources, ["selectedResultPersistedSummarySlotContractFingerprint", "persistedSummarySlotContractFingerprint"])),
    },
    rawInputForSafetyScan: {
      directWrite,
      runTableFirstNarrowOutputSummary: directWrite.runTableFirstNarrowOutputSummary || contributionDownstream.runTableFirstNarrowOutputSummary || contextSelectorDownstream.runTableFirstNarrowOutputSummary || null,
      runTableFirstNarrowOutputSummaryCandidate: directWrite.runTableFirstNarrowOutputSummaryCandidate || contributionDownstream.runTableFirstNarrowOutputSummaryCandidate || contextSelectorDownstream.runTableFirstNarrowOutputSummaryCandidate || null,
      runTableFirstNarrowOutputHandoffSummary: directWrite.runTableFirstNarrowOutputHandoffSummary || contributionDownstream.runTableFirstNarrowOutputHandoffSummary || contextSelectorDownstream.runTableFirstNarrowOutputHandoffSummary || null,
      runTableFirstNarrowOutputHandoffSummaryCandidate: directWrite.runTableFirstNarrowOutputHandoffSummaryCandidate || contributionDownstream.runTableFirstNarrowOutputHandoffSummaryCandidate || contextSelectorDownstream.runTableFirstNarrowOutputHandoffSummaryCandidate || null,
      runTableFirstNarrowOutputHandoffContractSummary: handoffContractSummary,
    },
    context: sanitiseSelectedResultSummaryContext(context),
    moduleContributions: sanitiseSelectedResultSummaryModuleContributions(moduleContributions),
  };
}

function envelopeSelectedResultSummary(envelope) {
  return isPlainObject(envelope?.modules?.cs_selector?.downstreamContext?.selectedResultSummary)
    ? envelope.modules.cs_selector.downstreamContext.selectedResultSummary
    : {};
}

function slotContractReadyForRunTable(writeRequest) {
  const slotContract = isPlainObject(writeRequest.slotContractSummary) ? writeRequest.slotContractSummary : {};
  return slotContract.selectedResultPersistedSummarySlotContractReady === true
    || slotContract.state === SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.contractReady
    || slotContract.persistedSummarySlotContractState === SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.contractReady;
}

function resolveRunTableFirstNarrowOutputHandoffContract(writeRequest, envelope) {
  if (isPlainObject(writeRequest.handoffContractSummary) && Object.keys(writeRequest.handoffContractSummary).length > 0) {
    return writeRequest.handoffContractSummary;
  }

  const persistedSummary = Object.keys(envelopeSelectedResultSummary(envelope)).length > 0
    ? envelopeSelectedResultSummary(envelope)
    : writeRequest.persistedSummary;
  const fingerprints = writeRequest.sourceFingerprints || {};
  const slotContract = isPlainObject(writeRequest.slotContractSummary) ? writeRequest.slotContractSummary : {};
  const slotContractFingerprints = isPlainObject(slotContract.fingerprints) ? slotContract.fingerprints : {};

  return buildRunTableFirstNarrowOutputHandoffContract({
    selectedResultPersistedSummaryWritten: true,
    selectedResultPersistenceWriteComplete: true,
    selectedResultPersistedSummarySlotContractReady: slotContractReadyForRunTable(writeRequest),
    persistedSelectedResultSummary: persistedSummary,
    policyFingerprint: fingerprints.policyFingerprint || persistedSummary.policyFingerprint,
    sourceFingerprint: fingerprints.sourceFingerprint || persistedSummary.sourceFingerprint,
    sourceInputFingerprint: fingerprints.sourceInputFingerprint || persistedSummary.sourceInputFingerprint,
    sourceVersionFingerprint: fingerprints.sourceVersionFingerprint || persistedSummary.sourceVersionFingerprint,
    persistedSelectedResultSummaryFingerprint: fingerprints.persistedSelectedResultSummaryFingerprint || persistedSummary.persistedSelectedResultSummaryFingerprint,
    selectedResultPersistedSummarySlotContractFingerprint: fingerprints.selectedResultPersistedSummarySlotContractFingerprint
      || persistedSummary.selectedResultPersistedSummarySlotContractFingerprint
      || slotContract.selectedResultPersistedSummarySlotContractFingerprint
      || slotContract.persistedSummarySlotContractFingerprint
      || slotContractFingerprints.selectedResultPersistedSummarySlotContractFingerprint
      || slotContractFingerprints.selectedResultPersistedSummarySlotContract,
  });
}

function validateRunTableFirstNarrowOutputSummaryTarget(writeRequest, handoffContract) {
  if (writeRequest.targetPath !== RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_TARGET) {
    runTableFirstNarrowOutputSummaryWriteFailure(`target path drifted from shell slot: ${writeRequest.targetPath || "missing"}`);
  }
  const target = isPlainObject(handoffContract.writeTarget) ? handoffContract.writeTarget
    : isPlainObject(handoffContract.slotTarget) ? handoffContract.slotTarget
      : isPlainObject(handoffContract.safeWriteTarget) ? handoffContract.safeWriteTarget
        : {};
  if (!isBlank(target.targetLocation) && target.targetLocation !== RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_TARGET) {
    runTableFirstNarrowOutputSummaryWriteFailure("handoff contract target does not match runTableFirstNarrowOutputSummary shell slot");
  }
  if (!isBlank(target.slot) && target.slot !== RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_TARGET) {
    runTableFirstNarrowOutputSummaryWriteFailure("handoff contract slot does not match runTableFirstNarrowOutputSummary shell slot");
  }
  if (target.owner && target.owner !== "shell") {
    runTableFirstNarrowOutputSummaryWriteFailure("handoff contract target is not shell-owned");
  }
  if (target.moduleId && target.moduleId !== "cs_selector") {
    runTableFirstNarrowOutputSummaryWriteFailure("handoff contract target module is not cs_selector");
  }
  for (const key of ["runtimeDataTarget", "boardDataTarget", "donorDataTarget", "runTableTarget", "iesTarget", "outputTarget", "routeTarget", "postEndpointTarget"]) {
    if (target[key] === true || handoffContract[key] === true) {
      runTableFirstNarrowOutputSummaryWriteFailure(`handoff contract attempted blocked target ${key}`);
    }
  }
}

function validateRunTableFirstNarrowOutputHandoffAuthority(handoffContract) {
  if (handoffContract.state !== RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady
    || handoffContract.runTableFirstNarrowOutputHandoffContractReady !== true
    || handoffContract.failClosed === true) {
    runTableFirstNarrowOutputSummaryWriteFailure(handoffContract.blocker || "runtable-first-narrow-output-handoff-contract-not-ready");
  }
  const requirements = isPlainObject(handoffContract.requirements) ? handoffContract.requirements : {};
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES) {
    if (requirements[key] !== true) runTableFirstNarrowOutputSummaryWriteFailure(key);
  }
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS) {
    if (handoffContract[key] !== false) runTableFirstNarrowOutputSummaryWriteFailure(`required false handoff flag not false: ${key}`);
    if (isPlainObject(handoffContract.safetyFlags) && handoffContract.safetyFlags[key] !== false) {
      runTableFirstNarrowOutputSummaryWriteFailure(`required false handoff safety flag not false: ${key}`);
    }
  }
  if (handoffContract.rowsIncluded === true || handoffContract.rowCount > 0 || Array.isArray(handoffContract.rows) && handoffContract.rows.length > 0) {
    runTableFirstNarrowOutputSummaryWriteFailure("raw-runtable-rows-not-approved");
  }
}

function buildRedactedRunTableFirstNarrowOutputSummary(handoffContract) {
  const fingerprints = isPlainObject(handoffContract.fingerprints) ? handoffContract.fingerprints : {};
  const summary = {
    schemaId: handoffContract.summarySchemaId || RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: handoffContract.summarySchemaVersion || RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_runtable_first_narrow_output_summary_persisted",
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
    runTableFirstNarrowOutputHandoffContractState: selectedSummarySafeToken(handoffContract.runTableFirstNarrowOutputHandoffContractState || handoffContract.state, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady),
    runTableFirstNarrowOutputHandoffContractReady: true,
    acceptedSelectedResultAuthorityState: selectedSummarySafeToken(handoffContract.acceptedSelectedResultAuthorityState, "accepted_selected_result_authority"),
    selectedResultPersistenceAuthorityPreflightState: selectedSummarySafeToken(handoffContract.selectedResultPersistenceAuthorityPreflightState, "ready_for_persistence_authority"),
    selectedResultPersistenceBoundaryState: selectedSummarySafeToken(handoffContract.selectedResultPersistenceBoundaryState, "selected_result_persistence_boundary_contract_ready"),
    selectedResultOutputReadinessPreflightState: selectedSummarySafeToken(handoffContract.selectedResultOutputReadinessPreflightState, "selected_result_output_readiness_ready_for_persistence"),
    policyFingerprint: selectedSummarySafeFingerprint(fingerprints.policyFingerprint || handoffContract.policyFingerprint),
    sourceFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceFingerprint || handoffContract.sourceFingerprint),
    sourceInputFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceInputFingerprint || handoffContract.sourceInputFingerprint),
    sourceVersionFingerprint: selectedSummarySafeFingerprint(fingerprints.sourceVersionFingerprint || handoffContract.sourceVersionFingerprint),
    persistedSelectedResultSummaryFingerprint: selectedSummarySafeFingerprint(fingerprints.persistedSelectedResultSummaryFingerprint || handoffContract.persistedSelectedResultSummaryFingerprint),
    selectedResultPersistedSummarySlotContractFingerprint: selectedSummarySafeFingerprint(fingerprints.selectedResultPersistedSummarySlotContractFingerprint || handoffContract.selectedResultPersistedSummarySlotContractFingerprint),
    runTableFirstNarrowOutputHandoffContractFingerprint: selectedSummarySafeFingerprint(fingerprints.runTableFirstNarrowOutputHandoffContractFingerprint || handoffContract.runTableFirstNarrowOutputHandoffContractFingerprint),
  };

  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS) {
    summary[key] = false;
  }

  const allowed = new Set(RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_ELIGIBLE_FIELD_SET);
  return Object.fromEntries(Object.entries(summary).filter(([key]) => allowed.has(key)));
}

function findUnsafeRunTableFirstNarrowOutputInput(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    return SELECTED_RESULT_SUMMARY_PRIVATE_VALUE_PATTERN.test(value) ? "private-path-or-filename-not-approved" : null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = findUnsafeRunTableFirstNarrowOutputInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (key === "rows" && Array.isArray(nested) && nested.length > 0) {
      return "blocked-raw-field-rows";
    }
    if (SELECTED_RESULT_SUMMARY_RAW_BODY_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) {
      return `blocked-raw-field-${selectedSummarySafeToken(key, "unsafe")}`;
    }
    if (RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.includes(key) && nested === true) {
      return `unsafe-true-flag-${selectedSummarySafeToken(key, "flag")}`;
    }
    const child = findUnsafeRunTableFirstNarrowOutputInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function validateRedactedRunTableFirstNarrowOutputSummary(summary) {
  const allowed = new Set(RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_ELIGIBLE_FIELD_SET);
  for (const key of Object.keys(summary)) {
    if (!allowed.has(key)) runTableFirstNarrowOutputSummaryWriteFailure(`summary field not allow-listed: ${key}`);
  }
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_REQUIRED_FIELDS) {
    if (isBlank(summary[key])) runTableFirstNarrowOutputSummaryWriteFailure(`required summary field missing: ${key}`);
  }
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) runTableFirstNarrowOutputSummaryWriteFailure(`required false summary flag not false: ${key}`);
  }
  if (summary.owner !== "shell" || summary.slotOwner !== "shell" || summary.moduleId !== "cs_selector") {
    runTableFirstNarrowOutputSummaryWriteFailure("summary owner/module is not shell-owned cs_selector");
  }
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) {
    runTableFirstNarrowOutputSummaryWriteFailure("summary is not marked diagnostic-only, summary-only, redacted, and machine-value-safe");
  }
  if (summary.rowsIncluded !== false || summary.rowCount !== 0 || summary.generated !== false || summary.generationEnabled !== false || summary.persisted !== false || summary.routeAdded !== false || summary.postEndpointAdded !== false) {
    runTableFirstNarrowOutputSummaryWriteFailure("summary attempted RunTable generation, persistence, route, or POST exposure");
  }
  const unsafe = findUnsafeRunTableFirstNarrowOutputInput(summary);
  if (unsafe) runTableFirstNarrowOutputSummaryWriteFailure(unsafe);
}

function prepareRunTableFirstNarrowOutputSummaryWrite(writeRequest, envelope) {
  if (!writeRequest.requested) return writeRequest;

  const unsafe = findUnsafeRunTableFirstNarrowOutputInput(writeRequest.rawInputForSafetyScan);
  if (unsafe) runTableFirstNarrowOutputSummaryWriteFailure(unsafe);

  const handoffContract = resolveRunTableFirstNarrowOutputHandoffContract(writeRequest, envelope);
  const contractUnsafe = findUnsafeRunTableFirstNarrowOutputInput(handoffContract); 
  if (contractUnsafe) runTableFirstNarrowOutputSummaryWriteFailure(contractUnsafe);
  validateRunTableFirstNarrowOutputSummaryTarget(writeRequest, handoffContract);
  validateRunTableFirstNarrowOutputHandoffAuthority(handoffContract);

  const summary = buildRedactedRunTableFirstNarrowOutputSummary(handoffContract);
  validateRedactedRunTableFirstNarrowOutputSummary(summary);

  return {
    ...writeRequest,
    handoffContract,
    summary,
  };
}

function writeRunTableFirstNarrowOutputSummaryToEnvelope(envelope, summary) {
  if (!isPlainObject(envelope?.modules?.cs_selector)) {
    runTableFirstNarrowOutputSummaryWriteFailure("candidate envelope missing cs_selector module slot");
  }
  if (!isPlainObject(envelope.modules.cs_selector.downstreamContext)) {
    envelope.modules.cs_selector.downstreamContext = {};
  }
  envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary = clone(summary);
  return envelope;
}

function iesFirstNarrowMetadataHandoffWriteFailure(reason) {
  throw new Error(`IES first narrow metadata handoff summary write rejected: ${reason}`);
}

function resolveIesFirstNarrowMetadataHandoffWrite(context = {}, moduleContributions = {}) {
  const selectorContribution = isPlainObject(moduleContributions.cs_selector) ? moduleContributions.cs_selector : {};
  const contributionDownstream = isPlainObject(selectorContribution.downstreamContext) ? selectorContribution.downstreamContext : {};
  const contextSelectorDownstream = isPlainObject(context.downstream?.selector) ? context.downstream.selector : {};
  const directWrite = selectedSummaryFirstPlain(
    [selectorContribution, contributionDownstream, contextSelectorDownstream, context],
    IES_FIRST_NARROW_METADATA_HANDOFF_WRITE_REQUEST_KEYS,
  );
  const sources = [directWrite, selectorContribution, contributionDownstream, contextSelectorDownstream, context];
  const explicitWriteRequested = directWrite.writeRequested === true
    || directWrite.enabled === true
    || directWrite.persist === true
    || directWrite.write === true
    || selectorContribution.iesFirstNarrowMetadataHandoffWriteRequested === true
    || contributionDownstream.iesFirstNarrowMetadataHandoffWriteRequested === true
    || contextSelectorDownstream.iesFirstNarrowMetadataHandoffWriteRequested === true
    || selectorContribution.iesFirstNarrowMetadataHandoffSummaryWriteRequested === true
    || contributionDownstream.iesFirstNarrowMetadataHandoffSummaryWriteRequested === true
    || contextSelectorDownstream.iesFirstNarrowMetadataHandoffSummaryWriteRequested === true;
  const candidateOutputWriteRequest = selectedSummaryFirstPlain(
    [selectorContribution, contributionDownstream, contextSelectorDownstream, context],
    IES_FIRST_NARROW_CANDIDATE_OUTPUT_WRITE_REQUEST_KEYS,
  );
  const candidateOutputRequested = candidateOutputWriteRequest.writeRequested === true
    || candidateOutputWriteRequest.enabled === true
    || candidateOutputWriteRequest.persist === true
    || candidateOutputWriteRequest.write === true
    || selectorContribution.iesFirstNarrowCandidateOutputWriteRequested === true
    || contributionDownstream.iesFirstNarrowCandidateOutputWriteRequested === true
    || contextSelectorDownstream.iesFirstNarrowCandidateOutputWriteRequested === true
    || selectorContribution.iesFirstNarrowCandidateOutputSummaryWriteRequested === true
    || contributionDownstream.iesFirstNarrowCandidateOutputSummaryWriteRequested === true
    || contextSelectorDownstream.iesFirstNarrowCandidateOutputSummaryWriteRequested === true
    || hasOwnPlainKey(candidateOutputWriteRequest, "iesFirstNarrowCandidateOutputSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "iesFirstNarrowCandidateOutputSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "iesFirstNarrowCandidateOutputSummaryCandidate");
  const sourcePhotometryRefHandoffPresent = ["sourcePhotometryRefHandoffSummary", "iesSourcePhotometryRefHandoffSummary"].some((key) => hasOwnPlainKey(directWrite, key)
    || hasOwnPlainKey(contributionDownstream, key)
    || hasOwnPlainKey(contextSelectorDownstream, key));
  const metadataHandoffSummarySourcePresent = ["iesFirstNarrowMetadataHandoffSummary", "iesFirstNarrowMetadataHandoffSummaryCandidate"].some((key) => hasOwnPlainKey(directWrite, key)
    || hasOwnPlainKey(contributionDownstream, key)
    || hasOwnPlainKey(contextSelectorDownstream, key));
  const requested = explicitWriteRequested
    || sourcePhotometryRefHandoffPresent
    || (!candidateOutputRequested && metadataHandoffSummarySourcePresent);

  if (!requested) {
    return {
      requested: false,
      context,
      moduleContributions,
    };
  }

  const targetPath = selectedSummaryFirstValue(sources, [
    "targetPath",
    "targetLocation",
    "writeTarget",
    "slot",
    "envelopeSlot",
  ]) || IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_TARGET;

  const sourcePhotometryRefHandoffSummary = selectedSummaryFirstPlain(sources, [
    "sourcePhotometryRefHandoffSummary",
    "iesSourcePhotometryRefHandoffSummary",
  ]);
  const metadataCandidate = selectedSummaryFirstPlain(sources, [
    "iesFirstNarrowMetadataHandoffSummaryCandidate",
    "iesFirstNarrowMetadataHandoffSummary",
  ]);

  return {
    requested: true,
    targetPath: selectedSummarySafeToken(targetPath, ""),
    sourcePhotometryRefHandoffSummary,
    metadataCandidate,
    rawInputForSafetyScan: {
      directWrite,
      sourcePhotometryRefHandoffSummary,
      metadataCandidate,
    },
    context: sanitiseSelectedResultSummaryContext(context),
    moduleContributions: sanitiseSelectedResultSummaryModuleContributions(moduleContributions),
  };
}

function validateIesFirstNarrowMetadataHandoffTarget(writeRequest) {
  if (writeRequest.targetPath !== IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_TARGET) {
    iesFirstNarrowMetadataHandoffWriteFailure(`target path drifted from shell slot: ${writeRequest.targetPath || "missing"}`);
  }
}

function validateIesSourcePhotometryRefHandoffReady(summary) {
  if (!isPlainObject(summary) || Object.keys(summary).length === 0) {
    iesFirstNarrowMetadataHandoffWriteFailure("missing-source-photometry-ref-handoff-summary");
  }
  if (summary.ok !== true
    || summary.handoffReady !== true
    || summary.readyForFutureCandidateOutput !== true
    || summary.sourcePhotometryStatus !== "real_source_ref_ready"
    || isBlank(summary.sourcePhotometryRef)
    || !IES_SOURCE_PHOTOMETRY_REF_SAFE_PATTERN.test(String(summary.sourcePhotometryRef || ""))
    || summary.selectedResultHandoffState !== "metadata_ready_for_future_candidate_output"
    || summary.selectedResultHandoffReady !== true
    || summary.sourceBacked !== true
    || summary.sourceAnchorOnly !== true
    || summary.opaqueReferenceOnly !== true
    || summary.safeSummaryOnly !== true) {
    iesFirstNarrowMetadataHandoffWriteFailure("source-photometry-ref-handoff-not-ready");
  }
}

function validateIesFirstNarrowMetadataHandoffSummary(summary) {
  const keys = Object.keys(summary);
  for (const key of keys) {
    if (!IES_FIRST_NARROW_METADATA_HANDOFF_REQUIRED_FIELD_SET.has(key)) {
      iesFirstNarrowMetadataHandoffWriteFailure(`summary field not allow-listed: ${key}`);
    }
  }
  for (const key of RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(summary, key)) {
      iesFirstNarrowMetadataHandoffWriteFailure(`required summary field missing: ${key}`);
    }
  }
  if (keys.join("|") !== RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER.join("|")) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary field order drifted");
  }
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID
    || summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION
    || summary.contractId !== RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary schema or contract identity drifted");
  }
  if (summary.owner !== "shell" || summary.slotOwner !== "shell" || summary.moduleId !== "cs_selector" || summary.consumerModuleId !== "ies_builder") {
    iesFirstNarrowMetadataHandoffWriteFailure("summary owner/module is not shell-owned cs_selector to ies_builder metadata handoff");
  }
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary is not marked diagnostic-only, summary-only, redacted, and machine-value-safe");
  }
  if (summary.readOnly !== true || summary.deterministicOnly !== true || summary.candidateOutputOnly !== true) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary is not read-only deterministic candidate-output-only metadata");
  }
  if (summary.productionProof !== false || summary.labProofAuthority !== false) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary attempted proof authority");
  }
  if (summary.sourceBacked !== true || summary.sourceAnchorOnly !== true || summary.opaqueReferenceOnly !== true) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary source photometry reference is not opaque source-backed anchor-only metadata");
  }
  if (summary.sourcePhotometryStatus !== "real_source_ref_ready" || isBlank(summary.sourcePhotometryRef)) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary source photometry reference is not ready");
  }
  if (summary.selectedResultHandoffState !== "metadata_ready_for_future_candidate_output"
    || summary.selectedResultHandoffReady !== true
    || summary.readyForFutureCandidateOutput !== true
    || summary.iesSourcePhotometryRefHandoffReady !== true) {
    iesFirstNarrowMetadataHandoffWriteFailure("summary is not ready for future candidate output metadata handoff");
  }
  const unsafe = findUnsafeIesFirstNarrowMetadataHandoffInput(summary);
  if (unsafe) iesFirstNarrowMetadataHandoffWriteFailure(unsafe);
}

function prepareIesFirstNarrowMetadataHandoffWrite(writeRequest, envelope) {
  if (!writeRequest.requested) return writeRequest;

  if (!isPlainObject(envelope?.modules?.cs_selector)) {
    iesFirstNarrowMetadataHandoffWriteFailure("candidate envelope missing cs_selector module slot");
  }
  validateIesFirstNarrowMetadataHandoffTarget(writeRequest);
  const unsafe = findUnsafeIesFirstNarrowMetadataHandoffInput(writeRequest.rawInputForSafetyScan);
  if (unsafe) iesFirstNarrowMetadataHandoffWriteFailure(unsafe);
  validateIesSourcePhotometryRefHandoffReady(writeRequest.sourcePhotometryRefHandoffSummary);

  const summary = buildRuntimeIesFirstNarrowMetadataHandoffSummary({
    sourcePhotometryRefHandoffSummary: writeRequest.sourcePhotometryRefHandoffSummary,
  });
  validateIesFirstNarrowMetadataHandoffSummary(summary);

  return {
    ...writeRequest,
    summary,
  };
}

function writeIesFirstNarrowMetadataHandoffSummaryToEnvelope(envelope, summary) {
  if (!isPlainObject(envelope?.modules?.cs_selector)) {
    iesFirstNarrowMetadataHandoffWriteFailure("candidate envelope missing cs_selector module slot");
  }
  if (!isPlainObject(envelope.modules.cs_selector.downstreamContext)) {
    envelope.modules.cs_selector.downstreamContext = {};
  }
  envelope.modules.cs_selector.downstreamContext.iesFirstNarrowMetadataHandoffSummary = clone(summary);
  return envelope;
}

function envelopeRunTableFirstNarrowOutputSummary(envelope) {
  return isPlainObject(envelope?.modules?.cs_selector?.downstreamContext?.runTableFirstNarrowOutputSummary)
    ? envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary
    : {};
}

function envelopeIesFirstNarrowMetadataHandoffSummary(envelope) {
  return isPlainObject(envelope?.modules?.cs_selector?.downstreamContext?.iesFirstNarrowMetadataHandoffSummary)
    ? envelope.modules.cs_selector.downstreamContext.iesFirstNarrowMetadataHandoffSummary
    : {};
}

function iesFirstNarrowCandidateOutputWriteFailure(reason) {
  throw new Error(`IES first narrow candidate output summary write rejected: ${reason}`);
}

function resolveIesFirstNarrowCandidateOutputWrite(context = {}, moduleContributions = {}) {
  const selectorContribution = isPlainObject(moduleContributions.cs_selector) ? moduleContributions.cs_selector : {};
  const contributionDownstream = isPlainObject(selectorContribution.downstreamContext) ? selectorContribution.downstreamContext : {};
  const contextSelectorDownstream = isPlainObject(context.downstream?.selector) ? context.downstream.selector : {};
  const directWrite = selectedSummaryFirstPlain(
    [selectorContribution, contributionDownstream, contextSelectorDownstream, context],
    IES_FIRST_NARROW_CANDIDATE_OUTPUT_WRITE_REQUEST_KEYS,
  );
  const sources = [directWrite, selectorContribution, contributionDownstream, contextSelectorDownstream, context];
  const requested = directWrite.writeRequested === true
    || directWrite.enabled === true
    || directWrite.persist === true
    || directWrite.write === true
    || selectorContribution.iesFirstNarrowCandidateOutputWriteRequested === true
    || contributionDownstream.iesFirstNarrowCandidateOutputWriteRequested === true
    || contextSelectorDownstream.iesFirstNarrowCandidateOutputWriteRequested === true
    || selectorContribution.iesFirstNarrowCandidateOutputSummaryWriteRequested === true
    || contributionDownstream.iesFirstNarrowCandidateOutputSummaryWriteRequested === true
    || contextSelectorDownstream.iesFirstNarrowCandidateOutputSummaryWriteRequested === true
    || hasOwnPlainKey(directWrite, "iesFirstNarrowCandidateOutputSummaryCandidate")
    || hasOwnPlainKey(contributionDownstream, "iesFirstNarrowCandidateOutputSummaryCandidate")
    || hasOwnPlainKey(contextSelectorDownstream, "iesFirstNarrowCandidateOutputSummaryCandidate");

  if (!requested) {
    return {
      requested: false,
      context,
      moduleContributions,
    };
  }

  const targetPath = selectedSummaryFirstValue(sources, [
    "targetPath",
    "targetLocation",
    "writeTarget",
    "slot",
    "envelopeSlot",
  ]) || IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_TARGET;

  const runTableFirstNarrowRows = selectedSummaryFirstPlain(sources, ["runTableFirstNarrowRows"]);
  const iesFirstNarrowMetadataHandoffSummary = selectedSummaryFirstPlain(sources, ["iesFirstNarrowMetadataHandoffSummary"]);
  const candidate = selectedSummaryFirstPlain(sources, [
    "iesFirstNarrowCandidateOutputSummaryCandidate",
    "iesFirstNarrowCandidateOutputSummary",
  ]);

  return {
    requested: true,
    targetPath: selectedSummarySafeToken(targetPath, ""),
    runTableFirstNarrowRows,
    iesFirstNarrowMetadataHandoffSummary,
    candidate,
    rawInputForSafetyScan: {
      directWrite,
      runTableFirstNarrowRows,
      iesFirstNarrowMetadataHandoffSummary,
      candidate,
    },
    context: sanitiseSelectedResultSummaryContext(context),
    moduleContributions: sanitiseSelectedResultSummaryModuleContributions(moduleContributions),
  };
}

function validateIesFirstNarrowCandidateOutputTarget(writeRequest) {
  if (writeRequest.targetPath !== IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_TARGET) {
    iesFirstNarrowCandidateOutputWriteFailure(`target drifted from shell slot: ${writeRequest.targetPath || "missing"}`);
  }
}

function validateIesFirstNarrowCandidateOutputSummary(summary) {
  const keys = Object.keys(summary);
  for (const key of keys) {
    if (!IES_FIRST_NARROW_CANDIDATE_OUTPUT_REQUIRED_FIELD_SET.has(key)) {
      iesFirstNarrowCandidateOutputWriteFailure(`summary field not allow-listed: ${key}`);
    }
  }
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_FIELD_ORDER) {
    if (!Object.prototype.hasOwnProperty.call(summary, key)) {
      iesFirstNarrowCandidateOutputWriteFailure(`required summary field missing: ${key}`);
    }
  }
  if (keys.join("|") !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_FIELD_ORDER.join("|")) {
    iesFirstNarrowCandidateOutputWriteFailure("summary field order drifted");
  }
  if (summary.schemaId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_ID
    || summary.schemaVersion !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_SCHEMA_VERSION
    || summary.contractId !== RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_CONTRACT_ID) {
    iesFirstNarrowCandidateOutputWriteFailure("summary schema or contract identity drifted");
  }
  if (summary.owner !== "shell" || summary.slotOwner !== "shell" || summary.moduleId !== "cs_selector" || summary.consumerModuleId !== "ies_builder") {
    iesFirstNarrowCandidateOutputWriteFailure("summary owner/module is not shell-owned cs_selector to ies_builder candidate output");
  }
  if (summary.summaryOnly !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true || summary.redacted !== true || summary.machineValueSafe !== true) {
    iesFirstNarrowCandidateOutputWriteFailure("summary is not marked diagnostic-only, summary-only, redacted, and machine-value-safe");
  }
  if (summary.readOnly !== true || summary.deterministicOnly !== true || summary.candidateOutputOnly !== true) {
    iesFirstNarrowCandidateOutputWriteFailure("summary is not read-only deterministic candidate-output-only");
  }
  if (summary.productionProof !== false || summary.labProofAuthority !== false) {
    iesFirstNarrowCandidateOutputWriteFailure("summary attempted proof authority");
  }
  if (summary.sourceBacked !== true || summary.sourceAnchorOnly !== true || summary.opaqueReferenceOnly !== true) {
    iesFirstNarrowCandidateOutputWriteFailure("summary source references are not opaque source-backed anchor-only metadata");
  }
  if (summary.runTableFirstNarrowRowsReady !== true
    || summary.iesFirstNarrowMetadataHandoffReady !== true
    || summary.readyForSafeCandidateBoundary !== true
    || summary.rowsJoined !== true) {
    iesFirstNarrowCandidateOutputWriteFailure("summary did not join ready RunTable rows and IES metadata handoff");
  }
  if (summary.sourceRowsIncluded !== false || summary.sourceRunTableRowCount !== 1 || summary.candidateOutputRecordCount !== 1) {
    iesFirstNarrowCandidateOutputWriteFailure("summary attempted raw row inclusion or invalid candidate record count");
  }
  for (const key of RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_REQUIRED_FALSE_FLAGS) {
    if (summary[key] !== false) iesFirstNarrowCandidateOutputWriteFailure(`required false candidate output flag not false: ${key}`);
  }
  const unsafe = findUnsafeIesFirstNarrowCandidateOutputInput(summary);
  if (unsafe) iesFirstNarrowCandidateOutputWriteFailure(unsafe);
}

function prepareIesFirstNarrowCandidateOutputWrite(writeRequest, envelope) {
  if (!writeRequest.requested) return writeRequest;

  if (!isPlainObject(envelope?.modules?.cs_selector)) {
    iesFirstNarrowCandidateOutputWriteFailure("candidate envelope missing cs_selector module slot");
  }
  validateIesFirstNarrowCandidateOutputTarget(writeRequest);
  const unsafe = findUnsafeIesFirstNarrowCandidateOutputInput(writeRequest.rawInputForSafetyScan);
  if (unsafe) iesFirstNarrowCandidateOutputWriteFailure(unsafe);

  const metadataHandoffSummary = Object.keys(envelopeIesFirstNarrowMetadataHandoffSummary(envelope)).length > 0
    ? envelopeIesFirstNarrowMetadataHandoffSummary(envelope)
    : writeRequest.iesFirstNarrowMetadataHandoffSummary;
  const summary = buildRuntimeIesFirstNarrowCandidateOutputSummary({
    runTableFirstNarrowRows: writeRequest.runTableFirstNarrowRows,
    iesFirstNarrowMetadataHandoffSummary: metadataHandoffSummary,
  });
  validateIesFirstNarrowCandidateOutputSummary(summary);

  return {
    ...writeRequest,
    summary,
  };
}

function writeIesFirstNarrowCandidateOutputSummaryToEnvelope(envelope, summary) {
  if (!isPlainObject(envelope?.modules?.cs_selector)) {
    iesFirstNarrowCandidateOutputWriteFailure("candidate envelope missing cs_selector module slot");
  }
  if (!isPlainObject(envelope.modules.cs_selector.downstreamContext)) {
    envelope.modules.cs_selector.downstreamContext = {};
  }
  envelope.modules.cs_selector.downstreamContext.iesFirstNarrowCandidateOutputSummary = clone(summary);
  return envelope;
}

function createFixtureEnvelope({ projectId, title, client, site, savedByName, savedByEmail, lifecycleStatus = "draft" }) {
  const now = new Date().toISOString();
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p1-project-browser-fixture",
    browserOnly: true,
    readOnly: true,
    envelopeId: `fixture-${projectId}`,
    projectId,
    title,
    client,
    site,
    createdAt: now,
    updatedAt: now,
    savedAt: now,
    savedBy: {
      identityState: "internal_identified",
      classification: "internal",
      actualRole: "internal_user",
      derivedActualRole: "internal_user",
      actualRoleSource: "p1-project-browser-fixture",
      displayRole: "internal_user",
      displayRoleClamped: false,
      name: savedByName,
      email: savedByEmail,
    },
    project: {
      metadata: {
        projectId,
        title,
        readiness: "browser-fixture",
        source: "p1-project-browser-fixture",
      },
      currentProject: {
        projectId,
        title,
        client,
        site,
        readiness: "browser-fixture",
      },
      selection: {},
    },
    shell: {
      phase: "p1-project-browser-read-only-foundation",
      contractVersion: "fixture",
      visibility: {},
      flags: {},
      downstream: {},
    },
    modules: {
      cs_selector: {
        owner: "cs_selector",
        moduleId: "cs_selector",
        status: "empty",
        state: {},
        downstreamContext: null,
      },
      scene_builder: {
        owner: "scene_builder",
        moduleId: "scene_builder",
        status: "empty",
        state: {},
        downstreamContext: null,
      },
    },
    lifecycle: {
      owner: "shell",
      status: lifecycleStatus,
      custody: {
        ownerName: savedByName,
        ownerEmail: savedByEmail,
      },
      handoff: {
        status: "not-live",
        available: false,
        reason: "P2 save envelope does not enable handoff/share.",
      },
    },
    restore: {
      status: "not-live",
      available: false,
      reason: "Restore/hydrate deferred to P3.",
    },
  };
}

const FIXTURE_ENVELOPES = Object.freeze([
  createFixtureEnvelope({
    projectId: "saved-alpha",
    title: "Saved Alpha project",
    client: "Alpha Client",
    site: "Sydney",
    savedByName: "Workspace User",
    savedByEmail: "internal@controlstack.local",
    lifecycleStatus: "draft",
  }),
  createFixtureEnvelope({
    projectId: "saved-bravo",
    title: "Saved Bravo project",
    client: "Bravo Client",
    site: "Parramatta",
    savedByName: "Internal Engineer",
    savedByEmail: "engineer@controlstack.local",
    lifecycleStatus: "draft",
  }),
]);

export function createSavedProjectStore({ eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "handoff-share-ready",
    source: "p4-shell-handoff-share",
    fixtureEnvelopes: FIXTURE_ENVELOPES.map(clone),
    savedEnvelopes: [],
    save: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p2-shell-save-envelope",
      lastSavedEnvelopeId: null,
      lastSavedProjectId: null,
      lastSavedAt: null,
      lastError: null,
    },
    restore: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p3-shell-restore-hydrate",
      lastRestoredEnvelopeId: null,
      lastRestoredProjectId: null,
      lastRestoredAt: null,
      lastError: null,
      validation: "not-run",
    },
    hydrate: {
      owner: "shell",
      status: "idle",
      live: true,
      source: "p3-shell-restore-hydrate",
      lastHydratedEnvelopeId: null,
      lastHydratedModules: [],
      modulePayloads: {},
      moduleResults: {},
    },
    handoffShare: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p4-shell-handoff-share",
      packagePreparationOnly: true,
      lastPreparedPackageId: null,
      lastPreparedEnvelopeId: null,
      lastPreparedProjectId: null,
      lastPreparedAt: null,
      lastError: null,
      package: null,
      delivery: {
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    },
  };

  function allEnvelopes() {
    return [...state.savedEnvelopes, ...state.fixtureEnvelopes];
  }

  function listProjectSummaries() {
    return allEnvelopes().map((envelope) => ({
      ...summariseProjectEnvelope(envelope),
      selectedResultPersistedSummaryReadbackStatus: buildSelectedResultPersistedSummaryReadbackProjectSummary(envelope),
    }));
  }

  function getProjectEnvelope(projectIdOrEnvelopeId) {
    const envelope = allEnvelopes().find((item) => item.projectId === projectIdOrEnvelopeId || item.envelopeId === projectIdOrEnvelopeId);
    return envelope ? clone(envelope) : null;
  }

  function getSelectedResultPersistedSummaryReadbackStatus(projectIdOrEnvelopeId) {
    const envelope = getProjectEnvelope(projectIdOrEnvelopeId);
    return buildSelectedResultPersistedSummaryReadbackStatus(envelope || {});
  }

  function createCurrentProjectPreviewEnvelope(context = {}) {
    return createSavedProjectEnvelope({
      project: context.project,
      identity: context.identity,
      visibility: context.visibility,
      flags: context.flags,
      downstream: context.downstream,
      contractVersion: context.contractVersion,
      source: "p1-current-project-preview-envelope",
    });
  }

  function getSaveSnapshot() {
    return {
      ...state.save,
      capabilities: {
        save: true,
        updateExistingEnvelope: true,
        list: true,
        inspect: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getRestoreSnapshot() {
    return {
      ...state.restore,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getHydrateSnapshot() {
    return clone(state.hydrate);
  }

  function getHandoffShareSnapshot() {
    return {
      ...clone(state.handoffShare),
      packageSummary: summariseHandoffSharePackage(state.handoffShare.package),
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        prepareHandoff: true,
        prepareShare: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getStoreSnapshot(context = {}) {
    const currentProjectPreview = createCurrentProjectPreviewEnvelope(context);
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: false,
      browserOnly: false,
      schema: "workspace_saved_project.v2-runtime",
      projects: listProjectSummaries(),
      count: allEnvelopes().length,
      savedCount: state.savedEnvelopes.length,
      fixtureCount: state.fixtureEnvelopes.length,
      safeEmpty: allEnvelopes().length === 0,
      currentProjectPreview: summariseProjectEnvelope(currentProjectPreview),
      save: getSaveSnapshot(),
      restore: getRestoreSnapshot(),
      hydrate: getHydrateSnapshot(),
      handoffShare: getHandoffShareSnapshot(),
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function saveCurrentProjectEnvelope(context = {}, moduleContributions = {}) {
    const savedEnvelopeRollback = state.savedEnvelopes.map(clone);
    let browserContext = context;
    try {
      state.save.status = "saving";
      state.save.lastError = null;

      const selectedResultSummaryWrite = prepareSelectedResultPersistedSummaryWrite(context, moduleContributions);
      const runTableFirstNarrowOutputSummaryWriteRequest = resolveRunTableFirstNarrowOutputSummaryWrite(context, moduleContributions);
      const iesFirstNarrowMetadataHandoffWriteRequest = resolveIesFirstNarrowMetadataHandoffWrite(context, moduleContributions);
      const iesFirstNarrowCandidateOutputWriteRequest = resolveIesFirstNarrowCandidateOutputWrite(context, moduleContributions);
      const saveContext = iesFirstNarrowCandidateOutputWriteRequest.requested
        ? iesFirstNarrowCandidateOutputWriteRequest.context
        : iesFirstNarrowMetadataHandoffWriteRequest.requested
          ? iesFirstNarrowMetadataHandoffWriteRequest.context
          : runTableFirstNarrowOutputSummaryWriteRequest.requested
            ? runTableFirstNarrowOutputSummaryWriteRequest.context
            : selectedResultSummaryWrite.requested ? selectedResultSummaryWrite.context : context;
      const saveModuleContributions = iesFirstNarrowCandidateOutputWriteRequest.requested
        ? iesFirstNarrowCandidateOutputWriteRequest.moduleContributions
        : iesFirstNarrowMetadataHandoffWriteRequest.requested
          ? iesFirstNarrowMetadataHandoffWriteRequest.moduleContributions
          : runTableFirstNarrowOutputSummaryWriteRequest.requested
            ? runTableFirstNarrowOutputSummaryWriteRequest.moduleContributions
            : selectedResultSummaryWrite.requested ? selectedResultSummaryWrite.moduleContributions : moduleContributions;
      browserContext = saveContext;

      const projectId = saveContext.project?.metadata?.projectId || saveContext.project?.currentProject?.projectId || "runtime-project";
      const existingIndex = state.savedEnvelopes.findIndex((item) => item.projectId === projectId);
      const previousEnvelope = existingIndex >= 0 ? state.savedEnvelopes[existingIndex] : null;
      const envelope = createSavedProjectEnvelope({
        project: saveContext.project,
        identity: saveContext.identity,
        visibility: saveContext.visibility,
        flags: saveContext.flags,
        downstream: saveContext.downstream,
        contractVersion: saveContext.contractVersion,
        moduleContributions: saveModuleContributions,
        source: "p2-shell-save-envelope",
        previousEnvelope,
      });

      if (selectedResultSummaryWrite.requested) {
        writeSelectedResultPersistedSummaryToEnvelope(envelope, selectedResultSummaryWrite.summary);
      }

      if (runTableFirstNarrowOutputSummaryWriteRequest.requested
        && Object.keys(envelopeSelectedResultSummary(envelope)).length === 0
        && Object.keys(envelopeSelectedResultSummary(previousEnvelope)).length > 0) {
        writeSelectedResultPersistedSummaryToEnvelope(envelope, envelopeSelectedResultSummary(previousEnvelope));
      }

      const runTableFirstNarrowOutputSummaryWrite = prepareRunTableFirstNarrowOutputSummaryWrite(runTableFirstNarrowOutputSummaryWriteRequest, envelope);
      if (runTableFirstNarrowOutputSummaryWrite.requested) {
        writeRunTableFirstNarrowOutputSummaryToEnvelope(envelope, runTableFirstNarrowOutputSummaryWrite.summary);
      }

      if (iesFirstNarrowMetadataHandoffWriteRequest.requested
        && Object.keys(envelopeSelectedResultSummary(envelope)).length === 0
        && Object.keys(envelopeSelectedResultSummary(previousEnvelope)).length > 0) {
        writeSelectedResultPersistedSummaryToEnvelope(envelope, envelopeSelectedResultSummary(previousEnvelope));
      }

      if (iesFirstNarrowMetadataHandoffWriteRequest.requested
        && Object.keys(envelopeRunTableFirstNarrowOutputSummary(envelope)).length === 0
        && Object.keys(envelopeRunTableFirstNarrowOutputSummary(previousEnvelope)).length > 0) {
        writeRunTableFirstNarrowOutputSummaryToEnvelope(envelope, envelopeRunTableFirstNarrowOutputSummary(previousEnvelope));
      }

      const iesFirstNarrowMetadataHandoffWrite = prepareIesFirstNarrowMetadataHandoffWrite(iesFirstNarrowMetadataHandoffWriteRequest, envelope);
      if (iesFirstNarrowMetadataHandoffWrite.requested) {
        writeIesFirstNarrowMetadataHandoffSummaryToEnvelope(envelope, iesFirstNarrowMetadataHandoffWrite.summary);
      }

      if (iesFirstNarrowCandidateOutputWriteRequest.requested
        && Object.keys(envelopeSelectedResultSummary(envelope)).length === 0
        && Object.keys(envelopeSelectedResultSummary(previousEnvelope)).length > 0) {
        writeSelectedResultPersistedSummaryToEnvelope(envelope, envelopeSelectedResultSummary(previousEnvelope));
      }

      if (iesFirstNarrowCandidateOutputWriteRequest.requested
        && Object.keys(envelopeRunTableFirstNarrowOutputSummary(envelope)).length === 0
        && Object.keys(envelopeRunTableFirstNarrowOutputSummary(previousEnvelope)).length > 0) {
        writeRunTableFirstNarrowOutputSummaryToEnvelope(envelope, envelopeRunTableFirstNarrowOutputSummary(previousEnvelope));
      }

      if (iesFirstNarrowCandidateOutputWriteRequest.requested
        && Object.keys(envelopeIesFirstNarrowMetadataHandoffSummary(envelope)).length === 0
        && Object.keys(envelopeIesFirstNarrowMetadataHandoffSummary(previousEnvelope)).length > 0) {
        writeIesFirstNarrowMetadataHandoffSummaryToEnvelope(envelope, envelopeIesFirstNarrowMetadataHandoffSummary(previousEnvelope));
      }

      const iesFirstNarrowCandidateOutputWrite = prepareIesFirstNarrowCandidateOutputWrite(iesFirstNarrowCandidateOutputWriteRequest, envelope);
      if (iesFirstNarrowCandidateOutputWrite.requested) {
        writeIesFirstNarrowCandidateOutputSummaryToEnvelope(envelope, iesFirstNarrowCandidateOutputWrite.summary);
      }

      if (existingIndex >= 0) state.savedEnvelopes[existingIndex] = envelope;
      else state.savedEnvelopes.unshift(envelope);
      state.save.status = "saved";
      state.save.lastSavedEnvelopeId = envelope.envelopeId;
      state.save.lastSavedProjectId = envelope.projectId;
      state.save.lastSavedAt = envelope.savedAt;
      const selectedResultPersistedSummaryReadbackStatus = buildSelectedResultPersistedSummaryReadbackStatus(envelope);
      const result = {
        accepted: true,
        status: "saved",
        envelopeId: envelope.envelopeId,
        projectId: envelope.projectId,
        savedAt: envelope.savedAt,
        updatedExisting: existingIndex >= 0,
        selectedResultPersistedSummaryWritten: selectedResultSummaryWrite.requested === true,
        selectedResultPersistedSummaryTarget: selectedResultSummaryWrite.requested ? SELECTED_RESULT_SUMMARY_TARGET : null,
        runTableFirstNarrowOutputSummaryWritten: runTableFirstNarrowOutputSummaryWrite.requested === true,
        runTableFirstNarrowOutputSummaryTarget: runTableFirstNarrowOutputSummaryWrite.requested ? RUNTABLE_FIRST_NARROW_OUTPUT_SUMMARY_TARGET : null,
        iesFirstNarrowMetadataHandoffSummaryWritten: iesFirstNarrowMetadataHandoffWrite.requested === true,
        iesFirstNarrowMetadataHandoffSummaryTarget: iesFirstNarrowMetadataHandoffWrite.requested ? IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_TARGET : null,
        iesFirstNarrowCandidateOutputSummaryWritten: iesFirstNarrowCandidateOutputWrite.requested === true,
        iesFirstNarrowCandidateOutputSummaryTarget: iesFirstNarrowCandidateOutputWrite.requested ? IES_FIRST_NARROW_CANDIDATE_OUTPUT_SUMMARY_TARGET : null,
        selectedResultPersistedSummaryReadbackStatus,
        envelope: clone(envelope),
        browser: getStoreSnapshot(saveContext),
      };
      eventBus?.emit("saved-project-store:saved", result);
      return result;
    } catch (error) {
      state.savedEnvelopes = savedEnvelopeRollback;
      state.save.status = "failed";
      state.save.lastError = error?.message || String(error || "Unknown save error");
      const result = {
        accepted: false,
        status: "failed",
        reason: state.save.lastError,
        selectedResultPersistedSummaryReadbackStatus: buildSelectedResultPersistedSummaryReadbackStatus({}),
        browser: getStoreSnapshot(browserContext),
      };
      eventBus?.emit("saved-project-store:save-failed", result);
      return result;
    }
  }

  function restoreProjectEnvelope(projectIdOrEnvelopeId, context = {}) {
    const restoredAt = nowIso();
    const envelope = getProjectEnvelope(projectIdOrEnvelopeId);
    if (!envelope) {
      state.restore.status = "failed";
      state.restore.lastError = `Saved project not found: ${projectIdOrEnvelopeId}`;
      state.restore.validation = "missing";
      return {
        accepted: false,
        status: "failed",
        reason: state.restore.lastError,
        browser: getStoreSnapshot(context),
      };
    }

    const validation = validateSavedProjectEnvelope(envelope);
    if (!validation.valid) {
      state.restore.status = "failed";
      state.restore.lastError = validation.reason;
      state.restore.validation = "failed";
      return {
        accepted: false,
        status: "failed",
        reason: validation.reason,
        envelope,
        browser: getStoreSnapshot(context),
      };
    }

    if (envelope.readOnly === true || envelope.browserOnly === true) {
      state.restore.status = "rejected";
      state.restore.lastError = "Fixture/read-only envelopes cannot be restored in P3. Save a runtime envelope first.";
      state.restore.validation = "read-only-rejected";
      return {
        accepted: false,
        status: "rejected",
        reason: state.restore.lastError,
        envelope,
        browser: getStoreSnapshot(context),
      };
    }

    state.restore.status = "restoring";
    state.restore.lastError = null;
    state.restore.validation = "passed";
    const modulePayloads = createHydrationPayloadsFromEnvelope(envelope);
    const moduleResults = createHydrationResultsFromEnvelope(envelope);
    const lastHydratedModules = Object.keys(moduleResults);
    state.restore.status = "restored";
    state.restore.lastRestoredEnvelopeId = envelope.envelopeId;
    state.restore.lastRestoredProjectId = envelope.projectId;
    state.restore.lastRestoredAt = restoredAt;
    state.hydrate.status = "prepared";
    state.hydrate.lastHydratedEnvelopeId = envelope.envelopeId;
    state.hydrate.lastHydratedModules = lastHydratedModules;
    state.hydrate.modulePayloads = modulePayloads;
    state.hydrate.moduleResults = moduleResults;
    const result = {
      accepted: true,
      status: "restored",
      envelopeId: envelope.envelopeId,
      projectId: envelope.projectId,
      restoredAt,
      shellProjectUpdated: true,
      envelope,
      hydrate: getHydrateSnapshot(),
      hydratedModules: Object.values(moduleResults),
      browser: getStoreSnapshot(context),
    };
    eventBus?.emit("saved-project-store:restored", result);
    return result;
  }

  function resolvePackageEnvelope(context = {}) {
    const envelopeId = context.project?.metadata?.restoredEnvelopeId || state.restore.lastRestoredEnvelopeId || state.save.lastSavedEnvelopeId || context.projectBrowser?.selectedProjectId || null;
    return envelopeId ? getProjectEnvelope(envelopeId) : null;
  }

  function prepareHandoffSharePackage(context = {}) {
    try {
      state.handoffShare.status = "preparing";
      state.handoffShare.lastError = null;
      const envelope = resolvePackageEnvelope(context);
      const pkg = createHandoffSharePackage({
        context,
        envelope,
        save: getSaveSnapshot(),
        restore: getRestoreSnapshot(),
        hydrate: getHydrateSnapshot(),
      });
      state.handoffShare.status = "prepared";
      state.handoffShare.package = pkg;
      state.handoffShare.lastPreparedPackageId = pkg.packageId;
      state.handoffShare.lastPreparedEnvelopeId = pkg.envelopeId;
      state.handoffShare.lastPreparedProjectId = pkg.projectId;
      state.handoffShare.lastPreparedAt = pkg.preparedAt;
      const result = {
        accepted: true,
        status: "prepared",
        packageId: pkg.packageId,
        projectId: pkg.projectId,
        envelopeId: pkg.envelopeId,
        preparedAt: pkg.preparedAt,
        package: clone(pkg),
        delivery: clone(pkg.delivery),
        browser: getStoreSnapshot(context),
      };
      eventBus?.emit("saved-project-store:handoff-share-prepared", result);
      return result;
    } catch (error) {
      state.handoffShare.status = "failed";
      state.handoffShare.lastError = error?.message || String(error || "Unknown handoff/share preparation error");
      return {
        accepted: false,
        status: "failed",
        reason: state.handoffShare.lastError,
        browser: getStoreSnapshot(context),
      };
    }
  }

  return {
    owner: state.owner,
    status: state.status,
    listProjectSummaries,
    getProjectEnvelope,
    getSelectedResultPersistedSummaryReadbackStatus,
    getStoreSnapshot,
    getSaveSnapshot,
    getRestoreSnapshot,
    getHydrateSnapshot,
    getHandoffShareSnapshot,
    createCurrentProjectPreviewEnvelope,
    saveCurrentProjectEnvelope,
    saveProjectEnvelope(context = {}, moduleContributions = {}) {
      return saveCurrentProjectEnvelope(context, moduleContributions);
    },
    restoreProjectEnvelope,
    prepareHandoffSharePackage,
    requestHandoff(context = {}) {
      return prepareHandoffSharePackage(context);
    },
  };
}
