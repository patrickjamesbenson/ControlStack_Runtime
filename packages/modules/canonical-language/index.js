import { createCanonicalLanguageContractAdapter } from "./canonicalLanguageContractAdapter.js";
import { createCanonicalLanguageState } from "./canonicalLanguageState.js";
import { renderCanonicalLanguageView } from "./canonicalLanguageView.js";
import { createCanonicalLanguageViewModel } from "./canonicalLanguageViewModel.js";

let mountedContainer = null;
let canonicalLanguageState = null;
let canonicalLanguageAdapter = null;

function renderCurrentView() {
  if (!mountedContainer || !canonicalLanguageState || !canonicalLanguageAdapter) return;
  const viewModel = createCanonicalLanguageViewModel({
    adapter: canonicalLanguageAdapter,
    canonicalLanguageState,
  });
  renderCanonicalLanguageView(mountedContainer, viewModel);
}

export const canonicalLanguageModule = {
  mount({ container, services, context }) {
    if (!(container instanceof HTMLElement)) {
      throw new Error("canonical_language requires an HTMLElement container");
    }

    mountedContainer = container;
    canonicalLanguageState = createCanonicalLanguageState();
    canonicalLanguageAdapter = createCanonicalLanguageContractAdapter({ services, context });
    renderCurrentView();
    services.eventBus?.emit("canonical_language:mounted", {
      moduleId: "canonical_language",
      policyOwner: "runtime-shell",
      readOnly: true,
      diagnosticOnly: true,
      vocabularyReferenceOnly: true,
      clxWriteEnabled: false,
      glossaryMutationEnabled: false,
      synonymAutoCorrectionEnabled: false,
      kcWriteEnabled: false,
      lioraAutomationEnabled: false,
      hubSpotWriteEnabled: false,
      selectorMutationEnabled: false,
      boardDataMutationEnabled: false,
      labProofMutationEnabled: false,
      runtimeDataWriteEnabled: false,
      hiddenWriteBackEnabled: false,
    });
  },

  update(nextContext) {
    if (!mountedContainer || !canonicalLanguageAdapter || !nextContext) return;
    mountedContainer.dataset.lastUpdate = new Date().toISOString();
    mountedContainer.dataset.module = nextContext.route?.moduleId || "canonical_language";
    canonicalLanguageAdapter = createCanonicalLanguageContractAdapter({
      services: canonicalLanguageAdapter.services,
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
    canonicalLanguageState = null;
    canonicalLanguageAdapter = null;
  },
};
