import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import {
  buildAuthorityReferenceGoogleReaderPreflight,
  materialiseGoogleSheetValueRanges,
  normaliseGoogleSheetHeaders,
  normaliseGoogleSheetRowsToObjects,
} from "../packages/workspace-kernel/authorityReferenceMaterialiserService.js";

const repoRoot = dirname(dirname(fileURLToPath(import.meta.url)));

function fakeStat({ isFile = true, size = 123, mtime = new Date("2026-06-26T00:00:00.000Z") } = {}) {
  return {
    isFile: () => isFile,
    size,
    mtime,
  };
}

function fakeFs({ readablePaths = new Set() } = {}) {
  return {
    stat: async (pathValue) => {
      if (readablePaths.has(pathValue)) return fakeStat();
      const error = new Error("ENOENT");
      error.code = "ENOENT";
      throw error;
    },
  };
}

async function listFilesRecursive(relativeRoot) {
  const absoluteRoot = join(repoRoot, relativeRoot);
  let entries;
  try {
    entries = await readdir(absoluteRoot, { withFileTypes: true });
  } catch {
    return [];
  }

  const files = [];
  for (const entry of entries) {
    const childRelative = join(relativeRoot, entry.name);
    if (entry.isDirectory()) {
      files.push(...await listFilesRecursive(childRelative));
    } else if (/\.(js|mjs|cjs|ts|tsx|jsx)$/.test(entry.name)) {
      files.push(childRelative);
    }
  }
  return files;
}

test("Google reader preflight reports config blockers without returning secrets", async () => {
  const configuredCredPath = "C:\\configured-only\\novon_db_key.json";
  const configuredSheetId = "configured-provider-id";
  const preflight = await buildAuthorityReferenceGoogleReaderPreflight({
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: configuredCredPath,
      CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID: configuredSheetId,
    },
    fsApi: fakeFs({ readablePaths: new Set([configuredCredPath]) }),
  });

  const text = JSON.stringify(preflight);
  assert.equal(preflight.ok, true);
  assert.equal(preflight.allowed, true);
  assert.equal(preflight.serverSideOnly, true);
  assert.equal(preflight.credentialPathReturned, false);
  assert.equal(preflight.credentialValueReturned, false);
  assert.equal(preflight.credentialContentsReturned, false);
  assert.equal(preflight.sheetIdReturned, false);
  assert.equal(text.includes(configuredCredPath), false);
  assert.equal(text.includes(configuredSheetId), false);
});

test("Google reader preflight blocks when env is missing", async () => {
  const preflight = await buildAuthorityReferenceGoogleReaderPreflight({ env: {}, fsApi: fakeFs() });

  assert.equal(preflight.ok, false);
  assert.equal(preflight.allowed, false);
  assert.ok(preflight.blockers.some((item) => item.code === "google-sheet-not-configured"));
  assert.ok(preflight.blockers.some((item) => item.code === "google-credentials-not-configured"));
});

test("duplicate and blank headers are normalised deterministically", () => {
  const headers = normaliseGoogleSheetHeaders(["code", "", "code", " code ", undefined], 5);
  assert.deepEqual(headers, [
    "code",
    "__blank_header_2",
    "code__2",
    "code__3",
    "__blank_header_5",
  ]);
});

test("sheet rows become NovonDB-style object arrays with blank rows ignored", () => {
  const rows = normaliseGoogleSheetRowsToObjects([
    ["id", "name", "name"],
    ["sys-1", "Linear", "Duplicate"],
    ["", "", ""],
    ["sys-2", "Extrusion", "Duplicate 2"],
  ]);

  assert.deepEqual(rows, [
    { id: "sys-1", name: "Linear", name__2: "Duplicate" },
    { id: "sys-2", name: "Extrusion", name__2: "Duplicate 2" },
  ]);
});

test("fake Google value ranges materialise expected table arrays", () => {
  const materialised = materialiseGoogleSheetValueRanges({
    sheetTitles: ["SYSTEM", "USERS", "IGNORED_TAB"],
    valueRanges: [
      { values: [["system_id", "label"], ["S1", "System One"]] },
      { values: [["email_login", "role"], ["hidden@example.com", "internal_user"]] },
      { values: [["raw"], ["ignored"]] },
    ],
  });

  assert.deepEqual(Object.keys(materialised).sort(), ["SYSTEM", "USERS"]);
  assert.equal(materialised.SYSTEM.length, 1);
  assert.equal(materialised.SYSTEM[0].system_id, "S1");
  assert.equal(materialised.USERS.length, 1);
  assert.equal(materialised.USERS[0].email_login, "hidden@example.com");
});

test("browser/admin modules do not import googleapis", async () => {
  const guardedRoots = [
    "packages/modules/admin-dev",
    "packages/modules/cs-selector",
    "packages/modules/board-data",
    "packages/modules/ies-builder",
    "packages/modules/photometry",
    "apps/workspace-shell",
  ];
  const files = (await Promise.all(guardedRoots.map(listFilesRecursive))).flat();
  const offenders = [];

  for (const file of files) {
    const text = await readFile(join(repoRoot, file), "utf-8");
    if (text.includes("googleapis")) offenders.push(file);
  }

  assert.deepEqual(offenders, []);
});
