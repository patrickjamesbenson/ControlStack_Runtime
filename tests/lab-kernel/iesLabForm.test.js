// Lab IES toolkit — template merge plus rich one-millimetre authority-record construction.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLabForm, buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import { toOneMm } from "../../packages/lab-kernel/ies-toolkit/iesOneMm.js";
import { buildSafeHandoff } from "../../packages/lab-kernel/ies-toolkit/iesHandoff.js";

const model = {
  meta: { keywords_order: [
    { key: "[MANUFAC]", value: "NOVON" },
    { key: "[COLOUR]", value: "4000K" },
  ]},
  photometry: { v_angles: [0, 90], h_angles: [0], candela: [[100, 200]], geometry: { G8: 1, G12: 22.5 } },
};
const TEMPLATE = [
  { ies_order: "1", field: "[MANUFAC]", inputs: "" },
  { ies_order: "2", field: "[_COLORTEMP]", inputs: "3000K, 4000K" },
  { ies_order: "3", field: "[INPUT_WATTS]", inputs: "30" },
  { ies_order: "4", field: "[_TEST_TYPE]", inputs: "Base Engine, Base Engine & Optic" },
];

test("merge marks from-file, aliased, computed, needs-lab-input", () => {
  const rows = buildLabForm(model, TEMPLATE, { COLOUR: "_COLORTEMP" });
  const by = Object.fromEntries(rows.map((row) => [row.bareField, row]));
  assert.equal(by.MANUFAC.value, "NOVON");
  assert.equal(by.MANUFAC.source, "from-file");
  assert.equal(by._COLORTEMP.value, "4000K");
  assert.match(by._COLORTEMP.source, /aliased/);
  assert.equal(by.INPUT_WATTS.value, "22.5");
  assert.match(by.INPUT_WATTS.source, /computed/);
  assert.equal(by._TEST_TYPE.source, "needs-lab-input");
});

test("1mm seed scales candela by 0.001 / length", () => {
  const one = toOneMm(model);
  assert.equal(one.photometry.geometry.G8, 0.001);
  assert.ok(Math.abs(one.photometry.candela[0][0] - 0.1) < 1e-9);
});

test("record surfaces the canonical rich authority skeleton", () => {
  const record = buildOneMmRecord(model, {
    baseLabForm: TEMPLATE,
    aliasMap: { COLOUR: "_COLORTEMP" },
    origin: {
      artifactRef: "lab/origins/test/origin.ies",
      byteLength: 999,
      mediaType: "text/plain",
      fingerprint: null,
    },
  });
  assert.equal(record.oneMmNormalised, true);
  assert.equal(record.baseLengthM, 0.001);
  assert.equal(record.photometry.geometry.G8, 0.001);
  assert.equal(record.recordKind, null);
  assert.equal(record.revisionState, "draft");
  assert.equal(record.labProofState, "pending");
  assert.equal(record.recipe.operation, "normalise_1mm_candidate");
  assert.ok(record.unresolvedFields.includes("/labForm/_TEST_TYPE"));
  assert.ok(record.unresolvedFields.includes("/recordKind"));
  assert.equal("recordType" in record, false);
  assert.equal("referenceEngineId" in record, false);
  assert.deepEqual(record.safeRuntimeHandoff, buildSafeHandoff(record));
});
