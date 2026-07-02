import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SCHEMA_ID =
  "controlstack.runtime.safe-driver-candidate-projection";
export const RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SCHEMA_VERSION = 1;
export const RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_STATE =
  "runtime_safe_driver_candidate_projection_diagnostic_only";

export const RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SAFETY_FLAGS = Object.freeze({
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
  rawCurveRowsReturned: false,
  rawDriverUtilPayloadReturned: false,
  rawCurvePointsReturned: false,
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
const RAW_CURVE_KEY_PATTERN = /^(?:rawCurveRows|curveRows|curvePoints|rawCurvePoints|rawDriverUtilPayload|rawDriverUtilPayloads|driverUtilPayload|driverUtilCurveJson|driverUtilJson)$/i;
const RAW_PAYLOAD_KEY_PATTERN = /^(?:selectorPayload|rawSelectorPayload|enginePayload|rawEnginePayload|engineResult|rawEngineResult|iesText|rawIesText|photometry|rawPhotometry|candela|candelaGrid|base64|base64Artifact|credentials|secret|password)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|donorPath|runtimeDataPath|path)$/i;
const EXACT_ELECTRICAL_KEY_PATTERN = /^(?:exactElectricalValues|exactElectricalValuesReturned|exactElectricalValuesExposed|requestExactElectricalValues|exposeExactElectricalValues)$/i;

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^rawRowsReturned$/i, "raw-driver-rows-returned"],
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
  [/^rawCurveRowsReturned$/i, "raw-curve-rows-returned"],
  [/^rawDriverUtilPayloadReturned$/i, "raw-curve-rows-returned"],
  [/^rawCurvePointsReturned$/i, "raw-curve-rows-returned"],
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

const DRIVER_TABLE_ALIASES = Object.freeze(["DRIVERS", "DRIVER", "drivers", "driver"]);
const DRIVER_RECORD_KEYS = Object.freeze([
  "boundedDriverRecords",
  "sourceDriverRecords",
  "driverSourceRecords",
  "driverRecords",
  "drivers",
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

function toPositiveFinite(value) {
  const parsed = toFiniteNumber(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
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
  for (const alias of DRIVER_TABLE_ALIASES) {
    if (normaliseLookupKey(alias) !== normaliseLookupKey(tableName)) continue;
    const rows = snapshot[alias];
    if (Array.isArray(rows)) return normaliseRowsFromArray(rows);
  }
  const actualKey = Object.keys(snapshot).find((key) => DRIVER_TABLE_ALIASES.map(normaliseLookupKey).includes(normaliseLookupKey(key)));
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

function resolveDriverRecords(source, sourceAccessSummary) {
  for (const key of DRIVER_RECORD_KEYS) {
    if (Array.isArray(source[key])) return normaliseRowsFromArray(source[key]);
    if (Array.isArray(sourceAccessSummary?.[key])) return normaliseRowsFromArray(sourceAccessSummary[key]);
  }
  const snapshot = resolveSnapshot(source, sourceAccessSummary);
  return tableRowsFromSnapshot(snapshot, "DRIVERS");
}

function tablePresence(source, sourceAccessSummary, rows) {
  const tableSummary = tableSummaryFor(sourceAccessSummary, "DRIVERS");
  const snapshot = resolveSnapshot(source, sourceAccessSummary);
  const present = tableSummary?.present === true
    || Array.isArray(snapshot?.DRIVERS)
    || Array.isArray(snapshot?.drivers)
    || rows.length > 0
    || source.driverTablePresent === true
    || source.driverCandidateSourceMarker === "DRIVERS";
  const rowCount = Number.isFinite(Number(tableSummary?.rowCount)) ? Number(tableSummary.rowCount) : rows.length;
  return { present, rowCount };
}

function unsafeInputBlocker(value, depth = 0, keyPath = [], insideAllowedSourceRows = false) {
  if (depth > 9 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "private-paths-returned";
    if (value.includes("IESNA:") || value.includes("candelaGrid")) return "raw-photometry-returned";
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeInputBlocker(entry, depth + 1, keyPath, insideAllowedSourceRows);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    const nestedPath = [...keyPath, key];
    if (RAW_ROW_CONTAINER_KEY_PATTERN.test(key)) return "raw-driver-rows-returned";
    if (RAW_CURVE_KEY_PATTERN.test(key)) return "raw-curve-rows-returned";
    if (RAW_PAYLOAD_KEY_PATTERN.test(key)) return "raw-engine-payload-returned";
    if (EXACT_ELECTRICAL_KEY_PATTERN.test(key) && nested && !insideAllowedSourceRows) return "exact-electrical-values-returned";
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) return "private-paths-returned";
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }

    const parentKey = nestedPath[nestedPath.length - 2] || "";
    const allowedDriverRecordContainer = DRIVER_RECORD_KEYS.includes(parentKey);
    const allowedSnapshotContainer = ["snapshot", "sourceSnapshot", "activeSnapshot", "authorityReferenceSnapshot"].includes(parentKey);
    const nextInsideAllowedRows = insideAllowedSourceRows || allowedDriverRecordContainer || allowedSnapshotContainer;
    const blocker = unsafeInputBlocker(nested, depth + 1, nestedPath, nextInsideAllowedRows);
    if (blocker) return blocker;
  }
  return null;
}

function driverIdentity(row, index) {
  const rawIdentity = fieldValue(row, [
    "safeModelToken",
    "driver_model",
    "driverModel",
    "model",
    "code_or_article",
    "article",
    "series",
    "driver",
    "name",
    "uid",
    "part_number",
    "partNumber",
  ]);
  if (isBlank(rawIdentity)) return null;
  return normaliseLookupKey(rawIdentity) || `row-${index + 1}`;
}

function currentBandFrom(row) {
  const minMa = toPositiveFinite(fieldValue(row, ["iout_min_mA", "iout_min_ma", "currentMinMa", "current_min_ma", "imin_ma"]));
  const maxMa = toPositiveFinite(fieldValue(row, ["iout_max_mA", "iout_max_ma", "currentMaxMa", "current_max_ma", "imax_ma"]));
  if (!minMa || !maxMa || minMa > maxMa) return null;
  if (maxMa <= 250) return "safe-band:driver-current-up-to-250ma";
  if (maxMa <= 350) return "safe-band:driver-current-251-350ma";
  if (maxMa <= 500) return "safe-band:driver-current-351-500ma";
  if (maxMa <= 700) return "safe-band:driver-current-501-700ma";
  if (maxMa <= 1050) return "safe-band:driver-current-701-1050ma";
  return "safe-band:driver-current-above-1050ma-review";
}

function voltageBandFrom(row) {
  const maxV = toPositiveFinite(fieldValue(row, ["vout_max_v", "voutMaxV", "vout_max_V", "v_max", "voltageMaxV", "max_voltage_v"]));
  if (!maxV) return null;
  if (maxV <= 24) return "safe-band:driver-voltage-up-to-24v";
  if (maxV <= 48) return "safe-band:driver-voltage-25-48v";
  if (maxV <= 60) return "safe-band:driver-voltage-49-60v";
  if (maxV <= 120) return "safe-band:driver-voltage-61-120v";
  return "safe-band:driver-voltage-above-120v-review";
}

function powerBandFrom(row) {
  const maxW = toPositiveFinite(fieldValue(row, ["pout_max_w", "poutMaxW", "pout_max_W", "p_max_w", "powerMaxW", "max_power_w"]));
  if (!maxW) return null;
  if (maxW <= 20) return "safe-band:driver-power-up-to-20w";
  if (maxW <= 50) return "safe-band:driver-power-21-50w";
  if (maxW <= 100) return "safe-band:driver-power-51-100w";
  if (maxW <= 200) return "safe-band:driver-power-101-200w";
  return "safe-band:driver-power-above-200w-review";
}

function supplyMarker(row) {
  const raw = String(fieldValue(row, ["supply", "supplyType", "driverSupplyType"]) || "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (["cc", "constant-current", "constantcurrent"].includes(raw)) return "constant-current-compatible";
  if (["cv", "constant-voltage", "constantvoltage"].includes(raw)) return "constant-voltage-compatible";
  return raw ? "supply-specified" : "unspecified";
}

function controlCompatibilityMarkers(row) {
  const raw = String(fieldValue(row, ["native_control_type", "nativeControlType", "control_type", "controlType", "dimming", "protocol"]) || "").toLowerCase();
  const markers = new Set();
  if (raw.includes("dali")) markers.add("dali-compatible");
  if (raw.includes("0-10") || raw.includes("1-10")) markers.add("analogue-compatible");
  if (raw.includes("non") || raw.includes("fixed")) markers.add("fixed-output-compatible");
  if (raw.includes("switch") || raw.includes("on/off") || raw.includes("on off")) markers.add("switched-output-compatible");
  if (markers.size === 0) markers.add(raw ? "control-specified" : "unspecified");
  return [...markers].sort();
}

function curveReferenceMarker(row, identity, sourceFingerprint) {
  const raw = fieldValue(row, [
    "driver_util_filename",
    "driverUtilFilename",
    "driver_util_curve_filename",
    "driverUtilCurveFilename",
    "util_curve_filename",
    "curve_filename",
    "driver_util_token",
    "driverUtilToken",
  ]);
  const referenceSeed = isBlank(raw) ? `model:${identity}` : `curve:${safeLabel(raw, "driver-util-reference")}`;
  return `safe-driver-util-curve-ref:${stableSha1({ referenceSeed, sourceFingerprint })}`;
}

function buildCandidates(rows, sourceFingerprint) {
  const tokenRows = [];
  const bandedCandidates = [];

  rows.forEach((row, index) => {
    const identity = driverIdentity(row, index);
    if (!identity) return;
    tokenRows.push(identity);

    const currentBand = currentBandFrom(row);
    const voltageBand = voltageBandFrom(row);
    const powerBand = powerBandFrom(row);
    if (!currentBand || !voltageBand || !powerBand) return;

    const token = `safe-driver-candidate:${stableSha1({ identity })}`;
    const controlMarkers = controlCompatibilityMarkers(row);
    const curveMarker = curveReferenceMarker(row, identity, sourceFingerprint);
    bandedCandidates.push({
      token,
      label: `Source-backed driver candidate option ${token.slice(-6)}`,
      approved: statusAllowsSourceUse(row),
      supplyMarker: supplyMarker(row),
      controlMarkers,
      currentBand,
      voltageBand,
      powerBand,
      curveReferenceMarker: curveMarker,
      electricalBandFingerprint: `safe-driver-electrical-band:${stableSha1({ currentBand, voltageBand, powerBand })}`,
    });
  });

  return {
    tokenRows,
    candidates: bandedCandidates.sort((left, right) => left.token.localeCompare(right.token)),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    driverCandidateProjectionReady: false,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function safetyBase(extra = {}) {
  return {
    schemaId: RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SCHEMA_VERSION,
    state: RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_STATE,
    ok: extra.ok === true,
    blocker: extra.blocker || null,
    driverCandidateProjectionReady: extra.driverCandidateProjectionReady === true,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceBacked: extra.sourceBacked === true,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    driverCandidateProjectionFingerprint: extra.driverCandidateProjectionFingerprint || null,
    driverCandidateSummary: extra.driverCandidateSummary || null,
    driverOptionSummary: extra.driverOptionSummary || null,
    driverElectricalBandSummary: extra.driverElectricalBandSummary || null,
    driverUtilCurveReferenceSummary: extra.driverUtilCurveReferenceSummary || null,
    driverCompatibilitySummary: extra.driverCompatibilitySummary || null,
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
    rawCurveRowsReturned: false,
    rawDriverUtilPayloadReturned: false,
    rawCurvePointsReturned: false,
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
      driverRowsBlocked: true,
      boardRowsBlocked: true,
      productRowsBlocked: true,
      accessoryRowsBlocked: true,
      runtimeDataRowsBlocked: true,
      rawCurveRowsBlocked: true,
      rawDriverUtilPayloadsBlocked: true,
      sourceSnapshotSerializationBlocked: true,
      selectorPayloadBlocked: true,
      enginePayloadBlocked: true,
      engineResultBlocked: true,
      exactElectricalValuesBlocked: true,
      privateDataBlocked: true,
      iesPhotometryAndBase64Blocked: true,
    },
    safetyFlags: clonePlain(RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SAFETY_FLAGS),
  };
}

function buildProjectionFingerprint(payload) {
  return `safe-driver-candidate-projection:${stableSha1(payload)}`;
}

function finalizeSummary(summary) {
  const serialized = JSON.stringify(summary);
  if (PRIVATE_PATH_PATTERN.test(serialized)
    || serialized.includes("IESNA:")
    || serialized.includes("candelaGrid")) {
    return failClosed("unsafe-driver-candidate-projection-output", "Driver candidate projection output contained a private path, IES/candela marker, or unsafe artifact marker.", {
      sourceFingerprint: summary.sourceFingerprint,
      policyFingerprint: summary.policyFingerprint,
    });
  }
  return Object.freeze(summary);
}

export function buildRuntimeSafeDriverCandidateProjectionSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const sourceAccessSummary = resolveSourceAccessSummary(source);

  const inputBlocker = unsafeInputBlocker(source);
  if (inputBlocker) {
    return failClosed(inputBlocker, "Unsafe returned rows, raw payloads, exact electrical values, raw curve rows, donor invocation, generation, mutation, route, POST, private path, credential, or artifact signals were supplied.");
  }

  const sourceFingerprint = sourceFingerprintFrom(sourceAccessSummary, source);
  if (!sourceFingerprint) {
    return failClosed("missing-source-fingerprint", "A safe source fingerprint is required before driver-candidate projection.");
  }

  const rows = resolveDriverRecords(source, sourceAccessSummary);
  const presence = tablePresence(source, sourceAccessSummary, rows);
  const sourceTablePresenceSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    driverTablePresent: presence.present === true,
    driverSourceMarker: presence.present === true ? `safe-source-table:${stableSha1({ table: "DRIVERS", sourceFingerprint })}` : null,
    driverRowCountBand: countBand(presence.rowCount),
    sourceFingerprintAvailable: true,
    rawRowsReturned: false,
    rawDriverRowsReturned: false,
    rawHeadersReturned: false,
    rawSourceSnapshotReturned: false,
  };

  if (presence.present !== true) {
    return failClosed("missing-driver-source-marker", "A safe DRIVERS table/source marker is required before driver-candidate projection.", {
      sourceFingerprint,
      sourceTablePresenceSummary,
    });
  }

  const { tokenRows, candidates } = buildCandidates(rows, sourceFingerprint);
  if (tokenRows.length === 0) {
    return failClosed("missing-driver-candidate-token", "At least one safe driver-candidate token must be derivable from source-shaped DRIVERS records.", {
      sourceFingerprint,
      sourceTablePresenceSummary,
    });
  }
  if (candidates.length === 0) {
    return failClosed("missing-safe-electrical-band", "Safe driver current, voltage, and power bands are required before driver-candidate projection can become ready.", {
      sourceFingerprint,
      sourceTablePresenceSummary,
    });
  }

  const approvedCount = candidates.filter((candidate) => candidate.approved).length;
  const candidateTokens = candidates.map((candidate) => candidate.token);
  const candidateLabels = candidates.map((candidate) => candidate.label);
  const currentBands = [...new Set(candidates.map((candidate) => candidate.currentBand))].sort();
  const voltageBands = [...new Set(candidates.map((candidate) => candidate.voltageBand))].sort();
  const powerBands = [...new Set(candidates.map((candidate) => candidate.powerBand))].sort();
  const curveReferenceMarkers = [...new Set(candidates.map((candidate) => candidate.curveReferenceMarker))].sort();
  const controlMarkers = [...new Set(candidates.flatMap((candidate) => candidate.controlMarkers))].sort();
  const supplyMarkers = [...new Set(candidates.map((candidate) => candidate.supplyMarker))].sort();

  const driverOptionSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    driverCandidateCountBand: countBand(rows.length),
    approvedDriverCandidateCountBand: countBand(approvedCount),
    bandedDriverCandidateCountBand: countBand(candidates.length),
    driverCandidateTokens: candidateTokens,
    driverCandidateLabels: candidateLabels,
    rawDriverRowsReturned: false,
    exactElectricalValuesReturned: false,
  };
  const driverElectricalBandSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    currentBands,
    voltageBands,
    powerBands,
    currentBandCountBand: countBand(currentBands.length),
    voltageBandCountBand: countBand(voltageBands.length),
    powerBandCountBand: countBand(powerBands.length),
    exactCurrentValuesReturned: false,
    exactVoltageValuesReturned: false,
    exactPowerValuesReturned: false,
    exactElectricalValuesReturned: false,
    rawDriverRowsReturned: false,
  };
  const driverUtilCurveReferenceSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    curveReferenceAvailable: curveReferenceMarkers.length > 0,
    curveReferenceMarkers,
    curveReferenceCountBand: countBand(curveReferenceMarkers.length),
    curveReferenceFingerprint: `safe-driver-util-curve-reference:${stableSha1({ curveReferenceMarkers, sourceFingerprint })}`,
    rawCurveRowsReturned: false,
    rawDriverUtilPayloadReturned: false,
    rawCurvePointsReturned: false,
  };
  const driverCompatibilitySummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    hasApprovedDriverCandidates: approvedCount > 0,
    hasDaliCompatibleDriverCandidates: controlMarkers.includes("dali-compatible"),
    hasConstantCurrentDriverCandidates: supplyMarkers.includes("constant-current-compatible"),
    controlCompatibilityMarkers: controlMarkers,
    supplyTypeMarkers: supplyMarkers,
    controlCompatibilityCountBand: countBand(controlMarkers.filter((value) => value !== "unspecified").length),
    supplyTypeCountBand: countBand(supplyMarkers.filter((value) => value !== "unspecified").length),
    rawDriverRowsReturned: false,
    exactElectricalValuesReturned: false,
  };

  const policyFingerprint = `safe-policy:${stableSha1({
    sourceFingerprint,
    sourceTablePresenceSummary,
    driverOptionSummary: {
      driverCandidateCountBand: driverOptionSummary.driverCandidateCountBand,
      approvedDriverCandidateCountBand: driverOptionSummary.approvedDriverCandidateCountBand,
      bandedDriverCandidateCountBand: driverOptionSummary.bandedDriverCandidateCountBand,
    },
    driverElectricalBandSummary,
    driverCompatibilitySummary,
    schemaId: RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SCHEMA_ID,
  })}`;

  const fingerprintPayload = {
    schemaId: RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_SCHEMA_VERSION,
    state: RUNTIME_SAFE_DRIVER_CANDIDATE_PROJECTION_STATE,
    sourceFingerprint,
    policyFingerprint,
    candidateTokens,
    driverElectricalBandSummary,
    driverUtilCurveReferenceSummary,
    driverCompatibilitySummary,
    sourceTablePresenceSummary,
  };
  const driverCandidateProjectionFingerprint = buildProjectionFingerprint(fingerprintPayload);
  const driverCandidateSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    sourceBacked: true,
    driverCandidateProjectionReady: true,
    selectedDriverCandidateToken: candidateTokens[0],
    driverCandidateTokens: candidateTokens,
    driverCandidateLabels: candidateLabels,
    driverCandidateCountBand: countBand(candidates.length),
    approvedDriverCandidateCountBand: countBand(approvedCount),
    primaryCurrentBand: currentBands[0],
    primaryVoltageBand: voltageBands[0],
    primaryPowerBand: powerBands[0],
    driverCandidateProjectionFingerprint,
    policyFingerprint,
    sourceFingerprint,
    rawRowsReturned: false,
    rawDriverRowsReturned: false,
    rawSourceSnapshotReturned: false,
    exactElectricalValuesReturned: false,
    rawCurveRowsReturned: false,
    rawDriverUtilPayloadReturned: false,
    rawCurvePointsReturned: false,
  };

  const warnings = [];
  if (approvedCount === 0) {
    warnings.push("No approved/live driver candidate marker was found; projection remains source-backed but compatibility requires review.");
  }
  if (candidates.length > 1) {
    warnings.push("Multiple source-backed driver candidate options remain available; future candidate scoring must resolve selection.");
  }

  return finalizeSummary(safetyBase({
    ok: true,
    driverCandidateProjectionReady: true,
    sourceBacked: true,
    sourceFingerprint,
    policyFingerprint,
    driverCandidateProjectionFingerprint,
    driverCandidateSummary,
    driverOptionSummary,
    driverElectricalBandSummary,
    driverUtilCurveReferenceSummary,
    driverCompatibilitySummary,
    sourceTablePresenceSummary,
    warnings,
    failClosedDiagnostics: [],
  }));
}

export const buildSafeDriverCandidateProjectionSummary = buildRuntimeSafeDriverCandidateProjectionSummary;
export const buildEngineRunTableSafeDriverCandidateProjectionSummary = buildRuntimeSafeDriverCandidateProjectionSummary;
