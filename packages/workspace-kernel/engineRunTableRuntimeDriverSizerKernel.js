import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.driver-sizer-summary";
export const ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_STATE =
  "runtime_driver_sizer_diagnostic_only";

export const ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  exactElectricalValuesExposed: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  boardDataMakerImported: false,
  donorEngineInvoked: false,
  productionEngineExecutionEnabled: false,
  fullElectricalSizerPortEnabled: false,
  fullDriverSelectorPortEnabled: false,
  zoneAllocationEnabled: false,
  frozenZoneReselectionEnabled: false,
  gateDValidationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawDriverRowsReturned: false,
  rawBoardRowsReturned: false,
  rawDriverUtilPayloadReturned: false,
  rawCurvePointsReturned: false,
  rawEnginePayloadReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe-[0-9A-Za-z_.:-]{4,240}$/;
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,120}$/;
const RAW_BOARD_KEY_PATTERN = /^(?:BOARDS|rawBoards?|rawBoardRows|boardRows|boardsTable|boardTable)$/i;
const RAW_DRIVER_KEY_PATTERN = /^(?:DRIVERS|rawDrivers?|rawDriverRows|driverRows|driversTable|driverTable)$/i;
const RAW_DRIVER_UTIL_KEY_PATTERN = /^(?:driverUtilPayload|rawDriverUtilPayload|rawDriverUtilPayloads|driverUtilJson|driverUtilCurveJson)$/i;
const RAW_CURVE_POINT_KEY_PATTERN = /^(?:curvePoints|rawCurvePoints|points|curves|curveRows|rawCurveRows)$/i;
const RAW_ENGINE_KEY_PATTERN = /^(?:enginePayload|rawEnginePayload|roughElectricalPayload|selectorPayload|runEnginePayload)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|path)$/i;
const UNSAFE_TRUE_FLAG_PATTERN = /^(?:rawRowsReturned|rawBoardRowsReturned|rawDriverRowsReturned|rawCurveRowsReturned|rawDriverUtilPayloadReturned|rawDriverUtilPayloadsExposed|rawCurvePointsReturned|rawEnginePayloadReturned|donorEngineInvoked|runtimeDataMutated|selectedResultPersisted|iesGenerated|runTableGenerated|routesAdded|postEndpointsAdded|exactElectricalValuesExposed)$/i;
const EXACT_EXPOSURE_KEY_PATTERN = /^(?:requestExactElectricalValues|exposeExactElectricalValues|exactElectricalValues|requestExactValues|exposeExactValues)$/i;
const EXACT_HIDDEN_ELECTRICAL_KEY_PATTERN = /^(?:vout_max_v|voutMaxV|vout_min_v|voutMinV|pout_max_w|poutMaxW|pout_min_w|poutMinW|p_max_w|v_max|v_min|opt_eff|efficiency|vfAtCurrentV|wattAtCurrentW|boardVoltageV|boardPowerW|driverCapacityMm|capacityMm|capacity_mm|headroomW|headroom_w|avgUtilization|utilDistance|utilisationFactor|utilizationFactor)$/;

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

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return SAFE_TOKEN_PATTERN.test(token) ? token : fallback;
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

function toBoolean(value, defaultValue = false) {
  if (value === true || value === false) return value;
  if (isBlank(value)) return defaultValue;
  return new Set(["TRUE", "YES", "Y", "1", "T", "APPROVED"]).has(String(value).trim().toUpperCase());
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 260);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function requestedExactExposure(source) {
  if (!isPlainObject(source)) return false;
  for (const [key, value] of Object.entries(source)) {
    if (EXACT_EXPOSURE_KEY_PATTERN.test(key) && value === true) return true;
  }
  return false;
}

function firstUnsafeBlocker(value, depth = 0) {
  if (depth > 7) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "unsafe-private-path-input" : null;
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_TRUE_FLAG_PATTERN.test(key) && nested === true) return "exact-value-exposure-not-approved";
    if (RAW_BOARD_KEY_PATTERN.test(key)) return "unsafe-raw-board-row-input";
    if (RAW_DRIVER_KEY_PATTERN.test(key)) return "unsafe-raw-driver-row-input";
    if (RAW_DRIVER_UTIL_KEY_PATTERN.test(key)) return "unsafe-driver-util-payload-input";
    if (RAW_CURVE_POINT_KEY_PATTERN.test(key)) return "unsafe-curve-point-input";
    if (RAW_ENGINE_KEY_PATTERN.test(key)) return "unsafe-raw-engine-payload-input";
    if (EXACT_HIDDEN_ELECTRICAL_KEY_PATTERN.test(key)) return "exact-value-exposure-not-approved";
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "unsafe-private-path-input";
    }
    if (typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) return "unsafe-private-path-input";
    if (Array.isArray(nested)) {
      if (RAW_BOARD_KEY_PATTERN.test(key)) return "unsafe-raw-board-row-input";
      if (RAW_DRIVER_KEY_PATTERN.test(key)) return "unsafe-raw-driver-row-input";
      if (RAW_CURVE_POINT_KEY_PATTERN.test(key) || /(?:raw|payload|curve|point|row|rows)/i.test(key)) {
        return RAW_CURVE_POINT_KEY_PATTERN.test(key) ? "unsafe-curve-point-input" : "unsafe-driver-util-payload-input";
      }
      for (const entry of nested) {
        if (isPlainObject(entry)) {
          const nestedBlocker = firstUnsafeBlocker(entry, depth + 1);
          if (nestedBlocker) return nestedBlocker;
        }
      }
    }
    if (isPlainObject(nested)) {
      const nestedBlocker = firstUnsafeBlocker(nested, depth + 1);
      if (nestedBlocker) return nestedBlocker;
    }
  }
  return null;
}

function inputUnsafeBlocker(input) {
  if (!isPlainObject(input)) return null;
  for (const [key, value] of Object.entries(input)) {
    if (key === "safeDriverCandidateSummaries") continue;
    if (["boardFillSummary", "boardElectricalSummary", "safeBoardElectricalSummary", "sourceBackedBoardElectricalSummary", "driverUtilLookupMetadata", "policySummary"].includes(key)) continue;
    if (RAW_BOARD_KEY_PATTERN.test(key)) return "unsafe-raw-board-row-input";
    if (RAW_DRIVER_KEY_PATTERN.test(key)) return "unsafe-raw-driver-row-input";
    if (RAW_DRIVER_UTIL_KEY_PATTERN.test(key)) return "unsafe-driver-util-payload-input";
    if (RAW_CURVE_POINT_KEY_PATTERN.test(key)) return "unsafe-curve-point-input";
    if (RAW_ENGINE_KEY_PATTERN.test(key)) return "unsafe-raw-engine-payload-input";
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof value === "string" && PRIVATE_PATH_PATTERN.test(value)) return "unsafe-private-path-input";
  }
  return null;
}

function incrementBucket(buckets, key) {
  const safeKey = safeLabel(key, "unsafe-input").replace(/\s+/g, "-").toLowerCase();
  buckets[safeKey] = (buckets[safeKey] || 0) + 1;
}

function safetyBase(extra = {}) {
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    driverSizerReady: extra.driverSizerReady ?? false,
    selectedDriverSummary: extra.selectedDriverSummary || null,
    driverCandidateCount: extra.driverCandidateCount ?? 0,
    compatibleDriverCandidateCount: extra.compatibleDriverCandidateCount ?? 0,
    rejectedReasonBuckets: isPlainObject(extra.rejectedReasonBuckets) ? extra.rejectedReasonBuckets : {},
    currentRangeStatus: extra.currentRangeStatus || "unresolved",
    utilisationSource: extra.utilisationSource || "unresolved",
    utilisationBand: extra.utilisationBand || "unresolved",
    capacityBand: extra.capacityBand || "unresolved",
    zoneCountCandidate: extra.zoneCountCandidate ?? null,
    limitingFactorCategory: extra.limitingFactorCategory || "unresolved",
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    driverSizerFingerprint: extra.driverSizerFingerprint || null,
    rawDriverRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverUtilPayloadReturned: false,
    rawCurvePointsReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    iesGenerated: false,
    runTableGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_DRIVER_SIZER_KERNEL_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    driverSizerReady: false,
    blocker,
    failClosedDiagnostics: [diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function resolveBoardFillSummary(input) {
  const summary = firstPresent(input, [
    "boardFillSummary",
    "safeBoardFillSummary",
    "runtimeBoardFillSummary",
    "runtimeNativeBoardFillSummary",
  ]);
  return isPlainObject(summary) ? summary : null;
}

function resolveBoardElectricalSummary(input) {
  const summary = firstPresent(input, [
    "boardElectricalSummary",
    "safeBoardElectricalSummary",
    "sourceBackedBoardElectricalSummary",
    "runtimeBoardElectricalSummary",
  ]);
  return isPlainObject(summary) ? summary : null;
}

function validateBoardFillSummary(boardFillSummary) {
  if (!isPlainObject(boardFillSummary)) {
    return { ok: false, blocker: "missing-board-fill-summary", diagnostic: "Safe board-fill summary is required before runtime driver sizing diagnostics." };
  }
  if (boardFillSummary.ok !== true || boardFillSummary.diagnosticOnly !== true || boardFillSummary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: "unsafe-board-fill-summary", diagnostic: "Board-fill input must be an ok runtime-native diagnostic-only safe summary." };
  }
  const unsafe = firstUnsafeBlocker(boardFillSummary);
  if (unsafe) {
    return { ok: false, blocker: "unsafe-board-fill-summary", diagnostic: "Board-fill summary contains unsafe raw-row, payload, path, exact-value, or mutation markers." };
  }
  const boardCount = toPositiveInteger(firstPresent(boardFillSummary, ["boardCount", "boardsCount"]));
  const boardUsedLengthMm = toPositiveInteger(firstPresent(boardFillSummary, ["boardUsedLengthMm", "bodyLengthMm", "board_used_length_mm"]));
  if (!boardCount || !boardUsedLengthMm) {
    return { ok: false, blocker: "unsafe-board-fill-summary", diagnostic: "Board-fill summary must include positive safe board count and used/body length summary fields." };
  }
  return { ok: true, boardCount, boardUsedLengthMm };
}

function validateBoardElectricalSummary(boardElectricalSummary) {
  if (!isPlainObject(boardElectricalSummary)) {
    return { ok: false, blocker: "missing-board-electrical-summary", diagnostic: "Safe board electrical summary is required before runtime driver sizing diagnostics." };
  }
  if (boardElectricalSummary.ok !== true || boardElectricalSummary.diagnosticOnly !== true || boardElectricalSummary.nativeRuntimeKernel !== true || boardElectricalSummary.electricalSummaryReady !== true) {
    return { ok: false, blocker: "unsafe-board-electrical-summary", diagnostic: "Board electrical input must be an ok runtime-native diagnostic-only safe summary." };
  }
  if (boardElectricalSummary.exactElectricalValuesExposed === true || requestedExactExposure(boardElectricalSummary)) {
    return { ok: false, blocker: "exact-value-exposure-not-approved", diagnostic: "Exact electrical values are not approved for this diagnostic driver sizer kernel." };
  }
  const unsafe = firstUnsafeBlocker(boardElectricalSummary);
  if (unsafe) {
    return { ok: false, blocker: unsafe === "exact-value-exposure-not-approved" ? unsafe : "unsafe-board-electrical-summary", diagnostic: "Board electrical summary contains unsafe raw-row, payload, path, exact-value, or mutation markers." };
  }
  return { ok: true };
}

function resolveSelectedCurrent(input, boardElectricalSummary) {
  return toPositiveInteger(firstPresent(input, [
    "selectedCurrentMa",
    "selectedCurrentMA",
    "selectedCurrent_mA",
    "currentMa",
    "current_ma",
  ]) ?? firstPresent(boardElectricalSummary, ["selectedCurrentMa", "currentMa", "current_ma"]));
}

function validateFingerprints(input, boardElectricalSummary) {
  const policyFingerprint = safeFingerprint(firstPresent(input, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(input, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!policyFingerprint) {
    return { ok: false, blocker: "missing-policy-fingerprint", diagnostic: "A safe policy fingerprint is required before runtime driver sizing diagnostics." };
  }
  if (!sourceFingerprint) {
    return { ok: false, blocker: "missing-source-fingerprint", diagnostic: "A safe source fingerprint is required before runtime driver sizing diagnostics." };
  }

  const electricalPolicyFingerprint = safeFingerprint(firstPresent(boardElectricalSummary, ["policyFingerprint", "safePolicyFingerprint"]));
  const electricalSourceFingerprint = safeFingerprint(firstPresent(boardElectricalSummary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (electricalPolicyFingerprint && electricalPolicyFingerprint !== policyFingerprint) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: "Policy fingerprint does not match the sealed board electrical summary." };
  }
  if (electricalSourceFingerprint && electricalSourceFingerprint !== sourceFingerprint) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: "Source fingerprint does not match the sealed board electrical summary." };
  }

  return { ok: true, policyFingerprint, sourceFingerprint };
}

function validateDriverUtilLookupMetadata(metadata) {
  if (!isPlainObject(metadata)) {
    return { ok: false, blocker: "missing-driver-util-lookup", diagnostic: "Runtime driver-util lookup metadata is required before driver sizing diagnostics." };
  }
  const unsafe = firstUnsafeBlocker(metadata);
  if (unsafe) {
    return { ok: false, blocker: "invalid-driver-util-lookup", diagnostic: "Driver-util lookup metadata must not include raw payloads, curve points, private paths, or mutation markers." };
  }
  if (metadata.ok !== true && metadata.valid !== true && metadata?.manifest?.valid !== true && metadata?.curve?.raw_payload_returned !== false) {
    return { ok: false, blocker: "invalid-driver-util-lookup", diagnostic: "Driver-util lookup metadata must be an ok/valid sealed metadata summary." };
  }
  const rawPayloadReturned = metadata.raw_payload_returned === true
    || metadata.rawDriverUtilPayloadsIncluded === true
    || metadata?.manifest?.rawDriverUtilPayloadsIncluded === true
    || metadata?.curve?.raw_payload_returned === true;
  const rawCurvePointsReturned = metadata.raw_curve_points_returned === true
    || metadata.rawCurvePointsReturned === true
    || metadata?.curve?.raw_curve_points_returned === true;
  if (rawPayloadReturned || rawCurvePointsReturned) {
    return { ok: false, blocker: "invalid-driver-util-lookup", diagnostic: "Driver-util lookup metadata indicates raw payload or curve point exposure." };
  }

  let source = "runtime-driver-util-lookup-metadata";
  if (metadata?.manifest?.valid === true) source = "runtime-driver-util-manifest-metadata";
  else if (metadata.lookup_method) source = `runtime-driver-util-${safeLabel(metadata.lookup_method, "lookup")}`;
  else if (metadata?.curve?.filename) source = "runtime-driver-util-curve-metadata";
  return { ok: true, source };
}

function resolveDriverUtilMetadata(candidate, globalMetadata) {
  const candidateMetadata = firstPresent(candidate, [
    "driverUtilLookupMetadata",
    "runtimeDriverUtilLookupMetadata",
    "utilisationLookupMetadata",
    "utilizationLookupMetadata",
  ]);
  if (isPlainObject(candidateMetadata)) return validateDriverUtilLookupMetadata(candidateMetadata);
  return validateDriverUtilLookupMetadata(globalMetadata);
}

function normaliseSupply(value) {
  const supply = String(value ?? "").trim().toLowerCase().replace(/[\s_]+/g, "-");
  if (["cc", "constant-current", "constantcurrent"].includes(supply)) return "constant-current";
  if (["cv", "constant-voltage", "constantvoltage"].includes(supply)) return "constant-voltage";
  return supply || "unresolved";
}

function driverSupportsDali(controlType) {
  return String(controlType || "").toLowerCase().includes("dali");
}

function controlTypeSupported(controlType) {
  const control = String(controlType || "").trim().toLowerCase();
  if (!control) return true;
  if (control.includes("dali")) return true;
  if (control.includes("non") && control.includes("dim")) return true;
  if (control.includes("on") && control.includes("off")) return true;
  if (control.includes("switch")) return true;
  if (control.includes("0-10") || control.includes("1-10")) return true;
  return false;
}

function utilRank(candidate) {
  const explicit = toPositiveInteger(firstPresent(candidate, ["utilisationTargetRank", "utilizationTargetRank", "utilisationDistanceRank"]));
  if (explicit !== null) return explicit;
  const text = `${candidate.utilisationBand || ""} ${candidate.utilizationBand || ""} ${candidate.utilisationDistanceBand || ""} ${candidate.utilizationDistanceBand || ""}`.toLowerCase();
  if (/target|optimal|ideal|near/.test(text)) return 0;
  if (/slight|close|moderate/.test(text)) return 1;
  if (/under|over|high|low/.test(text)) return 2;
  if (/review|outside|poor/.test(text)) return 3;
  return 4;
}

function headroomRank(candidate) {
  const band = String(firstPresent(candidate, ["headroomBand", "capacityHeadroomBand", "capacityBand"]) || "").toLowerCase();
  if (/very-high|large|greater|high/.test(band)) return 0;
  if (/moderate|medium|normal/.test(band)) return 1;
  if (/low|small/.test(band)) return 2;
  if (/minimal|tight|review/.test(band)) return 3;
  return 4;
}

function costRank(candidate) {
  const band = String(firstPresent(candidate, ["safeCostBand", "costBand", "cost_band"]) || "").toLowerCase();
  if (!band) return 99;
  if (/low|economy|cheap|budget/.test(band)) return 0;
  if (/mid|medium|standard/.test(band)) return 1;
  if (/high|premium/.test(band)) return 2;
  return 50;
}

function limitingFactorCategory(candidate) {
  const value = safeLabel(firstPresent(candidate, [
    "limitingFactorCategory",
    "limitingFactor",
    "capacityLimitingFactorCategory",
  ]), "unresolved").toLowerCase();
  if (value.includes("voltage")) return "voltage-band-limited";
  if (value.includes("power") || value.includes("watt")) return "power-band-limited";
  if (value.includes("current")) return "current-range-limited";
  return value || "unresolved";
}

function normaliseCandidate(summary, selectedCurrentMa, requireDali, preferredToken, globalMetadata, rejectedReasonBuckets) {
  if (!isPlainObject(summary)) {
    incrementBucket(rejectedReasonBuckets, "unsafe-driver-summary");
    return { ok: false, blocker: "unsafe-raw-driver-row-input" };
  }
  const unsafe = firstUnsafeBlocker(summary);
  if (unsafe) {
    incrementBucket(rejectedReasonBuckets, unsafe);
    return { ok: false, blocker: unsafe };
  }

  const safeModelToken = safeToken(firstPresent(summary, [
    "safeModelToken",
    "modelToken",
    "driverModelToken",
    "safeDriverModelToken",
    "token",
  ]));
  const safeModelLabel = safeLabel(firstPresent(summary, [
    "safeModelLabel",
    "modelLabel",
    "driverModelLabel",
    "label",
    "model",
  ]), safeModelToken || "unresolved-driver");
  if (!safeModelToken && safeModelLabel === "unresolved-driver") {
    incrementBucket(rejectedReasonBuckets, "missing-safe-model-token");
    return { ok: false, blocker: "unsafe-raw-driver-row-input" };
  }

  const approved = toBoolean(firstPresent(summary, ["approved", "isApproved", "safeApproved"]), true);
  if (!approved) {
    incrementBucket(rejectedReasonBuckets, "unapproved-candidate");
    return { ok: false, blocker: "unapproved-candidate" };
  }

  const supplyType = normaliseSupply(firstPresent(summary, ["supplyType", "supply", "driverSupplyType"]));
  if (supplyType !== "constant-current") {
    incrementBucket(rejectedReasonBuckets, "non-constant-current-supply");
    return { ok: false, blocker: "non-constant-current-supply" };
  }

  const currentMinMa = toPositiveInteger(firstPresent(summary, ["currentMinMa", "ioutMinMa", "iout_min_ma", "iout_min_mA"]));
  const currentMaxMa = toPositiveInteger(firstPresent(summary, ["currentMaxMa", "ioutMaxMa", "iout_max_ma", "iout_max_mA"]));
  if (!currentMinMa || !currentMaxMa || currentMinMa > currentMaxMa) {
    incrementBucket(rejectedReasonBuckets, "missing-current-range");
    return { ok: false, blocker: "missing-current-range" };
  }
  if (selectedCurrentMa < currentMinMa || selectedCurrentMa > currentMaxMa) {
    incrementBucket(rejectedReasonBuckets, "current-range-mismatch");
    return { ok: false, blocker: "current-range-mismatch" };
  }

  const controlType = safeLabel(firstPresent(summary, ["nativeControlType", "controlType", "safeControlType"]), "unresolved");
  if (!controlTypeSupported(controlType)) {
    incrementBucket(rejectedReasonBuckets, "unsupported-control-type");
    return { ok: false, blocker: "unsupported-control-type" };
  }
  const daliCapable = driverSupportsDali(controlType);
  if (requireDali === true && !daliCapable) {
    incrementBucket(rejectedReasonBuckets, "dali-required-incompatible");
    return { ok: false, blocker: "unsupported-control-type" };
  }

  const utilMetadata = resolveDriverUtilMetadata(summary, globalMetadata);
  if (!utilMetadata.ok) {
    incrementBucket(rejectedReasonBuckets, utilMetadata.blocker);
    return { ok: false, blocker: utilMetadata.blocker };
  }

  const zoneCountCandidate = toPositiveInteger(firstPresent(summary, ["zoneCountCandidate", "zoneCount", "safeZoneCountCandidate"]));
  if (!zoneCountCandidate) {
    incrementBucket(rejectedReasonBuckets, "missing-zone-count-candidate");
    return { ok: false, blocker: "missing-zone-count-candidate" };
  }

  const utilisationBand = safeLabel(firstPresent(summary, ["utilisationBand", "utilizationBand", "safeUtilisationBand"]), "unresolved");
  const capacityBand = safeLabel(firstPresent(summary, ["capacityBand", "safeCapacityBand", "driverCapacityBand"]), "unresolved");
  const headroomBand = safeLabel(firstPresent(summary, ["headroomBand", "safeHeadroomBand", "capacityHeadroomBand"]), "unresolved");
  const costBand = safeLabel(firstPresent(summary, ["safeCostBand", "costBand", "cost_band"]), "");
  const preferred = Boolean(preferredToken && [safeModelToken, safeToken(safeModelLabel)].includes(preferredToken));

  return {
    ok: true,
    candidate: {
      safeModelToken: safeModelToken || safeToken(safeModelLabel, "driver"),
      safeModelLabel,
      supplyType,
      controlType,
      daliCapable,
      approvedStatus: "approved-safe-summary",
      currentRangeStatus: "selected-current-within-safe-driver-range",
      utilisationSource: utilMetadata.source,
      utilisationBand,
      capacityBand,
      headroomBand,
      costBand,
      zoneCountCandidate,
      limitingFactorCategory: limitingFactorCategory(summary),
      preferred,
      utilRank: utilRank(summary),
      headroomRank: headroomRank(summary),
      costRank: costRank(summary),
    },
  };
}

function sortKey(candidate, requireDali) {
  return [
    candidate.zoneCountCandidate,
    candidate.utilRank,
    candidate.headroomRank,
    requireDali === true ? (candidate.daliCapable ? 0 : 1) : 0,
    candidate.preferred ? 0 : 1,
    candidate.costRank,
    candidate.safeModelLabel.toLowerCase(),
    candidate.safeModelToken.toLowerCase(),
  ];
}

function compareKeys(left, right) {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const a = left[index];
    const b = right[index];
    if (typeof a === "number" && typeof b === "number") {
      if (a !== b) return a - b;
    } else {
      const compared = String(a ?? "").localeCompare(String(b ?? ""));
      if (compared !== 0) return compared;
    }
  }
  return 0;
}

function buildSelectedDriverSummary(candidate, rankingBasis) {
  return {
    safeModelToken: candidate.safeModelToken,
    safeModelLabel: candidate.safeModelLabel,
    supplyType: candidate.supplyType,
    controlType: candidate.controlType,
    daliCapable: candidate.daliCapable,
    approvedStatus: candidate.approvedStatus,
    currentRangeStatus: candidate.currentRangeStatus,
    utilisationSource: candidate.utilisationSource,
    utilisationBand: candidate.utilisationBand,
    capacityBand: candidate.capacityBand,
    headroomBand: candidate.headroomBand,
    costBand: candidate.costBand || null,
    zoneCountCandidate: candidate.zoneCountCandidate,
    limitingFactorCategory: candidate.limitingFactorCategory,
    rankingBasis,
    rawDriverRowsReturned: false,
    rawDriverUtilPayloadReturned: false,
    rawCurvePointsReturned: false,
  };
}

export function buildRuntimeDriverSizerKernelSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  if (requestedExactExposure(source)) {
    return failClosed("exact-value-exposure-not-approved", "Exact electrical value exposure is not approved for this diagnostic driver sizer kernel.");
  }
  const unsafeInput = inputUnsafeBlocker(source);
  if (unsafeInput) {
    return failClosed(unsafeInput, "Input contains unsafe raw rows, raw payloads, private paths, or Engine payload markers.");
  }

  const boardFillSummary = resolveBoardFillSummary(source);
  const fillValidation = validateBoardFillSummary(boardFillSummary);
  if (!fillValidation.ok) return failClosed(fillValidation.blocker, fillValidation.diagnostic);

  const boardElectricalSummary = resolveBoardElectricalSummary(source);
  const electricalValidation = validateBoardElectricalSummary(boardElectricalSummary);
  if (!electricalValidation.ok) return failClosed(electricalValidation.blocker, electricalValidation.diagnostic);

  const selectedCurrentMa = resolveSelectedCurrent(source, boardElectricalSummary);
  if (!selectedCurrentMa) {
    return failClosed("missing-selected-current", "A positive selected current is required before runtime driver sizing diagnostics.");
  }
  const electricalCurrentMa = toPositiveInteger(firstPresent(boardElectricalSummary, ["selectedCurrentMa", "currentMa", "current_ma"]));
  if (electricalCurrentMa && electricalCurrentMa !== selectedCurrentMa) {
    return failClosed("selected-current-mismatch", "Selected current does not match the sealed board electrical summary.");
  }

  const fingerprints = validateFingerprints(source, boardElectricalSummary);
  if (!fingerprints.ok) return failClosed(fingerprints.blocker, fingerprints.diagnostic);

  const globalDriverUtilMetadata = firstPresent(source, [
    "driverUtilLookupMetadata",
    "runtimeDriverUtilLookupMetadata",
    "driverUtilMetadata",
  ]);
  const globalMetadataValidation = validateDriverUtilLookupMetadata(globalDriverUtilMetadata);
  if (!globalMetadataValidation.ok && !Array.isArray(source.safeDriverCandidateSummaries)) {
    return failClosed(globalMetadataValidation.blocker, globalMetadataValidation.diagnostic, {
      policyFingerprint: fingerprints.policyFingerprint,
      sourceFingerprint: fingerprints.sourceFingerprint,
    });
  }
  if (isPlainObject(globalDriverUtilMetadata) && !globalMetadataValidation.ok) {
    return failClosed(globalMetadataValidation.blocker, globalMetadataValidation.diagnostic, {
      policyFingerprint: fingerprints.policyFingerprint,
      sourceFingerprint: fingerprints.sourceFingerprint,
    });
  }

  if (!Array.isArray(source.safeDriverCandidateSummaries) || source.safeDriverCandidateSummaries.length === 0) {
    return failClosed("missing-driver-candidates", "At least one safe driver candidate summary is required before driver sizing diagnostics.", {
      policyFingerprint: fingerprints.policyFingerprint,
      sourceFingerprint: fingerprints.sourceFingerprint,
    });
  }

  const requireDali = source.requireDali === true;
  const preferredToken = safeToken(firstPresent(source, ["preferredSafeModelToken", "preferredModelToken", "preferredDriverModelToken"]));
  const rejectedReasonBuckets = {};
  const candidates = [];
  for (const summary of source.safeDriverCandidateSummaries) {
    const normalised = normaliseCandidate(
      summary,
      selectedCurrentMa,
      requireDali,
      preferredToken,
      globalDriverUtilMetadata,
      rejectedReasonBuckets,
    );
    if (normalised.ok) candidates.push(normalised.candidate);
  }

  if (candidates.length === 0) {
    const blocker = rejectedReasonBuckets["unsupported-control-type"] || rejectedReasonBuckets["dali-required-incompatible"]
      ? "unsupported-control-type"
      : "no-compatible-drivers";
    return failClosed(blocker, "No compatible safe driver candidate summaries remained after bounded filtering.", {
      driverCandidateCount: source.safeDriverCandidateSummaries.length,
      compatibleDriverCandidateCount: 0,
      rejectedReasonBuckets,
      policyFingerprint: fingerprints.policyFingerprint,
      sourceFingerprint: fingerprints.sourceFingerprint,
    });
  }

  const ranked = candidates
    .map((candidate) => ({ candidate, key: sortKey(candidate, requireDali) }))
    .sort((left, right) => compareKeys(left.key, right.key));
  if (ranked.length > 1 && compareKeys(ranked[0].key, ranked[1].key) === 0) {
    return failClosed("ambiguous-selected-driver", "Driver ranking produced an ambiguous selected driver summary.", {
      driverCandidateCount: source.safeDriverCandidateSummaries.length,
      compatibleDriverCandidateCount: candidates.length,
      rejectedReasonBuckets,
      policyFingerprint: fingerprints.policyFingerprint,
      sourceFingerprint: fingerprints.sourceFingerprint,
    });
  }

  const selected = ranked[0].candidate;
  const rankingBasis = [
    "lowest-zone-count-candidate",
    "closest-utilisation-target-band",
    "greater-headroom-band",
    requireDali ? "dali-required-compatible" : "dali-not-required",
    preferredToken ? "preferred-safe-model-token-applied" : "no-preferred-safe-model-token",
    "safe-cost-band-only-when-supplied",
    "alphabetical-safe-model-label-token",
  ];
  const selectedDriverSummary = buildSelectedDriverSummary(selected, rankingBasis);
  const warnings = [
    "Diagnostic-only runtime-native driver sizer: zone allocation, Gate D validation, RunTable generation, and selected-result persistence remain disabled.",
    "Exact driver electrical values are intentionally suppressed; safe summary bands only are returned.",
  ];
  const driverSizerFingerprint = `safe-driver-sizer:${stableSha1([
    fingerprints.policyFingerprint,
    fingerprints.sourceFingerprint,
    fillValidation.boardCount,
    fillValidation.boardUsedLengthMm,
    selected.safeModelToken,
    selected.zoneCountCandidate,
    selected.utilisationBand,
    selected.capacityBand,
    Object.entries(rejectedReasonBuckets).sort(),
  ])}`;

  return safetyBase({
    ok: true,
    driverSizerReady: true,
    selectedDriverSummary,
    driverCandidateCount: source.safeDriverCandidateSummaries.length,
    compatibleDriverCandidateCount: candidates.length,
    rejectedReasonBuckets,
    currentRangeStatus: selected.currentRangeStatus,
    utilisationSource: selected.utilisationSource,
    utilisationBand: selected.utilisationBand,
    capacityBand: selected.capacityBand,
    zoneCountCandidate: selected.zoneCountCandidate,
    limitingFactorCategory: selected.limitingFactorCategory,
    warnings,
    policyFingerprint: fingerprints.policyFingerprint,
    sourceFingerprint: fingerprints.sourceFingerprint,
    driverSizerFingerprint,
  });
}

export const buildRuntimeNativeDriverSizerSummary = buildRuntimeDriverSizerKernelSummary;
export const buildEngineRunTableRuntimeDriverSizerKernelStatus = buildRuntimeDriverSizerKernelSummary;
