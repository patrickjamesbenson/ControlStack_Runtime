import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { buildReportCardContractFromIesText } from "../tools/ies-report/reportCardParserBinding.js";
import { writeIesReportCardExportBundle } from "../tools/ies-report/reportCardExportWriter.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear.ies", import.meta.url);

async function sampleReport() {
  const iesText = await readFile(fixtureUrl, "utf-8");
  const result = buildReportCardContractFromIesText(iesText, { beamAngleDegrees: 79.7 });
  assert.equal(result.ok, true, result.errors.join("\n"));
  return result.report;
}

test("IES report export writer requires explicit confirmation", async () => {
  const report = await sampleReport();
  const result = await writeIesReportCardExportBundle(report, { outputDirectory: tmpdir() });

  assert.equal(result.ok, false);
  assert.equal(result.filesystemWritePerformed, false);
  assert.deepEqual(result.writtenFiles, []);
  assert.match(result.errors.join("\n"), /confirmWrite true is required/);
});

test("IES report export writer writes only report assets when explicitly confirmed", async () => {
  const report = await sampleReport();
  const directory = await mkdtemp(join(tmpdir(), "ies-report-card-"));

  try {
    const result = await writeIesReportCardExportBundle(report, {
      outputDirectory: directory,
      confirmWrite: true,
      basename: "safe-sample"
    });

    assert.equal(result.ok, true, result.errors.join("\n"));
    assert.equal(result.filesystemWritePerformed, true);
    assert.equal(result.iesWrite, false);
    assert.equal(result.runtimeDataWrite, false);
    assert.equal(result.externalFetch, false);
    assert.equal(result.postEndpoint, false);
    assert.equal(result.writtenFiles.length, 5);
    assert.ok(existsSync(join(directory, "safe-sample.report.html")));
    assert.ok(existsSync(join(directory, "safe-sample.polar.svg")));
    assert.ok(existsSync(join(directory, "safe-sample.linear.svg")));
    assert.ok(existsSync(join(directory, "safe-sample.intensities.html")));
    assert.ok(existsSync(join(directory, "safe-sample.ugr.html")));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("IES report export writer rejects missing output directory", async () => {
  const report = await sampleReport();
  const result = await writeIesReportCardExportBundle(report, { confirmWrite: true });

  assert.equal(result.ok, false);
  assert.equal(result.filesystemWritePerformed, false);
  assert.match(result.errors.join("\n"), /outputDirectory is required/);
});
