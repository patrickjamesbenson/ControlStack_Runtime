const MODULE_ID = "cs_selector";

function safeRead(reader, fallback) {
  if (typeof reader !== "function") return fallback;
  try {
    return reader();
  } catch {
    return fallback;
  }
}

export function createSelectorContractAdapter({ services, context }) {
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
        company: safeRead(() => services.crm.getCompanyContext(), context.company),
        crm: safeRead(() => services.crm.getCrmSnapshot(), context.crm),
        handoff: safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility,
        flags: safeRead(() => services.flags.getFlagSnapshot(), context.flags),
        lifecycle: context.lifecycle,
        diagnostics: context.diagnostics,
      };
    },

    canShowSelector() {
      return services.visibility.canShowModule?.(MODULE_ID, context) ?? true;
    },

    isFlagEnabled(flagId) {
      return services.flags.isEnabled?.(flagId) ?? false;
    },

    hasCapability(capabilityId) {
      return services.identity.hasCapability?.(capabilityId) ?? false;
    },
  };
}
