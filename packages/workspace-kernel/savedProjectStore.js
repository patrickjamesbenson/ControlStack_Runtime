import { createSavedProjectEnvelope, summariseProjectEnvelope } from "./projectEnvelope.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
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
    status: "save-ready",
    source: "p2-shell-save-envelope",
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
        restore: false,
        hydrate: false,
        handoff: false,
        share: false,
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
      capabilities: {
        list: true,
        inspect: true,
        save: true,
        restore: false,
        hydrate: false,
        handoff: false,
        share: false,
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

  return {
    owner: state.owner,
    status: state.status,
    listProjectSummaries,
    getProjectEnvelope,
    getStoreSnapshot,
    getSaveSnapshot,
    createCurrentProjectPreviewEnvelope,
    saveCurrentProjectEnvelope,
    saveProjectEnvelope(context = {}, moduleContributions = {}) {
      return saveCurrentProjectEnvelope(context, moduleContributions);
    },
    restoreProjectEnvelope() {
      const result = {
        accepted: false,
        status: "deferred",
        reason: "P2 Save envelope does not implement restore/hydrate. Restore/hydrate is deferred to P3.",
      };
      eventBus?.emit("saved-project-store:restore-rejected", result);
      return result;
    },
    requestHandoff() {
      const result = {
        accepted: false,
        status: "deferred",
        reason: "P2 Save envelope does not implement handoff/share. Handoff/share is deferred to P4.",
      };
      eventBus?.emit("saved-project-store:handoff-rejected", result);
      return result;
    },
  };
}
