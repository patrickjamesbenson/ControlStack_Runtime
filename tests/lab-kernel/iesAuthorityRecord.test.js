import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

import { buildOneMmRecord } from "../../packages/lab-kernel/ies-toolkit/iesLabForm.js";
import {
  AUTHORITY_TOP_LEVEL_FIELDS,
  DERIVATION_BINDING_RELATION,
  assertAuthorityRecord,
  refreshUnresolvedFields,
  validateAuthorityRecord,
} from "../../packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js";
import { promoteToReference } from "../../packages/lab-kernel/ies-toolkit/iesApproval.js";
import { sealOrigin } from "../../packages/lab-kernel/ies-toolkit/iesProvenance.js";
import { buildSafeHandoff, refreshSafeRuntimeHandoff } from "../../packages/lab-kernel/ies-toolkit/iesHandoff.js";

const modelFor = (testType) => ({
  meta: { keywords_order: [
    { key: "[MANUFAC]", value: "NOVON" },
    { key: "[_TEST_TYPE]", value: testType },
    { key: "[_ENGINE_ID]", value: "NVB-REF-GT-000045" },
  ] },
  photometry: {
    v_angles: [0, 90, 180],
    h_angles: [0],
    candela: [[100, 50, 0]],
    geometry: { G8: 1, G12: 20 },
  },
});

const FORM = [
  { ies_order: "1", field: "[MANUFAC]", inputs: "", kind: "ies", gates_reference: "y" },
  { ies_order: "2", field: "[_TEST_TYPE]", inputs: "Base Engine, Base Engine & Optic, No Base Luminaire", kind: "lab", gates_reference: "y" },
  { ies_order: "3", field: "[_ENGINE_ID]", inputs: "", kind: "lab", gates_reference: "n" },
];

const UNRESOLVED_LAB_FORM = [
  { ies_order: "1", field: "[MANUFAC]", inputs: "", kind: "ies", gates_reference: "y" },
  { ies_order: "2", field: "[_TEST_TYPE]", inputs: "Base Engine, Base Engine & Optic", kind: "lab" },
];

function build(testType, options = {}) {
  return buildOneMmRecord(modelFor(testType), {
    baseLabForm: FORM,
    recordId: "LAB-AUTH-0001",
    origin: {
      artifactRef: "lab/origins/source-0001/origin.ies",
      byteLength: 1234,
      mediaType: "text/plain",
      fingerprint: null,
    },
    ...options,
  });
}

function buildWithUnresolvedTestType() {
  return buildOneMmRecord({
    meta: { keywords_order: [{ key: "[MANUFAC]", value: "NOVON" }] },
    photometry: {
      v_angles: [0, 90, 180],
      h_angles: [0],
      candela: [[100, 50, 0]],
      geometry: { G8: 1, G12: 20 },
    },
  }, {
    baseLabForm: UNRESOLVED_LAB_FORM,
    recordId: "LAB-AUTH-UNRESOLVED-0001",
    recordKind: "GT",
    origin: {
      artifactRef: "lab/origins/unresolved-0001/origin.ies",
      byteLength: 1234,
      mediaType: "text/plain",
      fingerprint: null,
    },
  });
}

const ORIGIN_SHA = "a".repeat(64);
const AUTHORITY_SHA = "b".repeat(64);
const DERIVATION_SHA = "c".repeat(64);

function refresh(record) {
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  return record;
}

test("builds the complete rich authority-record shape", () => {
  const record = build("Base Engine & Optic");
  assert.deepEqual(Object.keys(record).sort(), [...AUTHORITY_TOP_LEVEL_FIELDS].sort());
  assert.equal(record.schemaId, "controlstack.lab.one-mm-ies-record.v1");
  assert.equal(record.schemaVersion, 1);
  assert.equal(record.recordKind, "OPT");
  assert.equal(record.oneMmNormalised, true);
  assert.equal(record.baseLengthM, 0.001);
  assert.equal(record.photometry.geometry.G8, 0.001);
  assert.equal(record.originSha256, null);
  assert.equal(record.authorityRecordSha256, null);
  assert.equal(record.derivationSha256, null);
  assert.equal(record.sourceFingerprint, null);
  assert.equal(record.recordFingerprint, null);
  assert.equal(record.origin.fingerprint, null);
  assert.equal("recordType" in record, false);
  assert.equal("referenceEngineId" in record, false);
  assert.equal("mutationLog" in record.provenance, false);
  assert.equal(record.provenance.derivationReferences[0].referenceId, "NVB-REF-GT-000045");
  assert.deepEqual(record.safeRuntimeHandoff, buildSafeHandoff(record));
  assert.equal(assertAuthorityRecord(record), true);
});

test("maps supported record kinds without coercing No Base Luminaire", () => {
  assert.equal(build("Base Engine").recordKind, "GT");
  assert.equal(build("Base Engine & Optic").recordKind, "OPT");

  const merged = buildOneMmRecord(modelFor(""), {
    baseLabForm: FORM,
    recordKind: "MERGED",
    parentLineage: [{ recordId: "PARENT-A" }, { recordId: "PARENT-B" }],
  });
  assert.equal(merged.recordKind, "MERGED");
  assert.equal(assertAuthorityRecord(merged), true);

  const noBase = build("No Base Luminaire");
  assert.equal(noBase.recordKind, null);
  assert.ok(noBase.unresolvedFields.includes("/recordKind"));
});

test("origin metadata rejects raw bytes and local filesystem paths", () => {
  assert.throws(
    () => buildOneMmRecord(modelFor("Base Engine"), { baseLabForm: FORM, origin: { exactBytes: new Uint8Array([1]) } }),
    /must not contain raw origin data/,
  );
  assert.throws(
    () => buildOneMmRecord(modelFor("Base Engine"), { baseLabForm: FORM, origin: { artifactRef: "C:\\Lab\\origin.ies" } }),
    /not a local filesystem path/,
  );
});

test("unresolved fields are sorted unique JSON Pointers", () => {
  const record = build("Base Engine & Optic");
  assert.deepEqual(record.unresolvedFields, [
    "/authorityRecordSha256",
    "/origin/fingerprint",
    "/originSha256",
    "/recordFingerprint",
    "/sourceFingerprint",
  ]);
  assert.equal(new Set(record.unresolvedFields).size, record.unresolvedFields.length);
});

test("unresolved Lab authority values coexist with Slice 4B cryptographic pointers", () => {
  const record = buildWithUnresolvedTestType();
  assert.deepEqual(record.unresolvedFields, [
    "/authorityRecordSha256",
    "/labForm/_TEST_TYPE",
    "/origin/fingerprint",
    "/originSha256",
    "/recordFingerprint",
    "/sourceFingerprint",
  ]);
  assert.ok(record.unresolvedFields.includes("/labForm/_TEST_TYPE"));
  assert.deepEqual(record.unresolvedFields, [...record.unresolvedFields].sort());
  assert.equal(new Set(record.unresolvedFields).size, record.unresolvedFields.length);
  assert.ok(record.unresolvedFields.every((pointer) => /^\/(?:[^~]|~[01])*$/.test(pointer)));
});

test("fingerprint-field preparation and validation do not resolve unrelated Lab values", () => {
  const record = buildWithUnresolvedTestType();
  record.originSha256 = ORIGIN_SHA;
  record.sourceFingerprint = ORIGIN_SHA;
  record.origin.fingerprint = ORIGIN_SHA;
  record.authorityRecordSha256 = AUTHORITY_SHA;
  record.recordFingerprint = AUTHORITY_SHA;
  refresh(record);

  assert.deepEqual(record.unresolvedFields, ["/labForm/_TEST_TYPE"]);
  assert.ok(record.unresolvedFields.includes("/labForm/_TEST_TYPE"));
  assert.equal(validateAuthorityRecord(record).ok, true);
});

test("validation fails closed on one-millimetre and mutation ownership drift", () => {
  const wrongLength = build("Base Engine");
  wrongLength.photometry.geometry.G8 = 1;
  assert.equal(validateAuthorityRecord(wrongLength).ok, false);

  const duplicateMutationOwner = build("Base Engine");
  duplicateMutationOwner.provenance.mutationLog = [];
  assert.match(validateAuthorityRecord(duplicateMutationOwner).errors.join(" "), /second mutation log/);
});

test("explicit SHA fields and GT/OPT compatibility aliases validate exact equality", () => {
  for (const kind of ["GT", "OPT"]) {
    const record = build(kind === "GT" ? "Base Engine" : "Base Engine & Optic");
    record.originSha256 = ORIGIN_SHA;
    record.sourceFingerprint = ORIGIN_SHA;
    record.origin.fingerprint = ORIGIN_SHA;
    record.authorityRecordSha256 = AUTHORITY_SHA;
    record.recordFingerprint = AUTHORITY_SHA;
    refresh(record);
    assert.equal(validateAuthorityRecord(record).ok, true, kind);

    record.sourceFingerprint = "d".repeat(64);
    refresh(record);
    assert.match(validateAuthorityRecord(record).errors.join(" "), /exactly equal originSha256/);
  }
});

test("MERGED source binding uses derivationSha256 and keeps origin SHA fields null", () => {
  const record = buildOneMmRecord(modelFor(""), {
    baseLabForm: FORM,
    recordId: "LAB-MERGED-0001",
    recordKind: "MERGED",
    parentLineage: [{ recordId: "PARENT-A" }, { recordId: "PARENT-B" }],
  });
  record.derivationSha256 = DERIVATION_SHA;
  record.sourceFingerprint = DERIVATION_SHA;
  record.provenance.derivationReferences.push({
    relation: DERIVATION_BINDING_RELATION,
    artifactSha256: DERIVATION_SHA,
  });
  record.authorityRecordSha256 = AUTHORITY_SHA;
  record.recordFingerprint = AUTHORITY_SHA;
  refresh(record);
  assert.equal(validateAuthorityRecord(record).ok, true);

  record.originSha256 = ORIGIN_SHA;
  refresh(record);
  assert.match(validateAuthorityRecord(record).errors.join(" "), /must keep originSha256/);
});

test("diagnostic hashes are rejected as authority SHA values", () => {
  for (const diagnostic of ["safe-deadbeef", "rec-123", "prov-123", "cd-123", "fnv1a-deadbeef", "cyrb53-deadbeef"]) {
    const record = build("Base Engine");
    record.originSha256 = diagnostic;
    record.sourceFingerprint = diagnostic;
    record.origin.fingerprint = diagnostic;
    refresh(record);
    assert.equal(validateAuthorityRecord(record).ok, false, diagnostic);
  }
});

test("compatibility-only promotion remains valid but cryptographically non-sealable", () => {
  const record = build("Base Engine");
  sealOrigin(record, "2026-07-16T00:00:00.000Z");
  assert.equal(promoteToReference(record, "2026-07-16T01:00:00.000Z").ok, true);
  assert.equal(record.approvalState, "reference");
  assert.equal(record.authorityRecordSha256, null);
  assert.equal(record.approval.approvalFingerprint, null);
  assert.equal(record.safeRuntimeHandoff.handoffState, "blocked");
  assert.equal(validateAuthorityRecord(record).ok, true);
});

test("browser-reachable Slice 4B production modules contain no actual node imports", () => {
  const here = dirname(fileURLToPath(import.meta.url));
  const paths = [
    "iesAuthorityRecord.js",
    "iesLabForm.js",
    "iesProvenance.js",
    "iesApproval.js",
    "iesHandoff.js",
    "iesReferenceDto.js",
  ];
  const actualNodeImport = /(?:from\s+|import\s*\(|require\s*\()\s*["']node:/;
  for (const filename of paths) {
    const content = readFileSync(resolve(here, "../../packages/lab-kernel/ies-toolkit", filename), "utf8");
    assert.equal(actualNodeImport.test(content), false, `${filename} contains a node: import`);
  }
});
