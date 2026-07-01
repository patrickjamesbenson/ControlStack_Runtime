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
import { resolveRuntimeLumenCurveLookup } from "../packages/workspace-kernel/runtimeLumenCurveLookupContract.js";
import { buildRuntimeLumenCurveParseInterpolationContract } from "../packages/workspace-kernel/runtimeLumenCurveParseInterpolationContract.js";

function sha256(value) {
  return createHash("sha256").update(Buffer.from(String(value))).digest("hex");
}

function fixtureFilename(suffix = "128227") {
  return `AD_830_8p8_140_${suffix}__PN_${suffix}-830AD.csv`;
}

function deterministicCurvePayload() {
  return [
    "# part_number: 128227-830AD",
    "# characteristics_c1_imax_mA: 800",
    "# characteristics_ma_step: 3",
    "# board_length_mm: 140",
    "mA,c1_lm_per_m_25C,c1_lm_per_m_65C,ignored_note",
    "100,1000,800,ROW-ONE-RAW-NOTE",
    "200,2000,1600,ROW-TWO-RAW-NOTE",
    "",
  ].join("\n");
}

async function makeCurveFixture({ payload = deterministicCurvePayload(), filename = fixtureFilename() } = {}) {
  const tempRoot = await mkdtemp(pathWin32.join(tmpdir(), "cs-runtime-curve-parse-"));
  const curveHome = pathWin32.join(tempRoot, "authority-reference", "lumen_curves");
  const manifestPath = pathWin32.join(tempRoot, "authority-reference", "lumen_curves_manifest.json");
  await mkdir(curveHome, { recursive: true });
  await writeFile(pathWin32.join(curveHome, filename), payload, "utf-8");

  const file = {
    filename,
    relative_path: `lumen_curves/${filename}`,
    size_bytes: Buffer.byteLength(payload),
    sha256: sha256(payload),
    source_classification: RUNTIME_LUMEN_CURVE_SOURCE_CLASSIFICATION,
    raw_payload_in_manifest: false,
  };
  const manifest = buildRuntimeLumenCurveManifest({
    generatedAt: new Date("2026-07-01T05:00:00.000Z"),
    files: [file],
  });
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  return { tempRoot, curveHome, manifestPath, filename, file };
}

async function lookupFixtureCurve(fixture) {
  const lookup = await resolveRuntimeLumenCurveLookup({
    candidate: { filename: fixture.filename },
    curveHome: fixture.curveHome,
    manifestPath: fixture.manifestPath,
  });
  assert.equal(lookup.ok, true);
  assert.equal(lookup.curve.raw_payload_returned, false);
  assert.equal(lookup.curve.raw_curve_rows_returned, false);
  return lookup.curve;
}

test("runtime curve parse contract parses fixture CSV internally and interpolates deterministically", async () => {
  const fixture = await makeCurveFixture();
  try {
    const curve = await lookupFixtureCurve(fixture);
    const result = await buildRuntimeLumenCurveParseInterpolationContract({
      curve,
      curveHome: fixture.curveHome,
      interpolationRequest: { current_ma: 150, temp_c: 45 },
    });

    assert.equal(result.ok, true);
    assert.equal(result.filename, fixture.filename);
    assert.equal(result.point_count, 2);
    assert.equal(result.checksum_verified, true);
    assert.equal(result.interpolation_supported, true);
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
    assert.equal(result.full_curve_returned, false);
    assert.equal(result.safetyFlags.rawCurvePayloadsExposed, false);
    assert.equal(result.safetyFlags.rawCurveRowsReturned, false);
    assert.equal(result.safetyFlags.fullCurveReturned, false);
    assert.equal(result.safetyFlags.runtimeDataMutated, false);
    assert.equal(result.safetyFlags.boardDataMakerImported, false);
    assert.equal(result.safetyFlags.donorEngineInvoked, false);

    assert.deepEqual(result.column_classification, {
      current_column: "mA",
      lumen_25c_column: "c1_lm_per_m_25C",
      lumen_65c_column: "c1_lm_per_m_65C",
      current_column_count: 1,
      lumen_25c_column_count: 1,
      lumen_65c_column_count: 1,
      ignored_column_count: 1,
      supported: true,
      metadata_fields_present: ["board_length_mm", "c1_imax_mA", "ma_step", "part_number"],
      comment_header_present: true,
    });
    assert.equal(result.interpolation.requested, true);
    assert.equal(result.interpolation.current_ma, 150);
    assert.equal(result.interpolation.temp_c, 45);
    assert.equal(result.interpolation.temperature_mode, "interpolated");
    assert.equal(result.interpolation.current_mode, "interpolated");
    assert.equal(result.interpolation.lm_per_m, 1350);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract never returns raw CSV rows or full curve arrays", async () => {
  const fixture = await makeCurveFixture();
  try {
    const curve = await lookupFixtureCurve(fixture);
    const result = await buildRuntimeLumenCurveParseInterpolationContract({
      curve,
      curveHome: fixture.curveHome,
      interpolationRequest: { current_ma: 150, temp_c: 45 },
    });

    assert.equal(result.ok, true);
    assert.equal(Object.hasOwn(result, "points"), false);
    assert.equal(Object.hasOwn(result, "rows"), false);
    assert.equal(Object.hasOwn(result, "curve"), false);
    assert.equal(Object.hasOwn(result, "payload"), false);
    assert.equal(result.full_curve_returned, false);
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);

    const serialised = JSON.stringify(result);
    assert.equal(serialised.includes("ROW-ONE-RAW-NOTE"), false);
    assert.equal(serialised.includes("ROW-TWO-RAW-NOTE"), false);
    assert.equal(serialised.includes("100,1000,800"), false);
    assert.equal(serialised.includes("200,2000,1600"), false);
    assert.equal(serialised.includes(fixture.curveHome), false);
    assert.equal(serialised.includes(fixture.manifestPath), false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract fails closed on checksum mismatch", async () => {
  const fixture = await makeCurveFixture();
  try {
    const curve = await lookupFixtureCurve(fixture);
    await writeFile(pathWin32.join(fixture.curveHome, fixture.filename), deterministicCurvePayload().replace("2000", "2999"), "utf-8");

    const result = await buildRuntimeLumenCurveParseInterpolationContract({
      curve,
      curveHome: fixture.curveHome,
      interpolationRequest: { current_ma: 150, temp_c: 45 },
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "checksum-mismatch");
    assert.equal(result.checksum_verified, false);
    assert.equal(result.interpolation_supported, false);
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
    assert.equal(result.full_curve_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract fails closed on unsupported headers", async () => {
  const payload = ["# part_number: 128227-830AD", "current,lm25,lm65", "100,1000,800", ""].join("\n");
  const fixture = await makeCurveFixture({ payload });
  try {
    const curve = await lookupFixtureCurve(fixture);
    const result = await buildRuntimeLumenCurveParseInterpolationContract({
      curve,
      curveHome: fixture.curveHome,
      interpolationRequest: { current_ma: 150, temp_c: 45 },
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "unsupported-headers");
    assert.equal(result.column_classification.supported, false);
    assert.equal(result.checksum_verified, false);
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
    assert.equal(result.full_curve_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract fails closed on non-numeric curve values", async () => {
  const payload = [
    "# part_number: 128227-830AD",
    "mA,c1_lm_per_m_25C,c1_lm_per_m_65C",
    "100,not-a-number,800",
    "",
  ].join("\n");
  const fixture = await makeCurveFixture({ payload });
  try {
    const curve = await lookupFixtureCurve(fixture);
    const result = await buildRuntimeLumenCurveParseInterpolationContract({
      curve,
      curveHome: fixture.curveHome,
      interpolationRequest: { current_ma: 100, temp_c: 25 },
    });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "non-numeric-curve-values");
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
    assert.equal(result.full_curve_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract fails closed on empty curve", async () => {
  const payload = ["# part_number: 128227-830AD", "mA,c1_lm_per_m_25C,c1_lm_per_m_65C", ""].join("\n");
  const fixture = await makeCurveFixture({ payload });
  try {
    const curve = await lookupFixtureCurve(fixture);
    const result = await buildRuntimeLumenCurveParseInterpolationContract({ curve, curveHome: fixture.curveHome });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "empty-curve");
    assert.equal(result.point_count, 0);
    assert.equal(result.interpolation_supported, false);
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
    assert.equal(result.full_curve_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract fails closed on ambiguous current or lumen columns", async () => {
  const payload = [
    "# part_number: 128227-830AD",
    "mA,current_ma,c1_lm_per_m_25C,c1_lm_per_m_65C",
    "100,100,1000,800",
    "",
  ].join("\n");
  const fixture = await makeCurveFixture({ payload });
  try {
    const curve = await lookupFixtureCurve(fixture);
    const result = await buildRuntimeLumenCurveParseInterpolationContract({ curve, curveHome: fixture.curveHome });

    assert.equal(result.ok, false);
    assert.equal(result.blocker, "ambiguous-columns");
    assert.equal(result.column_classification.current_column_count, 2);
    assert.equal(result.raw_payload_returned, false);
    assert.equal(result.raw_curve_rows_returned, false);
    assert.equal(result.full_curve_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract fails closed on missing file and unsafe filename", async () => {
  const fixture = await makeCurveFixture();
  try {
    const curve = await lookupFixtureCurve(fixture);
    await rm(pathWin32.join(fixture.curveHome, fixture.filename), { force: true });

    const missing = await buildRuntimeLumenCurveParseInterpolationContract({ curve, curveHome: fixture.curveHome });
    assert.equal(missing.ok, false);
    assert.equal(missing.blocker, "missing-file");
    assert.equal(missing.raw_payload_returned, false);
    assert.equal(missing.raw_curve_rows_returned, false);
    assert.equal(missing.full_curve_returned, false);

    const unsafe = await buildRuntimeLumenCurveParseInterpolationContract({
      curve: {
        ...curve,
        filename: "..\\evil.csv",
      },
      curveHome: fixture.curveHome,
    });
    assert.equal(unsafe.ok, false);
    assert.equal(unsafe.blocker, "unsafe-filename");
    assert.equal(unsafe.raw_payload_returned, false);
    assert.equal(unsafe.raw_curve_rows_returned, false);
    assert.equal(unsafe.full_curve_returned, false);
  } finally {
    await rm(fixture.tempRoot, { recursive: true, force: true });
  }
});

test("runtime curve parse contract does not mutate RuntimeData, import Board Data Maker, invoke donor Engine, or add routes", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/runtimeLumenCurveParseInterpolationContract.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("BoardDataMaker"), false);
  assert.equal(sourceText.includes("board_lumen_util"), false);
  assert.equal(sourceText.includes("run_engine"), false);
  assert.equal(serverText.includes("runtimeLumenCurveParseInterpolationContract"), false);
  assert.equal(serverText.includes("lumen-curve-parse"), false);
  assert.equal(serverText.includes("lumen-curve-interpolation"), false);
  assert.equal(serverText.includes("app.post"), false);
});
