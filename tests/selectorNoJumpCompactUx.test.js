import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const indexSourceUrl = new URL("../packages/modules/cs-selector/index.js", import.meta.url);
const viewSourceUrl = new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url);
const stylesUrl = new URL("../apps/workspace-shell/src/styles.css", import.meta.url);

test("Selector render path preserves scroll position and focus around selection updates", async () => {
  const source = await readFile(indexSourceUrl, "utf-8");

  assert.match(source, /function captureSelectorViewportState/);
  assert.match(source, /function restoreSelectorViewportState/);
  assert.match(source, /scrollTop/);
  assert.match(source, /activeFieldKey/);
  assert.match(source, /focus\(\{ preventScroll: true \}\)/);
  assert.match(source, /requestAnimationFrame\(\(\) => restoreSelectorViewportState/);
  assert.match(source, /renderCurrentView\(\{ preserveViewport = true \} = \{\}\)/);
});

test("Selector endpoint constraint query includes first-class diffuser var fields", async () => {
  const source = await readFile(indexSourceUrl, "utf-8");

  for (const key of [
    "diffuserVar1",
    "diffuserVar2",
    "directOpticVar1",
    "directOpticVar2",
    "indirectOpticVar1",
    "indirectOpticVar2",
  ]) {
    assert.match(source, new RegExp(`"${key}"`));
  }
});

test("Selector product path defaults to compact selected-truth and workflow metadata", async () => {
  const source = await readFile(viewSourceUrl, "utf-8");

  assert.match(source, /dataset\.compactDefault = "true"/);
  assert.match(source, /appendSelectorProductCompactStatus/);
  assert.match(source, /appendWorkflowHiddenDetails/);
  assert.match(source, /workflowFieldIsHiddenFromPrimary/);
  assert.match(source, /PRIMARY_HIDDEN_WORKFLOW_FIELDS/);
  assert.match(source, /cs-selector-disabled-handoffs/);
  assert.match(source, /Detailed selected-truth rows and safety flags/);
  assert.match(source, /Candidate, blockers, and path details/);
  assert.match(source, /Field metadata/);
  assert.equal(source.includes("createElement(\"img\")"), false);
});

test("Selector compact styling exists for stable product sections", async () => {
  const styles = await readFile(stylesUrl, "utf-8");

  assert.match(styles, /\.cs-selector-product__workflow-header/);
  assert.match(styles, /\.cs-selector-product__section-summary/);
  assert.match(styles, /\.cs-selector-product__workflow-hidden/);
  assert.match(styles, /\.cs-selector-product__field-compact-meta/);
  assert.match(styles, /\.cs-selector-truth-summary__selected/);
  assert.match(styles, /\.cs-selector-disabled-handoffs/);
});
