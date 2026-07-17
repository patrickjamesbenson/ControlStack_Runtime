import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(here, "deployment-v2");
const sourceManifest = path.join(sourceRoot, "controlstack-services.v2.json");

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function encodedPowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

function powershell(script, input = undefined) {
  const result = spawnSync("powershell.exe", ["-NoProfile", "-NonInteractive", "-EncodedCommand", encodedPowerShell(script)], {
    input, encoding: "utf8", windowsHide: true, maxBuffer: 8 * 1024 * 1024,
  });
  if (result.status !== 0) throw new Error("A bounded Windows operation failed.");
  return result.stdout.trim();
}

export function loadAndValidateManifest(file = sourceManifest) {
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.schema !== "controlstack-deployment-v2/1") throw new Error("Unexpected deployment schema.");
  if (!Array.isArray(manifest.worktrees) || manifest.worktrees.length !== 4) throw new Error("Exactly four worktree identities are required.");
  if (!Array.isArray(manifest.services) || manifest.services.length !== 8) throw new Error("Exactly eight services are required.");
  const ids = new Set();
  const ports = new Set();
  const tasks = new Set();
  for (const service of manifest.services) {
    if (!/^[a-z0-9-]+$/.test(service.id) || ids.has(service.id)) throw new Error("Duplicate or invalid service id.");
    if (!Number.isInteger(service.port) || ports.has(service.port)) throw new Error("Duplicate or invalid service port.");
    if (!/^ControlStack-[A-Za-z-]+$/.test(service.taskName) || tasks.has(service.taskName)) throw new Error("Duplicate or invalid task name.");
    if (!["none", "control-plane-api-key"].includes(service.credential)) throw new Error("Invalid credential mode.");
    ids.add(service.id); ports.add(service.port); tasks.add(service.taskName);
  }
  return manifest;
}

function git(root, args) {
  return execFileSync("git.exe", ["-C", root, ...args], { encoding: "utf8", windowsHide: true }).trim();
}

function listeners(ports) {
  const script = [
    "$ports=@(" + ports.join(",") + ")",
    "$items=foreach($port in $ports){Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue|Select-Object -First 1|ForEach-Object{[pscustomobject]@{Port=$port;ProcessId=[int]$_.OwningProcess}}}",
    "ConvertTo-Json -InputObject @($items) -Compress",
  ].join(";");
  const value = powershell(script);
  return value ? JSON.parse(value) : [];
}

function taskExists(name) {
  return spawnSync("schtasks.exe", ["/Query", "/TN", name], { encoding: "utf8", windowsHide: true }).status === 0;
}

function createTask(service, installedHost) {
  const action = '"C:\\Program Files\\nodejs\\node.exe" "' + installedHost + '" --service ' + service.id;
  const result = spawnSync("schtasks.exe", [
    "/Create", "/SC", "ONLOGON", "/TN", service.taskName,
    "/TR", action, "/RL", "LIMITED", "/F",
  ], { encoding: "utf8", windowsHide: true });
  if (result.status !== 0) throw new Error("Scheduled Task creation failed for " + service.name);
}

function deleteTask(name) {
  spawnSync("schtasks.exe", ["/Delete", "/TN", name, "/F"], { encoding: "utf8", windowsHide: true });
}

function clipboardKey() {
  const value = powershell("[Console]::OutputEncoding=[Text.Encoding]::UTF8;[Console]::Write((Get-Clipboard -Raw))").trim();
  if (!/^sk-[\x21-\x7e]{20,}$/.test(value)) throw new Error("Copy a fresh OpenAI runtime API key before running the installer.");
  return value;
}

function encryptForCurrentUser(value) {
  const script = [
    "$v=[Console]::In.ReadToEnd().Trim()",
    "$b=[Text.Encoding]::UTF8.GetBytes($v)",
    "$p=[Security.Cryptography.ProtectedData]::Protect($b,$null,[Security.Cryptography.DataProtectionScope]::CurrentUser)",
    "[Console]::Write([Convert]::ToBase64String($p))",
  ].join(";");
  return powershell(script, value);
}

function clearClipboard() {
  try { powershell("Set-Clipboard -Value ''"); } catch { /* credential is already DPAPI protected */ }
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function sameListeners(before, after) {
  const normal = (items) => [...items].sort((a, b) => a.Port - b.Port).map((x) => x.Port + ":" + x.ProcessId).join("|");
  return normal(before) === normal(after);
}

function selfTest(manifest) {
  const required = [
    "controlstack_service_host.mjs",
    "controlstack_lane_manager.mjs",
    "controlstack-services.v2.json",
    "CONTROLSTACK MANAGER.bat",
  ];
  for (const file of required) if (!existsSync(path.join(sourceRoot, file))) throw new Error("Missing deployment source: " + file);
  if (manifest.services.filter((x) => x.credential === "control-plane-api-key").length !== 3) throw new Error("Exactly three tunnel services are required.");
  console.log("ControlStack Deployment v2 source self-test: PASS");
}

function install(manifest) {
  if (process.platform !== "win32") throw new Error("Installation runs only on Patrick's Windows host.");
  if (os.hostname().toLowerCase() !== manifest.host.toLowerCase()) throw new Error("Wrong Windows host.");
  if (os.userInfo().username.toLowerCase() !== manifest.user.toLowerCase()) throw new Error("Wrong Windows user.");

  selfTest(manifest);
  for (const worktree of manifest.worktrees) {
    if (!existsSync(worktree.root) || git(worktree.root, ["branch", "--show-current"]) !== worktree.branch) {
      throw new Error("Worktree identity mismatch: " + worktree.root);
    }
  }
  for (const service of manifest.services) {
    if (!existsSync(service.executable) || !existsSync(service.cwd)) throw new Error("Missing executable or working directory for " + service.name);
    if (taskExists(service.taskName)) throw new Error("Deployment task already exists: " + service.taskName);
  }
  const before = listeners(manifest.services.map((x) => x.port));
  if (before.length !== manifest.services.length) throw new Error("All eight current services must be live before additive installation.");

  let key = clipboardKey();
  const protectedKey = encryptForCurrentUser(key);
  key = null;
  clearClipboard();

  const receiptRoot = manifest.receiptRoot;
  const installRoot = manifest.installRoot;
  const managerRoot = path.dirname(installRoot);
  const runStamp = stamp();
  const backupRoot = path.join(receiptRoot, "CONTROLSTACK_DEPLOYMENT_V2_BACKUP_" + runStamp);
  mkdirSync(receiptRoot, { recursive: true });
  mkdirSync(backupRoot, { recursive: false });
  cpSync(managerRoot, path.join(backupRoot, "ControlStack_Service_Manager"), { recursive: true, force: false, errorOnExist: true });

  mkdirSync(path.join(installRoot, "secrets"), { recursive: true });
  mkdirSync(path.join(installRoot, "logs"), { recursive: true });
  mkdirSync(path.join(installRoot, "state"), { recursive: true });
  const files = ["controlstack_service_host.mjs", "controlstack_lane_manager.mjs", "controlstack-services.v2.json"];
  for (const file of files) copyFileSync(path.join(sourceRoot, file), path.join(installRoot, file));
  writeFileSync(manifest.credentialFile, protectedKey + "\n", "utf8");

  const installedHost = path.join(installRoot, "controlstack_service_host.mjs");
  const created = [];
  try {
    for (const service of manifest.services) {
      createTask(service, installedHost);
      created.push(service.taskName);
    }
    for (const name of created) if (!taskExists(name)) throw new Error("Scheduled Task verification failed: " + name);
    const after = listeners(manifest.services.map((x) => x.port));
    if (!sameListeners(before, after)) throw new Error("A running lane process changed during installation.");
    copyFileSync(path.join(sourceRoot, "CONTROLSTACK MANAGER.bat"), path.join(managerRoot, "CONTROLSTACK MANAGER.bat"));

    const receipt = {
      schema: "controlstack-deployment-v2-install/1",
      status: "installed-reboot-pending",
      installedAt: new Date().toISOString(),
      host: manifest.host,
      user: manifest.user,
      backupRoot,
      installRoot,
      managerEntry: path.join(managerRoot, "CONTROLSTACK MANAGER.bat"),
      managerEntrySha256: sha256(path.join(managerRoot, "CONTROLSTACK MANAGER.bat")),
      credential: { storage: "Windows DPAPI CurrentUser", path: manifest.credentialFile, plaintextPersisted: false },
      services: manifest.services.map((x) => ({ id: x.id, name: x.name, taskName: x.taskName, port: x.port })),
      files: files.map((file) => ({ path: path.join(installRoot, file), sha256: sha256(path.join(installRoot, file)) })),
      priorListenersPreserved: true,
      tasksStartedDuringInstall: false,
      legacyManagerBackedUp: true,
      legacyProcessesStopped: false,
      unknownOrLogoProcessesTouched: false,
    };
    const receiptPath = path.join(receiptRoot, "CONTROLSTACK_DEPLOYMENT_V2_INSTALL_" + runStamp + ".json");
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");
    console.log("CONTROLSTACK DEPLOYMENT V2 INSTALLED");
    console.log("Receipt: " + receiptPath);
    console.log("Existing lanes were not stopped or restarted.");
    console.log("Restart Windows once to transfer ownership to the managed tasks.");
  } catch (error) {
    for (const name of created.reverse()) deleteTask(name);
    const originalManager = path.join(backupRoot, "ControlStack_Service_Manager", "CONTROLSTACK MANAGER.bat");
    if (existsSync(originalManager)) copyFileSync(originalManager, path.join(managerRoot, "CONTROLSTACK MANAGER.bat"));
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = loadAndValidateManifest();
  const action = process.argv[2] || "--self-test";
  if (action === "--self-test") selfTest(manifest);
  else if (action === "--install") install(manifest);
  else throw new Error("Use --self-test or --install.");
}
