import { buildRuntimeAccessoryReservationFootholdSummary } from "../../workspace-kernel/engineRunTableRuntimeAccessoryReservationFootholdKernel.js";
import { stableSha1 } from "../../workspace-kernel/engineRunTableRuntimePolicyIndexKernel.js";

const STAGE3_SAFETY_FLAGS = Object.freeze({
  engineExecution: false,
  engineOutcomeProof: false,
  donorEngineInvoked: false,
  runTableGeneration: false,
  iesGeneration: false,
  selectedResultPersistence: false,
  runtimeDataMutation: false,
  rawRowsExposed: false,
  rawAccessoryRowsExposed: false,
  rawEnginePayloadExposed: false,
  rawSelectedResultPayloadExposed: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

const UNSAFE_TRUE_FIELDS = Object.freeze([
  "engineExecution",
  "engineOutcomeProof",
  "engineExecuted",
  "donorEngineInvoked",
  "runTableGeneration",
  "runTableGenerated",
  "iesGeneration",
  "iesGenerated",
  "selectedResultPersistence",
  "selectedResultPersisted",
  "runtimeDataMutation",
  "runtimeDataMutated",
  "rawRowsExposed",
  "rawRowsReturned",
  "rawAccessoryRowsExposed",
  "rawAccessoryRowsReturned",
  "rawEnginePayloadExposed",
  "rawEnginePayloadReturned",
  "rawSelectedResultPayloadExposed",
  "routesAdded",
  "postEndpointsAdded",
]);

const RUN_CONSTRAINT_KEYS = Object.freeze(["runQty", "runLength", "runLengthMode"]);
const STAGE3B_SELECTOR_BOARD_LENGTH_MM = 1400;
const STAGE3B_SELECTOR_BOARD_PITCH_MM = 70;
const STAGE3B_SELECTOR_BOARD_FAMILY_LENGTHS = Object.freeze([STAGE3B_SELECTOR_BOARD_LENGTH_MM]);
const STAGE3B_SELECTOR_SUPPORTED_ACCESSORY_TYPES = Object.freeze([
  "sensor",
  "pir",
  "microwave",
  "daylight-sensor",
  "power-feed",
  "blank-cover",
]);
const STAGE3B_SELECTOR_POLICY_PAYLOAD = Object.freeze({
  schemaId: "controlstack.runtime.selector.stage3b.safe-accessory-reservation-policy",
  schemaVersion: 1,
  boardLengthMm: STAGE3B_SELECTOR_BOARD_LENGTH_MM,
  boardPitchMm: STAGE3B_SELECTOR_BOARD_PITCH_MM,
  boardFamilyLengthsSortedDesc: STAGE3B_SELECTOR_BOARD_FAMILY_LENGTHS,
  supportedAccessoryTypes: STAGE3B_SELECTOR_SUPPORTED_ACCESSORY_TYPES,
  reservationUnit: "board-module",
  reservationModules: 1,
  endPlatePolicyMode: "sealed-zero-deduction-stage3b-foothold",
  lengthAdjustmentPreference: "cut-back",
  joinBridgePolicy: "physical join placement not represented at Stage 3B",
});
const STAGE3B_SELECTOR_POLICY_FINGERPRINT = `safe-stage3b-policy:${stableSha1(STAGE3B_SELECTOR_POLICY_PAYLOAD)}`;

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function text(value) {
  return String(value ?? "").trim();
}

function parsePositiveInteger(value) {
  if (typeof value === "number") return Number.isInteger(value) && value > 0 ? value : null;
  const raw = text(value).replace(/\s*mm$/i, "");
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function safeString(value, fallback = "") {
  const raw = text(value);
  if (!raw) return fallback;
  return raw
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .replace(/\s+/g, " ")
    .slice(0, 160)
    .trim() || fallback;
}

function safeToken(value, fallback = "") {
  const token = safeString(value, fallback)
    .toLowerCase()
    .replace(/[^0-9a-z_.:-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
  return token || fallback;
}

function constraintMap(committedSelectorConstraints = []) {
  const map = new Map();
  for (const constraint of Array.isArray(committedSelectorConstraints) ? committedSelectorConstraints : []) {
    if (!constraint || constraint.committedSelectorState !== true) continue;
    if (constraint.blocked === true) continue;
    const fieldKey = text(constraint.fieldKey);
    if (!fieldKey) continue;
    const value = text(constraint.value || constraint.valueLabel);
    if (!value) continue;
    map.set(fieldKey, constraint);
  }
  return map;
}

function constraintDisplayValue(constraint) {
  return safeString(constraint?.valueLabel || constraint?.value || "");
}

function buildCommittedRunIntakeSummary(committedSelectorConstraints = []) {
  const map = constraintMap(committedSelectorConstraints);
  const missingKeys = RUN_CONSTRAINT_KEYS.filter((key) => !map.has(key));
  const runQuantity = parsePositiveInteger(map.get("runQty")?.value || map.get("runQty")?.valueLabel);
  const runLengthMm = parsePositiveInteger(map.get("runLength")?.value || map.get("runLength")?.valueLabel);
  const lengthMode = safeString(map.get("runLengthMode")?.value || map.get("runLengthMode")?.valueLabel);
  const invalid = [];
  if (map.has("runQty") && runQuantity === null) invalid.push("invalid-run-quantity");
  if (map.has("runLength") && runLengthMm === null) invalid.push("invalid-run-length");
  if (map.has("runLengthMode") && !lengthMode) invalid.push("invalid-run-length-mode");
  const ready = missingKeys.length === 0 && invalid.length === 0;

  return {
    ready,
    committedRunIntakeReady: ready,
    sourceAuthority: "committed selector state only: manualConstraints or acceptedDefaults",
    runQuantity: runQuantity || 0,
    runLengthMm: runLengthMm || 0,
    lengthMode,
    missingKeys,
    diagnostics: [...missingKeys.map((key) => `missing-${key}`), ...invalid],
    rows: [
      ["Run qty", constraintDisplayValue(map.get("runQty")) || "missing"],
      ["Run length", constraintDisplayValue(map.get("runLength")) || "missing"],
      ["Length mode", constraintDisplayValue(map.get("runLengthMode")) || "missing"],
    ],
    writes: false,
    rawRowsExposed: false,
  };
}

function hasUnsafeTrueFlag(value = {}) {
  if (!isPlainObject(value)) return false;
  for (const key of UNSAFE_TRUE_FIELDS) {
    if (value[key] === true) return true;
  }
  const safetyFlags = isPlainObject(value.safetyFlags) ? value.safetyFlags : {};
  for (const key of UNSAFE_TRUE_FIELDS) {
    if (safetyFlags[key] === true) return true;
  }
  return false;
}

function zeroAccessoryReservationSummary() {
  return {
    schemaId: "controlstack.runtime.selector.factory-approved-inputs.zero-accessory-reservation-summary",
    schemaVersion: 1,
    state: "zero_accessory_stage3a_safe_representation",
    ok: true,
    accessoryReservationReady: true,
    boardFillInputReady: true,
    reservationCount: 0,
    reservationLengthMm: 0,
    reservationLengthBand: "0mm",
    lengthAdjustmentMode: "none",
    mutationRepresentation: "zero-accessory-no-reservation-no-cut-mutation",
    safeSummaryOnly: true,
    readOnly: true,
    diagnosticOnly: true,
    failClosedDiagnostics: [],
    warnings: ["Zero accessory intent is represented as no reservation/cut/mutation for simple-run Stage 3A only."],
    rawAccessoryRowsReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...STAGE3_SAFETY_FLAGS },
  };
}

function stage3BFailClosedReservationSummary(blocker, diagnostic, extra = {}) {
  return {
    schemaId: "controlstack.runtime.selector.factory-approved-inputs.stage3b-reservation-summary",
    schemaVersion: 1,
    state: "stage3b_accessory_reservation_fail_closed",
    ok: false,
    blocker,
    accessoryReservationReady: false,
    boardFillInputReady: false,
    reservationCount: extra.reservationCount ?? 0,
    reservationLengthMm: extra.reservationLengthMm ?? 0,
    reservationLengthBand: extra.reservationLengthBand || "unresolved",
    lengthAdjustmentMode: extra.lengthAdjustmentMode || "unresolved",
    mutationRepresentation: "fail-closed-no-cut-mutation-authority",
    safeSummaryOnly: true,
    readOnly: true,
    diagnosticOnly: true,
    failClosedDiagnostics: [blocker, diagnostic],
    warnings: [],
    rawAccessoryRowsReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: { ...STAGE3_SAFETY_FLAGS },
  };
}

function firstSafeRun(runIntakePreviewSummary = {}) {
  const runs = Array.isArray(runIntakePreviewSummary.safeRunIntentSummaries)
    ? runIntakePreviewSummary.safeRunIntentSummaries
    : [];
  return runs.length === 1 ? runs[0] : null;
}

function buildStage3BReservationSummaryFromSafePreviews({
  committedSelectorConstraints = [],
  committedRunIntakeSummary = {},
  runIntakePreviewSummary = {},
  runAccessoryPlacementPreviewSummary = {},
} = {}) {
  const accessoryIntentCount = parsePositiveInteger(runAccessoryPlacementPreviewSummary.accessoryIntentCount) || 0;
  if (accessoryIntentCount === 0) return null;
  if (committedRunIntakeSummary.ready !== true) {
    return stage3BFailClosedReservationSummary(
      "committed-run-intake-not-ready",
      "Stage 3B accessory reservation requires committed run intake before sealed reservation authority can be derived.",
    );
  }
  if (runIntakePreviewSummary.runIntakePreviewReady !== true) {
    return stage3BFailClosedReservationSummary(
      "run-intake-preview-not-ready",
      "Stage 3B accessory reservation requires exactly one complete safe run-intake preview row.",
    );
  }
  if (runAccessoryPlacementPreviewSummary.runAccessoryPlacementPreviewReady !== true) return null;

  const safeRun = firstSafeRun(runIntakePreviewSummary);
  if (!safeRun) {
    return stage3BFailClosedReservationSummary(
      "stage3b-single-run-reservation-required",
      "Stage 3B currently represents one complete run at a time; multi-run accessory reservation remains fail-closed.",
    );
  }

  const runsWithAccessoryIntentCount = parsePositiveInteger(runAccessoryPlacementPreviewSummary.runsWithAccessoryIntentCount) || 0;
  if (runsWithAccessoryIntentCount !== 1) {
    return stage3BFailClosedReservationSummary(
      "stage3b-single-run-accessory-intent-required",
      "Stage 3B currently requires all accessory intent to belong to the same sealed run-intake row.",
    );
  }

  const safeRows = Array.isArray(runAccessoryPlacementPreviewSummary.safeAccessoryIntentRows)
    ? runAccessoryPlacementPreviewSummary.safeAccessoryIntentRows
    : [];
  if (safeRows.length !== accessoryIntentCount) {
    return stage3BFailClosedReservationSummary(
      "stage3b-accessory-intent-summary-mismatch",
      "Stage 3B accessory intent count must match the sealed safe accessory intent rows.",
    );
  }

  const safeRunId = safeString(safeRun.id);
  const safeRunLabel = safeString(safeRun.label);
  const mismatchedRun = safeRows.find((row) => {
    const rowRunId = safeString(row.runId);
    const rowRunLabel = safeString(row.runLabel || row.runReference);
    return (rowRunId && safeRunId && rowRunId !== safeRunId)
      || (!rowRunId && rowRunLabel && safeRunLabel && rowRunLabel !== safeRunLabel);
  });
  if (mismatchedRun) {
    return stage3BFailClosedReservationSummary(
      "stage3b-accessory-run-mismatch",
      "Stage 3B accessory intent must reference the single sealed run-intake row.",
    );
  }

  const runLengthMm = parsePositiveInteger(safeRun.runLengthMm) || committedRunIntakeSummary.runLengthMm;
  if (!runLengthMm) {
    return stage3BFailClosedReservationSummary(
      "missing-run-length",
      "Stage 3B accessory reservation requires a positive sealed run length.",
    );
  }

  const requests = [];
  for (const row of safeRows) {
    const accessoryType = safeToken(row.accessoryTypeToken);
    const quantity = parsePositiveInteger(row.quantityReceivingAccessory);
    if (!accessoryType || !quantity) {
      return stage3BFailClosedReservationSummary(
        "stage3b-accessory-request-not-safe",
        "Stage 3B accessory reservation requires sealed accessory type and positive quantity intent.",
      );
    }
    requests.push({
      accessoryType,
      quantity,
      placementIntent: safeToken(row.placementPreference, "unspecified"),
    });
  }

  const sourceFingerprintPayload = {
    schemaId: "controlstack.runtime.selector.stage3b.safe-accessory-reservation-source",
    schemaVersion: 1,
    run: {
      id: safeRunId,
      label: safeRunLabel,
      quantity: parsePositiveInteger(safeRun.quantity) || 0,
      runLengthMm,
      lengthMode: safeToken(safeRun.lengthMode, "unresolved"),
    },
    requests,
  };
  const sourceFingerprint = `safe-stage3b-source:${stableSha1(sourceFingerprintPayload)}`;
  const map = constraintMap(committedSelectorConstraints);
  const selectedTierOrProfile = safeString(map.get("tier")?.value || map.get("electricalClass")?.valueLabel || map.get("electricalClass")?.value, "selector-stage3b");
  const productFamilyToken = safeToken(map.get("system")?.value || map.get("system")?.valueLabel, "selector-system");

  return buildRuntimeAccessoryReservationFootholdSummary({
    runLengthMm,
    selectedTierOrProfile,
    productFamilyToken,
    boardLengthMm: STAGE3B_SELECTOR_BOARD_LENGTH_MM,
    boardPitchMm: STAGE3B_SELECTOR_BOARD_PITCH_MM,
    boardFamilyLengthsSummary: {
      boardLengthMm: STAGE3B_SELECTOR_BOARD_LENGTH_MM,
      boardPitchMm: STAGE3B_SELECTOR_BOARD_PITCH_MM,
      boardFamilyLengthsSortedDesc: [...STAGE3B_SELECTOR_BOARD_FAMILY_LENGTHS],
    },
    endPlatePolicySummary: {
      startDeductionMm: 0,
      endDeductionMm: 0,
      mode: "sealed-zero-deduction-stage3b-foothold",
    },
    accessoryRequestsSummary: {
      requests,
      sourceFingerprint,
    },
    accessoryPolicySummary: {
      supportedAccessoryTypes: [...STAGE3B_SELECTOR_SUPPORTED_ACCESSORY_TYPES],
      reservationUnit: "board-module",
      reservationModules: 1,
      policyFingerprint: STAGE3B_SELECTOR_POLICY_FINGERPRINT,
      rawAccessoryRowsReturned: false,
    },
    lengthAdjustmentPreference: "cut-back",
    policyFingerprint: STAGE3B_SELECTOR_POLICY_FINGERPRINT,
    sourceFingerprint,
  });
}

function reservationSummaryForStage3({ accessoryIntentCount = 0, accessoryReservationSummary = null } = {}) {
  if (accessoryIntentCount === 0) return zeroAccessoryReservationSummary();
  if (isPlainObject(accessoryReservationSummary)) return accessoryReservationSummary;
  return buildRuntimeAccessoryReservationFootholdSummary({});
}

function buildAccessoryPlacementIntentSummary(runAccessoryPlacementPreviewSummary = {}) {
  const preview = isPlainObject(runAccessoryPlacementPreviewSummary) ? runAccessoryPlacementPreviewSummary : {};
  const accessoryIntentCount = parsePositiveInteger(preview.accessoryIntentCount) || 0;
  const unresolvedAccessoryIntentCount = parsePositiveInteger(preview.unresolvedAccessoryIntentCount) || 0;
  const ready = preview.runAccessoryPlacementPreviewReady === true && unresolvedAccessoryIntentCount === 0;

  return {
    ready,
    committedAccessoryPlacementIntentReady: ready,
    accessoryIntentCount,
    unresolvedAccessoryIntentCount,
    zeroAccessoryIntent: accessoryIntentCount === 0,
    sourceAuthority: "safe Selector accessory placement intent summary; zero accessories are represented explicitly",
    diagnostics: Array.isArray(preview.missingOrInvalidDiagnostics) ? [...preview.missingOrInvalidDiagnostics] : [],
    rows: Array.isArray(preview.summaryRows) ? preview.summaryRows.map((row) => [...row]) : [],
    writes: false,
    rawRowsExposed: false,
  };
}

function buildCheck(key, label, ready, status) {
  return {
    key,
    label,
    ready: ready === true,
    status: ready === true ? "ready" : (status || "missing/fail-closed"),
  };
}

export function buildSelectorFactoryApprovedInputsSummary({
  stage2Ready = false,
  committedSelectorConstraints = [],
  runIntakePreviewSummary = {},
  runAccessoryPlacementPreviewSummary = {},
  accessoryReservationSummary = null,
} = {}) {
  const committedRunIntakeSummary = buildCommittedRunIntakeSummary(committedSelectorConstraints);
  const accessoryPlacementIntentSummary = buildAccessoryPlacementIntentSummary(runAccessoryPlacementPreviewSummary);
  const derivedAccessoryReservationSummary = isPlainObject(accessoryReservationSummary)
    ? accessoryReservationSummary
    : buildStage3BReservationSummaryFromSafePreviews({
      committedSelectorConstraints,
      committedRunIntakeSummary,
      runIntakePreviewSummary,
      runAccessoryPlacementPreviewSummary,
    });
  const selectedReservationSummary = reservationSummaryForStage3({
    accessoryIntentCount: accessoryPlacementIntentSummary.accessoryIntentCount,
    accessoryReservationSummary: derivedAccessoryReservationSummary,
  });
  const accessoryReservationReady = selectedReservationSummary?.ok === true
    && selectedReservationSummary?.accessoryReservationReady === true
    && selectedReservationSummary?.boardFillInputReady === true
    && !hasUnsafeTrueFlag(selectedReservationSummary);
  const accessoryReservationStatus = accessoryReservationReady
    ? "ready"
    : (selectedReservationSummary?.blocker || "safe-accessory-reservation-summary-not-ready");
  const checks = [
    buildCheck("stage2Ready", "Stage 2 baseline", stage2Ready === true, "Stage 2 is not ready"),
    buildCheck("committedSelectorConstraints", "Committed selector constraints", Array.isArray(committedSelectorConstraints) && committedSelectorConstraints.length > 0, "no committed selector constraints"),
    buildCheck("committedRunIntake", "Committed run intake", committedRunIntakeSummary.ready, committedRunIntakeSummary.diagnostics.join("; ") || "committed run intake missing"),
    buildCheck("committedAccessoryPlacementIntent", "Committed accessory placement intent", accessoryPlacementIntentSummary.ready, accessoryPlacementIntentSummary.diagnostics.join("; ") || "accessory placement intent not ready"),
    buildCheck("safeAccessoryReservation", "Safe reservation / cut / mutation representation", accessoryReservationReady, accessoryReservationStatus),
  ];
  const blocker = checks.find((check) => check.ready !== true)?.status || null;
  const factoryApprovedInputsReady = checks.every((check) => check.ready === true);
  const accessoryIntentCount = accessoryPlacementIntentSummary.accessoryIntentCount;
  const stage3Mode = accessoryIntentCount === 0 ? "simple-run-stage3a-zero-accessory" : "accessory-reservation-required";

  return {
    title: "Stage 3 — Factory Approved Inputs summary",
    stage: 3,
    key: "factoryApprovedInputs",
    readOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    factoryApprovedInputsReady,
    ready: factoryApprovedInputsReady,
    stage3Mode,
    blocker,
    sourceAuthority: "Stage 2 committed selector state plus safe run/accessory/reservation summaries; no Engine, RunTable, IES, selected-result, or RuntimeData authority",
    stage2Ready: stage2Ready === true,
    committedSelectorConstraintCount: Array.isArray(committedSelectorConstraints) ? committedSelectorConstraints.length : 0,
    committedRunIntakeSummary,
    runIntakePreviewSummary: isPlainObject(runIntakePreviewSummary) ? {
      runIntakePreviewReady: runIntakePreviewSummary.runIntakePreviewReady === true,
      runCount: runIntakePreviewSummary.runCount || 0,
      totalQuantity: runIntakePreviewSummary.totalQuantity || 0,
      rawEnginePayloadExposed: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      runTableGenerated: false,
      iesGenerated: false,
    } : null,
    accessoryPlacementIntentSummary,
    accessoryReservationSummary: selectedReservationSummary,
    accessoryReservationRequired: accessoryIntentCount > 0,
    checks,
    summaryRows: [
      ["factoryApprovedInputsReady", factoryApprovedInputsReady ? "true" : "false"],
      ["stage3Mode", stage3Mode],
      ["blocker", blocker || "none"],
      ["Stage 2 baseline", stage2Ready === true ? "ready" : "not ready"],
      ["committed run intake", committedRunIntakeSummary.ready ? "ready" : "not ready"],
      ["accessory intent count", String(accessoryIntentCount)],
      ["safe reservation/cut/mutation", accessoryReservationReady ? "ready" : accessoryReservationStatus],
      ["Engine outcome proven", "false"],
      ["RunTable generated", "false"],
      ["IES generated", "false"],
    ],
    failClosedDiagnostics: blocker ? [blocker] : [],
    warnings: accessoryIntentCount === 0 ? ["Full accessory reservation remains gated; zero-accessory Stage 3A uses an explicit no-reservation representation."] : [],
    safetyFlags: { ...STAGE3_SAFETY_FLAGS },
    engineOutcomeProven: false,
    engineExecuted: false,
    donorEngineInvoked: false,
    runTableGenerated: false,
    iesGenerated: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
    boardDataMutated: false,
    rawRowsExposed: false,
    rawAccessoryRowsExposed: false,
    rawEnginePayloadExposed: false,
    rawSelectedResultPayloadExposed: false,
    routesAdded: false,
    postEndpointsAdded: false,
    writes: false,
    generation: false,
    proof: false,
  };
}
