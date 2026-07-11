import {
  PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SOURCE,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
} from "../../workspace-kernel/projectBrowserService.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES,
} from "../../workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import { stableFingerprint } from "../../workspace-kernel/stableFingerprint.js";

export const IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_CONTRACT_ID =
  "IES-BUILDER-FIRST-SELECTED-PROJECT-IES-EXPORT-DOWNLOAD-SOURCE-BOUNDARY-1";
export const IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_ID =
  "controlstack.runtime.ies-builder.first-selected-project-ies-export-download-source-boundary.v1";
export const IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_VERSION = 1;

export const IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES = Object.freeze({
  ready: "ies_builder_selected_project_ies_export_download_source_ready",
  missing: "ies_builder_selected_project_ies_export_download_source_missing",
  blockedFailClosed: "ies_builder_selected_project_ies_export_download_source_blocked_fail_closed",
});

export const IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "sourceKind",
  "selectedProjectId",
  "projectId",
  "envelopeId",
  "lookupId",
  "lookupIdKind",
  "sourceDetailSchemaId",
  "sourceDetailSchemaVersion",
  "sourceDetailState",
  "sourceDetailReadiness",
  "sourceDetailFingerprint",
  "sourceReadbackStatusSchemaId",
  "sourceReadbackStatusSchemaVersion",
  "sourceReadbackState",
  "sourceReadbackReadiness",
  "sourceReadbackFingerprint",
  "readOnly",
  "selectedProjectOnly",
  "scalarSafe",
  "exactReadbackStatusRetainedInternally",
  "savedProjectGetterCallCount",
  "projectEnvelopeGetterCalled",
  "browserTriggerInvoked",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
  "sourceBoundaryFingerprint",
]);

const SELECTED_PROJECT_DETAIL_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "sourceSummarySchemaId",
  "sourceSummarySchemaVersion",
  "sourceSummaryState",
  "sourceSummaryReadiness",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "resultReadbackState",
  "resultReadbackReadiness",
  "resultReadbackReady",
  "resultReadbackFailClosed",
  "resultReadbackBlocker",
  "moduleId",
  "consumerModuleId",
  "targetLocation",
  "safeReadbackStatusOnly",
  "readOnly",
  "selectedProjectOnly",
  "detailOnly",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceReadbackFingerprint",
  "sourceProjectBrowserProjectIesExportResultReadbackSummaryFingerprint",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
  "projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint",
]);

const REQUIRED_DETAIL_TRUE_FLAGS = Object.freeze([
  "selectedProjectFound",
  "resultReadbackReady",
  "safeReadbackStatusOnly",
  "readOnly",
  "selectedProjectOnly",
  "detailOnly",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
]);

const REQUIRED_DETAIL_FALSE_FLAGS = Object.freeze([
  "failClosed",
  "resultReadbackFailClosed",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
]);

const INTERNAL_MATERIALISATION_INPUTS = new WeakMap();
const SOURCE_BOUNDARY_FINGERPRINT_PREFIX =
  "safe-ies-builder-selected-project-ies-export-download-source-boundary";
const RESULT_READBACK_FINGERPRINT_PREFIX =
  "safe-ies-first-narrow-project-ies-export-result-readback-status";
const RESULT_READBACK_FINGERPRINT_PATTERN =
  /^safe-ies-first-narrow-project-ies-export-result-readback-status:[0-9a-f]{40}$/;
const DETAIL_FINGERPRINT_PATTERN =
  /^safe-project-browser-selected-project-ies-export-result-readback-detail-summary:[0-9a-f]{40}$/;
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,760}$/;
const PRIVATE_OR_OUTPUT_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|data:[^\s]*base64|\bbase64\s*[,=:]|\bTILT\s*=|\bLM-63\b|\.ies(?:$|[\s?#]))/i;

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
  if (!token || PRIVATE_OR_OUTPUT_VALUE_PATTERN.test(token) || !SAFE_TOKEN_PATTERN.test(token)) return fallback;
  return token;
}

function scalarSafeObject(value) {
  if (!isPlainObject(value)) return false;
  return Object.values(value).every((item) => (
    item === null || ["string", "number", "boolean"].includes(typeof item)
  ));
}

function orderedBoundary(fields) {
  return Object.fromEntries(
    IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
}

function finaliseBoundary(fields) {
  const fingerprintSource = Object.fromEntries(
    IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_FIELD_ORDER
      .filter((key) => key !== "sourceBoundaryFingerprint")
      .map((key) => [key, fields[key]]),
  );
  return Object.freeze(orderedBoundary({
    ...fields,
    sourceBoundaryFingerprint: stableFingerprint(
      SOURCE_BOUNDARY_FINGERPRINT_PREFIX,
      fingerprintSource,
    ),
  }));
}

function boundaryFields({
  state,
  blocker,
  detail = null,
  lookupId = null,
  lookupIdKind = null,
  readbackStatus = null,
  savedProjectGetterCallCount = 0,
} = {}) {
  const ready = state === IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.ready;
  const readiness = ready
    ? "ready"
    : state === IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.missing
      ? "missing"
      : "blocked_fail_closed";
  return {
    schemaId: IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_ID,
    schemaVersion: IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_SCHEMA_VERSION,
    contractId: IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_CONTRACT_ID,
    state,
    readiness,
    ready,
    failClosed: !ready,
    blocker: ready ? null : safeToken(blocker, "selected-project-ies-export-download-source-blocked"),
    sourceKind: "selected-project-ies-export-result-readback-status-only",
    selectedProjectId: safeToken(detail?.selectedProjectId),
    projectId: safeToken(detail?.projectId),
    envelopeId: safeToken(detail?.envelopeId),
    lookupId: safeToken(lookupId),
    lookupIdKind: safeToken(lookupIdKind),
    sourceDetailSchemaId: safeToken(detail?.schemaId),
    sourceDetailSchemaVersion: Number.isSafeInteger(detail?.schemaVersion) ? detail.schemaVersion : null,
    sourceDetailState: safeToken(detail?.state),
    sourceDetailReadiness: safeToken(detail?.readiness),
    sourceDetailFingerprint: safeToken(
      detail?.projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint,
    ),
    sourceReadbackStatusSchemaId: safeToken(readbackStatus?.schemaId),
    sourceReadbackStatusSchemaVersion: Number.isSafeInteger(readbackStatus?.schemaVersion)
      ? readbackStatus.schemaVersion
      : null,
    sourceReadbackState: safeToken(readbackStatus?.state),
    sourceReadbackReadiness: safeToken(readbackStatus?.readiness),
    sourceReadbackFingerprint: safeToken(
      readbackStatus?.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    ),
    readOnly: true,
    selectedProjectOnly: true,
    scalarSafe: true,
    exactReadbackStatusRetainedInternally: ready,
    savedProjectGetterCallCount,
    projectEnvelopeGetterCalled: false,
    browserTriggerInvoked: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    filesystemWriteAttempted: false,
  };
}

function blockedBoundary(blocker, options = {}) {
  const missing = blocker === "selected-project-ies-export-result-detail-summary-missing"
    || blocker === "selected-project-ies-export-result-detail-not-ready";
  return finaliseBoundary(boundaryFields({
    ...options,
    state: missing
      ? IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.missing
      : IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.blockedFailClosed,
    blocker,
  }));
}

function validateSelectedProjectDetail(detail) {
  if (!isPlainObject(detail) || Object.keys(detail).length === 0) {
    return "selected-project-ies-export-result-detail-summary-missing";
  }
  if (!Object.isFrozen(detail) || !hasExactKeys(detail, SELECTED_PROJECT_DETAIL_FIELD_ORDER)) {
    return "selected-project-ies-export-result-detail-shape-invalid";
  }
  if (!scalarSafeObject(detail)) return "selected-project-ies-export-result-detail-non-scalar-field";
  if (detail.schemaId !== PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_ID
    || detail.schemaVersion !== PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION
    || detail.source !== PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_SOURCE) {
    return "selected-project-ies-export-result-detail-schema-mismatch";
  }
  if (detail.state !== PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_RESULT_READBACK_DETAIL_STATES.ready
    || detail.readiness !== "ready"
    || detail.ready !== true
    || detail.failClosed !== false
    || detail.blocker !== null
    || detail.resultReadbackState !== PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready
    || detail.resultReadbackReadiness !== "ready"
    || detail.resultReadbackReady !== true
    || detail.resultReadbackFailClosed !== false
    || detail.resultReadbackBlocker !== null) {
    return "selected-project-ies-export-result-detail-not-ready";
  }
  if (detail.owner !== "shell"
    || detail.moduleId !== "cs_selector"
    || detail.consumerModuleId !== "ies_builder") {
    return "selected-project-ies-export-result-detail-owner-mismatch";
  }
  for (const key of REQUIRED_DETAIL_TRUE_FLAGS) {
    if (detail[key] !== true) return `selected-project-ies-export-result-detail-required-flag-not-true-${key}`;
  }
  for (const key of REQUIRED_DETAIL_FALSE_FLAGS) {
    if (detail[key] !== false) return `selected-project-ies-export-result-detail-required-flag-not-false-${key}`;
  }
  if (!safeToken(detail.selectedProjectId)
    || (!safeToken(detail.envelopeId) && !safeToken(detail.selectedProjectId))) {
    return "selected-project-ies-export-result-detail-lookup-id-missing";
  }
  if (!RESULT_READBACK_FINGERPRINT_PATTERN.test(String(detail.sourceReadbackFingerprint || ""))
    || !DETAIL_FINGERPRINT_PATTERN.test(String(
      detail.projectBrowserSelectedProjectIesExportResultReadbackDetailFingerprint || "",
    ))) {
    return "selected-project-ies-export-result-detail-fingerprint-invalid";
  }
  return null;
}

function validateReadbackStatus(status, detail) {
  if (!isPlainObject(status) || !Object.isFrozen(status) || !scalarSafeObject(status)) {
    return "selected-project-ies-export-result-readback-status-shape-invalid";
  }
  if (status.schemaId !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_ID
    || status.schemaVersion !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_SCHEMA_VERSION) {
    return "selected-project-ies-export-result-readback-status-schema-mismatch";
  }
  if (status.state !== RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.ready
    || status.readiness !== "ready"
    || status.ready !== true
    || status.failClosed !== false
    || status.blocker !== null
    || status.owner !== "shell"
    || status.moduleId !== "cs_selector"
    || status.consumerModuleId !== "ies_builder"
    || status.readOnly !== true
    || status.redacted !== true
    || status.machineValueSafe !== true) {
    return "selected-project-ies-export-result-readback-status-not-ready";
  }
  const fingerprint = status.iesFirstNarrowProjectIesExportResultReadbackFingerprint;
  if (!RESULT_READBACK_FINGERPRINT_PATTERN.test(String(fingerprint || ""))) {
    return "selected-project-ies-export-result-readback-status-fingerprint-invalid";
  }
  const fingerprintSource = { ...status };
  delete fingerprintSource.iesFirstNarrowProjectIesExportResultReadbackFingerprint;
  if (fingerprint !== stableFingerprint(RESULT_READBACK_FINGERPRINT_PREFIX, fingerprintSource)) {
    return "selected-project-ies-export-result-readback-status-fingerprint-mismatch";
  }
  if (fingerprint !== detail.sourceReadbackFingerprint) {
    return "selected-project-ies-export-result-readback-fingerprint-mismatch";
  }
  return null;
}

export async function resolveIesBuilderSelectedProjectIesExportDownloadSourceBoundary({
  context = {},
  services = {},
} = {}) {
  const detail = context?.projectBrowser?.selectedProjectIesExportResultReadbackDetailSummary;
  const detailBlocker = validateSelectedProjectDetail(detail);
  if (detailBlocker) return blockedBoundary(detailBlocker, { detail });

  const lookupId = safeToken(detail.envelopeId) || safeToken(detail.selectedProjectId);
  const lookupIdKind = safeToken(detail.envelopeId) ? "envelopeId" : "selectedProjectId";
  if (!lookupId) {
    return blockedBoundary("selected-project-ies-export-result-detail-lookup-id-missing", {
      detail,
    });
  }

  const getter = services?.savedProjects?.getIesFirstNarrowProjectIesExportResultReadbackStatus;
  if (typeof getter !== "function") {
    return blockedBoundary("saved-project-ies-export-result-readback-getter-unavailable", {
      detail,
      lookupId,
      lookupIdKind,
    });
  }

  let readbackStatus;
  try {
    readbackStatus = await getter.call(services.savedProjects, lookupId);
  } catch {
    return blockedBoundary("saved-project-ies-export-result-readback-getter-failed", {
      detail,
      lookupId,
      lookupIdKind,
      savedProjectGetterCallCount: 1,
    });
  }

  const statusBlocker = validateReadbackStatus(readbackStatus, detail);
  if (statusBlocker) {
    return blockedBoundary(statusBlocker, {
      detail,
      lookupId,
      lookupIdKind,
      readbackStatus,
      savedProjectGetterCallCount: 1,
    });
  }

  const boundary = finaliseBoundary(boundaryFields({
    state: IES_BUILDER_FIRST_SELECTED_PROJECT_IES_EXPORT_DOWNLOAD_SOURCE_BOUNDARY_STATES.ready,
    blocker: null,
    detail,
    lookupId,
    lookupIdKind,
    readbackStatus,
    savedProjectGetterCallCount: 1,
  }));
  INTERNAL_MATERIALISATION_INPUTS.set(boundary, readbackStatus);
  return boundary;
}

export function getIesBuilderSelectedProjectIesExportDownloadInternalMaterialisationInput(boundary) {
  return INTERNAL_MATERIALISATION_INPUTS.get(boundary) || null;
}
