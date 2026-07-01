import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile, stat } from "node:fs/promises";
import { tmpdir } from "node:os";
import { win32 as pathWin32 } from "node:path";

import {
  buildRuntimeDriverUtilCurveLookupContractStatus,
  normaliseRuntimeDriverUtilCurveFilename,
  resolveRuntimeDriverUtilCurveLookup,
  RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_ID,
  RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_VERSION,
  RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION,
  RUNTIME_DRIVER_UTIL_CURVE_SOURCE_KIND,
  RUNTIME_DRIVER_UTIL_CURVE_SOURCE_ROOT_CLASSIFICATION,
  validateRuntimeDriverUtilCurveLookupManifest,
} from "../packages/workspace-kernel/runtimeDriverUtilCurveLookupContract.js";

function sha256(value) {
  return createHash("sha256").update(Buffer.from(String(value))).digest("hex");
}

function driverUtilPayload(model, marker) {
  return `${JSON.stringify(
    {
      __meta__: {
        file_version: "1.0",
        source: "fixture",
        generated_from_model: model,
        raw_marker: marker,
      },
      driver_model: model,
      opt_eff: 0.85,
      curves: [
        {
          temp_c: 25,
          points: [
            { current_ma: 150, utilisation_factor: 0.85 },
            { current_ma: 250, utilisation_factor: 0.85 },
          ],
        },
      ],
    },
    null,
    2,
  )}\n`;
}

function buildManifest(files) {
  return {
    schema_id: RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_ID,
    schema_version: RUNTIME_DRIVER_UTIL_CURVE_MANIFEST_SCHEMA_VERSION,
    source_kind: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_KIND,
    source_root_classification: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_ROOT_CLASSIFICATION,
    generated_at: "2026-07-01T05:00:00.000Z",
    dry_run: false,
    executed: true,
    file_count: files.length,
    copied_count: files.length,
    already_mirrored_count: 0,
    conflict_count: 0,
    files,
    raw_driver_util_payloads_included: false,
    active_snapshot_mutated: false,
    board_data_maker_imported: false,
    donor_files_mutated: false,
  };
}

async function makeRuntimeDriverUtilFixture(count = 3) {
  const tempRoot = await mkdtemp(pathWin32.join(tmpdir(), "cs-runtime-driver-util-"));
  const curveHome = pathWin32.join(tempRoot, "authority-reference", "driver_util_curves");
  const manifestPath = pathWin32.join(tempRoot, "authority-reference", "driver_util_curves_manifest.json");
  await mkdir(curveHome, { recursive: true });

  const source = [
    ["driver_util_bk_cwl009_bxxxxa.json", "bk-cwl009-bxxxxa"],
    ["driver_util_bk_cwl013_bxxxxa.json", "bk-cwl013-bxxxxa"],
    ["driver_util_t_led_35_80_400_dali_nfc_lg.json", "t-led-35-80-400-dali-nfc-lg"],
    ["driver_util_dc_maxi_jolly_slim_nfc_dali_tw_50.json", "dc-maxi-jolly-slim-nfc-dali-tw-50"],
    ["driver_util_lc_55w_350_1050ma_54v_o4a_nf_h16_exc4.json", "lc-55w-350-1050ma-54v-o4a-nf-h16-exc4"],
  ].slice(0, count);

  const files = [];
  for (const [filename, model] of source) {
    const payload = driverUtilPayload(model, `RAW-DRIVER-UTIL-POINTS-${model}`);
    await writeFile(pathWin32.join(curveHome, filename), payload, "utf-8");
    files.push({
      filename,
      relative_path: `driver_util_curves/${filename}`,
      size_bytes: Buffer.byteLength(payload),
      sha256: sha256(payload),
      source_classification: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION,
      raw_payload_in_manifest: false,
    });
  }

  const manifest = buildManifest(files);
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");

  return { tempRoot, curveHome, manifestPath, manifest, files };
}

test("runtime driver util lookup contract validates a checksum-only manifest", async () => {
  const fixture = await makeRuntimeDriverUtilFixture(5);
  try {
    const status = await buildRuntimeDriverUtilCurveLookupContractStatus({
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(status.ok, true);
    assert.equal(status.runtime_driver_util_curve_home.readable, true);
    assert.equal(status.runtime_driver_util_curve_home.curveFileCount, 5);
    assert.equal(status.runtime_driver_util_curve_home.localPathReturned, false);
    assert.equal(status.manifest.valid, true);
    assert.equal(status.manifest.fileCount, 5);
    assert.equal(status.manifest.declaredFileCount, 5);
    assert.equal(status.manifest.checksumCoverageCount, 5);
    assert.equal(status.manifest.rawDriverUtilPayloadsIncluded, false);
    assert.equal(status.manifest.raw_payload_returned, false);
    assert.equal(status.manifest.raw_curve_points_returned, false);
    assert.equal(status.safetyFlags.runtimeDataMutated, false);
    assert.equal(status.safetyFlags.boardDataMakerImported, false);
    assert.equal(status.safetyFlags.donorEngineInvoked, false);
    assert.equal(status.safetyFlags.driverSizingImplemented, false);
    assert.equal(status.safetyFlags.driverSelectionPerformed, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime driver util exact filename lookup returns safe metadata only", async () => {
  const fixture = await makeRuntimeDriverUtilFixture(2);
  try {
    const result = await resolveRuntimeDriverUtilCurveLookup({
      candidate: { filename: fixture.files[0].filename },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, true);
    assert.equal(result.lookup_method, "exact-filename");
    assert.deepEqual(Object.keys(result.curve).sort(), [
      "filename",
      "raw_curve_points_returned",
      "raw_payload_returned",
      "sha256",
      "size_bytes",
      "source_classification",
    ]);
    assert.equal(result.curve.filename, fixture.files[0].filename);
    assert.equal(result.curve.size_bytes, fixture.files[0].size_bytes);
    assert.equal(result.curve.sha256, fixture.files[0].sha256);
    assert.equal(result.curve.source_classification, RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION);
    assert.equal(result.curve.raw_payload_returned, false);
    assert.equal(result.curve.raw_curve_points_returned, false);
    assert.equal(result.safetyFlags.rawDriverUtilPayloadsExposed, false);
    assert.equal(result.safetyFlags.rawCurvePointsReturned, false);

    const serialised = JSON.stringify(result);
    assert.equal(serialised.includes("RAW-DRIVER-UTIL-POINTS"), false);
    assert.equal(serialised.includes('"points"'), false);
    assert.equal(serialised.includes("utilisation_factor"), false);
    assert.equal(serialised.includes(fixture.curveHome), false);
    assert.equal(serialised.includes(fixture.manifestPath), false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime driver util lookup resolves model and token candidates only when unambiguous", async () => {
  const fixture = await makeRuntimeDriverUtilFixture(3);
  try {
    const modelResult = await resolveRuntimeDriverUtilCurveLookup({
      candidate: { driver_model: "BK-CWL009-BXXXXA" },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });
    assert.equal(modelResult.ok, true);
    assert.equal(modelResult.lookup_method, "safe-driver-model-token");
    assert.equal(modelResult.curve.filename, "driver_util_bk_cwl009_bxxxxa.json");
    assert.equal(modelResult.curve.raw_payload_returned, false);
    assert.equal(modelResult.curve.raw_curve_points_returned, false);

    const tokenResult = await resolveRuntimeDriverUtilCurveLookup({
      candidate: { token: "cwl013" },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });
    assert.equal(tokenResult.ok, true);
    assert.equal(tokenResult.curve.filename, "driver_util_bk_cwl013_bxxxxa.json");

    const ambiguous = await resolveRuntimeDriverUtilCurveLookup({
      candidate: { token: "bk" },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });
    assert.equal(ambiguous.ok, false);
    assert.equal(ambiguous.blocker, "ambiguous-match");
    assert.equal(ambiguous.match_count, 2);
    assert.equal(ambiguous.raw_payload_returned, false);
    assert.equal(ambiguous.raw_curve_points_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime driver util lookup fails closed on checksum mismatch", async () => {
  const fixture = await makeRuntimeDriverUtilFixture(1);
  try {
    await writeFile(pathWin32.join(fixture.curveHome, fixture.files[0].filename), "tampered payload", "utf-8");

    const result = await resolveRuntimeDriverUtilCurveLookup({
      candidate: { filename: fixture.files[0].filename },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "checksum-mismatch");
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_points_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime driver util lookup rejects unsafe filenames and traversal", () => {
  const unsafe = [
    "..\\driver_util_a.json",
    "../driver_util_a.json",
    "C:\\driver_util_a.json",
    "nested/driver_util_a.json",
    "driver_util_a?.json",
    "driver_util_a.json/..",
    "driver_util_..json",
  ];

  for (const filename of unsafe) {
    const result = normaliseRuntimeDriverUtilCurveFilename(filename);
    assert.equal(result.ok, false, filename);
    assert.equal(result.blocker, "unsafe-filename");
  }
});

test("runtime driver util lookup fails closed when a manifest file is missing from disk", async () => {
  const fixture = await makeRuntimeDriverUtilFixture(1);
  try {
    await rm(pathWin32.join(fixture.curveHome, fixture.files[0].filename), { force: true });

    const result = await resolveRuntimeDriverUtilCurveLookup({
      candidate: { filename: fixture.files[0].filename },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "missing-file");
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_points_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime driver util lookup fails closed for missing manifest and missing curve home", async () => {
  const fixture = await makeRuntimeDriverUtilFixture(1);
  try {
    await rm(fixture.manifestPath, { force: true });
    const missingManifest = await buildRuntimeDriverUtilCurveLookupContractStatus({
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });
    assert.equal(missingManifest.ok, false);
    assert.equal(missingManifest.blocker, "missing-manifest");
    assert.equal(missingManifest.raw_payload_returned, false);
    assert.equal(missingManifest.raw_curve_points_returned, false);

    await rm(fixture.curveHome, { recursive: true, force: true });
    const missingHome = await buildRuntimeDriverUtilCurveLookupContractStatus({
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });
    assert.equal(missingHome.ok, false);
    assert.equal(missingHome.blocker, "missing-curve-home");
    assert.equal(missingHome.runtime_driver_util_curve_home.localPathReturned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime driver util manifest validation fails closed on duplicate entries and unsafe safety flags", () => {
  const file = {
    filename: "driver_util_bk_cwl009_bxxxxa.json",
    relative_path: "driver_util_curves/driver_util_bk_cwl009_bxxxxa.json",
    size_bytes: 18,
    sha256: "a".repeat(64),
    source_classification: RUNTIME_DRIVER_UTIL_CURVE_SOURCE_CLASSIFICATION,
    raw_payload_in_manifest: false,
  };
  const duplicate = validateRuntimeDriverUtilCurveLookupManifest(buildManifest([file, { ...file }]));
  assert.equal(duplicate.ok, false);
  assert.equal(duplicate.blocker, "invalid-manifest");
  assert.deepEqual(duplicate.diagnostics, ["duplicate-filename"]);

  const unsafe = buildManifest([file]);
  unsafe.raw_driver_util_payloads_included = true;
  const unsafeResult = validateRuntimeDriverUtilCurveLookupManifest(unsafe);
  assert.equal(unsafeResult.ok, false);
  assert.equal(unsafeResult.blocker, "invalid-manifest");
  assert.equal(unsafeResult.diagnostics.includes("raw_driver_util_payloads_included"), true);
  assert.equal(unsafeResult.raw_payload_returned, false);
  assert.equal(unsafeResult.raw_curve_points_returned, false);
});

test("runtime driver util lookup does not touch novondb.json", async () => {
  const fixture = await makeRuntimeDriverUtilFixture(1);
  try {
    const activeSnapshot = pathWin32.join(fixture.tempRoot, "authority-reference", "novondb.json");
    const snapshotText = JSON.stringify({ sentinel: "do-not-touch" }, null, 2);
    await writeFile(activeSnapshot, snapshotText, "utf-8");
    const before = await stat(activeSnapshot);

    const result = await resolveRuntimeDriverUtilCurveLookup({
      candidate: { filename: fixture.files[0].filename },
      curveHome: fixture.curveHome,
      manifestPath: fixture.manifestPath,
    });
    const afterText = await readFile(activeSnapshot, "utf-8");
    const after = await stat(activeSnapshot);

    assert.equal(result.ok, true);
    assert.equal(afterText, snapshotText);
    assert.equal(after.size, before.size);
    assert.equal(result.safetyFlags.activeSnapshotMutated, false);
    assert.equal(result.safetyFlags.runtimeDataMutated, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime driver util lookup contract does not mutate RuntimeData, import Board Data Maker, invoke donor Engine, or add routes", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/runtimeDriverUtilCurveLookupContract.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("BoardDataMaker"), false);
  assert.equal(sourceText.includes("driver_util.py"), false);
  assert.equal(sourceText.includes("get_driver_utilisation"), false);
  assert.equal(sourceText.includes("run_engine"), false);
  assert.equal(sourceText.includes("generate_ies"), false);
  assert.equal(serverText.includes("runtimeDriverUtilCurveLookupContract"), false);
  assert.equal(serverText.includes("driver-util-curve-lookup"), false);
  assert.equal(serverText.includes("driver_util_curves_manifest"), false);
  assert.equal(serverText.includes("/api/driver-util"), false);
});
