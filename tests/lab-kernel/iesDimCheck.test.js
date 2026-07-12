import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDimensions, fixDimensionTranspose } from "../../packages/lab-kernel/ies-toolkit/iesDimCheck.js";
test("flags a wider-than-long file as likely transposed", () => {
  const m = { photometry:{ geometry:{ G7:1.2, G8:0.1, G9:0.05 } } };  // width 1.2 > length 0.1
  const c = checkDimensions(m);
  assert.equal(c.transposedLikely, true);
  assert.equal(c.widthM, 1.2); assert.equal(c.lengthM, 0.1);
});
test("reposition swaps G7<->G8 and leaves height + candela untouched", () => {
  const m = { photometry:{ geometry:{ G7:1.2, G8:0.1, G9:0.05 }, candela:[[1,2,3]] } };
  const r = fixDimensionTranspose(m);
  assert.equal(r.model.photometry.geometry.G7, 0.1);   // now width = 0.1
  assert.equal(r.model.photometry.geometry.G8, 1.2);   // now length = 1.2
  assert.equal(r.model.photometry.geometry.G9, 0.05);  // height unchanged
  assert.deepEqual(r.model.photometry.candela, [[1,2,3]]);  // candela unchanged
  const c2 = checkDimensions(r.model);
  assert.equal(c2.transposedLikely, false);            // now correctly oriented
});
test("a correctly oriented file is not flagged", () => {
  const m = { photometry:{ geometry:{ G7:0.1, G8:1.2, G9:0.05 } } };
  assert.equal(checkDimensions(m).transposedLikely, false);
});
