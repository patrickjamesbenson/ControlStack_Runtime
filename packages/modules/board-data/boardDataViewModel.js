const EXPECTED_TABLES = Object.freeze([
  "BOARDS",
  "DRIVERS",
  "OPTICS",
  "SYSTEM",
  "SYSTEM_COMPONENTS",
  "SYSTEM_POLICY",
  "SYSTEM_BOM_DEFAULTS",
  "ACCESSORIES",
  "PURE_REF_STATE",
]);

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

function countFor(status, tableName) {
  const count = status?.counts?.[tableName];
  if (Number.isFinite(count)) return count;
  const summary = Array.isArray(status?.tableSummary) ? status.tableSummary : [];
  return summary.find((table) => table.table === tableName)?.rowCount ?? 0;
}

function sourceRows(status = {}) {
  const source = status.source || {};
  return [
    ["endpoint", status.endpoint || "/api/board-data/status"],
    ["ok", yesNo(status.ok)],
    ["source label", source.label || "runtime-authority-reference-active-snapshot"],
    ["source present", yesNo(source.present)],
    ["source readable", yesNo(source.readable)],
    ["source parseable", yesNo(source.parseable)],
    ["modifiedTime", valueOrNone(source.modifiedTime)],
    ["fileSize", source.fileSize === undefined || source.fileSize === null ? "none" : `${source.fileSize} bytes`],
  ];
}

function safetyRows(status = {}) {
  return [
    ["readOnly", yesNo(status.readOnly)],
    ["diagnosticOnly", yesNo(status.diagnosticOnly)],
    ["productDataAuthority", yesNo(status.productDataAuthority)],
    ["writeEnabled", yesNo(status.writeEnabled)],
    ["selectorMutationEnabled", yesNo(status.selectorMutationEnabled)],
    ["labProofAuthority", yesNo(status.labProofAuthority)],
    ["iesGenerationEnabled", yesNo(status.iesGenerationEnabled)],
    ["googleSyncEnabled", yesNo(status.googleSyncEnabled)],
    ["activeSnapshotWriteEnabled", yesNo(status.activeSnapshotWriteEnabled)],
    ["materialisedSnapshotWriteEnabled", yesNo(status.materialisedSnapshotWriteEnabled)],
    ["rawRowsExposed", yesNo(status.rawRowsExposed)],
    ["rawUsersExposed", yesNo(status.rawUsersExposed)],
    ["rawUserHeadersExposed", yesNo(status.rawUserHeadersExposed)],
    ["candidateEditMode", yesNo(status.candidateEditMode)],
    ["approved data source", status.approvedDataSource || "active authority-reference snapshot"],
  ];
}

function countRows(status = {}) {
  return EXPECTED_TABLES.map((tableName) => [`${tableName} count`, countFor(status, tableName)]);
}

function boundaryRows(status = {}) {
  const users = status.usersRedactionStatus || {};
  const proof = status.proofBoundary || {};
  const missing = Array.isArray(status.missingExpectedTables) ? status.missingExpectedTables : [];
  return [
    ["missing expected tables", missing.length ? missing.join(", ") : "none reported"],
    ["USERS present", yesNo(users.present)],
    ["USERS count", users.count ?? 0],
    ["USERS raw rows exposed", yesNo(users.rawRowsExposed)],
    ["USERS raw headers exposed", yesNo(users.rawHeadersExposed)],
    ["Lab required for proof", yesNo(proof.labRequiredForProof)],
    ["metadata-only fields", yesNo(proof.metadataOnlyFields)],
    ["production proof claims emitted", yesNo(proof.productionProofClaimsEmitted)],
  ];
}

function tableRows(status = {}) {
  const tables = Array.isArray(status.tableSummary) ? status.tableSummary : [];
  if (!tables.length) return [["tables", "loading or unavailable"]];
  return tables.map((table) => [
    table.table || "unknown",
    `${table.present ? `${table.rowCount ?? 0} rows` : "missing"}; rawRowsExposed:${yesNo(table.rawRowsExposed)}; headersRedacted:${yesNo(table.headersRedacted)}`,
  ]);
}

export function createBoardDataViewModel({ context, local = {}, status = {} }) {
  return {
    moduleId: "board_data",
    label: "Board Data",
    localStatus: local.status || "not-requested",
    loadedAt: local.loadedAt || "none",
    lastAction: local.lastAction || "mounted",
    shellRoute: context?.route?.moduleId || "board_data",
    status,
    sourceRows: sourceRows(status),
    safetyRows: safetyRows(status),
    countRows: countRows(status),
    boundaryRows: boundaryRows(status),
    tableRows: tableRows(status),
    warnings: Array.isArray(status.warnings) && status.warnings.length
      ? status.warnings
      : [
          "Board Data defines product/component metadata.",
          "Lab approval is required for proof.",
          "Selector mutation is disabled.",
          "Google/materialiser writes are disabled.",
          "Raw rows are not exposed in this first slice.",
        ],
  };
}
