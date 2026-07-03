import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  renderIntensityTableHtml,
  summariseIntensityTable
} from "../tools/ies-report/reportCardIntensityTableRenderer.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear-report-card.json", import.meta.url);

async function sampleReport() {
  return JSON.parse(await readFile(fixtureUrl, "utf-8"));
}

test("IES report intensity table renderer emits candela table from report JSON", async () => {
  const report = await sampleReport();
  const html = renderIntensityTableHtml(report);

  assert.match(html, /data-rendered="report-json"/);
  assert.match(html, /class="ies-intensity-table"/);
  assert.match(html, /aria-label="Candela intensity table"/);
  assert.match(html, /<th>V°<\/th>/);
  assert.match(html, /<th>0°<\/th>/);
  assert.match(html, /<th>90°<\/th>/);
  assert.match(html, /1801\.3/);
});

test("IES report intensity table renderer adds compact heatmap bands", async () => {
  const report = await sampleReport();
  const html = renderIntensityTableHtml(report);

  assert.match(html, /data-band="high"/);
  assert.match(html, /data-band="mid"/);
  assert.match(html, /data-band="low"/);
});

test("IES report intensity table summary stays compact", async () => {
  const report = await sampleReport();
  const summary = summariseIntensityTable(report);

  assert.equal(summary.ok, true);
  assert.equal(summary.rowCount, 9);
  assert.equal(summary.columnCount, 4);
  assert.equal(summary.peakCandela, 1803.2);
});

test("IES report intensity table renderer fails closed for invalid input", () => {
  assert.equal(renderIntensityTableHtml({}), "");
  assert.deepEqual(summariseIntensityTable({}), {
    ok: false,
    rowCount: 0,
    columnCount: 0,
    peakCandela: null
  });
});
