import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.safe-physical-placement-summary";
export const RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SCHEMA_VERSION = 1;
export const RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_STATE =
  "runtime_safe_physical_placement_summary_diagnostic_only";

export const RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  sourceBackedSafeSummaryOnly: true,
  chainBackedSafeSummaryOnly: true,
  exactPhysicalCoordinateExposureEnabled: false,
  exactBoundaryCoordinateExposureEnabled: false,
  exactElectricalValueExposureEnabled: false,
  physicalPlacementSolverEnabled: false,
  donorMechanicalDetailerInvoked: false,
  donorEngineInvoked: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  selectedResultPersistenceEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawDriverRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawReservationGridReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  rawIesContentReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  rawUsersReturned: false,
  rawCrmReturned: false,
  rawContactsReturned: false,
  privatePathsReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,460}$/;
const SAFE_TEXT_PATTERN = /^[0-9A-Za-z_.: /+,-]{1,160}$/;
const SAFE_PROOF_MARKERS = new Set([
  "sealed-safe-physical-placement-proof",
  "safe-physical-placement-proof",
  "source-backed-safe-placement-proof",
]);

const TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:mechanicalDetailerInvoked|donorMechanicalDetailerInvoked|mechanicalDetailerInvocationEnabled)$/i, "mechanical-detailer-invocation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationAttempted|runtimeDataMutationEnabled|runtimeDataMutationAuthority)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled)$/i, "selected-result-persistence-not-approved"],
  [/^(?:runTableGenerated|runtableGenerated|productionRunTableGenerated|runTableGenerationEnabled)$/i, "runtable-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled)$/i, "ies-generation-not-approved"],
  [/^(?:routesAdded|publicRoutesAdded|routeAdded|publicRouteAdded)$/i, "routes-added-not-approved"],
  [/^(?:postEndpointsAdded|postEndpointAdded)$/i, "post-endpoints-added-not-approved"],
  [/^(?:rawRowsReturned|rawProductRowsReturned)$/i, "raw-product-row-input-not-approved"],
  [/^(?:rawBoardRowsReturned)$/i, "raw-board-row-input-not-approved"],
  [/^(?:rawDriverRowsReturned)$/i, "raw-driver-row-input-not-approved"],
  [/^(?:rawAccessoryRowsReturned)$/i, "raw-accessory-row-input-not-approved"],
  [/^(?:rawReservationGridReturned)$/i, "raw-reservation-grid-input-not-approved"],
  [/^(?:rawEnginePayloadReturned)$/i, "raw-engine-payload-input-not-approved"],
  [/^(?:rawEngineResultReturned)$/i, "raw-engine-result-input-not-approved"],
  [/^(?:rawIesContentReturned|rawPhotometryReturned|candelaArraysReturned|base64ArtifactsReturned)$/i, "raw-ies-photometry-input-not-approved"],
  [/^(?:rawUsersReturned|rawCrmReturned|rawContactsReturned|privatePathsReturned|credentialsReturned)$/i, "private-data-input-not-approved"],
  [/^(?:exactCoordinatesReturned|exactBoundaryCoordinatesReturned|exactPhysicalCoordinatesReturned|exactCoordinatesExposed)$/i, "exact-coordinate-input-not-approved"],
  [/^(?:exactElectricalValuesReturned|exactElectricalValuesExposed|requestExactElectricalValues|exposeExactElectricalValues)$/i, "exact-electrical-value-input-not-approved"],
]);

const RAW_PRODUCT_KEY_PATTERN = /^(?:PRODUCTS?|rawProducts?|rawProductRows|productRows|productsTable|productTable|sourceProductRows)$/i;
const RAW_BOARD_KEY_PATTERN = /^(?:BOARDS?|rawBoards?|rawBoardRows|boardRows|boardsTable|boardTable|sourceBoardRows)$/i;
const RAW_DRIVER_KEY_PATTERN = /^(?:DRIVERS?|rawDrivers?|rawDriverRows|driverRows|driversTable|driverTable|sourceDriverRows)$/i;
const RAW_ACCESSORY_KEY_PATTERN = /^(?:ACCESSORIES|rawAccessories|rawAccessoryRows|accessoryRows|accessoriesTable|accessoryTable|sourceAccessoryRows|accessoryCatalogRows)$/i;
const RAW_RESERVATION_GRID_KEY_PATTERN = /^(?:rawReservationGrid|reservationGrid|reservedGrid|rawReservedGrid|reservationCells|rawReservationCells|physicalReservationGrid)$/i;
const RAW_ENGINE_PAYLOAD_KEY_PATTERN = /^(?:enginePayload|rawEnginePayload|runEnginePayload|selectorPayload|donorPayload|rawDonorPayload|roughElectricalPayload)$/i;
const RAW_ENGINE_RESULT_KEY_PATTERN = /^(?:engineResult|rawEngineResult|selectedResultBody|selectedResultPayload|rawSelectedResult)$/i;
const RAW_IES_KEY_PATTERN = /^(?:iesText|rawIesText|iesData|rawIesContent|photometry|rawPhotometry|candela|candelaGrid|candelaArrays|base64|base64Artifact|base64Artifacts)$/i;
const PRIVATE_DATA_KEY_PATTERN = /^(?:USERS|CRM|CONTACTS|rawUsers|rawCrm|rawContacts|credentials|credential|secret|password|email|phone)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|donorPath|runtimeDataPath|privatePath|path)$/i;
const EXACT_COORDINATE_KEY_PATTERN = /^(?:placements|placement|boardPlacements|physicalBoardPlacements|physicalPlacements|reservedRanges|reserved_ranges|ranges|segmentBoundariesMm|boundaryCoordinates|joinPositionsMm|clipPointsMm|suspensionPointsMm|startMm|endMm|start_mm|end_mm|x|y|z|xMm|yMm|zMm|centerlineMm|centrelineMm|positionMm|approxMm|zoneStartMm|zoneEndMm|segmentStartMm|segmentEndMm|boundaryMm|boundariesMm)$/i;
const EXACT_ELECTRICAL_KEY_PATTERN = /^(?:selectedCurrentMa|currentMa|current_ma|vfAtCurrentV|boardVoltageV|voltageV|wattAtCurrentW|boardPowerW|powerW|vout|voutMaxV|voutMinV|pout|poutMaxW|poutMinW|headroomW|capacityMm|driverCapacityMm|efficiency|opt_eff)$/i;

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

function safeText(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z_.: /+,-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 160);
  return cleaned && SAFE_TEXT_PATTERN.test(cleaned) ? cleaned : fallback;
}

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140);
  return token || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 480);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function safeArray(values, fallback = []) {
  const source = Array.isArray(values) ? values : fallback;
  return source
    .map((value) => safeText(value, ""))
    .filter(Boolean)
    .slice(0, 24);
}

function safeRefArray(values, fallback = []) {
  const source = Array.isArray(values) ? values : fallback;
  return source
    .map((value) => safeToken(value, ""))
    .filter(Boolean)
    .slice(0, 32);
}

function unsafeInputBlocker(value, depth = 0) {
  if (depth > 10) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "private-data-input-not-approved";
    if (/IESNA:|TILT=|candelaGrid|base64,/i.test(value)) return "raw-ies-photometry-input-not-approved";
    return null;
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeInputBlocker(entry, depth + 1);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    for (const [pattern, blocker] of TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    if (RAW_PRODUCT_KEY_PATTERN.test(key)) return "raw-product-row-input-not-approved";
    if (RAW_BOARD_KEY_PATTERN.test(key)) return "raw-board-row-input-not-approved";
    if (RAW_DRIVER_KEY_PATTERN.test(key)) return "raw-driver-row-input-not-approved";
    if (RAW_ACCESSORY_KEY_PATTERN.test(key)) return "raw-accessory-row-input-not-approved";
    if (RAW_RESERVATION_GRID_KEY_PATTERN.test(key)) return "raw-reservation-grid-input-not-approved";
    if (RAW_ENGINE_PAYLOAD_KEY_PATTERN.test(key)) return "raw-engine-payload-input-not-approved";
    if (RAW_ENGINE_RESULT_KEY_PATTERN.test(key)) return "raw-engine-result-input-not-approved";
    if (RAW_IES_KEY_PATTERN.test(key)) return "raw-ies-photometry-input-not-approved";
    if (PRIVATE_DATA_KEY_PATTERN.test(key)) return "private-data-input-not-approved";
    if (EXACT_COORDINATE_KEY_PATTERN.test(key)) return "exact-coordinate-input-not-approved";
    if (EXACT_ELECTRICAL_KEY_PATTERN.test(key)) return "exact-electrical-value-input-not-approved";
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "private-data-input-not-approved";
    }
    const blocker = unsafeInputBlocker(nested, depth + 1);
    if (blocker) return blocker;
  }
  return null;
}

function safetyBase(extra = {}) {
  return {
    schemaId: RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SCHEMA_VERSION,
    state: RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_STATE,
    nativeRuntimeKernel: true,
    runtimeNative: true,
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    physicalPlacementSummaryReady: extra.physicalPlacementSummaryReady ?? false,
    sourceBacked: extra.sourceBacked === true,
    chainBacked: extra.chainBacked === true,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    placementSummaryFingerprint: extra.placementSummaryFingerprint || null,
    boardPlacementBandSummary: extra.boardPlacementBandSummary || null,
    segmentBoundaryBandSummary: extra.segmentBoundaryBandSummary || null,
    reservedRangeBandSummary: extra.reservedRangeBandSummary || null,
    accessoryReservationLinkSummary: extra.accessoryReservationLinkSummary || null,
    emergencyMarkerPlacementSummary: extra.emergencyMarkerPlacementSummary || null,
    noCrossContainmentSummary: extra.noCrossContainmentSummary || null,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeText(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeText(diagnostic, "diagnostic"))
      : [],
    unsafeOutputsBlocked: extra.unsafeOutputsBlocked || {
      rawRowsBlocked: true,
      rawReservationGridBlocked: true,
      rawPayloadsBlocked: true,
      exactCoordinatesBlocked: true,
      exactElectricalValuesBlocked: true,
      donorInvocationBlocked: true,
      mechanicalDetailerInvocationBlocked: true,
      mutationBlocked: true,
      generationBlocked: true,
      routesBlocked: true,
      privateDataBlocked: true,
    },
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawReservationGridReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    rawUsersReturned: false,
    rawCrmReturned: false,
    rawContactsReturned: false,
    privatePathsReturned: false,
    exactCoordinatesReturned: false,
    exactBoundaryCoordinatesReturned: false,
    exactElectricalValuesReturned: false,
    donorEngineInvoked: false,
    mechanicalDetailerInvoked: false,
    donorMechanicalDetailerInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    physicalPlacementSummaryReady: false,
    blocker,
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function proofFrom(source) {
  const proof = firstPresent(source, [
    "safePlacementProofSummary",
    "sealedSafePlacementProofSummary",
    "physicalPlacementProofSummary",
    "safePhysicalPlacementProofSummary",
  ]);
  return isPlainObject(proof) ? proof : null;
}

function resolveFingerprints(source, proof) {
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || safeFingerprint(firstPresent(proof, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || safeFingerprint(firstPresent(proof, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!policyFingerprint) return { ok: false, blocker: "missing-policy-fingerprint", diagnostic: "A safe policy fingerprint is required before physical placement summary readiness." };
  if (!sourceFingerprint) return { ok: false, blocker: "missing-source-fingerprint", diagnostic: "A safe source fingerprint is required before physical placement summary readiness.", policyFingerprint };
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function resolveChainFingerprints(source, proof) {
  const link = isPlainObject(proof?.accessoryReservationLinkSummary) ? proof.accessoryReservationLinkSummary : {};
  const fingerprints = {
    accessoryReservationFingerprint: safeFingerprint(firstPresent(source, ["accessoryReservationFingerprint", "reservationFingerprint"]))
      || safeFingerprint(firstPresent(link, ["accessoryReservationFingerprint", "reservationFingerprint"])),
    boardFillInputFingerprint: safeFingerprint(firstPresent(source, ["boardFillInputFingerprint"])),
    boardFillFingerprint: safeFingerprint(firstPresent(source, ["boardFillFingerprint", "boardFillSummaryFingerprint"])),
    boardElectricalSummaryFingerprint: safeFingerprint(firstPresent(source, ["boardElectricalSummaryFingerprint", "boardElectricalFingerprint", "summaryFingerprint"])),
    driverSizerFingerprint: safeFingerprint(firstPresent(source, ["driverSizerFingerprint"])),
  };
  if (!fingerprints.accessoryReservationFingerprint) return { ok: false, blocker: "missing-accessory-reservation-link", diagnostic: "A safe accessory reservation link fingerprint is required." };
  if (!fingerprints.boardFillInputFingerprint) return { ok: false, blocker: "missing-board-fill-input-fingerprint", diagnostic: "A safe board-fill input fingerprint is required." };
  if (!fingerprints.boardFillFingerprint) return { ok: false, blocker: "missing-board-fill-fingerprint", diagnostic: "A safe board-fill chain fingerprint is required." };
  if (!fingerprints.boardElectricalSummaryFingerprint) return { ok: false, blocker: "missing-board-electrical-fingerprint", diagnostic: "A safe board-electrical summary fingerprint is required." };
  if (!fingerprints.driverSizerFingerprint) return { ok: false, blocker: "missing-driver-sizer-fingerprint", diagnostic: "A safe driver-sizer fingerprint is required." };
  return { ok: true, ...fingerprints };
}

function ensureProofReady(proof, sourceBacked, chainBacked) {
  if (!proof) return { ok: false, blocker: "missing-safe-placement-proof-marker", diagnostic: "A sealed safe placement proof summary is required." };
  const marker = safeToken(firstPresent(proof, ["safePlacementProofMarker", "placementProofMarker", "proofMarker"]), "");
  if (!SAFE_PROOF_MARKERS.has(marker)) {
    return { ok: false, blocker: "missing-safe-placement-proof-marker", diagnostic: "Safe physical placement proof marker is missing or unsupported." };
  }
  if (proof.placeholderOnly === true || proof.syntheticFixtureOnly === true || proof.fixtureOnly === true) {
    return { ok: false, blocker: "placeholder-only-placement-not-approved", diagnostic: "Placeholder or synthetic fixture-only placement cannot be projected as source-backed physical placement evidence." };
  }
  if (sourceBacked !== true) return { ok: false, blocker: "missing-source-backed-placement-proof", diagnostic: "Safe physical placement summary requires source-backed proof." };
  if (chainBacked !== true) return { ok: false, blocker: "missing-chain-backed-placement-proof", diagnostic: "Safe physical placement summary requires chain-backed proof." };
  return { ok: true, marker };
}

function objectFrom(proof, keys) {
  const value = firstPresent(proof, keys);
  return isPlainObject(value) ? value : {};
}

function buildBoardPlacementBandSummary(proof, chain) {
  const board = objectFrom(proof, ["boardPlacementBandSummary", "boardPlacementSummary"]);
  return {
    summaryType: "safe-board-placement-band-summary",
    boardPlacementCountBand: safeText(firstPresent(board, ["boardPlacementCountBand", "placementCountBand", "boardCountBand"]), "unknown"),
    boardPlacementLengthBands: safeArray(firstPresent(board, ["boardPlacementLengthBands", "placementLengthBands", "boardLengthBands"])),
    boardPlacementSpanBand: safeText(firstPresent(board, ["boardPlacementSpanBand", "spanBand", "runSpanBand"]), "unknown"),
    placementCategoryTokens: safeRefArray(firstPresent(board, ["placementCategoryTokens", "placementCategories", "categoryTokens"])),
    boardRefs: safeRefArray(firstPresent(board, ["boardRefs", "opaqueBoardRefs", "refs"])),
    boardFillFingerprint: chain.boardFillFingerprint,
    rawBoardRowsReturned: false,
    exactCoordinatesReturned: false,
  };
}

function buildSegmentBoundaryBandSummary(proof) {
  const segment = objectFrom(proof, ["segmentBoundaryBandSummary", "segmentBoundarySummary"]);
  return {
    summaryType: "safe-segment-boundary-band-summary",
    segmentBoundaryCountBand: safeText(firstPresent(segment, ["segmentBoundaryCountBand", "boundaryCountBand"]), "unknown"),
    segmentSpanBands: safeArray(firstPresent(segment, ["segmentSpanBands", "spanBands"])),
    segmentRefs: safeRefArray(firstPresent(segment, ["segmentRefs", "opaqueSegmentRefs", "refs"])),
    boundarySource: safeToken(firstPresent(segment, ["boundarySource", "segmentBoundarySource"]), "safe-boundary-band-proof"),
    exactBoundaryCoordinatesReturned: false,
  };
}

function buildReservedRangeBandSummary(proof) {
  const reserved = objectFrom(proof, ["reservedRangeBandSummary", "reservedRangeSummary"]);
  return {
    summaryType: "safe-reserved-range-band-summary",
    reservedRangeCountBand: safeText(firstPresent(reserved, ["reservedRangeCountBand", "rangeCountBand"]), "unknown"),
    reservedRangeLengthBands: safeArray(firstPresent(reserved, ["reservedRangeLengthBands", "rangeLengthBands"])),
    reservedRangeSpanBand: safeText(firstPresent(reserved, ["reservedRangeSpanBand", "rangeSpanBand"]), "unknown"),
    reservedRangeRefs: safeRefArray(firstPresent(reserved, ["reservedRangeRefs", "opaqueReservedRangeRefs", "refs"])),
    reservationPolicyToken: safeToken(firstPresent(reserved, ["reservationPolicyToken", "policyToken"]), "safe-reservation-policy"),
    rawReservationGridReturned: false,
    exactCoordinatesReturned: false,
  };
}

function buildAccessoryReservationLinkSummary(proof, chain) {
  const link = objectFrom(proof, ["accessoryReservationLinkSummary", "reservationLinkSummary"]);
  return {
    summaryType: "safe-accessory-reservation-link-summary",
    accessoryReservationLinked: link.accessoryReservationLinked === true,
    reservationIntentRef: safeToken(firstPresent(link, ["reservationIntentRef", "intentRef", "reservationRef"]), "safe-accessory-reservation-intent"),
    accessoryReservationFingerprint: chain.accessoryReservationFingerprint,
    boardFillInputFingerprint: chain.boardFillInputFingerprint,
    rawAccessoryRowsReturned: false,
    rawReservationGridReturned: false,
  };
}

function buildEmergencyMarkerPlacementSummary(proof) {
  const emergency = objectFrom(proof, ["emergencyMarkerPlacementSummary", "emergencyPlacementSummary"]);
  return {
    summaryType: "safe-emergency-marker-placement-summary",
    emergencyMarkerCountBand: safeText(firstPresent(emergency, ["emergencyMarkerCountBand", "markerCountBand"]), "0"),
    emergencyPlacementCategoryTokens: safeRefArray(firstPresent(emergency, ["emergencyPlacementCategoryTokens", "placementCategoryTokens"])),
    emergencyZoneRefs: safeRefArray(firstPresent(emergency, ["emergencyZoneRefs", "zoneRefs"])),
    physicalHardwarePlacementReturned: false,
    complianceApproved: false,
    exactCoordinatesReturned: false,
  };
}

function buildNoCrossContainmentSummary(proof) {
  const containment = objectFrom(proof, ["noCrossContainmentSummary", "noCrossZoneContainmentSummary"]);
  return {
    summaryType: "safe-no-cross-containment-summary",
    noCrossContainmentProven: containment.noCrossContainmentProven === true,
    zonesCrossSegmentJoin: false,
    crossJoinZoneCountBand: "0",
    zoneCountBand: safeText(firstPresent(containment, ["zoneCountBand", "containedZoneCountBand"]), "unknown"),
    zoneRefs: safeRefArray(firstPresent(containment, ["zoneRefs", "opaqueZoneRefs", "refs"])),
    exactBoundaryCoordinatesReturned: false,
  };
}

export function buildRuntimeSafePhysicalPlacementSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const topLevelUnsafe = unsafeInputBlocker({
    ...source,
    safePlacementProofSummary: undefined,
    sealedSafePlacementProofSummary: undefined,
    physicalPlacementProofSummary: undefined,
    safePhysicalPlacementProofSummary: undefined,
  });
  if (topLevelUnsafe) return failClosed(topLevelUnsafe, "Input contains unsafe raw rows, exact coordinates, exact electrical values, private data, payloads, side effects, or generation markers.");

  const proof = proofFrom(source);
  const proofUnsafe = unsafeInputBlocker(proof);
  if (proofUnsafe) return failClosed(proofUnsafe, "Safe placement proof contains unsafe raw rows, exact coordinates, exact electrical values, private data, payloads, or generation markers.");

  const fingerprints = resolveFingerprints(source, proof);
  if (!fingerprints.ok) return failClosed(fingerprints.blocker, fingerprints.diagnostic, fingerprints);
  const { policyFingerprint, sourceFingerprint } = fingerprints;

  const chain = resolveChainFingerprints(source, proof);
  if (!chain.ok) return failClosed(chain.blocker, chain.diagnostic, { policyFingerprint, sourceFingerprint });

  const sourceBacked = source.sourceBacked === true || proof?.sourceBacked === true;
  const chainBacked = source.chainBacked === true || proof?.chainBacked === true;
  const proofReady = ensureProofReady(proof, sourceBacked, chainBacked);
  if (!proofReady.ok) return failClosed(proofReady.blocker, proofReady.diagnostic, { policyFingerprint, sourceFingerprint });

  const accessoryLink = objectFrom(proof, ["accessoryReservationLinkSummary", "reservationLinkSummary"]);
  if (accessoryLink.accessoryReservationLinked !== true) {
    return failClosed("missing-accessory-reservation-link", "Safe placement proof must be linked to the accessory reservation summary.", { policyFingerprint, sourceFingerprint });
  }

  const noCrossInput = objectFrom(proof, ["noCrossContainmentSummary", "noCrossZoneContainmentSummary"]);
  if (noCrossInput.noCrossContainmentProven !== true || noCrossInput.zonesCrossSegmentJoin === true) {
    return failClosed("missing-no-cross-containment-proof", "Safe placement proof must include sealed no-cross containment proof.", { policyFingerprint, sourceFingerprint });
  }

  const boardPlacementBandSummary = buildBoardPlacementBandSummary(proof, chain);
  const segmentBoundaryBandSummary = buildSegmentBoundaryBandSummary(proof);
  const reservedRangeBandSummary = buildReservedRangeBandSummary(proof);
  const accessoryReservationLinkSummary = buildAccessoryReservationLinkSummary(proof, chain);
  const emergencyMarkerPlacementSummary = buildEmergencyMarkerPlacementSummary(proof);
  const noCrossContainmentSummary = buildNoCrossContainmentSummary(proof);

  const placementSummaryFingerprint = `safe-physical-placement:${stableSha1({
    schemaId: RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_SAFE_PHYSICAL_PLACEMENT_SUMMARY_SCHEMA_VERSION,
    policyFingerprint,
    sourceFingerprint,
    proofMarker: proofReady.marker,
    chain,
    boardPlacementBandSummary,
    segmentBoundaryBandSummary,
    reservedRangeBandSummary,
    accessoryReservationLinkSummary,
    emergencyMarkerPlacementSummary,
    noCrossContainmentSummary,
  })}`;

  return safetyBase({
    ok: true,
    physicalPlacementSummaryReady: true,
    sourceBacked: true,
    chainBacked: true,
    policyFingerprint,
    sourceFingerprint,
    placementSummaryFingerprint,
    boardPlacementBandSummary,
    segmentBoundaryBandSummary,
    reservedRangeBandSummary,
    accessoryReservationLinkSummary,
    emergencyMarkerPlacementSummary,
    noCrossContainmentSummary,
    warnings: [
      "Safe physical placement summary exposes only bands, opaque refs, booleans, and fingerprints; exact placement and boundary coordinates remain blocked.",
      "Reserved ranges are represented as safe count/span/length bands only; raw reservation grids remain blocked.",
    ],
    failClosedDiagnostics: [],
  });
}

export const buildSafePhysicalPlacementSummary = buildRuntimeSafePhysicalPlacementSummary;
export const buildEngineRunTableSafePhysicalPlacementSummary = buildRuntimeSafePhysicalPlacementSummary;
