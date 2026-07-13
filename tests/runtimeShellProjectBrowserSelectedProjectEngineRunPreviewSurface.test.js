import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildShellProjectBrowserSelectedProjectEngineRunPreview,
  SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js";
import {
  getShellProjectBrowserSelectedProjectExportAction,
  prepareShellProjectBrowserSelectedProjectExportsWorkflow,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const SOURCE_SCHEMA_ID =
  "controlstack.runtime.project-browser.selected-project-engine-run-readiness-readback-summary.v1";
const PROJECT_ID = "engine-run-preview-project";
const ENVELOPE_ID = "env-engine-run-preview-project";

const REQUIRED_FALSE_SOURCE_FLAGS = Object.freeze([
  "runTableRowsIncluded",
  "engineExecutionEnabled",
  "engineExecutionAttempted",
  "selectedResultCreated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "runTableGenerationAttempted",
  "outputGenerated",
  "outputGenerationEnabled",
  "routesAdded",
  "postEndpointsAdded",
  "runtimeDataMutated",
  "boardDataMutated",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawSelectedPayloadReturned",
  "runTableRowsReturned",
  "rawRunTableRowsReturned",
  "rawCandidateOutputReturned",
  "rawIesReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "governancePayloadReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "privatePathsReturned",
]);

const REQUIRED_FALSE_PREVIEW_FLAGS = Object.freeze([
  "engineActionAvailable",
  "engineActionEnabled",
  "engineExecutionRequested",
  "engineExecutionAttempted",
  "rawEnginePayloadExposed",
  "runRowsExposed",
  "exactElectricalValuesExposed",
  "placementCoordinatesExposed",
  "privateDataExposed",
  "projectEnvelopeExposed",
  "fingerprintsExposed",
  "routesAdded",
  "postEndpointsAdded",
  "persistenceMutated",
  "runtimeDataMutated",
  "filesystemWriteAttempted",
]);

const PROHIBITED_PROJECTION_KEYS = Object.freeze([
  "enginePayload",
  "selectorPayload",
  "runs",
  "runRows",
  "sourceRows",
  "runKey",
  "rowKey",
  "boards",
  "segments",
  "zones",
  "drivers",
  "gearTrays",
  "reservations",
  "clipPoints",
  "suspensionPoints",
  "electricalValues",
  "placementCoordinates",
  "engineVerificationEvidence",
  "projectEnvelope",
  "downstreamContext",
  "fingerprint",
  "governance",
  "mutationLog",
  "privatePath",
  "filename",
  "url",
  "blob",
  "base64",
]);

function readySourceSummary(overrides = {}) {
  return Object.freeze({
    schemaId: SOURCE_SCHEMA_ID,
    schemaVersion: 1,
    owner: "shell",
    source: "project-browser-selected-project-engine-run-readiness-readback",
    state: "project_browser_selected_project_engine_run_readiness_readback_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    selectedProjectId: ENVELOPE_ID,
    selectedProjectFound: true,
    projectId: PROJECT_ID,
    envelopeId: ENVELOPE_ID,
    selectedResultSummaryPresent: true,
    runTableFirstNarrowOutputSummaryPresent: true,
    selectedResultReadbackState: "selected_result_persisted_summary_readback_ready",
    selectedResultReadbackReadiness: "ready",
    selectedResultReadbackReady: true,
    selectedResultReadbackFailClosed: false,
    selectedResultReadbackBlocker: null,
    runTableFirstNarrowOutputHandoffContractReady: true,
    acceptedSelectedResultAuthorityState: "accepted_selected_result_authority",
    authorityStatesAligned: true,
    fingerprintsAligned: true,
    engineRunReadinessReadbackReady: true,
    runTableRowCount: 3,
    selectedProjectOnly: true,
    summaryOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    redacted: true,
    machineValueSafe: true,
    policyFingerprint: "safe-policy:engine-run-preview",
    sourceFingerprint: "safe-source:engine-run-preview",
    projectBrowserSelectedProjectEngineRunReadinessReadbackSummaryFingerprint:
      "safe-project-browser-selected-project-engine-run-readiness-readback-summary:engine-run-preview",
    ...Object.fromEntries(REQUIRED_FALSE_SOURCE_FLAGS.map((key) => [key, false])),
    ...overrides,
  });
}

function assertSafePreview(preview) {
  assert.equal(Object.isFrozen(preview), true);
  assert.deepEqual(
    Object.keys(preview),
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_FIELD_ORDER,
  );
  assert.equal(preview.selectedProjectOnly, true);
  assert.equal(preview.previewOnly, true);
  assert.equal(preview.diagnosticOnly, true);
  assert.equal(preview.readOnly, true);
  assert.equal(preview.redacted, true);
  assert.equal(preview.machineValueSafe, true);
  assert.equal(preview.nonInteractive, true);
  for (const key of REQUIRED_FALSE_PREVIEW_FLAGS) assert.equal(preview[key], false, key);
  for (const key of PROHIBITED_PROJECTION_KEYS) {
    assert.equal(Object.prototype.hasOwnProperty.call(preview, key), false, key);
  }
  const serialised = JSON.stringify(preview);
  for (const token of [
    "IESNA:LM-63",
    "engine-payload-secret",
    "electrical-secret",
    "placement-secret",
    "governance-secret",
    "mutation-secret",
    "C:\\ControlStack_RuntimeData",
    "candidate-output.ies",
    "blob:secret",
    "data:text/plain;base64",
  ]) {
    assert.equal(serialised.includes(token), false, token);
  }
}

test("selected-project engine-run preview projects only approved aggregate readiness fields", () => {
  const preview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary(),
    ENVELOPE_ID,
  );

  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-SELECTED-PROJECT-ENGINE-RUN-PREVIEW-SURFACE-1",
  );
  assert.equal(
    preview.schemaId,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_ID,
  );
  assert.equal(
    preview.schemaVersion,
    SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SCHEMA_VERSION,
  );
  assert.equal(preview.contractId, SHELL_PROJECT_BROWSER_FIRST_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_SURFACE_CONTRACT_ID);
  assert.equal(preview.owner, "shell");
  assert.equal(preview.surfaceId, "selected-project-engine-run-readiness");
  assert.equal(preview.label, "Engine run readiness");
  assert.equal(preview.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.ready);
  assert.equal(preview.readiness, "ready");
  assert.equal(preview.ready, true);
  assert.equal(preview.failClosed, false);
  assert.equal(preview.blocker, null);
  assert.equal(preview.selectedProjectId, ENVELOPE_ID);
  assert.equal(preview.selectedProjectFound, true);
  assert.equal(preview.sourceSummaryPresent, true);
  assert.equal(preview.engineRunReadinessSummaryPresent, true);
  assert.equal(preview.engineRunReadinessBoundaryReady, true);
  assert.equal(preview.selectedResultAvailable, true);
  assert.equal(preview.selectedResultAccepted, true);
  assert.equal(preview.engineVerified, true);
  assert.equal(preview.runCount, 3);
  assert.equal(preview.acceptedRunCount, 3);
  assert.equal(preview.engineVerifiedRunCount, 3);
  assertSafePreview(preview);
});

test("engine-run preview stays missing or blocked fail-closed for missing cross-project malformed or unsafe summaries", () => {
  const missing = buildShellProjectBrowserSelectedProjectEngineRunPreview(null, ENVELOPE_ID);
  const crossProject = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary(),
    "env-other-project",
  );
  const malformed = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary({ schemaVersion: 2 }),
    ENVELOPE_ID,
  );
  const unsafe = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary({
      rawEnginePayloadReturned: true,
      enginePayload: "engine-payload-secret",
      privatePath: "C:\\ControlStack_RuntimeData\\candidate-output.ies",
    }),
    ENVELOPE_ID,
  );

  assert.equal(missing.state, SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.missing);
  assert.equal(missing.readiness, "missing");
  assert.equal(missing.ready, false);
  assert.equal(missing.failClosed, true);
  assert.equal(missing.sourceSummaryPresent, false);
  assert.equal(missing.engineRunReadinessSummaryPresent, false);

  for (const preview of [crossProject, malformed, unsafe]) {
    assert.equal(
      preview.state,
      SHELL_PROJECT_BROWSER_SELECTED_PROJECT_ENGINE_RUN_PREVIEW_STATES.blockedFailClosed,
    );
    assert.equal(preview.readiness, "blocked_fail_closed");
    assert.equal(preview.ready, false);
    assert.equal(preview.failClosed, true);
    assert.equal(preview.selectedProjectFound, false);
    assert.equal(preview.engineRunReadinessBoundaryReady, false);
    assert.equal(preview.selectedResultAvailable, false);
    assert.equal(preview.selectedResultAccepted, false);
    assert.equal(preview.engineVerified, false);
    assert.equal(preview.runCount, 0);
    assert.equal(preview.acceptedRunCount, 0);
    assert.equal(preview.engineVerifiedRunCount, 0);
  }

  assert.equal(crossProject.blocker, "selected-project-engine-run-preview-project-mismatch");
  assert.equal(malformed.blocker, "selected-project-engine-run-preview-source-blocked");
  assert.equal(unsafe.blocker, "selected-project-engine-run-preview-source-blocked");
  for (const preview of [missing, crossProject, malformed, unsafe]) assertSafePreview(preview);
});

test("shell renders Engine run readiness as a non-interactive Project Browser preview", async () => {
  const [shellSource, styleSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/styles.css", import.meta.url), "utf8"),
  ]);

  for (const symbol of [
    "Engine run readiness",
    "projectBrowserSelectedProjectEngineRunPreview",
    "appendProjectBrowserSelectedProjectEngineRunPreviewField",
    "renderProjectBrowserSelectedProjectEngineRunPreview",
    "Redacted selected-project engine-run readiness summary.",
    "No selected-project engine-run readiness preview is available.",
    "Engine-run readiness preview is blocked fail-closed.",
    "Selected result available",
    "Selected result accepted",
    "Engine verified",
    "Runs",
    "Accepted runs",
    "Engine-verified runs",
    "Preview only, redacted, selected-project-only, diagnostic, and non-interactive. No Engine action is available from this surface.",
  ]) {
    assert.equal(shellSource.includes(symbol), true, symbol);
  }

  const rendererStart = shellSource.indexOf(
    "function renderProjectBrowserSelectedProjectEngineRunPreview(preview)",
  );
  const rendererEnd = shellSource.indexOf("function renderProjectBrowser({ context })", rendererStart);
  const rendererSource = shellSource.slice(rendererStart, rendererEnd);
  assert.ok(rendererStart >= 0);
  assert.ok(rendererEnd > rendererStart);
  assert.doesNotMatch(rendererSource, /createElement\("button"\)/);
  assert.doesNotMatch(rendererSource, /createElement\("a"\)/);
  assert.doesNotMatch(rendererSource, /addEventListener|onclick|href|actionId|preparedAction/);
  assert.doesNotMatch(rendererSource, /enginePayload|selectorPayload|runRows|electrical|coordinates|fingerprint/i);

  assert.match(styleSource, /\.cs-shell__project-browser-engine-run-preview\s*\{/);
  assert.match(styleSource, /\.cs-shell__project-browser-engine-run-preview-fields\s*\{/);
});

test("engine-run preview does not widen the selected-project export workflow", async () => {
  const workflow = await prepareShellProjectBrowserSelectedProjectExportsWorkflow({
    context: {
      projectBrowser: {
        selectedProjectId: ENVELOPE_ID,
        projects: [{
          projectId: PROJECT_ID,
          envelopeId: ENVELOPE_ID,
          title: "Engine run preview project",
        }],
        selectedProjectEngineRunReadinessReadbackSummary: readySourceSummary(),
      },
    },
    services: {},
  });
  const workflowSource = await readFile(
    new URL(
      "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
      import.meta.url,
    ),
    "utf8",
  );

  assert.equal(workflow.exportItemCount, 1);
  assert.deepEqual(workflow.outputs.map((output) => output.exportId), ["project-ies"]);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "engine-run"), null);
  assert.equal(getShellProjectBrowserSelectedProjectExportAction(workflow, "run"), null);
  assert.equal(Object.hasOwn(workflow, "engineRunPreview"), false);
  assert.equal(workflowSource.includes("selectedProjectEngineRunReadinessReadbackSummary"), false);
  assert.equal(workflowSource.includes("projectBrowserSelectedProjectEngineRunPreview"), false);
  assert.equal(workflowSource.includes("Engine run readiness"), false);
});

test("engine-run preview source and shell contracts remain selected-project-only and mutation-free", async () => {
  const [previewSource, shellSource] = await Promise.all([
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectEngineRunPreview.js",
        import.meta.url,
      ),
      "utf8",
    ),
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
  ]);

  assert.equal(previewSource.includes("packages/workspace-kernel"), false);
  assert.equal(previewSource.includes("projectBrowserSelectedProjectExportsWorkflow"), false);
  assert.doesNotMatch(previewSource, /\bfetch\s*\(|XMLHttpRequest|WebSocket|writeFile|appendFile|mkdir|unlink/);
  assert.doesNotMatch(previewSource, /createElement|addEventListener|click\s*\(/);
  assert.match(
    shellSource,
    /buildShellProjectBrowserSelectedProjectEngineRunPreview\(\s*browser\.selectedProjectEngineRunReadinessReadbackSummary,\s*browser\.selectedProjectId,\s*\)/,
  );
  assert.doesNotMatch(
    shellSource,
    /buildShellProjectBrowserSelectedProjectEngineRunPreview\([^)]*(?:services|engine|runTable|RuntimeData)/,
  );

  const preview = buildShellProjectBrowserSelectedProjectEngineRunPreview(
    readySourceSummary(),
    ENVELOPE_ID,
  );
  for (const key of REQUIRED_FALSE_PREVIEW_FLAGS) assert.equal(preview[key], false, key);
  assertSafePreview(preview);
});
