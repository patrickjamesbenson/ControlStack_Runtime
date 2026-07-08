import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRunTableFirstNarrowOutputHandoffContract,
  buildRuntimeRunTableFirstNarrowOutputHandoffContract,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runTableFirstNarrowOutputHandoffContract.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";

const POLICY_FINGERPRINT = "safe-policy:runtable-first-narrow-output-handoff-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtable-first-narrow-output-handoff-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:runtable-first-narrow-output-handoff-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:runtable-first-narrow-output-handoff-fixture";
const PERSISTED_SUMMARY_FINGERPRINT = "safe-persisted-selected-result-summary:runtable-first-narrow-output-handoff-fixture";
const SLOT_CONTRACT_FINGERPRINT = "safe-selected-result-persisted-summary-slot-contract:runtable-first-narrow-output-handoff-fixture";

function persistedSummary(overrides = {}) {
  return {
    schemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    slotSchemaId: "controlstack.runtime.selected-result-persisted-summary-slot.v1",
    slotSchemaVersion: 1,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_selected_result_summary_persisted",
    summaryOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
    selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
    selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
    selectedResultOutputReadinessPreflightState: "selected_result_output_readiness_ready_for_persistence",
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    persistedSelectedResultSummaryFingerprint: PERSISTED_SUMMARY_FINGERPRINT,
    selectedResultPersistedSummarySlotContractFingerprint: SLOT_CONTRACT_FINGERPRINT,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    runTableGenerationAttempted: false,
    productionRunTableGenerated: false,
    productionRunTableGenerationEnabled: false,
    runTableRowsReturned: false,
    rawRunTableRowsReturned: false,
    runTableRowsPersisted: false,
    runTableOutputPersisted: false,
    runTableOutputHandoffWritten: false,
    runTableOutputHandoffWriteEnabled: false,
    runTableOutputHandoffAttempted: false,
    iesGenerated: false,
    iesGenerationEnabled: false,
    iesGenerationAttempted: false,
    outputGenerated: false,
    outputGenerationEnabled: false,
    drawingGenerationEnabled: false,
    photometryGenerationEnabled: false,
    routesAdded: false,
    publicRouteAdded: false,
    postEndpointsAdded: false,
    postEndpointAdded: false,
    projectWriteEnabled: false,
    runtimeDataMutationEnabled: false,
    runtimeDataMutated: false,
    boardDataMutationEnabled: false,
    donorDataMutationEnabled: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawSelectedPayloadReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    ...overrides,
  };
}

function contract(overrides = {}) {
  return buildRunTableFirstNarrowOutputHandoffContract({
    selectedResultPersisted: true,
    selectedResultPersistenceWriteComplete: true,
    selectedResultPersistedSummarySlotContractReady: true,
    persistedSelectedResultSummary: persistedSummary(),
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    persistedSelectedResultSummaryFingerprint: PERSISTED_SUMMARY_FINGERPRINT,
    selectedResultPersistedSummarySlotContractFingerprint: SLOT_CONTRACT_FINGERPRINT,
    ...overrides,
  });
}

function assertFalseFlags(result) {
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS) {
    assert.equal(result[key], false, key);
    assert.equal(result.safetyFlags[key], false, `safetyFlags.${key}`);
  }
}

function assertBlocked(result, missingRequirement) {
  assert.equal(result.state, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.blockedFailClosed);
  assert.equal(result.runTableFirstNarrowOutputHandoffContractReady, false);
  assert.equal(result.failClosed, true);
  assert.ok(result.missingRequirements.includes(missingRequirement), `${missingRequirement} missing from ${result.missingRequirements.join(",")}`);
  assertFalseFlags(result);
}

test("ready contract from valid persisted summary", () => {
  const result = contract();

  assert.equal(result.schemaId, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_CONTRACT_SCHEMA_VERSION);
  assert.equal(result.summarySchemaId, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID);
  assert.equal(result.summarySchemaVersion, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.state, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady);
  assert.equal(result.runTableFirstNarrowOutputHandoffContractState, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady);
  assert.equal(result.runTableFirstNarrowOutputHandoffContractReady, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.blocker, null);
  assert.deepEqual(result.missingRequirements, []);

  assert.equal(result.owner, "runtime");
  assert.equal(result.handoffOwner, "runtime");
  assert.equal(result.consumerOwner, "shell");
  assert.equal(result.sourceKind, "persisted-selected-result-summary");
  assert.equal(result.targetKind, "diagnostic-first-narrow-output-handoff-contract");
  assert.equal(result.readOnly, true);
  assert.equal(result.contractOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.summaryOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.redacted, true);
  assert.equal(result.machineValueSafe, true);

  assert.equal(result.persistedSelectedResultSummaryRequired, true);
  assert.equal(result.persistedSelectedResultSummaryPresent, true);
  assert.equal(result.persistedSelectedResultSummarySchemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(result.persistedSelectedResultSummarySchemaVersion, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.selectedResultPersisted, true);
  assert.equal(result.selectedResultPersistedSummarySlotContractReady, true);

  assert.equal(result.acceptedSelectedResultAuthorityState, "accepted_selected_result_authority");
  assert.equal(result.selectedResultPersistenceAuthorityPreflightState, "ready_for_persistence_authority");
  assert.equal(result.selectedResultPersistenceBoundaryState, "selected_result_persistence_boundary_contract_ready");
  assert.equal(result.selectedResultOutputReadinessPreflightState, "selected_result_output_readiness_ready_for_persistence");

  assert.equal(result.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(result.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(result.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(result.sourceVersionFingerprint, SOURCE_VERSION_FINGERPRINT);
  assert.equal(result.persistedSelectedResultSummaryFingerprint, PERSISTED_SUMMARY_FINGERPRINT);
  assert.equal(result.selectedResultPersistedSummarySlotContractFingerprint, SLOT_CONTRACT_FINGERPRINT);
  assert.ok(result.runTableFirstNarrowOutputHandoffContractFingerprint.startsWith("safe-runtable-first-narrow-output-handoff-contract:"));

  assert.deepEqual(result.gatingPrerequisites, [...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES]);
  for (const gate of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_GATING_PREREQUISITES) {
    assert.equal(result.requirements[gate], true, gate);
  }
  assert.deepEqual(result.eligibleHandoffSummaryShape, {
    schemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceKind: "persisted-selected-result-summary",
    futureOutputKind: "runtable-first-narrow-output",
    rowsIncluded: false,
    rowCount: 0,
    generated: false,
    generationEnabled: false,
    persisted: false,
    routeAdded: false,
    postEndpointAdded: false,
  });
  assertFalseFlags(result);
});

test("blocks when persisted summary is missing", () => {
  const result = contract({ persistedSelectedResultSummary: undefined });
  assertBlocked(result, "selected-result-persisted-summary-present");
  assert.equal(result.persistedSelectedResultSummaryPresent, false);
});

test("blocks when persisted summary schema/version is wrong", () => {
  const result = contract({
    persistedSelectedResultSummary: persistedSummary({ schemaId: "wrong.schema", schemaVersion: 999 }),
  });
  assertBlocked(result, "selected-result-persisted-summary-schema-valid");
  assert.equal(result.persistedSelectedResultSummarySchemaId, "wrong.schema");
  assert.equal(result.persistedSelectedResultSummarySchemaVersion, 999);
});

test("blocks raw RunTable rows", () => {
  const result = contract({
    persistedSelectedResultSummary: persistedSummary({ runTableRows: [{ board: "raw-board-row" }] }),
  });
  assertBlocked(result, "persisted-summary-has-no-raw-run-table-rows");
});

test("blocks raw engine/result payload", () => {
  const result = contract({
    persistedSelectedResultSummary: persistedSummary({ rawEnginePayload: { body: "unsafe" } }),
  });
  assertBlocked(result, "persisted-summary-has-no-raw-engine-payload");
});

test("blocks output/generation flags", () => {
  const result = contract({
    persistedSelectedResultSummary: persistedSummary({ runTableGenerationEnabled: true, outputGenerationEnabled: true }),
  });
  assertBlocked(result, "run-table-generation-remains-disabled");
  assert.ok(result.missingRequirements.includes("output-generation-remains-disabled"));
});

test("blocks fingerprint mismatch", () => {
  const result = contract({ sourceFingerprint: "safe-source:runtable-first-narrow-output-handoff-other-fixture" });
  assertBlocked(result, "fingerprints-aligned");
});

test("does not expose rows", () => {
  const result = contract();
  assert.deepEqual(result.rows, []);
  assert.equal(result.eligibleHandoffSummaryShape.rowsIncluded, false);
  assert.equal(result.eligibleHandoffSummaryShape.rowCount, 0);
  assert.equal(result.eligibleHandoffSummaryShape.generated, false);
  assert.equal(result.eligibleHandoffSummaryShape.generationEnabled, false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "runTableRows"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "rawRunTableRows"), false);
  assert.equal(result.runTableRowsReturned, false);
  assert.equal(result.rawRunTableRowsReturned, false);
});

test("runtime alias points at the RunTable first narrow output handoff contract helper", () => {
  assert.equal(buildRuntimeRunTableFirstNarrowOutputHandoffContract, buildRunTableFirstNarrowOutputHandoffContract);
});
