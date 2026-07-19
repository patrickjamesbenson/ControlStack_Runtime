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
import { buildProjectIes } from "../../packages/lab-kernel/ies-toolkit/iesProjectIes.js";
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

function keywordRows() {
  const values = {
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
  };
  return CANONICAL_KEYWORD_DEFINITIONS.map((definition) => ({
    key: definition.key,
    value: values[definition.key],
    owner: definition.owner,
  }));
}

function sealedReference() {
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
      values: keywordRows(),
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
      parentReferences: [],
    },
    referenceSha256: SHA_D,
  };
}

function project(overrides = {}) {
  return {
    projectId: "JOB-1",
    outputMultiplier: 1.25,
    lumcat: "PROJECT-LUMCAT",
    luminaire: "LINEAR-4568",
    lamp: "NOVON-LINEAR",
    cri: "90",
    cct: "4000",
    driver: "DRV-1",
    driverSetting: "700mA",
    ...overrides,
  };
}

function generatorJob(projectInput, runLengthMm) {
  return {
    runLengthMm,
    outputMultiplier: projectInput.outputMultiplier,
    selections: {
      lumcat: projectInput.lumcat,
      luminaire: projectInput.luminaire,
      lamp: projectInput.lamp,
      cri: projectInput.cri,
      cct: projectInput.cct,
      driver: projectInput.driver,
      driverSetting: projectInput.driverSetting,
    },
  };
}

test("builds deterministic project IES through the committed sealed-reference generator", () => {
  const reference = sealedReference();
  const projectInput = project();
  const out = buildProjectIes(reference, 4568, projectInput);

  assert.equal(out.ok, true);
  assert.match(out.iesText, /^IESNA:LM-63-2019\n/);
  assert.deepEqual(out.keywords.map((row) => normalizeKeywordName(row.key)), CANONICAL_KEYWORDS);
  assert.equal(out.provenance.schema, "controlstack.project.ies-derivation.v1");
  assert.equal(out.provenance.projectId, "JOB-1");
  assert.equal(out.provenance.referenceId, reference.id);
  assert.equal(out.provenance.referenceKind, reference.kind);
  assert.equal(out.provenance.referenceSha256, reference.referenceSha256);
  assert.equal(out.provenance.runLengthMm, 4568);
  assert.equal(out.provenance.outputMultiplier, 1.25);

  const parsed = parseIes(out.iesText);
  assert.ok(Math.abs(parsed.photometry.candela[0][0] - 571) < 1e-9);
  assert.equal(parsed.photometry.geometry.G8, 4.568);
  assert.equal(parsed.photometry.geometry.G12, 57.1);
  assert.equal(out.inputWatts, 57.1);
});

test("preserves the committed generator output while replacing only provenance", () => {
  const reference = sealedReference();
  const projectInput = project();
  const projectOut = buildProjectIes(reference, 2000, projectInput);
  const generatorOut = buildIesFromReference(reference, generatorJob(projectInput, 2000));

  assert.equal(projectOut.ok, true);
  assert.equal(generatorOut.ok, true);
  for (const key of ["iesText", "filename", "runLengthMm", "outputMultiplier", "exitLumens", "inputWatts"]) {
    assert.deepEqual(projectOut[key], generatorOut[key]);
  }
  assert.deepEqual(projectOut.keywords, generatorOut.keywords);
  assert.notDeepEqual(projectOut.provenance, generatorOut.provenance);
});

test("fails closed on legacy references and malformed or unsupported project input", () => {
  const legacyReference = {
    approvalState: "reference",
    recordFingerprint: "legacy",
    photometry: sealedReference().candela,
  };
  const cases = [
    [legacyReference, 1000, project()],
    [sealedReference(), 1000, {}],
    [sealedReference(), 1000, []],
    [sealedReference(), 1000, project({ projectId: "" })],
    [sealedReference(), 1000, project({ projectId: "JOB-1\nOTHER" })],
    [sealedReference(), 1000, { ...project(), unsupported: true }],
    [sealedReference(), 1000.5, project()],
    [sealedReference(), 1000, project({ outputMultiplier: 0 })],
    [sealedReference(), 1000, project({ driver: { id: "DRV-1" } })],
  ];

  for (const [reference, runLengthMm, projectInput] of cases) {
    const out = buildProjectIes(reference, runLengthMm, projectInput);
    assert.equal(out.ok, false);
    assert.equal(typeof out.code, "string");
    assert.equal(typeof out.reason, "string");
    assert.equal("iesText" in out, false);
  }
});

test("is repeatable and does not mutate the sealed reference or project input", () => {
  const reference = deepFreeze(sealedReference());
  const projectInput = deepFreeze(project());
  const referenceBefore = deepClone(reference);
  const projectBefore = deepClone(projectInput);

  const first = buildProjectIes(reference, 2000, projectInput);
  const second = buildProjectIes(reference, 2000, projectInput);

  assert.equal(first.ok, true);
  assert.deepEqual(second, first);
  assert.deepEqual(reference, referenceBefore);
  assert.deepEqual(projectInput, projectBefore);
});

test("production adapter delegates generation and exposes no private-authority or persistence seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesProjectIes.js", import.meta.url),
    "utf8",
  );
  assert.equal(source.includes('from "./iesFromReference.js"'), true);
  for (const forbidden of [
    "approvalState", "labForm", "recordFingerprint", "scaleToLengthM", "writeIes", "computeMetrics",
    "node:fs", "writeFile", "appendFile", "localStorage", "sessionStorage", "indexedDB", "XMLHttpRequest", "fetch(",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
});
