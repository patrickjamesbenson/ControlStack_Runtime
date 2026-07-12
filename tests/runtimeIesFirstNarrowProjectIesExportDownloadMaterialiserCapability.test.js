import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultSummary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js";
import {
  materialiseProjectIesDownload,
  materialiseRuntimeIesFirstNarrowProjectIesDownload,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISER_CAPABILITY_ID,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialiserCapability.js";
import {
  buildRuntimeApprovedLabReferenceSummary,
} from "../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowCandidateOutputBundleBoundarySummary.js";
import { createShellServices } from "../packages/workspace-kernel/services.js";

const VALID_LM63 = [
  "IESNA:LM-63-2002",
  "[TEST] RUNTIME-MATERIALISER-CAPABILITY",
  "[MANUFAC] CONTROLSTACK-RUNTIME",
  "TILT=NONE",
  "1 1000 1 3 1 1 2 0.1 1.2 0.05",
  "1 1 12",
  "0 90 180",
  "0",
  "100 50 0",
  "",
].join("\r\n");

const VALID_LM63_COLLISION = VALID_LM63.replace("100 50 0", "101 51 0");

function fixture(label, bundleHex, bundleFingerprintHex) {
  const policyFingerprint = `safe-policy:project-ies-materialiser-${label}`;
  const sourceFingerprint = `safe-source:project-ies-materialiser-${label}`;
  const sourceInputFingerprint = `safe-source-input:project-ies-materialiser-${label}`;
  const boardDataSourceVersion = `safe-board-data-source-version:project-ies-materialiser-${label}`;
  const oneMmLabRecordFingerprint = `safe-one-mm-lab-record:project-ies-materialiser-${label}`;
  const referenceIesFingerprint = `safe-reference-ies:project-ies-materialiser-${label}`;
  const provenanceFingerprint = `safe-provenance:project-ies-materialiser-${label}`;
  const emergencyEvidenceFingerprint = `safe-emergency-evidence:project-ies-materialiser-${label}`;
  const labReferenceFingerprint = `safe-lab-reference:project-ies-materialiser-${label}`;
  const opaqueBundleBoundaryRef =
    `safe-ies-first-narrow-candidate-output-bundle-boundary:${bundleHex.repeat(40)}`;
  const bundleSummaryFingerprint =
    `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${bundleFingerprintHex.repeat(40)}`;

  function approvedChild(fingerprint, overrides = {}) {
    return {
      ok: true,
      approved: true,
      approvalState: "approved",
      safeSummaryOnly: true,
      diagnosticOnly: true,
      fingerprint,
      rawBodyReturned: false,
      rawPayloadReturned: false,
      rawReferenceIesReturned: false,
      rawOneMmJsonReturned: false,
      rawProvenanceReturned: false,
      rawPhotometryReturned: false,
      candelaArraysReturned: false,
      base64ArtifactsReturned: false,
      exactElectricalValuesReturned: false,
      exactPlacementCoordinatesReturned: false,
      ...overrides,
    };
  }

  const approvedLabReferenceSummary = buildRuntimeApprovedLabReferenceSummary({
    policyFingerprint,
    sourceFingerprint,
    approvedLabReferenceSummary: {
      ok: true,
      approved: true,
      labApproved: true,
      approvalState: "approved",
      labAuthority: "lab-owned-approved-photometry-reference",
      labReferenceFingerprint,
      oneMmLabRecordFingerprint,
      referenceIesFingerprint,
      provenanceFingerprint,
      emergencyEvidenceFingerprint,
      staleState: "current",
      projectIesExportApproved: true,
      rawReferenceIesReturned: false,
      rawOneMmJsonReturned: false,
      rawProvenanceReturned: false,
      rawPhotometryReturned: false,
      candelaArraysReturned: false,
      base64ArtifactsReturned: false,
      exactElectricalValuesReturned: false,
      exactPlacementCoordinatesReturned: false,
      selectedResultBodyReturned: false,
      donorEngineInvoked: false,
      runtimeDataMutated: false,
      runTableGenerated: false,
      iesGenerated: false,
      routesAdded: false,
      postEndpointsAdded: false,
    },
    oneMmLabRecordSummary: approvedChild(oneMmLabRecordFingerprint, {
      kind: "one-mm-json-lab-record-summary",
      oneMmLabRecordFingerprint,
    }),
    referenceIesSummary: approvedChild(referenceIesFingerprint, {
      kind: "reference-ies-summary",
      referenceIesFingerprint,
    }),
    provenanceSummary: approvedChild(provenanceFingerprint, {
      kind: "provenance-custody-summary",
      provenanceFingerprint,
    }),
    emergencyEvidenceSummary: approvedChild(emergencyEvidenceFingerprint, {
      kind: "emergency-evidence-summary",
      emergencyEvidenceFingerprint,
    }),
    projectIesExportApprovalSummary: {
      approved: true,
      projectIesExportApproved: true,
      safeSummaryOnly: true,
      diagnosticOnly: true,
      projectIesExportGenerated: false,
    },
    staleComparisonSummary: {
      safeComparisonApproved: true,
      current: true,
      stale: false,
      staleState: "current",
      safeSummaryOnly: true,
      diagnosticOnly: true,
    },
  });

  const candidateOutputBundleBoundarySummary = {
    schemaId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    contractId: RUNTIME_IES_FIRST_NARROW_CANDIDATE_OUTPUT_BUNDLE_BOUNDARY_CONTRACT_ID,
    state: "redacted_ies_first_narrow_candidate_output_bundle_boundary_summary_persisted",
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    readyForBundleBoundary: true,
    outputBundleBoundaryJoined: true,
    outputBundleIncluded: false,
    rawOutputBundleIncluded: false,
    rawArtifactIncluded: false,
    opaqueBundleBoundaryRef,
    outputBundleRecordCount: 1,
    outputBundleEntryCount: 1,
    policyFingerprint,
    sourceFingerprint,
    sourceInputFingerprint,
    boardDataSourceVersion,
    iesFirstNarrowCandidateOutputBundleBoundarySummaryFingerprint: bundleSummaryFingerprint,
  };

  const job = {
    kind: "project-ies-export-boundary-job",
    resolvedRunLengthMm: 1200,
    sourceInputFingerprint,
    boardDataSourceVersion,
    policyFingerprint,
    sourceFingerprint,
  };

  return {
    approvedLabReferenceSummary,
    candidateOutputBundleBoundarySummary,
    job,
  };
}

function buildRegisteredChain({ label, bundleHex, bundleFingerprintHex, projectIesText }) {
  const source = fixture(label, bundleHex, bundleFingerprintHex);
  const boundarySummary = buildRuntimeIesFirstNarrowProjectIesExportBoundarySummary({
    approvedLabReferenceSummary: source.approvedLabReferenceSummary,
    iesFirstNarrowCandidateOutputBundleBoundarySummary:
      source.candidateOutputBundleBoundarySummary,
    resolvedRunLengthMm: 1200,
    job: source.job,
    buildProjectIes: () => ({
      kind: "project-ies-lm63",
      projectIesText,
      safeRecord: {
        state: "ready",
        count: 1,
      },
    }),
  });
  const boundaryEnvelope = {
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportBoundarySummary: boundarySummary,
        },
      },
    },
  };
  const boundaryReadbackStatus =
    buildRuntimeIesFirstNarrowProjectIesExportBoundaryReadbackStatus(boundaryEnvelope);
  const resultSummary = buildRuntimeIesFirstNarrowProjectIesExportResultSummary({
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: boundaryReadbackStatus,
  });
  const resultEnvelope = {
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummary: resultSummary,
        },
      },
    },
  };
  const resultReadbackStatus =
    buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus(resultEnvelope);
  return {
    boundarySummary,
    boundaryReadbackStatus,
    resultSummary,
    resultReadbackStatus,
  };
}

function capabilityInput(status) {
  return Object.freeze({
    sourceKind: "ready-project-ies-export-result-readback-status-only",
    opaqueBundleBoundaryRef: status.opaqueBundleBoundaryRef,
    opaqueProjectIesExportBoundaryRef: status.opaqueProjectIesExportBoundaryRef,
    runLengthMm: status.runLengthMm,
    builderOutputKind: status.builderOutputKind,
    builderOutputRecordCount: status.builderOutputRecordCount,
    builderOutputEntryCount: status.builderOutputEntryCount,
    builderOutputSafeScalarCount: status.builderOutputSafeScalarCount,
    builderOutputRedactedPayloadMarkerCount:
      status.builderOutputRedactedPayloadMarkerCount,
    policyFingerprint: status.policyFingerprint,
    sourceFingerprint: status.sourceFingerprint,
    sourceInputFingerprint: status.sourceInputFingerprint,
    boardDataSourceVersion: status.boardDataSourceVersion,
    jobKind: status.jobKind,
    jobFingerprint: status.jobFingerprint,
    builderOutputReductionFingerprint: status.builderOutputReductionFingerprint,
    candidateOutputBundleBoundarySummaryFingerprint:
      status.candidateOutputBundleBoundarySummaryFingerprint,
    projectIesExportBoundaryReadbackFingerprint:
      status.projectIesExportBoundaryReadbackFingerprint,
    projectIesExportBoundarySummaryFingerprint:
      status.projectIesExportBoundarySummaryFingerprint,
    projectIesExportResultSummaryFingerprint: status.summaryFingerprint,
    iesFirstNarrowProjectIesExportResultReadbackFingerprint:
      status.iesFirstNarrowProjectIesExportResultReadbackFingerprint,
  });
}

function assertNoRawText(value) {
  const serialised = JSON.stringify(value);
  for (const marker of [
    "IESNA:LM-63",
    "TILT=NONE",
    "100 50 0",
    "101 51 0",
  ]) {
    assert.equal(serialised.includes(marker), false, marker);
  }
}

test("mounts exactly one top-level runtime materialiser capability and lets the existing download boundary consume the privately registered canonical text", async () => {
  const chain = buildRegisteredChain({
    label: "ready",
    bundleHex: "1",
    bundleFingerprintHex: "2",
    projectIesText: VALID_LM63,
  });
  const services = createShellServices();

  assert.equal(
    RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISER_CAPABILITY_ID,
    "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-DOWNLOAD-MATERIALISER-CAPABILITY-1",
  );
  assert.equal(typeof services.materialiseProjectIesDownload, "function");
  assert.deepEqual(
    Object.keys(services).filter((key) => key.toLowerCase().includes("materialise")),
    ["materialiseProjectIesDownload"],
  );
  assert.equal(materialiseProjectIesDownload, materialiseRuntimeIesFirstNarrowProjectIesDownload);
  assert.equal(chain.boundaryReadbackStatus.ready, true);
  assert.equal(chain.resultReadbackStatus.ready, true);
  assertNoRawText(chain.boundarySummary);
  assertNoRawText(chain.boundaryReadbackStatus);
  assertNoRawText(chain.resultSummary);
  assertNoRawText(chain.resultReadbackStatus);
  assertNoRawText(services);

  const materialised =
    await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
      iesFirstNarrowProjectIesExportResultReadbackStatus: chain.resultReadbackStatus,
      materialiseProjectIesDownload: services.materialiseProjectIesDownload,
    });

  assert.equal(materialised.ready, true);
  assert.equal(materialised.materialiserCapabilityInjected, true);
  assert.equal(materialised.materialiserCapabilityInvoked, true);
  assert.equal(materialised.materialiserCapabilitySucceeded, true);
  assert.equal(await materialised.blob.text(), VALID_LM63);
  assertNoRawText(materialised);
});

test("fails closed on missing registrations, stale fingerprints, extra fields, and mismatched scalar identities", () => {
  const chain = buildRegisteredChain({
    label: "identity",
    bundleHex: "3",
    bundleFingerprintHex: "4",
    projectIesText: VALID_LM63,
  });
  const services = createShellServices();
  const input = capabilityInput(chain.resultReadbackStatus);

  assert.equal(services.materialiseProjectIesDownload(input), VALID_LM63);

  assert.throws(
    () => services.materialiseProjectIesDownload({
      ...input,
      sourceInputFingerprint: "safe-source-input:project-ies-materialiser-stale",
    }),
    /scalar-identity-mismatch/,
  );
  assert.throws(
    () => services.materialiseProjectIesDownload({
      ...input,
      runLengthMm: 1300,
    }),
    /scalar-identity-mismatch/,
  );
  assert.throws(
    () => services.materialiseProjectIesDownload({
      ...input,
      opaqueProjectIesExportBoundaryRef:
        `safe-ies-first-narrow-project-ies-export-boundary:${"9".repeat(40)}`,
    }),
    /registration-missing/,
  );
  assert.throws(
    () => services.materialiseProjectIesDownload({
      ...input,
      projectIesText: VALID_LM63,
    }),
    /capability-input-invalid/,
  );
});

test("invalidates a colliding opaque boundary registration instead of returning either LM-63 body", () => {
  const first = buildRegisteredChain({
    label: "collision",
    bundleHex: "5",
    bundleFingerprintHex: "6",
    projectIesText: VALID_LM63,
  });
  const second = buildRegisteredChain({
    label: "collision",
    bundleHex: "5",
    bundleFingerprintHex: "6",
    projectIesText: VALID_LM63_COLLISION,
  });
  const services = createShellServices();

  assert.deepEqual(first.boundarySummary, second.boundarySummary);
  assert.throws(
    () => services.materialiseProjectIesDownload(
      capabilityInput(first.resultReadbackStatus),
    ),
    /registration-collision/,
  );
  assertNoRawText(first.boundarySummary);
  assertNoRawText(second.boundarySummary);
  assertNoRawText(services);
});

test("malformed or missing canonical projectIesText is never retained and the download path blocks fail-closed", async () => {
  const malformed = buildRegisteredChain({
    label: "malformed",
    bundleHex: "7",
    bundleFingerprintHex: "8",
    projectIesText: "IESNA:LM-63-2002\r\nTILT=NONE\r\nnot-numeric",
  });
  const services = createShellServices();

  assert.throws(
    () => services.materialiseProjectIesDownload(
      capabilityInput(malformed.resultReadbackStatus),
    ),
    /registration-missing/,
  );

  const result =
    await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
      iesFirstNarrowProjectIesExportResultReadbackStatus:
        malformed.resultReadbackStatus,
      materialiseProjectIesDownload: services.materialiseProjectIesDownload,
    });
  assert.equal(result.ready, false);
  assert.equal(result.failClosed, true);
  assert.equal(result.blocker, "project-ies-download-materialiser-capability-failed");
  assert.equal(result.blob, null);
  assertNoRawText(result);
});

test("capability source remains memory-only and isolated from UI, persistence, server, routes, RuntimeData, donor, and filesystem writes", async () => {
  const source = await readFile(
    new URL(
      "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialiserCapability.js",
      import.meta.url,
    ),
    "utf8",
  );
  const servicesSource = await readFile(
    new URL("../packages/workspace-kernel/services.js", import.meta.url),
    "utf8",
  );

  for (const forbidden of [
    "packages/modules",
    "ies-builder",
    "savedProjectStore",
    "server.js",
    "from \"./runtimeData",
    "runtimeDataReadOnlySourceAccessService",
    "node:fs",
    "writeFile",
    "createWriteStream",
    "fetch(",
    "XMLHttpRequest",
    "donor",
    "labTransformation",
    "URL.createObjectURL",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.equal(source.includes("new Map()"), true);
  assert.equal(source.includes("projectIesText"), true);
  assert.equal(servicesSource.match(/materialiseProjectIesDownload:/g)?.length, 1);
  assert.equal(servicesSource.includes("projectIesText"), false);
});
