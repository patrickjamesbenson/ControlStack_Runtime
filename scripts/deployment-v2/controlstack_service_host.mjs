import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(here, "controlstack-services.v2.json");

export function loadManifest(file = manifestPath) {
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.schema !== "controlstack-deployment-v2/1" || !Array.isArray(manifest.services)) {
    throw new Error("Invalid ControlStack deployment manifest.");
  }
  const ids = new Set();
  const ports = new Set();
  for (const service of manifest.services) {
    if (!/^[a-z0-9-]+$/.test(service.id) || ids.has(service.id)) throw new Error("Invalid or duplicate service id.");
    if (!Number.isInteger(service.port) || ports.has(service.port)) throw new Error("Invalid or duplicate service port.");
    if (!path.win32.isAbsolute(service.executable) || !path.win32.isAbsolute(service.cwd)) throw new Error("Service paths must be absolute.");
    if (!Array.isArray(service.args) || !service.env || typeof service.env !== "object") throw new Error("Invalid service command shape.");
    ids.add(service.id);
    ports.add(service.port);
  }
  return manifest;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function portOpen(port) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host: "127.0.0.1", port });
    const finish = (value) => { socket.destroy(); resolve(value); };
    socket.setTimeout(800);
    socket.once("connect", () => finish(true));
    socket.once("timeout", () => finish(false));
    socket.once("error", () => finish(false));
  });
}

function encodedPowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

function decryptCredential(credentialFile) {
  const script = [
    "$ErrorActionPreference='Stop'",
    "$p=$args[0]",
    "$b=[Convert]::FromBase64String([IO.File]::ReadAllText($p).Trim())",
    "$u=[Security.Cryptography.ProtectedData]::Unprotect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)",
    "[Console]::OutputEncoding=[Text.Encoding]::UTF8",
    "[Console]::Write([Text.Encoding]::UTF8.GetString($u))",
  ].join(";");
  const result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", encodedPowerShell(script), credentialFile], {
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  if (result.status !== 0 || !result.stdout.startsWith("sk-")) throw new Error("Tunnel credential could not be decrypted.");
  return result.stdout.trim();
}

function writeState(stateRoot, service, childPid, status) {
  mkdirSync(stateRoot, { recursive: true });
  const target = path.join(stateRoot, service.id + ".json");
  const temp = target + ".tmp";
  writeFileSync(temp, JSON.stringify({
    schema: "controlstack-service-state/1",
    serviceId: service.id,
    port: service.port,
    hostPid: process.pid,
    childPid,
    executable: service.executable,
    status,
    updatedAt: new Date().toISOString(),
  }, null, 2) + "\n", "utf8");
  renameSync(temp, target);
}

async function run() {
  const manifest = loadManifest();
  const args = process.argv.slice(2);
  if (args.includes("--self-test")) {
    console.log("ControlStack service host self-test: PASS (" + manifest.services.length + " services)");
    return;
  }
  const index = args.indexOf("--service");
  const serviceId = index >= 0 ? args[index + 1] : "";
  const service = manifest.services.find((item) => item.id === serviceId);
  if (!service) throw new Error("A valid --service id is required.");
  if (process.platform !== "win32") throw new Error("ControlStack services run only on Windows.");
  if (!existsSync(service.executable) || !existsSync(service.cwd)) throw new Error("Service executable or working directory is missing.");

  const logRoot = path.join(manifest.installRoot, "logs");
  const stateRoot = path.join(manifest.installRoot, "state");
  mkdirSync(logRoot, { recursive: true });
  const logPath = path.join(logRoot, service.id + ".log");
  let backoff = 5000;

  for (;;) {
    if (await portOpen(service.port)) {
      appendFileSync(logPath, new Date().toISOString() + " port " + service.port + " already occupied; waiting\n");
      await delay(15000);
      continue;
    }

    const childEnv = { ...process.env, ...service.env };
    if (service.credential === "control-plane-api-key") {
      childEnv.CONTROL_PLANE_API_KEY = decryptCredential(manifest.credentialFile);
    }
    delete childEnv.OPENAI_API_KEY;
    const logHandle = openSync(logPath, "a");
    const child = spawn(service.executable, service.args, {
      cwd: service.cwd,
      env: childEnv,
      windowsHide: true,
      stdio: ["ignore", logHandle, logHandle],
    });
    delete childEnv.CONTROL_PLANE_API_KEY;
    writeState(stateRoot, service, child.pid, "running");
    appendFileSync(logPath, new Date().toISOString() + " started PID " + child.pid + "\n");

    const exitCode = await new Promise((resolve) => {
      child.once("error", () => resolve(1));
      child.once("exit", (code) => resolve(Number.isInteger(code) ? code : 1));
    });
    closeSync(logHandle);
    writeState(stateRoot, service, child.pid, "exited");
    appendFileSync(logPath, new Date().toISOString() + " exited " + exitCode + "; restarting\n");
    await delay(backoff);
    backoff = Math.min(backoff * 2, 60000);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  run().catch((error) => {
    console.error("ControlStack service host failed: " + (error?.message || "unknown error"));
    process.exitCode = 1;
  });
}
