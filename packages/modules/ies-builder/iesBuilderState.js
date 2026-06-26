const IES_BUILDER_STATUS_ENDPOINT = "/api/ies-builder/status";

const SAFE_FAILURE_WARNINGS = Object.freeze([
  "IES Builder candidate readiness is diagnostic only in this slice.",
  "No IES file is generated, parsed, uploaded, previewed, or exported here.",
  "An IES candidate is not Lab Proof.",
  "Photometric candidate output must not be treated as production proof.",
  "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
  "IES Builder is read-only and diagnostic in this slice.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
]);

const SAFE_CANDIDATE_READINESS_REQUIREMENTS = Object.freeze([
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

const SAFE_CANDIDATE_STATES = Object.freeze([
  "not ready",
  "missing selector candidate",
  "missing board data reference",
  "missing photometric source",
  "candidate input ready",
  "candidate-only output possible later",
  "requires review",
  "requires Lab Proof before production claim",
]);

const SAFE_RELATIONSHIP_MAP = Object.freeze([
  { label: "Selector", role: "selection/candidate source" },
  { label: "Board Data", role: "metadata source" },
  { label: "IES Builder", role: "future candidate artefact generator" },
  { label: "Engine Flow", role: "confidence path explanation" },
  { label: "Lab Proof", role: "production proof authority" },
  { label: "Controlled Records", role: "future provenance/review trail" },
]);

const SAFE_FAILURE_FLAGS = Object.freeze({
  endpoint: IES_BUILDER_STATUS_ENDPOINT,
  owner: "runtime-shell",
  moduleId: "ies_builder",
  label: "IES Builder / Photometry",
  readOnly: true,
  diagnosticOnly: true,
  candidateReadinessExplanationOnly: true,
  candidateOutputOnly: true,
  productionProofAuthority: false,
  labApprovalRequired: true,
  labProofAuthority: false,
  selectorMutationEnabled: false,
  boardDataWriteEnabled: false,
  boardDataWritesEnabled: false,
  boardDataMutationEnabled: false,
  iesGenerationEnabled: false,
  iesUploadEnabled: false,
  uploadEnabled: false,
  iesParseEnabled: false,
  parseEnabled: false,
  parseUploadEnabled: false,
  iesExportEnabled: false,
  exportEnabled: false,
  polarPreviewEnabled: false,
  engineExecutionEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  drawingGenerationEnabled: false,
  hiddenWriteBackEnabled: false,
  proofClaimsEmitted: false,
  rawIesExposed: false,
  rawLabEvidenceExposed: false,
  rawArtefactsExposed: false,
  rawPdfsExposed: false,
  donorPythonMounted: false,
  donorCodeMounted: false,
  largeDependenciesAdded: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  noWritesAttempted: true,
  postEndpointsEnabled: false,
  proofStatus: "not_proof_authority",
  currentStatusSummary: "IES Builder status unavailable.",
  parserCapabilityStatus: "unavailable_safe_fallback",
  fixtureSampleReadinessStatus: "unavailable_safe_fallback",
  candidateBoundary: "candidate_only_not_approved_proof",
  proofBoundarySummary: "Lab Proof remains the boundary for proof authority.",
  candidateReadinessRequirements: [...SAFE_CANDIDATE_READINESS_REQUIREMENTS],
  candidateStates: [...SAFE_CANDIDATE_STATES],
  relationshipMap: [...SAFE_RELATIONSHIP_MAP],
  blockedActions: [
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
  ],
});

export function createIesBuilderState() {
  const state = {
    status: "not-requested",
    statusPayload: null,
    loadedAt: null,
    lastAction: "mounted",
  };

  return {
    getSnapshot() {
      return { ...state };
    },

    setLoading() {
      state.status = "loading";
      state.lastAction = "status-loading";
      return this.getSnapshot();
    },

    setStatusPayload(payload) {
      state.status = payload?.ok === false ? "warning" : "ready";
      state.statusPayload = payload || null;
      state.loadedAt = new Date().toISOString();
      state.lastAction = "status-loaded";
      return this.getSnapshot();
    },

    setFailure(message) {
      state.status = "fetch-failed";
      state.statusPayload = {
        ok: false,
        ...SAFE_FAILURE_FLAGS,
        warnings: [
          message || "IES Builder status unavailable.",
          ...SAFE_FAILURE_WARNINGS,
        ],
      };
      state.loadedAt = new Date().toISOString();
      state.lastAction = "status-failed";
      return this.getSnapshot();
    },
  };
}
