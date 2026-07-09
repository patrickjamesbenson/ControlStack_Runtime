export const LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_ID = "controlstack.runtime.lab-ies-safe-handoff-adapter.v1";
export const LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_VERSION = 1;

const SAFE_RUNTIME_HANDOFF_SCHEMA_ID = "safe-runtime-handoff.v1";
const SAFE_RUNTIME_HANDOFF_SCHEMA_VERSION = 1;

const REQUIRED_SAFE_RUNTIME_HANDOFF_FIELDS = Object.freeze([
  "schemaId",
  "schemaVersion",
  "handoffState",
  "approvalState",
  "oneMmNormalised",
  "baseLengthM",
  "sourcePhotometryRef",
  "sourcePhotometryStatus",
  "iesPhotometryReferenceToken",
  "lumenCurveReferenceToken",
  "driverUtilCurveReferenceToken",
  "photometryReferenceFingerprint",
  "sourceInputFingerprint",
  "boardDataSourceVersion",
  "selectedFamilySubsetLock",
  "oneMmPolicyLabel",
  "recordFingerprint",
  "derivedFromFingerprint",
  "safeSummaryOnly",
  "readOnly",
]);

const BOARD_OWNED_RUNTIME_SLOTS = Object.freeze([
  "lumenCurveReferenceToken",
  "driverUtilCurveReferenceToken",
  "boardDataSourceVersion",
  "selectedFamilySubsetLock",
]);

const FORBIDDEN_SAFE_HANDOFF_FIELDS = Object.freeze([
  "ies",
  "iesText",
  "rawIes",
  "rawIesText",
  "rawIesContent",
  "photometry",
  "rawPhotometry",
  "candela",
  "candelaGrid",
  "candelaArrays",
  "base64",
  "base64Artifacts",
  "filename",
  "fileName",
  "localPath",
  "privatePath",
  "mutationLog",
  "provenance",
  "approval",
  "keywords",
  "vendorData",
  "labRecord",
  "recordBody",
  "rawRecord",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function clonePlain(value) {
  if (value === undefined) return null;
  return JSON.parse(JSON.stringify(value));
}

function hasOwn(source, key) {
  return isRecord(source) && Object.prototype.hasOwnProperty.call(source, key);
}

function firstNonNull(source, keys) {
  if (!isRecord(source)) return null;
  for (const key of keys) {
    if (hasOwn(source, key) && source[key] !== null && source[key] !== undefined) {
      return source[key];
    }
  }
  return null;
}

function forbiddenBlockerForKey(key) {
  if (key === "candela" || key === "candelaGrid" || key === "candelaArrays") return "candela-not-approved";
  if (key === "base64" || key === "base64Artifacts") return "base64-not-approved";
  if (key === "filename" || key === "fileName" || key === "localPath" || key === "privatePath") {
    return "filename-or-path-not-approved";
  }
  if (["mutationLog", "provenance", "approval", "keywords", "vendorData", "labRecord", "recordBody", "rawRecord"].includes(key)) {
    return "provenance-internals-not-approved";
  }
  return "raw-photometry-not-approved";
}

function findForbiddenField(value, seen = new Set()) {
  if (!isRecord(value) || seen.has(value)) return null;
  seen.add(value);

  for (const [key, childValue] of Object.entries(value)) {
    if (FORBIDDEN_SAFE_HANDOFF_FIELDS.includes(key)) {
      return key;
    }
    if (isRecord(childValue)) {
      const nested = findForbiddenField(childValue, seen);
      if (nested) return nested;
    } else if (Array.isArray(childValue)) {
      for (const item of childValue) {
        const nested = findForbiddenField(item, seen);
        if (nested) return nested;
      }
    }
  }
  return null;
}

function cloneSafeSummaryValue(value) {
  if (findForbiddenField(value)) return null;
  return clonePlain(value);
}

function pickSafeHandoffValue(handoff, key) {
  return hasOwn(handoff, key) ? cloneSafeSummaryValue(handoff[key]) : null;
}

function baseAdapterProjection({ ok = false, blocker = null, state = "runtime_lab_ies_safe_handoff_blocked_fail_closed", handoff = {} } = {}) {
  const source = isRecord(handoff) ? handoff : {};
  return {
    schemaId: LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_ID,
    schemaVersion: LAB_IES_SAFE_HANDOFF_ADAPTER_SCHEMA_VERSION,
    ok,
    blocker,
    state,
    handoffState: pickSafeHandoffValue(source, "handoffState"),
    approvalState: pickSafeHandoffValue(source, "approvalState"),
    readOnly: true,
    safeSummaryOnly: true,
    diagnosticOnly: true,
    sourceBacked: ok === true,
    sourceAnchorOnly: ok === true,
    opaqueReferenceOnly: ok === true,
    oneMmNormalised: pickSafeHandoffValue(source, "oneMmNormalised"),
    baseLengthM: pickSafeHandoffValue(source, "baseLengthM"),
    sourcePhotometryRef: pickSafeHandoffValue(source, "sourcePhotometryRef"),
    sourcePhotometryStatus: pickSafeHandoffValue(source, "sourcePhotometryStatus"),
    iesPhotometryReferenceToken: pickSafeHandoffValue(source, "iesPhotometryReferenceToken"),
    lumenCurveReferenceToken: pickSafeHandoffValue(source, "lumenCurveReferenceToken"),
    driverUtilCurveReferenceToken: pickSafeHandoffValue(source, "driverUtilCurveReferenceToken"),
    photometryReferenceFingerprint: pickSafeHandoffValue(source, "photometryReferenceFingerprint"),
    sourceInputFingerprint: pickSafeHandoffValue(source, "sourceInputFingerprint"),
    boardDataSourceVersion: pickSafeHandoffValue(source, "boardDataSourceVersion"),
    selectedFamilySubsetLock: pickSafeHandoffValue(source, "selectedFamilySubsetLock"),
    oneMmPolicyLabel: pickSafeHandoffValue(source, "oneMmPolicyLabel"),
    recordFingerprint: pickSafeHandoffValue(source, "recordFingerprint"),
    derivedFromFingerprint: pickSafeHandoffValue(source, "derivedFromFingerprint"),
    boardOwnedRuntimeFillApplied: [],
    boardOwnedRuntimeFillMissing: [],
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    filenamesReturned: false,
    localPathsReturned: false,
    routesAdded: false,
    postEndpointsAdded: false,
    runtimeDataMutationEnabled: false,
    runtimeDataMutated: false,
    iesGenerationEnabled: false,
    iesGenerated: false,
    fileOutputEnabled: false,
    fileOutputWritten: false,
  };
}

function labIesSafeHandoffBlocked(reason, handoff = {}) {
  return baseAdapterProjection({
    ok: false,
    blocker: reason,
    state: "runtime_lab_ies_safe_handoff_blocked_fail_closed",
    handoff,
  });
}

function validateSafeRuntimeHandoffShape(handoff = {}) {
  if (!isRecord(handoff)) return "missing-safe-runtime-handoff";

  const forbiddenField = findForbiddenField(handoff);
  if (forbiddenField) return forbiddenBlockerForKey(forbiddenField);

  if (handoff.schemaId !== SAFE_RUNTIME_HANDOFF_SCHEMA_ID
    || Number(handoff.schemaVersion) !== SAFE_RUNTIME_HANDOFF_SCHEMA_VERSION) {
    return "invalid-safe-runtime-handoff-schema";
  }

  for (const field of REQUIRED_SAFE_RUNTIME_HANDOFF_FIELDS) {
    if (!hasOwn(handoff, field)) return "invalid-safe-runtime-handoff-schema";
  }

  if (handoff.safeSummaryOnly !== true) return "safe-runtime-handoff-not-summary-only";
  if (handoff.readOnly !== true) return "safe-runtime-handoff-not-read-only";
  if (handoff.handoffState !== "ready") return "safe-runtime-handoff-not-ready";

  return null;
}

function buildBoardOwnedRuntimeFill(input = {}) {
  const boardData = isRecord(input.boardData) ? input.boardData : {};
  const runtimeReferenceContext = isRecord(input.runtimeReferenceContext) ? input.runtimeReferenceContext : {};

  return {
    lumenCurveReferenceToken: firstNonNull(boardData, ["lumenCurveReferenceToken", "lumen_curve_reference_token"])
      ?? firstNonNull(runtimeReferenceContext, ["lumenCurveReferenceToken", "lumen_curve_reference_token"]),
    driverUtilCurveReferenceToken: firstNonNull(boardData, ["driverUtilCurveReferenceToken", "driver_util_curve_reference_token"])
      ?? firstNonNull(runtimeReferenceContext, ["driverUtilCurveReferenceToken", "driver_util_curve_reference_token"]),
    boardDataSourceVersion: firstNonNull(boardData, ["boardDataSourceVersion", "board_data_source_version", "sourceVersion"])
      ?? firstNonNull(runtimeReferenceContext, ["boardDataSourceVersion", "board_data_source_version", "sourceVersion"]),
    selectedFamilySubsetLock: firstNonNull(boardData, ["selectedFamilySubsetLock", "selected_family_subset_lock", "familySubsetLock"])
      ?? firstNonNull(runtimeReferenceContext, ["selectedFamilySubsetLock", "selected_family_subset_lock", "familySubsetLock"]),
  };
}

function buildSafeRuntimePhotometryReferenceProjection(handoff = {}, runtimeFill = {}) {
  const projection = baseAdapterProjection({
    ok: true,
    blocker: null,
    state: "runtime_lab_ies_safe_handoff_ready",
    handoff,
  });

  const filled = [];
  const missing = [];

  for (const slot of BOARD_OWNED_RUNTIME_SLOTS) {
    if ((handoff[slot] === null || handoff[slot] === undefined) && runtimeFill[slot] !== null && runtimeFill[slot] !== undefined) {
      projection[slot] = cloneSafeSummaryValue(runtimeFill[slot]);
      filled.push(slot);
    }
    if (projection[slot] === null || projection[slot] === undefined) {
      projection[slot] = null;
      missing.push(slot);
    }
  }

  projection.boardOwnedRuntimeFillApplied = filled;
  projection.boardOwnedRuntimeFillMissing = missing;
  return projection;
}

export function buildRuntimeLabIesSafeHandoffAdapter(input = {}) {
  const handoff = isRecord(input) ? input.safeRuntimeHandoff : null;
  const blocker = validateSafeRuntimeHandoffShape(handoff);
  if (blocker) return labIesSafeHandoffBlocked(blocker, handoff);

  const runtimeFill = buildBoardOwnedRuntimeFill(input);
  return buildSafeRuntimePhotometryReferenceProjection(handoff, runtimeFill);
}

export const buildLabIesSafeHandoffAdapter = buildRuntimeLabIesSafeHandoffAdapter;
