// Lab IES toolkit — rotate (azimuth shift). Requires full 0-360; rotate(X) shifts features by -X.
import { test } from "node:test";
import assert from "node:assert/strict";
import { rotate } from "../../packages/lab-kernel/ies-toolkit/iesRotate.js";

test("rotate refuses a partial (non 0-360) file", () => {
  const q = { v_angles: [0, 45, 90], h_angles: [0, 45, 90], candela: [[1], [1], [1]], geometry: {} };
  assert.throws(() => rotate(q, 90), /full 0-360/);
});

test("rotate(90) moves a feature from azimuth 0 to 270 (shift by -X)", () => {
  const H = [0, 90, 180, 270, 360];
  const full = { v_angles: [0], h_angles: H, candela: H.map((h) => [(h % 360 === 0) ? 100 : 0]), geometry: {} };
  const r = rotate(full, 90);
  const at = (deg) => r.candela[r.h_angles.indexOf(deg)][0];
  assert.ok(Math.abs(at(270) - 100) < 0.5, "feature should be at 270, got " + at(270));
  assert.ok(Math.abs(at(0) - 0) < 0.5, "azimuth 0 should be empty, got " + at(0));
});

test("rotate(0) is a no-op on the distribution", () => {
  const H = [0, 90, 180, 270, 360];
  const full = { v_angles: [0], h_angles: H, candela: H.map((h) => [(h % 360 === 0) ? 100 : 0]), geometry: {} };
  const r = rotate(full, 0);
  assert.ok(Math.abs(r.candela[r.h_angles.indexOf(0)][0] - 100) < 0.5);
});
