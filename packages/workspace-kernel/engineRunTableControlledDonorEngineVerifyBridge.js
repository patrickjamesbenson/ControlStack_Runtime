import { stableSha1 } from "./stableFingerprint.js";

export const CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.controlled-donor-engine-verify-bridge.v1";
export const CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_VERSION = 1;
export const CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_STATE =
  "controlled_donor_engine_verify_bridge_synthetic_fixture_contract_only";

export const CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_ALLOWED_OUTPUT_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "state",
  "readOnly",
  "privateBridgeOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "syntheticFixtureOnly",
  "verificationMode",
  "readonlySeamSummaryOnly",
  "realEngineVerificationSummaryAvailable",
  "acceptedSelectedResultAuthorityReady",
  "outputsReady",
  "ok",
  "bridgeReady",
  "safeEngineResultReady",
  "selectedResultSourceObjectReady",
  "runTableDomainReadinessReady",
  "iesHandoffReadinessReady",
  "blocker",
  "blockers",
  "warnings",
  "safeWarningCategories",
  "broadCountBands",
  "opaqueResultToken",
  "sourceFingerprints",
  "projectionFingerprints",
  "scaffoldFingerprints",
  "redactionFlags",
  "safetyFlags",
  "failClosedDiagnostics",
  "sanitizerAllowListVersion",
  "sanitizerDenyListVersion",
  "bridgeFingerprint",
]);

const SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  privateBridgeOnly: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  syntheticFixtureOnly: true,
  readonlySeamSummaryOnly: false,
  realEngineVerificationSummaryAvailable: false,
  hostLocalReadonlyEngineSeamSummaryConsumed: false,
  acceptedSelectedResultAuthorityReady: false,
  outputsReady: false,
  noRoute: true,
  noPostEndpoint: true,
  noUiInvocation: true,
  donorEngineInvoked: false,
  donorEngineInvocationAttempted: false,
  donorEngineInvocationEnabled: false,
  donorEnginePayloadAssemblyEnabled: false,
  realDonorPayloadAssembled: false,
  realDonorPayloadReturned: false,
  rawDonorResultReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  rawSelectorPayloadReturned: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawDriverRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawRuntimeDataRowsReturned: false,
  rawIesContentReturned: false,
  rawPhotometryReturned: false,
  candelaArraysReturned: false,
  base64ArtifactsReturned: false,
  exactElectricalValuesReturned: false,
  exactPlacementCoordinatesReturned: false,
  privatePathsReturned: false,
  credentialsReturned: false,
  usersCrmContactsReturned: false,
  runtimeDataMutated: false,
  donorMutated: false,
  selectedResultPersisted: false,
  selectedResultPersistenceEnabled: false,
  productionRunTableGenerated: false,
  runTableGenerated: false,
  iesGenerated: false,
  routesAdded: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
});

const REDACTION_FLAGS = Object.freeze({
  rawDonorResultQuarantined: true,
  rawDonorResultScanned: false,
  rawDonorResultReturned: false,
  rawEnginePayloadReturned: false,
  rawEngineResultReturned: false,
  rawSelectorPayloadReturned: false,
  rawRowsReturned: false,
  rawPhotometryReturned: false,
  exactElectricalValuesReturned: false,
  exactPlacementCoordinatesReturned: false,
  privateDataReturned: false,
  denyListHit: false,
});

function safetyFlagsFor(extra = {}) {
  return {
    ...SAFETY_FLAGS,
    syntheticFixtureOnly: extra.syntheticFixtureOnly !== false,
    readonlySeamSummaryOnly: extra.readonlySeamSummaryOnly === true,
    realEngineVerificationSummaryAvailable: extra.realEngineVerificationSummaryAvailable === true,
    hostLocalReadonlyEngineSeamSummaryConsumed: extra.hostLocalReadonlyEngineSeamSummaryConsumed === true,
    acceptedSelectedResultAuthorityReady: false,
    outputsReady: false,
  };
}

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|\bControlStack(?:_Runtime|_RuntimeData)?[\\/])/i;
const RAW_IES_TEXT_PATTERN = /(?:^\s*IESNA:|\bTILT\s*=|\bLM-63\b|\[[A-Z0-9_ -]{2,}\]\s+[^\n]+\n\s*TILT\s*=)/i;
const DATA_BASE64_PATTERN = /(?:^|\b)data:[^\s]+;base64|\bbase64\s*[,=:]/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,720}$/;

const SYNTHETIC_RAW_RESULT_FIXTURE_KEYS = new Set([
  "rawDonorResultFixture",
  "syntheticDonorRawResultFixture",
  "syntheticDonorResultFixture",
]);

const UNSAFE_TRUE_FLAG_BLOCKERS = Object.freeze([
  [/^(?:rawEnginePayloadReturned|rawEnginePayloadExposed|rawEnginePayloadIncluded|enginePayloadReturned|enginePayloadExposed|rawEngineResultReturned|rawEngineResultExposed|engineResultReturned|engineResultExposed|rawDonorResultReturned|rawDonorResultExposed)$/i, "raw-engine-payload-or-result-not-approved"],
  [/^(?:rawSelectorPayloadReturned|rawSelectorPayloadExposed|selectorPayloadReturned|selectorPayloadExposed)$/i, "raw-selector-payload-not-approved"],
  [/^(?:rawProductRowsReturned|rawProductRowsExposed|rawRowsReturned|rawRowsExposed|rawSourceDbRowsExposed)$/i, "raw-source-rows-not-approved"],
  [/^(?:rawBoardRowsReturned|rawBoardRowsExposed|rawBoardDataRowsExposed)$/i, "raw-source-rows-not-approved"],
  [/^(?:rawDriverRowsReturned|rawDriverRowsExposed|rawDriverUtilPayloadReturned|rawCurveRowsReturned|rawCurvePointsReturned)$/i, "raw-source-rows-not-approved"],
  [/^(?:rawAccessoryRowsReturned|rawAccessoryRowsExposed)$/i, "raw-source-rows-not-approved"],
  [/^(?:rawIesContentReturned|rawIESContentReturned|rawPhotometryReturned|candelaArraysReturned|base64ArtifactsReturned|base64ArtefactsReturned)$/i, "raw-photometry-or-artifact-not-approved"],
  [/^(?:exactElectricalValuesReturned|exactElectricalValuesExposed|exactVoltageReturned|exactCurrentReturned|exactPowerReturned)$/i, "exact-electrical-values-not-approved"],
  [/^(?:exactPlacementCoordinatesReturned|exactPlacementCoordinatesExposed|rawCoordinatesReturned|placementCoordinatesReturned)$/i, "exact-placement-coordinates-not-approved"],
  [/^(?:rawUsersReturned|rawUsersExposed|rawCrmReturned|rawCRMReturned|rawContactsReturned|rawContactsExposed)$/i, "users-crm-contacts-not-approved"],
  [/^(?:privatePathsReturned|privatePathsExposed|privatePathReturned|privatePathExposed)$/i, "private-paths-not-approved"],
  [/^(?:credentialsReturned|credentialsExposed|credentialReturned|secretReturned|tokenReturned|accessTokenReturned)$/i, "credentials-not-approved"],
  [/^(?:donorEngineInvoked|donorEngineInvocationAttempted|donorEngineInvocationEnabled|productionEngineExecutionEnabled|engineExecutionAttempted)$/i, "donor-engine-invocation-not-approved"],
  [/^(?:donorEnginePayloadAssemblyEnabled|realDonorPayloadAssembled|realDonorPayloadReturned|privateDonorPayloadAssembled)$/i, "real-donor-payload-assembly-not-approved"],
  [/^(?:runtimeDataMutated|runtimeDataMutationEnabled|runtimeDataMutationAttempted|authorityWritesActive)$/i, "runtime-data-mutation-not-approved"],
  [/^(?:selectedResultPersisted|selectedResultPersistenceEnabled|selectedResultPersistenceAttempted|selectedResultBodyReturned)$/i, "selected-result-persistence-not-approved"],
  [/^(?:productionRunTableGenerated|productionRunTableGenerationEnabled|runTableGenerated|runtableGenerated|runTableGenerationEnabled)$/i, "runtable-generation-not-approved"],
  [/^(?:iesGenerated|iesGenerationEnabled|photometryGenerationEnabled|photometryGenerationInvoked)$/i, "ies-generation-not-approved"],
  [/^(?:routesAdded|routeAdded|publicRoutesAdded|publicRouteAdded|apiRouteAdded|postEndpointsAdded|postEndpointAdded|postEndpointEnabled)$/i, "route-or-post-endpoint-not-approved"],
]);

const DENY_LIST_KEY_BLOCKERS = Object.freeze([
  [/^(?:rough_electrical_payload|roughElectricalPayload|roughElectrical|electrical_validation|electricalValidation)$/i, "deny-listed-raw-result-key"],
  [/^(?:verified_runs|verifiedRuns|selected_solution|selectedSolution|selectedResultBody|selected_result_body)$/i, "deny-listed-raw-result-key"],
  [/^(?:debug|engine_result|engineResult|enginePayload|rawEnginePayload|rawEngineResult|rawDonorPayload|donorPayload)$/i, "deny-listed-raw-result-key"],
  [/^(?:selectorPayload|rawSelectorPayload)$/i, "deny-listed-raw-result-key"],
  [/^(?:boards|BOARDS|boardRows|rawBoardRows|drivers|DRIVERS|driverRows|rawDriverRows|accessories|ACCESSORIES|accessoryRows|rawAccessoryRows|products|PRODUCTS|productRows|rawProductRows|sourceRows|rawSourceRows|sourceProductRows|sourceBoardRows|sourceDriverRows|sourceAccessoryRows)$/i, "deny-listed-raw-result-key"],
  [/^(?:mechanical|zones|zone_plan|zonePlan|physical_boards|physicalBoards|placements|reserved_ranges|reservedRanges|fixture_points|fixturePoints|clip_points_mm|clipPointsMm|suspension_points_mm|suspensionPointsMm|gear_tray_plan|gearTrayPlan)$/i, "deny-listed-raw-result-key"],
  [/^(?:ies|iesText|rawIesText|rawIESText|iesContent|rawIesContent|photometry|rawPhotometry|candela|candelaGrid|candelaArray|candelaArrays|rawCandela|rawCandelaGrid|base64|base64Artifact|base64Artifacts|base64Artefact|base64Artefacts)$/i, "deny-listed-raw-result-key"],
  [/^(?:USERS|users|rawUsers|CRM|crm|rawCrm|rawCRM|contacts|CONTACTS|rawContacts|hubSpotRows|hubSpotContacts|hubspotRows|hubspotContacts)$/i, "deny-listed-raw-result-key"],
  [/^(?:credentials|credential|secret|password|apiKey|apikey|accessToken|privateKey)$/i, "deny-listed-raw-result-key"],
  [/^(?:exactElectricalValues|electricalValues|voltage|voltage_v|vf|vf_v|current|current_ma|currentMa|power|power_w|watts|watts_w|wattAtCurrentW|vfAtCurrentV|selectedCurrentMa|targetCurrentMa)$/i, "exact-electrical-values-not-approved"],
  [/^(?:exactPlacementCoordinates|placementCoordinates|placementCoordinatesMm|coordinates|coordinateList|x_mm|y_mm|z_mm|start_mm|end_mm|startCoordinateMm|endCoordinateMm)$/i, "exact-placement-coordinates-not-approved"],
  [/(?:absolutePath|localPath|filePath|filepath|sourcePath|donorPath|runtimeDataPath|privatePath)$/i, "private-paths-not-approved"],
]);

const SUMMARY_SPECS = Object.freeze([
  {
    key: "boardFamilyProjectionSummary",
    label: "board-family projection",
    missing: "missing-board-family-projection",
    notReady: "board-family-projection-not-ready",
    readyKey: "boardFamilyProjectionReady",
    fingerprintKeys: ["boardFamilyProjectionFingerprint", "summaryFingerprint", "fingerprint"],
    fingerprintBucket: "projectionFingerprints",
  },
  {
    key: "driverCandidateProjectionSummary",
    label: "driver-candidate projection",
    missing: "missing-driver-candidate-projection",
    notReady: "driver-candidate-projection-not-ready",
    readyKey: "driverCandidateProjectionReady",
    fingerprintKeys: ["driverCandidateProjectionFingerprint", "summaryFingerprint", "fingerprint"],
    fingerprintBucket: "projectionFingerprints",
  },
  {
    key: "curveReferenceSummary",
    label: "curve/reference summary",
    missing: "missing-curve-reference-summary",
    notReady: "curve-reference-summary-not-ready",
    readyKey: "curveReferenceSummaryReady",
    fingerprintKeys: ["curveReferenceFingerprint", "summaryFingerprint", "fingerprint"],
    fingerprintBucket: "projectionFingerprints",
  },
  {
    key: "physicalPlacementSummary",
    label: "physical placement summary",
    missing: "missing-physical-placement-summary",
    notReady: "physical-placement-summary-not-ready",
    readyKey: "physicalPlacementSummaryReady",
    fingerprintKeys: ["placementSummaryFingerprint", "physicalPlacementSummaryFingerprint", "summaryFingerprint", "fingerprint"],
    fingerprintBucket: "projectionFingerprints",
  },
  {
    key: "gateDValidationScaffoldSummary",
    label: "Gate D readiness",
    missing: "missing-gate-d-readiness",
    notReady: "gate-d-readiness-not-ready",
    readyKey: "gateDScaffoldReady",
    fingerprintKeys: ["gateDValidationScaffoldFingerprint", "summaryFingerprint", "fingerprint"],
    fingerprintBucket: "scaffoldFingerprints",
  },
  {
    key: "sealedCandidateAssemblyPreviewSummary",
    label: "sealed candidate assembly readiness",
    missing: "missing-sealed-candidate-assembly-readiness",
    notReady: "sealed-candidate-assembly-readiness-not-ready",
    readyKey: "sealedCandidateAssemblyPreviewReady",
    fingerprintKeys: ["sealedCandidateAssemblyPreviewFingerprint", "summaryFingerprint", "fingerprint"],
    fingerprintBucket: "scaffoldFingerprints",
  },
  {
    key: "runTableDomainOutputScaffoldSummary",
    label: "RunTable-domain scaffold readiness",
    missing: "missing-runtable-domain-scaffold-readiness",
    notReady: "runtable-domain-scaffold-readiness-not-ready",
    readyKey: "runTableDomainOutputScaffoldReady",
    fingerprintKeys: ["runTableDomainOutputScaffoldFingerprint", "summaryFingerprint", "fingerprint"],
    fingerprintBucket: "scaffoldFingerprints",
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

function safeToken(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw)) return fallback;
  const token = raw
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
  return token || fallback;
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw) || RAW_IES_TEXT_PATTERN.test(raw) || DATA_BASE64_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 740);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
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

function normaliseWarnings(value) {
  const source = Array.isArray(value) ? value : [];
  return source.slice(0, 12).map((warning) => safeToken(warning, "warning-category"));
}

function unsafeBlocker(value, depth = 0, seen = new Set()) {
  if (depth > 10 || value === null || value === undefined) return null;
  if (typeof value === "string") {
    if (PRIVATE_PATH_PATTERN.test(value)) return "private-paths-not-approved";
    if (RAW_IES_TEXT_PATTERN.test(value)) return "raw-photometry-or-artifact-not-approved";
    if (DATA_BASE64_PATTERN.test(value)) return "raw-photometry-or-artifact-not-approved";
    if (/\b(?:password|credential|secret|api[_-]?key|access[_-]?token)\b/i.test(value)) return "credentials-not-approved";
    return null;
  }
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
    if (SYNTHETIC_RAW_RESULT_FIXTURE_KEYS.has(key)) {
      const blocker = unsafeBlocker(nested, depth + 1, seen);
      if (blocker) return blocker;
      continue;
    }
    for (const [pattern, blocker] of UNSAFE_TRUE_FLAG_BLOCKERS) {
      if (pattern.test(key) && nested === true) return blocker;
    }
    for (const [pattern, blocker] of DENY_LIST_KEY_BLOCKERS) {
      if (pattern.test(key) && nested !== false && nested !== null && nested !== undefined) return blocker;
    }
    const blocker = unsafeBlocker(nested, depth + 1, seen);
    if (blocker) return blocker;
  }
  return null;
}

function hasPrivateFixtureGate(source) {
  return source.privateBridgeGateApproved === true
    || source.privateGateApproved === true
    || source.syntheticPrivateBridgeGateApproved === true
    || source.privateBridgeFixtureGate === "synthetic-donor-result-fixture-only";
}

function hasPrivateReadonlySeamBridgeGate(source) {
  return source.privateReadonlySeamBridgeGateApproved === true
    || source.privateRealEngineVerificationBridgeGateApproved === true
    || source.privateBridgeGate === "readonly-engine-step1-safe-summary-only"
    || source.privateBridgeGate === "real-readonly-engine-summary-only";
}

function readonlyEngineStep1SafeSummaryFrom(source) {
  return firstPresent(source, ["readonlyEngineStep1SafeSummary", "selectorReadonlyEngineStep1SafeSummary"]);
}

function resolveFingerprints(source) {
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!policyFingerprint || !sourceFingerprint) {
    return {
      ok: false,
      blocker: "fingerprint-mismatch",
      diagnostic: "Safe policy and source fingerprints are required before controlled donor Engine bridge verification.",
      policyFingerprint: policyFingerprint || null,
      sourceFingerprint: sourceFingerprint || null,
    };
  }
  return { ok: true, policyFingerprint, sourceFingerprint };
}

function fingerprintFromSummary(summary, spec) {
  const raw = firstPresent(summary, spec.fingerprintKeys);
  return safeFingerprint(raw) || null;
}

function validateSafeSummary(source, spec, policyFingerprint, sourceFingerprint) {
  const summary = source[spec.key];
  if (!isPlainObject(summary)) {
    return { ok: false, blocker: spec.missing, diagnostic: `${spec.label} is required before controlled donor Engine bridge verification.` };
  }
  const unsafe = unsafeBlocker(summary);
  if (unsafe) {
    return { ok: false, blocker: unsafe, diagnostic: `${spec.label} contains unsafe raw rows, payloads, exact values, private data, generation, route, POST, donor Engine, or mutation markers.` };
  }
  if (summary.ok !== true || summary.diagnosticOnly !== true || summary.safeSummaryOnly !== true) {
    return { ok: false, blocker: spec.notReady, diagnostic: `${spec.label} must be an ok diagnostic-only safe summary.` };
  }
  if (summary[spec.readyKey] !== true) {
    return { ok: false, blocker: spec.notReady, diagnostic: `${spec.label} is not ready: ${spec.readyKey} is not true.` };
  }
  const ownPolicy = safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
  const ownSource = safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!ownPolicy || !ownSource || ownPolicy !== policyFingerprint || ownSource !== sourceFingerprint) {
    return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${spec.label} fingerprint does not match the bridge fingerprints.` };
  }
  return { ok: true, fingerprint: fingerprintFromSummary(summary, spec) };
}

function collectUpstreamFingerprints(source) {
  const projectionFingerprints = {};
  const scaffoldFingerprints = {};
  for (const spec of SUMMARY_SPECS) {
    const target = spec.fingerprintBucket === "projectionFingerprints" ? projectionFingerprints : scaffoldFingerprints;
    target[spec.key] = isPlainObject(source[spec.key]) ? fingerprintFromSummary(source[spec.key], spec) : null;
  }
  return { projectionFingerprints, scaffoldFingerprints };
}

function rawFixtureFrom(source) {
  for (const key of SYNTHETIC_RAW_RESULT_FIXTURE_KEYS) {
    if (isPlainObject(source[key])) return source[key];
  }
  return null;
}

function sanitiseSyntheticDonorResultFixture(fixture, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(fixture)) {
    return {
      ok: false,
      blocker: "missing-synthetic-donor-result-fixture",
      diagnostic: "A synthetic donor-shaped raw result fixture is required for the contract sanitizer path.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false },
    };
  }

  const blocker = unsafeBlocker(fixture);
  if (blocker) {
    return {
      ok: false,
      blocker,
      diagnostic: "Synthetic donor-shaped raw result fixture contained a deny-listed raw key, exact value, private datum, payload, route, endpoint, mutation, generation, or artifact marker.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: true, denyListHit: true },
    };
  }

  const accepted = fixture.accepted === true || fixture.ok === true || safeToken(fixture.status, "") === "accepted";
  if (!accepted) {
    return {
      ok: false,
      blocker: "synthetic-donor-result-not-accepted",
      diagnostic: "The synthetic donor-shaped raw result fixture did not carry an accepted/ok marker.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: true },
    };
  }

  const rawRunCount = firstPresent(fixture, ["runCount", "run_count", "verifiedRunCount", "safeRunCount"]);
  const rawCandidateCount = firstPresent(fixture, ["candidateCount", "candidate_count", "safeCandidateCount"]);
  const rawWarningCount = firstPresent(fixture, ["warningCount", "warning_count"]);
  const broadCountBands = {
    runCountBand: countBand(rawRunCount ?? 0),
    candidateCountBand: countBand(rawCandidateCount ?? 0),
    warningCountBand: countBand(rawWarningCount ?? (Array.isArray(fixture.warningCategories) ? fixture.warningCategories.length : 0)),
  };
  const safeWarningCategories = normaliseWarnings(fixture.warningCategories);
  const tokenSeed = {
    policyFingerprint,
    sourceFingerprint,
    accepted: true,
    bridgeFixtureMarker: safeToken(firstPresent(fixture, ["safeFixtureMarker", "fixtureMarker", "status"]), "accepted"),
    broadCountBands,
    safeWarningCategories,
  };

  return {
    ok: true,
    broadCountBands,
    safeWarningCategories,
    opaqueResultToken: `safe-donor-engine-result-token:${stableSha1(tokenSeed)}`,
    redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: true },
  };
}

function sanitiseReadonlyEngineStep1SafeSummary(summary, policyFingerprint, sourceFingerprint) {
  if (!isPlainObject(summary)) {
    return {
      ok: false,
      blocker: "missing-readonly-engine-step1-safe-summary",
      diagnostic: "A safe readonly Engine Step 1 summary is required for the real verification bridge boundary.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false },
    };
  }

  const blocker = unsafeBlocker(summary);
  if (blocker) {
    return {
      ok: false,
      blocker,
      diagnostic: "Readonly Engine Step 1 summary contained unsafe raw rows, payloads, exact values, private data, route, endpoint, mutation, generation, or artifact markers.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false, denyListHit: true },
    };
  }

  if (summary.ok !== true || summary.readonlyEngineStep1Ready !== true) {
    return {
      ok: false,
      blocker: summary.blocker || "readonly-engine-step1-safe-summary-not-ready",
      diagnostic: "Readonly Engine Step 1 did not provide a ready safe summary.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false },
    };
  }

  if (summary.hostLocalReadonlyEngineSeamInvoked !== true || summary.hostLocalReadonlyEngineResultProduced !== true) {
    return {
      ok: false,
      blocker: "readonly-engine-step1-safe-summary-not-produced",
      diagnostic: "Readonly Engine Step 1 must have consumed the host-local readonly seam and produced only its safe summary.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false },
    };
  }

  if (summary.candidatePayloadReturned === true || summary.rawSelectorPayloadReturned === true) {
    return {
      ok: false,
      blocker: "raw-selector-payload-not-approved",
      diagnostic: "Readonly Engine Step 1 may not expose the selector/candidate payload at the bridge boundary.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false, denyListHit: true },
    };
  }

  const safeEngineSummary = isPlainObject(summary.safeEngineSummary) ? summary.safeEngineSummary : null;
  if (!safeEngineSummary || safeEngineSummary.success !== true) {
    return {
      ok: false,
      blocker: "readonly-engine-step1-safe-engine-summary-not-successful",
      diagnostic: "Readonly Engine Step 1 safe Engine summary was missing or unsuccessful.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false },
    };
  }

  const step1Fingerprint = safeFingerprint(firstPresent(summary, [
    "readonlyEngineStep1Fingerprint",
    "summaryFingerprint",
    "fingerprint",
  ])) || safeFingerprint(summary.safeCandidateDerivation?.candidateFingerprint);
  if (!step1Fingerprint) {
    return {
      ok: false,
      blocker: "readonly-engine-step1-fingerprint-missing",
      diagnostic: "Readonly Engine Step 1 safe summary must carry a safe fingerprint before bridge verification can be claimed.",
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false },
    };
  }

  const broadCountBands = {
    runCountBand: countBand(safeEngineSummary.runCount ?? safeEngineSummary.run_count),
    candidateCountBand: countBand(safeEngineSummary.safeRunSummaryCount ?? safeEngineSummary.runCount ?? safeEngineSummary.run_count),
    warningCountBand: countBand(safeEngineSummary.warningCount ?? safeEngineSummary.warning_count),
    errorCountBand: countBand(safeEngineSummary.errorCount ?? safeEngineSummary.error_count),
  };
  const safeWarningCategories = normaliseWarnings([
    safeEngineSummary.firstWarning ? "engine-warning-present" : null,
    safeEngineSummary.firstError ? "engine-error-present" : null,
  ].filter(Boolean));
  const tokenSeed = {
    policyFingerprint,
    sourceFingerprint,
    step1Fingerprint,
    readonlySeamSummaryOnly: true,
    realEngineVerificationSummaryAvailable: true,
    broadCountBands,
    safeWarningCategories,
  };

  return {
    ok: true,
    broadCountBands,
    safeWarningCategories,
    opaqueResultToken: `safe-real-engine-verification-token:${stableSha1(tokenSeed)}`,
    redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: false },
    step1Fingerprint,
  };
}

function buildBridgeFingerprint(payload) {
  return `safe-controlled-donor-engine-verify-bridge:${stableSha1(payload)}`;
}

function baseSummary(extra = {}) {
  const blocker = extra.blocker || null;
  const ok = extra.ok === true;
  const syntheticFixtureOnly = extra.syntheticFixtureOnly !== false;
  const verificationMode = safeToken(extra.verificationMode, syntheticFixtureOnly ? "synthetic-fixture-contract" : "real-readonly-seam-summary");
  const readonlySeamSummaryOnly = extra.readonlySeamSummaryOnly === true;
  const realEngineVerificationSummaryAvailable = extra.realEngineVerificationSummaryAvailable === true;
  const acceptedSelectedResultAuthorityReady = false;
  const outputsReady = false;
  const state = String(extra.state || CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_STATE).trim() || CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_STATE;
  const sourceFingerprints = extra.sourceFingerprints || {
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
  };
  const projectionFingerprints = isPlainObject(extra.projectionFingerprints) ? extra.projectionFingerprints : {};
  const scaffoldFingerprints = isPlainObject(extra.scaffoldFingerprints) ? extra.scaffoldFingerprints : {};
  const broadCountBands = isPlainObject(extra.broadCountBands) ? extra.broadCountBands : {
    runCountBand: "unknown",
    candidateCountBand: "unknown",
    warningCountBand: "unknown",
  };
  const safeWarningCategories = Array.isArray(extra.safeWarningCategories) ? extra.safeWarningCategories : [];
  const redactionFlags = { ...REDACTION_FLAGS, ...(isPlainObject(extra.redactionFlags) ? extra.redactionFlags : {}) };
  const failClosedDiagnostics = Array.isArray(extra.failClosedDiagnostics)
    ? extra.failClosedDiagnostics.map((entry) => safeToken(entry, "diagnostic"))
    : [];
  const resultForFingerprint = {
    schemaId: CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_ID,
    schemaVersion: CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_VERSION,
    state,
    verificationMode,
    ok,
    blocker,
    sourceFingerprints,
    projectionFingerprints,
    scaffoldFingerprints,
    broadCountBands,
    safeWarningCategories,
    redactionFlags,
    syntheticFixtureOnly,
    readonlySeamSummaryOnly,
    realEngineVerificationSummaryAvailable,
    acceptedSelectedResultAuthorityReady,
    outputsReady,
  };

  const result = {
    schemaId: CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_ID,
    schemaVersion: CONTROLLED_DONOR_ENGINE_VERIFY_BRIDGE_SCHEMA_VERSION,
    state,
    readOnly: true,
    privateBridgeOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    syntheticFixtureOnly,
    verificationMode,
    readonlySeamSummaryOnly,
    realEngineVerificationSummaryAvailable,
    acceptedSelectedResultAuthorityReady,
    outputsReady,
    ok,
    bridgeReady: ok,
    safeEngineResultReady: ok,
    selectedResultSourceObjectReady: false,
    runTableDomainReadinessReady: ok,
    iesHandoffReadinessReady: false,
    blocker,
    blockers: blocker ? [blocker] : [],
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((entry) => safeToken(entry, "warning")) : [],
    safeWarningCategories,
    broadCountBands,
    opaqueResultToken: extra.opaqueResultToken || null,
    sourceFingerprints,
    projectionFingerprints,
    scaffoldFingerprints,
    redactionFlags,
    safetyFlags: clonePlain(safetyFlagsFor({
      syntheticFixtureOnly,
      readonlySeamSummaryOnly,
      realEngineVerificationSummaryAvailable,
      hostLocalReadonlyEngineSeamSummaryConsumed: extra.hostLocalReadonlyEngineSeamSummaryConsumed === true,
    })),
    failClosedDiagnostics,
    sanitizerAllowListVersion: "controlled-donor-engine-verify-bridge-allow-list.v1",
    sanitizerDenyListVersion: "controlled-donor-engine-verify-bridge-deny-list.v1",
    bridgeFingerprint: buildBridgeFingerprint(resultForFingerprint),
  };

  return Object.freeze(result);
}

function failClosed(blocker, diagnostic, extra = {}) {
  return baseSummary({
    ...extra,
    ok: false,
    blocker,
    redactionFlags: {
      ...(isPlainObject(extra.redactionFlags) ? extra.redactionFlags : {}),
      denyListHit: extra.denyListHit === true || extra.redactionFlags?.denyListHit === true,
    },
    failClosedDiagnostics: [blocker, diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

export function buildControlledDonorEngineVerifyBridgeSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};

  const topLevelUnsafe = unsafeBlocker(source);
  if (topLevelUnsafe) {
    const fingerprints = collectUpstreamFingerprints(source);
    return failClosed(topLevelUnsafe, "Controlled donor Engine verify bridge input contained unsafe raw rows, payloads, exact values, private data, mutation, persistence, generation, route, POST, or donor Engine markers.", {
      policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"])),
      sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])),
      ...fingerprints,
      redactionFlags: { ...REDACTION_FLAGS, rawDonorResultScanned: Boolean(rawFixtureFrom(source)), denyListHit: true },
      denyListHit: true,
    });
  }

  const readonlyEngineStep1SafeSummary = readonlyEngineStep1SafeSummaryFrom(source);
  const privateReadonlySeamBridgeGateApproved = hasPrivateReadonlySeamBridgeGate(source);
  if (privateReadonlySeamBridgeGateApproved || isPlainObject(readonlyEngineStep1SafeSummary)) {
    const upstreamFingerprints = collectUpstreamFingerprints(source);
    if (!privateReadonlySeamBridgeGateApproved) {
      return failClosed("private-readonly-engine-verification-bridge-gate-required", "A readonly seam summary was present, but the private real Engine verification bridge gate was not approved.", {
        policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"])),
        sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])),
        ...upstreamFingerprints,
        syntheticFixtureOnly: false,
        verificationMode: "readonly-seam-summary-only",
        readonlySeamSummaryOnly: true,
        realEngineVerificationSummaryAvailable: false,
      });
    }

    const resolvedFingerprints = resolveFingerprints(source);
    if (!resolvedFingerprints.ok) {
      return failClosed(resolvedFingerprints.blocker, resolvedFingerprints.diagnostic, {
        policyFingerprint: resolvedFingerprints.policyFingerprint,
        sourceFingerprint: resolvedFingerprints.sourceFingerprint,
        ...upstreamFingerprints,
        syntheticFixtureOnly: false,
        verificationMode: "readonly-seam-summary-only",
        readonlySeamSummaryOnly: true,
        realEngineVerificationSummaryAvailable: false,
      });
    }

    const { policyFingerprint, sourceFingerprint } = resolvedFingerprints;
    const sanitised = sanitiseReadonlyEngineStep1SafeSummary(readonlyEngineStep1SafeSummary, policyFingerprint, sourceFingerprint);
    if (!sanitised.ok) {
      return failClosed(sanitised.blocker, sanitised.diagnostic, {
        policyFingerprint,
        sourceFingerprint,
        ...upstreamFingerprints,
        syntheticFixtureOnly: false,
        verificationMode: "readonly-seam-summary-only",
        readonlySeamSummaryOnly: true,
        realEngineVerificationSummaryAvailable: false,
        redactionFlags: sanitised.redactionFlags,
        denyListHit: sanitised.redactionFlags?.denyListHit === true,
      });
    }

    return baseSummary({
      ok: true,
      state: "controlled_donor_engine_verify_bridge_real_readonly_seam_summary",
      verificationMode: "real-readonly-seam-summary",
      syntheticFixtureOnly: false,
      readonlySeamSummaryOnly: true,
      realEngineVerificationSummaryAvailable: true,
      hostLocalReadonlyEngineSeamSummaryConsumed: true,
      policyFingerprint,
      sourceFingerprint,
      ...upstreamFingerprints,
      broadCountBands: sanitised.broadCountBands,
      safeWarningCategories: sanitised.safeWarningCategories,
      opaqueResultToken: sanitised.opaqueResultToken,
      redactionFlags: sanitised.redactionFlags,
      warnings: [
        "Real readonly Engine verification summary is available from the private host-local seam.",
        "Only safe bands, fingerprints, and an opaque token are emitted; accepted selected-result authority and outputs remain blocked.",
      ],
      failClosedDiagnostics: [],
    });
  }

  if (!hasPrivateFixtureGate(source)) {
    const fingerprints = collectUpstreamFingerprints(source);
    return failClosed("donor-engine-invocation-not-approved", "Controlled donor Engine verify bridge is private and fail-closed until an explicit private synthetic-fixture gate is supplied. Donor Engine invocation remains disabled.", {
      policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"])),
      sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])),
      ...fingerprints,
    });
  }

  if (source.syntheticFixtureOnly !== true && source.syntheticDonorFixtureOnly !== true) {
    const fingerprints = collectUpstreamFingerprints(source);
    return failClosed("synthetic-fixture-only-required", "Only synthetic donor-shaped raw result fixtures are accepted by this contract test bridge.", {
      policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint"])),
      sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint"])),
      ...fingerprints,
    });
  }

  const resolvedFingerprints = resolveFingerprints(source);
  const upstreamFingerprints = collectUpstreamFingerprints(source);
  if (!resolvedFingerprints.ok) {
    return failClosed(resolvedFingerprints.blocker, resolvedFingerprints.diagnostic, {
      policyFingerprint: resolvedFingerprints.policyFingerprint,
      sourceFingerprint: resolvedFingerprints.sourceFingerprint,
      ...upstreamFingerprints,
    });
  }

  const { policyFingerprint, sourceFingerprint } = resolvedFingerprints;
  for (const spec of SUMMARY_SPECS) {
    const validation = validateSafeSummary(source, spec, policyFingerprint, sourceFingerprint);
    if (!validation.ok) {
      return failClosed(validation.blocker, validation.diagnostic, {
        policyFingerprint,
        sourceFingerprint,
        ...upstreamFingerprints,
      });
    }
  }

  const sanitised = sanitiseSyntheticDonorResultFixture(rawFixtureFrom(source), policyFingerprint, sourceFingerprint);
  if (!sanitised.ok) {
    return failClosed(sanitised.blocker, sanitised.diagnostic, {
      policyFingerprint,
      sourceFingerprint,
      ...upstreamFingerprints,
      redactionFlags: sanitised.redactionFlags,
      denyListHit: sanitised.redactionFlags?.denyListHit === true,
    });
  }

  return baseSummary({
    ok: true,
    policyFingerprint,
    sourceFingerprint,
    ...upstreamFingerprints,
    broadCountBands: sanitised.broadCountBands,
    safeWarningCategories: sanitised.safeWarningCategories,
    opaqueResultToken: sanitised.opaqueResultToken,
    redactionFlags: sanitised.redactionFlags,
    warnings: [
      "Synthetic fixture contract only: donor Engine was not invoked and no real donor payload was assembled.",
      "Raw donor-shaped fixture was scanned and quarantined; only safe bands, fingerprints, and an opaque token are emitted.",
    ],
    failClosedDiagnostics: [],
  });
}

export const buildRuntimeControlledDonorEngineVerifyBridgeSummary = buildControlledDonorEngineVerifyBridgeSummary;
export const buildEngineRunTableControlledDonorEngineVerifyBridgeStatus = buildControlledDonorEngineVerifyBridgeSummary;
