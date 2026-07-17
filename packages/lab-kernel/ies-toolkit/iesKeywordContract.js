// ControlStack Lab — canonical outgoing IES keyword contract.
// Browser-safe and dependency-free. This module defines vocabulary only; it does not write IES files.

/** @typedef {{order:number, key:string, owner:string, semantic:string}} KeywordDefinition */

/** Canonical versioned profile for the Lab-owned 16-field outgoing IES vocabulary. */
export const KEYWORD_PROFILE_ID = "controlstack.lab.ies-keywords.v1";

/**
 * `_INTERNAL_AMBIENT_TA_C` records measured internal assembly ambient during the authority test.
 * It does not represent rated operating ambient.
 */
export const INTERNAL_AMBIENT_POLICY = Object.freeze({
  key: "_INTERNAL_AMBIENT_TA_C",
  semantic: "measured internal assembly ambient during the authority test",
  excludes: "rated operating ambient",
});

/** @type {readonly KeywordDefinition[]} */
export const CANONICAL_KEYWORD_DEFINITIONS = Object.freeze([
  Object.freeze({ order: 1, key: "TEST", owner: "lab-provenance", semantic: "Lab test or authority record identifier" }),
  Object.freeze({ order: 2, key: "TESTLAB", owner: "lab-constant", semantic: "Lab identity" }),
  Object.freeze({ order: 3, key: "ISSUEDATE", owner: "lab-provenance", semantic: "Lab issue or seal date" }),
  Object.freeze({ order: 4, key: "MANUFAC", owner: "lab-constant", semantic: "Manufacturer identity" }),
  Object.freeze({ order: 5, key: "LUMCAT", owner: "project-assembly", semantic: "Project or assembly catalogue identity" }),
  Object.freeze({ order: 6, key: "LUMINAIRE", owner: "project-assembly", semantic: "Project or assembly luminaire identity" }),
  Object.freeze({ order: 7, key: "LAMP", owner: "project-assembly", semantic: "Project or assembly family identity" }),
  Object.freeze({ order: 8, key: "_CRI", owner: "project-selection", semantic: "Selected CRI constrained by the sealed reference" }),
  Object.freeze({ order: 9, key: "_COLORTEMP", owner: "project-selection", semantic: "Selected CCT constrained by the sealed reference" }),
  Object.freeze({ order: 10, key: "_INTERNAL_AMBIENT_TA_C", owner: "sealed-reference", semantic: INTERNAL_AMBIENT_POLICY.semantic }),
  Object.freeze({ order: 11, key: "_DRIVER", owner: "run-engine", semantic: "Resolved driver identity" }),
  Object.freeze({ order: 12, key: "_DRIVER_SETTING", owner: "run-engine", semantic: "Resolved driver operating setting" }),
  Object.freeze({ order: 13, key: "_GEAR_TRAY_REF_ID", owner: "lab-provenance", semantic: "Pinned gear-tray reference identity" }),
  Object.freeze({ order: 14, key: "_OPTIC_REF_ID", owner: "lab-provenance", semantic: "Pinned optic reference identity" }),
  Object.freeze({ order: 15, key: "_EMERGENCY_VERIFIED", owner: "lab-assembly-approval", semantic: "Emergency verification decision" }),
  Object.freeze({ order: 16, key: "_EWIS_CARTRIDGE_VERIFIED", owner: "lab-assembly-approval", semantic: "Independent EWIS cartridge verification decision" }),
]);

/** Exact canonical keyword names in required output order. */
export const CANONICAL_KEYWORDS = Object.freeze(CANONICAL_KEYWORD_DEFINITIONS.map((entry) => entry.key));

const CANONICAL_SET = new Set(CANONICAL_KEYWORDS);

/**
 * Convert a bracketed or unbracketed keyword token into the canonical comparison form.
 *
 * @param {unknown} value
 * @returns {string}
 */
export function normalizeKeywordName(value) {
  return String(value ?? "").trim().replace(/^\[|\]$/g, "").toUpperCase();
}

/**
 * Return the canonical definition for a keyword, or null when it is not in the core profile.
 *
 * @param {unknown} keyword
 * @returns {KeywordDefinition|null}
 */
export function getKeywordDefinition(keyword) {
  const normalized = normalizeKeywordName(keyword);
  return CANONICAL_KEYWORD_DEFINITIONS.find((entry) => entry.key === normalized) || null;
}

/**
 * Test whether a keyword belongs to the exact 16-field core profile.
 *
 * @param {unknown} keyword
 * @returns {boolean}
 */
export function isCanonicalKeyword(keyword) {
  return CANONICAL_SET.has(normalizeKeywordName(keyword));
}

function keywordFromRow(row) {
  if (typeof row === "string") return row;
  if (!row || typeof row !== "object") return "";
  return row.key ?? row.field ?? row.FIELD ?? row.keyword ?? "";
}

/**
 * Validate an ordered keyword vocabulary against the exact canonical 16-field profile.
 * Brackets are tolerated for comparison, but aliases, additions, omissions and reordering fail.
 *
 * @param {unknown} rows Ordered strings or row objects containing `key`, `field`, `FIELD`, or `keyword`.
 * @returns {{ok:boolean, profileId:string, errors:string[], actualKeywords:string[]}}
 */
export function validateKeywordVocabulary(rows) {
  const errors = [];
  if (!Array.isArray(rows)) {
    return {
      ok: false,
      profileId: KEYWORD_PROFILE_ID,
      errors: ["Keyword vocabulary must be an ordered array."],
      actualKeywords: [],
    };
  }

  const actualKeywords = rows.map((row) => normalizeKeywordName(keywordFromRow(row)));
  const seen = new Set();
  for (const keyword of actualKeywords) {
    if (!keyword) errors.push("Keyword vocabulary contains an empty keyword name.");
    if (seen.has(keyword)) errors.push(`Keyword vocabulary contains duplicate field ${keyword}.`);
    seen.add(keyword);
  }

  if (actualKeywords.includes("_AMBIENT_TA_C")) {
    errors.push("_AMBIENT_TA_C is stale; use _INTERNAL_AMBIENT_TA_C.");
  }
  if (actualKeywords.includes("_EMERGENCY_CAPABLE")) {
    errors.push("_EMERGENCY_CAPABLE is not part of the canonical profile; use _EMERGENCY_VERIFIED.");
  }

  if (actualKeywords.length !== CANONICAL_KEYWORDS.length) {
    errors.push(`Keyword vocabulary must contain exactly ${CANONICAL_KEYWORDS.length} fields; received ${actualKeywords.length}.`);
  }

  const length = Math.max(actualKeywords.length, CANONICAL_KEYWORDS.length);
  for (let index = 0; index < length; index += 1) {
    const expected = CANONICAL_KEYWORDS[index];
    const actual = actualKeywords[index];
    if (expected !== actual) {
      errors.push(`Keyword position ${index + 1} must be ${expected ?? "<none>"}; received ${actual ?? "<missing>"}.`);
    }
  }

  for (const keyword of actualKeywords) {
    if (keyword && !CANONICAL_SET.has(keyword)) {
      errors.push(`Supplementary or unknown keyword ${keyword} is not permitted by ${KEYWORD_PROFILE_ID}.`);
    }
  }

  return { ok: errors.length === 0, profileId: KEYWORD_PROFILE_ID, errors, actualKeywords };
}

/**
 * Assert the exact canonical vocabulary and return normalized ordered names.
 *
 * @param {unknown} rows
 * @returns {string[]}
 * @throws {TypeError} When the vocabulary differs from the contract.
 */
export function assertKeywordVocabulary(rows) {
  const result = validateKeywordVocabulary(rows);
  if (!result.ok) {
    throw new TypeError(`Invalid ${KEYWORD_PROFILE_ID}: ${result.errors.join(" ")}`);
  }
  return result.actualKeywords.slice();
}
