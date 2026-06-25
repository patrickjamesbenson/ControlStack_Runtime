import { renderAdminDevView } from "./adminDevView.js";
import { canViewAdminDev, createAdminDevViewModel } from "./adminDevViewModel.js";

const READ_ENDPOINTS = Object.freeze({
  authorityStatus: "/api/authority-reference/status",
  sourceMaterialisation: "/api/authority-reference/source-materialisation",
  runtimeConfig: "/api/runtime-config/status",
  health: "/health",
});

let mountedContainer = null;
let mountedContext = null;
let mountedServices = null;
let requestId = 0;
let state = {
  status: "idle",
  payloads: {},
  errors: [],
  loadedAt: null,
};

function resetState(status = "idle") {
  state = {
    status,
    payloads: {},
    errors: [],
    loadedAt: null,
  };
}

function renderCurrentView() {
  if (!mountedContainer) return;
  const viewModel = createAdminDevViewModel({
    context: mountedContext,
    endpoints: READ_ENDPOINTS,
    state,
  });
  renderAdminDevView(mountedContainer, viewModel);
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

async function loadReadOnlyStatus() {
  const thisRequest = ++requestId;
  state = { ...state, status: "loading", errors: [] };
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
    status: errors.length ? "partial" : "ready",
    payloads,
    errors,
    loadedAt: new Date().toISOString(),
  };
  renderCurrentView();
}

function maybeLoadReadOnlyStatus() {
  if (!canViewAdminDev(mountedContext)) {
    requestId += 1;
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
      readOnly: true,
      nonBootCritical: true,
      endpoints: Object.values(READ_ENDPOINTS),
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
    if (mountedContainer) {
      while (mountedContainer.firstChild) mountedContainer.removeChild(mountedContainer.firstChild);
    }
    mountedContainer = null;
    mountedContext = null;
    mountedServices = null;
    resetState("idle");
  },
};
