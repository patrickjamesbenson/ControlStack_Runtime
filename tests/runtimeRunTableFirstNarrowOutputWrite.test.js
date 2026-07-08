import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildSelectedResultPersistedSummarySlotContract,
} from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import {
  buildRunTableFirstNarrowOutputHandoffContract,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowOutputHandoffContract.js";

const POLICY_FINGERPRINT = "safe-policy:runtable-first-narrow-output-write-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtable-first-narrow-output-write-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:runtable-first-narrow-output-write-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:runtable-first-narrow-output-write-fixture";
const SELECTED_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";
const RUNTABLE_TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary";

const RUNTABLE_ALLOWED_FIELDS = new Set([
  "schemaId",
  "schemaVersion",
  "owner",
  "slotOwner",
  "targetKind",
  "moduleId",
  "state",
  "summaryOnly",
  "diagnosticOnly",
  "safeSummaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceKind",
  "futureOutputKind",
  "rowsIncluded",
  "rowCount",
  "generated",
  "generationEnabled",
  "persisted",
  "routeAdded",
  "postEndpointAdded",
  "runTableFirstNarrowOutputHandoffContractState",
  "runTableFirstNarrowOutputHandoffContractReady",
  "acceptedSelectedResultAuthorityState",
  "selectedResultPersistenceAuthorityPreflightState",
  "selectedResultPersistenceBoundaryState",
  "selectedResultOutputReadinessPreflightState",
  "policyFingerprint",
  "sourceFingerprint",
  "sourceInputFingerprint",
  "sourceVersionFingerprint",
  "persistedSelectedResultSummaryFingerprint",
  "selectedResultPersistedSummarySlotContractFingerprint",
  "runTableFirstNarrowOutputHandoffContractFingerprint",
  ...RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
]);

function context(projectId = "runtable-first-narrow-output-write-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "RunTable first narrow output write project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "RunTable first narrow output write project",
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
    contractVersion: "runtable-first-narrow-output-write-test",
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
      acceptedSelectedResultAuthorityGate: "safe-accepted-selected-result-authority-gate:runtable-write-fixture",
      selectedResultOutputReadinessPreflight: "safe-selected-result-output-readiness-preflight:runtable-write-fixture",
      selectedResultPersistenceBoundaryContract: "safe-selected-result-persistence-boundary-contract:runtable-write-fixture",
      selectedResultAuthorityGuard: "safe-selected-result-authority-guard:runtable-write-fixture",
      selectedResultProjection: "safe-selected-result-projection:runtable-write-fixture",
      safeSelectedResultSourceObject: "safe-selected-result-source-object:runtable-write-fixture",
      selectedResultHandoffScaffold: "safe-selected-result-handoff-scaffold:runtable-write-fixture",
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
    selectedResultPersistenceAuthorityPreflightFingerprint: "safe-selected-result-persistence-authority-preflight:runtable-write-fixture",
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
    selectedResultPersistenceBoundaryContractFingerprint: "safe-selected-result-persistence-boundary-contract:runtable-write-fixture",
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

function selectedWriteContribution(contractSummary = slotContract()) {
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        selectedResultSummaryCandidate: {
          state: "redacted_candidate_ready",
        },
        selectedResultPersistedSummarySlotContractSummary: contractSummary,
      },
    },
  };
}

function runTableWriteContribution({ downstream = {}, directWrite = {} } = {}) {
  return {
    cs_selector: {
      status: "ready",
      downstreamContext: {
        selectedResultPersistedSummarySlotContractSummary: slotContract(),
        runTableFirstNarrowOutputSummaryWrite: {
          writeRequested: true,
          ...directWrite,
        },
        ...downstream,
      },
    },
  };
}

function saveSelectedResult(store, projectId) {
  const result = store.saveCurrentProjectEnvelope(context(projectId), selectedWriteContribution());
  assert.equal(result.accepted, true);
  assert.equal(result.selectedResultPersistedSummaryWritten, true);
  return result.envelope.modules.cs_selector.downstreamContext.selectedResultSummary;
}

function readyRunTableContract(persistedSummary, overrides = {}) {
  return buildRunTableFirstNarrowOutputHandoffContract({
    selectedResultPersistedSummaryWritten: true,
    selectedResultPersistenceWriteComplete: true,
    selectedResultPersistedSummarySlotContractReady: true,
    persistedSelectedResultSummary: persistedSummary,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    persistedSelectedResultSummaryFingerprint: persistedSummary.persistedSelectedResultSummaryFingerprint,
    selectedResultPersistedSummarySlotContractFingerprint: persistedSummary.selectedResultPersistedSummarySlotContractFingerprint,
    ...overrides,
  });
}

function assertRunTableBlockedFlags(summary) {
  for (const key of RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
  }
  for (const key of [
    "runTableGenerated",
    "runTableGenerationEnabled",
    "runTableGenerationAttempted",
    "productionRunTableGenerated",
    "productionRunTableGenerationEnabled",
    "runTableRowsReturned",
    "rawRunTableRowsReturned",
    "runTableRowsPersisted",
    "runTableOutputPersisted",
    "runTableOutputHandoffWritten",
    "runTableOutputHandoffWriteEnabled",
    "runTableOutputHandoffAttempted",
    "iesGenerated",
    "iesGenerationEnabled",
    "iesGenerationAttempted",
    "outputGenerated",
    "outputGenerationEnabled",
    "drawingGenerationEnabled",
    "photometryGenerationEnabled",
    "routesAdded",
    "publicRouteAdded",
    "postEndpointsAdded",
    "postEndpointAdded",
    "runtimeDataMutationEnabled",
    "runtimeDataMutated",
    "boardDataMutationEnabled",
    "donorDataMutationEnabled",
  ]) {
    assert.equal(summary[key], false, key);
  }
}

test("writes the redacted RunTable first narrow output summary only to the shell-owned envelope slot", () => {
  const store = createSavedProjectStore();
  saveSelectedResult(store, "runtable-write-slot-project");

  const result = store.saveCurrentProjectEnvelope(context("runtable-write-slot-project"), runTableWriteContribution());

  assert.equal(result.accepted, true, result.reason);
  assert.equal(result.runTableFirstNarrowOutputSummaryWritten, true);
  assert.equal(result.runTableFirstNarrowOutputSummaryTarget, RUNTABLE_TARGET);

  const envelope = result.envelope;
  const downstream = envelope.modules.cs_selector.downstreamContext;
  assert.deepEqual(Object.keys(downstream).sort(), ["runTableFirstNarrowOutputSummary", "selectedResultSummary"]);
  assert.equal(envelope.runTableFirstNarrowOutputSummary, undefined);
  assert.equal(envelope.project.runTableFirstNarrowOutputSummary, undefined);
  assert.equal(envelope.project.metadata.runTableFirstNarrowOutputSummary, undefined);
  assert.equal(envelope.project.currentProject.runTableFirstNarrowOutputSummary, undefined);
  assert.equal(envelope.project.selection.runTableFirstNarrowOutputSummary, undefined);
  assert.equal(envelope.shell.downstream.selector.runTableFirstNarrowOutputSummary, undefined);
  assert.equal(envelope.modules.cs_selector.state.runTableFirstNarrowOutputSummary, undefined);
  assert.equal(downstream.runTableFirstNarrowOutputSummary.schemaId, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID);
});

test("writes only the allow-listed RunTable handoff summary shape", () => {
  const store = createSavedProjectStore();
  saveSelectedResult(store, "runtable-allow-list-project");

  const result = store.saveCurrentProjectEnvelope(context("runtable-allow-list-project"), runTableWriteContribution());
  const summary = result.envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary;

  assert.equal(summary.schemaId, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.rowsIncluded, false);
  assert.equal(summary.rowCount, 0);
  assert.equal(summary.generated, false);
  assert.equal(summary.generationEnabled, false);
  assert.equal(summary.persisted, false);
  assert.equal(summary.runTableFirstNarrowOutputHandoffContractReady, true);
  assert.equal(summary.runTableFirstNarrowOutputHandoffContractState, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady);

  for (const key of Object.keys(summary)) {
    assert.equal(RUNTABLE_ALLOWED_FIELDS.has(key), true, `unexpected RunTable output summary field: ${key}`);
  }

  assertRunTableBlockedFlags(summary);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "runTableRows"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "rawRunTableRows"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "rawEngineResult"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "candela"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "base64"), false);
  assert.equal(JSON.stringify(summary).includes("C:\\"), false);
});

test("fails closed when the F3 RunTable first narrow output handoff contract is not ready", () => {
  const store = createSavedProjectStore();
  const persistedSummary = saveSelectedResult(store, "runtable-f3-blocked-project");
  const blockedContract = readyRunTableContract(persistedSummary, {
    selectedResultPersistedSummarySlotContractReady: false,
  });

  assert.equal(blockedContract.state, RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.blockedFailClosed);

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-f3-blocked-project"),
    runTableWriteContribution({
      downstream: {
        runTableFirstNarrowOutputHandoffContractSummary: blockedContract,
      },
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /RunTable first narrow output summary write rejected/);
  const existing = store.getProjectEnvelope("runtable-f3-blocked-project");
  assert.equal(existing.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary, undefined);
});

test("fails closed on raw RunTable rows before replacing the envelope", () => {
  const store = createSavedProjectStore();
  saveSelectedResult(store, "runtable-raw-rows-project");

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-raw-rows-project"),
    runTableWriteContribution({
      downstream: {
        runTableFirstNarrowOutputSummaryCandidate: {
          runTableRows: [{ board: "raw-board-row" }],
        },
      },
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /blocked-raw-field-runTableRows/);
  const existing = store.getProjectEnvelope("runtable-raw-rows-project");
  assert.equal(existing.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary, undefined);
});

test("fails closed on raw engine or result payload before replacing the envelope", () => {
  const store = createSavedProjectStore();
  saveSelectedResult(store, "runtable-raw-payload-project");

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-raw-payload-project"),
    runTableWriteContribution({
      downstream: {
        runTableFirstNarrowOutputHandoffSummaryCandidate: {
          rawEngineResult: { payload: true },
        },
      },
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /blocked-raw-field-rawEngineResult/);
  const existing = store.getProjectEnvelope("runtable-raw-payload-project");
  assert.equal(existing.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary, undefined);
});

test("fails closed on fingerprint mismatch before inserting the RunTable handoff summary", () => {
  const store = createSavedProjectStore();
  saveSelectedResult(store, "runtable-fingerprint-project");

  const result = store.saveCurrentProjectEnvelope(
    context("runtable-fingerprint-project"),
    runTableWriteContribution({
      directWrite: {
        sourceFingerprint: "safe-source:runtable-first-narrow-output-write-other-fixture",
      },
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /fingerprints-aligned|fingerprint mismatch|unsafe-input-rejected-source-fingerprint-mismatch/);
  const existing = store.getProjectEnvelope("runtable-fingerprint-project");
  assert.equal(existing.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary, undefined);
});

test("rolls back an existing project update on RunTable handoff summary write failure", () => {
  const store = createSavedProjectStore();
  saveSelectedResult(store, "runtable-rollback-project");
  const firstRunTable = store.saveCurrentProjectEnvelope(context("runtable-rollback-project"), runTableWriteContribution());
  assert.equal(firstRunTable.accepted, true);
  const before = firstRunTable.envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary;

  const failed = store.saveCurrentProjectEnvelope(
    context("runtable-rollback-project"),
    runTableWriteContribution({
      downstream: {
        runTableFirstNarrowOutputSummaryCandidate: {
          rawRunTableRows: [{ unsafe: true }],
        },
      },
    }),
  );

  assert.equal(failed.accepted, false);
  const afterEnvelope = store.getProjectEnvelope("runtable-rollback-project");
  assert.deepEqual(afterEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary, before);
  assert.equal(afterEnvelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
});

test("keeps real RunTable generation, IES, outputs, routes, POST endpoints, and mutation blocked", () => {
  const store = createSavedProjectStore();
  saveSelectedResult(store, "runtable-generation-blocked-project");

  const result = store.saveCurrentProjectEnvelope(context("runtable-generation-blocked-project"), runTableWriteContribution());
  const summary = result.envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary;

  assert.equal(result.accepted, true);
  assertRunTableBlockedFlags(summary);
  assert.equal(summary.rowsIncluded, false);
  assert.equal(summary.rowCount, 0);
  assert.equal(summary.generated, false);
  assert.equal(summary.generationEnabled, false);
  assert.equal(summary.persisted, false);
  assert.equal(summary.routeAdded, false);
  assert.equal(summary.postEndpointAdded, false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "rows"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "runTableRows"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "rawRunTableRows"), false);
});
