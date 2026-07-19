import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/nvbReference.js";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function sealedReference(overrides = {}) {
  return {
    schemaId: "controlstack.lab.reference.1mm.v1",
    schemaVersion: 1,
    kind: "OPT",
    id: "NVB-REF-OPT-000042",
    serial: 42,
    sealedAtUtc: "2026-07-19T09:10:11.000Z",
    authorityRecordSha256: SHA_A,
    referenceSha256: SHA_B,
    approval: { state: "reference", approvedAtUtc: "2026-07-19T09:00:00.000Z" },
    candela: [[1]],
    angles: { v_angles: [0], h_angles: [0] },
    keywordProfile: { values: [{ key: "TEST", value: "private" }] },
    baseline: { wallWattsPerMm: 0.01 },
    evidence: [{ body: "private" }],
    diagnosticFingerprint: "safe-demo",
    privateAuthority: { approver: "private" },
    ...overrides,
  };
}

const exactExports = [
  "EVIDENCE_CAPABILITY_SCHEMA_ID",
  "EVIDENCE_CAPABILITY_SCHEMA_VERSION",
  "REFERENCE_IDENTITY_SCHEMA_ID",
  "REFERENCE_IDENTITY_SCHEMA_VERSION",
  "REFERENCE_KINDS",
  "RESOLVER_COMPONENT_KINDS",
  "ReferenceContractError",
  "buildResolverPath",
  "formatReferenceId",
  "parseReferenceId",
  "parseResolverPath",
  "projectReferenceIdentity",
  "summariseEvidenceCapabilities",
];

test("exports only the approved version-1 public interface and frozen constants", () => {
  assert.deepEqual(Object.keys(contract).sort(), exactExports.sort());
  assert.equal(contract.REFERENCE_IDENTITY_SCHEMA_ID, "controlstack.lab.reference-identity.v1");
  assert.equal(contract.REFERENCE_IDENTITY_SCHEMA_VERSION, 1);
  assert.equal(contract.EVIDENCE_CAPABILITY_SCHEMA_ID, "controlstack.lab.evidence-capability-summary.v1");
  assert.equal(contract.EVIDENCE_CAPABILITY_SCHEMA_VERSION, 1);
  assert.deepEqual(contract.REFERENCE_KINDS, ["GT", "OPT", "MERGED"]);
  assert.deepEqual(contract.RESOLVER_COMPONENT_KINDS, ["chip", "board", "driver", "converter"]);
  assert.equal(Object.isFrozen(contract.REFERENCE_KINDS), true);
  assert.equal(Object.isFrozen(contract.RESOLVER_COMPONENT_KINDS), true);
});

test("formats and parses canonical GT, OPT, and MERGED reference identities", () => {
  const cases = [
    ["GT", 1, "NVB-REF-GT-000001"],
    ["OPT", 42, "NVB-REF-OPT-000042"],
    ["MERGED", 999999, "NVB-REF-MRG-999999"],
  ];
  for (const [kind, serial, referenceId] of cases) {
    assert.equal(contract.formatReferenceId(kind, serial), referenceId);
    const parsed = contract.parseReferenceId(referenceId);
    assert.deepEqual(parsed, { referenceId, kind, serial });
    assertDeepFrozen(parsed);
    assert.equal(contract.formatReferenceId(parsed.kind, parsed.serial), referenceId);
  }
});

test("fails closed on invalid identity kinds, serials, and strings", () => {
  for (const [kind, serial] of [
    ["MRG", 1], ["GT", 0], ["OPT", -1], ["MERGED", 1.5], ["GT", 1000000], [null, 1],
  ]) {
    assert.throws(() => contract.formatReferenceId(kind, serial), contract.ReferenceContractError);
  }
  for (const value of [
    "NVB-REF-GT-000000",
    "NVB-REF-GT-1",
    "NVB-REF-GT-0000001",
    "NVB-REF-gt-000001",
    " NVB-REF-GT-000001",
    "NVB-REF-GT-+00001",
    "NVB-REF-XYZ-000001",
    "NVB-REF-OPT-00001.5",
    null,
  ]) {
    assert.equal(contract.parseReferenceId(value), null);
  }
});

test("projects the exact immutable safe identity from a sealed reference DTO", () => {
  const input = sealedReference();
  const before = deepClone(input);
  const output = contract.projectReferenceIdentity(input);

  assert.deepEqual(output, {
    schemaId: "controlstack.lab.reference-identity.v1",
    schemaVersion: 1,
    referenceId: "NVB-REF-OPT-000042",
    kind: "OPT",
    serial: 42,
    sealedAtUtc: "2026-07-19T09:10:11.000Z",
    authorityRecordSha256: SHA_A,
    referenceSha256: SHA_B,
    resolverPath: "/r/NVB-REF-OPT-000042",
    readOnly: true,
  });
  assert.deepEqual(input, before);
  assertDeepFrozen(output);
  for (const forbidden of [
    "candela", "angles", "keywordProfile", "baseline", "evidence", "diagnosticFingerprint", "privateAuthority",
    "emergency", "ewisCartridge",
  ]) {
    assert.equal(forbidden in output, false);
  }
});

test("rejects unsupported, unapproved, malformed, or mismatched sealed references", () => {
  const cases = [
    sealedReference({ schemaId: "legacy.reference.v1" }),
    sealedReference({ schemaVersion: 2 }),
    sealedReference({ approval: { state: "draft" } }),
    sealedReference({ sealedAtUtc: "2026-07-19T09:10:11Z" }),
    sealedReference({ sealedAtUtc: "2026-02-30T09:10:11.000Z" }),
    sealedReference({ authorityRecordSha256: "safe-demo" }),
    sealedReference({ referenceSha256: "A".repeat(64) }),
    sealedReference({ id: "NVB-REF-GT-000042" }),
    sealedReference({ kind: "MERGED" }),
    sealedReference({ serial: 41 }),
  ];
  for (const value of cases) {
    assert.throws(() => contract.projectReferenceIdentity(value), contract.ReferenceContractError);
  }
});

test("builds and parses every approved canonical resolver route", () => {
  const cases = [
    [{ kind: "reference", referenceId: "NVB-REF-GT-000001" }, "/r/NVB-REF-GT-000001"],
    [{ kind: "provenance", referenceId: "NVB-REF-OPT-000042" }, "/p/NVB-REF-OPT-000042"],
    [{ kind: "originIes", referenceId: "NVB-REF-MRG-000003" }, "/r/NVB-REF-MRG-000003/origin.ies"],
    [{ kind: "evidence", referenceId: "NVB-REF-OPT-000042", artifactName: "LM-79_report.pdf" }, "/r/NVB-REF-OPT-000042/evidence/LM-79_report.pdf"],
    [{ kind: "report", reportId: "LAB-20260719-001" }, "/reports/LAB-20260719-001"],
    [{ kind: "component", componentKind: "driver", componentId: "DRV-TRIDONIC-825" }, "/c/driver/DRV-TRIDONIC-825"],
    [{ kind: "source", sourceId: "LM-80_source.txt" }, "/s/LM-80_source.txt"],
  ];
  for (const [descriptor, path] of cases) {
    assert.equal(contract.buildResolverPath(descriptor), path);
    const parsed = contract.parseResolverPath(path);
    assert.deepEqual(parsed, descriptor);
    assertDeepFrozen(parsed);
    assert.equal(contract.buildResolverPath(parsed), path);
  }
});

test("rejects unsafe resolver descriptors and non-canonical paths", () => {
  const badDescriptors = [
    { kind: "reference", referenceId: "NVB-REF-GT-000000" },
    { kind: "reference", referenceId: "NVB-REF-GT-000001", host: "example.com" },
    { kind: "evidence", referenceId: "NVB-REF-GT-000001", artifactName: "../secret" },
    { kind: "report", reportId: "." },
    { kind: "component", componentKind: "battery", componentId: "BAT-1" },
    { kind: "component", componentKind: "driver", componentId: "DRV/1" },
    { kind: "source", sourceId: "x".repeat(129) },
    { kind: "unknown", sourceId: "SAFE" },
  ];
  for (const descriptor of badDescriptors) {
    assert.throws(() => contract.buildResolverPath(descriptor), contract.ReferenceContractError);
  }

  const badPaths = [
    "https://resolver.example/r/NVB-REF-GT-000001",
    "http://user:pass@example/r/NVB-REF-GT-000001",
    "file:///C:/secret",
    "C:\\secret\\file",
    "\\\\server\\share\\file",
    "/r/NVB-REF-GT-000001?x=1",
    "/r/NVB-REF-GT-000001#fragment",
    "/r//NVB-REF-GT-000001",
    "/r/NVB-REF-GT-000001/evidence/../secret",
    "/r/NVB-REF-GT-000001/evidence/%2e%2e",
    "/r/NVB-REF-GT-000001/evidence/a%2fb",
    "/r/NVB-REF-GT-000001/evidence/a%5cb",
    "/c/battery/BAT-1",
    "/reports/.",
    "/s/..",
    " /r/NVB-REF-GT-000001",
    "/unknown/value",
  ];
  for (const path of badPaths) assert.equal(contract.parseResolverPath(path), null, path);
});

test("summarises evidence readiness deterministically without assembly verification", () => {
  const input = {
    referenceId: "NVB-REF-OPT-000042",
    entries: [
      { evidenceType: "LM-79", status: "accepted" },
      { evidenceType: "LM-79", status: "accepted" },
      { evidenceType: "LM-80", status: "accepted" },
      { evidenceType: "TM-21", status: "rejected" },
      { evidenceType: "UNKNOWN-EVIDENCE", status: "accepted" },
      { evidenceType: "POWER", status: "unresolved" },
    ],
  };
  const before = deepClone(input);
  const output = contract.summariseEvidenceCapabilities(input);

  assert.deepEqual(output.capabilities.map((row) => row.capabilityId), [
    "general_optical_use_and_ies_scaling",
    "rated_life_l70_b10",
    "reference_optic_efficiency",
    "emergency_evidence_readiness",
  ]);
  assert.deepEqual(output.capabilities[0], {
    capabilityId: "general_optical_use_and_ies_scaling",
    state: "complete",
    requiredEvidenceTypes: ["LM-79"],
    missingEvidenceTypes: [],
  });
  assert.equal(output.capabilities[1].state, "incomplete");
  assert.deepEqual(output.capabilities[1].missingEvidenceTypes, ["TM-21"]);
  assert.equal(output.capabilities[2].state, "complete");
  assert.equal(output.capabilities[3].state, "incomplete");
  assert.deepEqual(output.capabilities[3].missingEvidenceTypes, [
    "THERMAL", "POWER", "BATTERY-COLD", "BATTERY-HOT", "EMERGENCY-CONVERTER",
  ]);
  assert.deepEqual(output.assemblyVerification, { emergency: null, ewisCartridge: null });
  assert.equal(output.readOnly, true);
  assert.deepEqual(input, before);
  assertDeepFrozen(output);
});

test("fails closed on malformed or conflicting evidence input", () => {
  const cases = [
    { referenceId: "NVB-REF-OPT-000000", entries: [] },
    { referenceId: "NVB-REF-OPT-000042", entries: {}, extra: true },
    { referenceId: "NVB-REF-OPT-000042", entries: [{ evidenceType: "lm-79", status: "accepted" }] },
    { referenceId: "NVB-REF-OPT-000042", entries: [{ evidenceType: "LM-79", status: "yes" }] },
    { referenceId: "NVB-REF-OPT-000042", entries: [{ evidenceType: "LM-79", status: "accepted", raw: "private" }] },
    {
      referenceId: "NVB-REF-OPT-000042",
      entries: [
        { evidenceType: "LM-79", status: "accepted" },
        { evidenceType: "LM-79", status: "rejected" },
      ],
    },
  ];
  for (const input of cases) {
    assert.throws(() => contract.summariseEvidenceCapabilities(input), contract.ReferenceContractError);
  }
});

test("production module contains no hosting, persistence, clock, random, legacy, or reverse-authority seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvbReference.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "node:fs", "node:http", "fetch(", "XMLHttpRequest", "localStorage", "sessionStorage", "indexedDB",
    "document.", "window.", "Date.now", "Math.random", "process.env", "http://", "https://", "file:",
    "controlstack.lab.reference.gear-tray.v1", "controlstack.lab.reference.optic.v1",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
  for (const retired of [
    "PROV_HOST", "refUrl", "LAB_STORE", "devHref", "urlFor", "newGearTrayRecord", "newOpticRecord",
    "provenanceContext", "emergencyCapable", "capabilities", "makeRefId", "parseRefId", "resolveKind",
  ]) {
    assert.equal(new RegExp(`export\\s+(?:const|function|class)\\s+${retired}\\b`).test(source), false, `${retired} must not be exported`);
  }
  for (const forbiddenApi of ["reconstructAuthority", "toAuthorityRecord", "restoreAuthority"]) {
    assert.equal(source.includes(forbiddenApi), false);
  }
});
