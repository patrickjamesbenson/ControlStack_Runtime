// Lab IES toolkit — governance acceptance: draft blocked -> fill + ratify -> reference; edit re-opens review.
import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import { sealOrigin } from "../../packages/lab-kernel/ies-toolkit/iesProvenance.js";
import {
  prepareAuthorityFingerprints,
  promoteToCryptographicReference,
  promoteToReference,
  ratifyCheck,
  referenceReadiness,
} from "../../packages/lab-kernel/ies-toolkit/iesApproval.js";
import { assertAuthorityRecord, createAuthorityRecord } from "../../packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js";

const model = { meta: { keywords_order: [ { key: "[MANUFAC]", value: "NOVON" } ] },
  photometry: { v_angles: [0], h_angles: [0], candela: [[100]], geometry: { G8: 1, G12: 22.5 } } };
const T = [
  { ies_order: "1", field: "[MANUFAC]", inputs: "", kind: "ies", gates_reference: "y" },
  { ies_order: "2", field: "[_BOARD_TC_C]", inputs: "40C, 50C", kind: "lab", gates_reference: "y" },
  { ies_order: "3", field: "[_BCLT_APPLIED]", inputs: "pending, yes, no", kind: "check", gates_reference: "y" },
  { ies_order: "4", field: "[_POWER_APPROVED]", inputs: "pending, circuit, wall", kind: "check", gates_reference: "y" },
  { ies_order: "5", field: "[SEARCH]", inputs: "tags", kind: "ies", gates_reference: "n" },
];

const ORIGIN_BYTES = new TextEncoder().encode("IESNA:LM-63-2019\r\nSYNTHETIC\r\n");
const sha256Provider = Object.freeze({
  async digest(bytes) {
    return new Uint8Array(createHash("sha256").update(bytes).digest());
  },
});
const PARENT_A_SHA = "a".repeat(64);
const PARENT_B_SHA = "b".repeat(64);

function syntheticRecord(kind, bcltDecision = "yes") {
  const parentLineage = kind === "MERGED"
    ? [
      { parentId: "NVB-REF-GT-000001", parentKind: "GT", role: "base", ordinal: 1, referenceSha256: PARENT_A_SHA },
      { parentId: "NVB-REF-OPT-000001", parentKind: "OPT", role: "optic", ordinal: 2, referenceSha256: PARENT_B_SHA },
    ]
    : (kind === "OPT" ? [
      { referenceId: "NVB-REF-GT-000001", recordKind: "GT", relation: "reference_engine", referenceSha256: PARENT_A_SHA },
    ] : []);
  const record = createAuthorityRecord({
    recordId: `LAB-${kind}-0001`,
    recordKind: kind,
    origin: kind === "MERGED"
      ? { artifactRef: null, byteLength: null, mediaType: null, fingerprint: null }
      : {
        artifactRef: `lab/origins/${kind.toLowerCase()}-0001/origin.ies`,
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
    derivationReferences: kind === "OPT" ? parentLineage : [],
  });
  sealOrigin(record, "2026-07-16T00:00:00.000Z");
  ratifyCheck(record, "_BCLT_APPLIED", bcltDecision, "test-actor");
  ratifyCheck(record, "_POWER_APPROVED", "circuit", "test-actor");
  return record;
}

function sourceContext(kind) {
  if (kind === "MERGED") {
    return {
      derivationInput: {
        operation: "merge_authority_records",
        mode: "MERGED",
        geometryRegistration: { units: "mm", offsets: [0, 1000] },
        parentInstances: [
          { parentId: "NVB-REF-GT-000001", parentKind: "GT", role: "base", ordinal: 1, referenceSha256: PARENT_A_SHA },
          { parentId: "NVB-REF-OPT-000001", parentKind: "OPT", role: "optic", ordinal: 2, referenceSha256: PARENT_B_SHA },
        ],
        artifactReferences: [],
        recipe: { candelaMode: "ordered-composition" },
      },
    };
  }
  return { originBytes: ORIGIN_BYTES, expectedByteLength: ORIGIN_BYTES.byteLength };
}

function approvalContext(overrides = {}) {
  return {
    approvedAtUtc: "2026-07-16T01:02:03.004Z",
    approverId: "actor:lab-approver:opaque-001",
    ratifiedChecks: [
      { checkId: "_POWER_APPROVED", decision: "circuit" },
      { checkId: "_BCLT_APPLIED", decision: "yes" },
    ],
    ...overrides,
  };
}

async function approveSynthetic(kind, { bcltDecision = "yes", approval = {} } = {}) {
  const record = syntheticRecord(kind, bcltDecision);
  const context = approvalContext({
    ratifiedChecks: [
      { checkId: "_POWER_APPROVED", decision: "circuit" },
      { checkId: "_BCLT_APPLIED", decision: bcltDecision },
    ],
    ...approval,
  });
  const result = await promoteToCryptographicReference(record, sourceContext(kind), context, sha256Provider);
  assert.equal(result.ok, true, JSON.stringify(result.blockers || []));
  return { original: record, approved: result.authorityRecord };
}

test("draft blocked -> fill + ratify -> promotes to reference", () => {
  const record = buildOneMmRecord(model, { baseLabForm: T });
  sealOrigin(record, "2026-07-16T00:00:00.000Z");
  let readiness = referenceReadiness(record);
  assert.equal(readiness.ready, false);
  assert.ok(readiness.blockers.some((blocker) => blocker.field === "_BOARD_TC_C"));
  assert.ok(readiness.blockers.some((blocker) => blocker.field === "_BCLT_APPLIED"));

  const labRow = record.labForm.find((row) => row.bareField === "_BOARD_TC_C");
  labRow.value = "50C";
  labRow.source = "lab-entered";
  ratifyCheck(record, "_BCLT_APPLIED", "yes");
  ratifyCheck(record, "_POWER_APPROVED", "circuit");

  readiness = referenceReadiness(record);
  assert.equal(readiness.ready, true, JSON.stringify(readiness.blockers));
  assert.equal(promoteToReference(record, "2026-07-16T01:00:00.000Z").ok, true);
  assert.equal(record.approvalState, "reference");
  assert.equal(record.revisionState, "current");
  assert.equal(record.labProofState, "complete");
  assert.equal(record.approval.approvedAtUtc, "2026-07-16T01:00:00.000Z");
  assert.equal(record.approval.approvedByActorType, "human_approved_tool_run");
  assert.equal(record.labForm.find((row) => row.bareField === "_POWER_APPROVED").value, "circuit");
  assert.ok(record.mutationLog.length >= 2);
  assert.equal("mutationLog" in record.provenance, false);
  assert.equal(record.safeRuntimeHandoff.handoffState, "blocked");
  assert.equal(assertAuthorityRecord(record), true);
});

test("editing a stamped reference forces pending_review with reopening metadata", () => {
  const record = buildOneMmRecord(model, { baseLabForm: T });
  sealOrigin(record);
  const labRow = record.labForm.find((row) => row.bareField === "_BOARD_TC_C");
  labRow.value = "50C";
  labRow.source = "lab-entered";
  ratifyCheck(record, "_BCLT_APPLIED", "yes");
  ratifyCheck(record, "_POWER_APPROVED", "circuit");
  promoteToReference(record);
  assert.equal(record.approvalState, "reference");

  ratifyCheck(record, "_BCLT_APPLIED", "no");
  assert.equal(record.approvalState, "pending_review");
  assert.equal(record.revisionState, "revised");
  assert.equal(record.labProofState, "pending_review");
  assert.ok(record.approval.reopenedAtUtc);
  assert.equal(record.approval.reopenedByMutationOrdinal, record.mutationLog.at(-1).ordinal);
  assert.equal(record.mutationLog.at(-1).approvalReset, true);
  assert.equal(referenceReadiness(record).ready, false);
  assert.equal(record.safeRuntimeHandoff.handoffState, "blocked");
  assert.equal(assertAuthorityRecord(record), true);
});

test("fingerprint preparation is immutable and applies GT/OPT aliases", async () => {
  for (const kind of ["GT", "OPT"]) {
    const original = syntheticRecord(kind);
    const prepared = await prepareAuthorityFingerprints(original, sourceContext(kind), sha256Provider);
    assert.equal(original.originSha256, null, `${kind} caller was mutated`);
    assert.match(prepared.originSha256, /^[0-9a-f]{64}$/);
    assert.equal(prepared.sourceFingerprint, prepared.originSha256);
    assert.equal(prepared.origin.fingerprint, prepared.originSha256);
    assert.equal(prepared.recordFingerprint, prepared.authorityRecordSha256);
    assert.equal(prepared.approvalState, "draft");
    assert.equal(prepared.approval.approvalFingerprint, null);
    assert.equal(prepared.safeRuntimeHandoff.handoffState, "blocked");
  }
});

test("fingerprint preparation rejects origin byte-length mismatch", async () => {
  const record = syntheticRecord("GT");
  await assert.rejects(
    prepareAuthorityFingerprints(
      record,
      { originBytes: ORIGIN_BYTES, expectedByteLength: ORIGIN_BYTES.byteLength + 1 },
      sha256Provider,
    ),
    /expectedByteLength must exactly match/,
  );
  assert.equal(record.originSha256, null);
  assert.equal(record.authorityRecordSha256, null);
});

test("MERGED fingerprint preparation is immutable and binds derivation into authority content", async () => {
  const original = syntheticRecord("MERGED");
  const prepared = await prepareAuthorityFingerprints(original, sourceContext("MERGED"), sha256Provider);
  assert.equal(original.derivationSha256, null);
  assert.equal(
    original.provenance.derivationReferences.some((entry) => entry.relation === "cryptographic_derivation_scope"),
    false,
  );
  assert.match(prepared.derivationSha256, /^[0-9a-f]{64}$/);
  assert.equal(prepared.sourceFingerprint, prepared.derivationSha256);
  assert.equal(
    prepared.provenance.derivationReferences.find((entry) => entry.relation === "cryptographic_derivation_scope")?.artifactSha256,
    prepared.derivationSha256,
  );
  assert.equal(prepared.recordFingerprint, prepared.authorityRecordSha256);
  assert.equal(prepared.approvalState, "draft");
  assert.equal(prepared.safeRuntimeHandoff.handoffState, "blocked");
});

test("cryptographic GT and OPT approval binds authority, approver, time and canonical checks", async () => {
  for (const kind of ["GT", "OPT"]) {
    const { original, approved } = await approveSynthetic(kind);
    assert.equal(original.approvalState, "draft");
    assert.equal(approved.approvalState, "reference");
    assert.equal(approved.recordFingerprint, approved.authorityRecordSha256);
    assert.equal(approved.sourceFingerprint, approved.originSha256);
    assert.match(approved.approval.approvalFingerprint, /^[0-9a-f]{64}$/);
    assert.equal(approved.approval.authorityRecordSha256, approved.authorityRecordSha256);
    assert.deepEqual(approved.approval.ratifiedChecks.map((entry) => entry.checkId), ["_BCLT_APPLIED", "_POWER_APPROVED"]);
    assert.equal(approved.safeRuntimeHandoff.handoffState, "ready");
    assert.equal(assertAuthorityRecord(approved), true);
  }
});

test("cryptographic approval rejects empty approver, invalid time and non-canonical checks", async () => {
  for (const [approval, pattern] of [
    [{ approverId: "" }, /approverId/],
    [{ approvedAtUtc: "2026-07-16T01:02:03Z" }, /UTC timestamp|approvedAtUtc/],
    [{ ratifiedChecks: [{ checkId: "_BCLT_APPLIED", decision: "no" }] }, /must exactly match/],
  ]) {
    const record = syntheticRecord("GT");
    await assert.rejects(
      promoteToCryptographicReference(
        record,
        sourceContext("GT"),
        approvalContext(approval),
        sha256Provider,
      ),
      pattern,
    );
    assert.equal(record.approvalState, "draft");
    assert.equal(record.authorityRecordSha256, null);
  }
});

test("cryptographic MERGED approval binds derivation and ordered parents", async () => {
  const { approved } = await approveSynthetic("MERGED");
  assert.equal(approved.originSha256, null);
  assert.equal(approved.origin.fingerprint, null);
  assert.match(approved.derivationSha256, /^[0-9a-f]{64}$/);
  assert.equal(approved.sourceFingerprint, approved.derivationSha256);
  assert.equal(
    approved.provenance.derivationReferences.find((entry) => entry.relation === "cryptographic_derivation_scope")?.artifactSha256,
    approved.derivationSha256,
  );
  assert.equal(approved.recordFingerprint, approved.authorityRecordSha256);
  assert.equal(approved.safeRuntimeHandoff.handoffState, "ready");
});

test("approval fingerprint changes with approver, time, or ratified decision", async () => {
  const base = (await approveSynthetic("GT")).approved.approval.approvalFingerprint;
  const changedTime = (await approveSynthetic("GT", {
    approval: { approvedAtUtc: "2026-07-16T01:02:03.005Z" },
  })).approved.approval.approvalFingerprint;
  const changedApprover = (await approveSynthetic("GT", {
    approval: { approverId: "actor:lab-approver:opaque-002" },
  })).approved.approval.approvalFingerprint;
  const changedDecision = (await approveSynthetic("GT", { bcltDecision: "no" })).approved.approval.approvalFingerprint;
  assert.notEqual(changedTime, base);
  assert.notEqual(changedApprover, base);
  assert.notEqual(changedDecision, base);
});

test("governed GT/OPT mutation preserves origin binding and clears authority approval bindings", async () => {
  for (const kind of ["GT", "OPT"]) {
    const { approved } = await approveSynthetic(kind);
    const originSha256 = approved.originSha256;
    ratifyCheck(approved, "_BCLT_APPLIED", "no", "test-mutator");
    assert.equal(approved.approvalState, "pending_review");
    assert.equal(approved.originSha256, originSha256);
    assert.equal(approved.sourceFingerprint, originSha256);
    assert.equal(approved.origin.fingerprint, originSha256);
    assert.equal(approved.authorityRecordSha256, null);
    assert.equal(approved.recordFingerprint, null);
    assert.equal(approved.approval.approvalFingerprint, null);
    assert.equal(approved.safeRuntimeHandoff.handoffState, "blocked");
    assert.ok(approved.approval.reopenedAtUtc);
  }
});

test("governed MERGED mutation clears derivation and authority bindings", async () => {
  const { approved } = await approveSynthetic("MERGED");
  ratifyCheck(approved, "_BCLT_APPLIED", "no", "test-mutator");
  assert.equal(approved.approvalState, "pending_review");
  assert.equal(approved.originSha256, null);
  assert.equal(approved.origin.fingerprint, null);
  assert.equal(approved.derivationSha256, null);
  assert.equal(approved.sourceFingerprint, null);
  assert.equal(
    approved.provenance.derivationReferences.some((entry) => entry.relation === "cryptographic_derivation_scope"),
    false,
  );
  assert.equal(approved.authorityRecordSha256, null);
  assert.equal(approved.recordFingerprint, null);
  assert.equal(approved.approval.approvalFingerprint, null);
  assert.equal(approved.safeRuntimeHandoff.handoffState, "blocked");
});
