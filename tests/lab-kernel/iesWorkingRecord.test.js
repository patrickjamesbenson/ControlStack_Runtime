import { test } from "node:test";
import assert from "node:assert/strict";
import {
  NORMALISE_STAGES,
  WORKING_SESSION_SCHEMA_ID,
  assertWorkingSession,
  cloneWorkingSession,
  createMergedWorkingSession,
  createWorkingSession,
} from "../../packages/lab-kernel/ies-toolkit/iesWorkingRecord.js";

function model(cd = 100) {
  return { meta: { keywords_order: [] }, photometry: { v_angles: [0, 90, 180], h_angles: [0], candela: [[cd, 0, 0]], geometry: { G8: 1, G12: 10 } } };
}

test("creates isolated A/B non-authoritative sessions and preserves exact bytes", () => {
  const bytes = new Uint8Array([0, 13, 10, 255]);
  const parsed = model();
  const a = createWorkingSession({ slotId: "A", originBytes: bytes, parsedModel: parsed, displayName: "A.ies" });
  const b = createWorkingSession({ slotId: "B", originBytes: "IESNA", parsedModel: model(50) });

  bytes[0] = 99;
  parsed.photometry.candela[0][0] = 999;
  assert.equal(a.schemaId, WORKING_SESSION_SCHEMA_ID);
  assert.equal(a.authorityState, "non-authoritative");
  assert.deepEqual([...a.origin.exactBytes], [0, 13, 10, 255]);
  assert.equal(a.origin.parsedModel.photometry.candela[0][0], 100);
  assert.equal(a.workingModel.photometry.candela[0][0], 100);
  assert.equal(a.recipe.stage, "loaded");
  assert.deepEqual(NORMALISE_STAGES, ["loaded", "dimensions_decided", "metadata_decided", "level_decided", "symmetry_decided", "interpolated", "padded", "one_mm"]);
  assert.equal(assertWorkingSession(a), true);
  assert.equal(assertWorkingSession(b), true);
});

test("clones sessions without sharing exact bytes or working state", () => {
  const original = createWorkingSession({ slotId: "A", originBytes: "abc", parsedModel: model() });
  const copy = cloneWorkingSession(original);
  copy.origin.exactBytes[0] = 0;
  copy.workingModel.photometry.candela[0][0] = 5;
  assert.notEqual(copy.origin.exactBytes[0], original.origin.exactBytes[0]);
  assert.equal(original.workingModel.photometry.candela[0][0], 100);
});

test("creates an isolated transient MERGED session without performing merge work", () => {
  const a = createWorkingSession({ slotId: "A", originBytes: "a", parsedModel: model() });
  const b = createWorkingSession({ slotId: "B", originBytes: "b", parsedModel: model(50) });
  const merged = createMergedWorkingSession({ parents: [a, b], workingModel: model(150) });
  a.origin.exactBytes[0] = 0;
  assert.equal(merged.slotId, "MERGED");
  assert.equal(merged.origin.kind, "derived");
  assert.equal(merged.origin.parents.length, 2);
  assert.equal(merged.origin.parents[0].slotId, "A");
  assert.notEqual(merged.origin.parents[0].origin.exactBytes[0], a.origin.exactBytes[0]);
  assert.equal(assertWorkingSession(merged), true);
});

test("rejects unsupported slots and duplicate MERGED parents", () => {
  assert.throws(() => createWorkingSession({ slotId: "MERGED", originBytes: "x", parsedModel: model() }), /slotId/);
  const a = createWorkingSession({ slotId: "A", originBytes: "a", parsedModel: model() });
  assert.throws(() => createMergedWorkingSession({ parents: [a, a], workingModel: model() }), /unique/);
});
