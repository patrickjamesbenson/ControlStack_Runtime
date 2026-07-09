// Lab IES toolkit — safe handoff: emits CP's full required field set; leaks no raw/proprietary data.
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
  { ies_order: "2", field: "[_BCLT_APPLIED]", inputs: "pending, yes", kind: "check", gates_reference: "y" },
  { ies_order: "3", field: "[_POWER_APPROVED]", inputs: "pending, circuit, wall", kind: "check", gates_reference: "y" },
];
function makeRef(){ const r = buildOneMmRecord(model, { baseLabForm: T }); sealOrigin(r); ratifyCheck(r, "_BCLT_APPLIED", "yes"); ratifyCheck(r, "_POWER_APPROVED", "circuit"); promoteToReference(r); return r; }

const REQUIRED = ["schemaId", "schemaVersion", "handoffState", "approvalState", "oneMmNormalised", "baseLengthM", "sourcePhotometryRef", "sourcePhotometryStatus", "iesPhotometryReferenceToken", "lumenCurveReferenceToken", "driverUtilCurveReferenceToken", "photometryReferenceFingerprint", "sourceInputFingerprint", "boardDataSourceVersion", "selectedFamilySubsetLock", "oneMmPolicyLabel", "recordFingerprint", "derivedFromFingerprint", "safeSummaryOnly", "readOnly"];
const FORBIDDEN_KEYS = ["photometry", "labForm", "mutationLog", "provenance", "origin", "candela", "meta", "keywords_order"];
const FORBIDDEN_VALUES = ["31153", "PROPRIETARY-XYZ", "_SECRET_SAUCE", "ratify-check", "lab-ratify"];

test("emits CP's full required field set", () => {
  const h = buildSafeHandoff(makeRef());
  for (const k of REQUIRED) assert.ok(k in h, "missing required field: " + k);
  assert.equal(h.handoffState, "ready"); assert.equal(h.safeSummaryOnly, true); assert.equal(h.readOnly, true);
});

test("no leaks", () => {
  const h = buildSafeHandoff(makeRef());
  for (const k of FORBIDDEN_KEYS) assert.equal(k in h, false, "exposed key: " + k);
  const blob = JSON.stringify(h);
  for (const v of FORBIDDEN_VALUES) assert.equal(blob.includes(v), false, "leaked: " + v);
});
