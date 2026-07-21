import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_KEYWORD_DEFINITIONS,
  KEYWORD_PROFILE_ID,
} from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";
import {
  REFERENCE_DTO_SCHEMA_ID,
  REFERENCE_DTO_SCHEMA_VERSION,
} from "../../packages/lab-kernel/ies-toolkit/iesReferenceDto.js";
import {
  IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_ID,
  IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_VERSION,
  IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_ID,
  IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_VERSION,
  IES_REFERENCE_GENERATION_INSPECTION_STATES,
  buildIesFromReference,
  inspectIesReferenceForGeneration,
} from "../../packages/lab-kernel/ies-toolkit/iesFromReference.js";

const SHA_A = "a".repeat(64);
const SHA_B = "b".repeat(64);
const SHA_C = "c".repeat(64);
const SHA_D = "d".repeat(64);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function keywordRows(overrides = {}) {
  const values = {
    TEST: "AUTH-42",
    TESTLAB: "Novon Engineering",
    ISSUEDATE: "2026-07-16",
    MANUFAC: "Novon Lighting",
    LUMCAT: "NVB-OPT-42",
    LUMINAIRE: "NOVON LINEAR",
    LAMP: "NOVON LED",
    _CRI: "80",
    _COLORTEMP: "3500",
    _INTERNAL_AMBIENT_TA_C: "42",
    _DRIVER: "DRV-42",
    _DRIVER_SETTING: "700mA",
    _GEAR_TRAY_REF_ID: "NVB-REF-GT-000042",
    _OPTIC_REF_ID: "NVB-REF-OPT-000042",
    _EMERGENCY_VERIFIED: "yes",
    _EWIS_CARTRIDGE_VERIFIED: "yes",
    ...overrides,
  };
  return CANONICAL_KEYWORD_DEFINITIONS.map((definition) => ({
    key: definition.key,
    value: values[definition.key],
    owner: definition.owner,
  }));
}

function sealedReference({ keywordOverrides = {}, metadataOverrides = {}, baselineOverrides = {}, provenanceOverrides = {} } = {}) {
  const metadata = {
    G0: 1,
    G1: -1,
    G2: 1,
    G3: 3,
    G4: 1,
    G5: 1,
    G6: 2,
    G7: 0.1,
    G8: 0.001,
    G9: 0.05,
    G10: 1,
    G11: "1.11100",
    G12: 0.01,
    ...metadataOverrides,
  };
  const keywords = keywordRows(keywordOverrides);
  const keywordValue = (key) => keywords.find((row) => row.key === key)?.value ?? null;
  const numeric = (value) => value == null || value === "" ? null : Number(String(value).replace(/(?:\s*(?:K|C|°C|RA))$/i, ""));
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
      values: keywords,
    },
    metadata,
    angles: { v_angles: [0, 90, 180], h_angles: [0] },
    candela: [[0.1, 0.1, 0.1]],
    baseline: {
      cct: numeric(keywordValue("_COLORTEMP")),
      cri: numeric(keywordValue("_CRI")),
      internalAmbientTaC: numeric(keywordValue("_INTERNAL_AMBIENT_TA_C")),
      fluxPerMm: Number(metadata.G11),
      wallWattsPerMm: Number(metadata.G12),
      circuitWattsPerMm: Number(metadata.G10),
      ...baselineOverrides,
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
      ...provenanceOverrides,
    },
    referenceSha256: SHA_D,
  };
}

function assertBlocked(output, blocker) {
  assert.equal(output.schemaId, IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_ID);
  assert.equal(output.schemaVersion, IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_VERSION);
  assert.equal(output.state, IES_REFERENCE_GENERATION_INSPECTION_STATES.blockedFailClosed);
  assert.equal(output.inspectionId, null);
  assert.equal(output.referenceIdentity, null);
  assert.equal(output.baseline, null);
  assert.deepEqual(output.blockers, [blocker]);
  assert.equal(output.audit.schemaId, IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_ID);
  assert.equal(output.audit.schemaVersion, IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_VERSION);
  assert.equal(output.audit.accepted, false);
  assert.equal(output.safetyFlags.referenceValidated, false);
  assert.equal(output.safetyFlags.generatorInvoked, false);
  assert.equal(output.safetyFlags.iesGenerated, false);
}

test("exports the approved inspection contract alongside the unchanged generator", () => {
  assert.equal(IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_ID,
    "controlstack.lab.ies-reference-generation-inspection.v1");
  assert.equal(IES_REFERENCE_GENERATION_INSPECTION_SCHEMA_VERSION, 1);
  assert.equal(IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_ID,
    "controlstack.lab.ies-reference-generation-inspection-audit.v1");
  assert.equal(IES_REFERENCE_GENERATION_INSPECTION_AUDIT_SCHEMA_VERSION, 1);
  assert.equal(typeof inspectIesReferenceForGeneration, "function");
  assert.equal(typeof buildIesFromReference, "function");
});

test("inspects one complete sealed reference without returning its body", () => {
  const reference = sealedReference();
  const output = inspectIesReferenceForGeneration(reference);

  assert.equal(output.state, IES_REFERENCE_GENERATION_INSPECTION_STATES.readyReadOnly);
  assert.equal(output.inspectionId, `ies-reference-generation-inspection-v1:${SHA_D}`);
  assert.deepEqual(output.referenceIdentity, {
    schemaId: "controlstack.lab.reference-identity.v1",
    schemaVersion: 1,
    referenceId: "NVB-REF-OPT-000042",
    kind: "OPT",
    serial: 42,
    sealedAtUtc: "2026-07-16T10:11:12.000Z",
    authorityRecordSha256: SHA_A,
    referenceSha256: SHA_D,
    resolverPath: "/r/NVB-REF-OPT-000042",
    readOnly: true,
  });
  assert.equal(output.keywordProfileId, KEYWORD_PROFILE_ID);
  assert.deepEqual(output.baseline, {
    cct: 3500,
    cri: 80,
    internalAmbientTaC: 42,
    fluxPerMm: 1.111,
    wallWattsPerMm: 0.01,
    circuitWattsPerMm: 1,
    baselineLmPerM: 1111,
    baselineWallWattsPerM: 10,
    baselineCircuitWattsPerM: 1000,
  });
  assert.deepEqual(output.missingKeywordOverrides, []);
  assert.equal(output.materialisationWithoutOverrides, true);
  assert.equal(output.audit.accepted, true);
  assert.equal(output.audit.referenceValidated, true);
  assert.equal(output.audit.materialiseInvoked, false);
  assert.equal(output.safetyFlags.referenceValidated, true);
  assert.equal(output.safetyFlags.metadataReturned, false);
  assert.equal(output.safetyFlags.anglesReturned, false);
  assert.equal(output.safetyFlags.candelaReturned, false);
  assert.equal(output.safetyFlags.keywordValuesReturned, false);
  assert.equal(output.safetyFlags.provenancePathsReturned, false);
  assert.equal(output.safetyFlags.sealedReferenceReturned, false);
  assert.equal(output.safetyFlags.multiplierDerived, false);
  assert.equal(output.safetyFlags.generatorInvoked, false);
  assert.equal(output.safetyFlags.iesGenerated, false);
  assert.equal("metadata" in output, false);
  assert.equal("angles" in output, false);
  assert.equal("candela" in output, false);
  assert.equal("keywordValues" in output, false);
  assert.equal("provenanceRefs" in output, false);
  assert.doesNotMatch(JSON.stringify(output), /v_angles|h_angles|origin\.ies|authority\.json|700mA|NOVON LINEAR/);
  assertDeepFrozen(output);
});

test("reports the exact seven generator override names after sealed fallback", () => {
  const reference = sealedReference({
    keywordOverrides: {
      LUMCAT: null,
      LUMINAIRE: null,
      LAMP: null,
      _CRI: null,
      _COLORTEMP: null,
      _DRIVER: null,
      _DRIVER_SETTING: null,
    },
    baselineOverrides: {
      cct: null,
      cri: null,
    },
  });
  const output = inspectIesReferenceForGeneration(reference);

  assert.equal(output.state, IES_REFERENCE_GENERATION_INSPECTION_STATES.readyReadOnly);
  assert.deepEqual(output.missingKeywordOverrides, [
    "lumcat",
    "luminaire",
    "lamp",
    "cri",
    "cct",
    "driver",
    "driverSetting",
  ]);
  assert.equal(output.materialisationWithoutOverrides, false);
});

test("reports only missing project keywords while baseline supplies cct and cri", () => {
  const reference = sealedReference({
    keywordOverrides: {
      LUMCAT: null,
      LUMINAIRE: null,
      LAMP: null,
      _DRIVER: null,
      _DRIVER_SETTING: null,
    },
  });
  const output = inspectIesReferenceForGeneration(reference);

  assert.deepEqual(output.missingKeywordOverrides, [
    "lumcat",
    "luminaire",
    "lamp",
    "driver",
    "driverSetting",
  ]);
});

test("preserves valid zero baseline values", () => {
  const reference = sealedReference({
    keywordOverrides: {
      _CRI: "0",
      _COLORTEMP: "0",
      _INTERNAL_AMBIENT_TA_C: "0",
    },
    metadataOverrides: {
      G10: 0,
      G11: "0",
      G12: 0,
    },
  });
  const output = inspectIesReferenceForGeneration(reference);

  assert.equal(output.state, IES_REFERENCE_GENERATION_INSPECTION_STATES.readyReadOnly);
  assert.deepEqual(output.baseline, {
    cct: 0,
    cri: 0,
    internalAmbientTaC: 0,
    fluxPerMm: 0,
    wallWattsPerMm: 0,
    circuitWattsPerMm: 0,
    baselineLmPerM: 0,
    baselineWallWattsPerM: 0,
    baselineCircuitWattsPerM: 0,
  });
});

test("fails closed when a required non-overridable keyword is missing", () => {
  assertBlocked(
    inspectIesReferenceForGeneration(sealedReference({ keywordOverrides: { TEST: null } })),
    "required_generator_keyword_missing",
  );
  assertBlocked(
    inspectIesReferenceForGeneration(sealedReference({
      keywordOverrides: { _INTERNAL_AMBIENT_TA_C: null },
      baselineOverrides: { internalAmbientTaC: null },
    })),
    "required_generator_keyword_missing",
  );
});

test("reuses the exact generator validator and fails closed on invalid references", () => {
  const wrongSchema = sealedReference();
  wrongSchema.schemaVersion = 2;
  const pending = sealedReference();
  pending.approval.state = "pending_review";
  const nonOneMm = sealedReference({ metadataOverrides: { G8: 0.002 } });
  const malformedCandela = sealedReference();
  malformedCandela.candela[0].pop();
  const baselineMismatch = sealedReference({ baselineOverrides: { wallWattsPerMm: 0.02 } });
  const reorderedKeywords = sealedReference();
  [reorderedKeywords.keywordProfile.values[0], reorderedKeywords.keywordProfile.values[1]] = [
    reorderedKeywords.keywordProfile.values[1],
    reorderedKeywords.keywordProfile.values[0],
  ];
  const privateProvenance = sealedReference({
    provenanceOverrides: {
      evidenceIndex: { artifactRef: "C:\\private\\evidence.json" },
    },
  });

  const cases = [
    [wrongSchema, "invalid_reference_schema"],
    [pending, "reference_not_approved"],
    [nonOneMm, "reference_not_one_mm"],
    [malformedCandela, "candela_shape_mismatch"],
    [baselineMismatch, "baseline_binding_mismatch"],
    [reorderedKeywords, "invalid_keyword_profile"],
    [privateProvenance, "private_provenance_path_rejected"],
  ];
  for (const [reference, blocker] of cases) {
    assertBlocked(inspectIesReferenceForGeneration(reference), blocker);
  }
});

test("is repeatable and does not mutate or freeze the caller reference", () => {
  const reference = deepFreeze(sealedReference());
  const before = clone(reference);
  const first = inspectIesReferenceForGeneration(reference);
  const second = inspectIesReferenceForGeneration(reference);

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first), JSON.stringify(second));
  assert.deepEqual(reference, before);
  assert.equal(Object.isFrozen(reference), true);
});

test("the existing generator remains deterministic after inspection export", () => {
  const reference = sealedReference();
  const inspected = inspectIesReferenceForGeneration(reference);
  const generated = buildIesFromReference(reference, {
    runLengthMm: 2000,
    outputMultiplier: 1,
    selections: {},
  });

  assert.equal(inspected.state, IES_REFERENCE_GENERATION_INSPECTION_STATES.readyReadOnly);
  assert.equal(generated.ok, true);
  assert.match(generated.iesText, /^IESNA:LM-63-2019\n/);
  assert.equal(generated.provenance.referenceSha256, inspected.referenceIdentity.referenceSha256);
});

test("inspection implementation stops before job validation and materialisation", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesFromReference.js", import.meta.url),
    "utf8",
  );
  const start = source.indexOf("export function inspectIesReferenceForGeneration");
  const end = source.indexOf("export function buildIesFromReference", start);
  assert.ok(start >= 0 && end > start);
  const inspectionSource = source.slice(start, end);

  assert.match(inspectionSource, /validateReference\(reference\)/);
  assert.doesNotMatch(inspectionSource, /validateJob\s*\(/);
  assert.doesNotMatch(inspectionSource, /materialise\s*\(/);
  assert.doesNotMatch(inspectionSource, /buildIesFromReference\s*\(/);
  assert.doesNotMatch(inspectionSource, /iesText|filename|writeIes/);
  assert.doesNotMatch(inspectionSource, /metadata:|angles:|candela:|keywordValues:|provenanceRefs:/);
});
