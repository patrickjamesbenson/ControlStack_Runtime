import { spawn, spawnSync } from "node:child_process";
import { appendFileSync, closeSync, existsSync, mkdirSync, openSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import net from "node:net";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LOGODEV_VARIABLE, unprotectForCurrentUser } from "./controlstack_secret_store.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const manifestPath = path.join(here, "controlstack-services.v2.json");

export function loadManifest(file = manifestPath) {
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.schema !== "controlstack-deployment-v2/1" || !Array.isArray(manifest.services)) {
    throw new Error("Invalid ControlStack deployment manifest.");
  }
  if (!Array.isArray(manifest.protectedEnvironment) || manifest.protectedEnvironment.length !== 1) {
    throw new Error("Exactly one protected environment definition is required.");
  }

  const protectedIds = new Set();
  for (const item of manifest.protectedEnvironment) {
    if (item.id !== "logodev-publishable-key" || item.variable !== LOGODEV_VARIABLE) {
      throw new Error("Invalid protected environment definition.");
    }
    if (!path.win32.isAbsolute(item.protectedFile) || item.validator !== "logodev-publishable-key") {
      throw new Error("Invalid protected environment storage definition.");
    }
    if (!Array.isArray(item.serviceIds) || item.serviceIds.length !== 1 || item.serviceIds[0] !== "selector-runtime") {
      throw new Error("Logo.dev may be supplied only to selector-runtime.");
    }
    protectedIds.add(item.id);
  }

  const ids = new Set();
  const ports = new Set();
  for (const service of manifest.services) {
    if (!/^[a-z0-9-]+$/.test(service.id) || ids.has(service.id)) throw new Error("Invalid or duplicate service id.");
    if (!Number.isInteger(service.port) || ports.has(service.port) || service.port === 8787) throw new Error("Invalid or duplicate service port.");
    if (!path.win32.isAbsolute(service.executable) || !path.win32.isAbsolute(service.cwd)) throw new Error("Service paths must be absolute.");
    if (!Array.isArray(service.args) || !service.env || typeof service.env !== "object") throw new Error("Invalid service command shape.");
    if (Object.hasOwn(service.env, LOGODEV_VARIABLE)) throw new Error("Logo.dev plaintext must not appear in service env configuration.");
    if (!Array.isArray(service.protectedSecretIds)) throw new Error("Invalid protected secret binding.");
    for (const protectedId of service.protectedSecretIds) {
      if (!protectedIds.has(protectedId)) throw new Error("Unknown protected secret binding.");
      const spec = manifest.protectedEnvironment.find((item) => item.id === protectedId);
      if (!spec.serviceIds.includes(service.id)) throw new Error("Protected secret is bound to an unauthorised service.");
    }
    ids.add(service.id);
    ports.add(service.port);
  }
  const selector = manifest.services.find((service) => service.id === "selector-runtime");
  if (!selector || selector.port !== 8788 || selector.protectedSecretIds.length !== 1 || selector.protectedSecretIds[0] !== "logodev-publishable-key") {
    throw new Error("The canonical selector-runtime protected environment binding is invalid.");
  }
  if (manifest.services.some((service) => service.id !== "selector-runtime" && service.protectedSecretIds.length > 0)) {
    throw new Error("Logo.dev may be injected only into selector-runtime.");
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
  const protectedValue = readFileSync(credentialFile, "utf8").trim();
  const script = [
    "$ErrorActionPreference='Stop'",
    "$ProgressPreference='SilentlyContinue'",
    "$c=[Console]::In.ReadToEnd().Trim()",
    "$s=ConvertTo-SecureString $c",
    "$b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)",
    "try{$v=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($b)}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}",
    "[Console]::OutputEncoding=[Text.Encoding]::UTF8",
    "[Console]::Write($v)",
  ].join(";");
  const result = spawnSync("powershell.exe", [
    "-NoProfile", "-NonInteractive", "-InputFormat", "Text", "-OutputFormat", "Text",
    "-EncodedCommand", encodedPowerShell(script),
  ], {
    input: protectedValue,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 1024 * 1024,
  });
  const value = result.stdout.trim();
  if (result.status !== 0 || !value.startsWith("sk-")) throw new Error("Tunnel credential could not be decrypted.");
  return value;
}

function protectedEnvironmentFor(manifest, service) {
  return service.protectedSecretIds.map((id) => {
    const spec = manifest.protectedEnvironment.find((item) => item.id === id);
    if (!spec || !spec.serviceIds.includes(service.id)) throw new Error("Protected environment binding is invalid.");
    return spec;
  });
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
    delete childEnv.OPENAI_API_KEY;
    delete childEnv[LOGODEV_VARIABLE];

    if (service.credential === "control-plane-api-key") {
      childEnv.CONTROL_PLANE_API_KEY = decryptCredential(manifest.credentialFile);
    }
    for (const spec of protectedEnvironmentFor(manifest, service)) {
      const protectedValue = readFileSync(spec.protectedFile, "utf8").trim();
      childEnv[spec.variable] = unprotectForCurrentUser(protectedValue, spec.validator);
    }

    const logHandle = openSync(logPath, "a");
    const child = spawn(service.executable, service.args, {
      cwd: service.cwd,
      env: childEnv,
      windowsHide: true,
      stdio: ["ignore", logHandle, logHandle],
    });
    delete childEnv.CONTROL_PLANE_API_KEY;
    delete childEnv[LOGODEV_VARIABLE];

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
