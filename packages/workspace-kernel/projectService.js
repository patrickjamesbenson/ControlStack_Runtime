const PROJECT_FIXTURES = Object.freeze([
  Object.freeze({
    projectId: "project-alpha",
    title: "Alpha Linear Workspace",
    client: "Alpha Client",
    site: "Sydney",
    readiness: "fixture-current-project",
    source: "phase-7-shell-project-selection-fixture",
  }),
  Object.freeze({
    projectId: "project-bravo",
    title: "Bravo Emergency Review",
    client: "Bravo Client",
    site: "Parramatta",
    readiness: "fixture-current-project",
    source: "phase-7-shell-project-selection-fixture",
  }),
  Object.freeze({
    projectId: "project-charlie",
    title: "Charlie Scene Planning",
    client: "Charlie Client",
    site: "Newcastle",
    readiness: "fixture-current-project",
    source: "phase-7-shell-project-selection-fixture",
  }),
]);

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

function fixtureToCurrentProject(fixture) {
  return {
    projectId: fixture.projectId,
    title: fixture.title,
    client: fixture.client,
    site: fixture.site,
    readiness: fixture.readiness,
    source: fixture.source,
  };
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
    status: "selectable",
    source: "phase-7-shell-owned-current-project-fixture",
    selectedProjectId: PROJECT_FIXTURES[0].projectId,
    selectedAt: new Date().toISOString(),
    restoredProject: null,
    lastRestore: null,
  };

  function selectedFixture() {
    return PROJECT_FIXTURES.find((project) => project.projectId === state.selectedProjectId) || PROJECT_FIXTURES[0];
  }

  function currentProject() {
    return state.restoredProject || fixtureToCurrentProject(selectedFixture());
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
        browserStatus: "p3-restore-hydrate-ready",
        restoredFromEnvelope: restored,
        restoredAt: state.lastRestore?.restoredAt || null,
        restoredEnvelopeId: state.lastRestore?.envelopeId || null,
      },
      selection: {
        owner: "shell",
        selectedProjectId: activeProject.projectId,
        selectedAt: restored ? state.lastRestore?.restoredAt : state.selectedAt,
        availableProjects: PROJECT_FIXTURES.map(clone),
        source: restored ? "restored-from-envelope" : state.source,
        restoredEnvelopeId: state.lastRestore?.envelopeId || null,
      },
      save: {
        owner: "shell",
        status: "ready",
        available: true,
        live: true,
        source: "p2-shell-save-envelope",
        reason: "Save envelope remains shell-owned and live. Restore/hydrate is now live; handoff/share remains deferred.",
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
        reason: "P3 Restore/hydrate is shell-owned and live.",
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
        status: "deferred",
        available: false,
        live: false,
        reason: "P3 Restore/hydrate does not implement handoff/share. Handoff/share is deferred to P4.",
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
      return PROJECT_FIXTURES.map(clone);
    },
    selectProject(projectId, reason = "shell-project-selected") {
      const fixture = PROJECT_FIXTURES.find((project) => project.projectId === projectId);
      if (!fixture) {
        return {
          accepted: false,
          reason: `Unknown project id: ${projectId}`,
          project: snapshot(),
        };
      }
      state.restoredProject = null;
      state.lastRestore = null;
      state.selectedProjectId = fixture.projectId;
      state.selectedAt = new Date().toISOString();
      eventBus?.emit("project:switch", { projectId: fixture.projectId, reason });
      const nextSnapshot = notify(reason);
      eventBus?.emit("project:switch:complete", { projectId: fixture.projectId, project: nextSnapshot });
      return {
        accepted: true,
        project: nextSnapshot,
      };
    },
    saveCurrentProject() {
      return {
        accepted: false,
        status: "delegate-to-project-browser",
        reason: "P3 save remains live through the shell-owned Project Browser service.",
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
    restoreProject() {
      return {
        accepted: false,
        status: "delegate-to-project-browser",
        reason: "P3 restore is live through the shell-owned Project Browser service.",
        project: snapshot(),
      };
    },
    subscribe: subscriptions.subscribe,
  };
}
