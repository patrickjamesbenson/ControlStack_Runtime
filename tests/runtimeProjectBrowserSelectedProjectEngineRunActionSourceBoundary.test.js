import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildSelectorPreEngineReadonlyActionEligibilityProjection,
} from "../packages/modules/cs-selector/selectorViewModel.js";
import {
  buildSelectorReadonlyEngineCandidateForInternalSeam,
} from "../packages/workspace-kernel/selectorReadonlyEngineCandidateMapper.js";
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

const PROJECT_ID = "pre-engine-action-source-project";
const ENVELOPE_ID = "env-pre-engine-action-source-project";

function readyProjection({ quantity = 2, runLengthMm = 3500 } = {}) {
  const committedSelectorConstraints = [
    { fieldKey: "directOpticVar1", value: "80|Inlay", valueLabel: "Inlay", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "targetLmPerM", value: "1200", valueLabel: "1200", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "cctCri", value: "4000K / CRI90", valueLabel: "4000K / CRI90", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
    { fieldKey: "controlType", value: "DALI-2", valueLabel: "DALI-2", committedSelectorState: true, blocked: false, authoritySource: "manualConstraints" },
  ];
  const factoryApprovedInputsSummary = {
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    factoryApprovedInputsReady: true,
    readonlyEngineCandidateInputsReady: true,
    readonlyEngineCandidateInputsBlocker: null,
    stage2Ready: true,
    readonlyEngineCandidateApplicability: {
      directSupported: true,
      indirectRequired: false,
      directOnly: true,
      supportedSlice: "first-readonly-engine-direct-only",
    },
    ready: true,
    stage3Mode: "simple-run-stage3a-zero-accessory",
    blocker: null,
    stage2Ready: true,
    committedSelectorConstraintCount: committedSelectorConstraints.length,
    committedRunIntakeSummary: {
      ready: true,
      committedRunIntakeReady: true,
      sourceAuthority: "committed-selector-state",
      runQuantity: quantity,
      runLengthMm,
      
    },
    runIntakePreviewSummary: {
      runIntakePreviewReady: true,
      runCount: 1,
      totalQuantity: quantity,
    },
    accessoryPlacementIntentSummary: { accessoryIntentCount: 0 },
    accessoryReservationRequired: false,
    engineExecuted: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
  };
  const lmTemperatureReadinessPreview = {
    targetIntent: { direct: { ready: true, valueLabel: "1200" } },
    cctCriPairing: { direct: { ready: true, valueLabel: "4000K / CRI90" } },
    controlIntent: { direct: { ready: true, valueLabel: "DALI-2" } },
    fingerprint: "safe-selector-lm-temperature:action-source",
    rawRowsReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
  };
  const mapper = buildSelectorReadonlyEngineCandidateForInternalSeam({
    factoryApprovedInputsSummary,
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
  });
  assert.equal(mapper.ok, true);
  return buildSelectorPreEngineReadonlyActionEligibilityProjection({
    specBuildReadinessPreview: {
      factoryApprovedInputsReady: true,
      factoryApprovedInputsSummary,
      readonlyEngineCandidateReady: true,
      readonlyEngineCandidateMapperSummary: mapper.summary,
    },
    committedSelectorConstraints,
    lmTemperatureReadinessPreview,
    sourceInputFingerprint: "safe-source-input:action-source",
    boardDataSourceVersion: "safe-board-version:action-source",
  });
}

function selectedEnvelope(projection = readyProjection(), overrides = {}) {
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
        state: {},
        downstreamContext: {
          preEngineActionEligibilityProjection: projection,
        },
      },
    },
    ...overrides,
  };
}

function context(selectedProjectId = ENVELOPE_ID) {
  return { projectBrowser: { selectedProjectId } };
}

function assertScalarBoundary(boundary) {
  assert.equal(Object.isFrozen(boundary), true);
  assert.deepEqual(
    Object.keys(boundary),
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_FIELD_ORDER,
  );
  assert.equal(Object.values(boundary).every((value) => (
    value === null
      || typeof value === "string"
      || typeof value === "boolean"
      || Number.isSafeInteger(value)
  )), true);
  const serialised = JSON.stringify(boundary);
  for (const forbidden of [
    '"factoryApprovedInputsSummary":',
    '"committedSelectorConstraints":',
    '"lmTemperatureReadinessPreview":',
    '"candidatePayload":',
    '"projectEnvelope":',
    '"run_length_mm":',
    '"target_lm_per_m":',
    '"rows":',
    '"rawRows":',
  ]) assert.equal(serialised.includes(forbidden), false, forbidden);
}

test("action source contract declares only the pre-Engine projection as the new Stage-3 target", () => {
  assert.equal(
    PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_CONTRACT_ID,
    "PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-RUN-ACTION-SOURCE-BOUNDARY-1",
  );
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_ID,
    "controlstack.runtime.project-browser.selected-project-engine-run-action-source-boundary.v1",
  );
  assert.equal(
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_SCHEMA_VERSION,
    1,
  );
  assert.deepEqual(PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS, [
    "projectEnvelope.modules.cs_selector.downstreamContext.preEngineActionEligibilityProjection",
  ]);
});

test("resolver validates pre-Engine authority, reads the exact selected revision once, and retains the reconstructed candidate privately", async () => {
  const projection = readyProjection();
  const envelope = selectedEnvelope(projection);
  const reads = [];
  const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: context(),
    services: {
      savedProjects: {
        getProjectEnvelope(selectedProjectId) {
          reads.push(selectedProjectId);
          return structuredClone(envelope);
        },
      },
    },
  });

  assertScalarBoundary(boundary);
  assert.equal(
    boundary.state,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_SOURCE_BOUNDARY_STATES.ready,
  );
  assert.equal(boundary.ready, true);
  assert.equal(boundary.failClosed, false);
  assert.equal(boundary.blocker, null);
  assert.equal(boundary.selectedProjectId, ENVELOPE_ID);
  assert.equal(boundary.projectId, PROJECT_ID);
  assert.equal(boundary.envelopeId, ENVELOPE_ID);
  assert.equal(
    boundary.stage3InputSourceLocation,
    PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_ACTION_STAGE3_INPUT_TARGETS[0],
  );
  assert.equal(boundary.readinessSummaryFingerprint, projection.projectionFingerprint);
  assert.equal(boundary.factoryApprovedInputsSummaryPresent, true);
  assert.equal(boundary.committedSelectorConstraintsPresent, true);
  assert.equal(boundary.lmTemperatureReadinessPreviewPresent, true);
  assert.equal(boundary.candidateMapperReady, true);
  assert.equal(boundary.candidateRunCount, 1);
  assert.equal(boundary.candidateTotalQuantity, 2);
  assert.match(
    boundary.candidateFingerprint,
    /^safe-selector-readonly-engine-candidate:[0-9a-f]{40}$/,
  );
  assert.equal(boundary.selectedResultPayloadUsed, false);
  assert.equal(boundary.selectedEnvelopeReadCount, 1);
  assert.deepEqual(reads, [ENVELOPE_ID]);

  const candidate = getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary);
  assert.ok(candidate);
  assert.equal(candidate.tier, "Business");
  assert.equal(candidate.runs[0].qty, 2);
  assert.equal(candidate.runs[0].run_length_mm, 3500);
  assert.equal(candidate.lighting.target_lm_per_m, "1200");
  assert.equal(candidate.lighting.cct, "4000");
  assert.equal(candidate.lighting.cri, "90");
  assert.equal(candidate.control_type, "DALI-2");
});

test("resolver fails closed for missing, blocked, malformed, stale-identity, or candidate-mismatched projections", async () => {
  const ready = readyProjection();
  const cases = [];

  const missing = selectedEnvelope(null);
  delete missing.modules.cs_selector.downstreamContext
    .preEngineActionEligibilityProjection;
  cases.push([missing, ENVELOPE_ID, "selected-project-engine-run-action-pre-engine-projection-missing"]);

  const blocked = structuredClone(ready);
  blocked.ready = false;
  cases.push([
    selectedEnvelope(blocked),
    ENVELOPE_ID,
    "selected-project-engine-run-action-pre-engine-projection-invalid",
  ]);

  const mismatchedCandidate = structuredClone(ready);
  mismatchedCandidate.candidateFingerprint =
    "safe-selector-readonly-engine-candidate:0000000000000000000000000000000000000000";
  cases.push([
    selectedEnvelope(mismatchedCandidate),
    ENVELOPE_ID,
    "selected-project-engine-run-action-pre-engine-projection-invalid",
  ]);

  cases.push([
    selectedEnvelope(ready),
    "other-selected-project",
    "selected-project-engine-run-action-envelope-identity-mismatch",
  ]);

  for (const [envelope, selectedProjectId, expectedBlocker] of cases) {
    const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
      context: context(selectedProjectId),
      services: {
        savedProjects: {
          getProjectEnvelope() {
            return structuredClone(envelope);
          },
        },
      },
    });
    assertScalarBoundary(boundary);
    assert.equal(boundary.ready, false);
    assert.equal(boundary.failClosed, true);
    assert.equal(boundary.blocker, expectedBlocker);
    assert.equal(
      getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary),
      null,
    );
  }
});

test("resolver never uses post-Engine result summaries as pre-Engine candidate authority", async () => {
  const projection = readyProjection();
  const envelope = selectedEnvelope(projection);
  envelope.modules.cs_selector.downstreamContext.selectedResultSummary = {
    status: "forged-post-engine-result",
    candidatePayload: { tier: "Enterprise" },
  };
  envelope.modules.cs_selector.downstreamContext.runTableFirstNarrowOutputSummary = {
    rows: [{ unsafe: true }],
  };
  const boundary = await resolveProjectBrowserSelectedProjectEngineRunActionSourceBoundary({
    context: context(),
    services: {
      savedProjects: {
        getProjectEnvelope() {
          return structuredClone(envelope);
        },
      },
    },
  });
  assert.equal(boundary.ready, true);
  assert.equal(boundary.selectedResultPayloadUsed, false);
  const candidate = getProjectBrowserSelectedProjectEngineRunActionInternalCandidate(boundary);
  assert.equal(candidate.tier, "Business");
  assert.equal(JSON.stringify(boundary).includes("forged-post-engine-result"), false);
});

test("source boundary adds no Engine invocation, persistence, route, RuntimeData, or filesystem seam", async () => {
  const source = await readFile(
    new URL(
      "../packages/workspace-kernel/projectBrowserSelectedProjectEngineRunActionSourceBoundary.js",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /preEngineActionEligibilityProjection/);
  assert.match(source, /buildSelectorReadonlyEngineCandidateForInternalSeam/);
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
    /fetch\s*\(|XMLHttpRequest|WebSocket|\/api\/|\bPOST\b|node:fs|writeFile|appendFile|mkdir|createWriteStream/,
  );
  assert.doesNotMatch(source, /RuntimeData\s*[.\[]|runtimeData\s*[.\[]/);
});