import { WORKSPACE_CONTRACT_VERSION } from "./contracts.js";

function readIdentity(service) {
  if (typeof service.getIdentitySnapshot === "function") return service.getIdentitySnapshot();
  return {
    owner: service.owner,
    status: service.status,
    source: "phase-4-fallback",
    currentUser: service.currentUser || null,
    role: service.role || "anonymous",
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
      reason: "Phase 4 CRM writes are deferred.",
    },
  };
}

function readDiagnostics(service) {
  if (typeof service.getSnapshot === "function") return service.getSnapshot();
  return {
    owner: service.owner,
    status: service.status,
    phase: "7",
  };
}

export function createShellContext({ route, services, mountedModuleId = null }) {
  const crm = readCrm(services.crm);
  const project = services.project.getProjectSnapshot();
  return {
    contractVersion: WORKSPACE_CONTRACT_VERSION,
    phase: "7",
    route,
    identity: readIdentity(services.identity),
    project,
    currentProject: project.currentProject,
    company: crm.company,
    crm,
    handoff: services.handoff.getHandoffSnapshot(),
    visibility: services.visibility.getVisibilitySnapshot(),
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
    company: context.company,
    crm: context.crm,
    visibility: context.visibility,
    flags: context.flags,
  };
}
