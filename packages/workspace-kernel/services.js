import { createContractDiagnostics } from "./contracts.js";
import { createCrmService } from "./crmService.js";
import { createFeatureFlagService } from "./featureFlags.js";
import { createIdentityService } from "./identityService.js";
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
  const identityAdapter = createIdentityService({ eventBus });
  const projectAdapter = createProjectService({ eventBus });
  const visibilityAdapter = createVisibilityService({ eventBus });
  const flagAdapter = createFeatureFlagService({ eventBus });
  const crmAdapter = createCrmService({ eventBus });

  return {
    identity: identityAdapter,
    project: projectAdapter,
    handoff: {
      owner: "shell",
      status: "placeholder",
      available: false,
      reason: "Handoff ownership is shell-level; live behavior is deferred.",
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
    crm: crmAdapter,
    storage: {
      owner: "shell",
      status: "placeholder",
    },
    diagnostics: {
      owner: "shell",
      status: "placeholder",
      getSnapshot() {
        return {
          owner: "shell",
          status: "placeholder",
          phase: "7",
          contract: createContractDiagnostics(),
          responsiveRequirement: "desktop-tablet-mobile",
          projectSelection: {
            owner: "shell",
            status: "selectable",
            persistence: "not-enabled",
          },
        };
      },
      report(event) {
        return {
          accepted: true,
          event,
          phase: "7",
        };
      },
    },
    eventBus,
  };
}

export { createShellContext } from "./context.js";
