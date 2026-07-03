import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const viewModelSourceUrl = new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url);
const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const stylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);

test("Selector view model derives a read-only selected-truth summary model", async () => {
  const source = await readFile(viewModelSourceUrl, "utf-8");

  assert.match(source, /function createSelectionTruthSummary/);
  assert.match(source, /selectionTruthSummary/);
  assert.match(source, /SELECTION_TRUTH_SUMMARY_GROUPS/);
  for (const group of [
    "project",
    "systemOptic",
    "environment",
    "lightControl",
    "wiringPower",
    "mountingPenetrations",
    "finishes",
    "egressAccessories",
    "specialParts",
    "runs",
    "blockers",
    "futureHandoffs",
  ]) {
    assert.match(source, new RegExp(`groupKey: "${group}"`));
  }
});

test("Selector selected-truth summary separates truth kinds and keeps safety flags disabled", async () => {
  const source = await readFile(viewModelSourceUrl, "utf-8");

  for (const truthKind of [
    "manual-constraint",
    "auto-consequence",
    "inherited-consequence",
    "blocked",
    "missing",
    "future-disabled",
    "source-status",
  ]) {
    assert.match(source, new RegExp(truthKind));
  }

  assert.match(source, /specGenerationEnabled: false/);
  assert.match(source, /slugGenerationEnabled: false/);
  assert.match(source, /iesGenerationEnabled: false/);
  assert.match(source, /payloadGenerationEnabled: false/);
  assert.match(source, /runTableGenerationEnabled: false/);
  assert.match(source, /labProofAuthority: false/);
  assert.match(source, /controlledRecordWriteEnabled: false/);
  assert.match(source, /rregApprovalEnabled: false/);
  assert.match(source, /hiddenWriteBackEnabled: false/);
  assert.match(source, /rawRowsExposed: false/);
  assert.match(source, /rawUsersExposed: false/);
  assert.match(source, /rawLabEvidenceExposed: false/);
});

test("Selector selected-truth summary feeds the rail by default and detailed rows live in the developer drawer", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  const summaryFunctionIndex = source.indexOf("function appendSelectorSelectionTruthSummary");
  const railRenderIndex = source.indexOf("appendSelectorSummaryRail(layout, surface)");
  const workflowIndex = source.indexOf("appendSelectorWorkflowSections(main, surface)");
  const diagnosticsIndex = source.indexOf("const diagnosticsDetails = document.createElement(\"details\")");
  const summaryDrawerIndex = source.indexOf("appendSelectorSelectionTruthSummary(diagnostics");

  assert.ok(summaryFunctionIndex > 0, "selected-truth summary render helper should exist");
  assert.ok(railRenderIndex > 0, "summary rail should be rendered in the default product layout");
  assert.ok(workflowIndex > 0, "workflow controls should render in the product-first main flow");
  assert.ok(railRenderIndex > workflowIndex, "summary rail should remain beside the main workflow controls");
  assert.ok(diagnosticsIndex > railRenderIndex, "developer drawer should remain after the default product workflow");
  assert.ok(summaryDrawerIndex > diagnosticsIndex, "detailed selected-truth rows should render inside the developer drawer");
  assert.match(source, /dataset\.selectorSummaryRail = "persistent"/);
  assert.match(source, /dataset\.selectorTruthSummary = "read-only"/);
  assert.match(source, /manual selections are constraints; auto\/default\/inherited selections are consequences/);
  assert.match(source, /Blocked values stay visible/);
  assert.match(source, /createSafeRailSelectionSourceBucketRows/);
  assert.match(source, /blockedReviewOnly/);
  assert.match(source, /review required/);
  assert.match(source, /appendRailSelectionSourceBucket\(group, "Blocked", railItemsByKind\(summary, "blocked"\), \{ blockedReviewOnly: true \}\)/);
});

test("Selector selected-truth summary UI has dedicated styles", async () => {
  const styles = await readFile(stylesUrl, "utf-8");

  assert.match(styles, /\.cs-selector-truth-summary \{/);
  assert.match(styles, /\.cs-selector-truth-summary__groups/);
  assert.match(styles, /\.cs-selector-truth-summary__item/);
  assert.match(styles, /data-truth-kind="blocked"/);
  assert.match(styles, /data-truth-kind="future-disabled"/);
});
