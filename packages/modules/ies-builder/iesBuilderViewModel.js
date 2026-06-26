const STATUS_ENDPOINT = "/api/ies-builder/status";

const REQUIRED_BOUNDARY_STATEMENTS = Object.freeze([
  "IES Builder is read-only and diagnostic in this slice.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
]);

const CANDIDATE_READINESS_BOUNDARY_STATEMENTS = Object.freeze([
  "IES Builder candidate readiness is diagnostic only in this slice.",
  "No IES file is generated, parsed, uploaded, previewed, or exported here.",
  "An IES candidate is not Lab Proof.",
  "Photometric candidate output must not be treated as production proof.",
  "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
]);

const CANDIDATE_READINESS_REQUIREMENTS = Object.freeze([
  "Selector candidate state present",
  "product/body intent resolved",
  "board candidate resolved",
  "optic/diffuser intent resolved",
  "electrical/driver context resolved",
  "photometric template/source identified",
  "Board Data reference present",
  "length/scaling policy identified",
  "emergency/EGRES dependency checked",
  "compliance dependency checked",
  "Lab Proof boundary clearly separated",
  "human review warning surfaced",
]);

const CANDIDATE_STATES = Object.freeze([
  "not ready",
  "missing selector candidate",
  "missing board data reference",
  "missing photometric source",
  "candidate input ready",
  "candidate-only output possible later",
  "requires review",
  "requires Lab Proof before production claim",
]);

const RELATIONSHIP_MAP = Object.freeze([
  { label: "Selector", role: "selection/candidate source" },
  { label: "Board Data", role: "metadata source" },
  { label: "IES Builder", role: "future candidate artefact generator" },
  { label: "Engine Flow", role: "confidence path explanation" },
  { label: "Lab Proof", role: "production proof authority" },
  { label: "Controlled Records", role: "future provenance/review trail" },
]);

const BLOCKED_ACTIONS = Object.freeze([
  "IES upload",
  "upload parsing",
  "IES export",
  "IES generation",
  "Selector mutation",
  "Board Data mutation",
  "Lab proof claim",
  "raw IES exposure",
  "raw Lab evidence exposure",
  "donor Python mounting",
  "donor code mounting",
]);

function yesNo(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  if (value === null || value === undefined) return "unknown";
  return String(value);
}

function valueOrNone(value) {
  if (value === null || value === undefined || value === "") return "none";
  return String(value);
}

function safeList(value, fallback = []) {
  return Array.isArray(value) && value.length ? value : fallback;
}

function flagValue(status, key, fallback, aliases = []) {
  if (Object.prototype.hasOwnProperty.call(status, key)) return status[key];
  for (const alias of aliases) {
    if (Object.prototype.hasOwnProperty.call(status, alias)) return status[alias];
  }
  return fallback;
}

function statusRows(status = {}) {
  return [
    ["endpoint", status.endpoint || STATUS_ENDPOINT],
    ["ok", yesNo(status.ok)],
    ["owner", valueOrNone(status.owner)],
    ["moduleId", status.moduleId || "ies_builder"],
    ["label", status.label || "IES Builder / Photometry"],
    ["proofStatus", status.proofStatus || "not_proof_authority"],
  ];
}

function fixtureParserDiagnosticRows(status = {}) {
  const blockedActions = safeList(status.blockedActions, BLOCKED_ACTIONS).join(", ");

  return [
    ["endpoint", status.endpoint || STATUS_ENDPOINT],
    ["current status summary", status.currentStatusSummary || "IES Builder status unavailable."],
    ["parser capability status", status.parserCapabilityStatus || "unavailable_safe_fallback"],
    ["fixture/sample readiness status", status.fixtureSampleReadinessStatus || "unavailable_safe_fallback"],
    ["candidate-only boundary", status.candidateBoundary || "candidate_only_not_approved_proof"],
    ["proof boundary summary", status.proofBoundarySummary || "Lab Proof remains the boundary for proof authority."],
    ["blocked actions", blockedActions],
  ];
}

function candidateReadinessFlagRows(status = {}) {
  return [
    ["readOnly", yesNo(flagValue(status, "readOnly", true))],
    ["diagnosticOnly", yesNo(flagValue(status, "diagnosticOnly", true))],
    ["candidateReadinessExplanationOnly", yesNo(flagValue(status, "candidateReadinessExplanationOnly", true))],
    ["iesGenerationEnabled", yesNo(flagValue(status, "iesGenerationEnabled", false))],
    ["iesUploadEnabled", yesNo(flagValue(status, "iesUploadEnabled", false, ["uploadEnabled"]))],
    ["iesParseEnabled", yesNo(flagValue(status, "iesParseEnabled", false, ["parseEnabled", "parseUploadEnabled"]))],
    ["iesExportEnabled", yesNo(flagValue(status, "iesExportEnabled", false, ["exportEnabled"]))],
    ["polarPreviewEnabled", yesNo(flagValue(status, "polarPreviewEnabled", false))],
    ["selectorMutationEnabled", yesNo(flagValue(status, "selectorMutationEnabled", false))],
    ["boardDataWriteEnabled", yesNo(flagValue(status, "boardDataWriteEnabled", false, ["boardDataWritesEnabled", "boardDataMutationEnabled"]))],
    ["labProofAuthority", yesNo(flagValue(status, "labProofAuthority", false))],
    ["engineExecutionEnabled", yesNo(flagValue(status, "engineExecutionEnabled", false))],
    ["runTableGenerationEnabled", yesNo(flagValue(status, "runTableGenerationEnabled", false))],
    ["payloadGenerationEnabled", yesNo(flagValue(status, "payloadGenerationEnabled", false))],
    ["drawingGenerationEnabled", yesNo(flagValue(status, "drawingGenerationEnabled", false))],
    ["hiddenWriteBackEnabled", yesNo(flagValue(status, "hiddenWriteBackEnabled", false))],
  ];
}

function safetyRows(status = {}) {
  return [
    ["readOnly", yesNo(status.readOnly)],
    ["diagnosticOnly", yesNo(status.diagnosticOnly)],
    ["candidateOutputOnly", yesNo(status.candidateOutputOnly)],
    ["productionProofAuthority", yesNo(status.productionProofAuthority)],
    ["proofClaimsEmitted", yesNo(status.proofClaimsEmitted)],
    ["uploadEnabled", yesNo(status.uploadEnabled)],
    ["parseUploadEnabled", yesNo(status.parseUploadEnabled)],
    ["exportEnabled", yesNo(status.exportEnabled)],
    ["iesGenerationEnabled", yesNo(status.iesGenerationEnabled)],
    ["selectorMutationEnabled", yesNo(status.selectorMutationEnabled)],
    ["boardDataMutationEnabled", yesNo(status.boardDataMutationEnabled)],
    ["labProofAuthority", yesNo(status.labProofAuthority)],
    ["rawIesExposed", yesNo(status.rawIesExposed)],
    ["rawLabEvidenceExposed", yesNo(status.rawLabEvidenceExposed)],
    ["donorPythonMounted", yesNo(status.donorPythonMounted)],
    ["donorCodeMounted", yesNo(status.donorCodeMounted)],
  ];
}

function lockRows(status = {}) {
  return [
    ["labApprovalRequired", yesNo(status.labApprovalRequired)],
    ["boardDataWritesEnabled", yesNo(status.boardDataWritesEnabled)],
    ["parseEnabled", yesNo(status.parseEnabled)],
    ["polarPreviewEnabled", yesNo(status.polarPreviewEnabled)],
    ["rawArtefactsExposed", yesNo(status.rawArtefactsExposed)],
    ["rawPdfsExposed", yesNo(status.rawPdfsExposed)],
    ["largeDependenciesAdded", yesNo(status.largeDependenciesAdded)],
    ["googleSyncEnabled", yesNo(status.googleSyncEnabled)],
    ["activeSnapshotWriteEnabled", yesNo(status.activeSnapshotWriteEnabled)],
    ["materialisedSnapshotWriteEnabled", yesNo(status.materialisedSnapshotWriteEnabled)],
  ];
}

function boundaryRows(status = {}) {
  return [
    ["noWritesAttempted", yesNo(status.noWritesAttempted)],
    ["postEndpointsEnabled", yesNo(status.postEndpointsEnabled)],
    ["raw IES contents", status.rawIesExposed ? "exposed" : "not exposed"],
    ["Lab proof claim", status.proofClaimsEmitted ? "emitted" : "not emitted"],
    ["candidate authority", status.candidateOutputOnly ? "candidate output only" : "unknown"],
  ];
}

function relationshipRows(relationshipMap = RELATIONSHIP_MAP) {
  return safeList(relationshipMap, RELATIONSHIP_MAP).map((item) => {
    if (typeof item === "string") return [item, "diagnostic relationship"];
    return [item.label || item.system || "unknown", item.role || item.description || "diagnostic relationship"];
  });
}

export function createIesBuilderViewModel({ context, local = {}, status = {} }) {
  const fallbackWarnings = [
    ...CANDIDATE_READINESS_BOUNDARY_STATEMENTS,
    ...REQUIRED_BOUNDARY_STATEMENTS,
  ];

  return {
    moduleId: "ies_builder",
    label: "IES Builder / Photometry",
    localStatus: local.status || "not-requested",
    loadedAt: local.loadedAt || "none",
    lastAction: local.lastAction || "mounted",
    shellRoute: context?.route?.moduleId || "ies_builder",
    status,
    statusRows: statusRows(status),
    fixtureParserDiagnosticRows: fixtureParserDiagnosticRows(status),
    candidateReadinessFlagRows: candidateReadinessFlagRows(status),
    candidateReadinessRequirements: [...safeList(status.candidateReadinessRequirements, CANDIDATE_READINESS_REQUIREMENTS)],
    candidateStates: [...safeList(status.candidateStates, CANDIDATE_STATES)],
    relationshipRows: relationshipRows(status.relationshipMap),
    safetyRows: safetyRows(status),
    lockRows: lockRows(status),
    boundaryRows: boundaryRows(status),
    boundaryStatements: [...CANDIDATE_READINESS_BOUNDARY_STATEMENTS],
    warnings: safeList(status.warnings, fallbackWarnings),
  };
}
