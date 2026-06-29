import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  SELECTED_RESULT_APPROVED_STATE_LABELS,
  SELECTED_RESULT_FAMILY_SUBSET_LOCK_SHAPE,
  SELECTED_RESULT_PER_RUN_DISPLAY_ROW_SHAPE,
  SELECTED_RESULT_PROJECTION_STATES,
  SELECTED_RESULT_PROJECTION_STATE_LABELS,
  SELECTED_RESULT_REDACTION_RULES,
  SELECTED_RESULT_SAFETY_FLAGS,
  SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS,
  buildSelectedResultProjectionContract,
  createSelectedResultPerRunDisplayRowShape,
} from "../packages/workspace-kernel/selectedResultProjectionService.js";

const serverSourceUrl = new URL("../server.js", import.meta.url);

const REQUIRED_STATES = Object.freeze([
  "no_selected_result",
  "estimated_preview",
  "engine_verified",
  "stale",
  "selected_accepted",
]);

const REQUIRED_LABELS = Object.freeze([
  "Estimated preview",
  "Engine verified",
  "Run table changed — verify again",
]);

const REQUIRED_STALE_INPUT_KEYS = Object.freeze([
  "tierStrategy",
  "system",
  "optic",
  "environment",
  "finishes",
  "controlType",
  "lightTarget",
  "cct",
  "cri",
  "runLength",
  "runQty",
  "runAccessories",
  "emergencyPlacementIntent",
  "accessoryPlacementIntent",
]);

const REQUIRED_PER_RUN_FIELDS = Object.freeze([
  "runKey",
  "runLabel",
  "runNumber",
  "runLengthMm",
  "bodyMmRequested",
  "segmentSummary",
  "segmentsSummary",
  "reservedRangesSummary",
  "boardRunSummary",
  "boardCount",
  "boardFamily",
  "zoneCount",
  "zonePlanSummary",
  "zoneTargetSummary",
  "mechanicalSummary",
  "suspensionSummary",
  "clipSummary",
  "gearTraySummary",
  "sanitisedWarnings",
]);

function assertAllGenerationProofWriteFlagsDisabled(flags) {
  assert.equal(flags.engineExecutionEnabled, false);
  assert.equal(flags.engineVerificationEnabled, false);
  assert.equal(flags.selectedResultIngestionEnabled, false);
  assert.equal(flags.selectedResultPersistenceEnabled, false);
  assert.equal(flags.staleResultComparisonEnabled, false);
  assert.equal(flags.runTableGenerationEnabled, false);
  assert.equal(flags.payloadGenerationEnabled, false);
  assert.equal(flags.iesGenerationEnabled, false);
  assert.equal(flags.drawingGenerationEnabled, false);
  assert.equal(flags.labProofAuthority, false);
  assert.equal(flags.controlledRecordsWriteEnabled, false);
  assert.equal(flags.rregApprovalEnabled, false);
  assert.equal(flags.rregCustodyTransferEnabled, false);
  assert.equal(flags.hubSpotCrmWriteBackEnabled, false);
  assert.equal(flags.boardDataMutationEnabled, false);
  assert.equal(flags.hiddenWriteBackEnabled, false);
}

function assertAllRawExposureFlagsDisabled(flags) {
  assert.equal(flags.rawSelectedPayloadExposed, false);
  assert.equal(flags.rawEngineDebugPayloadExposed, false);
  assert.equal(flags.rawCandidateAlternativesExposedAsFinalOutputs, false);
  assert.equal(flags.rawBoardDataRowsExposed, false);
  assert.equal(flags.rawBoardDataHeadersExposed, false);
  assert.equal(flags.rawUsersExposed, false);
  assert.equal(flags.credentialsExposed, false);
  assert.equal(flags.privatePathsExposed, false);
  assert.equal(flags.rawLabEvidenceExposed, false);
  assert.equal(flags.rawIesExposed, false);
  assert.equal(flags.rawArtefactsExposed, false);
  assert.equal(flags.rawPdfsExposed, false);
}

test("selected-result projection contract returns fail-closed no-source state", () => {
  const projection = buildSelectedResultProjectionContract();
  const rows = Object.fromEntries(projection.rows);

  assert.equal(projection.ok, true);
  assert.equal(projection.readOnly, true);
  assert.equal(projection.displayOnly, true);
  assert.equal(projection.contractOnly, true);
  assert.equal(projection.failClosed, true);
  assert.equal(projection.source, "future Engine/RunTable selected-result projection");
  assert.equal(projection.sourceAvailable, false);
  assert.equal(projection.sourceState, "no_source");
  assert.equal(projection.state, "no_selected_result");
  assert.equal(projection.resultStateLabel, "Estimated preview");
  assert.equal(projection.selectedResultAvailable, false);
  assert.equal(projection.engineVerified, false);
  assert.equal(projection.stale, false);
  assert.equal(projection.accepted, false);
  assert.equal(projection.engineVerificationEnabled, false);
  assert.equal(projection.selectedResultIngestionEnabled, false);
  assert.equal(projection.selectedResultPersistenceEnabled, false);
  assert.equal(projection.staleResultComparisonEnabled, false);
  assert.equal(rows["selected result available"], "false");
  assert.equal(rows["engine verified"], "false");
  assert.equal(rows.stale, "false");
  assert.equal(rows.accepted, "false");
});

test("selected-result projection state enum and approved labels are donor-backed", () => {
  const projection = buildSelectedResultProjectionContract();

  assert.deepEqual(SELECTED_RESULT_PROJECTION_STATES, REQUIRED_STATES);
  assert.deepEqual(projection.stateEnum, REQUIRED_STATES);
  assert.equal(SELECTED_RESULT_PROJECTION_STATE_LABELS.no_selected_result, "Estimated preview");
  assert.equal(SELECTED_RESULT_PROJECTION_STATE_LABELS.estimated_preview, "Estimated preview");
  assert.equal(SELECTED_RESULT_PROJECTION_STATE_LABELS.engine_verified, "Engine verified");
  assert.equal(SELECTED_RESULT_PROJECTION_STATE_LABELS.stale, "Run table changed — verify again");
  assert.equal(SELECTED_RESULT_PROJECTION_STATE_LABELS.selected_accepted, "Engine verified");
  for (const label of REQUIRED_LABELS) {
    assert.ok(SELECTED_RESULT_APPROVED_STATE_LABELS.includes(label));
    assert.ok(projection.approvedStateLabels.includes(label));
  }
  assert.equal(projection.staleHistoricalLabel, "Result stale — run table changed, verify again");
});

test("selected-result projection documents per-run display row shape without values", () => {
  const projection = buildSelectedResultProjectionContract();
  const rowShape = createSelectedResultPerRunDisplayRowShape();

  assert.deepEqual(Object.keys(SELECTED_RESULT_PER_RUN_DISPLAY_ROW_SHAPE), REQUIRED_PER_RUN_FIELDS);
  assert.deepEqual(Object.keys(rowShape), REQUIRED_PER_RUN_FIELDS);
  assert.deepEqual(Object.keys(projection.perRunDisplayRowShape), REQUIRED_PER_RUN_FIELDS);
  for (const value of Object.values(rowShape)) {
    assert.equal(value, null);
  }
  for (const value of Object.values(projection.perRunDisplayRowShape)) {
    assert.equal(value, null);
  }
  assert.deepEqual(projection.runs, []);
  assert.deepEqual(projection.runsByKey, {});
  assert.equal(projection.perRunLookupNormalised, false);
  assert.equal(projection.perRunLookupKey, "run id / run number");
});

test("selected-result projection keeps selected family/subset lock as a null placeholder", () => {
  const projection = buildSelectedResultProjectionContract();

  assert.equal(projection.selectedFamilySubsetLock, null);
  assert.deepEqual(projection.selectedFamilySubsetLockShape, SELECTED_RESULT_FAMILY_SUBSET_LOCK_SHAPE);
  assert.deepEqual(Object.keys(projection.selectedFamilySubsetLockShape), [
    "boardFamily",
    "pitchFamily",
    "opticCurrentAssumptions",
    "zoneSplitStrategy",
    "driverFamily",
  ]);
  for (const value of Object.values(projection.selectedFamilySubsetLockShape)) {
    assert.equal(value, null);
  }
});

test("selected-result projection lists stale-sensitive input keys without implementing comparison", () => {
  const projection = buildSelectedResultProjectionContract();

  for (const key of REQUIRED_STALE_INPUT_KEYS) {
    assert.ok(SELECTED_RESULT_STALE_SENSITIVE_INPUT_KEYS.includes(key));
    assert.ok(projection.staleSensitiveInputKeys.includes(key));
  }
  assert.ok(projection.staleSensitiveInputKeys.includes("selectedBoardFamily"));
  assert.ok(projection.staleSensitiveInputKeys.includes("selectedPitchFamily"));
  assert.ok(projection.staleSensitiveInputKeys.includes("opticCurrentAssumptions"));
  assert.ok(projection.staleSensitiveInputKeys.includes("zoneSplitStrategy"));
  assert.ok(projection.staleSensitiveInputKeys.includes("driverFamily"));
  assert.ok(projection.staleSensitiveInputKeys.includes("selectorPayloadFingerprint"));
  assert.ok(projection.staleSensitiveInputKeys.includes("boardDataSourceVersion"));
  assert.equal(projection.staleResultComparisonEnabled, false);
});

test("selected-result projection safety flags keep all execution, generation, proof, write, and raw exposure paths disabled", () => {
  const projection = buildSelectedResultProjectionContract();

  assert.equal(SELECTED_RESULT_SAFETY_FLAGS.readOnly, true);
  assert.equal(SELECTED_RESULT_SAFETY_FLAGS.displayOnly, true);
  assert.equal(SELECTED_RESULT_SAFETY_FLAGS.contractOnly, true);
  assertAllGenerationProofWriteFlagsDisabled(SELECTED_RESULT_SAFETY_FLAGS);
  assertAllGenerationProofWriteFlagsDisabled(projection.safetyFlags);
  assertAllRawExposureFlagsDisabled(SELECTED_RESULT_SAFETY_FLAGS);
  assertAllRawExposureFlagsDisabled(projection.safetyFlags);
  assert.equal(projection.writes, false);
  assert.equal(projection.generation, false);
  assert.equal(projection.proof, false);
  assert.equal(projection.routesAdded, false);
  assert.equal(projection.postEndpointsAdded, false);
});

test("selected-result projection redaction boundary excludes raw final-output internals", () => {
  const projection = buildSelectedResultProjectionContract();
  const text = JSON.stringify(projection);

  assert.deepEqual(projection.redactionRules, SELECTED_RESULT_REDACTION_RULES);
  assert.ok(projection.redactionRules.some((rule) => rule.includes("not the raw selected payload")));
  assert.ok(projection.redactionRules.some((rule) => rule.includes("not raw engine debug")));
  assert.ok(projection.redactionRules.some((rule) => rule.includes("one accepted selected result only")));
  assert.equal(text.includes("rough_electrical_payload"), false);
  assert.equal(text.includes("\"debug\":"), false);
  assert.equal(text.includes("candidate_alternatives"), false);
});

test("selected-result projection slice adds no Engine, Selector, or POST route", async () => {
  const serverText = await readFile(serverSourceUrl, "utf-8");

  assert.equal(serverText.includes("/api/engine/run"), false);
  assert.equal(serverText.includes("/api/selector/run"), false);
  assert.equal(serverText.includes("SELECTOR_POST"), false);
  assert.equal(serverText.includes("selected-result"), false);
});
