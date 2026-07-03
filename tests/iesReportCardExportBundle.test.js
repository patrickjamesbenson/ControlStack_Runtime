import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildIesReportCardExportBundle,
  summariseIesReportCardExportBundle
} from "../tools/ies-report/reportCardExportBundle.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear-report-card.json", import.meta.url);

async function sampleReport() {
  return JSON.parse(await readFile(fixtureUrl, "utf-8"));
}

test("IES report export bundle builds in-memory datasheet assets", async () => {
  const report = await sampleReport();
  const bundle = buildIesReportCardExportBundle(report);

  assert.equal(bundle.ok, true);
  assert.equal(bundle.writeToDisk, false);
  assert.equal(bundle.entries.length, 4);
  assert.deepEqual(bundle.entries.map((entry) => entry.mediaType), [
    "text/html",
    "image/svg+xml",
    "image/svg+xml",
    "text/html"
  ]);
  assert.ok(bundle.entries.some((entry) => entry.relativePath.endsWith(".report.html")));
  assert.ok(bundle.entries.some((entry) => entry.relativePath.endsWith(".polar.svg")));
  assert.ok(bundle.entries.some((entry) => entry.relativePath.endsWith(".linear.svg")));
  assert.ok(bundle.entries.some((entry) => entry.relativePath.endsWith(".intensities.html")));
});

test("IES report export bundle keeps filesystem and photometry writes closed", async () => {
  const report = await sampleReport();
  const bundle = buildIesReportCardExportBundle(report);

  assert.equal(bundle.safetyBoundary.previewOnly, true);
  assert.equal(bundle.safetyBoundary.reportRenderOnly, true);
  assert.equal(bundle.safetyBoundary.filesystemWritePerformed, false);
  assert.equal(bundle.safetyBoundary.iesWrite, false);
  assert.equal(bundle.safetyBoundary.runtimeDataWrite, false);
  assert.equal(bundle.safetyBoundary.externalFetch, false);
  assert.equal(bundle.safetyBoundary.postEndpoint, false);
});

test("IES report export bundle content is render-ready", async () => {
  const report = await sampleReport();
  const bundle = buildIesReportCardExportBundle(report, { theme: "screen-dark" });
  const html = bundle.entries.find((entry) => entry.relativePath.endsWith(".report.html"));
  const polar = bundle.entries.find((entry) => entry.relativePath.endsWith(".polar.svg"));
  const linear = bundle.entries.find((entry) => entry.relativePath.endsWith(".linear.svg"));

  assert.match(html.content, /theme-screen-dark/);
  assert.match(html.content, /data-card="details"/);
  assert.match(polar.content, /data-plot="polar"/);
  assert.match(linear.content, /data-plot="linear"/);
});

test("IES report export bundle summary is compact", async () => {
  const report = await sampleReport();
  const summary = summariseIesReportCardExportBundle(report);

  assert.equal(summary.ok, true);
  assert.equal(summary.entryCount, 4);
  assert.equal(summary.writeToDisk, false);
  assert.equal(summary.filesystemWritePerformed, false);
  assert.equal(summary.iesWrite, false);
  assert.equal(summary.runtimeDataWrite, false);
  assert.equal(summary.externalFetch, false);
});

test("IES report export bundle fails closed for invalid report input", () => {
  const bundle = buildIesReportCardExportBundle({});

  assert.equal(bundle.ok, false);
  assert.equal(bundle.writeToDisk, false);
  assert.deepEqual(bundle.entries, []);
});
