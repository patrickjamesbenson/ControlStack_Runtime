import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const moduleSourceUrl = new URL("../packages/modules/cs-selector/index.js", import.meta.url);
const stylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);

test("Selector page renders product-facing controls before collapsed Diagnostics", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  const productIndex = source.indexOf("appendSelectorProductSurface(article");
  const diagnosticsIndex = source.indexOf("const diagnosticsDetails = document.createElement(\"details\")");
  const expanderDiagnosticsIndex = source.indexOf("appendSelectorExpanderShell(diagnostics");

  assert.ok(productIndex > 0, "product-facing Selector surface should be rendered");
  assert.ok(diagnosticsIndex > productIndex, "Diagnostics should come after the product surface");
  assert.ok(expanderDiagnosticsIndex > diagnosticsIndex, "existing diagnostics should live inside Diagnostics");
  assert.equal(source.includes("appendSelectorExpanderShell(article"), false);
  const disabledSummaryIndex = source.indexOf("appendSelectorDisabledHandoffSummary(diagnostics");
  const specBuildPreviewIndex = source.indexOf("appendSelectorSpecBuildReadinessPreview(diagnostics");
  const compactStatusIndex = source.indexOf("appendSelectorProductCompactStatus(diagnostics");
  assert.ok(specBuildPreviewIndex > disabledSummaryIndex, "spec-build readiness preview should follow disabled handoff summary inside product surface");
  assert.ok(specBuildPreviewIndex < compactStatusIndex, "spec-build readiness preview should appear before product compact details");
  assert.match(source, /CS Selector Preview/);
  assert.match(source, /Read-only DB-backed candidate preview\. Manual selections are constraints; auto selections are consequences\./);
});

test("Selector product surface includes required safety and proof copy", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  assert.match(source, /Read-only preview\. No spec, slug, IES, payload, RunTable, Lab Proof, Controlled Record, RREG approval, custody transfer, Board Data write, or hidden write-back is created here\./);
  assert.match(source, /Selector previews selection readiness\. Lab Proof proves later\./);
  assert.match(source, /Spec-build readiness preview/);
  assert.match(source, /Product-facing readiness preview only/);
  assert.match(source, /No slug\/spec\/PDF\/payload\/RunTable\/IES\/proof\/approval\/record\/write is generated/);
  assert.match(source, /Spec Ready incomplete/);
  assert.match(source, /not Lab Proof/);
  assert.match(source, /writes disabled/);
});

test("Selector diagnostics remain available behind the small d developer drawer", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  assert.match(source, /cs-selector-diagnostics/);
  assert.match(source, /cs-selector-dev-drawer/);
  assert.match(source, /appendText\(diagnosticsSummary, "span", "d", "cs-selector-dev-drawer__key"\)/);
  assert.match(source, /dataset\.selectorDeveloperDrawer = "closed-default"/);
  assert.match(source, /appendSelectorReferencePanel\(diagnostics/);
  assert.match(source, /appendSelectorExpanderShell\(diagnostics/);
});

test("Selector module fetches DB-backed options endpoint and reloads it after manual constraint changes", async () => {
  const source = await readFile(moduleSourceUrl, "utf-8");

  assert.match(source, /SELECTOR_REFERENCE_OPTIONS_ENDPOINT = "\/api\/selector-reference\/options"/);
  assert.match(source, /loadSelectorReferenceOptions\(\)/);
  assert.match(source, /selectorOptionConstraintQuery/);
  assert.match(source, /system/);
  assert.match(source, /cct/);
  assert.match(source, /handleSelectorLocalStateChange/);
  assert.match(source, /selectorOptions: activeSelectorOptionsPayload\(\)/);
});

test("Selector product UI has dedicated styling for the working surface", async () => {
  const styles = await readFile(stylesUrl, "utf-8");

  assert.match(styles, /\.cs-selector-product \{/);
  assert.match(styles, /\.cs-selector-product__grid/);
  assert.match(styles, /\.cs-selector-product__field/);
  assert.match(styles, /\.cs-selector-product__badges/);
  assert.match(styles, /\.cs-selector-workflow-preview \{/);
  assert.match(styles, /\.cs-selector-workflow-preview__stage-card/);
  assert.match(styles, /\.cs-selector-workflow-preview__action-card/);
  assert.match(styles, /\.cs-selector-workflow-preview__evidence-status/);
  assert.match(styles, /data-workflow-stage-status=\"blocked\"/);
  assert.match(styles, /\.cs-selector-diagnostics/);
});
