import { mkdir, stat, writeFile } from "node:fs/promises";
import { win32 as pathWin32 } from "node:path";

export const AUTHORITY_REFERENCE_MATERIALISER_STATUS_PATH = "/api/authority-reference/materialiser/status";
export const AUTHORITY_REFERENCE_MATERIALISER_REFRESH_PATH = "/api/authority-reference/materialiser/refresh";

export const AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION = "REFRESH_MATERIALISED_SOURCE";

export const AUTHORITY_REFERENCE_RUNTIME_DATA_HOME = "C:\\ControlStack_RuntimeData\\authority-reference";
export const AUTHORITY_REFERENCE_MATERIALISED_ROOT = pathWin32.join(AUTHORITY_REFERENCE_RUNTIME_DATA_HOME, "materialised");
export const AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH = pathWin32.join(AUTHORITY_REFERENCE_MATERIALISED_ROOT, "novondb.json");
export const AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH = pathWin32.join(AUTHORITY_REFERENCE_RUNTIME_DATA_HOME, "novondb.json");
export const AUTHORITY_REFERENCE_ARCHIVE_ROOT = pathWin32.join(AUTHORITY_REFERENCE_RUNTIME_DATA_HOME, "archive");
export const CONTROLSTACK_DONOR_REPO_ROOT = "C:\\ControlStack";

export const AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL = "runtime-authority-reference-materialised-novondb";

export const AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES = Object.freeze([
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

export const AUTHORITY_REFERENCE_GOOGLE_EXPECTED_TABLES = AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES;

const DEFAULT_FS_API = Object.freeze({ stat, mkdir, writeFile });

const MATERIALISER_ENABLED_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_ENABLED";
const MATERIALISER_EXECUTION_ENABLED_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_EXECUTION_ENABLED";
const GOOGLE_SHEET_ID_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID";
const GOOGLE_CREDENTIALS_ENV = "GOOGLE_APPLICATION_CREDENTIALS";

const GOOGLE_SHEETS_READONLY_SCOPE = "https://www.googleapis.com/auth/spreadsheets.readonly";
const GOOGLE_SHEETS_MAX_COLUMN_RANGE = "A:ZZ";

const CREDENTIAL_FIELD_PATTERN = /(^|[_-])(private[_-]?key|client[_-]?secret|access[_-]?token|refresh[_-]?token|id[_-]?token|jwt|bearer|password|credential|credentials|api[_-]?key|service[_-]?account|oauth)([_-]|$)|google_application_credentials|client_email/i;

function readTextEnv(env, name) {
  return String(env?.[name] || "").trim();
}

function readBooleanEnv(env, name, fallback = false) {
  const raw = readTextEnv(env, name);
  if (!raw) return fallback;
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function safeTimestamp(now) {
  if (now instanceof Date) return now.toISOString();
  const parsed = new Date(now || Date.now());
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function publicFileMetadataFromStat(info) {
  return {
    present: Boolean(info?.isFile?.()),
    readable: Boolean(info?.isFile?.()),
    sizeBytes: Number.isFinite(info?.size) ? info.size : null,
    modifiedAt: info?.mtime?.toISOString?.() || null,
  };
}

async function safeFileMetadata(pathValue, fsApi = DEFAULT_FS_API) {
  try {
    const info = await fsApi.stat(pathValue);
    return publicFileMetadataFromStat(info);
  } catch (error) {
    return {
      present: false,
      readable: false,
      sizeBytes: null,
      modifiedAt: null,
      reason: error?.code || "unavailable",
    };
  }
}

async function credentialReadableStatus(env = process.env, fsApi = DEFAULT_FS_API) {
  const configured = Boolean(readTextEnv(env, GOOGLE_CREDENTIALS_ENV));
  if (!configured) return false;
  try {
    const info = await fsApi.stat(readTextEnv(env, GOOGLE_CREDENTIALS_ENV));
    return Boolean(info?.isFile?.());
  } catch {
    return false;
  }
}

function resolveWindowsPath(pathValue) {
  return pathWin32.resolve(String(pathValue || "").trim());
}

function pathEquals(left, right) {
  return resolveWindowsPath(left).toLowerCase() === resolveWindowsPath(right).toLowerCase();
}

function pathInsideRoot(candidate, root) {
  const resolvedCandidate = resolveWindowsPath(candidate).toLowerCase();
  const resolvedRoot = resolveWindowsPath(root).toLowerCase();
  const rootWithSep = resolvedRoot.endsWith(pathWin32.sep) ? resolvedRoot : `${resolvedRoot}${pathWin32.sep}`;
  return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(rootWithSep);
}

export function validateMaterialiserTargetPath(targetPath = AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH) {
  const candidate = String(targetPath || "").trim();
  if (!candidate) {
    return {
      ok: false,
      code: "target-not-configured",
      reason: "Materialiser target path is not configured.",
      targetPathLabel: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
    };
  }

  if (pathEquals(candidate, AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH)) {
    return {
      ok: false,
      code: "active-snapshot-target-rejected",
      reason: "The materialiser may not target the active authority/reference snapshot.",
      targetPathLabel: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
    };
  }

  if (pathInsideRoot(candidate, CONTROLSTACK_DONOR_REPO_ROOT)) {
    return {
      ok: false,
      code: "donor-path-target-rejected",
      reason: "The materialiser may not target donor repository paths.",
      targetPathLabel: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
    };
  }

  if (pathInsideRoot(candidate, AUTHORITY_REFERENCE_ARCHIVE_ROOT)) {
    return {
      ok: false,
      code: "archive-path-target-rejected",
      reason: "The materialiser may not target archive paths.",
      targetPathLabel: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
    };
  }

  if (!pathInsideRoot(candidate, AUTHORITY_REFERENCE_MATERIALISED_ROOT)) {
    return {
      ok: false,
      code: "target-outside-materialised-root",
      reason: "The materialiser target must remain inside the authority/reference materialised root.",
      targetPathLabel: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
    };
  }

  if (!pathEquals(candidate, AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH)) {
    return {
      ok: false,
      code: "target-not-approved-materialised-novondb",
      reason: "The materialiser may only target the approved materialised novondb.json path.",
      targetPathLabel: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
    };
  }

  return {
    ok: true,
    code: "target-confined",
    targetPath: AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
    targetPathLabel: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
  };
}

function blocker(code, reason, severity = "blocking") {
  return { code, severity, reason };
}

function tableRows(snapshot, tableName) {
  return Array.isArray(snapshot?.[tableName]) ? snapshot[tableName] : [];
}

function buildSafeTableSummary(snapshot) {
  return AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES.map((table) => {
    const rows = tableRows(snapshot, table);
    const present = Array.isArray(snapshot?.[table]);
    return {
      table,
      present,
      rowCount: rows.length,
      rawRowsExposed: false,
      rawHeadersExposed: false,
      headersReturned: false,
    };
  });
}

function rawProviderResponseShapeDetected(value) {
  if (!isPlainObject(value)) return false;
  const keys = new Set(Object.keys(value));
  if (keys.has("range") && keys.has("majorDimension") && keys.has("values")) return true;
  if (keys.has("spreadsheetId") && keys.has("sheets")) return true;
  if (keys.has("data") && keys.has("status") && (keys.has("headers") || keys.has("config") || keys.has("request"))) return true;
  if (keys.has("headers") && keys.has("config") && keys.has("request")) return true;
  return false;
}

function collectRawProviderResponseShapes(value, findings = []) {
  if (findings.length >= 20) return findings;
  if (rawProviderResponseShapeDetected(value)) {
    findings.push("raw-provider-response-shape");
    return findings;
  }
  if (Array.isArray(value)) {
    value.slice(0, 100).forEach((item) => collectRawProviderResponseShapes(item, findings));
    return findings;
  }
  if (!isPlainObject(value)) return findings;
  for (const nestedValue of Object.values(value)) {
    collectRawProviderResponseShapes(nestedValue, findings);
    if (findings.length >= 20) return findings;
  }
  return findings;
}

function rawGoogleResponseDetected(value) {
  return collectRawProviderResponseShapes(value).length > 0;
}

function collectCredentialLookingFields(value, path = [], findings = []) {
  if (findings.length >= 20) return findings;
  if (Array.isArray(value)) {
    value.slice(0, 100).forEach((item, index) => collectCredentialLookingFields(item, [...path, String(index)], findings));
    return findings;
  }
  if (!isPlainObject(value)) return findings;
  for (const [key, nestedValue] of Object.entries(value)) {
    if (CREDENTIAL_FIELD_PATTERN.test(key)) {
      findings.push(path.length ? `${path.join(".")}.${key}` : key);
      if (findings.length >= 20) return findings;
    }
    collectCredentialLookingFields(nestedValue, [...path, key], findings);
    if (findings.length >= 20) return findings;
  }
  return findings;
}

function tableRowsAreObjects(snapshot, tableName) {
  const rows = tableRows(snapshot, tableName);
  return rows.every((row) => isPlainObject(row));
}

function topLevelArrayTables(snapshot) {
  return Object.entries(snapshot)
    .filter(([, value]) => Array.isArray(value))
    .map(([table, rows]) => ({ table, rows }));
}

function normaliseHeaderCell(value, index) {
  const text = String(value ?? "").trim();
  return text || `__blank_header_${index + 1}`;
}

function normaliseCellValue(value) {
  if (value === null || value === undefined) return "";
  if (typeof value === "string") return value.trim();
  return value;
}

function cellHasValue(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === "string") return value.trim() !== "";
  return true;
}

export function normaliseGoogleSheetHeaders(headerRow = [], columnCount = headerRow.length) {
  const headers = [];
  const used = new Set();
  const seenBaseCounts = new Map();
  for (let index = 0; index < columnCount; index += 1) {
    const base = normaliseHeaderCell(headerRow[index], index);
    const nextCount = (seenBaseCounts.get(base) || 0) + 1;
    seenBaseCounts.set(base, nextCount);
    let candidate = nextCount === 1 ? base : `${base}__${nextCount}`;
    let collisionCount = nextCount;
    while (used.has(candidate)) {
      collisionCount += 1;
      candidate = `${base}__${collisionCount}`;
    }
    used.add(candidate);
    headers.push(candidate);
  }
  return headers;
}

export function normaliseGoogleSheetRowsToObjects(values = []) {
  if (!Array.isArray(values) || values.length === 0) return [];
  const rows = values.map((row) => (Array.isArray(row) ? row : []));
  const columnCount = Math.max(...rows.map((row) => row.length), 0);
  if (columnCount === 0) return [];
  const headers = normaliseGoogleSheetHeaders(rows[0], columnCount);
  return rows.slice(1)
    .filter((row) => row.some(cellHasValue))
    .map((row) => headers.reduce((record, header, index) => {
      record[header] = normaliseCellValue(row[index]);
      return record;
    }, {}));
}

function quoteGoogleSheetTitle(title) {
  return `'${String(title || "").replace(/'/g, "''")}'!${GOOGLE_SHEETS_MAX_COLUMN_RANGE}`;
}

function canonicalTableName(value) {
  return String(value || "").trim().toUpperCase();
}

function expectedTableLookup() {
  return new Map(AUTHORITY_REFERENCE_GOOGLE_EXPECTED_TABLES.map((table) => [canonicalTableName(table), table]));
}

function sheetTitlesFromMetadata(metadataResponse) {
  const sheets = Array.isArray(metadataResponse?.data?.sheets) ? metadataResponse.data.sheets : [];
  return sheets.map((sheet) => String(sheet?.properties?.title || "").trim()).filter(Boolean);
}

export function materialiseGoogleSheetValueRanges({ sheetTitles = [], valueRanges = [] } = {}) {
  const expectedByCanonical = expectedTableLookup();
  const presentTabs = sheetTitles
    .map((title) => ({ title, table: expectedByCanonical.get(canonicalTableName(title)) }))
    .filter((item) => item.table);
  const materialised = {};
  presentTabs.forEach(({ table }, index) => {
    const values = Array.isArray(valueRanges?.[index]?.values) ? valueRanges[index].values : [];
    materialised[table] = normaliseGoogleSheetRowsToObjects(values);
  });
  return materialised;
}

export async function buildAuthorityReferenceGoogleReaderPreflight({
  env = process.env,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const googleSheetConfigured = Boolean(readTextEnv(env, GOOGLE_SHEET_ID_ENV));
  const googleCredentialsConfigured = Boolean(readTextEnv(env, GOOGLE_CREDENTIALS_ENV));
  const googleCredentialsReadable = await credentialReadableStatus(env, fsApi);
  const blockers = [
    ...(googleSheetConfigured ? [] : [blocker("google-sheet-not-configured", "Google Sheet ID is not configured.", "configuration")]),
    ...(googleCredentialsConfigured ? [] : [blocker("google-credentials-not-configured", "Google credentials are not configured.", "configuration")]),
    ...(googleCredentialsConfigured && !googleCredentialsReadable ? [blocker("google-credentials-not-readable", "Configured Google credentials path is not readable.", "configuration")] : []),
  ];

  return {
    ok: blockers.length === 0,
    allowed: blockers.length === 0,
    serverSideOnly: true,
    browserCallable: false,
    googleSheetConfigured,
    googleCredentialsConfigured,
    googleCredentialsReadable,
    credentialPathReturned: false,
    credentialValueReturned: false,
    credentialContentsReturned: false,
    sheetIdReturned: false,
    rawGoogleResponseReturned: false,
    rawSheetRowsReturned: false,
    blockers,
  };
}

export function createGoogleSheetsAuthorityReferenceReader({
  env = process.env,
  fsApi = DEFAULT_FS_API,
  googleApiModule = null,
} = {}) {
  return {
    provider: "google-sheets",
    serverSideOnly: true,
    async preflight() {
      return buildAuthorityReferenceGoogleReaderPreflight({ env, fsApi });
    },
    async read() {
      const preflight = await buildAuthorityReferenceGoogleReaderPreflight({ env, fsApi });
      if (!preflight.allowed) {
        const error = new Error("google_reader_preflight_blocked");
        error.code = "google-reader-preflight-blocked";
        throw error;
      }

      const sheetId = readTextEnv(env, GOOGLE_SHEET_ID_ENV);
      const apiModule = googleApiModule || await import("googleapis");
      const google = apiModule.google || apiModule.default?.google;
      if (!google?.auth?.GoogleAuth || typeof google?.sheets !== "function") {
        const error = new Error("googleapis_unavailable");
        error.code = "googleapis-unavailable";
        throw error;
      }

      const auth = new google.auth.GoogleAuth({
        keyFile: readTextEnv(env, GOOGLE_CREDENTIALS_ENV),
        scopes: [GOOGLE_SHEETS_READONLY_SCOPE],
      });
      const authClient = await auth.getClient();
      const sheets = google.sheets({ version: "v4", auth: authClient });

      const metadataResponse = await sheets.spreadsheets.get({
        spreadsheetId: sheetId,
        fields: "sheets.properties.title",
      });
      const sheetTitles = sheetTitlesFromMetadata(metadataResponse);
      const expectedByCanonical = expectedTableLookup();
      const presentExpectedTitles = sheetTitles.filter((title) => expectedByCanonical.has(canonicalTableName(title)));
      if (presentExpectedTitles.length === 0) return {};

      const valuesResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId: sheetId,
        ranges: presentExpectedTitles.map(quoteGoogleSheetTitle),
        majorDimension: "ROWS",
        valueRenderOption: "UNFORMATTED_VALUE",
        dateTimeRenderOption: "FORMATTED_STRING",
      });

      return materialiseGoogleSheetValueRanges({
        sheetTitles: presentExpectedTitles,
        valueRanges: valuesResponse?.data?.valueRanges || [],
      });
    },
  };
}

export function validateMaterialisedAuthorityReferenceObject(value) {
  const blockers = [];

  if (!isPlainObject(value)) {
    return {
      ok: false,
      blockers: [blocker("materialised-object-not-plain-object", "Materialised authority/reference data must be a plain JSON object.")],
      summary: {
        rawRowsExposed: false,
        rawGoogleResponseExposed: false,
        fullMaterialisedJsonExposed: false,
      },
    };
  }

  if (rawGoogleResponseDetected(value)) {
    blockers.push(blocker("raw-google-response-detected", "Raw Google API response objects must not be written as materialised authority/reference data."));
  }

  const credentialFields = collectCredentialLookingFields(value);
  if (credentialFields.length > 0) {
    blockers.push(blocker("credential-looking-fields-detected", "Credential-looking fields are not allowed in materialised authority/reference data."));
  }

  const tableSummary = buildSafeTableSummary(value);
  const missingTables = tableSummary.filter((table) => !table.present).map((table) => table.table);
  const nonArrayExpectedTables = AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES.filter((table) => value[table] !== undefined && !Array.isArray(value[table]));

  if (!Array.isArray(value.USERS)) {
    blockers.push(blocker("users-table-missing", "USERS must exist as an array."));
  }

  if (nonArrayExpectedTables.length > 0) {
    blockers.push(blocker("expected-table-not-array", "Expected top-level authority/reference tables must be arrays."));
  }

  for (const { table, rows } of topLevelArrayTables(value)) {
    if (!rows.every((row) => isPlainObject(row))) {
      blockers.push(blocker("table-row-not-object", `Rows in ${table} must be plain objects.`));
      break;
    }
  }

  for (const table of AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES) {
    if (Array.isArray(value[table]) && !tableRowsAreObjects(value, table)) {
      blockers.push(blocker("selector-critical-table-row-not-object", `Rows in selector-critical table ${table} must be plain objects.`));
      break;
    }
  }

  try {
    const text = JSON.stringify(value);
    const reparsed = JSON.parse(text);
    if (!isPlainObject(reparsed)) {
      blockers.push(blocker("json-roundtrip-not-object", "Materialised authority/reference data did not round-trip as a JSON object."));
    }
  } catch {
    blockers.push(blocker("json-roundtrip-failed", "Materialised authority/reference data must stringify and parse as JSON."));
  }

  const users = tableRows(value, "USERS");
  const selectorCriticalPresent = tableSummary.filter((table) => table.present).map((table) => table.table);

  return {
    ok: blockers.length === 0,
    blockers,
    summary: {
      topLevelTableCount: topLevelArrayTables(value).length,
      selectorCriticalTables: [...AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES],
      selectorCriticalPresent,
      missingTables,
      tableSummary,
      users: {
        present: Array.isArray(value.USERS),
        count: users.length,
        rawRowsExposed: false,
        rawHeadersExposed: false,
        userEmailsExposed: false,
      },
      rawRowsExposed: false,
      rawGoogleResponseExposed: false,
      fullMaterialisedJsonExposed: false,
    },
  };
}

export async function buildAuthorityReferenceMaterialiserStatus({
  env = process.env,
  fsApi = DEFAULT_FS_API,
  now = new Date(),
  targetPath = AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
} = {}) {
  const targetValidation = validateMaterialiserTargetPath(targetPath);
  const googlePreflight = await buildAuthorityReferenceGoogleReaderPreflight({ env, fsApi });
  const targetFile = targetValidation.ok
    ? await safeFileMetadata(targetValidation.targetPath, fsApi)
    : { present: false, readable: false, sizeBytes: null, modifiedAt: null, reason: targetValidation.code };

  return {
    ok: true,
    endpoint: AUTHORITY_REFERENCE_MATERIALISER_STATUS_PATH,
    owner: "runtime-server",
    source: "authority-reference-materialiser-google-reader-runtime-native",
    status: googlePreflight.allowed ? "google-reader-configured" : "google-reader-unconfigured-safe",
    timestamp: safeTimestamp(now),
    normalBootDependency: false,
    adminOnly: true,
    nonBootCritical: true,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    rawGoogleResponseExposed: false,
    rawSheetRowsExposed: false,
    fullMaterialisedJsonExposed: false,
    activeSnapshotWriteEnabled: false,
    googleNetworkCallsEnabled: false,
    googleNetworkCallPolicy: "explicit-materialiser-refresh-only-after-server-side-preflight",
    googleApiDependencyRequired: false,
    googleApiImportPolicy: "dynamic-server-side-refresh-path-only",
    materialiserEnabled: readBooleanEnv(env, MATERIALISER_ENABLED_ENV, false),
    materialiserExecutionEnabled: readBooleanEnv(env, MATERIALISER_EXECUTION_ENABLED_ENV, false),
    googleSheetConfigured: googlePreflight.googleSheetConfigured,
    googleCredentialsConfigured: googlePreflight.googleCredentialsConfigured,
    googleCredentialsReadable: googlePreflight.googleCredentialsReadable,
    gates: {
      materialiserEnabled: readBooleanEnv(env, MATERIALISER_ENABLED_ENV, false),
      materialiserExecutionEnabled: readBooleanEnv(env, MATERIALISER_EXECUTION_ENABLED_ENV, false),
    },
    google: {
      provider: "google-sheets",
      serverSideOnly: true,
      browserCallable: false,
      expectedTables: [...AUTHORITY_REFERENCE_GOOGLE_EXPECTED_TABLES],
      googleSheetConfigured: googlePreflight.googleSheetConfigured,
      googleCredentialsConfigured: googlePreflight.googleCredentialsConfigured,
      googleCredentialsReadable: googlePreflight.googleCredentialsReadable,
      credentialPathReturned: false,
      credentialValueReturned: false,
      credentialContentsRead: false,
      credentialContentsReturned: false,
      sheetIdReturned: false,
      rawGoogleResponseReturned: false,
      rawSheetRowsReturned: false,
      liveCallPolicy: "explicit-refresh-only",
      preflight: googlePreflight,
    },
    target: {
      label: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
      confined: targetValidation.ok,
      validationCode: targetValidation.code,
      activeSnapshotTarget: false,
      donorPathTarget: false,
      archivePathTarget: false,
      file: targetFile,
    },
    writePolicy: {
      materialisedWriteDefault: false,
      activeSnapshotWriteEnabled: false,
      activeSnapshotWritePath: "separate-promotion-endpoint-only",
      confirmationRequired: AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION,
      reason: "Google Sheets reading is server-side and refresh-only. Dry-run writes nothing; live materialised write remains gated and disabled by default.",
    },
    blockers: [
      ...(readBooleanEnv(env, MATERIALISER_ENABLED_ENV, false) ? [] : [blocker("materialiser-disabled", "Materialiser gate is disabled by default.")]),
      ...(readBooleanEnv(env, MATERIALISER_EXECUTION_ENABLED_ENV, false) ? [] : [blocker("materialiser-execution-disabled", "Materialiser execution gate is disabled by default.")]),
      ...googlePreflight.blockers,
      ...(targetValidation.ok ? [] : [blocker(targetValidation.code, targetValidation.reason)]),
    ],
  };
}

function exactConfirmationProvided(body) {
  if (!isPlainObject(body)) return false;
  const keys = Object.keys(body);
  return keys.length === 1 && body.confirmation === AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION;
}

async function readFromInjectedReader(reader) {
  if (!reader || typeof reader.read !== "function") return null;
  try {
    const value = await reader.read();
    return {
      ok: true,
      value,
      provider: reader.fake === true ? "injected-fake-reader" : "injected-reader",
      googleNetworkCallAttempted: false,
    };
  } catch {
    return {
      ok: false,
      code: "injected-reader-failed",
      reason: "Injected reader failed without exposing raw rows or stack traces.",
      provider: reader.fake === true ? "injected-fake-reader" : "injected-reader",
      googleNetworkCallAttempted: false,
    };
  }
}

async function readFromGoogleReader({ env, fsApi, reader = null } = {}) {
  const injected = await readFromInjectedReader(reader);
  if (injected) return injected;

  const googleReader = createGoogleSheetsAuthorityReferenceReader({ env, fsApi });
  const preflight = await googleReader.preflight();
  if (!preflight.allowed) {
    return {
      ok: false,
      code: "google-reader-preflight-blocked",
      reason: "Google Sheets reader preflight blocked refresh before any provider call.",
      provider: "google-sheets",
      googleNetworkCallAttempted: false,
      preflight,
    };
  }

  try {
    const value = await googleReader.read();
    return {
      ok: true,
      value,
      provider: "google-sheets",
      googleNetworkCallAttempted: true,
      preflight,
    };
  } catch {
    return {
      ok: false,
      code: "google-reader-failed",
      reason: "Google Sheets reader failed without exposing raw provider responses, credentials, or sheet rows.",
      provider: "google-sheets",
      googleNetworkCallAttempted: true,
      preflight,
    };
  }
}

function safeValidationForNoReader(readerResult, dryRun) {
  return {
    ok: false,
    summary: {
      rawRowsExposed: false,
      rawGoogleResponseExposed: false,
      fullMaterialisedJsonExposed: false,
    },
    blockers: [blocker(readerResult.code, readerResult.reason, dryRun ? "configuration" : "blocking")],
  };
}

export async function refreshAuthorityReferenceMaterialiser({
  env = process.env,
  fsApi = DEFAULT_FS_API,
  now = new Date(),
  dryRun = true,
  body = {},
  reader = null,
  targetPath = AUTHORITY_REFERENCE_MATERIALISED_TARGET_PATH,
  allowMaterialisedWrite = false,
} = {}) {
  const status = await buildAuthorityReferenceMaterialiserStatus({ env, fsApi, now, targetPath });
  const targetValidation = validateMaterialiserTargetPath(targetPath);
  const googlePreflight = await buildAuthorityReferenceGoogleReaderPreflight({ env, fsApi });
  const blockers = [];
  const materialiserEnabled = status.gates.materialiserEnabled === true;
  const materialiserExecutionEnabled = status.gates.materialiserExecutionEnabled === true;

  if (!dryRun) {
    if (!materialiserEnabled) blockers.push(blocker("materialiser-disabled", "Live materialised refresh requires CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_ENABLED=true."));
    if (!materialiserExecutionEnabled) blockers.push(blocker("materialiser-execution-disabled", "Live materialised refresh requires CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_EXECUTION_ENABLED=true."));
    if (!exactConfirmationProvided(body)) blockers.push(blocker("confirmation-required", "Live materialised refresh requires exact confirmation body."));
    blockers.push(...googlePreflight.blockers.map((item) => ({ ...item, severity: "blocking" })));
  }

  if (!targetValidation.ok) blockers.push(blocker(targetValidation.code, targetValidation.reason));

  const readerResult = await readFromGoogleReader({ env, fsApi, reader });
  let validation = null;
  if (!readerResult.ok) {
    if (dryRun || !readerResult.preflight?.blockers?.length) {
      blockers.push(blocker(readerResult.code, readerResult.reason, dryRun ? "configuration" : "blocking"));
    }
  } else {
    validation = validateMaterialisedAuthorityReferenceObject(readerResult.value);
    blockers.push(...validation.blockers);
  }

  const canWriteMaterialised = !dryRun
    && blockers.length === 0
    && allowMaterialisedWrite === true
    && targetValidation.ok
    && validation?.ok === true
    && googlePreflight.allowed === true;

  if (canWriteMaterialised) {
    await fsApi.mkdir(AUTHORITY_REFERENCE_MATERIALISED_ROOT, { recursive: true });
    await fsApi.writeFile(targetValidation.targetPath, `${JSON.stringify(readerResult.value, null, 2)}\n`, "utf-8");
  } else if (!dryRun && blockers.length === 0) {
    blockers.push(blocker("materialised-write-disabled-by-default", "Materialised file write remains disabled by default for the runtime endpoint."));
  }

  const effectiveOk = dryRun ? true : blockers.length === 0 && canWriteMaterialised;
  const httpStatus = dryRun ? 200 : effectiveOk ? 200 : 409;
  const resultStatus = dryRun
    ? validation?.ok === false
      ? "dry-run-validation-blocked"
      : readerResult.ok
        ? "dry-run-ready"
        : readerResult.code === "google-reader-preflight-blocked"
          ? "dry-run-configuration-blocked"
          : "dry-run-reader-blocked"
    : effectiveOk
      ? "materialised-refresh-completed"
      : "live-refresh-blocked";

  return {
    ok: effectiveOk,
    httpStatus,
    endpoint: AUTHORITY_REFERENCE_MATERIALISER_REFRESH_PATH,
    owner: "runtime-server",
    source: "authority-reference-materialiser-google-reader-runtime-native",
    status: resultStatus,
    timestamp: safeTimestamp(now),
    dryRun: Boolean(dryRun),
    adminOnly: true,
    nonBootCritical: true,
    normalBootDependency: false,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    googleNetworkCallAttempted: readerResult.googleNetworkCallAttempted === true,
    googleNetworkCallsEnabled: readerResult.googleNetworkCallAttempted === true,
    credentialPathReturned: false,
    credentialValueReturned: false,
    credentialContentsReturned: false,
    sheetIdReturned: false,
    rawGoogleResponseExposed: false,
    rawSheetRowsExposed: false,
    rawRowsExposed: false,
    fullMaterialisedJsonExposed: false,
    activeSnapshotWriteAttempted: false,
    activeSnapshotWriteEnabled: false,
    materialisedWriteAttempted: canWriteMaterialised,
    target: {
      label: AUTHORITY_REFERENCE_MATERIALISER_TARGET_LABEL,
      confined: targetValidation.ok,
      validationCode: targetValidation.code,
    },
    gates: status.gates,
    google: {
      ...status.google,
      readerProvider: readerResult.provider,
      networkCallAttempted: readerResult.googleNetworkCallAttempted === true,
      preflight: googlePreflight,
    },
    validation: validation
      ? {
          ok: validation.ok,
          summary: validation.summary,
          blockers: validation.blockers,
        }
      : safeValidationForNoReader(readerResult, dryRun),
    blockers,
    writePolicy: {
      materialisedWriteEnabled: canWriteMaterialised,
      activeSnapshotWriteEnabled: false,
      activeSnapshotWritePath: "separate-promotion-endpoint-only",
      dryRunWritesNothing: Boolean(dryRun),
      confirmationRequired: AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION,
      reason: dryRun
        ? "Dry-run completed without writing files."
        : effectiveOk
          ? "Materialised file write completed through controlled server-side path only. Active snapshot was not touched."
          : "Live refresh is blocked until all gates, exact confirmation, Google preflight, target confinement, validation, and explicit controlled write conditions pass.",
    },
  };
}
