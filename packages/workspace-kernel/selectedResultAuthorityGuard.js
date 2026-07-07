import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTED_RESULT_AUTHORITY_GUARD_SCHEMA_ID =
  "controlstack.runtime.selected-result-authority-guard.v1";
export const SELECTED_RESULT_AUTHORITY_GUARD_SCHEMA_VERSION = 1;

export const SELECTED_RESULT_AUTHORITY_STATES = Object.freeze({
  readonlyEngineSummaryOnly: "readonly_engine_summary_only",
  engineVerifiedSelectedResultReady: "engine_verified_selected_result_ready",
  acceptedSelectedResultAuthority: "accepted_selected_result_authority",
  staleVerifyAgain: "stale_verify_again",
  fingerprintMismatch: "fingerprint_mismatch",
  notComparedFailClosed: "not_compared_fail_closed",
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:|ControlStack[\\/])/i;
const SAFE_FINGERPRINT_PATTERN = /^safe[-:][0-9A-Za-z_.:-]{4,520}$|^[0-9a-f]{32,128}$/i;

const UNSAFE_TRUE_KEYS = Object.freeze([
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

function safeText(value, fallback = "", maxLength = 220) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[\u0000-\u001f\u007f]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, maxLength) : fallback;
}

function safeToken(value, fallback = "") {
  const text = safeText(value, fallback, 180);
  if (!text) return fallback;
  const token = text
    .replace(/[^0-9A-Za-z_.:-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 180);
  return token || fallback;
}

function safeFingerprint(value) {
  const token = safeToken(value, "").slice(0, 540);
  if (!token) return null;
  return SAFE_FINGERPRINT_PATTERN.test(token) ? token : null;
}

function canonicalFingerprint(value) {
  const fingerprint = safeFingerprint(value);
  return fingerprint ? fingerprint.toLowerCase().replace(/[-_:]+/g, ":") : null;
}

function safeFingerprintsDiffer(left, right) {
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

function fingerprintFromProjection(summary = {}) {
  if (!isPlainObject(summary)) return null;
  return safeFingerprint(firstPresent(summary, [
    "selectedResultProjectionFingerprint",
    "sourceInputFingerprint",
    "source_input_fingerprint",
    "selectorPayloadFingerprint",
    "summaryFingerprint",
    "fingerprint",
  ]) ?? firstPresent(summary.sourceInputFingerprintMetadata, ["value", "fingerprint"]));
}

function fingerprintFromSourceObject(summary = {}) {
  if (!isPlainObject(summary)) return null;
  return safeFingerprint(firstPresent(summary, [
    "safeSelectedResultSourceObjectFingerprint",
    "sourceInputFingerprint",
    "source_input_fingerprint",
    "sourceVersionMarker",
    "summaryFingerprint",
    "fingerprint",
  ]));
}

function policyFingerprintFrom(summary = {}) {
  return safeFingerprint(firstPresent(summary, ["policyFingerprint", "safePolicyFingerprint"]));
}

function sourceFingerprintFrom(summary = {}) {
  return safeFingerprint(firstPresent(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
}

function comparisonPair(label, stored, current) {
  const storedFingerprint = safeFingerprint(stored);
  const currentFingerprint = safeFingerprint(current);
  return {
    label,
    comparable: Boolean(storedFingerprint && currentFingerprint),
    stale: safeFingerprintsDiffer(storedFingerprint, currentFingerprint),
    storedPresent: Boolean(storedFingerprint),
    currentPresent: Boolean(currentFingerprint),
  };
}

function staleComparisonPairs(input = {}, projection = {}, sourceObject = {}) {
  return [
    comparisonPair(
      "selector_state",
      firstPresent(input, ["selectedResultProjectionSelectorStateFingerprint", "selectedSelectorStateFingerprint", "selectorStateFingerprint"])
        ?? firstPresent(projection, ["selectorStateFingerprint", "selectedSelectorStateFingerprint"])
        ?? firstPresent(sourceObject, ["selectorStateFingerprint", "selectedSelectorStateFingerprint"]),
      firstPresent(input, ["currentSelectorStateFingerprint"]),
    ),
    comparisonPair(
      "reference_options",
      firstPresent(input, ["selectedResultProjectionReferenceOptionsFingerprint", "selectedReferenceOptionsFingerprint", "referenceOptionsFingerprint"])
        ?? firstPresent(projection, ["referenceOptionsFingerprint", "selectedReferenceOptionsFingerprint"])
        ?? firstPresent(sourceObject, ["referenceOptionsFingerprint", "selectedReferenceOptionsFingerprint"]),
      firstPresent(input, ["currentReferenceOptionsFingerprint"]),
    ),
    comparisonPair(
      "source_input",
      firstPresent(input, ["selectedResultProjectionSourceInputFingerprint", "selectedSourceInputFingerprint"])
        ?? firstPresent(projection, ["sourceInputFingerprint", "source_input_fingerprint"])
        ?? firstPresent(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"]),
      firstPresent(input, ["currentSourceInputFingerprint"]),
    ),
    comparisonPair(
      "sealed_candidate",
      firstPresent(input, ["selectedSealedCandidateAssemblyPreviewFingerprint", "sealedCandidateAssemblyPreviewFingerprint"])
        ?? firstPresent(projection, ["sealedCandidateAssemblyPreviewFingerprint"])
        ?? firstPresent(sourceObject, ["sealedCandidateAssemblyPreviewFingerprint"]),
      firstPresent(input, ["currentSealedCandidateAssemblyPreviewFingerprint"]),
    ),
    comparisonPair(
      "handoff_scaffold",
      firstPresent(input, ["selectedResultHandoffScaffoldFingerprint", "selectedHandoffScaffoldFingerprint"])
        ?? firstPresent(projection, ["selectedResultHandoffScaffoldFingerprint"])
        ?? firstPresent(sourceObject, ["selectedResultHandoffScaffoldFingerprint"]),
      firstPresent(input, ["currentSelectedResultHandoffScaffoldFingerprint"]),
    ),
  ];
}

function fingerprintMismatchReason(input, projection, sourceObject) {
  const expectedPolicy = safeFingerprint(firstPresent(input, ["policyFingerprint", "safePolicyFingerprint", "currentPolicyFingerprint"]));
  const expectedSource = safeFingerprint(firstPresent(input, ["sourceFingerprint", "safeSourceFingerprint", "currentSourceFingerprint"]));
  const projectionPolicy = policyFingerprintFrom(projection);
  const projectionSource = sourceFingerprintFrom(projection);
  const sourceObjectPolicy = policyFingerprintFrom(sourceObject);
  const sourceObjectSource = sourceFingerprintFrom(sourceObject);

  const checks = [
    ["projection policy", projectionPolicy, expectedPolicy],
    ["projection source", projectionSource, expectedSource],
    ["source-object policy", sourceObjectPolicy, expectedPolicy],
    ["source-object source", sourceObjectSource, expectedSource],
  ];
  for (const [label, actual, expected] of checks) {
    if (safeFingerprintsDiffer(actual, expected)) return `${label} fingerprint mismatch`;
  }

  const projectionInput = safeFingerprint(firstPresent(projection, ["sourceInputFingerprint", "source_input_fingerprint"])
    ?? firstPresent(projection.sourceInputFingerprintMetadata, ["value", "fingerprint"]));
  const sourceInput = safeFingerprint(firstPresent(sourceObject, ["sourceInputFingerprint", "source_input_fingerprint"]));
  if (safeFingerprintsDiffer(projectionInput, sourceInput)) {
    return "selected-result projection/source input fingerprint mismatch";
  }
  return null;
}

function result(extra = {}) {
  const state = extra.state || SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed;
  const failClosed = state !== SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady;
  const stale = state === SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain;
  const fingerprint = stableFingerprint("safe-selected-result-authority-guard", {
    state,
    reason: extra.reason || null,
    stale,
    authorityReady: failClosed !== true,
    comparedPairs: Array.isArray(extra.comparisonPairs) ? extra.comparisonPairs.map((pair) => ({
      label: pair.label,
      comparable: pair.comparable === true,
      stale: pair.stale === true,
      storedPresent: pair.storedPresent === true,
      currentPresent: pair.currentPresent === true,
    })) : [],
    projectionFingerprint: extra.selectedResultProjectionFingerprint || null,
    sourceObjectFingerprint: extra.safeSelectedResultSourceObjectFingerprint || null,
  });
  return {
    schemaId: SELECTED_RESULT_AUTHORITY_GUARD_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_AUTHORITY_GUARD_SCHEMA_VERSION,
    state,
    stale,
    failClosed,
    reason: safeText(extra.reason, state, 240),
    diagnosticOnly: true,
    readOnly: true,
    authorityReady: failClosed !== true,
    selectedResultAuthorityGuardReady: true,
    comparisonAttempted: extra.comparisonAttempted === true,
    comparisonPairs: Array.isArray(extra.comparisonPairs)
      ? extra.comparisonPairs.map((pair) => ({
        label: safeToken(pair.label, "unknown"),
        comparable: pair.comparable === true,
        stale: pair.stale === true,
        storedPresent: pair.storedPresent === true,
        currentPresent: pair.currentPresent === true,
      }))
      : [],
    selectedResultProjectionFingerprint: extra.selectedResultProjectionFingerprint || null,
    safeSelectedResultSourceObjectFingerprint: extra.safeSelectedResultSourceObjectFingerprint || null,
    selectedResultAuthorityGuardFingerprint: fingerprint,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
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
    safetyFlags: {
      readOnly: true,
      diagnosticOnly: true,
      authorityGuardOnly: true,
      selectedResultPersistenceEnabled: false,
      runTableGenerationEnabled: false,
      iesGenerationEnabled: false,
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
    },
  };
}

export function buildSelectedResultAuthorityGuardSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
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

  const unsafe = hasUnsafeInput({
    ...source,
    selectedResultProjectionSummary: undefined,
    selectedResultProjection: undefined,
    safeSelectedResultSourceObjectSummary: undefined,
    safeSelectedResultSourceObject: undefined,
  }) || hasUnsafeInput(projection) || hasUnsafeInput(sourceObject);
  if (unsafe) {
    return result({
      state: SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
      reason: `unsafe input rejected: ${unsafe}`,
    });
  }

  const projectionReady = projection.selectedResultAvailable === true || projection.sourceAvailable === true;
  const sourceObjectReady = sourceObject.ok === true || sourceObject.selectedResultSourceObjectAvailable === true;
  if (!projectionReady) {
    return result({
      state: SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
      reason: "safe selected-result projection summary is not ready",
    });
  }
  if (!sourceObjectReady && projection.summaryProjectionOnly !== true) {
    return result({
      state: SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
      reason: "safe selected-result source object summary is not ready",
    });
  }

  const mismatch = fingerprintMismatchReason(source, projection, sourceObject);
  const projectionFingerprint = fingerprintFromProjection(projection);
  const sourceObjectFingerprint = fingerprintFromSourceObject(sourceObject);
  if (mismatch) {
    return result({
      state: SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch,
      reason: mismatch,
      selectedResultProjectionFingerprint: projectionFingerprint,
      safeSelectedResultSourceObjectFingerprint: sourceObjectFingerprint,
    });
  }

  const comparisonPairs = staleComparisonPairs(source, projection, sourceObject);
  const comparablePairs = comparisonPairs.filter((pair) => pair.comparable === true);
  const comparisonAttempted = comparablePairs.length > 0;
  if (projection.stale === true || comparablePairs.some((pair) => pair.stale === true)) {
    return result({
      state: SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain,
      reason: projection.stale === true ? "selected-result projection is already marked stale" : "safe fingerprint comparison indicates stale selected result",
      comparisonAttempted,
      comparisonPairs,
      selectedResultProjectionFingerprint: projectionFingerprint,
      safeSelectedResultSourceObjectFingerprint: sourceObjectFingerprint,
    });
  }

  if (projection.summaryProjectionOnly === true || projection.acceptedSelectedResultAvailable !== true || projection.accepted !== true) {
    return result({
      state: SELECTED_RESULT_AUTHORITY_STATES.readonlyEngineSummaryOnly,
      reason: "readonly Engine summary is available but detailed accepted selected-result authority remains disabled",
      comparisonAttempted,
      comparisonPairs,
      selectedResultProjectionFingerprint: projectionFingerprint,
      safeSelectedResultSourceObjectFingerprint: sourceObjectFingerprint,
    });
  }

  if (projection.engineVerified === true && projection.selectedResultAvailable === true && projection.accepted === true) {
    return result({
      state: SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady,
      reason: comparisonAttempted
        ? "engine verified selected result is ready and safe fingerprints match"
        : "engine verified selected result is ready; no optional stale fingerprints were supplied for comparison",
      comparisonAttempted,
      comparisonPairs,
      selectedResultProjectionFingerprint: projectionFingerprint,
      safeSelectedResultSourceObjectFingerprint: sourceObjectFingerprint,
    });
  }

  return result({
    state: SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed,
    reason: "selected-result authority conditions were not met",
    comparisonAttempted,
    comparisonPairs,
    selectedResultProjectionFingerprint: projectionFingerprint,
    safeSelectedResultSourceObjectFingerprint: sourceObjectFingerprint,
  });
}

export const buildSelectedResultFingerprintComparisonSummary = buildSelectedResultAuthorityGuardSummary;
