import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";

import {
  buildSyncEnvironment,
  DEFAULT_GOOGLE_CREDENTIALS_PATH,
  parseSyncArgs,
  promoteMaterialisedAuthorityReference,
} from "../scripts/refresh_authority_reference_from_google.js";

const minimalValidMaterialised = Object.freeze({
  USERS: [{ id: "u1", email_login: "user@example.com", contact_roles_assigned: "internal_user" }],
  SYSTEM: [],
  OPTICS: [],
  ACCESSORIES: [],
  SPEC_CODES: [],
  BOARDS: [],
  DRIVERS: [],
  PURE_REF_STATE: [],
  SYSTEM_COMPONENTS: [],
  SYSTEM_BOM_DEFAULTS: [],
  SYSTEM_POLICY: [],
  FIELD_EDITABILITY: [],
  ROLES_AND_LANES: [],
  CODE_POLICY: [],
  MESSAGES: [],
});

test("manual Google sync CLI args default to dry-run and require explicit apply", () => {
  assert.deepEqual(parseSyncArgs([]), {
    dryRun: true,
    apply: false,
    promote: false,
    help: false,
    sheetId: "",
    credentials: "",
  });

  assert.deepEqual(parseSyncArgs(["--apply", "--promote", "--sheet-id=abc", "--credentials=C:\\_secrets\\ControlStack\\novon_db_key.json"]), {
    dryRun: false,
    apply: true,
    promote: true,
    help: false,
    sheetId: "abc",
    credentials: "C:\\_secrets\\ControlStack\\novon_db_key.json",
  });
});

test("manual Google sync helper resolves runtime secret defaults without putting secrets in the repo", async () => {
  const result = await buildSyncEnvironment({
    args: { apply: true, sheetId: "configured-provider-id", credentials: "" },
    env: {
      GOOGLE_APPLICATION_CREDENTIALS: DEFAULT_GOOGLE_CREDENTIALS_PATH,
    },
  });

  assert.equal(result.sheetIdConfigured, true);
  assert.equal(result.sheetIdSource, "cli-argument");
  assert.equal(result.credentialsConfigured, true);
  assert.equal(result.credentialPathReturned, false);
  assert.equal(result.sheetIdReturned, false);
  assert.equal(result.env.CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_ENABLED, "true");
  assert.equal(result.env.CONTROLSTACK_AUTHORITY_REFERENCE_MATERIALISER_EXECUTION_ENABLED, "true");
  assert.equal(result.env.CONTROLSTACK_AUTHORITY_REFERENCE_GOOGLE_SHEET_ID, "configured-provider-id");
});

test("promotion dry-run validates materialised JSON but writes nothing", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-auth-promote-dry-"));
  try {
    const materialisedPath = join(root, "materialised.json");
    const activeSnapshotPath = join(root, "active.json");
    const archiveRoot = join(root, "archive");
    await writeFile(materialisedPath, `${JSON.stringify(minimalValidMaterialised, null, 2)}\n`, "utf-8");
    await writeFile(activeSnapshotPath, "{\"old\":true}\n", "utf-8");

    const result = await promoteMaterialisedAuthorityReference({
      dryRun: true,
      materialisedPath,
      activeSnapshotPath,
      archiveRoot,
      now: new Date("2026-07-07T00:00:00.000Z"),
    });

    assert.equal(result.ok, true);
    assert.equal(result.status, "promotion-dry-run-ready");
    assert.equal(result.writePolicy.activeSnapshotWriteEnabled, false);
    assert.equal(await readFile(activeSnapshotPath, "utf-8"), "{\"old\":true}\n");
    await assert.rejects(() => readdir(archiveRoot));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("invalid materialised JSON does not overwrite active snapshot", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-auth-promote-block-"));
  try {
    const materialisedPath = join(root, "materialised.json");
    const activeSnapshotPath = join(root, "active.json");
    const archiveRoot = join(root, "archive");
    await writeFile(materialisedPath, "{\"SYSTEM\":[]}\n", "utf-8");
    await writeFile(activeSnapshotPath, "{\"old\":true}\n", "utf-8");

    const result = await promoteMaterialisedAuthorityReference({
      dryRun: false,
      materialisedPath,
      activeSnapshotPath,
      archiveRoot,
      now: new Date("2026-07-07T00:00:00.000Z"),
    });

    assert.equal(result.ok, false);
    assert.equal(result.status, "promotion-blocked");
    assert.ok(result.blockers.some((item) => item.code === "users-table-missing"));
    assert.equal(result.writePolicy.activeSnapshotWriteEnabled, false);
    assert.equal(await readFile(activeSnapshotPath, "utf-8"), "{\"old\":true}\n");
    await assert.rejects(() => readdir(archiveRoot));
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("valid promotion archives before replacing active snapshot", async () => {
  const root = await mkdtemp(join(tmpdir(), "cs-auth-promote-live-"));
  try {
    const materialisedPath = join(root, "materialised.json");
    const activeSnapshotPath = join(root, "novondb.json");
    const archiveRoot = join(root, "archive");
    const nextText = `${JSON.stringify(minimalValidMaterialised, null, 2)}\n`;
    await writeFile(materialisedPath, nextText, "utf-8");
    await writeFile(activeSnapshotPath, "{\"old\":true}\n", "utf-8");

    const result = await promoteMaterialisedAuthorityReference({
      dryRun: false,
      materialisedPath,
      activeSnapshotPath,
      archiveRoot,
      now: new Date("2026-07-07T00:00:00.000Z"),
    });

    assert.equal(result.ok, true);
    assert.equal(result.status, "promotion-completed");
    assert.equal(result.writePolicy.activeSnapshotWriteEnabled, true);
    assert.equal(await readFile(activeSnapshotPath, "utf-8"), nextText);
    const archiveNames = await readdir(archiveRoot);
    assert.equal(archiveNames.length, 1);
    assert.match(archiveNames[0], /novondb\.json$/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
