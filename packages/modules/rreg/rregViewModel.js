const MODULE_ID = "rreg";

const REQUIRED_WORDING = Object.freeze([
  "Roles & Responsibilities / RREG is read-only and diagnostic in this slice.",
  "RREG maps responsibility; it does not create authority.",
  "RREG maps custody; it does not transfer custody.",
  "RREG maps reviewers and approvers; it does not approve.",
  "RREG may identify who should review or approve a change, but human approval remains explicit.",
  "RREG does not grant write power.",
  "RREG does not silently update KC, CLX, HubSpot, Board Data, Lab Proof, Selector, IES Builder, ledgers, or runtime data.",
  "Old donor RREG seed scripts are not run in runtime.",
  "Responsibility does not equal permission.",
]);

const RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  responsibilityMappingOnly: true,
  custodyTransferEnabled: false,
  approvalAutomationEnabled: false,
  permissionEnforcementEnabled: false,
  peopleAssignmentEnabled: false,
  seedScriptEnabled: false,
  kcWriteEnabled: false,
  clxWriteEnabled: false,
  ledgerWriteEnabled: false,
  hubSpotWriteEnabled: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  labProofMutationEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenWriteBackEnabled: false,
});

const ROLE_BOUNDARY = Object.freeze([
  "maps responsibility",
  "maps custody",
  "maps reviewers",
  "maps approvers",
  "maps evidence obligations",
  "maps ledger obligations",
  "does not grant authority",
  "does not approve",
  "does not transfer custody",
  "does not enforce permissions",
]);

const RESPONSIBILITY_CONCEPTS = Object.freeze([
  "owner",
  "backup owner",
  "maintainer",
  "reviewer",
  "approver",
  "custodian",
  "evidence owner",
  "ledger obligation owner",
]);

const CUSTODY_CONCEPTS = Object.freeze([
  "no custody",
  "proposed custody",
  "active custody",
  "custody in handoff",
  "transferred custody",
  "retired custody",
]);

const APPROVAL_MAPPING_CONCEPTS = Object.freeze([
  "review recommended",
  "review required",
  "approval required",
  "final human approval required",
  "blocked pending evidence",
  "blocked pending controlled record",
]);

const PROPOSED_RESPONSIBILITY_SCHEMA_FIELDS = Object.freeze([
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

const RELATIONSHIP_MAP = Object.freeze([
  "Module Cards describe module boundaries.",
  "Knowledge Spine orients governance surfaces.",
  "Controlled Records prove decisions, evidence, disposition, and approval events.",
  "Liora may later use RREG for routing suggestions only.",
  "Handoff records prove custody movement.",
  "Admin / Dev may show responsibility gaps, but RREG does not unlock admin actions.",
]);

const FUTURE_DIAGNOSTICS = Object.freeze([
  "modules with no owner mapped",
  "records with no custodian mapped",
  "terms with no reviewer mapped",
  "approval-required changes with no approver mapped",
  "stale review cycles",
  "missing source refs",
  "handoff conditions without handoff records",
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
  approvalButtonEnabled: false,
  permissionEnforcementEnabled: false,
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

  return {
    moduleId: MODULE_ID,
    label: "Roles & Responsibilities",
    internalLabel: "RREG / Responsibility Registry",
    status: "diagnostic",
    group: "Knowledge & Governance",
    routePath: "/workspace?module=rreg",
    phase: "rreg-responsibility-registry-read-only-diagnostic-shell",
    local,
    requiredWording: [...REQUIRED_WORDING],
    runtimeStatusFlags: { ...RUNTIME_STATUS_FLAGS },
    diagnosticStatus: { ...RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: objectEntries(RUNTIME_STATUS_FLAGS),
    roleBoundary: [...ROLE_BOUNDARY],
    responsibilityConcepts: [...RESPONSIBILITY_CONCEPTS],
    custodyConcepts: [...CUSTODY_CONCEPTS],
    approvalMappingConcepts: [...APPROVAL_MAPPING_CONCEPTS],
    proposedResponsibilitySchemaFields: [...PROPOSED_RESPONSIBILITY_SCHEMA_FIELDS],
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
