const MODULE_ID = "knowledge_base";

function safeRead(reader, fallback) {
  if (typeof reader !== "function") return fallback;
  try {
    return reader();
  } catch {
    return fallback;
  }
}

export function createKnowledgeBaseContractAdapter({ services = {}, context = {} } = {}) {
  return {
    moduleId: MODULE_ID,
    services,
    context,

    readSnapshots() {
      const auth = safeRead(() => services.auth.getAuthSnapshot(), context.auth);
      const identity = safeRead(() => services.identity.getIdentitySnapshot(), context.identity);
      const project = safeRead(() => services.project.getProjectSnapshot(), context.project);
      const visibility = safeRead(() => services.visibility.getVisibilitySnapshot({ auth, identity, project }), context.visibility);
      const downstream = safeRead(
        () => services.downstream.getDownstreamContextSnapshot({ identity, project, visibility }),
        context.downstream,
      );

      return {
        route: context.route,
        auth,
        identity,
        project,
        company: context.company,
        crm: context.crm,
        visibility,
        downstream,
        flags: safeRead(() => services.flags.getFlagSnapshot(), context.flags),
        diagnostics: context.diagnostics,
        lifecycle: context.lifecycle,
      };
    },

    getModuleDecision() {
      return services.visibility?.getModuleDecision?.(MODULE_ID, context) || context.visibility?.moduleReasons?.[MODULE_ID] || null;
    },

    isFlagEnabled(flagId) {
      return services.flags?.isEnabled?.(flagId) ?? false;
    },
  };
}
