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
      { system: "DNX", optic_var_1: "Opal", ip_option_1: "IP20;IP65", ik_option_2: "IK07;IK10", cct: "3000K;4000K", approved: "yes" },
      { system: "LNX", optic_var_1: "Microprism", ip_option_1: "IP20", ik_option_2: "IK07", cct: "4000K", approved: "yes" },
    ],
    BOARDS: [
      { board: "B1", cct: "3000K;4000K", approved: "yes" },
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
  assert.ok(field(result, "cct").options.some((item) => item.value === "3000K"));
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
        OPTICS: [{ system: "NEST", optic_var_1: "Opal", ip_option_1: "IP20", ik_option_2: "IK10", cct: "3000K", approved: "yes" }],
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
        headers: ["system", "optic_var_1", "ip_option_1", "ik_option_2", "cct", "approved", "secret_note"],
        rows: [["SHEET", "Microprism", "IP20;IP65", "IK07;IK10", "3000K;4000K", "yes", "must not leak"]],
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
