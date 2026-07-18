import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  extractManagerTargets,
  loadAndValidateManifest,
  processControlSource,
} from "../scripts/CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs";
import {
  LOGODEV_VARIABLE,
  parseAllowlistedBatAssignment,
} from "../scripts/deployment-v2/controlstack_secret_store.mjs";
import { loadManifest } from "../scripts/deployment-v2/controlstack_service_host.mjs";

const root = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(root, "..");
const deploymentRoot = path.join(repoRoot, "scripts", "deployment-v2");
const manifestPath = path.join(deploymentRoot, "controlstack-services.v2.json");
const installerPath = path.join(repoRoot, "scripts", "CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs");
const launcherPath = path.join(repoRoot, "scripts", "CONTROLSTACK_DEPLOYMENT_V2_CONSOLIDATE.bat");
const managerPath = path.join(deploymentRoot, "controlstack_lane_manager.mjs");
const hostPath = path.join(deploymentRoot, "controlstack_service_host.mjs");
const secretPath = path.join(deploymentRoot, "controlstack_secret_store.mjs");
const uiPath = path.join(deploymentRoot, "controlstack_manager_ui.html");

test("deployment manifest defines the accepted eight-service topology and canonical 8788 shell", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  assert.equal(manifest.services.length, 8);
  assert.equal(manifest.worktrees.length, 4);
  assert.deepEqual(manifest.services.map((item) => item.port).sort((a, b) => a - b), [8000, 8021, 8022, 8080, 8081, 8082, 8788, 8899]);
  assert.equal(manifest.services.filter((item) => item.credential === "control-plane-api-key").length, 3);
  assert.equal(manifest.services.some((item) => item.port === 8787), false);
  assert.equal(JSON.stringify(manifest).includes("8787"), false);

  const selector = manifest.services.find((item) => item.id === "selector-runtime");
  assert.equal(selector.port, 8788);
  assert.equal(selector.cwd, "C:\\ControlStack_Worktrees\\selector-engine");
  assert.deepEqual(selector.args, ["server.js"]);
  assert.deepEqual(selector.protectedSecretIds, ["logodev-publishable-key"]);
  assert.equal(manifest.controlUi.host, "127.0.0.1");
  assert.equal(manifest.controlUi.port, 8790);
});

test("Logo.dev configuration is allowlisted, external and selector-runtime only", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  assert.equal(manifest.protectedEnvironment.length, 1);
  assert.deepEqual(manifest.protectedEnvironment[0], {
    id: "logodev-publishable-key",
    variable: LOGODEV_VARIABLE,
    validator: "logodev-publishable-key",
    sourceFile: "C:\\_secrets\\ControlStack\\logo.env.bat",
    protectedFile: "C:\\ControlStack_Service_Manager\\deployment-v2\\secrets\\logodev-publishable-key.dpapi",
    serviceIds: ["selector-runtime"],
  });
  assert.equal(manifest.services.filter((item) => item.protectedSecretIds.length > 0).map((item) => item.id).join(","), "selector-runtime");
  const raw = readFileSync(manifestPath, "utf8");
  assert.doesNotMatch(raw, /LOGODEV_PUBLISHABLE_KEY\s*[:=]\s*["'][^"']+["']/);
  assert.doesNotMatch(raw, /(?:pk|sk)-[A-Za-z0-9_-]{12,}/);
});

test("BAT parser reads only the exact allowlisted Logo.dev assignment", () => {
  assert.equal(
    parseAllowlistedBatAssignment('@echo off\r\nset "LOGODEV_PUBLISHABLE_KEY=pk_public-123456"\r\n'),
    "pk_public-123456",
  );
  assert.equal(
    parseAllowlistedBatAssignment('set HUBSPOT_TOKEN=do-not-import\nset LOGODEV_PUBLISHABLE_KEY=pk_public.123456\nset DATABASE_URL=do-not-import\n'),
    "pk_public.123456",
  );
});

test("BAT parser rejects missing, duplicate, malformed and wrong-case Logo.dev assignments", () => {
  assert.throws(() => parseAllowlistedBatAssignment("set OTHER_KEY=value\n"), /missing/i);
  assert.throws(
    () => parseAllowlistedBatAssignment('set "LOGODEV_PUBLISHABLE_KEY=pk_public-123456"\nset LOGODEV_PUBLISHABLE_KEY=pk_public-123456\n'),
    /duplicate/i,
  );
  assert.throws(() => parseAllowlistedBatAssignment("set LOGODEV_PUBLISHABLE_KEY=bad value\n"), /malformed/i);
  assert.throws(() => parseAllowlistedBatAssignment("set logodev_publishable_key=pk_public-123456\n"), /exact allowlisted/i);
  assert.throws(() => parseAllowlistedBatAssignment("echo LOGODEV_PUBLISHABLE_KEY=pk_public-123456\n"), /malformed/i);
});

test("service host accepts the manifest and removes Logo.dev from non-selector child environments", () => {
  const manifest = loadManifest(manifestPath);
  assert.equal(manifest.services.length, 8);
  const host = readFileSync(hostPath, "utf8");
  assert.match(host, /delete childEnv\[LOGODEV_VARIABLE\]/);
  assert.match(host, /protectedEnvironmentFor\(manifest, service\)/);
  assert.match(host, /unprotectForCurrentUser\(protectedValue, spec\.validator\)/);
  assert.doesNotMatch(host, /console\.(?:log|error)[^\n]*LOGODEV/i);
});

test("protected secret storage uses current-user SecureString DPAPI over stdin", () => {
  const secret = readFileSync(secretPath, "utf8");
  assert.match(secret, /ConvertTo-SecureString -String \$v -AsPlainText -Force/);
  assert.match(secret, /ConvertFrom-SecureString -SecureString \$s/);
  assert.match(secret, /SecureStringToBSTR/);
  assert.match(secret, /input,/);
  assert.doesNotMatch(secret, /ProtectedData/);
  assert.doesNotMatch(secret, /-EncodedCommand[^\n]*checked/);
});

test("manager is the sole process-control authority and exposes only bounded loopback actions", () => {
  const manager = readFileSync(managerPath, "utf8");
  const ui = readFileSync(uiPath, "utf8");
  const startup = readFileSync(path.join(deploymentRoot, "ControlStack-Lane-Services.vbs"), "utf8");

  assert.match(manager, /new Set\(\["status", "verify", "start", "stop", "restart"\]\)/);
  assert.match(manager, /serviceById/);
  assert.match(manager, /server\.listen\(manifest\.controlUi\.port, manifest\.controlUi\.host/);
  assert.match(manager, /Loopback access only/);
  assert.match(manager, /Refusing to stop an external listener/);
  assert.match(manager, /stopAuthority/);
  assert.match(manager, /new Map\(manifest\.services\.map/);
  const serveStart = manager.indexOf("async function serve()");
  const listenBoundary = manager.indexOf("server.listen", serveStart);
  const startupBoundary = manager.indexOf("const startup = mutationQueue.then", serveStart);
  assert.ok(serveStart >= 0 && listenBoundary > serveStart && startupBoundary > listenBoundary, "control UI must bind before managed-service startup");
  assert.match(manager, /managed-service startup failed/);
  assert.match(startup, /controlstack_lane_manager\.mjs"" serve/);
  assert.doesNotMatch(manager, /exec\s*\(/);
  assert.doesNotMatch(manager, /shell:\s*true/);

  assert.match(ui, /data-action="status"/);
  assert.match(ui, /data-action="verify"/);
  assert.match(ui, /data-action="start"/);
  assert.match(ui, /data-action="stop"/);
  assert.match(ui, /data-action="restart"/);
  assert.match(ui, /All Services/);
  assert.match(ui, /127\.0\.0\.1:8788\/workspace/);
  assert.doesNotMatch(ui, /command box|raw shell|eval\s*\(|new Function/i);
  assert.doesNotMatch(ui, /<input[^>]+(?:command|shell)/i);
});

test("installer, manager and service host self-tests pass without starting Windows services", () => {
  const installer = spawnSync(process.execPath, [installerPath, "--self-test"], { encoding: "utf8" });
  assert.equal(installer.status, 0, installer.stderr);
  assert.match(installer.stdout, /source self-test: PASS/);

  const manager = spawnSync(process.execPath, [managerPath, "self-test"], { encoding: "utf8" });
  assert.equal(manager.status, 0, manager.stderr);
  assert.match(manager.stdout, /self-test: PASS/);

  const host = spawnSync(process.execPath, [hostPath, "--self-test"], { encoding: "utf8" });
  assert.equal(host.status, 0, host.stderr);
  assert.match(host.stdout, /8 services/);
});

test("Windows consolidation launcher preserves the complete console result", () => {
  const launcher = readFileSync(launcherPath, "utf8");
  assert.match(launcher, /CONTROLSTACK_DEPLOYMENT_V2_INSTALL\.mjs" --consolidate/);
  assert.match(launcher, /set "EXIT_CODE=%ERRORLEVEL%"/);
  assert.match(launcher, /pause/i);
  assert.match(launcher, /exit \/b %EXIT_CODE%/i);
  assert.doesNotMatch(launcher, /LOGODEV|OPENAI_API_KEY|CONTROL_PLANE_API_KEY/i);
});

test("installer performs one idempotent consolidation operation and restarts only selector-runtime when required", () => {
  const installer = readFileSync(installerPath, "utf8");
  assert.match(installer, /--consolidate/);
  assert.match(installer, /storeLogoDevSecret/);
  assert.match(installer, /runManager\(installed\.installedManager, "restart", "selector-runtime"\)/);
  assert.match(installer, /assertOnlySelectorRestarted/);
  assert.match(installer, /runtimeReportsLogoConfigured/);
  assert.match(installer, /assertDeploymentLogsDoNotContain/);
  assert.match(installer, /assertFeatureWorktreesUnchanged/);
  assert.match(installer, /runtime-config\/status/);
  assert.match(installer, /http:\/\/127\.0\.0\.1:8788\/workspace/);
  assert.match(installer, /sourceBackedLogoUrlProduced/);
  assert.match(installer, /controlUiManagerReloaded/);
  assert.match(installer, /waitForManagerReady/);
  assert.match(installer, /controlstack-manager-ui\.log/);
  assert.match(installer, /stdio: \["ignore", managerLogHandle, managerLogHandle\]/);
  assert.match(installer, /Validating Windows host and user/);
  assert.match(installer, /Checking that all eight managed service ports are listening/);
  assert.match(installer, /Missing listener ports:/);
  assert.match(installer, /timeout: 30000/);
  assert.match(installer, /CONTROLSTACK PROGRAM SHELL V2: FAILED/);
  assert.match(installer, /Stage: /);
  assert.match(installer, /taskkill\.exe", \["\/PID", String\(identity\.ProcessId\), "\/F"\]/);
  assert.match(installer, /port8787ManagedOrRequired: false/);
  assert.doesNotMatch(installer, /LOGODEV_PUBLISHABLE_KEY=.*(?:pk|sk)-/);
});

test("legacy consolidation requires a proven ControlStack process-control startup chain", () => {
  const launcher = 'WScript.CreateObject("WScript.Shell").Run """C:\\ControlStack_Service_Manager\\old-panel\\manager.mjs""", 0, False';
  assert.deepEqual(extractManagerTargets(launcher), ["C:\\ControlStack_Service_Manager\\old-panel\\manager.mjs"]);
  assert.equal(processControlSource('const name = "ControlStack Service Manager"; spawn("node", []); // start stop restart'), true);
  assert.equal(processControlSource('const title = "ControlStack Service Manager";'), false);
  assert.equal(processControlSource('const title = "ControlStack logo asset";'), false);

  const installer = readFileSync(installerPath, "utf8");
  assert.match(installer, /proven-competing-controlstack-manager/);
  assert.match(installer, /retained-unproven-or-unrelated/);
  assert.match(installer, /Refusing to archive a file outside its proven root/);
  assert.match(installer, /ownership could not be proven/);
  assert.match(installer, /canonicalStartupReplacement/);
  assert.match(installer, /targetsCanonicalManager/);
  assert.match(installer, /canonicalManagerEntryReplacement/);
  assert.match(installer, /managerFileInventory/);
  assert.match(installer, /retained-protected-asset/);
  assert.match(installer, /unknownLogoAssetOrUnrelatedItemsTouched: false/);
  assert.match(installer, /CONTROLSTACK_PROGRAM_SHELL_V2_RESTORATION_/);
  assert.doesNotMatch(installer, /Get-NetTCPConnection[^\n]+8787/);
});

test("deployment keeps destructive cleanup and unrelated services out of scope", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  assert.equal(manifest.services.some((item) => /ngrok|router|logo|downstream/i.test(item.id)), false);
  assert.equal(manifest.services.some((item) => [path.basename(item.executable), ...item.args].some((token) => /^(rm|del|clean|reset)(\.exe)?$/i.test(token))), false);
  const installer = readFileSync(installerPath, "utf8");
  assert.doesNotMatch(installer, /schtasks\.exe/i);
  assert.doesNotMatch(installer, /Remove-Item|del\.exe|rmdir/i);
});

test("tunnel recovery still reuses the protected key and replaces only validated tunnel listeners", () => {
  const installer = readFileSync(installerPath, "utf8");
  const host = readFileSync(hostPath, "utf8");
  assert.match(installer, /--repair-tunnels/);
  assert.match(installer, /stopValidatedTemporaryTunnel/);
  assert.match(installer, /service\.credential === "control-plane-api-key"/);
  assert.match(host, /input: protectedValue/);
  assert.doesNotMatch(host, /encodedPowerShell\(script\), credentialFile/);
});

test("deployment JavaScript sources pass Node syntax checks", () => {
  for (const file of [installerPath, managerPath, hostPath, secretPath]) {
    const syntax = spawnSync(process.execPath, ["--check", file], { encoding: "utf8" });
    assert.equal(syntax.status, 0, `${path.basename(file)}: ${syntax.stderr}`);
  }
});

test("Lab memory checkpoint preserves the dirty IES parcel and commits only six staged docs", () => {
  const checkpointPath = path.join(repoRoot, "scripts", "CONTROLSTACK_LAB_MEMORY_CHECKPOINT.mjs");
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
