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

export function createFeatureFlagService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const state = {
    owner: "shell",
    status: "placeholder",
    values: {
      phase1bMinimalShell: true,
      phase2ShellContract: true,
      optionalPluginsBootCritical: false,
      featureMigrationEnabled: false,
      projectPersistenceLive: false,
      handoffLive: false,
      crmLive: false,
      engineSurfaceEnabled: false,
      runTableSurfaceEnabled: false,
      payloadSurfaceEnabled: false,
    },
  };

  function snapshot() {
    return {
      owner: state.owner,
      status: state.status,
      values: { ...state.values },
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("flags:changed", { reason, flags: nextSnapshot });
    return nextSnapshot;
  }

  return {
    owner: "shell",
    status: "placeholder",
    isEnabled(flagId) {
      return state.values[flagId] === true;
    },
    getFlagSnapshot: snapshot,
    setFlag(flagId, enabled, reason = "placeholder-update") {
      state.values[flagId] = enabled === true;
      return notify(reason);
    },
    subscribe: subscriptions.subscribe,
  };
}
