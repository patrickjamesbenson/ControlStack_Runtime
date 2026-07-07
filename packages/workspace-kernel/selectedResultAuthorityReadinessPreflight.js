import { stableFingerprint } from "./stableFingerprint.js";
import { SELECTED_RESULT_AUTHORITY_STATES } from "./selectedResultAuthorityGuard.js";

export const SELECTED_RESULT_AUTHORITY_PREFLIGHT_SCHEMA_ID =
  "controlstack.runtime.selected-result-authority-readiness-preflight.v1";
export const SELECTED_RESULT_AUTHORITY_PREFLIGHT_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES = Object.freeze({
  readonlyEngineSummaryOnly: SELECTED_RESULT_AUTHORITY_STATES.readonlyEngineSummaryOnly,
  verifiedSummaryReadyForAuthorityPreflight: "verified_summary_ready_for_authority_preflight",
  engineVerifiedSelectedResultReady: SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady,
  staleVerifyAgain: SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain,
  fingerprintMismatch: SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch,
  notComparedFailClosed: SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,520}$|^[0-9a-f]{32,128}$/i;

const UNSAFE_TRUE_KEYS = Object.freeze([
  "acceptedSelectedResultAuthorityReady",
  "acceptedSelectedResultAuthorityEnabled",
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "runTableGenerated",
  "productionRunTableGenerated",
  "iesGenerationEnabled",
  "iesGenerationAttempted",
  "iesGenerated",
  "outputGenerationEnabled",
  "drawingGenerationEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
  "routesAdded",
  "publicRouteAdded",
  "postEndpointsAdded",
  "postEndpointAdded",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawEngineResultReturned",
  "rawEngineResultExposed",
  "rawSelectorPayloadReturned",
  "rawSelectorPayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawRowsReturned",
  "rawRowsExposed",
  "rawBoardDataRowsExposed",
  "rawBoardDataHeadersExposed",
  "rawUsersExposed",
  "rawUsersReturned",
  "rawIesExposed",
  "rawPdfsExposed",
  "rawArtefactsExposed",
  "exactElectricalValuesReturned",
  "exactElectricalValuesExposed",
  "privatePathsExposed",
  "privatePathsReturned",
  "credentialsExposed",
  "credentialsReturned",
]);

const RAW_BODY_KEYS = Object.freeze([
  "body",
  "resultBody",
  "selectedResultBody",
  "selected_result_body",
  "selectedResultObject",
  "selected_result_object",
  "rawEnginePayload",
  "raw_engine_payload",
  "enginePayload",
  "rawEngineResult",
  "raw_engine_result",
  "engineResult",
  "selectorPayload",
  "rawSelectorPayload",
  "runTableRows",
  "rawRunTableRows",
  "rawSelectedPayload",
  "selectedPayload",
  "candela",
  "rawCandelaGrid",
  "ies",
  "iesText",
  "rawIesText",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null || value === undefined || String(value).trim() === "";
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function safeText(value, fallback = "", maxLength = 240) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function safeToken(value, fallback = "", maxLength = 180) {
  const text = safeText(value, fallback, maxLength);
  if (!text) return fallback;
  const token = text
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
  return token || fallback;
}

function safeFingerprint(value) {
  const token = safeToken(value, "", 540);
  if (!token) return null;
  return SAFE_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function canonicalFingerprint(value) {
  const fingerprint = safeFingerprint(value);
  return fingerprint ? fingerprint.toLowerCase().replace(/[-_:]+/g, ":") : null;
}

function fingerprintsDiffer(left, right) {
  const leftCanonical = canonicalFingerprint(left);
  const rightCanonical = canonicalFingerprint(right);
  return Boolean(leftCanonical && rightCanonical && leftCanonical !== rightCanonical);
}

function hasUnsafeInput(value, depth = 0, seen = new Set()) {
  if (depth > 8) return null;
  if (typeof value === "string") return PRIVATE_PATH_PATTERN.test(value) ? "private-path-not-approved" : null;
  if (Array.isArray(value)) {
    for (const item of value.slice(0, 60)) {
      const nested = hasUnsafeInput(item, depth + 1, seen);
      if (nested) return nested;
    }
    return null;
  }
  if (!isPlainObject(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, nested] of Object.entries(value)) {
    if (RAW_BODY_KEYS.includes(key) && nested !== false && nested !== null && nested !== undefined) {
      return `raw-body-key-${safeToken(key, "unsafe")}`;
    }
    if (UNSAFE_TRUE_KEYS.includes(key) && nested === true) {
      return `unsafe-true-flag-${safeToken(key, "flag")}`;
    }
    const child = hasUnsafeInput(nested, depth + 1, seen);
    if (child) return child;
  }
  return null;
}

function nonEmptyObject(value) {
  return isPlainObject(value) && Object.values(value).some((entry) => !isBlank(entry));
}

function bridgeReady(bridge) {
  return isPlainObject(bridge)
    && bridge.ok === true
    && bridge.bridgeReady === true
    && bridge.safeEngineResultReady === true
    && bridge.readOnly === true
    && bridge.privateBridgeOnly === true
    && bridge.safeSummaryOnly === true
    && bridge.readonlySeamSummaryOnly === true
    && bridge.realEngineVerificationSummaryAvailable === true
    && bridge.acceptedSelectedResultAuthorityReady !== true
    && bridge.outputsReady !== true;
}

function verifiedSummaryPresent(verifiedSummary, bridge) {
  if (isPlainObject(verifiedSummary)
    && (verifiedSummary.ok === true || verifiedSummary.readonlyEngineStep1Ready === true || verifiedSummary.safeEngineSummaryReady === true)) {
    return true;
  }
  return bridgeReady(bridge);
}

function sourceObjectReady(sourceObject) {
  return isPlainObject(sourceObject)
    && (sourceObject.ok === true || sourceObject.selectedResultSourceObjectAvailable === true)
    && sourceObject.readOnly !== false
    && sourceObject.selectedResultPersisted !== true
    && sourceObject.selectedResultPersistenceEnabled !== true;
}

function projectionReady(projection) {
  return isPlainObject(projection)
    && projection.sourceAvailable === true
    && projection.selectedResultAvailable === true
    && projection.engineVerified === true
    && projection.stale !== true
    && projection.selectedResultPersistenceEnabled !== true
    && projection.runTableGenerationEnabled !== true
    && projection.iesGenerationEnabled !== true
    && projection.outputGenerationEnabled !== true
    && projection.routesAdded !== true
    && projection.postEndpointsAdded !== true;
}

function guardReady(guard) {
  return isPlainObject(guard)
    && guard.selectedResultAuthorityGuardReady === true
    && guard.readOnly === true
    && guard.diagnosticOnly === true
    && guard.selectedResultPersisted !== true
    && guard.selectedResultPersistenceEnabled !== true
    && guard.runTableGenerationEnabled !== true
    && guard.iesGenerationEnabled !== true
    && guard.outputGenerationEnabled !== true;
}

function selectedResultCandidatePathIsSingle(projection) {
  const explicitCounts = [
    firstPresent(projection, ["acceptedResultCandidateCount", "selectedResultCandidateCount", "acceptedCandidateCount"]),
  ].filter((value) => !isBlank(value));
  for (const count of explicitCounts) {
    const number = Number(count);
    if (!Number.isFinite(number) || number !== 1) return false;
  }
  if (explicitCounts.length > 0) return true;
  return projection.oneSuccessfulAcceptedResult === true
    || (projection.accepted === true && projection.acceptedSelectedResultAvailable === true && projection.selectedResultAvailable === true);
}

function fingerprintSet({ source = {}, projection = {}, sourceObject = {}, bridge = {}, handoff = {} } = {}) {
  const policyFingerprint = safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])
    ?? firstPresent(bridge.sourceFingerprints || {}, ["policyFingerprint", "safePolicyFingerprint"])
    ?? firstPresent(handoff, ["policyFingerprint", "safePolicyFingerprint"])
    ?? firstPresent(projection, ["policyFingerprint", "safePolicyFingerprint"])
    ?? firstPresent(sourceObject, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceFingerprint = safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])
    ?? firstPresent(bridge.sourceFingerprints || {}, ["sourceFingerprint", "safeSourceFingerprint"])
    ?? firstPresent(handoff, ["sourceFingerprint", "safeSourceFingerprint"])
    ?? firstPresent(projection, ["sourceFingerprint", "safeSourceFingerprint"])
    ?? firstPresent(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"]));
  const sourceInputFingerprint = safeFingerprint(firstPresent(source, ["sourceInputFingerprint", "currentSourceInputFingerprint"])
    ?? firstPresent(projection, ["sourceInputFingerprint", "source_input_fingerprint"])
    ?? firstPresent(projection.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"])
    ?? firstPresent(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"]));
  const sourceVersionFingerprint = safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
    ?? firstPresent(projection, ["boardDataSourceVersion", "sourceVersionMarker"])
    ?? firstPresent(projection.boardDataSourceVersionMetadata || {}, ["value", "fingerprint"])
    ?? firstPresent(sourceObject, ["sourceVersionMarker", "boardDataSourceVersion"]));
  return {
    policyFingerprint,
    sourceFingerprint,
    sourceInputFingerprint,
    sourceVersionFingerprint,
  };
}

function staleComparablePairs(guard) {
  return Array.isArray(guard?.comparisonPairs)
    ? guard.comparisonPairs.filter((pair) => pair && pair.comparable === true)
    : [];
}

function staleComparisonClean(guard) {
  const pairs = staleComparablePairs(guard);
  return pairs.length > 0 && pairs.every((pair) => pair.stale !== true);
}

function validateFingerprintAlignment({ projection = {}, sourceObject = {}, fingerprints = {}, source = {} } = {}) {
  const expectedPolicy = fingerprints.policyFingerprint;
  const expectedSource = fingerprints.sourceFingerprint;
  const projectionPolicy = safeFingerprint(firstPresent(projection, ["policyFingerprint", "safePolicyFingerprint"]));
  const projectionSource = safeFingerprint(firstPresent(projection, ["sourceFingerprint", "safeSourceFingerprint"]));
  const sourceObjectPolicy = safeFingerprint(firstPresent(sourceObject, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceObjectSource = safeFingerprint(firstPresent(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"]));

  const checks = [
    ["projection policy", projectionPolicy, expectedPolicy],
    ["projection source", projectionSource, expectedSource],
    ["source-object policy", sourceObjectPolicy, expectedPolicy],
    ["source-object source", sourceObjectSource, expectedSource],
  ];
  for (const [label, actual, expected] of checks) {
    if (fingerprintsDiffer(actual, expected)) return `${label} fingerprint mismatch`;
  }

  const currentSourceInputFingerprint = safeFingerprint(firstPresent(source, ["currentSourceInputFingerprint"]));
  if (fingerprintsDiffer(fingerprints.sourceInputFingerprint, currentSourceInputFingerprint)) {
    return "current/source-input fingerprint mismatch";
  }
  return null;
}

function result(state, reason, extra = {}) {
  const fingerprint = stableFingerprint("safe-selected-result-authority-readiness-preflight", {
    state,
    reason,
    bridgeFingerprint: extra.bridgeFingerprint || null,
    authorityGuardFingerprint: extra.authorityGuardFingerprint || null,
    selectedResultProjectionFingerprint: extra.selectedResultProjectionFingerprint || null,
    safeSelectedResultSourceObjectFingerprint: extra.safeSelectedResultSourceObjectFingerprint || null,
    fingerprints: extra.fingerprints || {},
  });
  const preflightReady = state === SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.verifiedSummaryReadyForAuthorityPreflight
    || state === SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.engineVerifiedSelectedResultReady;
  const engineVerifiedSelectedResultReady = state === SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.engineVerifiedSelectedResultReady;

  return Object.freeze({
    schemaId: SELECTED_RESULT_AUTHORITY_PREFLIGHT_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_AUTHORITY_PREFLIGHT_SCHEMA_VERSION,
    state,
    acceptedAuthorityReadinessPreflightReady: preflightReady,
    readyForLaterAcceptedAuthority: engineVerifiedSelectedResultReady,
    engineVerifiedSelectedResultReady,
    failClosed: !preflightReady,
    blocker: preflightReady ? null : safeToken(reason, state, 180),
    reason: safeText(reason, state, 260),
    diagnosticOnly: true,
    readOnly: true,
    preflightOnly: true,
    safeSummaryOnly: true,
    accepted: false,
    acceptedSelectedResultAuthorityReady: false,
    acceptedSelectedResultAuthorityEnabled: false,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersistenceAttempted: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    runtimeDataMutationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawRunTableRowsReturned: false,
    rawSelectedPayloadReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    fingerprints: clonePlain(extra.fingerprints || {}),
    bridgeFingerprint: extra.bridgeFingerprint || null,
    selectedResultAuthorityGuardFingerprint: extra.authorityGuardFingerprint || null,
    selectedResultProjectionFingerprint: extra.selectedResultProjectionFingerprint || null,
    safeSelectedResultSourceObjectFingerprint: extra.safeSelectedResultSourceObjectFingerprint || null,
    checks: clonePlain(extra.checks || {}),
    rows: [
      ["preflight state", state],
      ["preflight ready", preflightReady ? "true" : "false"],
      ["ready for later accepted authority", engineVerifiedSelectedResultReady ? "true" : "false"],
      ["accepted authority enabled", "false"],
      ["selected result persisted", "false"],
      ["RunTable generated", "false"],
      ["IES generated", "false"],
      ["outputs generated", "false"],
      ["reason", safeText(reason, state, 260)],
    ],
    safetyFlags: {
      readOnly: true,
      diagnosticOnly: true,
      preflightOnly: true,
      safeSummaryOnly: true,
      acceptedSelectedResultAuthorityEnabled: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersisted: false,
      runTableGenerationEnabled: false,
      runTableGenerated: false,
      iesGenerationEnabled: false,
      iesGenerated: false,
      outputGenerationEnabled: false,
      runtimeDataMutationEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      rawSelectorPayloadReturned: false,
      rawRunTableRowsReturned: false,
      rawSelectedPayloadReturned: false,
      exactElectricalValuesReturned: false,
      privatePathsReturned: false,
    },
    selectedResultAuthorityReadinessPreflightFingerprint: fingerprint,
  });
}

export function buildSelectedResultAuthorityReadinessPreflight(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const bridge = isPlainObject(source.privateVerificationBridgeSummary)
    ? source.privateVerificationBridgeSummary
    : isPlainObject(source.controlledDonorEngineVerifyBridgeSummary)
      ? source.controlledDonorEngineVerifyBridgeSummary
      : {};
  const projection = isPlainObject(source.selectedResultProjectionSummary)
    ? source.selectedResultProjectionSummary
    : isPlainObject(source.selectedResultProjection)
      ? source.selectedResultProjection
      : {};
  const sourceObject = isPlainObject(source.safeSelectedResultSourceObjectSummary)
    ? source.safeSelectedResultSourceObjectSummary
    : isPlainObject(source.safeSelectedResultSourceObject)
      ? source.safeSelectedResultSourceObject
      : {};
  const guard = isPlainObject(source.selectedResultAuthorityGuardSummary)
    ? source.selectedResultAuthorityGuardSummary
    : isPlainObject(source.authorityGuardSummary)
      ? source.authorityGuardSummary
      : {};
  const handoff = isPlainObject(source.selectedResultHandoffScaffoldSummary)
    ? source.selectedResultHandoffScaffoldSummary
    : {};

  const unsafe = hasUnsafeInput({
    ...source,
    privateVerificationBridgeSummary: undefined,
    controlledDonorEngineVerifyBridgeSummary: undefined,
    selectedResultProjectionSummary: undefined,
    selectedResultProjection: undefined,
    safeSelectedResultSourceObjectSummary: undefined,
    safeSelectedResultSourceObject: undefined,
    selectedResultAuthorityGuardSummary: undefined,
    authorityGuardSummary: undefined,
    selectedResultHandoffScaffoldSummary: undefined,
  }) || hasUnsafeInput(bridge) || hasUnsafeInput(projection) || hasUnsafeInput(sourceObject) || hasUnsafeInput(guard) || hasUnsafeInput(handoff);

  const fingerprints = fingerprintSet({ source, projection, sourceObject, bridge, handoff });
  const common = {
    fingerprints,
    bridgeFingerprint: safeFingerprint(bridge.bridgeFingerprint),
    authorityGuardFingerprint: safeFingerprint(guard.selectedResultAuthorityGuardFingerprint),
    selectedResultProjectionFingerprint: safeFingerprint(firstPresent(projection, ["selectedResultProjectionFingerprint", "fingerprint"])
      ?? firstPresent(projection.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"])),
    safeSelectedResultSourceObjectFingerprint: safeFingerprint(firstPresent(sourceObject, ["safeSelectedResultSourceObjectFingerprint", "fingerprint", "sourceInputFingerprint"])),
  };

  if (unsafe) {
    return result(SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.notComparedFailClosed, `unsafe input rejected: ${unsafe}`, common);
  }

  const checks = {
    verifiedSummaryPresent: verifiedSummaryPresent(source.verifiedSummary || source.readonlyEngineStep1SafeSummary, bridge),
    privateVerificationBridgeReady: bridgeReady(bridge),
    safeSelectedResultSourceObjectReady: sourceObjectReady(sourceObject),
    selectedResultProjectionReady: projectionReady(projection),
    selectedResultAuthorityGuardReady: guardReady(guard),
    sourcePolicyFingerprintPresent: Boolean(fingerprints.policyFingerprint),
    sourceFingerprintPresent: Boolean(fingerprints.sourceFingerprint),
    sourceInputFingerprintPresent: Boolean(fingerprints.sourceInputFingerprint),
    sourceVersionFingerprintPresent: Boolean(fingerprints.sourceVersionFingerprint),
    selectedFamilySubsetLockPresent: nonEmptyObject(projection.selectedFamilySubsetLock),
    perRunLookupNormalised: projection.perRunLookupNormalised === true,
    oneAcceptedResultReadyCandidatePathOnly: selectedResultCandidatePathIsSingle(projection),
    staleComparisonAttempted: guard.comparisonAttempted === true && staleComparablePairs(guard).length > 0,
    staleComparisonClean: staleComparisonClean(guard),
  };

  const stateFromGuard = safeToken(guard.state || guard.selectedResultAuthorityState, SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.notComparedFailClosed);
  if (stateFromGuard === SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.staleVerifyAgain || guard.stale === true || projection.stale === true) {
    return result(SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.staleVerifyAgain, guard.reason || "safe fingerprint comparison indicates stale selected result", { ...common, checks });
  }
  if (stateFromGuard === SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.fingerprintMismatch) {
    return result(SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.fingerprintMismatch, guard.reason || "selected-result fingerprints do not match", { ...common, checks });
  }

  const alignmentMismatch = validateFingerprintAlignment({ projection, sourceObject, fingerprints, source });
  if (alignmentMismatch) {
    return result(SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.fingerprintMismatch, alignmentMismatch, { ...common, checks });
  }

  const missingCoreCheck = Object.entries({
    verifiedSummaryPresent: checks.verifiedSummaryPresent,
    privateVerificationBridgeReady: checks.privateVerificationBridgeReady,
    safeSelectedResultSourceObjectReady: checks.safeSelectedResultSourceObjectReady,
    selectedResultProjectionReady: checks.selectedResultProjectionReady,
    selectedResultAuthorityGuardReady: checks.selectedResultAuthorityGuardReady,
    sourcePolicyFingerprintPresent: checks.sourcePolicyFingerprintPresent,
    sourceFingerprintPresent: checks.sourceFingerprintPresent,
    sourceInputFingerprintPresent: checks.sourceInputFingerprintPresent,
    sourceVersionFingerprintPresent: checks.sourceVersionFingerprintPresent,
  }).find(([, ok]) => ok !== true);
  if (missingCoreCheck) {
    return result(SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.notComparedFailClosed, `${missingCoreCheck[0]} not ready`, { ...common, checks });
  }

  const isSummaryOnly = projection.summaryProjectionOnly === true
    || projection.accepted !== true
    || projection.acceptedSelectedResultAvailable !== true
    || stateFromGuard === SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.readonlyEngineSummaryOnly;

  if (isSummaryOnly) {
    return result(
      SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.verifiedSummaryReadyForAuthorityPreflight,
      "verified summary is ready for accepted-authority preflight, but detailed accepted selected-result authority remains disabled",
      { ...common, checks },
    );
  }

  const missingAuthorityCheck = Object.entries({
    selectedFamilySubsetLockPresent: checks.selectedFamilySubsetLockPresent,
    perRunLookupNormalised: checks.perRunLookupNormalised,
    oneAcceptedResultReadyCandidatePathOnly: checks.oneAcceptedResultReadyCandidatePathOnly,
    staleComparisonAttempted: checks.staleComparisonAttempted,
    staleComparisonClean: checks.staleComparisonClean,
  }).find(([, ok]) => ok !== true);
  if (missingAuthorityCheck) {
    return result(SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.notComparedFailClosed, `${missingAuthorityCheck[0]} not ready`, { ...common, checks });
  }

  if (stateFromGuard !== SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.engineVerifiedSelectedResultReady
    || guard.failClosed !== false
    || guard.authorityReady !== true
    || projection.engineVerified !== true
    || projection.selectedResultAvailable !== true
    || projection.accepted !== true
    || projection.acceptedSelectedResultAvailable !== true) {
    return result(SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.notComparedFailClosed, "selected-result authority guard did not prove detailed engine-verified readiness", { ...common, checks });
  }

  return result(
    SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.engineVerifiedSelectedResultReady,
    "engine-verified selected-result metadata is ready for a later accepted-authority step; no authority, persistence, or outputs were enabled",
    { ...common, checks },
  );
}

export const buildAcceptedSelectedResultAuthorityReadinessPreflight = buildSelectedResultAuthorityReadinessPreflight;
