import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CANONICAL_KEYWORDS,
  CANONICAL_KEYWORD_DEFINITIONS,
  INTERNAL_AMBIENT_POLICY,
  KEYWORD_PROFILE_ID,
  assertKeywordVocabulary,
  getKeywordDefinition,
  validateKeywordVocabulary,
} from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";

const EXPECTED = [
  "TEST", "TESTLAB", "ISSUEDATE", "MANUFAC", "LUMCAT", "LUMINAIRE", "LAMP", "_CRI",
  "_COLORTEMP", "_INTERNAL_AMBIENT_TA_C", "_DRIVER", "_DRIVER_SETTING", "_GEAR_TRAY_REF_ID",
  "_OPTIC_REF_ID", "_EMERGENCY_VERIFIED", "_EWIS_CARTRIDGE_VERIFIED",
];

test("exports the exact ordered 16-field profile", () => {
  assert.equal(KEYWORD_PROFILE_ID, "controlstack.lab.ies-keywords.v1");
  assert.deepEqual(CANONICAL_KEYWORDS, EXPECTED);
  assert.deepEqual(CANONICAL_KEYWORD_DEFINITIONS.map((entry) => entry.order), Array.from({ length: 16 }, (_, i) => i + 1));
});

test("defines internal ambient as measured assembly ambient, not rated ambient", () => {
  assert.equal(INTERNAL_AMBIENT_POLICY.key, "_INTERNAL_AMBIENT_TA_C");
  assert.match(INTERNAL_AMBIENT_POLICY.semantic, /measured internal assembly ambient/i);
  assert.match(INTERNAL_AMBIENT_POLICY.excludes, /rated operating ambient/i);
  assert.equal(getKeywordDefinition("[_INTERNAL_AMBIENT_TA_C]").owner, "sealed-reference");
});

test("accepts bracketed canonical rows and rejects aliases, extras and reordering", () => {
  const rows = EXPECTED.map((key) => ({ FIELD: `[${key}]` }));
  assert.deepEqual(assertKeywordVocabulary(rows), EXPECTED);

  const stale = rows.map((row) => ({ ...row }));
  stale[9].FIELD = "[_AMBIENT_TA_C]";
  const staleResult = validateKeywordVocabulary(stale);
  assert.equal(staleResult.ok, false);
  assert.match(staleResult.errors.join(" "), /stale/i);

  const extra = [...rows, { FIELD: "[_SERIALNUMBER]" }];
  assert.equal(validateKeywordVocabulary(extra).ok, false);

  const reordered = rows.slice();
  [reordered[0], reordered[1]] = [reordered[1], reordered[0]];
  assert.equal(validateKeywordVocabulary(reordered).ok, false);
});
