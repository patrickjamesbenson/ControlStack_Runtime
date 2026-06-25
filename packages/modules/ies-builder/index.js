import { createIesBuilderState } from "./iesBuilderState.js";
import { renderIesBuilderView } from "./iesBuilderView.js";
import { createIesBuilderViewModel } from "./iesBuilderViewModel.js";

const IES_BUILDER_STATUS_ENDPOINT = "/api/ies-builder/status";

let mountedContainer = null;
let mountedContext = null;
let mountedServices = null;
let iesBuilderState = null;
let iesBuilderRequestId = 0;

const INITIAL_STATUS = Object.freeze({
  ok: null,
  endpoint: IES_BUILDER_STATUS_ENDPOINT,
  owner: "runtime-shell",
  moduleId: "ies_builder",
  label: "IES Builder / Photometry",
  readOnly: true,
  diagnosticOnly: true,
  productionProofAuthority: false,
  labApprovalRequired: true,
  selectorMutationEnabled: false,
  boardDataWritesEnabled: false,
  iesGenerationEnabled: false,
  uploadEnabled: false,
  parseEnabled: false,
  exportEnabled: false,
  polarPreviewEnabled: false,
  candidateOutputOnly: true,
  proofClaimsEmitted: false,
  rawIesExposed: false,
  rawLabEvidenceExposed: false,
  rawArtefactsExposed: false,
  rawPdfsExposed: false,
  donorPythonMounted: false,
  largeDependenciesAdded: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  noWritesAttempted: true,
  postEndpointsEnabled: false,
  proofStatus: "not_proof_authority",
  warnings: ["IES Builder status is loading from the read-only runtime endpoint."],
});

function safeStatus(payload = {}) {
  return {
    ...payload,
    endpoint: payload?.endpoint || IES_BUILDER_STATUS_ENDPOINT,
    owner: payload?.owner || "runtime-server",
    moduleId: "ies_builder",
    label: "IES Builder / Photometry",
    readOnly: true,
    diagnosticOnly: true,
    productionProofAuthority: false,
    labApprovalRequired: true,
    selectorMutationEnabled: false,
    boardDataWritesEnabled: false,
    iesGenerationEnabled: false,
    uploadEnabled: false,
    parseEnabled: false,
    exportEnabled: false,
    polarPreviewEnabled: false,
    candidateOutputOnly: true,
    proofClaimsEmitted: false,
    rawIesExposed: false,
    rawLabEvidenceExposed: false,
    rawArtefactsExposed: false,
    rawPdfsExposed: false,
    donorPythonMounted: false,
    largeDependenciesAdded: false,
    googleSyncEnabled: false,
    activeSnapshotWriteEnabled: false,
    materialisedSnapshotWriteEnabled: false,
    noWritesAttempted: true,
    postEndpointsEnabled: false,
    proofStatus: "not_proof_authority",
    warnings: Array.isArray(payload?.warnings) && payload.warnings.length
      ? payload.warnings
      : [
          "IES Builder will generate candidate photometry only.",
          "Lab approval is required before any output can be treated as proof.",
          "Selector mutation is disabled.",
          "Board Data writes are disabled.",
          "Upload, parse, export, and polar preview are disabled in this first slice.",
          "Raw IES contents are not exposed.",
        ],
  };
}

function currentStatus() {
  return iesBuilderState?.getSnapshot?.().statusPayload || INITIAL_STATUS;
}

function renderCurrentView() {
  if (!mountedContainer || !iesBuilderState) return;
  const local = iesBuilderState.getSnapshot();
  const viewModel = createIesBuilderViewModel({
    context: mountedContext,
    local,
    status: currentStatus(),
  });
  renderIesBuilderView(mountedContainer, viewModel);
}

function applyIesBuilderStatus(payload) {
  if (!iesBuilderState) return;
  iesBuilderState.setStatusPayload(safeStatus(payload));
  renderCurrentView();
}

async function loadIesBuilderStatus() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    iesBuilderState?.setFailure("Browser fetch is unavailable; IES Builder status could not be read.");
    renderCurrentView();
    return;
  }

  const requestId = iesBuilderRequestId + 1;
  iesBuilderRequestId = requestId;
  iesBuilderState?.setLoading();
  renderCurrentView();

  try {
    const response = await fetchImpl(IES_BUILDER_STATUS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    if (requestId !== iesBuilderRequestId || !mountedContainer) return;
    applyIesBuilderStatus({
      ...payload,
      httpStatus: response.status,
      status: payload?.ok === false ? "warning" : "loaded",
    });
  } catch (error) {
    if (requestId !== iesBuilderRequestId || !mountedContainer) return;
    iesBuilderState?.setFailure(`IES Builder status request failed: ${error?.message || "unknown error"}.`);
    renderCurrentView();
  }
}

export const iesBuilderModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("ies_builder requires an HTMLElement container");
    }

    mountedContainer = container;
    mountedContext = context;
    mountedServices = services;
    iesBuilderState = createIesBuilderState();
    renderCurrentView();
    loadIesBuilderStatus();
    services.eventBus?.emit("ies-builder:mounted", {
      moduleId: "ies_builder",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      productionProofAuthority: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !nextContext) return;
    mountedContext = nextContext;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "ies_builder";
    renderCurrentView();
  },

  unmount() {
    iesBuilderRequestId += 1;
    if (mountedContainer) {
      while (mountedContainer.firstChild) {
        mountedContainer.removeChild(mountedContainer.firstChild);
      }
    }
    mountedContainer = null;
    mountedContext = null;
    mountedServices = null;
    iesBuilderState = null;
  },
};
