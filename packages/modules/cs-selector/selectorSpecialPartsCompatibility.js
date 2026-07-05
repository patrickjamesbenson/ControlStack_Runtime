const CHECK_PASS = "pass";
const CHECK_FAIL = "fail";
const CHECK_NOT_APPLICABLE = "not-applicable";
const CHECK_UNKNOWN = "unknown";

const CHECK_ORDER = Object.freeze(["system", "variant", "ipClass", "lifecycle"]);

function freezeResult(value) {
  if (!value || typeof value !== "object") return value;
  for (const key of Object.keys(value)) {
    if (value[key] && typeof value[key] === "object") freezeResult(value[key]);
  }
  return Object.freeze(value);
}

function normalizeToken(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9*]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function tokenMatches(left, right) {
  const leftKey = normalizeToken(left);
  const rightKey = normalizeToken(right);
  if (!leftKey || !rightKey) return false;
  return leftKey === rightKey || leftKey.startsWith(`${rightKey}_`) || rightKey.startsWith(`${leftKey}_`);
}

function sourceBackedCompatibilityPass(part = {}) {
  return [
    part.sourceBackedCompatibility,
    part.safeSourceCompatibility,
    part.sourceCompatibilityStatus,
  ].some((value) => ["compatible", "source_backed_compatible", "matched", "pass"].includes(normalizeToken(value)));
}

function readSelectedSystem(selectorSelectionContext = {}) {
  return normalizeToken(
    selectorSelectionContext.selectedSystem?.system
      || selectorSelectionContext.selectedSystem?.value
      || selectorSelectionContext.system
      || selectorSelectionContext.systemReferenceKey
      || selectorSelectionContext.selectedSystem
  );
}

function readSelectedVariant(selectorSelectionContext = {}) {
  return normalizeToken(
    selectorSelectionContext.selectedVariant?.key
      || selectorSelectionContext.selectedVariant?.token
      || selectorSelectionContext.selectedVariant?.value
      || selectorSelectionContext.selectedVariant
      || selectorSelectionContext.selectedSystem?.variantKey
      || selectorSelectionContext.variantKey
  );
}

function readSelectedIpClass(selectorSelectionContext = {}) {
  return String(
    selectorSelectionContext.environment?.ipClass
      || selectorSelectionContext.environment?.ip
      || selectorSelectionContext.ipClass
      || ""
  ).trim();
}

function splitCsvTokens(value) {
  return String(value || "")
    .split(/[,;|\n]+/)
    .map((item) => normalizeToken(item))
    .filter(Boolean);
}

function parseIpNumber(value) {
  const raw = String(value || "").trim();
  if (!raw) return null;
  const ipMatch = raw.match(/\bip\s*([0-9]{2})\b/i);
  const bareMatch = raw.match(/^\s*([0-9]{2})\s*$/);
  const digits = ipMatch?.[1] || bareMatch?.[1] || "";
  if (!digits) return null;
  const parsed = Number.parseInt(digits, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function valueLooksLikeIpRequirement(value) {
  const raw = String(value || "").trim();
  return /^\s*(?:ip\s*)?[0-9]{2}\s*$/i.test(raw);
}

function parseYmdDate(value) {
  const raw = String(value || "").trim();
  const match = raw.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return { raw, valid: false, timestamp: null };
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  const day = Number.parseInt(match[3], 10);
  const timestamp = Date.UTC(year, month - 1, day);
  const parsed = new Date(timestamp);
  const valid = parsed.getUTCFullYear() === year
    && parsed.getUTCMonth() === month - 1
    && parsed.getUTCDate() === day;
  return { raw, valid, timestamp: valid ? timestamp : null };
}

function todayTimestamp(selectorSelectionContext = {}) {
  const today = selectorSelectionContext.timeline?.today || selectorSelectionContext.today || "";
  const parsedToday = parseYmdDate(today);
  if (parsedToday.valid) return parsedToday.timestamp;
  const now = new Date();
  return Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
}

function evaluateSystemCheck(part = {}, selectorSelectionContext = {}) {
  const partSystem = normalizeToken(part.system);
  const selectedSystem = readSelectedSystem(selectorSelectionContext);
  if (sourceBackedCompatibilityPass(part)) {
    return {
      check: CHECK_PASS,
      reason: null,
      normalized: { partSystem, selectedSystem },
    };
  }
  if (!partSystem) {
    return {
      check: CHECK_NOT_APPLICABLE,
      reason: null,
      normalized: { partSystem, selectedSystem },
    };
  }
  if (!selectedSystem) {
    return {
      check: CHECK_UNKNOWN,
      reason: "selected-system-missing-for-constrained-special-part",
      normalized: { partSystem, selectedSystem },
    };
  }
  if (!tokenMatches(partSystem, selectedSystem)) {
    return {
      check: CHECK_FAIL,
      reason: "part-system-does-not-match-selected-system",
      normalized: { partSystem, selectedSystem },
    };
  }
  return {
    check: CHECK_PASS,
    reason: null,
    normalized: { partSystem, selectedSystem },
  };
}

function evaluateVariantCheck(part = {}, selectorSelectionContext = {}) {
  const partVariants = splitCsvTokens(part.variants_all);
  const selectedVariant = readSelectedVariant(selectorSelectionContext);
  if (sourceBackedCompatibilityPass(part)) {
    return {
      check: CHECK_PASS,
      reason: null,
      normalized: { partVariants, selectedVariant },
    };
  }
  if (!partVariants.length) {
    return {
      check: CHECK_NOT_APPLICABLE,
      reason: null,
      normalized: { partVariants, selectedVariant },
    };
  }
  if (partVariants.includes("*")) {
    return {
      check: CHECK_PASS,
      reason: null,
      normalized: { partVariants, selectedVariant },
    };
  }
  if (!selectedVariant) {
    return {
      check: CHECK_UNKNOWN,
      reason: "selected-variant-missing-for-constrained-special-part",
      normalized: { partVariants, selectedVariant },
    };
  }
  if (!partVariants.some((variant) => tokenMatches(variant, selectedVariant))) {
    return {
      check: CHECK_FAIL,
      reason: "part-variant-does-not-include-selected-variant",
      normalized: { partVariants, selectedVariant },
    };
  }
  return {
    check: CHECK_PASS,
    reason: null,
    normalized: { partVariants, selectedVariant },
  };
}

function evaluateIpClassCheck(part = {}, selectorSelectionContext = {}) {
  const partIpClass = String(part.ip_class || "").trim();
  const selectedIpClass = readSelectedIpClass(selectorSelectionContext);
  const partIpNumber = parseIpNumber(partIpClass);
  const selectedIpNumber = parseIpNumber(selectedIpClass);
  if (sourceBackedCompatibilityPass(part)) {
    return {
      check: CHECK_PASS,
      reason: null,
      normalized: { partIpClass: partIpNumber === null ? "" : String(partIpNumber), selectedIpClass: selectedIpNumber === null ? "" : String(selectedIpNumber) },
    };
  }
  if (!partIpClass) {
    return {
      check: CHECK_NOT_APPLICABLE,
      reason: null,
      normalized: { partIpClass: "", selectedIpClass: selectedIpNumber === null ? "" : String(selectedIpNumber) },
    };
  }
  if (partIpNumber === null) {
    return {
      check: valueLooksLikeIpRequirement(partIpClass) ? CHECK_UNKNOWN : CHECK_NOT_APPLICABLE,
      reason: valueLooksLikeIpRequirement(partIpClass) ? "part-ip-class-invalid" : null,
      normalized: { partIpClass: valueLooksLikeIpRequirement(partIpClass) ? partIpClass : "", selectedIpClass: selectedIpNumber === null ? "" : String(selectedIpNumber) },
    };
  }
  if (!selectedIpClass || selectedIpNumber === null) {
    return {
      check: CHECK_UNKNOWN,
      reason: "selected-ip-class-missing-for-constrained-special-part",
      normalized: { partIpClass: String(partIpNumber), selectedIpClass: selectedIpClass ? selectedIpClass : "" },
    };
  }
  if (partIpNumber < selectedIpNumber) {
    return {
      check: CHECK_FAIL,
      reason: "part-ip-class-below-selected-ip-requirement",
      normalized: { partIpClass: String(partIpNumber), selectedIpClass: String(selectedIpNumber) },
    };
  }
  return {
    check: CHECK_PASS,
    reason: null,
    normalized: { partIpClass: String(partIpNumber), selectedIpClass: String(selectedIpNumber) },
  };
}

function evaluateLifecycleCheck(part = {}, selectorSelectionContext = {}) {
  const effectiveTo = String(part.effective_to || part.effectiveTo || "").trim();
  if (sourceBackedCompatibilityPass(part)) {
    return {
      check: CHECK_PASS,
      reason: null,
      normalized: { effectiveTo },
    };
  }
  if (!effectiveTo) {
    return {
      check: CHECK_NOT_APPLICABLE,
      reason: null,
      normalized: { effectiveTo },
    };
  }
  const parsed = parseYmdDate(effectiveTo);
  if (!parsed.valid) {
    return {
      check: CHECK_UNKNOWN,
      reason: "special-part-expiry-date-invalid",
      normalized: { effectiveTo },
    };
  }
  if (parsed.timestamp < todayTimestamp(selectorSelectionContext)) {
    return {
      check: CHECK_FAIL,
      reason: "special-part-expired",
      normalized: { effectiveTo },
    };
  }
  return {
    check: CHECK_PASS,
    reason: null,
    normalized: { effectiveTo },
  };
}

function resultApplies(checks) {
  return CHECK_ORDER.every((key) => checks[key] === CHECK_PASS || checks[key] === CHECK_NOT_APPLICABLE);
}

function compactReasons(results) {
  return results.map((result) => result.reason).filter(Boolean);
}

export function evaluateSpecialPartCompatibility(part, selectorSelectionContext = {}) {
  if (!part || typeof part !== "object") {
    return freezeResult({
      applies: false,
      reasons: ["special-part-missing"],
      checks: {
        system: CHECK_UNKNOWN,
        variant: CHECK_UNKNOWN,
        ipClass: CHECK_UNKNOWN,
        lifecycle: CHECK_UNKNOWN,
      },
      normalized: {
        partSystem: "",
        selectedSystem: readSelectedSystem(selectorSelectionContext),
        partVariants: [],
        selectedVariant: readSelectedVariant(selectorSelectionContext),
        partIpClass: "",
        selectedIpClass: readSelectedIpClass(selectorSelectionContext),
        effectiveTo: "",
      },
    });
  }

  const system = evaluateSystemCheck(part, selectorSelectionContext);
  const variant = evaluateVariantCheck(part, selectorSelectionContext);
  const ipClass = evaluateIpClassCheck(part, selectorSelectionContext);
  const lifecycle = evaluateLifecycleCheck(part, selectorSelectionContext);
  const checks = {
    system: system.check,
    variant: variant.check,
    ipClass: ipClass.check,
    lifecycle: lifecycle.check,
  };

  return freezeResult({
    applies: resultApplies(checks),
    reasons: compactReasons([system, variant, ipClass, lifecycle]),
    checks,
    normalized: {
      partSystem: system.normalized.partSystem,
      selectedSystem: system.normalized.selectedSystem,
      partVariants: variant.normalized.partVariants,
      selectedVariant: variant.normalized.selectedVariant,
      partIpClass: ipClass.normalized.partIpClass,
      selectedIpClass: ipClass.normalized.selectedIpClass,
      effectiveTo: lifecycle.normalized.effectiveTo,
    },
  });
}

export function evaluateSpecialPartsCompatibility(parts, selectorSelectionContext = {}) {
  const safeParts = Array.isArray(parts) ? parts : [];
  return safeParts.map((part) => freezeResult({
    part,
    compatibility: evaluateSpecialPartCompatibility(part, selectorSelectionContext),
  }));
}
