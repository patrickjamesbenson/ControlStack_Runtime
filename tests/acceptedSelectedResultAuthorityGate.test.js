import test from "node:test";
import assert from "node:assert/strict";

import {
  buildAcceptedSelectedResultAuthorityGate,
  buildRuntimeAcceptedSelectedResultAuthorityGate,
  ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES,
} from "../packages/workspace-kernel/acceptedSelectedResultAuthorityGate.js";
import { buildSelectedResultAuthorityReadinessPreflight } from "../packages/workspace-kernel/selectedResultAuthorityReadinessPreflight.js";

const POLICY_FINGERPRINT = "safe-policy:accepted-selected-result-authority-gate-fixture";
const SOURCE_FINGERPRINT = "safe-source:accepted-selected-result-authority-gate-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:accepted-selected-result-authority-gate-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:accepted-selected-result-authority-gate-fixture";
const SELECTOR_STATE_FINGERPRINT = "safe-selector-state:accepted-selected-result-authority-gate-fixture";
const REFERENCE_OPTIONS_FINGERPRINT = "safe-reference-options:accepted-selected-result-authority-gate-fixture";

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
    outputsReady: false,
    sourceFingerprints: {
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
    },
    bridgeFingerprint: "safe-controlled-donor-engine-verify-bridge:gate-fixture",
    ...overrides,
  };
}

function sourceObject(overrides = {}) {
  return {
    ok: true,
    readOnly: true,
    diagnosticOnly: true,
    selectedResultSourceObjectAvailable: true,
    accepted: true,
    engineVerified: true,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionMarker: SOURCE_VERSION_FINGERPRINT,
    runCount: 1,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    ...overrides,
  };
}

function acceptedProjection(overrides = {}) {
  return {
    sourceAvailable: true,
    selectedResultAvailable: true,
    readOnly: true,
    displayOnly: true,
    state: "selected_accepted",
    resultState: "selected_accepted",
    resultStateLabel: "Engine verified",
    summaryProjectionOnly: false,
    accepted: true,
    acceptedSelectedResultAvailable: true,
    oneSuccessfulAcceptedResult: true,
    selectedResultCandidateCount: 1,
    engineVerified: true,
    stale: false,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: SOURCE_VERSION_FINGERPRINT,
    selectorStateFingerprint: SELECTOR_STATE_FINGERPRINT,
    referenceOptionsFingerprint: REFERENCE_OPTIONS_FINGERPRINT,
    selectedFamilySubsetLock: {
      selectedFamily: "DNX",
      selectedSubset: "60",
      selectedTier: "Beam",
    },
    perRunLookupNormalised: true,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function summaryProjection(overrides = {}) {
  return acceptedProjection({
    state: "engine_verified",
    resultState: "engine_verified",
    summaryProjectionOnly: true,
    accepted: false,
    acceptedSelectedResultAvailable: false,
    oneSuccessfulAcceptedResult: false,
    selectedResultCandidateCount: null,
    selectedFamilySubsetLock: null,
    perRunLookupNormalised: false,
    ...overrides,
  });
}

function guard(overrides = {}) {
  return {
    selectedResultAuthorityGuardReady: true,
    state: "engine_verified_selected_result_ready",
    stale: false,
    failClosed: false,
    reason: "engine verified selected result is ready and safe fingerprints match",
    diagnosticOnly: true,
    readOnly: true,
    authorityReady: true,
    comparisonAttempted: true,
    comparisonPairs: [
      { label: "selector_state", comparable: true, stale: false, storedPresent: true, currentPresent: true },
      { label: "reference_options", comparable: true, stale: false, storedPresent: true, currentPresent: true },
    ],
    selectedResultAuthorityGuardFingerprint: "safe-selected-result-authority-guard:gate-fixture",
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    ...overrides,
  };
}

function preflight(overrides = {}) {
  return buildSelectedResultAuthorityReadinessPreflight({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    currentSourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    verifiedSummary: { ok: true, readonlyEngineStep1Ready: true },
    privateVerificationBridgeSummary: bridge(),
    safeSelectedResultSourceObjectSummary: sourceObject(),
    selectedResultProjectionSummary: acceptedProjection(),
    selectedResultAuthorityGuardSummary: guard(),
    ...overrides,
  });
}

function gate(overrides = {}) {
  const selectedResultProjectionSummary = overrides.selectedResultProjectionSummary || acceptedProjection();
  const selectedResultAuthorityGuardSummary = overrides.selectedResultAuthorityGuardSummary || guard();
  const privateVerificationBridgeSummary = overrides.privateVerificationBridgeSummary || bridge();
  const safeSelectedResultSourceObjectSummary = overrides.safeSelectedResultSourceObjectSummary || sourceObject();
  const selectedResultAuthorityReadinessPreflightSummary = overrides.selectedResultAuthorityReadinessPreflightSummary || preflight({
    privateVerificationBridgeSummary,
    safeSelectedResultSourceObjectSummary,
    selectedResultProjectionSummary,
    selectedResultAuthorityGuardSummary,
  });

  return buildAcceptedSelectedResultAuthorityGate({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    currentSourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    verifiedSummary: { ok: true, readonlyEngineStep1Ready: true },
    privateVerificationBridgeSummary,
    safeSelectedResultSourceObjectSummary,
    selectedResultProjectionSummary,
    selectedResultAuthorityGuardSummary,
    selectedResultAuthorityReadinessPreflightSummary,
    ...overrides,
  });
}

test("establishes accepted selected-result authority from the clean readonly readiness chain", () => {
  const result = gate();

  assert.equal(result.state, ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.acceptedSelectedResultAuthority);
  assert.equal(result.acceptedSelectedResultAuthorityReady, true);
  assert.equal(result.acceptedSelectedResultAuthority, true);
  assert.equal(result.acceptedForReadOnlyRuntimeAuthority, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.acceptedSelectedResultAuthorityEnabled, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.selectedResultPersistenceEnabled, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.outputGenerationEnabled, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.runtimeDataMutationEnabled, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.rawEngineResultReturned, false);
  assert.equal(result.rawSelectedPayloadReturned, false);
});

test("keeps readonly verified-summary preflight fail-closed and does not accept authority", () => {
  const selectedResultProjectionSummary = summaryProjection();
  const selectedResultAuthorityGuardSummary = guard({
    state: "readonly_engine_summary_only",
    failClosed: true,
    authorityReady: false,
    comparisonAttempted: false,
    comparisonPairs: [],
  });
  const result = gate({
    selectedResultProjectionSummary,
    selectedResultAuthorityGuardSummary,
    selectedResultAuthorityReadinessPreflightSummary: preflight({
      selectedResultProjectionSummary,
      selectedResultAuthorityGuardSummary,
    }),
  });

  assert.equal(result.state, ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.verifiedSummaryReadyForAuthorityPreflight);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.equal(result.failClosed, true);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});

test("propagates stale and fingerprint mismatch states", () => {
  const stale = gate({
    selectedResultAuthorityReadinessPreflightSummary: preflight({
      selectedResultProjectionSummary: acceptedProjection({ stale: true }),
      selectedResultAuthorityGuardSummary: guard({
        state: "stale_verify_again",
        stale: true,
        failClosed: true,
        authorityReady: false,
      }),
    }),
    selectedResultProjectionSummary: acceptedProjection({ stale: true }),
    selectedResultAuthorityGuardSummary: guard({
      state: "stale_verify_again",
      stale: true,
      failClosed: true,
      authorityReady: false,
    }),
  });
  assert.equal(stale.state, ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain);
  assert.equal(stale.acceptedSelectedResultAuthorityReady, false);

  const mismatch = gate({
    selectedResultAuthorityReadinessPreflightSummary: preflight({
      selectedResultAuthorityGuardSummary: guard({
        state: "fingerprint_mismatch",
        failClosed: true,
        authorityReady: false,
      }),
    }),
    selectedResultAuthorityGuardSummary: guard({
      state: "fingerprint_mismatch",
      failClosed: true,
      authorityReady: false,
    }),
  });
  assert.equal(mismatch.state, ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch);
  assert.equal(mismatch.acceptedSelectedResultAuthorityReady, false);
});

test("rejects detailed accepted metadata when comparison is not clean", () => {
  const selectedResultAuthorityGuardSummary = guard({
    comparisonAttempted: false,
    comparisonPairs: [],
  });
  const result = gate({
    selectedResultAuthorityGuardSummary,
    selectedResultAuthorityReadinessPreflightSummary: preflight({ selectedResultAuthorityGuardSummary }),
  });

  assert.equal(result.state, ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.match(result.reason, /acceptedAuthorityReadinessPreflightReady not ready|staleComparisonAttempted not ready/);
});

test("rejects unsafe production flags without enabling output authority", () => {
  const result = gate({
    selectedResultProjectionSummary: acceptedProjection({ outputGenerationEnabled: true }),
  });

  assert.equal(result.state, ACCEPTED_SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed);
  assert.match(result.reason, /unsafe input rejected/);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.equal(result.outputGenerationEnabled, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
});

test("runtime alias points at the accepted selected-result authority gate helper", () => {
  assert.equal(buildRuntimeAcceptedSelectedResultAuthorityGate, buildAcceptedSelectedResultAuthorityGate);
});
