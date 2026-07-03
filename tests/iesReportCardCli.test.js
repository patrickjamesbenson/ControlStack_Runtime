import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";
import {
  parseReportCardCliArgs,
  reportCardCliUsage,
  runReportCardCli
} from "../tools/ies-report/renderReportCardCli.js";

const fixturePath = fileURLToPath(new URL("../tools/ies-report/fixtures/sample-linear.ies", import.meta.url));

function memoryIo() {
  let out = "";
  let err = "";
  return {
    stdout: { write: (value) => { out += value; } },
    stderr: { write: (value) => { err += value; } },
    output: () => out,
    error: () => err
  };
}

test("IES report CLI parses required flags", () => {
  const options = parseReportCardCliArgs([
    "node",
    "renderReportCardCli.js",
    "--ies",
    "sample.ies",
    "--out",
    "out-dir",
    "--basename",
    "sample",
    "--theme",
    "screen-dark",
    "--confirm-write"
  ]);

  assert.equal(options.iesPath, "sample.ies");
  assert.equal(options.outputDirectory, "out-dir");
  assert.equal(options.basename, "sample");
  assert.equal(options.theme, "screen-dark");
  assert.equal(options.confirmWrite, true);
});

test("IES report CLI help text describes report-only outputs", () => {
  const usage = reportCardCliUsage();

  assert.match(usage, /\.report\.html/);
  assert.match(usage, /\.polar\.svg/);
  assert.match(usage, /\.linear\.svg/);
  assert.match(usage, /ugr/);
  assert.match(usage, /No IES files are created or modified/);
});

test("IES report CLI refuses missing confirmation", async () => {
  const directory = await mkdtemp(join(tmpdir(), "ies-report-cli-"));
  const io = memoryIo();

  try {
    const code = await runReportCardCli([
      "node",
      "renderReportCardCli.js",
      "--ies",
      fixturePath,
      "--out",
      directory,
      "--basename",
      "cli-sample"
    ], io);

    assert.equal(code, 4);
    assert.match(io.error(), /confirmWrite true is required/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("IES report CLI writes report assets when explicitly confirmed", async () => {
  const directory = await mkdtemp(join(tmpdir(), "ies-report-cli-"));
  const io = memoryIo();

  try {
    const code = await runReportCardCli([
      "node",
      "renderReportCardCli.js",
      "--ies",
      fixturePath,
      "--out",
      directory,
      "--basename",
      "cli-sample",
      "--confirm-write"
    ], io);

    assert.equal(code, 0, io.error());
    assert.match(io.output(), /export complete: 5 files/);
    assert.ok(existsSync(join(directory, "cli-sample.report.html")));
    assert.ok(existsSync(join(directory, "cli-sample.polar.svg")));
    assert.ok(existsSync(join(directory, "cli-sample.linear.svg")));
    assert.ok(existsSync(join(directory, "cli-sample.intensities.html")));
    assert.ok(existsSync(join(directory, "cli-sample.ugr.html")));
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
