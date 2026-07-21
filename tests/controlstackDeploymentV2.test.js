import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { EventEmitter } from "node:events";
import { readFileSync } from "node:fs";
import http from "node:http";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  extractManagerTargets,
  httpRequest,
  loadAndValidateManifest,
  probeControlUiReadiness,
  processControlSource,
  restartSelectorRuntimeOnly,
  validateLiveEndpoints,
  validateServiceTopology,
  waitForManagerReady,
  waitForSelectorRuntimeReady,
} from "../scripts/CONTROLSTACK_DEPLOYMENT_V2_INSTALL.mjs";
import {
  createControlServer,
  createManagerReadinessState,
  DEPLOYMENT_V2_MANAGER_IDENTITY,
} from "../scripts/deployment-v2/controlstack_lane_manager.mjs";
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
const governanceProvisionerPath = path.join(repoRoot, "scripts", "CONTROLSTACK_GOVERNANCE_SHELL_PROVISION.ps1");
const governanceGatePath = path.join(repoRoot, "scripts", "governance_shell_lane_gate.py");

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  return server.address().port;
}

async function close(server) {
  await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

function selectorRuntimePayload() {
  return {
    owner: "runtime-server",
    status: "ready",
    source: "white-label-config-boundary-foundation",
    browserSecretsExposed: false,
    repoLocalSecrets: false,
    logoDev: { configured: true },
  };
}

function selectorProcessIdentity(service, processId) {
  return {
    ProcessId: processId,
    ExecutablePath: service.executable,
    CommandLine: `"${service.executable}" ${service.args.join(" ")}`,
  };
}

function listenerSnapshot(manifest, selectorProcessId) {
  return manifest.services.map((service, index) => ({
    Port: service.port,
    ProcessId: service.id === "selector-runtime" ? selectorProcessId : 20000 + index,
  }));
}

test("deployment manifest defines the accepted nine-service topology and canonical 8788 shell", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  assert.equal(manifest.services.length, 9);
  assert.equal(manifest.worktrees.length, 5);
  assert.deepEqual(manifest.services.map((item) => item.port).sort((a, b) => a - b), [8000, 8021, 8022, 8023, 8080, 8081, 8082, 8788, 8899]);
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

test("Selector MCP write guard appends only the approved exact Selector summary file and lane context", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const selectorMcp = manifest.services.find((item) => item.id === "selector-mcp");
  const exactFile = "packages/modules/cs-selector/selectorFactoryApprovedInputsSummary.js";
  const laneContext = ["docs", "_context", "lanes", "selector-engine", "**"].join("/");
  const moduleWildcard = ["packages", "modules", "**"].join("/");
  const selectorModuleWildcard = ["packages", "modules", "cs-selector", "**"].join("/");
  const configuredGlobs = selectorMcp.env.CONTROLSTACK_ALLOWED_WRITE_GLOBS.split(";");
  const expectedGlobs = [
    ["apps", "**"].join("/"),
    ["packages", "workspace-kernel", "**"].join("/"),
    ["packages", "runtime-web", "**"].join("/"),
    "server.js",
    "tests/selector*.test.js",
    "tests/engine*.test.js",
    "tests/runtime*.test.js",
    "tests/runTable*.test.js",
    ["docs", "selector", "**"].join("/"),
    ["docs", "engine", "**"].join("/"),
    "package.json",
    "package-lock.json",
    exactFile,
    laneContext,
  ];

  assert.deepEqual(configuredGlobs, expectedGlobs);
  assert.equal(configuredGlobs.filter((item) => item === exactFile).length, 1);
  assert.equal(configuredGlobs.filter((item) => item === laneContext).length, 1);
  assert.equal(configuredGlobs.includes(moduleWildcard), false);
  assert.equal(configuredGlobs.includes(selectorModuleWildcard), false);
  assert.deepEqual(configuredGlobs.filter((item) => item.startsWith("packages/modules/")), [exactFile]);
});

test("Governance MCP is isolated to shell, persistence, identity and lane-owned tests", () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const governance = manifest.services.find((item) => item.id === "governance-mcp");
  const worktree = manifest.worktrees.find((item) => item.branch === "lane/governance-shell");
  assert.deepEqual(worktree, {
    root: "C:\\ControlStack_Worktrees\\governance-shell",
    branch: "lane/governance-shell",
  });
  assert.equal(governance.port, 8023);
  assert.equal(governance.env.CONTROLSTACK_RUNTIME_ROOT, "C:\\ControlStack_Worktrees\\governance-shell");
  assert.equal(governance.env.CONTROLSTACK_LANE_NAME, "governance-shell");
  assert.equal(governance.env.CONTROLSTACK_REQUIRED_BRANCH, "lane/governance-shell");
  assert.equal(governance.env.CONTROLSTACK_ALLOWED_GATES, "governance-shell");
  assert.equal(
    governance.env.CONTROLSTACK_GATE_RUNNER,
    "C:\\ControlStack_Worktrees\\governance-shell\\scripts\\governance_shell_lane_gate.py",
  );
  const configuredGlobs = governance.env.CONTROLSTACK_ALLOWED_WRITE_GLOBS.split(";");
  assert.deepEqual(configuredGlobs, [
    "apps/workspace-shell/**",
    "packages/workspace-kernel/savedProjectStore.js",
    "packages/workspace-kernel/projectService.js",
    "packages/workspace-kernel/identityService.js",
    "packages/workspace-kernel/governance/**",
    "server.js",
    "tests/runtimeShell*.test.js",
    "tests/runtimeProjectBrowser*.test.js",
    "tests/runtimeGovernance*.test.js",
    "tests/governance*.test.js",
    "docs/governance/**",
    "docs/_context/lanes/governance-shell/**",
    "package.json",
    "package-lock.json",
  ]);
  assert.equal(configuredGlobs.includes("packages/workspace-kernel/**"), false);
  assert.equal(configuredGlobs.includes("packages/modules/**"), false);
  assert.equal(configuredGlobs.some((item) => /cs-selector|lab-kernel|runtime-web/.test(item)), false);
  assert.equal(governance.env.CONTROLSTACK_ENABLE_DESTRUCTIVE, "0");
  assert.equal(governance.env.CONTROLSTACK_ENABLE_CROSS_ROOT_COPY, "0");
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
  assert.equal(manifest.services.length, 9);
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
  assert.match(manager, /\/healthz/);
  assert.match(manager, /\/readyz/);
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

test("control UI liveness is available before managed-service readiness", async () => {
  const readiness = createManagerReadinessState();
  let statusCalls = 0;
  const server = createControlServer({
    readiness,
    statusProvider: async () => {
      statusCalls += 1;
      return { verified: false, services: [] };
    },
  });
  const port = await listen(server);
  try {
    const health = await httpRequest(`http://127.0.0.1:${port}/healthz`, 500);
    assert.equal(health.statusCode, 200);
    assert.deepEqual(JSON.parse(health.body), { ok: true, ...DEPLOYMENT_V2_MANAGER_IDENTITY, liveness: "live" });
    const starting = await httpRequest(`http://127.0.0.1:${port}/readyz`, 500);
    assert.equal(starting.statusCode, 503);
    assert.equal(JSON.parse(starting.body).readiness, "starting");
    assert.equal(statusCalls, 0, "liveness and readiness probes must not scan service status");
    readiness.state = "ready";
    const ready = await httpRequest(`http://127.0.0.1:${port}/readyz`, 500);
    assert.equal(ready.statusCode, 200);
    assert.equal(JSON.parse(ready.body).readiness, "ready");
    assert.equal(statusCalls, 0);
  } finally {
    await close(server);
  }
});

test("readiness probing tolerates a slow final topology scan and preserves all nine services", async () => {
  const sourceManifest = loadAndValidateManifest(manifestPath);
  const readiness = createManagerReadinessState();
  readiness.state = "ready";
  const expectedServices = sourceManifest.services.map((service) => ({
    id: service.id,
    name: service.name,
    port: service.port,
    healthy: true,
    managed: true,
  }));
  const server = createControlServer({
    readiness,
    statusProvider: async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { verified: true, services: expectedServices };
    },
  });
  const port = await listen(server);
  try {
    const manifest = { ...sourceManifest, controlUi: { ...sourceManifest.controlUi, port } };
    const payload = await probeControlUiReadiness(manifest, {
      livenessTimeoutMs: 500,
      startupTimeoutMs: 500,
      statusTimeoutMs: 1000,
      statusRetryDelayMs: 10,
    });
    assert.equal(payload.services.length, 9);
    assert.deepEqual(payload.services.map((service) => service.id), sourceManifest.services.map((service) => service.id));
    assert.equal(validateServiceTopology(payload, manifest), payload);
  } finally {
    await close(server);
  }
});

test("stable readiness tolerates rotating transitional services and accepts recovery", async () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const healthyServices = manifest.services.map((service) => ({
    id: service.id,
    name: service.name,
    port: service.port,
    healthy: true,
    managed: true,
  }));
  const snapshots = [
    healthyServices.map((service) => service.id === "selector-runtime" ? { ...service, healthy: false } : service),
    healthyServices.map((service) => service.id === "program-tunnel" ? { ...service, healthy: false } : service),
    healthyServices,
    healthyServices,
  ];
  let statusCalls = 0;
  const request = async (url) => {
    if (url.endsWith("/healthz")) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, ...DEPLOYMENT_V2_MANAGER_IDENTITY, liveness: "live" }) };
    }
    if (url.endsWith("/readyz")) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, ...DEPLOYMENT_V2_MANAGER_IDENTITY, readiness: "ready" }) };
    }
    const services = snapshots[Math.min(statusCalls, snapshots.length - 1)];
    statusCalls += 1;
    return { statusCode: 200, body: JSON.stringify({ ok: true, verified: false, services }) };
  };

  const payload = await probeControlUiReadiness(manifest, {
    livenessTimeoutMs: 50,
    startupTimeoutMs: 50,
    statusTimeoutMs: 50,
    statusRetryDelayMs: 1,
    request,
    wait: async () => {},
  });
  assert.equal(statusCalls, 4);
  assert.equal(payload.services.every((service) => service.healthy && service.managed), true);
});

test("stable readiness requires two consecutive fully green observations", async () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const healthyServices = manifest.services.map((service) => ({
    id: service.id,
    name: service.name,
    port: service.port,
    healthy: true,
    managed: true,
  }));
  const transitional = healthyServices.map((service) => service.id === "lab-tunnel" ? { ...service, managed: false } : service);
  const snapshots = [healthyServices, transitional, healthyServices, healthyServices];
  let statusCalls = 0;
  const request = async (url) => {
    if (url.endsWith("/healthz")) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, ...DEPLOYMENT_V2_MANAGER_IDENTITY, liveness: "live" }) };
    }
    if (url.endsWith("/readyz")) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, ...DEPLOYMENT_V2_MANAGER_IDENTITY, readiness: "ready" }) };
    }
    const services = snapshots[Math.min(statusCalls, snapshots.length - 1)];
    statusCalls += 1;
    return { statusCode: 200, body: JSON.stringify({ ok: true, verified: false, services }) };
  };

  await probeControlUiReadiness(manifest, {
    livenessTimeoutMs: 50,
    startupTimeoutMs: 50,
    statusTimeoutMs: 50,
    statusRetryDelayMs: 1,
    request,
    wait: async () => {},
  });
  assert.equal(statusCalls, 4, "a transitional observation must reset the consecutive-green count");
});

test("persistent single-service readiness failure reports exact safe service details", async () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const failedService = manifest.services.find((service) => service.id === "program-tunnel");
  const services = manifest.services.map((service) => ({
    id: service.id,
    name: service.name,
    port: service.port,
    healthy: service.id !== failedService.id,
    managed: true,
  }));
  let clock = 0;
  const request = async (url) => {
    if (url.endsWith("/healthz")) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, ...DEPLOYMENT_V2_MANAGER_IDENTITY, liveness: "live" }) };
    }
    if (url.endsWith("/readyz")) {
      return { statusCode: 200, body: JSON.stringify({ ok: true, ...DEPLOYMENT_V2_MANAGER_IDENTITY, readiness: "ready" }) };
    }
    return { statusCode: 200, body: JSON.stringify({ ok: true, verified: false, services }) };
  };

  await assert.rejects(
    validateLiveEndpoints(manifest, "", {
      controlUi: {
        livenessTimeoutMs: 50,
        startupTimeoutMs: 50,
        statusTimeoutMs: 4,
        statusRetryDelayMs: 1,
      },
      request,
      now: () => clock,
      wait: async (ms) => { clock += Math.max(1, ms); },
    }),
    {
      code: "DEPLOYMENT_V2_STABLE_READINESS_FAILED",
      message: "Deployment v2 stable readiness failed: service ID=" + failedService.id +
        "; service name=" + failedService.name +
        "; port=" + failedService.port +
        "; healthy=false; managed=true; consecutive fully green observations=0/2; last safe local health result=HTTP 200.",
    },
  );
});

test("Selector readiness retries temporary restart unavailability and accepts the new runtime identity", async () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const selector = manifest.services.find((service) => service.id === "selector-runtime");
  let clock = 0;
  let identityCalls = 0;
  let requestCalls = 0;
  const result = await waitForSelectorRuntimeReady(manifest, {
    previousProcessId: 4100,
    requireNewProcess: true,
    startupTimeoutMs: 20,
    requestTimeoutMs: 5,
    retryDelayMs: 1,
    now: () => clock,
    wait: async (ms) => { clock += Math.max(1, ms); },
    processIdentity: () => {
      identityCalls += 1;
      return selectorProcessIdentity(selector, identityCalls < 3 ? 4100 : 4200);
    },
    request: async () => {
      requestCalls += 1;
      if (requestCalls === 1) throw new Error("temporary connection refusal");
      return { statusCode: 200, headers: {}, body: JSON.stringify(selectorRuntimePayload()) };
    },
  });
  assert.equal(result.identity.ProcessId, 4200);
  assert.equal(requestCalls, 2);
  assert.ok(identityCalls >= 4);
});

test("permanently unavailable Selector runtime fails with the exact safe request label", async () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const selector = manifest.services.find((service) => service.id === "selector-runtime");
  let clock = 0;
  await assert.rejects(
    waitForSelectorRuntimeReady(manifest, {
      previousProcessId: 4100,
      requireNewProcess: true,
      startupTimeoutMs: 5,
      requestTimeoutMs: 2,
      retryDelayMs: 1,
      now: () => clock,
      wait: async (ms) => { clock += Math.max(1, ms); },
      processIdentity: () => selectorProcessIdentity(selector, 4200),
      request: async () => { throw new Error("connection refused"); },
    }),
    { message: "Local health request failed: selector-runtime-config." },
  );
});

test("live validation reuses the slow-tolerant control probe and validates Selector endpoints", async () => {
  const sourceManifest = loadAndValidateManifest(manifestPath);
  const readiness = createManagerReadinessState();
  readiness.state = "ready";
  const expectedServices = sourceManifest.services.map((service) => ({
    id: service.id,
    name: service.name,
    port: service.port,
    healthy: true,
    managed: true,
  }));
  const server = createControlServer({
    readiness,
    statusProvider: async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      return { verified: true, services: expectedServices };
    },
  });
  const port = await listen(server);
  try {
    const manifest = { ...sourceManifest, controlUi: { ...sourceManifest.controlUi, port } };
    const selector = manifest.services.find((service) => service.id === "selector-runtime");
    const request = async (url, timeoutMs) => {
      if (url.startsWith(`http://127.0.0.1:${port}/`)) return httpRequest(url, timeoutMs);
      if (url.endsWith("/api/runtime-config/status")) {
        return { statusCode: 200, headers: {}, body: JSON.stringify(selectorRuntimePayload()) };
      }
      if (url.endsWith("/workspace")) return { statusCode: 200, headers: {}, body: "<html>workspace</html>" };
      throw new Error("unexpected local request");
    };
    const live = await validateLiveEndpoints(manifest, "pk_public-test-secret", {
      controlUi: { livenessTimeoutMs: 500, startupTimeoutMs: 500, statusTimeoutMs: 1000, statusRetryDelayMs: 10 },
      selector: { startupTimeoutMs: 500, requestTimeoutMs: 250, retryDelayMs: 1 },
      request,
      processIdentity: () => selectorProcessIdentity(selector, 4200),
    });
    assert.equal(live.statusPayload.services.length, 9);
    assert.equal(live.runtime.response.statusCode, 200);
    assert.equal(live.workspace.statusCode, 200);
  } finally {
    await close(server);
  }
});

test("Selector restart action cannot restart a non-Selector managed service", async () => {
  const manifest = loadAndValidateManifest(manifestPath);
  const selector = manifest.services.find((service) => service.id === "selector-runtime");
  const before = listenerSnapshot(manifest, 4100);
  const after = listenerSnapshot(manifest, 4200);
  const actions = [];
  const result = await restartSelectorRuntimeOnly(manifest, "installed-manager.mjs", before, {
    runAction: (...args) => { actions.push(args); },
    readListeners: () => after,
    processIdentity: () => selectorProcessIdentity(selector, 4200),
    request: async () => ({ statusCode: 200, headers: {}, body: JSON.stringify(selectorRuntimePayload()) }),
    selector: { startupTimeoutMs: 20, requestTimeoutMs: 5, retryDelayMs: 1 },
  });
  assert.deepEqual(actions, [["installed-manager.mjs", "restart", "selector-runtime"]]);
  assert.deepEqual(result.afterListeners, after);
  const beforeMap = new Map(before.map((item) => [item.Port, item.ProcessId]));
  for (const item of after) {
    if (item.Port !== selector.port) assert.equal(item.ProcessId, beforeMap.get(item.Port));
  }
});

test("local HTTP request detaches timeout and response handlers after settlement", async () => {
  const request = new EventEmitter();
  const response = new EventEmitter();
  request.setTimeout = () => {};
  request.destroy = () => {};
  response.setEncoding = () => {};
  const resultPromise = httpRequest("http://127.0.0.1/test", 50, {
    get: (_url, onResponse) => {
      queueMicrotask(() => {
        onResponse(response);
        response.emit("data", "ok");
        response.emit("end");
      });
      return request;
    },
  });
  assert.equal((await resultPromise).body, "ok");
  assert.equal(request.listenerCount("timeout"), 0);
  assert.equal(request.listenerCount("error"), 0);
  assert.equal(response.listenerCount("data"), 0);
  assert.equal(response.listenerCount("end"), 0);
  assert.equal(response.listenerCount("error"), 0);

  const timedRequest = new EventEmitter();
  timedRequest.setTimeout = () => {};
  timedRequest.destroy = () => {};
  await assert.rejects(
    httpRequest("http://127.0.0.1/timeout", 1, {
      get: () => {
        queueMicrotask(() => timedRequest.emit("timeout"));
        return timedRequest;
      },
    }),
    /timed out/,
  );
  assert.equal(timedRequest.listenerCount("timeout"), 0);
  assert.equal(timedRequest.listenerCount("error"), 0);
});

test("readiness probing rejects an unrelated HTTP 200 listener", async () => {
  const sourceManifest = loadAndValidateManifest(manifestPath);
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ ok: true, managerId: "unrelated-listener" }));
  });
  const port = await listen(server);
  try {
    const manifest = { ...sourceManifest, controlUi: { ...sourceManifest.controlUi, port } };
    await assert.rejects(
      probeControlUiReadiness(manifest, { livenessTimeoutMs: 500, startupTimeoutMs: 500, statusTimeoutMs: 500 }),
      /unexpected manager identity/,
    );
  } finally {
    await close(server);
  }
});

test("resolved manager readiness detaches child error and exit handlers", async () => {
  const child = new EventEmitter();
  const result = await waitForManagerReady(child, async () => "ready", "manager.log");
  assert.equal(result, "ready");
  assert.equal(child.listenerCount("error"), 0);
  assert.equal(child.listenerCount("exit"), 0);
  child.emit("exit", 1);
});

test("Governance lane provisioner is fixed, idempotent and cannot overwrite divergent founding records", () => {
  const provisioner = readFileSync(governanceProvisionerPath, "utf8");
  const gate = readFileSync(governanceGatePath, "utf8");
  for (const name of [
    "LANE_CHARTER.md", "LANE_STATE.md", "WORK_QUEUE.md",
    "DECISION_LOG.md", "EVIDENCE_INDEX.md", "SESSION_HANDOFF.md",
  ]) assert.match(provisioner, new RegExp(name.replace(".", "\\.")));
  assert.match(provisioner, /C:\\ControlStack_Worktrees\\governance-shell-bootstrap/);
  assert.match(provisioner, /lane\/governance-shell/);
  assert.match(provisioner, /worktree', 'add'/);
  assert.match(provisioner, /Get-FileHash/);
  assert.match(provisioner, /GeneratedFoundingFiles/);
  assert.match(provisioner, /approved Program ruling/);
  assert.match(provisioner, /Resolve-BootstrapFile/);
  assert.match(provisioner, /\$script:UsedBootstrapPaths/);
  assert.doesNotMatch(provisioner, /-UsedPaths/);
  assert.match(provisioner, /ambiguous drafted source/);
  assert.match(provisioner, /\$FoundingFiles\.Keys/);
  assert.match(provisioner, /governance_shell_lane_gate\.py/);
  assert.match(provisioner, /CONTROLSTACK_DEPLOYMENT_V2_INSTALL\.mjs/);
  assert.match(provisioner, /governance-mcp/);
  assert.doesNotMatch(provisioner, /Remove-Item|git\.exe[^\n]*(?:reset|clean)|--force-with-lease/i);
  const escapedProvisionerPath = governanceProvisionerPath.replaceAll("'", "''");
  const syntax = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", `[void][scriptblock]::Create([IO.File]::ReadAllText('${escapedProvisionerPath}'))`],
    { encoding: "utf8" },
  );
  assert.equal(syntax.status, 0, syntax.stderr);
  const bootstrapPreflight = spawnSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", governanceProvisionerPath, "-PreflightOnly"],
    { encoding: "utf8" },
  );
  assert.equal(bootstrapPreflight.status, 0, `${bootstrapPreflight.stdout}\n${bootstrapPreflight.stderr}`);
  assert.match(bootstrapPreflight.stdout, /PREFLIGHT: SIX FOUNDING RECORDS RESOLVED/);
  assert.equal((bootstrapPreflight.stdout.match(/ <= /g) || []).length, 6);

  assert.match(gate, /GATE_NAME = "governance-shell"/);
  assert.match(gate, /REQUIRED_BRANCH = "lane\/governance-shell"/);
  assert.match(gate, /tests\/runtimeShell\*\.test\.js/);
  assert.match(gate, /tests\/runtimeProjectBrowser\*\.test\.js/);
  assert.match(gate, /shell=False/);
  assert.doesNotMatch(gate, /shell=True|os\.system|eval\(|exec\(/);
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
  assert.match(host.stdout, /9 services/);
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
  assert.match(installer, /restartSelectorRuntimeOnly\(manifest, installed\.installedManager, afterActivation\)/);
  assert.match(installer, /runAction\(installedManager, "restart", "selector-runtime"\)/);
  assert.match(installer, /waitForSelectorRuntimeReady/);
  assert.match(installer, /assertOnlySelectorRestarted/);
  assert.match(installer, /selector-runtime-config/);
  assert.match(installer, /selector-workspace/);
  assert.match(installer, /control-ui-status/);
  assert.match(installer, /runtimeReportsLogoConfigured/);
  assert.match(installer, /assertDeploymentLogsDoNotContain/);
  assert.match(installer, /assertFeatureWorktreesUnchanged/);
  assert.match(installer, /runtime-config\/status/);
  assert.match(installer, /http:\/\/127\.0\.0\.1:8788\/workspace/);
  assert.match(installer, /sourceBackedLogoUrlProduced/);
  assert.match(installer, /controlUiManagerReloaded/);
  assert.match(installer, /waitForManagerReady/);
  assert.match(installer, /probeControlUiReadiness/);
  assert.match(installer, /\/healthz/);
  assert.match(installer, /\/readyz/);
  assert.match(installer, /CONTROL_UI_STATUS_TIMEOUT_MS = 180000/);
  assert.match(installer, /CONTROL_UI_REQUIRED_GREEN_OBSERVATIONS = 2/);
  assert.match(installer, /--verify-consolidation/);
  assert.match(installer, /controlstack-manager-ui\.log/);
  assert.match(installer, /stdio: \["ignore", managerLogHandle, managerLogHandle\]/);
  assert.match(installer, /Validating Windows host and user/);
  assert.match(installer, /Checking that every previously installed managed service is listening/);
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
