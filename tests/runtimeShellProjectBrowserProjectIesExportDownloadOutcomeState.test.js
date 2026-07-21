import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createShellProjectBrowserProjectIesExportDownloadOutcomeState,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

function safeStartedReceipt(overrides = {}) {
  return Object.freeze({
    downloadTriggered: true,
    failClosed: false,
    blocker: null,
    downloadMetadata: Object.freeze({
      filename: "controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies",
      mediaType: "application/octet-stream",
      extension: ".ies",
      byteLength: 321,
      contentFingerprint: `safe-content:${"a".repeat(40)}`,
      sourceResultReadbackFingerprint: `safe-readback:${"b".repeat(40)}`,
    }),
    objectUrlCreated: true,
    objectUrlReturned: false,
    blobReturned: false,
    preparedAction: () => {},
    sourceBoundary: Object.freeze({ ready: true }),
    rawIes: "IESNA:LM-63-2002",
    ...overrides,
  });
}

test("shell Project Browser outcome state publishes the exact frozen idle contract", () => {
  const outcomeState = createShellProjectBrowserProjectIesExportDownloadOutcomeState();
  const snapshot = outcomeState.getSnapshot();

  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
    "SHELL-PROJECT-BROWSER-FIRST-PROJECT-IES-EXPORT-DOWNLOAD-OUTCOME-STATE-1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
    "controlstack.runtime.shell.project-browser.first-project-ies-export-download-outcome-state.v1",
  );
  assert.equal(
    SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION,
    1,
  );
  assert.equal(Object.isFrozen(outcomeState), true);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.deepEqual(
    Object.keys(snapshot),
    SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
  );
  assert.deepEqual(snapshot, {
    state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.idle,
    filename: null,
    mediaType: null,
    extension: null,
    byteLength: null,
    blocker: null,
  });
});

test("started shell outcome retains only the five approved receipt metadata fields", () => {
  const outcomeState = createShellProjectBrowserProjectIesExportDownloadOutcomeState();
  const snapshot = outcomeState.recordReceipt(safeStartedReceipt());

  assert.equal(snapshot, outcomeState.getSnapshot());
  assert.equal(Object.isFrozen(snapshot), true);
  assert.deepEqual(snapshot, {
    state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started,
    filename: "controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies",
    mediaType: "application/octet-stream",
    extension: ".ies",
    byteLength: 321,
    blocker: null,
  });
  for (const absent of [
    "downloadMetadata",
    "contentFingerprint",
    "sourceResultReadbackFingerprint",
    "objectUrlCreated",
    "objectUrlReturned",
    "blobReturned",
    "preparedAction",
    "sourceBoundary",
    "rawIes",
    "receipt",
  ]) {
    assert.equal(Object.hasOwn(snapshot, absent), false, absent);
  }
  assert.equal(JSON.stringify(snapshot).includes("IESNA:LM-63"), false);
});

test("blocked and malformed shell receipts fail closed to blocker-only state", () => {
  const outcomeState = createShellProjectBrowserProjectIesExportDownloadOutcomeState();
  const blocked = outcomeState.recordReceipt(Object.freeze({
    downloadTriggered: false,
    blocker: "project-ies-download-materialisation-boundary-missing",
    downloadMetadata: null,
  }));

  assert.deepEqual(blocked, {
    state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
    filename: null,
    mediaType: null,
    extension: null,
    byteLength: null,
    blocker: "project-ies-download-materialisation-boundary-missing",
  });

  const malformed = outcomeState.recordReceipt(safeStartedReceipt({
    failClosed: true,
    blocker: "C:\\private\\project.ies",
  }));
  assert.deepEqual(malformed, {
    state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
    filename: null,
    mediaType: null,
    extension: null,
    byteLength: null,
    blocker: "project-ies-export-download-action-blocked",
  });
});

test("outcome reset returns a fresh frozen idle snapshot without retaining the receipt", () => {
  const outcomeState = createShellProjectBrowserProjectIesExportDownloadOutcomeState();
  const started = outcomeState.recordReceipt(safeStartedReceipt());
  const reset = outcomeState.reset();

  assert.notEqual(reset, started);
  assert.equal(Object.isFrozen(reset), true);
  assert.deepEqual(reset, {
    state: SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.idle,
    filename: null,
    mediaType: null,
    extension: null,
    byteLength: null,
    blocker: null,
  });
});

test("shell resets outcome on workflow replacement and the active handler only records the Governance blocker", async () => {
  const [shellSource, styleSource, workflowSource] = await Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/styles.css", import.meta.url), "utf8"),
    readFile(
      new URL(
        "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
        import.meta.url,
      ),
      "utf8",
    ),
  ]);

  const handlerStart = shellSource.indexOf(
    "function handleProjectBrowserSelectedProjectRetrievalRequest()",
  );
  const nextHandlerStart = shellSource.indexOf(
    "function handleProjectBrowserListClick",
    handlerStart,
  );
  const handlerSource = shellSource.slice(handlerStart, nextHandlerStart);
  const outcomeStart = workflowSource.indexOf(
    "export function createShellProjectBrowserProjectIesExportDownloadOutcomeState",
  );
  const outcomeEnd = workflowSource.indexOf("function buildExportItem", outcomeStart);
  const outcomeSource = workflowSource.slice(outcomeStart, outcomeEnd);

  assert.notEqual(handlerStart, -1);
  assert.notEqual(nextHandlerStart, -1);
  assert.notEqual(outcomeStart, -1);
  assert.notEqual(outcomeEnd, -1);
  assert.match(
    shellSource,
    /const descriptorChanged = projectBrowserSelectedProjectExportsWorkflow !== workflowDescriptor;/,
  );
  assert.match(
    shellSource,
    /if \(descriptorChanged\) projectBrowserProjectIesExportDownloadOutcomeState\.reset\(\);/,
  );
  assert.doesNotMatch(handlerSource, /recordReceipt\(|preparedAction|downloadTriggered|downloadMetadata/);
  assert.match(handlerSource, /recordBlocked\(\s*"governance-data-retrieval-gateway-not-activated"/s);
  assert.match(handlerSource, /Data retrieval is governed centrally and is not yet activated/);
  assert.match(
    shellSource,
    /dataset\.shellProjectIesExportDownloadOutcomeState\s*=\s*outcomeSnapshot\.state/,
  );
  assert.match(
    styleSource,
    /data-shell-project-ies-export-download-outcome-state="shell_project_browser_project_ies_export_download_started"/,
  );
  assert.match(
    styleSource,
    /data-shell-project-ies-export-download-outcome-state="shell_project_browser_project_ies_export_download_blocked"/,
  );
  assert.doesNotMatch(
    outcomeSource,
    /localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|\/api\/|POST|savedProjectStore|projectEnvelope|RuntimeData|node:fs|writeFile|createObjectURL|revokeObjectURL|base64/,
  );
  assert.doesNotMatch(
    outcomeSource,
    /rawIes|candela|governance|mutationLog|objectUrl|\bblob\b|filesystem|localPath|repoPath/,
  );
});
