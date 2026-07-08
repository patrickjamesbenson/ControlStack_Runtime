import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSelectedResultOutputReadinessPreflight,
  buildSelectedResultOutputReadinessPreflight,
  SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES,
} from "../packages/workspace-kernel/selectedResultOutputReadinessPreflight.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-output-readiness-preflight-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-output-readiness-preflight-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-output-readiness-preflight-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-output-readiness-preflight-fixture";

function gate(overrides = {}) {
  return {
    state: "accepted_selected_result_authority",
    selectedResultAuthorityState: "accepted_selected_result_authority",
    acceptedSelectedResultAuthorityReady: true,
    acceptedSelectedResultAuthority: true,
    acceptedForReadOnlyRuntimeAuthority: true,
    accepted: true,
    failClosed: false,
    readOnly: true,
    authorityGateOnly: true,
    safeSummaryOnly: true,
    acceptedSelectedResultAuthorityEnabled: false,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
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
    rawSelectedPayloadReturned: false,
    fingerprints: {
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
      sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
      sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    },
    checks: {
      staleComparisonClean: true,
    },
    acceptedSelectedResultAuthorityGateFingerprint: "safe-accepted-selected-result-authority-gate:fixture",
    ...overrides,
  };
}

function authorityPreflight(overrides = {}) {
  return {
    state: "engine_verified_selected_result_ready",
    acceptedAuthorityReadinessPreflightReady: true,
    readyForLaterAcceptedAuthority: true,
    engineVerifiedSelectedResultReady: true,
    failClosed: false,
    readOnly: true,
    diagnosticOnly: true,
    preflightOnly: true,
    safeSummaryOnly: true,
    acceptedSelectedResultAuthorityReady: false,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerated: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    fingerprints: {
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
      sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
      sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    },
    selectedResultAuthorityReadinessPreflightFingerprint: "safe-selected-result-authority-readiness-preflight:fixture",
    ...overrides,
  };
}

function guard(overrides = {}) {
  return {
    state: "engine_verified_selected_result_ready",
    selectedResultAuthorityState: "engine_verified_selected_result_ready",
    selectedResultAuthorityGuardReady: true,
    authorityReady: true,
    comparisonAttempted: true,
    stale: false,
    failClosed: false,
    readOnly: true,
    diagnosticOnly: true,
    selectedResultAuthorityGuardFingerprint: "safe-selected-result-authority-guard:fixture",
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    ...overrides,
  };
}

function projection(overrides = {}) {
  return {
    sourceAvailable: true,
    selectedResultAvailable: true,
    accepted: true,
    acceptedSelectedResultAvailable: true,
    engineVerified: true,
    stale: false,
    readOnly: true,
    displayOnly: true,
    state: "selected_accepted",
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: SOURCE_VERSION_FINGERPRINT,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    selectedResultPersistenceEnabled: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    selectedResultProjectionFingerprint: "safe-selected-result-projection:fixture",
    ...overrides,
  };
}

function sourceObject(overrides = {}) {
  return {
    ok: true,
    selectedResultSourceObjectAvailable: true,
    engineVerified: true,
    readOnly: true,
    diagnosticOnly: true,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionMarker: SOURCE_VERSION_FINGERPRINT,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    selectedResultPersistenceEnabled: false,
    selectedResultPersisted: false,
    runTableGenerationEnabled: false,
    iesGenerationEnabled: false,
    outputGenerationEnabled: false,
    safeSelectedResultSourceObjectFingerprint: "safe-selected-result-source-object:fixture",
    ...overrides,
  };
}

function handoff(overrides = {}) {
  return {
    ok: true,
    selectedResultHandoffScaffoldReady: true,
    readOnly: true,
    diagnosticOnly: true,
    nativeRuntimeKernel: true,
    safeSummaryOnly: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    handoffReadinessSummary: {
      selectedResultProjectionReady: true,
      safeSelectedResultSourceObjectReady: true,
      selectedResultPersistenceReady: false,
    },
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultHandoffScaffoldFingerprint: "safe-selected-result-handoff-scaffold:fixture",
    ...overrides,
  };
}

function runTable(overrides = {}) {
  return {
    ok: true,
    runTableDomainOutputScaffoldReady: true,
    readOnly: true,
    diagnosticOnly: true,
    nativeRuntimeKernel: true,
    safeSummaryOnly: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    runTableDomainReadinessSummary: {
      domainOutputReady: true,
      productionRunTableReady: false,
    },
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    runTableDomainOutputScaffoldFingerprint: "safe-runtable-domain-output-scaffold:fixture",
    ...overrides,
  };
}

function ies(overrides = {}) {
  return {
    ok: true,
    iesHandoffReadinessScaffoldReady: true,
    readOnly: true,
    diagnosticOnly: true,
    nativeRuntimeKernel: true,
    safeSummaryOnly: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    iesReadinessSummary: {
      readyForFutureIesHandoff: true,
      iesGenerationReady: false,
    },
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    iesGenerated: false,
    iesHandoffReadinessScaffoldFingerprint: "safe-ies-handoff-readiness-scaffold:fixture",
    ...overrides,
  };
}

function preflight(overrides = {}) {
  return buildSelectedResultOutputReadinessPreflight({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    acceptedSelectedResultAuthorityGateSummary: gate(),
    selectedResultAuthorityReadinessPreflightSummary: authorityPreflight(),
    selectedResultAuthorityGuardSummary: guard(),
    selectedResultProjectionSummary: projection(),
    safeSelectedResultSourceObjectSummary: sourceObject(),
    selectedResultHandoffScaffoldSummary: handoff(),
    runTableDomainOutputScaffoldSummary: runTable(),
    iesHandoffReadinessScaffoldSummary: ies(),
    ...overrides,
  });
}

function assertProductionDisabled(result) {
  for (const key of [
    "selectedResultPersisted",
    "selectedResultPersistenceEnabled",
    "selectedResultPersistenceAttempted",
    "runTableGenerated",
    "runTableGenerationEnabled",
    "productionRunTableGenerated",
    "iesGenerated",
    "iesGenerationEnabled",
    "outputGenerationEnabled",
    "runtimeDataMutationEnabled",
    "runtimeDataMutated",
    "routesAdded",
    "postEndpointsAdded",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "rawSelectorPayloadReturned",
    "rawRunTableRowsReturned",
    "rawSelectedPayloadReturned",
    "rawIesContentReturned",
    "rawPhotometryReturned",
    "candelaArraysReturned",
    "base64ArtifactsReturned",
  ]) {
    assert.equal(result[key], false, key);
  }
}

test("accepted authority is preserved while persistence/output readiness remains preflight-blocked", () => {
  const result = preflight();

  assert.equal(result.state, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.persistenceNotReady);
  assert.equal(result.authorityState, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.acceptedSelectedResultAuthority);
  assert.equal(result.acceptedSelectedResultAuthorityReady, true);
  assert.equal(result.readyForSelectedResultPersistence, false);
  assert.equal(result.readyForRunTableGeneration, false);
  assert.equal(result.readyForIesGeneration, false);
  assert.equal(result.readyForOutputGeneration, false);
  assert.equal(result.failClosed, true);
  assert.match(result.reason, /selected-result persistence prerequisites are not ready/);
  assert.ok(result.missingRequirements.includes("selected-result-persistence-contract-ready"));
  assert.ok(result.missingRequirements.includes("selected-result-persistence-safe-target-defined"));
  assertProductionDisabled(result);
});

test("fails closed before accepted selected-result authority is established", () => {
  const result = preflight({
    acceptedSelectedResultAuthorityGateSummary: gate({
      state: "not_compared_fail_closed",
      selectedResultAuthorityState: "not_compared_fail_closed",
      acceptedSelectedResultAuthorityReady: false,
      acceptedSelectedResultAuthority: false,
      accepted: false,
      failClosed: true,
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.preflightBlockedFailClosed);
  assert.equal(result.acceptedSelectedResultAuthorityReady, false);
  assert.ok(result.missingRequirements.includes("accepted-selected-result-authority-ready"));
  assertProductionDisabled(result);
});

test("progresses to RunTable not ready only after safe persistence prerequisites are ready in principle", () => {
  const result = preflight({
    selectedResultPersistenceContractReady: true,
    selectedResultPersistenceRedactionBoundaryReady: true,
    selectedResultPersistenceMutationGateReady: true,
    selectedResultPersistenceSafeTargetDefined: true,
  });

  assert.equal(result.state, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.runTableNotReady);
  assert.equal(result.readyForSelectedResultPersistence, true);
  assert.equal(result.readyForRunTableGeneration, false);
  assert.ok(result.missingRequirements.includes("runtable-generation-contract-ready"));
  assertProductionDisabled(result);
});

test("progresses to IES not ready only after safe RunTable prerequisites are ready in principle", () => {
  const result = preflight({
    selectedResultPersistenceContractReady: true,
    selectedResultPersistenceRedactionBoundaryReady: true,
    selectedResultPersistenceMutationGateReady: true,
    selectedResultPersistenceSafeTargetDefined: true,
    runTableGenerationContractReady: true,
    runTableOutputRedactionBoundaryReady: true,
    runTableMutationGateReady: true,
  });

  assert.equal(result.state, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.iesNotReady);
  assert.equal(result.readyForSelectedResultPersistence, true);
  assert.equal(result.readyForRunTableGeneration, true);
  assert.equal(result.readyForIesGeneration, false);
  assert.ok(result.missingRequirements.includes("ies-generation-contract-ready"));
  assertProductionDisabled(result);
});

test("progresses to output generation not ready only after safe IES prerequisites are ready in principle", () => {
  const result = preflight({
    selectedResultPersistenceContractReady: true,
    selectedResultPersistenceRedactionBoundaryReady: true,
    selectedResultPersistenceMutationGateReady: true,
    selectedResultPersistenceSafeTargetDefined: true,
    runTableGenerationContractReady: true,
    runTableOutputRedactionBoundaryReady: true,
    runTableMutationGateReady: true,
    iesGenerationContractReady: true,
    iesReferencePhotometryBoundaryReady: true,
    iesRawContentRedactionBoundaryReady: true,
    iesArtifactMutationGateReady: true,
  });

  assert.equal(result.state, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationNotReady);
  assert.equal(result.readyForSelectedResultPersistence, true);
  assert.equal(result.readyForRunTableGeneration, true);
  assert.equal(result.readyForIesGeneration, true);
  assert.equal(result.readyForOutputGeneration, false);
  assert.ok(result.missingRequirements.includes("output-generation-authority-contract-ready"));
  assertProductionDisabled(result);
});

test("even output-ready-in-principle keeps every persistence/generation/write flag false", () => {
  const result = preflight({
    selectedResultPersistenceContractReady: true,
    selectedResultPersistenceRedactionBoundaryReady: true,
    selectedResultPersistenceMutationGateReady: true,
    selectedResultPersistenceSafeTargetDefined: true,
    runTableGenerationContractReady: true,
    runTableOutputRedactionBoundaryReady: true,
    runTableMutationGateReady: true,
    iesGenerationContractReady: true,
    iesReferencePhotometryBoundaryReady: true,
    iesRawContentRedactionBoundaryReady: true,
    iesArtifactMutationGateReady: true,
    outputGenerationAuthorityContractReady: true,
    outputRouteContractReady: true,
    outputRedactionBoundaryReady: true,
    outputMutationGateReady: true,
  });

  assert.equal(result.state, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.outputGenerationReadyInPrinciple);
  assert.equal(result.readyForOutputGeneration, true);
  assert.equal(result.failClosed, false);
  assert.deepEqual(result.missingRequirements, []);
  assertProductionDisabled(result);
});

test("rejects unsafe production flags without turning preflight into output authority", () => {
  const result = preflight({ outputGenerationEnabled: true });

  assert.equal(result.state, SELECTED_RESULT_OUTPUT_READINESS_PREFLIGHT_STATES.preflightBlockedFailClosed);
  assert.equal(result.readyForOutputGeneration, false);
  assert.match(result.reason, /unsafe input rejected/);
  assert.ok(result.missingRequirements[0].startsWith("unsafe-input-rejected"));
  assertProductionDisabled(result);
});

test("runtime alias points at the selected-result output-readiness preflight helper", () => {
  assert.equal(buildRuntimeSelectedResultOutputReadinessPreflight, buildSelectedResultOutputReadinessPreflight);
});
