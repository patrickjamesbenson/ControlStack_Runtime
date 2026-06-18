import { WORKSPACE_CONTRACT_VERSION } from "./contracts.js";

function readIdentity(service) {
  if (typeof service.getIdentitySnapshot === "function") return service.getIdentitySnapshot();
  return {
    owner: service.owner,
    status: service.status,
    source: "phase-8a-fallback",
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
    phase: "p1-project-browser-read-only-foundation",
  };
}

export function createShellContext({ route, services, mountedModuleId = null }) {
  const crm = readCrm(services.crm);
  const project = services.project.getProjectSnapshot();
  const identity = readIdentity(services.identity);
  const visibility = services.visibility.getVisibilitySnapshot({ identity, project });
  const downstream = services.downstream.getDownstreamContextSnapshot({ identity, project, visibility });
  const projectBrowser = services.projectBrowser.getProjectBrowserSnapshot({ identity, project, visibility, downstream });
  return {
    contractVersion: WORKSPACE_CONTRACT_VERSION,
    phase: "p1-project-browser-read-only-foundation",
    route,
    identity,
    project,
    currentProject: project.currentProject,
    projectBrowser,
    company: crm.company,
    crm,
    handoff: services.handoff.getHandoffSnapshot(),
    visibility,
    downstream,
    flags: services.flags.getFlagSnapshot(),
    lifecycle: {
      owner: "shell",
      mountedModuleId,
      mountedAt: null,
      lastUpdatedAt: null,
    },
    diagnostics: readDiagnostics(services.diagnostics),
  };
}

export function createModuleUpdateSnapshot(context) {
  return {
    route: context.route,
    identity: context.identity,
    project: context.project,
    currentProject: context.currentProject,
    projectBrowser: context.projectBrowser,
    company: context.company,
    crm: context.crm,
    visibility: context.visibility,
    downstream: context.downstream,
    flags: context.flags,
  };
}
