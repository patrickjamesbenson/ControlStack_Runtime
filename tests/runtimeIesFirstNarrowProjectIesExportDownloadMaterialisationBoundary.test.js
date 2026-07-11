import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeIesFirstNarrowProjectIesExportDownloadMaterialisationBoundary,
  materialiseIesFirstNarrowProjectIesExportDownloadBoundary,
  materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultReadbackStatus.js";
import {
  buildRuntimeIesFirstNarrowProjectIesExportResultSummary,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportResultSummary.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundaryReadbackStatus.js";
import {
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
  RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportBoundarySummary.js";
import { stableFingerprint } from "../packages/workspace-kernel/stableFingerprint.js";

const BUNDLE_REF = `safe-ies-first-narrow-candidate-output-bundle-boundary:${"a".repeat(40)}`;
const PROJECT_BOUNDARY_REF = `safe-ies-first-narrow-project-ies-export-boundary:${"b".repeat(40)}`;
const BOUNDARY_SUMMARY_FINGERPRINT = `safe-ies-first-narrow-project-ies-export-boundary-summary:${"c".repeat(40)}`;
const BUNDLE_SUMMARY_FINGERPRINT = `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${"d".repeat(40)}`;
const BUILDER_REDUCTION_FINGERPRINT = `safe-ies-first-narrow-project-ies-export-builder-output-reduction:${"e".repeat(40)}`;
const JOB_FINGERPRINT = `safe-ies-first-narrow-project-ies-export-boundary-job:${"f".repeat(40)}`;
const POLICY_FINGERPRINT = "safe-policy:project-ies-download-materialisation-fixture";
const SOURCE_FINGERPRINT = "safe-source:project-ies-download-materialisation-fixture";
const SOURCE_INPUT_FINGERPRINT = "safe-source-input:project-ies-download-materialisation-fixture";
const BOARD_DATA_SOURCE_VERSION = "safe-board-data-source-version:project-ies-download-materialisation-fixture";

const VALID_LM63 = [
  "IESNA:LM-63-2002",
  "[TEST] RUNTIME-FIRST-NARROW-DOWNLOAD",
  "[MANUFAC] CONTROLSTACK-RUNTIME",
  "TILT=NONE",
  "1 1000 1 3 1 1 2 0.1 1.2 0.05",
  "1 1 12",
  "0 90 180",
  "0",
  "100 50 0",
  "",
].join("\r\n");

const FORBIDDEN_RESULT_KEYS = Object.freeze([
  "iesText",
  "rawIesText",
  "projectIesText",
  "sourceText",
  "candela",
  "candelaGrid",
  "governance",
  "governancePayload",
  "filePath",
  "localPath",
  "targetPath",
  "downloadUrl",
  "objectUrl",
  "base64",
]);

function readyBoundaryReadbackStatus() {
  const status = {
    schemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_ID,
    schemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_SCHEMA_VERSION,
    state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    readiness: "ready",
    ready: true,
    failClosed: false,
    blocker: null,
    reason: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_READBACK_STATUS_STATES.ready,
    summaryPresent: true,
    summarySchemaId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_ID,
    summarySchemaVersion: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_SUMMARY_SCHEMA_VERSION,
    summaryContractId: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_CONTRACT_ID,
    summaryState: "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    summaryFingerprint: BOUNDARY_SUMMARY_FINGERPRINT,
    summaryOnly: true,
    diagnosticOnly: true,
    safeSummaryOnly: true,
    redacted: true,
    machineValueSafe: true,
    readOnly: true,
    deterministicOnly: true,
    exportBoundaryOnly: true,
    projectIesExportBoundaryOnly: true,
    bundleBoundaryOnly: true,
    builderCallBoundaryOnly: true,
    productionProof: false,
    labProofAuthority: false,
    approvedReferenceGatePassed: true,
    resolvedRunLengthGatePassed: true,
    fingerprintAlignmentGatePassed: true,
    builderBoundaryCallAllowed: true,
    builderBoundaryCallAttempted: true,
    builderBoundaryCallSucceeded: true,
    builderOutputReduced: true,
    approvedReferenceReady: true,
    projectIesExportApproved: true,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    bundleBoundaryReady: true,
    opaqueBundleBoundaryRef: BUNDLE_REF,
    opaqueProjectIesExportBoundaryRef: PROJECT_BOUNDARY_REF,
    runLengthMm: 1200,
    builderOutputKind: "project-ies-lm63",
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 2,
    builderOutputRedactedPayloadMarkerCount: 3,
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    sourceInputFingerprint: SOURCE_INPUT_FINGERPRINT,
    boardDataSourceVersion: BOARD_DATA_SOURCE_VERSION,
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint: JOB_FINGERPRINT,
    builderOutputReductionFingerprint: BUILDER_REDUCTION_FINGERPRINT,
    candidateOutputBundleBoundarySummaryFingerprint: BUNDLE_SUMMARY_FINGERPRINT,
    ...Object.fromEntries(RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_BOUNDARY_REQUIRED_FALSE_FLAGS.map((key) => [key, false])),
  };
  status.iesFirstNarrowProjectIesExportBoundaryReadbackFingerprint = stableFingerprint(
    "safe-ies-first-narrow-project-ies-export-boundary-readback-status",
    status,
  );
  return status;
}

function readyResultReadbackStatus() {
  const summary = buildRuntimeIesFirstNarrowProjectIesExportResultSummary({
    iesFirstNarrowProjectIesExportBoundaryReadbackStatus: readyBoundaryReadbackStatus(),
  });
  return buildRuntimeIesFirstNarrowProjectIesExportResultReadbackStatus({
    modules: {
      cs_selector: {
        downstreamContext: {
          iesFirstNarrowProjectIesExportResultSummary: summary,
        },
      },
    },
  });
}

function assertNoForbiddenKeys(value, path = "result", seen = new Set()) {
  if (value === null || typeof value !== "object" || seen.has(value) || value instanceof Blob) return;
  seen.add(value);
  for (const [key, nested] of Object.entries(value)) {
    assert.equal(FORBIDDEN_RESULT_KEYS.includes(key), false, `${path}.${key} must stay absent`);
    assertNoForbiddenKeys(nested, `${path}.${key}`, seen);
  }
}

function assertBlocked(result, blockerPattern) {
  assert.equal(result.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES.blockedFailClosed);
  assert.equal(result.readiness, "blocked_fail_closed");
  assert.equal(result.ready, false);
  assert.equal(result.failClosed, true);
  assert.match(result.blocker, blockerPattern);
  assert.equal(result.blob, null);
  assert.equal(result.downloadMetadata, null);
  assert.equal(result.filesystemWriteAttempted, false);
  assert.equal(result.persistenceWriteAttempted, false);
  assert.equal(result.runtimeDataMutationAttempted, false);
  assert.equal(result.downloadUrlGenerated, false);
  assert.equal(result.routeOrPostWiringAdded, false);
  assert.deepEqual(Object.keys(result), RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER);
  assert.equal(Object.isFrozen(result), true);
  assertNoForbiddenKeys(result);
}

test("materialises one ready result readback into an immutable ephemeral LM-63 Blob using only a frozen scalar capability input", async () => {
  const status = readyResultReadbackStatus();
  let received = null;
  let calls = 0;
  const result = await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
    iesFirstNarrowProjectIesExportResultReadbackStatus: status,
    materialiseProjectIesDownload: async (input) => {
      calls += 1;
      received = input;
      return VALID_LM63;
    },
  });

  assert.equal(calls, 1);
  assert.equal(Object.isFrozen(received), true);
  assert.equal(Object.values(received).every((value) => ["string", "number", "boolean"].includes(typeof value)), true);
  assert.equal("projectEnvelope" in received, false);
  assert.equal("rawIesText" in received, false);
  assert.equal("candela" in received, false);
  assert.equal("governance" in received, false);
  assert.equal("filename" in received, false);
  assert.equal("filePath" in received, false);
  assert.equal(received.opaqueProjectIesExportBoundaryRef, PROJECT_BOUNDARY_REF);
  assert.equal(received.projectIesExportResultSummaryFingerprint, status.summaryFingerprint);
  assert.equal(received.iesFirstNarrowProjectIesExportResultReadbackFingerprint, status.iesFirstNarrowProjectIesExportResultReadbackFingerprint);

  assert.equal(result.schemaId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_SCHEMA_VERSION);
  assert.equal(result.contractId, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_CONTRACT_ID);
  assert.equal(result.state, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_STATES.ready);
  assert.equal(result.readiness, "ready");
  assert.equal(result.ready, true);
  assert.equal(result.failClosed, false);
  assert.equal(result.blocker, null);
  assert.equal(result.ephemeral, true);
  assert.equal(result.inMemoryOnly, true);
  assert.equal(result.immutableBlob, true);
  assert.equal(result.sourceTextAccepted, true);
  assert.equal(result.sourceTextDiscarded, true);
  assert.equal(result.materialiserCapabilityInjected, true);
  assert.equal(result.materialiserCapabilityInvoked, true);
  assert.equal(result.materialiserCapabilitySucceeded, true);
  assert.equal(result.filesystemWriteAttempted, false);
  assert.equal(result.persistenceWriteAttempted, false);
  assert.equal(result.runtimeDataMutationAttempted, false);
  assert.equal(result.downloadUrlGenerated, false);
  assert.equal(result.routeOrPostWiringAdded, false);
  assert.equal(result.blob instanceof Blob, true);
  assert.equal(result.blob.type, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE);
  assert.equal(result.blob.size, new TextEncoder().encode(VALID_LM63).byteLength);
  assert.equal(await result.blob.text(), VALID_LM63);
  assert.equal(Object.isFrozen(result), true);
  assert.equal(Object.isFrozen(result.blob), true);
  assert.equal(Object.isFrozen(result.downloadMetadata), true);
  assert.match(result.downloadMetadata.filename, /^controlstack-project-ies-1200mm-[0-9a-f]{12}\.ies$/);
  assert.equal(result.downloadMetadata.mediaType, RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MEDIA_TYPE);
  assert.equal(result.downloadMetadata.extension, ".ies");
  assert.equal(result.downloadMetadata.byteLength, result.blob.size);
  assert.match(result.downloadMetadata.contentFingerprint, /^safe-ies-first-narrow-project-ies-export-download-content:[0-9a-f]{40}$/);
  assert.match(result.downloadMetadata.materialisationFingerprint, /^safe-ies-first-narrow-project-ies-export-download-materialisation:[0-9a-f]{40}$/);
  assert.deepEqual(Object.keys(result), RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_DOWNLOAD_MATERIALISATION_BOUNDARY_FIELD_ORDER);
  assertNoForbiddenKeys(result);
  const serialised = JSON.stringify(result);
  assert.equal(serialised.includes("IESNA:"), false);
  assert.equal(serialised.includes("TILT=NONE"), false);
  assert.equal(serialised.includes("100 50 0"), false);
});

test("produces deterministic safe download metadata without creating a URL or reusing a mutable Blob", async () => {
  const input = {
    iesFirstNarrowProjectIesExportResultReadbackStatus: readyResultReadbackStatus(),
    materialiseProjectIesDownload: () => VALID_LM63,
  };
  const first = await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary(input);
  const second = await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary(input);

  assert.deepEqual(first.downloadMetadata, second.downloadMetadata);
  assert.notEqual(first.blob, second.blob);
  assert.equal(first.downloadUrlGenerated, false);
  assert.equal("url" in first.downloadMetadata, false);
  assert.equal("path" in first.downloadMetadata, false);
});

test("blocks fail-closed before invocation when the capability is missing or result readback is not exactly ready", async () => {
  const readyStatus = readyResultReadbackStatus();
  const missingCapability = await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
    iesFirstNarrowProjectIesExportResultReadbackStatus: readyStatus,
  });
  assertBlocked(missingCapability, /capability-missing/);
  assert.equal(missingCapability.materialiserCapabilityInjected, false);
  assert.equal(missingCapability.materialiserCapabilityInvoked, false);

  let calls = 0;
  const cases = [
    [{}, /status-missing/],
    [{ ...readyStatus, state: RUNTIME_IES_FIRST_NARROW_PROJECT_IES_EXPORT_RESULT_READBACK_STATUS_STATES.blockedFailClosed }, /status-not-ready/],
    [{ ...readyStatus, runLengthMm: 1300 }, /fingerprint-mismatch/],
    [{ ...readyStatus, rawIesText: "IESNA:LM-63-2002\nTILT=NONE" }, /unsafe|raw|non-scalar|fingerprint/],
    [{ ...readyStatus, projectIesExportResultDownloadAvailable: true }, /required-flag-not-false/],
  ];
  for (const [status, pattern] of cases) {
    const result = await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
      iesFirstNarrowProjectIesExportResultReadbackStatus: status,
      materialiseProjectIesDownload: () => {
        calls += 1;
        return VALID_LM63;
      },
    });
    assertBlocked(result, pattern);
  }
  assert.equal(calls, 0);
});

test("rejects thrown, object, malformed, externally tilted, private, oversized, and structurally invalid materialiser results without returning source text", async () => {
  const status = readyResultReadbackStatus();
  const invalidResults = [
    [async () => { throw new Error("C:\\ControlStack\\private\\candidate.ies"); }, /capability-failed/],
    [() => ({ iesText: VALID_LM63 }), /result-not-text/],
    [() => "not an ies file", /header-invalid/],
    [() => VALID_LM63.replace("TILT=NONE", "TILT=external.ies"), /tilt-not-none/],
    [() => VALID_LM63.replace("[MANUFAC] CONTROLSTACK-RUNTIME", "[MANUFAC] C:\\ControlStack\\private"), /private-or-base64/],
    [() => `${VALID_LM63}${" ".repeat(2_000_001)}`, /size-invalid|line-too-long/],
    [() => VALID_LM63.replace("100 50 0", "100 -50 0"), /angle-or-candela-values-invalid/],
    [() => VALID_LM63.replace("1 1000 1 3 1 1 2", "1 1000 1 4 1 1 2"), /numeric-count-mismatch/],
    [() => `\ufeff${VALID_LM63}`, /empty-or-bom-prefixed/],
  ];

  for (const [materialiseProjectIesDownload, pattern] of invalidResults) {
    const result = await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary({
      iesFirstNarrowProjectIesExportResultReadbackStatus: status,
      materialiseProjectIesDownload,
    });
    assertBlocked(result, pattern);
    assert.equal(JSON.stringify(result).includes("ControlStack\\private"), false);
    assert.equal(JSON.stringify(result).includes("IESNA:"), false);
  }
});

test("runtime and short aliases expose the same download materialisation boundary", async () => {
  const input = {
    iesFirstNarrowProjectIesExportResultReadbackStatus: readyResultReadbackStatus(),
    materialiseProjectIesDownload: () => VALID_LM63,
  };
  const runtime = await materialiseRuntimeIesFirstNarrowProjectIesExportDownloadBoundary(input);
  const buildAlias = await buildRuntimeIesFirstNarrowProjectIesExportDownloadMaterialisationBoundary(input);
  const shortAlias = await materialiseIesFirstNarrowProjectIesExportDownloadBoundary(input);

  assert.deepEqual(runtime.downloadMetadata, buildAlias.downloadMetadata);
  assert.deepEqual(runtime.downloadMetadata, shortAlias.downloadMetadata);
  assert.equal(await buildAlias.blob.text(), VALID_LM63);
  assert.equal(await shortAlias.blob.text(), VALID_LM63);
});

test("module remains isolated from donor, lab, RuntimeData, server, route, URL, persistence, and filesystem output plumbing", async () => {
  const source = await readFile(
    new URL("../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialisationBoundary.js", import.meta.url),
    "utf8",
  );

  for (const forbidden of [
    "savedProjectStore",
    "projectBrowserService",
    "server.js",
    "runtimeDataReadOnlySourceAccessService",
    "node:fs",
    "writeFile",
    "createWriteStream",
    "URL.createObjectURL",
    "fetch(",
    "XMLHttpRequest",
    "donor",
    "labTransformation",
    "candelaGrid",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.equal(source.includes("materialiseProjectIesDownload"), true);
  assert.equal(source.includes("new Blob"), true);
});
