import { createCoordinatedSurfacesContractAdapter } from "./coordinatedSurfacesContractAdapter.js";
import { createCoordinatedSurfacesState } from "./coordinatedSurfacesState.js";
import { renderCoordinatedSurfacesView } from "./coordinatedSurfacesView.js";
import { createCoordinatedSurfacesViewModel } from "./coordinatedSurfacesViewModel.js";

let mountedContainer = null;
let coordinatedSurfacesState = null;
let coordinatedSurfacesAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !coordinatedSurfacesState || !coordinatedSurfacesAdapter) return;
  const viewModel = createCoordinatedSurfacesViewModel({
    adapter: coordinatedSurfacesAdapter,
    coordinatedSurfacesState,
  });
  renderCoordinatedSurfacesView(mountedContainer, viewModel);
}

export const coordinatedSurfacesModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("coordinated_surfaces requires an HTMLElement container");
    }

    mountedContainer = container;
    coordinatedSurfacesState = createCoordinatedSurfacesState();
    coordinatedSurfacesAdapter = createCoordinatedSurfacesContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("coordinated_surfaces:mounted", {
      moduleId: "coordinated_surfaces",
      phase: "coordinated-surfaces-runtime-readonly-1",
      policyOwner: "shell",
      readOnly: true,
      diagnosticOnly: true,
      coordinationAuthority: false,
      drawingAuthority: false,
      setoutAuthority: false,
      clashResolutionAuthority: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !coordinatedSurfacesAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "coordinated_surfaces";
    coordinatedSurfacesAdapter = createCoordinatedSurfacesContractAdapter({
      services: coordinatedSurfacesAdapter.services,
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
    coordinatedSurfacesState = null;
    coordinatedSurfacesAdapter = null;
  },
};
