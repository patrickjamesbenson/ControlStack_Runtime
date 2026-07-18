// Lab IES toolkit — embedded safe handoff remains deterministic, fail-closed and leak-free.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import { sealOrigin } from "../../packages/lab-kernel/ies-toolkit/iesProvenance.js";
import {
  promoteToCryptographicReference,
  promoteToReference,
  ratifyCheck,
} from "../../packages/lab-kernel/ies-toolkit/iesApproval.js";
import { createAuthorityRecord, refreshUnresolvedFields } from "../../packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js";
import { buildSafeHandoff, refreshSafeRuntimeHandoff } from "../../packages/lab-kernel/ies-toolkit/iesHandoff.js";

const model = { meta: { keywords_order: [
  { key: "[MANUFAC]", value: "NOVON" },
  { key: "[_SECRET_SAUCE]", value: "PROPRIETARY-XYZ" },
  { key: "[_TEST_TYPE]", value: "Base Engine & Optic" },
  { key: "[_ENGINE_ID]", value: "NVB-REF-GT-000045" },
] },
  photometry: { v_angles: [0], h_angles: [0], candela: [[31153.7]], geometry: { G8: 1, G12: 22.5 } } };
const T = [
  { ies_order: "1", field: "[MANUFAC]", inputs: "", kind: "ies", gates_reference: "y" },
  { ies_order: "2", field: "[_TEST_TYPE]", inputs: "", kind: "lab", gates_reference: "y" },
  { ies_order: "3", field: "[_ENGINE_ID]", inputs: "", kind: "lab", gates_reference: "n" },
  { ies_order: "4", field: "[_BCLT_APPLIED]", inputs: "pending, yes", kind: "check", gates_reference: "y" },
  { ies_order: "5", field: "[_POWER_APPROVED]", inputs: "pending, circuit, wall", kind: "check", gates_reference: "y" },
];
function makeReference(){
  const record = buildOneMmRecord(model, {
    baseLabForm: T,
    recordId: "LAB-AUTH-0002",
    origin: {
      artifactRef: "lab/origins/source-0002/origin.ies",
      byteLength: 2048,
      mediaType: "text/plain",
      fingerprint: null,
    },
  });
  sealOrigin(record);
  ratifyCheck(record, "_BCLT_APPLIED", "yes");
  ratifyCheck(record, "_POWER_APPROVED", "circuit");
  promoteToReference(record);
  return record;
}

const ORIGIN_BYTES = new TextEncoder().encode("IESNA:LM-63-2019\nHANDOFF\n");
const sha256Provider = Object.freeze({
  async digest(bytes) {
    return new Uint8Array(createHash("sha256").update(bytes).digest());
  },
});
const PARENT_A_SHA = "a".repeat(64);
const PARENT_B_SHA = "b".repeat(64);

async function makeCryptographicReference(kind = "GT") {
  const parentLineage = kind === "MERGED"
    ? [
      { parentId: "NVB-REF-GT-000001", parentKind: "GT", role: "base", ordinal: 1, referenceSha256: PARENT_A_SHA },
      { parentId: "NVB-REF-OPT-000001", parentKind: "OPT", role: "optic", ordinal: 2, referenceSha256: PARENT_B_SHA },
    ]
    : [];
  const record = createAuthorityRecord({
    recordId: `LAB-HANDOFF-${kind}-0001`,
    recordKind: kind,
    origin: kind === "MERGED"
      ? { artifactRef: null, byteLength: null, mediaType: null, fingerprint: null }
      : {
        artifactRef: "lab/origins/handoff-gt-0001/origin.ies",
        byteLength: ORIGIN_BYTES.byteLength,
        mediaType: "text/plain",
        fingerprint: null,
      },
    labForm: [
      { field: "[MANUFAC]", bareField: "MANUFAC", order: 1, value: "NOVON", source: "from-file", options: [], kind: "ies", gatesReference: true },
      { field: "[_BCLT_APPLIED]", bareField: "_BCLT_APPLIED", order: 2, value: "pending", source: "check-pending", options: ["pending", "yes", "no"], kind: "check", gatesReference: true },
      { field: "[_POWER_APPROVED]", bareField: "_POWER_APPROVED", order: 3, value: "pending", source: "check-pending", options: ["pending", "circuit", "wall"], kind: "check", gatesReference: true },
    ],
    photometry: {
      v_angles: [0, 90, 180],
      h_angles: [0, 90],
      candela: [[100, 50, 0], [90, 45, 0]],
      geometry: {
        G0: 1, G1: 1, G2: 1, G3: 3, G4: 2, G5: 1, G6: 0.1,
        G7: 0.1, G8: 0.001, G9: 1, G10: 0.019, G11: "1.11100", G12: 0.02,
      },
    },
    parentLineage,
  });
  sealOrigin(record, "2026-07-16T00:00:00.000Z");
  ratifyCheck(record, "_BCLT_APPLIED", "yes", "test-actor");
  ratifyCheck(record, "_POWER_APPROVED", "circuit", "test-actor");
  const source = kind === "MERGED"
    ? {
      derivationInput: {
        operation: "merge_authority_records",
        mode: "MERGED",
        geometryRegistration: { units: "mm", offsets: [0, 1000] },
        parentInstances: parentLineage,
        artifactReferences: [],
        recipe: { candelaMode: "ordered-composition" },
      },
    }
    : { originBytes: ORIGIN_BYTES, expectedByteLength: ORIGIN_BYTES.byteLength };
  const result = await promoteToCryptographicReference(
    record,
    source,
    {
      approvedAtUtc: "2026-07-16T01:02:03.004Z",
      approverId: "actor:handoff-approver:opaque-001",
      ratifiedChecks: [
        { checkId: "_POWER_APPROVED", decision: "circuit" },
        { checkId: "_BCLT_APPLIED", decision: "yes" },
      ],
    },
    sha256Provider,
  );
  assert.equal(result.ok, true, JSON.stringify(result.blockers || []));
  return result.authorityRecord;
}

const REQUIRED = [
  "schemaId", "schemaVersion", "handoffState", "approvalState", "oneMmNormalised", "baseLengthM",
  "sourcePhotometryRef", "sourcePhotometryStatus", "iesPhotometryReferenceToken", "lumenCurveReferenceToken",
  "driverUtilCurveReferenceToken", "photometryReferenceFingerprint", "sourceInputFingerprint", "boardDataSourceVersion",
  "selectedFamilySubsetLock", "oneMmPolicyLabel", "recordFingerprint", "derivedFromFingerprint", "recordKind",
  "recordType", "referenceEngineToken", "unresolvedCount", "safeSummaryOnly", "readOnly",
];
const FORBIDDEN_KEYS = [
  "photometry", "labForm", "mutationLog", "provenance", "origin", "candela", "meta", "keywords_order",
  "referenceSha256", "keywordProfile", "metadata", "baseline", "provenanceRefs", "sealedAtUtc", "serial",
];
const FORBIDDEN_VALUES = ["31153", "PROPRIETARY-XYZ", "_SECRET_SAUCE", "ratify-check", "lab-ratify"];

test("embedded projection equals the deterministic handoff builder", () => {
  const record = makeReference();
  const handoff = buildSafeHandoff(record);
  assert.deepEqual(record.safeRuntimeHandoff, handoff);
  for (const key of REQUIRED) assert.ok(key in handoff, "missing required field: " + key);
  assert.equal(handoff.handoffState, "blocked");
  assert.equal(handoff.sourcePhotometryStatus, "authority-unresolved");
  assert.equal(handoff.approvalState, "reference");
  assert.equal(handoff.recordKind, "OPT");
  assert.equal(handoff.recordType, "OPT");
  assert.equal(handoff.referenceEngineToken, "NVB-REF-GT-000045");
  assert.equal(handoff.sourcePhotometryRef, "lab/origins/source-0002/origin.ies");
  assert.equal(handoff.safeSummaryOnly, true);
  assert.equal(handoff.readOnly, true);
});

test("compatibility-only references keep authority and runtime-owned slots unresolved", () => {
  const handoff = buildSafeHandoff(makeReference());
  for (const key of [
    "iesPhotometryReferenceToken",
    "photometryReferenceFingerprint",
    "sourceInputFingerprint",
    "recordFingerprint",
    "lumenCurveReferenceToken",
    "driverUtilCurveReferenceToken",
    "boardDataSourceVersion",
    "selectedFamilySubsetLock",
  ]) assert.equal(handoff[key], null, `${key} must remain null`);
  assert.ok(handoff.unresolvedCount >= 3);
});

test("safe handoff leaks no rich authority or proprietary data", () => {
  const handoff = buildSafeHandoff(makeReference());
  for (const key of FORBIDDEN_KEYS) assert.equal(key in handoff, false, "exposed key: " + key);
  const blob = JSON.stringify(handoff);
  for (const value of FORBIDDEN_VALUES) assert.equal(blob.includes(value), false, "leaked: " + value);
});

test("safe handoff becomes ready only after cryptographic approval", async () => {
  const record = await makeCryptographicReference();
  const handoff = buildSafeHandoff(record);
  assert.equal(handoff.handoffState, "ready");
  assert.equal(handoff.sourcePhotometryStatus, "available");
  assert.equal(handoff.recordFingerprint, record.authorityRecordSha256);
  assert.equal(handoff.photometryReferenceFingerprint, record.authorityRecordSha256);
  assert.equal(handoff.sourceInputFingerprint, record.originSha256);
  assert.equal(handoff.unresolvedCount, 0);
});

test("MERGED handoff is ready only with null origin and bound derivation", async () => {
  const record = await makeCryptographicReference("MERGED");
  const handoff = buildSafeHandoff(record);
  assert.equal(handoff.handoffState, "ready");
  assert.equal(handoff.sourcePhotometryRef, null);
  assert.equal(handoff.sourceInputFingerprint, record.derivationSha256);
  assert.equal(handoff.derivedFromFingerprint, record.derivationSha256);

  record.derivationSha256 = "e".repeat(64);
  record.sourceFingerprint = record.derivationSha256;
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  assert.equal(record.safeRuntimeHandoff.handoffState, "blocked");
});

test("invalid compatibility aliases fail closed", async () => {
  for (const mutate of [
    (record) => { record.sourceFingerprint = "d".repeat(64); },
    (record) => { record.origin.fingerprint = "d".repeat(64); },
    (record) => { record.recordFingerprint = "d".repeat(64); },
  ]) {
    const record = await makeCryptographicReference();
    mutate(record);
    refreshUnresolvedFields(record);
    refreshSafeRuntimeHandoff(record);
    assert.equal(record.safeRuntimeHandoff.handoffState, "blocked");
    assert.equal(record.safeRuntimeHandoff.recordFingerprint, null);
    assert.equal(record.safeRuntimeHandoff.sourceInputFingerprint, null);
  }
});

test("pending-review, malformed approval, and stale authority binding fail closed", async () => {
  const pending = await makeCryptographicReference();
  ratifyCheck(pending, "_BCLT_APPLIED", "no", "test-mutator");
  assert.equal(buildSafeHandoff(pending).handoffState, "blocked");

  const malformed = await makeCryptographicReference();
  malformed.approval.approvalFingerprint = "safe-stale";
  refreshSafeRuntimeHandoff(malformed);
  assert.equal(malformed.safeRuntimeHandoff.handoffState, "blocked");

  const stale = await makeCryptographicReference();
  stale.approval.authorityRecordSha256 = "f".repeat(64);
  refreshSafeRuntimeHandoff(stale);
  assert.equal(stale.safeRuntimeHandoff.handoffState, "blocked");
});

test("ready handoff preserves all prior leak protections", async () => {
  const record = await makeCryptographicReference();
  record.privateApprovalData = { displayName: "PRIVATE APPROVER" };
  record.localPath = "C:\\private\\origin.ies";
  const handoff = buildSafeHandoff(record);
  for (const key of FORBIDDEN_KEYS) assert.equal(key in handoff, false, "exposed key: " + key);
  const blob = JSON.stringify(handoff);
  for (const value of ["PRIVATE APPROVER", "C:\\private", "candela", "mutationLog"]) {
    assert.equal(blob.includes(value), false, "leaked: " + value);
  }
});
