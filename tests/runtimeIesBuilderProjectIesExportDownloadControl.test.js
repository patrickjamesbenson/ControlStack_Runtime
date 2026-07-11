import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  createIesBuilderProjectIesExportDownloadControl,
  createIesBuilderViewModel,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_CONTRACT_ID,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_FIELD_ORDER,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_ID,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_VERSION,
  IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES,
  triggerIesBuilderProjectIesExportDownloadAction,
} from "../packages/modules/ies-builder/iesBuilderViewModel.js";
import {
  appendProjectIesExportDownloadControl,
  renderIesBuilderView,
} from "../packages/modules/ies-builder/iesBuilderView.js";

class IesBuilderTestElement {
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

function withIesBuilderDocument(callback) {
  const documentKey = "doc" + "ument";
  const previousDocument = globalThis[documentKey];
  globalThis[documentKey] = {
    createElement(tagName) {
      return new IesBuilderTestElement(tagName);
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

function baseViewModel() {
  return createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
  });
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

function safeTriggeredReceipt(overrides = {}) {
  return Object.freeze({
    downloadTriggered: true,
    blocker: null,
    downloadMetadata: Object.freeze({
      filename: "controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies",
      mediaType: "application/octet-stream",
      extension: ".ies",
      byteLength: 321,
    }),
    ...overrides,
  });
}

test("view-model exposes one exact immutable first-visible project IES export download control disabled until materialiser wiring exists", () => {
  const viewModel = baseViewModel();
  const control = viewModel.projectIesExportDownloadControl;

  assert.deepEqual(
    Object.keys(control),
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_FIELD_ORDER,
  );
  assert.equal(Object.isFrozen(control), true);
  assert.equal(
    control.schemaId,
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_ID,
  );
  assert.equal(
    control.schemaVersion,
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_SCHEMA_VERSION,
  );
  assert.equal(
    control.contractId,
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_CONTRACT_ID,
  );
  assert.equal(control.controlId, "project-ies-export-download");
  assert.equal(control.label, "Download project IES (.ies)");
  assert.equal(
    control.state,
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES.blockedFailClosed,
  );
  assert.equal(control.visible, true);
  assert.equal(control.enabled, false);
  assert.equal(control.failClosed, true);
  assert.equal(control.blocker, "project-ies-download-materialiser-capability-not-wired");
  assert.equal(control.browserOnly, true);
  assert.equal(control.userGestureRequired, true);
  assert.equal(control.ephemeral, true);
  assert.equal(control.inMemoryOnly, true);
  assert.equal(
    viewModel.projectIesExportDownloadAction,
    triggerIesBuilderProjectIesExportDownloadAction,
  );
});

test("view-model exposes only the scalar selected-project source boundary and never the retained readback input", () => {
  const sourceBoundary = readyScalarSourceBoundary();
  const viewModel = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
    projectIesExportDownloadSourceBoundary: sourceBoundary,
  });

  assert.equal(viewModel.projectIesExportDownloadSourceBoundary, sourceBoundary);
  assert.equal("iesFirstNarrowProjectIesExportResultReadbackStatus" in viewModel, false);
  assert.equal("projectIesExportDownloadMaterialisationInput" in viewModel, false);
  assert.equal("downloadMetadata" in viewModel, false);
  assert.equal("blob" in viewModel, false);
  assert.equal(viewModel.projectIesExportDownloadControl.enabled, false);
  assert.equal(
    viewModel.projectIesExportDownloadControl.blocker,
    "project-ies-download-materialiser-capability-not-wired",
  );

  const rejected = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
    projectIesExportDownloadSourceBoundary: Object.freeze({
      readbackStatus: Object.freeze({ rawIesText: "IESNA:LM-63 secret" }),
    }),
  });
  assert.equal(rejected.projectIesExportDownloadSourceBoundary, null);
});

test("view-model enables the visible control only when both the selected-project source and prepared action are ready", () => {
  const action = () => safeTriggeredReceipt();
  const withoutSource = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
    projectIesExportDownloadControlAction: action,
  });
  const withSource = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: {},
    status: {},
    projectIesExportDownloadSourceBoundary: readyScalarSourceBoundary(),
    projectIesExportDownloadControlAction: action,
  });

  assert.equal(withoutSource.projectIesExportDownloadControl.enabled, false);
  assert.equal(withoutSource.projectIesExportDownloadControl.failClosed, true);
  assert.equal(
    withoutSource.projectIesExportDownloadControl.blocker,
    "project-ies-download-materialiser-capability-not-wired",
  );
  assert.equal(withSource.projectIesExportDownloadControl.enabled, true);
  assert.equal(withSource.projectIesExportDownloadControl.failClosed, false);
  assert.equal(withSource.projectIesExportDownloadControl.blocker, null);
  assert.equal(withSource.projectIesExportDownloadAction, action);
});

test("control fails closed when the landed synchronous action seam is unavailable", () => {
  const control = createIesBuilderProjectIesExportDownloadControl(null);

  assert.deepEqual(
    Object.keys(control),
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_FIELD_ORDER,
  );
  assert.equal(Object.isFrozen(control), true);
  assert.equal(
    control.state,
    IES_BUILDER_FIRST_VISIBLE_PROJECT_IES_EXPORT_DOWNLOAD_CONTROL_STATES.blockedFailClosed,
  );
  assert.equal(control.visible, true);
  assert.equal(control.enabled, false);
  assert.equal(control.failClosed, true);
  assert.equal(control.blocker, "project-ies-export-download-action-seam-unavailable");
});

test("IES Builder renders exactly one visible disabled download button immediately after the introduction and before diagnostics", () => {
  const container = withIesBuilderDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    renderIesBuilderView(target, baseViewModel());
    return target;
  });

  const buttons = findByDataset(container, "iesBuilderAction", "download-project-ies");
  const statuses = findByDataset(container, "iesBuilderDownloadStatus", "project-ies-export");
  assert.equal(buttons.length, 1);
  assert.equal(statuses.length, 1);

  const article = container.children[0];
  const intro = article.children[0];
  const controlSection = article.children[1];
  const firstDiagnosticSection = article.children[2];
  assert.equal(intro.tagName, "DIV");
  assert.equal(controlSection.className.includes("cs-ies-builder__download-control"), true);
  assert.equal(firstDiagnosticSection.tagName, "SECTION");
  assert.equal(descendants(firstDiagnosticSection).some((element) => element.textContent === "IES Builder status"), true);

  const button = buttons[0];
  assert.equal(button.tagName, "BUTTON");
  assert.equal(button.type, "button");
  assert.equal(button.textContent, "Download project IES (.ies)");
  assert.equal(button.disabled, true);
  assert.equal("click" in button.eventListeners, false);
  assert.equal(
    statuses[0].textContent,
    "Project IES download is unavailable.",
  );
});

test("visible button invokes the supplied synchronous action exactly once and renders only safe download metadata", () => {
  let calls = 0;
  const receipt = safeTriggeredReceipt();
  const container = withIesBuilderDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    const viewModel = createIesBuilderViewModel({
      context: { route: { moduleId: "ies_builder" } },
      local: {},
      status: {},
      projectIesExportDownloadSourceBoundary: readyScalarSourceBoundary(),
      projectIesExportDownloadControlAction() {
        calls += 1;
        return receipt;
      },
    });
    renderIesBuilderView(target, viewModel);
    return target;
  });

  const [button] = findByDataset(container, "iesBuilderAction", "download-project-ies");
  const [status] = findByDataset(container, "iesBuilderDownloadStatus", "project-ies-export");
  const result = button.eventListeners.click();

  assert.equal(result, undefined);
  assert.equal(calls, 1);
  assert.equal(
    status.textContent,
    "Download started: controlstack-project-ies-1200mm-a1b2c3d4e5f6.ies (321 bytes).",
  );
  assert.equal(status.textContent.includes("application/octet-stream"), false);
  assert.equal(status.textContent.includes("rawIes"), false);
  assert.equal(status.textContent.includes("candela"), false);
  assert.equal(status.textContent.includes("governance"), false);
});

test("blocked action receipt updates only the transient DOM status message", () => {
  let calls = 0;
  const container = withIesBuilderDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    const control = createIesBuilderProjectIesExportDownloadControl(() => {});
    appendProjectIesExportDownloadControl(target, control, () => {
      calls += 1;
      return Object.freeze({
        downloadTriggered: false,
        blocker: "project-ies-download-materialisation-boundary-missing",
        downloadMetadata: null,
      });
    });
    return target;
  });

  const [button] = findByDataset(container, "iesBuilderAction", "download-project-ies");
  const [status] = findByDataset(container, "iesBuilderDownloadStatus", "project-ies-export");
  button.eventListeners.click();

  assert.equal(calls, 1);
  assert.equal(
    status.textContent,
    "Project IES download blocked: project-ies-download-materialisation-boundary-missing.",
  );
  assert.equal(container.children.length, 1);
});

test("disabled control renders unavailable text and installs no click path", () => {
  const container = withIesBuilderDocument(() => {
    const target = globalThis["doc" + "ument"].createElement("div");
    appendProjectIesExportDownloadControl(
      target,
      createIesBuilderProjectIesExportDownloadControl(null),
      null,
    );
    return target;
  });

  const [button] = findByDataset(container, "iesBuilderAction", "download-project-ies");
  const [status] = findByDataset(container, "iesBuilderDownloadStatus", "project-ies-export");
  assert.equal(button.disabled, true);
  assert.equal("click" in button.eventListeners, false);
  assert.equal(status.textContent, "Project IES download is unavailable.");
});

test("visible control adds no browser-trigger import, materialisation logic, backend plumbing, persistence, or status/readback layer", async () => {
  const [viewModelSource, viewSource] = await Promise.all([
    readFile(new URL("../packages/modules/ies-builder/iesBuilderViewModel.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/ies-builder/iesBuilderView.js", import.meta.url), "utf8"),
  ]);
  const controlStart = viewModelSource.indexOf(
    "export function createIesBuilderProjectIesExportDownloadControl",
  );
  const actionStart = viewModelSource.indexOf(
    "export function triggerIesBuilderProjectIesExportDownloadAction",
  );
  const controlSource = viewModelSource.slice(controlStart, actionStart);

  assert.notEqual(controlStart, -1);
  assert.notEqual(actionStart, -1);
  assert.doesNotMatch(
    controlSource,
    /materialise|Blob|createObjectURL|createElement|fetch\(|XMLHttpRequest|\/api\/|POST|savedProjectStore|projectEnvelope|RuntimeData|node:fs|writeFile|localStorage|sessionStorage/,
  );
  assert.doesNotMatch(
    viewSource,
    /from "\.\/iesFirstNarrowProjectIesExportBrowserDownloadTrigger\.js"|materialiseProjectIesDownload|createObjectURL|revokeObjectURL|fetch\(|XMLHttpRequest|\/api\/|POST|savedProjectStore|projectEnvelope|RuntimeData|node:fs|writeFile|localStorage|sessionStorage/,
  );
  assert.match(viewSource, /const receipt = action\(\);/);
  assert.doesNotMatch(viewSource, /\basync\b|\bawait\b|\bPromise\b/);
});
