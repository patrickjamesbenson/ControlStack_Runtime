import test from "node:test";
import assert from "node:assert/strict";

import {
  createSavedProjectStore,
  buildSelectedResultPersistedSummaryReadbackProjectSummary,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/savedProjectStore.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/selectedResultPersistedSummaryReadbackStatus.js";
import { buildSelectedResultPersistedSummarySlotContract } from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
  SELECTED_RESULT_PERSISTENCE_BLOCKED_RAW_FIELD_CLASSES,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-readback-project-summary-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-readback-project-summary-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:selected-result-readback-project-summary-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:selected-result-readback-project-summary-fixture";
const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

const PROJECT_STATUS_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "sourceSchemaId",
  "sourceSchemaVersion",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "summaryPresent",
  "summarySchemaId",
  "summarySchemaVersion",
  "summaryState",
  "owner",
  "slotOwner",
  "envelopeOwner",
  "moduleId",
  "targetLocation",
  "selectedResultPersistedSummaryReadbackFingerprint",
]);

function context(projectId = "persisted-summary-readback-project-summary-project") {
  return {
    project: {
      metadata: {
        projectId,
        title: "Persisted summary readback project summary project",
        client: "Runtime Client",
        site: "Runtime Site",
      },
      currentProject: {
        projectId,
        title: "Persisted summary readback project summary project",
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
    contractVersion: "selected-result-persisted-summary-readback-project-summary-test",
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
      acceptedSelectedResultAuthorityGate: "safe-accepted-selected-result-authority-gate:readback-project-summary-fixture",
      selectedResultPersistenceAuthorityPreflight: "safe-selected-result-persistence-authority-preflight:readback-project-summary-fixture",
      selectedResultOutputReadinessPreflight: "safe-selected-result-output-readiness-preflight:readback-project-summary-fixture",
      selectedResultPersistenceBoundaryContract: "safe-selected-result-persistence-boundary-contract:readback-project-summary-fixture",
      selectedResultAuthorityGuard: "safe-selected-result-authority-guard:readback-project-summary-fixture",
      selectedResultProjection: "safe-selected-result-projection:readback-project-summary-fixture",
      safeSelectedResultSourceObject: "safe-selected-result-source-object:readback-project-summary-fixture",
      selectedResultHandoffScaffold: "safe-selected-result-handoff-scaffold:readback-project-summary-fixture",
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
    selectedResultPersistenceAuthorityPreflightFingerprint: "safe-selected-result-persistence-authority-preflight:readback-project-summary-fixture",
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
    selectedResultPersistenceBoundaryContractFingerprint: "safe-selected-result-persistence-boundary-contract:readback-project-summary-fixture",
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

function savedStore(projectId = "persisted-summary-readback-project-summary-project") {
  const store = createSavedProjectStore();
  const result = store.saveCurrentProjectEnvelope(context(projectId), writeContribution());
  assert.equal(result.accepted, true, result.reason);
  return { store, result, envelope: result.envelope };
}

function projectSummaryFor(store, projectId) {
  const summary = store.listProjectSummaries().find((item) => item.projectId === projectId);
  assert.ok(summary, `project summary missing for ${projectId}`);
  return summary;
}

function assertCompactProjectStatus(status) {
  assert.deepEqual(Object.keys(status).sort(), [...PROJECT_STATUS_KEYS].sort());
  assert.equal(status.schemaId, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_ID);
  assert.equal(status.schemaVersion, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_VERSION);
  assert.equal(status.sourceSchemaId, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID);
  assert.equal(status.sourceSchemaVersion, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "reason"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "policyFingerprint"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "sourceFingerprint"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "sourceInputFingerprint"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "sourceVersionFingerprint"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "acceptedSelectedResultAuthorityGateFingerprint"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "downstreamContext"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "modules"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "projectEnvelope"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(status, "rows"), false);
}

function assertNoUnsafeProjectStatusValues(status) {
  const text = JSON.stringify(status);
  for (const unsafeToken of [
    "selectedResultBody",
    "rawEngineResult",
    "rawSelectorPayload",
    "selectedResultPayload",
    "moduleState",
    "runTableRows",
    "rawRows",
    "iesText",
    "rawIesContent",
    "photometry",
    "candela",
    "base64",
    "secret-token",
    "credential-value",
    "C:\\\\ControlStack_Runtime",
    "C:\\ControlStack_Runtime",
    "runtime-output.ies",
  ]) {
    assert.equal(text.includes(unsafeToken), false, unsafeToken);
  }
}

test("project summaries include compact persisted selected-result readback status for runtime-saved envelopes", () => {
  const projectId = "readback-project-summary-saved-project";
  const { store, envelope } = savedStore(projectId);
  const projectSummary = projectSummaryFor(store, projectId);
  const status = projectSummary.selectedResultPersistedSummaryReadbackStatus;
  const persistedSummary = envelope.modules.cs_selector.downstreamContext.selectedResultSummary;

  assertCompactProjectStatus(status);
  assert.equal(status.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready);
  assert.equal(status.readiness, "ready");
  assert.equal(status.ready, true);
  assert.equal(status.failClosed, false);
  assert.equal(status.blocker, null);
  assert.equal(status.summaryPresent, true);
  assert.equal(status.summarySchemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(status.summarySchemaVersion, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(status.summaryState, "redacted_selected_result_summary_persisted");
  assert.equal(status.owner, "shell");
  assert.equal(status.slotOwner, "shell");
  assert.equal(status.envelopeOwner, "shell");
  assert.equal(status.moduleId, "cs_selector");
  assert.equal(status.targetLocation, TARGET);
  assert.notEqual(status.selectedResultPersistedSummaryReadbackFingerprint, persistedSummary.policyFingerprint);
  assert.ok(status.selectedResultPersistedSummaryReadbackFingerprint.startsWith("safe-selected-result-persisted-summary-readback-status:"));
  assertNoUnsafeProjectStatusValues(status);
});

test("store snapshot projects inherit the same compact readback status without project-browser or shell UI changes", () => {
  const projectId = "readback-project-summary-store-snapshot-project";
  const { store } = savedStore(projectId);
  const listedStatus = projectSummaryFor(store, projectId).selectedResultPersistedSummaryReadbackStatus;
  const snapshotProject = store.getStoreSnapshot({}).projects.find((item) => item.projectId === projectId);

  assert.ok(snapshotProject);
  assert.deepEqual(snapshotProject.selectedResultPersistedSummaryReadbackStatus, listedStatus);
  assertCompactProjectStatus(snapshotProject.selectedResultPersistedSummaryReadbackStatus);
  assert.equal(Object.prototype.hasOwnProperty.call(snapshotProject.selectedResultPersistedSummaryReadbackStatus, "projectBrowserStatus"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(snapshotProject.selectedResultPersistedSummaryReadbackStatus, "shellUiStatus"), false);
});

test("fixture project summaries remain missing and fail closed", () => {
  const store = createSavedProjectStore();
  const fixture = projectSummaryFor(store, "saved-alpha");
  const status = fixture.selectedResultPersistedSummaryReadbackStatus;

  assertCompactProjectStatus(status);
  assert.equal(status.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(status.readiness, "missing");
  assert.equal(status.ready, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.summaryPresent, false);
  assert.equal(status.summarySchemaId, null);
  assert.equal(status.summarySchemaVersion, null);
  assert.equal(status.summaryState, null);
  assert.equal(status.blocker, "selected-result-persisted-summary-slot-empty");
  assertNoUnsafeProjectStatusValues(status);
});

test("project summary consumer does not expose raw payload/envelope/downstream/rows/IES/photometry/filenames/paths/credentials", () => {
  const status = buildSelectedResultPersistedSummaryReadbackProjectSummary({
    schemaId: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
    state: "selected_result_persisted_summary_readback_blocked_fail_closed",
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "blocked-raw-field-selectedResultBody",
    reason: "C:\\ControlStack_Runtime\\secret runtime-output.ies credential-value",
    summaryPresent: true,
    summarySchemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    summarySchemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    summaryState: "redacted_selected_result_summary_persisted",
    owner: "shell",
    slotOwner: "shell",
    envelopeOwner: "shell",
    moduleId: "cs_selector",
    targetLocation: TARGET,
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:no-raw-values",
    rawEngineResult: "must-not-surface",
    selectedResultPayload: { unsafe: true },
    downstreamContext: { unsafe: true },
    runTableRows: [{ unsafe: true }],
    iesText: "must-not-surface",
    photometry: "must-not-surface",
    candela: [1, 2, 3],
    filename: "runtime-output.ies",
    credentials: "credential-value",
  });

  assertCompactProjectStatus(status);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.blocker, "blocked-raw-field-selectedResultBody");
  assertNoUnsafeProjectStatusValues(status);
});

test("malformed persisted summary is represented as blocked_fail_closed without exposing unsafe values", () => {
  const { envelope } = savedStore("readback-project-summary-malformed-project");
  envelope.modules.cs_selector.downstreamContext.selectedResultSummary = {
    ...envelope.modules.cs_selector.downstreamContext.selectedResultSummary,
    selectedResultBody: {
      rawEngineResult: "secret-token",
      privatePath: "C:\\ControlStack_Runtime\\runtime-output.ies",
    },
  };

  const status = buildSelectedResultPersistedSummaryReadbackProjectSummary(envelope);

  assertCompactProjectStatus(status);
  assert.equal(status.state, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.ready, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.summaryPresent, true);
  assert.equal(status.summarySchemaId, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID);
  assert.equal(status.summarySchemaVersion, PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION);
  assert.equal(status.summaryState, "redacted_selected_result_summary_persisted");
  assert.equal(status.blocker, "summary-field-not-allow-listed-raw-field");
  assertNoUnsafeProjectStatusValues(status);
});
