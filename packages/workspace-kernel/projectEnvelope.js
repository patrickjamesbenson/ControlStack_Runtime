export const SAVED_PROJECT_SCHEMA = "workspace_saved_project.v2-runtime";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoNow() {
  return new Date().toISOString();
}

function safeId(value, fallback = "runtime-project") {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
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
    derivedActualRole: identity.derivedActualRole || identity.actualRole || "external_user",
    actualRoleSource: identity.actualRoleSource || "unknown",
    displayRole: identity.displayRole || identity.role || "external_user",
    displayRoleClamped: identity.displayRoleClamped === true,
    name: identity.currentUser?.name || "Workspace User",
    email: identity.currentUser?.email || null,
  };
}

function createModuleEnvelope({ moduleId, owner = moduleId, status = "empty", state = {}, downstreamContext = null, reason = "Module save contributor not implemented yet." } = {}) {
  return {
    owner,
    moduleId,
    status,
    state: clone(state || {}),
    downstreamContext: downstreamContext ? clone(downstreamContext) : null,
    savedAt: isoNow(),
    reason: status === "empty" ? reason : null,
  };
}

function createModuleEnvelopeSet({ downstream = {}, moduleContributions = {} } = {}) {
  const selectorContribution = moduleContributions.cs_selector || {};
  const sceneBuilderContribution = moduleContributions.scene_builder || {};
  const emergenceContribution = moduleContributions.emergence || {};
  return {
    cs_selector: createModuleEnvelope({
      moduleId: "cs_selector",
      status: selectorContribution.status || "empty",
      state: selectorContribution.state || {},
      downstreamContext: selectorContribution.downstreamContext || downstream.selector || null,
      reason: selectorContribution.reason || "Selector contribution placeholder saved by shell envelope.",
    }),
    scene_builder: createModuleEnvelope({
      moduleId: "scene_builder",
      status: sceneBuilderContribution.status || "empty",
      state: sceneBuilderContribution.state || {},
      downstreamContext: sceneBuilderContribution.downstreamContext || null,
      reason: sceneBuilderContribution.reason || "Scene Builder structural contribution placeholder saved by shell envelope.",
    }),
    emergence: createModuleEnvelope({
      moduleId: "emergence",
      status: emergenceContribution.status || "empty",
      state: emergenceContribution.state || {},
      downstreamContext: emergenceContribution.downstreamContext || null,
      reason: emergenceContribution.reason || "Emergence contribution placeholder saved by shell envelope.",
    }),
  };
}

export function createSavedProjectEnvelope({ project = {}, identity = {}, visibility = {}, flags = {}, downstream = {}, contractVersion = "not-declared", moduleContributions = {}, source = "project-browser-fixture", previousEnvelope = null } = {}) {
  const now = isoNow();
  const projectId = readProjectId(project);
  const envelopeId = previousEnvelope?.envelopeId || `env-${safeId(projectId)}-${Date.now()}`;
  const createdAt = previousEnvelope?.createdAt || now;
  const browserOnly = source !== "p2-shell-save-envelope";
  const readOnly = source !== "p2-shell-save-envelope";
  return {
    schema: SAVED_PROJECT_SCHEMA,
    owner: "shell",
    source,
    browserOnly,
    readOnly,
    envelopeId,
    projectId,
    title: readProjectTitle(project),
    client: readClient(project),
    site: readSite(project),
    createdAt,
    updatedAt: now,
    savedAt: now,
    savedBy: readSavedBy(identity),
    project: {
      metadata: clone(project.metadata || {}),
      currentProject: clone(project.currentProject || {}),
      selection: clone(project.selection || {}),
    },
    shell: {
      phase: "p2-save-envelope",
      contractVersion,
      visibility: clone(visibility || {}),
      flags: clone(flags || {}),
      downstream: clone(downstream || {}),
    },
    modules: createModuleEnvelopeSet({ downstream, moduleContributions }),
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

export function summariseProjectEnvelope(envelope) {
  return {
    schema: envelope.schema,
    owner: envelope.owner,
    source: envelope.source || "unknown",
    readOnly: envelope.readOnly === true,
    browserOnly: envelope.browserOnly === true,
    envelopeId: envelope.envelopeId || envelope.projectId,
    projectId: envelope.projectId,
    title: envelope.title,
    client: envelope.client,
    site: envelope.site,
    updatedAt: envelope.updatedAt,
    savedAt: envelope.savedAt || envelope.updatedAt,
    savedBy: envelope.savedBy?.name || "Unknown",
    lifecycleStatus: envelope.lifecycle?.status || "draft",
    moduleIds: Object.keys(envelope.modules || {}),
    moduleStatuses: Object.fromEntries(Object.entries(envelope.modules || {}).map(([moduleId, value]) => [moduleId, value.status || "empty"])),
  };
}
