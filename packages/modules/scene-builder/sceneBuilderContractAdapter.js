const MODULE_ID = "scene_builder";

function safeRead(reader, fallback) {
  if (typeof reader !== "function") return fallback;
  try {
    return reader();
  } catch {
    return fallback;
  }
}

export function createSceneBuilderContractAdapter({ services, context }) {
  return {
    moduleId: MODULE_ID,
    services,
    context,

    readSnapshots() {
      const auth = safeRead(() => services.auth.getAuthSnapshot(), context.auth);
      const identity = safeRead(() => services.identity.getIdentitySnapshot(), context.identity);
      const project = safeRead(() => services.project.getProjectSnapshot(), context.project);
      const visibility = safeRead(() => services.visibility.getVisibilitySnapshot({ auth, identity, project }), context.visibility);
      return {
        route: context.route,
        auth,
        identity,
        project,
        currentProject: context.currentProject,
        company: context.company,
        crm: context.crm,
        handoff: safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility,
        downstream: safeRead(() => services.downstream.getDownstreamContextSnapshot({ identity, project, visibility }), context.downstream),
        flags: safeRead(() => services.flags.getFlagSnapshot(), context.flags),
        lifecycle: context.lifecycle,
        diagnostics: context.diagnostics,
      };
    },

    canShowModule() {
      return services.visibility.canShowModule?.(MODULE_ID, context) ?? true;
    },

    getModuleDecision() {
      return services.visibility.getModuleDecision?.(MODULE_ID, context) || context.visibility?.moduleReasons?.[MODULE_ID] || null;
    },

    isFlagEnabled(flagId) {
      return services.flags.isEnabled?.(flagId) ?? false;
    },

    hasCapability(capabilityId) {
      return services.identity.hasCapability?.(capabilityId) ?? false;
    },
  };
}
