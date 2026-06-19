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

function readDownstream(adapter, snapshots) {
  return adapter.services.downstream?.getDownstreamContextSnapshot?.({
    identity: snapshots.identity,
    project: snapshots.project,
    visibility: snapshots.visibility,
  }) || {
    owner: "shell",
    status: "unavailable",
    selector: { readiness: {} },
    consumers: {},
    constraints: {},
  };
}

function readProjectBrowser(adapter, snapshots, downstream) {
  return adapter.services.projectBrowser?.getProjectBrowserSnapshot?.({
    identity: snapshots.identity,
    project: snapshots.project,
    visibility: snapshots.visibility,
    downstream,
    flags: snapshots.flags,
    contractVersion: snapshots.context?.contractVersion,
  }) || snapshots.context?.projectBrowser || {
    owner: "shell",
    status: "unavailable",
    readOnly: true,
    projects: [],
    projectCount: 0,
    capabilities: {},
    currentProject: {},
    deferred: {},
    save: {},
  };
}

function consumerRows(consumers = {}) {
  return Object.entries(consumers).map(([id, consumer]) => ({
    id,
    label: consumer.label,
    status: consumer.status,
    registered: consumer.registered,
    receives: consumer.receives || [],
  }));
}

function decisionFor(visibility, moduleId) {
  return visibility.moduleReasons?.[moduleId] || { visible: false, reason: "not_registered" };
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
  const registeredModules = snapshots.pluginContext?.registeredModules || [];
  const visibility = snapshots.visibility || {};
  const downstream = readDownstream(adapter, snapshots);
  const projectBrowser = readProjectBrowser(adapter, snapshots, downstream);
  const selector = downstream.selector || {};
  const sceneDecision = decisionFor(visibility, "scene_builder");
  const save = projectBrowser.save || {};

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
      registeredModules: registeredModules.join(", ") || "none",
    },
    sceneBuilder: {
      structuralRegistered: stateLabel(registeredModules.includes("scene_builder")),
      routeStatus: registeredModules.includes("scene_builder") ? "structural-module" : "not-registered",
      visible: stateLabel(sceneDecision.visible),
      reason: sceneDecision.reason,
      featureRestoration: "not-restored",
      readsDownstreamContext: "yes",
    },
    identity: {
      owner: identity.owner,
      status: identity.status,
      source: identity.source || "phase-8a-shell-owned-identity-resolver",
      state: identity.identityState || "external_anonymous",
      classification: identity.classification || "anonymous",
      derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
      actualRole: identity.actualRole || "external_user",
      actualRoleSource: identity.actualRoleSource || "unknown",
      actualRoleDerived: stateLabel(identity.actualRoleDerived),
      actualRoleOverrideEnabled: stateLabel(identity.actualRoleOverrideEnabled),
      actualRoleOverride: identity.actualRoleOverride || "none",
      displayRole: identity.displayRole || identity.role || "external_user",
      displayRoleRequested: identity.displayRoleRequested || identity.displayRole || "external_user",
      displayRoleClamped: stateLabel(identity.displayRoleClamped),
      user: identity.currentUser?.name || "Workspace User",
      email: identity.currentUser?.email || "No email loaded",
      realAuth: stateLabel(identity.auth?.realAuth),
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
    projectBrowser: {
      owner: projectBrowser.owner,
      status: projectBrowser.status,
      readOnly: stateLabel(projectBrowser.readOnly),
      nonBootCritical: stateLabel(projectBrowser.nonBootCritical),
      currentProject: projectBrowser.currentProject?.title || "No project loaded",
      currentProjectId: projectBrowser.currentProject?.projectId || "none",
      savedCount: projectBrowser.savedCount || 0,
      fixtureCount: projectBrowser.fixtureCount || 0,
      totalCount: projectBrowser.projectCount || 0,
      safeEmpty: stateLabel(projectBrowser.safeEmpty),
      save: projectBrowser.capabilities?.save ? "live" : "deferred",
      restore: projectBrowser.capabilities?.restore ? "live" : "deferred",
      hydrate: projectBrowser.capabilities?.hydrate ? "live" : "deferred",
      handoff: projectBrowser.capabilities?.handoff ? "live" : "deferred",
      share: projectBrowser.capabilities?.share ? "live" : "deferred",
      projects: (projectBrowser.projects || []).map((item) => `${item.readOnly ? "fixture" : "runtime"}:${item.projectId}:${item.title}:${item.lifecycleStatus}`),
    },
    saveEnvelope: {
      owner: save.owner || "shell",
      status: save.status || "ready",
      live: stateLabel(save.live),
      source: save.source || "p2-shell-save-envelope",
      lastSavedEnvelopeId: save.lastSavedEnvelopeId || "none",
      lastSavedProjectId: save.lastSavedProjectId || "none",
      lastSavedAt: save.lastSavedAt || "none",
      lastError: save.lastError || "none",
      updateExistingEnvelope: stateLabel(save.capabilities?.updateExistingEnvelope),
      restoreLive: "no",
      hydrateLive: "no",
      handoffLive: "no",
      shareLive: "no",
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
      owner: visibility.owner,
      status: visibility.status,
      source: visibility.source || "phase-8-shell-owned-visibility-policy",
      testMode: stateLabel(visibility.testMode),
      rule: visibility.rule || "none",
      projectMode: visibility.inputs?.projectMode || "auto",
      projectPresent: stateLabel(visibility.inputs?.projectPresent),
      visibleModules: visibility.visibleModules?.join(", ") || "none",
      hiddenModules: visibility.hiddenModules?.join(", ") || "none",
      registeredModules: visibility.registeredModules || [],
      plannedModules: visibility.plannedModules || [],
    },
    downstream: {
      owner: downstream.owner,
      status: downstream.status,
      source: downstream.source,
      selectorStatus: selector.status || "foundation-placeholder",
      runRefs: selector.runRefs?.length || 0,
      areaRefs: selector.areaRefs?.length || 0,
      fittingRefs: selector.fittingRefs?.length || 0,
      optionRefs: selector.optionRefs?.length || 0,
      emergencyCandidates: selector.emergencyCandidates?.length || 0,
      sceneBuilderCandidates: selector.sceneBuilderCandidates?.length || 0,
      complianceCandidates: selector.complianceCandidates?.length || 0,
      ceilingCandidates: selector.ceilingCandidates?.length || 0,
      sceneBuilderReadiness: selector.readiness?.sceneBuilder || "contract-only",
      egresReadiness: selector.readiness?.egres || "contract-only",
      complianceReadiness: selector.readiness?.compliance || "blocked-until-egres-package",
      ceilingReadiness: selector.readiness?.ceiling || "contract-only",
      consumerRows: consumerRows(downstream.consumers),
      constraints: downstream.constraints || {},
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
      "Save envelope is shell-owned and live",
      "Project Browser remains shell-owned",
      "Runtime-saved envelopes are visually distinct from fixture browser items",
      "Restore / hydrate is not live",
      "Handoff / share is not live",
      "Scene Builder remains structural only",
      "EGRES route is not registered",
      "Compliance Matters route is not registered",
      "Ceiling route is not registered",
      "Engine / RunTable / payload are out of scope",
      "Diagnostics is read-only",
      "HubSpot write flows are deferred",
    ],
  };
}
