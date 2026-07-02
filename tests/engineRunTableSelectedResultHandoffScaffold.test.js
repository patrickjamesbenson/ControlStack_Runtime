import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeSelectedResultHandoffScaffoldSummary,
  buildRuntimeNativeSelectedResultHandoffScaffoldSummary,
  buildEngineRunTableSelectedResultHandoffScaffoldStatus,
  ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableSelectedResultHandoffScaffold.js";

const POLICY_FINGERPRINT = "safe-policy:selected-result-handoff-fixture";
const SOURCE_FINGERPRINT = "safe-source:selected-result-handoff-fixture";

const scaffoldSourceUrl = new URL("../packages/workspace-kernel/engineRunTableSelectedResultHandoffScaffold.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function safeSummary(overrides = {}) {
  return {
    ok: true,
    diagnosticOnly: true,
    nativeRuntimeKernel: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    rawProductRowsReturned: false,
    rawSelectorPayloadReturned: false,
    rawEnginePayloadReturned: false,
    rawEngineResultReturned: false,
    exactElectricalValuesReturned: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    hubSpotWriteEnabled: false,
    projectWriteEnabled: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function sealedCandidateAssemblyPreviewSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.sealed-candidate-assembly-preview-summary",
    sealedCandidateAssemblyPreviewReady: true,
    sealedCandidateAssemblyPreviewFingerprint: "safe-sealed-candidate-assembly-preview:selected-result-handoff-fixture",
    candidateReadinessSummary: {
      diagnosticOnly: true,
      readyForFutureCandidateHandoff: true,
      productionEngineExecutionReady: false,
      donorEnginePayloadReady: false,
      runTableReady: false,
      iesReady: false,
      selectedResultPersistenceReady: false,
    },
    blockedDependencySummary: {
      blocked: false,
      downstreamEnginePayloadAssemblyBlocked: true,
      donorEngineInvocationBlocked: true,
      runTableGenerationBlocked: true,
      iesGenerationBlocked: true,
      selectedResultPersistenceBlocked: true,
    },
    ...overrides,
  });
}

function runTableDomainOutputScaffoldSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.runtable-domain-output-scaffold-summary",
    runTableDomainOutputScaffoldReady: true,
    runTableDomainOutputScaffoldFingerprint: "safe-runtable-domain-output-scaffold:selected-result-handoff-fixture",
    runTableDomainReadinessSummary: {
      diagnosticOnly: true,
      runTableDomainOutputScaffoldReady: true,
      domainOutputReady: true,
      productionRunTableReady: false,
      donorEngineReady: false,
      donorEnginePayloadReady: false,
      selectedResultPersistenceReady: false,
      iesReady: false,
      routesReady: false,
      postEndpointsReady: false,
    },
    blockedProductionOutputSummary: {
      diagnosticOnly: true,
      blocked: true,
      productionRunTableGenerated: false,
      runTableGenerated: false,
      donorEngineInvocationBlocked: true,
      selectedResultPersistenceBlocked: true,
      iesGenerationBlocked: true,
      rawPayloadOutputBlocked: true,
    },
    ...overrides,
  });
}

function gateDValidationScaffoldSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.gate-d-validation-scaffold-summary",
    gateDScaffoldReady: true,
    gateDValidationScaffoldFingerprint: "safe-gate-d-validation-scaffold:selected-result-handoff-fixture",
    sealedReadinessSummary: {
      diagnosticOnly: true,
      candidateAssemblyReadiness: "ready-for-sealed-candidate-assembly",
      upstreamReady: true,
      fingerprintsMatched: true,
      rawPayloadFlagsDetected: false,
      rawEnginePayloadReturned: false,
    },
    validationReadiness: {
      gateDScaffoldReady: true,
      sealedCandidateAssemblyReady: true,
      donorGateDExactValidationReady: false,
      donorEngineReady: false,
      runTableReady: false,
      iesReady: false,
    },
    ...overrides,
  });
}

function selectedResultProjectionSummary(overrides = {}) {
  return {
    ok: true,
    readOnly: true,
    displayOnly: true,
    contractOnly: true,
    failClosed: true,
    sourceAvailable: true,
    selectedResultAvailable: true,
    state: "selected_accepted",
    resultState: "selected_accepted",
    resultStateLabel: "Engine verified",
    selectedTierOrProfile: "business",
    sourceInputFingerprint: "safe-selected-result-projection-input:selected-result-handoff-fixture",
    selectedResultProjectionFingerprint: "safe-selected-result-projection:selected-result-handoff-fixture",
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    perRunLookupNormalised: true,
    perRunLookupSummary: {
      available: true,
      rawLookupExposed: false,
    },
    safetyFlags: {
      readOnly: true,
      displayOnly: true,
      sourceAvailable: true,
      selectedResultAvailable: true,
      engineExecutionEnabled: false,
      engineVerificationEnabled: false,
      selectedResultIngestionEnabled: false,
      selectedResultPersistenceEnabled: false,
      staleResultComparisonEnabled: false,
      runTableGenerationEnabled: false,
      payloadGenerationEnabled: false,
      iesGenerationEnabled: false,
      drawingGenerationEnabled: false,
      hubSpotCrmWriteBackEnabled: false,
      boardDataMutationEnabled: false,
      rawSelectedPayloadExposed: false,
      rawEngineDebugPayloadExposed: false,
      rawCandidateAlternativesExposedAsFinalOutputs: false,
      rawBoardDataRowsExposed: false,
      rawBoardDataHeadersExposed: false,
      rawUsersExposed: false,
      credentialsExposed: false,
      privatePathsExposed: false,
      rawLabEvidenceExposed: false,
      rawIesExposed: false,
      rawArtefactsExposed: false,
      rawPdfsExposed: false,
    },
    rows: [
      ["selected result available", "true"],
      ["raw per-run lookup exposed", "false"],
    ],
    writes: false,
    generation: false,
    proof: false,
    routesAdded: false,
    postEndpointsAdded: false,
    engineExecutionAttempted: false,
    runTableGenerationAttempted: false,
    selectedResultPersistenceAttempted: false,
    staleResultComparisonAttempted: false,
    ...overrides,
  };
}

function safeSelectedResultSourceObjectSummary(overrides = {}) {
  return {
    ok: true,
    schemaId: "controlstack.engine_runtable.safe_selected_result_source_object.v1",
    schemaVersion: 1,
    sourceKind: "host_local_real_engine_safe_summary",
    readOnly: true,
    nonPersistent: true,
    diagnosticOnly: true,
    accepted: true,
    engineVerified: true,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    safeSelectedResultSourceObjectFingerprint: "safe-selected-result-source-object:selected-result-handoff-fixture",
    sourceInputFingerprint: "safe-selected-result-source-input:selected-result-handoff-fixture",
    resultStateLabel: "Engine verified",
    runCount: 1,
    runs: [
      {
        runKey: "safe-engine-run-1",
        runIndex: 0,
        accepted: true,
        engineVerified: true,
        safeSummaryOnly: true,
        hasBodyRequested: true,
        boardCount: 4,
        segmentCount: 2,
        zoneCount: 2,
        clipPointsCount: 4,
        suspensionPointsCount: 2,
        gearTrayPlanCount: 1,
        reservedRangesCount: 0,
        rawRunReturned: false,
      },
    ],
    persistenceStatus: {
      selectedResultPersisted: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersistenceAttempted: false,
      nonPersistent: true,
    },
    downstreamReadinessFlags: {
      selectedResultSourceObjectAvailable: true,
      selectedResultProjectionReady: false,
      iesHandoffReady: false,
      iesHandoffBlocked: true,
    },
    redactionFlags: {
      rawEnginePayloadExposed: false,
      rawRoughElectricalPayloadExposed: false,
      rawEngineDebugExposed: false,
      rawEngineResultExposed: false,
      rawRunTableRowsExposed: false,
      rawSelectedPayloadExposed: false,
      rawSourceDbRowsExposed: false,
      rawBoardDataRowsExposed: false,
      rawUsersExposed: false,
      rawCandelaExposed: false,
      rawIesExposed: false,
      rawPdfsExposed: false,
      base64ArtefactsExposed: false,
      privatePathsExposed: false,
    },
    safetyFlags: {
      readOnly: true,
      nonPersistent: true,
      diagnosticOnly: true,
      sourceObjectOnly: true,
      failClosed: true,
      engineExecutionEnabled: false,
      selectedResultPersistenceEnabled: false,
      selectedResultPersistenceAttempted: false,
      runTableGenerationEnabled: false,
      payloadGenerationEnabled: false,
      iesGenerationEnabled: false,
      iesHandoffEnabled: false,
      hubSpotCrmWriteBackEnabled: false,
      boardDataMutationEnabled: false,
      runtimeDataMutationEnabled: false,
      donorMutationEnabled: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    blockers: [],
    ...overrides,
  };
}

function scaffoldInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary(),
    runTableDomainOutputScaffoldSummary: runTableDomainOutputScaffoldSummary(),
    gateDValidationScaffoldSummary: gateDValidationScaffoldSummary(),
    selectedResultProjectionSummary: selectedResultProjectionSummary(),
    safeSelectedResultSourceObjectSummary: safeSelectedResultSourceObjectSummary(),
    ...overrides,
  };
}

function blockerFor(overrides = {}) {
  return buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput(overrides)).blocker;
}

test("accepts complete safe candidate/runTable/selected-result projection summaries", () => {
  const result = buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_SELECTED_RESULT_HANDOFF_SCAFFOLD_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.selectedResultHandoffScaffoldReady, true);
  assert.equal(result.handoffReadinessSummary.selectedResultHandoffScaffoldReady, true);
  assert.equal(result.handoffReadinessSummary.selectedResultPersistenceReady, false);
  assert.equal(result.handoffReadinessSummary.productionRunTableReady, false);
  assert.equal(result.handoffReadinessSummary.iesReady, false);
  assert.equal(result.selectedResultProjectionState, "selected-accepted");
  assert.equal(result.safeSelectedResultSourceState, "safe-source-object-summary-ready");
});

test("aliases point at the same selected-result handoff scaffold helper", () => {
  assert.equal(buildRuntimeNativeSelectedResultHandoffScaffoldSummary, buildRuntimeSelectedResultHandoffScaffoldSummary);
  assert.equal(buildEngineRunTableSelectedResultHandoffScaffoldStatus, buildRuntimeSelectedResultHandoffScaffoldSummary);
});

test("rejects missing candidate assembly summary", () => {
  assert.equal(blockerFor({ sealedCandidateAssemblyPreviewSummary: null }), "missing-sealed-candidate-assembly-preview-summary");
});

test("rejects candidate assembly not ready", () => {
  assert.equal(
    blockerFor({ sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ sealedCandidateAssemblyPreviewReady: false }) }),
    "sealed-candidate-assembly-preview-not-ready",
  );
});

test("rejects RunTable domain scaffold not ready", () => {
  assert.equal(
    blockerFor({ runTableDomainOutputScaffoldSummary: runTableDomainOutputScaffoldSummary({ runTableDomainOutputScaffoldReady: false }) }),
    "runtable-domain-output-scaffold-not-ready",
  );
});

test("rejects Gate D validation scaffold not ready", () => {
  assert.equal(
    blockerFor({ gateDValidationScaffoldSummary: gateDValidationScaffoldSummary({ gateDScaffoldReady: false }) }),
    "gate-d-validation-scaffold-not-ready",
  );
});

test("rejects missing selected-result projection summary", () => {
  assert.equal(blockerFor({ selectedResultProjectionSummary: null }), "missing-selected-result-projection-summary");
});

test("rejects unsafe selected-result projection summary", () => {
  assert.equal(
    blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ displayOnly: false }) }),
    "unsafe-selected-result-projection-summary",
  );
});

test("rejects selected-result body", () => {
  assert.equal(
    blockerFor({ safeSelectedResultSourceObjectSummary: safeSelectedResultSourceObjectSummary({ selectedResultBody: { marker: "do-not-emit" } }) }),
    "selected-result-body-not-approved",
  );
});

test("rejects selected-result persistence flag", () => {
  assert.equal(blockerFor({ selectedResultPersisted: true }), "selected-result-persistence-not-approved");
  assert.equal(
    blockerFor({ safeSelectedResultSourceObjectSummary: safeSelectedResultSourceObjectSummary({ persistenceStatus: { selectedResultPersisted: true } }) }),
    "selected-result-persistence-not-approved",
  );
});

test("rejects raw Engine result", () => {
  assert.equal(blockerFor({ rawEngineResultReturned: true }), "raw-engine-result-not-approved");
  assert.equal(
    blockerFor({ safeSelectedResultSourceObjectSummary: safeSelectedResultSourceObjectSummary({ rawEngineResultReturned: true }) }),
    "raw-engine-result-not-approved",
  );
});

test("rejects raw Engine payload", () => {
  assert.equal(blockerFor({ rawEnginePayloadReturned: true }), "raw-engine-payload-not-approved");
  assert.equal(
    blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ rawEnginePayloadReturned: true }) }),
    "raw-engine-payload-not-approved",
  );
});

test("rejects raw Selector payload", () => {
  assert.equal(blockerFor({ rawSelectorPayloadReturned: true }), "raw-selector-payload-not-approved");
});

test("rejects raw product rows", () => {
  assert.equal(blockerFor({ rawProductRowsReturned: true }), "raw-product-rows-not-approved");
});

test("rejects exact electrical values", () => {
  assert.equal(blockerFor({ exactElectricalValuesReturned: true }), "exact-electrical-values-not-approved");
});

test("rejects fingerprint mismatch", () => {
  assert.equal(
    blockerFor({ selectedResultProjectionSummary: selectedResultProjectionSummary({ sourceFingerprint: "safe-source:mismatch" }) }),
    "fingerprint-mismatch",
  );
});

test("staleState defaults to not_compared_fail_closed", () => {
  const result = buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput());

  assert.equal(result.staleState, "not_compared_fail_closed");
  assert.equal(result.handoffReadinessSummary.staleComparisonReady, false);
  assert.equal(result.handoffReadinessSummary.staleComparisonBlocker, "stale-comparison-not-implemented");
  assert.ok(result.failClosedDiagnostics.includes("stale-comparison-not-implemented"));
});

test("rejects donor Engine invocation", () => {
  assert.equal(blockerFor({ donorEngineInvoked: true }), "donor-engine-invocation-not-approved");
});

test("rejects RuntimeData mutation", () => {
  assert.equal(blockerFor({ runtimeDataMutated: true }), "runtime-data-mutation-not-approved");
});

test("rejects production RunTable generation", () => {
  assert.equal(blockerFor({ productionRunTableGenerated: true }), "production-runtable-generation-not-approved");
  assert.equal(blockerFor({ runTableGenerated: true }), "production-runtable-generation-not-approved");
});

test("rejects IES generation", () => {
  assert.equal(blockerFor({ iesGenerated: true }), "ies-generation-not-approved");
});

test("rejects HubSpot and project writes", () => {
  assert.equal(blockerFor({ hubSpotWriteEnabled: true }), "hubspot-write-not-approved");
  assert.equal(blockerFor({ projectWriteEnabled: true }), "project-write-not-approved");
});

test("rejects route and POST endpoint flags", () => {
  assert.equal(blockerFor({ routesAdded: true }), "route-or-post-endpoint-not-approved");
  assert.equal(blockerFor({ postEndpointsAdded: true }), "route-or-post-endpoint-not-approved");
});

test("produces deterministic selectedResultHandoffScaffoldFingerprint", () => {
  const first = buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput());
  const second = buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput());

  assert.equal(first.selectedResultHandoffScaffoldFingerprint, second.selectedResultHandoffScaffoldFingerprint);
  assert.match(first.selectedResultHandoffScaffoldFingerprint, /^safe-selected-result-handoff-scaffold:/);
});

test("does not expose raw Engine result, payloads, product rows, or exact electrical values", () => {
  const result = buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput());

  assert.equal(result.rawProductRowsReturned, false);
  assert.equal(result.rawSelectorPayloadReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.rawEngineResultReturned, false);
  assert.equal(result.exactElectricalValuesReturned, false);
});

test("does not invoke donor Engine, mutate RuntimeData, persist selected result, generate RunTable, or generate IES", () => {
  const result = buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput());

  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.productionRunTableGenerated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.handoffReadinessSummary.donorEngineReady, false);
  assert.equal(result.handoffReadinessSummary.selectedResultPersistenceReady, false);
});

test("adds no routes or POST endpoints", () => {
  const result = buildRuntimeSelectedResultHandoffScaffoldSummary(scaffoldInput());

  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.safetyFlags.publicRoutesAdded, false);
  assert.equal(result.safetyFlags.postEndpointsAdded, false);
});

test("scaffold source stays pure and unmounted from routes", async () => {
  const scaffoldText = await readFile(scaffoldSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");

  assert.equal(scaffoldText.includes("node:fs"), false);
  assert.equal(scaffoldText.includes("node:path"), false);
  assert.equal(scaffoldText.includes("run_engine.py"), false);
  assert.equal(scaffoldText.includes("fetch("), false);
  assert.equal(scaffoldText.includes("router.post"), false);
  assert.equal(scaffoldText.includes("app.post"), false);
  assert.equal(scaffoldText.includes("selectedResultPersistenceEnabled: true"), false);
  assert.equal(scaffoldText.includes("iesGenerationEnabled: true"), false);
  assert.equal(scaffoldText.includes("productionRunTableGenerationEnabled: true"), false);
  assert.equal(serverText.includes("engineRunTableSelectedResultHandoffScaffold"), false);
  assert.equal(/POST[\s\S]{0,180}selected-result-handoff/i.test(serverText), false);
  assert.equal(/selected-result-handoff[\s\S]{0,180}POST/i.test(serverText), false);
});
