import test from "node:test";
import assert from "node:assert/strict";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

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
          metadata: { title: "", projectId: "" },
          currentProject: {},
        },
        handoff: { owner: "shell", status: "deferred", available: false },
        identity: {
          owner: "shell",
          status: "anonymous-fallback",
          currentUser: {},
          classification: "anonymous",
          identityState: "external_anonymous",
        },
        authority: { owner: "shell", status: "fallback", source: "shell-safe-fallback" },
        company: { owner: "shell", status: "placeholder", companyName: "" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: false },
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

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function specGateSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", emission: "Direct", approved: "yes" },
      {
        system: "DNX",
        system_variant_1: "80",
        label: "DNX 80",
        emission: "Direct",
        mount_style: "Suspended;Recessed",
        system_and_variant_finish: "White (Textured);Black (Textured)",
        flex_map: "White Flex;Black Flex",
        approved: "yes",
      },
    ],
    OPTICS: [
      {
        system: "60",
        optic_var_1: "Opal",
        optic_var_2: "",
        spec_code: "OPL",
        emission_permission: "Direct",
        ip_option_1: "IP20;IP65",
        ik_option_2: "IK07;IK10",
        approved: "yes",
      },
      {
        system: "80",
        optic_var_1: "Inlay",
        optic_var_2: "Microprism, Antiglare",
        spec_code: "INL",
        spec_code_var2: "MPR, AGL",
        emission_permission: "Direct",
        ip_option_1: "IP20;IP65",
        ik_option_2: "IK07;IK10",
        application_environment: "Education",
        interior_exterior: "Interior",
        approved: "yes",
      },
    ],
    BOARDS: [
      {
        system: "DNX",
        system_variant_1: "80",
        board_lm_per_m: "1200",
        c1_cct: "4000",
        c1_cri_min: "90",
        control_type_labels: "DALI-2",
        approved: "yes",
      },
      {
        system: "DNX",
        system_variant_1: "80",
        board_lm_per_m: "900",
        c1_cct: "3000",
        c1_cri_min: "80",
        control_type_labels: "Non-dim",
        approved: "yes",
      },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", control_type: "DALI-2", approved: "yes" },
      { driver_id: "Standard Driver", control_type: "Non-dim", approved: "yes" },
    ],
    TIERS: [
      { tier: "Economy", electrical: "Class I;SELV", approved: "yes" },
      { tier: "Business", electrical: "Class II", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "elect_class", accessory_id: "Remote SELV", display_choice: "Remote SELV", approved: "yes" },
      {
        accessory_type: "mount",
        display_choice: "Suspended",
        mount_selections: "Wire;Rod",
        mount_particulars: "1500mm drop;Custom drop",
        approved: "yes",
      },
      {
        accessory_type: "mount",
        display_choice: "Recessed",
        mount_selections: "Spring clip;Frame kit",
        mount_particulars: "Plasterboard;T-bar",
        approved: "yes",
      },
      { accessory_type: "finish", display_choice: "Accessory Pearl", approved: "yes" },
    ],
    SYSTEM_POLICY: [
      { item: "ambient_temp", economy: "25;35", business: "40", first: "ENG", charter: "", approved: "yes" },
    ],
  };
}

function selectorReferenceStatus(snapshot = specGateSnapshot(), overrides = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady() }),
    ...overrides,
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = specGateSnapshot(), statusOverrides = {} } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot, statusOverrides),
  });
}

function selectAndReload(selectorState, fieldKey, value, snapshot = specGateSnapshot()) {
  let model = createModel({ selectorState, snapshot });
  model.selectorSurface.setFieldValue(fieldKey, value);
  return createModel({ selectorState, snapshot });
}

function completeSpecReadyCandidate(selectorState) {
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  model = selectAndReload(selectorState, "ipRating", "IP65");
  model = selectAndReload(selectorState, "ikRating", "IK10");
  model = selectAndReload(selectorState, "electricalClass", "Class I");
  model = selectAndReload(selectorState, "ambient", "35°C");
  model = selectAndReload(selectorState, "targetLmPerM", "1200");
  model = selectAndReload(selectorState, "cctCri", "4000K / CRI90");
  return selectAndReload(selectorState, "controlType", "DALI-2");
}

function addBuildOrderContext(selectorState) {
  selectorState.setDbBackedSelectorFieldValue("mountStyle", "Suspended", "Suspended");
  selectorState.setDbBackedSelectorFieldValue("mountSelection", "Wire", "Wire");
  selectorState.setDbBackedSelectorFieldValue("bodyFinish", "White (Textured)", "White (Textured)");
  selectorState.setDbBackedSelectorFieldValue("finishCover", "White (Textured)", "White (Textured)");
  selectorState.setDbBackedSelectorFieldValue("finishEnd", "White (Textured)", "White (Textured)");
  selectorState.setDbBackedSelectorFieldValue("finishFlex", "White Flex", "White Flex");
  selectorState.setDbBackedSelectorFieldValue("runQty", "2", "2");
  selectorState.setDbBackedSelectorFieldValue("runLength", "3500", "3500 mm");
  selectorState.setDbBackedSelectorFieldValue("runLengthMode", "cut_to_length", "Cut to length");
  return createModel({ selectorState });
}

function acceptBuildOrderContext(selectorState) {
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "mountStyle", label: "Mount style", value: "Suspended", valueLabel: "Suspended" },
    { fieldKey: "mountSelection", label: "Mount selection", value: "Wire", valueLabel: "Wire" },
    { fieldKey: "bodyFinish", label: "Body finish", value: "White (Textured)", valueLabel: "White (Textured)" },
    { fieldKey: "finishCover", label: "Cover", value: "White (Textured)", valueLabel: "White (Textured)" },
    { fieldKey: "finishEnd", label: "End plates", value: "White (Textured)", valueLabel: "White (Textured)" },
    { fieldKey: "finishFlex", label: "Flex colour", value: "White Flex", valueLabel: "White Flex" },
    { fieldKey: "runQty", label: "Run qty", value: "2", valueLabel: "2" },
    { fieldKey: "runLength", label: "Run length", value: "3500", valueLabel: "3500 mm" },
    { fieldKey: "runLengthMode", label: "Length mode", value: "cut_to_length", valueLabel: "Cut to length" },
  ]);
  return createModel({ selectorState });
}

function preview(model) {
  const result = model.selectorSurface.specBuildReadinessPreview;
  assert.ok(result, "expected spec-build readiness preview on product surface");
  return result;
}

function rowsToObject(rows = []) {
  return Object.fromEntries(rows);
}

function assertNoGenerationAuthority(value = {}) {
  assert.equal(value.generatedSlug, null);
  assert.equal(value.finalSlugString, null);
  assert.equal(value.specGenerated, false);
  assert.equal(value.pdfGenerated, false);
  assert.equal(value.payloadGenerated, false);
  assert.equal(value.engineExecuted, false);
  assert.equal(value.runTableGenerated, false);
  assert.equal(value.iesGenerated, false);
  assert.equal(value.labProofCreated, false);
  assert.equal(value.complianceApproved, false);
  assert.equal(value.controlledRecordMutated, false);
  assert.equal(value.rregApprovalCreated, false);
  assert.equal(value.boardDataMutated, false);
  assert.equal(value.rawRowsExposed, false);
  assert.equal(value.rawUsersExposed, false);
  assert.equal(value.rawLabEvidenceExposed, false);
  assert.equal(value.rawSelectedResultPayloadExposed, false);
  assert.equal(value.rawEnginePayloadExposed, false);
  assert.equal(value.rawIesExposed, false);
  assert.equal(value.privatePathsExposed, false);
  assert.equal(value.rawDebugExposed, false);
  for (const flag of Object.values(value.safetyFlags || {})) {
    assert.equal(flag, false);
  }
}

test("spec-build preview keeps fresh/default preview out of spec-ready state", () => {
  const value = preview(createModel());

  assert.equal(value.candidateState, "fresh/default-preview only");
  assert.equal(value.specReady, false);
  assert.equal(value.buildReady, false);
  assert.equal(value.freshDefaultPreviewOnly, true);
  assert.ok(value.missingSpecRequirements.includes("System"));
  assert.ok(value.missingBuildRequirements.includes("Mounting"));
  assert.ok(value.missingBuildRequirements.includes("Finishes"));
  assert.ok(value.missingBuildRequirements.includes("Runs"));
  assert.match(value.futureSlugSpecDependencyState, /blocked/);
  assertNoGenerationAuthority(value);
});

test("complete core selection becomes spec-ready metadata only and not build-ready", () => {
  const selectorState = createSelectorState();
  const value = preview(completeSpecReadyCandidate(selectorState));
  const buildRows = rowsToObject(value.missingBuildRequirementRows);

  assert.equal(value.candidateState, "spec-ready candidate");
  assert.equal(value.specReady, true);
  assert.equal(value.buildReady, false);
  assert.deepEqual(value.missingSpecRequirements, []);
  assert.deepEqual(value.missingBuildRequirements, ["Mounting", "Finishes", "Runs"]);
  assert.match(buildRows.Mounting, /missing/);
  assert.match(buildRows.Finishes, /missing/);
  assert.match(buildRows.Runs, /missing/);
  assert.match(value.futureSlugSpecDependencyState, /build\/order context is still incomplete/);
  assertNoGenerationAuthority(value);
});

test("build readiness requires mounting, finishes, and run/order context beyond spec readiness", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  const value = preview(addBuildOrderContext(selectorState));
  const buildRows = rowsToObject(value.missingBuildRequirementRows);

  assert.equal(value.candidateState, "build-ready candidate");
  assert.equal(value.specReady, true);
  assert.equal(value.buildReady, true);
  assert.deepEqual(value.missingSpecRequirements, []);
  assert.deepEqual(value.missingBuildRequirements, []);
  assert.equal(buildRows.Mounting, "complete");
  assert.equal(buildRows.Finishes, "complete");
  assert.equal(buildRows.Runs, "complete");
  assert.equal(value.selectedResultDependencyState, "blocked/fail-closed — accepted selected Engine/RunTable result required");
  assert.equal(value.downstreamBlocked, true);
  assert.match(value.futureSlugSpecDependencyState, /no slug or spec is generated here/);
  assertNoGenerationAuthority(value);
});

test("Stage 2 build readiness accepts accepted defaults as committed selector state", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  const value = preview(acceptBuildOrderContext(selectorState));
  const buildRows = rowsToObject(value.missingBuildRequirementRows);
  const stageRows = rowsToObject(value.stageIndicatorRows);

  assert.equal(value.candidateState, "build-ready candidate");
  assert.equal(value.specReady, true);
  assert.equal(value.buildReady, true);
  assert.deepEqual(value.missingBuildRequirements, []);
  assert.equal(buildRows.Mounting, "complete");
  assert.equal(buildRows.Finishes, "complete");
  assert.equal(buildRows.Runs, "complete");
  assert.equal(stageRows["Stage 1 — Spec Ready"], "true");
  assert.equal(stageRows["Stage 2 — Proof-of-Concept Buildable"], "true");
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assert.equal(stageRows["Stage 5 — Standalone / Pro-grade Hardening"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 2 source guard keeps product-spine display rows out of build authority", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile(new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url), "utf8"));

  assert.doesNotMatch(source, /const complete = rowComplete \|\| Boolean\(manualConstraint\)/);
  assert.match(source, /committed selector state only: manualConstraints or acceptedDefaults/);
  assert.match(source, /Product-spine\/display value is visible, but Stage 2 requires committed selector state/);
});

test("incompatible manual selections block readiness without being cleared", () => {
  const selectorState = createSelectorState();
  selectAndReload(selectorState, "system", "DNX|60");
  const model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  const value = preview(model);

  assert.equal(value.candidateState, "blocked by incompatible manual selections");
  assert.equal(value.specReady, false);
  assert.equal(value.buildReady, false);
  assert.equal(value.blockedByIncompatibleManualSelections, true);
  assert.match(JSON.stringify(value.blockedIncompatibleRows), /Inlay/);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.directOpticVar1.value, "80|Inlay");
  assertNoGenerationAuthority(value);
});

test("auto consequences are visible but never create authority or selected-result readiness", () => {
  const selectorState = createSelectorState();
  const value = preview(completeSpecReadyCandidate(selectorState));

  assert.ok(Number.isFinite(value.autoConsequenceCount));
  assert.ok(Array.isArray(value.autoConsequenceRows));
  assert.equal(value.selectedResultAccepted, false);
  assert.match(value.selectedResultDependencyState, /blocked\/fail-closed/);
  assert.match(JSON.stringify(value.downstreamBlockerRows), /Engine \/ RunTable/);
  assert.match(JSON.stringify(value.downstreamBlockerRows), /IES Builder/);
  assert.match(JSON.stringify(value.downstreamBlockerRows), /Lab Proof/);
  assert.match(JSON.stringify(value.downstreamBlockerRows), /Compliance/);
  assert.match(JSON.stringify(value.downstreamBlockerRows), /Controlled Records/);
  assert.match(JSON.stringify(value.downstreamBlockerRows), /RREG/);
  assertNoGenerationAuthority(value);
});

test("spec-build readiness preview does not expose generated slug/spec payload shapes", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  const value = preview(addBuildOrderContext(selectorState));
  const serialised = JSON.stringify(value);

  assert.equal(serialised.includes("slug_spec"), false);
  assert.equal(serialised.includes("slug_build"), false);
  assert.equal(value.rawEnginePayloadExposed, false);
  assert.equal(value.rawIesExposed, false);
  assert.equal(value.writes, false);
  assert.equal(value.generation, false);
  assert.equal(value.proof, false);
});
