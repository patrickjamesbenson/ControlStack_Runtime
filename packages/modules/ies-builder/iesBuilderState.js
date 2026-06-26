const IES_BUILDER_STATUS_ENDPOINT = "/api/ies-builder/status";

const SAFE_FAILURE_WARNINGS = Object.freeze([
  "IES Builder is read-only and diagnostic in this slice.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
]);

const SAFE_FAILURE_FLAGS = Object.freeze({
  endpoint: IES_BUILDER_STATUS_ENDPOINT,
  owner: "runtime-shell",
  moduleId: "ies_builder",
  label: "IES Builder / Photometry",
  readOnly: true,
  diagnosticOnly: true,
  candidateOutputOnly: true,
  productionProofAuthority: false,
  labApprovalRequired: true,
  labProofAuthority: false,
  selectorMutationEnabled: false,
  boardDataWritesEnabled: false,
  boardDataMutationEnabled: false,
  iesGenerationEnabled: false,
  uploadEnabled: false,
  parseEnabled: false,
  parseUploadEnabled: false,
  exportEnabled: false,
  polarPreviewEnabled: false,
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
