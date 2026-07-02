import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SCHEMA_ID =
  "controlstack.runtime.safe-board-family-projection";
export const RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SCHEMA_VERSION = 1;
export const RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_STATE =
  "runtime_safe_board_family_projection_diagnostic_only";

export const RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  sourceBackedProjectionOnly: true,
  runtimeDataReadOnly: true,
  rawRowsExposed: false,
  rawRowsReturned: false,
  rawSourceSnapshotReturned: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawDriverRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawRuntimeDataRowsReturned: false,
  rawSelectorPayloadReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  rawIesContentReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  exactElectricalValuesReturned: false,
  exactElectricalValuesExposed: false,
  rawUsersReturned: false,
  rawCrmReturned: false,
  rawContactsReturned: false,
  privatePathsReturned: false,
  credentialsReturned: false,
  donorEngineInvoked: false,
  donorEngineInvocationAttempted: false,
  runtimeDataMutated: false,
  selectedResultPersisted: false,
  productionRunTableGenerated: false,
  runTableGenerated: false,
  iesGenerated: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe(?:-[0-9A-Za-z_.:-]{4,280}|:[0-9A-Za-z_.:-]{4,280})$/;
const RAW_ROW_CONTAINER_KEY_PATTERN = /^(?:rawRows|raw_rows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|rawRuntimeDataRows|rawSourceRows|rawSourceSnapshot|sourceSnapshotReturned|rawSnapshotReturned|rawDbSnapshot|rawDatabaseSnapshot)$/i;
const RAW_PAYLOAD_KEY_PATTERN = /^(?:selectorPayload|rawSelectorPayload|enginePayload|rawEnginePayload|engineResult|rawEngineResult|iesText|rawIesText|photometry|rawPhotometry|candela|candelaGrid|base64|base64Artifact|credentials|secret|password)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|donorPath|runtimeDataPath|path)$/i;
const EXACT_ELECTRICAL_KEY_PATTERN = /^(?:exactElectricalValues|exactElectricalValuesReturned|exactElectricalValuesExposed|requestExactElectricalValues|exposeExactElectricalValues)$/i;

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^rawRowsReturned$/i, "raw-rows-returned"],
  [/^rawSourceSnapshotReturned$/i, "raw-source-snapshot-returned"],
  [/^rawSnapshotSerialized$/i, "raw-source-snapshot-returned"],
  [/^snapshotReturnedInJson$/i, "raw-source-snapshot-returned"],
  [/^rawProductRowsReturned$/i, "raw-product-rows-returned"],
  [/^rawBoardRowsReturned$/i, "raw-board-rows-returned"],
  [/^rawDriverRowsReturned$/i, "raw-driver-rows-returned"],
  [/^rawAccessoryRowsReturned$/i, "raw-accessory-rows-returned"],
  [/^rawRuntimeDataRowsReturned$/i, "raw-runtime-data-rows-returned"],
  [/^rawSelectorPayloadReturned$/i, "raw-selector-payload-returned"],
  [/^rawEnginePayloadReturned$/i, "raw-engine-payload-returned"],
  [/^rawEngineResultReturned$/i, "raw-engine-result-returned"],
  [/^rawIesContentReturned$/i, "raw-ies-content-returned"],
  [/^rawPhotometryReturned$/i, "raw-photometry-returned"],
  [/^candelaArraysReturned$/i, "raw-candela-returned"],
  [/^base64ArtifactsReturned$/i, "base64-artifacts-returned"],
  [/^exactElectricalValuesReturned$/i, "exact-electrical-values-returned"],
  [/^exactElectricalValuesExposed$/i, "exact-electrical-values-returned"],
  [/^rawUsersReturned$/i, "raw-users-returned"],
  [/^rawCrmReturned$/i, "raw-crm-returned"],
  [/^rawContactsReturned$/i, "raw-contacts-returned"],
  [/^privatePathsReturned$/i, "private-paths-returned"],
  [/^credentialsReturned$/i, "credentials-returned"],
  [/^donorEngineInvoked$/i, "donor-engine-invocation-not-approved"],
  [/^donorEngineInvocationAttempted$/i, "donor-engine-invocation-not-approved"],
  [/^engineExecutionAttempted$/i, "donor-engine-invocation-not-approved"],
  [/^runtimeDataMutated$/i, "runtime-data-mutation-not-approved"],
  [/^runtimeDataMutationAttempted$/i, "runtime-data-mutation-not-approved"],
  [/^runtimeDataMutationEnabled$/i, "runtime-data-mutation-not-approved"],
  [/^selectedResultPersisted$/i, "selected-result-persistence-not-approved"],
  [/^runTableGenerated$/i, "runtable-generation-not-approved"],
  [/^runtableGenerated$/i, "runtable-generation-not-approved"],
  [/^productionRunTableGenerated$/i, "runtable-generation-not-approved"],
  [/^iesGenerated$/i, "ies-generation-not-approved"],
  [/^routesAdded$/i, "routes-or-post-endpoints-not-approved"],
  [/^postEndpointsAdded$/i, "routes-or-post-endpoints-not-approved"],
]);

const BOARD_TABLE_ALIASES = Object.freeze(["BOARDS", "BOARD", "boards", "board"]);
const BOARD_RECORD_KEYS = Object.freeze([
  "boundedBoardRecords",
  "sourceBoardRecords",
  "boardSourceRecords",
  "boardRecords",
  "boards",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null
    || value === undefined
    || (typeof value === "number" && Number.isNaN(value))
    || (typeof value === "string" && value.trim() === "");
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function normaliseLookupKey(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[\s_./-]+/g, " ")
    .replace(/[^a-z0-9 ]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function fieldValue(row, keys) {
  if (!isPlainObject(row)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(row, key) && !isBlank(row[key])) return row[key];
  }
  const wanted = keys.map(normaliseLookupKey);
  const actualKey = Object.keys(row).find((candidate) => wanted.includes(normaliseLookupKey(candidate)));
  return actualKey && !isBlank(row[actualKey]) ? row[actualKey] : undefined;
}

function safeLabel(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 96) : fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 320);
  if (SAFE_FINGERPRINT_PATTERN.test(cleaned)) return cleaned;
  if (/^[0-9a-f]{16,128}$/i.test(cleaned)) return `safe-source:runtime-active-${cleaned.slice(0, 32).toLowerCase()}`;
  return "";
}

function sourceFingerprintFrom(sourceAccessSummary, source) {
  return safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])
    ?? firstPresent(sourceAccessSummary?.source || {}, ["sourceFingerprint", "safeSourceFingerprint"])
    ?? firstPresent(sourceAccessSummary || {}, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function toFiniteNumber(value) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  const source = String(value ?? "").trim();
  if (!source) return null;
  const parsed = Number(source);
  if (Number.isFinite(parsed)) return parsed;
  const match = source.replace(/–/g, "-").match(/[-+]?\d+(\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function toPositiveInteger(value) {
  const parsed = toFiniteNumber(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return Number.isInteger(rounded) && rounded > 0 ? rounded : null;
}

function countBand(count) {
  const value = Number(count);
  if (!Number.isFinite(value) || value < 0) return "unknown";
  if (value === 0) return "0";
  if (value === 1) return "1";
  if (value <= 5) return "2-5";
  if (value <= 25) return "6-25";
  if (value <= 100) return "26-100";
  return "100-plus";
}

function lengthBand(value) {
  const mm = toPositiveInteger(value);
  if (!mm) return "unresolved";
  if (mm <= 99) return "1-99mm";
  if (mm <= 499) return "100-499mm";
  if (mm <= 999) return "500-999mm";
  if (mm <= 1999) return "1000-1999mm";
  if (mm <= 3999) return "2000-3999mm";
  if (mm <= 7999) return "4000-7999mm";
  return "8000mm-plus";
}

function pitchBand(value) {
  const mm = toFiniteNumber(value);
  if (!Number.isFinite(mm) || mm <= 0) return "unresolved";
  if (mm <= 9) return "1-9mm";
  if (mm <= 24) return "10-24mm";
  if (mm <= 49) return "25-49mm";
  if (mm <= 99) return "50-99mm";
  if (mm <= 199) return "100-199mm";
  return "200mm-plus";
}

function truthy(value) {
  return new Set(["TRUE", "YES", "Y", "1", "T", "APPROVED", "AVAILABLE", "ACTIVE", "CURRENT"]).has(String(value ?? "").trim().toUpperCase());
}

function statusAllowsSourceUse(row) {
  const approved = fieldValue(row, ["approved", "is_approved", "approved_for_selector"]);
  if (!isBlank(approved)) return truthy(approved);
  const status = String(fieldValue(row, ["timeline_status", "status", "availability", "lifecycle_status", "product_status", "option_status", "effective_status"]) || "").trim().toLowerCase();
  if (!status) return true;
  return ["available", "active", "current", "live", "released", "approved", "orderable"].includes(status);
}

function tableSummaryFor(sourceAccessSummary, tableName) {
  const summaries = Array.isArray(sourceAccessSummary?.tableSummary) ? sourceAccessSummary.tableSummary : [];
  return summaries.find((entry) => entry?.table === tableName || entry?.tableName === tableName) || null;
}

function normaliseRowsFromArray(value = []) {
  if (!Array.isArray(value)) return [];
  return value.filter(isPlainObject);
}

function tableRowsFromSnapshot(snapshot, tableName) {
  if (!isPlainObject(snapshot)) return [];
  for (const alias of BOARD_TABLE_ALIASES) {
    if (normaliseLookupKey(alias) !== normaliseLookupKey(tableName)) continue;
    const rows = snapshot[alias];
    if (Array.isArray(rows)) return normaliseRowsFromArray(rows);
  }
  const actualKey = Object.keys(snapshot).find((key) => BOARD_TABLE_ALIASES.map(normaliseLookupKey).includes(normaliseLookupKey(key)));
  return actualKey && Array.isArray(snapshot[actualKey]) ? normaliseRowsFromArray(snapshot[actualKey]) : [];
}

function resolveSourceAccessSummary(input) {
  return isPlainObject(input?.sourceAccessSummary) ? input.sourceAccessSummary : input;
}

function resolveSnapshot(source, sourceAccessSummary) {
  const direct = firstPresent(source, ["sourceSnapshot", "snapshot", "activeSnapshot", "authorityReferenceSnapshot"]);
  if (isPlainObject(direct)) return direct;
  const accessSnapshot = sourceAccessSummary?.snapshot;
  return isPlainObject(accessSnapshot) ? accessSnapshot : null;
}

function resolveBoardRecords(source, sourceAccessSummary) {
  for (const key of BOARD_RECORD_KEYS) {
    if (Array.isArray(source[key])) return normaliseRowsFromArray(source[key]);
    if (Array.isArray(sourceAccessSummary?.[key])) return normaliseRowsFromArray(sourceAccessSummary[key]);
  }
  const snapshot = resolveSnapshot(source, sourceAccessSummary);
  return tableRowsFromSnapshot(snapshot, "BOARDS");
}

function tablePresence(source, sourceAccessSummary, rows) {
  const tableSummary = tableSummaryFor(sourceAccessSummary, "BOARDS");
  const snapshot = resolveSnapshot(source, sourceAccessSummary);
  const present = tableSummary?.present === true
    || Array.isArray(snapshot?.BOARDS)
    || Array.isArray(snapshot?.boards)
    || rows.length > 0
    || source.boardTablePresent === true
    || source.boardFamilySourceMarker === "BOARDS";
  const rowCount = Number.isFinite(Number(tableSummary?.rowCount)) ? Number(tableSummary.rowCount) : rows.length;
  return { present, rowCount };
}

function unsafeInputBlocker(value, depth = 0, keyPath = []) {
  if (depth > 9 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "private-paths-returned";
    if (value.includes("IESNA:") || value.includes("candelaGrid")) return "raw-photometry-returned";
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeInputBlocker(entry, depth + 1, keyPath);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    const nestedPath = [...keyPath, key];
    if (RAW_ROW_CONTAINER_KEY_PATTERN.test(key)) return "raw-board-rows-returned";
    if (RAW_PAYLOAD_KEY_PATTERN.test(key)) return "raw-engine-payload-returned";
    if (EXACT_ELECTRICAL_KEY_PATTERN.test(key) && nested) return "exact-electrical-values-returned";
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) return "private-paths-returned";
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }

    // Raw source records are permitted only inside explicit bounded board-record inputs or the
    // internal non-public snapshot boundary. They are consumed to derive bands/tokens and are never returned.
    const parentKey = nestedPath[nestedPath.length - 2] || "";
    const allowedBoardRecordContainer = BOARD_RECORD_KEYS.includes(parentKey);
    const allowedSnapshotContainer = ["snapshot", "sourceSnapshot", "activeSnapshot", "authorityReferenceSnapshot"].includes(parentKey);
    if (!allowedBoardRecordContainer && !allowedSnapshotContainer) {
      const blocker = unsafeInputBlocker(nested, depth + 1, nestedPath);
      if (blocker) return blocker;
    } else if (typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "private-paths-returned";
    }
  }
  return null;
}

function boardIdentity(row, index) {
  const rawIdentity = fieldValue(row, [
    "board_family",
    "boardFamily",
    "novon_family",
    "family",
    "familyLabel",
    "family_label",
    "product_family",
    "series",
    "model",
    "name",
    "board_uid",
    "uid",
    "part_number",
    "partNumber",
    "board",
  ]);
  if (isBlank(rawIdentity)) return null;
  const normalized = normaliseLookupKey(rawIdentity) || `row-${index + 1}`;
  return normalized;
}

function boardLengthValue(row) {
  return toPositiveInteger(fieldValue(row, [
    "length_mm",
    "board_length_mm",
    "std_length_mm",
    "c1_length_mm",
    "max_length_mm",
    "nominal_length_mm",
    "nominalLengthMm",
    "lengthMm",
    "length",
  ]));
}

function boardPitchValue(row) {
  return toFiniteNumber(fieldValue(row, [
    "pitch_mm",
    "pitch",
    "board_pitch_mm",
    "boardPitchMm",
    "led_pitch_mm",
    "module_pitch_mm",
  ]));
}

function directionToken(row) {
  const raw = String(fieldValue(row, ["light_direction", "direction", "light_type", "application", "emission"]) || "").toLowerCase();
  const direct = /direct|down/.test(raw);
  const indirect = /indirect|up/.test(raw);
  if (direct && indirect) return "both";
  if (direct) return "direct";
  if (indirect) return "indirect";
  return "unspecified";
}

function controlCompatibility(row) {
  const raw = String(fieldValue(row, ["control_type", "controlType", "native_control_type", "driver_control", "dimming", "protocol"]) || "").toLowerCase();
  if (!raw) return "unspecified";
  if (raw.includes("dali")) return "dali-compatible";
  if (raw.includes("non") || raw.includes("switch") || raw.includes("fixed")) return "fixed-output-compatible";
  return "control-specified";
}

function buildFamilies(rows) {
  const families = new Map();
  rows.forEach((row, index) => {
    const identity = boardIdentity(row, index);
    if (!identity) return;
    const length = boardLengthValue(row);
    const pitch = boardPitchValue(row);
    const key = identity;
    const current = families.get(key) || {
      identity,
      sourceRowCount: 0,
      approvedRowCount: 0,
      lengthBands: new Set(),
      pitchBands: new Set(),
      directions: new Set(),
      controls: new Set(),
    };
    current.sourceRowCount += 1;
    if (statusAllowsSourceUse(row)) current.approvedRowCount += 1;
    current.lengthBands.add(lengthBand(length));
    current.pitchBands.add(pitchBand(pitch));
    current.directions.add(directionToken(row));
    current.controls.add(controlCompatibility(row));
    families.set(key, current);
  });

  return [...families.values()]
    .map((family) => {
      const token = `safe-board-family:${stableSha1({ identity: family.identity })}`;
      const lengthBands = [...family.lengthBands].filter((band) => band !== "unresolved").sort();
      const pitchBands = [...family.pitchBands].filter((band) => band !== "unresolved").sort();
      return {
        token,
        label: `Source-backed board family option ${token.slice(-6)}`,
        sourceRowCount: family.sourceRowCount,
        approvedRowCount: family.approvedRowCount,
        lengthBands,
        pitchBands,
        directions: [...family.directions].sort(),
        controls: [...family.controls].sort(),
      };
    })
    .sort((left, right) => left.token.localeCompare(right.token));
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    boardFamilyProjectionReady: false,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function safetyBase(extra = {}) {
  return {
    schemaId: RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SCHEMA_VERSION,
    state: RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_STATE,
    ok: extra.ok === true,
    blocker: extra.blocker || null,
    boardFamilyProjectionReady: extra.boardFamilyProjectionReady === true,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceBacked: extra.sourceBacked === true,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    boardFamilyProjectionFingerprint: extra.boardFamilyProjectionFingerprint || null,
    boardFamilySummary: extra.boardFamilySummary || null,
    boardOptionSummary: extra.boardOptionSummary || null,
    boardLengthBandSummary: extra.boardLengthBandSummary || null,
    boardPitchBandSummary: extra.boardPitchBandSummary || null,
    boardCompatibilitySummary: extra.boardCompatibilitySummary || null,
    sourceTablePresenceSummary: extra.sourceTablePresenceSummary || null,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    rawRowsReturned: false,
    rawSourceSnapshotReturned: false,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawRuntimeDataRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    exactElectricalValuesExposed: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    donorEngineInvoked: false,
    donorEngineInvocationAttempted: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    unsafeOutputsBlocked: {
      sourceRowsBlocked: true,
      boardRowsBlocked: true,
      productRowsBlocked: true,
      driverRowsBlocked: true,
      accessoryRowsBlocked: true,
      runtimeDataRowsBlocked: true,
      sourceSnapshotSerializationBlocked: true,
      selectorPayloadBlocked: true,
      enginePayloadBlocked: true,
      engineResultBlocked: true,
      exactElectricalValuesBlocked: true,
      privateDataBlocked: true,
      iesPhotometryAndBase64Blocked: true,
    },
    safetyFlags: clonePlain(RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SAFETY_FLAGS),
  };
}

function buildProjectionFingerprint(payload) {
  return `safe-board-family-projection:${stableSha1(payload)}`;
}

function finalizeSummary(summary) {
  const serialized = JSON.stringify(summary);
  if (PRIVATE_PATH_PATTERN.test(serialized)
    || serialized.includes("IESNA:")
    || serialized.includes("candelaGrid")) {
    return failClosed("unsafe-board-family-projection-output", "Board family projection output contained a private path, IES/candela marker, or unsafe artifact marker.", {
      sourceFingerprint: summary.sourceFingerprint,
      policyFingerprint: summary.policyFingerprint,
    });
  }
  return Object.freeze(summary);
}

export function buildRuntimeSafeBoardFamilyProjectionSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const sourceAccessSummary = resolveSourceAccessSummary(source);

  const inputBlocker = unsafeInputBlocker(source);
  if (inputBlocker) {
    return failClosed(inputBlocker, "Unsafe returned rows, raw payloads, exact electrical values, donor invocation, generation, mutation, route, POST, private path, credential, or artifact signals were supplied.");
  }

  const sourceFingerprint = sourceFingerprintFrom(sourceAccessSummary, source);
  if (!sourceFingerprint) {
    return failClosed("missing-source-fingerprint", "A safe source fingerprint is required before board-family projection.");
  }

  const rows = resolveBoardRecords(source, sourceAccessSummary);
  const presence = tablePresence(source, sourceAccessSummary, rows);
  const sourceTablePresenceSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    boardTablePresent: presence.present === true,
    boardSourceMarker: presence.present === true ? `safe-source-table:${stableSha1({ table: "BOARDS", sourceFingerprint })}` : null,
    boardRowCountBand: countBand(presence.rowCount),
    sourceFingerprintAvailable: true,
    rawRowsReturned: false,
    rawBoardRowsReturned: false,
    rawHeadersReturned: false,
    rawSourceSnapshotReturned: false,
  };

  if (presence.present !== true) {
    return failClosed("missing-board-family-source-marker", "A safe BOARDS table/source marker is required before board-family projection.", {
      sourceFingerprint,
      sourceTablePresenceSummary,
    });
  }

  const families = buildFamilies(rows);
  if (families.length === 0) {
    return failClosed("missing-board-family-token", "At least one safe board-family token must be derivable from source-shaped BOARDS records.", {
      sourceFingerprint,
      sourceTablePresenceSummary,
    });
  }

  const allLengthBands = [...new Set(families.flatMap((family) => family.lengthBands))].sort();
  const allPitchBands = [...new Set(families.flatMap((family) => family.pitchBands))].sort();
  if (allLengthBands.length === 0 || allPitchBands.length === 0) {
    return failClosed("missing-safe-length-pitch-band", "Safe board length and pitch bands are required before board-family projection can become ready.", {
      sourceFingerprint,
      sourceTablePresenceSummary,
    });
  }

  const approvedOptionCount = families.reduce((total, family) => total + family.approvedRowCount, 0);
  const boardFamilyTokens = families.map((family) => family.token);
  const boardFamilyLabels = families.map((family) => family.label);
  const boardOptionSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    boardOptionCountBand: countBand(rows.length),
    approvedBoardOptionCountBand: countBand(approvedOptionCount),
    boardFamilyCountBand: countBand(families.length),
    boardFamilyTokens,
    boardFamilyLabels,
    rawBoardRowsReturned: false,
    exactElectricalValuesReturned: false,
  };
  const boardLengthBandSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    primaryLengthBand: allLengthBands[0],
    lengthBands: allLengthBands,
    lengthBandCountBand: countBand(allLengthBands.length),
    exactLengthsReturned: false,
    rawBoardRowsReturned: false,
  };
  const boardPitchBandSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    primaryPitchBand: allPitchBands[0],
    pitchBands: allPitchBands,
    pitchBandCountBand: countBand(allPitchBands.length),
    exactPitchesReturned: false,
    rawBoardRowsReturned: false,
  };
  const directionSet = new Set(families.flatMap((family) => family.directions));
  const controlSet = new Set(families.flatMap((family) => family.controls));
  const boardCompatibilitySummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    hasApprovedBoardOptions: approvedOptionCount > 0,
    hasDirectCompatibleBoardOptions: directionSet.has("direct") || directionSet.has("both") || directionSet.has("unspecified"),
    hasIndirectCompatibleBoardOptions: directionSet.has("indirect") || directionSet.has("both"),
    hasControlCompatibilityMarkers: [...controlSet].some((value) => value !== "unspecified"),
    controlCompatibilityCountBand: countBand([...controlSet].filter((value) => value !== "unspecified").length),
    directionMarkerCountBand: countBand([...directionSet].filter((value) => value !== "unspecified").length),
    rawBoardRowsReturned: false,
    exactElectricalValuesReturned: false,
  };

  const policyFingerprint = `safe-policy:${stableSha1({
    sourceFingerprint,
    sourceTablePresenceSummary,
    boardOptionSummary: {
      boardOptionCountBand: boardOptionSummary.boardOptionCountBand,
      approvedBoardOptionCountBand: boardOptionSummary.approvedBoardOptionCountBand,
      boardFamilyCountBand: boardOptionSummary.boardFamilyCountBand,
    },
    boardLengthBandSummary,
    boardPitchBandSummary,
    schemaId: RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SCHEMA_ID,
  })}`;

  const fingerprintPayload = {
    schemaId: RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_SCHEMA_VERSION,
    state: RUNTIME_SAFE_BOARD_FAMILY_PROJECTION_STATE,
    sourceFingerprint,
    policyFingerprint,
    boardFamilyTokens,
    boardLengthBandSummary,
    boardPitchBandSummary,
    boardCompatibilitySummary,
    sourceTablePresenceSummary,
  };
  const boardFamilyProjectionFingerprint = buildProjectionFingerprint(fingerprintPayload);
  const boardFamilySummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceBacked: true,
    boardFamilyProjectionReady: true,
    selectedBoardFamilyToken: boardFamilyTokens[0],
    boardFamilyTokens,
    boardFamilyLabels,
    boardFamilyCountBand: countBand(families.length),
    boardCandidateCountBand: countBand(rows.length),
    approvedBoardCandidateCountBand: countBand(approvedOptionCount),
    boardLengthBand: boardLengthBandSummary.primaryLengthBand,
    boardPitchBand: boardPitchBandSummary.primaryPitchBand,
    boardFamilyProjectionFingerprint,
    policyFingerprint,
    sourceFingerprint,
    rawRowsReturned: false,
    rawBoardRowsReturned: false,
    rawSourceSnapshotReturned: false,
    exactElectricalValuesReturned: false,
  };

  const warnings = [];
  if (approvedOptionCount === 0) {
    warnings.push("No approved/live board option marker was found; projection remains source-backed but compatibility requires review.");
  }
  if (families.length > 1) {
    warnings.push("Multiple source-backed board family options remain available; future candidate scoring must resolve selection.");
  }

  return finalizeSummary(safetyBase({
    ok: true,
    boardFamilyProjectionReady: true,
    sourceBacked: true,
    sourceFingerprint,
    policyFingerprint,
    boardFamilyProjectionFingerprint,
    boardFamilySummary,
    boardOptionSummary,
    boardLengthBandSummary,
    boardPitchBandSummary,
    boardCompatibilitySummary,
    sourceTablePresenceSummary,
    warnings,
    failClosedDiagnostics: [],
  }));
}

export const buildSafeBoardFamilyProjectionSummary = buildRuntimeSafeBoardFamilyProjectionSummary;
export const buildEngineRunTableSafeBoardFamilyProjectionSummary = buildRuntimeSafeBoardFamilyProjectionSummary;
