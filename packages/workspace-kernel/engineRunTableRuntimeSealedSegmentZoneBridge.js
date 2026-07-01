import { stableSha1 } from "./engineRunTableRuntimePolicyIndexKernel.js";

export const ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_ID =
  "controlstack.runtime.engine-runtable.sealed-segment-zone-bridge-summary";
export const ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_VERSION = 1;
export const ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_STATE =
  "runtime_sealed_segment_zone_bridge_diagnostic_only";

const SAFETY_FLAGS = Object.freeze({
  readOnly: true,
  nativeRuntimeKernel: true,
  diagnosticOnly: true,
  safeSummaryOnly: true,
  fullZoneSolverEnabled: false,
  crossJoinComparisonEnabled: false,
  segmentSplitEnrichmentEnabled: false,
  mechanicalDetailingEnabled: false,
  boardSwapSolverEnabled: false,
  gateDValidationEnabled: false,
  runtimeDataMutationEnabled: false,
  donorMutationEnabled: false,
  donorEngineInvoked: false,
  runTableGenerationEnabled: false,
  iesGenerationEnabled: false,
  selectedResultPersistenceEnabled: false,
  publicRoutesAdded: false,
  postEndpointsAdded: false,
  rawProductRowsReturned: false,
  rawBoardRowsReturned: false,
  rawDriverRowsReturned: false,
  rawAccessoryRowsReturned: false,
  rawReservationGridReturned: false,
  rawEnginePayloadReturned: false,
});

const SAFE_FP = /^safe[-:][0-9A-Za-z_.:-]{4,340}$/;
const PRIVATE_PATH = /(?:[A-Za-z]:[\\/]|\\\\|[\\/]Users[\\/]|[\\/]home[\\/]|[\\/]mnt[\\/]|file:)/i;
const RAW_KEY = /^(?:raw.*Rows?|.*Rows|.*Table|PRODUCTS?|BOARDS?|DRIVERS?|ACCESSORIES|rawReservationGrid|reservationGrid|rawEnginePayload|enginePayload|runEnginePayload|selectorPayload|donorPayload)$/i;
const UNSAFE_TRUE = new Map([
  ["donorEngineInvoked", "donor-engine-invocation-not-approved"],
  ["runtimeDataMutated", "runtime-data-mutation-not-approved"],
  ["runTableGenerated", "runtable-generation-not-approved"],
  ["runtableGenerated", "runtable-generation-not-approved"],
  ["iesGenerated", "ies-generation-not-approved"],
  ["selectedResultPersisted", "selected-result-persistence-not-approved"],
  ["routesAdded", "routes-added-not-approved"],
  ["postEndpointsAdded", "post-endpoints-added-not-approved"],
  ["rawProductRowsReturned", "unsafe-board-fill-summary"],
  ["rawBoardRowsReturned", "unsafe-board-fill-summary"],
  ["rawDriverRowsReturned", "unsafe-driver-sizer-summary"],
  ["rawAccessoryRowsReturned", "unsafe-accessory-reservation-summary"],
  ["rawReservationGridReturned", "unsafe-reserved-range-summary"],
  ["rawEnginePayloadReturned", "raw-engine-payload-input-not-approved"],
]);

function clone(value) { return JSON.parse(JSON.stringify(value ?? null)); }
function isObj(value) { return value !== null && typeof value === "object" && !Array.isArray(value); }
function isBlank(value) { return value === null || value === undefined || value === "" || (typeof value === "number" && Number.isNaN(value)); }
function pick(source, keys) {
  if (!isObj(source)) return undefined;
  for (const key of keys) if (Object.hasOwn(source, key) && !isBlank(source[key])) return source[key];
  return undefined;
}
function num(value) {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" && Number.isFinite(value)) return Math.round(value);
  const text = String(value ?? "").trim();
  if (!text) return null;
  const parsed = Number(text);
  if (Number.isFinite(parsed)) return Math.round(parsed);
  const match = text.replace(/–/g, "-").match(/[-+]?\d+(\.\d+)?/);
  return match ? Math.round(Number(match[0])) : null;
}
function pos(value) { const n = num(value); return Number.isInteger(n) && n > 0 ? n : null; }
function nonNeg(value) { const n = num(value); return Number.isInteger(n) && n >= 0 ? n : null; }
function fp(value) {
  const text = String(value ?? "").trim();
  if (!text || PRIVATE_PATH.test(text)) return "";
  const safe = text.replace(/[^0-9A-Za-z_.:-]+/g, "").slice(0, 360);
  return SAFE_FP.test(safe) ? safe : "";
}
function token(value, fallback = "") {
  const text = String(value ?? "").trim();
  if (!text || PRIVATE_PATH.test(text)) return fallback;
  const safe = text.toLowerCase().replace(/[^0-9a-z_.:-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 140);
  return safe || fallback;
}
function label(value, fallback = "unresolved") {
  const text = String(value ?? "").trim();
  if (!text || PRIVATE_PATH.test(text)) return fallback;
  return text.replace(/[^0-9A-Za-z _./:-]+/g, " ").replace(/[\\/]+/g, " ").replace(/\s+/g, " ").trim().slice(0, 120) || fallback;
}
function band(value) {
  const n = nonNeg(value);
  if (n === null) return "unresolved";
  if (n === 0) return "0mm";
  if (n <= 99) return "1-99mm";
  if (n <= 499) return "100-499mm";
  if (n <= 999) return "500-999mm";
  if (n <= 1999) return "1000-1999mm";
  if (n <= 3999) return "2000-3999mm";
  if (n <= 7999) return "4000-7999mm";
  return "8000mm-plus";
}
function unsafe(value, depth = 0) {
  if (depth > 7) return null;
  if (typeof value === "string") return PRIVATE_PATH.test(value) ? "raw-engine-payload-input-not-approved" : null;
  if (Array.isArray(value)) {
    for (const item of value) { const hit = unsafe(item, depth + 1); if (hit) return hit; }
    return null;
  }
  if (!isObj(value)) return null;
  for (const [key, nested] of Object.entries(value)) {
    if (UNSAFE_TRUE.has(key) && nested === true) return UNSAFE_TRUE.get(key);
    if (RAW_KEY.test(key) && nested !== false && nested !== null && nested !== undefined) return key.toLowerCase().includes("driver") ? "unsafe-driver-sizer-summary" : key.toLowerCase().includes("accessor") ? "unsafe-accessory-reservation-summary" : key.toLowerCase().includes("reservation") ? "unsafe-reserved-range-summary" : "unsafe-board-fill-summary";
    if (/path$/i.test(key) && typeof nested === "string" && PRIVATE_PATH.test(nested)) return "raw-engine-payload-input-not-approved";
    const hit = unsafe(nested, depth + 1); if (hit) return hit;
  }
  return null;
}

function base(extra = {}) {
  return {
    schemaId: ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_ID,
    schemaVersion: ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_SCHEMA_VERSION,
    state: ENGINE_RUNTABLE_RUNTIME_SEALED_SEGMENT_ZONE_BRIDGE_STATE,
    nativeRuntimeKernel: true,
    diagnosticOnly: true,
    ok: extra.ok ?? false,
    blocker: extra.blocker || null,
    segmentZoneBridgeReady: extra.segmentZoneBridgeReady ?? false,
    frozenSegmentSummary: extra.frozenSegmentSummary || null,
    joinCount: extra.joinCount ?? 0,
    joinModeSummary: extra.joinModeSummary || null,
    noCrossZoneContainmentSummary: extra.noCrossZoneContainmentSummary || null,
    splitPieceSummaryPlaceholder: extra.splitPieceSummaryPlaceholder || { enabled: false, placeholderOnly: true, reason: "segment-split-enrichment-out-of-scope", crossJoinComparisonScoringEnabled: false },
    validationReadiness: extra.validationReadiness || { zoneValidationReady: false, gateDValidationReady: false, reason: "diagnostic-only-segment-zone-bridge-before-validation" },
    warnings: Array.isArray(extra.warnings) ? extra.warnings.map((w) => label(w, "warning")) : [],
    failClosedDiagnostics: Array.isArray(extra.failClosedDiagnostics) ? extra.failClosedDiagnostics.map((d) => label(d, "diagnostic")) : [],
    policyFingerprint: extra.policyFingerprint || null,
    sourceFingerprint: extra.sourceFingerprint || null,
    segmentZoneBridgeFingerprint: extra.segmentZoneBridgeFingerprint || null,
    rawProductRowsReturned: false,
    rawBoardRowsReturned: false,
    rawDriverRowsReturned: false,
    rawAccessoryRowsReturned: false,
    rawReservationGridReturned: false,
    rawEnginePayloadReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    safetyFlags: clone(SAFETY_FLAGS),
  };
}
function closed(blocker, diagnostic, extra = {}) {
  return base({ ...extra, ok: false, blocker, segmentZoneBridgeReady: false, failClosedDiagnostics: [blocker, diagnostic, ...(extra.failClosedDiagnostics || [])] });
}
function checkSummary(summary, name, missing, bad, policyFingerprint, sourceFingerprint, ready) {
  if (!isObj(summary)) return { ok: false, blocker: missing, diagnostic: `${name} is required.` };
  const hit = unsafe(summary); if (hit) return { ok: false, blocker: bad, diagnostic: `${name} contains unsafe input.` };
  if (summary.ok !== true || summary.diagnosticOnly !== true) return { ok: false, blocker: bad, diagnostic: `${name} must be ok and diagnostic-only.` };
  const p = fp(pick(summary, ["policyFingerprint", "safePolicyFingerprint"]));
  const s = fp(pick(summary, ["sourceFingerprint", "safeSourceFingerprint"]));
  if ((p && p !== policyFingerprint) || (s && s !== sourceFingerprint)) return { ok: false, blocker: "fingerprint-mismatch", diagnostic: `${name} fingerprint mismatch.` };
  if (ready && !ready(summary)) return { ok: false, blocker: bad, diagnostic: `${name} is not ready.` };
  return { ok: true };
}
function getPlacements(summary) {
  const rows = pick(summary, ["placements", "boardPlacements", "sealedBoardPlacements", "physicalBoardPlacements"]);
  if (!Array.isArray(rows) || rows.length === 0) return { ok: false, blocker: "unsafe-physical-board-placement-summary", diagnostic: "Sealed placements are required." };
  const out = [];
  let prevStart = null; let prevEnd = null;
  const seen = new Set();
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    if (!isObj(row) || unsafe(row)) return { ok: false, blocker: "unsafe-physical-board-placement-summary", diagnostic: "Placement rows must be sealed." };
    const startMm = nonNeg(pick(row, ["startMm", "start_mm", "start"]));
    const endMm = pos(pick(row, ["endMm", "end_mm", "end"]));
    if (startMm === null || endMm === null || endMm <= startMm) return { ok: false, blocker: "unsafe-physical-board-placement-summary", diagnostic: "Placements must be positive half-open spans." };
    if (prevStart !== null && startMm < prevStart) return { ok: false, blocker: "unsafe-physical-board-placement-summary", diagnostic: "Placements must be monotonic." };
    if (prevEnd !== null && startMm < prevEnd) return { ok: false, blocker: "unsafe-physical-board-placement-summary", diagnostic: "Placements must be non-overlapping." };
    const lengthMm = pos(pick(row, ["lengthMm", "length_mm", "boardLengthMm", "board_length_mm"])) ?? (endMm - startMm);
    if (lengthMm !== endMm - startMm) return { ok: false, blocker: "unsafe-physical-board-placement-summary", diagnostic: "Placement length mismatch." };
    const boardIndex = nonNeg(pick(row, ["boardIndex", "boardIdx", "board_idx", "index"])) ?? i;
    if (seen.has(boardIndex)) return { ok: false, blocker: "unsafe-physical-board-placement-summary", diagnostic: "Duplicate board placement index." };
    seen.add(boardIndex);
    out.push({ boardIndex, startMm, endMm, lengthMm, lengthBand: band(lengthMm) });
    prevStart = startMm; prevEnd = endMm;
  }
  return { ok: true, placements: out };
}
function getRanges(summary, clipStart, clipEnd) {
  const rows = pick(summary, ["ranges", "reservedRanges", "sealedReservedRanges", "reserved_ranges"]);
  const ranges = [];
  for (const row of (Array.isArray(rows) ? rows : [])) {
    if (!isObj(row) || unsafe(row)) return { ok: false, blocker: "unsafe-reserved-range-summary", diagnostic: "Reserved ranges must be sealed." };
    let startMm = num(pick(row, ["startMm", "start_mm", "start"]));
    let endMm = num(pick(row, ["endMm", "end_mm", "end"]));
    if (startMm === null || endMm === null) return { ok: false, blocker: "unsafe-reserved-range-summary", diagnostic: "Reserved range coordinates are required." };
    if (endMm < startMm) [startMm, endMm] = [endMm, startMm];
    const s = Math.max(clipStart, startMm); const e = Math.min(clipEnd, endMm);
    if (e > s) ranges.push({ startMm: s, endMm: e, reason: token(pick(row, ["reason", "type", "kind"]), "reserved") });
  }
  ranges.sort((a, b) => a.startMm - b.startMm || a.endMm - b.endMm);
  const merged = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.startMm <= last.endMm) last.endMm = Math.max(last.endMm, r.endMm);
    else merged.push({ ...r });
  }
  return { ok: true, ranges: merged.map((r) => ({ ...r, lengthMm: r.endMm - r.startMm, lengthBand: band(r.endMm - r.startMm) })) };
}
function overlaps(a0, a1, b0, b1) { return a0 < b1 && b0 < a1; }
function segment(index, startMm, endMm, boards) {
  const active = boards.reduce((sum, b) => sum + b.lengthMm, 0);
  return { segmentIndex: index, segmentStartMm: startMm, segmentEndMm: endMm, segmentLengthMm: endMm - startMm, segmentLengthBand: band(endMm - startMm), boardCount: boards.length, boardIndices: boards.map((b) => b.boardIndex), activeLedLengthMm: active, activeLedLengthBand: band(active), rawBoardRowsReturned: false };
}
function explicitSegments(placements, boundaries, runStart, runEnd) {
  const points = [runStart, ...boundaries, runEnd];
  const segments = [];
  for (let i = 0; i < points.length - 1; i += 1) {
    const start = points[i]; const end = points[i + 1];
    const boards = placements.filter((b) => b.startMm >= start && b.endMm <= end);
    const crossing = placements.find((b) => overlaps(start, end, b.startMm, b.endMm) && !(b.startMm >= start && b.endMm <= end));
    if (crossing || boards.length === 0) return { ok: false, blocker: "impossible-segment-pattern", diagnostic: "Explicit segment pattern is not compatible with sealed boards." };
    segments.push(segment(i, start, end, boards));
  }
  return { ok: true, segments };
}
function greedySegments(placements, maxLen) {
  const segments = [];
  let segStart = placements[0].startMm;
  let boards = [];
  let prevEnd = null;
  for (const board of placements) {
    if (board.lengthMm > maxLen) return { ok: false, blocker: "board-swap-required-but-unsupported", diagnostic: "A board is longer than max segment length." };
    if (boards.length && board.endMm - segStart > maxLen) {
      if (prevEnd === null || prevEnd <= segStart) return { ok: false, blocker: "board-fill-cannot-satisfy-segment-pattern", diagnostic: "No board-end segment boundary is available." };
      segments.push(segment(segments.length, segStart, prevEnd, boards));
      segStart = prevEnd; boards = [];
    }
    if (board.endMm - segStart > maxLen) return { ok: false, blocker: "board-fill-cannot-satisfy-segment-pattern", diagnostic: "Board fill cannot satisfy max segment policy." };
    boards.push(board); prevEnd = board.endMm;
  }
  if (boards.length) segments.push(segment(segments.length, segStart, prevEnd, boards));
  return { ok: true, segments };
}
function boundariesFrom(source, boardEnds, runEnd) {
  const raw = pick(source, ["segmentBoundariesMm", "segmentJoinPositionsMm", "joinPositionsMm"]);
  if (raw === undefined) return { ok: true, boundaries: null, source: "derived-from-max-segment-length" };
  if (!Array.isArray(raw)) return { ok: false, blocker: "impossible-segment-pattern", diagnostic: "Segment boundaries must be a sealed array." };
  const boundaries = [];
  let previous = 0;
  for (const value of raw) {
    const b = pos(value);
    if (!b || b >= runEnd || b <= previous || !boardEnds.has(b)) return { ok: false, blocker: "impossible-segment-pattern", diagnostic: "Segment boundaries may occur only at board ends." };
    boundaries.push(b); previous = b;
  }
  return { ok: true, boundaries, source: "sealed-explicit-board-end-boundaries" };
}
function joinMode(policy) {
  const raw = token(pick(policy, ["secondary_across_segment", "secondaryAcrossSegment", "joinMode", "join_mode"]), "");
  if (["allow", "cross"].includes(raw)) return "allow";
  if (["compare", "compare-cross-no-cross"].includes(raw)) return "compare";
  return "forbid";
}
function safeFrozenSummary(segments, placements, ranges, source, maxLen) {
  const runStart = placements[0].startMm; const runEnd = placements[placements.length - 1].endMm;
  const reservedTotal = ranges.reduce((sum, r) => sum + r.lengthMm, 0);
  return {
    summaryType: "sealed-frozen-physical-segment-summary",
    frozenFrom: "sealed-physical-board-placement-summary",
    segmentBoundarySource: source,
    segmentCount: segments.length,
    maxSegmentLengthMm: maxLen,
    maxSegmentLengthBand: band(maxLen),
    runStartMm: runStart,
    runEndMm: runEnd,
    runLengthMm: runEnd - runStart,
    runLengthBand: band(runEnd - runStart),
    boardPlacementCount: placements.length,
    reservedRangeSummary: { rangeCount: ranges.length, totalReservedLengthMm: reservedTotal, totalReservedLengthBand: band(reservedTotal), ranges, clippedAndMerged: true, reservedRangesForceSegmentSplits: false, rawReservationGridReturned: false },
    segments,
    segmentBoundariesMm: segments.slice(0, -1).map((s) => s.segmentEndMm),
    segmentBoundariesAtBoardEndsOnly: true,
    noBoardCrossesFrozenSegmentBoundary: true,
    rawBoardRowsReturned: false,
  };
}
function containment(segments, mode) {
  return {
    diagnosticOnly: true,
    containmentMode: "one-zone-per-frozen-physical-segment",
    secondaryAcrossSegment: mode,
    zoneCount: segments.length,
    containedZoneCount: segments.length,
    crossJoinZoneCount: 0,
    zonesCrossSegmentJoin: false,
    zoneSummaries: segments.map((s, i) => ({ zoneIndex: i, segmentIndex: s.segmentIndex, zoneStartMm: s.segmentStartMm, zoneEndMm: s.segmentEndMm, zoneLengthBand: s.segmentLengthBand, boardCount: s.boardCount, containedWithinFrozenSegment: true, crossesSegmentJoin: false, rawBoardRowsReturned: false })),
    fullZoneSolverInvoked: false,
    crossJoinComparisonScoringEnabled: false,
    rawEnginePayloadReturned: false,
  };
}

export function buildRuntimeSealedSegmentZoneBridgeSummary(input = {}) {
  const source = isObj(input) ? input : {};
  const policyFingerprint = fp(pick(source, ["policyFingerprint", "safePolicyFingerprint"]));
  if (!policyFingerprint) return closed("missing-policy-fingerprint", "A safe policy fingerprint is required.");
  const sourceFingerprint = fp(pick(source, ["sourceFingerprint", "safeSourceFingerprint"]));
  if (!sourceFingerprint) return closed("missing-source-fingerprint", "A safe source fingerprint is required.", { policyFingerprint });
  const sourceHit = unsafe(source);
  if (sourceHit) return closed(sourceHit, "Unsafe raw rows, payloads, paths, generation, persistence, routes, endpoints, or mutation authority were supplied.", { policyFingerprint, sourceFingerprint });

  const checks = [
    [pick(source, ["boardFillInputSummary"]), "board-fill input summary", "missing-board-fill-input-summary", "unsafe-board-fill-input-summary"],
    [pick(source, ["accessoryReservationSummary"]), "accessory reservation summary", "missing-accessory-reservation-summary", "unsafe-accessory-reservation-summary"],
    [pick(source, ["boardFillSummary"]), "board-fill summary", "missing-board-fill-summary", "unsafe-board-fill-summary"],
    [pick(source, ["boardElectricalSummary"]), "board electrical summary", "missing-board-electrical-summary", "unsafe-board-electrical-summary"],
    [pick(source, ["driverSizerSummary"]), "driver sizer summary", "missing-driver-sizer-summary", "unsafe-driver-sizer-summary", (s) => s.driverSizerReady === true],
    [pick(source, ["sealedPhysicalBoardPlacementSummary"]), "sealed physical board placement summary", "missing-physical-board-placement-summary", "unsafe-physical-board-placement-summary"],
    [pick(source, ["sealedReservedRangeSummary"]), "sealed reserved range summary", "missing-reserved-range-summary", "unsafe-reserved-range-summary"],
  ];
  for (const [summary, name, missing, bad, ready] of checks) {
    const checked = checkSummary(summary, name, missing, bad, policyFingerprint, sourceFingerprint, ready);
    if (!checked.ok) return closed(checked.blocker, checked.diagnostic, { policyFingerprint, sourceFingerprint });
  }

  const policy = pick(source, ["sealedSegmentPolicySummary"]);
  if (!isObj(policy)) return closed("missing-segment-policy", "A sealed segment policy summary is required.", { policyFingerprint, sourceFingerprint });
  const policyHit = unsafe(policy);
  if (policyHit) return closed("missing-segment-policy", "Segment policy summary must be sealed.", { policyFingerprint, sourceFingerprint });
  const pfp = fp(pick(policy, ["policyFingerprint", "safePolicyFingerprint"]));
  const sfp = fp(pick(policy, ["sourceFingerprint", "safeSourceFingerprint"]));
  if ((pfp && pfp !== policyFingerprint) || (sfp && sfp !== sourceFingerprint)) return closed("fingerprint-mismatch", "Segment policy fingerprint mismatch.", { policyFingerprint, sourceFingerprint });
  const maxLen = pos(pick(policy, ["segmentMaxLengthMm", "segment_max_length_mm", "maxSegmentLengthMm"]));
  if (!maxLen) return closed("missing-max-segment-length", "A positive max segment length policy is required.", { policyFingerprint, sourceFingerprint });

  const physical = pick(source, ["sealedPhysicalBoardPlacementSummary"]);
  const place = getPlacements(physical);
  if (!place.ok) return closed(place.blocker, place.diagnostic, { policyFingerprint, sourceFingerprint });
  const placements = place.placements;
  const runStart = placements[0].startMm; const runEnd = placements[placements.length - 1].endMm;
  const rangesResult = getRanges(pick(source, ["sealedReservedRangeSummary"]), runStart, runEnd);
  if (!rangesResult.ok) return closed(rangesResult.blocker, rangesResult.diagnostic, { policyFingerprint, sourceFingerprint });
  for (const r of rangesResult.ranges) for (const b of placements) {
    if (overlaps(r.startMm, r.endMm, b.startMm, b.endMm)) return closed("board-placement-overlaps-reserved-range", "A clipped reserved range overlaps a sealed board placement.", { policyFingerprint, sourceFingerprint });
  }
  const boundarySource = physical.segmentBoundariesMm !== undefined ? physical : policy;
  const boundaryCheck = boundariesFrom(boundarySource, new Set(placements.map((p) => p.endMm)), runEnd);
  if (!boundaryCheck.ok) return closed(boundaryCheck.blocker, boundaryCheck.diagnostic, { policyFingerprint, sourceFingerprint });
  const built = boundaryCheck.boundaries ? explicitSegments(placements, boundaryCheck.boundaries, runStart, runEnd) : greedySegments(placements, maxLen);
  if (!built.ok) return closed(built.blocker, built.diagnostic, { policyFingerprint, sourceFingerprint });
  const segments = built.segments;
  if (!segments.length) return closed("zone-calculation-depends-on-unavailable-physical-layout", "Frozen physical segments are unavailable.", { policyFingerprint, sourceFingerprint });
  const boardEnds = new Set(placements.map((p) => p.endMm));
  for (const s of segments.slice(0, -1)) if (!boardEnds.has(s.segmentEndMm)) return closed("impossible-segment-pattern", "Segment boundary is not a board end.", { policyFingerprint, sourceFingerprint });

  const mode = joinMode(policy);
  const joinCount = Math.max(0, segments.length - 1);
  const frozenSegmentSummary = safeFrozenSummary(segments, placements, rangesResult.ranges, boundaryCheck.source, maxLen);
  const noCrossZoneContainmentSummary = containment(segments, mode);
  const joinModeSummary = { secondaryAcrossSegment: mode, joinCount, noCrossContainmentDiagnosticsEnabled: true, allowCrossSegmentJoins: mode === "allow", compareModeRequested: mode === "compare", placeholderOnly: mode !== "forbid", crossJoinComparisonScoringEnabled: false, crossNoCrossComparisonDeferred: mode !== "forbid", joinModeDecision: mode === "forbid" ? "no-cross-containment-only" : "placeholder-only-no-cross-diagnostics-still-emitted" };
  const warnings = [];
  if (rangesResult.ranges.length) warnings.push("Reserved ranges were clipped and merged, but they did not force segment splits.");
  if (mode !== "forbid") warnings.push("Cross/compare mode is a placeholder only; no cross/no-cross scoring was performed.");
  const segmentZoneBridgeFingerprint = `safe-segment-zone-bridge:${stableSha1([policyFingerprint, sourceFingerprint, maxLen, mode, placements, rangesResult.ranges, segments])}`;
  return base({
    ok: true,
    segmentZoneBridgeReady: true,
    frozenSegmentSummary,
    joinCount,
    joinModeSummary,
    noCrossZoneContainmentSummary,
    splitPieceSummaryPlaceholder: { enabled: false, placeholderOnly: true, reason: "segment-split-enrichment-out-of-scope", donorSegmentSplitInvoked: false, mechanicalDetailingEnabled: false, crossJoinComparisonScoringEnabled: false },
    validationReadiness: { segmentZoneBridgeReady: true, noCrossZoneContainmentDiagnosticsReady: true, crossNoCrossComparisonReady: false, gateDValidationReady: false, fullZoneValidationReady: false, reason: "sealed-diagnostic-bridge-ready-before-full-zone-validation" },
    warnings,
    failClosedDiagnostics: [],
    policyFingerprint,
    sourceFingerprint,
    segmentZoneBridgeFingerprint,
  });
}

export const buildRuntimeNativeSealedSegmentZoneBridgeSummary = buildRuntimeSealedSegmentZoneBridgeSummary;
export const buildEngineRunTableRuntimeSealedSegmentZoneBridgeStatus = buildRuntimeSealedSegmentZoneBridgeSummary;
