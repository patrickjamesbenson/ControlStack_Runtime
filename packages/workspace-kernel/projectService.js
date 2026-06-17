const PROJECT_SOURCE = "phase-7-shell-selection";

const PROJECT_FIXTURES = [
  {
    projectId: "project-alpha",
    title: "Project Alpha - Selector validation",
    status: "loaded",
    readiness: "ready-for-selector-testing",
    client: "Workspace Client A",
    site: "North test tenancy",
  },
  {
    projectId: "project-bravo",
    title: "Project Bravo - Emergency coordination",
    status: "loaded",
    readiness: "ready-for-emergence-testing",
    client: "Workspace Client B",
    site: "Emergency test tenancy",
  },
  {
    projectId: "project-charlie",
    title: "Project Charlie - Compliance review",
    status: "loaded",
    readiness: "ready-for-compliance-context",
    client: "Workspace Client C",
    site: "Compliance test tenancy",
  },
];

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

function cloneProject(project) {
  if (!project) return null;
  return { ...project };
}

function createSelectionSnapshot(state) {
  return {
    owner: "shell",
    status: "selectable",
    source: PROJECT_SOURCE,
    persistence: "not-enabled",
    selectedProjectId: state.currentProject?.projectId || null,
    selectedAt: state.selectedAt,
    availableProjects: state.availableProjects.map(cloneProject),
  };
}

function createMetadataForProject(project, selectedAt) {
  return {
    source: PROJECT_SOURCE,
    dirty: false,
    dirtyReason: null,
    title: project?.title || "No project loaded",
    projectId: project?.projectId || null,
    readiness: project?.readiness || "not-ready",
    status: project?.status || "not-loaded",
    selectedAt,
  };
}

export function createProjectService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const initialProject = cloneProject(PROJECT_FIXTURES[0]);
  const initialSelectedAt = new Date().toISOString();
  const state = {
    owner: "shell",
    status: "selectable",
    currentProject: initialProject,
    selectedAt: initialSelectedAt,
    availableProjects: PROJECT_FIXTURES.map(cloneProject),
    metadata: createMetadataForProject(initialProject, initialSelectedAt),
    saveState: {
      owner: "shell",
      available: false,
      status: "deferred",
      reason: "Phase 7 restores shell-owned current project selection only; real save implementation is deferred.",
    },
    restoreState: {
      owner: "shell",
      available: false,
      status: "deferred",
      reason: "Phase 7 restores shell-owned current project selection only; real restore implementation is deferred.",
    },
  };

  function snapshot() {
    return {
      owner: state.owner,
      status: state.status,
      source: PROJECT_SOURCE,
      currentProject: cloneProject(state.currentProject),
      metadata: { ...state.metadata },
      selection: createSelectionSnapshot(state),
      dirty: state.metadata.dirty,
      saveState: { ...state.saveState },
      restoreState: { ...state.restoreState },
      save: { ...state.saveState },
      restore: { ...state.restoreState },
    };
  }

  function notify(reason, eventName = "project:changed") {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit(eventName, { reason, project: nextSnapshot });
    if (eventName !== "project:changed") eventBus?.emit("project:changed", { reason, project: nextSnapshot });
    return nextSnapshot;
  }

  function selectProject(projectId, reason = "project-selected") {
    const project = state.availableProjects.find((candidate) => candidate.projectId === projectId);
    if (!project) {
      return {
        accepted: false,
        reason: `Unknown project id: ${projectId}`,
        project: snapshot(),
      };
    }

    const previousProjectId = state.currentProject?.projectId || null;
    state.currentProject = cloneProject(project);
    state.selectedAt = new Date().toISOString();
    state.metadata = createMetadataForProject(state.currentProject, state.selectedAt);

    const nextSnapshot = notify(reason, "project:switch");
    eventBus?.emit("project:switch:complete", {
      previousProjectId,
      selectedProjectId: projectId,
      project: nextSnapshot,
      persistence: "not-enabled",
    });

    return {
      accepted: true,
      previousProjectId,
      selectedProjectId: projectId,
      project: nextSnapshot,
    };
  }

  return {
    owner: "shell",
    status: "selectable",
    getAvailableProjects() {
      return state.availableProjects.map(cloneProject);
    },
    getCurrentProject() {
      return cloneProject(state.currentProject);
    },
    getProjectMetadata() {
      return { ...state.metadata };
    },
    getProjectSnapshot: snapshot,
    selectProject,
    markDirty(reason = "unspecified") {
      state.metadata.dirty = true;
      state.metadata.dirtyReason = reason;
      return notify(reason);
    },
    clearDirty(reason = "unspecified") {
      state.metadata.dirty = false;
      state.metadata.dirtyReason = null;
      return notify(reason);
    },
    save(request = {}) {
      eventBus?.emit("project:save-requested", { request, handled: false, phase: "7" });
      return {
        ...state.saveState,
        requestAccepted: false,
      };
    },
    restore(request = {}) {
      eventBus?.emit("project:restore-requested", { request, handled: false, phase: "7" });
      return {
        ...state.restoreState,
        requestAccepted: false,
      };
    },
    subscribe: subscriptions.subscribe,
  };
}
