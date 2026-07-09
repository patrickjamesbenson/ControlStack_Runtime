// Lab IES toolkit — tool #1 acceptance: parse -> write -> parse round-trip is stable.
// Mirrors donor tests/test_photometry_golden_ies.py::test_golden_roundtrip_parse_build_parse_is_stable.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseIes } from "../../packages/lab-kernel/ies-toolkit/iesParse.js";
import { writeIes } from "../../packages/lab-kernel/ies-toolkit/iesWrite.js";

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, "fixtures", "ies");

for (const fname of ["constant_100cd_full_azimuth.ies", "constant_100cd_half_azimuth.ies"]) {
  test(`round-trip parse->write->parse is stable: ${fname}`, () => {
    const raw = readFileSync(join(FIX, fname), "utf-8");
    const w1 = parseIes(raw);
    const text = writeIes(w1);
    const w2 = parseIes(text);
    assert.deepEqual(w1.photometry.v_angles, w2.photometry.v_angles);
    assert.deepEqual(w1.photometry.h_angles, w2.photometry.h_angles);
    assert.deepEqual(w1.photometry.candela, w2.photometry.candela);
    assert.equal(w1.photometry.geometry.G2, 1.0);
    assert.equal(w2.photometry.geometry.G2, 1.0);
  });
}
