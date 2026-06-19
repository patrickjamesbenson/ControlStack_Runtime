import { createHandoffSharePackage, summariseHandoffSharePackage } from "./handoffSharePackage.js";
import { createHydrationPayloadsFromEnvelope, createHydrationResultsFromEnvelope, createSavedProjectEnvelope, summariseProjectEnvelope, validateSavedProjectEnvelope } from "./projectEnvelope.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function nowIso() {
  return new Date().toISOString();
}

function createFixtureEnvelope({ projectId, title, client, site, savedByName, savedByEmail, lifecycleStatus = "draft" }) {
  const now = new Date().toISOString();
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p1-project-browser-fixture",
    browserOnly: true,
    readOnly: true,
    envelopeId: `fixture-${projectId}`,
    projectId,
    title,
    client,
    site,
    createdAt: now,
    updatedAt: now,
    savedAt: now,
    savedBy: {
      identityState: "internal_identified",
      classification: "internal",
      actualRole: "internal_user",
      derivedActualRole: "internal_user",
      actualRoleSource: "p1-project-browser-fixture",
      displayRole: "internal_user",
      displayRoleClamped: false,
      name: savedByName,
      email: savedByEmail,
    },
    project: {
      metadata: {
        projectId,
        title,
        readiness: "browser-fixture",
        source: "p1-project-browser-fixture",
      },
      currentProject: {
        projectId,
        title,
        client,
        site,
        readiness: "browser-fixture",
      },
      selection: {},
    },
    shell: {
      phase: "p1-project-browser-read-only-foundation",
      contractVersion: "fixture",
      visibility: {},
      flags: {},
      downstream: {},
    },
    modules: {
      cs_selector: {
        owner: "cs_selector",
        moduleId: "cs_selector",
        status: "empty",
        state: {},
        downstreamContext: null,
      },
      scene_builder: {
        owner: "scene_builder",
        moduleId: "scene_builder",
        status: "empty",
        state: {},
        downstreamContext: null,
      },
    },
    lifecycle: {
      owner: "shell",
      status: lifecycleStatus,
      custody: {
        ownerName: savedByName,
        ownerEmail: savedByEmail,
      },
      handoff: {
        status: "not-live",
        available: false,
        reason: "P2 save envelope does not enable handoff/share.",
      },
    },
    restore: {
      status: "not-live",
      available: false,
      reason: "Restore/hydrate deferred to P3.",
    },
  };
}

const FIXTURE_ENVELOPES = Object.freeze([
  createFixtureEnvelope({
    projectId: "saved-alpha",
    title: "Saved Alpha project",
    client: "Alpha Client",
    site: "Sydney",
    savedByName: "Workspace User",
    savedByEmail: "internal@controlstack.local",
    lifecycleStatus: "draft",
  }),
  createFixtureEnvelope({
    projectId: "saved-bravo",
    title: "Saved Bravo project",
    client: "Bravo Client",
    site: "Parramatta",
    savedByName: "Internal Engineer",
    savedByEmail: "engineer@controlstack.local",
    lifecycleStatus: "draft",
  }),
]);

export function createSavedProjectStore({ eventBus } = {}) {
  const state = {
    owner: "shell",
    status: "handoff-share-ready",
    source: "p4-shell-handoff-share",
    fixtureEnvelopes: FIXTURE_ENVELOPES.map(clone),
    savedEnvelopes: [],
    save: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p2-shell-save-envelope",
      lastSavedEnvelopeId: null,
      lastSavedProjectId: null,
      lastSavedAt: null,
      lastError: null,
    },
    restore: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p3-shell-restore-hydrate",
      lastRestoredEnvelopeId: null,
      lastRestoredProjectId: null,
      lastRestoredAt: null,
      lastError: null,
      validation: "not-run",
    },
    hydrate: {
      owner: "shell",
      status: "idle",
      live: true,
      source: "p3-shell-restore-hydrate",
      lastHydratedEnvelopeId: null,
      lastHydratedModules: [],
      modulePayloads: {},
      moduleResults: {},
    },
    handoffShare: {
      owner: "shell",
      status: "ready",
      live: true,
      source: "p4-shell-handoff-share",
      packagePreparationOnly: true,
      lastPreparedPackageId: null,
      lastPreparedEnvelopeId: null,
      lastPreparedProjectId: null,
      lastPreparedAt: null,
      lastError: null,
      package: null,
      delivery: {
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    },
  };

  function allEnvelopes() {
    return [...state.savedEnvelopes, ...state.fixtureEnvelopes];
  }

  function listProjectSummaries() {
    return allEnvelopes().map((envelope) => summariseProjectEnvelope(envelope));
  }

  function getProjectEnvelope(projectIdOrEnvelopeId) {
    const envelope = allEnvelopes().find((item) => item.projectId === projectIdOrEnvelopeId || item.envelopeId === projectIdOrEnvelopeId);
    return envelope ? clone(envelope) : null;
  }

  function createCurrentProjectPreviewEnvelope(context = {}) {
    return createSavedProjectEnvelope({
      project: context.project,
      identity: context.identity,
      visibility: context.visibility,
      flags: context.flags,
      downstream: context.downstream,
      contractVersion: context.contractVersion,
      source: "p1-current-project-preview-envelope",
    });
  }

  function getSaveSnapshot() {
    return {
      ...state.save,
      capabilities: {
        save: true,
        updateExistingEnvelope: true,
        list: true,
        inspect: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getRestoreSnapshot() {
    return {
      ...state.restore,
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getHydrateSnapshot() {
    return clone(state.hydrate);
  }

  function getHandoffShareSnapshot() {
    return {
      ...clone(state.handoffShare),
      packageSummary: summariseHandoffSharePackage(state.handoffShare.package),
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        prepareHandoff: true,
        prepareShare: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function getStoreSnapshot(context = {}) {
    const currentProjectPreview = createCurrentProjectPreviewEnvelope(context);
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: false,
      browserOnly: false,
      schema: "workspace_saved_project.v2-runtime",
      projects: listProjectSummaries(),
      count: allEnvelopes().length,
      savedCount: state.savedEnvelopes.length,
      fixtureCount: state.fixtureEnvelopes.length,
      safeEmpty: allEnvelopes().length === 0,
      currentProjectPreview: summariseProjectEnvelope(currentProjectPreview),
      save: getSaveSnapshot(),
      restore: getRestoreSnapshot(),
      hydrate: getHydrateSnapshot(),
      handoffShare: getHandoffShareSnapshot(),
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: true,
        hydrate: true,
        handoff: true,
        share: true,
        externalDelivery: false,
        emailSend: false,
        hubspotWrite: false,
      },
    };
  }

  function saveCurrentProjectEnvelope(context = {}, moduleContributions = {}) {
    try {
      state.save.status = "saving";
      state.save.lastError = null;
      const projectId = context.project?.metadata?.projectId || context.project?.currentProject?.projectId || "runtime-project";
      const existingIndex = state.savedEnvelopes.findIndex((item) => item.projectId === projectId);
      const previousEnvelope = existingIndex >= 0 ? state.savedEnvelopes[existingIndex] : null;
      const envelope = createSavedProjectEnvelope({
        project: context.project,
        identity: context.identity,
        visibility: context.visibility,
        flags: context.flags,
        downstream: context.downstream,
        contractVersion: context.contractVersion,
        moduleContributions,
        source: "p2-shell-save-envelope",
        previousEnvelope,
      });
      if (existingIndex >= 0) state.savedEnvelopes[existingIndex] = envelope;
      else state.savedEnvelopes.unshift(envelope);
      state.save.status = "saved";
      state.save.lastSavedEnvelopeId = envelope.envelopeId;
      state.save.lastSavedProjectId = envelope.projectId;
      state.save.lastSavedAt = envelope.savedAt;
      const result = {
        accepted: true,
        status: "saved",
        envelopeId: envelope.envelopeId,
        projectId: envelope.projectId,
        savedAt: envelope.savedAt,
        updatedExisting: existingIndex >= 0,
        envelope: clone(envelope),
        browser: getStoreSnapshot(context),
      };
      eventBus?.emit("saved-project-store:saved", result);
      return result;
    } catch (error) {
      state.save.status = "failed";
      state.save.lastError = error?.message || String(error || "Unknown save error");
      const result = {
        accepted: false,
        status: "failed",
        reason: state.save.lastError,
        browser: getStoreSnapshot(context),
      };
      eventBus?.emit("saved-project-store:save-failed", result);
      return result;
    }
  }

  function restoreProjectEnvelope(projectIdOrEnvelopeId, context = {}) {
    const restoredAt = nowIso();
    const envelope = getProjectEnvelope(projectIdOrEnvelopeId);
    if (!envelope) {
      state.restore.status = "failed";
      state.restore.lastError = `Saved project not found: ${projectIdOrEnvelopeId}`;
      state.restore.validation = "missing";
      return {
        accepted: false,
        status: "failed",
        reason: state.restore.lastError,
        browser: getStoreSnapshot(context),
      };
    }

    const validation = validateSavedProjectEnvelope(envelope);
    if (!validation.valid) {
      state.restore.status = "failed";
      state.restore.lastError = validation.reason;
      state.restore.validation = "failed";
      return {
        accepted: false,
        status: "failed",
        reason: validation.reason,
        envelope,
        browser: getStoreSnapshot(context),
      };
    }

    if (envelope.readOnly === true || envelope.browserOnly === true) {
      state.restore.status = "rejected";
      state.restore.lastError = "Fixture/read-only envelopes cannot be restored in P3. Save a runtime envelope first.";
      state.restore.validation = "read-only-rejected";
      return {
        accepted: false,
        status: "rejected",
        reason: state.restore.lastError,
        envelope,
        browser: getStoreSnapshot(context),
      };
    }

    state.restore.status = "restoring";
    state.restore.lastError = null;
    state.restore.validation = "passed";
    const modulePayloads = createHydrationPayloadsFromEnvelope(envelope);
    const moduleResults = createHydrationResultsFromEnvelope(envelope);
    const lastHydratedModules = Object.keys(moduleResults);
    state.restore.status = "restored";
    state.restore.lastRestoredEnvelopeId = envelope.envelopeId;
    state.restore.lastRestoredProjectId = envelope.projectId;
    state.restore.lastRestoredAt = restoredAt;
    state.hydrate.status = "prepared";
    state.hydrate.lastHydratedEnvelopeId = envelope.envelopeId;
    state.hydrate.lastHydratedModules = lastHydratedModules;
    state.hydrate.modulePayloads = modulePayloads;
    state.hydrate.moduleResults = moduleResults;
    const result = {
      accepted: true,
      status: "restored",
      envelopeId: envelope.envelopeId,
      projectId: envelope.projectId,
      restoredAt,
      shellProjectUpdated: true,
      envelope,
      hydrate: getHydrateSnapshot(),
      hydratedModules: Object.values(moduleResults),
      browser: getStoreSnapshot(context),
    };
    eventBus?.emit("saved-project-store:restored", result);
    return result;
  }

  function resolvePackageEnvelope(context = {}) {
    const envelopeId = context.project?.metadata?.restoredEnvelopeId || state.restore.lastRestoredEnvelopeId || state.save.lastSavedEnvelopeId || context.projectBrowser?.selectedProjectId || null;
    return envelopeId ? getProjectEnvelope(envelopeId) : null;
  }

  function prepareHandoffSharePackage(context = {}) {
    try {
      state.handoffShare.status = "preparing";
      state.handoffShare.lastError = null;
      const envelope = resolvePackageEnvelope(context);
      const pkg = createHandoffSharePackage({
        context,
        envelope,
        save: getSaveSnapshot(),
        restore: getRestoreSnapshot(),
        hydrate: getHydrateSnapshot(),
      });
      state.handoffShare.status = "prepared";
      state.handoffShare.package = pkg;
      state.handoffShare.lastPreparedPackageId = pkg.packageId;
      state.handoffShare.lastPreparedEnvelopeId = pkg.envelopeId;
      state.handoffShare.lastPreparedProjectId = pkg.projectId;
      state.handoffShare.lastPreparedAt = pkg.preparedAt;
      const result = {
        accepted: true,
        status: "prepared",
        packageId: pkg.packageId,
        projectId: pkg.projectId,
        envelopeId: pkg.envelopeId,
        preparedAt: pkg.preparedAt,
        package: clone(pkg),
        delivery: clone(pkg.delivery),
        browser: getStoreSnapshot(context),
      };
      eventBus?.emit("saved-project-store:handoff-share-prepared", result);
      return result;
    } catch (error) {
      state.handoffShare.status = "failed";
      state.handoffShare.lastError = error?.message || String(error || "Unknown handoff/share preparation error");
      return {
        accepted: false,
        status: "failed",
        reason: state.handoffShare.lastError,
        browser: getStoreSnapshot(context),
      };
    }
  }

  return {
    owner: state.owner,
    status: state.status,
    listProjectSummaries,
    getProjectEnvelope,
    getStoreSnapshot,
    getSaveSnapshot,
    getRestoreSnapshot,
    getHydrateSnapshot,
    getHandoffShareSnapshot,
    createCurrentProjectPreviewEnvelope,
    saveCurrentProjectEnvelope,
    saveProjectEnvelope(context = {}, moduleContributions = {}) {
      return saveCurrentProjectEnvelope(context, moduleContributions);
    },
    restoreProjectEnvelope,
    prepareHandoffSharePackage,
    requestHandoff(context = {}) {
      return prepareHandoffSharePackage(context);
    },
  };
}
