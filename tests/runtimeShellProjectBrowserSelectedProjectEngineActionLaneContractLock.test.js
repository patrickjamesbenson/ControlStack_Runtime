import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_CONTRACT_LOCK_ID,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js";
import {
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionEligibility.js";

const EXPECTED_ACTION_LANE_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "surfaceId",
  "label",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "selectedProjectOnly",
  "preEngineEligibilityPresent",
  "preEngineEligibilityState",
  "preEngineEligibilityReadiness",
  "preEngineEligibilityReady",
  "selectedProjectAndRevisionMatch",
  "stage3ActionSourceReady",
  "candidateReconstructionPreflightEligible",
  "serverOwnershipAcknowledged",
  "sourcePreviewPresent",
  "sourcePreviewState",
  "sourcePreviewReadiness",
  "sourcePreviewReady",
  "engineRunReadinessBoundaryReady",
  "selectedResultAccepted",
  "engineVerified",
  "runCount",
  "actionItemCount",
  "enabledActionItemCount",
  "actions",
  "readOnly",
  "redacted",
  "machineValueSafe",
  "userGestureRequired",
  "nonExecuting",
  "engineCapabilityMounted",
  "preparedActionRetainedPrivately",
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "selectedResultPersistenceEnabled",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "outputGenerated",
  "outputGenerationEnabled",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

const EXPECTED_ACTION_ITEM_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "actionId",
  "label",
  "state",
  "readiness",
  "available",
  "enabled",
  "failClosed",
  "blocker",
  "readOnly",
  "userGestureRequired",
  "selectedProjectOnly",
  "preparedActionRetainedPrivately",
]);

const EXPECTED_ELIGIBILITY_FIELDS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "projectId",
  "envelopeId",
  "serverRevisionId",
  "projectionFingerprint",
  "selectedProjectAndRevisionMatch",
  "stage3ActionSourceReady",
  "candidateReconstructionPreflightEligible",
  "serverOwnershipAcknowledged",
  "runIntakePreviewReady",
  "factoryApprovedInputsReady",
  "candidateMapperReady",
  "selectedProjectOnly",
  "readOnly",
  "scalarSafe",
  "postEngineResultReadbackRequired",
  "candidatePayloadReturned",
  "projectEnvelopeReturned",
  "enginePayloadReturned",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
  "shellProjectEngineActionEligibilityFingerprint",
]);

test("action-lane and pre-Engine eligibility schemas remain exact and independently versioned", () => {
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-SURFACE-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_ACTION_LANE_CONTRACT_LOCK_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-ACTION-LANE-CONTRACT-LOCK-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-engine-action-lane.v1",
  );
  assert.equal(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_SCHEMA_VERSION, 1);
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-engine-action-item.v1",
  );
  assert.equal(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_SCHEMA_VERSION, 1);
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_FIELD_ORDER,
    EXPECTED_ACTION_LANE_FIELD_ORDER,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ITEM_FIELD_ORDER,
    EXPECTED_ACTION_ITEM_FIELD_ORDER,
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.selected-project-engine-action-eligibility.v1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_SCHEMA_VERSION,
    1,
  );
  assert.deepEqual(
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_ELIGIBILITY_FIELD_ORDER,
    EXPECTED_ELIGIBILITY_FIELDS,
  );
  assert.deepEqual(SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_ACTION_LANE_STATES, {
    ready: "shell_project_browser_selected_project_engine_action_lane_ready",
    invoking: "shell_project_browser_selected_project_engine_action_lane_invoking",
    completed: "shell_project_browser_selected_project_engine_action_lane_completed",
    missing: "shell_project_browser_selected_project_engine_action_lane_missing",
    blockedFailClosed:
      "shell_project_browser_selected_project_engine_action_lane_blocked_fail_closed",
  });
});

test("contract lock keeps pre-Engine authority separate from the post-Engine preview contract", async () => {
  const [laneSource, eligibilitySource, previewSource] = await Promise.all([
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
      import.meta.url,
    ), "utf8"),
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionEligibility.js",
      import.meta.url,
    ), "utf8"),
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js",
      import.meta.url,
    ), "utf8"),
  ]);
  assert.match(laneSource, /engineActionEligibility/);
  assert.match(laneSource, /preEngineEligibilityReady/);
  assert.match(laneSource, /sourcePreviewReady/);
  assert.match(eligibilitySource, /postEngineResultReadbackRequired: false/);
  assert.match(eligibilitySource, /selectedProjectAndRevisionMatch/);
  assert.match(eligibilitySource, /candidateReconstructionPreflightEligible/);
  assert.match(previewSource, /nonInteractive: true/);
  assert.match(previewSource, /engineActionEnabled: false/);
  assert.doesNotMatch(eligibilitySource, /selectedResultAccepted|engineVerifiedRunCount/);
});

test("contract lock preserves a single shell action and excludes execution, persistence, generation, and raw payload ownership", async () => {
  const [laneSource, eligibilitySource] = await Promise.all([
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionLane.js",
      import.meta.url,
    ), "utf8"),
    readFile(new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineActionEligibility.js",
      import.meta.url,
    ), "utf8"),
  ]);
  assert.match(laneSource, /label: "Run Engine"/);
  assert.match(laneSource, /actionItemCount: actions\.length/);
  assert.match(laneSource, /userGestureRequired: true/);
  assert.doesNotMatch(laneSource, /addEventListener|onclick|fetch\s*\(|services?\./);
  assert.doesNotMatch(
    `${laneSource}\n${eligibilitySource}`,
    /writeFile|appendFile|mkdir|createWriteStream|RuntimeData\s*[.\[]|generateRunTable|generateIes|persistSelectedResult|rawEnginePayload\s*:/,
  );
});
