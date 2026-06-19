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
  };
}

export function createProjectBrowserService({ savedProjectStore, eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "save-ready-browser",
    source: "p2-shell-save-envelope",
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
      emptyStateMessage: storeSnapshot.safeEmpty ? "No saved projects found. Browser remains safe; save is ready." : "Saved projects available. Runtime saves are visually marked.",
      save: storeSnapshot.save,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: false,
        hydrate: false,
        handoff: false,
        share: false,
      },
      deferred: {
        restore: "deferred-to-p3",
        hydrate: "deferred-to-p3",
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
      envelope,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:inspect", result);
    return result;
  }

  function saveProject(context = {}, moduleContributions = {}) {
    const result = savedProjectStore.saveCurrentProjectEnvelope(context, moduleContributions);
    eventBus?.emit("project-browser:save", result);
    return {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
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
    restoreProject() {
      return {
        accepted: false,
        status: "deferred",
        reason: "P2 Save envelope does not implement restore/hydrate. Restore/hydrate is deferred to P3.",
      };
    },
    requestHandoff() {
      return {
        accepted: false,
        status: "deferred",
        reason: "P2 Save envelope does not implement handoff/share. Handoff/share is deferred to P4.",
      };
    },
  };
}
