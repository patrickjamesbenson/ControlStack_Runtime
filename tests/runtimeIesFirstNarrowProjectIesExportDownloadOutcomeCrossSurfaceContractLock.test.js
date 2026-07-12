import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createIesBuilderProjectIesExportDownloadOutcomeState,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
} from "../packages/modules/ies-builder/iesBuilderViewModel.js";
import {
  createShellProjectBrowserProjectIesExportDownloadOutcomeState,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION,
  SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
} from "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js";

const SAFE_FILENAME = "controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies";
const SAFE_MEDIA_TYPE = "application/octet-stream";
const SAFE_EXTENSION = ".ies";
const SAFE_BYTE_LENGTH = 321;
const SAFE_BLOCKER = "project-ies-export-download-trigger-fail-closed";

function safeReceipt(overrides = {}) {
  return Object.freeze({
    downloadTriggered: true,
    failClosed: false,
    blocker: null,
    downloadMetadata: Object.freeze({
      filename: SAFE_FILENAME,
      mediaType: SAFE_MEDIA_TYPE,
      extension: SAFE_EXTENSION,
      byteLength: SAFE_BYTE_LENGTH,
      contentFingerprint: `safe-content:${"a".repeat(40)}`,
      materialisationFingerprint: `safe-materialisation:${"b".repeat(40)}`,
      sourceResultReadbackFingerprint: `safe-readback:${"c".repeat(40)}`,
    }),
    objectUrlCreated: true,
    objectUrlReturned: false,
    blobReturned: false,
    rawIes: "IESNA:LM-63-2002",
    ...overrides,
  });
}

function semanticState(state, states) {
  return Object.entries(states).find(([, value]) => value === state)?.[0] || null;
}

function semanticSnapshot(snapshot, states) {
  return Object.freeze({
    ...snapshot,
    state: semanticState(snapshot.state, states),
  });
}

function assertApprovedOutcomeShape(snapshot, fieldOrder) {
  assert.equal(Object.isFrozen(snapshot), true);
  assert.deepEqual(Object.keys(snapshot), fieldOrder);
  for (const absent of [
    "downloadMetadata",
    "receipt",
    "contentFingerprint",
    "materialisationFingerprint",
    "sourceResultReadbackFingerprint",
    "objectUrlCreated",
    "objectUrlReturned",
    "blobReturned",
    "rawIes",
    "candela",
    "governance",
    "mutationLog",
    "localPath",
    "base64",
  ]) {
    assert.equal(Object.hasOwn(snapshot, absent), false, absent);
  }
}

test("project IES download outcome cross-surface contract lock preserves semantic parity", async (t) => {
  await t.test("keeps independently named contracts on the same safe outcome shape", () => {
    assert.equal(
      IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
      "IES-BUILDER-FIRST-PROJECT-IES-EXPORT-DOWNLOAD-OUTCOME-STATE-1",
    );
    assert.equal(
      SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
      "SHELL-PROJECT-BROWSER-FIRST-PROJECT-IES-EXPORT-DOWNLOAD-OUTCOME-STATE-1",
    );
    assert.notEqual(
      IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
      SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
    );
    assert.notEqual(
      IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
      SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
    );
    assert.equal(IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION, 1);
    assert.equal(
      SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION,
      1,
    );
    assert.deepEqual(
      IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
      SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
    );
    assert.deepEqual(
      Object.keys(IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES),
      ["idle", "started", "blocked"],
    );
    assert.deepEqual(
      Object.keys(SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES),
      ["idle", "started", "blocked"],
    );
  });

  await t.test("accepts the same safe started receipt without retaining receipt internals", () => {
    const iesBuilderOutcome = createIesBuilderProjectIesExportDownloadOutcomeState();
    const projectBrowserOutcome = createShellProjectBrowserProjectIesExportDownloadOutcomeState();
    const receipt = safeReceipt();

    const iesBuilderSnapshot = iesBuilderOutcome.recordReceipt(receipt);
    const projectBrowserSnapshot = projectBrowserOutcome.recordReceipt(receipt);

    assertApprovedOutcomeShape(
      iesBuilderSnapshot,
      IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
    );
    assertApprovedOutcomeShape(
      projectBrowserSnapshot,
      SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
    );
    assert.deepEqual(
      semanticSnapshot(
        iesBuilderSnapshot,
        IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
      semanticSnapshot(
        projectBrowserSnapshot,
        SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
    );
    assert.deepEqual(
      semanticSnapshot(
        iesBuilderSnapshot,
        IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
      {
        state: "started",
        filename: SAFE_FILENAME,
        mediaType: SAFE_MEDIA_TYPE,
        extension: SAFE_EXTENSION,
        byteLength: SAFE_BYTE_LENGTH,
        blocker: null,
      },
    );
    assert.equal(JSON.stringify(iesBuilderSnapshot).includes("IESNA:LM-63"), false);
    assert.equal(JSON.stringify(projectBrowserSnapshot).includes("IESNA:LM-63"), false);
  });

  await t.test("rejects download-triggered receipts that are also fail-closed", () => {
    const iesBuilderOutcome = createIesBuilderProjectIesExportDownloadOutcomeState();
    const projectBrowserOutcome = createShellProjectBrowserProjectIesExportDownloadOutcomeState();
    const contradictoryReceipt = safeReceipt({
      failClosed: true,
      blocker: SAFE_BLOCKER,
    });

    const iesBuilderSnapshot = iesBuilderOutcome.recordReceipt(contradictoryReceipt);
    const projectBrowserSnapshot = projectBrowserOutcome.recordReceipt(contradictoryReceipt);

    assert.deepEqual(
      semanticSnapshot(
        iesBuilderSnapshot,
        IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
      semanticSnapshot(
        projectBrowserSnapshot,
        SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
    );
    assert.deepEqual(
      semanticSnapshot(
        iesBuilderSnapshot,
        IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
      {
        state: "blocked",
        filename: null,
        mediaType: null,
        extension: null,
        byteLength: null,
        blocker: SAFE_BLOCKER,
      },
    );
  });

  await t.test("keeps each surface state independently owned and ephemeral", async () => {
    const iesBuilderOutcome = createIesBuilderProjectIesExportDownloadOutcomeState();
    const projectBrowserOutcome = createShellProjectBrowserProjectIesExportDownloadOutcomeState();

    assert.notEqual(iesBuilderOutcome, projectBrowserOutcome);
    assert.equal(Object.isFrozen(iesBuilderOutcome), true);
    assert.equal(Object.isFrozen(projectBrowserOutcome), true);

    iesBuilderOutcome.recordReceipt(safeReceipt());
    assert.equal(
      semanticState(
        projectBrowserOutcome.getSnapshot().state,
        SHELL_PROJECT_BROWSER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
      "idle",
    );

    projectBrowserOutcome.recordReceipt(safeReceipt({
      failClosed: true,
      blocker: SAFE_BLOCKER,
    }));
    assert.equal(
      semanticState(
        iesBuilderOutcome.getSnapshot().state,
        IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
      ),
      "started",
    );

    const [iesBuilderSource, projectBrowserSource] = await Promise.all([
      readFile(
        new URL("../packages/modules/ies-builder/iesBuilderViewModel.js", import.meta.url),
        "utf8",
      ),
      readFile(
        new URL(
          "../apps/workspace-shell/src/projectBrowserSelectedProjectExportsWorkflow.js",
          import.meta.url,
        ),
        "utf8",
      ),
    ]);
    const iesBuilderStart = iesBuilderSource.indexOf(
      "function safeProjectIesExportDownloadStartedMetadata",
    );
    const iesBuilderEnd = iesBuilderSource.indexOf(
      "export function createIesBuilderProjectIesExportDownloadControl",
      iesBuilderStart,
    );
    const projectBrowserStart = projectBrowserSource.indexOf(
      "function safeProjectIesExportDownloadOutcomeMetadata",
    );
    const projectBrowserEnd = projectBrowserSource.indexOf(
      "function buildExportItem",
      projectBrowserStart,
    );
    const iesBuilderOutcomeSource = iesBuilderSource.slice(iesBuilderStart, iesBuilderEnd);
    const projectBrowserOutcomeSource = projectBrowserSource.slice(
      projectBrowserStart,
      projectBrowserEnd,
    );

    assert.notEqual(iesBuilderStart, -1);
    assert.notEqual(iesBuilderEnd, -1);
    assert.notEqual(projectBrowserStart, -1);
    assert.notEqual(projectBrowserEnd, -1);
    assert.match(
      iesBuilderOutcomeSource,
      /receipt\?\.downloadTriggered !== true\s*\|\| receipt\?\.failClosed === true/,
    );
    assert.match(
      projectBrowserOutcomeSource,
      /receipt\?\.downloadTriggered !== true\s*\|\| receipt\?\.failClosed === true/,
    );
    assert.match(
      iesBuilderOutcomeSource,
      /let snapshot = createIesBuilderProjectIesExportDownloadOutcomeSnapshot\(\);/,
    );
    assert.match(
      projectBrowserOutcomeSource,
      /let snapshot = createShellProjectBrowserProjectIesExportDownloadOutcomeSnapshot\(\);/,
    );
    for (const source of [iesBuilderOutcomeSource, projectBrowserOutcomeSource]) {
      assert.doesNotMatch(
        source,
        /localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|\/api\/|POST|savedProjectStore|projectEnvelope|RuntimeData|node:fs|writeFile|createObjectURL|revokeObjectURL|base64/,
      );
      assert.doesNotMatch(source, /\basync\b|\bawait\b|\bPromise\b/);
    }
  });
});
