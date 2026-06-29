import test from "node:test";
import assert from "node:assert/strict";

import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function workflowSnapshot() {
  return {
    SYSTEM: [
      {
        system: "DNX",
        system_variant_1: "80 DI",
        label: "DNX 80 D/I",
        emission: "direct/indirect",
        mount_style: "Suspended;Recessed",
        system_and_variant_finish: "White;Black",
        flex_colour: "White Flex;Black Flex",
        approved: "yes",
      },
    ],
    TIERS: [
      { tier: "business", board: "B80", warranty: "7y", electrical_options: "Non SELV with Earth;SELV Class II", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "DNX",
        optic_var_1: "Inlay",
        optic_var_2: "Microprism, Antiglare",
        emission_permission: "direct/indirect",
        ip_option_1: "IP20;IP65",
        ik_option_2: "IK07;IK10",
        cct: "3000K;4000K",
        approved: "yes",
      },
    ],
    BOARDS: [
      {
        c1_cct: "3000",
        c1_cri_min: "80",
        board_lm_per_m: "2200",
        control_type_labels: "DALI-2 DT8;Non-dim",
        approved: "yes",
      },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", native_control_type: "DALI-2 DT8", wiring_type: "5-core DALI", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mount", display_choice: "Suspended", mount_selections: "Wire;Rod", mount_particulars: "1500mm drop;Custom drop", approved: "yes" },
      { accessory_type: "power_penetration", accessory_id: "Top", approved: "yes" },
      { accessory_type: "power_location", accessory_id: "Start", approved: "yes" },
      { accessory_type: "flex_length", accessory_id: "1500mm", approved: "yes" },
      { accessory_type: "egress_light", accessory_id: "Maintained", approved: "yes" },
      { accessory_type: "egress_sound", accessory_id: "EWIS", approved: "yes" },
      { accessory_type: "pir", accessory_id: "PIR Sensor", approved: "yes" },
      { accessory_type: "accessory", accessory_id: "Suspension kit", approved: "yes" },
    ],
    SYSTEM_POLICY: [
      { category: "ambient temp", item: "25;35;40", approved: "yes" },
      { category: "wiring", item: "5-core DALI;3-core switched", approved: "yes" },
      { category: "finish colour", item: "White;Black", approved: "yes" },
    ],
    SYSTEM_COMPONENTS: [
      { id: "SP1", description: "must not leak component text", status: "business_case", approved: "yes" },
    ],
    USERS: [
      { email_login: "private@example.com", system_component_ids: "SP1", token: "must not leak user token", approved: "yes" },
    ],
    PURE_REF_STATE: [
      { raw_lab_evidence: "must not leak lab proof", approved: "yes" },
    ],
  };
}

function section(result, sectionKey) {
  const found = result.workflowSections.find((item) => item.sectionKey === sectionKey);
  assert.ok(found, `expected workflow section ${sectionKey}`);
  return found;
}

function workflowField(result, fieldKey) {
  for (const workflowSection of result.workflowSections) {
    const found = workflowSection.fields.find((item) => item.fieldKey === fieldKey);
    if (found) return found;
  }
  assert.fail(`expected donor workflow field ${fieldKey}`);
}

test("options payload exposes donor workflow sections and donor field parity", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(workflowSnapshot(), { source: sourceReady() });
  const keys = result.workflowSections.map((item) => item.sectionKey);

  assert.deepEqual(keys, [
    "system",
    "optics",
    "environment",
    "lightControl",
    "mounting",
    "penetrations",
    "finishes",
    "egressAccessories",
    "specialParts",
    "runsPreview",
    "disabledWorkflow",
  ]);
  assert.equal(result.donorFieldParity.allDonorFieldsRepresented, true);
  assert.equal(result.donorFieldParity.counts.total > 40, true);
  assert.equal(result.candidateSummary.workflowSectionCount, 11);
  assert.equal(result.candidateSummary.workflowMappedFieldCount > 0, true);
  assert.equal(section(result, "runsPreview").status, "disabled");
  assert.equal(section(result, "disabledWorkflow").status, "disabled");
});

test("workflow parity includes paired CCT/CRI, direct/indirect variants, mount, penetration, finish, and egress fields", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(workflowSnapshot(), { source: sourceReady() });
  const opticChildResult = deriveSelectorReferenceOptionsFromSnapshot(workflowSnapshot(), {
    source: sourceReady(),
    constraints: { optic: "DNX|Inlay" },
  });

  assert.ok(workflowField(result, "cctCri").options.some((item) => /3000K \/ CRI80/.test(item.label)));
  assert.ok(workflowField(result, "cctCriIndirect").options.some((item) => /3000K \/ CRI80/.test(item.label)));
  assert.ok(workflowField(opticChildResult, "opticSub").options.some((item) => item.label === "Antiglare"));
  assert.ok(workflowField(result, "opticIndirect").options.length > 0);
  assert.ok(workflowField(result, "mountSelection").options.some((item) => item.label === "Wire"));
  assert.ok(workflowField(result, "mountParticulars").options.some((item) => item.label === "1500mm drop"));
  assert.ok(workflowField(result, "powerPenetration").options.some((item) => item.label === "Top"));
  assert.ok(workflowField(result, "powerLocation").options.some((item) => item.label === "Start"));
  assert.ok(workflowField(result, "flexLength").options.some((item) => item.label === "1500mm"));
  assert.ok(workflowField(result, "finishCover").options.some((item) => item.label === "White"));
  assert.ok(workflowField(result, "finishEnd").options.some((item) => item.label === "Black"));
  assert.ok(workflowField(result, "finishFlex").options.some((item) => item.label === "White Flex"));
  assert.ok(workflowField(result, "egressLight").options.some((item) => item.label === "Maintained"));
  assert.ok(workflowField(result, "egressSound").options.some((item) => item.label === "EWIS"));
  assert.ok(workflowField(result, "sensor").options.some((item) => item.label === "PIR Sensor"));
});

test("special parts are entitlement-gated and disabled workflows cannot generate", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(workflowSnapshot(), { source: sourceReady() });
  const serialised = JSON.stringify(result);

  assert.equal(workflowField(result, "specialPartsEntitlement").sourceStatus, "entitlement-gated-redacted");
  assert.equal(result.specialPartsEntitlementSummary.rawUsersExposed, false);
  assert.equal(result.specialPartsEntitlementSummary.entitlementRowCount, 1);
  assert.equal(workflowField(result, "engineVerify").disabled, true);
  assert.equal(workflowField(result, "outputNavigation").disabled, true);
  assert.equal(workflowField(result, "saveHydrate").disabled, true);
  assert.equal(workflowField(result, "hubSpotPush").disabled, true);
  assert.equal(workflowField(result, "payloadRunTableGeneration").disabled, true);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.payloadGenerationEnabled, false);
  assert.equal(result.specGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.labProofAuthority, false);
  assert.equal(serialised.includes("private@example.com"), false);
  assert.equal(serialised.includes("must not leak"), false);
});

test("manual constraints remain constraints and compatible selections are preserved", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(workflowSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX|80 DI", cctCri: "3000K / CRI80" },
  });

  assert.equal(result.selectedConstraints.system, "DNX|80 DI");
  assert.equal(result.selectedConstraints.cctCri, "3000K / CRI80");
  assert.equal(workflowField(result, "system").selectedValue, "DNX|80 DI");
  assert.equal(workflowField(result, "cctCri").selectedValue, "3000K / CRI80");
  assert.ok(workflowField(result, "optic").options.some((item) => item.status === "available"));
});
