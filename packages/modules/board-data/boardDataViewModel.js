const SAFE_DETAIL_CATEGORIES = Object.freeze([
  "SYSTEM",
  "BOARDS",
  "DRIVERS",
  "OPTICS",
  "ACCESSORIES",
  "SYSTEM_COMPONENTS",
  "SYSTEM_POLICY",
  "SYSTEM_BOM_DEFAULTS",
  "PURE_REF_STATE",
]);

const CATEGORY_LABELS = Object.freeze({
  PURE_REF_STATE: "PURE_REF_STATE diagnostic metadata only",
});

const REQUIRED_BOUNDARY_STATEMENTS = Object.freeze([
  "Board Data is read-only in this slice.",
  "Board Data defines product/component metadata.",
  "This inspector shows redacted summaries only.",
  "No raw table rows are exposed.",
  "No USERS rows, USERS headers, email addresses, credentials, Google rows, or raw Lab evidence are exposed.",
  "Board Data does not provide Lab proof.",
  "Board Data does not mutate Selector.",
  "Board Data does not generate IES files.",
  "Materialiser refresh and active snapshot promotion remain separate controlled workflows.",
]);

function yesNo(value) {
  if (value === true) return "true";
  if (value === false) return "false";
  if (value === null || value === undefined) return "unknown";
  return String(value);
}

function forcedFalse(value) {
  return value === true ? "true" : "false";
}

function valueOrNone(value) {
  if (value === null || value === undefined || value === "") return "none";
  return String(value);
}

function tableSummary(status = {}) {
  return Array.isArray(status.tableSummary) ? status.tableSummary : [];
}

function tableFor(status, tableName) {
  return tableSummary(status).find((table) => table.table === tableName) || null;
}

function countFor(status, tableName) {
  const count = status?.counts?.[tableName];
  if (Number.isFinite(count)) return count;
  const summary = tableFor(status, tableName);
  return Number.isFinite(summary?.rowCount) ? summary.rowCount : 0;
}

function presentFor(status, tableName) {
  const summary = tableFor(status, tableName);
  if (typeof summary?.present === "boolean") return summary.present;
  return Number.isFinite(status?.counts?.[tableName]);
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
    ["readOnly", "true"],
    ["diagnosticOnly", "true"],
    ["rawRowsExposed", forcedFalse(status.rawRowsExposed)],
    ["rawHeadersExposed", forcedFalse(status.rawHeadersExposed)],
    ["rawUsersExposed", forcedFalse(status.rawUsersExposed)],
    ["rawGoogleRowsExposed", forcedFalse(status.rawGoogleRowsExposed)],
    ["rawLabEvidenceExposed", forcedFalse(status.rawLabEvidenceExposed)],
    ["selectorMutationEnabled", forcedFalse(status.selectorMutationEnabled)],
    ["labProofAuthority", forcedFalse(status.labProofAuthority)],
    ["iesGenerationEnabled", forcedFalse(status.iesGenerationEnabled)],
    ["materialiserRefreshEnabled", forcedFalse(status.materialiserRefreshEnabled)],
    ["activeSnapshotPromotionEnabled", forcedFalse(status.activeSnapshotPromotionEnabled)],
    ["donorCodeMounted", forcedFalse(status.donorCodeMounted)],
    ["productDataAuthority", status.productDataAuthority === true ? "true" : "false"],
    ["writeEnabled", forcedFalse(status.writeEnabled)],
    ["googleSyncEnabled", forcedFalse(status.googleSyncEnabled)],
    ["activeSnapshotWriteEnabled", forcedFalse(status.activeSnapshotWriteEnabled)],
    ["materialisedSnapshotWriteEnabled", forcedFalse(status.materialisedSnapshotWriteEnabled)],
    ["candidateEditMode", forcedFalse(status.candidateEditMode)],
    ["approved data source", status.approvedDataSource || "active authority-reference snapshot"],
  ];
}

function countRows(status = {}) {
  return SAFE_DETAIL_CATEGORIES.map((tableName) => [`${tableName} count`, countFor(status, tableName)]);
}

function boundaryRows(status = {}) {
  const users = status.usersRedactionStatus || {};
  const proof = status.proofBoundary || {};
  const missing = Array.isArray(status.missingExpectedTables) ? status.missingExpectedTables : [];
  return [
    ["missing expected tables", missing.length ? missing.join(", ") : "none reported"],
    ["USERS present", yesNo(users.present)],
    ["USERS count", users.count ?? 0],
    ["USERS raw rows exposed", forcedFalse(users.rawRowsExposed)],
    ["USERS raw headers exposed", forcedFalse(users.rawHeadersExposed)],
    ["email addresses exposed", "false"],
    ["credentials exposed", "false"],
    ["Google rows exposed", forcedFalse(status.rawGoogleRowsExposed)],
    ["raw Lab evidence exposed", forcedFalse(status.rawLabEvidenceExposed)],
    ["Lab required for proof", yesNo(proof.labRequiredForProof)],
    ["metadata-only fields", yesNo(proof.metadataOnlyFields)],
    ["production proof claims emitted", forcedFalse(proof.productionProofClaimsEmitted)],
  ];
}

function warningSummaryFor(status, tableName) {
  const warnings = Array.isArray(status.warnings) ? status.warnings : [];
  const matching = warnings.filter((warning) => String(warning).includes(tableName));
  if (matching.length) return matching.join(" ");
  if (tableName === "PURE_REF_STATE") return "diagnostic metadata only; production proof false";
  return "none reported for this category";
}

function proofBoundaryFor(status, tableName) {
  if (tableName === "PURE_REF_STATE") {
    return "diagnostic metadata only; Board Data does not provide Lab proof";
  }
  if (status.labProofAuthority === true) return "unsafe: Lab proof authority unexpectedly true";
  return "metadata only; Lab proof not provided by Board Data";
}

function redactionStatusFor(status = {}) {
  const rawRows = forcedFalse(status.rawRowsExposed);
  const rawHeaders = forcedFalse(status.rawHeadersExposed);
  const rawUsers = forcedFalse(status.rawUsersExposed);
  const rawGoogleRows = forcedFalse(status.rawGoogleRowsExposed);
  const rawLabEvidence = forcedFalse(status.rawLabEvidenceExposed);
  return `rawRowsExposed:${rawRows}; rawHeadersExposed:${rawHeaders}; rawUsersExposed:${rawUsers}; rawGoogleRowsExposed:${rawGoogleRows}; rawLabEvidenceExposed:${rawLabEvidence}`;
}

function detailRowsForCategory(status = {}, tableName) {
  const source = status.source || {};
  const present = presentFor(status, tableName);
  const readable = source.readable === undefined || source.readable === null ? "unknown" : yesNo(source.readable);
  const count = countFor(status, tableName);
  return [
    ["present", yesNo(present)],
    ["count", count],
    ["readable", readable],
    ["summary status", present ? "summary metadata available" : "missing or unavailable"],
    ["redaction status", redactionStatusFor(status)],
    ["proof boundary status", proofBoundaryFor(status, tableName)],
    ["warnings", warningSummaryFor(status, tableName)],
  ];
}

function redactedDetailCategories(status = {}) {
  return SAFE_DETAIL_CATEGORIES.map((tableName) => ({
    key: tableName,
    label: CATEGORY_LABELS[tableName] || tableName,
    rows: detailRowsForCategory(status, tableName),
  }));
}

function tableRows(status = {}) {
  const source = status.source || {};
  return SAFE_DETAIL_CATEGORIES.map((tableName) => {
    const present = presentFor(status, tableName);
    const readable = source.readable === undefined || source.readable === null ? "unknown" : yesNo(source.readable);
    const rawRows = forcedFalse(status.rawRowsExposed);
    const rawHeaders = forcedFalse(status.rawHeadersExposed);
    return [
      CATEGORY_LABELS[tableName] || tableName,
      `present:${yesNo(present)}; count:${countFor(status, tableName)}; readable:${readable}; rawRowsExposed:${rawRows}; rawHeadersExposed:${rawHeaders}`,
    ];
  });
}

export function createBoardDataViewModel({ context, local = {}, status = {} }) {
  const warnings = Array.isArray(status.warnings) && status.warnings.length
    ? status.warnings
    : REQUIRED_BOUNDARY_STATEMENTS;

  return {
    moduleId: "board_data",
    label: "Board Data",
    localStatus: local.status || "not-requested",
    loadedAt: local.loadedAt || "none",
    lastAction: local.lastAction || "mounted",
    shellRoute: context?.route?.moduleId || "board_data",
    status,
    requiredBoundaryStatements: REQUIRED_BOUNDARY_STATEMENTS,
    sourceRows: sourceRows(status),
    safetyRows: safetyRows(status),
    countRows: countRows(status),
    boundaryRows: boundaryRows(status),
    redactedDetailCategories: redactedDetailCategories(status),
    tableRows: tableRows(status),
    warnings,
  };
}

