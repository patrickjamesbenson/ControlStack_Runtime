import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { deriveSelectorFactoryReadyState } from "../packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js";

function committedConstraint(overrides = {}) {
  return {
    fieldKey: "system",
    value: "DNX|80",
    valueLabel: "DNX 80",
    committedSelectorState: true,
    blocked: false,
    manualConstraint: true,
    acceptedDefault: false,
    authoritySource: "manualConstraints",
    ...overrides,
  };
}

function readySummary(overrides = {}) {
  return {
    factoryApprovedInputsReady: true,
    ready: true,
    stage2Ready: true,
    blocker: null,
    checks: [
      { key: "stage2Ready", ready: true },
      { key: "committedSelectorConstraints", ready: true },
      { key: "committedRunIntake", ready: true },
      { key: "committedAccessoryPlacementIntent", ready: true },
      { key: "safeAccessoryReservation", ready: true },
    ],
    failClosedDiagnostics: [],
    ...overrides,
  };
}

function readyInput(overrides = {}) {
  return {
    specReady: true,
    buildReady: true,
    factoryApprovedInputsSummary: readySummary(),
    committedSelectorConstraints: [
      committedConstraint(),
      committedConstraint({
        fieldKey: "runLength",
        value: "3500",
        valueLabel: "3500 mm",
        manualConstraint: false,
        acceptedDefault: true,
        authoritySource: "acceptedDefaults",
      }),
    ],
    missingSpecRequirements: [],
    missingBuildRequirements: [],
    blockedIncompatibleSelections: [],
    ...overrides,
  };
}

test("Factory Ready is false by default and cannot be created by display fallback", () => {
  const state = deriveSelectorFactoryReadyState({
    displayLabel: "Factory Ready",
    diagnosticLabel: "ready",
  });

  assert.equal(state.factoryReady, false);
  assert.equal(state.ready, false);
  assert.equal(state.state, "factory-ready-fail-closed");
  assert.equal(state.diagnosticFallbackAccepted, false);
  assert.equal(state.providerPushEnabled, false);
  assert.equal(state.writes, false);
  assert.equal(state.generation, false);
});

test("Factory Ready is immutable and true only over the complete existing evidence chain", () => {
  const state = deriveSelectorFactoryReadyState(readyInput());

  assert.equal(state.factoryReady, true);
  assert.equal(state.ready, true);
  assert.equal(state.blocker, null);
  assert.deepEqual(state.blockers, []);
  assert.equal(state.specReady, true);
  assert.equal(state.buildReady, true);
  assert.equal(state.factoryApprovedInputsReady, true);
  assert.equal(Object.isFrozen(state), true);
  assert.equal(Object.isFrozen(state.blockers), true);
  assert.throws(() => {
    state.factoryReady = false;
  }, TypeError);
});

test("Factory Ready fails closed for incomplete readiness and Factory Approved Inputs evidence", async (t) => {
  const cases = [
    ["Spec Ready missing", { specReady: false }, "factory-ready-spec-ready-required"],
    ["Build Ready missing", { buildReady: false }, "factory-ready-build-ready-required"],
    ["spec requirement missing", { missingSpecRequirements: ["Ambient"] }, "factory-ready-spec-requirements-incomplete"],
    ["build requirement missing", { missingBuildRequirements: ["Runs"] }, "factory-ready-build-requirements-incomplete"],
    ["incompatible selection", { blockedIncompatibleSelections: [{ fieldKey: "optic" }] }, "factory-ready-incompatible-selection-present"],
    ["summary not ready", { factoryApprovedInputsSummary: readySummary({ factoryApprovedInputsReady: false, ready: false }) }, "factory-ready-approved-inputs-not-ready"],
    ["summary blocker", { factoryApprovedInputsSummary: readySummary({ blocker: "unsafe-reservation" }) }, "factory-ready-approved-inputs-blocker-present"],
    ["summary check incomplete", { factoryApprovedInputsSummary: readySummary({ checks: [{ key: "stage2Ready", ready: false }] }) }, "factory-ready-approved-input-check-incomplete"],
    ["summary diagnostics present", { factoryApprovedInputsSummary: readySummary({ failClosedDiagnostics: ["unsafe-reservation"] }) }, "factory-ready-fail-closed-diagnostic-present"],
  ];

  for (const [name, overrides, blocker] of cases) {
    await t.test(name, () => {
      const state = deriveSelectorFactoryReadyState(readyInput(overrides));
      assert.equal(state.factoryReady, false);
      assert.ok(state.blockers.includes(blocker));
    });
  }
});

test("Factory Ready rejects malformed, duplicate, uncommitted, blocked and non-source-backed constraints", async (t) => {
  const valid = committedConstraint();
  const cases = [
    ["malformed", [null], "factory-ready-constraint-1-malformed"],
    ["duplicate", [valid, committedConstraint()], "factory-ready-constraint-2-duplicate-field"],
    ["uncommitted", [committedConstraint({ committedSelectorState: false })], "factory-ready-constraint-1-uncommitted"],
    ["blocked", [committedConstraint({ blocked: true })], "factory-ready-constraint-1-blocked"],
    ["non-source-backed", [committedConstraint({ authoritySource: "displayRows" })], "factory-ready-constraint-1-non-source-backed"],
    ["contradictory", [committedConstraint({ acceptedDefault: true })], "factory-ready-constraint-1-authority-contradictory"],
    ["missing value", [committedConstraint({ value: "" })], "factory-ready-constraint-1-value-missing"],
  ];

  for (const [name, committedSelectorConstraints, blocker] of cases) {
    await t.test(name, () => {
      const state = deriveSelectorFactoryReadyState(readyInput({ committedSelectorConstraints }));
      assert.equal(state.factoryReady, false);
      assert.ok(state.blockers.includes(blocker));
    });
  }
});

test("Factory Ready is carried through state, view-model, stage indicators, diagnostics and view without provider work", async () => {
  const [stateSource, viewModelSource, viewSource, summarySource] = await Promise.all([
    readFile(new URL("../packages/modules/cs-selector/selectorState.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorViewModel.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorView.js", import.meta.url), "utf8"),
    readFile(new URL("../packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js", import.meta.url), "utf8"),
  ]);

  assert.match(stateSource, /factoryReady:\s*false/);
  assert.match(viewModelSource, /const factoryReadyState = deriveSelectorFactoryReadyState/);
  assert.match(viewModelSource, /key:\s*"factoryReady"/);
  assert.match(viewModelSource, /factoryReadyRows/);
  assert.match(viewSource, /dataset\.factoryReady/);
  assert.match(viewSource, /Factory Ready derivation/);
  assert.doesNotMatch(summarySource, /hubspot|crm|fetch\(|localStorage|sessionStorage|writeFile|appendFile/i);
});
