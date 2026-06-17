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

export function createIdentityService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const state = {
    owner: "shell",
    status: "placeholder",
    source: "phase-4-placeholder",
    currentUser: {
      id: null,
      name: "Workspace User",
      email: null,
      handle: null,
    },
    role: "anonymous",
    capabilities: ["workspace:view", "module:cs_selector:view"],
  };

  function snapshot() {
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      currentUser: { ...state.currentUser },
      role: state.role,
      capabilities: [...state.capabilities],
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("identity:changed", { reason, identity: nextSnapshot });
    return nextSnapshot;
  }

  return {
    owner: state.owner,
    status: state.status,
    getIdentitySnapshot: snapshot,
    getCurrentUser() {
      return { ...state.currentUser };
    },
    getRole() {
      return state.role;
    },
    hasCapability(capabilityId) {
      return state.capabilities.includes(capabilityId);
    },
    setPlaceholderUser(nextUser = {}, reason = "phase-4-placeholder-update") {
      state.currentUser = { ...state.currentUser, ...nextUser };
      return notify(reason);
    },
    subscribe: subscriptions.subscribe,
  };
}
