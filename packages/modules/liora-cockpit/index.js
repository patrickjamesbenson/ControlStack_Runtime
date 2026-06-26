import { createLioraCockpitContractAdapter } from "./lioraCockpitContractAdapter.js";
import { createLioraCockpitState } from "./lioraCockpitState.js";
import { renderLioraCockpitView } from "./lioraCockpitView.js";
import { createLioraCockpitViewModel } from "./lioraCockpitViewModel.js";

let mountedContainer = null;
let lioraCockpitState = null;
let lioraCockpitAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !lioraCockpitState || !lioraCockpitAdapter) return;
  const viewModel = createLioraCockpitViewModel({
    adapter: lioraCockpitAdapter,
    lioraCockpitState,
  });
  renderLioraCockpitView(mountedContainer, viewModel);
}

export const lioraCockpitModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("liora_cockpit requires an HTMLElement container");
    }

    mountedContainer = container;
    lioraCockpitState = createLioraCockpitState();
    lioraCockpitAdapter = createLioraCockpitContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("liora_cockpit:mounted", {
      moduleId: "liora_cockpit",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      activeMessageIngestionEnabled: false,
      chatAgentEnabled: false,
      draftCreationEnabled: false,
      sendEnabled: false,
      hubSpotReadEnabled: false,
      hubSpotWriteEnabled: false,
      kcWriteEnabled: false,
      clxWriteEnabled: false,
      ledgerWriteEnabled: false,
      controlledRecordWriteEnabled: false,
      rregWriteEnabled: false,
      boardDataWriteEnabled: false,
      selectorMutationEnabled: false,
      labProofMutationEnabled: false,
      iesGenerationEnabled: false,
      governedTruthMutationEnabled: false,
      hiddenWriteBackEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !lioraCockpitAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "liora_cockpit";
    lioraCockpitAdapter = createLioraCockpitContractAdapter({
      services: lioraCockpitAdapter.services,
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
    lioraCockpitState = null;
    lioraCockpitAdapter = null;
  },
};
