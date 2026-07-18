// Lab IES toolkit — UGR position-index + background-luminance acceptance.
// Vectors supplied by the CIE 117 reference relay: the two-angle Guth position index and Lb = E_ind/π.
import { test } from "node:test";
import assert from "node:assert/strict";
import { guthPositionIndex, backgroundLuminanceFromIndirect } from "../../packages/lab-kernel/ies-toolkit/iesUgr.js";

const near = (a, b, rel = 1e-5) => assert.ok(Math.abs(a - b) <= Math.max(1e-4, Math.abs(b) * rel), `${a} vs ${b}`);

test("Guth position index — CIE 117 reference vectors", () => {
  near(guthPositionIndex(0, 0), 1.0);
  near(guthPositionIndex(90, 0), 1.0);          // on the line of sight → 1 regardless of alpha
  near(guthPositionIndex(0, 60), 16.359357);
  near(guthPositionIndex(45, 60), 9.232739);
  near(guthPositionIndex(90, 60), 3.142541);
  near(guthPositionIndex(0, 90), 116.652567);   // directly overhead for horizontal gaze
  near(guthPositionIndex(90, 90), 9.814156);    // lateral horizon
  near(guthPositionIndex(90, 85), 7.907489);    // near-horizon lateral source
});

test("background luminance from indirect illuminance = E_ind/π", () => {
  near(backgroundLuminanceFromIndirect(100), 100 / Math.PI);  // 31.83099
});
