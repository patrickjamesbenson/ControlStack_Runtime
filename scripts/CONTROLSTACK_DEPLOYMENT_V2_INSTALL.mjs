import { execFileSync, spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  closeSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import http from "node:http";
import os from "node:os";
import { createInterface } from "node:readline/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  LOGODEV_VALIDATOR,
  LOGODEV_VARIABLE,
  protectForCurrentUser,
  protectedSecretIsValid,
  readLogoDevBat,
  unprotectForCurrentUser,
} from "./deployment-v2/controlstack_secret_store.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const sourceRoot = path.join(here, "deployment-v2");
const sourceManifest = path.join(sourceRoot, "controlstack-services.v2.json");
const startupFileName = "ControlStack-Lane-Services.vbs";
const sourceFiles = [
  "controlstack_service_host.mjs",
  "controlstack_lane_manager.mjs",
  "controlstack-services.v2.json",
  "controlstack_secret_store.mjs",
  "controlstack_manager_ui.html",
];

let progressIndex = 0;
let currentProgressMessage = "not started";
function progress(message) {
  progressIndex += 1;
  currentProgressMessage = message;
  console.log("[" + String(progressIndex).padStart(2, "0") + "] " + message);
}

function sha256(file) {
  return createHash("sha256").update(readFileSync(file)).digest("hex");
}

function encodedPowerShell(script) {
  return Buffer.from(script, "utf16le").toString("base64");
}

function powershell(script, input = undefined) {
  const result = spawnSync("powershell.exe", [
    "-NoProfile", "-NonInteractive", "-InputFormat", "Text", "-OutputFormat", "Text",
    "-EncodedCommand", encodedPowerShell(script),
  ], {
    input,
    encoding: "utf8",
    windowsHide: true,
    maxBuffer: 8 * 1024 * 1024,
    timeout: 30000,
  });
  if (result.error?.code === "ETIMEDOUT") throw new Error("A bounded Windows operation timed out after 30 seconds.");
  if (result.status !== 0) throw new Error("A bounded Windows operation failed.");
  return result.stdout.trim();
}

function normaliseWindows(value) {
  return path.win32.normalize(String(value || "")).toLowerCase();
}

function normaliseCommandLine(value) {
  return String(value || "").replaceAll("/", "\\").toLowerCase();
}

function insideWindows(root, candidate) {
  const relative = path.win32.relative(path.win32.resolve(root), path.win32.resolve(candidate));
  return relative === "" || (!relative.startsWith("..") && !path.win32.isAbsolute(relative));
}

function safeReadText(file, maxBytes = 512 * 1024) {
  if (!existsSync(file) || !statSync(file).isFile() || statSync(file).size > maxBytes) return "";
  return readFileSync(file, "utf8");
}

export function loadAndValidateManifest(file = sourceManifest) {
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  if (manifest.schema !== "controlstack-deployment-v2/1") throw new Error("Unexpected deployment schema.");
  if (!Array.isArray(manifest.worktrees) || manifest.worktrees.length !== 4) throw new Error("Exactly four worktree identities are required.");
  if (!Array.isArray(manifest.services) || manifest.services.length !== 8) throw new Error("Exactly eight services are required.");
  if (!manifest.controlUi || manifest.controlUi.host !== "127.0.0.1" || !Number.isInteger(manifest.controlUi.port)) {
    throw new Error("A loopback Deployment v2 control UI is required.");
  }
  if (manifest.controlUi.port === 8787 || manifest.controlUi.port === 8788) throw new Error("The control UI must not compete with a runtime shell port.");
  if (!Array.isArray(manifest.protectedEnvironment) || manifest.protectedEnvironment.length !== 1) {
    throw new Error("Exactly one protected environment definition is required.");
  }

  const logo = manifest.protectedEnvironment[0];
  if (
    logo.id !== "logodev-publishable-key" ||
    logo.variable !== LOGODEV_VARIABLE ||
    logo.validator !== LOGODEV_VALIDATOR ||
    !path.win32.isAbsolute(logo.sourceFile) ||
    !path.win32.isAbsolute(logo.protectedFile) ||
    !Array.isArray(logo.serviceIds) ||
    logo.serviceIds.length !== 1 ||
    logo.serviceIds[0] !== "selector-runtime"
  ) {
    throw new Error("The Logo.dev protected environment definition is invalid.");
  }

  const ids = new Set();
  const ports = new Set([manifest.controlUi.port]);
  for (const service of manifest.services) {
    if (!/^[a-z0-9-]+$/.test(service.id) || ids.has(service.id)) throw new Error("Duplicate or invalid service id.");
    if (!Number.isInteger(service.port) || ports.has(service.port) || service.port === 8787) throw new Error("Duplicate or invalid service port.");
    if (!["none", "control-plane-api-key"].includes(service.credential)) throw new Error("Invalid credential mode.");
    if (!Array.isArray(service.protectedSecretIds)) throw new Error("Invalid protected secret binding.");
    if (Object.hasOwn(service.env || {}, LOGODEV_VARIABLE)) throw new Error("Logo.dev plaintext must not be stored in the manifest.");
    if (service.id === "selector-runtime") {
      if (service.port !== 8788 || service.cwd !== "C:\\ControlStack_Worktrees\\selector-engine" || service.args.join(" ") !== "server.js") {
        throw new Error("The canonical Selector runtime identity is invalid.");
      }
      if (service.protectedSecretIds.length !== 1 || service.protectedSecretIds[0] !== logo.id) {
        throw new Error("Selector runtime must receive the protected Logo.dev value.");
      }
    } else if (service.protectedSecretIds.length !== 0) {
      throw new Error("Logo.dev may be injected only into selector-runtime.");
    }
    ids.add(service.id);
    ports.add(service.port);
  }
  if (!ids.has("selector-runtime")) throw new Error("The selector-runtime service is missing.");
  if (JSON.stringify(manifest).includes("8787")) throw new Error("Port 8787 must not be required by Deployment v2.");
  return manifest;
}

function git(root, args) {
  return execFileSync("git.exe", ["-C", root, ...args], {
    encoding: "utf8",
    windowsHide: true,
    timeout: 30000,
  }).trim();
}

function worktreeState(manifest) {
  return manifest.worktrees.map((worktree) => ({
    root: worktree.root,
    branch: git(worktree.root, ["branch", "--show-current"]),
    head: git(worktree.root, ["rev-parse", "HEAD"]),
    status: git(worktree.root, ["status", "--porcelain=v1"]),
  }));
}

function assertWorktrees(manifest) {
  for (const worktree of manifest.worktrees) {
    if (!existsSync(worktree.root) || git(worktree.root, ["branch", "--show-current"]) !== worktree.branch) {
      throw new Error("Worktree identity mismatch: " + worktree.root);
    }
  }
}

function assertFeatureWorktreesUnchanged(before, after) {
  for (const requiredRoot of [
    "C:\\ControlStack_Worktrees\\selector-engine",
    "C:\\ControlStack_Worktrees\\code-pilot-lab",
  ]) {
    const left = before.find((item) => normaliseWindows(item.root) === normaliseWindows(requiredRoot));
    const right = after.find((item) => normaliseWindows(item.root) === normaliseWindows(requiredRoot));
    if (!left || !right || left.branch !== right.branch || left.head !== right.head || left.status !== right.status) {
      throw new Error("A protected feature worktree changed during deployment.");
    }
  }
}

function listeners(ports) {
  const script = [
    "$ports=@(" + ports.join(",") + ")",
    "$items=foreach($port in $ports){Get-NetTCPConnection -State Listen -LocalPort $port -ErrorAction SilentlyContinue|Select-Object -First 1|ForEach-Object{[pscustomobject]@{Port=[int]$port;ProcessId=[int]$_.OwningProcess}}}",
    "ConvertTo-Json -InputObject @($items) -Compress",
  ].join(";");
  const value = powershell(script);
  return value ? JSON.parse(value) : [];
}

function listenerMap(items) {
  return new Map(items.map((item) => [Number(item.Port), Number(item.ProcessId)]));
}

function processOnPort(port) {
  const script = [
    "$ProgressPreference='SilentlyContinue'",
    "$c=Get-NetTCPConnection -State Listen -LocalPort " + port + " -ErrorAction SilentlyContinue|Select-Object -First 1",
    "if($null -eq $c){'{}';exit 0}",
    "$p=Get-CimInstance Win32_Process -Filter ('ProcessId='+$c.OwningProcess)",
    "[pscustomobject]@{ProcessId=[int]$c.OwningProcess;ExecutablePath=[string]$p.ExecutablePath;CommandLine=[string]$p.CommandLine}|ConvertTo-Json -Compress",
  ].join(";");
  const value = powershell(script);
  return JSON.parse(value || "{}");
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

function encryptTunnelCredential(value) {
  const script = [
    "$v=[Console]::In.ReadToEnd().Trim()",
    "$s=ConvertTo-SecureString -String $v -AsPlainText -Force",
    "[Console]::Write((ConvertFrom-SecureString -SecureString $s))",
  ].join(";");
  return powershell(script, value);
}

function protectedTunnelCredentialIsValid(value) {
  const script = [
    "$ErrorActionPreference='Stop'",
    "$c=[Console]::In.ReadToEnd().Trim()",
    "$s=ConvertTo-SecureString $c",
    "$b=[Runtime.InteropServices.Marshal]::SecureStringToBSTR($s)",
    "try{$v=[Runtime.InteropServices.Marshal]::PtrToStringBSTR($b);if($v.StartsWith('sk-') -and $v.Length -ge 23){'valid'}else{'invalid'}}finally{[Runtime.InteropServices.Marshal]::ZeroFreeBSTR($b)}",
  ].join(";");
  try { return powershell(script, value) === "valid"; } catch { return false; }
}

function existingProtectedTunnelCredential(file) {
  if (!existsSync(file)) return "";
  const value = readFileSync(file, "utf8").trim();
  return value && protectedTunnelCredentialIsValid(value) ? value : "";
}

function clearClipboard() {
  try { powershell("Set-Clipboard -Value ''"); } catch { /* the credential is already protected */ }
}

function stamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function startupEntryPath() {
  if (!process.env.APPDATA) throw new Error("Windows APPDATA is unavailable.");
  return path.join(process.env.APPDATA, "Microsoft", "Windows", "Start Menu", "Programs", "Startup", startupFileName);
}

function commonStartupPath() {
  const programData = process.env.ProgramData || "C:\\ProgramData";
  return path.join(programData, "Microsoft", "Windows", "Start Menu", "Programs", "StartUp");
}

function selfTest(manifest) {
  const required = [...sourceFiles, "CONTROLSTACK MANAGER.bat", startupFileName];
  for (const file of required) if (!existsSync(path.join(sourceRoot, file))) throw new Error("Missing deployment source: " + file);
  if (manifest.services.filter((item) => item.credential === "control-plane-api-key").length !== 3) {
    throw new Error("Exactly three tunnel services are required.");
  }
  const startup = readFileSync(path.join(sourceRoot, startupFileName), "utf8");
  if (!/controlstack_lane_manager\.mjs"" serve/i.test(startup)) throw new Error("The startup entry must launch the persistent Deployment v2 manager.");
  console.log("ControlStack Deployment v2 source self-test: PASS");
}

function ensureHostIdentity(manifest) {
  if (process.platform !== "win32") throw new Error("Installation runs only on Patrick's Windows host.");
  if (os.hostname().toLowerCase() !== manifest.host.toLowerCase()) throw new Error("Wrong Windows host.");
  if (os.userInfo().username.toLowerCase() !== manifest.user.toLowerCase()) throw new Error("Wrong Windows user.");
}

function storeLogoDevSecret(manifest) {
  const spec = manifest.protectedEnvironment[0];
  const plaintext = readLogoDevBat(spec.sourceFile);
  let changed = true;
  if (existsSync(spec.protectedFile)) {
    const existing = readFileSync(spec.protectedFile, "utf8").trim();
    if (protectedSecretIsValid(existing, spec.validator)) {
      changed = unprotectForCurrentUser(existing, spec.validator) !== plaintext;
    }
  }
  if (changed) {
    mkdirSync(path.dirname(spec.protectedFile), { recursive: true });
    const protectedValue = protectForCurrentUser(plaintext, spec.validator);
    const temporary = spec.protectedFile + ".tmp";
    writeFileSync(temporary, protectedValue + "\n", "utf8");
    if (!protectedSecretIsValid(readFileSync(temporary, "utf8").trim(), spec.validator)) {
      rmSync(temporary, { force: true });
      throw new Error("The protected Logo.dev value did not validate.");
    }
    renameSync(temporary, spec.protectedFile);
  }
  return { plaintext, changed, spec };
}

function backupFile(file, backupRoot, category, records) {
  if (!existsSync(file) || !statSync(file).isFile()) return;
  const destination = path.join(backupRoot, category, path.basename(file));
  mkdirSync(path.dirname(destination), { recursive: true });
  copyFileSync(file, destination);
  records.push({ original: file, backup: destination, sha256: sha256(destination) });
}

function assertStartupEntryReplaceable(startupEntry, managerRoot, canonicalManager) {
  if (!existsSync(startupEntry)) return "new-canonical-entry";
  const sourceStartup = path.join(sourceRoot, startupFileName);
  if (sha256(startupEntry) === sha256(sourceStartup)) return "existing-canonical-entry";

  const content = safeReadText(startupEntry, 128 * 1024);
  const targets = extractManagerTargets(content);
  if (targets.some((target) => normaliseWindows(target) === normaliseWindows(canonicalManager)) && /\b(?:start|serve)\b/i.test(content)) {
    return "previous-deployment-v2-entry";
  }

  const proof = proveLegacyStartup(startupEntry, managerRoot, canonicalManager);
  if (proof.proven) return "proven-competing-controlstack-manager";
  throw new Error("A different startup entry exists and its ControlStack manager ownership could not be proven.");
}

function assertManagerEntryReplaceable(managerEntry, canonicalManager) {
  if (!existsSync(managerEntry)) return "new-canonical-manager-entry";
  const sourceEntry = path.join(sourceRoot, "CONTROLSTACK MANAGER.bat");
  if (sha256(managerEntry) === sha256(sourceEntry)) return "existing-canonical-manager-entry";
  const content = safeReadText(managerEntry, 128 * 1024);
  const targets = extractManagerTargets(content);
  if (targets.some((target) => normaliseWindows(target) === normaliseWindows(canonicalManager))) {
    return "previous-deployment-v2-manager-entry";
  }
  if (/controlstack/i.test(content) && processControlSource(content)) return "proven-legacy-controlstack-manager-entry";
  throw new Error("The existing manager entry could not be proven as ControlStack-owned.");
}

function installSources(manifest, runRoot, backupRecords) {
  const installRoot = manifest.installRoot;
  const managerRoot = path.dirname(installRoot);
  const startupEntry = startupEntryPath();
  const installedManager = path.join(installRoot, "controlstack_lane_manager.mjs");
  const managerEntry = path.join(managerRoot, "CONTROLSTACK MANAGER.bat");
  const startupReplacement = assertStartupEntryReplaceable(startupEntry, managerRoot, installedManager);
  const managerEntryReplacement = assertManagerEntryReplaceable(managerEntry, installedManager);

  mkdirSync(installRoot, { recursive: true });
  mkdirSync(path.join(installRoot, "secrets"), { recursive: true });
  mkdirSync(path.join(installRoot, "logs"), { recursive: true });
  mkdirSync(path.join(installRoot, "state"), { recursive: true });

  for (const file of sourceFiles) {
    backupFile(path.join(installRoot, file), runRoot, "previous-deployment-v2", backupRecords);
    copyFileSync(path.join(sourceRoot, file), path.join(installRoot, file));
  }

  backupFile(managerEntry, runRoot, "previous-manager-entry", backupRecords);
  copyFileSync(path.join(sourceRoot, "CONTROLSTACK MANAGER.bat"), managerEntry);

  backupFile(startupEntry, runRoot, "previous-startup-entry", backupRecords);
  mkdirSync(path.dirname(startupEntry), { recursive: true });
  copyFileSync(path.join(sourceRoot, startupFileName), startupEntry);
  if (sha256(startupEntry) !== sha256(path.join(sourceRoot, startupFileName))) throw new Error("Startup entry verification failed.");

  return { managerRoot, managerEntry, startupEntry, installedManager, startupReplacement, managerEntryReplacement };
}

export function extractManagerTargets(content) {
  if (typeof content !== "string") return [];
  const matches = content.match(/C:\\ControlStack_Service_Manager\\[^"'\r\n]+?\.(?:mjs|cjs|js|vbs|bat|cmd|ps1)/gi) || [];
  return [...new Set(matches.map((item) => path.win32.normalize(item)))];
}

export function processControlSource(content) {
  if (typeof content !== "string" || !/controlstack/i.test(content)) return false;
  return /taskkill|child_process|spawn\s*\(|start-process|get-nettcpconnection|\bstart\b[\s\S]{0,400}\bstop\b[\s\S]{0,400}\brestart\b|8787/i.test(content);
}

function referencedPanelFiles(content, sourceFile, managerRoot) {
  const results = [];
  const regex = /["']([^"'\r\n]+\.(?:html?|mjs|cjs|js))["']/gi;
  for (const match of content.matchAll(regex)) {
    const value = match[1];
    const candidate = path.win32.isAbsolute(value) ? path.win32.normalize(value) : path.resolve(path.dirname(sourceFile), value);
    if (!insideWindows(managerRoot, candidate) || !existsSync(candidate) || /logo|asset|image|icon|favicon/i.test(candidate)) continue;
    const candidateText = safeReadText(candidate);
    if (/controlstack/i.test(candidateText) && /status|verify|start|stop|restart/i.test(candidateText)) results.push(candidate);
  }
  return [...new Set(results)];
}

function proveLegacyStartup(startupFile, managerRoot, canonicalManager) {
  const startupContent = safeReadText(startupFile, 128 * 1024);
  const canonicalManagerEntry = path.join(managerRoot, "CONTROLSTACK MANAGER.bat");
  const initialTargets = extractManagerTargets(startupContent)
    .filter((target) => insideWindows(managerRoot, target))
    .filter((target) => normaliseWindows(target) !== normaliseWindows(canonicalManager))
    .filter((target) => normaliseWindows(target) !== normaliseWindows(canonicalManagerEntry))
    .filter((target) => !insideWindows(path.join(managerRoot, "deployment-v2"), target));
  if (!initialTargets.length || !/controlstack_service_manager/i.test(startupContent)) return { proven: false, targets: [], panels: [] };

  const queue = initialTargets.map((target) => ({ target, depth: 0 }));
  const visited = new Set();
  const targets = [];
  const panels = [];
  let authorityProven = false;

  while (queue.length) {
    const { target, depth } = queue.shift();
    const key = normaliseWindows(target);
    if (visited.has(key) || depth > 2 || !existsSync(target) || !insideWindows(managerRoot, target)) continue;
    visited.add(key);
    const content = safeReadText(target);
    if (!content) continue;
    targets.push(target);
    if (processControlSource(content)) authorityProven = true;
    panels.push(...referencedPanelFiles(content, target, managerRoot));
    for (const nested of extractManagerTargets(content)) {
      if (
        normaliseWindows(nested) !== normaliseWindows(canonicalManager) &&
        normaliseWindows(nested) !== normaliseWindows(canonicalManagerEntry) &&
        !insideWindows(path.join(managerRoot, "deployment-v2"), nested)
      ) queue.push({ target: nested, depth: depth + 1 });
    }
  }

  return {
    proven: authorityProven,
    targets: authorityProven ? [...new Set(targets)] : [],
    panels: authorityProven ? [...new Set(panels)] : [],
  };
}

function managerFileInventory(managerRoot) {
  const records = [];
  if (!existsSync(managerRoot)) return records;
  const queue = [managerRoot];
  const excludedDirectories = new Set(["deployment-v2", "secrets", "logs", "state", "node_modules", ".git"]);
  const extensions = new Set([".mjs", ".cjs", ".js", ".vbs", ".bat", ".cmd", ".ps1", ".html", ".htm"]);

  while (queue.length && records.length < 500) {
    const directory = queue.shift();
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (!excludedDirectories.has(entry.name.toLowerCase())) queue.push(file);
        continue;
      }
      if (!entry.isFile() || !extensions.has(path.extname(entry.name).toLowerCase())) continue;
      if (/logo|asset|image|icon|favicon/i.test(file)) {
        records.push({ path: file, classification: "retained-protected-asset", contentRead: false });
        continue;
      }
      const content = safeReadText(file);
      if (!/controlstack/i.test(content)) continue;
      const classification = processControlSource(content)
        ? "candidate-process-control"
        : /status|verify|start|stop|restart/i.test(content)
          ? "candidate-panel"
          : "retained-controlstack-file";
      records.push({ path: file, sha256: sha256(file), classification });
      if (records.length >= 500) break;
    }
  }
  return records;
}

function startupInventory(managerRoot, canonicalStartup, canonicalManager) {
  const records = [];
  const canonicalSource = path.join(sourceRoot, startupFileName);
  for (const root of [path.dirname(canonicalStartup), commonStartupPath()]) {
    if (!existsSync(root)) continue;
    for (const entry of readdirSync(root, { withFileTypes: true })) {
      if (!entry.isFile() || !/\.(?:vbs|bat|cmd|ps1)$/i.test(entry.name)) continue;
      const file = path.join(root, entry.name);
      const digest = sha256(file);
      if (normaliseWindows(file) === normaliseWindows(canonicalStartup)) {
        const content = safeReadText(file, 128 * 1024);
        const targetsCanonicalManager = extractManagerTargets(content)
          .some((target) => normaliseWindows(target) === normaliseWindows(canonicalManager));
        if (digest === sha256(canonicalSource) || (targetsCanonicalManager && /\b(?:start|serve)\b/i.test(content))) {
          records.push({ path: file, sha256: digest, classification: "canonical-deployment-v2" });
          continue;
        }
      }
      const proof = proveLegacyStartup(file, managerRoot, canonicalManager);
      records.push({
        path: file,
        sha256: digest,
        classification: proof.proven ? "proven-competing-controlstack-manager" : "retained-unproven-or-unrelated",
        targets: proof.targets,
        panels: proof.panels,
      });
    }
  }
  return records;
}

function archiveMove(file, allowedRoot, archiveRoot, category, reason, records) {
  if (!existsSync(file) || !insideWindows(allowedRoot, file)) throw new Error("Refusing to archive a file outside its proven root.");
  const relative = path.win32.relative(path.win32.resolve(allowedRoot), path.win32.resolve(file));
  const destination = path.join(archiveRoot, category, relative);
  mkdirSync(path.dirname(destination), { recursive: true });
  if (existsSync(destination)) throw new Error("Archive destination already exists.");
  const digest = sha256(file);
  renameSync(file, destination);
  records.push({ original: file, archived: destination, sha256: digest, reason });
}

function matchingLegacyProcesses(targets) {
  if (!targets.length) return [];
  const lowered = targets.map((target) => normaliseWindows(target));
  const script = [
    "$items=Get-CimInstance Win32_Process|ForEach-Object{[pscustomobject]@{ProcessId=[int]$_.ProcessId;ExecutablePath=[string]$_.ExecutablePath;CommandLine=[string]$_.CommandLine}}",
    "ConvertTo-Json -InputObject @($items) -Compress",
  ].join(";");
  const processes = JSON.parse(powershell(script) || "[]");
  return processes.filter((process) => {
    const commandLine = normaliseCommandLine(process.CommandLine);
    const executable = path.win32.basename(String(process.ExecutablePath || "")).toLowerCase();
    return ["node.exe", "wscript.exe", "cscript.exe", "powershell.exe", "cmd.exe"].includes(executable) && lowered.some((target) => commandLine.includes(target));
  });
}

function stopProvenLegacyProcesses(targets) {
  const stopped = [];
  for (const process of matchingLegacyProcesses(targets)) {
    const result = spawnSync("taskkill.exe", ["/PID", String(process.ProcessId), "/F"], { encoding: "utf8", windowsHide: true });
    if (result.status !== 0) throw new Error("A proven legacy ControlStack manager could not be stopped.");
    stopped.push({ processId: Number(process.ProcessId), identity: "proven startup-target command line" });
  }
  return stopped;
}

function consolidateLegacy(managerRoot, canonicalStartup, canonicalManager, archiveRoot, inventory, managerFiles) {
  const proven = inventory.filter((item) => item.classification === "proven-competing-controlstack-manager");
  const targetFiles = [...new Set(proven.flatMap((item) => [...item.targets, ...item.panels]))];
  const stoppedProcesses = stopProvenLegacyProcesses(targetFiles);
  const archived = [];

  for (const item of proven) {
    if (normaliseWindows(item.path) === normaliseWindows(canonicalStartup)) continue;
    archiveMove(item.path, path.dirname(item.path), archiveRoot, "startup", "proven competing ControlStack manager startup entry", archived);
  }
  for (const file of targetFiles) {
    if (!existsSync(file)) continue;
    archiveMove(file, managerRoot, archiveRoot, "manager", "proven obsolete ControlStack manager or directly referenced panel", archived);
  }
  return { inventory, managerFiles, stoppedProcesses, archived };
}

function httpRequest(url, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, { timeout: timeoutMs }, (response) => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ statusCode: response.statusCode, headers: response.headers, body }));
    });
    request.once("timeout", () => { request.destroy(); reject(new Error("A local health request timed out.")); });
    request.once("error", () => reject(new Error("A local health request failed.")));
  });
}

async function waitForHttp(url, timeoutMs = 45000) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const response = await httpRequest(url, 2500);
      if (response.statusCode === 200) return response;
    } catch { /* keep waiting */ }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  throw new Error("The Deployment v2 control interface did not become ready.");
}

function waitForManagerReady(child, url, logPath) {
  return new Promise((resolve, reject) => {
    let settled = false;
    const finish = (callback, value) => {
      if (settled) return;
      settled = true;
      child.off("error", onError);
      child.off("exit", onExit);
      callback(value);
    };
    const onError = () => finish(reject, new Error("The Deployment v2 control manager could not start. Manager log: " + logPath));
    const onExit = (code) => finish(reject, new Error("The Deployment v2 control manager exited before readiness (code " + String(code) + "). Manager log: " + logPath));
    child.once("error", onError);
    child.once("exit", onExit);
    waitForHttp(url).then(
      (response) => finish(resolve, response),
      () => finish(reject, new Error("The Deployment v2 control interface did not become ready. Manager log: " + logPath)),
    );
  });
}

function managerListenerMatches(identity, installedManager) {
  if (!identity.ProcessId) return false;
  const commandLine = normaliseCommandLine(identity.CommandLine);
  return (
    path.win32.basename(String(identity.ExecutablePath || "")).toLowerCase() === "node.exe" &&
    commandLine.includes(normaliseWindows(installedManager)) &&
    /\bserve\b/i.test(String(identity.CommandLine || ""))
  );
}

async function ensureControlUi(manifest, installedManager) {
  const identity = processOnPort(manifest.controlUi.port);
  if (identity.ProcessId && !managerListenerMatches(identity, installedManager)) {
    throw new Error("Refusing to replace an unidentified listener on the Deployment v2 control UI port.");
  }

  const replacedExistingManager = Boolean(identity.ProcessId);
  if (identity.ProcessId) {
    const stopped = spawnSync("taskkill.exe", ["/PID", String(identity.ProcessId), "/F"], { encoding: "utf8", windowsHide: true });
    if (stopped.status !== 0) throw new Error("The validated Deployment v2 UI manager could not be reloaded.");
    const deadline = Date.now() + 15000;
    while (Date.now() < deadline && processOnPort(manifest.controlUi.port).ProcessId) {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
    if (processOnPort(manifest.controlUi.port).ProcessId) throw new Error("The validated Deployment v2 UI manager did not release its loopback port.");
  }

  const managerLogPath = path.join(manifest.installRoot, "logs", "controlstack-manager-ui.log");
  const managerLogHandle = openSync(managerLogPath, "a");
  let child;
  try {
    child = spawn(process.execPath, [installedManager, "serve"], {
      cwd: manifest.installRoot,
      detached: true,
      windowsHide: true,
      stdio: ["ignore", managerLogHandle, managerLogHandle],
    });
  } finally {
    closeSync(managerLogHandle);
  }

  const url = "http://" + manifest.controlUi.host + ":" + manifest.controlUi.port + "/api/status";
  const response = await waitForManagerReady(child, url, managerLogPath);
  child.unref();
  const activeIdentity = processOnPort(manifest.controlUi.port);
  if (!managerListenerMatches(activeIdentity, installedManager)) {
    throw new Error("The Deployment v2 control UI listener identity did not validate after activation.");
  }
  const payload = JSON.parse(response.body);
  if (!payload.ok || !Array.isArray(payload.services) || payload.services.length !== 8) throw new Error("The Deployment v2 control API returned an invalid service topology.");
  return { payload, replacedExistingManager };
}

function runManager(installedManager, action, serviceId = undefined) {
  const args = [installedManager, action];
  if (serviceId) args.push(serviceId);
  const result = spawnSync(process.execPath, args, { encoding: "utf8", windowsHide: true, maxBuffer: 4 * 1024 * 1024 });
  if (result.status !== 0) throw new Error("Deployment v2 manager action failed: " + action + ".");
  return result.stdout;
}

function assertOnlySelectorRestarted(manifest, before, after) {
  const beforeMap = listenerMap(before);
  const afterMap = listenerMap(after);
  for (const service of manifest.services) {
    const left = beforeMap.get(service.port);
    const right = afterMap.get(service.port);
    if (!left || !right) throw new Error("A managed service listener is missing after Selector activation.");
    if (service.id === "selector-runtime") {
      if (left === right) throw new Error("Selector runtime was not restarted for Logo.dev activation.");
    } else if (left !== right) {
      throw new Error("A non-Selector managed service restarted unexpectedly.");
    }
  }
}

function recursivelyReportsLogoConfigured(value, keyHint = "") {
  if (Array.isArray(value)) return value.some((item) => recursivelyReportsLogoConfigured(item, keyHint));
  if (!value || typeof value !== "object") {
    return /logo/i.test(keyHint) && (value === true || /configured|available|enabled|ready/i.test(String(value)));
  }
  return Object.entries(value).some(([key, child]) => {
    const nextHint = keyHint + "." + key;
    if (/logo/i.test(nextHint) && child && typeof child === "object" && child.configured === true) return true;
    return recursivelyReportsLogoConfigured(child, nextHint);
  });
}

async function runtimeReportsLogoConfigured() {
  try {
    const response = await httpRequest("http://127.0.0.1:8788/api/runtime-config/status");
    if (response.statusCode !== 200) return false;
    return recursivelyReportsLogoConfigured(JSON.parse(response.body));
  } catch {
    return false;
  }
}

function assertDeploymentLogsDoNotContain(installRoot, plaintext) {
  const logRoot = path.join(installRoot, "logs");
  if (!existsSync(logRoot)) return;
  for (const entry of readdirSync(logRoot, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = path.join(logRoot, entry.name);
    if (statSync(file).size > 16 * 1024 * 1024) throw new Error("A Deployment v2 log is too large for bounded secret validation.");
    const content = readFileSync(file, "utf8");
    if (content.includes(plaintext)) throw new Error("A Deployment v2 log exposed the Logo.dev value.");
  }
}

async function validateLive(manifest, installedManager, logoPlaintext) {
  runManager(installedManager, "verify");
  const statusResponse = await httpRequest("http://" + manifest.controlUi.host + ":" + manifest.controlUi.port + "/api/status");
  const statusPayload = JSON.parse(statusResponse.body);
  if (statusResponse.statusCode !== 200 || !statusPayload.ok || statusPayload.services.length !== 8) throw new Error("Deployment v2 status validation failed.");
  if (!statusPayload.services.every((service) => service.healthy && service.managed)) throw new Error("Not all eight Deployment v2 services are healthy and managed.");

  const runtimeConfig = await httpRequest("http://127.0.0.1:8788/api/runtime-config/status");
  if (runtimeConfig.statusCode !== 200 || runtimeConfig.body.includes(logoPlaintext)) throw new Error("Runtime configuration validation failed or exposed the Logo.dev value.");
  let runtimePayload;
  try { runtimePayload = JSON.parse(runtimeConfig.body); } catch { throw new Error("Runtime configuration status is not valid JSON."); }
  if (!recursivelyReportsLogoConfigured(runtimePayload)) throw new Error("Runtime configuration does not report Logo.dev as configured.");

  const workspace = await httpRequest("http://127.0.0.1:8788/workspace");
  if (workspace.statusCode !== 200 || !workspace.body || workspace.body.includes(logoPlaintext)) throw new Error("The canonical workspace shell did not load safely.");

  assertDeploymentLogsDoNotContain(manifest.installRoot, logoPlaintext);

  const sourceBackedUrl = new URL("https://img.logo.dev/controlstack.local");
  sourceBackedUrl.searchParams.set("token", logoPlaintext);
  if (!sourceBackedUrl.href.startsWith("https://img.logo.dev/") || !sourceBackedUrl.searchParams.get("token")) {
    throw new Error("A source-backed Logo.dev URL could not be produced.");
  }

  return {
    services: statusPayload.services.map((service) => ({ id: service.id, name: service.name, port: service.port, healthy: service.healthy, managed: service.managed })),
    runtimeConfigStatus: runtimeConfig.statusCode,
    workspaceStatus: workspace.statusCode,
    logoDevConfigured: true,
    sourceBackedLogoUrlProduced: true,
  };
}

function writeReceipts(manifest, runStamp, runRoot, result) {
  const receipt = {
    schema: "controlstack-program-shell-v2-consolidation/1",
    status: "installed-consolidated-verified",
    completedAt: new Date().toISOString(),
    host: manifest.host,
    user: manifest.user,
    installRoot: manifest.installRoot,
    controlUi: "http://" + manifest.controlUi.host + ":" + manifest.controlUi.port + manifest.controlUi.path,
    controlUiManagerReloaded: result.controlUiActivation.replacedExistingManager,
    canonicalRuntimeShell: "http://127.0.0.1:8788/workspace",
    port8787ManagedOrRequired: false,
    logoDev: {
      sourceFile: result.logo.spec.sourceFile,
      protectedFile: result.logo.spec.protectedFile,
      storage: "Windows DPAPI CurrentUser",
      changed: result.logo.changed,
      configured: result.live.logoDevConfigured,
      plaintextPersisted: false,
      plaintextReturned: false,
      sourceBackedUrlProduced: result.live.sourceBackedLogoUrlProduced,
      serviceIds: result.logo.spec.serviceIds,
    },
    services: result.live.services,
    selectorRuntimeRestarted: result.selectorRestarted,
    nonSelectorServicePidsPreserved: true,
    featureWorktreesUnchanged: true,
    legacy: {
      canonicalStartupReplacement: result.startupReplacement,
      canonicalManagerEntryReplacement: result.managerEntryReplacement,
      inventory: result.legacy.inventory,
      managerFiles: result.legacy.managerFiles,
      stoppedProcesses: result.legacy.stoppedProcesses,
      archived: result.legacy.archived,
      unknownLogoAssetOrUnrelatedItemsTouched: false,
    },
    backups: result.backups,
    health: {
      managerVerify: "PASS",
      runtimeConfigStatus: result.live.runtimeConfigStatus,
      workspaceStatus: result.live.workspaceStatus,
      allEightManagedServicesHealthy: true,
    },
  };
  const receiptPath = path.join(manifest.receiptRoot, "CONTROLSTACK_PROGRAM_SHELL_V2_CONSOLIDATION_" + runStamp + ".json");
  const receiptText = JSON.stringify(receipt, null, 2) + "\n";
  if (receiptText.includes(result.logo.plaintext)) throw new Error("The consolidation receipt would expose the Logo.dev value.");
  writeFileSync(receiptPath, receiptText, "utf8");

  const restoration = {
    schema: "controlstack-program-shell-v2-restoration/1",
    generatedAt: new Date().toISOString(),
    sourceReceipt: receiptPath,
    archiveRoot: runRoot,
    restorePolicy: "manual reviewed restoration only; no automatic execution",
    archivedMoves: result.legacy.archived.map((item) => ({ from: item.archived, to: item.original, sha256: item.sha256 })),
    previousFileBackups: result.backups,
  };
  const restorationPath = path.join(manifest.receiptRoot, "CONTROLSTACK_PROGRAM_SHELL_V2_RESTORATION_" + runStamp + ".json");
  const restorationText = JSON.stringify(restoration, null, 2) + "\n";
  if (restorationText.includes(result.logo.plaintext)) throw new Error("The restoration receipt would expose the Logo.dev value.");
  writeFileSync(restorationPath, restorationText, "utf8");
  return { receiptPath, restorationPath };
}

async function consolidate(manifest) {
  progressIndex = 0;
  progress("Validating Windows host and user");
  ensureHostIdentity(manifest);
  progress("Running Deployment v2 source self-test");
  selfTest(manifest);
  progress("Verifying all four ControlStack worktree identities");
  assertWorktrees(manifest);
  progress("Checking the eight configured service executables and working directories");
  for (const service of manifest.services) {
    if (!existsSync(service.executable) || !existsSync(service.cwd)) throw new Error("Missing executable or working directory for " + service.name);
  }
  progress("Validating the existing protected tunnel credential");
  if (!existingProtectedTunnelCredential(manifest.credentialFile)) throw new Error("The existing Deployment v2 tunnel credential is missing or invalid.");

  progress("Preflighting canonical startup and manager ownership");
  const preflightManagerRoot = path.dirname(manifest.installRoot);
  const preflightInstalledManager = path.join(manifest.installRoot, "controlstack_lane_manager.mjs");
  const canonicalStartup = startupEntryPath();
  assertStartupEntryReplaceable(canonicalStartup, preflightManagerRoot, preflightInstalledManager);
  assertManagerEntryReplaceable(path.join(preflightManagerRoot, "CONTROLSTACK MANAGER.bat"), preflightInstalledManager);
  const preInstallLegacyInventory = startupInventory(preflightManagerRoot, canonicalStartup, preflightInstalledManager);
  const preInstallManagerFileInventory = managerFileInventory(preflightManagerRoot);

  progress("Capturing pre-deployment worktree state");
  const beforeWorktrees = worktreeState(manifest);
  const servicePorts = manifest.services.map((service) => service.port);
  progress("Checking that all eight managed service ports are listening");
  const beforeListeners = listeners(servicePorts);
  if (beforeListeners.length !== manifest.services.length) {
    const listeningPorts = beforeListeners.map((item) => Number(item.Port)).sort((a, b) => a - b);
    const missingPorts = servicePorts.filter((port) => !listeningPorts.includes(port));
    throw new Error("All eight managed services must be live before consolidation. Missing listener ports: " + missingPorts.join(", "));
  }

  progress("Creating the timestamped archive and receipt workspace");
  mkdirSync(manifest.receiptRoot, { recursive: true });
  const runStamp = stamp();
  const runRoot = path.join(manifest.receiptRoot, "CONTROLSTACK_PROGRAM_SHELL_V2_ARCHIVE_" + runStamp);
  mkdirSync(runRoot, { recursive: false });
  const backups = [];
  backupFile(manifest.protectedEnvironment[0].protectedFile, runRoot, "previous-protected-secrets", backups);

  progress("Importing and protecting the allowlisted Logo.dev value");
  const logo = storeLogoDevSecret(manifest);
  progress("Installing Deployment v2 manager, host, UI and startup files");
  const installed = installSources(manifest, runRoot, backups);
  progress("Activating the loopback control UI on port " + manifest.controlUi.port);
  const controlUiActivation = await ensureControlUi(manifest, installed.installedManager);

  let selectorRestarted = false;
  let afterActivation = beforeListeners;
  progress("Checking whether Selector requires Logo.dev activation");
  const selectorActivationRequired = logo.changed || !(await runtimeReportsLogoConfigured());
  if (selectorActivationRequired) {
    progress("Restarting selector-runtime only");
    runManager(installed.installedManager, "restart", "selector-runtime");
    selectorRestarted = true;
    afterActivation = listeners(servicePorts);
    assertOnlySelectorRestarted(manifest, beforeListeners, afterActivation);
  } else {
    progress("Selector already reports Logo.dev configured; restart not required");
  }

  progress("Running live service, workspace and secret-redaction validation");
  const live = await validateLive(manifest, installed.installedManager, logo.plaintext);
  progress("Archiving only proven legacy ControlStack control surfaces");
  const legacy = consolidateLegacy(
    installed.managerRoot,
    installed.startupEntry,
    installed.installedManager,
    runRoot,
    preInstallLegacyInventory,
    preInstallManagerFileInventory,
  );
  progress("Confirming protected feature worktrees are unchanged");
  const afterWorktrees = worktreeState(manifest);
  assertFeatureWorktreesUnchanged(beforeWorktrees, afterWorktrees);

  progress("Writing consolidation and restoration receipts");
  const receipts = writeReceipts(manifest, runStamp, runRoot, {
    logo,
    live,
    legacy,
    backups,
    selectorRestarted,
    beforeListeners,
    afterActivation,
    startupReplacement: installed.startupReplacement,
    managerEntryReplacement: installed.managerEntryReplacement,
    controlUiActivation,
  });
  logo.plaintext = null;

  console.log("CONTROLSTACK PROGRAM SHELL V2 CONSOLIDATION: PASS");
  console.log("Control UI: http://" + manifest.controlUi.host + ":" + manifest.controlUi.port + manifest.controlUi.path);
  console.log("Workspace shell: http://127.0.0.1:8788/workspace");
  console.log("Receipt: " + receipts.receiptPath);
  console.log("Restoration receipt: " + receipts.restorationPath);
  console.log("Logo.dev: configured for selector-runtime only; value not displayed.");
  console.log("Port 8787: unmanaged and not required.");
}

async function install(manifest) {
  ensureHostIdentity(manifest);
  selfTest(manifest);
  let protectedKey = existingProtectedTunnelCredential(manifest.credentialFile);
  if (!protectedKey) {
    let key = await waitForKeyCopy();
    protectedKey = encryptTunnelCredential(key);
    key = null;
    clearClipboard();
    mkdirSync(path.dirname(manifest.credentialFile), { recursive: true });
    writeFileSync(manifest.credentialFile, protectedKey + "\n", "utf8");
  }
  await consolidate(manifest);
}

function stopValidatedTemporaryTunnel(service) {
  const identity = processOnPort(service.port);
  if (!identity.ProcessId) return;
  const expectedExecutable = normaliseWindows(service.executable);
  const actualExecutable = normaliseWindows(identity.ExecutablePath);
  const profileIndex = service.args.indexOf("--profile");
  const expectedProfile = profileIndex >= 0 ? service.args[profileIndex + 1] : "";
  const commandLine = String(identity.CommandLine || "").toLowerCase();
  if (actualExecutable !== expectedExecutable || !expectedProfile || !commandLine.includes(expectedProfile.toLowerCase())) {
    throw new Error("Refusing to replace an unexpected listener on tunnel port " + service.port);
  }
  const stopped = spawnSync("taskkill.exe", ["/PID", String(identity.ProcessId), "/T", "/F"], { encoding: "utf8", windowsHide: true });
  if (stopped.status !== 0) throw new Error("Could not stop the validated temporary tunnel on port " + service.port);
}

async function repairTunnels(manifest) {
  ensureHostIdentity(manifest);
  selfTest(manifest);
  if (!existingProtectedTunnelCredential(manifest.credentialFile)) throw new Error("The protected deployment key is missing or invalid.");
  const logo = storeLogoDevSecret(manifest);
  for (const file of sourceFiles) copyFileSync(path.join(sourceRoot, file), path.join(manifest.installRoot, file));
  const tunnelServices = manifest.services.filter((service) => service.credential === "control-plane-api-key");
  for (const service of tunnelServices) stopValidatedTemporaryTunnel(service);
  const installedManager = path.join(manifest.installRoot, "controlstack_lane_manager.mjs");
  runManager(installedManager, "start");
  runManager(installedManager, "verify");

  mkdirSync(manifest.receiptRoot, { recursive: true });
  const receiptPath = path.join(manifest.receiptRoot, "CONTROLSTACK_DEPLOYMENT_V2_TUNNEL_REPAIR_" + stamp() + ".json");
  const receipt = {
    schema: "controlstack-deployment-v2-tunnel-repair/2",
    status: "repaired-and-verified",
    repairedAt: new Date().toISOString(),
    host: manifest.host,
    user: manifest.user,
    credentialReused: true,
    logoDevProtectedStoreReady: true,
    plaintextPersisted: false,
    services: tunnelServices.map((service) => ({ id: service.id, port: service.port })),
    otherManagedServicesRestarted: false,
  };
  const receiptText = JSON.stringify(receipt, null, 2) + "\n";
  if (receiptText.includes(logo.plaintext)) throw new Error("The tunnel repair receipt would expose the Logo.dev value.");
  writeFileSync(receiptPath, receiptText, "utf8");
  logo.plaintext = null;

  console.log("CONTROLSTACK TUNNEL RECOVERY: PASS");
  console.log("Receipt: " + receiptPath);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const manifest = loadAndValidateManifest();
    const action = process.argv[2] || "--self-test";
    if (action === "--self-test") selfTest(manifest);
    else if (action === "--install") await install(manifest);
    else if (action === "--consolidate") await consolidate(manifest);
    else if (action === "--repair-tunnels") await repairTunnels(manifest);
    else throw new Error("Use --self-test, --install, --consolidate or --repair-tunnels.");
  } catch (error) {
    console.error("");
    console.error("CONTROLSTACK PROGRAM SHELL V2: FAILED");
    console.error("Stage: " + currentProgressMessage);
    console.error("Reason: " + (error?.message || "unknown error"));
    process.exitCode = 1;
  }
}
