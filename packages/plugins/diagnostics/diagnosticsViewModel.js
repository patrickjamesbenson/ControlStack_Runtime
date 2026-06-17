function stateLabel(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === null || value === undefined) return "none";
  return String(value);
}

function readProjectTitle(project) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function readCompanyName(company) {
  return company?.companyName || "No company loaded";
}

function readWriteEnabled(policy) {
  if (policy?.enabled !== undefined) return policy.enabled;
  if (policy?.writeFlowsEnabled !== undefined) return policy.writeFlowsEnabled;
  return false;
}

export function createDiagnosticsViewModel({ adapter, diagnosticsState }) {
  const snapshots = adapter.readSnapshots();
  const local = diagnosticsState.getSnapshot();
  const project = snapshots.project;
  const currentProject = project.currentProject || {};
  const identity = snapshots.identity;
  const company = snapshots.company || snapshots.crm?.company || {};
  const crm = snapshots.crm || {};
  const flags = snapshots.flags.values || {};
  const writePolicy = crm.writePolicy || company.diagnostics || {};
  const pluginStatus = snapshots.pluginContext?.pluginStatus || {};

  return {
    pluginId: adapter.pluginId,
    local,
    route: {
      moduleId: snapshots.route?.moduleId || "unknown",
      path: snapshots.route?.path || "/workspace",
    },
    shell: {
      phase: snapshots.diagnostics?.phase || snapshots.context?.phase || "unknown",
      contractVersion: snapshots.diagnostics?.contract?.contractVersion || snapshots.context?.contractVersion || "not-declared",
      responsiveRequirement: snapshots.diagnostics?.responsiveRequirement || "desktop-tablet-mobile",
    },
    identity: {
      owner: identity.owner,
      status: identity.status,
      role: identity.role || "anonymous",
      user: identity.currentUser?.name || "Workspace User",
    },
    project: {
      owner: project.owner,
      status: project.status,
      title: readProjectTitle(project),
      projectId: project.metadata?.projectId || currentProject.projectId || "none",
      readiness: project.metadata?.readiness || currentProject.readiness || "not-ready",
      source: project.selection?.source || project.metadata?.source || "unknown",
      selectedAt: project.selection?.selectedAt || project.metadata?.selectedAt || "none",
      client: currentProject.client || "none",
      site: currentProject.site || "none",
      saveStatus: project.save?.status || project.saveState?.status || "deferred",
      restoreStatus: project.restore?.status || project.restoreState?.status || "deferred",
    },
    company: {
      owner: company.owner || "shell",
      status: company.status || "placeholder",
      name: readCompanyName(company),
    },
    crm: {
      owner: crm.owner || "shell",
      status: crm.status || "placeholder",
      hubspotStatus: crm.hubspot?.status || "placeholder",
      writeFlowsEnabled: stateLabel(readWriteEnabled(writePolicy)),
      writeReason: writePolicy.reason || "CRM writes are deferred.",
    },
    handoff: {
      owner: snapshots.handoff.owner,
      status: snapshots.handoff.status,
      available: stateLabel(snapshots.handoff.available),
    },
    visibility: {
      owner: snapshots.visibility.owner,
      status: snapshots.visibility.status,
      knownModules: Object.keys(snapshots.visibility.moduleVisibility || {}).join(", ") || "none",
    },
    flags: {
      owner: snapshots.flags.owner,
      status: snapshots.flags.status,
      engineSurfaceEnabled: stateLabel(flags.engineSurfaceEnabled),
      runTableSurfaceEnabled: stateLabel(flags.runTableSurfaceEnabled),
      payloadSurfaceEnabled: stateLabel(flags.payloadSurfaceEnabled),
    },
    plugin: {
      owner: pluginStatus.owner || "shell",
      optionalPluginsBootCritical: stateLabel(pluginStatus.optionalPluginsBootCritical),
      statuses: pluginStatus.plugins || [],
    },
    constraints: [
      "Current project selection is shell-owned",
      "Diagnostics is optional and post-render only",
      "Plugin failure is isolated to this host",
      "Diagnostics is read-only",
      "Save / restore / handoff remain deferred",
      "Engine / RunTable / payload are out of scope",
      "HubSpot write flows are deferred",
    ],
  };
}
