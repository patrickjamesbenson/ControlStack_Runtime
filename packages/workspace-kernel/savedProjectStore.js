import { createSavedProjectEnvelope, summariseProjectEnvelope } from "./projectEnvelope.js";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function createFixtureEnvelope({ projectId, title, client, site, savedByName, savedByEmail, lifecycleStatus = "draft" }) {
  const now = new Date().toISOString();
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    browserOnly: true,
    readOnly: true,
    projectId,
    title,
    client,
    site,
    createdAt: now,
    updatedAt: now,
    source: "p1-project-browser-fixture",
    savedBy: {
      identityState: "internal_identified",
      classification: "internal",
      actualRole: "internal_user",
      displayRole: "internal_user",
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
    },
    modules: {
      cs_selector: {
        moduleId: "cs_selector",
        status: "empty",
        state: {},
        downstreamContext: null,
      },
      scene_builder: {
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
        reason: "P1 project browser is read-only. Handoff is deferred.",
      },
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
    status: "read-only-fixture-store",
    source: "p1-project-browser-read-only-foundation",
    envelopes: FIXTURE_ENVELOPES.map(clone),
  };

  function listProjectSummaries() {
    return state.envelopes.map((envelope) => summariseProjectEnvelope(envelope));
  }

  function getProjectEnvelope(projectId) {
    const envelope = state.envelopes.find((item) => item.projectId === projectId);
    return envelope ? clone(envelope) : null;
  }

  function createCurrentProjectPreviewEnvelope(context = {}) {
    return createSavedProjectEnvelope({
      project: context.project,
      identity: context.identity,
      downstream: context.downstream,
      source: "p1-current-project-preview-envelope",
    });
  }

  function getStoreSnapshot(context = {}) {
    const currentProjectPreview = createCurrentProjectPreviewEnvelope(context);
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      readOnly: true,
      browserOnly: true,
      schema: "workspace_saved_project.v2-runtime",
      projects: listProjectSummaries(),
      count: state.envelopes.length,
      safeEmpty: state.envelopes.length === 0,
      currentProjectPreview: summariseProjectEnvelope(currentProjectPreview),
      capabilities: {
        list: true,
        inspect: true,
        save: false,
        restore: false,
        hydrate: false,
        handoff: false,
      },
    };
  }

  return {
    owner: state.owner,
    status: state.status,
    listProjectSummaries,
    getProjectEnvelope,
    getStoreSnapshot,
    createCurrentProjectPreviewEnvelope,
    saveProjectEnvelope() {
      const result = {
        accepted: false,
        status: "read-only",
        reason: "P1 Project Browser is read-only. Save is deferred to the next approved phase.",
      };
      eventBus?.emit("saved-project-store:write-rejected", result);
      return result;
    },
    restoreProjectEnvelope() {
      const result = {
        accepted: false,
        status: "read-only",
        reason: "P1 Project Browser is read-only. Restore/hydrate is deferred to a later approved phase.",
      };
      eventBus?.emit("saved-project-store:restore-rejected", result);
      return result;
    },
  };
}
