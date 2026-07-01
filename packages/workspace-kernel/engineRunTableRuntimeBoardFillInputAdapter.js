import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.board-fill-input-summary";
export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_STATE =
  "runtime_board_fill_input_adapter_diagnostic_only";

export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SAFETY_FLAGS = Object.freeze({
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
  fullBoardFillResequenceEnabled: false,
  segmentAwareBoardFillEnabled: false,
  zoneValidationEnabled: false,
  physicalAccessoryPlacementEnabled: false,
  emergencyZonePickerEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawRowsReturned: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawReservationGridReturned: false,
  rawEnginePayloadReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe(?:-[0-9A-Za-z_.:-]{4,280}|:[0-9A-Za-z_.:-]{4,280})$/;
const SAFE_TOKEN_PATTERN = /^[0-9A-Za-z_.:-]{1,120}$/;
const RAW_PRODUCT_KEY_PATTERN = /^(?:PRODUCTS?|rawProducts?|rawProductRows|productRows|productsTable|productTable|sourceProductRows)$/i;
const RAW_BOARD_KEY_PATTERN = /^(?:BOARDS?|rawBoards?|rawBoardRows|boardRows|boardsTable|boardTable|sourceBoardRows)$/i;
const RAW_ACCESSORY_KEY_PATTERN = /^(?:ACCESSORIES|rawAccessories|rawAccessoryRows|accessoryRows|accessoriesTable|accessoryTable|sourceAccessoryRows|accessoryCatalogRows)$/i;
const RAW_RESERVATION_GRID_KEY_PATTERN = /^(?:rawReservationGrid|reservationGrid|reservedGrid|rawReservedGrid|reservationCells|rawReservationCells|physicalReservationGrid)$/i;
const RAW_ENGINE_KEY_PATTERN = /^(?:enginePayload|rawEnginePayload|runEnginePayload|selectorPayload|donorPayload|rawDonorPayload|roughElectricalPayload)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|donorPath|runtimeDataPath|path)$/i;
const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^donorEngineInvoked$/i, "donor-engine-invocation-not-approved"],
  [/^runtimeDataMutated$/i, "runtime-data-mutation-not-approved"],
  [/^runtimeDataMutationAuthority$/i, "runtime-data-mutation-not-approved"],
  [/^runTableGenerated$/i, "runtable-generation-not-approved"],
  [/^runtableGenerated$/i, "runtable-generation-not-approved"],
  [/^iesGenerated$/i, "ies-generation-not-approved"],
  [/^rawReservationGridReturned$/i, "raw-reservation-grid-input-not-approved"],
  [/^rawEnginePayloadReturned$/i, "raw-engine-payload-input-not-approved"],
  [/^selectedResultPersisted$/i, "selected-result-persistence-not-approved"],
  [/^routesAdded$/i, "routes-added-not-approved"],
  [/^postEndpointsAdded$/i, "post-endpoints-added-not-approved"],
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

function toNonNegativeIntegerMm(value) {
  const parsed = toIntegerMm(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 300);
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

function unsafeBlocker(value, depth = 0) {
  if (depth > 7) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "unsafe-accessory-reservation-summary" : null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeBlocker(entry, depth + 1);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_PRODUCT_KEY_PATTERN.test(key)) return "unsafe-accessory-reservation-summary";
    if (RAW_BOARD_KEY_PATTERN.test(key)) return "unsafe-accessory-reservation-summary";
    if (RAW_ACCESSORY_KEY_PATTERN.test(key)) return "unsafe-accessory-reservation-summary";
    if (RAW_RESERVATION_GRID_KEY_PATTERN.test(key)) return "raw-reservation-grid-input-not-approved";
    if (RAW_ENGINE_KEY_PATTERN.test(key)) return "raw-engine-payload-input-not-approved";
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "unsafe-accessory-reservation-summary";
    }
    const blocker = unsafeBlocker(nested, depth + 1);
    if (blocker) return blocker;
  }
  return null;
}

function reservationStatus(reservationCount, reservationLengthMm) {
  if (reservationCount > 0 || reservationLengthMm > 0) return "reserved";
  return "none";
}

function buildBoardFillInputFingerprint(payload) {
  return `safe-board-fill-input:${stableSha1(payload)}`;
}

function safetyBase(extra = {}) {
  const reservationCount = extra.reservationCount ?? 0;
  const reservationLengthMm = extra.reservationLengthMm ?? null;

  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    originalRunLengthMm: extra.originalRunLengthMm ?? null,
    bodyLengthBeforeReservationMm: extra.bodyLengthBeforeReservationMm ?? null,
    effectiveBoardFillLengthMm: extra.effectiveBoardFillLengthMm ?? null,
    effectiveBoardFillLengthBand: extra.effectiveBoardFillLengthBand || bandMm(extra.effectiveBoardFillLengthMm),
    reservationStatus: extra.reservationStatus || reservationStatus(reservationCount, reservationLengthMm),
    reservationCount,
    reservationLengthBand: extra.reservationLengthBand || bandMm(reservationLengthMm ?? 0),
    accessoryReservationFingerprint: extra.accessoryReservationFingerprint || null,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    boardFillInputFingerprint: extra.boardFillInputFingerprint || null,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    rawRowsReturned: false,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawReservationGridReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    donorMutated: false,
    boardDataMakerImported: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    reservationStatus: "blocked",
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function resolveInputSummary(source) {
  const summary = firstPresent(source, ["accessoryReservationSummary", "runtimeAccessoryReservationSummary"]);
  return isPlainObject(summary) ? summary : null;
}

function resolveSelectedTierOrProfile(source, summary) {
  return safeLabel(firstPresent(source, [
    "selectedTierOrProfile",
    "selectedTier",
    "tier",
    "profile",
  ]) ?? firstPresent(summary, [
    "selectedTierOrProfile",
    "selectedTier",
    "tier",
    "profile",
  ]), "");
}

function resolveBoardFamilyToken(source, summary) {
  return safeToken(firstPresent(source, [
    "boardFamilyToken",
    "selectedBoardFamilyToken",
    "boardFamily",
    "familyToken",
  ]) ?? firstPresent(summary, [
    "boardFamilyToken",
    "productFamilyToken",
    "selectedBoardFamilyToken",
    "boardFamily",
    "familyToken",
  ]), "");
}

export function buildRuntimeBoardFillInputSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const topLevelUnsafe = unsafeBlocker({ ...source, accessoryReservationSummary: undefined });
  if (topLevelUnsafe) {
    return failClosed(topLevelUnsafe, "Unsafe raw rows, raw reservation grid, donor payload, donor invocation, generation, or mutation authority was supplied.");
  }

  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]));
  if (!policyFingerprint) {
    return failClosed("missing-policy-fingerprint", "A safe policy fingerprint is required before board-fill input adaptation.");
  }
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!sourceFingerprint) {
    return failClosed("missing-source-fingerprint", "A safe source fingerprint is required before board-fill input adaptation.", {
      policyFingerprint,
    });
  }

  const accessoryReservationSummary = resolveInputSummary(source);
  if (!accessoryReservationSummary) {
    return failClosed("missing-accessory-reservation-summary", "A sealed accessory reservation summary is required before board-fill input adaptation.", {
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const summaryUnsafe = unsafeBlocker(accessoryReservationSummary);
  if (summaryUnsafe) {
    return failClosed(summaryUnsafe, "Accessory reservation summary contains unsafe raw input, generation, invocation, or mutation signals.", {
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const summaryPolicyFingerprint = safeFingerprint(firstPresent(accessoryReservationSummary, ["policyFingerprint", "safePolicyFingerprint"]));
  const summarySourceFingerprint = safeFingerprint(firstPresent(accessoryReservationSummary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if ((summaryPolicyFingerprint && summaryPolicyFingerprint !== policyFingerprint)
    || (summarySourceFingerprint && summarySourceFingerprint !== sourceFingerprint)) {
    return failClosed("fingerprint-mismatch", "Supplied policy/source fingerprints do not match the sealed accessory reservation summary.", {
      policyFingerprint,
      sourceFingerprint,
      accessoryReservationFingerprint: safeFingerprint(accessoryReservationSummary.accessoryReservationFingerprint),
    });
  }

  const accessoryReservationFingerprint = safeFingerprint(firstPresent(accessoryReservationSummary, [
    "accessoryReservationFingerprint",
    "reservationFingerprint",
  ]));

  if (accessoryReservationSummary.ok !== true
    || accessoryReservationSummary.accessoryReservationReady !== true
    || accessoryReservationSummary.boardFillInputReady !== true) {
    return failClosed("accessory-reservation-not-ready", "Accessory reservation summary is not ready to become a board-fill input summary.", {
      originalRunLengthMm: toIntegerMm(accessoryReservationSummary.originalRunLengthMm),
      bodyLengthBeforeReservationMm: toIntegerMm(accessoryReservationSummary.bodyLengthBeforeReservationMm),
      reservationCount: toNonNegativeIntegerMm(accessoryReservationSummary.reservationCount) ?? 0,
      reservationLengthBand: safeLabel(accessoryReservationSummary.reservationLengthBand, bandMm(accessoryReservationSummary.reservationLengthMm ?? 0)),
      accessoryReservationFingerprint,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  if (!accessoryReservationFingerprint) {
    return failClosed("unsafe-accessory-reservation-summary", "Accessory reservation summary is missing a safe reservation fingerprint.", {
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const effectiveBoardFillLengthSource = firstPresent(accessoryReservationSummary, [
    "effectiveBoardFillLengthMm",
    "boardFillInputLengthMm",
    "boardFillInputMm",
  ]);
  if (isBlank(effectiveBoardFillLengthSource)) {
    return failClosed("missing-effective-board-fill-length", "Accessory reservation summary did not provide a sealed effective board-fill length.", {
      originalRunLengthMm: toIntegerMm(accessoryReservationSummary.originalRunLengthMm),
      bodyLengthBeforeReservationMm: toIntegerMm(accessoryReservationSummary.bodyLengthBeforeReservationMm),
      reservationCount: toNonNegativeIntegerMm(accessoryReservationSummary.reservationCount) ?? 0,
      reservationLengthBand: safeLabel(accessoryReservationSummary.reservationLengthBand, bandMm(accessoryReservationSummary.reservationLengthMm ?? 0)),
      accessoryReservationFingerprint,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const effectiveBoardFillLengthMm = toIntegerMm(effectiveBoardFillLengthSource);
  if (!Number.isInteger(effectiveBoardFillLengthMm)) {
    return failClosed("invalid-effective-board-fill-length", "Effective board-fill length must be an integer millimetre value.", {
      originalRunLengthMm: toIntegerMm(accessoryReservationSummary.originalRunLengthMm),
      bodyLengthBeforeReservationMm: toIntegerMm(accessoryReservationSummary.bodyLengthBeforeReservationMm),
      reservationCount: toNonNegativeIntegerMm(accessoryReservationSummary.reservationCount) ?? 0,
      reservationLengthBand: safeLabel(accessoryReservationSummary.reservationLengthBand, bandMm(accessoryReservationSummary.reservationLengthMm ?? 0)),
      accessoryReservationFingerprint,
      policyFingerprint,
      sourceFingerprint,
    });
  }
  if (effectiveBoardFillLengthMm <= 0) {
    return failClosed("board-fill-input-not-positive", "Accessory reservation leaves no positive board-fill input length.", {
      originalRunLengthMm: toIntegerMm(accessoryReservationSummary.originalRunLengthMm),
      bodyLengthBeforeReservationMm: toIntegerMm(accessoryReservationSummary.bodyLengthBeforeReservationMm),
      effectiveBoardFillLengthMm,
      reservationCount: toNonNegativeIntegerMm(accessoryReservationSummary.reservationCount) ?? 0,
      reservationLengthBand: safeLabel(accessoryReservationSummary.reservationLengthBand, bandMm(accessoryReservationSummary.reservationLengthMm ?? 0)),
      accessoryReservationFingerprint,
      policyFingerprint,
      sourceFingerprint,
    });
  }

  const originalRunLengthMm = toIntegerMm(accessoryReservationSummary.originalRunLengthMm);
  const bodyLengthBeforeReservationMm = toIntegerMm(accessoryReservationSummary.bodyLengthBeforeReservationMm);
  const reservationCount = toNonNegativeIntegerMm(accessoryReservationSummary.reservationCount) ?? 0;
  const reservationLengthMm = toNonNegativeIntegerMm(accessoryReservationSummary.reservationLengthMm) ?? null;
  const reservationLengthBand = safeLabel(
    accessoryReservationSummary.reservationLengthBand,
    bandMm(reservationLengthMm ?? 0),
  );
  const selectedTierOrProfile = resolveSelectedTierOrProfile(source, accessoryReservationSummary);
  const boardFamilyToken = resolveBoardFamilyToken(source, accessoryReservationSummary);
  const warnings = [];
  if (reservationCount === 0) {
    warnings.push("No accessory reservation was applied; effective board-fill length matches the sealed body length before reservation when no other reservation length was present.");
  }

  const boardFillInputFingerprint = buildBoardFillInputFingerprint({
    schemaId: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_INPUT_ADAPTER_SCHEMA_VERSION,
    originalRunLengthMm,
    bodyLengthBeforeReservationMm,
    effectiveBoardFillLengthMm,
    effectiveBoardFillLengthBand: bandMm(effectiveBoardFillLengthMm),
    reservationCount,
    reservationLengthBand,
    reservationLengthMm,
    accessoryReservationFingerprint,
    policyFingerprint,
    sourceFingerprint,
    selectedTierOrProfile,
    boardFamilyToken,
  });

  return safetyBase({
    ok: true,
    originalRunLengthMm,
    bodyLengthBeforeReservationMm,
    effectiveBoardFillLengthMm,
    effectiveBoardFillLengthBand: bandMm(effectiveBoardFillLengthMm),
    reservationStatus: reservationStatus(reservationCount, reservationLengthMm ?? 0),
    reservationCount,
    reservationLengthBand,
    accessoryReservationFingerprint,
    policyFingerprint,
    sourceFingerprint,
    boardFillInputFingerprint,
    warnings,
    failClosedDiagnostics: [],
  });
}

export const buildRuntimeNativeBoardFillInputSummary = buildRuntimeBoardFillInputSummary;
export const buildEngineRunTableRuntimeBoardFillInputAdapterStatus = buildRuntimeBoardFillInputSummary;
