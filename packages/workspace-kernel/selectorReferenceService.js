import { readFile, stat } from "node:fs/promises";

import {
  AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
  AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
} from "./authorityReferenceMaterialiserService.js";

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

function tableRows(snapshot, tableName) {
  const value = snapshot?.[tableName];
  return Array.isArray(value) ? value : [];
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
  const present = Array.isArray(snapshot?.[tableName]);
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

function pureRefStateStatus(snapshot) {
  const rows = tableRows(snapshot, "PURE_REF_STATE");
  return {
    present: Array.isArray(snapshot?.PURE_REF_STATE),
    count: rows.length,
    diagnosticOnly: true,
    productionProof: false,
  };
}

function usersRedactionStatus(snapshot) {
  const users = tableRows(snapshot, "USERS");
  return {
    present: Array.isArray(snapshot?.USERS),
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
    missingTables: [...SELECTOR_CRITICAL_TABLES],
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
      missingTables,
      usersRedactionStatus: usersRedactionStatus(safeSnapshot),
      pureRefStateStatus: pureRefStateStatus(safeSnapshot),
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
