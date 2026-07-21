export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_ID =
  "controlstack.governance.data-retrieval-gateway-view-state.v1";
export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_VERSION = 1;
export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_CONTRACT_ID =
  "GOVERNANCE-DATA-RETRIEVAL-GATEWAY-VIEW-STATE-1";
export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OWNER = "governance-shell";
export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_ID = "governance-data-retrieval";

export const GOVERNANCE_DATA_RETRIEVAL_READINESS_LABELS = Object.freeze([
  "Spec Ready",
  "Build Ready",
  "Factory Ready",
]);

export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES = Object.freeze({
  noUsefulOutput: "no-useful-output",
  projectRequired: "project-required",
  identityRequired: "identity-required",
  readyForFutureRetrieval: "ready-for-future-retrieval",
});

export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_INPUT_FIELD_ORDER = Object.freeze([
  "moduleId",
  "moduleLabel",
  "outputId",
  "outputLabel",
  "outputDescription",
  "readinessLabel",
  "projectContextPresent",
  "identityCapturePresent",
  "discoveryDescriptions",
]);

export const GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OUTPUT_FIELD_ORDER = Object.freeze([
  "schemaId",
  "schemaVersion",
  "contractId",
  "owner",
  "gatewayId",
  "state",
  "failClosed",
  "blocker",
  "moduleId",
  "moduleLabel",
  "outputId",
  "outputLabel",
  "outputDescription",
  "readinessLabel",
  "readinessCheckName",
  "readinessSatisfied",
  "projectContextCheckName",
  "projectContextSatisfied",
  "identityCheckName",
  "identitySatisfied",
  "futureRetrievalReady",
  "retrievalPermitted",
  "downloadEnabled",
  "deliveryEnabled",
  "routeAdded",
  "filesystemWriteAttempted",
  "persistenceAttempted",
  "emailAttempted",
  "crmAttempted",
  "engineInvoked",
  "readinessMutated",
  "liveCrossModuleReadAttempted",
  "discoveryDescriptions",
]);

const SAFE_ID_PATTERN = /^[0-9A-Za-z][0-9A-Za-z_.:-]{0,119}$/;
const PRIVATE_OR_DELIVERY_STRING_PATTERN =
  /(?:[A-Za-z]:[\\/]|\\\\|(?:^|\s)\/(?:Users|home|mnt|var|tmp)(?:[\/\s]|$)|\b(?:https?|file|blob|data):|\bwww\.|data:[^;\s]+;base64)/i;
const RAW_ARTIFACT_PATTERN =
  /(?:IESNA:LM-63|IES:LM-63|TILT\s*=|-----BEGIN [A-Z ]+-----|BEGIN:VCARD|BEGIN:VEVENT)/i;
const LONG_BASE64_PATTERN = /(?:^|[^0-9A-Za-z+/])[0-9A-Za-z+/]{160,}={0,2}(?:$|[^0-9A-Za-z+/])/;
const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001f\u007f]/;
const MAX_DISCOVERY_ITEMS = 16;
const MAX_LABEL_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 360;

function isPlainObject(value) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function orderedObject(fieldOrder, values) {
  return Object.fromEntries(fieldOrder.map((field) => [field, values[field]]));
}

function deepFreeze(value) {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const nested of Object.values(value)) deepFreeze(nested);
  }
  return value;
}

function normalizeText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function assertSafeText(value, field, maximum, { id = false } = {}) {
  if (typeof value !== "string") {
    throw new TypeError(`governance-data-retrieval-${field}-must-be-string`);
  }
  const normalized = normalizeText(value);
  if (!normalized || normalized.length > maximum) {
    throw new TypeError(`governance-data-retrieval-${field}-length-invalid`);
  }
  if (
    CONTROL_CHARACTER_PATTERN.test(value)
    || PRIVATE_OR_DELIVERY_STRING_PATTERN.test(normalized)
    || RAW_ARTIFACT_PATTERN.test(normalized)
    || LONG_BASE64_PATTERN.test(normalized)
  ) {
    throw new TypeError(`governance-data-retrieval-${field}-unsafe`);
  }
  if (id && !SAFE_ID_PATTERN.test(normalized)) {
    throw new TypeError(`governance-data-retrieval-${field}-id-invalid`);
  }
  return normalized;
}

function assertExactInputShape(input) {
  if (!isPlainObject(input)) {
    throw new TypeError("governance-data-retrieval-input-must-be-plain-object");
  }
  const actual = Object.keys(input).sort();
  const expected = [...GOVERNANCE_DATA_RETRIEVAL_GATEWAY_INPUT_FIELD_ORDER].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    throw new TypeError("governance-data-retrieval-input-fields-invalid");
  }
}

function assertBoolean(value, field) {
  if (typeof value !== "boolean") {
    throw new TypeError(`governance-data-retrieval-${field}-must-be-boolean`);
  }
  return value;
}

function normalizeReadinessLabel(value) {
  if (value === null) return null;
  if (typeof value !== "string" || !GOVERNANCE_DATA_RETRIEVAL_READINESS_LABELS.includes(value)) {
    throw new TypeError("governance-data-retrieval-readiness-label-invalid");
  }
  return value;
}

function normalizeDiscoveryDescriptions(value) {
  if (!Array.isArray(value) || value.length > MAX_DISCOVERY_ITEMS) {
    throw new TypeError("governance-data-retrieval-discovery-descriptions-invalid");
  }
  const normalized = value.map((description) =>
    assertSafeText(description, "discovery-description", MAX_DESCRIPTION_LENGTH));
  return Object.freeze([...new Set(normalized)].sort((left, right) => left.localeCompare(right)));
}

function resolveState({ readinessSatisfied, projectContextPresent, identityCapturePresent }) {
  if (!readinessSatisfied) {
    return {
      state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.noUsefulOutput,
      blocker: "readiness-no-useful-output",
    };
  }
  if (!projectContextPresent) {
    return {
      state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.projectRequired,
      blocker: "project-context-required",
    };
  }
  if (!identityCapturePresent) {
    return {
      state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.identityRequired,
      blocker: "identity-capture-required",
    };
  }
  return {
    state: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.readyForFutureRetrieval,
    blocker: null,
  };
}

export function buildGovernanceDataRetrievalGatewayViewState(input) {
  assertExactInputShape(input);

  const moduleId = assertSafeText(input.moduleId, "module-id", MAX_LABEL_LENGTH, { id: true });
  const moduleLabel = assertSafeText(input.moduleLabel, "module-label", MAX_LABEL_LENGTH);
  const outputId = assertSafeText(input.outputId, "output-id", MAX_LABEL_LENGTH, { id: true });
  const outputLabel = assertSafeText(input.outputLabel, "output-label", MAX_LABEL_LENGTH);
  const outputDescription = assertSafeText(
    input.outputDescription,
    "output-description",
    MAX_DESCRIPTION_LENGTH,
  );
  const readinessLabel = normalizeReadinessLabel(input.readinessLabel);
  const projectContextPresent = assertBoolean(
    input.projectContextPresent,
    "project-context-present",
  );
  const identityCapturePresent = assertBoolean(
    input.identityCapturePresent,
    "identity-capture-present",
  );
  const discoveryDescriptions = normalizeDiscoveryDescriptions(input.discoveryDescriptions);

  const readinessSatisfied = readinessLabel !== null;
  const resolved = resolveState({
    readinessSatisfied,
    projectContextPresent,
    identityCapturePresent,
  });
  const futureRetrievalReady =
    resolved.state === GOVERNANCE_DATA_RETRIEVAL_GATEWAY_STATES.readyForFutureRetrieval;

  return deepFreeze(orderedObject(
    GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OUTPUT_FIELD_ORDER,
    {
      schemaId: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_ID,
      schemaVersion: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_SCHEMA_VERSION,
      contractId: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_CONTRACT_ID,
      owner: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_OWNER,
      gatewayId: GOVERNANCE_DATA_RETRIEVAL_GATEWAY_ID,
      state: resolved.state,
      failClosed: !futureRetrievalReady,
      blocker: resolved.blocker,
      moduleId,
      moduleLabel,
      outputId,
      outputLabel,
      outputDescription,
      readinessLabel,
      readinessCheckName: "readiness",
      readinessSatisfied,
      projectContextCheckName: "project-context",
      projectContextSatisfied: projectContextPresent,
      identityCheckName: "identity",
      identitySatisfied: identityCapturePresent,
      futureRetrievalReady,
      retrievalPermitted: false,
      downloadEnabled: false,
      deliveryEnabled: false,
      routeAdded: false,
      filesystemWriteAttempted: false,
      persistenceAttempted: false,
      emailAttempted: false,
      crmAttempted: false,
      engineInvoked: false,
      readinessMutated: false,
      liveCrossModuleReadAttempted: false,
      discoveryDescriptions,
    },
  ));
}

export const createGovernanceDataRetrievalGatewayViewState =
  buildGovernanceDataRetrievalGatewayViewState;
