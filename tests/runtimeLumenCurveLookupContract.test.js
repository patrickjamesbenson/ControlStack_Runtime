import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { win32 as pathWin32 } from "node:path";

import {
  buildRuntimeLumenCurveManifest,
  RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
} from "../packages/workspace-kernel/runtimeLumenCurveDataHomeStatusService.js";
import {
  buildRuntimeLumenCurveLookupContractStatus,
  normaliseRuntimeLumenCurveFilename,
  resolveRuntimeLumenCurveLookup,
  validateRuntimeLumenCurveLookupManifest,
} from "../packages/workspace-kernel/runtimeLumenCurveLookupContract.js";

function sha256(value) {
  return createHash("sha256").update(Buffer.from(String(value))).digest("hex");
}

function curveName(index, { chip = "AD", cct = "830", pitch = "8p8", length = "140" } = {}) {
  const arch = 128000 + index;
  return `${chip}_${cct}_${pitch}_${length}_${arch}__PN_${arch}-${cct}${chip}.csv`;
}

async function makeRuntimeCurveFixture(count = 2) {
  const tempRoot = await mkdtemp(pathWin32.join(tmpdir(), "cs-runtime-curves-"));
  const curveHome = pathWin32.join(tempRoot, "authority-reference", "lumen_curves");
  const manifestPath = pathWin32.join(tempRoot, "authority-reference", "lumen_curves_manifest.json");
  await mkdir(curveHome, { recursive: true });

  const files = [];
  for (let index = 0; index < count; index += 1) {
    const filename = curveName(index);
    const payload = `# part_number: ${128000 + index}-830AD\nmA,c1_lm_per_m_25C,c1_lm_per_m_65C\n3,RAW-CURVE-ROW-${index},0\n`;
    await writeFile(pathWin32.join(curveHome, filename), payload, "utf-8");
    files.push({
      filename,
      relative_path: `lumen_curves/${filename}`,
      size_bytes: Buffer.byteLength(payload),
      sha256: sha256(payload),
      source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
      raw_payload_in_manifest: false,
    });
  }

  const manifest = buildRuntimeLumenCurveManifest({
    generatedAt: new Date("2026-07-01T03:00:00.000Z"),
    files,
  });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  return { tempRoot, curveHome, manifestPath, manifest, files };
}

test("runtime curve lookup contract validates a 201-style checksum manifest from fixture data", async () => {
  const fixture = await makeRuntimeCurveFixture(201);
  try {
    const status = await buildRuntimeLumenCurveLookupContractStatus({
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(status.ok, true);
    assert.equal(status.runtime_curve_home.readable, true);
    assert.equal(status.runtime_curve_home.curveFileCount, 201);
    assert.equal(status.runtime_curve_home.localPathReturned, false);
    assert.equal(status.manifest.valid, true);
    assert.equal(status.manifest.fileCount, 201);
    assert.equal(status.manifest.declaredFileCount, 201);
    assert.equal(status.manifest.checksumCoverageCount, 201);
    assert.equal(status.manifest.rawCurveRowsIncluded, false);
    assert.equal(status.manifest.raw_payload_returned, false);
    assert.equal(status.manifest.raw_curve_rows_returned, false);
    assert.equal(status.safetyFlags.runtimeDataMutated, false);
    assert.equal(status.safetyFlags.boardDataMakerImported, false);
    assert.equal(status.safetyFlags.donorEngineInvoked, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve lookup returns safe metadata only and never raw CSV rows", async () => {
  const fixture = await makeRuntimeCurveFixture(2);
  try {
    const result = await resolveRuntimeLumenCurveLookup({
      candidate: { filename: fixture.files[0].filename },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, true);
    assert.equal(result.lookup_method, "exact-filename");
    assert.deepEqual(Object.keys(result.curve).sort(), [
      "filename",
      "raw_curve_rows_returned",
      "raw_payload_returned",
      "sha256",
      "size_bytes",
      "source_classification",
    ]);
    assert.equal(result.curve.filename, fixture.files[0].filename);
    assert.equal(result.curve.size_bytes, fixture.files[0].size_bytes);
    assert.equal(result.curve.sha256, fixture.files[0].sha256);
    assert.equal(result.curve.source_classification, RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION);
    assert.equal(result.curve.raw_payload_returned, false);
    assert.equal(result.curve.raw_curve_rows_returned, false);
    assert.equal(result.safetyFlags.rawCurvePayloadsExposed, false);
    assert.equal(result.safetyFlags.rawCurveRowsReturned, false);

    const serialised = JSON.stringify(result);
    assert.equal(serialised.includes("RAW-CURVE-ROW"), false);
    assert.equal(serialised.includes("mA,c1_lm_per_m_25C"), false);
    assert.equal(serialised.includes(fixture.curveHome), false);
    assert.equal(serialised.includes(fixture.manifestPath), false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve lookup resolves donor-style safe token candidates", async () => {
  const fixture = await makeRuntimeCurveFixture(3);
  try {
    const target = fixture.files[1].filename;
    const result = await resolveRuntimeLumenCurveLookup({
      candidate: {
        chip: "AD",
        cct: "830",
        pitch_mm: "8.8",
        length_mm: 140,
        architecture_id: "128001",
        part_number: "128001-830AD",
      },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, true);
    assert.equal(result.lookup_method, "safe-token-contract");
    assert.equal(result.curve.filename, target);
    assert.equal(result.curve.raw_payload_returned, false);
    assert.equal(result.curve.raw_curve_rows_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve lookup fails closed on checksum mismatch", async () => {
  const fixture = await makeRuntimeCurveFixture(1);
  try {
    await writeFile(pathWin32.join(fixture.curveHome, fixture.files[0].filename), "tampered payload", "utf-8");

    const result = await resolveRuntimeLumenCurveLookup({
      candidate: { filename: fixture.files[0].filename },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "checksum-mismatch");
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve lookup rejects unsafe filenames and traversal", () => {
  const unsafe = ["..\\curve.csv", "../curve.csv", "C:\\curve.csv", "curve/evil.csv", "curve?.csv", "curve.csv/.."];

  for (const filename of unsafe) {
    const result = normaliseRuntimeLumenCurveFilename(filename);
    assert.equal(result.ok, false, filename);
    assert.equal(result.blocker, "unsafe-filename");
  }
});

test("runtime curve lookup fails closed when a manifest file is missing from disk", async () => {
  const fixture = await makeRuntimeCurveFixture(1);
  try {
    await rm(pathWin32.join(fixture.curveHome, fixture.files[0].filename), { force: true });

    const result = await resolveRuntimeLumenCurveLookup({
      candidate: { filename: fixture.files[0].filename },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "missing-file");
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve lookup fails closed on ambiguous token matches", async () => {
  const fixture = await makeRuntimeCurveFixture(2);
  try {
    const result = await resolveRuntimeLumenCurveLookup({
      candidate: { chip: "AD", cct: "830", pitch_mm: "8.8", length_mm: "140" },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "ambiguous-match");
    assert.equal(result.match_count, 2);
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve manifest validation requires safe checksum-only file metadata", () => {
  const valid = validateRuntimeLumenCurveLookupManifest(
    buildRuntimeLumenCurveManifest({
      generatedAt: new Date("2026-07-01T04:00:00.000Z"),
      files: [
        {
          filename: "AD_830_8p8_140_128227__PN_128227-830AD.csv",
          relative_path: "lumen_curves/AD_830_8p8_140_128227__PN_128227-830AD.csv",
          size_bytes: 18,
          sha256: "a".repeat(64),
          source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
          raw_payload_in_manifest: false,
        },
      ],
    }),
  );
  assert.equal(valid.ok, true);
  assert.equal(valid.entries[0].filename, "AD_830_8p8_140_128227__PN_128227-830AD.csv");

  const invalid = buildRuntimeLumenCurveManifest({
    generatedAt: new Date("2026-07-01T04:00:00.000Z"),
    files: [
      {
        filename: "AD_830_8p8_140_128227__PN_128227-830AD.csv",
        relative_path: "lumen_curves/AD_830_8p8_140_128227__PN_128227-830AD.csv",
        size_bytes: 18,
        sha256: "b".repeat(64),
        source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
        raw_payload_in_manifest: false,
      },
    ],
  });
  invalid.files[0].raw_payload_in_manifest = true;

  const invalidResult = validateRuntimeLumenCurveLookupManifest(invalid);
  assert.equal(invalidResult.ok, false);
  assert.equal(invalidResult.blocker, "invalid-manifest");
  assert.equal(invalidResult.raw_payload_returned, false);
  assert.equal(invalidResult.raw_curve_rows_returned, false);
});

test("runtime curve lookup contract does not mutate RuntimeData, import Board Data Maker, invoke donor Engine, or add routes", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/runtimeLumenCurveLookupContract.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("BoardDataMaker"), false);
  assert.equal(sourceText.includes("board_lumen_util"), false);
  assert.equal(sourceText.includes("run_engine"), false);
  assert.equal(serverText.includes("runtimeLumenCurveLookupContract"), false);
  assert.equal(serverText.includes("lumen-curve-lookup"), false);
  assert.equal(serverText.includes("lumen_curves_manifest"), false);
});
