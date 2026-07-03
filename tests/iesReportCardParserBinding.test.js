import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { buildIesReportCardExportBundle } from "../tools/ies-report/reportCardExportBundle.js";
import { parseLm63IesText } from "../tools/ies-report/reportCardIesParser.js";
import { buildReportCardContractFromIesText } from "../tools/ies-report/reportCardParserBinding.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear.ies", import.meta.url);

async function sampleIes() {
  return readFile(fixtureUrl, "utf-8");
}

test("LM-63 report parser reads the safe sample fixture", async () => {
  const parsed = parseLm63IesText(await sampleIes());

  assert.equal(parsed.ok, true, parsed.errors.join("\n"));
  assert.equal(parsed.keywords.MANUFAC, "NOVON Lighting");
  assert.equal(parsed.header.verticalCount, 9);
  assert.equal(parsed.header.horizontalCount, 4);
  assert.deepEqual(parsed.photometry.verticalAngles, [0, 5, 10, 15, 20, 25, 30, 35, 40]);
  assert.deepEqual(parsed.photometry.horizontalAngles, [0, 90, 180, 270]);
  assert.equal(parsed.photometry.candelaMatrix.length, 9);
  assert.equal(parsed.photometry.candelaMatrix[0].length, 4);
  assert.equal(parsed.metrics.lumens, 2943);
  assert.equal(parsed.metrics.watts, 30.8);
  assert.equal(parsed.metrics.peakCandela, 1801.3);
});

test("LM-63 parser binding creates a valid report-card contract", async () => {
  const result = buildReportCardContractFromIesText(await sampleIes(), {
    beamAngleDegrees: 79.7,
    physicalHeightMm: 65
  });

  assert.equal(result.ok, true, result.errors.join("\n"));
  assert.equal(result.report.defaultTheme, "datasheet-light");
  assert.equal(result.report.product.manufacturer, "NOVON Lighting");
  assert.equal(result.report.product.catalogueCode, "DNX60-D-940-C30-WM");
  assert.equal(result.report.metrics.lumens, 2943);
  assert.equal(result.report.metrics.peakCandela, 1801.3);
  assert.equal(result.report.dimensions.physical.widthMm, 56);
  assert.equal(result.report.dimensions.physical.lengthMm, 1144);
  assert.equal(result.report.dimensions.physical.heightMm, 65);
  assert.deepEqual(result.report.displayCards, ["details", "polar-plot", "linear-plot", "intensities"]);
});

test("LM-63 parser binding output feeds the export bundle", async () => {
  const result = buildReportCardContractFromIesText(await sampleIes(), { beamAngleDegrees: 79.7 });
  const bundle = buildIesReportCardExportBundle(result.report);

  assert.equal(bundle.ok, true);
  assert.equal(bundle.entries.length, 4);
  assert.ok(bundle.entries.some((entry) => entry.relativePath.endsWith(".report.html")));
  assert.ok(bundle.entries.some((entry) => entry.content.includes("data-plot=\"polar\"")));
  assert.ok(bundle.entries.some((entry) => entry.content.includes("data-plot=\"linear\"")));
});

test("LM-63 parser binding fails closed for unsupported tilt", () => {
  const result = buildReportCardContractFromIesText("IESNA:LM-63-2002\nTILT=INCLUDE\n");

  assert.equal(result.ok, false);
  assert.equal(result.report, null);
  assert.match(result.errors.join("\n"), /TILT/);
});
