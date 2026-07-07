import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.accessory-reservation-foothold-summary";
export const ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_STATE =
  "runtime_accessory_reservation_foothold_diagnostic_only";

export const ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  boardDataMakerImported: false,
  donorEngineInvoked: false,
  productionEngineExecutionEnabled: false,
  fullDonorAncillaryParityEnabled: false,
  physicalCoordinatePlacementEnabled: false,
  emergencyZonePickerEnabled: false,
  mechanicalDetailingEnabled: false,
  segmentSplitEnabled: false,
  gateDValidationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawEnginePayloadReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe(?:-[0-9A-Za-z_.:-]{4,260}|:[0-9A-Za-z_.:-]{4,260})$/;
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,120}$/;
const RAW_PRODUCT_KEY_PATTERN = /^(?:PRODUCTS?|rawProducts?|rawProductRows|productRows|productsTable|productTable|sourceProductRows)$/i;
const RAW_BOARD_KEY_PATTERN = /^(?:BOARDS?|rawBoards?|rawBoardRows|boardRows|boardsTable|boardTable|sourceBoardRows)$/i;
const RAW_ACCESSORY_KEY_PATTERN = /^(?:ACCESSORIES|rawAccessories|rawAccessoryRows|accessoryRows|accessoriesTable|accessoryTable|sourceAccessoryRows|accessoryCatalogRows)$/i;
const RAW_ENGINE_KEY_PATTERN = /^(?:enginePayload|rawEnginePayload|runEnginePayload|selectorPayload|donorPayload|rawDonorPayload|roughElectricalPayload)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|donorPath|runtimeDataPath|path)$/i;
const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^donorEngineInvoked$/i, "donor-engine-invocation-not-approved"],
  [/^runtimeDataMutated$/i, "runtime-data-mutation-not-approved"],
  [/^runtimeDataMutationAuthority$/i, "runtime-data-mutation-not-approved"],
  [/^runTableGenerated$/i, "runtable-generation-not-approved"],
  [/^iesGenerated$/i, "ies-generation-not-approved"],
  [/^rawProductRowsReturned$/i, "raw-product-row-input-not-approved"],
  [/^rawBoardRowsReturned$/i, "raw-board-row-input-not-approved"],
  [/^rawAccessoryRowsReturned$/i, "raw-accessory-row-input-not-approved"],
  [/^rawEnginePayloadReturned$/i, "raw-engine-payload-input-not-approved"],
]);
const LENGTH_ADJUSTMENT_MODES = new Set([
  "none",
  "cut-back",
  "extend-to-min-accessory-length",
  "unresolved",
]);
const DEFAULT_SUPPORTED_ACCESSORY_TYPES = new Set([
  "sensor",
  "pir",
  "spf",
  "mw",
  "motion-sensor",
  "presence-sensor",
  "daylight-sensor",
  "accessory",
  "blank-cover",
  "power-entry",
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

function toIntegerMm(value) {
  const parsed = toFiniteNumber(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.round(parsed);
}

function toPositiveIntegerMm(value) {
  const parsed = toIntegerMm(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function toNonNegativeIntegerMm(value) {
  const parsed = toIntegerMm(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 280);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function bandMm(value) {
  const mm = toNonNegativeIntegerMm(value);
  if (mm === null) return "unresolved";
  if (mm === 0) return "0mm";
  if (mm <= 99) return "1-99mm";
  if (mm <= 499) return "100-499mm";
  if (mm <= 999) return "500-999mm";
  if (mm <= 1999) return "1000-1999mm";
  if (mm <= 3999) return "2000-3999mm";
  if (mm <= 7999) return "4000-7999mm";
  return "8000mm-plus";
}

function uniquePositiveLengths(values) {
  const source = Array.isArray(values) ? values : [];
  return [...new Set(source.map(toPositiveIntegerMm).filter((value) => Number.isInteger(value) && value > 0))]
    .sort((left, right) => right - left);
}

function normaliseMode(value, fallback = "none") {
  const mode = safeToken(value, fallback);
  if (mode === "cutback") return "cut-back";
  if (mode === "extend") return "extend-to-min-accessory-length";
  if (mode === "extend-to-min") return "extend-to-min-accessory-length";
  return mode || fallback;
}

function unsafeBlocker(value, depth = 0) {
  if (depth > 7) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "raw-engine-payload-input-not-approved" : null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeBlocker(entry, depth + 1);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_PRODUCT_KEY_PATTERN.test(key)) return "raw-product-row-input-not-approved";
    if (RAW_BOARD_KEY_PATTERN.test(key)) return "raw-board-row-input-not-approved";
    if (RAW_ACCESSORY_KEY_PATTERN.test(key)) return "raw-accessory-row-input-not-approved";
    if (RAW_ENGINE_KEY_PATTERN.test(key)) return "raw-engine-payload-input-not-approved";
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "raw-engine-payload-input-not-approved";
    }
    const blocker = unsafeBlocker(nested, depth + 1);
    if (blocker) return blocker;
  }
  return null;
}

function safetyBase(extra = {}) {
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    accessoryReservationReady: extra.accessoryReservationReady ?? false,
    originalRunLengthMm: extra.originalRunLengthMm ?? null,
    selectedTierOrProfile: extra.selectedTierOrProfile || null,
    productFamilyToken: extra.productFamilyToken || null,
    endPlateDeductionBand: extra.endPlateDeductionBand || null,
    bodyLengthBeforeReservationMm: extra.bodyLengthBeforeReservationMm ?? null,
    bodyLengthBeforeLengthAdjustmentMm: extra.bodyLengthBeforeLengthAdjustmentMm ?? null,
    lengthAdjustmentDeltaMm: extra.lengthAdjustmentDeltaMm ?? 0,
    effectiveLitLengthBand: extra.effectiveLitLengthBand || null,
    boardFillInputLengthMm: extra.boardFillInputLengthMm ?? null,
    reservationCount: extra.reservationCount ?? 0,
    reservationLengthBand: extra.reservationLengthBand || bandMm(0),
    reservationLengthMm: extra.reservationLengthMm ?? 0,
    accessoryPlacementIntentSummary: extra.accessoryPlacementIntentSummary || null,
    sealedReservedRangeSummary: extra.sealedReservedRangeSummary || null,
    sealedPhysicalBoardPlacementSummary: extra.sealedPhysicalBoardPlacementSummary || null,
    frozenPhysicalSegmentSummary: extra.frozenPhysicalSegmentSummary || null,
    physicalSegmentBridgeReady: extra.physicalSegmentBridgeReady ?? false,
    lengthAdjustmentMode: extra.lengthAdjustmentMode || "unresolved",
    boardFillInputReady: extra.boardFillInputReady ?? false,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    accessoryReservationFingerprint: extra.accessoryReservationFingerprint || null,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function resolveRunLength(source) {
  return toIntegerMm(firstPresent(source, ["runLengthMm", "run_length_mm", "runLength", "lengthMm", "length_mm"]));
}

function resolveSelectedTier(source) {
  return safeLabel(firstPresent(source, [
    "selectedTierOrProfile",
    "selectedTier",
    "selected_tier",
    "tier",
    "profile",
    "selectedProfile",
    "selected_profile",
  ]), "");
}

function resolveProductFamilyToken(source) {
  return safeToken(firstPresent(source, ["productFamilyToken", "productFamily", "familyToken", "family"]), "");
}

function resolveBoardLength(source) {
  const direct = toPositiveIntegerMm(firstPresent(source, ["boardLengthMm", "board_length_mm", "lengthMm", "nominalBoardLengthMm"]));
  if (direct) return direct;
  const summary = firstPresent(source, ["boardFamilyLengthsSummary", "boardFamilySummary", "boardSummary"]);
  if (!isPlainObject(summary)) return null;
  return toPositiveIntegerMm(firstPresent(summary, ["boardLengthMm", "board_length_mm", "nominalLengthMm", "nominal_length_mm"]));
}

function resolveBoardPitch(source) {
  const direct = toPositiveIntegerMm(firstPresent(source, ["boardPitchMm", "board_pitch_mm", "pitchMm", "pitch_mm"]));
  if (direct) return direct;
  const summary = firstPresent(source, ["boardFamilyLengthsSummary", "boardFamilySummary", "boardSummary"]);
  if (!isPlainObject(summary)) return null;
  return toPositiveIntegerMm(firstPresent(summary, ["boardPitchMm", "board_pitch_mm", "pitchMm", "pitch_mm"]));
}

function resolveBoardFamilyLengths(source, boardLengthMm) {
  const summary = firstPresent(source, ["boardFamilyLengthsSummary", "boardFamilySummary", "boardSummary"]);
  const supplied = isPlainObject(summary)
    ? uniquePositiveLengths(firstPresent(summary, [
      "boardFamilyLengthsSortedDesc",
      "boardLengthsMm",
      "board_lengths_mm",
      "lengthCandidatesMm",
      "length_candidates_mm",
    ]))
    : [];
  return supplied.length > 0 ? supplied : (boardLengthMm ? [boardLengthMm] : []);
}

function resolveEndPlatePolicy(source) {
  const summary = firstPresent(source, ["endPlatePolicySummary", "gapPolicySummary", "sealedEndPlatePolicySummary"]);
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "missing-end-plate-policy", diagnostic: "A sealed end plate/gap policy summary is required." };
  }

  const start = toNonNegativeIntegerMm(firstPresent(summary, [
    "startDeductionMm",
    "startGapMm",
    "start_gap_mm",
    "leftEndPlateMm",
    "startEndPlateMm",
  ]));
  const end = toNonNegativeIntegerMm(firstPresent(summary, [
    "endDeductionMm",
    "endGapMm",
    "end_gap_mm",
    "rightEndPlateMm",
    "finishEndPlateMm",
  ]));
  const total = toNonNegativeIntegerMm(firstPresent(summary, [
    "totalDeductionMm",
    "totalGapMm",
    "endPlateDeductionMm",
    "totalEndPlateMm",
  ]));

  if (total === null && (start === null || end === null)) {
    return { ok: false, blocker: "invalid-end-plate-policy", diagnostic: "End plate/gap policy must provide non-negative total deduction or start/end deductions." };
  }

  const startMm = start ?? 0;
  const endMm = end ?? 0;
  const totalMm = total ?? (startMm + endMm);
  if (totalMm < 0 || totalMm !== startMm + endMm && (start !== null || end !== null)) {
    return { ok: false, blocker: "invalid-end-plate-policy", diagnostic: "End plate/gap policy deductions are inconsistent." };
  }

  return {
    ok: true,
    startDeductionMm: startMm,
    endDeductionMm: endMm,
    totalDeductionMm: totalMm,
    mode: safeLabel(firstPresent(summary, ["mode", "gapMode", "policyMode"]), "sealed-deduction"),
    band: {
      startDeductionBand: bandMm(startMm),
      endDeductionBand: bandMm(endMm),
      totalDeductionBand: bandMm(totalMm),
    },
  };
}

function resolveAccessoryRequestsSummary(source) {
  if (!Object.prototype.hasOwnProperty.call(source, "accessoryRequestsSummary")) {
    return { ok: false, blocker: "missing-accessory-request", diagnostic: "A sealed accessory request summary is required; pass an empty summary when no accessory is requested." };
  }
  const supplied = source.accessoryRequestsSummary;
  if (Array.isArray(supplied)) return { ok: true, requests: supplied };
  if (!isPlainObject(supplied)) {
    return { ok: false, blocker: "unsafe-accessory-request-shape", diagnostic: "Accessory request summary must be a sealed object or array." };
  }
  const requests = firstPresent(supplied, ["requests", "accessoryRequests", "items", "entries"]);
  if (Array.isArray(requests)) return { ok: true, requests };
  const count = toNonNegativeIntegerMm(firstPresent(supplied, ["requestCount", "count", "accessoryRequestCount"]));
  if (count === 0) return { ok: true, requests: [] };
  return { ok: false, blocker: "unsafe-accessory-request-shape", diagnostic: "Accessory request summary does not contain a sealed request list or zero count." };
}

function normaliseAccessoryRequest(request, index) {
  if (!isPlainObject(request)) {
    return { ok: false, blocker: "unsafe-accessory-request-shape", diagnostic: `Accessory request ${index + 1} must be a sealed object.` };
  }
  const blocker = unsafeBlocker(request);
  if (blocker) {
    const mapped = blocker === "raw-accessory-row-input-not-approved" ? blocker : "unsafe-accessory-request-shape";
    return { ok: false, blocker: mapped, diagnostic: `Accessory request ${index + 1} contains unsafe raw or private input.` };
  }
  const type = safeToken(firstPresent(request, [
    "accessoryType",
    "requestType",
    "type",
    "kind",
    "intentType",
  ]), "");
  if (!type) {
    return { ok: false, blocker: "missing-accessory-request", diagnostic: `Accessory request ${index + 1} is missing a safe accessory type.` };
  }
  const quantity = toPositiveIntegerMm(firstPresent(request, ["quantity", "qty", "count", "requestCount"])) ?? 1;
  if (quantity <= 0) {
    return { ok: false, blocker: "unsafe-accessory-request-shape", diagnostic: `Accessory request ${index + 1} has an invalid quantity.` };
  }
  return {
    ok: true,
    request: {
      type,
      quantity,
      placementIntent: safeToken(firstPresent(request, ["placementIntent", "placement", "anchor", "location"]), "unspecified"),
      reservationModules: toPositiveIntegerMm(firstPresent(request, ["reservationModules", "moduleCount", "boardModules", "reserveBoardModules"])),
      reservationLengthMm: toPositiveIntegerMm(firstPresent(request, ["reservationLengthMm", "reservedLengthMm", "lengthMm"])),
    },
  };
}

function resolveAccessoryPolicy(source, hasRequests) {
  const summary = firstPresent(source, ["accessoryPolicySummary", "sealedAccessoryPolicySummary", "ancillaryPolicySummary"]);
  if (!isPlainObject(summary)) {
    if (hasRequests) {
      return { ok: false, blocker: "missing-accessory-policy", diagnostic: "A sealed accessory policy summary is required when accessory requests are present." };
    }
    return { ok: true, summary: {} };
  }
  const blocker = unsafeBlocker(summary);
  if (blocker) return { ok: false, blocker, diagnostic: "Accessory policy summary contains unsafe raw or private input." };
  return { ok: true, summary };
}

function buildSupportedTypeSet(policySummary) {
  const supplied = firstPresent(policySummary, ["supportedAccessoryTypes", "supportedTypes", "allowedAccessoryTypes", "allowedTypes"]);
  const types = Array.isArray(supplied)
    ? supplied.map((value) => safeToken(value, "")).filter(Boolean)
    : [];
  return new Set(types.length > 0 ? types : [...DEFAULT_SUPPORTED_ACCESSORY_TYPES]);
}

function policyForType(policySummary, type) {
  const byType = firstPresent(policySummary, ["byType", "types", "accessoryTypes", "policiesByType"]);
  if (isPlainObject(byType)) {
    const direct = byType[type] || byType[type.toUpperCase()] || byType[type.toLowerCase()];
    if (isPlainObject(direct)) return direct;
  }
  return policySummary;
}

function resolveReservationForRequest(request, policySummary, boardLengthMm) {
  const typePolicy = policyForType(policySummary, request.type);
  const reservationUnit = safeToken(firstPresent(typePolicy, ["reservationUnit", "unit", "reservationMode"]), "board-module");
  const modules = request.reservationModules
    ?? toPositiveIntegerMm(firstPresent(typePolicy, ["reservationModules", "moduleCount", "boardModules", "reserveBoardModules"]))
    ?? 1;
  const explicitLength = request.reservationLengthMm
    ?? toPositiveIntegerMm(firstPresent(typePolicy, ["reservationLengthMm", "reservedLengthMm", "lengthMm", "coverLengthMm"]));

  if (["board-module", "board", "module", "board-space"].includes(reservationUnit)) {
    return {
      ok: true,
      reservationUnit: "board-module",
      reservationModules: modules,
      reservationLengthMm: modules * boardLengthMm,
    };
  }
  if (["mm", "length-mm", "fixed-mm", "sealed-length", "sealed-length-mm"].includes(reservationUnit)) {
    if (!explicitLength) {
      return { ok: false, blocker: "missing-accessory-policy", diagnostic: `Accessory policy for ${request.type} must include a sealed reservation length.` };
    }
    return {
      ok: true,
      reservationUnit: "sealed-length-mm",
      reservationModules: null,
      reservationLengthMm: explicitLength,
    };
  }
  return { ok: false, blocker: "unsupported-accessory-type", diagnostic: `Accessory policy uses unsupported reservation unit ${reservationUnit}.` };
}

function buildPlacementIntentSummary(requests, reservationUnit, reservationCount, reservationLengthMm) {
  const requestedAccessoryTypeBuckets = {};
  const placementIntentBuckets = {};
  for (const request of requests) {
    requestedAccessoryTypeBuckets[request.type] = (requestedAccessoryTypeBuckets[request.type] || 0) + request.quantity;
    placementIntentBuckets[request.placementIntent] = (placementIntentBuckets[request.placementIntent] || 0) + request.quantity;
  }
  return {
    requestCount: requests.reduce((sum, request) => sum + request.quantity, 0),
    requestedAccessoryTypeBuckets,
    placementIntentBuckets,
    reservationUnit: reservationUnit || "none",
    reservationCount,
    reservationLengthBand: bandMm(reservationLengthMm),
    rawCoordinatesReturned: false,
    physicalPlacementReturned: false,
    rawAccessoryRowsReturned: false,
  };
}

function lengthCanBeBoardFilled(lengthMm, boardFamilyLengthsSortedDesc, boardPitchMm) {
  if (!Number.isInteger(lengthMm) || lengthMm <= 0) return false;
  if (!Number.isInteger(boardPitchMm) || boardPitchMm <= 0) return false;
  if (lengthMm % boardPitchMm !== 0) return false;
  const lengths = uniquePositiveLengths(boardFamilyLengthsSortedDesc);
  if (lengths.length === 0) return false;
  let remaining = lengthMm;
  for (const candidate of lengths) {
    while (remaining >= candidate) remaining -= candidate;
  }
  return remaining === 0;
}

function physicalSegmentBridgeRequired(source) {
  return source?.stage3BPhysicalSegmentBridgeRequired === true
    || source?.requireSealedPhysicalSegmentBridge === true
    || source?.physicalSegmentBridgeRequired === true;
}

function normalisePlacementIntent(value) {
  const intent = safeToken(value, "unspecified");
  if (["start", "begin", "beginning", "left"].includes(intent)) return "start";
  if (["end", "finish", "right"].includes(intent)) return "end";
  if (["mid", "middle", "center", "centre"].includes(intent)) return "mid";
  return intent || "unspecified";
}

function resolveAggregatePlacementIntent(requests) {
  const intents = [...new Set(requests.map((request) => normalisePlacementIntent(request.placementIntent)))];
  if (intents.length === 0) return { ok: true, placementIntent: "none" };
  const supported = new Set(["start", "end", "mid"]);
  if (intents.length !== 1) {
    return { ok: false, blocker: "stage3b-mixed-placement-intent-unsupported", diagnostic: "Stage 3B physical reservation coordinates require one sealed placement intent for the aggregate reserved range." };
  }
  if (!supported.has(intents[0])) {
    return { ok: false, blocker: "stage3b-placement-intent-unresolved", diagnostic: "Stage 3B physical reservation coordinates require start, end, or mid placement intent." };
  }
  return { ok: true, placementIntent: intents[0] };
}

function resolveSegmentPolicy(source) {
  const summary = firstPresent(source, ["sealedSegmentPolicySummary", "segmentPolicySummary", "physicalSegmentPolicySummary"]);
  const policy = isPlainObject(summary) ? summary : {};
  const segmentMaxLengthMm = toPositiveIntegerMm(firstPresent(policy, [
    "segmentMaxLengthMm",
    "segment_max_length_mm",
    "maxSegmentLengthMm",
  ])) ?? toPositiveIntegerMm(firstPresent(source, [
    "segmentMaxLengthMm",
    "segment_max_length_mm",
    "maxSegmentLengthMm",
  ]));
  const segmentMinAestheticLengthMm = toPositiveIntegerMm(firstPresent(policy, [
    "segmentMinAestheticLengthMm",
    "segment_min_aesthetic_length_mm",
    "minAestheticSegmentLengthMm",
  ])) ?? toPositiveIntegerMm(firstPresent(source, [
    "segmentMinAestheticLengthMm",
    "segment_min_aesthetic_length_mm",
    "minAestheticSegmentLengthMm",
  ])) ?? 0;
  return { segmentMaxLengthMm, segmentMinAestheticLengthMm };
}

function buildSealedReservedRangeSummary({
  normalisedRequests,
  bodyLengthBeforeReservationMm,
  reservationLengthMm,
  reservationCount,
  boardPitchMm,
}) {
  if (reservationLengthMm === 0) {
    return {
      ok: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      coordinateSpace: "body-after-source-backed-end-deductions-mm",
      bodyStartMm: 0,
      bodyEndMm: bodyLengthBeforeReservationMm,
      bodyLengthMm: bodyLengthBeforeReservationMm,
      rangeCount: 0,
      totalReservedLengthMm: 0,
      totalReservedLengthBand: bandMm(0),
      ranges: [],
      reservationGridAligned: true,
      rawReservationGridReturned: false,
      rawAccessoryRowsReturned: false,
    };
  }

  const placement = resolveAggregatePlacementIntent(normalisedRequests);
  if (!placement.ok) return placement;

  let startMm;
  if (placement.placementIntent === "start") startMm = 0;
  else if (placement.placementIntent === "end") startMm = bodyLengthBeforeReservationMm - reservationLengthMm;
  else if (placement.placementIntent === "mid") startMm = (bodyLengthBeforeReservationMm - reservationLengthMm) / 2;

  if (!Number.isInteger(startMm) || startMm < 0 || startMm + reservationLengthMm > bodyLengthBeforeReservationMm) {
    return { ok: false, blocker: "stage3b-reservation-coordinate-unavailable", diagnostic: "Stage 3B could not derive a safe aggregate reserved range in body coordinates." };
  }
  const endMm = startMm + reservationLengthMm;
  if (startMm % boardPitchMm !== 0 || endMm % boardPitchMm !== 0) {
    return { ok: false, blocker: "reservation-grid-unavailable", diagnostic: "Reserved range coordinates must align to the sealed board pitch grid." };
  }

  return {
    ok: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    coordinateSpace: "body-after-source-backed-end-deductions-mm",
    bodyStartMm: 0,
    bodyEndMm: bodyLengthBeforeReservationMm,
    bodyLengthMm: bodyLengthBeforeReservationMm,
    rangeCount: 1,
    totalReservedLengthMm: reservationLengthMm,
    totalReservedLengthBand: bandMm(reservationLengthMm),
    ranges: [{
      rangeIndex: 0,
      startMm,
      endMm,
      lengthMm: reservationLengthMm,
      lengthBand: bandMm(reservationLengthMm),
      placementIntent: placement.placementIntent,
      reservationCount,
      reason: "accessory-reservation",
      bodyCoordinateSpace: true,
      rawAccessoryRowsReturned: false,
    }],
    reservationGridAligned: true,
    rawReservationGridReturned: false,
    rawAccessoryRowsReturned: false,
  };
}

function buildUnreservedIntervals(bodyLengthBeforeReservationMm, ranges) {
  const intervals = [];
  let cursor = 0;
  for (const range of ranges) {
    if (range.startMm > cursor) intervals.push({ startMm: cursor, endMm: range.startMm, lengthMm: range.startMm - cursor });
    cursor = Math.max(cursor, range.endMm);
  }
  if (cursor < bodyLengthBeforeReservationMm) {
    intervals.push({ startMm: cursor, endMm: bodyLengthBeforeReservationMm, lengthMm: bodyLengthBeforeReservationMm - cursor });
  }
  return intervals.filter((interval) => interval.lengthMm > 0);
}

function boardRunForInterval(interval, boardFamilyLengthsSortedDesc, boardPitchMm, startIndex) {
  if (interval.lengthMm % boardPitchMm !== 0) {
    return { ok: false, blocker: "reservation-grid-unavailable", diagnostic: "Unreserved board-fill interval is not aligned to the sealed board pitch grid." };
  }
  const lengths = uniquePositiveLengths(boardFamilyLengthsSortedDesc);
  if (lengths.length === 0) return { ok: false, blocker: "missing-board-length", diagnostic: "Sealed board family lengths are required for physical placement." };
  const placements = [];
  let cursor = interval.startMm;
  let remaining = interval.lengthMm;
  let boardIndex = startIndex;
  while (remaining > 0) {
    const picked = lengths.find((candidate) => candidate <= remaining);
    if (!picked) {
      return { ok: false, blocker: "reserved-span-bisects-board", diagnostic: "Reserved range leaves an unreserved interval that cannot be filled without bisecting a board." };
    }
    placements.push({
      boardIndex,
      startMm: cursor,
      endMm: cursor + picked,
      lengthMm: picked,
      lengthBand: bandMm(picked),
      bodyCoordinateSpace: true,
      rawBoardRowsReturned: false,
    });
    boardIndex += 1;
    cursor += picked;
    remaining -= picked;
  }
  return { ok: true, placements, nextBoardIndex: boardIndex };
}

function buildSealedPhysicalBoardPlacementSummary({
  bodyLengthBeforeReservationMm,
  boardFillInputLengthMm,
  boardFamilyLengthsSortedDesc,
  boardPitchMm,
  sealedReservedRangeSummary,
}) {
  const ranges = Array.isArray(sealedReservedRangeSummary?.ranges) ? sealedReservedRangeSummary.ranges : [];
  const intervals = buildUnreservedIntervals(bodyLengthBeforeReservationMm, ranges);
  const intervalLengthTotal = intervals.reduce((sum, interval) => sum + interval.lengthMm, 0);
  if (intervalLengthTotal !== boardFillInputLengthMm) {
    return { ok: false, blocker: "stage3b-physical-placement-length-mismatch", diagnostic: "Sealed reserved ranges do not match the board-fill input length." };
  }

  const placements = [];
  let boardIndex = 0;
  for (const interval of intervals) {
    const run = boardRunForInterval(interval, boardFamilyLengthsSortedDesc, boardPitchMm, boardIndex);
    if (!run.ok) return run;
    placements.push(...run.placements);
    boardIndex = run.nextBoardIndex;
  }
  if (placements.length === 0) {
    return { ok: false, blocker: "board-fill-input-not-positive", diagnostic: "No sealed board placements could be derived." };
  }

  return {
    ok: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    coordinateSpace: "body-after-source-backed-end-deductions-mm",
    bodyLengthMm: bodyLengthBeforeReservationMm,
    boardFillInputLengthMm,
    boardPlacementCount: placements.length,
    intervals,
    placements,
    boardPitchMm,
    boardFamilyLengthsSortedDesc: [...boardFamilyLengthsSortedDesc],
    noBoardOverlapsReservedRange: true,
    reservationCannotBisectBoard: true,
    rawBoardRowsReturned: false,
    rawReservationGridReturned: false,
  };
}

function makeFrozenSegment(segmentIndex, startMm, endMm, boards, segmentMinAestheticLengthMm, segmentMaxLengthMm) {
  const segmentLengthMm = endMm - startMm;
  if (segmentLengthMm <= 0) return { ok: false, blocker: "stage3b-frozen-segment-invalid", diagnostic: "Frozen physical segment length must be positive." };
  if (segmentLengthMm > segmentMaxLengthMm) return { ok: false, blocker: "stage3b-segment-max-length-exceeded", diagnostic: "Frozen physical segment exceeds source-backed segment maximum length." };
  if (segmentMinAestheticLengthMm > 0 && segmentLengthMm < segmentMinAestheticLengthMm) {
    return { ok: false, blocker: "stage3b-segment-min-aesthetic-unmet", diagnostic: "Frozen physical segment is below source-backed minimum aesthetic length." };
  }
  return {
    ok: true,
    segment: {
      segmentIndex,
      segmentStartMm: startMm,
      segmentEndMm: endMm,
      segmentLengthMm,
      segmentLengthBand: bandMm(segmentLengthMm),
      boardCount: boards.length,
      boardIndices: boards.map((board) => board.boardIndex),
      activeLedLengthMm: boards.reduce((sum, board) => sum + board.lengthMm, 0),
      activeLedLengthBand: bandMm(boards.reduce((sum, board) => sum + board.lengthMm, 0)),
      rawBoardRowsReturned: false,
    },
  };
}

function buildFrozenPhysicalSegmentSummary({
  sealedPhysicalBoardPlacementSummary,
  sealedReservedRangeSummary,
  segmentMaxLengthMm,
  segmentMinAestheticLengthMm,
}) {
  if (!segmentMaxLengthMm) {
    return { ok: false, blocker: "missing-max-segment-length", diagnostic: "A positive source-backed segment maximum length is required for frozen physical segments." };
  }
  const placements = sealedPhysicalBoardPlacementSummary.placements;
  const segments = [];
  let currentStart = null;
  let currentEnd = null;
  let currentBoards = [];
  const flush = () => {
    if (!currentBoards.length) return { ok: true };
    const made = makeFrozenSegment(segments.length, currentStart, currentEnd, currentBoards, segmentMinAestheticLengthMm, segmentMaxLengthMm);
    if (!made.ok) return made;
    segments.push(made.segment);
    currentStart = null;
    currentEnd = null;
    currentBoards = [];
    return { ok: true };
  };

  for (const board of placements) {
    if (board.lengthMm > segmentMaxLengthMm) {
      return { ok: false, blocker: "board-swap-required-but-unsupported", diagnostic: "A sealed board placement is longer than the source-backed segment maximum length." };
    }
    if (currentBoards.length && board.startMm !== currentEnd) {
      const closed = flush();
      if (!closed.ok) return closed;
    }
    if (!currentBoards.length) {
      currentStart = board.startMm;
      currentEnd = board.startMm;
    }
    if (currentBoards.length && board.endMm - currentStart > segmentMaxLengthMm) {
      const closed = flush();
      if (!closed.ok) return closed;
      currentStart = board.startMm;
      currentEnd = board.startMm;
    }
    if (board.endMm - currentStart > segmentMaxLengthMm) {
      return { ok: false, blocker: "board-fill-cannot-satisfy-segment-pattern", diagnostic: "Sealed board placement cannot satisfy max segment policy." };
    }
    currentBoards.push(board);
    currentEnd = board.endMm;
  }
  const closed = flush();
  if (!closed.ok) return closed;
  if (segments.length === 0) return { ok: false, blocker: "stage3b-frozen-segment-unavailable", diagnostic: "Frozen physical segments could not be derived." };

  const joinPositionsMm = [];
  for (let index = 1; index < segments.length; index += 1) {
    joinPositionsMm.push(segments[index].segmentStartMm);
  }
  const ranges = Array.isArray(sealedReservedRangeSummary?.ranges) ? sealedReservedRangeSummary.ranges : [];
  const reservedRangesCrossFrozenSegmentJoin = ranges.some((range) => joinPositionsMm.some((joinMm) => range.startMm < joinMm && joinMm < range.endMm));
  const totalReservedLengthMm = ranges.reduce((sum, range) => sum + range.lengthMm, 0);

  return {
    ok: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    summaryType: "stage3b-sealed-frozen-physical-segment-summary",
    frozenFrom: "sealed-reserved-ranges-plus-segment-aware-board-placement",
    segmentCount: segments.length,
    joinCount: Math.max(0, segments.length - 1),
    segmentMaxLengthMm,
    segmentMinAestheticLengthMm,
    boardPlacementCount: placements.length,
    reservedRangeSummary: {
      rangeCount: ranges.length,
      totalReservedLengthMm,
      totalReservedLengthBand: bandMm(totalReservedLengthMm),
      reservedRangesCrossFrozenSegmentJoin,
      reservedRangesForceSegmentSplits: false,
      rawReservationGridReturned: false,
    },
    segments,
    joinPositionsMm,
    segmentBoundariesAtBoardEndsOnly: true,
    noBoardCrossesFrozenSegmentBoundary: true,
    rawBoardRowsReturned: false,
    rawReservationGridReturned: false,
  };
}

function buildStage3BPhysicalSegmentBridgeSummary({
  source,
  normalisedRequests,
  bodyLengthBeforeReservationMm,
  reservationLengthMm,
  reservationCount,
  boardFillInputLengthMm,
  boardFamilyLengthsSortedDesc,
  boardPitchMm,
}) {
  if (!physicalSegmentBridgeRequired(source)) {
    return { ok: true, required: false, physicalSegmentBridgeReady: false };
  }
  const segmentPolicy = resolveSegmentPolicy(source);
  const sealedReservedRangeSummary = buildSealedReservedRangeSummary({
    normalisedRequests,
    bodyLengthBeforeReservationMm,
    reservationLengthMm,
    reservationCount,
    boardPitchMm,
  });
  if (!sealedReservedRangeSummary.ok) return sealedReservedRangeSummary;

  const sealedPhysicalBoardPlacementSummary = buildSealedPhysicalBoardPlacementSummary({
    bodyLengthBeforeReservationMm,
    boardFillInputLengthMm,
    boardFamilyLengthsSortedDesc,
    boardPitchMm,
    sealedReservedRangeSummary,
  });
  if (!sealedPhysicalBoardPlacementSummary.ok) return sealedPhysicalBoardPlacementSummary;

  const frozenPhysicalSegmentSummary = buildFrozenPhysicalSegmentSummary({
    sealedPhysicalBoardPlacementSummary,
    sealedReservedRangeSummary,
    segmentMaxLengthMm: segmentPolicy.segmentMaxLengthMm,
    segmentMinAestheticLengthMm: segmentPolicy.segmentMinAestheticLengthMm,
  });
  if (!frozenPhysicalSegmentSummary.ok) return frozenPhysicalSegmentSummary;

  return {
    ok: true,
    required: true,
    physicalSegmentBridgeReady: true,
    sealedReservedRangeSummary,
    sealedPhysicalBoardPlacementSummary,
    frozenPhysicalSegmentSummary,
  };
}

function buildReservationFingerprint(payload) {
  return `safe-reservation:${stableSha1(payload)}`;
}

export function buildRuntimeAccessoryReservationFootholdSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const unsafe = unsafeBlocker(source);
  if (unsafe) return failClosed(unsafe, "Unsafe raw rows, donor payload, donor invocation, generation, or mutation authority was supplied.");

  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]));
  if (!policyFingerprint) {
    return failClosed("missing-policy-fingerprint", "A safe policy fingerprint is required before runtime accessory reservation diagnostics.");
  }
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!sourceFingerprint) {
    return failClosed("missing-source-fingerprint", "A safe source fingerprint is required before runtime accessory reservation diagnostics.", {
      policyFingerprint,
    });
  }

  const selectedTierOrProfile = resolveSelectedTier(source);
  const productFamilyToken = resolveProductFamilyToken(source);
  const originalRunLengthMm = resolveRunLength(source);
  if (!Number.isInteger(originalRunLengthMm)) {
    return failClosed("missing-run-length", "A controlled run length is required before runtime accessory reservation diagnostics.", {
      selectedTierOrProfile,
      productFamilyToken,
      policyFingerprint,
      sourceFingerprint,
    });
  }
  if (originalRunLengthMm <= 0) {
    return failClosed("invalid-run-length", "Controlled run length must be a positive integer millimetre value.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const endPlatePolicy = resolveEndPlatePolicy(source);
  if (!endPlatePolicy.ok) {
    return failClosed(endPlatePolicy.blocker, endPlatePolicy.diagnostic, {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const bodyLengthBeforeLengthAdjustmentMm = originalRunLengthMm - endPlatePolicy.totalDeductionMm;
  if (bodyLengthBeforeLengthAdjustmentMm <= 0) {
    return failClosed("invalid-end-plate-policy", "End plate/gap deduction leaves no positive body length.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const boardLengthMm = resolveBoardLength(source);
  if (!boardLengthMm) {
    return failClosed("missing-board-length", "A sealed board length summary is required before accessory reservation diagnostics.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }
  const boardPitchMm = resolveBoardPitch(source);
  if (!boardPitchMm) {
    return failClosed("missing-board-pitch", "A sealed board pitch summary is required before accessory reservation diagnostics.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const requestSummary = resolveAccessoryRequestsSummary(source);
  if (!requestSummary.ok) {
    return failClosed(requestSummary.blocker, requestSummary.diagnostic, {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const normalisedRequests = [];
  for (let index = 0; index < requestSummary.requests.length; index += 1) {
    const normalised = normaliseAccessoryRequest(requestSummary.requests[index], index);
    if (!normalised.ok) {
      return failClosed(normalised.blocker, normalised.diagnostic, {
        originalRunLengthMm,
        selectedTierOrProfile,
        productFamilyToken,
        endPlateDeductionBand: endPlatePolicy.band,
        bodyLengthBeforeLengthAdjustmentMm,
        policyFingerprint,
        sourceFingerprint,
      });
    }
    normalisedRequests.push(normalised.request);
  }

  const accessoryPolicy = resolveAccessoryPolicy(source, normalisedRequests.length > 0);
  if (!accessoryPolicy.ok) {
    return failClosed(accessoryPolicy.blocker, accessoryPolicy.diagnostic, {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const policyOwnFingerprint = safeFingerprint(firstPresent(accessoryPolicy.summary, ["policyFingerprint", "safePolicyFingerprint"]));
  const requestOwnFingerprint = safeFingerprint(firstPresent(source.accessoryRequestsSummary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if ((policyOwnFingerprint && policyOwnFingerprint !== policyFingerprint)
    || (requestOwnFingerprint && requestOwnFingerprint !== sourceFingerprint)) {
    return failClosed("fingerprint-mismatch", "Sealed accessory policy/request fingerprints do not match the supplied runtime fingerprints.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const lengthAdjustmentModeRequested = normaliseMode(firstPresent(source, [
    "lengthAdjustmentPreference",
    "lengthAdjustmentMode",
    "accessoryLengthAdjustmentMode",
  ]), normalisedRequests.length > 0 ? "cut-back" : "none");
  if (!LENGTH_ADJUSTMENT_MODES.has(lengthAdjustmentModeRequested)) {
    return failClosed("unsupported-length-adjustment-mode", "Unsupported length adjustment preference for runtime accessory reservation diagnostics.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }
  if (lengthAdjustmentModeRequested === "unresolved") {
    return failClosed("length-adjustment-unresolved", "Length adjustment mode is unresolved for the sealed accessory request summary.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const supportedTypes = buildSupportedTypeSet(accessoryPolicy.summary);
  let reservationLengthMm = 0;
  let reservationCount = 0;
  let reservationUnit = normalisedRequests.length > 0 ? "board-module" : "none";
  for (const request of normalisedRequests) {
    if (!supportedTypes.has(request.type)) {
      return failClosed("unsupported-accessory-type", `Accessory type ${request.type} is not supported by the sealed accessory policy summary.`, {
        originalRunLengthMm,
        selectedTierOrProfile,
        productFamilyToken,
        endPlateDeductionBand: endPlatePolicy.band,
        bodyLengthBeforeLengthAdjustmentMm,
        policyFingerprint,
        sourceFingerprint,
      });
    }
    const reservation = resolveReservationForRequest(request, accessoryPolicy.summary, boardLengthMm);
    if (!reservation.ok) {
      return failClosed(reservation.blocker, reservation.diagnostic, {
        originalRunLengthMm,
        selectedTierOrProfile,
        productFamilyToken,
        endPlateDeductionBand: endPlatePolicy.band,
        bodyLengthBeforeLengthAdjustmentMm,
        policyFingerprint,
        sourceFingerprint,
      });
    }
    reservationUnit = reservation.reservationUnit;
    const requestReservationLengthMm = reservation.reservationLengthMm * request.quantity;
    const requestReservationCount = (reservation.reservationModules ?? 1) * request.quantity;
    if (requestReservationLengthMm % boardPitchMm !== 0) {
      return failClosed("reservation-grid-unavailable", "Accessory reservation length is not aligned to the sealed board pitch grid.", {
        originalRunLengthMm,
        selectedTierOrProfile,
        productFamilyToken,
        endPlateDeductionBand: endPlatePolicy.band,
        bodyLengthBeforeLengthAdjustmentMm,
        policyFingerprint,
        sourceFingerprint,
      });
    }
    if (reservation.reservationUnit === "sealed-length-mm" && requestReservationLengthMm % boardLengthMm !== 0) {
      return failClosed("reserved-span-bisects-board", "Accessory reservation span would bisect the sealed board module length.", {
        originalRunLengthMm,
        selectedTierOrProfile,
        productFamilyToken,
        endPlateDeductionBand: endPlatePolicy.band,
        bodyLengthBeforeLengthAdjustmentMm,
        policyFingerprint,
        sourceFingerprint,
      });
    }
    reservationLengthMm += requestReservationLengthMm;
    reservationCount += requestReservationCount;
  }

  const minAccessoryBodyLengthMm = toPositiveIntegerMm(firstPresent(accessoryPolicy.summary, [
    "minAccessoryBodyLengthMm",
    "minimumAccessoryBodyLengthMm",
    "minBodyLengthMm",
    "minRunBodyLengthMm",
  ]));
  let bodyLengthBeforeReservationMm = bodyLengthBeforeLengthAdjustmentMm;
  let lengthAdjustmentDeltaMm = 0;
  let lengthAdjustmentMode = normalisedRequests.length > 0 ? lengthAdjustmentModeRequested : "none";
  if (normalisedRequests.length === 0) lengthAdjustmentMode = "none";

  if (normalisedRequests.length > 0 && minAccessoryBodyLengthMm && bodyLengthBeforeReservationMm < minAccessoryBodyLengthMm) {
    if (lengthAdjustmentModeRequested === "extend-to-min-accessory-length") {
      lengthAdjustmentDeltaMm = minAccessoryBodyLengthMm - bodyLengthBeforeReservationMm;
      bodyLengthBeforeReservationMm = minAccessoryBodyLengthMm;
      lengthAdjustmentMode = "extend-to-min-accessory-length";
    } else {
      return failClosed("accessory-min-length-unmet", "Accessory reservation minimum body length is unmet and extension was not approved by the sealed preference.", {
        originalRunLengthMm,
        selectedTierOrProfile,
        productFamilyToken,
        endPlateDeductionBand: endPlatePolicy.band,
        bodyLengthBeforeLengthAdjustmentMm,
        policyFingerprint,
        sourceFingerprint,
      });
    }
  }

  if (reservationLengthMm > bodyLengthBeforeReservationMm) {
    return failClosed("reservation-exceeds-body-length", "Accessory reservation exceeds the available sealed body length before board fill.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      bodyLengthBeforeReservationMm,
      reservationCount,
      reservationLengthMm,
      reservationLengthBand: bandMm(reservationLengthMm),
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const boardFillInputLengthMm = bodyLengthBeforeReservationMm - reservationLengthMm;
  if (boardFillInputLengthMm <= 0) {
    return failClosed("board-fill-input-not-positive", "Accessory reservation leaves no positive board-fill input length.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      bodyLengthBeforeReservationMm,
      reservationCount,
      reservationLengthMm,
      reservationLengthBand: bandMm(reservationLengthMm),
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const boardFamilyLengthsSortedDesc = resolveBoardFamilyLengths(source, boardLengthMm);
  if (!lengthCanBeBoardFilled(boardFillInputLengthMm, boardFamilyLengthsSortedDesc, boardPitchMm)) {
    return failClosed("no-valid-board-reservation", "Effective board-fill input length cannot be represented by the sealed board family length/pitch summary.", {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      bodyLengthBeforeReservationMm,
      reservationCount,
      reservationLengthMm,
      reservationLengthBand: bandMm(reservationLengthMm),
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const physicalSegmentBridgeSummary = buildStage3BPhysicalSegmentBridgeSummary({
    source,
    normalisedRequests,
    bodyLengthBeforeReservationMm,
    reservationLengthMm,
    reservationCount,
    boardFillInputLengthMm,
    boardFamilyLengthsSortedDesc,
    boardPitchMm,
  });
  if (physicalSegmentBridgeSummary.ok !== true) {
    return failClosed(physicalSegmentBridgeSummary.blocker, physicalSegmentBridgeSummary.diagnostic, {
      originalRunLengthMm,
      selectedTierOrProfile,
      productFamilyToken,
      endPlateDeductionBand: endPlatePolicy.band,
      bodyLengthBeforeLengthAdjustmentMm,
      bodyLengthBeforeReservationMm,
      reservationCount,
      reservationLengthMm,
      reservationLengthBand: bandMm(reservationLengthMm),
      boardFillInputLengthMm,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const accessoryPlacementIntentSummary = buildPlacementIntentSummary(
    normalisedRequests,
    reservationUnit,
    reservationCount,
    reservationLengthMm,
  );
  const reservationFingerprintPayload = {
    schemaId: ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_ACCESSORY_RESERVATION_FOOTHOLD_SCHEMA_VERSION,
    originalRunLengthMm,
    selectedTierOrProfile,
    productFamilyToken,
    endPlateDeductionBand: endPlatePolicy.band,
    bodyLengthBeforeLengthAdjustmentMm,
    bodyLengthBeforeReservationMm,
    lengthAdjustmentMode,
    lengthAdjustmentDeltaMm,
    boardLengthMm,
    boardPitchMm,
    boardFamilyLengthsSortedDesc,
    reservationCount,
    reservationLengthMm,
    accessoryPlacementIntentSummary,
    boardFillInputLengthMm,
    physicalSegmentBridgeRequired: physicalSegmentBridgeSummary.required === true,
    sealedReservedRangeSummary: physicalSegmentBridgeSummary.sealedReservedRangeSummary || null,
    sealedPhysicalBoardPlacementSummary: physicalSegmentBridgeSummary.sealedPhysicalBoardPlacementSummary || null,
    frozenPhysicalSegmentSummary: physicalSegmentBridgeSummary.frozenPhysicalSegmentSummary || null,
    policyFingerprint,
    sourceFingerprint,
  };
  const accessoryReservationFingerprint = buildReservationFingerprint(reservationFingerprintPayload);
  const warnings = [];
  if (normalisedRequests.length === 0) {
    warnings.push("No sealed accessory requests were supplied; reservation foothold passed through the end-plate adjusted body length.");
  }

  return safetyBase({
    ok: true,
    accessoryReservationReady: true,
    originalRunLengthMm,
    selectedTierOrProfile,
    productFamilyToken,
    endPlateDeductionBand: endPlatePolicy.band,
    bodyLengthBeforeLengthAdjustmentMm,
    bodyLengthBeforeReservationMm,
    lengthAdjustmentDeltaMm,
    effectiveLitLengthBand: bandMm(boardFillInputLengthMm),
    boardFillInputLengthMm,
    reservationCount,
    reservationLengthBand: bandMm(reservationLengthMm),
    reservationLengthMm,
    accessoryPlacementIntentSummary,
    sealedReservedRangeSummary: physicalSegmentBridgeSummary.sealedReservedRangeSummary || null,
    sealedPhysicalBoardPlacementSummary: physicalSegmentBridgeSummary.sealedPhysicalBoardPlacementSummary || null,
    frozenPhysicalSegmentSummary: physicalSegmentBridgeSummary.frozenPhysicalSegmentSummary || null,
    physicalSegmentBridgeReady: physicalSegmentBridgeSummary.physicalSegmentBridgeReady === true,
    lengthAdjustmentMode,
    boardFillInputReady: true,
    warnings,
    failClosedDiagnostics: [],
    policyFingerprint,
    sourceFingerprint,
    accessoryReservationFingerprint,
  });
}

export const buildRuntimeNativeAccessoryReservationSummary = buildRuntimeAccessoryReservationFootholdSummary;
export const buildEngineRunTableRuntimeAccessoryReservationFootholdKernelStatus = buildRuntimeAccessoryReservationFootholdSummary;
