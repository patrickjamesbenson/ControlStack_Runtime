import { createSelectorContractAdapter } from "./selectorContractAdapter.js";
import { createSelectorState } from "./selectorState.js";
import { renderSelectorView } from "./selectorView.js";
import { createSelectorViewModel } from "./selectorViewModel.js";

let mountedContainer = null;
let selectorState = null;
let selectorAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !selectorState || !selectorAdapter) return;
  const viewModel = createSelectorViewModel({
    adapter: selectorAdapter,
    selectorState,
  });
  renderSelectorView(mountedContainer, viewModel);
}

export const csSelectorModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("cs_selector requires an HTMLElement container");
    }

    mountedContainer = container;
    selectorState = createSelectorState();
    selectorAdapter = createSelectorContractAdapter({ services, context });
    renderCurrentView();
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
