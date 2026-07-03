import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  buildReferenceUgrTable,
  renderReferenceUgrTableHtml,
  summariseReferenceUgrTable,
  UGR_REFLECTANCE_SETS,
  UGR_ROOM_INDEXES,
  UGR_VIEW_DIRECTIONS
} from "../tools/ies-report/reportCardUgrTableRenderer.js";

const fixtureUrl = new URL("../tools/ies-report/fixtures/sample-linear-report-card.json", import.meta.url);

async function sampleReport() {
  return JSON.parse(await readFile(fixtureUrl, "utf-8"));
}

test("IES report UGR table builds reflectance and direction rows", async () => {
  const report = await sampleReport();
  const table = buildReferenceUgrTable(report);

  assert.equal(table.ok, true, table.errors.join("\n"));
  assert.equal(table.referenceEstimateOnly, true);
  assert.equal(table.certificationClaim, false);
  assert.equal(table.roomIndexes.length, UGR_ROOM_INDEXES.length);
  assert.equal(table.rows.length, UGR_REFLECTANCE_SETS.length * UGR_VIEW_DIRECTIONS.length);
  assert.equal(table.rows[0].values.length, UGR_ROOM_INDEXES.length);
  assert.equal(table.symmetryMode, "full-cardinal");
});

test("IES report UGR table renderer emits a compact table card fragment", async () => {
  const report = await sampleReport();
  const html = renderReferenceUgrTableHtml(report);

  assert.match(html, /data-rendered="reference-ugr-estimate"/);
  assert.match(html, /class="ies-ugr-table"/);
  assert.match(html, /Reference UGR table/);
  assert.match(html, /70\/50\/20/);
  assert.match(html, /Lengthwise/);
  assert.match(html, /Crosswise/);
  assert.match(html, /Not a certified UGR claim/);
});

test("IES report UGR summary remains safe and compact", async () => {
  const report = await sampleReport();
  const summary = summariseReferenceUgrTable(report);

  assert.equal(summary.ok, true);
  assert.equal(summary.method, "reference-estimate-table");
  assert.equal(summary.referenceEstimateOnly, true);
  assert.equal(summary.certificationClaim, false);
  assert.equal(summary.rowCount, 10);
  assert.equal(summary.columnCount, 9);
  assert.equal(summary.symmetryMode, "full-cardinal");
});

test("IES report UGR renderer fails closed for invalid input", () => {
  assert.equal(renderReferenceUgrTableHtml({}), "");
  assert.equal(summariseReferenceUgrTable({}).ok, false);
});
