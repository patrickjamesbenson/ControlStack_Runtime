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
      return {
        route: context.route,
        identity: safeRead(() => services.identity.getIdentitySnapshot(), context.identity),
        project: safeRead(() => services.project.getProjectSnapshot(), context.project),
        company: safeRead(() => services.crm.getCompanyContext(), context.company),
        crm: safeRead(() => services.crm.getCrmSnapshot(), context.crm),
        handoff: safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility: safeRead(() => services.visibility.getVisibilitySnapshot(), context.visibility),
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
