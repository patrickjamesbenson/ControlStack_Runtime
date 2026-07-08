import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import { buildSelectedResultPersistedSummarySlotContract } from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import {
  buildRunTableFirstNarrowRowShapeContract,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowRowShapeContract.js";
import {
  RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET,
  RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROWS_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowRows.js";
import {
  RUNTABLE_FIRST_NARROW_ROWS_SLOT_TARGET,
} from "../packages/workspace-kernel/runTableFirstNarrowRowsSlotSummary.js";

const POLICY_FINGERPRINT = "safe-policy:runtable-first-narrow-rows-slot-write-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtable-first-narrow-rows-slot-write-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:runtable-first-narrow-rows-slot-write-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:runtable-first-narrow-rows-slot-write-fixture";
const SELECTED_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";
const RUNTABLE_OUTPUT_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary";

const RAW_ABSENT_KEYS = Object.freeze([
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawRun",
  "rawEnginePayload",
  "rawEngineResult",
  "enginePayload",
  "engineResult",
  "rawSelectedPayload",
  "selectedResultPayload",
  "selectorPayload",
  "rawSelectorPayload",
  "segments",
  "boards",
  "boardRun",
  "zonePlan",
  "mechanical",
  "suspensionPointsMm",
  "clipPointsMm",
  "gearTrayPlan",
  "driverRows",
  "accessoryRows",
  "SYSTEM_POLICY",
  "SYSTEM_COMPONENTS",
  "PRODUCTS",
  "BOARDS",
  "DRIVERS",
  "ACCESSORIES",
  "exactElectricalValues",
  "voltage",
  "current",
  "watts",
  "vf",
  "ies",
  "iesText",
  "rawIesContent",
  "photometry",
  "candela",
  "candelaGrid",
  "base64",
  "base64Artifacts",
  "pdf",
  "privatePath",
  "localPath",
  "filePath",
  "filename",
  "fileName",
  "credentials",
  "secrets",
  "targetPath",
  "writeTarget",
  "runtimeDataTarget",
  "boardDataTarget",
  "donorDataTarget",
  "routeTarget",
  "postEndpointTarget",
]);

function context(projectId = "runtable-first-narrow-rows-slot-write-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "RunTable first narrow rows slot write project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "RunTable first narrow rows slot write project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      selection: {},
    },
    identity: {
      identityState: "internal_identified",
      classification: "internal",
      actualRole: "internal_user",
      currentUser: {
        name: "Runtime User",
        email: "runtime@controlstack.local",
      },
    },
    downstream: {
      selector: {},
    },
    contractVersion: "runtable-first-narrow-rows-slot-write-test",
  };
}

function authorityPreflight(overrides = {}) {
  return {
    state: "ready_for_persistence_authority",
    persistenceAuthorityPreflightState: "ready_for_persistence_authority",
    readyForPersistenceAuthority: true,
    acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
    selectedResultOutputReadinessPreflightState: "selected_result_output_readiness_ready_for_persistence",
    selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
    selectedResultAuthorityGuardState: "engine_verified_selected_result_ready",
    selectedResultProjectionState: "selected_accepted",
    safeSelectedResultSourceState: "safe_selected_result_source_ready",
    selectedResultHandoffScaffoldState: "runtime_selected_result_handoff_scaffold_ready",
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
      acceptedSelectedResultAuthorityGate: "safe-accepted-selected-result-authority-gate:runtable-rows-slot-write-fixture",
      selectedResultOutputReadinessPreflight: "safe-selected-result-output-readiness-preflight:runtable-rows-slot-write-fixture",
      selectedResultPersistenceBoundaryContract: "safe-selected-result-persistence-boundary-contract:runtable-rows-slot-write-fixture",
      selectedResultAuthorityGuard: "safe-selected-result-authority-guard:runtable-rows-slot-write-fixture",
      selectedResultProjection: "safe-selected-result-projection:runtable-rows-slot-write-fixture",
      safeSelectedResultSourceObject: "safe-selected-result-source-object:runtable-rows-slot-write-fixture",
      selectedResultHandoffScaffold: "safe-selected-result-handoff-scaffold:runtable-rows-slot-write-fixture",
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
    selectedResultPersistenceAuthorityPreflightFingerprint: "safe-selected-result-persistence-authority-preflight:runtable-rows-slot-write-fixture",
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
      slot: SELECTED_TARGET,
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
    selectedResultPersistenceBoundaryContractFingerprint: "safe-selected-result-persistence-boundary-contract:runtable-rows-slot-write-fixture",
    ...overrides,
  };
}

function slotContract(overrides = {}) {
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

function selectedAndRunTableOutputContribution(contractSummary = slotContract()) {
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        selectedResultSummaryCandidate: {
          state: "redacted_candidate_ready",
        },
        selectedResultPersistedSummarySlotContractSummary: contractSummary,
        runTableFirstNarrowOutputSummaryWrite: {
          writeRequested: true,
        },
      },
    },
  };
}

function safeSelectedResultSourceObject(overrides = {}) {
  return {
    sourceKind: "safe-selected-result-source-object-summary",
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceFingerprint: SOURCE_FINGERPRINT,
    runs: [
      {
        runKey: "accepted-safe-run-0",
        rowKey: "accepted-safe-run-0-row",
        runIndex: 0,
        accepted: true,
        engineVerified: true,
        safeSummaryOnly: true,
        redacted: true,
        machineValueSafe: true,
        hasBodyRequested: true,
        boardCount: 2,
        segmentCount: 3,
        zoneCount: 1,
        clipPointsCount: 4,
        suspensionPointsCount: 5,
        gearTrayPlanCount: 1,
        reservedRangesCount: 2,
        rawRunReturned: false,
        rawRunTableRowsReturned: false,
        rawSourceRowsReturned: false,
        rawValuesReturned: false,
      },
    ],
    ...overrides,
  };
}

function saveSelectedAndRunTableOutput(store, projectId) {
  const result = store.saveCurrentProjectEnvelope(context(projectId), selectedAndRunTableOutputContribution());
  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.selectedResultPersistedSummaryWritten, true);
  assert.equal(result.runTableFirstNarrowOutputSummaryWritten, true);
  return result.envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary;
}

function readyRowShapeContract(runTableFirstNarrowOutputSummary, overrides = {}) {
  const contract = buildRunTableFirstNarrowRowShapeContract({
    runTableFirstNarrowOutputSummary,
    ...overrides,
  });
  assert.equal(contract.state, RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.contractReady, contract.blocker);
  return contract;
}

function rowsSlotContribution({ rowShapeContract, source = safeSelectedResultSourceObject(), downstream = {}, directWrite = {} }) {
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        runTableFirstNarrowRowsSlotWrite: {
          writeRequested: true,
          ...directWrite,
        },
        runTableFirstNarrowRowShapeContract: rowShapeContract,
        safeSelectedResultSourceObject: source,
        ...downstream,
      },
    },
  };
}

function assertFalseFlags(summary) {
  for (const key of RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
    assert.equal(summary.safetyFlags[key], false, `safetyFlags.${key}`);
  }
}

function assertRawAbsent(value, path = "summary") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertRawAbsent(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    assert.equal(RAW_ABSENT_KEYS.includes(key), false, `${path}.${key} must stay absent`);
    assertRawAbsent(nested, `${path}.${key}`);
  }
}

test("writes one redacted RunTable first narrow row only to the shell-owned envelope slot", () => {
  const store = createSavedProjectStore();
  const outputSummary = saveSelectedAndRunTableOutput(store, "runtable-rows-slot-project");
  const rowShapeContract = readyRowShapeContract(outputSummary);

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-rows-slot-project"),
    rowsSlotContribution({ rowShapeContract }),
  );

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.runTableFirstNarrowRowsWritten, true);
  assert.equal(result.runTableFirstNarrowRowsTarget, RUNTABLE_FIRST_NARROW_ROWS_SLOT_TARGET);

  const envelope = result.envelope;
  const downstream = envelope.modules.cs_selector.downstreamContext;
  assert.deepEqual(Object.keys(downstream).sort(), [
    "runTableFirstNarrowOutputSummary",
    "runTableFirstNarrowRows",
  ]);
  assert.equal(envelope.runTableFirstNarrowRows, undefined);
  assert.equal(envelope.project.runTableFirstNarrowRows, undefined);
  assert.equal(envelope.project.metadata.runTableFirstNarrowRows, undefined);
  assert.equal(envelope.project.currentProject.runTableFirstNarrowRows, undefined);
  assert.equal(envelope.project.selection.runTableFirstNarrowRows, undefined);
  assert.equal(envelope.shell.downstream.selector.runTableFirstNarrowRows, undefined);
  assert.equal(envelope.modules.cs_selector.state.runTableFirstNarrowRows, undefined);
});

test("persists only the allow-listed safe first narrow row shape", () => {
  const store = createSavedProjectStore();
  const outputSummary = saveSelectedAndRunTableOutput(store, "runtable-rows-slot-shape-project");
  const rowShapeContract = readyRowShapeContract(outputSummary);

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-rows-slot-shape-project"),
    rowsSlotContribution({ rowShapeContract }),
  );
  const summary = result.envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowRows;

  assert.equal(summary.schemaId, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID);
  assert.equal(summary.schemaVersion, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.targetLocation, RUNTABLE_FIRST_NARROW_ROWS_SLOT_TARGET);
  assert.equal(summary.state, RUNTABLE_FIRST_NARROW_ROWS_STATES.ready);
  assert.equal(summary.slotPersisted, true);
  assert.equal(summary.runTableFirstNarrowRowsReady, true);
  assert.equal(summary.rowsIncluded, true);
  assert.equal(summary.rowCount, 1);
  assert.equal(summary.safeRowsReturned, true);
  assert.equal(summary.firstNarrowRowsReturned, true);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.rows.length, 1);
  assert.deepEqual(Object.keys(summary.rows[0]), [...RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET]);
  assert.deepEqual(summary.rows[0], {
    rowSchemaId: summary.rowSchemaId,
    rowSchemaVersion: summary.rowSchemaVersion,
    rowKey: "accepted-safe-run-0-row",
    runKey: "accepted-safe-run-0",
    runIndex: 0,
    rowOrdinal: 1,
    rowKind: "first_accepted_safe_run_summary",
    sourceKind: "safe-selected-result-source-object-summary",
    accepted: true,
    engineVerified: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    hasBodyRequested: true,
    boardCount: 2,
    segmentCount: 3,
    zoneCount: 1,
    clipPointsCount: 4,
    suspensionPointsCount: 5,
    gearTrayPlanCount: 1,
    reservedRangesCount: 2,
    rawRunReturned: false,
    rawRunTableRowsReturned: false,
    rawSourceRowsReturned: false,
    rawValuesReturned: false,
  });
  assertFalseFlags(summary);
  assertRawAbsent(summary);
  assert.equal(JSON.stringify(summary).includes("C:\\"), false);
});

test("fails closed when the row-shape contract is not ready", () => {
  const store = createSavedProjectStore();
  const outputSummary = saveSelectedAndRunTableOutput(store, "runtable-rows-slot-row-shape-blocked-project");
  const blockedRowShapeContract = buildRunTableFirstNarrowRowShapeContract({
    runTableFirstNarrowOutputSummary: {
      ...outputSummary,
      rowsIncluded: true,
      rowCount: 1,
    },
  });
  assert.equal(blockedRowShapeContract.state, RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.blockedFailClosed);

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-rows-slot-row-shape-blocked-project"),
    rowsSlotContribution({ rowShapeContract: blockedRowShapeContract }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /RunTable first narrow rows slot write rejected/);
  const existing = store.getProjectEnvelope("runtable-rows-slot-row-shape-blocked-project");
  assert.equal(existing.modules.cs_selector.downstreamContext.runTableFirstNarrowRows, undefined);
});

test("fails closed on raw RunTable row payload before replacing the envelope", () => {
  const store = createSavedProjectStore();
  const outputSummary = saveSelectedAndRunTableOutput(store, "runtable-rows-slot-raw-project");
  const rowShapeContract = readyRowShapeContract(outputSummary);

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-rows-slot-raw-project"),
    rowsSlotContribution({
      rowShapeContract,
      downstream: {
        runTableFirstNarrowRowsCandidate: {
          rawRunTableRows: [{ unsafe: true }],
        },
      },
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /blocked-raw-field-rawRunTableRows/);
  const existing = store.getProjectEnvelope("runtable-rows-slot-raw-project");
  assert.equal(existing.modules.cs_selector.downstreamContext.runTableFirstNarrowRows, undefined);
});

test("rolls back an existing rows slot on a later failed rows-slot write", () => {
  const store = createSavedProjectStore();
  const outputSummary = saveSelectedAndRunTableOutput(store, "runtable-rows-slot-rollback-project");
  const rowShapeContract = readyRowShapeContract(outputSummary);
  const first = store.saveCurrentProjectEnvelope(
    context("runtable-rows-slot-rollback-project"),
    rowsSlotContribution({ rowShapeContract }),
  );
  assert.equal(first.accepted, true, first.reason);
  const before = first.envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowRows;

  const failed = store.saveCurrentProjectEnvelope(
    context("runtable-rows-slot-rollback-project"),
    rowsSlotContribution({
      rowShapeContract,
      source: safeSelectedResultSourceObject({ voltage: 24 }),
    }),
  );

  assert.equal(failed.accepted, false);
  assert.match(failed.reason, /blocked-raw-field-voltage/);
  const afterEnvelope = store.getProjectEnvelope("runtable-rows-slot-rollback-project");
  assert.deepEqual(afterEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowRows, before);
});

test("keeps full RunTable generation, IES, outputs, routes, POST endpoints, RuntimeData mutation, and exact electrical exposure disabled", () => {
  const store = createSavedProjectStore();
  const outputSummary = saveSelectedAndRunTableOutput(store, "runtable-rows-slot-safety-project");
  const rowShapeContract = readyRowShapeContract(outputSummary);

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-rows-slot-safety-project"),
    rowsSlotContribution({ rowShapeContract }),
  );
  const summary = result.envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowRows;

  assert.equal(result.accepted, true, result.reason);
  assertFalseFlags(summary);
  assert.equal(summary.slotPersisted, true);
  assert.equal(summary.rowsIncluded, true);
  assert.equal(summary.rowCount, 1);
  assert.equal(summary.rows[0].rawRunReturned, false);
  assert.equal(summary.rows[0].rawRunTableRowsReturned, false);
  assert.equal(summary.rows[0].rawSourceRowsReturned, false);
  assert.equal(summary.rows[0].rawValuesReturned, false);
  assertRawAbsent(summary);
});
