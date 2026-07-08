import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildSelectedResultPersistedSummarySlotContract,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES,
} from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-persisted-summary-write-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-persisted-summary-write-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-persisted-summary-write-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-persisted-summary-write-fixture";
const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

function context(projectId = "persisted-summary-write-project", projectOverrides = {}) {
  return {
    project: {
      metadata: {
        projectId,
        title: "Persisted summary write project",
        client: "Runtime Client",
        site: "Runtime Site",
        ...(projectOverrides.metadata || {}),
      },
      currentProject: {
        projectId,
        title: "Persisted summary write project",
        client: "Runtime Client",
        site: "Runtime Site",
        ...(projectOverrides.currentProject || {}),
      },
      selection: {
        ...(projectOverrides.selection || {}),
      },
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
    contractVersion: "selected-result-persisted-summary-write-test",
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
      acceptedSelectedResultAuthorityGate: "safe-accepted-selected-result-authority-gate:write-fixture",
      selectedResultOutputReadinessPreflight: "safe-selected-result-output-readiness-preflight:write-fixture",
      selectedResultPersistenceBoundaryContract: "safe-selected-result-persistence-boundary-contract:write-fixture",
      selectedResultAuthorityGuard: "safe-selected-result-authority-guard:write-fixture",
      selectedResultProjection: "safe-selected-result-projection:write-fixture",
      safeSelectedResultSourceObject: "safe-selected-result-source-object:write-fixture",
      selectedResultHandoffScaffold: "safe-selected-result-handoff-scaffold:write-fixture",
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
    selectedResultPersistenceAuthorityPreflightFingerprint: "safe-selected-result-persistence-authority-preflight:write-fixture",
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
      slot: TARGET,
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
    selectedResultPersistenceBoundaryContractFingerprint: "safe-selected-result-persistence-boundary-contract:write-fixture",
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

function writeContribution(contractSummary = slotContract(), downstreamOverrides = {}, contributionOverrides = {}) {
  return {
    cs_selector: {
      status: "ready",
      ...contributionOverrides,
      downstreamContext: {
        selectedResultSummaryCandidate: {
          state: "redacted_candidate_ready",
        },
        selectedResultPersistedSummarySlotContractSummary: contractSummary,
        ...downstreamOverrides,
      },
    },
  };
}

function assertBlockedFlags(summary) {
  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
  }
  for (const key of [
    "runtimeDataMutationEnabled",
    "boardDataMutationEnabled",
    "runTableGenerated",
    "runTableGenerationEnabled",
    "iesGenerated",
    "iesGenerationEnabled",
    "outputGenerationEnabled",
    "routesAdded",
    "postEndpointsAdded",
  ]) {
    assert.equal(summary[key], false, key);
  }
}

test("writes the redacted summary only to the shell-owned selectedResultSummary envelope slot", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("persisted-summary-write-project", {
      metadata: { selectedResultSummary: { shouldNotPersist: true } },
      currentProject: { selectedResultSummary: { shouldNotPersist: true } },
      selection: { selectedResultSummary: { shouldNotPersist: true } },
    }),
    writeContribution(slotContract(), {}, {
      state: { selectedResultSummary: { shouldNotPersist: true } },
    }),
  );

  assert.equal(result.accepted, true);
  assert.equal(result.selectedResultPersistedSummaryWritten, true);
  assert.equal(result.selectedResultPersistedSummaryTarget, TARGET);

  const envelope = result.envelope;
  const selectorModule = envelope.modules.cs_selector;
  const summary = selectorModule.downstreamContext.selectedResultSummary;

  assert.ok(summary);
  assert.deepEqual(Object.keys(selectorModule.downstreamContext), ["selectedResultSummary"]);
  assert.equal(envelope.selectedResultSummary, undefined);
  assert.equal(envelope.project.selectedResultSummary, undefined);
  assert.equal(envelope.project.metadata.selectedResultSummary, undefined);
  assert.equal(envelope.project.currentProject.selectedResultSummary, undefined);
  assert.equal(envelope.project.selection.selectedResultSummary, undefined);
  assert.equal(envelope.shell.downstream.selector.selectedResultSummary, undefined);
  assert.equal(selectorModule.state.selectedResultSummary, undefined);
  assert.equal(selectorModule.downstreamContext.selectedResultSummary.schemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
});

test("writes only the allow-listed persisted-summary shape", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context("allow-list-project"), writeContribution());
  const summary = result.envelope.modules.cs_selector.downstreamContext.selectedResultSummary;
  const allowed = new Set(SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_ELIGIBLE_FIELD_SET);

  assert.equal(summary.schemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.equal(summary.acceptedSelectedResultAuthorityState, "accepted_selected_result_authority");
  assert.equal(summary.selectedResultPersistenceAuthorityPreflightState, "ready_for_persistence_authority");
  assert.equal(summary.selectedResultPersistenceBoundaryState, "selected_result_persistence_boundary_contract_ready");

  for (const key of Object.keys(summary)) {
    assert.equal(allowed.has(key), true, `unexpected persisted summary field: ${key}`);
  }

  assertBlockedFlags(summary);
  assert.equal(JSON.stringify(summary).includes("selectedResultBody"), false);
  assert.equal(JSON.stringify(summary).includes("rawEngineResult"), false);
  assert.equal(JSON.stringify(summary).includes("runTableRows"), false);
  assert.equal(JSON.stringify(summary).includes("candela"), false);
  assert.equal(JSON.stringify(summary).includes("C:\\"), false);
});

test("fails closed when the persisted-summary slot contract is not ready and creates no envelope", () => {
  const store = createSavedProjectStore();
  const blockedContract = slotContract({
    selectedResultPersistenceAuthorityPreflightSummary: authorityPreflight({
      state: "not_ready_for_persistence_authority",
      persistenceAuthorityPreflightState: "not_ready_for_persistence_authority",
      readyForPersistenceAuthority: false,
      failClosed: true,
      missingRequirements: ["accepted-selected-result-authority-ready"],
    }),
  });

  assert.equal(blockedContract.state, SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_STATES.blockedFailClosed);

  const result = store.saveCurrentProjectEnvelope(context("blocked-contract-project"), writeContribution(blockedContract));

  assert.equal(result.accepted, false);
  assert.match(result.reason, /selected-result persisted summary write rejected/);
  assert.equal(store.getProjectEnvelope("blocked-contract-project"), null);
  assert.equal(store.getStoreSnapshot(context()).savedCount, 0);
});

test("fails closed on raw selected-result payload exposure before any envelope write", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("raw-payload-project"),
    writeContribution(slotContract(), {
      selectedResultSummaryCandidate: {
        selectedResultBody: {
          raw: true,
        },
      },
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /blocked-raw-field-selectedResultBody/);
  assert.equal(store.getProjectEnvelope("raw-payload-project"), null);
});

test("fails closed on fingerprint mismatch before any envelope write", () => {
  const store = createSavedProjectStore();
  const mismatchedContract = slotContract({
    selectedResultPersistenceBoundaryContractSummary: boundaryContract({
      fingerprints: {
        policyFingerprint: POLICY_FINGERPRINT,
        sourceFingerprint: "safe-source:other-selected-result-write-fixture",
        sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
        sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
      },
    }),
  });

  const result = store.saveCurrentProjectEnvelope(context("fingerprint-mismatch-project"), writeContribution(mismatchedContract));

  assert.equal(result.accepted, false);
  assert.match(result.reason, /fingerprint mismatch|persistence-authority-and-boundary-fingerprints-aligned|unsafe-input-rejected/);
  assert.equal(store.getProjectEnvelope("fingerprint-mismatch-project"), null);
});

test("rolls back an existing project update on selected-result summary write failure", () => {
  const store = createSavedProjectStore();
  const projectContext = context("rollback-project");
  const first = store.saveCurrentProjectEnvelope(projectContext, writeContribution());
  const before = first.envelope.modules.cs_selector.downstreamContext.selectedResultSummary;

  assert.equal(first.accepted, true);

  const failed = store.saveCurrentProjectEnvelope(
    projectContext,
    writeContribution(slotContract(), {
      selectedResultSummaryCandidate: {
        rawEngineResult: {
          unsafe: true,
        },
      },
    }),
  );

  assert.equal(failed.accepted, false);
  const afterEnvelope = store.getProjectEnvelope("rollback-project");
  assert.deepEqual(afterEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary, before);
  assert.equal(afterEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
});

test("keeps RunTable, IES, outputs, routes, POST endpoints, and mutation blocked", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context("blocked-output-project"), writeContribution());
  const summary = result.envelope.modules.cs_selector.downstreamContext.selectedResultSummary;

  assert.equal(result.accepted, true);
  assertBlockedFlags(summary);
  assert.equal(summary.runTableGenerated, false);
  assert.equal(summary.iesGenerated, false);
  assert.equal(summary.outputGenerationEnabled, false);
  assert.equal(summary.routesAdded, false);
  assert.equal(summary.postEndpointsAdded, false);
  assert.equal(summary.runtimeDataMutationEnabled, false);
  assert.equal(summary.boardDataMutationEnabled, false);
});
