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
      return {
        route: context.route,
        identity: safeRead(() => services.identity.getIdentitySnapshot(), context.identity),
        project: safeRead(() => services.project.getProjectSnapshot(), context.project),
        company: safeRead(() => services.crm.getCompanyContext(), context.company),
        crm: safeRead(() => services.crm.getCrmSnapshot(), context.crm),
        handoff: safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility: safeRead(() => services.visibility.getVisibilitySnapshot(), context.visibility),
        flags: safeRead(() => services.flags.getFlagSnapshot(), context.flags),
        diagnostics: safeRead(() => services.diagnostics.getSnapshot(), context.diagnostics),
        lifecycle: context.lifecycle,
        pluginContext,
      };
    },
  };
}
