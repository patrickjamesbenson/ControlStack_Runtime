import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_KEYWORD_DEFINITIONS,
  CANONICAL_KEYWORDS,
  KEYWORD_PROFILE_ID,
  normalizeKeywordName,
} from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";
import {
  REFERENCE_DTO_SCHEMA_ID,
  REFERENCE_DTO_SCHEMA_VERSION,
} from "../../packages/lab-kernel/ies-toolkit/iesReferenceDto.js";
import { buildIesFromReference } from "../../packages/lab-kernel/ies-toolkit/iesFromReference.js";
import { parseIes } from "../../packages/lab-kernel/ies-toolkit/iesParse.js";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const SHA_C = "c".repeat(64);
const SHA_D = "d".repeat(64);

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function keywordRows(overrides = {}) {
  const defaults = {
    TEST: "AUTH-42",
    TESTLAB: "Novon Engineering",
    ISSUEDATE: "2026-07-16",
    MANUFAC: "Novon Lighting",
    LUMCAT: null,
    LUMINAIRE: null,
    LAMP: null,
    _CRI: "80",
    _COLORTEMP: "3500",
    _INTERNAL_AMBIENT_TA_C: "42",
    _DRIVER: null,
    _DRIVER_SETTING: null,
    _GEAR_TRAY_REF_ID: "NVB-REF-GT-000042",
    _OPTIC_REF_ID: "NVB-REF-OPT-000042",
    _EMERGENCY_VERIFIED: "yes",
    _EWIS_CARTRIDGE_VERIFIED: "yes",
    ...overrides,
  };
  return CANONICAL_KEYWORD_DEFINITIONS.map((definition) => ({
    key: definition.key,
    value: defaults[definition.key],
    owner: definition.owner,
  }));
}

function sealedReference(keywordOverrides = {}) {
  return {
    schemaId: REFERENCE_DTO_SCHEMA_ID,
    schemaVersion: REFERENCE_DTO_SCHEMA_VERSION,
    kind: "OPT",
    id: "NVB-REF-OPT-000042",
    serial: 42,
    sealedAtUtc: "2026-07-16T10:11:12.000Z",
    authorityRecordSha256: SHA_A,
    originSha256: SHA_B,
    derivationSha256: null,
    approval: {
      state: "reference",
      approvedAtUtc: "2026-07-16T10:10:00.000Z",
      approvalFingerprint: SHA_C,
    },
    keywordProfile: {
      profileId: KEYWORD_PROFILE_ID,
      values: keywordRows(keywordOverrides),
    },
    metadata: {
      G0: 1, G1: -1, G2: 1, G3: 3, G4: 1, G5: 1, G6: 2,
      G7: 0.1, G8: 0.001, G9: 0.05, G10: 1, G11: "1.11100", G12: 0.01,
    },
    angles: { v_angles: [0, 90, 180], h_angles: [0] },
    candela: [[0.1, 0.1, 0.1]],
    baseline: {
      cct: 3500,
      cri: 80,
      internalAmbientTaC: 42,
      fluxPerMm: 1.111,
      wallWattsPerMm: 0.01,
      circuitWattsPerMm: 1,
    },
    provenanceRefs: {
      authorityRecord: { artifactRef: "lab/references/NVB-REF-OPT-000042/authority.json" },
      originIes: { artifactRef: "lab/references/NVB-REF-OPT-000042/origin.ies" },
      evidenceIndex: null,
      mutationLog: null,
      parentReferences: [{
        relation: "reference_engine",
        referenceId: "NVB-REF-GT-000042",
        kind: "GT",
        referenceSha256: SHA_D,
        artifactRef: null,
        ordinal: 1,
      }],
    },
    referenceSha256: SHA_D,
  };
}

function completeJob(overrides = {}) {
  return {
    runLengthMm: 2000,
    outputMultiplier: 1,
    selections: {
      lumcat: "SEL-123",
      luminaire: "LINEAR-2000",
      lamp: "NOVON-LINEAR",
      cri: "90",
      cct: "4000",
      driver: "DRV-1",
      driverSetting: "700mA",
    },
    ...overrides,
  };
}

const prohibited = [
  "_AMBIENT_TA_C", "_EMERGENCY_CAPABLE", "_BCLT_APPLIED", "_FLAGS_CHECKED", "_POWER_APPROVED",
  "_SERIALNUMBER", "_REFERENCE", "_LENGTH_MM", "_INPUT_WATTS", "_EXIT_LUMENS", "_PROJECT",
  "LENGTH_MM", "INPUT_WATTS", "EXIT_LUMENS", "FILE_EXTRA",
];

test("materialises deterministic LM-63 output from the committed sealed-reference DTO contract", () => {
  const out = buildIesFromReference(sealedReference(), completeJob());

  assert.equal(out.ok, true);
  assert.match(out.iesText, /^IESNA:LM-63-2019\n/);
  const keys = out.keywords.map((row) => normalizeKeywordName(row.key));
  assert.deepEqual(keys, CANONICAL_KEYWORDS);
  assert.equal(out.keywords.find((row) => normalizeKeywordName(row.key) === "_INTERNAL_AMBIENT_TA_C")?.value, "42");
  for (const key of prohibited) {
    assert.equal(keys.includes(key), false, `${key} must not be emitted`);
    assert.equal(out.iesText.includes(`[${key}]`), false, `${key} must not be written`);
  }

  const parsed = parseIes(out.iesText);
  assert.ok(Math.abs(parsed.photometry.candela[0][0] - 200) < 1e-9);
  assert.equal(parsed.photometry.geometry.G8, 2);
  assert.equal(parsed.photometry.geometry.G12, 20);
  assert.equal(out.filename, "SEL-123_940_2000mm_20W.ies");
  assert.equal(out.provenance.schema, "controlstack.lab.ies-from-reference.v1");
  assert.equal(out.provenance.referenceId, "NVB-REF-OPT-000042");
  assert.equal(out.provenance.referenceSha256, SHA_D);
  assert.equal(out.provenance.runLengthMm, 2000);
});

test("uses sealed keyword authority and falls back only to the sealed baseline", () => {
  const reference = sealedReference({ _INTERNAL_AMBIENT_TA_C: null });
  reference.baseline.internalAmbientTaC = 41;
  const out = buildIesFromReference(reference, completeJob());

  assert.equal(out.ok, true);
  assert.equal(out.keywords.find((row) => normalizeKeywordName(row.key) === "_INTERNAL_AMBIENT_TA_C")?.value, "41");
  assert.equal(out.iesText.includes("[TEST] AUTH-42"), true);
  assert.equal(out.iesText.includes("[TESTLAB] Novon Engineering"), true);
});

test("is repeatable and does not mutate sealed reference or job input", () => {
  const reference = deepFreeze(sealedReference());
  const job = deepFreeze(completeJob());
  const referenceBefore = deepClone(reference);
  const jobBefore = deepClone(job);

  const first = buildIesFromReference(reference, job);
  const second = buildIesFromReference(reference, job);

  assert.equal(first.ok, true);
  assert.deepEqual(second, first);
  assert.deepEqual(reference, referenceBefore);
  assert.deepEqual(job, jobBefore);
});

test("fails closed on legacy, unapproved, incomplete, or malformed reference inputs", () => {
  const legacy = {
    schemaId: REFERENCE_DTO_SCHEMA_ID,
    metadata: sealedReference().metadata,
    angles: sealedReference().angles,
    candela: sealedReference().candela,
    keywords: { TEST: "legacy" },
  };
  const pending = sealedReference();
  pending.approval.state = "pending_review";
  const incomplete = sealedReference();
  delete incomplete.referenceSha256;
  const malformed = sealedReference();
  malformed.candela[0].pop();
  const reordered = sealedReference();
  [reordered.keywordProfile.values[0], reordered.keywordProfile.values[1]] = [
    reordered.keywordProfile.values[1], reordered.keywordProfile.values[0],
  ];

  for (const candidate of [legacy, pending, incomplete, malformed, reordered]) {
    const out = buildIesFromReference(candidate, completeJob());
    assert.equal(out.ok, false);
    assert.equal(typeof out.code, "string");
    assert.equal(typeof out.reason, "string");
    assert.equal("iesText" in out, false);
  }
});

test("fails closed on invalid run parameters, unsupported fields, and incomplete canonical output", () => {
  const cases = [
    completeJob({ runLengthMm: 0 }),
    completeJob({ runLengthMm: Number.NaN }),
    completeJob({ runLengthMm: 1000.5 }),
    completeJob({ outputMultiplier: 0 }),
    { ...completeJob(), unexpected: true },
    { ...completeJob(), selections: { ...completeJob().selections, ambient: "99" } },
    { ...completeJob(), selections: { ...completeJob().selections, driver: undefined } },
  ];

  for (const job of cases) {
    const out = buildIesFromReference(sealedReference(), job);
    assert.equal(out.ok, false);
    assert.equal("iesText" in out, false);
  }
});

test("production module has no direct filesystem, network, or browser-storage persistence seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesFromReference.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "node:fs", "writeFile", "appendFile", "localStorage", "sessionStorage", "indexedDB", "XMLHttpRequest", "fetch(",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
});
