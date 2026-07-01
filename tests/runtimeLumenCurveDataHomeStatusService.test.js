import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { win32 as pathWin32 } from "node:path";

import {
  buildRuntimeLumenCurveDataHomeStatus,
  buildRuntimeLumenCurveManifest,
  buildRuntimeLumenCurveManifestFromHome,
  RUNTIME_LUMEN_CURVE_DATA_HOME,
  RUNTIME_LUMEN_CURVE_MANIFEST_PATH,
  RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_ID,
  RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
} from "../packages/workspace-kernel/runtimeLumenCurveDataHomeStatusService.js";

function fakeStat({ isFile = false, isDirectory = false, size = 123, mtime = new Date("2026-07-01T00:00:00.000Z") } = {}) {
  return {
    isFile: () => isFile,
    isDirectory: () => isDirectory,
    size,
    mtime,
  };
}

function fakeDirent(name, file = true) {
  return {
    name,
    isFile: () => file,
  };
}

function fakeFs({ entries = [], files = new Map(), manifest = null, writes = [] } = {}) {
  return {
    async stat(pathValue) {
      if (pathValue === RUNTIME_LUMEN_CURVE_DATA_HOME) return fakeStat({ isDirectory: true });
      if (pathValue === RUNTIME_LUMEN_CURVE_MANIFEST_PATH && manifest) return fakeStat({ isFile: true, size: JSON.stringify(manifest).length });
      if (files.has(pathValue)) return fakeStat({ isFile: true, size: files.get(pathValue).length });
      const error = new Error("missing");
      error.code = "ENOENT";
      throw error;
    },
    async readdir() {
      return entries;
    },
    async readFile(pathValue) {
      if (pathValue === RUNTIME_LUMEN_CURVE_MANIFEST_PATH && manifest) return JSON.stringify(manifest);
      if (files.has(pathValue)) return files.get(pathValue);
      const error = new Error("missing");
      error.code = "ENOENT";
      throw error;
    },
    async writeFile() {
      writes.push("writeFile");
    },
    async mkdir() {
      writes.push("mkdir");
    },
  };
}

const checksumA = "a".repeat(64);
const checksumB = "b".repeat(64);

function safeManifest() {
  return buildRuntimeLumenCurveManifest({
    generatedAt: new Date("2026-07-01T01:00:00.000Z"),
    files: [
      {
        filename: "curve-a.csv",
        relative_path: "lumen_curves/curve-a.csv",
        size_bytes: 24,
        sha256: checksumA,
      },
      {
        filename: "curve-b.csv",
        relative_path: "lumen_curves/curve-b.csv",
        size_bytes: 48,
        sha256: checksumB,
      },
    ],
  });
}

test("runtime lumen curve status reports counts and checksums without raw curve payloads", async () => {
  const rawCurvePayload = "optic,board,lumen\nRAW-CURVE-ROW-SHOULD-NOT-SERIALISE";
  const manifest = safeManifest();

  const status = await buildRuntimeLumenCurveDataHomeStatus({
    fsApi: fakeFs({
      entries: [fakeDirent("curve-b.csv"), fakeDirent("readme.md"), fakeDirent("curve-a.csv"), fakeDirent("nested", false)],
      manifest,
      files: new Map([[pathWin32.join(RUNTIME_LUMEN_CURVE_DATA_HOME, "curve-a.csv"), rawCurvePayload]]),
    }),
  });

  assert.equal(status.runtime_curve_home.exists, true);
  assert.equal(status.runtime_curve_home.readable, true);
  assert.equal(status.runtime_curve_home.curveFileCount, 2);
  assert.equal(status.runtime_curve_home.localPathReturned, false);
  assert.equal(status.manifest.exists, true);
  assert.equal(status.manifest.valid, true);
  assert.equal(status.manifest.fileCount, 2);
  assert.equal(status.manifest.checksumCoverageCount, 2);
  assert.equal(status.manifest.rawCurveRowsIncluded, false);
  assert.equal(status.manifest.rawCurvePayloadsExposed, false);
  assert.equal(status.safetyFlags.rawCurvePayloadsExposed, false);
  assert.equal(status.safetyFlags.activeSnapshotMutated, false);
  assert.equal(status.safetyFlags.boardDataMakerImported, false);
  assert.equal(status.safetyFlags.donorFilesMutated, false);

  const serialised = JSON.stringify(status);
  assert.equal(serialised.includes("RAW-CURVE-ROW-SHOULD-NOT-SERIALISE"), false);
  assert.equal(serialised.includes("optic,board,lumen"), false);
  assert.equal(serialised.includes("C:\\ControlStack_RuntimeData"), false);
});

test("runtime lumen curve manifest builder creates checksum-only entries", async () => {
  const files = new Map([
    [pathWin32.join(RUNTIME_LUMEN_CURVE_DATA_HOME, "curve-a.csv"), "first,raw,curve,row"],
    [pathWin32.join(RUNTIME_LUMEN_CURVE_DATA_HOME, "curve-b.csv"), Buffer.from("second,raw,curve,row")],
  ]);

  const result = await buildRuntimeLumenCurveManifestFromHome({
    fsApi: fakeFs({
      entries: [fakeDirent("curve-b.csv"), fakeDirent("notes.txt"), fakeDirent("curve-a.csv")],
      files,
    }),
    generatedAt: new Date("2026-07-01T02:00:00.000Z"),
  });

  assert.equal(result.ok, true);
  assert.equal(result.manifest.schema_id, RUNTIME_LUMEN_CURVE_MANIFEST_SCHEMA_ID);
  assert.equal(result.manifest.file_count, 2);
  assert.equal(result.checksumCoverageCount, 2);
  assert.equal(result.manifest.raw_curve_rows_included, false);
  assert.equal(result.manifest.active_snapshot_mutated, false);
  assert.equal(result.manifest.board_data_maker_imported, false);

  for (const file of result.manifest.files) {
    assert.equal(file.source_classification, RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION);
    assert.equal(file.raw_payload_in_manifest, false);
    assert.match(file.sha256, /^[a-f0-9]{64}$/);
    assert.equal(file.relative_path.startsWith("lumen_curves/"), true);
  }

  const serialised = JSON.stringify(result.manifest);
  assert.equal(serialised.includes("first,raw,curve,row"), false);
  assert.equal(serialised.includes("second,raw,curve,row"), false);
});

test("runtime lumen curve status fails closed when home or manifest are absent", async () => {
  const missingFs = {
    async stat() {
      const error = new Error("missing");
      error.code = "ENOENT";
      throw error;
    },
    async readdir() {
      throw new Error("should not list missing home");
    },
    async readFile() {
      throw new Error("should not read missing manifest");
    },
  };

  const status = await buildRuntimeLumenCurveDataHomeStatus({ fsApi: missingFs });

  assert.equal(status.runtime_curve_home.exists, false);
  assert.equal(status.runtime_curve_home.curveFileCount, 0);
  assert.equal(status.manifest.exists, false);
  assert.equal(status.manifest.fileCount, 0);
  assert.equal(status.manifest.checksumCoverageCount, 0);
  assert.equal(status.safetyFlags.rawCurvePayloadsExposed, false);
  assert.equal(status.safetyFlags.runtimeDataMutationEnabled, false);
});

test("runtime lumen curve helper does not import Board Data Maker or add routes", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/runtimeLumenCurveDataHomeStatusService.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(sourceText.includes("from \"../modules/board-data"), false);
  assert.equal(sourceText.includes("from \"./boardData"), false);
  assert.equal(sourceText.includes("BoardDataMaker"), false);
  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(serverText.includes("runtimeLumenCurveDataHomeStatusService"), false);
  assert.equal(serverText.includes("lumen_curves_manifest"), false);
  assert.equal(serverText.includes("/api/lumen"), false);
});
