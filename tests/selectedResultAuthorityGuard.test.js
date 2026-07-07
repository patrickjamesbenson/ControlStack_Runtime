import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSelectedResultAuthorityGuardSummary,
  buildSelectedResultFingerprintComparisonSummary,
  SELECTED_RESULT_AUTHORITY_STATES,
} from "../packages/workspace-kernel/selectedResultAuthorityGuard.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-authority-guard-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-authority-guard-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-authority-guard-fixture";
const SELECTOR_STATE_FINGERPRINT = "safe-selector-state:selected-result-authority-guard-fixture";
const REFERENCE_OPTIONS_FINGERPRINT = "safe-reference-options:selected-result-authority-guard-fixture";

function projection(overrides = {}) {
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
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: {
      readOnly: true,
      displayOnly: true,
      selectedResultPersistenceEnabled: false,
      runTableGenerationEnabled: false,
      iesGenerationEnabled: false,
      outputGenerationEnabled: false,
      runtimeDataMutationEnabled: false,
      rawEnginePayloadReturned: false,
      rawEngineResultReturned: false,
      rawSelectorPayloadReturned: false,
      rawRunTableRowsReturned: false,
      rawSelectedPayloadReturned: false,
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
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    runCount: 1,
    persistenceStatus: {
      selectedResultPersisted: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersistenceAttempted: false,
    },
    safetyFlags: {
      readOnly: true,
      diagnosticOnly: true,
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

function guard(input = {}) {
  return buildSelectedResultAuthorityGuardSummary({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    selectedResultProjectionSummary: projection(),
    safeSelectedResultSourceObjectSummary: sourceObject(),
    ...input,
  });
}

test("reports readonly_engine_summary_only for Step 2 summary-only projection", () => {
  const result = guard();

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_STATES.readonlyEngineSummaryOnly);
  assert.equal(result.failClosed, true);
  assert.equal(result.stale, false);
  assert.equal(result.authorityReady, false);
  assert.equal(result.readOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.selectedResultPersistenceEnabled, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.outputGenerationEnabled, false);
  assert.equal(result.runtimeDataMutationEnabled, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});

test("reports engine_verified_selected_result_ready for accepted verified result with matching stale fingerprints", () => {
  const result = guard({
    selectedResultProjectionSummary: projection({
      state: "selected_accepted",
      resultState: "selected_accepted",
      summaryProjectionOnly: false,
      accepted: true,
      acceptedSelectedResultAvailable: true,
      engineVerified: true,
      selectorStateFingerprint: SELECTOR_STATE_FINGERPRINT,
      referenceOptionsFingerprint: REFERENCE_OPTIONS_FINGERPRINT,
    }),
    currentSelectorStateFingerprint: SELECTOR_STATE_FINGERPRINT,
    currentReferenceOptionsFingerprint: REFERENCE_OPTIONS_FINGERPRINT,
  });

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_STATES.engineVerifiedSelectedResultReady);
  assert.equal(result.failClosed, false);
  assert.equal(result.authorityReady, true);
  assert.equal(result.comparisonAttempted, true);
  assert.equal(result.comparisonPairs.some((pair) => pair.comparable === true), true);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
});

test("reports stale_verify_again when selected/current fingerprints differ", () => {
  const result = guard({
    selectedResultProjectionSummary: projection({
      state: "selected_accepted",
      resultState: "selected_accepted",
      summaryProjectionOnly: false,
      accepted: true,
      acceptedSelectedResultAvailable: true,
      engineVerified: true,
      selectorStateFingerprint: "safe-selector-state:old-fixture",
    }),
    currentSelectorStateFingerprint: SELECTOR_STATE_FINGERPRINT,
  });

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_STATES.staleVerifyAgain);
  assert.equal(result.stale, true);
  assert.equal(result.failClosed, true);
  assert.equal(result.reason, "safe fingerprint comparison indicates stale selected result");
});

test("reports fingerprint_mismatch when projection/source fingerprints disagree", () => {
  const result = guard({
    safeSelectedResultSourceObjectSummary: sourceObject({
      sourceInputFingerprint: "safe-source-input:mismatch-fixture",
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_STATES.fingerprintMismatch);
  assert.equal(result.failClosed, true);
  assert.match(result.reason, /fingerprint mismatch/);
});

test("reports not_compared_fail_closed for unsafe raw payload/body keys", () => {
  const result = guard({
    selectedResultProjectionSummary: projection({
      selectedResultBody: { shouldNot: "be accepted" },
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_AUTHORITY_STATES.notComparedFailClosed);
  assert.equal(result.failClosed, true);
  assert.match(result.reason, /unsafe input rejected/);
});

test("alias points at the same safe comparison helper", () => {
  assert.equal(buildSelectedResultFingerprintComparisonSummary, buildSelectedResultAuthorityGuardSummary);
});
