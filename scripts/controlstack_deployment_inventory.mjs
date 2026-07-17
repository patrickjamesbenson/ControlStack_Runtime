import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

if (process.platform !== "win32") {
  throw new Error("This inventory must run on Patrick's Windows ControlStack host.");
}

const PORTS = [8000, 8021, 8022, 8080, 8081, 8082, 8788, 8899];
const WORKTREES = [
  "C:\\ControlStack_Worktrees\\selector-engine",
  "C:\\ControlStack_Worktrees\\code-pilot-lab",
  "C:\\ControlStack_Worktrees\\program-integrate",
  "C:\\ControlStack_Worktrees\\controlstack-tooling-v2",
];
const RECEIPT_ROOT = "C:\\ControlStack_Receipts";

function redact(value) {
  if (value == null) return value;
  return String(value)
    .replace(/sk-[A-Za-z0-9_\-]{12,}/g, "[REDACTED_KEY]")
    .replace(/((?:OPENAI|CONTROL_PLANE)?_?API_KEY|TOKEN|SECRET|PASSWORD)\s*[=:]\s*[^\s;]+/gi, "$1=[REDACTED]")
    .replace(/(--(?:api[-_]?key|token|secret|password)|-k)\s+[^\s]+/gi, "$1 [REDACTED]");
}

function safeError(error) {
  return {
    type: error?.name || "Error",
    code: error?.code || null,
    status: Number.isInteger(error?.status) ? error.status : null,
  };
}

function powershellJson(lines) {
  const script = [
    "$ErrorActionPreference = 'Stop'",
    ...lines,
  ].join("\n");
  const encoded = Buffer.from(script, "utf16le").toString("base64");
  const output = execFileSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-EncodedCommand", encoded],
    { encoding: "utf8", windowsHide: true, maxBuffer: 16 * 1024 * 1024 },
  ).trim();
  return output ? JSON.parse(output) : [];
}

function git(root, args) {
  try {
    return execFileSync("git.exe", ["-C", root, ...args], {
      encoding: "utf8",
      windowsHide: true,
      maxBuffer: 4 * 1024 * 1024,
    }).trim();
  } catch (error) {
    return { error: safeError(error) };
  }
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

const receipt = {
  schema: "controlstack-deployment-v2-inventory/1",
  generatedAt: new Date().toISOString(),
  host: os.hostname(),
  user: os.userInfo().username,
  mutationPolicy: "read-only; receipt creation only",
  targetPorts: PORTS,
  errors: [],
};

try {
  receipt.listeners = powershellJson([
    "$ports = @(" + PORTS.join(",") + ")",
    "$items = foreach ($port in $ports) {",
    "  Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue | ForEach-Object {",
    "    [pscustomobject]@{ LocalAddress = $_.LocalAddress; LocalPort = $_.LocalPort; ProcessId = $_.OwningProcess }",
    "  }",
    "}",
    "ConvertTo-Json -InputObject @($items) -Depth 5 -Compress",
  ]);
} catch (error) {
  receipt.errors.push({ section: "listeners", ...safeError(error) });
  receipt.listeners = [];
}

try {
  const listenerPids = [...new Set(receipt.listeners.map((x) => Number(x.ProcessId)).filter(Boolean))];
  receipt.processes = powershellJson([
    "$listenerPids = @(" + listenerPids.join(",") + ")",
    "$items = Get-CimInstance Win32_Process | Where-Object {",
    "  ($listenerPids -contains [int]$_.ProcessId) -or",
    "  ($_.CommandLine -match '(?i)controlstack|code.?pilot|tunnel-client|ngrok')",
    "} | ForEach-Object {",
    "  [pscustomobject]@{ ProcessId = $_.ProcessId; ParentProcessId = $_.ParentProcessId; Name = $_.Name; ExecutablePath = $_.ExecutablePath; CommandLine = $_.CommandLine }",
    "}",
    "ConvertTo-Json -InputObject @($items) -Depth 5 -Compress",
  ]).map((item) => ({ ...item, CommandLine: redact(item.CommandLine) }));
} catch (error) {
  receipt.errors.push({ section: "processes", ...safeError(error) });
  receipt.processes = [];
}

try {
  receipt.scheduledTasks = powershellJson([
    "$items = Get-ScheduledTask | Where-Object {",
    "  ($_.TaskName + ' ' + $_.TaskPath + ' ' + (($_.Actions | ForEach-Object { $_.Execute + ' ' + $_.Arguments }) -join ' ')) -match '(?i)controlstack|code.?pilot|tunnel-client|ngrok'",
    "} | ForEach-Object {",
    "  [pscustomobject]@{ TaskName = $_.TaskName; TaskPath = $_.TaskPath; State = [string]$_.State; Actions = @($_.Actions | ForEach-Object { [pscustomobject]@{ Execute = $_.Execute; Arguments = $_.Arguments; WorkingDirectory = $_.WorkingDirectory } }) }",
    "}",
    "ConvertTo-Json -InputObject @($items) -Depth 8 -Compress",
  ]).map((task) => ({
    ...task,
    Actions: (task.Actions || []).map((action) => ({ ...action, Arguments: redact(action.Arguments) })),
  }));
} catch (error) {
  receipt.errors.push({ section: "scheduledTasks", ...safeError(error) });
  receipt.scheduledTasks = [];
}

try {
  receipt.services = powershellJson([
    "$items = Get-CimInstance Win32_Service | Where-Object {",
    "  ($_.Name + ' ' + $_.DisplayName + ' ' + $_.PathName) -match '(?i)controlstack|code.?pilot|tunnel-client|ngrok'",
    "} | ForEach-Object {",
    "  [pscustomobject]@{ Name = $_.Name; DisplayName = $_.DisplayName; State = $_.State; StartMode = $_.StartMode; ProcessId = $_.ProcessId; PathName = $_.PathName }",
    "}",
    "ConvertTo-Json -InputObject @($items) -Depth 5 -Compress",
  ]).map((service) => ({ ...service, PathName: redact(service.PathName) }));
} catch (error) {
  receipt.errors.push({ section: "services", ...safeError(error) });
  receipt.services = [];
}

try {
  receipt.startupEntries = powershellJson([
    "$roots = @([Environment]::GetFolderPath('Startup'), [Environment]::GetFolderPath('CommonStartup'))",
    "$items = foreach ($root in $roots) {",
    "  if (Test-Path -LiteralPath $root) {",
    "    Get-ChildItem -LiteralPath $root -File -ErrorAction SilentlyContinue | ForEach-Object {",
    "      [pscustomobject]@{ Path = $_.FullName; Name = $_.Name; Size = $_.Length; ModifiedUtc = $_.LastWriteTimeUtc.ToString('o') }",
    "    }",
    "  }",
    "}",
    "ConvertTo-Json -InputObject @($items) -Depth 5 -Compress",
  ]);
} catch (error) {
  receipt.errors.push({ section: "startupEntries", ...safeError(error) });
  receipt.startupEntries = [];
}

try {
  receipt.configurationFiles = powershellJson([
    "$roots = @('C:\\ControlStack_Lanes','C:\\ControlStack_CodePilot_Lane_Kit',($env:LOCALAPPDATA + '\\ControlStack'),($env:APPDATA + '\\tunnel-client'),'C:\\ControlStack_Worktrees\\controlstack-tooling-v2\\tools')",
    "$items = foreach ($root in $roots) {",
    "  if (Test-Path -LiteralPath $root) {",
    "    Get-ChildItem -LiteralPath $root -File -Recurse -ErrorAction SilentlyContinue | Where-Object {",
    "      $_.Extension -in @('.json','.yaml','.yml','.ps1','.cmd','.bat','.xml') -and $_.FullName -notmatch '(?i)node_modules|\\.git'",
    "    } | Select-Object -First 500 | ForEach-Object {",
    "      [pscustomobject]@{ Path = $_.FullName; Size = $_.Length; ModifiedUtc = $_.LastWriteTimeUtc.ToString('o'); Sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash }",
    "    }",
    "  }",
    "}",
    "ConvertTo-Json -InputObject @($items) -Depth 5 -Compress",
  ]);
} catch (error) {
  receipt.errors.push({ section: "configurationFiles", ...safeError(error) });
  receipt.configurationFiles = [];
}

receipt.worktrees = WORKTREES.map((worktreeRoot) => ({
  root: worktreeRoot,
  branch: git(worktreeRoot, ["branch", "--show-current"]),
  head: git(worktreeRoot, ["rev-parse", "HEAD"]),
  status: git(worktreeRoot, ["status", "--porcelain=v1"]),
}));

receipt.credentialPresence = {
  OPENAI_API_KEY: Boolean(process.env.OPENAI_API_KEY),
  CONTROL_PLANE_API_KEY: Boolean(process.env.CONTROL_PLANE_API_KEY),
};

receipt.summary = {
  listenerCount: receipt.listeners.length,
  processCount: receipt.processes.length,
  scheduledTaskCount: receipt.scheduledTasks.length,
  serviceCount: receipt.services.length,
  startupEntryCount: receipt.startupEntries.length,
  configurationFileCount: receipt.configurationFiles.length,
  errorCount: receipt.errors.length,
};

const canonical = JSON.stringify(receipt, null, 2) + "\n";
receipt.receiptSha256 = sha256(canonical);
const finalJson = JSON.stringify(receipt, null, 2) + "\n";
mkdirSync(RECEIPT_ROOT, { recursive: true });
const stamp = new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
const receiptPath = path.join(RECEIPT_ROOT, "CONTROLSTACK_DEPLOYMENT_V2_INVENTORY_" + stamp + ".json");
writeFileSync(receiptPath, finalJson, { encoding: "utf8", flag: "wx" });

console.log("CONTROLSTACK DEPLOYMENT V2 INVENTORY COMPLETE");
console.log("Receipt: " + receiptPath);
console.log(JSON.stringify(receipt.summary));
console.log("No process, service, task, Git or credential state was changed.");
