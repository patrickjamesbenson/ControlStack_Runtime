export const WORKSPACE_SAVED_PROJECT_SCHEMA_ID = "workspace_saved_project.v2";
export const WORKSPACE_SAVED_PROJECT_SCHEMA_VERSION = 2;
export const WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID = "workspace_saved_project.v2-runtime";
export const WORKSPACE_SAVED_PROJECT_BROWSER_CACHE_PREFIX = "workspace_saved_project.v2:";
export const WORKSPACE_SAVED_PROJECT_BROWSER_INDEX_KEY = "workspace_saved_project.v2:index";
export const WORKSPACE_SAVED_PROJECT_DONOR_V1_SCHEMA_ID = "workspace_saved_project.v1";

export const WORKSPACE_SAVED_PROJECT_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "projectId",
  "envelopeId",
  "savedAt",
  "title",
  "client",
  "site",
  "hubspotDealId",
  "hubspotContactId",
  "hubspotCompanyId",
  "envelope",
]);

export const WORKSPACE_SAVED_PROJECT_PASSIVE_CRM_FIELDS = Object.freeze([
  "hubspotDealId",
  "hubspotContactId",
  "hubspotCompanyId",
]);

const SAFE_PROJECT_ID_PATTERN = /^[a-z0-9][a-z0-9._-]{0,95}$/;
const SAFE_REFERENCE_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{0,127}$/;
const SAFE_ENVELOPE_ID_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{0,159}$/;
const FIXTURE_PROJECT_IDS = new Set([
  "project-alpha",
  "project-bravo",
  "project-charlie",
  "saved-alpha",
  "saved-bravo",
  "saved-charlie",
]);
const PRIVATE_OR_DELIVERY_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|\b(?:https?|file|blob|data):|data:[^;\s]+;base64)/i;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const MAX_LABEL_LENGTH = 280;

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function orderedObject(fieldOrder, values) {
  return Object.fromEntries(fieldOrder.map((field) => [field, values[field]]));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function safeLabel(value, field, fallback = "") {
  const normalized = String(value ?? fallback).replace(/\s+/g, " ").trim();
  if (normalized.length > MAX_LABEL_LENGTH
    || CONTROL_CHARACTER_PATTERN.test(String(value ?? ""))
    || PRIVATE_OR_DELIVERY_PATTERN.test(normalized)) {
    throw new TypeError(`workspace-saved-project-${field}-unsafe`);
  }
  return normalized;
}

function passiveReference(value, field) {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value !== "string" || !SAFE_REFERENCE_PATTERN.test(value)) {
    throw new TypeError(`workspace-saved-project-${field}-invalid`);
  }
  return value;
}

function exactKeys(value, expected, label) {
  if (!isPlainObject(value)) throw new TypeError(`${label}-must-be-plain-object`);
  const actual = Object.keys(value).sort();
  const orderedExpected = [...expected].sort();
  if (actual.length !== orderedExpected.length
    || actual.some((key, index) => key !== orderedExpected[index])) {
    throw new TypeError(`${label}-fields-invalid`);
  }
}

export function isWorkspaceFixtureProjectId(value) {
  return FIXTURE_PROJECT_IDS.has(String(value || "").trim().toLowerCase());
}

export function validateWorkspaceProjectId(value) {
  if (typeof value !== "string" || value !== value.toLowerCase()
    || !SAFE_PROJECT_ID_PATTERN.test(value) || isWorkspaceFixtureProjectId(value)) {
    throw new TypeError("workspace-saved-project-project-id-invalid");
  }
  return value;
}

export function workspaceSavedProjectCacheKey(projectId) {
  return `${WORKSPACE_SAVED_PROJECT_BROWSER_CACHE_PREFIX}${validateWorkspaceProjectId(projectId)}`;
}

export function buildWorkspaceSavedProjectRecord({
  envelope,
  hubspotDealId = null,
  hubspotContactId = null,
  hubspotCompanyId = null,
} = {}) {
  if (!isPlainObject(envelope)) {
    throw new TypeError("workspace-saved-project-envelope-must-be-plain-object");
  }
  const projectId = validateWorkspaceProjectId(envelope.projectId);
  const envelopeId = String(envelope.envelopeId || "").trim();
  if (!SAFE_ENVELOPE_ID_PATTERN.test(envelopeId)) {
    throw new TypeError("workspace-saved-project-envelope-id-invalid");
  }
  const savedAt = String(envelope.savedAt || "").trim();
  if (!savedAt || Number.isNaN(Date.parse(savedAt))) {
    throw new TypeError("workspace-saved-project-saved-at-invalid");
  }
  const currentProject = envelope.project?.currentProject || {};
  const record = orderedObject(WORKSPACE_SAVED_PROJECT_FIELD_ORDER, {
    schemaId: WORKSPACE_SAVED_PROJECT_SCHEMA_ID,
    schemaVersion: WORKSPACE_SAVED_PROJECT_SCHEMA_VERSION,
    projectId,
    envelopeId,
    savedAt,
    title: safeLabel(envelope.title ?? currentProject.title, "title"),
    client: safeLabel(envelope.client ?? currentProject.client, "client"),
    site: safeLabel(envelope.site ?? currentProject.site, "site"),
    hubspotDealId: passiveReference(hubspotDealId, "hubspot-deal-id"),
    hubspotContactId: passiveReference(hubspotContactId, "hubspot-contact-id"),
    hubspotCompanyId: passiveReference(hubspotCompanyId, "hubspot-company-id"),
    envelope: clone(envelope),
  });
  return normaliseWorkspaceSavedProjectRecord(record, { expectedProjectId: projectId });
}

export function normaliseWorkspaceSavedProjectRecord(input, { expectedProjectId = null } = {}) {
  exactKeys(input, WORKSPACE_SAVED_PROJECT_FIELD_ORDER, "workspace-saved-project-record");
  if (input.schemaId !== WORKSPACE_SAVED_PROJECT_SCHEMA_ID
    || input.schemaVersion !== WORKSPACE_SAVED_PROJECT_SCHEMA_VERSION) {
    throw new TypeError("workspace-saved-project-schema-invalid");
  }
  const projectId = validateWorkspaceProjectId(input.projectId);
  if (expectedProjectId !== null && projectId !== validateWorkspaceProjectId(expectedProjectId)) {
    throw new TypeError("workspace-saved-project-request-project-id-mismatch");
  }
  if (!SAFE_ENVELOPE_ID_PATTERN.test(String(input.envelopeId || ""))) {
    throw new TypeError("workspace-saved-project-envelope-id-invalid");
  }
  if (!String(input.savedAt || "").trim() || Number.isNaN(Date.parse(input.savedAt))) {
    throw new TypeError("workspace-saved-project-saved-at-invalid");
  }
  if (!isPlainObject(input.envelope)) {
    throw new TypeError("workspace-saved-project-envelope-must-be-plain-object");
  }
  if (input.envelope.projectId !== projectId
    || input.envelope.envelopeId !== input.envelopeId
    || input.envelope.savedAt !== input.savedAt) {
    throw new TypeError("workspace-saved-project-envelope-identity-mismatch");
  }

  return deepFreeze(orderedObject(WORKSPACE_SAVED_PROJECT_FIELD_ORDER, {
    schemaId: WORKSPACE_SAVED_PROJECT_SCHEMA_ID,
    schemaVersion: WORKSPACE_SAVED_PROJECT_SCHEMA_VERSION,
    projectId,
    envelopeId: input.envelopeId,
    savedAt: input.savedAt,
    title: safeLabel(input.title, "title"),
    client: safeLabel(input.client, "client"),
    site: safeLabel(input.site, "site"),
    hubspotDealId: passiveReference(input.hubspotDealId, "hubspot-deal-id"),
    hubspotContactId: passiveReference(input.hubspotContactId, "hubspot-contact-id"),
    hubspotCompanyId: passiveReference(input.hubspotCompanyId, "hubspot-company-id"),
    envelope: clone(input.envelope),
  }));
}

export function migrateWorkspaceSavedProjectRecord(input, {
  expectedProjectId = null,
  createEnvelopeFromDonorV1,
} = {}) {
  if (!isPlainObject(input)) {
    throw new TypeError("workspace-saved-project-migration-input-invalid");
  }
  if (input.schemaId === WORKSPACE_SAVED_PROJECT_SCHEMA_ID) {
    return normaliseWorkspaceSavedProjectRecord(input, { expectedProjectId });
  }
  if (input.schemaId === WORKSPACE_SAVED_PROJECT_RUNTIME_SCHEMA_ID) {
    throw new TypeError("workspace-saved-project-runtime-schema-requires-explicit-adapter");
  }

  const donorProjectId = input.projectId || input.project_id || input.job_id;
  if ((input.schemaId === WORKSPACE_SAVED_PROJECT_DONOR_V1_SCHEMA_ID
      || input.schema_version === 1 || input.version === 1)
    && typeof createEnvelopeFromDonorV1 === "function") {
    const projectId = validateWorkspaceProjectId(String(donorProjectId || "").toLowerCase());
    if (expectedProjectId !== null && projectId !== validateWorkspaceProjectId(expectedProjectId)) {
      throw new TypeError("workspace-saved-project-request-project-id-mismatch");
    }
    const envelope = createEnvelopeFromDonorV1(clone(input), projectId);
    return buildWorkspaceSavedProjectRecord({
      envelope,
      hubspotDealId: input.hubspotDealId ?? input.hubspot_deal_id ?? null,
      hubspotContactId: input.hubspotContactId ?? input.hubspot_contact_id ?? null,
      hubspotCompanyId: input.hubspotCompanyId ?? input.hubspot_company_id ?? null,
    });
  }
  throw new TypeError("workspace-saved-project-migration-schema-unsupported");
}
