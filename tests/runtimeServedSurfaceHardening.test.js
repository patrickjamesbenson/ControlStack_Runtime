import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const serverSourceUrl = new URL("../server.js", import.meta.url);

async function serverText() {
  return readFile(serverSourceUrl, "utf-8");
}

test("health and runtime config status use public redaction instead of exposing runtime root", async () => {
  const source = await serverText();

  assert.match(source, /function sendPublicStatusJson/);
  assert.match(source, /function redactPublicLocalPathFields/);
  assert.match(source, /function shouldRedactPublicLocalPath/);
  assert.match(source, /localPathExposureEnabled: false/);
  assert.match(source, /rootRedacted: true/);
  assert.equal(source.includes("root: ROOT"), false);
  assert.match(source, /root: "redacted"/);
  assert.match(source, /requestUrl\.pathname === "\/" \|\| requestUrl\.pathname === "\/health"[\s\S]{0,120}sendPublicStatusJson/);
  assert.match(source, /requestUrl\.pathname === CONFIG_STATUS_PATH[\s\S]{0,120}sendPublicStatusJson/);
});

test("authority reference public status fields redact local default and materialised paths", async () => {
  const source = await serverText();

  assert.match(source, /defaultSnapshotPath: "redacted"/);
  assert.match(source, /defaultMaterialisedSourcePath: "redacted"/);
  assert.match(source, /defaultArchiveDir: "redacted"/);
  assert.match(source, /legacyTransitionalPath: "redacted"/);
  assert.match(source, /sendPublicStatusJson\(res, 200, await authorityReferenceAdminStatus\(\)\)/);
  assert.match(source, /sendPublicStatusJson\(res, 200, await authorityReferenceSourceMaterialisationStatus\(\)\)/);
  assert.match(source, /sendPublicStatusJson\(res, 200, await buildAuthorityReferenceMaterialiserStatus\(\{ env: materialiserEnv \}\)\)/);
});

test("normal workspace assets remain served while static patch artefacts are denied", async () => {
  const source = await serverText();

  assert.match(source, /requestUrl\.pathname === "\/workspace"[\s\S]{0,160}apps\/workspace-shell\/index\.html/);
  assert.match(source, /requestUrl\.pathname\.startsWith\("\/apps\/"\) \|\| requestUrl\.pathname\.startsWith\("\/packages\/"\)/);
  assert.match(source, /await serveFile\(res, resolveRuntimePath\(requestUrl\.pathname\)\)/);
  assert.match(source, /function isDeniedStaticServedFile/);
  assert.match(source, /if \(isDeniedStaticServedFile\(absolutePath\)\)/);
  assert.match(source, /staticArtifactDenied: true/);
});

test("static deny rules cover backup, temp, patch, diff, rejected, OS metadata, and tilde artefacts", async () => {
  const source = await serverText();

  assert.match(source, /STATIC_DENY_BASENAME_PATTERN/);
  assert.match(source, /\\\.bak/);
  assert.match(source, /\\\.tmp/);
  assert.match(source, /\\\.temp/);
  assert.match(source, /\\\.orig/);
  assert.match(source, /\\\.rej/);
  assert.match(source, /\\\.patch/);
  assert.match(source, /\\\.diff/);
  assert.match(source, /~\$/);
  assert.match(source, /\.DS_Store/);
  assert.match(source, /Thumbs\.db/);
});

test("runtime served-surface hardening does not broaden POST routes", async () => {
  const source = await serverText();
  const match = source.match(/const AUTH_REF_POST_PATHS = new Set\(\[([\s\S]*?)\]\);/);
  assert.ok(match, "AUTH_REF_POST_PATHS should remain explicit");
  const postList = match[1];

  for (const expected of [
    "AUTH_REF_SYNC_PATH",
    "AUTH_REF_MATERIALISER_REFRESH_PATH",
    "AUTH_REF_DIFF_PATH",
    "AUTH_REF_DIFF_DETAIL_PATH",
    "AUTH_REF_RESTORE_PREVIEW_PATH",
    "AUTH_REF_RESTORE_PATH",
  ]) {
    assert.match(postList, new RegExp(expected));
  }

  for (const forbidden of [
    "CONFIG_STATUS_PATH",
    "BOARD_DATA_STATUS_PATH",
    "IES_BUILDER_STATUS_PATH",
    "LAB_PROOF_STATUS_PATH",
    "SELECTOR_REFERENCE_STATUS_PATH",
    "SELECTOR_REFERENCE_OPTIONS_PATH",
  ]) {
    assert.equal(postList.includes(forbidden), false, `${forbidden} must not be POST-enabled`);
  }
});
