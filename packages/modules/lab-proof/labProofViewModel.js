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

const MISSING_AUTHORITY_CONTRACT_NAME = "controlstack.lab_proof.authority_contract.v1";

const AUTHORITY_CONTRACT_DIAGNOSTIC_ROWS = Object.freeze([
  ["missing approved Lab authority contract", MISSING_AUTHORITY_CONTRACT_NAME],
  ["contract status", "missing; diagnostic map only"],
  ["productionProofAuthority", "false"],
  ["proofClaimsEmitted", "false"],
  ["current route", "/api/lab-proof/status GET-only metadata status"],
]);

const AUTHORITY_CONTRACT_SECTION_ROWS = Object.freeze([
  ["proof authority owner", "future approved Lab authority contract owner required; not assigned by runtime"],
  ["admissible evidence types", "future contract must define lab result refs, export-safe evidence manifest refs, equipment/calibration refs, and controlled-record refs"],
  ["safe/internal/restricted/raw field classes", "future contract must classify each field before any downstream use"],
  ["evidence status lifecycle", "future contract must define progression from expected metadata to reviewed, approved, rejected, expired, and superseded evidence"],
  ["candidate-to-lab-result links", "future contract must link Selector, Engine, and IES candidates to Lab result refs without treating candidates as proof"],
  ["Selector candidate ref", "opaque selector candidate reference only; not proof"],
  ["Engine selected result ref", "opaque Engine / RunTable selected-result reference only; not proof and raw payload blocked"],
  ["IES candidate ref", "opaque IES candidate reference only; not proof and raw IES blocked"],
  ["Board Data reference", "metadata reference only; not proof"],
  ["Lab result ref", "future approved lab result reference; absent in this slice"],
  ["Controlled Record ref", "future provenance/disposition reference; write disabled here"],
  ["RREG reviewer/approver/custody refs", "future responsibility mapping refs only; no approval or custody transfer here"],
  ["allowed and blocked production claims", "none allowed in this slice; future contract must define allowed claim language"],
  ["raw evidence non-emission rules", "future contract must preserve non-emission of raw evidence, raw PDFs, raw IES, raw artefacts, raw rows, private paths, credentials, provider IDs, USERS, and raw selected Engine payloads"],
]);

const EVIDENCE_FIELD_CLASS_ROWS = Object.freeze([
  ["safe", "evidence_id, title, evidence_type, status, visibility, applies_to, safe_summary, replacement_action, downstream_allowed"],
  ["internal", "selector_candidate_ref, engine_selected_result_ref, run_table_ref, ies_candidate_ref, board_data_ref, lab_result_ref, controlled_record_ref"],
  ["restricted", "test_method_ref, calibration_ref, reviewer_ref, approver_ref, custody_ref, audit_trail_ref"],
  ["raw / blocked", "raw_lab_rows, raw_lab_evidence, raw_pdf_body, raw_ies_text, raw_artefact_payload, raw_selected_engine_payload, provider_ids, private_paths, credentials, USERS, raw_rows"],
]);

const SAFE_EVIDENCE_FIELDS = Object.freeze([
  "evidence_id",
  "title",
  "evidence_type",
  "status",
  "visibility",
  "applies_to",
  "safe_summary",
  "replacement_action",
  "downstream_allowed",
]);

const UNSAFE_EVIDENCE_FIELDS = Object.freeze([
  "raw_lab_rows",
  "raw_lab_evidence",
  "raw_equipment_records",
  "raw_calibration_records",
  "raw_pdf_body",
  "raw_ies_text",
  "raw_artefact_payload",
  "raw_selected_engine_payload",
  "provider_ids",
  "private_paths",
  "credentials",
  "USERS",
  "raw_rows",
  "raw_headers",
]);

const EVIDENCE_STATUS_LIFECYCLE = Object.freeze([
  "no evidence mapped",
  "candidate evidence expected",
  "export-safe manifest match",
  "restricted manifest match",
  "evidence mapped but unreviewed",
  "evidence review required",
  "lab approval required",
  "controlled-record reference required later",
  "RREG reviewer/approver/custody mapping required later",
  "production proof not established",
  "production proof future-gated",
]);

const AUTHORITY_LINK_ROWS = Object.freeze([
  ["Selector candidate ref", "candidate/selection source only; Selector state is not proof"],
  ["Engine / RunTable selected result ref", "selected result reference only; Engine selected-result state is not proof"],
  ["IES candidate ref", "candidate photometric artefact reference only; IES Builder output is not proof"],
  ["Board Data reference", "metadata source reference only; Board Data metadata is not proof"],
  ["Lab result ref", "future approved Lab result reference required before any production proof claim"],
  ["Controlled Record ref", "future provenance/disposition/audit reference; Controlled Records write disabled"],
  ["RREG reviewer/approver/custody refs", "future responsibility mapping only; RREG approval and custody transfer disabled"],
]);

const PRODUCTION_CLAIM_ROWS = Object.freeze([
  ["allowed claims", "none in this slice"],
  ["blocked claims", "production proof, certification, approved photometry, approved IES, NATA/lab-ratified quantitative claims, compliance certification, RREG approval, controlled-record approval"],
  ["Selector and Engine selected-result states", "candidate/selected states only; not proof"],
  ["Board Data metadata", "metadata only; not proof"],
  ["IES candidate", "candidate artefact only; not proof"],
]);

const RAW_EVIDENCE_NON_EMISSION_RULES = Object.freeze([
  "Do not emit raw Lab evidence.",
  "Do not emit raw equipment or calibration records.",
  "Do not emit raw PDFs or PDF contents.",
  "Do not emit raw IES text or photometric artefact payloads.",
  "Do not emit raw selected Engine payloads or RunTable rows.",
  "Do not emit provider IDs, private paths, credentials, USERS, raw rows, or raw headers.",
]);

const AUTHORITY_CONTRACT_GUARDRAIL_ROWS = Object.freeze([
  ["post Lab Proof endpoint added", "false"],
  ["upload/parse/export/proof controls added", "false"],
  ["approval controls added", "false"],
  ["Controlled Records write enabled", "false"],
  ["RREG approval enabled", "false"],
  ["RREG custody transfer enabled", "false"],
  ["IES generation enabled", "false"],
  ["Selector reopening enabled", "false"],
  ["Board Data mutation enabled", "false"],
  ["raw evidence display enabled", "false"],
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
    missingAuthorityContractName: MISSING_AUTHORITY_CONTRACT_NAME,
    authorityContractDiagnosticRows: AUTHORITY_CONTRACT_DIAGNOSTIC_ROWS.map(([label, value]) => [label, value]),
    authorityContractSectionRows: AUTHORITY_CONTRACT_SECTION_ROWS.map(([label, value]) => [label, value]),
    evidenceFieldClassRows: EVIDENCE_FIELD_CLASS_ROWS.map(([label, value]) => [label, value]),
    safeEvidenceFieldRows: [...SAFE_EVIDENCE_FIELDS],
    unsafeEvidenceFieldRows: [...UNSAFE_EVIDENCE_FIELDS],
    evidenceStatusLifecycle: [...EVIDENCE_STATUS_LIFECYCLE],
    authorityLinkRows: AUTHORITY_LINK_ROWS.map(([label, value]) => [label, value]),
    productionClaimRows: PRODUCTION_CLAIM_ROWS.map(([label, value]) => [label, value]),
    rawEvidenceNonEmissionRules: [...RAW_EVIDENCE_NON_EMISSION_RULES],
    authorityContractGuardrailRows: AUTHORITY_CONTRACT_GUARDRAIL_ROWS.map(([label, value]) => [label, value]),
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
