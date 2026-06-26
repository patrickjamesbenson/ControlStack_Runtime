import { createBoardDataState } from "./boardDataState.js";
import { renderBoardDataView } from "./boardDataView.js";
import { createBoardDataViewModel } from "./boardDataViewModel.js";

const BOARD_DATA_STATUS_ENDPOINT = "/api/board-data/status";

const SAFE_STATUS_BASE = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  sourceStatusReadOnly: true,
  writeEnabled: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  selectorResolvingEnabled: false,
  activeResolverEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  googleSyncEnabled: false,
  googleSheetsWriteEnabled: false,
  materialiserWriteEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  materialiserRefreshEnabled: false,
  activeSnapshotPromotionEnabled: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  runtimeDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  rawGoogleRowsExposed: false,
  rawLabEvidenceExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  donorCodeMounted: false,
  candidateEditMode: false,
});

function safeStatusOverridesFor(payload = {}) {
  const ok = payload?.ok === true;
  return {
    ...SAFE_STATUS_BASE,
    productDataAuthority: ok,
    approvedDataSource: ok ? "active authority-reference snapshot" : "unavailable",
  };
}

let mountedContainer = null;
let mountedContext = null;
let mountedServices = null;
let boardDataState = null;
let boardDataRequestId = 0;

const INITIAL_STATUS = Object.freeze({
  ok: null,
  endpoint: BOARD_DATA_STATUS_ENDPOINT,
  moduleId: "board_data",
  label: "Board Data",
  ...safeStatusOverridesFor({ ok: null }),
  counts: {},
  tableSummary: [],
  missingExpectedTables: [],
  warnings: ["Board Data status is loading from the read-only runtime endpoint."],
});

function currentStatus() {
  return boardDataState?.getSnapshot?.().statusPayload || INITIAL_STATUS;
}

function renderCurrentView() {
  if (!mountedContainer || !boardDataState) return;
  const local = boardDataState.getSnapshot();
  const viewModel = createBoardDataViewModel({
    context: mountedContext,
    local,
    status: currentStatus(),
  });
  renderBoardDataView(mountedContainer, viewModel);
}

function applyBoardDataStatus(payload) {
  if (!boardDataState) return;
  boardDataState.setStatusPayload({
    ...payload,
    endpoint: payload?.endpoint || BOARD_DATA_STATUS_ENDPOINT,
    ...safeStatusOverridesFor(payload),
  });
  renderCurrentView();
}

async function loadBoardDataStatus() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    boardDataState?.setFailure("Browser fetch is unavailable; Board Data status could not be read.");
    renderCurrentView();
    return;
  }

  const requestId = boardDataRequestId + 1;
  boardDataRequestId = requestId;
  boardDataState?.setLoading();
  renderCurrentView();

  try {
    const response = await fetchImpl(BOARD_DATA_STATUS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    if (requestId !== boardDataRequestId || !mountedContainer) return;
    applyBoardDataStatus({
      ...payload,
      httpStatus: response.status,
      status: payload?.ok === false ? "warning" : "loaded",
    });
  } catch (error) {
    if (requestId !== boardDataRequestId || !mountedContainer) return;
    boardDataState?.setFailure(`Board Data status request failed: ${error?.message || "unknown error"}.`);
    renderCurrentView();
  }
}

export const boardDataModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("board_data requires an HTMLElement container");
    }

    mountedContainer = container;
    mountedContext = context;
    mountedServices = services;
    boardDataState = createBoardDataState();
    renderCurrentView();
    loadBoardDataStatus();
    services.eventBus?.emit("board-data:mounted", {
      moduleId: "board_data",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      selectorMutationEnabled: false,
      labProofAuthority: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !nextContext) return;
    mountedContext = nextContext;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "board_data";
    renderCurrentView();
  },

  unmount() {
    boardDataRequestId += 1;
    if (mountedContainer) {
      while (mountedContainer.firstChild) {
        mountedContainer.removeChild(mountedContainer.firstChild);
      }
    }
    mountedContainer = null;
    mountedContext = null;
    mountedServices = null;
    boardDataState = null;
  },
};
