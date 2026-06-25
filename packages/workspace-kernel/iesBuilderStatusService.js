export const IES_BUILDER_STATUS_PATH = "/api/ies-builder/status";

const IES_BUILDER_WARNINGS = Object.freeze([
  "IES Builder produces candidate/generated photometry only.",
  "Lab approval is required before any generated output can be treated as approved proof.",
  "Selector mutation and Board Data writes are disabled.",
]);

const SAFE_IES_BUILDER_STATUS = Object.freeze({
  ok: true,
  endpoint: IES_BUILDER_STATUS_PATH,
  owner: "runtime-server",
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

export function buildIesBuilderStatus() {
  return {
    ...SAFE_IES_BUILDER_STATUS,
    warnings: [...IES_BUILDER_WARNINGS],
  };
}
