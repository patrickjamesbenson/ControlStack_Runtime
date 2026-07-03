import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { validateIesReportCardContract } from "../tools/ies-report/reportCardContract.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear-report-card.json", import.meta.url);

test("IES report card data fixture validates", async () => {
  const report = JSON.parse(await readFile(fixtureUrl, "utf-8"));
  const validation = validateIesReportCardContract(report);
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  assert.equal(report.defaultTheme, "datasheet-light");
  assert.deepEqual(report.displayCards, ["details", "polar-plot", "linear-plot", "intensities"]);
});
