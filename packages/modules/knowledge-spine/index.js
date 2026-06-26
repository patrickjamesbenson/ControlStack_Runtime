import { createKnowledgeSpineContractAdapter } from "./knowledgeSpineContractAdapter.js";
import { createKnowledgeSpineState } from "./knowledgeSpineState.js";
import { renderKnowledgeSpineView } from "./knowledgeSpineView.js";
import { createKnowledgeSpineViewModel } from "./knowledgeSpineViewModel.js";

let mountedContainer = null;
let knowledgeSpineState = null;
let knowledgeSpineAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !knowledgeSpineState || !knowledgeSpineAdapter) return;
  const viewModel = createKnowledgeSpineViewModel({
    adapter: knowledgeSpineAdapter,
    knowledgeSpineState,
  });
  renderKnowledgeSpineView(mountedContainer, viewModel);
}

export const knowledgeSpineModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("knowledge_spine requires an HTMLElement container");
    }

    mountedContainer = container;
    knowledgeSpineState = createKnowledgeSpineState();
    knowledgeSpineAdapter = createKnowledgeSpineContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("knowledge_spine:mounted", {
      moduleId: "knowledge_spine",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      activeAutomationEnabled: false,
      kcWriteEnabled: false,
      clxWriteEnabled: false,
      ledgerWriteEnabled: false,
      lioraAutomationEnabled: false,
      hubSpotWriteEnabled: false,
      repoMapMutationEnabled: false,
      governedTruthMutationEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !knowledgeSpineAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "knowledge_spine";
    knowledgeSpineAdapter = createKnowledgeSpineContractAdapter({
      services: knowledgeSpineAdapter.services,
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
    knowledgeSpineState = null;
    knowledgeSpineAdapter = null;
  },
};
