// ControlStack Lab — guarded immutable controller for the core Summary/Normalise recipe.
// Browser-safe. UI code calls this controller; raw transforms remain implementation details.

import { detectTilt, level } from "./iesLevel.js";
import { analyzeSymmetry, symmetrize } from "./iesSymmetrize.js";
import { detectHemisphere, maskHemisphere } from "./iesTransforms.js";
import { toOneMm } from "./iesOneMm.js";
import { NORMALISE_STAGES, assertWorkingSession, cloneWorkingSession } from "./iesWorkingRecord.js";

const NEXT_STAGE = Object.freeze({
  dimensions: ["loaded", "dimensions_decided"],
  metadata: ["dimensions_decided", "metadata_decided"],
  level: ["metadata_decided", "level_decided"],
  symmetrise: ["level_decided", "symmetry_decided"],
  interpolate: ["symmetry_decided", "interpolated"],
  pad: ["interpolated", "padded"],
  one_mm: ["padded", "one_mm"],
});

const HEMISPHERE_MODES = new Set(["auto", "down", "up", "bi"]);

/** Error raised when a Normalise operation violates the guarded recipe. */
export class NormaliseControllerError extends Error {
  constructor(message, code = "normalise_blocked", blockers = []) {
    super(message);
    this.name = "NormaliseControllerError";
    this.code = code;
    this.blockers = blockers.slice();
  }
}

function stageIndex(stage) { return NORMALISE_STAGES.indexOf(stage); }
function cleanReason(reason) { return String(reason ?? "").trim(); }
function same(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

/** Return fail-closed blockers for an operation without mutating the session. */
export function getNormaliseBlockers(session, operation) {
  try { assertWorkingSession(session); } catch (error) { return [error.message]; }
  const contract = NEXT_STAGE[operation];
  if (!contract) return [`Unknown Normalise operation ${String(operation)}.`];
  const [required, completed] = contract;
  if (session.recipe.stage === completed) return [`${operation} has already been decided for this working session.`];
  if (session.recipe.stage !== required) {
    const current = session.recipe.stage;
    if (stageIndex(current) < stageIndex(required)) return [`${operation} is blocked until stage ${required} is complete; current stage is ${current}.`];
    return [`${operation} cannot run after stage ${current}; expected ${required}.`];
  }
  return [];
}

function requireReady(session, operation) {
  const blockers = getNormaliseBlockers(session, operation);
  if (blockers.length) throw new NormaliseControllerError(blockers.join(" "), "normalise_blocked", blockers);
}

function appendDecision(next, operation, outcome, params, nowUtc) {
  const atUtc = String(nowUtc || new Date().toISOString());
  const entry = Object.freeze({
    ordinal: next.provenanceDraft.entries.length + 1,
    operation,
    outcome,
    params: { ...params },
    timestampUtc: atUtc,
  });
  next.provenanceDraft.entries.push(entry);
  next.recipe.decisions[operation] = { outcome, params: { ...params }, timestampUtc: atUtc };
}

function transition(session, operation, outcome, params = {}, options = {}) {
  requireReady(session, operation);
  const next = cloneWorkingSession(session);
  if (options.workingModel !== undefined) {
    if (!options.workingModel || typeof options.workingModel !== "object" || Array.isArray(options.workingModel)) {
      throw new NormaliseControllerError("workingModel must be an object when supplied.", "invalid_working_model");
    }
    next.workingModel = structuredCloneSafe(options.workingModel);
  }
  next.recipe.stage = NEXT_STAGE[operation][1];
  if (options.targetGridId !== undefined) next.recipe.targetGridId = options.targetGridId;
  appendDecision(next, operation, outcome, params, options.nowUtc);
  assertWorkingSession(next);
  return next;
}

function structuredCloneSafe(value) {
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (Array.isArray(value)) return value.map(structuredCloneSafe);
  const out = {}; for (const [key, child] of Object.entries(value)) out[key] = structuredCloneSafe(child); return out;
}

/** Record the required luminous-dimension decision. */
export function decideDimensions(session, { dimensions = {}, captureMethod, workingModel, nowUtc } = {}) {
  const method = cleanReason(captureMethod);
  if (!method) throw new NormaliseControllerError("captureMethod is required for the dimensions decision.", "missing_capture_method");
  return transition(session, "dimensions", "applied", { dimensions: structuredCloneSafe(dimensions), captureMethod: method }, { workingModel, nowUtc });
}

/** Record the required metadata decision. */
export function decideMetadata(session, { metadata = {}, workingModel, nowUtc } = {}) {
  return transition(session, "metadata", "applied", { metadata: structuredCloneSafe(metadata) }, { workingModel, nowUtc });
}

/** Run or intentionally skip Level. Calling this function is required even when tilt is within tolerance. */
export function runLevel(session, { decision = "apply", reason = "", toleranceDeg = 1, nowUtc } = {}) {
  requireReady(session, "level");
  if (decision === "skip") {
    const why = cleanReason(reason);
    if (!why) throw new NormaliseControllerError("Intentional Level skip requires a reason.", "missing_skip_reason");
    return transition(session, "level", "skipped_intentional", { reason: why, toleranceDeg }, { nowUtc });
  }
  if (decision !== "apply") throw new NormaliseControllerError("Level decision must be apply or skip.", "invalid_level_decision");
  const tilt = detectTilt(session.workingModel);
  if (Math.abs(Number(tilt.tiltDeg)) <= Number(toleranceDeg)) {
    return transition(session, "level", "no_op_within_tolerance", { ...tilt, toleranceDeg }, { nowUtc });
  }
  const result = level(session.workingModel);
  return transition(session, "level", result.applied ? "applied" : "no_op_within_tolerance", {
    tiltDeg: result.tiltDeg, tiltAzimuthDeg: result.tiltAzimuthDeg, toleranceDeg,
  }, { workingModel: result.model, nowUtc });
}

/** Run or intentionally skip Symmetrise, recording residual QA values. */
export function runSymmetrise(session, { decision = "apply", reason = "", mode = "auto", nowUtc } = {}) {
  requireReady(session, "symmetrise");
  const analysis = analyzeSymmetry(session.workingModel);
  if (decision === "skip") {
    const why = cleanReason(reason);
    if (!why) throw new NormaliseControllerError("Intentional Symmetrise skip requires a reason.", "missing_skip_reason");
    return transition(session, "symmetrise", "skipped_intentional", { reason: why, analysis }, { nowUtc });
  }
  if (decision !== "apply") throw new NormaliseControllerError("Symmetrise decision must be apply or skip.", "invalid_symmetry_decision");
  const result = symmetrize(session.workingModel, mode);
  const outcome = result.imbalance.maxRelPct === 0 && result.imbalance.rmsRelPct === 0
    ? "no_op_already_symmetric" : "applied";
  const workingModel = { ...structuredCloneSafe(session.workingModel), photometry: result.photometry };
  return transition(session, "symmetrise", outcome, { analysis, imbalance: result.imbalance }, { workingModel, nowUtc });
}

/** Run the mandatory interpolation policy supplied by the caller. */
export function runInterpolate(session, { transform, targetGridId, nowUtc } = {}) {
  requireReady(session, "interpolate");
  if (typeof transform !== "function") throw new NormaliseControllerError("Interpolate requires an injected transform function.", "missing_interpolation_transform");
  const gridId = cleanReason(targetGridId);
  if (!gridId) throw new NormaliseControllerError("Interpolate requires targetGridId.", "missing_target_grid_id");
  const candidate = transform(structuredCloneSafe(session.workingModel));
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    throw new NormaliseControllerError("Interpolation transform must return a working-model object.", "invalid_interpolation_result");
  }
  const outcome = same(candidate, session.workingModel) ? "no_op_exact_target_grid" : "applied";
  return transition(session, "interpolate", outcome, { targetGridId: gridId }, { workingModel: candidate, targetGridId: gridId, nowUtc });
}

/** Run mandatory hemisphere padding/masking. Intentional skip is not exposed. */
export function runPad(session, { hemisphere = "auto", nowUtc } = {}) {
  requireReady(session, "pad");
  if (!HEMISPHERE_MODES.has(hemisphere)) {
    throw new NormaliseControllerError(
      "Pad hemisphere must be auto, down, up, or bi.",
      "invalid_hemisphere",
    );
  }
  const detected = hemisphere === "auto" ? detectHemisphere(session.workingModel.photometry || {}) : hemisphere;
  const masked = maskHemisphere(session.workingModel.photometry || {}, hemisphere);
  const workingModel = { ...structuredCloneSafe(session.workingModel), photometry: masked };
  let outcome = "applied";
  if (detected === "bi") outcome = "no_op_bidirectional_distribution";
  else if (same(masked, session.workingModel.photometry || {})) outcome = "no_op_already_mask_clean";
  return transition(session, "pad", outcome, { hemisphere, detectedHemisphere: detected }, { workingModel, nowUtc });
}

/** Run mandatory reduction to the 1 mm basis. Intentional skip is not exposed. */
export function runOneMm(session, { nowUtc } = {}) {
  requireReady(session, "one_mm");
  const lengthM = Number(session.workingModel?.photometry?.geometry?.G8);
  if (!Number.isFinite(lengthM) || lengthM <= 0) {
    throw new NormaliseControllerError(
      "One-millimetre reduction requires a finite positive source length in photometry.geometry.G8.",
      "invalid_source_length",
    );
  }
  if (Math.abs(lengthM - 0.001) < 1e-12) {
    return transition(session, "one_mm", "no_op_already_one_mm", { baseLengthM: 0.001 }, { nowUtc });
  }
  const workingModel = toOneMm(session.workingModel);
  return transition(session, "one_mm", "applied", { fromLengthM: Number.isFinite(lengthM) ? lengthM : null, baseLengthM: 0.001 }, { workingModel, nowUtc });
}
