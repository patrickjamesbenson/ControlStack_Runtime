import { test } from "node:test";
import assert from "node:assert/strict";
import { CANONICAL_KEYWORDS, normalizeKeywordName } from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";
import { labFormToKeywordsOrder } from "../../packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js";

const keysOf = (rows) => rows.map((row) => normalizeKeywordName(row.key));

test("shuffled lab-form input emits only non-empty canonical values in canonical order", () => {
  const output = labFormToKeywordsOrder([
    { field: "[_EWIS_CARTRIDGE_VERIFIED]", value: "yes", kind: "ies", order: 1 },
    { field: "[LUMINAIRE]", value: "  Linear Build  ", kind: "ies", order: 99 },
    { field: "[_AMBIENT_TA_C]", value: "99", kind: "ies", order: 2 },
    { field: "[_BCLT_APPLIED]", value: "yes", kind: "check", order: 3 },
    { field: "[_FLAGS_CHECKED]", value: "yes", kind: "ies", order: 4 },
    { field: "[_SERIALNUMBER]", value: "NVB-1", kind: "ies", order: 5 },
    { field: "[FILE_EXTRA]", value: "from incoming file", kind: "ies", source: "file-extra", order: 6 },
    { field: "[_CRI]", value: "   ", kind: "ies", order: 7 },
    { field: "[_EMERGENCY_VERIFIED]", value: "verified", kind: "ies", order: 8 },
    { field: "[TEST]", value: "AUTH-42", kind: "ies", order: 50 },
  ]);

  assert.deepEqual(keysOf(output), [
    "TEST",
    "LUMINAIRE",
    "_EMERGENCY_VERIFIED",
    "_EWIS_CARTRIDGE_VERIFIED",
  ]);
  assert.deepEqual(output.map((row) => row.value), ["AUTH-42", "Linear Build", "verified", "yes"]);
  assert.ok(keysOf(output).every((key) => CANONICAL_KEYWORDS.includes(key)));
});

test("both approved verification fields remain eligible while empty and supplementary fields are omitted", () => {
  const output = labFormToKeywordsOrder([
    { field: "[_EWIS_CARTRIDGE_VERIFIED]", value: true, kind: "ies" },
    { field: "[_EMERGENCY_VERIFIED]", value: false, kind: "ies" },
    { field: "[MANUFAC]", value: "", kind: "ies" },
    { field: "[_POWER_APPROVED]", value: "yes", kind: "check" },
    { field: "[_REFERENCE]", value: "REF-1", kind: "ies" },
  ]);

  assert.deepEqual(keysOf(output), ["_EMERGENCY_VERIFIED", "_EWIS_CARTRIDGE_VERIFIED"]);
  assert.deepEqual(output.map((row) => row.value), ["false", "true"]);
});
