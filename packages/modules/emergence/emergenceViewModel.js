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
  if (policy.enabled !== undefined) return policy.enabled;
  if (policy.writeFlowsEnabled !== undefined) return policy.writeFlowsEnabled;
  return false;
}

export function createEmergenceViewModel({ adapter, emergenceState }) {
  const snapshots = adapter.readSnapshots();
  const local = emergenceState.getSnapshot();
  const flags = snapshots.flags.values || {};
  const identity = snapshots.identity;
  const project = snapshots.project;
  const company = snapshots.company || snapshots.crm?.company || {};
  const crm = snapshots.crm || {};
  const crmWritePolicy = crm.writePolicy || company.diagnostics || {};
  const handoff = snapshots.handoff;

  return {
    moduleId: adapter.moduleId,
    phase: snapshots.diagnostics?.phase || "5",
    route: snapshots.route,
    local,
    identity: {
      owner: identity.owner,
      status: identity.status,
      source: identity.source || "phase-4-placeholder",
      name: identity.currentUser?.name || "Workspace User",
      email: identity.currentUser?.email || "No email loaded",
      role: identity.role || "anonymous",
      canViewEmergence: stateLabel(adapter.hasCapability("module:emergence:view")),
    },
    project: {
      owner: project.owner,
      title: readProjectTitle(project),
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
      associatedDealId: company.associatedDealId || "none",
      associatedContactId: company.associatedContactId || "none",
    },
    crm: {
      owner: crm.owner || "shell",
      status: crm.status || "placeholder",
      writeFlowsEnabled: stateLabel(readWriteEnabled(crmWritePolicy)),
      writeReason: crmWritePolicy.reason || "Phase 5 module migration does not enable CRM writes.",
      hubspotStatus: crm.hubspot?.status || "placeholder",
    },
    handoff: {
      owner: handoff.owner,
      status: handoff.status,
      available: stateLabel(handoff.available),
    },
    visibility: {
      owner: snapshots.visibility.owner,
      moduleVisible: stateLabel(adapter.canShowModule()),
      rule: snapshots.visibility.rule,
    },
    flags: {
      owner: snapshots.flags.owner,
      featureMigrationEnabled: stateLabel(adapter.isFlagEnabled("featureMigrationEnabled")),
      projectPersistenceLive: stateLabel(flags.projectPersistenceLive),
      handoffLive: stateLabel(flags.handoffLive),
      crmLive: stateLabel(flags.crmLive),
      engineSurfaceEnabled: stateLabel(flags.engineSurfaceEnabled),
      runTableSurfaceEnabled: stateLabel(flags.runTableSurfaceEnabled),
      payloadSurfaceEnabled: stateLabel(flags.payloadSurfaceEnabled),
    },
    deferredActions: [
      "Save is shell-owned and deferred",
      "Restore is shell-owned and deferred",
      "Handoff is shell-owned and deferred",
      "CRM writes are shell-owned and deferred",
      "Engine / RunTable / payload work is out of scope",
    ],
    responsiveNote: "Emergence uses module-local sections that can stack inside the shell-owned responsive workspace layout.",
  };
}
