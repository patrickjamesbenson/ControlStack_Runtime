import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import {
  SELECTOR_READINESS_STATE_ENTRY_PUSH_EVENT,
  SELECTOR_READINESS_STATE_ENTRY_PUSH_SCHEMA_ID,
  createSelectorReadinessStateEntryPushTracker,
} from "../packages/workspace-kernel/selectorReadinessStateEntryPush.js";

function context(overrides = {}) {
  return {
    projectId: "project-alpha",
    sourceInputFingerprint: "source:one",
    selectorStateFingerprint: "selector:one",
    referenceOptionsFingerprint: "options:one",
    boardDataSourceVersion: "board-data:v1",
    ...overrides,
  };
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

test("records initial and hydration-ready state without emitting duplicate push intent", () => {
  const emitted = [];
  const tracker = createSelectorReadinessStateEntryPushTracker({ onIntent: (intent) => emitted.push(intent) });

  assert.equal(tracker.evaluate({ specReady: true, buildReady: true, context: context() }).emittedCount, 0);
  assert.equal(tracker.evaluate({ specReady: true, buildReady: true, context: context() }).emittedCount, 0);
  assert.equal(tracker.evaluate({ specReady: false, buildReady: false, context: context() }).emittedCount, 0);
  assert.equal(tracker.evaluate({ specReady: true, buildReady: true, baselineOnly: true, context: context() }).emittedCount, 0);
  assert.equal(tracker.evaluate({ specReady: true, buildReady: true, context: context() }).emittedCount, 0);
  assert.deepEqual(emitted, []);
});

test("emits immutable ordered Spec Ready and Build Ready state-entry intents once", () => {
  const emitted = [];
  const tracker = createSelectorReadinessStateEntryPushTracker({ onIntent: (intent) => emitted.push(intent) });
  tracker.evaluate({ specReady: false, buildReady: false, context: context() });

  const specEntry = tracker.evaluate({ specReady: true, buildReady: false, context: context() });
  assert.equal(specEntry.emittedCount, 1);
  assert.equal(specEntry.intents[0].state, "spec_ready");
  assert.equal(specEntry.intents[0].event, SELECTOR_READINESS_STATE_ENTRY_PUSH_EVENT);
  assert.equal(specEntry.intents[0].schemaId, SELECTOR_READINESS_STATE_ENTRY_PUSH_SCHEMA_ID);
  assert.equal(specEntry.intents[0].providerMutationRequested, false);
  assert.equal(specEntry.intents[0].writes, false);
  assertDeepFrozen(specEntry);

  assert.equal(tracker.evaluate({ specReady: true, buildReady: false, context: context() }).emittedCount, 0);
  const buildEntry = tracker.evaluate({ specReady: true, buildReady: true, context: context() });
  assert.equal(buildEntry.emittedCount, 1);
  assert.equal(buildEntry.intents[0].state, "build_ready");
  assert.equal(tracker.evaluate({ specReady: true, buildReady: true, context: context() }).emittedCount, 0);
  assert.deepEqual(emitted.map((intent) => intent.state), ["spec_ready", "build_ready"]);
});

test("Build Ready cannot emit before Spec Ready and genuine re-entry receives a new identity", () => {
  const tracker = createSelectorReadinessStateEntryPushTracker();
  tracker.evaluate({ specReady: false, buildReady: false, context: context() });
  assert.equal(tracker.evaluate({ specReady: false, buildReady: true, context: context() }).emittedCount, 0);

  const first = tracker.evaluate({ specReady: true, buildReady: true, context: context() });
  assert.deepEqual(first.intents.map((intent) => intent.state), ["spec_ready", "build_ready"]);
  tracker.evaluate({ specReady: false, buildReady: false, context: context() });
  const second = tracker.evaluate({ specReady: true, buildReady: true, context: context() });
  assert.notEqual(first.intents[0].transitionIdentity, second.intents[0].transitionIdentity);
  assert.notEqual(first.intents[1].transitionIdentity, second.intents[1].transitionIdentity);
  assert.equal(second.intents[0].transitionOrdinal, 2);
  assert.equal(second.intents[1].transitionOrdinal, 2);
});

test("traceability envelopes are ignored and cannot alter deterministic intent identity", () => {
  const firstTracker = createSelectorReadinessStateEntryPushTracker();
  const secondTracker = createSelectorReadinessStateEntryPushTracker();
  firstTracker.evaluate({ specReady: false, buildReady: false, context: context() });
  secondTracker.evaluate({ specReady: false, buildReady: false, context: context() });

  const first = firstTracker.evaluate({
    specReady: true,
    context: { ...context(), user: "one", owner: "one", crm: { company: "private" } },
  }).intents[0];
  const second = secondTracker.evaluate({
    specReady: true,
    context: { ...context(), user: "two", owner: "two", registration: { state: "different" } },
  }).intents[0];

  assert.deepEqual(first, second);
  assert.equal(JSON.stringify(first).includes("private"), false);
  assert.deepEqual(Object.keys(first.technicalContext), [
    "projectId",
    "sourceInputFingerprint",
    "selectorStateFingerprint",
    "referenceOptionsFingerprint",
    "boardDataSourceVersion",
  ]);
});

test("path-bearing and URL-bearing context is quarantined from the push intent", () => {
  const tracker = createSelectorReadinessStateEntryPushTracker();
  tracker.evaluate({ specReady: false, buildReady: false, context: context() });
  const intent = tracker.evaluate({
    specReady: true,
    context: context({
      projectId: "https://private.example/project",
      sourceInputFingerprint: "/private/source.json",
      selectorStateFingerprint: "file:private-state",
      referenceOptionsFingerprint: "blob:private-options",
      boardDataSourceVersion: "C:\\private\\board-data.json",
    }),
  }).intents[0];

  assert.deepEqual(intent.technicalContext, {
    projectId: "project-unbound",
    sourceInputFingerprint: "unbound",
    selectorStateFingerprint: "unbound",
    referenceOptionsFingerprint: "unbound",
    boardDataSourceVersion: "unbound",
  });
});

test("Selector integration emits intent only through the shell event bus and has no provider writer", async () => {
  const source = await readFile(new URL("../packages/modules/cs-selector/index.js", import.meta.url), "utf8");
  const helperSource = await readFile(new URL("../packages/workspace-kernel/selectorReadinessStateEntryPush.js", import.meta.url), "utf8");
  assert.match(source, /SELECTOR_READINESS_STATE_ENTRY_PUSH_EVENT/);
  assert.match(source, /eventBus\?\.emit/);
  assert.match(source, /baselineOnly:\s*selectorReadinessHydrationBaselineOnly/);
  assert.match(source, /selectorReadinessHydrationBaselineOnly\s*=\s*true/);
  assert.doesNotMatch(source, /hubspot|crm.*(?:write|push)|fetch\([^)]*(?:hubspot|crm)/i);
  assert.doesNotMatch(helperSource, /fetch\(|localStorage|sessionStorage|writeFile|hubspot|crm/i);
});

test("live readiness presentation uses state language rather than named readiness gates", async () => {
  const files = await Promise.all([
    readFile(new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8"),
  ]);
  const joined = files.join("\n");
  assert.doesNotMatch(joined, /Gate 1|Gate 2|spec gate|build gate|CRM gate|HubSpot gate|Gate S/i);
  assert.match(joined, /Spec Ready/);
  assert.match(joined, /Build Ready/);
});
