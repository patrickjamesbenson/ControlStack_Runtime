import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildEngineRunTableSafeBoardFamilyProjectionSummary,
  buildRuntimeSafeBoardFamilyProjectionSummary,
  buildSafeBoardFamilyProjectionSummary,
} from "../packages/workspace-kernel/runtimeSafeBoardFamilyProjection.js";

const SOURCE_FINGERPRINT = "a".repeat(64);

function boardRows() {
  return [
    {
      board_family: "raw-linear-alpha-family",
      length_mm: 1400,
      pitch_mm: 70,
      approved: "TRUE",
      light_direction: "Direct",
      control_type: "DALI-2",
      c1_vmax_v: 22.4,
      c1_pmax_w: 11.2,
    },
    {
      board_family: "raw-linear-alpha-family",
      board_length_mm: 700,
      pitch: 70,
      approved: "TRUE",
      light_direction: "Direct",
      control_type: "DALI-2",
      c1_vmax_v: 11.2,
      c1_pmax_w: 5.6,
    },
    {
      novon_family: "raw-linear-beta-family",
      std_length_mm: "1400mm",
      pitch_mm: "8.8",
      approved: "TRUE",
      light_direction: "Indirect",
      control_type: "Fixed Output",
      c1_vmax_v: 21.8,
      c1_pmax_w: 10.9,
    },
  ];
}

function sourceAccessSummary(overrides = {}) {
  const snapshot = {
    BOARDS: boardRows(),
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
      { table: "BOARDS", present: true, rowCount: snapshot.BOARDS.length, rawRowsExposed: false, rawHeadersExposed: false },
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
  assert.equal(serialised.includes("raw-linear-alpha-family"), false);
  assert.equal(serialised.includes("raw-linear-beta-family"), false);
  assert.equal(serialised.includes("secret.user@example.com"), false);
  assert.equal(serialised.includes("email_login"), false);
  assert.equal(serialised.includes("c1_vmax_v"), false);
  assert.equal(serialised.includes("c1_pmax_w"), false);
  assert.equal(serialised.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serialised.includes("C:\\ControlStack"), false);
  assert.equal(serialised.includes("IESNA:"), false);
  assert.equal(serialised.includes("candelaGrid"), false);
}

test("safe board-family projection builds a source-backed ready summary from source-shaped board data", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });

  assert.equal(summary.schemaId, "controlstack.runtime.safe-board-family-projection");
  assert.equal(summary.schemaVersion, 1);
  assert.equal(summary.readOnly, true);
  assert.equal(summary.diagnosticOnly, true);
  assert.equal(summary.safeSummaryOnly, true);
  assert.equal(summary.ok, true);
  assert.equal(summary.boardFamilyProjectionReady, true);
  assert.equal(summary.sourceBacked, true);
  assert.match(summary.sourceFingerprint, /^safe-source:runtime-active-/);
  assert.match(summary.policyFingerprint, /^safe-policy:/);
  assert.match(summary.boardFamilyProjectionFingerprint, /^safe-board-family-projection:/);

  assert.equal(summary.sourceTablePresenceSummary.boardTablePresent, true);
  assert.equal(summary.sourceTablePresenceSummary.boardRowCountBand, "2-5");
  assert.match(summary.sourceTablePresenceSummary.boardSourceMarker, /^safe-source-table:/);
  assert.equal(summary.boardOptionSummary.boardOptionCountBand, "2-5");
  assert.equal(summary.boardOptionSummary.boardFamilyCountBand, "2-5");
  assert.equal(summary.boardOptionSummary.boardFamilyTokens.every((token) => /^safe-board-family:/.test(token)), true);
  assert.equal(summary.boardLengthBandSummary.lengthBands.includes("1000-1999mm"), true);
  assert.equal(summary.boardLengthBandSummary.lengthBands.includes("500-999mm"), true);
  assert.equal(summary.boardPitchBandSummary.pitchBands.includes("50-99mm"), true);
  assert.equal(summary.boardPitchBandSummary.pitchBands.includes("1-9mm"), true);
  assert.equal(summary.boardCompatibilitySummary.hasApprovedBoardOptions, true);
  assert.equal(summary.boardCompatibilitySummary.hasDirectCompatibleBoardOptions, true);
  assert.equal(summary.boardCompatibilitySummary.hasIndirectCompatibleBoardOptions, true);

  assert.equal(summary.boardFamilySummary.sourceBacked, true);
  assert.match(summary.boardFamilySummary.selectedBoardFamilyToken, /^safe-board-family:/);
  assert.equal(summary.boardFamilySummary.rawBoardRowsReturned, false);
  assert.equal(summary.boardFamilySummary.exactElectricalValuesReturned, false);
  assertSafeProjection(summary);
});

test("safe board-family projection aliases resolve to the same implementation", () => {
  const runtime = buildRuntimeSafeBoardFamilyProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });
  const shortAlias = buildSafeBoardFamilyProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });
  const engineAlias = buildEngineRunTableSafeBoardFamilyProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });

  assert.equal(runtime.boardFamilyProjectionFingerprint, shortAlias.boardFamilyProjectionFingerprint);
  assert.equal(runtime.boardFamilyProjectionFingerprint, engineAlias.boardFamilyProjectionFingerprint);
});

test("safe board-family projection fingerprint is deterministic", () => {
  const first = buildRuntimeSafeBoardFamilyProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });
  const second = buildRuntimeSafeBoardFamilyProjectionSummary({ sourceAccessSummary: sourceAccessSummary() });

  assert.equal(first.ok, true);
  assert.equal(first.boardFamilyProjectionFingerprint, second.boardFamilyProjectionFingerprint);
  assert.equal(first.policyFingerprint, second.policyFingerprint);
  assert.deepEqual(first.boardFamilySummary, second.boardFamilySummary);
  assert.deepEqual(first.boardLengthBandSummary, second.boardLengthBandSummary);
  assert.deepEqual(first.boardPitchBandSummary, second.boardPitchBandSummary);
});

test("safe board-family projection fails closed without source fingerprint", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({ source: { sourceFingerprint: null, pathReturned: false } }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.boardFamilyProjectionReady, false);
  assert.equal(summary.blocker, "missing-source-fingerprint");
  assertSafeProjection(summary);
});

test("safe board-family projection fails closed without board table/source marker", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({
      tableSummary: [{ table: "BOARDS", present: false, rowCount: 0 }],
      snapshot: { USERS: [{ email_login: "secret.user@example.com" }] },
    }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "missing-board-family-source-marker");
  assertSafeProjection(summary);
});

test("safe board-family projection fails closed without board-family token", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({
      snapshot: { BOARDS: [{ length_mm: 1400, pitch_mm: 70, approved: "TRUE" }] },
      tableSummary: [{ table: "BOARDS", present: true, rowCount: 1 }],
    }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "missing-board-family-token");
  assertSafeProjection(summary);
});

test("safe board-family projection fails closed without safe length and pitch bands", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary({
      snapshot: { BOARDS: [{ board_family: "safe-family-without-geometry", approved: "TRUE" }] },
      tableSummary: [{ table: "BOARDS", present: true, rowCount: 1 }],
    }),
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "missing-safe-length-pitch-band");
  assertSafeProjection(summary);
});

test("safe board-family projection fails closed when raw board rows are returned", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    rawBoardRowsReturned: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "raw-board-rows-returned");
  assertSafeProjection(summary);
});

test("safe board-family projection fails closed when exact electrical values are exposed", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    exactElectricalValuesReturned: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "exact-electrical-values-returned");
  assertSafeProjection(summary);
});

test("safe board-family projection fails closed when donor Engine invocation is attempted", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    donorEngineInvoked: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "donor-engine-invocation-not-approved");
  assertSafeProjection(summary);
});

test("safe board-family projection fails closed when RuntimeData mutation is attempted", () => {
  const summary = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    runtimeDataMutated: true,
  });

  assert.equal(summary.ok, false);
  assert.equal(summary.blocker, "runtime-data-mutation-not-approved");
  assertSafeProjection(summary);
});

test("safe board-family projection does not generate RunTable or IES", () => {
  const runTable = buildRuntimeSafeBoardFamilyProjectionSummary({
    sourceAccessSummary: sourceAccessSummary(),
    runTableGenerated: true,
  });
  const ies = buildRuntimeSafeBoardFamilyProjectionSummary({
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

test("safe board-family projection adds no public route or POST endpoint", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");
  assert.equal(serverText.includes("safe-board-family-projection"), false);
  assert.equal(serverText.includes("runtimeSafeBoardFamilyProjection"), false);
  assert.equal(serverText.includes("/api/engine-runtable"), false);
});
