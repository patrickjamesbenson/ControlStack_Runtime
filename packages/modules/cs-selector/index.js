import { createSelectorContractAdapter } from "./selectorContractAdapter.js";
import { createSelectorState } from "./selectorState.js";
import { renderSelectorView } from "./selectorView.js";
import { createSelectorViewModel } from "./selectorViewModel.js";

const SELECTOR_REFERENCE_STATUS_ENDPOINT = "/api/selector-reference/status";

let mountedContainer = null;
let selectorState = null;
let selectorAdapter = null;
let selectorReferenceStatus = {
  status: "not-requested",
  endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
  readOnly: true,
  rawRowsExposed: false,
  rawUsersExposed: false,
  rawLabEvidenceExposed: false,
};
let selectorReferenceRequestId = 0;

function renderCurrentView() {
  if (!mountedContainer || !selectorState || !selectorAdapter) return;
  const viewModel = createSelectorViewModel({
    adapter: selectorAdapter,
    selectorState,
    selectorReferenceStatus,
  });
  renderSelectorView(mountedContainer, viewModel);
}

function applySelectorReferenceStatus(nextStatus) {
  selectorReferenceStatus = {
    ...nextStatus,
    endpoint: nextStatus?.endpoint || SELECTOR_REFERENCE_STATUS_ENDPOINT,
    readOnly: true,
    rawRowsExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
  };
  renderCurrentView();
}

async function loadSelectorReferenceStatus() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    applySelectorReferenceStatus({
      ok: false,
      status: "fetch-unavailable",
      endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
      warnings: ["Browser fetch is unavailable; Selector reference snapshot status could not be read."],
    });
    return;
  }

  const requestId = selectorReferenceRequestId + 1;
  selectorReferenceRequestId = requestId;
  applySelectorReferenceStatus({
    ok: null,
    status: "loading",
    endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
    warnings: ["Selector reference snapshot status is loading."],
  });

  try {
    const response = await fetchImpl(SELECTOR_REFERENCE_STATUS_ENDPOINT, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    if (requestId !== selectorReferenceRequestId || !mountedContainer) return;
    applySelectorReferenceStatus({
      ...payload,
      ok: response.ok && payload?.ok !== false,
      httpStatus: response.status,
      status: payload?.ok === false ? "unavailable" : "loaded",
    });
  } catch (error) {
    if (requestId !== selectorReferenceRequestId || !mountedContainer) return;
    applySelectorReferenceStatus({
      ok: false,
      status: "fetch-failed",
      endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
      warnings: [`Selector reference snapshot status request failed: ${error?.message || "unknown error"}.`],
    });
  }
}

export const csSelectorModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("cs_selector requires an HTMLElement container");
    }

    mountedContainer = container;
    selectorState = createSelectorState();
    selectorAdapter = createSelectorContractAdapter({ services, context });
    selectorReferenceStatus = {
      status: "not-requested",
      endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
      readOnly: true,
      rawRowsExposed: false,
      rawUsersExposed: false,
      rawLabEvidenceExposed: false,
    };
    renderCurrentView();
    loadSelectorReferenceStatus();
    services.eventBus?.emit("selector:mounted", {
      moduleId: "cs_selector",
      phase: "3",
      policyOwner: "shell",
    });
  },

  update(nextContext) {
    if (!mountedContainer || !selectorAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "cs_selector";
    selectorAdapter = createSelectorContractAdapter({
      services: selectorAdapter.services,
      context: nextContext,
    });
    renderCurrentView();
  },

  unmount() {
    selectorReferenceRequestId += 1;
    if (mountedContainer) {
      while (mountedContainer.firstChild) {
        mountedContainer.removeChild(mountedContainer.firstChild);
      }
    }
    mountedContainer = null;
    selectorState = null;
    selectorAdapter = null;
  },
};
