import test from "node:test";
import assert from "node:assert/strict";

import {
  deriveRuntimeSelectorFinishCascade,
  deriveSelectorReferenceOptionsFromSnapshot,
} from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

function sourceReady() {
  return {
    label: "runtime-authority-reference-active-snapshot",
    present: true,
    readable: true,
    parseable: true,
    modifiedTime: "2026-01-01T00:00:00.000Z",
    fileSize: 1234,
  };
}

function bodyOptions() {
  return [
    { value: "White (Textured)", label: "White (Textured)", finishInheritanceIndex: 0, sourceTables: ["SYSTEM"] },
    { value: "Black (Textured)", label: "Black (Textured)", finishInheritanceIndex: 1, sourceTables: ["SYSTEM"] },
    { value: "Silver Kinetic", label: "Silver Kinetic", finishInheritanceIndex: 2, sourceTables: ["SYSTEM"] },
  ];
}

function flexOptions({ includeGrey = true } = {}) {
  return [
    { value: "White", label: "White", finishInheritanceIndex: 0, sourceTables: ["SYSTEM"] },
    { value: "Black", label: "Black", finishInheritanceIndex: 1, sourceTables: ["SYSTEM"] },
    ...(includeGrey ? [{ value: "Grey", label: "Grey", finishInheritanceIndex: 2, sourceTables: ["SYSTEM"] }] : []),
  ];
}

function cascade(overrides = {}) {
  return deriveRuntimeSelectorFinishCascade({
    bodyOptions: bodyOptions(),
    finishCoverOptions: bodyOptions(),
    finishEndOptions: bodyOptions(),
    finishFlexOptions: flexOptions(),
    ...overrides,
  });
}

function systemSnapshot({ includeGrey = true } = {}) {
  return {
    SYSTEM: [
      {
        system: "LNX",
        system_variant_1: "60",
        label: "Linear 60",
        system_and_variant_finish: "White (Textured);Black (Textured);Silver Kinetic",
        flex_map: includeGrey ? "White;Black;Grey" : "White;Black",
        approved: "yes",
        status: "available",
        raw_secret: "must not leak",
      },
    ],
    OPTICS: [
      { system: "LNX", optic_var_1: "Opal", ip_option_1: "IP20", ik_option_2: "IK07", cct: "4000K", approved: "yes" },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", control_type: "DALI-2", approved: "yes" },
    ],
    ACCESSORIES: [],
    SYSTEM_POLICY: [],
    SYSTEM_COMPONENTS: [],
    USERS: [{ email: "private@example.com" }],
    PURE_REF_STATE: [{ raw_lab_evidence: "must not leak" }],
  };
}

function workflowField(result, fieldKey) {
  const field = result.workflowSections.flatMap((section) => section.fields || []).find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected workflow field ${fieldKey}`);
  return field;
}

function assertNoUnsafeSideEffects(result) {
  const text = JSON.stringify(result);
  assert.equal(text.includes("must not leak"), false);
  assert.equal(text.includes("private@example.com"), false);
  assert.equal(result.rawRowsExposed, false);
  assert.equal(result.rawUsersExposed, false);
  assert.equal(result.rawLabEvidenceExposed, false);
  assert.equal(result.runtimeDataMutationEnabled, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.finishCascade.safety.selectedResultPersisted, false);
  assert.equal(result.payloadGenerationEnabled, false);
  assert.equal(result.specGenerationEnabled, false);
}

test("Silver Kinetic body inherits Grey flex/lead/cable when Grey is available", () => {
  const result = cascade({ bodyFinish: "Silver Kinetic" });

  assert.equal(result.fields.finishFlex.mode, "inherited");
  assert.equal(result.fields.finishFlex.value, "Grey");
  assert.match(result.fields.finishFlex.inheritedFrom, /bodyFinish/);
  assert.equal(result.fields.finishFlex.rawRowsExposed, false);
  assert.equal(result.safety.donorEngineInvoked, false);
  assert.equal(result.safety.runtimeDataMutated, false);
  assert.equal(result.safety.runTableGenerated, false);
  assert.equal(result.safety.iesGenerated, false);
  assert.equal(result.safety.selectedResultPersisted, false);
  assert.equal(result.safety.routesAdded, false);
  assert.equal(result.safety.postEndpointsAdded, false);
});

test("White and Black body finishes inherit matching flex/lead/cable colours", () => {
  const white = cascade({ bodyFinish: "White (Textured)" });
  const black = cascade({ bodyFinish: "Black (Textured)" });

  assert.equal(white.fields.finishFlex.value, "White");
  assert.equal(black.fields.finishFlex.value, "Black");
});

test("cover and end inherit body/default finish while blank, auto, or inherited", () => {
  const blank = cascade({ bodyFinish: "Silver Kinetic" });
  const auto = cascade({ bodyFinish: "Silver Kinetic", finishCover: "auto", finishEnd: "inherited" });

  assert.equal(blank.fields.finishCover.value, "Silver Kinetic");
  assert.equal(blank.fields.finishEnd.value, "Silver Kinetic");
  assert.equal(auto.fields.finishCover.value, "Silver Kinetic");
  assert.equal(auto.fields.finishEnd.value, "Silver Kinetic");
});

test("manual dependent finish overrides survive body/default finish changes", () => {
  const result = cascade({
    bodyFinish: "Silver Kinetic",
    finishCover: "Black (Textured)",
    finishEnd: "White (Textured)",
    finishFlex: "Black",
  });

  assert.equal(result.fields.finishCover.mode, "manual-override");
  assert.equal(result.fields.finishCover.value, "Black (Textured)");
  assert.equal(result.fields.finishEnd.mode, "manual-override");
  assert.equal(result.fields.finishEnd.value, "White (Textured)");
  assert.equal(result.fields.finishFlex.mode, "manual-override");
  assert.equal(result.fields.finishFlex.value, "Black");
});

test("clearing dependent overrides returns to inherited body/default mapping", () => {
  const overridden = cascade({ bodyFinish: "Silver Kinetic", finishFlex: "Black" });
  const cleared = cascade({ bodyFinish: "Silver Kinetic", finishFlex: "" });

  assert.equal(overridden.fields.finishFlex.mode, "manual-override");
  assert.equal(overridden.fields.finishFlex.value, "Black");
  assert.equal(cleared.fields.finishFlex.mode, "inherited");
  assert.equal(cleared.fields.finishFlex.value, "Grey");
});

test("Grey unavailable leaves flex inheritance unresolved instead of inventing a value", () => {
  const result = deriveRuntimeSelectorFinishCascade({
    bodyFinish: "Silver Kinetic",
    bodyOptions: bodyOptions(),
    finishCoverOptions: bodyOptions(),
    finishEndOptions: bodyOptions(),
    finishFlexOptions: flexOptions({ includeGrey: false }),
  });

  assert.equal(result.fields.finishFlex.mode, "unresolved");
  assert.equal(result.fields.finishFlex.value, "");
  assert.equal(result.fields.finishFlex.missing, true);
  assert.match(result.fields.finishFlex.reason, /no value was invented/i);
});

test("selector reference workflow emits finish inheritance consequences without exposing raw rows", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(systemSnapshot(), {
    source: sourceReady(),
    constraints: { bodyFinish: "Silver Kinetic" },
  });

  const flexField = workflowField(result, "finishFlex");
  const coverField = workflowField(result, "finishCover");
  const endField = workflowField(result, "finishEnd");
  const flexConsequence = result.autoConsequences.find((item) => item.fieldKey === "finishFlex");

  assert.equal(result.finishCascade.fields.finishFlex.value, "Grey");
  assert.equal(flexField.inheritedValue, "Grey");
  assert.equal(coverField.inheritedValue, "Silver Kinetic");
  assert.equal(endField.inheritedValue, "Silver Kinetic");
  assert.equal(flexConsequence.value, "Grey");
  assert.equal(flexConsequence.kind, "inherited-consequence");
  assert.equal(flexConsequence.writes, false);
  assertNoUnsafeSideEffects(result);
});

test("selector reference workflow preserves manual cover, end, and flex overrides", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(systemSnapshot(), {
    source: sourceReady(),
    constraints: {
      bodyFinish: "Silver Kinetic",
      finishCover: "Black (Textured)",
      finishEnd: "White (Textured)",
      finishFlex: "Black",
    },
  });

  assert.equal(result.finishCascade.fields.finishCover.mode, "manual-override");
  assert.equal(result.finishCascade.fields.finishEnd.mode, "manual-override");
  assert.equal(result.finishCascade.fields.finishFlex.mode, "manual-override");
  assert.equal(result.autoConsequences.some((item) => item.fieldKey === "finishFlex"), false);
  assert.equal(workflowField(result, "finishFlex").manualOverridePreserved, true);
  assertNoUnsafeSideEffects(result);
});

test("selector reference workflow does not invent Grey flex option when missing from source", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(systemSnapshot({ includeGrey: false }), {
    source: sourceReady(),
    constraints: { bodyFinish: "Silver Kinetic" },
  });

  assert.equal(result.finishCascade.fields.finishFlex.mode, "unresolved");
  assert.equal(result.finishCascade.fields.finishFlex.value, "");
  assert.equal(workflowField(result, "finishFlex").inheritedMissing, true);
  assert.equal(result.autoConsequences.some((item) => item.fieldKey === "finishFlex"), false);
  assertNoUnsafeSideEffects(result);
});
