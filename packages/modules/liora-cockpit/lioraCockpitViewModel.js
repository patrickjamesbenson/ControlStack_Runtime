const MODULE_ID = "liora_cockpit";

const REQUIRED_WORDING = Object.freeze([
  "Liora Cockpit is read-only and diagnostic in this slice.",
  "Liora may later classify, route, draft, and recommend.",
  "Liora does not silently approve, write, overwrite, merge, close, or publish governed truth.",
  "Liora does not update HubSpot, KC, CLX, Board Data, Lab Proof, Selector, IES Builder, Controlled Records, RREG, or runtime data.",
  "Liora is an orchestration cockpit, not a hidden central authority.",
  "Human approval is required before governed updates.",
  "Controlled Records provide the intake/disposition/audit trail.",
  "RREG maps responsibility, custody, and approval routing; it does not approve.",
]);

const RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  activeMessageIngestionEnabled: false,
  chatAgentEnabled: false,
  draftCreationEnabled: false,
  sendEnabled: false,
  hubSpotReadEnabled: false,
  hubSpotWriteEnabled: false,
  kcWriteEnabled: false,
  clxWriteEnabled: false,
  ledgerWriteEnabled: false,
  controlledRecordWriteEnabled: false,
  rregWriteEnabled: false,
  boardDataWriteEnabled: false,
  selectorMutationEnabled: false,
  labProofMutationEnabled: false,
  iesGenerationEnabled: false,
  governedTruthMutationEnabled: false,
  hiddenWriteBackEnabled: false,
});

const ROLE_BOUNDARY = Object.freeze([
  "captures later",
  "classifies later",
  "routes later",
  "drafts later",
  "recommends later",
  "does not approve",
  "does not write",
  "does not overwrite",
  "does not send",
  "does not publish",
  "does not replace human review",
]);

const INTAKE_LIFECYCLE = Object.freeze([
  "receive/capture",
  "safe summary",
  "classify",
  "split into items",
  "route using Controlled Records and RREG",
  "draft/recommend",
  "require human approval",
  "disposition",
  "audit trail",
]);

const PROVENANCE_MODEL = Object.freeze([
  "source reference",
  "safe summary",
  "Knowledge Spine references",
  "KC references",
  "CLX references",
  "Controlled Record references",
  "RREG routing references",
  "module references",
  "web references only if allowed later",
  "confidence boundary",
  "human approval status",
]);

const RELATIONSHIP_MAP = Object.freeze([
  ["Knowledge Spine", "Knowledge Spine provides governance orientation."],
  ["Module Cards", "Module Cards describe module boundaries."],
  ["Controlled Records", "Controlled Records provide intake, disposition, and audit trail."],
  ["RREG", "RREG maps who should review, approve, or hold custody."],
  ["KC", "KC provides governed knowledge."],
  ["CLX", "CLX provides controlled vocabulary."],
  ["HubSpot", "HubSpot may later provide CRM/project context safely."],
  ["Liora", "Liora does not replace any of those authorities."],
]);

const FUTURE_ALLOWED_ACTIONS = Object.freeze([
  "classify intake",
  "suggest route",
  "suggest reviewer",
  "suggest approver",
  "draft answer",
  "draft knowledge update",
  "draft controlled record",
  "draft handoff note",
]);

const FORBIDDEN_ACTIONS = Object.freeze([
  "silent KC update",
  "silent CLX update",
  "silent HubSpot update",
  "silent customer message",
  "automatic approval",
  "automatic custody transfer",
  "Selector mutation",
  "Board Data mutation",
  "Lab Proof mutation",
  "IES generation",
  "hidden write-back",
  "replacing Git/code truth",
]);

const GUARDRAILS = Object.freeze({
  postEndpointAdded: false,
  serverEndpointAdded: false,
  dataWriteEnabled: false,
  fileUploadEnabled: false,
  messageIngestionEnabled: false,
  chatInputEnabled: false,
  sendButtonEnabled: false,
  draftCreationEnabled: false,
  hubSpotCallEnabled: false,
  gmailCallEnabled: false,
  kcEditorEnabled: false,
  clxEditorEnabled: false,
  controlledRecordWriterEnabled: false,
  rregWriterEnabled: false,
  approvalButtonEnabled: false,
  selectorMutationEnabled: false,
  boardDataMutationEnabled: false,
  labProofMutationEnabled: false,
  iesGenerationEnabled: false,
  donorImportEnabled: false,
  activeAutomationEnabled: false,
  hiddenBackendCallEnabled: false,
  hiddenWriteBackEnabled: false,
});

function objectEntries(object = {}) {
  return Object.entries(object).map(([label, value]) => [label, String(value)]);
}

function disabledActionRows(actions = []) {
  return actions.map((action) => [action, "disabled in this slice"]);
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

export function createLioraCockpitViewModel({ adapter, lioraCockpitState }) {
  const snapshots = adapter.readSnapshots();
  const local = lioraCockpitState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.[MODULE_ID] || null;

  return {
    moduleId: MODULE_ID,
    label: "Liora Cockpit",
    status: "diagnostic",
    group: "Knowledge & Governance",
    routePath: "/workspace?module=liora_cockpit",
    phase: "liora-live-cockpit-read-only-diagnostic-shell",
    local,
    requiredWording: [...REQUIRED_WORDING],
    runtimeStatusFlags: { ...RUNTIME_STATUS_FLAGS },
    diagnosticStatus: { ...RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: objectEntries(RUNTIME_STATUS_FLAGS),
    roleBoundary: [...ROLE_BOUNDARY],
    intakeLifecycle: [...INTAKE_LIFECYCLE],
    provenanceModel: [...PROVENANCE_MODEL],
    relationshipRows: RELATIONSHIP_MAP.map(([label, value]) => [label, value]),
    futureAllowedActions: [...FUTURE_ALLOWED_ACTIONS],
    futureAllowedActionRows: disabledActionRows(FUTURE_ALLOWED_ACTIONS),
    forbiddenActions: [...FORBIDDEN_ACTIONS],
    contextRows: [
      ["module_id", MODULE_ID],
      ["module_name", "Liora Cockpit"],
      ["route", "/workspace?module=liora_cockpit"],
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
