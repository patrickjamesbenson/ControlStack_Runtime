import {
  SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES,
} from "./selectedResultAuthorityReadinessPreflight.js";
import { SELECTED_RESULT_AUTHORITY_STATES } from "./selectedResultAuthorityGuard.js";
import { stableFingerprint } from "./stableFingerprint.js";

export const ACCEPTED_SELECTED_RESULT_AUTHORITY_GATE_SCHEMA_ID =
  "controlstack.runtime.accepted-selected-result-authority-gate.v1";
export const ACCEPTED_SELECTED_RESULT_AUTHORITY_GATE_SCHEMA_VERSION = 1;

export const ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES = Object.freeze({
  readonlyEngineSummaryOnly: SELECTED_RESULT_AUTHORITY_STATES.readonlyEngineSummaryOnly,
  verifiedSummaryReadyForAuthorityPreflight:
    SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.verifiedSummaryReadyForAuthorityPreflight,
  engineVerifiedSelectedResultReady: SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady,
  acceptedSelectedResultAuthority: "accepted_selected_result_authority",
  staleVerifyAgain: SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain,
  fingerprintMismatch: SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch,
  notComparedFailClosed: SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,520}$|^[0-9a-f]{32,128}$/i;

const UNSAFE_TRUE_KEYS = Object.freeze([
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

function safeText(value, fallback = "", maxLength = 260) {
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
    && bridge.outputsReady !== true;
}

function verifiedSummaryPresent(verifiedSummary, bridge) {
  if (isPlainObject(verifiedSummary)
    && (verifiedSummary.ok === true
      || verifiedSummary.readonlyEngineStep1Ready === true
      || verifiedSummary.safeEngineSummaryReady === true)) {
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

function projectionReadyForAcceptedAuthority(projection) {
  return isPlainObject(projection)
    && projection.sourceAvailable === true
    && projection.selectedResultAvailable === true
    && projection.accepted === true
    && projection.acceptedSelectedResultAvailable === true
    && projection.engineVerified === true
    && projection.stale !== true
    && projection.summaryProjectionOnly !== true
    && projection.selectedResultPersistenceEnabled !== true
    && projection.runTableGenerationEnabled !== true
    && projection.iesGenerationEnabled !== true
    && projection.outputGenerationEnabled !== true
    && projection.routesAdded !== true
    && projection.postEndpointsAdded !== true;
}

function guardReadyForAcceptedAuthority(guard) {
  return isPlainObject(guard)
    && guard.selectedResultAuthorityGuardReady === true
    && guard.state === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady
    && guard.failClosed === false
    && guard.authorityReady === true
    && guard.stale !== true
    && guard.readOnly === true
    && guard.selectedResultPersisted !== true
    && guard.selectedResultPersistenceEnabled !== true
    && guard.runTableGenerationEnabled !== true
    && guard.iesGenerationEnabled !== true
    && guard.outputGenerationEnabled !== true;
}

function preflightReadyForAcceptedAuthority(preflight) {
  return isPlainObject(preflight)
    && preflight.state === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady
    && preflight.acceptedAuthorityReadinessPreflightReady === true
    && preflight.readyForLaterAcceptedAuthority === true
    && preflight.engineVerifiedSelectedResultReady === true
    && preflight.failClosed === false
    && preflight.acceptedSelectedResultAuthorityReady !== true
    && preflight.selectedResultPersisted !== true
    && preflight.runTableGenerated !== true
    && preflight.iesGenerated !== true
    && preflight.outputGenerationEnabled !== true;
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
    || (projection.accepted === true
      && projection.acceptedSelectedResultAvailable === true
      && projection.selectedResultAvailable === true);
}

function comparablePairs(guard) {
  return Array.isArray(guard?.comparisonPairs)
    ? guard.comparisonPairs.filter((pair) => pair && pair.comparable === true)
    : [];
}

function staleComparisonClean(guard) {
  const pairs = comparablePairs(guard);
  return pairs.length > 0 && pairs.every((pair) => pair.stale !== true);
}

function fingerprintsFrom({ source = {}, preflight = {}, projection = {}, sourceObject = {}, bridge = {} } = {}) {
  const preflightFingerprints = isPlainObject(preflight.fingerprints) ? preflight.fingerprints : {};
  return {
    policyFingerprint: safeFingerprint(firstPresent(source, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"])
      ?? firstPresent(preflightFingerprints, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(bridge.sourceFingerprints || {}, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(projection, ["policyFingerprint", "safePolicyFingerprint"])
      ?? firstPresent(sourceObject, ["policyFingerprint", "safePolicyFingerprint"])),
    sourceFingerprint: safeFingerprint(firstPresent(source, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"])
      ?? firstPresent(preflightFingerprints, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(bridge.sourceFingerprints || {}, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(projection, ["sourceFingerprint", "safeSourceFingerprint"])
      ?? firstPresent(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"])),
    sourceInputFingerprint: safeFingerprint(firstPresent(source, ["sourceInputFingerprint", "currentSourceInputFingerprint"])
      ?? firstPresent(preflightFingerprints, ["sourceInputFingerprint", "currentSourceInputFingerprint"])
      ?? firstPresent(projection, ["sourceInputFingerprint", "source_input_fingerprint"])
      ?? firstPresent(projection.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"])),
    sourceVersionFingerprint: safeFingerprint(firstPresent(source, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(preflightFingerprints, ["sourceVersionFingerprint", "boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(projection, ["boardDataSourceVersion", "sourceVersionMarker"])
      ?? firstPresent(projection.boardDataSourceVersionMetadata || {}, ["value", "fingerprint"])
      ?? firstPresent(sourceObject, ["sourceVersionMarker", "boardDataSourceVersion"])),
  };
}

function fingerprintAlignmentMismatch({ source = {}, fingerprints = {}, projection = {}, sourceObject = {} } = {}) {
  const projectionPolicy = safeFingerprint(firstPresent(projection, ["policyFingerprint", "safePolicyFingerprint"]));
  const projectionSource = safeFingerprint(firstPresent(projection, ["sourceFingerprint", "safeSourceFingerprint"]));
  const sourceObjectPolicy = safeFingerprint(firstPresent(sourceObject, ["policyFingerprint", "safePolicyFingerprint"]));
  const sourceObjectSource = safeFingerprint(firstPresent(sourceObject, ["sourceFingerprint", "safeSourceFingerprint"]));
  const checks = [
    ["projection policy", projectionPolicy, fingerprints.policyFingerprint],
    ["projection source", projectionSource, fingerprints.sourceFingerprint],
    ["source-object policy", sourceObjectPolicy, fingerprints.policyFingerprint],
    ["source-object source", sourceObjectSource, fingerprints.sourceFingerprint],
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
  const accepted = state === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.acceptedSelectedResultAuthority;
  const fingerprint = stableFingerprint("safe-accepted-selected-result-authority-gate", {
    state,
    reason,
    preflightFingerprint: extra.preflightFingerprint || null,
    authorityGuardFingerprint: extra.authorityGuardFingerprint || null,
    selectedResultProjectionFingerprint: extra.selectedResultProjectionFingerprint || null,
    safeSelectedResultSourceObjectFingerprint: extra.safeSelectedResultSourceObjectFingerprint || null,
    fingerprints: extra.fingerprints || {},
  });
  return Object.freeze({
    schemaId: ACCEPTED_SELECTED_RESULT_AUTHORITY_GATE_SCHEMA_ID,
    schemaVersion: ACCEPTED_SELECTED_RESULT_AUTHORITY_GATE_SCHEMA_VERSION,
    state,
    selectedResultAuthorityState: state,
    acceptedSelectedResultAuthorityReady: accepted,
    acceptedSelectedResultAuthority: accepted,
    acceptedForReadOnlyRuntimeAuthority: accepted,
    engineVerifiedSelectedResultReady: accepted
      || state === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady,
    failClosed: !accepted,
    blocker: accepted ? null : safeToken(reason, state, 180),
    reason: safeText(reason, state, 280),
    readOnly: true,
    authorityGateOnly: true,
    safeSummaryOnly: true,
    summaryOnly: true,
    accepted,
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
    rawRowsReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    fingerprints: clonePlain(extra.fingerprints || {}),
    selectedResultAuthorityReadinessPreflightFingerprint: extra.preflightFingerprint || null,
    selectedResultAuthorityGuardFingerprint: extra.authorityGuardFingerprint || null,
    selectedResultProjectionFingerprint: extra.selectedResultProjectionFingerprint || null,
    safeSelectedResultSourceObjectFingerprint: extra.safeSelectedResultSourceObjectFingerprint || null,
    checks: clonePlain(extra.checks || {}),
    rows: [
      ["authority gate state", state],
      ["accepted selected-result authority", accepted ? "true" : "false"],
      ["accepted authority enabled", "false"],
      ["selected result persisted", "false"],
      ["RunTable generated", "false"],
      ["IES generated", "false"],
      ["outputs generated", "false"],
      ["routes added", "false"],
      ["POST endpoints added", "false"],
      ["RuntimeData mutation", "false"],
      ["reason", safeText(reason, state, 280)],
    ],
    safetyFlags: {
      readOnly: true,
      authorityGateOnly: true,
      safeSummaryOnly: true,
      acceptedSelectedResultAuthorityReady: accepted,
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
    acceptedSelectedResultAuthorityGateFingerprint: fingerprint,
  });
}

export function buildAcceptedSelectedResultAuthorityGate(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const preflight = isPlainObject(source.selectedResultAuthorityReadinessPreflightSummary)
    ? source.selectedResultAuthorityReadinessPreflightSummary
    : isPlainObject(source.acceptedAuthorityReadinessPreflightSummary)
      ? source.acceptedAuthorityReadinessPreflightSummary
      : {};
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

  const unsafe = hasUnsafeInput({
    ...source,
    selectedResultAuthorityReadinessPreflightSummary: undefined,
    acceptedAuthorityReadinessPreflightSummary: undefined,
    privateVerificationBridgeSummary: undefined,
    controlledDonorEngineVerifyBridgeSummary: undefined,
    selectedResultProjectionSummary: undefined,
    selectedResultProjection: undefined,
    safeSelectedResultSourceObjectSummary: undefined,
    safeSelectedResultSourceObject: undefined,
    selectedResultAuthorityGuardSummary: undefined,
    authorityGuardSummary: undefined,
  }) || hasUnsafeInput(preflight) || hasUnsafeInput(bridge) || hasUnsafeInput(projection) || hasUnsafeInput(sourceObject) || hasUnsafeInput(guard);

  const fingerprints = fingerprintsFrom({ source, preflight, projection, sourceObject, bridge });
  const common = {
    fingerprints,
    preflightFingerprint: safeFingerprint(preflight.selectedResultAuthorityReadinessPreflightFingerprint),
    authorityGuardFingerprint: safeFingerprint(guard.selectedResultAuthorityGuardFingerprint),
    selectedResultProjectionFingerprint: safeFingerprint(firstPresent(projection, ["selectedResultProjectionFingerprint", "fingerprint"])
      ?? firstPresent(projection.sourceInputFingerprintMetadata || {}, ["value", "fingerprint"])),
    safeSelectedResultSourceObjectFingerprint: safeFingerprint(firstPresent(sourceObject, ["safeSelectedResultSourceObjectFingerprint", "fingerprint", "sourceInputFingerprint"])),
  };

  if (unsafe) {
    return result(
      ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
      `unsafe input rejected: ${unsafe}`,
      common,
    );
  }

  const preflightState = safeToken(preflight.state, ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed);
  if (preflightState === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain
    || guard.stale === true
    || projection.stale === true) {
    return result(
      ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain,
      preflight.reason || guard.reason || "safe fingerprint comparison indicates stale selected result",
      common,
    );
  }

  if (preflightState === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch
    || guard.state === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch) {
    return result(
      ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch,
      preflight.reason || guard.reason || "selected-result fingerprints do not match",
      common,
    );
  }

  if (preflightState === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.readonlyEngineSummaryOnly
    || preflightState === ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.verifiedSummaryReadyForAuthorityPreflight) {
    return result(
      preflightState,
      preflight.reason || "readonly verified summary is not detailed accepted selected-result authority",
      common,
    );
  }

  const checks = {
    verifiedSummaryPresent: verifiedSummaryPresent(source.verifiedSummary || source.readonlyEngineStep1SafeSummary, bridge),
    privateVerificationBridgeReady: bridgeReady(bridge),
    safeSelectedResultSourceObjectReady: sourceObjectReady(sourceObject),
    selectedResultProjectionReady: projectionReadyForAcceptedAuthority(projection),
    selectedResultAuthorityGuardReady: guardReadyForAcceptedAuthority(guard),
    acceptedAuthorityReadinessPreflightReady: preflightReadyForAcceptedAuthority(preflight),
    sourcePolicyFingerprintPresent: Boolean(fingerprints.policyFingerprint),
    sourceFingerprintPresent: Boolean(fingerprints.sourceFingerprint),
    sourceInputFingerprintPresent: Boolean(fingerprints.sourceInputFingerprint),
    sourceVersionFingerprintPresent: Boolean(fingerprints.sourceVersionFingerprint),
    selectedFamilySubsetLockPresent: nonEmptyObject(projection.selectedFamilySubsetLock),
    perRunLookupNormalised: projection.perRunLookupNormalised === true,
    oneAcceptedResultReadyCandidatePathOnly: selectedResultCandidatePathIsSingle(projection),
    staleComparisonAttempted: guard.comparisonAttempted === true && comparablePairs(guard).length > 0,
    staleComparisonClean: staleComparisonClean(guard),
  };

  const alignmentMismatch = fingerprintAlignmentMismatch({ source, fingerprints, projection, sourceObject });
  if (alignmentMismatch) {
    return result(
      ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch,
      alignmentMismatch,
      { ...common, checks },
    );
  }

  const missingCheck = Object.entries(checks).find(([, ok]) => ok !== true);
  if (missingCheck) {
    return result(
      ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
      `${missingCheck[0]} not ready`,
      { ...common, checks },
    );
  }

  return result(
    ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.acceptedSelectedResultAuthority,
    "accepted selected-result authority is established for read-only Runtime authority only; persistence, RunTable, IES, outputs, routes, POST endpoints, mutation, and raw exposure remain disabled",
    { ...common, checks },
  );
}

export const buildRuntimeAcceptedSelectedResultAuthorityGate = buildAcceptedSelectedResultAuthorityGate;
