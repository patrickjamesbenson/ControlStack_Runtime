import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createIesBuilderProjectIesExportDownloadControl,
  createIesBuilderProjectIesExportDownloadOutcomeState,
  createIesBuilderViewModel,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION,
  IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES,
} from "../packages/modules/ies-builder/iesBuilderViewModel.js";
import {
  appendProjectIesExportDownloadControl,
  renderIesBuilderView,
} from "../packages/modules/ies-builder/iesBuilderView.js";

class OutcomeStateTestElement {
  constructor(tagName = "div") {
    this.tagName = String(tagName || "div").toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.dataset = {};
    this.eventListeners = {};
    this.className = "";
    this.textContent = "";
    this.type = "";
    this.disabled = false;
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) this.children.splice(index, 1);
    child.parentNode = null;
    return child;
  }

  get firstChild() {
    return this.children[0] || null;
  }

  addEventListener(type, handler) {
    this.eventListeners[type] = handler;
  }
}

function withOutcomeStateDocument(callback) {
  const documentKey = "doc" + "ument";
  const previousDocument = globalThis[documentKey];
  globalThis[documentKey] = {
    createElement(tagName) {
      return new OutcomeStateTestElement(tagName);
    },
  };
  try {
    return callback();
  } finally {
    globalThis[documentKey] = previousDocument;
  }
}

function descendants(element) {
  return [element, ...(element.children || []).flatMap(descendants)];
}

function findByDataset(container, key, value) {
  return descendants(container).filter((element) => element.dataset?.[key] === value);
}

function readyScalarSourceBoundary() {
  return Object.freeze({
    state: "ies_builder_selected_project_ies_export_download_source_ready",
    readiness: "ready",
    ready: true,
    failClosed: false,
    sourceReadbackFingerprint:
      `safe-ies-first-narrow-project-ies-export-result-readback-status:${"a".repeat(40)}`,
    exactReadbackStatusRetainedInternally: true,
  });
}

function safeStartedReceipt(overrides = {}) {
  return Object.freeze({
    downloadTriggered: true,
    blocker: null,
    downloadMetadata: Object.freeze({
      filename: "controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies",
      mediaType: "application/ies",
      extension: ".ies",
      byteLength: 321,
      contentFingerprint: `safe-content:${"b".repeat(40)}`,
      materialisationFingerprint: `safe-materialisation:${"c".repeat(40)}`,
      sourceResultReadbackFingerprint: `safe-readback:${"d".repeat(40)}`,
    }),
    objectUrlCreated: true,
    objectUrlReturned: false,
    blobReturned: false,
    ...overrides,
  });
}

test("outcome state publishes the exact contract identity and immutable idle snapshot", () => {
  const outcomeState = createIesBuilderProjectIesExportDownloadOutcomeState();
  const snapshot = outcomeState.getSnapshot();

  assert.equal(
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_CONTRACT_ID,
    "IES-BUILDER-FIRST-PROJECT-IES-EXPORT-DOWNLOAD-OUTCOME-STATE-1",
  );
  assert.equal(
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_ID,
    "controlstack.runtime.ies-builder.first-project-ies-export-download-outcome-state.v1",
  );
  assert.equal(IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATE_SCHEMA_VERSION, 1);
  assert.equal(Object.isFrozen(outcomeState), true);
  assert.equal(Object.isFrozen(snapshot), true);
  assert.deepEqual(
    Object.keys(snapshot),
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
  );
  assert.deepEqual(snapshot, {
    state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.idle,
    filename: null,
    mediaType: null,
    extension: null,
    byteLength: null,
    blocker: null,
  });
});

test("started outcome retains only the five approved safe receipt metadata fields", () => {
  const outcomeState = createIesBuilderProjectIesExportDownloadOutcomeState();
  const receipt = safeStartedReceipt();
  const snapshot = outcomeState.recordReceipt(receipt);

  assert.equal(snapshot, outcomeState.getSnapshot());
  assert.equal(Object.isFrozen(snapshot), true);
  assert.deepEqual(
    Object.keys(snapshot),
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_FIELD_ORDER,
  );
  assert.deepEqual(snapshot, {
    state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started,
    filename: "controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies",
    mediaType: "application/ies",
    extension: ".ies",
    byteLength: 321,
    blocker: null,
  });
  assert.equal("downloadMetadata" in snapshot, false);
  assert.equal("contentFingerprint" in snapshot, false);
  assert.equal("materialisationFingerprint" in snapshot, false);
  assert.equal("sourceResultReadbackFingerprint" in snapshot, false);
  assert.equal("objectUrlCreated" in snapshot, false);
  assert.equal("objectUrlReturned" in snapshot, false);
  assert.equal("blobReturned" in snapshot, false);
});

test("blocked and malformed receipts fail closed to blocker-only outcome state", () => {
  const outcomeState = createIesBuilderProjectIesExportDownloadOutcomeState();
  const blocked = outcomeState.recordReceipt(Object.freeze({
    downloadTriggered: false,
    blocker: "project-ies-download-materialisation-boundary-missing",
    downloadMetadata: null,
  }));

  assert.deepEqual(blocked, {
    state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
    filename: null,
    mediaType: null,
    extension: null,
    byteLength: null,
    blocker: "project-ies-download-materialisation-boundary-missing",
  });

  const malformed = outcomeState.recordReceipt(safeStartedReceipt({
    downloadMetadata: Object.freeze({
      filename: "unsafe.txt",
      mediaType: "text/plain",
      extension: ".txt",
      byteLength: 0,
    }),
    blocker: "C:\\private\\project.ies",
  }));
  assert.deepEqual(malformed, {
    state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.blocked,
    filename: null,
    mediaType: null,
    extension: null,
    byteLength: null,
    blocker: "project-ies-export-download-action-blocked",
  });
});

test("view-model owns one module-local idle outcome state for the rendered control", () => {
  const first = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
  });
  const second = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
  });

  assert.notEqual(
    first.projectIesExportDownloadOutcomeState,
    second.projectIesExportDownloadOutcomeState,
  );
  assert.equal(
    first.projectIesExportDownloadOutcomeState.getSnapshot().state,
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.idle,
  );
  assert.equal("projectIesExportDownloadOutcome" in first, false);
  assert.equal("downloadMetadata" in first, false);
});

test("rendered action transitions explicit outcome state before projecting safe started text", () => {
  let viewModel;
  const container = withOutcomeStateDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    viewModel = createIesBuilderViewModel({
      context: { route: { moduleId: "ies_builder" } },
      local: {},
      status: {},
      projectIesExportDownloadSourceBoundary: readyScalarSourceBoundary(),
      projectIesExportDownloadControlAction: () => safeStartedReceipt(),
    });
    renderIesBuilderView(target, viewModel);
    return target;
  });

  const [button] = findByDataset(container, "iesBuilderAction", "download-project-ies");
  const [status] = findByDataset(container, "iesBuilderDownloadStatus", "project-ies-export");
  assert.equal(
    status.dataset.iesBuilderDownloadOutcomeState,
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.idle,
  );

  button.eventListeners.click();

  assert.deepEqual(viewModel.projectIesExportDownloadOutcomeState.getSnapshot(), {
    state: IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started,
    filename: "controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies",
    mediaType: "application/ies",
    extension: ".ies",
    byteLength: 321,
    blocker: null,
  });
  assert.equal(
    status.dataset.iesBuilderDownloadOutcomeState,
    IES_BUILDER_FIRST_PROJECT_IES_EXPORT_DOWNLOAD_OUTCOME_STATES.started,
  );
  assert.equal(
    status.textContent,
    "Download started: controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies (321 bytes).",
  );
  assert.equal(status.textContent.includes("application/ies"), false);
});

test("blocked receipt and thrown action both transition explicit state without retaining unsafe values", () => {
  const blockedOutcomeState = createIesBuilderProjectIesExportDownloadOutcomeState();
  const thrownOutcomeState = createIesBuilderProjectIesExportDownloadOutcomeState();

  const blockedContainer = withOutcomeStateDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    appendProjectIesExportDownloadControl(
      target,
      createIesBuilderProjectIesExportDownloadControl(() => {}),
      () => Object.freeze({
        downloadTriggered: false,
        blocker: "project-ies-download-materialisation-boundary-missing",
        downloadMetadata: null,
      }),
      blockedOutcomeState,
    );
    return target;
  });
  const thrownContainer = withOutcomeStateDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    appendProjectIesExportDownloadControl(
      target,
      createIesBuilderProjectIesExportDownloadControl(() => {}),
      () => {
        throw new Error("private path C:\\secret\\project.ies");
      },
      thrownOutcomeState,
    );
    return target;
  });

  findByDataset(blockedContainer, "iesBuilderAction", "download-project-ies")[0]
    .eventListeners.click();
  findByDataset(thrownContainer, "iesBuilderAction", "download-project-ies")[0]
    .eventListeners.click();

  assert.equal(
    blockedOutcomeState.getSnapshot().blocker,
    "project-ies-download-materialisation-boundary-missing",
  );
  assert.equal(
    thrownOutcomeState.getSnapshot().blocker,
    "project-ies-export-download-action-failed",
  );
  assert.equal(JSON.stringify(thrownOutcomeState.getSnapshot()).includes("secret"), false);
  assert.equal(
    findByDataset(thrownContainer, "iesBuilderDownloadStatus", "project-ies-export")[0]
      .textContent,
    "Project IES download blocked: project-ies-export-download-action-failed.",
  );
});

test("outcome-state implementation stays module-local, ephemeral, synchronous, and persistence-free", async () => {
  const [viewModelSource, viewSource] = await Promise.all([
    readFile(new URL("../packages/modules/ies-builder/iesBuilderViewModel.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/iesBuilderView.js", import.meta.url), "utf8"),
  ]);
  const outcomeStart = viewModelSource.indexOf(
    "export function createIesBuilderProjectIesExportDownloadOutcomeState",
  );
  const controlStart = viewModelSource.indexOf(
    "export function createIesBuilderProjectIesExportDownloadControl",
  );
  const outcomeSource = viewModelSource.slice(outcomeStart, controlStart);

  assert.notEqual(outcomeStart, -1);
  assert.notEqual(controlStart, -1);
  assert.match(
    outcomeSource,
    /let snapshot = createIesBuilderProjectIesExportDownloadOutcomeSnapshot\(\);/,
  );
  assert.match(viewSource, /downloadOutcomeState\.recordReceipt\(receipt\);/);
  assert.match(viewSource, /downloadOutcomeState\.getSnapshot\(\);/);
  assert.doesNotMatch(
    outcomeSource,
    /localStorage|sessionStorage|indexedDB|fetch\(|XMLHttpRequest|\/api\/|POST|savedProjectStore|projectEnvelope|RuntimeData|node:fs|writeFile|createObjectURL|revokeObjectURL|base64/,
  );
  assert.doesNotMatch(outcomeSource, /\basync\b|\bawait\b|\bPromise\b/);
  assert.doesNotMatch(
    outcomeSource,
    /rawIes|candela|governance|mutationLog|objectUrl|\bblob\b|filesystem|localPath|repoPath/,
  );
});
