import { createAuthService } from "./authService.js";
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
  const authAdapter = createAuthService({ eventBus });
  const identityAdapter = createIdentityService({ authService: authAdapter, eventBus });
  const projectAdapter = createProjectService({ eventBus });
  const visibilityAdapter = createVisibilityService({ eventBus });
  const downstreamAdapter = createDownstreamContextService({ eventBus });
  const savedProjectStore = createSavedProjectStore({ eventBus });
  const projectBrowserAdapter = createProjectBrowserService({ savedProjectStore, projectService: projectAdapter, eventBus });
  const flagAdapter = createFeatureFlagService({ eventBus });
  const crmAdapter = createCrmService({ eventBus });

  return {
    auth: authAdapter,
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
        const auth = authAdapter.getAuthSnapshot();
        const project = projectAdapter.getProjectSnapshot();
        const identity = identityAdapter.getIdentitySnapshot();
        const crm = crmAdapter.getCrmSnapshot({ auth, identity, project });
        return {
          owner: "shell",
          status: "placeholder",
          phase: "hubspot-company-context",
          contract: createContractDiagnostics(),
          responsiveRequirement: "desktop-tablet-mobile",
          auth: {
            owner: "shell",
            status: auth.status,
            live: true,
            source: "real-login-auth",
            authenticated: auth.session?.authenticated === true,
            provider: auth.session?.provider || "none",
            email: auth.session?.email || "none",
            userId: auth.session?.userId || "none",
            oauthProviderLive: false,
            passwordStorageLive: false,
            mfaLive: false,
          },
          crmCompanyContext: {
            owner: "shell",
            status: crm.status,
            source: crm.source,
            companyStatus: crm.company?.status || "no-company",
            companyId: crm.company?.companyId || "none",
            companyName: crm.company?.companyName || "No company linked",
            companySource: crm.company?.source || "fallback",
            linkedProjectId: crm.company?.linkedProjectId || "none",
            writeEnabled: false,
            hubspotWritesLive: false,
          },
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
            status: "auth-derived-role-and-visibility-ready",
            actualRoleDerivedFromIdentity: true,
            overrideDefault: "off",
            realAuth: true,
            credentialAuth: auth.session?.authenticated === true,
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
          phase: "hubspot-company-context",
        };
      },
    },
    eventBus,
  };
}

export { createShellContext } from "./context.js";
