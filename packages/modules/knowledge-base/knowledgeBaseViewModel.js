const MODULE_ID = "knowledge_base";

const REQUIRED_WORDING = Object.freeze([
  "Knowledge Base / Knowledge Cards is read-only and diagnostic in this slice.",
  "Knowledge Cards are governed knowledge; they do not create authority.",
  "KC does not override code truth, Board Data, Lab Proof, Module Cards, or Controlled Records.",
  "Human approval is required before governed knowledge updates.",
  "Liora may later draft or recommend knowledge updates, but must not silently approve or publish them.",
  "No KC editing, publishing, approval automation, HubSpot write, CLX mutation, or hidden write-back is enabled.",
]);

const RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  knowledgeReferenceOnly: true,
  kcWriteEnabled: false,
  kcPublishEnabled: false,
  approvalAutomationEnabled: false,
  lioraAutomationEnabled: false,
  clxMutationEnabled: false,
  hubSpotWriteEnabled: false,
  boardDataMutationEnabled: false,
  labProofMutationEnabled: false,
  selectorMutationEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenWriteBackEnabled: false,
});

const ROLE_BOUNDARY = Object.freeze([
  "references governed knowledge",
  "describes concepts later",
  "links to source references later",
  "links to CLX terms later",
  "links to Controlled Records later",
  "does not approve",
  "does not prove",
  "does not publish",
  "does not override code / Board Data / Lab Proof",
]);

const PROPOSED_KNOWLEDGE_CARD_FIELDS = Object.freeze([
  "knowledge_card_id",
  "title",
  "summary",
  "domain",
  "module_refs",
  "canonical_terms",
  "source_refs",
  "evidence_refs",
  "board_data_refs",
  "lab_proof_refs",
  "controlled_record_refs",
  "rreg_refs",
  "status",
  "review_cycle",
  "approved_by",
  "approved_at",
  "supersedes_card_id",
]);

const KNOWLEDGE_RELATIONSHIP_MAP = Object.freeze([
  "Knowledge Spine orients knowledge surfaces.",
  "Module Cards describe module boundaries.",
  "CLX controls vocabulary.",
  "Controlled Records capture update provenance, review, approval, and disposition.",
  "RREG maps reviewers, approvers, owners, and custodians.",
  "Liora may draft or recommend but must not publish.",
  "Board Data remains metadata authority.",
  "Lab Proof remains proof authority.",
  "Git/code remains code truth.",
]);

const FUTURE_DIAGNOSTICS = Object.freeze([
  "cards with no owner",
  "cards with stale review cycle",
  "cards with missing source references",
  "cards using retired CLX terms",
  "cards making proof claims without Lab Proof",
  "cards conflicting with Module Cards",
  "cards that need Controlled Record approval trail",
]);

const GUARDRAILS = Object.freeze({
  postEndpointAdded: false,
  serverEndpointAdded: false,
  dataWriteEnabled: false,
  fileUploadEnabled: false,
  donorKcImportEnabled: false,
  kcEditorEnabled: false,
  publishButtonEnabled: false,
  approvalButtonEnabled: false,
  approvalAutomationEnabled: false,
  lioraWriteBackEnabled: false,
  clxMutationEnabled: false,
  hubSpotCallEnabled: false,
  boardDataMutationEnabled: false,
  labProofMutationEnabled: false,
  selectorMutationEnabled: false,
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

export function createKnowledgeBaseViewModel({ adapter, knowledgeBaseState }) {
  const snapshots = adapter.readSnapshots();
  const local = knowledgeBaseState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.[MODULE_ID] || null;

  return {
    moduleId: MODULE_ID,
    label: "Knowledge Base",
    internalLabel: "Knowledge Base / Knowledge Cards",
    status: "diagnostic",
    group: "Knowledge & Governance",
    routePath: "/workspace?module=knowledge_base",
    phase: "kc-knowledge-base-read-only-diagnostic-shell",
    local,
    requiredWording: [...REQUIRED_WORDING],
    runtimeStatusFlags: { ...RUNTIME_STATUS_FLAGS },
    diagnosticStatus: { ...RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: objectEntries(RUNTIME_STATUS_FLAGS),
    roleBoundary: [...ROLE_BOUNDARY],
    proposedKnowledgeCardFields: [...PROPOSED_KNOWLEDGE_CARD_FIELDS],
    knowledgeRelationshipMap: [...KNOWLEDGE_RELATIONSHIP_MAP],
    futureDiagnostics: [...FUTURE_DIAGNOSTICS],
    contextRows: [
      ["module_id", MODULE_ID],
      ["module_name", "Knowledge Base"],
      ["internal_label", "Knowledge Base / Knowledge Cards"],
      ["route", "/workspace?module=knowledge_base"],
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
