function stateLabel(value) {
  if (value === true) return "yes";
  if (value === false) return "no";
  if (value === null || value === undefined) return "none";
  return String(value);
}

function readProjectTitle(project) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

export function createSelectorViewModel({ adapter, selectorState }) {
  const snapshots = adapter.readSnapshots();
  const local = selectorState.getSnapshot();
  const flags = snapshots.flags.values || {};
  const project = snapshots.project;
  const handoff = snapshots.handoff;

  return {
    moduleId: adapter.moduleId,
    phase: snapshots.diagnostics?.phase || snapshots.contractVersion || "3",
    route: snapshots.route,
    local,
    project: {
      owner: project.owner,
      title: readProjectTitle(project),
      dirty: stateLabel(project.dirty || local.localDirty),
      metadataSource: project.metadata?.source || "unknown",
      saveStatus: project.save?.status || project.saveState?.status || "deferred",
      restoreStatus: project.restore?.status || project.restoreState?.status || "deferred",
    },
    handoff: {
      owner: handoff.owner,
      status: handoff.status,
      available: stateLabel(handoff.available),
    },
    visibility: {
      owner: snapshots.visibility.owner,
      selectorVisible: stateLabel(adapter.canShowSelector()),
      rule: snapshots.visibility.rule,
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
    company: {
      owner: snapshots.company?.owner || "shell",
      status: snapshots.company?.status || "placeholder",
      name: snapshots.company?.companyName || "No company loaded",
    },
    deferredActions: [
      "Save is shell-owned and deferred",
      "Restore is shell-owned and deferred",
      "Handoff is shell-owned and deferred",
    ],
  };
}
