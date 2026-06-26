const MODULE_ID = "engine_flow";

export const ENGINE_FLOW_REQUIRED_WORDING = Object.freeze([
  "Engine Flow is read-only and diagnostic in this slice.",
  "Engine Flow explains the path. It does not execute the path.",
  "Engine Flow is a static confidence/process map.",
  "Engine Flow does not resolve Selector state.",
  "Engine Flow does not fire the engine.",
  "Engine Flow does not generate IES, RunTable, payload, drawings, or Lab proof.",
  "Board Data defines product/component metadata.",
  "Selector resolves selections.",
  "IES Builder produces candidate outputs only.",
  "Lab Proof proves.",
  "Candidate confidence is not proof.",
]);

export const ENGINE_FLOW_RUNTIME_STATUS_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  staticMapOnly: true,
  engineExecutionEnabled: false,
  selectorFiringEnabled: false,
  selectorMutationEnabled: false,
  iesGenerationEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  drawingGenerationEnabled: false,
  labProofAuthority: false,
  boardDataMutationEnabled: false,
  donorRunEngineMounted: false,
  hiddenBackendCallsEnabled: false,
});

const ROLE_BOUNDARY = Object.freeze([
  "Engine Flow explains process.",
  "Engine Flow maps confidence.",
  "Engine Flow maps proof boundaries.",
  "Engine Flow does not execute, mutate, generate, approve, or prove.",
]);

const MANUAL_ENGINEERING_PROCESS_MAP = Object.freeze([
  "interpret product intent",
  "choose possible body / board / LED / optic / driver families",
  "check mechanical fit",
  "check electrical operating window",
  "check photometric target",
  "check environment / compliance constraints",
  "compare viable variants",
  "review warnings",
  "prepare candidate artefacts",
  "require Lab Proof before production claim",
]);

const RUNTIME_CANDIDATE_GENERATION_PROCESS_MAP = Object.freeze([
  "Selector captures product intent",
  "Board Data provides product/component metadata",
  "Selector resolves product/board/IES readiness",
  "IES Builder prepares candidate args",
  "Engine candidate generation is future-gated",
  "RunTable/payload/drawings are future-gated",
  "Lab Proof is the only proof authority",
]);

const CONFIDENCE_LABELS = Object.freeze([
  "draft",
  "code-backed",
  "data-backed",
  "evidence-mapped",
  "candidate-only",
  "lab-proven",
  "unsafe",
]);

const PROOF_BOUNDARY_LABELS = Object.freeze([
  "NOT PROOF",
  "CANDIDATE ONLY",
  "DATA SOURCE",
  "EVIDENCE LINK",
  "LAB PROOF AUTHORITY",
  "FUTURE GATED",
  "DISALLOWED MUTATION",
  "UNSAFE CLAIM",
]);

const ALLOWED_CONSUMERS = Object.freeze([
  "human reviewers",
  "Knowledge Spine",
  "Module Cards",
  "Selector diagnostics",
  "Board Data reference surfaces",
  "IES Builder diagnostics",
  "Lab Proof cross-reference",
  "future Scene Builder preview",
  "future downstream read-only artefact map",
]);

const DISALLOWED_CLAIMS = Object.freeze([
  "Engine Flow proves this",
  "Engine Flow resolved this Selector state",
  "Engine Flow generated this IES",
  "Engine Flow created this RunTable",
  "Engine Flow created this payload",
  "Engine Flow generated drawings",
  "Engine Flow approved production use",
  "Engine Flow overrides Board Data or Lab Proof",
]);

const GUARDRAILS = Object.freeze({
  postEndpointAdded: false,
  serverEndpointAdded: false,
  dataWriteEnabled: false,
  fileUploadEnabled: false,
  runEngineButtonEnabled: false,
  engineApiCallEnabled: false,
  selectorMutationEnabled: false,
  iesGenerationEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  drawingGenerationEnabled: false,
  labProofClaimEnabled: false,
  donorRunEngineUiCopied: false,
  hiddenBackendCallEnabled: false,
  exportButtonEnabled: false,
  downloadButtonEnabled: false,
  sendButtonEnabled: false,
  activeAutomationEnabled: false,
  runtimeDataMutationEnabled: false,
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

export function createEngineFlowViewModel({ adapter, engineFlowState }) {
  const snapshots = adapter.readSnapshots();
  const local = engineFlowState.getSnapshot();
  const project = snapshots.project || {};
  const visibility = snapshots.visibility || {};
  const decision = adapter.getModuleDecision() || visibility.moduleReasons?.[MODULE_ID] || null;

  return {
    moduleId: MODULE_ID,
    label: "Engine Flow",
    status: "diagnostic",
    group: "Knowledge & Governance",
    routePath: "/workspace?module=engine_flow",
    phase: "engine-flow-read-only-static-confidence-process-map-shell",
    local,
    requiredWording: [...ENGINE_FLOW_REQUIRED_WORDING],
    runtimeStatusFlags: { ...ENGINE_FLOW_RUNTIME_STATUS_FLAGS },
    runtimeStatusRows: objectEntries(ENGINE_FLOW_RUNTIME_STATUS_FLAGS),
    roleBoundary: [...ROLE_BOUNDARY],
    manualEngineeringProcessMap: [...MANUAL_ENGINEERING_PROCESS_MAP],
    runtimeCandidateGenerationProcessMap: [...RUNTIME_CANDIDATE_GENERATION_PROCESS_MAP],
    confidenceLabels: [...CONFIDENCE_LABELS],
    proofBoundaryLabels: [...PROOF_BOUNDARY_LABELS],
    allowedConsumers: [...ALLOWED_CONSUMERS],
    disallowedClaims: [...DISALLOWED_CLAIMS],
    contextRows: [
      ["module_id", MODULE_ID],
      ["module_name", "Engine Flow"],
      ["route", "/workspace?module=engine_flow"],
      ["status", "diagnostic"],
      ["group", "Knowledge / Governance"],
      ["project", projectTitle(project)],
      ["shell_decision", decision?.reason || "registered-by-shell-diagnostic-slice"],
      ["visible_modules", visibleModules(visibility)],
      ["hidden_modules", hiddenModules(visibility)],
    ],
    guardrails: { ...GUARDRAILS },
    guardrailRows: objectEntries(GUARDRAILS),
  };
}
