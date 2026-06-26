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

const LIVE_STATUS_COPY = Object.freeze([
  "Board Data / Selector Reference live status is read-only in this slice.",
  "This status bridge reports source presence, table readiness, and redaction safety only.",
  "Raw rows, raw USERS, raw Lab evidence, credentials, private paths, and secret values are not exposed.",
  "Selector resolving remains disabled until a later approved resolver-preview slice.",
  "Board Data defines metadata. Selector resolves later. Lab proves later.",
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
  const source = status.source || status.activeSnapshot || {};
  const materialised = status.materialisedSnapshot || {};
  return [
    ["endpoint", status.endpoint || "/api/board-data/status"],
    ["ok", yesNo(status.ok)],
    ["active snapshot label", source.label || "runtime-authority-reference-active-snapshot"],
    ["active snapshot present", yesNo(source.present)],
    ["active snapshot readable", yesNo(source.readable)],
    ["active snapshot parseable", yesNo(source.parseable)],
    ["active snapshot modifiedTime", valueOrNone(source.modifiedTime)],
    ["active snapshot fileSize", source.fileSize === undefined || source.fileSize === null ? "none" : `${source.fileSize} bytes`],
    ["materialised snapshot label", materialised.label || "runtime-authority-reference-materialised-novondb"],
    ["materialised snapshot present", yesNo(materialised.present)],
    ["materialised snapshot readable", yesNo(materialised.readable)],
    ["materialised snapshot modifiedTime", valueOrNone(materialised.modifiedTime)],
    ["materialised snapshot fileSize", materialised.fileSize === undefined || materialised.fileSize === null ? "none" : `${materialised.fileSize} bytes`],
  ];
}

function safetyRows(status = {}) {
  return [
    ["readOnly", "true"],
    ["diagnosticOnly", "true"],
    ["source status read-only", "true"],
    ["rawRowsExposed", forcedFalse(status.rawRowsExposed)],
    ["rawHeadersExposed", forcedFalse(status.rawHeadersExposed)],
    ["rawUsersExposed", forcedFalse(status.rawUsersExposed)],
    ["rawGoogleRowsExposed", forcedFalse(status.rawGoogleRowsExposed)],
    ["rawLabEvidenceExposed", forcedFalse(status.rawLabEvidenceExposed)],
    ["credentialsExposed", forcedFalse(status.credentialsExposed)],
    ["privatePathsExposed", forcedFalse(status.privatePathsExposed)],
    ["Board Data write enabled", forcedFalse(status.boardDataWriteEnabled ?? status.writeEnabled)],
    ["materialiser write enabled", forcedFalse(status.materialiserWriteEnabled)],
    ["materialiser refresh enabled", forcedFalse(status.materialiserRefreshEnabled)],
    ["active snapshot write enabled", forcedFalse(status.activeSnapshotWriteEnabled)],
    ["active snapshot promotion enabled", forcedFalse(status.activeSnapshotPromotionEnabled)],
    ["materialised snapshot write enabled", forcedFalse(status.materialisedSnapshotWriteEnabled)],
    ["Selector resolving enabled", forcedFalse(status.selectorResolvingEnabled ?? status.activeResolverEnabled)],
    ["selectorMutationEnabled", forcedFalse(status.selectorMutationEnabled)],
    ["spec generation enabled", forcedFalse(status.specGenerationEnabled)],
    ["slug generation enabled", forcedFalse(status.slugGenerationEnabled)],
    ["Lab proof authority", forcedFalse(status.labProofAuthority)],
    ["IES generation enabled", forcedFalse(status.iesGenerationEnabled)],
    ["Controlled Records write enabled", forcedFalse(status.controlledRecordsWriteEnabled)],
    ["RREG assignment enabled", forcedFalse(status.rregAssignmentEnabled)],
    ["runtime data mutation enabled", forcedFalse(status.runtimeDataMutationEnabled)],
    ["hidden write-back enabled", forcedFalse(status.hiddenWriteBackEnabled)],
    ["donorCodeMounted", forcedFalse(status.donorCodeMounted)],
    ["productDataAuthority", status.productDataAuthority === true ? "true" : "false"],
    ["writeEnabled", forcedFalse(status.writeEnabled)],
    ["googleSyncEnabled", forcedFalse(status.googleSyncEnabled)],
    ["candidateEditMode", forcedFalse(status.candidateEditMode)],
    ["approved data source", status.approvedDataSource || "active authority-reference snapshot"],
  ];
}

function countRows(status = {}) {
  return SAFE_DETAIL_CATEGORIES.map((tableName) => [`${tableName} count`, countFor(status, tableName)]);
}

function expectedTablesFor(status = {}) {
  return Array.isArray(status.expectedTables) && status.expectedTables.length
    ? status.expectedTables
    : SAFE_DETAIL_CATEGORIES;
}

function presentTablesFor(status = {}) {
  if (Array.isArray(status.presentTables)) return status.presentTables;
  return tableSummary(status).filter((table) => table.present).map((table) => table.table);
}

function missingTablesFor(status = {}) {
  if (Array.isArray(status.missingTables)) return status.missingTables;
  if (Array.isArray(status.missingExpectedTables)) return status.missingExpectedTables;
  return [];
}

function liveStatusRows(status = {}) {
  const source = status.source || status.activeSnapshot || {};
  const materialised = status.materialisedSnapshot || {};
  const users = status.usersRedactionStatus || {};
  return [
    ["active snapshot present", yesNo(source.present)],
    ["active snapshot readable", yesNo(source.readable)],
    ["active snapshot parseable", yesNo(source.parseable)],
    ["materialised snapshot present", yesNo(materialised.present)],
    ["materialised snapshot readable", yesNo(materialised.readable)],
    ["expected tables", expectedTablesFor(status).join(", ") || "none reported"],
    ["present tables", presentTablesFor(status).join(", ") || "none reported"],
    ["missing tables", missingTablesFor(status).join(", ") || "none reported"],
    ["safe table counts visible", "true"],
    ["USERS present", yesNo(users.present)],
    ["USERS count only", users.count ?? 0],
    ["USERS raw rows exposed", forcedFalse(users.rawRowsExposed)],
    ["raw rows exposed", forcedFalse(status.rawRowsExposed)],
    ["raw headers exposed", forcedFalse(status.rawHeadersExposed)],
    ["raw Lab evidence exposed", forcedFalse(status.rawLabEvidenceExposed)],
    ["credentials exposed", forcedFalse(status.credentialsExposed)],
    ["private paths exposed", forcedFalse(status.privatePathsExposed)],
  ];
}

function boundaryRows(status = {}) {
  const users = status.usersRedactionStatus || {};
  const proof = status.proofBoundary || {};
  const missing = missingTablesFor(status);
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
    liveStatusCopy: LIVE_STATUS_COPY,
    liveStatusRows: liveStatusRows(status),
    sourceRows: sourceRows(status),
    safetyRows: safetyRows(status),
    countRows: countRows(status),
    boundaryRows: boundaryRows(status),
    redactedDetailCategories: redactedDetailCategories(status),
    tableRows: tableRows(status),
    warnings,
  };
}

