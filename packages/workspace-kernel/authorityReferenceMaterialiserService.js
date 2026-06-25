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

const DEFAULT_FS_API = Object.freeze({ stat, mkdir, writeFile });

const MATERIALISER_ENABLED_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_ENABLED";
const MATERIALISER_EXECUTION_ENABLED_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_EXECUTION_ENABLED";
const GOOGLE_SHEET_ID_ENV = "CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID";
const GOOGLE_CREDENTIALS_ENV = "GOOGLE_APPLICATION_CREDENTIALS";

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

function rawGoogleResponseDetected(value) {
  if (!isPlainObject(value)) return false;
  const keys = new Set(Object.keys(value));
  if (keys.has("range") && keys.has("majorDimension") && keys.has("values")) return true;
  if (keys.has("spreadsheetId") && keys.has("sheets")) return true;
  if (keys.has("data") && keys.has("status") && (keys.has("headers") || keys.has("config") || keys.has("request"))) return true;
  return false;
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
  const googleCredentialsConfigured = Boolean(readTextEnv(env, GOOGLE_CREDENTIALS_ENV));
  const googleCredentialsReadable = await credentialReadableStatus(env, fsApi);
  const targetFile = targetValidation.ok
    ? await safeFileMetadata(targetValidation.targetPath, fsApi)
    : { present: false, readable: false, sizeBytes: null, modifiedAt: null, reason: targetValidation.code };

  return {
    ok: true,
    endpoint: AUTHORITY_REFERENCE_MATERIALISER_STATUS_PATH,
    owner: "runtime-server",
    source: "authority-reference-materialiser-runtime-native-foundation",
    status: "status-only-foundation",
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
    googleApiDependencyRequired: false,
    materialiserEnabled: readBooleanEnv(env, MATERIALISER_ENABLED_ENV, false),
    materialiserExecutionEnabled: readBooleanEnv(env, MATERIALISER_EXECUTION_ENABLED_ENV, false),
    googleSheetConfigured: Boolean(readTextEnv(env, GOOGLE_SHEET_ID_ENV)),
    googleCredentialsConfigured,
    googleCredentialsReadable,
    gates: {
      materialiserEnabled: readBooleanEnv(env, MATERIALISER_ENABLED_ENV, false),
      materialiserExecutionEnabled: readBooleanEnv(env, MATERIALISER_EXECUTION_ENABLED_ENV, false),
    },
    google: {
      googleSheetConfigured: Boolean(readTextEnv(env, GOOGLE_SHEET_ID_ENV)),
      googleCredentialsConfigured,
      googleCredentialsReadable,
      credentialValueReturned: false,
      credentialContentsRead: false,
      credentialContentsReturned: false,
      sheetIdReturned: false,
      liveCallPolicy: "blocked-this-slice",
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
      reason: "This slice exposes safe status and fake-reader refresh preflight only. It does not call Google or write the active snapshot.",
    },
    blockers: [
      ...(readBooleanEnv(env, MATERIALISER_ENABLED_ENV, false) ? [] : [blocker("materialiser-disabled", "Materialiser gate is disabled by default.")]),
      ...(readBooleanEnv(env, MATERIALISER_EXECUTION_ENABLED_ENV, false) ? [] : [blocker("materialiser-execution-disabled", "Materialiser execution gate is disabled by default.")]),
      ...(readTextEnv(env, GOOGLE_SHEET_ID_ENV) ? [] : [blocker("google-sheet-not-configured", "Google Sheet ID is not configured.", "configuration")]),
      ...(googleCredentialsConfigured ? [] : [blocker("google-credentials-not-configured", "Google credentials are not configured.", "configuration")]),
      ...(googleCredentialsConfigured && !googleCredentialsReadable ? [blocker("google-credentials-not-readable", "Configured Google credentials path is not readable.", "configuration")] : []),
      ...(targetValidation.ok ? [] : [blocker(targetValidation.code, targetValidation.reason)]),
      blocker("google-live-call-blocked-this-slice", "No real Google network call is implemented in this foundation slice.", "intentional-block"),
    ],
  };
}

function exactConfirmationProvided(body) {
  if (!isPlainObject(body)) return false;
  const keys = Object.keys(body);
  return keys.length === 1 && body.confirmation === AUTHORITY_REFERENCE_MATERIALISER_CONFIRMATION;
}

async function readFromInjectedFakeReader(reader) {
  if (!reader || typeof reader.read !== "function" || reader.fake !== true) {
    return {
      ok: false,
      code: "fake-reader-required-this-slice",
      reason: "Refresh requires an injected fake reader in this foundation slice. No Google reader is active.",
    };
  }
  try {
    const value = await reader.read();
    return { ok: true, value };
  } catch {
    return {
      ok: false,
      code: "fake-reader-failed",
      reason: "Injected fake reader failed without exposing raw rows or stack traces.",
    };
  }
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
  const blockers = [];
  const materialiserEnabled = status.gates.materialiserEnabled === true;
  const materialiserExecutionEnabled = status.gates.materialiserExecutionEnabled === true;

  if (!dryRun) {
    if (!materialiserEnabled) blockers.push(blocker("materialiser-disabled", "Live materialised refresh requires CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_ENABLED=true."));
    if (!materialiserExecutionEnabled) blockers.push(blocker("materialiser-execution-disabled", "Live materialised refresh requires CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_EXECUTION_ENABLED=true."));
    if (!exactConfirmationProvided(body)) blockers.push(blocker("confirmation-required", "Live materialised refresh requires exact confirmation body."));
  }

  if (!targetValidation.ok) blockers.push(blocker(targetValidation.code, targetValidation.reason));

  const readerResult = await readFromInjectedFakeReader(reader);
  let validation = null;
  if (!readerResult.ok) {
    blockers.push(blocker(readerResult.code, readerResult.reason, dryRun ? "configuration" : "blocking"));
  } else {
    validation = validateMaterialisedAuthorityReferenceObject(readerResult.value);
    blockers.push(...validation.blockers);
  }

  const canWriteMaterialised = !dryRun
    && blockers.length === 0
    && allowMaterialisedWrite === true
    && targetValidation.ok
    && validation?.ok === true;

  if (canWriteMaterialised) {
    await fsApi.mkdir(AUTHORITY_REFERENCE_MATERIALISED_ROOT, { recursive: true });
    await fsApi.writeFile(targetValidation.targetPath, `${JSON.stringify(readerResult.value, null, 2)}\n`, "utf-8");
  } else if (!dryRun && blockers.length === 0) {
    blockers.push(blocker("materialised-write-disabled-this-slice", "Materialised file write remains disabled unless explicitly enabled with a fake reader and controlled writer."));
  }

  const effectiveOk = dryRun ? true : blockers.length === 0 && canWriteMaterialised;
  const httpStatus = dryRun ? 200 : effectiveOk ? 200 : 409;
  const resultStatus = dryRun
    ? validation?.ok === false
      ? "dry-run-validation-blocked"
      : readerResult.ok
        ? "dry-run-ready"
        : "dry-run-no-reader"
    : effectiveOk
      ? "materialised-refresh-completed"
      : "live-refresh-blocked";

  return {
    ok: effectiveOk,
    httpStatus,
    endpoint: AUTHORITY_REFERENCE_MATERIALISER_REFRESH_PATH,
    owner: "runtime-server",
    source: "authority-reference-materialiser-runtime-native-foundation",
    status: resultStatus,
    timestamp: safeTimestamp(now),
    dryRun: Boolean(dryRun),
    adminOnly: true,
    nonBootCritical: true,
    normalBootDependency: false,
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    googleNetworkCallAttempted: false,
    googleNetworkCallsEnabled: false,
    credentialValueReturned: false,
    credentialContentsRead: false,
    credentialContentsReturned: false,
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
    google: status.google,
    validation: validation
      ? {
          ok: validation.ok,
          summary: validation.summary,
          blockers: validation.blockers,
        }
      : {
          ok: false,
          summary: {
            rawRowsExposed: false,
            rawGoogleResponseExposed: false,
            fullMaterialisedJsonExposed: false,
          },
          blockers: [blocker(readerResult.code, readerResult.reason, dryRun ? "configuration" : "blocking")],
        },
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
          ? "Materialised file write completed through controlled fake-reader path only."
          : "Live refresh is blocked until all gates, exact confirmation, target confinement, validation, and controlled fake-reader write conditions pass.",
    },
  };
}
