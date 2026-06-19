export const HANDOFF_SHARE_SCHEMA = "workspace_handoff_share.v1-runtime";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoNow() {
  return new Date().toISOString();
}

function safeId(value, fallback = "project") {
  return String(value || fallback)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "") || fallback;
}

function readProjectId(context = {}, envelope = null) {
  return context.project?.metadata?.projectId || context.project?.currentProject?.projectId || envelope?.projectId || "runtime-project";
}

function readTitle(context = {}, envelope = null) {
  return context.project?.metadata?.title || context.project?.currentProject?.title || envelope?.title || "Untitled project";
}

function readClient(context = {}, envelope = null) {
  return context.project?.currentProject?.client || context.project?.metadata?.client || envelope?.client || "No client loaded";
}

function readSite(context = {}, envelope = null) {
  return context.project?.currentProject?.site || context.project?.metadata?.site || envelope?.site || "No site loaded";
}

function readPreparedBy(identity = {}) {
  return {
    identityState: identity.identityState || "external_anonymous",
    classification: identity.classification || "anonymous",
    actualRole: identity.actualRole || "external_user",
    displayRole: identity.displayRole || identity.role || "external_user",
    name: identity.currentUser?.name || "Workspace User",
    email: identity.currentUser?.email || null,
  };
}

function createModuleSummary({ moduleId, envelope, hydrate }) {
  const moduleEnvelope = envelope?.modules?.[moduleId] || null;
  const hydrateResult = hydrate?.moduleResults?.[moduleId] || null;
  return {
    included: true,
    status: moduleEnvelope ? "payload-reference" : "empty",
    summary: moduleEnvelope ? {
      owner: moduleEnvelope.owner || moduleId,
      moduleId,
      sourceStatus: moduleEnvelope.status || "empty",
      savedAt: moduleEnvelope.savedAt || null,
      reason: moduleEnvelope.reason || null,
      hydrateStatus: hydrateResult?.status || "none",
    } : {},
    payloadReference: moduleEnvelope ? {
      sourceEnvelopeId: envelope.envelopeId,
      sourceProjectId: envelope.projectId,
      moduleId,
    } : {},
    reason: moduleEnvelope ? null : "Module handoff/share contributor not implemented yet. Shell package includes safe placeholder only.",
  };
}

export function createHandoffSharePackage({ context = {}, envelope = null, save = {}, restore = {}, hydrate = {} } = {}) {
  const now = isoNow();
  const projectId = readProjectId(context, envelope);
  const packageId = `handoff-${safeId(projectId)}-${Date.now()}`;
  const preparedBy = readPreparedBy(context.identity || {});
  return {
    schema: HANDOFF_SHARE_SCHEMA,
    owner: "shell",
    source: "p4-shell-handoff-share",
    packageId,
    packageType: "handoff-share",
    status: "prepared",
    projectId,
    envelopeId: envelope?.envelopeId || null,
    title: readTitle(context, envelope),
    client: readClient(context, envelope),
    site: readSite(context, envelope),
    createdAt: now,
    preparedAt: now,
    preparedBy,
    shell: {
      phase: "p4-handoff-share",
      contractVersion: context.contractVersion || "not-declared",
      currentProject: clone(context.project?.currentProject || {}),
      projectMetadata: clone(context.project?.metadata || {}),
      save: clone(save || {}),
      restore: clone(restore || {}),
      hydrate: clone(hydrate || {}),
      visibility: clone(context.visibility || {}),
      flags: clone(context.flags || {}),
    },
    custody: {
      owner: "shell",
      status: "prepared",
      currentCustodianName: preparedBy.name,
      currentCustodianEmail: preparedBy.email,
      intendedRecipientName: null,
      intendedRecipientEmail: null,
      recipientLookupLive: false,
    },
    modules: {
      cs_selector: createModuleSummary({ moduleId: "cs_selector", envelope, hydrate }),
      scene_builder: createModuleSummary({ moduleId: "scene_builder", envelope, hydrate }),
      emergence: createModuleSummary({ moduleId: "emergence", envelope, hydrate }),
    },
    delivery: {
      externalDelivery: false,
      emailSend: false,
      hubspotWrite: false,
      exportFile: false,
      reason: "P4 prepares shell-owned handoff/share package only. External delivery, email, and HubSpot writes remain deferred.",
    },
    deferred: {
      email: "deferred",
      externalShare: "deferred",
      hubspotWriteback: "deferred",
      recipientLookup: "deferred",
      formalCustodyTransfer: "deferred",
    },
  };
}

export function summariseHandoffSharePackage(pkg) {
  if (!pkg) {
    return {
      packageId: null,
      status: "none",
      projectId: null,
      envelopeId: null,
      preparedAt: null,
      delivery: "deferred",
      modules: [],
    };
  }
  return {
    packageId: pkg.packageId,
    status: pkg.status,
    projectId: pkg.projectId,
    envelopeId: pkg.envelopeId,
    title: pkg.title,
    preparedAt: pkg.preparedAt,
    preparedBy: pkg.preparedBy?.name || "Workspace User",
    delivery: "deferred",
    externalDelivery: false,
    emailSend: false,
    hubspotWrite: false,
    modules: Object.entries(pkg.modules || {}).map(([moduleId, value]) => `${moduleId}:${value.status}`),
  };
}
