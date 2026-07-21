import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadManifest } from "./controlstack_service_host.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = loadManifest(path.join(here, "controlstack-services.v2.json"));
const hostPath = path.join(here, "controlstack_service_host.mjs");
const uiPath = path.join(here, "controlstack_manager_ui.html");
const ALLOWED_ACTIONS = new Set(["status", "verify", "start", "stop", "restart"]);
export const DEPLOYMENT_V2_MANAGER_IDENTITY = Object.freeze({
  schema: "controlstack-deployment-v2-manager/1",
  managerId: "controlstack-deployment-v2-manager",
  deployment: "v2",
});

export function createManagerReadinessState() {
  return { state: "starting" };
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function portOpen(port, timeout = 900) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (value) => { socket.destroy(); resolve(value); };
    socket.setTimeout(timeout);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function httpCheck(health) {
  return new Promise((resolve) => {
    const request = http.get(health.url, { timeout: 2500 }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => {
        const statusOk = (health.acceptedStatus || [200]).includes(response.statusCode);
        const bodyOk = health.type !== "http-body" || body.trim() === health.body;
        resolve(statusOk && bodyOk);
      });
    });
    request.once("timeout", () => { request.destroy(); resolve(false); });
    request.once("error", () => resolve(false));
  });
}

async function healthy(service) {
  if (!(await portOpen(service.port))) return false;
  return service.health.type === "tcp" ? true : httpCheck(service.health);
}

function encodedPowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

function processIdentity(pid) {
  if (!Number.isInteger(Number(pid)) || Number(pid) <= 0) return {};
  const script = [
    "$p=Get-CimInstance Win32_Process -Filter ('ProcessId=' + " + Number(pid) + ") -ErrorAction SilentlyContinue",
    "if($null -eq $p){'{}';exit 0}",
    "[pscustomobject]@{ProcessId=[int]$p.ProcessId;ExecutablePath=[string]$p.ExecutablePath;CommandLine=[string]$p.CommandLine}|ConvertTo-Json -Compress",
  ].join(";");
  const result = spawnSync("powershell.exe", [
    "-NoProfile", "-NonInteractive", "-InputFormat", "Text", "-OutputFormat", "Text",
    "-EncodedCommand", encodedPowerShell("$ProgressPreference='SilentlyContinue';" + script),
  ], {
    encoding: "utf8", windowsHide: true,
  });
  if (result.status !== 0) return {};
  try { return JSON.parse(result.stdout.trim() || "{}"); } catch { return {}; }
}

function listenerIdentity(port) {
  const script = [
    "$c=Get-NetTCPConnection -State Listen -LocalPort " + port + " -ErrorAction SilentlyContinue|Select-Object -First 1",
    "if($null -eq $c){'{}';exit 0}",
    "$p=Get-CimInstance Win32_Process -Filter ('ProcessId='+$c.OwningProcess)",
    "[pscustomobject]@{ProcessId=[int]$c.OwningProcess;ExecutablePath=[string]$p.ExecutablePath}|ConvertTo-Json -Compress",
  ].join(";");
  const result = spawnSync("powershell.exe", [
    "-NoProfile", "-NonInteractive", "-InputFormat", "Text", "-OutputFormat", "Text",
    "-EncodedCommand", encodedPowerShell("$ProgressPreference='SilentlyContinue';" + script),
  ], {
    encoding: "utf8", windowsHide: true,
  });
  if (result.status !== 0) return {};
  try { return JSON.parse(result.stdout.trim() || "{}"); } catch { return {}; }
}

function stateFor(service) {
  const statePath = path.join(manifest.installRoot, "state", service.id + ".json");
  if (!existsSync(statePath)) return { statePath, state: null };
  try {
    return { statePath, state: JSON.parse(readFileSync(statePath, "utf8")) };
  } catch {
    return { statePath, state: null };
  }
}

function hostIdentityMatches(service, state) {
  if (!state || state.serviceId !== service.id || Number(state.port) !== service.port) return false;
  const identity = processIdentity(Number(state.hostPid));
  if (!identity.ProcessId) return false;
  if (path.win32.normalize(identity.ExecutablePath).toLowerCase() !== path.win32.normalize(process.execPath).toLowerCase()) return false;
  const commandLine = String(identity.CommandLine || "").toLowerCase();
  return commandLine.includes(hostPath.toLowerCase()) && commandLine.includes("--service") && commandLine.includes(service.id.toLowerCase());
}

function serviceById(serviceId) {
  const service = manifest.services.find((item) => item.id === serviceId);
  if (!service) throw new Error("The requested service id is not allowlisted.");
  return service;
}

function assertStartable(service) {
  if (!existsSync(service.executable) || !existsSync(service.cwd)) {
    throw new Error("Service executable or working directory is missing for " + service.name);
  }
}

function startHost(service) {
  assertStartable(service);
  const child = spawn(process.execPath, [hostPath, "--service", service.id], {
    cwd: here,
    detached: true,
    windowsHide: true,
    stdio: "ignore",
  });
  child.unref();
}

function stopAuthority(service) {
  const { statePath, state } = stateFor(service);
  const listener = listenerIdentity(service.port);

  if (!state || !hostIdentityMatches(service, state)) {
    if (listener.ProcessId) throw new Error("Refusing to stop an external listener on port " + service.port);
    return { statePath, state: null };
  }

  if (listener.ProcessId) {
    if (Number(state.childPid) !== Number(listener.ProcessId)) throw new Error("Refusing to stop an unrecorded listener on port " + service.port);
    if (path.win32.normalize(listener.ExecutablePath).toLowerCase() !== path.win32.normalize(service.executable).toLowerCase()) {
      throw new Error("Refusing to stop an unexpected executable on port " + service.port);
    }
  }
  return { statePath, state };
}

async function stopService(service, authority = stopAuthority(service)) {
  const { statePath, state } = authority;
  if (!state) {
    rmSync(statePath, { force: true });
    return;
  }

  const killed = spawnSync("taskkill.exe", ["/PID", String(state.hostPid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
  if (killed.status !== 0 && (await portOpen(service.port))) throw new Error("Could not stop " + service.name);
  rmSync(statePath, { force: true });
}

async function waitFor(service, expected, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await healthy(service)) === expected) return true;
    await delay(1000);
  }
  return false;
}

async function managed(service) {
  const { state } = stateFor(service);
  return hostIdentityMatches(service, state);
}

async function serviceSnapshot(serviceId = "all") {
  const selected = serviceId === "all" ? manifest.services : [serviceById(serviceId)];
  return Promise.all(selected.map(async (service) => ({
    id: service.id,
    name: service.name,
    port: service.port,
    healthy: await healthy(service),
    managed: await managed(service),
  })));
}

async function status(requireManaged = false, print = true, serviceId = "all") {
  const services = await serviceSnapshot(serviceId);
  const verified = services.every((service) => service.healthy && (!requireManaged || service.managed));
  if (print) {
    console.log("\nControlStack Service Manager Deployment v2\n");
    for (const service of services) {
      const label = service.healthy ? (service.managed ? "READY / MANAGED" : "READY / EXTERNAL") : "STOPPED / UNHEALTHY";
      console.log(String(service.port).padStart(4) + "  " + service.name.padEnd(38) + label);
    }
    console.log("\nCanonical runtime shell: http://127.0.0.1:8788/workspace");
    console.log("Control UI: http://" + manifest.controlUi.host + ":" + manifest.controlUi.port + manifest.controlUi.path);
    console.log("Port 8787 and unknown/logo services are outside this manager and remain untouched.");
  }
  return { verified, services };
}

async function startService(service) {
  if (await healthy(service)) return;
  const { statePath, state } = stateFor(service);
  if (hostIdentityMatches(service, state)) {
    if (!(await waitFor(service, true))) throw new Error(service.name + " did not become ready.");
    return;
  }
  rmSync(statePath, { force: true });
  startHost(service);
  if (!(await waitFor(service, true))) throw new Error(service.name + " did not become ready.");
}

async function startAll() {
  for (const service of manifest.services) assertStartable(service);
  for (const service of manifest.services) await startService(service);
}

async function stopAll() {
  const authorities = new Map(manifest.services.map((service) => [service.id, stopAuthority(service)]));
  for (const service of [...manifest.services].reverse()) await stopService(service, authorities.get(service.id));
  for (const service of manifest.services) {
    if (!(await waitFor(service, false, 15000))) throw new Error(service.name + " did not stop.");
  }
}

async function restartService(service) {
  await stopService(service);
  if (!(await waitFor(service, false, 15000))) throw new Error(service.name + " did not stop.");
  await startService(service);
}

async function performAction(action, serviceId = "all") {
  if (!ALLOWED_ACTIONS.has(action)) throw new Error("The requested action is not allowlisted.");
  if (serviceId !== "all") serviceById(serviceId);

  if (action === "status") return status(false, false, serviceId);
  if (action === "verify") return status(true, false, serviceId);

  if (serviceId === "all") {
    if (action === "start") await startAll();
    else if (action === "stop") await stopAll();
    else if (action === "restart") {
      for (const service of manifest.services) assertStartable(service);
      await stopAll();
      await startAll();
    }
  } else {
    const service = serviceById(serviceId);
    if (action === "start") await startService(service);
    else if (action === "stop") {
      await stopService(service);
      if (!(await waitFor(service, false, 15000))) throw new Error(service.name + " did not stop.");
    } else if (action === "restart") {
      assertStartable(service);
      await restartService(service);
    }
  }

  return status(false, false, serviceId);
}

function isLoopback(address) {
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function sendJson(response, statusCode, value) {
  const body = JSON.stringify(value);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Content-Security-Policy": "default-src 'none'",
  });
  response.end(body);
}

function sendHtml(response) {
  const body = readFileSync(uiPath);
  response.writeHead(200, {
    "Content-Type": "text/html; charset=utf-8",
    "Content-Length": body.length,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'",
  });
  response.end(body);
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 4096) reject(new Error("The control request is too large."));
    });
    request.on("end", () => {
      try { resolve(JSON.parse(body || "{}")); } catch { reject(new Error("The control request is not valid JSON.")); }
    });
    request.on("error", () => reject(new Error("The control request could not be read.")));
  });
}

let mutationQueue = Promise.resolve();
function serialisedAction(action, serviceId) {
  const run = () => performAction(action, serviceId);
  if (action === "status" || action === "verify") return run();
  const pending = mutationQueue.then(run, run);
  mutationQueue = pending.catch(() => undefined);
  return pending;
}

export function createControlServer({
  readiness = createManagerReadinessState(),
  statusProvider = () => status(false, false),
} = {}) {
  return http.createServer(async (request, response) => {
    if (!isLoopback(request.socket.remoteAddress)) {
      sendJson(response, 403, { ok: false, error: "Loopback access only." });
      return;
    }
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    if (request.method === "GET" && (requestUrl.pathname === "/" || requestUrl.pathname === "/index.html")) {
      sendHtml(response);
      return;
    }
    if (request.method === "GET" && requestUrl.pathname === "/healthz") {
      sendJson(response, 200, {
        ok: true,
        ...DEPLOYMENT_V2_MANAGER_IDENTITY,
        liveness: "live",
      });
      return;
    }
    if (request.method === "GET" && requestUrl.pathname === "/readyz") {
      const ready = readiness.state === "ready";
      sendJson(response, ready ? 200 : 503, {
        ok: ready,
        ...DEPLOYMENT_V2_MANAGER_IDENTITY,
        readiness: readiness.state,
      });
      return;
    }
    if (request.method === "GET" && requestUrl.pathname === "/api/status") {
      const result = await statusProvider();
      sendJson(response, 200, { ok: true, ...result });
      return;
    }
    if (request.method === "POST" && requestUrl.pathname === "/api/control") {
      try {
        const body = await readJsonBody(request);
        const action = typeof body.action === "string" ? body.action.toLowerCase() : "";
        const serviceId = typeof body.serviceId === "string" ? body.serviceId : "all";
        const result = await serialisedAction(action, serviceId);
        sendJson(response, 200, { ok: true, action, serviceId, ...result });
      } catch (error) {
        sendJson(response, 400, { ok: false, error: error?.message || "The bounded control operation failed." });
      }
      return;
    }
    sendJson(response, 404, { ok: false, error: "Not found." });
  });
}

async function serve() {
  if (!existsSync(uiPath)) throw new Error("The Deployment v2 control UI is missing.");
  const readiness = createManagerReadinessState();
  const server = createControlServer({ readiness });
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(manifest.controlUi.port, manifest.controlUi.host, resolve);
  });
  console.log("ControlStack Deployment v2 control UI: http://" + manifest.controlUi.host + ":" + manifest.controlUi.port + manifest.controlUi.path);

  const startup = mutationQueue.then(async () => {
    await startAll();
    readiness.state = "ready";
    console.log("ControlStack Deployment v2 managed-service startup: PASS");
  });
  mutationQueue = startup.catch((error) => {
    readiness.state = "failed";
    console.error("ControlStack Deployment v2 managed-service startup failed: " + (error?.message || "unknown error"));
  });
}

function selfTest() {
  if (manifest.services.length !== 9 || !existsSync(hostPath) || !existsSync(uiPath)) {
    throw new Error("Expected nine services, the service host and the control UI.");
  }
  if (manifest.services.some((service) => service.port === 8787)) throw new Error("Port 8787 must not be managed.");
  const selector = serviceById("selector-runtime");
  if (selector.port !== 8788 || selector.protectedSecretIds?.length !== 1) throw new Error("Selector runtime configuration is incomplete.");
  if (manifest.controlUi.host !== "127.0.0.1" || manifest.controlUi.port === 8787) throw new Error("The control UI must bind to a dedicated loopback port.");
  console.log("ControlStack lane manager self-test: PASS");
}

async function main() {
  const action = (process.argv[2] || "status").toLowerCase();
  const serviceId = process.argv[3] || "all";
  if (action === "self-test") {
    selfTest();
    return;
  }
  if (process.platform !== "win32") throw new Error("ControlStack lane manager runs only on Windows.");
  if (action === "serve") {
    await serve();
    return;
  }
  if (!ALLOWED_ACTIONS.has(action)) throw new Error("Use serve, start, stop, restart, status or verify with an optional allowlisted service id.");
  const result = await performAction(action, serviceId);
  if (action === "status" || action === "verify") await status(action === "verify", true, serviceId);
  else await status(false, true, serviceId);
  if (action === "verify" && !result.verified) process.exitCode = 2;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("ControlStack manager failed: " + (error?.message || "unknown error"));
    process.exitCode = 1;
  });
}
