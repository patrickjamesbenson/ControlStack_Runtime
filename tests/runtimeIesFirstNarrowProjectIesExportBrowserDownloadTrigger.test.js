import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES,
  triggerIesFirstNarrowProjectIesExportBrowserDownload,
  triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload,
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

const DOWNLOAD_METADATA_FIELDS = Object.freeze([
  "filename",
  "mediaType",
  "extension",
  "byteLength",
  "contentFingerprint",
  "materialisationFingerprint",
  "sourceResultReadbackFingerprint",
]);
const RESULT_READBACK_FINGERPRINT = `safe-ies-first-narrow-project-ies-export-result-readback-status:${"a".repeat(40)}`;
const SAFE_CONTENT = "opaque-lm63-download-fixture";

function buildDownloadMetadata(blob, overrides = {}) {
  const contentFingerprint = overrides.contentFingerprint
    ?? stableFingerprint("safe-ies-first-narrow-project-ies-export-download-content", SAFE_CONTENT);
  const filename = overrides.filename
    ?? `controlstack-project-ies-1200mm-${contentFingerprint.slice(-12)}.ies`;
  const fingerprintSource = {
    filename,
    mediaType: overrides.mediaType ?? RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
    extension: overrides.extension ?? ".ies",
    byteLength: overrides.byteLength ?? blob.size,
    contentFingerprint,
    sourceResultReadbackFingerprint: overrides.sourceResultReadbackFingerprint ?? RESULT_READBACK_FINGERPRINT,
  };
  return Object.freeze({
    filename: fingerprintSource.filename,
    mediaType: fingerprintSource.mediaType,
    extension: fingerprintSource.extension,
    byteLength: fingerprintSource.byteLength,
    contentFingerprint: fingerprintSource.contentFingerprint,
    materialisationFingerprint: overrides.materialisationFingerprint
      ?? stableFingerprint(
        "safe-ies-first-narrow-project-ies-export-download-materialisation",
        fingerprintSource,
      ),
    sourceResultReadbackFingerprint: fingerprintSource.sourceResultReadbackFingerprint,
  });
}

function buildReadyBoundary(overrides = {}, { freeze = true } = {}) {
  const blob = overrides.blob ?? Object.freeze(new Blob([SAFE_CONTENT], {
    type: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
  }));
  const downloadMetadata = overrides.downloadMetadata ?? buildDownloadMetadata(blob);
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
    downloadMetadata,
    ...overrides,
  };
  const ordered = Object.fromEntries(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER
      .map((key) => [key, fields[key]]),
  );
  return freeze ? Object.freeze(ordered) : ordered;
}

function buildBrowserHarness({
  failAppend = false,
  failClick = false,
  failRemove = false,
  failRevoke = false,
  objectUrl = "blob:controlstack-project-ies-test",
} = {}) {
  const calls = [];
  const anchor = {
    href: null,
    download: null,
    type: null,
    rel: null,
    hidden: false,
    click() {
      calls.push("click");
      if (failClick) throw new Error("private click failure");
    },
    remove() {
      calls.push("remove");
      if (failRemove) throw new Error("private remove failure");
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
        if (failAppend) throw new Error("private append failure");
      },
    },
  };
  const browserUrlApi = {
    createObjectURL(blob) {
      calls.push("createObjectURL");
      assert.equal(blob instanceof Blob, true);
      return objectUrl;
    },
    revokeObjectURL(received) {
      calls.push("revokeObjectURL");
      assert.equal(received, objectUrl);
      if (failRevoke) throw new Error("private revoke failure");
    },
  };
  return {
    anchor,
    browserDocument,
    browserUrlApi,
    calls,
  };
}

function assertScalarSafeReceipt(receipt) {
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
      `${key} must be scalar-safe`,
    );
  }
  assert.equal("blob" in receipt, false);
  assert.equal("objectUrl" in receipt, false);
  assert.equal("rawIesText" in receipt, false);
  assert.equal("candela" in receipt, false);
  assert.equal("governance" in receipt, false);
  assert.equal("mutationLog" in receipt, false);
  const serialised = JSON.stringify(receipt);
  assert.equal(serialised.includes("blob:controlstack"), false);
  assert.equal(serialised.includes(SAFE_CONTENT), false);
  assert.equal(serialised.includes("private"), false);
  assert.match(
    receipt.triggerFingerprint,
    /^safe-ies-first-narrow-project-ies-export-browser-download-trigger:[0-9a-f]{40}$/,
  );
  const fingerprintSource = Object.fromEntries(
    Object.entries(receipt).filter(([key]) => key !== "triggerFingerprint"),
  );
  assert.equal(
    receipt.triggerFingerprint,
    stableFingerprint(
      "safe-ies-first-narrow-project-ies-export-browser-download-trigger",
      fingerprintSource,
    ),
  );
}

function assertBlocked(receipt, blockerPattern) {
  assert.equal(
    receipt.state,
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.blockedFailClosed,
  );
  assert.equal(receipt.readiness, "blocked_fail_closed");
  assert.equal(receipt.ready, false);
  assert.equal(receipt.failClosed, true);
  assert.match(receipt.blocker, blockerPattern);
  assert.equal(receipt.downloadMetadata, null);
  assert.equal(receipt.blobReturned, false);
  assert.equal(receipt.objectUrlReturned, false);
  assert.equal(receipt.rawIesTextReturned, false);
  assert.equal(receipt.candelaReturned, false);
  assert.equal(receipt.governanceReturned, false);
  assert.equal(receipt.mutationLogReturned, false);
  assert.equal(receipt.filesystemWriteAttempted, false);
  assert.equal(receipt.persistenceWriteAttempted, false);
  assert.equal(receipt.runtimeDataMutationAttempted, false);
  assert.equal(receipt.routeOrPostWiringAdded, false);
  assert.equal(receipt.directLabTransformCalled, false);
  assertScalarSafeReceipt(receipt);
}

test("synchronously triggers one browser-only LM-63 download and immediately removes and revokes its temporary resources", () => {
  const boundary = buildReadyBoundary();
  const harness = buildBrowserHarness();
  const receipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
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
  assert.equal(harness.anchor.href, "blob:controlstack-project-ies-test");
  assert.equal(harness.anchor.download, boundary.downloadMetadata.filename);
  assert.equal(harness.anchor.type, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE);
  assert.equal(harness.anchor.rel, "noopener");
  assert.equal(harness.anchor.hidden, true);

  assert.equal(receipt.schemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_ID);
  assert.equal(receipt.schemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_SCHEMA_VERSION);
  assert.equal(receipt.contractId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_CONTRACT_ID);
  assert.equal(receipt.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BROWSER_DOWNLOAD_TRIGGER_STATES.triggered);
  assert.equal(receipt.readiness, "triggered");
  assert.equal(receipt.ready, true);
  assert.equal(receipt.failClosed, false);
  assert.equal(receipt.blocker, null);
  assert.equal(receipt.sourceKind, "ready-project-ies-export-download-materialisation-boundary-only");
  assert.equal(receipt.outputKind, "ephemeral-browser-lm63-download-trigger");
  assert.equal(receipt.browserOnly, true);
  assert.equal(receipt.userGestureRequired, true);
  assert.equal(receipt.ephemeral, true);
  assert.equal(receipt.inMemoryOnly, true);
  assert.equal(receipt.downloadTriggered, true);
  assert.equal(receipt.objectUrlCreated, true);
  assert.equal(receipt.objectUrlRevoked, true);
  assert.equal(receipt.anchorCreated, true);
  assert.equal(receipt.anchorAppended, true);
  assert.equal(receipt.anchorClicked, true);
  assert.equal(receipt.anchorRemoved, true);
  assert.equal(receipt.productionProof, false);
  assert.equal(receipt.labProofAuthority, false);
  assert.equal(Object.isFrozen(receipt.downloadMetadata), true);
  assert.deepEqual(Object.keys(receipt.downloadMetadata), DOWNLOAD_METADATA_FIELDS);
  assert.deepEqual(receipt.downloadMetadata, boundary.downloadMetadata);
  assert.notEqual(receipt.downloadMetadata, boundary.downloadMetadata);
  assertScalarSafeReceipt(receipt);
});

test("short alias exposes the same deterministic scalar-safe trigger receipt", () => {
  const boundary = buildReadyBoundary();
  const firstHarness = buildBrowserHarness();
  const secondHarness = buildBrowserHarness();
  const runtimeReceipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
    browserDocument: firstHarness.browserDocument,
    browserUrlApi: firstHarness.browserUrlApi,
  });
  const aliasReceipt = triggerIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
    browserDocument: secondHarness.browserDocument,
    browserUrlApi: secondHarness.browserUrlApi,
  });

  assert.deepEqual(aliasReceipt, runtimeReceipt);
  assert.equal(aliasReceipt instanceof Promise, false);
});

test("blocks before browser invocation unless the input is the exact frozen ready materialisation boundary", () => {
  const ready = buildReadyBoundary();
  const mismatchedBlob = Object.freeze(new Blob([`${SAFE_CONTENT}-different`], {
    type: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
  }));
  const cases = [
    [{}, /boundary-missing/],
    [buildReadyBoundary({}, { freeze: false }), /boundary-not-frozen/],
    [Object.freeze({ ...ready, ready: false }), /boundary-not-ready/],
    [Object.freeze({ ...ready, rawIesText: "hidden" }), /boundary-shape-invalid/],
    [buildReadyBoundary({
      blob: mismatchedBlob,
      downloadMetadata: ready.downloadMetadata,
    }), /blob-alignment-invalid/],
    [buildReadyBoundary({
      downloadMetadata: buildDownloadMetadata(ready.blob, {
        filename: "unsafe.ies",
      }),
    }), /filename-invalid/],
    [buildReadyBoundary({ downloadUrlGenerated: true }), /prohibited-flag-set/],
  ];

  for (const [boundary, pattern] of cases) {
    const harness = buildBrowserHarness();
    const receipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
      iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
      browserDocument: harness.browserDocument,
      browserUrlApi: harness.browserUrlApi,
    });
    assertBlocked(receipt, pattern);
    assert.deepEqual(harness.calls, []);
  }
});

test("blocks before object URL creation when browser document or URL capabilities are unavailable", () => {
  const boundary = buildReadyBoundary();
  let urlCalls = 0;
  const missingDocument = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
    browserDocument: {},
    browserUrlApi: {
      createObjectURL() {
        urlCalls += 1;
      },
      revokeObjectURL() {},
    },
  });
  assertBlocked(missingDocument, /document-capability-missing/);
  assert.equal(urlCalls, 0);

  const harness = buildBrowserHarness();
  const missingUrlApi = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: boundary,
    browserDocument: harness.browserDocument,
    browserUrlApi: {},
  });
  assertBlocked(missingUrlApi, /url-capability-missing/);
  assert.deepEqual(harness.calls, []);
});

test("append and click failures still remove the anchor and revoke the temporary object URL", () => {
  for (const [options, pattern, expected] of [
    [
      { failAppend: true },
      /anchor-append-failed/,
      {
        calls: ["createObjectURL", "createElement:a", "append", "remove", "revokeObjectURL"],
        anchorAppended: false,
      },
    ],
    [
      { failClick: true },
      /anchor-click-failed/,
      {
        calls: ["createObjectURL", "createElement:a", "append", "click", "remove", "revokeObjectURL"],
        anchorAppended: true,
      },
    ],
  ]) {
    const harness = buildBrowserHarness(options);
    const receipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
      iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: buildReadyBoundary(),
      browserDocument: harness.browserDocument,
      browserUrlApi: harness.browserUrlApi,
    });

    assertBlocked(receipt, pattern);
    assert.deepEqual(harness.calls, expected.calls);
    assert.equal(receipt.downloadTriggered, false);
    assert.equal(receipt.objectUrlCreated, true);
    assert.equal(receipt.objectUrlRevoked, true);
    assert.equal(receipt.anchorCreated, true);
    assert.equal(receipt.anchorAppended, expected.anchorAppended);
    assert.equal(receipt.anchorClicked, false);
    assert.equal(receipt.anchorRemoved, true);
  }
});

test("cleanup failures remain fail-closed and never expose the Blob or temporary object URL", () => {
  const removeHarness = buildBrowserHarness({ failRemove: true });
  const removeReceipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: buildReadyBoundary(),
    browserDocument: removeHarness.browserDocument,
    browserUrlApi: removeHarness.browserUrlApi,
  });
  assertBlocked(removeReceipt, /anchor-remove-failed/);
  assert.equal(removeReceipt.downloadTriggered, true);
  assert.equal(removeReceipt.anchorRemoved, false);
  assert.equal(removeReceipt.objectUrlRevoked, true);

  const revokeHarness = buildBrowserHarness({ failRevoke: true });
  const revokeReceipt = triggerRuntimeIesFirstNarrowProjectIesExportBrowserDownload({
    iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary: buildReadyBoundary(),
    browserDocument: revokeHarness.browserDocument,
    browserUrlApi: revokeHarness.browserUrlApi,
  });
  assertBlocked(revokeReceipt, /object-url-revoke-failed/);
  assert.equal(revokeReceipt.downloadTriggered, true);
  assert.equal(revokeReceipt.anchorRemoved, true);
  assert.equal(revokeReceipt.objectUrlCreated, true);
  assert.equal(revokeReceipt.objectUrlRevoked, false);
  assert.equal(JSON.stringify(revokeReceipt).includes("blob:controlstack"), false);
});

test("module remains isolated from LM-63 inspection, persistence, RuntimeData, routes, server, filesystem, and lab transformation plumbing", async () => {
  const source = await readFile(
    new URL("../packages/modules/ies-builder/iesFirstNarrowProjectIesExportBrowserDownloadTrigger.js", import.meta.url),
    "utf8",
  );

  for (const forbidden of [
    ".text(",
    "FileReader",
    "TextDecoder",
    "node:fs",
    "writeFile",
    "createWriteStream",
    "savedProjectStore",
    "projectBrowserService",
    "runtimeDataReadOnlySourceAccessService",
    "ControlStack_RuntimeData",
    "server.js",
    "fetch(",
    "XMLHttpRequest",
    "method: \"POST\"",
    "materialiseProjectIesDownload",
    "labTransformation",
    "candelaGrid",
    "base64",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.equal(/\basync\b/.test(source), false);
  assert.equal(/\bawait\b/.test(source), false);
  assert.equal(source.includes("createObjectURL"), true);
  assert.equal(source.includes("revokeObjectURL"), true);
  assert.equal(source.includes("createElement(\"a\")"), true);
  assert.equal(source.includes("anchor.click()"), true);
  assert.equal(source.includes("anchor.remove()"), true);
});
