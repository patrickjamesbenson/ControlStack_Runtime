import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const testSourceUrl = new URL("./selectorEnvironmentSpine.test.js", import.meta.url);

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
          metadata: { title: "", projectId: "" },
          currentProject: {},
        },
        handoff: { owner: "shell", status: "deferred", available: false },
        identity: {
          owner: "shell",
          status: "anonymous-fallback",
          currentUser: {},
          classification: "anonymous",
          identityState: "external_anonymous",
        },
        company: { owner: "shell", status: "placeholder", companyName: "" },
        crm: { status: "placeholder", writePolicy: { enabled: false } },
        visibility: {
          owner: "shell",
          status: "resolved",
          testMode: false,
          moduleReasons: { cs_selector: { visible: true, reason: "test" } },
          visibleModules: ["cs_selector"],
          hiddenModules: [],
          inputs: { projectMode: "auto", projectPresent: false },
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

function environmentSnapshot({ includeAmbient = true, includeApplication = true } = {}) {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct", approved: "yes" },
      { system: "ALT", system_variant_1: "40", label: "ALT 40", emission: "Direct", approved: "yes" },
    ],
    OPTICS: [
      {
        system: "DNX",
        optic_var_1: "Opal",
        ip_option_1: "IP20;IP65",
        ik_option_2: "IK07;IK10",
        ...(includeApplication ? { application_environment: "Education", interior_exterior: "Interior" } : {}),
        emission_permission: "Direct",
        approved: "yes",
      },
      {
        system: "ALT",
        optic_var_1: "Microprism",
        ip_option_1: "IP44",
        ik_option_2: "IK08",
        ...(includeApplication ? { application_environment: "Exterior amenity", interior_exterior: "Exterior" } : {}),
        emission_permission: "Direct",
        approved: "yes",
      },
    ],
    TIERS: [
      { tier: "Economy", electrical: "Class I;SELV", approved: "yes" },
      { tier: "Business", electrical: "Class II", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "elect_class", accessory_id: "Remote SELV", display_choice: "Display text not used", approved: "yes" },
    ],
    SYSTEM_POLICY: includeAmbient
      ? [{ item: "ambient_temp", economy: "25;35", business: "40", first: "ENG", charter: "", approved: "yes" }]
      : [],
  };
}

function selectorReferenceStatus(snapshot = environmentSnapshot(), constraints = {}) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady(), constraints }),
  };
}

function dbConstraintValues(selectorState = createSelectorState()) {
  const manualConstraints = selectorState.getSnapshot().dbBackedSelector.manualConstraints || {};
  return Object.fromEntries(Object.entries(manualConstraints)
    .map(([fieldKey, record]) => [fieldKey, record?.value || ""])
    .filter(([, value]) => value));
}

function createModel({ selectorState = createSelectorState(), snapshot = environmentSnapshot() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot, dbConstraintValues(selectorState)),
  });
}

function selectAndReload(selectorState, fieldKey, value, snapshot = environmentSnapshot()) {
  let model = createModel({ selectorState, snapshot });
  model.selectorSurface.setFieldValue(fieldKey, value);
  return createModel({ selectorState, snapshot });
}

function environmentSection(spine) {
  const section = spine.sections.find((item) => item.sectionKey === "environment");
  assert.ok(section, "expected Environment spine section");
  return section;
}

function environmentRow(spine, rowKey) {
  const row = environmentSection(spine).rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected Environment spine row ${rowKey}`);
  return row;
}

function workflowField(model, fieldKey) {
  const field = model.selectorSurface.workflowSections
    .flatMap((section) => section.fields || [])
    .find((item) => item.fieldKey === fieldKey);
  assert.ok(field, `expected workflow field ${fieldKey}`);
  return field;
}

function optionValues(model, fieldKey) {
  return (workflowField(model, fieldKey).options || []).map((item) => item.value);
}

test("empty Environment spine rows render as em dash", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.equal(environmentRow(spine, "application").displayValue, "—");
  assert.equal(environmentRow(spine, "interiorExterior").displayValue, "—");
  assert.equal(environmentRow(spine, "ipIk").displayValue, "—");
  assert.equal(environmentRow(spine, "ambient").displayValue, "—");
  assert.equal(environmentRow(spine, "electricalClass").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.environment.application, null);
  assert.equal(model.selectorSurface.payloadPreview.environment.ip, null);
  assert.equal(model.selectorSurface.payloadPreview.environment.ik, null);
  assert.equal(model.selectorSurface.payloadPreview.environment.ambient, null);
  assert.equal(model.selectorSurface.payloadPreview.environment.electricalClass, null);
});

test("IP and IK fill from real reference options after manual selection", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");

  assert.ok(optionValues(model, "ipRating").includes("IP65"));
  assert.ok(optionValues(model, "ikRating").includes("IK10"));

  model = selectAndReload(selectorState, "ipRating", "IP65");
  model = selectAndReload(selectorState, "ikRating", "IK10");

  assert.equal(environmentRow(model.selectorSurface.productSpine, "ipIk").displayValue, "IP65 / IK10");
  assert.equal(environmentRow(model.selectorSurface.productSpine, "ipIk").status, "manual-constraint");
  assert.equal(model.selectorSurface.payloadPreview.environment.ip, "IP65");
  assert.equal(model.selectorSurface.payloadPreview.environment.ik, "IK10");
});

test("electrical class fills from donor tier first and ACCESSORIES fallback only when no tier is selected", () => {
  const fallbackModel = createModel();
  assert.ok(optionValues(fallbackModel, "electricalClass").includes("Remote SELV"));

  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "tier", "Economy");

  assert.ok(optionValues(model, "electricalClass").includes("Class I"));
  assert.ok(optionValues(model, "electricalClass").includes("SELV"));
  assert.equal(optionValues(model, "electricalClass").includes("Remote SELV"), false);

  model = selectAndReload(selectorState, "electricalClass", "Class I");

  assert.equal(environmentRow(model.selectorSurface.productSpine, "electricalClass").displayValue, "Class I");
  assert.equal(environmentRow(model.selectorSurface.productSpine, "electricalClass").status, "manual-constraint");
  assert.equal(model.selectorSurface.payloadPreview.environment.electricalClass, "Class I");
});

test("ambient and application fields fill only where source data supports them", () => {
  const selectorState = createSelectorState();
  let model = createModel({ selectorState });

  assert.ok(optionValues(model, "ambient").includes("35°C"));
  assert.ok(optionValues(model, "application").includes("Education"));
  assert.ok(optionValues(model, "interiorExterior").includes("Interior"));

  model = selectAndReload(selectorState, "ambient", "35°C");
  model = selectAndReload(selectorState, "application", "Education");
  model = selectAndReload(selectorState, "interiorExterior", "Interior");

  assert.equal(environmentRow(model.selectorSurface.productSpine, "ambient").displayValue, "35°C");
  assert.equal(environmentRow(model.selectorSurface.productSpine, "application").displayValue, "Education");
  assert.equal(environmentRow(model.selectorSurface.productSpine, "interiorExterior").displayValue, "Interior");
  assert.equal(model.selectorSurface.payloadPreview.environment.ambient, "35°C");
  assert.equal(model.selectorSurface.payloadPreview.environment.application, "Education");
  assert.equal(model.selectorSurface.payloadPreview.environment.interiorExterior, "Interior");

  const missingSnapshot = environmentSnapshot({ includeAmbient: false, includeApplication: false });
  const missingModel = createModel({ snapshot: missingSnapshot });
  assert.equal(environmentRow(missingModel.selectorSurface.productSpine, "ambient").displayValue, "—");
  assert.equal(environmentRow(missingModel.selectorSurface.productSpine, "application").displayValue, "—");
  assert.equal(missingModel.selectorSurface.payloadPreview.environment.ambient, null);
  assert.equal(missingModel.selectorSurface.payloadPreview.environment.application, null);
});

test("incompatible Environment selections are preserved and blocked", () => {
  const selectorState = createSelectorState();
  selectAndReload(selectorState, "system", "DNX|80");
  const model = selectAndReload(selectorState, "ipRating", "IP44");
  const row = environmentRow(model.selectorSurface.productSpine, "ipIk");

  assert.equal(row.displayValue, "—");
  assert.equal(row.status, "blocked");
  assert.equal(row.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.ipRating.value, "IP44");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "ipRating"));
  assert.equal(model.selectorSurface.payloadPreview.environment.ip, null);
});

test("payload preview mirrors Environment safely and keeps write/proof flags disabled", async () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "application", "Education");
  model = selectAndReload(selectorState, "interiorExterior", "Interior");
  model = selectAndReload(selectorState, "ipRating", "IP65");
  model = selectAndReload(selectorState, "ikRating", "IK10");
  model = selectAndReload(selectorState, "ambient", "35°C");
  model = selectAndReload(selectorState, "tier", "Economy");
  model = selectAndReload(selectorState, "electricalClass", "Class I");

  const payload = model.selectorSurface.payloadPreview;
  assert.equal(payload.previewOnly, true);
  assert.equal(payload.productionPayload, false);
  assert.equal(payload.environment.application, "Education");
  assert.equal(payload.environment.interiorExterior, "Interior");
  assert.equal(payload.environment.ip, "IP65");
  assert.equal(payload.environment.ik, "IK10");
  assert.equal(payload.environment.ambient, "35°C");
  assert.equal(payload.environment.electricalClass, "Class I");
  assert.equal(payload.safetyFlags.readOnly, true);
  assert.equal(payload.safetyFlags.writes, false);
  assert.equal(payload.safetyFlags.generation, false);
  assert.equal(payload.safetyFlags.labProofAuthority, false);
  assert.equal(payload.safetyFlags.rawRowsExposed, false);
  assert.equal(payload.safetyFlags.rawHeadersExposed, false);
  assert.equal(payload.safetyFlags.rawUsersExposed, false);
  assert.equal(payload.safetyFlags.credentialsExposed, false);
  assert.equal(payload.safetyFlags.privatePathsExposed, false);

  const serialisedSurface = JSON.stringify(model.selectorSurface);
  assert.equal(serialisedSurface.includes("sourcePath"), false);
  assert.equal(serialisedSurface.includes("Lab evidence"), false);

  const source = await readFile(testSourceUrl, "utf-8");
  const atSignLiteral = String.fromCharCode(64);
  const usersTableLiteral = ["US", "ERS:"].join("");
  assert.equal(source.includes(atSignLiteral), false);
  assert.equal(source.includes(usersTableLiteral), false);
});
