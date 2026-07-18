import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  APPROVAL_BINDING_HASH_DOMAIN,
  AUTHORITY_CONTENT_HASH_DOMAIN,
  DERIVATION_HASH_DOMAIN,
  REFERENCE_DTO_HASH_DOMAIN,
  buildApprovalBindingProjection,
  buildAuthorityHashProjection,
  buildDerivationProjection,
  createWebCryptoSha256Provider,
  hashApprovalBinding,
  hashAuthorityRecord,
  hashDerivationScope,
  hashOriginBytes,
  isOpaqueArtifactReference,
  validateSha256Hex,
} from "../../packages/lab-kernel/ies-toolkit/iesAuthorityFingerprint.js";

const textBytes = (value) => new TextEncoder().encode(value);
const sha256Provider = Object.freeze({
  async digest(bytes) {
    return new Uint8Array(createHash("sha256").update(bytes).digest());
  },
});

const ORIGIN_SHA = "1".repeat(64);
const PARENT_A_SHA = "a".repeat(64);
const PARENT_B_SHA = "b".repeat(64);

function sampleAuthorityRecord() {
  return {
    schemaId: "controlstack.lab.one-mm-ies-record.v1",
    schemaVersion: 1,
    recordId: "LAB-AUTH-0001",
    recordKind: "GT",
    approvalState: "draft",
    revisionState: "draft",
    oneMmNormalised: true,
    baseLengthM: 0.001,
    photometryMode: "normalise_1mm_candidate",
    labProofState: "pending",
    sourceFingerprint: "safe-source-diagnostic",
    recordFingerprint: "safe-record-diagnostic",
    authorityRecordSha256: "2".repeat(64),
    referenceSha256: "3".repeat(64),
    approvalFingerprint: "safe-approval-diagnostic",
    origin: {
      artifactRef: "lab/origins/source-0001/origin.ies",
      byteLength: 1234,
      mediaType: "text/plain",
      originSha256: ORIGIN_SHA,
      fingerprint: "safe-origin-diagnostic",
    },
    labForm: [
      {
        field: "[_OUTPUT_CHECK]",
        bareField: "_OUTPUT_CHECK",
        order: 2,
        value: "pass",
        source: "check-ratified",
        options: ["pending", "pass", "fail"],
        kind: "check",
        gatesReference: true,
      },
      {
        field: "[MANUFAC]",
        bareField: "MANUFAC",
        order: 1,
        value: "NOVON",
        source: "from-file",
        options: [],
        kind: "ies",
        gatesReference: true,
      },
    ],
    photometry: {
      h_angles: [0, 90],
      v_angles: [0, 45, 90],
      candela: [[100, 50, 0], [90, 45, 0]],
      geometry: {
        G12: 0.02,
        G11: "1.11100",
        G8: 0.001,
        G2: 1,
        G0: 1,
      },
    },
    recipe: {
      operation: "normalise_1mm_candidate",
      toolId: "lab-one-mm",
      toolVersion: "1.0.0",
      algorithm: "cyrb53-sorted-json-v0",
      paramsSummary: { oneMmNormalised: true, baseLengthM: 0.001 },
      decisions: { scaleCandela: true },
    },
    provenance: {
      sealing: {
        state: "diagnostic_sealed",
        sealedAtUtc: "2026-07-16T00:00:00.000Z",
        diagnosticAlgorithm: "cyrb53-sorted-json-v0",
        diagnosticBaselineFingerprint: "safe-before",
        diagnosticRecordFingerprint: "safe-after",
      },
      originReferences: [{
        relation: "exact_origin",
        artifactRef: "lab/origins/source-0001/origin.ies",
        byteLength: 1234,
        mediaType: "text/plain",
        originSha256: ORIGIN_SHA,
        fingerprint: "safe-reference-diagnostic",
      }],
      evidenceReferences: [{ evidenceId: "EVIDENCE-1", relation: "photometric_test" }],
      derivationReferences: [{ relation: "reference_engine", referenceId: "NVB-REF-GT-000045", referenceSha256: PARENT_A_SHA }],
      parentLineage: [],
    },
    mutationLog: [
      {
        ordinal: 2,
        toolId: "lab-ratify",
        toolVersion: "1.0.0",
        operation: "ratify-check",
        paramsSummary: { field: "_OUTPUT_CHECK", decision: "pass" },
        inputFingerprint: "safe-input-2",
        outputFingerprint: "safe-output-2",
        timestampUtc: "2026-07-16T00:02:00.000Z",
        actorType: "human_approved_tool_run",
        approvalReset: false,
      },
      {
        ordinal: 1,
        toolId: "lab-normalise",
        toolVersion: "1.0.0",
        operation: "normalise",
        paramsSummary: { targetLengthM: 0.001 },
        inputFingerprint: "safe-input-1",
        outputFingerprint: "safe-output-1",
        timestampUtc: "2026-07-16T00:01:00.000Z",
        actorType: "human_approved_tool_run",
        approvalReset: false,
      },
    ],
    approval: { approvedAtUtc: null, approvedByActorType: null },
    safeRuntimeHandoff: { diagnostic: true },
    unresolvedFields: ["/recordFingerprint"],
    uiState: { selectedTab: "authority" },
    workingSession: { dirty: true },
  };
}

function reverseObjectInsertion(value) {
  if (Array.isArray(value)) return value.map(reverseObjectInsertion);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).reverse().map(([key, child]) => [key, reverseObjectInsertion(child)]),
  );
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function sampleApproval() {
  return {
    authorityRecordSha256: "c".repeat(64),
    state: "reference",
    approvedAtUtc: "2026-07-16T01:02:03.004Z",
    approverId: "actor:patrick-benson:lab-approver",
    ratifiedChecks: [
      { checkId: "Z_CHECK", decision: "pass" },
      { field: "[A_CHECK]", decision: "accepted" },
    ],
  };
}

function sampleDerivation() {
  return {
    operation: "merge_authority_records",
    mode: "MERGED",
    geometryRegistration: {
      units: "mm",
      axis: "longitudinal",
      offsets: [0, 1200],
    },
    parentInstances: [
      {
        parentId: "LAB-PARENT-A",
        parentKind: "GT",
        role: "base",
        quantity: 1,
        ordinal: 1,
        referenceSha256: PARENT_A_SHA,
      },
      {
        parentId: "LAB-PARENT-B",
        parentKind: "OPT",
        role: "optic",
        quantity: 1,
        ordinal: 2,
        referenceSha256: PARENT_B_SHA,
      },
    ],
    artifactReferences: [
      { artifactRef: "lab/artifacts/merge-0001/registration.json", role: "geometry_registration" },
    ],
    recipe: { overlapMode: "registered", candelaMode: "ordered-composition" },
    algorithm: "controlstack.merge.v1",
    kernelId: "lab-kernel",
  };
}

test("declares the four fixed structured hash domains", () => {
  assert.equal(AUTHORITY_CONTENT_HASH_DOMAIN, "controlstack.lab.authority-content.v1");
  assert.equal(APPROVAL_BINDING_HASH_DOMAIN, "controlstack.lab.approval-binding.v1");
  assert.equal(REFERENCE_DTO_HASH_DOMAIN, "controlstack.lab.reference-dto.v1");
  assert.equal(DERIVATION_HASH_DOMAIN, "controlstack.lab.derivation.v1");
});

test("hashOriginBytes matches the standard SHA-256 abc vector", async () => {
  assert.equal(
    await hashOriginBytes(textBytes("abc"), 3, sha256Provider),
    "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
  );
});

test("origin hashing distinguishes CRLF, LF, and BOM presence", async () => {
  const lf = textBytes("LINE1\nLINE2\n");
  const crlf = textBytes("LINE1\r\nLINE2\r\n");
  const bomLf = new Uint8Array([0xef, 0xbb, 0xbf, ...lf]);
  const hashes = await Promise.all([
    hashOriginBytes(lf, lf.length, sha256Provider),
    hashOriginBytes(crlf, crlf.length, sha256Provider),
    hashOriginBytes(bomLf, bomLf.length, sha256Provider),
  ]);
  assert.equal(new Set(hashes).size, 3);
});

test("origin hashing preserves zero and non-UTF-8 bytes", async () => {
  const exact = new Uint8Array([0x00, 0xff, 0x80, 0x0a]);
  const changed = new Uint8Array([0x00, 0xfe, 0x80, 0x0a]);
  assert.notEqual(
    await hashOriginBytes(exact, 4, sha256Provider),
    await hashOriginBytes(changed, 4, sha256Provider),
  );
});

test("origin hashing uses the exact view byte range", async () => {
  const backing = new Uint8Array([9, 1, 2, 3, 9]);
  const view = new Uint8Array(backing.buffer, 1, 3);
  assert.equal(
    await hashOriginBytes(view, 3, sha256Provider),
    await hashOriginBytes(new Uint8Array([1, 2, 3]), 3, sha256Provider),
  );
});

test("origin hashing rejects byte-length mismatches", async () => {
  await assert.rejects(
    hashOriginBytes(new Uint8Array([1, 2, 3]), 4, sha256Provider),
    /byte length mismatch/i,
  );
});

test("digest providers must return exactly 32 Uint8Array bytes", async () => {
  await assert.rejects(
    hashOriginBytes(new Uint8Array(), 0, { async digest() { return new Uint8Array(31); } }),
    /exactly 32 bytes/,
  );
  await assert.rejects(
    hashOriginBytes(new Uint8Array(), 0, { async digest() { return new ArrayBuffer(32); } }),
    /must resolve to a Uint8Array/,
  );
});

test("authority projection is explicit, domain-separated, and mutation-ordered", () => {
  const projection = buildAuthorityHashProjection(sampleAuthorityRecord());
  assert.equal(projection.hashDomain, AUTHORITY_CONTENT_HASH_DOMAIN);
  assert.equal(projection.sourceBinding.originSha256, ORIGIN_SHA);
  assert.equal(projection.photometry.geometry.G11, "1.11100");
  assert.deepEqual(projection.mutationLog.map((entry) => entry.ordinal), [1, 2]);
  assert.equal("approvalState" in projection, false);
  assert.equal("authorityRecordSha256" in projection, false);
  assert.equal("fingerprint" in projection.sourceBinding, false);
  assert.equal("sealing" in projection.provenance, false);
  assert.equal("algorithm" in projection.recipe, false);
  assert.equal("inputFingerprint" in projection.mutationLog[0], false);
  assert.equal("timestampUtc" in projection.mutationLog[0], false);
});

test("authority hashing is deterministic and independent of object insertion order", async () => {
  const record = sampleAuthorityRecord();
  assert.equal(
    await hashAuthorityRecord(record, sha256Provider),
    await hashAuthorityRecord(reverseObjectInsertion(record), sha256Provider),
  );
});

test("authority values, candela, lexical G11, and recipe changes alter the digest", async () => {
  const base = sampleAuthorityRecord();
  const baseHash = await hashAuthorityRecord(base, sha256Provider);

  const authorityValue = clone(base);
  authorityValue.labForm[1].value = "OTHER";

  const candela = clone(base);
  candela.photometry.candela[0][0] = 101;

  const g11 = clone(base);
  g11.photometry.geometry.G11 = "1.1110";

  const recipe = clone(base);
  recipe.recipe.paramsSummary.baseLengthM = 0.002;

  for (const changed of [authorityValue, candela, g11, recipe]) {
    assert.notEqual(await hashAuthorityRecord(changed, sha256Provider), baseHash);
  }
});

test("diagnostic, lifecycle, runtime, UI, and self-field changes do not alter authority digest", async () => {
  const base = sampleAuthorityRecord();
  const changed = clone(base);
  changed.sourceFingerprint = "safe-source-changed";
  changed.recordFingerprint = "safe-record-changed";
  changed.origin.fingerprint = "safe-origin-changed";
  changed.authorityRecordSha256 = "4".repeat(64);
  changed.referenceSha256 = "5".repeat(64);
  changed.approvalFingerprint = "safe-approval-changed";
  changed.approvalState = "reference";
  changed.revisionState = "current";
  changed.labProofState = "complete";
  changed.approval.approvedAtUtc = "2026-07-16T05:00:00.000Z";
  changed.safeRuntimeHandoff = { changed: true };
  changed.unresolvedFields = [];
  changed.uiState.selectedTab = "other";
  changed.workingSession.dirty = false;
  changed.provenance.sealing.diagnosticRecordFingerprint = "safe-different";
  changed.provenance.sealing.sealedAtUtc = "2026-07-16T06:00:00.000Z";
  changed.mutationLog[0].inputFingerprint = "safe-new-input";
  changed.mutationLog[0].outputFingerprint = "safe-new-output";
  changed.mutationLog[0].timestampUtc = "2026-07-16T07:00:00.000Z";

  assert.equal(
    await hashAuthorityRecord(changed, sha256Provider),
    await hashAuthorityRecord(base, sha256Provider),
  );
});

test("opaque artifact references reject local, file URL, UNC, absolute, and traversal paths", () => {
  for (const value of [
    "C:\\Lab\\origin.ies",
    "C:relative\\origin.ies",
    "D:/Lab/origin.ies",
    "file:///tmp/origin.ies",
    "\\\\server\\share\\origin.ies",
    "/tmp/origin.ies",
    "lab/origins/../secret.ies",
  ]) {
    assert.equal(isOpaqueArtifactReference(value), false, value);
  }
  assert.equal(isOpaqueArtifactReference("lab/origins/source-0001/origin.ies"), true);

  const record = sampleAuthorityRecord();
  record.origin.artifactRef = "C:\\Lab\\origin.ies";
  assert.throws(() => buildAuthorityHashProjection(record), /opaque repository or store reference/);
});

test("governed subobjects reject diagnostic fingerprints, raw working data, and disguised local artifact paths", () => {
  const diagnostic = sampleAuthorityRecord();
  diagnostic.recipe.paramsSummary.legacyDigest = "safe-deadbeef";
  assert.throws(() => buildAuthorityHashProjection(diagnostic), /diagnostic fingerprint or algorithm value/);

  const raw = sampleAuthorityRecord();
  raw.recipe.decisions.rawBytes = [1, 2, 3];
  assert.throws(() => buildAuthorityHashProjection(raw), /diagnostic or raw working data/);

  const local = sampleAuthorityRecord();
  local.recipe.decisions.artifactRef = "C:\\Lab\\decision.json";
  assert.throws(() => buildAuthorityHashProjection(local), /opaque repository or store reference/);
});

test("authority mutation ordinals must be unique and contiguous from one", () => {
  const record = sampleAuthorityRecord();
  record.mutationLog[0].ordinal = 3;
  assert.throws(() => buildAuthorityHashProjection(record), /unique and contiguous from 1/);
});

test("approval binding validates exact fields and deterministically orders ratified checks", () => {
  const projection = buildApprovalBindingProjection(sampleApproval());
  assert.equal(projection.hashDomain, APPROVAL_BINDING_HASH_DOMAIN);
  assert.deepEqual(projection.ratifiedChecks.map((entry) => entry.checkId), ["A_CHECK", "Z_CHECK"]);

  assert.throws(
    () => buildApprovalBindingProjection({ ...sampleApproval(), state: "approved" }),
    /exactly "reference"/,
  );
  assert.throws(
    () => buildApprovalBindingProjection({ ...sampleApproval(), approvedAtUtc: "2026-07-16T01:02:03Z" }),
    /YYYY-MM-DDTHH:mm:ss.sssZ/,
  );
  assert.throws(
    () => buildApprovalBindingProjection({ ...sampleApproval(), approverId: "   " }),
    /non-empty string/,
  );
  assert.throws(
    () => buildApprovalBindingProjection({ ...sampleApproval(), authorityRecordSha256: "C".repeat(64) }),
    /lowercase raw 64-character/,
  );
});

test("approval binding changes for time, approver, authority hash, or ratified decision", async () => {
  const base = sampleApproval();
  const baseHash = await hashApprovalBinding(base, sha256Provider);
  const variants = [
    { ...base, approvedAtUtc: "2026-07-16T01:02:03.005Z" },
    { ...base, approverId: "actor:other" },
    { ...base, authorityRecordSha256: "d".repeat(64) },
    {
      ...base,
      ratifiedChecks: [
        { checkId: "Z_CHECK", decision: "fail" },
        { field: "[A_CHECK]", decision: "accepted" },
      ],
    },
  ];
  for (const variant of variants) {
    assert.notEqual(await hashApprovalBinding(variant, sha256Provider), baseHash);
  }

  const reordered = { ...base, ratifiedChecks: [...base.ratifiedChecks].reverse() };
  assert.equal(await hashApprovalBinding(reordered, sha256Provider), baseHash);
});

test("MERGED derivation binds ordered parents, references, recipe, and kernel identity", () => {
  const projection = buildDerivationProjection(sampleDerivation());
  assert.equal(projection.hashDomain, DERIVATION_HASH_DOMAIN);
  assert.deepEqual(projection.parentInstances.map((parent) => parent.parentId), ["LAB-PARENT-A", "LAB-PARENT-B"]);
  assert.equal(projection.parentInstances[0].referenceSha256, PARENT_A_SHA);
  assert.equal(projection.artifactReferences[0].artifactRef, "lab/artifacts/merge-0001/registration.json");
  assert.equal(projection.algorithm, "controlstack.merge.v1");
  assert.equal(projection.kernelId, "lab-kernel");
});

test("parent order is provenance-significant in derivation version 1", async () => {
  const base = sampleDerivation();
  const reversed = clone(base);
  reversed.parentInstances.reverse();
  assert.notEqual(
    await hashDerivationScope(base, sha256Provider),
    await hashDerivationScope(reversed, sha256Provider),
  );
});

test("derivation artifact references reject raw local paths", () => {
  const input = sampleDerivation();
  input.artifactReferences[0].artifactRef = "../outside/registration.json";
  assert.throws(() => buildDerivationProjection(input), /opaque repository or store reference/);
});

test("all returned digests are lowercase raw 64-character hexadecimal", async () => {
  const values = await Promise.all([
    hashOriginBytes(textBytes("abc"), 3, sha256Provider),
    hashAuthorityRecord(sampleAuthorityRecord(), sha256Provider),
    hashApprovalBinding(sampleApproval(), sha256Provider),
    hashDerivationScope(sampleDerivation(), sha256Provider),
  ]);
  for (const value of values) {
    assert.equal(validateSha256Hex(value), true);
    assert.match(value, /^[0-9a-f]{64}$/);
  }
  assert.equal(validateSha256Hex("A".repeat(64)), false);
  assert.equal(validateSha256Hex("a".repeat(63)), false);
});

test("Web Crypto provider fails clearly when subtle SHA-256 is unavailable", () => {
  assert.throws(() => createWebCryptoSha256Provider({}), /Web Crypto SHA-256 is unavailable/);
});

test("Slice 4A production modules contain no actual node imports", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const actualNodeImport = /(?:from\s+|import\s*\(|require\s*\()\s*["']node:/;
  for (const filename of ["iesCanonicalJson.js", "iesAuthorityFingerprint.js"]) {
    const content = readFileSync(resolve(here, "../../packages/lab-kernel/ies-toolkit", filename), "utf8");
    assert.equal(actualNodeImport.test(content), false, `${filename} contains a node: import`);
  }
});
