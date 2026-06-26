const MODULE_ID = "emergence";

function safeRead(reader, fallback) {
  if (typeof reader !== "function") return fallback;
  try {
    return reader();
  } catch {
    return fallback;
  }
}

export function createEmergenceContractAdapter({ services, context }) {
  return {
    moduleId: MODULE_ID,
    services,
    context,

    readSnapshots() {
      const identity = safeRead(() => services.identity.getIdentitySnapshot(), context.identity);
      const project = safeRead(() => services.project.getProjectSnapshot(), context.project);
      const visibility = safeRead(
        () => services.visibility.getVisibilitySnapshot({ identity, project }),
        context.visibility,
      );
      const downstream = safeRead(
        () => services.downstream.getDownstreamContextSnapshot({ identity, project, visibility }),
        context.downstream,
      );

      return {
        route: context.route,
        identity,
        project,
        company: safeRead(() => services.crm.getCompanyContext(), context.company),
        crm: safeRead(() => services.crm.getCrmSnapshot(), context.crm),
        handoff: safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility,
        downstream,
        flags: safeRead(() => services.flags.getFlagSnapshot(), context.flags),
        lifecycle: context.lifecycle,
        diagnostics: context.diagnostics,
      };
    },

    canShowModule() {
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
