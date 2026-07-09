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
      { item: "end_plate_std_mm", economy: "5", business: "5", first: "5", approved: "yes" },
      { item: "end_plate_ip_mm", economy: "10", business: "10", first: "10", approved: "yes" },
      { item: "min_body_mm", economy: "1400", business: "1400", first: "1400", approved: "yes" },
      { item: "start_board_gap", economy: "0", business: "0", first: "0", approved: "yes" },
      { item: "end_board_gap", economy: "0", business: "0", first: "0", approved: "yes" },
      { item: "pitch_tolerance_mm", economy: "0", business: "0", first: "0", approved: "yes" },
      { item: "max_board_gap_mm", economy: "0", business: "0", first: "0", approved: "yes" },
      { item: "length_pref", economy: "nearest", business: "nearest", first: "exact", approved: "yes" },
      { item: "gap_mode", economy: "N+1", business: "N+1", first: "N+1", approved: "yes" },
      { item: "greedy_tie_break_mode", economy: "maximise_maxlen", business: "maximise_maxlen", first: "maximise_maxlen", approved: "yes" },
      { item: "board_selection_prefer_recent", economy: "FALSE", business: "FALSE", first: "FALSE", approved: "yes" },
      { item: "segment_max_board_split_qty", economy: "3", business: "3", first: "3", approved: "yes" },
      { item: "segment_split_mode_2piece", economy: "maximise_maxlen", business: "maximise_maxlen", first: "maximise_maxlen", approved: "yes" },
      { item: "segment_split_mode_3piece", economy: "maximise_maxlen", business: "maximise_maxlen", first: "maximise_maxlen", approved: "yes" },
      { item: "segment_split_mode_multi", economy: "maximise_maxlen", business: "maximise_maxlen", first: "maximise_maxlen", approved: "yes" },
      { item: "segment_short_piece_position_2piece", economy: "end", business: "end", first: "end", approved: "yes" },
      { item: "segment_short_piece_position_3piece", economy: "end", business: "end", first: "end", approved: "yes" },
      { item: "segment_short_piece_position_multi", economy: "end", business: "end", first: "end", approved: "yes" },
      { item: "board_cross_segment_join", economy: "FALSE", business: "FALSE", first: "FALSE", approved: "yes" },
      { item: "diffuser_cross_segment_join", economy: "FALSE", business: "FALSE", first: "FALSE", approved: "yes" },
      { item: "secondary_across_segment", economy: "forbid", business: "compare", first: "allow", approved: "yes" },
      { item: "electrical_zone_mode", economy: "start_segment_as_one_zone", business: "start_segment_as_one_zone", first: "start_segment_as_one_zone", approved: "yes" },
      { item: "secondary_no_cross_max_extra_drivers_abs", economy: "0", business: "0", first: "0", approved: "yes" },
      { item: "driver_util_target_pct", economy: "0.85", business: "0.85", first: "0.85", approved: "yes" },
      { item: "driver_util_max_pct", economy: "0.90", business: "0.90", first: "0.90", approved: "yes" },
    ],
  };
}

function snapshotWithDoNotBridgeAuthority() {
  const snapshot = specGateSnapshot();
  snapshot.SYSTEM_POLICY = [
    ...snapshot.SYSTEM_POLICY,
    { item: "do_not_bridge_join", economy: "TRUE", business: "TRUE", first: "TRUE", approved: "yes" },
    { item: "do_not_bridge_segment_join", economy: "TRUE", business: "TRUE", first: "TRUE", approved: "yes" },
  ];
  return snapshot;
}

function snapshotWithDoNotBridgePolicyOverride(item, values = {}) {
  const snapshot = snapshotWithDoNotBridgeAuthority();
  snapshot.SYSTEM_POLICY = snapshot.SYSTEM_POLICY.map((row) => (
    row.item === item ? { ...row, ...values } : row
  ));
  return snapshot;
}

function selectorStateConstraints(selectorState = createSelectorState()) {
  const snapshot = selectorState.getSnapshot();
  const manualConstraints = snapshot.dbBackedSelector?.manualConstraints || {};
  const acceptedDefaults = snapshot.dbBackedSelector?.acceptedDefaults || {};
  return Object.fromEntries(Object.entries({ ...acceptedDefaults, ...manualConstraints }).map(([key, record]) => {
    const value = String(record?.value || record?.valueLabel || "").trim();
    return value ? [key, value] : null;
  }).filter(Boolean));
}

function selectorReferenceStatus(snapshot = specGateSnapshot(), overrides = {}, constraints = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints }),
    ...overrides,
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = specGateSnapshot(), statusOverrides = {}, constraints = {} } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot, statusOverrides, constraints),
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
  model = selectAndReload(selectorState, "cctCri", "cct_cri:4000K|CRI90");
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

function acceptBuildOrderContext(selectorState, overrides = {}) {
  const runQty = overrides.runQty || "2";
  const runLength = overrides.runLength || "3500";
  const runLengthLabel = overrides.runLengthLabel || `${runLength} mm`;
  const runLengthMode = overrides.runLengthMode || "cut_to_length";
  const runLengthModeLabel = overrides.runLengthModeLabel || "Cut to length";
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "mountStyle", label: "Mount style", value: "Suspended", valueLabel: "Suspended" },
    { fieldKey: "mountSelection", label: "Mount selection", value: "Wire", valueLabel: "Wire" },
    { fieldKey: "bodyFinish", label: "Body finish", value: "White (Textured)", valueLabel: "White (Textured)" },
    { fieldKey: "finishCover", label: "Cover", value: "White (Textured)", valueLabel: "White (Textured)" },
    { fieldKey: "finishEnd", label: "End plates", value: "White (Textured)", valueLabel: "White (Textured)" },
    { fieldKey: "finishFlex", label: "Flex colour", value: "White Flex", valueLabel: "White Flex" },
    { fieldKey: "runQty", label: "Run qty", value: runQty, valueLabel: runQty },
    { fieldKey: "runLength", label: "Run length", value: runLength, valueLabel: runLengthLabel },
    { fieldKey: "runLengthMode", label: "Length mode", value: runLengthMode, valueLabel: runLengthModeLabel },
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

function joinSensitiveStage3BPreview(snapshot = snapshotWithDoNotBridgeAuthority(), tier = "Economy") {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: tier, valueLabel: tier },
  ]);
  selectorState.setRunIntakeRows([
    { id: "run-1", runNumber: 1, label: "Run 1", quantity: "2", runLengthMm: "5620", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    { runReference: "Run 1", accessoryType: "sensor", quantity: "1", placementPreference: "start", status: "confirmed" },
  ]);
  acceptBuildOrderContext(selectorState, { runLength: "5620", runLengthLabel: "5620 mm" });
  return preview(createModel({ selectorState, snapshot, constraints: selectorStateConstraints(selectorState) }));
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

function assertSlugInputContract(value = {}) {
  const contract = value.slugInputSourceContract;

  assert.ok(contract, "expected slug source-of-truth contract");
  assert.equal(contract.sourceAuthority, "committed selector state only: manualConstraints and acceptedDefaults");
  assert.deepEqual(contract.allowedInputSources, ["manualConstraints", "acceptedDefaults"]);
  assert.ok(contract.ignoredInputSources.includes("provisional auto-default-only values"));
  assert.ok(contract.ignoredInputSources.includes("inherited-only values"));
  assert.ok(contract.ignoredInputSources.includes("metadata-only display values"));
  assert.ok(contract.ignoredInputSources.includes("product-spine display state"));
  assert.ok(contract.ignoredInputSources.includes("payload preview display state"));
  assert.equal(contract.productionSlugGenerationSafe, false);
  assert.equal(contract.slugGenerationEnabled, false);
  assert.equal(contract.slugGenerated, false);
  assert.equal(contract.generatedSlug, null);
  assert.equal(contract.finalSlugString, null);
  assert.equal(contract.writes, false);
  assert.equal(contract.generation, false);
  assert.equal(contract.rawRowsExposed, false);
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
  assertSlugInputContract(value);
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
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "true");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assert.equal(stageRows["Stage 5 — Standalone / Pro-grade Hardening"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 4 Step 1 readonly mapper uses Stage 3-supported selector state without opening Stage 4", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: "Business", valueLabel: "Business" },
  ]);
  const value = preview(acceptBuildOrderContext(selectorState));
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const summaryRows = rowsToObject(value.summaryRows);

  assert.equal(value.factoryApprovedInputsReady, true);
  assert.equal(value.readonlyEngineCandidateReady, true);
  assert.equal(value.readonlyEngineCandidateMapperSummary.readonlyEngineCandidateMapperReady, true);
  assert.equal(value.readonlyEngineCandidateMapperSummary.candidateReadyForHostLocalReadonlySeam, true);
  assert.equal(value.readonlyEngineCandidateMapperSummary.candidatePayloadReturned, false);
  assert.equal(value.readonlyEngineCandidateMapperSummary.rawEnginePayloadReturned, false);
  assert.equal(value.readonlyEngineCandidateMapperSummary.selectedResultPersistenceEnabled, false);
  assert.equal(value.readonlyEngineCandidateMapperSummary.runTableGenerationEnabled, false);
  assert.equal(value.readonlyEngineCandidateMapperSummary.iesGenerationEnabled, false);
  assert.equal(value.readonlyEngineCandidateMapperSummary.routesAdded, false);
  assert.equal(value.readonlyEngineCandidateMapperSummary.postEndpointsAdded, false);
  assert.equal(value.readonlyEngineCandidateMapperSummary.candidateShapeSummary.runCount, 1);
  assert.equal(value.readonlyEngineStep1SafeSummary.readonlyEngineStep1Ready, false);
  assert.equal(value.readonlyEngineStep1SafeSummary.blocker, "host-local-readonly-engine-seam-not-invoked");
  assert.equal(value.readonlyEngineStep1SafeSummary.hostLocalReadonlyEngineSeamInvoked, false);
  assert.equal(summaryRows["Stage 4 Step 1 readonly mapper"], "ready");
  assert.equal(summaryRows["Stage 4 Step 1 readonly seam"], "host-local-readonly-engine-seam-not-invoked");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("business-stage indicators expose committed-state authority and downstream stages fail closed", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  const value = preview(acceptBuildOrderContext(selectorState));

  assert.equal(value.businessStageIndicatorContract.sourceAuthority, "committed selector state for Stage 1/2; Stage 3 uses committed selector state plus safe factory-input summaries; Stage 4/5 remain fail-closed");
  assert.equal(value.businessStageIndicatorContract.writes, false);
  assert.equal(value.businessStageIndicatorContract.rawRowsExposed, false);
  assert.deepEqual(value.businessStageIndicatorContract.stages.map((stage) => stage.label), [
    "Stage 1 — Spec Ready",
    "Stage 2 — Proof-of-Concept Buildable",
    "Stage 3 — Factory Approved Inputs",
    "Stage 4 — Engine Outcome Proven",
    "Stage 5 — Standalone / Pro-grade Hardening",
  ]);
  assert.deepEqual(value.businessStageIndicatorContract.stages.map((stage) => stage.ready), [true, true, true, false, false]);
  assert.match(value.businessStageIndicatorContract.stages[0].sourceAuthority, /provisional defaults do not count/);
  assert.match(value.businessStageIndicatorContract.stages[1].sourceAuthority, /product-spine\/display rows do not count/);
  assert.match(value.businessStageIndicatorContract.stages[2].sourceAuthority, /safe run\/accessory\/reservation summaries/);
  assert.equal(value.factoryApprovedInputsReady, true);
  assert.equal(value.factoryApprovedInputsSummary.stage3Mode, "simple-run-stage3a-zero-accessory");
  assert.equal(value.factoryApprovedInputsSummary.engineOutcomeProven, false);
  assert.equal(value.factoryApprovedInputsSummary.runTableGenerated, false);
  assert.equal(value.factoryApprovedInputsSummary.iesGenerated, false);
});

test("Stage 3B fails closed when non-zero accessory reservation cannot produce a valid board-fill input", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: "Economy", valueLabel: "Economy" },
  ]);
  selectorState.setRunIntakeRows([
    { id: "run-1", runNumber: 1, label: "Run 1", quantity: "2", runLengthMm: "3500", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    { runReference: "Run 1", accessoryType: "sensor", quantity: "1", placementPreference: "start", status: "confirmed" },
  ]);
  addBuildOrderContext(selectorState);
  const value = preview(createModel({ selectorState, constraints: selectorStateConstraints(selectorState) }));
  const stageRows = rowsToObject(value.stageIndicatorRows);

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.accessoryReservationRequired, true);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "no-valid-board-reservation");
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B accepts non-zero accessory intent when it remains inside one sealed segment", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: "Economy", valueLabel: "Economy" },
  ]);
  selectorState.setRunIntakeRows([
    { id: "run-1", runNumber: 1, label: "Run 1", quantity: "2", runLengthMm: "2820", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    { runReference: "Run 1", accessoryType: "sensor", quantity: "1", placementPreference: "start", status: "confirmed" },
  ]);
  acceptBuildOrderContext(selectorState, { runLength: "2820", runLengthLabel: "2820 mm" });
  const value = preview(createModel({ selectorState, constraints: selectorStateConstraints(selectorState) }));
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;
  const joinAuthority = reservation.joinCrossingAuthoritySummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, true);
  assert.equal(value.factoryApprovedInputsSummary.stage3Mode, "accessory-reservation-required");
  assert.equal(value.factoryApprovedInputsSummary.accessoryReservationRequired, true);
  assert.equal(reservation.ok, true);
  assert.equal(reservation.accessoryReservationReady, true);
  assert.equal(reservation.boardFillInputReady, true);
  assert.equal(reservation.reservationCount, 1);
  assert.equal(reservation.reservationLengthMm, 1400);
  assert.equal(reservation.bodyLengthBeforeReservationMm, 2800);
  assert.equal(reservation.bodyLengthBeforeLengthAdjustmentMm, 2800);
  assert.equal(reservation.boardFillInputLengthMm, 1400);
  assert.equal(reservation.physicalSegmentBridgeReady, true);
  assert.equal(reservation.sealedReservedRangeSummary.rangeCount, 1);
  assert.equal(reservation.sealedReservedRangeSummary.ranges[0].startMm, 0);
  assert.equal(reservation.sealedReservedRangeSummary.ranges[0].endMm, 1400);
  assert.equal(reservation.sealedPhysicalBoardPlacementSummary.boardPlacementCount, 1);
  assert.deepEqual(reservation.sealedPhysicalBoardPlacementSummary.placements.map((row) => [row.startMm, row.endMm]), [[1400, 2800]]);
  assert.equal(reservation.frozenPhysicalSegmentSummary.segmentCount, 1);
  assert.deepEqual(reservation.frozenPhysicalSegmentSummary.joinPositionsMm, []);
  assert.equal(joinAuthority.ok, true);
  assert.equal(joinAuthority.joinCrossingAuthorityReady, true);
  assert.equal(joinAuthority.joinSensitive, false);
  assert.equal(joinAuthority.singleSegmentContained, true);
  assert.equal(joinAuthority.segmentMaxLengthMm, 3650);
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "board_cross_segment_join").classification, "represented");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "diffuser_cross_segment_join").classification, "represented");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "secondary_across_segment").classification, "represented");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "do_not_bridge_join").classification, "missing but safe to defer");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "do_not_bridge_segment_join").classification, "missing but safe to defer");
  assert.equal(reservation.sourceBackedBodyLengthPolicySummary.source, "SYSTEM_POLICY");
  assert.equal(reservation.sourceBackedBodyLengthPolicySummary.selectedEndPlatePolicyName, "end_plate_ip_mm");
  assert.equal(reservation.sourceBackedBodyLengthPolicySummary.totalDeductionMm, 20);
  assert.match(reservation.sourceBackedBodyLengthPolicySummary.policyFingerprint, /^safe-stage3b-body-policy:[0-9a-f]{40}$/);
  assert.match(reservation.policyFingerprint, /^safe-stage3b-policy:[0-9a-f]{40}$/);
  assert.match(reservation.sourceFingerprint, /^safe-stage3b-source:[0-9a-f]{40}$/);
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "true");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B fails closed when non-zero accessory intent is join-sensitive without do-not-bridge authority", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: "Economy", valueLabel: "Economy" },
  ]);
  selectorState.setRunIntakeRows([
    { id: "run-1", runNumber: 1, label: "Run 1", quantity: "2", runLengthMm: "5620", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    { runReference: "Run 1", accessoryType: "sensor", quantity: "1", placementPreference: "start", status: "confirmed" },
  ]);
  acceptBuildOrderContext(selectorState, { runLength: "5620", runLengthLabel: "5620 mm" });
  const value = preview(createModel({ selectorState, constraints: selectorStateConstraints(selectorState) }));
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;
  const joinAuthority = reservation.joinCrossingAuthoritySummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.stage3Mode, "accessory-reservation-required");
  assert.equal(value.factoryApprovedInputsSummary.accessoryReservationRequired, true);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "stage3b-join-crossing-authority-unproven");
  assert.equal(reservation.ok, false);
  assert.equal(reservation.accessoryReservationReady, false);
  assert.equal(reservation.boardFillInputReady, false);
  assert.equal(reservation.sourceBackedBodyLengthPolicySummary.source, "SYSTEM_POLICY");
  assert.equal(reservation.sourceBackedBodyLengthPolicySummary.bodyLengthBeforeReservationMm, 5600);
  assert.equal(reservation.physicalSegmentBridgeReady, true);
  assert.equal(reservation.sealedReservedRangeSummary.ranges[0].startMm, 0);
  assert.equal(reservation.sealedReservedRangeSummary.ranges[0].endMm, 1400);
  assert.equal(reservation.sealedPhysicalBoardPlacementSummary.boardPlacementCount, 3);
  assert.equal(reservation.frozenPhysicalSegmentSummary.segmentCount, 2);
  assert.deepEqual(reservation.frozenPhysicalSegmentSummary.joinPositionsMm, [4200]);
  assert.equal(joinAuthority.ok, false);
  assert.equal(joinAuthority.joinSensitive, true);
  assert.equal(joinAuthority.singleSegmentContained, false);
  assert.equal(joinAuthority.physicalSegmentBridgeReady, true);
  assert.equal(joinAuthority.bodyLengthBeforeReservationMm, 5600);
  assert.equal(joinAuthority.segmentMaxLengthMm, 3650);
  assert.ok(joinAuthority.joinAuthorityBlockers.includes("do-not-bridge-join-policy-not-physically-enforced"));
  assert.ok(joinAuthority.joinAuthorityBlockers.includes("do-not-bridge-segment-join-policy-not-physically-enforced"));
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "board_cross_segment_join").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "diffuser_cross_segment_join").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "secondary_across_segment").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "do_not_bridge_join").classification, "missing and not safe to defer for Stage 3B claims");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "do_not_bridge_segment_join").classification, "missing and not safe to defer for Stage 3B claims");
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B accepts join-sensitive accessory intent when do-not-bridge is physically enforced", () => {
  const selectorState = createSelectorState();
  const snapshot = snapshotWithDoNotBridgeAuthority();
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: "Economy", valueLabel: "Economy" },
  ]);
  selectorState.setRunIntakeRows([
    { id: "run-1", runNumber: 1, label: "Run 1", quantity: "2", runLengthMm: "5620", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    { runReference: "Run 1", accessoryType: "sensor", quantity: "1", placementPreference: "start", status: "confirmed" },
  ]);
  acceptBuildOrderContext(selectorState, { runLength: "5620", runLengthLabel: "5620 mm" });
  const value = preview(createModel({ selectorState, snapshot, constraints: selectorStateConstraints(selectorState) }));
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;
  const joinAuthority = reservation.joinCrossingAuthoritySummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, true);
  assert.equal(value.factoryApprovedInputsSummary.stage3Mode, "accessory-reservation-required");
  assert.equal(value.factoryApprovedInputsSummary.accessoryReservationRequired, true);
  assert.equal(reservation.ok, true);
  assert.equal(reservation.accessoryReservationReady, true);
  assert.equal(reservation.boardFillInputReady, true);
  assert.equal(reservation.physicalSegmentBridgeReady, true);
  assert.equal(reservation.frozenPhysicalSegmentSummary.segmentCount, 2);
  assert.deepEqual(reservation.frozenPhysicalSegmentSummary.joinPositionsMm, [4200]);
  assert.equal(reservation.frozenPhysicalSegmentSummary.reservedRangeSummary.reservedRangesCrossFrozenSegmentJoin, false);
  assert.equal(joinAuthority.ok, true);
  assert.equal(joinAuthority.joinSensitive, true);
  assert.equal(joinAuthority.joinCrossingAuthorityReady, true);
  assert.equal(joinAuthority.singleSegmentContained, false);
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "board_cross_segment_join").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "diffuser_cross_segment_join").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "secondary_across_segment").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "electrical_zone_mode").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "secondary_no_cross_max_extra_drivers_abs").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "driver_util_target_pct").classification, "represented");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "driver_util_max_pct").classification, "represented");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "do_not_bridge_join").classification, "represented and physically enforced");
  assert.equal(joinAuthority.ruleCoverage.find((row) => row.rule === "do_not_bridge_segment_join").classification, "represented and physically enforced");
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "true");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B fails closed when secondary cross-segment routing is allowed", () => {
  const snapshot = snapshotWithDoNotBridgePolicyOverride("secondary_across_segment", { economy: "allow" });
  const value = joinSensitiveStage3BPreview(snapshot);
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;
  const joinAuthority = reservation.joinCrossingAuthoritySummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "stage3b-secondary-cross-segment-routing-unproven");
  assert.equal(joinAuthority.ok, false);
  assert.equal(joinAuthority.blocker, "stage3b-secondary-cross-segment-routing-unproven");
  assert.ok(joinAuthority.joinAuthorityBlockers.includes("stage3b-secondary-cross-segment-routing-unproven"));
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B fails closed when secondary cross-segment policy is compare", () => {
  const snapshot = snapshotWithDoNotBridgePolicyOverride("secondary_across_segment", { economy: "compare" });
  const value = joinSensitiveStage3BPreview(snapshot);
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;
  const joinAuthority = reservation.joinCrossingAuthoritySummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "stage3b-secondary-compare-scoring-not-implemented");
  assert.equal(joinAuthority.ok, false);
  assert.equal(joinAuthority.blocker, "stage3b-secondary-compare-scoring-not-implemented");
  assert.ok(joinAuthority.joinAuthorityBlockers.includes("stage3b-secondary-compare-scoring-not-implemented"));
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B fails closed when electrical zone mode crosses the full run", () => {
  const snapshot = snapshotWithDoNotBridgePolicyOverride("electrical_zone_mode", { economy: "start_run_as_one_zone" });
  const value = joinSensitiveStage3BPreview(snapshot);
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;
  const joinAuthority = reservation.joinCrossingAuthoritySummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "stage3b-electrical-zone-crossing-unproven");
  assert.equal(joinAuthority.ok, false);
  assert.equal(joinAuthority.blocker, "stage3b-electrical-zone-crossing-unproven");
  assert.ok(joinAuthority.joinAuthorityBlockers.includes("stage3b-electrical-zone-crossing-unproven"));
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B fails closed when secondary no-cross allows extra drivers", () => {
  const snapshot = snapshotWithDoNotBridgePolicyOverride("secondary_no_cross_max_extra_drivers_abs", { economy: "1" });
  const value = joinSensitiveStage3BPreview(snapshot);
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;
  const joinAuthority = reservation.joinCrossingAuthoritySummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "stage3b-secondary-extra-driver-threshold-unproven");
  assert.equal(joinAuthority.ok, false);
  assert.equal(joinAuthority.blocker, "stage3b-secondary-extra-driver-threshold-unproven");
  assert.ok(joinAuthority.joinAuthorityBlockers.includes("stage3b-secondary-extra-driver-threshold-unproven"));
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B fails closed when board packing policy is not source-backed", () => {
  const selectorState = createSelectorState();
  const snapshot = specGateSnapshot();
  snapshot.SYSTEM_POLICY = snapshot.SYSTEM_POLICY.filter((row) => row.item !== "max_board_gap_mm");
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: "Economy", valueLabel: "Economy" },
  ]);
  selectorState.setRunIntakeRows([
    { id: "run-1", runNumber: 1, label: "Run 1", quantity: "2", runLengthMm: "2820", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    { runReference: "Run 1", accessoryType: "sensor", quantity: "1", placementPreference: "start", status: "confirmed" },
  ]);
  acceptBuildOrderContext(selectorState, { runLength: "2820", runLengthLabel: "2820 mm" });
  const value = preview(createModel({ selectorState, snapshot, constraints: selectorStateConstraints(selectorState) }));
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "stage3b-board-packing-split-policy-unresolved");
  assert.equal(reservation.ok, false);
  assert.equal(reservation.boardFillInputReady, false);
  assert.ok(reservation.boardPackingSplitPolicySummary.missingPolicyKeys.includes("max_board_gap_mm"));
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("Stage 3B fails closed when frozen segment splits exceed source-backed split quantity", () => {
  const selectorState = createSelectorState();
  const snapshot = snapshotWithDoNotBridgeAuthority();
  snapshot.SYSTEM_POLICY = snapshot.SYSTEM_POLICY.map((row) => (
    row.item === "segment_max_board_split_qty"
      ? { ...row, economy: "0", business: "0", first: "0" }
      : row
  ));
  completeSpecReadyCandidate(selectorState);
  selectorState.acceptDbBackedSelectorDefaults([
    { fieldKey: "tier", label: "Tier", value: "Economy", valueLabel: "Economy" },
  ]);
  selectorState.setRunIntakeRows([
    { id: "run-1", runNumber: 1, label: "Run 1", quantity: "2", runLengthMm: "5620", lengthMode: "cut_to_length" },
  ]);
  selectorState.setRunAccessoryPlacementIntents([
    { runReference: "Run 1", accessoryType: "sensor", quantity: "1", placementPreference: "start", status: "confirmed" },
  ]);
  acceptBuildOrderContext(selectorState, { runLength: "5620", runLengthLabel: "5620 mm" });
  const value = preview(createModel({ selectorState, snapshot, constraints: selectorStateConstraints(selectorState) }));
  const stageRows = rowsToObject(value.stageIndicatorRows);
  const reservation = value.factoryApprovedInputsSummary.accessoryReservationSummary;

  assert.equal(value.buildReady, true);
  assert.equal(value.factoryApprovedInputsReady, false);
  assert.equal(value.factoryApprovedInputsSummary.blocker, "stage3b-segment-split-authority-unproven");
  assert.equal(reservation.ok, false);
  assert.equal(reservation.physicalSegmentBridgeReady, true);
  assert.equal(reservation.frozenPhysicalSegmentSummary.segmentCount, 2);
  assert.equal(reservation.boardPackingSplitPolicySummary.segmentMaxBoardSplitQty, 0);
  assert.equal(stageRows["Stage 3 — Factory Approved Inputs"], "false");
  assert.equal(stageRows["Stage 4 — Engine Outcome Proven"], "false");
  assertNoGenerationAuthority(value);
});

test("slug source contract uses committed selector state only and fails closed", () => {
  const selectorState = createSelectorState();
  completeSpecReadyCandidate(selectorState);
  const value = preview(acceptBuildOrderContext(selectorState));
  const contract = value.slugInputSourceContract;
  const authoritySources = new Set(contract.committedInputRows.map(([, detail]) => detail.includes("acceptedDefaults") ? "acceptedDefaults" : detail.includes("manualConstraints") ? "manualConstraints" : "unknown"));
  const slugRows = rowsToObject(value.futureSlugSpecRows);

  assertSlugInputContract(value);
  assert.equal(contract.specReady, true);
  assert.equal(contract.buildReady, true);
  assert.equal(contract.sourceState, "metadata-ready only — production slug generation remains disabled/fail-closed");
  assert.ok(contract.committedInputCount > 0);
  assert.equal(contract.committedInputCount, contract.eligibleCommittedInputCount);
  assert.equal(contract.blockedCommittedInputCount, 0);
  assert.equal(authoritySources.has("manualConstraints"), true);
  assert.equal(authoritySources.has("acceptedDefaults"), true);
  assert.equal(authoritySources.has("unknown"), false);
  assert.equal(slugRows["final slug string"], "none");
  assert.equal(slugRows["slug input authority"], contract.sourceAuthority);
  assert.match(slugRows["ignored slug sources"], /provisional auto-default-only values/);
  assert.match(slugRows["ignored slug sources"], /product-spine display state/);
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
