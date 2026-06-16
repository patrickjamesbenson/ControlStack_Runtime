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

export function createProjectService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const state = {
    owner: "shell",
    status: "placeholder",
    currentProject: null,
    metadata: {
      source: "phase-2-placeholder",
      dirty: false,
      title: "No project loaded",
      projectId: null,
    },
    saveState: {
      owner: "shell",
      available: false,
      status: "deferred",
      reason: "Phase 2 defines ownership only; real save implementation is deferred.",
    },
    restoreState: {
      owner: "shell",
      available: false,
      status: "deferred",
      reason: "Phase 2 defines ownership only; real restore implementation is deferred.",
    },
  };

  function snapshot() {
    return {
      owner: state.owner,
      status: state.status,
      currentProject: state.currentProject,
      metadata: { ...state.metadata },
      dirty: state.metadata.dirty,
      saveState: { ...state.saveState },
      restoreState: { ...state.restoreState },
      save: { ...state.saveState },
      restore: { ...state.restoreState },
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("project:changed", { reason, project: nextSnapshot });
    return nextSnapshot;
  }

  return {
    owner: "shell",
    status: "placeholder",
    getCurrentProject() {
      return state.currentProject;
    },
    getProjectMetadata() {
      return { ...state.metadata };
    },
    getProjectSnapshot: snapshot,
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
      eventBus?.emit("project:save-requested", { request, handled: false, phase: "2" });
      return {
        ...state.saveState,
        requestAccepted: false,
      };
    },
    restore(request = {}) {
      eventBus?.emit("project:restore-requested", { request, handled: false, phase: "2" });
      return {
        ...state.restoreState,
        requestAccepted: false,
      };
    },
    subscribe: subscriptions.subscribe,
  };
}
