import { createEmergenceContractAdapter } from "./emergenceContractAdapter.js";
import { createEmergenceState } from "./emergenceState.js";
import { renderEmergenceView } from "./emergenceView.js";
import { createEmergenceViewModel } from "./emergenceViewModel.js";

let mountedContainer = null;
let emergenceState = null;
let emergenceAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !emergenceState || !emergenceAdapter) return;
  const viewModel = createEmergenceViewModel({
    adapter: emergenceAdapter,
    emergenceState,
  });
  renderEmergenceView(mountedContainer, viewModel);
}

export const emergenceModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("emergence requires an HTMLElement container");
    }

    mountedContainer = container;
    emergenceState = createEmergenceState();
    emergenceAdapter = createEmergenceContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("emergence:mounted", {
      moduleId: "emergence",
      phase: "5",
      policyOwner: "shell",
    });
  },

  update(nextContext) {
    if (!mountedContainer || !emergenceAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "emergence";
    emergenceAdapter = createEmergenceContractAdapter({
      services: emergenceAdapter.services,
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
    emergenceState = null;
    emergenceAdapter = null;
  },
};
