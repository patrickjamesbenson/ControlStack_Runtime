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

function statusList(policy = {}) {
  return (policy.statusPolicy?.allowedStatuses || []).join(", ") || "none";
}

function timelineWindow(policy = {}) {
  const window = policy.defaultWindow || {};
  return `${window.pastDays || 0}d back / ${window.futureDays || 0}d forward`;
}

function timelineRefs({ local = {}, project = {}, selectorDownstream = {} }) {
  return [
    `project:${project.metadata?.projectId || project.currentProject?.projectId || "none"}`,
    `category:${local.selectedCategory || "none"}`,
    `runs:${selectorDownstream.runRefs?.length || 0}`,
    `areas:${selectorDownstream.areaRefs?.length || 0}`,
    `fittings:${selectorDownstream.fittingRefs?.length || 0}`,
  ].join(", ");
}

function authorityActualRole(authority = {}, identity = {}) {
  return authority.actualRole?.value || identity.actualRole || "external_user";
}

function authorityActualRoleSource(authority = {}, identity = {}) {
  return authority.actualRole?.source || identity.actualRoleSource || "safe-fallback";
}

function authorityNominalRole(authority = {}, identity = {}) {
  return authority.actualRole?.nominalValue || authorityActualRole(authority, identity);
}

function shellDisplayRole(authority = {}, identity = {}, visibility = {}) {
  return visibility.inputs?.displayRole || authority.displayRole?.value || authorityActualRole(authority, identity);
}

function shellRequestedDisplayRole(authority = {}, identity = {}, visibility = {}) {
  return visibility.inputs?.requestedDisplayRole || authority.displayRole?.requested || identity.displayRoleRequested || shellDisplayRole(authority, identity, visibility);
}

function shellDisplayRoleClamped(authority = {}, identity = {}, visibility = {}) {
  if (visibility.inputs?.displayRoleClamped !== undefined) return visibility.inputs.displayRoleClamped;
  if (authority.displayRole?.clamped !== undefined) return authority.displayRole.clamped;
  return identity.displayRoleClamped;
}

export function createSelectorViewModel({ adapter, selectorState }) {
  const snapshots = adapter.readSnapshots();
  const local = selectorState.getSnapshot();
  const flags = snapshots.flags.values || {};
  const project = snapshots.project;
  const currentProject = project.currentProject || {};
  const handoff = snapshots.handoff;
  const identity = snapshots.identity;
  const authority = snapshots.authority || {};
  const company = snapshots.company || snapshots.crm?.company || {};
  const crm = snapshots.crm || {};
  const crmWritePolicy = crm.writePolicy || company.diagnostics || {};
  const selectorDecision = decisionFor(snapshots.visibility, "cs_selector");
  const downstream = readDownstream(adapter, snapshots);
  const selectorDownstream = downstream.selector || {};
  const timelinePolicy = snapshots.timelinePolicy || {};

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
      authorityOwner: authority.owner || "shell",
      authorityStatus: authority.status || "fallback",
      authoritySource: authority.source || "shell-safe-fallback",
      authorityActualRole: authorityActualRole(authority, identity),
      authorityNominalRole: authorityNominalRole(authority, identity),
      authorityActualRoleSource: authorityActualRoleSource(authority, identity),
      derivedActualRole: authorityActualRole(authority, identity),
      actualRole: authorityActualRole(authority, identity),
      actualRoleSource: authorityActualRoleSource(authority, identity),
      actualRoleDerived: stateLabel(authority.actualRole?.derivedFromNvb || authority.actualRole?.fallbackApplied),
      actualRoleOverrideEnabled: stateLabel(authority.actualRole?.overrideEnabled ?? identity.actualRoleOverrideEnabled),
      actualRoleOverride: authority.actualRole?.override || identity.actualRoleOverride || "none",
      displayRole: shellDisplayRole(authority, identity, snapshots.visibility),
      displayRoleRequested: shellRequestedDisplayRole(authority, identity, snapshots.visibility),
      displayRoleClamped: stateLabel(shellDisplayRoleClamped(authority, identity, snapshots.visibility)),
      displayRolePreviewOnly: "yes",
      capabilities: authority.capabilities || identity.capabilities || [],
      canViewSelector: stateLabel(selectorDecision.visible),
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
    timelinePolicy: {
      owner: timelinePolicy.owner || "shell",
      status: timelinePolicy.status || "unavailable",
      source: timelinePolicy.source || "timeline-policy-fallback",
      consumedFrom: "shell-context",
      selectorAuthoritative: "no",
      lane: `${timelinePolicy.rolePolicy?.displayLane || "external"}:${timelinePolicy.rolePolicy?.actualRole || "external_user"}`,
      actualRoleSource: timelinePolicy.rolePolicy?.actualRoleSource || "safe-fallback",
      allowedStatuses: statusList(timelinePolicy),
      controlsVisible: stateLabel(timelinePolicy.controls?.visible),
      controlsReason: timelinePolicy.controls?.reason || "not-provided",
      diagnosticsVisible: stateLabel(timelinePolicy.diagnostics?.visible),
      gateMode: timelinePolicy.gates?.mode || "unknown",
      selectorMayOverride: stateLabel(timelinePolicy.gates?.selectorMayOverride),
      selectorOwnsStatusRules: stateLabel(timelinePolicy.statusPolicy?.selectorOwnsStatusRules),
      defaultWindow: timelineWindow(timelinePolicy),
      projectStage: timelinePolicy.projectDateContext?.stage || "unknown",
      dueDatePosition: timelinePolicy.projectDateContext?.dueDatePosition || "unknown",
      persistenceLive: stateLabel(timelinePolicy.persistence?.reviewHistoryLive),
      writeEnabled: stateLabel(timelinePolicy.writePolicy?.enabled),
      itemRefs: timelineRefs({ local, project, selectorDownstream }),
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
