import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  renderIesReportCardHtml,
  summariseRenderedReportHtml
} from "../tools/ies-report/reportCardHtmlRenderer.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear-report-card.json", import.meta.url);

async function sampleReport() {
  return JSON.parse(await readFile(fixtureUrl, "utf-8"));
}

test("IES report HTML renderer composes the full report card from JSON", async () => {
  const report = await sampleReport();
  const html = renderIesReportCardHtml(report);

  assert.match(html, /<!doctype html>/);
  assert.match(html, /CoreStack photometric report/);
  assert.match(html, /DYNAMIX 60 DIRECT CRI90 4K COMFORT 30 WM/);
  assert.match(html, /data-card="details"/);
  assert.match(html, /data-card="polar-plot"/);
  assert.match(html, /data-card="linear-plot"/);
  assert.match(html, /data-card="intensities"/);
  assert.match(html, /data-plot="polar"/);
  assert.match(html, /data-plot="linear"/);
  assert.match(html, /data-rendered="report-json"/);
});

test("IES report HTML renderer defaults to datasheet light output", async () => {
  const report = await sampleReport();
  const html = renderIesReportCardHtml(report);

  assert.match(html, /<body class="theme-datasheet-light"/);
  assert.match(html, /photometric-report-card\.css/);
  assert.match(html, /Preview only/);
  assert.match(html, /Report render only/);
  assert.match(html, /No IES generation/);
  assert.match(html, /No external fetch/);
});

test("IES report HTML renderer allows screen dark and transparent theme classes", async () => {
  const report = await sampleReport();

  assert.match(renderIesReportCardHtml(report, { theme: "screen-dark" }), /<body class="theme-screen-dark"/);
  assert.match(renderIesReportCardHtml(report, { theme: "asset-transparent" }), /<body class="theme-asset-transparent"/);
});

test("IES report HTML renderer keeps output route-free and script-free", async () => {
  const report = await sampleReport();
  const html = renderIesReportCardHtml(report);

  assert.doesNotMatch(html, /<script\b/i);
  assert.doesNotMatch(html, /<form\b/i);
  assert.doesNotMatch(html, /method="post"/i);
  assert.doesNotMatch(html, /fetch\(/i);
  assert.doesNotMatch(html, /photometriceditor\.com/i);
});

test("IES report HTML renderer summary is compact", async () => {
  const report = await sampleReport();
  const summary = summariseRenderedReportHtml(report);

  assert.equal(summary.ok, true);
  assert.equal(summary.themeClass, "theme-datasheet-light");
  assert.equal(summary.includesDetails, true);
  assert.equal(summary.includesPolar, true);
  assert.equal(summary.includesLinear, true);
  assert.equal(summary.includesIntensities, true);
  assert.ok(summary.byteLength > 1000);
});

test("IES report HTML renderer fails closed for invalid input", () => {
  assert.equal(renderIesReportCardHtml({}), "");
  assert.equal(summariseRenderedReportHtml({}).ok, false);
});
