import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserSelectedResultPersistedSummaryReadbackSummary,
  createProjectBrowserService,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";
import { createSavedProjectStore } from "../packages/workspace-kernel/savedProjectStore.js";

const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

const PROJECT_BROWSER_READBACK_ALLOWED_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "projectCount",
  "savedProjectCount",
  "fixtureProjectCount",
  "readyProjectCount",
  "missingProjectCount",
  "blockedFailClosedProjectCount",
  "selectedProjectId",
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
  "projectBrowserSelectedResultPersistedSummaryReadbackSummaryFingerprint",
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
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:ready-fixture",
    ...overrides,
  };
}

function missingReadback(overrides = {}) {
  return {
    state: "selected_result_persisted_summary_readback_missing",
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: "selected-result-persisted-summary-slot-empty",
    selectedResultPersistedSummaryReadbackFingerprint: null,
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

function fixtureProjectSummary(projectId, readback = missingReadback()) {
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "project-browser-fixture",
    readOnly: true,
    browserOnly: true,
    restoreEligible: false,
    envelopeId: `env-${projectId}`,
    projectId,
    title: `Fixture ${projectId}`,
    client: "Fixture Client",
    site: "Fixture Site",
    selectedResultPersistedSummaryReadbackStatus: readback,
  };
}

function fakeStore(projects, extra = {}) {
  return {
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "test-project-summary-only-store",
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
      throw new Error("project-browser readback consumer must not inspect envelopes");
    },
    getSelectedResultPersistedSummaryReadbackStatus() {
      throw new Error("project-browser readback consumer must not invoke readback helpers");
    },
    ...extra,
  };
}

function assertProjectBrowserReadbackSummaryShape(summary) {
  assert.deepEqual(Object.keys(summary), PROJECT_BROWSER_READBACK_ALLOWED_KEYS);
  assert.equal(summary.schemaId, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.source, "project-browser-project-summary-selected-result-readback-consumer");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.targetLocation, TARGET);
  assert.ok(summary.projectBrowserSelectedResultPersistedSummaryReadbackSummaryFingerprint.startsWith("safe-project-browser-selected-result-persisted-summary-readback-summary:"));
  for (const flag of REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[flag], false, flag);
  }
}

function assertNoUnsafeValues(summary) {
  const text = JSON.stringify(summary);
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
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "selectedResultPayload"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "rawEnginePayload"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "runTableRows"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "iesText"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "photometry"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "credentials"), false);
}

test("project browser aggregates selected-result persisted summary readback from project summaries only", () => {
  const projects = [
    savedProjectSummary("ready-project", "env-ready-project", readyReadback()),
    fixtureProjectSummary("fixture-project"),
  ];
  const service = createProjectBrowserService({ savedProjectStore: fakeStore(projects) });

  const snapshot = service.getProjectBrowserSnapshot({
    project: {
      metadata: { projectId: "current-project", title: "Current project" },
      currentProject: { client: "Runtime Client", site: "Runtime Site" },
    },
    downstream: {
      selector: {
        selectedResultPayload: "selectedResultPayload-secret",
        rawEnginePayload: "raw-engine-secret",
      },
    },
  });
  const summary = snapshot.selectedResultPersistedSummaryReadbackSummary;
  const selectedSummary = buildProjectBrowserSelectedResultPersistedSummaryReadbackSummary(projects, "env-ready-project");

  assertProjectBrowserReadbackSummaryShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready);
  assert.equal(summary.readiness, "ready");
  assert.equal(summary.ready, true);
  assert.equal(summary.failClosed, false);
  assert.equal(summary.projectCount, 2);
  assert.equal(summary.savedProjectCount, 1);
  assert.equal(summary.fixtureProjectCount, 1);
  assert.equal(summary.readyProjectCount, 1);
  assert.equal(summary.missingProjectCount, 1);
  assert.equal(summary.blockedFailClosedProjectCount, 0);
  assert.equal(snapshot.projects.length, 2);
  assert.equal(selectedSummary.selectedProjectId, "env-ready-project");
  assert.equal(selectedSummary.selectedProjectReadiness, "ready");
  assert.equal(selectedSummary.selectedProjectReady, true);
  assert.equal(selectedSummary.selectedProjectFailClosed, false);
  assert.equal(selectedSummary.selectedProjectBlocker, null);
  assert.equal(selectedSummary.selectedProjectReadbackFingerprint, "safe-selected-result-persisted-summary-readback-status:ready-fixture");
  assertNoUnsafeValues(summary);
});

test("project browser readback summary remains missing with no persisted projects or fabricated fixtures", () => {
  const store = createSavedProjectStore();
  const service = createProjectBrowserService({ savedProjectStore: store });
  const snapshot = service.getProjectBrowserSnapshot({});
  const summary = snapshot.selectedResultPersistedSummaryReadbackSummary;

  assertProjectBrowserReadbackSummaryShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.missing);
  assert.equal(summary.readiness, "missing");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.projectCount, 0);
  assert.equal(summary.savedProjectCount, 0);
  assert.equal(summary.fixtureProjectCount, 0);
  assert.equal(summary.readyProjectCount, 0);
  assert.equal(summary.missingProjectCount, 0);
  assert.equal(summary.blockedFailClosedProjectCount, 0);
  assert.equal(summary.selectedProjectId, null);
  assert.equal(summary.selectedProjectReadiness, null);
  assert.equal(summary.selectedProjectReady, false);
  assert.equal(summary.selectedProjectFailClosed, false);
  assert.equal(summary.selectedProjectBlocker, null);
  assert.equal(summary.selectedProjectReadbackFingerprint, null);
  assertNoUnsafeValues(summary);
});

test("project browser summary blocks fail-closed from malformed project-summary readback without surfacing raw fields", () => {
  const projects = [
    savedProjectSummary("malformed-project", "env-malformed-project", readyReadback({
      rawEnginePayload: "raw-engine-secret",
      selectedResultPayload: "selectedResultPayload-secret",
      iesText: "runtime-output.ies",
      credentials: "credential-value",
      privatePath: "C:\\ControlStack_Runtime\\runtime-output.ies",
    })),
    savedProjectSummary("ready-project", "env-ready-project", readyReadback()),
  ];
  const summary = buildProjectBrowserSelectedResultPersistedSummaryReadbackSummary(projects, "env-malformed-project");

  assertProjectBrowserReadbackSummaryShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.blockedFailClosed);
  assert.equal(summary.readiness, "blocked_fail_closed");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.projectCount, 2);
  assert.equal(summary.savedProjectCount, 2);
  assert.equal(summary.fixtureProjectCount, 0);
  assert.equal(summary.readyProjectCount, 1);
  assert.equal(summary.missingProjectCount, 0);
  assert.equal(summary.blockedFailClosedProjectCount, 1);
  assert.equal(summary.selectedProjectReadiness, "blocked_fail_closed");
  assert.equal(summary.selectedProjectReady, false);
  assert.equal(summary.selectedProjectFailClosed, true);
  assert.equal(summary.selectedProjectBlocker, "blocked-raw-field-rawEnginePayload");
  assertNoUnsafeValues(summary);
});

test("project browser consumer does not inspect envelopes, invoke selector view-models, add routes, or mutate state", () => {
  const project = Object.freeze(savedProjectSummary("stable-project", "env-stable-project", readyReadback()));
  const projects = Object.freeze([project]);
  const before = JSON.stringify(projects);
  const service = createProjectBrowserService({
    savedProjectStore: fakeStore(projects),
    projectService: {
      restoreProjectFromEnvelope() {
        throw new Error("selector or restore view-model path must not be invoked by snapshot consumer");
      },
    },
    eventBus: {
      emit() {
        throw new Error("snapshot consumer must not emit events");
      },
    },
  });

  const snapshot = service.getProjectBrowserSnapshot({});
  const summary = snapshot.selectedResultPersistedSummaryReadbackSummary;

  assertProjectBrowserReadbackSummaryShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATES.ready);
  assert.equal(summary.routesAdded, false);
  assert.equal(summary.postEndpointsAdded, false);
  assert.equal(summary.runtimeDataMutated, false);
  assert.equal(summary.boardDataMutated, false);
  assert.equal(summary.selectedResultPersistenceAttempted, false);
  assert.equal(summary.runTableGenerationAttempted, false);
  assert.equal(summary.iesGenerationAttempted, false);
  assert.equal(summary.outputGenerationEnabled, false);
  assert.equal(JSON.stringify(projects), before);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "selectorViewModel"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "envelope"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(summary, "selectedResultPersistedSummaryReadbackStatus"), false);
  assertNoUnsafeValues(summary);
});
