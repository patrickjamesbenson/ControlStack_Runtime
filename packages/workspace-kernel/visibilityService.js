const REGISTERED_MODULES = Object.freeze(["workspace_home", "cs_selector", "emergence", "scene_builder"]);
const PLANNED_MODULES = Object.freeze(["compliance_matters", "egres", "ceiling"]);

const MODULE_POLICIES = Object.freeze({
  workspace_home: Object.freeze({ label: "Workspace home", registered: true, minRole: "external_user", requiresIdentity: false, requiresProject: false }),
  cs_selector: Object.freeze({ label: "CS Selector", registered: true, minRole: "external_user", requiresIdentity: false, requiresProject: false }),
  emergence: Object.freeze({ label: "Emergence", registered: true, minRole: "internal_user", requiresIdentity: true, requiresProject: true }),
  scene_builder: Object.freeze({ label: "Scene Builder", registered: true, minRole: "internal_user", requiresIdentity: true, requiresProject: true }),
  compliance_matters: Object.freeze({ label: "Compliance Matters", registered: false, minRole: "internal_user", requiresIdentity: true, requiresProject: true }),
  egres: Object.freeze({ label: "Emergency / EGRES", registered: false, minRole: "internal_user", requiresIdentity: true, requiresProject: true }),
  ceiling: Object.freeze({ label: "Ceiling / Coordinated Surfaces", registered: false, minRole: "internal_user", requiresIdentity: true, requiresProject: true }),
});

const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);

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

function roleRank(role) {
  const index = ROLE_ORDER.indexOf(role);
  return index < 0 ? 0 : index;
}

function clampRoleToAuthority(requestedRole, authorityRole) {
  const requested = ROLE_ORDER.includes(requestedRole) ? requestedRole : "external_user";
  const actual = ROLE_ORDER.includes(authorityRole) ? authorityRole : "external_user";
  return roleRank(requested) > roleRank(actual) ? actual : requested;
}

function hasIdentity(identity) {
  return ["external_identified", "internal_identified"].includes(identity?.identityState);
}

function hasProject(project, projectMode) {
  if (projectMode === "missing") return false;
  if (projectMode === "present") return true;
  return !!(project?.currentProject?.projectId || project?.selection?.selectedProjectId);
}

function authorityRole(authority, identity) {
  return authority?.actualRole?.value || identity?.actualRole || "external_user";
}

function previewRole(authority, identity) {
  return clampRoleToAuthority(identity?.displayRole || identity?.role || authorityRole(authority, identity), authorityRole(authority, identity));
}

function authorityReason({ moduleId, authority }) {
  if (!authority) return null;
  if (authority.privileges?.blacklist?.active === true) return "hidden_by_authority_blacklist";
  const moduleEntitlement = authority.privileges?.moduleEntitlements?.[moduleId];
  if (moduleEntitlement === false) return "hidden_by_authority_entitlement";
  return null;
}

function resolveReason({ moduleId, policy, identity, project, projectMode, authority }) {
  if (!policy) return "not_registered";
  if (!policy.registered) return "planned_not_live";
  const authorityBlock = authorityReason({ moduleId, authority });
  if (authorityBlock) return authorityBlock;
  if (policy.requiresIdentity && !hasIdentity(identity)) return "needs_identity";
  if (policy.requiresProject && !hasProject(project, projectMode)) return "needs_project";
  if (roleRank(previewRole(authority, identity)) < roleRank(policy.minRole)) return "hidden_for_authority_role";
  return "allowed";
}

function visibleFromReason(reason) {
  return reason === "allowed";
}

function createDecision(moduleId, identity, project, projectMode, authority) {
  const policy = MODULE_POLICIES[moduleId] || null;
  const reason = resolveReason({ moduleId, policy, identity, project, projectMode, authority });
  const visible = visibleFromReason(reason);
  const effectiveRole = previewRole(authority, identity);
  return {
    moduleId,
    label: policy?.label || moduleId,
    registered: policy?.registered === true,
    planned: policy?.registered === false,
    visible,
    moduleVisible: visible,
    canRead: visible,
    canEdit: visible && roleRank(effectiveRole) >= roleRank("internal_user"),
    canExport: visible && roleRank(effectiveRole) >= roleRank("internal_user"),
    canAdmin: visible && roleRank(effectiveRole) >= roleRank("developer"),
    reason,
    requiredIdentity: policy?.requiresIdentity === true,
    requiredProject: policy?.requiresProject === true,
    minRole: policy?.minRole || "external_user",
    authorityRole: authorityRole(authority, identity),
    displayRole: effectiveRole,
    authoritySource: authority?.actualRole?.source || identity?.actualRoleSource || "unknown",
    moduleEntitled: authority?.privileges?.moduleEntitlements?.[moduleId] !== false,
  };
}

function createDecisionMap({ identity, project, projectMode, authority }) {
  const ids = [...REGISTERED_MODULES, ...PLANNED_MODULES];
  return ids.reduce((out, moduleId) => {
    out[moduleId] = createDecision(moduleId, identity, project, projectMode, authority);
    return out;
  }, {});
}

function normaliseProjectMode(mode) {
  return ["auto", "present", "missing"].includes(mode) ? mode : "auto";
}

export function createVisibilityService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const state = {
    owner: "shell",
    status: "policy-ready",
    rule: "Visibility remains shell-owned. Authority supplies final actual role and privilege state; display-role preview controls the current preview view only.",
    projectMode: "auto",
    lastSnapshot: null,
  };

  function snapshot(context = {}) {
    const auth = context.auth || {};
    const identity = context.identity || {};
    const authority = context.authority || null;
    const project = context.project || {};
    const projectMode = normaliseProjectMode(state.projectMode);
    const decisions = createDecisionMap({ identity, project, projectMode, authority });
    const registeredDecisions = REGISTERED_MODULES.map((id) => decisions[id]);
    const plannedDecisions = PLANNED_MODULES.map((id) => decisions[id]);
    const effectiveDisplayRole = previewRole(authority, identity);
    const next = {
      owner: state.owner,
      status: state.status,
      source: "nvb-backed-authority-visibility-policy",
      rule: state.rule,
      testMode: true,
      auth: {
        owner: auth.owner || "shell",
        status: auth.status || "signed-out",
        realAuth: auth.live === true,
        authenticated: auth.session?.authenticated === true,
        provider: auth.session?.provider || null,
        credentialAuth: auth.session?.authenticated === true,
        developerSupportVisible: true,
      },
      authority: {
        owner: authority?.owner || "shell",
        status: authority?.status || "fallback",
        source: authority?.source || "shell-safe-fallback",
        nvbMatched: authority?.nvb?.matched === true,
        confidence: authority?.nvb?.confidence || "none",
        actualRole: authorityRole(authority, identity),
        actualRoleSource: authority?.actualRole?.source || identity?.actualRoleSource || "unknown",
        blacklistActive: authority?.privileges?.blacklist?.active === true,
        restrictions: authority?.privileges?.restrictions || [],
        exceptionalEntitlements: authority?.privileges?.exceptionalEntitlements || [],
        companyContextIsAuthority: false,
      },
      inputs: {
        identityState: identity.identityState || "external_anonymous",
        actualRole: authorityRole(authority, identity),
        identityClassifiedRole: identity.derivedActualRole || identity.actualRole || "external_user",
        actualRoleOverrideEnabled: identity.actualRoleOverrideEnabled === true,
        displayRole: effectiveDisplayRole,
        requestedDisplayRole: identity.displayRole || identity.role || "external_user",
        displayRoleClamped: effectiveDisplayRole !== (identity.displayRole || identity.role || "external_user") || identity.displayRoleClamped === true,
        displayRolePreviewOnly: true,
        classification: identity.classification || "anonymous",
        classifierOnly: authority?.subject?.classifierOnly !== false,
        identitySource: identity.lookup?.identitySource || "unknown",
        developerFixtureActive: identity.lookup?.usingDeveloperFixture === true,
        projectMode,
        projectPresent: hasProject(project, projectMode),
      },
      moduleVisibility: Object.fromEntries(registeredDecisions.map((decision) => [decision.moduleId, decision.visible])),
      moduleReasons: decisions,
      registeredModules: registeredDecisions,
      plannedModules: plannedDecisions,
      visibleModules: registeredDecisions.filter((decision) => decision.visible).map((decision) => decision.moduleId),
      hiddenModules: registeredDecisions.filter((decision) => !decision.visible).map((decision) => decision.moduleId),
      shellFeatureVisibility: {
        topbar: true,
        sidebar: true,
        workspaceHome: true,
        moduleHost: true,
        authCard: true,
        visibilityTestCard: true,
        authorityCard: true,
      },
      roleVisibility: {
        [effectiveDisplayRole]: registeredDecisions
          .filter((decision) => decision.visible)
          .map((decision) => decision.moduleId),
      },
    };
    state.lastSnapshot = next;
    return next;
  }

  function notify(reason, context = {}) {
    const nextSnapshot = snapshot(context);
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("visibility:changed", { reason, visibility: nextSnapshot });
    return nextSnapshot;
  }

  return {
    owner: state.owner,
    status: state.status,
    canShowModule(moduleId, context = {}) {
      const decision = snapshot(context).moduleReasons[moduleId];
      return decision ? decision.visible : false;
    },
    getModuleDecision(moduleId, context = {}) {
      return snapshot(context).moduleReasons[moduleId] || createDecision(moduleId, context.identity || {}, context.project || {}, state.projectMode, context.authority || null);
    },
    canShowShellFeature(featureId, context = {}) {
      return snapshot(context).shellFeatureVisibility[featureId] === true;
    },
    getVisibilitySnapshot(context = {}) {
      return snapshot(context);
    },
    setProjectMode(projectMode, context = {}, reason = "nvb-authority-project-visibility-mode") {
      state.projectMode = normaliseProjectMode(projectMode);
      return notify(reason, context);
    },
    getProjectMode() {
      return state.projectMode;
    },
    subscribe: subscriptions.subscribe,
  };
}
