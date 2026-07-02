import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildEngineRunTableSafeDriverCandidateProjectionSummary,
  buildRuntimeSafeDriverCandidateProjectionSummary,
  buildSafeDriverCandidateProjectionSummary,
} from "../packages/workspace-kernel/runtimeSafeDriverCandidateProjection.js";

const SOURCE_FINGERPRINT = "b".repeat(64);

function driverRows() {
  return [
    {
      model: "raw-driver-alpha-model",
      supply: "cc",
      iout_min_mA: 250,
      iout_max_mA: 700,
      vout_min_v: 12,
      vout_max_v: 54,
      pout_min_w: 5,
      pout_max_w: 60,
      native_control_type: "DALI-2",
      approved: "TRUE",
      cost_buy_each: 12.34,
      driver_util_filename: "driver_util_raw_driver_alpha_model.json",
    },
    {
      code_or_article: "raw-driver-beta-model",
      supply: "cc",
      iout_min_ma: 150,
      iout_max_ma: 350,
      vout_min_v: 10,
      vout_max_v: 42,
      pout_min_w: 3,
      pout_max_w: 30,
      native_control_type: "Non-Dim",
      approved: "TRUE",
      cost_buy_each: 9.87,
    },
    {
      series: "raw-driver-gamma-model",
      supply: "cv",
      iout_min_mA: 50,
      iout_max_mA: 1050,
      vout_max_v: 24,
      pout_max_w: 150,
      native_control_type: "0-10V",
      status: "active",
    },
  ];
}

function sourceAccessSummary(overrides = {}) {
  const snapshot = {
    DRIVERS: driverRows(),
    USERS: [{ email_login: "secret.user@example.com" }],
  };
  return {
    ok: true,
    activeSourceDbLoadedReadOnly: true,
    snapshotAvailableForInternalProbe: true,
    snapshotReturnedInJson: false,
    rawSnapshotSerialized: false,
    source: {
      sourceFingerprint: SOURCE_FINGERPRINT,
      pathReturned: false,
      localPathExposureEnabled: false,
    },
    tableSummary: [
      { table: "DRIVERS", present: true, rowCount: snapshot.DRIVERS.length, rawRowsExposed: false, rawHeadersExposed: false },
      { table: "USERS", present: true, rowCount: snapshot.USERS.length, rawRowsExposed: false, rawHeadersExposed: false },
    ],
    snapshot,
    ...overrides,
  };
}

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "rawRowsReturned",
  "rawSourceSnapshotReturned",
  "rawProductRowsReturned",
  "rawBoardRowsReturned",
  "rawDriverRowsReturned",
  "rawAccessoryRowsReturned",
  "rawRuntimeDataRowsReturned",
  "rawSelectorPayloadReturned",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "exactElectricalValuesReturned",
  "exactElectricalValuesExposed",
  "rawCurveRowsReturned",
  "rawDriverUtilPayloadReturned",
  "rawCurvePointsReturned",
  "rawUsersReturned",
  "rawCrmReturned",
  "rawContactsReturned",
  "privatePathsReturned",
  "credentialsReturned",
  "donorEngineInvoked",
  "donorEngineInvocationAttempted",
  "runtimeDataMutated",
  "selectedResultPersisted",
  "productionRunTableGenerated",
  "runTableGenerated",
  "iesGenerated",
  "routesAdded",
  "postEndpointsAdded",
]);

function assertSafeProjection(summary) {
  for (const key of REQUIRED_FALSE_FLAGS) {
    assert.equal(summary[key], false, key);
    if (summary.safetyFlags && Object.hasOwn(summary.safetyFlags, key)) {
      assert.equal(summary.safetyFlags[key], false, `safetyFlags.${key}`);
    }
  }

  const serialised = JSON.stringify(summary);
  assert.equal(serialised.includes("raw-driver-alpha-model"), false);
  assert.equal(serialised.includes("raw-driver-beta-model"), false);
  assert.equal(serialised.includes("raw-driver-gamma-model"), false);
  assert.equal(serialised.includes("driver_util_raw_driver_alpha_model.json"), false);
  assert.equal(serialised.includes("secret.user@example.com"), false);
  assert.equal(serialised.includes("email_login"), false);
  assert.equal(serialised.includes("iout_min_mA"), false);
  assert.equal(serialised.includes("iout_max_mA"), false);
  assert.equal(serialised.includes("vout_max_v"), false);
  assert.equal(serialised.includes("pout_max_w"), false);
  assert.equal(serialised.includes("cost_buy_each"), false);
  assert.equal(serialised.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serialised.includes("C:\\ControlStack"), false);
  assert.equal(serialised.includes("IESNA:"), false);
  assert.equal(serialised.includes("candelaGrid"), false);
}

test("safe driver-candidate projection builds a source-backed ready summary from source-shaped driver data", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });

  assert.equal(summary.schemaId, "controlstack.runtime.safe-driver-candidate-projection");
  assert.equal(summary.schemaVersion, 1);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.ok, true);
  assert.equal(summary.driverCandidateProjectionReady, true);
  assert.equal(summary.sourceBacked, true);
  assert.match(summary.sourceFingerprint, /^safe-source:runtime-active-/);
  assert.match(summary.policyFingerprint, /^safe-policy:/);
  assert.match(summary.driverCandidateProjectionFingerprint, /^safe-driver-candidate-projection:/);

  assert.equal(summary.sourceTablePresenceSummary.driverTablePresent, true);
  assert.equal(summary.sourceTablePresenceSummary.driverRowCountBand, "2-5");
  assert.match(summary.sourceTablePresenceSummary.driverSourceMarker, /^safe-source-table:/);
  assert.equal(summary.driverOptionSummary.driverCandidateCountBand, "2-5");
  assert.equal(summary.driverOptionSummary.bandedDriverCandidateCountBand, "2-5");
  assert.equal(summary.driverOptionSummary.driverCandidateTokens.every((token) => /^safe-driver-candidate:/.test(token)), true);
  assert.equal(summary.driverElectricalBandSummary.currentBands.includes("safe-band:driver-current-501-700ma"), true);
  assert.equal(summary.driverElectricalBandSummary.voltageBands.includes("safe-band:driver-voltage-49-60v"), true);
  assert.equal(summary.driverElectricalBandSummary.powerBands.includes("safe-band:driver-power-51-100w"), true);
  assert.equal(summary.driverUtilCurveReferenceSummary.curveReferenceAvailable, true);
  assert.match(summary.driverUtilCurveReferenceSummary.curveReferenceFingerprint, /^safe-driver-util-curve-reference:/);
  assert.equal(summary.driverCompatibilitySummary.hasApprovedDriverCandidates, true);
  assert.equal(summary.driverCompatibilitySummary.hasDaliCompatibleDriverCandidates, true);
  assert.equal(summary.driverCompatibilitySummary.hasConstantCurrentDriverCandidates, true);

  assert.equal(summary.driverCandidateSummary.sourceBacked, true);
  assert.match(summary.driverCandidateSummary.selectedDriverCandidateToken, /^safe-driver-candidate:/);
  assert.equal(summary.driverCandidateSummary.rawDriverRowsReturned, false);
  assert.equal(summary.driverCandidateSummary.exactElectricalValuesReturned, false);
  assert.equal(summary.driverCandidateSummary.rawCurveRowsReturned, false);
  assertSafeProjection(summary);
});

test("safe driver-candidate projection aliases resolve to the same implementation", () => {
  const runtime = buildRuntimeSafeDriverCandidateProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });
  const shortAlias = buildSafeDriverCandidateProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });
  const engineAlias = buildEngineRunTableSafeDriverCandidateProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });

  assert.equal(runtime.driverCandidateProjectionFingerprint, shortAlias.driverCandidateProjectionFingerprint);
  assert.equal(runtime.driverCandidateProjectionFingerprint, engineAlias.driverCandidateProjectionFingerprint);
});

test("safe driver-candidate projection fingerprint is deterministic", () => {
  const first = buildRuntimeSafeDriverCandidateProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });
  const second = buildRuntimeSafeDriverCandidateProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });

  assert.equal(first.ok, true);
  assert.equal(first.driverCandidateProjectionFingerprint, second.driverCandidateProjectionFingerprint);
  assert.equal(first.policyFingerprint, second.policyFingerprint);
  assert.deepEqual(first.driverCandidateSummary, second.driverCandidateSummary);
  assert.deepEqual(first.driverElectricalBandSummary, second.driverElectricalBandSummary);
  assert.deepEqual(first.driverUtilCurveReferenceSummary, second.driverUtilCurveReferenceSummary);
});

test("safe driver-candidate projection fails closed without source fingerprint", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({ source: { sourceFingerprint: null, pathReturned: false } }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.driverCandidateProjectionReady, false);
  assert.equal(summary.blocker, "missing-source-fingerprint");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection fails closed without driver source/table marker", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({
      tableSummary: [{ table: "DRIVERS", present: false, rowCount: 0 }],
      snapshot: { USERS: [{ email_login: "secret.user@example.com" }] },
    }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "missing-driver-source-marker");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection fails closed without driver candidate token", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({
      snapshot: { DRIVERS: [{ supply: "cc", iout_min_mA: 250, iout_max_mA: 700, vout_max_v: 54, pout_max_w: 60 }] },
      tableSummary: [{ table: "DRIVERS", present: true, rowCount: 1 }],
    }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "missing-driver-candidate-token");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection fails closed without safe electrical bands", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({
      snapshot: { DRIVERS: [{ model: "safe-token-no-electrical-bands", approved: "TRUE" }] },
      tableSummary: [{ table: "DRIVERS", present: true, rowCount: 1 }],
    }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "missing-safe-electrical-band");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection fails closed when raw driver rows are returned", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    rawDriverRowsReturned: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "raw-driver-rows-returned");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection fails closed when exact electrical values are exposed", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    exactElectricalValuesReturned: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "exact-electrical-values-returned");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection fails closed when raw curve rows are returned", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    rawCurveRowsReturned: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "raw-curve-rows-returned");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection fails closed when donor Engine invocation is attempted", () => {
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    donorEngineInvoked: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "donor-engine-invocation-not-approved");
  assertSafeProjection(summary);
});

test("safe driver-candidate projection does not mutate RuntimeData", () => {
  const source = sourceAccessSummary();
  const before = JSON.stringify(source);
  const summary = buildRuntimeSafeDriverCandidateProjectionSummary({ sourceAccessSummary: source });
  const after = JSON.stringify(source);

  assert.equal(summary.ok, true);
  assert.equal(after, before);
  assert.equal(summary.runtimeDataMutated, false);
  assertSafeProjection(summary);
});

test("safe driver-candidate projection does not generate RunTable or IES", () => {
  const runTable = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    runTableGenerated: true,
  });
  const ies = buildRuntimeSafeDriverCandidateProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    iesGenerated: true,
  });

  assert.equal(runTable.ok, false);
  assert.equal(runTable.blocker, "runtable-generation-not-approved");
  assert.equal(ies.ok, false);
  assert.equal(ies.blocker, "ies-generation-not-approved");
  assertSafeProjection(runTable);
  assertSafeProjection(ies);
});

test("safe driver-candidate projection adds no public route or POST endpoint", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");
  assert.equal(serverText.includes("safe-driver-candidate-projection"), false);
  assert.equal(serverText.includes("runtimeSafeDriverCandidateProjection"), false);
  assert.equal(serverText.includes("/api/engine-runtable"), false);
});
