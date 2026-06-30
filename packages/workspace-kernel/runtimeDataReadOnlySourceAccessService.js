import { createHash } from "node:crypto";
import { readFile, stat } from "node:fs/promises";
import { win32 as pathWin32 } from "node:path";

import {
  AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
  AUTHORITY_REFERENCE_RUNTIME_DATA_HOME,
  AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES,
} from "./authorityReferenceMaterialiserService.js";

export const RUNTIMEDATA_READONLY_SOURCE_ACCESS_LABEL = "runtime-authority-reference-active-snapshot";
export const RUNTIMEDATA_READONLY_SOURCE_ACCESS_STATE = "read_only_internal_source_loader";

const DEFAULT_FS_API = Object.freeze({ readFile, stat });

const READONLY_ACCESS_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  internalOnly: true,
  diagnosticOnly: false,
  serverSideOnly: true,
  publicRouteAdded: false,
  postEndpointAdded: false,
  sourceStatusReadOnly: true,
  writeEnabled: false,
  runtimeDataMutationEnabled: false,
  boardDataWriteEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  selectedResultPersistenceEnabled: false,
  engineExecutionEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  iesGenerationEnabled: false,
  labProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregAssignmentEnabled: false,
  hiddenWriteBackEnabled: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  rawRowsExposed: false,
  rawHeadersExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  rawSnapshotSerialized: false,
});

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value));
}

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function windowsResolve(value) {
  return pathWin32.resolve(String(value || "").trim());
}

function pathEquals(left, right) {
  return windowsResolve(left).toLowerCase() === windowsResolve(right).toLowerCase();
}

function pathInsideRoot(candidate, root) {
  const resolvedCandidate = windowsResolve(candidate).toLowerCase();
  const resolvedRoot = windowsResolve(root).toLowerCase();
  const rootWithSep = resolvedRoot.endsWith(pathWin32.sep) ? resolvedRoot : `${resolvedRoot}${pathWin32.sep}`;
  return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(rootWithSep);
}

function safeTimestamp(value) {
  return value?.toISOString?.() || null;
}

function fingerprintText(text) {
  return createHash("sha256").update(String(text || ""), "utf-8").digest("hex");
}

function rowsFor(snapshot, tableName) {
  const rows = snapshot?.[tableName];
  return Array.isArray(rows) ? rows : [];
}

function tableSummary(snapshot, tableName) {
  const rows = rowsFor(snapshot, tableName);
  return {
    table: tableName,
    present: Array.isArray(snapshot?.[tableName]),
    rowCount: rows.length,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    headersReturned: false,
    headersRedacted: true,
  };
}

function expectedTableSummary(snapshot) {
  return AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES.map((tableName) => tableSummary(snapshot, tableName));
}

function usersRedactionStatus(snapshot) {
  return {
    present: Array.isArray(snapshot?.USERS),
    count: rowsFor(snapshot, "USERS").length,
    rawRowsExposed: false,
    rawHeadersExposed: false,
    personalIdentifiersExposed: false,
    credentialsExposed: false,
  };
}

function topLevelArrayTableCount(snapshot) {
  return Object.values(snapshot).filter(Array.isArray).length;
}

function deepFreeze(value, seen = new WeakSet()) {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const nestedValue of Object.values(value)) {
    deepFreeze(nestedValue, seen);
  }
  return Object.freeze(value);
}

function withInternalSnapshot(result, snapshot = null) {
  Object.defineProperty(result, "snapshot", {
    value: snapshot,
    enumerable: false,
    configurable: false,
    writable: false,
  });
  return Object.freeze(result);
}

function blocker(code, reason, severity = "blocking") {
  return { code, severity, reason };
}

function baseResult(overrides = {}) {
  return {
    ok: false,
    label: RUNTIMEDATA_READONLY_SOURCE_ACCESS_LABEL,
    sourceState: RUNTIMEDATA_READONLY_SOURCE_ACCESS_STATE,
    sourcePathLabel: RUNTIMEDATA_READONLY_SOURCE_ACCESS_LABEL,
    activeSourceDbLoadedReadOnly: false,
    snapshotAvailableForInternalProbe: false,
    snapshotEnumerable: false,
    snapshotReturnedInJson: false,
    rawSnapshotSerialized: false,
    expectedTables: [...AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES],
    presentTables: [],
    missingTables: [...AUTHORITY_REFERENCE_SELECTOR_CRITICAL_TABLES],
    tableSummary: expectedTableSummary({}),
    usersRedactionStatus: usersRedactionStatus({}),
    topLevelArrayTableCount: 0,
    safetyFlags: clonePlain(READONLY_ACCESS_SAFETY_FLAGS),
    accessPolicy: {
      readOnly: true,
      internalOnly: true,
      serverSideOnly: true,
      exactActiveSnapshotOnly: true,
      noPublicRoute: true,
      noPostEndpoint: true,
      noRuntimeDataMutation: true,
      rawSnapshotNonEnumerable: true,
      rawSnapshotJsonSerializable: false,
      pathReturned: false,
    },
    source: {
      label: RUNTIMEDATA_READONLY_SOURCE_ACCESS_LABEL,
      present: false,
      readable: false,
      parseable: false,
      modifiedTime: null,
      fileSize: null,
      sourceFingerprint: null,
      pathReturned: false,
      localPathExposureEnabled: false,
    },
    blockers: [],
    warnings: [],
    ...overrides,
  };
}

function failureResult({ validation = null, sourceStat = null, readable = false, parseable = false, fingerprint = null, blockers = [], warnings = [] } = {}) {
  const isFile = Boolean(sourceStat?.isFile?.());
  return withInternalSnapshot(baseResult({
    source: {
      label: RUNTIMEDATA_READONLY_SOURCE_ACCESS_LABEL,
      present: Boolean(sourceStat && isFile),
      readable: Boolean(readable && isFile),
      parseable: Boolean(parseable),
      modifiedTime: safeTimestamp(sourceStat?.mtime),
      fileSize: sourceStat?.size ?? null,
      sourceFingerprint: fingerprint,
      pathReturned: false,
      localPathExposureEnabled: false,
    },
    pathValidation: validation,
    blockers,
    warnings,
  }));
}

export function validateRuntimeDataReadOnlySourcePath(sourcePath = AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH) {
  const candidate = String(sourcePath || "").trim();
  if (!candidate) {
    return {
      ok: false,
      code: "runtime-data-source-path-not-configured",
      reason: "RuntimeData active source path is not configured.",
      pathReturned: false,
    };
  }

  if (/[\0\r\n]/.test(candidate)) {
    return {
      ok: false,
      code: "runtime-data-source-path-invalid-characters",
      reason: "RuntimeData active source path contains invalid control characters.",
      pathReturned: false,
    };
  }

  if (!pathInsideRoot(candidate, AUTHORITY_REFERENCE_RUNTIME_DATA_HOME)) {
    return {
      ok: false,
      code: "runtime-data-source-path-outside-authority-reference-root",
      reason: "RuntimeData source access is confined to the authority-reference runtime data home.",
      pathReturned: false,
    };
  }

  if (!pathEquals(candidate, AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH)) {
    return {
      ok: false,
      code: "runtime-data-source-path-not-active-snapshot",
      reason: "RuntimeData source access is confined to the approved active authority-reference snapshot.",
      pathReturned: false,
    };
  }

  return {
    ok: true,
    code: "runtime-data-active-source-path-approved",
    reason: "RuntimeData source access is confined to the approved active authority-reference snapshot.",
    sourcePathLabel: RUNTIMEDATA_READONLY_SOURCE_ACCESS_LABEL,
    pathReturned: false,
  };
}

export async function loadRuntimeDataReadOnlySource({
  sourcePath = AUTHORITY_REFERENCE_ACTIVE_SNAPSHOT_PATH,
  fsApi = DEFAULT_FS_API,
} = {}) {
  const pathValidation = validateRuntimeDataReadOnlySourcePath(sourcePath);
  if (!pathValidation.ok) {
    return failureResult({
      validation: pathValidation,
      blockers: [blocker(pathValidation.code, pathValidation.reason)],
      warnings: ["RuntimeData active source DB was not loaded because the source path failed confinement validation."],
    });
  }

  let sourceStat = null;
  try {
    sourceStat = await fsApi.stat(sourcePath);
  } catch (error) {
    return failureResult({
      validation: pathValidation,
      blockers: [blocker("runtime-data-active-source-unavailable", "RuntimeData active source DB is missing or unavailable.")],
      warnings: [error?.code || "unavailable"],
    });
  }

  if (!sourceStat?.isFile?.()) {
    return failureResult({
      validation: pathValidation,
      sourceStat,
      blockers: [blocker("runtime-data-active-source-not-file", "RuntimeData active source path is not a file.")],
    });
  }

  let text = "";
  try {
    text = await fsApi.readFile(sourcePath, "utf-8");
  } catch (error) {
    return failureResult({
      validation: pathValidation,
      sourceStat,
      readable: false,
      blockers: [blocker("runtime-data-active-source-not-readable", "RuntimeData active source DB is not readable.")],
      warnings: [error?.code || "unreadable"],
    });
  }

  const sourceFingerprint = fingerprintText(text);
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return failureResult({
      validation: pathValidation,
      sourceStat,
      readable: true,
      fingerprint: sourceFingerprint,
      blockers: [blocker("runtime-data-active-source-not-json", "RuntimeData active source DB is not parseable JSON.")],
      warnings: [error?.name || "parse-failed"],
    });
  }

  if (!isPlainObject(parsed)) {
    return failureResult({
      validation: pathValidation,
      sourceStat,
      readable: true,
      parseable: false,
      fingerprint: sourceFingerprint,
      blockers: [blocker("runtime-data-active-source-not-table-object", "RuntimeData active source DB parsed but did not contain a table object.")],
    });
  }

  const snapshot = deepFreeze(parsed);
  const tableSummaryRows = expectedTableSummary(snapshot);
  const presentTables = tableSummaryRows.filter((table) => table.present).map((table) => table.table);
  const missingTables = tableSummaryRows.filter((table) => !table.present).map((table) => table.table);

  return withInternalSnapshot(baseResult({
    ok: true,
    activeSourceDbLoadedReadOnly: true,
    snapshotAvailableForInternalProbe: true,
    pathValidation,
    source: {
      label: RUNTIMEDATA_READONLY_SOURCE_ACCESS_LABEL,
      present: true,
      readable: true,
      parseable: true,
      modifiedTime: safeTimestamp(sourceStat?.mtime),
      fileSize: sourceStat?.size ?? null,
      sourceFingerprint,
      pathReturned: false,
      localPathExposureEnabled: false,
    },
    presentTables,
    missingTables,
    tableSummary: tableSummaryRows,
    usersRedactionStatus: usersRedactionStatus(snapshot),
    topLevelArrayTableCount: topLevelArrayTableCount(snapshot),
    blockers: [],
    warnings: [
      ...missingTables.map((table) => `Missing selector-critical RuntimeData table: ${table}.`),
    ],
  }), snapshot);
}
