import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount,
  createShellProjectBrowserSelectedProjectReadonlyEngineInvokeService,
  mountShellProjectBrowserSelectedProjectReadonlyEngineInvoke,
  prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_CONTRACT_LOCK_ID,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js";
import {
  RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER,
  RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER,
} from "../packages/workspace-kernel/engineRunTableSelectedProjectReadonlyInvokeCapability.js";
import {
  PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER,
} from "../packages/workspace-kernel/projectBrowserSelectedProjectEngineRunActionSourceBoundary.js";
import {
  buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
  PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistenceBoundaryContract.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistedSummarySlotContract.js";
import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runTableFirstNarrowOutputHandoffContract.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const PROJECT_ID = "readonly-engine-mount-lock-project";
const ENVELOPE_ID = "env-readonly-engine-mount-lock-project";
const FIXTURE_SUFFIX = "readonly-engine-mount-lock";
const OUTCOME_FINGERPRINT_PREFIX =
  "safe-runtime-engine-runtable-selected-project-readonly-invoke-outcome";

const EXPECTED_MOUNT_STATES = Object.freeze({
  completed: "shell_project_browser_selected_project_readonly_engine_invoke_mount_completed",
  unavailable: "shell_project_browser_selected_project_readonly_engine_invoke_mount_unavailable",
  missing: "shell_project_browser_selected_project_readonly_engine_invoke_mount_missing",
  blockedFailClosed:
    "shell_project_browser_selected_project_readonly_engine_invoke_mount_blocked_fail_closed",
});

const EXPECTED_MOUNT_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "state",
  "readiness",
  "ok",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "projectId",
  "envelopeId",
  "mounted",
  "serviceMounted",
  "sourceBoundaryResolved",
  "sourceBoundaryReady",
  "runtimeResultReceived",
  "runtimeOutcomeState",
  "runtimeOutcomeReadiness",
  "adapterMounted",
  "adapterInvoked",
  "invocationConsumed",
  "step1Ready",
  "step2ProjectionReady",
  "step3AuthorityResultAvailable",
  "step3AuthorityReady",
  "readOnly",
  "selectedProjectOnly",
  "scalarSafe",
  "redactedOutcomeOnly",
  "engineActionAvailable",
  "engineActionEnabled",
  "userGestureListenerAdded",
  "preparedActionRetained",
  "candidatePayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "projectEnvelopeReturned",
  "runRowsReturned",
  "exactElectricalValuesReturned",
  "fingerprintsReturned",
  "selectedResultPersisted",
  "runTableGenerated",
  "outputGenerated",
  "iesGenerated",
  "runtimeDataMutated",
  "routesAdded",
  "postEndpointsAdded",
  "fetchUsed",
  "directMcpCallUsed",
  "filesystemWriteAttempted",
]);

const REQUIRED_FALSE_MOUNT_FLAGS = Object.freeze([
  "engineActionAvailable",
  "engineActionEnabled",
  "userGestureListenerAdded",
  "preparedActionRetained",
  "candidatePayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "projectEnvelopeReturned",
  "runRowsReturned",
  "exactElectricalValuesReturned",
  "fingerprintsReturned",
  "selectedResultPersisted",
  "runTableGenerated",
  "outputGenerated",
  "iesGenerated",
  "runtimeDataMutated",
  "routesAdded",
  "postEndpointsAdded",
  "fetchUsed",
  "directMcpCallUsed",
  "filesystemWriteAttempted",
]);

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

function readySelectedResultSummary() {
  return {
    schemaId: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_ID,
    schemaVersion: PERSISTED_SELECTED_RESULT_SUMMARY_SCHEMA_VERSION,
    slotSchemaId: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_ID,
    slotSchemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_selected_result_summary_persisted",
    summaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    ...AUTHORITY_STATES,
    selectedResultAuthorityGuardState: "engine_verified_selected_result_ready",
    selectedResultProjectionState: "selected_accepted",
    safeSelectedResultSourceState: "safe_selected_result_source_ready",
    selectedResultHandoffScaffoldState: "runtime_selected_result_handoff_scaffold_ready",
    policyFingerprint: `safe-policy:${FIXTURE_SUFFIX}`,
    sourceFingerprint: `safe-source:${FIXTURE_SUFFIX}`,
    sourceInputFingerprint: `safe-source-input:${FIXTURE_SUFFIX}`,
    sourceVersionFingerprint: `safe-source-version:${FIXTURE_SUFFIX}`,
    acceptedSelectedResultAuthorityGateFingerprint:
      `safe-accepted-selected-result-authority-gate:${FIXTURE_SUFFIX}`,
    selectedResultPersistenceAuthorityPreflightFingerprint:
      `safe-selected-result-persistence-authority-preflight:${FIXTURE_SUFFIX}`,
    selectedResultPersistenceBoundaryContractFingerprint:
      `safe-selected-result-persistence-boundary-contract:${FIXTURE_SUFFIX}`,
    selectedResultOutputReadinessPreflightFingerprint:
      `safe-selected-result-output-readiness-preflight:${FIXTURE_SUFFIX}`,
    selectedResultAuthorityGuardFingerprint:
      `safe-selected-result-authority-guard:${FIXTURE_SUFFIX}`,
    selectedResultProjectionFingerprint:
      `safe-selected-result-projection:${FIXTURE_SUFFIX}`,
    safeSelectedResultSourceObjectFingerprint:
      `safe-selected-result-source-object:${FIXTURE_SUFFIX}`,
    selectedResultHandoffScaffoldFingerprint:
      `safe-selected-result-handoff-scaffold:${FIXTURE_SUFFIX}`,
    ...Object.fromEntries(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function readyRunTableFirstNarrowOutputSummary(selectedResultSummary) {
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
    runTableFirstNarrowOutputHandoffContractState:
      "runtable_first_narrow_output_handoff_contract_ready",
    runTableFirstNarrowOutputHandoffContractReady: true,
    ...AUTHORITY_STATES,
    policyFingerprint: `safe-policy:${FIXTURE_SUFFIX}`,
    sourceFingerprint: `safe-source:${FIXTURE_SUFFIX}`,
    sourceInputFingerprint: `safe-source-input:${FIXTURE_SUFFIX}`,
    sourceVersionFingerprint: `safe-source-version:${FIXTURE_SUFFIX}`,
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResultSummary,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      `safe-selected-result-persisted-summary-slot-contract:${FIXTURE_SUFFIX}`,
    runTableFirstNarrowOutputHandoffContractFingerprint:
      `safe-runtable-first-narrow-output-handoff-contract:${FIXTURE_SUFFIX}`,
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
  };
}

function stage3Inputs() {
  return {
    factoryApprovedInputsSummary: {
      readOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      factoryApprovedInputsReady: true,
      stage3Mode: "simple-run-stage3a-zero-accessory",
      blocker: null,
      committedRunIntakeSummary: {
        ready: true,
        committedRunIntakeReady: true,
        sourceAuthority: "committed selector state only",
        runQuantity: 2,
        runLengthMm: 3500,
        lengthMode: "cut_to_length",
      },
      engineExecuted: false,
      donorEngineInvoked: false,
      runTableGenerated: false,
      iesGenerated: false,
      selectedResultPersisted: false,
      runtimeDataMutated: false,
      rawRowsExposed: false,
      rawEnginePayloadExposed: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    committedSelectorConstraints: [
      {
        fieldKey: "tier",
        value: "Business",
        valueLabel: "Business",
        committedSelectorState: true,
        authoritySource: "acceptedDefaults",
      },
      {
        fieldKey: "directOpticVar1",
        value: "80|Inlay",
        valueLabel: "Inlay",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "targetLmPerM",
        value: "1200",
        valueLabel: "1200",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "cctCri",
        value: "4000K / CRI90",
        valueLabel: "4000K / CRI90",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
      {
        fieldKey: "controlType",
        value: "DALI-2",
        valueLabel: "DALI-2",
        committedSelectorState: true,
        authoritySource: "manualConstraints",
      },
    ],
    lmTemperatureReadinessPreview: {
      previewOnly: true,
      diagnosticOnly: true,
      safeSummaryOnly: true,
      targetIntent: {
        direct: { ready: true, valueLabel: "1200", intentOnly: true },
      },
      cctCriPairing: {
        direct: { ready: true, valueLabel: "4000K / CRI90", boardBacked: true },
      },
      controlIntent: {
        direct: { ready: true, valueLabel: "DALI-2", sourceBacked: true },
      },
      fingerprint: `safe-selector-lm-temp-readiness-preview:${FIXTURE_SUFFIX}`,
      donorEngineInvoked: false,
      rawRowsReturned: false,
      rawEnginePayloadReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
  };
}

function selectedEnvelope() {
  const selectedResultSummary = readySelectedResultSummary();
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    modules: {
      cs_selector: {
        owner: "cs_selector",
        moduleId: "cs_selector",
        state: { engineRunActionSource: stage3Inputs() },
        downstreamContext: {
          selectedResultSummary,
          runTableFirstNarrowOutputSummary:
            readyRunTableFirstNarrowOutputSummary(selectedResultSummary),
        },
      },
    },
  };
}

function readyContext(envelope = selectedEnvelope()) {
  return {
    envelope,
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        selectedProjectEngineRunReadinessReadbackSummary:
          buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
            envelope,
            ENVELOPE_ID,
          ),
      },
    },
  };
}

function assertScalarMountStatus(status) {
  assert.equal(Object.isFrozen(status), true);
  assert.deepEqual(Object.keys(status), EXPECTED_MOUNT_FIELD_ORDER);
  for (const [key, value] of Object.entries(status)) {
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      key,
    );
  }
  assert.equal(status.mounted, true);
  assert.equal(status.readOnly, true);
  assert.equal(status.selectedProjectOnly, true);
  assert.equal(status.scalarSafe, true);
  assert.equal(status.redactedOutcomeOnly, true);
  for (const key of REQUIRED_FALSE_MOUNT_FLAGS) assert.equal(status[key], false, key);

  const serialised = JSON.stringify(status);
  for (const forbidden of [
    "factoryApprovedInputsSummary",
    "committedSelectorConstraints",
    "lmTemperatureReadinessPreview",
    "selectorPayload",
    "candidateFingerprint",
    "sourceBoundaryFingerprint",
    "readonlyEngineStep1SafeSummary",
    "readonlyEngineStep2SelectedResultProjection",
    "readonlyEngineStep3AuthorityResult",
    "C:\\ControlStack_RuntimeData",
    ".ies",
    "base64",
  ]) {
    assert.equal(serialised.includes(forbidden), false, forbidden);
  }
}

function refingerprintOutcome(outcome, overrides = {}, { extra = null, reverse = false } = {}) {
  const values = { ...outcome, ...overrides };
  const fingerprintSource = Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER
      .filter((key) => key !== "outcomeFingerprint")
      .map((key) => [key, values[key]]),
  );
  values.outcomeFingerprint = stableFingerprint(
    OUTCOME_FINGERPRINT_PREFIX,
    fingerprintSource,
  );
  let entries = RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTCOME_FIELD_ORDER
    .map((key) => [key, values[key]]);
  if (reverse) entries = entries.reverse();
  if (extra) entries.push(extra);
  return Object.freeze(Object.fromEntries(entries));
}

function replaceOutcome(runtimeResult, outcome) {
  return Object.freeze(Object.fromEntries(
    RUNTIME_ENGINE_RUNTABLE_SELECTED_PROJECT_READONLY_INVOKE_OUTPUT_FIELD_ORDER
      .map((key) => [key, key === "outcomeDescriptor" ? outcome : runtimeResult[key]]),
  ));
}

function serviceHarness(envelope, transform = (result) => result) {
  const capability = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeService();
  let envelopeReads = 0;
  let invokeCalls = 0;
  let receivedArgs = null;
  return {
    services: {
      savedProjects: {
        getProjectEnvelope(selectedProjectId) {
          envelopeReads += 1;
          assert.equal(selectedProjectId, ENVELOPE_ID);
          return envelope;
        },
      },
      async invokeSelectedProjectReadonlyEngine(...args) {
        invokeCalls += 1;
        receivedArgs = args;
        const result = await capability(args[0]);
        return transform(result, args[0]);
      },
    },
    get envelopeReads() {
      return envelopeReads;
    },
    get invokeCalls() {
      return invokeCalls;
    },
    get receivedArgs() {
      return receivedArgs;
    },
  };
}

test("mount contract lock fixes identifiers, schema, states, field order, and the prepare compatibility boundary", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_CONTRACT_LOCK_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-READONLY-ENGINE-INVOKE-MOUNT-CONTRACT-LOCK-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-READONLY-ENGINE-INVOKE-MOUNT-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-readonly-engine-invoke-mount.v1",
  );
  assert.equal(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_SCHEMA_VERSION, 1);
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_STATES,
    EXPECTED_MOUNT_STATES,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_READONLY_ENGINE_INVOKE_MOUNT_FIELD_ORDER,
    EXPECTED_MOUNT_FIELD_ORDER,
  );
  assert.equal(
    mountShellProjectBrowserSelectedProjectReadonlyEngineInvoke,
    prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount,
  );
});

test("prepare resolves one exact selected-project source boundary, passes only that boundary, and projects honest host-local unavailability", async () => {
  const { envelope, context } = readyContext();
  const harness = serviceHarness(envelope);

  const status = await prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount({
    context,
    services: harness.services,
  });

  assertScalarMountStatus(status);
  assert.equal(status.state, EXPECTED_MOUNT_STATES.unavailable);
  assert.equal(status.readiness, "unavailable");
  assert.equal(status.ok, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.selectedProjectId, ENVELOPE_ID);
  assert.equal(status.projectId, PROJECT_ID);
  assert.equal(status.envelopeId, ENVELOPE_ID);
  assert.equal(status.serviceMounted, true);
  assert.equal(status.sourceBoundaryResolved, true);
  assert.equal(status.sourceBoundaryReady, true);
  assert.equal(status.runtimeResultReceived, true);
  assert.equal(status.adapterMounted, false);
  assert.equal(status.adapterInvoked, false);
  assert.equal(status.invocationConsumed, false);
  assert.equal(status.step1Ready, false);
  assert.equal(status.step2ProjectionReady, false);
  assert.equal(harness.envelopeReads, 1);
  assert.equal(harness.invokeCalls, 1);
  assert.equal(harness.receivedArgs.length, 1);

  const [sourceBoundary] = harness.receivedArgs;
  assert.equal(Object.isFrozen(sourceBoundary), true);
  assert.deepEqual(
    Object.keys(sourceBoundary),
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER,
  );
  assert.equal(
    sourceBoundary.contractId,
    PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
  );
  assert.equal(sourceBoundary.ready, true);
  assert.equal(sourceBoundary.selectedProjectId, ENVELOPE_ID);
  assert.equal(sourceBoundary.candidateRetainedInternally, true);
  assert.equal(sourceBoundary.candidatePayloadReturned, false);
  assert.equal(sourceBoundary.projectEnvelopeReturned, false);
  assert.equal(Object.hasOwn(sourceBoundary, "candidate"), false);
});

test("prepare does not invoke the service when the selected-project source boundary is missing", async () => {
  let invokeCalls = 0;
  const status = await prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount({
    context: { projectBrowser: {} },
    services: {
      invokeSelectedProjectReadonlyEngine() {
        invokeCalls += 1;
        return null;
      },
    },
  });

  assertScalarMountStatus(status);
  assert.equal(status.state, EXPECTED_MOUNT_STATES.missing);
  assert.equal(status.readiness, "missing");
  assert.equal(status.sourceBoundaryResolved, true);
  assert.equal(status.sourceBoundaryReady, false);
  assert.equal(status.runtimeResultReceived, false);
  assert.equal(invokeCalls, 0);
});

test("contract lock rejects runtime outcome shape, schema, source linkage, adapter, and readiness drift", async () => {
  const cases = [
    {
      blocker: "selected-project-readonly-engine-mount-runtime-outcome-invalid",
      transform(result) {
        return replaceOutcome(
          result,
          refingerprintOutcome(result.outcomeDescriptor, {}, {
            extra: ["rawEnginePayload", "engine-payload-secret"],
          }),
        );
      },
    },
    {
      blocker: "selected-project-readonly-engine-mount-runtime-outcome-invalid",
      transform(result) {
        return replaceOutcome(
          result,
          refingerprintOutcome(result.outcomeDescriptor, {}, { reverse: true }),
        );
      },
    },
    {
      blocker: "selected-project-readonly-engine-mount-runtime-outcome-schema-mismatch",
      transform(result) {
        return replaceOutcome(
          result,
          refingerprintOutcome(result.outcomeDescriptor, { schemaVersion: 2 }),
        );
      },
    },
    {
      blocker: "selected-project-readonly-engine-mount-runtime-source-boundary-mismatch",
      transform(result) {
        return replaceOutcome(
          result,
          refingerprintOutcome(result.outcomeDescriptor, {
            sourceBoundaryFingerprint:
              "safe-project-browser-selected-project-engine-run-action-source-boundary:0000000000000000000000000000000000000000",
          }),
        );
      },
    },
    {
      blocker: "selected-project-readonly-engine-mount-runtime-adapter-contract-invalid",
      transform(result) {
        return replaceOutcome(
          result,
          refingerprintOutcome(result.outcomeDescriptor, {
            adapterContractId:
              RUNTIME_ENGINE_RUNTABLE_HOST_LOCAL_READONLY_SEAM_ADAPTER_CONTRACT_ID,
          }),
        );
      },
    },
    {
      blocker: "selected-project-readonly-engine-mount-runtime-readiness-invalid",
      transform(result) {
        return replaceOutcome(
          result,
          refingerprintOutcome(result.outcomeDescriptor, { readiness: "completed" }),
        );
      },
    },
  ];

  for (const contractCase of cases) {
    const { envelope, context } = readyContext();
    const harness = serviceHarness(envelope, contractCase.transform);
    const status = await prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount({
      context,
      services: harness.services,
    });

    assertScalarMountStatus(status);
    assert.equal(status.state, EXPECTED_MOUNT_STATES.blockedFailClosed);
    assert.equal(status.readiness, "blocked_fail_closed");
    assert.equal(status.ok, false);
    assert.equal(status.failClosed, true);
    assert.equal(status.blocker, contractCase.blocker);
    assert.equal(status.sourceBoundaryReady, true);
    assert.equal(status.runtimeResultReceived, false);
    assert.equal(status.adapterMounted, false);
    assert.equal(status.adapterInvoked, false);
    assert.equal(harness.invokeCalls, 1);
  }
});

test("controller retains one non-interactive snapshot per selection and service identity", async () => {
  const { envelope, context } = readyContext();
  const controller = createShellProjectBrowserSelectedProjectReadonlyEngineInvokeMount();
  const harness = serviceHarness(envelope);

  const first = await controller.mount({ context, services: harness.services });
  const second = await controller.mount({ context, services: harness.services });

  assert.equal(first, second);
  assert.equal(controller.getSnapshot(), first);
  assert.equal(harness.envelopeReads, 1);
  assert.equal(harness.invokeCalls, 1);
  assertScalarMountStatus(first);
  assert.equal(first.engineActionAvailable, false);
  assert.equal(first.engineActionEnabled, false);
  assert.equal(first.userGestureListenerAdded, false);
  assert.equal(first.preparedActionRetained, false);
});

test("source keeps the historical host-local mount locked while shell uses the inert client mount and delegated activation", async () => {
  const [mountSource, shellSource, actionLaneSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineReadonlyInvokeMount.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  assert.match(
    mountSource,
    /export async function prepareShellProjectBrowserSelectedProjectEngineReadonlyInvokeMount\(\{/,
  );
  assert.match(
    mountSource,
    /await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary\(\{\s*context,\s*services,\s*\}\)/,
  );
  assert.match(
    mountSource,
    /runtimeResult = await services\.invokeSelectedProjectReadonlyEngine\(sourceBoundary\)/,
  );
  assert.doesNotMatch(
    mountSource,
    /services\.invokeSelectedProjectReadonlyEngine\(sourceBoundary\s*,/,
  );
  assert.doesNotMatch(
    mountSource,
    /preparedAction\s*[:=(]|executionCallback|clickHandler|actionGetter|userGestureCallback/,
  );

  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineActionLane(",
  );
  const rendererEnd = shellSource.indexOf(
    "function setProjectBrowserSelectedProjectExportsWorkflowDescriptor(workflowDescriptor)",
    rendererStart,
  );
  const actionRenderer = shellSource.slice(rendererStart, rendererEnd);
  assert.ok(rendererStart >= 0);
  assert.ok(rendererEnd > rendererStart);
  assert.match(actionRenderer, /button\.disabled = actionItem\?\.enabled !== true/);
  assert.match(shellSource,
    /createShellProjectBrowserSelectedProjectReadonlyEngineInvokeClientMount\(\{/);
  assert.doesNotMatch(shellSource,
    /selectedProjectReadonlyEngineInvokeMount\.mount\(\{/);
  assert.doesNotMatch(
    actionRenderer,
    /addEventListener|onclick|onClick|href|callback|preparedAction|\bfetch\s*\(|services?\.|mcp/i,
  );
  assert.equal(actionLaneSource.includes("packages/workspace-kernel"), false);

  const combined = `${mountSource}\n${shellSource}\n${actionLaneSource}`;
  assert.doesNotMatch(
    combined,
    /\/api\/workspace-shell\/selected-project-engine-readonly-invoke|engine_runtable_internal_readonly_invoke_probe|controlstack_mcp|XMLHttpRequest|WebSocket|webhook|localStorage|sessionStorage|indexedDB|writeFile|appendFile|createWriteStream/,
  );
  assert.doesNotMatch(
    combined,
    /saveProjectEnvelope|RunTable generation enabled|selectedResultPersisted\s*:\s*true|runtimeDataMutated\s*:\s*true|outputGenerated\s*:\s*true|iesGenerated\s*:\s*true/,
  );
});
