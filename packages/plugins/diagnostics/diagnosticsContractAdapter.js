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
      const crm = safeRead(() => services.crm.getCrmSnapshot({ auth, identity, project }), context.crm);
      const company = crm.company || safeRead(() => services.crm.getCompanyContext({ auth, identity, project }), context.company);
      const authority = safeRead(() => services.authority.getAuthoritySnapshot({ auth, identity, crm }), context.authority);
      const visibility = safeRead(() => services.visibility.getVisibilitySnapshot({ auth, identity, authority, project }), context.visibility);
      return {
        route: context.route,
        auth,
        identity,
        authority,
        project,
        company,
        crm,
        handoff: safeRead(() => services.handoff.getHandoffSnapshot(), context.handoff),
        visibility,
        flags: safeRead(() => services.flags.getFlagSnapshot(), context.flags),
        diagnostics: safeRead(() => services.diagnostics.getSnapshot(), context.diagnostics),
        lifecycle: context.lifecycle,
        context,
        pluginContext,
      };
    },
  };
}
