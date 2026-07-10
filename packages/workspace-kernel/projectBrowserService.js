import { stableFingerprint } from "./stableFingerprint.js";
import { buildSelectedResultPersistedSummaryReadbackProjectSummary } from "./savedProjectStore.js";

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-result-persisted-summary-readback-summary.v1";
export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-result-persisted-summary-readback-detail-summary.v1";
export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-selected-result-persisted-summary-readback-status.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-selected-result-persisted-summary-readback-detail-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.project-ies-export-boundary-readback-summary.v1";
export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-ies-export-boundary-readback-detail-summary.v1";
export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.project-ies-export-result-readback-summary.v1";
export const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES = Object.freeze({
  ready: "project_browser_selected_result_persisted_summary_readback_ready",
  missing: "project_browser_selected_result_persisted_summary_readback_missing",
  blockedFailClosed: "project_browser_selected_result_persisted_summary_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES = Object.freeze({
  ready: "project_browser_selected_result_persisted_summary_readback_detail_ready",
  missing: "project_browser_selected_result_persisted_summary_readback_detail_missing",
  blockedFailClosed: "project_browser_selected_result_persisted_summary_readback_detail_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES = Object.freeze({
  ready: "project_browser_selected_project_selected_result_persisted_summary_readback_ready",
  missing: "project_browser_selected_project_selected_result_persisted_summary_readback_missing",
  blockedFailClosed: "project_browser_selected_project_selected_result_persisted_summary_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES = Object.freeze({
  ready: "project_browser_selected_project_selected_result_persisted_summary_readback_detail_ready",
  missing: "project_browser_selected_project_selected_result_persisted_summary_readback_detail_missing",
  blockedFailClosed: "project_browser_selected_project_selected_result_persisted_summary_readback_detail_blocked_fail_closed",
});

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES = Object.freeze({
  ready: "project_browser_project_ies_export_boundary_readback_ready",
  missing: "project_browser_project_ies_export_boundary_readback_missing",
  blockedFailClosed: "project_browser_project_ies_export_boundary_readback_blocked_fail_closed",
});

export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES = Object.freeze({
  ready: "project_browser_selected_project_ies_export_boundary_readback_detail_ready",
  missing: "project_browser_selected_project_ies_export_boundary_readback_detail_missing",
  blockedFailClosed: "project_browser_selected_project_ies_export_boundary_readback_detail_blocked_fail_closed",
});

export const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES = Object.freeze({
  ready: "project_browser_project_ies_export_result_readback_ready",
  missing: "project_browser_project_ies_export_result_readback_missing",
  blockedFailClosed: "project_browser_project_ies_export_result_readback_blocked_fail_closed",
});

const PROJECT_BROWSER_SELECTED_RESULT_READBACK_SOURCE =
  "project-browser-project-summary-selected-result-readback-consumer";
const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_STATUS_SOURCE =
  "project-browser-selected-project-project-summary-selected-result-readback-status-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_DETAIL_SOURCE =
  "project-browser-selected-project-project-summary-selected-result-readback-detail-consumer";
const PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SOURCE =
  "project-browser-saved-project-project-ies-export-boundary-readback-consumer";
export const PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SOURCE =
  "project-browser-selected-project-project-ies-export-boundary-readback-detail-consumer";
const PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SOURCE =
  "project-browser-saved-project-project-ies-export-result-readback-consumer";
const SELECTED_RESULT_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";
const PROJECT_IES_EXPORT_BOUNDARY_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary";
const PROJECT_IES_EXPORT_RESULT_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultSummary";

const READBACK_RAW_OR_PRIVATE_KEYS = Object.freeze([
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
  "downstreamContext",
  "moduleState",
  "envelopeBody",
  "projectEnvelope",
]);

const READBACK_UNSAFE_TRUE_KEYS = Object.freeze([
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "credentialsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "selectedResultPersistenceAttempted",
  "runTableGenerationAttempted",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
]);

const PROJECT_IES_EXPORT_BOUNDARY_RAW_OR_PRIVATE_KEYS = Object.freeze([
  "projectIes",
  "projectIES",
  "projectIesBody",
  "projectIESBody",
  "projectIesText",
  "projectIESText",
  "rawProjectIes",
  "rawProjectIES",
  "rawProjectIesText",
  "rawProjectIESText",
  "ies",
  "iesText",
  "rawIes",
  "rawIES",
  "rawIesText",
  "rawIESText",
  "candela",
  "candelaGrid",
  "candelaArray",
  "candelaArrays",
  "photometry",
  "rawPhotometry",
  "governance",
  "rawGovernance",
  "governancePayload",
  "rawGovernancePayload",
  "outputFiles",
  "files",
  "filename",
  "fileName",
  "filePath",
  "localPath",
  "privatePath",
  "targetPath",
  "writeTarget",
  "base64",
  "base64Artifacts",
  "projectEnvelope",
  "envelopeBody",
]);

const PROJECT_IES_EXPORT_BOUNDARY_UNSAFE_TRUE_KEYS = Object.freeze([
  "rawIesReturned",
  "rawIesExposed",
  "rawProjectIesReturned",
  "rawProjectIesExposed",
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

const PRIVATE_VALUE_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function safeToken(value, fallback = null, maxLength = 220) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_VALUE_PATTERN.test(raw)) return fallback;
  const token = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return token || fallback;
}

function safeBoolean(value) {
  return value === true;
}

function safeSchemaVersion(value) {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const version = Number(value);
  return Number.isFinite(version) ? version : null;
}

function hasNonNullBlocker(value) {
  return value !== null && value !== undefined && String(value).trim() !== "";
}

function readProject(project = {}) {
  return {
    projectId: project.metadata?.projectId || project.currentProject?.projectId || null,
    title: project.metadata?.title || project.currentProject?.title || "No project loaded",
    client: project.currentProject?.client || project.metadata?.client || "No client loaded",
    site: project.currentProject?.site || project.metadata?.site || "No site loaded",
    readiness: project.metadata?.readiness || project.currentProject?.readiness || "not-ready",
    source: project.selection?.source || project.metadata?.source || "unknown",
    restoredEnvelopeId: project.metadata?.restoredEnvelopeId || project.selection?.restoredEnvelopeId || null,
    restoredAt: project.metadata?.restoredAt || null,
    handoffPackageId: project.handoff?.lastPreparedPackageId || null,
    handoffPreparedAt: project.handoff?.lastPreparedAt || null,
  };
}

function projectSummaryId(project = {}) {
  return safeToken(project.projectId || project.envelopeId || null, null);
}

function projectSummaryEnvelopeId(project = {}) {
  return safeToken(project.envelopeId || null, null);
}

function readReadbackStatus(project = {}) {
  return isPlainObject(project?.selectedResultPersistedSummaryReadbackStatus)
    ? project.selectedResultPersistedSummaryReadbackStatus
    : null;
}

function findUnsafeReadbackSummaryField(status) {
  if (!isPlainObject(status)) return null;
  for (const key of Object.keys(status)) {
    if (READBACK_RAW_OR_PRIVATE_KEYS.includes(key)) return `blocked-raw-field-${safeToken(key, "unknown")}`;
    if (READBACK_UNSAFE_TRUE_KEYS.includes(key) && status[key] === true) return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
  }
  for (const value of Object.values(status)) {
    if (typeof value === "string" && PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
  }
  return null;
}

function classifyProjectReadback(project = {}) {
  const status = readReadbackStatus(project);
  if (!status) {
    return {
      readiness: "missing",
      ready: false,
      failClosed: true,
      blocker: "selected-result-persisted-summary-readback-status-missing",
      readbackFingerprint: null,
    };
  }

  const unsafeBlocker = findUnsafeReadbackSummaryField(status);
  if (unsafeBlocker) {
    return {
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: unsafeBlocker,
      readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
    };
  }

  const readiness = safeToken(status.readiness, "missing") || "missing";
  const blocker = safeToken(status.blocker, null);
  const blockedByState = readiness === "blocked_fail_closed"
    || status.state === "selected_result_persisted_summary_readback_blocked_fail_closed";
  const blockedByFailClosed = safeBoolean(status.failClosed)
    && hasNonNullBlocker(status.blocker)
    && readiness !== "missing";

  if (blockedByState || blockedByFailClosed) {
    return {
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: blocker || "project-summary-readback-blocked-fail-closed",
      readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
    };
  }

  if (readiness === "ready" && safeBoolean(status.ready) && status.failClosed !== true) {
    return {
      readiness: "ready",
      ready: true,
      failClosed: false,
      blocker: null,
      readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
    };
  }

  return {
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker,
    readbackFingerprint: safeToken(status.selectedResultPersistedSummaryReadbackFingerprint, null, 760),
  };
}

function readProjectIesExportBoundaryReadbackStatus(project = {}, getReadbackStatus = null) {
  if (isPlainObject(project?.iesFirstNarrowProjectIesExportBoundaryReadbackStatus)) {
    return project.iesFirstNarrowProjectIesExportBoundaryReadbackStatus;
  }
  if (typeof getReadbackStatus !== "function") return null;
  const projectIdOrEnvelopeId = projectSummaryEnvelopeId(project) || projectSummaryId(project);
  if (!projectIdOrEnvelopeId) return null;
  try {
    return getReadbackStatus(projectIdOrEnvelopeId);
  } catch {
    return {
      state: "ies_first_narrow_project_ies_export_boundary_readback_blocked_fail_closed",
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-boundary-readback-accessor-failed",
    };
  }
}

function findUnsafeProjectIesExportBoundaryReadbackField(status) {
  if (!isPlainObject(status)) return null;
  for (const [key, value] of Object.entries(status)) {
    if (PROJECT_IES_EXPORT_BOUNDARY_RAW_OR_PRIVATE_KEYS.includes(key)
      && value !== false
      && value !== null
      && value !== undefined
      && value !== "") {
      return `blocked-raw-field-${safeToken(key, "unknown")}`;
    }
    if (PROJECT_IES_EXPORT_BOUNDARY_UNSAFE_TRUE_KEYS.includes(key) && value === true) {
      return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
    }
    if (typeof value === "string" && PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
  }
  return null;
}

function classifyProjectIesExportBoundaryReadback(status) {
  if (!isPlainObject(status)) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.missing,
      readiness: "missing",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-boundary-readback-status-missing",
      readbackFingerprint: null,
    };
  }

  const readbackFingerprint = safeToken(
    status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint,
    null,
    760,
  );
  const unsafeBlocker = findUnsafeProjectIesExportBoundaryReadbackField(status);
  if (unsafeBlocker) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: unsafeBlocker,
      readbackFingerprint,
    };
  }

  const readiness = safeToken(status.readiness, "missing") || "missing";
  const blocker = safeToken(status.blocker, null);
  const blocked = readiness === "blocked_fail_closed"
    || status.state === "ies_first_narrow_project_ies_export_boundary_readback_blocked_fail_closed"
    || (status.failClosed === true && hasNonNullBlocker(status.blocker) && readiness !== "missing");

  if (blocked) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: blocker || "project-ies-export-boundary-readback-blocked-fail-closed",
      readbackFingerprint,
    };
  }

  if (readiness === "ready" && status.ready === true && status.failClosed !== true) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready,
      readiness: "ready",
      ready: true,
      failClosed: false,
      blocker: null,
      readbackFingerprint,
    };
  }

  return {
    state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.missing,
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: blocker || "project-ies-export-boundary-readback-missing",
    readbackFingerprint,
  };
}

function readProjectIesExportResultReadbackStatus(project = {}, getReadbackStatus = null) {
  if (isPlainObject(project?.iesFirstNarrowProjectIesExportResultReadbackStatus)) {
    return project.iesFirstNarrowProjectIesExportResultReadbackStatus;
  }
  if (typeof getReadbackStatus !== "function") return null;
  const projectIdOrEnvelopeId = projectSummaryEnvelopeId(project) || projectSummaryId(project);
  if (!projectIdOrEnvelopeId) return null;
  try {
    return getReadbackStatus(projectIdOrEnvelopeId);
  } catch {
    return {
      state: "ies_first_narrow_project_ies_export_result_readback_blocked_fail_closed",
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-result-readback-accessor-failed",
    };
  }
}

function findUnsafeProjectIesExportResultReadbackField(status) {
  if (!isPlainObject(status)) return null;
  for (const [key, value] of Object.entries(status)) {
    if ((PROJECT_IES_EXPORT_BOUNDARY_RAW_OR_PRIVATE_KEYS.includes(key)
      || READBACK_RAW_OR_PRIVATE_KEYS.includes(key))
      && value !== false
      && value !== null
      && value !== undefined
      && value !== "") {
      return `blocked-raw-field-${safeToken(key, "unknown")}`;
    }
    if ((PROJECT_IES_EXPORT_BOUNDARY_UNSAFE_TRUE_KEYS.includes(key)
      || READBACK_UNSAFE_TRUE_KEYS.includes(key)) && value === true) {
      return `blocked-unsafe-true-flag-${safeToken(key, "unknown")}`;
    }
    if (typeof value === "string" && PRIVATE_VALUE_PATTERN.test(value)) return "blocked-private-value";
  }
  return null;
}

function classifyProjectIesExportResultReadback(status) {
  if (!isPlainObject(status)) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.missing,
      readiness: "missing",
      ready: false,
      failClosed: true,
      blocker: "project-ies-export-result-readback-status-missing",
      readbackFingerprint: null,
    };
  }

  const readbackFingerprint = safeToken(
    status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
    null,
    760,
  );
  const unsafeBlocker = findUnsafeProjectIesExportResultReadbackField(status);
  if (unsafeBlocker) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: unsafeBlocker,
      readbackFingerprint,
    };
  }

  const readiness = safeToken(status.readiness, "missing") || "missing";
  const blocker = safeToken(status.blocker, null);
  const blocked = readiness === "blocked_fail_closed"
    || status.state === "ies_first_narrow_project_ies_export_result_readback_blocked_fail_closed"
    || (status.failClosed === true && hasNonNullBlocker(status.blocker) && readiness !== "missing");

  if (blocked) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed,
      readiness: "blocked_fail_closed",
      ready: false,
      failClosed: true,
      blocker: blocker || "project-ies-export-result-readback-blocked-fail-closed",
      readbackFingerprint,
    };
  }

  if (readiness === "ready" && status.ready === true && status.failClosed !== true) {
    return {
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready,
      readiness: "ready",
      ready: true,
      failClosed: false,
      blocker: null,
      readbackFingerprint,
    };
  }

  return {
    state: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.missing,
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: blocker || "project-ies-export-result-readback-missing",
    readbackFingerprint,
  };
}

function isSavedProjectSummary(project = {}) {
  if (project.source === "p2-shell-save-envelope") return true;
  return project.readOnly !== true && project.browserOnly !== true;
}

function findSelectedProjectSummary(projects, selectedProjectId) {
  const selectedId = safeToken(selectedProjectId, null);
  if (!selectedId) return null;
  return projects.find((project) => projectSummaryId(project) === selectedId || projectSummaryEnvelopeId(project) === selectedId) || null;
}

export function buildProjectBrowserSelectedResultPersistedSummaryReadbackSummary(projects = [], selectedProjectId = null) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const classifiedProjects = projectSummaries.map((project) => classifyProjectReadback(project));
  const blockedFailClosedProjectCount = classifiedProjects.filter((project) => project.readiness === "blocked_fail_closed").length;
  const readyProjectCount = classifiedProjects.filter((project) => project.ready === true).length;
  const missingProjectCount = classifiedProjects.filter((project) => project.readiness === "missing").length;
  const savedProjectCount = projectSummaries.filter((project) => isSavedProjectSummary(project)).length;
  const fixtureProjectCount = projectSummaries.length - savedProjectCount;
  const state = blockedFailClosedProjectCount > 0
    ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.blockedFailClosed
    : readyProjectCount > 0
      ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready
      : PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.missing;
  const selectedProject = findSelectedProjectSummary(projectSummaries, selectedProjectId);
  const selectedProjectReadback = selectedProject ? classifyProjectReadback(selectedProject) : null;

  const summary = {
    schemaId: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_RESULT_READBACK_SOURCE,
    state,
    readiness: state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready
      ? "ready"
      : state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.blockedFailClosed
        ? "blocked_fail_closed"
        : "missing",
    ready: state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready,
    failClosed: state !== PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready,
    projectCount: projectSummaries.length,
    savedProjectCount,
    fixtureProjectCount,
    readyProjectCount,
    missingProjectCount,
    blockedFailClosedProjectCount,
    selectedProjectId: safeToken(selectedProjectId, null),
    selectedProjectReadiness: selectedProjectReadback?.readiness || null,
    selectedProjectReady: selectedProjectReadback?.ready === true,
    selectedProjectFailClosed: selectedProjectReadback?.failClosed === true,
    selectedProjectBlocker: selectedProjectReadback?.blocker || null,
    selectedProjectReadbackFingerprint: selectedProjectReadback?.readbackFingerprint || null,
    moduleId: "cs_selector",
    targetLocation: SELECTED_RESULT_READBACK_TARGET,
    rawSelectedPayloadReturned: false,
    rawSelectedPayloadExposed: false,
    rawEnginePayloadReturned: false,
    rawEnginePayloadExposed: false,
    rawRunTableRowsReturned: false,
    rawRunTableRowsExposed: false,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    credentialsReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    selectedResultPersistenceAttempted: false,
    runTableGenerationAttempted: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...summary,
    projectBrowserSelectedResultPersistedSummaryReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-selected-result-persisted-summary-readback-summary",
      summary,
    ),
  });
}

export function buildProjectBrowserProjectIesExportBoundaryReadbackSummary(
  projects = [],
  getReadbackStatus = null,
) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const projectStatuses = projectSummaries.map((project) => {
    const classified = classifyProjectIesExportBoundaryReadback(
      readProjectIesExportBoundaryReadbackStatus(project, getReadbackStatus),
    );
    return Object.freeze({
      projectId: projectSummaryId(project),
      envelopeId: projectSummaryEnvelopeId(project),
      state: classified.state,
      readiness: classified.readiness,
      ready: classified.ready,
      failClosed: classified.failClosed,
      blocker: classified.blocker,
      sourceReadbackFingerprint: classified.readbackFingerprint,
    });
  });

  const readyProjectCount = projectStatuses.filter((project) => project.readiness === "ready").length;
  const missingProjectCount = projectStatuses.filter((project) => project.readiness === "missing").length;
  const blockedFailClosedProjectCount = projectStatuses.filter(
    (project) => project.readiness === "blocked_fail_closed",
  ).length;
  const state = blockedFailClosedProjectCount > 0
    ? PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed
    : projectStatuses.length > 0 && readyProjectCount === projectStatuses.length
      ? PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready
      : PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.missing;
  const readiness = state === PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready
    ? "ready"
    : state === PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed
      ? "blocked_fail_closed"
      : "missing";

  const summary = {
    schemaId: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SOURCE,
    state,
    readiness,
    ready: readiness === "ready",
    failClosed: readiness !== "ready",
    projectCount: projectStatuses.length,
    readyProjectCount,
    missingProjectCount,
    blockedFailClosedProjectCount,
    projectStatuses,
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: PROJECT_IES_EXPORT_BOUNDARY_READBACK_TARGET,
    safeReadbackStatusOnly: true,
    summaryOnly: true,
    redacted: true,
    readOnly: true,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...summary,
    projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-project-ies-export-boundary-readback-summary",
      summary,
    ),
  });
}

export function buildProjectBrowserProjectIesExportResultReadbackSummary(
  projects = [],
  getReadbackStatus = null,
) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const projectStatuses = projectSummaries.map((project) => {
    const classified = classifyProjectIesExportResultReadback(
      readProjectIesExportResultReadbackStatus(project, getReadbackStatus),
    );
    return Object.freeze({
      projectId: projectSummaryId(project),
      envelopeId: projectSummaryEnvelopeId(project),
      state: classified.state,
      readiness: classified.readiness,
      ready: classified.ready,
      failClosed: classified.failClosed,
      blocker: classified.blocker,
      sourceReadbackFingerprint: classified.readbackFingerprint,
    });
  });

  const readyProjectCount = projectStatuses.filter((project) => project.readiness === "ready").length;
  const missingProjectCount = projectStatuses.filter((project) => project.readiness === "missing").length;
  const blockedFailClosedProjectCount = projectStatuses.filter(
    (project) => project.readiness === "blocked_fail_closed",
  ).length;
  const state = blockedFailClosedProjectCount > 0
    ? PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed
    : projectStatuses.length > 0 && readyProjectCount === projectStatuses.length
      ? PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready
      : PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.missing;
  const readiness = state === PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready
    ? "ready"
    : state === PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed
      ? "blocked_fail_closed"
      : "missing";

  const summary = {
    schemaId: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SOURCE,
    state,
    readiness,
    ready: readiness === "ready",
    failClosed: readiness !== "ready",
    projectCount: projectStatuses.length,
    readyProjectCount,
    missingProjectCount,
    blockedFailClosedProjectCount,
    projectStatuses,
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: PROJECT_IES_EXPORT_RESULT_READBACK_TARGET,
    safeReadbackStatusOnly: true,
    summaryOnly: true,
    redacted: true,
    readOnly: true,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...summary,
    projectBrowserProjectIesExportResultReadbackSummaryFingerprint: stableFingerprint(
      "safe-project-browser-project-ies-export-result-readback-summary",
      summary,
    ),
  });
}

export function buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
  projectIesExportBoundaryReadbackSummary = {},
  selectedProjectId = null,
) {
  const sourceSummary = isPlainObject(projectIesExportBoundaryReadbackSummary)
    ? projectIesExportBoundaryReadbackSummary
    : {};
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const projectStatuses = Array.isArray(sourceSummary.projectStatuses)
    ? sourceSummary.projectStatuses.filter((status) => isPlainObject(status))
    : [];
  const selectedProjectStatus = selectedProjectToken
    ? projectStatuses.find((status) => (
      safeToken(status.projectId, null) === selectedProjectToken
      || safeToken(status.envelopeId, null) === selectedProjectToken
    )) || null
    : null;
  const sourceUnsafeBlocker = findUnsafeProjectIesExportBoundaryReadbackField(sourceSummary);
  const selectedStatusUnsafeBlocker = findUnsafeProjectIesExportBoundaryReadbackField(selectedProjectStatus);

  let state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (sourceUnsafeBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = sourceUnsafeBlocker;
  } else if (selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProjectToken) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = "project-browser-selected-project-id-invalid";
  } else if (!Array.isArray(sourceSummary.projectStatuses)) {
    blocker = "project-browser-project-ies-export-boundary-readback-summary-missing";
  } else if (!selectedProjectStatus) {
    blocker = "project-browser-selected-project-not-found";
  } else if (selectedStatusUnsafeBlocker) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = selectedStatusUnsafeBlocker;
  } else {
    const selectedReadiness = safeToken(selectedProjectStatus.readiness, "missing") || "missing";
    const selectedBlocker = safeToken(selectedProjectStatus.blocker, null);
    const selectedBlocked = selectedReadiness === "blocked_fail_closed"
      || selectedProjectStatus.state === PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed
      || (selectedProjectStatus.failClosed === true
        && hasNonNullBlocker(selectedProjectStatus.blocker)
        && selectedReadiness !== "missing");
    const selectedReady = selectedReadiness === "ready"
      && selectedProjectStatus.ready === true
      && selectedProjectStatus.failClosed !== true;

    if (selectedReady) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
    } else if (selectedBlocked) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      blocker = selectedBlocker || "project-browser-selected-project-ies-export-boundary-readback-blocked-fail-closed";
    } else {
      blocker = selectedBlocker || "project-browser-selected-project-ies-export-boundary-readback-missing";
    }
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SOURCE,
    sourceSummarySchemaId: safeToken(sourceSummary.schemaId, null),
    sourceSummarySchemaVersion: safeSchemaVersion(sourceSummary.schemaVersion),
    sourceSummaryState: safeToken(sourceSummary.state, null),
    sourceSummaryReadiness: safeToken(sourceSummary.readiness, "missing") || "missing",
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound: selectedProjectStatus !== null,
    projectId: selectedProjectStatus ? safeToken(selectedProjectStatus.projectId, null) : null,
    envelopeId: selectedProjectStatus ? safeToken(selectedProjectStatus.envelopeId, null) : null,
    boundaryReadbackState: selectedProjectStatus ? safeToken(selectedProjectStatus.state, null) : null,
    boundaryReadbackReadiness: selectedProjectStatus
      ? safeToken(selectedProjectStatus.readiness, "missing") || "missing"
      : "missing",
    boundaryReadbackReady: selectedProjectStatus?.ready === true,
    boundaryReadbackFailClosed: selectedProjectStatus?.failClosed !== false,
    boundaryReadbackBlocker: selectedProjectStatus?.blocker
      ? safeToken(selectedProjectStatus.blocker, "project-browser-selected-project-ies-export-boundary-readback-blocked")
      : null,
    moduleId: "cs_selector",
    consumerModuleId: "ies_builder",
    targetLocation: PROJECT_IES_EXPORT_BOUNDARY_READBACK_TARGET,
    safeReadbackStatusOnly: true,
    readOnly: true,
    selectedProjectOnly: true,
    detailOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceReadbackFingerprint: selectedProjectStatus
      ? safeToken(selectedProjectStatus.sourceReadbackFingerprint, null, 760)
      : null,
    sourceProjectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint: safeToken(
      sourceSummary.projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint,
      null,
      760,
    ),
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    governancePayloadReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...base,
    projectBrowserSelectedProjectIesExportBoundaryReadbackDetailFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-ies-export-boundary-readback-detail-summary",
      base,
    ),
  });
}

export function buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(projects = [], selectedProjectId = null) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const selectedProjectToken = selectedProjectId === null ? null : safeToken(selectedProjectId, null);
  const selectedProject = selectedProjectToken ? findSelectedProjectSummary(projectSummaries, selectedProjectToken) : null;

  let state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let selectedProjectFound = false;
  let selectedProjectReadiness = "missing";
  let selectedProjectReady = false;
  let selectedProjectFailClosed = true;
  let selectedProjectBlocker = null;
  let selectedProjectReadbackFingerprint = null;

  if (selectedProjectId === null) {
    selectedProjectBlocker = "project-browser-selected-project-not-selected";
  } else if (!selectedProject) {
    selectedProjectBlocker = "project-browser-selected-project-not-found";
  } else {
    selectedProjectFound = true;
    const selectedProjectReadback = classifyProjectReadback(selectedProject);
    selectedProjectReadiness = selectedProjectReadback.readiness;
    selectedProjectReady = selectedProjectReadback.ready === true;
    selectedProjectFailClosed = selectedProjectReadback.failClosed === true;
    selectedProjectBlocker = safeToken(selectedProjectReadback.blocker, null);
    selectedProjectReadbackFingerprint = selectedProjectReadback.readbackFingerprint || null;

    if (selectedProjectReadback.readiness === "ready" && selectedProjectReadback.ready === true) {
      state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready;
      readiness = "ready";
      ready = true;
      failClosed = false;
      selectedProjectBlocker = null;
    } else if (selectedProjectReadback.readiness === "blocked_fail_closed") {
      state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed;
      readiness = "blocked_fail_closed";
      failClosed = true;
      selectedProjectReady = false;
      selectedProjectFailClosed = true;
      selectedProjectBlocker = selectedProjectBlocker || "project-browser-selected-project-readback-blocked-fail-closed";
    } else {
      selectedProjectBlocker = selectedProjectBlocker || "project-browser-selected-project-readback-missing";
    }
  }

  const status = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_STATUS_SOURCE,
    state,
    readiness,
    ready,
    failClosed,
    selectedProjectId: selectedProjectToken,
    selectedProjectFound,
    selectedProjectReadiness,
    selectedProjectReady,
    selectedProjectFailClosed,
    selectedProjectBlocker,
    selectedProjectReadbackFingerprint,
    moduleId: "cs_selector",
    targetLocation: SELECTED_RESULT_READBACK_TARGET,
    rawSelectedPayloadReturned: false,
    rawSelectedPayloadExposed: false,
    rawEnginePayloadReturned: false,
    rawEnginePayloadExposed: false,
    rawRunTableRowsReturned: false,
    rawRunTableRowsExposed: false,
    rawIesReturned: false,
    rawIesExposed: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    privatePathsReturned: false,
    filenamesReturned: false,
    credentialsReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    selectedResultPersistenceAttempted: false,
    runTableGenerationAttempted: false,
    iesGenerationAttempted: false,
    outputGenerationEnabled: false,
  };

  return Object.freeze({
    ...status,
    projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatusFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-selected-result-persisted-summary-readback-status",
      status,
    ),
  });
}

export function buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary(projects = [], selectedProjectId = null) {
  const projectSummaries = Array.isArray(projects) ? projects : [];
  const sourceStatus = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(
    projectSummaries,
    selectedProjectId,
  );
  const selectedProject = sourceStatus.selectedProjectFound === true
    ? findSelectedProjectSummary(projectSummaries, sourceStatus.selectedProjectId)
    : null;
  const sourceDetail = buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(
    selectedProject?.selectedResultPersistedSummaryReadbackStatus || {},
  );

  const statusReady = sourceStatus.readiness === "ready"
    && sourceStatus.ready === true
    && sourceStatus.failClosed !== true;
  const detailReady = sourceDetail.readiness === "ready"
    && sourceDetail.ready === true
    && sourceDetail.failClosed !== true;
  const statusBlockedFailClosed = sourceStatus.readiness === "blocked_fail_closed"
    || sourceStatus.state === PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed;
  const detailBlockedFailClosed = sourceDetail.readiness === "blocked_fail_closed"
    || sourceDetail.state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed;

  let state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing;
  let readiness = "missing";
  let ready = false;
  let failClosed = true;
  let blocker = null;

  if (statusReady && detailReady) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready;
    readiness = "ready";
    ready = true;
    failClosed = false;
  } else if (statusBlockedFailClosed || detailBlockedFailClosed) {
    state = PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed;
    readiness = "blocked_fail_closed";
    blocker = safeToken(
      sourceStatus.selectedProjectBlocker || sourceDetail.blocker,
      "project-browser-selected-project-readback-blocked-fail-closed",
    );
  } else if (sourceStatus.selectedProjectId === null) {
    blocker = "project-browser-selected-project-not-selected";
  } else if (sourceStatus.selectedProjectFound !== true) {
    blocker = "project-browser-selected-project-not-found";
  } else {
    blocker = "project-browser-selected-project-readback-missing";
  }

  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    source: PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_DETAIL_SOURCE,
    sourceStatusSchemaId: safeToken(sourceStatus.schemaId, null),
    sourceStatusSchemaVersion: safeSchemaVersion(sourceStatus.schemaVersion),
    sourceStatusState: safeToken(sourceStatus.state, null),
    sourceStatusReadiness: safeToken(sourceStatus.readiness, "missing") || "missing",
    sourceDetailSchemaId: safeToken(sourceDetail.schemaId, null),
    sourceDetailSchemaVersion: safeSchemaVersion(sourceDetail.schemaVersion),
    sourceDetailState: safeToken(sourceDetail.state, null),
    sourceDetailReadiness: safeToken(sourceDetail.readiness, "missing") || "missing",
    state,
    readiness,
    ready,
    failClosed,
    blocker,
    selectedProjectId: sourceStatus.selectedProjectId || null,
    selectedProjectFound: sourceStatus.selectedProjectFound === true,
    summaryPresent: sourceDetail.summaryPresent === true,
    summarySchemaId: sourceDetail.summarySchemaId ? safeToken(sourceDetail.summarySchemaId, null) : null,
    summarySchemaVersion: safeSchemaVersion(sourceDetail.summarySchemaVersion),
    summaryState: sourceDetail.summaryState ? safeToken(sourceDetail.summaryState, null) : null,
    slotOwner: safeToken(sourceDetail.slotOwner, "shell"),
    envelopeOwner: safeToken(sourceDetail.envelopeOwner, "shell"),
    moduleId: safeToken(sourceDetail.moduleId, "cs_selector"),
    targetLocation: safeToken(sourceDetail.targetLocation, SELECTED_RESULT_READBACK_TARGET),
    readOnly: true,
    selectedProjectOnly: true,
    detailOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceSelectedProjectReadbackFingerprint: safeToken(sourceStatus.selectedProjectReadbackFingerprint, null, 760),
    sourceSelectedProjectReadbackStatusFingerprint: safeToken(
      sourceStatus.projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatusFingerprint,
      null,
      760,
    ),
    sourceSelectedProjectReadbackDetailFingerprint: safeToken(
      sourceDetail.projectBrowserSelectedResultPersistedSummaryReadbackDetailFingerprint,
      null,
      760,
    ),
  };

  return Object.freeze({
    ...base,
    projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailFingerprint: stableFingerprint(
      "safe-project-browser-selected-project-selected-result-persisted-summary-readback-detail-summary",
      base,
    ),
  });
}

export function buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(envelopeOrProjectSummary = {}) {
  const sourceSummary = buildSelectedResultPersistedSummaryReadbackProjectSummary(envelopeOrProjectSummary || {});
  const sourceReadiness = safeToken(sourceSummary.readiness, "missing") || "missing";
  const ready = sourceSummary.ready === true && sourceSummary.failClosed !== true && sourceReadiness === "ready";
  const blockedFailClosed = !ready && (
    sourceReadiness === "blocked_fail_closed"
    || sourceSummary.state === "selected_result_persisted_summary_readback_blocked_fail_closed"
  );
  const state = ready
    ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready
    : blockedFailClosed
      ? PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed
      : PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing;
  const readiness = state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready
    ? "ready"
    : state === PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed
      ? "blocked_fail_closed"
      : "missing";
  const base = {
    schemaId: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
    sourceSchemaId: safeToken(sourceSummary.schemaId, null),
    sourceSchemaVersion: safeSchemaVersion(sourceSummary.schemaVersion),
    sourceState: safeToken(sourceSummary.state, null),
    sourceReadiness,
    state,
    readiness,
    ready,
    failClosed: !ready,
    blocker: sourceSummary.blocker ? safeToken(sourceSummary.blocker, "project-browser-selected-result-readback-detail-blocked") : null,
    summaryPresent: sourceSummary.summaryPresent === true,
    summarySchemaId: sourceSummary.summarySchemaId ? safeToken(sourceSummary.summarySchemaId, null) : null,
    summarySchemaVersion: safeSchemaVersion(sourceSummary.summarySchemaVersion),
    summaryState: sourceSummary.summaryState ? safeToken(sourceSummary.summaryState, null) : null,
    owner: safeToken(sourceSummary.owner, "shell"),
    slotOwner: safeToken(sourceSummary.slotOwner, "shell"),
    envelopeOwner: safeToken(sourceSummary.envelopeOwner, "shell"),
    moduleId: safeToken(sourceSummary.moduleId, "cs_selector"),
    targetLocation: safeToken(sourceSummary.targetLocation, SELECTED_RESULT_READBACK_TARGET),
    readOnly: true,
    detailOnly: true,
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceSelectedResultPersistedSummaryReadbackFingerprint: safeToken(
      sourceSummary.selectedResultPersistedSummaryReadbackFingerprint,
      null,
      760,
    ),
  };

  return Object.freeze({
    ...base,
    projectBrowserSelectedResultPersistedSummaryReadbackDetailFingerprint: stableFingerprint(
      "safe-project-browser-selected-result-persisted-summary-readback-detail-summary",
      base,
    ),
  });
}

export function createProjectBrowserService({ savedProjectStore, projectService, eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "handoff-share-ready-browser",
    source: "p4-shell-handoff-share",
    selectedProjectId: null,
    filters: {
      search: "",
      scope: "current-user",
    },
  };

  function getProjectBrowserSnapshot(context = {}) {
    const storeSnapshot = savedProjectStore.getStoreSnapshot(context);
    const projectIesExportBoundaryReadbackSummary = buildProjectBrowserProjectIesExportBoundaryReadbackSummary(
      storeSnapshot.projects,
      savedProjectStore.getIesFirstNarrowProjectIesExportBoundaryReadbackStatus?.bind(savedProjectStore),
    );
    const projectIesExportResultReadbackSummary = buildProjectBrowserProjectIesExportResultReadbackSummary(
      storeSnapshot.projects,
      savedProjectStore.getIesFirstNarrowProjectIesExportResultReadbackStatus?.bind(savedProjectStore),
    );
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: true,
      browserOnly: false,
      nonBootCritical: true,
      currentProject: readProject(context.project),
      selectedProjectId: state.selectedProjectId,
      selectedResultPersistedSummaryReadbackSummary: buildProjectBrowserSelectedResultPersistedSummaryReadbackSummary(
        storeSnapshot.projects,
        state.selectedProjectId,
      ),
      selectedProjectSelectedResultPersistedSummaryReadbackStatus: buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(
        storeSnapshot.projects,
        state.selectedProjectId,
      ),
      selectedProjectSelectedResultPersistedSummaryReadbackDetailSummary: buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary(
        storeSnapshot.projects,
        state.selectedProjectId,
      ),
      projectIesExportBoundaryReadbackSummary,
      projectIesExportResultReadbackSummary,
      selectedProjectIesExportBoundaryReadbackDetailSummary: buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
        projectIesExportBoundaryReadbackSummary,
        state.selectedProjectId,
      ),
      filters: { ...state.filters },
      projects: clone(storeSnapshot.projects),
      projectCount: storeSnapshot.count,
      savedCount: storeSnapshot.savedCount || 0,
      fixtureCount: storeSnapshot.fixtureCount || 0,
      safeEmpty: storeSnapshot.safeEmpty,
      emptyStateMessage: storeSnapshot.safeEmpty ? "No saved projects found. Save is ready; handoff/share package can still be prepared from current project state." : "Saved projects available. Runtime saves can be restored; package preparation is live.",
      save: storeSnapshot.save,
      restore: storeSnapshot.restore,
      hydrate: storeSnapshot.hydrate,
      handoffShare: storeSnapshot.handoffShare,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        prepareHandoff: true,
        prepareShare: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
      deferred: {
        externalDelivery: "deferred",
        emailSend: "deferred",
        hubspotWrite: "deferred",
      },
    };
  }

  function inspectProject(projectId, context = {}) {
    const envelope = savedProjectStore.getProjectEnvelope(projectId);
    if (!envelope) {
      return {
        accepted: false,
        reason: `Saved project not found: ${projectId}`,
        selectedResultPersistedSummaryReadbackDetailSummary: buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary({}),
        browser: getProjectBrowserSnapshot(context),
      };
    }
    state.selectedProjectId = envelope.envelopeId || envelope.projectId;
    const result = {
      accepted: true,
      readOnly: true,
      projectId: envelope.projectId,
      envelopeId: envelope.envelopeId,
      restoreEligible: envelope.readOnly !== true && envelope.browserOnly !== true,
      selectedResultPersistedSummaryReadbackDetailSummary: buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(envelope),
      envelope,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:inspect", result);
    return result;
  }

  function saveProject(context = {}, moduleContributions = {}) {
    const result = savedProjectStore.saveCurrentProjectEnvelope(context, moduleContributions);
    if (result.accepted) state.selectedProjectId = result.envelopeId;
    eventBus?.emit("project-browser:save", result);
    return {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
  }

  function restoreProject(projectIdOrEnvelopeId, context = {}) {
    const result = savedProjectStore.restoreProjectEnvelope(projectIdOrEnvelopeId || state.selectedProjectId, context);
    if (!result.accepted) {
      eventBus?.emit("project-browser:restore-rejected", result);
      return {
        ...result,
        browser: getProjectBrowserSnapshot(context),
      };
    }
    state.selectedProjectId = result.envelopeId;
    const projectResult = projectService?.restoreProjectFromEnvelope?.(result.envelope, result);
    const combined = {
      ...result,
      shellProjectUpdated: projectResult?.accepted === true,
      project: projectResult?.project || null,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:restore", combined);
    return combined;
  }

  function prepareHandoffShare(context = {}) {
    const result = savedProjectStore.prepareHandoffSharePackage(context);
    if (result.accepted) {
      projectService?.recordHandoffSharePackage?.(result);
    }
    const combined = {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:handoff-share", combined);
    return combined;
  }

  function setSearch(search = "", context = {}) {
    state.filters.search = String(search || "");
    const snapshot = getProjectBrowserSnapshot(context);
    eventBus?.emit("project-browser:filter", { search: state.filters.search, browser: snapshot });
    return snapshot;
  }

  return {
    owner: state.owner,
    status: state.status,
    getProjectBrowserSnapshot,
    inspectProject,
    setSearch,
    saveProject,
    restoreProject,
    prepareHandoffShare,
    requestHandoff(context = {}) {
      return prepareHandoffShare(context);
    },
  };
}
