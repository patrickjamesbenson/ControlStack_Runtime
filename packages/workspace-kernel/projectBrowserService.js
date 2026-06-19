function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function readProject(project = {}) {
  return {
    projectId: project.metadata?.projectId || project.currentProject?.projectId || null,
    title: project.metadata?.title || project.currentProject?.title || "No project loaded",
    client: project.currentProject?.client || project.metadata?.client || "No client loaded",
    site: project.currentProject?.site || project.metadata?.site || "No site loaded",
    readiness: project.metadata?.readiness || project.currentProject?.readiness || "not-ready",
    source: project.selection?.source || project.metadata?.source || "unknown",
    restoredEnvelopeId: project.metadata?.restoredEnvelopeId || project.selection?.restoredEnvelopeId || null,
    restoredAt: project.metadata?.restoredAt || null,
  };
}

export function createProjectBrowserService({ savedProjectStore, projectService, eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "restore-hydrate-ready-browser",
    source: "p3-shell-restore-hydrate",
    selectedProjectId: null,
    filters: {
      search: "",
      scope: "current-user",
    },
  };

  function getProjectBrowserSnapshot(context = {}) {
    const storeSnapshot = savedProjectStore.getStoreSnapshot(context);
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: true,
      browserOnly: false,
      nonBootCritical: true,
      currentProject: readProject(context.project),
      selectedProjectId: state.selectedProjectId,
      filters: { ...state.filters },
      projects: clone(storeSnapshot.projects),
      projectCount: storeSnapshot.count,
      savedCount: storeSnapshot.savedCount || 0,
      fixtureCount: storeSnapshot.fixtureCount || 0,
      safeEmpty: storeSnapshot.safeEmpty,
      emptyStateMessage: storeSnapshot.safeEmpty ? "No saved projects found. Save is ready; restore waits for a runtime save." : "Saved projects available. Runtime saves can be restored; fixtures stay disabled.",
      save: storeSnapshot.save,
      restore: storeSnapshot.restore,
      hydrate: storeSnapshot.hydrate,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: false,
        share: false,
      },
      deferred: {
        handoff: "deferred-to-p4",
        share: "deferred-to-p4",
      },
    };
  }

  function inspectProject(projectId, context = {}) {
    const envelope = savedProjectStore.getProjectEnvelope(projectId);
    if (!envelope) {
      return {
        accepted: false,
        reason: `Saved project not found: ${projectId}`,
        browser: getProjectBrowserSnapshot(context),
      };
    }
    state.selectedProjectId = envelope.envelopeId || envelope.projectId;
    const result = {
      accepted: true,
      readOnly: true,
      projectId: envelope.projectId,
      envelopeId: envelope.envelopeId,
      restoreEligible: envelope.readOnly !== true && envelope.browserOnly !== true,
      envelope,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:inspect", result);
    return result;
  }

  function saveProject(context = {}, moduleContributions = {}) {
    const result = savedProjectStore.saveCurrentProjectEnvelope(context, moduleContributions);
    if (result.accepted) state.selectedProjectId = result.envelopeId;
    eventBus?.emit("project-browser:save", result);
    return {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
  }

  function restoreProject(projectIdOrEnvelopeId, context = {}) {
    const result = savedProjectStore.restoreProjectEnvelope(projectIdOrEnvelopeId || state.selectedProjectId, context);
    if (!result.accepted) {
      eventBus?.emit("project-browser:restore-rejected", result);
      return {
        ...result,
        browser: getProjectBrowserSnapshot(context),
      };
    }
    state.selectedProjectId = result.envelopeId;
    const projectResult = projectService?.restoreProjectFromEnvelope?.(result.envelope, result);
    const combined = {
      ...result,
      shellProjectUpdated: projectResult?.accepted === true,
      project: projectResult?.project || null,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:restore", combined);
    return combined;
  }

  function setSearch(search = "", context = {}) {
    state.filters.search = String(search || "");
    const snapshot = getProjectBrowserSnapshot(context);
    eventBus?.emit("project-browser:filter", { search: state.filters.search, browser: snapshot });
    return snapshot;
  }

  return {
    owner: state.owner,
    status: state.status,
    getProjectBrowserSnapshot,
    inspectProject,
    setSearch,
    saveProject,
    restoreProject,
    requestHandoff() {
      return {
        accepted: false,
        status: "deferred",
        reason: "P3 Restore/hydrate does not implement handoff/share. Handoff/share is deferred to P4.",
      };
    },
  };
}
