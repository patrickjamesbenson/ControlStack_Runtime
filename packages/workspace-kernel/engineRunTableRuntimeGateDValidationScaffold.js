import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.gate-d-validation-scaffold-summary";
export const ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_STATE =
  "runtime_gate_d_validation_scaffold_diagnostic_only";

const SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  nativeRuntimeKernel: true,
  runtimeNative: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  donorGateDExactValidationEnabled: false,
  donorEngineInvoked: false,
  donorEngineInvocationEnabled: false,
  roughElectricalPayloadAssemblyEnabled: false,
  crossJoinComparisonScoringEnabled: false,
  emergencyComplianceProofEnabled: false,
  complianceApprovalEnabled: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  boardDataMakerImported: false,
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
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe(?:[-:][0-9A-Za-z_.:-]{4,420})$/;
const TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:donorEngineInvoked|donorEngineInvocationEnabled)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAuthority)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled)$/i, "selected-result-persistence-not-approved"],
  [/^(?:runTableGenerated|runtableGenerated|runTableGenerationEnabled)$/i, "runtable-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled)$/i, "ies-generation-not-approved"],
  [/^(?:complianceApproved|complianceApprovalEnabled)$/i, "compliance-approval-not-available"],
  [/^(?:routesAdded|publicRoutesAdded|routeAdded|publicRouteAdded)$/i, "routes-added-not-approved"],
  [/^(?:postEndpointsAdded|postEndpointAdded)$/i, "post-endpoints-added-not-approved"],
  [/^(?:rawRowsReturned|rawProductRowsReturned|rawBoardRowsReturned|rawDriverRowsReturned|rawAccessoryRowsReturned|rawReservationGridReturned|rawEmergencyPayloadReturned|rawEnginePayloadReturned|rawCurveRowsReturned|rawDriverUtilPayloadReturned|rawCurvePointsReturned|rawUsersReturned|exactElectricalValuesExposed)$/i, "raw-payload-flag-detected"],
]);
const RAW_PAYLOAD_KEY_PATTERN = /^(?:PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|USERS|VF_CURVES|SYSTEM_POLICY|novondb|rawRows|rawProductRows|rawBoardRows|rawDriverRows|rawAccessoryRows|productRows|boardRows|driverRows|accessoryRows|rawReservationGrid|reservationGrid|reservedGrid|rawReservedGrid|reservationCells|rawReservationCells|enginePayload|rawEnginePayload|runEnginePayload|selectorPayload|donorPayload|rawDonorPayload|roughElectricalPayload|rawEmergencyPayload|emergencyPayload|driverUtilPayload|rawDriverUtilPayload|curvePoints|rawCurvePoints)$/i;
const PRIVATE_PATH_KEY_PATTERN = /(?:absolutePath|localPath|filePath|sourcePath|donorPath|runtimeDataPath|path)$/i;

const REQUIRED_UPSTREAMS = Object.freeze([
  {
    key: "accessoryReservationSummary",
    label: "accessory reservation summary",
    missing: "missing-accessory-reservation-summary",
    unsafe: "unsafe-accessory-reservation-summary",
    readyKey: "accessoryReservationReady",
  },
  {
    key: "boardFillInputSummary",
    label: "board-fill input summary",
    missing: "missing-board-fill-input-summary",
    unsafe: "unsafe-board-fill-input-summary",
  },
  {
    key: "boardFillSummary",
    label: "board-fill summary",
    missing: "missing-board-fill-summary",
    unsafe: "unsafe-board-fill-summary",
  },
  {
    key: "boardElectricalSummary",
    label: "board electrical summary",
    missing: "missing-board-electrical-summary",
    unsafe: "unsafe-board-electrical-summary",
    readyKey: "electricalSummaryReady",
  },
  {
    key: "driverSizerSummary",
    label: "driver sizer summary",
    missing: "missing-driver-sizer-summary",
    unsafe: "unsafe-driver-sizer-summary",
    readyKey: "driverSizerReady",
  },
  {
    key: "segmentZoneBridgeSummary",
    label: "sealed segment-zone bridge summary",
    missing: "missing-segment-zone-bridge-summary",
    unsafe: "unsafe-segment-zone-bridge-summary",
    readyKey: "segmentZoneBridgeReady",
  },
  {
    key: "zoneValidationFootholdSummary",
    label: "zone validation foothold summary",
    missing: "missing-zone-validation-foothold-summary",
    unsafe: "unsafe-zone-validation-foothold-summary",
    readyKey: "zoneValidationFootholdReady",
  },
  {
    key: "emergencyZonePickerFootholdSummary",
    label: "emergency zone picker foothold summary",
    missing: "missing-emergency-zone-picker-foothold-summary",
    unsafe: "unsafe-emergency-zone-picker-foothold-summary",
    readyKey: "emergencyZonePickerReady",
  },
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
  return cleaned ? cleaned.slice(0, 140) : fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 440);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function readinessCategoryFor(blocker) {
  if (!blocker) return "ready-for-sealed-candidate-assembly";
  if (blocker === "fingerprint-mismatch") return "blocked-by-fingerprint-mismatch";
  if (blocker === "cross-compare-not-approved") return "blocked-by-unapproved-cross-compare";
  if (blocker === "unresolved-accessory-reservation") return "blocked-by-unresolved-accessory";
  if (blocker === "emergency-compliance-proof-required") return "blocked-by-emergency-compliance";
  if ([
    "raw-payload-flag-detected",
    "donor-engine-invocation-not-approved",
    "runtime-data-mutation-not-approved",
    "selected-result-persistence-not-approved",
    "runtable-generation-not-approved",
    "ies-generation-not-approved",
    "compliance-approval-not-available",
    "routes-added-not-approved",
    "post-endpoints-added-not-approved",
  ].includes(blocker)) {
    return "blocked-by-unsafe-payload-flag";
  }
  return "blocked-by-upstream-summary";
}

function unsafeBlocker(value, depth = 0) {
  if (depth > 8) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "raw-payload-flag-detected" : null;
  if (Array.isArray(value)) {
    for (const entry of value) {
      const blocker = unsafeBlocker(entry, depth + 1);
      if (blocker) return blocker;
    }
    return null;
  }
  if (!isPlainObject(value)) return null;

  for (const [key, nested] of Object.entries(value)) {
    for (const [pattern, blocker] of TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    if (RAW_PAYLOAD_KEY_PATTERN.test(key) && nested !== false && nested !== null && nested !== undefined) {
      return "raw-payload-flag-detected";
    }
    if (PRIVATE_PATH_KEY_PATTERN.test(key) && typeof nested === "string" && PRIVATE_PATH_PATTERN.test(nested)) {
      return "raw-payload-flag-detected";
    }
    const blocker = unsafeBlocker(nested, depth + 1);
    if (blocker) return blocker;
  }
  return null;
}

function summaryFingerprintFor(summary) {
  return safeFingerprint(firstPresent(summary, [
    "gateDValidationScaffoldFingerprint",
    "emergencyZonePickerFingerprint",
    "zoneValidationFootholdFingerprint",
    "segmentZoneBridgeFingerprint",
    "driverSizerFingerprint",
    "summaryFingerprint",
    "boardFillInputFingerprint",
    "accessoryReservationFingerprint",
    "boardFillFingerprint",
    "reservationFingerprint",
  ]));
}

function buildUpstreamFingerprints(summaries) {
  return Object.fromEntries(REQUIRED_UPSTREAMS.map((spec) => {
    const summary = summaries[spec.key];
    return [spec.key, isPlainObject(summary) ? summaryFingerprintFor(summary) || null : null];
  }));
}

function buildUpstreamReadiness(summaries, policyFingerprint, sourceFingerprint) {
  return Object.fromEntries(REQUIRED_UPSTREAMS.map((spec) => {
    const summary = summaries[spec.key];
    const ownPolicy = safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
    const ownSource = safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
    return [spec.key, {
      present: isPlainObject(summary),
      ok: summary?.ok === true,
      nativeRuntimeKernel: summary?.nativeRuntimeKernel === true,
      diagnosticOnly: summary?.diagnosticOnly === true,
      readyKey: spec.readyKey || null,
      ready: spec.readyKey ? summary?.[spec.readyKey] === true : summary?.ok === true,
      fingerprintMatched: Boolean(
        policyFingerprint
          && sourceFingerprint
          && ownPolicy === policyFingerprint
          && ownSource === sourceFingerprint,
      ),
      summaryFingerprint: isPlainObject(summary) ? summaryFingerprintFor(summary) || null : null,
      safeSummaryOnly: true,
    }];
  }));
}

function validationReadiness(category, blocker = null) {
  return {
    gateDScaffoldReady: category === "ready-for-sealed-candidate-assembly",
    sealedCandidateAssemblyReady: category === "ready-for-sealed-candidate-assembly",
    donorGateDExactValidationReady: false,
    donorEngineReady: false,
    crossCompareReady: false,
    emergencyComplianceProofReady: false,
    runTableReady: false,
    iesReady: false,
    complianceApprovalReady: false,
    reason: blocker || "sealed-readiness-scaffold-ready-before-future-candidate-assembly",
  };
}

function sealedReadinessSummary(category, extra = {}) {
  return {
    diagnosticOnly: true,
    candidateAssemblyReadiness: category,
    upstreamSummaryCount: REQUIRED_UPSTREAMS.length,
    allRequiredUpstreamSummariesPresent: extra.allRequiredUpstreamSummariesPresent ?? false,
    allUpstreamSummariesSafe: extra.allUpstreamSummariesSafe ?? false,
    upstreamReady: extra.upstreamReady ?? false,
    fingerprintsMatched: extra.fingerprintsMatched ?? false,
    accessoryReservationResolved: extra.accessoryReservationResolved ?? false,
    noCrossZoneValidationReady: extra.noCrossZoneValidationReady ?? false,
    emergencyComplianceProofRequired: extra.emergencyComplianceProofRequired ?? false,
    rawPayloadFlagsDetected: extra.rawPayloadFlagsDetected ?? false,
    blockedDependency: extra.blockedDependency || null,
    driverSizingLimitingFactorCategory: extra.driverSizingLimitingFactorCategory || null,
    roughElectricalPayloadAssembled: false,
    donorGateDExactValidationPerformed: false,
    rawEnginePayloadReturned: false,
  };
}

function safetyBase(extra = {}) {
  const category = extra.limitingFactorCategory || readinessCategoryFor(extra.blocker || null);
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    gateDScaffoldReady: extra.gateDScaffoldReady ?? false,
    sealedReadinessSummary: extra.sealedReadinessSummary || sealedReadinessSummary(category),
    upstreamReadinessSummary: extra.upstreamReadinessSummary || {},
    limitingFactorCategory: category,
    validationReadiness: extra.validationReadiness || validationReadiness(category, extra.blocker || null),
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    upstreamFingerprints: isPlainObject(extra.upstreamFingerprints) ? extra.upstreamFingerprints : {},
    gateDValidationScaffoldFingerprint: extra.gateDValidationScaffoldFingerprint || null,
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
    complianceApproved: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  const category = readinessCategoryFor(blocker);
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    gateDScaffoldReady: false,
    limitingFactorCategory: category,
    sealedReadinessSummary: extra.sealedReadinessSummary || sealedReadinessSummary(category, {
      allRequiredUpstreamSummariesPresent: extra.allRequiredUpstreamSummariesPresent ?? false,
      allUpstreamSummariesSafe: extra.allUpstreamSummariesSafe ?? false,
      upstreamReady: false,
      fingerprintsMatched: extra.fingerprintsMatched ?? false,
      accessoryReservationResolved: extra.accessoryReservationResolved ?? false,
      noCrossZoneValidationReady: extra.noCrossZoneValidationReady ?? false,
      emergencyComplianceProofRequired: extra.emergencyComplianceProofRequired ?? false,
      rawPayloadFlagsDetected: category === "blocked-by-unsafe-payload-flag",
      blockedDependency: blocker,
    }),
    validationReadiness: validationReadiness(category, blocker),
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function validateFingerprints(source) {
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!policyFingerprint) return { ok: false, blocker: "fingerprint-mismatch", diagnostic: "A safe policy fingerprint is required before Gate D readiness diagnostics." };
  if (!sourceFingerprint) return { ok: false, blocker: "fingerprint-mismatch", diagnostic: "A safe source fingerprint is required before Gate D readiness diagnostics.", policyFingerprint };
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function validateSummary(spec, summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} is required.` };
  const unsafe = unsafeBlocker(summary);
  if (unsafe) return { ok: false, blocker: unsafe === "raw-payload-flag-detected" ? unsafe : spec.unsafe, diagnostic: `${spec.label} contains unsafe raw payload, row, grid, side-effect, path, or approval markers.` };
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.nativeRuntimeKernel !== true) {
    return { ok: false, blocker: spec.unsafe, diagnostic: `${spec.label} must be an ok runtime-native diagnostic-only sealed summary.` };
  }
  const ownPolicy = safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
  const ownSource = safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!ownPolicy || !ownSource || ownPolicy !== policyFingerprint || ownSource !== sourceFingerprint) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${spec.label} fingerprint does not match the Gate D scaffold fingerprints.` };
  }
  if (spec.readyKey && summary[spec.readyKey] !== true) {
    return { ok: false, blocker: "upstream-not-ready", diagnostic: `${spec.label} is not ready: ${spec.readyKey} is not true.` };
  }
  return { ok: true };
}

function hasCrossCompareDependency(segmentZoneBridgeSummary, zoneValidationFootholdSummary) {
  const bridgeJoin = segmentZoneBridgeSummary?.joinModeSummary || {};
  const zoneJoin = zoneValidationFootholdSummary?.joinModeSummary || {};
  const bridgeValidation = segmentZoneBridgeSummary?.validationReadiness || {};
  const zoneValidation = zoneValidationFootholdSummary?.validationReadiness || {};
  const containment = segmentZoneBridgeSummary?.noCrossZoneContainmentSummary || {};
  const secondary = String(bridgeJoin.secondaryAcrossSegment || zoneJoin.secondaryAcrossSegment || "forbid").toLowerCase();
  return secondary !== "forbid"
    || bridgeJoin.allowCrossSegmentJoins === true
    || bridgeJoin.compareModeRequested === true
    || bridgeJoin.crossJoinComparisonScoringEnabled === true
    || bridgeJoin.crossNoCrossComparisonDeferred === true
    || zoneJoin.allowCrossSegmentJoins === true
    || zoneJoin.compareModeRequested === true
    || zoneJoin.crossJoinComparisonScoringEnabled === true
    || zoneJoin.crossNoCrossComparisonDeferred === true
    || bridgeValidation.crossNoCrossComparisonReady === true
    || zoneValidation.crossJoinValidationReady === true
    || zoneValidation.compareJoinModeValidationReady === true
    || containment.zonesCrossSegmentJoin === true
    || Number(containment.crossJoinZoneCount || 0) > 0;
}

function hasEmergencyComplianceDependency(emergencySummary) {
  const boundary = emergencySummary?.complianceBoundary || {};
  const selected = emergencySummary?.selectedZoneIntentSummary || {};
  const readiness = emergencySummary?.validationReadiness || {};
  const hardware = emergencySummary?.physicalHardwareBoundary || {};
  const type = String(selected.emergencyType || emergencySummary?.emergencyType || "").toLowerCase();
  return boundary.complianceProofRequired === true
    || selected.complianceProofRequired === true
    || readiness.complianceProofReady === true
    || readiness.lifeSafetyComplianceReady === true
    || readiness.ewisSpeakerProofReady === true
    || hardware.complianceProofRequired === true
    || type === "ewis-speaker";
}

function accessoryResolved(accessoryReservationSummary, boardFillInputSummary) {
  return accessoryReservationSummary?.accessoryReservationReady === true
    && accessoryReservationSummary?.boardFillInputReady === true
    && boardFillInputSummary?.ok === true;
}

export function buildRuntimeGateDValidationScaffoldSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const fingerprintValidation = validateFingerprints(source);
  const policyFingerprint = fingerprintValidation.policyFingerprint || safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"])) || null;
  const sourceFingerprint = fingerprintValidation.sourceFingerprint || safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])) || null;

  const summaries = Object.fromEntries(REQUIRED_UPSTREAMS.map((spec) => [spec.key, firstPresent(source, [spec.key])]));
  const upstreamFingerprints = buildUpstreamFingerprints(summaries);
  const upstreamReadinessSummary = buildUpstreamReadiness(summaries, policyFingerprint, sourceFingerprint);

  if (!fingerprintValidation.ok) {
    return failClosed(fingerprintValidation.blocker, fingerprintValidation.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      upstreamReadinessSummary,
    });
  }

  const topLevelUnsafe = unsafeBlocker({ ...source, ...Object.fromEntries(REQUIRED_UPSTREAMS.map((spec) => [spec.key, undefined])) });
  if (topLevelUnsafe) {
    return failClosed(topLevelUnsafe === "raw-payload-flag-detected" ? "raw-payload-flag-detected" : topLevelUnsafe, "Gate D scaffold input contains unsafe top-level raw payload, row, grid, side-effect, path, or approval markers.", {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      upstreamReadinessSummary,
      fingerprintsMatched: true,
    });
  }

  let allRequiredUpstreamSummariesPresent = true;
  for (const spec of REQUIRED_UPSTREAMS) {
    if (!isPlainObject(summaries[spec.key])) allRequiredUpstreamSummariesPresent = false;
    const checked = validateSummary(spec, summaries[spec.key], policyFingerprint, sourceFingerprint);
    if (!checked.ok) {
      const blocker = checked.blocker;
      return failClosed(blocker, checked.diagnostic, {
        policyFingerprint,
        sourceFingerprint,
        upstreamFingerprints,
        upstreamReadinessSummary: buildUpstreamReadiness(summaries, policyFingerprint, sourceFingerprint),
        allRequiredUpstreamSummariesPresent,
        allUpstreamSummariesSafe: !String(blocker).startsWith("unsafe-") && blocker !== "raw-payload-flag-detected" ? false : false,
        fingerprintsMatched: blocker !== "fingerprint-mismatch",
      });
    }
  }

  const unresolvedAccessory = !accessoryResolved(summaries.accessoryReservationSummary, summaries.boardFillInputSummary);
  if (unresolvedAccessory) {
    return failClosed("unresolved-accessory-reservation", "Accessory reservation and board-fill input readiness must both be sealed before Gate D candidate assembly readiness.", {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      upstreamReadinessSummary: buildUpstreamReadiness(summaries, policyFingerprint, sourceFingerprint),
      allRequiredUpstreamSummariesPresent: true,
      allUpstreamSummariesSafe: true,
      fingerprintsMatched: true,
    });
  }

  if (hasCrossCompareDependency(summaries.segmentZoneBridgeSummary, summaries.zoneValidationFootholdSummary)) {
    return failClosed("cross-compare-not-approved", "Cross-segment joins and cross/no-cross comparison scoring are not approved for this sealed Gate D readiness scaffold.", {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      upstreamReadinessSummary: buildUpstreamReadiness(summaries, policyFingerprint, sourceFingerprint),
      allRequiredUpstreamSummariesPresent: true,
      allUpstreamSummariesSafe: true,
      fingerprintsMatched: true,
      accessoryReservationResolved: true,
    });
  }

  if (hasEmergencyComplianceDependency(summaries.emergencyZonePickerFootholdSummary)) {
    return failClosed("emergency-compliance-proof-required", "Emergency, EWIS, acoustic, AS/NZS 2293, life-safety, lux, candela, and compliance proof remain outside this diagnostic Gate D readiness scaffold.", {
      policyFingerprint,
      sourceFingerprint,
      upstreamFingerprints,
      upstreamReadinessSummary: buildUpstreamReadiness(summaries, policyFingerprint, sourceFingerprint),
      allRequiredUpstreamSummariesPresent: true,
      allUpstreamSummariesSafe: true,
      fingerprintsMatched: true,
      accessoryReservationResolved: true,
      noCrossZoneValidationReady: true,
      emergencyComplianceProofRequired: true,
    });
  }

  const category = "ready-for-sealed-candidate-assembly";
  const driverSizingLimitingFactorCategory = safeLabel(
    firstPresent(summaries.driverSizerSummary, ["limitingFactorCategory"])
      ?? firstPresent(summaries.driverSizerSummary?.selectedDriverSummary, ["limitingFactorCategory"]),
    "unresolved",
  );
  const fingerprintPayload = {
    schemaId: ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_GATE_D_VALIDATION_SCAFFOLD_SCHEMA_VERSION,
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    driverSizingLimitingFactorCategory,
    readinessCategory: category,
  };
  const gateDValidationScaffoldFingerprint = `safe-gate-d-validation-scaffold:${stableSha1(fingerprintPayload)}`;

  return safetyBase({
    ok: true,
    gateDScaffoldReady: true,
    sealedReadinessSummary: sealedReadinessSummary(category, {
      allRequiredUpstreamSummariesPresent: true,
      allUpstreamSummariesSafe: true,
      upstreamReady: true,
      fingerprintsMatched: true,
      accessoryReservationResolved: true,
      noCrossZoneValidationReady: true,
      emergencyComplianceProofRequired: false,
      rawPayloadFlagsDetected: false,
      driverSizingLimitingFactorCategory,
    }),
    upstreamReadinessSummary: buildUpstreamReadiness(summaries, policyFingerprint, sourceFingerprint),
    limitingFactorCategory: category,
    validationReadiness: validationReadiness(category),
    warnings: [
      "Diagnostic-only Gate D readiness scaffold: donor Gate D exact electrical validation, donor Engine invocation, RunTable generation, IES generation, and compliance approval remain disabled.",
      "No rough electrical payload is assembled; only sealed runtime summaries and safe fingerprints are aggregated.",
    ],
    failClosedDiagnostics: [],
    policyFingerprint,
    sourceFingerprint,
    upstreamFingerprints,
    gateDValidationScaffoldFingerprint,
  });
}

export const buildRuntimeNativeGateDValidationScaffoldSummary = buildRuntimeGateDValidationScaffoldSummary;
export const buildEngineRunTableRuntimeGateDValidationScaffoldStatus = buildRuntimeGateDValidationScaffoldSummary;
