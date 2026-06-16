function createEventBus() {
  const listeners = new Map();

  return {
    on(eventName, handler) {
      const list = listeners.get(eventName) || new Set();
      list.add(handler);
      listeners.set(eventName, list);
      return () => list.delete(handler);
    },

    emit(eventName, payload) {
      for (const handler of listeners.get(eventName) || []) {
        handler(payload);
      }
    },
  };
}

export function createShellServices() {
  const eventBus = createEventBus();

  return {
    identity: {
      owner: "shell",
      status: "placeholder",
      currentUser: null,
    },
    project: {
      owner: "shell",
      status: "placeholder",
      currentProject: null,
      metadata: {
        source: "phase-1b-placeholder",
        dirty: false,
      },
      save: {
        owner: "shell",
        available: false,
        reason: "Phase 1B placeholder only; save/restore is restored in a later phase.",
      },
      restore: {
        owner: "shell",
        available: false,
        reason: "Phase 1B placeholder only; save/restore is restored in a later phase.",
      },
    },
    handoff: {
      owner: "shell",
      status: "placeholder",
      available: false,
      reason: "Phase 1B placeholder only; handoff ownership is shell-level but implementation is deferred.",
    },
    visibility: {
      owner: "shell",
      status: "placeholder",
      rule: "cross-module or role-based visibility is shell-owned; local UI-only visibility remains module-owned",
      toggles: {
        cs_selector: true,
        workspace_home: true,
      },
    },
    flags: {
      owner: "shell",
      status: "placeholder",
      values: {
        phase1bMinimalShell: true,
        optionalPluginsBootCritical: false,
        featureRestorationEnabled: false,
      },
    },
    crm: {
      owner: "shell",
      status: "placeholder",
      company: null,
    },
    storage: {
      owner: "shell",
      status: "placeholder",
    },
    diagnostics: {
      owner: "shell",
      status: "placeholder",
      report() {
        return {
          phase: "1B",
          projectOwnedByShell: true,
          visibilityOwnedByShell: true,
          optionalPluginsBootCritical: false,
        };
      },
    },
    eventBus,
  };
}

export function createShellContext({ route, services }) {
  return {
    phase: "1B",
    route,
    identity: services.identity,
    project: services.project,
    handoff: services.handoff,
    visibility: services.visibility,
    flags: services.flags,
    crm: services.crm,
  };
}
