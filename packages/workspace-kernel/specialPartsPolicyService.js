const SOURCE = "shell-special-parts-policy-service";

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function normalizeId(value) {
  return String(value || "").trim();
}

function normalizeIdKey(value) {
  return normalizeId(value).toLowerCase();
}

function readEmail({ identity = {}, authority = {} } = {}) {
  return normalizeEmail(
    identity.email
      || identity.currentUser?.email
      || authority.subject?.email
      || authority.identity?.email
  );
}

function firstArray(...values) {
  return values.find((value) => Array.isArray(value)) || null;
}

function splitComponentIds(value) {
  if (Array.isArray(value)) {
    return value.map(normalizeId).filter(Boolean);
  }
  return String(value || "")
    .split(/[,;|\n]+/)
    .map(normalizeId)
    .filter(Boolean);
}

function readComponentIdsFromUser(user = {}) {
  const keys = ["system_component_ids", "system_componrent_ids", "system_component_id"];
  for (const key of keys) {
    const ids = splitComponentIds(user[key]);
    if (ids.length) return { ids, sourceField: key };
  }
  return { ids: [], sourceField: "" };
}

function dedupeIds(ids = []) {
  const seen = new Set();
  const duplicateSeen = new Set();
  const userComponentIds = [];
  const duplicateComponentIds = [];
  for (const id of ids) {
    const normalized = normalizeId(id);
    if (!normalized) continue;
    const key = normalizeIdKey(normalized);
    if (seen.has(key)) {
      if (!duplicateSeen.has(key)) {
        duplicateSeen.add(key);
        duplicateComponentIds.push(normalized);
      }
      continue;
    }
    seen.add(key);
    userComponentIds.push(normalized);
  }
  return { userComponentIds, duplicateComponentIds };
}

function emptySnapshot(status, overrides = {}) {
  return {
    status,
    source: SOURCE,
    entitlementLive: false,
    userEmailMatched: false,
    userComponentIds: [],
    entitledParts: [],
    readOnly: true,
    validation: {
      blockers: [],
      warnings: [],
      unresolvedComponentIds: [],
      duplicateComponentIds: [],
    },
    ...overrides,
  };
}

function addWarning(validation, warning) {
  if (warning) validation.warnings.push(warning);
}

function componentRowKey(row = {}) {
  return normalizeIdKey(row.id || row.component_id || row.key);
}

function buildComponentIndex(rows = []) {
  const index = new Map();
  for (const row of rows) {
    const key = componentRowKey(row);
    if (key && !index.has(key)) index.set(key, row);
  }
  return index;
}

function readUserDescription(user = {}, index) {
  const descriptions = splitComponentIds(user.system_component_description || "");
  return descriptions[index] || String(user.system_component_description || "").trim();
}

function normalizeEntitledPart({ id, component, user, index }) {
  if (!component) {
    return {
      id,
      resolved: false,
      description: "",
      caveats: "Component row was not found in SYSTEM_COMPONENTS.",
    };
  }
  return {
    id,
    description: component.description || component.notes || readUserDescription(user, index) || "",
    status: component.status || "business_case",
    status_date: component.status_date || component.effective_to || "",
    effective_to: component.effective_to || "",
    type: component.type || "",
    system: component.system || "",
    variants_all: component.variants_all || "",
    ip_class: component.ip_class || "",
    width_mm: component.width_mm || component.thickness_mm || "",
    cost_buy_each: component.cost_buy_each || "",
    resolved: true,
    caveats: user.caveats || "",
  };
}

function findUserByEmail(users = [], email) {
  return users.find((user) => normalizeEmail(user?.email_login) === email) || null;
}

function createResolvedSnapshot({ user, userComponentIds, duplicateComponentIds, components }) {
  const validation = {
    blockers: [],
    warnings: [],
    unresolvedComponentIds: [],
    duplicateComponentIds,
  };
  const componentIndex = buildComponentIndex(components);
  const entitledParts = userComponentIds.map((id, index) => {
    const component = componentIndex.get(normalizeIdKey(id)) || null;
    if (!component) validation.unresolvedComponentIds.push(id);
    return normalizeEntitledPart({ id, component, user, index });
  });

  if (validation.duplicateComponentIds.length) addWarning(validation, "duplicate-component-ids-deduped");
  if (validation.unresolvedComponentIds.length) addWarning(validation, "component-rows-missing");

  return {
    status: validation.unresolvedComponentIds.length ? "resolved-with-warnings" : "resolved",
    source: SOURCE,
    entitlementLive: true,
    userEmailMatched: true,
    userComponentIds,
    entitledParts,
    readOnly: true,
    validation,
  };
}

export function createSpecialPartsPolicyService({ eventBus } = {}) {
  function getSpecialPartsEntitlementSnapshot({ identity = {}, authority = {}, referenceSnapshot = {} } = {}) {
    const email = readEmail({ identity, authority });
    if (!email) {
      const snapshot = emptySnapshot("no-email");
      eventBus?.emit?.("special-parts-policy:read", { specialPartsEntitlement: clone(snapshot) });
      return snapshot;
    }

    const users = firstArray(referenceSnapshot.USERS, referenceSnapshot.users);
    if (!users) {
      const snapshot = emptySnapshot("users-table-missing");
      eventBus?.emit?.("special-parts-policy:read", { specialPartsEntitlement: clone(snapshot) });
      return snapshot;
    }

    const user = findUserByEmail(users, email);
    if (!user) {
      const snapshot = emptySnapshot("user-not-matched");
      eventBus?.emit?.("special-parts-policy:read", { specialPartsEntitlement: clone(snapshot) });
      return snapshot;
    }

    const { ids } = readComponentIdsFromUser(user);
    const { userComponentIds, duplicateComponentIds } = dedupeIds(ids);
    if (!userComponentIds.length) {
      const snapshot = emptySnapshot("no-component-ids", {
        userEmailMatched: true,
        validation: {
          blockers: [],
          warnings: duplicateComponentIds.length ? ["duplicate-component-ids-deduped"] : [],
          unresolvedComponentIds: [],
          duplicateComponentIds,
        },
      });
      eventBus?.emit?.("special-parts-policy:read", { specialPartsEntitlement: clone(snapshot) });
      return snapshot;
    }

    const components = firstArray(referenceSnapshot.SYSTEM_COMPONENTS, referenceSnapshot.system_components);
    if (!components) {
      const snapshot = emptySnapshot("system-components-table-missing", {
        userEmailMatched: true,
        userComponentIds,
        validation: {
          blockers: [],
          warnings: ["system-components-table-missing"].concat(duplicateComponentIds.length ? ["duplicate-component-ids-deduped"] : []),
          unresolvedComponentIds: [...userComponentIds],
          duplicateComponentIds,
        },
      });
      eventBus?.emit?.("special-parts-policy:read", { specialPartsEntitlement: clone(snapshot) });
      return snapshot;
    }

    const snapshot = createResolvedSnapshot({ user, userComponentIds, duplicateComponentIds, components });
    eventBus?.emit?.("special-parts-policy:read", { specialPartsEntitlement: clone(snapshot) });
    return snapshot;
  }

  return {
    owner: "shell",
    status: "ready",
    source: SOURCE,
    getSpecialPartsEntitlementSnapshot,
  };
}
