import test from "node:test";
import assert from "node:assert/strict";

import {
  buildProjectBrowserProjectIesExportBoundaryReadbackSummary,
  buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary,
  createProjectBrowserService,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SOURCE,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID,
  PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/projectBrowserService.js";

const TARGET = "projectEnvelope.modules.cs_selector.downstreamContext.iesFirstNarrowProjectIesExportBoundarySummary";

const DETAIL_ALLOWED_KEYS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "owner",
  "source",
  "sourceSummarySchemaId",
  "sourceSummarySchemaVersion",
  "sourceSummaryState",
  "sourceSummaryReadiness",
  "state",
  "readiness",
  "ready",
  "failClosed",
  "blocker",
  "selectedProjectId",
  "selectedProjectFound",
  "projectId",
  "envelopeId",
  "boundaryReadbackState",
  "boundaryReadbackReadiness",
  "boundaryReadbackReady",
  "boundaryReadbackFailClosed",
  "boundaryReadbackBlocker",
  "moduleId",
  "consumerModuleId",
  "targetLocation",
  "safeReadbackStatusOnly",
  "readOnly",
  "selectedProjectOnly",
  "detailOnly",
  "summaryOnly",
  "redacted",
  "machineValueSafe",
  "sourceReadbackFingerprint",
  "sourceProjectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint",
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
  "projectBrowserSelectedProjectIesExportBoundaryReadbackDetailFingerprint",
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

function project(projectId, envelopeId, status = undefined) {
  return {
    schema: "workspace_saved_project.v2-runtime",
    owner: "shell",
    source: "p2-shell-save-envelope",
    readOnly: false,
    browserOnly: false,
    projectId,
    envelopeId,
    title: `Saved ${projectId}`,
    ...(status ? { iesFirstNarrowProjectIesExportBoundaryReadbackStatus: status } : {}),
  };
}

function readyStatus(overrides = {}) {
  return {
    state: "ies_first_narrow_project_ies_export_boundary_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint:
      "safe-ies-first-narrow-project-ies-export-boundary-readback-status:selected-detail-ready-fixture",
    ...overrides,
  };
}

function missingStatus(overrides = {}) {
  return {
    state: "ies_first_narrow_project_ies_export_boundary_readback_missing",
    readiness: "missing",
    ready: false,
    failClosed: true,
    blocker: "project-ies-export-boundary-summary-slot-empty",
    iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint:
      "safe-ies-first-narrow-project-ies-export-boundary-readback-status:selected-detail-missing-fixture",
    ...overrides,
  };
}

function blockedStatus(overrides = {}) {
  return {
    state: "ies_first_narrow_project_ies_export_boundary_readback_blocked_fail_closed",
    readiness: "blocked_fail_closed",
    ready: false,
    failClosed: true,
    blocker: "persisted-summary-schema-or-contract-mismatch",
    iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint:
      "safe-ies-first-narrow-project-ies-export-boundary-readback-status:selected-detail-blocked-fixture",
    ...overrides,
  };
}

function assertDetailShape(detail) {
  assert.deepEqual(Object.keys(detail), DETAIL_ALLOWED_KEYS);
  assert.equal(detail.schemaId, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_ID);
  assert.equal(detail.schemaVersion, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SUMMARY_SCHEMA_VERSION);
  assert.equal(detail.owner, "shell");
  assert.equal(detail.source, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_SOURCE);
  assert.equal(detail.sourceSummarySchemaId, PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID);
  assert.equal(detail.sourceSummarySchemaVersion, PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION);
  assert.equal(detail.moduleId, "cs_selector");
  assert.equal(detail.consumerModuleId, "ies_builder");
  assert.equal(detail.targetLocation, TARGET);
  assert.equal(detail.safeReadbackStatusOnly, true);
  assert.equal(detail.readOnly, true);
  assert.equal(detail.selectedProjectOnly, true);
  assert.equal(detail.detailOnly, true);
  assert.equal(detail.summaryOnly, true);
  assert.equal(detail.redacted, true);
  assert.equal(detail.machineValueSafe, true);
  assert.ok(
    detail.sourceProjectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint.startsWith(
      "safe-project-browser-project-ies-export-boundary-readback-summary:",
    ),
  );
  assert.ok(
    detail.projectBrowserSelectedProjectIesExportBoundaryReadbackDetailFingerprint.startsWith(
      "safe-project-browser-selected-project-ies-export-boundary-readback-detail-summary:",
    ),
  );
  for (const flag of REQUIRED_FALSE_FLAGS) assert.equal(detail[flag], false, flag);
}

function assertNoUnsafeSurface(detail) {
  const text = JSON.stringify(detail);
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
    "projectIes",
    "projectIesBody",
    "projectIesText",
    "iesText",
    "candela",
    "candelaGrid",
    "photometry",
    "governance",
    "governancePayload",
    "outputFiles",
    "files",
    "filename",
    "fileName",
    "filePath",
    "localPath",
    "privatePath",
    "base64",
    "projectEnvelope",
    "envelopeBody",
    "projectStatuses",
  ]) {
    assert.equal(Object.prototype.hasOwnProperty.call(detail, key), false, key);
  }
}

test("selected-project IES export boundary detail consumes the redacted aggregate summary only", () => {
  const aggregate = buildProjectBrowserProjectIesExportBoundaryReadbackSummary([
    project("ready-project", "env-ready-project", readyStatus()),
    project("other-project", "env-other-project", blockedStatus()),
  ]);

  const detail = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
    aggregate,
    "env-ready-project",
  );

  assertDetailShape(detail);
  assert.equal(detail.sourceSummaryState, PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.blockedFailClosed);
  assert.equal(detail.sourceSummaryReadiness, "blocked_fail_closed");
  assert.equal(detail.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.ready);
  assert.equal(detail.readiness, "ready");
  assert.equal(detail.ready, true);
  assert.equal(detail.failClosed, false);
  assert.equal(detail.blocker, null);
  assert.equal(detail.selectedProjectId, "env-ready-project");
  assert.equal(detail.selectedProjectFound, true);
  assert.equal(detail.projectId, "ready-project");
  assert.equal(detail.envelopeId, "env-ready-project");
  assert.equal(detail.boundaryReadbackState, PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready);
  assert.equal(detail.boundaryReadbackReadiness, "ready");
  assert.equal(detail.boundaryReadbackReady, true);
  assert.equal(detail.boundaryReadbackFailClosed, false);
  assert.equal(detail.boundaryReadbackBlocker, null);
  assert.equal(
    detail.sourceReadbackFingerprint,
    "safe-ies-first-narrow-project-ies-export-boundary-readback-status:selected-detail-ready-fixture",
  );
  assertNoUnsafeSurface(detail);
});

test("selected-project IES export boundary detail distinguishes not-selected and not-found missing states", () => {
  const aggregate = buildProjectBrowserProjectIesExportBoundaryReadbackSummary([
    project("ready-project", "env-ready-project", readyStatus()),
  ]);

  const notSelected = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(aggregate);
  const notFound = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
    aggregate,
    "env-missing-project",
  );

  assertDetailShape(notSelected);
  assert.equal(notSelected.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.missing);
  assert.equal(notSelected.readiness, "missing");
  assert.equal(notSelected.ready, false);
  assert.equal(notSelected.failClosed, true);
  assert.equal(notSelected.blocker, "project-browser-selected-project-not-selected");
  assert.equal(notSelected.selectedProjectId, null);
  assert.equal(notSelected.selectedProjectFound, false);
  assertNoUnsafeSurface(notSelected);

  assertDetailShape(notFound);
  assert.equal(notFound.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.missing);
  assert.equal(notFound.readiness, "missing");
  assert.equal(notFound.ready, false);
  assert.equal(notFound.failClosed, true);
  assert.equal(notFound.blocker, "project-browser-selected-project-not-found");
  assert.equal(notFound.selectedProjectId, "env-missing-project");
  assert.equal(notFound.selectedProjectFound, false);
  assertNoUnsafeSurface(notFound);
});

test("selected-project IES export boundary detail preserves missing and blocked fail-closed diagnostics", () => {
  const aggregate = buildProjectBrowserProjectIesExportBoundaryReadbackSummary([
    project("missing-project", "env-missing-project", missingStatus()),
    project("blocked-project", "env-blocked-project", blockedStatus()),
  ]);

  const missing = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
    aggregate,
    "env-missing-project",
  );
  const blocked = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
    aggregate,
    "env-blocked-project",
  );

  assertDetailShape(missing);
  assert.equal(missing.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.missing);
  assert.equal(missing.readiness, "missing");
  assert.equal(missing.ready, false);
  assert.equal(missing.failClosed, true);
  assert.equal(missing.blocker, "project-ies-export-boundary-summary-slot-empty");
  assert.equal(missing.boundaryReadbackReadiness, "missing");
  assert.equal(missing.boundaryReadbackFailClosed, true);
  assertNoUnsafeSurface(missing);

  assertDetailShape(blocked);
  assert.equal(blocked.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed);
  assert.equal(blocked.readiness, "blocked_fail_closed");
  assert.equal(blocked.ready, false);
  assert.equal(blocked.failClosed, true);
  assert.equal(blocked.blocker, "persisted-summary-schema-or-contract-mismatch");
  assert.equal(blocked.boundaryReadbackReadiness, "blocked_fail_closed");
  assert.equal(blocked.boundaryReadbackFailClosed, true);
  assertNoUnsafeSurface(blocked);
});

test("selected-project IES export boundary detail blocks malformed source status without projecting raw material", () => {
  const unsafeAggregate = {
    schemaId: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_ID,
    schemaVersion: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_SUMMARY_SCHEMA_VERSION,
    state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    projectStatuses: [{
      projectId: "unsafe-project",
      envelopeId: "env-unsafe-project",
      state: PROJECT_BROWSER_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATES.ready,
      readiness: "ready",
      ready: true,
      failClosed: false,
      blocker: null,
      sourceReadbackFingerprint: "safe-readback-fingerprint",
      projectIesText: "IESNA:LM-63 project-output.ies",
      candelaGrid: "candela-secret",
      governancePayload: "governance-secret",
      filename: "project-output.ies",
      privatePath: "C:\\ControlStack_RuntimeData\\project-output.ies",
      base64: "base64-secret",
      outputGenerationEnabled: true,
    }],
    projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint:
      "safe-project-browser-project-ies-export-boundary-readback-summary:unsafe-fixture",
  };

  const detail = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
    unsafeAggregate,
    "env-unsafe-project",
  );

  assertDetailShape(detail);
  assert.equal(detail.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.blockedFailClosed);
  assert.equal(detail.readiness, "blocked_fail_closed");
  assert.equal(detail.ready, false);
  assert.equal(detail.failClosed, true);
  assert.equal(detail.blocker, "blocked-raw-field-projectIesText");
  assert.equal(detail.selectedProjectFound, true);
  assertNoUnsafeSurface(detail);
});

test("project-browser snapshot derives selected detail from one safe readback pass and never opens envelopes", () => {
  const projects = Object.freeze([
    Object.freeze(project("ready-project", "env-ready-project")),
    Object.freeze(project("missing-project", "env-missing-project")),
  ]);
  const statuses = {
    "env-ready-project": readyStatus(),
    "env-missing-project": missingStatus(),
  };
  const calls = [];
  const store = {
    getStoreSnapshot() {
      return {
        owner: "shell",
        status: "fake-store-snapshot",
        source: "selected-project-ies-export-boundary-detail-test-store",
        projects,
        count: projects.length,
        savedCount: projects.length,
        fixtureCount: 0,
        safeEmpty: false,
        save: {},
        restore: {},
        hydrate: {},
        handoffShare: {},
      };
    },
    getIesFirstNarrowProjectIesExportBoundaryReadbackStatus(projectIdOrEnvelopeId) {
      calls.push(projectIdOrEnvelopeId);
      return statuses[projectIdOrEnvelopeId];
    },
    getProjectEnvelope() {
      throw new Error("selected-project IES export boundary detail consumer must not open envelopes");
    },
    saveCurrentProjectEnvelope() {
      throw new Error("selected-project IES export boundary detail consumer must not mutate project state");
    },
    restoreProjectEnvelope() {
      throw new Error("selected-project IES export boundary detail consumer must not restore project state");
    },
    prepareHandoffSharePackage() {
      throw new Error("selected-project IES export boundary detail consumer must not prepare output paths");
    },
  };
  const service = createProjectBrowserService({
    savedProjectStore: store,
    projectService: {
      restoreProjectFromEnvelope() {
        throw new Error("selected-project IES export boundary detail consumer must not invoke restore paths");
      },
      recordHandoffSharePackage() {
        throw new Error("selected-project IES export boundary detail consumer must not invoke output paths");
      },
    },
    eventBus: {
      emit() {
        throw new Error("read-only project-browser snapshot must not emit events");
      },
    },
  });

  const snapshot = service.getProjectBrowserSnapshot({
    projectEnvelope: {
      projectIesText: "IESNA:LM-63 project-output.ies",
      candelaGrid: "candela-secret",
    },
  });
  const detail = snapshot.selectedProjectIesExportBoundaryReadbackDetailSummary;

  assertDetailShape(detail);
  assert.equal(detail.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.missing);
  assert.equal(detail.blocker, "project-browser-selected-project-not-selected");
  assert.equal(
    detail.sourceProjectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint,
    snapshot.projectIesExportBoundaryReadbackSummary.projectBrowserProjectIesExportBoundaryReadbackSummaryFingerprint,
  );
  assert.deepEqual(calls, ["env-ready-project", "env-missing-project"]);
  assertNoUnsafeSurface(detail);
});

test("selected-project IES export boundary detail is deterministic and does not mutate source summaries", () => {
  const aggregate = Object.freeze(buildProjectBrowserProjectIesExportBoundaryReadbackSummary([
    Object.freeze(project("stable-project", "env-stable-project", readyStatus())),
  ]));
  const before = JSON.stringify(aggregate);

  const first = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
    aggregate,
    "env-stable-project",
  );
  const second = buildProjectBrowserSelectedProjectIesExportBoundaryReadbackDetailSummary(
    aggregate,
    "env-stable-project",
  );

  assertDetailShape(first);
  assert.equal(first.state, PROJECT_BROWSER_SELECTED_PROJECT_IES_EXPORT_BOUNDARY_READBACK_DETAIL_STATES.ready);
  assert.equal(first.routesAdded, false);
  assert.equal(first.postEndpointsAdded, false);
  assert.equal(first.runtimeDataMutated, false);
  assert.equal(first.boardDataMutated, false);
  assert.equal(first.iesGenerationAttempted, false);
  assert.equal(first.outputGenerationEnabled, false);
  assert.equal(JSON.stringify(aggregate), before);
  assert.deepEqual(first, second);
  assertNoUnsafeSurface(first);
});
