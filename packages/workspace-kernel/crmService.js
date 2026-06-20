import { createHubSpotContextAdapter } from "./hubspotContextAdapter.js";

const COMPANY_FIXTURES = Object.freeze([
  Object.freeze({
    companyId: "company-alpha",
    companyName: "Alpha Client",
    domain: "alpha.example.com",
    lifecycleStage: "customer",
    ownerName: "Workspace User",
    source: "fixture",
  }),
  Object.freeze({
    companyId: "company-bravo",
    companyName: "Bravo Client",
    domain: "bravo.example.com",
    lifecycleStage: "opportunity",
    ownerName: "Internal Engineer",
    source: "fixture",
  }),
  Object.freeze({
    companyId: "company-charlie",
    companyName: "Charlie Client",
    domain: "charlie.example.com",
    lifecycleStage: "prospect",
    ownerName: "Workspace User",
    source: "fixture",
  }),
]);

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

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoNow() {
  return new Date().toISOString();
}

function hasContext(value) {
  return !!(value?.auth || value?.identity || value?.project);
}

function normaliseCompanyFixture(companyId) {
  return COMPANY_FIXTURES.find((company) => company.companyId === companyId) || null;
}

function companyFromProject(project = {}) {
  const current = project.currentProject || {};
  const metadata = project.metadata || {};
  const client = current.client || metadata.client || null;
  if (!client || client === "No client loaded") return null;
  return {
    companyId: `project-${current.projectId || metadata.projectId || "runtime"}-company`,
    companyName: client,
    domain: null,
    lifecycleStage: null,
    ownerName: null,
    source: "project-link",
  };
}

function contactFromIdentity(identity = {}, auth = {}) {
  const user = identity.currentUser || auth.user || {};
  const session = auth.session || {};
  const email = session.email || user.email || null;
  if (!email) {
    return {
      owner: "shell",
      status: "empty",
      contactId: null,
      name: null,
      email: null,
      source: "fallback",
    };
  }
  return {
    owner: "shell",
    status: "matched",
    contactId: `auth-${String(email).replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`,
    name: session.name || user.name || "Workspace User",
    email,
    source: auth.session?.authenticated ? "auth-session" : "identity-context",
  };
}

function emptyCompany(reason = "No company linked.") {
  return {
    owner: "shell",
    status: "no-company",
    source: "fallback",
    companyId: null,
    companyName: "No company linked",
    domain: null,
    website: null,
    lifecycleStage: null,
    ownerName: null,
    linkedProjectId: null,
    linkedAt: null,
    associatedDealId: null,
    associatedContactId: null,
    writeEnabled: false,
    diagnostics: {
      hydrated: false,
      writeFlowsEnabled: false,
      reason,
    },
  };
}

function buildCompanyContext(companySeed, { project = {}, sourceOverride = null, linkedAt = null } = {}) {
  if (!companySeed) return emptyCompany();
  const currentProject = project.currentProject || {};
  const projectId = currentProject.projectId || project.metadata?.projectId || null;
  const source = sourceOverride || companySeed.source || "fixture";
  return {
    owner: "shell",
    status: source === "project-link" ? "project-linked" : "fixture-linked",
    source,
    companyId: companySeed.companyId,
    companyName: companySeed.companyName,
    domain: companySeed.domain || null,
    website: companySeed.domain ? `https://${companySeed.domain}` : null,
    lifecycleStage: companySeed.lifecycleStage || null,
    ownerName: companySeed.ownerName || null,
    linkedProjectId: projectId,
    linkedAt: linkedAt || isoNow(),
    associatedDealId: null,
    associatedContactId: null,
    writeEnabled: false,
    diagnostics: {
      hydrated: true,
      writeFlowsEnabled: false,
      reason: "Read-safe shell-owned company context. CRM writes remain deferred.",
    },
  };
}

export function createCrmService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const hubspot = createHubSpotContextAdapter();
  const state = {
    owner: "shell",
    status: "ready",
    source: "hubspot-company-context-read-safe",
    selectedCompanyId: null,
    selectedCompanyLinkedAt: null,
    useProjectLinkedFallback: true,
    lastError: null,
    lastContext: {},
  };

  function rememberContext(context = {}) {
    if (hasContext(context)) state.lastContext = context;
    return hasContext(context) ? context : state.lastContext;
  }

  function resolveCompany(context = {}) {
    const effectiveContext = rememberContext(context);
    const fixture = state.selectedCompanyId ? normaliseCompanyFixture(state.selectedCompanyId) : null;
    if (fixture) {
      return buildCompanyContext(fixture, {
        project: effectiveContext.project,
        sourceOverride: "fixture-linked",
        linkedAt: state.selectedCompanyLinkedAt,
      });
    }
    if (state.useProjectLinkedFallback !== false) {
      const projectCompany = companyFromProject(effectiveContext.project);
      if (projectCompany) {
        return buildCompanyContext(projectCompany, {
          project: effectiveContext.project,
          sourceOverride: "project-link",
          linkedAt: state.selectedCompanyLinkedAt,
        });
      }
    }
    return emptyCompany("No company fixture selected and current project has no usable client context.");
  }

  function companySnapshot(context = {}) {
    return resolveCompany(context);
  }

  function contactSnapshot(context = {}) {
    const effectiveContext = rememberContext(context);
    return contactFromIdentity(effectiveContext.identity, effectiveContext.auth);
  }

  function dealSnapshot() {
    return {
      owner: "shell",
      status: "deferred",
      dealId: null,
      dealName: null,
      source: "deferred",
      reason: "Deal context and HubSpot mutations are deferred.",
    };
  }

  function snapshot(context = {}) {
    const effectiveContext = rememberContext(context);
    const hubspotContext = hubspot.getContextSnapshot();
    const company = companySnapshot(effectiveContext);
    const contact = contactSnapshot(effectiveContext);
    return {
      owner: state.owner,
      status: company.status === "no-company" ? "no-company" : "company-linked",
      source: state.source,
      readOnly: true,
      company,
      deal: dealSnapshot(),
      contact,
      hubspot: {
        ...hubspotContext,
        status: "read-safe-deferred-writes",
        available: false,
      },
      writePolicy: {
        enabled: false,
        reason: "CRM writes, HubSpot mutations, company/contact/deal updates, and pipeline updates are deferred in this phase.",
      },
      capabilities: {
        readCompanyContext: true,
        linkCompanyToProject: true,
        clearCompanyContext: true,
        inspectCompanyContext: true,
        hubspotWrite: false,
        createCompany: false,
        updateCompany: false,
        createDeal: false,
        updateDeal: false,
        createContact: false,
        updateContact: false,
      },
      availableCompanies: COMPANY_FIXTURES.map(clone),
      selectedCompanyId: state.selectedCompanyId,
      useProjectLinkedFallback: state.useProjectLinkedFallback,
      lastError: state.lastError,
    };
  }

  function notify(reason, context = {}) {
    const nextSnapshot = snapshot(context);
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("crm:changed", { reason, crm: nextSnapshot });
    return nextSnapshot;
  }

  function linkCompanyToCurrentProject(companyId, context = {}, reason = "shell-company-context-linked") {
    const fixture = normaliseCompanyFixture(companyId);
    if (!fixture) {
      state.lastError = `Unknown company fixture: ${companyId}`;
      return {
        accepted: false,
        status: "failed",
        reason: state.lastError,
        crm: snapshot(context),
      };
    }
    state.selectedCompanyId = fixture.companyId;
    state.selectedCompanyLinkedAt = isoNow();
    state.useProjectLinkedFallback = false;
    state.lastError = null;
    return {
      accepted: true,
      status: "company-linked",
      company: companySnapshot(context),
      crm: notify(reason, context),
      reason: "Shell-owned read-safe company context linked to current project context.",
    };
  }

  function useProjectCompanyContext(context = {}, reason = "shell-company-context-project-fallback") {
    state.selectedCompanyId = null;
    state.selectedCompanyLinkedAt = isoNow();
    state.useProjectLinkedFallback = true;
    state.lastError = null;
    return {
      accepted: true,
      status: "project-linked",
      company: companySnapshot(context),
      crm: notify(reason, context),
      reason: "Using shell-owned project-linked company context.",
    };
  }

  function clearCompanyContext(context = {}, reason = "shell-company-context-cleared") {
    state.selectedCompanyId = null;
    state.selectedCompanyLinkedAt = null;
    state.useProjectLinkedFallback = false;
    state.lastError = null;
    return {
      accepted: true,
      status: "no-company",
      company: companySnapshot(context),
      crm: notify(reason, context),
      reason: "Company context cleared. Shell remains read-safe with CRM writes disabled.",
    };
  }

  return {
    owner: state.owner,
    status: state.status,
    getCompanyContext: companySnapshot,
    getDealContext: dealSnapshot,
    getContactContext: contactSnapshot,
    getHubSpotContext() {
      return hubspot.getContextSnapshot();
    },
    getCrmSnapshot: snapshot,
    getAvailableCompanies() {
      return COMPANY_FIXTURES.map(clone);
    },
    linkCompanyToCurrentProject,
    useProjectCompanyContext,
    clearCompanyContext,
    setPlaceholderCompany(nextCompany = {}, reason = "compat-read-safe-company-update") {
      if (nextCompany.companyId) return linkCompanyToCurrentProject(nextCompany.companyId, {}, reason);
      state.lastError = null;
      return notify(reason, {});
    },
    subscribe: subscriptions.subscribe,
  };
}