// Lab IES toolkit — metrics acceptance.
// Constant 100 cd over the sphere has an exact answer: flux = 4*pi*100, regardless of azimuth storage.
// Mirrors donor tests/test_photometry_golden_ies.py::test_golden_constant_intensity_flux.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseIes } from "../../packages/lab-kernel/ies-toolkit/iesParse.js";
import { luminousFlux, peakIntensity, beamAngleFwhm } from "../../packages/lab-kernel/ies-toolkit/iesMetrics.js";

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, "fixtures", "ies");
const EXPECT = 4 * Math.PI * 100;

test("flux full azimuth ~= 4*pi*100 with symmetry x1", () => {
  const m = parseIes(readFileSync(join(FIX, "constant_100cd_full_azimuth.ies"), "utf-8"));
  const f = luminousFlux(m);
  assert.equal(f.symmetryFactor, 1);
  assert.ok(Math.abs(f.lumens - EXPECT) < 0.5, `flux ${f.lumens} vs ${EXPECT}`);
  assert.equal(peakIntensity(m).maxCandela, 100);
  assert.ok(beamAngleFwhm(m).fwhmDeg != null);
});

test("flux half azimuth ~= 4*pi*100 with symmetry x2", () => {
  const m = parseIes(readFileSync(join(FIX, "constant_100cd_half_azimuth.ies"), "utf-8"));
  const f = luminousFlux(m);
  assert.equal(f.symmetryFactor, 2);
  assert.ok(Math.abs(f.lumens - EXPECT) < 0.5, `flux ${f.lumens} vs ${EXPECT}`);
});
