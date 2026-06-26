import { createEngineFlowContractAdapter } from "./engineFlowContractAdapter.js";
import { createEngineFlowState } from "./engineFlowState.js";
import { renderEngineFlowView } from "./engineFlowView.js";
import { createEngineFlowViewModel } from "./engineFlowViewModel.js";

let mountedContainer = null;
let engineFlowState = null;
let engineFlowAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !engineFlowState || !engineFlowAdapter) return;
  const viewModel = createEngineFlowViewModel({
    adapter: engineFlowAdapter,
    engineFlowState,
  });
  renderEngineFlowView(mountedContainer, viewModel);
}

export const engineFlowModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("engine_flow requires an HTMLElement container");
    }

    mountedContainer = container;
    engineFlowState = createEngineFlowState();
    engineFlowAdapter = createEngineFlowContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("engine_flow:mounted", {
      moduleId: "engine_flow",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      staticMapOnly: true,
      engineExecutionEnabled: false,
      selectorFiringEnabled: false,
      selectorMutationEnabled: false,
      iesGenerationEnabled: false,
      runTableGenerationEnabled: false,
      payloadGenerationEnabled: false,
      drawingGenerationEnabled: false,
      labProofAuthority: false,
      boardDataMutationEnabled: false,
      donorRunEngineMounted: false,
      hiddenBackendCallsEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !engineFlowAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "engine_flow";
    engineFlowAdapter = createEngineFlowContractAdapter({
      services: engineFlowAdapter.services,
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
    engineFlowState = null;
    engineFlowAdapter = null;
  },
};
