import test from "node:test";
import assert from "node:assert/strict";

import { createControlledRecordsViewModel } from "../packages/modules/controlled-records/controlledRecordsViewModel.js";
import { createControlledRecordsState } from "../packages/modules/controlled-records/controlledRecordsState.js";

function createAdapter() {
  return {
    moduleId: "controlled_records",
    readSnapshots() {
      return {
        route: { moduleId: "controlled_records" },
        project: { metadata: { title: "Diagnostic Project" } },
        visibility: { visibleModules: ["controlled_records"], hiddenModules: [] },
      };
    },
    getModuleDecision() {
      return { visible: true, reason: "registered-by-shell-diagnostic-slice" };
    },
  };
}

function createModel() {
  return createControlledRecordsViewModel({
    adapter: createAdapter(),
    controlledRecordsState: createControlledRecordsState(),
  });
}

test("Controlled Records view model includes required evidence/provenance boundary copy", () => {
  const model = createModel();

  assert.deepEqual(model.boundaryCopy, [
    "Controlled Records evidence/provenance mapping is read-only in this slice.",
    "Controlled Records records provenance and disposition; it does not prove.",
    "Controlled Records does not approve, certify, assign authority, or transfer custody.",
    "Lab Proof remains the production proof authority.",
    "RREG maps who should review or approve; it does not approve.",
    "No controlled record is created, mutated, approved, ingested, uploaded, or written here.",
  ]);
  assert.deepEqual(model.requiredWording, model.boundaryCopy);
});

test("Controlled Records evidence/provenance flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.deepEqual(model.diagnosticStatus, {
    readOnly: true,
    diagnosticOnly: true,
    provenanceMapOnly: true,
    recordCreationEnabled: false,
    recordMutationEnabled: false,
    evidenceIngestionEnabled: false,
    artefactUploadEnabled: false,
    approvalAutomationEnabled: false,
    dispositionWriteEnabled: false,
    labProofAuthority: false,
    rregAuthorityEnabled: false,
    kcWriteEnabled: false,
    clxWriteEnabled: false,
    runtimeDataWriteEnabled: false,
    hiddenWriteBackEnabled: false,
  });

  assert.equal(model.local.readOnly, true);
  assert.equal(model.local.diagnosticOnly, true);
  assert.equal(model.local.provenanceMapOnly, true);
  assert.equal(model.local.recordCreationEnabled, false);
  assert.equal(model.local.recordMutationEnabled, false);
  assert.equal(model.local.evidenceIngestionEnabled, false);
  assert.equal(model.local.artefactUploadEnabled, false);
  assert.equal(model.local.approvalAutomationEnabled, false);
  assert.equal(model.local.dispositionWriteEnabled, false);
  assert.equal(model.local.runtimeDataWriteEnabled, false);
  assert.equal(model.local.hiddenWriteBackEnabled, false);
});

test("Controlled Records displays future record types, provenance fields, lifecycle, and relationship map", () => {
  const model = createModel();

  assert.deepEqual(model.futureControlledRecordTypes, [
    "selector_candidate_record",
    "ies_candidate_record",
    "lab_evidence_record",
    "compliance_review_record",
    "rreg_review_assignment_record",
    "approval_disposition_record",
    "provenance_note_record",
    "exception_or_warning_record",
  ]);

  assert.deepEqual(model.provenanceFields, [
    "record_ref",
    "source_module",
    "candidate_ref",
    "artefact_ref",
    "board_data_ref",
    "lab_proof_ref",
    "compliance_ref",
    "rreg_ref",
    "reviewer_ref",
    "approver_ref",
    "custody_ref",
    "status",
    "disposition",
    "created_at",
    "reviewed_at",
    "approved_at",
    "supersedes_ref",
    "audit_trail_ref",
  ]);

  assert.deepEqual(model.lifecycleMap, [
    "capture",
    "classify",
    "split",
    "route",
    "review",
    "approve or reject",
    "disposition",
    "supersede",
    "audit trail",
  ]);

  assert.deepEqual(model.relationshipMapRows, [
    ["Selector", "candidate/selection source"],
    ["IES Builder", "candidate artefact source later"],
    ["Lab Proof", "production proof boundary"],
    ["Compliance Matters", "evidence/risk/review map, not certification"],
    ["RREG", "reviewer/approver/custody mapping"],
    ["Controlled Records", "provenance, disposition, and audit trail"],
  ]);
});

test("Controlled Records no-write guardrails exclude active workflow behaviour", () => {
  const model = createModel();

  assert.equal(model.guardrails.postEndpointAdded, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.dataWriteEnabled, false);
  assert.equal(model.guardrails.recordCreationEnabled, false);
  assert.equal(model.guardrails.recordMutationEnabled, false);
  assert.equal(model.guardrails.evidenceIngestionEnabled, false);
  assert.equal(model.guardrails.artefactUploadEnabled, false);
  assert.equal(model.guardrails.approvalButtonEnabled, false);
  assert.equal(model.guardrails.approvalWorkflowEnabled, false);
  assert.equal(model.guardrails.dispositionWriteEnabled, false);
  assert.equal(model.guardrails.labProofClaimEnabled, false);
  assert.equal(model.guardrails.rregAuthorityClaimEnabled, false);
  assert.equal(model.guardrails.kcWriteBackEnabled, false);
  assert.equal(model.guardrails.clxWriteBackEnabled, false);
  assert.equal(model.guardrails.runtimeDataWriteEnabled, false);
  assert.equal(model.guardrails.hiddenBackendCallEnabled, false);
  assert.equal(model.guardrails.exportButtonEnabled, false);
  assert.equal(model.guardrails.sendButtonEnabled, false);
  assert.equal(model.guardrails.activeAutomationEnabled, false);
});
