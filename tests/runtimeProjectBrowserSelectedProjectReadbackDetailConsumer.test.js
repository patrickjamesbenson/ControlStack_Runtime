import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary,
  createProjectBrowserService,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_DETAIL_SOURCE,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistedSummaryReadbackStatus.js";

const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

const SELECTED_PROJECT_DETAIL_ALLOWED_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "sourceStatusSchemaId",
  "sourceStatusSchemaVersion",
  "sourceStatusState",
  "sourceStatusReadiness",
  "sourceDetailSchemaId",
  "sourceDetailSchemaVersion",
  "sourceDetailState",
  "sourceDetailReadiness",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "summaryPresent",
  "summarySchemaId",
  "summarySchemaVersion",
  "summaryState",
  "slotOwner",
  "envelopeOwner",
  "moduleId",
  "targetLocation",
  "readOnly",
  "selectedProjectOnly",
  "detailOnly",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceSelectedProjectReadbackFingerprint",
  "sourceSelectedProjectReadbackStatusFingerprint",
  "sourceSelectedProjectReadbackDetailFingerprint",
  "projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailFingerprint",
]);

function readyReadback(overrides = {}) {
  return {
    schemaId: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
    state: "selected_result_persisted_summary_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    summaryPresent: true,
    summarySchemaId: "controlstack.runtime.selected-result-persisted-summary.v1",
    summarySchemaVersion: 1,
    summaryState: "redacted_selected_result_summary_persisted",
    owner: "shell",
    slotOwner: "shell",
    envelopeOwner: "shell",
    moduleId: "cs_selector",
    targetLocation: TARGET,
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:selected-project-detail-ready-fixture",
    ...overrides,
  };
}

function blockedReadback(overrides = {}) {
  return readyReadback({
    state: "selected_result_persisted_summary_readback_blocked_fail_closed",
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "summary-field-not-allow-listed-raw-field",
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:selected-project-detail-blocked-fixture",
    ...overrides,
  });
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
        source: "selected-project-detail-test-store",
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
      throw new Error("selected-project detail consumer must not inspect envelopes");
    },
    getSelectedResultPersistedSummaryReadbackStatus() {
      throw new Error("selected-project detail consumer must not invoke readback helpers");
    },
    saveCurrentProjectEnvelope() {
      throw new Error("selected-project detail consumer must not save or mutate state");
    },
    restoreProjectEnvelope() {
      throw new Error("selected-project detail consumer must not restore or mutate state");
    },
    prepareHandoffSharePackage() {
      throw new Error("selected-project detail consumer must not prepare output paths");
    },
    ...extra,
  };
}

function assertSelectedProjectDetailShape(summary) {
  assert.deepEqual(Object.keys(summary), SELECTED_PROJECT_DETAIL_ALLOWED_KEYS);
  assert.equal(summary.schemaId, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.source, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_READBACK_DETAIL_SOURCE);
  assert.equal(summary.sourceStatusSchemaId, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID);
  assert.equal(summary.sourceStatusSchemaVersion, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION);
  assert.equal(summary.sourceDetailSchemaId, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID);
  assert.equal(summary.sourceDetailSchemaVersion, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.targetLocation, TARGET);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.selectedProjectOnly, true);
  assert.equal(summary.detailOnly, true);
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.ok(summary.sourceSelectedProjectReadbackStatusFingerprint.startsWith("safe-project-browser-selected-project-selected-result-persisted-summary-readback-status:"));
  assert.ok(summary.sourceSelectedProjectReadbackDetailFingerprint.startsWith("safe-project-browser-selected-result-persisted-summary-readback-detail-summary:"));
  assert.ok(
    summary.projectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailFingerprint.startsWith(
      "safe-project-browser-selected-project-selected-result-persisted-summary-readback-detail-summary:",
    ),
  );
}

function assertNoUnsafeValues(summary) {
  const text = JSON.stringify(summary);
  for (const unsafeToken of [
    "secret-token",
    "selectedResultPayload-secret",
    "raw-engine-secret",
    "runtime-output.ies",
    "credential-value",
    "selectedResultBody",
    "rawEngineResult",
    "runTableRows",
    "photometry",
    "candela",
    "base64",
    "C:\\\\ControlStack_Runtime",
    "C:\\ControlStack_Runtime",
  ]) {
    assert.equal(text.includes(unsafeToken), false, unsafeToken);
  }
  for (const unsafeKey of [
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
    "reason",
    "filename",
    "fileName",
    "localPath",
    "privatePath",
    "credentials",
    "downstreamContext",
    "moduleState",
    "envelope",
    "projectEnvelope",
    "storeSnapshot",
    "selectedResultPayload",
    "rawEnginePayload",
    "selectorViewModel",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, unsafeKey), false, unsafeKey);
  }
}

test("selected-project detail summary comes from project summaries only", () => {
  const projects = [
    savedProjectSummary("ready-project", "env-ready-project", readyReadback()),
    savedProjectSummary("other-project", "env-other-project", blockedReadback()),
  ];

  const summary = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary(
    projects,
    "env-ready-project",
  );

  assertSelectedProjectDetailShape(summary);
  assert.equal(summary.sourceStatusState, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.ready);
  assert.equal(summary.sourceStatusReadiness, "ready");
  assert.equal(summary.sourceDetailState, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready);
  assert.equal(summary.sourceDetailReadiness, "ready");
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready);
  assert.equal(summary.readiness, "ready");
  assert.equal(summary.ready, true);
  assert.equal(summary.failClosed, false);
  assert.equal(summary.blocker, null);
  assert.equal(summary.selectedProjectId, "env-ready-project");
  assert.equal(summary.selectedProjectFound, true);
  assert.equal(summary.summaryPresent, true);
  assert.equal(summary.summarySchemaId, "controlstack.runtime.selected-result-persisted-summary.v1");
  assert.equal(summary.summarySchemaVersion, 1);
  assert.equal(summary.summaryState, "redacted_selected_result_summary_persisted");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.envelopeOwner, "shell");
  assert.equal(
    summary.sourceSelectedProjectReadbackFingerprint,
    "safe-selected-result-persisted-summary-readback-status:selected-project-detail-ready-fixture",
  );
  assertNoUnsafeValues(summary);
});

test("selected-project detail is missing fail-closed when no project is selected", () => {
  const projects = [savedProjectSummary("ready-project", "env-ready-project", readyReadback())];
  const service = createProjectBrowserService({ savedProjectStore: fakeStore(projects) });

  const snapshot = service.getProjectBrowserSnapshot({});
  const summary = snapshot.selectedProjectSelectedResultPersistedSummaryReadbackDetailSummary;

  assertSelectedProjectDetailShape(summary);
  assert.equal(summary.sourceStatusState, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(summary.sourceStatusReadiness, "missing");
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing);
  assert.equal(summary.readiness, "missing");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.blocker, "project-browser-selected-project-not-selected");
  assert.equal(summary.selectedProjectId, null);
  assert.equal(summary.selectedProjectFound, false);
  assert.equal(summary.summaryPresent, false);
  assertNoUnsafeValues(summary);
});

test("selected-project detail is missing fail-closed when selected project is not found", () => {
  const projects = [savedProjectSummary("ready-project", "env-ready-project", readyReadback())];

  const summary = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary(
    projects,
    "env-missing-project",
  );

  assertSelectedProjectDetailShape(summary);
  assert.equal(summary.sourceStatusState, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.missing);
  assert.equal(summary.sourceStatusReadiness, "missing");
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing);
  assert.equal(summary.readiness, "missing");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.blocker, "project-browser-selected-project-not-found");
  assert.equal(summary.selectedProjectId, "env-missing-project");
  assert.equal(summary.selectedProjectFound, false);
  assert.equal(summary.summaryPresent, false);
  assertNoUnsafeValues(summary);
});

test("selected-project detail blocks fail-closed from malformed project-summary readback without surfacing raw fields", () => {
  const projects = [
    savedProjectSummary("malformed-project", "env-malformed-project", readyReadback({
      rawEnginePayload: "raw-engine-secret",
      selectedResultPayload: "selectedResultPayload-secret",
      selectedResultBody: { rawEngineResult: "secret-token" },
      runTableRows: [{ unsafe: true }],
      iesText: "runtime-output.ies",
      photometry: "photometry",
      candela: [1, 2, 3],
      base64: "base64",
      credentials: "credential-value",
      privatePath: "C:\\ControlStack_Runtime\\runtime-output.ies",
      reason: "runtime-output.ies credential-value",
      runTableGenerationAttempted: true,
      iesGenerationAttempted: true,
      outputGenerationEnabled: true,
    })),
  ];

  const summary = buildProjectBrowserSelectedProjectSelectedResultPersistedSummaryReadbackDetailSummary(
    projects,
    "env-malformed-project",
  );

  assertSelectedProjectDetailShape(summary);
  assert.equal(summary.sourceStatusState, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_STATES.blockedFailClosed);
  assert.equal(summary.sourceStatusReadiness, "blocked_fail_closed");
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed);
  assert.equal(summary.readiness, "blocked_fail_closed");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.blocker, "blocked-raw-field-rawEnginePayload");
  assert.equal(summary.selectedProjectId, "env-malformed-project");
  assert.equal(summary.selectedProjectFound, true);
  assert.equal(
    summary.sourceSelectedProjectReadbackFingerprint,
    "safe-selected-result-persisted-summary-readback-status:selected-project-detail-ready-fixture",
  );
  assertNoUnsafeValues(summary);
});

test("selected-project detail consumer does not inspect envelopes, invoke selector view-models, add routes, or mutate state", () => {
  const project = Object.freeze(savedProjectSummary("stable-project", "env-stable-project", readyReadback()));
  const projects = Object.freeze([project]);
  const before = JSON.stringify(projects);
  const service = createProjectBrowserService({
    savedProjectStore: fakeStore(projects),
    projectService: {
      restoreProjectFromEnvelope() {
        throw new Error("selector or restore view-model path must not be invoked by selected-project detail consumer");
      },
      recordHandoffSharePackage() {
        throw new Error("handoff or output path must not be invoked by selected-project detail consumer");
      },
    },
    eventBus: {
      emit() {
        throw new Error("selected-project detail snapshot consumer must not emit events");
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
  const summary = snapshot.selectedProjectSelectedResultPersistedSummaryReadbackDetailSummary;

  assertSelectedProjectDetailShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_PROJECT_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing);
  assert.equal(summary.selectedProjectOnly, true);
  assert.equal(summary.detailOnly, true);
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.readOnly, true);
  assert.equal(JSON.stringify(projects), before);
  assert.equal(Object.prototype.hasOwnProperty.call(snapshot, "selectedResultPersistedSummaryReadbackDetailSummary"), false);
  assertNoUnsafeValues(summary);
});
