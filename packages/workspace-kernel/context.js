import { WORKSPACE_CONTRACT_VERSION } from "./contracts.js";

function readIdentity(service) {
  return {
    owner: service.owner,
    status: service.status,
    currentUser: service.currentUser || null,
    role: service.role || "anonymous",
  };
}

function readCompany(service) {
  if (typeof service.getCompanyContext === "function") return service.getCompanyContext();
  return {
    owner: service.owner,
    status: service.status,
    source: "phase-2-placeholder",
    companyId: null,
    companyName: null,
  };
}

function readDiagnostics(service) {
  if (typeof service.getSnapshot === "function") return service.getSnapshot();
  return {
    owner: service.owner,
    status: service.status,
    phase: "2",
  };
}

export function createShellContext({ route, services, mountedModuleId = null }) {
  return {
    contractVersion: WORKSPACE_CONTRACT_VERSION,
    phase: "2",
    route,
    identity: readIdentity(services.identity),
    project: services.project.getProjectSnapshot(),
    company: readCompany(services.crm),
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
    company: context.company,
    visibility: context.visibility,
    flags: context.flags,
  };
}
