import test from "node:test";
import assert from "node:assert/strict";

import { createRregViewModel } from "../packages/modules/rreg/rregViewModel.js";
import { createRregState } from "../packages/modules/rreg/rregState.js";

function createAdapter() {
  return {
    moduleId: "rreg",
    readSnapshots() {
      return {
        route: { moduleId: "rreg" },
        project: { metadata: { title: "Diagnostic Project" } },
        visibility: { visibleModules: ["rreg"], hiddenModules: [] },
      };
    },
    getModuleDecision() {
      return { visible: true, reason: "registered-by-shell-diagnostic-slice" };
    },
  };
}

function createModel() {
  return createRregViewModel({
    adapter: createAdapter(),
    rregState: createRregState(),
  });
}

const EXPECTED_BOUNDARY_COPY = [
  "RREG review responsibility mapping is read-only in this slice.",
  "RREG maps responsibility; it does not grant authority.",
  "RREG maps custody; it does not transfer custody.",
  "RREG maps reviewers and approvers; it does not approve.",
  "Controlled Records records provenance and disposition.",
  "Lab Proof remains the production proof authority.",
  "No people assignment, permission control, approval automation, custody transfer, controlled-record write, or hidden write-back is enabled.",
];

test("RREG view model includes required review responsibility boundary copy", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, EXPECTED_BOUNDARY_COPY);
  assert.deepEqual(model.boundaryCopy, EXPECTED_BOUNDARY_COPY);
});

test("RREG diagnostic flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.equal(model.runtimeStatusFlags.readOnly, true);
  assert.equal(model.runtimeStatusFlags.diagnosticOnly, true);
  assert.equal(model.runtimeStatusFlags.reviewResponsibilityMapOnly, true);
  assert.equal(model.runtimeStatusFlags.peopleAssignmentEnabled, false);
  assert.equal(model.runtimeStatusFlags.permissionControlEnabled, false);
  assert.equal(model.runtimeStatusFlags.approvalAutomationEnabled, false);
  assert.equal(model.runtimeStatusFlags.custodyTransferEnabled, false);
  assert.equal(model.runtimeStatusFlags.activeRoutingEnabled, false);
  assert.equal(model.runtimeStatusFlags.controlledRecordWriteEnabled, false);
  assert.equal(model.runtimeStatusFlags.labProofAuthority, false);
  assert.equal(model.runtimeStatusFlags.evidenceIngestionEnabled, false);
  assert.equal(model.runtimeStatusFlags.runtimeDataWriteEnabled, false);
  assert.equal(model.runtimeStatusFlags.hiddenWriteBackEnabled, false);

  assert.equal(model.diagnosticStatus.responsibilityMappingOnly, true);
  assert.equal(model.diagnosticStatus.permissionEnforcementEnabled, false);
  assert.equal(model.diagnosticStatus.seedScriptEnabled, false);
  assert.equal(model.diagnosticStatus.kcWriteEnabled, false);
  assert.equal(model.diagnosticStatus.clxWriteEnabled, false);
  assert.equal(model.diagnosticStatus.ledgerWriteEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotWriteEnabled, false);
  assert.equal(model.diagnosticStatus.boardDataWriteEnabled, false);
  assert.equal(model.diagnosticStatus.selectorMutationEnabled, false);
  assert.equal(model.diagnosticStatus.labProofMutationEnabled, false);

  assert.equal(model.guardrails.postEndpointAdded, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.donorRregImportEnabled, false);
  assert.equal(model.guardrails.seedScriptExecutionEnabled, false);
  assert.equal(model.guardrails.peopleAssignmentUiEnabled, false);
  assert.equal(model.guardrails.custodyTransferActionEnabled, false);
  assert.equal(model.guardrails.approvalButtonEnabled, false);
  assert.equal(model.guardrails.approvalAutomationEnabled, false);
  assert.equal(model.guardrails.permissionControlEnabled, false);
  assert.equal(model.guardrails.activeRoutingEnabled, false);
  assert.equal(model.guardrails.controlledRecordWriteEnabled, false);
  assert.equal(model.guardrails.evidenceIngestionEnabled, false);
  assert.equal(model.guardrails.labProofAuthority, false);
  assert.equal(model.guardrails.activeAutomationEnabled, false);
});

test("RREG displays responsibility mapping categories and review custody fields", () => {
  const model = createModel();

  assert.deepEqual(model.responsibilityMappingCategories, [
    "responsible_owner",
    "backup_owner",
    "technical_reviewer",
    "evidence_reviewer",
    "compliance_reviewer",
    "lab_reviewer",
    "approval_recommender",
    "human_approver",
    "custody_holder",
    "escalation_contact",
  ]);

  assert.deepEqual(model.reviewCustodyFields, [
    "responsibility_ref",
    "controlled_record_ref",
    "candidate_ref",
    "artefact_ref",
    "evidence_ref",
    "review_domain",
    "reviewer_role",
    "approver_role",
    "custody_role",
    "backup_role",
    "review_status",
    "approval_required",
    "approval_status",
    "custody_status",
    "escalation_condition",
  ]);
});

test("RREG explains review path and relationship map", () => {
  const model = createModel();

  assert.deepEqual(model.reviewPathMap, [
    "candidate identified",
    "evidence expected",
    "controlled record created later",
    "reviewer role mapped",
    "approver role mapped",
    "custody role mapped",
    "human review required",
    "approval disposition recorded later",
    "custody transfer not performed by RREG",
  ]);

  assert.deepEqual(model.relationshipMap, [
    "Controlled Records: provenance/disposition/audit trail",
    "RREG: responsibility/reviewer/approver/custody mapping",
    "Lab Proof: production proof boundary",
    "Compliance Matters: evidence/risk/review map, not certification",
    "Selector: candidate/selection source",
    "IES Builder: candidate artefact source later",
    "Liora: future draft/recommendation/intake helper only, no approval",
  ]);
});

test("RREG preserves role boundary and planned no-write diagnostics", () => {
  const model = createModel();

  assert.deepEqual(model.roleBoundary, [
    "maps responsibility",
    "maps custody",
    "maps reviewers",
    "maps approvers",
    "maps evidence obligations",
    "maps controlled-record obligations",
    "does not grant authority",
    "does not approve",
    "does not transfer custody",
    "does not enforce permissions",
  ]);

  assert.deepEqual(model.futureDiagnostics, [
    "records with no responsibility role mapped",
    "candidate artefacts with no reviewer role mapped",
    "approval-required records with no human approver role mapped",
    "evidence references with no evidence reviewer role mapped",
    "custody references with no custody holder role mapped",
    "escalation conditions without escalation contact roles",
    "review domains missing controlled-record references",
  ]);
});
