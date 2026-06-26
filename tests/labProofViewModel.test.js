import test from "node:test";
import assert from "node:assert/strict";

import { createSafeLabProofStatus } from "../packages/modules/lab-proof/labProofContractAdapter.js";
import { createLabProofViewModel } from "../packages/modules/lab-proof/labProofViewModel.js";

function createModel(payload = {}) {
  const status = createSafeLabProofStatus({
    ok: true,
    owner: "runtime-server",
    ...payload,
  });

  return createLabProofViewModel({
    context: { route: { moduleId: "lab_proof" } },
    local: { status: "ready", loadedAt: "2026-06-27T00:00:00.000Z", lastAction: "status-loaded" },
    status,
  });
}

function rowValue(rows, key) {
  const match = rows.find(([label]) => label === key);
  return match?.[1];
}

test("Lab Proof readiness flags remain read-only and fail closed", () => {
  const model = createModel({
    readOnly: false,
    diagnosticOnly: false,
    productionProofAuthority: true,
    labApprovalEnabled: true,
    evidenceUploadEnabled: true,
    evidenceIngestionEnabled: true,
    pdfExposureEnabled: true,
    rawArtefactExposureEnabled: true,
    selectorMutationEnabled: true,
    boardDataWriteEnabled: true,
    iesGenerationEnabled: true,
    complianceCertificationEnabled: true,
    hiddenWriteBackEnabled: true,
  });

  assert.equal(rowValue(model.runtimeStatusFlagRows, "readOnly"), "true");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "diagnosticOnly"), "true");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "proofReadinessExplanationOnly"), "true");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "productionProofAuthority"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "labApprovalEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "evidenceUploadEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "evidenceIngestionEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "pdfExposureEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "rawArtefactExposureEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "selectorMutationEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "boardDataWriteEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "iesGenerationEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "complianceCertificationEnabled"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "hiddenWriteBackEnabled"), "false");
});

test("Lab Proof readiness map lists categories, safe fields, and required boundary copy", () => {
  const model = createModel();

  assert.deepEqual(model.proofReadinessCategories, [
    "no evidence mapped",
    "candidate evidence expected",
    "evidence mapped but unreviewed",
    "evidence review required",
    "lab approval required",
    "production proof not established",
    "production proof future-gated",
  ]);

  assert.deepEqual(model.evidenceBoundaryFields, [
    "candidate_ref",
    "product_ref",
    "board_data_ref",
    "ies_candidate_ref",
    "test_method_ref",
    "lab_result_ref",
    "evidence_summary",
    "evidence_status",
    "reviewer_ref",
    "approval_status",
    "controlled_record_ref",
    "proof_boundary",
    "production_claim_allowed",
  ]);

  assert.deepEqual(model.boundaryCopy, [
    "Lab Proof readiness is diagnostic only in this slice.",
    "This module does not provide production proof authority in this slice.",
    "No evidence is uploaded, parsed, exposed, approved, or certified here.",
    "Candidate compatibility, Board Data metadata, and IES candidates are not proof.",
    "Lab Proof is the production proof authority once an approved Lab authority contract exists.",
  ]);
});

test("Lab Proof readiness map describes adjacent module relationships without granting authority", () => {
  const model = createModel();

  assert.deepEqual(model.relationshipMapRows, [
    ["Selector", "candidate/selection source"],
    ["Board Data", "metadata source"],
    ["IES Builder", "candidate photometric artefact source later"],
    ["Compliance Matters", "risk/review mapping, not certification"],
    ["Controlled Records", "provenance/approval/disposition trail later"],
    ["RREG", "reviewer/approver/custody mapping later"],
    ["Lab Proof", "production proof boundary"],
  ]);

  assert.equal(rowValue(model.runtimeStatusFlagRows, "productionProofAuthority"), "false");
  assert.equal(rowValue(model.runtimeStatusFlagRows, "complianceCertificationEnabled"), "false");
});
