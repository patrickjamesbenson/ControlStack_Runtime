import test from "node:test";
import assert from "node:assert/strict";

import {
  buildSelectorReferenceOptions,
  deriveSelectorReferenceOptionsFromSnapshot,
  SELECTOR_REFERENCE_OPTIONS_PATH,
} from "../packages/workspace-kernel/selectorReferenceOptionsService.js";

function sourceReady() {
  return {
    label: "runtime-authority-reference-active-snapshot",
    present: true,
    readable: true,
    parseable: true,
    modifiedTime: "2026-01-01T00:00:00.000Z",
    fileSize: 1234,
  };
}

function sampleSnapshot() {
  return {
    SYSTEM: [
      { system: "DNX", system_variant_1: "60", label: "DNX 60", approved: "yes", status: "available", raw_secret: "must not leak" },
      { system: "LNX", system_variant_1: "80", label: "LNX 80", approved: "yes", status: "available" },
    ],
    OPTICS: [
      { system: "DNX", optic_var_1: "Opal", emission_permission: "Direct", ip_option_1: "IP20;IP65", ik_option_2: "IK07;IK10", cct: "3000K;4000K", approved: "yes" },
      { system: "LNX", optic_var_1: "Microprism", emission_permission: "Direct", ip_option_1: "IP20", ik_option_2: "IK07", cct: "4000K", approved: "yes" },
    ],
    BOARDS: [
      { board: "B1", cct_cri: "3000K / CRI80;4000K / CRI90", approved: "yes" },
    ],
    DRIVERS: [
      { driver_id: "DALI Driver", control_type: "DALI-2", approved: "yes" },
      { driver_id: "Standard Driver", control_type: "Non-dim", approved: "yes" },
    ],
    ACCESSORIES: [
      { accessory_type: "mounting", display_choice: "Surface mount", approved: "yes" },
      { accessory_type: "emergency", display_choice: "Emergency pack", approved: "yes" },
      { accessory_type: "egress_light", accessory_id: "Maintained", display_choice: "Do not use display choice for egress light", approved: "yes" },
      { accessory_type: "egress_sound", accessory_id: "EWIS", approved: "yes" },
      { accessory_type: "pir", accessory_id: "Ceiling PIR (Daylight Sensing)", approved: "yes" },
      { accessory_type: "sensor", display_choice: "PIR sensor", approved: "yes" },
      { accessory_type: "special_parts", display_choice: "Entitled bracket", approved: "yes" },
      { accessory_type: "accessory", display_choice: "IP65 end kit", approved: "yes" },
    ],
    SYSTEM_POLICY: [
      { category: "application environment", item: "Office;Education", approved: "yes" },
      { category: "interior exterior", item: "Interior;Exterior", approved: "yes" },
      { category: "finish colour", item: "White;Black", approved: "yes" },
    ],
    SYSTEM_COMPONENTS: [],
    USERS: [
      { email: "private@example.com", token: "must not leak" },
    ],
    PURE_REF_STATE: [
      { raw_lab_evidence: "must not leak" },
    ],
  };
}

function field(result, fieldKey) {
  const found = result.fields.find((item) => item.fieldKey === fieldKey);
  assert.ok(found, `expected ${fieldKey} field`);
  return found;
}

function option(result, fieldKey, value) {
  const found = field(result, fieldKey).options.find((item) => item.value === value);
  assert.ok(found, `expected ${fieldKey} option ${value}`);
  return found;
}

test("selector reference option adapter emits only safe read-only option metadata", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(sampleSnapshot(), { source: sourceReady() });
  const serialised = JSON.stringify(result);

  assert.equal(result.ok, true);
  assert.equal(result.endpoint, SELECTOR_REFERENCE_OPTIONS_PATH);
  assert.equal(result.readOnly, true);
  assert.equal(result.optionFilteringReadOnly, true);
  assert.equal(result.rawRowsExposed, false);
  assert.equal(result.rawHeadersExposed, false);
  assert.equal(result.rawUsersExposed, false);
  assert.equal(result.rawLabEvidenceExposed, false);
  assert.equal(result.credentialsExposed, false);
  assert.equal(result.privatePathsExposed, false);
  assert.equal(result.boardDataWriteEnabled, false);
  assert.equal(result.specGenerationEnabled, false);
  assert.equal(result.slugGenerationEnabled, false);
  assert.equal(result.iesGenerationEnabled, false);
  assert.equal(result.payloadGenerationEnabled, false);
  assert.equal(result.runTableGenerationEnabled, false);
  assert.equal(result.labProofAuthority, false);
  assert.equal(serialised.includes("must not leak"), false);
  assert.equal(serialised.includes("private@example.com"), false);

  assert.ok(field(result, "system").options.some((item) => item.label === "DNX 60"));
  assert.ok(field(result, "optic").options.some((item) => item.value === "DNX|Opal"));
  assert.ok(field(result, "cctCri").options.some((item) => item.value === "cct_cri:3000K|CRI80"));
  assert.equal(result.fields.some((item) => item.fieldKey === "cct"), false);
  assert.ok(field(result, "egressLight").options.some((item) => item.value === "Maintained" && item.label === "EM — Maintained"));
  assert.ok(field(result, "egressSound").options.some((item) => item.value === "EWIS" && item.label === "EWIS"));
  assert.ok(field(result, "sensor").options.some((item) => item.value === "Ceiling PIR (Daylight Sensing)" && item.label === "Ceiling PIR"));
  assert.ok(field(result, "sensor").options.some((item) => item.value === "PIR sensor" && item.label === "PIR sensor"));
  assert.ok(field(result, "accessories").options.some((item) => item.value === "IP65 end kit"));
  assert.equal(field(result, "accessories").options.some((item) => item.value === "Emergency pack"), false);
  assert.equal(field(result, "accessories").options.some((item) => item.value === "Maintained"), false);
  assert.equal(field(result, "accessories").options.some((item) => item.value === "EWIS"), false);
  assert.equal(field(result, "accessories").options.some((item) => item.value === "Ceiling PIR (Daylight Sensing)"), false);
  assert.equal(field(result, "accessories").options.some((item) => item.value === "PIR sensor"), false);
  assert.equal(field(result, "accessories").options.some((item) => item.value === "Entitled bracket"), false);
  for (const item of result.fields) {
    assert.equal(typeof item.fieldKey, "string");
    assert.equal(typeof item.label, "string");
    assert.equal(typeof item.role, "string");
    assert.equal(typeof item.status, "string");
    assert.equal(typeof item.sourceStatus, "string");
    assert.equal(Array.isArray(item.options), true);
    assert.equal(typeof item.selectedValue, "string");
    assert.equal(typeof item.futureMapped, "boolean");
    assert.equal(item.rawRowsExposed, false);
  }
});

test("manual constraints change downstream available and blocked option state", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(sampleSnapshot(), {
    source: sourceReady(),
    constraints: { system: "DNX|60" },
  });

  assert.equal(result.selectedConstraints.system, "DNX|60");
  assert.equal(option(result, "optic", "DNX|Opal").status, "available");
  assert.equal(option(result, "optic", "LNX|Microprism").status, "blocked");
  assert.match(option(result, "optic", "LNX|Microprism").blockedReason, /manual constraints/i);
  assert.equal(result.manualConstraints[0].kind, "manual-constraint");
});

test("auto consequences are labelled as consequences and remain non-authoritative", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(sampleSnapshot(), {
    source: sourceReady(),
    constraints: { controlType: "DALI-2" },
  });

  const driver = result.autoConsequences.find((item) => item.fieldKey === "driver");
  assert.ok(driver);
  assert.equal(driver.kind, "auto-consequence");
  assert.match(driver.reason, /consequence/i);
  assert.equal(driver.mutable, true);
  assert.equal(driver.writes, false);
});

test("source-backed Control uses the authoritative BOARDS and DRIVERS intersection across mixed aliases", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    SYSTEM: [
      { system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct", approved: "yes" },
      { system: "LNX", system_variant_1: "60", label: "LNX 60", emission: "Direct", approved: "yes" },
    ],
    BOARDS: [
      {
        system: "DNX",
        system_variant_1: "80",
        control_type_options: "DALI",
        control_type_labels: "Digital addressable control",
        approved: "yes",
      },
      {
        system: "LNX",
        system_variant_1: "60",
        native_control_type: "PWM",
        control_type_labels: "PWM dimming",
        approved: "yes",
      },
    ],
    DRIVERS: [
      {
        system: "DNX",
        system_variant_1: "80",
        driver_id: "DNX DT6 Driver",
        native_control_type: "DALI-2 DT6",
        supported_control_aliases: "DALI;DALI-2",
        approved: "yes",
      },
      {
        system: "LNX",
        system_variant_1: "60",
        driver_id: "LNX PWM Driver",
        native_control_type: "PWM",
        supported_aliases: "PWM dimming",
        approved: "yes",
      },
    ],
  }, { source: sourceReady(), constraints: { system: "DNX|80" } });

  const control = field(result, "controlType");
  assert.deepEqual(control.options.map((item) => item.value), ["DALI-2", "PWM"]);
  const dali = option(result, "controlType", "DALI-2");
  assert.equal(dali.label, "Digital addressable control");
  assert.equal(dali.status, "available");
  assert.ok(dali.sourceTables.includes("BOARDS"));
  assert.ok(dali.sourceTables.includes("DRIVERS"));
  assert.ok(dali.systemReferenceKeys.includes("DNX|80"));
  assert.equal(option(result, "controlType", "PWM").status, "blocked");
  assert.equal(control.options.some((item) => item.value === "Digital addressable control"), false);
});

test("live-shaped global BOARDS and DRIVERS rows expose genuine native control authority without selecting a protocol", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    SYSTEM: [{ system: "60", system_variant_1: "Linear", label: "DNX 60", emission: "Direct", approved: "TRUE", status: "available" }],
    OPTICS: [{ system: "60", optic_var_1: "Opal", emission_permission: "Direct", approved: "TRUE", status: "available" }],
    BOARDS: [{
      approved: "TRUE",
      status: "available",
      system: "*",
      vendor: "tci",
      family: "lm70-20e8",
      c1_cct: 4000,
      c1_cri_min: 90,
      control_type_options: "dali2 dt6, fixed, dali2 dt8, dali+, dmx, d4i",
      control_type_labels: "Dali2 DT6 (1 channel), Fixed (On/Off), Dali2 DT8 (2 channel), Dali+ (Wireless), DMX (Theatre), D4i (PWR for acc & wireless)",
    }],
    DRIVERS: [
      {
        approved: "TRUE",
        status: "available",
        system: "*",
        vendor: "tci",
        series: "T_LED",
        native_control_type: "Dali2 (DT6)",
        model: "driver-dt6-live-shape",
      },
      {
        approved: "TRUE",
        status: "available",
        system: "*",
        vendor: "boke",
        series: "CWL",
        native_control_type: "Fixed (On/Off)",
        model: "driver-fixed-live-shape",
      },
    ],
  }, {
    source: sourceReady(),
    constraints: {
      system: "60|Linear",
      directOpticVar1: "60|Opal",
      targetLmPerM: "1200",
      cctCri: "cct_cri:4000K|CRI90",
    },
  });

  const control = field(result, "controlType");
  assert.equal(control.selectedValue, "");
  assert.equal(control.status, "available");
  assert.ok(control.options.some((item) => item.value === "DALI-2 DT6" && item.status === "available"));
  assert.ok(control.options.some((item) => item.value === "fixed" && item.label === "Fixed (On/Off)" && item.status === "available"));
  assert.equal(control.options.some((item) => item.value === "DALI-2 DT8" && item.status === "available"), false);
  assert.equal(control.options.some((item) => item.value === "DALI+ (Wireless)" && item.status === "available"), false);
  assert.ok(field(result, "driver").options.some((item) => item.value === "driver-dt6-live-shape"));
  assert.ok(field(result, "driver").options.some((item) => item.value === "driver-fixed-live-shape"));
});

test("driver aliases do not create protocol authority without native or legacy control authority", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    SYSTEM: [{ system: "60", system_variant_1: "Linear", label: "DNX 60", emission: "Direct", approved: "TRUE" }],
    BOARDS: [{
      system: "*",
      c1_cct: 4000,
      c1_cri_min: 90,
      control_type_options: "dali2 dt6",
      control_type_labels: "Dali2 DT6 (1 channel)",
      approved: "TRUE",
    }],
    DRIVERS: [{
      system: "*",
      model: "alias-only-driver",
      dimming: "Dali2 DT6",
      protocol: "DALI-2 DT6",
      approved: "TRUE",
    }],
  }, { source: sourceReady(), constraints: { system: "60|Linear" } });

  const control = field(result, "controlType");
  assert.deepEqual(control.options, []);
  assert.equal(control.status, "blocked");
  assert.equal(field(result, "driver").options.some((item) => item.value === "alias-only-driver"), true);
});

test("Control fails closed when labels have no genuine compatible driver protocol", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    SYSTEM: [{ system: "DNX", system_variant_1: "80", label: "DNX 80", emission: "Direct", approved: "yes" }],
    BOARDS: [{
      system: "DNX",
      system_variant_1: "80",
      control_type_labels: "Marketing smart control",
      approved: "yes",
    }],
    DRIVERS: [{
      system: "DNX",
      system_variant_1: "80",
      driver_id: "DALI Driver",
      native_control_type: "DALI-2",
      approved: "yes",
    }],
  }, { source: sourceReady(), constraints: { system: "DNX|80" } });

  const control = field(result, "controlType");
  assert.deepEqual(control.options, []);
  assert.equal(control.status, "blocked");
  assert.equal(control.unavailable, true);
  assert.equal(control.blocked, true);
  assert.equal(control.sourceStatus, "unavailable from current source");
  assert.match(control.unavailableReason, /no fake values/i);
});

test("missing source fields are future-mapped rather than faked", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({ SYSTEM: sampleSnapshot().SYSTEM }, { source: sourceReady() });

  const application = field(result, "application");
  const finish = field(result, "bodyFinish");
  assert.equal(application.futureMapped, true);
  assert.equal(application.sourceStatus, "unavailable from current source");
  assert.match(application.unavailableReason, /no fake values/i);
  assert.equal(finish.futureMapped, true);
  assert.match(result.warnings.join(" "), /future-mapped, not faked/i);
});

test("selector reference option adapter supports nested snapshot containers", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    data: {
      tables: {
        SYSTEM: [{ system: "NEST", system_variant_1: "60", label: "Nested 60", approved: "yes" }],
        OPTICS: [{ system: "NEST", optic_var_1: "Opal", emission_permission: "Direct", ip_option_1: "IP20", ik_option_2: "IK10", cct: "3000K", approved: "yes" }],
        DRIVERS: [{ driver_id: "Nested DALI", control_type: "DALI-2", approved: "yes" }],
      },
    },
  }, { source: sourceReady() });

  assert.equal(result.ok, true);
  assert.equal(result.fields.length > 0, true);
  assert.ok(field(result, "system").options.some((item) => item.label === "Nested 60"));
  assert.ok(field(result, "optic").options.some((item) => item.value === "NEST|Opal"));
  assert.equal(result.candidateSummary.optionFieldCount > 0, true);
  assert.equal(result.candidateSummary.availableFieldCount > 0, true);
});

test("selector reference option adapter supports sheet-like headers and rows without exposing raw rows", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    sheets: {
      SYSTEM: {
        headers: ["system", "system_variant_1", "label", "approved"],
        rows: [["SHEET", "80", "Sheet 80", "yes"]],
      },
      OPTICS: {
        headers: ["system", "optic_var_1", "emission_permission", "ip_option_1", "ik_option_2", "cct", "approved", "secret_note"],
        rows: [["SHEET", "Microprism", "Direct", "IP20;IP65", "IK07;IK10", "3000K;4000K", "yes", "must not leak"]],
      },
      DRIVERS: {
        values: [
          ["driver_id", "control_type", "approved"],
          ["Sheet DALI", "DALI-2", "yes"],
        ],
      },
    },
  }, { source: sourceReady() });
  const text = JSON.stringify(result);

  assert.equal(result.fields.length > 0, true);
  assert.ok(field(result, "system").options.some((item) => item.label === "Sheet 80"));
  assert.ok(field(result, "optic").options.some((item) => item.value === "SHEET|Microprism"));
  assert.ok(field(result, "ipRating").options.some((item) => item.value === "IP65"));
  assert.equal(text.includes("must not leak"), false);
  assert.equal(result.rawRowsExposed, false);
  assert.equal(result.tableSummary.some((table) => table.table === "SYSTEM" && table.rowCount === 1), true);
});

test("selector source options preserve source order and explicit default independent from order", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    SYSTEM: [
      { system: "COM", system_variant_1: "60", label: "Comfort", approved: "yes" },
      { system: "ASY", system_variant_1: "60", label: "Asymmetric", approved: "yes" },
      { system: "WIDE", system_variant_1: "60", label: "Wide", approved: "yes", is_default: "yes" },
    ],
  }, { source: sourceReady() });

  const systems = field(result, "system").options;
  assert.deepEqual(systems.map((item) => item.label), ["Comfort", "Asymmetric", "Wide"]);
  assert.equal(systems[0].isDefault, false);
  assert.equal(systems[1].isDefault, false);
  assert.equal(systems[2].isDefault, true);
  assert.equal(systems[2].explicitDefault, true);
  assert.equal(systems[2].defaultSource, "source-marker");
});

test("selector source delimited cells preserve token order and source default marker", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    OPTICS: [
      {
        system: "DNX",
        optic_var_1: "Comfort",
        emission_permission: "Direct",
        ip_option_1: "IP65;IP20,IP54|IP40",
        default_value: "IP54",
        approved: "yes",
      },
    ],
  }, { source: sourceReady() });

  const ipOptions = field(result, "ipRating").options;
  assert.deepEqual(ipOptions.map((item) => item.value), ["IP65", "IP20", "IP54", "IP40"]);
  assert.equal(ipOptions.find((item) => item.value === "IP54")?.explicitDefault, true);
  assert.equal(ipOptions.find((item) => item.value === "IP65")?.explicitDefault, false);
});

test("selector unknown selected values stay diagnostic_unmapped and out of source-valid options", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(sampleSnapshot(), {
    source: sourceReady(),
    constraints: { ipRating: "IP00", optic: "opal" },
  });
  const ip = field(result, "ipRating");
  const optic = field(result, "optic");

  assert.equal(ip.options.some((item) => item.value === "IP00"), false);
  assert.equal(ip.selectedValueStatus, "diagnostic_unmapped");
  assert.equal(ip.selectedValueDiagnostic.value, "IP00");
  assert.equal(optic.options.some((item) => item.value === "opal"), false);
  assert.equal(optic.selectedValueStatus, "diagnostic_unmapped");
  assert.equal(result.manualConstraints.every((item) => ["source_valid", "diagnostic_unmapped"].includes(item.selectedValueStatus)), true);
  assert.equal(result.blockedItems.some((item) => item.fieldKey === "ipRating" && item.status === "diagnostic_unmapped"), true);
});

test("selector empty source-valid field is blocked unavailable with no fallback option", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({ SYSTEM: sampleSnapshot().SYSTEM }, { source: sourceReady() });
  const application = field(result, "application");

  assert.equal(application.status, "blocked");
  assert.equal(application.unavailable, true);
  assert.equal(application.blocked, true);
  assert.deepEqual(application.options, []);
  assert.equal(application.options.some((item) => item.sourceStatus === "stand-in" || item.value === "opal" || item.value === "IK07"), false);
});

test("selector emitted options expose source_valid machine values only", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(sampleSnapshot(), { source: sourceReady() });
  const optionValues = result.fields.flatMap((item) => item.options.map((optionItem) => ({ fieldKey: item.fieldKey, option: optionItem })));

  assert.equal(optionValues.length > 0, true);
  assert.equal(optionValues.every(({ option: optionItem }) => optionItem.valueStatus === "source_valid" && optionItem.canonicalSourceValue === true), true);
  assert.equal(optionValues.some(({ option: optionItem }) => optionItem.value === "opal"), false);
});

test("selector cctCri emits canonical cct_cri pair token with display-only label", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    BOARDS: [{ board: "B1", c1_cct: "4000", c1_cri_min: "90", approved: "yes" }],
  }, { source: sourceReady() });
  const pair = option(result, "cctCri", "cct_cri:4000K|CRI90");
  const indirectPair = option(result, "cctCriIndirect", "cct_cri:4000K|CRI90");

  assert.equal(pair.value, "cct_cri:4000K|CRI90");
  assert.equal(pair.label, "4000K / CRI90");
  assert.equal(pair.valueStatus, "source_valid");
  assert.equal(pair.canonicalSourceValue, true);
  assert.equal(pair.cctCriToken, "cct_cri:4000K|CRI90");
  assert.equal(pair.cctToken, "4000K");
  assert.equal(pair.criToken, "CRI90");
  assert.equal(pair.pairAuthority, "authoritative-cct-cri-pair");
  assert.equal(indirectPair.value, "cct_cri:4000K|CRI90");
});

test("selector cctCri preserves explicit source pair order and default marker", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    BOARDS: [{
      board: "B1",
      cct_cri: "4000K / CRI90;3000K / CRI80;cct_cri:TW_2700K_6500K|CRI90",
      default_value: "3000K / CRI80",
      approved: "yes",
    }],
  }, { source: sourceReady() });
  const pairs = field(result, "cctCri").options;

  assert.deepEqual(pairs.map((item) => item.value), [
    "cct_cri:4000K|CRI90",
    "cct_cri:3000K|CRI80",
    "cct_cri:TW_2700K_6500K|CRI90",
  ]);
  assert.deepEqual(pairs.map((item) => item.label), [
    "4000K / CRI90",
    "3000K / CRI80",
    "TW 2700K–6500K / CRI90",
  ]);
  assert.equal(pairs[1].explicitDefault, true);
  assert.equal(pairs[0].explicitDefault, false);
});

test("selector cctCri does not cartesian-mix independent CCT and CRI cells", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    BOARDS: [{ board: "B1", cct: "3000K;4000K", cri: "CRI80;CRI90", approved: "yes" }],
  }, { source: sourceReady() });

  assert.deepEqual(field(result, "cctCri").options, []);
  assert.deepEqual(field(result, "cctCriIndirect").options, []);
});

test("selector cctCri missing CRI fails closed without source-valid pair option", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    BOARDS: [{ board: "B1", c1_cct: "4000", approved: "yes" }],
  }, { source: sourceReady() });
  const cctCri = field(result, "cctCri");

  assert.equal(cctCri.status, "blocked");
  assert.equal(cctCri.unavailable, true);
  assert.deepEqual(cctCri.options, []);
});

test("selector legacy cctCri display label is diagnostic_unmapped, not source_valid", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({
    BOARDS: [{ board: "B1", c1_cct: "4000", c1_cri_min: "90", approved: "yes" }],
  }, {
    source: sourceReady(),
    constraints: { cctCri: "4000K / CRI90" },
  });
  const cctCri = field(result, "cctCri");

  assert.equal(cctCri.selectedValueStatus, "diagnostic_unmapped");
  assert.equal(cctCri.options.some((item) => item.value === "4000K / CRI90"), false);
  assert.equal(cctCri.options.some((item) => item.value === "cct_cri:4000K|CRI90"), true);
});


test("selector reference option adapter returns visible future-mapped cards when no tables are mappable", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot({ unrelated: [{ name: "no selector data" }] }, { source: sourceReady() });

  assert.equal(result.ok, true);
  assert.equal(result.fields.length > 0, true);
  assert.equal(result.candidateSummary.optionFieldCount, 0);
  assert.equal(result.candidateSummary.availableFieldCount, 0);
  assert.equal(result.fields.every((item) => item.futureMapped === true), true);
  assert.match(result.fields[0].unavailableReason, /no fake values|unavailable/i);
});

test("buildSelectorReferenceOptions reads a snapshot through a safe fs adapter without exposing paths or rows", async () => {
  const fsApi = {
    async stat() {
      return { isFile: () => true, mtime: new Date("2026-01-01T00:00:00.000Z"), size: 4321 };
    },
    async readFile() {
      return JSON.stringify(sampleSnapshot());
    },
  };

  const result = await buildSelectorReferenceOptions({ sourcePath: "C:/secret/private/novondb.json", fsApi });
  const serialised = JSON.stringify(result);

  assert.equal(result.ok, true);
  assert.equal(result.source.label, "runtime-authority-reference-active-snapshot");
  assert.equal(serialised.includes("C:/secret/private/novondb.json"), false);
  assert.equal(serialised.includes("must not leak"), false);
});

function timelineStatusSnapshot() {
  return {
    SYSTEM: [
      { system: "AVL", system_variant_1: "60", label: "Available 60", approved: "yes", status: "available", raw_secret: "must not leak" },
      { system: "APR", system_variant_1: "60", label: "Approved 60", approved: "yes", status: "approved" },
      { system: "STG", system_variant_1: "60", label: "Staged 60", approved: "yes", status: "staged" },
      { system: "RDM", system_variant_1: "60", label: "Roadmap 60", approved: "yes", status: "roadmap" },
      { system: "OBS", system_variant_1: "60", label: "Obsolete 60", approved: "yes", status: "obsolete" },
      { system: "UNK", system_variant_1: "60", label: "Unknown 60", approved: "yes", status: "mystery" },
    ],
    USERS: [
      { email: "timeline-private@example.com", token: "must not leak" },
    ],
  };
}

test("timeline/status policy keeps staged and roadmap selector-visible while obsolete stays hidden", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(timelineStatusSnapshot(), { source: sourceReady() });
  const system = field(result, "system");
  const values = system.options.map((item) => item.value);
  const available = option(result, "system", "AVL|60");
  const approved = option(result, "system", "APR|60");
  const serialised = JSON.stringify(result);

  assert.deepEqual(values.sort(), ["APR|60", "AVL|60", "RDM|60", "STG|60", "UNK|60"].sort());
  assert.equal(available.optionStatusClass, "available");
  assert.equal(approved.optionStatusClass, "approved");
  assert.equal(available.timelineAvailability, "visible-to-external-default");
  assert.equal(approved.blockedByStatusPolicy, false);
  assert.equal(available.rawRowsReturned, false);
  assert.equal(available.rawUsersReturned, false);
  assert.equal(available.privatePathsReturned, false);
  assert.deepEqual(result.timelineStatusFiltering.visibleToExternalDefault, ["available", "approved", "staged", "roadmap", "unknown"]);
  assert.deepEqual(result.timelineStatusFiltering.hiddenOrBlockedToExternalDefault, ["obsolete"]);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawUsersReturned, false);
  assert.equal(result.privatePathsReturned, false);
  assert.equal(serialised.includes("must not leak"), false);
  assert.equal(serialised.includes("timeline-private@example.com"), false);
});

test("selected staged and roadmap status values stay selector-visible and production blocked", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(timelineStatusSnapshot(), {
    source: sourceReady(),
    constraints: { system: "STG|60" },
  });
  const selected = option(result, "system", "STG|60");

  assert.equal(selected.selected, true);
  assert.equal(selected.status, "available");
  assert.equal(selected.blocked, false);
  assert.equal(selected.optionStatusClass, "staged");
  assert.equal(selected.timelineAvailability, "selector-visible-review-only");
  assert.equal(selected.blockedByStatusPolicy, false);
  assert.equal(selected.productionBlocked, true);
  assert.equal(result.blockedItems.some((item) => item.fieldKey === "system" && item.value === "STG|60"), false);
});

test("unknown timeline/status fails safe as review-required without unsafe side effects", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(timelineStatusSnapshot(), {
    source: sourceReady(),
    constraints: { system: "UNK|60" },
  });
  const selected = option(result, "system", "UNK|60");

  assert.equal(selected.selected, true);
  assert.equal(selected.status, "available");
  assert.equal(selected.optionStatusClass, "unknown");
  assert.equal(selected.timelineAvailability, "selector-visible-review-required");
  assert.equal(selected.blockedByStatusPolicy, false);
  assert.equal(selected.statusPolicyReviewRequired, true);
  assert.equal(selected.productionBlocked, true);

  assert.equal(result.donorEngineInvoked, false);
  assert.equal(result.runtimeDataMutated, false);
  assert.equal(result.runTableGenerated, false);
  assert.equal(result.iesGenerated, false);
  assert.equal(result.selectedResultPersisted, false);
  assert.equal(result.routesAdded, false);
  assert.equal(result.postEndpointsAdded, false);
  assert.equal(result.rawRowsReturned, false);
  assert.equal(result.rawUsersReturned, false);
  assert.equal(result.privatePathsReturned, false);
});


test("selector reference options bind source-version metadata onto emitted source-valid options", () => {
  const result = deriveSelectorReferenceOptionsFromSnapshot(sampleSnapshot(), {
    source: {
      ...sourceReady(),
      sourceInputFingerprint: "safe-selector-reference-source-fp-v1",
      boardDataSourceVersion: "safe-selector-reference-board-version-v1",
    },
  });
  const cctCri = field(result, "cctCri");
  const pair = option(result, "cctCri", "cct_cri:3000K|CRI80");

  assert.equal(result.sourceInputFingerprint, "safe-selector-reference-source-fp-v1");
  assert.equal(result.boardDataSourceVersion, "safe-selector-reference-board-version-v1");
  assert.equal(result.sourceVersionBinding.bindingStatus, "source-version-bound");
  assert.equal(cctCri.sourceVersionBinding.staleRevalidationEnabled, true);
  assert.equal(cctCri.sourceVersionBinding.staleValuesInsertedIntoOptions, false);
  assert.equal(pair.sourceInputFingerprint, "safe-selector-reference-source-fp-v1");
  assert.equal(pair.boardDataSourceVersion, "safe-selector-reference-board-version-v1");
  assert.equal(pair.sourceVersionBinding.optionSetsBound, true);
});
