import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const docsUrl = new URL("../docs/ies-report-card-generator.md", import.meta.url);

test("IES report card generator docs describe command, outputs, and safety boundary", async () => {
  const source = await readFile(docsUrl, "utf-8");

  assert.match(source, /renderReportCardCli\.js/);
  assert.match(source, /--confirm-write/);
  assert.match(source, /\.report\.html/);
  assert.match(source, /\.polar\.svg/);
  assert.match(source, /\.linear\.svg/);
  assert.match(source, /\.intensities\.html/);
  assert.match(source, /No IES creation/);
  assert.match(source, /No RuntimeData writes/);
  assert.match(source, /No donor Engine call/);
  assert.match(source, /No external website fetch/);
  assert.match(source, /No PhotometricEditor dependency/);
});
