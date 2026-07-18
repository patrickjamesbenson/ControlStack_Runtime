// Lab IES toolkit — sequencing guards + recipes: refuse out-of-order use; run the safe merge sequence.
import { test } from "node:test";
import assert from "node:assert/strict";
import { mergePhotometry } from "../../packages/lab-kernel/ies-toolkit/iesTransforms.js";
import { isFullAzimuth, mergeBlockers, assertMergeable, mergeOptics } from "../../packages/lab-kernel/ies-toolkit/iesGuards.js";

const q = () => ({ v_angles: [0, 45, 90], h_angles: [0, 45, 90], candela: [[100, 80, 10], [100, 80, 10], [100, 80, 10]], geometry: {} });

test("guard flags un-prepared files", () => {
  const a = q(), b = q();
  assert.equal(isFullAzimuth(a), false);
  assert.ok(mergeBlockers(a, b).length >= 1);
  assert.throws(() => assertMergeable(a, b), /cannot merge/);
});

test("raw merge of mismatched grids throws (danger caught)", () => {
  const a = q(); const b = { v_angles: [0, 90], h_angles: [0], candela: [[1, 2]], geometry: {} };
  assert.throws(() => mergePhotometry(a, b), /do not match/);
});

test("mergeOptics recipe standardises + masks + merges to a valid full grid", () => {
  const merged = mergeOptics(q(), q());
  assert.equal(merged.v_angles.length, 181);
  assert.equal(merged.h_angles.length, 25);
  assert.equal(isFullAzimuth(merged), true);
});
