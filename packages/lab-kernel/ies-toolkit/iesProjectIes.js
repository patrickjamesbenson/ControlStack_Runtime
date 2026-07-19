// iesProjectIes.js — deterministic project adapter over the sealed-reference IES generator.
// Pure and browser-safe: validates the bounded project envelope, delegates all reference
// validation/materialisation, and replaces generator provenance with project-bound provenance.
import { buildIesFromReference } from "./iesFromReference.js";
import { CANONICAL_KEYWORDS, normalizeKeywordName } from "./iesKeywordContract.js";

const PROJECT_FIELDS = Object.freeze([
  "projectId",
  "outputMultiplier",
  "lumcat",
  "luminaire",
  "lamp",
  "cri",
  "cct",
  "driver",
  "driverSetting",
]);
const SELECTION_FIELDS = Object.freeze([
  "lumcat",
  "luminaire",
  "lamp",
  "cri",
  "cct",
  "driver",
  "driverSetting",
]);

class ProjectIesError extends Error {
  constructor(message, code) {
    super(message);
    this.name = "ProjectIesError";
    this.code = code;
  }
}

function fail(message, code) {
  throw new ProjectIesError(message, code);
}

function hasOwn(value, key) {
  return Object.prototype.hasOwnProperty.call(value, key);
}

function requirePlainObject(value, name) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    fail(`${name} must be a plain object.`, "plain_object_required");
  }
  const prototype = Object.getPrototypeOf(value);
  if (prototype !== Object.prototype && prototype !== null) {
    fail(`${name} must be a plain object.`, "plain_object_required");
  }
  return value;
}

function singleLineText(value, name) {
  if (value == null || typeof value === "boolean" || typeof value === "object" || typeof value === "function") {
    fail(`${name} must be a non-empty scalar value.`, "invalid_project_value");
  }
  if (typeof value === "number" && !Number.isFinite(value)) {
    fail(`${name} must be finite.`, "invalid_project_value");
  }
  const text = String(value).trim();
  if (!text || /\r|\n/.test(text)) {
    fail(`${name} must be a non-empty single-line value.`, "invalid_project_value");
  }
  return text;
}

function validateProject(projectValue) {
  const project = requirePlainObject(projectValue, "project");
  for (const key of Object.keys(project)) {
    if (!PROJECT_FIELDS.includes(key)) {
      fail(`project.${key} is not supported.`, "unsupported_project_field");
    }
  }
  if (!hasOwn(project, "projectId")) {
    fail("project.projectId is required.", "project_id_required");
  }

  const selections = {};
  for (const key of SELECTION_FIELDS) {
    if (hasOwn(project, key)) selections[key] = singleLineText(project[key], `project.${key}`);
  }

  return {
    projectId: singleLineText(project.projectId, "project.projectId"),
    outputMultiplier: hasOwn(project, "outputMultiplier") ? project.outputMultiplier : 1,
    selections,
  };
}

function requireCanonicalGeneratedKeywords(generated) {
  if (!Array.isArray(generated.keywords) || generated.keywords.length !== CANONICAL_KEYWORDS.length) {
    fail("Generated project keywords do not match the canonical profile.", "invalid_generated_keywords");
  }
  for (let index = 0; index < CANONICAL_KEYWORDS.length; index += 1) {
    const row = generated.keywords[index];
    if (!row || normalizeKeywordName(row.key) !== CANONICAL_KEYWORDS[index]) {
      fail("Generated project keywords do not match the canonical profile.", "invalid_generated_keywords");
    }
  }
}

function projectProvenance(project, generated) {
  return {
    schema: "controlstack.project.ies-derivation.v1",
    projectId: project.projectId,
    referenceId: generated.provenance.referenceId,
    referenceKind: generated.provenance.referenceKind,
    referenceSha256: generated.provenance.referenceSha256,
    operation: "materialise-project-ies",
    runLengthMm: generated.runLengthMm,
    outputMultiplier: generated.outputMultiplier,
  };
}

export function buildProjectIes(reference, runLengthMm, project = {}) {
  try {
    const projectState = validateProject(project);
    const generated = buildIesFromReference(reference, {
      runLengthMm,
      outputMultiplier: projectState.outputMultiplier,
      selections: projectState.selections,
    });
    if (!generated.ok) return generated;
    requireCanonicalGeneratedKeywords(generated);

    return {
      ...generated,
      provenance: projectProvenance(projectState, generated),
    };
  } catch (error) {
    if (error instanceof ProjectIesError) {
      return { ok: false, code: error.code, reason: error.message };
    }
    return { ok: false, code: "project_generation_failed", reason: "Project IES generation failed closed." };
  }
}
