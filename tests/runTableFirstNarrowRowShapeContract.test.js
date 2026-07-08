import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRunTableFirstNarrowRowShapeContract,
  buildRuntimeRunTableFirstNarrowRowShapeContract,
  RUNTABLE_FIRST_NARROW_ROW_FIELD_SET,
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_GATING_PREREQUISITES,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS,
} from "../packages/workspace-kernel/runTableFirstNarrowRowShapeContract.js";
import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowOutputHandoffContract.js";

const POLICY_FINGERPRINT = "safe-policy:runtable-first-narrow-row-shape-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtable-first-narrow-row-shape-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:runtable-first-narrow-row-shape-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:runtable-first-narrow-row-shape-fixture";
const PERSISTED_SUMMARY_FINGERPRINT = "safe-persisted-selected-result-summary:runtable-first-narrow-row-shape-fixture";
const SLOT_CONTRACT_FINGERPRINT = "safe-selected-result-persisted-summary-slot-contract:runtable-first-narrow-row-shape-fixture";
const HANDOFF_CONTRACT_FINGERPRINT = "safe-runtable-first-narrow-output-handoff-contract:runtable-first-narrow-row-shape-fixture";

function persistedRunTableOutputSummary(overrides = {}) {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_runtable_first_narrow_output_summary_persisted",
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
    runTableFirstNarrowOutputHandoffContractState: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady,
    runTableFirstNarrowOutputHandoffContractReady: true,
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
    runTableFirstNarrowOutputHandoffContractFingerprint: HANDOFF_CONTRACT_FINGERPRINT,
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
  return buildRunTableFirstNarrowRowShapeContract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary(),
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    persistedSelectedResultSummaryFingerprint: PERSISTED_SUMMARY_FINGERPRINT,
    runTableFirstNarrowOutputHandoffContractFingerprint: HANDOFF_CONTRACT_FINGERPRINT,
    ...overrides,
  });
}

function assertFalseFlags(result) {
  for (const key of RUNTABLE_FIRST_NARROW_ROW_SHAPE_REQUIRED_FALSE_FLAGS) {
    assert.equal(result[key], false, key);
    assert.equal(result.safetyFlags[key], false, `safetyFlags.${key}`);
  }
}

function assertBlocked(result, missingRequirement) {
  assert.equal(result.state, RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.blockedFailClosed);
  assert.equal(result.runTableFirstNarrowRowShapeContractReady, false);
  assert.equal(result.failClosed, true);
  assert.ok(result.missingRequirements.includes(missingRequirement), `${missingRequirement} missing from ${result.missingRequirements.join(",")}`);
  assertFalseFlags(result);
  assert.deepEqual(result.rows, []);
  assert.equal(result.rowsIncluded, false);
  assert.equal(result.rowCount, 0);
}

test("ready row-shape contract from valid persisted RunTable first narrow output summary", () => {
  const result = contract();

  assert.equal(result.schemaId, RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION);
  assert.equal(result.rowSchemaId, RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID);
  assert.equal(result.rowSchemaVersion, RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION);
  assert.equal(result.state, RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.contractReady);
  assert.equal(result.runTableFirstNarrowRowShapeContractState, RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.contractReady);
  assert.equal(result.runTableFirstNarrowRowShapeContractReady, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.blocker, null);
  assert.deepEqual(result.missingRequirements, []);

  assert.equal(result.owner, "runtime");
  assert.equal(result.handoffOwner, "runtime");
  assert.equal(result.consumerOwner, "runtime");
  assert.equal(result.sourceKind, "runtable-first-narrow-output-handoff-summary");
  assert.equal(result.targetKind, "diagnostic-first-narrow-row-shape-contract");
  assert.equal(result.readOnly, true);
  assert.equal(result.contractOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.summaryOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.redacted, true);
  assert.equal(result.machineValueSafe, true);

  assert.equal(result.persistedRunTableFirstNarrowOutputSummaryRequired, true);
  assert.equal(result.persistedRunTableFirstNarrowOutputSummaryPresent, true);
  assert.equal(result.persistedRunTableFirstNarrowOutputSummarySchemaId, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID);
  assert.equal(result.persistedRunTableFirstNarrowOutputSummarySchemaVersion, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.persistedRunTableFirstNarrowOutputSummaryRowsIncluded, false);
  assert.equal(result.persistedRunTableFirstNarrowOutputSummaryRowCount, 0);
  assert.equal(result.runTableFirstNarrowOutputHandoffContractReady, true);
  assert.equal(result.runTableFirstNarrowOutputHandoffContractState, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady);

  assert.equal(result.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(result.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(result.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(result.sourceVersionFingerprint, SOURCE_VERSION_FINGERPRINT);
  assert.equal(result.persistedSelectedResultSummaryFingerprint, PERSISTED_SUMMARY_FINGERPRINT);
  assert.equal(result.runTableFirstNarrowOutputHandoffContractFingerprint, HANDOFF_CONTRACT_FINGERPRINT);
  assert.ok(result.runTableFirstNarrowRowShapeContractFingerprint.startsWith("safe-runtable-first-narrow-row-shape-contract:"));

  assert.deepEqual(result.gatingPrerequisites, [...RUNTABLE_FIRST_NARROW_ROW_SHAPE_GATING_PREREQUISITES]);
  for (const gate of RUNTABLE_FIRST_NARROW_ROW_SHAPE_GATING_PREREQUISITES) {
    assert.equal(result.requirements[gate], true, gate);
  }
  assertFalseFlags(result);
});

test("defines the eligible first narrow row field set without producing rows", () => {
  const result = contract();

  assert.deepEqual(result.rowFieldSet, [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET]);
  assert.deepEqual(result.firstNarrowRowFieldSet, [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET]);
  assert.deepEqual(result.eligibleFirstNarrowRowShape.fieldSet, [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET]);
  assert.deepEqual(result.eligibleFirstNarrowRowShape.firstFields, [
    "rowSchemaId",
    "rowSchemaVersion",
    "rowOrdinal",
    "rowKind",
    "sourceKind",
    "systemToken",
    "systemVariantToken",
    "opticToken",
    "lightControlToken",
    "runInputToken",
    "accessoryToken",
    "policyTokenSet",
  ]);
  assert.equal(result.eligibleFirstNarrowRowShape.schemaId, RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID);
  assert.equal(result.eligibleFirstNarrowRowShape.schemaVersion, RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION);
  assert.equal(result.eligibleFirstNarrowRowShape.rowsIncluded, false);
  assert.equal(result.eligibleFirstNarrowRowShape.rowCount, 0);
  assert.equal(result.eligibleFirstNarrowRowShape.generated, false);
  assert.equal(result.eligibleFirstNarrowRowShape.generationEnabled, false);
  assert.equal(result.eligibleFirstNarrowRowShape.persisted, false);
  assert.deepEqual(result.rows, []);
  assert.equal(result.rowsIncluded, false);
  assert.equal(result.rowCount, 0);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "runTableRows"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "rawRunTableRows"), false);
});

test("blocks when persisted RunTable first narrow output summary is missing", () => {
  const result = contract({ persistedRunTableFirstNarrowOutputSummary: undefined });
  assertBlocked(result, "persisted-runtable-first-narrow-output-summary-present");
  assert.equal(result.persistedRunTableFirstNarrowOutputSummaryPresent, false);
});

test("blocks when persisted RunTable first narrow output summary schema/version is wrong", () => {
  const result = contract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary({ schemaId: "wrong.schema", schemaVersion: 999 }),
  });
  assertBlocked(result, "persisted-runtable-first-narrow-output-summary-schema-valid");
  assert.equal(result.persistedRunTableFirstNarrowOutputSummarySchemaId, "wrong.schema");
  assert.equal(result.persistedRunTableFirstNarrowOutputSummarySchemaVersion, 999);
});

test("blocks when rows are already present", () => {
  const result = contract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary({ rows: [] }),
  });
  assertBlocked(result, "rows-not-present");
});

test("blocks when row count or rowsIncluded says rows exist", () => {
  const result = contract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary({ rowCount: 1, rowsIncluded: true }),
  });
  assertBlocked(result, "rows-included-false");
  assert.ok(result.missingRequirements.includes("row-count-zero"));
});

test("blocks generation and output flags", () => {
  const result = contract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary({ generated: true, generationEnabled: true, outputGenerationEnabled: true }),
  });
  assertBlocked(result, "run-table-generation-remains-disabled");
  assert.ok(result.missingRequirements.includes("output-generation-remains-disabled"));
});

test("blocks raw RunTable rows", () => {
  const result = contract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary({ rawRunTableRows: [{ board: "raw-board-row" }] }),
  });
  assertBlocked(result, "rows-not-present");
  assert.ok(result.missingRequirements.includes("raw-runtable-rows-absent"));
});

test("blocks raw engine/result payload", () => {
  const result = contract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary({ rawEngineResult: { payload: true } }),
  });
  assertBlocked(result, "raw-engine-result-payload-absent");
});

test("blocks fingerprint mismatch", () => {
  const result = contract({ sourceFingerprint: "safe-source:runtable-first-narrow-row-shape-other-fixture" });
  assertBlocked(result, "fingerprints-aligned");
});

test("blocks when the upstream RunTable output handoff contract is not ready", () => {
  const result = contract({
    persistedRunTableFirstNarrowOutputSummary: persistedRunTableOutputSummary({
      runTableFirstNarrowOutputHandoffContractReady: false,
      runTableFirstNarrowOutputHandoffContractState: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.blockedFailClosed,
    }),
  });
  assertBlocked(result, "persisted-runtable-first-narrow-output-handoff-contract-ready");
});

test("runtime alias points at the RunTable first narrow row-shape contract helper", () => {
  assert.equal(buildRuntimeRunTableFirstNarrowRowShapeContract, buildRunTableFirstNarrowRowShapeContract);
});
