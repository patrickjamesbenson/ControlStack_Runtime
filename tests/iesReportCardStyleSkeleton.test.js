import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const sampleUrl = new URL("../tools/ies-report/templates/photometric-report-card-sample.html", import.meta.url);
const cssUrl = new URL("../tools/ies-report/templates/photometric-report-card.css", import.meta.url);

async function sampleHtml() {
  return readFile(sampleUrl, "utf-8");
}

async function reportCss() {
  return readFile(cssUrl, "utf-8");
}

test("IES report card skeleton exposes only preview/report-render safety posture", async () => {
  const source = await sampleHtml();

  assert.match(source, /Preview only/);
  assert.match(source, /Report render only/);
  assert.match(source, /No IES generation/);
  assert.match(source, /No external fetch/);
  assert.doesNotMatch(source, /<form\b/i);
  assert.doesNotMatch(source, /method=["']post["']/i);
  assert.doesNotMatch(source, /fetch\(/i);
  assert.doesNotMatch(source, /photometriceditor\.com/i);
});

test("IES report card skeleton includes the first linear-luminaire cards", async () => {
  const source = await sampleHtml();

  assert.match(source, /data-card="details"/);
  assert.match(source, />Details</);
  assert.match(source, /data-card="polar-plot"/);
  assert.match(source, />Polar plot</);
  assert.match(source, /data-card="linear-plot"/);
  assert.match(source, />Linear plot</);
  assert.match(source, /data-card="intensities"/);
  assert.match(source, />Intensities \(candela\)</);
  assert.match(source, /DYNAMIX 60 DIRECT CRI90 4K COMFORT 30 WM/);
});

test("IES report card skeleton keeps plot styling as owned inline SVG placeholders", async () => {
  const source = await sampleHtml();

  assert.match(source, /<svg class="ies-plot-svg" viewBox="0 0 360 260"/);
  assert.match(source, /class="ies-beam-fill"/);
  assert.match(source, /class="ies-curve-red"/);
  assert.match(source, /class="ies-curve-blue"/);
  assert.match(source, /C0\/C180/);
  assert.match(source, /C90\/C270/);
  assert.doesNotMatch(source, /<script\b/i);
  assert.doesNotMatch(source, /https?:\/\//i);
});

test("IES report CSS defines screen, datasheet, and transparent theme tokens", async () => {
  const source = await reportCss();

  assert.match(source, /theme-screen-dark/);
  assert.match(source, /theme-datasheet-light/);
  assert.match(source, /theme-asset-transparent/);
  assert.match(source, /--ies-report-page-bg/);
  assert.match(source, /--ies-report-card-bg/);
  assert.match(source, /--ies-report-grid/);
  assert.match(source, /--ies-report-plot-red/);
  assert.match(source, /--ies-report-plot-blue/);
  assert.match(source, /--ies-report-beam-fill/);
  assert.match(source, /--ies-report-datasheet-plot-width-mm: 90mm/);
  assert.match(source, /--ies-report-datasheet-row-width-mm: 180mm/);
});
