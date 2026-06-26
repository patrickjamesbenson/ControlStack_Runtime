export const IES_BUILDER_STATUS_PATH = "/api/ies-builder/status";

const IES_BUILDER_WARNINGS = Object.freeze([
  "IES Builder is read-only and diagnostic in this slice.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
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

const SAFE_IES_BUILDER_STATUS = Object.freeze({
  ok: true,
  endpoint: IES_BUILDER_STATUS_PATH,
  owner: "runtime-server",
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
  currentStatusSummary: "Read-only fixture/parser diagnostics are available from safe runtime metadata only.",
  parserCapabilityStatus: "safe_summary_only_no_raw_ies",
  fixtureSampleReadinessStatus: "metadata_only_no_upload_enabled",
  candidateBoundary: "candidate_only_not_approved_proof",
  proofBoundarySummary: "Lab Proof remains the boundary for proof authority.",
});

export function buildIesBuilderStatus() {
  return {
    ...SAFE_IES_BUILDER_STATUS,
    blockedActions: [...BLOCKED_ACTIONS],
    warnings: [...IES_BUILDER_WARNINGS],
  };
}
