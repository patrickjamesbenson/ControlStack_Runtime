import { createContractDiagnostics } from "./contracts.js";
import { createFeatureFlagService } from "./featureFlags.js";
import { createProjectService } from "./projectService.js";
import { createVisibilityService } from "./visibilityService.js";

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
  const projectAdapter = createProjectService({ eventBus });
  const visibilityAdapter = createVisibilityService({ eventBus });
  const flagAdapter = createFeatureFlagService({ eventBus });

  return {
    identity: {
      owner: "shell",
      status: "placeholder",
      currentUser: null,
    },
    project: projectAdapter,
    handoff: {
      owner: "shell",
      status: "placeholder",
      available: false,
      reason: "Phase 1B placeholder only; handoff ownership is shell-level but implementation is deferred.",
      getHandoffSnapshot() {
        return {
          owner: this.owner,
          status: this.status,
          available: this.available,
          reason: this.reason,
        };
      },
      createHandoff() {
        return { ...this.getHandoffSnapshot(), requestAccepted: false };
      },
    },
    visibility: visibilityAdapter,
    flags: flagAdapter,
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

export { createShellContext } from "./context.js";
