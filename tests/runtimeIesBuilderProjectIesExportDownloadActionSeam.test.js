import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createIesBuilderViewModel,
  triggerIesBuilderProjectIesExportDownloadAction,
} from "../packages/modules/ies-builder/iesBuilderViewModel.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES,
  triggerIesFirstNarrowProjectIesExportBrowserDownload,
} from "../packages/modules/ies-builder/iesFirstNarrowProjectIesExportBrowserDownloadTrigger.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const SAFE_CONTENT = "opaque-lm63-action-seam-fixture";
const RESULT_READBACK_FINGERPRINT =
  `safe-ies-first-narrow-project-ies-export-result-readback-status:${"b".repeat(40)}`;
const DOWNLOAD_METADATA_FIELDS = Object.freeze([
  "filename",
  "mediaType",
  "extension",
  "byteLength",
  "contentFingerprint",
  "materialisationFingerprint",
  "sourceResultReadbackFingerprint",
]);

function buildDownloadMetadata(blob) {
  const contentFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-download-content",
    SAFE_CONTENT,
  );
  const filename = `controlstack-project-ies-1200mm-${contentFingerprint.slice(-12)}.ies`;
  const fingerprintSource = {
    filename,
    mediaType: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
    extension: ".ies",
    byteLength: blob.size,
    contentFingerprint,
    sourceResultReadbackFingerprint: RESULT_READBACK_FINGERPRINT,
  };
  return Object.freeze({
    ...fingerprintSource,
    materialisationFingerprint: stableFingerprint(
      "safe-ies-first-narrow-project-ies-export-download-materialisation",
      fingerprintSource,
    ),
  });
}

function buildReadyBoundary(overrides = {}, { freeze = true } = {}) {
  const blob = overrides.blob ?? Object.freeze(new Blob([SAFE_CONTENT], {
    type: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
  }));
  const fields = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
    state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    sourceKind: "ready-project-ies-export-result-readback-status-only",
    outputKind: "ephemeral-in-memory-lm63-download-blob",
    ephemeral: true,
    inMemoryOnly: true,
    immutableBlob: true,
    sourceTextAccepted: true,
    sourceTextDiscarded: true,
    materialiserCapabilityInjected: true,
    materialiserCapabilityInvoked: true,
    materialiserCapabilitySucceeded: true,
    filesystemWriteAttempted: false,
    persistenceWriteAttempted: false,
    runtimeDataMutationAttempted: false,
    downloadUrlGenerated: false,
    routeOrPostWiringAdded: false,
    blob,
    downloadMetadata: overrides.downloadMetadata ?? buildDownloadMetadata(blob),
    ...overrides,
  };
  const ordered = Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
  return freeze ? Object.freeze(ordered) : ordered;
}

function buildBrowserHarness() {
  const calls = [];
  const anchor = {
    href: null,
    download: null,
    type: null,
    rel: null,
    hidden: false,
    click() {
      calls.push("click");
    },
    remove() {
      calls.push("remove");
    },
  };
  const browserDocument = {
    createElement(tagName) {
      calls.push(`createElement:${tagName}`);
      return anchor;
    },
    body: {
      appendChild(received) {
        calls.push("append");
        assert.equal(received, anchor);
      },
    },
  };
  const browserUrlApi = {
    createObjectURL(blob) {
      calls.push("createObjectURL");
      assert.equal(blob instanceof Blob, true);
      return "blob:controlstack-project-ies-action-seam";
    },
    revokeObjectURL(value) {
      calls.push("revokeObjectURL");
      assert.equal(value, "blob:controlstack-project-ies-action-seam");
    },
  };
  return { anchor, browserDocument, browserUrlApi, calls };
}

function assertSafeReceipt(receipt) {
  assert.deepEqual(
    Object.keys(receipt),
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER,
  );
  assert.equal(Object.isFrozen(receipt), true);
  for (const [key, value] of Object.entries(receipt)) {
    if (key === "downloadMetadata") continue;
    assert.equal(
      value === null || ["string", "number", "boolean"].includes(typeof value),
      true,
      `${key} must remain scalar-safe`,
    );
  }
  assert.equal("blob" in receipt, false);
  assert.equal("objectUrl" in receipt, false);
  assert.equal("rawIesText" in receipt, false);
  assert.equal("candela" in receipt, false);
  assert.equal("governance" in receipt, false);
  assert.equal("mutationLog" in receipt, false);
  assert.equal(JSON.stringify(receipt).includes(SAFE_CONTENT), false);
  assert.equal(JSON.stringify(receipt).includes("blob:controlstack"), false);
}

test("view-model action seam synchronously delegates one ready ephemeral boundary to the landed browser trigger", () => {
  const boundary = buildReadyBoundary();
  const harness = buildBrowserHarness();
  const receipt = triggerIesBuilderProjectIesExportDownloadAction({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
    browserDocument: harness.browserDocument,
    browserUrlApi: harness.browserUrlApi,
  });

  assert.equal(receipt instanceof Promise, false);
  assert.deepEqual(harness.calls, [
    "createObjectURL",
    "createElement:a",
    "append",
    "click",
    "remove",
    "revokeObjectURL",
  ]);
  assert.equal(
    receipt.state,
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.triggered,
  );
  assert.equal(receipt.ready, true);
  assert.equal(receipt.failClosed, false);
  assert.equal(receipt.downloadTriggered, true);
  assert.equal(receipt.browserOnly, true);
  assert.equal(receipt.ephemeral, true);
  assert.equal(receipt.inMemoryOnly, true);
  assert.equal(receipt.filesystemWriteAttempted, false);
  assert.equal(receipt.persistenceWriteAttempted, false);
  assert.equal(receipt.runtimeDataMutationAttempted, false);
  assert.equal(receipt.routeOrPostWiringAdded, false);
  assert.equal(receipt.directLabTransformCalled, false);
  assert.equal(Object.isFrozen(receipt.downloadMetadata), true);
  assert.deepEqual(Object.keys(receipt.downloadMetadata), DOWNLOAD_METADATA_FIELDS);
  assertSafeReceipt(receipt);
});

test("created IES Builder view model exposes only the module-local action function without invoking it during view-model creation", () => {
  const viewModel = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
  });

  assert.equal(
    viewModel.projectIesExportDownloadAction,
    triggerIesBuilderProjectIesExportDownloadAction,
  );

  const boundary = buildReadyBoundary();
  const actionHarness = buildBrowserHarness();
  const directHarness = buildBrowserHarness();
  const actionReceipt = viewModel.projectIesExportDownloadAction({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
    browserDocument: actionHarness.browserDocument,
    browserUrlApi: actionHarness.browserUrlApi,
  });
  const directReceipt = triggerIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
    browserDocument: directHarness.browserDocument,
    browserUrlApi: directHarness.browserUrlApi,
  });

  assert.deepEqual(actionReceipt, directReceipt);
  assert.deepEqual(actionHarness.calls, directHarness.calls);
  assertSafeReceipt(actionReceipt);
});

test("action seam fails closed before any browser capability is invoked for missing, unfrozen, or non-ready boundaries", () => {
  const ready = buildReadyBoundary();
  const cases = [
    undefined,
    buildReadyBoundary({}, { freeze: false }),
    Object.freeze({ ...ready, ready: false }),
  ];

  for (const boundary of cases) {
    const harness = buildBrowserHarness();
    const receipt = triggerIesBuilderProjectIesExportDownloadAction({
      iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
      browserDocument: harness.browserDocument,
      browserUrlApi: harness.browserUrlApi,
      projectEnvelope: { rawIesText: SAFE_CONTENT },
      persistedState: { forbidden: true },
    });

    assert.equal(
      receipt.state,
      RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.blockedFailClosed,
    );
    assert.equal(receipt.ready, false);
    assert.equal(receipt.failClosed, true);
    assert.equal(receipt.downloadMetadata, null);
    assert.deepEqual(harness.calls, []);
    assertSafeReceipt(receipt);
  }
});

test("action seam remains view-model-only, synchronous, non-visible, and isolated from persistence, routes, filesystem, RuntimeData, envelopes, and lab transforms", async () => {
  const [viewModelSource, viewSource, indexSource] = await Promise.all([
    readFile(new URL("../packages/modules/ies-builder/iesBuilderViewModel.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/iesBuilderView.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/index.js", import.meta.url), "utf8"),
  ]);
  const actionStart = viewModelSource.indexOf(
    "export function triggerIesBuilderProjectIesExportDownloadAction",
  );
  const actionEnd = viewModelSource.indexOf(
    "export function createIesBuilderViewModel",
    actionStart,
  );
  const actionSource = viewModelSource.slice(actionStart, actionEnd);

  assert.notEqual(actionStart, -1);
  assert.notEqual(actionEnd, -1);
  assert.match(
    viewModelSource,
    /from "\.\/iesFirstNarrowProjectIesExportBrowserDownloadTrigger\.js";/,
  );
  assert.match(
    actionSource,
    /return triggerIesFirstNarrowProjectIesExportBrowserDownload\(\{/,
  );
  assert.doesNotMatch(actionSource, /\basync\b|\bawait\b|\bPromise\b/);
  assert.doesNotMatch(
    actionSource,
    /fetch\(|XMLHttpRequest|\/api\/|POST|savedProjectStore|projectEnvelope|RuntimeData|node:fs|writeFile|localStorage|sessionStorage|materialiseProjectIesDownload|labTransformation|candelaGrid|rawIesText/,
  );
  assert.equal(viewSource.includes("projectIesExportDownloadAction"), false);
  assert.equal(indexSource.includes("projectIesExportDownloadAction"), false);
  assert.equal(viewSource.includes("triggerIesBuilderProjectIesExportDownloadAction"), false);
  assert.equal(indexSource.includes("triggerIesBuilderProjectIesExportDownloadAction"), false);
});
