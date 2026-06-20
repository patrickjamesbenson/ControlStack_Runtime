function safeRead(reader, fallback) {
  if (typeof reader !== "function") return fallback;
  try {
    return reader();
  } catch {
    return fallback;
  }
}

export function createDiagnosticsContractAdapter({ services, context, pluginContext }) {
  return {
    pluginId: "diagnostics",
    services,
    context,
    pluginContext,

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
        diagnostics: safeRead(() => services.diagnostics.getSnapshot(), context.diagnostics),
        lifecycle: context.lifecycle,
        pluginContext,
      };
    },
  };
}
