import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSelectedResultPersistenceBoundaryContract,
  buildSelectedResultPersistenceBoundaryContract,
  SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
  SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-persistence-boundary-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-persistence-boundary-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-persistence-boundary-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-persistence-boundary-fixture";

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

function contract(overrides = {}) {
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

function assertPersistenceAndGenerationDisabled(result) {
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
}

test("freezes the selected-result persistence boundary without persisting or enabling writes", () => {
  const result = contract();

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.contractReady);
  assert.equal(result.selectedResultPersistenceContractReady, true);
  assert.equal(result.selectedResultPersistenceRedactionBoundaryReady, true);
  assert.equal(result.selectedResultPersistenceMutationGateReady, true);
  assert.equal(result.selectedResultPersistenceSafeTargetDefined, true);
  assert.equal(result.safeWriteTargetDefined, true);
  assert.equal(result.failClosed, false);
  assert.deepEqual(result.missingRequirements, []);

  assert.equal(result.safeWriteTarget.owner, "shell");
  assert.equal(result.safeWriteTarget.targetKind, "project-envelope-summary-slot");
  assert.equal(result.safeWriteTarget.moduleId, "cs_selector");
  assert.equal(result.safeWriteTarget.runtimeDataTarget, false);
  assert.equal(result.safeWriteTarget.boardDataTarget, false);
  assert.equal(result.safeWriteTarget.donorDataTarget, false);
  assert.deepEqual(result.safeWriteTarget, SELECTED_RESULT_PERSISTENCE_SAFE_WRITE_TARGET);

  assert.equal(result.eligiblePersistedSummaryShape.owner, "shell");
  assert.equal(result.eligiblePersistedSummaryShape.targetKind, "project-envelope-summary-slot");
  assert.equal(result.eligiblePersistedSummaryShape.summaryOnly, true);
  assert.equal(result.eligiblePersistedSummaryShape.redacted, true);
  assert.ok(result.eligiblePersistedSummaryShape.allowedFields.includes("policyFingerprint"));
  assert.ok(result.eligiblePersistedSummaryShape.allowedFields.includes("persistenceBoundaryContractFingerprint"));
  assert.ok(result.eligiblePersistedSummaryShape.requiredFalseFlags.includes("selectedResultPersisted"));

  for (const blockedClass of SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES) {
    assert.ok(result.blockedRawFieldClasses.includes(blockedClass), blockedClass);
    assert.ok(result.eligiblePersistedSummaryShape.blockedRawFieldClasses.includes(blockedClass), blockedClass);
  }
  assertPersistenceAndGenerationDisabled(result);
});

test("fails closed when accepted selected-result authority is not established", () => {
  const result = contract({
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

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistenceContractReady, false);
  assert.equal(result.selectedResultPersistenceRedactionBoundaryReady, false);
  assert.equal(result.selectedResultPersistenceMutationGateReady, false);
  assert.equal(result.selectedResultPersistenceSafeTargetDefined, false);
  assert.equal(result.safeWriteTargetDefined, true);
  assert.ok(result.missingRequirements.includes("accepted-selected-result-authority-established"));
  assertPersistenceAndGenerationDisabled(result);
});

test("fails closed when stale comparison is not clean", () => {
  const result = contract({
    acceptedSelectedResultAuthorityGateSummary: gate({ checks: { staleComparisonClean: false } }),
    selectedResultAuthorityGuardSummary: guard({ stale: true, comparisonAttempted: true }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistenceContractReady, false);
  assert.ok(result.missingRequirements.includes("stale-and-fingerprint-comparison-clean"));
  assertPersistenceAndGenerationDisabled(result);
});

test("rejects raw selected-result bodies and keeps the boundary non-persistent", () => {
  const result = contract({
    selectedResultProjectionSummary: projection({
      selectedResultBody: { unsafe: true },
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistenceContractReady, false);
  assert.match(result.reason, /unsafe or mismatched input rejected/);
  assert.ok(result.missingRequirements.some((item) => item.startsWith("unsafe-input-rejected")));
  assertPersistenceAndGenerationDisabled(result);
});

test("rejects fingerprint mismatches before a future persisted summary is eligible", () => {
  const result = contract({
    selectedResultProjectionSummary: projection({
      sourceFingerprint: "safe-source:other-fixture",
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistenceContractReady, false);
  assert.match(result.reason, /fingerprint mismatch/);
  assertPersistenceAndGenerationDisabled(result);
});

test("rejects accidental persistence/write/generation flags", () => {
  const result = contract({
    selectedResultPersistenceEnabled: true,
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTENCE_BOUNDARY_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistenceContractReady, false);
  assert.match(result.reason, /unsafe or mismatched input rejected/);
  assertPersistenceAndGenerationDisabled(result);
});

test("runtime alias points at the selected-result persistence boundary contract helper", () => {
  assert.equal(buildRuntimeSelectedResultPersistenceBoundaryContract, buildSelectedResultPersistenceBoundaryContract);
});
