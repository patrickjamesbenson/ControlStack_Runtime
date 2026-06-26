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

test("Controlled Records view model includes required read-only wording", () => {
  const model = createModel();

  assert.deepEqual(model.requiredWording, [
    "Controlled Records / Ledger Blueprint is read-only and diagnostic in this slice.",
    "Controlled records are evidence/disposition trails, not task lists.",
    "The lifecycle is capture, classify, split, route, draft/recommend, human approval where required, disposition, and audit trail.",
    "Lab Ledger is one controlled-record implementation, not the universal ledger.",
    "CI Inbox folds into the future Intake Ledger pattern.",
    "MAL is shelved as a primary system and may later return only as a derived action view.",
    "Ledger Health is a diagnostic pattern, not an auto-fix authority.",
    "Liora may later draft, classify, route, and recommend, but must not silently approve, write, or overwrite governed truth.",
    "No active record writing, intake automation, HubSpot write, KC write, CLX write, or Lab proof mutation is enabled.",
  ]);
});

test("Controlled Records diagnostic flags remain read-only and fail closed", () => {
  const model = createModel();

  assert.equal(model.diagnosticStatus.readOnly, true);
  assert.equal(model.diagnosticStatus.diagnosticOnly, true);
  assert.equal(model.diagnosticStatus.activeIntakeEnabled, false);
  assert.equal(model.diagnosticStatus.recordWriteEnabled, false);
  assert.equal(model.diagnosticStatus.ledgerWriteEnabled, false);
  assert.equal(model.diagnosticStatus.lioraAutomationEnabled, false);
  assert.equal(model.diagnosticStatus.kcWriteEnabled, false);
  assert.equal(model.diagnosticStatus.clxWriteEnabled, false);
  assert.equal(model.diagnosticStatus.hubSpotWriteEnabled, false);
  assert.equal(model.diagnosticStatus.labLedgerMutationEnabled, false);
  assert.equal(model.diagnosticStatus.governedTruthMutationEnabled, false);
  assert.equal(model.diagnosticStatus.derivedActionViewEnabled, false);
  assert.equal(model.guardrails.hiddenWriteBackEnabled, false);
  assert.equal(model.guardrails.serverEndpointAdded, false);
  assert.equal(model.guardrails.donorImportEnabled, false);
});

test("Controlled Records displays lifecycle, proposed types, safe schema fields, mapping, and Ledger Health checks", () => {
  const model = createModel();

  assert.deepEqual(model.lifecycle, [
    "capture",
    "classify",
    "split",
    "route",
    "draft/recommend",
    "human approval where required",
    "disposition",
    "audit trail",
  ]);

  assert.deepEqual(model.proposedRecordTypes, [
    "intake",
    "evidence",
    "knowledge_update",
    "clx_update",
    "compliance_risk",
    "egres_package",
    "handoff_custody",
    "module_evidence",
    "derived_action",
  ]);

  assert.deepEqual(model.baseRecordSchemaFields, [
    "record_id",
    "record_type",
    "source_type",
    "source_ref",
    "source_hash",
    "captured_at",
    "captured_by",
    "raw_content_policy",
    "safe_summary",
    "classification",
    "module_or_domain",
    "split_items",
    "route",
    "recommended_action",
    "evidence_refs",
    "kc_refs",
    "clx_refs",
    "repo_refs",
    "web_refs_if_any",
    "human_review_required",
    "human_review_status",
    "disposition",
    "disposition_at",
    "supersedes_record_id",
    "correction_of_record_id",
    "ledger_health_status",
  ]);

  assert.deepEqual(model.oldConceptMappingRows, [
    ["CI Inbox", "Intake Ledger / intake records"],
    ["MAL", "derived action view only"],
    ["Ledger Health", "diagnostic checks across record surfaces"],
    ["Lab Ledger", "Lab/evidence-specific controlled record implementation"],
    ["Ship Audit", "retired"],
    ["Liora Cockpit", "future read-only-first intake/recommendation cockpit"],
  ]);

  assert.deepEqual(model.ledgerHealthChecks, [
    "record completeness",
    "provenance present",
    "classification present",
    "route present",
    "disposition present",
    "human approval status",
    "stale records",
    "orphaned records",
    "broken references",
    "forbidden write attempts",
    "unsafe authority claims",
    "raw content exposure risk",
    "derived action without source record",
  ]);
});
