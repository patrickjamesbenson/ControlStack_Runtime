const ROLE_ORDER = Object.freeze(["external_user", "internal_user", "internal_engineer", "developer", "admin"]);
const IDENTITY_STATES = Object.freeze(["external_anonymous", "external_identified", "internal_identified"]);
const IDENTITY_MODES = Object.freeze(["auth-session", "developer-fixture", "anonymous-fallback"]);

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
    source: "developer-fixture-identity-support",
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
    source: "developer-fixture-identity-support",
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
    source: "developer-fixture-identity-support",
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
    source: "developer-fixture-identity-support",
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
    source: "developer-fixture-identity-support",
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
    source: "developer-fixture-identity-support",
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
  if (rank >= roleRank("internal_user")) capabilities.push("module:scene_builder:view");
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

function fixtureById(availableIdentities, identityId) {
  return availableIdentities.find((item) => item.id === identityId) || availableIdentities[0];
}

function anonymousFixture(availableIdentities) {
  return fixtureById(availableIdentities, "anonymous-visitor");
}

function normaliseIdentityMode(mode, fallback = "anonymous-fallback") {
  return IDENTITY_MODES.includes(mode) ? mode : fallback;
}

function identitySeedFromAuth(authSnapshot) {
  const user = authSnapshot?.user || {};
  return {
    id: user.id || "anonymous-visitor",
    label: user.name || "Anonymous visitor",
    name: user.name || "Anonymous visitor",
    email: user.email || "",
    identityState: user.identityState || "external_anonymous",
    classification: user.classification || "anonymous",
    actualRole: user.actualRole || "external_user",
    company: user.company || "",
  };
}

function identityModeFromAuth(authSnapshot) {
  return authSnapshot?.session?.authenticated === true ? "auth-session" : "anonymous-fallback";
}

function buildIdentity({ rawIdentity, overrideState, requestedDisplayRole, source, identitySource, lookupStatus, identityMode }) {
  const derivedActualRole = normaliseRole(rawIdentity.actualRole);
  const overrideEnabled = overrideState.enabled === true;
  const effectiveActualRole = overrideEnabled ? normaliseRole(overrideState.role, derivedActualRole) : derivedActualRole;
  const displayRole = clampDisplayRole(effectiveActualRole, requestedDisplayRole || effectiveActualRole);
  const identityState = normaliseIdentityState(rawIdentity.identityState);
  return {
    id: rawIdentity.id,
    label: rawIdentity.label || rawIdentity.name,
    name: rawIdentity.name,
    email: rawIdentity.email || "",
    company: rawIdentity.company || "",
    identityState,
    classification: rawIdentity.classification || "anonymous",
    derivedActualRole,
    actualRole: effectiveActualRole,
    actualRoleSource: overrideEnabled ? "developer-test-actual-role-override" : source,
    actualRoleDerived: overrideEnabled ? false : true,
    actualRoleOverrideEnabled: overrideEnabled,
    actualRoleOverride: overrideEnabled ? effectiveActualRole : null,
    displayRole,
    displayRoleRequested: requestedDisplayRole || effectiveActualRole,
    displayRoleClamped: displayRole !== (requestedDisplayRole || effectiveActualRole),
    source,
    identitySource,
    lookupStatus,
    identityMode,
  };
}

export function createIdentityService({ authService, eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const overrideState = { enabled: false, role: null };
  const initialAuth = authService?.getAuthSnapshot?.() || null;
  const initialMode = identityModeFromAuth(initialAuth);
  const state = {
    owner: "shell",
    status: "auth-derived-identity-ready",
    source: "real-login-auth-identity-resolver",
    mode: "single-source-auth-fixture-or-anonymous",
    note: "Authenticated session is the default identity source. Developer fixture, actual-role override, and display-role preview are support tools only.",
    identityMode: initialMode,
    selectedIdentityId: initialMode === "developer-fixture" ? "anonymous-visitor" : null,
    overrideState,
    requestedDisplayRole: initialMode === "auth-session" ? initialAuth.user.actualRole : "external_user",
    identity: null,
    availableIdentities: TEST_IDENTITIES.map(clone),
  };

  function currentAuthSnapshot() {
    return authService?.getAuthSnapshot?.() || {
      owner: "shell",
      status: "signed-out",
      live: true,
      source: "real-login-auth",
      session: { authenticated: false },
      user: {
        id: "anonymous-visitor",
        name: "Anonymous visitor",
        email: null,
        classification: "anonymous",
        identityState: "external_anonymous",
        actualRole: "external_user",
        company: null,
        authSource: "fallback",
      },
    };
  }

  function selectedFixture() {
    return fixtureById(state.availableIdentities, state.selectedIdentityId);
  }

  function resolveIdentitySource(auth) {
    const signedIn = auth.session?.authenticated === true;
    let identityMode = normaliseIdentityMode(state.identityMode);
    if (identityMode === "auth-session" && !signedIn) identityMode = "anonymous-fallback";
    state.identityMode = identityMode;

    if (identityMode === "auth-session") {
      return {
        rawIdentity: identitySeedFromAuth(auth),
        source: "real-login-auth-session",
        identitySource: "auth-session",
        lookupStatus: "auth-session-derived",
        selectedIdentityId: null,
      };
    }

    if (identityMode === "developer-fixture") {
      const fixture = selectedFixture();
      return {
        rawIdentity: fixture,
        source: fixture.source,
        identitySource: signedIn ? "developer-fixture-support-over-signed-in-session" : "developer-fixture-support",
        lookupStatus: "developer-fixture-support",
        selectedIdentityId: fixture.id,
      };
    }

    const fallback = anonymousFixture(state.availableIdentities);
    return {
      rawIdentity: fallback,
      source: "anonymous-fallback",
      identitySource: "anonymous-fallback",
      lookupStatus: "anonymous-fallback",
      selectedIdentityId: "anonymous-visitor",
    };
  }

  function rebuildIdentity(requestedDisplayRole = state.requestedDisplayRole) {
    const auth = currentAuthSnapshot();
    const resolved = resolveIdentitySource(auth);
    state.selectedIdentityId = resolved.selectedIdentityId;
    state.requestedDisplayRole = requestedDisplayRole || resolved.rawIdentity.actualRole;
    state.identity = buildIdentity({
      rawIdentity: resolved.rawIdentity,
      overrideState: state.overrideState,
      requestedDisplayRole: state.requestedDisplayRole,
      source: resolved.source,
      identitySource: resolved.identitySource,
      lookupStatus: resolved.lookupStatus,
      identityMode: state.identityMode,
    });
  }

  rebuildIdentity(state.requestedDisplayRole);

  function snapshot() {
    const auth = currentAuthSnapshot();
    const realAuth = auth.session?.authenticated === true;
    return {
      owner: state.owner,
      status: state.status,
      source: state.source,
      mode: state.mode,
      note: state.note,
      auth: {
        owner: auth.owner || "shell",
        status: auth.status || "signed-out",
        live: auth.live === true,
        realAuth,
        credentialAuth: realAuth,
        sessionRestore: true,
        source: auth.source || "real-login-auth",
        provider: auth.session?.provider || null,
        sessionId: auth.session?.sessionId || null,
        userId: auth.session?.userId || null,
        signedInName: auth.session?.name || null,
        signedInEmail: auth.session?.email || null,
        hardening: "local-session-foundation-only",
      },
      lookup: {
        owner: "shell",
        status: state.identity.lookupStatus,
        source: state.identity.source,
        identityMode: state.identity.identityMode,
        identitySource: state.identity.identitySource,
        selectedIdentityId: state.selectedIdentityId,
        usingDeveloperFixture: state.identity.identityMode === "developer-fixture",
        safeAnonymousFallback: state.identity.identityMode === "anonymous-fallback",
        availableIdentities: state.availableIdentities.map(clone),
      },
      resolver: {
        owner: "shell",
        status: "derived-from-current-identity-source",
        derivedActualRole: state.identity.derivedActualRole,
        effectiveActualRole: state.identity.actualRole,
        actualRoleSource: state.identity.actualRoleSource,
        actualRoleDerived: state.identity.actualRoleDerived,
        overrideEnabled: state.identity.actualRoleOverrideEnabled,
        overrideRole: state.identity.actualRoleOverride,
        overrideLabel: "Developer/test actual-role override only. Not real auth authority.",
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
      identityModes: [...IDENTITY_MODES],
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("identity:changed", { reason, identity: nextSnapshot });
    return nextSnapshot;
  }

  function clearDeveloperOverride() {
    state.overrideState.enabled = false;
    state.overrideState.role = null;
  }

  function setIdentityById(identityId, reason = "developer-fixture-identity-selected") {
    const fixture = state.availableIdentities.find((item) => item.id === identityId);
    if (!fixture) {
      return { accepted: false, reason: `Unknown identity id: ${identityId}`, identity: snapshot() };
    }
    state.identityMode = "developer-fixture";
    state.selectedIdentityId = fixture.id;
    clearDeveloperOverride();
    rebuildIdentity(fixture.actualRole);
    return { accepted: true, identity: notify(reason) };
  }

  function useAuthenticatedIdentity(reason = "real-login-auth-use-session-identity") {
    const auth = currentAuthSnapshot();
    state.identityMode = auth.session?.authenticated === true ? "auth-session" : "anonymous-fallback";
    state.selectedIdentityId = state.identityMode === "anonymous-fallback" ? "anonymous-visitor" : null;
    clearDeveloperOverride();
    rebuildIdentity(auth.user?.actualRole || "external_user");
    return { accepted: true, identity: notify(reason) };
  }

  function syncFromAuth(reason = "real-login-auth-session-changed") {
    const auth = currentAuthSnapshot();
    if (auth.session?.authenticated === true && state.identityMode !== "developer-fixture") {
      state.identityMode = "auth-session";
      state.selectedIdentityId = null;
      clearDeveloperOverride();
      rebuildIdentity(auth.user?.actualRole || "external_user");
      return notify(reason);
    }

    if (auth.session?.authenticated !== true) {
      state.identityMode = "anonymous-fallback";
      state.selectedIdentityId = "anonymous-visitor";
      clearDeveloperOverride();
      rebuildIdentity("external_user");
      return notify(reason);
    }

    rebuildIdentity(state.identity.displayRoleRequested);
    return notify(reason);
  }

  function setActualRoleOverrideEnabled(enabled, reason = "developer-test-actual-role-override-toggle") {
    state.overrideState.enabled = enabled === true;
    if (!state.overrideState.enabled) state.overrideState.role = null;
    if (state.overrideState.enabled && !state.overrideState.role) state.overrideState.role = state.identity.derivedActualRole;
    rebuildIdentity(state.identity.displayRoleRequested);
    return {
      accepted: true,
      clamped: state.identity.displayRoleClamped,
      identity: notify(reason),
    };
  }

  function setActualRoleOverride(actualRole, reason = "developer-test-actual-role-override-selected") {
    state.overrideState.enabled = true;
    state.overrideState.role = normaliseRole(actualRole, state.identity.derivedActualRole);
    rebuildIdentity(state.identity.displayRoleRequested);
    return {
      accepted: true,
      clamped: state.identity.displayRoleClamped,
      identity: notify(reason),
    };
  }

  function setDisplayRole(displayRole, reason = "display-role-preview-selected") {
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
    useAuthenticatedIdentity,
    syncFromAuth,
    setActualRoleOverrideEnabled,
    setActualRoleOverride,
    setActualRole(actualRole, reason = "developer-test-legacy-override-compat") {
      return setActualRoleOverride(actualRole, reason);
    },
    setDisplayRole,
    setPlaceholderUser(nextUser = {}, reason = "compat-placeholder-update") {
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
