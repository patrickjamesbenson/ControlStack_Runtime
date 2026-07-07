import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimePolicyIndexKernelStatus,
  buildSafeSourceFingerprintMarker,
  buildSafeTablePresenceSummary,
  buildSourceBackedLengthPolicySummary,
  getRuntimePolicyOverrideContract,
  resolveRuntimeTierPolicies,
  resolveRuntimeTierPolicyValue,
  SEGMENT_MAX_LENGTH_MM_OVERRIDE,
} from "../packages/workspace-kernel/engineRunTableRuntimePolicyIndexKernel.js";

function safePolicyFixture() {
  return {
    _snapshot_id: "C:\\Users\\patrick\\ControlStack_RuntimeData\\private-source.json",
    SYSTEM_POLICY: [
      { item: "driver_util_target_pct", Economy: "0.70", Business: "0.82", First: "0.88" },
      { item: "driver_util_max_pct", Economy: "0.90", Business: "0.95", First: "0.98" },
      { item: "board_selection_prefer_recent", Economy: "FALSE", Business: "TRUE", First: "YES" },
      { item: "diffuser_cross_segment_join", Economy: "FALSE", Business: "TRUE", First: "TRUE" },
      { item: "segment_max_length_mm", Economy: "3200", Business: "3500", First: "3600" },
      { item: "segment_min_aesthetic_length_mm", Economy: "900", Business: "1400", First: "1600" },
      { item: "segment_max_board_split_qty", Economy: "0", Business: "3", First: "4" },
      { item: "segment_split_mode_2piece", Economy: "equal_split", Business: "maximise_maxlen, equal_split", First: "equal_split" },
      { item: "segment_short_piece_position_2piece", Economy: "end", Business: "end, start", First: "mid" },
      { item: "end_plate_std_mm", Economy: "5", Business: "5", First: "5" },
      { item: "end_plate_ip_mm", Economy: "10", Business: "10", First: "10" },
      { item: "min_body_mm", Economy: "1400", Business: "1400", First: "1400" },
      { item: "start_board_gap", Economy: "10", Business: "15", First: "20" },
      { item: "end_board_gap", Economy: "10", Business: "15", First: "20" },
      { item: "pitch_tolerance_mm", Economy: "1.5", Business: "2.5", First: "2.0" },
      { item: "length_pref", Economy: "shorter", Business: "nearest", First: "exact" },
      { item: "gap_mode", Economy: "N+1", Business: "N+1", First: "N-1" },
      { item: "electrical_zone_mode", Economy: "start_segment_as_one_zone", Business: "start_run_as_one_zone", First: "start_run_as_one_zone" },
    ],
    BOARDS: [
      { part_number: "RAW-BOARD-1", secret_local_path: "C:\\Users\\patrick\\raw-board.csv" },
      { part_number: "RAW-BOARD-2" },
    ],
    ACCESSORIES: [{ accessory_id: "ACC-RAW" }],
    USERS: [{ email: "patrick.james.benson@gmail.com", token: "RAW-USER-TOKEN" }],
  };
}

function rowCountFixture() {
  return {
    SYSTEM_POLICY: [{ item: "length_pref", Business: "nearest" }],
    BOARDS: [{ part_number: "A" }, { part_number: "B" }],
    USERS: [{ email: "private@example.com" }],
  };
}

test("runtime policy index kernel creates deterministic safe fingerprint markers", () => {
  const explicit = buildSafeSourceFingerprintMarker(safePolicyFixture());
  assert.equal(explicit.ok, true);
  assert.equal(explicit.basis, "explicit-snapshot-metadata");
  assert.equal(explicit.metadataKey, "_snapshot_id");
  assert.match(explicit.marker, /^safe-_snapshot_id:[0-9a-f]{40}$/);
  assert.equal(explicit.rawMetadataValueReturned, false);

  const serialisedExplicit = JSON.stringify(explicit);
  assert.equal(serialisedExplicit.includes("C:\\"), false);
  assert.equal(serialisedExplicit.includes("\\\\Users\\\\"), false);
  assert.equal(serialisedExplicit.includes("ControlStack_RuntimeData"), false);
  assert.equal(serialisedExplicit.includes("patrick"), false);

  const a = buildSafeSourceFingerprintMarker(rowCountFixture());
  const b = buildSafeSourceFingerprintMarker({ USERS: [{}], BOARDS: [{}, {}], SYSTEM_POLICY: [{}] });
  const c = buildSafeSourceFingerprintMarker({ USERS: [{}], BOARDS: [{}], SYSTEM_POLICY: [{}] });

  assert.equal(a.basis, "table-row-counts");
  assert.equal(a.marker, b.marker);
  assert.notEqual(a.marker, c.marker);
  assert.match(a.marker, /^safe-db:[0-9a-f]{40}$/);
});

test("runtime policy index kernel returns safe table presence summary without raw rows, headers, USERS, or paths", () => {
  const result = buildSafeTablePresenceSummary(safePolicyFixture());

  assert.equal(result.ok, true);
  assert.equal(result.sourceHasSystemPolicy, true);
  assert.equal(result.redactedPrivateTableCount, 1);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawTableHeadersReturned, false);
  assert.equal(result.rawUsersReturned, false);
  assert.equal(result.privatePathsReturned, false);
  assert.deepEqual(
    result.tables.map((entry) => entry.tableName),
    ["ACCESSORIES", "BOARDS", "SYSTEM_POLICY"],
  );
  assert.equal(result.tables.find((entry) => entry.tableName === "BOARDS").rowCount, 2);

  const serialised = JSON.stringify(result);
  assert.equal(serialised.includes("RAW-BOARD"), false);
  assert.equal(serialised.includes("RAW-USER-TOKEN"), false);
  assert.equal(serialised.includes("USERS"), false);
  assert.equal(serialised.includes("patrick.james.benson"), false);
  assert.equal(serialised.includes("C:\\"), false);
  assert.equal(serialised.includes("secret_local_path"), false);
});

test("runtime policy index kernel resolves selected business tier policies with donor-style typing", () => {
  const result = resolveRuntimeTierPolicies(safePolicyFixture(), { tier: "Business" });

  assert.equal(result.ok, true);
  assert.equal(result.tier, "Business");
  assert.equal(result.policies.driver_util_target_pct, 0.82);
  assert.equal(result.policies.driver_util_max_pct, 0.95);
  assert.equal(result.policies.board_selection_prefer_recent, true);
  assert.equal(result.policies.diffuser_cross_segment_join, true);
  assert.equal(result.policies.segment_max_board_split_qty, 3);
  assert.equal(result.policies.pitch_tolerance_mm, 2.5);
  assert.equal(result.policies.length_pref, "nearest");
  assert.equal(result.policies.gap_mode, "N+1");
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawTableHeadersReturned, false);
});

test("runtime policy index kernel resolves individual tier policy values case-insensitively", () => {
  const result = resolveRuntimeTierPolicyValue(safePolicyFixture(), {
    tier: "business",
    policyName: "length_pref",
  });

  assert.equal(result.ok, true);
  assert.equal(result.value, "nearest");
  assert.equal(result.source, "SYSTEM_POLICY");
  assert.equal(result.rawValueReturned, false);
});

test("runtime policy index kernel fails closed for missing policies and missing source values", () => {
  const missingPolicy = resolveRuntimeTierPolicyValue(safePolicyFixture(), {
    tier: "Business",
    policyName: "policy_that_does_not_exist",
  });
  assert.equal(missingPolicy.ok, false);
  assert.equal(missingPolicy.blocker, "missing-policy");
  assert.equal(missingPolicy.rawRowsReturned, false);
  assert.equal(missingPolicy.rawTableHeadersReturned, false);
  assert.equal(missingPolicy.rawUsersReturned, false);
  assert.equal(missingPolicy.privatePathsReturned, false);
  assert.equal(JSON.stringify(missingPolicy).includes("RAW-BOARD"), false);

  const missingTierValue = resolveRuntimeTierPolicyValue(safePolicyFixture(), {
    tier: "Charter",
    policyName: "length_pref",
  });
  assert.equal(missingTierValue.ok, false);
  assert.equal(missingTierValue.blocker, "missing-tier-policy-value");

  const missingTable = resolveRuntimeTierPolicies({ BOARDS: [{}] }, { tier: "Business" });
  assert.equal(missingTable.ok, false);
  assert.equal(missingTable.blocker, "missing-system-policy");
});

test("runtime policy index kernel represents the active donor override contract safely", () => {
  const contract = getRuntimePolicyOverrideContract();
  assert.equal(contract.ok, true);
  assert.equal(contract.segment_max_length_mm, 3650);
  assert.equal(contract.segment_max_length_mm, SEGMENT_MAX_LENGTH_MM_OVERRIDE);
  assert.equal(contract.appliesToAllTiers, true);
  assert.equal(contract.rawRowsReturned, false);
  assert.equal(contract.rawTableHeadersReturned, false);
  assert.equal(contract.rawUsersReturned, false);
  assert.equal(contract.privatePathsReturned, false);

  const policies = resolveRuntimeTierPolicies(safePolicyFixture(), { tier: "Business" });
  assert.equal(policies.ok, true);
  assert.equal(policies.policies.segment_max_length_mm, 3650);
  assert.equal(policies.overrideApplied, true);
  assert.equal(policies.overrideContract.segment_max_length_mm, 3650);
});

test("runtime policy index kernel builds source-backed length policy summary", () => {
  const summary = buildSourceBackedLengthPolicySummary(safePolicyFixture(), { profile: "Business" });

  assert.equal(summary.ok, true);
  assert.equal(summary.summaryType, "source-backed-length-policy");
  assert.equal(summary.tier, "Business");
  assert.equal(summary.segmentMaxLengthMm, 3650);
  assert.equal(summary.segmentMaxLengthOverrideApplied, true);
  assert.equal(summary.lengthPolicies.segment_max_length_mm, 3650);
  assert.equal(summary.lengthPolicies.segment_min_aesthetic_length_mm, "1400");
  assert.equal(summary.lengthPolicies.segment_max_board_split_qty, 3);
  assert.equal(summary.lengthPolicies.length_pref, "nearest");
  assert.equal(summary.numericMm.segment_max_length_mm, 3650);
  assert.equal(summary.numericMm.segment_min_aesthetic_length_mm, 1400);
  assert.equal(summary.numericMm.end_plate_std_mm, 5);
  assert.equal(summary.numericMm.end_plate_ip_mm, 10);
  assert.equal(summary.numericMm.min_body_mm, 1400);
  assert.equal(summary.numericMm.start_board_gap, 15);
  assert.equal(summary.numericMm.end_board_gap, 15);
  assert.equal(summary.rawRowsReturned, false);
  assert.equal(summary.rawTableHeadersReturned, false);
});

test("runtime policy index kernel composite status remains sealed", () => {
  const status = buildRuntimePolicyIndexKernelStatus(safePolicyFixture(), { tier: "Business" });

  assert.equal(status.ok, true);
  assert.equal(status.donorEngineInvoked, false);
  assert.equal(status.safetyFlags.donorEngineInvoked, false);
  assert.equal(status.safetyFlags.runtimeDataMutationEnabled, false);
  assert.equal(status.safetyFlags.boardDataMakerImported, false);
  assert.equal(status.safetyFlags.publicRoutesAdded, false);
  assert.equal(status.safetyFlags.postEndpointsAdded, false);
  assert.equal(status.rawRowsReturned, false);
  assert.equal(status.rawTableHeadersReturned, false);
  assert.equal(status.rawUsersReturned, false);
  assert.equal(status.privatePathsReturned, false);

  const serialised = JSON.stringify(status);
  assert.equal(serialised.includes("RAW-BOARD"), false);
  assert.equal(serialised.includes("RAW-USER-TOKEN"), false);
  assert.equal(serialised.includes("USERS"), false);
  assert.equal(serialised.includes("patrick.james.benson"), false);
  assert.equal(serialised.includes("C:\\"), false);
  assert.equal(serialised.includes("secret_local_path"), false);
});

test("runtime policy index kernel rejects invalid donor policy values fail-closed", () => {
  const invalid = safePolicyFixture();
  invalid.SYSTEM_POLICY = invalid.SYSTEM_POLICY.map((row) => (
    row.item === "length_pref" ? { ...row, Business: "sideways" } : row
  ));

  const result = resolveRuntimeTierPolicies(invalid, { tier: "Business" });
  assert.equal(result.ok, false);
  assert.equal(result.blocker, "policy-validation-failed");
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawTableHeadersReturned, false);
});

test("runtime policy index kernel does not import donor Engine, mutate RuntimeData, or add routes/POST endpoints", async () => {
  const sourceText = await readFile(
    new URL("../packages/workspace-kernel/engineRunTableRuntimePolicyIndexKernel.js", import.meta.url),
    "utf-8",
  );
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(/from\s+["'][^"']*run_engine/.test(sourceText), false);
  assert.equal(/run_engine\s*\(/.test(sourceText), false);
  assert.equal(/from\s+["'][^"']*BoardDataMaker/.test(sourceText), false);
  assert.equal(sourceText.includes("writeFile"), false);
  assert.equal(sourceText.includes("mkdir"), false);
  assert.equal(sourceText.includes("novondb.json"), false);
  assert.equal(serverText.includes("engineRunTableRuntimePolicyIndexKernel"), false);
  assert.equal(serverText.includes("runtime-policy-index"), false);
  assert.equal(serverText.includes("app.post"), false);
});
