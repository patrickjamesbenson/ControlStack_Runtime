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

const RUN_CONSTRAINT_KEYS = Object.freeze(["runQty", "runLength"]);

const READONLY_ENGINE_DIRECT_CANDIDATE_REQUIREMENTS = Object.freeze([
  Object.freeze({ key: "optic", label: "Direct optic", fields: Object.freeze(["directOpticVar1", "optic", "opticVar1", "diffuserVar1"]) }),
  Object.freeze({ key: "targetLmPerM", label: "Direct target lm/m", fields: Object.freeze(["targetLmPerM", "lightTarget"]) }),
  Object.freeze({ key: "cctCri", label: "Direct CCT/CRI", fields: Object.freeze(["cctCri", "cct"]) }),
  Object.freeze({ key: "controlType", label: "Direct Control", fields: Object.freeze(["controlType"]) }),
]);
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
  endPlatePolicyMode: "source-backed-system-policy-deduction-stage3b-foothold",
  boardPackingSplitPolicyMode: "source-backed-system-policy-stage3b-exact-fill-greedy-maxlen-only",
  lengthAdjustmentPreference: "cut-back",
  joinBridgePolicy: "physical join placement not represented at Stage 3B",
});
const STAGE3B_SELECTOR_POLICY_FINGERPRINT = `safe-stage3b-policy:${stableSha1(STAGE3B_SELECTOR_POLICY_PAYLOAD)}`;
const STAGE3B_JOIN_RULE_NOT_PRESENT = "not-present-in-stage3b-safe-summary";
const STAGE3B_BODY_LENGTH_REQUIRED_POLICY_KEYS = Object.freeze([
  "end_plate_std_mm",
  "end_plate_ip_mm",
  "min_body_mm",
  "start_board_gap",
  "end_board_gap",
  "gap_mode",
]);

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

function parseNonNegativeInteger(value) {
  if (typeof value === "number") return Number.isInteger(value) && value >= 0 ? value : null;
  const raw = text(value).replace(/\s*mm$/i, "");
  if (!/^\d+$/.test(raw)) return null;
  const parsed = Number(raw);
  return Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : null;
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

function hasOwnNonBlank(object, key) {
  return isPlainObject(object) && Object.prototype.hasOwnProperty.call(object, key) && text(object[key]) !== "";
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

function selectedIpRequiresIpEndPlate(map = new Map()) {
  const raw = safeString(map.get("ipRating")?.value || map.get("ipRating")?.valueLabel || "").toUpperCase();
  const match = raw.match(/IP\s*(\d{2})/);
  if (!match) return false;
  return Number(match[1]) > 20;
}

function requiredBodyPolicyMissing(lengthPolicySummary = {}) {
  const policies = isPlainObject(lengthPolicySummary.lengthPolicies) ? lengthPolicySummary.lengthPolicies : {};
  const numericMm = isPlainObject(lengthPolicySummary.numericMm) ? lengthPolicySummary.numericMm : {};
  return STAGE3B_BODY_LENGTH_REQUIRED_POLICY_KEYS.filter((key) => {
    if (key === "gap_mode") return !safeString(policies.gap_mode);
    return !Number.isInteger(numericMm[key]);
  });
}

function buildSourceBackedStage3BBodyLengthPolicySummary({
  sourceBackedLengthPolicySummary = null,
  committedSelectorConstraints = [],
  runLengthMm = 0,
} = {}) {
  const map = constraintMap(committedSelectorConstraints);
  if (!isPlainObject(sourceBackedLengthPolicySummary) || sourceBackedLengthPolicySummary.ok !== true) {
    return {
      ok: false,
      blocker: sourceBackedLengthPolicySummary?.blocker || "stage3b-source-backed-length-policy-unresolved",
      diagnostic: sourceBackedLengthPolicySummary?.diagnostic || "Stage 3B body-length authority requires a safe source-backed SYSTEM_POLICY length summary.",
    };
  }
  const selectedTier = safeString(sourceBackedLengthPolicySummary.tier || "");
  if (!selectedTier) {
    return {
      ok: false,
      blocker: sourceBackedLengthPolicySummary.blocker || "stage3b-source-backed-length-policy-unresolved",
      diagnostic: sourceBackedLengthPolicySummary.diagnostic || "Stage 3B body-length authority requires a safe source-backed SYSTEM_POLICY length summary.",
    };
  }

  const policies = isPlainObject(sourceBackedLengthPolicySummary.lengthPolicies) ? sourceBackedLengthPolicySummary.lengthPolicies : {};
  const numericMm = isPlainObject(sourceBackedLengthPolicySummary.numericMm) ? sourceBackedLengthPolicySummary.numericMm : {};
  const missingPolicyKeys = requiredBodyPolicyMissing(sourceBackedLengthPolicySummary);
  if (missingPolicyKeys.length > 0) {
    return {
      ok: false,
      blocker: "stage3b-source-backed-body-policy-missing",
      diagnostic: `Stage 3B body-length authority is missing required SYSTEM_POLICY values: ${missingPolicyKeys.join(", ")}.`,
      selectedTier,
      missingPolicyKeys,
    };
  }

  const selectedEndPlatePolicyName = selectedIpRequiresIpEndPlate(map) ? "end_plate_ip_mm" : "end_plate_std_mm";
  const selectedEndPlateMm = numericMm[selectedEndPlatePolicyName];
  const minBodyMm = numericMm.min_body_mm;
  const startBoardGapMm = numericMm.start_board_gap;
  const endBoardGapMm = numericMm.end_board_gap;
  const gapMode = safeString(policies.gap_mode);
  if (!Number.isInteger(selectedEndPlateMm) || selectedEndPlateMm <= 0) {
    return {
      ok: false,
      blocker: "stage3b-source-backed-end-plate-policy-invalid",
      diagnostic: "Stage 3B body-length authority requires a positive source-backed end-plate deduction.",
      selectedTier,
      selectedEndPlatePolicyName,
    };
  }
  if (!Number.isInteger(minBodyMm) || minBodyMm <= 0) {
    return {
      ok: false,
      blocker: "stage3b-source-backed-min-body-policy-invalid",
      diagnostic: "Stage 3B body-length authority requires a positive source-backed minimum body length.",
      selectedTier,
    };
  }
  if (!Number.isInteger(startBoardGapMm) || startBoardGapMm < 0 || !Number.isInteger(endBoardGapMm) || endBoardGapMm < 0) {
    return {
      ok: false,
      blocker: "stage3b-source-backed-gap-policy-invalid",
      diagnostic: "Stage 3B body-length authority requires non-negative source-backed start/end board gaps.",
      selectedTier,
    };
  }
  if (!Number.isInteger(runLengthMm) || runLengthMm <= 0) {
    return {
      ok: false,
      blocker: "stage3b-source-backed-run-length-invalid",
      diagnostic: "Stage 3B body-length authority requires a positive sealed run length before deduction.",
      selectedTier,
    };
  }

  const startDeductionMm = selectedEndPlateMm + startBoardGapMm;
  const endDeductionMm = selectedEndPlateMm + endBoardGapMm;
  const totalDeductionMm = startDeductionMm + endDeductionMm;
  const bodyLengthBeforeReservationMm = runLengthMm - totalDeductionMm;
  if (bodyLengthBeforeReservationMm <= 0) {
    return {
      ok: false,
      blocker: "stage3b-source-backed-body-length-invalid",
      diagnostic: "Source-backed end-plate/body deductions leave no positive body length before reservation.",
      selectedTier,
      bodyLengthBeforeReservationMm,
    };
  }
  if (bodyLengthBeforeReservationMm < minBodyMm) {
    return {
      ok: false,
      blocker: "stage3b-source-backed-min-body-unmet",
      diagnostic: "Source-backed body length is below the required SYSTEM_POLICY minimum before reservation.",
      selectedTier,
      bodyLengthBeforeReservationMm,
      minBodyMm,
    };
  }

  const fingerprintPayload = {
    schemaId: "controlstack.runtime.selector.stage3b.source-backed-body-length-policy-summary",
    schemaVersion: 1,
    source: "SYSTEM_POLICY",
    selectedTier,
    selectedEndPlatePolicyName,
    selectedEndPlateMm,
    minBodyMm,
    startBoardGapMm,
    endBoardGapMm,
    gapMode,
    startDeductionMm,
    endDeductionMm,
    totalDeductionMm,
    bodyLengthBeforeReservationMm,
  };
  return {
    ok: true,
    source: "SYSTEM_POLICY",
    selectedTier,
    selectedEndPlatePolicyName,
    selectedEndPlateMm,
    minBodyMm,
    startBoardGapMm,
    endBoardGapMm,
    gapMode,
    startDeductionMm,
    endDeductionMm,
    totalDeductionMm,
    bodyLengthBeforeReservationMm,
    policyNames: [...STAGE3B_BODY_LENGTH_REQUIRED_POLICY_KEYS],
    policyFingerprint: `safe-stage3b-body-policy:${stableSha1(fingerprintPayload)}`,
    fingerprintPayload,
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
  };
}

function stage3BJoinRuleCoverageRow({
  rule,
  represented,
  value = STAGE3B_JOIN_RULE_NOT_PRESENT,
  joinSensitive = false,
  representedButNotEnforced = false,
  physicallyEnforced = false,
  enforcement = "not-physically-invoked",
}) {
  let classification;
  if (physicallyEnforced) classification = "represented and physically enforced";
  else if (representedButNotEnforced) classification = "partially represented";
  else if (represented) classification = "represented";
  else classification = joinSensitive ? "missing and not safe to defer for Stage 3B claims" : "missing but safe to defer";
  return {
    rule,
    classification,
    represented: represented === true,
    value: safeString(value, STAGE3B_JOIN_RULE_NOT_PRESENT),
    physicallyEnforced: physicallyEnforced === true,
    enforcement,
    stage3bClaimSafe: !joinSensitive || physicallyEnforced === true || classification === "represented",
    rawRowsReturned: false,
  };
}

function stage3BPolicyValue({
  sourceBackedLengthPolicySummary = null,
  policies = {},
  joinPolicies = {},
  electricalTopologyPolicies = {},
  rule,
}) {
  return electricalTopologyPolicies[rule]
    ?? joinPolicies[rule]
    ?? policies[rule]
    ?? sourceBackedLengthPolicySummary?.[rule];
}

function stage3BPolicyRepresented({
  sourceBackedLengthPolicySummary = null,
  policies = {},
  joinPolicies = {},
  electricalTopologyPolicies = {},
  rule,
}) {
  return hasOwnNonBlank(electricalTopologyPolicies, rule)
    || hasOwnNonBlank(joinPolicies, rule)
    || hasOwnNonBlank(policies, rule)
    || hasOwnNonBlank(sourceBackedLengthPolicySummary, rule);
}

function normaliseJoinPolicyValue(value) {
  return safeToken(value, "unresolved");
}

function isStrictNoCrossPolicy(value) {
  const token = normaliseJoinPolicyValue(value);
  return ["false", "no", "0", "forbid", "forbidden", "disallow", "blocked", "none"].includes(token);
}

function isSecondaryNoCrossPolicy(value) {
  return normaliseJoinPolicyValue(value) === "forbid";
}

function isStrictDoNotBridgePolicy(value) {
  const token = normaliseJoinPolicyValue(value);
  return ["true", "yes", "1", "y", "t", "forbid", "forbidden", "disallow", "blocked"].includes(token);
}

function buildStage3BJoinCrossingAuthoritySummary({
  sourceBackedLengthPolicySummary = null,
  sourceBackedBodyLengthPolicySummary = null,
  accessoryReservationSummary = null,
} = {}) {
  const policies = isPlainObject(sourceBackedLengthPolicySummary?.lengthPolicies)
    ? sourceBackedLengthPolicySummary.lengthPolicies
    : {};
  const joinPolicies = isPlainObject(sourceBackedLengthPolicySummary?.joinPolicies)
    ? sourceBackedLengthPolicySummary.joinPolicies
    : {};
  const electricalTopologyPolicies = isPlainObject(sourceBackedLengthPolicySummary?.electricalTopologyPolicies)
    ? sourceBackedLengthPolicySummary.electricalTopologyPolicies
    : {};
  const segmentMaxLengthMm = parsePositiveInteger(sourceBackedLengthPolicySummary?.segmentMaxLengthMm)
    || parsePositiveInteger(sourceBackedLengthPolicySummary?.numericMm?.segment_max_length_mm)
    || parsePositiveInteger(policies.segment_max_length_mm);
  const segmentMinAestheticLengthMm = parsePositiveInteger(sourceBackedLengthPolicySummary?.numericMm?.segment_min_aesthetic_length_mm)
    || parsePositiveInteger(policies.segment_min_aesthetic_length_mm);
  const bodyLengthBeforeReservationMm = parsePositiveInteger(sourceBackedBodyLengthPolicySummary?.bodyLengthBeforeReservationMm);

  if (!segmentMaxLengthMm || !bodyLengthBeforeReservationMm) {
    return {
      ok: false,
      blocker: "stage3b-join-crossing-segment-policy-unresolved",
      diagnostic: "Stage 3B join-crossing authority requires sealed segment maximum length and source-backed body length before reservation.",
      joinCrossingAuthorityReady: false,
      joinSensitive: true,
      ruleCoverage: [],
      rawRowsReturned: false,
    };
  }

  const frozenPhysicalSegmentSummary = isPlainObject(accessoryReservationSummary?.frozenPhysicalSegmentSummary)
    ? accessoryReservationSummary.frozenPhysicalSegmentSummary
    : null;
  const sealedReservedRangeSummary = isPlainObject(accessoryReservationSummary?.sealedReservedRangeSummary)
    ? accessoryReservationSummary.sealedReservedRangeSummary
    : null;
  const sealedPhysicalBoardPlacementSummary = isPlainObject(accessoryReservationSummary?.sealedPhysicalBoardPlacementSummary)
    ? accessoryReservationSummary.sealedPhysicalBoardPlacementSummary
    : null;
  const physicalSegmentBridgeReady = accessoryReservationSummary?.physicalSegmentBridgeReady === true
    && frozenPhysicalSegmentSummary?.ok === true
    && sealedReservedRangeSummary?.ok === true
    && sealedPhysicalBoardPlacementSummary?.ok === true;
  const frozenSegmentCount = parsePositiveInteger(frozenPhysicalSegmentSummary?.segmentCount) || 0;
  const joinSensitive = physicalSegmentBridgeReady
    ? frozenSegmentCount > 1
    : bodyLengthBeforeReservationMm > segmentMaxLengthMm;

  const policyLookup = { sourceBackedLengthPolicySummary, policies, joinPolicies, electricalTopologyPolicies };
  const boardValue = stage3BPolicyValue({ ...policyLookup, rule: "board_cross_segment_join" });
  const diffuserValue = stage3BPolicyValue({ ...policyLookup, rule: "diffuser_cross_segment_join" });
  const secondaryValue = stage3BPolicyValue({ ...policyLookup, rule: "secondary_across_segment" });
  const electricalZoneModeValue = stage3BPolicyValue({ ...policyLookup, rule: "electrical_zone_mode" });
  const secondaryNoCrossMaxExtraDriversAbsValue = stage3BPolicyValue({ ...policyLookup, rule: "secondary_no_cross_max_extra_drivers_abs" });
  const driverUtilTargetPctValue = stage3BPolicyValue({ ...policyLookup, rule: "driver_util_target_pct" });
  const driverUtilMaxPctValue = stage3BPolicyValue({ ...policyLookup, rule: "driver_util_max_pct" });
  const doNotBridgeJoinValue = stage3BPolicyValue({ ...policyLookup, rule: "do_not_bridge_join" });
  const doNotBridgeSegmentJoinValue = stage3BPolicyValue({ ...policyLookup, rule: "do_not_bridge_segment_join" });
  const boardRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "board_cross_segment_join" });
  const diffuserRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "diffuser_cross_segment_join" });
  const secondaryRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "secondary_across_segment" });
  const electricalZoneModeRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "electrical_zone_mode" });
  const secondaryNoCrossMaxExtraDriversAbsRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "secondary_no_cross_max_extra_drivers_abs" });
  const driverUtilTargetPctRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "driver_util_target_pct" });
  const driverUtilMaxPctRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "driver_util_max_pct" });
  const doNotBridgeJoinRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "do_not_bridge_join" });
  const doNotBridgeSegmentJoinRepresented = stage3BPolicyRepresented({ ...policyLookup, rule: "do_not_bridge_segment_join" });
  const secondaryAcrossSegmentToken = normaliseJoinPolicyValue(secondaryValue);
  const electricalZoneModeToken = normaliseJoinPolicyValue(electricalZoneModeValue);
  const secondaryNoCrossMaxExtraDriversAbs = parseNonNegativeInteger(secondaryNoCrossMaxExtraDriversAbsValue);

  const boardPhysicallyEnforced = joinSensitive
    && physicalSegmentBridgeReady
    && boardRepresented
    && isStrictNoCrossPolicy(boardValue)
    && frozenPhysicalSegmentSummary.noBoardCrossesFrozenSegmentBoundary === true;
  const diffuserPhysicallyEnforced = joinSensitive
    && physicalSegmentBridgeReady
    && diffuserRepresented
    && isStrictNoCrossPolicy(diffuserValue)
    && frozenPhysicalSegmentSummary.segmentBoundariesAtBoardEndsOnly === true;
  const secondaryPhysicallyEnforced = joinSensitive
    && physicalSegmentBridgeReady
    && secondaryRepresented
    && isSecondaryNoCrossPolicy(secondaryValue)
    && electricalZoneModeRepresented
    && electricalZoneModeToken === "start_segment_as_one_zone"
    && secondaryNoCrossMaxExtraDriversAbsRepresented
    && secondaryNoCrossMaxExtraDriversAbs === 0;
  const doNotBridgeJoinPhysicallyEnforced = joinSensitive
    && physicalSegmentBridgeReady
    && doNotBridgeJoinRepresented
    && isStrictDoNotBridgePolicy(doNotBridgeJoinValue)
    && frozenPhysicalSegmentSummary.reservedRangeSummary?.reservedRangesCrossFrozenSegmentJoin === false;
  const doNotBridgeSegmentJoinPhysicallyEnforced = joinSensitive
    && physicalSegmentBridgeReady
    && doNotBridgeSegmentJoinRepresented
    && isStrictDoNotBridgePolicy(doNotBridgeSegmentJoinValue)
    && frozenPhysicalSegmentSummary.reservedRangeSummary?.reservedRangesCrossFrozenSegmentJoin === false;

  const ruleCoverage = [
    stage3BJoinRuleCoverageRow({
      rule: "segment_max_length_mm",
      represented: true,
      value: `${segmentMaxLengthMm}`,
      joinSensitive: false,
      physicallyEnforced: physicalSegmentBridgeReady && joinSensitive,
      enforcement: physicalSegmentBridgeReady ? "frozen-segment-lengths-checked" : "source-backed-policy-visible-only",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "segment_min_aesthetic_length_mm",
      represented: Boolean(segmentMinAestheticLengthMm),
      value: segmentMinAestheticLengthMm ? `${segmentMinAestheticLengthMm}` : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive: false,
      physicallyEnforced: Boolean(segmentMinAestheticLengthMm) && physicalSegmentBridgeReady && joinSensitive,
      enforcement: physicalSegmentBridgeReady ? "frozen-segment-minimums-checked" : "source-backed-policy-visible-only",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "board_cross_segment_join",
      represented: boardRepresented,
      value: boardRepresented ? boardValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive,
      representedButNotEnforced: boardRepresented && joinSensitive && !boardPhysicallyEnforced,
      physicallyEnforced: boardPhysicallyEnforced,
      enforcement: boardPhysicallyEnforced ? "no-board-crosses-frozen-segment-boundary" : "not-physically-enforced",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "diffuser_cross_segment_join",
      represented: diffuserRepresented,
      value: diffuserRepresented ? diffuserValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive,
      representedButNotEnforced: diffuserRepresented && joinSensitive && !diffuserPhysicallyEnforced,
      physicallyEnforced: diffuserPhysicallyEnforced,
      enforcement: diffuserPhysicallyEnforced ? "diffuser-cut-assumed-per-frozen-segment-no-cross-only" : "not-physically-enforced",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "secondary_across_segment",
      represented: secondaryRepresented,
      value: secondaryRepresented ? secondaryValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive,
      representedButNotEnforced: secondaryRepresented && joinSensitive && !secondaryPhysicallyEnforced,
      physicallyEnforced: secondaryPhysicallyEnforced,
      enforcement: secondaryPhysicallyEnforced ? "secondary-forbid-segment-zone-zero-extra-driver-containment" : "not-physically-enforced",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "electrical_zone_mode",
      represented: electricalZoneModeRepresented,
      value: electricalZoneModeRepresented ? electricalZoneModeValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive,
      representedButNotEnforced: electricalZoneModeRepresented && joinSensitive && !secondaryPhysicallyEnforced,
      physicallyEnforced: secondaryPhysicallyEnforced,
      enforcement: secondaryPhysicallyEnforced ? "start-segment-as-one-zone-required-for-secondary-no-cross" : "represented-fact-not-stage3b-proof",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "secondary_no_cross_max_extra_drivers_abs",
      represented: secondaryNoCrossMaxExtraDriversAbsRepresented,
      value: secondaryNoCrossMaxExtraDriversAbsRepresented ? secondaryNoCrossMaxExtraDriversAbsValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive,
      representedButNotEnforced: secondaryNoCrossMaxExtraDriversAbsRepresented && joinSensitive && !secondaryPhysicallyEnforced,
      physicallyEnforced: secondaryPhysicallyEnforced,
      enforcement: secondaryPhysicallyEnforced ? "zero-extra-driver-threshold-required-for-secondary-no-cross" : "represented-fact-not-stage3b-proof",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "driver_util_target_pct",
      represented: driverUtilTargetPctRepresented,
      value: driverUtilTargetPctRepresented ? driverUtilTargetPctValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive: false,
      representedButNotEnforced: false,
      physicallyEnforced: false,
      enforcement: "represented-fact-only-not-stage3b-physical-proof",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "driver_util_max_pct",
      represented: driverUtilMaxPctRepresented,
      value: driverUtilMaxPctRepresented ? driverUtilMaxPctValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive: false,
      representedButNotEnforced: false,
      physicallyEnforced: false,
      enforcement: "represented-fact-only-not-stage3b-physical-proof",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "do_not_bridge_join",
      represented: doNotBridgeJoinRepresented,
      value: doNotBridgeJoinRepresented ? doNotBridgeJoinValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive,
      representedButNotEnforced: doNotBridgeJoinRepresented && joinSensitive && !doNotBridgeJoinPhysicallyEnforced,
      physicallyEnforced: doNotBridgeJoinPhysicallyEnforced,
      enforcement: doNotBridgeJoinPhysicallyEnforced ? "reserved-ranges-do-not-cross-frozen-join" : "not-physically-enforced",
    }),
    stage3BJoinRuleCoverageRow({
      rule: "do_not_bridge_segment_join",
      represented: doNotBridgeSegmentJoinRepresented,
      value: doNotBridgeSegmentJoinRepresented ? doNotBridgeSegmentJoinValue : STAGE3B_JOIN_RULE_NOT_PRESENT,
      joinSensitive,
      representedButNotEnforced: doNotBridgeSegmentJoinRepresented && joinSensitive && !doNotBridgeSegmentJoinPhysicallyEnforced,
      physicallyEnforced: doNotBridgeSegmentJoinPhysicallyEnforced,
      enforcement: doNotBridgeSegmentJoinPhysicallyEnforced ? "reserved-ranges-do-not-cross-frozen-segment-join" : "not-physically-enforced",
    }),
  ];

  if (joinSensitive) {
    const joinAuthorityBlockers = [];
    if (!physicalSegmentBridgeReady) joinAuthorityBlockers.push("physical-segment-bridge-not-ready");
    if (!boardPhysicallyEnforced) joinAuthorityBlockers.push("board-cross-policy-not-physically-enforced");
    if (!diffuserPhysicallyEnforced) joinAuthorityBlockers.push("diffuser-cross-policy-not-physically-enforced");
    if (!secondaryPhysicallyEnforced) {
      if (secondaryRepresented && secondaryAcrossSegmentToken === "allow") {
        joinAuthorityBlockers.push("stage3b-secondary-cross-segment-routing-unproven");
      } else if (secondaryRepresented && secondaryAcrossSegmentToken === "compare") {
        joinAuthorityBlockers.push("stage3b-secondary-compare-scoring-not-implemented");
      } else if (electricalZoneModeRepresented && electricalZoneModeToken === "start_run_as_one_zone") {
        joinAuthorityBlockers.push("stage3b-electrical-zone-crossing-unproven");
      } else if (Number.isInteger(secondaryNoCrossMaxExtraDriversAbs) && secondaryNoCrossMaxExtraDriversAbs > 0) {
        joinAuthorityBlockers.push("stage3b-secondary-extra-driver-threshold-unproven");
      } else {
        joinAuthorityBlockers.push("secondary-cross-policy-not-physically-enforced");
      }
    }
    if (!doNotBridgeJoinPhysicallyEnforced) joinAuthorityBlockers.push("do-not-bridge-join-policy-not-physically-enforced");
    if (!doNotBridgeSegmentJoinPhysicallyEnforced) joinAuthorityBlockers.push("do-not-bridge-segment-join-policy-not-physically-enforced");
    if (joinAuthorityBlockers.length > 0) {
      return {
        ok: false,
        blocker: joinAuthorityBlockers.find((blocker) => blocker.startsWith("stage3b-")) || "stage3b-join-crossing-authority-unproven",
        diagnostic: "Stage 3B accessory reservation is join-sensitive; frozen physical segments are represented, but at least one join/do-not-bridge rule is not physically enforceable for this claim.",
        joinCrossingAuthorityReady: false,
        joinSensitive: true,
        singleSegmentContained: false,
        physicalSegmentBridgeReady,
        joinAuthorityBlockers,
        bodyLengthBeforeReservationMm,
        segmentMaxLengthMm,
        frozenPhysicalSegmentSummary,
        sealedReservedRangeSummary,
        sealedPhysicalBoardPlacementSummary,
        ruleCoverage,
        rawRowsReturned: false,
      };
    }
    return {
      ok: true,
      joinCrossingAuthorityReady: true,
      joinSensitive: true,
      singleSegmentContained: false,
      physicalSegmentBridgeReady: true,
      bodyLengthBeforeReservationMm,
      segmentMaxLengthMm,
      frozenPhysicalSegmentSummary,
      sealedReservedRangeSummary,
      sealedPhysicalBoardPlacementSummary,
      ruleCoverage,
      diagnostic: "Stage 3B join-sensitive accessory reservation is bounded by sealed reserved ranges, segment-aware board placements, and frozen no-cross physical segments.",
      rawRowsReturned: false,
    };
  }

  return {
    ok: true,
    joinCrossingAuthorityReady: true,
    joinSensitive: false,
    singleSegmentContained: true,
    physicalSegmentBridgeReady,
    bodyLengthBeforeReservationMm,
    segmentMaxLengthMm,
    frozenPhysicalSegmentSummary,
    sealedReservedRangeSummary,
    sealedPhysicalBoardPlacementSummary,
    ruleCoverage,
    diagnostic: "Stage 3B non-zero accessory reservation remains inside one sealed segment; join-crossing / do-not-bridge rules are not physically invoked for this claim.",
    rawRowsReturned: false,
  };
}

function buildCommittedRunIntakeSummary(committedSelectorConstraints = []) {
  const map = constraintMap(committedSelectorConstraints);
  const missingKeys = RUN_CONSTRAINT_KEYS.filter((key) => !map.has(key));
  const runQuantity = parsePositiveInteger(map.get("runQty")?.value || map.get("runQty")?.valueLabel);
  const runLengthMm = parsePositiveInteger(map.get("runLength")?.value || map.get("runLength")?.valueLabel);
  const invalid = [];
  if (map.has("runQty") && runQuantity === null) invalid.push("invalid-run-quantity");
  if (map.has("runLength") && runLengthMm === null) invalid.push("invalid-run-length");
  const ready = missingKeys.length === 0 && invalid.length === 0;

  return {
    ready,
    committedRunIntakeReady: ready,
    sourceAuthority: "committed selector state only: manualConstraints or acceptedDefaults",
    runQuantity: runQuantity || 0,
    runLengthMm: runLengthMm || 0,
    missingKeys,
    diagnostics: [...missingKeys.map((key) => `missing-${key}`), ...invalid],
    rows: [
      ["Run qty", constraintDisplayValue(map.get("runQty")) || "missing"],
      ["Run length", constraintDisplayValue(map.get("runLength")) || "missing"],
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
    sourceBackedBodyLengthPolicySummary: extra.sourceBackedBodyLengthPolicySummary || null,
    joinCrossingAuthoritySummary: extra.joinCrossingAuthoritySummary || null,
    sealedReservedRangeSummary: extra.sealedReservedRangeSummary || null,
    sealedPhysicalBoardPlacementSummary: extra.sealedPhysicalBoardPlacementSummary || null,
    frozenPhysicalSegmentSummary: extra.frozenPhysicalSegmentSummary || null,
    physicalSegmentBridgeReady: extra.physicalSegmentBridgeReady ?? false,
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
  sourceBackedLengthPolicySummary = null,
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

  const sourceBackedBodyLengthPolicySummary = buildSourceBackedStage3BBodyLengthPolicySummary({
    sourceBackedLengthPolicySummary,
    committedSelectorConstraints,
    runLengthMm,
  });
  if (sourceBackedBodyLengthPolicySummary.ok !== true) {
    return stage3BFailClosedReservationSummary(
      sourceBackedBodyLengthPolicySummary.blocker,
      sourceBackedBodyLengthPolicySummary.diagnostic,
      { sourceBackedBodyLengthPolicySummary },
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
    },
    requests,
    sourceBackedBodyLengthPolicy: sourceBackedBodyLengthPolicySummary.fingerprintPayload,
  };
  const sourceFingerprint = `safe-stage3b-source:${stableSha1(sourceFingerprintPayload)}`;
  const map = constraintMap(committedSelectorConstraints);
  const selectedTierOrProfile = safeString(sourceBackedBodyLengthPolicySummary.selectedTier, "selector-stage3b");
  const productFamilyToken = safeToken(map.get("system")?.value || map.get("system")?.valueLabel, "selector-system");

  const reservationSummary = buildRuntimeAccessoryReservationFootholdSummary({
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
    sourceBackedLengthPolicySummary,
    endPlatePolicySummary: {
      startDeductionMm: sourceBackedBodyLengthPolicySummary.startDeductionMm,
      endDeductionMm: sourceBackedBodyLengthPolicySummary.endDeductionMm,
      totalDeductionMm: sourceBackedBodyLengthPolicySummary.totalDeductionMm,
      mode: `source-backed-system-policy:${sourceBackedBodyLengthPolicySummary.selectedEndPlatePolicyName}:${sourceBackedBodyLengthPolicySummary.gapMode}`,
      source: "SYSTEM_POLICY",
      sourceBacked: true,
      policyFingerprint: sourceBackedBodyLengthPolicySummary.policyFingerprint,
      rawRowsReturned: false,
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
    stage3BPhysicalSegmentBridgeRequired: true,
    segmentMaxLengthMm: parsePositiveInteger(sourceBackedLengthPolicySummary?.segmentMaxLengthMm)
      || parsePositiveInteger(sourceBackedLengthPolicySummary?.numericMm?.segment_max_length_mm)
      || parsePositiveInteger(sourceBackedLengthPolicySummary?.lengthPolicies?.segment_max_length_mm),
    segmentMinAestheticLengthMm: parsePositiveInteger(sourceBackedLengthPolicySummary?.numericMm?.segment_min_aesthetic_length_mm)
      || parsePositiveInteger(sourceBackedLengthPolicySummary?.lengthPolicies?.segment_min_aesthetic_length_mm),
    lengthAdjustmentPreference: "cut-back",
    policyFingerprint: STAGE3B_SELECTOR_POLICY_FINGERPRINT,
    sourceFingerprint,
  });

  if (!isPlainObject(reservationSummary)) return reservationSummary;
  if (reservationSummary.ok !== true) {
    return {
      ...reservationSummary,
      sourceBackedBodyLengthPolicySummary,
      rawRowsReturned: false,
    };
  }

  const joinCrossingAuthoritySummary = buildStage3BJoinCrossingAuthoritySummary({
    sourceBackedLengthPolicySummary,
    sourceBackedBodyLengthPolicySummary,
    accessoryReservationSummary: reservationSummary,
  });
  if (joinCrossingAuthoritySummary.ok !== true) {
    return stage3BFailClosedReservationSummary(
      joinCrossingAuthoritySummary.blocker,
      joinCrossingAuthoritySummary.diagnostic,
      {
        reservationCount: reservationSummary.reservationCount,
        reservationLengthMm: reservationSummary.reservationLengthMm,
        reservationLengthBand: reservationSummary.reservationLengthBand,
        lengthAdjustmentMode: reservationSummary.lengthAdjustmentMode,
        sourceBackedBodyLengthPolicySummary,
        joinCrossingAuthoritySummary,
        sealedReservedRangeSummary: reservationSummary.sealedReservedRangeSummary,
        sealedPhysicalBoardPlacementSummary: reservationSummary.sealedPhysicalBoardPlacementSummary,
        frozenPhysicalSegmentSummary: reservationSummary.frozenPhysicalSegmentSummary,
        physicalSegmentBridgeReady: reservationSummary.physicalSegmentBridgeReady === true,
      },
    );
  }

  return {
    ...reservationSummary,
    sourceBackedBodyLengthPolicySummary,
    joinCrossingAuthoritySummary,
    rawRowsReturned: false,
  };
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

function buildReadonlyEngineCandidateInputAvailabilitySummary(
  committedSelectorConstraints = [],
  applicability = {},
) {
  const map = constraintMap(committedSelectorConstraints);
  const directSupported = applicability.directSupported !== false;
  const indirectRequired = applicability.indirectRequired === true;
  const requirementRows = READONLY_ENGINE_DIRECT_CANDIDATE_REQUIREMENTS.map((requirement) => {
    const fieldKey = requirement.fields.find((key) => map.has(key)) || null;
    return {
      key: requirement.key,
      label: requirement.label,
      ready: Boolean(fieldKey),
      fieldKey,
      status: fieldKey ? "committed-candidate-input-available" : "missing/fail-closed",
    };
  });
  const missingRequirements = requirementRows.filter((row) => row.ready !== true).map((row) => row.label);
  const blocker = !directSupported
    ? "readonly-engine-direct-candidate-not-applicable"
    : indirectRequired
      ? "readonly-engine-indirect-inputs-required-outside-first-slice"
      : missingRequirements.length
        ? `missing-readonly-engine-candidate-input-${requirementRows.find((row) => row.ready !== true)?.key || "unknown"}`
        : null;
  return {
    ready: blocker === null,
    candidateInputAvailabilityReady: blocker === null,
    blocker,
    directSupported,
    indirectRequired,
    directOnly: directSupported && !indirectRequired,
    supportedSlice: "first-readonly-engine-direct-only",
    requiredInputs: requirementRows,
    missingRequirements,
    sourceAuthority: "committed selector state only; no product-spine, display-only, or provisional-default fallback",
    ambientRequired: false,
    indirectInputsRequired: indirectRequired,
    writes: false,
    rawRowsExposed: false,
  };
}

function factoryReadyCommittedConstraintBlockers(committedSelectorConstraints = []) {
  if (!Array.isArray(committedSelectorConstraints) || committedSelectorConstraints.length === 0) {
    return ["factory-ready-committed-selector-constraints-missing"];
  }
  const blockers = [];
  const fieldKeys = new Set();
  committedSelectorConstraints.forEach((constraint, index) => {
    if (!isPlainObject(constraint)) {
      blockers.push(`factory-ready-constraint-${index + 1}-malformed`);
      return;
    }
    const fieldKey = safeString(constraint.fieldKey);
    const value = text(constraint.value);
    if (!fieldKey) blockers.push(`factory-ready-constraint-${index + 1}-field-key-missing`);
    if (!value) blockers.push(`factory-ready-constraint-${index + 1}-value-missing`);
    if (constraint.committedSelectorState !== true) blockers.push(`factory-ready-constraint-${index + 1}-uncommitted`);
    if (constraint.blocked === true) blockers.push(`factory-ready-constraint-${index + 1}-blocked`);
    if (!["manualConstraints", "acceptedDefaults"].includes(constraint.authoritySource)) {
      blockers.push(`factory-ready-constraint-${index + 1}-non-source-backed`);
    }
    const manual = constraint.manualConstraint === true;
    const acceptedDefault = constraint.acceptedDefault === true;
    if (manual === acceptedDefault) blockers.push(`factory-ready-constraint-${index + 1}-authority-contradictory`);
    if (fieldKey) {
      if (fieldKeys.has(fieldKey)) blockers.push(`factory-ready-constraint-${index + 1}-duplicate-field`);
      fieldKeys.add(fieldKey);
    }
  });
  return blockers;
}

export function deriveSelectorFactoryReadyState({
  specReady = false,
  buildReady = false,
  factoryApprovedInputsSummary = {},
  committedSelectorConstraints = [],
  missingSpecRequirements = [],
  missingBuildRequirements = [],
  blockedIncompatibleSelections = [],
} = {}) {
  const blockers = [];
  if (specReady !== true) blockers.push("factory-ready-spec-ready-required");
  if (buildReady !== true) blockers.push("factory-ready-build-ready-required");
  if (!Array.isArray(missingSpecRequirements) || missingSpecRequirements.length > 0) blockers.push("factory-ready-spec-requirements-incomplete");
  if (!Array.isArray(missingBuildRequirements) || missingBuildRequirements.length > 0) blockers.push("factory-ready-build-requirements-incomplete");
  if (!Array.isArray(blockedIncompatibleSelections) || blockedIncompatibleSelections.length > 0) blockers.push("factory-ready-incompatible-selection-present");

  if (!isPlainObject(factoryApprovedInputsSummary)) {
    blockers.push("factory-ready-approved-inputs-summary-malformed");
  } else {
    if (factoryApprovedInputsSummary.factoryApprovedInputsReady !== true || factoryApprovedInputsSummary.ready !== true) {
      blockers.push("factory-ready-approved-inputs-not-ready");
    }
    if (factoryApprovedInputsSummary.stage2Ready !== true) blockers.push("factory-ready-stage2-evidence-not-ready");
    if (text(factoryApprovedInputsSummary.blocker)) blockers.push("factory-ready-approved-inputs-blocker-present");
    const checks = factoryApprovedInputsSummary.checks;
    if (!Array.isArray(checks) || checks.length === 0 || checks.some((check) => !isPlainObject(check) || check.ready !== true)) {
      blockers.push("factory-ready-approved-input-check-incomplete");
    }
    const diagnostics = factoryApprovedInputsSummary.failClosedDiagnostics;
    if (!Array.isArray(diagnostics) || diagnostics.length > 0) blockers.push("factory-ready-fail-closed-diagnostic-present");
  }
  blockers.push(...factoryReadyCommittedConstraintBlockers(committedSelectorConstraints));

  const uniqueBlockers = Object.freeze([...new Set(blockers)]);
  const factoryReady = uniqueBlockers.length === 0;
  return Object.freeze({
    factoryReady,
    ready: factoryReady,
    state: factoryReady ? "factory-ready" : "factory-ready-fail-closed",
    blocker: uniqueBlockers[0] || null,
    blockers: uniqueBlockers,
    specReady: specReady === true,
    buildReady: buildReady === true,
    factoryApprovedInputsReady: factoryApprovedInputsSummary?.factoryApprovedInputsReady === true,
    sourceAuthority: "derived only from Spec Ready, Build Ready, committed selector state and the existing Factory Approved Inputs summary",
    diagnosticFallbackAccepted: false,
    providerPushEnabled: false,
    writes: false,
    generation: false,
    rawRowsExposed: false,
  });
}

export function buildSelectorFactoryApprovedInputsSummary({
  stage2Ready = false,
  committedSelectorConstraints = [],
  runIntakePreviewSummary = {},
  runAccessoryPlacementPreviewSummary = {},
  sourceBackedLengthPolicySummary = null,
  accessoryReservationSummary = null,
  readonlyEngineCandidateApplicability = {},
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
      sourceBackedLengthPolicySummary,
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
  const readonlyEngineCandidateInputAvailabilitySummary = buildReadonlyEngineCandidateInputAvailabilitySummary(
    committedSelectorConstraints,
    readonlyEngineCandidateApplicability,
  );
  const checks = [
    buildCheck("stage2Ready", "Stage 2 baseline", stage2Ready === true, "Stage 2 is not ready"),
    buildCheck("committedSelectorConstraints", "Committed selector constraints", Array.isArray(committedSelectorConstraints) && committedSelectorConstraints.length > 0, "no committed selector constraints"),
    buildCheck("committedRunIntake", "Committed run intake", committedRunIntakeSummary.ready, committedRunIntakeSummary.diagnostics.join("; ") || "committed run intake missing"),
    buildCheck("committedAccessoryPlacementIntent", "Committed accessory placement intent", accessoryPlacementIntentSummary.ready, accessoryPlacementIntentSummary.diagnostics.join("; ") || "accessory placement intent not ready"),
    buildCheck("safeAccessoryReservation", "Safe reservation / cut / mutation representation", accessoryReservationReady, accessoryReservationStatus),
  ];
  const readonlyEngineCandidateInputChecks = [
    buildCheck("committedRunIntake", "Committed run intake", committedRunIntakeSummary.ready, committedRunIntakeSummary.diagnostics.join("; ") || "committed run intake missing"),
    buildCheck("committedAccessoryPlacementIntent", "Safe accessory intent representation", accessoryPlacementIntentSummary.ready, accessoryPlacementIntentSummary.diagnostics.join("; ") || "accessory placement intent not ready"),
    buildCheck("safeAccessoryReservation", "Safe reservation / cut / mutation representation", accessoryReservationReady, accessoryReservationStatus),
    buildCheck("candidateInputAvailability", "Readonly Engine candidate inputs", readonlyEngineCandidateInputAvailabilitySummary.ready, readonlyEngineCandidateInputAvailabilitySummary.blocker),
  ];
  const blocker = checks.find((check) => check.ready !== true)?.status || null;
  const factoryApprovedInputsReady = checks.every((check) => check.ready === true);
  const readonlyEngineCandidateInputsBlocker = readonlyEngineCandidateInputChecks.find((check) => check.ready !== true)?.status || null;
  const readonlyEngineCandidateInputsReady = readonlyEngineCandidateInputChecks.every((check) => check.ready === true);
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
    readonlyEngineCandidateInputsReady,
    readonlyEngineCandidateInputsBlocker,
    readonlyEngineCandidateInputAvailabilitySummary,
    readonlyEngineCandidateApplicability: {
      directSupported: readonlyEngineCandidateInputAvailabilitySummary.directSupported,
      indirectRequired: readonlyEngineCandidateInputAvailabilitySummary.indirectRequired,
      directOnly: readonlyEngineCandidateInputAvailabilitySummary.directOnly,
      supportedSlice: readonlyEngineCandidateInputAvailabilitySummary.supportedSlice,
    },
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
    readonlyEngineCandidateInputChecks,
    summaryRows: [
      ["factoryApprovedInputsReady", factoryApprovedInputsReady ? "true" : "false"],
      ["readonlyEngineCandidateInputsReady", readonlyEngineCandidateInputsReady ? "true" : "false"],
      ["readonly Engine candidate blocker", readonlyEngineCandidateInputsBlocker || "none"],
      ["readonly Engine applicability", readonlyEngineCandidateInputAvailabilitySummary.directOnly ? "direct-only" : "indirect-required/outside-first-slice"],
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