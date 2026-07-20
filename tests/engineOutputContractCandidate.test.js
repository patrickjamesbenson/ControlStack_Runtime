import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
  RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION,
} from "../packages/workspace-kernel/runtimeThermalLumenExecution.js";
import {
  ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_ID,
  ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_VERSION,
  ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_STATE,
  ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SAFETY_FLAGS,
} from "../packages/workspace-kernel/engineRunTableRuntimeRunTableDomainOutputScaffold.js";
import {
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET,
} from "../packages/workspace-kernel/runTableFirstNarrowRows.js";
import {
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID,
  RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION,
  RUNTABLE_FIRST_NARROW_ROW_FIELD_SET,
} from "../packages/workspace-kernel/runTableFirstNarrowRowShapeContract.js";

const documentUrl = new URL(
  "../docs/engine/ENGINE_OUTPUT_CONTRACT_CANDIDATE_V1.md",
  import.meta.url,
);
const rowsSourceUrl = new URL(
  "../packages/workspace-kernel/runTableFirstNarrowRows.js",
  import.meta.url,
);
const rowShapeSourceUrl = new URL(
  "../packages/workspace-kernel/runTableFirstNarrowRowShapeContract.js",
  import.meta.url,
);
const scaffoldSourceUrl = new URL(
  "../packages/workspace-kernel/engineRunTableRuntimeRunTableDomainOutputScaffold.js",
  import.meta.url,
);

async function readText(url) {
  return readFile(url, "utf-8");
}

test("candidate document is versioned, review-only, and explicitly not stable", async () => {
  const document = await readText(documentUrl);

  assert.match(document, /controlstack\.engine\.output-contract-candidate\.v1/);
  assert.match(document, /candidate_not_stable/);
  assert.match(document, /does not declare the Engine output contract stable/i);
  assert.match(document, /does not activate downstream consumers/i);
  assert.match(document, /SEL-008, Lab consumer adaptation and downstream artifacts remain blocked/);
});

test("candidate pins the accepted thermal schema and honest diagnostic RunTable classification", async () => {
  const document = await readText(documentUrl);

  assert.equal(
    RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID,
    "controlstack.runtime.thermal-lumen-execution.v1",
  );
  assert.equal(RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_VERSION, 1);
  assert.match(document, new RegExp(RUNTIME_THERMAL_LUMEN_EXECUTION_SCHEMA_ID.replaceAll(".", "\\.")));

  assert.equal(
    ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_ID,
    "controlstack.runtime.engine-runtable.runtable-domain-output-scaffold-summary",
  );
  assert.equal(ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SCHEMA_VERSION, 1);
  assert.equal(
    ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_STATE,
    "runtime_runtable_domain_output_scaffold_diagnostic_only",
  );
  assert.equal(
    ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SAFETY_FLAGS
      .productionRunTableGenerationEnabled,
    false,
  );
  assert.equal(
    ENGINE_RUNTABLE_RUNTIME_RUNTABLE_DOMAIN_OUTPUT_SCAFFOLD_SAFETY_FLAGS
      .selectedResultPersistenceEnabled,
    false,
  );
  assert.match(document, /diagnostic-only/i);
  assert.match(document, /not a production RunTable result/i);
});

test("candidate records the existing first-narrow row schema collision", async () => {
  const document = await readText(documentUrl);

  assert.equal(RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_ID, "controlstack.runtime.runtable-first-narrow-rows.v1");
  assert.equal(RUNTABLE_FIRST_NARROW_ROWS_SCHEMA_VERSION, 1);
  assert.equal(RUNTABLE_FIRST_NARROW_ROW_SCHEMA_ID, "controlstack.runtime.runtable-first-narrow-row.v1");
  assert.equal(RUNTABLE_FIRST_NARROW_ROW_SCHEMA_VERSION, 1);

  assert.notDeepEqual(
    [...RUNTABLE_FIRST_NARROW_ROWS_FIELD_SET].sort(),
    [...RUNTABLE_FIRST_NARROW_ROW_FIELD_SET].sort(),
  );
  assert.match(document, /schema collision/i);
  assert.match(document, /two incompatible field sets/i);
  assert.match(document, /not eligible for stability/i);
});

test("persistence-coupled row paths are classified outside Engine eligibility", async () => {
  const [document, rowsSource, rowShapeSource] = await Promise.all([
    readText(documentUrl),
    readText(rowsSourceUrl),
    readText(rowShapeSourceUrl),
  ]);

  assert.match(rowsSource, /redacted_runtable_first_narrow_output_summary_persisted/);
  assert.match(rowsSource, /outputHandoffSummaryPresent/);
  assert.match(rowShapeSource, /persistedSelectedResultSummaryFingerprint/);
  assert.match(rowShapeSource, /persisted-runtable-first-narrow-output-summary-present/);

  assert.match(document, /requires a persisted selected-result summary/i);
  assert.match(document, /Persistence is an outside consumer/i);
  assert.match(document, /cannot make the Engine eligible/i);
});

test("candidate defines selections-only request and quarantines governance traceability", async () => {
  const document = await readText(documentUrl);

  assert.match(document, /controlstack\.engine\.selection-set\.v1/);
  assert.match(document, /controlstack\.engine\.output\.v1/);
  assert.match(document, /controlstack\.engine\.runtable-row\.v1/);
  assert.match(document, /engineering selection set only/i);
  assert.match(document, /must not be read, required, scored, warned upon or returned/i);
  assert.match(document, /Omitting it or changing every value must leave the Engine response identical/i);
  assert.match(document, /caller-supplied candidates, scores, Tier authority, derived temperature/i);
});

test("candidate pins deterministic complete, blocked, replay, compatibility and rollback rules", async () => {
  const document = await readText(documentUrl);

  assert.match(document, /state: complete/);
  assert.match(document, /state: blocked_fail_closed/);
  assert.match(document, /selectedResult: null/);
  assert.match(document, /stable machine-readable blocker codes/i);
  assert.match(document, /request fingerprint/i);
  assert.match(document, /source-version fingerprint/i);
  assert.match(document, /policy fingerprint/i);
  assert.match(document, /ordered evidence fingerprint set/i);
  assert.match(document, /unknown schema versions fail closed/i);
  assert.match(document, /rollback restores the previous producer version/i);
});

test("candidate lists every remaining stability gate and does not bless scaffolds by version alone", async () => {
  const [document, scaffoldSource] = await Promise.all([
    readText(documentUrl),
    readText(scaffoldSourceUrl),
  ]);

  for (const requiredEvidence of [
    /selection-set\.v1` request validator/,
    /non-persistent `controlstack\.engine\.output\.v1` envelope/,
    /unambiguous `controlstack\.engine\.runtable-row\.v1` field set/,
    /consumer compatibility evidence from Lab\/IES/,
    /sealed-fixture or bounded live receipt/,
    /rollback and previous-version readback evidence/,
  ]) {
    assert.match(document, requiredEvidence);
  }

  assert.match(scaffoldSource, /productionRunTableGenerationEnabled: false/);
  assert.match(scaffoldSource, /selectedResultPersistenceEnabled: false/);
  assert.match(scaffoldSource, /diagnosticOnly: true/);
  assert.match(document, /not stable/i);
});
