import test from "node:test";
import assert from "node:assert/strict";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";

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
          metadata: { title: "Selector Preview Result Project", projectId: "SEL-PREVIEW-RESULT" },
          currentProject: { title: "Selector Preview Result Project", projectId: "SEL-PREVIEW-RESULT" },
        },
        handoff: { owner: "shell", status: "deferred", available: false },
        identity: {
          owner: "shell",
          status: "resolved",
          currentUser: { name: "Diagnostic User", email: "diagnostic@example.com" },
        },
        authority: { owner: "shell", status: "safe-fallback" },
        company: { owner: "shell", status: "placeholder", companyName: "Diagnostic Company" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: true },
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

function sourceReadyReference(overrides = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: { present: true, readable: true, parseable: true },
    expectedTables: ["SYSTEM", "OPTICS", "ACCESSORIES", "BOARDS", "DRIVERS"],
    presentTables: ["SYSTEM", "OPTICS", "ACCESSORIES", "BOARDS", "DRIVERS"],
    missingTables: [],
    rawRowsExposed: false,
    rawUsersExposed: false,
    rawLabEvidenceExposed: false,
    credentialsExposed: false,
    privatePathsExposed: false,
    ...overrides,
  };
}

function createModel({ selectorState = createSelectorState(), selectorReferenceStatus = sourceReadyReference() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus,
  });
}

function rowsToObject(rows = []) {
  return Object.fromEntries(rows);
}

test("Selector preview result summary exposes required product-facing boundary copy and flags", () => {
  const preview = createModel().expanderShell.readonlyResolverPreview;
  const summary = preview.previewResultSummary;

  assert.equal(summary.title, "Preview result summary");
  assert.equal(summary.status, "Preview result is explanatory only.");
  assert.deepEqual(summary.boundaryCopy, [
    "Preview result is explanatory only.",
    "This is not a committed Selector result.",
    "This is not a production specification.",
    "This is not a slug authority.",
    "This is not Lab Proof.",
    "No downstream artefact, record, approval, custody transfer, or write is created here.",
    "Manual selections remain constraints. Auto selections remain consequences.",
    "Compatible selections are not cleared by this preview.",
    "Preview-ready does not mean spec-ready.",
    "Spec-ready does not mean Lab proven.",
    "Board Data defines metadata. Selector previews resolution. IES Builder may generate candidate artefacts later. Lab proves later.",
  ]);
  assert.deepEqual(summary.flags, {
    previewResultSummaryOnly: true,
    committedSelectorResult: false,
    productionSpecification: false,
    slugAuthorityEnabled: false,
    downstreamArtefactCreated: false,
    proofAuthority: false,
    controlledRecordCreated: false,
    rregAssignmentCreated: false,
    writeBackCreated: false,
  });
  assert.equal(preview.runtimeStatusFlags.previewResultSummaryOnly, true);
  assert.equal(preview.runtimeStatusFlags.committedSelectorResult, false);
  assert.equal(preview.runtimeStatusFlags.productionSpecification, false);
  assert.equal(preview.runtimeStatusFlags.downstreamArtefactCreated, false);
  assert.equal(preview.runtimeStatusFlags.proofAuthority, false);
  assert.equal(preview.runtimeStatusFlags.controlledRecordCreated, false);
  assert.equal(preview.runtimeStatusFlags.rregAssignmentCreated, false);
  assert.equal(preview.runtimeStatusFlags.writeBackCreated, false);
});

test("Selector preview result summary explains candidate, source readiness, constraints, consequences, and proof state", () => {
  const selectorState = createSelectorState();
  selectorState.setSelectorFieldValue("cctCri", "cct_cri:3000K|CRI80");

  const contract = selectorState.getSnapshot().selectorStateContract;
  assert.equal(contract.manualConstraints.cctCri.value, "cct_cri:3000K|CRI80");
  assert.equal(contract.manualConstraints.cctCri.valueLabel, "3000K / CRI80");
  assert.equal(Object.prototype.hasOwnProperty.call(contract.manualConstraints, "cct"), false);

  const summary = createModel({ selectorState }).expanderShell.readonlyResolverPreview.previewResultSummary;
  const candidateSummary = rowsToObject(summary.candidateSummaryRows);
  const why = rowsToObject(summary.whyRows);
  const path = rowsToObject(summary.specReadyPathRows);

  assert.equal(candidateSummary["candidate state"], "manually constrained preview");
  assert.equal(candidateSummary["source state"], "source readable");
  assert.match(candidateSummary["table readiness"], /ready for preview summary/);
  assert.equal(candidateSummary["manual constraint count"], 1);
  assert.ok(Number(candidateSummary["auto consequence count"]) >= 1);
  assert.ok(Number(candidateSummary["effective selection count"]) >= 1);
  assert.equal(candidateSummary["Spec Ready state"], "incomplete — preview-ready does not mean spec-ready");
  assert.equal(candidateSummary["proof state"], "not established — this is not Lab Proof");
  assert.match(why["manual constraints"], /CCT\/CRI: 3000K \/ CRI80/);
  assert.match(why["auto consequences"], /Driver:/);
  assert.match(why["effective selection"], /CCT\/CRI: 3000K \/ CRI80/);
  assert.equal(path["Lab Proof still required later"], "required later — not established here");
});

test("Selector preview result summary explains blocked and missing reasons safely", () => {
  const preview = createModel({
    selectorReferenceStatus: sourceReadyReference({
      ok: false,
      status: "loaded",
      source: { present: true, readable: false, parseable: false },
      expectedTables: ["SYSTEM", "OPTICS", "DRIVERS"],
      presentTables: ["SYSTEM"],
      missingTables: ["OPTICS", "DRIVERS"],
      rawRowsExposed: true,
      rawUsersExposed: true,
      rawLabEvidenceExposed: true,
      credentialsExposed: true,
      privatePathsExposed: true,
    }),
  }).expanderShell.readonlyResolverPreview;
  const summary = preview.previewResultSummary;
  const blocked = rowsToObject(summary.blockedMissingRows);
  const path = rowsToObject(summary.specReadyPathRows);
  const sourceRows = rowsToObject(preview.sourceRows);

  assert.equal(preview.fields.preview_state, "source unavailable");
  assert.equal(blocked["source not readable"], "blocked — source is not readable");
  assert.equal(blocked["source not parseable"], "blocked — source is not parseable");
  assert.equal(blocked["missing required tables"], "blocked — OPTICS, DRIVERS");
  assert.equal(blocked["no manual constraints yet"], "missing — no manual constraints have shaped this candidate");
  assert.equal(blocked["Spec Ready incomplete"], "blocked — Spec Ready incomplete");
  assert.equal(blocked["proof not established"], "not established — this is not Lab Proof");
  assert.match(blocked["Controlled Records future-gated"], /no provenance/);
  assert.match(blocked["RREG future-gated"], /no assignment/);
  assert.equal(path["required tables present"], "required before spec-ready later; missing: OPTICS, DRIVERS");
  assert.equal(sourceRows["raw rows exposed"], "false");
  assert.equal(sourceRows["raw USERS exposed"], "false");
  assert.equal(sourceRows["raw Lab evidence exposed"], "false");
  assert.equal(sourceRows["credentials exposed"], "false");
  assert.equal(sourceRows["private paths exposed"], "false");
});

test("Selector preview result summary keeps every downstream action disabled", () => {
  const summary = createModel().expanderShell.readonlyResolverPreview.previewResultSummary;
  const disabled = rowsToObject(summary.downstreamDisabledRows);

  assert.equal(disabled["slug/spec generation"], "disabled");
  assert.equal(disabled["IES generation"], "disabled");
  assert.equal(disabled["payload generation"], "disabled");
  assert.equal(disabled["RunTable generation"], "disabled");
  assert.equal(disabled["drawing generation"], "disabled");
  assert.equal(disabled["Lab Proof"], "disabled");
  assert.equal(disabled["Controlled Records write"], "disabled");
  assert.equal(disabled["RREG assignment/approval/custody transfer"], "disabled");
  assert.equal(disabled["runtime data mutation"], "disabled");
  assert.equal(disabled["hidden write-back"], "disabled");
});
