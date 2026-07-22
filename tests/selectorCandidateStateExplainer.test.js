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
          metadata: { title: "Selector Candidate Diagnostic Project", projectId: "SEL-CANDIDATE" },
          currentProject: { title: "Selector Candidate Diagnostic Project", projectId: "SEL-CANDIDATE" },
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

function createModel(selectorState = createSelectorState()) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: { readOnly: true, rawRowsExposed: false, rawUsersExposed: false, rawLabEvidenceExposed: false },
  });
}

test("Selector candidate-state explainer exposes required read-only runtime flags", () => {
  const model = createModel();
  const explainer = model.selectorDiagnostics.readiness.candidateState;

  assert.equal(explainer.runtimeStatusFlags.readOnly, true);
  assert.equal(explainer.runtimeStatusFlags.diagnosticOnly, true);
  assert.equal(explainer.runtimeStatusFlags.candidateStateExplanationOnly, true);
  assert.equal(explainer.runtimeStatusFlags.activeResolverEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.selectorMutationEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.compatibleSelectionClearingEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.specGenerationEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.slugGenerationEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.iesGenerationEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.labProofAuthority, false);
  assert.equal(explainer.runtimeStatusFlags.controlledRecordWriteEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.rregApprovalEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.rregCustodyTransferEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.boardDataWriteEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.runtimeDataWriteEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.hiddenWriteBackEnabled, false);
});

test("Selector candidate-state explainer shows categories, field labels, readiness chain, and boundary copy", () => {
  const model = createModel();
  const explainer = model.selectorDiagnostics.readiness.candidateState;

  assert.deepEqual(explainer.categories, [
    "default preview",
    "manually constrained candidate",
    "auto-consequence candidate",
    "compatibility-explained candidate",
    "candidate-ready",
    "Spec Ready incomplete",
    "spec-ready candidate",
    "downstream artefacts disabled",
    "proof not established",
    "review/provenance future-gated",
  ]);
  assert.deepEqual(explainer.fields, [
    "candidate_state",
    "manual_constraints",
    "auto_consequences",
    "effective_selection",
    "compatibility_summary",
    "spec_gate_summary",
    "ies_candidate_readiness",
    "lab_proof_readiness",
    "controlled_record_expectation",
    "rreg_review_expectation",
    "downstream_outputs_disabled",
    "proof_boundary",
    "unsafe_claims_blocked",
  ]);
  assert.deepEqual(explainer.readinessChainMap, [
    { system: "Selector readiness", role: "selection/candidate reasoning" },
    { system: "IES Builder readiness", role: "candidate artefact readiness later" },
    { system: "Lab Proof readiness", role: "proof boundary, not active proof authority in this slice" },
    { system: "Controlled Records", role: "future provenance/disposition trail" },
    { system: "RREG", role: "future reviewer/approver/custody mapping" },
    { system: "Engine Flow", role: "confidence path explanation, not execution" },
  ]);
  assert.deepEqual(explainer.boundaryCopy, [
    "Selector candidate state is read-only and diagnostic in this slice.",
    "A candidate is not a production specification.",
    "A compatible candidate is not Lab proven.",
    "Spec-ready does not mean production-proven.",
    "Selector does not generate IES, create Controlled Records, invoke RREG, or claim Lab Proof here.",
    "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
    "Controlled Records records provenance later. RREG maps review and custody later.",
  ]);
});

test("Selector candidate-state explainer distinguishes default, constrained, and compatibility-explained states without mutation", () => {
  const defaultModel = createModel();
  const defaultFields = Object.fromEntries(defaultModel.selectorDiagnostics.readiness.candidateState.fieldRows);
  assert.equal(defaultFields.candidate_state, "default preview");
  assert.equal(defaultFields.proof_boundary, "candidate/spec-ready is not production-proven and is not Lab Proof");

  const selectorState = createSelectorState();
  selectorState.setSelectorFieldValue("interiorExterior", "exterior");
  const before = selectorState.getSnapshot().selectorStateContract;

  const constrainedModel = createModel(selectorState);
  const after = selectorState.getSnapshot().selectorStateContract;
  const constrainedFields = Object.fromEntries(constrainedModel.selectorDiagnostics.readiness.candidateState.fieldRows);

  assert.deepEqual(after.manualConstraints, before.manualConstraints);
  assert.deepEqual(after.autoConsequences, before.autoConsequences);
  assert.deepEqual(after.effectiveSelection, before.effectiveSelection);
  assert.equal(constrainedFields.candidate_state, "compatibility-explained candidate");
  assert.match(constrainedFields.compatibility_summary, /warning/);
  assert.equal(constrainedFields.ies_candidate_readiness, "future-gated candidate artefact readiness; IES generation disabled here");
  assert.equal(constrainedFields.lab_proof_readiness, "not established by Selector; Lab Proof remains the proof boundary");
  assert.equal(constrainedFields.rreg_review_expectation, "future reviewer/approver/custody mapping only; no approval or custody transfer");
});

test("Selector candidate-state explainer does not duplicate generation, proof, record, or RREG authority claims", () => {
  const model = createModel();
  const explainer = model.selectorDiagnostics.readiness.candidateState;
  const fields = Object.fromEntries(explainer.fieldRows);

  assert.equal(fields.downstream_outputs_disabled, "IES, payload, RunTable, drawings, records, RREG approvals, and proof are disabled");
  assert.equal(fields.unsafe_claims_blocked, "Lab Proof, Controlled Records, RREG approval, custody transfer, and hidden write-back claims are blocked");
  assert.equal(explainer.runtimeStatusFlags.iesGenerationEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.controlledRecordWriteEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.rregApprovalEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.rregCustodyTransferEnabled, false);
  assert.equal(explainer.runtimeStatusFlags.runtimeDataWriteEnabled, false);
});
