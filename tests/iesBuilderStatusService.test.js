import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  IES_BUILDER_STATUS_PATH,
  buildIesBuilderStatus,
} from "../packages/workspace-kernel/iesBuilderStatusService.js";
import { createIesBuilderViewModel } from "../packages/modules/ies-builder/iesBuilderViewModel.js";

const REQUIRED_BOUNDARY_WARNINGS = Object.freeze([
  "IES Builder is read-only and diagnostic in this slice.",
  "Fixture/parser diagnostics use safe runtime summaries only.",
  "No IES upload, export, generation, or mutation is enabled.",
  "Any parsed or derived photometry shown here is candidate-only.",
  "IES Builder does not provide Lab proof.",
  "Lab Proof remains the boundary for proof authority.",
  "Board Data may define metadata, but Board Data does not prove photometry.",
  "Selector must not treat candidate photometry as approved proof.",
]);

const REQUIRED_CANDIDATE_BOUNDARY_COPY = Object.freeze([
  "IES Builder candidate readiness is diagnostic only in this slice.",
  "No IES file is generated, parsed, uploaded, previewed, or exported here.",
  "An IES candidate is not Lab Proof.",
  "Photometric candidate output must not be treated as production proof.",
  "Board Data defines metadata. Selector resolves. IES Builder may generate candidate artefacts later. Lab proves.",
]);

const REQUIRED_CANDIDATE_READINESS_REQUIREMENTS = Object.freeze([
  "Selector candidate state present",
  "product/body intent resolved",
  "board candidate resolved",
  "optic/diffuser intent resolved",
  "electrical/driver context resolved",
  "photometric template/source identified",
  "Board Data reference present",
  "length/scaling policy identified",
  "emergency/EGRES dependency checked",
  "compliance dependency checked",
  "Lab Proof boundary clearly separated",
  "human review warning surfaced",
]);

const REQUIRED_CANDIDATE_STATES = Object.freeze([
  "not ready",
  "missing selector candidate",
  "missing board data reference",
  "missing photometric source",
  "candidate input ready",
  "candidate-only output possible later",
  "requires review",
  "requires Lab Proof before production claim",
]);

const REQUIRED_CANDIDATE_FLAG_ROWS = Object.freeze([
  ["readOnly", "true"],
  ["diagnosticOnly", "true"],
  ["candidateReadinessExplanationOnly", "true"],
  ["iesGenerationEnabled", "false"],
  ["iesUploadEnabled", "false"],
  ["iesParseEnabled", "false"],
  ["iesExportEnabled", "false"],
  ["polarPreviewEnabled", "false"],
  ["selectorMutationEnabled", "false"],
  ["boardDataWriteEnabled", "false"],
  ["labProofAuthority", "false"],
  ["engineExecutionEnabled", "false"],
  ["runTableGenerationEnabled", "false"],
  ["payloadGenerationEnabled", "false"],
  ["drawingGenerationEnabled", "false"],
  ["hiddenWriteBackEnabled", "false"],
]);

function assertSafeBoundaryFlags(status) {
  assert.equal(status.readOnly, true);
  assert.equal(status.diagnosticOnly, true);
  assert.equal(status.candidateOutputOnly, true);
  assert.equal(status.productionProofAuthority, false);
  assert.equal(status.labApprovalRequired, true);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.boardDataWritesEnabled, false);
  assert.equal(status.boardDataMutationEnabled, false);
  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.uploadEnabled, false);
  assert.equal(status.parseEnabled, false);
  assert.equal(status.parseUploadEnabled, false);
  assert.equal(status.exportEnabled, false);
  assert.equal(status.polarPreviewEnabled, false);
  assert.equal(status.proofClaimsEmitted, false);
  assert.equal(status.rawIesExposed, false);
  assert.equal(status.rawLabEvidenceExposed, false);
  assert.equal(status.rawArtefactsExposed, false);
  assert.equal(status.rawPdfsExposed, false);
  assert.equal(status.donorPythonMounted, false);
  assert.equal(status.donorCodeMounted, false);
  assert.equal(status.largeDependenciesAdded, false);
  assert.equal(status.googleSyncEnabled, false);
  assert.equal(status.activeSnapshotWriteEnabled, false);
  assert.equal(status.materialisedSnapshotWriteEnabled, false);
  assert.equal(status.noWritesAttempted, true);
  assert.equal(status.postEndpointsEnabled, false);
  assert.equal(status.proofStatus, "not_proof_authority");
}

test("/api/ies-builder/status service shape is safe", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.ok, true);
  assert.equal(status.endpoint, IES_BUILDER_STATUS_PATH);
  assert.equal(status.owner, "runtime-server");
  assert.equal(status.moduleId, "ies_builder");
  assert.equal(status.label, "IES Builder / Photometry");
  assertSafeBoundaryFlags(status);
  assert.deepEqual(status.warnings, REQUIRED_BOUNDARY_WARNINGS);
});

test("required IES Builder boundary flags are present and locked", () => {
  const status = buildIesBuilderStatus();

  assertSafeBoundaryFlags(status);
});

test("fixture/parser diagnostics use safe runtime summaries only", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.currentStatusSummary, "Read-only fixture/parser diagnostics are available from safe runtime metadata only.");
  assert.equal(status.parserCapabilityStatus, "safe_summary_only_no_raw_ies");
  assert.equal(status.fixtureSampleReadinessStatus, "metadata_only_no_upload_enabled");
  assert.equal(status.candidateBoundary, "candidate_only_not_approved_proof");
  assert.equal(status.proofBoundarySummary, "Lab Proof remains the boundary for proof authority.");
  assert.ok(Array.isArray(status.blockedActions));
  assert.ok(status.blockedActions.includes("IES upload"));
  assert.ok(status.blockedActions.includes("upload parsing"));
  assert.ok(status.blockedActions.includes("IES export"));
  assert.ok(status.blockedActions.includes("IES generation"));
  assert.ok(status.blockedActions.includes("Selector mutation"));
  assert.ok(status.blockedActions.includes("Board Data mutation"));
  assert.ok(status.blockedActions.includes("Lab proof claim"));
  assert.ok(status.blockedActions.includes("raw IES exposure"));
  assert.ok(status.blockedActions.includes("raw Lab evidence exposure"));
  assert.ok(status.blockedActions.includes("donor Python mounting"));
  assert.ok(status.blockedActions.includes("donor code mounting"));
});

test("required UI boundary wording is emitted by the status service", () => {
  const status = buildIesBuilderStatus();

  for (const warning of REQUIRED_BOUNDARY_WARNINGS) {
    assert.ok(status.warnings.includes(warning));
  }
});

test("IES Builder status emits no proof authority or proof claim", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.productionProofAuthority, false);
  assert.equal(status.labApprovalRequired, true);
  assert.equal(status.labProofAuthority, false);
  assert.equal(status.proofClaimsEmitted, false);
  assert.equal(status.proofStatus, "not_proof_authority");
  assert.equal(status.candidateOutputOnly, true);
});

test("generation, upload, parse, export, and polar preview are disabled", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.uploadEnabled, false);
  assert.equal(status.parseEnabled, false);
  assert.equal(status.parseUploadEnabled, false);
  assert.equal(status.exportEnabled, false);
  assert.equal(status.polarPreviewEnabled, false);
});

test("Selector mutation and Board Data writes are disabled", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.boardDataWritesEnabled, false);
  assert.equal(status.boardDataMutationEnabled, false);
  assert.equal(status.activeSnapshotWriteEnabled, false);
  assert.equal(status.materialisedSnapshotWriteEnabled, false);
});

test("raw IES, Lab evidence, artefacts, and PDFs are not exposed", () => {
  const status = buildIesBuilderStatus();
  const text = JSON.stringify(status);

  assert.equal(status.rawIesExposed, false);
  assert.equal(status.rawLabEvidenceExposed, false);
  assert.equal(status.rawArtefactsExposed, false);
  assert.equal(status.rawPdfsExposed, false);
  assert.equal(text.includes("TILT="), false);
  assert.equal(text.includes("[_DATA]"), false);
  assert.equal(text.includes("LAB_RAW"), false);
});

test("donor Python, donor code, and large dependency hooks are not mounted", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.donorPythonMounted, false);
  assert.equal(status.donorCodeMounted, false);
  assert.equal(status.largeDependenciesAdded, false);
  assert.equal(status.googleSyncEnabled, false);
});

test("no write attempt is made", async () => {
  const writes = [];
  const fakeFs = {
    writeFile: async (...args) => {
      writes.push(args);
      throw new Error("write should not be called by IES Builder status service");
    },
  };

  const status = buildIesBuilderStatus({ fsApi: fakeFs });

  assert.equal(status.ok, true);
  assert.equal(status.noWritesAttempted, true);
  assert.equal(writes.length, 0);
});

test("IES Builder view model emits candidate readiness diagnostics", () => {
  const viewModel = createIesBuilderViewModel({
    context: { route: { moduleId: "ies_builder" } },
    local: { status: "ready" },
    status: {},
  });

  assert.deepEqual(viewModel.boundaryStatements, REQUIRED_CANDIDATE_BOUNDARY_COPY);
  assert.deepEqual(viewModel.candidateReadinessRequirements, REQUIRED_CANDIDATE_READINESS_REQUIREMENTS);
  assert.deepEqual(viewModel.candidateStates, REQUIRED_CANDIDATE_STATES);
  assert.deepEqual(viewModel.candidateReadinessFlagRows, REQUIRED_CANDIDATE_FLAG_ROWS);
  assert.deepEqual(viewModel.relationshipRows, [
    ["Selector", "selection/candidate source"],
    ["Board Data", "metadata source"],
    ["IES Builder", "future candidate artefact generator"],
    ["Engine Flow", "confidence path explanation"],
    ["Lab Proof", "production proof authority"],
    ["Controlled Records", "future provenance/review trail"],
  ]);
});

test("IES Builder view source does not add active artefact controls", async () => {
  const viewText = await readFile(new URL("../packages/modules/ies-builder/iesBuilderView.js", import.meta.url), "utf-8");
  const indexText = await readFile(new URL("../packages/modules/ies-builder/index.js", import.meta.url), "utf-8");
  const combined = `${viewText}\n${indexText}`;

  assert.equal(/createElement\(["']button["']\)/.test(combined), false);
  assert.equal(/method:\s*["']POST["']/.test(combined), false);
  assert.equal(/upload/i.test(combined) && /addEventListener\(["']change["']/.test(combined), false);
  assert.equal(/download/i.test(combined) && /createObjectURL/.test(combined), false);
});

test("no POST IES Builder endpoint is added", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(serverText.includes("IES_BUILDER_POST"), false);
  assert.equal(/POST[\s\S]{0,160}IES_BUILDER_STATUS_PATH/.test(serverText), false);
  assert.equal(/AUTH_REF_POST_PATHS[\s\S]{0,700}IES_BUILDER_STATUS_PATH/.test(serverText), false);
});
