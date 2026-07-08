import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus,
  createProjectBrowserService,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/projectBrowserService.js";

const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

const SELECTED_PROJECT_STATUS_ALLOWED_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "selectedProjectId",
  "selectedProjectFound",
  "selectedProjectReadiness",
  "selectedProjectReady",
  "selectedProjectFailClosed",
  "selectedProjectBlocker",
  "selectedProjectReadbackFingerprint",
  "moduleId",
  "targetLocation",
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "credentialsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "selectedResultPersistenceAttempted",
  "runTableGenerationAttempted",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
  "projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatusFingerprint",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "rawSelectedPayloadReturned",
  "rawSelectedPayloadExposed",
  "rawEnginePayloadReturned",
  "rawEnginePayloadExposed",
  "rawRunTableRowsReturned",
  "rawRunTableRowsExposed",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "credentialsReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "selectedResultPersistenceAttempted",
  "runTableGenerationAttempted",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
]);

function readyReadback(overrides = {}) {
  return {
    state: "selected_result_persisted_summary_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:selected-project-ready-fixture",
    ...overrides,
  };
}

function blockedReadback(overrides = {}) {
  return {
    state: "selected_result_persisted_summary_readback_blocked_fail_closed",
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "summary-field-not-allow-listed-raw-field",
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:selected-project-blocked-fixture",
    ...overrides,
  };
}

function savedProjectSummary(projectId, envelopeId, readback) {
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    restoreEligible: true,
    envelopeId,
    projectId,
    title: `Saved ${projectId}`,
    client: "Runtime Client",
    site: "Runtime Site",
    selectedResultPersistedSummaryReadbackStatus: readback,
  };
}

function fakeStore(projects, extra = {}) {
  return {
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "selected-project-status-test-store",
        projects,
        count: projects.length,
        savedCount: projects.filter((project) => project.readOnly !== true && project.browserOnly !== true).length,
        fixtureCount: projects.filter((project) => project.readOnly === true || project.browserOnly === true).length,
        safeEmpty: projects.length === 0,
        save: {},
        restore: {},
        hydrate: {},
        handoffShare: {},
      };
    },
    getProjectEnvelope() {
      throw new Error("selected-project status consumer must not inspect envelopes");
    },
    getSelectedResultPersistedSummaryReadbackStatus() {
      throw new Error("selected-project status consumer must not invoke readback helpers");
    },
    saveCurrentProjectEnvelope() {
      throw new Error("selected-project status consumer must not save or mutate state");
    },
    restoreProjectEnvelope() {
      throw new Error("selected-project status consumer must not restore or mutate state");
    },
    prepareHandoffSharePackage() {
      throw new Error("selected-project status consumer must not prepare output paths");
    },
    ...extra,
  };
}

function assertSelectedProjectStatusShape(status) {
  assert.deepEqual(Object.keys(status), SELECTED_PROJECT_STATUS_ALLOWED_KEYS);
  assert.equal(status.schemaId, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID);
  assert.equal(status.schemaVersion, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(status.owner, "shell");
  assert.equal(status.source, "project-browser-selected-project-project-summary-selected-result-readback-status-consumer");
  assert.equal(status.moduleId, "cs_selector");
  assert.equal(status.targetLocation, TARGET);
  assert.ok(
    status.projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatusFingerprint.startsWith(
      "safe-project-browser-selected-project-selected-result-persisted-summary-readback-status:",
    ),
  );
  for (const flag of REQUIRED_FALSE_FLAGS) {
    assert.equal(status[flag], false, flag);
  }
}

function assertNoUnsafeValues(status) {
  const text = JSON.stringify(status);
  for (const unsafeToken of [
    "secret-token",
    "selectedResultPayload-secret",
    "raw-engine-secret",
    "runtime-output.ies",
    "credential-value",
    "C:\\\\ControlStack_Runtime",
    "C:\\ControlStack_Runtime",
  ]) {
    assert.equal(text.includes(unsafeToken), false, unsafeToken);
  }
  for (const unsafeKey of [
    "selectedResultPayload",
    "rawEnginePayload",
    "runTableRows",
    "iesText",
    "photometry",
    "credentials",
    "envelope",
    "selectorViewModel",
    "selectedResultPersistedSummaryReadbackStatus",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(status, unsafeKey), false, unsafeKey);
  }
}

test("selected-project status comes from project summaries only", () => {
  const projects = [
    savedProjectSummary("ready-project", "env-ready-project", readyReadback()),
    savedProjectSummary("other-project", "env-other-project", blockedReadback()),
  ];

  const status = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(
    projects,
    "env-ready-project",
  );

  assertSelectedProjectStatusShape(status);
  assert.equal(status.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready);
  assert.equal(status.readiness, "ready");
  assert.equal(status.ready, true);
  assert.equal(status.failClosed, false);
  assert.equal(status.selectedProjectId, "env-ready-project");
  assert.equal(status.selectedProjectFound, true);
  assert.equal(status.selectedProjectReadiness, "ready");
  assert.equal(status.selectedProjectReady, true);
  assert.equal(status.selectedProjectFailClosed, false);
  assert.equal(status.selectedProjectBlocker, null);
  assert.equal(
    status.selectedProjectReadbackFingerprint,
    "safe-selected-result-persisted-summary-readback-status:selected-project-ready-fixture",
  );
  assertNoUnsafeValues(status);
});

test("selected-project status is missing fail-closed when no project is selected", () => {
  const projects = [savedProjectSummary("ready-project", "env-ready-project", readyReadback())];
  const service = createProjectBrowserService({ savedProjectStore: fakeStore(projects) });

  const snapshot = service.getProjectBrowserSnapshot({});
  const status = snapshot.selectedProjectSelectedResultPersistedSummaryReadbackStatus;

  assertSelectedProjectStatusShape(status);
  assert.equal(status.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(status.readiness, "missing");
  assert.equal(status.ready, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.selectedProjectId, null);
  assert.equal(status.selectedProjectFound, false);
  assert.equal(status.selectedProjectReadiness, "missing");
  assert.equal(status.selectedProjectReady, false);
  assert.equal(status.selectedProjectFailClosed, true);
  assert.equal(status.selectedProjectBlocker, "project-browser-selected-project-not-selected");
  assert.equal(status.selectedProjectReadbackFingerprint, null);
  assertNoUnsafeValues(status);
});

test("selected-project status is missing fail-closed when selected project is not found", () => {
  const projects = [savedProjectSummary("ready-project", "env-ready-project", readyReadback())];

  const status = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(
    projects,
    "env-missing-project",
  );

  assertSelectedProjectStatusShape(status);
  assert.equal(status.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(status.readiness, "missing");
  assert.equal(status.ready, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.selectedProjectId, "env-missing-project");
  assert.equal(status.selectedProjectFound, false);
  assert.equal(status.selectedProjectReadiness, "missing");
  assert.equal(status.selectedProjectReady, false);
  assert.equal(status.selectedProjectFailClosed, true);
  assert.equal(status.selectedProjectBlocker, "project-browser-selected-project-not-found");
  assert.equal(status.selectedProjectReadbackFingerprint, null);
  assertNoUnsafeValues(status);
});

test("selected-project status blocks fail-closed from malformed project-summary readback without surfacing raw fields", () => {
  const projects = [
    savedProjectSummary("malformed-project", "env-malformed-project", readyReadback({
      rawEnginePayload: "raw-engine-secret",
      selectedResultPayload: "selectedResultPayload-secret",
      iesText: "runtime-output.ies",
      credentials: "credential-value",
      privatePath: "C:\\ControlStack_Runtime\\runtime-output.ies",
    })),
  ];

  const status = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackStatus(
    projects,
    "env-malformed-project",
  );

  assertSelectedProjectStatusShape(status);
  assert.equal(status.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(status.readiness, "blocked_fail_closed");
  assert.equal(status.ready, false);
  assert.equal(status.failClosed, true);
  assert.equal(status.selectedProjectId, "env-malformed-project");
  assert.equal(status.selectedProjectFound, true);
  assert.equal(status.selectedProjectReadiness, "blocked_fail_closed");
  assert.equal(status.selectedProjectReady, false);
  assert.equal(status.selectedProjectFailClosed, true);
  assert.equal(status.selectedProjectBlocker, "blocked-raw-field-rawEnginePayload");
  assert.equal(
    status.selectedProjectReadbackFingerprint,
    "safe-selected-result-persisted-summary-readback-status:selected-project-ready-fixture",
  );
  assertNoUnsafeValues(status);
});

test("selected-project status consumer does not inspect envelopes, invoke selector view-models, add routes, or mutate state", () => {
  const project = Object.freeze(savedProjectSummary("stable-project", "env-stable-project", readyReadback()));
  const projects = Object.freeze([project]);
  const before = JSON.stringify(projects);
  const service = createProjectBrowserService({
    savedProjectStore: fakeStore(projects),
    projectService: {
      restoreProjectFromEnvelope() {
        throw new Error("selector or restore view-model path must not be invoked by selected-project status consumer");
      },
      recordHandoffSharePackage() {
        throw new Error("handoff or output path must not be invoked by selected-project status consumer");
      },
    },
    eventBus: {
      emit() {
        throw new Error("selected-project status snapshot consumer must not emit events");
      },
    },
  });

  const snapshot = service.getProjectBrowserSnapshot({
    downstream: {
      selector: {
        selectedResultPayload: "selectedResultPayload-secret",
        rawEnginePayload: "raw-engine-secret",
      },
    },
  });
  const status = snapshot.selectedProjectSelectedResultPersistedSummaryReadbackStatus;

  assertSelectedProjectStatusShape(status);
  assert.equal(status.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(status.routesAdded, false);
  assert.equal(status.postEndpointsAdded, false);
  assert.equal(status.runtimeDataMutated, false);
  assert.equal(status.boardDataMutated, false);
  assert.equal(status.selectedResultPersistenceAttempted, false);
  assert.equal(status.runTableGenerationAttempted, false);
  assert.equal(status.iesGenerationAttempted, false);
  assert.equal(status.outputGenerationEnabled, false);
  assert.equal(JSON.stringify(projects), before);
  assert.equal(Object.prototype.hasOwnProperty.call(snapshot, "selectedResultPersistedSummaryReadbackDetailSummary"), false);
  assertNoUnsafeValues(status);
});
