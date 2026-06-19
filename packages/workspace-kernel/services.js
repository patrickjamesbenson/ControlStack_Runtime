import { createContractDiagnostics } from "./contracts.js";
import { createCrmService } from "./crmService.js";
import { createDownstreamContextService } from "./downstreamContextService.js";
import { createFeatureFlagService } from "./featureFlags.js";
import { createIdentityService } from "./identityService.js";
import { createProjectBrowserService } from "./projectBrowserService.js";
import { createProjectService } from "./projectService.js";
import { createSavedProjectStore } from "./savedProjectStore.js";
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
  const downstreamAdapter = createDownstreamContextService({ eventBus });
  const savedProjectStore = createSavedProjectStore({ eventBus });
  const projectBrowserAdapter = createProjectBrowserService({ savedProjectStore, eventBus });
  const flagAdapter = createFeatureFlagService({ eventBus });
  const crmAdapter = createCrmService({ eventBus });

  return {
    identity: identityAdapter,
    project: projectAdapter,
    projectBrowser: projectBrowserAdapter,
    savedProjects: savedProjectStore,
    downstream: downstreamAdapter,
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
          phase: "p2-save-envelope",
          contract: createContractDiagnostics(),
          responsiveRequirement: "desktop-tablet-mobile",
          projectSelection: {
            owner: "shell",
            status: "selectable",
            persistence: "save-envelope-live",
          },
          projectBrowser: {
            owner: "shell",
            status: "save-ready-browser",
            readOnly: true,
            saveLive: true,
            restoreLive: false,
            hydrateLive: false,
            handoffLive: false,
            shareLive: false,
          },
          saveEnvelope: {
            owner: "shell",
            status: "ready",
            live: true,
            source: "p2-shell-save-envelope",
            restoreLive: false,
            hydrateLive: false,
            handoffLive: false,
            shareLive: false,
          },
          identityVisibility: {
            owner: "shell",
            status: "derived-role-and-visibility-ready",
            actualRoleDerivedFromIdentity: true,
            overrideDefault: "off",
            realAuth: false,
            credentialAuth: false,
          },
          downstreamContext: {
            owner: "shell",
            status: "foundation-ready",
            source: "selector-fed-downstream-context-foundation",
            consumersImplemented: false,
          },
        };
      },
      report(event) {
        return {
          accepted: true,
          event,
          phase: "p2-save-envelope",
        };
      },
    },
    eventBus,
  };
}

export { createShellContext } from "./context.js";
