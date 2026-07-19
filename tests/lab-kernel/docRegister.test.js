import { readFileSync } from "node:fs";
import { test } from "node:test";
import assert from "node:assert/strict";
import * as contract from "../../packages/lab-kernel/ies-toolkit/docRegister.js";

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function assertDeepFrozen(value) {
  if (!value || typeof value !== "object") return;
  assert.equal(Object.isFrozen(value), true);
  for (const child of Object.values(value)) assertDeepFrozen(child);
}

function document(overrides = {}) {
  return {
    documentId: "DOC-BOARD-DATASHEET",
    documentType: "datasheet",
    title: "Board platform datasheet",
    sourceRef: "/s/board-platform-datasheet",
    contentSha256: "a".repeat(64),
    sourceStatus: "accepted",
    ...overrides,
  };
}

function register(state, value = document()) {
  return contract.registerDocument(state, value);
}

const exactExports = [
  "DOCUMENT_REGISTER_SCHEMA_ID",
  "DOCUMENT_REGISTER_SCHEMA_VERSION",
  "DocumentRegisterContractError",
  "createDocumentRegisterState",
  "documentsForEntity",
  "entitiesForDocument",
  "linkDocument",
  "listDocuments",
  "registerDocument",
  "unlinkDocument",
];

test("exports only the approved version-1 document-register interface", () => {
  assert.deepEqual(Object.keys(contract).sort(), exactExports.sort());
  assert.equal(contract.DOCUMENT_REGISTER_SCHEMA_ID, "controlstack.lab.document-register.v1");
  assert.equal(contract.DOCUMENT_REGISTER_SCHEMA_VERSION, 1);
});

test("creates the exact empty immutable register state", () => {
  const state = contract.createDocumentRegisterState();
  assert.deepEqual(state, {
    schemaId: "controlstack.lab.document-register.v1",
    schemaVersion: 1,
    documents: [],
    links: [],
    readOnly: true,
  });
  assertDeepFrozen(state);
});

test("registers caller-owned IDs without mutating prior state", () => {
  const initial = contract.createDocumentRegisterState();
  const input = document();
  const before = deepClone(input);
  const result = register(initial, input);

  assert.equal(result.reused, false);
  assert.deepEqual(result.document, {
    ...input,
    readOnly: true,
  });
  assert.deepEqual(result.state.documents, [result.document]);
  assert.deepEqual(result.state.links, []);
  assert.deepEqual(initial, contract.createDocumentRegisterState());
  assert.deepEqual(input, before);
  assertDeepFrozen(result);
});

test("reuses only identical non-null SHA or source resolver dedupe keys", () => {
  const first = register(contract.createDocumentRegisterState()).state;

  const bySha = register(first, document({
    documentId: "DOC-SECOND-CALLER-ID",
    sourceRef: "/s/board-platform-datasheet",
  }));
  assert.equal(bySha.reused, true);
  assert.equal(bySha.document.documentId, "DOC-BOARD-DATASHEET");
  assert.equal(bySha.state.documents.length, 1);

  const sourceOnlyFirst = register(contract.createDocumentRegisterState(), document({
    documentId: "DOC-REPORT",
    documentType: "report",
    title: "Lab report",
    sourceRef: "/reports/LAB-20260720-001",
    contentSha256: null,
    sourceStatus: "unresolved",
  })).state;
  const bySource = register(sourceOnlyFirst, document({
    documentId: "DOC-OTHER-ID",
    documentType: "report",
    title: "Lab report",
    sourceRef: "/reports/LAB-20260720-001",
    contentSha256: null,
    sourceStatus: "unresolved",
  }));
  assert.equal(bySource.reused, true);
  assert.equal(bySource.document.documentId, "DOC-REPORT");

  const sameId = register(first, document());
  assert.equal(sameId.reused, true);
  assert.equal(sameId.document.documentId, "DOC-BOARD-DATASHEET");
});

test("does not use title, filename-like text, or diagnostic values as dedupe authority", () => {
  let state = contract.createDocumentRegisterState();
  state = register(state, document({
    documentId: "DOC-A",
    sourceRef: null,
    contentSha256: null,
    sourceStatus: "unresolved",
  })).state;
  state = register(state, document({
    documentId: "DOC-B",
    sourceRef: null,
    contentSha256: null,
    sourceStatus: "unresolved",
  })).state;
  assert.deepEqual(state.documents.map((entry) => entry.documentId), ["DOC-A", "DOC-B"]);
});

test("fails closed on document ID and dedupe metadata conflicts", () => {
  const state = register(contract.createDocumentRegisterState()).state;

  assert.throws(
    () => register(state, document({ title: "Different title" })),
    (error) => error instanceof contract.DocumentRegisterContractError && error.code === "document_id_conflict",
  );
  assert.throws(
    () => register(state, document({ documentId: "DOC-OTHER", title: "Different title" })),
    (error) => error instanceof contract.DocumentRegisterContractError && error.code === "document_dedupe_conflict",
  );
  assert.throws(
    () => register(state, document({
      documentId: "DOC-OTHER",
      contentSha256: "b".repeat(64),
      sourceStatus: "unresolved",
    })),
    (error) => error instanceof contract.DocumentRegisterContractError && error.code === "document_dedupe_conflict",
  );
});

test("supports deterministic many-to-many links and idempotent duplicate linking", () => {
  let state = contract.createDocumentRegisterState();
  state = register(state, document({ documentId: "DOC-B" })).state;
  state = register(state, document({
    documentId: "DOC-A",
    documentType: "report",
    title: "Evidence report",
    sourceRef: "/r/NVB-REF-OPT-000123/evidence/LM-79.txt",
    contentSha256: "b".repeat(64),
  })).state;
  const before = deepClone(state);

  const linkedOnce = contract.linkDocument(state, { documentId: "DOC-B", entityId: "BOARD-2" });
  const linkedTwice = contract.linkDocument(linkedOnce, { documentId: "DOC-A", entityId: "BOARD-2" });
  const linkedThree = contract.linkDocument(linkedTwice, { documentId: "DOC-A", entityId: "BOARD-1" });
  const idempotent = contract.linkDocument(linkedThree, { documentId: "DOC-A", entityId: "BOARD-1" });

  assert.deepEqual(idempotent.links, [
    { documentId: "DOC-A", entityId: "BOARD-1" },
    { documentId: "DOC-A", entityId: "BOARD-2" },
    { documentId: "DOC-B", entityId: "BOARD-2" },
  ]);
  assert.deepEqual(state, before);
  assert.notEqual(idempotent, linkedThree);
  assertDeepFrozen(idempotent);
});

test("unlink removes only the selected association and never deletes source evidence", () => {
  let state = register(contract.createDocumentRegisterState()).state;
  state = contract.linkDocument(state, { documentId: "DOC-BOARD-DATASHEET", entityId: "BOARD-A" });
  state = contract.linkDocument(state, { documentId: "DOC-BOARD-DATASHEET", entityId: "BOARD-B" });
  const before = deepClone(state);
  const unlinked = contract.unlinkDocument(state, { documentId: "DOC-BOARD-DATASHEET", entityId: "BOARD-A" });

  assert.deepEqual(unlinked.links, [
    { documentId: "DOC-BOARD-DATASHEET", entityId: "BOARD-B" },
  ]);
  assert.equal(unlinked.documents.length, 1);
  assert.equal(unlinked.documents[0].documentId, "DOC-BOARD-DATASHEET");
  assert.deepEqual(state, before);

  const idempotent = contract.unlinkDocument(unlinked, { documentId: "DOC-BOARD-DATASHEET", entityId: "BOARD-A" });
  assert.deepEqual(idempotent, unlinked);
  assert.notEqual(idempotent, unlinked);
});

test("returns stable sorted document and entity queries", () => {
  let state = contract.createDocumentRegisterState();
  state = register(state, document({ documentId: "DOC-Z" })).state;
  state = register(state, document({
    documentId: "DOC-A",
    documentType: "report",
    title: "Unresolved report",
    sourceRef: "/reports/REPORT-A",
    contentSha256: null,
    sourceStatus: "unresolved",
  })).state;
  state = register(state, document({
    documentId: "DOC-M",
    documentType: "report",
    title: "Accepted report",
    sourceRef: "/reports/REPORT-M",
    contentSha256: "c".repeat(64),
    sourceStatus: "accepted",
  })).state;
  state = contract.linkDocument(state, { documentId: "DOC-Z", entityId: "ENTITY-B" });
  state = contract.linkDocument(state, { documentId: "DOC-A", entityId: "ENTITY-A" });
  state = contract.linkDocument(state, { documentId: "DOC-M", entityId: "ENTITY-A" });
  state = contract.linkDocument(state, { documentId: "DOC-A", entityId: "ENTITY-B" });

  assert.deepEqual(contract.listDocuments(state).map((entry) => entry.documentId), ["DOC-A", "DOC-M", "DOC-Z"]);
  assert.deepEqual(contract.listDocuments(state, { documentType: "report" }).map((entry) => entry.documentId), ["DOC-A", "DOC-M"]);
  assert.deepEqual(contract.listDocuments(state, { sourceStatus: "accepted" }).map((entry) => entry.documentId), ["DOC-M", "DOC-Z"]);
  assert.deepEqual(contract.listDocuments(state, { documentType: "report", sourceStatus: "unresolved" }).map((entry) => entry.documentId), ["DOC-A"]);
  assert.deepEqual(contract.documentsForEntity(state, "ENTITY-A").map((entry) => entry.documentId), ["DOC-A", "DOC-M"]);
  assert.deepEqual(contract.entitiesForDocument(state, "DOC-A"), ["ENTITY-A", "ENTITY-B"]);
  assertDeepFrozen(contract.listDocuments(state));
  assertDeepFrozen(contract.documentsForEntity(state, "ENTITY-A"));
  assertDeepFrozen(contract.entitiesForDocument(state, "DOC-A"));
});

test("accepts only canonical LAB-017 source, report, or evidence resolver paths", () => {
  for (const sourceRef of [
    "/s/source-1",
    "/reports/report-1",
    "/r/NVB-REF-GT-000001/evidence/report.pdf",
  ]) {
    const result = register(contract.createDocumentRegisterState(), document({ sourceRef }));
    assert.equal(result.document.sourceRef, sourceRef);
  }

  for (const sourceRef of [
    "/r/NVB-REF-GT-000001",
    "/p/NVB-REF-GT-000001",
    "/r/NVB-REF-GT-000001/origin.ies",
    "/c/board/BOARD-1",
    "https://example.test/report",
    "file:///C:/report.pdf",
    "C:\\report.pdf",
    "../report.pdf",
    "/reports/../report",
    "/reports/report?download=1",
  ]) {
    assert.throws(
      () => register(contract.createDocumentRegisterState(), document({ sourceRef })),
      (error) => error instanceof contract.DocumentRegisterContractError && error.code === "invalid_source_ref",
    );
  }
});

test("fails closed on malformed state, documents, links, filters, and SHA values", () => {
  const empty = contract.createDocumentRegisterState();
  const invalidDocuments = [
    null,
    { ...document(), extra: true },
    document({ documentId: "" }),
    document({ documentId: "../DOC" }),
    document({ documentType: "" }),
    document({ title: " bad" }),
    document({ sourceRef: "not-a-resolver-path" }),
    document({ contentSha256: "safe-diagnostic-hash" }),
    document({ contentSha256: "A".repeat(64) }),
    document({ sourceStatus: "verified" }),
  ];
  for (const value of invalidDocuments) {
    assert.throws(() => register(empty, value), contract.DocumentRegisterContractError);
  }

  for (const state of [
    null,
    { ...empty, extra: true },
    { ...empty, schemaVersion: 2 },
    { ...empty, readOnly: false },
    { ...empty, documents: {} },
    { ...empty, links: {} },
    { ...empty, documents: [{ ...document(), readOnly: false }] },
    { ...empty, documents: [{ ...document(), readOnly: true }, { ...document(), readOnly: true }] },
    { ...empty, links: [{ documentId: "DOC-MISSING", entityId: "ENTITY-1" }] },
  ]) {
    assert.throws(() => contract.listDocuments(state), contract.DocumentRegisterContractError);
  }

  const state = register(empty).state;
  for (const link of [
    null,
    { documentId: "DOC-BOARD-DATASHEET", entityId: "ENTITY-1", extra: true },
    { documentId: "DOC-MISSING", entityId: "ENTITY-1" },
    { documentId: "DOC-BOARD-DATASHEET", entityId: "../ENTITY" },
  ]) {
    assert.throws(() => contract.linkDocument(state, link), contract.DocumentRegisterContractError);
  }
  assert.throws(() => contract.listDocuments(state, { type: "datasheet" }), contract.DocumentRegisterContractError);
  assert.throws(() => contract.listDocuments(state, { sourceStatus: "verified" }), contract.DocumentRegisterContractError);
  assert.throws(() => contract.entitiesForDocument(state, "DOC-MISSING"), contract.DocumentRegisterContractError);
});

test("production module contains no counter, persistence, upload, hashing, deletion, or retired mutable API seam", () => {
  const source = readFileSync(
    new URL("../../packages/lab-kernel/ies-toolkit/docRegister.js", import.meta.url),
    "utf8",
  );
  for (const forbidden of [
    "fetch(", "XMLHttpRequest", "node:fs", "node:path", "localStorage", "sessionStorage", "indexedDB",
    "Date.now", "Math.random", "process.env", "crypto.subtle", "createHash", "FileReader", "FormData",
    "function upload", "uploadDocument", "deleteDocument", "removeDocument", "fingerprint", "filename", "const DOCS", "const LINKS", "let _n",
  ]) {
    assert.equal(source.includes(forbidden), false, `${forbidden} must remain absent`);
  }
  for (const retired of ["addDoc", "associate", "unassociate", "docsFor", "findDocs", "entitiesFor", "allDocs"]) {
    assert.equal(new RegExp(`export\\s+(?:const|function|class)\\s+${retired}\\b`).test(source), false);
  }
});
