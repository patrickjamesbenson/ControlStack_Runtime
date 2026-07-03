import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  createCandelaLookup,
  inferHorizontalSymmetryMode,
  resolveHorizontalAngle
} from "../tools/ies-report/reportCardAngularLookup.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear-report-card.json", import.meta.url);

async function sampleReport() {
  return JSON.parse(await readFile(fixtureUrl, "utf-8"));
}

test("IES report angular lookup infers full-cardinal source coverage", async () => {
  const report = await sampleReport();

  assert.equal(inferHorizontalSymmetryMode(report.photometry.horizontalAngles), "full-cardinal");
  assert.equal(resolveHorizontalAngle(report.photometry.horizontalAngles, 270).sourceAngle, 270);
});

test("IES report angular lookup resolves quadrant symmetry without modifying source", () => {
  const horizontalAngles = [0, 90];

  assert.equal(inferHorizontalSymmetryMode(horizontalAngles), "quadrant-mirror");
  assert.equal(resolveHorizontalAngle(horizontalAngles, 135).sourceAngle, 0);
  assert.equal(resolveHorizontalAngle(horizontalAngles, 225).sourceAngle, 0);
  assert.equal(resolveHorizontalAngle(horizontalAngles, 315).sourceAngle, 0);
});

test("IES report angular lookup returns candela with source trace", async () => {
  const report = await sampleReport();
  const lookup = createCandelaLookup(report);
  const result = lookup.lookup(90, 10);

  assert.equal(lookup.ok, true);
  assert.equal(result.candela, 1702.6);
  assert.equal(result.horizontal.sourceAngle, 90);
  assert.equal(result.vertical.sourceAngle, 10);
  assert.equal(result.source, "symmetry-aware-source-lookup");
});

test("IES report angular lookup fails closed for invalid report input", () => {
  const lookup = createCandelaLookup({});

  assert.equal(lookup.ok, false);
  assert.equal(lookup.symmetryMode, "invalid");
  assert.equal(lookup.lookup(0, 0), null);
});
