import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.emergency-zone-picker-foothold-summary";
export const ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_STATE =
  "runtime_emergency_zone_picker_foothold_diagnostic_only";

export const ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  sealedZoneValidationFootholdRequired: true,
  sealedSegmentZoneBridgeRequired: true,
  noCrossZoneAssociationOnly: true,
  physicalPlacementEnabled: false,
  physicalHardwareReservationPerformed: false,
  emergencyDriverSelectionEnabled: false,
  emergencyDriverPolicyFilteringEnabled: false,
  ewisSpeakerProofEnabled: false,
  complianceProofEnabled: false,
  complianceApprovalEnabled: false,
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
  rawEmergencyPayloadReturned: false,
  rawEnginePayloadReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,380}$/;
const RAW_PRODUCT_KEY_PATTERN = /^(?:PRODUCTS?|rawProducts?|rawProductRows|productRows|productsTable|productTable|sourceProductRows)$/i;
const RAW_BOARD_KEY_PATTERN = /^(?:BOARDS?|rawBoards?|rawBoardRows|boardRows|boardsTable|boardTable|sourceBoardRows)$/i;
const RAW_DRIVER_KEY_PATTERN = /^(?:DRIVERS?|rawDrivers?|rawDriverRows|driverRows|driversTable|driverTable|sourceDriverRows)$/i;
const RAW_ACCESSORY_KEY_PATTERN = /^(?:ACCESSORIES|rawAccessories|rawAccessoryRows|accessoryRows|accessoriesTable|accessoryTable|sourceAccessoryRows|accessoryCatalogRows)$/i;
const RAW_EMERGENCY_KEY_PATTERN = /^(?:rawEmergencyPayload|emergencyPayload|rawEmergencyRows|emergencyRows|egressRows|rawEgressRows|ewisRows|rawEwisRows|sourceEmergencyRows)$/i;
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
  [/^complianceApproved$/i, "compliance-approval-not-available"],
  [/^routesAdded$/i, "routes-added-not-approved"],
  [/^publicRoutesAdded$/i, "routes-added-not-approved"],
  [/^postEndpointsAdded$/i, "post-endpoints-added-not-approved"],
  [/^rawProductRowsReturned$/i, "raw-product-row-input-not-approved"],
  [/^rawBoardRowsReturned$/i, "raw-board-row-input-not-approved"],
  [/^rawDriverRowsReturned$/i, "raw-driver-row-input-not-approved"],
  [/^rawAccessoryRowsReturned$/i, "raw-accessory-row-input-not-approved"],
  [/^rawEmergencyPayloadReturned$/i, "raw-emergency-payload-input-not-approved"],
  [/^rawEnginePayloadReturned$/i, "raw-engine-payload-input-not-approved"],
]);

const SUPPORTED_STRATEGIES = new Set(["first", "last", "every-zone", "longest-zone"]);
const SUPPORTED_EMERGENCY_TYPES = new Set(["egress-light", "emergency-driver", "ewis-speaker", "marker-only"]);

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
  return cleaned ? cleaned.slice(0, 140) : fallback;
}

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  return raw
    .toLowerCase()
    .replace(/_/g, "-")
    .replace(/[^0-9a-z.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120) || fallback;
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

function toNonNegativeInteger(value) {
  const parsed = toFiniteNumber(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return Number.isInteger(rounded) && rounded >= 0 ? rounded : null;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 400);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function triState(value) {
  if (value === true || value === false) return value;
  const token = safeToken(value, "");
  if (["true", "yes", "y", "1", "required"].includes(token)) return true;
  if (["false", "no", "n", "0", "not-required", "none"].includes(token)) return false;
  return "unknown";
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
    if (RAW_EMERGENCY_KEY_PATTERN.test(key)) return "raw-emergency-payload-input-not-approved";
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

function mapSummaryUnsafeBlocker(blocker, fallback) {
  if (!blocker) return null;
  if (blocker === "unsafe-private-path-input" || /^raw-.*-input-not-approved$/.test(blocker)) return fallback;
  if (blocker.endsWith("-not-approved") || blocker === "compliance-approval-not-available") return blocker;
  return fallback;
}

function safetyBase(extra = {}) {
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    emergencyZonePickerReady: extra.emergencyZonePickerReady ?? false,
    emergencyZoneCandidateSummary: extra.emergencyZoneCandidateSummary || null,
    selectedZoneIntentSummary: extra.selectedZoneIntentSummary || null,
    physicalHardwareBoundary: extra.physicalHardwareBoundary || {
      diagnosticOnly: true,
      physicalHardwareRequired: "unknown",
      upstreamReservationProven: false,
      physicalPlacementReturned: false,
      boundary: "physical-hardware-reservation-belongs-upstream-accessory-reservation",
    },
    complianceBoundary: extra.complianceBoundary || {
      diagnosticOnly: true,
      complianceProofRequired: "unknown",
      complianceProofReady: false,
      complianceApproved: false,
      boundary: "no-as-nzs-2293-ewis-spl-lux-candela-or-life-safety-approval",
    },
    validationReadiness: extra.validationReadiness || {
      emergencyZonePickerReady: false,
      zoneValidationFootholdReady: false,
      sealedNoCrossZonesReady: false,
      physicalPlacementReady: false,
      complianceProofReady: false,
      gateDValidationReady: false,
      runTableReady: false,
      iesReady: false,
      reason: "emergency-zone-picker-not-ready",
    },
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    zoneValidationFootholdFingerprint: extra.zoneValidationFootholdFingerprint || null,
    emergencyZonePickerFingerprint: extra.emergencyZonePickerFingerprint || null,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawEmergencyPayloadReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    complianceApproved: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_EMERGENCY_ZONE_PICKER_FOOTHOLD_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    emergencyZonePickerReady: false,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function resolveFingerprints(source) {
  const zoneValidationFootholdSummary = firstPresent(source, ["zoneValidationFootholdSummary", "runtimeZoneValidationFootholdSummary"]);
  const segmentZoneBridgeSummary = firstPresent(source, ["segmentZoneBridgeSummary", "sealedSegmentZoneBridgeSummary"]);
  const driverSizerSummary = firstPresent(source, ["driverSizerSummary", "runtimeDriverSizerSummary"]);
  const accessoryReservationSummary = firstPresent(source, ["accessoryReservationSummary", "safeAccessoryReservationSummary"]);
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || safeFingerprint(firstPresent(zoneValidationFootholdSummary, ["policyFingerprint", "safePolicyFingerprint"]))
    || safeFingerprint(firstPresent(segmentZoneBridgeSummary, ["policyFingerprint", "safePolicyFingerprint"]))
    || safeFingerprint(firstPresent(driverSizerSummary, ["policyFingerprint", "safePolicyFingerprint"]))
    || safeFingerprint(firstPresent(accessoryReservationSummary, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || safeFingerprint(firstPresent(zoneValidationFootholdSummary, ["sourceFingerprint", "safeSourceFingerprint"]))
    || safeFingerprint(firstPresent(segmentZoneBridgeSummary, ["sourceFingerprint", "safeSourceFingerprint"]))
    || safeFingerprint(firstPresent(driverSizerSummary, ["sourceFingerprint", "safeSourceFingerprint"]))
    || safeFingerprint(firstPresent(accessoryReservationSummary, ["sourceFingerprint", "safeSourceFingerprint"]));

  if (!policyFingerprint) return { ok: false, blocker: "missing-policy-fingerprint", diagnostic: "A safe policy fingerprint is required." };
  if (!sourceFingerprint) return { ok: false, blocker: "missing-source-fingerprint", diagnostic: "A safe source fingerprint is required.", policyFingerprint };
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function validateSummaryFingerprint(summary, name, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) return { ok: true };
  const policy = safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
  const source = safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if ((policy && policy !== policyFingerprint) || (source && source !== sourceFingerprint)) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${name} fingerprint does not match the emergency zone picker input.` };
  }
  return { ok: true };
}

function validateZoneValidationFootholdSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "missing-zone-validation-foothold-summary", diagnostic: "A sealed zone validation foothold summary is required before emergency zone picker diagnostics." };
  }
  const unsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(summary), "unsafe-zone-validation-foothold-summary");
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: "Zone validation foothold summary contains unsafe raw rows, raw payloads, private paths, or forbidden side-effect markers." };
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: "unsafe-zone-validation-foothold-summary", diagnostic: "Zone validation foothold summary must be ok, runtime-native, diagnostic-only, and safe." };
  }
  if (summary.zoneValidationFootholdReady !== true) {
    return { ok: false, blocker: "zone-validation-foothold-not-ready", diagnostic: "Zone validation foothold is not ready." };
  }
  const fingerprintCheck = validateSummaryFingerprint(summary, "zone validation foothold summary", policyFingerprint, sourceFingerprint);
  if (!fingerprintCheck.ok) return fingerprintCheck;
  const zoneValidationFootholdFingerprint = safeFingerprint(firstPresent(summary, ["zoneValidationFootholdFingerprint", "fingerprint"]));
  if (!zoneValidationFootholdFingerprint) {
    return { ok: false, blocker: "unsafe-zone-validation-foothold-summary", diagnostic: "Zone validation foothold fingerprint must be a safe fingerprint." };
  }
  const readiness = firstPresent(summary, ["validationReadiness"]);
  if (isPlainObject(readiness) && readiness.noCrossValidationReady !== true) {
    return { ok: false, blocker: "zone-validation-foothold-not-ready", diagnostic: "Zone validation foothold does not expose ready sealed no-cross validation." };
  }
  return { ok: true, zoneValidationFootholdFingerprint };
}

function normaliseCandidateZone(zone, fallbackIndex) {
  if (!isPlainObject(zone)) return null;
  const unsafe = unsafeInputBlocker(zone);
  if (unsafe) return null;
  const zoneIndex = toNonNegativeInteger(firstPresent(zone, ["zoneIndex", "zoneIdx", "zone_idx", "index"])) ?? fallbackIndex;
  const segmentIndex = toNonNegativeInteger(firstPresent(zone, ["segmentIndex", "segmentIdx", "segment_idx"])) ?? zoneIndex;
  const startMm = toFiniteNumber(firstPresent(zone, ["zoneStartMm", "zone_start_mm", "startMm", "start_mm"]));
  const endMm = toFiniteNumber(firstPresent(zone, ["zoneEndMm", "zone_end_mm", "endMm", "end_mm"]));
  const explicitLength = toFiniteNumber(firstPresent(zone, ["zoneLengthMm", "zone_length_mm", "segmentLengthMm", "segment_length_mm", "activeLedLengthMm"]));
  const lengthRankValue = Number.isFinite(startMm) && Number.isFinite(endMm) && endMm > startMm
    ? endMm - startMm
    : (Number.isFinite(explicitLength) && explicitLength > 0 ? explicitLength : 0);
  const crossesSegmentJoin = zone.crossesSegmentJoin === true || zone.zonesCrossSegmentJoin === true || zone.crosses_segment_join === true;
  return {
    zoneIndex,
    segmentIndex,
    zoneLengthBand: safeLabel(firstPresent(zone, ["zoneLengthBand", "segmentLengthBand", "lengthBand"]), lengthRankValue > 0 ? "sealed-length-known" : "unresolved"),
    boardCount: toNonNegativeInteger(firstPresent(zone, ["boardCount", "board_count"])),
    containedWithinFrozenSegment: zone.containedWithinFrozenSegment !== false,
    crossesSegmentJoin,
    rawBoardRowsReturned: false,
    lengthRankValue,
  };
}

function validateSegmentZoneBridgeSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "missing-segment-zone-bridge-summary", diagnostic: "The sealed segment-zone bridge summary is required before emergency zone picker diagnostics." };
  }
  const unsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(summary), "unsafe-segment-zone-bridge-summary");
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: "Segment-zone bridge summary contains unsafe raw rows, raw payloads, private paths, or forbidden side-effect markers." };
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true || summary.segmentZoneBridgeReady !== true) {
    return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Segment-zone bridge summary must be ready, ok, runtime-native, diagnostic-only, and safe." };
  }
  const fingerprintCheck = validateSummaryFingerprint(summary, "segment-zone bridge summary", policyFingerprint, sourceFingerprint);
  if (!fingerprintCheck.ok) return fingerprintCheck;
  const noCrossZoneContainmentSummary = firstPresent(summary, ["noCrossZoneContainmentSummary", "sealedNoCrossZoneContainmentSummary"]);
  if (!isPlainObject(noCrossZoneContainmentSummary)) {
    return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Segment-zone bridge summary must include sealed no-cross zone containment summary." };
  }
  const containmentUnsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(noCrossZoneContainmentSummary), "unsafe-segment-zone-bridge-summary");
  if (containmentUnsafe) return { ok: false, blocker: containmentUnsafe, diagnostic: "No-cross zone containment summary is unsafe." };
  if (noCrossZoneContainmentSummary.zonesCrossSegmentJoin === true || toPositiveInteger(noCrossZoneContainmentSummary.crossJoinZoneCount) > 0) {
    return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Emergency zone picker only accepts sealed no-cross zones." };
  }
  const rawZones = firstPresent(noCrossZoneContainmentSummary, ["zoneSummaries", "zones", "sealedZoneSummaries"]);
  if (!Array.isArray(rawZones) || rawZones.length === 0) {
    return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Sealed no-cross zone summaries are required." };
  }
  const zones = [];
  for (let index = 0; index < rawZones.length; index += 1) {
    const zone = normaliseCandidateZone(rawZones[index], index);
    if (!zone || zone.containedWithinFrozenSegment !== true || zone.crossesSegmentJoin === true) {
      return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Each emergency candidate zone must be a sealed no-cross zone contained within one frozen segment." };
    }
    zones.push(zone);
  }
  const seen = new Set();
  for (const zone of zones) {
    if (seen.has(zone.zoneIndex)) {
      return { ok: false, blocker: "unsafe-segment-zone-bridge-summary", diagnostic: "Sealed zone summaries must expose unique zone indexes." };
    }
    seen.add(zone.zoneIndex);
  }
  zones.sort((left, right) => left.zoneIndex - right.zoneIndex);
  const segmentZoneBridgeFingerprint = safeFingerprint(firstPresent(summary, ["segmentZoneBridgeFingerprint", "fingerprint"]));
  return {
    ok: true,
    zones,
    availableZoneCount: zones.length,
    segmentZoneBridgeFingerprint,
  };
}

function validateOptionalSafeSummary(summary, name, unsafeFallback, policyFingerprint, sourceFingerprint) {
  if (summary === undefined || summary === null) return { ok: true, supplied: false };
  if (!isPlainObject(summary)) return { ok: false, blocker: unsafeFallback, diagnostic: `${name} must be a sealed safe summary object when supplied.` };
  const unsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(summary), unsafeFallback);
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: `${name} contains unsafe raw rows, raw payloads, private paths, or forbidden side-effect markers.` };
  const fingerprintCheck = validateSummaryFingerprint(summary, name, policyFingerprint, sourceFingerprint);
  if (!fingerprintCheck.ok) return fingerprintCheck;
  if (summary.ok !== true || summary.diagnosticOnly !== true) {
    return { ok: false, blocker: unsafeFallback, diagnostic: `${name} must be ok and diagnostic-only when supplied.` };
  }
  return { ok: true, supplied: true };
}

function validateEmergencyIntentSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: "missing-emergency-intent-summary", diagnostic: "A safe bounded emergency intent summary is required." };
  }
  const unsafe = mapSummaryUnsafeBlocker(unsafeInputBlocker(summary), "unsafe-emergency-intent-summary");
  if (unsafe) return { ok: false, blocker: unsafe, diagnostic: "Emergency intent summary contains unsafe raw rows, raw payloads, private paths, or forbidden side-effect markers." };
  const fingerprintCheck = validateSummaryFingerprint(summary, "emergency intent summary", policyFingerprint, sourceFingerprint);
  if (!fingerprintCheck.ok) return fingerprintCheck;

  const requiredCountRaw = firstPresent(summary, ["requiredEmergencyZoneCount", "requiredZoneCount", "emergencyZoneCount"]);
  if (requiredCountRaw === undefined || requiredCountRaw === null || requiredCountRaw === "") {
    return { ok: false, blocker: "missing-required-emergency-zone-count", diagnostic: "Emergency intent must include requiredEmergencyZoneCount." };
  }
  const requiredEmergencyZoneCount = toPositiveInteger(requiredCountRaw);
  if (!requiredEmergencyZoneCount) {
    return { ok: false, blocker: "invalid-required-emergency-zone-count", diagnostic: "requiredEmergencyZoneCount must be a positive integer." };
  }

  const preferredEmergencyZoneStrategy = safeToken(firstPresent(summary, ["preferredEmergencyZoneStrategy", "zoneStrategy", "strategy"]), "");
  if (!preferredEmergencyZoneStrategy) {
    return { ok: false, blocker: "missing-emergency-zone-strategy", diagnostic: "Emergency intent must include preferredEmergencyZoneStrategy." };
  }
  if (!SUPPORTED_STRATEGIES.has(preferredEmergencyZoneStrategy)) {
    return { ok: false, blocker: "unsupported-emergency-zone-strategy", diagnostic: "Emergency zone picker only supports first, last, every-zone, and longest-zone strategies." };
  }

  const emergencyType = safeToken(firstPresent(summary, ["emergencyType", "egressType", "type"]), "");
  if (!emergencyType) {
    return { ok: false, blocker: "missing-emergency-type", diagnostic: "Emergency intent must include emergencyType." };
  }
  if (!SUPPORTED_EMERGENCY_TYPES.has(emergencyType)) {
    return { ok: false, blocker: "unsupported-emergency-type", diagnostic: "Emergency zone picker only supports egress-light, emergency-driver, ewis-speaker, and marker-only intent types." };
  }

  return {
    ok: true,
    intent: {
      requiredEmergencyZoneCount,
      preferredEmergencyZoneStrategy,
      emergencyType,
      physicalHardwareRequired: triState(firstPresent(summary, ["physicalHardwareRequired"])),
      complianceProofRequired: triState(firstPresent(summary, ["complianceProofRequired"])),
    },
  };
}

function hasEmergencyDriverPolicyProof(driverSizerSummary) {
  if (!isPlainObject(driverSizerSummary)) return false;
  if (driverSizerSummary.emergencyDriverPolicyProven === true || driverSizerSummary.emergencyDriverEligible === true) return true;
  const selected = firstPresent(driverSizerSummary, ["selectedDriverSummary"]);
  return isPlainObject(selected) && (selected.emergencyDriverPolicyProven === true || selected.emergencyDriverEligible === true);
}

function hasPhysicalHardwareReservationProof(accessoryReservationSummary) {
  if (!isPlainObject(accessoryReservationSummary)) return false;
  if (accessoryReservationSummary.physicalHardwareReservationProven === true || accessoryReservationSummary.emergencyPhysicalHardwareReservationProven === true) return true;
  const placementIntent = firstPresent(accessoryReservationSummary, ["accessoryPlacementIntentSummary"]);
  return isPlainObject(placementIntent) && (placementIntent.physicalHardwareReservationProven === true || placementIntent.emergencyPhysicalHardwareReservationProven === true);
}

function selectZones(zones, strategy, requiredCount) {
  if (strategy === "every-zone") return zones.map((zone) => ({ ...zone }));
  if (strategy === "first") return zones.slice(0, requiredCount).map((zone) => ({ ...zone }));
  if (strategy === "last") return zones.slice(Math.max(0, zones.length - requiredCount)).map((zone) => ({ ...zone }));
  const byLength = [...zones].sort((left, right) => {
    const delta = right.lengthRankValue - left.lengthRankValue;
    return delta !== 0 ? delta : left.zoneIndex - right.zoneIndex;
  });
  return byLength.slice(0, requiredCount).sort((left, right) => left.zoneIndex - right.zoneIndex).map((zone) => ({ ...zone }));
}

function publicZone(zone) {
  return {
    zoneIndex: zone.zoneIndex,
    segmentIndex: zone.segmentIndex,
    zoneLengthBand: zone.zoneLengthBand,
    boardCount: zone.boardCount,
    containedWithinFrozenSegment: true,
    crossesSegmentJoin: false,
    rawBoardRowsReturned: false,
  };
}

function buildCandidateSummary({ zones, selectedZones, intent }) {
  return {
    diagnosticOnly: true,
    candidateSource: "sealed-zone-validation-foothold-and-sealed-segment-zone-bridge",
    candidateMode: "sealed-no-cross-zone-intent-only",
    availableZoneCount: zones.length,
    requiredEmergencyZoneCount: intent.requiredEmergencyZoneCount,
    preferredEmergencyZoneStrategy: intent.preferredEmergencyZoneStrategy,
    emergencyType: intent.emergencyType,
    candidateZoneCount: selectedZones.length,
    candidateZones: selectedZones.map(publicZone),
    allSealedZones: zones.map(publicZone),
    physicalPlacementReturned: false,
    complianceProofReturned: false,
    rawEmergencyPayloadReturned: false,
  };
}

function buildSelectedIntentSummary({ selectedZones, intent }) {
  return {
    diagnosticOnly: true,
    zoneAssociationMode: "diagnostic-intent-associated-to-sealed-no-cross-zones",
    emergencyType: intent.emergencyType,
    preferredEmergencyZoneStrategy: intent.preferredEmergencyZoneStrategy,
    requiredEmergencyZoneCount: intent.requiredEmergencyZoneCount,
    selectedZoneCount: selectedZones.length,
    selectedZoneIndexes: selectedZones.map((zone) => zone.zoneIndex),
    selectedZones: selectedZones.map(publicZone),
    physicalHardwareRequired: intent.physicalHardwareRequired,
    complianceProofRequired: intent.complianceProofRequired,
    markerOnly: intent.emergencyType === "marker-only",
    ewisSpeakerProofApproved: false,
    emergencyDriverSelectedHere: false,
    physicalPlacementReturned: false,
    rawEmergencyPayloadReturned: false,
  };
}

function buildPhysicalHardwareBoundary(intent, accessoryReservationSummary) {
  const upstreamReservationProven = hasPhysicalHardwareReservationProof(accessoryReservationSummary);
  return {
    diagnosticOnly: true,
    physicalHardwareRequired: intent.physicalHardwareRequired,
    upstreamReservationProven,
    accessoryReservationReady: isPlainObject(accessoryReservationSummary) && accessoryReservationSummary.accessoryReservationReady === true,
    physicalPlacementReturned: false,
    physicalHardwareReservedHere: false,
    boundary: "physical-in-cover-hardware-reservation-belongs-upstream-accessory-reservation-when-space-is-occupied",
  };
}

function buildComplianceBoundary(intent) {
  return {
    diagnosticOnly: true,
    complianceProofRequired: intent.complianceProofRequired,
    complianceProofReady: false,
    complianceApproved: false,
    claimedStandards: [],
    boundary: "no-as-nzs-2293-ewis-spl-lux-candela-acoustic-coverage-or-life-safety-approval",
  };
}

export function buildRuntimeEmergencyZonePickerFootholdSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const inputUnsafe = unsafeInputBlocker(source);
  if (inputUnsafe) {
    return failClosed(inputUnsafe, "Input contains unsafe raw rows, raw payloads, private paths, compliance approval, generation, persistence, routes, endpoints, or mutation authority.");
  }

  const fingerprints = resolveFingerprints(source);
  if (!fingerprints.ok) return failClosed(fingerprints.blocker, fingerprints.diagnostic, fingerprints);
  const { policyFingerprint, sourceFingerprint } = fingerprints;

  const zoneValidationFootholdSummary = firstPresent(source, ["zoneValidationFootholdSummary", "runtimeZoneValidationFootholdSummary"]);
  const zoneValidation = validateZoneValidationFootholdSummary(zoneValidationFootholdSummary, policyFingerprint, sourceFingerprint);
  if (!zoneValidation.ok) return failClosed(zoneValidation.blocker, zoneValidation.diagnostic, { policyFingerprint, sourceFingerprint });

  const segmentZoneBridgeSummary = firstPresent(source, ["segmentZoneBridgeSummary", "sealedSegmentZoneBridgeSummary"]);
  const bridge = validateSegmentZoneBridgeSummary(segmentZoneBridgeSummary, policyFingerprint, sourceFingerprint);
  if (!bridge.ok) {
    return failClosed(bridge.blocker, bridge.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    });
  }

  const driverSizerSummary = firstPresent(source, ["driverSizerSummary", "runtimeDriverSizerSummary"]);
  const driverCheck = validateOptionalSafeSummary(driverSizerSummary, "driver sizer summary", "unsafe-driver-sizer-summary", policyFingerprint, sourceFingerprint);
  if (!driverCheck.ok) {
    return failClosed(driverCheck.blocker, driverCheck.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    });
  }

  const accessoryReservationSummary = firstPresent(source, ["accessoryReservationSummary", "safeAccessoryReservationSummary"]);
  const accessoryCheck = validateOptionalSafeSummary(accessoryReservationSummary, "accessory reservation summary", "unsafe-accessory-reservation-summary", policyFingerprint, sourceFingerprint);
  if (!accessoryCheck.ok) {
    return failClosed(accessoryCheck.blocker, accessoryCheck.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    });
  }

  const emergencyIntentSummary = firstPresent(source, ["emergencyIntentSummary", "safeEmergencyIntentSummary"]);
  const intentResult = validateEmergencyIntentSummary(emergencyIntentSummary, policyFingerprint, sourceFingerprint);
  if (!intentResult.ok) {
    return failClosed(intentResult.blocker, intentResult.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    });
  }
  const intent = intentResult.intent;

  if (intent.requiredEmergencyZoneCount > bridge.availableZoneCount) {
    return failClosed("required-emergency-zone-count-exceeds-available-zones", "Emergency intent requests more zones than the sealed no-cross zone bridge exposes.", {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    });
  }

  if (intent.emergencyType === "ewis-speaker") {
    return failClosed("ewis-speaker-zone-proof-not-approved", "EWIS/speaker zone proof is not approved in this diagnostic emergency zone picker foothold; only non-proof marker intent may proceed as marker-only.", {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    });
  }

  if (intent.emergencyType === "emergency-driver" && !hasEmergencyDriverPolicyProof(driverSizerSummary)) {
    return failClosed("emergency-driver-policy-not-proven", "Emergency-driver eligibility belongs upstream in driver policy/filter and has not been proven by the sealed driver sizer summary.", {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    });
  }

  const physicalHardwareBoundary = buildPhysicalHardwareBoundary(intent, accessoryReservationSummary);
  if (intent.physicalHardwareRequired === true && physicalHardwareBoundary.upstreamReservationProven !== true) {
    return failClosed("physical-hardware-reservation-required", "Physical emergency hardware reservation is required but has not been proven by the upstream accessory reservation foothold.", {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
      physicalHardwareBoundary,
    });
  }

  const complianceBoundary = buildComplianceBoundary(intent);
  if (intent.complianceProofRequired === true) {
    return failClosed("compliance-proof-required", "Compliance proof is required, but this foothold cannot approve AS/NZS 2293, EWIS, SPL, lux, candela, acoustic coverage, or life-safety compliance.", {
      policyFingerprint,
      sourceFingerprint,
      zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
      physicalHardwareBoundary,
      complianceBoundary,
    });
  }

  const selectedZones = selectZones(bridge.zones, intent.preferredEmergencyZoneStrategy, intent.requiredEmergencyZoneCount);
  const emergencyZoneCandidateSummary = buildCandidateSummary({ zones: bridge.zones, selectedZones, intent });
  const selectedZoneIntentSummary = buildSelectedIntentSummary({ selectedZones, intent });
  const validationReadiness = {
    emergencyZonePickerReady: true,
    zoneValidationFootholdReady: true,
    sealedNoCrossZonesReady: true,
    physicalPlacementReady: false,
    physicalHardwareReservationReady: physicalHardwareBoundary.upstreamReservationProven === true,
    emergencyDriverPolicyReady: intent.emergencyType === "emergency-driver" ? hasEmergencyDriverPolicyProof(driverSizerSummary) : false,
    ewisSpeakerProofReady: false,
    complianceProofReady: false,
    gateDValidationReady: false,
    runTableReady: false,
    iesReady: false,
    reason: "sealed-no-cross-emergency-zone-intent-associated-diagnostic-only",
  };
  const warnings = [
    "Diagnostic-only emergency zone picker: no physical placement, compliance proof, RunTable generation, or IES generation was performed.",
  ];
  if (intent.physicalHardwareRequired === "unknown") warnings.push("Physical hardware requirement is unknown; this is marker-level zone intent only.");
  if (intent.complianceProofRequired === "unknown") warnings.push("Compliance proof requirement is unknown; no compliance approval is claimed.");
  if (intent.emergencyType === "egress-light") warnings.push("Egress-light intent is associated to sealed zones only; AS/NZS 2293 proof remains out of scope.");

  const emergencyZonePickerFingerprint = `safe-emergency-zone-picker:${stableSha1([
    policyFingerprint,
    sourceFingerprint,
    zoneValidation.zoneValidationFootholdFingerprint,
    bridge.segmentZoneBridgeFingerprint || null,
    safeFingerprint(firstPresent(driverSizerSummary, ["driverSizerFingerprint", "fingerprint"])),
    safeFingerprint(firstPresent(accessoryReservationSummary, ["accessoryReservationFingerprint", "fingerprint"])),
    intent,
    emergencyZoneCandidateSummary,
    selectedZoneIntentSummary,
    physicalHardwareBoundary,
    complianceBoundary,
  ])}`;

  return safetyBase({
    ok: true,
    emergencyZonePickerReady: true,
    emergencyZoneCandidateSummary,
    selectedZoneIntentSummary,
    physicalHardwareBoundary,
    complianceBoundary,
    validationReadiness,
    warnings,
    failClosedDiagnostics: [],
    policyFingerprint,
    sourceFingerprint,
    zoneValidationFootholdFingerprint: zoneValidation.zoneValidationFootholdFingerprint,
    emergencyZonePickerFingerprint,
  });
}

export const buildRuntimeNativeEmergencyZonePickerFootholdSummary = buildRuntimeEmergencyZonePickerFootholdSummary;
export const buildEngineRunTableRuntimeEmergencyZonePickerFootholdStatus = buildRuntimeEmergencyZonePickerFootholdSummary;
