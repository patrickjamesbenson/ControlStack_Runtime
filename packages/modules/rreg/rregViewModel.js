const MODULE_ID = "rreg";

const BOUNDARY_COPY = Object.freeze([
  "RREG review responsibility mapping is read-only in this slice.",
  "RREG maps responsibility; it does not grant authority.",
  "RREG maps custody; it does not transfer custody.",
  "RREG maps reviewers and approvers; it does not approve.",
  "Controlled Records records provenance and disposition.",
  "Lab Proof remains the production proof authority.",
  "No people assignment, permission control, approval automation, custody transfer, controlled-record write, or hidden write-back is enabled.",
]);

const REQUIRED_WORDING = BOUNDARY_COPY;

const RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  reviewResponsibilityMapOnly: true,
  peopleAssignmentEnabled: false,
  permissionControlEnabled: false,
  approvalAutomationEnabled: false,
  custodyTransferEnabled: false,
  activeRoutingEnabled: false,
  controlledRecordWriteEnabled: false,
  labProofAuthority: false,
  evidenceIngestionEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenWriteBackEnabled: false,
});

const LEGACY_COMPATIBILITY_FLAGS = Object.freeze({
  responsibilityMappingOnly: true,
  permissionEnforcementEnabled: false,
  seedScriptEnabled: false,
  kcWriteEnabled: false,
  clxWriteEnabled: false,
  ledgerWriteEnabled: false,
  hubSpotWriteEnabled: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  labProofMutationEnabled: false,
});

const ROLE_BOUNDARY = Object.freeze([
  "maps responsibility",
  "maps custody",
  "maps reviewers",
  "maps approvers",
  "maps evidence obligations",
  "maps controlled-record obligations",
  "does not grant authority",
  "does not approve",
  "does not transfer custody",
  "does not enforce permissions",
]);

const RESPONSIBILITY_MAPPING_CATEGORIES = Object.freeze([
  "responsible_owner",
  "backup_owner",
  "technical_reviewer",
  "evidence_reviewer",
  "compliance_reviewer",
  "lab_reviewer",
  "approval_recommender",
  "human_approver",
  "custody_holder",
  "escalation_contact",
]);

const LEGACY_RESPONSIBILITY_CONCEPTS = Object.freeze([
  "owner",
  "backup owner",
  "maintainer",
  "reviewer",
  "approver",
  "custodian",
  "evidence owner",
  "ledger obligation owner",
]);

const LEGACY_CUSTODY_CONCEPTS = Object.freeze([
  "no custody",
  "proposed custody",
  "active custody",
  "custody in handoff",
  "transferred custody",
  "retired custody",
]);

const LEGACY_APPROVAL_MAPPING_CONCEPTS = Object.freeze([
  "review recommended",
  "review required",
  "approval required",
  "final human approval required",
  "blocked pending evidence",
  "blocked pending controlled record",
]);

const LEGACY_PROPOSED_RESPONSIBILITY_SCHEMA_FIELDS = Object.freeze([
  "responsibility_id",
  "domain",
  "component",
  "role",
  "owner_ref",
  "backup_owner_ref",
  "custody_state",
  "authority_level",
  "decision_rights",
  "approval_required_for",
  "evidence_obligations",
  "ledger_obligations",
  "handoff_conditions",
  "handoff_record_refs",
  "active_from",
  "active_until",
  "status",
  "source_refs",
  "review_cycle",
]);

const REVIEW_CUSTODY_FIELDS = Object.freeze([
  "responsibility_ref",
  "controlled_record_ref",
  "candidate_ref",
  "artefact_ref",
  "evidence_ref",
  "review_domain",
  "reviewer_role",
  "approver_role",
  "custody_role",
  "backup_role",
  "review_status",
  "approval_required",
  "approval_status",
  "custody_status",
  "escalation_condition",
]);

const REVIEW_PATH_MAP = Object.freeze([
  "candidate identified",
  "evidence expected",
  "controlled record created later",
  "reviewer role mapped",
  "approver role mapped",
  "custody role mapped",
  "human review required",
  "approval disposition recorded later",
  "custody transfer not performed by RREG",
]);

const RELATIONSHIP_MAP = Object.freeze([
  "Controlled Records: provenance/disposition/audit trail",
  "RREG: responsibility/reviewer/approver/custody mapping",
  "Lab Proof: production proof boundary",
  "Compliance Matters: evidence/risk/review map, not certification",
  "Selector: candidate/selection source",
  "IES Builder: candidate artefact source later",
  "Liora: future draft/recommendation/intake helper only, no approval",
]);

const FUTURE_DIAGNOSTICS = Object.freeze([
  "records with no responsibility role mapped",
  "candidate artefacts with no reviewer role mapped",
  "approval-required records with no human approver role mapped",
  "evidence references with no evidence reviewer role mapped",
  "custody references with no custody holder role mapped",
  "escalation conditions without escalation contact roles",
  "review domains missing controlled-record references",
]);

const GUARDRAILS = Object.freeze({
  postEndpointAdded: false,
  serverEndpointAdded: false,
  dataWriteEnabled: false,
  fileUploadEnabled: false,
  donorRregImportEnabled: false,
  seedScriptExecutionEnabled: false,
  peopleAssignmentUiEnabled: false,
  clusterAssignmentUiEnabled: false,
  assignControlsEnabled: false,
  manifestEditorEnabled: false,
  custodyTransferActionEnabled: false,
  activeRoutingEnabled: false,
  controlledRecordWriteEnabled: false,
  evidenceIngestionEnabled: false,
  approvalButtonEnabled: false,
  approvalAutomationEnabled: false,
  permissionControlEnabled: false,
  permissionEnforcementEnabled: false,
  labProofAuthority: false,
  kcEditorEnabled: false,
  clxEditorEnabled: false,
  hubSpotCallEnabled: false,
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

export function createRregViewModel({ adapter, rregState }) {
  const snapshots = adapter.readSnapshots();
  const local = rregState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.[MODULE_ID] || null;
  const diagnosticStatus = {
    ...RUNTIME_STATUS_FLAGS,
    ...LEGACY_COMPATIBILITY_FLAGS,
  };

  return {
    moduleId: MODULE_ID,
    label: "Roles & Responsibilities",
    internalLabel: "RREG / Responsibility Registry",
    status: "diagnostic",
    group: "Knowledge & Governance",
    routePath: "/workspace?module=rreg",
    phase: "rreg-evidence-review-responsibility-map-read-only-diagnostic",
    local,
    requiredWording: [...REQUIRED_WORDING],
    boundaryCopy: [...BOUNDARY_COPY],
    runtimeStatusFlags: { ...RUNTIME_STATUS_FLAGS },
    diagnosticStatus,
    runtimeStatusRows: objectEntries(RUNTIME_STATUS_FLAGS),
    roleBoundary: [...ROLE_BOUNDARY],
    responsibilityMappingCategories: [...RESPONSIBILITY_MAPPING_CATEGORIES],
    reviewCustodyFields: [...REVIEW_CUSTODY_FIELDS],
    reviewPathMap: [...REVIEW_PATH_MAP],
    responsibilityConcepts: [...LEGACY_RESPONSIBILITY_CONCEPTS],
    custodyConcepts: [...LEGACY_CUSTODY_CONCEPTS],
    approvalMappingConcepts: [...LEGACY_APPROVAL_MAPPING_CONCEPTS],
    proposedResponsibilitySchemaFields: [...LEGACY_PROPOSED_RESPONSIBILITY_SCHEMA_FIELDS],
    relationshipMap: [...RELATIONSHIP_MAP],
    futureDiagnostics: [...FUTURE_DIAGNOSTICS],
    contextRows: [
      ["module_id", MODULE_ID],
      ["module_name", "Roles & Responsibilities"],
      ["internal_label", "RREG / Responsibility Registry"],
      ["route", "/workspace?module=rreg"],
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
