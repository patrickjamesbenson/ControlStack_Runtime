import { createHash } from "node:crypto";

export const RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID = "RUNTIME-IES-FIRST-NARROW-METADATA-HANDOFF-1";
export const RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID = "controlstack.runtime.ies-first-narrow-metadata-handoff-summary.v1";
export const RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowMetadataHandoffSummary";

export const RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "consumerModuleId",
  "state",
  "sourceKind",
  "futureOutputKind",
  "summaryOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "redacted",
  "machineValueSafe",
  "readOnly",
  "deterministicOnly",
  "candidateOutputOnly",
  "productionProof",
  "labProofAuthority",
  "sourceBacked",
  "sourceAnchorOnly",
  "opaqueReferenceOnly",
  "sourcePhotometryStatus",
  "sourcePhotometryRef",
  "selectedResultHandoffState",
  "selectedResultHandoffReady",
  "readyForFutureCandidateOutput",
  "sourceFingerprint",
  "policyFingerprint",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "photometryReferenceFingerprint",
  "oneMmPolicyLabel",
  "iesPhotometryReferenceToken",
  "lumenCurveReferenceToken",
  "driverUtilCurveReferenceToken",
  "iesSourcePhotometryRefHandoffContractId",
  "iesSourcePhotometryRefHandoffSchemaId",
  "iesSourcePhotometryRefHandoffSchemaVersion",
  "iesSourcePhotometryRefHandoffState",
  "iesSourcePhotometryRefHandoffReady",
  "iesFirstNarrowMetadataHandoffSummaryFingerprint",
]);

const READY_SOURCE_PHOTOMETRY_STATUS = "real_source_ref_ready";
const READY_SELECTED_RESULT_HANDOFF_STATE = "metadata_ready_for_future_candidate_output";
const PERSISTED_STATE = "redacted_ies_first_narrow_metadata_handoff_summary_persisted";
const SAFE_SOURCE_PHOTOMETRY_REF_PATTERN = /^safe-source-photometry-ref:[0-9a-f]{40}$/;
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,700}$/;
const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/]|ControlStack_RuntimeData)/i;
const RAW_IES_TEXT_PATTERN = /IESNA:|TILT=/i;
const DATA_BASE64_PATTERN = /data:[^\s"']*base64|base64,/i;
const FILE_EXTENSION_VALUE_PATTERN = /(?:^|[\s\\/])[^\s\\/]+\.(?:ies|pdf|csv|json)(?:$|[\s?#])/i;

const UNSAFE_TRUE_FLAGS = Object.freeze([
  "slugGenerationEnabled",
  "slugGenerated",
  "productionSlugGenerated",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "photometryGenerationEnabled",
  "photometryGenerationAttempted",
  "outputGenerationEnabled",
  "outputGenerationAttempted",
  "outputGenerated",
  "artifactGenerationEnabled",
  "artefactGenerationEnabled",
  "rawIesContentReturned",
  "rawIesReturned",
  "rawIesExposed",
  "rawIesContentExposed",
  "rawPhotometryReturned",
  "rawPhotometryRefExposed",
  "rawPhotometryPayloadExposed",
  "rawCandelaGridExposed",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "filenamesExposed",
  "localPathsReturned",
  "privatePathsReturned",
  "privatePathsExposed",
  "routesAdded",
  "routeAdded",
  "publicRoutesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "postEndpointEnabled",
  "postEndpointsEnabled",
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "persistenceEnabled",
  "persisted",
  "mutationEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
  "boardDataMutated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "productionRunTableGenerated",
]);

const UNSAFE_RAW_KEYS = Object.freeze([
  "ies",
  "iesText",
  "rawIes",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "rawPhotometryPayload",
  "rawPhotometryRef",
  "candela",
  "candelaGrid",
  "candelaArray",
  "candelaArrays",
  "rawCandelaGrid",
  "base64",
  "base64Artifacts",
  "artifactBase64",
  "filename",
  "fileName",
  "localPath",
  "privatePath",
  "privateFilePath",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function hasOwn(source, key) {
  return isRecord(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function firstPresent(source, keys) {
  if (!isRecord(source)) return undefined;
  for (const key of keys) {
    if (hasOwn(source, key) && source[key] !== undefined && source[key] !== null && source[key] !== "") return source[key];
  }
  return undefined;
}

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (!isRecord(value)) return value;
  return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stableValue(value[key])]));
}

function stableSha1(value) {
  return createHash("sha1").update(JSON.stringify(stableValue(value))).digest("hex");
}

function safeToken(value) {
  if (value === null || value === undefined) return null;
  const token = String(value).trim();
  if (!token || PRIVATE_PATH_PATTERN.test(token) || RAW_IES_TEXT_PATTERN.test(token) || DATA_BASE64_PATTERN.test(token)) return null;
  return SAFE_TOKEN_PATTERN.test(token) ? token : null;
}

function sourcePhotometryRefHandoffSummaryFrom(input) {
  if (!isRecord(input)) return {};
  const nested = input.sourcePhotometryRefHandoffSummary
    || input.iesSourcePhotometryRefHandoffSummary
    || input.sourcePhotometryRefHandoff
    || input.iesSourcePhotometryRefHandoff;
  return isRecord(nested) ? nested : input;
}

function sourcePhotometryRefHandoffReady(summary) {
  return isRecord(summary)
    && summary.ok === true
    && summary.handoffReady === true
    && summary.readyForFutureCandidateOutput === true
    && summary.sourcePhotometryStatus === READY_SOURCE_PHOTOMETRY_STATUS
    && SAFE_SOURCE_PHOTOMETRY_REF_PATTERN.test(String(summary.sourcePhotometryRef || ""))
    && summary.selectedResultHandoffState === READY_SELECTED_RESULT_HANDOFF_STATE
    && summary.selectedResultHandoffReady === true
    && summary.sourceBacked === true
    && summary.sourceAnchorOnly === true
    && summary.opaqueReferenceOnly === true
    && summary.safeSummaryOnly === true;
}

export function findUnsafeIesFirstNarrowMetadataHandoffInput(value, depth = 0, seen = new Set()) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value) || RAW_IES_TEXT_PATTERN.test(value) || DATA_BASE64_PATTERN.test(value) || FILE_EXTENSION_VALUE_PATTERN.test(value)) {
      return "ies-first-narrow-metadata-handoff-unsafe-string";
    }
    return null;
  }
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 80)) {
      const nested = findUnsafeIesFirstNarrowMetadataHandoffInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isRecord(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_RAW_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined && nested !== "") {
      return `blocked-raw-field-${key}`;
    }
    if (UNSAFE_TRUE_FLAGS.includes(key) && nested === true) {
      return `unsafe-true-flag-${key}`;
    }
    const child = findUnsafeIesFirstNarrowMetadataHandoffInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function orderedSummary(fields) {
  return Object.fromEntries(RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_FIELD_ORDER.map((key) => [key, fields[key]]));
}

export function buildRuntimeIesFirstNarrowMetadataHandoffSummary(input = {}) {
  const source = sourcePhotometryRefHandoffSummaryFrom(input);
  const ready = sourcePhotometryRefHandoffReady(source);

  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_METADATA_HANDOFF_CONTRACT_ID,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    state: PERSISTED_STATE,
    sourceKind: "ies-source-photometry-ref-handoff-summary",
    futureOutputKind: "ies-first-narrow-metadata-handoff",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    candidateOutputOnly: true,
    productionProof: false,
    labProofAuthority: false,
    sourceBacked: ready ? true : false,
    sourceAnchorOnly: ready ? true : false,
    opaqueReferenceOnly: ready ? true : false,
    sourcePhotometryStatus: ready ? READY_SOURCE_PHOTOMETRY_STATUS : null,
    sourcePhotometryRef: ready ? source.sourcePhotometryRef : null,
    selectedResultHandoffState: ready ? READY_SELECTED_RESULT_HANDOFF_STATE : safeToken(source.selectedResultHandoffState),
    selectedResultHandoffReady: ready,
    readyForFutureCandidateOutput: ready,
    sourceFingerprint: safeToken(source.sourceFingerprint),
    policyFingerprint: safeToken(source.policyFingerprint),
    sourceInputFingerprint: safeToken(source.sourceInputFingerprint),
    boardDataSourceVersion: safeToken(source.boardDataSourceVersion),
    photometryReferenceFingerprint: safeToken(source.photometryReferenceFingerprint),
    oneMmPolicyLabel: safeToken(source.oneMmPolicyLabel),
    iesPhotometryReferenceToken: safeToken(source.iesPhotometryReferenceToken),
    lumenCurveReferenceToken: safeToken(source.lumenCurveReferenceToken),
    driverUtilCurveReferenceToken: safeToken(source.driverUtilCurveReferenceToken),
    iesSourcePhotometryRefHandoffContractId: safeToken(source.contractId),
    iesSourcePhotometryRefHandoffSchemaId: safeToken(source.schemaId),
    iesSourcePhotometryRefHandoffSchemaVersion: Number.isFinite(Number(source.schemaVersion)) ? Number(source.schemaVersion) : null,
    iesSourcePhotometryRefHandoffState: safeToken(source.state),
    iesSourcePhotometryRefHandoffReady: ready,
    iesFirstNarrowMetadataHandoffSummaryFingerprint: null,
  };

  const withoutFingerprint = orderedSummary(fields);
  delete withoutFingerprint.iesFirstNarrowMetadataHandoffSummaryFingerprint;
  fields.iesFirstNarrowMetadataHandoffSummaryFingerprint = `safe-ies-first-narrow-metadata-handoff-summary:${stableSha1(withoutFingerprint)}`;

  return Object.freeze(orderedSummary(fields));
}

export const buildIesFirstNarrowMetadataHandoffSummary = buildRuntimeIesFirstNarrowMetadataHandoffSummary;
