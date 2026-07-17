import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import http from "node:http";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(readFileSync(path.join(here, "controlstack-services.v2.json"), "utf8"));
const hostPath = path.join(here, "controlstack_service_host.mjs");

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
  return JSON.parse(result.stdout.trim() || "{}");
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
  return JSON.parse(result.stdout.trim() || "{}");
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

function startHost(service) {
  const child = spawn(process.execPath, [hostPath, "--service", service.id], {
    cwd: here,
    detached: true,
    windowsHide: true,
    stdio: "ignore",
  });
  child.unref();
}

async function stopService(service) {
  const { statePath, state } = stateFor(service);
  const listener = listenerIdentity(service.port);

  if (!state || !hostIdentityMatches(service, state)) {
    if (listener.ProcessId) throw new Error("Refusing to stop an external listener on port " + service.port);
    rmSync(statePath, { force: true });
    return;
  }

  if (listener.ProcessId) {
    if (Number(state.childPid) !== Number(listener.ProcessId)) throw new Error("Refusing to stop an unrecorded listener on port " + service.port);
    if (path.win32.normalize(listener.ExecutablePath).toLowerCase() !== path.win32.normalize(service.executable).toLowerCase()) {
      throw new Error("Refusing to stop an unexpected executable on port " + service.port);
    }
  }

  const killed = spawnSync("taskkill.exe", ["/PID", String(state.hostPid), "/T", "/F"], { encoding: "utf8", windowsHide: true });
  if (killed.status !== 0 && (await portOpen(service.port))) throw new Error("Could not stop " + service.name);
  rmSync(statePath, { force: true });
}

async function waitFor(service, expected, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if ((await healthy(service)) === expected) return true;
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  return false;
}

async function managed(service) {
  const { state } = stateFor(service);
  return hostIdentityMatches(service, state);
}

async function status(requireManaged = false) {
  let all = true;
  console.log("\nControlStack Service Manager v2 — lane deployment\n");
  for (const service of manifest.services) {
    const ok = await healthy(service);
    const owned = await managed(service);
    const accepted = ok && (!requireManaged || owned);
    all &&= accepted;
    const label = ok ? (owned ? "READY / MANAGED" : "READY / EXTERNAL") : "STOPPED / UNHEALTHY";
    console.log(String(service.port).padStart(4) + "  " + service.name.padEnd(31) + label);
  }
  console.log("\nLegacy ngrok/router and unknown/logo services are outside this manager and remain untouched.");
  return all;
}

async function startAll() {
  for (const service of manifest.services) {
    if (await healthy(service)) continue;
    const { statePath, state } = stateFor(service);
    if (hostIdentityMatches(service, state)) continue;
    rmSync(statePath, { force: true });
    startHost(service);
  }
  const failed = [];
  for (const service of manifest.services) if (!(await waitFor(service, true))) failed.push(service.name);
  if (failed.length) throw new Error("Services did not become ready: " + failed.join(", "));
}

async function stopAll() {
  for (const service of [...manifest.services].reverse()) await stopService(service);
  for (const service of manifest.services) {
    if (!(await waitFor(service, false, 15000))) throw new Error(service.name + " did not stop.");
  }
}

async function main() {
  const action = (process.argv[2] || "status").toLowerCase();
  if (action === "self-test") {
    if (manifest.services.length !== 8 || !existsSync(hostPath)) throw new Error("Expected eight services and the service host.");
    console.log("ControlStack lane manager self-test: PASS");
    return;
  }
  if (process.platform !== "win32") throw new Error("ControlStack lane manager runs only on Windows.");
  if (action === "start") await startAll();
  else if (action === "stop") await stopAll();
  else if (action === "restart") { await stopAll(); await startAll(); }
  else if (action === "status" || action === "verify") {
    const ok = await status(action === "verify");
    if (!ok && action === "verify") process.exitCode = 2;
    return;
  } else throw new Error("Use start, stop, restart, status or verify.");
  await status(false);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error("ControlStack manager failed: " + (error?.message || "unknown error"));
    process.exitCode = 1;
  });
}
