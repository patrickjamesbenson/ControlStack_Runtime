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
      const auth = context.auth || safeRead(() => services.auth.getAuthSnapshot(), context.auth);
      const identity = context.identity || safeRead(() => services.identity.getIdentitySnapshot(), context.identity);
      const project = context.project || safeRead(() => services.project.getProjectSnapshot(), context.project);
      const crm = context.crm || safeRead(() => services.crm.getCrmSnapshot({ auth, identity, project }), context.crm);
      const authority = context.authority || safeRead(() => services.authority.getAuthoritySnapshot({ auth, identity, crm }), context.authority);
      const visibility = context.visibility || safeRead(() => services.visibility.getVisibilitySnapshot({ auth, identity, authority, project }), context.visibility);
      const timelinePolicy = context.timelinePolicy || safeRead(() => services.timelinePolicy.getTimelinePolicySnapshot({ auth, identity, authority, visibility, project }), context.timelinePolicy);
      return {
        route: context.route,
        auth,
        identity,
        authority,
        project,
        company: context.company || safeRead(() => services.crm.getCompanyContext({ auth, identity, project }), context.company),
        crm,
        handoff: context.handoff || safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility,
        timelinePolicy,
        flags: context.flags || safeRead(() => services.flags.getFlagSnapshot(), context.flags),
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
