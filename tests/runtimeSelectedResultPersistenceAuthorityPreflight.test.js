import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSelectedResultPersistenceAuthorityPreflight,
  buildSelectedResultPersistenceAuthorityPreflight,
  SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES,
} from "../packages/workspace-kernel/selectedResultPersistenceAuthorityPreflight.js";
import { buildSelectedResultPersistenceBoundaryContract } from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import { buildSelectedResultOutputReadinessPreflight } from "../packages/workspace-kernel/selectedResultOutputReadinessPreflight.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-persistence-authority-preflight-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-persistence-authority-preflight-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-persistence-authority-preflight-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-persistence-authority-preflight-fixture";

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
    state: "runtime_selected_result_handoff_scaffold_diagnostic_only",
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
    selectedResultPersistenceEnabled: false,
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

function boundary(overrides = {}) {
  return buildSelectedResultPersistenceBoundaryContract({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    acceptedSelectedResultAuthorityGateSummary: gate(),
    selectedResultAuthorityGuardSummary: guard(),
    selectedResultProjectionSummary: projection(),
    safeSelectedResultSourceObjectSummary: sourceObject(),
    selectedResultHandoffScaffoldSummary: handoff(),
    ...overrides,
  });
}

function outputPreflight(selectedResultPersistenceBoundaryContractSummary = boundary(), overrides = {}) {
  return buildSelectedResultOutputReadinessPreflight({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    acceptedSelectedResultAuthorityGateSummary: gate(),
    selectedResultAuthorityReadinessPreflightSummary: authorityPreflight(),
    selectedResultPersistenceBoundaryContractSummary,
    selectedResultAuthorityGuardSummary: guard(),
    selectedResultProjectionSummary: projection(),
    safeSelectedResultSourceObjectSummary: sourceObject(),
    selectedResultHandoffScaffoldSummary: handoff(),
    runTableDomainOutputScaffoldSummary: runTable(),
    iesHandoffReadinessScaffoldSummary: ies(),
    ...overrides,
  });
}

function preflight(overrides = {}) {
  const selectedResultPersistenceBoundaryContractSummary = overrides.selectedResultPersistenceBoundaryContractSummary || boundary();
  const selectedResultOutputReadinessPreflightSummary = overrides.selectedResultOutputReadinessPreflightSummary
    || outputPreflight(selectedResultPersistenceBoundaryContractSummary);

  return buildSelectedResultPersistenceAuthorityPreflight({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    acceptedSelectedResultAuthorityGateSummary: gate(),
    selectedResultOutputReadinessPreflightSummary,
    selectedResultPersistenceBoundaryContractSummary,
    selectedResultAuthorityGuardSummary: guard(),
    selectedResultProjectionSummary: projection(),
    safeSelectedResultSourceObjectSummary: sourceObject(),
    selectedResultHandoffScaffoldSummary: handoff(),
    ...overrides,
  });
}

function assertPreflightOnly(result) {
  for (const key of [
    "selectedResultPersisted",
    "selectedResultPersistenceEnabled",
    "selectedResultPersistenceAttempted",
    "selectedResultPersistenceImplementationAllowed",
    "selectedResultPersistenceWriteHookAdded",
    "projectWriteEnabled",
    "runtimeDataMutationEnabled",
    "runtimeDataMutated",
    "boardDataMutationEnabled",
    "runTableGenerated",
    "runTableGenerationEnabled",
    "productionRunTableGenerated",
    "iesGenerated",
    "iesGenerationEnabled",
    "outputGenerationEnabled",
    "drawingGenerationEnabled",
    "photometryGenerationEnabled",
    "routesAdded",
    "publicRouteAdded",
    "postEndpointsAdded",
    "postEndpointAdded",
    "rawEnginePayloadReturned",
    "rawEngineResultReturned",
    "rawSelectorPayloadReturned",
    "rawSelectedPayloadReturned",
    "rawRunTableRowsReturned",
    "rawIesContentReturned",
    "rawPhotometryReturned",
    "candelaArraysReturned",
    "base64ArtifactsReturned",
    "exactElectricalValuesReturned",
    "privatePathsReturned",
    "credentialsReturned",
  ]) {
    assert.equal(result[key], false, key);
    assert.equal(result.safetyFlags[key], false, `safetyFlags.${key}`);
  }
  assert.equal(result.readOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.preflightOnly, true);
  assert.equal(result.safeSummaryOnly, true);
}

test("reports ready for the future persistence-authority step without enabling persistence", () => {
  const result = preflight();

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.readyForPersistenceAuthority);
  assert.equal(result.persistenceAuthorityPreflightState, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.readyForPersistenceAuthority);
  assert.equal(result.readyForPersistenceAuthority, true);
  assert.equal(result.failClosed, false);
  assert.deepEqual(result.missingRequirements, []);
  assert.equal(result.acceptedSelectedResultAuthorityReady, true);
  assert.equal(result.selectedResultPersistenceBoundaryContractReady, true);
  assert.equal(result.selectedResultOutputReadinessPreflightReadyForPersistence, true);
  assertPreflightOnly(result);
});

test("stays not-ready when accepted selected-result authority is missing", () => {
  const result = preflight({
    acceptedSelectedResultAuthorityGateSummary: gate({
      state: "not_compared_fail_closed",
      selectedResultAuthorityState: "not_compared_fail_closed",
      acceptedSelectedResultAuthorityReady: false,
      acceptedSelectedResultAuthority: false,
      acceptedForReadOnlyRuntimeAuthority: false,
      accepted: false,
      failClosed: true,
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.notReady);
  assert.equal(result.readyForPersistenceAuthority, false);
  assert.equal(result.failClosed, true);
  assert.ok(result.missingRequirements.includes("accepted-selected-result-authority-ready"));
  assertPreflightOnly(result);
});

test("stays not-ready when the persistence boundary contract is not ready", () => {
  const selectedResultPersistenceBoundaryContractSummary = boundary({
    acceptedSelectedResultAuthorityGateSummary: gate({
      state: "not_compared_fail_closed",
      selectedResultAuthorityState: "not_compared_fail_closed",
      acceptedSelectedResultAuthorityReady: false,
      acceptedSelectedResultAuthority: false,
      acceptedForReadOnlyRuntimeAuthority: false,
      accepted: false,
      failClosed: true,
    }),
  });
  const result = preflight({
    selectedResultPersistenceBoundaryContractSummary,
    selectedResultOutputReadinessPreflightSummary: outputPreflight(selectedResultPersistenceBoundaryContractSummary),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.notReady);
  assert.equal(result.readyForPersistenceAuthority, false);
  assert.ok(result.missingRequirements.includes("selected-result-persistence-boundary-contract-ready"));
  assertPreflightOnly(result);
});

test("stays not-ready when output-readiness has not opened the persistence path", () => {
  const selectedResultPersistenceBoundaryContractSummary = boundary();
  const result = preflight({
    selectedResultOutputReadinessPreflightSummary: outputPreflight(selectedResultPersistenceBoundaryContractSummary, {
      selectedResultPersistenceBoundaryContractSummary: {},
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.notReady);
  assert.equal(result.readyForPersistenceAuthority, false);
  assert.ok(result.missingRequirements.includes("selected-result-output-readiness-preflight-ready-for-persistence"));
  assertPreflightOnly(result);
});

test("rejects raw selected-result bodies and remains preflight only", () => {
  const result = preflight({
    selectedResultProjectionSummary: projection({
      selectedResultBody: { unsafe: true },
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.blockedFailClosed);
  assert.equal(result.readyForPersistenceAuthority, false);
  assert.match(result.reason, /unsafe or mismatched input rejected/);
  assert.ok(result.missingRequirements.some((item) => item.startsWith("unsafe-input-rejected")));
  assertPreflightOnly(result);
});

test("rejects accidental persistence/write/generation flags", () => {
  const result = preflight({
    selectedResultPersistenceEnabled: true,
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.blockedFailClosed);
  assert.equal(result.readyForPersistenceAuthority, false);
  assert.match(result.reason, /unsafe or mismatched input rejected/);
  assertPreflightOnly(result);
});

test("rejects fingerprint mismatches before persistence authority can be claimed", () => {
  const result = preflight({
    selectedResultProjectionSummary: projection({ sourceFingerprint: "safe-source:other-fixture" }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_AUTHORITY_PREFLIGHT_STATES.blockedFailClosed);
  assert.equal(result.readyForPersistenceAuthority, false);
  assert.match(result.reason, /fingerprint mismatch/);
  assertPreflightOnly(result);
});

test("runtime alias points at the selected-result persistence-authority preflight helper", () => {
  assert.equal(buildRuntimeSelectedResultPersistenceAuthorityPreflight, buildSelectedResultPersistenceAuthorityPreflight);
});
