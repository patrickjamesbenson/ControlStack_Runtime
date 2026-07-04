import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  buildLabEvidenceAtomContract,
  buildRuntimeLabEvidenceAtomContract,
  buildLabEvidenceAtomSummary,
  buildRuntimeNativeLabEvidenceAtomContract,
  LAB_EVIDENCE_ATOM_SCHEMA_ID,
  LAB_EVIDENCE_ATOM_SCHEMA_VERSION,
  LAB_EVIDENCE_ATOM_SUCCESS_STATE,
  LAB_EVIDENCE_ATOM_FAILURE_STATE,
  LAB_EVIDENCE_ATOM_ALLOWED_OUTPUT_KEYS,
} from "../packages/workspace-kernel/labEvidenceAtomContract.js";

const helperSourceUrl = new URL("../packages/workspace-kernel/labEvidenceAtomContract.js", import.meta.url);
const serverSourceUrl = new URL("../server.js", import.meta.url);

function baseEvidence(overrides = {}) {
  return {
    evidence_id: "evidence-original-ies-001",
    evidence_kind: "original_ies",
    subject_kind: "candidate_pure_reference",
    subject_id: "candidate-pure-reference-dnx60-opal",
    uploaded_at: "2026-07-04T08:30:00+10:00",
    uploaded_by_ref: "safe-user:lab-intake",
    source_date: "2026-07-01",
    file_hash: "safe-file-hash:source-report-001",
    classification_ai_suggested: false,
    classification_human_approved: false,
    human_reviewer_ref: null,
    review_status: "pending",
    approval_status: "not_approved",
    effective_from: null,
    expires_at: null,
    supersedes_evidence_id: null,
    superseded_by_evidence_id: null,
    visibility: "safe_summary",
    ...overrides,
  };
}

function approvedEvidence(overrides = {}) {
  return baseEvidence({
    classification_ai_suggested: true,
    classification_human_approved: true,
    human_reviewer_ref: "safe-reviewer:lab-lead",
    review_status: "accepted",
    approval_status: "approved_for_candidate_use",
    effective_from: "2026-07-04T09:00:00+10:00",
    ...overrides,
  });
}

function assertBlocked(input, blocker) {
  const result = buildLabEvidenceAtomContract(input);
  assert.equal(result.ok, false);
  assert.equal(result.state, LAB_EVIDENCE_ATOM_FAILURE_STATE);
  assert.equal(result.blocker, blocker);
  assert.equal(result.evidence_fingerprint, null);
  return result;
}

test("valid original_ies evidence atom returns safe summary", () => {
  const result = buildLabEvidenceAtomContract(baseEvidence());

  assert.equal(result.ok, true);
  assert.equal(result.schemaId, LAB_EVIDENCE_ATOM_SCHEMA_ID);
  assert.equal(result.schemaVersion, LAB_EVIDENCE_ATOM_SCHEMA_VERSION);
  assert.equal(result.state, LAB_EVIDENCE_ATOM_SUCCESS_STATE);
  assert.equal(result.evidence_kind, "original_ies");
  assert.equal(result.subject_kind, "candidate_pure_reference");
  assert.equal(result.raw_content_returned, false);
  assert.equal(result.safetyFlags.uploadPerformed, false);
  assert.equal(result.safetyFlags.realFileHashingPerformed, false);
  assert.equal(result.safetyFlags.aiClassificationInvoked, false);
  assert.equal(result.safetyFlags.evidenceApprovalPerformed, false);
  assert.equal(result.safetyFlags.runtimeDataMutated, false);
  assert.equal(result.safetyFlags.donorMutated, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
  assert.equal(result.safetyFlags.runTableGenerated, false);
  assert.equal(result.safetyFlags.routesAdded, false);
  assert.equal(result.safetyFlags.postEndpointsAdded, false);
  assert.match(result.evidence_fingerprint, /^safe-lab-evidence-atom:/);
});

test("valid thermal_test_report evidence atom attaches to system_family", () => {
  const result = buildLabEvidenceAtomContract(approvedEvidence({
    evidence_id: "evidence-thermal-family-nvb-001",
    evidence_kind: "thermal_test_report",
    subject_kind: "system_family",
    subject_id: "system-family-nvb-60",
    file_hash: "safe-file-hash:thermal-report-001",
    approval_status: "approved_for_thermal_inheritance",
  }));

  assert.equal(result.ok, true);
  assert.equal(result.evidence_kind, "thermal_test_report");
  assert.equal(result.subject_kind, "system_family");
  assert.equal(result.subject_id, "system-family-nvb-60");
  assert.equal(result.approvalSummary.approvedForThermalInheritance, true);
  assert.equal(result.approvalSummary.approvalWritePerformed, false);
});

test("valid orientation_declaration evidence atom attaches to optic_reference", () => {
  const result = buildLabEvidenceAtomContract(approvedEvidence({
    evidence_id: "evidence-orientation-optic-001",
    evidence_kind: "orientation_declaration",
    subject_kind: "optic_reference",
    subject_id: "optic-reference-opal-60",
    file_hash: "safe-file-hash:orientation-declaration-001",
    approval_status: "approved_for_candidate_use",
  }));

  assert.equal(result.ok, true);
  assert.equal(result.evidence_kind, "orientation_declaration");
  assert.equal(result.subject_kind, "optic_reference");
  assert.equal(result.subject_id, "optic-reference-opal-60");
  assert.equal(result.classification_human_approved, true);
  assert.equal(result.reviewSummary.aiSuggestionIsNotApproval, true);
});

test("aliases point at the same Lab evidence atom helper", () => {
  assert.equal(buildRuntimeLabEvidenceAtomContract, buildLabEvidenceAtomContract);
  assert.equal(buildLabEvidenceAtomSummary, buildLabEvidenceAtomContract);
  assert.equal(buildRuntimeNativeLabEvidenceAtomContract, buildLabEvidenceAtomContract);
});

test("AI suggestion alone does not approve evidence", () => {
  const suggestedOnly = buildLabEvidenceAtomContract(baseEvidence({
    classification_ai_suggested: true,
    classification_human_approved: false,
    approval_status: "not_approved",
  }));

  assert.equal(suggestedOnly.ok, true);
  assert.equal(suggestedOnly.approval_status, "not_approved");
  assert.equal(suggestedOnly.approvalSummary.approvedForSelectorUse, false);
  assert.equal(suggestedOnly.reviewSummary.aiSuggestionIsNotApproval, true);

  const blocked = assertBlocked(baseEvidence({
    classification_ai_suggested: true,
    classification_human_approved: false,
    approval_status: "approved_for_selector_use",
  }), "ai-classification-not-human-approved");
  assert.equal(blocked.safetyFlags.aiClassificationInvoked, false);
  assert.equal(blocked.safetyFlags.evidenceApprovalPerformed, false);
});

test("approval fails without human reviewer/date", () => {
  assertBlocked(baseEvidence({
    classification_human_approved: true,
    human_reviewer_ref: "safe-reviewer:lab-lead",
    approval_status: "approved_for_candidate_use",
    review_status: "accepted",
    effective_from: null,
  }), "approval-without-human-review");

  assertBlocked(baseEvidence({
    classification_human_approved: true,
    human_reviewer_ref: null,
    approval_status: "approved_for_candidate_use",
    review_status: "accepted",
    effective_from: "2026-07-04T09:00:00+10:00",
  }), "approval-without-human-review");
});

test("raw IES, raw body, and private path input fail closed", () => {
  assertBlocked(baseEvidence({ rawIesText: "IESNA:LM-63-2002\nTILT=NONE" }), "raw-ies-not-approved");
  assertBlocked(baseEvidence({ evidenceBody: "Full lab report body must not be returned." }), "unsafe-raw-evidence-content");
  assertBlocked(baseEvidence({ sourcePath: "C:\\ControlStack_RuntimeData\\Lab\\report.pdf" }), "unsafe-private-path-input");
});

test("raw photometry, candela, base64, and raw rows fail closed", () => {
  assertBlocked(baseEvidence({ photometry: { verticalAngles: [0, 90] } }), "raw-photometry-not-approved");
  assertBlocked(baseEvidence({ candelaArrays: [[1, 2, 3]] }), "raw-photometry-not-approved");
  assertBlocked(baseEvidence({ fileArtifact: "data:application/pdf;base64,AAAA" }), "raw-photometry-not-approved");
  assertBlocked(baseEvidence({ rawRows: [{ row: 1 }] }), "unsafe-raw-evidence-content");
});

test("unsupported evidence_kind fails closed", () => {
  assertBlocked(baseEvidence({ evidence_kind: "marketing_claim" }), "unsupported-evidence-kind");
});

test("unsupported subject_kind fails closed", () => {
  assertBlocked(baseEvidence({ subject_kind: "raw_lab_file" }), "unsupported-subject-kind");
});

test("required identity, hash, and review fields fail closed when missing", () => {
  assertBlocked(baseEvidence({ evidence_id: "" }), "missing-evidence-id");
  assertBlocked(baseEvidence({ evidence_kind: "" }), "missing-evidence-kind");
  assertBlocked(baseEvidence({ subject_kind: "" }), "missing-subject-kind");
  assertBlocked(baseEvidence({ subject_id: "" }), "missing-subject-id");
  assertBlocked(baseEvidence({ uploaded_at: "" }), "missing-uploaded-at");
  assertBlocked(baseEvidence({ uploaded_by_ref: "" }), "missing-uploaded-by");
  assertBlocked(baseEvidence({ file_hash: "" }), "missing-file-hash");
  assertBlocked(baseEvidence({ review_status: "" }), "missing-review-status");
  assertBlocked(baseEvidence({ review_status: "approved_by_ai" }), "unsupported-review-status");
  assertBlocked(baseEvidence({ approval_status: "approved_by_ai" }), "unsupported-approval-status");
});

test("produces deterministic fingerprint from safe fields", () => {
  const first = buildLabEvidenceAtomContract(approvedEvidence({ evidence_id: "evidence-deterministic-001" }));
  const second = buildLabEvidenceAtomContract(approvedEvidence({ evidence_id: "evidence-deterministic-001" }));
  const changed = buildLabEvidenceAtomContract(approvedEvidence({ evidence_id: "evidence-deterministic-002" }));

  assert.equal(first.ok, true);
  assert.equal(first.evidence_fingerprint, second.evidence_fingerprint);
  assert.notEqual(first.evidence_fingerprint, changed.evidence_fingerprint);
  assert.match(first.evidence_fingerprint, /^safe-lab-evidence-atom:/);
});

test("exposes only allow-listed top-level keys", () => {
  const result = buildLabEvidenceAtomContract(approvedEvidence());
  const allowed = [...LAB_EVIDENCE_ATOM_ALLOWED_OUTPUT_KEYS].sort();
  const actual = Object.keys(result).sort();

  assert.deepEqual(actual, allowed);
});

test("safe summary never returns raw content or private paths", () => {
  const result = buildLabEvidenceAtomContract(approvedEvidence({
    evidence_id: "evidence-safe-output-001",
    evidence_kind: "human_lab_approval",
    subject_kind: "approved_lab_reference",
    subject_id: "approved-reference-dnx60-opal",
    file_hash: "safe-file-hash:human-approval-001",
    visibility: "restricted",
  }));
  const text = JSON.stringify(result);

  assert.equal(result.ok, true);
  assert.equal(result.raw_content_returned, false);
  assert.equal(result.safetyFlags.rawIesReturned, false);
  assert.equal(result.safetyFlags.rawPhotometryReturned, false);
  assert.equal(result.safetyFlags.candelaArraysReturned, false);
  assert.equal(result.safetyFlags.base64ArtifactsReturned, false);
  assert.equal(result.safetyFlags.rawRowsReturned, false);
  assert.equal(result.safetyFlags.rawEvidenceBodyReturned, false);
  assert.equal(result.safetyFlags.privatePathsReturned, false);
  assert.equal(text.includes("IESNA:"), false);
  assert.equal(text.includes("TILT="), false);
  assert.equal(text.includes("candelaGrid"), false);
  assert.equal(text.includes("data:application"), false);
  assert.equal(text.includes("C:\\"), false);
});

test("blocks RuntimeData mutation, donor Engine, IES, RunTable, routes, and POST markers", () => {
  assertBlocked(baseEvidence({ runtimeDataMutated: true }), "runtime-data-mutation-not-approved");
  assertBlocked(baseEvidence({ donorEngineInvoked: true }), "donor-engine-invocation-not-approved");
  assertBlocked(baseEvidence({ iesGenerated: true }), "ies-generation-not-approved");
  assertBlocked(baseEvidence({ runTableGenerated: true }), "runtable-generation-not-approved");
  assertBlocked(baseEvidence({ routesAdded: true }), "post-endpoint-not-approved");
  assertBlocked(baseEvidence({ postEndpointsAdded: true }), "post-endpoint-not-approved");
});

test("helper does not add routes, POST endpoints, uploads, RuntimeData mutation, donor Engine, IES, or RunTable generation", async () => {
  const helperText = await readFile(helperSourceUrl, "utf-8");
  const serverText = await readFile(serverSourceUrl, "utf-8");
  const result = buildLabEvidenceAtomContract(approvedEvidence({ evidence_id: "evidence-boundary-001" }));

  assert.equal(result.safetyFlags.uploadPerformed, false);
  assert.equal(result.safetyFlags.fileUploaded, false);
  assert.equal(result.safetyFlags.realFileHashingPerformed, false);
  assert.equal(result.safetyFlags.aiClassificationInvoked, false);
  assert.equal(result.safetyFlags.aiClassificationApprovalPerformed, false);
  assert.equal(result.safetyFlags.evidenceApprovalPerformed, false);
  assert.equal(result.safetyFlags.evidenceRecordCreated, false);
  assert.equal(result.safetyFlags.runtimeDataMutated, false);
  assert.equal(result.safetyFlags.donorMutated, false);
  assert.equal(result.safetyFlags.donorEngineInvoked, false);
  assert.equal(result.safetyFlags.donorPhotometryInvoked, false);
  assert.equal(result.safetyFlags.selectedResultPersisted, false);
  assert.equal(result.safetyFlags.productionRunTableGenerated, false);
  assert.equal(result.safetyFlags.runTableGenerated, false);
  assert.equal(result.safetyFlags.iesGenerated, false);
  assert.equal(result.safetyFlags.routesAdded, false);
  assert.equal(result.safetyFlags.postEndpointsAdded, false);
  assert.equal(helperText.includes("node:fs"), false);
  assert.equal(helperText.includes("node:path"), false);
  assert.equal(helperText.includes("node:crypto"), false);
  assert.equal(helperText.includes("writeFile"), false);
  assert.equal(helperText.includes("mkdir"), false);
  assert.equal(helperText.includes("run_engine"), false);
  assert.equal(helperText.includes("parse_ies"), false);
  assert.equal(helperText.includes("router.post"), false);
  assert.equal(helperText.includes("app.post"), false);
  assert.equal(serverText.includes("labEvidenceAtomContract"), false);
  assert.equal(/POST[\s\S]{0,180}evidence-atom/i.test(serverText), false);
  assert.equal(/evidence-atom[\s\S]{0,180}POST/i.test(serverText), false);
});
