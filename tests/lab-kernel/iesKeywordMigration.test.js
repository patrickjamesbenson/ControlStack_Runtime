import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  CANONICAL_KEYWORD_DEFINITIONS,
  CANONICAL_KEYWORDS,
  INTERNAL_AMBIENT_POLICY,
  KEYWORD_PROFILE_ID,
  validateKeywordVocabulary,
} from "../../packages/lab-kernel/ies-toolkit/iesKeywordContract.js";

const read = (relativePath) => readFileSync(new URL(`../../${relativePath}`, import.meta.url), "utf8");

const EXPECTED_KEYWORDS = Object.freeze([
  "TEST",
  "TESTLAB",
  "ISSUEDATE",
  "MANUFAC",
  "LUMCAT",
  "LUMINAIRE",
  "LAMP",
  "_CRI",
  "_COLORTEMP",
  "_INTERNAL_AMBIENT_TA_C",
  "_DRIVER",
  "_DRIVER_SETTING",
  "_GEAR_TRAY_REF_ID",
  "_OPTIC_REF_ID",
  "_EMERGENCY_VERIFIED",
  "_EWIS_CARTRIDGE_VERIFIED",
]);

const EXPECTED_OWNERS = Object.freeze([
  "lab-provenance",
  "lab-constant",
  "lab-provenance",
  "lab-constant",
  "project-assembly",
  "project-assembly",
  "project-assembly",
  "project-selection",
  "project-selection",
  "sealed-reference",
  "run-engine",
  "run-engine",
  "lab-provenance",
  "lab-provenance",
  "lab-assembly-approval",
  "lab-assembly-approval",
]);

test("active lab form is the exact canonical 16-field profile with sealed-reference internal ambient ownership", () => {
  const form = JSON.parse(read("packages/lab-kernel/ies-toolkit/nvb/lab_form.json"));
  const validation = validateKeywordVocabulary(form);

  assert.equal(KEYWORD_PROFILE_ID, "controlstack.lab.ies-keywords.v1");
  assert.deepEqual(CANONICAL_KEYWORDS, EXPECTED_KEYWORDS);
  assert.deepEqual(
    CANONICAL_KEYWORD_DEFINITIONS.map(({ order, key, owner }) => ({ order, key, owner })),
    EXPECTED_KEYWORDS.map((key, index) => ({ order: index + 1, key, owner: EXPECTED_OWNERS[index] })),
  );
  assert.deepEqual(INTERNAL_AMBIENT_POLICY, {
    key: "_INTERNAL_AMBIENT_TA_C",
    semantic: "measured internal assembly ambient during the authority test",
    excludes: "rated operating ambient",
  });

  assert.equal(form.length, 16);
  assert.equal(validation.ok, true, validation.errors.join("\n"));
  assert.deepEqual(validation.actualKeywords, EXPECTED_KEYWORDS);
  assert.deepEqual(form.map((row) => row.IES_ORDER), EXPECTED_KEYWORDS.map((_key, index) => index + 1));
  assert.deepEqual(form.map((row) => row.FIELD), EXPECTED_KEYWORDS.map((key) => `[${key}]`));
  assert.equal(form[9].FIELD, "[_INTERNAL_AMBIENT_TA_C]");
  assert.match(form[9].SOURCE, /sealed reference/i);
  assert.doesNotMatch(form[9].SOURCE, /selector/i);
  assert.match(form[9].note, /measured internal assembly ambient during the authority test/i);
  assert.match(form[9].note, /not rated operating ambient/i);

  const staleAmbient = form.map((row, index) => index === 9 ? { ...row, FIELD: "[_AMBIENT_TA_C]" } : row);
  const staleValidation = validateKeywordVocabulary(staleAmbient);
  assert.equal(staleValidation.ok, false);
  assert.match(staleValidation.errors.join("\n"), /_AMBIENT_TA_C is stale/i);

  const supplementary = [...form, { FIELD: "[_SUPPLEMENTARY_FIELD]" }];
  const supplementaryValidation = validateKeywordVocabulary(supplementary);
  assert.equal(supplementaryValidation.ok, false);
  assert.match(supplementaryValidation.errors.join("\n"), /supplementary or unknown keyword/i);

  const alias = form.map((row, index) => index === 14 ? { ...row, FIELD: "[_EMERGENCY_CAPABLE]" } : row);
  const aliasValidation = validateKeywordVocabulary(alias);
  assert.equal(aliasValidation.ok, false);
  assert.match(aliasValidation.errors.join("\n"), /_EMERGENCY_CAPABLE is not part of the canonical profile/i);
});

test("active generators and UI surfaces consume the canonical contract without editable Main Bench ambient", () => {
  const formatter = read("packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js");
  const fromReference = read("packages/lab-kernel/ies-toolkit/iesFromReference.js");
  const project = read("packages/lab-kernel/ies-toolkit/iesProjectIes.js");
  const builder = read("packages/lab-kernel/ies-toolkit/ies_builder.html");
  const bench = read("packages/lab-kernel/ies-toolkit/bench.html");
  const summary = read("packages/lab-kernel/ies-toolkit/summary.html");

  for (const source of [formatter, fromReference, project, bench, summary]) {
    assert.match(source, /CANONICAL_KEYWORDS/);
  }

  assert.doesNotMatch(fromReference, /case\s+"_AMBIENT_TA_C"/);
  assert.doesNotMatch(fromReference, /sel\.ambient/);
  assert.doesNotMatch(builder, /id="jAmb"|ambient:\$\("jAmb"\)/);

  assert.match(bench, /\.\/iesKeywordContract\.js/);
  assert.match(bench, /CANONICAL_KEYWORDS\s*\.filter/);
  assert.match(bench, /delete next\.meta\.keywords/);
  assert.match(bench, /Internal ambient remains sealed-reference-owned/i);
  assert.doesNotMatch(bench, /id="sysTa"|id="jAmb"/);
  assert.doesNotMatch(bench, /optionalField\(project,\s*"ambient"/);
  assert.doesNotMatch(bench, /upsertKw\([^\n]*_INTERNAL_AMBIENT_TA_C/);
  assert.doesNotMatch(bench, /(^|[^A-Z0-9_])_AMBIENT_TA_C/m);
  assert.doesNotMatch(bench, /\[_SERIALNUMBER\].*reference endpoint/);

  assert.match(summary, /CANONICAL_KEYWORDS\.filter/);
  assert.match(summary, /upsertKw\(meta,"_INTERNAL_AMBIENT_TA_C",\$\("sysTa"\)\.value\)/);
  assert.doesNotMatch(summary, /upsertKw\(meta,"_AMBIENT_TA_C"/);
});

test("merge, project adapter, builder and previews retain canonical ambient vocabulary", () => {
  const formatter = read("packages/lab-kernel/ies-toolkit/iesLabFormKeywords.js");
  const fromReference = read("packages/lab-kernel/ies-toolkit/iesFromReference.js");
  const merge = read("packages/lab-kernel/ies-toolkit/iesMerge.js");
  const project = read("packages/lab-kernel/ies-toolkit/iesProjectIes.js");
  const builder = read("packages/lab-kernel/ies-toolkit/ies_builder.html");
  const bench = read("packages/lab-kernel/ies-toolkit/bench.html");
  const summary = read("packages/lab-kernel/ies-toolkit/summary.html");

  for (const source of [formatter, fromReference, merge, project, builder, bench, summary]) {
    assert.doesNotMatch(source, /(^|[^A-Z0-9_])_AMBIENT_TA_C/m);
    assert.doesNotMatch(source, /(^|[^A-Z0-9_])_EMERGENCY_CAPABLE/m);
  }

  assert.match(merge, /_INTERNAL_AMBIENT_TA_C:\s*null/);
  assert.doesNotMatch(merge, /(^|[^A-Z0-9_])_AMBIENT_TA_C:\s*null/m);

  assert.match(project, /requireCanonicalGeneratedKeywords/);
  assert.match(project, /CANONICAL_KEYWORDS\.length/);
  assert.doesNotMatch(builder, /id="jAmb"|ambient:\$\("jAmb"\)/);

  for (const preview of [bench, summary]) {
    assert.match(preview, /CANONICAL_KEYWORDS/);
    assert.doesNotMatch(preview, /(^|[^A-Z0-9_])_AMBIENT_TA_C/m);
  }
});
