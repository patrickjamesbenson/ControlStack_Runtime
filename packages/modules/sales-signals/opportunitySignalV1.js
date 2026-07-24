// ControlStack Sales Signals SS-1 — deterministic, offline, redacted-text contracts only.
// Authority: SALES_SIGNALS_BRIEF_r0.4.md and accepted owner response.
// No mailbox, provider, network, route, persistence, shell, Selector or CRM action seam.

export const OPPORTUNITY_SIGNAL_SCHEMA_VERSION = "controlstack.sales-signals.opportunity-signal.v1";
export const KEYWORD_CLASSIFICATION_SCHEMA_VERSION = "controlstack.sales-signals.keyword-classification.v1";
export const CORRECTION_CORPUS_SCHEMA_VERSION = "controlstack.sales-signals.correction-corpus.v1";
export const MAX_ALERT_TEXT_CHARS = 4000;

export const CLASSIFICATION_VOCABULARY = Object.freeze([
  "Confirmed lighting match",
  "Probable lighting match",
  "Uncertain",
  "Wrong company",
  "Wrong product category",
  "False positive",
]);

export const INFORMATION_TYPES = Object.freeze([
  "Confirmed",
  "Inferred",
  "User-confirmed",
  "User-corrected",
]);

export const CONFIDENCE_LEVELS = Object.freeze(["High", "Medium", "Low"]);

export const PROJECT_STAGES = Object.freeze([
  "concept/early design",
  "developed design",
  "documentation",
  "tendering",
  "tender extended",
  "pending",
  "builder awarded",
  "construction",
  "closed/cancelled",
]);

export const QUALIFICATION_STATES = Object.freeze([
  "New",
  "Under review",
  "Relevant",
  "Researching",
  "Ready for engagement",
  "Accepted for CRM",
  "Monitoring",
  "Rejected",
  "Transferred",
]);

export const SALES_ROUTES = Object.freeze([
  "Designer and specification",
  "ControlStack and controls",
  "Tender influence",
  "Competitor takeover",
  "Builder engagement",
  "Electrical-contractor conversion",
  "Owner or developer",
  "Post-award conversion",
  "Affiliate-supported route",
]);

export const ACTION_URGENCY = Object.freeze([
  "Immediate ≤7 days",
  "Near 8–21",
  "Open >21",
  "Passed",
  "Design influence window",
  "Post-award window",
]);

export const OPPORTUNITY_SIGNAL_FIELD_ORDER = Object.freeze([
  "schemaVersion",
  "sourceEvidence",
  "projectOpportunityIdentity",
  "companyContactCandidates",
  "specificationProductEvidence",
  "commercialRouteAssessment",
  "confidenceUrgency",
  "recommendedNextAction",
  "passiveCrmLinkCandidates",
  "proposedCrmInformation",
]);

const SOURCE_EVIDENCE_FIELDS = Object.freeze([
  "sourceEventType", "sourceDate", "dateLastChecked", "matchedWording",
  "informationType", "evidenceSource", "sourceLocation", "applicableUserCorrection",
]);
const PROJECT_OPPORTUNITY_FIELDS = Object.freeze([
  "projectName", "projectDescription", "suburb", "state", "postcode", "sector",
  "estimatedValue", "projectStage", "tenderStatus", "tenderClosingDate",
  "expectedConstructionTiming", "awardedStatus", "opportunityDescription", "qualificationState",
]);
const COMPANY_CONTACT_FIELDS = Object.freeze(["organisations", "contacts"]);
const ORGANISATION_FIELDS = Object.freeze([
  "organisationName", "projectRole", "evidenceSource", "confidence", "dateChecked",
  "affiliateRelationship", "relationshipSignal",
]);
const CONTACT_FIELDS = Object.freeze([
  "candidateName", "currentRole", "organisationName", "likelyProjectRelevance",
  "reasonSelected", "publicProfessionalSource", "businessEmailAvailability",
  "phoneAvailability", "verificationDate", "confidence", "existingCrmMatch", "enrichmentSource",
]);
const SPECIFICATION_FIELDS = Object.freeze([
  "matchedWording", "specifiedManufacturer", "specifiedProduct", "productCode",
  "luminaireType", "mounting", "finish", "performanceData", "controlsRequirement",
  "daliReference", "emergencyLightingRequirement", "approvedEquivalentWording",
  "possibleAlternative", "controlStackRelevance",
]);
const COMMERCIAL_FIELDS = Object.freeze([
  "salesRoutes", "relationshipSignals", "commercialReasoning", "priorityFactors",
]);
const CONFIDENCE_URGENCY_FIELDS = Object.freeze([
  "evidenceConfidence", "actionUrgency", "sourceDate", "dateLastChecked",
  "nextKnownDeadline", "recommendedActionDate",
]);
const NEXT_ACTION_FIELDS = Object.freeze([
  "action", "reason", "requiresHumanApproval", "consequentialActionBlocked",
]);
const CRM_LINK_FIELDS = Object.freeze([
  "companies", "contacts", "leads", "deals", "existingOwnershipMustBePreserved",
]);
const CRM_PROPOSAL_FIELDS = Object.freeze([
  "companies", "contacts", "leadOrDeal", "researchInitiator", "crmOwner",
  "duplicatePreflightRequired", "writeApproved", "writeInstruction",
]);

const UNSAFE_KEY = /(?:password|passwd|token|secret|credential|authorization|cookie|mailbox|messageId|threadId|providerPayload|rawEnvelope|attachment|filePath|path|url|uri)/i;
const URL_VALUE = /(?:https?:\/\/|file:\/\/|www\.)/i;
const PATH_VALUE = /(?:[A-Za-z]:[\\/]|\\\\|(?:^|[\\/])\.\.(?:[\\/]|$)|\/(?:home|Users|mnt|tmp)\/)/i;
const SECRET_VALUE = /(?:bearer\s+[A-Za-z0-9._-]+|api[_ -]?key|client[_ -]?secret|password\s*[:=]|-----BEGIN [A-Z ]+PRIVATE KEY-----)/i;
const MAILBOX_VALUE = /(?:^|\b)(?:from|to|cc|bcc|message-id|in-reply-to|return-path|received):/im;
const PROVIDER_KEYS = new Set(["hubspotId", "contactId", "companyId", "dealId", "leadId", "providerId", "portalId", "mailboxId"]);
const PROVIDER_VALUE = /\b(?:hubspot|provider|portal|company|contact|lead|deal|mailbox)(?:Id| ID)?\s*[:=]\s*[A-Za-z0-9_-]+/i;

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function exactKeys(value, expected) {
  if (!isPlainObject(value)) return false;
  const actual = Object.keys(value);
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function safeScalar(value, { nullable = true, max = 500 } = {}) {
  if (value === null) return nullable;
  if (typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return true;
  if (typeof value !== "string" || value.length > max) return false;
  return !URL_VALUE.test(value) && !PATH_VALUE.test(value) && !SECRET_VALUE.test(value)
    && !MAILBOX_VALUE.test(value) && !PROVIDER_VALUE.test(value);
}

function safeTree(value, depth = 0) {
  if (depth > 6) return false;
  if (value === null || typeof value === "boolean" || (typeof value === "number" && Number.isFinite(value))) return true;
  if (typeof value === "string") return safeScalar(value, { max: MAX_ALERT_TEXT_CHARS });
  if (Array.isArray(value)) return value.length <= 50 && value.every((entry) => safeTree(entry, depth + 1));
  if (!isPlainObject(value)) return false;
  for (const [key, child] of Object.entries(value)) {
    if (UNSAFE_KEY.test(key) || PROVIDER_KEYS.has(key) || !safeTree(child, depth + 1)) return false;
  }
  return true;
}

function enumValue(value, vocabulary, nullable = true) {
  return value === null ? nullable : vocabulary.includes(value);
}

function validateOrganisation(value) {
  return exactKeys(value, ORGANISATION_FIELDS)
    && typeof value.organisationName === "string" && value.organisationName.length > 0
    && safeScalar(value.organisationName, { nullable: false })
    && safeScalar(value.projectRole)
    && safeScalar(value.evidenceSource)
    && enumValue(value.confidence, CONFIDENCE_LEVELS)
    && safeScalar(value.dateChecked)
    && safeScalar(value.affiliateRelationship)
    && safeScalar(value.relationshipSignal);
}

function validateContact(value) {
  if (!exactKeys(value, CONTACT_FIELDS)) return false;
  return CONTACT_FIELDS.every((key) => key === "confidence"
    ? enumValue(value[key], CONFIDENCE_LEVELS)
    : safeScalar(value[key]));
}

function validateSignalBody(value) {
  if (!exactKeys(value, OPPORTUNITY_SIGNAL_FIELD_ORDER) || !safeTree(value)) return false;
  if (value.schemaVersion !== OPPORTUNITY_SIGNAL_SCHEMA_VERSION) return false;
  if (!exactKeys(value.sourceEvidence, SOURCE_EVIDENCE_FIELDS)) return false;
  if (!safeScalar(value.sourceEvidence.sourceEventType, { nullable: false })
      || !safeScalar(value.sourceEvidence.sourceDate, { nullable: false })
      || !safeScalar(value.sourceEvidence.dateLastChecked, { nullable: false })
      || !safeScalar(value.sourceEvidence.matchedWording, { nullable: false })
      || !enumValue(value.sourceEvidence.informationType, INFORMATION_TYPES, false)) return false;
  if (!exactKeys(value.projectOpportunityIdentity, PROJECT_OPPORTUNITY_FIELDS)) return false;
  if (!safeScalar(value.projectOpportunityIdentity.projectName, { nullable: false })
      || !safeScalar(value.projectOpportunityIdentity.opportunityDescription, { nullable: false })
      || !enumValue(value.projectOpportunityIdentity.projectStage, PROJECT_STAGES)
      || !enumValue(value.projectOpportunityIdentity.qualificationState, QUALIFICATION_STATES, false)) return false;
  for (const key of PROJECT_OPPORTUNITY_FIELDS) {
    if (!["projectStage", "qualificationState"].includes(key) && !safeScalar(value.projectOpportunityIdentity[key])) return false;
  }
  if (!exactKeys(value.companyContactCandidates, COMPANY_CONTACT_FIELDS)
      || !Array.isArray(value.companyContactCandidates.organisations)
      || !Array.isArray(value.companyContactCandidates.contacts)
      || value.companyContactCandidates.organisations.length > 25
      || value.companyContactCandidates.contacts.length > 25
      || !value.companyContactCandidates.organisations.every(validateOrganisation)
      || !value.companyContactCandidates.contacts.every(validateContact)) return false;
  if (!exactKeys(value.specificationProductEvidence, SPECIFICATION_FIELDS)
      || !SPECIFICATION_FIELDS.every((key) => safeScalar(value.specificationProductEvidence[key]))) return false;
  if (!exactKeys(value.commercialRouteAssessment, COMMERCIAL_FIELDS)
      || !Array.isArray(value.commercialRouteAssessment.salesRoutes)
      || !value.commercialRouteAssessment.salesRoutes.every((route) => SALES_ROUTES.includes(route))
      || !Array.isArray(value.commercialRouteAssessment.relationshipSignals)
      || !value.commercialRouteAssessment.relationshipSignals.every((entry) => safeScalar(entry, { nullable: false }))
      || !safeScalar(value.commercialRouteAssessment.commercialReasoning)
      || !Array.isArray(value.commercialRouteAssessment.priorityFactors)
      || !value.commercialRouteAssessment.priorityFactors.every((entry) => safeScalar(entry, { nullable: false }))) return false;
  if (!exactKeys(value.confidenceUrgency, CONFIDENCE_URGENCY_FIELDS)
      || !enumValue(value.confidenceUrgency.evidenceConfidence, CONFIDENCE_LEVELS, false)
      || !enumValue(value.confidenceUrgency.actionUrgency, ACTION_URGENCY, false)) return false;
  for (const key of ["sourceDate", "dateLastChecked", "nextKnownDeadline", "recommendedActionDate"]) {
    if (!safeScalar(value.confidenceUrgency[key])) return false;
  }
  if (!exactKeys(value.recommendedNextAction, NEXT_ACTION_FIELDS)
      || !safeScalar(value.recommendedNextAction.action, { nullable: false })
      || !safeScalar(value.recommendedNextAction.reason, { nullable: false })
      || value.recommendedNextAction.requiresHumanApproval !== true
      || value.recommendedNextAction.consequentialActionBlocked !== true) return false;
  if (!exactKeys(value.passiveCrmLinkCandidates, CRM_LINK_FIELDS)) return false;
  for (const key of ["companies", "contacts", "leads", "deals"]) {
    if (!Array.isArray(value.passiveCrmLinkCandidates[key])
        || !value.passiveCrmLinkCandidates[key].every((entry) => safeScalar(entry, { nullable: false }))) return false;
  }
  if (value.passiveCrmLinkCandidates.existingOwnershipMustBePreserved !== true) return false;
  if (!exactKeys(value.proposedCrmInformation, CRM_PROPOSAL_FIELDS)) return false;
  for (const key of ["companies", "contacts"]) {
    if (!Array.isArray(value.proposedCrmInformation[key])
        || !value.proposedCrmInformation[key].every((entry) => safeScalar(entry, { nullable: false }))) return false;
  }
  if (!safeScalar(value.proposedCrmInformation.leadOrDeal)
      || !safeScalar(value.proposedCrmInformation.researchInitiator)
      || !safeScalar(value.proposedCrmInformation.crmOwner)
      || value.proposedCrmInformation.duplicatePreflightRequired !== true
      || value.proposedCrmInformation.writeApproved !== false
      || value.proposedCrmInformation.writeInstruction !== null) return false;
  return true;
}

export function validateOpportunitySignalV1(value) {
  if (!validateSignalBody(value)) {
    return deepFreeze({ valid: false, schemaVersion: OPPORTUNITY_SIGNAL_SCHEMA_VERSION, reasonCode: "opportunity_signal_invalid" });
  }
  return deepFreeze({ valid: true, schemaVersion: OPPORTUNITY_SIGNAL_SCHEMA_VERSION, reasonCode: "opportunity_signal_valid" });
}

const RULES = deepFreeze([
  { keyword: "Austube", kind: "wrong_company", terms: ["austube mills"] },
  { keyword: "Austube", kind: "wrong_category", terms: ["structural steel", "steel pipe", "hollow sections", "galvanised tube", "fabrication schedules"] },
  { keyword: "Xero", kind: "wrong_category", terms: ["accounting software", "payroll", "bookkeeping", "invoicing", "finance integration", "software licences"] },
  { keyword: "Austube", kind: "intended_company", terms: ["austube lighting"] },
  { keyword: "Xero", kind: "intended_company", terms: ["xero lighting"] },
  { keyword: "Austube", kind: "lighting", terms: ["luminaire", "lighting", "led", "output", "wattage", "cct", "cri", "optics", "mounting", "dali", "emergency", "lighting product code"] },
  { keyword: "Xero", kind: "lighting", terms: ["luminaire schedule", "lighting product code", "output", "wattage", "cct", "cri", "beam", "optic", "mounting", "dali", "emergency"] },
]);

function matchedTerms(text, keyword, kind) {
  const normal = text.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim();
  const terms = [];
  for (const rule of RULES) {
    if (rule.keyword !== keyword || rule.kind !== kind) continue;
    for (const term of rule.terms) if (normal.includes(term) && !terms.includes(term)) terms.push(term);
  }
  return terms;
}

function invalidClassification(reasonCode) {
  return deepFreeze({
    schemaVersion: KEYWORD_CLASSIFICATION_SCHEMA_VERSION,
    state: "rejected_fail_closed",
    classification: null,
    reasonCodes: [reasonCode],
    matchedEvidence: [],
    confidence: null,
    priority: null,
    safety: { deterministic: true, offline: true, redactedTextOnly: true, crmActionTriggered: false },
  });
}

export function classifyRedactedAlertTextV1(input) {
  if (!exactKeys(input, ["schemaVersion", "alertText"]) || input.schemaVersion !== KEYWORD_CLASSIFICATION_SCHEMA_VERSION) {
    return invalidClassification("classification_input_shape_invalid");
  }
  const text = input.alertText;
  if (typeof text !== "string" || text.trim().length < 3) return invalidClassification("classification_text_required");
  if (text.length > MAX_ALERT_TEXT_CHARS) return invalidClassification("classification_text_oversized");
  if (!safeScalar(text, { nullable: false, max: MAX_ALERT_TEXT_CHARS })) return invalidClassification("classification_text_unsafe");

  const normal = text.toLowerCase();
  const keywords = ["Austube", "Xero"].filter((keyword) => normal.includes(keyword.toLowerCase()));
  if (keywords.length === 0) return invalidClassification("classification_keyword_evidence_missing");
  if (keywords.length > 1) return invalidClassification("classification_multiple_keywords_unsupported");

  const keyword = keywords[0];
  const intended = matchedTerms(text, keyword, "intended_company");
  const wrongCompany = matchedTerms(text, keyword, "wrong_company");
  const wrongCategory = matchedTerms(text, keyword, "wrong_category");
  const lighting = matchedTerms(text, keyword, "lighting");
  let classification;
  let reasonCodes;
  let confidence;

  if (wrongCompany.length > 0 && lighting.length === 0) {
    classification = "Wrong company";
    reasonCodes = ["keyword_present", "explicit_wrong_company_context", "lighting_evidence_absent"];
    confidence = "High";
  } else if (wrongCategory.length > 0 && lighting.length === 0) {
    classification = keyword === "Xero" ? "False positive" : "Wrong product category";
    reasonCodes = ["keyword_present", "explicit_false_context", "lighting_evidence_absent"];
    confidence = "High";
  } else if (intended.length > 0 && lighting.length > 0) {
    classification = "Confirmed lighting match";
    reasonCodes = ["keyword_present", "intended_company_context", "lighting_evidence_present"];
    confidence = "High";
  } else if (lighting.length >= 2 && wrongCompany.length === 0 && wrongCategory.length === 0) {
    classification = "Probable lighting match";
    reasonCodes = ["keyword_present", "multiple_lighting_indicators", "false_context_absent"];
    confidence = "Medium";
  } else {
    classification = "Uncertain";
    reasonCodes = ["keyword_present", "evidence_ambiguous_or_insufficient"];
    confidence = "Low";
  }

  const matchedEvidence = [
    ...intended.map((term) => `intended:${term}`),
    ...wrongCompany.map((term) => `wrong_company:${term}`),
    ...wrongCategory.map((term) => `wrong_category:${term}`),
    ...lighting.map((term) => `lighting:${term}`),
  ];

  return deepFreeze({
    schemaVersion: KEYWORD_CLASSIFICATION_SCHEMA_VERSION,
    state: "classified_read_only",
    classification,
    reasonCodes,
    matchedEvidence,
    confidence,
    priority: null,
    safety: { deterministic: true, offline: true, redactedTextOnly: true, crmActionTriggered: false },
  });
}

export const CORRECTION_CORPUS_V1 = deepFreeze({
  schemaVersion: CORRECTION_CORPUS_SCHEMA_VERSION,
  corpusStatus: "reviewed_examples_not_promoted_rules",
  maxAlertTextChars: MAX_ALERT_TEXT_CHARS,
  cases: [
    { caseId: "tp-austube-001", caseType: "confirmed_true_positive", alertText: "Austube Lighting luminaire schedule includes DALI emergency output.", expectedClassification: "Confirmed lighting match", reason: "Explicit intended company and lighting evidence." },
    { caseId: "tp-xero-001", caseType: "confirmed_true_positive", alertText: "Xero Lighting product code with CCT CRI and mounting details.", expectedClassification: "Confirmed lighting match", reason: "Explicit intended company and multiple lighting indicators." },
    { caseId: "fp-austube-001", caseType: "false_positive_suppression", alertText: "Austube Mills structural steel and hollow sections fabrication schedules.", expectedClassification: "Wrong company", reason: "Explicit Austube Mills context without lighting evidence." },
    { caseId: "fp-xero-001", caseType: "false_positive_suppression", alertText: "Xero accounting software payroll and bookkeeping licences.", expectedClassification: "False positive", reason: "Software context without lighting evidence." },
    { caseId: "fn-austube-001", caseType: "false_negative_recovery", alertText: "AUSTUBE-LIGHTING LED output wattage CCT optics mounting.", expectedClassification: "Confirmed lighting match", reason: "Punctuation and case do not hide explicit intended company and lighting evidence." },
    { caseId: "fn-xero-001", caseType: "false_negative_recovery", alertText: "XERO LIGHTING luminaire schedule beam optic DALI emergency.", expectedClassification: "Confirmed lighting match", reason: "Uppercase text still produces the intended lighting classification." },
    { caseId: "amb-austube-001", caseType: "ambiguous_or_insufficient", alertText: "Austube noted in the project schedule.", expectedClassification: "Uncertain", reason: "Keyword appears without lighting or explicit false context." },
    { caseId: "amb-xero-001", caseType: "ambiguous_or_insufficient", alertText: "Xero output listed beside finance integration and DALI.", expectedClassification: "Uncertain", reason: "Conflicting software and lighting indicators require review." },
    { caseId: "bad-shape-001", caseType: "malformed_input_rejection", alertText: null, expectedClassification: null, reason: "Missing minimum text evidence must fail closed." },
    { caseId: "bad-url-001", caseType: "malformed_input_rejection", alertText: "Xero Lighting https://example.invalid/project", expectedClassification: null, reason: "URL-bearing alert text is outside the SS-1 redacted-text contract." },
  ],
  promotionPolicy: {
    correctionsAutoPromote: false,
    sufficientExamplesRequired: true,
    conflictingExamplesReviewed: true,
    historicalCorpusTestRequired: true,
    validMatchesMustRemainVisible: true,
    authorisedReviewerRequired: true,
    versionAndEffectiveDateRequired: true,
    rollbackRequired: true,
  },
});
