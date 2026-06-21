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
  return company?.companyName || "No company linked";
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
    auth: snapshots.auth,
    identity: snapshots.identity,
    authority: snapshots.authority,
    project: snapshots.project,
    company: snapshots.company,
    crm: snapshots.crm,
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
    restore: {},
    hydrate: {},
    handoffShare: {},
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

function emptyAuthority() {
  return {
    owner: "shell",
    status: "fallback",
    source: "shell-safe-fallback",
    nvb: { matched: false, checked: false, confidence: "none", source: "none", recordId: null, reason: "Authority unavailable." },
    subject: { classifierOnly: true, internalClassifier: false, identityClassification: "anonymous", email: null },
    actualRole: { value: "external_user", source: "safe-fallback", derivedFromNvb: false, fallbackApplied: true },
    privileges: { specialVisibility: [], exceptionalEntitlements: [], restrictions: [], blacklist: { active: false, reason: null, source: "none" }, moduleEntitlements: {} },
    companyAuthority: { status: "not-authority" },
    developerSupport: { overrideActive: false, overrideLabel: "Developer/test only. Not NVB authority." },
    writePolicy: { enabled: false, reason: "Authority resolution is read-only." },
  };
}

export function createDiagnosticsViewModel({ adapter, diagnosticsState }) {
  const snapshots = adapter.readSnapshots();
  const local = diagnosticsState.getSnapshot();
  const auth = snapshots.auth || snapshots.context?.auth || { status: "signed-out", session: {}, user: {}, capabilities: {} };
  const project = snapshots.project;
  const currentProject = project.currentProject || {};
  const identity = snapshots.identity;
  const company = snapshots.company || snapshots.crm?.company || {};
  const crm = snapshots.crm || {};
  const authority = adapter.services.authority?.getAuthoritySnapshot?.({ auth, identity, crm }) || snapshots.context?.authority || snapshots.authority || emptyAuthority();
  snapshots.authority = authority;
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
  const restore = projectBrowser.restore || {};
  const hydrate = projectBrowser.hydrate || {};
  const handoffShare = projectBrowser.handoffShare || {};
  const moduleResults = hydrate.moduleResults || {};
  const packageSummary = handoffShare.packageSummary || {};

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
    auth: {
      owner: auth.owner || "shell",
      status: auth.status || "signed-out",
      live: stateLabel(auth.live),
      source: auth.source || "real-login-auth",
      authenticated: stateLabel(auth.session?.authenticated),
      sessionId: auth.session?.sessionId || "none",
      userId: auth.session?.userId || "none",
      name: auth.session?.name || auth.user?.name || "Anonymous visitor",
      email: auth.session?.email || auth.user?.email || "none",
      provider: auth.session?.provider || "none",
      authSource: auth.user?.authSource || "fallback",
      signIn: stateLabel(auth.capabilities?.signIn),
      signOut: stateLabel(auth.capabilities?.signOut),
      restoreSession: stateLabel(auth.capabilities?.restoreSession),
      oauthProvider: auth.exclusions?.oauthProvider || "deferred",
      passwordStorage: auth.exclusions?.passwordStorage || "excluded",
      mfa: auth.exclusions?.mfa || "deferred",
    },
    authority: {
      owner: authority.owner || "shell",
      status: authority.status || "fallback",
      source: authority.source || "shell-safe-fallback",
      readOnly: stateLabel(authority.readOnly),
      actualRole: authority.actualRole?.value || "external_user",
      nominalRole: authority.actualRole?.nominalValue || authority.actualRole?.value || "external_user",
      actualRoleSource: authority.actualRole?.source || "safe-fallback",
      derivedFromNvb: stateLabel(authority.actualRole?.derivedFromNvb),
      fallbackApplied: stateLabel(authority.actualRole?.fallbackApplied),
      fallbackReason: authority.actualRole?.fallbackReason || "none",
      nvbAvailable: stateLabel(authority.nvb?.available),
      nvbChecked: stateLabel(authority.nvb?.checked),
      nvbMatched: stateLabel(authority.nvb?.matched),
      nvbSource: authority.nvb?.source || "none",
      nvbRecordId: authority.nvb?.recordId || "none",
      nvbConfidence: authority.nvb?.confidence || "none",
      nvbReason: authority.nvb?.reason || "none",
      subjectEmail: authority.subject?.email || "none",
      subjectClassification: authority.subject?.identityClassification || "anonymous",
      identitySource: authority.subject?.identitySource || "unknown",
      internalClassifier: stateLabel(authority.subject?.internalClassifier),
      classifierOnly: stateLabel(authority.subject?.classifierOnly),
      specialVisibility: (authority.privileges?.specialVisibility || []).join(", ") || "none",
      capabilities: (authority.privileges?.capabilities || []).join(", ") || "none",
      exceptionalEntitlements: (authority.privileges?.exceptionalEntitlements || []).join(", ") || "none",
      restrictions: (authority.privileges?.restrictions || []).join(", ") || "none",
      blacklistActive: stateLabel(authority.privileges?.blacklist?.active),
      blacklistReason: authority.privileges?.blacklist?.reason || "none",
      blacklistSource: authority.privileges?.blacklist?.source || "none",
      companyAuthority: authority.companyAuthority?.status || "not-authority",
      companyAuthorityNote: authority.companyAuthority?.note || "HubSpot/company context is CRM enrichment only.",
      developerOverride: stateLabel(authority.developerSupport?.overrideActive),
      developerOverrideLabel: authority.developerSupport?.overrideLabel || "Developer/test only. Not NVB authority.",
      writeEnabled: stateLabel(authority.writePolicy?.enabled),
      writeReason: authority.writePolicy?.reason || "Authority writes are disabled.",
    },
    company: {
      owner: company.owner || "shell",
      status: company.status || "no-company",
      source: company.source || "fallback",
      id: company.companyId || "none",
      name: readCompanyName(company),
      domain: company.domain || "none",
      website: company.website || "none",
      lifecycleStage: company.lifecycleStage || "none",
      linkedProjectId: company.linkedProjectId || "none",
      linkedAt: company.linkedAt || "none",
      ownerName: company.ownerName || "none",
      writeEnabled: stateLabel(company.writeEnabled),
      diagnosticsReason: company.diagnostics?.reason || "No company diagnostics reason available.",
    },
    crm: {
      owner: crm.owner || "shell",
      status: crm.status || "no-company",
      source: crm.source || "hubspot-company-context-read-safe",
      readOnly: stateLabel(crm.readOnly),
      selectedCompanyId: crm.selectedCompanyId || "none",
      projectFallback: stateLabel(crm.useProjectLinkedFallback),
      hubspotStatus: crm.hubspot?.status || "read-safe-deferred-writes",
      hubspotAvailable: stateLabel(crm.hubspot?.available),
      writeFlowsEnabled: stateLabel(readWriteEnabled(writePolicy)),
      writeReason: writePolicy.reason || "CRM writes are deferred.",
      contactStatus: crm.contact?.status || "empty",
      contactEmail: crm.contact?.email || "none",
      dealStatus: crm.deal?.status || "deferred",
      availableCompanies: (crm.availableCompanies || []).map((item) => `${item.companyId}:${item.companyName}`),
      capabilities: crm.capabilities || {},
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
      source: identity.source || "real-login-auth-identity-resolver",
      state: identity.identityState || "external_anonymous",
      classification: identity.classification || "anonymous",
      identitySource: identity.lookup?.identitySource || "unknown",
      developerFixture: stateLabel(identity.lookup?.usingDeveloperFixture),
      derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
      identityActualRole: identity.actualRole || "external_user",
      authorityActualRole: authority.actualRole?.value || "external_user",
      actualRoleSource: authority.actualRole?.source || identity.actualRoleSource || "safe-fallback",
      actualRoleDerived: stateLabel(authority.actualRole?.derivedFromNvb || authority.actualRole?.fallbackApplied),
      actualRoleOverrideEnabled: stateLabel(identity.actualRoleOverrideEnabled),
      actualRoleOverride: identity.actualRoleOverride || "none",
      displayRole: visibility.inputs?.displayRole || identity.displayRole || identity.role || "external_user",
      displayRoleRequested: identity.displayRoleRequested || identity.displayRole || "external_user",
      displayRoleClamped: stateLabel(visibility.inputs?.displayRoleClamped || identity.displayRoleClamped),
      displayRolePreviewOnly: "yes",
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
      restoredFromEnvelope: stateLabel(project.metadata?.restoredFromEnvelope),
      restoredEnvelopeId: project.metadata?.restoredEnvelopeId || "none",
      restoredAt: project.metadata?.restoredAt || "none",
      selectedAt: project.selection?.selectedAt || project.metadata?.selectedAt || "none",
      client: currentProject.client || "none",
      site: currentProject.site || "none",
      companyName: company.companyName || "No company linked",
      companySource: company.source || "fallback",
      authorityRole: authority.actualRole?.value || "external_user",
      authoritySource: authority.actualRole?.source || "safe-fallback",
      saveStatus: project.save?.status || project.saveState?.status || "deferred",
      restoreStatus: project.restore?.status || project.restoreState?.status || "deferred",
      hydrateStatus: project.hydrate?.status || "idle",
      handoffStatus: project.handoff?.status || "ready",
      lastPackageId: project.handoff?.lastPreparedPackageId || "none",
    },
    projectBrowser: {
      owner: projectBrowser.owner,
      status: projectBrowser.status,
      readOnly: stateLabel(projectBrowser.readOnly),
      nonBootCritical: stateLabel(projectBrowser.nonBootCritical),
      currentProject: projectBrowser.currentProject?.title || "No project loaded",
      currentProjectId: projectBrowser.currentProject?.projectId || "none",
      selectedProjectId: projectBrowser.selectedProjectId || "none",
      savedCount: projectBrowser.savedCount || 0,
      fixtureCount: projectBrowser.fixtureCount || 0,
      totalCount: projectBrowser.projectCount || 0,
      safeEmpty: stateLabel(projectBrowser.safeEmpty),
      save: projectBrowser.capabilities?.save ? "live" : "deferred",
      restore: projectBrowser.capabilities?.restore ? "live" : "deferred",
      hydrate: projectBrowser.capabilities?.hydrate ? "live" : "deferred",
      handoff: projectBrowser.capabilities?.handoff ? "package-live" : "deferred",
      share: projectBrowser.capabilities?.share ? "package-live" : "deferred",
      projects: (projectBrowser.projects || []).map((item) => `${item.readOnly ? "fixture" : "runtime"}:${item.projectId}:${item.title}:restore-${item.restoreEligible ? "enabled" : "disabled"}`),
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
      restoreLive: stateLabel(save.capabilities?.restore),
      hydrateLive: stateLabel(save.capabilities?.hydrate),
      handoffShareLive: stateLabel(save.capabilities?.handoff || save.capabilities?.share),
      externalDeliveryLive: "no",
      emailSendLive: "no",
      hubspotWriteLive: "no",
    },
    restoreHydrate: {
      restoreOwner: restore.owner || "shell",
      restoreStatus: restore.status || "ready",
      restoreLive: stateLabel(restore.live),
      restoreSource: restore.source || "p3-shell-restore-hydrate",
      lastRestoredEnvelopeId: restore.lastRestoredEnvelopeId || "none",
      lastRestoredProjectId: restore.lastRestoredProjectId || "none",
      lastRestoredAt: restore.lastRestoredAt || "none",
      lastError: restore.lastError || "none",
      validation: restore.validation || "not-run",
      hydrateOwner: hydrate.owner || "shell",
      hydrateStatus: hydrate.status || "idle",
      hydrateLive: stateLabel(hydrate.live),
      lastHydratedEnvelopeId: hydrate.lastHydratedEnvelopeId || "none",
      lastHydratedModules: (hydrate.lastHydratedModules || []).join(", ") || "none",
      ownershipUnchanged: "yes",
      moduleResults: Object.values(moduleResults).map((result) => `${result.moduleId}:${result.status}:${result.reason}`),
    },
    handoffShare: {
      owner: handoffShare.owner || "shell",
      status: handoffShare.status || "ready",
      live: stateLabel(handoffShare.live),
      source: handoffShare.source || "p4-shell-handoff-share",
      packagePreparationOnly: stateLabel(handoffShare.packagePreparationOnly),
      lastPreparedPackageId: handoffShare.lastPreparedPackageId || "none",
      lastPreparedEnvelopeId: handoffShare.lastPreparedEnvelopeId || "none",
      lastPreparedProjectId: handoffShare.lastPreparedProjectId || "none",
      lastPreparedAt: handoffShare.lastPreparedAt || "none",
      lastError: handoffShare.lastError || "none",
      packageSummary: packageSummary.packageId ? `${packageSummary.packageId}:${packageSummary.status}:${packageSummary.projectId}` : "none",
      moduleSummaries: (packageSummary.modules || []).join(", ") || "none",
      externalDeliveryLive: "no",
      emailSendLive: "no",
      hubspotWriteLive: "no",
    },
    handoff: {
      owner: snapshots.handoff.owner,
      status: snapshots.handoff.status,
      available: stateLabel(snapshots.handoff.available),
      packagePreparationOnly: stateLabel(snapshots.handoff.packagePreparationOnly),
      externalDelivery: stateLabel(snapshots.handoff.externalDelivery),
      emailSend: stateLabel(snapshots.handoff.emailSend),
      hubspotWrite: stateLabel(snapshots.handoff.hubspotWrite),
    },
    visibility: {
      owner: visibility.owner,
      status: visibility.status,
      source: visibility.source || "nvb-backed-authority-visibility-policy",
      testMode: stateLabel(visibility.testMode),
      rule: visibility.rule || "none",
      projectMode: visibility.inputs?.projectMode || "auto",
      projectPresent: stateLabel(visibility.inputs?.projectPresent),
      authenticated: stateLabel(visibility.auth?.authenticated),
      authorityStatus: visibility.authority?.status || authority.status || "fallback",
      authoritySource: visibility.authority?.source || authority.source || "shell-safe-fallback",
      authorityRole: visibility.authority?.actualRole || authority.actualRole?.value || "external_user",
      authorityConfidence: visibility.authority?.confidence || authority.nvb?.confidence || "none",
      blacklistActive: stateLabel(visibility.authority?.blacklistActive || authority.privileges?.blacklist?.active),
      restrictions: (visibility.authority?.restrictions || authority.privileges?.restrictions || []).join(", ") || "none",
      exceptionalEntitlements: (visibility.authority?.exceptionalEntitlements || authority.privileges?.exceptionalEntitlements || []).join(", ") || "none",
      displayRolePreviewOnly: stateLabel(visibility.inputs?.displayRolePreviewOnly),
      developerFixtureActive: stateLabel(visibility.inputs?.developerFixtureActive),
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
      "Authority is shell-owned and read-only",
      "Internal email/domain is classifier-only, not final authority",
      "NVB-backed authority resolves actual role when a read-only record is available",
      "Conservative shell fallback applies when NVB is unavailable or unmatched",
      "Blacklist, restrictions, and exceptional entitlements are represented clearly",
      "Developer/test override remains separate from NVB authority",
      "Display-role preview remains preview-only and clamped to authority",
      "HubSpot/company context is CRM enrichment only, not visibility authority",
      "Modules consume authority/company/visibility through shell context/services only",
      "NVB writes, privilege editing, and blacklist editing are excluded",
      "Project selection/save/restore/hydrate/handoff-share flows remain intact",
      "Scene Builder remains structural only",
      "EGRES route is not registered",
      "Compliance Matters route is not registered",
      "Ceiling route is not registered",
      "Engine / RunTable / payload are out of scope",
      "Diagnostics is read-only",
    ],
  };
}
