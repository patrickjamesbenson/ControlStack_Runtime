import { test } from "node:test";
import assert from "node:assert/strict";
import { createWorkingSession } from "../../packages/lab-kernel/ies-toolkit/iesWorkingRecord.js";
import {
  decideDimensions,
  decideMetadata,
  getNormaliseBlockers,
  runInterpolate,
  runLevel,
  runOneMm,
  runPad,
  runSymmetrise,
} from "../../packages/lab-kernel/ies-toolkit/iesNormaliseController.js";

function model({ tilt = false, length = 1, asymmetric = false, bidirectional = false } = {}) {
  const V = [0, 90, 180];
  const H = asymmetric ? [0, 180, 360] : [0];
  let rows;
  if (bidirectional) rows = H.map(() => [100, 20, 100]);
  else if (tilt) rows = H.map(() => [20, 100, 0]);
  else rows = H.map((_, i) => [i === 1 ? 50 : 100, 0, 0]);
  return { meta: {}, photometry: { v_angles: V, h_angles: H, candela: rows, geometry: { G8: length, G12: 10 } } };
}

function session(options = {}) {
  return createWorkingSession({ slotId: "A", originBytes: "IES", parsedModel: model(options) });
}

function throughMetadata(s) {
  const d = decideDimensions(s, { dimensions: { lengthM: 1 }, captureMethod: "end-plate", nowUtc: "2026-07-16T00:00:00Z" });
  return decideMetadata(d, { metadata: { watts: 10 }, nowUtc: "2026-07-16T00:00:01Z" });
}

test("returns clear blockers and never silently advances Level", () => {
  const loaded = session();
  assert.match(getNormaliseBlockers(loaded, "level")[0], /metadata_decided/);
  assert.equal(loaded.recipe.stage, "loaded");
  assert.throws(() => runLevel(loaded), /blocked until stage metadata_decided/);

  const ready = throughMetadata(loaded);
  assert.equal(ready.recipe.stage, "metadata_decided");
  assert.equal(ready.recipe.decisions.level, undefined);
  const levelled = runLevel(ready, { toleranceDeg: 1, nowUtc: "2026-07-16T00:00:02Z" });
  assert.equal(levelled.recipe.stage, "level_decided");
  assert.equal(levelled.recipe.decisions.level.outcome, "no_op_within_tolerance");
  assert.equal(ready.recipe.stage, "metadata_decided");
});

test("records intentional skips only for Level and Symmetrise with reasons", () => {
  const ready = throughMetadata(session({ tilt: true }));
  assert.throws(() => runLevel(ready, { decision: "skip" }), /requires a reason/);
  const levelSkipped = runLevel(ready, { decision: "skip", reason: "fixture intentionally aimed", nowUtc: "2026-07-16T00:00:02Z" });
  assert.equal(levelSkipped.recipe.decisions.level.outcome, "skipped_intentional");
  assert.throws(() => runSymmetrise(levelSkipped, { decision: "skip" }), /requires a reason/);
  const symmetrySkipped = runSymmetrise(levelSkipped, { decision: "skip", reason: "asymmetry is intentional", nowUtc: "2026-07-16T00:00:03Z" });
  assert.equal(symmetrySkipped.recipe.decisions.symmetrise.outcome, "skipped_intentional");
});

test("runs the fixed order immutably and records applied/no-op outcomes", () => {
  let current = throughMetadata(session({ tilt: true, asymmetric: true }));
  current = runLevel(current, { nowUtc: "2026-07-16T00:00:02Z" });
  assert.equal(current.recipe.decisions.level.outcome, "applied");
  current = runSymmetrise(current, { mode: "mirror-c0", nowUtc: "2026-07-16T00:00:03Z" });
  assert.ok(["applied", "no_op_already_symmetric"].includes(current.recipe.decisions.symmetrise.outcome));

  assert.throws(() => runPad(current), /interpolate is blocked|pad is blocked/);
  current = runInterpolate(current, {
    targetGridId: "test-grid-v1",
    transform: (working) => working,
    nowUtc: "2026-07-16T00:00:04Z",
  });
  assert.equal(current.recipe.decisions.interpolate.outcome, "no_op_exact_target_grid");
  assert.equal(current.recipe.targetGridId, "test-grid-v1");

  current = runPad(current, { nowUtc: "2026-07-16T00:00:05Z" });
  const validPadOutcomes = ["applied", "no_op_already_mask_clean", "no_op_bidirectional_distribution"];
  assert.ok(
    validPadOutcomes.includes(current.recipe.decisions.pad.outcome),
    `unexpected Pad outcome: ${current.recipe.decisions.pad.outcome}`,
  );
  current = runOneMm(current, { nowUtc: "2026-07-16T00:00:06Z" });
  assert.equal(current.recipe.stage, "one_mm");
  assert.equal(current.workingModel.photometry.geometry.G8, 0.001);
  assert.equal(current.provenanceDraft.entries.length, 7);
  assert.deepEqual(current.provenanceDraft.entries.map((entry) => entry.operation), [
    "dimensions", "metadata", "level", "symmetrise", "interpolate", "pad", "one_mm",
  ]);
});

test("mandatory stages expose no intentional skip and validate interpolation policy", () => {
  let current = throughMetadata(session());
  current = runLevel(current);
  current = runSymmetrise(current);
  assert.throws(() => runInterpolate(current, {}), /injected transform/);
  assert.throws(() => runInterpolate(current, { transform: (working) => working }), /targetGridId/);
  assert.equal(typeof runPad, "function");
  assert.equal(typeof runOneMm, "function");
  assert.equal(runPad.length <= 2, true);
  assert.equal(runOneMm.length <= 2, true);
});

test("records bidirectional Pad and already-1mm outcomes explicitly", () => {
  let current = throughMetadata(session({ bidirectional: true, length: 0.001 }));
  current = runLevel(current);
  current = runSymmetrise(current);
  current = runInterpolate(current, { targetGridId: "same", transform: (working) => working });
  current = runPad(current);
  assert.equal(current.recipe.decisions.pad.outcome, "no_op_bidirectional_distribution");
  current = runOneMm(current);
  assert.equal(current.recipe.decisions.one_mm.outcome, "no_op_already_one_mm");
});

test("fails closed on an invalid Pad policy and a missing source-length basis", () => {
  let current = throughMetadata(session({ length: 0 }));
  current = runLevel(current, { nowUtc: "2026-07-16T00:00:02Z" });
  current = runSymmetrise(current, { nowUtc: "2026-07-16T00:00:03Z" });
  current = runInterpolate(current, {
    targetGridId: "same",
    transform: (working) => working,
    nowUtc: "2026-07-16T00:00:04Z",
  });
  assert.throws(
    () => runPad(current, { hemisphere: "sideways", nowUtc: "2026-07-16T00:00:05Z" }),
    (error) => error?.code === "invalid_hemisphere",
  );
  assert.equal(current.recipe.stage, "interpolated");
  current = runPad(current, { nowUtc: "2026-07-16T00:00:05Z" });
  assert.throws(
    () => runOneMm(current, { nowUtc: "2026-07-16T00:00:06Z" }),
    (error) => error?.code === "invalid_source_length",
  );
  assert.equal(current.recipe.stage, "padded");
});
