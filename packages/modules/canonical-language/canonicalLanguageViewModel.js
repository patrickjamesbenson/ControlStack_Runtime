const MODULE_ID = "canonical_language";

const REQUIRED_WORDING = Object.freeze([
  "Canonical Language / CLX is read-only and diagnostic in this slice.",
  "CLX controls vocabulary; it does not create authority.",
  "CLX does not override Board Data, Lab Proof, code truth, Module Cards, or Controlled Records.",
  "CLX may help Liora, Knowledge Base, RREG, and Controlled Records use consistent terms.",
  "Human approval is required before governed terminology changes.",
  "No CLX editing, glossary mutation, KC write-back, HubSpot write, Selector mutation, or hidden write-back is enabled.",
]);

const RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  vocabularyReferenceOnly: true,
  clxWriteEnabled: false,
  glossaryMutationEnabled: false,
  synonymAutoCorrectionEnabled: false,
  kcWriteEnabled: false,
  lioraAutomationEnabled: false,
  hubSpotWriteEnabled: false,
  selectorMutationEnabled: false,
  boardDataMutationEnabled: false,
  labProofMutationEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenWriteBackEnabled: false,
});

const ROLE_BOUNDARY = Object.freeze([
  "defines preferred terms later",
  "maps aliases later",
  "maps forbidden/retired terms later",
  "maps language risks later",
  "supports Liora routing/recommendations later",
  "does not prove",
  "does not approve",
  "does not mutate data",
  "does not replace Board Data, Lab Proof, code truth, or Module Cards",
]);

const PROPOSED_CANONICAL_TERM_FIELDS = Object.freeze([
  "term_id",
  "canonical_term",
  "aliases",
  "retired_terms",
  "forbidden_terms",
  "definition",
  "domain",
  "module_refs",
  "board_data_refs",
  "lab_proof_refs",
  "kc_refs",
  "controlled_record_refs",
  "rreg_refs",
  "status",
  "source_refs",
  "review_cycle",
  "approved_by",
  "approved_at",
]);

const LANGUAGE_RELATIONSHIP_MAP = Object.freeze([
  "Knowledge Spine orients the language system.",
  "Module Cards describe module boundaries.",
  "KC uses CLX terms but does not override code truth.",
  "Liora may use CLX for safer classification and drafting.",
  "Controlled Records may cite CLX for terminology decisions.",
  "RREG may identify reviewers for terminology changes.",
  "Board Data remains metadata authority.",
  "Lab Proof remains proof authority.",
]);

const FUTURE_DIAGNOSTICS = Object.freeze([
  "terms with no owner",
  "aliases with no canonical term",
  "retired terms still appearing in module copy",
  "terms requiring review",
  "conflicting terms across modules",
  "missing source references",
  "language that overclaims proof or authority",
]);

const GUARDRAILS = Object.freeze({
  postEndpointAdded: false,
  serverEndpointAdded: false,
  dataWriteEnabled: false,
  fileUploadEnabled: false,
  donorClxImportEnabled: false,
  clxEditorEnabled: false,
  glossaryEditorEnabled: false,
  autoCorrectionWorkflowEnabled: false,
  kcWriterEnabled: false,
  lioraWriterEnabled: false,
  hubSpotCallEnabled: false,
  selectorMutationEnabled: false,
  boardDataMutationEnabled: false,
  labProofMutationEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenWriteBackEnabled: false,
  exportButtonEnabled: false,
  sendButtonEnabled: false,
  activeAutomationEnabled: false,
});

function objectEntries(object = {}) {
  return Object.entries(object).map(([label, value]) => [label, String(value)]);
}

function projectTitle(project = {}) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function visibleModules(visibility = {}) {
  return Array.isArray(visibility.visibleModules) ? visibility.visibleModules.join(", ") : "none";
}

function hiddenModules(visibility = {}) {
  return Array.isArray(visibility.hiddenModules) ? visibility.hiddenModules.join(", ") : "none";
}

export function createCanonicalLanguageViewModel({ adapter, canonicalLanguageState }) {
  const snapshots = adapter.readSnapshots();
  const local = canonicalLanguageState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.[MODULE_ID] || null;

  return {
    moduleId: MODULE_ID,
    label: "Canonical Language",
    internalLabel: "Canonical Language / CLX",
    status: "diagnostic",
    group: "Knowledge & Governance",
    routePath: "/workspace?module=canonical_language",
    phase: "clx-canonical-language-read-only-diagnostic-shell",
    local,
    requiredWording: [...REQUIRED_WORDING],
    runtimeStatusFlags: { ...RUNTIME_STATUS_FLAGS },
    diagnosticStatus: { ...RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: objectEntries(RUNTIME_STATUS_FLAGS),
    roleBoundary: [...ROLE_BOUNDARY],
    proposedCanonicalTermFields: [...PROPOSED_CANONICAL_TERM_FIELDS],
    languageRelationshipMap: [...LANGUAGE_RELATIONSHIP_MAP],
    futureDiagnostics: [...FUTURE_DIAGNOSTICS],
    contextRows: [
      ["module_id", MODULE_ID],
      ["module_name", "Canonical Language"],
      ["internal_label", "Canonical Language / CLX"],
      ["route", "/workspace?module=canonical_language"],
      ["status", "diagnostic"],
      ["group", "Knowledge & Governance"],
      ["project", projectTitle(project)],
      ["shell_decision", decision?.reason || "registered-by-shell-diagnostic-slice"],
      ["visible_modules", visibleModules(visibility)],
      ["hidden_modules", hiddenModules(visibility)],
    ],
    guardrails: { ...GUARDRAILS },
    guardrailRows: objectEntries(GUARDRAILS),
  };
}
