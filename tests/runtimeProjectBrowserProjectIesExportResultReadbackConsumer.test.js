import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserProjectIesExportResultReadbackSummary,
  createProjectBrowserService,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";

const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportResultSummary";

const SUMMARY_ALLOWED_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "projectCount",
  "readyProjectCount",
  "missingProjectCount",
  "blockedFailClosedProjectCount",
  "projectStatuses",
  "moduleId",
  "consumerModuleId",
  "targetLocation",
  "safeReadbackStatusOnly",
  "summaryOnly",
  "redacted",
  "readOnly",
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
  "projectBrowserProjectIesExportResultReadbackSummaryFingerprint",
]);

const PROJECT_STATUS_ALLOWED_KEYS = Object.freeze([
  "projectId",
  "envelopeId",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "sourceReadbackFingerprint",
]);

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "rawIesReturned",
  "rawIesExposed",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "privatePathsReturned",
  "filenamesReturned",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "iesGenerationAttempted",
  "outputGenerationEnabled",
]);

function project(projectId, envelopeId) {
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    projectId,
    envelopeId,
    title: `Saved ${projectId}`,
  };
}

function readyStatus(overrides = {}) {
  return {
    state: "ies_first_narrow_project_ies_export_result_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    iesFirstNarrowProjectIesExportResultReadbackFingerprint:
      "safe-ies-first-narrow-project-ies-export-result-readback-status:ready-fixture",
    ...overrides,
  };
}

function missingStatus(overrides = {}) {
  return {
    state: "ies_first_narrow_project_ies_export_result_readback_missing",
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: "project-ies-export-result-summary-slot-empty",
    iesFirstNarrowProjectIesExportResultReadbackFingerprint:
      "safe-ies-first-narrow-project-ies-export-result-readback-status:missing-fixture",
    ...overrides,
  };
}

function blockedStatus(overrides = {}) {
  return {
    state: "ies_first_narrow_project_ies_export_result_readback_blocked_fail_closed",
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "persisted-summary-schema-or-contract-mismatch",
    iesFirstNarrowProjectIesExportResultReadbackFingerprint:
      "safe-ies-first-narrow-project-ies-export-result-readback-status:blocked-fixture",
    ...overrides,
  };
}

function fakeStore(projects, statuses) {
  const calls = [];
  return {
    calls,
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "project-ies-export-result-readback-consumer-test-store",
        projects,
        count: projects.length,
        savedCount: projects.length,
        fixtureCount: 0,
        safeEmpty: projects.length === 0,
        save: {},
        restore: {},
        hydrate: {},
        handoffShare: {},
      };
    },
    getIesFirstNarrowProjectIesExportResultReadbackStatus(projectIdOrEnvelopeId) {
      calls.push(projectIdOrEnvelopeId);
      return statuses[projectIdOrEnvelopeId];
    },
    getProjectEnvelope() {
      throw new Error("project-browser project IES export result consumer must not read project envelopes");
    },
    getSelectedResultPersistedSummaryReadbackStatus() {
      throw new Error("project-browser project IES export result consumer must not use unrelated readback helpers");
    },
  };
}

function assertSummaryShape(summary) {
  assert.deepEqual(Object.keys(summary), SUMMARY_ALLOWED_KEYS);
  assert.equal(summary.schemaId, PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.source, "project-browser-saved-project-project-ies-export-result-readback-consumer");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.consumerModuleId, "ies_builder");
  assert.equal(summary.targetLocation, TARGET);
  assert.equal(summary.safeReadbackStatusOnly, true);
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.readOnly, true);
  assert.ok(
    summary.projectBrowserProjectIesExportResultReadbackSummaryFingerprint.startsWith(
      "safe-project-browser-project-ies-export-result-readback-summary:",
    ),
  );
  for (const flag of REQUIRED_FALSE_FLAGS) assert.equal(summary[flag], false, flag);
  for (const status of summary.projectStatuses) {
    assert.deepEqual(Object.keys(status), PROJECT_STATUS_ALLOWED_KEYS);
  }
}

function assertNoUnsafeSurface(summary) {
  const text = JSON.stringify(summary);
  for (const token of [
    "IESNA:LM-63",
    "candela-secret",
    "governance-secret",
    "project-output.ies",
    "base64-secret",
    "C:\\\\ControlStack_RuntimeData",
    "C:\\ControlStack_RuntimeData",
  ]) {
    assert.equal(text.includes(token), false, token);
  }
  for (const key of [
    "projectIesText",
    "candelaGrid",
    "governancePayload",
    "filename",
    "privatePath",
    "base64",
    "resultBody",
    "projectEnvelope",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, key), false, key);
    for (const status of summary.projectStatuses) {
      assert.equal(Object.prototype.hasOwnProperty.call(status, key), false, key);
    }
  }
}

test("project browser consumes only saved-project project IES export result readback statuses", () => {
  const projects = [
    project("ready-project", "env-ready-project"),
    project("missing-project", "env-missing-project"),
    project("blocked-project", "env-blocked-project"),
  ];
  const store = fakeStore(projects, {
    "env-ready-project": readyStatus(),
    "env-missing-project": missingStatus(),
    "env-blocked-project": blockedStatus(),
  });
  const service = createProjectBrowserService({ savedProjectStore: store });

  const snapshot = service.getProjectBrowserSnapshot({});
  const summary = snapshot.projectIesExportResultReadbackSummary;

  assertSummaryShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed);
  assert.equal(summary.readiness, "blocked_fail_closed");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.projectCount, 3);
  assert.equal(summary.readyProjectCount, 1);
  assert.equal(summary.missingProjectCount, 1);
  assert.equal(summary.blockedFailClosedProjectCount, 1);
  assert.deepEqual(store.calls, ["env-ready-project", "env-missing-project", "env-blocked-project"]);
  assert.deepEqual(
    summary.projectStatuses.map(({ projectId, readiness, ready, failClosed, blocker }) => ({
      projectId,
      readiness,
      ready,
      failClosed,
      blocker,
    })),
    [
      {
        projectId: "ready-project",
        readiness: "ready",
        ready: true,
        failClosed: false,
        blocker: null,
      },
      {
        projectId: "missing-project",
        readiness: "missing",
        ready: false,
        failClosed: true,
        blocker: "project-ies-export-result-summary-slot-empty",
      },
      {
        projectId: "blocked-project",
        readiness: "blocked_fail_closed",
        ready: false,
        failClosed: true,
        blocker: "persisted-summary-schema-or-contract-mismatch",
      },
    ],
  );
  assertNoUnsafeSurface(summary);
});

test("project browser blocks malformed result readback status without surfacing raw IES or private material", () => {
  const summary = buildProjectBrowserProjectIesExportResultReadbackSummary([
    {
      ...project("unsafe-project", "env-unsafe-project"),
      iesFirstNarrowProjectIesExportResultReadbackStatus: readyStatus({
        projectIesText: "IESNA:LM-63 project-output.ies",
        candelaGrid: "candela-secret",
        governancePayload: "governance-secret",
        filename: "project-output.ies",
        privatePath: "C:\\ControlStack_RuntimeData\\project-output.ies",
        base64: "base64-secret",
        resultBody: "raw-result-secret",
      }),
    },
  ]);

  assertSummaryShape(summary);
  assert.equal(summary.state, PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed);
  assert.equal(summary.blockedFailClosedProjectCount, 1);
  assert.equal(summary.projectStatuses[0].readiness, "blocked_fail_closed");
  assert.equal(summary.projectStatuses[0].ready, false);
  assert.equal(summary.projectStatuses[0].failClosed, true);
  assert.equal(summary.projectStatuses[0].blocker, "blocked-raw-field-projectIesText");
  assertNoUnsafeSurface(summary);
});

test("project browser fails closed when the safe result readback accessor is unavailable or throws", () => {
  const projects = [
    project("missing-accessor-project", "env-missing-accessor-project"),
    project("throwing-accessor-project", "env-throwing-accessor-project"),
  ];
  const summaryWithoutAccessor = buildProjectBrowserProjectIesExportResultReadbackSummary(projects);
  const summaryWithThrowingAccessor = buildProjectBrowserProjectIesExportResultReadbackSummary(
    projects,
    () => {
      throw new Error("private store failure C:\\ControlStack_RuntimeData\\project-output.ies");
    },
  );

  assertSummaryShape(summaryWithoutAccessor);
  assert.equal(summaryWithoutAccessor.state, PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.missing);
  assert.equal(summaryWithoutAccessor.missingProjectCount, 2);
  assert.equal(summaryWithoutAccessor.projectStatuses[0].blocker, "project-ies-export-result-readback-status-missing");
  assertNoUnsafeSurface(summaryWithoutAccessor);

  assertSummaryShape(summaryWithThrowingAccessor);
  assert.equal(summaryWithThrowingAccessor.state, PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.blockedFailClosed);
  assert.equal(summaryWithThrowingAccessor.blockedFailClosedProjectCount, 2);
  assert.equal(
    summaryWithThrowingAccessor.projectStatuses[0].blocker,
    "project-ies-export-result-readback-accessor-failed",
  );
  assertNoUnsafeSurface(summaryWithThrowingAccessor);
});

test("project IES export result browser consumer is deterministic, read-only, and adds no route or output behavior", () => {
  const projects = Object.freeze([
    Object.freeze(project("stable-project", "env-stable-project")),
  ]);
  const before = JSON.stringify(projects);
  const first = buildProjectBrowserProjectIesExportResultReadbackSummary(projects, () => readyStatus());
  const second = buildProjectBrowserProjectIesExportResultReadbackSummary(projects, () => readyStatus());

  assertSummaryShape(first);
  assert.equal(first.state, PROJECT_BROWSER_PROJECT_IES_EXPORT_RESULT_READBACK_STATES.ready);
  assert.equal(first.readiness, "ready");
  assert.equal(first.ready, true);
  assert.equal(first.failClosed, false);
  assert.equal(first.routesAdded, false);
  assert.equal(first.postEndpointsAdded, false);
  assert.equal(first.runtimeDataMutated, false);
  assert.equal(first.boardDataMutated, false);
  assert.equal(first.iesGenerationAttempted, false);
  assert.equal(first.outputGenerationEnabled, false);
  assert.equal(JSON.stringify(projects), before);
  assert.deepEqual(first, second);
  assertNoUnsafeSurface(first);
});
