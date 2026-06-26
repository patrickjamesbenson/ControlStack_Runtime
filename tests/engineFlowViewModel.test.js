import test from "node:test";
import assert from "node:assert/strict";

import { createEngineFlowViewModel } from "../packages/modules/engine-flow/engineFlowViewModel.js";
import { createEngineFlowState } from "../packages/modules/engine-flow/engineFlowState.js";

function createAdapter() {
  return {
    moduleId: "engine_flow",
    readSnapshots() {
      return {
        route: { moduleId: "engine_flow" },
        project: { metadata: { title: "Diagnostic Project" } },
        visibility: { visibleModules: ["engine_flow"], hiddenModules: [] },
      };
    },
    getModuleDecision() {
      return { visible: true, reason: "registered-by-shell-diagnostic-slice" };
    },
  };
}

function createModel() {
  return createEngineFlowViewModel({
    adapter: createAdapter(),
    engineFlowState: createEngineFlowState(),
  });
}

test("Engine Flow view model includes required read-only diagnostic wording", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, [
    "Engine Flow is read-only and diagnostic in this slice.",
    "Engine Flow explains the path. It does not execute the path.",
    "Engine Flow is a static confidence/process map.",
    "Engine Flow does not resolve Selector state.",
    "Engine Flow does not fire the engine.",
    "Engine Flow does not generate IES, RunTable, payload, drawings, or Lab proof.",
    "Board Data defines product/component metadata.",
    "Selector resolves selections.",
    "IES Builder produces candidate outputs only.",
    "Lab Proof proves.",
    "Candidate confidence is not proof.",
  ]);
});

test("Engine Flow runtime flags remain static, read-only, and fail closed", () => {
  const model = createModel();

  assert.equal(model.runtimeStatusFlags.readOnly, true);
  assert.equal(model.runtimeStatusFlags.diagnosticOnly, true);
  assert.equal(model.runtimeStatusFlags.staticMapOnly, true);
  assert.equal(model.runtimeStatusFlags.engineExecutionEnabled, false);
  assert.equal(model.runtimeStatusFlags.selectorFiringEnabled, false);
  assert.equal(model.runtimeStatusFlags.selectorMutationEnabled, false);
  assert.equal(model.runtimeStatusFlags.iesGenerationEnabled, false);
  assert.equal(model.runtimeStatusFlags.runTableGenerationEnabled, false);
  assert.equal(model.runtimeStatusFlags.payloadGenerationEnabled, false);
  assert.equal(model.runtimeStatusFlags.drawingGenerationEnabled, false);
  assert.equal(model.runtimeStatusFlags.labProofAuthority, false);
  assert.equal(model.runtimeStatusFlags.boardDataMutationEnabled, false);
  assert.equal(model.runtimeStatusFlags.donorRunEngineMounted, false);
  assert.equal(model.runtimeStatusFlags.hiddenBackendCallsEnabled, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.engineApiCallEnabled, false);
  assert.equal(model.guardrails.runtimeDataMutationEnabled, false);
});

test("Engine Flow displays process maps, confidence labels, proof boundaries, consumers, and disallowed claims", () => {
  const model = createModel();

  assert.deepEqual(model.roleBoundary, [
    "Engine Flow explains process.",
    "Engine Flow maps confidence.",
    "Engine Flow maps proof boundaries.",
    "Engine Flow does not execute, mutate, generate, approve, or prove.",
  ]);

  assert.deepEqual(model.manualEngineeringProcessMap, [
    "interpret product intent",
    "choose possible body / board / LED / optic / driver families",
    "check mechanical fit",
    "check electrical operating window",
    "check photometric target",
    "check environment / compliance constraints",
    "compare viable variants",
    "review warnings",
    "prepare candidate artefacts",
    "require Lab Proof before production claim",
  ]);

  assert.deepEqual(model.runtimeCandidateGenerationProcessMap, [
    "Selector captures product intent",
    "Board Data provides product/component metadata",
    "Selector resolves product/board/IES readiness",
    "IES Builder prepares candidate args",
    "Engine candidate generation is future-gated",
    "RunTable/payload/drawings are future-gated",
    "Lab Proof is the only proof authority",
  ]);

  assert.deepEqual(model.confidenceLabels, ["draft", "code-backed", "data-backed", "evidence-mapped", "candidate-only", "lab-proven", "unsafe"]);
  assert.deepEqual(model.proofBoundaryLabels, [
    "NOT PROOF",
    "CANDIDATE ONLY",
    "DATA SOURCE",
    "EVIDENCE LINK",
    "LAB PROOF AUTHORITY",
    "FUTURE GATED",
    "DISALLOWED MUTATION",
    "UNSAFE CLAIM",
  ]);

  assert.ok(model.allowedConsumers.includes("Knowledge Spine"));
  assert.ok(model.allowedConsumers.includes("Lab Proof cross-reference"));
  assert.ok(model.disallowedClaims.includes("Engine Flow generated this IES"));
  assert.ok(model.disallowedClaims.includes("Engine Flow approved production use"));
  assert.ok(model.disallowedClaims.includes("Engine Flow overrides Board Data or Lab Proof"));
});
