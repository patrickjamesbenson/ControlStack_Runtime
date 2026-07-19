import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/iesMerge.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function sha(character) {
  return character.repeat(64);
}

function reference(kind = "GT", serial = 1, options = {}) {
  const prefix = kind === "MERGED" ? "MRG" : kind;
  const power = options.power ?? (kind === "GT" ? 0.04 : 0.02);
  const metadata = {
    G0: 1,
    G1: 100,
    G2: 1,
    G3: 3,
    G4: 2,
    G5: 1,
    G6: 2,
    G7: 0.05,
    G8: 0.001,
    G9: 0.05,
    G10: 1,
    G11: "100.000",
    G12: power,
    ...(options.metadata || {}),
  };
  const angles = {
    v_angles: [0, 90, 180],
    h_angles: [0, 180],
    ...(options.angles || {}),
  };
  const candela = options.candela || [
    [10, 20, 30],
    [40, 50, 60],
  ];
  const dto = {
    schemaId: "controlstack.lab.reference.1mm.v1",
    schemaVersion: 1,
    kind,
    id: `NVB-REF-${prefix}-${String(serial).padStart(6, "0")}`,
    serial,
    sealedAtUtc: "2026-07-20T00:00:00.000Z",
    authorityRecordSha256: sha(options.authorityCharacter || "a"),
    originSha256: kind === "MERGED" ? null : sha(options.originCharacter || "b"),
    derivationSha256: kind === "MERGED" ? sha(options.derivationCharacter || "c") : null,
    approval: {
      state: "reference",
      approvedAtUtc: "2026-07-19T23:00:00.000Z",
      approvalFingerprint: sha(options.approvalCharacter || "d"),
      ...(options.approval || {}),
    },
    keywordProfile: {
      profileId: "controlstack.lab.ies-keywords.v1",
      values: [],
    },
    metadata,
    angles,
    candela,
    baseline: {
      cct: 4000,
      cri: 90,
      internalAmbientTaC: 35,
      fluxPerMm: 100,
      wallWattsPerMm: metadata.G12,
      circuitWattsPerMm: 0.05,
      ...(options.baseline || {}),
    },
    provenanceRefs: {
      authorityRecord: { artifactRef: `authority-${serial}` },
      originIes: kind === "MERGED" ? null : { artifactRef: `origin-${serial}` },
      evidenceIndex: null,
      mutationLog: null,
      parentReferences: [],
    },
    referenceSha256: sha(options.referenceCharacter || (serial % 2 ? "e" : "f")),
    ...(options.dto || {}),
  };
  return dto;
}

function pair(options = {}) {
  const first = options.first || reference("GT", 1, {
    power: 0.04,
    candela: [
      [10, 20, 30],
      [40, 50, 60],
    ],
    referenceCharacter: "e",
  });
  const second = options.second || reference("OPT", 2, {
    power: 0.02,
    candela: [
      [1, 2, 3],
      [4, 5, 6],
    ],
    authorityCharacter: "1",
    originCharacter: "2",
    approvalCharacter: "3",
    referenceCharacter: "4",
  });
  return {
    parents: [
      { reference: first, role: options.firstRole || "direct", ownedWallPowerW: first.metadata.G12 },
      { reference: second, role: options.secondRole || "indirect", ownedWallPowerW: second.metadata.G12 },
    ],
    geometryRegistration: "coincident-aligned",
    operatingState: "all-contributing-channels-on",
  };
}

const exactExports = [
  "REFERENCE_COMPOSITION_SCHEMA_ID",
  "REFERENCE_COMPOSITION_SCHEMA_VERSION",
  "ReferenceCompositionContractError",
  "composeReferencePair",
];

test("exports only the approved version-1 reference-composition interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), exactExports.sort());
  assert.equal(contract.REFERENCE_COMPOSITION_SCHEMA_ID, "controlstack.lab.reference-composition-candidate.v1");
  assert.equal(contract.REFERENCE_COMPOSITION_SCHEMA_VERSION, 1);
});

test("composes the exact immutable two-parent candidate shape", () => {
  const input = pair();
  const before = deepClone(input);
  const result = contract.composeReferencePair(input);

  assert.deepEqual(result, {
    schemaId: "controlstack.lab.reference-composition-candidate.v1",
    schemaVersion: 1,
    kind: "MERGED_CANDIDATE",
    parents: [
      {
        ordinal: 1,
        referenceId: "NVB-REF-GT-000001",
        referenceSha256: sha("e"),
        kind: "GT",
        role: "direct",
        ownedWallPowerW: 0.04,
      },
      {
        ordinal: 2,
        referenceId: "NVB-REF-OPT-000002",
        referenceSha256: sha("4"),
        kind: "OPT",
        role: "indirect",
        ownedWallPowerW: 0.02,
      },
    ],
    geometryRegistration: "coincident-aligned",
    operatingState: "all-contributing-channels-on",
    photometry: {
      vAngles: [0, 90, 180],
      hAngles: [0, 180],
      candela: [
        [11, 22, 33],
        [44, 55, 66],
      ],
    },
    ownedPower: {
      parentWallPowerW: [0.04, 0.02],
      totalWallPowerW: 0.06,
      sharedOverheadW: null,
    },
    unresolvedAssemblyFields: [
      "assembly_identity",
      "lumcat",
      "luminaire",
      "internal_ambient_ta_c",
      "emergency_verification",
      "ewis_cartridge_verification",
      "shared_overhead_w",
    ],
    authorityState: "candidate",
    readOnly: true,
  });
  assert.deepEqual(input, before);
  assertDeepFrozen(result);
});

test("supports each ordered direct GT/OPT parent-kind combination", () => {
  const combinations = [
    ["GT", "GT"],
    ["GT", "OPT"],
    ["OPT", "GT"],
    ["OPT", "OPT"],
  ];
  for (const [leftKind, rightKind] of combinations) {
    const left = reference(leftKind, 11, { power: 0.01, referenceCharacter: "5" });
    const right = reference(rightKind, 12, {
      power: 0.02,
      authorityCharacter: "6",
      originCharacter: "7",
      approvalCharacter: "8",
      referenceCharacter: "9",
    });
    const result = contract.composeReferencePair(pair({ first: left, second: right }));
    assert.deepEqual(result.parents.map((parent) => parent.kind), [leftKind, rightKind]);
    assert.equal(result.ownedPower.totalWallPowerW, 0.03);
  }
});

test("preserves provenance-significant parent order without reordering", () => {
  const input = pair();
  const forward = contract.composeReferencePair(input);
  const reverse = contract.composeReferencePair({
    ...input,
    parents: [
      { ...input.parents[1], role: "indirect" },
      { ...input.parents[0], role: "direct" },
    ],
  });

  assert.deepEqual(forward.parents.map((parent) => parent.referenceId), [
    "NVB-REF-GT-000001",
    "NVB-REF-OPT-000002",
  ]);
  assert.deepEqual(reverse.parents.map((parent) => parent.referenceId), [
    "NVB-REF-OPT-000002",
    "NVB-REF-GT-000001",
  ]);
  assert.deepEqual(forward.photometry, reverse.photometry);
  assert.notDeepEqual(forward.parents, reverse.parents);
});

test("sums finite non-negative candela cell-by-cell without changing the exact grid", () => {
  const first = reference("GT", 21, {
    candela: [[0, 0.25, 1.5], [3, 4.25, 5]],
    referenceCharacter: "a",
  });
  const second = reference("OPT", 22, {
    candela: [[0.5, 0.75, 2.5], [7, 8.75, 9]],
    authorityCharacter: "b",
    originCharacter: "c",
    approvalCharacter: "d",
    referenceCharacter: "e",
  });
  const result = contract.composeReferencePair(pair({ first, second }));

  assert.deepEqual(result.photometry.vAngles, first.angles.v_angles);
  assert.deepEqual(result.photometry.hAngles, first.angles.h_angles);
  assert.deepEqual(result.photometry.candela, [[0.5, 1, 4], [10, 13, 14]]);
});

test("counts each parent-owned G12 value once and leaves shared overhead unresolved", () => {
  const first = reference("GT", 31, { power: 1.25, referenceCharacter: "1" });
  const second = reference("OPT", 32, {
    power: 2.75,
    authorityCharacter: "2",
    originCharacter: "3",
    approvalCharacter: "4",
    referenceCharacter: "5",
  });
  const result = contract.composeReferencePair(pair({ first, second }));

  assert.deepEqual(result.ownedPower, {
    parentWallPowerW: [1.25, 2.75],
    totalWallPowerW: 4,
    sharedOverheadW: null,
  });
});

test("does not emit a sealed identity, approval, authority hash, or assembly-owned values", () => {
  const result = contract.composeReferencePair(pair());
  assert.deepEqual(Object.keys(result).sort(), [
    "authorityState",
    "geometryRegistration",
    "kind",
    "operatingState",
    "ownedPower",
    "parents",
    "photometry",
    "readOnly",
    "schemaId",
    "schemaVersion",
    "unresolvedAssemblyFields",
  ].sort());
  for (const forbidden of [
    "id",
    "serial",
    "sealedAtUtc",
    "approval",
    "authorityRecordSha256",
    "referenceSha256",
    "keywordProfile",
    "LUMCAT",
    "LUMINAIRE",
    "_INTERNAL_AMBIENT_TA_C",
    "_EMERGENCY_VERIFIED",
    "_EWIS_CARTRIDGE_VERIFIED",
  ]) {
    assert.equal(Object.hasOwn(result, forbidden), false, `${forbidden} must not be a top-level candidate field`);
  }
  assert.equal(result.authorityState, "candidate");
  assert.equal(result.unresolvedAssemblyFields.includes("internal_ambient_ta_c"), true);
  assert.equal(result.unresolvedAssemblyFields.includes("emergency_verification"), true);
  assert.equal(result.unresolvedAssemblyFields.includes("ewis_cartridge_verification"), true);
});

test("fails closed unless exactly two parents are supplied", () => {
  const input = pair();
  for (const parents of [
    [],
    [input.parents[0]],
    [...input.parents, { ...input.parents[0] }],
    null,
    {},
  ]) {
    assert.throws(
      () => contract.composeReferencePair({ ...input, parents }),
      (error) => error instanceof contract.ReferenceCompositionContractError
        && error.code === "exactly_two_parents_required",
    );
  }
});

test("rejects duplicate and pre-composed parent references", () => {
  const input = pair();
  assert.throws(
    () => contract.composeReferencePair({
      ...input,
      parents: [input.parents[0], { ...input.parents[0], role: "second" }],
    }),
    (error) => error instanceof contract.ReferenceCompositionContractError
      && error.code === "duplicate_parent_reference",
  );

  const merged = reference("MERGED", 9, { referenceCharacter: "9" });
  assert.throws(
    () => contract.composeReferencePair(pair({ first: merged })),
    (error) => error instanceof contract.ReferenceCompositionContractError
      && error.code === "unsupported_parent_kind",
  );
});

test("rejects malformed, unapproved, unsealed, or identity-mismatched DTOs", () => {
  const cases = [
    reference("GT", 41, { dto: { schemaVersion: 2 } }),
    reference("GT", 41, { approval: { state: "draft" } }),
    reference("GT", 41, { dto: { referenceSha256: "safe-diagnostic-hash" } }),
    reference("GT", 41, { dto: { authorityRecordSha256: "A".repeat(64) } }),
    reference("GT", 41, { dto: { id: "NVB-REF-OPT-000041" } }),
    reference("GT", 41, { dto: { sealedAtUtc: "2026-07-20" } }),
    reference("GT", 41, { dto: { derivationSha256: sha("f") } }),
    reference("GT", 41, { dto: { extraPrivateAuthority: true } }),
  ];

  for (const first of cases) {
    assert.throws(() => contract.composeReferencePair(pair({ first })), contract.ReferenceCompositionContractError);
  }
});

test("rejects grid, photometric type, units, dimensions, and one-millimetre basis mismatch", () => {
  const mismatchOptions = [
    { metadata: { G5: 2 } },
    { metadata: { G6: 1 } },
    { metadata: { G7: 0.06 } },
    { metadata: { G8: 0.002 } },
    { metadata: { G9: 0.06 } },
    { angles: { v_angles: [0, 45, 180] } },
    { angles: { h_angles: [0, 90] } },
  ];
  for (const options of mismatchOptions) {
    const second = reference("OPT", 52, {
      authorityCharacter: "1",
      originCharacter: "2",
      approvalCharacter: "3",
      referenceCharacter: "4",
      ...options,
    });
    assert.throws(() => contract.composeReferencePair(pair({ second })), contract.ReferenceCompositionContractError);
  }
});

test("rejects malformed angle counts and candela dimensions", () => {
  const cases = [
    reference("GT", 61, { metadata: { G3: 4 } }),
    reference("GT", 61, { metadata: { G4: 3 } }),
    reference("GT", 61, { candela: [[1, 2, 3]] }),
    reference("GT", 61, { candela: [[1, 2], [3, 4]] }),
    reference("GT", 61, { angles: { v_angles: [0, 90, 90] } }),
    reference("GT", 61, { angles: { h_angles: [0, 361] } }),
  ];
  for (const first of cases) {
    assert.throws(() => contract.composeReferencePair(pair({ first })), contract.ReferenceCompositionContractError);
  }
});

test("rejects negative, non-finite, or overflowing candela", () => {
  for (const value of [-1, Number.NaN, Number.POSITIVE_INFINITY]) {
    const first = reference("GT", 71, { candela: [[value, 2, 3], [4, 5, 6]] });
    assert.throws(() => contract.composeReferencePair(pair({ first })), contract.ReferenceCompositionContractError);
  }

  const first = reference("GT", 72, { candela: [[Number.MAX_VALUE, 2, 3], [4, 5, 6]] });
  const second = reference("OPT", 73, {
    candela: [[Number.MAX_VALUE, 2, 3], [4, 5, 6]],
    authorityCharacter: "1",
    originCharacter: "2",
    approvalCharacter: "3",
    referenceCharacter: "4",
  });
  assert.throws(
    () => contract.composeReferencePair(pair({ first, second })),
    (error) => error instanceof contract.ReferenceCompositionContractError
      && error.code === "numeric_sum_out_of_range",
  );
});

test("rejects parent-owned power mismatch, invalid power, and overflowing total power", () => {
  const input = pair();
  assert.throws(
    () => contract.composeReferencePair({
      ...input,
      parents: [{ ...input.parents[0], ownedWallPowerW: 99 }, input.parents[1]],
    }),
    (error) => error instanceof contract.ReferenceCompositionContractError
      && error.code === "owned_power_mismatch",
  );
  assert.throws(
    () => contract.composeReferencePair({
      ...input,
      parents: [{ ...input.parents[0], ownedWallPowerW: Number.NaN }, input.parents[1]],
    }),
    contract.ReferenceCompositionContractError,
  );

  const first = reference("GT", 81, { power: Number.MAX_VALUE, referenceCharacter: "1" });
  const second = reference("OPT", 82, {
    power: Number.MAX_VALUE,
    authorityCharacter: "2",
    originCharacter: "3",
    approvalCharacter: "4",
    referenceCharacter: "5",
  });
  assert.throws(
    () => contract.composeReferencePair(pair({ first, second })),
    (error) => error instanceof contract.ReferenceCompositionContractError
      && error.code === "numeric_sum_out_of_range",
  );
});

test("rejects unsupported geometry, operating state, roles, and object fields", () => {
  const input = pair();
  const cases = [
    { ...input, geometryRegistration: "translated" },
    { ...input, operatingState: "direct-only" },
    { ...input, extra: true },
    { ...input, parents: [{ ...input.parents[0], role: "" }, input.parents[1]] },
    { ...input, parents: [{ ...input.parents[0], extra: true }, input.parents[1]] },
  ];
  for (const value of cases) {
    assert.throws(() => contract.composeReferencePair(value), contract.ReferenceCompositionContractError);
  }
});

test("is deterministic and never mutates or freezes caller-owned input", () => {
  const input = pair();
  const before = deepClone(input);
  const first = contract.composeReferencePair(input);
  const second = contract.composeReferencePair(input);

  assert.deepEqual(first, second);
  assert.deepEqual(input, before);
  assert.equal(Object.isFrozen(input), false);
  assert.equal(Object.isFrozen(input.parents[0].reference), false);
});

test("production module contains no resampling, allocation, sealing, diagnostic identity, UI, or persistence seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/iesMerge.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "computeMetrics",
    "mergePhotometry",
    "mergeReferences",
    "interpPlane",
    "resample",
    "interpolate",
    "fingerprint:",
    "instanceId",
    "new URL(",
    "fetch(",
    "XMLHttpRequest",
    "node:fs",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "Date.now",
    "Math.random",
    "document.",
    "window.",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
  assert.match(source, /_INTERNAL_AMBIENT_TA_C:\s*null/);
  assert.doesNotMatch(source, /export\s+(?:const|function|class)\s+(?:mergePhotometry|mergeReferences)\b/);
});
