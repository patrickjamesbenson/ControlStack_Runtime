import { execFileSync, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { copyFileSync, cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import { createInterface } from "node:readline/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(here, "deployment-v2");
const sourceManifest = path.join(sourceRoot, "controlstack-services.v2.json");
const startupFileName = "ControlStack-Lane-Services.vbs";

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
  for (const service of manifest.services) {
    if (!/^[a-z0-9-]+$/.test(service.id) || ids.has(service.id)) throw new Error("Duplicate or invalid service id.");
    if (!Number.isInteger(service.port) || ports.has(service.port)) throw new Error("Duplicate or invalid service port.");
    if (!["none", "control-plane-api-key"].includes(service.credential)) throw new Error("Invalid credential mode.");
    ids.add(service.id);
    ports.add(service.port);
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

function clipboardKey() {
  const value = powershell("[Console]::OutputEncoding=[Text.Encoding]::UTF8;[Console]::Write((Get-Clipboard -Raw))").trim();
  const match = value.match(/sk-[\x21-\x7e]{20,}/);
  if (!match) throw new Error("The clipboard does not contain a fresh OpenAI runtime API key.");
  return match[0];
}

async function waitForKeyCopy() {
  const prompt = createInterface({ input: process.stdin, output: process.stdout });
  try {
    await prompt.question("\nOpen the Runtime API key page, create a fresh key, click Copy, then return here and press Enter.\nThe key must not be pasted into PowerShell. ");
  } finally {
    prompt.close();
  }
  return clipboardKey();
}

function encryptForCurrentUser(value) {
  const script = [
    "$v=[Console]::In.ReadToEnd().Trim()",
    "$s=ConvertTo-SecureString -String $v -AsPlainText -Force",
    "[Console]::Write((ConvertFrom-SecureString -SecureString $s))",
  ].join(";");
  return powershell(script, value);
}

function protectedCredentialIsValid(value) {
  const script = [
    "$ErrorActionPreference='Stop'",
    "$c=[Console]::In.ReadToEnd().Trim()",
    "$s=ConvertTo-SecureString $c",
    "$b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)",
    "try{$v=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($b);if($v.StartsWith('sk-') -and $v.Length -ge 23){'valid'}else{'invalid'}}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}",
  ].join(";");
  try {
    return powershell(script, value) === "valid";
  } catch {
    return false;
  }
}

function existingProtectedCredential(file) {
  if (!existsSync(file)) return "";
  const value = readFileSync(file, "utf8").trim();
  return value && protectedCredentialIsValid(value) ? value : "";
}

function clearClipboard() {
  try { powershell("Set-Clipboard -Value ''"); } catch { /* credential is already protected */ }
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function sameListeners(before, after) {
  const normal = (items) => [...items].sort((a, b) => a.Port - b.Port).map((x) => x.Port + ":" + x.ProcessId).join("|");
  return normal(before) === normal(after);
}

function startupEntryPath() {
  if (!process.env.APPDATA) throw new Error("Windows APPDATA is unavailable.");
  return path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", startupFileName);
}

function selfTest(manifest) {
  const required = [
    "controlstack_service_host.mjs",
    "controlstack_lane_manager.mjs",
    "controlstack-services.v2.json",
    "CONTROLSTACK MANAGER.bat",
    startupFileName,
  ];
  for (const file of required) if (!existsSync(path.join(sourceRoot, file))) throw new Error("Missing deployment source: " + file);
  if (manifest.services.filter((x) => x.credential === "control-plane-api-key").length !== 3) throw new Error("Exactly three tunnel services are required.");
  console.log("ControlStack Deployment v2 source self-test: PASS");
}

async function install(manifest) {
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
  }

  const before = listeners(manifest.services.map((x) => x.port));
  if (before.length !== manifest.services.length) throw new Error("All eight current services must be live before additive installation.");

  let protectedKey = existingProtectedCredential(manifest.credentialFile);
  const reusedProtectedCredential = Boolean(protectedKey);
  if (protectedKey) {
    console.log("Reusing the already protected deployment key from the previous attempt.");
  } else {
    let key = await waitForKeyCopy();
    protectedKey = encryptForCurrentUser(key);
    key = null;
    clearClipboard();
  }

  const receiptRoot = manifest.receiptRoot;
  const installRoot = manifest.installRoot;
  const managerRoot = path.dirname(installRoot);
  const startupEntry = startupEntryPath();
  const startupExisted = existsSync(startupEntry);
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

  try {
    if (startupExisted && sha256(startupEntry) !== sha256(path.join(sourceRoot, startupFileName))) {
      throw new Error("A different ControlStack startup entry already exists; it was not overwritten.");
    }
    copyFileSync(path.join(sourceRoot, startupFileName), startupEntry);
    if (sha256(startupEntry) !== sha256(path.join(sourceRoot, startupFileName))) throw new Error("Startup entry verification failed.");

    const after = listeners(manifest.services.map((x) => x.port));
    if (!sameListeners(before, after)) throw new Error("A running lane process changed during installation.");

    copyFileSync(path.join(sourceRoot, "CONTROLSTACK MANAGER.bat"), path.join(managerRoot, "CONTROLSTACK MANAGER.bat"));

    const receipt = {
      schema: "controlstack-deployment-v2-install/2",
      status: "installed-reboot-pending",
      installedAt: new Date().toISOString(),
      host: manifest.host,
      user: manifest.user,
      backupRoot,
      installRoot,
      managerEntry: path.join(managerRoot, "CONTROLSTACK MANAGER.bat"),
      managerEntrySha256: sha256(path.join(managerRoot, "CONTROLSTACK MANAGER.bat")),
      startupEntry,
      startupEntrySha256: sha256(startupEntry),
      credential: { storage: "Windows DPAPI CurrentUser", path: manifest.credentialFile, plaintextPersisted: false, reusedProtectedCredential },
      services: manifest.services.map((x) => ({ id: x.id, name: x.name, port: x.port })),
      files: files.map((file) => ({ path: path.join(installRoot, file), sha256: sha256(path.join(installRoot, file)) })),
      priorListenersPreserved: true,
      processesStartedDuringInstall: false,
      legacyManagerBackedUp: true,
      legacyProcessesStopped: false,
      unknownOrLogoProcessesTouched: false,
      scheduledTasksRequired: false,
    };
    const receiptPath = path.join(receiptRoot, "CONTROLSTACK_DEPLOYMENT_V2_INSTALL_" + runStamp + ".json");
    writeFileSync(receiptPath, JSON.stringify(receipt, null, 2) + "\n", "utf8");

    console.log("CONTROLSTACK DEPLOYMENT V2 INSTALLED");
    console.log("Receipt: " + receiptPath);
    console.log("Existing lanes were not stopped or restarted.");
    console.log("Restart Windows once to transfer ownership to Service Manager v2.");
  } catch (error) {
    if (!startupExisted) rmSync(startupEntry, { force: true });
    const originalManager = path.join(backupRoot, "ControlStack_Service_Manager", "CONTROLSTACK MANAGER.bat");
    if (existsSync(originalManager)) copyFileSync(originalManager, path.join(managerRoot, "CONTROLSTACK MANAGER.bat"));
    throw error;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const manifest = loadAndValidateManifest();
  const action = process.argv[2] || "--self-test";
  if (action === "--self-test") selfTest(manifest);
  else if (action === "--install") await install(manifest);
  else throw new Error("Use --self-test or --install.");
}
