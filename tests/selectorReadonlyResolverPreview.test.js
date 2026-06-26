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
          metadata: { title: "Selector Resolver Preview Project", projectId: "SEL-RESOLVER-PREVIEW" },
          currentProject: { title: "Selector Resolver Preview Project", projectId: "SEL-RESOLVER-PREVIEW" },
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

test("Selector read-only resolver preview exposes required boundary copy, relationship map, categories, and fields", () => {
  const model = createModel();
  const preview = model.expanderShell.readonlyResolverPreview;

  assert.equal(preview.readOnly, true);
  assert.equal(preview.diagnosticOnly, true);
  assert.equal(preview.resolverPreviewOnly, true);
  assert.deepEqual(preview.boundaryCopy, [
    "Selector resolver preview is read-only in this slice.",
    "This preview explains candidate readiness; it does not commit a selection.",
    "Manual selections remain constraints. Auto selections remain consequences.",
    "Compatible selections are not cleared by this preview.",
    "Preview-ready does not mean spec-ready.",
    "Spec-ready does not mean Lab proven.",
    "No slug, spec, IES, payload, RunTable, drawing, Lab Proof claim, Controlled Record, RREG assignment, or runtime write is created here.",
    "Board Data defines metadata. Selector previews resolution. IES Builder may generate candidate artefacts later. Lab proves later.",
  ]);
  assert.deepEqual(preview.categories, [
    "default preview",
    "source unavailable",
    "source readable",
    "source missing required tables",
    "manually constrained preview",
    "auto consequence preview",
    "compatibility explained preview",
    "preview candidate ready",
    "spec gate incomplete",
    "downstream outputs disabled",
    "proof not established",
    "review/provenance future-gated",
  ]);
  assert.deepEqual(preview.fieldNames, [
    "preview_state",
    "source_status",
    "source_tables_ready",
    "missing_tables",
    "manual_constraints",
    "auto_consequences",
    "effective_selection",
    "compatibility_summary",
    "unresolved_reasons",
    "spec_gate_status",
    "slug_preview_status",
    "ies_generation_status",
    "lab_proof_status",
    "controlled_records_status",
    "rreg_status",
    "downstream_outputs_disabled",
    "unsafe_claims_blocked",
  ]);
  assert.deepEqual(preview.relationshipMap, [
    { system: "Board Data / Selector Reference", role: "safe source-readiness metadata" },
    { system: "Selector", role: "read-only preview of candidate resolution" },
    { system: "IES Builder", role: "downstream candidate artefact generation later" },
    { system: "Lab Proof", role: "future proof boundary" },
    { system: "Controlled Records", role: "future provenance/disposition trail" },
    { system: "RREG", role: "future review/custody mapping" },
    { system: "Engine Flow", role: "confidence path explanation only" },
  ]);
});

test("Selector read-only resolver preview keeps all active resolver, generation, proof, write, and raw exposure flags disabled", () => {
  const preview = createModel().expanderShell.readonlyResolverPreview;
  const flags = preview.runtimeStatusFlags;

  assert.equal(flags.readOnly, true);
  assert.equal(flags.diagnosticOnly, true);
  assert.equal(flags.resolverPreviewOnly, true);
  assert.equal(flags.activeResolverEnabled, false);
  assert.equal(flags.selectorMutationEnabled, false);
  assert.equal(flags.compatibleSelectionClearingEnabled, false);
  assert.equal(flags.boardDataWriteEnabled, false);
  assert.equal(flags.specGenerationEnabled, false);
  assert.equal(flags.slugGenerationEnabled, false);
  assert.equal(flags.slugAuthorityEnabled, false);
  assert.equal(flags.iesGenerationEnabled, false);
  assert.equal(flags.payloadGenerationEnabled, false);
  assert.equal(flags.runTableGenerationEnabled, false);
  assert.equal(flags.drawingGenerationEnabled, false);
  assert.equal(flags.labProofAuthority, false);
  assert.equal(flags.controlledRecordWriteEnabled, false);
  assert.equal(flags.rregAssignmentEnabled, false);
  assert.equal(flags.rregApprovalEnabled, false);
  assert.equal(flags.rregCustodyTransferEnabled, false);
  assert.equal(flags.runtimeDataMutationEnabled, false);
  assert.equal(flags.hiddenWriteBackEnabled, false);
  assert.equal(flags.rawRowsExposed, false);
  assert.equal(flags.rawUsersExposed, false);
  assert.equal(flags.rawLabEvidenceExposed, false);
  assert.equal(flags.credentialsExposed, false);
  assert.equal(flags.privatePathsExposed, false);
});

test("Selector read-only resolver preview reflects source readiness and missing table blockers safely", () => {
  const model = createModel({
    selectorReferenceStatus: sourceReadyReference({
      expectedTables: ["SYSTEM", "OPTICS", "DRIVERS"],
      presentTables: ["SYSTEM", "OPTICS"],
      missingTables: ["DRIVERS"],
      rawRowsExposed: true,
      rawUsersExposed: true,
      rawLabEvidenceExposed: true,
      credentialsExposed: true,
      privatePathsExposed: true,
    }),
  });
  const preview = model.expanderShell.readonlyResolverPreview;
  const fields = preview.fields;
  const sourceRows = Object.fromEntries(preview.sourceRows);

  assert.equal(fields.preview_state, "source missing required tables");
  assert.equal(fields.source_status, "source readable");
  assert.equal(fields.source_tables_ready, "false");
  assert.equal(fields.missing_tables, "DRIVERS");
  assert.match(fields.unresolved_reasons, /Missing Selector Reference table blocker\(s\): DRIVERS/);
  assert.equal(sourceRows["raw rows exposed"], "false");
  assert.equal(sourceRows["raw USERS exposed"], "false");
  assert.equal(sourceRows["raw Lab evidence exposed"], "false");
  assert.equal(sourceRows["credentials exposed"], "false");
  assert.equal(sourceRows["private paths exposed"], "false");
});

test("Selector read-only resolver preview reflects manual constraints, auto consequences, and effective selection without mutation", () => {
  const selectorState = createSelectorState();
  selectorState.setSelectorFieldValue("cct", "3000K");
  const before = selectorState.getSnapshot().selectorStateContract;

  const model = createModel({ selectorState });
  const after = selectorState.getSnapshot().selectorStateContract;
  const preview = model.expanderShell.readonlyResolverPreview;

  assert.deepEqual(after.manualConstraints, before.manualConstraints);
  assert.deepEqual(after.autoConsequences, before.autoConsequences);
  assert.deepEqual(after.effectiveSelection, before.effectiveSelection);
  assert.equal(preview.fields.preview_state, "manually constrained preview");
  assert.match(preview.fields.manual_constraints, /CCT: 3000K/);
  assert.match(preview.fields.auto_consequences, /Driver:/);
  assert.match(preview.fields.effective_selection, /CCT: 3000K/);
  assert.equal(preview.fields.spec_gate_status, "incomplete — preview-ready does not mean spec-ready");
  assert.equal(preview.fields.slug_preview_status, "disabled — no slug generated, committed, or treated as authority");
  assert.match(preview.fields.downstream_outputs_disabled, /^true/);
});

test("Selector read-only resolver preview explains compatibility without clearing compatible selections or claiming proof", () => {
  const selectorState = createSelectorState();
  selectorState.setSelectorFieldValue("interiorExterior", "exterior");
  const before = selectorState.getSnapshot().selectorStateContract;

  const model = createModel({ selectorState });
  const after = selectorState.getSnapshot().selectorStateContract;
  const preview = model.expanderShell.readonlyResolverPreview;

  assert.deepEqual(after.manualConstraints, before.manualConstraints);
  assert.equal(after.manualConstraints.interiorExterior.value, "exterior");
  assert.equal(after.effectiveSelection.ipRating.value, "IP20");
  assert.equal(preview.fields.preview_state, "compatibility explained preview");
  assert.match(preview.fields.compatibility_summary, /compatible selections are not cleared/);
  assert.equal(preview.runtimeStatusFlags.compatibleSelectionClearingEnabled, false);
  assert.equal(preview.fields.lab_proof_status, "not established — Selector preview is not production proof authority");
  assert.match(preview.fields.unsafe_claims_blocked, /Lab Proof/);
});

test("Selector read-only resolver preview fails closed when source is unavailable", () => {
  const model = createModel({
    selectorReferenceStatus: {
      ok: false,
      status: "unavailable",
      source: { present: false, readable: false, parseable: false },
      expectedTables: ["SYSTEM"],
      presentTables: [],
      missingTables: ["SYSTEM"],
    },
  });
  const preview = model.expanderShell.readonlyResolverPreview;

  assert.equal(preview.fields.preview_state, "source unavailable");
  assert.equal(preview.fields.source_status, "source unavailable");
  assert.equal(preview.fields.source_tables_ready, "false");
  assert.match(preview.fields.unresolved_reasons, /Selector Reference source is not present/);
});
