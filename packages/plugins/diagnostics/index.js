import { createDiagnosticsContractAdapter } from "./diagnosticsContractAdapter.js";
import { createDiagnosticsState } from "./diagnosticsState.js";
import { renderDiagnosticsView } from "./diagnosticsView.js";
import { createDiagnosticsViewModel } from "./diagnosticsViewModel.js";

let mountedContainer = null;
let diagnosticsState = null;
let diagnosticsAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !diagnosticsState || !diagnosticsAdapter) return;
  const viewModel = createDiagnosticsViewModel({
    adapter: diagnosticsAdapter,
    diagnosticsState,
  });
  renderDiagnosticsView(mountedContainer, viewModel);
}

export const diagnosticsPlugin = {
  mount({ container, services, context, pluginContext }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("diagnostics plugin requires an HTMLElement container");
    }

    mountedContainer = container;
    diagnosticsState = createDiagnosticsState();
    diagnosticsAdapter = createDiagnosticsContractAdapter({ services, context, pluginContext });
    renderCurrentView();
    services.eventBus?.emit("plugin:mounted", {
      pluginId: "diagnostics",
      optional: true,
      policyOwner: "shell",
    });
  },

  update({ context, pluginContext }) {
    if (!mountedContainer || !diagnosticsAdapter || !context) return;
    diagnosticsAdapter = createDiagnosticsContractAdapter({
      services: diagnosticsAdapter.services,
      context,
      pluginContext,
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
    diagnosticsState = null;
    diagnosticsAdapter = null;
  },
};
