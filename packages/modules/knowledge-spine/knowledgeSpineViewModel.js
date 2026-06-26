const REQUIRED_WORDING = Object.freeze([
  "Knowledge Spine is read-only and diagnostic in this slice.",
  "Module Cards describe runtime/module authority boundaries; they do not create authority.",
  "Knowledge Cards are governed knowledge and must not override code truth, Board Data, or Lab proof.",
  "CLX / canonical language controls vocabulary, but must not override Board Data, Lab proof, or code truth.",
  "Ledger records are evidence/disposition trails, not task lists.",
  "Liora may later classify, route, draft, and recommend, but must not silently approve, write, or overwrite governed truth.",
  "Human approval is required for governed knowledge updates.",
  "Ship Audit is retired in favour of Git, commits, module status, and verification notes.",
  "MAL is shelved as a primary system and may later return only as a derived action view.",
  "CI Inbox is folded into the future Intake Ledger pattern.",
  "Ledger Health is a diagnostic pattern, not a standalone authority module.",
]);

const DIAGNOSTIC_STATUS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  activeAutomationEnabled: false,
  kcWriteEnabled: false,
  clxWriteEnabled: false,
  ledgerWriteEnabled: false,
  lioraAutomationEnabled: false,
  hubSpotWriteEnabled: false,
  repoMapMutationEnabled: false,
  governedTruthMutationEnabled: false,
});

const MODULE_CARD_FIELDS = Object.freeze([
  "module_id",
  "module_name",
  "route",
  "status",
  "maturity_stage",
  "owns",
  "does_not_own",
  "reads_from",
  "writes_to",
  "authority_boundaries",
  "proof_boundaries",
  "upstream_dependencies",
  "downstream_consumers",
  "ledger_interfaces",
  "last_verified_commit",
]);

const KNOWLEDGE_SPINE_COMPONENTS = Object.freeze([
  "Module Cards",
  "Knowledge Cards / KC",
  "CLX / Canonical Language",
  "Controlled Records / Ledger",
  "Ledger Health diagnostics",
  "Liora Cockpit",
  "RREG / Responsibility",
  "Engine Flow",
  "RepoMap",
]);

const DECISIONS = Object.freeze({
  "Keep / rebuild": Object.freeze(["KC", "CLX", "Module Cards", "Controlled Records", "Liora", "RREG", "Engine Flow", "RepoMap"]),
  Shelve: Object.freeze(["MAL as primary system", "CI Inbox as standalone inbox"]),
  Retire: Object.freeze(["Ship Audit"]),
  Reframe: Object.freeze(["Ledger Health as diagnostic pattern"]),
});

const AUTHORITY_BOUNDARIES = Object.freeze([
  "Lab proves.",
  "Board Data defines product/component metadata.",
  "Selector resolves selections.",
  "IES Builder generates candidate outputs.",
  "Compliance maps evidence/risk/review, but does not certify.",
  "EGRES supports emergency workflow, but does not self-certify.",
  "Knowledge Spine does not override those authorities.",
]);

const RELATIONSHIP_ROWS = Object.freeze([
  ["Module Cards", "Describe runtime/module authority boundaries; they do not create authority."],
  ["KC", "Governed knowledge reference; must remain below code truth, Board Data, and Lab proof."],
  ["CLX", "Canonical vocabulary control; must not override Board Data, Lab proof, or code truth."],
  ["Controlled Records / Ledger", "Evidence and disposition trail, not a task list or hidden write-back channel."],
  ["Liora Cockpit", "Future read-only-first intake/recommendation cockpit; may classify, route, draft, and recommend only."],
  ["RREG", "Future responsibility, custody, and approval mapping surface."],
  ["Engine Flow", "Static confidence/process map first, not a production proof engine."],
  ["RepoMap", "Code truth map; mutation remains disabled in this slice."],
]);

function projectTitle(project = {}) {
  return project.metadata?.title || project.currentProject?.title || "No project loaded";
}

function visibleModules(visibility = {}) {
  return Array.isArray(visibility.visibleModules) ? visibility.visibleModules.join(", ") : "none";
}

function hiddenModules(visibility = {}) {
  return Array.isArray(visibility.hiddenModules) ? visibility.hiddenModules.join(", ") : "none";
}

function objectEntries(object = {}) {
  return Object.entries(object).map(([label, value]) => [label, String(value)]);
}

function decisionRows(decisions = DECISIONS) {
  return Object.entries(decisions).map(([label, values]) => [label, values.join(", ")]);
}

export function createKnowledgeSpineViewModel({ adapter, knowledgeSpineState }) {
  const snapshots = adapter.readSnapshots();
  const local = knowledgeSpineState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.knowledge_spine || null;

  return {
    moduleId: adapter.moduleId,
    label: "Knowledge Spine",
    status: "diagnostic",
    group: "Knowledge / Governance",
    routePath: "/workspace?module=knowledge_spine",
    phase: "knowledge-spine-read-only-diagnostic-shell",
    local,
    requiredWording: [...REQUIRED_WORDING],
    diagnosticStatus: { ...DIAGNOSTIC_STATUS },
    diagnosticStatusRows: objectEntries(DIAGNOSTIC_STATUS),
    moduleCardFields: [...MODULE_CARD_FIELDS],
    components: [...KNOWLEDGE_SPINE_COMPONENTS],
    decisions: Object.fromEntries(Object.entries(DECISIONS).map(([label, values]) => [label, [...values]])),
    decisionRows: decisionRows(),
    authorityBoundaries: [...AUTHORITY_BOUNDARIES],
    relationshipRows: RELATIONSHIP_ROWS.map(([label, value]) => [label, value]),
    contextRows: [
      ["module_id", adapter.moduleId],
      ["module_name", "Knowledge Spine"],
      ["route", "/workspace?module=knowledge_spine"],
      ["status", "diagnostic"],
      ["group", "Knowledge / Governance"],
      ["project", projectTitle(project)],
      ["shell_decision", decision?.reason || "registered-by-shell-diagnostic-slice"],
      ["visible_modules", visibleModules(visibility)],
      ["hidden_modules", hiddenModules(visibility)],
    ],
    guardrails: {
      postEndpointAdded: false,
      dataWriteEnabled: false,
      fileUploadEnabled: false,
      donorDataImported: false,
      hubSpotCallEnabled: false,
      webCallEnabled: false,
      lioraAutomationEnabled: false,
      kcEditorEnabled: false,
      clxEditorEnabled: false,
      ledgerRecordWriterEnabled: false,
      approvalWorkflowEnabled: false,
      repoMapMutationEnabled: false,
      exportButtonEnabled: false,
      sendButtonEnabled: false,
      taskCreationEnabled: false,
      hiddenWriteBackEnabled: false,
    },
  };
}
