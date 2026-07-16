$ErrorActionPreference = "Stop"
Set-StrictMode -Version Latest

$MainRoot = "C:\ControlStack_Runtime"
$ToolingRoot = "C:\ControlStack_Worktrees\controlstack-tooling-v2"
$SelectorRoot = "C:\ControlStack_Worktrees\selector-engine"
$LabRoot = "C:\ControlStack_Worktrees\code-pilot-lab"
$ProgramRoot = "C:\ControlStack_Worktrees\program-integrate"
$SelectorCommit = "08df070890300058353cc621c1383f16492063f1"
$GateRunner = Join-Path $ToolingRoot "scripts\controlstack_lane_gate.py"
$QuarantineRoot = "C:\ControlStack_Quarantine"
$ReceiptRoot = "C:\ControlStack_Receipts"

$SelectorLeakFiles = @(
    "packages/workspace-kernel/selectorReferenceOptionsService.js",
    "tests/selectorCascadeCorrectness.test.js"
)

$ToolingFiles = @(
    "docs/tooling/CONTROLSTACK_THREE_LANE_ENVIRONMENT.md",
    "scripts/controlstack_lane_gate.py",
    "tests/controlstack_mcp_lane_policy_test.py",
    "tools/controlstack-mcp/controlstack_mcp.py",
    "tools/controlstack-mcp/start_lab_ies_lane.cmd",
    "tools/controlstack-mcp/start_program_integrate_lane.cmd",
    "tools/controlstack-mcp/start_selector_engine_lane.cmd",
    "tools/controlstack-mcp/start_selector_runtime_lane.cmd",
    "tools/controlstack-mcp/FINALISE_CONTROLSTACK_LANES.ps1"
)

function Write-Section {
    param([string]$Title)
    Write-Host ""
    Write-Host "========== $Title ==========" -ForegroundColor Cyan
}

function Invoke-Native {
    param([string]$Command, [string[]]$Arguments, [string]$WorkingDirectory = "")
    $oldPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
        if ($WorkingDirectory) {
            Push-Location -LiteralPath $WorkingDirectory
            try { $output = & $Command @Arguments 2>&1 }
            finally { Pop-Location }
        }
        else {
            $output = & $Command @Arguments 2>&1
        }
        $exitCode = $LASTEXITCODE
    }
    finally {
        $ErrorActionPreference = $oldPreference
    }
    $lines = @($output | ForEach-Object { $_.ToString() })
    if ($exitCode -ne 0) {
        $detail = $lines -join [Environment]::NewLine
        throw "$Command failed with exit code $exitCode. $detail"
    }
    return $lines
}

function Git {
    param([string[]]$Arguments)
    return @(Invoke-Native -Command "git.exe" -Arguments $Arguments)
}

function Git-Value {
    param([string[]]$Arguments)
    $lines = @(Git -Arguments $Arguments)
    if ($lines.Count -eq 0) { return "" }
    return $lines[-1].Trim()
}

function Assert-Lane {
    param([string]$Root, [string]$Branch, [string]$Head = "")
    if (-not (Test-Path -LiteralPath $Root -PathType Container)) {
        throw "Lane root is missing: $Root"
    }
    $actualBranch = Git-Value @("-C", $Root, "branch", "--show-current")
    if ($actualBranch -ne $Branch) {
        throw "Expected branch '$Branch' at '$Root'; found '$actualBranch'."
    }
    if ($Head) {
        $actualHead = Git-Value @("-C", $Root, "rev-parse", "HEAD")
        if ($actualHead -ne $Head) {
            throw "Expected HEAD '$Head' at '$Root'; found '$actualHead'."
        }
    }
}

function Assert-PathSet {
    param([string[]]$Actual, [string[]]$Expected, [string]$Label)
    $difference = @(Compare-Object @($Expected | Sort-Object) @($Actual | Sort-Object))
    if ($difference.Count -ne 0) {
        throw "$Label path set mismatch. Expected: $($Expected -join ', ') Actual: $($Actual -join ', ')"
    }
}

function Get-LabStatusWithoutLeaks {
    $lines = @(Git @("-C", $LabRoot, "status", "--porcelain=v1", "--untracked-files=all"))
    return @($lines | Where-Object {
        if ($_.Length -lt 4) { return $true }
        $path = $_.Substring(3)
        if ($path.Contains(" -> ")) { $path = $path.Substring($path.IndexOf(" -> ") + 4) }
        return $SelectorLeakFiles -notcontains $path
    })
}

function Run-LaneGate {
    param([string]$Gate, [string]$Root, [string]$Branch)
    Write-Host "Running $Gate against $Root"
    $jsonLines = @(Invoke-Native -Command "python" -Arguments @(
        $GateRunner, $Gate,
        "--root", $Root,
        "--required-branch", $Branch,
        "--json",
        "--max-chars", "20000"
    ))
    $payload = (($jsonLines -join [Environment]::NewLine) | ConvertFrom-Json)
    if (-not $payload.ok -or $payload.exit_code -ne 0) {
        throw "Gate '$Gate' failed. $($payload.stderr) $($payload.stdout)"
    }
    Write-Host ("{0}: PASS ({1}s)" -f $Gate, $payload.duration_s) -ForegroundColor Green
    return $payload
}

function Stop-OwnedListener {
    param([int]$Port, [string]$ExpectedPattern)
    $listeners = @(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue)
    foreach ($listener in $listeners) {
        $process = Get-CimInstance Win32_Process -Filter "ProcessId = $($listener.OwningProcess)"
        if ($null -eq $process -or $process.CommandLine -notmatch $ExpectedPattern) {
            throw "Port $Port is occupied by a process that is not owned by this setup."
        }
        Stop-Process -Id $listener.OwningProcess -Force
    }
}

function Start-Launcher {
    param([string]$RelativePath)
    $path = Join-Path $ToolingRoot $RelativePath
    if (-not (Test-Path -LiteralPath $path -PathType Leaf)) {
        throw "Launcher is missing: $path"
    }
    $quotedPath = '"' + $path + '"'
    Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", $quotedPath)
}

function Wait-Listening {
    param([int]$Port)
    for ($attempt = 1; $attempt -le 30; $attempt++) {
        if (@(Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue).Count -gt 0) {
            return
        }
        Start-Sleep -Milliseconds 500
    }
    throw "Port $Port did not become ready."
}

Write-Section "VERIFY ROOTS AND DURABLE SELECTOR BASE"
Assert-Lane -Root $MainRoot -Branch "main"
Assert-Lane -Root $ToolingRoot -Branch "lane/controlstack-tooling-v2"
Assert-Lane -Root $SelectorRoot -Branch "lane/selector-engine" -Head $SelectorCommit
Assert-Lane -Root $LabRoot -Branch "lane/code-pilot-lab"
Assert-Lane -Root $ProgramRoot -Branch "lane/program-integrate" -Head $SelectorCommit

$mainSelectorCommit = Git-Value @("-C", $MainRoot, "rev-parse", $SelectorCommit)
if ($mainSelectorCommit -ne $SelectorCommit) {
    throw "Selector durability commit is not available from Runtime/main."
}
$selectorCommitPaths = @(Git @("-C", $MainRoot, "show", "--name-only", "--format=", $SelectorCommit) |
    Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
Assert-PathSet -Actual $selectorCommitPaths -Expected $SelectorLeakFiles -Label "Selector durability commit"

$oldPreference = $ErrorActionPreference
$ErrorActionPreference = "Continue"
try {
    & git.exe -C $MainRoot merge-base --is-ancestor $SelectorCommit origin/main
    $isPushed = $LASTEXITCODE
}
finally {
    $ErrorActionPreference = $oldPreference
}
if ($isPushed -ne 0) {
    throw "Selector durability commit is not present on origin/main."
}
Write-Host "Selector durability commit: VERIFIED $SelectorCommit"

Write-Section "QUARANTINE AND DE-LEAK LAB"
New-Item -ItemType Directory -Path $QuarantineRoot -Force | Out-Null
$labBefore = @(Get-LabStatusWithoutLeaks)
$leakStatus = @(Git (@("-C", $LabRoot, "status", "--porcelain=v1", "--") + $SelectorLeakFiles))
$quarantinePath = ""
if ($leakStatus.Count -gt 0) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    $quarantinePath = Join-Path $QuarantineRoot "LAB_SELECTOR_LEAK_$stamp.patch"
    $patchLines = @(Git (@("-C", $LabRoot, "diff", "--binary", "--") + $SelectorLeakFiles))
    [System.IO.File]::WriteAllText($quarantinePath, (($patchLines -join [Environment]::NewLine) + [Environment]::NewLine))
    Git (@("-C", $LabRoot, "restore", "--worktree", "--") + $SelectorLeakFiles) | Out-Null
}
$remainingLeakStatus = @(Git (@("-C", $LabRoot, "status", "--porcelain=v1", "--") + $SelectorLeakFiles))
if ($remainingLeakStatus.Count -ne 0) {
    throw "Selector files remain dirty in the Lab lane."
}
$labAfter = @(Get-LabStatusWithoutLeaks)
if (($labBefore -join [Environment]::NewLine) -cne ($labAfter -join [Environment]::NewLine)) {
    throw "Non-Selector Lab status changed during de-leak."
}
Write-Host "Lab Selector leak: REMOVED; all IES-visible status preserved" -ForegroundColor Green
if ($quarantinePath) { Write-Host "Quarantine patch: $quarantinePath" }

Write-Section "EXECUTE BOUNDED ACCEPTANCE GATES"
$toolingGate = Run-LaneGate -Gate "tooling-policy" -Root $ToolingRoot -Branch "lane/controlstack-tooling-v2"
$selectorGate = Run-LaneGate -Gate "selector-engine" -Root $SelectorRoot -Branch "lane/selector-engine"
$labGate = Run-LaneGate -Gate "lab-ies" -Root $LabRoot -Branch "lane/code-pilot-lab"
$programGate = Run-LaneGate -Gate "program-integrate" -Root $ProgramRoot -Branch "lane/program-integrate"

Write-Section "COMMIT AND PUSH HARDENED TOOLING"
$toolingStatus = @(Git @("-C", $ToolingRoot, "status", "--porcelain=v1", "--untracked-files=all"))
if ($toolingStatus.Count -gt 0) {
    $changed = @($toolingStatus | ForEach-Object {
        $path = $_.Substring(3)
        if ($path.Contains(" -> ")) { $path = $path.Substring($path.IndexOf(" -> ") + 4) }
        $path
    })
    Assert-PathSet -Actual $changed -Expected $ToolingFiles -Label "Tooling commit"
    Git (@("-C", $ToolingRoot, "add", "--") + $ToolingFiles) | Out-Null
    $staged = @(Git @("-C", $ToolingRoot, "diff", "--cached", "--name-only"))
    Assert-PathSet -Actual $staged -Expected $ToolingFiles -Label "Tooling staged"
    Git @("-C", $ToolingRoot, "commit", "-m", "Harden isolated ControlStack lane tooling") |
        ForEach-Object { Write-Host $_ }
}
$toolingCommit = Git-Value @("-C", $ToolingRoot, "rev-parse", "HEAD")
Git @("-C", $ToolingRoot, "push", "-u", "origin", "lane/controlstack-tooling-v2") |
    ForEach-Object { Write-Host $_ }
if (@(Git @("-C", $ToolingRoot, "status", "--porcelain=v1")).Count -ne 0) {
    throw "Tooling worktree is not clean after commit."
}
Write-Host "Tooling commit/push: VERIFIED $toolingCommit" -ForegroundColor Green

Write-Section "REPLACE OLD APP PROCESSES AND START LANES"
Stop-OwnedListener -Port 8000 -ExpectedPattern "controlstack_mcp\.py"
Stop-OwnedListener -Port 8021 -ExpectedPattern "controlstack_mcp\.py"
Stop-OwnedListener -Port 8022 -ExpectedPattern "controlstack_mcp\.py"
Stop-OwnedListener -Port 8788 -ExpectedPattern "server\.js"

Start-Launcher "tools\controlstack-mcp\start_selector_engine_lane.cmd"
Start-Launcher "tools\controlstack-mcp\start_lab_ies_lane.cmd"
Start-Launcher "tools\controlstack-mcp\start_program_integrate_lane.cmd"
Start-Launcher "tools\controlstack-mcp\start_selector_runtime_lane.cmd"

foreach ($port in @(8000, 8021, 8022, 8788)) {
    Wait-Listening -Port $port
    Write-Host "Port ${port}: READY" -ForegroundColor Green
}

Write-Section "WRITE CONSOLIDATED RECEIPT"
New-Item -ItemType Directory -Path $ReceiptRoot -Force | Out-Null
$receiptPath = Join-Path $ReceiptRoot ("THREE_LANE_ENVIRONMENT_" + (Get-Date -Format "yyyyMMdd-HHmmss") + ".json")
$receipt = [ordered]@{
    timestamp = (Get-Date).ToString("o")
    selector_durability_commit = $SelectorCommit
    tooling_commit = $toolingCommit
    quarantine_patch = $quarantinePath
    gates = [ordered]@{
        tooling_policy = $toolingGate
        selector_engine = $selectorGate
        lab_ies = $labGate
        program_integrate = $programGate
    }
    lanes = @(
        [ordered]@{ name = "Selector & Engine"; root = $SelectorRoot; branch = "lane/selector-engine"; mcp_port = 8000; runtime_port = 8788 },
        [ordered]@{ name = "Lab / IES Authority"; root = $LabRoot; branch = "lane/code-pilot-lab"; mcp_port = 8021; spec_port = 8899 },
        [ordered]@{ name = "Program & Integrate"; root = $ProgramRoot; branch = "lane/program-integrate"; mcp_port = 8022 }
    )
}
[System.IO.File]::WriteAllText($receiptPath, ($receipt | ConvertTo-Json -Depth 12))

Write-Host ""
Write-Host "THREE-LANE ENVIRONMENT ONLINE" -ForegroundColor Green
Write-Host "Receipt: $receiptPath"
Write-Host "Selector & Engine  : http://127.0.0.1:8000/mcp | runtime :8788"
Write-Host "Lab / IES          : http://127.0.0.1:8021/mcp | spec :8899"
Write-Host "Program & Integrate: http://127.0.0.1:8022/mcp"
Write-Host ""
Write-Host "Keep the four lane windows open. Return to the setup chat and say: THREE LANES ONLINE" -ForegroundColor Yellow
