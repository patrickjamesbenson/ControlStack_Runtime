import { createComplianceMattersContractAdapter } from "./complianceMattersContractAdapter.js";
import { createComplianceMattersState } from "./complianceMattersState.js";
import { renderComplianceMattersView } from "./complianceMattersView.js";
import { createComplianceMattersViewModel } from "./complianceMattersViewModel.js";

let mountedContainer = null;
let complianceMattersState = null;
let complianceMattersAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !complianceMattersState || !complianceMattersAdapter) return;
  const viewModel = createComplianceMattersViewModel({
    adapter: complianceMattersAdapter,
    complianceMattersState,
  });
  renderComplianceMattersView(mountedContainer, viewModel);
}

export const complianceMattersModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("compliance_matters requires an HTMLElement container");
    }

    mountedContainer = container;
    complianceMattersState = createComplianceMattersState();
    complianceMattersAdapter = createComplianceMattersContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("compliance_matters:mounted", {
      moduleId: "compliance_matters",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      certificationAuthority: false,
      signOffEnabled: false,
      liveVerificationEnabled: false,
      exportScorecardEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !complianceMattersAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "compliance_matters";
    complianceMattersAdapter = createComplianceMattersContractAdapter({
      services: complianceMattersAdapter.services,
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
    complianceMattersState = null;
    complianceMattersAdapter = null;
  },
};
