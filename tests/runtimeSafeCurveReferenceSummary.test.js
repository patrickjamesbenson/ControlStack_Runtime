import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeSafeCurveReferenceSummary,
  buildSafeCurveReferenceSummary,
  buildEngineRunTableSafeCurveReferenceSummary,
  buildRuntimeSafePhotometryReferenceSummary,
  buildRuntimeSafePhotometrySourceAnchorSummary,
  buildSafePhotometryReferenceSummary,
  RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_ID,
  RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_VERSION,
  RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_CONTRACT_ID,
  RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_ID,
  RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runtimeSafeCurveReferenceSummary.js";
import { buildRuntimeIesHandoffReadinessScaffoldSummary } from "../packages/workspace-kernel/engineRunTableIesHandoffReadinessScaffold.js";

const POLICY_FINGERPRINT = "safe-policy:curve-reference-fixture";
const SOURCE_FINGERPRINT = "safe-source:curve-reference-fixture";

const helperSourceUrl = new URL("../packages/workspace-kernel/runtimeSafeCurveReferenceSummary.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function lumenCurveLookupStatus(overrides = {}) {
  return {
    ok: true,
    contract_id: "controlstack.runtime.lumen-curve.lookup-contract",
    contract_version: 1,
    source_kind: "lumen_curve_csv_static_mirror",
    source_root_classification: "runtime-authority-reference",
    runtime_curve_home: {
      label: "runtime-authority-reference-lumen-curves",
      exists: true,
      readable: true,
      curveFileCount: 201,
      localPathReturned: false,
    },
    manifest: {
      exists: true,
      readable: true,
      valid: true,
      fileCount: 201,
      declaredFileCount: 201,
      checksumCoverageCount: 201,
      rawCurveRowsIncluded: false,
      raw_payload_returned: false,
      raw_curve_rows_returned: false,
      localPathReturned: false,
    },
    diagnostics: [],
    safetyFlags: {
      raw_payload_returned: false,
      raw_curve_rows_returned: false,
      rawCurvePayloadsExposed: false,
      rawCurveRowsReturned: false,
      activeSnapshotMutated: false,
      runtimeDataMutated: false,
      donorFilesMutated: false,
      boardDataMakerImported: false,
      donorEngineInvoked: false,
      publicRouteAdded: false,
      postEndpointAdded: false,
    },
    ...overrides,
  };
}

function driverUtilCurveLookupStatus(overrides = {}) {
  return {
    ok: true,
    contract_id: "controlstack.runtime.driver-util-curve.lookup-contract",
    contract_version: 1,
    source_kind: "driver_util_curve_json_static_mirror",
    source_root_classification: "donor-static-driver-util-source",
    runtime_driver_util_curve_home: {
      label: "runtime-authority-reference-driver-util-curves",
      exists: true,
      readable: true,
      curveFileCount: 19,
      localPathReturned: false,
    },
    manifest: {
      exists: true,
      readable: true,
      valid: true,
      fileCount: 19,
      declaredFileCount: 19,
      checksumCoverageCount: 19,
      rawDriverUtilPayloadsIncluded: false,
      raw_payload_returned: false,
      raw_curve_points_returned: false,
      localPathReturned: false,
    },
    diagnostics: [],
    safetyFlags: {
      raw_payload_returned: false,
      raw_curve_points_returned: false,
      rawDriverUtilPayloadsExposed: false,
      rawCurvePointsReturned: false,
      activeSnapshotMutated: false,
      runtimeDataMutated: false,
      donorFilesMutated: false,
      boardDataMakerImported: false,
      donorEngineInvoked: false,
      driverSizingImplemented: false,
      driverSelectionPerformed: false,
      iesGenerated: false,
      selectedResultPersisted: false,
      publicRouteAdded: false,
      postEndpointAdded: false,
    },
    ...overrides,
  };
}

function summaryInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    lumenCurveLookupStatus: lumenCurveLookupStatus(),
    driverUtilCurveLookupStatus: driverUtilCurveLookupStatus(),
    ...overrides,
  };
}

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

function iesScaffoldInput(curveReferenceSummary) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    selectedResultHandoffScaffoldSummary: safeSummary({
      selectedResultHandoffScaffoldReady: true,
      selectedResultHandoffScaffoldFingerprint: "safe-selected-result-handoff-scaffold:curve-reference-fixture",
    }),
    runTableDomainOutputScaffoldSummary: safeSummary({
      runTableDomainOutputScaffoldReady: true,
      runTableDomainOutputScaffoldFingerprint: "safe-runtable-domain-output-scaffold:curve-reference-fixture",
    }),
    sealedCandidateAssemblyPreviewSummary: safeSummary({
      sealedCandidateAssemblyPreviewReady: true,
      sealedCandidateAssemblyPreviewFingerprint: "safe-sealed-candidate-assembly-preview:curve-reference-fixture",
    }),
    gateDValidationScaffoldSummary: safeSummary({
      gateDScaffoldReady: true,
      gateDValidationScaffoldFingerprint: "safe-gate-d-validation-scaffold:curve-reference-fixture",
    }),
    safeCurveReferenceSummary: curveReferenceSummary,
  };
}

function serialised(value) {
  return JSON.stringify(value);
}

test("builds ready safe curve reference from synthetic manifest/status-shaped input", () => {
  const result = buildRuntimeSafeCurveReferenceSummary(summaryInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTIME_SAFE_CURVE_REFERENCE_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.curveReferenceSummaryReady, true);
  assert.equal(result.readOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.sourceBacked, true);
  assert.equal(result.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(result.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.match(result.curveReferenceFingerprint, /^safe-curve-reference:/);
  assert.equal(result.lumenCurveReferenceSummary.manifestValid, true);
  assert.equal(result.lumenCurveReferenceSummary.curveFileCountBand, "100-plus");
  assert.equal(result.driverUtilCurveReferenceSummary.manifestValid, true);
  assert.equal(result.driverUtilCurveReferenceSummary.curveFileCountBand, "6-25");
  assert.equal(result.sourceHomeStatusSummary.sourceHomeStatusReady, true);
  assert.equal(result.iesPhotometryReferenceSummary.photometryReferenceReady, true);
});

test("aliases point at the same safe curve reference helper", () => {
  assert.equal(buildSafeCurveReferenceSummary, buildRuntimeSafeCurveReferenceSummary);
  assert.equal(buildEngineRunTableSafeCurveReferenceSummary, buildRuntimeSafeCurveReferenceSummary);
});

test("emits only safe tokens, fingerprints, count bands, and readiness booleans", () => {
  const result = buildRuntimeSafeCurveReferenceSummary(summaryInput());
  const text = serialised(result);

  assert.match(result.lumenCurveReferenceSummary.curveReferenceToken, /^safe-lumen-curve-reference:/);
  assert.match(result.driverUtilCurveReferenceSummary.curveReferenceToken, /^safe-driver-util-curve-reference:/);
  assert.match(result.iesPhotometryReferenceSummary.iesPhotometryReferenceToken, /^safe-ies-photometry-reference:/);
  assert.equal(result.rawCurveRowsReturned, false);
  assert.equal(result.rawIesContentReturned, false);
  assert.equal(result.rawPhotometryReturned, false);
  assert.equal(result.candelaArraysReturned, false);
  assert.equal(result.base64ArtifactsReturned, false);
  assert.equal(result.filenamesReturned, false);
  assert.equal(result.localPathsReturned, false);
  assert.equal(result.exactElectricalValuesReturned, false);
  assert.equal(text.includes(".csv"), false);
  assert.equal(text.includes(".json"), false);
  assert.equal(text.includes(".ies"), false);
  assert.equal(text.includes("C:\\"), false);
  assert.equal(text.includes("IESNA:"), false);
  assert.equal(text.includes("TILT="), false);
  assert.equal(text.includes("candelaGrid"), false);
  assert.equal(text.includes("data:application"), false);
});

test("produces deterministic curveReferenceFingerprint", () => {
  const first = buildRuntimeSafeCurveReferenceSummary(summaryInput());
  const second = buildRuntimeSafeCurveReferenceSummary(summaryInput());

  assert.equal(first.curveReferenceFingerprint, second.curveReferenceFingerprint);
  assert.match(first.curveReferenceFingerprint, /^safe-curve-reference:/);
});

test("fails closed if raw curve rows are present", () => {
  const result = buildRuntimeSafeCurveReferenceSummary(summaryInput({
    lumenCurveLookupStatus: lumenCurveLookupStatus({
      manifest: {
        ...lumenCurveLookupStatus().manifest,
        rawCurveRowsIncluded: true,
      },
    }),
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "raw-curve-rows-not-approved");
  assert.equal(result.rawCurveRowsReturned, false);
});

test("fails closed if raw IES, candela, or base64 content is present", () => {
  const rawIes = buildRuntimeSafeCurveReferenceSummary(summaryInput({ iesText: "IESNA:LM-63-2002\nTILT=NONE" }));
  assert.equal(rawIes.ok, false);
  assert.equal(rawIes.blocker, "raw-ies-content-not-approved");

  const candela = buildRuntimeSafeCurveReferenceSummary(summaryInput({ candelaArraysReturned: true }));
  assert.equal(candela.ok, false);
  assert.equal(candela.blocker, "candela-array-return-not-approved");

  const base64 = buildRuntimeSafeCurveReferenceSummary(summaryInput({ fileArtifact: "data:application/pdf;base64,AAAA" }));
  assert.equal(base64.ok, false);
  assert.equal(base64.blocker, "base64-artifact-not-approved");
});

test("fails closed if filenames or local paths are returned", () => {
  const filename = buildRuntimeSafeCurveReferenceSummary(summaryInput({ filename: "unsafe_curve.csv" }));
  assert.equal(filename.ok, false);
  assert.equal(filename.blocker, "filename-or-local-path-not-approved");

  const localPath = buildRuntimeSafeCurveReferenceSummary(summaryInput({ localPath: "C:\\ControlStack_RuntimeData\\authority-reference" }));
  assert.equal(localPath.ok, false);
  assert.equal(localPath.blocker, "filename-or-local-path-not-approved");
});

test("fails closed if exact electrical values are returned", () => {
  const result = buildRuntimeSafeCurveReferenceSummary(summaryInput({ current_ma: 350 }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "exact-electrical-values-not-approved");
  assert.equal(result.exactElectricalValuesReturned, false);
});

test("fails closed if donor photometry generation or IES generation is attempted", () => {
  const photometry = buildRuntimeSafeCurveReferenceSummary(summaryInput({ donorPhotometryGenerationInvoked: true }));
  assert.equal(photometry.ok, false);
  assert.equal(photometry.blocker, "ies-generation-not-approved");

  const ies = buildRuntimeSafeCurveReferenceSummary(summaryInput({ iesGenerated: true }));
  assert.equal(ies.ok, false);
  assert.equal(ies.blocker, "ies-generation-not-approved");
});

test("fails closed when required source and manifest/status markers are missing", () => {
  const missingSource = buildRuntimeSafeCurveReferenceSummary({
    lumenCurveLookupStatus: lumenCurveLookupStatus(),
    driverUtilCurveLookupStatus: driverUtilCurveLookupStatus(),
  });
  assert.equal(missingSource.ok, false);
  assert.equal(missingSource.blocker, "missing-source-fingerprint");

  const missingLumen = buildRuntimeSafeCurveReferenceSummary(summaryInput({ lumenCurveLookupStatus: {} }));
  assert.equal(missingLumen.ok, false);
  assert.equal(missingLumen.blocker, "missing-lumen-curve-status-marker");

  const missingDriver = buildRuntimeSafeCurveReferenceSummary(summaryInput({ driverUtilCurveLookupStatus: {} }));
  assert.equal(missingDriver.ok, false);
  assert.equal(missingDriver.blocker, "missing-driver-util-curve-status-marker");
});

test("wires safely into IES handoff readiness as summary-only curve reference", () => {
  const curveReferenceSummary = buildRuntimeSafeCurveReferenceSummary(summaryInput());
  const ies = buildRuntimeIesHandoffReadinessScaffoldSummary(iesScaffoldInput(curveReferenceSummary));

  assert.equal(ies.blocker, null);
  assert.equal(ies.ok, true);
  assert.equal(ies.iesHandoffReadinessScaffoldReady, true);
  assert.equal(ies.iesReadinessSummary.safeCurveReferenceSummaryReady, true);
  assert.equal(ies.photometryReadinessSummary.safeCurveReferenceSummarySupplied, true);
  assert.equal(ies.photometryReadinessSummary.safeCurveReferenceSummaryReady, true);
  assert.equal(ies.photometryReadinessSummary.rawPhotometryReturned, false);
  assert.equal(ies.rawIesContentReturned, false);
  assert.equal(ies.candelaArraysReturned, false);
  assert.equal(ies.base64ArtifactsReturned, false);
  assert.equal(ies.iesGenerated, false);
});

test("safe curve helper does not add routes, POST endpoints, RuntimeData mutation, donor Engine, or photometry generation", async () => {
  const helperText = await readFile(helperSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const result = buildRuntimeSafeCurveReferenceSummary(summaryInput());

  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.donorPhotometryGenerationInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.productionRunTableGenerated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(helperText.includes("node:fs"), false);
  assert.equal(helperText.includes("node:path"), false);
  assert.equal(helperText.includes("run_engine"), false);
  assert.equal(helperText.includes("build_ies_text"), false);
  assert.equal(helperText.includes("parse_ies"), false);
  assert.equal(helperText.includes("writeFile"), false);
  assert.equal(helperText.includes("mkdir"), false);
  assert.equal(helperText.includes("router.post"), false);
  assert.equal(helperText.includes("app.post"), false);
  assert.equal(serverText.includes("runtimeSafeCurveReferenceSummary"), false);
  assert.equal(/POST[\s\S]{0,180}curve-reference/i.test(serverText), false);
  assert.equal(/curve-reference[\s\S]{0,180}POST/i.test(serverText), false);
});

const SOURCE_INPUT_FINGERPRINT = "safe-source-input:curve-reference-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:curve-reference-fixture";

function selectedFamilySubsetLock(overrides = {}) {
  return {
    boardFamily: "runtime-board-family-token",
    pitchFamily: "runtime-pitch-family-token",
    opticCurrentAssumptions: "source-backed-selector-backed-optic-basis",
    zoneSplitStrategy: "runtime-supported-zone-split-token",
    driverFamily: "runtime-driver-family-token",
    ...overrides,
  };
}

function photometrySummaryInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    selectedFamilySubsetLock: selectedFamilySubsetLock(),
    safeCurveReferenceSummary: buildRuntimeSafeCurveReferenceSummary(summaryInput()),
    ...overrides,
  };
}

test("builds RUNTIME-SAFE-PHOTOMETRY-REFERENCE-SUMMARY-1 from opaque curve and selected-result anchors", () => {
  const result = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput());

  assert.equal(result.ok, true);
  assert.equal(result.contractId, RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_CONTRACT_ID);
  assert.equal(result.schemaId, RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTIME_SAFE_PHOTOMETRY_REFERENCE_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.photometryReferenceSummaryReady, true);
  assert.equal(result.sourcePhotometryStatus, "opaque_reference_summary_ready");
  assert.equal(result.readOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.opaqueReferenceOnly, true);
  assert.equal(result.sourceAnchorOnly, true);
  assert.equal(result.sourceBacked, true);
  assert.equal(result.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(result.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(result.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(result.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.deepEqual(result.selectedFamilySubsetLock, selectedFamilySubsetLock());
  assert.equal(result.oneMmPolicyLabel, "one-mm-length-policy-summary-only");
  assert.match(result.sourcePhotometryRef, /^safe-source-photometry-ref:/);
  assert.match(result.iesPhotometryReferenceToken, /^safe-ies-photometry-reference:/);
  assert.match(result.lumenCurveReferenceSummary.curveReferenceToken, /^safe-lumen-curve-reference:/);
  assert.match(result.driverUtilCurveReferenceSummary.curveReferenceToken, /^safe-driver-util-curve-reference:/);
  assert.match(result.photometryReferenceFingerprint, /^safe-photometry-reference:/);
});

test("photometry reference aliases point at the same helper", () => {
  assert.equal(buildRuntimeSafePhotometrySourceAnchorSummary, buildRuntimeSafePhotometryReferenceSummary);
  assert.equal(buildSafePhotometryReferenceSummary, buildRuntimeSafePhotometryReferenceSummary);
});

test("photometry reference keeps all slug, IES, output, raw artefact, persistence, route, POST, and mutation flags false", () => {
  const result = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput());

  assert.equal(result.slugGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.outputGenerationEnabled, false);
  assert.equal(result.rawIesContentReturned, false);
  assert.equal(result.rawPhotometryReturned, false);
  assert.equal(result.candelaArraysReturned, false);
  assert.equal(result.base64ArtifactsReturned, false);
  assert.equal(result.filenamesReturned, false);
  assert.equal(result.localPathsReturned, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.runtimeDataMutationEnabled, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.safetyFlags.slugGenerationEnabled, false);
  assert.equal(result.safetyFlags.iesGenerationEnabled, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
  assert.equal(result.safetyFlags.rawPhotometryReturned, false);
  assert.equal(result.safetyFlags.runtimeDataMutationEnabled, false);
});

test("photometry reference emits opaque machine tokens only and no raw photometry or path artefacts", () => {
  const result = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput());
  const text = serialised(result);

  assert.equal(text.includes(".csv"), false);
  assert.equal(text.includes(".json"), false);
  assert.equal(text.includes(".ies"), false);
  assert.equal(text.includes(".pdf"), false);
  assert.equal(text.includes("C:\\"), false);
  assert.equal(text.includes("IESNA:"), false);
  assert.equal(text.includes("TILT="), false);
  assert.equal(text.includes("candelaGrid"), false);
  assert.equal(text.includes("data:application"), false);
});

test("photometry reference fingerprint and sourcePhotometryRef are deterministic", () => {
  const first = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput());
  const second = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput());

  assert.equal(first.sourcePhotometryRef, second.sourcePhotometryRef);
  assert.equal(first.photometryReferenceFingerprint, second.photometryReferenceFingerprint);
});

test("photometry reference fails closed if required safe anchors are missing", () => {
  const missingCurve = buildRuntimeSafePhotometryReferenceSummary({
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    selectedFamilySubsetLock: selectedFamilySubsetLock(),
  });
  assert.equal(missingCurve.ok, false);
  assert.equal(missingCurve.blocker, "missing-safe-curve-reference-summary");

  const missingInput = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ sourceInputFingerprint: null }));
  assert.equal(missingInput.ok, false);
  assert.equal(missingInput.blocker, "missing-source-input-fingerprint");

  const missingBoardVersion = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ boardDataSourceVersion: null }));
  assert.equal(missingBoardVersion.ok, false);
  assert.equal(missingBoardVersion.blocker, "missing-board-data-source-version");

  const missingLock = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ selectedFamilySubsetLock: null }));
  assert.equal(missingLock.ok, false);
  assert.equal(missingLock.blocker, "missing-selected-family-subset-lock");
});

test("photometry reference fails closed if slug, IES, output, persistence, mutation, route, or POST flags are enabled", () => {
  const slug = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ slugGenerationEnabled: true }));
  assert.equal(slug.ok, false);
  assert.equal(slug.blocker, "slug-generation-not-approved");
  assert.equal(slug.slugGenerationEnabled, false);

  const ies = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ iesGenerationEnabled: true }));
  assert.equal(ies.ok, false);
  assert.equal(ies.blocker, "ies-generation-not-approved");
  assert.equal(ies.iesGenerationEnabled, false);

  const output = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ outputGenerationEnabled: true }));
  assert.equal(output.ok, false);
  assert.equal(output.blocker, "output-generation-not-approved");
  assert.equal(output.outputGenerationEnabled, false);

  const persisted = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ selectedResultPersisted: true }));
  assert.equal(persisted.ok, false);
  assert.equal(persisted.blocker, "selected-result-body-or-persistence-not-approved");
  assert.equal(persisted.selectedResultPersisted, false);

  const mutation = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ runtimeDataMutationEnabled: true }));
  assert.equal(mutation.ok, false);
  assert.equal(mutation.blocker, "runtime-data-mutation-not-approved");
  assert.equal(mutation.runtimeDataMutationEnabled, false);

  const route = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ routesAdded: true }));
  assert.equal(route.ok, false);
  assert.equal(route.blocker, "route-or-post-endpoint-not-approved");
  assert.equal(route.routesAdded, false);

  const post = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ postEndpointsAdded: true }));
  assert.equal(post.ok, false);
  assert.equal(post.blocker, "route-or-post-endpoint-not-approved");
  assert.equal(post.postEndpointsAdded, false);
});

test("photometry reference fails closed if raw IES, raw photometry, candela, base64, filename, or local path values are supplied", () => {
  const rawIes = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ rawIesText: "IESNA:LM-63-2002\nTILT=NONE" }));
  assert.equal(rawIes.ok, false);
  assert.equal(rawIes.blocker, "raw-ies-content-not-approved");

  const rawPhotometry = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ rawPhotometry: { value: "grid" } }));
  assert.equal(rawPhotometry.ok, false);
  assert.equal(rawPhotometry.blocker, "raw-photometry-not-approved");

  const candela = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ candelaArraysReturned: true }));
  assert.equal(candela.ok, false);
  assert.equal(candela.blocker, "candela-array-return-not-approved");

  const base64 = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ fileArtifact: "data:application/pdf;base64,AAAA" }));
  assert.equal(base64.ok, false);
  assert.equal(base64.blocker, "base64-artifact-not-approved");

  const filename = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ filename: "unsafe_reference.ies" }));
  assert.equal(filename.ok, false);
  assert.equal(filename.blocker, "filename-or-local-path-not-approved");

  const localPath = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput({ localPath: "C:\\ControlStack_RuntimeData\\photometry" }));
  assert.equal(localPath.ok, false);
  assert.equal(localPath.blocker, "filename-or-local-path-not-approved");
});

test("photometry reference helper adds no fs/path IO, routes, POST endpoints, slug generation, IES generation, or server wiring", async () => {
  const helperText = await readFile(helperSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const result = buildRuntimeSafePhotometryReferenceSummary(photometrySummaryInput());

  assert.equal(result.slugGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.runtimeDataMutationEnabled, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(helperText.includes("node:fs"), false);
  assert.equal(helperText.includes("node:path"), false);
  assert.equal(helperText.includes("build_ies_text"), false);
  assert.equal(helperText.includes("parse_ies"), false);
  assert.equal(helperText.includes("writeFile"), false);
  assert.equal(helperText.includes("mkdir"), false);
  assert.equal(helperText.includes("router.post"), false);
  assert.equal(helperText.includes("app.post"), false);
  assert.equal(helperText.includes("slugGenerated: true"), false);
  assert.equal(serverText.includes("runtimeSafePhotometryReferenceSummary"), false);
  assert.equal(/POST[\s\S]{0,180}photometry-reference/i.test(serverText), false);
  assert.equal(/photometry-reference[\s\S]{0,180}POST/i.test(serverText), false);
});
