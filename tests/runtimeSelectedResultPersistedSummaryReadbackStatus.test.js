import test from "node:test";
import assert from "node:assert/strict";

import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";
import {
  buildSelectedResultPersistedSummaryReadbackStatus,
  buildRuntimeSelectedResultPersistedSummaryReadbackStatus,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/selectedResultPersistedSummaryReadbackStatus.js";
import {
  buildSelectedResultPersistedSummarySlotContract,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
} from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-readback-status-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-readback-status-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-readback-status-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-readback-status-fixture";
const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

function context(projectId = "persisted-summary-readback-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "Persisted summary readback project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "Persisted summary readback project",
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
    contractVersion: "selected-result-persisted-summary-readback-status-test",
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
      acceptedSelectedResultAuthorityGate: "safe-accepted-selected-result-authority-gate:readback-fixture",
      selectedResultPersistenceAuthorityPreflight: "safe-selected-result-persistence-authority-preflight:readback-fixture",
      selectedResultOutputReadinessPreflight: "safe-selected-result-output-readiness-preflight:readback-fixture",
      selectedResultPersistenceBoundaryContract: "safe-selected-result-persistence-boundary-contract:readback-fixture",
      selectedResultAuthorityGuard: "safe-selected-result-authority-guard:readback-fixture",
      selectedResultProjection: "safe-selected-result-projection:readback-fixture",
      safeSelectedResultSourceObject: "safe-selected-result-source-object:readback-fixture",
      selectedResultHandoffScaffold: "safe-selected-result-handoff-scaffold:readback-fixture",
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
    selectedResultPersistenceAuthorityPreflightFingerprint: "safe-selected-result-persistence-authority-preflight:readback-fixture",
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
    selectedResultPersistenceBoundaryContractFingerprint: "safe-selected-result-persistence-boundary-contract:readback-fixture",
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

function writeContribution(contractSummary = slotContract(), downstreamOverrides = {}) {
  return {
    cs_selector: {
      status: "ready",
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

function savedEnvelope(projectId = "persisted-summary-readback-project") {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context(projectId), writeContribution());
  assert.equal(result.accepted, true, result.reason);
  return { store, result, envelope: result.envelope };
}

function assertReadbackSafety(status) {
  assert.equal(status.schemaId, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID);
  assert.equal(status.schemaVersion, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(status.owner, "shell");
  assert.equal(status.slotOwner, "shell");
  assert.equal(status.envelopeOwner, "shell");
  assert.equal(status.moduleId, "cs_selector");
  assert.equal(status.targetLocation, TARGET);
  for (const key of SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS) {
    assert.equal(status[key], false, key);
  }
  const text = JSON.stringify(status);
  assert.equal(text.includes("selectedResultBody"), false);
  assert.equal(text.includes("rawEngineResult"), false);
  assert.equal(text.includes("runTableRows"), false);
  assert.equal(text.includes("candela"), false);
  assert.equal(text.includes("C:\\"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "downstreamContext"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "envelope"), false);
}

test("builds a missing readback status without surfacing an envelope body", () => {
  const status = buildSelectedResultPersistedSummaryReadbackStatus({});

  assert.equal(status.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(status.readiness, "missing");
  assert.equal(status.ready, false);
  assert.equal(status.summaryPresent, false);
  assert.equal(status.summarySchemaId, null);
  assert.equal(status.summaryState, null);
  assert.equal(status.blocker, "selected-result-persisted-summary-envelope-missing");
  assertReadbackSafety(status);
});

test("save result includes the first safe selected-result persisted summary readback status", () => {
  const { result, envelope } = savedEnvelope("readback-save-result-project");
  const summary = envelope.modules.cs_selector.downstreamContext.selectedResultSummary;
  const status = result.selectedResultPersistedSummaryReadbackStatus;

  assert.equal(result.selectedResultPersistedSummaryWritten, true);
  assert.equal(status.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready);
  assert.equal(status.readiness, "ready");
  assert.equal(status.ready, true);
  assert.equal(status.blocker, null);
  assert.equal(status.summaryPresent, true);
  assert.equal(status.summarySchemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(status.summarySchemaVersion, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(status.summaryState, "redacted_selected_result_summary_persisted");
  assert.equal(status.acceptedSelectedResultAuthorityState, summary.acceptedSelectedResultAuthorityState);
  assert.equal(status.selectedResultPersistenceAuthorityPreflightState, summary.selectedResultPersistenceAuthorityPreflightState);
  assert.equal(status.selectedResultPersistenceBoundaryState, summary.selectedResultPersistenceBoundaryState);
  assert.equal(status.selectedResultOutputReadinessPreflightState, summary.selectedResultOutputReadinessPreflightState);
  assert.equal(status.selectedResultAuthorityGuardState, summary.selectedResultAuthorityGuardState);
  assert.equal(status.selectedResultProjectionState, summary.selectedResultProjectionState);
  assert.equal(status.safeSelectedResultSourceState, summary.safeSelectedResultSourceState);
  assert.equal(status.selectedResultHandoffScaffoldState, summary.selectedResultHandoffScaffoldState);
  assert.equal(status.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(status.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(status.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(status.sourceVersionFingerprint, SOURCE_VERSION_FINGERPRINT);
  assert.ok(status.selectedResultPersistedSummaryReadbackFingerprint.startsWith("safe-selected-result-persisted-summary-readback-status:"));
  assertReadbackSafety(status);
});

test("store readback helper returns the same safe status by project id and envelope id", () => {
  const { store, result } = savedEnvelope("readback-helper-project");
  const byProjectId = store.getSelectedResultPersistedSummaryReadbackStatus(result.projectId);
  const byEnvelopeId = store.getSelectedResultPersistedSummaryReadbackStatus(result.envelopeId);

  assert.equal(byProjectId.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready);
  assert.equal(byEnvelopeId.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready);
  assert.deepEqual(byProjectId, byEnvelopeId);
  assertReadbackSafety(byProjectId);
});

test("runtime alias builds the same readback status", () => {
  const { envelope } = savedEnvelope("readback-alias-project");

  assert.deepEqual(
    buildRuntimeSelectedResultPersistedSummaryReadbackStatus(envelope),
    buildSelectedResultPersistedSummaryReadbackStatus(envelope),
  );
});

test("blocks malformed summary readback fail-closed without exposing raw selected-result body", () => {
  const { envelope } = savedEnvelope("readback-blocked-raw-project");
  envelope.modules.cs_selector.downstreamContext.selectedResultSummary = {
    ...envelope.modules.cs_selector.downstreamContext.selectedResultSummary,
    selectedResultBody: {
      rawEngineResult: "must not surface",
    },
  };

  const status = buildSelectedResultPersistedSummaryReadbackStatus(envelope);

  assert.equal(status.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.ready, false);
  assert.equal(status.summaryPresent, true);
  assert.equal(status.blocker, "summary-field-not-allow-listed-raw-field");
  assert.equal(JSON.stringify(status).includes("must not surface"), false);
  assertReadbackSafety(status);
});

test("blocks true persistence/generation/route/mutation flags before status is marked ready", () => {
  const { envelope } = savedEnvelope("readback-blocked-flag-project");
  envelope.modules.cs_selector.downstreamContext.selectedResultSummary.runTableGenerated = true;

  const status = buildSelectedResultPersistedSummaryReadbackStatus(envelope);

  assert.equal(status.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.ready, false);
  assert.equal(status.blocker, "unsafe-true-flag-runTableGenerated");
  assert.equal(status.runTableGenerated, false);
  assertReadbackSafety(status);
});

test("save failure still returns a safe missing readback status and writes no envelope", () => {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(
    context("readback-save-failure-project"),
    writeContribution(slotContract(), {
      selectedResultSummaryCandidate: {
        rawEngineResult: {
          unsafe: true,
        },
      },
    }),
  );

  assert.equal(result.accepted, false);
  assert.match(result.reason, /blocked-raw-field-rawEngineResult/);
  assert.equal(store.getProjectEnvelope("readback-save-failure-project"), null);
  assert.equal(result.selectedResultPersistedSummaryReadbackStatus.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assertReadbackSafety(result.selectedResultPersistedSummaryReadbackStatus);
});

test("fixture or unknown project readback remains missing and does not widen to shell or UI status", () => {
  const store = createSavedProjectStore();
  const fixture = store.getSelectedResultPersistedSummaryReadbackStatus("saved-alpha");
  const unknown = store.getSelectedResultPersistedSummaryReadbackStatus("not-a-project");

  assert.equal(fixture.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(fixture.summaryPresent, false);
  assert.equal(unknown.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(unknown.summaryPresent, false);
  assertReadbackSafety(fixture);
  assertReadbackSafety(unknown);
});
