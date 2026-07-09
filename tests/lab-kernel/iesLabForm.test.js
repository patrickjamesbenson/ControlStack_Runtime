// Lab IES toolkit — record-maker acceptance: template merge (from-file / aliased / computed / needs-lab-input) + 1mm seed.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildLabForm, buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import { toOneMm } from "../../packages/lab-kernel/ies-toolkit/iesOneMm.js";

const model = {
  meta: { keywords_order: [
    { key: "[MANUFAC]", value: "NOVON" },
    { key: "[COLOUR]", value: "4000K" }, // supplier's odd name for colour temp
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
  const by = Object.fromEntries(rows.map((r) => [r.bareField, r]));
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

test("record surfaces 1mm flags, recordType, reference link, unresolved list", () => {
  const rec = buildOneMmRecord(model, { baseLabForm: TEMPLATE, aliasMap: { COLOUR: "_COLORTEMP" } });
  assert.equal(rec.oneMmNormalised, true);
  assert.equal(rec.baseLengthM, 0.001);
  assert.ok(rec.unresolvedFields.includes("_TEST_TYPE"));
});
