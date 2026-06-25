import { renderAdminDevView } from "./adminDevView.js";
import { canViewAdminDev, createAdminDevViewModel } from "./adminDevViewModel.js";

const READ_ENDPOINTS = Object.freeze({
  authorityStatus: "/api/authority-reference/status",
  sourceMaterialisation: "/api/authority-reference/source-materialisation",
  archiveList: "/api/authority-reference/archives",
  runtimeConfig: "/api/runtime-config/status",
  health: "/health",
});

const SYNC_ENDPOINTS = Object.freeze({
  dryRun: "/api/authority-reference/sync?dryRun=true",
  live: "/api/authority-reference/sync?dryRun=false",
});

const ARCHIVE_ENDPOINTS = Object.freeze({
  list: "/api/authority-reference/archives",
  diff: "/api/authority-reference/diff",
  diffDetail: "/api/authority-reference/diff-detail",
});

let mountedContainer = null;
let mountedContext = null;
let mountedServices = null;
let requestId = 0;
let syncRequestId = 0;
let archiveRequestId = 0;

function createSyncState() {
  return {
    dryRunStatus: "idle",
    dryRunResult: null,
    dryRunError: null,
    dryRunLoadedAt: null,
    dryRunCompleted: false,
    liveStatus: "idle",
    liveResult: null,
    liveError: null,
    liveLoadedAt: null,
    liveAttempted: false,
    confirmation: "",
  };
}

function createArchiveInspectionState() {
  return {
    selectedArchiveName: "",
    diffStatus: "idle",
    diffResult: null,
    diffError: null,
    diffLoadedAt: null,
    detailStatus: "idle",
    detailResult: null,
    detailError: null,
    detailLoadedAt: null,
    selectedDetail: null,
  };
}

let state = {
  status: "idle",
  payloads: {},
  errors: [],
  loadedAt: null,
  sync: createSyncState(),
  archiveInspection: createArchiveInspectionState(),
};

function resetState(status = "idle") {
  state = {
    status,
    payloads: {},
    errors: [],
    loadedAt: null,
    sync: createSyncState(),
    archiveInspection: createArchiveInspectionState(),
  };
}

function mergeSyncState(nextSync) {
  state = {
    ...state,
    sync: {
      ...createSyncState(),
      ...(state.sync || {}),
      ...(nextSync || {}),
    },
  };
}

function mergeArchiveInspectionState(nextArchiveInspection) {
  state = {
    ...state,
    archiveInspection: {
      ...createArchiveInspectionState(),
      ...(state.archiveInspection || {}),
      ...(nextArchiveInspection || {}),
    },
  };
}

function canUseAdminDevActions() {
  return Boolean(mountedContainer) && canViewAdminDev(mountedContext);
}

function renderCurrentView() {
  if (!mountedContainer) return;
  const viewModel = createAdminDevViewModel({
    context: mountedContext,
    endpoints: READ_ENDPOINTS,
    syncEndpoints: SYNC_ENDPOINTS,
    archiveEndpoints: ARCHIVE_ENDPOINTS,
    state,
  });
  renderAdminDevView(mountedContainer, viewModel, {
    onRunDryRunSync: runDryRunSyncPreview,
    onRunLiveSync: runConfirmedLiveSync,
    onConfirmationInput: updateSyncConfirmation,
    onRunArchiveDiff: runArchiveDiff,
    onRunArchiveDiffDetail: runArchiveDiffDetail,
  });
}

async function fetchJson(endpoint) {
  const response = await fetch(endpoint, {
    method: "GET",
    headers: { Accept: "application/json" },
    credentials: "same-origin",
    cache: "no-store",
  });

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = { parseError: error?.message || "json_parse_failed" };
  }

  if (!response.ok) {
    throw new Error(`${endpoint} returned HTTP ${response.status}`);
  }

  return {
    endpoint,
    httpStatus: response.status,
    body,
    readOnly: true,
  };
}

async function postJson(endpoint, payload = null) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(payload ? { "Content-Type": "application/json" } : {}),
    },
    credentials: "same-origin",
    cache: "no-store",
    body: payload ? JSON.stringify(payload) : undefined,
  });

  let body = null;
  try {
    body = await response.json();
  } catch (error) {
    body = { parseError: error?.message || "json_parse_failed" };
  }

  return {
    endpoint,
    httpStatus: response.status,
    ok: response.ok,
    body,
    readOnly: false,
  };
}

async function loadReadOnlyStatus() {
  const thisRequest = ++requestId;
  const currentSync = state.sync || createSyncState();
  const currentArchiveInspection = state.archiveInspection || createArchiveInspectionState();
  state = { ...state, status: "loading", errors: [], sync: currentSync, archiveInspection: currentArchiveInspection };
  renderCurrentView();

  const results = await Promise.all(Object.entries(READ_ENDPOINTS).map(async ([key, endpoint]) => {
    try {
      return [key, await fetchJson(endpoint), null];
    } catch (error) {
      return [key, { endpoint, readOnly: true, body: null }, error?.message || String(error || "read_failed")];
    }
  }));

  if (thisRequest !== requestId) return;

  const payloads = {};
  const errors = [];
  for (const [key, result, error] of results) {
    payloads[key] = result;
    if (error) errors.push({ key, endpoint: result.endpoint, message: error });
  }

  state = {
    ...state,
    status: errors.length ? "partial" : "ready",
    payloads,
    errors,
    loadedAt: new Date().toISOString(),
    sync: currentSync,
    archiveInspection: currentArchiveInspection,
  };
  renderCurrentView();
}

function updateSyncConfirmation(value) {
  if (!canUseAdminDevActions()) return;
  mergeSyncState({ confirmation: String(value || "") });
}

async function runDryRunSyncPreview() {
  if (!canUseAdminDevActions()) return;

  const thisSyncRequest = ++syncRequestId;
  mergeSyncState({
    dryRunStatus: "running",
    dryRunResult: null,
    dryRunError: null,
    dryRunLoadedAt: null,
    dryRunCompleted: false,
  });
  renderCurrentView();

  try {
    const result = await postJson(SYNC_ENDPOINTS.dryRun);
    if (thisSyncRequest !== syncRequestId || !mountedContainer) return;
    mergeSyncState({
      dryRunStatus: result.ok ? "complete" : "endpoint-error",
      dryRunResult: result,
      dryRunError: result.ok ? null : `${SYNC_ENDPOINTS.dryRun} returned HTTP ${result.httpStatus}`,
      dryRunLoadedAt: new Date().toISOString(),
      dryRunCompleted: result.ok === true,
    });
  } catch (error) {
    if (thisSyncRequest !== syncRequestId || !mountedContainer) return;
    mergeSyncState({
      dryRunStatus: "endpoint-error",
      dryRunResult: null,
      dryRunError: error?.message || "Dry-run sync preview failed.",
      dryRunLoadedAt: new Date().toISOString(),
      dryRunCompleted: false,
    });
  }

  renderCurrentView();
}

async function runConfirmedLiveSync() {
  if (!canUseAdminDevActions()) return;

  const sync = state.sync || createSyncState();
  if (sync.dryRunCompleted !== true || sync.confirmation !== "SYNC" || sync.liveStatus === "running") {
    renderCurrentView();
    return;
  }

  const thisSyncRequest = ++syncRequestId;
  mergeSyncState({
    liveStatus: "running",
    liveResult: null,
    liveError: null,
    liveLoadedAt: null,
    liveAttempted: true,
  });
  renderCurrentView();

  try {
    const result = await postJson(SYNC_ENDPOINTS.live);
    if (thisSyncRequest !== syncRequestId || !mountedContainer) return;
    const serverStatus = String(result.body?.status || "").toLowerCase();
    const liveStatus = result.ok && serverStatus === "live-write-completed"
      ? "complete"
      : result.ok
        ? "complete-with-warning"
        : "blocked-or-failed";
    mergeSyncState({
      liveStatus,
      liveResult: result,
      liveError: result.ok ? null : `${SYNC_ENDPOINTS.live} returned HTTP ${result.httpStatus}`,
      liveLoadedAt: new Date().toISOString(),
      liveAttempted: true,
    });
  } catch (error) {
    if (thisSyncRequest !== syncRequestId || !mountedContainer) return;
    mergeSyncState({
      liveStatus: "endpoint-error",
      liveResult: null,
      liveError: error?.message || "Confirmed live sync failed.",
      liveLoadedAt: new Date().toISOString(),
      liveAttempted: true,
    });
  }

  renderCurrentView();
  if (mountedContainer && canViewAdminDev(mountedContext)) {
    await loadReadOnlyStatus();
  }
}

async function runArchiveDiff(archiveName) {
  if (!canUseAdminDevActions()) return;
  const selectedArchiveName = String(archiveName || "").trim();
  if (!selectedArchiveName || state.archiveInspection?.diffStatus === "running") return;

  const thisArchiveRequest = ++archiveRequestId;
  mergeArchiveInspectionState({
    selectedArchiveName,
    diffStatus: "running",
    diffResult: null,
    diffError: null,
    diffLoadedAt: null,
    detailStatus: "idle",
    detailResult: null,
    detailError: null,
    detailLoadedAt: null,
    selectedDetail: null,
  });
  renderCurrentView();

  try {
    const result = await postJson(ARCHIVE_ENDPOINTS.diff, { archiveName: selectedArchiveName });
    if (thisArchiveRequest !== archiveRequestId || !mountedContainer) return;
    mergeArchiveInspectionState({
      selectedArchiveName,
      diffStatus: result.ok ? "complete" : "endpoint-error",
      diffResult: result,
      diffError: result.ok ? null : `${ARCHIVE_ENDPOINTS.diff} returned HTTP ${result.httpStatus}`,
      diffLoadedAt: new Date().toISOString(),
      detailStatus: "idle",
      detailResult: null,
      detailError: null,
      detailLoadedAt: null,
      selectedDetail: null,
    });
  } catch (error) {
    if (thisArchiveRequest !== archiveRequestId || !mountedContainer) return;
    mergeArchiveInspectionState({
      selectedArchiveName,
      diffStatus: "endpoint-error",
      diffResult: null,
      diffError: error?.message || "Archive diff summary failed.",
      diffLoadedAt: new Date().toISOString(),
      detailStatus: "idle",
      detailResult: null,
      detailError: null,
      detailLoadedAt: null,
      selectedDetail: null,
    });
  }

  renderCurrentView();
}

async function runArchiveDiffDetail({ archiveName, section, inspectKey } = {}) {
  if (!canUseAdminDevActions()) return;
  const selectedArchiveName = String(archiveName || state.archiveInspection?.selectedArchiveName || "").trim();
  const selectedSection = String(section || "").trim();
  const selectedInspectKey = String(inspectKey || "").trim();
  if (!selectedArchiveName || !selectedSection || !selectedInspectKey || state.archiveInspection?.detailStatus === "running") return;

  const thisArchiveRequest = ++archiveRequestId;
  mergeArchiveInspectionState({
    selectedArchiveName,
    detailStatus: "running",
    detailResult: null,
    detailError: null,
    detailLoadedAt: null,
    selectedDetail: { section: selectedSection, inspectKey: selectedInspectKey },
  });
  renderCurrentView();

  try {
    const result = await postJson(ARCHIVE_ENDPOINTS.diffDetail, {
      archiveName: selectedArchiveName,
      section: selectedSection,
      inspectKey: selectedInspectKey,
    });
    if (thisArchiveRequest !== archiveRequestId || !mountedContainer) return;
    mergeArchiveInspectionState({
      selectedArchiveName,
      detailStatus: result.ok ? "complete" : "endpoint-error",
      detailResult: result,
      detailError: result.ok ? null : `${ARCHIVE_ENDPOINTS.diffDetail} returned HTTP ${result.httpStatus}`,
      detailLoadedAt: new Date().toISOString(),
      selectedDetail: { section: selectedSection, inspectKey: selectedInspectKey },
    });
  } catch (error) {
    if (thisArchiveRequest !== archiveRequestId || !mountedContainer) return;
    mergeArchiveInspectionState({
      selectedArchiveName,
      detailStatus: "endpoint-error",
      detailResult: null,
      detailError: error?.message || "Field-level archive diff failed.",
      detailLoadedAt: new Date().toISOString(),
      selectedDetail: { section: selectedSection, inspectKey: selectedInspectKey },
    });
  }

  renderCurrentView();
}

function maybeLoadReadOnlyStatus() {
  if (!canViewAdminDev(mountedContext)) {
    requestId += 1;
    syncRequestId += 1;
    archiveRequestId += 1;
    resetState("protected");
    renderCurrentView();
    return;
  }

  if (["idle", "protected"].includes(state.status)) {
    loadReadOnlyStatus();
    return;
  }

  renderCurrentView();
}

export const adminDevModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("admin_dev requires an HTMLElement container");
    }

    mountedContainer = container;
    mountedServices = services || null;
    mountedContext = context || {};
    resetState(canViewAdminDev(mountedContext) ? "idle" : "protected");
    renderCurrentView();
    maybeLoadReadOnlyStatus();
    mountedServices?.eventBus?.emit("admin_dev:mounted", {
      moduleId: "admin_dev",
      label: "Admin / Dev",
      readOnly: false,
      nonBootCritical: true,
      endpoints: [...Object.values(READ_ENDPOINTS), ...Object.values(SYNC_ENDPOINTS), ...Object.values(ARCHIVE_ENDPOINTS)],
      mutationPolicy: "dry-run-first-sync-confirmation-only-plus-readonly-archive-diff-inspection",
    });
  },

  update(nextContext) {
    if (!mountedContainer || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "admin_dev";
    mountedContext = nextContext;
    maybeLoadReadOnlyStatus();
  },

  unmount() {
    requestId += 1;
    syncRequestId += 1;
    archiveRequestId += 1;
    if (mountedContainer) {
      while (mountedContainer.firstChild) mountedContainer.removeChild(mountedContainer.firstChild);
    }
    mountedContainer = null;
    mountedContext = null;
    mountedServices = null;
    resetState("idle");
  },
};
