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
    handoffPackageId: project.handoff?.lastPreparedPackageId || null,
    handoffPreparedAt: project.handoff?.lastPreparedAt || null,
  };
}

export function createProjectBrowserService({ savedProjectStore, projectService, eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "handoff-share-ready-browser",
    source: "p4-shell-handoff-share",
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
      emptyStateMessage: storeSnapshot.safeEmpty ? "No saved projects found. Save is ready; handoff/share package can still be prepared from current project state." : "Saved projects available. Runtime saves can be restored; package preparation is live.",
      save: storeSnapshot.save,
      restore: storeSnapshot.restore,
      hydrate: storeSnapshot.hydrate,
      handoffShare: storeSnapshot.handoffShare,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        prepareHandoff: true,
        prepareShare: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
      deferred: {
        externalDelivery: "deferred",
        emailSend: "deferred",
        hubspotWrite: "deferred",
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

  function prepareHandoffShare(context = {}) {
    const result = savedProjectStore.prepareHandoffSharePackage(context);
    if (result.accepted) {
      projectService?.recordHandoffSharePackage?.(result);
    }
    const combined = {
      ...result,
      browser: getProjectBrowserSnapshot(context),
    };
    eventBus?.emit("project-browser:handoff-share", combined);
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
    prepareHandoffShare,
    requestHandoff(context = {}) {
      return prepareHandoffShare(context);
    },
  };
}
