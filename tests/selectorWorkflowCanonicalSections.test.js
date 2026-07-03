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

test("Selector product render order is canonical workflow plus rail, then closed developer drawer", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  const workflowIndex = source.indexOf("appendSelectorWorkflowSections(main, surface)");
  const railIndex = source.indexOf("appendSelectorSummaryRail(layout, surface)");
  const diagnosticsIndex = source.indexOf("const diagnosticsDetails = document.createElement(\"details\")");
  const summaryIndex = source.indexOf("appendSelectorSelectionTruthSummary(diagnostics");
  const compactStatusIndex = source.indexOf("appendSelectorProductCompactStatus(diagnostics");

  assert.ok(workflowIndex > 0, "canonical workflow should render in the product-first main flow");
  assert.ok(railIndex > workflowIndex, "selected summary rail should render beside workflow controls");
  assert.ok(diagnosticsIndex > railIndex, "developer drawer should remain below the product path");
  assert.ok(summaryIndex > diagnosticsIndex, "detailed selected-truth summary should render inside the developer drawer");
  assert.ok(compactStatusIndex > summaryIndex, "compact candidate/path status should render inside the developer drawer");
  assert.match(source, /diagnosticsDetails\.open = false/);
  assert.match(source, /dataset\.selectorDeveloperDrawer = "closed-default"/);
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
