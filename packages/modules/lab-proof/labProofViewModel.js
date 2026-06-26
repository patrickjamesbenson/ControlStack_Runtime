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

function boundaryRows(status = {}) {
  return [
    ["readOnly", yesNo(status.readOnly)],
    ["diagnosticOnly", yesNo(status.diagnosticOnly)],
    ["productionProofAuthority", yesNo(status.productionProofAuthority)],
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
    warnings: Array.isArray(status.warnings) && status.warnings.length
      ? status.warnings
      : [
          "Lab Proof is read-only and diagnostic in this slice.",
          "This inspector does not provide production proof authority.",
          "No raw Lab evidence, raw artefacts, raw ledger, PDF contents, or IES contents are emitted.",
        ],
  };
}
