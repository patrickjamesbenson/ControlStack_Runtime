import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import {
  DEFERRED_DECISION_REGISTRY_CONTRACT,
  DEFERRED_DECISION_STATUS_DEFINITIONS,
  DEFERRED_DECISIONS,
  deferredDecisionRegistrySnapshot,
} from "../apps/workspace-shell/src/deferredDecisionRegistry.js";

const REQUIRED_DECISIONS = Object.freeze([
  ["hubspot-two-connector-deferral", "RULED", "Program & Integrate"],
  ["hubspot-private-app-scope-precheck", "PARKED", "Patrick"],
  ["two-factor-authentication", "PARKED", "Governance & Shell"],
  ["identity-first-question", "OPEN", "Program & Integrate"],
  ["state-to-deal-floor-mapping", "OPEN", "Program & Integrate"],
  ["finishes-default-acceptance", "OPEN", "Patrick"],
]);

async function readSurfaceSources() {
  return Promise.all([
    readFile(new URL("../apps/workspace-shell/src/shell.js", import.meta.url), "utf8"),
    readFile(new URL("../apps/workspace-shell/src/styles.css", import.meta.url), "utf8"),
  ]);
}

function sourceSlice(source, startToken, endToken) {
  const start = source.indexOf(startToken);
  const end = source.indexOf(endToken, start);
  assert.ok(start >= 0, `missing start token: ${startToken}`);
  assert.ok(end > start, `missing end token: ${endToken}`);
  return source.slice(start, end);
}

test("versioned Governance registry carries the canonical decisions with separate owner, kind, status, reason, and citation", () => {
  assert.equal(DEFERRED_DECISION_REGISTRY_CONTRACT.version, "1.1.0");
  assert.equal(DEFERRED_DECISION_REGISTRY_CONTRACT.owner, "Governance & Shell");
  assert.equal(DEFERRED_DECISION_REGISTRY_CONTRACT.behavior, "read-only-static-registry");
  assert.deepEqual(
    DEFERRED_DECISIONS.map(({ id, status, owner }) => [id, status, owner]),
    REQUIRED_DECISIONS,
  );
  for (const decision of DEFERRED_DECISIONS) {
    assert.equal(decision.kind, "governance-decision");
    assert.ok(decision.reason.length > 0, decision.id);
    assert.ok(decision.citation.length > 0, decision.id);
    assert.ok(decision.disposition.length > 0, decision.id);
    assert.equal(Object.isFrozen(decision), true, decision.id);
  }
});

test("registry preserves the mockup status vocabulary and leaves OPEN rows unresolved", () => {
  assert.deepEqual(
    DEFERRED_DECISION_STATUS_DEFINITIONS.map(({ status }) => status),
    ["DONOR-VERIFIED", "RULED", "PLANNED", "PARKED", "OPEN"],
  );
  const openRows = DEFERRED_DECISIONS.filter(({ status }) => status === "OPEN");
  assert.deepEqual(
    openRows.map(({ id }) => id),
    ["identity-first-question", "state-to-deal-floor-mapping", "finishes-default-acceptance"],
  );
  for (const row of openRows) {
    assert.match(row.disposition, /No implementation choice is authorised|Do not infer|Do not change Build Ready/);
  }
  const snapshot = deferredDecisionRegistrySnapshot();
  assert.equal(Object.isFrozen(snapshot), true);
  assert.strictEqual(snapshot.decisions, DEFERRED_DECISIONS);
});

test("developer context inspector renders the read-only registry with visible reasons, owners, kinds, and citations", async () => {
  const [shellSource, styleSource] = await readSurfaceSources();
  const renderer = sourceSlice(
    shellSource,
    "function createDeferredDecisionRegistrySection()",
    "function renderShellContextInspector(context)",
  );
  for (const token of [
    "Deferred decisions",
    "decision.disposition",
    "decision.reason",
    "decision.owner",
    "decision.kind",
    "decision.citation",
    "DEFERRED_DECISION_STATUS_DEFINITIONS",
    "DEFERRED_DECISIONS",
  ]) {
    assert.equal(renderer.includes(token), true, token);
  }
  assert.match(shellSource, /contextInspectorContent\.append\(\s*createDeferredDecisionRegistrySection\(\)/);
  assert.equal(styleSource.includes(".cs-shell__deferred-decision-list"), true);
  assert.equal(styleSource.includes(".cs-shell__decision-status"), true);
});

test("deferred-decisions panel is inert and introduces no action, persistence, provider, CRM, retrieval, or Engine path", async () => {
  const [shellSource] = await readSurfaceSources();
  const renderer = sourceSlice(
    shellSource,
    "function createDeferredDecisionRegistrySection()",
    "function renderShellContextInspector(context)",
  );
  assert.doesNotMatch(
    renderer,
    /addEventListener|createElement\(["'](?:button|a|input|select|form)["']\)|fetch\s*\(|XMLHttpRequest|WebSocket|localStorage|sessionStorage|writeFile|appendFile|mkdir|unlink|HubSpot|invoke|download|export|retrieve|engine/i,
  );
});
