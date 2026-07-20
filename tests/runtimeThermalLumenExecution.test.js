import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID,
  PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION,
  PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE,
} from "../packages/workspace-kernel/labThermalEvidenceProgramAdapter.js";
import {
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
  executeRuntimeThermalLumenLookup,
} from "../packages/workspace-kernel/runtimeThermalLumenExecution.js";

function sha256(value) {
  return createHash("sha256").update(Buffer.from(String(value))).digest("hex");
}

function curvePayload() {
  return [
    "# part_number: THERMAL-TEST",
    "mA,c1_lm_per_m_25C,c1_lm_per_m_65C",
    "100,1000,600",
    "200,2000,1200",
    "",
  ].join("\n");
}

function curveFixture(payload = curvePayload()) {
  const data = Buffer.from(payload);
  return {
    curve: {
      filename: "AD_830_8p8_140_THERMAL__PN_THERMAL.csv",
      sha256: sha256(data),
      size_bytes: data.length,
      raw_payload_returned: false,
      raw_curve_rows_returned: false,
    },
    fsApi: {
      stat: async () => ({ isFile: () => true, size: data.length }),
      readFile: async () => data,
    },
  };
}

function thermalBundle(overrides = {}) {
  return {
    schemaId: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_ID,
    schemaVersion: PROGRAM_THERMAL_EVIDENCE_BUNDLE_SCHEMA_VERSION,
    selectedRoomTaC: 25,
    selectedOpticKey: "Inlay",
    opticBomId: "OPTIC-BOM-80-INLAY",
    sourceRevision: "runtime-source-revision-2026-07-21",
    referenceRoomTaC: 25,
    referenceInternalTaC: 35,
    opticThermalRiseTaC: 10,
    evidenceRef: "NVB-HOT-TEST-80-INLAY",
    labAuthorityState: null,
    programValidationState: PROGRAM_THERMAL_EVIDENCE_VALIDATION_STATE,
    readOnly: true,
    ...overrides,
  };
}

async function execute(overrides = {}) {
  const fixture = curveFixture(overrides.payload);
  return executeRuntimeThermalLumenLookup({
    thermalEvidenceBundle: overrides.thermalEvidenceBundle || thermalBundle(),
    curve: overrides.curve || fixture.curve,
    requestedCurrentMa: overrides.requestedCurrentMa ?? 150,
    fsApi: overrides.fsApi || fixture.fsApi,
  });
}

test("Engine applies the measured rise exactly once: 25 plus 10 produces lookup 35", async () => {
  const result = await execute();

  assert.equal(result.ok, true);
  assert.equal(result.result.schemaId, RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID);
  assert.equal(result.result.schemaVersion, RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION);
  assert.equal(result.result.selectedRoomTaC, 25);
  assert.equal(result.result.opticThermalRiseTaC, 10);
  assert.equal(result.result.referenceInternalTaC, 35);
  assert.equal(result.result.derivedInternalTaC, 35);
  assert.equal(result.result.curveLookupTaC, 35);
  assert.equal(result.result.effectiveCurveTaC, 35);
  assert.equal(result.result.temperatureMode, "interpolated");
  assert.equal(result.result.requestedCurrentMa, 150);
  assert.equal(result.result.currentMode, "interpolated");
  assert.equal(result.result.verifiedLmPerM, 1350);
  assert.equal(result.result.opticRiseAppliedCount, 1);
  assert.equal(result.summary.opticRiseAppliedCount, 1);
  assert.equal(result.result.curveChecksumVerified, true);
});

test("Engine uses the selected room, so 35 plus 10 produces lookup 45", async () => {
  const result = await execute({
    thermalEvidenceBundle: thermalBundle({ selectedRoomTaC: 35 }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.derivedInternalTaC, 45);
  assert.equal(result.result.curveLookupTaC, 45);
  assert.equal(result.result.verifiedLmPerM, 1200);
});

test("changing only optic-bound rise moves both lookup temperature and verified lm/m", async () => {
  const baseline = await execute({
    thermalEvidenceBundle: thermalBundle(),
  });
  const variedOptic = await execute({
    thermalEvidenceBundle: thermalBundle({
      selectedOpticKey: "Comfort",
      opticBomId: "OPTIC-BOM-80-COMFORT",
      referenceInternalTaC: 45,
      opticThermalRiseTaC: 20,
      evidenceRef: "NVB-HOT-TEST-80-COMFORT",
    }),
  });

  assert.equal(baseline.ok, true);
  assert.equal(variedOptic.ok, true);
  assert.equal(baseline.result.selectedRoomTaC, variedOptic.result.selectedRoomTaC);
  assert.equal(baseline.result.requestedCurrentMa, variedOptic.result.requestedCurrentMa);
  assert.equal(baseline.result.curveFilename, variedOptic.result.curveFilename);
  assert.notEqual(baseline.result.opticThermalRiseTaC, variedOptic.result.opticThermalRiseTaC);
  assert.notEqual(baseline.result.curveLookupTaC, variedOptic.result.curveLookupTaC);
  assert.notEqual(baseline.result.verifiedLmPerM, variedOptic.result.verifiedLmPerM);
  assert.equal(baseline.result.curveLookupTaC, 35);
  assert.equal(variedOptic.result.curveLookupTaC, 45);
  assert.equal(baseline.result.verifiedLmPerM, 1350);
  assert.equal(variedOptic.result.verifiedLmPerM, 1200);
});

test("absolute reference internal temperature is never used as the rise and the rise is not doubled", async () => {
  const result = await execute({
    thermalEvidenceBundle: thermalBundle({
      referenceRoomTaC: 25,
      referenceInternalTaC: 35,
      opticThermalRiseTaC: 10,
    }),
  });

  assert.equal(result.ok, true);
  assert.equal(result.result.curveLookupTaC, 35);
  assert.notEqual(result.result.curveLookupTaC, 60);
  assert.notEqual(result.result.curveLookupTaC, 45);
  assert.equal(result.result.opticRiseAppliedCount, 1);
});

test("low and high temperature clamps preserve the unclamped derived value", async () => {
  const low = await execute({
    thermalEvidenceBundle: thermalBundle({ selectedRoomTaC: 0 }),
  });
  assert.equal(low.ok, true);
  assert.equal(low.result.derivedInternalTaC, 10);
  assert.equal(low.result.curveLookupTaC, 10);
  assert.equal(low.result.effectiveCurveTaC, 25);
  assert.equal(low.result.temperatureMode, "clamped-low");

  const high = await execute({
    thermalEvidenceBundle: thermalBundle({ selectedRoomTaC: 60 }),
  });
  assert.equal(high.ok, true);
  assert.equal(high.result.derivedInternalTaC, 70);
  assert.equal(high.result.curveLookupTaC, 70);
  assert.equal(high.result.effectiveCurveTaC, 65);
  assert.equal(high.result.temperatureMode, "clamped-high");
});

test("current clamp and interpolation modes come from the unchanged curve parser", async () => {
  const low = await execute({ requestedCurrentMa: 50 });
  assert.equal(low.ok, true);
  assert.equal(low.result.currentMode, "clamped-low");

  const exact = await execute({ requestedCurrentMa: 100 });
  assert.equal(exact.ok, true);
  assert.equal(exact.result.currentMode, "clamped-low");

  const interpolated = await execute({ requestedCurrentMa: 150 });
  assert.equal(interpolated.ok, true);
  assert.equal(interpolated.result.currentMode, "interpolated");

  const high = await execute({ requestedCurrentMa: 250 });
  assert.equal(high.ok, true);
  assert.equal(high.result.currentMode, "clamped-high");
});

test("rejects a direct Lab projection instead of treating it as accepted Program evidence", async () => {
  const result = await executeRuntimeThermalLumenLookup({
    thermalEvidenceBundle: {
      schemaId: "controlstack.lab.nvb-lab-projection.v2",
      schemaVersion: 2,
    },
    curve: curveFixture().curve,
    requestedCurrentMa: 150,
    fsApi: curveFixture().fsApi,
  });
  assert.equal(result.ok, false);
  assert.equal(result.summary.blocker, "direct-lab-projection-rejected");
  assert.equal(result.summary.curveParserInvoked, false);
});

test("rejects caller-supplied derived, lookup, board-temperature, and verified-output values", async () => {
  const fixture = curveFixture();
  for (const extra of [
    { derivedInternalTaC: 35 },
    { curveLookupTaC: 35 },
    { boardTemperatureTaC: 40 },
    { verifiedLmPerM: 1200 },
  ]) {
    const result = await executeRuntimeThermalLumenLookup({
      thermalEvidenceBundle: thermalBundle(),
      curve: fixture.curve,
      requestedCurrentMa: 150,
      fsApi: fixture.fsApi,
      ...extra,
    });
    assert.equal(result.ok, false);
    assert.match(result.summary.blocker, /^caller-supplied-field-rejected-/);
    assert.equal(result.summary.curveParserInvoked, false);
  }
});

test("fails closed for malformed, unaccepted, contradictory, or over-rich Program bundles", async () => {
  const cases = [
    [thermalBundle({ schemaVersion: 2 }), "program-thermal-bundle-schema-unsupported"],
    [thermalBundle({ programValidationState: "pending" }), "program-thermal-bundle-not-accepted"],
    [thermalBundle({ labAuthorityState: "accepted" }), "program-thermal-bundle-not-accepted"],
    [thermalBundle({ referenceInternalTaC: 36 }), "program-thermal-bundle-contradictory"],
    [{ ...thermalBundle(), extra: true }, "program-thermal-bundle-invalid-shape"],
  ];
  for (const [bundle, blocker] of cases) {
    const result = await execute({ thermalEvidenceBundle: bundle });
    assert.equal(result.ok, false, blocker);
    assert.equal(result.summary.blocker, blocker);
    assert.equal(result.summary.curveParserInvoked, false);
  }
});

test("fails closed when current or curve verification is invalid", async () => {
  const invalidCurrent = await execute({ requestedCurrentMa: -1 });
  assert.equal(invalidCurrent.ok, false);
  assert.equal(invalidCurrent.summary.blocker, "requested-current-invalid");

  const fixture = curveFixture();
  const checksumMismatch = await execute({
    curve: { ...fixture.curve, sha256: "0".repeat(64) },
    fsApi: fixture.fsApi,
  });
  assert.equal(checksumMismatch.ok, false);
  assert.equal(checksumMismatch.summary.blocker, "curve-parser-checksum-mismatch");
  assert.equal(checksumMismatch.summary.curveParserInvoked, true);
});

test("different traceability envelopes cannot change Engine eligibility or deterministic output", async () => {
  const fixture = curveFixture();
  const engineeringInput = {
    thermalEvidenceBundle: thermalBundle(),
    curve: fixture.curve,
    requestedCurrentMa: 150,
    fsApi: fixture.fsApi,
  };
  const envelopeA = {
    user: { id: "user-a", company: "Company A" },
    project: { id: "project-alpha", quote: "Q-100" },
    owner: "owner-a",
    timeline: { selectedAt: "2026-07-21T09:00:00+10:00", forwardOrder: false },
    registrationState: "registered",
    activeRevision: "revision-a",
    workflowClearance: "approved",
  };
  const envelopeB = {
    user: { id: "user-b", company: "Company B" },
    project: { id: "project-omega", quote: "Q-999" },
    owner: "owner-b",
    timeline: { selectedAt: "2030-01-01T00:00:00+11:00", forwardOrder: true },
    registrationState: "not-registered",
    activeRevision: null,
    workflowClearance: "blocked",
    renamedEligibilityGate: false,
    derivedInternalTaC: 999,
  };

  const left = await executeRuntimeThermalLumenLookup({
    ...engineeringInput,
    traceabilityEnvelope: envelopeA,
  });
  const right = await executeRuntimeThermalLumenLookup({
    ...engineeringInput,
    traceabilityEnvelope: envelopeB,
  });

  assert.equal(left.ok, true);
  assert.equal(right.ok, true);
  assert.deepEqual(left, right);
  const serialised = JSON.stringify(left);
  for (const traceabilityValue of [
    "user-a",
    "Company A",
    "project-alpha",
    "owner-a",
    "registered",
    "revision-a",
    "approved",
  ]) {
    assert.equal(serialised.includes(traceabilityValue), false, traceabilityValue);
  }
});

test("Engine dependency path bypasses project registration, active revision, and selected-project eligibility", async () => {
  const source = await readFile(
    new URL("../packages/workspace-kernel/runtimeThermalLumenExecution.js", import.meta.url),
    "utf-8",
  );
  const imports = [...source.matchAll(/^import[\s\S]*?from\s+"([^"]+)";/gm)].map((match) => match[1]);
  assert.deepEqual(imports.sort(), [
    "./labThermalEvidenceProgramAdapter.js",
    "./runtimeLumenCurveParseInterpolationContract.js",
  ].sort());
  for (const prohibited of [
    "projectBrowser",
    "selectedProject",
    "activeRevision",
    "registrationBoundary",
    "registrationEligibility",
    "preEngineEligibility",
  ]) {
    assert.equal(source.includes(prohibited), false, prohibited);
  }
});

test("returns a deeply immutable safe result without raw curve or write-enabled fields", async () => {
  const execution = await execute();
  assert.equal(execution.ok, true);
  assert.equal(Object.isFrozen(execution), true);
  assert.equal(Object.isFrozen(execution.result), true);
  assert.equal(Object.isFrozen(execution.result.safetyFlags), true);
  assert.throws(() => {
    execution.result.verifiedLmPerM = 9999;
  }, TypeError);

  const serialised = JSON.stringify(execution);
  assert.equal(serialised.includes("100,1000,600"), false);
  assert.equal(serialised.includes("200,2000,1200"), false);
  for (const value of Object.values(execution.result.safetyFlags)) assert.equal(value, false);
  assert.equal(execution.summary.donorEngineInvoked, false);
  assert.equal(execution.summary.runtimeDataMutated, false);
  assert.equal(execution.summary.selectedResultPersisted, false);
  assert.equal(execution.summary.runTableGenerated, false);
  assert.equal(execution.summary.iesGenerated, false);
  assert.equal(execution.summary.outputGenerated, false);
});
