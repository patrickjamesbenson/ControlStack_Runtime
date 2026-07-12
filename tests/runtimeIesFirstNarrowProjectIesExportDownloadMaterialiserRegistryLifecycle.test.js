import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  materialiseRuntimeIesFirstNarrowProjectIesDownload,
  registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource,
} from "../packages/workspace-kernel/iesFirstNarrowProjectIesExportDownloadMaterialiserCapability.js";
import { createShellServices } from "../packages/workspace-kernel/services.js";

function hash(index, offset = 0) {
  return (index + offset).toString(16).padStart(40, "0").slice(-40);
}

function lm63(index) {
  return [
    "IESNA:LM-63-2002",
    `[TEST] REGISTRY-LIFECYCLE-${index}`,
    "[MANUFAC] CONTROLSTACK-RUNTIME",
    "TILT=NONE",
    "1 1000 1 3 1 1 2 0.1 1.2 0.05",
    "1 1 12",
    "0 90 180",
    "0",
    `${100 + index} 50 0`,
    "",
  ].join("\r\n");
}

function lifecycleFixture(index) {
  const opaqueBundleBoundaryRef =
    `safe-ies-first-narrow-candidate-output-bundle-boundary:${hash(index, 100)}`;
  const opaqueProjectIesExportBoundaryRef =
    `safe-ies-first-narrow-project-ies-export-boundary:${hash(index, 200)}`;
  const projectIesExportBoundarySummaryFingerprint =
    `safe-ies-first-narrow-project-ies-export-boundary-summary:${hash(index, 300)}`;
  const identity = {
    opaqueBundleBoundaryRef,
    opaqueProjectIesExportBoundaryRef,
    runLengthMm: 1200 + index,
    builderOutputKind: "project-ies-lm63",
    builderOutputRecordCount: 1,
    builderOutputEntryCount: 1,
    builderOutputSafeScalarCount: 1,
    builderOutputRedactedPayloadMarkerCount: 0,
    policyFingerprint: `safe-policy:registry-lifecycle-${index}`,
    sourceFingerprint: `safe-source:registry-lifecycle-${index}`,
    sourceInputFingerprint: `safe-source-input:registry-lifecycle-${index}`,
    boardDataSourceVersion: `safe-board-data-source-version:registry-lifecycle-${index}`,
    jobKind: "project-ies-export-boundary-job",
    jobFingerprint:
      `safe-ies-first-narrow-project-ies-export-boundary-job:${hash(index, 400)}`,
    builderOutputReductionFingerprint:
      `safe-ies-first-narrow-project-ies-export-builder-output-reduction:${hash(index, 500)}`,
    candidateOutputBundleBoundarySummaryFingerprint:
      `safe-ies-first-narrow-candidate-output-bundle-boundary-summary:${hash(index, 600)}`,
    projectIesExportBoundarySummaryFingerprint,
  };
  const boundarySummary = {
    schemaId: "controlstack.runtime.ies-first-narrow-project-ies-export-boundary-summary.v1",
    schemaVersion: 1,
    contractId: "RUNTIME-IES-FIRST-NARROW-PROJECT-IES-EXPORT-BOUNDARY-1",
    state: "redacted_ies_first_narrow_project_ies_export_boundary_summary_ready",
    blocker: null,
    sourceBacked: true,
    sourceAnchorOnly: true,
    opaqueReferenceOnly: true,
    ...identity,
    iesFirstNarrowProjectIesExportBoundarySummaryFingerprint:
      projectIesExportBoundarySummaryFingerprint,
  };
  const input = Object.freeze({
    sourceKind: "ready-project-ies-export-result-readback-status-only",
    ...identity,
    projectIesExportBoundaryReadbackFingerprint:
      `safe-ies-first-narrow-project-ies-export-boundary-readback-status:${hash(index, 700)}`,
    projectIesExportResultSummaryFingerprint:
      `safe-ies-first-narrow-project-ies-export-result-summary:${hash(index, 800)}`,
    iesFirstNarrowProjectIesExportResultReadbackFingerprint:
      `safe-ies-first-narrow-project-ies-export-result-readback-status:${hash(index, 900)}`,
  });
  return {
    boundarySummary,
    input,
    projectIesText: lm63(index),
  };
}

function register(fixture, projectIesText = fixture.projectIesText, boundarySummary = fixture.boundarySummary) {
  return registerRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserSource({
    projectIesText,
    boundarySummary,
  });
}

test("retains at most eight immutable sources and evicts strictly FIFO without read or duplicate refresh", () => {
  const services = createShellServices();
  const fixtures = Array.from({ length: 9 }, (_, index) => lifecycleFixture(index));

  for (const fixture of fixtures.slice(0, 8)) {
    assert.equal(register(fixture), true);
  }

  assert.equal(services.materialiseProjectIesDownload(fixtures[0].input), fixtures[0].projectIesText);
  assert.equal(services.materialiseProjectIesDownload(fixtures[0].input), fixtures[0].projectIesText);
  assert.equal(register(fixtures[0]), true);
  assert.equal(register(fixtures[8]), true);

  assert.throws(
    () => services.materialiseProjectIesDownload(fixtures[0].input),
    /registration-missing/,
  );
  assert.equal(services.materialiseProjectIesDownload(fixtures[1].input), fixtures[1].projectIesText);
  assert.equal(services.materialiseProjectIesDownload(fixtures[8].input), fixtures[8].projectIesText);
});

test("malformed, stale, and conflicting registrations fail before eviction and preserve the first immutable entry", () => {
  const services = createShellServices();
  const fixture = lifecycleFixture(20);
  const originalBoundarySummary = { ...fixture.boundarySummary };

  assert.equal(register(fixture), true);
  fixture.boundarySummary.runLengthMm = 9999;

  assert.equal(
    register(
      fixture,
      "IESNA:LM-63-2002\r\nTILT=NONE\r\nnot-numeric",
      originalBoundarySummary,
    ),
    false,
  );
  assert.equal(
    register(fixture, lm63(21), originalBoundarySummary),
    false,
  );
  assert.equal(
    register(fixture, fixture.projectIesText, {
      ...originalBoundarySummary,
      schemaVersion: 2,
    }),
    false,
  );

  assert.equal(
    services.materialiseProjectIesDownload(fixture.input),
    fixture.projectIesText,
  );
  assert.equal(register(fixture, fixture.projectIesText, originalBoundarySummary), true);
  assert.equal(
    materialiseRuntimeIesFirstNarrowProjectIesDownload(fixture.input),
    fixture.projectIesText,
  );
});

test("creating a replacement shell-runtime service instance clears every retained source", () => {
  const firstServices = createShellServices();
  const fixture = lifecycleFixture(40);

  assert.equal(register(fixture), true);
  assert.equal(
    firstServices.materialiseProjectIesDownload(fixture.input),
    fixture.projectIesText,
  );

  const replacementServices = createShellServices();
  assert.throws(
    () => firstServices.materialiseProjectIesDownload(fixture.input),
    /registration-missing/,
  );
  assert.throws(
    () => replacementServices.materialiseProjectIesDownload(fixture.input),
    /registration-missing/,
  );

  assert.equal(register(fixture), true);
  assert.equal(
    replacementServices.materialiseProjectIesDownload(fixture.input),
    fixture.projectIesText,
  );
});

test("registry lifecycle remains private, byte-accounted, memory-only, timer-free, and storage-free", async () => {
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

  for (const required of [
    "MAX_REGISTERED_SOURCE_COUNT = 8",
    "MAX_REGISTERED_SOURCE_COMBINED_UTF8_BYTES = 16_000_000",
    "combinedUtf8ByteLength",
    "utf8ByteLength",
    "Object.freeze({",
    "createRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserCapability",
  ]) {
    assert.equal(source.includes(required), true, required);
  }
  for (const forbidden of [
    "collidedProjectBoundaryRefs",
    "setTimeout",
    "setInterval",
    "Date.now",
    "localStorage",
    "sessionStorage",
    "indexedDB",
    "node:fs",
    "writeFile",
    "createWriteStream",
  ]) {
    assert.equal(source.includes(forbidden), false, forbidden);
  }
  assert.equal(
    servicesSource.match(/createRuntimeIesFirstNarrowProjectIesExportDownloadMaterialiserCapability\(\)/g)?.length,
    1,
  );
  assert.equal(servicesSource.includes("projectIesText"), false);
});
