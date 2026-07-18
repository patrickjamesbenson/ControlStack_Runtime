// Lab IES toolkit — data-mutation transforms + governed applyEdit (logs mutation, re-opens approval).
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import { sealOrigin } from "../../packages/lab-kernel/ies-toolkit/iesProvenance.js";
import { ratifyCheck, promoteToReference } from "../../packages/lab-kernel/ies-toolkit/iesApproval.js";
import { mirrorVertical, scaleByFactor, detectHemisphere, maskHemisphere, flip, mergePhotometry, resampleToGrid, standardize, setDimensions, setFlag, applyEdit } from "../../packages/lab-kernel/ies-toolkit/iesTransforms.js";
import { analyzeSymmetry, symmetrize } from "../../packages/lab-kernel/ies-toolkit/iesSymmetrize.js";

const phot = { v_angles: [0, 90, 180], h_angles: [0], candela: [[100, 50, 0]], geometry: { G8: 1, G12: 22.5 } };

test("mirror reverses candela rows", () => { assert.deepEqual(mirrorVertical(phot).candela, [[0, 50, 100]]); });
test("scale multiplies candela", () => { assert.deepEqual(scaleByFactor(phot, 2).candela, [[200, 100, 0]]); });
test("hemisphere detect + mask", () => {
  assert.equal(detectHemisphere({ v_angles: [0, 90, 180], h_angles: [0], candela: [[100, 5, 0]], geometry: {} }), "down");
  const up = { v_angles: [0, 90, 180], h_angles: [0], candela: [[0, 5, 100]], geometry: {} };
  assert.equal(detectHemisphere(up), "up");
  assert.deepEqual(maskHemisphere(up, "up").candela, [[0, 5, 100]]);
  assert.equal(detectHemisphere(phot), "bi");
});
test("flip vertical reverses grid + angles", () => {
  const f = flip(phot, { vertical: true });
  assert.deepEqual(f.candela, [[0, 50, 100]]);
  assert.deepEqual(f.v_angles, [180, 90, 0]);
});
test("merge sums matching grids", () => { assert.deepEqual(mergePhotometry(phot, phot).candela, [[200, 100, 0]]); });
test("resample ~identity; standardise -> 181x25", () => {
  assert.ok(Math.abs(resampleToGrid(phot, [0, 90, 180], [0]).candela[0][1] - 50) < 1e-9);
  const std = standardize(phot);
  assert.equal(std.v_angles.length, 181);
  assert.equal(std.h_angles.length, 25);
});
test("resample is deterministic, linear, and does not mutate its input", () => {
  const source = { v_angles: [0, 90], h_angles: [0, 90], candela: [[0, 90], [90, 180]], geometry: { G8: 1 } };
  const before = structuredClone(source);
  const sampled = resampleToGrid(source, [45], [45]);
  assert.deepEqual(sampled.candela, [[90]]);
  assert.deepEqual(source, before);
});
test("symmetrize deterministically averages mirror partners and reports residual imbalance", () => {
  const source = {
    photometry: {
      v_angles: [0, 180],
      h_angles: [0, 90, 180, 270],
      candela: [[100, 0], [80, 0], [100, 0], [60, 0]],
      geometry: {},
    },
  };
  assert.equal(analyzeSymmetry(source).recommended, "mirror-c0");
  const result = symmetrize(source, "mirror-c0");
  assert.deepEqual(result.photometry.candela, [[100, 0], [70, 0], [100, 0], [70, 0]]);
  assert.deepEqual(result.imbalance, { mode: "mirror-c0", maxRelPct: 10, rmsRelPct: 5 });
  assert.deepEqual(source.photometry.candela, [[100, 0], [80, 0], [100, 0], [60, 0]]);
});
test("BCLT dims + header flags set geometry", () => {
  assert.equal(setDimensions(phot, { g8: 1.186 }).geometry.G8, 1.186);
  assert.equal(setFlag(phot, "units", 1).geometry.G6, 1);
  assert.equal(setFlag(phot, "photometric_type", 2).geometry.G5, 2);
});
test("applyEdit on a reference logs a mutation and re-opens approval", () => {
  const model = { meta: { keywords_order: [{ key: "[MANUFAC]", value: "NOVON" }] }, photometry: JSON.parse(JSON.stringify(phot)) };
  const T = [
    { ies_order: "1", field: "[MANUFAC]", inputs: "", kind: "ies", gates_reference: "y" },
    { ies_order: "2", field: "[_BCLT_APPLIED]", inputs: "pending, yes", kind: "check", gates_reference: "y" },
  ];
  const rec = buildOneMmRecord(model, { baseLabForm: T });
  sealOrigin(rec); ratifyCheck(rec, "_BCLT_APPLIED", "yes"); promoteToReference(rec);
  assert.equal(rec.approvalState, "reference");
  const before = rec.provenance.sealing.diagnosticRecordFingerprint;
  applyEdit(rec, mirrorVertical(rec.photometry), { toolId: "ies-mirror", operation: "mirror-vertical" });
  assert.equal(rec.approvalState, "pending_review");
  assert.notEqual(rec.provenance.sealing.diagnosticRecordFingerprint, before);
  assert.equal(rec.recordFingerprint, null);
  assert.equal(rec.mutationLog.at(-1).operation, "mirror-vertical");
});
