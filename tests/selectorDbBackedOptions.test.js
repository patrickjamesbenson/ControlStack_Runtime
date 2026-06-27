import test from "node:test";
import assert from "node:assert/strict";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

function createAdapter() {
  return {
    moduleId: "cs_selector",
    services: {},
    readSnapshots() {
      return {
        route: { moduleId: "cs_selector" },
        flags: { owner: "shell", values: {} },
        project: {
          owner: "shell",
          status: "loaded",
          metadata: { title: "DB-backed Selector Project", projectId: "SEL-DB-BACKED" },
          currentProject: { title: "DB-backed Selector Project", projectId: "SEL-DB-BACKED" },
        },
        handoff: { owner: "shell", status: "deferred", available: false },
        identity: {
          owner: "shell",
          status: "resolved",
          currentUser: { name: "Diagnostic User", email: "diagnostic@example.com" },
        },
        authority: { owner: "shell", status: "safe-fallback" },
        company: { owner: "shell", status: "placeholder", companyName: "Diagnostic Company" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: true },
          rule: "test",
        },
        timelinePolicy: {},
      };
    },
    isFlagEnabled() {
      return false;
    },
  };
}

function sourceReady() {
  return { present: true, readable: true, parseable: true };
}

function sampleSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", approved: "yes" },
      { system: "LNX", system_variant_1: "80", label: "LNX 80", approved: "yes" },
    ],
    OPTICS: [
      { system: "DNX", optic_var_1: "Opal", ip_option_1: "IP20;IP65", ik_option_2: "IK07;IK10", cct: "3000K;4000K", approved: "yes" },
      { system: "LNX", optic_var_1: "Microprism", ip_option_1: "IP20", ik_option_2: "IK07", cct: "4000K", approved: "yes" },
    ],
    BOARDS: [{ board: "B1", cct: "3000K;4000K", approved: "yes" }],
    DRIVERS: [
      { driver_id: "DALI Driver", control_type: "DALI-2", approved: "yes" },
      { driver_id: "Standard Driver", control_type: "Non-dim", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mounting", display_choice: "Suspension kit", approved: "yes" },
      { accessory_type: "accessory", display_choice: "IP65 end kit", approved: "yes" },
      { accessory_type: "sensor", display_choice: "PIR sensor", approved: "yes" },
    ],
    SYSTEM_POLICY: [
      { category: "application environment", item: "Office;Education", approved: "yes" },
      { category: "interior exterior", item: "Interior;Exterior", approved: "yes" },
      { category: "finish colour", item: "White;Black", approved: "yes" },
    ],
  };
}

function selectorReferenceStatus(snapshot = sampleSnapshot()) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady() }),
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = sampleSnapshot() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot),
  });
}

function surfaceField(surface, fieldKey) {
  const field = surface.fields.find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected ${fieldKey} field`);
  return field;
}

function surfaceOption(surface, fieldKey, value) {
  const option = surfaceField(surface, fieldKey).options.find((item) => item.value === value);
  assert.ok(option, `expected ${fieldKey} option ${value}`);
  return option;
}

test("Selector view model exposes a product-facing DB-backed surface before diagnostics data", () => {
  const model = createModel();
  const surface = model.selectorSurface;

  assert.equal(surface.title, "CS Selector Preview");
  assert.match(surface.subtitle, /DB-backed candidate preview/);
  assert.ok(surface.badges.includes("spec gate incomplete"));
  assert.ok(surface.badges.includes("not Lab Proof"));
  assert.ok(surface.badges.includes("writes disabled"));
  assert.match(surface.requiredSafetyCopy, /No spec, slug, IES, payload, RunTable, Lab Proof/);
  assert.equal(surface.proofCopy, "Selector previews selection readiness. Lab Proof proves later.");
  assert.ok(surfaceField(surface, "system").options.some((item) => item.label === "DNX 60"));
  assert.ok(surfaceField(surface, "optic").options.some((item) => item.value === "DNX|Opal"));
});

test("DB-backed manual selections become durable constraints and change downstream option state", () => {
  const selectorState = createSelectorState();
  let model = createModel({ selectorState });

  model.selectorSurface.setFieldValue("system", "DNX|60");
  model = createModel({ selectorState });

  const snapshot = selectorState.getSnapshot();
  assert.equal(snapshot.dbBackedSelector.manualConstraints.system.value, "DNX|60");
  assert.equal(snapshot.dbBackedSelector.manualConstraints.system.kind, "manual-constraint");
  assert.equal(surfaceOption(model.selectorSurface, "optic", "DNX|Opal").status, "available");
  assert.equal(surfaceOption(model.selectorSurface, "optic", "LNX|Microprism").status, "blocked");
  assert.match(surfaceOption(model.selectorSurface, "optic", "LNX|Microprism").blockedReason, /manual constraints/i);
});

test("compatible DB-backed manual constraints are not silently cleared", () => {
  const selectorState = createSelectorState();
  let model = createModel({ selectorState });

  model.selectorSurface.setFieldValue("system", "DNX|60");
  model = createModel({ selectorState });
  model.selectorSurface.setFieldValue("cct", "3000K");
  model = createModel({ selectorState });

  const constraints = selectorState.getSnapshot().dbBackedSelector.manualConstraints;
  assert.equal(constraints.system.value, "DNX|60");
  assert.equal(constraints.cct.value, "3000K");
  assert.equal(surfaceOption(model.selectorSurface, "optic", "DNX|Opal").status, "available");
  assert.match(model.selectorSurface.manualConstraintRows.flat().join(" "), /DNX 60/);
  assert.match(model.selectorSurface.manualConstraintRows.flat().join(" "), /3000K/);
});

test("auto consequences are visible as consequences and remain changeable", () => {
  const model = createModel();
  const driver = model.selectorSurface.autoConsequences.find((item) => item.fieldKey === "driver");

  assert.ok(driver);
  assert.equal(driver.kind, "auto-consequence");
  assert.equal(driver.mutable, true);
  assert.equal(driver.writes, false);
  assert.match(driver.reason, /consequence/i);
});

test("unmapped DB-backed fields are future mapped rather than faked", () => {
  const model = createModel({ snapshot: { SYSTEM: sampleSnapshot().SYSTEM } });
  const application = surfaceField(model.selectorSurface, "application");
  const finish = surfaceField(model.selectorSurface, "bodyFinish");

  assert.equal(application.futureMapped, true);
  assert.equal(application.sourceStatus, "unavailable from current source");
  assert.match(application.unavailableReason, /no fake values/i);
  assert.equal(finish.futureMapped, true);
});
