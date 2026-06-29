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
      { system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct", approved: "yes" },
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

function specSection(model) {
  const section = model.selectorSurface.productSpine.sections.find((item) => item.sectionKey === "specGateCandidateReadiness");
  assert.ok(section, "expected Spec Gate / Candidate Readiness spine section");
  return section;
}

function specRow(model, rowKey) {
  const row = specSection(model).rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected spec-gate row ${rowKey}`);
  return row;
}

function rowsToObject(rows = []) {
  return Object.fromEntries(rows);
}

function assertAllHandoffsDisabled(handoff = {}) {
  for (const key of [
    "specGeneration",
    "slugGeneration",
    "iesGeneration",
    "payloadGeneration",
    "runTableGeneration",
    "drawingGeneration",
    "labProofAuthority",
    "controlledRecordsWrites",
    "rregApprovalCustodyTransfer",
    "hubSpotCrmWriteBack",
  ]) {
    assert.equal(handoff[key], false, `expected ${key} to stay disabled`);
  }
}

test("Spec Gate / Candidate Readiness rows render disabled or em dash on default preview", () => {
  const model = createModel();
  const payload = model.selectorSurface.payloadPreview.specGateCandidateReadiness;

  assert.equal(specRow(model, "readinessState").displayValue, "default preview — not spec-ready");
  assert.equal(specRow(model, "specReady").displayValue, "disabled");
  assert.equal(specRow(model, "manualConstraints").displayValue, "—");
  assert.equal(specRow(model, "slugSpecPreview").status, "disabled");
  assert.equal(payload.specReady, false);
  assert.equal(payload.defaultPreview, true);
  assert.equal(payload.candidatePreview, true);
  assert.ok(payload.missingRequirements.includes("System"));
  assert.ok(payload.missingRequirements.includes("Optic Direct"));
  assert.ok(payload.missingRequirements.includes("IP rating"));
  assert.match(payload.slugSpecPreviewState, /disabled/);
  assertAllHandoffsDisabled(payload.disabledHandoff);
});

test("candidate preview explains missing donor Gate S requirements safely", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  model = selectAndReload(selectorState, "ipRating", "IP65");

  const payload = model.selectorSurface.payloadPreview.specGateCandidateReadiness;
  const missing = new Set(payload.missingRequirements);

  assert.equal(specRow(model, "readinessState").displayValue, "constrained candidate preview — spec gate incomplete");
  assert.equal(payload.specReady, false);
  assert.equal(payload.constrainedSelectionState, true);
  assert.equal(missing.has("IK rating"), true);
  assert.equal(missing.has("Electrical class"), true);
  assert.equal(missing.has("Ambient"), true);
  assert.equal(missing.has("Target lm/m"), true);
  assert.equal(missing.has("CCT/CRI"), true);
  assert.equal(missing.has("Control"), true);
  assert.match(payload.manualConstraintsSummary, /System: DNX 80/);
  assert.match(payload.manualConstraintsSummary, /IP: IP65/);
  assert.match(payload.slugSpecPreviewState, /disabled/);
});

test("manual constraints and auto consequences remain separate readiness summaries", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "controlType", "DALI-2");

  const payload = model.selectorSurface.payloadPreview.specGateCandidateReadiness;

  assert.match(payload.manualConstraintsSummary, /System: DNX 80/);
  assert.match(payload.manualConstraintsSummary, /DALI-2/);
  assert.match(payload.autoConsequencesSummary, /DALI Driver/);
  assert.doesNotMatch(payload.manualConstraintsSummary, /Driver: DALI Driver/);
  assert.equal(specRow(model, "autoConsequences").status, "auto-consequence");
});

test("blocked or incompatible selections appear in readiness blockers", () => {
  const selectorState = createSelectorState();
  selectAndReload(selectorState, "system", "DNX|60");
  const model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  const payload = model.selectorSurface.payloadPreview.specGateCandidateReadiness;
  const blockerRow = specRow(model, "blockedIncompatibleSelections");

  assert.equal(payload.specReady, false);
  assert.equal(payload.blockedIncompatibleState, true);
  assert.equal(blockerRow.status, "blocked");
  assert.match(payload.blockedIncompatibleSummary, /Inlay/);
  assert.match(payload.blockedIncompatibleSummary, /blocked|preserved|constraint/i);
});

test("spec-ready read-only state appears only when donor Gate S requirements are complete", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "directOpticVar1", "80|Inlay");
  model = selectAndReload(selectorState, "ipRating", "IP65");
  model = selectAndReload(selectorState, "ikRating", "IK10");
  model = selectAndReload(selectorState, "electricalClass", "Class I");
  model = selectAndReload(selectorState, "ambient", "35°C");
  model = selectAndReload(selectorState, "targetLmPerM", "1200");
  model = selectAndReload(selectorState, "cctCri", "4000K / CRI90");
  model = selectAndReload(selectorState, "controlType", "DALI-2");

  const payload = model.selectorSurface.payloadPreview.specGateCandidateReadiness;
  const requirementRows = rowsToObject(payload.missingRequirementRows);

  assert.equal(payload.specReady, true);
  assert.equal(payload.specGateComplete, true);
  assert.equal(payload.readinessState, "spec-ready read-only state");
  assert.deepEqual(payload.missingRequirements, []);
  assert.equal(specRow(model, "specReady").displayValue, "read-only ready");
  assert.equal(requirementRows.System, "complete");
  assert.equal(requirementRows["Light & Control"], undefined);
  assertAllHandoffsDisabled(payload.disabledHandoff);
  assert.equal(model.selectorSurface.payloadPreview.safetyFlags.specGeneration, false);
  assert.equal(model.selectorSurface.payloadPreview.safetyFlags.slugGeneration, false);
  assert.match(payload.slugSpecPreviewState, /read-only preview label/);
  assert.equal(JSON.stringify(payload).includes("slug_spec"), false);
});

test("source unavailable keeps spec gate fail-closed without raw exposure", () => {
  const model = createModel({
    statusOverrides: {
      ok: false,
      source: { present: true, readable: false, parseable: false },
      selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(specGateSnapshot(), { source: { present: true, readable: false, parseable: false } }),
      rawRowsExposed: true,
      rawUsersExposed: true,
      rawLabEvidenceExposed: true,
    },
  });
  const payload = model.selectorSurface.payloadPreview.specGateCandidateReadiness;

  assert.equal(payload.specReady, false);
  assert.match(payload.sourceReadinessSummary, /source unavailable/);
  assert.equal(payload.rawRowsExposed, false);
  assert.equal(payload.rawUsersExposed, false);
  assert.equal(payload.rawLabEvidenceExposed, false);
  assert.equal(payload.privatePathsExposed, false);
});
