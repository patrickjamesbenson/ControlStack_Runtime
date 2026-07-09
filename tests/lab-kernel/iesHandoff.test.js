// Lab IES toolkit — safe handoff acceptance: exposes safe refs + readiness, leaks no raw/proprietary data.
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import { sealOrigin } from "../../packages/lab-kernel/ies-toolkit/iesProvenance.js";
import { ratifyCheck, promoteToReference } from "../../packages/lab-kernel/ies-toolkit/iesApproval.js";
import { buildSafeHandoff } from "../../packages/lab-kernel/ies-toolkit/iesHandoff.js";

const model = { meta: { keywords_order: [ { key: "[MANUFAC]", value: "NOVON" }, { key: "[_SECRET_SAUCE]", value: "PROPRIETARY-XYZ" } ] },
  photometry: { v_angles: [0], h_angles: [0], candela: [[31153.7]], geometry: { G8: 1, G12: 22.5 } } };
const T = [
  { ies_order: "1", field: "[MANUFAC]", inputs: "", kind: "ies", gates_reference: "y" },
  { ies_order: "2", field: "[_BCLT_APPLIED]", inputs: "pending, yes, no", kind: "check", gates_reference: "y" },
  { ies_order: "3", field: "[_POWER_APPROVED]", inputs: "pending, circuit, wall", kind: "check", gates_reference: "y" },
];
function makeReference(){
  const rec = buildOneMmRecord(model, { baseLabForm: T });
  sealOrigin(rec);
  ratifyCheck(rec, "_BCLT_APPLIED", "yes");
  ratifyCheck(rec, "_POWER_APPROVED", "circuit");
  promoteToReference(rec);
  return rec;
}
const FORBIDDEN_KEYS = ["photometry", "labForm", "mutationLog", "provenance", "origin", "candela", "meta", "keywords_order"];
const FORBIDDEN_VALUES = ["31153", "PROPRIETARY-XYZ", "_SECRET_SAUCE", "ratify-check", "lab-ratify"];
function assertClean(h){
  for (const k of FORBIDDEN_KEYS) assert.equal(k in h, false, "handoff exposed key: " + k);
  const blob = JSON.stringify(h);
  for (const v of FORBIDDEN_VALUES) assert.equal(blob.includes(v), false, "handoff leaked value: " + v);
}

test("reference handoff: safe refs + readiness, no leaks", () => {
  const h = buildSafeHandoff(makeReference());
  assert.equal(h.handoffState, "ready");
  assert.ok(h.photometryReferenceFingerprint.startsWith("safe-"));
  assert.ok(h.sourceInputFingerprint.startsWith("safe-"));
  assertClean(h);
});

test("draft handoff: blocked, no leaks", () => {
  const rec = buildOneMmRecord(model, { baseLabForm: T });
  sealOrigin(rec);
  const h = buildSafeHandoff(rec);
  assert.equal(h.handoffState, "blocked");
  assert.equal(h.sourcePhotometryStatus, "not-a-reference");
  assertClean(h);
});
