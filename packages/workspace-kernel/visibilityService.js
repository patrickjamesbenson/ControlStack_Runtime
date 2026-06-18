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

function hasIdentity(identity) {
  return ["external_identified", "internal_identified"].includes(identity?.identityState);
}

function hasProject(project, projectMode) {
  if (projectMode === "missing") return false;
  if (projectMode === "present") return true;
  return !!(project?.currentProject?.projectId || project?.selection?.selectedProjectId);
}

function resolveReason({ policy, identity, project, projectMode }) {
  if (!policy) return "not_registered";
  if (!policy.registered) return "planned_not_live";
  if (policy.requiresIdentity && !hasIdentity(identity)) return "needs_identity";
  if (policy.requiresProject && !hasProject(project, projectMode)) return "needs_project";
  if (roleRank(identity?.displayRole || "external_user") < roleRank(policy.minRole)) return "hidden_for_display_role";
  return "allowed";
}

function visibleFromReason(reason) {
  return reason === "allowed";
}

function createDecision(moduleId, identity, project, projectMode) {
  const policy = MODULE_POLICIES[moduleId] || null;
  const reason = resolveReason({ policy, identity, project, projectMode });
  return {
    moduleId,
    label: policy?.label || moduleId,
    registered: policy?.registered === true,
    planned: policy?.registered === false,
    visible: visibleFromReason(reason),
    moduleVisible: visibleFromReason(reason),
    canRead: visibleFromReason(reason),
    canEdit: visibleFromReason(reason) && roleRank(identity?.displayRole || "external_user") >= roleRank("internal_user"),
    canExport: visibleFromReason(reason) && roleRank(identity?.displayRole || "external_user") >= roleRank("internal_user"),
    canAdmin: visibleFromReason(reason) && roleRank(identity?.displayRole || "external_user") >= roleRank("developer"),
    reason,
    requiredIdentity: policy?.requiresIdentity === true,
    requiredProject: policy?.requiresProject === true,
    minRole: policy?.minRole || "external_user",
  };
}

function createDecisionMap({ identity, project, projectMode }) {
  const ids = [...REGISTERED_MODULES, ...PLANNED_MODULES];
  return ids.reduce((out, moduleId) => {
    out[moduleId] = createDecision(moduleId, identity, project, projectMode);
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
    rule: "Scene Builder structural module is registered as a shell-owned visibility consumer. EGRES, Compliance Matters, and Ceiling remain planned only.",
    projectMode: "auto",
    lastSnapshot: null,
  };

  function snapshot(context = {}) {
    const identity = context.identity || {};
    const project = context.project || {};
    const projectMode = normaliseProjectMode(state.projectMode);
    const decisions = createDecisionMap({ identity, project, projectMode });
    const registeredDecisions = REGISTERED_MODULES.map((id) => decisions[id]);
    const plannedDecisions = PLANNED_MODULES.map((id) => decisions[id]);
    const next = {
      owner: state.owner,
      status: state.status,
      source: "scene-builder-structural-module-visibility-policy",
      rule: state.rule,
      testMode: true,
      auth: {
        realAuth: false,
        credentialAuth: false,
      },
      inputs: {
        identityState: identity.identityState || "external_anonymous",
        actualRole: identity.actualRole || "external_user",
        derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
        actualRoleOverrideEnabled: identity.actualRoleOverrideEnabled === true,
        displayRole: identity.displayRole || identity.role || "external_user",
        displayRoleClamped: identity.displayRoleClamped === true,
        classification: identity.classification || "anonymous",
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
        visibilityTestCard: true,
      },
      roleVisibility: {
        [identity.displayRole || identity.role || "external_user"]: registeredDecisions
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
      return snapshot(context).moduleReasons[moduleId] || createDecision(moduleId, context.identity || {}, context.project || {}, state.projectMode);
    },
    canShowShellFeature(featureId, context = {}) {
      return snapshot(context).shellFeatureVisibility[featureId] === true;
    },
    getVisibilitySnapshot(context = {}) {
      return snapshot(context);
    },
    setProjectMode(projectMode, context = {}, reason = "scene-builder-structural-project-visibility-mode") {
      state.projectMode = normaliseProjectMode(projectMode);
      return notify(reason, context);
    },
    getProjectMode() {
      return state.projectMode;
    },
    subscribe: subscriptions.subscribe,
  };
}
