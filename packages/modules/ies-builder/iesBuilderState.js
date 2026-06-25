const IES_BUILDER_STATUS_ENDPOINT = "/api/ies-builder/status";

const SAFE_FAILURE_FLAGS = Object.freeze({
  endpoint: IES_BUILDER_STATUS_ENDPOINT,
  owner: "runtime-shell",
  moduleId: "ies_builder",
  label: "IES Builder / Photometry",
  readOnly: true,
  diagnosticOnly: true,
  productionProofAuthority: false,
  labApprovalRequired: true,
  selectorMutationEnabled: false,
  boardDataWritesEnabled: false,
  iesGenerationEnabled: false,
  uploadEnabled: false,
  parseEnabled: false,
  exportEnabled: false,
  polarPreviewEnabled: false,
  candidateOutputOnly: true,
  proofClaimsEmitted: false,
  rawIesExposed: false,
  rawLabEvidenceExposed: false,
  rawArtefactsExposed: false,
  rawPdfsExposed: false,
  donorPythonMounted: false,
  largeDependenciesAdded: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  noWritesAttempted: true,
  postEndpointsEnabled: false,
  proofStatus: "not_proof_authority",
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
          message || "IES Builder status endpoint is unavailable; shell is showing the locked diagnostic fallback.",
          "IES Builder will generate candidate photometry only.",
          "Lab approval is required before any output can be treated as proof.",
          "Selector mutation is disabled.",
          "Board Data writes are disabled.",
          "Upload, parse, export, and polar preview are disabled in this first slice.",
          "Raw IES contents are not exposed.",
        ],
      };
      state.loadedAt = new Date().toISOString();
      state.lastAction = "status-failed";
      return this.getSnapshot();
    },
  };
}
