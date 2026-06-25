import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  IES_BUILDER_STATUS_PATH,
  buildIesBuilderStatus,
} from "../packages/workspace-kernel/iesBuilderStatusService.js";

function assertSafeBoundaryFlags(status) {
  assert.equal(status.readOnly, true);
  assert.equal(status.diagnosticOnly, true);
  assert.equal(status.productionProofAuthority, false);
  assert.equal(status.labApprovalRequired, true);
  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.boardDataWritesEnabled, false);
  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.uploadEnabled, false);
  assert.equal(status.parseEnabled, false);
  assert.equal(status.exportEnabled, false);
  assert.equal(status.polarPreviewEnabled, false);
  assert.equal(status.candidateOutputOnly, true);
  assert.equal(status.proofClaimsEmitted, false);
  assert.equal(status.rawIesExposed, false);
  assert.equal(status.rawLabEvidenceExposed, false);
  assert.equal(status.rawArtefactsExposed, false);
  assert.equal(status.rawPdfsExposed, false);
  assert.equal(status.donorPythonMounted, false);
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
  assert.deepEqual(status.warnings, [
    "IES Builder produces candidate/generated photometry only.",
    "Lab approval is required before any generated output can be treated as approved proof.",
    "Selector mutation and Board Data writes are disabled.",
  ]);
});

test("required IES Builder boundary flags are present and locked", () => {
  const status = buildIesBuilderStatus();

  assertSafeBoundaryFlags(status);
});

test("IES Builder status emits no proof authority or proof claim", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.productionProofAuthority, false);
  assert.equal(status.labApprovalRequired, true);
  assert.equal(status.proofClaimsEmitted, false);
  assert.equal(status.proofStatus, "not_proof_authority");
  assert.equal(status.candidateOutputOnly, true);
});

test("generation, upload, parse, export, and polar preview are disabled", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.iesGenerationEnabled, false);
  assert.equal(status.uploadEnabled, false);
  assert.equal(status.parseEnabled, false);
  assert.equal(status.exportEnabled, false);
  assert.equal(status.polarPreviewEnabled, false);
});

test("Selector mutation and Board Data writes are disabled", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.selectorMutationEnabled, false);
  assert.equal(status.boardDataWritesEnabled, false);
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

test("donor Python and large dependency hooks are not mounted", () => {
  const status = buildIesBuilderStatus();

  assert.equal(status.donorPythonMounted, false);
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

test("no POST IES Builder endpoint is added", async () => {
  const serverText = await readFile(new URL("../server.js", import.meta.url), "utf-8");

  assert.equal(serverText.includes("IES_BUILDER_POST"), false);
  assert.equal(/POST[\s\S]{0,160}IES_BUILDER_STATUS_PATH/.test(serverText), false);
  assert.equal(/AUTH_REF_POST_PATHS[\s\S]{0,700}IES_BUILDER_STATUS_PATH/.test(serverText), false);
});
