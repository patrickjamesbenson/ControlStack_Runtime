import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  getProjectBrowserSelectedProjectEngineRunActionInternalCandidate,
  PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS,
  resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary,
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

const PROJECT_ID = "engine-run-action-source-project";
const ENVELOPE_ID = "env-engine-run-action-source-project";
const POLICY_FINGERPRINT = "safe-policy:engine-run-action-source";
const SOURCE_FINGERPRINT = "safe-source:engine-run-action-source";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:engine-run-action-source";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:engine-run-action-source";

const AUTHORITY_STATES = Object.freeze({
  acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
  selectedResultPersistenceAuthorityPreflightState: "ready_for_persistence_authority",
  selectedResultPersistenceBoundaryState: "selected_result_persistence_boundary_contract_ready",
  selectedResultOutputReadinessPreflightState:
    "selected_result_output_readiness_ready_for_persistence",
});

function readySelectedResultSummary(overrides = {}) {
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
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    acceptedSelectedResultAuthorityGateFingerprint:
      "safe-accepted-selected-result-authority-gate:engine-run-action-source",
    selectedResultPersistenceAuthorityPreflightFingerprint:
      "safe-selected-result-persistence-authority-preflight:engine-run-action-source",
    selectedResultPersistenceBoundaryContractFingerprint:
      "safe-selected-result-persistence-boundary-contract:engine-run-action-source",
    selectedResultOutputReadinessPreflightFingerprint:
      "safe-selected-result-output-readiness-preflight:engine-run-action-source",
    selectedResultAuthorityGuardFingerprint:
      "safe-selected-result-authority-guard:engine-run-action-source",
    selectedResultProjectionFingerprint:
      "safe-selected-result-projection:engine-run-action-source",
    safeSelectedResultSourceObjectFingerprint:
      "safe-selected-result-source-object:engine-run-action-source",
    selectedResultHandoffScaffoldFingerprint:
      "safe-selected-result-handoff-scaffold:engine-run-action-source",
    ...Object.fromEntries(
      SELECTED_RESULT_PERSISTED_SUMMARY_SLOT_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
    ...overrides,
  };
}

function readyRunTableFirstNarrowOutputSummary(selectedResultSummary, overrides = {}) {
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
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    persistedSelectedResultSummaryFingerprint: stableFingerprint(
      "safe-persisted-selected-result-summary",
      selectedResultSummary,
    ),
    selectedResultPersistedSummarySlotContractFingerprint:
      "safe-selected-result-persisted-summary-slot-contract:engine-run-action-source",
    runTableFirstNarrowOutputHandoffContractFingerprint:
      "safe-runtable-first-narrow-output-handoff-contract:engine-run-action-source",
    ...Object.fromEntries(
      RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_REQUIRED_FALSE_FLAGS.map((key) => [key, false]),
    ),
    ...overrides,
  };
}

function stage3Inputs(overrides = {}) {
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
      fingerprint: "safe-selector-lm-temp-readiness-preview:engine-run-action-source",
      donorEngineInvoked: false,
      rawRowsReturned: false,
      rawEnginePayloadReturned: false,
      selectedResultPersisted: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    ...overrides,
  };
}

function selectedEnvelope({
  actionSource = stage3Inputs(),
  actionSourceLocation = "state.engineRunActionSource",
  overrides = {},
} = {}) {
  const selectedResultSummary = readySelectedResultSummary();
  const runTableFirstNarrowOutputSummary = readyRunTableFirstNarrowOutputSummary(
    selectedResultSummary,
  );
  const state = {};
  const downstreamContext = {
    selectedResultSummary,
    runTableFirstNarrowOutputSummary,
  };

  if (actionSourceLocation === "state.engineRunActionSource") {
    state.engineRunActionSource = actionSource;
  } else if (actionSourceLocation === "downstreamContext.engineRunActionSource") {
    downstreamContext.engineRunActionSource = actionSource;
  } else if (actionSourceLocation === "state") {
    Object.assign(state, actionSource || {});
  } else if (actionSourceLocation === "downstreamContext") {
    Object.assign(downstreamContext, actionSource || {});
  }

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
        state,
        downstreamContext,
      },
    },
    ...overrides,
  };
}

function readyContext(envelope = selectedEnvelope(), selectedProjectId = ENVELOPE_ID) {
  return {
    projectBrowser: {
      selectedProjectId,
      selectedProjectEngineRunReadinessReadbackSummary:
        buildProjectBrowserSelectedProjectEngineRunReadinessReadbackSummary(
          envelope,
          selectedProjectId,
        ),
    },
  };
}

function assertScalarSafeBoundary(boundary) {
  assert.equal(Object.isFrozen(boundary), true);
  assert.deepEqual(
    Object.keys(boundary),
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER,
  );
  assert.equal(
    boundary.schemaId,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID,
  );
  assert.equal(
    boundary.schemaVersion,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION,
  );
  assert.equal(
    boundary.contractId,
    PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
  );
  for (const [key, value] of Object.entries(boundary)) {
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      `${key} must remain scalar-safe`,
    );
  }
  for (const key of [
    "candidate",
    "selectorPayload",
    "enginePayload",
    "selectedResultSummary",
    "runTableFirstNarrowOutputSummary",
    "projectEnvelope",
    "factoryApprovedInputsSummary",
    "committedSelectorConstraints",
    "lmTemperatureReadinessPreview",
    "runs",
    "lighting",
    "rows",
    "rawRows",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(boundary, key), false, key);
  }
}

test("contract exports a fixed selected-project-only scalar descriptor", () => {
  assert.equal(
    PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
    "PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-RUN-ACTION-SOURCE-BOUNDARY-1",
  );
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID,
    "controlstack.runtime.project-browser.selected-project-engine-run-action-source-boundary.v1",
  );
  assert.equal(PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION, 1);
  assert.deepEqual(PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS, [
    "projectEnvelope.modules.cs_selector.state.engineRunActionSource",
    "projectEnvelope.modules.cs_selector.downstreamContext.engineRunActionSource",
    "projectEnvelope.modules.cs_selector.state",
    "projectEnvelope.modules.cs_selector.downstreamContext",
  ]);
});

test("resolver reads the exact selected runtime envelope once, maps persisted Stage-3 inputs, and retains only the candidate privately", async () => {
  const envelope = selectedEnvelope();
  const calls = [];
  const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: readyContext(envelope),
    services: {
      savedProjects: {
        getProjectEnvelope(projectIdOrEnvelopeId) {
          calls.push(projectIdOrEnvelopeId);
          return structuredClone(envelope);
        },
        saveCurrentProjectEnvelope() {
          throw new Error("source boundary must never persist");
        },
        restoreProjectEnvelope() {
          throw new Error("source boundary must never restore or switch projects");
        },
      },
      engine() {
        throw new Error("source boundary must never invoke Engine");
      },
    },
  });

  assertScalarSafeBoundary(boundary);
  assert.equal(
    boundary.state,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready,
  );
  assert.equal(boundary.readiness, "ready");
  assert.equal(boundary.ready, true);
  assert.equal(boundary.failClosed, false);
  assert.equal(boundary.blocker, null);
  assert.equal(boundary.selectedProjectId, ENVELOPE_ID);
  assert.equal(boundary.projectId, PROJECT_ID);
  assert.equal(boundary.envelopeId, ENVELOPE_ID);
  assert.equal(
    boundary.stage3InputSourceLocation,
    "projectEnvelope.modules.cs_selector.state.engineRunActionSource",
  );
  assert.equal(boundary.factoryApprovedInputsSummaryPresent, true);
  assert.equal(boundary.committedSelectorConstraintsPresent, true);
  assert.equal(boundary.lmTemperatureReadinessPreviewPresent, true);
  assert.equal(boundary.candidateMapperReady, true);
  assert.equal(boundary.candidateRunCount, 1);
  assert.equal(boundary.candidateTotalQuantity, 2);
  assert.ok(boundary.candidateLightingFieldCount >= 5);
  assert.match(boundary.candidateFingerprint, /^safe-selector-readonly-engine-candidate:[0-9a-f]{40}$/);
  assert.equal(boundary.selectedEnvelopeReadCount, 1);
  assert.equal(boundary.candidateRetainedInternally, true);
  assert.equal(boundary.candidatePayloadReturned, false);
  assert.equal(boundary.projectEnvelopeReturned, false);
  assert.equal(boundary.currentProjectFallbackUsed, false);
  assert.equal(boundary.otherEnvelopeFallbackUsed, false);
  assert.equal(boundary.fixtureFallbackUsed, false);
  assert.equal(boundary.selectedResultPayloadUsed, false);
  assert.equal(boundary.engineInvocationEnabled, false);
  assert.equal(boundary.engineExecutionAttempted, false);
  assert.equal(boundary.persistenceMutated, false);
  assert.equal(boundary.runtimeDataMutated, false);
  assert.deepEqual(calls, [ENVELOPE_ID]);

  const candidate = getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary);
  assert.ok(candidate);
  assert.equal(candidate.tier, "Business");
  assert.equal(candidate.runs[0].qty, 2);
  assert.equal(candidate.runs[0].run_length_mm, 3500);
  assert.equal(candidate.lighting.target_lm_per_m, "1200");
  assert.equal(candidate.lighting.cct, "4000");
  assert.equal(candidate.lighting.cri, "90");
  assert.equal(candidate.lighting.optic_key, "Inlay");
  assert.equal(candidate.control_type, "DALI-2");
  assert.equal(JSON.stringify(boundary).includes("selector-readonly-engine-run-1"), false);
});

test("resolver rejects missing, malformed, and cross-project readiness before any envelope read", async () => {
  const envelope = selectedEnvelope();
  const ready = readyContext(envelope);
  let calls = 0;
  const services = {
    savedProjects: {
      getProjectEnvelope() {
        calls += 1;
        return envelope;
      },
    },
  };

  const missing = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: { projectBrowser: { selectedProjectId: ENVELOPE_ID } },
    services,
  });
  const mismatched = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: {
      projectBrowser: {
        ...ready.projectBrowser,
        selectedProjectId: "env-other-project",
      },
    },
    services,
  });
  const unfrozen = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        selectedProjectEngineRunReadinessReadbackSummary: {
          ...ready.projectBrowser.selectedProjectEngineRunReadinessReadbackSummary,
        },
      },
    },
    services,
  });

  for (const boundary of [missing, mismatched, unfrozen]) {
    assertScalarSafeBoundary(boundary);
    assert.equal(boundary.ready, false);
    assert.equal(boundary.failClosed, true);
    assert.equal(boundary.selectedEnvelopeReadCount, 0);
    assert.equal(
      getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary),
      null,
    );
  }
  assert.equal(missing.readiness, "missing");
  assert.equal(
    missing.blocker,
    "selected-project-engine-run-action-readiness-summary-missing",
  );
  assert.equal(
    mismatched.blocker,
    "selected-project-engine-run-action-selected-project-identity-mismatch",
  );
  assert.equal(
    unfrozen.blocker,
    "selected-project-engine-run-action-readiness-summary-shape-invalid",
  );
  assert.equal(calls, 0);
});

test("resolver never falls back to another envelope, the open project, or fixtures", async () => {
  const envelope = selectedEnvelope();
  const otherEnvelope = selectedEnvelope({
    overrides: {
      projectId: "other-project",
      envelopeId: "env-other-project",
    },
  });
  const fixtureEnvelope = selectedEnvelope({
    overrides: {
      source: "p1-project-browser-fixture",
      readOnly: true,
      browserOnly: true,
    },
  });
  const responses = [otherEnvelope, fixtureEnvelope];

  for (const response of responses) {
    const calls = [];
    const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
      context: {
        ...readyContext(envelope),
        project: {
          currentProject: {
            projectId: "currently-open-project-must-not-be-used",
          },
        },
      },
      services: {
        savedProjects: {
          getProjectEnvelope(value) {
            calls.push(value);
            return structuredClone(response);
          },
        },
      },
    });

    assertScalarSafeBoundary(boundary);
    assert.equal(boundary.ready, false);
    assert.equal(boundary.failClosed, true);
    assert.equal(boundary.selectedEnvelopeReadCount, 1);
    assert.deepEqual(calls, [ENVELOPE_ID]);
    assert.equal(boundary.currentProjectFallbackUsed, false);
    assert.equal(boundary.otherEnvelopeFallbackUsed, false);
    assert.equal(boundary.fixtureFallbackUsed, false);
    assert.equal(
      getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary),
      null,
    );
  }
});

test("resolver fails closed when persisted Stage-3 inputs are absent, incomplete, or mapper-invalid", async () => {
  const cases = [
    {
      envelope: selectedEnvelope({ actionSource: null }),
      expected: "selected-project-engine-run-action-persisted-stage3-input-source-invalid",
    },
    {
      envelope: selectedEnvelope({
        actionSource: {
          factoryApprovedInputsSummary: stage3Inputs().factoryApprovedInputsSummary,
        },
      }),
      expected: "selected-project-engine-run-action-persisted-stage3-inputs-incomplete",
    },
    {
      envelope: selectedEnvelope({
        actionSource: stage3Inputs({
          committedSelectorConstraints: stage3Inputs().committedSelectorConstraints
            .filter((constraint) => constraint.fieldKey !== "tier"),
        }),
      }),
      expected: "missing-candidate-field-tier",
    },
  ];

  for (const { envelope, expected } of cases) {
    let calls = 0;
    const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
      context: readyContext(envelope),
      services: {
        savedProjects: {
          getProjectEnvelope() {
            calls += 1;
            return structuredClone(envelope);
          },
        },
      },
    });

    assertScalarSafeBoundary(boundary);
    assert.equal(boundary.ready, false);
    assert.equal(boundary.failClosed, true);
    assert.equal(boundary.selectedEnvelopeReadCount, 1);
    assert.equal(boundary.blocker, expected);
    assert.equal(calls, 1);
    assert.equal(
      getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary),
      null,
    );
  }

  const absentEnvelope = selectedEnvelope({
    actionSource: undefined,
    actionSourceLocation: "none",
  });
  let absentCalls = 0;
  const absent = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: readyContext(absentEnvelope),
    services: {
      savedProjects: {
        getProjectEnvelope() {
          absentCalls += 1;
          return structuredClone(absentEnvelope);
        },
      },
    },
  });
  assertScalarSafeBoundary(absent);
  assert.equal(absent.readiness, "missing");
  assert.equal(
    absent.blocker,
    "selected-project-engine-run-action-persisted-stage3-inputs-missing",
  );
  assert.equal(absent.selectedEnvelopeReadCount, 1);
  assert.equal(absentCalls, 1);
});

test("all four declared persisted Stage-3 source locations remain selected-envelope-only", async () => {
  const locations = [
    "state.engineRunActionSource",
    "downstreamContext.engineRunActionSource",
    "state",
    "downstreamContext",
  ];

  for (const actionSourceLocation of locations) {
    const envelope = selectedEnvelope({ actionSourceLocation });
    const calls = [];
    const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
      context: readyContext(envelope),
      services: {
        savedProjects: {
          getProjectEnvelope(value) {
            calls.push(value);
            return structuredClone(envelope);
          },
        },
      },
    });

    assertScalarSafeBoundary(boundary);
    assert.equal(boundary.ready, true, actionSourceLocation);
    assert.equal(boundary.selectedEnvelopeReadCount, 1);
    assert.deepEqual(calls, [ENVELOPE_ID]);
    assert.ok(
      PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS.includes(
        boundary.stage3InputSourceLocation,
      ),
    );
  }
});

test("source boundary adds no Engine invocation, selected-result replay, persistence, RuntimeData, route, server, or filesystem seam", async () => {
  const source = await readFile(
    new URL(
      "../packages/workspace-kernel/projectBrowserSelectedProjectEngineRunActionSourceBoundary.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.match(source, /buildSelectorReadonlyEngineCandidateForInternalSeam/);
  assert.match(source, /services\?\.savedProjects\?\.getProjectEnvelope/);
  assert.match(source, /const INTERNAL_ENGINE_CANDIDATES = new WeakMap\(\)/);
  assert.doesNotMatch(
    source,
    /invokeSelectorReadonlyEngineStep1WithHostLocalReadonlySeam|engineRunTableInternalReadonlyInvoke|invokeReadonlyEngineSeam/,
  );
  assert.doesNotMatch(
    source,
    /saveCurrentProjectEnvelope|saveProjectEnvelope|restoreProjectEnvelope|prepareHandoffSharePackage/,
  );
  assert.doesNotMatch(
    source,
    /fetch\s*\(|XMLHttpRequest|WebSocket|\/api\/|\bPOST\b|server\.js|node:fs|writeFile|appendFile|mkdir|createWriteStream/,
  );
  assert.doesNotMatch(source, /RuntimeData\s*[.\[]|runtimeData\s*[.\[]/);
  assert.doesNotMatch(
    source,
    /context\?*\.project(?!Browser)|context\?*\.currentProject|fixtureEnvelopes|FIXTURE_ENVELOPES/,
  );
  assert.doesNotMatch(
    source,
    /downstreamContext\?*\.selectedResultSummary|\.selectedResultSummary\s*[,)]/,
  );
});
