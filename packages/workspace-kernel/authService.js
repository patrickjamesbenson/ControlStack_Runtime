const AUTH_STORAGE_KEY = "controlstack.runtime.auth.v1";

const AUTH_USERS = Object.freeze([
  Object.freeze({
    id: "patrick-benson",
    label: "Patrick Benson",
    name: "Patrick Benson",
    email: "patrick.james.benson@gmail.com",
    classification: "internal",
    identityState: "internal_identified",
    actualRole: "developer",
    company: "ControlStack",
    provider: "local-dev",
  }),
  Object.freeze({
    id: "patrick-benson-novonlighting",
    label: "Patrick Benson · Novon Lighting",
    name: "Patrick Benson",
    email: "patrick@novonlighting.com.au",
    classification: "internal",
    identityState: "internal_identified",
    actualRole: "external_user",
    company: "Novon Lighting",
    provider: "local-dev",
  }),
  Object.freeze({
    id: "internal-user",
    label: "Internal user",
    name: "Internal User",
    email: "internal@controlstack.local",
    classification: "internal",
    identityState: "internal_identified",
    actualRole: "internal_user",
    company: "ControlStack",
    provider: "local-dev",
  }),
  Object.freeze({
    id: "external-client",
    label: "External client",
    name: "External Client",
    email: "client@example.com",
    classification: "external",
    identityState: "external_identified",
    actualRole: "external_user",
    company: "Client Company",
    provider: "local-dev",
  }),
]);

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function isoNow() {
  return new Date().toISOString();
}

function sessionIdFor(userId) {
  return `session-${userId}-${Date.now()}`;
}

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readStoredSession() {
  if (!canUseStorage()) return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredSession(session) {
  if (!canUseStorage()) return;
  try {
    if (session) window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    else window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Storage failure must not break shell boot.
  }
}

function findUser(userId) {
  return AUTH_USERS.find((user) => user.id === userId) || AUTH_USERS[0];
}

function createSignedOutState(reason = "No authenticated session.") {
  return {
    owner: "shell",
    status: "signed-out",
    live: true,
    source: "real-login-auth",
    reason,
    session: {
      authenticated: false,
      sessionId: null,
      userId: null,
      email: null,
      name: null,
      provider: null,
      issuedAt: null,
      expiresAt: null,
    },
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

function createSignedInState(user, existingSession = null) {
  const issuedAt = existingSession?.issuedAt || isoNow();
  const expiresAt = existingSession?.expiresAt || null;
  const sessionId = existingSession?.sessionId || sessionIdFor(user.id);
  return {
    owner: "shell",
    status: "signed-in",
    live: true,
    source: "real-login-auth",
    reason: "Authenticated shell session established.",
    session: {
      authenticated: true,
      sessionId,
      userId: user.id,
      email: user.email || null,
      name: user.name,
      provider: user.provider || "local-dev",
      issuedAt,
      expiresAt,
    },
    user: {
      id: user.id,
      name: user.name,
      email: user.email || null,
      classification: user.classification,
      identityState: user.identityState,
      actualRole: user.actualRole,
      company: user.company || null,
      authSource: "session",
    },
  };
}

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

export function createAuthService({ eventBus } = {}) {
  const subscriptions = createSubscriptionSet();
  const storedSession = readStoredSession();
  const storedUser = storedSession?.authenticated ? findUser(storedSession.userId) : null;
  const state = storedUser ? createSignedInState(storedUser, storedSession) : createSignedOutState();

  function snapshot() {
    return {
      ...clone(state),
      availableUsers: AUTH_USERS.map((user) => ({
        id: user.id,
        label: user.label,
        email: user.email,
        classification: user.classification,
        identityState: user.identityState,
        actualRole: user.actualRole,
        provider: user.provider,
      })),
      capabilities: {
        signIn: true,
        signOut: true,
        restoreSession: true,
        developerIdentityPreview: true,
        actualRoleOverride: true,
        displayRolePreview: true,
      },
      exclusions: {
        oauthProvider: "deferred",
        passwordStorage: "excluded",
        productionCredentialDatabase: "excluded",
        magicLinks: "deferred",
        mfa: "deferred",
        hubspotWrites: "deferred",
      },
    };
  }

  function notify(reason) {
    const nextSnapshot = snapshot();
    subscriptions.notify(nextSnapshot);
    eventBus?.emit("auth:changed", { reason, auth: nextSnapshot });
    return nextSnapshot;
  }

  function signIn(userId = AUTH_USERS[0].id, reason = "real-login-auth-sign-in") {
    const user = findUser(userId);
    const nextState = createSignedInState(user);
    Object.assign(state, nextState);
    writeStoredSession(state.session);
    return {
      accepted: true,
      status: state.status,
      session: clone(state.session),
      user: clone(state.user),
      auth: notify(reason),
      reason: "Authenticated shell session established.",
    };
  }

  function signOut(reason = "real-login-auth-sign-out") {
    const nextState = createSignedOutState("Signed out. Shell is using safe anonymous fallback.");
    Object.assign(state, nextState);
    writeStoredSession(null);
    return {
      accepted: true,
      status: state.status,
      session: clone(state.session),
      user: clone(state.user),
      auth: notify(reason),
      reason: "Signed out. Shell is using safe anonymous fallback.",
    };
  }

  function restoreSession(reason = "real-login-auth-restore-session") {
    const session = readStoredSession();
    if (!session?.authenticated) return signOut(reason);
    return signIn(session.userId, reason);
  }

  return {
    owner: "shell",
    status: state.status,
    getAuthSnapshot: snapshot,
    getAvailableAuthUsers() {
      return snapshot().availableUsers;
    },
    signIn,
    signOut,
    restoreSession,
    subscribe: subscriptions.subscribe,
  };
}
