import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/nvbLabAdapter.js";

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

function identity(kind, serial, character = "a", overrides = {}) {
  const prefix = kind === "MERGED" ? "MRG" : kind;
  const referenceId = `NVB-REF-${prefix}-${String(serial).padStart(6, "0")}`;
  return {
    schemaId: "controlstack.lab.reference-identity.v1",
    schemaVersion: 1,
    referenceId,
    kind,
    serial,
    sealedAtUtc: "2026-07-20T00:00:00.000Z",
    authorityRecordSha256: sha(character),
    referenceSha256: sha(character === "f" ? "e" : "f"),
    resolverPath: `/r/${referenceId}`,
    readOnly: true,
    ...overrides,
  };
}

function optic(overrides = {}) {
  return {
    opticBomId: "OPT-DNX80-OPAL",
    opticVariant: "OPAL",
    specCode: "OP",
    emissionPermission: "direct",
    hotTestEvidenceRef: "evidence-hot-test",
    opticalEfficiency: 0.82,
    opticInternalDeltaTaC: 3.5,
    roomTaC: 25,
    opticUpliftTaC: 2,
    ...overrides,
  };
}

function thermals(overrides = {}) {
  return {
    systemLabel: "DNX 80 worst case",
    systemVariant: "direct",
    metalAreaMm2: 1200,
    airAreaMm2: 800,
    ...overrides,
  };
}

function resolution(path = "optic", overrides = {}) {
  const resolved = overrides.status !== "unresolved";
  return {
    schemaId: "controlstack.lab.nvb-resolution.v1",
    schemaVersion: 1,
    path,
    family: 80,
    status: resolved ? "resolved" : "unresolved",
    optic: path === "optic" ? optic() : null,
    governingThermals: thermals(),
    labForm: {
      iesFields: [{ kind: "ies", bareField: "LUMCAT", value: null }],
      checkFields: [{ kind: "check", bareField: "_BCLT_APPLIED", value: "no" }],
    },
    blockers: resolved ? [] : ["optic_match_missing"],
    readOnly: true,
    ...overrides,
  };
}

function input(path = "optic", overrides = {}) {
  return {
    resolution: resolution(path, overrides.resolution || {}),
    references: {
      gearTray: identity("GT", 1, "a"),
      optic: path === "optic" ? identity("OPT", 2, "b") : null,
      ...(overrides.references || {}),
    },
    ...(overrides.input || {}),
  };
}

const exactExports = [
  "NVB_LAB_ADAPTER_SCHEMA_ID",
  "NVB_LAB_ADAPTER_SCHEMA_VERSION",
  "NvbLabAdapterContractError",
  "adaptNvbResolution",
];

test("exports only the approved version-1 NVB Lab adapter interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), exactExports.sort());
  assert.equal(contract.NVB_LAB_ADAPTER_SCHEMA_ID, "controlstack.lab.nvb-lab-projection.v1");
  assert.equal(contract.NVB_LAB_ADAPTER_SCHEMA_VERSION, 1);
});

test("projects the exact immutable optic-path working-state shape", () => {
  const value = input("optic");
  const before = deepClone(value);
  const result = contract.adaptNvbResolution(value);

  assert.deepEqual(result, {
    schemaId: "controlstack.lab.nvb-lab-projection.v1",
    schemaVersion: 1,
    path: "optic",
    family: 80,
    selection: {
      opticBomId: "OPT-DNX80-OPAL",
      opticVariant: "OPAL",
      specCode: "OP",
      emissionPermission: "direct",
    },
    governingThermals: {
      systemLabel: "DNX 80 worst case",
      systemVariant: "direct",
      metalAreaMm2: 1200,
      airAreaMm2: 800,
    },
    references: {
      gearTray: identity("GT", 1, "a"),
      optic: identity("OPT", 2, "b"),
    },
    unresolved: [],
    assemblyVerification: {
      emergency: null,
      ewisCartridge: null,
    },
    readOnly: true,
  });
  assert.deepEqual(value, before);
  assertDeepFrozen(result);
});

test("projects gear-tray and no-base paths without inventing optic values", () => {
  for (const path of ["gear_tray", "no_base"]) {
    const value = input(path);
    const result = contract.adaptNvbResolution(value);
    assert.equal(result.path, path);
    assert.deepEqual(result.selection, {
      opticBomId: null,
      opticVariant: null,
      specCode: null,
      emissionPermission: null,
    });
    assert.equal(result.references.optic, null);
    assert.equal(result.references.gearTray.kind, "GT");
  }
});

test("accepts optional null reference slots without generating identity", () => {
  const result = contract.adaptNvbResolution(input("optic", {
    references: { gearTray: null, optic: null },
  }));
  assert.deepEqual(result.references, { gearTray: null, optic: null });
  assert.equal(Object.hasOwn(result, "id"), false);
  assert.equal(Object.hasOwn(result, "resolvedAtUtc"), false);
});

test("preserves unresolved blocker codes exactly and in source order", () => {
  const value = input("optic", {
    resolution: {
      status: "unresolved",
      optic: null,
      blockers: ["optic_match_missing", "unknown_lab_form_kind"],
    },
  });
  const result = contract.adaptNvbResolution(value);
  assert.deepEqual(result.unresolved, ["optic_match_missing", "unknown_lab_form_kind"]);
  assert.deepEqual(result.selection, {
    opticBomId: null,
    opticVariant: null,
    specCode: null,
    emissionPermission: null,
  });
});

test("preserves nullable selection and governing thermal values explicitly", () => {
  const value = input("optic", {
    resolution: {
      optic: optic({ specCode: null, emissionPermission: null }),
      governingThermals: thermals({ systemVariant: null, metalAreaMm2: null, airAreaMm2: null }),
    },
  });
  const result = contract.adaptNvbResolution(value);
  assert.deepEqual(result.selection, {
    opticBomId: "OPT-DNX80-OPAL",
    opticVariant: "OPAL",
    specCode: null,
    emissionPermission: null,
  });
  assert.deepEqual(result.governingThermals, {
    systemLabel: "DNX 80 worst case",
    systemVariant: null,
    metalAreaMm2: null,
    airAreaMm2: null,
  });
});

test("keeps assembly verification exactly null for every path and status", () => {
  for (const value of [
    input("gear_tray"),
    input("optic"),
    input("no_base"),
    input("optic", { resolution: { status: "unresolved", optic: null, blockers: ["optic_match_missing"] } }),
  ]) {
    assert.deepEqual(contract.adaptNvbResolution(value).assemblyVerification, {
      emergency: null,
      ewisCartridge: null,
    });
  }
});

test("rejects wrong or malformed LAB-018 resolution schemas and shapes", () => {
  const invalidResolutions = [
    { ...resolution(), schemaId: "controlstack.lab.nvb-resolution.v2" },
    { ...resolution(), schemaVersion: 2 },
    { ...resolution(), extra: true },
    { ...resolution(), readOnly: false },
    { ...resolution(), path: "other" },
    { ...resolution(), family: 0 },
    { ...resolution(), status: "complete" },
    { ...resolution(), status: "resolved", blockers: ["optic_match_missing"] },
    { ...resolution(), status: "unresolved", blockers: [] },
    { ...resolution("optic"), optic: null },
    { ...resolution("gear_tray"), optic: optic() },
    { ...resolution(), labForm: { iesFields: [], checkFields: [], extra: true } },
  ];
  for (const candidate of invalidResolutions) {
    assert.throws(
      () => contract.adaptNvbResolution({ ...input(), resolution: candidate }),
      contract.NvbLabAdapterContractError,
    );
  }
});

test("rejects malformed resolution optic, thermals, lab-form data, and blocker codes", () => {
  const invalidResolutions = [
    { ...resolution(), optic: { ...optic(), extra: true } },
    { ...resolution(), optic: { ...optic(), opticalEfficiency: Number.NaN } },
    { ...resolution(), governingThermals: { ...thermals(), extra: true } },
    { ...resolution(), governingThermals: { ...thermals(), systemLabel: null } },
    { ...resolution(), governingThermals: { ...thermals(), metalAreaMm2: Number.POSITIVE_INFINITY } },
    { ...resolution(), labForm: { iesFields: [new Date()], checkFields: [] } },
    { ...resolution(), blockers: ["BAD-BLOCKER"] },
    { ...resolution(), blockers: ["same_blocker", "same_blocker"], status: "unresolved", optic: null },
  ];
  for (const candidate of invalidResolutions) {
    assert.throws(
      () => contract.adaptNvbResolution({ ...input(), resolution: candidate }),
      contract.NvbLabAdapterContractError,
    );
  }
});

test("accepts only exact LAB-017 identity projections in the intended slots", () => {
  const valid = contract.adaptNvbResolution(input());
  assert.equal(valid.references.gearTray.kind, "GT");
  assert.equal(valid.references.optic.kind, "OPT");

  const cases = [
    { gearTray: identity("OPT", 1, "a") },
    { optic: identity("GT", 2, "b") },
    { gearTray: identity("GT", 1, "a", { schemaVersion: 2 }) },
    { optic: identity("OPT", 2, "b", { referenceSha256: "safe-diagnostic-value" }) },
    { gearTray: identity("GT", 1, "a", { referenceId: "NVB-REF-GT-000009" }) },
    { optic: identity("OPT", 2, "b", { resolverPath: "/r/NVB-REF-OPT-000999" }) },
    { gearTray: { ...identity("GT", 1, "a"), privateAuthority: true } },
  ];
  for (const references of cases) {
    assert.throws(
      () => contract.adaptNvbResolution(input("optic", { references })),
      contract.NvbLabAdapterContractError,
    );
  }
});

test("rejects unsupported top-level and reference-container fields", () => {
  assert.throws(
    () => contract.adaptNvbResolution({ ...input(), extra: true }),
    contract.NvbLabAdapterContractError,
  );
  assert.throws(
    () => contract.adaptNvbResolution({
      ...input(),
      references: { ...input().references, extra: true },
    }),
    contract.NvbLabAdapterContractError,
  );
});

test("is deterministic and does not mutate or freeze caller-owned inputs", () => {
  const value = input();
  const before = deepClone(value);
  const first = contract.adaptNvbResolution(value);
  const second = contract.adaptNvbResolution(value);
  assert.deepEqual(first, second);
  assert.deepEqual(value, before);
  assert.equal(Object.isFrozen(value), false);
  assert.equal(Object.isFrozen(value.resolution), false);
  assert.equal(Object.isFrozen(value.references.gearTray), false);
});

test("production module contains no loader, persistence, clock, ID generation, diagnostic identity, or mutation seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/nvbLabAdapter.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "loadNvb",
    "fetch(",
    "XMLHttpRequest",
    "node:fs",
    "node:path",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "Date.now",
    "new Date(",
    "Math.random",
    "process.env",
    "fingerprint",
    "record.nvb",
    "gearTrayRefId",
    "opticRefId",
    "resolveRecordNvb",
    "resolvedAtUtc",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
  assert.doesNotMatch(source, /export\s+(?:const|function|class)\s+(?:gearTrayRefId|opticRefId|resolveRecordNvb)\b/);
});
