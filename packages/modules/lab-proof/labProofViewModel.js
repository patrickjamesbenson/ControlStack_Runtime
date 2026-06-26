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

const PROOF_READINESS_CATEGORIES = Object.freeze([
  "no evidence mapped",
  "candidate evidence expected",
  "evidence mapped but unreviewed",
  "evidence review required",
  "lab approval required",
  "production proof not established",
  "production proof future-gated",
]);

const EVIDENCE_BOUNDARY_FIELDS = Object.freeze([
  "candidate_ref",
  "product_ref",
  "board_data_ref",
  "ies_candidate_ref",
  "test_method_ref",
  "lab_result_ref",
  "evidence_summary",
  "evidence_status",
  "reviewer_ref",
  "approval_status",
  "controlled_record_ref",
  "proof_boundary",
  "production_claim_allowed",
]);

const BOUNDARY_COPY = Object.freeze([
  "Lab Proof readiness is diagnostic only in this slice.",
  "This module does not provide production proof authority in this slice.",
  "No evidence is uploaded, parsed, exposed, approved, or certified here.",
  "Candidate compatibility, Board Data metadata, and IES candidates are not proof.",
  "Lab Proof is the production proof authority once an approved Lab authority contract exists.",
]);

const RELATIONSHIP_MAP_ROWS = Object.freeze([
  ["Selector", "candidate/selection source"],
  ["Board Data", "metadata source"],
  ["IES Builder", "candidate photometric artefact source later"],
  ["Compliance Matters", "risk/review mapping, not certification"],
  ["Controlled Records", "provenance/approval/disposition trail later"],
  ["RREG", "reviewer/approver/custody mapping later"],
  ["Lab Proof", "production proof boundary"],
]);

function tableRows(summary = {}) {
  const tables = Array.isArray(summary?.tables) ? summary.tables : [];
  if (!tables.length) return [["tables", "none detected or unavailable"]];
  return tables.map((table) => [
    table.table || "unknown",
    `${table.present ? `${table.count ?? 0} metadata rows` : "not present"}; rawRowsExposed:false; rawHeadersExposed:false`,
  ]);
}

function statusRows(status = {}) {
  return [
    ["endpoint", status.endpoint || "/api/lab-proof/status"],
    ["ok", yesNo(status.ok)],
    ["owner", valueOrNone(status.owner)],
    ["moduleId", status.moduleId || "lab_proof"],
    ["label", status.label || "Lab Proof"],
    ["proofStatus", status.proofStatus || "metadata_only"],
  ];
}

function runtimeStatusFlagRows(status = {}) {
  return [
    ["readOnly", yesNo(status.readOnly)],
    ["diagnosticOnly", yesNo(status.diagnosticOnly)],
    ["proofReadinessExplanationOnly", yesNo(status.proofReadinessExplanationOnly)],
    ["productionProofAuthority", yesNo(status.productionProofAuthority)],
    ["labApprovalEnabled", yesNo(status.labApprovalEnabled)],
    ["evidenceUploadEnabled", yesNo(status.evidenceUploadEnabled)],
    ["evidenceIngestionEnabled", yesNo(status.evidenceIngestionEnabled)],
    ["pdfExposureEnabled", yesNo(status.pdfExposureEnabled)],
    ["rawArtefactExposureEnabled", yesNo(status.rawArtefactExposureEnabled)],
    ["selectorMutationEnabled", yesNo(status.selectorMutationEnabled)],
    ["boardDataWriteEnabled", yesNo(status.boardDataWriteEnabled)],
    ["iesGenerationEnabled", yesNo(status.iesGenerationEnabled)],
    ["complianceCertificationEnabled", yesNo(status.complianceCertificationEnabled)],
    ["hiddenWriteBackEnabled", yesNo(status.hiddenWriteBackEnabled)],
  ];
}

function boundaryRows(status = {}) {
  return [
    ...runtimeStatusFlagRows(status),
    ["proofClaimsEmitted", yesNo(status.proofClaimsEmitted)],
    ["rawLabEvidenceExposed", yesNo(status.rawLabEvidenceExposed)],
    ["rawArtefactsExposed", yesNo(status.rawArtefactsExposed)],
    ["rawLedgerExposed", yesNo(status.rawLedgerExposed)],
    ["rawPdfsExposed", yesNo(status.rawPdfsExposed)],
    ["rawIesExposed", yesNo(status.rawIesExposed)],
    ["postEndpointsEnabled", yesNo(status.postEndpointsEnabled)],
    ["uploadEnabled", yesNo(status.uploadEnabled)],
    ["exportEnabled", yesNo(status.exportEnabled)],
    ["localStorageWritesEnabled", yesNo(status.localStorageWritesEnabled)],
  ];
}

function healthRows(status = {}) {
  const health = status.healthSummary || {};
  const source = health.source || {};
  return [
    ["source configured", yesNo(source.configured)],
    ["source present", yesNo(source.present)],
    ["source readable", yesNo(source.readable)],
    ["source parseable", yesNo(source.parseable)],
    ["source modifiedTime", valueOrNone(source.modifiedTime)],
    ["source fileSize", source.fileSize === null || source.fileSize === undefined ? "none" : `${source.fileSize} bytes`],
    ["noWritesAttempted", yesNo(health.noWritesAttempted)],
    ["selectorMutations", yesNo(health.selectorMutations)],
    ["boardDataWrites", yesNo(health.boardDataWrites)],
    ["iesGeneration", yesNo(health.iesGeneration)],
    ["engineResultsEmitted", yesNo(health.engineResultsEmitted)],
  ];
}

function equipmentRows(status = {}) {
  const summary = status.equipmentSummary || {};
  return [
    ["diagnosticOnly", yesNo(summary.diagnosticOnly)],
    ["proofStatus", summary.proofStatus || "metadata_only"],
    ["totalRows", summary.totalRows ?? 0],
    ["rawRowsExposed", yesNo(summary.rawRowsExposed)],
    ["rawHeadersExposed", yesNo(summary.rawHeadersExposed)],
    ["rawEquipmentRecordsExposed", yesNo(summary.rawEquipmentRecordsExposed)],
  ];
}

function calibrationRows(status = {}) {
  const summary = status.calibrationSummary || {};
  return [
    ["diagnosticOnly", yesNo(summary.diagnosticOnly)],
    ["proofStatus", summary.proofStatus || "metadata_only"],
    ["totalRows", summary.totalRows ?? 0],
    ["rawRowsExposed", yesNo(summary.rawRowsExposed)],
    ["rawHeadersExposed", yesNo(summary.rawHeadersExposed)],
    ["rawCalibrationRecordsExposed", yesNo(summary.rawCalibrationRecordsExposed)],
  ];
}

function referenceRows(status = {}) {
  const summary = status.referenceStateSummary || {};
  const pureRefState = summary.pureRefState || {};
  return [
    ["diagnosticOnly", yesNo(summary.diagnosticOnly)],
    ["productionProof", yesNo(summary.productionProof)],
    ["proofStatus", summary.proofStatus || "metadata_only"],
    ["proofClaimsEmitted", yesNo(summary.proofClaimsEmitted)],
    ["PURE_REF_STATE present", yesNo(pureRefState.present)],
    ["PURE_REF_STATE count", pureRefState.count ?? 0],
    ["PURE_REF_STATE diagnosticOnly", yesNo(pureRefState.diagnosticOnly)],
    ["PURE_REF_STATE productionProof", yesNo(pureRefState.productionProof)],
    ["PURE_REF_STATE rawRowsExposed", yesNo(pureRefState.rawRowsExposed)],
    ["PURE_REF_STATE rawHeadersExposed", yesNo(pureRefState.rawHeadersExposed)],
  ];
}

function exportManifestRows(status = {}) {
  const summary = status.exportSafeManifestSummary || {};
  return [
    ["diagnosticOnly", yesNo(summary.diagnosticOnly)],
    ["manifestOnly", yesNo(summary.manifestOnly)],
    ["proofStatus", summary.proofStatus || "metadata_only"],
    ["totalRows", summary.totalRows ?? 0],
    ["rawLabEvidenceExposed", yesNo(summary.rawLabEvidenceExposed)],
    ["rawArtefactsExposed", yesNo(summary.rawArtefactsExposed)],
    ["rawLedgerExposed", yesNo(summary.rawLedgerExposed)],
    ["rawPdfsExposed", yesNo(summary.rawPdfsExposed)],
    ["rawIesExposed", yesNo(summary.rawIesExposed)],
    ["productionProofVerdictsEmitted", yesNo(summary.productionProofVerdictsEmitted)],
  ];
}

export function createLabProofViewModel({ context, local = {}, status = {} }) {
  return {
    moduleId: "lab_proof",
    label: "Lab Proof",
    localStatus: local.status || "not-requested",
    loadedAt: local.loadedAt || "none",
    lastAction: local.lastAction || "mounted",
    shellRoute: context?.route?.moduleId || "lab_proof",
    status,
    statusRows: statusRows(status),
    runtimeStatusFlagRows: runtimeStatusFlagRows(status),
    boundaryRows: boundaryRows(status),
    healthRows: healthRows(status),
    equipmentRows: equipmentRows(status),
    equipmentTableRows: tableRows(status.equipmentSummary),
    calibrationRows: calibrationRows(status),
    calibrationTableRows: tableRows(status.calibrationSummary),
    referenceRows: referenceRows(status),
    referenceTableRows: tableRows(status.referenceStateSummary),
    exportManifestRows: exportManifestRows(status),
    exportManifestTableRows: tableRows(status.exportSafeManifestSummary),
    proofReadinessCategories: [...PROOF_READINESS_CATEGORIES],
    evidenceBoundaryFields: [...EVIDENCE_BOUNDARY_FIELDS],
    boundaryCopy: [...BOUNDARY_COPY],
    relationshipMapRows: RELATIONSHIP_MAP_ROWS.map(([source, role]) => [source, role]),
    warnings: Array.isArray(status.warnings) && status.warnings.length
      ? status.warnings
      : [
          "Lab Proof is read-only and diagnostic in this slice.",
          "This inspector does not provide production proof authority.",
          "No raw Lab evidence, raw artefacts, raw ledger, PDF contents, or IES contents are emitted.",
        ],
  };
}
