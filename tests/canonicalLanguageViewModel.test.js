import test from "node:test";
import assert from "node:assert/strict";

import { createCanonicalLanguageViewModel } from "../packages/modules/canonical-language/canonicalLanguageViewModel.js";
import { createCanonicalLanguageState } from "../packages/modules/canonical-language/canonicalLanguageState.js";

function createAdapter() {
  return {
    moduleId: "canonical_language",
    readSnapshots() {
      return {
        route: { moduleId: "canonical_language" },
        project: { metadata: { title: "Diagnostic Project" } },
        visibility: { visibleModules: ["canonical_language"], hiddenModules: [] },
      };
    },
    getModuleDecision() {
      return { visible: true, reason: "registered-by-shell-diagnostic-slice" };
    },
  };
}

function createModel() {
  return createCanonicalLanguageViewModel({
    adapter: createAdapter(),
    canonicalLanguageState: createCanonicalLanguageState(),
  });
}

test("Canonical Language view model includes required read-only CLX wording", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, [
    "Canonical Language / CLX is read-only and diagnostic in this slice.",
    "CLX controls vocabulary; it does not create authority.",
    "CLX does not override Board Data, Lab Proof, code truth, Module Cards, or Controlled Records.",
    "CLX may help Liora, Knowledge Base, RREG, and Controlled Records use consistent terms.",
    "Human approval is required before governed terminology changes.",
    "No CLX editing, glossary mutation, KC write-back, HubSpot write, Selector mutation, or hidden write-back is enabled.",
  ]);
});

test("Canonical Language diagnostic flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.equal(model.diagnosticStatus.readOnly, true);
  assert.equal(model.diagnosticStatus.diagnosticOnly, true);
  assert.equal(model.diagnosticStatus.vocabularyReferenceOnly, true);
  assert.equal(model.diagnosticStatus.clxWriteEnabled, false);
  assert.equal(model.diagnosticStatus.glossaryMutationEnabled, false);
  assert.equal(model.diagnosticStatus.synonymAutoCorrectionEnabled, false);
  assert.equal(model.diagnosticStatus.kcWriteEnabled, false);
  assert.equal(model.diagnosticStatus.lioraAutomationEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotWriteEnabled, false);
  assert.equal(model.diagnosticStatus.selectorMutationEnabled, false);
  assert.equal(model.diagnosticStatus.boardDataMutationEnabled, false);
  assert.equal(model.diagnosticStatus.labProofMutationEnabled, false);
  assert.equal(model.diagnosticStatus.runtimeDataWriteEnabled, false);
  assert.equal(model.diagnosticStatus.hiddenWriteBackEnabled, false);
  assert.equal(model.guardrails.postEndpointAdded, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.donorClxImportEnabled, false);
  assert.equal(model.guardrails.clxEditorEnabled, false);
  assert.equal(model.guardrails.glossaryEditorEnabled, false);
  assert.equal(model.guardrails.autoCorrectionWorkflowEnabled, false);
  assert.equal(model.guardrails.kcWriterEnabled, false);
  assert.equal(model.guardrails.lioraWriterEnabled, false);
  assert.equal(model.guardrails.exportButtonEnabled, false);
  assert.equal(model.guardrails.sendButtonEnabled, false);
  assert.equal(model.guardrails.activeAutomationEnabled, false);
});

test("Canonical Language displays boundaries, schema fields, relationships, and planned diagnostics", () => {
  const model = createModel();

  assert.deepEqual(model.roleBoundary, [
    "defines preferred terms later",
    "maps aliases later",
    "maps forbidden/retired terms later",
    "maps language risks later",
    "supports Liora routing/recommendations later",
    "does not prove",
    "does not approve",
    "does not mutate data",
    "does not replace Board Data, Lab Proof, code truth, or Module Cards",
  ]);

  assert.deepEqual(model.proposedCanonicalTermFields, [
    "term_id",
    "canonical_term",
    "aliases",
    "retired_terms",
    "forbidden_terms",
    "definition",
    "domain",
    "module_refs",
    "board_data_refs",
    "lab_proof_refs",
    "kc_refs",
    "controlled_record_refs",
    "rreg_refs",
    "status",
    "source_refs",
    "review_cycle",
    "approved_by",
    "approved_at",
  ]);

  assert.deepEqual(model.languageRelationshipMap, [
    "Knowledge Spine orients the language system.",
    "Module Cards describe module boundaries.",
    "KC uses CLX terms but does not override code truth.",
    "Liora may use CLX for safer classification and drafting.",
    "Controlled Records may cite CLX for terminology decisions.",
    "RREG may identify reviewers for terminology changes.",
    "Board Data remains metadata authority.",
    "Lab Proof remains proof authority.",
  ]);

  assert.deepEqual(model.futureDiagnostics, [
    "terms with no owner",
    "aliases with no canonical term",
    "retired terms still appearing in module copy",
    "terms requiring review",
    "conflicting terms across modules",
    "missing source references",
    "language that overclaims proof or authority",
  ]);
});
