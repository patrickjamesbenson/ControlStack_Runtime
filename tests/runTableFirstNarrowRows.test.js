import test from "node:test";
import assert from "node:assert/strict";

import {
  buildRunTableFirstNarrowRows,
  buildRuntimeRunTableFirstNarrowRows,
  RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET,
  RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROWS_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowRows.js";
import {
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowOutputHandoffContract.js";
import {
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES,
} from "../packages/workspace-kernel/runTableFirstNarrowRowShapeContract.js";

const POLICY_FINGERPRINT = "safe-policy:runtable-first-narrow-rows-fixture";
const SOURCE_FINGERPRINT = "safe-source:runtable-first-narrow-rows-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:runtable-first-narrow-rows-fixture";
const SOURCE_VERSION_FINGERPRINT = "safe-source-version:runtable-first-narrow-rows-fixture";
const PERSISTED_SUMMARY_FINGERPRINT = "safe-persisted-selected-result-summary:runtable-first-narrow-rows-fixture";
const HANDOFF_CONTRACT_FINGERPRINT = "safe-runtable-first-narrow-output-handoff-contract:runtable-first-narrow-rows-fixture";
const ROW_SHAPE_CONTRACT_FINGERPRINT = "safe-runtable-first-narrow-row-shape-contract:runtable-first-narrow-rows-fixture";

const REQUIRED_ABSENT_KEYS = Object.freeze([
  "runTableRows",
  "rawRunTableRows",
  "rawRows",
  "rawRun",
  "rawEnginePayload",
  "rawEngineResult",
  "enginePayload",
  "engineResult",
  "rawSelectedPayload",
  "selectedResultPayload",
  "selectorPayload",
  "rawSelectorPayload",
  "segments",
  "boards",
  "boardRun",
  "zonePlan",
  "mechanical",
  "suspensionPointsMm",
  "clipPointsMm",
  "gearTrayPlan",
  "driverRows",
  "accessoryRows",
  "SYSTEM_POLICY",
  "SYSTEM_COMPONENTS",
  "PRODUCTS",
  "BOARDS",
  "DRIVERS",
  "ACCESSORIES",
  "exactElectricalValues",
  "voltage",
  "current",
  "watts",
  "vf",
  "ies",
  "iesText",
  "rawIesContent",
  "photometry",
  "candela",
  "candelaGrid",
  "base64Artifacts",
  "pdf",
  "privatePath",
  "localPath",
  "filePath",
  "credentials",
  "targetPath",
  "writeTarget",
  "runtimeDataTarget",
  "boardDataTarget",
  "donorDataTarget",
  "routeTarget",
  "postEndpointTarget",
]);

function rowShapeContract(overrides = {}) {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_SCHEMA_VERSION,
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    state: RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.contractReady,
    runTableFirstNarrowRowShapeContractReady: true,
    failClosed: false,
    readOnly: true,
    contractOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    runTableFirstNarrowRowShapeContractFingerprint: ROW_SHAPE_CONTRACT_FINGERPRINT,
    rowsIncluded: false,
    rowCount: 0,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    runTableGenerationAttempted: false,
    productionRunTableGenerated: false,
    productionRunTableGenerationEnabled: false,
    runTableRowsReturned: false,
    rawRunTableRowsReturned: false,
    runTableRowsPersisted: false,
    runTableOutputPersisted: false,
    runTableOutputHandoffWritten: false,
    runTableOutputHandoffWriteEnabled: false,
    runTableOutputHandoffAttempted: false,
    iesGenerated: false,
    iesGenerationEnabled: false,
    iesGenerationAttempted: false,
    outputGenerated: false,
    outputGenerationEnabled: false,
    drawingGenerationEnabled: false,
    photometryGenerationEnabled: false,
    routesAdded: false,
    publicRouteAdded: false,
    postEndpointsAdded: false,
    postEndpointAdded: false,
    projectWriteEnabled: false,
    runtimeDataMutationEnabled: false,
    runtimeDataMutated: false,
    boardDataMutationEnabled: false,
    donorDataMutationEnabled: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawSelectedPayloadReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    ...overrides,
  };
}

function runTableFirstNarrowOutputSummary(overrides = {}) {
  return {
    schemaId: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_SUMMARY_SCHEMA_VERSION,
    owner: "shell",
    slotOwner: "shell",
    targetKind: "project-envelope-module-downstream-context-summary-slot",
    moduleId: "cs_selector",
    state: "redacted_runtable_first_narrow_output_summary_persisted",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceKind: "persisted-selected-result-summary",
    futureOutputKind: "runtable-first-narrow-output",
    rowsIncluded: false,
    rowCount: 0,
    generated: false,
    generationEnabled: false,
    persisted: false,
    routeAdded: false,
    postEndpointAdded: false,
    runTableFirstNarrowOutputHandoffContractState: RUNTABLE_FIRST_NARROW_OUTPUT_HANDOFF_STATES.contractReady,
    runTableFirstNarrowOutputHandoffContractReady: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    sourceVersionFingerprint: SOURCE_VERSION_FINGERPRINT,
    persistedSelectedResultSummaryFingerprint: PERSISTED_SUMMARY_FINGERPRINT,
    runTableFirstNarrowOutputHandoffContractFingerprint: HANDOFF_CONTRACT_FINGERPRINT,
    runTableGenerated: false,
    runTableGenerationEnabled: false,
    runTableGenerationAttempted: false,
    productionRunTableGenerated: false,
    productionRunTableGenerationEnabled: false,
    runTableRowsReturned: false,
    rawRunTableRowsReturned: false,
    runTableRowsPersisted: false,
    runTableOutputPersisted: false,
    runTableOutputHandoffWritten: false,
    runTableOutputHandoffWriteEnabled: false,
    runTableOutputHandoffAttempted: false,
    iesGenerated: false,
    iesGenerationEnabled: false,
    iesGenerationAttempted: false,
    outputGenerated: false,
    outputGenerationEnabled: false,
    drawingGenerationEnabled: false,
    photometryGenerationEnabled: false,
    routesAdded: false,
    publicRouteAdded: false,
    postEndpointsAdded: false,
    postEndpointAdded: false,
    projectWriteEnabled: false,
    runtimeDataMutationEnabled: false,
    runtimeDataMutated: false,
    boardDataMutationEnabled: false,
    donorDataMutationEnabled: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    rawSelectorPayloadReturned: false,
    rawSelectedPayloadReturned: false,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    privatePathsReturned: false,
    credentialsReturned: false,
    ...overrides,
  };
}

function safeSelectedResultSourceObject(overrides = {}) {
  return {
    sourceKind: "safe-selected-result-source-object-summary",
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceFingerprint: SOURCE_FINGERPRINT,
    runs: [
      {
        runKey: "accepted-safe-run-0",
        rowKey: "accepted-safe-run-0-row",
        runIndex: 0,
        accepted: true,
        engineVerified: true,
        safeSummaryOnly: true,
        redacted: true,
        machineValueSafe: true,
        hasBodyRequested: true,
        boardCount: 2,
        segmentCount: 3,
        zoneCount: 1,
        clipPointsCount: 4,
        suspensionPointsCount: 5,
        gearTrayPlanCount: 1,
        reservedRangesCount: 2,
        rawRunReturned: false,
        rawRunTableRowsReturned: false,
        rawSourceRowsReturned: false,
        rawValuesReturned: false,
      },
      {
        runKey: "accepted-safe-run-1",
        runIndex: 1,
        accepted: true,
        engineVerified: true,
        safeSummaryOnly: true,
        redacted: true,
        machineValueSafe: true,
        boardCount: 999,
      },
    ],
    ...overrides,
  };
}

function validInput(overrides = {}) {
  return {
    runTableFirstNarrowRowShapeContract: rowShapeContract(),
    runTableFirstNarrowOutputSummary: runTableFirstNarrowOutputSummary(),
    safeSelectedResultSourceObject: safeSelectedResultSourceObject(),
    ...overrides,
  };
}

function assertFalseFlags(result) {
  for (const key of RUNTABLE_FIRST_NARROW_ROWS_REQUIRED_FALSE_FLAGS) {
    assert.equal(result[key], false, key);
    assert.equal(result.safetyFlags[key], false, `safetyFlags.${key}`);
  }
}

function assertNoForbiddenKeys(value, path = "result") {
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertNoForbiddenKeys(item, `${path}[${index}]`));
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, nested] of Object.entries(value)) {
    assert.equal(REQUIRED_ABSENT_KEYS.includes(key), false, `${path}.${key} must stay absent`);
    assertNoForbiddenKeys(nested, `${path}.${key}`);
  }
}

function assertBlocked(result, blockerPattern) {
  assert.equal(result.schemaId, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION);
  assert.equal(result.state, RUNTABLE_FIRST_NARROW_ROWS_STATES.blockedFailClosed);
  assert.equal(result.runTableFirstNarrowRowsReady, false);
  assert.equal(result.failClosed, true);
  assert.match(result.blocker, blockerPattern);
  assert.equal(result.rowsIncluded, false);
  assert.equal(result.rowCount, 0);
  assert.equal(result.safeRowsReturned, false);
  assert.equal(result.firstNarrowRowsReturned, false);
  assert.deepEqual(result.rows, []);
  assertFalseFlags(result);
  assertNoForbiddenKeys(result);
}

test("builds one first narrow row from safe selected-result source object", () => {
  const result = buildRunTableFirstNarrowRows(validInput());

  assert.equal(result.schemaId, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION);
  assert.equal(result.rowSchemaId, RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID);
  assert.equal(result.rowSchemaVersion, RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION);
  assert.equal(result.state, RUNTABLE_FIRST_NARROW_ROWS_STATES.ready);
  assert.equal(result.runTableFirstNarrowRowsReady, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.sourceKind, "safe-selected-result-source-object-summary");
  assert.equal(result.rowShapeContractReady, true);
  assert.equal(result.outputHandoffSummaryPresent, true);
  assert.equal(result.rowsIncluded, true);
  assert.equal(result.rowCount, 1);
  assert.equal(result.safeRowsReturned, true);
  assert.equal(result.firstNarrowRowsReturned, true);
  assert.equal(result.readOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.redacted, true);
  assert.equal(result.machineValueSafe, true);
  assert.equal(result.rows.length, 1);

  assert.deepEqual(result.rows[0], {
    rowSchemaId: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
    rowSchemaVersion: RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
    rowKey: "accepted-safe-run-0-row",
    runKey: "accepted-safe-run-0",
    runIndex: 0,
    rowOrdinal: 1,
    rowKind: "first_accepted_safe_run_summary",
    sourceKind: "safe-selected-result-source-object-summary",
    accepted: true,
    engineVerified: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    hasBodyRequested: true,
    boardCount: 2,
    segmentCount: 3,
    zoneCount: 1,
    clipPointsCount: 4,
    suspensionPointsCount: 5,
    gearTrayPlanCount: 1,
    reservedRangesCount: 2,
    rawRunReturned: false,
    rawRunTableRowsReturned: false,
    rawSourceRowsReturned: false,
    rawValuesReturned: false,
  });
  assertFalseFlags(result);
  assertNoForbiddenKeys(result);
});

test("emits only the frozen first narrow row field set", () => {
  const result = buildRunTableFirstNarrowRows(validInput());

  assert.deepEqual(Object.keys(result.rows[0]), [...RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET]);
  assert.deepEqual(Object.keys(result.rows[0]), [
    "rowSchemaId",
    "rowSchemaVersion",
    "rowKey",
    "runKey",
    "runIndex",
    "rowOrdinal",
    "rowKind",
    "sourceKind",
    "accepted",
    "engineVerified",
    "safeSummaryOnly",
    "redacted",
    "machineValueSafe",
    "hasBodyRequested",
    "boardCount",
    "segmentCount",
    "zoneCount",
    "clipPointsCount",
    "suspensionPointsCount",
    "gearTrayPlanCount",
    "reservedRangesCount",
    "rawRunReturned",
    "rawRunTableRowsReturned",
    "rawSourceRowsReturned",
    "rawValuesReturned",
  ]);
});

test("blocks when row-shape contract is not ready", () => {
  const result = buildRunTableFirstNarrowRows(validInput({
    runTableFirstNarrowRowShapeContract: rowShapeContract({
      state: RUNTABLE_FIRST_NARROW_ROW_SHAPE_CONTRACT_STATES.blockedFailClosed,
      runTableFirstNarrowRowShapeContractReady: false,
      failClosed: true,
    }),
  }));

  assertBlocked(result, /row-shape-contract-not-ready/);
  assert.equal(result.rowShapeContractReady, false);
});

test("blocks when RunTable output handoff summary is missing or not persisted", () => {
  const missing = buildRunTableFirstNarrowRows(validInput({ runTableFirstNarrowOutputSummary: undefined }));
  assertBlocked(missing, /runtable-output-handoff-summary-missing/);
  assert.equal(missing.rowShapeContractReady, true);
  assert.equal(missing.outputHandoffSummaryPresent, false);

  const notPersisted = buildRunTableFirstNarrowRows(validInput({
    runTableFirstNarrowOutputSummary: runTableFirstNarrowOutputSummary({
      state: "runtable_first_narrow_output_handoff_contract_ready",
    }),
  }));
  assertBlocked(notPersisted, /runtable-output-handoff-summary-not-persisted/);
  assert.equal(notPersisted.rowShapeContractReady, true);
  assert.equal(notPersisted.outputHandoffSummaryPresent, false);
});

test("blocks unsafe raw RunTable rows and raw payload keys", () => {
  const rawRows = buildRunTableFirstNarrowRows(validInput({
    safeSelectedResultSourceObject: safeSelectedResultSourceObject({
      runTableRows: [{ unsafe: true }],
    }),
  }));
  assertBlocked(rawRows, /blocked-raw-field-runTableRows/);

  const rawPayload = buildRunTableFirstNarrowRows(validInput({
    runTableFirstNarrowOutputSummary: runTableFirstNarrowOutputSummary({
      rawEngineResult: { payload: true },
    }),
  }));
  assertBlocked(rawPayload, /blocked-raw-field-rawEngineResult/);
});

test("keeps production generation/output/routes/POST/persistence/mutation disabled", () => {
  const result = buildRunTableFirstNarrowRows(validInput());

  for (const key of [
    "runTableGenerated",
    "runTableGenerationEnabled",
    "runTableGenerationAttempted",
    "productionRunTableGenerated",
    "productionRunTableGenerationEnabled",
    "runTableRowsReturned",
    "rawRunTableRowsReturned",
    "runTableRowsPersisted",
    "runTableOutputPersisted",
    "runTableOutputHandoffWritten",
    "runTableOutputHandoffWriteEnabled",
    "runTableOutputHandoffAttempted",
    "iesGenerated",
    "iesGenerationEnabled",
    "iesGenerationAttempted",
    "outputGenerated",
    "outputGenerationEnabled",
    "drawingGenerationEnabled",
    "photometryGenerationEnabled",
    "routesAdded",
    "publicRouteAdded",
    "postEndpointsAdded",
    "postEndpointAdded",
    "projectWriteEnabled",
    "runtimeDataMutationEnabled",
    "runtimeDataMutated",
    "boardDataMutationEnabled",
    "donorDataMutationEnabled",
  ]) {
    assert.equal(result[key], false, key);
  }
  assertFalseFlags(result);
});

test("does not persist or write rows to project envelope", () => {
  const projectEnvelope = {
    modules: {
      cs_selector: {
        downstreamContext: {
          selectedResultSummary: { existing: true },
          runTableFirstNarrowOutputSummary: runTableFirstNarrowOutputSummary(),
        },
      },
    },
  };
  const before = JSON.stringify(projectEnvelope);
  const result = buildRunTableFirstNarrowRows(validInput({ projectEnvelope }));

  assert.equal(JSON.stringify(projectEnvelope), before);
  assert.equal(result.rowsIncluded, true);
  assert.equal(result.rowCount, 1);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "targetPath"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "writeTarget"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "runtimeDataTarget"), false);
  assert.equal(Object.prototype.hasOwnProperty.call(result, "routeTarget"), false);
  assertNoForbiddenKeys(result);
});

test("runtime alias points at the same builder", () => {
  assert.equal(buildRuntimeRunTableFirstNarrowRows, buildRunTableFirstNarrowRows);
});
