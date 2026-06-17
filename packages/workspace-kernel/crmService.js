import { createHubSpotContextAdapter } from "./hubspotContextAdapter.js";

function createSubscriptionSet() {
  const listeners = new Set();
  return {
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    notify(snapshot) {
      for (const handler of listeners) handler(snapshot);
    },
  };
}

export function createCrmService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const hubspot = createHubSpotContextAdapter();
  const company = {
    owner: "shell",
    status: "placeholder",
    source: "phase-4-placeholder",
    companyId: null,
    companyName: "No company loaded",
    website: null,
    lifecycleStage: null,
    ownerName: null,
    associatedDealId: null,
    associatedContactId: null,
    diagnostics: {
      hydrated: false,
      writeFlowsEnabled: false,
      reason: "Phase 4 placeholder context only.",
    },
  };
  const deal = {
    owner: "shell",
    status: "placeholder",
    dealId: null,
    dealName: null,
  };
  const contact = {
    owner: "shell",
    status: "placeholder",
    contactId: null,
    contactName: null,
    email: null,
  };

  function companySnapshot() {
    return {
      ...company,
      diagnostics: { ...company.diagnostics },
    };
  }

  function snapshot() {
    const hubspotContext = hubspot.getContextSnapshot();
    return {
      owner: "shell",
      status: "placeholder",
      source: "phase-4-placeholder",
      company: companySnapshot(),
      deal: { ...deal },
      contact: { ...contact },
      hubspot: hubspotContext,
      writePolicy: { ...hubspotContext.writePolicy },
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("crm:changed", { reason, crm: nextSnapshot });
    return nextSnapshot;
  }

  return {
    owner: "shell",
    status: "placeholder",
    getCompanyContext: companySnapshot,
    getDealContext() {
      return { ...deal };
    },
    getContactContext() {
      return { ...contact };
    },
    getHubSpotContext() {
      return hubspot.getContextSnapshot();
    },
    getCrmSnapshot: snapshot,
    setPlaceholderCompany(nextCompany = {}, reason = "phase-4-placeholder-update") {
      Object.assign(company, nextCompany);
      return notify(reason);
    },
    subscribe: subscriptions.subscribe,
  };
}
