import test from "node:test";
import assert from "node:assert/strict";

import { createKnowledgeSpineViewModel } from "../packages/modules/knowledge-spine/knowledgeSpineViewModel.js";
import { createKnowledgeSpineState } from "../packages/modules/knowledge-spine/knowledgeSpineState.js";

function createAdapter() {
  return {
    moduleId: "knowledge_spine",
    readSnapshots() {
      return {
        route: { moduleId: "knowledge_spine" },
        project: { metadata: { title: "Diagnostic Project" } },
        visibility: { visibleModules: ["knowledge_spine"], hiddenModules: [] },
      };
    },
    getModuleDecision() {
      return { visible: true, reason: "registered-by-shell-diagnostic-slice" };
    },
  };
}

function createModel() {
  return createKnowledgeSpineViewModel({
    adapter: createAdapter(),
    knowledgeSpineState: createKnowledgeSpineState(),
  });
}

test("Knowledge Spine view model includes required read-only boundary wording", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, [
    "Knowledge Spine is read-only and diagnostic in this slice.",
    "Module Cards describe runtime/module authority boundaries; they do not create authority.",
    "Knowledge Cards are governed knowledge and must not override code truth, Board Data, or Lab proof.",
    "CLX / canonical language controls vocabulary, but must not override Board Data, Lab proof, or code truth.",
    "Ledger records are evidence/disposition trails, not task lists.",
    "Liora may later classify, route, draft, and recommend, but must not silently approve, write, or overwrite governed truth.",
    "Human approval is required for governed knowledge updates.",
    "Ship Audit is retired in favour of Git, commits, module status, and verification notes.",
    "MAL is shelved as a primary system and may later return only as a derived action view.",
    "CI Inbox is folded into the future Intake Ledger pattern.",
    "Ledger Health is a diagnostic pattern, not a standalone authority module.",
  ]);
});

test("Knowledge Spine diagnostic flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.equal(model.diagnosticStatus.readOnly, true);
  assert.equal(model.diagnosticStatus.diagnosticOnly, true);
  assert.equal(model.diagnosticStatus.activeAutomationEnabled, false);
  assert.equal(model.diagnosticStatus.kcWriteEnabled, false);
  assert.equal(model.diagnosticStatus.clxWriteEnabled, false);
  assert.equal(model.diagnosticStatus.ledgerWriteEnabled, false);
  assert.equal(model.diagnosticStatus.lioraAutomationEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotWriteEnabled, false);
  assert.equal(model.diagnosticStatus.repoMapMutationEnabled, false);
  assert.equal(model.diagnosticStatus.governedTruthMutationEnabled, false);
  assert.equal(model.guardrails.hiddenWriteBackEnabled, false);
});

test("Knowledge Spine displays module card fields, planned components, decisions, and authority boundaries", () => {
  const model = createModel();

  assert.deepEqual(model.moduleCardFields, [
    "module_id",
    "module_name",
    "route",
    "status",
    "maturity_stage",
    "owns",
    "does_not_own",
    "reads_from",
    "writes_to",
    "authority_boundaries",
    "proof_boundaries",
    "upstream_dependencies",
    "downstream_consumers",
    "ledger_interfaces",
    "last_verified_commit",
  ]);

  assert.deepEqual(model.components, [
    "Module Cards",
    "Knowledge Cards / KC",
    "CLX / Canonical Language",
    "Controlled Records / Ledger",
    "Ledger Health diagnostics",
    "Liora Cockpit",
    "RREG / Responsibility",
    "Engine Flow",
    "RepoMap",
  ]);

  assert.deepEqual(model.decisions["Keep / rebuild"], ["KC", "CLX", "Module Cards", "Controlled Records", "Liora", "RREG", "Engine Flow", "RepoMap"]);
  assert.deepEqual(model.decisions.Shelve, ["MAL as primary system", "CI Inbox as standalone inbox"]);
  assert.deepEqual(model.decisions.Retire, ["Ship Audit"]);
  assert.deepEqual(model.decisions.Reframe, ["Ledger Health as diagnostic pattern"]);

  assert.deepEqual(model.authorityBoundaries, [
    "Lab proves.",
    "Board Data defines product/component metadata.",
    "Selector resolves selections.",
    "IES Builder generates candidate outputs.",
    "Compliance maps evidence/risk/review, but does not certify.",
    "EGRES supports emergency workflow, but does not self-certify.",
    "Knowledge Spine does not override those authorities.",
  ]);
});
