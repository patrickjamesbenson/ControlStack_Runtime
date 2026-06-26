const MODULE_ID = "controlled_records";

const BOUNDARY_COPY = Object.freeze([
  "Controlled Records evidence/provenance mapping is read-only in this slice.",
  "Controlled Records records provenance and disposition; it does not prove.",
  "Controlled Records does not approve, certify, assign authority, or transfer custody.",
  "Lab Proof remains the production proof authority.",
  "RREG maps who should review or approve; it does not approve.",
  "No controlled record is created, mutated, approved, ingested, uploaded, or written here.",
]);

const RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  provenanceMapOnly: true,
  recordCreationEnabled: false,
  recordMutationEnabled: false,
  evidenceIngestionEnabled: false,
  artefactUploadEnabled: false,
  approvalAutomationEnabled: false,
  dispositionWriteEnabled: false,
  labProofAuthority: false,
  rregAuthorityEnabled: false,
  kcWriteEnabled: false,
  clxWriteEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenWriteBackEnabled: false,
});

const FUTURE_CONTROLLED_RECORD_TYPES = Object.freeze([
  "selector_candidate_record",
  "ies_candidate_record",
  "lab_evidence_record",
  "compliance_review_record",
  "rreg_review_assignment_record",
  "approval_disposition_record",
  "provenance_note_record",
  "exception_or_warning_record",
]);

const PROVENANCE_FIELDS = Object.freeze([
  "record_ref",
  "source_module",
  "candidate_ref",
  "artefact_ref",
  "board_data_ref",
  "lab_proof_ref",
  "compliance_ref",
  "rreg_ref",
  "reviewer_ref",
  "approver_ref",
  "custody_ref",
  "status",
  "disposition",
  "created_at",
  "reviewed_at",
  "approved_at",
  "supersedes_ref",
  "audit_trail_ref",
]);

const LIFECYCLE_MAP = Object.freeze([
  "capture",
  "classify",
  "split",
  "route",
  "review",
  "approve or reject",
  "disposition",
  "supersede",
  "audit trail",
]);

const RELATIONSHIP_MAP = Object.freeze([
  ["Selector", "candidate/selection source"],
  ["IES Builder", "candidate artefact source later"],
  ["Lab Proof", "production proof boundary"],
  ["Compliance Matters", "evidence/risk/review map, not certification"],
  ["RREG", "reviewer/approver/custody mapping"],
  ["Controlled Records", "provenance, disposition, and audit trail"],
]);

const LEGACY_DIAGNOSTIC_CONTEXT = Object.freeze([
  "Controlled records are evidence/disposition trails, not task lists.",
  "CI Inbox folds into the future Intake Ledger pattern.",
  "MAL is shelved as a primary system and may later return only as a derived action view.",
  "Ledger Health is a diagnostic pattern, not an auto-fix authority.",
  "Liora may later draft, classify, route, and recommend, but must not silently approve, write, or overwrite governed truth.",
]);

const LEGACY_DIAGNOSTIC_FLAGS = Object.freeze({
  activeIntakeEnabled: false,
  recordWriteEnabled: false,
  ledgerWriteEnabled: false,
  lioraAutomationEnabled: false,
  hubSpotWriteEnabled: false,
  labLedgerMutationEnabled: false,
  governedTruthMutationEnabled: false,
  derivedActionViewEnabled: false,
});

const CONTROLLED_RECORD_GUARDRAILS = Object.freeze({
  postEndpointAdded: false,
  serverEndpointAdded: false,
  dataWriteEnabled: false,
  recordCreationEnabled: false,
  recordMutationEnabled: false,
  evidenceIngestionEnabled: false,
  artefactUploadEnabled: false,
  approvalButtonEnabled: false,
  approvalWorkflowEnabled: false,
  dispositionWriteEnabled: false,
  labProofClaimEnabled: false,
  rregAuthorityClaimEnabled: false,
  kcWriteBackEnabled: false,
  clxWriteBackEnabled: false,
  runtimeDataWriteEnabled: false,
  hiddenBackendCallEnabled: false,
  exportButtonEnabled: false,
  sendButtonEnabled: false,
  activeAutomationEnabled: false,
  donorImportEnabled: false,
});

const LEDGER_HEALTH_CHECKS = Object.freeze([
  "record completeness",
  "provenance present",
  "classification present",
  "route present",
  "disposition present",
  "human approval status",
  "stale records",
  "orphaned records",
  "broken references",
  "forbidden write attempts",
  "unsafe authority claims",
  "raw content exposure risk",
  "derived action without source record",
]);

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

export function createControlledRecordsViewModel({ adapter, controlledRecordsState }) {
  const snapshots = adapter.readSnapshots();
  const local = controlledRecordsState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.[MODULE_ID] || null;

  return {
    moduleId: MODULE_ID,
    label: "Controlled Records / Ledger",
    title: "Controlled Records evidence/provenance link map",
    status: "diagnostic",
    group: "Knowledge / Governance",
    routePath: "/workspace?module=controlled_records",
    phase: "controlled-records-evidence-provenance-link-map-read-only-diagnostic",
    local,
    boundaryCopy: [...BOUNDARY_COPY],
    requiredWording: [...BOUNDARY_COPY],
    runtimeStatusFlags: { ...RUNTIME_STATUS_FLAGS },
    diagnosticStatus: { ...RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: objectEntries(RUNTIME_STATUS_FLAGS),
    futureControlledRecordTypes: [...FUTURE_CONTROLLED_RECORD_TYPES],
    proposedRecordTypes: [...FUTURE_CONTROLLED_RECORD_TYPES],
    provenanceFields: [...PROVENANCE_FIELDS],
    lifecycle: [...LIFECYCLE_MAP],
    lifecycleMap: [...LIFECYCLE_MAP],
    relationshipMapRows: RELATIONSHIP_MAP.map(([label, value]) => [label, value]),
    legacyDiagnosticContext: [...LEGACY_DIAGNOSTIC_CONTEXT],
    legacyDiagnosticFlags: { ...LEGACY_DIAGNOSTIC_FLAGS },
    legacyDiagnosticFlagRows: objectEntries(LEGACY_DIAGNOSTIC_FLAGS),
    ledgerHealthChecks: [...LEDGER_HEALTH_CHECKS],
    contextRows: [
      ["module_id", MODULE_ID],
      ["module_name", "Controlled Records / Ledger"],
      ["route", "/workspace?module=controlled_records"],
      ["status", "diagnostic"],
      ["phase", "controlled-records-evidence-provenance-link-map-read-only-diagnostic"],
      ["group", "Knowledge / Governance"],
      ["project", projectTitle(project)],
      ["shell_decision", decision?.reason || "registered-by-shell-diagnostic-slice"],
      ["visible_modules", visibleModules(visibility)],
      ["hidden_modules", hiddenModules(visibility)],
    ],
    guardrails: { ...CONTROLLED_RECORD_GUARDRAILS },
    guardrailRows: objectEntries(CONTROLLED_RECORD_GUARDRAILS),
    derivedActionPolicy: "Future derived action rows must not exist without source records and provenance links.",
  };
}
