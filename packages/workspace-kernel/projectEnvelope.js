export const SAVED_PROJECT_SCHEMA = "workspace_saved_project.v2-runtime";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoNow() {
  return new Date().toISOString();
}

function readProjectTitle(project = {}) {
  return project.metadata?.title || project.currentProject?.title || "Untitled project";
}

function readProjectId(project = {}) {
  return project.metadata?.projectId || project.currentProject?.projectId || "runtime-project";
}

function readClient(project = {}) {
  return project.currentProject?.client || project.metadata?.client || "No client loaded";
}

function readSite(project = {}) {
  return project.currentProject?.site || project.metadata?.site || "No site loaded";
}

function readSavedBy(identity = {}) {
  return {
    identityState: identity.identityState || "external_anonymous",
    classification: identity.classification || "anonymous",
    actualRole: identity.actualRole || "external_user",
    displayRole: identity.displayRole || identity.role || "external_user",
    name: identity.currentUser?.name || "Workspace User",
    email: identity.currentUser?.email || null,
  };
}

function createModuleEnvelope({ moduleId, status = "empty", state = {}, downstreamContext = null } = {}) {
  return {
    moduleId,
    status,
    state: clone(state || {}),
    downstreamContext: downstreamContext ? clone(downstreamContext) : null,
  };
}

export function createSavedProjectEnvelope({ project = {}, identity = {}, downstream = {}, source = "project-browser-fixture" } = {}) {
  const now = isoNow();
  const projectId = readProjectId(project);
  return {
    schema: SAVED_PROJECT_SCHEMA,
    owner: "shell",
    browserOnly: true,
    readOnly: true,
    projectId,
    title: readProjectTitle(project),
    client: readClient(project),
    site: readSite(project),
    createdAt: now,
    updatedAt: now,
    source,
    savedBy: readSavedBy(identity),
    project: {
      metadata: clone(project.metadata || {}),
      currentProject: clone(project.currentProject || {}),
    },
    modules: {
      cs_selector: createModuleEnvelope({
        moduleId: "cs_selector",
        status: "empty",
        downstreamContext: downstream.selector || null,
      }),
      scene_builder: createModuleEnvelope({
        moduleId: "scene_builder",
        status: "empty",
      }),
    },
    lifecycle: {
      owner: "shell",
      status: "draft",
      custody: {
        ownerName: identity.currentUser?.name || "Workspace User",
        ownerEmail: identity.currentUser?.email || null,
      },
      handoff: {
        status: "not-live",
        available: false,
        reason: "P1 project browser is read-only. Handoff/share is deferred.",
      },
    },
  };
}

export function summariseProjectEnvelope(envelope) {
  return {
    schema: envelope.schema,
    owner: envelope.owner,
    readOnly: envelope.readOnly === true,
    projectId: envelope.projectId,
    title: envelope.title,
    client: envelope.client,
    site: envelope.site,
    updatedAt: envelope.updatedAt,
    savedBy: envelope.savedBy?.name || "Unknown",
    lifecycleStatus: envelope.lifecycle?.status || "draft",
    moduleIds: Object.keys(envelope.modules || {}),
  };
}
