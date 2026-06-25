import { readFile, stat } from "node:fs/promises";

export const BOARD_DATA_STATUS_PATH = "/api/board-data/status";

export const BOARD_DATA_EXPECTED_TABLES = Object.freeze([
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

const BOARD_DATA_BOUNDARY_WARNINGS = Object.freeze([
  "Board Data defines product/component metadata.",
  "Lab approval is required for proof.",
  "Selector mutation is disabled.",
  "Google/materialiser writes are disabled.",
  "Raw rows are not exposed in this first slice.",
]);

const SAFE_BOUNDARY_FLAGS = Object.freeze({
  owner: "runtime-server",
  moduleId: "board_data",
  label: "Board Data",
  readOnly: true,
  diagnosticOnly: true,
  productDataAuthority: true,
  writeEnabled: false,
  selectorMutationEnabled: false,
  labProofAuthority: false,
  iesGenerationEnabled: false,
  googleSyncEnabled: false,
  activeSnapshotWriteEnabled: false,
  materialisedSnapshotWriteEnabled: false,
  rawRowsExposed: false,
  rawUsersExposed: false,
  rawUserHeadersExposed: false,
  candidateEditMode: false,
  approvedDataSource: "active authority-reference snapshot",
});

const DEFAULT_FS_API = Object.freeze({
  readFile,
  stat,
});

function isPlainObject(value) {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function rowsFor(snapshot, tableName) {
  const rows = snapshot?.[tableName];
  return Array.isArray(rows) ? rows : [];
}

function sourceMetadata({ sourceStat = null, present = Boolean(sourceStat), readable = false, parseable = false }) {
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

function tableStatus(snapshot, tableName) {
  const present = Array.isArray(snapshot?.[tableName]);
  return {
    table: tableName,
    present,
    rowCount: rowsFor(snapshot, tableName).length,
    rawRowsExposed: false,
    headersRedacted: false,
  };
}

function countExpectedRows(snapshot) {
  return Object.fromEntries(
    BOARD_DATA_EXPECTED_TABLES.map((tableName) => [tableName, rowsFor(snapshot, tableName).length])
  );
}

function usersRedactionStatus(snapshot) {
  return {
    present: Array.isArray(snapshot?.USERS),
    count: rowsFor(snapshot, "USERS").length,
    rawRowsExposed: false,
    rawHeadersExposed: false,
  };
}

function proofBoundary() {
  return {
    labRequiredForProof: true,
    metadataOnlyFields: true,
    productionProofClaimsEmitted: false,
  };
}

function buildStatus({ ok, source, snapshot = {}, warnings = [] }) {
  const tableSummary = BOARD_DATA_EXPECTED_TABLES.map((tableName) => tableStatus(snapshot, tableName));
  const missingExpectedTables = tableSummary
    .filter((table) => !table.present)
    .map((table) => table.table);

  return {
    ok,
    endpoint: BOARD_DATA_STATUS_PATH,
    ...SAFE_BOUNDARY_FLAGS,
    source,
    counts: countExpectedRows(snapshot),
    tableSummary,
    usersRedactionStatus: usersRedactionStatus(snapshot),
    missingExpectedTables,
    proofBoundary: proofBoundary(),
    warnings: [
      ...missingExpectedTables.map((table) => `Missing Board Data expected table: ${table}.`),
      ...warnings,
      ...BOARD_DATA_BOUNDARY_WARNINGS,
    ],
  };
}

function failureStatus({ sourceStat = null, readable = false, reason }) {
  return buildStatus({
    ok: false,
    source: sourceMetadata({
      sourceStat,
      present: Boolean(sourceStat),
      readable,
      parseable: false,
    }),
    snapshot: {},
    warnings: [reason || "Board Data active authority-reference snapshot could not be read."],
  });
}

export async function buildBoardDataStatus({ sourcePath, fsApi = DEFAULT_FS_API } = {}) {
  if (!sourcePath) {
    return failureStatus({ reason: "Board Data status source path is not configured." });
  }

  let sourceStat = null;
  try {
    sourceStat = await fsApi.stat(sourcePath);
  } catch (error) {
    return failureStatus({
      sourceStat,
      reason: `Board Data active authority-reference snapshot is missing or unavailable: ${error?.code || error?.message || "unknown error"}.`,
    });
  }

  if (!sourceStat?.isFile?.()) {
    return failureStatus({
      sourceStat,
      reason: "Board Data active authority-reference snapshot path is not a file.",
    });
  }

  let text = "";
  try {
    text = await fsApi.readFile(sourcePath, "utf-8");
  } catch (error) {
    return failureStatus({
      sourceStat,
      readable: false,
      reason: `Board Data active authority-reference snapshot is not readable: ${error?.code || error?.message || "unknown error"}.`,
    });
  }

  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch (error) {
    return failureStatus({
      sourceStat,
      readable: true,
      reason: `Board Data active authority-reference snapshot is not parseable JSON: ${error?.message || "parse failed"}.`,
    });
  }

  const snapshot = isPlainObject(parsed) ? parsed : {};
  const parseable = isPlainObject(parsed);
  const warnings = parseable ? [] : ["Board Data active authority-reference snapshot parsed but did not contain a table object."];

  return buildStatus({
    ok: parseable,
    source: sourceMetadata({
      sourceStat,
      present: true,
      readable: true,
      parseable,
    }),
    snapshot,
    warnings,
  });
}
