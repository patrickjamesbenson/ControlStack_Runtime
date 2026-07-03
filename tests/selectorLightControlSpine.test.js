import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { createSelectorState } from "../packages/modules/cs-selector/selectorState.js";
import { createSelectorViewModel } from "../packages/modules/cs-selector/selectorViewModel.js";
import { deriveSelectorReferenceOptionsFromSnapshot } from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

const testSourceUrl = new URL("./selectorLightControlSpine.test.js", import.meta.url);

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

function lightControlSnapshot({ includeLex = false } = {}) {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct", approved: "yes" },
      { system: "ALT", system_variant_1: "40", label: "ALT 40", emission: "Direct", approved: "yes" },
    ],
    BOARDS: [
      {
        system: "DNX",
        system_variant_1: "80",
        board_lm_per_m: "1200",
        c1_cct: "4000",
        c1_cri_min: "90",
        control_type_labels: "DALI-2",
        ...(includeLex ? { lex_weight: "LEX-30" } : {}),
        approved: "yes",
      },
      {
        system: "DNX",
        system_variant_1: "80",
        board_lm_per_m: "1800",
        c1_cct: "3000",
        c1_cri_min: "80",
        control_type_labels: "Non-dim",
        approved: "yes",
      },
      {
        system: "DNX",
        system_variant_1: "80",
        board_lm_per_m: "900",
        c1_cct: "3500",
        c1_cri_min: "90",
        control_type_labels: "PWM",
        approved: "yes",
      },
      {
        system: "ALT",
        system_variant_1: "40",
        board_lm_per_m: "900",
        c1_cct: "2700",
        c1_cri_min: "80",
        control_type_labels: "DALI-2",
        approved: "yes",
      },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", control_type: "DALI-2", approved: "yes" },
      { driver_id: "Standard Driver", control_type: "Non-dim", approved: "yes" },
      { driver_id: "PWM Driver", control_type: "PWM", approved: "yes" },
    ],
  };
}

function selectorReferenceStatus(snapshot = lightControlSnapshot()) {
  return {
    ok: true,
    status: "loaded",
    readOnly: true,
    diagnosticOnly: true,
    source: sourceReady(),
    selectorOptions: deriveSelectorReferenceOptionsFromSnapshot(snapshot, { source: sourceReady() }),
  };
}

function createModel({ selectorState = createSelectorState(), snapshot = lightControlSnapshot() } = {}) {
  return createSelectorViewModel({
    adapter: createAdapter(),
    selectorState,
    selectorReferenceStatus: selectorReferenceStatus(snapshot),
  });
}

function selectAndReload(selectorState, fieldKey, value, snapshot = lightControlSnapshot()) {
  let model = createModel({ selectorState, snapshot });
  model.selectorSurface.setFieldValue(fieldKey, value);
  return createModel({ selectorState, snapshot });
}

function lightSection(spine) {
  const section = spine.sections.find((item) => item.sectionKey === "lightControl");
  assert.ok(section, "expected Light & Control spine section");
  return section;
}

function lightRow(spine, rowKey) {
  const row = lightSection(spine).rows.find((item) => item.rowKey === rowKey);
  assert.ok(row, `expected Light & Control spine row ${rowKey}`);
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

test("empty Light & Control spine rows render as em dash", () => {
  const model = createModel();
  const spine = model.selectorSurface.productSpine;

  assert.equal(lightRow(spine, "targetLmPerM").displayValue, "—");
  assert.equal(lightRow(spine, "cctCri").displayValue, "—");
  assert.equal(lightRow(spine, "control").displayValue, "—");
  assert.equal(lightRow(spine, "driver").displayValue, "—");
  assert.equal(lightRow(spine, "lexWeight").displayValue, "—");
  assert.equal(model.selectorSurface.payloadPreview.lightControl.targetLmPerM, null);
  assert.equal(model.selectorSurface.payloadPreview.lightControl.cctCri, null);
  assert.equal(model.selectorSurface.payloadPreview.lightControl.controlType, null);
});

test("target lm/m and paired CCT/CRI fill from real reference options after manual selection", () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");

  assert.ok(optionValues(model, "targetLmPerM").includes("1200"));
  assert.ok(optionValues(model, "cctCri").includes("4000K / CRI90"));

  model = selectAndReload(selectorState, "targetLmPerM", "1200");
  model = selectAndReload(selectorState, "cctCri", "4000K / CRI90");
  model = selectAndReload(selectorState, "controlType", "DALI-2");

  assert.equal(lightRow(model.selectorSurface.productSpine, "targetLmPerM").displayValue, "1200 lm/m");
  assert.equal(lightRow(model.selectorSurface.productSpine, "cctCri").displayValue, "4000K / CRI90");
  assert.equal(lightRow(model.selectorSurface.productSpine, "control").displayValue, "DALI-2");
  assert.equal(model.selectorSurface.payloadPreview.lightControl.targetLmPerM, "1200 lm/m");
  assert.equal(model.selectorSurface.payloadPreview.lightControl.cctCri, "4000K / CRI90");
  assert.equal(model.selectorSurface.payloadPreview.lightControl.controlType, "DALI-2");
});

test("selecting control type changes the compatible driver consequence", () => {
  const daliState = createSelectorState();
  let model = selectAndReload(daliState, "system", "DNX|80");
  model = selectAndReload(daliState, "controlType", "DALI-2");

  assert.equal(lightRow(model.selectorSurface.productSpine, "driver").displayValue, "DALI Driver");
  assert.equal(lightRow(model.selectorSurface.productSpine, "driver").status, "auto-consequence");
  assert.equal(model.selectorSurface.payloadPreview.lightControl.driver, "DALI Driver");

  const nonDimState = createSelectorState();
  model = selectAndReload(nonDimState, "system", "DNX|80");
  model = selectAndReload(nonDimState, "controlType", "Non-dim");

  assert.equal(lightRow(model.selectorSurface.productSpine, "driver").displayValue, "Standard Driver");
  assert.equal(lightRow(model.selectorSurface.productSpine, "driver").status, "auto-consequence");
  assert.equal(model.selectorSurface.payloadPreview.lightControl.driver, "Standard Driver");

  const pwmState = createSelectorState();
  model = selectAndReload(pwmState, "system", "DNX|80");
  model = selectAndReload(pwmState, "controlType", "PWM");

  assert.equal(lightRow(model.selectorSurface.productSpine, "driver").displayValue, "PWM Driver");
  assert.equal(lightRow(model.selectorSurface.productSpine, "driver").status, "auto-consequence");
  assert.equal(model.selectorSurface.payloadPreview.lightControl.driver, "PWM Driver");
});

test("incompatible selected Light & Control options are preserved and blocked", () => {
  const selectorState = createSelectorState();
  selectAndReload(selectorState, "system", "DNX|80");
  const model = selectAndReload(selectorState, "cctCri", "2700K / CRI80");
  const row = lightRow(model.selectorSurface.productSpine, "cctCri");

  assert.equal(row.displayValue, "—");
  assert.equal(row.status, "blocked");
  assert.equal(row.blocked, true);
  assert.equal(selectorState.getSnapshot().dbBackedSelector.manualConstraints.cctCri.value, "2700K / CRI80");
  assert.ok(model.selectorSurface.selectionTruthSummary.blockers.some((item) => item.fieldKey === "cctCri"));
  assert.equal(model.selectorSurface.payloadPreview.lightControl.cctCri, null);
});

test("Lex weight appears only as a read-only source-backed consequence when reference data supports it", () => {
  const snapshot = lightControlSnapshot({ includeLex: true });
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80", snapshot);
  model = selectAndReload(selectorState, "targetLmPerM", "1200", snapshot);
  model = selectAndReload(selectorState, "cctCri", "4000K / CRI90", snapshot);
  model = selectAndReload(selectorState, "controlType", "DALI-2", snapshot);

  const row = lightRow(model.selectorSurface.productSpine, "lexWeight");
  const field = workflowField(model, "lexWeight");

  assert.equal(row.displayValue, "LEX-30");
  assert.equal(row.status, "metadata-only");
  assert.equal(row.manualConstraint, false);
  assert.equal(row.rawRowsExposed, false);
  assert.equal(field.displayMode, "metadata-chip");
  assert.equal(field.primaryControl, false);
  assert.equal(field.overrideAvailable, false);
  assert.equal(model.selectorSurface.payloadPreview.lightControl.lexWeight, "LEX-30");
});

test("Light & Control payload preview keeps safety flags disabled and exposes no raw source data", async () => {
  const selectorState = createSelectorState();
  let model = selectAndReload(selectorState, "system", "DNX|80");
  model = selectAndReload(selectorState, "targetLmPerM", "1200");
  model = selectAndReload(selectorState, "cctCri", "4000K / CRI90");
  model = selectAndReload(selectorState, "controlType", "DALI-2");

  const payload = model.selectorSurface.payloadPreview;
  assert.equal(payload.previewOnly, true);
  assert.equal(payload.productionPayload, false);
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
  assert.equal(serialisedSurface.includes("raw_secret"), false);
  assert.equal(serialisedSurface.includes("sourcePath"), false);
  assert.equal(serialisedSurface.includes("Lab evidence"), false);

  const source = await readFile(testSourceUrl, "utf-8");
  const atSignLiteral = String.fromCharCode(64);
  const usersTableLiteral = ["US", "ERS:"].join("");
  assert.equal(source.includes(atSignLiteral), false);
  assert.equal(source.includes(usersTableLiteral), false);
});
