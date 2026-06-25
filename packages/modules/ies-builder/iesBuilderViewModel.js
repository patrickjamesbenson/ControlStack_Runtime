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

function statusRows(status = {}) {
  return [
    ["endpoint", status.endpoint || "/api/ies-builder/status"],
    ["ok", yesNo(status.ok)],
    ["owner", valueOrNone(status.owner)],
    ["moduleId", status.moduleId || "ies_builder"],
    ["label", status.label || "IES Builder / Photometry"],
    ["proofStatus", status.proofStatus || "not_proof_authority"],
  ];
}

function safetyRows(status = {}) {
  return [
    ["readOnly", yesNo(status.readOnly)],
    ["diagnosticOnly", yesNo(status.diagnosticOnly)],
    ["productionProofAuthority", yesNo(status.productionProofAuthority)],
    ["labApprovalRequired", yesNo(status.labApprovalRequired)],
    ["selectorMutationEnabled", yesNo(status.selectorMutationEnabled)],
    ["boardDataWritesEnabled", yesNo(status.boardDataWritesEnabled)],
    ["iesGenerationEnabled", yesNo(status.iesGenerationEnabled)],
    ["uploadEnabled", yesNo(status.uploadEnabled)],
    ["parseEnabled", yesNo(status.parseEnabled)],
    ["exportEnabled", yesNo(status.exportEnabled)],
    ["polarPreviewEnabled", yesNo(status.polarPreviewEnabled)],
    ["candidateOutputOnly", yesNo(status.candidateOutputOnly)],
    ["proofClaimsEmitted", yesNo(status.proofClaimsEmitted)],
    ["rawIesExposed", yesNo(status.rawIesExposed)],
    ["rawLabEvidenceExposed", yesNo(status.rawLabEvidenceExposed)],
    ["rawArtefactsExposed", yesNo(status.rawArtefactsExposed)],
    ["rawPdfsExposed", yesNo(status.rawPdfsExposed)],
    ["donorPythonMounted", yesNo(status.donorPythonMounted)],
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

export function createIesBuilderViewModel({ context, local = {}, status = {} }) {
  return {
    moduleId: "ies_builder",
    label: "IES Builder / Photometry",
    localStatus: local.status || "not-requested",
    loadedAt: local.loadedAt || "none",
    lastAction: local.lastAction || "mounted",
    shellRoute: context?.route?.moduleId || "ies_builder",
    status,
    statusRows: statusRows(status),
    safetyRows: safetyRows(status),
    boundaryRows: boundaryRows(status),
    warnings: Array.isArray(status.warnings) && status.warnings.length
      ? status.warnings
      : [
          "IES Builder will generate candidate photometry only.",
          "Lab approval is required before any output can be treated as proof.",
          "Selector mutation is disabled.",
          "Board Data writes are disabled.",
          "Upload, parse, export, and polar preview are disabled in this first slice.",
          "Raw IES contents are not exposed.",
        ],
  };
}
