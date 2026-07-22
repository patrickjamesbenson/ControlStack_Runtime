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
          metadata: { title: "Selector Readiness Diagnostic Project", projectId: "SEL-READINESS" },
          currentProject: { title: "Selector Readiness Diagnostic Project", projectId: "SEL-READINESS" },
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

test("Selector readiness diagnostics include required boundary copy and relationship map", () => {
  const model = createModel();
  const diagnostics = model.selectorDiagnostics.readiness;

  assert.equal(diagnostics.readOnly, true);
  assert.equal(diagnostics.diagnosticOnly, true);
  assert.deepEqual(diagnostics.requiredBoundaryCopy, [
    "Selector readiness diagnostics are read-only in this slice.",
    "Compatibility is not proof.",
    "Spec-ready does not mean production-proven.",
    "Slug generation remains disabled unless an approved future Spec Ready state is reached.",
    "A candidate may be compatible without being Lab proven.",
    "Board Data defines metadata. Selector resolves. Lab proves.",
    "IES Builder may create candidate photometric artefacts later.",
    "Engine Flow explains the confidence path; it does not execute it.",
  ]);
  assert.deepEqual(diagnostics.manualVsAuto, [
    "Manual selections are constraints.",
    "Auto selections are consequences.",
    "Compatible selections must not be cleared just because another field changes.",
    "Auto-derived items may appear selected but must remain changeable.",
    "Fresh load is preamble/default-preview state, not spec-ready state.",
  ]);
  assert.deepEqual(diagnostics.relationshipMap, [
    { system: "Board Data", role: "metadata authority" },
    { system: "Selector", role: "selection and readiness reasoning" },
    { system: "IES Builder", role: "future candidate photometric artefacts" },
    { system: "Engine Flow", role: "confidence path explanation" },
    { system: "Lab Proof", role: "production proof authority" },
    { system: "Controlled Records", role: "future approval/provenance trail" },
  ]);
});

test("Selector compatibility diagnostics expose fail-closed status flags, dimensions, and reason states", () => {
  const model = createModel();
  const compatibility = model.selectorDiagnostics.readiness.compatibility;

  assert.equal(compatibility.runtimeStatusFlags.readOnly, true);
  assert.equal(compatibility.runtimeStatusFlags.diagnosticOnly, true);
  assert.equal(compatibility.runtimeStatusFlags.compatibilityExplanationOnly, true);
  assert.equal(compatibility.runtimeStatusFlags.activeResolverEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.autoSelectionMutationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.manualConstraintMutationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.specGenerationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.slugGenerationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.boardDataWriteEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.labProofAuthority, false);
  assert.equal(compatibility.runtimeStatusFlags.iesGenerationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.engineExecutionEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.runTableGenerationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.payloadGenerationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.drawingGenerationEnabled, false);
  assert.equal(compatibility.runtimeStatusFlags.hiddenWriteBackEnabled, false);

  assert.deepEqual(compatibility.dimensions, [
    "product family",
    "body/profile",
    "board",
    "optic",
    "diffuser/lens",
    "driver",
    "electrical operating window",
    "physical fit",
    "IP / IK / environment",
    "emergency / EGRES dependency",
    "compliance dependency",
    "special parts dependency",
    "IES candidate readiness",
    "Lab Proof mapping",
    "missing metadata",
  ]);
  assert.deepEqual(compatibility.reasonStates, [
    "compatible",
    "incompatible",
    "unknown",
    "missing metadata",
    "blocked by policy",
    "candidate only",
    "requires review",
    "requires Lab Proof",
  ]);
});

test("Selector spec-gate readiness diagnostics expose gates, requirements, and disabled generation flags", () => {
  const model = createModel();
  const specGate = model.selectorDiagnostics.readiness.specGate;

  assert.equal(specGate.runtimeStatusFlags.readOnly, true);
  assert.equal(specGate.runtimeStatusFlags.diagnosticOnly, true);
  assert.equal(specGate.runtimeStatusFlags.specGateExplanationOnly, true);
  assert.equal(specGate.runtimeStatusFlags.specGenerationEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.slugGenerationEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.activeResolverEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.boardDataWriteEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.selectorMutationEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.iesGenerationEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.engineExecutionEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.runTableGenerationEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.payloadGenerationEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.drawingGenerationEnabled, false);
  assert.equal(specGate.runtimeStatusFlags.labProofAuthority, false);
  assert.equal(specGate.runtimeStatusFlags.hiddenWriteBackEnabled, false);

  assert.deepEqual(specGate.gateStates, [
    "preamble / default preview",
    "manually constrained",
    "auto consequences visible",
    "candidate-ready",
    "Spec Ready incomplete",
    "spec-ready",
    "blocked / requires review",
  ]);
  assert.deepEqual(specGate.gateRequirements, [
    "product family selected",
    "system/body selected",
    "board candidate resolved",
    "optic/diffuser intent resolved",
    "driver/electrical readiness resolved",
    "accessory/special-parts policy checked",
    "IES candidate readiness checked",
    "compliance/EGRES dependencies checked",
    "Board Data reference present",
    "Lab Proof status clearly separated",
    "required review warnings surfaced",
  ]);
  assert.deepEqual(specGate.missingBlockedReasonCategories, [
    "missing manual constraint",
    "unresolved auto consequence",
    "missing Board Data reference",
    "missing IES candidate",
    "missing Lab Proof mapping",
    "policy warning",
    "requires human review",
    "future-gated downstream artefact",
    "unsafe authority claim",
  ]);

  const readiness = Object.fromEntries(specGate.readinessRows);
  assert.equal(readiness["spec-ready"], "false");
  assert.equal(readiness["slug generation"], "disabled");
  assert.equal(readiness["spec generation"], "disabled");
  assert.equal(readiness["Lab Proof status"], "separated — not asserted by Selector");
});

test("Creating readiness diagnostics does not mutate Selector state or clear selections", () => {
  const selectorState = createSelectorState();
  selectorState.setSelectorFieldValue("interiorExterior", "exterior");
  const before = selectorState.getSnapshot().selectorStateContract;

  const model = createModel(selectorState);
  const after = selectorState.getSnapshot().selectorStateContract;

  assert.deepEqual(after.manualConstraints, before.manualConstraints);
  assert.deepEqual(after.autoConsequences, before.autoConsequences);
  assert.deepEqual(after.effectiveSelection, before.effectiveSelection);

  assert.equal(after.manualConstraints.interiorExterior.value, "exterior");
  assert.equal(Object.hasOwn(after.effectiveSelection, "ipRating"), false);
  assert.equal(model.selectorDiagnostics.readiness.compatibility.runtimeStatusFlags.manualConstraintMutationEnabled, false);
  assert.equal(model.selectorDiagnostics.readiness.specGate.runtimeStatusFlags.selectorMutationEnabled, false);

  const blockedRows = model.selectorDiagnostics.readiness.compatibility.blockedFieldRows;
  assert.equal(blockedRows.some(([, message]) => String(message).includes("autoCleared:false")), true);
});


test("fresh Selector state has no fabricated product selection truth", () => {
  const contract = createSelectorState().getSnapshot().selectorStateContract;
  assert.deepEqual(contract.defaultPreviewSelections, {});
  assert.deepEqual(contract.autoConsequences, {});
  assert.deepEqual(contract.effectiveSelection, {});
  assert.equal(contract.selectorMode, "empty-preamble");
  assert.doesNotMatch(JSON.stringify({
    defaultPreviewSelections: contract.defaultPreviewSelections,
    autoConsequences: contract.autoConsequences,
    effectiveSelection: contract.effectiveSelection,
  }), /linear-60|1200|IK07|preview-only|cut_to_length/);
});
