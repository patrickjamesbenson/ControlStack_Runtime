import { stableFingerprint } from "./stableFingerprint.js";

export const SELECTOR_READINESS_STATE_ENTRY_PUSH_SCHEMA_ID =
  "controlstack.selector.readiness-state-entry-push-intent.v1";
export const SELECTOR_READINESS_STATE_ENTRY_PUSH_SCHEMA_VERSION = 1;
export const SELECTOR_READINESS_STATE_ENTRY_PUSH_EVENT =
  "selector:readiness-state-entry-push-intent";

const STATE_DEFINITIONS = Object.freeze([
  Object.freeze({ key: "specReady", state: "spec_ready", label: "Spec Ready" }),
  Object.freeze({ key: "buildReady", state: "build_ready", label: "Build Ready" }),
]);

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function boundedToken(value, fallback = "unbound") {
  const token = String(value ?? "").trim();
  if (!token) return fallback;
  if (
    token.length > 180
    || /[\u0000-\u001f\\/]/.test(token)
    || /^(?:https?|file|blob|data):/i.test(token)
  ) return fallback;
  return token;
}

function safeContext(context = {}) {
  return Object.freeze({
    projectId: boundedToken(context.projectId, "project-unbound"),
    sourceInputFingerprint: boundedToken(context.sourceInputFingerprint),
    selectorStateFingerprint: boundedToken(context.selectorStateFingerprint),
    referenceOptionsFingerprint: boundedToken(context.referenceOptionsFingerprint),
    boardDataSourceVersion: boundedToken(context.boardDataSourceVersion),
  });
}

function readinessSnapshot({ specReady = false, buildReady = false } = {}) {
  const safeSpecReady = specReady === true;
  return Object.freeze({
    specReady: safeSpecReady,
    buildReady: safeSpecReady && buildReady === true,
  });
}

function createIntent(definition, ordinal, context) {
  const technicalContext = safeContext(context);
  const transitionIdentity = stableFingerprint(
    "selector-readiness-transition",
    {
      state: definition.state,
      ordinal,
      technicalContext,
    },
  );
  return deepFreeze({
    schemaId: SELECTOR_READINESS_STATE_ENTRY_PUSH_SCHEMA_ID,
    schemaVersion: SELECTOR_READINESS_STATE_ENTRY_PUSH_SCHEMA_VERSION,
    event: SELECTOR_READINESS_STATE_ENTRY_PUSH_EVENT,
    state: definition.state,
    stateLabel: definition.label,
    transition: "false_to_true",
    transitionOrdinal: ordinal,
    transitionIdentity,
    technicalContext,
    providerMutationRequested: false,
    persistenceRequested: false,
    identityLookupRequested: false,
    retryRequested: false,
    writes: false,
  });
}

export function createSelectorReadinessStateEntryPushTracker({ onIntent } = {}) {
  let initialised = false;
  let previous = readinessSnapshot();
  const ordinals = { specReady: 0, buildReady: 0 };

  function evaluate({ specReady = false, buildReady = false, baselineOnly = false, context = {} } = {}) {
    const current = readinessSnapshot({ specReady, buildReady });
    if (!initialised || baselineOnly === true) {
      initialised = true;
      previous = current;
      return deepFreeze({
        state: "baseline_recorded",
        current,
        intents: [],
        emittedCount: 0,
        writes: false,
      });
    }

    const intents = [];
    for (const definition of STATE_DEFINITIONS) {
      if (previous[definition.key] === false && current[definition.key] === true) {
        ordinals[definition.key] += 1;
        intents.push(createIntent(definition, ordinals[definition.key], context));
      }
    }
    previous = current;
    for (const intent of intents) onIntent?.(intent);

    return deepFreeze({
      state: intents.length ? "state_entry_intent_emitted" : "no_state_entry",
      current,
      intents,
      emittedCount: intents.length,
      writes: false,
    });
  }

  return Object.freeze({ evaluate });
}
