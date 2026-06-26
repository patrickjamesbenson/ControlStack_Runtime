const MODULE_ID = "controlled_records";

const REQUIRED_WORDING = Object.freeze([
  "Controlled Records / Ledger Blueprint is read-only and diagnostic in this slice.",
  "Controlled records are evidence/disposition trails, not task lists.",
  "The lifecycle is capture, classify, split, route, draft/recommend, human approval where required, disposition, and audit trail.",
  "Lab Ledger is one controlled-record implementation, not the universal ledger.",
  "CI Inbox folds into the future Intake Ledger pattern.",
  "MAL is shelved as a primary system and may later return only as a derived action view.",
  "Ledger Health is a diagnostic pattern, not an auto-fix authority.",
  "Liora may later draft, classify, route, and recommend, but must not silently approve, write, or overwrite governed truth.",
  "No active record writing, intake automation, HubSpot write, KC write, CLX write, or Lab proof mutation is enabled.",
]);

const RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  activeIntakeEnabled: false,
  recordWriteEnabled: false,
  ledgerWriteEnabled: false,
  lioraAutomationEnabled: false,
  kcWriteEnabled: false,
  clxWriteEnabled: false,
  hubSpotWriteEnabled: false,
  labLedgerMutationEnabled: false,
  governedTruthMutationEnabled: false,
  derivedActionViewEnabled: false,
});

const CONTROLLED_RECORD_LIFECYCLE = Object.freeze([
  "capture",
  "classify",
  "split",
  "route",
  "draft/recommend",
  "human approval where required",
  "disposition",
  "audit trail",
]);

const PROPOSED_RECORD_TYPES = Object.freeze([
  "intake",
  "evidence",
  "knowledge_update",
  "clx_update",
  "compliance_risk",
  "egres_package",
  "handoff_custody",
  "module_evidence",
  "derived_action",
]);

const BASE_RECORD_SCHEMA_FIELDS = Object.freeze([
  "record_id",
  "record_type",
  "source_type",
  "source_ref",
  "source_hash",
  "captured_at",
  "captured_by",
  "raw_content_policy",
  "safe_summary",
  "classification",
  "module_or_domain",
  "split_items",
  "route",
  "recommended_action",
  "evidence_refs",
  "kc_refs",
  "clx_refs",
  "repo_refs",
  "web_refs_if_any",
  "human_review_required",
  "human_review_status",
  "disposition",
  "disposition_at",
  "supersedes_record_id",
  "correction_of_record_id",
  "ledger_health_status",
]);

const OLD_CONCEPT_MAPPING = Object.freeze([
  ["CI Inbox", "Intake Ledger / intake records"],
  ["MAL", "derived action view only"],
  ["Ledger Health", "diagnostic checks across record surfaces"],
  ["Lab Ledger", "Lab/evidence-specific controlled record implementation"],
  ["Ship Audit", "retired"],
  ["Liora Cockpit", "future read-only-first intake/recommendation cockpit"],
]);

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

const GUARDRAILS = Object.freeze({
  postEndpointAdded: false,
  serverEndpointAdded: false,
  dataWriteEnabled: false,
  fileUploadEnabled: false,
  activeIntakeQueueEnabled: false,
  liveCiInboxEnabled: false,
  malWriterEnabled: false,
  hubSpotCallEnabled: false,
  lioraAutomationEnabled: false,
  kcEditorEnabled: false,
  clxEditorEnabled: false,
  labLedgerWriterEnabled: false,
  recordWriterEnabled: false,
  approvalWorkflowEnabled: false,
  exportButtonEnabled: false,
  sendButtonEnabled: false,
  hiddenWriteBackEnabled: false,
  donorImportEnabled: false,
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

export function createControlledRecordsViewModel({ adapter, controlledRecordsState }) {
  const snapshots = adapter.readSnapshots();
  const local = controlledRecordsState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.[MODULE_ID] || null;

  return {
    moduleId: MODULE_ID,
    label: "Controlled Records / Ledger",
    status: "diagnostic",
    group: "Knowledge / Governance",
    routePath: "/workspace?module=controlled_records",
    phase: "controlled-records-ledger-blueprint-read-only-diagnostic-shell",
    local,
    requiredWording: [...REQUIRED_WORDING],
    runtimeStatusFlags: { ...RUNTIME_STATUS_FLAGS },
    diagnosticStatus: { ...RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: objectEntries(RUNTIME_STATUS_FLAGS),
    lifecycle: [...CONTROLLED_RECORD_LIFECYCLE],
    proposedRecordTypes: [...PROPOSED_RECORD_TYPES],
    baseRecordSchemaFields: [...BASE_RECORD_SCHEMA_FIELDS],
    oldConceptMappingRows: OLD_CONCEPT_MAPPING.map(([label, value]) => [label, value]),
    ledgerHealthChecks: [...LEDGER_HEALTH_CHECKS],
    contextRows: [
      ["module_id", MODULE_ID],
      ["module_name", "Controlled Records / Ledger"],
      ["route", "/workspace?module=controlled_records"],
      ["status", "diagnostic"],
      ["group", "Knowledge / Governance"],
      ["project", projectTitle(project)],
      ["shell_decision", decision?.reason || "registered-by-shell-diagnostic-slice"],
      ["visible_modules", visibleModules(visibility)],
      ["hidden_modules", hiddenModules(visibility)],
    ],
    guardrails: { ...GUARDRAILS },
    guardrailRows: objectEntries(GUARDRAILS),
    derivedActionPolicy: "Derived action rows must not exist without source records.",
  };
}

