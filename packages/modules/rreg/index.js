import { createRregContractAdapter } from "./rregContractAdapter.js";
import { createRregState } from "./rregState.js";
import { renderRregView } from "./rregView.js";
import { createRregViewModel } from "./rregViewModel.js";

let mountedContainer = null;
let rregState = null;
let rregAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !rregState || !rregAdapter) return;
  const viewModel = createRregViewModel({
    adapter: rregAdapter,
    rregState,
  });
  renderRregView(mountedContainer, viewModel);
}

export const rregModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("rreg requires an HTMLElement container");
    }

    mountedContainer = container;
    rregState = createRregState();
    rregAdapter = createRregContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("rreg:mounted", {
      moduleId: "rreg",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      responsibilityMappingOnly: true,
      custodyTransferEnabled: false,
      approvalAutomationEnabled: false,
      permissionEnforcementEnabled: false,
      peopleAssignmentEnabled: false,
      seedScriptEnabled: false,
      kcWriteEnabled: false,
      clxWriteEnabled: false,
      ledgerWriteEnabled: false,
      hubSpotWriteEnabled: false,
      boardDataWriteEnabled: false,
      selectorMutationEnabled: false,
      labProofMutationEnabled: false,
      runtimeDataWriteEnabled: false,
      hiddenWriteBackEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !rregAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "rreg";
    rregAdapter = createRregContractAdapter({
      services: rregAdapter.services,
      context: nextContext,
    });
    renderCurrentView();
  },

  unmount() {
    if (mountedContainer) {
      while (mountedContainer.firstChild) {
        mountedContainer.removeChild(mountedContainer.firstChild);
      }
    }
    mountedContainer = null;
    rregState = null;
    rregAdapter = null;
  },
};
