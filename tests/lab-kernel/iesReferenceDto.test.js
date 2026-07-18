import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { createAuthorityRecord, refreshUnresolvedFields } from "../../packages/lab-kernel/ies-toolkit/iesAuthorityRecord.js";
import {
  promoteToCryptographicReference,
  promoteToReference,
  ratifyCheck,
} from "../../packages/lab-kernel/ies-toolkit/iesApproval.js";
import { sealOrigin } from "../../packages/lab-kernel/ies-toolkit/iesProvenance.js";
import { refreshSafeRuntimeHandoff } from "../../packages/lab-kernel/ies-toolkit/iesHandoff.js";
import {
  REFERENCE_DTO_SCHEMA_ID,
  REFERENCE_DTO_SCHEMA_VERSION,
  sealAuthorityToReferenceDto,
} from "../../packages/lab-kernel/ies-toolkit/iesReferenceDto.js";
import { CANONICAL_KEYWORD_DEFINITIONS } from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";

const ORIGIN_BYTES = new TextEncoder().encode("IESNA:LM-63-2019\r\nSYNTHETIC AUTHORITY\r\n");
const PARENT_A_SHA = "a".repeat(64);
const PARENT_B_SHA = "b".repeat(64);
const EVIDENCE_SHA = "c".repeat(64);
const MUTATION_SHA = "d".repeat(64);

const sha256Provider = Object.freeze({
  async digest(bytes) {
    return new Uint8Array(createHash("sha256").update(bytes).digest());
  },
});

const KEYWORD_VALUES = Object.freeze({
  TEST: "LAB-TEST-0001",
  TESTLAB: "ControlStack Lab",
  ISSUEDATE: "2026-07-16",
  MANUFAC: "NOVON",
  LUMCAT: "SYNTH-CAT",
  LUMINAIRE: "Synthetic One Millimetre Reference",
  LAMP: "Synthetic LED",
  _CRI: "90",
  _COLORTEMP: "4000",
  _INTERNAL_AMBIENT_TA_C: "25",
  _DRIVER: null,
  _DRIVER_SETTING: null,
  _GEAR_TRAY_REF_ID: "NVB-REF-GT-000001",
  _OPTIC_REF_ID: null,
  _EMERGENCY_VERIFIED: "not-applicable",
  _EWIS_CARTRIDGE_VERIFIED: "not-applicable",
});

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function reverseObjectInsertion(value) {
  if (Array.isArray(value)) return value.map(reverseObjectInsertion);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(
    Object.entries(value).reverse().map(([key, child]) => [key, reverseObjectInsertion(child)]),
  );
}

function keywordRows(kind) {
  return CANONICAL_KEYWORD_DEFINITIONS.map((definition, index) => ({
    field: `[${definition.key}]`,
    bareField: definition.key,
    order: index + 1,
    value: definition.key === "_OPTIC_REF_ID" && kind === "OPT"
      ? "NVB-REF-OPT-000001"
      : KEYWORD_VALUES[definition.key],
    owner: definition.owner,
    source: KEYWORD_VALUES[definition.key] == null ? "sealed-null" : "synthetic-authority",
    options: [],
    kind: "lab",
    gatesReference: false,
  }));
}

function labValueRow({
  bareField = "_TEST_TYPE",
  value = null,
  source = "needs-lab-input",
  kind = "lab",
  gatesReference = false,
} = {}) {
  return {
    field: `[${bareField}]`,
    bareField,
    order: 200,
    value,
    source,
    options: [],
    kind,
    gatesReference,
  };
}

function parentLineage(kind) {
  if (kind === "OPT") {
    return [{
      relation: "reference_engine",
      referenceId: "NVB-REF-GT-000001",
      recordKind: "GT",
      referenceSha256: PARENT_A_SHA,
      ordinal: 1,
    }];
  }
  if (kind === "MERGED") {
    return [
      {
        role: "base",
        parentId: "NVB-REF-GT-000001",
        parentKind: "GT",
        referenceSha256: PARENT_A_SHA,
        ordinal: 1,
      },
      {
        role: "optic",
        parentId: "NVB-REF-OPT-000001",
        parentKind: "OPT",
        referenceSha256: PARENT_B_SHA,
        ordinal: 2,
      },
    ];
  }
  return [];
}

function createSyntheticDraft(kind = "GT", mutateDraft = null, additionalLabRows = []) {
  const lineage = parentLineage(kind);
  const record = createAuthorityRecord({
    recordId: `LAB-${kind}-AUTHORITY-0001`,
    recordKind: kind,
    origin: kind === "MERGED"
      ? { artifactRef: null, byteLength: null, mediaType: null, fingerprint: null }
      : {
        artifactRef: `lab/origins/${kind.toLowerCase()}-authority-0001/origin.ies`,
        byteLength: ORIGIN_BYTES.byteLength,
        mediaType: "text/plain",
        fingerprint: null,
      },
    labForm: [
      ...keywordRows(kind),
      {
        field: "[_BCLT_APPLIED]",
        bareField: "_BCLT_APPLIED",
        order: 100,
        value: "pending",
        source: "check-pending",
        options: ["pending", "yes", "no"],
        kind: "check",
        gatesReference: true,
      },
      {
        field: "[_POWER_APPROVED]",
        bareField: "_POWER_APPROVED",
        order: 101,
        value: "pending",
        source: "check-pending",
        options: ["pending", "circuit", "wall"],
        kind: "check",
        gatesReference: true,
      },
      ...additionalLabRows.map(clone),
    ],
    photometry: {
      v_angles: [0, 90, 180],
      h_angles: [0, 90],
      candela: [[100, 50, 0], [90, 45, 0]],
      geometry: {
        G0: 1,
        G1: 1,
        G2: 1,
        G3: 3,
        G4: 2,
        G5: 1,
        G6: 0.1,
        G7: 0.1,
        G8: 0.001,
        G9: 1,
        G10: 0.019,
        G11: "1.11100",
        G12: 0.02,
      },
    },
    recipe: {
      operation: kind === "MERGED" ? "merge_authority_records" : "normalise_1mm_candidate",
      paramsSummary: { oneMmNormalised: true, baseLengthM: 0.001 },
    },
    parentLineage: lineage,
    derivationReferences: kind === "OPT" ? lineage : [],
    evidenceReferences: [{ evidenceId: "EVIDENCE-1", relation: "photometric_test", privateBody: "strip-me" }],
  });
  sealOrigin(record, "2026-07-16T00:00:00.000Z");
  ratifyCheck(record, "_BCLT_APPLIED", "yes", "test-actor");
  ratifyCheck(record, "_POWER_APPROVED", "circuit", "test-actor");
  if (typeof mutateDraft === "function") mutateDraft(record);
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
          {
            parentId: "NVB-REF-GT-000001",
            parentKind: "GT",
            role: "base",
            ordinal: 1,
            referenceSha256: PARENT_A_SHA,
          },
          {
            parentId: "NVB-REF-OPT-000001",
            parentKind: "OPT",
            role: "optic",
            ordinal: 2,
            referenceSha256: PARENT_B_SHA,
          },
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
    approverId: "actor:reference-approver:opaque-001",
    ratifiedChecks: [
      { checkId: "_POWER_APPROVED", decision: "circuit" },
      { checkId: "_BCLT_APPLIED", decision: "yes" },
    ],
    ...overrides,
  };
}

async function approve(kind = "GT", mutateDraft = null, approvalOverrides = {}, additionalLabRows = []) {
  const draft = createSyntheticDraft(kind, mutateDraft, additionalLabRows);
  const result = await promoteToCryptographicReference(
    draft,
    sourceContext(kind),
    approvalContext(approvalOverrides),
    sha256Provider,
  );
  assert.equal(result.ok, true, JSON.stringify(result.blockers || []));
  return result.authorityRecord;
}

function sealContext(kind = "GT", overrides = {}) {
  const prefix = kind === "MERGED" ? "MRG" : kind;
  const base = {
    identity: {
      referenceId: `NVB-REF-${prefix}-000001`,
      kind,
      serial: 1,
      allocationRef: `allocations/${kind.toLowerCase()}/000001`,
    },
    sealedAtUtc: "2026-07-16T02:03:04.005Z",
    artifacts: {
      authorityRecord: { artifactRef: `authority/${kind.toLowerCase()}/000001.json` },
      originIes: kind === "MERGED" ? null : { artifactRef: `origins/${kind.toLowerCase()}/000001.ies` },
      evidenceIndex: { artifactRef: `evidence/${kind.toLowerCase()}/000001.json`, sha256: EVIDENCE_SHA },
      mutationLog: { artifactRef: `mutations/${kind.toLowerCase()}/000001.json`, sha256: MUTATION_SHA },
    },
  };
  return {
    ...base,
    ...overrides,
    identity: { ...base.identity, ...(overrides.identity || {}) },
    artifacts: { ...base.artifacts, ...(overrides.artifacts || {}) },
  };
}

async function seal(kind = "GT", options = {}) {
  const record = options.record || await approve(kind, options.mutateDraft, options.approvalOverrides);
  const context = options.context || sealContext(kind, options.contextOverrides);
  return sealAuthorityToReferenceDto(record, context, sha256Provider);
}

test("successfully seals a GT authority into the complete fixed DTO", async () => {
  const dto = await seal("GT");
  assert.deepEqual(Object.keys(dto), [
    "schemaId", "schemaVersion", "kind", "id", "serial", "sealedAtUtc",
    "authorityRecordSha256", "originSha256", "derivationSha256", "approval",
    "keywordProfile", "metadata", "angles", "candela", "baseline", "provenanceRefs",
    "referenceSha256",
  ]);
  assert.equal(dto.schemaId, REFERENCE_DTO_SCHEMA_ID);
  assert.equal(dto.schemaVersion, REFERENCE_DTO_SCHEMA_VERSION);
  assert.equal(dto.kind, "GT");
  assert.equal(dto.id, "NVB-REF-GT-000001");
  assert.equal(dto.serial, 1);
  assert.match(dto.authorityRecordSha256, /^[0-9a-f]{64}$/);
  assert.match(dto.originSha256, /^[0-9a-f]{64}$/);
  assert.equal(dto.derivationSha256, null);
  assert.match(dto.referenceSha256, /^[0-9a-f]{64}$/);
  assert.equal(dto.approval.state, "reference");
  assert.equal(dto.metadata.G11, "1.11100");
  assert.equal(dto.baseline.wallWattsPerMm, dto.metadata.G12);
  assert.equal(dto.provenanceRefs.parentReferences.length, 0);
});

test("successfully seals OPT with gear-tray lineage", async () => {
  const dto = await seal("OPT");
  assert.equal(dto.kind, "OPT");
  assert.equal(dto.id, "NVB-REF-OPT-000001");
  assert.equal(dto.provenanceRefs.parentReferences.length, 1);
  assert.equal(dto.provenanceRefs.parentReferences[0].referenceId, "NVB-REF-GT-000001");
  assert.equal(dto.provenanceRefs.parentReferences[0].referenceSha256, PARENT_A_SHA);
  assert.ok(dto.provenanceRefs.originIes);
});

test("successfully seals MERGED with two ordered parents", async () => {
  const dto = await seal("MERGED");
  assert.equal(dto.kind, "MERGED");
  assert.equal(dto.id, "NVB-REF-MRG-000001");
  assert.equal(dto.originSha256, null);
  assert.match(dto.derivationSha256, /^[0-9a-f]{64}$/);
  assert.equal(dto.provenanceRefs.originIes, null);
  assert.deepEqual(
    dto.provenanceRefs.parentReferences.map((entry) => entry.referenceId),
    ["NVB-REF-GT-000001", "NVB-REF-OPT-000001"],
  );
});

test("seals with a non-gating unresolved Lab-form value and preserves the source inventory", async () => {
  const record = await approve("GT", null, {}, [labValueRow()]);
  const context = sealContext("GT");
  const before = clone(record);
  const contextBefore = clone(context);
  assert.ok(record.unresolvedFields.includes("/labForm/_TEST_TYPE"));
  assert.equal(record.labForm.find((row) => row.bareField === "_TEST_TYPE").gatesReference, false);

  const dto = await sealAuthorityToReferenceDto(record, context, sha256Provider);
  assert.equal(dto.kind, "GT");
  assert.ok(record.unresolvedFields.includes("/labForm/_TEST_TYPE"));
  assert.deepEqual(record, before);
  assert.deepEqual(context, contextBefore);
});

test("rejects invalid rich authority schema and non-one-millimetre authority", async () => {
  const invalidSchema = await approve("GT");
  invalidSchema.schemaId = "wrong.schema";
  refreshSafeRuntimeHandoff(invalidSchema);
  await assert.rejects(
    sealAuthorityToReferenceDto(invalidSchema, sealContext("GT"), sha256Provider),
    /Invalid rich authority schema|authorityRecordSha256 is stale/,
  );

  const notOneMm = await approve("GT");
  notOneMm.baseLengthM = 1;
  refreshSafeRuntimeHandoff(notOneMm);
  await assert.rejects(
    sealAuthorityToReferenceDto(notOneMm, sealContext("GT"), sha256Provider),
    /one-millimetre|Invalid rich authority schema|stale/,
  );
});

test("rejects compatibility-only approval", async () => {
  const record = createSyntheticDraft("GT");
  assert.equal(promoteToReference(record, "2026-07-16T01:02:03.004Z").ok, true);
  await assert.rejects(
    sealAuthorityToReferenceDto(record, sealContext("GT"), sha256Provider),
    /unresolved|SHA-256|cryptographic|Invalid rich authority schema/,
  );
});

test("rejects pending-review and stale or malformed approval fingerprints", async () => {
  const pending = await approve("GT");
  ratifyCheck(pending, "_BCLT_APPLIED", "no", "test-mutator");
  await assert.rejects(
    sealAuthorityToReferenceDto(pending, sealContext("GT"), sha256Provider),
    /pending review|Invalid rich authority schema|unresolved/,
  );

  const stale = await approve("GT");
  stale.approval.approverId = "actor:changed-after-approval";
  refreshSafeRuntimeHandoff(stale);
  await assert.rejects(
    sealAuthorityToReferenceDto(stale, sealContext("GT"), sha256Provider),
    /Approval fingerprint is stale or malformed/,
  );

  const malformed = await approve("GT");
  malformed.approval.approvalFingerprint = "safe-stale";
  refreshUnresolvedFields(malformed);
  refreshSafeRuntimeHandoff(malformed);
  await assert.rejects(
    sealAuthorityToReferenceDto(malformed, sealContext("GT"), sha256Provider),
    /Invalid rich authority schema|SHA-256/,
  );
});

test("rejects a post-approval MERGED derivation alias swap", async () => {
  const record = await approve("MERGED");
  record.derivationSha256 = "e".repeat(64);
  record.sourceFingerprint = record.derivationSha256;
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  assert.equal(record.safeRuntimeHandoff.handoffState, "blocked");
  await assert.rejects(
    sealAuthorityToReferenceDto(record, sealContext("MERGED"), sha256Provider),
    /derivation binding|Invalid rich authority schema|stale/,
  );
});

test("rejects invalid allocation context and identity/kind/serial mismatch", async () => {
  const record = await approve("GT");
  const missingAllocation = sealContext("GT");
  delete missingAllocation.identity.allocationRef;
  for (const context of [
    missingAllocation,
    sealContext("GT", { identity: { allocationRef: "" } }),
    sealContext("GT", { identity: { referenceId: "NVB-REF-OPT-000001" } }),
    sealContext("GT", { identity: { kind: "OPT" } }),
    sealContext("GT", { identity: { serial: 2 } }),
    sealContext("GT", { identity: { serial: 0 } }),
  ]) {
    await assert.rejects(
      sealAuthorityToReferenceDto(record, context, sha256Provider),
      /allocation|identity|Reference identity|serial|kind/,
    );
  }
});

test("rejects invalid seal date and missing or local artifact references", async () => {
  const record = await approve("GT");
  const contexts = [
    sealContext("GT", { sealedAtUtc: "2026-07-16T02:03:04Z" }),
    sealContext("GT", { artifacts: { authorityRecord: null } }),
    sealContext("GT", { artifacts: { authorityRecord: { artifactRef: "C:\\Lab\\authority.json" } } }),
    sealContext("GT", { artifacts: { authorityRecord: { artifactRef: "C:relative\\authority.json" } } }),
    sealContext("GT", { artifacts: { authorityRecord: { artifactRef: "\\\\server\\share\\authority.json" } } }),
    sealContext("GT", { artifacts: { authorityRecord: { artifactRef: "/tmp/authority.json" } } }),
    sealContext("GT", { artifacts: { originIes: { artifactRef: "file:///tmp/origin.ies" } } }),
    sealContext("GT", { artifacts: { evidenceIndex: { artifactRef: "../private/evidence.json", sha256: EVIDENCE_SHA } } }),
  ];
  for (const context of contexts) {
    await assert.rejects(
      sealAuthorityToReferenceDto(record, context, sha256Provider),
      /YYYY-MM-DD|artifact|opaque|local|required/,
    );
  }
});

test("rejects blocking unresolved fields", async () => {
  const record = await approve("GT");
  const row = record.labForm.find((entry) => entry.bareField === "_BCLT_APPLIED");
  row.value = "pending";
  row.source = "check-pending";
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);
  assert.ok(record.unresolvedFields.includes("/labForm/_BCLT_APPLIED"));

  await assert.rejects(
    sealAuthorityToReferenceDto(record, sealContext("GT"), sha256Provider),
    (error) => {
      assert.equal(error.code, "blocking_unresolved_fields");
      assert.deepEqual(error.details?.blockingUnresolvedFields, ["/labForm/_BCLT_APPLIED"]);
      return true;
    },
  );
});

test("fails closed when a Lab-form unresolved pointer has no corresponding row", async () => {
  const record = createSyntheticDraft("GT");
  assert.equal(record.labForm.some((row) => row.bareField === "_TEST_TYPE"), false);
  record.unresolvedFields = [...record.unresolvedFields, "/labForm/_TEST_TYPE"].sort();
  refreshSafeRuntimeHandoff(record);

  await assert.rejects(
    promoteToCryptographicReference(
      record,
      sourceContext("GT"),
      approvalContext(),
      sha256Provider,
    ),
    (error) => {
      assert.equal(error.name, "AuthorityRecordError");
      assert.equal(error.code, "invalid_authority_record");
      assert.match(error.message, /canonical unresolved-field projection/);
      return true;
    },
  );
});

test("fails closed on unknown or malformed unresolved pointers", async () => {
  for (const pointer of ["/futureAuthorityField", "/labForm/~2MALFORMED"]) {
    const record = await approve("GT");
    record.unresolvedFields = [...record.unresolvedFields, pointer].sort();
    refreshSafeRuntimeHandoff(record);
    await assert.rejects(
      sealAuthorityToReferenceDto(record, sealContext("GT"), sha256Provider),
      (error) => {
        assert.equal(error.code, "invalid_authority_schema");
        return true;
      },
    );
  }
});

test("keeps cryptographic and source-binding unresolved pointers blocking", async () => {
  const record = await approve("GT");
  record.originSha256 = null;
  record.sourceFingerprint = null;
  record.origin.fingerprint = null;
  refreshUnresolvedFields(record);
  refreshSafeRuntimeHandoff(record);

  await assert.rejects(
    sealAuthorityToReferenceDto(record, sealContext("GT"), sha256Provider),
    (error) => {
      assert.equal(error.code, "blocking_unresolved_fields");
      assert.deepEqual(error.details?.blockingUnresolvedFields, [
        "/origin/fingerprint",
        "/originSha256",
        "/sourceFingerprint",
      ]);
      return true;
    },
  );
});

test("emits the exact 16-entry canonical keyword order and owners", async () => {
  const dto = await seal("GT");
  assert.equal(dto.keywordProfile.profileId, "controlstack.lab.ies-keywords.v1");
  assert.equal(dto.keywordProfile.values.length, 16);
  assert.deepEqual(
    dto.keywordProfile.values.map(({ key, owner }) => ({ key, owner })),
    CANONICAL_KEYWORD_DEFINITIONS.map(({ key, owner }) => ({ key, owner })),
  );
  assert.equal(dto.keywordProfile.values.find((entry) => entry.key === "_DRIVER").value, null);
});

test("rejects keyword owner mismatch, supplementary keywords and missing canonical entries", async () => {
  const ownerMismatch = await approve("GT", (record) => {
    record.labForm.find((row) => row.bareField === "MANUFAC").owner = "wrong-owner";
  });
  await assert.rejects(
    sealAuthorityToReferenceDto(ownerMismatch, sealContext("GT"), sha256Provider),
    /owner must be/,
  );

  const supplementary = await approve("GT", (record) => {
    record.labForm.push({
      field: "[_SECRET_SAUCE]", bareField: "_SECRET_SAUCE", order: 50, value: "private",
      source: "file-extra", options: [], kind: "ies", gatesReference: false,
    });
  });
  await assert.rejects(
    sealAuthorityToReferenceDto(supplementary, sealContext("GT"), sha256Provider),
    /Supplementary keyword/,
  );

  const missing = await approve("GT", (record) => {
    record.labForm = record.labForm.filter((row) => row.bareField !== "LUMCAT");
  });
  await assert.rejects(
    sealAuthorityToReferenceDto(missing, sealContext("GT"), sha256Provider),
    /Canonical keyword LUMCAT is missing/,
  );
});

test("preserves lexical G11 values", async () => {
  const dto = await seal("GT", {
    mutateDraft(record) {
      record.photometry.geometry.G11 = "1.11100";
    },
  });
  assert.equal(dto.metadata.G11, "1.11100");
});

test("rejects G3/G4 mismatch, angle ordering and candela dimensions", async () => {
  const cases = [
    {
      record: await approve("GT", (record) => { record.photometry.geometry.G3 = 2; }),
      pattern: /G3\/G4|angle counts/,
    },
    {
      record: await approve("GT", (record) => { record.photometry.v_angles = [0, 90, 45]; }),
      pattern: /strictly increasing/,
    },
    {
      record: await approve("GT", (record) => { record.photometry.candela = [[100, 50, 0]]; }),
      pattern: /row count/,
    },
    {
      record: await approve("GT", (record) => { record.photometry.candela[0] = [100, 50]; }),
      pattern: /row 0 length/,
    },
  ];
  for (const { record, pattern } of cases) {
    await assert.rejects(
      sealAuthorityToReferenceDto(record, sealContext("GT"), sha256Provider),
      pattern,
    );
  }
});

test("rejects negative or non-finite candela", async () => {
  const negative = await approve("GT", (record) => { record.photometry.candela[0][0] = -1; });
  await assert.rejects(
    sealAuthorityToReferenceDto(negative, sealContext("GT"), sha256Provider),
    /finite and non-negative/,
  );

  await assert.rejects(
    approve("GT", (record) => { record.photometry.candela[0][0] = Number.NaN; }),
    /non-finite|canonical/i,
  );
});

test("rejects baseline and G12 inconsistency", async () => {
  const record = await approve("GT", (draft) => {
    draft.baseline = {
      cct: 4000,
      cri: 90,
      internalAmbientTaC: 25,
      fluxPerMm: 1.111,
      wallWattsPerMm: 0.03,
      circuitWattsPerMm: 0.019,
    };
  });
  await assert.rejects(
    sealAuthorityToReferenceDto(record, sealContext("GT"), sha256Provider),
    /must exactly agree with G12/,
  );
});

test("strips diagnostic, private, evidence-body and runtime-owned data", async () => {
  const record = await approve("GT", (draft) => {
    draft.uiState = { tab: "private" };
    draft.workingSession = { dirty: true };
    draft.privateApprovalData = { displayName: "PRIVATE NAME" };
  });
  record.approval.privateDisplayName = "PRIVATE APPROVER";
  record.runtimeOwnedMutableData = { value: "DO NOT COPY" };
  const dto = await sealAuthorityToReferenceDto(record, sealContext("GT"), sha256Provider);
  const blob = JSON.stringify(dto);
  for (const forbidden of [
    "labForm", "safeRuntimeHandoff", "unresolvedFields", "revisionState",
    "labProofState", "reopenedAtUtc", "approverId", "PRIVATE NAME", "PRIVATE APPROVER",
    "strip-me", "DO NOT COPY", "diagnostic", "workingSession", "uiState",
  ]) {
    assert.equal(blob.includes(forbidden), false, `leaked ${forbidden}`);
  }
});

test("referenceSha256 is deterministic and insertion-order independent", async () => {
  const record = await approve("GT");
  const context = sealContext("GT");
  const first = await sealAuthorityToReferenceDto(record, context, sha256Provider);
  const second = await sealAuthorityToReferenceDto(
    record,
    reverseObjectInsertion(context),
    sha256Provider,
  );
  assert.equal(first.referenceSha256, second.referenceSha256);
  assert.deepEqual(first, second);
});

test("governed DTO content changes referenceSha256", async () => {
  const base = await seal("GT");
  const changed = await seal("GT", {
    mutateDraft(record) {
      record.photometry.candela[0][0] = 101;
    },
  });
  assert.notEqual(changed.referenceSha256, base.referenceSha256);
});

test("sealed DTO is deeply immutable and inputs are not mutated", async () => {
  const record = await approve("GT");
  const context = sealContext("GT");
  const recordBefore = clone(record);
  const contextBefore = clone(context);
  const dto = await sealAuthorityToReferenceDto(record, context, sha256Provider);
  assert.deepEqual(record, recordBefore);
  assert.deepEqual(context, contextBefore);
  assert.equal(Object.isFrozen(dto), true);
  assert.equal(Object.isFrozen(dto.approval), true);
  assert.equal(Object.isFrozen(dto.keywordProfile.values), true);
  assert.equal(Object.isFrozen(dto.candela[0]), true);
  assert.throws(() => { dto.metadata.G0 = 99; }, TypeError);
});

test("seal context cannot override authority content", async () => {
  const record = await approve("GT");
  await assert.rejects(
    sealAuthorityToReferenceDto(record, { ...sealContext("GT"), metadata: { G0: 99 } }, sha256Provider),
    /cannot override authority content/,
  );
});

test("module exports no reverse-authority reconstruction API and no production node imports", async () => {
  const module = await import("../../packages/lab-kernel/ies-toolkit/iesReferenceDto.js");
  for (const name of Object.keys(module)) {
    assert.equal(/reverse|reconstruct|restore.*authority|fromReference/i.test(name), false, name);
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const content = readFileSync(resolve(here, "../../packages/lab-kernel/ies-toolkit/iesReferenceDto.js"), "utf8");
  const actualNodeImport = /(?:from\s+|import\s*\(|require\s*\()\s*["']node:/;
  assert.equal(actualNodeImport.test(content), false);
});
