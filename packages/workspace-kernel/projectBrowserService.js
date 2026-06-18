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
    status: "read-only-browser-ready",
    source: "p1-project-browser-read-only-foundation",
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
      browserOnly: true,
      nonBootCritical: true,
      currentProject: readProject(context.project),
      selectedProjectId: state.selectedProjectId,
      filters: { ...state.filters },
      projects: clone(storeSnapshot.projects),
      projectCount: storeSnapshot.count,
      safeEmpty: storeSnapshot.safeEmpty,
      emptyStateMessage: storeSnapshot.safeEmpty ? "No saved projects found. Browser remains safe and read-only." : "Saved project fixtures available for browser proof.",
      capabilities: {
        list: true,
        inspect: true,
        save: false,
        restore: false,
        hydrate: false,
        handoff: false,
        share: false,
      },
      deferred: {
        save: "deferred-to-p2",
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
    state.selectedProjectId = projectId;
    const result = {
      accepted: true,
      readOnly: true,
      projectId,
      envelope,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:inspect", result);
    return result;
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
    saveProject() {
      return {
        accepted: false,
        status: "read-only",
        reason: "P1 Project Browser is read-only. Save is not live yet.",
      };
    },
    restoreProject() {
      return {
        accepted: false,
        status: "read-only",
        reason: "P1 Project Browser is read-only. Restore/hydrate is not live yet.",
      };
    },
    requestHandoff() {
      return {
        accepted: false,
        status: "read-only",
        reason: "P1 Project Browser is read-only. Handoff/share is not live yet.",
      };
    },
  };
}
