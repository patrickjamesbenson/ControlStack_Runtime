import test from "node:test";
import assert from "node:assert/strict";

import { createLioraCockpitState } from "../packages/modules/liora-cockpit/lioraCockpitState.js";
import { createLioraCockpitViewModel } from "../packages/modules/liora-cockpit/lioraCockpitViewModel.js";

function createAdapter() {
  return {
    moduleId: "liora_cockpit",
    readSnapshots() {
      return {
        route: { moduleId: "liora_cockpit" },
        project: { metadata: { title: "Diagnostic Project" } },
        visibility: { visibleModules: ["liora_cockpit"], hiddenModules: [] },
      };
    },
    getModuleDecision() {
      return { visible: true, reason: "registered-by-shell-diagnostic-slice" };
    },
  };
}

function createModel() {
  return createLioraCockpitViewModel({
    adapter: createAdapter(),
    lioraCockpitState: createLioraCockpitState(),
  });
}

test("Liora Cockpit view model includes required read-only wording", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, [
    "Liora Cockpit is read-only and diagnostic in this slice.",
    "Liora may later classify, route, draft, and recommend.",
    "Liora does not silently approve, write, overwrite, merge, close, or publish governed truth.",
    "Liora does not update HubSpot, KC, CLX, Board Data, Lab Proof, Selector, IES Builder, Controlled Records, RREG, or runtime data.",
    "Liora is an orchestration cockpit, not a hidden central authority.",
    "Human approval is required before governed updates.",
    "Controlled Records provide the intake/disposition/audit trail.",
    "RREG maps responsibility, custody, and approval routing; it does not approve.",
  ]);
});

test("Liora Cockpit diagnostic flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.equal(model.diagnosticStatus.readOnly, true);
  assert.equal(model.diagnosticStatus.diagnosticOnly, true);
  assert.equal(model.diagnosticStatus.activeMessageIngestionEnabled, false);
  assert.equal(model.diagnosticStatus.chatAgentEnabled, false);
  assert.equal(model.diagnosticStatus.draftCreationEnabled, false);
  assert.equal(model.diagnosticStatus.sendEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotReadEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotWriteEnabled, false);
  assert.equal(model.diagnosticStatus.kcWriteEnabled, false);
  assert.equal(model.diagnosticStatus.clxWriteEnabled, false);
  assert.equal(model.diagnosticStatus.ledgerWriteEnabled, false);
  assert.equal(model.diagnosticStatus.controlledRecordWriteEnabled, false);
  assert.equal(model.diagnosticStatus.rregWriteEnabled, false);
  assert.equal(model.diagnosticStatus.boardDataWriteEnabled, false);
  assert.equal(model.diagnosticStatus.selectorMutationEnabled, false);
  assert.equal(model.diagnosticStatus.labProofMutationEnabled, false);
  assert.equal(model.diagnosticStatus.iesGenerationEnabled, false);
  assert.equal(model.diagnosticStatus.governedTruthMutationEnabled, false);
  assert.equal(model.diagnosticStatus.hiddenWriteBackEnabled, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.messageIngestionEnabled, false);
  assert.equal(model.guardrails.chatInputEnabled, false);
  assert.equal(model.guardrails.sendButtonEnabled, false);
  assert.equal(model.guardrails.draftCreationEnabled, false);
  assert.equal(model.guardrails.hubSpotCallEnabled, false);
  assert.equal(model.guardrails.gmailCallEnabled, false);
  assert.equal(model.guardrails.hiddenBackendCallEnabled, false);
  assert.equal(model.guardrails.hiddenWriteBackEnabled, false);
});

test("Liora Cockpit displays boundary, lifecycle, provenance, relationships, disabled actions, and forbidden actions", () => {
  const model = createModel();

  assert.deepEqual(model.roleBoundary, [
    "captures later",
    "classifies later",
    "routes later",
    "drafts later",
    "recommends later",
    "does not approve",
    "does not write",
    "does not overwrite",
    "does not send",
    "does not publish",
    "does not replace human review",
  ]);

  assert.deepEqual(model.intakeLifecycle, [
    "receive/capture",
    "safe summary",
    "classify",
    "split into items",
    "route using Controlled Records and RREG",
    "draft/recommend",
    "require human approval",
    "disposition",
    "audit trail",
  ]);

  assert.deepEqual(model.provenanceModel, [
    "source reference",
    "safe summary",
    "Knowledge Spine references",
    "KC references",
    "CLX references",
    "Controlled Record references",
    "RREG routing references",
    "module references",
    "web references only if allowed later",
    "confidence boundary",
    "human approval status",
  ]);

  assert.deepEqual(model.relationshipRows, [
    ["Knowledge Spine", "Knowledge Spine provides governance orientation."],
    ["Module Cards", "Module Cards describe module boundaries."],
    ["Controlled Records", "Controlled Records provide intake, disposition, and audit trail."],
    ["RREG", "RREG maps who should review, approve, or hold custody."],
    ["KC", "KC provides governed knowledge."],
    ["CLX", "CLX provides controlled vocabulary."],
    ["HubSpot", "HubSpot may later provide CRM/project context safely."],
    ["Liora", "Liora does not replace any of those authorities."],
  ]);

  assert.deepEqual(model.futureAllowedActions, [
    "classify intake",
    "suggest route",
    "suggest reviewer",
    "suggest approver",
    "draft answer",
    "draft knowledge update",
    "draft controlled record",
    "draft handoff note",
  ]);
  assert.equal(model.futureAllowedActionRows.every(([, status]) => status === "disabled in this slice"), true);

  assert.deepEqual(model.forbiddenActions, [
    "silent KC update",
    "silent CLX update",
    "silent HubSpot update",
    "silent customer message",
    "automatic approval",
    "automatic custody transfer",
    "Selector mutation",
    "Board Data mutation",
    "Lab Proof mutation",
    "IES generation",
    "hidden write-back",
    "replacing Git/code truth",
  ]);
});
