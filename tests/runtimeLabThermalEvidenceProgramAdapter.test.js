import test from "node:test";
import assert from "node:assert/strict";

import {
  PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID,
  PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION,
  PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE,
  buildLabThermalEvidenceProgramBundle,
} from "../packages/workspace-kernel/labThermalEvidenceProgramAdapter.js";

function selectorCandidate(overrides = {}) {
  return {
    selectedRoomTaC: 25,
    optic: { key: "Inlay" },
    lighting: {
      optic_key: "Inlay",
      selected_optic_key: "Inlay",
      target_lm_per_m: "1200",
      cct: "4000",
      cri: "90",
      control_type: "DALI-2",
    },
    runs: [{ qty: 2, run_length_mm: 3500 }],
    host_local_readonly_engine_candidate: true,
    ...overrides,
  };
}

function validatedOpticBinding(overrides = {}) {
  return {
    selectedOpticKey: "Inlay",
    opticBomId: "OPTIC-BOM-80-INLAY",
    sourceRevision: "runtime-source-revision-2026-07-21",
    sourceBacked: true,
    ...overrides,
  };
}

function labProjection(overrides = {}) {
  const base = {
    schemaId: "controlstack.lab.nvb-lab-projection.v2",
    schemaVersion: 2,
    path: "optic",
    family: 80,
    selection: {
      opticBomId: "OPTIC-BOM-80-INLAY",
      opticVariant: "Inlay",
      specCode: "INLAY-80",
      emissionPermission: "direct",
    },
    governingThermals: {
      systemLabel: "DNX 80",
      systemVariant: "Direct",
      metalAreaMm2: 8000,
      airAreaMm2: 2400,
    },
    references: {
      gearTray: null,
      optic: {
        schemaId: "controlstack.lab.reference-identity.v1",
        schemaVersion: 1,
        referenceId: "OPT-000001",
        kind: "OPT",
        serial: 1,
        sealedAtUtc: "2026-07-21T00:00:00.000Z",
        authorityRecordSha256: "a".repeat(64),
        referenceSha256: "b".repeat(64),
        resolverPath: "/r/OPT-000001",
        readOnly: true,
      },
    },
    thermalEvidence: {
      opticBomId: "OPTIC-BOM-80-INLAY",
      referenceRoomTaC: 25,
      referenceInternalTaC: 35,
      opticThermalRiseTaC: 10,
      evidenceRef: "NVB-HOT-TEST-80-INLAY",
      authorityState: null,
    },
    unresolved: [],
    assemblyVerification: {
      emergency: null,
      ewisCartridge: null,
    },
    readOnly: true,
  };
  return {
    ...base,
    ...overrides,
    selection: overrides.selection ? { ...base.selection, ...overrides.selection } : base.selection,
    thermalEvidence: overrides.thermalEvidence
      ? { ...base.thermalEvidence, ...overrides.thermalEvidence }
      : base.thermalEvidence,
  };
}

function build(overrides = {}) {
  return buildLabThermalEvidenceProgramBundle({
    selectorCandidate: overrides.selectorCandidate || selectorCandidate(),
    validatedOpticBinding: overrides.validatedOpticBinding || validatedOpticBinding(),
    labProjection: overrides.labProjection || labProjection(),
  });
}

test("binds selected room and optic to exact Lab v2 evidence without thermal arithmetic", () => {
  const result = build();

  assert.equal(result.ok, true);
  assert.deepEqual(Object.keys(result.bundle).sort(), [
    "evidenceRef",
    "labAuthorityState",
    "opticBomId",
    "opticThermalRiseTaC",
    "programValidationState",
    "readOnly",
    "referenceInternalTaC",
    "referenceRoomTaC",
    "schemaId",
    "schemaVersion",
    "selectedOpticKey",
    "selectedRoomTaC",
    "sourceRevision",
  ].sort());
  assert.equal(result.bundle.schemaId, PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID);
  assert.equal(result.bundle.schemaVersion, PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION);
  assert.equal(result.bundle.selectedRoomTaC, 25);
  assert.equal(result.bundle.selectedOpticKey, "Inlay");
  assert.equal(result.bundle.opticBomId, "OPTIC-BOM-80-INLAY");
  assert.equal(result.bundle.sourceRevision, "runtime-source-revision-2026-07-21");
  assert.equal(result.bundle.referenceRoomTaC, 25);
  assert.equal(result.bundle.referenceInternalTaC, 35);
  assert.equal(result.bundle.opticThermalRiseTaC, 10);
  assert.equal(result.bundle.evidenceRef, "NVB-HOT-TEST-80-INLAY");
  assert.equal(result.bundle.labAuthorityState, null);
  assert.equal(result.bundle.programValidationState, PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE);
  assert.equal(result.bundle.readOnly, true);
  assert.equal(result.summary.thermalArithmeticPerformed, false);
  assert.equal(result.summary.curveLookupPerformed, false);
  assert.equal(result.summary.verifiedOutputProduced, false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.bundle, "derivedInternalTaC"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result.bundle, "curveLookupTaC"), false);
});

test("returns a deeply immutable accepted bundle and summary", () => {
  const result = build();
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.bundle), true);
  assert.equal(Object.isFrozen(result.summary), true);
  assert.throws(() => {
    result.bundle.selectedRoomTaC = 99;
  }, TypeError);
});

test("accepts decimal triplets only when exact room plus rise equals internal", () => {
  const accepted = build({
    labProjection: labProjection({
      thermalEvidence: {
        referenceRoomTaC: 25.1,
        referenceInternalTaC: 35.3,
        opticThermalRiseTaC: 10.2,
      },
    }),
  });
  assert.equal(accepted.ok, true);

  const blocked = build({
    labProjection: labProjection({
      thermalEvidence: {
        referenceRoomTaC: 25.1,
        referenceInternalTaC: 35.4,
        opticThermalRiseTaC: 10.2,
      },
    }),
  });
  assert.equal(blocked.ok, false);
  assert.equal(blocked.summary.blocker, "lab-thermal-triplet-contradictory");
});

test("fails closed when Selector and Program optic keys disagree or Selector optic fields conflict", () => {
  const bindingMismatch = build({
    validatedOpticBinding: validatedOpticBinding({ selectedOpticKey: "Comfort" }),
  });
  assert.equal(bindingMismatch.ok, false);
  assert.equal(bindingMismatch.summary.blocker, "selector-optic-binding-mismatch");

  const candidateConflict = build({
    selectorCandidate: selectorCandidate({ optic: { key: "Comfort" } }),
  });
  assert.equal(candidateConflict.ok, false);
  assert.equal(candidateConflict.summary.blocker, "selector-optic-key-conflict");
});

test("fails closed unless Program binding is exact, source-backed, and revisioned", () => {
  for (const binding of [
    validatedOpticBinding({ sourceBacked: false }),
    validatedOpticBinding({ sourceRevision: "" }),
    validatedOpticBinding({ opticBomId: "" }),
    { ...validatedOpticBinding(), extra: true },
  ]) {
    const result = build({ validatedOpticBinding: binding });
    assert.equal(result.ok, false);
    assert.equal(result.summary.blocker, "validated-optic-binding-invalid");
  }
});

test("fails closed when Program BOM identity does not match Lab selection or evidence", () => {
  const selectionMismatch = build({
    labProjection: labProjection({ selection: { opticBomId: "OTHER-BOM" } }),
  });
  assert.equal(selectionMismatch.ok, false);
  assert.equal(selectionMismatch.summary.blocker, "optic-bom-binding-mismatch");

  const evidenceMismatch = build({
    labProjection: labProjection({ thermalEvidence: { opticBomId: "OTHER-BOM" } }),
  });
  assert.equal(evidenceMismatch.ok, false);
  assert.equal(evidenceMismatch.summary.blocker, "optic-bom-binding-mismatch");
});

test("requires the exact read-only resolved Lab v2 optic projection", () => {
  const cases = [
    [labProjection({ schemaVersion: 1 }), "lab-projection-schema-unsupported"],
    [labProjection({ path: "gear_tray" }), "lab-projection-path-invalid"],
    [labProjection({ readOnly: false }), "lab-projection-not-read-only"],
    [labProjection({ unresolved: ["thermal_evidence_reference_unbound"] }), "lab-projection-unresolved"],
    [{ ...labProjection(), extra: true }, "lab-projection-invalid-shape"],
  ];
  for (const [projection, blocker] of cases) {
    const result = build({ labProjection: projection });
    assert.equal(result.ok, false, blocker);
    assert.equal(result.summary.blocker, blocker);
  }
});

test("requires bounded evidence identity and exactly null unresolved Lab authority", () => {
  const missingEvidence = build({
    labProjection: labProjection({ thermalEvidence: { evidenceRef: null } }),
  });
  assert.equal(missingEvidence.ok, false);
  assert.equal(missingEvidence.summary.blocker, "lab-thermal-evidence-identity-invalid");

  const claimedAuthority = build({
    labProjection: labProjection({ thermalEvidence: { authorityState: "accepted" } }),
  });
  assert.equal(claimedAuthority.ok, false);
  assert.equal(claimedAuthority.summary.blocker, "lab-thermal-authority-state-invalid");
});

test("rejects non-finite room or measured thermal values", () => {
  const invalidRoom = build({ selectorCandidate: selectorCandidate({ selectedRoomTaC: Infinity }) });
  assert.equal(invalidRoom.ok, false);
  assert.equal(invalidRoom.summary.blocker, "selector-room-temperature-invalid");

  const invalidThermal = build({
    labProjection: labProjection({ thermalEvidence: { opticThermalRiseTaC: NaN } }),
  });
  assert.equal(invalidThermal.ok, false);
  assert.equal(invalidThermal.summary.blocker, "lab-thermal-triplet-invalid");
});

test("rejects caller-supplied derived, lookup, board-temperature, or verified-output fields", () => {
  const cases = [
    selectorCandidate({ derivedInternalTaC: 35 }),
    selectorCandidate({ lighting: { ...selectorCandidate().lighting, curveLookupTaC: 35 } }),
    selectorCandidate({ diagnostics: { boardTemperatureTaC: 42 } }),
    selectorCandidate({ verifiedLmPerM: 1150 }),
  ];
  for (const candidate of cases) {
    const result = build({ selectorCandidate: candidate });
    assert.equal(result.ok, false);
    assert.match(result.summary.blocker, /^forbidden-input-field-/);
  }
});

test("rejects unsafe true flags without exposing or mutating source evidence", () => {
  const result = build({
    selectorCandidate: selectorCandidate({ safetyFlags: { runtimeDataMutated: true } }),
  });
  assert.equal(result.ok, false);
  assert.equal(result.summary.blocker, "unsafe-input-flag-runtimeDataMutated");
  assert.equal(result.bundle, null);
  assert.equal(result.summary.readOnly, true);
  assert.equal(result.summary.thermalArithmeticPerformed, false);
});

test("fails closed for malformed adapter input shape or cyclic input", () => {
  const extraInput = buildLabThermalEvidenceProgramBundle({
    selectorCandidate: selectorCandidate(),
    validatedOpticBinding: validatedOpticBinding(),
    labProjection: labProjection(),
    extra: true,
  });
  assert.equal(extraInput.ok, false);
  assert.equal(extraInput.summary.blocker, "invalid-program-adapter-input-shape");

  const cyclicCandidate = selectorCandidate();
  cyclicCandidate.loop = cyclicCandidate;
  const cyclic = build({ selectorCandidate: cyclicCandidate });
  assert.equal(cyclic.ok, false);
  assert.equal(cyclic.summary.blocker, "cyclic-input");
});
