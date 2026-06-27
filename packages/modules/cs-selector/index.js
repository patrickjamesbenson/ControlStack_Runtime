import { createSelectorContractAdapter } from "./selectorContractAdapter.js";
import { createSelectorState } from "./selectorState.js";
import { renderSelectorView } from "./selectorView.js";
import { createSelectorViewModel } from "./selectorViewModel.js";

const SELECTOR_REFERENCE_STATUS_ENDPOINT = "/api/selector-reference/status";
const SELECTOR_REFERENCE_OPTIONS_ENDPOINT = "/api/selector-reference/options";

const SELECTOR_OPTION_CONSTRAINT_KEYS = Object.freeze([
  "system",
  "application",
  "interiorExterior",
  "cct",
  "optic",
  "controlType",
  "driver",
  "ipRating",
  "ikRating",
  "mountStyle",
  "bodyFinish",
  "emergency",
  "sensor",
  "specialParts",
]);

const SAFE_SELECTOR_REFERENCE_STATUS_BASE = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  sourceStatusReadOnly: true,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  rawLabEvidenceExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  boardDataWriteEnabled: false,
  materialiserWriteEnabled: false,
  materialiserRefreshEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  selectorResolvingEnabled: false,
  activeResolverEnabled: false,
  selectorMutationEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  iesGenerationEnabled: false,
  labProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  runtimeDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
});

function initialSelectorReferenceStatus() {
  return {
    status: "not-requested",
    endpoint: SELECTOR_REFERENCE_STATUS_ENDPOINT,
    ...SAFE_SELECTOR_REFERENCE_STATUS_BASE,
  };
}

function initialSelectorReferenceOptionsStatus() {
  return {
    ok: null,
    status: "not-requested",
    endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
    fields: [],
    candidateSummary: {
      state: "not requested",
      optionFieldCount: 0,
      availableFieldCount: 0,
      manualConstraintCount: 0,
      autoConsequenceCount: 0,
      blockedCount: 0,
      specGateComplete: false,
      labProof: false,
      writesEnabled: false,
    },
    readOnly: true,
    diagnosticOnly: true,
    optionFilteringReadOnly: true,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
}

let mountedContainer = null;
let selectorState = null;
let selectorAdapter = null;
let selectorReferenceStatus = initialSelectorReferenceStatus();
let selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
let selectorReferenceRequestId = 0;
let selectorReferenceOptionsRequestId = 0;

function activeSelectorOptionsPayload() {
  if (selectorReferenceOptionsStatus.status !== "not-requested" || selectorReferenceOptionsStatus.fields?.length) {
    return selectorReferenceOptionsStatus;
  }
  return selectorReferenceStatus.selectorOptions || selectorReferenceOptionsStatus;
}

function renderCurrentView() {
  if (!mountedContainer || !selectorState || !selectorAdapter) return;
  const viewModel = createSelectorViewModel({
    adapter: selectorAdapter,
    selectorState,
    selectorReferenceStatus: {
      ...selectorReferenceStatus,
      selectorOptions: activeSelectorOptionsPayload(),
    },
    onLocalStateChange: handleSelectorLocalStateChange,
  });
  renderSelectorView(mountedContainer, viewModel);
}

function handleSelectorLocalStateChange() {
  renderCurrentView();
  loadSelectorReferenceOptions();
}

function applySelectorReferenceStatus(nextStatus) {
  selectorReferenceStatus = {
    ...nextStatus,
    endpoint: nextStatus?.endpoint || SELECTOR_REFERENCE_STATUS_ENDPOINT,
    ...SAFE_SELECTOR_REFERENCE_STATUS_BASE,
  };
  renderCurrentView();
}

function safeConstraintValue(record) {
  return String(record?.value || "").trim();
}

function selectorOptionConstraintQuery() {
  const snapshot = selectorState?.getSnapshot?.() || {};
  const constraints = snapshot.dbBackedSelector?.manualConstraints || {};
  const params = new URLSearchParams();
  for (const key of SELECTOR_OPTION_CONSTRAINT_KEYS) {
    const value = safeConstraintValue(constraints[key]);
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

function applySelectorReferenceOptionsStatus(nextStatus) {
  const previousFields = Array.isArray(selectorReferenceOptionsStatus.fields)
    ? selectorReferenceOptionsStatus.fields
    : [];
  selectorReferenceOptionsStatus = {
    ...initialSelectorReferenceOptionsStatus(),
    ...nextStatus,
    endpoint: nextStatus?.endpoint || SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
    fields: Array.isArray(nextStatus?.fields) ? nextStatus.fields : previousFields,
    readOnly: true,
    diagnosticOnly: true,
    optionFilteringReadOnly: true,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
  renderCurrentView();
}

async function loadSelectorReferenceOptions() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    applySelectorReferenceOptionsStatus({
      ok: false,
      status: "fetch-unavailable",
      endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
      warnings: ["Browser fetch is unavailable; Selector reference options could not be read."],
    });
    return;
  }

  const requestId = selectorReferenceOptionsRequestId + 1;
  selectorReferenceOptionsRequestId = requestId;
  applySelectorReferenceOptionsStatus({
    ok: null,
    status: "loading",
    endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
    warnings: ["Selector reference options are loading."],
  });

  try {
    const endpoint = `${SELECTOR_REFERENCE_OPTIONS_ENDPOINT}${selectorOptionConstraintQuery()}`;
    const response = await fetchImpl(endpoint, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    if (requestId !== selectorReferenceOptionsRequestId || !mountedContainer) return;
    applySelectorReferenceOptionsStatus({
      ...payload,
      ok: response.ok && payload?.ok !== false,
      httpStatus: response.status,
      status: payload?.ok === false ? "unavailable" : payload?.status || "loaded",
    });
  } catch (error) {
    if (requestId !== selectorReferenceOptionsRequestId || !mountedContainer) return;
    applySelectorReferenceOptionsStatus({
      ok: false,
      status: "fetch-failed",
      endpoint: SELECTOR_REFERENCE_OPTIONS_ENDPOINT,
      warnings: [`Selector reference options request failed: ${error?.message || "unknown error"}.`],
    });
  }
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
    selectorReferenceStatus = initialSelectorReferenceStatus();
    selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
    renderCurrentView();
    loadSelectorReferenceStatus();
    loadSelectorReferenceOptions();
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
    selectorReferenceOptionsStatus = initialSelectorReferenceOptionsStatus();
  },
};
