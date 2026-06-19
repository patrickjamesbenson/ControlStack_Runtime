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

export function createProjectService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const state = {
    owner: "shell",
    status: "selectable",
    source: "phase-7-shell-owned-current-project-fixture",
    selectedProjectId: PROJECT_FIXTURES[0].projectId,
    selectedAt: new Date().toISOString(),
  };

  function selectedFixture() {
    return PROJECT_FIXTURES.find((project) => project.projectId === state.selectedProjectId) || PROJECT_FIXTURES[0];
  }

  function snapshot() {
    const fixture = selectedFixture();
    const currentProject = fixtureToCurrentProject(fixture);
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      currentProject,
      metadata: {
        projectId: currentProject.projectId,
        title: currentProject.title,
        readiness: currentProject.readiness,
        source: currentProject.source,
        browserReady: true,
        browserStatus: "p2-save-ready-browser",
      },
      selection: {
        owner: "shell",
        selectedProjectId: state.selectedProjectId,
        selectedAt: state.selectedAt,
        availableProjects: PROJECT_FIXTURES.map(clone),
        source: state.source,
      },
      save: {
        owner: "shell",
        status: "ready",
        available: true,
        live: true,
        source: "p2-shell-save-envelope",
        reason: "P2 Save envelope is shell-owned and live. Restore/hydrate and handoff/share remain deferred.",
      },
      restore: {
        owner: "shell",
        status: "deferred",
        available: false,
        live: false,
        reason: "P2 Save envelope does not implement restore/hydrate. Restore/hydrate is deferred to P3.",
      },
      handoff: {
        owner: "shell",
        status: "deferred",
        available: false,
        live: false,
        reason: "P2 Save envelope does not implement handoff/share. Handoff/share is deferred to P4.",
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
        reason: "P2 save is live through the shell-owned Project Browser service.",
        project: snapshot(),
      };
    },
    restoreProject() {
      return {
        accepted: false,
        status: "deferred",
        reason: "P2 Save envelope does not implement restore/hydrate. Restore/hydrate is deferred to P3.",
        project: snapshot(),
      };
    },
    subscribe: subscriptions.subscribe,
  };
}
