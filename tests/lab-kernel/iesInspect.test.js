// Lab IES toolkit — viewer acceptance: describeIes returns the three sections + summary.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parseIes } from "../../packages/lab-kernel/ies-toolkit/iesParse.js";
import { describeIes, formatDescription } from "../../packages/lab-kernel/ies-toolkit/iesInspect.js";

const here = dirname(fileURLToPath(import.meta.url));
const FIX = join(here, "fixtures", "ies");

test("describeIes produces three sections + summary", () => {
  const d = describeIes(parseIes(readFileSync(join(FIX, "constant_100cd_full_azimuth.ies"), "utf-8")));
  assert.ok(Math.abs(d.summary.totalLumens - 4 * Math.PI * 100) < 0.5);
  assert.equal(d.headerValues.length, 13);
  assert.ok(d.metadata.some((r) => r.key.toUpperCase() === "TEST"));
  assert.equal(d.candelaTable.vAngleCount, 181);
  const txt = formatDescription(d);
  assert.ok(txt.includes("SUMMARY") && txt.includes("METADATA") && txt.includes("HEADER VALUES") && txt.includes("CANDELA TABLE"));
});
