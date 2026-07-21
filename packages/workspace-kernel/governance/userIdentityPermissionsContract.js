export const GOVERNANCE_USER_IDENTITY_SCHEMA_ID =
  "controlstack.governance.user-identity-permissions.v1";
export const GOVERNANCE_USER_IDENTITY_SCHEMA_VERSION = 1;

export const GOVERNANCE_USER_ROLES = Object.freeze([
  "external_user",
  "internal_user",
  "internal_engineer",
  "developer",
]);

export const GOVERNANCE_PERMISSION_STATES = Object.freeze({
  view: "read_only",
  propose: "co_edit",
  handoff: "on_accept",
  locked: "enforced",
  signedOff: "permanent",
});

const INPUT_FIELDS = Object.freeze([
  "email",
  "nvbRecord",
  "hubspotRecord",
  "internalOverrideRole",
  "internalOverrideReason",
]);
const SAFE_TEXT = /^[0-9A-Za-z .,'&()_+@:-]{0,240}$/;
const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;
const PATH_OR_URL = /(?:[A-Za-z]:[\\/]|\\\\|(?:^|\s)[\\/](?:home|mnt|Users)[\\/]|https?:|file:|data:|blob:)/i;
const PROVIDER_KEYS = new Set(["accessToken", "refreshToken", "token", "headers", "request", "response", "raw", "body", "properties"]);

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function exactFields(value, allowed, label) {
  if (!isPlainObject(value)) throw new TypeError(`${label}-not-object`);
  const unknown = Object.keys(value).filter((key) => !allowed.includes(key));
  if (unknown.length) throw new TypeError(`${label}-fields-invalid`);
}

function safeScalar(value, label, maxLength = 240) {
  if (value === null || value === undefined || value === "") return null;
  if (!["string", "number", "boolean"].includes(typeof value)) {
    throw new TypeError(`${label}-not-scalar`);
  }
  const text = String(value).trim();
  if (!text || text.length > maxLength || PATH_OR_URL.test(text) || !SAFE_TEXT.test(text)) {
    throw new TypeError(`${label}-unsafe`);
  }
  return text;
}

function normaliseEmail(value) {
  const email = String(value || "").trim().toLowerCase();
  if (!EMAIL.test(email) || email.length > 254 || PATH_OR_URL.test(email)) {
    throw new TypeError("identity-email-invalid");
  }
  return email;
}

function roleFrom(value, fallback = "external_user") {
  const role = String(value || "").trim();
  return GOVERNANCE_USER_ROLES.includes(role) ? role : fallback;
}

function safeRecord(value, label, allowedFields) {
  if (value === null || value === undefined) return null;
  exactFields(value, allowedFields, label);
  for (const key of Object.keys(value)) {
    if (PROVIDER_KEYS.has(key)) throw new TypeError(`${label}-provider-shape-rejected`);
  }
  return value;
}

function freezePermissions({ internalOverrideRole = null, internalOverrideReason = null } = {}) {
  return Object.freeze({
    view: GOVERNANCE_PERMISSION_STATES.view,
    propose: GOVERNANCE_PERMISSION_STATES.propose,
    handoff: GOVERNANCE_PERMISSION_STATES.handoff,
    locked: GOVERNANCE_PERMISSION_STATES.locked,
    signedOff: GOVERNANCE_PERMISSION_STATES.signedOff,
    internalOverride: Object.freeze({
      enabled: Boolean(internalOverrideRole),
      role: internalOverrideRole,
      flagged: Boolean(internalOverrideRole),
      logged: Boolean(internalOverrideRole),
      reason: internalOverrideReason,
    }),
  });
}

export function resolveGovernanceUserIdentity(input = {}) {
  exactFields(input, INPUT_FIELDS, "identity-input");
  const email = normaliseEmail(input.email);
  const nvb = safeRecord(input.nvbRecord, "nvb-record", [
    "userId",
    "email",
    "name",
    "company",
    "role",
    "roles",
    "blocked",
  ]);
  const hubspot = safeRecord(input.hubspotRecord, "hubspot-record", [
    "contactId",
    "email",
    "companyId",
    "dealId",
    "found",
  ]);

  if (nvb?.email && normaliseEmail(nvb.email) !== email) throw new TypeError("nvb-email-mismatch");
  if (hubspot?.email && normaliseEmail(hubspot.email) !== email) throw new TypeError("hubspot-email-mismatch");

  const nvbRoleCandidate = Array.isArray(nvb?.roles) ? nvb.roles[0] : nvb?.role;
  const resolvedRole = nvb?.blocked === true ? "external_user" : roleFrom(nvbRoleCandidate);
  const overrideRole = input.internalOverrideRole === null || input.internalOverrideRole === undefined
    ? null
    : roleFrom(input.internalOverrideRole, "");
  if (input.internalOverrideRole && !["internal_engineer", "developer"].includes(overrideRole)) {
    throw new TypeError("internal-override-role-invalid");
  }
  const overrideReason = overrideRole
    ? safeScalar(input.internalOverrideReason, "internal-override-reason")
    : null;
  if (overrideRole && !overrideReason) throw new TypeError("internal-override-reason-required");

  const actualRole = overrideRole || resolvedRole;
  const source = nvb ? "nvb" : hubspot ? "hubspot-presence-only" : "no-match";
  const result = {
    schemaId: GOVERNANCE_USER_IDENTITY_SCHEMA_ID,
    schemaVersion: GOVERNANCE_USER_IDENTITY_SCHEMA_VERSION,
    owner: "governance",
    email,
    userId: safeScalar(nvb?.userId, "nvb-user-id"),
    name: safeScalar(nvb?.name, "nvb-name"),
    company: safeScalar(nvb?.company, "nvb-company"),
    actualRole,
    resolvedRole,
    identityState: nvb
      ? (["internal_user", "internal_engineer", "developer"].includes(actualRole)
        ? "internal_identified"
        : "external_identified")
      : "external_identified",
    source,
    lookupOrder: Object.freeze(["nvb", "hubspot"]),
    nvbMatched: Boolean(nvb),
    hubspotMatched: Boolean(hubspot && hubspot.found !== false),
    hubspotContactId: safeScalar(hubspot?.contactId, "hubspot-contact-id"),
    hubspotCompanyId: safeScalar(hubspot?.companyId, "hubspot-company-id"),
    hubspotDealId: safeScalar(hubspot?.dealId, "hubspot-deal-id"),
    leadsPipelineDeferred: !nvb && !(hubspot && hubspot.found !== false),
    permissions: freezePermissions({
      internalOverrideRole: overrideRole,
      internalOverrideReason: overrideReason,
    }),
    hardEmailVerificationEnabled: false,
    twoFactorEnabled: false,
    crmMutationEnabled: false,
    providerCallOwned: false,
    engineEligibilityChanged: false,
    engineInputChanged: false,
    technicalReadinessChanged: false,
  };
  return Object.freeze(result);
}

export async function resolveGovernanceUserIdentityNvbFirst({
  email,
  lookupNvb,
  lookupHubspot,
  internalOverrideRole = null,
  internalOverrideReason = null,
} = {}) {
  const normalisedEmail = normaliseEmail(email);
  const nvbRecord = typeof lookupNvb === "function"
    ? await lookupNvb(normalisedEmail)
    : null;
  const hubspotRecord = typeof lookupHubspot === "function"
    ? await lookupHubspot(normalisedEmail)
    : null;
  return resolveGovernanceUserIdentity({
    email: normalisedEmail,
    nvbRecord,
    hubspotRecord,
    internalOverrideRole,
    internalOverrideReason,
  });
}
