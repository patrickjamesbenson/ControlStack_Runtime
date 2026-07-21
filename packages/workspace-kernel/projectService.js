function createSubscriptionSet() {
  const listeners = new Set();
  return {
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    notify(snapshot) {
      for (const handler of listeners) handler(snapshot);
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function envelopeToRestoredProject(envelope) {
  const currentProject = envelope.project?.currentProject || {};
  return {
    projectId: currentProject.projectId || envelope.projectId,
    title: currentProject.title || envelope.title || "Restored project",
    client: currentProject.client || envelope.client || "No client loaded",
    site: currentProject.site || envelope.site || "No site loaded",
    readiness: "restored-from-envelope",
    source: "restored-from-envelope",
  };
}

export function createProjectService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const state = {
    owner: "shell",
    status: "project-required",
    source: "shell-owned-project-context-empty",
    selectedProjectId: null,
    selectedAt: null,
    restoredProject: null,
    lastRestore: null,
    lastHandoffShare: null,
  };

  function currentProject() {
    return state.restoredProject || {
      projectId: null,
      title: "No project selected",
      client: "",
      site: "",
      readiness: "project-required",
      source: state.source,
    };
  }

  function snapshot() {
    const activeProject = currentProject();
    const restored = state.restoredProject !== null;
    return {
      owner: state.owner,
      status: state.status,
      source: restored ? "restored-from-envelope" : state.source,
      currentProject: clone(activeProject),
      metadata: {
        projectId: activeProject.projectId,
        title: activeProject.title,
        readiness: activeProject.readiness,
        source: activeProject.source,
        browserReady: true,
        browserStatus: "p4-handoff-share-ready",
        restoredFromEnvelope: restored,
        restoredAt: state.lastRestore?.restoredAt || null,
        restoredEnvelopeId: state.lastRestore?.envelopeId || null,
      },
      selection: {
        owner: "shell",
        selectedProjectId: activeProject.projectId,
        selectedAt: restored ? state.lastRestore?.restoredAt : state.selectedAt,
        availableProjects: [],
        source: restored ? "restored-from-envelope" : state.source,
        restoredEnvelopeId: state.lastRestore?.envelopeId || null,
      },
      save: {
        owner: "shell",
        status: "ready",
        available: true,
        live: true,
        source: "p2-shell-save-envelope",
        reason: "Save envelope remains shell-owned and live. Restore/hydrate and handoff/share package preparation are live.",
      },
      restore: {
        owner: "shell",
        status: state.lastRestore?.status || "ready",
        available: true,
        live: true,
        source: "p3-shell-restore-hydrate",
        lastRestoredEnvelopeId: state.lastRestore?.envelopeId || null,
        lastRestoredProjectId: state.lastRestore?.projectId || null,
        lastRestoredAt: state.lastRestore?.restoredAt || null,
        reason: "P3 Restore/hydrate remains shell-owned and live.",
      },
      hydrate: {
        owner: "shell",
        status: state.lastRestore?.hydrateStatus || "idle",
        available: true,
        live: true,
        source: "p3-shell-restore-hydrate",
        lastHydratedEnvelopeId: state.lastRestore?.envelopeId || null,
        lastHydratedModules: state.lastRestore?.hydratedModules || [],
      },
      handoff: {
        owner: "shell",
        status: state.lastHandoffShare?.status || "ready",
        available: true,
        live: true,
        source: "p4-shell-handoff-share",
        packagePreparationOnly: true,
        lastPreparedPackageId: state.lastHandoffShare?.packageId || null,
        lastPreparedEnvelopeId: state.lastHandoffShare?.envelopeId || null,
        lastPreparedProjectId: state.lastHandoffShare?.projectId || null,
        lastPreparedAt: state.lastHandoffShare?.preparedAt || null,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
        reason: "P4 prepares handoff/share packages only. External delivery, email, and HubSpot writes remain deferred.",
      },
      dirty: false,
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("project:changed", { reason, project: nextSnapshot });
    return nextSnapshot;
  }

  return {
    owner: state.owner,
    status: state.status,
    getProjectSnapshot: snapshot,
    getAvailableProjects() {
      return [];
    },
    selectProject(projectId) {
      return {
        accepted: false,
        reason: projectId
          ? "Project selection is restored through the shell-owned Project Browser."
          : "A persisted project must be selected through Project Browser.",
        project: snapshot(),
      };
    },
    saveCurrentProject() {
      return {
        accepted: false,
        status: "delegate-to-project-browser",
        reason: "P4 save remains live through the shell-owned Project Browser service.",
        project: snapshot(),
      };
    },
    restoreProjectFromEnvelope(envelope, restoreResult = {}) {
      if (!envelope) {
        return {
          accepted: false,
          status: "failed",
          reason: "No envelope supplied for project restore.",
          project: snapshot(),
        };
      }
      const restoredProject = envelopeToRestoredProject(envelope);
      state.restoredProject = restoredProject;
      state.selectedProjectId = restoredProject.projectId;
      state.lastRestore = {
        status: restoreResult.status || "restored",
        envelopeId: envelope.envelopeId,
        projectId: envelope.projectId,
        restoredAt: restoreResult.restoredAt || new Date().toISOString(),
        hydrateStatus: restoreResult.hydrate?.status || "prepared",
        hydratedModules: restoreResult.hydratedModules?.map((item) => item.moduleId) || Object.keys(restoreResult.hydrate?.moduleResults || {}),
      };
      const nextSnapshot = notify("project-restored-from-envelope");
      eventBus?.emit("project:restore:complete", { envelopeId: envelope.envelopeId, project: nextSnapshot });
      return {
        accepted: true,
        status: "restored",
        project: nextSnapshot,
      };
    },
    recordHandoffSharePackage(result = {}) {
      if (!result.accepted) {
        return {
          accepted: false,
          status: result.status || "failed",
          reason: result.reason || "Handoff/share package was not prepared.",
          project: snapshot(),
        };
      }
      state.lastHandoffShare = {
        status: result.status || "prepared",
        packageId: result.packageId,
        envelopeId: result.envelopeId,
        projectId: result.projectId,
        preparedAt: result.preparedAt,
      };
      const nextSnapshot = notify("handoff-share-package-prepared");
      eventBus?.emit("project:handoff-share:prepared", { packageId: result.packageId, project: nextSnapshot });
      return {
        accepted: true,
        status: "prepared",
        project: nextSnapshot,
      };
    },
    restoreProject() {
      return {
        accepted: false,
        status: "delegate-to-project-browser",
        reason: "P4 restore remains live through the shell-owned Project Browser service.",
        project: snapshot(),
      };
    },
    subscribe: subscriptions.subscribe,
  };
}
