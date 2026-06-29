import { readFile, stat } from "node:fs/promises";

import {
  AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
  AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
} from "./authorityReferenceMaterialiserService.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "./selectorReferenceOptionsService.js";

export const SELECTOR_REFERENCE_STATUS_PATH = "/api/selector-reference/status";

export const SELECTOR_CRITICAL_TABLES = Object.freeze([
  "SYSTEM",
  "OPTICS",
  "ACCESSORIES",
  "SPEC_CODES",
  "BOARDS",
  "DRIVERS",
  "PURE_REF_STATE",
  "SYSTEM_COMPONENTS",
  "SYSTEM_BOM_DEFAULTS",
  "SYSTEM_POLICY",
  "FIELD_EDITABILITY",
  "ROLES_AND_LANES",
  "CODE_POLICY",
  "MESSAGES",
  "USERS",
]);

export const SELECTOR_FAKE_PROOF_WARNING = "No approved Lab pure reference state found for this selection.";

export const SELECTOR_FAKE_PROOF_WARNING_EXPANDED = "Photometry blocked. Selector resolved metadata only. PURE_REF_STATE, baseline_slug, pure_ref_lm, optic_lumen_measured, eff_optical, and driver util_curve_file are not approved photometric proof. No arbitrary IES, generic optic file, nearest-looking photometry, default photometry, or efficiency fallback may be used.";

const FALLBACK_RISK_FIELD_CANDIDATES = Object.freeze([
  { table: "OPTICS", field: "baseline_slug" },
  { table: "OPTICS", field: "eff_optical" },
  { table: "OPTICS", field: "pure_ref_id" },
  { table: "OPTICS", field: "pure_ref_lm" },
  { table: "OPTICS", field: "optic_lumen_measured" },
  { table: "DRIVERS", field: "util_curve_file" },
  { table: "DRIVERS", field: "util_curve_status" },
  { table: "DRIVERS", field: "opt_eff" },
  { table: "DRIVERS", field: "opt_eff_note" },
  { table: "DRIVERS", field: "eff_driver" },
  { table: "BOARDS", field: "curve_source" },
  { table: "BOARDS", field: "raw_beam_angle" },
  { table: "BOARDS", field: "c1_lumen_imax_25c" },
  { table: "BOARDS", field: "c2_lumen_imax_25c" },
  { table: "BOARDS", field: "chip_efficacy" },
  { table: "BOARDS", field: "chip_data_source" },
  { table: "PURE_REF_STATE", field: "board_lm_measured" },
  { table: "PURE_REF_STATE", field: "input_watts_measured" },
  { table: "PURE_REF_STATE", field: "test_ma" },
  { table: "PURE_REF_STATE", field: "ta_c" },
  { table: "PURE_REF_STATE", field: "tc_board_c" },
  { table: "PURE_REF_STATE", field: "tc_driver_c" },
]);

const USER_SAFE_DERIVED_USES = Object.freeze([
  "redacted authority role derivation status",
  "redacted selector visibility capability status",
  "redacted timeline/special-parts entitlement capability status",
  "redacted blacklist/restriction status",
]);

const SAFE_SELECTOR_REFERENCE_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  sourceStatusReadOnly: true,
  activeSnapshotWriteEnabled: false,
  activeSnapshotPromotionEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  materialiserWriteEnabled: false,
  materialiserRefreshEnabled: false,
  boardDataWriteEnabled: false,
  selectorResolvingEnabled: false,
  activeResolverEnabled: false,
  selectorMutationEnabled: false,
  specGenerationEnabled: false,
  slugGenerationEnabled: false,
  iesGenerationEnabled: false,
  labProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  rregApprovalEnabled: false,
  runtimeDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  rawLabEvidenceExposed: false,
});

const DEFAULT_FS_API = Object.freeze({
  readFile,
  stat,
});

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function safeString(value) {
  return String(value || "").trim();
}

function safeLower(value) {
  return safeString(value).toLowerCase();
}

function normaliseKey(value) {
  return safeLower(value)
    .replace(/[\s_./-]+/g, " ")
    .replace(/[^a-z0-9|+ ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function canonicalTableName(value) {
  return safeString(value).replace(/[^a-z0-9]+/gi, "").toUpperCase();
}

function headerName(header, index) {
  if (typeof header === "string") return safeString(header) || `column_${index + 1}`;
  if (isPlainObject(header)) return safeString(header.name || header.key || header.field || header.id || header.label) || `column_${index + 1}`;
  return `column_${index + 1}`;
}

function safeHeaders(headers = []) {
  if (!Array.isArray(headers)) return [];
  return headers.map(headerName).filter(Boolean);
}

function rowsFromHeaderValues(headers = [], rows = []) {
  const keys = safeHeaders(headers);
  if (!keys.length) return rows.filter(isPlainObject);
  return rows.map((row) => {
    if (isPlainObject(row)) return row;
    if (!Array.isArray(row)) return null;
    return Object.fromEntries(keys.map((key, index) => [key, row[index] ?? ""]));
  }).filter(isPlainObject);
}

function normaliseTableRowsCandidate(value) {
  if (Array.isArray(value)) {
    if (Array.isArray(value[0])) return rowsFromHeaderValues(value[0], value.slice(1));
    return value.filter(isPlainObject);
  }
  if (!isPlainObject(value)) return [];
  if (Array.isArray(value.values)) return rowsFromHeaderValues(value.values[0] || [], value.values.slice(1));
  if (Array.isArray(value.rows)) return rowsFromHeaderValues(value.headers || value.columns || value.fields || [], value.rows);
  if (Array.isArray(value.data)) return normaliseTableRowsCandidate(value.data);
  return [];
}

function directTableValue(container, tableName) {
  if (!isPlainObject(container)) return undefined;
  if (Object.prototype.hasOwnProperty.call(container, tableName)) return container[tableName];
  const lower = safeString(tableName).toLowerCase();
  if (Object.prototype.hasOwnProperty.call(container, lower)) return container[lower];
  const canonical = canonicalTableName(tableName);
  const actualKey = Object.keys(container).find((key) => canonicalTableName(key) === canonical);
  return actualKey ? container[actualKey] : undefined;
}

function tableValueCandidates(snapshot, tableName) {
  const containers = [
    snapshot,
    snapshot?.data,
    snapshot?.tables,
    snapshot?.novondb,
    snapshot?.sheets,
    snapshot?.data?.tables,
    snapshot?.data?.novondb,
    snapshot?.data?.sheets,
  ];
  const values = [];
  for (const container of containers) {
    const value = directTableValue(container, tableName);
    if (value !== undefined) values.push(value);
  }
  return values;
}

function tableRows(snapshot, tableName) {
  const candidate = tableValueCandidates(snapshot, tableName)[0];
  return normaliseTableRowsCandidate(candidate);
}

function tablePresent(snapshot, tableName) {
  return tableValueCandidates(snapshot, tableName).length > 0;
}

function unionHeaders(rows) {
  const headers = new Set();
  for (const row of rows) {
    if (!isPlainObject(row)) continue;
    for (const key of Object.keys(row)) headers.add(key);
  }
  return [...headers].sort((left, right) => left.localeCompare(right));
}

function headerSet(snapshot, tableName) {
  return new Set(unionHeaders(tableRows(snapshot, tableName)));
}

function fallbackRiskReason(table, field, present) {
  const presentPrefix = present
    ? "This field exists in the active runtime snapshot."
    : "This candidate field is not present in the active runtime snapshot.";
  const tableReason = {
    OPTICS: "Optic/baseline reference metadata can identify a claimed reference state but is not approved photometric proof.",
    DRIVERS: "Driver curve or efficiency metadata can inform diagnostics but is not approved Lab evidence or a photometric fallback.",
    BOARDS: "Board output/source metadata can inform diagnostics but is not approved Lab proof for Selector photometry.",
    PURE_REF_STATE: "PURE_REF_STATE measured/test fields are diagnostic/index metadata only in this slice and are not production photometric proof.",
  }[table] || "This field is metadata only and must not be treated as approved proof.";
  return `${presentPrefix} ${table}.${field} is metadata-only. ${tableReason}`;
}

function fallbackRiskFields(snapshot) {
  const headersByTable = new Map();
  for (const { table } of FALLBACK_RISK_FIELD_CANDIDATES) {
    if (!headersByTable.has(table)) headersByTable.set(table, headerSet(snapshot, table));
  }
  return FALLBACK_RISK_FIELD_CANDIDATES.map(({ table, field }) => {
    const headers = headersByTable.get(table) || new Set();
    const present = headers.has(field);
    return {
      table,
      field,
      present,
      reason: fallbackRiskReason(table, field, present),
      proofStatus: "metadata_only",
    };
  });
}

function roleRank(role) {
  return { external_user: 0, internal_user: 10, internal_engineer: 20, developer: 30 }[role] ?? 0;
}

function canonicalRoleForToken(token) {
  const value = safeLower(token);
  const map = {
    developer: "developer",
    internal_engineer: "internal_engineer",
    internal_engineering: "internal_engineer",
    internal_developer_systems: "internal_engineer",
    internal_user: "internal_user",
    management: "internal_user",
    internal_sales: "internal_user",
    internal_sales_bdm: "internal_user",
    external_user: "external_user",
    external_all: "external_user",
  };
  return map[value] || "external_user";
}

function splitCsv(value) {
  if (Array.isArray(value)) return value.map(safeString).filter(Boolean);
  return safeString(value).split(",").map(safeString).filter(Boolean);
}

function canonicalRoleForUserRow(row) {
  const tokens = splitCsv(row?.contact_roles_assigned || row?.cs_role || row?.role || row?.roles);
  let best = "external_user";
  for (const token of tokens) {
    const role = canonicalRoleForToken(token);
    if (roleRank(role) > roleRank(best)) best = role;
  }
  return best;
}

function truthyFlag(value) {
  return ["1", "true", "yes", "y", "blocked", "active"].includes(safeLower(value));
}

function increment(bucket, key) {
  bucket[key] = (bucket[key] || 0) + 1;
}

function userDerivedAuthorityCapabilitySummary(users) {
  const roleCounts = {
    developer: 0,
    internal_engineer: 0,
    internal_user: 0,
    external_user: 0,
  };
  const fieldCoverage = {
    roleRows: 0,
    capabilityRows: 0,
    specialPartEntitlementRows: 0,
    restrictionRows: 0,
    blacklistRows: 0,
  };

  for (const row of users) {
    if (!isPlainObject(row)) continue;
    increment(roleCounts, canonicalRoleForUserRow(row));
    if (safeString(row.contact_roles_assigned || row.cs_role || row.role || row.roles)) fieldCoverage.roleRows += 1;
    if (safeString(row.capabilities || row.capability || row.permissions || row.permission)) fieldCoverage.capabilityRows += 1;
    if (safeString(row.system_component_ids || row.system_componrent_ids || row.system_component_id)) fieldCoverage.specialPartEntitlementRows += 1;
    if (safeString(row.caveats || row.caveat || row.restrictions || row.restriction)) fieldCoverage.restrictionRows += 1;
    if (truthyFlag(row.blocked || row.blacklisted || row.blacklist)) fieldCoverage.blacklistRows += 1;
  }

  return {
    roleCounts,
    fieldCoverage,
    personalIdentifiersExposed: false,
  };
}

function tableSummary(snapshot, tableName) {
  const rows = tableRows(snapshot, tableName);
  const present = tablePresent(snapshot, tableName);
  return {
    table: tableName,
    present,
    rowCount: rows.length,
    headers: [],
    headersRedacted: true,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    headersReturned: false,
  };
}

function expectedTableReadiness(snapshot) {
  return SELECTOR_CRITICAL_TABLES.map((table) => {
    const summary = tableSummary(snapshot, table);
    return {
      ...summary,
      status: summary.present ? "present" : "missing",
      requiredForPreview: true,
      blocker: summary.present ? "" : `Missing Selector-critical table: ${table}.`,
      usersDataExposed: false,
      credentialsExposed: false,
    };
  });
}

function missingTableBlockersFromReadiness(tableReadiness = []) {
  return tableReadiness.filter((table) => table.present !== true).map((table) => ({
    table: table.table,
    code: "missing-selector-critical-table",
    severity: "blocking",
    reason: `Missing Selector-critical table: ${table.table}.`,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    privatePathsExposed: false,
  }));
}

function safeRedactionState() {
  return {
    rawRowsExposed: false,
    rawHeadersExposed: false,
    usersRowsExposed: false,
    usersHeadersExposed: false,
    usersPersonalIdentifiersExposed: false,
    rawUsersExposed: false,
    rawUserHeadersExposed: false,
    credentialsExposed: false,
    credentialPathsExposed: false,
    credentialValuesExposed: false,
    providerIdsExposed: false,
    providerPathsExposed: false,
    localPathsExposed: false,
    privatePathsExposed: false,
    rawLabEvidenceExposed: false,
    usersHandling: "USERS may only contribute redacted role, visibility, and special-parts entitlement capability summaries; rows, headers, identifiers, and credentials are not returned.",
  };
}

function safeSnapshotMetadata(metadata = {}) {
  return {
    label: metadata.label || null,
    present: metadata.present === true,
    readable: metadata.readable === true,
    parseable: metadata.parseable === undefined ? null : metadata.parseable,
    modifiedTime: metadata.modifiedTime || null,
    fileSize: metadata.fileSize ?? null,
    reason: metadata.reason || null,
    pathReturned: false,
    privatePathExposed: false,
    providerIdExposed: false,
  };
}

function flattenSelectorOptionFields(selectorOptions = {}) {
  const flatFields = Array.isArray(selectorOptions.fields) ? selectorOptions.fields.map((field) => ({ ...field, sectionKey: "flat-fields" })) : [];
  const workflowFields = (Array.isArray(selectorOptions.workflowSections) ? selectorOptions.workflowSections : []).flatMap((section) => (
    Array.isArray(section.fields) ? section.fields.map((field) => ({ ...field, sectionKey: section.sectionKey || section.title || "workflow" })) : []
  ));
  const seen = new Set();
  return [...flatFields, ...workflowFields].filter((field) => {
    const key = `${field.sectionKey || ""}:${field.fieldKey || field.label || ""}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function referenceOptionSourceCoverage(selectorOptions = {}) {
  const fields = flattenSelectorOptionFields(selectorOptions);
  const fieldSummaries = fields.map((field) => {
    const options = Array.isArray(field.options) ? field.options : [];
    const sourceTables = Array.isArray(field.sourceTables) ? field.sourceTables.map(safeString).filter(Boolean) : [];
    const sourceStatus = safeString(field.sourceStatus || field.status || "unknown");
    const futureMapped = field.futureMapped === true || sourceStatus === "future-mapped" || sourceStatus.includes("unavailable from current source");
    const disabled = field.disabled === true || field.role === "disabled" || sourceStatus.includes("disabled");
    const entitlementGated = field.role === "entitlement-gated" || sourceStatus.includes("entitlement-gated");
    const sourceBacked = !futureMapped && !disabled && (sourceStatus.startsWith("db-reference-backed") || entitlementGated || options.length > 0);
    return {
      fieldKey: safeString(field.fieldKey || field.label || "field"),
      label: safeString(field.label || field.fieldKey || "field"),
      sectionKey: safeString(field.sectionKey || ""),
      role: safeString(field.role || "unknown"),
      sourceStatus,
      sourceTables,
      optionCount: options.length,
      sourceBacked,
      futureMapped,
      disabled,
      entitlementGatedRedacted: entitlementGated,
      rawRowsExposed: false,
      rawHeadersExposed: false,
    };
  });
  const sourceBackedFields = fieldSummaries.filter((field) => field.sourceBacked);
  const futureMappedFields = fieldSummaries.filter((field) => field.futureMapped).map((field) => ({
    fieldKey: field.fieldKey,
    label: field.label,
    sectionKey: field.sectionKey,
    sourceTables: field.sourceTables,
    sourceStatus: field.sourceStatus,
    reason: "Future-mapped from donor/runtime field contract; the current safe source does not provide a backed option, so no value is faked.",
    rawRowsExposed: false,
  }));
  return {
    fieldCount: fieldSummaries.length,
    sourceBackedFieldCount: sourceBackedFields.length,
    futureMappedFieldCount: futureMappedFields.length,
    disabledFieldCount: fieldSummaries.filter((field) => field.disabled).length,
    metadataOnlyFieldCount: fieldSummaries.filter((field) => field.role === "metadata-only").length,
    entitlementGatedRedactedFieldCount: fieldSummaries.filter((field) => field.entitlementGatedRedacted).length,
    optionCount: fieldSummaries.reduce((total, field) => total + field.optionCount, 0),
    tablesCovered: [...new Set(fieldSummaries.flatMap((field) => field.sourceTables))].sort((left, right) => left.localeCompare(right)),
    sourceBackedFields: sourceBackedFields.map((field) => ({
      fieldKey: field.fieldKey,
      label: field.label,
      sectionKey: field.sectionKey,
      sourceTables: field.sourceTables,
      optionCount: field.optionCount,
      sourceStatus: field.sourceStatus,
      rawRowsExposed: false,
    })),
    futureMappedFields,
    sourceBackedExplanation: "Source-backed fields are summarised from safe Selector Reference option metadata and table counts only; raw rows and raw headers are not returned.",
    futureMappedExplanation: "Future-mapped fields remain visible as future-mapped, not faked, until the source provides supported mapped fields.",
    rawRowsExposed: false,
    rawHeadersExposed: false,
    rawUsersExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
  };
}

function buildSafeSnapshotState({ source = {}, materialisedSnapshot = {}, tableReadiness = [], selectorOptions = {}, failureReason = "" } = {}) {
  const activeSnapshot = safeSnapshotMetadata(source);
  const materialised = safeSnapshotMetadata(materialisedSnapshot);
  const missingTableBlockers = missingTableBlockersFromReadiness(tableReadiness);
  const expectedTableCount = tableReadiness.length;
  const presentTableCount = tableReadiness.filter((table) => table.present === true).length;
  const expectedTablesPresent = expectedTableCount > 0 && missingTableBlockers.length === 0;
  const sourcePresent = activeSnapshot.present === true;
  const sourceReadable = activeSnapshot.readable === true;
  const sourceParseable = activeSnapshot.parseable === true;
  const completeEnoughForPreview = sourcePresent && sourceReadable && sourceParseable && expectedTablesPresent;
  const coverage = referenceOptionSourceCoverage(selectorOptions);
  return {
    title: "Source Readiness / Safe Snapshot State",
    state: completeEnoughForPreview ? "source-backed-safe-preview" : "fail-closed-source-warning",
    sourcePresent,
    sourceReadable,
    sourceParseable,
    activeSnapshot,
    snapshotActive: sourcePresent && sourceReadable && sourceParseable,
    materialisedSnapshot: materialised,
    snapshotMaterialised: materialised.present === true && materialised.readable === true,
    expectedTables: SELECTOR_CRITICAL_TABLES.map((table) => table),
    expectedTableCount,
    presentTableCount,
    missingTableCount: missingTableBlockers.length,
    expectedTablesPresent,
    expectedTableReadiness: tableReadiness,
    missingTables: missingTableBlockers.map((blocker) => blocker.table),
    missingTableBlockers,
    completeEnoughForPreview,
    safeForPreview: completeEnoughForPreview,
    readOnlyProductReference: completeEnoughForPreview,
    failClosed: !completeEnoughForPreview,
    warning: completeEnoughForPreview
      ? "Selector Reference source is present, readable, parseable, redacted, and complete enough for read-only product preview."
      : (failureReason || (missingTableBlockers.length ? "Selector Reference source is incomplete; preview must fail closed until missing table blockers are cleared." : "Selector Reference source is unavailable; preview must fail closed.")),
    referenceOptionSourceCoverage: coverage,
    sourceBackedFieldExplanation: coverage.sourceBackedExplanation,
    futureMappedFieldExplanation: coverage.futureMappedExplanation,
    sourceBackedFields: coverage.sourceBackedFields,
    futureMappedFields: coverage.futureMappedFields,
    safeRedaction: safeRedactionState(),
    boundaries: {
      readOnly: true,
      boardDataMutationEnabled: false,
      googleLiveRefreshEnabled: false,
      sourceMaterialisationEnabled: false,
      activeSnapshotWriteEnabled: false,
      generationEnabled: false,
      proofAuthority: false,
      rawRowsExposed: false,
      rawHeadersExposed: false,
      rawUsersExposed: false,
      credentialsExposed: false,
      providerIdsExposed: false,
      privatePathsExposed: false,
    },
  };
}

function pureRefStateStatus(snapshot) {
  const rows = tableRows(snapshot, "PURE_REF_STATE");
  return {
    present: tablePresent(snapshot, "PURE_REF_STATE"),
    count: rows.length,
    diagnosticOnly: true,
    productionProof: false,
  };
}

function usersRedactionStatus(snapshot) {
  const users = tableRows(snapshot, "USERS");
  return {
    present: tablePresent(snapshot, "USERS"),
    count: users.length,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    personalIdentifiersExposed: false,
    credentialsExposed: false,
    safeDerivedUses: [...USER_SAFE_DERIVED_USES],
    derivedAuthorityCapabilitySummary: userDerivedAuthorityCapabilitySummary(users),
  };
}

function sourceMetadata({ sourceStat = null, present = Boolean(sourceStat), readable = false, parseable = false } = {}) {
  const isFile = Boolean(sourceStat?.isFile?.());
  return {
    label: "runtime-authority-reference-active-snapshot",
    present: Boolean(present && isFile),
    readable: Boolean(readable && isFile),
    parseable: Boolean(parseable),
    modifiedTime: sourceStat?.mtime?.toISOString?.() || null,
    fileSize: sourceStat?.size ?? null,
  };
}

function fileMetadata({ label, fileStat = null, present = Boolean(fileStat), readable = false, parseable = null }) {
  const isFile = Boolean(fileStat?.isFile?.());
  return {
    label,
    present: Boolean(present && isFile),
    readable: Boolean(readable && isFile),
    parseable,
    modifiedTime: fileStat?.mtime?.toISOString?.() || null,
    fileSize: fileStat?.size ?? null,
  };
}

async function safeFileMetadata({ label, pathValue, fsApi = DEFAULT_FS_API } = {}) {
  if (!pathValue) return fileMetadata({ label, present: false, readable: false });
  try {
    const fileStat = await fsApi.stat(pathValue);
    return fileMetadata({ label, fileStat, present: true, readable: true });
  } catch (error) {
    return {
      label,
      present: false,
      readable: false,
      parseable: null,
      modifiedTime: null,
      fileSize: null,
      reason: error?.code || "unavailable",
    };
  }
}

function emptyTableSummary() {
  return SELECTOR_CRITICAL_TABLES.map((table) => ({
    table,
    present: false,
    rowCount: 0,
    headers: [],
    headersRedacted: true,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    headersReturned: false,
  }));
}

function statusFailure({ sourceStat = null, materialisedSnapshot = null, readable = false, error }) {
  const reason = error?.code || error?.name || "selector_reference_status_failed";
  const emptySnapshot = {};
  const source = sourceMetadata({
    sourceStat,
    present: Boolean(sourceStat),
    readable,
    parseable: false,
  });
  const tableReadiness = expectedTableReadiness(emptySnapshot);
  const selectorOptions = deriveSelectorReferenceOptionsFromSnapshot(emptySnapshot, {
    ok: false,
    source,
    constraints: {},
  });
  const sourceReadiness = buildSafeSnapshotState({
    source,
    materialisedSnapshot,
    tableReadiness,
    selectorOptions,
    failureReason: reason,
  });
  return {
    ok: false,
    endpoint: SELECTOR_REFERENCE_STATUS_PATH,
    owner: "runtime-server",
    ...SAFE_SELECTOR_REFERENCE_FLAGS,
    source,
    activeSnapshot: source,
    materialisedSnapshot,
    sourcePathLabel: "runtime-authority-reference-active-snapshot",
    sourcePresent: source.present,
    sourceReadable: source.readable,
    sourceParseable: source.parseable,
    modifiedTime: source.modifiedTime,
    fileSize: source.fileSize,
    expectedTables: [...SELECTOR_CRITICAL_TABLES],
    selectorCriticalTables: [...SELECTOR_CRITICAL_TABLES],
    presentTables: [],
    tableSummary: emptyTableSummary(),
    expectedTableReadiness: tableReadiness,
    missingTables: [...SELECTOR_CRITICAL_TABLES],
    missingTableBlockers: sourceReadiness.missingTableBlockers,
    usersRedactionStatus: {
      present: false,
      count: 0,
      rawRowsExposed: false,
      rawHeadersExposed: false,
      personalIdentifiersExposed: false,
      credentialsExposed: false,
      safeDerivedUses: [...USER_SAFE_DERIVED_USES],
      derivedAuthorityCapabilitySummary: userDerivedAuthorityCapabilitySummary([]),
    },
    pureRefStateStatus: {
      present: false,
      count: 0,
      diagnosticOnly: true,
      productionProof: false,
    },
    selectorOptions,
    sourceReadiness,
    safeSnapshotState: sourceReadiness,
    referenceOptionSourceCoverage: sourceReadiness.referenceOptionSourceCoverage,
    futureMappedFieldExplanation: sourceReadiness.futureMappedFieldExplanation,
    safeRedaction: sourceReadiness.safeRedaction,
    fallbackRiskFields: fallbackRiskFields(emptySnapshot),
    warnings: [
      reason,
      SELECTOR_FAKE_PROOF_WARNING,
      SELECTOR_FAKE_PROOF_WARNING_EXPANDED,
    ],
  };
}

export async function buildSelectorReferenceStatus({
  sourcePath,
  materialisedSnapshotPath = AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const materialisedSnapshot = await safeFileMetadata({
    label: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
    pathValue: materialisedSnapshotPath,
    fsApi,
  });

  let sourceStat = null;
  try {
    sourceStat = await fsApi.stat(sourcePath);
    const text = await fsApi.readFile(sourcePath, "utf-8");
    const snapshot = JSON.parse(text);
    const safeSnapshot = isPlainObject(snapshot) ? snapshot : {};
    const parseable = isPlainObject(snapshot);
    const tableSummaryRows = SELECTOR_CRITICAL_TABLES.map((table) => tableSummary(safeSnapshot, table));
    const presentTables = tableSummaryRows.filter((table) => table.present).map((table) => table.table);
    const missingTables = tableSummaryRows.filter((table) => !table.present).map((table) => table.table);
    const warnings = [
      ...(parseable ? [] : ["Selector Reference active snapshot parsed but did not contain a table object."]),
      ...missingTables.map((table) => `Missing Selector-critical table: ${table}.`),
      SELECTOR_FAKE_PROOF_WARNING,
      SELECTOR_FAKE_PROOF_WARNING_EXPANDED,
    ];
    const source = sourceMetadata({
      sourceStat,
      present: true,
      readable: true,
      parseable,
    });
    const selectorOptions = deriveSelectorReferenceOptionsFromSnapshot(safeSnapshot, {
      ok: parseable,
      source,
      constraints: {},
    });
    const tableReadiness = expectedTableReadiness(safeSnapshot);
    const sourceReadiness = buildSafeSnapshotState({
      source,
      materialisedSnapshot,
      tableReadiness,
      selectorOptions,
      failureReason: missingTables.length ? "Selector Reference source is incomplete; preview must fail closed until missing table blockers are cleared." : "",
    });

    return {
      ok: parseable,
      endpoint: SELECTOR_REFERENCE_STATUS_PATH,
      owner: "runtime-server",
      ...SAFE_SELECTOR_REFERENCE_FLAGS,
      source,
      activeSnapshot: source,
      materialisedSnapshot,
      sourcePathLabel: "runtime-authority-reference-active-snapshot",
      sourcePresent: source.present,
      sourceReadable: source.readable,
      sourceParseable: source.parseable,
      modifiedTime: source.modifiedTime,
      fileSize: source.fileSize,
      expectedTables: [...SELECTOR_CRITICAL_TABLES],
      selectorCriticalTables: [...SELECTOR_CRITICAL_TABLES],
      presentTables,
      tableSummary: tableSummaryRows,
      expectedTableReadiness: tableReadiness,
      missingTables,
      missingTableBlockers: sourceReadiness.missingTableBlockers,
      usersRedactionStatus: usersRedactionStatus(safeSnapshot),
      pureRefStateStatus: pureRefStateStatus(safeSnapshot),
      selectorOptions,
      sourceReadiness,
      safeSnapshotState: sourceReadiness,
      referenceOptionSourceCoverage: sourceReadiness.referenceOptionSourceCoverage,
      futureMappedFieldExplanation: sourceReadiness.futureMappedFieldExplanation,
      safeRedaction: sourceReadiness.safeRedaction,
      fallbackRiskFields: fallbackRiskFields(safeSnapshot),
      warnings,
    };
  } catch (error) {
    return statusFailure({
      sourceStat,
      materialisedSnapshot,
      readable: error?.name === "SyntaxError",
      error,
    });
  }
}
