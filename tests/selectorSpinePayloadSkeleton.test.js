import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const viewModelSourceUrl = new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url);
const testSourceUrl = new URL("./selectorSpinePayloadSkeleton.test.js", import.meta.url);

function createAdapter() {
  return {
    moduleId: "cs_selector",
    services: {},
    readSnapshots() {
      return {
        route: { moduleId: "cs_selector" },
        flags: { owner: "shell", values: {} },
        project: {
          owner: "shell",
          status: "loaded",
          metadata: { title: "", projectId: "" },
          currentProject: {},
        },
        handoff: { owner: "shell", status: "deferred", available: false },
        identity: {
          owner: "shell",
          status: "anonymous-fallback",
          currentUser: {},
          classification: "anonymous",
          identityState: "external_anonymous",
        },
        authority: { owner: "shell", status: "fallback", source: "shell-safe-fallback" },
        company: { owner: "shell", status: "placeholder", companyName: "" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: false },
          rule: "test",
        },
        timelinePolicy: {},
      };
    },
    isFlagEnabled() {
      return false;
    },
  };
}

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function selectorReferenceStatus() {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot({}, { source: sourceReady() }),
  };
}

function createModel(options = {}) {
  const selectorState = createSelectorState();
  options.configureState?.(selectorState);
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(),
  });
}

function spineSection(spine, sectionKey) {
  const section = spine.sections.find((item) => item.sectionKey === sectionKey);
  assert.ok(section, `expected spine section ${sectionKey}`);
  return section;
}

function spineRow(spine, sectionKey, rowKey) {
  const row = spineSection(spine, sectionKey).rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected spine row ${sectionKey}.${rowKey}`);
  return row;
}

test("Selector product surface renders checklist spine and payload preview before Diagnostics", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  const spineRenderIndex = source.indexOf("appendSelectorProductSpine(section");
  const payloadRenderIndex = source.indexOf("appendPayloadPreviewObject(section");
  const truthRenderIndex = source.indexOf("appendSelectorSelectionTruthSummary(section");
  const diagnosticsIndex = source.indexOf("const diagnosticsDetails = document.createElement(\"details\")");

  assert.ok(spineRenderIndex > 0, "product spine should render");
  assert.ok(payloadRenderIndex > spineRenderIndex, "payload preview should render after checklist spine");
  assert.ok(truthRenderIndex > payloadRenderIndex, "selected-truth summary should remain after payload preview");
  assert.ok(diagnosticsIndex > truthRenderIndex, "Diagnostics should remain below the product surface");
  assert.match(source, /dataset\.selectorProductSpine = "checklist"/);
  assert.match(source, /dataset\.selectorPayloadPreview = "skeleton"/);
});

test("Selector checklist sections appear in the target order", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.deepEqual(spine.order, [
    "SYSTEM",
    "ENVIRONMENT",
    "LIGHT & CONTROL",
    "MOUNTING",
    "FINISHES",
    "EGRESS & ACCESSORIES",
    "RUNS & DISABLED OUTPUTS",
    "FOOT / STATUS",
  ]);
  assert.deepEqual(spineSection(spine, "system").rows.map((row) => row.label), [
    "Profile / system",
    "Optic Direct",
  ]);
  assert.deepEqual(spineSection(spine, "egressAccessories").rows.map((row) => row.label), [
    "Egress light",
    "EWIS/sound",
    "Sensors",
    "Accessories",
  ]);
  assert.deepEqual(spineSection(spine, "runs").rows.map((row) => row.label), [
    "Run count",
    "Run qty",
    "Run length",
    "Length mode",
    "Run placement",
    "Override status",
    "RunTable generation",
    "Payload generation",
    "IES generation",
    "Drawing generation",
    "Lab Proof authority",
    "Controlled Records writes",
    "RREG approval / custody",
    "HubSpot / CRM write-back",
  ]);
});

test("Empty and unmapped values render as em dash rather than fake values", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.equal(spine.emptyValue, "—");
  assert.equal(spineRow(spine, "system", "profileSystem").displayValue, "—");
  assert.equal(spineRow(spine, "lightControl", "lexWeight").displayValue, "—");
  assert.equal(spineRow(spine, "lightControl", "lexWeight").status, "missing");
  assert.match(spineRow(spine, "lightControl", "lexWeight").reason, /no value is faked/i);
});

test("Split egress, sensors, and accessories appear as separate checklist rows and payload fields", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;
  const payload = model.selectorSurface.payloadPreview;

  assert.equal(spineRow(spine, "egressAccessories", "egressLight").label, "Egress light");
  assert.equal(spineRow(spine, "egressAccessories", "egressSound").label, "EWIS/sound");
  assert.equal(spineRow(spine, "egressAccessories", "sensors").label, "Sensors");
  assert.equal(spineRow(spine, "egressAccessories", "accessories").label, "Accessories");
  assert.deepEqual(Object.keys(payload.egress), ["light", "sound"]);
  assert.deepEqual(Object.keys(payload.sensorsAccessories), ["sensors", "accessories"]);
  assert.equal(payload.egress.light, null);
  assert.equal(payload.egress.sound, null);
  assert.equal(payload.sensorsAccessories.sensors, null);
  assert.equal(payload.sensorsAccessories.accessories, null);
});

test("Runs & Disabled Outputs rows render em dash when empty and keep every output handoff disabled", () => {
  const model = createModel();
  const runsSection = spineSection(model.selectorSurface.productSpine, "runs");
  const payload = model.selectorSurface.payloadPreview;

  for (const row of runsSection.rows) {
    assert.equal(row.displayValue, "—", `expected ${row.rowKey} to render empty as em dash`);
    assert.equal(row.rawRowsExposed, false);
    assert.equal(row.writes, false);
  }

  assert.deepEqual(payload.runs, {
    runCount: null,
    qty: null,
    lengthMm: null,
    lengthMode: null,
    placementStatus: null,
    overrideStatus: null,
    rows: [],
  });
  assert.deepEqual(payload.disabledOutputs, {
    runTableGeneration: false,
    payloadGeneration: false,
    iesGeneration: false,
    drawingGeneration: false,
    labProofAuthority: false,
    controlledRecordsWrites: false,
    rregApprovalCustodyTransfer: false,
    hubSpotCrmWriteBack: false,
  });
});

test("Donor-supported run manual constraints can fill preview rows without enabling generation", () => {
  const model = createModel({
    configureState(selectorState) {
      selectorState.setDbBackedSelectorFieldValue("runQty", "2", "2");
      selectorState.setDbBackedSelectorFieldValue("runLength", "3500", "3500 mm");
      selectorState.setDbBackedSelectorFieldValue("runLengthMode", "cut_to_length", "Cut to length");
    },
  });
  const spine = model.selectorSurface.productSpine;
  const payload = model.selectorSurface.payloadPreview;

  assert.equal(spineRow(spine, "runs", "runQty").displayValue, "2");
  assert.equal(spineRow(spine, "runs", "runLength").displayValue, "3500");
  assert.equal(spineRow(spine, "runs", "runLengthMode").displayValue, "cut_to_length");
  assert.equal(spineRow(spine, "runs", "runTableGeneration").displayValue, "—");
  assert.equal(payload.runs.qty, "2");
  assert.equal(payload.runs.lengthMm, "3500");
  assert.equal(payload.runs.lengthMode, "cut_to_length");
  assert.equal(payload.disabledOutputs.runTableGeneration, false);
  assert.equal(payload.safetyFlags.runTableGeneration, false);
  assert.equal(payload.safetyFlags.payloadGeneration, false);
  assert.equal(payload.safetyFlags.iesGeneration, false);
  assert.equal(payload.safetyFlags.drawingGeneration, false);
});

test("Payload preview exposes the expected top-level shape and safety flags", () => {
  const payload = createModel().selectorSurface.payloadPreview;

  for (const key of [
    "project",
    "identity",
    "system",
    "profile",
    "tier",
    "optics",
    "environment",
    "lightControl",
    "mounting",
    "finishes",
    "egress",
    "sensorsAccessories",
    "runs",
    "disabledOutputs",
    "safetyFlags",
  ]) {
    assert.ok(Object.prototype.hasOwnProperty.call(payload, key), `expected payload key ${key}`);
  }

  assert.equal(payload.previewOnly, true);
  assert.equal(payload.productionPayload, false);
  assert.equal(payload.safetyFlags.readOnly, true);
  assert.equal(payload.safetyFlags.writes, false);
  assert.equal(payload.safetyFlags.generation, false);
  assert.equal(payload.safetyFlags.runTableGeneration, false);
  assert.equal(payload.safetyFlags.payloadGeneration, false);
  assert.equal(payload.safetyFlags.iesGeneration, false);
  assert.equal(payload.safetyFlags.drawingGeneration, false);
  assert.equal(payload.safetyFlags.labProofAuthority, false);
  assert.equal(payload.safetyFlags.controlledRecordsWrites, false);
  assert.equal(payload.safetyFlags.rregApprovalCustodyTransfer, false);
  assert.equal(payload.safetyFlags.hubSpotCrmWriteBack, false);
  assert.equal(payload.safetyFlags.rawRowsExposed, false);
  assert.equal(payload.safetyFlags.rawHeadersExposed, false);
  assert.equal(payload.safetyFlags.rawUsersExposed, false);
});

test("Raw rows and private source details are not exposed through the spine or payload preview", () => {
  const surface = createModel().selectorSurface;
  const text = JSON.stringify({ spine: surface.productSpine, payload: surface.payloadPreview });

  assert.equal(surface.productSpine.rawRowsExposed, false);
  assert.equal(surface.payloadPreview.safetyFlags.privatePathsExposed, false);
  assert.equal(text.includes("novondb.json"), false);
  assert.equal(text.includes("C:\\"), false);
  assert.equal(text.includes("raw_lab_evidence"), false);
  assert.equal(text.includes("token"), false);
});

test("Direct and indirect optic rows follow runtime capability state", () => {
  const spine = createModel().selectorSurface.productSpine;
  const systemRows = spineSection(spine, "system").rows;

  assert.ok(systemRows.some((row) => row.rowKey === "opticDirect"));
  assert.equal(systemRows.some((row) => row.rowKey === "opticIndirect"), false);
});

test("Future or unmapped rows are shown as missing, future-mapped, or blocked, not faked", () => {
  const spine = createModel().selectorSurface.productSpine;
  const lex = spineRow(spine, "lightControl", "lexWeight");
  const electrical = spineRow(spine, "environment", "electricalClass");

  assert.ok(["missing", "future-mapped", "blocked", "not-selected"].includes(lex.status));
  assert.equal(lex.value, null);
  assert.equal(lex.missing, true);
  assert.ok(["missing", "future-mapped", "blocked", "not-selected"].includes(electrical.status));
  assert.equal(electrical.writes, false);
});

test("The slice does not introduce a named user or authority fixture", async () => {
  const viewModelSource = await readFile(viewModelSourceUrl, "utf-8");
  const testSource = await readFile(testSourceUrl, "utf-8");
  const payload = createModel().selectorSurface.payloadPreview;

  const forbiddenName = String.fromCharCode(65, 108, 108, 97, 110, 32, 79, 114, 103, 97, 110);
  const usersTableLiteral = ["US", "ERS:"].join("");
  assert.equal(viewModelSource.includes(forbiddenName), false);
  assert.equal(testSource.includes(forbiddenName), false);
  const atSignLiteral = String.fromCharCode(64);
  assert.equal(viewModelSource.includes(atSignLiteral), false);
  assert.equal(testSource.includes(usersTableLiteral), false);
  assert.equal(payload.identity.email, null);
  assert.equal(payload.identity.authorityStatus, "fallback");
});
