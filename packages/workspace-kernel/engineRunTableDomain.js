import {
  buildSelectedResultProjectionContract,
  createSelectedResultPerRunDisplayRowShape,
} from "./selectedResultProjectionService.js";

export const ENGINE_RUNTABLE_DOMAIN_KERNEL_STATE = "pure_domain_preview_only";

export const ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  displayOnly: true,
  deterministicOnly: true,
  pureDomainOnly: true,
  sourceAvailable: false,
  selectedResultAvailable: false,
  engineExecutionEnabled: false,
  engineVerificationEnabled: false,
  selectedResultIngestionEnabled: false,
  selectedResultPersistenceEnabled: false,
  staleResultComparisonEnabled: false,
  runTableGenerationEnabled: false,
  payloadGenerationEnabled: false,
  iesGenerationEnabled: false,
  drawingGenerationEnabled: false,
  labProofAuthority: false,
  complianceProofAuthority: false,
  controlledRecordsWriteEnabled: false,
  rregApprovalEnabled: false,
  rregCustodyTransferEnabled: false,
  hubSpotCrmWriteBackEnabled: false,
  boardDataMutationEnabled: false,
  hiddenWriteBackEnabled: false,
  rawSelectedPayloadExposed: false,
  rawEngineDebugPayloadExposed: false,
  rawCandidateAlternativesExposedAsFinalOutputs: false,
  rawBoardDataRowsExposed: false,
  rawBoardDataHeadersExposed: false,
  rawUsersExposed: false,
  credentialsExposed: false,
  privatePathsExposed: false,
  rawLabEvidenceExposed: false,
  rawIesExposed: false,
  rawArtefactsExposed: false,
  rawPdfsExposed: false,
  routesAdded: false,
  postEndpointsAdded: false,
});

const GAP_MODES = new Set(["N+1", "N-1"]);
const SAFE_RESERVED_TYPES = new Set([
  "reserved",
  "accessory",
  "sensor",
  "emergency",
  "join",
  "driver",
  "mechanical",
  "gap",
]);

function clonePlain(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function appendWarning(warnings, message) {
  if (Array.isArray(warnings) && message && !warnings.includes(message)) {
    warnings.push(message);
  }
}

function firstPresent(source, keys) {
  for (const key of keys) {
    if (Object.prototype.hasOwnProperty.call(source, key)) return source[key];
  }
  return undefined;
}

function asNonNegativeInteger(value, fallback = 0) {
  if (typeof value === "boolean") return value ? 1 : 0;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.max(0, Math.round(parsed));
}

function readNonNegativeInteger(source, keys, fallback, warnings, label) {
  const value = firstPresent(source, keys);
  if (value === undefined || value === null || value === "") return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    appendWarning(warnings, `${label} was not numeric and was normalised to ${fallback}mm.`);
    return fallback;
  }
  const rounded = Math.round(parsed);
  if (rounded < 0) {
    appendWarning(warnings, `${label} was negative and was clipped to 0mm.`);
    return 0;
  }
  return rounded;
}

function normalizeGapMode(value, warnings) {
  const mode = String(value || "N+1").trim().toUpperCase();
  if (GAP_MODES.has(mode)) return mode;
  appendWarning(warnings, "Unsupported gap mode was normalised to N+1.");
  return "N+1";
}

function hasBodyOverride(source) {
  return ["bodyMmRequested", "body_mm_requested", "bodyLengthMm", "body_length_mm"].some((key) => (
    Object.prototype.hasOwnProperty.call(source, key)
      && source[key] !== undefined
      && source[key] !== null
      && source[key] !== ""
  ));
}

function safeLabel(value, fallback) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/\\/.test(raw) || /^[A-Za-z]:/.test(raw)) return fallback;
  const cleaned = raw.replace(/[^0-9A-Za-z _./-]+/g, " ").replace(/[\/]+/g, " ").replace(/\s+/g, " ").trim();
  return cleaned ? cleaned.slice(0, 80) : fallback;
}

function safeToken(value, fallback) {
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/[\\/:]/.test(raw)) return fallback;
  const cleaned = raw.replace(/[^0-9A-Za-z_-]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  return cleaned ? cleaned.slice(0, 80) : fallback;
}

function safeReservedType(value) {
  const token = String(value || "reserved").trim().toLowerCase().replace(/[^a-z0-9_-]+/g, "_");
  return SAFE_RESERVED_TYPES.has(token) ? token : "reserved";
}

function uniqueSortedBoardLengths(values, warnings) {
  if (!Array.isArray(values)) {
    appendWarning(warnings, "Board length candidates were missing and no board run could be packed.");
    return [];
  }
  const lengths = [];
  for (const value of values) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      appendWarning(warnings, "A board length candidate was ignored because it was not a positive number.");
      continue;
    }
    lengths.push(Math.round(parsed));
  }
  return [...new Set(lengths)].sort((a, b) => b - a);
}

function summarizeBoardCounts(lengthSequence) {
  const counts = new Map();
  for (const lengthMm of lengthSequence) {
    counts.set(lengthMm, (counts.get(lengthMm) || 0) + 1);
  }
  return [...counts.entries()].map(([lengthMm, count]) => ({ lengthMm, count }));
}

function safeReservedRangesSummary(summary = {}) {
  const source = summary && typeof summary === "object" ? summary : {};
  return {
    count: asNonNegativeInteger(source.count, 0),
    totalReservedMm: asNonNegativeInteger(source.totalReservedMm, 0),
    availableBodyMm: asNonNegativeInteger(source.availableBodyMm, 0),
    bodyMmRequested: asNonNegativeInteger(source.bodyMmRequested, 0),
    clippedToBody: source.clippedToBody === true,
    sortedAndMerged: source.sortedAndMerged === true,
    coordinateSpace: source.coordinateSpace === "body_mm_half_open" ? "body_mm_half_open" : "body_mm_half_open",
    privateMetadataExposed: false,
  };
}

export function normalizeRunBodyGapContext(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const sanitisedWarnings = [];

  const runLengthMm = readNonNegativeInteger(
    source,
    ["runLengthMm", "run_length_mm", "runLength", "lengthMm", "length_mm"],
    0,
    sanitisedWarnings,
    "Run length",
  );
  const gapMode = normalizeGapMode(firstPresent(source, ["gapMode", "gap_mode"]), sanitisedWarnings);
  let startGapMm = readNonNegativeInteger(
    source,
    ["startGapMm", "start_gap_mm", "startBoardGapMm", "start_board_gap_mm", "start_board_gap"],
    0,
    sanitisedWarnings,
    "Start gap",
  );
  let endGapMm = readNonNegativeInteger(
    source,
    ["endGapMm", "end_gap_mm", "endBoardGapMm", "end_board_gap_mm", "end_board_gap"],
    0,
    sanitisedWarnings,
    "End gap",
  );
  const toleranceMm = readNonNegativeInteger(
    source,
    ["toleranceMm", "tolerance_mm", "gapToleranceMm", "gap_tolerance_mm"],
    0,
    sanitisedWarnings,
    "Gap tolerance",
  );

  if (gapMode === "N-1" && (startGapMm > 0 || endGapMm > 0)) {
    appendWarning(sanitisedWarnings, "N-1 gap mode forces start and end gaps to 0mm.");
    startGapMm = 0;
    endGapMm = 0;
  }

  const derivedBodyMm = gapMode === "N-1"
    ? runLengthMm
    : Math.max(0, runLengthMm - startGapMm - endGapMm);
  const bodyMmRequested = hasBodyOverride(source)
    ? readNonNegativeInteger(
      source,
      ["bodyMmRequested", "body_mm_requested", "bodyLengthMm", "body_length_mm"],
      derivedBodyMm,
      sanitisedWarnings,
      "Body length",
    )
    : derivedBodyMm;

  if (runLengthMm <= 0) appendWarning(sanitisedWarnings, "Run length is 0mm; downstream generation remains disabled.");
  if (gapMode === "N+1" && startGapMm + endGapMm > runLengthMm) {
    appendWarning(sanitisedWarnings, "Start and end gaps exceed run length; body length was clipped to 0mm.");
  }
  if (bodyMmRequested <= 0) appendWarning(sanitisedWarnings, "Body length is 0mm; board packing remains preview-only.");
  if (hasBodyOverride(source) && bodyMmRequested !== derivedBodyMm) {
    appendWarning(sanitisedWarnings, "Provided body length differs from the run/gap-derived body length.");
  }

  const bodyStartMm = gapMode === "N+1" ? startGapMm : 0;
  const bodyEndMm = bodyStartMm + bodyMmRequested;

  return {
    ok: true,
    state: ENGINE_RUNTABLE_DOMAIN_KERNEL_STATE,
    runLengthMm,
    bodyMmRequested,
    gapMode,
    startGapMm,
    endGapMm,
    toleranceMm,
    gapSummary: {
      mode: gapMode,
      startGapMm,
      endGapMm,
      totalGapMm: startGapMm + endGapMm,
      toleranceMm,
      bodyStartMm,
      bodyEndMm,
      bodyMmRequested,
    },
    sanitisedWarnings,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS),
  };
}

export function normalizeReservedRanges(ranges = [], options = {}) {
  const sanitisedWarnings = [];
  const bodyMmRequested = readNonNegativeInteger(
    options && typeof options === "object" ? options : {},
    ["bodyMmRequested", "body_mm_requested", "bodyLengthMm", "body_length_mm"],
    0,
    sanitisedWarnings,
    "Body length",
  );
  const inputRanges = Array.isArray(ranges) ? ranges : [];
  if (!Array.isArray(ranges)) appendWarning(sanitisedWarnings, "Reserved ranges were not an array and were ignored.");

  const clipped = [];
  inputRanges.forEach((range, index) => {
    if (!range || typeof range !== "object" || Array.isArray(range)) {
      appendWarning(sanitisedWarnings, `Reserved range #${index + 1} was ignored because it was not an object.`);
      return;
    }
    let startMm = readNonNegativeInteger(
      range,
      ["startMm", "start_mm", "start"],
      0,
      sanitisedWarnings,
      `Reserved range #${index + 1} start`,
    );
    let endMm = readNonNegativeInteger(
      range,
      ["endMm", "end_mm", "end"],
      0,
      sanitisedWarnings,
      `Reserved range #${index + 1} end`,
    );
    if (endMm < startMm) {
      appendWarning(sanitisedWarnings, `Reserved range #${index + 1} had reversed bounds and was normalised.`);
      [startMm, endMm] = [endMm, startMm];
    }
    const clippedStartMm = Math.max(0, Math.min(bodyMmRequested, startMm));
    const clippedEndMm = Math.max(0, Math.min(bodyMmRequested, endMm));
    if (clippedEndMm <= clippedStartMm) {
      appendWarning(sanitisedWarnings, `Reserved range #${index + 1} fell outside the body and was ignored.`);
      return;
    }
    clipped.push({
      startMm: clippedStartMm,
      endMm: clippedEndMm,
      type: safeReservedType(firstPresent(range, ["type", "kind", "reservedType"])),
    });
  });

  clipped.sort((a, b) => (a.startMm - b.startMm) || (a.endMm - b.endMm));

  const merged = [];
  for (const range of clipped) {
    const previous = merged[merged.length - 1];
    if (previous && range.startMm <= previous.endMm) {
      previous.endMm = Math.max(previous.endMm, range.endMm);
      previous.type = previous.type === range.type ? previous.type : "reserved";
    } else {
      merged.push({ ...range });
    }
  }

  const reservedRanges = merged.map((range, index) => ({
    rangeIndex: index + 1,
    startMm: range.startMm,
    endMm: range.endMm,
    lengthMm: range.endMm - range.startMm,
    type: range.type,
  }));
  const totalReservedMm = reservedRanges.reduce((sum, range) => sum + range.lengthMm, 0);

  return {
    ok: true,
    state: ENGINE_RUNTABLE_DOMAIN_KERNEL_STATE,
    reservedRanges,
    reservedRangesSummary: {
      count: reservedRanges.length,
      totalReservedMm,
      availableBodyMm: Math.max(0, bodyMmRequested - totalReservedMm),
      bodyMmRequested,
      clippedToBody: true,
      sortedAndMerged: true,
      coordinateSpace: "body_mm_half_open",
      rawMetadataExposed: false,
    },
    sanitisedWarnings,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS),
  };
}

export function packGreedyBoardRun(input = {}) {
  const source = input && typeof input === "object" ? input : {};
  const bodyContext = normalizeRunBodyGapContext(source);
  const sanitisedWarnings = [...bodyContext.sanitisedWarnings];
  const reserved = normalizeReservedRanges(
    firstPresent(source, ["reservedRanges", "reserved_ranges"]) || [],
    { bodyMmRequested: bodyContext.bodyMmRequested },
  );
  for (const warning of reserved.sanitisedWarnings) appendWarning(sanitisedWarnings, warning);

  const boardLengthCandidatesMm = uniqueSortedBoardLengths(
    firstPresent(source, ["boardLengthCandidatesMm", "board_length_candidates_mm", "boardFamilyLengthsSortedDesc", "board_family_lengths_sorted_desc"]),
    sanitisedWarnings,
  );

  const bodyUsableMm = Math.max(0, bodyContext.bodyMmRequested - reserved.reservedRangesSummary.totalReservedMm);
  const maxUsableSpanMm = readNonNegativeInteger(
    source,
    ["maxUsableSpanMm", "max_usable_span_mm"],
    0,
    sanitisedWarnings,
    "Maximum usable span",
  );
  const minUsableSpanMm = readNonNegativeInteger(
    source,
    ["minUsableSpanMm", "min_usable_span_mm"],
    0,
    sanitisedWarnings,
    "Minimum usable span",
  );
  const targetUsableMm = maxUsableSpanMm > 0 ? Math.min(bodyUsableMm, maxUsableSpanMm) : bodyUsableMm;

  if (maxUsableSpanMm > 0 && maxUsableSpanMm < bodyUsableMm) {
    appendWarning(sanitisedWarnings, "Usable board span was capped by maxUsableSpanMm.");
  }
  if (minUsableSpanMm > 0 && targetUsableMm < minUsableSpanMm) {
    appendWarning(sanitisedWarnings, "Usable board span is below minUsableSpanMm.");
  }

  const boardLengthSequenceMm = [];
  let remainingMm = targetUsableMm;
  while (remainingMm > 0 && boardLengthCandidatesMm.length > 0) {
    const picked = boardLengthCandidatesMm.find((candidate) => candidate <= remainingMm);
    if (!picked) break;
    boardLengthSequenceMm.push(picked);
    remainingMm -= picked;
  }

  const usedLengthMm = boardLengthSequenceMm.reduce((sum, lengthMm) => sum + lengthMm, 0);
  const remainderMm = targetUsableMm - usedLengthMm;
  const slackMm = Math.max(0, bodyUsableMm - usedLengthMm);
  const boardFamily = safeLabel(firstPresent(source, ["boardFamily", "boardFamilyLabel", "board_family", "board_family_label"]), "sanitised board family");

  if (targetUsableMm > 0 && boardLengthSequenceMm.length === 0) {
    appendWarning(sanitisedWarnings, "No board length candidate could fit the usable span.");
  }
  if (remainderMm > 0) {
    appendWarning(sanitisedWarnings, "Greedy board packing left a positive remainder.");
  }

  const boardRunSummary = {
    strategy: "greedy_largest_first",
    boardFamily,
    candidateLengthsMm: [...boardLengthCandidatesMm],
    requestedBodyMm: bodyContext.bodyMmRequested,
    usableBodyMm: bodyUsableMm,
    targetUsableMm,
    usedLengthMm,
    remainderMm,
    slackMm,
    boardCount: boardLengthSequenceMm.length,
    exactFill: targetUsableMm > 0 && remainderMm === 0,
    reservedRangeCount: reserved.reservedRangesSummary.count,
    generationEnabled: false,
    engineVerified: false,
    accepted: false,
  };

  return {
    ok: true,
    state: ENGINE_RUNTABLE_DOMAIN_KERNEL_STATE,
    runLengthMm: bodyContext.runLengthMm,
    bodyMmRequested: bodyContext.bodyMmRequested,
    gapSummary: bodyContext.gapSummary,
    reservedRanges: reserved.reservedRanges,
    reservedRangesSummary: reserved.reservedRangesSummary,
    boardLengthCandidatesMm,
    boardLengthSequenceMm,
    boardCount: boardLengthSequenceMm.length,
    boardFamily,
    usedLengthMm,
    remainderMm,
    slackMm,
    boardRunSummary,
    sanitisedWarnings,
    safetyFlags: clonePlain(ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS),
  };
}

export function adaptRunTableDomainOutputToPerRunDisplay(domainOutput = {}, identity = {}) {
  const output = domainOutput && typeof domainOutput === "object" ? domainOutput : {};
  const runNumber = firstPresent(identity, ["runNumber", "run_number"]);
  const normalisedRunNumber = runNumber === undefined || runNumber === null || runNumber === ""
    ? null
    : asNonNegativeInteger(runNumber, 0);
  const fallbackRunKey = normalisedRunNumber === null ? "run-preview" : `run-${normalisedRunNumber}`;
  const runKey = safeToken(firstPresent(identity, ["runKey", "run_key", "id"]), fallbackRunKey);
  const runLabel = safeLabel(firstPresent(identity, ["runLabel", "run_label", "label"]), normalisedRunNumber === null ? "Run preview" : `Run ${normalisedRunNumber}`);

  const row = {
    ...createSelectedResultPerRunDisplayRowShape(),
    runKey,
    runLabel,
    runNumber: normalisedRunNumber,
    runLengthMm: asNonNegativeInteger(output.runLengthMm, null),
    bodyMmRequested: asNonNegativeInteger(output.bodyMmRequested, null),
    segmentSummary: {
      segmentCount: 0,
      state: "not_generated",
      generationEnabled: false,
    },
    segmentsSummary: {
      segmentCount: 0,
      state: "not_generated",
      generationEnabled: false,
    },
    reservedRangesSummary: safeReservedRangesSummary(output.reservedRangesSummary),
    boardRunSummary: clonePlain(output.boardRunSummary || {
      strategy: "greedy_largest_first",
      boardCount: 0,
      generationEnabled: false,
      engineVerified: false,
      accepted: false,
    }),
    boardCount: asNonNegativeInteger(output.boardCount, 0),
    boardFamily: safeLabel(output.boardFamily, "sanitised board family"),
    zoneCount: null,
    zonePlanSummary: {
      state: "not_generated",
      generationEnabled: false,
    },
    zoneTargetSummary: null,
    mechanicalSummary: {
      state: "not_detailed",
      generationEnabled: false,
    },
    suspensionSummary: {
      state: "not_generated",
      generationEnabled: false,
    },
    clipSummary: {
      state: "not_generated",
      generationEnabled: false,
    },
    gearTraySummary: {
      state: "not_generated",
      generationEnabled: false,
    },
    sanitisedWarnings: Array.isArray(output.sanitisedWarnings) ? [...output.sanitisedWarnings] : [],
  };

  return row;
}

export function buildRunTableDomainPreviewProjection(domainOutput = {}, identity = {}) {
  const projection = buildSelectedResultProjectionContract();
  const domainPreviewRun = adaptRunTableDomainOutputToPerRunDisplay(domainOutput, identity);
  const safetyFlags = {
    ...projection.safetyFlags,
    ...clonePlain(ENGINE_RUNTABLE_DOMAIN_KERNEL_SAFETY_FLAGS),
  };

  return {
    ...projection,
    state: "estimated_preview",
    sourceState: ENGINE_RUNTABLE_DOMAIN_KERNEL_STATE,
    sourceAvailable: false,
    selectedResultAvailable: false,
    selectedResultUnavailableReason: "pure Engine RunTable domain kernel preview only; no selected result source connected",
    estimatedPreviewOnly: true,
    engineVerified: false,
    accepted: false,
    stale: false,
    selectedFamilySubsetLock: null,
    perRunLookupNormalised: false,
    runs: [],
    runsByKey: {},
    domainKernelPreview: true,
    domainPreviewRuns: [domainPreviewRun],
    domainPreviewRun,
    safetyFlags,
    rows: [
      ...(Array.isArray(projection.rows) ? projection.rows : []),
      ["domain kernel preview", "true"],
      ["source available", "false"],
      ["selected result available", "false"],
      ["engine verified", "false"],
      ["accepted", "false"],
      ["routes added", "false"],
      ["post endpoints added", "false"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
  };
}
