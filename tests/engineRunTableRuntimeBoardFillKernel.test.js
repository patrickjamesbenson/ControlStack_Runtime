import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeBoardFillKernelSummary,
  ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableRuntimeBoardFillKernel.js";

function safePolicyFixture() {
  return {
    _snapshot_id: "safe-runtime-fixture-board-fill-5600",
    SYSTEM_POLICY: [
      { item: "segment_max_length_mm", Business: "3650" },
      { item: "segment_min_aesthetic_length_mm", Business: "900" },
      { item: "segment_max_board_split_qty", Business: "0" },
      { item: "start_board_gap", Business: "0" },
      { item: "end_board_gap", Business: "0" },
      { item: "pitch_tolerance_mm", Business: "0" },
      { item: "max_board_gap_mm", Business: "0" },
      { item: "length_pref", Business: "nearest" },
      { item: "gap_mode", Business: "N-1" },
      { item: "electrical_zone_mode", Business: "start_run_as_one_zone" },
    ],
    BOARDS: [
      { part_number: "RAW-BOARD-1", secret_local_path: "C:\\Users\\patrick\\raw-board.csv" },
    ],
    USERS: [{ email: "patrick.james.benson@gmail.com", token: "RAW-USER-TOKEN" }],
  };
}

function safeBoardFamilyFixture(overrides = {}) {
  return {
    boardFamily: "Runtime Safe Linear Board Family",
    boardLengthMm: 1400,
    pitchMm: 17.5,
    boardQuantumMm: 70,
    boardFamilyLengthsSortedDesc: [1400],
    sourceFingerprint: "safe-board-family:runtime-fixture-5600",
    rawRowsReturned: false,
    ...overrides,
  };
}

function validInput(overrides = {}) {
  return {
    selectedTierOrProfile: "Business",
    runLengthMm: 5600,
    sourceSnapshot: safePolicyFixture(),
    sourceBackedBoardFamilySummary: safeBoardFamilyFixture(),
    ...overrides,
  };
}

test("runtime board-fill kernel produces deterministic safe summary for the proven 5600 mm controlled run", () => {
  const result = buildRuntimeBoardFillKernelSummary(validInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_RUNTIME_BOARD_FILL_KERNEL_SCHEMA_VERSION);
  assert.equal(result.sourceKind, "safe-source-backed-diagnostic-fixture");
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.runLengthMm, 5600);
  assert.equal(result.bodyLengthMm, 5600);
  assert.equal(result.selectedTierOrProfile, "Business");
  assert.equal(result.selectedBoardFamily, "Runtime Safe Linear Board Family");
  assert.equal(result.boardCount, 4);
  assert.equal(result.boardLengthMm, 1400);
  assert.equal(result.boardUsedLengthMm, 5600);
  assert.equal(result.slackMm, 0);
  assert.equal(result.gapPolicySummary.mode, "N-1");
  assert.equal(result.gapPolicySummary.totalGapMm, 0);
  assert.equal(result.lengthPolicySummary.lengthPref, "nearest");
  assert.match(result.policyFingerprint, /^safe-policy:[0-9a-f]{40}$/);
  assert.match(result.sourceFingerprint, /^safe-board-fill:[0-9a-f]{40}$/);
  assert.deepEqual(result.failClosedDiagnostics, []);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.iesGenerated, false);
});

test("runtime board-fill kernel fails closed for missing policy/index summary", () => {
  const result = buildRuntimeBoardFillKernelSummary({
    selectedTierOrProfile: "Business",
    runLengthMm: 5600,
    sourceFingerprint: "safe-source:fixture-without-policy-index",
    sourceBackedBoardFamilySummary: safeBoardFamilyFixture(),
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-policy-index-summary");
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.iesGenerated, false);
});

test("runtime board-fill kernel fails closed for impossible board fill", () => {
  const result = buildRuntimeBoardFillKernelSummary(validInput({
    sourceBackedBoardFamilySummary: safeBoardFamilyFixture({
      boardLengthMm: 1500,
      boardFamilyLengthsSortedDesc: [1500],
      sourceFingerprint: "safe-board-family:impossible-fixture",
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "impossible-board-fill");
  assert.equal(result.runLengthMm, 5600);
  assert.equal(result.bodyLengthMm, 5600);
  assert.equal(result.boardUsedLengthMm, 4500);
  assert.equal(result.slackMm, 1100);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.donorEngineInvoked, false);
});

test("runtime board-fill kernel fails closed for missing selected tier/profile", () => {
  const result = buildRuntimeBoardFillKernelSummary({
    runLengthMm: 5600,
    sourceSnapshot: safePolicyFixture(),
    sourceBackedBoardFamilySummary: safeBoardFamilyFixture(),
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-selected-tier-profile");
  assert.equal(result.rawRowsReturned, false);
});

test("runtime board-fill kernel fails closed for missing board family and board length/pitch", () => {
  const missingFamily = buildRuntimeBoardFillKernelSummary(validInput({
    sourceBackedBoardFamilySummary: {},
    sourceFingerprint: "safe-source:fixture",
  }));
  assert.equal(missingFamily.ok, false);
  assert.equal(missingFamily.blocker, "missing-board-family");

  const missingLengthPitch = buildRuntimeBoardFillKernelSummary(validInput({
    sourceBackedBoardFamilySummary: safeBoardFamilyFixture({
      boardLengthMm: "",
      pitchMm: "",
      sourceFingerprint: "safe-board-family:missing-length-pitch",
    }),
  }));
  assert.equal(missingLengthPitch.ok, false);
  assert.equal(missingLengthPitch.blocker, "missing-board-length-pitch");
  assert.equal(missingLengthPitch.rawRowsReturned, false);
  assert.equal(missingLengthPitch.rawCurveRowsReturned, false);
});

test("runtime board-fill kernel fails closed for unsafe negative length and unsupported diagnostic bounds", () => {
  const negative = buildRuntimeBoardFillKernelSummary(validInput({ runLengthMm: -5600 }));
  assert.equal(negative.ok, false);
  assert.equal(negative.blocker, "unsafe-negative-length");

  const outsideBound = buildRuntimeBoardFillKernelSummary(validInput({ runLengthMm: 8400 }));
  assert.equal(outsideBound.ok, false);
  assert.equal(outsideBound.blocker, "unsupported-diagnostic-run-length");
  assert.equal(outsideBound.donorEngineInvoked, false);
});

test("runtime board-fill kernel fails closed when safe source fingerprint is missing", () => {
  const result = buildRuntimeBoardFillKernelSummary({
    selectedTierOrProfile: "Business",
    runLengthMm: 5600,
    runtimePolicyIndexSummary: {
      ok: true,
      tier: "Business",
      lengthPolicies: { gap_mode: "N-1", length_pref: "nearest" },
      numericMm: { start_board_gap: 0, end_board_gap: 0, max_board_gap_mm: 0 },
      rawRowsReturned: false,
    },
    sourceBackedBoardFamilySummary: safeBoardFamilyFixture({ sourceFingerprint: "" }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "missing-source-fingerprint");
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
});

test("runtime board-fill kernel output does not expose raw rows, raw curve rows, users, paths, or payloads", () => {
  const result = buildRuntimeBoardFillKernelSummary(validInput());
  const serialised = JSON.stringify(result);

  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.rawUsersReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.safetyFlags.rawRowsReturned, false);
  assert.equal(result.safetyFlags.rawCurveRowsReturned, false);
  assert.equal(result.safetyFlags.rawUsersReturned, false);
  assert.equal(result.safetyFlags.rawEnginePayloadReturned, false);
  assert.equal(serialised.includes("RAW-BOARD"), false);
  assert.equal(serialised.includes("RAW-USER-TOKEN"), false);
  assert.equal(serialised.includes("USERS"), false);
  assert.equal(serialised.includes("patrick.james.benson"), false);
  assert.equal(serialised.includes("C:\\"), false);
  assert.equal(serialised.includes("secret_local_path"), false);
});

test("runtime board-fill kernel does not invoke donor Engine, mutate RuntimeData, persist selected results, generate IES, or add routes", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/engineRunTableRuntimeBoardFillKernel.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(/from\s+["'][^"']*run_engine/.test(sourceText), false);
  assert.equal(/run_engine\s*\(/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*BoardDataMaker/.test(sourceText), false);
  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(sourceText.includes("C:\\ControlStack_RuntimeData"), false);
  assert.equal(serverText.includes("engineRunTableRuntimeBoardFillKernel"), false);
  assert.equal(serverText.includes("runtime-board-fill"), false);
  assert.equal(serverText.includes("app.post"), false);

  const result = buildRuntimeBoardFillKernelSummary(validInput());
  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
});
