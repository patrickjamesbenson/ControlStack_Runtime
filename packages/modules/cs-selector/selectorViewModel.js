function stateLabel(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === null || value === undefined) return "none";
  return String(value);
}

function readProjectTitle(project) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function readUserName(identity) {
  return identity.currentUser?.name || "Workspace User";
}

function readUserEmail(identity) {
  return identity.currentUser?.email || "No email loaded";
}

function readCompanyName(company) {
  return company?.companyName || "No company loaded";
}

function readWriteEnabled(policy) {
  if (policy.enabled !== undefined) return policy.enabled;
  if (policy.writeFlowsEnabled !== undefined) return policy.writeFlowsEnabled;
  return false;
}

function decisionFor(visibility, moduleId) {
  return visibility.moduleReasons?.[moduleId] || { visible: false, reason: "not_registered" };
}

function readDownstream(adapter, snapshots) {
  return adapter.services.downstream?.getDownstreamContextSnapshot?.({
    identity: snapshots.identity,
    project: snapshots.project,
    visibility: snapshots.visibility,
  }) || {
    owner: "shell",
    status: "unavailable",
    selector: { readiness: {}, runRefs: [], areaRefs: [], fittingRefs: [], emergencyCandidates: [] },
    consumers: {},
    constraints: {},
  };
}

function consumerSummary(consumers = {}) {
  return Object.entries(consumers).map(([id, consumer]) => `${id}:${consumer.status}`).join(", ") || "none";
}

export function createSelectorViewModel({ adapter, selectorState }) {
  const snapshots = adapter.readSnapshots();
  const local = selectorState.getSnapshot();
  const flags = snapshots.flags.values || {};
  const project = snapshots.project;
  const currentProject = project.currentProject || {};
  const handoff = snapshots.handoff;
  const identity = snapshots.identity;
  const company = snapshots.company || snapshots.crm?.company || {};
  const crm = snapshots.crm || {};
  const crmWritePolicy = crm.writePolicy || company.diagnostics || {};
  const selectorDecision = decisionFor(snapshots.visibility, "cs_selector");
  const downstream = readDownstream(adapter, snapshots);
  const selectorDownstream = downstream.selector || {};

  return {
    moduleId: adapter.moduleId,
    phase: snapshots.diagnostics?.phase || "selector-fed-downstream-context-foundation",
    route: snapshots.route,
    local,
    identity: {
      owner: identity.owner,
      status: identity.status,
      source: identity.source || "phase-8a-shell-owned-identity-resolver",
      name: readUserName(identity),
      email: readUserEmail(identity),
      identityState: identity.identityState || "external_anonymous",
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
      capabilities: identity.capabilities || [],
      canViewSelector: stateLabel(adapter.hasCapability("module:cs_selector:view")),
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
      dirty: stateLabel(project.dirty || local.localDirty),
      metadataSource: project.metadata?.source || "unknown",
      saveStatus: project.save?.status || project.saveState?.status || "deferred",
      restoreStatus: project.restore?.status || project.restoreState?.status || "deferred",
    },
    company: {
      owner: company.owner || "shell",
      status: company.status || "placeholder",
      source: company.source || "phase-4-placeholder",
      companyName: readCompanyName(company),
      companyId: company.companyId || "none",
      website: company.website || "none",
      lifecycleStage: company.lifecycleStage || "none",
      ownerName: company.ownerName || "none",
      associatedDealId: company.associatedDealId || "none",
      associatedContactId: company.associatedContactId || "none",
    },
    crm: {
      owner: crm.owner || "shell",
      status: crm.status || "placeholder",
      source: crm.source || "phase-4-placeholder",
      writeFlowsEnabled: stateLabel(readWriteEnabled(crmWritePolicy)),
      writeReason: crmWritePolicy.reason || "CRM write flows are deferred.",
      hubspotStatus: crm.hubspot?.status || "placeholder",
      hubspotAvailable: stateLabel(crm.hubspot?.available),
    },
    handoff: {
      owner: handoff.owner,
      status: handoff.status,
      available: stateLabel(handoff.available),
    },
    visibility: {
      owner: snapshots.visibility.owner,
      status: snapshots.visibility.status,
      testMode: stateLabel(snapshots.visibility.testMode),
      selectorVisible: stateLabel(selectorDecision.visible),
      selectorReason: selectorDecision.reason,
      projectMode: snapshots.visibility.inputs?.projectMode || "auto",
      projectPresent: stateLabel(snapshots.visibility.inputs?.projectPresent),
      visibleModules: snapshots.visibility.visibleModules?.join(", ") || "none",
      hiddenModules: snapshots.visibility.hiddenModules?.join(", ") || "none",
      rule: snapshots.visibility.rule,
    },
    downstream: {
      owner: downstream.owner,
      status: downstream.status,
      source: downstream.source,
      selectorStatus: selectorDownstream.status || "foundation-placeholder",
      selectorSource: selectorDownstream.source || "selector-fed-downstream-context-foundation",
      runRefs: selectorDownstream.runRefs?.length || 0,
      areaRefs: selectorDownstream.areaRefs?.length || 0,
      fittingRefs: selectorDownstream.fittingRefs?.length || 0,
      optionRefs: selectorDownstream.optionRefs?.length || 0,
      emergencyCandidates: selectorDownstream.emergencyCandidates?.length || 0,
      sceneBuilderCandidates: selectorDownstream.sceneBuilderCandidates?.length || 0,
      complianceCandidates: selectorDownstream.complianceCandidates?.length || 0,
      ceilingCandidates: selectorDownstream.ceilingCandidates?.length || 0,
      sceneBuilderReadiness: selectorDownstream.readiness?.sceneBuilder || "contract-only",
      egresReadiness: selectorDownstream.readiness?.egres || "contract-only",
      complianceReadiness: selectorDownstream.readiness?.compliance || "blocked-until-egres-package",
      ceilingReadiness: selectorDownstream.readiness?.ceiling || "contract-only",
      consumers: consumerSummary(downstream.consumers),
      constraints: downstream.constraints || {},
    },
    flags: {
      owner: snapshots.flags.owner,
      featureMigrationEnabled: stateLabel(adapter.isFlagEnabled("featureMigrationEnabled")),
      projectPersistenceLive: stateLabel(flags.projectPersistenceLive),
      handoffLive: stateLabel(flags.handoffLive),
      engineSurfaceEnabled: stateLabel(flags.engineSurfaceEnabled),
      runTableSurfaceEnabled: stateLabel(flags.runTableSurfaceEnabled),
      payloadSurfaceEnabled: stateLabel(flags.payloadSurfaceEnabled),
    },
    deferredActions: [
      "Downstream context is foundation-only",
      "Scene Builder is not implemented",
      "EGRES is not implemented",
      "Compliance Matters is not implemented",
      "Ceiling / Coordinated Surfaces is not implemented",
      "Engine / RunTable / payload are out of scope",
      "Actual role is resolved from identity lookup by default",
      "Developer actual-role override is temporary and off by default",
      "Display role is preview-only and clamped",
      "This is not real auth",
      "Project selection is shell-owned",
      "Save is shell-owned and deferred",
      "Restore is shell-owned and deferred",
      "Handoff is shell-owned and deferred",
      "CRM writes are shell-owned and deferred",
    ],
    responsiveNote: "Selector panel uses module-local sections that can stack inside the shell-owned responsive layout.",
  };
}
