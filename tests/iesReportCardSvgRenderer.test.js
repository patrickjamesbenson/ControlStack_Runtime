import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  renderLinearPlotSvg,
  renderPolarPlotSvg
} from "../tools/ies-report/reportCardSvgRenderer.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear-report-card.json", import.meta.url);

async function sampleReport() {
  return JSON.parse(await readFile(fixtureUrl, "utf-8"));
}

test("IES report SVG renderer emits linear plot from report JSON", async () => {
  const report = await sampleReport();
  const svg = renderLinearPlotSvg(report);

  assert.match(svg, /<svg class="ies-plot-svg" data-plot="linear"/);
  assert.match(svg, /viewBox="0 0 360 260"/);
  assert.match(svg, /class="ies-beam-fill"/);
  assert.match(svg, /class="ies-curve-red"/);
  assert.match(svg, /class="ies-curve-blue"/);
  assert.match(svg, /candela/);
});

test("IES report SVG renderer emits polar plot from report JSON", async () => {
  const report = await sampleReport();
  const svg = renderPolarPlotSvg(report);

  assert.match(svg, /<svg class="ies-plot-svg" data-plot="polar"/);
  assert.match(svg, /viewBox="0 0 360 260"/);
  assert.match(svg, /class="ies-grid-line"/);
  assert.match(svg, /class="ies-axis-line"/);
  assert.match(svg, /class="ies-beam-fill"/);
  assert.match(svg, /class="ies-curve-red"/);
  assert.match(svg, /class="ies-curve-blue"/);
});

test("IES report SVG renderer respects explicit export dimensions", async () => {
  const report = await sampleReport();
  const svg = renderLinearPlotSvg(report, { width: 720, height: 520 });

  assert.match(svg, /viewBox="0 0 720 520"/);
  assert.match(svg, /width="648"/);
  assert.match(svg, /height="472"/);
});

test("IES report SVG renderer fails closed for invalid report input", () => {
  assert.equal(renderLinearPlotSvg({}), "");
  assert.equal(renderPolarPlotSvg({}), "");
});
