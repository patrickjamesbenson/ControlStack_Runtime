const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);
const IDENTITY_STATES = Object.freeze(["external_anonymous", "external_identified", "internal_identified"]);

const TEST_IDENTITIES = Object.freeze([
  Object.freeze({
    id: "anonymous-visitor",
    label: "Anonymous visitor",
    name: "Anonymous visitor",
    email: "",
    identityState: "external_anonymous",
    classification: "anonymous",
    actualRole: "external_user",
    company: "",
    source: "phase-8a-fixture-identity-lookup",
  }),
  Object.freeze({
    id: "external-client",
    label: "External client",
    name: "External Client",
    email: "client@example.com",
    identityState: "external_identified",
    classification: "external",
    actualRole: "external_user",
    company: "Client Company",
    source: "phase-8a-fixture-identity-lookup",
  }),
  Object.freeze({
    id: "internal-user",
    label: "Internal user",
    name: "Internal User",
    email: "internal@controlstack.local",
    identityState: "internal_identified",
    classification: "internal",
    actualRole: "internal_user",
    company: "ControlStack",
    source: "phase-8a-fixture-identity-lookup",
  }),
  Object.freeze({
    id: "internal-engineer",
    label: "Internal engineer",
    name: "Internal Engineer",
    email: "engineer@controlstack.local",
    identityState: "internal_identified",
    classification: "internal",
    actualRole: "internal_engineer",
    company: "ControlStack",
    source: "phase-8a-fixture-identity-lookup",
  }),
  Object.freeze({
    id: "developer",
    label: "Developer",
    name: "Developer User",
    email: "developer@controlstack.local",
    identityState: "internal_identified",
    classification: "internal",
    actualRole: "developer",
    company: "ControlStack",
    source: "phase-8a-fixture-identity-lookup",
  }),
  Object.freeze({
    id: "admin",
    label: "Admin",
    name: "Admin User",
    email: "admin@controlstack.local",
    identityState: "internal_identified",
    classification: "internal",
    actualRole: "admin",
    company: "ControlStack",
    source: "phase-8a-fixture-identity-lookup",
  }),
]);

function createSubscriptionSet() {
  const listeners = new Set();
  return {
    subscribe(handler) {
      listeners.add(handler);
      return () => listeners.delete(handler);
    },
    notify(snapshot) {
      for (const handler of listeners) handler(snapshot);
    },
  };
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function roleRank(role) {
  const index = ROLE_ORDER.indexOf(role);
  return index < 0 ? 0 : index;
}

function normaliseRole(role, fallback = "external_user") {
  return ROLE_ORDER.includes(role) ? role : fallback;
}

function normaliseIdentityState(identityState, fallback = "external_anonymous") {
  return IDENTITY_STATES.includes(identityState) ? identityState : fallback;
}

function roleCapabilities(role) {
  const rank = roleRank(role);
  const capabilities = ["workspace:view"];
  if (rank >= roleRank("external_user")) capabilities.push("module:cs_selector:view");
  if (rank >= roleRank("internal_user")) capabilities.push("module:emergence:view");
  if (rank >= roleRank("internal_engineer")) capabilities.push("workspace:visibility:test");
  if (rank >= roleRank("developer")) capabilities.push("workspace:developer-preview");
  if (rank >= roleRank("admin")) capabilities.push("workspace:admin-preview");
  return capabilities;
}

function clampDisplayRole(actualRole, requestedRole) {
  const actual = normaliseRole(actualRole);
  const requested = normaliseRole(requestedRole, actual);
  if (roleRank(requested) > roleRank(actual)) return actual;
  return requested;
}

function identityFromFixture(fixture, overrideState, requestedDisplayRole) {
  const derivedActualRole = normaliseRole(fixture.actualRole);
  const overrideEnabled = overrideState.enabled === true;
  const effectiveActualRole = overrideEnabled ? normaliseRole(overrideState.role, derivedActualRole) : derivedActualRole;
  const displayRole = clampDisplayRole(effectiveActualRole, requestedDisplayRole || effectiveActualRole);
  const identityState = normaliseIdentityState(fixture.identityState);
  return {
    id: fixture.id,
    label: fixture.label,
    name: fixture.name,
    email: fixture.email,
    company: fixture.company,
    identityState,
    classification: fixture.classification,
    derivedActualRole,
    actualRole: effectiveActualRole,
    actualRoleSource: overrideEnabled ? "phase-8a-temporary-developer-override" : fixture.source,
    actualRoleDerived: overrideEnabled ? false : true,
    actualRoleOverrideEnabled: overrideEnabled,
    actualRoleOverride: overrideEnabled ? effectiveActualRole : null,
    displayRole,
    displayRoleRequested: requestedDisplayRole || effectiveActualRole,
    displayRoleClamped: displayRole !== (requestedDisplayRole || effectiveActualRole),
    source: fixture.source,
  };
}

export function createIdentityService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const overrideState = { enabled: false, role: null };
  const initialIdentity = identityFromFixture(TEST_IDENTITIES[1], overrideState, "external_user");
  const state = {
    owner: "shell",
    status: "lookup-ready",
    source: "phase-8a-shell-owned-identity-resolver",
    mode: "identity-lookup-derived-role-visibility-support",
    note: "Not real auth. Phase 8A derives actual role from selected identity by default; developer override is temporary and off by default.",
    selectedIdentityId: initialIdentity.id,
    overrideState,
    identity: initialIdentity,
    availableIdentities: TEST_IDENTITIES.map(clone),
  };

  function selectedFixture() {
    return state.availableIdentities.find((item) => item.id === state.selectedIdentityId) || state.availableIdentities[0];
  }

  function rebuildIdentity(requestedDisplayRole = state.identity.displayRole) {
    state.identity = identityFromFixture(selectedFixture(), state.overrideState, requestedDisplayRole);
  }

  function snapshot() {
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      mode: state.mode,
      note: state.note,
      auth: {
        realAuth: false,
        credentialAuth: false,
        sessionRestore: false,
        hardening: "deferred",
      },
      lookup: {
        owner: "shell",
        status: "fixture-lookup",
        source: state.source,
        selectedIdentityId: state.selectedIdentityId,
        availableIdentities: state.availableIdentities.map(clone),
      },
      resolver: {
        owner: "shell",
        status: "derived-from-identity",
        derivedActualRole: state.identity.derivedActualRole,
        effectiveActualRole: state.identity.actualRole,
        actualRoleSource: state.identity.actualRoleSource,
        actualRoleDerived: state.identity.actualRoleDerived,
        overrideEnabled: state.identity.actualRoleOverrideEnabled,
        overrideRole: state.identity.actualRoleOverride,
        overrideLabel: "Temporary developer actual-role override; not final donor-like role resolution.",
      },
      currentUser: {
        id: state.identity.id,
        name: state.identity.name,
        email: state.identity.email || null,
        handle: null,
        company: state.identity.company || null,
      },
      identityState: state.identity.identityState,
      classification: state.identity.classification,
      derivedActualRole: state.identity.derivedActualRole,
      actualRole: state.identity.actualRole,
      actualRoleSource: state.identity.actualRoleSource,
      actualRoleDerived: state.identity.actualRoleDerived,
      actualRoleOverrideEnabled: state.identity.actualRoleOverrideEnabled,
      actualRoleOverride: state.identity.actualRoleOverride,
      displayRole: state.identity.displayRole,
      displayRoleRequested: state.identity.displayRoleRequested,
      displayRoleClamped: state.identity.displayRoleClamped,
      role: state.identity.displayRole,
      capabilities: roleCapabilities(state.identity.displayRole),
      actualCapabilities: roleCapabilities(state.identity.actualRole),
      roleOrder: [...ROLE_ORDER],
      identityStates: [...IDENTITY_STATES],
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("identity:changed", { reason, identity: nextSnapshot });
    return nextSnapshot;
  }

  function setIdentityById(identityId, reason = "phase-8a-identity-selected") {
    const fixture = state.availableIdentities.find((item) => item.id === identityId);
    if (!fixture) {
      return { accepted: false, reason: `Unknown identity id: ${identityId}`, identity: snapshot() };
    }
    state.selectedIdentityId = fixture.id;
    state.overrideState.enabled = false;
    state.overrideState.role = null;
    rebuildIdentity(fixture.actualRole);
    return { accepted: true, identity: notify(reason) };
  }

  function setActualRoleOverrideEnabled(enabled, reason = "phase-8a-actual-role-override-toggle") {
    state.overrideState.enabled = enabled === true;
    if (!state.overrideState.enabled) state.overrideState.role = null;
    if (state.overrideState.enabled && !state.overrideState.role) state.overrideState.role = selectedFixture().actualRole;
    rebuildIdentity(state.identity.displayRoleRequested);
    return {
      accepted: true,
      clamped: state.identity.displayRoleClamped,
      identity: notify(reason),
    };
  }

  function setActualRoleOverride(actualRole, reason = "phase-8a-actual-role-override-selected") {
    state.overrideState.enabled = true;
    state.overrideState.role = normaliseRole(actualRole, selectedFixture().actualRole);
    rebuildIdentity(state.identity.displayRoleRequested);
    return {
      accepted: true,
      clamped: state.identity.displayRoleClamped,
      identity: notify(reason),
    };
  }

  function setDisplayRole(displayRole, reason = "phase-8a-display-role-selected") {
    const nextRole = normaliseRole(displayRole, state.identity.actualRole);
    rebuildIdentity(nextRole);
    return {
      accepted: true,
      clamped: state.identity.displayRoleClamped,
      identity: notify(reason),
    };
  }

  return {
    owner: state.owner,
    status: state.status,
    getIdentitySnapshot: snapshot,
    getAvailableIdentities() {
      return state.availableIdentities.map(clone);
    },
    getRoleOptions() {
      return [...ROLE_ORDER];
    },
    getIdentityStateOptions() {
      return [...IDENTITY_STATES];
    },
    getCurrentUser() {
      return { ...snapshot().currentUser };
    },
    getRole() {
      return state.identity.displayRole;
    },
    hasCapability(capabilityId) {
      return snapshot().capabilities.includes(capabilityId);
    },
    setIdentityById,
    setActualRoleOverrideEnabled,
    setActualRoleOverride,
    setActualRole(actualRole, reason = "phase-8a-legacy-override-compat") {
      return setActualRoleOverride(actualRole, reason);
    },
    setDisplayRole,
    setPlaceholderUser(nextUser = {}, reason = "phase-8a-compat-placeholder-update") {
      state.identity = {
        ...state.identity,
        name: nextUser.name || state.identity.name,
        email: nextUser.email || state.identity.email,
      };
      return notify(reason);
    },
    subscribe: subscriptions.subscribe,
  };
}
