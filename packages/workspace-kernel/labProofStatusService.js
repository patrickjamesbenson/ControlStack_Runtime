import { readFile, stat } from "node:fs/promises";

export const LAB_PROOF_STATUS_PATH = "/api/lab-proof/status";

const EQUIPMENT_TABLE_CANDIDATES = Object.freeze([
  "LAB_EQUIPMENT",
  "EQUIPMENT",
  "EQUIPMENT_REGISTER",
  "LAB_EQUIPMENT_REGISTER",
  "TEST_EQUIPMENT",
]);

const CALIBRATION_TABLE_CANDIDATES = Object.freeze([
  "LAB_CALIBRATION",
  "CALIBRATION",
  "CALIBRATIONS",
  "CALIBRATION_REGISTER",
  "EQUIPMENT_CALIBRATION",
  "LAB_EQUIPMENT_CALIBRATION",
]);

const REFERENCE_STATE_TABLE_CANDIDATES = Object.freeze([
  "PURE_REF_STATE",
  "LAB_REFERENCE_STATE",
  "REFERENCE_STATE",
]);

const EXPORT_SAFE_MANIFEST_TABLE_CANDIDATES = Object.freeze([
  "LAB_EXPORT_SAFE_MANIFEST",
  "EXPORT_SAFE_MANIFEST",
  "SAFE_MANIFEST",
]);

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function tableRows(snapshot, tableName) {
  const value = snapshot?.[tableName];
  return Array.isArray(value) ? value : [];
}

function safeErrorReason(error) {
  return error?.code || error?.name || "lab_proof_status_unavailable";
}

function tablePresenceSummary(snapshot, tableNames) {
  return tableNames.map((table) => {
    const rows = tableRows(snapshot, table);
    return {
      table,
      present: Array.isArray(snapshot?.[table]),
      count: rows.length,
      rawRowsExposed: false,
      rawHeadersExposed: false,
    };
  });
}

function totalCount(tableSummaries) {
  return tableSummaries.reduce((total, table) => total + table.count, 0);
}

function sourceBoundarySummary(sourceStat, parseable) {
  return {
    configured: true,
    present: Boolean(sourceStat),
    readable: Boolean(sourceStat?.isFile?.()),
    parseable: Boolean(parseable),
    modifiedTime: sourceStat?.mtime?.toISOString?.() || null,
    fileSize: sourceStat?.size ?? null,
  };
}

function buildWarnings({ sourceStat, parseable, equipmentTables, calibrationTables, referenceStateTables, exportSafeManifestTables, readError }) {
  const warnings = [
    "Diagnostic-only Lab proof boundary status. This endpoint is not production proof authority.",
    "No proof claims, production proof verdicts, raw artefacts, raw ledger, PDF contents, IES contents, or raw Lab evidence are emitted.",
  ];

  if (!sourceStat) warnings.push("Active authority reference snapshot is not currently readable for Lab proof boundary diagnostics.");
  if (sourceStat && !parseable) warnings.push(`Active authority reference snapshot could not be parsed for Lab proof boundary diagnostics: ${readError || "not_parseable"}.`);
  if (!equipmentTables.some((table) => table.present)) warnings.push("No Lab equipment register table was detected in the active metadata snapshot.");
  if (!calibrationTables.some((table) => table.present)) warnings.push("No Lab calibration register table was detected in the active metadata snapshot.");
  if (!referenceStateTables.some((table) => table.present)) warnings.push("No Lab reference-state table was detected beyond metadata-only diagnostics.");
  if (!exportSafeManifestTables.some((table) => table.present)) warnings.push("No export-safe Lab manifest table was detected in the active metadata snapshot.");

  return warnings;
}

export async function buildLabProofStatus({ sourcePath } = {}) {
  let sourceStat = null;
  let snapshot = {};
  let parseable = false;
  let readError = null;

  try {
    sourceStat = await stat(sourcePath);
    const text = await readFile(sourcePath, "utf-8");
    const parsed = JSON.parse(text);
    snapshot = isPlainObject(parsed) ? parsed : {};
    parseable = isPlainObject(parsed);
  } catch (error) {
    readError = safeErrorReason(error);
  }

  const equipmentTables = tablePresenceSummary(snapshot, EQUIPMENT_TABLE_CANDIDATES);
  const calibrationTables = tablePresenceSummary(snapshot, CALIBRATION_TABLE_CANDIDATES);
  const referenceStateTables = tablePresenceSummary(snapshot, REFERENCE_STATE_TABLE_CANDIDATES);
  const exportSafeManifestTables = tablePresenceSummary(snapshot, EXPORT_SAFE_MANIFEST_TABLE_CANDIDATES);
  const pureRefStateRows = tableRows(snapshot, "PURE_REF_STATE");

  return {
    ok: true,
    endpoint: LAB_PROOF_STATUS_PATH,
    owner: "runtime-server",
    readOnly: true,
    diagnosticOnly: true,
    productionProofAuthority: false,
    proofClaimsEmitted: false,
    rawLabEvidenceExposed: false,
    rawArtefactsExposed: false,
    rawLedgerExposed: false,
    rawPdfsExposed: false,
    rawIesExposed: false,
    equipmentSummary: {
      diagnosticOnly: true,
      proofStatus: "metadata_only",
      tables: equipmentTables,
      totalRows: totalCount(equipmentTables),
      rawRowsExposed: false,
      rawHeadersExposed: false,
      rawEquipmentRecordsExposed: false,
    },
    calibrationSummary: {
      diagnosticOnly: true,
      proofStatus: "metadata_only",
      tables: calibrationTables,
      totalRows: totalCount(calibrationTables),
      rawRowsExposed: false,
      rawHeadersExposed: false,
      rawCalibrationRecordsExposed: false,
    },
    referenceStateSummary: {
      diagnosticOnly: true,
      productionProof: false,
      proofStatus: "metadata_only",
      proofClaimsEmitted: false,
      pureRefState: {
        present: Array.isArray(snapshot?.PURE_REF_STATE),
        count: pureRefStateRows.length,
        diagnosticOnly: true,
        productionProof: false,
        rawRowsExposed: false,
        rawHeadersExposed: false,
      },
      tables: referenceStateTables,
      rawRowsExposed: false,
      rawHeadersExposed: false,
    },
    healthSummary: {
      endpoint: LAB_PROOF_STATUS_PATH,
      source: sourceBoundarySummary(sourceStat, parseable),
      readOnly: true,
      diagnosticOnly: true,
      productionProofAuthority: false,
      noWritesAttempted: true,
      selectorMutations: false,
      boardDataWrites: false,
      iesGeneration: false,
      engineResultsEmitted: false,
    },
    exportSafeManifestSummary: {
      diagnosticOnly: true,
      manifestOnly: true,
      proofStatus: "metadata_only",
      tables: exportSafeManifestTables,
      totalRows: totalCount(exportSafeManifestTables),
      rawLabEvidenceExposed: false,
      rawArtefactsExposed: false,
      rawLedgerExposed: false,
      rawPdfsExposed: false,
      rawIesExposed: false,
      productionProofVerdictsEmitted: false,
    },
    warnings: buildWarnings({
      sourceStat,
      parseable,
      equipmentTables,
      calibrationTables,
      referenceStateTables,
      exportSafeManifestTables,
      readError,
    }),
  };
}
