import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.runtable-domain-output-scaffold-summary";
export const ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_STATE =
  "runtime_runtable_domain_output_scaffold_diagnostic_only";

export const ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  sealedCandidateAssemblyPreviewRequired: true,
  gateDValidationScaffoldRequired: true,
  donorEngineInvoked: false,
  donorEngineInvocationEnabled: false,
  donorEnginePayloadAssemblyEnabled: false,
  productionRunTableGenerationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  drawingGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawDriverRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawSelectorPayloadReturned: false,
  rawEnginePayloadReturned: false,
  exactElectricalValuesReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,460}$/;

const SUMMARY_SPECS = Object.freeze([
  {
    key: "sealedCandidateAssemblyPreviewSummary",
    label: "sealed candidate assembly preview summary",
    missing: "missing-sealed-candidate-assembly-preview-summary",
    unsafe: "unsafe-sealed-candidate-assembly-preview-summary",
    notReady: "sealed-candidate-assembly-preview-not-ready",
    readyKey: "sealedCandidateAssemblyPreviewReady",
    fingerprintKeys: ["sealedCandidateAssemblyPreviewFingerprint"],
  },
  {
    key: "gateDValidationScaffoldSummary",
    label: "Gate D validation scaffold summary",
    missing: "missing-gate-d-validation-scaffold-summary",
    unsafe: "unsafe-upstream-summary",
    notReady: "gate-d-validation-scaffold-not-ready",
    readyKey: "gateDScaffoldReady",
    fingerprintKeys: ["gateDValidationScaffoldFingerprint"],
  },
  {
    key: "emergencyZonePickerFootholdSummary",
    label: "emergency zone picker foothold summary",
    missing: "missing-upstream-summary",
    unsafe: "unsafe-upstream-summary",
    readyKey: "emergencyZonePickerReady",
    fingerprintKeys: ["emergencyZonePickerFingerprint"],
  },
  {
    key: "zoneValidationFootholdSummary",
    label: "zone validation foothold summary",
    missing: "missing-upstream-summary",
    unsafe: "unsafe-upstream-summary",
    readyKey: "zoneValidationFootholdReady",
    fingerprintKeys: ["zoneValidationFootholdFingerprint"],
  },
  {
    key: "segmentZoneBridgeSummary",
    label: "sealed segment-zone bridge summary",
    missing: "missing-upstream-summary",
    unsafe: "unsafe-upstream-summary",
    readyKey: "segmentZoneBridgeReady",
    fingerprintKeys: ["segmentZoneBridgeFingerprint"],
  },
  {
    key: "driverSizerSummary",
    label: "driver sizer summary",
    missing: "missing-upstream-summary",
    unsafe: "unsafe-upstream-summary",
    readyKey: "driverSizerReady",
    fingerprintKeys: ["driverSizerFingerprint"],
  },
  {
    key: "boardElectricalSummary",
    label: "board electrical summary",
    missing: "missing-upstream-summary",
    unsafe: "unsafe-upstream-summary",
    readyKey: "electricalSummaryReady",
    fingerprintKeys: ["boardElectricalSummaryFingerprint", "boardElectricalFingerprint", "summaryFingerprint"],
  },
  {
    key: "boardFillSummary",
    label: "board-fill summary",
    missing: "missing-upstream-summary",
    unsafe: "unsafe-upstream-summary",
    fingerprintKeys: ["boardFillFingerprint", "summaryFingerprint"],
  },
  {
    key: "accessoryReservationSummary",
    label: "accessory reservation summary",
    missing: "missing-upstream-summary",
    unsafe: "unsafe-upstream-summary",
    readyKey: "accessoryReservationReady",
    fingerprintKeys: ["accessoryReservationFingerprint", "reservationFingerprint", "summaryFingerprint"],
  },
]);

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:rawProductRowsReturned|rawProductRowsExposed|rawProductDataRowsExposed|rawRowsReturned|rawRowsExposed|rawComponentRowsReturned)$/i, "raw-product-rows-not-approved"],
  [/^(?:rawBoardRowsReturned|rawBoardRowsExposed|rawReservationGridReturned|rawReservationCellsReturned|rawBoardDataRowsExposed)$/i, "raw-board-rows-not-approved"],
  [/^(?:rawDriverRowsReturned|rawDriverRowsExposed|rawDriverUtilPayloadReturned|rawCurveRowsReturned|rawCurvePointsReturned)$/i, "raw-driver-rows-not-approved"],
  [/^(?:rawAccessoryRowsReturned|rawAccessoryRowsExposed|rawAccessoryPayloadReturned|accessoryCatalogRowsReturned)$/i, "raw-accessory-rows-not-approved"],
  [/^(?:rawSelectorPayloadReturned|rawSelectorPayloadExposed|selectorPayloadReturned|selectorPayloadExposed|payloadGenerationEnabled|downstreamPayloadActive)$/i, "raw-selector-payload-not-approved"],
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|enginePayloadReturned|enginePayloadExposed|enginePayloadIncluded|rawEmergencyPayloadReturned|rawEmergencyPayloadExposed|roughElectricalPayloadAssemblyEnabled|donorEnginePayloadAssemblyEnabled)$/i, "raw-engine-payload-not-approved"],
  [/^(?:exactElectricalValuesReturned|exactElectricalValuesExposed|exactElectricalValueReturned|exactElectricalValueExposed|exactVoltageReturned|exactPowerReturned|exactCurrentReturned)$/i, "exact-electrical-values-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineCallsActive)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAuthority|boardDataMutationEnabled|authorityWritesActive|activeBuildMutationEnabled|buildMutationEnabled)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled|saveLoadActive|hiddenWriteBackEnabled)$/i, "selected-result-persistence-not-approved"],
  [/^(?:productionRunTableGenerated|productionRunTableGenerationEnabled|runTableGenerated|runtableGenerated|runTableGenerationEnabled|runTableMutationEnabled)$/i, "production-runtable-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled|photometryGenerationAllowed|photometryGenerationEnabled|iesCallsActive)$/i, "ies-generation-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "route-or-post-endpoint-not-approved"],
]);

const RAW_KEY_BLOCKERS = Object.freeze([
  [/^(?:PRODUCTS?|rawProducts?|rawProductRows|productRows|componentRows|rawComponentRows|SYSTEM_COMPONENTS)$/i, "raw-product-rows-not-approved"],
  [/^(?:BOARDS?|rawBoards?|rawBoardRows|boardRows|rawReservationGrid|reservationGrid|reservedGrid|rawReservedGrid|reservationCells|rawReservationCells|boardDataRows)$/i, "raw-board-rows-not-approved"],
  [/^(?:DRIVERS?|rawDrivers?|rawDriverRows|driverRows|driverUtilPayload|rawDriverUtilPayload|curveRows|rawCurveRows|curvePoints|rawCurvePoints)$/i, "raw-driver-rows-not-approved"],
  [/^(?:ACCESSORIES|rawAccessories|rawAccessoryRows|accessoryRows|accessoryCatalogRows|rawAccessoryPayload|accessoryPayload)$/i, "raw-accessory-rows-not-approved"],
  [/^(?:selectorPayload|rawSelectorPayload|selectorEnginePayload|payloadDraft)$/i, "raw-selector-payload-not-approved"],
  [/^(?:enginePayload|rawEnginePayload|runEnginePayload|roughElectricalPayload|rawRoughElectricalPayload|donorPayload|rawDonorPayload|emergencyPayload|rawEmergencyPayload)$/i, "raw-engine-payload-not-approved"],
]);

const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|filepath|sourcePath|donorPath|runtimeDataPath|privatePath|path)$/i;

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
  return cleaned ? cleaned.slice(0, 160) : fallback;
}

function safeToken(value, fallback = "") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
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

function toNonNegativeInteger(value) {
  const parsed = toFiniteNumber(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return Number.isInteger(rounded) && rounded >= 0 ? rounded : null;
}

function toPositiveInteger(value) {
  const parsed = toFiniteNumber(value);
  if (!Number.isFinite(parsed)) return null;
  const rounded = Math.round(parsed);
  return Number.isInteger(rounded) && rounded > 0 ? rounded : null;
}

function lengthBand(value) {
  const mm = toNonNegativeInteger(value);
  if (mm === null) return "unresolved";
  if (mm === 0) return "0mm";
  if (mm <= 499) return "1-499mm";
  if (mm <= 999) return "500-999mm";
  if (mm <= 1999) return "1000-1999mm";
  if (mm <= 3999) return "2000-3999mm";
  if (mm <= 7999) return "4000-7999mm";
  return "8000mm-plus";
}

function countBand(value) {
  const count = toNonNegativeInteger(value);
  if (count === null) return "unresolved";
  if (count === 0) return "0";
  if (count === 1) return "1";
  if (count <= 3) return "2-3";
  if (count <= 8) return "4-8";
  if (count <= 20) return "9-20";
  return "21-plus";
}

function incrementBucket(target, rawKey, rawValue = 1) {
  const key = safeToken(rawKey, "unresolved");
  const count = toNonNegativeInteger(rawValue) ?? 0;
  target[key] = (target[key] || 0) + count;
}

function bucketArray(values, keyResolver) {
  const buckets = {};
  for (const value of Array.isArray(values) ? values : []) {
    incrementBucket(buckets, keyResolver(value));
  }
  return buckets;
}

function sanitiseBuckets(value) {
  const buckets = {};
  if (!isPlainObject(value)) return buckets;
  for (const [key, count] of Object.entries(value)) incrementBucket(buckets, key, count);
  return buckets;
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 9) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "unsafe-upstream-summary" : null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const blocker = unsafeBlocker(item, depth + 1, seen);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    for (const [pattern, blocker] of RAW_KEY_BLOCKERS) {
      if (pattern.test(key) && nested !== false && nested !== null && nested !== undefined) return blocker;
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "unsafe-upstream-summary";
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function summaryFingerprint(summary, spec = {}) {
  if (!isPlainObject(summary)) return null;
  const fingerprint = safeFingerprint(firstPresent(summary, [
    ...(Array.isArray(spec.fingerprintKeys) ? spec.fingerprintKeys : []),
    "sealedCandidateAssemblyPreviewFingerprint",
    "gateDValidationScaffoldFingerprint",
    "emergencyZonePickerFingerprint",
    "zoneValidationFootholdFingerprint",
    "segmentZoneBridgeFingerprint",
    "driverSizerFingerprint",
    "boardFillFingerprint",
    "accessoryReservationFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]));
  return fingerprint || null;
}

function policyFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
}

function sourceFingerprintFrom(summary) {
  return safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function resolveFingerprints(source) {
  const sealedCandidateAssemblyPreviewSummary = firstPresent(source, ["sealedCandidateAssemblyPreviewSummary"]);
  const gateDValidationScaffoldSummary = firstPresent(source, ["gateDValidationScaffoldSummary"]);
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || policyFingerprintFrom(sealedCandidateAssemblyPreviewSummary)
    || policyFingerprintFrom(gateDValidationScaffoldSummary);
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || sourceFingerprintFrom(sealedCandidateAssemblyPreviewSummary)
    || sourceFingerprintFrom(gateDValidationScaffoldSummary);
  if (!policyFingerprint || !sourceFingerprint) {
    return {
      ok: false,
      blocker: "fingerprint-mismatch",
      diagnostic: "Safe policy and source fingerprints are required before RunTable domain output diagnostics.",
      policyFingerprint: policyFingerprint || null,
      sourceFingerprint: sourceFingerprint || null,
    };
  }
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function buildUpstreamFingerprints(source) {
  return Object.fromEntries(SUMMARY_SPECS.map((spec) => [
    spec.key,
    summaryFingerprint(source[spec.key], spec),
  ]));
}

function readinessForSummary(summary, spec, policyFingerprint, sourceFingerprint) {
  const ownPolicy = policyFingerprintFrom(summary);
  const ownSource = sourceFingerprintFrom(summary);
  const ready = spec.readyKey ? summary?.[spec.readyKey] === true : summary?.ok === true;
  return {
    present: isPlainObject(summary),
    ok: summary?.ok === true,
    diagnosticOnly: summary?.diagnosticOnly === true,
    nativeRuntimeKernel: summary?.nativeRuntimeKernel === true,
    readyKey: spec.readyKey || null,
    ready,
    fingerprintMatched: Boolean(ownPolicy && ownSource && ownPolicy === policyFingerprint && ownSource === sourceFingerprint),
    summaryFingerprint: summaryFingerprint(summary, spec),
    safeSummaryOnly: true,
  };
}

function buildUpstreamReadiness(source, policyFingerprint, sourceFingerprint) {
  return Object.fromEntries(SUMMARY_SPECS.map((spec) => [
    spec.key,
    readinessForSummary(source[spec.key], spec, policyFingerprint, sourceFingerprint),
  ]));
}

function blockedProductionOutputSummary(blocker = null) {
  return {
    diagnosticOnly: true,
    blocked: true,
    blocker,
    productionRunTableReady: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    donorEnginePayloadAssemblyBlocked: true,
    donorEngineInvocationBlocked: true,
    selectedResultPersistenceBlocked: true,
    iesGenerationBlocked: true,
    drawingGenerationBlocked: true,
    exactElectricalOutputBlocked: true,
    rawPayloadOutputBlocked: true,
    routeAdditionBlocked: true,
    postEndpointAdditionBlocked: true,
    reason: blocker || "diagnostic-domain-readiness-only-production-runtable-output-blocked",
  };
}

function baseSummary(extra = {}) {
  const ok = extra.ok === true;
  const blocker = extra.blocker || null;
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok,
    blocker,
    runTableDomainOutputScaffoldReady: ok,
    runTableDomainReadinessSummary: extra.runTableDomainReadinessSummary || {
      diagnosticOnly: true,
      runTableDomainOutputScaffoldReady: false,
      domainOutputReady: false,
      productionRunTableReady: false,
      reason: blocker || "runtable-domain-output-scaffold-not-ready",
    },
    safeRunDomainSummary: extra.safeRunDomainSummary || null,
    safeBoardDomainSummary: extra.safeBoardDomainSummary || null,
    safeDriverDomainSummary: extra.safeDriverDomainSummary || null,
    safeZoneDomainSummary: extra.safeZoneDomainSummary || null,
    safeAccessoryDomainSummary: extra.safeAccessoryDomainSummary || null,
    blockedProductionOutputSummary: extra.blockedProductionOutputSummary || blockedProductionOutputSummary(blocker),
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    upstreamFingerprints: isPlainObject(extra.upstreamFingerprints) ? extra.upstreamFingerprints : {},
    runTableDomainOutputScaffoldFingerprint: extra.runTableDomainOutputScaffoldFingerprint || null,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    exactElectricalValuesReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseSummary({
    ...extra,
    ok: false,
    blocker,
    blockedProductionOutputSummary: blockedProductionOutputSummary(blocker),
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function validateSummary(spec, summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} is required.` };
  }
  const unsafe = unsafeBlocker(summary);
  if (unsafe) {
    return { ok: false, blocker: unsafe, diagnostic: `${spec.label} contains unsafe raw rows, raw payloads, exact electrical values, paths, generation, persistence, routes, endpoints, donor Engine, or mutation markers.` };
  }
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: spec.unsafe, diagnostic: `${spec.label} must be ok, diagnostic-only, runtime-native, and safe.` };
  }
  const ownPolicy = policyFingerprintFrom(summary);
  const ownSource = sourceFingerprintFrom(summary);
  if (!ownPolicy || !ownSource || ownPolicy !== policyFingerprint || ownSource !== sourceFingerprint) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${spec.label} fingerprint does not match the RunTable domain output scaffold fingerprints.` };
  }
  if (spec.readyKey && summary[spec.readyKey] !== true) {
    return { ok: false, blocker: spec.notReady || spec.unsafe, diagnostic: `${spec.label} is not ready: ${spec.readyKey} is not true.` };
  }
  return { ok: true };
}

function buildSafeRunDomainSummary(sealedCandidateAssemblyPreviewSummary) {
  const runIntake = sealedCandidateAssemblyPreviewSummary?.selectorSafeInputSummary?.runIntake || {};
  const runs = Array.isArray(runIntake.runs) ? runIntake.runs : [];
  return {
    diagnosticOnly: true,
    runIntakePreviewReady: runIntake.runIntakePreviewReady === true,
    runCount: toNonNegativeInteger(runIntake.runCount) ?? runs.length,
    totalQuantity: toNonNegativeInteger(runIntake.totalQuantity) ?? 0,
    runCountBand: countBand(toNonNegativeInteger(runIntake.runCount) ?? runs.length),
    totalQuantityBand: countBand(toNonNegativeInteger(runIntake.totalQuantity) ?? 0),
    lengthModeBuckets: bucketArray(runs, (run) => firstPresent(run, ["lengthMode", "mode"])),
    runLengthBandBuckets: bucketArray(runs, (run) => firstPresent(run, ["runLengthBand"]) || lengthBand(firstPresent(run, ["runLengthMm", "lengthMm"]))),
    safePreviewRunSummaries: runs.slice(0, 20).map((run, index) => ({
      runNumber: toPositiveInteger(firstPresent(run, ["runNumber", "number"])) ?? index + 1,
      label: safeLabel(firstPresent(run, ["label", "runLabel"]), `Run ${index + 1}`),
      quantity: toNonNegativeInteger(firstPresent(run, ["quantity", "qty"])) ?? 0,
      runLengthBand: safeLabel(firstPresent(run, ["runLengthBand"]), lengthBand(firstPresent(run, ["runLengthMm", "lengthMm"]))),
      lengthMode: safeToken(firstPresent(run, ["lengthMode", "mode"]), "unresolved"),
      safePreviewOnly: true,
      enginePayloadIncluded: false,
      runTableIncluded: false,
      iesIncluded: false,
    })),
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
  };
}

function buildSafeBoardDomainSummary(boardFillSummary, boardElectricalSummary, segmentZoneBridgeSummary) {
  const frozen = segmentZoneBridgeSummary?.frozenSegmentSummary || {};
  const boardCount = toNonNegativeInteger(firstPresent(boardFillSummary, ["boardCount"]))
    ?? toNonNegativeInteger(firstPresent(frozen, ["boardPlacementCount"]));
  return {
    diagnosticOnly: true,
    boardFillReady: boardFillSummary?.ok === true,
    boardElectricalReady: boardElectricalSummary?.electricalSummaryReady === true,
    boardCount: boardCount ?? 0,
    boardCountBand: countBand(boardCount ?? 0),
    boardFamilyStatus: safeLabel(firstPresent(boardFillSummary, ["selectedBoardFamily", "boardFamily", "boardFamilyStatus"]), "safe-board-family-summary"),
    runLengthBand: safeLabel(firstPresent(frozen, ["runLengthBand"]), "unresolved"),
    activeLedLengthBand: safeLabel(firstPresent(frozen, ["activeLedLengthBand"]), "unresolved"),
    segmentBoundaryStatus: frozen.segmentBoundariesAtBoardEndsOnly !== false && frozen.noBoardCrossesFrozenSegmentBoundary !== false
      ? "sealed-board-end-boundaries"
      : "unresolved",
    voltageClass: safeLabel(firstPresent(boardElectricalSummary, ["boardVoltageClass", "voltageClass"]), "safe-voltage-band-unresolved"),
    powerClass: safeLabel(firstPresent(boardElectricalSummary, ["boardPowerClass", "powerClass"]), "safe-power-band-unresolved"),
    exactElectricalValuesReturned: false,
    rawBoardRowsReturned: false,
  };
}

function buildSafeDriverDomainSummary(driverSizerSummary) {
  const selected = isPlainObject(driverSizerSummary?.selectedDriverSummary) ? driverSizerSummary.selectedDriverSummary : {};
  return {
    diagnosticOnly: true,
    driverSizerReady: driverSizerSummary?.driverSizerReady === true,
    driverCandidateCount: toNonNegativeInteger(firstPresent(driverSizerSummary, ["driverCandidateCount"])),
    compatibleDriverCandidateCount: toNonNegativeInteger(firstPresent(driverSizerSummary, ["compatibleDriverCandidateCount"])),
    zoneCountCandidate: toPositiveInteger(firstPresent(driverSizerSummary, ["zoneCountCandidate"]) ?? firstPresent(selected, ["zoneCountCandidate"])),
    currentRangeStatus: safeLabel(firstPresent(driverSizerSummary, ["currentRangeStatus"]), "safe-current-range-unresolved"),
    utilisationBand: safeLabel(firstPresent(driverSizerSummary, ["utilisationBand"]), "unresolved"),
    capacityBand: safeLabel(firstPresent(driverSizerSummary, ["capacityBand"]), "unresolved"),
    limitingFactorCategory: safeLabel(firstPresent(driverSizerSummary, ["limitingFactorCategory"]) ?? firstPresent(selected, ["limitingFactorCategory"]), "unresolved"),
    selectedDriverSafeToken: safeToken(firstPresent(selected, ["safeModelToken", "safeDriverToken", "modelToken"]), "unresolved"),
    exactElectricalValuesReturned: false,
    rawDriverRowsReturned: false,
  };
}

function buildSafeZoneDomainSummary(segmentZoneBridgeSummary, zoneValidationFootholdSummary, emergencyZonePickerFootholdSummary) {
  const containment = segmentZoneBridgeSummary?.noCrossZoneContainmentSummary || {};
  const validation = zoneValidationFootholdSummary?.validationReadiness || {};
  const emergencySelected = emergencyZonePickerFootholdSummary?.selectedZoneIntentSummary || {};
  const zoneCount = toNonNegativeInteger(firstPresent(containment, ["zoneCount", "containedZoneCount"]))
    ?? toNonNegativeInteger(firstPresent(zoneValidationFootholdSummary, ["zoneCountCandidate"]));
  return {
    diagnosticOnly: true,
    segmentZoneBridgeReady: segmentZoneBridgeSummary?.segmentZoneBridgeReady === true,
    zoneValidationFootholdReady: zoneValidationFootholdSummary?.zoneValidationFootholdReady === true,
    emergencyZonePickerReady: emergencyZonePickerFootholdSummary?.emergencyZonePickerReady === true,
    zoneCount: zoneCount ?? 0,
    zoneCountBand: countBand(zoneCount ?? 0),
    containedZoneCount: toNonNegativeInteger(firstPresent(containment, ["containedZoneCount"])),
    crossJoinZoneCount: toNonNegativeInteger(firstPresent(containment, ["crossJoinZoneCount"])) ?? 0,
    zonesCrossSegmentJoin: containment.zonesCrossSegmentJoin === true ? false : false,
    containmentMode: safeLabel(firstPresent(containment, ["containmentMode"]), "sealed-no-cross-containment"),
    noCrossValidationReady: validation.noCrossValidationReady === true,
    emergencySelectedZoneCount: toNonNegativeInteger(firstPresent(emergencySelected, ["selectedZoneCount"])) ?? 0,
    emergencyType: safeToken(firstPresent(emergencySelected, ["emergencyType"]), "marker-only"),
    zoneAssociationMode: safeLabel(firstPresent(emergencySelected, ["zoneAssociationMode"]), "diagnostic-intent-associated-to-sealed-no-cross-zones"),
    fullZoneSolverInvoked: false,
    gateDValidationInvoked: false,
    rawEnginePayloadReturned: false,
  };
}

function buildSafeAccessoryDomainSummary(accessoryReservationSummary, sealedCandidateAssemblyPreviewSummary) {
  const reservationIntent = isPlainObject(accessoryReservationSummary?.accessoryPlacementIntentSummary)
    ? accessoryReservationSummary.accessoryPlacementIntentSummary
    : {};
  const selectorIntent = sealedCandidateAssemblyPreviewSummary?.selectorSafeInputSummary?.accessoryPlacementIntent || {};
  return {
    diagnosticOnly: true,
    accessoryReservationReady: accessoryReservationSummary?.accessoryReservationReady === true,
    boardFillInputReady: accessoryReservationSummary?.boardFillInputReady === true,
    accessoryIntentCount: toNonNegativeInteger(firstPresent(selectorIntent, ["accessoryIntentCount"]) ?? firstPresent(reservationIntent, ["requestCount"])),
    runsWithAccessoryIntentCount: toNonNegativeInteger(firstPresent(selectorIntent, ["runsWithAccessoryIntentCount"])),
    unresolvedAccessoryIntentCount: toNonNegativeInteger(firstPresent(selectorIntent, ["unresolvedAccessoryIntentCount"])) ?? 0,
    requestedAccessoryTypeBuckets: sanitiseBuckets(firstPresent(reservationIntent, ["requestedAccessoryTypeBuckets", "accessoryTypeBuckets"])),
    placementIntentBuckets: sanitiseBuckets(firstPresent(reservationIntent, ["placementIntentBuckets"])),
    physicalPlacementReturned: false,
    rawAccessoryRowsReturned: false,
  };
}

function buildRunTableDomainReadinessSummary({
  source,
  policyFingerprint,
  sourceFingerprint,
  upstreamReadinessSummary,
  safeRunDomainSummary,
  safeBoardDomainSummary,
  safeDriverDomainSummary,
  safeZoneDomainSummary,
  safeAccessoryDomainSummary,
}) {
  return {
    diagnosticOnly: true,
    runTableDomainOutputScaffoldReady: true,
    domainOutputReady: true,
    runDomainReady: true,
    boardDomainReady: true,
    driverDomainReady: true,
    zoneDomainReady: true,
    accessoryDomainReady: true,
    gateDScaffoldReady: source.gateDValidationScaffoldSummary?.gateDScaffoldReady === true,
    sealedCandidateAssemblyPreviewReady: source.sealedCandidateAssemblyPreviewSummary?.sealedCandidateAssemblyPreviewReady === true,
    requiredSummaryCount: SUMMARY_SPECS.length,
    presentSafeSummaryCount: Object.values(upstreamReadinessSummary).filter((item) => item.present && item.ok && item.diagnosticOnly && item.nativeRuntimeKernel && item.fingerprintMatched).length,
    fingerprintsMatched: Object.values(upstreamReadinessSummary).every((item) => item.fingerprintMatched === true),
    policyFingerprint,
    sourceFingerprint,
    safeCounts: {
      runCount: safeRunDomainSummary.runCount,
      boardCount: safeBoardDomainSummary.boardCount,
      zoneCount: safeZoneDomainSummary.zoneCount,
      emergencySelectedZoneCount: safeZoneDomainSummary.emergencySelectedZoneCount,
      accessoryIntentCount: safeAccessoryDomainSummary.accessoryIntentCount ?? 0,
      compatibleDriverCandidateCount: safeDriverDomainSummary.compatibleDriverCandidateCount,
    },
    productionRunTableReady: false,
    donorEngineReady: false,
    donorEnginePayloadReady: false,
    selectedResultPersistenceReady: false,
    iesReady: false,
    routesReady: false,
    postEndpointsReady: false,
    reason: "safe-domain-readiness-only-production-runtable-output-blocked",
  };
}

export function buildRuntimeRunTableDomainOutputScaffoldSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const fingerprintValidation = resolveFingerprints(source);
  const policyFingerprint = fingerprintValidation.policyFingerprint
    || safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]))
    || null;
  const sourceFingerprint = fingerprintValidation.sourceFingerprint
    || safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]))
    || null;
  const upstreamFingerprints = buildUpstreamFingerprints(source);

  const unsafe = unsafeBlocker(source);
  if (unsafe) {
    return failClosed(unsafe, "RunTable domain output scaffold input contains unsafe raw rows, raw payloads, exact electrical values, donor Engine, generation, persistence, route, endpoint, private path, or mutation markers.", {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  if (!fingerprintValidation.ok) {
    return failClosed(fingerprintValidation.blocker, fingerprintValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  const sealedSpec = SUMMARY_SPECS[0];
  const sealedValidation = validateSummary(sealedSpec, source.sealedCandidateAssemblyPreviewSummary, policyFingerprint, sourceFingerprint);
  if (!sealedValidation.ok) {
    return failClosed(sealedValidation.blocker, sealedValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  const gateDSpec = SUMMARY_SPECS[1];
  const gateDValidation = validateSummary(gateDSpec, source.gateDValidationScaffoldSummary, policyFingerprint, sourceFingerprint);
  if (!gateDValidation.ok) {
    return failClosed(gateDValidation.blocker, gateDValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
    });
  }

  for (const spec of SUMMARY_SPECS.slice(2)) {
    const validation = validateSummary(spec, source[spec.key], policyFingerprint, sourceFingerprint);
    if (!validation.ok) {
      return failClosed(validation.blocker, validation.diagnostic, {
        policyFingerprint,
        sourceFingerprint,
        upstreamFingerprints,
      });
    }
  }

  const upstreamReadinessSummary = buildUpstreamReadiness(source, policyFingerprint, sourceFingerprint);
  const safeRunDomainSummary = buildSafeRunDomainSummary(source.sealedCandidateAssemblyPreviewSummary);
  const safeBoardDomainSummary = buildSafeBoardDomainSummary(source.boardFillSummary, source.boardElectricalSummary, source.segmentZoneBridgeSummary);
  const safeDriverDomainSummary = buildSafeDriverDomainSummary(source.driverSizerSummary);
  const safeZoneDomainSummary = buildSafeZoneDomainSummary(source.segmentZoneBridgeSummary, source.zoneValidationFootholdSummary, source.emergencyZonePickerFootholdSummary);
  const safeAccessoryDomainSummary = buildSafeAccessoryDomainSummary(source.accessoryReservationSummary, source.sealedCandidateAssemblyPreviewSummary);
  const runTableDomainReadinessSummary = buildRunTableDomainReadinessSummary({
    source,
    policyFingerprint,
    sourceFingerprint,
    upstreamReadinessSummary,
    safeRunDomainSummary,
    safeBoardDomainSummary,
    safeDriverDomainSummary,
    safeZoneDomainSummary,
    safeAccessoryDomainSummary,
  });

  const fingerprintPayload = {
    schemaId: ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_VERSION,
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    runTableDomainReadinessSummary,
    safeRunDomainSummary,
    safeBoardDomainSummary,
    safeDriverDomainSummary,
    safeZoneDomainSummary,
    safeAccessoryDomainSummary,
  };
  const runTableDomainOutputScaffoldFingerprint = `safe-runtable-domain-output-scaffold:${stableSha1(fingerprintPayload)}`;

  return baseSummary({
    ok: true,
    runTableDomainReadinessSummary,
    safeRunDomainSummary,
    safeBoardDomainSummary,
    safeDriverDomainSummary,
    safeZoneDomainSummary,
    safeAccessoryDomainSummary,
    blockedProductionOutputSummary: blockedProductionOutputSummary(null),
    warnings: [
      "Diagnostic-only RunTable domain output scaffold: safe RunTable-readiness/domain summaries were emitted, but production RunTable generation remains blocked.",
      "No donor Engine payload is assembled; donor Engine invocation, selected-result persistence, IES generation, routes, POST endpoints, exact electrical output, raw rows, and raw payloads remain disabled.",
    ],
    failClosedDiagnostics: [],
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    runTableDomainOutputScaffoldFingerprint,
  });
}

export const buildRuntimeNativeRunTableDomainOutputScaffoldSummary = buildRuntimeRunTableDomainOutputScaffoldSummary;
export const buildEngineRunTableRuntimeRunTableDomainOutputScaffoldStatus = buildRuntimeRunTableDomainOutputScaffoldSummary;
