import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeIesHandoffReadinessScaffoldSummary,
  buildRuntimeNativeIesHandoffReadinessScaffoldSummary,
  buildEngineRunTableIesHandoffReadinessScaffoldStatus,
  ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_VERSION,
} from "../packages/workspace-kernel/engineRunTableIesHandoffReadinessScaffold.js";

const POLICY_FINGERPRINT = "safe-policy:ies-handoff-readiness-fixture";
const SOURCE_FINGERPRINT = "safe-source:ies-handoff-readiness-fixture";

const scaffoldSourceUrl = new URL("../packages/workspace-kernel/engineRunTableIesHandoffReadinessScaffold.js", import.meta.url);
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
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    exactElectricalValuesReturned: false,
    donorEngineInvoked: false,
    runtimeDataMutated: false,
    selectedResultPersisted: false,
    productionRunTableGenerated: false,
    runTableGenerated: false,
    iesGenerated: false,
    routesAdded: false,
    postEndpointsAdded: false,
    ...overrides,
  };
}

function selectedResultHandoffScaffoldSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.selected-result-handoff-scaffold-summary",
    selectedResultHandoffScaffoldReady: true,
    selectedResultHandoffScaffoldFingerprint: "safe-selected-result-handoff-scaffold:ies-handoff-readiness-fixture",
    handoffReadinessSummary: {
      diagnosticOnly: true,
      selectedResultHandoffScaffoldReady: true,
      sealedCandidateAssemblyPreviewReady: true,
      runTableDomainOutputScaffoldReady: true,
      gateDScaffoldReady: true,
      selectedResultProjectionReady: true,
      safeSelectedResultSourceObjectReady: true,
      staleComparisonReady: false,
      staleComparisonBlocker: "stale-comparison-not-implemented",
      selectedResultPersistenceReady: false,
      productionRunTableReady: false,
      runTableReady: false,
      iesReady: false,
      donorEngineReady: false,
      rawOutputReady: false,
    },
    staleState: "not_compared_fail_closed",
    ...overrides,
  });
}

function runTableDomainOutputScaffoldSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.runtable-domain-output-scaffold-summary",
    runTableDomainOutputScaffoldReady: true,
    runTableDomainOutputScaffoldFingerprint: "safe-runtable-domain-output-scaffold:ies-handoff-readiness-fixture",
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

function sealedCandidateAssemblyPreviewSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.sealed-candidate-assembly-preview-summary",
    sealedCandidateAssemblyPreviewReady: true,
    sealedCandidateAssemblyPreviewFingerprint: "safe-sealed-candidate-assembly-preview:ies-handoff-readiness-fixture",
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

function gateDValidationScaffoldSummary(overrides = {}) {
  return safeSummary({
    schemaId: "controlstack.runtime.engine-runtable.gate-d-validation-scaffold-summary",
    gateDScaffoldReady: true,
    gateDValidationScaffoldFingerprint: "safe-gate-d-validation-scaffold:ies-handoff-readiness-fixture",
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
    sourceInputFingerprint: "safe-selected-result-projection-input:ies-handoff-readiness-fixture",
    selectedResultProjectionFingerprint: "safe-selected-result-projection:ies-handoff-readiness-fixture",
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
      rawBoardDataRowsExposed: false,
      rawUsersExposed: false,
      credentialsExposed: false,
      privatePathsExposed: false,
      rawLabEvidenceExposed: false,
      rawIesExposed: false,
      rawArtefactsExposed: false,
      rawPdfsExposed: false,
    },
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

function safeDraftProjectEnvelopePreviewSummary(overrides = {}) {
  return {
    ok: true,
    schemaId: "selector_safe_draft_project_intent_envelope.v1-runtime",
    schemaVersion: 1,
    previewOnly: true,
    diagnosticOnly: true,
    readOnly: true,
    safeDraftProjectEnvelopePreviewReady: true,
    envelopeFingerprint: "safe-selector-draft-project-envelope:ies-handoff-readiness-fixture",
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    staleComparisonEnabled: false,
    staleState: "not_compared_fail_closed",
    writeDisabledSummary: {
      runtimeDataMutationEnabled: false,
      donorEngineInvocationEnabled: false,
      selectedResultPersistenceEnabled: false,
      runTableGenerationEnabled: false,
      iesGenerationEnabled: false,
      routeCreationEnabled: false,
      postEndpointCreationEnabled: false,
      hubSpotWriteEnabled: false,
      projectWriteEnabled: false,
      contactCreationEnabled: false,
    },
    unsafeExclusionsVerified: {
      verified: true,
      rawProductRowsReturned: false,
      rawSelectorPayloadReturned: false,
      rawEnginePayloadReturned: false,
      rawUsersReturned: false,
      rawCrmReturned: false,
      rawContactsReturned: false,
      selectedResultBodyReturned: false,
      selectedResultPersisted: false,
      runtimeDataMutated: false,
      donorEngineInvoked: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    ...overrides,
  };
}

function curveLookupSummary(overrides = {}) {
  return {
    ok: true,
    diagnosticOnly: true,
    readOnly: true,
    summaryOnly: true,
    safeSummaryOnly: true,
    curveLookupReady: true,
    curveLookupFingerprint: "safe-curve-lookup:ies-handoff-readiness-fixture",
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    ...overrides,
  };
}

function curveParseInterpolationSummary(overrides = {}) {
  return {
    ok: true,
    diagnosticOnly: true,
    readOnly: true,
    summaryOnly: true,
    safeSummaryOnly: true,
    curveParseInterpolationReady: true,
    curveParseInterpolationFingerprint: "safe-curve-parse-interpolation:ies-handoff-readiness-fixture",
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    rawIesContentReturned: false,
    rawPhotometryReturned: false,
    candelaArraysReturned: false,
    base64ArtifactsReturned: false,
    ...overrides,
  };
}

function scaffoldInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    selectedResultHandoffScaffoldSummary: selectedResultHandoffScaffoldSummary(),
    runTableDomainOutputScaffoldSummary: runTableDomainOutputScaffoldSummary(),
    sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary(),
    gateDValidationScaffoldSummary: gateDValidationScaffoldSummary(),
    selectedResultProjectionSummary: selectedResultProjectionSummary(),
    safeDraftProjectEnvelopePreviewSummary: safeDraftProjectEnvelopePreviewSummary(),
    curveLookupSummary: curveLookupSummary(),
    curveParseInterpolationSummary: curveParseInterpolationSummary(),
    ...overrides,
  };
}

function blockerFor(overrides = {}) {
  return buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput(overrides)).blocker;
}

test("accepts complete safe upstream summary set", () => {
  const result = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_ID);
  assert.equal(result.schemaVersion, ENGINE_RUNTABLE_IES_HANDOFF_READINESS_SCAFFOLD_SCHEMA_VERSION);
  assert.equal(result.nativeRuntimeKernel, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.iesHandoffReadinessScaffoldReady, true);
  assert.equal(result.iesReadinessSummary.iesHandoffReadinessScaffoldReady, true);
  assert.equal(result.iesReadinessSummary.readyForFutureIesHandoff, true);
  assert.equal(result.photometryReadinessSummary.summaryOnlyReferences, true);
  assert.equal(result.selectedResultReadinessSummary.selectedResultPersistenceReady, false);
  assert.equal(result.runTableDomainReadinessSummary.productionRunTableReady, false);
});

test("aliases point at the same IES handoff readiness scaffold helper", () => {
  assert.equal(buildRuntimeNativeIesHandoffReadinessScaffoldSummary, buildRuntimeIesHandoffReadinessScaffoldSummary);
  assert.equal(buildEngineRunTableIesHandoffReadinessScaffoldStatus, buildRuntimeIesHandoffReadinessScaffoldSummary);
});

test("emits iesHandoffReadinessScaffoldReady true", () => {
  const result = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());

  assert.equal(result.iesHandoffReadinessScaffoldReady, true);
  assert.equal(result.iesReadinessSummary.iesGenerationReady, false);
  assert.equal(result.iesReadinessSummary.rawIesContentReady, false);
});

test("rejects missing selected-result handoff", () => {
  assert.equal(blockerFor({ selectedResultHandoffScaffoldSummary: null }), "missing-selected-result-handoff-scaffold-summary");
});

test("rejects selected-result handoff not ready", () => {
  assert.equal(
    blockerFor({ selectedResultHandoffScaffoldSummary: selectedResultHandoffScaffoldSummary({ selectedResultHandoffScaffoldReady: false }) }),
    "selected-result-handoff-scaffold-not-ready",
  );
});

test("rejects RunTable domain scaffold not ready", () => {
  assert.equal(
    blockerFor({ runTableDomainOutputScaffoldSummary: runTableDomainOutputScaffoldSummary({ runTableDomainOutputScaffoldReady: false }) }),
    "runtable-domain-output-scaffold-not-ready",
  );
});

test("rejects sealed candidate assembly not ready", () => {
  assert.equal(
    blockerFor({ sealedCandidateAssemblyPreviewSummary: sealedCandidateAssemblyPreviewSummary({ sealedCandidateAssemblyPreviewReady: false }) }),
    "sealed-candidate-assembly-preview-not-ready",
  );
});

test("rejects Gate D not ready", () => {
  assert.equal(
    blockerFor({ gateDValidationScaffoldSummary: gateDValidationScaffoldSummary({ gateDScaffoldReady: false }) }),
    "gate-d-validation-scaffold-not-ready",
  );
});

test("rejects unsafe curve/IES reference", () => {
  assert.equal(blockerFor({ curveLookupSummary: curveLookupSummary({ ok: false }) }), "curve-reference-not-safe");
  assert.equal(blockerFor({ curveParseInterpolationSummary: curveParseInterpolationSummary({ summaryOnly: false }) }), "curve-reference-not-safe");
});

test("rejects raw IES content", () => {
  assert.equal(blockerFor({ rawIesContentReturned: true }), "raw-ies-content-not-approved");
  assert.equal(blockerFor({ curveLookupSummary: curveLookupSummary({ iesText: "IESNA:LM-63-2002\nTILT=NONE" }) }), "raw-ies-content-not-approved");
});

test("rejects raw photometry and candela arrays", () => {
  assert.equal(blockerFor({ rawPhotometryReturned: true }), "raw-photometry-not-approved");
  assert.equal(blockerFor({ curveLookupSummary: curveLookupSummary({ candelaArraysReturned: true }) }), "candela-array-return-not-approved");
});

test("rejects base64/file artefacts", () => {
  assert.equal(blockerFor({ base64ArtifactsReturned: true }), "base64-artifact-not-approved");
  assert.equal(blockerFor({ curveParseInterpolationSummary: curveParseInterpolationSummary({ fileArtifactsReturned: true }) }), "base64-artifact-not-approved");
});

test("rejects raw Engine result/payload", () => {
  assert.equal(blockerFor({ rawEngineResultReturned: true }), "raw-engine-result-not-approved");
  assert.equal(blockerFor({ rawEnginePayloadReturned: true }), "raw-engine-payload-not-approved");
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

test("rejects selected-result persistence", () => {
  assert.equal(blockerFor({ selectedResultPersisted: true }), "selected-result-persistence-not-approved");
  assert.equal(
    blockerFor({ selectedResultHandoffScaffoldSummary: selectedResultHandoffScaffoldSummary({ selectedResultPersisted: true }) }),
    "selected-result-persistence-not-approved",
  );
});

test("rejects RunTable and IES generation", () => {
  assert.equal(blockerFor({ productionRunTableGenerated: true }), "production-runtable-generation-not-approved");
  assert.equal(blockerFor({ runTableGenerated: true }), "production-runtable-generation-not-approved");
  assert.equal(blockerFor({ iesGenerated: true }), "ies-generation-not-approved");
});

test("rejects donor Engine invocation", () => {
  assert.equal(blockerFor({ donorEngineInvoked: true }), "donor-engine-invocation-not-approved");
});

test("rejects RuntimeData mutation", () => {
  assert.equal(blockerFor({ runtimeDataMutated: true }), "runtime-data-mutation-not-approved");
});

test("rejects fingerprint mismatch", () => {
  assert.equal(
    blockerFor({ selectedResultHandoffScaffoldSummary: selectedResultHandoffScaffoldSummary({ sourceFingerprint: "safe-source:mismatch" }) }),
    "fingerprint-mismatch",
  );
  assert.equal(
    blockerFor({ safeDraftProjectEnvelopePreviewSummary: safeDraftProjectEnvelopePreviewSummary({ policyFingerprint: "safe-policy:mismatch" }) }),
    "fingerprint-mismatch",
  );
});

test("staleState defaults to not_compared_fail_closed", () => {
  const result = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());

  assert.equal(result.staleState, "not_compared_fail_closed");
  assert.equal(result.selectedResultReadinessSummary.staleComparisonReady, false);
  assert.equal(result.selectedResultReadinessSummary.staleComparisonBlocker, "stale-comparison-not-implemented");
  assert.ok(result.failClosedDiagnostics.includes("stale-comparison-not-implemented"));
});

test("produces deterministic iesHandoffReadinessScaffoldFingerprint", () => {
  const first = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());
  const second = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());

  assert.equal(first.iesHandoffReadinessScaffoldFingerprint, second.iesHandoffReadinessScaffoldFingerprint);
  assert.match(first.iesHandoffReadinessScaffoldFingerprint, /^safe-ies-handoff-readiness-scaffold:/);
});

test("does not expose raw IES, photometry, candela, base64, Engine payloads, or exact electrical values", () => {
  const result = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());

  assert.equal(result.rawIesContentReturned, false);
  assert.equal(result.rawPhotometryReturned, false);
  assert.equal(result.candelaArraysReturned, false);
  assert.equal(result.base64ArtifactsReturned, false);
  assert.equal(result.rawEnginePayloadReturned, false);
  assert.equal(result.rawEngineResultReturned, false);
  assert.equal(result.rawSelectorPayloadReturned, false);
  assert.equal(result.exactElectricalValuesReturned, false);
});

test("does not invoke donor Engine, mutate RuntimeData, persist selected result, generate production RunTable, or generate IES", () => {
  const result = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());

  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.productionRunTableGenerated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.blockedGenerationSummary.donorEngineInvocationBlocked, true);
  assert.equal(result.blockedGenerationSummary.runtimeDataMutationBlocked, true);
  assert.equal(result.blockedGenerationSummary.selectedResultPersistenceBlocked, true);
  assert.equal(result.blockedGenerationSummary.productionRunTableGenerationBlocked, true);
  assert.equal(result.blockedGenerationSummary.iesGenerationBlocked, true);
});

test("adds no routes or POST endpoints", () => {
  const result = buildRuntimeIesHandoffReadinessScaffoldSummary(scaffoldInput());

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
  assert.equal(scaffoldText.includes("iesGenerationEnabled: true"), false);
  assert.equal(scaffoldText.includes("productionRunTableGenerationEnabled: true"), false);
  assert.equal(scaffoldText.includes("selectedResultPersistenceEnabled: true"), false);
  assert.equal(serverText.includes("engineRunTableIesHandoffReadinessScaffold"), false);
  assert.equal(/POST[\s\S]{0,180}ies-handoff/i.test(serverText), false);
  assert.equal(/ies-handoff[\s\S]{0,180}POST/i.test(serverText), false);
});
