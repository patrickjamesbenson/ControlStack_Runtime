import { evaluateSpecialPartsCompatibility } from "./selectorSpecialPartsCompatibility.js";

const ENTITLEMENT_STATUSES = Object.freeze(["none", "candidate", "matched-redacted", "blocked", "review-required"]);
const ROLE_EXTERNAL_USER = "external_user";
const ROLE_INTERNAL_USER = "internal_user";
const ROLE_INTERNAL_ENGINEER = "internal_engineer";
const ROLE_DEVELOPER = "developer";
const ROLE_MANAGEMENT = "management";
const KNOWN_ROLES = Object.freeze(new Set([
  ROLE_EXTERNAL_USER,
  ROLE_INTERNAL_USER,
  ROLE_INTERNAL_ENGINEER,
  ROLE_DEVELOPER,
  ROLE_MANAGEMENT,
]));
const INTERNAL_ROLES = Object.freeze(new Set([
  ROLE_INTERNAL_USER,
  ROLE_INTERNAL_ENGINEER,
  ROLE_DEVELOPER,
  ROLE_MANAGEMENT,
]));
const LIVE_STATUSES = Object.freeze(new Set(["available", "approved", "live"]));
const BLOCKED_STATUSES = Object.freeze(new Set(["staged", "roadmap", "business_case", "obsolete", "unknown"]));

const FAIL_CLOSED_CODES = Object.freeze({
  missingSafeRoleContext: "missing-safe-role-context",
  unknownRoleContext: "unknown-role-context",
  missingSafeIdentityContext: "missing-safe-identity-context",
  unknownIdentityAuthority: "unknown-identity-authority",
  missingRedactedEntitlementProjection: "missing-redacted-entitlement-projection",
  unsafeEntitlementProjection: "unsafe-entitlement-projection",
  rawUsersInputNotApproved: "raw-users-input-not-approved",
  rawContactInputNotApproved: "raw-contact-input-not-approved",
  rawCrmInputNotApproved: "raw-crm-input-not-approved",
  rawComponentRowInputNotApproved: "raw-component-row-input-not-approved",
  externalUserSpecialPartsNotEntitled: "external-user-special-parts-not-entitled",
  specialPartsOptInNotApproved: "special-parts-opt-in-not-approved",
  activeBuildMutationNotApproved: "active-build-mutation-not-approved",
  hubspotWriteNotApproved: "hubspot-write-not-approved",
  contactCreationNotApproved: "contact-creation-not-approved",
  privatePathReturnNotApproved: "private-path-return-not-approved",
  credentialReturnNotApproved: "credential-return-not-approved",
});

const SAFE_FALSE_FLAGS = Object.freeze({
  activeBuildMutationEnabled: false,
  hubSpotWriteEnabled: false,
  contactCreationEnabled: false,
  rawUsersReturned: false,
  rawContactsReturned: false,
  rawCrmReturned: false,
  rawProductRowsReturned: false,
  rawComponentRowsReturned: false,
  privatePathsReturned: false,
  credentialsReturned: false,
  donorEngineInvoked: false,
  runtimeDataMutated: false,
  runTableGenerated: false,
  iesGenerated: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function safeString(value) {
  return String(value ?? "").trim();
}

function safeLower(value) {
  return safeString(value).toLowerCase();
}

function normaliseToken(value) {
  return safeString(value)
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .toLowerCase()
    .replace(/[\s./-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .trim();
}

function unique(values = []) {
  const seen = new Set();
  const out = [];
  for (const value of values.map(safeString).filter(Boolean)) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function addFailCode(codes, code) {
  if (code && !codes.includes(code)) codes.push(code);
}

function numericCount(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) return Math.floor(number);
  }
  return null;
}

function arrayValue(...values) {
  for (const value of values) {
    if (Array.isArray(value)) return value;
  }
  return [];
}

function redactedRefFor(value, index = 0, prefix = "redacted-special-part") {
  const candidate = safeString(value);
  if (/^(redacted|safe|preview)[:_-]/i.test(candidate)) return candidate;
  return `${prefix}-${index + 1}`;
}

function roleFromContext(safeRoleContext, failCodes) {
  if (!isPlainObject(safeRoleContext)) {
    addFailCode(failCodes, FAIL_CLOSED_CODES.missingSafeRoleContext);
    return {
      displayRole: ROLE_EXTERNAL_USER,
      actualRole: ROLE_EXTERNAL_USER,
      roleAuthority: "missing-safe-role-context",
      roleKnown: false,
      internal: false,
    };
  }

  const requested = normaliseToken(
    safeRoleContext.displayRole
      || safeRoleContext.actualRole
      || safeRoleContext.role
      || safeRoleContext.authorityRole
      || safeRoleContext.canonicalRole
  );
  const displayRole = KNOWN_ROLES.has(requested) ? requested : ROLE_EXTERNAL_USER;
  if (!requested || !KNOWN_ROLES.has(requested)) addFailCode(failCodes, FAIL_CLOSED_CODES.unknownRoleContext);
  const actualRaw = normaliseToken(safeRoleContext.actualRole || displayRole);
  const actualRole = KNOWN_ROLES.has(actualRaw) ? actualRaw : displayRole;
  return {
    displayRole,
    actualRole,
    roleAuthority: safeString(
      safeRoleContext.roleAuthority
        || safeRoleContext.actualRoleSource
        || safeRoleContext.authoritySource
        || safeRoleContext.source
        || "safe-fallback"
    ),
    roleKnown: Boolean(requested && KNOWN_ROLES.has(requested)),
    internal: INTERNAL_ROLES.has(displayRole) || INTERNAL_ROLES.has(actualRole),
  };
}

function identityStateFromContext(safeIdentityContext, projection, failCodes) {
  if (!isPlainObject(safeIdentityContext)) {
    addFailCode(failCodes, FAIL_CLOSED_CODES.missingSafeIdentityContext);
    return { status: "missing", matchedRedacted: false, candidate: false, unknown: true };
  }

  const authority = normaliseToken(
    safeIdentityContext.identityAuthority
      || safeIdentityContext.authorityState
      || safeIdentityContext.authorityStatus
      || safeIdentityContext.status
      || projection.identityAuthority
      || projection.identityStatus
  );
  const identityState = normaliseToken(safeIdentityContext.identityState || safeIdentityContext.classification || safeIdentityContext.status);
  const matchedRedacted = safeIdentityContext.matchedRedacted === true
    || safeIdentityContext.authorityMatched === true
    || projection.matchedRedacted === true
    || projection.userEmailMatched === true
    || ["matched_redacted", "matched", "authority_matched", "known"].includes(authority);
  const candidate = safeIdentityContext.candidate === true
    || projection.identityCandidate === true
    || ["candidate", "lead_candidate", "contact_candidate", "hold_intake"].includes(authority);
  const unknown = ["unknown", "missing", "unverified", "not_verified"].includes(authority)
    || (identityState.includes("anonymous") && matchedRedacted !== true && candidate !== true);

  if (unknown && !identityState.includes("external_anonymous")) {
    addFailCode(failCodes, FAIL_CLOSED_CODES.unknownIdentityAuthority);
  }

  return { status: authority || identityState || "unknown", matchedRedacted, candidate, unknown };
}

function scanUnsafeInput(value, failCodes, depth = 0, seen = new Set()) {
  if ((!isPlainObject(value) && !Array.isArray(value)) || depth > 4 || seen.has(value)) return;
  seen.add(value);

  const entries = Array.isArray(value) ? value.entries() : Object.entries(value);
  for (const [rawKey, child] of entries) {
    const key = normaliseToken(rawKey);
    if (["raw_users", "raw_user_rows", "users_rows", "user_rows", "users"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.rawUsersInputNotApproved);
    }
    if (["raw_contacts", "contact_rows", "contacts", "crm_contacts", "hubspot_contacts"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.rawContactInputNotApproved);
    }
    if (["raw_crm", "crm_rows", "hubspot_rows", "hubspot_payload", "crm_payload"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.rawCrmInputNotApproved);
    }
    if (["raw_component_rows", "component_rows", "system_components", "system_component_rows"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.rawComponentRowInputNotApproved);
    }
    if (["raw_product_rows", "product_rows", "productrow", "raw_rows"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.unsafeEntitlementProjection);
    }
    if (["private_path", "private_paths", "absolute_path", "file_path", "filepath", "path"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.privatePathReturnNotApproved);
    }
    if (["credential", "credentials", "secret", "token", "access_token", "api_key", "apikey", "password"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.credentialReturnNotApproved);
    }
    if (["email_login", "hubspot_contact_id", "hubspot_company_id"].includes(key)) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.unsafeEntitlementProjection);
    }
    scanUnsafeInput(child, failCodes, depth + 1, seen);
  }
}

function redactedProjectionFromInput(redactedEntitlementProjection, failCodes) {
  if (!isPlainObject(redactedEntitlementProjection)) {
    addFailCode(failCodes, FAIL_CLOSED_CODES.missingRedactedEntitlementProjection);
    return { redacted: true, candidates: [], entitlementCount: 0 };
  }
  scanUnsafeInput(redactedEntitlementProjection, failCodes);
  if (redactedEntitlementProjection.redacted === false || redactedEntitlementProjection.safeRedacted === false) {
    addFailCode(failCodes, FAIL_CLOSED_CODES.unsafeEntitlementProjection);
  }

  const candidates = arrayValue(
    redactedEntitlementProjection.redactedCandidates,
    redactedEntitlementProjection.safeCandidates,
    redactedEntitlementProjection.candidates,
    redactedEntitlementProjection.entitledParts,
    redactedEntitlementProjection.parts
  );
  const entitlementRefs = arrayValue(
    redactedEntitlementProjection.redactedEntitlementRefs,
    redactedEntitlementProjection.redactedRefs,
    redactedEntitlementProjection.safeRefs
  );
  const count = numericCount(
    redactedEntitlementProjection.redactedEntitlementCount,
    redactedEntitlementProjection.entitlementCount,
    redactedEntitlementProjection.entitledCount,
    redactedEntitlementProjection.userComponentCount,
    redactedEntitlementProjection.userComponentIdsCount
  );

  return {
    ...redactedEntitlementProjection,
    redacted: redactedEntitlementProjection.redacted !== false,
    candidates,
    entitlementCount: count ?? Math.max(candidates.length, entitlementRefs.length),
  };
}

function normaliseStatus(value) {
  const status = normaliseToken(value || "available");
  if (!status) return "available";
  if (["available", "active", "current", "released", "live"].includes(status)) return "available";
  if (["approved", "approved_for_use", "approved_available"].includes(status)) return "approved";
  if (["business_case", "businesscase", "business"].includes(status)) return "business_case";
  if (["staged", "stage", "scheduled", "preview", "pre_release", "pilot"].includes(status)) return "staged";
  if (["roadmap", "future", "planned", "concept", "development"].includes(status)) return "roadmap";
  if (["obsolete", "retired", "inactive", "discontinued", "superseded"].includes(status)) return "obsolete";
  return "unknown";
}

function selectedBlockedRows(selectedBlockedValues = []) {
  if (!Array.isArray(selectedBlockedValues)) return [];
  return selectedBlockedValues.map((item, index) => {
    const value = isPlainObject(item) ? (item.redactedRef || item.safeRef || item.value || item.label) : item;
    return {
      redactedRef: redactedRefFor(value, index, "redacted-selected-blocked-value"),
      status: "blocked",
      reason: "selected-blocked-value-preserved",
      selected: true,
      rawRowsReturned: false,
    };
  });
}

function redactedCandidate(candidate = {}, index = 0) {
  const status = normaliseStatus(candidate.timelineStatus || candidate.status || candidate.optionStatusClass || candidate.availability);
  return {
    redactedRef: redactedRefFor(candidate.redactedRef || candidate.safeComponentId || candidate.safeRef || candidate.redactedReference || candidate.reference, index),
    safeComponentId: safeString(candidate.safeComponentId || candidate.systemComponentId || candidate.componentId || candidate.redactedRef),
    safeDescription: safeString(candidate.safeDescription || candidate.description),
    safeCaveats: safeString(candidate.safeCaveats || candidate.caveats),
    status,
    previewApproved: candidate.previewApproved === true || candidate.approvedForPreview === true || candidate.safePreviewApproved === true,
    safelyEntitled: candidate.safelyEntitled !== false && candidate.entitled !== false,
    compatibilityPart: {
      system: safeString(candidate.system),
      variants_all: safeString(candidate.variants_all || candidate.variantsAll),
      ip_class: safeString(candidate.ip_class || candidate.ipClass),
      effective_to: safeString(candidate.effective_to || candidate.effectiveTo),
      status_date: safeString(candidate.status_date || candidate.statusDate),
    },
  };
}

function statusAllowsCandidate(candidate, projection) {
  if (LIVE_STATUSES.has(candidate.status)) return { allowed: true, reason: "status-live-or-approved" };
  if (!BLOCKED_STATUSES.has(candidate.status)) return { allowed: false, reason: "unknown-status-review-required" };
  const approvedForPreview = candidate.previewApproved === true || projection.previewApproved === true || projection.safePreviewApproved === true;
  if (approvedForPreview && candidate.safelyEntitled === true) return { allowed: true, reason: "blocked-status-approved-for-redacted-preview" };
  return { allowed: false, reason: `${candidate.status}-status-blocked-without-safe-preview-approval` };
}

function optInPreviewState(specialPartsOptInPreview = {}, failCodes) {
  const optIn = isPlainObject(specialPartsOptInPreview) ? specialPartsOptInPreview : {};
  scanUnsafeInput(optIn, failCodes);
  const requested = optIn.enabled === true || optIn.previewEnabled === true || ["preview", "preview_only", "preview_enabled", "enabled"].includes(normaliseToken(optIn.status));
  const approved = optIn.approved === true || optIn.previewApproved === true || ["preview_enabled", "approved_preview"].includes(normaliseToken(optIn.status));
  const activeWrite = optIn.writeEnabled === true || optIn.active === true || optIn.buildMutationEnabled === true || optIn.mutationEnabled === true;
  if (requested && !approved) addFailCode(failCodes, FAIL_CLOSED_CODES.specialPartsOptInNotApproved);
  if (activeWrite) addFailCode(failCodes, FAIL_CLOSED_CODES.activeBuildMutationNotApproved);
  return {
    specialPartsOptInPreviewEnabled: requested && approved && !activeWrite,
    specialPartsOptInPreviewOnly: true,
    specialPartsOptInActiveEnabled: false,
  };
}

function externalBlocked(role, failCodes) {
  if (role.internal) return false;
  addFailCode(failCodes, FAIL_CLOSED_CODES.externalUserSpecialPartsNotEntitled);
  return true;
}

function downstreamWriteFailCodes(input = {}, failCodes) {
  const values = [input, input.writePolicy, input.downstreamWriteFlags].filter(isPlainObject);
  for (const value of values) {
    if (value.activeBuildMutationEnabled === true || value.buildMutationEnabled === true || value.buildMutationLive === true) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.activeBuildMutationNotApproved);
    }
    if (value.hubSpotWriteEnabled === true || value.hubspotWriteEnabled === true || value.hubSpotWriteLive === true || value.hubspotWriteLive === true) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.hubspotWriteNotApproved);
    }
    if (value.contactCreationEnabled === true || value.contactCreationLive === true || value.createContactEnabled === true) {
      addFailCode(failCodes, FAIL_CLOSED_CODES.contactCreationNotApproved);
    }
  }
}

function previewStatus({ failCodes, role, identity, projection, compatibleCount, blockedCount, reviewRequiredCount }) {
  const blockingSafetyCodes = new Set([
    FAIL_CLOSED_CODES.missingSafeRoleContext,
    FAIL_CLOSED_CODES.missingSafeIdentityContext,
    FAIL_CLOSED_CODES.unknownIdentityAuthority,
    FAIL_CLOSED_CODES.missingRedactedEntitlementProjection,
    FAIL_CLOSED_CODES.unsafeEntitlementProjection,
    FAIL_CLOSED_CODES.rawUsersInputNotApproved,
    FAIL_CLOSED_CODES.rawContactInputNotApproved,
    FAIL_CLOSED_CODES.rawCrmInputNotApproved,
    FAIL_CLOSED_CODES.rawComponentRowInputNotApproved,
    FAIL_CLOSED_CODES.privatePathReturnNotApproved,
    FAIL_CLOSED_CODES.credentialReturnNotApproved,
  ]);
  if (failCodes.some((code) => blockingSafetyCodes.has(code))) return "review-required";
  if (!role.internal) return "none";
  if (identity.candidate && !identity.matchedRedacted) return projection.entitlementCount > 0 ? "candidate" : "none";
  if (!identity.matchedRedacted) return reviewRequiredCount > 0 ? "review-required" : "none";
  if (compatibleCount > 0) return "matched-redacted";
  if (blockedCount > 0) return "blocked";
  if (reviewRequiredCount > 0) return "review-required";
  return projection.entitlementCount > 0 ? "candidate" : "none";
}

function safeRowsForCandidates(candidates, compatibilityResults, projection, selectedRows) {
  const rows = [];
  candidates.forEach((candidate, index) => {
    const compatibility = compatibilityResults[index]?.compatibility || { applies: false, reasons: ["compatibility-not-evaluated"] };
    const statusGate = statusAllowsCandidate(candidate, projection);
    const compatibilityUnknown = Object.values(compatibility.checks || {}).includes("unknown");
    let status = "blocked";
    let reason = statusGate.reason;
    if (compatibilityUnknown) {
      status = "review-required";
      reason = compatibility.reasons?.join(", ") || "compatibility-review-required";
    } else if (compatibility.applies === true && statusGate.allowed === true) {
      status = "compatible";
      reason = statusGate.reason;
    } else if (compatibility.applies !== true) {
      status = "blocked";
      reason = compatibility.reasons?.join(", ") || "compatibility-blocked";
    }
    rows.push({
      redactedRef: candidate.redactedRef,
      safeComponentId: candidate.safeComponentId,
      safeDescription: candidate.safeDescription,
      safeCaveats: candidate.safeCaveats,
      status,
      timelineStatus: candidate.status,
      reason,
      selected: false,
      rawRowsReturned: false,
    });
  });
  return rows.concat(selectedRows);
}

export function buildSelectorSpecialPartsEntitlementPreview({
  safeRoleContext = null,
  safeIdentityContext = null,
  redactedEntitlementProjection = null,
  specialPartsOptInPreview = null,
  selectedBlockedValues = [],
  selectorSelectionContext = {},
  timelineStatusMetadata = {},
  downstreamWriteFlags = {},
} = {}) {
  const failCodes = [];
  const projection = redactedProjectionFromInput(redactedEntitlementProjection, failCodes);
  const role = roleFromContext(safeRoleContext, failCodes);
  const identity = identityStateFromContext(safeIdentityContext, projection, failCodes);
  scanUnsafeInput(timelineStatusMetadata, failCodes);
  downstreamWriteFailCodes(downstreamWriteFlags, failCodes);
  const optIn = optInPreviewState(specialPartsOptInPreview, failCodes);
  const blockedForExternal = externalBlocked(role, failCodes);
  const selectedRows = selectedBlockedRows(selectedBlockedValues);

  const rawCandidates = blockedForExternal ? [] : projection.candidates;
  const redactedCandidates = rawCandidates.map(redactedCandidate);
  const compatibilityParts = redactedCandidates.map((candidate) => candidate.compatibilityPart);
  const compatibilityResults = evaluateSpecialPartsCompatibility(compatibilityParts, selectorSelectionContext);
  const candidateRows = safeRowsForCandidates(redactedCandidates, compatibilityResults, projection, selectedRows);

  const compatibleRedactedCandidateCount = candidateRows.filter((row) => row.status === "compatible").length;
  const blockedRedactedCandidateCount = candidateRows.filter((row) => row.status === "blocked").length;
  const reviewRequiredCount = candidateRows.filter((row) => row.status === "review-required").length
    + failCodes.filter((code) => code !== FAIL_CLOSED_CODES.externalUserSpecialPartsNotEntitled).length;
  const status = previewStatus({
    failCodes,
    role,
    identity,
    projection,
    compatibleCount: compatibleRedactedCandidateCount,
    blockedCount: blockedRedactedCandidateCount,
    reviewRequiredCount,
  });

  const blockingCodes = new Set([
    FAIL_CLOSED_CODES.missingSafeRoleContext,
    FAIL_CLOSED_CODES.missingSafeIdentityContext,
    FAIL_CLOSED_CODES.unknownIdentityAuthority,
    FAIL_CLOSED_CODES.missingRedactedEntitlementProjection,
    FAIL_CLOSED_CODES.unsafeEntitlementProjection,
    FAIL_CLOSED_CODES.rawUsersInputNotApproved,
    FAIL_CLOSED_CODES.rawContactInputNotApproved,
    FAIL_CLOSED_CODES.rawCrmInputNotApproved,
    FAIL_CLOSED_CODES.rawComponentRowInputNotApproved,
    FAIL_CLOSED_CODES.privatePathReturnNotApproved,
    FAIL_CLOSED_CODES.credentialReturnNotApproved,
  ]);

  const summaryRows = [
    ["entitlement status", status],
    ["display role", role.displayRole],
    ["role authority", role.roleAuthority],
    ["redacted entitlement count", projection.entitlementCount],
    ["compatible redacted candidates", compatibleRedactedCandidateCount],
    ["blocked redacted candidates", blockedRedactedCandidateCount],
    ["review required", reviewRequiredCount],
    ["special-parts opt-in preview enabled", optIn.specialPartsOptInPreviewEnabled ? "true" : "false"],
    ["active build mutation enabled", "false"],
    ["HubSpot write enabled", "false"],
    ["contact creation enabled", "false"],
    ["raw USERS returned", "false"],
    ["raw contacts returned", "false"],
    ["raw CRM returned", "false"],
    ["raw product rows returned", "false"],
    ["raw component rows returned", "false"],
    ["private paths returned", "false"],
    ["credentials returned", "false"],
  ];

  const output = {
    source: "selector-special-parts-entitlement-preview",
    status: ENTITLEMENT_STATUSES.includes(status) ? status : "review-required",
    specialPartsEntitlementPreviewReady: !failCodes.some((code) => blockingCodes.has(code)),
    entitlementStatus: ENTITLEMENT_STATUSES.includes(status) ? status : "review-required",
    displayRole: role.displayRole,
    roleAuthority: role.roleAuthority,
    redactedEntitlementCount: projection.entitlementCount,
    compatibleRedactedCandidateCount,
    blockedRedactedCandidateCount,
    reviewRequiredCount,
    specialPartsOptInPreviewEnabled: optIn.specialPartsOptInPreviewEnabled,
    specialPartsOptInPreviewOnly: true,
    specialPartsOptInActiveEnabled: false,
    selectedBlockedValuesPreserved: selectedRows.length > 0,
    selectedBlockedValueCount: selectedRows.length,
    candidateRows,
    safeCompatibilityResults: candidateRows.map((row) => ({
      redactedRef: row.redactedRef,
      status: row.status,
      reason: row.reason,
      rawRowsReturned: false,
    })),
    diagnostics: {
      failClosed: failCodes.length > 0,
      failClosedReasons: unique(failCodes),
      entitlementStatuses: [...ENTITLEMENT_STATUSES],
      externalUsersEntitledByDefault: false,
      unknownRolesClampToExternalUser: true,
      safeRoleContextConsumed: isPlainObject(safeRoleContext),
      safeIdentityContextConsumed: isPlainObject(safeIdentityContext),
      redactedProjectionConsumed: isPlainObject(redactedEntitlementProjection),
      selectedBlockedValuesPreserved: selectedRows.length > 0,
      summaryRows,
      rawUsersReturned: false,
      rawContactsReturned: false,
      rawCrmReturned: false,
      rawProductRowsReturned: false,
      rawComponentRowsReturned: false,
      privatePathsReturned: false,
      credentialsReturned: false,
    },
    blockedDownstreamWriteFlags: {
      activeBuildMutationEnabled: false,
      hubSpotWriteEnabled: false,
      contactCreationEnabled: false,
      buildMutationReason: "active-build-mutation-not-approved",
      hubSpotWriteReason: "hubspot-write-not-approved",
      contactCreationReason: "contact-creation-not-approved",
    },
    ...SAFE_FALSE_FLAGS,
  };

  return Object.freeze(output);
}

export { FAIL_CLOSED_CODES as SELECTOR_SPECIAL_PARTS_ENTITLEMENT_FAIL_CLOSED_CODES };
