import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRuntimeSelectedResultPersistedSummarySlotContract,
  buildSelectedResultPersistedSummarySlotContract,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_CONTRACT_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET,
} from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import { SAVED_PROJECT_SCHEMA } from "../packages/workspace-kernel/projectEnvelope.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-persisted-summary-slot-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-persisted-summary-slot-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-persisted-summary-slot-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-persisted-summary-slot-fixture";

function authorityPreflight(overrides = {}) {
  return {
    state: "ready_for_persistence_authority",
    persistenceAuthorityPreflightState: "ready_for_persistence_authority",
    readyForPersistenceAuthority: true,
    acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
    selectedResultOutputReadinessPreflightState: "persistence_not_ready",
    selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
    acceptedSelectedResultAuthorityReady: true,
    selectedResultPersistenceBoundaryContractReady: true,
    selectedResultOutputReadinessPreflightReadyForPersistence: true,
    failClosed: false,
    readOnly: true,
    diagnosticOnly: true,
    preflightOnly: true,
    safeSummaryOnly: true,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersistenceAttempted: false,
    selectedResultPersistenceImplementationAllowed: false,
    selectedResultPersistenceWriteHookAdded: false,
    projectWriteEnabled: false,
    runtimeDataMutationEnabled: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    fingerprints: {
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
      sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
      sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    },
    summaryFingerprints: {
      acceptedSelectedResultAuthorityGate: "safe-accepted-selected-result-authority-gate:slot-fixture",
      selectedResultOutputReadinessPreflight: "safe-selected-result-output-readiness-preflight:slot-fixture",
      selectedResultPersistenceBoundaryContract: "safe-selected-result-persistence-boundary-contract:slot-fixture",
      selectedResultAuthorityGuard: "safe-selected-result-authority-guard:slot-fixture",
      selectedResultProjection: "safe-selected-result-projection:slot-fixture",
      safeSelectedResultSourceObject: "safe-selected-result-source-object:slot-fixture",
      selectedResultHandoffScaffold: "safe-selected-result-handoff-scaffold:slot-fixture",
    },
    requirements: {
      "accepted-selected-result-authority-ready": true,
      "selected-result-persistence-boundary-contract-ready": true,
      "selected-result-output-readiness-preflight-ready-for-persistence": true,
      "selected-result-authority-guard-clean": true,
      "selected-result-projection-summary-safe": true,
      "safe-selected-result-source-object-summary-safe": true,
      "selected-result-handoff-scaffold-ready": true,
    },
    missingRequirements: [],
    selectedResultPersistenceAuthorityPreflightFingerprint: "safe-selected-result-persistence-authority-preflight:slot-fixture",
    ...overrides,
  };
}

function boundaryContract(overrides = {}) {
  return {
    state: "selected_result_persistence_boundary_contract_ready",
    persistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
    selectedResultPersistenceContractReady: true,
    selectedResultPersistenceRedactionBoundaryReady: true,
    selectedResultPersistenceMutationGateReady: true,
    selectedResultPersistenceSafeTargetDefined: true,
    safeWriteTargetDefined: true,
    eligiblePersistedSummaryShapeDefined: true,
    redactionBoundaryDefined: true,
    mutationGateDefinedAndDisabled: true,
    failClosed: false,
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    selectedResultPersisted: false,
    selectedResultPersistenceEnabled: false,
    selectedResultPersistenceAttempted: false,
    selectedResultPersistenceImplementationAllowed: false,
    selectedResultPersistenceWriteHookAdded: false,
    projectWriteEnabled: false,
    runtimeDataMutationEnabled: false,
    runTableGenerationEnabled: false,
    runTableGenerated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    outputGenerationEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safeWriteTarget: {
      owner: "shell",
      targetKind: "project-envelope-summary-slot",
      envelopeOwner: "shell",
      moduleId: "cs_selector",
      slot: "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary",
      summaryOnly: true,
      redacted: true,
      runtimeDataTarget: false,
      boardDataTarget: false,
      donorDataTarget: false,
      runTableTarget: false,
      iesTarget: false,
    },
    eligiblePersistedSummaryShape: {
      schemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
      schemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
      owner: "shell",
      targetKind: "project-envelope-summary-slot",
      moduleId: "cs_selector",
      summaryOnly: true,
      redacted: true,
      allowedFields: ["policyFingerprint", "persistenceBoundaryContractFingerprint"],
      requiredFalseFlags: ["selectedResultPersisted"],
      blockedRawFieldClasses: [...SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES],
    },
    fingerprints: {
      policyFingerprint: POLICY_FINGERPRINT,
      sourceFingerprint: SOURCE_FINGERPRINT,
      sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
      sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    },
    selectedResultPersistenceBoundaryContractFingerprint: "safe-selected-result-persistence-boundary-contract:slot-fixture",
    ...overrides,
  };
}

function contract(overrides = {}) {
  return buildSelectedResultPersistedSummarySlotContract({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    selectedResultPersistenceAuthorityPreflightSummary: authorityPreflight(),
    selectedResultPersistenceBoundaryContractSummary: boundaryContract(),
    ...overrides,
  });
}

function assertWritesAndOutputsDisabled(result) {
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

test("freezes the shell-owned selected-result persisted-summary slot contract without writing", () => {
  const result = contract();

  assert.equal(result.schemaId, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_CONTRACT_SCHEMA_ID);
  assert.equal(result.state, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.contractReady);
  assert.equal(result.selectedResultPersistedSummarySlotContractReady, true);
  assert.equal(result.failClosed, false);
  assert.deepEqual(result.missingRequirements, []);

  assert.equal(result.owner, "shell");
  assert.equal(result.slotOwner, "shell");
  assert.equal(result.moduleId, "cs_selector");
  assert.equal(result.slotTarget.envelopeSchema, SAVED_PROJECT_SCHEMA);
  assert.equal(result.slotTarget.targetLocation, "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary");
  assert.equal(result.slotTarget.envelopePath, "modules.cs_selector.downstreamContext.selectedResultSummary");
  assert.deepEqual(result.slotTarget, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_TARGET);

  assert.equal(result.runtimeDataTarget, false);
  assert.equal(result.boardDataTarget, false);
  assert.equal(result.donorDataTarget, false);
  assert.equal(result.runTableTarget, false);
  assert.equal(result.iesTarget, false);
  assert.equal(result.outputTarget, false);

  assert.equal(result.eligiblePersistedSummaryShape.schemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(result.eligiblePersistedSummaryShape.schemaVersion, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.eligiblePersistedSummaryShape.slotSchemaId, result.slotSchemaId);
  assert.equal(result.eligiblePersistedSummaryShape.summaryOnly, true);
  assert.equal(result.eligiblePersistedSummaryShape.redacted, true);
  assert.equal(result.eligiblePersistedSummaryShape.machineValueSafe, true);
  assert.deepEqual(result.eligiblePersistedSummaryFieldSet, [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET]);
  assert.deepEqual(result.eligiblePersistedSummaryShape.requiredFalseFlags, [...SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS]);
  assert.ok(result.eligiblePersistedSummaryShape.requiredFields.includes("selectedResultPersistenceAuthorityPreflightFingerprint"));
  assert.ok(result.eligiblePersistedSummaryShape.requiredFields.includes("selectedResultPersistenceBoundaryContractFingerprint"));

  for (const blockedClass of SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES) {
    assert.ok(result.blockedRawFieldClasses.includes(blockedClass), blockedClass);
    assert.ok(result.eligiblePersistedSummaryShape.blockedRawFieldClasses.includes(blockedClass), blockedClass);
  }

  assert.equal(result.rollbackPolicy.currentContractPersistenceAttempted, false);
  assert.equal(result.rollbackPolicy.currentContractWriteEnabled, false);
  assert.equal(result.rollbackPolicy.preservePreviousEnvelopeOnFailure, true);
  assert.equal(result.rollbackPolicy.preservePreviousSlotOnFailure, true);
  assertWritesAndOutputsDisabled(result);
});

test("fails closed when persistence authority preflight is not ready", () => {
  const result = contract({
    selectedResultPersistenceAuthorityPreflightSummary: authorityPreflight({
      state: "not_ready_for_persistence_authority",
      persistenceAuthorityPreflightState: "not_ready_for_persistence_authority",
      readyForPersistenceAuthority: false,
      failClosed: true,
      missingRequirements: ["selected-result-output-readiness-preflight-ready-for-persistence"],
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistedSummarySlotContractReady, false);
  assert.equal(result.failClosed, true);
  assert.ok(result.missingRequirements.includes("selected-result-persistence-authority-preflight-ready"));
  assertWritesAndOutputsDisabled(result);
});

test("fails closed when the boundary write target drifts away from the shell envelope summary slot", () => {
  const result = contract({
    selectedResultPersistenceBoundaryContractSummary: boundaryContract({
      safeWriteTarget: {
        owner: "runtime",
        targetKind: "runtime-data-write",
        moduleId: "cs_selector",
        runtimeDataTarget: true,
        boardDataTarget: false,
        donorDataTarget: false,
        runTableTarget: false,
        iesTarget: false,
      },
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistedSummarySlotContractReady, false);
  assert.ok(result.missingRequirements.includes("selected-result-persistence-boundary-contract-ready"));
  assert.equal(result.slotTarget.owner, "shell");
  assertWritesAndOutputsDisabled(result);
});

test("rejects raw selected-result payloads before slot eligibility", () => {
  const result = contract({
    selectedResultPersistenceAuthorityPreflightSummary: authorityPreflight({
      selectedResultBody: { unsafe: true },
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistedSummarySlotContractReady, false);
  assert.match(result.reason, /unsafe or mismatched input rejected/);
  assert.ok(result.missingRequirements.some((item) => item.startsWith("unsafe-input-rejected")));
  assertWritesAndOutputsDisabled(result);
});

test("rejects fingerprint mismatch between persistence authority and boundary", () => {
  const result = contract({
    selectedResultPersistenceBoundaryContractSummary: boundaryContract({
      fingerprints: {
        policyFingerprint: POLICY_FINGERPRINT,
        sourceFingerprint: "safe-source:other-slot-fixture",
        sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
        sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
      },
    }),
  });

  assert.equal(result.state, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistedSummarySlotContractReady, false);
  assert.match(result.reason, /fingerprint mismatch/);
  assertWritesAndOutputsDisabled(result);
});

test("rejects accidental persistence attempts or write enabling", () => {
  const result = contract({ selectedResultPersistenceAttempted: true });

  assert.equal(result.state, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed);
  assert.equal(result.selectedResultPersistedSummarySlotContractReady, false);
  assert.match(result.reason, /unsafe or mismatched input rejected/);
  assertWritesAndOutputsDisabled(result);
});

test("runtime alias points at the selected-result persisted-summary slot contract helper", () => {
  assert.equal(buildRuntimeSelectedResultPersistedSummarySlotContract, buildSelectedResultPersistedSummarySlotContract);
});
