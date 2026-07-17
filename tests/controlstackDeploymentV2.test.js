import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
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
  assert.equal(manifest.services.some((x) => Object.hasOwn(x, "taskName")), false);
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

test("credential storage uses the Windows PowerShell SecureString DPAPI path", () => {
  const installer = readFileSync(path.join(root, "..", "scripts", "CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs"), "utf8");
  const host = readFileSync(path.join(root, "..", "scripts", "deployment-v2", "controlstack_service_host.mjs"), "utf8");

  assert.match(installer, /ConvertTo-SecureString/);
  assert.match(installer, /ConvertFrom-SecureString/);
  assert.match(host, /ConvertTo-SecureString/);
  assert.match(host, /SecureStringToBSTR/);
  assert.doesNotMatch(installer, /ProtectedData/);
  assert.doesNotMatch(host, /ProtectedData/);
});

test("deployment uses one per-user startup entry and no Scheduled Task commands", () => {
  const installer = readFileSync(path.join(root, "..", "scripts", "CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs"), "utf8");
  const manager = readFileSync(path.join(root, "..", "scripts", "deployment-v2", "controlstack_lane_manager.mjs"), "utf8");
  const startup = readFileSync(path.join(root, "..", "scripts", "deployment-v2", "ControlStack-Lane-Services.vbs"), "utf8");

  assert.match(installer, /Microsoft.*Windows.*Start Menu.*Programs.*Startup/s);
  assert.match(installer, /Reusing the already protected deployment key/);
  assert.match(manager, /spawn\(process\.execPath, \[hostPath, "--service", service\.id\]/);
  assert.match(manager, /READY \/ MANAGED/);
  assert.match(startup, /controlstack_lane_manager\.mjs"" start/);
  assert.doesNotMatch(installer, /schtasks\.exe/i);
  assert.doesNotMatch(manager, /schtasks\.exe/i);
});


test("tunnel recovery reuses the protected key and replaces only validated tunnel listeners", () => {
  const installer = readFileSync(path.join(root, "..", "scripts", "CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs"), "utf8");
  const host = readFileSync(path.join(root, "..", "scripts", "deployment-v2", "controlstack_service_host.mjs"), "utf8");
  const manager = readFileSync(path.join(root, "..", "scripts", "deployment-v2", "controlstack_lane_manager.mjs"), "utf8");

  assert.match(installer, /--repair-tunnels/);
  assert.match(installer, /stopValidatedTemporaryTunnel/);
  assert.match(installer, /service\.credential === "control-plane-api-key"/);
  assert.match(installer, /otherManagedServicesRestarted: false/);
  assert.match(host, /input: protectedValue/);
  assert.doesNotMatch(host, /encodedPowerShell\(script\), credentialFile/);
  assert.match(manager, /"-OutputFormat", "Text"/);
  assert.doesNotMatch(manager, /execFileSync/);
});


test("Lab memory checkpoint preserves the dirty IES parcel and commits only six staged docs", () => {
  const checkpointPath = path.join(root, "..", "scripts", "CONTROLSTACK_LAB_MEMORY_CHECKPOINT.mjs");
  const syntax = spawnSync(process.execPath, ["--check", checkpointPath], { encoding: "utf8" });
  assert.equal(syntax.status, 0, syntax.stderr);
  const checkpoint = readFileSync(checkpointPath, "utf8");
  assert.match(checkpoint, /lane\/code-pilot-lab/);
  assert.match(checkpoint, /c4ab11e09e2469e43b84d507890fe802a9ebb85b/);
  assert.match(checkpoint, /docs\(lab\): establish durable lane memory/);
  assert.match(checkpoint, /GATE_RUNNER, "lab-ies", "--root", LAB_ROOT, "--required-branch", REQUIRED_BRANCH/);
  assert.match(checkpoint, /verifyInitialState\(before\)/);
  assert.match(checkpoint, /verifyProtectedAfterCommit\(gitState\(\)\)/);
  assert.match(checkpoint, /preserveLeading: true/);
  assert.match(checkpoint, /Committed paths/);
  assert.equal((checkpoint.match(/docs\/_context\/lanes\/lab-ies\//g) || []).length >= 6, true);
  assert.doesNotMatch(checkpoint, /\b(reset|clean|restore|checkout)\b/);
  assert.doesNotMatch(checkpoint, /rmSync|unlinkSync|rmdirSync/);
});
