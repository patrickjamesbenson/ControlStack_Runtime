// Lab IES toolkit — governance acceptance: draft blocked -> fill + ratify -> reference; edit re-opens review.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import { sealOrigin } from "../../packages/lab-kernel/ies-toolkit/iesProvenance.js";
import { ratifyCheck, referenceReadiness, promoteToReference } from "../../packages/lab-kernel/ies-toolkit/iesApproval.js";

const model = { meta: { keywords_order: [ { key: "[MANUFAC]", value: "NOVON" } ] },
  photometry: { v_angles: [0], h_angles: [0], candela: [[100]], geometry: { G8: 1, G12: 22.5 } } };
const T = [
  { ies_order: "1", field: "[MANUFAC]", inputs: "", kind: "ies", gates_reference: "y" },
  { ies_order: "2", field: "[_BOARD_TC_C]", inputs: "40C, 50C", kind: "lab", gates_reference: "y" },
  { ies_order: "3", field: "[_BCLT_APPLIED]", inputs: "pending, yes, no", kind: "check", gates_reference: "y" },
  { ies_order: "4", field: "[_POWER_APPROVED]", inputs: "pending, circuit, wall", kind: "check", gates_reference: "y" },
  { ies_order: "5", field: "[SEARCH]", inputs: "tags", kind: "ies", gates_reference: "n" },
];

test("draft blocked -> fill + ratify -> promotes to reference", () => {
  const rec = buildOneMmRecord(model, { baseLabForm: T });
  sealOrigin(rec);
  let r = referenceReadiness(rec);
  assert.equal(r.ready, false);
  assert.ok(r.blockers.some((b) => b.field === "_BOARD_TC_C"));
  assert.ok(r.blockers.some((b) => b.field === "_BCLT_APPLIED"));
  rec.labForm.find((x) => x.bareField === "_BOARD_TC_C").value = "50C";
  ratifyCheck(rec, "_BCLT_APPLIED", "yes");
  ratifyCheck(rec, "_POWER_APPROVED", "circuit");
  r = referenceReadiness(rec);
  assert.equal(r.ready, true, JSON.stringify(r.blockers));
  assert.equal(promoteToReference(rec).ok, true);
  assert.equal(rec.approvalState, "reference");
  assert.equal(rec.labForm.find((x) => x.bareField === "_POWER_APPROVED").value, "circuit");
  assert.ok(rec.provenance.mutationLog.length >= 2);
});

test("editing a stamped reference forces pending_review", () => {
  const rec = buildOneMmRecord(model, { baseLabForm: T });
  sealOrigin(rec);
  rec.labForm.find((x) => x.bareField === "_BOARD_TC_C").value = "50C";
  ratifyCheck(rec, "_BCLT_APPLIED", "yes");
  ratifyCheck(rec, "_POWER_APPROVED", "circuit");
  promoteToReference(rec);
  assert.equal(rec.approvalState, "reference");
  ratifyCheck(rec, "_BCLT_APPLIED", "no");
  assert.equal(rec.approvalState, "pending_review");
  assert.equal(referenceReadiness(rec).ready, false);
});
