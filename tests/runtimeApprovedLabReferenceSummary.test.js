import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildRuntimeApprovedLabReferenceSummary,
  buildApprovedLabReferenceSummary,
  buildRuntimeNativeApprovedLabReferenceSummary,
  buildEngineRunTableApprovedLabReferenceSummary,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION,
  RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_ALLOWED_OUTPUT_KEYS,
} from "../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js";

const POLICY_FINGERPRINT = "safe-policy:approved-lab-reference-fixture";
const SOURCE_FINGERPRINT = "safe-source:approved-lab-reference-fixture";
const LAB_REFERENCE_FINGERPRINT = "safe-lab-reference:approved-lab-reference-fixture";
const ONE_MM_FINGERPRINT = "safe-one-mm-lab-record:approved-lab-reference-fixture";
const REFERENCE_IES_FINGERPRINT = "safe-reference-ies:approved-lab-reference-fixture";
const PROVENANCE_FINGERPRINT = "safe-provenance:approved-lab-reference-fixture";
const EMERGENCY_FINGERPRINT = "safe-emergency-evidence:approved-lab-reference-fixture";

const helperSourceUrl = new URL("../packages/workspace-kernel/runtimeApprovedLabReferenceSummary.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

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

function completeInput(overrides = {}) {
  return {
    policyFingerprint: POLICY_FINGERPRINT,
    sourceFingerprint: SOURCE_FINGERPRINT,
    approvedLabReferenceSummary: {
      ok: true,
      approved: true,
      labApproved: true,
      approvalState: "approved",
      labAuthority: "lab-owned-approved-photometry-reference",
      labReferenceFingerprint: LAB_REFERENCE_FINGERPRINT,
      oneMmLabRecordFingerprint: ONE_MM_FINGERPRINT,
      referenceIesFingerprint: REFERENCE_IES_FINGERPRINT,
      provenanceFingerprint: PROVENANCE_FINGERPRINT,
      emergencyEvidenceFingerprint: EMERGENCY_FINGERPRINT,
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
    oneMmLabRecordSummary: approvedChild(ONE_MM_FINGERPRINT, {
      kind: "one-mm-json-lab-record-summary",
      oneMmLabRecordFingerprint: ONE_MM_FINGERPRINT,
    }),
    referenceIesSummary: approvedChild(REFERENCE_IES_FINGERPRINT, {
      kind: "reference-ies-summary",
      referenceIesFingerprint: REFERENCE_IES_FINGERPRINT,
    }),
    provenanceSummary: approvedChild(PROVENANCE_FINGERPRINT, {
      kind: "provenance-custody-summary",
      provenanceFingerprint: PROVENANCE_FINGERPRINT,
    }),
    emergencyEvidenceSummary: approvedChild(EMERGENCY_FINGERPRINT, {
      kind: "emergency-evidence-summary",
      emergencyEvidenceFingerprint: EMERGENCY_FINGERPRINT,
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
    ...overrides,
  };
}

function serialised(value) {
  return JSON.stringify(value);
}

function assertBlocked(overrides, blocker) {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput(overrides));
  assert.equal(result.ok, false);
  assert.equal(result.blocker, blocker);
  return result;
}

test("fails closed by default", () => {
  const result = buildRuntimeApprovedLabReferenceSummary();

  assert.equal(result.ok, false);
  assert.equal(result.approvedLabReferenceSummaryReady, false);
  assert.equal(result.projectIesExportEligible, false);
  assert.equal(result.datasheetReportRenderApproved, false);
  assert.equal(result.blocker, "missing-approved-lab-reference-summary");
});

test("accepts complete approved safe Lab reference summary", () => {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_ID);
  assert.equal(result.schemaVersion, RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_SCHEMA_VERSION);
  assert.equal(result.approvedLabReferenceSummaryReady, true);
  assert.equal(result.labOwned, true);
  assert.equal(result.approvedReferenceOnly, true);
  assert.equal(result.projectIesExportEligible, true);
  assert.equal(result.projectIesExportSummary.projectIesExportGenerated, false);
  assert.equal(result.datasheetReportRenderApproved, false);
  assert.equal(result.downstreamBoundarySummary.datasheetReportRendered, false);
  assert.equal(result.approvalStateSummary.labAuthority, "lab-owned-approved-photometry-reference");
  assert.equal(result.oneMmLabRecordFingerprint, ONE_MM_FINGERPRINT);
  assert.equal(result.referenceIesFingerprint, REFERENCE_IES_FINGERPRINT);
  assert.equal(result.provenanceFingerprint, PROVENANCE_FINGERPRINT);
  assert.equal(result.emergencyEvidenceFingerprint, EMERGENCY_FINGERPRINT);
  assert.match(result.approvedLabReferenceFingerprint, /^safe-approved-lab-reference-summary:/);
});

test("aliases point at the same approved Lab reference helper", () => {
  assert.equal(buildApprovedLabReferenceSummary, buildRuntimeApprovedLabReferenceSummary);
  assert.equal(buildRuntimeNativeApprovedLabReferenceSummary, buildRuntimeApprovedLabReferenceSummary);
  assert.equal(buildEngineRunTableApprovedLabReferenceSummary, buildRuntimeApprovedLabReferenceSummary);
});

test("rejects not-approved Lab reference state", () => {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput({
    approvedLabReferenceSummary: {
      ...completeInput().approvedLabReferenceSummary,
      approved: false,
      labApproved: false,
      approvalState: "pending",
    },
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "approved-lab-reference-not-approved");
});

test("rejects fingerprint mismatch", () => {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput({
    approvedLabReferenceSummary: {
      ...completeInput().approvedLabReferenceSummary,
      oneMmLabRecordFingerprint: "safe-one-mm-lab-record:different-approved-fixture",
    },
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "approved-lab-reference-fingerprint-mismatch");
});

test("rejects stale reference unless comparison is explicitly safe and approved", () => {
  const stale = buildRuntimeApprovedLabReferenceSummary(completeInput({
    approvedLabReferenceSummary: {
      ...completeInput().approvedLabReferenceSummary,
      stale: true,
      staleState: "stale",
    },
    staleComparisonSummary: {
      safeComparisonApproved: false,
      stale: true,
      staleState: "stale",
    },
  }));
  assert.equal(stale.ok, false);
  assert.equal(stale.blocker, "approved-lab-reference-stale");

  const current = buildRuntimeApprovedLabReferenceSummary(completeInput({
    approvedLabReferenceSummary: {
      ...completeInput().approvedLabReferenceSummary,
      stale: true,
      staleState: "stale",
    },
    staleComparisonSummary: {
      safeComparisonApproved: true,
      stale: false,
      staleState: "current",
    },
  }));
  assert.equal(current.ok, true);
  assert.equal(current.staleState, "safe_comparison_approved_current");
});

test("rejects unimplemented stale comparison when required", () => {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput({
    staleComparisonRequired: true,
    staleComparisonSummary: undefined,
    approvedLabReferenceSummary: {
      ...completeInput().approvedLabReferenceSummary,
      staleState: "not_compared_fail_closed",
    },
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "stale-comparison-not-implemented");
});

test("rejects missing required Lab child summaries", () => {
  assertBlocked({ oneMmLabRecordSummary: undefined }, "missing-one-mm-lab-record-summary");
  assertBlocked({ referenceIesSummary: undefined }, "missing-reference-ies-summary");
  assertBlocked({ provenanceSummary: undefined }, "missing-provenance-summary");
  assertBlocked({ emergencyEvidenceSummary: undefined }, "missing-emergency-evidence-summary");
});

test("rejects raw Reference IES", () => {
  assertBlocked({ referenceIes: "IESNA:LM-63-2002\nTILT=NONE" }, "raw-reference-ies-not-approved");
});

test("rejects raw 1mm JSON body", () => {
  assertBlocked({ rawOneMmJsonBody: { geometry: { length: 1 }, candela: [] } }, "raw-one-mm-json-not-approved");
});

test("rejects raw provenance", () => {
  assertBlocked({ provenance: { transformHistory: ["scaled to one millimetre"] } }, "raw-provenance-not-approved");
});

test("rejects raw photometry, candela, and base64", () => {
  assertBlocked({ photometry: { verticalAngles: [0, 90] } }, "raw-photometry-not-approved");
  assertBlocked({ candelaArraysReturned: true }, "candela-array-return-not-approved");
  assertBlocked({ fileArtifact: "data:application/pdf;base64,AAAA" }, "raw-photometry-not-approved");
});

test("rejects exact electrical values", () => {
  assertBlocked({ current_ma: 350 }, "exact-electrical-values-not-approved");
});

test("rejects exact placement coordinates", () => {
  assertBlocked({ placementCoordinates: [{ start_mm: 0, end_mm: 1200 }] }, "exact-placement-coordinates-not-approved");
});

test("rejects selected-result body and handoff scaffold readiness", () => {
  assertBlocked({ selectedResultBody: { accepted: true } }, "selected-result-body-not-approved");
  assertBlocked({ selectedResultHandoffScaffoldReady: true }, "selected-result-handoff-scaffold-not-ready");
});

test("rejects Project IES export when not explicitly approved", () => {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput({
    projectIesExportApprovalSummary: {
      approved: true,
      projectIesExportApproved: false,
      safeSummaryOnly: true,
      diagnosticOnly: true,
    },
    approvedLabReferenceSummary: {
      ...completeInput().approvedLabReferenceSummary,
      projectIesExportApproved: false,
    },
  }));

  assert.equal(result.ok, false);
  assert.equal(result.blocker, "project-ies-export-not-approved");
});

test("rejects datasheet/report render approval", () => {
  assertBlocked({
    datasheetReportSummary: {
      safeSummaryOnly: true,
      diagnosticOnly: true,
      datasheetReportRenderApproved: true,
    },
  }, "datasheet-report-render-not-approved");
});

test("rejects RuntimeData mutation", () => {
  const result = assertBlocked({ runtimeDataMutated: true }, "runtime-data-mutation-not-approved");
  assert.equal(result.safetyFlags.runtimeDataMutated, false);
});

test("rejects donor Engine invocation", () => {
  const result = assertBlocked({ donorEngineInvoked: true }, "donor-engine-invocation-not-approved");
  assert.equal(result.safetyFlags.donorEngineInvoked, false);
});

test("rejects IES and RunTable generation", () => {
  assertBlocked({ iesGenerated: true }, "ies-generation-not-approved");
  assertBlocked({ runTableGenerated: true }, "ies-generation-not-approved");
});

test("rejects routes and POST endpoints", () => {
  assertBlocked({ routesAdded: true }, "route-or-post-endpoint-not-approved");
  assertBlocked({ postEndpointsAdded: true }, "route-or-post-endpoint-not-approved");
});

test("produces deterministic safe fingerprint", () => {
  const first = buildRuntimeApprovedLabReferenceSummary(completeInput());
  const second = buildRuntimeApprovedLabReferenceSummary(completeInput());

  assert.equal(first.approvedLabReferenceFingerprint, second.approvedLabReferenceFingerprint);
  assert.match(first.approvedLabReferenceFingerprint, /^safe-approved-lab-reference-summary:/);
});

test("exposes only allow-listed top-level keys", () => {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput());
  const allowed = [...RUNTIME_APPROVED_LAB_REFERENCE_SUMMARY_ALLOWED_OUTPUT_KEYS].sort();
  const actual = Object.keys(result).sort();

  assert.deepEqual(actual, allowed);
});

test("emits only safe tokens, fingerprints, labels, bands, and status booleans", () => {
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput());
  const text = serialised(result);

  assert.equal(result.referenceIesSummary.rawReferenceIesReturned, false);
  assert.equal(result.oneMmLabRecordSummary.rawOneMmJsonReturned, false);
  assert.equal(result.provenanceSummary.rawProvenanceReturned, false);
  assert.equal(result.rawReferenceIesReturned, undefined);
  assert.equal(result.downstreamBoundarySummary.iesGenerated, false);
  assert.equal(result.unsafeOutputsBlocked.rawReferenceIesBlocked, true);
  assert.equal(text.includes("IESNA:"), false);
  assert.equal(text.includes("TILT="), false);
  assert.equal(text.includes("candelaGrid"), false);
  assert.equal(text.includes("data:application"), false);
  assert.equal(text.includes("C:\\"), false);
  assert.equal(text.includes(".ies"), false);
  assert.equal(text.includes(".json"), false);
});

test("helper does not add routes, POST endpoints, RuntimeData mutation, donor Engine, IES, or RunTable generation", async () => {
  const helperText = await readFile(helperSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const result = buildRuntimeApprovedLabReferenceSummary(completeInput());

  assert.equal(result.safetyFlags.donorEngineInvoked, false);
  assert.equal(result.safetyFlags.donorPhotometryInvoked, false);
  assert.equal(result.safetyFlags.runtimeDataMutated, false);
  assert.equal(result.safetyFlags.selectedResultPersisted, false);
  assert.equal(result.safetyFlags.productionRunTableGenerated, false);
  assert.equal(result.safetyFlags.runTableGenerated, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
  assert.equal(result.safetyFlags.routesAdded, false);
  assert.equal(result.safetyFlags.postEndpointsAdded, false);
  assert.equal(helperText.includes("node:fs"), false);
  assert.equal(helperText.includes("node:path"), false);
  assert.equal(helperText.includes("node:crypto"), false);
  assert.equal(helperText.includes("run_engine"), false);
  assert.equal(helperText.includes("parse_ies"), false);
  assert.equal(helperText.includes("writeFile"), false);
  assert.equal(helperText.includes("mkdir"), false);
  assert.equal(helperText.includes("router.post"), false);
  assert.equal(helperText.includes("app.post"), false);
  assert.equal(serverText.includes("runtimeApprovedLabReferenceSummary"), false);
  assert.equal(/POST[\s\S]{0,180}approved-lab-reference/i.test(serverText), false);
  assert.equal(/approved-lab-reference[\s\S]{0,180}POST/i.test(serverText), false);
});
