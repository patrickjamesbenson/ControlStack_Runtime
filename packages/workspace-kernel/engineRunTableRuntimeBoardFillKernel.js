import {
  buildSafeSourceFingerprintMarker,
  buildSourceBackedLengthPolicySummary,
  stableSha1,
} from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.board-fill-summary";
export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_STATE = "runtime_board_fill_diagnostic_only";

export const DEFAULT_SUPPORTED_DIAGNOSTIC_RUN_LENGTHS_MM = Object.freeze([5600]);

export const ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  deterministicOnly: true,
  runtimeNative: true,
  diagnosticOnly: true,
  sourceBackedSafeSummaryOnly: true,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  boardDataMakerImported: false,
  donorEngineInvoked: false,
  productionEngineExecutionEnabled: false,
  fullEnginePortEnabled: false,
  driverSelectionEnabled: false,
  electricalZoneBuildingEnabled: false,
  mechanicalDetailingEnabled: false,
  segmentSplitEnabled: false,
  gateDValidationEnabled: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawRowsReturned: false,
  rawCurveRowsReturned: false,
  rawUsersReturned: false,
  rawEnginePayloadReturned: false,
});

const PRIVATE_PATH_PATTERN = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const SAFE_FINGERPRINT_PATTERN = /^safe-[0-9A-Za-z_.:-]{4,160}$/;
const GAP_MODES = new Set(["N+1", "N-1"]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isBlank(value) {
  return value === null
    || value === undefined
    || (typeof value === "number" && Number.isNaN(value))
    || (typeof value === "string" && value.trim() === "");
}

function firstPresent(source, keys) {
  if (!isPlainObject(source)) return undefined;
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key) && !isBlank(source[key])) return source[key];
  }
  return undefined;
}

function safeLabel(value, fallback = "unresolved") {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return fallback;
  const cleaned = raw
    .replace(/[^0-9A-Za-z _./:-]+/g, " ")
    .replace(/[\\/]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return cleaned ? cleaned.slice(0, 96) : fallback;
}

function toIntegerMm(value) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const source = String(value ?? "").trim();
  if (!source) return null;
  const parsed = Number(source);
  if (Number.isFinite(parsed)) return Math.round(parsed);
  const match = source.replace(/–/g, "-").match(/[-+]?\d+(\.\d+)?/);
  return match ? Math.round(Number(match[0])) : null;
}

function toPositiveIntegerMm(value) {
  const parsed = toIntegerMm(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function uniquePositiveLengths(values) {
  const source = Array.isArray(values) ? values : [];
  return [...new Set(source.map(toPositiveIntegerMm).filter((value) => Number.isInteger(value) && value > 0))]
    .sort((left, right) => right - left);
}

function normaliseGapMode(value) {
  const mode = String(value || "N+1").trim().toUpperCase();
  return GAP_MODES.has(mode) ? mode : "N+1";
}

function safeFingerprint(value) {
  const raw = String(value ?? "").trim();
  if (!raw || PRIVATE_PATH_PATTERN.test(raw)) return "";
  const cleaned = raw.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 180);
  return SAFE_FINGERPRINT_PATTERN.test(cleaned) ? cleaned : "";
}

function safetyBase(extra = {}) {
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_STATE,
    sourceKind: extra.sourceKind || "safe-source-backed-diagnostic-fixture",
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    runLengthMm: extra.runLengthMm ?? null,
    bodyLengthMm: extra.bodyLengthMm ?? null,
    selectedTierOrProfile: extra.selectedTierOrProfile || null,
    selectedBoardFamily: extra.selectedBoardFamily || null,
    boardCount: extra.boardCount ?? 0,
    boardLengthMm: extra.boardLengthMm ?? null,
    boardUsedLengthMm: extra.boardUsedLengthMm ?? 0,
    slackMm: extra.slackMm ?? null,
    gapPolicySummary: extra.gapPolicySummary || null,
    lengthPolicySummary: extra.lengthPolicySummary || null,
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((warning) => safeLabel(warning, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics)
      ? extra.failClosedDiagnostics.map((diagnostic) => safeLabel(diagnostic, "diagnostic"))
      : [],
    rawRowsReturned: false,
    rawCurveRowsReturned: false,
    rawUsersReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    selectedResultPersisted: false,
    runtimeDataMutated: false,
    iesGenerated: false,
    runTableGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SAFETY_FLAGS),
  };
}

function failClosed(blocker, diagnostic, extra = {}) {
  return safetyBase({
    ...extra,
    ok: false,
    blocker,
    failClosedDiagnostics: [diagnostic, ...(Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics : [])],
  });
}

function resolveSelectedTier(input) {
  return safeLabel(firstPresent(input, [
    "selectedTierOrProfile",
    "selectedTier",
    "selected_tier",
    "tier",
    "profile",
    "selectedProfile",
    "selected_profile",
  ]), "");
}

function resolveRunLength(input) {
  return toIntegerMm(firstPresent(input, ["runLengthMm", "run_length_mm", "runLength", "lengthMm", "length_mm"]));
}

function resolveDiagnosticBound(input) {
  const bounds = firstPresent(input, ["supportedDiagnosticRunLengthBoundsMm", "diagnosticBoundsMm"]);
  const allowed = uniquePositiveLengths(firstPresent(input, [
    "supportedDiagnosticRunLengthsMm",
    "allowedDiagnosticRunLengthsMm",
    "allowedRunLengthsMm",
  ]));
  if (allowed.length > 0) return { allowed, min: null, max: null };

  if (isPlainObject(bounds)) {
    const min = toPositiveIntegerMm(firstPresent(bounds, ["min", "minMm", "minimumMm"]));
    const max = toPositiveIntegerMm(firstPresent(bounds, ["max", "maxMm", "maximumMm"]));
    if (min !== null || max !== null) return { allowed: [], min, max };
  }

  return { allowed: [...DEFAULT_SUPPORTED_DIAGNOSTIC_RUN_LENGTHS_MM], min: null, max: null };
}

function runLengthWithinBound(runLengthMm, bound) {
  if (!Number.isInteger(runLengthMm) || runLengthMm <= 0) return false;
  if (bound.allowed.length > 0) return bound.allowed.includes(runLengthMm);
  if (bound.min !== null && runLengthMm < bound.min) return false;
  if (bound.max !== null && runLengthMm > bound.max) return false;
  return true;
}

function resolveSourceFingerprint(input, boardFamilySummary) {
  const direct = safeFingerprint(firstPresent(input, ["sourceFingerprint", "safeSourceFingerprint"]));
  const board = safeFingerprint(firstPresent(boardFamilySummary, ["sourceFingerprint", "safeSourceFingerprint"]));
  let snapshotMarker = "";
  const snapshot = firstPresent(input, ["sourceSnapshot", "snapshot", "source"]);
  if (isPlainObject(snapshot)) {
    const marker = buildSafeSourceFingerprintMarker(snapshot);
    if (marker?.ok && safeFingerprint(marker.marker)) snapshotMarker = marker.marker;
  }

  const parts = [direct, snapshotMarker, board].filter(Boolean);
  if (parts.length > 1) return `safe-board-fill:${stableSha1(parts)}`;
  return parts[0] || "";
}

function resolvePolicySummary(input, selectedTierOrProfile) {
  const supplied = firstPresent(input, [
    "runtimePolicyIndexSummary",
    "policyIndexSummary",
    "policySummary",
    "lengthPolicySummary",
  ]);

  if (isPlainObject(supplied)) {
    const lengthSummary = isPlainObject(supplied.lengthPolicySummary) ? supplied.lengthPolicySummary : supplied;
    if (lengthSummary.ok !== true) {
      return {
        ok: false,
        blocker: lengthSummary.blocker || "missing-policy-index-summary",
        diagnostic: lengthSummary.diagnostic || "Runtime policy/index summary is not ok.",
      };
    }
    return { ok: true, summary: lengthSummary, source: "provided-policy-index-summary" };
  }

  const snapshot = firstPresent(input, ["sourceSnapshot", "snapshot", "source"]);
  if (!isPlainObject(snapshot)) {
    return {
      ok: false,
      blocker: "missing-policy-index-summary",
      diagnostic: "Runtime policy/index summary or source snapshot is required before board-fill diagnostics.",
    };
  }

  const summary = buildSourceBackedLengthPolicySummary(snapshot, { tier: selectedTierOrProfile });
  if (!summary.ok) {
    return {
      ok: false,
      blocker: summary.blocker || "missing-policy-index-summary",
      diagnostic: summary.diagnostic || "Source-backed runtime policy/index summary could not be resolved.",
    };
  }
  return { ok: true, summary, source: "runtime-policy-index-helper" };
}

function resolveNumericPolicy(summary, key, fallback = 0) {
  const direct = toIntegerMm(summary?.numericMm?.[key]);
  if (direct !== null) return direct;
  const value = toIntegerMm(summary?.lengthPolicies?.[key]);
  return value !== null ? value : fallback;
}

function buildGapPolicySummary(lengthSummary) {
  const lengthPolicies = isPlainObject(lengthSummary?.lengthPolicies) ? lengthSummary.lengthPolicies : {};
  const gapMode = normaliseGapMode(lengthPolicies.gap_mode);
  const startGapMm = gapMode === "N-1" ? 0 : Math.max(0, resolveNumericPolicy(lengthSummary, "start_board_gap", 0));
  const endGapMm = gapMode === "N-1" ? 0 : Math.max(0, resolveNumericPolicy(lengthSummary, "end_board_gap", 0));
  const maxBoardGapMm = Math.max(0, resolveNumericPolicy(lengthSummary, "max_board_gap_mm", 0));
  const pitchToleranceMm = Math.max(0, resolveNumericPolicy(lengthSummary, "pitch_tolerance_mm", 0));

  return {
    mode: gapMode,
    startGapMm,
    endGapMm,
    totalGapMm: startGapMm + endGapMm,
    maxBoardGapMm,
    pitchToleranceMm,
  };
}

function buildSafeLengthPolicySummary(lengthSummary) {
  const lengthPolicies = isPlainObject(lengthSummary?.lengthPolicies) ? lengthSummary.lengthPolicies : {};
  return {
    summaryType: "source-backed-length-policy",
    tier: safeLabel(lengthSummary?.tier, "unresolved"),
    lengthPref: safeLabel(lengthPolicies.length_pref, "unresolved"),
    gapMode: normaliseGapMode(lengthPolicies.gap_mode),
    segmentMaxLengthMm: resolveNumericPolicy(lengthSummary, "segment_max_length_mm", 0),
    segmentMinAestheticLengthMm: resolveNumericPolicy(lengthSummary, "segment_min_aesthetic_length_mm", 0),
    segmentMaxBoardSplitQty: resolveNumericPolicy(lengthSummary, "segment_max_board_split_qty", 0),
    segmentMaxLengthOverrideApplied: lengthSummary?.segmentMaxLengthOverrideApplied === true,
    rawRowsReturned: false,
    rawTableHeadersReturned: false,
  };
}

function resolveBoardFamilySummary(input) {
  const summary = firstPresent(input, [
    "sourceBackedBoardFamilySummary",
    "boardFamilySummary",
    "selectedBoardFamilySummary",
    "boardFamily",
  ]);
  return isPlainObject(summary) ? summary : {};
}

function normaliseBoardFamily(summary) {
  const selectedBoardFamily = safeLabel(firstPresent(summary, [
    "selectedBoardFamily",
    "boardFamily",
    "boardFamilyLabel",
    "family",
    "familyLabel",
    "templateLabel",
    "partNumber",
    "part_number",
  ]), "");

  const boardLengthMm = toPositiveIntegerMm(firstPresent(summary, [
    "boardLengthMm",
    "board_length_mm",
    "lengthMm",
    "length_mm",
    "nominalLengthMm",
    "nominal_length_mm",
  ]));
  const pitchMm = toPositiveIntegerMm(firstPresent(summary, ["pitchMm", "pitch_mm", "boardPitchMm", "board_pitch_mm"]));
  const boardQuantumMm = toPositiveIntegerMm(firstPresent(summary, [
    "boardQuantumMm",
    "board_quantum_mm",
    "quantumMm",
    "quantum_mm",
    "pitchQuantumMm",
  ]));

  const providedLengths = uniquePositiveLengths(firstPresent(summary, [
    "boardFamilyLengthsSortedDesc",
    "boardLengthsMm",
    "board_lengths_mm",
    "lengthCandidatesMm",
    "length_candidates_mm",
  ]));
  const boardFamilyLengthsSortedDesc = providedLengths.length > 0
    ? providedLengths
    : (boardLengthMm ? [boardLengthMm] : []);

  return {
    selectedBoardFamily,
    boardLengthMm,
    pitchMm,
    boardQuantumMm,
    boardFamilyLengthsSortedDesc,
  };
}

function generateRuntimeBoardRun(targetLengthMm, lengthsSortedDesc) {
  const denoms = uniquePositiveLengths(lengthsSortedDesc);
  const usedLengthsMm = [];
  const countsByLength = new Map();
  let remainingMm = targetLengthMm;

  while (remainingMm > 0 && denoms.length > 0) {
    const picked = denoms.find((candidate) => candidate <= remainingMm);
    if (!picked) break;
    usedLengthsMm.push(picked);
    countsByLength.set(picked, (countsByLength.get(picked) || 0) + 1);
    remainingMm -= picked;
  }

  return {
    success: remainingMm === 0,
    targetLengthMm,
    usedLengthsMm,
    remainderMm: remainingMm,
    countsByLength: Object.fromEntries([...countsByLength.entries()].map(([key, value]) => [String(key), value])),
  };
}

export function buildRuntimeBoardFillKernelSummary(input = {}) {
  const source = isPlainObject(input) ? input : {};
  const selectedTierOrProfile = resolveSelectedTier(source);
  if (!selectedTierOrProfile) {
    return failClosed("missing-selected-tier-profile", "Selected tier/profile is required before runtime board-fill diagnostics.");
  }

  const runLengthMm = resolveRunLength(source);
  if (!Number.isInteger(runLengthMm)) {
    return failClosed("missing-run-length", "Controlled run length is required before runtime board-fill diagnostics.", {
      selectedTierOrProfile,
    });
  }
  if (runLengthMm < 0) {
    return failClosed("unsafe-negative-length", "Controlled run length must not be negative.", {
      runLengthMm,
      selectedTierOrProfile,
    });
  }
  if (runLengthMm === 0) {
    return failClosed("impossible-board-fill", "Controlled run length must be positive.", {
      runLengthMm,
      selectedTierOrProfile,
    });
  }

  const bound = resolveDiagnosticBound(source);
  if (!runLengthWithinBound(runLengthMm, bound)) {
    return failClosed("unsupported-diagnostic-run-length", "Run length is outside the supported diagnostic bound for this runtime board-fill foothold.", {
      runLengthMm,
      selectedTierOrProfile,
    });
  }

  const boardFamilySummary = resolveBoardFamilySummary(source);
  const sourceFingerprint = resolveSourceFingerprint(source, boardFamilySummary);
  if (!sourceFingerprint) {
    return failClosed("missing-source-fingerprint", "A safe source fingerprint is required before runtime board-fill diagnostics.", {
      runLengthMm,
      selectedTierOrProfile,
    });
  }

  const policy = resolvePolicySummary(source, selectedTierOrProfile);
  if (!policy.ok) {
    return failClosed(policy.blocker, policy.diagnostic, {
      runLengthMm,
      selectedTierOrProfile,
      sourceFingerprint,
    });
  }

  const gapPolicySummary = buildGapPolicySummary(policy.summary);
  const bodyLengthMm = Math.max(0, runLengthMm - gapPolicySummary.totalGapMm);
  if (bodyLengthMm <= 0) {
    return failClosed("impossible-board-fill", "Gap policy leaves no positive body length for board fill.", {
      runLengthMm,
      bodyLengthMm,
      selectedTierOrProfile,
      gapPolicySummary,
      lengthPolicySummary: buildSafeLengthPolicySummary(policy.summary),
      sourceFingerprint,
    });
  }

  const boardFamily = normaliseBoardFamily(boardFamilySummary);
  if (!boardFamily.selectedBoardFamily) {
    return failClosed("missing-board-family", "A safe selected board family/template summary is required before board-fill diagnostics.", {
      runLengthMm,
      bodyLengthMm,
      selectedTierOrProfile,
      gapPolicySummary,
      lengthPolicySummary: buildSafeLengthPolicySummary(policy.summary),
      sourceFingerprint,
    });
  }
  if (!boardFamily.boardLengthMm || !boardFamily.pitchMm) {
    return failClosed("missing-board-length-pitch", "Board length and pitch are required before board-fill diagnostics.", {
      runLengthMm,
      bodyLengthMm,
      selectedTierOrProfile,
      selectedBoardFamily: boardFamily.selectedBoardFamily,
      gapPolicySummary,
      lengthPolicySummary: buildSafeLengthPolicySummary(policy.summary),
      sourceFingerprint,
    });
  }
  if (boardFamily.boardFamilyLengthsSortedDesc.length === 0) {
    return failClosed("missing-board-length-pitch", "At least one positive board length candidate is required before board-fill diagnostics.", {
      runLengthMm,
      bodyLengthMm,
      selectedTierOrProfile,
      selectedBoardFamily: boardFamily.selectedBoardFamily,
      gapPolicySummary,
      lengthPolicySummary: buildSafeLengthPolicySummary(policy.summary),
      sourceFingerprint,
    });
  }

  const boardRun = generateRuntimeBoardRun(bodyLengthMm, boardFamily.boardFamilyLengthsSortedDesc);
  if (!boardRun.success) {
    return failClosed("impossible-board-fill", "The safe board length candidates cannot exactly fill the controlled body length.", {
      runLengthMm,
      bodyLengthMm,
      selectedTierOrProfile,
      selectedBoardFamily: boardFamily.selectedBoardFamily,
      boardLengthMm: boardFamily.boardLengthMm,
      boardUsedLengthMm: bodyLengthMm - boardRun.remainderMm,
      slackMm: boardRun.remainderMm,
      gapPolicySummary,
      lengthPolicySummary: buildSafeLengthPolicySummary(policy.summary),
      policyFingerprint: `safe-policy:${stableSha1([policy.summary, gapPolicySummary])}`,
      sourceFingerprint,
    });
  }

  const lengthPolicySummary = buildSafeLengthPolicySummary(policy.summary);
  const policyFingerprint = `safe-policy:${stableSha1([lengthPolicySummary, gapPolicySummary])}`;
  const warnings = [];
  if (policy.source === "provided-policy-index-summary") {
    warnings.push("Policy summary was provided as a sealed summary rather than rebuilt from a source snapshot.");
  }

  return safetyBase({
    ok: true,
    sourceKind: "safe-source-backed-diagnostic-fixture",
    runLengthMm,
    bodyLengthMm,
    selectedTierOrProfile,
    selectedBoardFamily: boardFamily.selectedBoardFamily,
    boardCount: boardRun.usedLengthsMm.length,
    boardLengthMm: boardFamily.boardLengthMm,
    boardUsedLengthMm: bodyLengthMm,
    slackMm: 0,
    gapPolicySummary,
    lengthPolicySummary,
    policyFingerprint,
    sourceFingerprint,
    warnings,
  });
}

export const buildRuntimeNativeBoardFillSummary = buildRuntimeBoardFillKernelSummary;
export const buildEngineRunTableRuntimeBoardFillKernelStatus = buildRuntimeBoardFillKernelSummary;
