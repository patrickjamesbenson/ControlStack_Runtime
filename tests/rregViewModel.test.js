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

test("RREG view model includes required read-only wording", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, [
    "Roles & Responsibilities / RREG is read-only and diagnostic in this slice.",
    "RREG maps responsibility; it does not create authority.",
    "RREG maps custody; it does not transfer custody.",
    "RREG maps reviewers and approvers; it does not approve.",
    "RREG may identify who should review or approve a change, but human approval remains explicit.",
    "RREG does not grant write power.",
    "RREG does not silently update KC, CLX, HubSpot, Board Data, Lab Proof, Selector, IES Builder, ledgers, or runtime data.",
    "Old donor RREG seed scripts are not run in runtime.",
    "Responsibility does not equal permission.",
  ]);
});

test("RREG diagnostic flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.equal(model.diagnosticStatus.readOnly, true);
  assert.equal(model.diagnosticStatus.diagnosticOnly, true);
  assert.equal(model.diagnosticStatus.responsibilityMappingOnly, true);
  assert.equal(model.diagnosticStatus.custodyTransferEnabled, false);
  assert.equal(model.diagnosticStatus.approvalAutomationEnabled, false);
  assert.equal(model.diagnosticStatus.permissionEnforcementEnabled, false);
  assert.equal(model.diagnosticStatus.peopleAssignmentEnabled, false);
  assert.equal(model.diagnosticStatus.seedScriptEnabled, false);
  assert.equal(model.diagnosticStatus.kcWriteEnabled, false);
  assert.equal(model.diagnosticStatus.clxWriteEnabled, false);
  assert.equal(model.diagnosticStatus.ledgerWriteEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotWriteEnabled, false);
  assert.equal(model.diagnosticStatus.boardDataWriteEnabled, false);
  assert.equal(model.diagnosticStatus.selectorMutationEnabled, false);
  assert.equal(model.diagnosticStatus.labProofMutationEnabled, false);
  assert.equal(model.diagnosticStatus.runtimeDataWriteEnabled, false);
  assert.equal(model.diagnosticStatus.hiddenWriteBackEnabled, false);
  assert.equal(model.guardrails.postEndpointAdded, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.donorRregImportEnabled, false);
  assert.equal(model.guardrails.seedScriptExecutionEnabled, false);
  assert.equal(model.guardrails.peopleAssignmentUiEnabled, false);
  assert.equal(model.guardrails.custodyTransferActionEnabled, false);
  assert.equal(model.guardrails.approvalButtonEnabled, false);
  assert.equal(model.guardrails.activeAutomationEnabled, false);
});

test("RREG displays boundaries, concepts, schema fields, relationships, and planned diagnostics", () => {
  const model = createModel();

  assert.deepEqual(model.roleBoundary, [
    "maps responsibility",
    "maps custody",
    "maps reviewers",
    "maps approvers",
    "maps evidence obligations",
    "maps ledger obligations",
    "does not grant authority",
    "does not approve",
    "does not transfer custody",
    "does not enforce permissions",
  ]);

  assert.deepEqual(model.responsibilityConcepts, [
    "owner",
    "backup owner",
    "maintainer",
    "reviewer",
    "approver",
    "custodian",
    "evidence owner",
    "ledger obligation owner",
  ]);

  assert.deepEqual(model.custodyConcepts, [
    "no custody",
    "proposed custody",
    "active custody",
    "custody in handoff",
    "transferred custody",
    "retired custody",
  ]);

  assert.deepEqual(model.approvalMappingConcepts, [
    "review recommended",
    "review required",
    "approval required",
    "final human approval required",
    "blocked pending evidence",
    "blocked pending controlled record",
  ]);

  assert.deepEqual(model.proposedResponsibilitySchemaFields, [
    "responsibility_id",
    "domain",
    "component",
    "role",
    "owner_ref",
    "backup_owner_ref",
    "custody_state",
    "authority_level",
    "decision_rights",
    "approval_required_for",
    "evidence_obligations",
    "ledger_obligations",
    "handoff_conditions",
    "handoff_record_refs",
    "active_from",
    "active_until",
    "status",
    "source_refs",
    "review_cycle",
  ]);

  assert.deepEqual(model.relationshipMap, [
    "Module Cards describe module boundaries.",
    "Knowledge Spine orients governance surfaces.",
    "Controlled Records prove decisions, evidence, disposition, and approval events.",
    "Liora may later use RREG for routing suggestions only.",
    "Handoff records prove custody movement.",
    "Admin / Dev may show responsibility gaps, but RREG does not unlock admin actions.",
  ]);

  assert.deepEqual(model.futureDiagnostics, [
    "modules with no owner mapped",
    "records with no custodian mapped",
    "terms with no reviewer mapped",
    "approval-required changes with no approver mapped",
    "stale review cycles",
    "missing source refs",
    "handoff conditions without handoff records",
  ]);
});
