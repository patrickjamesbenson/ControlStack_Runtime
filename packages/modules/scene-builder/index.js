import { createSceneBuilderContractAdapter } from "./sceneBuilderContractAdapter.js";
import { createSceneBuilderState } from "./sceneBuilderState.js";
import { renderSceneBuilderView } from "./sceneBuilderView.js";
import { createSceneBuilderViewModel } from "./sceneBuilderViewModel.js";

let mountedContainer = null;
let sceneBuilderState = null;
let sceneBuilderAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !sceneBuilderState || !sceneBuilderAdapter) return;
  const viewModel = createSceneBuilderViewModel({
    adapter: sceneBuilderAdapter,
    sceneBuilderState,
  });
  renderSceneBuilderView(mountedContainer, viewModel);
}

export const sceneBuilderModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("scene_builder requires an HTMLElement container");
    }

    mountedContainer = container;
    sceneBuilderState = createSceneBuilderState();
    sceneBuilderAdapter = createSceneBuilderContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("scene_builder:mounted", {
      moduleId: "scene_builder",
      phase: "scene-builder-structural-module",
      policyOwner: "shell",
      structuralOnly: true,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !sceneBuilderAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "scene_builder";
    sceneBuilderAdapter = createSceneBuilderContractAdapter({
      services: sceneBuilderAdapter.services,
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
    sceneBuilderState = null;
    sceneBuilderAdapter = null;
  },
};
