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

export function createVisibilityService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const state = {
    owner: "shell",
    status: "placeholder",
    rule: "cross-module or role-based visibility is shell-owned; local UI-only visibility remains module-owned",
    moduleVisibility: {
      cs_selector: true,
      workspace_home: true,
    },
    shellFeatureVisibility: {
      topbar: true,
      sidebar: true,
      workspaceHome: true,
      moduleHost: true,
    },
    roleVisibility: {
      anonymous: ["workspace_home", "cs_selector"],
    },
  };

  function snapshot() {
    return {
      owner: state.owner,
      status: state.status,
      rule: state.rule,
      moduleVisibility: { ...state.moduleVisibility },
      shellFeatureVisibility: { ...state.shellFeatureVisibility },
      roleVisibility: { ...state.roleVisibility },
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("visibility:changed", { reason, visibility: nextSnapshot });
    return nextSnapshot;
  }

  return {
    owner: "shell",
    status: "placeholder",
    canShowModule(moduleId, context = {}) {
      if (Object.prototype.hasOwnProperty.call(state.moduleVisibility, moduleId)) {
        return state.moduleVisibility[moduleId] === true;
      }
      const role = context.identity?.role || "anonymous";
      return (state.roleVisibility[role] || []).includes(moduleId);
    },
    canShowShellFeature(featureId) {
      return state.shellFeatureVisibility[featureId] === true;
    },
    getVisibilitySnapshot: snapshot,
    setModuleVisibility(moduleId, visible, reason = "placeholder-update") {
      state.moduleVisibility[moduleId] = visible === true;
      return notify(reason);
    },
    subscribe: subscriptions.subscribe,
  };
}
