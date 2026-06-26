import { createSafeLabProofStatus, createUnavailableLabProofStatus, LAB_PROOF_STATUS_ENDPOINT } from "./labProofContractAdapter.js";
import { createLabProofState } from "./labProofState.js";
import { createLabProofViewModel } from "./labProofViewModel.js";
import { renderLabProofView } from "./labProofView.js";

let mountedContainer = null;
let mountedContext = null;
let mountedServices = null;
let labProofState = null;
let labProofRequestId = 0;

const INITIAL_STATUS = Object.freeze(createSafeLabProofStatus({
  ok: null,
  owner: "runtime-shell",
  status: "loading",
  warnings: ["Lab Proof status is loading from the read-only runtime endpoint."],
}));

function currentStatus() {
  return labProofState?.getSnapshot?.().statusPayload || INITIAL_STATUS;
}

function renderCurrentView() {
  if (!mountedContainer || !labProofState) return;
  const local = labProofState.getSnapshot();
  const viewModel = createLabProofViewModel({
    context: mountedContext,
    local,
    status: currentStatus(),
  });
  renderLabProofView(mountedContainer, viewModel);
}

function applyLabProofStatus(payload) {
  if (!labProofState) return;
  labProofState.setStatusPayload(createSafeLabProofStatus(payload));
  renderCurrentView();
}

async function loadLabProofStatus() {
  const fetchImpl = globalThis.fetch;
  if (typeof fetchImpl !== "function") {
    labProofState?.setStatusPayload(createUnavailableLabProofStatus("Browser fetch is unavailable; Lab Proof status could not be read."));
    renderCurrentView();
    return;
  }

  const requestId = labProofRequestId + 1;
  labProofRequestId = requestId;
  labProofState?.setLoading();
  renderCurrentView();

  try {
    const response = await fetchImpl(LAB_PROOF_STATUS_ENDPOINT, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
      cache: "no-store",
    });
    const payload = await response.json();
    if (requestId !== labProofRequestId || !mountedContainer) return;
    applyLabProofStatus({
      ...payload,
      httpStatus: response.status,
      status: payload?.ok === false ? "warning" : "loaded",
    });
  } catch (error) {
    if (requestId !== labProofRequestId || !mountedContainer) return;
    labProofState?.setFailure(`Lab Proof status request failed: ${error?.message || "unknown error"}.`);
    renderCurrentView();
  }
}

export const labProofModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("lab_proof requires an HTMLElement container");
    }

    mountedContainer = container;
    mountedContext = context;
    mountedServices = services;
    labProofState = createLabProofState();
    renderCurrentView();
    loadLabProofStatus();
    services.eventBus?.emit("lab-proof:mounted", {
      moduleId: "lab_proof",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      proofReadinessExplanationOnly: true,
      productionProofAuthority: false,
      labApprovalEnabled: false,
      evidenceUploadEnabled: false,
      evidenceIngestionEnabled: false,
      pdfExposureEnabled: false,
      rawArtefactExposureEnabled: false,
      selectorMutationEnabled: false,
      boardDataWriteEnabled: false,
      iesGenerationEnabled: false,
      complianceCertificationEnabled: false,
      hiddenWriteBackEnabled: false,
      proofClaimsEmitted: false,
      rawLabEvidenceExposed: false,
      rawArtefactsExposed: false,
      rawLedgerExposed: false,
      rawPdfsExposed: false,
      rawIesExposed: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !nextContext) return;
    mountedContext = nextContext;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "lab_proof";
    renderCurrentView();
  },

  unmount() {
    labProofRequestId += 1;
    if (mountedContainer) {
      while (mountedContainer.firstChild) {
        mountedContainer.removeChild(mountedContainer.firstChild);
      }
    }
    mountedContainer = null;
    mountedContext = null;
    mountedServices = null;
    labProofState = null;
  },
};
