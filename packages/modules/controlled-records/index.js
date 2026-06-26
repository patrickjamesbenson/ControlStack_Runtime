import { createControlledRecordsContractAdapter } from "./controlledRecordsContractAdapter.js";
import { createControlledRecordsState } from "./controlledRecordsState.js";
import { renderControlledRecordsView } from "./controlledRecordsView.js";
import { createControlledRecordsViewModel } from "./controlledRecordsViewModel.js";

let mountedContainer = null;
let controlledRecordsState = null;
let controlledRecordsAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !controlledRecordsState || !controlledRecordsAdapter) return;
  const viewModel = createControlledRecordsViewModel({
    adapter: controlledRecordsAdapter,
    controlledRecordsState,
  });
  renderControlledRecordsView(mountedContainer, viewModel);
}

export const controlledRecordsModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("controlled_records requires an HTMLElement container");
    }

    mountedContainer = container;
    controlledRecordsState = createControlledRecordsState();
    controlledRecordsAdapter = createControlledRecordsContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("controlled_records:mounted", {
      moduleId: "controlled_records",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      provenanceMapOnly: true,
      recordCreationEnabled: false,
      recordMutationEnabled: false,
      evidenceIngestionEnabled: false,
      artefactUploadEnabled: false,
      approvalAutomationEnabled: false,
      dispositionWriteEnabled: false,
      labProofAuthority: false,
      rregAuthorityEnabled: false,
      kcWriteEnabled: false,
      clxWriteEnabled: false,
      runtimeDataWriteEnabled: false,
      activeIntakeEnabled: false,
      recordWriteEnabled: false,
      ledgerWriteEnabled: false,
      lioraAutomationEnabled: false,
      hubSpotWriteEnabled: false,
      labLedgerMutationEnabled: false,
      governedTruthMutationEnabled: false,
      derivedActionViewEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !controlledRecordsAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "controlled_records";
    controlledRecordsAdapter = createControlledRecordsContractAdapter({
      services: controlledRecordsAdapter.services,
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
    controlledRecordsState = null;
    controlledRecordsAdapter = null;
  },
};
