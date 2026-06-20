import { WORKSPACE_CONTRACT_VERSION } from "./contracts.js";

function readAuth(service) {
  if (typeof service.getAuthSnapshot === "function") return service.getAuthSnapshot();
  return {
    owner: "shell",
    status: "signed-out",
    live: true,
    source: "real-login-auth",
    session: { authenticated: false },
    user: {
      id: "anonymous-visitor",
      name: "Anonymous visitor",
      email: null,
      classification: "anonymous",
      identityState: "external_anonymous",
      actualRole: "external_user",
      authSource: "fallback",
    },
  };
}

function readIdentity(service) {
  if (typeof service.getIdentitySnapshot === "function") return service.getIdentitySnapshot();
  return {
    owner: service.owner,
    status: service.status,
    source: "real-login-auth-fallback",
    currentUser: service.currentUser || null,
    role: service.role || "external_user",
    actualRole: service.role || "external_user",
    derivedActualRole: service.role || "external_user",
    displayRole: service.role || "external_user",
    identityState: "external_anonymous",
    classification: "anonymous",
    capabilities: [],
  };
}

function readCompany(service) {
  if (typeof service.getCompanyContext === "function") return service.getCompanyContext();
  return {
    owner: service.owner,
    status: service.status,
    source: "phase-4-fallback",
    companyId: null,
    companyName: "No company loaded",
    diagnostics: {
      hydrated: false,
      writeFlowsEnabled: false,
      reason: "No CRM service snapshot available.",
    },
  };
}

function readCrm(service) {
  if (typeof service.getCrmSnapshot === "function") return service.getCrmSnapshot();
  const company = readCompany(service);
  return {
    owner: service.owner,
    status: service.status,
    source: company.source,
    company,
    deal: null,
    contact: null,
    writePolicy: {
      enabled: false,
      reason: "CRM writes are deferred.",
    },
  };
}

function readDiagnostics(service) {
  if (typeof service.getSnapshot === "function") return service.getSnapshot();
  return {
    owner: service.owner,
    status: service.status,
    phase: "real-login-auth",
  };
}

export function createShellContext({ route, services, mountedModuleId = null }) {
  const auth = readAuth(services.auth);
  const crm = readCrm(services.crm);
  const project = services.project.getProjectSnapshot();
  const identity = readIdentity(services.identity);
  const visibility = services.visibility.getVisibilitySnapshot({ auth, identity, project });
  const downstream = services.downstream.getDownstreamContextSnapshot({ identity, project, visibility });
  const flags = services.flags.getFlagSnapshot();
  const diagnostics = readDiagnostics(services.diagnostics);
  const baseContext = {
    contractVersion: WORKSPACE_CONTRACT_VERSION,
    phase: "real-login-auth",
    route,
    auth,
    identity,
    project,
    currentProject: project.currentProject,
    company: crm.company,
    crm,
    handoff: services.handoff.getHandoffSnapshot(),
    visibility,
    downstream,
    flags,
    lifecycle: {
      owner: "shell",
      mountedModuleId,
      mountedAt: null,
      lastUpdatedAt: null,
    },
    diagnostics,
  };
  const projectBrowser = services.projectBrowser.getProjectBrowserSnapshot(baseContext);
  return {
    ...baseContext,
    projectBrowser,
    moduleHydrate: projectBrowser.hydrate || null,
    handoffShare: projectBrowser.handoffShare || null,
  };
}

export function createModuleUpdateSnapshot(context) {
  return {
    route: context.route,
    auth: context.auth,
    identity: context.identity,
    project: context.project,
    currentProject: context.currentProject,
    projectBrowser: context.projectBrowser,
    moduleHydrate: context.moduleHydrate,
    handoffShare: context.handoffShare,
    company: context.company,
    crm: context.crm,
    visibility: context.visibility,
    downstream: context.downstream,
    flags: context.flags,
  };
}
