import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { loadAndValidateManifest } from "../scripts/CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs";
import { loadManifest } from "../scripts/deployment-v2/controlstack_service_host.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(root, "..", "scripts", "deployment-v2", "controlstack-services.v2.json");

test("deployment manifest defines the accepted eight-service topology", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  assert.equal(manifest.services.length, 8);
  assert.equal(manifest.worktrees.length, 4);
  assert.deepEqual(manifest.services.map((x) => x.port).sort((a, b) => a - b), [8000, 8021, 8022, 8080, 8081, 8082, 8788, 8899]);
  assert.equal(manifest.services.filter((x) => x.credential === "control-plane-api-key").length, 3);
  assert.equal(new Set(manifest.services.map((x) => x.taskName)).size, 8);
});

test("service host accepts the same manifest and no tunnel key appears in it", () => {
  const manifest = loadManifest(manifestPath);
  assert.equal(manifest.services.length, 8);
  const raw = readFileSync(manifestPath, "utf8");
  assert.doesNotMatch(raw, /sk-[A-Za-z0-9_-]{12,}/);
  assert.doesNotMatch(raw, /CONTROL_PLANE_API_KEY\s*[:=]\s*['\"][^'\"]+/);
});

test("deployment keeps destructive cleanup and downstream services out of scope", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  assert.equal(manifest.services.some((x) => /ngrok|router|logo|downstream/i.test(x.id + x.name)), false);
  assert.equal(manifest.services.some((x) => [path.basename(x.executable), ...x.args].some((token) => /^(rm|del|clean|reset)(\.exe)?$/i.test(token))), false);
});


test("installer waits for the user to copy the key after the command has started", () => {
  const installer = readFileSync(path.join(root, "..", "scripts", "CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs"), "utf8");
  assert.match(installer, /async function waitForKeyCopy/);
  assert.match(installer, /await prompt\.question/);
  assert.match(installer, /let key = await waitForKeyCopy\(\)/);
});