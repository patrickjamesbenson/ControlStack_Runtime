import { createAdminToolRegistry } from "./adminToolRegistry.js";
import { createAuthService } from "./authService.js";
import { createAuthorityService } from "./authorityService.js";
import { createContractDiagnostics } from "./contracts.js";
import { createCrmService } from "./crmService.js";
import { createDownstreamContextService } from "./downstreamContextService.js";
import { createFeatureFlagService } from "./featureFlags.js";
import { createIdentityService } from "./identityService.js";
import { createProjectBrowserService } from "./projectBrowserService.js";
import { createProjectService } from "./projectService.js";
import { createSavedProjectStore } from "./savedProjectStore.js";
import { createSpecialPartsPolicyService } from "./specialPartsPolicyService.js";
import { createTimelinePolicyService } from "./timelinePolicyService.js";
import { createVisibilityService } from "./visibilityService.js";
import {
  createRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserCapability,
} from "./iesFirstNarrowProjectIesExportDownloadMaterialiserCapability.js";

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

let selectedProjectRegistrationSessionSequence = 0;

function createSelectedProjectRegistrationSessionId() {
  selectedProjectRegistrationSessionSequence += 1;
  return `shell-registration-session-${Date.now()}-${selectedProjectRegistrationSessionSequence}`;
}

export function createShellServices({
  invokeSelectedProjectReadonlyEngine: injectedSelectedProjectReadonlyEngineInvoker = null,
  registerSelectedProjectServerOwnership: injectedSelectedProjectServerOwnershipRegistrar = null,
} = {}) {
  const invokeSelectedProjectReadonlyEngine =
    typeof injectedSelectedProjectReadonlyEngineInvoker === "function"
      ? injectedSelectedProjectReadonlyEngineInvoker
      : async function unavailableSelectedProjectReadonlyEngineInvoker() {
        return null;
      };
  const materialiseProjectIesDownload =
    createRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserCapability();
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
  const authorityAdapter = createAuthorityService({ eventBus });
  const specialPartsPolicyAdapter = createSpecialPartsPolicyService({ eventBus });
  const timelinePolicyAdapter = createTimelinePolicyService({ eventBus, specialPartsPolicy: specialPartsPolicyAdapter });
  const adminToolRegistry = createAdminToolRegistry();
  const selectedProjectRegistrationSessionId = createSelectedProjectRegistrationSessionId();
  const selectedProjectRegistrationState = {
    nextOrdinal: 0,
    activeByLocalEnvelopeId: new Map(),
    pendingByLocalEnvelopeId: new Map(),
  };

  const selectedProjectServerOwnedRegistration = Object.freeze({
    owner: "shell",
    sessionId: selectedProjectRegistrationSessionId,
    async registerLocalSave(localSave) {
      const envelope = localSave?.envelope;
      if (localSave?.accepted !== true || !envelope?.projectId || !envelope?.envelopeId || !envelope?.savedAt) {
        return null;
      }
      selectedProjectRegistrationState.nextOrdinal += 1;
      const clientSaveOrdinal = selectedProjectRegistrationState.nextOrdinal;
      const localRevisionId =
        `local-revision-${selectedProjectRegistrationSessionId}-${clientSaveOrdinal}`;
      const pending = Object.freeze({
        projectId: envelope.projectId,
        localEnvelopeId: envelope.envelopeId,
        localSavedAt: envelope.savedAt,
        localRevisionId,
        clientSaveOrdinal,
      });
      selectedProjectRegistrationState.pendingByLocalEnvelopeId.set(
        envelope.envelopeId,
        pending,
      );
      selectedProjectRegistrationState.activeByLocalEnvelopeId.delete(envelope.envelopeId);

      if (typeof injectedSelectedProjectServerOwnershipRegistrar !== "function") return null;
      const result = await injectedSelectedProjectServerOwnershipRegistrar({
        localSave,
        registrationSessionId: selectedProjectRegistrationSessionId,
        clientSaveOrdinal,
        localRevisionId,
      });
      const latestPending = selectedProjectRegistrationState.pendingByLocalEnvelopeId.get(
        envelope.envelopeId,
      );
      if (latestPending?.localRevisionId !== localRevisionId) return result;
      if (result?.ok === true
        && result?.activeRevision === true
        && result?.projectId === envelope.projectId
        && result?.localEnvelopeId === envelope.envelopeId
        && result?.localSavedAt === envelope.savedAt
        && result?.localRevisionId === localRevisionId) {
        selectedProjectRegistrationState.activeByLocalEnvelopeId.set(
          envelope.envelopeId,
          Object.freeze({ ...result }),
        );
      }
      return result;
    },
    getAcknowledgementForEnvelope(envelope) {
      if (!envelope?.envelopeId) return null;
      const acknowledgement = selectedProjectRegistrationState.activeByLocalEnvelopeId.get(
        envelope.envelopeId,
      );
      if (!acknowledgement
        || acknowledgement.projectId !== envelope.projectId
        || acknowledgement.localSavedAt !== envelope.savedAt
        || acknowledgement.activeRevision !== true
        || acknowledgement.ok !== true) {
        return null;
      }
      return acknowledgement;
    },
    isAcknowledgedEnvelope(envelope) {
      return this.getAcknowledgementForEnvelope(envelope) !== null;
    },
    invalidateEnvelope(envelopeId) {
      selectedProjectRegistrationState.activeByLocalEnvelopeId.delete(envelopeId);
      selectedProjectRegistrationState.pendingByLocalEnvelopeId.delete(envelopeId);
    },
  });

  return {
    materialiseProjectIesDownload,
    invokeSelectedProjectReadonlyEngine,
    selectedProjectServerOwnedRegistration,
    adminTools: adminToolRegistry,
    auth: authAdapter,
    identity: identityAdapter,
    authority: authorityAdapter,
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
    specialPartsPolicy: specialPartsPolicyAdapter,
    timelinePolicy: timelinePolicyAdapter,
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
        const authority = authorityAdapter.getAuthoritySnapshot({ auth, identity, crm });
        const visibility = visibilityAdapter.getVisibilitySnapshot({ auth, identity, authority, project });
        const timelinePolicy = timelinePolicyAdapter.getTimelinePolicySnapshot({ auth, identity, authority, visibility, project });
        return {
          owner: "shell",
          status: "placeholder",
          phase: "live-nvb-authority-read",
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
          authority: {
            owner: "shell",
            status: authority.status,
            source: authority.source,
            actualRole: authority.actualRole?.value || "external_user",
            actualRoleSource: authority.actualRole?.source || "safe-fallback",
            nvbMatched: authority.nvb?.matched === true,
            nvbConfidence: authority.nvb?.confidence || "none",
            liveReadStatus: authority.nvb?.liveReadStatus || "live-read-unavailable",
            liveReadConfigured: authority.nvb?.liveReadConfigured === true,
            internalClassifierOnly: authority.subject?.classifierOnly === true,
            blacklistActive: authority.privileges?.blacklist?.active === true,
            restrictions: authority.privileges?.restrictions || [],
            exceptionalEntitlements: authority.privileges?.exceptionalEntitlements || [],
            writeEnabled: false,
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
            authoritySource: "not-authority",
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
          adminTools: adminToolRegistry.getStatusSnapshot(),
          timelinePolicy: {
            owner: timelinePolicy.owner,
            status: timelinePolicy.status,
            source: timelinePolicy.source,
            actualRole: timelinePolicy.rolePolicy.actualRole,
            displayLane: timelinePolicy.rolePolicy.displayLane,
            allowedStatuses: timelinePolicy.statusPolicy.allowedStatuses,
            controlsVisible: timelinePolicy.controls.visible,
            diagnosticsVisible: timelinePolicy.diagnostics.visible,
            defaultWindow: timelinePolicy.defaultWindow,
            projectStage: timelinePolicy.projectDateContext.stage,
            gateMode: timelinePolicy.gates.mode,
            writeEnabled: timelinePolicy.writePolicy.enabled,
            selectorOwnsStatusRules: timelinePolicy.statusPolicy.selectorOwnsStatusRules,
            nonBootCritical: timelinePolicy.nonBootCritical,
          },
          identityVisibility: {
            owner: "shell",
            status: "authority-derived-role-and-visibility-ready",
            actualRoleDerivedFromIdentity: false,
            actualRoleDerivedFromAuthority: true,
            internalDomainClassifierOnly: true,
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
          phase: "live-nvb-authority-read",
        };
      },
    },
    eventBus,
  };
}

export { createShellContext } from "./context.js";
