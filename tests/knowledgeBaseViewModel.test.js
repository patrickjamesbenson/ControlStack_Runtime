import test from "node:test";
import assert from "node:assert/strict";

import { createKnowledgeBaseViewModel } from "../packages/modules/knowledge-base/knowledgeBaseViewModel.js";
import { createKnowledgeBaseState } from "../packages/modules/knowledge-base/knowledgeBaseState.js";

function createAdapter() {
  return {
    moduleId: "knowledge_base",
    readSnapshots() {
      return {
        route: { moduleId: "knowledge_base" },
        project: { metadata: { title: "Diagnostic Project" } },
        visibility: { visibleModules: ["knowledge_base"], hiddenModules: [] },
      };
    },
    getModuleDecision() {
      return { visible: true, reason: "registered-by-shell-diagnostic-slice" };
    },
  };
}

function createModel() {
  return createKnowledgeBaseViewModel({
    adapter: createAdapter(),
    knowledgeBaseState: createKnowledgeBaseState(),
  });
}

test("Knowledge Base view model includes required read-only KC wording", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, [
    "Knowledge Base / Knowledge Cards is read-only and diagnostic in this slice.",
    "Knowledge Cards are governed knowledge; they do not create authority.",
    "KC does not override code truth, Board Data, Lab Proof, Module Cards, or Controlled Records.",
    "Human approval is required before governed knowledge updates.",
    "Liora may later draft or recommend knowledge updates, but must not silently approve or publish them.",
    "No KC editing, publishing, approval automation, HubSpot write, CLX mutation, or hidden write-back is enabled.",
  ]);
});

test("Knowledge Base diagnostic flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.equal(model.diagnosticStatus.readOnly, true);
  assert.equal(model.diagnosticStatus.diagnosticOnly, true);
  assert.equal(model.diagnosticStatus.knowledgeReferenceOnly, true);
  assert.equal(model.diagnosticStatus.kcWriteEnabled, false);
  assert.equal(model.diagnosticStatus.kcPublishEnabled, false);
  assert.equal(model.diagnosticStatus.approvalAutomationEnabled, false);
  assert.equal(model.diagnosticStatus.lioraAutomationEnabled, false);
  assert.equal(model.diagnosticStatus.clxMutationEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotWriteEnabled, false);
  assert.equal(model.diagnosticStatus.boardDataMutationEnabled, false);
  assert.equal(model.diagnosticStatus.labProofMutationEnabled, false);
  assert.equal(model.diagnosticStatus.selectorMutationEnabled, false);
  assert.equal(model.diagnosticStatus.runtimeDataWriteEnabled, false);
  assert.equal(model.diagnosticStatus.hiddenWriteBackEnabled, false);
  assert.equal(model.guardrails.postEndpointAdded, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.donorKcImportEnabled, false);
  assert.equal(model.guardrails.kcEditorEnabled, false);
  assert.equal(model.guardrails.publishButtonEnabled, false);
  assert.equal(model.guardrails.approvalButtonEnabled, false);
  assert.equal(model.guardrails.approvalAutomationEnabled, false);
  assert.equal(model.guardrails.lioraWriteBackEnabled, false);
  assert.equal(model.guardrails.exportButtonEnabled, false);
  assert.equal(model.guardrails.sendButtonEnabled, false);
  assert.equal(model.guardrails.activeAutomationEnabled, false);
});

test("Knowledge Base displays boundaries, schema fields, relationships, and planned diagnostics", () => {
  const model = createModel();

  assert.deepEqual(model.roleBoundary, [
    "references governed knowledge",
    "describes concepts later",
    "links to source references later",
    "links to CLX terms later",
    "links to Controlled Records later",
    "does not approve",
    "does not prove",
    "does not publish",
    "does not override code / Board Data / Lab Proof",
  ]);

  assert.deepEqual(model.proposedKnowledgeCardFields, [
    "knowledge_card_id",
    "title",
    "summary",
    "domain",
    "module_refs",
    "canonical_terms",
    "source_refs",
    "evidence_refs",
    "board_data_refs",
    "lab_proof_refs",
    "controlled_record_refs",
    "rreg_refs",
    "status",
    "review_cycle",
    "approved_by",
    "approved_at",
    "supersedes_card_id",
  ]);

  assert.deepEqual(model.knowledgeRelationshipMap, [
    "Knowledge Spine orients knowledge surfaces.",
    "Module Cards describe module boundaries.",
    "CLX controls vocabulary.",
    "Controlled Records capture update provenance, review, approval, and disposition.",
    "RREG maps reviewers, approvers, owners, and custodians.",
    "Liora may draft or recommend but must not publish.",
    "Board Data remains metadata authority.",
    "Lab Proof remains proof authority.",
    "Git/code remains code truth.",
  ]);

  assert.deepEqual(model.futureDiagnostics, [
    "cards with no owner",
    "cards with stale review cycle",
    "cards with missing source references",
    "cards using retired CLX terms",
    "cards making proof claims without Lab Proof",
    "cards conflicting with Module Cards",
    "cards that need Controlled Record approval trail",
  ]);
});
