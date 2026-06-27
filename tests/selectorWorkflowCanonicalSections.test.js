import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const viewModelSourceUrl = new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url);
const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const stylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);

test("Selector surface declares workflow sections as canonical and flat fields as diagnostic only", async () => {
  const source = await readFile(viewModelSourceUrl, "utf-8");

  assert.match(source, /function createCanonicalWorkflowSections/);
  assert.match(source, /workflowSectionsCanonical: canonicalWorkflow\.workflowSectionsCanonical/);
  assert.match(source, /flatFieldsPrimary: false/);
  assert.match(source, /flatFieldsDiagnosticOnly: true/);
  assert.match(source, /canonicalWorkflowSummary/);
  assert.match(source, /primaryControlFieldCount/);
  assert.match(source, /duplicatePrimaryControlCount/);
});

test("selected-truth summary prefers canonical workflow fields over flat fallback fields", async () => {
  const source = await readFile(viewModelSourceUrl, "utf-8");

  assert.match(source, /for \(const field of \[\.\.\.flattenedWorkflowFields\(workflowSections\), \.\.\.fields\]\)/);
  assert.match(source, /canonicalControl: true/);
  assert.match(source, /primaryControl: true/);
  assert.match(source, /flatFieldFallback: false/);
  assert.match(source, /diagnosticOnly: true/);
});

test("Selector product render order is summary, canonical workflow, cards, then collapsed Diagnostics", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  const summaryIndex = source.indexOf("appendSelectorSelectionTruthSummary(section");
  const workflowIndex = source.indexOf("appendSelectorWorkflowSections(section");
  const compactStatusIndex = source.indexOf("appendSelectorProductCompactStatus(section");
  const diagnosticsIndex = source.indexOf("const diagnosticsDetails = document.createElement(\"details\")");

  assert.ok(summaryIndex > 0, "selected-truth summary should render in the product surface");
  assert.ok(workflowIndex > summaryIndex, "canonical workflow should render after the summary");
  assert.ok(compactStatusIndex > workflowIndex, "compact candidate/path status should render after workflow sections");
  assert.ok(diagnosticsIndex > compactStatusIndex, "Diagnostics should remain below the product path");
  assert.match(source, /diagnosticsDetails\.open = false/);
});

test("flat field grid is not a competing primary product control surface", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  assert.equal(source.includes("select.id = `cs-selector-product-${field.fieldKey}`"), false);
  assert.equal(source.includes("for (const field of surface.fields || []) {\n    const card = document.createElement(\"article\")"), false);
  assert.match(source, /appendSelectorCompatibilityFieldList\(diagnostics, viewModel\.selectorSurface \|\| \{\}\)/);
  assert.match(source, /Flat fields remain available as non-primary diagnostic metadata only/);
  assert.match(source, /canonical visible controls live in workflow sections/);
});

test("workflow sections carry canonical control metadata and safety flags stay disabled", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  assert.match(source, /dataset\.workflowSectionsCanonical/);
  assert.match(source, /dataset\.flatFieldsPrimary/);
  assert.match(source, /workflowSelectedSummary/);
  assert.match(source, /appendWorkflowHiddenDetails/);
  assert.match(source, /specGenerationEnabled/);
  assert.match(source, /labProofAuthority/);
  assert.match(source, /controlledRecordWriteEnabled/);
  assert.match(source, /rregApprovalEnabled/);
  assert.match(source, /hiddenWriteBackEnabled/);
});

test("canonical workflow styling remains targeted", async () => {
  const styles = await readFile(stylesUrl, "utf-8");

  assert.match(styles, /\.cs-selector-product__workflow/);
  assert.match(styles, /\.cs-selector-product__workflow-section/);
  assert.match(styles, /\.cs-selector-compatibility-fields/);
  assert.match(styles, /\.cs-selector-diagnostics/);
});
