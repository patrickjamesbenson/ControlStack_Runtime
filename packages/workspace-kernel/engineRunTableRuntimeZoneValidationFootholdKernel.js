import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.zone-validation-foothold-summary";
export const ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_STATE =
  "runtime_zone_validation_foothold_diagnostic_only";

export const ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  sealedSegmentZoneBridgeRequired: true,
  noCrossValidationOnly: true,
  crossJoinValidationEnabled: false,
  compareJoinModeValidationEnabled: false,
  fullDonorZoneSolverEnabled: false,
  segmentSplitEnrichmentEnabled: false,
  mechanicalDetailingEnabled: false,
  frozenZoneDriverReselectionEnabled: false,
  gateDValidationEnabled: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  donorEngineInvoked: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawDriverRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawReservationGridReturned: false,
  rawEnginePayloadReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,360}$/;
const RAW_PRODUCT_KEY_PATTERN = /^(?:PRODUCTS?|rawProducts?|rawProductRows|productRows|productsTable|productTable|sourceProductRows)$/i;
const RAW_BOARD_KEY_PATTERN = /^(?:BOARDS?|rawBoards?|rawBoardRows|boardRows|boardsTable|boardTable|sourceBoardRows)$/i;
const RAW_DRIVER_KEY_PATTERN = /^(?:DRIVERS?|rawDrivers?|rawDriverRows|driverRows|driversTable|driverTable|sourceDriverRows)$/i;
const RAW_ACCESSORY_KEY_PATTERN = /^(?:ACCESSORIES|rawAccessories|rawAccessoryRows|accessoryRows|accessoriesTable|accessoryTable|sourceAccessoryRows|accessoryCatalogRows)$/i;
const RAW_RESERVATION_GRID_KEY_PATTERN = /^(?:rawReservationGrid|reservationGrid|reservedGrid|rawReservedGrid|reservationCells|rawReservationCells|physicalReservationGrid)$/i;
const RAW_ENGINE_KEY_PATTERN = /^(?:enginePayload|rawEnginePayload|runEnginePayload|selectorPayload|donorPayload|rawDonorPayload|roughElectricalPayload)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|donorPath|runtimeDataPath|path)$/i;
const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^donorEngineInvoked$/i, "donor-engine-invocation-not-approved"],
  [/^runtimeDataMutated$/i, "runtime-data-mutation-not-approved"],
  [/^runtimeDataMutationAuthority$/i, "runtime-data-mutation-not-approved"],
  [/^selectedResultPersisted$/i, "selected-result-persistence-not-approved"],
  [/^runTableGenerated$/i, "runtable-generation-not-approved"],
  [/^runtableGenerated$/i, "runtable-generation-not-approved"],
  [/^iesGenerated$/i, "ies-generation-not-approved"],
  [/^routesAdded$/i, "routes-added-not-approved"],
  [/^publicRoutesAdded$/i, "routes-added-not-approved"],
  [/^postEndpointsAdded$/i, "post-endpoints-added-not-approved"],
  [/^rawProductRowsReturned$/i, "raw-product-row-input-not-approved"],
  [/^rawBoardRowsReturned$/i, "raw-board-row-input-not-approved"],
  [/^rawDriverRowsReturned$/i, "raw-driver-row-input-not-approved"],
  [/^rawAccessoryRowsReturned$/i, "raw-accessory-row-input-not-approved"],
  [/^rawReservationGridReturned$/i, "raw-reservation-grid-input-not-approved"],
  [/^rawEnginePayloadReturned$/i, "raw-engine-payload-input-not-approved"],
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
  return cleaned ? cleaned.slice(0, 120) : fallback;
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

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 380);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function unsafeInputBlocker(value, depth = 0) {
  if (depth > 8) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "unsafe-private-path-input" : null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeInputBlocker(entry, depth + 1);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_PRODUCT_KEY_PATTERN.test(key)) return "raw-product-row-input-not-approved";
    if (RAW_BOARD_KEY_PATTERN.test(key)) return "raw-board-row-input-not-approved";
    if (RAW_DRIVER_KEY_PATTERN.test(key)) return "raw-driver-row-input-not-approved";
    if (RAW_ACCESSORY_KEY_PATTERN.test(key)) return "raw-accessory-row-input-not-approved";
    if (RAW_RESERVATION_GRID_KEY_PATTERN.test(key)) return "raw-reservation-grid-input-not-approved";
    if (RAW_ENGINE_KEY_PATTERN.test(key)) return "raw-engine-payload-input-not-approved";
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "unsafe-private-path-input";
    }
    const blocker = unsafeInputBlocker(nested, depth + 1);
    if (blocker) return blocker;
  }
  return null;
}

function topLevelUnsafeBlocker(source) {
  if (!isPlainObject(source)) return null;
  const nestedSummaryKeys = new Set([
    "segmentZoneBridgeSummary",
    "sealedSegmentZoneBridgeSummary",
    "driverSizerSummary",
    "runtimeDriverSizerSummary",
    "boardElectricalSummary",
    "safeBoardElectricalSummary",
    "boardFillSummary",
    "safeBoardFillSummary",
    "boardFillInputSummary",
    "safeBoardFillInputSummary",
    "accessoryReservationSummary",
    "safeAccessoryReservationSummary",
  ]);
  for (const [key, nested] of Object.entries(source)) {
    if (nestedSummaryKeys.has(key)) continue;
    const blocker = unsafeInputBlocker({ [key]: nested });
    if (blocker) return blocker;
  }
  return null;
}

function mapSummaryUnsafeBlocker(blocker, fallback) {
  if (!blocker) return null;
  if (blocker === "unsafe-private-path-input" || /^raw-.*-input-not-approved$/.test(blocker)) return fallback;
  if (blocker.endsWith("-not-approved")) return blocker;
  return fallback;
}

function safetyBase(extra = {}) {
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    zoneValidationFootholdReady: extra.zoneValidationFootholdReady ?? false,
    zoneCountCandidate: extra.zoneCountCandidate ?? null,
    noCrossValidationSummary: extra.noCrossValidationSummary || null,
    segmentContainmentSummary: extra.segmentContainmentSummary || null,
    joinModeSummary: extra.joinModeSummary || null,
    validationReadiness: extra.validationReadiness || {
      zoneValidationFootholdReady: false,
      noCrossValidationReady: false,
      crossJoinValidationReady: false,
      compareJoinModeValidationReady: false,
      gateDValidationReady: false,
      fullDonorZoneSolverReady: false,
      reason: "zone-validation-foothold-not-ready",
    },
    limitingFactorCategory: extra.limitingFactorCategory || "unresolved",
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    segmentZoneBridgeFingerprint: extra.segmentZoneBridgeFingerprint || null,
    zoneValidationFootholdFingerprint: extra.zoneValidationFootholdFingerprint || null,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawReservationGridReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_ZONE_VALIDATION_FOOTHOLD_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    zoneValidationFootholdReady: false,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function resolveFingerprints(source) {
  const segmentZoneBridgeSummary = firstPresent(source, ["segmentZoneBridgeSummary", "sealedSegmentZoneBridgeSummary"]);
  const driverSizerSummary = firstPresent(source, ["driverSizerSummary", "runtimeDriverSizerSummary"]);
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || safeFingerprint(firstPresent(segmentZoneBridgeSummary, ["policyFingerprint", "safePolicyFingerprint"]))
    || safeFingerprint(firstPresent(driverSizerSummary, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || safeFingerprint(firstPresent(segmentZoneBridgeSummary, ["sourceFingerprint", "safeSourceFingerprint"]))
    || safeFingerprint(firstPresent(driverSizerSummary, ["sourceFingerprint", "safeSourceFingerprint"]));

  if (!policyFingerprint) return { ok: false, blocker: "missing-policy-fingerprint", diagnostic: "A safe policy fingerprint is required." };
  if (!sourceFingerprint) return { ok: false, blocker: "missing-source-fingerprint", diagnostic: "A safe source fingerprint is required.", policyFingerprint };
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function validateSummaryFingerprint(summary, name, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) return { ok: true };
  const policy = safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
  const source = safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if ((policy && policy !== policyFingerprint) || (source && source !== sourceFingerprint)) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${name} fingerprint does not match the zone validation foothold input.` };
  }
  return { ok: true };
}

function validateOptionalSafeSummary(summary, name, unsafeFallback, policyFingerprint, sourceFingerprint) {
  if (summary === undefined || summary === null) return { ok: true };
  if (!isPlainObject(summary)) return { ok: false, blocker: unsafeFallback, diagnostic: `${name} must be a sealed safe summary object when supplied.` };
  const unsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(summary), unsafeFallback);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: `${name} contains raw rows, raw payloads, private paths, or forbidden side-effect markers.` };
  if (summary.ok !== true || summary.diagnosticOnly !== true) {
    return { ok: false, blocker: unsafeFallback, diagnostic: `${name} must be ok and diagnostic-only when supplied.` };
  }
  return validateSummaryFingerprint(summary, name, policyFingerprint, sourceFingerprint);
}

function validateSegmentZoneBridgeSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "missing-segment-zone-bridge-summary", diagnostic: "The sealed segment-zone bridge summary is required before zone validation diagnostics." };
  }
  const unsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(summary), "unsafe-segment-zone-bridge-summary");
  if (unsafe) return { ok: false, blocker: unsafe === "raw-engine-payload-input-not-approved" ? "unsafe-segment-zone-bridge-summary" : unsafe, diagnostic: "Segment-zone bridge summary contains unsafe raw rows, raw payloads, private paths, or forbidden side-effect markers." };
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Segment-zone bridge summary must be ok, runtime-native, diagnostic-only, and safe." };
  }
  if (summary.segmentZoneBridgeReady !== true) {
    return { ok: false, blocker: "segment-zone-bridge-not-ready", diagnostic: "Segment-zone bridge is not ready." };
  }
  const fingerprintCheck = validateSummaryFingerprint(summary, "segment-zone bridge summary", policyFingerprint, sourceFingerprint);
  if (!fingerprintCheck.ok) return fingerprintCheck;

  const frozenSegmentSummary = firstPresent(summary, ["frozenSegmentSummary", "sealedFrozenSegmentSummary"]);
  if (!isPlainObject(frozenSegmentSummary)) {
    return { ok: false, blocker: "missing-frozen-segment-summary", diagnostic: "A sealed frozen segment summary is required from the segment-zone bridge." };
  }
  const frozenUnsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(frozenSegmentSummary), "unsafe-segment-zone-bridge-summary");
  if (frozenUnsafe) return { ok: false, blocker: frozenUnsafe, diagnostic: "Frozen segment summary is not sealed/safe." };

  const noCrossZoneContainmentSummary = firstPresent(summary, ["noCrossZoneContainmentSummary", "sealedNoCrossZoneContainmentSummary"]);
  if (!isPlainObject(noCrossZoneContainmentSummary)) {
    return { ok: false, blocker: "missing-no-cross-containment-summary", diagnostic: "A sealed no-cross containment summary is required from the segment-zone bridge." };
  }
  const containmentUnsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(noCrossZoneContainmentSummary), "unsafe-segment-zone-bridge-summary");
  if (containmentUnsafe) return { ok: false, blocker: containmentUnsafe, diagnostic: "No-cross containment summary is not sealed/safe." };

  const segmentZoneBridgeFingerprint = safeFingerprint(firstPresent(summary, ["segmentZoneBridgeFingerprint", "fingerprint"]));
  if (!segmentZoneBridgeFingerprint) {
    return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Segment-zone bridge fingerprint must be a safe fingerprint." };
  }

  return {
    ok: true,
    frozenSegmentSummary,
    noCrossZoneContainmentSummary,
    joinModeSummary: isPlainObject(summary.joinModeSummary) ? summary.joinModeSummary : {},
    validationReadiness: isPlainObject(summary.validationReadiness) ? summary.validationReadiness : {},
    segmentZoneBridgeFingerprint,
  };
}

function validateDriverSizerSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "missing-driver-sizer-summary", diagnostic: "The sealed driver sizer summary is required before zone validation diagnostics." };
  }
  const unsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(summary), "unsafe-driver-sizer-summary");
  if (unsafe) return { ok: false, blocker: unsafe === "raw-engine-payload-input-not-approved" ? "unsafe-driver-sizer-summary" : unsafe, diagnostic: "Driver sizer summary contains unsafe raw rows, raw payloads, private paths, or forbidden side-effect markers." };
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true || summary.driverSizerReady !== true) {
    return { ok: false, blocker: "unsafe-driver-sizer-summary", diagnostic: "Driver sizer summary must be ready, ok, runtime-native, diagnostic-only, and safe." };
  }
  const fingerprintCheck = validateSummaryFingerprint(summary, "driver sizer summary", policyFingerprint, sourceFingerprint);
  if (!fingerprintCheck.ok) return fingerprintCheck;
  const zoneCountCandidateRaw = firstPresent(summary, ["zoneCountCandidate", "safeZoneCountCandidate"])
    ?? firstPresent(firstPresent(summary, ["selectedDriverSummary"]), ["zoneCountCandidate", "safeZoneCountCandidate"]);
  if (zoneCountCandidateRaw === undefined || zoneCountCandidateRaw === null || zoneCountCandidateRaw === "") {
    return { ok: false, blocker: "missing-zone-count-candidate", diagnostic: "Driver sizer summary must include a sealed zone count candidate." };
  }
  const zoneCountCandidateNumber = toFiniteNumber(zoneCountCandidateRaw);
  const zoneCountCandidate = Number.isInteger(zoneCountCandidateNumber) && zoneCountCandidateNumber > 0
    ? zoneCountCandidateNumber
    : null;
  if (!zoneCountCandidate) {
    return { ok: false, blocker: "invalid-zone-count-candidate", diagnostic: "Zone count candidate must be a positive integer." };
  }
  return {
    ok: true,
    zoneCountCandidate,
    limitingFactorCategory: safeLabel(firstPresent(summary, ["limitingFactorCategory"])
      ?? firstPresent(firstPresent(summary, ["selectedDriverSummary"]), ["limitingFactorCategory"]), "unresolved"),
    driverSizerFingerprint: safeFingerprint(firstPresent(summary, ["driverSizerFingerprint", "fingerprint"])),
  };
}

function resolveSegmentCount(frozenSegmentSummary) {
  const explicit = toPositiveInteger(firstPresent(frozenSegmentSummary, ["segmentCount", "frozenSegmentCount"]));
  if (explicit) return explicit;
  const segments = firstPresent(frozenSegmentSummary, ["segments", "segmentSummaries"]);
  return Array.isArray(segments) ? toPositiveInteger(segments.length) : null;
}

function resolveContainedZoneCount(noCrossZoneContainmentSummary) {
  return toPositiveInteger(firstPresent(noCrossZoneContainmentSummary, ["containedZoneCount", "zoneCount", "supportedZoneCount"]));
}

function validatePhysicalLayoutAvailability(frozenSegmentSummary) {
  const segmentCount = resolveSegmentCount(frozenSegmentSummary);
  if (!segmentCount) {
    return { ok: false, blocker: "zone-calculation-depends-on-unavailable-physical-layout", diagnostic: "Frozen physical segment count is unavailable from the sealed bridge." };
  }
  const segments = firstPresent(frozenSegmentSummary, ["segments", "segmentSummaries"]);
  if (segments !== undefined && !Array.isArray(segments)) {
    return { ok: false, blocker: "zone-calculation-depends-on-unavailable-physical-layout", diagnostic: "Frozen physical segment summary must provide sealed segment summaries when segment details are supplied." };
  }
  if (Array.isArray(segments) && segments.length > 0) {
    for (const segment of segments) {
      if (!isPlainObject(segment)) {
        return { ok: false, blocker: "zone-calculation-depends-on-unavailable-physical-layout", diagnostic: "Frozen segment details must be sealed summary objects." };
      }
    }
  }
  return { ok: true, segmentCount, segments: Array.isArray(segments) ? segments : [] };
}

function validateJoinMode(joinModeSummary, noCrossZoneContainmentSummary) {
  const secondaryAcrossSegment = safeLabel(firstPresent(joinModeSummary, ["secondaryAcrossSegment", "secondary_across_segment", "joinMode", "join_mode"]), "forbid").toLowerCase();
  const compareRequested = joinModeSummary.compareModeRequested === true
    || joinModeSummary.compareJoinModeRequested === true
    || secondaryAcrossSegment === "compare"
    || noCrossZoneContainmentSummary.secondaryAcrossSegment === "compare";
  const crossRequested = joinModeSummary.allowCrossSegmentJoins === true
    || joinModeSummary.crossJoinValidationRequested === true
    || ["allow", "cross", "cross-join", "zones-may-cross-segment-joins"].includes(secondaryAcrossSegment)
    || ["allow", "cross"].includes(String(noCrossZoneContainmentSummary.secondaryAcrossSegment || "").toLowerCase());
  if (compareRequested) {
    return { ok: false, blocker: "compare-join-mode-validation-not-approved", diagnostic: "Compare join-mode validation remains a placeholder until explicitly approved." };
  }
  if (crossRequested) {
    return { ok: false, blocker: "cross-join-zone-validation-not-approved", diagnostic: "Cross-join zone validation remains a placeholder until explicitly approved." };
  }
  return {
    ok: true,
    joinModeSummary: {
      secondaryAcrossSegment: secondaryAcrossSegment || "forbid",
      noCrossContainmentDiagnosticsEnabled: true,
      crossJoinValidationEnabled: false,
      compareJoinModeValidationEnabled: false,
      crossJoinComparisonScoringEnabled: false,
      placeholderOnly: false,
      joinModeDecision: "no-cross-validation-only",
    },
  };
}

function validateNoCrossSupport({ zoneCountCandidate, segmentCount, noCrossZoneContainmentSummary }) {
  const containedZoneCount = resolveContainedZoneCount(noCrossZoneContainmentSummary);
  if (!containedZoneCount) {
    return { ok: false, blocker: "missing-no-cross-containment-summary", diagnostic: "No-cross containment summary must expose a positive contained zone count." };
  }
  if (noCrossZoneContainmentSummary.zonesCrossSegmentJoin === true || toPositiveInteger(noCrossZoneContainmentSummary.crossJoinZoneCount) > 0) {
    return { ok: false, blocker: "cross-join-zone-validation-not-approved", diagnostic: "No-cross containment summary indicates cross-join zones, which are not approved here." };
  }
  if (zoneCountCandidate > containedZoneCount) {
    return { ok: false, blocker: "zone-count-exceeds-no-cross-containment", diagnostic: "Zone count candidate exceeds sealed no-cross containment capacity." };
  }
  if (zoneCountCandidate !== segmentCount || containedZoneCount !== segmentCount) {
    return { ok: false, blocker: "unsupported-zone-count", diagnostic: "This foothold only supports the sealed one-zone-per-frozen-segment no-cross candidate." };
  }
  return { ok: true, containedZoneCount };
}

function buildNoCrossValidationSummary({ zoneCountCandidate, segmentCount, containedZoneCount, noCrossZoneContainmentSummary }) {
  return {
    diagnosticOnly: true,
    validationMode: "sealed-no-cross-containment-only",
    supported: true,
    zoneCountCandidate,
    frozenSegmentCount: segmentCount,
    containedZoneCount,
    containmentMode: safeLabel(noCrossZoneContainmentSummary.containmentMode, "one-zone-per-frozen-physical-segment"),
    zonesCrossSegmentJoin: false,
    crossJoinZoneCount: 0,
    fullZoneSolverInvoked: false,
    gateDValidationInvoked: false,
    donorEngineInvoked: false,
    rawEnginePayloadReturned: false,
  };
}

function buildSegmentContainmentSummary({ zoneCountCandidate, segmentCount, containedZoneCount, frozenSegmentSummary }) {
  return {
    diagnosticOnly: true,
    frozenSegmentCount: segmentCount,
    noCrossContainedZoneCount: containedZoneCount,
    zoneCountCandidate,
    candidateMatchesFrozenSegmentCount: zoneCountCandidate === segmentCount,
    candidateFitsNoCrossContainment: zoneCountCandidate <= containedZoneCount,
    segmentBoundariesAtBoardEndsOnly: frozenSegmentSummary.segmentBoundariesAtBoardEndsOnly !== false,
    noBoardCrossesFrozenSegmentBoundary: frozenSegmentSummary.noBoardCrossesFrozenSegmentBoundary !== false,
    physicalLayoutSource: safeLabel(frozenSegmentSummary.frozenFrom || frozenSegmentSummary.segmentBoundarySource, "sealed-segment-zone-bridge"),
    rawBoardRowsReturned: false,
  };
}

export function buildRuntimeZoneValidationFootholdSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const inputUnsafe = topLevelUnsafeBlocker(source);
  if (inputUnsafe) {
    return failClosed(inputUnsafe, "Input contains unsafe raw rows, raw payloads, private paths, or forbidden side-effect markers.");
  }

  const fingerprints = resolveFingerprints(source);
  if (!fingerprints.ok) return failClosed(fingerprints.blocker, fingerprints.diagnostic, fingerprints);
  const { policyFingerprint, sourceFingerprint } = fingerprints;

  const segmentZoneBridgeSummary = firstPresent(source, ["segmentZoneBridgeSummary", "sealedSegmentZoneBridgeSummary"]);
  const bridge = validateSegmentZoneBridgeSummary(segmentZoneBridgeSummary, policyFingerprint, sourceFingerprint);
  if (!bridge.ok) return failClosed(bridge.blocker, bridge.diagnostic, { policyFingerprint, sourceFingerprint });

  const driverSizerSummary = firstPresent(source, ["driverSizerSummary", "runtimeDriverSizerSummary"]);
  const driver = validateDriverSizerSummary(driverSizerSummary, policyFingerprint, sourceFingerprint);
  if (!driver.ok) return failClosed(driver.blocker, driver.diagnostic, { policyFingerprint, sourceFingerprint, segmentZoneBridgeFingerprint: bridge.segmentZoneBridgeFingerprint });

  const optionalChecks = [
    [firstPresent(source, ["boardElectricalSummary", "safeBoardElectricalSummary"]), "board electrical summary", "unsafe-board-electrical-summary"],
    [firstPresent(source, ["boardFillSummary", "safeBoardFillSummary"]), "board-fill summary", "unsafe-board-fill-summary"],
    [firstPresent(source, ["boardFillInputSummary", "safeBoardFillInputSummary"]), "board-fill input summary", "unsafe-board-fill-input-summary"],
    [firstPresent(source, ["accessoryReservationSummary", "safeAccessoryReservationSummary"]), "accessory reservation summary", "unsafe-accessory-reservation-summary"],
  ];
  for (const [summary, name, unsafeFallback] of optionalChecks) {
    const checked = validateOptionalSafeSummary(summary, name, unsafeFallback, policyFingerprint, sourceFingerprint);
    if (!checked.ok) return failClosed(checked.blocker, checked.diagnostic, { policyFingerprint, sourceFingerprint, segmentZoneBridgeFingerprint: bridge.segmentZoneBridgeFingerprint });
  }

  const layout = validatePhysicalLayoutAvailability(bridge.frozenSegmentSummary);
  if (!layout.ok) return failClosed(layout.blocker, layout.diagnostic, { policyFingerprint, sourceFingerprint, segmentZoneBridgeFingerprint: bridge.segmentZoneBridgeFingerprint, zoneCountCandidate: driver.zoneCountCandidate });

  const join = validateJoinMode(bridge.joinModeSummary, bridge.noCrossZoneContainmentSummary);
  if (!join.ok) return failClosed(join.blocker, join.diagnostic, { policyFingerprint, sourceFingerprint, segmentZoneBridgeFingerprint: bridge.segmentZoneBridgeFingerprint, zoneCountCandidate: driver.zoneCountCandidate });

  const support = validateNoCrossSupport({
    zoneCountCandidate: driver.zoneCountCandidate,
    segmentCount: layout.segmentCount,
    noCrossZoneContainmentSummary: bridge.noCrossZoneContainmentSummary,
  });
  if (!support.ok) return failClosed(support.blocker, support.diagnostic, { policyFingerprint, sourceFingerprint, segmentZoneBridgeFingerprint: bridge.segmentZoneBridgeFingerprint, zoneCountCandidate: driver.zoneCountCandidate });

  const noCrossValidationSummary = buildNoCrossValidationSummary({
    zoneCountCandidate: driver.zoneCountCandidate,
    segmentCount: layout.segmentCount,
    containedZoneCount: support.containedZoneCount,
    noCrossZoneContainmentSummary: bridge.noCrossZoneContainmentSummary,
  });
  const segmentContainmentSummary = buildSegmentContainmentSummary({
    zoneCountCandidate: driver.zoneCountCandidate,
    segmentCount: layout.segmentCount,
    containedZoneCount: support.containedZoneCount,
    frozenSegmentSummary: bridge.frozenSegmentSummary,
  });
  const validationReadiness = {
    zoneValidationFootholdReady: true,
    noCrossValidationReady: true,
    crossJoinValidationReady: false,
    compareJoinModeValidationReady: false,
    gateDValidationReady: false,
    fullDonorZoneSolverReady: false,
    frozenZoneDriverReselectionReady: false,
    reason: "sealed-no-cross-containment-candidate-supported",
  };
  const warnings = [
    "Diagnostic-only runtime-native zone validation foothold: cross/compare validation, Gate D validation, RunTable generation, and IES generation remain disabled.",
  ];
  const zoneValidationFootholdFingerprint = `safe-zone-validation-foothold:${stableSha1([
    policyFingerprint,
    sourceFingerprint,
    bridge.segmentZoneBridgeFingerprint,
    driver.driverSizerFingerprint || null,
    driver.zoneCountCandidate,
    noCrossValidationSummary,
    segmentContainmentSummary,
    join.joinModeSummary,
    driver.limitingFactorCategory,
  ])}`;

  return safetyBase({
    ok: true,
    zoneValidationFootholdReady: true,
    zoneCountCandidate: driver.zoneCountCandidate,
    noCrossValidationSummary,
    segmentContainmentSummary,
    joinModeSummary: join.joinModeSummary,
    validationReadiness,
    limitingFactorCategory: driver.limitingFactorCategory,
    warnings,
    failClosedDiagnostics: [],
    policyFingerprint,
    sourceFingerprint,
    segmentZoneBridgeFingerprint: bridge.segmentZoneBridgeFingerprint,
    zoneValidationFootholdFingerprint,
  });
}

export const buildRuntimeNativeZoneValidationFootholdSummary = buildRuntimeZoneValidationFootholdSummary;
export const buildEngineRunTableRuntimeZoneValidationFootholdKernelStatus = buildRuntimeZoneValidationFootholdSummary;
