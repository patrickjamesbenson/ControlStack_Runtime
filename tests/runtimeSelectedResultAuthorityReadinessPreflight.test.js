import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSelectedResultAuthorityReadinessPreflight,
  buildAcceptedSelectedResultAuthorityReadinessPreflight,
  SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES,
} from "../packages/workspace-kernel/selectedResultAuthorityReadinessPreflight.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-authority-preflight-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-authority-preflight-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-authority-preflight-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-authority-preflight-fixture";
const SELECTOR_STATE_FINGERPRINT = "safe-selector-state:selected-result-authority-preflight-fixture";
const REFERENCE_OPTIONS_FINGERPRINT = "safe-reference-options:selected-result-authority-preflight-fixture";

function bridge(overrides = {}) {
  return {
    ok: true,
    bridgeReady: true,
    safeEngineResultReady: true,
    readOnly: true,
    privateBridgeOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    readonlySeamSummaryOnly: true,
    realEngineVerificationSummaryAvailable: true,
    acceptedSelectedResultAuthorityReady: false,
    outputsReady: false,
    sourceFingerprints: {
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
    },
    bridgeFingerprint: "safe-controlled-donor-engine-verify-bridge:fixture",
    safetyFlags: {
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      outputGenerationEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    ...overrides,
  };
}

function sourceObject(overrides = {}) {
  return {
    ok: true,
    readOnly: true,
    diagnosticOnly: true,
    accepted: true,
    engineVerified: true,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionMarker: SOURCE_VERSION_FINGERPRINT,
    runCount: 1,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    safetyFlags: {
      selectedResultPersisted: false,
      selectedResultPersistenceEnabled: false,
      runTableGenerationEnabled: false,
      iesGenerationEnabled: false,
      outputGenerationEnabled: false,
      runtimeDataMutationEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    ...overrides,
  };
}

function summaryProjection(overrides = {}) {
  return {
    sourceAvailable: true,
    selectedResultAvailable: true,
    readOnly: true,
    displayOnly: true,
    state: "engine_verified",
    resultState: "engine_verified",
    resultStateLabel: "Engine verified",
    summaryProjectionOnly: true,
    accepted: false,
    acceptedSelectedResultAvailable: false,
    engineVerified: true,
    stale: false,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: SOURCE_VERSION_FINGERPRINT,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: {
      selectedResultPersistenceEnabled: false,
      runTableGenerationEnabled: false,
      iesGenerationEnabled: false,
      outputGenerationEnabled: false,
      runtimeDataMutationEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    ...overrides,
  };
}

function acceptedProjection(overrides = {}) {
  return summaryProjection({
    state: "selected_accepted",
    resultState: "selected_accepted",
    summaryProjectionOnly: false,
    accepted: true,
    acceptedSelectedResultAvailable: true,
    oneSuccessfulAcceptedResult: true,
    selectedResultCandidateCount: 1,
    selectorStateFingerprint: SELECTOR_STATE_FINGERPRINT,
    referenceOptionsFingerprint: REFERENCE_OPTIONS_FINGERPRINT,
    selectedFamilySubsetLock: {
      selectedFamily: "DNX",
      selectedSubset: "60",
      selectedTier: "Beam",
    },
    perRunLookupNormalised: true,
    ...overrides,
  });
}

function guard(overrides = {}) {
  return {
    selectedResultAuthorityGuardReady: true,
    state: "readonly_engine_summary_only",
    stale: false,
    failClosed: true,
    reason: "readonly Engine summary is available but detailed accepted selected-result authority remains disabled",
    diagnosticOnly: true,
    readOnly: true,
    authorityReady: false,
    comparisonAttempted: false,
    comparisonPairs: [],
    selectedResultAuthorityGuardFingerprint: "safe-selected-result-authority-guard:fixture",
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    ...overrides,
  };
}

function preflight(input = {}) {
  return buildSelectedResultAuthorityReadinessPreflight({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    currentSourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    verifiedSummary: { ok: true, readonlyEngineStep1Ready: true },
    privateVerificationBridgeSummary: bridge(),
    safeSelectedResultSourceObjectSummary: sourceObject(),
    selectedResultProjectionSummary: summaryProjection(),
    selectedResultAuthorityGuardSummary: guard(),
    ...input,
  });
}

test("reports verified_summary_ready_for_authority_preflight for the readonly verified-summary slice", () => {
  const result = preflight();

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.verifiedSummaryReadyForAuthorityPreflight);
  assert.equal(result.acceptedAuthorityReadinessPreflightReady, true);
  assert.equal(result.readyForLaterAcceptedAuthority, false);
  assert.equal(result.engineVerifiedSelectedResultReady, false);
  assert.equal(result.accepted, false);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.equal(result.acceptedSelectedResultAuthorityEnabled, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.outputGenerationEnabled, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});

test("reports engine_verified_selected_result_ready only for detailed accepted metadata with clean comparison", () => {
  const result = preflight({
    selectedResultProjectionSummary: acceptedProjection(),
    selectedResultAuthorityGuardSummary: guard({
      state: "engine_verified_selected_result_ready",
      failClosed: false,
      authorityReady: true,
      comparisonAttempted: true,
      comparisonPairs: [
        { label: "selector_state", comparable: true, stale: false, storedPresent: true, currentPresent: true },
        { label: "reference_options", comparable: true, stale: false, storedPresent: true, currentPresent: true },
      ],
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.engineVerifiedSelectedResultReady);
  assert.equal(result.readyForLaterAcceptedAuthority, true);
  assert.equal(result.engineVerifiedSelectedResultReady, true);
  assert.equal(result.accepted, false);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.equal(result.selectedResultPersistenceEnabled, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
});

test("keeps detailed accepted metadata fail-closed when stale comparison was not attempted", () => {
  const result = preflight({
    selectedResultProjectionSummary: acceptedProjection(),
    selectedResultAuthorityGuardSummary: guard({
      state: "engine_verified_selected_result_ready",
      failClosed: false,
      authorityReady: true,
      comparisonAttempted: false,
      comparisonPairs: [],
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.notComparedFailClosed);
  assert.equal(result.failClosed, true);
  assert.match(result.reason, /staleComparisonAttempted not ready/);
});

test("propagates stale and fingerprint mismatch guard states", () => {
  const stale = preflight({
    selectedResultAuthorityGuardSummary: guard({
      state: "stale_verify_again",
      stale: true,
      reason: "safe fingerprint comparison indicates stale selected result",
    }),
  });
  assert.equal(stale.state, SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.staleVerifyAgain);

  const mismatch = preflight({
    selectedResultAuthorityGuardSummary: guard({
      state: "fingerprint_mismatch",
      reason: "selected-result projection/source input fingerprint mismatch",
    }),
  });
  assert.equal(mismatch.state, SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.fingerprintMismatch);
});

test("rejects unsafe input without enabling authority or outputs", () => {
  const result = preflight({
    selectedResultProjectionSummary: summaryProjection({
      rawEnginePayload: { unsafe: true },
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_PREFLIGHT_STATES.notComparedFailClosed);
  assert.match(result.reason, /unsafe input rejected/);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});

test("alias points at the same accepted-authority preflight helper", () => {
  assert.equal(buildAcceptedSelectedResultAuthorityReadinessPreflight, buildSelectedResultAuthorityReadinessPreflight);
});
