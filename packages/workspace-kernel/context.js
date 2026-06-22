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

function readCompany(service, context = {}) {
  if (typeof service.getCompanyContext === "function") return service.getCompanyContext(context);
  return {
    owner: service.owner,
    status: service.status,
    source: "crm-company-context-fallback",
    companyId: null,
    companyName: "No company linked",
    writeEnabled: false,
    diagnostics: {
      hydrated: false,
      writeFlowsEnabled: false,
      reason: "No CRM service snapshot available.",
    },
  };
}

function readCrm(service, context = {}) {
  if (typeof service.getCrmSnapshot === "function") return service.getCrmSnapshot(context);
  const company = readCompany(service, context);
  return {
    owner: service.owner,
    status: service.status,
    source: company.source,
    readOnly: true,
    company,
    deal: null,
    contact: null,
    writePolicy: {
      enabled: false,
      reason: "CRM writes are deferred.",
    },
  };
}

function readAuthority(service, context = {}) {
  if (typeof service.getAuthoritySnapshot === "function") return service.getAuthoritySnapshot(context);
  return {
    owner: "shell",
    status: "fallback",
    source: "shell-safe-fallback",
    live: true,
    readOnly: true,
    subject: {
      identityClassification: context.identity?.classification || "anonymous",
      classifierOnly: true,
      internalClassifier: false,
    },
    nvb: {
      available: false,
      checked: false,
      matched: false,
      confidence: "none",
    },
    actualRole: {
      value: "external_user",
      source: "safe-fallback",
      derivedFromNvb: false,
      internalDomainUsedAsClassifierOnly: true,
      fallbackApplied: true,
    },
    privileges: {
      specialVisibility: [],
      capabilities: ["workspace:view", "module:cs_selector:view"],
      moduleEntitlements: {
        workspace_home: true,
        cs_selector: true,
        emergence: false,
        scene_builder: false,
      },
      exceptionalEntitlements: [],
      restrictions: [],
      blacklist: {
        active: false,
        reason: null,
        source: "none",
      },
    },
    companyAuthority: {
      status: "not-authority",
    },
    developerSupport: {
      displayRolePreview: true,
      actualRoleOverride: true,
      overrideActive: false,
      overrideLabel: "Developer/test only. Not NVB authority.",
    },
    writePolicy: {
      enabled: false,
      reason: "Authority resolution is read-only.",
    },
  };
}

function readDiagnostics(service) {
  if (typeof service.getSnapshot === "function") return service.getSnapshot();
  return {
    owner: service.owner,
    status: service.status,
    phase: "live-nvb-authority-read",
  };
}

function readTimelinePolicy(service, context = {}) {
  if (typeof service?.getTimelinePolicySnapshot === "function") return service.getTimelinePolicySnapshot(context);
  return {
    owner: "shell",
    status: "unavailable",
    source: "timeline-policy-fallback",
    readOnly: true,
    nonBootCritical: true,
    rolePolicy: { actualRole: context.authority?.actualRole?.value || "external_user", displayLane: "external", displayPreviewOnly: true },
    statusPolicy: { allowedStatuses: [], selectorOwnsStatusRules: false },
    controls: { visible: false },
    diagnostics: { visible: false, nonBootCritical: true },
    defaultWindow: { pastDays: 14, futureDays: 60, source: "fallback" },
    projectDateContext: { stage: "unknown" },
    gates: { mode: "read-only-empty-project", selectorMayOverride: false },
    writePolicy: { enabled: false, reason: "Timeline policy fallback is read-only." },
  };
}

function roleCapabilities(role) {
  const roleOrder = ["external_user", "internal_user", "internal_engineer", "developer", "admin"];
  const rank = roleOrder.indexOf(role);
  const capabilities = ["workspace:view", "module:cs_selector:view"];
  if (rank >= roleOrder.indexOf("internal_user")) capabilities.push("module:emergence:view", "module:scene_builder:view");
  if (rank >= roleOrder.indexOf("internal_engineer")) capabilities.push("workspace:visibility:test");
  if (rank >= roleOrder.indexOf("developer")) capabilities.push("workspace:developer-preview");
  if (rank >= roleOrder.indexOf("admin")) capabilities.push("workspace:admin-preview");
  return capabilities;
}

function applyAuthorityToIdentity(identity = {}, authority = {}) {
  const authorityRole = authority.actualRole?.value || identity.actualRole || "external_user";
  const authoritySource = authority.actualRole?.source || identity.actualRoleSource || "unknown";
  const authorityCapabilities = roleCapabilities(authorityRole);
  return {
    ...identity,
    identitySupportActualRole: identity.actualRole || "external_user",
    identitySupportDerivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
    authorityActualRole: authorityRole,
    authorityActualRoleSource: authoritySource,
    derivedActualRole: authorityRole,
    actualRole: authorityRole,
    actualRoleSource: authoritySource,
    actualRoleDerived: authority.actualRole?.derivedFromNvb === true,
    authorityApplied: true,
    displayRolePreviewCapabilities: identity.capabilities || [],
    capabilities: authorityCapabilities,
    actualCapabilities: authorityCapabilities,
    resolver: {
      ...(identity.resolver || {}),
      derivedActualRole: authorityRole,
      effectiveActualRole: authorityRole,
      actualRoleSource: authoritySource,
      actualRoleDerived: authority.actualRole?.derivedFromNvb === true,
      authorityApplied: true,
    },
  };
}

export function createShellContext({ route, services, mountedModuleId = null }) {
  const auth = readAuth(services.auth);
  const project = services.project.getProjectSnapshot();
  const identity = readIdentity(services.identity);
  const crm = readCrm(services.crm, { auth, identity, project });
  const authority = readAuthority(services.authority, { auth, identity, crm });
  const moduleIdentity = applyAuthorityToIdentity(identity, authority);
  const visibility = services.visibility.getVisibilitySnapshot({ auth, identity: moduleIdentity, authority, project });
  const timelinePolicy = readTimelinePolicy(services.timelinePolicy, { auth, identity: moduleIdentity, authority, visibility, project });
  const downstream = services.downstream.getDownstreamContextSnapshot({ identity: moduleIdentity, project, visibility });
  const flags = services.flags.getFlagSnapshot();
  const diagnostics = readDiagnostics(services.diagnostics);
  const baseContext = {
    contractVersion: WORKSPACE_CONTRACT_VERSION,
    phase: "live-nvb-authority-read",
    route,
    auth,
    identity: moduleIdentity,
    authority,
    project,
    currentProject: project.currentProject,
    company: crm.company,
    crm,
    handoff: services.handoff.getHandoffSnapshot(),
    visibility,
    timelinePolicy,
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
    authority: context.authority,
    project: context.project,
    currentProject: context.currentProject,
    projectBrowser: context.projectBrowser,
    moduleHydrate: context.moduleHydrate,
    handoffShare: context.handoffShare,
    company: context.company,
    crm: context.crm,
    visibility: context.visibility,
    timelinePolicy: context.timelinePolicy,
    downstream: context.downstream,
    flags: context.flags,
  };
}
