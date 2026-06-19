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
  const projectBrowserAdapter = createProjectBrowserService({ savedProjectStore, projectService: projectAdapter, eventBus });
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
      status: "package-preparation-ready",
      available: true,
      live: true,
      source: "p4-shell-handoff-share",
      packagePreparationOnly: true,
      externalDelivery: false,
      emailSend: false,
      hubspotWrite: false,
      reason: "P4 prepares handoff/share packages only. External delivery, email, and HubSpot writes remain deferred.",
      getHandoffSnapshot() {
        return {
          owner: this.owner,
          status: this.status,
          available: this.available,
          live: this.live,
          source: this.source,
          packagePreparationOnly: this.packagePreparationOnly,
          externalDelivery: this.externalDelivery,
          emailSend: this.emailSend,
          hubspotWrite: this.hubspotWrite,
          reason: this.reason,
        };
      },
      createHandoff() {
        return { ...this.getHandoffSnapshot(), requestAccepted: false, reason: "Use Project Browser to prepare the shell-owned handoff/share package." };
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
          phase: "p4-handoff-share",
          contract: createContractDiagnostics(),
          responsiveRequirement: "desktop-tablet-mobile",
          projectSelection: {
            owner: "shell",
            status: "selectable-restorable-and-handoff-ready",
            persistence: "save-restore-hydrate-handoff-share-package-live",
          },
          projectBrowser: {
            owner: "shell",
            status: "handoff-share-ready-browser",
            readOnly: true,
            saveLive: true,
            restoreLive: true,
            hydrateLive: true,
            handoffShareLive: true,
            externalDeliveryLive: false,
            emailSendLive: false,
            hubspotWriteLive: false,
          },
          saveEnvelope: {
            owner: "shell",
            status: "ready",
            live: true,
            source: "p2-shell-save-envelope",
            restoreLive: true,
            hydrateLive: true,
            handoffShareLive: true,
            externalDeliveryLive: false,
            emailSendLive: false,
            hubspotWriteLive: false,
          },
          restoreHydrate: {
            owner: "shell",
            status: "ready",
            live: true,
            source: "p3-shell-restore-hydrate",
            ownershipUnchanged: true,
          },
          handoffShare: {
            owner: "shell",
            status: "ready",
            live: true,
            source: "p4-shell-handoff-share",
            packagePreparationOnly: true,
            externalDeliveryLive: false,
            emailSendLive: false,
            hubspotWriteLive: false,
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
          phase: "p4-handoff-share",
        };
      },
    },
    eventBus,
  };
}

export { createShellContext } from "./context.js";
