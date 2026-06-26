import { createKnowledgeBaseContractAdapter } from "./knowledgeBaseContractAdapter.js";
import { createKnowledgeBaseState } from "./knowledgeBaseState.js";
import { renderKnowledgeBaseView } from "./knowledgeBaseView.js";
import { createKnowledgeBaseViewModel } from "./knowledgeBaseViewModel.js";

let mountedContainer = null;
let knowledgeBaseState = null;
let knowledgeBaseAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !knowledgeBaseState || !knowledgeBaseAdapter) return;
  const viewModel = createKnowledgeBaseViewModel({
    adapter: knowledgeBaseAdapter,
    knowledgeBaseState,
  });
  renderKnowledgeBaseView(mountedContainer, viewModel);
}

export const knowledgeBaseModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("knowledge_base requires an HTMLElement container");
    }

    mountedContainer = container;
    knowledgeBaseState = createKnowledgeBaseState();
    knowledgeBaseAdapter = createKnowledgeBaseContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("knowledge_base:mounted", {
      moduleId: "knowledge_base",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      knowledgeReferenceOnly: true,
      kcWriteEnabled: false,
      kcPublishEnabled: false,
      approvalAutomationEnabled: false,
      lioraAutomationEnabled: false,
      clxMutationEnabled: false,
      hubSpotWriteEnabled: false,
      boardDataMutationEnabled: false,
      labProofMutationEnabled: false,
      selectorMutationEnabled: false,
      runtimeDataWriteEnabled: false,
      hiddenWriteBackEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !knowledgeBaseAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "knowledge_base";
    knowledgeBaseAdapter = createKnowledgeBaseContractAdapter({
      services: knowledgeBaseAdapter.services,
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
    knowledgeBaseState = null;
    knowledgeBaseAdapter = null;
  },
};
