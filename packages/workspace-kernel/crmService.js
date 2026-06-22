import { createHubSpotContextAdapter } from "./hubspotContextAdapter.js";

const CRM_READ_ENDPOINT = "/api/" + "hubspot" + "/read";

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

function domainFromEmail(email) {
  const value = String(email || "").trim().toLowerCase();
  return value.includes("@") ? value.split("@").pop() : null;
}

function stateSafeProjectCompany(project = {}) {
  return companyFromProject(project);
}

function crmLookupSeed(context = {}) {
  const auth = context.auth || {};
  const identity = context.identity || {};
  const project = context.project || {};
  const user = identity.currentUser || auth.user || {};
  const session = auth.session || {};
  const current = project.currentProject || {};
  const metadata = project.metadata || {};
  const email = session.email || user.email || null;
  const projectCompany = stateSafeProjectCompany(project);
  const companyName = projectCompany?.companyName || current.client || metadata.client || null;
  return {
    email,
    domain: projectCompany?.domain || domainFromEmail(email),
    companyName,
  };
}

function lookupKeyFor(seed = {}) {
  return [seed.email || "", seed.domain || "", seed.companyName || ""].join("|").toLowerCase();
}

function emptyCrmRead(reason = "CRM read-only lookup has not run.") {
  return {
    owner: "shell",
    status: "not-run",
    source: "server-crm-read-only",
    configured: false,
    available: false,
    readOnly: true,
    reason,
    lookupKey: null,
    pending: false,
    contact: null,
    company: null,
    resolvedAt: null,
    writePolicy: { enabled: false, reason: "CRM writes are disabled." },
  };
}

function crmContactSnapshot(lookup, fallback) {
  const contact = lookup?.contact;
  if (!contact?.found) return fallback;
  return {
    owner: "shell",
    status: "crm-found",
    contactId: contact.contactId || null,
    name: contact.name || fallback.name,
    email: contact.email || fallback.email,
    lifecycleStage: contact.lifecycleStage || null,
    leadStatus: contact.leadStatus || null,
    ownerId: contact.ownerId || null,
    source: "crm-read-only",
  };
}

function crmCompanyContext(lookup, project) {
  const company = lookup?.company;
  if (!company?.found) return null;
  const projectId = project?.currentProject?.projectId || project?.metadata?.projectId || null;
  return {
    owner: "shell",
    status: "crm-found",
    source: "crm-read-only",
    companyId: company.companyId || null,
    companyName: company.companyName || "CRM company",
    domain: company.domain || null,
    website: company.website || null,
    lifecycleStage: company.lifecycleStage || null,
    ownerName: company.ownerId || null,
    linkedProjectId: projectId,
    linkedAt: lookup.resolvedAt || isoNow(),
    associatedDealId: null,
    associatedContactId: lookup.contact?.contactId || null,
    writeEnabled: false,
    diagnostics: {
      hydrated: true,
      writeFlowsEnabled: false,
      reason: lookup.reason || "CRM read-only company context found. Writes remain disabled.",
    },
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
    crmRead: emptyCrmRead(),
  };

  function rememberContext(context = {}) {
    if (hasContext(context)) state.lastContext = context;
    return hasContext(context) ? context : state.lastContext;
  }

  function startCrmRead(context = {}) {
    const seed = crmLookupSeed(context);
    const lookupKey = lookupKeyFor(seed);
    if (!lookupKey.replace(/\|/g, "")) {
      state.crmRead = emptyCrmRead("No email, domain, or company name is available for CRM lookup.");
      return state.crmRead;
    }
    if (state.crmRead.lookupKey === lookupKey && (state.crmRead.pending || state.crmRead.status === "completed" || state.crmRead.status === "unconfigured" || state.crmRead.status === "failed")) {
      return state.crmRead;
    }
    if (typeof fetch !== "function") {
      state.crmRead = emptyCrmRead("Fetch is unavailable; CRM read-only lookup cannot run in this runtime.");
      return state.crmRead;
    }
    state.crmRead = {
      ...emptyCrmRead("CRM read-only lookup is pending."),
      status: "pending",
      pending: true,
      lookupKey,
    };
    const params = new URLSearchParams();
    if (seed.email) params.set("email", seed.email);
    if (seed.domain) params.set("domain", seed.domain);
    if (seed.companyName) params.set("companyName", seed.companyName);
    fetch(`${CRM_READ_ENDPOINT}?${params.toString()}`, { method: "GET", credentials: "same-origin", headers: { Accept: "application/json" } })
      .then((response) => response.json().then((payload) => ({ response, payload })))
      .then(({ response, payload }) => {
        state.crmRead = {
          owner: "shell",
          status: payload.configured === false ? "unconfigured" : response.ok && payload.ok !== false ? "completed" : "failed",
          source: payload.source || "server-crm-read-only",
          configured: payload.configured === true,
          available: payload.available === true,
          readOnly: payload.readOnly !== false,
          reason: payload.reason || "CRM read-only lookup completed.",
          lookupKey,
          pending: false,
          contact: payload.contact || null,
          company: payload.company || null,
          resolvedAt: isoNow(),
          writePolicy: payload.writePolicy || { enabled: false, reason: "CRM writes are disabled." },
        };
        eventBus?.emit("crm:read-completed", { reason: state.crmRead.status, crmRead: clone(state.crmRead) });
      })
      .catch((error) => {
        state.crmRead = {
          ...emptyCrmRead(`CRM read-only lookup failed: ${error?.message || "unknown error"}.`),
          status: "failed",
          configured: true,
          lookupKey,
          pending: false,
          resolvedAt: isoNow(),
        };
        eventBus?.emit("crm:read-completed", { reason: "failed", crmRead: clone(state.crmRead) });
      });
    return state.crmRead;
  }

  function resolveCompany(context = {}) {
    const effectiveContext = rememberContext(context);
    const crmCompany = crmCompanyContext(state.crmRead, effectiveContext.project);
    if (crmCompany) return crmCompany;
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
    const fallback = contactFromIdentity(effectiveContext.identity, effectiveContext.auth);
    return crmContactSnapshot(state.crmRead, fallback);
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

  function associationSourceFor({ company, contact }) {
    if (company?.source === "crm-read-only" || contact?.source === "crm-read-only") return "crm-read";
    if (company?.source === "project-link") return "project-link";
    if (company?.source === "fixture-linked" || company?.source === "fixture") return "manual-link";
    return "none";
  }

  function projectCrmAssociationSnapshot({ context = {}, company, contact, deal }) {
    const project = context.project || {};
    const currentProject = project.currentProject || {};
    const projectId = currentProject.projectId || project.metadata?.projectId || null;
    const source = associationSourceFor({ company, contact });
    const hasContact = Boolean(contact?.contactId && contact.source === "crm-read-only");
    const hasCompany = Boolean(company?.companyId && company.status !== "no-company");
    const hasDeal = Boolean(deal?.dealId);
    return {
      owner: "shell",
      status: hasContact || hasCompany || hasDeal ? "associated" : "none",
      source,
      readOnly: true,
      projectId,
      contact: hasContact ? {
        contactId: contact.contactId,
        email: contact.email || null,
        name: contact.name || null,
        source: contact.source,
      } : {
        contactId: null,
        email: null,
        name: null,
        source: "none",
      },
      company: hasCompany ? {
        companyId: company.companyId,
        companyName: company.companyName || null,
        domain: company.domain || null,
        source: source === "manual-link" ? "manual-link" : company.source,
      } : {
        companyId: null,
        companyName: null,
        domain: null,
        source: "none",
      },
      deal: hasDeal ? {
        dealId: deal.dealId,
        dealName: deal.dealName || null,
        source: deal.source || "known-read-safe",
      } : {
        dealId: null,
        dealName: null,
        source: "none",
      },
      writePolicy: {
        enabled: false,
        reason: "Project CRM association is shell-owned and read-only.",
      },
      diagnostics: {
        provenance: source,
        selectorOwned: false,
        providerMutationEnabled: false,
        providerSyncEnabled: false,
      },
    };
  }

  function snapshot(context = {}) {
    const effectiveContext = rememberContext(context);
    const crmRead = startCrmRead(effectiveContext);
    const hubspotContext = hubspot.getContextSnapshot();
    const company = companySnapshot(effectiveContext);
    const contact = contactSnapshot(effectiveContext);
    const deal = dealSnapshot();
    const association = projectCrmAssociationSnapshot({ context: effectiveContext, company, contact, deal });
    return {
      owner: state.owner,
      status: crmRead.status === "pending" ? "crm-read-pending" : company.status === "no-company" ? "no-company" : "company-linked",
      source: company.source === "hubspot-read-only" || company.source === "crm-read-only" ? "hubspot-read-only-crm-context" : state.source,
      readOnly: true,
      company,
      deal,
      contact,
      association,
      hubspot: {
        ...hubspotContext,
        status: crmRead.status,
        available: crmRead.available === true,
        configured: crmRead.configured === true,
        readOnly: crmRead.readOnly !== false,
        source: crmRead.source,
        reason: crmRead.reason,
        resolvedAt: crmRead.resolvedAt,
      },
      crmRead: clone(crmRead),
      writePolicy: {
        enabled: false,
        reason: "CRM writes, HubSpot mutations, company/contact/deal updates, and pipeline updates are deferred in this phase.",
      },
      capabilities: {
        readCompanyContext: true,
        readContactContext: true,
        readHubSpotContext: true,
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