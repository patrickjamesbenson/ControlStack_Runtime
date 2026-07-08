import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary,
  createProjectBrowserService,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/savedProjectStore.js";
import {
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_ID,
  SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_STATUS_SCHEMA_VERSION,
} from "../packages/workspace-kernel/selectedResultPersistedSummaryReadbackStatus.js";

const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.selectedResultSummary";

const DETAIL_ALLOWED_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "sourceSchemaId",
  "sourceSchemaVersion",
  "sourceState",
  "sourceReadiness",
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
  "readOnly",
  "detailOnly",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceSelectedResultPersistedSummaryReadbackFingerprint",
  "projectBrowserSelectedResultPersistedSummaryReadbackDetailFingerprint",
]);

function readyReadbackStatus(overrides = {}) {
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
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:detail-ready-fixture",
    ...overrides,
  };
}

function blockedReadbackStatus(overrides = {}) {
  return readyReadbackStatus({
    state: "selected_result_persisted_summary_readback_blocked_fail_closed",
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "summary-field-not-allow-listed-raw-field",
    selectedResultPersistedSummaryReadbackFingerprint: "safe-selected-result-persisted-summary-readback-status:detail-blocked-fixture",
    ...overrides,
  });
}

function fakeStore(envelope = null) {
  return {
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "detail-consumer-test-store",
        projects: [],
        count: 0,
        savedCount: 0,
        fixtureCount: 0,
        safeEmpty: true,
        save: {},
        restore: {},
        hydrate: {},
        handoffShare: {},
      };
    },
    getProjectEnvelope(projectId) {
      return envelope && (projectId === envelope.envelopeId || projectId === envelope.projectId) ? envelope : null;
    },
  };
}

function assertDetailShape(summary) {
  assert.deepEqual(Object.keys(summary), DETAIL_ALLOWED_KEYS);
  assert.equal(summary.schemaId, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID);
  assert.equal(summary.schemaVersion, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.sourceSchemaId, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_ID);
  assert.equal(summary.sourceSchemaVersion, SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_PROJECT_SUMMARY_SCHEMA_VERSION);
  assert.equal(summary.owner, "shell");
  assert.equal(summary.slotOwner, "shell");
  assert.equal(summary.envelopeOwner, "shell");
  assert.equal(summary.moduleId, "cs_selector");
  assert.equal(summary.targetLocation, TARGET);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.detailOnly, true);
  assert.equal(summary.summaryOnly, true);
  assert.equal(summary.redacted, true);
  assert.equal(summary.machineValueSafe, true);
  assert.ok(summary.projectBrowserSelectedResultPersistedSummaryReadbackDetailFingerprint.startsWith("safe-project-browser-selected-result-persisted-summary-readback-detail-summary:"));
}

function assertNoUnsafeDetailValues(summary) {
  const text = JSON.stringify(summary);
  for (const unsafeToken of [
    "selectedResultBody",
    "rawEngineResult",
    "selectedResultPayload",
    "runTableRows",
    "iesText",
    "photometry",
    "candela",
    "base64",
    "secret-token",
    "credential-value",
    "runtime-output.ies",
  ]) {
    assert.equal(text.includes(unsafeToken), false, unsafeToken);
  }
  for (const unsafeKey of [
    "reason",
    "filename",
    "path",
    "credentials",
    "generationFlags",
    "rawSelectedPayloadReturned",
    "runTableGenerationAttempted",
    "iesGenerationAttempted",
    "outputGenerationEnabled",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(summary, unsafeKey), false, unsafeKey);
  }
}

test("project-browser detail summary wraps only the compact project-summary readback consumer", () => {
  const summary = buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(readyReadbackStatus());

  assertDetailShape(summary);
  assert.equal(summary.sourceState, "selected_result_persisted_summary_readback_ready");
  assert.equal(summary.sourceReadiness, "ready");
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready);
  assert.equal(summary.readiness, "ready");
  assert.equal(summary.ready, true);
  assert.equal(summary.failClosed, false);
  assert.equal(summary.blocker, null);
  assert.equal(summary.summaryPresent, true);
  assert.equal(summary.summarySchemaId, "controlstack.runtime.selected-result-persisted-summary.v1");
  assert.equal(summary.summarySchemaVersion, 1);
  assert.equal(summary.summaryState, "redacted_selected_result_summary_persisted");
  assert.equal(
    summary.sourceSelectedResultPersistedSummaryReadbackFingerprint,
    "safe-selected-result-persisted-summary-readback-status:detail-ready-fixture",
  );
  assertNoUnsafeDetailValues(summary);
});

test("inspectProject attaches detail-only selected-result readback summary to accepted inspect payloads only", () => {
  const envelope = {
    ...readyReadbackStatus(),
    projectId: "detail-ready-project",
    envelopeId: "env-detail-ready-project",
    readOnly: false,
    browserOnly: false,
  };
  const service = createProjectBrowserService({ savedProjectStore: fakeStore(envelope) });

  const result = service.inspectProject("env-detail-ready-project", {});

  assert.equal(result.accepted, true);
  assertDetailShape(result.selectedResultPersistedSummaryReadbackDetailSummary);
  assert.equal(
    result.selectedResultPersistedSummaryReadbackDetailSummary.state,
    PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.ready,
  );
  assert.equal(
    Object.prototype.hasOwnProperty.call(result.browser, "selectedResultPersistedSummaryReadbackDetailSummary"),
    false,
  );
  assertNoUnsafeDetailValues(result.selectedResultPersistedSummaryReadbackDetailSummary);
});

test("missing inspect rejection includes a missing fail-closed detail summary built from an empty source", () => {
  const service = createProjectBrowserService({ savedProjectStore: fakeStore(null) });

  const result = service.inspectProject("missing-detail-project", {});
  const summary = result.selectedResultPersistedSummaryReadbackDetailSummary;

  assert.equal(result.accepted, false);
  assertDetailShape(summary);
  assert.equal(summary.sourceState, "selected_result_persisted_summary_readback_missing");
  assert.equal(summary.sourceReadiness, "missing");
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.missing);
  assert.equal(summary.readiness, "missing");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.summaryPresent, false);
  assert.equal(summary.summarySchemaId, null);
  assert.equal(summary.summarySchemaVersion, null);
  assert.equal(summary.summaryState, null);
  assert.equal(summary.blocker, "selected-result-persisted-summary-envelope-missing");
  assertNoUnsafeDetailValues(summary);
});

test("detail summary blocks fail-closed without surfacing raw payloads, envelope bodies, paths, or generation flags", () => {
  const summary = buildProjectBrowserSelectedResultPersistedSummaryReadbackDetailSummary(blockedReadbackStatus({
    reason: "runtime-output.ies credential-value",
    selectedResultBody: { rawEngineResult: "secret-token" },
    selectedResultPayload: "selectedResultPayload",
    envelopeBody: { unsafe: true },
    runTableRows: [{ unsafe: true }],
    iesText: "iesText",
    photometry: "photometry",
    candela: [1, 2, 3],
    filename: "runtime-output.ies",
    credentials: "credential-value",
    runTableGenerationAttempted: true,
    iesGenerationAttempted: true,
    outputGenerationEnabled: true,
  }));

  assertDetailShape(summary);
  assert.equal(summary.sourceState, "selected_result_persisted_summary_readback_blocked_fail_closed");
  assert.equal(summary.sourceReadiness, "blocked_fail_closed");
  assert.equal(summary.state, PROJECT_BROWSER_SELECTED_RESULT_PERSISTED_SUMMARY_READBACK_DETAIL_STATES.blockedFailClosed);
  assert.equal(summary.readiness, "blocked_fail_closed");
  assert.equal(summary.ready, false);
  assert.equal(summary.failClosed, true);
  assert.equal(summary.blocker, "summary-field-not-allow-listed-raw-field");
  assertNoUnsafeDetailValues(summary);
});
