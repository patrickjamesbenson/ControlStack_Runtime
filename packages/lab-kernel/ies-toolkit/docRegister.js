// ControlStack Lab — immutable in-memory document-register contract.
// Pure, deterministic, browser-safe, and intentionally independent of upload or persistence.

import { parseResolverPath } from "./nvbReference.js";

export class DocumentRegisterContractError extends Error {
  constructor(message, code = "invalid_document_register_contract", details = null) {
    super(message);
    this.name = "DocumentRegisterContractError";
    this.code = code;
    if (details !== null) this.details = deepFreeze(details);
  }
}

export const DOCUMENT_REGISTER_SCHEMA_ID = "controlstack.lab.document-register.v1";
export const DOCUMENT_REGISTER_SCHEMA_VERSION = 1;

const SAFE_ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;
const SHA256_PATTERN = /^[0-9a-f]{64}$/;
const SOURCE_STATUSES = Object.freeze(["accepted", "unresolved"]);
const DOCUMENT_INPUT_KEYS = Object.freeze([
  "documentId",
  "documentType",
  "title",
  "sourceRef",
  "contentSha256",
  "sourceStatus",
]);
const DOCUMENT_STATE_KEYS = Object.freeze([...DOCUMENT_INPUT_KEYS, "readOnly"]);
const LINK_KEYS = Object.freeze(["documentId", "entityId"]);
const STATE_KEYS = Object.freeze(["schemaId", "schemaVersion", "documents", "links", "readOnly"]);
const FILTER_KEYS = Object.freeze(["documentType", "sourceStatus"]);
const ALLOWED_SOURCE_KINDS = Object.freeze(["source", "report", "evidence"]);

function fail(message, code, details = null) {
  throw new DocumentRegisterContractError(message, code, details);
}

function deepFreeze(value) {
  if (!value || typeof value !== "object" || Object.isFrozen(value)) return value;
  for (const child of Object.values(value)) deepFreeze(child);
  return Object.freeze(value);
}

function isPlainObject(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const prototype = Object.getPrototypeOf(value);
  return prototype === Object.prototype || prototype === null;
}

function requirePlainObject(value, name) {
  if (!isPlainObject(value)) fail(`${name} must be a plain object.`, "plain_object_required", { name });
  return value;
}

function requireExactKeys(value, expectedKeys, name) {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  if (actual.length !== expected.length || actual.some((key, index) => key !== expected[index])) {
    fail(`${name} has unsupported or missing fields.`, "invalid_object_shape", { name, expectedKeys: expected });
  }
}

function requireAllowedKeys(value, allowedKeys, name) {
  const unsupported = Object.keys(value).filter((key) => !allowedKeys.includes(key)).sort();
  if (unsupported.length > 0) {
    fail(`${name} has unsupported fields.`, "invalid_object_shape", { name, unsupported });
  }
}

function requireSafeId(value, name) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || !SAFE_ID_PATTERN.test(value)
    || value === "."
    || value === ".."
  ) {
    fail(`${name} must be one safe caller-supplied opaque ID.`, "invalid_opaque_id", { name });
  }
  return value;
}

function requireBoundedText(value, name, maxLength) {
  if (
    typeof value !== "string"
    || value !== value.trim()
    || value.length === 0
    || value.length > maxLength
    || /[\u0000-\u001f\u007f]/.test(value)
  ) {
    fail(`${name} must be bounded non-empty text.`, "invalid_text_value", { name, maxLength });
  }
  return value;
}

function requireNullableSha256(value, name) {
  if (value === null) return null;
  if (typeof value !== "string" || !SHA256_PATTERN.test(value)) {
    fail(`${name} must be null or a lowercase raw 64-character SHA-256 value.`, "invalid_sha256", { name });
  }
  return value;
}

function requireNullableSourceRef(value, name) {
  if (value === null) return null;
  const descriptor = parseResolverPath(value);
  if (!descriptor || !ALLOWED_SOURCE_KINDS.includes(descriptor.kind)) {
    fail(`${name} must be a canonical host-free source, report, or evidence resolver path.`, "invalid_source_ref", { name });
  }
  return value;
}

function requireSourceStatus(value, name) {
  if (!SOURCE_STATUSES.includes(value)) {
    fail(`${name} must be accepted or unresolved.`, "invalid_source_status", { name });
  }
  return value;
}

function compareText(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function compareDocuments(left, right) {
  return compareText(left.documentId, right.documentId);
}

function compareLinks(left, right) {
  return compareText(left.documentId, right.documentId) || compareText(left.entityId, right.entityId);
}

function sameDocumentMetadata(left, right) {
  return left.documentType === right.documentType
    && left.title === right.title
    && left.sourceRef === right.sourceRef
    && left.contentSha256 === right.contentSha256
    && left.sourceStatus === right.sourceStatus;
}

function projectDocument(value, name, fromState = false) {
  const document = requirePlainObject(value, name);
  requireExactKeys(document, fromState ? DOCUMENT_STATE_KEYS : DOCUMENT_INPUT_KEYS, name);
  if (fromState && document.readOnly !== true) {
    fail(`${name}.readOnly must be true.`, "invalid_read_only_marker", { name });
  }
  return {
    documentId: requireSafeId(document.documentId, `${name}.documentId`),
    documentType: requireBoundedText(document.documentType, `${name}.documentType`, 64),
    title: requireBoundedText(document.title, `${name}.title`, 256),
    sourceRef: requireNullableSourceRef(document.sourceRef, `${name}.sourceRef`),
    contentSha256: requireNullableSha256(document.contentSha256, `${name}.contentSha256`),
    sourceStatus: requireSourceStatus(document.sourceStatus, `${name}.sourceStatus`),
    readOnly: true,
  };
}

function projectLink(value, name) {
  const link = requirePlainObject(value, name);
  requireExactKeys(link, LINK_KEYS, name);
  return {
    documentId: requireSafeId(link.documentId, `${name}.documentId`),
    entityId: requireSafeId(link.entityId, `${name}.entityId`),
  };
}

function buildState(documents, links) {
  return deepFreeze({
    schemaId: DOCUMENT_REGISTER_SCHEMA_ID,
    schemaVersion: DOCUMENT_REGISTER_SCHEMA_VERSION,
    documents: [...documents].sort(compareDocuments),
    links: [...links].sort(compareLinks),
    readOnly: true,
  });
}

function normaliseState(value) {
  const state = requirePlainObject(value, "state");
  requireExactKeys(state, STATE_KEYS, "state");
  if (state.schemaId !== DOCUMENT_REGISTER_SCHEMA_ID || state.schemaVersion !== DOCUMENT_REGISTER_SCHEMA_VERSION) {
    fail("state must use the supported document-register schema and version.", "unsupported_document_register_schema");
  }
  if (state.readOnly !== true) fail("state.readOnly must be true.", "invalid_read_only_marker");
  if (!Array.isArray(state.documents)) fail("state.documents must be an array.", "documents_array_required");
  if (!Array.isArray(state.links)) fail("state.links must be an array.", "links_array_required");

  const documents = state.documents.map((document, index) => projectDocument(document, `state.documents[${index}]`, true));
  const documentIds = new Set();
  const shaOwners = new Map();
  const sourceOwners = new Map();
  for (const document of documents) {
    if (documentIds.has(document.documentId)) {
      fail("state contains duplicate document IDs.", "duplicate_document_id", { documentId: document.documentId });
    }
    documentIds.add(document.documentId);
    if (document.contentSha256 !== null) {
      if (shaOwners.has(document.contentSha256)) fail("state contains duplicate SHA dedupe keys.", "duplicate_sha_dedupe_key");
      shaOwners.set(document.contentSha256, document.documentId);
    }
    if (document.sourceRef !== null) {
      if (sourceOwners.has(document.sourceRef)) fail("state contains duplicate source dedupe keys.", "duplicate_source_dedupe_key");
      sourceOwners.set(document.sourceRef, document.documentId);
    }
  }

  const links = state.links.map((link, index) => projectLink(link, `state.links[${index}]`));
  const linkKeys = new Set();
  for (const link of links) {
    if (!documentIds.has(link.documentId)) {
      fail("state link references an unknown document.", "unknown_link_document", { documentId: link.documentId });
    }
    const key = `${link.documentId}\u0000${link.entityId}`;
    if (linkKeys.has(key)) fail("state contains a duplicate link.", "duplicate_document_link");
    linkKeys.add(key);
  }
  return buildState(documents, links);
}

function findDocument(state, documentId) {
  return state.documents.find((document) => document.documentId === documentId) || null;
}

function requireKnownDocument(state, documentId) {
  const id = requireSafeId(documentId, "documentId");
  const document = findDocument(state, id);
  if (!document) fail("documentId is not registered.", "unknown_document_id", { documentId: id });
  return document;
}

export function createDocumentRegisterState() {
  return buildState([], []);
}

export function registerDocument(stateValue, documentValue) {
  const state = normaliseState(stateValue);
  const incoming = projectDocument(documentValue, "document", false);
  const byId = findDocument(state, incoming.documentId);
  if (byId) {
    if (!sameDocumentMetadata(byId, incoming)) {
      fail("A registered document ID cannot be reused with different content.", "document_id_conflict", { documentId: incoming.documentId });
    }
    return deepFreeze({ state, document: byId, reused: true });
  }

  const dedupeMatches = state.documents.filter((document) => (
    (incoming.contentSha256 !== null && document.contentSha256 === incoming.contentSha256)
    || (incoming.sourceRef !== null && document.sourceRef === incoming.sourceRef)
  ));
  const matchedIds = [...new Set(dedupeMatches.map((document) => document.documentId))];
  if (matchedIds.length > 1) {
    fail("Document dedupe keys resolve to different existing documents.", "ambiguous_document_dedupe");
  }
  if (dedupeMatches.length === 1) {
    const existing = dedupeMatches[0];
    if (!sameDocumentMetadata(existing, incoming)) {
      fail("Metadata conflicts with an existing document dedupe key.", "document_dedupe_conflict", { documentId: existing.documentId });
    }
    return deepFreeze({ state, document: existing, reused: true });
  }

  const nextState = buildState([...state.documents, incoming], state.links);
  return deepFreeze({
    state: nextState,
    document: nextState.documents.find((document) => document.documentId === incoming.documentId),
    reused: false,
  });
}

export function linkDocument(stateValue, linkValue) {
  const state = normaliseState(stateValue);
  const link = projectLink(linkValue, "link");
  requireKnownDocument(state, link.documentId);
  const exists = state.links.some((entry) => entry.documentId === link.documentId && entry.entityId === link.entityId);
  return buildState(state.documents, exists ? state.links : [...state.links, link]);
}

export function unlinkDocument(stateValue, linkValue) {
  const state = normaliseState(stateValue);
  const link = projectLink(linkValue, "link");
  requireKnownDocument(state, link.documentId);
  const links = state.links.filter((entry) => !(entry.documentId === link.documentId && entry.entityId === link.entityId));
  return buildState(state.documents, links);
}

export function listDocuments(stateValue, filterValue = undefined) {
  const state = normaliseState(stateValue);
  let filter = null;
  if (filterValue !== undefined) {
    filter = requirePlainObject(filterValue, "filter");
    requireAllowedKeys(filter, FILTER_KEYS, "filter");
    if (Object.hasOwn(filter, "documentType")) requireBoundedText(filter.documentType, "filter.documentType", 64);
    if (Object.hasOwn(filter, "sourceStatus")) requireSourceStatus(filter.sourceStatus, "filter.sourceStatus");
  }
  const documents = state.documents.filter((document) => (
    (!filter || !Object.hasOwn(filter, "documentType") || document.documentType === filter.documentType)
    && (!filter || !Object.hasOwn(filter, "sourceStatus") || document.sourceStatus === filter.sourceStatus)
  ));
  return deepFreeze([...documents].sort(compareDocuments));
}

export function documentsForEntity(stateValue, entityIdValue) {
  const state = normaliseState(stateValue);
  const entityId = requireSafeId(entityIdValue, "entityId");
  const ids = new Set(state.links.filter((link) => link.entityId === entityId).map((link) => link.documentId));
  return deepFreeze(state.documents.filter((document) => ids.has(document.documentId)).sort(compareDocuments));
}

export function entitiesForDocument(stateValue, documentIdValue) {
  const state = normaliseState(stateValue);
  const document = requireKnownDocument(state, documentIdValue);
  const entities = state.links
    .filter((link) => link.documentId === document.documentId)
    .map((link) => link.entityId)
    .sort(compareText);
  return deepFreeze(entities);
}
