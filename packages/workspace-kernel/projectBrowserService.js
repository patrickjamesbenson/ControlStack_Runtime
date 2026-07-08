import { stableFingerprint } from "./stableFingerprint.js";

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-result-persisted-summary-readback-summary.v1";
export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_VERSION = 1;

export const PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES = Object.freeze({
  ready: "project_browser_selected_result_persisted_summary_readback_ready",
  missing: "project_browser_selected_result_persisted_summary_readback_missing",
  blockedFailClosed: "project_browser_selected_result_persisted_summary_readback_blocked_fail_closed",
});

const PROJECT_BROWSER_SELECTED_RESULT_READBACK_SOURCE =
  "project-browser-project-summary-selected-result-readback-consumer";
const SELECTED_RESULT_READBACK_TARGET =
  "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

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
