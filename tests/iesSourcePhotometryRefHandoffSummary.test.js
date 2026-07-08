import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeSafeCurveReferenceSummary,
  buildRuntimeSafePhotometryReferenceSummary,
} from "../packages/workspace-kernel/runtimeSafeCurveReferenceSummary.js";
import { buildIesBuilderSelectedResultHandoffContract } from "../packages/workspace-kernel/iesBuilderStatusService.js";
import {
  buildRuntimeIesSourcePhotometryRefHandoffSummary,
  buildIesSourcePhotometryRefHandoffSummary,
  RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_CONTRACT_ID,
  RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_ID,
  RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_VERSION,
  RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_STATE,
} from "../packages/workspace-kernel/iesSourcePhotometryRefHandoffSummary.js";

const POLICY_FINGERPRINT = "safe-policy:source-photometry-ref-handoff-fixture";
const SOURCE_FINGERPRINT = "safe-source:source-photometry-ref-handoff-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:source-photometry-ref-handoff-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:source-photometry-ref-handoff-fixture";

const REQUIRED_FALSE_FLAGS = Object.freeze([
  "slugGenerationEnabled",
  "slugGenerated",
  "productionSlugGenerated",
  "iesGenerationEnabled",
  "iesGenerated",
  "photometryGenerationEnabled",
  "outputGenerationEnabled",
  "outputGenerated",
  "artifactGenerationEnabled",
  "artefactGenerationEnabled",
  "rawIesContentReturned",
  "rawPhotometryReturned",
  "candelaArraysReturned",
  "base64ArtifactsReturned",
  "filenamesReturned",
  "localPathsReturned",
  "rawPhotometryRefExposed",
  "rawPhotometryPayloadExposed",
  "rawCandelaGridExposed",
  "rawIesContentExposed",
  "selectedResultPersisted",
  "selectedResultPersistenceEnabled",
  "selectedResultPersistenceAttempted",
  "productionRunTableGenerated",
  "runTableGenerated",
  "runTableGenerationEnabled",
  "rawEnginePayloadReturned",
  "rawEngineResultReturned",
  "rawSelectedResultBodyReturned",
  "rawProductRowsReturned",
  "routesAdded",
  "publicRoutesAdded",
  "postEndpointsAdded",
  "postEndpointsEnabled",
  "runtimeDataMutationEnabled",
  "runtimeDataMutated",
  "boardDataMutationEnabled",
]);

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

function safeCurveReferenceSummary() {
  return buildRuntimeSafeCurveReferenceSummary({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    lumenCurveLookupStatus: lumenCurveLookupStatus(),
    driverUtilCurveLookupStatus: driverUtilCurveLookupStatus(),
  });
}

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

function safePhotometryReferenceSummary(overrides = {}) {
  return buildRuntimeSafePhotometryReferenceSummary({
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    selectedFamilySubsetLock: selectedFamilySubsetLock(),
    safeCurveReferenceSummary: safeCurveReferenceSummary(),
    ...overrides,
  });
}

function readySelectedResultHandoffContract(overrides = {}) {
  return buildIesBuilderSelectedResultHandoffContract({
    sourceAvailable: true,
    selectedResultAvailable: true,
    accepted: true,
    engineVerified: true,
    stale: false,
    state: "engine_verified",
    resultState: "engine_verified",
    resultStateLabel: "Engine verified",
    selectedTierOrProfile: "business",
    selectedFamilySubsetLock: selectedFamilySubsetLock(),
    perRunLookupNormalised: true,
    perRunLookupSummary: { runCount: 1, lookupKey: "run id / run number / run key" },
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    sourcePhotometryRef: "opaque-source-photometry-ref-present-in-selected-result",
    runs: [{ id: "run-1", runNumber: 1, runKey: "safe-run-key" }],
    ...overrides,
  });
}

function buildReady(overrides = {}) {
  return buildRuntimeIesSourcePhotometryRefHandoffSummary({
    safePhotometryReferenceSummary: safePhotometryReferenceSummary(),
    selectedResultHandoffContract: readySelectedResultHandoffContract(),
    ...overrides,
  });
}

function assertFalseFlags(result) {
  for (const flag of REQUIRED_FALSE_FLAGS) {
    assert.equal(result[flag], false, `${flag} must remain false`);
    assert.equal(result.safetyFlags[flag], false, `${flag} safety flag must remain false`);
  }
}

function assertCandidateRefs(result) {
  assert.equal(result.opaqueRefsOnly, true);
  assert.equal(result.iesCandidateRef, null);
  assert.equal(result.photometryMetadataRef, null);
  assert.equal(result.candidateManifestRef, null);
  assert.equal(result.polarPreviewRef, null);
  assert.equal(result.pdfRef, null);
  assert.equal(result.rawIesTextExposed, false);
  assert.equal(result.rawArtefactPayloadExposed, false);
  assert.equal(result.base64PolarPlotsExposed, false);
  assert.deepEqual(result.candidateArtefactRefs, {
    opaqueRefsOnly: true,
    iesCandidateRef: null,
    photometryMetadataRef: null,
    candidateManifestRef: null,
    polarPreviewRef: null,
    pdfRef: null,
    rawIesTextExposed: false,
    rawArtefactPayloadExposed: false,
    base64PolarPlotsExposed: false,
  });
}

test("builds handoff from safe photometry anchor and ready selected-result handoff", () => {
  const result = buildReady();

  assert.equal(result.contractId, RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_CONTRACT_ID);
  assert.equal(result.schemaId, RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_SCHEMA_VERSION);
  assert.equal(result.state, RUNTIME_IES_SOURCE_PHOTOMETRY_REF_HANDOFF_STATE);
  assert.equal(result.ok, true);
  assert.equal(result.blocker, null);
  assert.equal(result.handoffReady, true);
  assert.equal(result.sourcePhotometryStatus, "real_source_ref_ready");
  assert.match(result.sourcePhotometryRef, /^safe-source-photometry-ref:[0-9a-f]{40}$/);
  assert.equal(result.readOnly, true);
  assert.equal(result.deterministicOnly, true);
  assert.equal(result.diagnosticOnly, true);
  assert.equal(result.safeSummaryOnly, true);
  assert.equal(result.opaqueReferenceOnly, true);
  assert.equal(result.sourceAnchorOnly, true);
  assert.equal(result.sourceBacked, true);
  assert.equal(result.sourceFingerprint, SOURCE_FINGERPRINT);
  assert.equal(result.policyFingerprint, POLICY_FINGERPRINT);
  assert.equal(result.sourceInputFingerprint, SOURCE_INPUT_FINGERPRINT);
  assert.equal(result.boardDataSourceVersion, BOARD_DATA_SOURCE_VERSION);
  assert.match(result.photometryReferenceFingerprint, /^safe-photometry-reference:/);
  assert.equal(result.oneMmPolicyLabel, "one-mm-length-policy-summary-only");
  assert.match(result.iesPhotometryReferenceToken, /^safe-ies-photometry-reference:/);
  assert.match(result.lumenCurveReferenceToken, /^safe-lumen-curve-reference:/);
  assert.match(result.driverUtilCurveReferenceToken, /^safe-driver-util-curve-reference:/);
  assert.equal(result.selectedResultHandoffState, "metadata_ready_for_future_candidate_output");
  assert.equal(result.selectedResultHandoffReady, true);
  assert.equal(result.readyForFutureCandidateOutput, true);
  assertFalseFlags(result);
  assertCandidateRefs(result);
});

test("alias points at the same source-photometry-ref handoff helper", () => {
  assert.equal(buildIesSourcePhotometryRefHandoffSummary, buildRuntimeIesSourcePhotometryRefHandoffSummary);
});

test("deterministic output for repeated inputs", () => {
  const first = buildReady();
  const second = buildReady();

  assert.deepEqual(first, second);
  assert.equal(first.sourcePhotometryRef, second.sourcePhotometryRef);
});

test("fails closed when safe photometry anchor is missing or not ready", () => {
  const missing = buildRuntimeIesSourcePhotometryRefHandoffSummary({
    selectedResultHandoffContract: readySelectedResultHandoffContract(),
  });
  assert.equal(missing.ok, false);
  assert.equal(missing.blocker, "missing-safe-photometry-reference-summary");
  assert.equal(missing.sourcePhotometryRef, null);
  assertFalseFlags(missing);

  const notReady = buildRuntimeIesSourcePhotometryRefHandoffSummary({
    safePhotometryReferenceSummary: { ...safePhotometryReferenceSummary(), photometryReferenceSummaryReady: false },
    selectedResultHandoffContract: readySelectedResultHandoffContract(),
  });
  assert.equal(notReady.ok, false);
  assert.equal(notReady.blocker, "safe-photometry-reference-summary-not-ready");

  const missingRef = buildRuntimeIesSourcePhotometryRefHandoffSummary({
    safePhotometryReferenceSummary: { ...safePhotometryReferenceSummary(), sourcePhotometryRef: null },
    selectedResultHandoffContract: readySelectedResultHandoffContract(),
  });
  assert.equal(missingRef.ok, false);
  assert.equal(missingRef.blocker, "missing-safe-source-photometry-ref");

  const unsafeRef = buildRuntimeIesSourcePhotometryRefHandoffSummary({
    safePhotometryReferenceSummary: { ...safePhotometryReferenceSummary(), sourcePhotometryRef: "unsafe-source-photometry-ref" },
    selectedResultHandoffContract: readySelectedResultHandoffContract(),
  });
  assert.equal(unsafeRef.ok, false);
  assert.equal(unsafeRef.blocker, "unsafe-source-photometry-ref");
});

test("fails closed when selected-result handoff is not metadata-ready", () => {
  const result = buildRuntimeIesSourcePhotometryRefHandoffSummary({
    safePhotometryReferenceSummary: safePhotometryReferenceSummary(),
    selectedResultHandoffContract: readySelectedResultHandoffContract({ stale: true }),
  });

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "selected-result-handoff-not-ready");
  assert.equal(result.handoffReady, false);
  assert.equal(result.selectedResultHandoffReady, false);
  assert.equal(result.readyForFutureCandidateOutput, false);
});

test("fails closed with required blocker codes for unsafe handoff inputs", () => {
  const cases = [
    ["slug-generation-not-approved", { slugGenerationEnabled: true }],
    ["ies-generation-not-approved", { iesGenerationEnabled: true }],
    ["output-generation-not-approved", { outputGenerationEnabled: true }],
    ["raw-ies-content-not-approved", { rawIesText: "IESNA:LM-63-2002\nTILT=NONE" }],
    ["raw-photometry-not-approved", { rawPhotometry: { value: "raw-grid" } }],
    ["candela-array-return-not-approved", { candelaArraysReturned: true }],
    ["base64-artifact-not-approved", { fileArtifact: "data:application/pdf;base64,AAAA" }],
    ["filename-or-local-path-not-approved", { localPath: "C:\\ControlStack_RuntimeData\\private" }],
    ["route-or-post-endpoint-not-approved", { postEndpointsAdded: true }],
    ["runtime-data-mutation-not-approved", { runtimeDataMutationEnabled: true }],
    ["source-photometry-ref-handoff-unsafe-output", { selectedResultPersisted: true }],
  ];

  for (const [blocker, override] of cases) {
    const result = buildReady(override);
    assert.equal(result.ok, false, blocker);
    assert.equal(result.blocker, blocker);
    assertFalseFlags(result);
  }
});

test("keeps slug / IES / output / raw artefact / route / POST / persistence / mutation flags false", () => {
  const result = buildReady();

  assertFalseFlags(result);
  assertCandidateRefs(result);
  assert.equal(result.safetyFlags.readOnly, true);
  assert.equal(result.safetyFlags.deterministicOnly, true);
  assert.equal(result.safetyFlags.diagnosticOnly, true);
  assert.equal(result.safetyFlags.safeSummaryOnly, true);
  assert.equal(result.safetyFlags.opaqueReferenceOnly, true);
});

test("serialised JSON contains no raw IES, candela, photometry payloads, base64, filenames, or local paths", () => {
  const result = buildRuntimeIesSourcePhotometryRefHandoffSummary({
    safePhotometryReferenceSummary: safePhotometryReferenceSummary(),
    selectedResultHandoffContract: readySelectedResultHandoffContract({
      rawIesText: "TILT=NONE raw-ies-do-not-emit",
      rawCandelaGrid: [["candela-grid-do-not-emit"]],
      rawPhotometryPayload: { marker: "photometry-payload-do-not-emit" },
      pdfRef: "private-proof-do-not-emit.pdf",
      base64PolarPlot: "data:image/png;base64,polar-do-not-emit",
      privateFilePath: "C:\\ControlStack\\private\\do-not-emit.ies",
    }),
  });
  const text = JSON.stringify(result);

  assert.equal(result.ok, true);
  for (const marker of [
    "raw-ies-do-not-emit",
    "candela-grid-do-not-emit",
    "photometry-payload-do-not-emit",
    "private-proof-do-not-emit.pdf",
    "polar-do-not-emit",
    "do-not-emit.ies",
    "TILT=NONE",
    "IESNA:",
    "data:image",
    "C:\\ControlStack",
  ]) {
    assert.equal(text.includes(marker), false, `${marker} should not appear`);
  }
});

test("helper source adds no filesystem, path, route, POST, IES generation, output generation, persistence, or mutation hooks", async () => {
  const helperText = await readFile(new URL("../packages/workspace-kernel/iesSourcePhotometryRefHandoffSummary.js", import.meta.url), "utf-8");
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(helperText.includes("node:fs"), false);
  assert.equal(helperText.includes("node:path"), false);
  assert.equal(helperText.includes("writeFile"), false);
  assert.equal(helperText.includes("mkdir"), false);
  assert.equal(helperText.includes("router.post"), false);
  assert.equal(helperText.includes("app.post"), false);
  assert.equal(helperText.includes("build_ies_text"), false);
  assert.equal(helperText.includes("parse_ies"), false);
  assert.equal(helperText.includes("slugGenerated: true"), false);
  assert.equal(serverText.includes("iesSourcePhotometryRefHandoffSummary"), false);
  assert.equal(/POST[\s\S]{0,180}source-photometry-ref/i.test(serverText), false);
  assert.equal(/source-photometry-ref[\s\S]{0,180}POST/i.test(serverText), false);
});
