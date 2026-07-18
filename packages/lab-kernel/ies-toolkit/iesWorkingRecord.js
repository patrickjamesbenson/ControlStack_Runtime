// ControlStack Lab — non-authoritative in-memory working sessions for Summary/Normalise.
// Browser-safe and dependency-free. No sealing, persistence, authority hashing, store or runtime behaviour lives here.

/** Canonical schema for a non-authoritative working session. */
export const WORKING_SESSION_SCHEMA_ID = "controlstack.lab.ies-working-session.v1";
export const WORKING_SESSION_SCHEMA_VERSION = 1;

/** Allowed isolated working slots. */
export const WORKING_SLOT_IDS = Object.freeze(["A", "B", "MERGED"]);

/** Eight canonical Normalise stages in dependency order. */
export const NORMALISE_STAGES = Object.freeze([
  "loaded",
  "dimensions_decided",
  "metadata_decided",
  "level_decided",
  "symmetry_decided",
  "interpolated",
  "padded",
  "one_mm",
]);

const SLOT_SET = new Set(WORKING_SLOT_IDS);
const STAGE_SET = new Set(NORMALISE_STAGES);

/** Error raised when a working-session contract is invalid. */
export class WorkingRecordError extends Error {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message, code = "invalid_working_session") {
    super(message);
    this.name = "WorkingRecordError";
    this.code = code;
  }
}

/**
 * Deep-clone browser-safe data while preserving exact byte arrays.
 * Functions, symbols and class instances are intentionally unsupported in working-session state.
 *
 * @param {any} value
 * @returns {any}
 */
export function cloneWorkingValue(value) {
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Uint8Array) return new Uint8Array(value);
  if (value instanceof ArrayBuffer) return value.slice(0);
  if (ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  }
  if (Array.isArray(value)) return value.map(cloneWorkingValue);
  const output = {};
  for (const [key, child] of Object.entries(value)) output[key] = cloneWorkingValue(child);
  return output;
}

/**
 * Convert uploaded source content into an independent exact byte copy.
 * Strings are encoded as UTF-8 exactly as supplied to this boundary.
 *
 * @param {string|ArrayBuffer|ArrayBufferView} originBytes
 * @returns {Uint8Array}
 * @throws {WorkingRecordError}
 */
export function copyOriginBytes(originBytes) {
  if (typeof originBytes === "string") return new TextEncoder().encode(originBytes);
  if (originBytes instanceof ArrayBuffer) return new Uint8Array(originBytes.slice(0));
  if (ArrayBuffer.isView(originBytes)) {
    return new Uint8Array(originBytes.buffer.slice(originBytes.byteOffset, originBytes.byteOffset + originBytes.byteLength));
  }
  throw new WorkingRecordError(
    "originBytes must be a string, ArrayBuffer, or typed-array view.",
    "invalid_origin_bytes",
  );
}

function assertPlainModel(parsedModel, fieldName) {
  if (!parsedModel || typeof parsedModel !== "object" || Array.isArray(parsedModel)) {
    throw new WorkingRecordError(`${fieldName} must be a parsed model object.`, "invalid_parsed_model");
  }
}

function assertSlot(slotId, allowed) {
  if (!allowed.includes(slotId)) {
    throw new WorkingRecordError(
      `slotId must be one of ${allowed.join(", ")}; received ${String(slotId)}.`,
      "invalid_slot",
    );
  }
}

function makeRecipe() {
  return {
    stage: "loaded",
    decisions: {},
    targetGridId: null,
  };
}

function makeBaseSession(slotId, workingModel, labFormDraft) {
  return {
    schemaId: WORKING_SESSION_SCHEMA_ID,
    schemaVersion: WORKING_SESSION_SCHEMA_VERSION,
    authorityState: "non-authoritative",
    slotId,
    workingModel: cloneWorkingValue(workingModel),
    labFormDraft: cloneWorkingValue(labFormDraft || []),
    recipe: makeRecipe(),
    provenanceDraft: { entries: [] },
    approvalState: "draft",
  };
}

/**
 * Create an isolated uploaded working session for slot A or B.
 * Exact source bytes and the parsed origin model are copied so later caller mutations cannot alter them.
 *
 * @param {{
 *   slotId:"A"|"B",
 *   originBytes:string|ArrayBuffer|ArrayBufferView,
 *   parsedModel:object,
 *   displayName?:string,
 *   mediaType?:string,
 *   labFormDraft?:Array<object>
 * }} input
 * @returns {object}
 * @throws {WorkingRecordError}
 */
export function createWorkingSession(input) {
  if (!input || typeof input !== "object") {
    throw new WorkingRecordError("Working-session input is required.", "missing_input");
  }
  const { slotId, originBytes, parsedModel } = input;
  assertSlot(slotId, ["A", "B"]);
  assertPlainModel(parsedModel, "parsedModel");
  const bytes = copyOriginBytes(originBytes);
  const session = makeBaseSession(slotId, parsedModel, input.labFormDraft);
  session.origin = {
    kind: "uploaded",
    exactBytes: bytes,
    byteLength: bytes.byteLength,
    mediaType: String(input.mediaType || "text/plain"),
    displayName: String(input.displayName || ""),
    parsedModel: cloneWorkingValue(parsedModel),
  };
  return session;
}

function snapshotParent(parent) {
  assertWorkingSession(parent);
  if (parent.slotId === "MERGED") {
    throw new WorkingRecordError(
      "Slice 1 MERGED working sessions may only snapshot uploaded A/B parents.",
      "nested_merged_parent_unsupported",
    );
  }
  return {
    slotId: parent.slotId,
    origin: cloneWorkingValue(parent.origin),
    recipe: cloneWorkingValue(parent.recipe),
  };
}

/**
 * Create an isolated transient MERGED working session from already prepared A/B sessions.
 * This function snapshots parent origins and recipe state; it performs no photometric merge.
 *
 * @param {{parents:object[], workingModel:object, labFormDraft?:Array<object>}} input
 * @returns {object}
 * @throws {WorkingRecordError}
 */
export function createMergedWorkingSession(input) {
  if (!input || typeof input !== "object") {
    throw new WorkingRecordError("Merged working-session input is required.", "missing_input");
  }
  const parents = input.parents;
  if (!Array.isArray(parents) || parents.length < 2) {
    throw new WorkingRecordError("MERGED working sessions require at least two parent sessions.", "insufficient_parents");
  }
  assertPlainModel(input.workingModel, "workingModel");
  const snapshots = parents.map(snapshotParent);
  const slots = snapshots.map((parent) => parent.slotId);
  if (new Set(slots).size !== slots.length) {
    throw new WorkingRecordError("MERGED working-session parent slots must be unique.", "duplicate_parent_slot");
  }

  const session = makeBaseSession("MERGED", input.workingModel, input.labFormDraft);
  session.origin = {
    kind: "derived",
    parents: snapshots,
  };
  return session;
}

/**
 * Validate the structural working-session contract.
 *
 * @param {unknown} session
 * @returns {true}
 * @throws {WorkingRecordError}
 */
export function assertWorkingSession(session) {
  if (!session || typeof session !== "object" || Array.isArray(session)) {
    throw new WorkingRecordError("Working session must be an object.");
  }
  if (session.schemaId !== WORKING_SESSION_SCHEMA_ID || session.schemaVersion !== WORKING_SESSION_SCHEMA_VERSION) {
    throw new WorkingRecordError(
      `Working session must use ${WORKING_SESSION_SCHEMA_ID} schema version ${WORKING_SESSION_SCHEMA_VERSION}.`,
      "wrong_schema",
    );
  }
  if (session.authorityState !== "non-authoritative") {
    throw new WorkingRecordError("Working sessions must remain non-authoritative.", "invalid_authority_state");
  }
  if (!SLOT_SET.has(session.slotId)) {
    throw new WorkingRecordError(`Unknown working slot ${String(session.slotId)}.`, "invalid_slot");
  }
  assertPlainModel(session.workingModel, "workingModel");
  if (!session.recipe || !STAGE_SET.has(session.recipe.stage)) {
    throw new WorkingRecordError(`Unknown Normalise stage ${String(session.recipe?.stage)}.`, "invalid_stage");
  }
  if (!session.provenanceDraft || !Array.isArray(session.provenanceDraft.entries)) {
    throw new WorkingRecordError("Working session must contain provenanceDraft.entries.", "invalid_provenance_draft");
  }

  if (session.slotId === "MERGED") {
    if (session.origin?.kind !== "derived" || !Array.isArray(session.origin.parents) || session.origin.parents.length < 2) {
      throw new WorkingRecordError("MERGED sessions must contain at least two snapshotted parent origins.", "invalid_merged_origin");
    }
  } else {
    if (session.origin?.kind !== "uploaded" || !(session.origin.exactBytes instanceof Uint8Array)) {
      throw new WorkingRecordError("A/B sessions must preserve uploaded exactBytes as Uint8Array.", "invalid_uploaded_origin");
    }
    if (session.origin.byteLength !== session.origin.exactBytes.byteLength) {
      throw new WorkingRecordError("origin.byteLength does not match exactBytes.", "origin_length_mismatch");
    }
    assertPlainModel(session.origin.parsedModel, "origin.parsedModel");
  }
  return true;
}

/**
 * Clone a validated working session for an immutable state transition.
 *
 * @param {object} session
 * @returns {object}
 */
export function cloneWorkingSession(session) {
  assertWorkingSession(session);
  return cloneWorkingValue(session);
}
